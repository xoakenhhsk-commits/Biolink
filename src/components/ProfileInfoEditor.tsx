import React from 'react';
import { 
  User, 
  Sparkles, 
  MapPin, 
  ShieldCheck,
  Wand2
} from 'lucide-react';
import { BioProfile } from '../types';
import { ImageUploader } from './ImageUploader';

interface ProfileInfoEditorProps {
  profile: BioProfile;
  onChange: (updated: Partial<BioProfile>) => void;
  onOpenAIModal: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80',
];

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
];

export const ProfileInfoEditor: React.FC<ProfileInfoEditorProps> = ({ profile, onChange, onOpenAIModal }) => {
  return (
    <div className="space-y-6">
      {/* AI Header Banner Callout */}
      <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Sparkles size={15} />
            <span>Trợ lý AI Viết Bio Tự Động</span>
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Tạo câu bio giới thiệu ấn tượng, status pill và gợi ý liên kết chỉ với 1 click.
          </p>
        </div>
        <button
          onClick={onOpenAIModal}
          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95"
        >
          <Wand2 size={14} />
          <span>Dùng AI</span>
        </button>
      </div>

      {/* Basic Profile Details */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-5 shadow-sm">
        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <User size={16} className="text-blue-500" />
          <span>Thông tin cá nhân & Thương hiệu</span>
        </h4>

        {/* Slug / Public URL */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Đường dẫn Bio (Slug URL) *
          </label>
          <div className="flex rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 focus-within:ring-2 focus-within:ring-blue-500">
            <span className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-xs font-mono flex items-center select-none border-r border-zinc-200 dark:border-zinc-700">
              /b/
            </span>
            <input
              type="text"
              value={profile.slug}
              onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
              placeholder="ten-cua-ban"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none"
            />
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Link công khai của bạn: <span className="font-mono text-blue-500">{window.location.origin}/b/{profile.slug}</span>
          </p>
        </div>

        {/* Avatar Upload (From Device, URL, or Presets) */}
        <div>
          <ImageUploader
            label="Ảnh đại diện (Avatar) - Tải từ thiết bị hoặc chọn mẫu"
            value={profile.avatarUrl}
            onChange={(avatarUrl) => onChange({ avatarUrl })}
            presetImages={PRESET_AVATARS}
            aspectRatio="square"
            maxWidth={500}
            maxHeight={500}
            placeholder="Dán URL ảnh đại diện..."
          />
        </div>

        {/* Banner Cover Image Upload (From Device, URL, or Presets) */}
        <div>
          <ImageUploader
            label="Ảnh bìa Banner (Tùy chọn) - Tải từ thiết bị"
            value={profile.bannerUrl || ''}
            onChange={(bannerUrl) => onChange({ bannerUrl: bannerUrl || undefined })}
            presetImages={PRESET_BANNERS}
            aspectRatio="banner"
            maxWidth={1200}
            maxHeight={500}
            placeholder="Dán URL ảnh bìa hoặc để trống..."
          />
        </div>

        {/* Display Name & Verified */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tên hiển thị (Display Name) *
            </label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => onChange({ displayName: e.target.value })}
              placeholder="VD: Hoàng Anh • Tech & Code"
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Huy hiệu tích xanh (Verified Badge)
            </label>
            <button
              type="button"
              onClick={() => onChange({ verified: !profile.verified })}
              className={`w-full py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-between transition-all ${
                profile.verified
                  ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} />
                <span>{profile.verified ? 'Đã bật tích xanh' : 'Chưa bật'}</span>
              </span>
              <span className="text-[11px] font-bold">{profile.verified ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Bio Description */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Giới thiệu ngắn (Bio)
            </label>
            <span className="text-[10px] text-zinc-400">
              {profile.bio.length} ký tự
            </span>
          </div>
          <textarea
            rows={3}
            value={profile.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Viết 1-2 câu giới thiệu bản thân, sứ mệnh hoặc lời chào..."
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Status Pill */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Huy hiệu trạng thái nổi bật (Status Pill)
          </label>
          <input
            type="text"
            value={profile.statusPill || ''}
            onChange={(e) => onChange({ statusPill: e.target.value })}
            placeholder="VD: 🟢 Đang nhận dự án mới / 🔥 Giảm 20% hôm nay"
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location & Pronouns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Vị trí / Thành phố
            </label>
            <div className="relative">
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => onChange({ location: e.target.value })}
                placeholder="VD: Hà Nội, Việt Nam 🇻🇳"
                className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Đại từ xưng hô (Pronouns)
            </label>
            <input
              type="text"
              value={profile.pronouns || ''}
              onChange={(e) => onChange({ pronouns: e.target.value })}
              placeholder="VD: he/him, she/her"
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
