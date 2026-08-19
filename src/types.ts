export type BlockType = 
  | 'link' 
  | 'gallery' 
  | 'article' 
  | 'product' 
  | 'embed' 
  | 'contact_form' 
  | 'bank_qr' 
  | 'text_banner' 
  | 'divider';

export interface BaseBlock {
  id: string;
  type: BlockType;
  enabled: boolean;
  order: number;
}

export interface LinkBlock extends BaseBlock {
  type: 'link';
  title: string;
  url: string;
  subtitle?: string;
  iconName?: string;
  customIconUrl?: string;
  badge?: string; // e.g. "HOT", "NEW", "50% OFF"
  animation?: 'none' | 'pulse' | 'bounce' | 'shake' | 'glow';
  clickCount: number;
  highlight?: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  linkUrl?: string;
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  title?: string;
  layout: 'grid' | 'carousel' | 'slider';
  images: GalleryImage[];
}

export interface ArticleBlock extends BaseBlock {
  type: 'article';
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  date?: string;
  readTime?: string;
  author?: string;
}

export interface ProductBlock extends BaseBlock {
  type: 'product';
  title: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string; // e.g. "₫", "$", "đ"
  imageUrl: string;
  buyUrl: string;
  badge?: string;
  inStock: boolean;
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed';
  embedType: 'youtube' | 'spotify' | 'tiktok' | 'audio';
  url: string;
  title?: string;
}

export interface ContactFormBlock extends BaseBlock {
  type: 'contact_form';
  title: string;
  subtitle?: string;
  buttonText: string;
  requirePhone: boolean;
  requireEmail: boolean;
  successMessage: string;
  // Cấu hình tài khoản chủ nhận tin nhắn (Bắt buộc cho người làm web, ẩn hoàn toàn trên giao diện Bio công khai)
  recipientAccount: string; // Email hoặc Username tài khoản chủ nhận thông báo (VD: admin@domain.com, vadut74@gmail.com)
  recipientPhone?: string; // Số điện thoại / Zalo chủ nhận thông báo nhanh (tùy chọn)
  recipientRole?: string; // Vai trò người nhận (VD: Chủ sở hữu Bio, Quản lý Booking, CSKH)
  notificationMethod?: 'email' | 'in_app' | 'both'; // Phương thức nhận thông báo
}

export interface BankQRBlock extends BaseBlock {
  type: 'bank_qr';
  bankName: string;
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  amount?: number;
  note?: string;
  qrImageUrl?: string;
}

export interface TextBannerBlock extends BaseBlock {
  type: 'text_banner';
  text: string;
  style: 'quote' | 'marquee' | 'notice' | 'heading';
  icon?: string;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  style: 'line' | 'dots' | 'wave' | 'space';
}

export type BioBlock = 
  | LinkBlock 
  | GalleryBlock 
  | ArticleBlock 
  | ProductBlock 
  | EmbedBlock 
  | ContactFormBlock 
  | BankQRBlock 
  | TextBannerBlock 
  | DividerBlock;

export interface SocialLink {
  id: string;
  platform: 
    | 'facebook' 
    | 'tiktok' 
    | 'instagram' 
    | 'youtube' 
    | 'zalo' 
    | 'telegram' 
    | 'github' 
    | 'linkedin' 
    | 'shopee' 
    | 'lazada' 
    | 'spotify' 
    | 'twitter' 
    | 'whatsapp' 
    | 'threads' 
    | 'email' 
    | 'phone' 
    | 'website';
  url: string;
  label?: string;
  enabled: boolean;
}

export interface BioTheme {
  id: string;
  name: string;
  backgroundType: 'color' | 'gradient' | 'image' | 'mesh' | 'animated';
  backgroundColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  bgImageUrl?: string;
  fontFamily: 'Inter' | 'Plus Jakarta Sans' | 'Playfair Display' | 'Outfit' | 'Space Grotesk' | 'Syne' | 'Be Vietnam Pro';
  textColor: string;
  bioTextColor: string;
  cardBg: string;
  cardTextColor: string;
  cardBorder: string;
  cardRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  cardShadow: 'none' | 'soft' | 'hard' | 'glow' | 'glass';
  cardHoverEffect: 'none' | 'scale' | 'lift' | 'glow';
  avatarShape: 'circle' | 'squircle' | 'rounded' | 'hexagon';
  accentColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
}

export interface BioLead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'resolved';
  recipientAccount?: string; // Tài khoản chủ tiếp nhận tin nhắn này
  recipientRole?: string; // Vai trò tiếp nhận
}

export interface BioStats {
  views: number;
  clicks: number;
  leadsCount: number;
  dailyViews: { date: string; views: number; clicks: number }[];
  linkClicks: { linkId: string; title: string; clicks: number }[];
}

export interface BioProfile {
  id: string;
  ownerId?: string;
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  bannerUrl?: string;
  location?: string;
  pronouns?: string;
  statusPill?: string; // e.g. "🟢 Đang nhận dự án mới"
  verified: boolean;
  theme: BioTheme;
  socialLinks: SocialLink[];
  blocks: BioBlock[];
  stats: BioStats;
  leads: BioLead[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
