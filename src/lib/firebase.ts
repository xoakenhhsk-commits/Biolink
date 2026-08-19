import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BioProfile, BioLead } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom Database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('✅ Firebase Firestore connected successfully!');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// ================= FIRESTORE BIO SERVICES =================

/**
 * Save or update a BioProfile in Firestore
 */
export async function saveBioToFirestore(profile: BioProfile, userId?: string | null): Promise<void> {
  const docId = profile.slug || profile.id;
  const path = `bios/${docId}`;
  
  const payload: BioProfile & { ownerId?: string } = {
    ...profile,
    isPublished: profile.isPublished !== false,
    ownerId: userId || profile.ownerId || (auth.currentUser ? auth.currentUser.uid : 'anonymous'),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'bios', docId), payload, { merge: true });
    // Also save by profile.id if different so both lookup keys exist
    if (profile.id && profile.id !== docId) {
      await setDoc(doc(db, 'bios', profile.id), payload, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get a BioProfile by slug or document ID
 */
export async function getBioFromFirestore(slugOrId: string): Promise<BioProfile | null> {
  const clean = slugOrId.trim().toLowerCase();
  const path = `bios/${clean}`;
  try {
    // 1. First try direct document fetch by slug or ID
    const directDoc = await getDoc(doc(db, 'bios', clean));
    if (directDoc.exists()) {
      return directDoc.data() as BioProfile;
    }
    if (slugOrId !== clean) {
      const origDoc = await getDoc(doc(db, 'bios', slugOrId));
      if (origDoc.exists()) {
        return origDoc.data() as BioProfile;
      }
    }

    // 2. Query by slug field
    const q = query(collection(db, 'bios'), where('slug', '==', clean));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as BioProfile;
    }

    // 3. Query by id field
    const qId = query(collection(db, 'bios'), where('id', '==', slugOrId));
    const queryIdSnapshot = await getDocs(qId);
    if (!queryIdSnapshot.empty) {
      return queryIdSnapshot.docs[0].data() as BioProfile;
    }

    return null;
  } catch (error) {
    console.warn('Firestore getBio error:', error);
    return null;
  }
}

/**
 * Fetch all bios for current user or initial published bios
 */
export async function fetchUserBiosFromFirestore(userId?: string | null): Promise<BioProfile[]> {
  const path = 'bios';
  try {
    let q;
    if (userId) {
      q = query(collection(db, 'bios'), where('ownerId', '==', userId));
    } else {
      q = query(collection(db, 'bios'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as BioProfile);
  } catch (error) {
    console.warn('Firestore list bios error:', error);
    return [];
  }
}

/**
 * Realtime listener for a specific bio (for public page / live updates)
 */
export function subscribeToBio(
  slugOrId: string, 
  onData: (profile: BioProfile | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const clean = slugOrId.trim().toLowerCase();
  const path = `bios/${clean}`;

  let unsubDirect: Unsubscribe | null = null;

  // Subscribe to query by slug
  const q = query(collection(db, 'bios'), where('slug', '==', clean));

  const unsubQuery = onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        onData(snapshot.docs[0].data() as BioProfile);
      } else {
        // Fallback to direct doc
        if (!unsubDirect) {
          unsubDirect = onSnapshot(
            doc(db, 'bios', slugOrId),
            (docSnap) => {
              if (docSnap.exists()) {
                onData(docSnap.data() as BioProfile);
              } else {
                onData(null);
              }
            },
            (err) => {
              console.warn('Direct doc subscription fallback failed:', err);
              if (onError) onError(err);
              onData(null);
            }
          );
        }
      }
    },
    (error) => {
      console.warn('Query subscription error on bio:', error);
      // Try direct get before failing
      getDoc(doc(db, 'bios', slugOrId))
        .then((docSnap) => {
          if (docSnap.exists()) {
            onData(docSnap.data() as BioProfile);
          } else {
            if (onError) onError(error);
            onData(null);
          }
        })
        .catch((e) => {
          if (onError) onError(e);
          onData(null);
        });
    }
  );

  return () => {
    unsubQuery();
    if (unsubDirect) unsubDirect();
  };
}

/**
 * Delete a bio from Firestore
 */
export async function deleteBioFromFirestore(bioId: string): Promise<void> {
  const path = `bios/${bioId}`;
  try {
    await deleteDoc(doc(db, 'bios', bioId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Record a page view in Firestore
 */
export async function recordPageViewInFirestore(bioId: string): Promise<void> {
  const path = `bios/${bioId}`;
  try {
    const docRef = doc(db, 'bios', bioId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as BioProfile;
      const stats = data.stats || { views: 0, clicks: 0, leadsCount: 0, dailyViews: [], linkClicks: [] };
      stats.views = (stats.views || 0) + 1;
      
      const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const dayStat = stats.dailyViews.find((d) => d.date === today);
      if (dayStat) {
        dayStat.views += 1;
      } else {
        stats.dailyViews.push({ date: today, views: 1, clicks: 0 });
        if (stats.dailyViews.length > 14) stats.dailyViews.shift();
      }
      
      await setDoc(docRef, { stats, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (error) {
    console.warn('Silent view count error in firestore:', error);
  }
}

/**
 * Record link click in Firestore
 */
export async function recordLinkClickInFirestore(bioId: string, linkId: string, title?: string): Promise<void> {
  const path = `bios/${bioId}`;
  try {
    const docRef = doc(db, 'bios', bioId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as BioProfile;
      const stats = data.stats || { views: 0, clicks: 0, leadsCount: 0, dailyViews: [], linkClicks: [] };
      stats.clicks = (stats.clicks || 0) + 1;

      // Update blocks click count
      const updatedBlocks = (data.blocks || []).map((b) => {
        if (b.id === linkId && b.type === 'link') {
          return { ...b, clickCount: (b.clickCount || 0) + 1 };
        }
        return b;
      });

      const existingLinkStat = stats.linkClicks?.find((l) => l.linkId === linkId);
      if (existingLinkStat) {
        existingLinkStat.clicks += 1;
      } else {
        stats.linkClicks = stats.linkClicks || [];
        stats.linkClicks.push({ linkId, title: title || 'Liên kết', clicks: 1 });
      }

      await setDoc(docRef, { blocks: updatedBlocks, stats, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (error) {
    console.warn('Silent link click error in firestore:', error);
  }
}

/**
 * Add lead/contact inquiry to Firestore
 */
export async function addLeadToFirestore(
  bioId: string, 
  leadData: { 
    name: string; 
    email?: string; 
    phone?: string; 
    message: string;
    recipientAccount?: string;
    recipientRole?: string;
  }
): Promise<void> {
  const path = `bios/${bioId}`;
  try {
    const docRef = doc(db, 'bios', bioId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as BioProfile;
      const leads = data.leads || [];
      const newLead: BioLead = {
        id: `lead-${Date.now()}`,
        name: leadData.name,
        email: leadData.email || '',
        phone: leadData.phone || '',
        message: leadData.message,
        createdAt: new Date().toLocaleString('vi-VN'),
        status: 'new' as const,
        recipientAccount: leadData.recipientAccount || 'vadut74@gmail.com',
        recipientRole: leadData.recipientRole || 'Chủ sở hữu Bio',
      };
      leads.unshift(newLead);
      const stats = data.stats || { views: 0, clicks: 0, leadsCount: 0, dailyViews: [], linkClicks: [] };
      stats.leadsCount = (stats.leadsCount || 0) + 1;

      await setDoc(docRef, { leads, stats, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Export friendly aliases
export const saveBioProfile = saveBioToFirestore;
export const getBioProfile = getBioFromFirestore;
export const fetchBioProfiles = fetchUserBiosFromFirestore;
export const deleteBioProfile = deleteBioFromFirestore;

export async function recordStat(slugOrId: string, type: 'view' | 'click', linkId?: string, linkTitle?: string): Promise<void> {
  if (type === 'view') {
    return recordPageViewInFirestore(slugOrId);
  } else if (type === 'click' && linkId) {
    return recordLinkClickInFirestore(slugOrId, linkId, linkTitle);
  }
}


