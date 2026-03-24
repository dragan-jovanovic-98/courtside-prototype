"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, SPageHeader, STabBar, SToolbar, SSearchInput, SFilterPill, SMetricCard } from "@/components/shared";
import { Plus, Download, X, MoreHorizontal, Receipt, RefreshCw, Send, DollarSign, TrendingUp, TrendingDown, ExternalLink, FileText, CheckCircle2, Pencil, Ban } from "lucide-react";

// ============================================================
// BILLING VIEW
// ============================================================
const MOCK_TRANSACTIONS = [
  { id: 'T001', date: 'Mar 21, 2026 2:15 PM', customer: 'Jane Doe', type: 'booking' as const, description: 'Court 1 — Pickleball (60 min)', amount: 45, method: 'Visa •4242', status: 'succeeded' as const, fee: 1.60, net: 43.40, tax: 5.85, stripeId: 'ch_3PqRsT4567890abc' },
  { id: 'T002', date: 'Mar 21, 2026 1:30 PM', customer: 'Alex Martin', type: 'membership' as const, description: 'Gold Membership — March', amount: 99, method: 'Mastercard •8811', status: 'succeeded' as const, fee: 3.17, net: 95.83, tax: 12.87, stripeId: 'ch_3PqRsT4567890abd' },
  { id: 'T003', date: 'Mar 21, 2026 12:45 PM', customer: 'Tom Kim', type: 'booking' as const, description: 'Court 5 — Tennis (120 min)', amount: 90, method: 'Visa •3456', status: 'succeeded' as const, fee: 2.90, net: 87.10, tax: 11.70, stripeId: 'ch_3PqRsT4567890abe' },
  { id: 'T004', date: 'Mar 21, 2026 11:20 AM', customer: 'Sarah Johnson', type: 'program' as const, description: 'PB Clinic — Spring Session', amount: 180, method: 'Apple Pay', status: 'succeeded' as const, fee: 5.52, net: 174.48, tax: 23.40, stripeId: 'ch_3PqRsT4567890abf' },
  { id: 'T005', date: 'Mar 21, 2026 10:00 AM', customer: 'Mike Russo', type: 'pos' as const, description: 'Pro Shop — Paddle + Balls', amount: 65, method: 'Cash', status: 'succeeded' as const, fee: 0, net: 65, tax: 8.45, stripeId: '' },
  { id: 'T006', date: 'Mar 21, 2026 9:15 AM', customer: 'Emma Singh', type: 'booking' as const, description: 'Court 2 — Pickleball (60 min)', amount: 45, method: 'Google Pay', status: 'pending' as const, fee: 1.60, net: 43.40, tax: 5.85, stripeId: 'pi_3PqRsT4567890abg' },
  { id: 'T007', date: 'Mar 20, 2026 8:30 PM', customer: 'Brandon Fisher', type: 'booking' as const, description: 'Court 5 — Tennis (120 min)', amount: 76.50, method: 'Amex •0011', status: 'succeeded' as const, fee: 2.68, net: 73.82, tax: 9.95, stripeId: 'ch_3PqRsT4567890abh' },
  { id: 'T008', date: 'Mar 20, 2026 7:00 PM', customer: 'Lisa Park', type: 'membership' as const, description: 'Gold Membership — March (Retry)', amount: 99, method: 'Visa •9012', status: 'failed' as const, fee: 0, net: 0, tax: 0, stripeId: 'pi_3PqRsT4567890abi' },
  { id: 'T009', date: 'Mar 20, 2026 5:45 PM', customer: 'Priya Patel', type: 'booking' as const, description: 'Court 1 — Pickleball (60 min)', amount: 33.75, method: 'Visa •6789', status: 'succeeded' as const, fee: 1.28, net: 32.47, tax: 4.39, stripeId: 'ch_3PqRsT4567890abj' },
  { id: 'T010', date: 'Mar 20, 2026 4:00 PM', customer: 'Kevin Nguyen', type: 'refund' as const, description: 'Refund — Court 3 Cancellation', amount: -45, method: 'Visa •2345', status: 'refunded' as const, fee: 0, net: -45, tax: -5.85, stripeId: 're_3PqRsT4567890abk' },
  { id: 'T011', date: 'Mar 20, 2026 2:30 PM', customer: 'Rachel Gomez', type: 'booking' as const, description: 'Court 1 — Pickleball (60 min)', amount: 45, method: 'Visa •7890', status: 'succeeded' as const, fee: 1.60, net: 43.40, tax: 5.85, stripeId: 'ch_3PqRsT4567890abl' },
  { id: 'T012', date: 'Mar 20, 2026 1:00 PM', customer: 'Daniel Harris', type: 'booking' as const, description: 'Court 1 — Pickleball (60 min)', amount: 45, method: 'Visa •6677', status: 'succeeded' as const, fee: 1.60, net: 43.40, tax: 5.85, stripeId: 'ch_3PqRsT4567890abm' },
  { id: 'T013', date: 'Mar 19, 2026 6:15 PM', customer: 'Maria Santos', type: 'booking' as const, description: 'Court 1 — Pickleball (60 min)', amount: 40.50, method: 'Mastercard •3344', status: 'succeeded' as const, fee: 1.45, net: 39.05, tax: 5.27, stripeId: 'ch_3PqRsT4567890abn' },
  { id: 'T014', date: 'Mar 19, 2026 3:00 PM', customer: 'Chris Taylor', type: 'booking' as const, description: 'Court 2 — Pickleball (60 min)', amount: 36, method: 'Visa •1122', status: 'succeeded' as const, fee: 1.34, net: 34.66, tax: 4.68, stripeId: 'ch_3PqRsT4567890abo' },
  { id: 'T015', date: 'Mar 19, 2026 10:00 AM', customer: 'Anika Sharma', type: 'pos' as const, description: 'Day Pass', amount: 55, method: 'Visa •4455', status: 'succeeded' as const, fee: 1.90, net: 53.10, tax: 7.15, stripeId: 'ch_3PqRsT4567890abp' },
];
const MOCK_INVOICES = [
  { id: 'INV001', number: 'INV-2026-001234', customer: 'Acme Corp', email: 'billing@acme.com', dateIssued: 'Mar 1, 2026', dueDate: 'Mar 31, 2026', amount: 2500, paid: 2500, outstanding: 0, status: 'paid' as const, lineItems: [{ desc: 'Court 6 — Basketball (60 min) × 20', qty: 20, unitPrice: 60, amount: 1200 }, { desc: 'Court 6 — Basketball (90 min) × 8', qty: 8, unitPrice: 90, amount: 720 }, { desc: 'Court 5 — Tennis (120 min) × 4', qty: 4, unitPrice: 90, amount: 360 }, { desc: 'Equipment Rental', qty: 1, unitPrice: 220, amount: 220 }], subtotal: 2500, tax: 325, paymentMethod: 'Interac e-Transfer', paidDate: 'Mar 25, 2026', notes: 'Monthly corporate booking package — March 2026' },
  { id: 'INV002', number: 'INV-2026-001235', customer: 'SportsCo Inc.', email: 'ap@sportsco.com', dateIssued: 'Mar 1, 2026', dueDate: 'Mar 31, 2026', amount: 1200, paid: 600, outstanding: 600, status: 'partial' as const, lineItems: [{ desc: 'Court 1 — Pickleball (60 min) × 15', qty: 15, unitPrice: 45, amount: 675 }, { desc: 'Court 3 — Pickleball (60 min) × 10', qty: 10, unitPrice: 45, amount: 450 }, { desc: 'Equipment Rental', qty: 1, unitPrice: 75, amount: 75 }], subtotal: 1200, tax: 156, paymentMethod: 'Check #4521', paidDate: 'Mar 15, 2026', notes: 'Partial payment received — remaining $600 due by EOM' },
  { id: 'INV003', number: 'INV-2026-001236', customer: 'City Rec League', email: 'league@cityrecreation.ca', dateIssued: 'Feb 15, 2026', dueDate: 'Mar 15, 2026', amount: 800, paid: 0, outstanding: 800, status: 'overdue' as const, lineItems: [{ desc: 'Court 6 — Basketball League (2hr) × 4', qty: 4, unitPrice: 120, amount: 480 }, { desc: 'Referee Fees', qty: 4, unitPrice: 50, amount: 200 }, { desc: 'Scorekeeping', qty: 4, unitPrice: 30, amount: 120 }], subtotal: 800, tax: 104, paymentMethod: '', paidDate: '', notes: 'Follow up sent Mar 18. Contact: Mike — 416-555-3210' },
  { id: 'INV004', number: 'INV-2026-001237', customer: 'Jane Doe', email: 'jane.doe@email.com', dateIssued: 'Mar 15, 2026', dueDate: 'Apr 15, 2026', amount: 99, paid: 0, outstanding: 99, status: 'sent' as const, lineItems: [{ desc: 'Gold Membership — April 2026', qty: 1, unitPrice: 99, amount: 99 }], subtotal: 99, tax: 12.87, paymentMethod: '', paidDate: '', notes: '' },
  { id: 'INV005', number: 'INV-2026-001238', customer: 'Tom Kim', email: 'tom.k@email.com', dateIssued: 'Mar 20, 2026', dueDate: 'Apr 20, 2026', amount: 297, paid: 99, outstanding: 198, status: 'partial' as const, lineItems: [{ desc: 'Gold Membership — Mar', qty: 1, unitPrice: 99, amount: 99 }, { desc: 'Gold Membership — Apr', qty: 1, unitPrice: 99, amount: 99 }, { desc: 'Gold Membership — May', qty: 1, unitPrice: 99, amount: 99 }], subtotal: 297, tax: 38.61, paymentMethod: 'Visa •3456', paidDate: 'Mar 22, 2026', notes: 'Quarterly membership prepay' },
  { id: 'INV006', number: 'INV-2026-001239', customer: 'Lisa Park', email: 'lisa.park@email.com', dateIssued: 'Mar 21, 2026', dueDate: '', amount: 99, paid: 0, outstanding: 99, status: 'draft' as const, lineItems: [{ desc: 'Gold Membership — April 2026', qty: 1, unitPrice: 99, amount: 99 }], subtotal: 99, tax: 12.87, paymentMethod: '', paidDate: '', notes: 'Failed payment retry exhausted — convert to invoice' },
  { id: 'INV007', number: 'INV-2026-001240', customer: 'Brandon Fisher', email: 'brandon.f@email.com', dateIssued: 'Mar 1, 2026', dueDate: 'Mar 15, 2026', amount: 297, paid: 297, outstanding: 0, status: 'paid' as const, lineItems: [{ desc: 'Court 5 — Tennis (120 min) × 3', qty: 3, unitPrice: 76.50, amount: 229.50 }, { desc: 'Ball Machine Rental × 3', qty: 3, unitPrice: 10, amount: 30 }, { desc: 'Locker Rental — March', qty: 1, unitPrice: 37.50, amount: 37.50 }], subtotal: 297, tax: 38.61, paymentMethod: 'Amex •0011', paidDate: 'Mar 10, 2026', notes: '' },
  { id: 'INV008', number: 'INV-2026-001241', customer: 'Youth League Assoc.', email: 'treasurer@youthleague.org', dateIssued: 'Mar 10, 2026', dueDate: 'Apr 10, 2026', amount: 450, paid: 0, outstanding: 450, status: 'sent' as const, lineItems: [{ desc: 'Court 6 — Youth Basketball (90 min) × 4', qty: 4, unitPrice: 75, amount: 300 }, { desc: 'Equipment — Balls & Cones', qty: 1, unitPrice: 50, amount: 50 }, { desc: 'Coaching Support', qty: 4, unitPrice: 25, amount: 100 }], subtotal: 450, tax: 58.50, paymentMethod: '', paidDate: '', notes: 'Spring session — first invoice' },
];

