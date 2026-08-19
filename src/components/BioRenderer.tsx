import React, { useState } from 'react';
import { 
  CheckCircle, 
  MapPin, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Play, 
  ShoppingBag, 
  Eye, 
  ChevronRight,
  BookOpen,
  QrCode
} from 'lucide-react';
import { BioProfile, BioBlock, LinkBlock, ProductBlock, GalleryBlock, ArticleBlock, EmbedBlock, ContactFormBlock, BankQRBlock, TextBannerBlock } from '../types';
import { renderSocialIcon } from '../utils/socialIcons';

interface BioRendererProps {
  profile: BioProfile;
  isPublic?: boolean;
  onLinkClick?: (linkId: string, title: string) => void;
}

export const BioRenderer: React.FC<BioRendererProps> = ({ profile, isPublic = false, onLinkClick }) => {
  const { theme, socialLinks, blocks } = profile;
  
  // State for interactive blocks
  const [copiedBank, setCopiedBank] = useState(false);
  const [activeArticle, setActiveArticle] = useState<ArticleBlock | null>(null);
  const [formSubmitted, setFormSubmitted] = useState<Record<string, boolean>>({});
  const [formLoading, setFormLoading] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, { name: string; email: string; phone: string; message: string }>>({});

  // Background styling
  const getBackgroundStyle = () => {
    switch (theme.backgroundType) {
      case 'gradient':
        return {
          background: `linear-gradient(${theme.gradientAngle || 135}deg, ${theme.gradientStart}, ${theme.gradientEnd})`,
        };
      case 'image':
        return {
          backgroundImage: `url(${theme.bgImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'mesh':
        return {
          background: `radial-gradient(at 0% 0%, ${theme.gradientStart} 0px, transparent 50%), radial-gradient(at 100% 100%, ${theme.gradientEnd} 0px, transparent 50%), ${theme.backgroundColor}`,
        };
      case 'color':
      default:
        return {
          backgroundColor: theme.backgroundColor,
        };
    }
  };

  // Card corner radius
  const getRadiusClass = () => {
    switch (theme.cardRadius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-md';
      case 'md': return 'rounded-xl';
      case 'lg': return 'rounded-2xl';
      case 'xl': return 'rounded-3xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-2xl';
    }
  };

  // Card shadow class
  const getShadowStyle = () => {
    switch (theme.cardShadow) {
      case 'soft':
        return 'shadow-md shadow-black/5 hover:shadow-lg transition-all duration-300';
      case 'hard':
        return 'border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all';
      case 'glow':
        return 'shadow-[0_0_15px_rgba(168,85,247,0.35)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all';
      case 'glass':
        return 'backdrop-blur-md shadow-lg border transition-all duration-300 hover:backdrop-blur-lg';
      case 'none':
      default:
        return 'transition-all duration-200';
    }
  };

  // Hover animation
  const getHoverClass = () => {
    switch (theme.cardHoverEffect) {
      case 'scale': return 'hover:scale-[1.02] active:scale-[0.98]';
      case 'lift': return 'hover:-translate-y-1 active:translate-y-0';
      case 'glow': return 'hover:brightness-110';
      default: return '';
    }
  };

  // Avatar shape
  const getAvatarShapeClass = () => {
    switch (theme.avatarShape) {
      case 'circle': return 'rounded-full';
      case 'squircle': return 'rounded-3xl';
      case 'rounded': return 'rounded-xl';
      case 'hexagon': return 'rounded-2xl rotate-3 hover:rotate-0 transition-transform';
      default: return 'rounded-full';
    }
  };

  // Handle external link click
  const handleLinkClick = (link: LinkBlock) => {
    if (onLinkClick) {
      onLinkClick(link.id, link.title);
    }
    if (isPublic) {
      fetch(`/api/bios/${profile.slug}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link.id, title: link.title }),
      }).catch(console.error);
    }
  };

  // Handle lead form submission
  const handleFormSubmit = async (block: ContactFormBlock, e: React.FormEvent) => {
    e.preventDefault();
    const data = formData[block.id] || { name: '', email: '', phone: '', message: '' };
    if (!data.name || !data.message) return;

    setFormLoading((prev) => ({ ...prev, [block.id]: true }));
    try {
      await fetch(`/api/bios/${profile.slug}/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          recipientAccount: block.recipientAccount || 'vadut74@gmail.com',
          recipientRole: block.recipientRole || 'Chủ sở hữu Bio',
        }),
      });
      setFormSubmitted((prev) => ({ ...prev, [block.id]: true }));
    } catch (err) {
      console.error(err);
    } finally {
      setFormLoading((prev) => ({ ...prev, [block.id]: false }));
    }
  };

  const copyBankInfo = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const enabledBlocks = blocks.filter((b) => b.enabled).sort((a, b) => a.order - b.order);
  const enabledSocials = socialLinks.filter((s) => s.enabled);

  return (
    <div 
      className="min-h-full w-full py-8 px-4 sm:px-6 transition-all duration-300 select-none flex flex-col justify-between"
      style={{
        ...getBackgroundStyle(),
        fontFamily: theme.fontFamily || 'Inter',
        color: theme.textColor,
      }}
    >
      {/* Bio Container Container */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
        
        {/* Banner (Optional) */}
        {profile.bannerUrl && (
          <div className="w-full h-32 rounded-2xl overflow-hidden shadow-inner mb-[-40px] z-0">
            <img 
              src={profile.bannerUrl} 
              alt="Banner" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-3 z-10 w-full pt-2">
          {/* Avatar with optional ring */}
          <div className="relative group">
            <div 
              className={`w-24 h-24 sm:w-28 sm:h-28 overflow-hidden shadow-xl border-4 ${getAvatarShapeClass()}`}
              style={{ borderColor: theme.accentColor || '#3b82f6' }}
            >
              <img 
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'} 
                alt={profile.displayName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {profile.verified && (
              <div 
                className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1 shadow-md"
                title="Đã xác thực"
              >
                <CheckCircle size={18} className="fill-blue-500 text-white" />
              </div>
            )}
          </div>

          {/* Status Pill (if present) */}
          {profile.statusPill && (
            <div 
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border shadow-sm backdrop-blur-sm"
              style={{
                backgroundColor: theme.badgeBgColor || 'rgba(255,255,255,0.85)',
                color: theme.badgeTextColor || '#1e293b',
                borderColor: theme.accentColor ? `${theme.accentColor}40` : 'transparent',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{profile.statusPill}</span>
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-1">
            <h1 
              className="text-xl sm:text-2xl font-bold tracking-tight"
              style={{ color: theme.textColor }}
            >
              {profile.displayName || 'Tên hiển thị'}
            </h1>
            
            {/* Pronouns or Location */}
            {(profile.pronouns || profile.location) && (
              <div className="flex items-center justify-center gap-3 text-xs opacity-75 font-medium">
                {profile.pronouns && <span>({profile.pronouns})</span>}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {profile.location}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bio Description */}
          {profile.bio && (
            <p 
              className="text-sm leading-relaxed max-w-sm px-2 font-normal"
              style={{ color: theme.bioTextColor || theme.textColor }}
            >
              {profile.bio}
            </p>
          )}

          {/* Social Icons Bar */}
          {enabledSocials.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-1">
              {enabledSocials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full backdrop-blur-md bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-all transform hover:scale-110 active:scale-95 shadow-sm"
                  style={{ color: theme.textColor }}
                  title={social.platform}
                  onClick={() => {
                    if (isPublic) {
                      fetch(`/api/bios/${profile.slug}/click`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ linkId: `social-${social.platform}`, title: `Social: ${social.platform}` }),
                      }).catch(console.error);
                    }
                  }}
                >
                  {renderSocialIcon(social.platform, 18)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Blocks Stream */}
        <div className="w-full space-y-3.5 pt-2">
          {enabledBlocks.map((block) => {
            // LINK BLOCK
            if (block.type === 'link') {
              const link = block as LinkBlock;
              const animClass = 
                link.animation === 'pulse' ? 'animate-pulse' :
                link.animation === 'bounce' ? 'animate-bounce' :
                link.animation === 'shake' ? 'animate-wiggle' :
                link.animation === 'glow' ? 'ring-2 ring-offset-2 ring-indigo-400' : '';

              return (
                <a
                  key={block.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(link)}
                  className={`group relative flex items-center justify-between p-4 w-full border ${getRadiusClass()} ${getShadowStyle()} ${getHoverClass()} ${animClass}`}
                  style={{
                    backgroundColor: link.highlight ? theme.accentColor : theme.cardBg,
                    color: link.highlight ? '#ffffff' : theme.cardTextColor,
                    borderColor: theme.cardBorder || 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                    {link.customIconUrl ? (
                      <img 
                        src={link.customIconUrl} 
                        alt="icon" 
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-black/5 dark:bg-white/10"
                        style={{ color: link.highlight ? '#ffffff' : theme.accentColor }}
                      >
                        <ExternalLink size={18} />
                      </div>
                    )}

                    <div className="flex flex-col text-left truncate">
                      <span className="font-semibold text-sm sm:text-base leading-tight truncate">
                        {link.title}
                      </span>
                      {link.subtitle && (
                        <span className="text-xs opacity-75 truncate mt-0.5 font-normal">
                          {link.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {link.badge && (
                      <span 
                        className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm"
                        style={{
                          backgroundColor: theme.badgeBgColor || '#f59e0b',
                          color: theme.badgeTextColor || '#000000',
                        }}
                      >
                        {link.badge}
                      </span>
                    )}
                    <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </a>
              );
            }

            // PRODUCT BLOCK
            if (block.type === 'product') {
              const prod = block as ProductBlock;
              return (
                <div
                  key={block.id}
                  className={`p-4 border ${getRadiusClass()} ${getShadowStyle()} flex flex-col gap-3`}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: theme.cardTextColor,
                    borderColor: theme.cardBorder || 'transparent',
                  }}
                >
                  <div className="flex gap-3.5 items-center">
                    <img 
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80'} 
                      alt={prod.title}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-black/5"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-sm leading-snug line-clamp-1">{prod.title}</h4>
                          {prod.badge && (
                            <span 
                              className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-rose-500 text-white flex-shrink-0"
                            >
                              {prod.badge}
                            </span>
                          )}
                        </div>
                        {prod.description && (
                          <p className="text-xs opacity-75 line-clamp-2">{prod.description}</p>
                        )}
                      </div>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                          {prod.price.toLocaleString('vi-VN')} {prod.currency}
                        </span>
                        {prod.originalPrice && prod.originalPrice > prod.price && (
                          <span className="text-xs opacity-50 line-through">
                            {prod.originalPrice.toLocaleString('vi-VN')} {prod.currency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={prod.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (isPublic) {
                        fetch(`/api/bios/${profile.slug}/click`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ linkId: prod.id, title: `Product: ${prod.title}` }),
                        }).catch(console.error);
                      }
                    }}
                    className={`w-full py-2.5 px-4 text-center font-bold text-xs sm:text-sm text-white rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2`}
                    style={{ backgroundColor: theme.accentColor || '#3b82f6' }}
                  >
                    <ShoppingBag size={16} />
                    <span>Mua ngay / Đặt hàng</span>
                  </a>
                </div>
              );
            }

            // GALLERY BLOCK
            if (block.type === 'gallery') {
              const gallery = block as GalleryBlock;
              return (
                <div 
                  key={block.id}
                  className={`p-4 border ${getRadiusClass()} ${getShadowStyle()} space-y-3`}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: theme.cardTextColor,
                    borderColor: theme.cardBorder || 'transparent',
                  }}
                >
                  {gallery.title && (
                    <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                      <span>{gallery.title}</span>
                    </h4>
                  )}
                  <div className={`grid ${gallery.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                    {gallery.images.map((img) => (
                      <div 
                        key={img.id}
                        className="relative group rounded-xl overflow-hidden aspect-square bg-black/5"
                      >
                        <img 
                          src={img.url} 
                          alt={img.caption || 'Gallery'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {img.caption && (
                          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-[11px] font-medium truncate">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // EMBED BLOCK (YouTube, Spotify)
            if (block.type === 'embed') {
              const embed = block as EmbedBlock;
              // Extract YouTube ID if applicable
              let ytId = '';
              if (embed.embedType === 'youtube' && embed.url) {
                const match = embed.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                ytId = match ? match[1] : '';
              }

              return (
                <div 
                  key={block.id}
                  className={`p-3.5 border overflow-hidden ${getRadiusClass()} ${getShadowStyle()} space-y-2`}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: theme.cardTextColor,
                    borderColor: theme.cardBorder || 'transparent',
                  }}
                >
                  {embed.title && (
                    <h4 className="font-bold text-xs sm:text-sm truncate px-1 flex items-center gap-1.5">
                      <Play size={14} className="text-red-500 fill-red-500" />
                      <span>{embed.title}</span>
                    </h4>
                  )}

                  {ytId ? (
                    <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={embed.title || 'YouTube Video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : embed.embedType === 'spotify' ? (
                    <div className="w-full rounded-xl overflow-hidden">
                      <iframe
                        src={embed.url.includes('embed') ? embed.url : embed.url.replace('open.spotify.com/', 'open.spotify.com/embed/')}
                        width="100%"
                        height="152"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        className="border-0 rounded-xl"
                      />
                    </div>
                  ) : (
                    <a
                      href={embed.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 text-xs text-center font-medium bg-black/5 dark:bg-white/10 rounded-xl"
                    >
                      Bấm để mở nội dung nhúng ({embed.embedType})
                    </a>
                  )}
                </div>
              );
            }

            // CONTACT FORM BLOCK
            if (block.type === 'contact_form') {
              const form = block as ContactFormBlock;
              const isDone = formSubmitted[form.id];
              const isLoading = formLoading[form.id];
              const curData = formData[form.id] || { name: '', email: '', phone: '', message: '' };

              return (
                <div 
                  key={block.id}
                  className={`p-4 border ${getRadiusClass()} ${getShadowStyle()} space-y-3`}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: theme.cardTextColor,
                    borderColor: theme.cardBorder || 'transparent',
                  }}
                >
                  <div>
                    <h4 className="font-bold text-sm sm:text-base">{form.title}</h4>
                    {form.subtitle && (
                      <p className="text-xs opacity-75 mt-0.5">{form.subtitle}</p>
                    )}
                  </div>

                  {isDone ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
                      <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1" />
                      <p className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                        {form.successMessage || 'Gửi thành công! Chúng mình sẽ liên hệ lại sớm.'}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleFormSubmit(form, e)} className="space-y-2.5">
                      <div>
                        <input 
                          type="text" 
                          required
                          placeholder="Họ và tên của bạn *"
                          value={curData.name}
                          onChange={(e) => setFormData({ ...formData, [form.id]: { ...curData, name: e.target.value } })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {form.requireEmail && (
                          <input 
                            type="email" 
                            placeholder="Email liên hệ"
                            value={curData.email}
                            onChange={(e) => setFormData({ ...formData, [form.id]: { ...curData, email: e.target.value } })}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                        {form.requirePhone && (
                          <input 
                            type="tel" 
                            placeholder="Số điện thoại / Zalo"
                            value={curData.phone}
                            onChange={(e) => setFormData({ ...formData, [form.id]: { ...curData, phone: e.target.value } })}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                      <div>
                        <textarea 
                          rows={3}
                          required
                          placeholder="Lời nhắn / Nhu cầu hợp tác..."
                          value={curData.message}
                          onChange={(e) => setFormData({ ...formData, [form.id]: { ...curData, message: e.target.value } })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 text-xs font-bold rounded-xl text-white shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: theme.accentColor || '#3b82f6' }}
                      >
                        {isLoading ? (
                          <span>Đang gửi...</span>
                        ) : (
                          <>
                            <Send size={14} />
                            <span>{form.buttonText || 'Gửi liên hệ'}</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              );
            }

            // BANK QR PAYMENT BLOCK
            if (block.type === 'bank_qr') {
              const bank = block as BankQRBlock;
              return (
                <div 
                  key={block.id}
                  className={`p-4 border ${getRadiusClass()} ${getShadowStyle()} space-y-3`}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: theme.cardTextColor,
                    borderColor: theme.cardBorder || 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                        <QrCode size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm">{bank.bankName}</h4>
                        <p className="text-[11px] opacity-75 font-mono">{bank.accountName}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyBankInfo(bank.accountNumber)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-all flex items-center gap-1"
                    >
                      {copiedBank ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span>{copiedBank ? 'Đã chép' : 'Sao chép STK'}</span>
                    </button>
                  </div>

                  <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-between text-xs font-mono font-bold tracking-wider">
                    <span>{bank.accountNumber}</span>
                    {bank.note && (
                      <span className="text-[10px] font-sans opacity-70 font-normal truncate max-w-[150px]">
                        Nội dung: {bank.note}
                      </span>
                    )}
                  </div>

                  {bank.qrImageUrl && (
                    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-sm max-w-[200px] mx-auto">
                      <img 
                        src={bank.qrImageUrl} 
                        alt="VietQR" 
                        className="w-full h-auto object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 font-medium">Quét mã VietQR chuyển khoản</span>
                    </div>
                  )}
                </div>
              );
            }

            // TEXT / BANNER BLOCK
            if (block.type === 'text_banner') {
              const banner = block as TextBannerBlock;
              return (
                <div 
                  key={block.id}
                  className={`p-3.5 border ${getRadiusClass()} ${getShadowStyle()} text-center`}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: theme.cardTextColor,
                    borderColor: theme.cardBorder || 'transparent',
                  }}
                >
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    {banner.text}
                  </p>
                </div>
              );
            }

            // ARTICLE BLOCK
            if (block.type === 'article') {
              const art = block as ArticleBlock;
              return (
                <div 
                  key={block.id}
                  onClick={() => setActiveArticle(art)}
                  className={`p-4 border ${getRadiusClass()} ${getShadowStyle()} cursor-pointer ${getHoverClass()} space-y-2`}
                  style={{
                    backgroundColor: theme.cardBg,
                    color: theme.cardTextColor,
                    borderColor: theme.cardBorder || 'transparent',
                  }}
                >
                  <div className="flex items-center gap-2 text-xs opacity-75">
                    <BookOpen size={14} />
                    <span>{art.readTime || '3 phút đọc'}</span>
                    <span>•</span>
                    <span>{art.date || 'Gần đây'}</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base leading-snug">{art.title}</h4>
                  <p className="text-xs opacity-75 line-clamp-2">{art.excerpt}</p>
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color: theme.accentColor }}>
                    <span>Đọc toàn bộ bài viết</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Footer Brand */}
        <div className="pt-6 pb-2 text-center text-xs opacity-60 flex flex-col items-center gap-1">
          <a 
            href="/"
            className="font-bold tracking-tight hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px]"
          >
            <Sparkles size={12} />
            <span>Tạo Bio Link miễn phí với BioLink Studio</span>
          </a>
        </div>
      </div>

      {/* Full Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold">{activeArticle.title}</h3>
              <button 
                onClick={() => setActiveArticle(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
              >
                ✕
              </button>
            </div>
            {activeArticle.coverImage && (
              <img 
                src={activeArticle.coverImage} 
                alt="cover" 
                className="w-full h-48 object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="text-sm leading-relaxed space-y-3 whitespace-pre-wrap">
              {activeArticle.content || activeArticle.excerpt}
            </div>
            <button
              onClick={() => setActiveArticle(null)}
              className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors"
            >
              Đóng bài viết
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
