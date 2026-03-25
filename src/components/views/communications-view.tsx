"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  STabBar,
  SToolbar,
  SSearchInput,
  SFilterPill,
  SMetricCard,
  StatusBadge,
} from "@/components/shared";
import {
  Plus,
  RefreshCw,
  Clock,
  X,
  Eye,
  Pencil,
  Send,
  Users,
  Mail,
  Calendar,
  Tag,
  Shield,
  CheckCircle2,
  Minus,
  AlertTriangle,
  Download,
  UserCog,
  GraduationCap,
  Trophy,
} from "lucide-react";

const MOCK_MESSAGES = [
  { id: 'M001', date: 'Mar 21, 2:15 PM', recipient: 'Jane Doe', channel: 'email' as const, type: 'transactional' as const, subject: 'Booking Confirmed — Pickleball on Court 1', status: 'opened' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Booking Confirmed', campaign: null as string | null, relatedEntity: 'Booking #B1042' },
  { id: 'M002', date: 'Mar 21, 2:15 PM', recipient: 'Jane Doe', channel: 'sms' as const, type: 'reminder' as const, subject: 'Your PB booking starts in 1 hour', status: 'delivered' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Booking Reminder (1h)', campaign: null as string | null, relatedEntity: 'Booking #B1042' },
  { id: 'M003', date: 'Mar 21, 1:30 PM', recipient: 'Alex Martin', channel: 'email' as const, type: 'transactional' as const, subject: 'Membership Renewal — March', status: 'opened' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Membership Welcome', campaign: null as string | null, relatedEntity: 'Membership Gold' },
  { id: 'M016', date: 'Mar 21, 12:45 PM', recipient: 'Tom Kim', channel: 'voice' as const, type: 'transactional' as const, subject: 'AI Inbound Call — Booking inquiry for Tennis', status: 'delivered' as const, triggeredBy: 'AI Voice', direction: 'inbound' as const, template: null as string | null, campaign: null as string | null, relatedEntity: 'Call #V203 (2m 14s)' },
  { id: 'M004', date: 'Mar 21, 10:00 AM', recipient: '147 customers', channel: 'email' as const, type: 'marketing' as const, subject: 'Spring Special — 20% Off All Bookings', status: 'sent' as const, triggeredBy: 'Sarah M.', direction: 'outbound' as const, template: 'Spring Promo Email', campaign: 'Spring Special — 20% Off', relatedEntity: null as string | null },
  { id: 'M017', date: 'Mar 21, 9:30 AM', recipient: 'Emma Singh', channel: 'email' as const, type: 'transactional' as const, subject: 'RE: Booking Confirmed — Can I change to 3 PM?', status: 'delivered' as const, triggeredBy: 'Customer', direction: 'inbound' as const, template: null as string | null, campaign: null as string | null, relatedEntity: 'Booking #B1038' },
  { id: 'M018', date: 'Mar 21, 9:15 AM', recipient: 'Mike Russo', channel: 'voice' as const, type: 'marketing' as const, subject: 'AI Outbound — Win-back call (lapsed 45 days)', status: 'delivered' as const, triggeredBy: 'AI Marketing', direction: 'outbound' as const, template: null as string | null, campaign: 'Win-Back Lapsed Customers', relatedEntity: 'Call #V201 (1m 48s)' },
  { id: 'M005', date: 'Mar 20, 8:00 PM', recipient: 'Lisa Park', channel: 'email' as const, type: 'transactional' as const, subject: 'Payment Failed — Gold Membership', status: 'opened' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Payment Failed', campaign: null as string | null, relatedEntity: 'Invoice #INV-2026-089' },
  { id: 'M006', date: 'Mar 20, 6:00 PM', recipient: 'Kevin Nguyen', channel: 'email' as const, type: 'transactional' as const, subject: 'Booking Cancelled — Refund Processed', status: 'delivered' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Booking Cancelled', campaign: null as string | null, relatedEntity: 'Booking #B1035' },
  { id: 'M007', date: 'Mar 20, 4:30 PM', recipient: 'Rachel Gomez', channel: 'email' as const, type: 'transactional' as const, subject: 'Enrolled in PB Beginner Clinic', status: 'opened' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Program Enrollment', campaign: null as string | null, relatedEntity: 'Program: PB Clinic' },
  { id: 'M019', date: 'Mar 20, 3:00 PM', recipient: 'Brandon Fisher', channel: 'sms' as const, type: 'transactional' as const, subject: 'STOP received — unsubscribed from SMS marketing', status: 'delivered' as const, triggeredBy: 'Customer', direction: 'inbound' as const, template: null as string | null, campaign: null as string | null, relatedEntity: null as string | null },
  { id: 'M008', date: 'Mar 20, 2:00 PM', recipient: 'David Wright', channel: 'email' as const, type: 'marketing' as const, subject: 'We Miss You — 20% Off Your Next Booking', status: 'bounced' as const, triggeredBy: 'AI Marketing', direction: 'outbound' as const, template: 'Win-Back Email', campaign: 'Win-Back Lapsed Customers', relatedEntity: null as string | null },
  { id: 'M009', date: 'Mar 20, 11:00 AM', recipient: 'Brandon Fisher', channel: 'sms' as const, type: 'reminder' as const, subject: 'Reminder: Tennis tomorrow 8 AM', status: 'delivered' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Booking Reminder (24h)', campaign: null as string | null, relatedEntity: 'Booking #B1031' },
  { id: 'M010', date: 'Mar 19, 5:00 PM', recipient: 'Priya Patel', channel: 'email' as const, type: 'transactional' as const, subject: 'Booking Confirmed — Pickleball on Court 1', status: 'opened' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Booking Confirmed', campaign: null as string | null, relatedEntity: 'Booking #B1028' },
  { id: 'M020', date: 'Mar 19, 4:00 PM', recipient: 'Anika Sharma', channel: 'voice' as const, type: 'transactional' as const, subject: 'AI Inbound Call — Class schedule inquiry', status: 'delivered' as const, triggeredBy: 'AI Voice', direction: 'inbound' as const, template: null as string | null, campaign: null as string | null, relatedEntity: 'Call #V198 (3m 02s)' },
  { id: 'M011', date: 'Mar 19, 3:00 PM', recipient: 'Chris Taylor', channel: 'email' as const, type: 'transactional' as const, subject: 'Booking Confirmed — Pickleball on Court 2', status: 'delivered' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Booking Confirmed', campaign: null as string | null, relatedEntity: 'Booking #B1026' },
  { id: 'M012', date: 'Mar 19, 10:00 AM', recipient: 'All Members', channel: 'email' as const, type: 'announcement' as const, subject: 'New Court Hours Starting April 1', status: 'sent' as const, triggeredBy: 'Dragan J.', direction: 'outbound' as const, template: null as string | null, campaign: 'New Court Hours Announcement', relatedEntity: null as string | null },
  { id: 'M013', date: 'Mar 18, 6:00 PM', recipient: 'Olivia Brown', channel: 'email' as const, type: 'transactional' as const, subject: 'Welcome to Kings Court Markham!', status: 'opened' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Membership Welcome', campaign: null as string | null, relatedEntity: null as string | null },
  { id: 'M014', date: 'Mar 18, 2:00 PM', recipient: 'Maria Santos', channel: 'sms' as const, type: 'reminder' as const, subject: 'Your membership renews in 7 days', status: 'delivered' as const, triggeredBy: 'System', direction: 'outbound' as const, template: 'Membership Renewal Reminder', campaign: null as string | null, relatedEntity: 'Membership Silver' },
  { id: 'M015', date: 'Mar 17, 9:00 AM', recipient: '32 customers', channel: 'email' as const, type: 'marketing' as const, subject: 'New PB Clinic Starting — Register Now', status: 'sent' as const, triggeredBy: 'Sarah M.', direction: 'outbound' as const, template: null as string | null, campaign: 'PB Clinic Registration Push', relatedEntity: 'Program: PB Clinic' },
];
const MOCK_CAMPAIGNS = [
  { id: 'C001', name: 'Spring Special — 20% Off', type: 'marketing' as const, audience: 147, channel: 'email' as const, status: 'sent' as const, sendDate: 'Mar 21, 2026', delivered: 142, opened: 89, clicked: 34, bounced: 3, unsubscribed: 2, promo: 'SPRING20', segment: 'Active Members' },
  { id: 'C002', name: 'New Court Hours Announcement', type: 'announcement' as const, audience: 210, channel: 'email' as const, status: 'sent' as const, sendDate: 'Mar 19, 2026', delivered: 205, opened: 156, clicked: 12, bounced: 1, unsubscribed: 0, segment: 'All Customers' },
  { id: 'C003', name: 'PB Clinic Registration Push', type: 'marketing' as const, audience: 32, channel: 'email' as const, status: 'sent' as const, sendDate: 'Mar 17, 2026', delivered: 31, opened: 22, clicked: 8, bounced: 0, unsubscribed: 1, segment: 'Pickleball Players' },
  { id: 'C005', name: 'Win-Back Lapsed Customers', type: 'marketing' as const, audience: 24, channel: 'email' as const, status: 'sending' as const, sendDate: 'Mar 21, 2026', delivered: 18, opened: 0, clicked: 0, bounced: 1, unsubscribed: 0, promo: 'COMEBACK15', segment: 'Lapsed 30+ Days' },
  { id: 'C006', name: 'Weekend Open Play Reminder', type: 'marketing' as const, audience: 89, channel: 'sms' as const, status: 'scheduled' as const, sendDate: 'Mar 22, 2026 — 10:00 AM', segment: 'Open Play Regulars' },
  { id: 'C004', name: 'April Member Newsletter', type: 'announcement' as const, audience: 186, channel: 'email' as const, status: 'draft' as const, segment: 'All Members' },
  { id: 'C007', name: 'Membership Renewal Push — Q2', type: 'marketing' as const, audience: 41, channel: 'email' as const, status: 'cancelled' as const, sendDate: 'Mar 15, 2026', segment: 'Expiring Memberships' },
];
const SYSTEM_TEMPLATES = [
  { name: 'Booking Confirmed', type: 'transactional', channels: ['email', 'sms'], category: 'Courts' },
  { name: 'Booking Reminder (24h)', type: 'reminder', channels: ['email', 'sms'], category: 'Courts' },
  { name: 'Booking Reminder (1h)', type: 'reminder', channels: ['sms'], category: 'Courts' },
  { name: 'Booking Cancelled', type: 'transactional', channels: ['email'], category: 'Courts' },
  { name: 'Booking Rescheduled', type: 'transactional', channels: ['email', 'sms'], category: 'Courts' },
  { name: 'Waitlist Spot Available', type: 'transactional', channels: ['email', 'sms'], category: 'Courts' },
  { name: 'No-Show Notice', type: 'transactional', channels: ['email'], category: 'Courts' },
  { name: 'Payment Receipt', type: 'transactional', channels: ['email'], category: 'Billing' },
  { name: 'Payment Failed', type: 'transactional', channels: ['email', 'sms'], category: 'Billing' },
  { name: 'Invoice Delivered', type: 'transactional', channels: ['email'], category: 'Billing' },
  { name: 'Dunning — 1st Notice', type: 'transactional', channels: ['email'], category: 'Billing' },
  { name: 'Dunning — Final Notice', type: 'transactional', channels: ['email', 'sms'], category: 'Billing' },
  { name: 'Membership Welcome', type: 'transactional', channels: ['email'], category: 'Customers' },
  { name: 'Membership Renewal Reminder', type: 'reminder', channels: ['email', 'sms'], category: 'Customers' },
  { name: 'Membership Frozen', type: 'transactional', channels: ['email'], category: 'Customers' },
  { name: 'Membership Cancelled', type: 'transactional', channels: ['email'], category: 'Customers' },
  { name: 'Pass Purchased', type: 'transactional', channels: ['email'], category: 'Customers' },
  { name: 'Pass Expiring Soon', type: 'reminder', channels: ['email', 'sms'], category: 'Customers' },
  { name: 'Waiver Renewal Required', type: 'transactional', channels: ['email'], category: 'Customers' },
  { name: 'Program Enrollment', type: 'transactional', channels: ['email'], category: 'Programs' },
  { name: 'Program Session Reminder', type: 'reminder', channels: ['email', 'sms'], category: 'Programs' },
  { name: 'Program Cancelled', type: 'transactional', channels: ['email'], category: 'Programs' },
  { name: 'League Registration', type: 'transactional', channels: ['email'], category: 'Leagues' },
  { name: 'Match Reminder', type: 'reminder', channels: ['email', 'sms'], category: 'Leagues' },
  { name: 'Standings Update', type: 'transactional', channels: ['email'], category: 'Leagues' },
  { name: 'Check-in Credential', type: 'transactional', channels: ['email', 'sms'], category: 'Access' },
  { name: 'Operator Weekly Digest', type: 'transactional', channels: ['email'], category: 'Operations' },
];
const CUSTOM_TEMPLATES = [
  { name: 'Spring Promo Email', type: 'marketing', channels: ['email'] },
  { name: 'Monthly Newsletter', type: 'announcement', channels: ['email'] },
  { name: 'Win-Back Email', type: 'marketing', channels: ['email'] },
  { name: 'Holiday Hours Notice', type: 'announcement', channels: ['email', 'sms'] },
];
const DELIVERY_ISSUES = [
  { customer: 'David Wright', email: 'd.wright@email.com', issue: 'hard_bounce' as const, lastAttempt: 'Mar 20, 2026', attempts: 1, flagged: 'Mar 20, 2026' },
  { customer: 'Expired Domain User', email: 'user@oldcompany.ca', issue: 'hard_bounce' as const, lastAttempt: 'Mar 19, 2026', attempts: 1, flagged: 'Mar 19, 2026' },
  { customer: 'Kevin Nguyen', email: 'kevin.n@gmail.com', issue: 'soft_bounce' as const, lastAttempt: 'Mar 21, 2026', attempts: 3, flagged: 'Mar 21, 2026' },
  { customer: 'Maria Santos', phone: '+1 (905) 555-0142', issue: 'sms_undelivered' as const, lastAttempt: 'Mar 20, 2026', attempts: 2, flagged: null as string | null },
];

export default function CommunicationsView() {
  const [tab, setTab] = useState('Message Log');
  const [selectedMsg, setSelectedMsg] = useState<typeof MOCK_MESSAGES[0] | null>(null);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [directionFilter, setDirectionFilter] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeStep, setComposeStep] = useState(1);
  const [composeAudience, setComposeAudience] = useState('segment');
  const [composeChannel, setComposeChannel] = useState('email');
  const [templateCategory, setTemplateCategory] = useState('all');
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const filteredMessages = MOCK_MESSAGES.filter(m => {
    if (search && !m.recipient.toLowerCase().includes(search.toLowerCase()) && !m.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (channelFilter !== 'all' && m.channel !== channelFilter) return false;
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (directionFilter !== 'all' && m.direction !== directionFilter) return false;
    return true;
  });

  const filteredSystemTemplates = SYSTEM_TEMPLATES.filter(t => templateCategory === 'all' || t.category === templateCategory);
  const templateCategories = Array.from(new Set(SYSTEM_TEMPLATES.map(t => t.category)));

  return (
    <>
      <STabBar tabs={['Message Log', 'Campaigns', 'Templates', 'Delivery Issues']} active={tab} onChange={setTab} actions={<>
        {tab === 'Message Log' && <Button onClick={() => { setComposeOpen(true); setComposeStep(1); }} className="h-8 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />Compose</Button>}
        {tab === 'Campaigns' && <Button onClick={() => { setComposeOpen(true); setComposeStep(1); }} className="h-8 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />New Campaign</Button>}
        {tab === 'Templates' && <Button onClick={() => setEditingTemplate('New Template')} className="h-8 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />New Template</Button>}
        {tab === 'Delivery Issues' && <Button variant="outline" className="h-8 text-xs font-bold px-5 btn-outline-modern"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retry All</Button>}
      </>} />
      <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">

        {/* ===== MESSAGE LOG ===== */}
        {tab === 'Message Log' && (<>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Marketing messages respect quiet hours (10 PM &ndash; 8 AM). Transactional messages are sent immediately.</span>
          </div>
          <SToolbar>
            <SSearchInput placeholder="Search recipient or subject..." value={search} onChange={setSearch} />
            <select value={channelFilter} onChange={e => setChannelFilter(e.target.value)} className="h-8 px-2 text-xs font-semibold text-muted-foreground select-modern">
              <option value="all">All Channels</option><option value="email">Email</option><option value="sms">SMS</option><option value="voice">Voice</option>
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-8 px-2 text-xs font-semibold text-muted-foreground select-modern">
              <option value="all">All Types</option><option value="transactional">Transactional</option><option value="reminder">Reminder</option><option value="marketing">Marketing</option><option value="announcement">Announcement</option>
            </select>
            <select value={directionFilter} onChange={e => setDirectionFilter(e.target.value)} className="h-8 px-2 text-xs font-semibold text-muted-foreground select-modern">
              <option value="all">All Directions</option><option value="inbound">Inbound</option><option value="outbound">Outbound</option>
            </select>
            {(channelFilter !== 'all' || typeFilter !== 'all' || directionFilter !== 'all') && <button onClick={() => { setChannelFilter('all'); setTypeFilter('all'); setDirectionFilter('all'); }} className="text-[11px] text-primary font-semibold hover:underline">Clear</button>}
          </SToolbar>
          <div className="card-elevated rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Date', '', 'Recipient', 'Channel', 'Type', 'Subject', 'Status', 'Consent', 'Source', 'Related'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-3 md:px-4 py-2.5 bg-card sticky top-0 z-10 whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody>{filteredMessages.map(msg => (
                <tr key={msg.id} className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer ${selectedMsg?.id === msg.id ? 'bg-primary/5' : ''}`} onClick={() => setSelectedMsg(msg)}>
                  <td className="px-3 md:px-4 py-2.5 text-xs text-muted-foreground font-medium whitespace-nowrap">{msg.date}</td>
                  <td className="px-1 py-2.5">{msg.direction === 'inbound' ? <span className="text-[9px] font-bold text-blue-600 bg-blue-100 px-1 py-0.5 rounded">IN</span> : <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1 py-0.5 rounded">OUT</span>}</td>
                  <td className="px-3 md:px-4 py-2.5 text-sm font-medium">{msg.recipient}</td>
                  <td className="px-3 md:px-4 py-2.5"><StatusBadge status={msg.channel} /></td>
                  <td className="px-3 md:px-4 py-2.5"><StatusBadge status={msg.type} /></td>
                  <td className="px-3 md:px-4 py-2.5 text-xs text-muted-foreground font-medium max-w-56 truncate">{msg.subject}</td>
                  <td className="px-3 md:px-4 py-2.5"><StatusBadge status={msg.status} /></td>
                  <td className="px-3 md:px-4 py-2.5 text-center">{msg.type === 'marketing' || msg.type === 'announcement' ? (msg.status !== 'bounced' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 inline" /> : <Minus className="w-3.5 h-3.5 text-muted-foreground inline" />) : <Minus className="w-3.5 h-3.5 text-muted-foreground inline" />}</td>
                  <td className="px-3 md:px-4 py-2.5 text-xs text-muted-foreground font-medium whitespace-nowrap">{msg.triggeredBy}</td>
                  <td className="px-3 md:px-4 py-2.5 text-xs text-primary font-medium whitespace-nowrap">{msg.relatedEntity && <span className="hover:underline cursor-pointer">{msg.relatedEntity}</span>}</td>
                </tr>
              ))}</tbody>
            </table>
            {filteredMessages.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No messages match your filters.</div>}
          </div>
        </>)}

        {/* ===== CAMPAIGNS ===== */}
        {tab === 'Campaigns' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Marketing messages respect quiet hours (10 PM &ndash; 8 AM). Scheduled sends during quiet hours will be held until 8 AM.</span>
            </div>
            {MOCK_CAMPAIGNS.map(camp => (
              <div key={camp.id} className="card-elevated rounded-lg p-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-bold">{camp.name}</h3><StatusBadge status={camp.type} /><StatusBadge status={camp.status} />{camp.promo && <Badge variant="outline" className="text-[9px] font-bold">&#x1f3f7; {camp.promo}</Badge>}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium flex-wrap">
                      <span><Users className="w-3 h-3 inline mr-1" />{camp.audience} recipients</span>
                      <span><Mail className="w-3 h-3 inline mr-1" />{camp.channel}</span>
                      {camp.sendDate && <span><Calendar className="w-3 h-3 inline mr-1" />{camp.sendDate}</span>}
                      {camp.segment && <span><Tag className="w-3 h-3 inline mr-1" />{camp.segment}</span>}
                    </div>
                    {camp.type === 'marketing' && <div className="mt-1 text-[10px] text-muted-foreground font-medium flex items-center gap-1"><Shield className="w-3 h-3 text-amber-500" />{Math.round(camp.audience * 0.08)} customers excluded (no marketing consent)</div>}
                  </div>
                  <div className="flex gap-2">
                    {camp.status === 'draft' && <Button className="h-7 text-[10px] font-bold px-3 btn-primary-modern">Continue Editing</Button>}
                    {camp.status === 'scheduled' && <Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern text-destructive">Cancel</Button>}
                    <Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern">View</Button>
                    {camp.status !== 'cancelled' && <Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern">Duplicate</Button>}
                  </div>
                </div>
                {camp.delivered !== undefined && (
                  <div className="flex gap-4 md:gap-6 mt-3 pt-3 border-t border-border flex-wrap">
                    <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Delivered</div><div className="text-sm font-bold">{camp.delivered}</div></div>
                    <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Opened</div><div className="text-sm font-bold">{camp.opened} <span className="text-xs text-muted-foreground font-medium">({camp.delivered ? Math.round((camp.opened! / camp.delivered) * 100) : 0}%)</span></div></div>
                    <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Clicked</div><div className="text-sm font-bold">{camp.clicked} <span className="text-xs text-muted-foreground font-medium">({camp.delivered ? Math.round((camp.clicked! / camp.delivered) * 100) : 0}%)</span></div></div>
                    {camp.bounced !== undefined && camp.bounced > 0 && <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Bounced</div><div className="text-sm font-bold text-destructive">{camp.bounced}</div></div>}
                    {camp.unsubscribed !== undefined && camp.unsubscribed > 0 && <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Unsubscribed</div><div className="text-sm font-bold text-warning-foreground">{camp.unsubscribed}</div></div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== TEMPLATES ===== */}
        {tab === 'Templates' && (<>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">System Templates ({filteredSystemTemplates.length})</h3>
              <div className="flex items-center gap-1 border border-border rounded-md overflow-hidden">
                {['all', ...templateCategories].map((cat, ci) => (
                  <button key={cat} onClick={() => setTemplateCategory(cat)}
                    className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${ci > 0 ? 'border-l border-border' : ''}
                      ${templateCategory === cat ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredSystemTemplates.map(tmpl => (
                <div key={tmpl.name} className="card-elevated rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2"><h4 className="text-sm font-medium truncate">{tmpl.name}</h4><Badge variant="secondary" className="text-[9px] shrink-0">{tmpl.category}</Badge></div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={tmpl.type} />
                    {tmpl.channels.map(ch => <StatusBadge key={ch} status={ch} />)}
                  </div>
                  <Button variant="outline" className="w-full h-7 text-[10px] font-bold btn-outline-modern"><Eye className="w-3 h-3 mr-1" />Preview</Button>
                </div>
              ))}
            </div>
          </div>
          <div className="h-px bg-border" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Custom Templates ({CUSTOM_TEMPLATES.length})</h3>
              <Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />New Template</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {CUSTOM_TEMPLATES.map(tmpl => (
                <div key={tmpl.name} className="card-elevated rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2"><h4 className="text-sm font-medium truncate">{tmpl.name}</h4><Badge variant="secondary" className="text-[9px] shrink-0">Custom</Badge></div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={tmpl.type} />
                    {tmpl.channels.map(ch => <StatusBadge key={ch} status={ch} />)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-7 text-[10px] font-bold btn-outline-modern"><Eye className="w-3 h-3 mr-1" />Preview</Button>
                    <Button variant="outline" className="flex-1 h-7 text-[10px] font-bold btn-outline-modern" onClick={() => setEditingTemplate(tmpl.name)}><Pencil className="w-3 h-3 mr-1" />Edit</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Template Editor Modal */}
          {editingTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingTemplate(null)}>
              <div className="w-full max-w-2xl bg-card rounded-xl shadow-xl border" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b"><h3 className="text-base font-bold">Edit Template: {editingTemplate}</h3><button onClick={() => setEditingTemplate(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button></div>
                <div className="p-6 space-y-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Template Name</label><input className="w-full h-9 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue={editingTemplate} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Type</label><select className="w-full h-9 px-3 text-sm font-medium select-modern"><option>Marketing</option><option>Announcement</option></select></div>
                    <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Channels</label><select className="w-full h-9 px-3 text-sm font-medium select-modern"><option>Email</option><option>SMS</option><option>Email + SMS</option></select></div>
                  </div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Subject Line</label><input className="w-full h-9 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="Spring Special — 20% Off All Bookings This Weekend!" /></div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Email Body</label>
                      <div className="flex gap-1">
                        {['{{first_name}}', '{{facility_name}}', '{{promo_code}}', '{{booking_link}}'].map(field => (
                          <button key={field} className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded hover:bg-primary/20">{field}</button>
                        ))}
                      </div>
                    </div>
                    <div className="w-full h-40 px-3 py-2 text-sm border border-border rounded-md bg-background font-medium text-muted-foreground">
                      <p>Hi {'{{first_name}}'},</p><br />
                      <p>Spring is here and we have a special offer just for you! Use code <strong>{'{{promo_code}}'}</strong> at checkout to get 20% off your next booking at {'{{facility_name}}'}.</p><br />
                      <p>Book now → {'{{booking_link}}'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern"><Send className="w-3.5 h-3.5 mr-1.5" />Send Test</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                    <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setEditingTemplate(null)}>Save Template</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>)}

        {/* ===== DELIVERY ISSUES ===== */}
        {tab === 'Delivery Issues' && (<>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SMetricCard label="Hard Bounces" value="2" trend="Flagged — needs attention" />
            <SMetricCard label="Soft Bounces" value="1" trend="3 attempts in 30 days" />
            <SMetricCard label="SMS Undelivered" value="1" trend="2 attempts" />
            <SMetricCard label="Total Flagged" value="4" trend="Review and resolve" />
          </div>
          <div className="card-elevated rounded-lg overflow-x-auto">
            <div className="px-4 py-3 border-b"><h3 className="text-sm font-bold">Flagged Contacts</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Customer', 'Contact', 'Issue', 'Last Attempt', 'Attempts', 'Flagged', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{DELIVERY_ISSUES.map((di, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-medium">{di.customer}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{di.email || di.phone}</td>
                  <td className="px-4 py-2.5">
                    {di.issue === 'hard_bounce' && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] py-0">Hard Bounce</Badge>}
                    {di.issue === 'soft_bounce' && <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px] py-0">Soft Bounce</Badge>}
                    {di.issue === 'sms_undelivered' && <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] py-0">SMS Undelivered</Badge>}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{di.lastAttempt}</td>
                  <td className="px-4 py-2.5 text-xs font-medium">{di.attempts}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{di.flagged || '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <Button variant="outline" className="h-6 text-[9px] font-bold px-2 btn-outline-modern">Update Contact</Button>
                      <Button variant="outline" className="h-6 text-[9px] font-bold px-2 btn-outline-modern">Retry</Button>
                      <Button variant="outline" className="h-6 text-[9px] font-bold px-2 btn-outline-modern text-destructive">Mark DNC</Button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}
      </div>

      {/* Message Detail Panel */}
      {selectedMsg && tab === 'Message Log' && (
        <div className="w-full md:w-[380px] absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
            <div className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0">
              <h3 className="text-sm font-bold">Message Details</h3>
              <button onClick={() => setSelectedMsg(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center gap-2">
                {selectedMsg.direction === 'inbound' ? <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">INBOUND</span> : <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">OUTBOUND</span>}
                <StatusBadge status={selectedMsg.channel} />
                <StatusBadge status={selectedMsg.type} />
              </div>
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Recipient</div><div className="text-sm font-bold mt-1">{selectedMsg.recipient}</div></div>
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Subject</div><div className="text-sm font-medium mt-1">{selectedMsg.subject}</div></div>
              <div className="h-px bg-border" />
              {selectedMsg.template && <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Template</div><div className="text-sm font-medium mt-1 text-primary">{selectedMsg.template}</div></div>}
              {selectedMsg.campaign && <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Campaign</div><div className="text-sm font-medium mt-1 text-primary">{selectedMsg.campaign}</div></div>}
              {selectedMsg.relatedEntity && <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Related</div><div className="text-sm font-medium mt-1 text-primary">{selectedMsg.relatedEntity}</div></div>}
              <div className="h-px bg-border" />
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Delivery Timeline</div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs font-medium">Sent</span><span className="text-[10px] text-muted-foreground ml-auto">{selectedMsg.date}</span></div>
                  {['delivered', 'opened'].includes(selectedMsg.status) && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs font-medium">Delivered</span></div>}
                  {selectedMsg.status === 'opened' && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-xs font-medium">Opened</span></div>}
                  {selectedMsg.status === 'bounced' && <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-xs font-medium">Bounced — Hard bounce</span></div>}
                </div>
              </div>
              <div className="h-px bg-border" />
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Triggered By</div><div className="text-sm font-medium mt-1">{selectedMsg.triggeredBy}</div></div>
            </div>
        </div>
      )}
      </div>

      {/* ===== COMPOSE WIZARD MODAL ===== */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setComposeOpen(false)}>
          <div className="w-full max-w-2xl bg-card rounded-xl shadow-xl border max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold">Compose Message</h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className={`h-1.5 w-8 rounded-full ${s <= composeStep ? 'bg-primary' : 'bg-border'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium">Step {composeStep} of 5</span>
              </div>
              <button onClick={() => setComposeOpen(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Step 1: Audience */}
              {composeStep === 1 && (<>
                <h4 className="text-sm font-bold">Select Audience</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'segment', label: 'Saved Segment', desc: 'Use a predefined audience', icon: Users },
                    { id: 'individual', label: 'Individual', desc: 'Send to one customer', icon: UserCog },
                    { id: 'program', label: 'Program Roster', desc: 'All enrolled in a program', icon: GraduationCap },
                    { id: 'league', label: 'League Participants', desc: 'All in a league/team', icon: Trophy },
                    { id: 'all', label: 'All Customers', desc: 'Broadcast to everyone', icon: Users },
                    { id: 'staff', label: 'Staff Only', desc: 'Internal communication', icon: UserCog },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setComposeAudience(opt.id)}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors text-left ${composeAudience === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <opt.icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div><div className="text-sm font-semibold">{opt.label}</div><div className="text-[11px] text-muted-foreground">{opt.desc}</div></div>
                    </button>
                  ))}
                </div>
                {composeAudience === 'segment' && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Audience Builder</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Tag', value: 'has tag: pickleball-regular' },
                        { label: 'Membership', value: 'is: Gold or Silver' },
                        { label: 'Last Booking', value: 'within last 30 days' },
                      ].map((filter, fi) => (
                        <div key={fi} className="flex items-center gap-2 p-2 rounded-md border border-border bg-muted/30">
                          <Badge variant="outline" className="text-[9px] font-bold shrink-0">{filter.label}</Badge>
                          <span className="text-xs font-medium flex-1">{filter.value}</span>
                          <button className="text-muted-foreground hover:text-foreground"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"><Plus className="w-3 h-3" />Add Filter</button>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-md bg-primary/5 border border-primary/20">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">89 customers match</span>
                      <span className="text-xs text-muted-foreground ml-auto">7 excluded (CASL)</span>
                    </div>
                  </div>
                )}
              </>)}
              {/* Step 2: Channel */}
              {composeStep === 2 && (<>
                <h4 className="text-sm font-bold">Select Channel</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'email', label: 'Email', desc: 'Rich HTML with tracking' },
                    { id: 'sms', label: 'SMS', desc: 'Plain text, 160 chars' },
                    { id: 'both', label: 'Email + SMS', desc: 'Reach on both channels' },
                  ].map(ch => (
                    <button key={ch.id} onClick={() => setComposeChannel(ch.id)}
                      className={`p-4 rounded-lg border text-center transition-colors ${composeChannel === ch.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                      <div className="text-sm font-bold">{ch.label}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{ch.desc}</div>
                    </button>
                  ))}
                </div>
              </>)}
              {/* Step 3: Content */}
              {composeStep === 3 && (<>
                <h4 className="text-sm font-bold">Compose Content</h4>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Template (optional)</label>
                  <select className="w-full h-9 px-3 text-sm font-medium select-modern"><option value="">Start from scratch</option>{CUSTOM_TEMPLATES.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}</select>
                </div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Subject Line</label><input className="w-full h-9 px-3 text-sm font-medium border border-border rounded-md bg-background" placeholder="Enter subject..." /></div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Body</label>
                    <div className="flex gap-1">
                      {['{{first_name}}', '{{facility_name}}', '{{promo_code}}'].map(f => <button key={f} className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded hover:bg-primary/20">{f}</button>)}
                    </div>
                  </div>
                  <textarea className="w-full h-32 px-3 py-2 text-sm border border-border rounded-md bg-background font-medium resize-none" placeholder="Write your message..." />
                </div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Promo Code (optional)</label>
                  <select className="w-full h-9 px-3 text-sm font-medium select-modern"><option value="">None</option><option>SPRING20 — 20% off all bookings</option><option>COMEBACK15 — 15% off returning customers</option></select>
                </div>
              </>)}
              {/* Step 4: Send Options */}
              {composeStep === 4 && (<>
                <h4 className="text-sm font-bold">Send Options</h4>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <input type="radio" name="send" defaultChecked className="mt-1" />
                    <div><div className="text-sm font-semibold">Send Now</div><div className="text-[11px] text-muted-foreground">Message will be sent immediately</div></div>
                  </label>
                  <label className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                    <input type="radio" name="send" className="mt-1" />
                    <div>
                      <div className="text-sm font-semibold">Schedule for Later</div>
                      <div className="text-[11px] text-muted-foreground">Pick a date and time</div>
                      <div className="flex items-center gap-2 mt-2">
                        <input type="date" className="h-8 px-2 text-xs border border-border rounded-md bg-background" defaultValue="2026-03-22" />
                        <input type="time" className="h-8 px-2 text-xs border border-border rounded-md bg-background" defaultValue="10:00" />
                      </div>
                    </div>
                  </label>
                </div>
              </>)}
              {/* Step 5: Review */}
              {composeStep === 5 && (<>
                <h4 className="text-sm font-bold">Review & Confirm</h4>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground font-medium">Audience</span><span className="text-sm font-semibold">Saved Segment — 89 customers</span></div>
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground font-medium">CASL Excluded</span><span className="text-sm font-semibold text-warning-foreground">7 customers</span></div>
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground font-medium">Will Receive</span><span className="text-sm font-bold text-primary">82 customers</span></div>
                  </div>
                  <div className="p-3 rounded-lg border border-border space-y-2">
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground font-medium">Channel</span><span className="text-sm font-semibold">Email</span></div>
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground font-medium">Subject</span><span className="text-sm font-semibold">Spring Special — 20% Off</span></div>
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground font-medium">Promo Code</span><span className="text-sm font-semibold">SPRING20</span></div>
                    <div className="flex justify-between"><span className="text-xs text-muted-foreground font-medium">Send</span><span className="text-sm font-semibold">Now</span></div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning-foreground mt-0.5 shrink-0" />
                  <div className="text-xs text-warning-foreground font-medium">This will send 82 marketing emails. Customers without express CASL consent have been excluded. This action cannot be undone.</div>
                </div>
              </>)}
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t shrink-0">
              <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => composeStep > 1 ? setComposeStep(composeStep - 1) : setComposeOpen(false)}>
                {composeStep === 1 ? 'Cancel' : '\u2190 Back'}
              </Button>
              {composeStep < 5 ? (
                <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setComposeStep(composeStep + 1)}>Next \u2192</Button>
              ) : (
                <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setComposeOpen(false)}><Send className="w-3.5 h-3.5 mr-1.5" />Send Campaign</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
