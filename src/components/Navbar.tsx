import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Palette, 
  BarChart3, 
  Share2, 
  Save, 
  Plus, 
  ChevronDown, 
  Wand2, 
  Trash2,
  LogIn,
  ShieldCheck,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { BioProfile } from '../types';

interface NavbarProps {
  activeTab: 'blocks' | 'theme' | 'analytics';
  setActiveTab: (tab: 'blocks' | 'theme' | 'analytics') => void;
  profiles: BioProfile[];
  currentProfile: BioProfile;
  onSelectProfile: (profile: BioProfile) => void;
  onCreateNewProfile: () => void;
  onDeleteProfile: (slug: string) => void;
  onSaveProfile: () => void;
  isSaving: boolean;
  onOpenAIModal: () => void;
  onOpenShareModal: () => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profiles,
  currentProfile,
  onSelectProfile,
  onCreateNewProfile,
  onDeleteProfile,
  onSaveProfile,
  isSaving,
  onOpenAIModal,
  onOpenShareModal,
  currentUser,
  onOpenAuthModal,
  isCloudSynced = true,
}) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Brand & Profile Switcher */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                  BioLink
                </span>
                <span className="px-1.5 py-0.2 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold rounded-md uppercase">
                  Studio
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium hidden sm:flex items-center gap-1">
                <Cloud size={11} className="text-emerald-500" />
                <span>Firebase Cloud Sync</span>
              </p>
            </div>
          </div>

          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all"
            >
              <img
                src={currentProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt="avatar"
                className="w-5 h-5 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="truncate max-w-[110px] sm:max-w-[150px] font-bold">
                {currentProfile.displayName}
              </span>
              <ChevronDown size={14} className="text-zinc-400" />
            </button>

            {showProfileDropdown && (
              <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2 space-y-1 z-50 animate-fadeIn">
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Trang Bio của bạn ({profiles.length})
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {profiles.map((p) => {
                    const isCurrent = p.id === currentProfile.id;
                    return (
                      <div
                        key={p.id}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProfile(p);
                            setShowProfileDropdown(false);
                          }}
                          className="flex items-center gap-2 flex-1 min-w-0 text-left"
                        >
                          <img
                            src={p.avatarUrl}
                            alt=""
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate">
                            <div className="truncate font-semibold">{p.displayName}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">/b/{p.slug}</div>
                          </div>
                        </button>

                        {profiles.length > 1 && !isCurrent && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Bạn có chắc muốn xoá trang bio "${p.displayName}"?`)) {
                                onDeleteProfile(p.slug);
                              }
                            }}
                            className="p-1 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            title="Xóa Bio này"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      onCreateNewProfile();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full py-2 px-3 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus size={14} />
                    <span>+ Tạo thêm trang Bio mới</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Main Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'blocks'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Layers size={14} />
            <span>Khối & Nội dung</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'theme'
                ? 'bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Palette size={14} />
            <span>Giao diện</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <BarChart3 size={14} />
            <span>Thống kê</span>
          </button>
        </div>

        {/* Right: User Auth, AI, Share, Save Buttons */}
        <div className="flex items-center gap-2">
          {/* User Auth Button */}
          {currentUser ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 p-1.5 pr-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all"
              title="Quản lý tài khoản Firebase"
            >
              <img
                src={
                  currentUser.photoURL ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`
                }
                alt=""
                className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 max-w-[80px] truncate hidden sm:inline">
                {currentUser.displayName?.split(' ')[0] || 'Tài khoản'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-2.5 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <LogIn size={13} className="text-blue-500" />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* AI Helper */}
          <button
            onClick={onOpenAIModal}
            className="p-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="Trợ lý AI Gemini"
          >
            <Wand2 size={14} />
            <span className="hidden sm:inline">AI Bio</span>
          </button>

          {/* Share & QR Modal */}
          <button
            onClick={onOpenShareModal}
            className="p-2 sm:px-3 sm:py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            title="Chia sẻ & Quét QR"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>

          {/* Realtime Save / Sync button */}
          <button
            onClick={onSaveProfile}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Realtime ⚡'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
