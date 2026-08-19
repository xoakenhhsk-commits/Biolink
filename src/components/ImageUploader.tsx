import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Link2, X, Check, Loader2, Sparkles } from 'lucide-react';
import { processImageFile } from '../utils/imageHelper';

interface ImageUploaderProps {
  label?: string;
  value?: string;
  onChange: (urlOrDataUrl: string) => void;
  presetImages?: string[];
  aspectRatio?: 'square' | 'banner' | 'auto';
  maxWidth?: number;
  maxHeight?: number;
  placeholder?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  presetImages = [],
  aspectRatio = 'square',
  maxWidth = 800,
  maxHeight = 800,
  placeholder = 'Chọn ảnh từ thiết bị hoặc dán URL...',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>(
    value && !value.startsWith('data:') && !presetImages.includes(value) ? 'url' : 'upload'
  );
  const [urlInput, setUrlInput] = useState(value || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const dataUrl = await processImageFile(file, maxWidth, maxHeight, 0.85);
      onChange(dataUrl);
      setUrlInput(dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi xử lý ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                activeTab === 'upload'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Tải từ máy
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                activeTab === 'url'
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              URL
            </button>
            {presetImages.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`px-2 py-0.5 rounded-lg transition-colors font-medium ${
                  activeTab === 'presets'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                Mẫu có sẵn
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Zone */}
      {activeTab === 'upload' && (
        <div className="space-y-2">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              dragOver
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
                : 'border-zinc-300 dark:border-zinc-700 bg-zinc-50/80 dark:bg-zinc-800/40 hover:border-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {isProcessing ? (
              <div className="py-3 flex flex-col items-center gap-2 text-blue-600 dark:text-blue-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-xs font-semibold">Đang xử lý & nén ảnh tối ưu...</span>
              </div>
            ) : value ? (
              <div className="w-full flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 ${
                      aspectRatio === 'banner' ? 'w-24 h-12' : 'w-12 h-12'
                    }`}
                  >
                    <img
                      src={value}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-500" />
                      <span>Đã tải ảnh lên</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Bấm vào để chọn ảnh khác từ máy
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                    setUrlInput('');
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  title="Xóa ảnh"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="py-2 flex flex-col items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UploadCloud size={20} />
                </div>
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                  Kéo thả hoặc bấm chọn ảnh từ thiết bị
                </div>
                <p className="text-[11px] text-zinc-400">
                  Hỗ trợ PNG, JPG, JPEG, WEBP, GIF (Tự động nén chất lượng cao)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  onChange(e.target.value);
                }}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Link2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            </div>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setUrlInput('');
                }}
                className="px-2.5 py-2 text-xs bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 font-medium"
              >
                Xoá
              </button>
            )}
          </div>
          {value && (
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <img
                src={value}
                alt="preview"
                className="w-6 h-6 rounded-md object-cover border border-zinc-300 dark:border-zinc-700"
                referrerPolicy="no-referrer"
              />
              <span className="truncate flex-1 font-mono text-[10px]">{value}</span>
            </div>
          )}
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && presetImages.length > 0 && (
        <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl grid grid-cols-4 sm:grid-cols-6 gap-2 border border-zinc-200 dark:border-zinc-700">
          {presetImages.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange(url);
                setUrlInput(url);
              }}
              className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${
                value === url ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-transparent hover:border-zinc-300'
              }`}
            >
              <img src={url} alt="preset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}

      {errorMsg && (
        <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
          <span>⚠️ {errorMsg}</span>
        </p>
      )}
    </div>
  );
};
