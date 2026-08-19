import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MousePointerClick, 
  Eye, 
  Users, 
  Download, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { BioProfile, BioLead, ContactFormBlock } from '../types';

interface AnalyticsViewProps {
  profile: BioProfile;
  onUpdateLeadStatus: (leadId: string, status: BioLead['status']) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ profile, onUpdateLeadStatus }) => {
  const { stats, leads, blocks } = profile;
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const contactBlocks = (blocks || []).filter(
    (b) => b.type === 'contact_form' && b.enabled
  ) as ContactFormBlock[];

  const totalViews = stats?.views || 0;
  const totalClicks = stats?.clicks || 0;
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';
  const leadsCount = leads?.length || stats?.leadsCount || 0;

  const filteredLeads = (leads || []).filter((lead) => {
    if (filterStatus === 'all') return true;
    return lead.status === filterStatus;
  });

  const handleCopyLead = (lead: BioLead) => {
    const text = `Khách hàng: ${lead.name}\nEmail: ${lead.email || 'Không có'}\nSĐT: ${lead.phone || 'Không có'}\nLời nhắn: ${lead.message}\nThời gian: ${lead.createdAt}\nNgười nhận: ${lead.recipientAccount || 'Chủ Bio'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportLeadsToCSV = () => {
    if (!leads || leads.length === 0) {
      alert('Chưa có thông tin khách hàng nào để xuất.');
      return;
    }

    const headers = ['Thời gian', 'Họ tên', 'Email', 'SĐT', 'Lời nhắn', 'Tài khoản tiếp nhận', 'Trạng thái'];
    const rows = leads.map((l) => [
      `"${l.createdAt}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${l.message.replace(/"/g, '""')}"`,
      `"${(l.recipientAccount || 'Chủ Bio').replace(/"/g, '""')}"`,
      `"${l.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_${profile.slug}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Find max views for chart scaling
  const dailyData = stats?.dailyViews || [
    { date: '12/08', views: 120, clicks: 65 },
    { date: '13/08', views: 240, clicks: 130 },
    { date: '14/08', views: 350, clicks: 190 },
    { date: '15/08', views: 420, clicks: 210 },
    { date: '16/08', views: 560, clicks: 310 },
    { date: '17/08', views: 490, clicks: 280 },
    { date: '18/08', views: 630, clicks: 340 },
  ];

  const maxVal = Math.max(...dailyData.map((d) => Math.max(d.views, d.clicks)), 100);

  return (
    <div className="space-y-6">
      {/* Recipient Account Routing Banner (Chỉ người làm web thấy) */}
      {contactBlocks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm flex-shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="font-bold text-zinc-900 dark:text-zinc-100 flex flex-wrap items-center gap-2">
                <span>Tài khoản chủ tiếp nhận tin nhắn từ Bio:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-800 font-bold">
                  {contactBlocks[0].recipientAccount || 'Chưa thiết lập'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                🔒 Phụ trách: <b>{contactBlocks[0].recipientRole || 'Chủ sở hữu Bio'}</b> {contactBlocks[0].recipientPhone ? `• Hotline/Zalo: ${contactBlocks[0].recipientPhone}` : ''} • Kênh nhận: {contactBlocks[0].notificationMethod === 'email' ? 'Email thông báo' : contactBlocks[0].notificationMethod === 'in_app' ? 'Bảng CRM Leads' : 'Email & Bảng CRM Leads'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 self-start sm:self-auto flex-shrink-0">
            <Lock size={12} />
            <span>Chỉ hiển thị cho người làm web (Ẩn trên Bio)</span>
          </div>
        </div>
      )}

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Lượt xem trang</span>
            <Eye size={16} className="text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {totalViews.toLocaleString('vi-VN')}
          </div>
          <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
            <TrendingUp size={11} />
            <span>+14.2% so với tuần trước</span>
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Lượt nhấp liên kết</span>
            <MousePointerClick size={16} className="text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {totalClicks.toLocaleString('vi-VN')}
          </div>
          <p className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">
            <TrendingUp size={11} />
            <span>+18.5% so với tuần trước</span>
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Tỷ lệ chuyển đổi (CTR)</span>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {ctr}%
          </div>
          <p className="text-[10px] text-zinc-400 font-medium">
            Clicks / Views trung bình
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Khách hàng để lại lời nhắn</span>
            <Users size={16} className="text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {leadsCount}
          </div>
          <p className="text-[10px] text-amber-500 font-medium">
            Form liên hệ & booking
          </p>
        </div>
      </div>

      {/* 7-Day Performance Chart */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-500" />
              <span>Biểu đồ truy cập 7 ngày gần nhất</span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              So sánh lượng truy cập (Views) và lượt bấm vào liên kết (Clicks)
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-blue-500" />
              <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-md bg-purple-500" />
              <span className="text-zinc-600 dark:text-zinc-400 text-[11px]">Clicks</span>
            </div>
          </div>
        </div>

        {/* CSS/SVG Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2 border-b border-zinc-100 dark:border-zinc-800">
          {dailyData.map((d, idx) => {
            const viewHeightPercent = Math.max((d.views / maxVal) * 100, 6);
            const clickHeightPercent = Math.max((d.clicks / maxVal) * 100, 4);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-full">
                  {/* Views Bar */}
                  <div
                    className="w-3 sm:w-5 bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110 relative"
                    style={{ height: `${viewHeightPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 transition-opacity">
                      {d.views} views
                    </div>
                  </div>

                  {/* Clicks Bar */}
                  <div
                    className="w-3 sm:w-5 bg-purple-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110 relative"
                    style={{ height: `${clickHeightPercent}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20 transition-opacity">
                      {d.clicks} clicks
                    </div>
                  </div>
                </div>

                <span className="text-[10px] text-zinc-400 font-medium">{d.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Performing Links */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <MousePointerClick size={16} className="text-purple-500" />
          <span>Xếp hạng liên kết được bấm nhiều nhất</span>
        </h4>

        <div className="space-y-2.5">
          {blocks
            .filter((b) => b.type === 'link' || b.type === 'product')
            .map((b: any, index) => {
              const clicks = b.clickCount || 0;
              const percent = totalClicks > 0 ? Math.round((clicks / totalClicks) * 100) : 0;

              return (
                <div
                  key={b.id}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-700 dark:text-zinc-300">
                        {index + 1}
                      </span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {b.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                      <span>{clicks} lượt nhấp</span>
                      <span className="text-zinc-400 text-[10px]">({percent}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Customer Leads & Bookings Manager */}
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Users size={16} className="text-emerald-500" />
              <span>Danh Sách Khách Hàng / Leads ({filteredLeads.length})</span>
            </h4>
            <p className="text-[11px] text-zinc-400">
              Thông tin thu thập tự động từ Form Liên hệ & Đặt lịch trên Bio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="new">Mới gửi</option>
              <option value="contacted">Đã liên hệ</option>
              <option value="resolved">Đã giải quyết</option>
            </select>

            <button
              onClick={exportLeadsToCSV}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1 transition-all"
            >
              <Download size={13} />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Leads Table / List */}
        <div className="space-y-2.5">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-zinc-400 text-xs border border-dashed rounded-xl">
              Chưa có thông tin khách hàng nào được gửi. Khi khách hàng điền form trên trang Bio, dữ liệu sẽ hiển thị ngay tại đây.
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {lead.name}
                      </h5>
                      {lead.recipientAccount && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-md border border-amber-500/20">
                          <Lock size={10} />
                          <span>Tài khoản chủ: {lead.recipientAccount}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-blue-500">
                          <Mail size={12} />
                          <span>{lead.email}</span>
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-emerald-500">
                          <Phone size={12} />
                          <span>{lead.phone}</span>
                        </a>
                      )}
                      <span className="flex items-center gap-1 text-zinc-400 text-[11px]">
                        <Clock size={11} />
                        <span>{lead.createdAt}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={lead.status}
                    onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as any)}
                    className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                      lead.status === 'new'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 border-amber-300'
                        : lead.status === 'contacted'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border-blue-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300'
                    }`}
                  >
                    <option value="new">Mới gửi 🟡</option>
                    <option value="contacted">Đã liên hệ 🔵</option>
                    <option value="resolved">Đã hoàn thành 🟢</option>
                  </select>
                </div>

                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed border border-zinc-200/60 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-400 block mb-0.5 text-[10px] uppercase">Lời nhắn / Nhu cầu:</span>
                  {lead.message}
                </div>

                {/* Quick Action Bar for Admin */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}?subject=Phản hồi từ Bio: ${profile.displayName}`}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 flex items-center gap-1"
                    >
                      <Mail size={11} />
                      <span>Trả lời Email</span>
                    </a>
                  )}
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <Phone size={11} />
                      <span>Gọi / Zalo</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleCopyLead(lead)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 flex items-center gap-1"
                  >
                    {copiedId === lead.id ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        <span className="text-emerald-600">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Sao chép thông tin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
