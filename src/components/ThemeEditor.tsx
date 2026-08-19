import React from 'react';
import { 
  Palette, 
  Sparkles, 
  Type, 
  Square, 
  Sun, 
  Moon, 
  Check, 
  Image as ImageIcon,
  Layers,
  CircleDot
} from 'lucide-react';
import { BioTheme } from '../types';
import { PRESET_THEMES } from '../data/themes';
import { ImageUploader } from './ImageUploader';

interface ThemeEditorProps {
  theme: BioTheme;
  onChange: (updatedTheme: BioTheme) => void;
}

const FONT_OPTIONS = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Chuẩn mực & Tinh tế)' },
  { id: 'Inter', label: 'Inter (Hiện đại & Sạch sẽ)' },
  { id: 'Playfair Display', label: 'Playfair Display (Sang trọng & Cổ điển)' },
  { id: 'Outfit', label: 'Outfit (Thanh lịch & Trendy)' },
  { id: 'Space Grotesk', label: 'Space Grotesk (Cá tính & Công nghệ)' },
  { id: 'Syne', label: 'Syne (Nghệ thuật & Ấn tượng)' },
  { id: 'Be Vietnam Pro', label: 'Be Vietnam Pro (Chuẩn tiếng Việt)' },
];

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ theme, onChange }) => {
  const applyPreset = (preset: BioTheme) => {
    onChange({ ...preset });
  };

  const update = (patch: Partial<BioTheme>) => {
    onChange({ ...theme, ...patch });
  };

  return (
    <div className="space-y-6">
      {/* Preset Themes Gallery */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div>
          <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            <span>Mẫu Giao Diện Có Sẵn (Preset Themes)</span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Áp dụng 1 click phong cách giao diện được thiết kế sẵn.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESET_THEMES.map((preset) => {
            const isActive = theme.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group flex flex-col justify-between h-24 ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
                style={{
                  background:
                    preset.backgroundType === 'gradient'
                      ? `linear-gradient(${preset.gradientAngle}deg, ${preset.gradientStart}, ${preset.gradientEnd})`
                      : preset.backgroundColor,
                }}
              >
                {/* Mini card mockup */}
                <div
                  className="w-full h-8 rounded-lg flex items-center justify-center px-2 text-[10px] font-bold shadow-sm"
                  style={{
                    backgroundColor: preset.cardBg,
                    color: preset.cardTextColor,
                    borderColor: preset.cardBorder,
                  }}
                >
                  <span className="truncate">{preset.name.split('(')[0]}</span>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span
                    className="text-[11px] font-bold truncate drop-shadow-sm"
                    style={{ color: preset.textColor }}
                  >
                    {preset.name.split('(')[0]}
                  </span>
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                      <Check size={10} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Background Customizer */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <Palette size={16} className="text-purple-500" />
          <span>Hình Nền Trang (Background)</span>
        </h4>

        {/* Background Type Selector */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'color', label: 'Màu đơn' },
            { id: 'gradient', label: 'Gradient' },
            { id: 'mesh', label: 'Mesh' },
            { id: 'image', label: 'Ảnh nền' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => update({ backgroundType: item.id as any })}
              className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                theme.backgroundType === item.id
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Dynamic Controls based on Background Type */}
        {theme.backgroundType === 'color' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Mã màu nền (Hex)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={theme.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="w-10 h-10 rounded-xl cursor-pointer border border-zinc-200"
              />
              <input
                type="text"
                value={theme.backgroundColor}
                onChange={(e) => update({ backgroundColor: e.target.value })}
                className="flex-1 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
              />
            </div>
          </div>
        )}

        {theme.backgroundType === 'gradient' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Màu bắt đầu
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.gradientStart}
                    onChange={(e) => update({ gradientStart: e.target.value })}
                    className="w-9 h-9 rounded-xl cursor-pointer border"
                  />
                  <input
                    type="text"
                    value={theme.gradientStart}
                    onChange={(e) => update({ gradientStart: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Màu kết thúc
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.gradientEnd}
                    onChange={(e) => update({ gradientEnd: e.target.value })}
                    className="w-9 h-9 rounded-xl cursor-pointer border"
                  />
                  <input
                    type="text"
                    value={theme.gradientEnd}
                    onChange={(e) => update({ gradientEnd: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                <span>Góc xoay Gradient</span>
                <span className="font-mono">{theme.gradientAngle || 135}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={theme.gradientAngle || 135}
                onChange={(e) => update({ gradientAngle: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {theme.backgroundType === 'image' && (
          <div>
            <ImageUploader
              label="Ảnh nền trang (Tải từ thiết bị hoặc chọn mẫu)"
              value={theme.bgImageUrl || ''}
              onChange={(bgImageUrl) => update({ bgImageUrl: bgImageUrl || undefined })}
              aspectRatio="banner"
              maxWidth={1600}
              maxHeight={1000}
              presetImages={[
                'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80'
              ]}
              placeholder="Dán link ảnh nền hoặc tải từ máy..."
            />
          </div>
        )}
      </div>

      {/* Typography & Fonts */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <Type size={16} className="text-emerald-500" />
          <span>Font Chữ & Màu Chữ</span>
        </h4>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Bộ Font Chữ
          </label>
          <select
            value={theme.fontFamily}
            onChange={(e) => update({ fontFamily: e.target.value as any })}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Màu Tiêu đề chính
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.textColor}
                onChange={(e) => update({ textColor: e.target.value })}
                className="w-8 h-8 rounded-xl cursor-pointer border"
              />
              <input
                type="text"
                value={theme.textColor}
                onChange={(e) => update({ textColor: e.target.value })}
                className="w-full px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Màu Đoạn Bio
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.bioTextColor || theme.textColor}
                onChange={(e) => update({ bioTextColor: e.target.value })}
                className="w-8 h-8 rounded-xl cursor-pointer border"
              />
              <input
                type="text"
                value={theme.bioTextColor || theme.textColor}
                onChange={(e) => update({ bioTextColor: e.target.value })}
                className="w-full px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Button & Card Shape Customizer */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <Square size={16} className="text-cyan-500" />
          <span>Kiểu Dáng Thẻ & Nút Bấm (Cards)</span>
        </h4>

        {/* Card Radius */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Độ Bo Góc (Border Radius)
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'none', label: 'Vuông' },
              { id: 'sm', label: 'Nhẹ' },
              { id: 'md', label: 'Vừa' },
              { id: 'xl', label: 'Tròn' },
              { id: 'full', label: 'Pill' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => update({ cardRadius: r.id as any })}
                className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  theme.cardRadius === r.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card Shadow & Effect */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Hiệu ứng đổ bóng (Shadow)
            </label>
            <select
              value={theme.cardShadow}
              onChange={(e) => update({ cardShadow: e.target.value as any })}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="soft">Mềm mại (Soft)</option>
              <option value="glass">Kính mờ (Glassmorphic)</option>
              <option value="hard">Retro cứng (Hard Pop)</option>
              <option value="glow">Phát sáng Neon (Glow)</option>
              <option value="none">Phẳng (Flat)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Hiệu ứng Di chuột (Hover)
            </label>
            <select
              value={theme.cardHoverEffect}
              onChange={(e) => update({ cardHoverEffect: e.target.value as any })}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="lift">Nâng lên (Lift)</option>
              <option value="scale">Phóng to nhẹ (Scale)</option>
              <option value="glow">Phát sáng (Glow)</option>
              <option value="none">Không hiệu ứng</option>
            </select>
          </div>
        </div>

        {/* Avatar Shape */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Hình dáng Avatar
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'circle', label: 'Tròn' },
              { id: 'squircle', label: 'Squircle' },
              { id: 'rounded', label: 'Bo vuông' },
              { id: 'hexagon', label: 'Lục giác' },
            ].map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => update({ avatarShape: shape.id as any })}
                className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  theme.avatarShape === shape.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color & Card Background */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Màu điểm nhấn (Accent)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.accentColor}
                onChange={(e) => update({ accentColor: e.target.value })}
                className="w-8 h-8 rounded-xl cursor-pointer border"
              />
              <input
                type="text"
                value={theme.accentColor}
                onChange={(e) => update({ accentColor: e.target.value })}
                className="w-full px-2 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Màu nền thẻ (Card Bg)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={theme.cardBg}
                onChange={(e) => update({ cardBg: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border rounded-xl font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
