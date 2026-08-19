import React, { useEffect, useState, useRef } from 'react';
import { Share2, AlertCircle, RefreshCw, QrCode, Sparkles, Shield, Check } from 'lucide-react';
import { BioProfile } from '../types';
import { BioRenderer } from './BioRenderer';
import { ShareModal } from './ShareModal';
import { subscribeToBio, getBioProfile, recordStat } from '../lib/firebase';
import { INITIAL_PROFILES } from '../data/mockBios';

interface PublicBioPageProps {
  slug: string;
  onGoToStudio?: () => void;
}

export const PublicBioPage: React.FC<PublicBioPageProps> = ({ slug }) => {
  const [profile, setProfile] = useState<BioProfile | null>(() => {
    // Immediate pre-match from initial mock data if available
    const clean = slug.trim().toLowerCase();
    return INITIAL_PROFILES.find(p => p.slug.toLowerCase() === clean || p.id === slug) || null;
  });
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const cleanSlug = slug.trim().toLowerCase();

    // 1. Silent analytics recording
    recordStat(cleanSlug, 'view').catch(() => {});
    fetch(`/api/bios/${cleanSlug}/view`, { method: 'POST' }).catch(() => {});

    // 2. Immediate fetch from API / Firestore to prevent any loading hang
    const fetchDirect = async () => {
      try {
        // Try Express API backend
        const res = await fetch(`/api/bios/${cleanSlug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            setLoading(false);
            hasLoadedRef.current = true;
            return;
          }
        }

        // Try direct Firestore getDoc/query
        const firestoreData = await getBioProfile(cleanSlug);
        if (firestoreData) {
          setProfile(firestoreData);
          setLoading(false);
          hasLoadedRef.current = true;
          return;
        }

        // Check local mock profiles
        const matchedMock = INITIAL_PROFILES.find(
          (p) => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug
        );
        if (matchedMock) {
          setProfile(matchedMock);
          setLoading(false);
          hasLoadedRef.current = true;
          return;
        }

        if (!hasLoadedRef.current) {
          setError('Không tìm thấy trang Bio này');
          setLoading(false);
        }
      } catch (err: any) {
        console.warn('Direct fetch error:', err);
        // If not loaded, fallback to mock if slug matches or show error
        const matchedMock = INITIAL_PROFILES.find(
          (p) => p.slug.toLowerCase() === cleanSlug || p.id === cleanSlug
        );
        if (matchedMock) {
          setProfile(matchedMock);
          setLoading(false);
          hasLoadedRef.current = true;
        } else if (!hasLoadedRef.current) {
          setError('Không thể tải trang Bio');
          setLoading(false);
        }
      }
    };

    fetchDirect();

    // 3. Connect Realtime Firestore updates
    try {
      unsubscribe = subscribeToBio(
        cleanSlug,
        (realtimeData) => {
          if (realtimeData) {
            setProfile(realtimeData);
            setLoading(false);
            setError(null);
            hasLoadedRef.current = true;
          } else if (!hasLoadedRef.current) {
            fetchDirect();
          }
        },
        (err) => {
          console.warn('Realtime subscription notification:', err);
          if (!hasLoadedRef.current) {
            fetchDirect();
          }
        }
      );
    } catch (e) {
      console.warn('Firestore subscription failed, using direct API mode:', e);
      if (!hasLoadedRef.current) {
        fetchDirect();
      }
    }

    // Safety timeout: Never stay in loading state more than 1.2 seconds
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          fetchDirect();
          return false;
        }
        return false;
      });
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white space-y-4 p-6 select-none">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-zinc-200">Đang tải trang Bio...</p>
          <p className="text-xs text-zinc-500 font-mono">@{slug}</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white space-y-5 p-6 text-center select-none">
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-xl">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-lg font-bold text-zinc-100">Trang Bio Không Tồn Tại</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Đường dẫn <code className="text-blue-400 font-mono bg-blue-950/40 px-1.5 py-0.5 rounded">/b/{slug}</code> hiện chưa được tạo hoặc đã thay đổi đường dẫn.
          </p>
        </div>
        <a
          href="/"
          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded-xl shadow-lg border border-zinc-700 transition-all hover:scale-105"
        >
          Khám phá BioLink Studio
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-between selection:bg-blue-500 selection:text-white">
      {/* Floating Share / QR Button (Top Right) */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsShareOpen(true)}
          className="p-2.5 bg-black/40 hover:bg-black/70 text-white backdrop-blur-md rounded-full shadow-lg transition-all active:scale-95 border border-white/15 flex items-center gap-1.5"
          title="Chia sẻ hoặc quét mã QR"
          aria-label="Chia sẻ trang này"
        >
          <QrCode size={17} />
          <span className="text-xs font-semibold pr-1 hidden sm:inline">Mã QR</span>
        </button>
      </div>

      {/* Main Bio Content (Strictly Read-Only Viewer Mode) */}
      <main className="w-full flex-1 flex flex-col items-center justify-start">
        <BioRenderer profile={profile} isPublic={true} />
      </main>

      {/* Verified Bio Footer */}
      <footer className="w-full py-4 text-center select-none text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
        <Shield size={12} className="text-emerald-500" />
        <span>Trang Bio chính thức của <strong>{profile.displayName}</strong></span>
      </footer>

      {/* Share & QR Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        profile={profile}
      />
    </div>
  );
};

