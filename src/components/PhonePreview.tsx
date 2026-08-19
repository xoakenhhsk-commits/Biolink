import React, { useState } from 'react';
import { 
  Smartphone, 
  ExternalLink, 
  Copy, 
  Check, 
  QrCode, 
  Wifi, 
  Battery, 
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { BioProfile } from '../types';
import { BioRenderer } from './BioRenderer';

interface PhonePreviewProps {
  profile: BioProfile;
  onOpenShareModal: () => void;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({ profile, onOpenShareModal }) => {
  const [copied, setCopied] = useState(false);
  const [deviceStyle, setDeviceStyle] = useState<'iphone' | 'minimal'>('iphone');
  const [scale, setScale] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fullUrl = `${window.location.origin}/b/${profile.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openLiveTab = () => {
    window.open(`/b/${profile.slug}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center h-full justify-between gap-4 p-2 sm:p-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-sm flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">Xem trước trực tiếp</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setDeviceStyle(deviceStyle === 'iphone' ? 'minimal' : 'iphone')}
            className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-medium transition-colors"
            title="Đổi kiểu khung"
          >
            <Smartphone size={13} className="inline mr-1" />
            {deviceStyle === 'iphone' ? 'Khung iPhone' : 'Tối giản'}
          </button>

          <button
            onClick={openLiveTab}
            className="p-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors"
            title="Mở trong tab mới"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* URL Link Bar */}
      <div className="w-full max-w-sm flex items-center justify-between gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 truncate text-zinc-600 dark:text-zinc-300">
          <span className="text-zinc-400 font-mono text-[10px]">URL:</span>
          <span className="font-mono truncate font-medium">/{profile.slug}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={copyUrl}
            className="px-2 py-1 bg-white dark:bg-zinc-700 shadow-sm rounded-lg hover:bg-zinc-50 text-zinc-700 dark:text-zinc-200 font-medium flex items-center gap-1 transition-all"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
          </button>
          <button
            onClick={onOpenShareModal}
            className="p-1 bg-white dark:bg-zinc-700 shadow-sm rounded-lg hover:bg-zinc-50 text-zinc-700 dark:text-zinc-200 transition-all"
            title="Tạo mã QR & Chia sẻ"
          >
            <QrCode size={13} />
          </button>
        </div>
      </div>

      {/* Phone Mockup Frame */}
      <div className="relative flex items-center justify-center my-auto transition-all">
        {deviceStyle === 'iphone' ? (
          <div className="relative w-[340px] sm:w-[370px] h-[680px] bg-zinc-900 rounded-[50px] p-3 shadow-2xl border-4 border-zinc-800 ring-1 ring-zinc-700/50 flex flex-col justify-between overflow-hidden">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
              <div className="w-2 h-2 rounded-full bg-blue-900/50" />
            </div>

            {/* Top Status bar */}
            <div className="h-6 w-full flex items-center justify-between px-6 text-[10px] text-zinc-400 font-medium z-20 pt-1 select-none">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <Wifi size={11} />
                <Battery size={13} />
              </div>
            </div>

            {/* Inner Screen Scroll Area */}
            <div className="flex-1 w-full rounded-[38px] overflow-y-auto no-scrollbar bg-white dark:bg-zinc-950 relative z-10">
              <BioRenderer profile={profile} isPublic={false} />
            </div>

            {/* Bottom Home Indicator */}
            <div className="h-4 w-full flex items-center justify-center pt-1 z-20 select-none">
              <div className="w-32 h-1 bg-zinc-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Minimal Frame */
          <div className="w-[340px] sm:w-[370px] h-[680px] rounded-3xl overflow-y-auto no-scrollbar shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <BioRenderer profile={profile} isPublic={false} />
          </div>
        )}
      </div>

      {/* Helper text */}
      <p className="text-[11px] text-zinc-400 text-center">
        💡 Mọi thay đổi ở thanh công cụ bên trái sẽ hiển thị và cập nhật theo thời gian thực tại đây.
      </p>
    </div>
  );
};
