import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Check, 
  RefreshCw, 
  ArrowRight, 
  Lightbulb, 
  Layers,
  Palette
} from 'lucide-react';
import { BioProfile, LinkBlock } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyAIResult: (result: {
    displayName?: string;
    bio?: string;
    statusPill?: string;
    suggestedLinks?: { title: string; subtitle: string; badge: string }[];
  }) => void;
}

const NICHE_PRESETS = [
  { name: 'Developer & Tech Creator', vibe: 'Chuyên nghiệp, hiện đại, truyền cảm hứng thực chiến' },
  { name: 'Beauty & Skincare Blogger', vibe: 'Dễ thương, trendy Gen Z, tôn vinh sắc đẹp tự nhiên' },
  { name: 'Quán Cafe / Tiệm Bánh', vibe: 'Ấm cúng, mộc mạc, mời gọi trải nghiệm không gian và hương vị' },
  { name: 'Fitness & Gym Coach', vibe: 'Mạnh mẽ, kỷ luật, truyền năng lượng tích cực' },
  { name: 'Shop Thời Trang & Phụ Kiện', vibe: 'Bắt trend, sang chảnh, ưu đãi cuốn hút' },
  { name: 'Chuyên Viên Tư Vấn BĐS / Tài Chính', vibe: 'Uy tín, bảo mật, chuyên nghiệp đẳng cấp' },
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, onApplyAIResult }) => {
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('Content Creator & Entrepreneur');
  const [vibe, setVibe] = useState('Chuyên nghiệp, hiện đại & truyền cảm hứng');
  const [highlights, setHighlights] = useState('Chia sẻ kiến thức, nhận booking hợp tác, bán khoá học & tài liệu');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || 'Creator',
          profession,
          vibe,
          keyHighlights: highlights,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối với dịch vụ AI. Đang sử dụng gợi ý thông minh có sẵn.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    onApplyAIResult(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <span>AI Bio Generator (Gemini)</span>
              </h3>
              <p className="text-xs text-zinc-500">
                Tự động sáng tạo Bio & đề xuất liên kết hấp dẫn tăng lượt nhấp
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

        {/* Input Form */}
        <div className="space-y-3.5">
          {/* Quick preset pills */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Gợi ý theo ngành nghề:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {NICHE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setProfession(p.name);
                    setVibe(p.vibe);
                  }}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Tên cá nhân / Thương hiệu
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Hoàng Anh, Linh Chi..."
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Lĩnh vực / Nghề nghiệp
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="VD: Fashion Blogger, Lập trình viên..."
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Phong cách Bio mong muốn (Vibe)
            </label>
            <input
              type="text"
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              placeholder="VD: Chuyên nghiệp, Gen Z trẻ trung, Luxury sang chảnh..."
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Dịch vụ / Điểm nổi bật cần quảng bá
            </label>
            <textarea
              rows={2}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="VD: Đang có ebook miễn phí, nhận booking quay review, bán khoá học online..."
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGenerate}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>AI đang phân tích & sáng tạo Bio...</span>
              </>
            ) : (
              <>
                <Wand2 size={15} />
                <span>Tạo Nội Dung Bio Bằng AI ✨</span>
              </>
            )}
          </button>
        </div>

        {/* AI Results Preview */}
        {result && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-3.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Check size={14} />
                <span>Kết quả do AI tạo ra:</span>
              </span>
              {result.colorRecommendation && (
                <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
                  <Palette size={11} />
                  <span>Tone màu gợi ý: {result.colorRecommendation}</span>
                </span>
              )}
            </div>

            <div className="space-y-2 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold block">TÊN HIỂN THỊ</span>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{result.displayName}</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 font-bold block">ĐOẠN GIỚI THIỆU (BIO)</span>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{result.bio}</p>
              </div>

              {result.statusPill && (
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block">STATUS PILL</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
                    {result.statusPill}
                  </span>
                </div>
              )}

              {result.suggestedLinks && result.suggestedLinks.length > 0 && (
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block mb-1">CÁC LIÊN KẾT ĐƯỢC GỢI Ý</span>
                  <div className="space-y-1.5">
                    {result.suggestedLinks.map((link: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border flex items-center justify-between text-[11px]">
                        <div>
                          <div className="font-bold text-zinc-800 dark:text-zinc-200">{link.title}</div>
                          {link.subtitle && <div className="text-zinc-400 text-[10px]">{link.subtitle}</div>}
                        </div>
                        {link.badge && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-[9px]">
                            {link.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleApply}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition-all"
            >
              <Check size={14} />
              <span>Áp Dụng Nội Dung Này Vào Bio Của Tôi</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
