import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { 
  Share2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  QrCode, 
  Code, 
  Send, 
  Facebook, 
  Twitter,
  Sparkles
} from 'lucide-react';
import { BioProfile } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BioProfile;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, profile }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const fullUrl = `${window.location.origin}/b/${profile.slug}`;
  const embedCode = `<iframe src="${fullUrl}" width="100%" height="700" style="border:none;border-radius:24px;" title="${profile.displayName} Bio"></iframe>`;

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        fullUrl,
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error(error);
          if (canvasRef.current) {
            setQrUrl(canvasRef.current.toDataURL('image/png'));
          }
        }
      );
    }
  }, [isOpen, fullUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `qrcode-${profile.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Chia Sẻ & Xuất Bản Trang Bio
              </h3>
              <p className="text-xs text-zinc-500">
                Gửi link cho khách hàng hoặc quét mã QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
          >
            ✕
          </button>
        </div>

        {/* Copy Public Link Bar */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Đường dẫn Bio Link trực tiếp:
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono text-zinc-700 dark:text-zinc-200 truncate">
              {fullUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all whitespace-nowrap active:scale-95"
            >
              {copied ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
              <span>{copied ? 'Đã chép! 🎉' : 'Sao chép'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href={`/b/${profile.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
            >
              <ExternalLink size={12} />
              <span>Mở xem thử trang công khai (/b/{profile.slug})</span>
            </a>
            <a
              href={`/?bio=${profile.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium hover:underline flex items-center gap-1"
            >
              <span>Link dự phòng (?bio=)</span>
            </a>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-zinc-200/80">
            <canvas ref={canvasRef} className="rounded-lg" />
          </div>

          <div className="text-center">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
              Mã QR dành riêng cho @{profile.slug}
            </span>
            <span className="text-[11px] text-zinc-400">
              Quét camera điện thoại để mở ngay trang Bio
            </span>
          </div>

          <button
            onClick={downloadQR}
            className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs rounded-xl shadow hover:opacity-90 flex items-center gap-1.5 transition-all"
          >
            <Download size={13} />
            <span>Tải ảnh mã QR (PNG)</span>
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center">
            Chia sẻ nhanh lên mạng xã hội:
          </label>
          <div className="grid grid-cols-4 gap-2">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-blue-600 text-white rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold hover:opacity-90 transition-opacity"
            >
              <Facebook size={16} />
              <span>Facebook</span>
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(profile.displayName + ' Bio Link')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-black text-white rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold hover:opacity-90 transition-opacity"
            >
              <Twitter size={16} />
              <span>Twitter / X</span>
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(profile.displayName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-sky-500 text-white rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold hover:opacity-90 transition-opacity"
            >
              <Send size={16} />
              <span>Telegram</span>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(fullUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-emerald-600 text-white rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={16} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Embed Code Snippet */}
        <div className="pt-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-zinc-500 flex items-center gap-1">
              <Code size={12} />
              <span>Mã nhúng iFrame cho Website:</span>
            </span>
            <button
              onClick={handleCopyEmbed}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {copiedEmbed ? 'Đã chép mã!' : 'Sao chép mã nhúng'}
            </button>
          </div>
          <input
            type="text"
            readOnly
            value={embedCode}
            className="w-full px-2.5 py-1 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono rounded-lg border border-zinc-200 dark:border-zinc-700 select-all"
          />
        </div>

      </div>
    </div>
  );
};
