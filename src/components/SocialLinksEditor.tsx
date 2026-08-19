import React, { useState } from 'react';
import { Plus, Trash2, Globe, Check, Eye, EyeOff } from 'lucide-react';
import { SocialLink } from '../types';
import { SOCIAL_PLATFORMS, renderSocialIcon } from '../utils/socialIcons';

interface SocialLinksEditorProps {
  socialLinks: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export const SocialLinksEditor: React.FC<SocialLinksEditorProps> = ({ socialLinks, onChange }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const toggleEnable = (id: string) => {
    onChange(
      socialLinks.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const updateUrl = (id: string, url: string) => {
    onChange(
      socialLinks.map((s) => (s.id === id ? { ...s, url } : s))
    );
  };

  const removeSocial = (id: string) => {
    onChange(socialLinks.filter((s) => s.id !== id));
  };

  const addPlatform = (platformId: SocialLink['platform']) => {
    const existing = socialLinks.find((s) => s.platform === platformId);
    if (existing) {
      // If already present, just make sure it's enabled
      onChange(
        socialLinks.map((s) => (s.platform === platformId ? { ...s, enabled: true } : s))
      );
    } else {
      const info = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
      const newLink: SocialLink = {
        id: `social-${Date.now()}-${platformId}`,
        platform: platformId,
        url: info?.placeholder || 'https://',
        enabled: true,
      };
      onChange([...socialLinks, newLink]);
    }
    setShowAddMenu(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Globe size={16} className="text-indigo-500" />
            <span>Mạng xã hội & Kênh liên lạc</span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Biểu tượng mạng xã hội hiển thị nổi bật dưới phần thông tin giới thiệu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-1"
        >
          <Plus size={14} />
          <span>{showAddMenu ? 'Đóng' : 'Thêm kênh'}</span>
        </button>
      </div>

      {/* Add Platform Menu */}
      {showAddMenu && (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2 animate-fadeIn">
          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
            Chọn nền tảng muốn thêm:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SOCIAL_PLATFORMS.map((platform) => {
              const isAdded = socialLinks.some((s) => s.platform === platform.id);
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => addPlatform(platform.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                    isAdded
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400 text-zinc-700 dark:text-zinc-200'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    {renderSocialIcon(platform.id, 14)}
                  </div>
                  <span className="truncate flex-1 text-left">{platform.name}</span>
                  {isAdded && <Check size={12} className="text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* List of Active Socials */}
      <div className="space-y-2.5">
        {socialLinks.length === 0 ? (
          <div className="text-center py-6 text-zinc-400 text-xs border border-dashed rounded-xl">
            Chưa có mạng xã hội nào. Bấm nút "Thêm kênh" ở trên để kết nối TikTok, Facebook, Zalo, YouTube...
          </div>
        ) : (
          socialLinks.map((social) => {
            const info = SOCIAL_PLATFORMS.find((p) => p.id === social.platform);
            return (
              <div
                key={social.id}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  social.enabled
                    ? 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700'
                    : 'bg-zinc-100/50 dark:bg-zinc-900/50 border-dashed border-zinc-200 opacity-60'
                }`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
                  {renderSocialIcon(social.platform, 16)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">
                      {info?.name || social.platform}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={social.url}
                    onChange={(e) => updateUrl(social.id, e.target.value)}
                    placeholder={info?.placeholder || 'https://...'}
                    className="w-full px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => toggleEnable(social.id)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    title={social.enabled ? 'Ẩn kênh này' : 'Hiện kênh này'}
                  >
                    {social.enabled ? <Eye size={15} className="text-emerald-500" /> : <EyeOff size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSocial(social.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Xóa kênh"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
