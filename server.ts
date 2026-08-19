import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PROFILES } from './src/data/mockBios';
import { BioProfile } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory + persistent storage
const DATA_FILE = path.join(process.cwd(), 'bio_profiles_db.json');

let profiles: BioProfile[] = [];

// Load persisted profiles or fallback to initial profiles
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    profiles = JSON.parse(raw);
  } else {
    profiles = [...INITIAL_PROFILES];
    fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2));
  }
} catch (e) {
  console.warn('Could not read bio_profiles_db.json, using defaults', e);
  profiles = [...INITIAL_PROFILES];
}

function persistProfiles() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2));
  } catch (err) {
    console.error('Failed to write to DATA_FILE', err);
  }
}

// Lazy Gemini AI initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', totalProfiles: profiles.length });
});

// GET all profiles
app.get('/api/bios', (req, res) => {
  res.json({ profiles });
});

// GET single profile by slug or ID
app.get('/api/bios/:slug', (req, res) => {
  const { slug } = req.params;
  const profile = profiles.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
  );
  if (!profile) {
    return res.status(404).json({ error: 'Bio profile not found' });
  }
  res.json({ profile });
});

// CREATE a new profile
app.post('/api/bios', (req, res) => {
  const newProfile: BioProfile = req.body;
  if (!newProfile.slug || !newProfile.displayName) {
    return res.status(400).json({ error: 'slug and displayName are required' });
  }

  // Ensure unique slug
  let uniqueSlug = newProfile.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  let counter = 1;
  while (profiles.some((p) => p.slug.toLowerCase() === uniqueSlug)) {
    uniqueSlug = `${newProfile.slug}-${counter++}`;
  }
  newProfile.slug = uniqueSlug;
  newProfile.id = newProfile.id || `bio-${Date.now()}`;
  newProfile.createdAt = new Date().toISOString();
  newProfile.updatedAt = new Date().toISOString();

  profiles.unshift(newProfile);
  persistProfiles();
  res.status(201).json({ profile: newProfile });
});

// UPDATE profile (Realtime deploy / sync)
app.put('/api/bios/:slug', (req, res) => {
  const { slug } = req.params;
  const index = profiles.findIndex(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Bio profile not found' });
  }

  const updatedProfile: BioProfile = {
    ...profiles[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  profiles[index] = updatedProfile;
  persistProfiles();
  res.json({ profile: updatedProfile });
});

// DELETE profile
app.delete('/api/bios/:slug', (req, res) => {
  const { slug } = req.params;
  const index = profiles.findIndex(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
  );

  if (index === -1) {
    return res.status(404).json({ error: 'Bio profile not found' });
  }

  const deleted = profiles.splice(index, 1)[0];
  persistProfiles();
  res.json({ success: true, deletedSlug: deleted.slug });
});

// TRACK PAGE VIEW
app.post('/api/bios/:slug/view', (req, res) => {
  const { slug } = req.params;
  const profile = profiles.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
  );

  if (!profile) {
    return res.status(404).json({ error: 'Bio profile not found' });
  }

  if (!profile.stats) {
    profile.stats = { views: 0, clicks: 0, leadsCount: 0, dailyViews: [], linkClicks: [] };
  }

  profile.stats.views = (profile.stats.views || 0) + 1;
  const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  const dayStat = profile.stats.dailyViews.find((d) => d.date === today);
  if (dayStat) {
    dayStat.views += 1;
  } else {
    profile.stats.dailyViews.push({ date: today, views: 1, clicks: 0 });
    if (profile.stats.dailyViews.length > 14) {
      profile.stats.dailyViews.shift();
    }
  }

  persistProfiles();
  res.json({ success: true, views: profile.stats.views });
});

// TRACK LINK CLICK
app.post('/api/bios/:slug/click', (req, res) => {
  const { slug } = req.params;
  const { linkId, title } = req.body;
  const profile = profiles.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
  );

  if (!profile) {
    return res.status(404).json({ error: 'Bio profile not found' });
  }

  if (!profile.stats) {
    profile.stats = { views: 0, clicks: 0, leadsCount: 0, dailyViews: [], linkClicks: [] };
  }

  profile.stats.clicks = (profile.stats.clicks || 0) + 1;

  // Increment link block specific click count if block exists
  const block = profile.blocks.find((b) => b.id === linkId);
  if (block && block.type === 'link') {
    block.clickCount = (block.clickCount || 0) + 1;
  }

  // Link click stats
  const existingLinkStat = profile.stats.linkClicks.find((l) => l.linkId === linkId);
  if (existingLinkStat) {
    existingLinkStat.clicks += 1;
  } else {
    profile.stats.linkClicks.push({ linkId: linkId || 'unknown', title: title || 'Liên kết', clicks: 1 });
  }

  persistProfiles();
  res.json({ success: true, clicks: profile.stats.clicks });
});

// SUBMIT LEAD / CONTACT FORM
app.post('/api/bios/:slug/lead', (req, res) => {
  const { slug } = req.params;
  const { name, email, phone, message, recipientAccount, recipientRole } = req.body;
  const profile = profiles.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase() || p.id === slug
  );

  if (!profile) {
    return res.status(404).json({ error: 'Bio profile not found' });
  }

  if (!name || !message) {
    return res.status(400).json({ error: 'Vui lòng điền họ tên và lời nhắn' });
  }

  if (!profile.leads) {
    profile.leads = [];
  }

  const newLead = {
    id: `lead-${Date.now()}`,
    name,
    email: email || '',
    phone: phone || '',
    message,
    createdAt: new Date().toLocaleString('vi-VN'),
    status: 'new' as const,
    recipientAccount: recipientAccount || 'vadut74@gmail.com',
    recipientRole: recipientRole || 'Chủ sở hữu Bio',
  };

  profile.leads.unshift(newLead);
  profile.stats.leadsCount = (profile.stats.leadsCount || 0) + 1;
  persistProfiles();
  res.status(201).json({ success: true, lead: newLead });
});

