import React, { useState } from 'react';
import { 
  Plus, 
  Layers, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Link as LinkIcon, 
  ShoppingBag, 
  Image as ImageIcon, 
  Video, 
  BookOpen, 
  Send, 
  QrCode, 
  MessageSquare, 
  Wand2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UploadCloud,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  BioBlock, 
  BlockType, 
  LinkBlock, 
  ProductBlock, 
  GalleryBlock, 
  ArticleBlock, 
  EmbedBlock, 
  ContactFormBlock, 
  BankQRBlock, 
  TextBannerBlock,
  GalleryImage
} from '../types';
import { ImageUploader } from './ImageUploader';

interface BlockEditorProps {
  blocks: BioBlock[];
  onChange: (blocks: BioBlock[]) => void;
}

const BLOCK_TYPES_CONFIG: {
  type: BlockType;
  name: string;
  desc: string;
  icon: any;
  color: string;
}[] = [
  { type: 'link', name: 'Nút Liên Kết (Link)', desc: 'Nút bấm dẫn tới website, shopee, khoá học, tài liệu', icon: LinkIcon, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
  { type: 'product', name: 'Sản Phẩm (Shop)', desc: 'Thẻ sản phẩm có ảnh, giá tiền, nhãn giảm giá & nút mua', icon: ShoppingBag, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
  { type: 'gallery', name: 'Bộ Sưu Tập Ảnh (Gallery)', desc: 'Tải ảnh từ máy tính/điện thoại, lookbook, portfolio dạng lưới', icon: ImageIcon, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
  { type: 'embed', name: 'Video / Nhạc Nhúng (Embed)', desc: 'Phát video YouTube hoặc bài hát Spotify trực tiếp trên Bio', icon: Video, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
  { type: 'contact_form', name: 'Form Đặt Lịch / Liên Hệ', desc: 'Thu thập thông tin khách hàng, booking, lời nhắn tự động', icon: Send, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
  { type: 'bank_qr', name: 'Tài Khoản & VietQR', desc: 'Hiện thông tin số tài khoản ngân hàng & mã QR thanh toán nhanh', icon: QrCode, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' },
  { type: 'article', name: 'Bài Viết / Tin Nổi Bật', desc: 'Bài viết mini kèm ảnh bìa từ máy và cửa sổ đọc bài chi tiết', icon: BookOpen, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
  { type: 'text_banner', name: 'Thông Báo / Trích Dẫn', desc: 'Khối văn bản, thông báo ưu đãi hoặc câu châm ngôn', icon: MessageSquare, color: 'text-zinc-500 bg-zinc-50 dark:bg-zinc-800' },
];

export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [enhancingLinkId, setEnhancingLinkId] = useState<string | null>(null);

  // Add new block
  const handleAddBlock = (type: BlockType) => {
    const newId = `blk-${Date.now()}`;
    const nextOrder = blocks.length + 1;
    let newBlock: BioBlock;

    switch (type) {
      case 'link':
        newBlock = {
          id: newId,
          type: 'link',
          enabled: true,
          order: nextOrder,
          title: '👉 Khám Phá Thêm Tại Đây',
          subtitle: 'Nhấn để xem thông tin chi tiết',
          url: 'https://',
          badge: 'MỚI ✨',
          animation: 'none',
          clickCount: 0,
        };
        break;
      case 'product':
        newBlock = {
          id: newId,
          type: 'product',
          enabled: true,
          order: nextOrder,
          title: 'Tên sản phẩm nổi bật',
          description: 'Mô tả ngắn gọn về tính năng và ưu điểm vượt trội.',
          price: 250000,
          originalPrice: 350000,
          currency: '₫',
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
          buyUrl: 'https://shopee.vn',
          badge: 'GIẢM 30%',
          inStock: true,
        };
        break;
      case 'gallery':
        newBlock = {
          id: newId,
          type: 'gallery',
          enabled: true,
          order: nextOrder,
          title: '📸 Bộ ảnh nổi bật',
          layout: 'grid',
          images: [
            { id: 'img-1', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80', caption: 'Ảnh 1' },
            { id: 'img-2', url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop&q=80', caption: 'Ảnh 2' },
          ],
        };
        break;
      case 'embed':
        newBlock = {
          id: newId,
          type: 'embed',
          enabled: true,
          order: nextOrder,
          embedType: 'youtube',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: '🎬 Video YouTube giới thiệu',
        };
        break;
      case 'contact_form':
        newBlock = {
          id: newId,
          type: 'contact_form',
          enabled: true,
          order: nextOrder,
          title: '📩 Liên Hệ Hợp Tác & Booking',
          subtitle: 'Phản hồi trong 24h',
          buttonText: 'Gửi yêu cầu ngay',
          requirePhone: true,
          requireEmail: true,
          successMessage: 'Cảm ơn bạn! Chúng mình đã nhận được thông tin.',
          recipientAccount: 'vadut74@gmail.com',
          recipientPhone: '',
          recipientRole: 'Chủ sở hữu Bio',
          notificationMethod: 'both',
        };
        break;
      case 'bank_qr':
        newBlock = {
          id: newId,
          type: 'bank_qr',
          enabled: true,
          order: nextOrder,
          bankName: 'MB Bank',
          accountNumber: '999988882026',
          accountName: 'NGUYEN VAN A',
          note: 'Ủng hộ / Thanh toán',
          qrImageUrl: '',
        };
        break;
      case 'article':
        newBlock = {
          id: newId,
          type: 'article',
          enabled: true,
          order: nextOrder,
          title: 'Chia sẻ kinh nghiệm làm việc & phát triển bản thân',
          excerpt: 'Tóm tắt bài viết ngắn gọn nhằm thu hút người đọc bấm xem toàn bộ.',
          content: 'Nội dung chi tiết của bài viết được hiển thị khi người dùng bấm vào khối này...',
          coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
          readTime: '3 phút đọc',
          date: 'Hôm nay',
        };
        break;
      case 'text_banner':
      default:
        newBlock = {
          id: newId,
          type: 'text_banner',
          enabled: true,
          order: nextOrder,
          text: '✨ Thông báo: Đang có chương trình ưu đãi đặc biệt trong tuần này!',
          style: 'notice',
        };
        break;
    }

    onChange([...blocks, newBlock]);
    setExpandedBlockId(newId);
    setShowAddModal(false);
  };

  // Reorder
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const updated = [...blocks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Fix orders
    updated.forEach((b, i) => {
      b.order = i + 1;
    });

    onChange(updated);
  };

  // Delete
  const removeBlock = (id: string) => {
    const updated = blocks.filter((b) => b.id !== id);
    updated.forEach((b, i) => {
      b.order = i + 1;
    });
    onChange(updated);
  };

  // Toggle enable
  const toggleBlockEnable = (id: string) => {
    onChange(
      blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b))
    );
  };

  // Update specific block field
  const updateBlock = (id: string, patch: Partial<BioBlock>) => {
    onChange(
      blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as BioBlock) : b))
    );
  };

  // AI Link CTA Enhancer
  const enhanceLinkWithAI = async (link: LinkBlock) => {
    setEnhancingLinkId(link.id);
    try {
      const res = await fetch('/api/ai/enhance-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawTitle: link.title, url: link.url }),
      });
      const data = await res.json();
      if (data.title) {
        updateBlock(link.id, {
          title: data.title,
          subtitle: data.subtitle || link.subtitle,
          badge: data.badge || link.badge,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEnhancingLinkId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Layers size={16} className="text-blue-500" />
            <span>Nội dung & Các Khối (Blocks) ({blocks.length})</span>
          </h4>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Tải ảnh từ thiết bị, chèn sản phẩm, liên kết và quản lý thứ tự hiển thị.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Plus size={15} />
          <span>Thêm khối mới</span>
        </button>
      </div>

      {/* Add Block Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Chọn loại khối muốn thêm
                </h3>
                <p className="text-xs text-zinc-500">
                  Tùy chỉnh đa dạng mục đích: bán hàng, kết nối, portfolio
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {BLOCK_TYPES_CONFIG.map((b) => {
                const IconComponent = b.icon;
                return (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => handleAddBlock(b.type)}
                    className="p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all flex flex-col gap-2 group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${b.color}`}>
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 leading-tight mt-0.5 line-clamp-2">
                        {b.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Block List */}
      <div className="space-y-3">
        {blocks.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-6 space-y-3">
            <Layers size={32} className="text-zinc-400 mx-auto" />
            <p className="text-xs text-zinc-500">Chưa có khối nào trong trang Bio của bạn.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow"
            >
              + Thêm liên kết đầu tiên
            </button>
          </div>
        ) : (
          blocks.map((block, index) => {
            const isExpanded = expandedBlockId === block.id;
            const config = BLOCK_TYPES_CONFIG.find((c) => c.type === block.type) || BLOCK_TYPES_CONFIG[0];
            const IconComponent = config.icon;

            return (
              <div
                key={block.id}
                className={`bg-white dark:bg-zinc-900 border rounded-2xl transition-all shadow-sm ${
                  block.enabled
                    ? 'border-zinc-200 dark:border-zinc-800'
                    : 'border-dashed border-zinc-300 dark:border-zinc-800 opacity-60'
                }`}
              >
                {/* Block Header Row */}
                <div className="p-3.5 flex items-center justify-between gap-2 select-none">
                  <div 
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                  >
                    <div className={`p-2 rounded-xl flex-shrink-0 ${config.color}`}>
                      <IconComponent size={15} />
                    </div>

                    <div className="truncate">
                      <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 truncate">
                        <span>{('title' in block && block.title) || config.name}</span>
                        {'clickCount' in block && block.clickCount > 0 && (
                          <span className="px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-[10px] rounded-md font-mono text-zinc-500">
                            {block.clickCount} clicks
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-400 capitalize block truncate">
                        {config.name}
                        {block.type === 'contact_form' && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold inline-flex items-center gap-1 ${
                            (block as ContactFormBlock).recipientAccount
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse'
                          }`}>
                            <Lock size={10} />
                            {(block as ContactFormBlock).recipientAccount ? `Tài khoản nhận: ${(block as ContactFormBlock).recipientAccount}` : '⚠️ Chưa có TK chủ'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Reorder, Toggle, Delete, Expand) */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, 'up')}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Chuyển lên trên"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, 'down')}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 disabled:opacity-30 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Chuyển xuống dưới"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleBlockEnable(block.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title={block.enabled ? 'Ẩn khối' : 'Hiện khối'}
                    >
                      {block.enabled ? <Eye size={14} className="text-emerald-500" /> : <EyeOff size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Xóa khối"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Form Settings */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3.5 mt-2">
                    
                    {/* LINK BLOCK EDITING */}
                    {block.type === 'link' && (() => {
                      const link = block as LinkBlock;
                      return (
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              Tiêu đề nút bấm *
                            </label>
                            <button
                              type="button"
                              onClick={() => enhanceLinkWithAI(link)}
                              disabled={enhancingLinkId === link.id}
                              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold"
                            >
                              <Wand2 size={12} />
                              <span>{enhancingLinkId === link.id ? 'AI đang tối ưu...' : '✨ AI tối ưu CTA'}</span>
                            </button>
                          </div>

                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateBlock(link.id, { title: e.target.value })}
                            placeholder="VD: 🚀 Đăng ký khoá học ngay hôm nay"
                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Mô tả phụ (Subtitle)
                            </label>
                            <input
                              type="text"
                              value={link.subtitle || ''}
                              onChange={(e) => updateBlock(link.id, { subtitle: e.target.value })}
                              placeholder="VD: Giảm ngay 30% khi đăng ký trong tuần này"
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Đường dẫn liên kết (URL) *
                            </label>
                            <input
                              type="text"
                              value={link.url}
                              onChange={(e) => updateBlock(link.id, { url: e.target.value })}
                              placeholder="https://example.com"
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Huy hiệu nổi bật (Badge)
                              </label>
                              <input
                                type="text"
                                value={link.badge || ''}
                                onChange={(e) => updateBlock(link.id, { badge: e.target.value })}
                                placeholder="VD: HOT 🔥, FREE, 50% OFF"
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Hiệu ứng chuyển động
                              </label>
                              <select
                                value={link.animation || 'none'}
                                onChange={(e) => updateBlock(link.id, { animation: e.target.value as any })}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="none">Không hiệu ứng</option>
                                <option value="pulse">Nhịp đập (Pulse)</option>
                                <option value="bounce">Nhảy nhót (Bounce)</option>
                                <option value="shake">Rung lắc (Shake)</option>
                                <option value="glow">Phát sáng (Glow)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <ImageUploader
                              label="Icon / Hình thu nhỏ tùy chỉnh"
                              value={link.customIconUrl || ''}
                              onChange={(customIconUrl) => updateBlock(link.id, { customIconUrl: customIconUrl || undefined })}
                              aspectRatio="square"
                              maxWidth={200}
                              maxHeight={200}
                              placeholder="Dán link ảnh icon nhỏ hoặc tải từ máy..."
                            />
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id={`hl-${link.id}`}
                              checked={!!link.highlight}
                              onChange={(e) => updateBlock(link.id, { highlight: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`hl-${link.id}`} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                              Tô màu nổi bật khối này (Dùng màu Accent của Theme)
                            </label>
                          </div>
                        </div>
                      );
                    })()}

                    {/* PRODUCT BLOCK EDITING */}
                    {block.type === 'product' && (() => {
                      const prod = block as ProductBlock;
                      return (
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Tên sản phẩm *
                            </label>
                            <input
                              type="text"
                              value={prod.title}
                              onChange={(e) => updateBlock(prod.id, { title: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Mô tả sản phẩm
                            </label>
                            <textarea
                              rows={2}
                              value={prod.description || ''}
                              onChange={(e) => updateBlock(prod.id, { description: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Giá bán (VNĐ) *
                              </label>
                              <input
                                type="number"
                                value={prod.price}
                                onChange={(e) => updateBlock(prod.id, { price: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Giá gốc (gạch ngang)
                              </label>
                              <input
                                type="number"
                                value={prod.originalPrice || ''}
                                onChange={(e) => updateBlock(prod.id, { originalPrice: Number(e.target.value) })}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>
                          </div>

                          {/* Product Image Uploader */}
                          <div>
                            <ImageUploader
                              label="Ảnh sản phẩm (Tải từ thiết bị hoặc dán URL)"
                              value={prod.imageUrl}
                              onChange={(imageUrl) => updateBlock(prod.id, { imageUrl })}
                              aspectRatio="square"
                              maxWidth={800}
                              maxHeight={800}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Huy hiệu (Badge)
                              </label>
                              <input
                                type="text"
                                value={prod.badge || ''}
                                onChange={(e) => updateBlock(prod.id, { badge: e.target.value })}
                                placeholder="BÁN CHẠY 🔥"
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>
                            <div className="flex items-center pt-5">
                              <label className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={prod.inStock}
                                  onChange={(e) => updateBlock(prod.id, { inStock: e.target.checked })}
                                  className="rounded text-blue-600"
                                />
                                <span>Còn hàng (In Stock)</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Link mua hàng (Shopee, Lazada, TikTok Shop, Web) *
                            </label>
                            <input
                              type="text"
                              value={prod.buyUrl}
                              onChange={(e) => updateBlock(prod.id, { buyUrl: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* GALLERY BLOCK EDITING (PHOTO UPLOADER FROM DEVICE) */}
                    {block.type === 'gallery' && (() => {
                      const gal = block as GalleryBlock;
                      return (
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Tiêu đề album
                              </label>
                              <input
                                type="text"
                                value={gal.title || ''}
                                onChange={(e) => updateBlock(gal.id, { title: e.target.value })}
                                placeholder="📸 Góc làm việc / Portfolio"
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Bố cục hiển thị
                              </label>
                              <select
                                value={gal.layout}
                                onChange={(e) => updateBlock(gal.id, { layout: e.target.value as any })}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              >
                                <option value="grid">Lưới 2 cột (Grid)</option>
                                <option value="carousel">Trượt ngang (Carousel)</option>
                              </select>
                            </div>
                          </div>

                          {/* Upload New Image into Gallery */}
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                              + Tải thêm ảnh vào Album từ thiết bị:
                            </span>
                            <ImageUploader
                              value=""
                              onChange={(newImgUrl) => {
                                if (newImgUrl) {
                                  const newImage: GalleryImage = {
                                    id: `img-${Date.now()}`,
                                    url: newImgUrl,
                                    caption: '',
                                  };
                                  updateBlock(gal.id, {
                                    images: [...gal.images, newImage],
                                  });
                                }
                              }}
                              aspectRatio="square"
                              maxWidth={900}
                              maxHeight={900}
                            />
                          </div>

                          {/* List of current gallery images */}
                          <div className="space-y-2">
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              Danh sách ảnh trong Album ({gal.images.length})
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                              {gal.images.map((img, idx) => (
                                <div key={img.id || idx} className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2 relative group">
                                  <div className="aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border">
                                    <img src={img.url} alt="gal" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                  <input
                                    type="text"
                                    value={img.caption || ''}
                                    onChange={(e) => {
                                      const newImages = [...gal.images];
                                      newImages[idx] = { ...newImages[idx], caption: e.target.value };
                                      updateBlock(gal.id, { images: newImages });
                                    }}
                                    placeholder="Chú thích ảnh..."
                                    className="w-full px-2 py-1 text-[11px] bg-zinc-50 dark:bg-zinc-900 border rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newImages = gal.images.filter((_, i) => i !== idx);
                                      updateBlock(gal.id, { images: newImages });
                                    }}
                                    className="absolute top-3 right-3 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-lg transition-colors"
                                    title="Xóa ảnh này"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* ARTICLE BLOCK EDITING */}
                    {block.type === 'article' && (() => {
                      const art = block as ArticleBlock;
                      return (
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Tiêu đề bài viết *
                            </label>
                            <input
                              type="text"
                              value={art.title}
                              onChange={(e) => updateBlock(art.id, { title: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                            />
                          </div>

                          <div>
                            <ImageUploader
                              label="Ảnh bìa bài viết (Tải từ thiết bị hoặc dán URL)"
                              value={art.coverImage || ''}
                              onChange={(coverImage) => updateBlock(art.id, { coverImage: coverImage || undefined })}
                              aspectRatio="banner"
                              maxWidth={1000}
                              maxHeight={600}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Đoạn tóm tắt (Excerpt)
                            </label>
                            <textarea
                              rows={2}
                              value={art.excerpt}
                              onChange={(e) => updateBlock(art.id, { excerpt: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Nội dung đầy đủ của bài viết
                            </label>
                            <textarea
                              rows={5}
                              value={art.content}
                              onChange={(e) => updateBlock(art.id, { content: e.target.value })}
                              placeholder="Nhập nội dung chia sẻ chi tiết..."
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* EMBED BLOCK EDITING */}
                    {block.type === 'embed' && (() => {
                      const emb = block as EmbedBlock;
                      return (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Loại nhúng
                              </label>
                              <select
                                value={emb.embedType}
                                onChange={(e) => updateBlock(emb.id, { embedType: e.target.value as any })}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              >
                                <option value="youtube">Video YouTube</option>
                                <option value="spotify">Nhạc Spotify</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Tiêu đề nhúng
                              </label>
                              <input
                                type="text"
                                value={emb.title || ''}
                                onChange={(e) => updateBlock(emb.id, { title: e.target.value })}
                                placeholder="VD: Video hướng dẫn mới"
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              URL Video / Bài hát *
                            </label>
                            <input
                              type="text"
                              value={emb.url}
                              onChange={(e) => updateBlock(emb.id, { url: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* CONTACT FORM BLOCK EDITING */}
                    {block.type === 'contact_form' && (() => {
                      const form = block as ContactFormBlock;
                      return (
                        <div className="space-y-3 pt-2">
                          {/* SECTION: TÀI KHOẢN CHỦ TIẾP NHẬN TIN NHẮN (BẮT BUỘC CHO NGƯỜI LÀM WEB) */}
                          <div className="p-3.5 bg-gradient-to-br from-amber-500/10 via-blue-500/5 to-indigo-500/10 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-sm">
                                  <ShieldCheck size={16} />
                                </div>
                                <div>
                                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                    <span>Tài khoản chủ nhận tin nhắn</span>
                                    <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-extrabold rounded uppercase tracking-wider">
                                      Bắt buộc
                                    </span>
                                  </h5>
                                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                    🔒 Bảo mật riêng cho người làm web • Ẩn hoàn toàn trên giao diện Bio của khách
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Recipient Account / Email */}
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                  <Mail size={12} className="text-blue-500" />
                                  <span>Email / Tài khoản chủ nhận tin nhắn *</span>
                                </label>
                                {!form.recipientAccount && (
                                  <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                    <AlertCircle size={10} />
                                    <span>Chưa có tài khoản</span>
                                  </span>
                                )}
                              </div>
                              <input
                                type="text"
                                required
                                value={form.recipientAccount || ''}
                                onChange={(e) => updateBlock(form.id, { recipientAccount: e.target.value })}
                                placeholder="VD: vadut74@gmail.com hoặc admin@domain.com"
                                className={`w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border rounded-xl focus:outline-none focus:ring-2 font-medium ${
                                  !form.recipientAccount
                                    ? 'border-rose-500 focus:ring-rose-500'
                                    : 'border-zinc-300 dark:border-zinc-700 focus:ring-blue-500'
                                }`}
                              />
                              {!form.recipientAccount ? (
                                <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                                  <AlertCircle size={11} />
                                  <span>Bắt buộc phải nhập tài khoản chủ để nhận tin khi khách liên hệ qua Form này!</span>
                                </p>
                              ) : (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                                  <CheckCircle2 size={11} />
                                  <span>Tin nhắn từ khách sẽ được chuyển về tài khoản: <b>{form.recipientAccount}</b></span>
                                </p>
                              )}
                            </div>

                            {/* Role & Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                  Vai trò người phụ trách
                                </label>
                                <input
                                  type="text"
                                  value={form.recipientRole || ''}
                                  onChange={(e) => updateBlock(form.id, { recipientRole: e.target.value })}
                                  placeholder="VD: Chủ sở hữu Bio, Quản lý Booking"
                                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1">
                                  <Phone size={11} className="text-emerald-500" />
                                  <span>SĐT / Zalo chủ (Tùy chọn)</span>
                                </label>
                                <input
                                  type="text"
                                  value={form.recipientPhone || ''}
                                  onChange={(e) => updateBlock(form.id, { recipientPhone: e.target.value })}
                                  placeholder="VD: 0988776655"
                                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                />
                              </div>
                            </div>

                            {/* Notification Method */}
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Phương thức tiếp nhận thông báo
                              </label>
                              <select
                                value={form.notificationMethod || 'both'}
                                onChange={(e) => updateBlock(form.id, { notificationMethod: e.target.value as any })}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              >
                                <option value="both">Hộp thư Email & Tab Quản lý Khách hàng (CRM)</option>
                                <option value="in_app">Chỉ lưu vào Tab Quản lý Khách hàng (CRM)</option>
                                <option value="email">Chuyển tiếp Email thông báo ngay lập tức</option>
                              </select>
                            </div>
                          </div>

                          {/* Visitor Facing Form UI Settings */}
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                            <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                              Nội dung hiển thị trên Form khách hàng
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                  Tiêu đề form *
                                </label>
                                <input
                                  type="text"
                                  value={form.title}
                                  onChange={(e) => updateBlock(form.id, { title: e.target.value })}
                                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                  Nút gửi
                                </label>
                                <input
                                  type="text"
                                  value={form.buttonText}
                                  onChange={(e) => updateBlock(form.id, { buttonText: e.target.value })}
                                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Mô tả phụ
                              </label>
                              <input
                                type="text"
                                value={form.subtitle || ''}
                                onChange={(e) => updateBlock(form.id, { subtitle: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Thông báo gửi thành công
                              </label>
                              <input
                                type="text"
                                value={form.successMessage || ''}
                                onChange={(e) => updateBlock(form.id, { successMessage: e.target.value })}
                                placeholder="VD: Cảm ơn bạn! Chúng mình đã nhận được thông tin."
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>

                            <div className="flex gap-4 pt-1">
                              <label className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                                <input
                                  type="checkbox"
                                  checked={form.requireEmail}
                                  onChange={(e) => updateBlock(form.id, { requireEmail: e.target.checked })}
                                  className="rounded text-blue-600"
                                />
                                <span>Hỏi Email khách hàng</span>
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                                <input
                                  type="checkbox"
                                  checked={form.requirePhone}
                                  onChange={(e) => updateBlock(form.id, { requirePhone: e.target.checked })}
                                  className="rounded text-blue-600"
                                />
                                <span>Hỏi SĐT / Zalo khách</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* BANK QR BLOCK EDITING */}
                    {block.type === 'bank_qr' && (() => {
                      const bank = block as BankQRBlock;
                      return (
                        <div className="space-y-3 pt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Tên ngân hàng
                              </label>
                              <input
                                type="text"
                                value={bank.bankName}
                                onChange={(e) => updateBlock(bank.id, { bankName: e.target.value })}
                                placeholder="MB Bank, Vietcombank, TPBank..."
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Số tài khoản *
                              </label>
                              <input
                                type="text"
                                value={bank.accountNumber}
                                onChange={(e) => updateBlock(bank.id, { accountNumber: e.target.value })}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Tên chủ tài khoản *
                              </label>
                              <input
                                type="text"
                                value={bank.accountName}
                                onChange={(e) => updateBlock(bank.id, { accountName: e.target.value.toUpperCase() })}
                                placeholder="NGUYEN VAN A"
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                Ghi chú chuyển khoản
                              </label>
                              <input
                                type="text"
                                value={bank.note || ''}
                                onChange={(e) => updateBlock(bank.id, { note: e.target.value })}
                                placeholder="Donate / Ung ho"
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                              />
                            </div>
                          </div>

                          <div>
                            <ImageUploader
                              label="Ảnh mã QR Ngân hàng (Tải ảnh từ máy hoặc để hệ thống tự tạo VietQR)"
                              value={bank.qrImageUrl || ''}
                              onChange={(qrImageUrl) => updateBlock(bank.id, { qrImageUrl: qrImageUrl || undefined })}
                              aspectRatio="square"
                              maxWidth={600}
                              maxHeight={600}
                              placeholder="Dán URL ảnh QR hoặc tải từ thiết bị..."
                            />
                          </div>
                        </div>
                      );
                    })()}

                    {/* TEXT BANNER BLOCK EDITING */}
                    {block.type === 'text_banner' && (() => {
                      const tb = block as TextBannerBlock;
                      return (
                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                              Nội dung thông báo / Trích dẫn *
                            </label>
                            <textarea
                              rows={2}
                              value={tb.text}
                              onChange={(e) => updateBlock(tb.id, { text: e.target.value })}
                              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl resize-none"
                            />
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
