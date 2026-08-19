import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BioProfile, BioBlock, BioLead } from './types';
import { INITIAL_PROFILES } from './data/mockBios';
import { PRESET_THEMES } from './data/themes';
import { Navbar } from './components/Navbar';
import { ProfileInfoEditor } from './components/ProfileInfoEditor';
import { SocialLinksEditor } from './components/SocialLinksEditor';
import { BlockEditor } from './components/BlockEditor';
import { ThemeEditor } from './components/ThemeEditor';
import { AnalyticsView } from './components/AnalyticsView';
import { PhonePreview } from './components/PhonePreview';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ShareModal } from './components/ShareModal';
import { AuthModal } from './components/AuthModal';
import { PublicBioPage } from './components/PublicBioPage';
import { CheckCircle2, AlertCircle, ExternalLink, Cloud, Sparkles } from 'lucide-react';
import { auth, saveBioProfile, fetchBioProfiles, deleteBioProfile as deleteBioFromFirestore } from './lib/firebase';

function getSlugFromLocation(): string | null {
  const path = window.location.pathname;
  if (path.startsWith('/b/')) {
    const s = path.replace('/b/', '').split('/')[0].split('?')[0].trim();
    if (s) return s;
  }
  if (path.startsWith('/bio/')) {
    const s = path.replace('/bio/', '').split('/')[0].split('?')[0].trim();
    if (s) return s;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const bioParam = searchParams.get('bio') || searchParams.get('b');
  if (bioParam) return bioParam.trim();

  const hash = window.location.hash;
  if (hash.startsWith('#/b/') || hash.startsWith('#b/')) {
    const s = hash.replace(/#\/?b\//, '').split('?')[0].trim();
    if (s) return s;
  }
  if (hash.startsWith('#/bio/') || hash.startsWith('#bio/')) {
    const s = hash.replace(/#\/?bio\//, '').split('?')[0].trim();
    if (s) return s;
  }
  return null;
}

export function App() {
  // Check if viewing standalone public page /b/:slug or ?bio=:slug
  const [publicSlug, setPublicSlug] = useState<string | null>(() => getSlugFromLocation());

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Editor State
  const [profiles, setProfiles] = useState<BioProfile[]>(INITIAL_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<BioProfile>(INITIAL_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<'blocks' | 'theme' | 'analytics'>('blocks');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type?: 'success' | 'error' }>({ 
    show: false, 
    msg: '',
    type: 'success'
  });

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Debounce ref for auto-saving
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load user profiles from Firestore
        try {
          const userBios = await fetchBioProfiles(user.uid);
          if (userBios && userBios.length > 0) {
            setProfiles(userBios);
            setCurrentProfile(userBios[0]);
          } else {
            // First time user: save current default profile with their ownerId
            const personalizedProfile: BioProfile = {
              ...currentProfile,
              ownerId: user.uid,
              displayName: user.displayName || currentProfile.displayName,
              avatarUrl: user.photoURL || currentProfile.avatarUrl,
              isPublished: true,
            };
            await saveBioProfile(personalizedProfile);
            setProfiles([personalizedProfile]);
            setCurrentProfile(personalizedProfile);
          }
        } catch (e) {
          console.warn('Firestore load on auth change failed:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setPublicSlug(getSlugFromLocation());
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Fetch initial profiles from Firestore / API backend on startup
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // 1. Try Firestore first
        const firestoreBios = await fetchBioProfiles(currentUser?.uid);
        if (firestoreBios && firestoreBios.length > 0) {
          setProfiles(firestoreBios);
          setCurrentProfile(firestoreBios[0]);
          setIsLoading(false);
          return;
        }

        // 2. Fallback to express API
        const res = await fetch('/api/bios');
        if (res.ok) {
          const data = await res.json();
          if (data.profiles && data.profiles.length > 0) {
            setProfiles(data.profiles);
            setCurrentProfile(data.profiles[0]);
            
            // Seed Firestore with the initial profiles in the background
            for (const p of data.profiles) {
              saveBioProfile(p).catch(() => {});
            }
          }
        }
      } catch (err) {
        console.warn('Using local initial mock data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Show temporary toast message
  const triggerToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => {
      setSaveToast({ show: false, msg: '', type: 'success' });
    }, 2800);
  };

  // Save current profile to both Firestore and local API
  const persistProfile = async (profileToSave: BioProfile) => {
    setIsSaving(true);
    try {
      const updatedWithAuth: BioProfile = {
        ...profileToSave,
        ownerId: currentUser?.uid || profileToSave.ownerId,
        updatedAt: new Date().toISOString(),
      };

      // 1. Save to Firebase Firestore Database
      await saveBioProfile(updatedWithAuth);

      // 2. Save to Express server backup
      await fetch(`/api/bios/${updatedWithAuth.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWithAuth),
      }).catch(() => {});

      triggerToast('Đã lưu & đồng bộ Firebase Firestore Realtime ⚡');
    } catch (e: any) {
      console.error('Failed to save profile:', e);
      triggerToast('Lưu dữ liệu cục bộ (Lỗi Firestore)', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Update profile with automatic debounced sync
  const handleUpdateProfile = (updatedProfile: BioProfile) => {
    const enriched = {
      ...updatedProfile,
      ownerId: currentUser?.uid || updatedProfile.ownerId,
    };

    setCurrentProfile(enriched);
    setProfiles((prev) =>
      prev.map((p) => (p.id === enriched.id ? enriched : p))
    );

    // Debounced autosave
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      persistProfile(enriched);
    }, 1200);
  };

  // Create a brand new bio profile
  const handleCreateNewProfile = async () => {
    const timestamp = Date.now().toString().slice(-4);
    const newSlug = `user-${timestamp}`;
    const newProfile: BioProfile = {
      id: `profile-${Date.now()}`,
      slug: newSlug,
      ownerId: currentUser?.uid,
      displayName: currentUser?.displayName || 'Tên Của Bạn',
      bio: 'Chào mừng bạn đến với trang Bio của mình! Kết nối và khám phá các liên kết hữu ích.',
      avatarUrl: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      statusPill: 'Sẵn sàng hợp tác ✨',
      verified: false,
      socialLinks: [
        { id: `s-${Date.now()}-1`, platform: 'tiktok', url: 'https://tiktok.com/@', enabled: true },
        { id: `s-${Date.now()}-2`, platform: 'instagram', url: 'https://instagram.com/', enabled: true },
        { id: `s-${Date.now()}-3`, platform: 'facebook', url: 'https://facebook.com/', enabled: true },
      ],
      theme: { ...PRESET_THEMES[0] },
      blocks: [
        {
          id: `blk-${Date.now()}-1`,
          type: 'link',
          enabled: true,
          order: 1,
          title: '🔥 Xem dự án & Portfolio mới nhất',
          subtitle: 'Tổng hợp các sản phẩm và dịch vụ nổi bật',
          url: 'https://google.com',
          badge: 'HOT',
          clickCount: 0,
        },
        {
          id: `blk-${Date.now()}-2`,
          type: 'contact_form',
          enabled: true,
          order: 2,
          title: '📩 Đặt lịch hẹn / Liên hệ hợp tác',
          subtitle: 'Phản hồi trong vòng 24h',
          buttonText: 'Gửi yêu cầu ngay',
          requirePhone: true,
          requireEmail: true,
          successMessage: 'Cảm ơn bạn đã liên hệ!',
          recipientAccount: currentUser?.email || 'admin.contact@gmail.com',
          recipientPhone: '',
          recipientRole: 'Chủ sở hữu Bio',
          notificationMethod: 'both',
        }
      ],
      stats: {
        views: 1,
        clicks: 0,
        leadsCount: 0,
        dailyViews: [
          { date: 'Hôm nay', views: 1, clicks: 0 },
        ],
        linkClicks: [],
      },
      leads: [],
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    try {
      await saveBioProfile(newProfile);
      await fetch('/api/bios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      }).catch(() => {});

      setProfiles((prev) => [newProfile, ...prev]);
      setCurrentProfile(newProfile);
      triggerToast('Đã tạo trang Bio mới trên Firebase Cloud!');
    } catch (e) {
      console.error(e);
      setProfiles((prev) => [newProfile, ...prev]);
      setCurrentProfile(newProfile);
    }
  };

  // Delete profile
  const handleDeleteProfile = async (slugToDelete: string) => {
    try {
      await deleteBioFromFirestore(slugToDelete);
      await fetch(`/api/bios/${slugToDelete}`, { method: 'DELETE' }).catch(() => {});
      const remaining = profiles.filter((p) => p.slug !== slugToDelete);
      setProfiles(remaining);
      if (remaining.length > 0) {
        setCurrentProfile(remaining[0]);
      }
      triggerToast('Đã xoá trang Bio khỏi Firebase');
    } catch (e) {
      console.error(e);
    }
  };

  // Update lead status
  const handleUpdateLeadStatus = async (leadId: string, status: BioLead['status']) => {
    try {
      const updatedLeads = (currentProfile.leads || []).map((l) =>
        l.id === leadId ? { ...l, status } : l
      );
      const updated = {
        ...currentProfile,
        leads: updatedLeads,
      };
      handleUpdateProfile(updated);
      triggerToast('Đã cập nhật trạng thái khách hàng');
    } catch (e) {
      console.error(e);
    }
  };

  // Apply AI generator results
  const handleApplyAIResult = (result: {
    displayName?: string;
    bio?: string;
    statusPill?: string;
    suggestedLinks?: { title: string; subtitle: string; badge: string }[];
  }) => {
    const updated: BioProfile = {
      ...currentProfile,
      displayName: result.displayName || currentProfile.displayName,
      bio: result.bio || currentProfile.bio,
      statusPill: result.statusPill || currentProfile.statusPill,
    };

    if (result.suggestedLinks && result.suggestedLinks.length > 0) {
      const newBlocks: BioBlock[] = [
        ...updated.blocks,
        ...result.suggestedLinks.map((sl, idx) => ({
          id: `blk-ai-${Date.now()}-${idx}`,
          type: 'link' as const,
          enabled: true,
          order: updated.blocks.length + idx + 1,
          title: sl.title,
          subtitle: sl.subtitle,
          badge: sl.badge,
          url: 'https://',
          clickCount: 0,
        })),
      ];
      updated.blocks = newBlocks;
    }

    handleUpdateProfile(updated);
    triggerToast('Đã áp dụng nội dung AI vào Bio của bạn! ✨');
  };

  // If visiting public bio link /b/:slug
  if (publicSlug) {
    return (
      <PublicBioPage
        slug={publicSlug}
        onGoToStudio={() => {
          window.history.pushState({}, '', '/');
          setPublicSlug(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profiles={profiles}
        currentProfile={currentProfile}
        onSelectProfile={setCurrentProfile}
        onCreateNewProfile={handleCreateNewProfile}
        onDeleteProfile={handleDeleteProfile}
        onSaveProfile={() => persistProfile(currentProfile)}
        isSaving={isSaving}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Studio Body (Editor Grid on Left, Sticky Phone Mockup on Right) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Config Panel (Tabs) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Realtime Banner Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 flex-wrap">
                  <span>Trang Bio Trực Tuyến:</span>
                  <a
                    href={`/b/${currentProfile.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>/b/{currentProfile.slug}</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                  <Cloud size={11} className="text-blue-500" />
                  <span>Đồng bộ Firestore Realtime ⚡ Tự động cập nhật khách hàng</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl transition-all"
              >
                Lấy QR & Link
              </button>
            </div>
          </div>

          {/* TAB 1: BLOCKS & PROFILE INFO */}
          {activeTab === 'blocks' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Profile Meta Editor */}
              <ProfileInfoEditor
                profile={currentProfile}
                onChange={(patch) => handleUpdateProfile({ ...currentProfile, ...patch })}
                onOpenAIModal={() => setIsAIModalOpen(true)}
              />

              {/* Social Media Channels */}
              <SocialLinksEditor
                socialLinks={currentProfile.socialLinks}
                onChange={(socialLinks) => handleUpdateProfile({ ...currentProfile, socialLinks })}
              />

              {/* Dynamic Blocks & Content */}
              <BlockEditor
                blocks={currentProfile.blocks}
                onChange={(blocks) => handleUpdateProfile({ ...currentProfile, blocks })}
              />
            </div>
          )}

          {/* TAB 2: THEMES & STYLING */}
          {activeTab === 'theme' && (
            <div className="animate-fadeIn">
              <ThemeEditor
                theme={currentProfile.theme}
                onChange={(updatedTheme) => handleUpdateProfile({ ...currentProfile, theme: updatedTheme })}
              />
            </div>
          )}

          {/* TAB 3: ANALYTICS & CRM */}
          {activeTab === 'analytics' && (
            <div className="animate-fadeIn">
              <AnalyticsView
                profile={currentProfile}
                onUpdateLeadStatus={handleUpdateLeadStatus}
              />
            </div>
          )}

        </div>

        {/* Right Column: Live Phone Mockup Preview */}
        <div className="lg:col-span-5 sticky top-20">
          <PhonePreview
            profile={currentProfile}
            onOpenShare={() => setIsShareModalOpen(true)}
          />
        </div>

      </main>

      {/* Floating Save Toast */}
      {saveToast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-zinc-700/80 flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
          {saveToast.type === 'error' ? (
            <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          )}
          <span>{saveToast.msg}</span>
        </div>
      )}

      {/* Gemini AI Bio Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyAIResult={handleApplyAIResult}
      />

      {/* Share & QR Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={currentProfile}
      />

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={() => {
          triggerToast('Đăng nhập Firebase thành công! 🎉');
        }}
      />
    </div>
  );
}

export default App;