// AI BIO COPYWRITING GENERATOR
app.post('/api/ai/generate-bio', async (req, res) => {
  try {
    const { name, profession, vibe, keyHighlights, targetAudience } = req.body;

    const prompt = `Bạn là chuyên gia tư vấn xây dựng thương hiệu cá nhân và viết bio mạng xã hội (TikTok, Instagram, Bio Link).
Hãy tạo nội dung Bio Profile chuyên nghiệp và thu hút cho:
- Tên / Thương hiệu: ${name || 'Nhân vật'}
- Nghề nghiệp / Lĩnh vực: ${profession || 'Content Creator'}
- Phong cách (Vibe): ${vibe || 'Chuyên nghiệp và truyền cảm hứng'}
- Điểm nổi bật / Dịch vụ: ${keyHighlights || 'Dịch vụ chất lượng, tư vấn tận tâm'}
- Đối tượng người xem: ${targetAudience || 'Khách hàng và người theo dõi trẻ'}

Hãy trả về JSON (không markdown, đúng chuẩn JSON):
{
  "displayName": "Tên hiển thị ấn tượng kèm biểu tượng phù hợp",
  "bio": "Đoạn giới thiệu bio ngắn gọn 2-3 câu (dưới 150 ký tự), có emoji, kêu gọi hành động",
  "statusPill": "1 câu trạng thái ngắn (e.g. 🟢 Đang nhận booking tháng này / 🔥 Ưu đãi 20% hôm nay)",
  "suggestedLinks": [
    { "title": "Tiêu đề link 1 hấp dẫn", "subtitle": "Mô tả ngắn gợi cảm", "badge": "HOT 🔥" },
    { "title": "Tiêu đề link 2 hấp dẫn", "subtitle": "Mô tả ngắn gợi cảm", "badge": "FREE 🎁" },
    { "title": "Tiêu đề link 3 hấp dẫn", "subtitle": "Mô tả ngắn gợi cảm", "badge": "XEM NGAY ✨" }
  ],
  "colorRecommendation": "Màu chủ đạo gợi ý (e.g. Xanh Dương Công Nghệ, Hồng Pastel, Vàng Đen Luxury)"
}`;

    if (!process.env.GEMINI_API_KEY) {
      // Return smart template if API key is not yet set
      return res.json({
        displayName: `${name || 'Creator'} • ${profession || 'Chuyên gia'}`,
        bio: `✨ ${profession || 'Sáng tạo nội dung'} | 🚀 Chia sẻ kinh nghiệm thực chiến & giải pháp giá trị | 📩 Hợp tác liên hệ bên dưới 👇`,
        statusPill: `🟢 Đang nhận lịch hợp tác mới`,
        suggestedLinks: [
          { title: `🎁 Nhận Tài Liệu Miễn Phí Từ ${name || 'Tôi'}`, subtitle: 'Tải ngay hướng dẫn chi tiết trọn bộ', badge: 'FREE 🎁' },
          { title: `💼 Đặt Lịch Tư Vấn / Hợp Tác Trực Tiếp`, subtitle: 'Trao đổi 1:1 giải quyết vấn đề nhanh chóng', badge: 'HOT 🔥' },
          { title: `🛍️ Sản Phẩm & Dịch Vụ Nổi Bật`, subtitle: 'Ưu đãi dành riêng cho follower', badge: 'SALE ✨' }
        ],
        colorRecommendation: 'Xanh Hiện Đại & Sang Trọng'
      });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi tạo nội dung với AI' });
  }
});

// AI LINK COPYWRITER
app.post('/api/ai/enhance-link', async (req, res) => {
  try {
    const { url, rawTitle, category } = req.body;
    const prompt = `Tối ưu hóa tiêu đề và phụ đề cho 1 nút bấm Bio Link để tăng tỷ lệ nhấp (CTR).
- Link gốc / Tiêu đề nháp: ${rawTitle || url}
- Loại liên kết: ${category || 'Sản phẩm / Dịch vụ'}

Trả về JSON:
{
  "title": "Tiêu đề cuốn hút có emoji, ngắn gọn",
  "subtitle": "Phụ đề 1 câu kích thích hành động (Call To Action)",
  "badge": "Nhãn huy hiệu nổi bật (ví dụ: HOT 🔥, MỚI ✨, GIẢM 30%, BÁN CHẠY)"
}`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        title: `👉 ${rawTitle || 'Khám Phá Ngay Hôm Nay'}`,
        subtitle: 'Bấm vào để xem thông tin chi tiết và ưu đãi độc quyền',
        badge: 'HOT 🔥'
      });
    }

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('AI link enhance error:', error);
    res.status(500).json({
      title: `👉 ${req.body.rawTitle || 'Xem Ngay Chi Tiết'}`,
      subtitle: 'Xem thông tin đầy đủ tại đây',
      badge: 'HOT 🔥'
    });
  }
});

// ================= VITE / FRONTEND SERVING =================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 BioLink Studio Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