// Invoice customers for Create Invoice wizard
const INVOICE_CUSTOMERS = [
  { id: 'C001', name: 'Acme Corp', email: 'billing@acme.com', phone: '+1 (416) 555-9999', unpaidBookings: 12, unpaidTotal: 2160 },
  { id: 'C002', name: 'SportsCo Inc.', email: 'ap@sportsco.com', phone: '+1 (647) 555-8888', unpaidBookings: 8, unpaidTotal: 960 },
  { id: 'C003', name: 'City Rec League', email: 'league@cityrecreation.ca', phone: '+1 (416) 555-3210', unpaidBookings: 4, unpaidTotal: 640 },
  { id: 'C004', name: 'Jane Doe', email: 'jane.doe@email.com', phone: '+1 (416) 555-1234', unpaidBookings: 0, unpaidTotal: 0 },
  { id: 'C005', name: 'Youth League Assoc.', email: 'treasurer@youthleague.org', phone: '+1 (905) 555-7777', unpaidBookings: 6, unpaidTotal: 540 },
];
// Mock unpaid bookings for invoice wizard
const MOCK_UNPAID_BOOKINGS = [
  { id: 'UB01', date: 'Mar 5, 2026', court: 'Court 6', sport: 'Basketball', duration: '60 min', amount: 60, selected: true },
  { id: 'UB02', date: 'Mar 7, 2026', court: 'Court 6', sport: 'Basketball', duration: '60 min', amount: 60, selected: true },
  { id: 'UB03', date: 'Mar 10, 2026', court: 'Court 6', sport: 'Basketball', duration: '90 min', amount: 90, selected: true },
  { id: 'UB04', date: 'Mar 12, 2026', court: 'Court 6', sport: 'Basketball', duration: '60 min', amount: 60, selected: true },
  { id: 'UB05', date: 'Mar 14, 2026', court: 'Court 5', sport: 'Tennis', duration: '120 min', amount: 90, selected: true },
  { id: 'UB06', date: 'Mar 17, 2026', court: 'Court 6', sport: 'Basketball', duration: '60 min', amount: 60, selected: false },
  { id: 'UB07', date: 'Mar 19, 2026', court: 'Court 6', sport: 'Basketball', duration: '90 min', amount: 90, selected: false },
  { id: 'UB08', date: 'Mar 21, 2026', court: 'Court 5', sport: 'Tennis', duration: '120 min', amount: 90, selected: false },
];

