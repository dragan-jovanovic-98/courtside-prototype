"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SPageHeader,
  SToolbar,
  SFilterPill,
  SMetricCard,
  SDateRangePicker,
  StatusBadge,
} from "@/components/shared";
import {
  DollarSign,
  CalendarDays,
  Users,
  GraduationCap,
  Trophy,
  UserCog,
  MessageSquare,
  DoorOpen,
  Bot,
  Shield,
  Download,
  Calendar,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ExternalLink,
  Send,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

const REPORT_CATEGORIES: { id: string; name: string; icon: LucideIcon; reports: { id: string; name: string; phase: 1 | 2 | 3 }[]; desc: string; restricted?: boolean }[] = [
  { id: 'financial', name: 'Financial', icon: DollarSign, desc: 'Revenue, transactions, payments, tax summaries', restricted: true, reports: [
    { id: 'revenue-summary', name: 'Revenue Summary', phase: 1 }, { id: 'revenue-category', name: 'Revenue by Category', phase: 1 }, { id: 'revenue-payment', name: 'Revenue by Payment Method', phase: 1 },
    { id: 'daily-detail', name: 'Daily Revenue Detail', phase: 1 }, { id: 'gl-code', name: 'GL Code Report', phase: 1 }, { id: 'tax-summary', name: 'Tax Summary', phase: 1 },
    { id: 'aging-ar', name: 'Aging Accounts Receivable', phase: 1 }, { id: 'refund-report', name: 'Refund Report', phase: 1 }, { id: 'stripe-recon', name: 'Stripe Reconciliation', phase: 1 },
    { id: 'pass-revenue', name: 'Pass Revenue', phase: 1 }, { id: 'gift-card', name: 'Gift Card Report', phase: 1 },
    { id: 'membership-revenue', name: 'Membership Revenue (MRR)', phase: 2 }, { id: 'discount-analysis', name: 'Discount & Promo Analysis', phase: 2 }, { id: 'pos-revenue', name: 'POS Revenue', phase: 2 },
  ]},
  { id: 'courts', name: 'Courts & Utilization', icon: CalendarDays, desc: 'Utilization heatmaps, booking volume, peak hours', reports: [
    { id: 'court-util', name: 'Court Utilization', phase: 1 }, { id: 'booking-volume', name: 'Booking Volume', phase: 1 }, { id: 'booking-source', name: 'Booking Source Analysis', phase: 1 },
    { id: 'peak-hours', name: 'Peak Hours', phase: 1 }, { id: 'cancel-noshow', name: 'Cancellation & No-Show', phase: 1 }, { id: 'rev-per-court', name: 'Revenue per Court', phase: 1 },
    { id: 'open-play', name: 'Open Play Report', phase: 2 }, { id: 'waitlist', name: 'Waitlist Report', phase: 2 },
  ]},
  { id: 'customers', name: 'Customers', icon: Users, desc: 'Growth, retention, spending, segments', reports: [
    { id: 'cust-growth', name: 'Customer Growth', phase: 1 }, { id: 'cust-retention', name: 'Customer Retention', phase: 1 }, { id: 'cust-spending', name: 'Customer Spending', phase: 1 }, { id: 'cust-segments', name: 'Customer Segments', phase: 1 },
    { id: 'household', name: 'Household Report', phase: 2 }, { id: 'membership-report', name: 'Membership Report', phase: 2 }, { id: 'lead-pipeline', name: 'Lead Pipeline', phase: 2 },
  ]},
  { id: 'programs', name: 'Programs', icon: GraduationCap, desc: 'Enrollment, attendance, instructor performance', reports: [
    { id: 'prog-enrollment', name: 'Program Enrollment', phase: 1 }, { id: 'prog-attendance', name: 'Program Attendance', phase: 1 }, { id: 'prog-revenue', name: 'Program Revenue', phase: 1 }, { id: 'lesson-packages', name: 'Lesson Package Utilization', phase: 1 },
    { id: 'prog-profit', name: 'Program Profitability', phase: 2 }, { id: 'instructor-perf', name: 'Instructor Performance', phase: 2 },
  ]},
  { id: 'leagues', name: 'Leagues & Events', icon: Trophy, desc: 'Registration, revenue, match completion', reports: [
    { id: 'league-enrollment', name: 'League Enrollment', phase: 2 }, { id: 'league-revenue', name: 'League Revenue', phase: 2 }, { id: 'match-completion', name: 'Match Completion', phase: 2 }, { id: 'event-revenue', name: 'Event Revenue', phase: 2 },
    { id: 'player-retention', name: 'Player Retention', phase: 3 },
  ]},
  { id: 'staff', name: 'Staff', icon: UserCog, desc: 'Activity log, roster, hours, labor cost', reports: [
    { id: 'staff-activity', name: 'Staff Activity Log', phase: 1 }, { id: 'staff-roster', name: 'Staff Roster', phase: 1 },
    { id: 'labor-hours', name: 'Labor Hours', phase: 2 }, { id: 'labor-cost', name: 'Labor Cost', phase: 2 },
  ]},
  { id: 'communications', name: 'Communications', icon: MessageSquare, desc: 'Message volume, email performance, campaigns', reports: [
    { id: 'msg-volume', name: 'Message Volume', phase: 2 }, { id: 'email-perf', name: 'Email Performance', phase: 2 }, { id: 'sms-delivery', name: 'SMS Delivery', phase: 2 },
    { id: 'campaign-perf', name: 'Campaign Performance', phase: 3 },
  ]},
  { id: 'access', name: 'Access & Check-in', icon: DoorOpen, desc: 'Check-in rates, no-show detection, occupancy', reports: [
    { id: 'checkin-log', name: 'Check-in Log', phase: 2 }, { id: 'noshow-detection', name: 'No-Show Detection', phase: 2 }, { id: 'occupancy', name: 'Facility Occupancy', phase: 2 },
  ]},
  { id: 'ai', name: 'AI Performance', icon: Bot, desc: 'Call summary, revenue attribution, chat, cost', reports: [
    { id: 'ai-calls', name: 'AI Call Summary', phase: 3 }, { id: 'ai-revenue', name: 'AI Revenue Attribution', phase: 3 }, { id: 'ai-chat', name: 'AI Chat Summary', phase: 3 },
    { id: 'ai-outbound', name: 'AI Outbound Summary', phase: 3 }, { id: 'ai-marketing', name: 'AI Marketing Campaign', phase: 3 }, { id: 'ai-cost', name: 'AI Cost Report', phase: 3 },
  ]},
  { id: 'compliance', name: 'Compliance', icon: Shield, desc: 'Consent audit, DSAR, waiver status', reports: [
    { id: 'waiver-status', name: 'Waiver Status', phase: 1 },
    { id: 'consent-audit', name: 'Consent Audit', phase: 2 }, { id: 'dsar', name: 'DSAR Report', phase: 2 },
  ]},
];

// Mock report data for the Revenue Summary viewer
const MOCK_REVENUE_TABLE = [
  { category: 'Court Rentals', gross: 32450, refunds: 810, net: 31640, pct: 65.1, txCount: 278, avgTx: 116.76 },
  { category: 'Memberships', gross: 6930, refunds: 0, net: 6930, pct: 14.3, txCount: 70, avgTx: 99.00 },
  { category: 'Programs', gross: 4860, refunds: 180, net: 4680, pct: 9.6, txCount: 27, avgTx: 180.00 },
  { category: 'Passes', gross: 2250, refunds: 0, net: 2250, pct: 4.6, txCount: 15, avgTx: 150.00 },
  { category: 'POS — Retail', gross: 1420, refunds: 45, net: 1375, pct: 2.8, txCount: 42, avgTx: 33.81 },
  { category: 'POS — F&B', gross: 680, refunds: 0, net: 680, pct: 1.4, txCount: 156, avgTx: 4.36 },
  { category: 'Equipment Rental', gross: 540, refunds: 0, net: 540, pct: 1.1, txCount: 108, avgTx: 5.00 },
  { category: 'Gift Cards', gross: 400, refunds: 0, net: 400, pct: 0.8, txCount: 4, avgTx: 100.00 },
  { category: 'Late Fees', gross: 155, refunds: 0, net: 155, pct: 0.3, txCount: 7, avgTx: 22.14 },
];

export default function ReportsView() {
  const [dateRange, setDateRange] = useState('this_month');
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<{ catId: string; reportId: string; reportName: string } | null>(null);
  const [reportChartType, setReportChartType] = useState<'bar' | 'line' | 'table'>('bar');

  // Revenue trend SVG path (12 months of data points)
  const monthlyRevenue = [28400, 31200, 29800, 35100, 38600, 42300, 39700, 44800, 41200, 46500, 43900, 48650];
  const maxRev = Math.max(...monthlyRevenue);
  const revPoints = monthlyRevenue.map((v, i) => `${(i / 11) * 300},${65 - (v / maxRev) * 60}`).join(' L ');
  const revenuePath = `M ${revPoints}`;
  const lastYearRevenue = [24200, 26800, 25100, 28900, 32400, 35200, 33600, 37100, 34800, 38200, 36500, 40100];
  const lastYearPoints = lastYearRevenue.map((v, i) => `${(i / 11) * 300},${65 - (v / maxRev) * 60}`).join(' L ');
  const lastYearPath = `M ${lastYearPoints}`;

  // Heatmap — realistic utilization data (Mon-Sun rows, 8AM-10PM cols, higher in evenings/weekends)
  const heatmapData = [
    [0.3, 0.4, 0.5, 0.6, 0.55, 0.7, 0.85, 0.95, 0.9, 0.85, 0.7, 0.5, 0.3, 0.15], // Mon
    [0.25, 0.35, 0.5, 0.55, 0.5, 0.65, 0.8, 0.9, 0.95, 0.9, 0.75, 0.55, 0.35, 0.15], // Tue
    [0.3, 0.4, 0.45, 0.6, 0.55, 0.7, 0.85, 0.92, 0.88, 0.82, 0.65, 0.45, 0.25, 0.1], // Wed
    [0.25, 0.35, 0.5, 0.55, 0.5, 0.65, 0.8, 0.95, 0.98, 0.92, 0.78, 0.55, 0.35, 0.15], // Thu
    [0.35, 0.45, 0.55, 0.6, 0.55, 0.7, 0.82, 0.9, 0.88, 0.8, 0.65, 0.45, 0.25, 0.1], // Fri
    [0.7, 0.85, 0.9, 0.92, 0.88, 0.85, 0.82, 0.78, 0.7, 0.6, 0.45, 0.3, 0.2, 0.1], // Sat
    [0.65, 0.8, 0.85, 0.88, 0.82, 0.75, 0.7, 0.65, 0.55, 0.45, 0.3, 0.2, 0.15, 0.05], // Sun
  ];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Booking source data
  const bookingSources = [{ label: 'Online', pct: 52, color: 'primary' }, { label: 'Walk-in', pct: 24, color: 'info' }, { label: 'Phone (AI)', pct: 18, color: 'warning' }, { label: 'Staff', pct: 6, color: 'success' }];

  const totalNet = MOCK_REVENUE_TABLE.reduce((s, r) => s + r.net, 0);
  const totalGross = MOCK_REVENUE_TABLE.reduce((s, r) => s + r.gross, 0);
  const totalRefunds = MOCK_REVENUE_TABLE.reduce((s, r) => s + r.refunds, 0);
  const totalTx = MOCK_REVENUE_TABLE.reduce((s, r) => s + r.txCount, 0);

  // Report viewer for a specific report
  // Shared report header + filter bar
  const ReportShell = ({ children, filters }: { children: React.ReactNode; filters?: React.ReactNode }) => {
    const cat = REPORT_CATEGORIES.find(c => c.id === activeReport!.catId);
    return (
      <>
        <div className="h-11 flex items-center justify-between px-5 bg-card/50 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveReport(null)} className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="w-3.5 h-3.5" />Reports</button>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-[13px] font-medium text-muted-foreground">{cat?.name}</span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-[13px] font-bold">{activeReport!.reportName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Calendar className="w-3 h-3 mr-1.5" />Schedule</Button>
            <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Download className="w-3 h-3 mr-1.5" />Export</Button>
          </div>
        </div>
        <SToolbar>
          <SDateRangePicker value={dateRange} onChange={setDateRange} />
          {filters}
          <div className="flex-1" />
        </SToolbar>
        <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">{children}</div>
      </>
    );
  };

  if (activeReport) {
    const rptCat = activeReport.catId;
    const rptId = activeReport.reportId;

    // ── FINANCIAL: Revenue Summary ──
    if (rptCat === 'financial') {
      return (
        <ReportShell filters={<><SFilterPill label="All Categories" active={true} onClick={() => {}} /><SFilterPill label="Net Revenue" active={true} onClick={() => {}} /></>}>
          <div className="card-elevated rounded-lg p-5">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-4">Revenue by Category — March 2026</div>
            <div className="flex items-end gap-2 h-48">
              {MOCK_REVENUE_TABLE.map(row => (
                <div key={row.category} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold tabular-nums text-muted-foreground">${(row.net / 1000).toFixed(1)}k</span>
                  <div className="w-full rounded-t relative group cursor-pointer" style={{ height: `${Math.max(4, (row.net / totalNet) * 160)}px` }}>
                    <div className="absolute inset-0 bg-primary rounded-t transition-opacity opacity-70 group-hover:opacity-100" />
                  </div>
                  <span className="text-[8px] font-medium text-muted-foreground text-center leading-tight max-w-16 truncate">{row.category.replace('POS — ', '')}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between"><h3 className="text-sm font-bold">Revenue Detail</h3><span className="text-[10px] text-muted-foreground font-medium">Last updated: Mar 21, 2026 2:30 PM</span></div>
            <div className="overflow-x-auto"><table className="w-full">
              <thead><tr className="border-b border-border">
                {['Category', 'Gross', 'Refunds', 'Net', '% of Total', 'Transactions', 'Avg Tx'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10 cursor-pointer hover:text-foreground"><span className="flex items-center gap-1">{h}<ArrowUpDown className="w-3 h-3" /></span></th>)}
              </tr></thead>
              <tbody>{MOCK_REVENUE_TABLE.map(row => (
                <tr key={row.category} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-2.5 text-sm font-bold text-primary">{row.category}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${row.gross.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums text-red-500">{row.refunds > 0 ? `-$${row.refunds.toLocaleString()}` : '—'}</td>
                  <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${row.net.toLocaleString()}</td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${row.pct}%` }} /></div><span className="text-xs font-medium tabular-nums">{row.pct}%</span></div></td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{row.txCount}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${row.avgTx.toFixed(2)}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr className="bg-muted/30 border-t-2 border-border">
                <td className="px-4 py-3 text-sm font-bold">Total</td><td className="px-4 py-3 text-sm font-bold tabular-nums">${totalGross.toLocaleString()}</td><td className="px-4 py-3 text-sm font-bold tabular-nums text-red-500">-${totalRefunds.toLocaleString()}</td><td className="px-4 py-3 text-sm font-bold tabular-nums">${totalNet.toLocaleString()}</td><td className="px-4 py-3 text-sm font-bold">100%</td><td className="px-4 py-3 text-sm font-bold tabular-nums">{totalTx}</td><td className="px-4 py-3 text-sm font-bold tabular-nums">${(totalNet / totalTx).toFixed(2)}</td>
              </tr></tfoot>
            </table></div>
          </div>
        </ReportShell>
      );
    }

    // ── COURTS: Court Utilization ──
    if (rptCat === 'courts') {
      const courtUtil = [
        { court: 'Court 1', sport: 'Pickleball', bookedHrs: 268, availHrs: 364, util: 73.6, revenue: 8040, revPerHr: 30 },
        { court: 'Court 2', sport: 'Pickleball', bookedHrs: 252, availHrs: 364, util: 69.2, revenue: 7560, revPerHr: 30 },
        { court: 'Court 3', sport: 'Pickleball', bookedHrs: 280, availHrs: 364, util: 76.9, revenue: 8400, revPerHr: 30 },
        { court: 'Court 4', sport: 'Tennis', bookedHrs: 196, availHrs: 364, util: 53.8, revenue: 8820, revPerHr: 45 },
        { court: 'Court 4A', sport: 'Pickleball', bookedHrs: 168, availHrs: 364, util: 46.2, revenue: 5040, revPerHr: 30 },
        { court: 'Court 4B', sport: 'Pickleball', bookedHrs: 154, availHrs: 364, util: 42.3, revenue: 4620, revPerHr: 30 },
        { court: 'Court 5', sport: 'Tennis', bookedHrs: 294, availHrs: 364, util: 80.8, revenue: 13230, revPerHr: 45 },
        { court: 'Court 6', sport: 'Basketball / VB', bookedHrs: 192, availHrs: 312, util: 61.5, revenue: 6720, revPerHr: 35 },
      ];
      const avgUtil = Math.round(courtUtil.reduce((s, c) => s + c.util, 0) / courtUtil.length * 10) / 10;
      return (
        <ReportShell filters={<><SFilterPill label="All Courts" active={true} onClick={() => {}} /><SFilterPill label="All Sports" active={false} onClick={() => {}} /></>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SMetricCard label="Avg Utilization" value={`${avgUtil}%`} trend="↑ 3pp vs last month" trendUp={true} />
            <SMetricCard label="Total Booked Hours" value={`${courtUtil.reduce((s, c) => s + c.bookedHrs, 0).toLocaleString()}`} trend="↑ 8%" trendUp={true} />
            <SMetricCard label="Revenue per Court Hour" value={`$${(courtUtil.reduce((s, c) => s + c.revenue, 0) / courtUtil.reduce((s, c) => s + c.bookedHrs, 0)).toFixed(2)}`} />
            <SMetricCard label="Peak Utilization" value="Thu 6-8 PM" trend="98% booked" />
          </div>
          {/* Utilization bar chart per court */}
          <div className="card-elevated rounded-lg p-5">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-4">Utilization by Court — March 2026</div>
            <div className="space-y-2.5">
              {courtUtil.map(c => (
                <div key={c.court} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-20 shrink-0 truncate">{c.court}</span>
                  <span className="text-[10px] text-muted-foreground font-medium w-24 shrink-0">{c.sport}</span>
                  <div className="flex-1 h-5 bg-muted/50 rounded overflow-hidden relative">
                    <div className="h-full rounded transition-all" style={{ width: `${c.util}%`, backgroundColor: c.util > 75 ? 'hsl(var(--primary))' : c.util > 50 ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary) / 0.35)' }} />
                  </div>
                  <span className="text-sm font-bold tabular-nums w-12 text-right">{c.util}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Court Detail</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Court', 'Sport', 'Booked Hrs', 'Available Hrs', 'Utilization', 'Revenue', 'Rev / Booked Hr'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{courtUtil.map(c => (
                <tr key={c.court} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-bold">{c.court}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{c.sport}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{c.bookedHrs}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{c.availHrs}</td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${c.util}%` }} /></div><span className="text-xs font-bold tabular-nums">{c.util}%</span></div></td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${c.revenue.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${c.revPerHr.toFixed(2)}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr className="bg-muted/30 border-t-2 border-border">
                <td className="px-4 py-3 text-sm font-bold" colSpan={2}>Totals / Averages</td>
                <td className="px-4 py-3 text-sm font-bold tabular-nums">{courtUtil.reduce((s, c) => s + c.bookedHrs, 0)}</td>
                <td className="px-4 py-3 text-sm font-bold tabular-nums">{courtUtil.reduce((s, c) => s + c.availHrs, 0)}</td>
                <td className="px-4 py-3 text-sm font-bold tabular-nums">{avgUtil}%</td>
                <td className="px-4 py-3 text-sm font-bold tabular-nums">${courtUtil.reduce((s, c) => s + c.revenue, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold tabular-nums">${(courtUtil.reduce((s, c) => s + c.revenue, 0) / courtUtil.reduce((s, c) => s + c.bookedHrs, 0)).toFixed(2)}</td>
              </tr></tfoot>
            </table>
          </div>
        </ReportShell>
      );
    }

    // ── CUSTOMERS: Customer Retention ──
    if (rptCat === 'customers') {
      const retentionData = [
        { period: 'Oct 2025', active: 112, returning: 89, newCust: 23, churned: 8, retRate: 91.8 },
        { period: 'Nov 2025', active: 128, returning: 98, newCust: 30, churned: 12, retRate: 89.3 },
        { period: 'Dec 2025', active: 141, returning: 108, newCust: 33, churned: 15, retRate: 88.3 },
        { period: 'Jan 2026', active: 156, returning: 122, newCust: 34, churned: 11, retRate: 91.7 },
        { period: 'Feb 2026', active: 168, returning: 134, newCust: 34, churned: 14, retRate: 90.6 },
        { period: 'Mar 2026', active: 186, returning: 148, newCust: 38, churned: 10, retRate: 93.7 },
      ];
      return (
        <ReportShell filters={<><SFilterPill label="All Segments" active={true} onClick={() => {}} /><SFilterPill label="All Sports" active={false} onClick={() => {}} /></>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SMetricCard label="Active Customers" value="186" trend="↑ 11% vs 3 months ago" trendUp={true} />
            <SMetricCard label="Retention Rate" value="93.7%" trend="↑ 2.1pp vs last month" trendUp={true} />
            <SMetricCard label="New This Month" value="38" trend="↑ 12% vs last month" trendUp={true} />
            <SMetricCard label="Churned This Month" value="10" trend="↓ 4 fewer" trendUp={true} />
          </div>
          {/* Line chart — active vs returning */}
          <div className="card-elevated rounded-lg p-5">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-4">Customer Growth & Retention — 6 Month Trend</div>
            <svg viewBox="0 0 300 120" className="w-full h-40">
              <defs>
                <linearGradient id="custGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" /></linearGradient>
                <linearGradient id="retGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.1" /><stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0" /></linearGradient>
              </defs>
              {[20, 40, 60, 80, 100].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" />)}
              {/* Active line */}
              <path d={retentionData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i / 5) * 290 + 5},${105 - (d.active / 200) * 95}`).join(' ') + ` L 295,110 L 5,110 Z`} fill="url(#custGrad)" />
              <path d={retentionData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i / 5) * 290 + 5},${105 - (d.active / 200) * 95}`).join(' ')} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
              {retentionData.map((d, i) => <circle key={`a${i}`} cx={(i / 5) * 290 + 5} cy={105 - (d.active / 200) * 95} r="3" fill="hsl(var(--primary))" />)}
              {/* Returning line */}
              <path d={retentionData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${(i / 5) * 290 + 5},${105 - (d.returning / 200) * 95}`).join(' ')} fill="none" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 3" />
              {retentionData.map((d, i) => <circle key={`r${i}`} cx={(i / 5) * 290 + 5} cy={105 - (d.returning / 200) * 95} r="2.5" fill="hsl(var(--success))" />)}
              {retentionData.map((d, i) => <text key={i} x={(i / 5) * 290 + 5} y="115" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="500">{d.period.split(' ')[0].slice(0, 3)}</text>)}
            </svg>
            <div className="flex items-center gap-4 mt-1 justify-center">
              <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-primary rounded" /><span className="text-[10px] text-muted-foreground font-medium">Active Customers</span></div>
              <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 border-t-2 border-dashed border-green-500" /><span className="text-[10px] text-muted-foreground font-medium">Returning</span></div>
            </div>
          </div>
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Monthly Cohort Detail</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Period', 'Active', 'Returning', 'New', 'Churned', 'Retention Rate'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{retentionData.map(d => (
                <tr key={d.period} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-bold">{d.period}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{d.active}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{d.returning}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums text-green-600">+{d.newCust}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums text-red-500">-{d.churned}</td>
                  <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${d.retRate}%` }} /></div><span className="text-xs font-bold tabular-nums">{d.retRate}%</span></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </ReportShell>
      );
    }

    // ── PROGRAMS: Program Enrollment ──
    if (rptCat === 'programs') {
      const progData = [
        { name: 'PB Beginner Clinic', type: 'Clinic', sport: 'Pickleball', capacity: 16, enrolled: 12, waitlist: 2, rate: 75, revenue: 2160, attendance: 88 },
        { name: 'Junior Tennis Camp', type: 'Camp', sport: 'Tennis', capacity: 20, enrolled: 20, waitlist: 5, rate: 100, revenue: 9000, attendance: 94 },
        { name: 'Advanced PB Drills', type: 'Clinic', sport: 'Pickleball', capacity: 12, enrolled: 8, waitlist: 0, rate: 67, revenue: 1760, attendance: 83 },
        { name: 'Basketball Open Gym', type: 'Drop-in', sport: 'Basketball', capacity: 30, enrolled: 18, waitlist: 0, rate: 60, revenue: 810, attendance: 72 },
        { name: 'Private Tennis Lessons', type: 'Private', sport: 'Tennis', capacity: 0, enrolled: 14, waitlist: 0, rate: 0, revenue: 4760, attendance: 96 },
        { name: 'VB Skills Workshop', type: 'Clinic', sport: 'Volleyball', capacity: 14, enrolled: 6, waitlist: 0, rate: 43, revenue: 960, attendance: 0 },
      ];
      return (
        <ReportShell filters={<><SFilterPill label="All Types" active={true} onClick={() => {}} /><SFilterPill label="All Sports" active={false} onClick={() => {}} /><SFilterPill label="Active Only" active={false} onClick={() => {}} /></>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SMetricCard label="Active Programs" value="6" />
            <SMetricCard label="Total Enrolled" value="78" trend="↑ 12 vs last month" trendUp={true} />
            <SMetricCard label="Avg Fill Rate" value="69%" trend="↑ 5pp" trendUp={true} />
            <SMetricCard label="Program Revenue" value="$19,450" trend="↑ 18%" trendUp={true} />
          </div>
          {/* Horizontal enrollment bars */}
          <div className="card-elevated rounded-lg p-5">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-4">Enrollment vs Capacity</div>
            <div className="space-y-3">
              {progData.filter(p => p.capacity > 0).map(p => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-36 shrink-0 truncate">{p.name}</span>
                  <div className="flex-1 h-6 bg-muted/50 rounded overflow-hidden relative">
                    <div className="h-full rounded transition-all flex items-center px-2" style={{ width: `${p.rate}%`, backgroundColor: p.rate >= 90 ? 'hsl(var(--primary))' : p.rate >= 60 ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary) / 0.35)' }}>
                      {p.rate >= 30 && <span className="text-[9px] font-bold text-white">{p.enrolled}/{p.capacity}</span>}
                    </div>
                    {p.waitlist > 0 && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-orange-600">+{p.waitlist} waitlist</div>}
                  </div>
                  <span className="text-sm font-bold tabular-nums w-10 text-right">{p.rate}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Program Detail</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Program', 'Type', 'Sport', 'Enrolled', 'Capacity', 'Fill Rate', 'Waitlist', 'Revenue', 'Attendance'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-3 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{progData.map(p => (
                <tr key={p.name} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-3 py-2.5 text-sm font-bold text-primary">{p.name}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={p.type.toLowerCase()} /></td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium">{p.sport}</td>
                  <td className="px-3 py-2.5 text-sm font-medium tabular-nums">{p.enrolled}</td>
                  <td className="px-3 py-2.5 text-sm font-medium tabular-nums">{p.capacity || '—'}</td>
                  <td className="px-3 py-2.5">{p.capacity > 0 ? <div className="flex items-center gap-1.5"><div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full ${p.rate >= 90 ? 'bg-primary' : p.rate >= 60 ? 'bg-primary/60' : 'bg-primary/35'}`} style={{ width: `${p.rate}%` }} /></div><span className="text-xs font-medium tabular-nums">{p.rate}%</span></div> : <span className="text-xs text-muted-foreground">—</span>}</td>
                  <td className="px-3 py-2.5 text-sm font-medium tabular-nums">{p.waitlist > 0 ? <span className="text-orange-600 font-bold">{p.waitlist}</span> : '0'}</td>
                  <td className="px-3 py-2.5 text-sm font-medium tabular-nums">${p.revenue.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-sm font-medium tabular-nums">{p.attendance > 0 ? `${p.attendance}%` : '—'}</td>
                </tr>
              ))}</tbody>
              <tfoot><tr className="bg-muted/30 border-t-2 border-border">
                <td className="px-3 py-3 text-sm font-bold" colSpan={3}>Totals</td>
                <td className="px-3 py-3 text-sm font-bold tabular-nums">{progData.reduce((s, p) => s + p.enrolled, 0)}</td>
                <td className="px-3 py-3 text-sm font-bold tabular-nums">{progData.reduce((s, p) => s + p.capacity, 0)}</td>
                <td className="px-3 py-3 text-sm font-bold tabular-nums">69%</td>
                <td className="px-3 py-3 text-sm font-bold tabular-nums">{progData.reduce((s, p) => s + p.waitlist, 0)}</td>
                <td className="px-3 py-3 text-sm font-bold tabular-nums">${progData.reduce((s, p) => s + p.revenue, 0).toLocaleString()}</td>
                <td className="px-3 py-3 text-sm font-bold tabular-nums">87%</td>
              </tr></tfoot>
            </table>
          </div>
        </ReportShell>
      );
    }

    // ── STAFF: Staff Activity Log ──
    if (rptCat === 'staff') {
      const staffActivity = [
        { date: 'Mar 21, 2:15 PM', staff: 'Jessica Wong', role: 'Front Desk', action: 'Created booking', entity: 'Court 1 — Jane Doe', category: 'Bookings' },
        { date: 'Mar 21, 1:30 PM', staff: 'Mike Thompson', role: 'Manager', action: 'Processed refund', entity: '$45.00 → Kevin Nguyen', category: 'Billing' },
        { date: 'Mar 21, 12:45 PM', staff: 'Jessica Wong', role: 'Front Desk', action: 'Checked in customer', entity: 'Mike Russo — Court 6', category: 'Access' },
        { date: 'Mar 21, 11:00 AM', staff: 'Sarah Mitchell', role: 'Director', action: 'Sent campaign', entity: 'Spring Promo → 147 recipients', category: 'Communications' },
        { date: 'Mar 21, 10:30 AM', staff: 'Coach Sarah', role: 'Instructor', action: 'Marked attendance', entity: 'PB Clinic — 11/12 present', category: 'Programs' },
        { date: 'Mar 21, 9:15 AM', staff: 'Jessica Wong', role: 'Front Desk', action: 'Enrolled student', entity: 'Rachel Gomez → PB Clinic', category: 'Programs' },
        { date: 'Mar 21, 9:00 AM', staff: 'Jessica Wong', role: 'Front Desk', action: 'Opened register', entity: 'Front Desk — Float $200', category: 'POS' },
        { date: 'Mar 20, 8:00 PM', staff: 'Jessica Wong', role: 'Front Desk', action: 'Closed register', entity: 'Front Desk — Variance $0.00', category: 'POS' },
        { date: 'Mar 20, 6:15 PM', staff: 'Mike Thompson', role: 'Manager', action: 'Updated profile', entity: 'Lisa Park — contact info', category: 'Customers' },
        { date: 'Mar 20, 4:30 PM', staff: 'Mike Thompson', role: 'Manager', action: 'Changed court settings', entity: 'Court 6 — closing time', category: 'Courts' },
        { date: 'Mar 20, 2:00 PM', staff: 'Jessica Wong', role: 'Front Desk', action: 'Manual payment', entity: '$65.00 cash — Mike Russo', category: 'POS' },
        { date: 'Mar 20, 11:00 AM', staff: 'Dragan Jovanovic', role: 'Owner', action: 'Invited staff', entity: 'Emily Chen — View Only', category: 'Staff' },
      ];
      return (
        <ReportShell filters={<><SFilterPill label="All Staff" active={true} onClick={() => {}} /><SFilterPill label="All Actions" active={false} onClick={() => {}} /></>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SMetricCard label="Actions Today" value="42" trend="↑ 8 vs yesterday" trendUp={true} />
            <SMetricCard label="Active Staff" value="5" />
            <SMetricCard label="Most Active" value="Jessica Wong" trend="18 actions today" />
            <SMetricCard label="Actions This Week" value="187" />
          </div>
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Activity Log</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Date / Time', 'Staff', 'Role', 'Action', 'Entity', 'Category'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{staffActivity.map((a, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium whitespace-nowrap">{a.date}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{a.staff}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={a.role.toLowerCase().replace(' ', '_')} /></td>
                  <td className="px-4 py-2.5 text-sm font-medium">{a.action}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{a.entity}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={a.category.toLowerCase()} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </ReportShell>
      );
    }

    // ── COMPLIANCE: Waiver Status ──
    if (rptCat === 'compliance') {
      const waiverData = [
        { customer: 'Jane Doe', status: 'current', signedDate: 'Jan 15, 2026', expiryDate: 'Jan 15, 2027', daysLeft: 300 },
        { customer: 'Alex Martin', status: 'current', signedDate: 'Mar 1, 2026', expiryDate: 'Mar 1, 2027', daysLeft: 343 },
        { customer: 'Tom Kim', status: 'current', signedDate: 'Dec 1, 2025', expiryDate: 'Dec 1, 2026', daysLeft: 253 },
        { customer: 'Lisa Park', status: 'current', signedDate: 'Jan 1, 2026', expiryDate: 'Jan 1, 2027', daysLeft: 284 },
        { customer: 'Brandon Fisher', status: 'expiring_soon', signedDate: 'Apr 10, 2025', expiryDate: 'Apr 10, 2026', daysLeft: 18 },
        { customer: 'Maria Santos', status: 'expiring_soon', signedDate: 'Apr 20, 2025', expiryDate: 'Apr 20, 2026', daysLeft: 28 },
        { customer: 'David Wright', status: 'expired', signedDate: 'Feb 1, 2025', expiryDate: 'Feb 1, 2026', daysLeft: -48 },
        { customer: 'James O\'Brien', status: 'expired', signedDate: 'Dec 15, 2024', expiryDate: 'Dec 15, 2025', daysLeft: -96 },
        { customer: 'Olivia Brown', status: 'unsigned', signedDate: '—', expiryDate: '—', daysLeft: 0 },
      ];
      const waiverColors: Record<string, string> = { current: 'bg-green-100 text-green-700', expiring_soon: 'bg-yellow-100 text-yellow-700', expired: 'bg-red-100 text-red-700', unsigned: 'bg-gray-100 text-gray-600' };
      return (
        <ReportShell filters={<><SFilterPill label="All Status" active={true} onClick={() => {}} /><SFilterPill label="Upcoming Bookings Only" active={false} onClick={() => {}} /></>}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SMetricCard label="Current Waivers" value={`${waiverData.filter(w => w.status === 'current').length}`} />
            <SMetricCard label="Expiring Soon" value={`${waiverData.filter(w => w.status === 'expiring_soon').length}`} trend="Within 30 days" trendUp={false} />
            <SMetricCard label="Expired" value={`${waiverData.filter(w => w.status === 'expired').length}`} trend="Needs attention" trendUp={false} />
            <SMetricCard label="Unsigned" value={`${waiverData.filter(w => w.status === 'unsigned').length}`} trend="Upcoming booking" trendUp={false} />
          </div>
          {waiverData.filter(w => w.status === 'expired' || w.status === 'unsigned').length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">{waiverData.filter(w => w.status === 'expired' || w.status === 'unsigned').length} customers need waiver attention before their next booking</span>
            </div>
          )}
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Waiver Detail</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Customer', 'Status', 'Signed Date', 'Expiry Date', 'Days Remaining', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{waiverData.map((w, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-medium">{w.customer}</td>
                  <td className="px-4 py-2.5"><span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${waiverColors[w.status]}`}>{w.status.replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{w.signedDate}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{w.expiryDate}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{w.status === 'unsigned' ? '—' : w.daysLeft < 0 ? <span className="text-red-500 font-bold">{w.daysLeft}d (expired)</span> : w.daysLeft < 30 ? <span className="text-yellow-600 font-bold">{w.daysLeft}d</span> : <span>{w.daysLeft}d</span>}</td>
                  <td className="px-4 py-2.5">{(w.status === 'expired' || w.status === 'unsigned' || w.status === 'expiring_soon') && <Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Send className="w-3 h-3 mr-1" />Send Reminder</Button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </ReportShell>
      );
    }

    // ── ALL OTHER CATEGORIES: Phase placeholder ──
    const cat = REPORT_CATEGORIES.find(c => c.id === rptCat);
    const report = cat?.reports.find(r => r.id === rptId);
    const phase = report?.phase || 2;
    return (
      <ReportShell>
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">{cat && <cat.icon className="w-6 h-6 text-muted-foreground" />}</div>
          <h2 className="text-base font-bold mb-1">{activeReport.reportName}</h2>
          <p className="text-sm text-muted-foreground font-medium mb-3">This report is planned for Phase {phase}</p>
          <Badge variant="secondary" className="text-[10px]">Phase {phase}</Badge>
          <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern mt-6" onClick={() => setActiveReport(null)}><ArrowLeft className="w-3 h-3 mr-1.5" />Back to Reports</Button>
        </div>
      </ReportShell>
    );
  }

  // Landing page
  return (
    <>
      <SPageHeader title="Reports">
        <SDateRangePicker value={dateRange} onChange={setDateRange} />
        <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern"><Download className="w-3.5 h-3.5 mr-1.5" />Export</Button>
      </SPageHeader>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-3">
          <SMetricCard label="Revenue" value="$48,650" trend="↑ 8% vs last month" trendUp={true} />
          <SMetricCard label="Bookings" value="342" trend="↑ 5% vs last month" trendUp={true} />
          <SMetricCard label="Court Utilization" value="74%" trend="↑ 3pp vs last month" trendUp={true} />
          <SMetricCard label="New Customers" value="28" trend="↑ 15% vs last month" trendUp={true} />
          <SMetricCard label="Active Customers" value="186" trend="↑ 2% vs last month" trendUp={true} />
          <SMetricCard label="No-Show Rate" value="4.2%" trend="↓ 1pp vs last month" trendUp={true} />
        </div>

        {/* Quick Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Revenue Trend */}
          <div className="card-elevated rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" onClick={() => setActiveReport({ catId: 'financial', reportId: 'revenue-summary', reportName: 'Revenue Summary' })}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Revenue Trend — 12 Months</div>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>
            <svg viewBox="0 0 310 70" className="w-full h-24">
              <defs>
                <linearGradient id="revGrad2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" /><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" /></linearGradient>
              </defs>
              {/* Grid lines */}
              {[17, 35, 52].map(y => <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="hsl(var(--border))" strokeWidth="0.3" />)}
              {/* Last year line (dashed) */}
              <path d={lastYearPath} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
              {/* This year fill + line */}
              <path d={revenuePath + " L 300,65 L 0,65 Z"} fill="url(#revGrad2)" />
              <path d={revenuePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
              {/* Data points */}
              {monthlyRevenue.map((v, i) => <circle key={i} cx={(i / 11) * 300} cy={65 - (v / maxRev) * 60} r="2.5" fill="hsl(var(--primary))" />)}
            </svg>
            <div className="flex justify-between mt-1 text-[9px] text-muted-foreground font-medium">
              {['Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Feb'].map(m => <span key={m}>{m}</span>)}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1"><div className="w-4 h-0.5 bg-primary rounded" /><span className="text-[9px] text-muted-foreground font-medium">This Year</span></div>
              <div className="flex items-center gap-1"><div className="w-4 h-0.5 border-t border-dashed border-muted-foreground" /><span className="text-[9px] text-muted-foreground font-medium">Last Year</span></div>
            </div>
          </div>

          {/* Court Utilization Heatmap */}
          <div className="card-elevated rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" onClick={() => setActiveReport({ catId: 'courts', reportId: 'court-util', reportName: 'Court Utilization' })}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Court Utilization Heatmap</div>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="space-y-0.5">
              {heatmapData.map((row, ri) => (
                <div key={ri} className="flex items-center gap-1">
                  <span className="text-[8px] font-medium text-muted-foreground w-5 shrink-0">{dayLabels[ri]}</span>
                  <div className="flex gap-0.5 flex-1">
                    {row.map((val, ci) => (
                      <div key={ci} className="flex-1 h-3.5 rounded-sm transition-colors" title={`${dayLabels[ri]} ${8 + ci}:00 — ${Math.round(val * 100)}%`}
                        style={{ backgroundColor: val > 0.85 ? 'hsl(var(--primary))' : val > 0.65 ? 'hsl(var(--primary) / 0.65)' : val > 0.45 ? 'hsl(var(--primary) / 0.4)' : val > 0.25 ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--primary) / 0.08)' }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1.5 pl-6 text-[8px] text-muted-foreground font-medium">
              <span>8AM</span><span>12PM</span><span>4PM</span><span>8PM</span><span>10PM</span>
            </div>
            <div className="flex items-center gap-1 mt-2 justify-center">
              <span className="text-[8px] text-muted-foreground font-medium">Low</span>
              {[0.08, 0.2, 0.4, 0.65, 1].map((v, i) => <div key={i} className="w-4 h-2.5 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${v})` }} />)}
              <span className="text-[8px] text-muted-foreground font-medium">High</span>
            </div>
          </div>

          {/* Booking Source Mix */}
          <div className="card-elevated rounded-lg p-4 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" onClick={() => setActiveReport({ catId: 'courts', reportId: 'booking-source', reportName: 'Booking Source Analysis' })}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Booking Source Mix</div>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
                {(() => {
                  let offset = 0;
                  const circumference = 2 * Math.PI * 38;
                  return bookingSources.map(src => {
                    const dash = (src.pct / 100) * circumference;
                    const el = <circle key={src.label} cx="50" cy="50" r="38" fill="none" stroke={`hsl(var(--${src.color}))`} strokeWidth="18" strokeDasharray={`${dash} ${circumference}`} strokeDashoffset={-offset} transform="rotate(-90 50 50)" />;
                    offset += dash;
                    return el;
                  });
                })()}
                <text x="50" y="48" textAnchor="middle" fontSize="14" fontWeight="700" fill="hsl(var(--foreground))">342</text>
                <text x="50" y="59" textAnchor="middle" fontSize="7" fontWeight="500" fill="hsl(var(--muted-foreground))">bookings</text>
              </svg>
              <div className="space-y-2 flex-1">
                {bookingSources.map(src => (
                  <div key={src.label} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(--${src.color}))` }} />
                    <span className="text-xs font-medium flex-1">{src.label}</span>
                    <span className="text-xs font-bold tabular-nums">{src.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Report Catalog */}
        <div>
          <h2 className="text-sm font-bold mb-3">Report Catalog</h2>
          <div className="grid grid-cols-2 gap-3">
            {REPORT_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isExpanded = expandedCat === cat.id;
              const mvpCount = cat.reports.filter(r => r.phase === 1).length;
              return (
                <div key={cat.id} className="card-elevated rounded-lg overflow-hidden transition-all">
                  <div className="p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedCat(isExpanded ? null : cat.id)}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold">{cat.name}</h3>
                        {cat.restricted && <Shield className="w-3 h-3 text-muted-foreground" />}
                        <span className="text-[10px] text-muted-foreground font-medium">{cat.reports.length} reports</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">{cat.desc}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20">
                      {cat.reports.map(report => (
                        <button key={report.id} onClick={() => setActiveReport({ catId: cat.id, reportId: report.id, reportName: report.name })}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors group">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary shrink-0" />
                          <span className="text-sm font-medium flex-1">{report.name}</span>
                          {report.phase > 1 && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">P{report.phase}</Badge>}
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
