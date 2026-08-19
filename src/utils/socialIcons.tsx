import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Send, 
  Github, 
  Linkedin, 
  ShoppingBag, 
  Music, 
  Twitter, 
  Phone, 
  Mail, 
  Globe, 
  MessageCircle, 
  Share2,
  Video
} from 'lucide-react';
import { SocialLink } from '../types';

export const SOCIAL_PLATFORMS: {
  id: SocialLink['platform'];
  name: string;
  placeholder: string;
  color: string;
  bgColor: string;
}[] = [
  { id: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@username', color: '#000000', bgColor: 'bg-black text-white' },
  { id: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/username', color: '#1877F2', bgColor: 'bg-blue-600 text-white' },
  { id: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/username', color: '#E4405F', bgColor: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white' },
  { id: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@channel', color: '#FF0000', bgColor: 'bg-red-600 text-white' },
  { id: 'zalo', name: 'Zalo', placeholder: 'https://zalo.me/09xxxxxxxx', color: '#0068FF', bgColor: 'bg-blue-500 text-white' },
  { id: 'telegram', name: 'Telegram', placeholder: 'https://t.me/username', color: '#229ED9', bgColor: 'bg-sky-500 text-white' },
  { id: 'shopee', name: 'Shopee', placeholder: 'https://shopee.vn/shopname', color: '#EE4D2D', bgColor: 'bg-orange-500 text-white' },
  { id: 'lazada', name: 'Lazada', placeholder: 'https://lazada.vn/shopname', color: '#0f146d', bgColor: 'bg-indigo-700 text-white' },
  { id: 'spotify', name: 'Spotify', placeholder: 'https://open.spotify.com/artist/...', color: '#1DB954', bgColor: 'bg-emerald-500 text-white' },
  { id: 'github', name: 'GitHub', placeholder: 'https://github.com/username', color: '#333333', bgColor: 'bg-zinc-800 text-white' },
  { id: 'linkedin', name: 'LinkedIn', placeholder: 'https://linkedin.com/in/username', color: '#0A66C2', bgColor: 'bg-sky-700 text-white' },
  { id: 'twitter', name: 'X / Twitter', placeholder: 'https://x.com/username', color: '#000000', bgColor: 'bg-zinc-900 text-white' },
  { id: 'threads', name: 'Threads', placeholder: 'https://threads.net/@username', color: '#000000', bgColor: 'bg-neutral-900 text-white' },
  { id: 'whatsapp', name: 'WhatsApp', placeholder: 'https://wa.me/84xxxxxxxxx', color: '#25D366', bgColor: 'bg-green-500 text-white' },
  { id: 'email', name: 'Email', placeholder: 'mailto:contact@example.com', color: '#EA4335', bgColor: 'bg-rose-500 text-white' },
  { id: 'phone', name: 'Số điện thoại', placeholder: 'tel:09xxxxxxxx', color: '#10B981', bgColor: 'bg-emerald-600 text-white' },
  { id: 'website', name: 'Website', placeholder: 'https://mywebsite.com', color: '#6366F1', bgColor: 'bg-indigo-600 text-white' },
];

export function renderSocialIcon(platform: SocialLink['platform'], size = 18) {
  switch (platform) {
    case 'tiktok':
      return <Video size={size} />;
    case 'facebook':
      return <Facebook size={size} />;
    case 'instagram':
      return <Instagram size={size} />;
    case 'youtube':
      return <Youtube size={size} />;
    case 'zalo':
      return <MessageCircle size={size} />;
    case 'telegram':
      return <Send size={size} />;
    case 'shopee':
    case 'lazada':
      return <ShoppingBag size={size} />;
    case 'spotify':
      return <Music size={size} />;
    case 'github':
      return <Github size={size} />;
    case 'linkedin':
      return <Linkedin size={size} />;
    case 'twitter':
    case 'threads':
      return <Share2 size={size} />;
    case 'whatsapp':
      return <Phone size={size} />;
    case 'email':
      return <Mail size={size} />;
    case 'phone':
      return <Phone size={size} />;
    case 'website':
    default:
      return <Globe size={size} />;
  }
}