// Reports data
const REPORT_REVENUE_DAILY = [
  { date: 'Mar 21', bookings: 2847, memberships: 198, programs: 180, pos: 120, total: 3345 },
  { date: 'Mar 20', bookings: 2210, memberships: 99, programs: 0, pos: 85, total: 2394 },
  { date: 'Mar 19', bookings: 1890, memberships: 297, programs: 360, pos: 55, total: 2602 },
  { date: 'Mar 18', bookings: 1650, memberships: 0, programs: 0, pos: 210, total: 1860 },
  { date: 'Mar 17', bookings: 2420, memberships: 198, programs: 180, pos: 95, total: 2893 },
  { date: 'Mar 16', bookings: 1980, memberships: 0, programs: 0, pos: 150, total: 2130 },
  { date: 'Mar 15', bookings: 2100, memberships: 99, programs: 540, pos: 180, total: 2919 },
];
const REPORT_AR_AGING = [
  { bucket: 'Current (0 days)', customers: 3, amount: 648, pct: 21 },
  { bucket: '1–15 days', customers: 2, amount: 649, pct: 21 },
  { bucket: '16–30 days', customers: 1, amount: 800, pct: 26 },
  { bucket: '31–60 days', customers: 0, amount: 0, pct: 0 },
  { bucket: '60+ days', customers: 1, amount: 950, pct: 32 },
];
const REPORT_PAYMENT_METHODS = [
  { method: 'Visa', count: 142, amount: 8540, pct: 44.2 },
  { method: 'Mastercard', count: 38, amount: 3420, pct: 17.7 },
  { method: 'Apple Pay', count: 29, amount: 2180, pct: 11.3 },
  { method: 'Google Pay', count: 22, amount: 1540, pct: 8.0 },
  { method: 'Amex', count: 18, amount: 1620, pct: 8.4 },
  { method: 'Cash', count: 15, amount: 975, pct: 5.0 },
  { method: 'Interac e-Transfer', count: 8, amount: 680, pct: 3.5 },
  { method: 'Account Credit', count: 5, amount: 375, pct: 1.9 },
];
const REPORT_PAYOUTS = [
  { id: 'po_1', date: 'Mar 21, 2026', arrival: 'Mar 23, 2026', amount: 3120.45, txCount: 28, status: 'in_transit' as const },
  { id: 'po_2', date: 'Mar 19, 2026', arrival: 'Mar 21, 2026', amount: 4280.10, txCount: 35, status: 'paid' as const },
  { id: 'po_3', date: 'Mar 17, 2026', arrival: 'Mar 19, 2026', amount: 2890.55, txCount: 22, status: 'paid' as const },
  { id: 'po_4', date: 'Mar 14, 2026', arrival: 'Mar 17, 2026', amount: 5150.20, txCount: 41, status: 'paid' as const },
  { id: 'po_5', date: 'Mar 12, 2026', arrival: 'Mar 14, 2026', amount: 3670.80, txCount: 30, status: 'paid' as const },
];

export default function BillingView() {
  const [tab, setTab] = useState('Overview');
  const [selectedTx, setSelectedTx] = useState<typeof MOCK_TRANSACTIONS[0] | null>(null);
  const [selectedInv, setSelectedInv] = useState<typeof MOCK_INVOICES[0] | null>(null);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [txStatusFilter, setTxStatusFilter] = useState('all');
  const [invStatusFilter, setInvStatusFilter] = useState('all');
  // Create Invoice wizard
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardCustomer, setWizardCustomer] = useState<typeof INVOICE_CUSTOMERS[0] | null>(null);
  const [wizardCustomerSearch, setWizardCustomerSearch] = useState('');
  const [wizardBookings, setWizardBookings] = useState(MOCK_UNPAID_BOOKINGS.map(b => ({ ...b })));
  const [wizardNotes, setWizardNotes] = useState('');
  // Reports
  const [reportType, setReportType] = useState('revenue');

  const filteredTx = MOCK_TRANSACTIONS.filter(tx => {
    if (search && !tx.customer.toLowerCase().includes(search.toLowerCase())) return false;
    if (txTypeFilter !== 'all' && tx.type !== txTypeFilter) return false;
    if (txStatusFilter !== 'all' && tx.status !== txStatusFilter) return false;
    return true;
  });
  const filteredInv = MOCK_INVOICES.filter(inv => {
    if (search && !inv.customer.toLowerCase().includes(search.toLowerCase()) && !inv.number.toLowerCase().includes(search.toLowerCase())) return false;
    if (invStatusFilter !== 'all' && inv.status !== invStatusFilter) return false;
    return true;
  });

  const periodRevenue = period === 'today' ? { value: '$2,847', txCount: 12, trend: '↑ 18% vs yesterday', trendUp: true } : period === 'week' ? { value: '$14,230', txCount: 84, trend: '↑ 12% vs last week', trendUp: true } : { value: '$48,650', txCount: 312, trend: '↑ 8% vs last month', trendUp: true };

  const wizardSelectedBookings = wizardBookings.filter(b => b.selected);
  const wizardSubtotal = wizardSelectedBookings.reduce((s, b) => s + b.amount, 0);
  const wizardTax = Math.round(wizardSubtotal * 0.13 * 100) / 100;
  const wizardTotal = wizardSubtotal + wizardTax;

  const resetWizard = () => { setShowCreateInvoice(false); setWizardStep(1); setWizardCustomer(null); setWizardCustomerSearch(''); setWizardBookings(MOCK_UNPAID_BOOKINGS.map(b => ({ ...b }))); setWizardNotes(''); };

  // Close detail panels when switching tabs
  const handleTabChange = (t: string) => { setTab(t); setSelectedTx(null); setSelectedInv(null); setSearch(''); };

  return (
    <>
      <SPageHeader title="Billing">
        <Button variant="outline" className="h-9 text-xs font-bold px-4 btn-outline-modern"><Download className="w-3.5 h-3.5 mr-1.5" />Export</Button>
        <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setShowCreateInvoice(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Create Invoice</Button>
      </SPageHeader>
      <STabBar tabs={['Overview', 'Transactions', 'Invoices', 'Reports']} active={tab} onChange={handleTabChange} />
      <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">

        {/* ===== OVERVIEW TAB ===== */}
        {tab === 'Overview' && (<>
          {/* Period selector */}
          <div className="flex items-center gap-2">
            {([['today', 'Today'], ['week', 'Last 7 Days'], ['month', 'This Month']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setPeriod(key)} className={`h-8 px-4 rounded-md text-xs font-bold transition-colors ${period === key ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>{label}</button>
            ))}
          </div>

          {/* Revenue ticker */}
          <div className="card-elevated rounded-lg p-5 flex items-center gap-6">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Revenue ({period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'})</div>
              <div className="text-3xl font-bold mt-1">{periodRevenue.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium flex items-center gap-1 ${periodRevenue.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {periodRevenue.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{periodRevenue.trend}
                </span>
                <span className="text-xs text-muted-foreground font-medium">· {periodRevenue.txCount} transactions</span>
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SMetricCard label="Outstanding" value="$3,420" trend="4 unpaid invoices · 1 overdue" />
            <SMetricCard label="Refunds" value="$245" trend="3 refunds this month" />
            <SMetricCard label="Account Credits" value="$175" trend="5 credits issued" />
          </div>

          {/* Recent Transactions */}
          <div className="card-elevated rounded-lg">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold">Recent Transactions</h2>
              <button onClick={() => handleTabChange('Transactions')} className="text-xs font-semibold text-primary hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {['Date', 'Customer', 'Type', 'Description', 'Amount', 'Method', 'Status'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
                </tr></thead>
                <tbody>{MOCK_TRANSACTIONS.slice(0, 8).map(tx => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => { handleTabChange('Transactions'); setSelectedTx(tx); }}>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium whitespace-nowrap">{tx.date}</td>
                    <td className="px-4 py-2.5 text-sm font-medium">{tx.customer}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={tx.type} /></td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium max-w-48 truncate">{tx.description}</td>
                    <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{tx.amount < 0 ? <span className="text-red-500">-${Math.abs(tx.amount).toFixed(2)}</span> : `$${tx.amount.toFixed(2)}`}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{tx.method}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={tx.status} /></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>

          {/* Payment Method Breakdown (mini) */}
          <div className="card-elevated rounded-lg">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold">Payment Methods (This Month)</h2>
              <button onClick={() => { handleTabChange('Reports'); setReportType('methods'); }} className="text-xs font-semibold text-primary hover:underline">Full Report</button>
            </div>
            <div className="p-4 space-y-2">
              {REPORT_PAYMENT_METHODS.slice(0, 4).map(pm => (
                <div key={pm.method} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-24 shrink-0">{pm.method}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pm.pct}%` }} /></div>
                  <span className="text-xs font-bold tabular-nums w-14 text-right">{pm.pct}%</span>
                  <span className="text-xs text-muted-foreground font-medium tabular-nums w-20 text-right">${pm.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </>)}

        {/* ===== TRANSACTIONS TAB ===== */}
        {tab === 'Transactions' && (<>
          <SToolbar>
            <SSearchInput placeholder="Search by name or email..." value={search} onChange={setSearch} />
            <SFilterPill label="All Types" active={txTypeFilter === 'all'} onClick={() => setTxTypeFilter('all')} />
            <SFilterPill label="Bookings" active={txTypeFilter === 'booking'} onClick={() => setTxTypeFilter(txTypeFilter === 'booking' ? 'all' : 'booking')} />
            <SFilterPill label="Memberships" active={txTypeFilter === 'membership'} onClick={() => setTxTypeFilter(txTypeFilter === 'membership' ? 'all' : 'membership')} />
            <SFilterPill label={txStatusFilter === 'all' ? 'All Status' : txStatusFilter} active={txStatusFilter !== 'all'} onClick={() => setTxStatusFilter(txStatusFilter === 'all' ? 'succeeded' : txStatusFilter === 'succeeded' ? 'failed' : txStatusFilter === 'failed' ? 'pending' : 'all')} />
            <div className="flex-1" />
            <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Download className="w-3 h-3 mr-1.5" />Export</Button>
          </SToolbar>
          <div className="card-elevated rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Date', 'Customer', 'Type', 'Description', 'Amount', 'Tax', 'Method', 'Status', 'Fee', 'Net', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
              </tr></thead>
              <tbody>{filteredTx.map(tx => (
                <tr key={tx.id} className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer ${selectedTx?.id === tx.id ? 'bg-primary/5' : ''}`} onClick={() => { setSelectedTx(tx); setSelectedInv(null); }}>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{tx.customer}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={tx.type} /></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium max-w-48 truncate">{tx.description}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{tx.amount < 0 ? <span className="text-red-500">-${Math.abs(tx.amount).toFixed(2)}</span> : `$${tx.amount.toFixed(2)}`}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums font-medium">{tx.tax !== 0 ? `$${Math.abs(tx.tax).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{tx.method}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={tx.status} /></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums font-medium">{tx.fee > 0 ? `$${tx.fee.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{tx.net < 0 ? <span className="text-red-500">-${Math.abs(tx.net).toFixed(2)}</span> : tx.net > 0 ? `$${tx.net.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2.5"><button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
                </tr>
              ))}</tbody>
            </table>
            {filteredTx.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground font-medium">No transactions match your filters.</div>}
          </div>
        </>)}

        {/* ===== INVOICES TAB ===== */}
        {tab === 'Invoices' && (<>
          <SToolbar>
            <SSearchInput placeholder="Search invoices..." value={search} onChange={setSearch} />
            <SFilterPill label="All" active={invStatusFilter === 'all'} onClick={() => setInvStatusFilter('all')} />
            <SFilterPill label="Sent" active={invStatusFilter === 'sent'} onClick={() => setInvStatusFilter(invStatusFilter === 'sent' ? 'all' : 'sent')} />
            <SFilterPill label="Overdue" active={invStatusFilter === 'overdue'} onClick={() => setInvStatusFilter(invStatusFilter === 'overdue' ? 'all' : 'overdue')} />
            <SFilterPill label="Partial" active={invStatusFilter === 'partial'} onClick={() => setInvStatusFilter(invStatusFilter === 'partial' ? 'all' : 'partial')} />
            <SFilterPill label="Draft" active={invStatusFilter === 'draft'} onClick={() => setInvStatusFilter(invStatusFilter === 'draft' ? 'all' : 'draft')} />
            <div className="flex-1" />
            <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Download className="w-3 h-3 mr-1.5" />Export</Button>
            <Button className="h-8 text-xs font-bold btn-primary-modern" onClick={() => setShowCreateInvoice(true)}><Plus className="w-3 h-3 mr-1.5" />Create Invoice</Button>
          </SToolbar>
          <div className="card-elevated rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Invoice #', 'Customer', 'Issued', 'Due', 'Amount', 'Paid', 'Outstanding', 'Status', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
              </tr></thead>
              <tbody>{filteredInv.map(inv => (
                <tr key={inv.id} className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer ${selectedInv?.id === inv.id ? 'bg-primary/5' : ''}`} onClick={() => { setSelectedInv(inv); setSelectedTx(null); }}>
                  <td className="px-4 py-2.5 text-sm font-bold text-primary">{inv.number}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{inv.customer}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{inv.dateIssued}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{inv.dueDate || '—'}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${inv.amount.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-sm font-medium tabular-nums text-green-600">{inv.paid > 0 ? `$${inv.paid.toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-2.5 text-sm font-bold tabular-nums">{inv.outstanding > 0 ? <span className={inv.status === 'overdue' ? 'text-red-500' : ''}>${inv.outstanding.toFixed(2)}</span> : '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-2.5"><button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
                </tr>
              ))}</tbody>
            </table>
            {filteredInv.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground font-medium">No invoices match your filters.</div>}
          </div>
        </>)}

        {/* ===== REPORTS TAB ===== */}
        {tab === 'Reports' && (<>
          {/* Report type selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {[['revenue', 'Daily Revenue'], ['aging', 'AR Aging'], ['methods', 'Payment Methods'], ['payouts', 'Payouts']].map(([key, label]) => (
              <button key={key} onClick={() => setReportType(key)} className={`h-8 px-4 rounded-md text-xs font-bold transition-colors ${reportType === key ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>{label}</button>
            ))}
            <div className="flex-1" />
            <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Download className="w-3 h-3 mr-1.5" />Export CSV</Button>
            <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><FileText className="w-3 h-3 mr-1.5" />Export PDF</Button>
          </div>

          {/* Daily Revenue Summary */}
          {reportType === 'revenue' && (
            <div className="card-elevated rounded-lg">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold">Daily Revenue Summary</h2>
                <span className="text-xs text-muted-foreground font-medium">Last 7 days</span>
              </div>
              {/* Mini bar chart */}
              <div className="px-4 pt-4 pb-2 flex items-end gap-2 h-32">
                {REPORT_REVENUE_DAILY.map(d => {
                  const maxRev = Math.max(...REPORT_REVENUE_DAILY.map(r => r.total));
                  const h = (d.total / maxRev) * 100;
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold tabular-nums text-muted-foreground">${(d.total / 1000).toFixed(1)}k</span>
                      <div className="w-full rounded-t" style={{ height: `${h}%`, background: 'oklch(0.62 0.12 192 / 0.7)' }} />
                      <span className="text-[9px] font-medium text-muted-foreground">{d.date}</span>
                    </div>
                  );
                })}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-t border-border">
                    {['Date', 'Bookings', 'Memberships', 'Programs', 'POS', 'Total'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                  </tr></thead>
                  <tbody>{REPORT_REVENUE_DAILY.map(d => (
                    <tr key={d.date} className="border-b border-border/50">
                      <td className="px-4 py-2.5 text-sm font-medium">{d.date}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-medium">${d.bookings.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-medium">${d.memberships.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-medium">{d.programs > 0 ? `$${d.programs.toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-medium">${d.pos.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-bold">${d.total.toLocaleString()}</td>
                    </tr>
                  ))}</tbody>
                  <tfoot><tr className="border-t-2 border-border bg-muted/20">
                    <td className="px-4 py-2.5 text-sm font-bold">Total</td>
                    <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${REPORT_REVENUE_DAILY.reduce((s, d) => s + d.bookings, 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${REPORT_REVENUE_DAILY.reduce((s, d) => s + d.memberships, 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${REPORT_REVENUE_DAILY.reduce((s, d) => s + d.programs, 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${REPORT_REVENUE_DAILY.reduce((s, d) => s + d.pos, 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${REPORT_REVENUE_DAILY.reduce((s, d) => s + d.total, 0).toLocaleString()}</td>
                  </tr></tfoot>
                </table>
              </div>
            </div>
          )}

          {/* AR Aging Report */}
          {reportType === 'aging' && (
            <div className="card-elevated rounded-lg">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-bold">Accounts Receivable — Aging Summary</h2>
                <span className="text-xs text-muted-foreground font-medium">Total Outstanding: ${REPORT_AR_AGING.reduce((s, r) => s + r.amount, 0).toLocaleString()}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    {['Age Bucket', 'Customers', 'Amount', '% of Total', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                  </tr></thead>
                  <tbody>{REPORT_AR_AGING.map(r => (
                    <tr key={r.bucket} className="border-b border-border/50">
                      <td className="px-4 py-2.5 text-sm font-medium">{r.bucket}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-medium">{r.customers}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-bold">{r.amount > 0 ? `$${r.amount.toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="w-24 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.bucket.includes('60+') ? '#ef4444' : r.bucket.includes('31') ? '#f59e0b' : r.bucket.includes('16') ? '#eab308' : 'oklch(0.62 0.12 192)' }} /></div><span className="text-xs font-medium tabular-nums">{r.pct}%</span></div></td>
                      <td className="px-4 py-2.5">{r.amount > 0 && <button className="text-xs font-semibold text-primary hover:underline">View</button>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Methods Report */}
          {reportType === 'methods' && (
            <div className="card-elevated rounded-lg">
              <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-bold">Payment Method Breakdown — This Month</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    {['Method', 'Transactions', 'Revenue', '% of Total', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                  </tr></thead>
                  <tbody>{REPORT_PAYMENT_METHODS.map(pm => (
                    <tr key={pm.method} className="border-b border-border/50">
                      <td className="px-4 py-2.5 text-sm font-medium">{pm.method}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-medium">{pm.count}</td>
                      <td className="px-4 py-2.5 text-sm tabular-nums font-bold">${pm.amount.toLocaleString()}</td>
                      <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="w-24 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${pm.pct}%` }} /></div><span className="text-xs font-medium tabular-nums">{pm.pct}%</span></div></td>
                      <td />
                    </tr>
                  ))}</tbody>
                  <tfoot><tr className="border-t-2 border-border bg-muted/20">
                    <td className="px-4 py-2.5 text-sm font-bold">Total</td>
                    <td className="px-4 py-2.5 text-sm font-bold tabular-nums">{REPORT_PAYMENT_METHODS.reduce((s, p) => s + p.count, 0)}</td>
                    <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${REPORT_PAYMENT_METHODS.reduce((s, p) => s + p.amount, 0).toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-sm font-bold">100%</td>
                    <td />
                  </tr></tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Payouts Report */}
          {reportType === 'payouts' && (
            <div className="space-y-4">
              <div className="card-elevated rounded-lg p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-primary" /></div>
                <div className="flex-1">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Stripe Connect</div>
                  <div className="text-sm font-bold">Connected · Courtside Sports Complex</div>
                </div>
                <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><ExternalLink className="w-3 h-3 mr-1.5" />Stripe Dashboard</Button>
              </div>
              <div className="card-elevated rounded-lg">
                <div className="px-4 py-3 border-b border-border"><h2 className="text-sm font-bold">Recent Payouts</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Payout Date', 'Arrival', 'Amount', 'Transactions', 'Status'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>{REPORT_PAYOUTS.map(po => (
                      <tr key={po.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer">
                        <td className="px-4 py-2.5 text-sm font-medium">{po.date}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{po.arrival}</td>
                        <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${po.amount.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-sm tabular-nums font-medium">{po.txCount}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={po.status} /></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>)}
      </div>

      {/* ===== TRANSACTION DETAIL PANEL ===== */}
      {selectedTx && (
        <div className="w-full md:w-[340px] absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
          <div className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0">
            <h3 className="text-sm font-bold">Transaction Details</h3>
            <button onClick={() => setSelectedTx(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Customer</div>
              <div className="text-sm font-bold">{selectedTx.customer}</div>
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Type</div><StatusBadge status={selectedTx.type} className="mt-1" /></div>
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</div><StatusBadge status={selectedTx.status} className="mt-1" /></div>
            </div>
            <div className="h-px bg-border" />
            <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Description</div><div className="text-sm font-medium mt-1">{selectedTx.description}</div></div>
            <div className="h-px bg-border" />
            <div className="card-elevated rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Amount</span><span className="font-bold">${Math.abs(selectedTx.amount).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Tax (HST 13%)</span><span className="font-medium">${Math.abs(selectedTx.tax).toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Processing Fee</span><span className="font-medium">-${selectedTx.fee.toFixed(2)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-sm"><span className="font-bold">Net</span><span className="font-bold">${selectedTx.net.toFixed(2)}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Method</div><div className="text-sm font-medium mt-1">{selectedTx.method}</div></div>
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Date</div><div className="text-sm font-medium mt-1">{selectedTx.date}</div></div>
            </div>
            <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Transaction ID</div><div className="text-xs font-medium text-muted-foreground mt-1 font-mono">{selectedTx.id}</div></div>
            {selectedTx.stripeId && <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Stripe ID</div><div className="text-xs font-medium text-muted-foreground mt-1 font-mono">{selectedTx.stripeId}</div></div>}
          </div>
          <div className="p-4 border-t border-border space-y-2 shrink-0">
            <Button variant="outline" className="w-full h-9 text-xs font-bold btn-outline-modern"><Receipt className="w-3.5 h-3.5 mr-1.5" />View Receipt</Button>
            {selectedTx.status === 'succeeded' && <Button variant="outline" className="w-full h-9 text-xs font-bold btn-outline-modern text-red-600"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refund</Button>}
            {selectedTx.status === 'failed' && <Button variant="outline" className="w-full h-9 text-xs font-bold btn-outline-modern"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retry Payment</Button>}
          </div>
        </div>
      )}

      {/* ===== INVOICE DETAIL PANEL ===== */}
      {selectedInv && !selectedTx && (
        <div className="w-full md:w-[380px] absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
          <div className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0">
            <h3 className="text-sm font-bold">{selectedInv.number}</h3>
            <button onClick={() => setSelectedInv(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{selectedInv.customer}</div>
                <div className="text-xs text-muted-foreground font-medium">{selectedInv.email}</div>
              </div>
              <StatusBadge status={selectedInv.status} />
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">Issued</span><span className="font-medium">{selectedInv.dateIssued}</span></div>
              <div><span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">Due</span><span className={`font-medium ${selectedInv.status === 'overdue' ? 'text-red-500' : ''}`}>{selectedInv.dueDate || '—'}</span></div>
            </div>
            <div className="h-px bg-border" />
            {/* Line items */}
            <div>
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Line Items</div>
              <div className="space-y-1.5">
                {selectedInv.lineItems.map((li, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium flex-1 mr-3">{li.desc}</span>
                    <span className="font-medium tabular-nums shrink-0">${li.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px bg-border" />
            {/* Totals */}
            <div className="card-elevated rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Subtotal</span><span className="font-medium tabular-nums">${selectedInv.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Tax (HST 13%)</span><span className="font-medium tabular-nums">${selectedInv.tax.toFixed(2)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-sm"><span className="font-bold">Total</span><span className="font-bold tabular-nums">${(selectedInv.subtotal + selectedInv.tax).toFixed(2)}</span></div>
              {selectedInv.paid > 0 && <div className="flex justify-between text-sm"><span className="text-green-600 font-medium">Paid</span><span className="text-green-600 font-medium tabular-nums">-${selectedInv.paid.toFixed(2)}</span></div>}
              {selectedInv.outstanding > 0 && <div className="flex justify-between text-sm"><span className="font-bold">Balance Due</span><span className={`font-bold tabular-nums ${selectedInv.status === 'overdue' ? 'text-red-500' : ''}`}>${selectedInv.outstanding.toFixed(2)}</span></div>}
            </div>
            {/* Payment info */}
            {selectedInv.paymentMethod && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">Payment Method</span><span className="font-medium">{selectedInv.paymentMethod}</span></div>
                <div><span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">Paid Date</span><span className="font-medium">{selectedInv.paidDate}</span></div>
              </div>
            )}
            {/* Notes */}
            {selectedInv.notes && (
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</div>
                <div className="text-sm text-muted-foreground font-medium">{selectedInv.notes}</div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-border space-y-2 shrink-0">
            {(selectedInv.status === 'draft' || selectedInv.status === 'sent' || selectedInv.status === 'partial' || selectedInv.status === 'overdue') && (
              <Button className="w-full h-9 text-xs font-bold btn-primary-modern"><DollarSign className="w-3.5 h-3.5 mr-1.5" />Record Payment</Button>
            )}
            {selectedInv.status === 'draft' && (
              <Button variant="outline" className="w-full h-9 text-xs font-bold btn-outline-modern"><Send className="w-3.5 h-3.5 mr-1.5" />Send Invoice</Button>
            )}
            {(selectedInv.status === 'sent' || selectedInv.status === 'partial' || selectedInv.status === 'overdue') && (
              <Button variant="outline" className="w-full h-9 text-xs font-bold btn-outline-modern"><Send className="w-3.5 h-3.5 mr-1.5" />Resend</Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-9 text-xs font-bold btn-outline-modern"><Download className="w-3.5 h-3.5 mr-1.5" />PDF</Button>
              {selectedInv.status === 'draft' && <Button variant="outline" className="flex-1 h-9 text-xs font-bold btn-outline-modern"><Pencil className="w-3.5 h-3.5 mr-1.5" />Edit</Button>}
              {selectedInv.status !== 'paid' && <Button variant="outline" className="flex-1 h-9 text-xs font-bold btn-outline-modern text-red-600"><Ban className="w-3.5 h-3.5 mr-1.5" />Void</Button>}
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ===== CREATE INVOICE WIZARD MODAL ===== */}
      {showCreateInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={resetWizard} />
          <div className="relative bg-card rounded-xl shadow-xl border w-full max-w-lg mx-4 max-h-[85vh] flex flex-col animate-in zoom-in-95 fade-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold">Create Invoice</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Step {wizardStep} of 4</p>
              </div>
              <button onClick={resetWizard} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            {/* Progress bar */}
            <div className="h-1 bg-muted shrink-0"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${wizardStep * 25}%` }} /></div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6">
              {/* Step 1: Select Customer */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Search Customer</label>
                    <input value={wizardCustomerSearch} onChange={e => setWizardCustomerSearch(e.target.value)} placeholder="Search by name, email, or phone..." className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" autoFocus />
                  </div>
                  <div className="space-y-1">
                    {INVOICE_CUSTOMERS.filter(c => !wizardCustomerSearch || c.name.toLowerCase().includes(wizardCustomerSearch.toLowerCase()) || c.email.toLowerCase().includes(wizardCustomerSearch.toLowerCase())).map(c => (
                      <button key={c.id} onClick={() => setWizardCustomer(c)} className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${wizardCustomer?.id === c.id ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-muted/50'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold">{c.name}</div>
                            <div className="text-xs text-muted-foreground font-medium">{c.email}</div>
                          </div>
                          {c.unpaidBookings > 0 && <div className="text-right"><div className="text-xs font-bold tabular-nums">${c.unpaidTotal.toLocaleString()}</div><div className="text-[10px] text-muted-foreground font-medium">{c.unpaidBookings} unpaid bookings</div></div>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Bookings */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Select Bookings</label>
                    <button className="text-xs font-semibold text-primary hover:underline" onClick={() => setWizardBookings(prev => prev.map(b => ({ ...b, selected: !prev.every(x => x.selected) })))}>
                      {wizardBookings.every(b => b.selected) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-1">
                    {wizardBookings.map(bk => (
                      <button key={bk.id} onClick={() => setWizardBookings(prev => prev.map(b => b.id === bk.id ? { ...b, selected: !b.selected } : b))} className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${bk.selected ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                        <Checkbox checked={bk.selected} className="shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{bk.court} — {bk.sport} ({bk.duration})</div>
                          <div className="text-xs text-muted-foreground font-medium">{bk.date}</div>
                        </div>
                        <span className="text-sm font-bold tabular-nums shrink-0">${bk.amount.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="card-elevated rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">{wizardSelectedBookings.length} of {wizardBookings.length} selected</span>
                    <span className="text-sm font-bold tabular-nums">${wizardSubtotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <div className="card-elevated rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Customer</span><span className="font-bold">{wizardCustomer?.name}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Email</span><span className="font-medium">{wizardCustomer?.email}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Line Items</span><span className="font-medium">{wizardSelectedBookings.length} bookings</span></div>
                  </div>
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Line Items</div>
                  <div className="space-y-1.5">
                    {wizardSelectedBookings.map(bk => (
                      <div key={bk.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">{bk.date} — {bk.court} ({bk.duration})</span>
                        <span className="font-medium tabular-nums">${bk.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-border" />
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Subtotal</span><span className="font-medium tabular-nums">${wizardSubtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Tax (HST 13%)</span><span className="font-medium tabular-nums">${wizardTax.toFixed(2)}</span></div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between text-sm"><span className="font-bold">Total</span><span className="font-bold tabular-nums">${wizardTotal.toFixed(2)}</span></div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Notes (optional)</label>
                    <textarea value={wizardNotes} onChange={e => setWizardNotes(e.target.value)} rows={3} placeholder="Add internal notes or message for customer..." className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {wizardStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto"><CheckCircle2 className="w-7 h-7 text-green-600" /></div>
                  <div>
                    <h3 className="text-lg font-bold">Invoice Created</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">INV-2026-001242 has been created for {wizardCustomer?.name}</p>
                  </div>
                  <div className="card-elevated rounded-lg p-4 text-left space-y-2 max-w-xs mx-auto">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Amount</span><span className="font-bold tabular-nums">${wizardTotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Status</span><StatusBadge status="draft" /></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Due Date</span><span className="font-medium">Apr 21, 2026</span></div>
                  </div>
                  <div className="flex gap-2 justify-center pt-2">
                    <Button className="h-9 text-xs font-bold btn-primary-modern"><Send className="w-3.5 h-3.5 mr-1.5" />Send Now</Button>
                    <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={resetWizard}>Close</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer navigation */}
            {wizardStep < 4 && (
              <div className="px-6 py-4 border-t flex justify-between shrink-0">
                <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => wizardStep === 1 ? resetWizard() : setWizardStep(s => s - 1)}>
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                <Button className="h-9 text-xs font-bold btn-primary-modern px-6" disabled={wizardStep === 1 && !wizardCustomer || wizardStep === 2 && wizardSelectedBookings.length === 0} onClick={() => setWizardStep(s => s + 1)}>
                  {wizardStep === 3 ? 'Create Invoice' : 'Next'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
