"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SPageHeader,
  StatusBadge,
} from "@/components/shared";
import {
  Building2,
  Palette,
  ToggleLeft,
  CalendarDays,
  Users,
  CreditCard,
  GraduationCap,
  Trophy,
  UserCog,
  MessageSquare,
  DollarSign,
  DoorOpen,
  Bot,
  Globe,
  Shield,
  Database,
  Zap,
  ChevronRight,
  ArrowLeft,
  Plus,
  Upload,
  Download,
  Eye,
  Send,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Trash2,
  Key,
  QrCode,
  type LucideIcon,
} from "lucide-react";

const SETTINGS_SECTIONS = [
  { id: 'facility', label: 'Facility Profile', icon: Building2 },
  { id: 'branding', label: 'Branding & Portal', icon: Palette },
  { id: 'features', label: 'Feature Toggles', icon: ToggleLeft },
  { id: 'courts', label: 'Courts & Booking', icon: CalendarDays },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
  { id: 'programs', label: 'Programs', icon: GraduationCap },
  { id: 'leagues', label: 'Leagues & Events', icon: Trophy },
  { id: 'staff', label: 'Staff & Permissions', icon: UserCog },
  { id: 'communications', label: 'Communications', icon: MessageSquare },
  { id: 'pricing', label: 'Pricing Rules', icon: DollarSign },
  { id: 'access', label: 'Access & Check-in', icon: DoorOpen },
  { id: 'ai', label: 'AI', icon: Bot },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data', label: 'Data Management', icon: Database },
  { id: 'account', label: 'Account', icon: Zap },
];

export default function SettingsView() {
  const [section, setSection] = useState<string | null>('facility');
  const [accessModel, setAccessModel] = useState<'front-desk' | 'staffed-credentials' | 'self-access'>('staffed-credentials');
  // On mobile, null section means show the section list
  const showSectionList = typeof window !== 'undefined' && window.innerWidth < 768 && section === null;
  return (
    <>
      <SPageHeader title="Settings" />
      <div className="flex flex-1 overflow-hidden">
        {/* Settings Sidebar — desktop always, mobile only when no section selected */}
        <div className={`w-full md:w-[220px] border-r border-border bg-card overflow-y-auto shrink-0 ${section !== null ? 'hidden md:block' : ''}`}>
          <div className="p-2 space-y-0.5">
            {SETTINGS_SECTIONS.map(s => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button key={s.id} onClick={() => setSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 md:py-2 rounded-md text-sm md:text-[13px] transition-colors ${active ? 'bg-primary/10 text-primary font-bold nav-active-accent' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-semibold'}`}>
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                  {s.label}
                  <ChevronRight className="h-3.5 w-3.5 ml-auto text-muted-foreground md:hidden" />
                </button>
              );
            })}
          </div>
        </div>
        {/* Settings Content — hidden on mobile when section list is showing */}
        <div className={`flex-1 overflow-y-auto p-3 md:p-6 ${section === null ? 'hidden md:block' : ''}`}>
          {/* Mobile back button */}
          <button onClick={() => setSection(null)} className="md:hidden flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> All Settings
          </button>
          <div className="max-w-2xl space-y-6">
            {/* ── FACILITY PROFILE (4.1) ── */}
            {section === 'facility' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Facility Details</h2><p className="text-xs text-muted-foreground font-medium">Core identity used across the platform, portal, emails, and AI</p></div>
              <div className="space-y-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Facility Name</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="Kings Court Markham" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Street Address</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="123 Sports Ave" /></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">City</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="Markham" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Province</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="Ontario" /></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Postal Code</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="L3R 5T6" /></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Country</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Canada</option><option>United States</option></select></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Phone</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="+1 (905) 555-0100" /></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Email</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="info@kingscourtmarkham.com" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Website</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="https://kingscourtmarkham.com" /></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Description</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="Premier indoor sports facility in Markham" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Timezone</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>America/Toronto (EST)</option></select></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Currency</label><div className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-muted/50 flex items-center text-muted-foreground">CAD ($) — set at creation</div></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Facility Mode</label><div className="w-full h-8 px-3 text-sm font-bold border border-border rounded-md bg-muted/50 flex items-center text-primary">Standard</div></div>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Sports Offered</h2></div>
              <div className="flex flex-wrap gap-2">{['Tennis', 'Pickleball', 'Basketball', 'Volleyball', 'Badminton', 'Squash', 'Racquetball', 'Table Tennis', 'Multi-Purpose'].map(s => <label key={s} className="flex items-center gap-1.5"><Checkbox defaultChecked={['Tennis', 'Pickleball', 'Basketball', 'Volleyball'].includes(s)} /><span className="text-sm font-medium">{s}</span></label>)}</div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Operating Hours</h2><p className="text-xs text-muted-foreground font-medium">Courts inherit these hours by default. Per-court overrides in Courts &gt; Court Setup.</p></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <table className="w-full"><thead><tr className="border-b border-border">{['Day', 'Status', 'Open', 'Close'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead>
                <tbody>{[{ d: 'Monday', o: '8:00 AM', c: '10:00 PM' }, { d: 'Tuesday', o: '8:00 AM', c: '10:00 PM' }, { d: 'Wednesday', o: '8:00 AM', c: '10:00 PM' }, { d: 'Thursday', o: '8:00 AM', c: '10:00 PM' }, { d: 'Friday', o: '8:00 AM', c: '10:00 PM' }, { d: 'Saturday', o: '7:00 AM', c: '10:00 PM' }, { d: 'Sunday', o: '7:00 AM', c: '9:00 PM' }].map(day => (
                  <tr key={day.d} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-medium">{day.d}</td><td className="px-4 py-2"><StatusBadge status="open" /></td><td className="px-4 py-2"><input type="time" className="h-7 px-2 text-xs font-medium border border-border rounded-md bg-background" defaultValue={day.o.includes('7') ? '07:00' : '08:00'} /></td><td className="px-4 py-2"><input type="time" className="h-7 px-2 text-xs font-medium border border-border rounded-md bg-background" defaultValue={day.c.includes('9:00 PM') ? '21:00' : '22:00'} /></td></tr>
                ))}</tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Holiday Calendar</h2></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center justify-between"><span className="text-xs text-muted-foreground font-medium">Upcoming holidays</span><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Add Holiday</Button></div>
                <table className="w-full"><tbody>
                  {[{ name: 'Good Friday', date: 'Apr 18, 2026', status: 'Closed', recurring: true }, { name: 'Victoria Day', date: 'May 18, 2026', status: 'Closed', recurring: true }, { name: 'Staff Training Day', date: 'Apr 5, 2026', status: 'Modified Hours (8 AM–2 PM)', recurring: false }].map(h => (
                    <tr key={h.name} className="border-b border-border/50 hover:bg-muted/30"><td className="px-4 py-2 text-sm font-medium">{h.name}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{h.date}</td><td className="px-4 py-2"><StatusBadge status={h.status.includes('Closed') ? 'cancelled' : 'scheduled'} /></td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{h.recurring ? 'Annual' : 'One-time'}</td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Notification Email</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Primary Notification Email</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="dragan@courtsideai.com" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Contact Email (customer-facing)</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="info@kingscourtmarkham.com" /></div>
              </div>
            </>)}
            {/* ── BRANDING & PORTAL (4.2) ── */}
            {section === 'branding' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Branding</h2><p className="text-xs text-muted-foreground font-medium">Visual identity across portal, emails, and receipts</p></div>
              <div className="card-elevated rounded-lg p-4 space-y-3">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Logo</div>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center"><Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" /><p className="text-sm font-medium text-muted-foreground">Drag & drop or click to upload</p><p className="text-[10px] text-muted-foreground">PNG, JPG, or SVG · Max 500KB · Auto-resized to 200px wide</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Primary Color</label><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: '#1CABB0' }} /><input className="w-32 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background font-mono" defaultValue="#1CABB0" /></div></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Secondary Color</label><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-md border border-border" style={{ backgroundColor: '#64748B' }} /><input className="w-32 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background font-mono" defaultValue="#64748B" /></div></div>
              </div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Footer Text</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="123 Sports Ave, Markham ON · (905) 555-0100 · kingscourtmarkham.com" /></div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Social Links</label>
                <div className="grid grid-cols-2 gap-3">{['Facebook URL', 'Instagram URL', 'Twitter/X URL', 'Website URL'].map(p => <input key={p} className="h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" placeholder={p} />)}</div>
              </div>
              <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Eye className="w-3 h-3 mr-1.5" />Preview Email with Branding</Button>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Online Booking Portal</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Portal Subdomain</label><div className="flex items-center"><input className="h-8 px-3 text-sm font-medium border border-border rounded-l-md bg-background w-40" defaultValue="kingscourtmarkham" /><span className="h-8 px-3 text-xs font-medium border border-l-0 border-border rounded-r-md bg-muted flex items-center text-muted-foreground">.courtside.ai</span></div></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Portal Status</label><div className="flex items-center gap-3"><StatusBadge status="active" /><span className="text-xs text-muted-foreground font-medium">Live — accepting bookings</span></div></div>
              </div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Welcome Message</label><textarea className="w-full h-12 px-3 py-2 text-sm font-medium border border-border rounded-md bg-background resize-none" defaultValue="Welcome to Kings Court Markham! Book your court online." /></div>
              <div className="space-y-2">
                {[{ label: 'Show pricing on grid', on: true }, { label: 'Public availability (no login to view)', on: true }, { label: 'Booking requires account', on: true }, { label: 'Sports filter visible', on: true }].map(t => (
                  <div key={t.label} className="flex items-center justify-between py-1"><span className="text-sm font-medium">{t.label}</span><Switch defaultChecked={t.on} /></div>
                ))}
              </div>
            </>)}
            {/* ── FEATURE TOGGLES (4.3) ── */}
            {section === 'features' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Feature Toggles</h2><p className="text-xs text-muted-foreground font-medium">Enable or disable optional platform sections. Always visible: Home, Courts, Customers, Billing, Staff, Communications, Reports, Settings.</p></div>
              <div className="space-y-3">
                {[{ name: 'Memberships', desc: 'Tier-based memberships with recurring billing. Enables membership UI in Customers, Billing, Courts pricing, and AI queries.', on: true }, { name: 'Programs', desc: 'Lessons, clinics, camps, and drop-in sessions. Shows Programs nav section.', on: true }, { name: 'Leagues & Events', desc: 'Leagues, tournaments, and social events. Shows Leagues nav section.', on: true }, { name: 'Point of Sale', desc: 'In-person retail, F&B, and equipment rental. Requires Stripe Terminal.', on: true }, { name: 'Access & Check-in', desc: 'Door codes, QR check-in, credential delivery, and access tracking.', on: true }, { name: 'AI Agent', desc: 'AI voice (inbound/outbound), chat widget, marketing automation, analytics.', on: true }, { name: 'Facility Directory', desc: 'Public listing on courtside.ai/play directory. Phase 3.', on: false }].map(feat => (
                  <div key={feat.name} className="card-elevated rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1 mr-4"><div className="text-sm font-bold">{feat.name}</div><div className="text-xs text-muted-foreground font-medium mt-0.5">{feat.desc}</div></div>
                    <Switch defaultChecked={feat.on} />
                  </div>
                ))}
              </div>
            </>)}
            {/* ── COURTS & BOOKING (4.4) ── */}
            {section === 'courts' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Booking Rules</h2><p className="text-xs text-muted-foreground font-medium">Court setup is managed in the Courts section. These are global booking policies.</p></div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold">Duration & Windows</h3>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Duration Options</label><div className="flex gap-3">{['30 min', '60 min', '90 min', '120 min', 'Custom'].map(d => <label key={d} className="flex items-center gap-1.5"><Checkbox defaultChecked={d !== 'Custom' && d !== '120 min'} /><span className="text-sm font-medium">{d}</span></label>)}</div></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Max Advance Window</label><div className="flex items-center gap-2"><input type="number" className="w-20 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="14" /><span className="text-xs text-muted-foreground font-medium">days</span></div></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Min Lead Time</label><div className="flex items-center gap-2"><input type="number" className="w-20 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="0" /><span className="text-xs text-muted-foreground font-medium">minutes</span></div></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Time Granularity</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>30 minutes</option><option>15 minutes</option><option>60 minutes</option></select></div>
                </div>
                <div className="h-px bg-border" />
                <h3 className="text-sm font-bold">Booking Quotas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Daily Booking Cap</label><div className="flex items-center gap-2"><input type="number" className="w-20 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="2" /><span className="text-xs text-muted-foreground font-medium">per customer</span></div></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Weekly Booking Cap</label><div className="flex items-center gap-2"><input type="number" className="w-20 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="7" /><span className="text-xs text-muted-foreground font-medium">per customer</span></div></div>
                </div>
                <div className="h-px bg-border" />
                <h3 className="text-sm font-bold">Cancellation & No-Show</h3>
                <div className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Cancellation Tiers</div>
                  {[{ window: '48+ hours before', refund: 'Full refund' }, { window: '24–48 hours', refund: '50% refund' }, { window: 'Under 24 hours', refund: 'No refund (account credit only)' }].map(t => (
                    <div key={t.window} className="flex items-center justify-between py-1"><span className="text-sm font-medium">{t.window}</span><span className="text-xs text-muted-foreground font-medium">{t.refund}</span></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Grace Period</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="15" /><span className="text-xs text-muted-foreground font-medium">min</span></div></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">No-Show Threshold</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="3" /><span className="text-xs text-muted-foreground font-medium">in 30 days</span></div></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Escalation</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Auto-flag</option><option>Auto-restrict</option><option>Auto-suspend</option></select></div>
                </div>
                <div className="h-px bg-border" />
                <h3 className="text-sm font-bold">Waitlist</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between"><span className="text-sm font-medium">Waitlist enabled</span><Switch defaultChecked /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-[11px] text-muted-foreground font-medium block mb-1">Acceptance Window</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="30" /><span className="text-xs text-muted-foreground font-medium">min</span></div></div>
                    <div><label className="text-[11px] text-muted-foreground font-medium block mb-1">Max Waitlist Size</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="10" /><span className="text-xs text-muted-foreground font-medium">per slot</span></div></div>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <h3 className="text-sm font-bold">Unpaid Hold Release</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Online Hold</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="30" /><span className="text-xs text-muted-foreground font-medium">min</span></div></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Staff-Created Hold</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="24" /><span className="text-xs text-muted-foreground font-medium">hours</span></div></div>
                </div>
              </div>
            </>)}
            {/* ── CUSTOMERS (4.5) ── */}
            {section === 'customers' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Custom Profile Fields</h2><p className="text-xs text-muted-foreground font-medium">Facility-defined fields on customer profiles</p></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex justify-end"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Add Field</Button></div>
                <table className="w-full"><thead><tr className="border-b border-border">{['Field Name', 'Type', 'Required', 'Customer Visible', 'Editable'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ name: 'Skill Level', type: 'Dropdown', req: false, vis: true, edit: true }, { name: 'How Did You Hear About Us?', type: 'Text', req: false, vis: false, edit: false }, { name: 'Emergency Contact', type: 'Text', req: true, vis: true, edit: true }].map(f => (
                    <tr key={f.name} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-medium">{f.name}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{f.type}</td><td className="px-4 py-2"><Switch defaultChecked={f.req} className="scale-75" /></td><td className="px-4 py-2"><Switch defaultChecked={f.vis} className="scale-75" /></td><td className="px-4 py-2"><Switch defaultChecked={f.edit} className="scale-75" /></td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Tags</h2><p className="text-xs text-muted-foreground font-medium">Customer tags with pricing modifiers and booking rules</p></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex justify-end"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Add Tag</Button></div>
                <table className="w-full"><thead><tr className="border-b border-border">{['Tag', 'Color', 'Pricing Modifier', 'Auto-Assign', 'Visibility'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ name: 'Gold Member', color: '#F59E0B', modifier: '15% off', auto: 'On Gold membership', vis: 'Staff + Customer' }, { name: 'Silver Member', color: '#94A3B8', modifier: '10% off', auto: 'On Silver membership', vis: 'Staff + Customer' }, { name: 'Senior', color: '#EC4899', modifier: '20% off mornings', auto: 'DOB 65+', vis: 'Staff only' }, { name: 'Junior Athlete', color: '#8B5CF6', modifier: '25% off', auto: 'DOB under 18', vis: 'Staff only' }, { name: 'Founding Member', color: '#1CABB0', modifier: '15% off', auto: 'Manual', vis: 'Staff + Customer' }].map(t => (
                    <tr key={t.name} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-medium flex items-center gap-2"><div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />{t.name}</td><td className="px-4 py-2 text-xs font-mono text-muted-foreground">{t.color}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{t.modifier}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{t.auto}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{t.vis}</td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Membership Tiers</h2></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex justify-end"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Add Tier</Button></div>
                <table className="w-full"><thead><tr className="border-b border-border">{['Tier', 'Price', 'Billing Cycle', 'Discount', 'Auto-Renew', 'Freeze'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ tier: 'Gold', price: '$99/mo', cycle: 'Calendar month', discount: '15% off all bookings', renew: true, freeze: '2x/year, 30 day max' }, { tier: 'Silver', price: '$59/mo', cycle: 'Calendar month', discount: '10% off all bookings', renew: true, freeze: '1x/year, 14 day max' }].map(t => (
                    <tr key={t.tier} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-bold">{t.tier}</td><td className="px-4 py-2 text-sm font-medium">{t.price}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{t.cycle}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{t.discount}</td><td className="px-4 py-2"><Switch defaultChecked={t.renew} className="scale-75" /></td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{t.freeze}</td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Passes</h2></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex justify-end"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Add Pass</Button></div>
                <table className="w-full"><thead><tr className="border-b border-border">{['Pass Name', 'Type', 'Price', 'Validity', 'Member Price'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ name: '10-Visit Pass', type: 'Punch card', price: '$400', validity: '6 months', member: '$340' }, { name: 'Day Pass', type: 'Unlimited', price: '$55', validity: '1 day', member: '$45' }, { name: 'Corporate 50-Visit', type: 'Bulk', price: '$1,750', validity: '12 months', member: '—' }].map(p => (
                    <tr key={p.name} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-medium">{p.name}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{p.type}</td><td className="px-4 py-2 text-sm font-medium">{p.price}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{p.validity}</td><td className="px-4 py-2 text-sm font-medium">{p.member}</td></tr>
                  ))}
                </tbody></table>
              </div>
            </>)}
            {/* ── BILLING & PAYMENTS (4.6) ── */}
            {section === 'billing' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Payment Gateway</h2></div>
              <div className="card-elevated rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-primary" /></div><div><div className="text-sm font-bold">Stripe Connect</div><div className="text-xs text-green-600 font-medium">Connected — acct_1234567890</div></div></div>
                <div className="flex items-center gap-2"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern">Test Connection</Button><Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern">Manage</Button></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Statement Descriptor</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="KINGS COURT MARKHAM" maxLength={22} /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Stripe Fee Pass-Through</label><div className="flex items-center gap-3 h-8"><Switch /><span className="text-xs text-muted-foreground font-medium">Add processing fees to customer total</span></div></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Accepted Payment Methods</h2></div>
              <div className="space-y-2">{[{ m: 'Credit/Debit Card (Visa, Mastercard, Amex)', on: true, locked: true }, { m: 'Apple Pay', on: true, locked: false }, { m: 'Google Pay', on: true, locked: false }, { m: 'ACH (US only)', on: false, locked: false }, { m: 'Interac Debit (Phase 2)', on: false, locked: false }].map(pm => <div key={pm.m} className="flex items-center justify-between py-1"><label className="flex items-center gap-2"><Checkbox defaultChecked={pm.on} disabled={pm.locked} /><span className="text-sm font-medium">{pm.m}</span></label>{pm.locked && <span className="text-[10px] text-muted-foreground font-medium">Always on</span>}</div>)}</div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Tax Configuration</h2></div>
              <div className="card-elevated rounded-lg p-4 flex items-center justify-between"><div><div className="text-sm font-bold">Stripe Tax</div><div className="text-xs text-muted-foreground font-medium">Auto-calculated based on facility location (Ontario → HST 13%)</div></div><Switch defaultChecked /></div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Promo Codes</h2></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex justify-end"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Create Code</Button></div>
                <table className="w-full"><thead><tr className="border-b border-border">{['Code', 'Discount', 'Usage', 'Valid Until', 'Status'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ code: 'SPRING20', disc: '20% off', usage: '34/100', valid: 'Apr 30, 2026', status: 'active' }, { code: 'WELCOME10', disc: '$10 off', usage: '12/∞', valid: 'No expiry', status: 'active' }, { code: 'FOUNDING', disc: '15% off', usage: '8/8', valid: 'Expired', status: 'inactive' }].map(p => (
                    <tr key={p.code} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-bold font-mono">{p.code}</td><td className="px-4 py-2 text-sm font-medium">{p.disc}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium tabular-nums">{p.usage}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{p.valid}</td><td className="px-4 py-2"><StatusBadge status={p.status} /></td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Gift Cards</h2></div>
              <div className="space-y-2">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Standard Denominations</label><div className="flex gap-2">{['$10', '$25', '$50', '$75', '$100'].map(d => <span key={d} className="h-8 px-3 rounded-md border border-border bg-muted/30 flex items-center text-sm font-medium">{d}</span>)}</div></div>
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Allow custom amounts above $100</span><Switch defaultChecked /></div>
                <div className="text-xs text-muted-foreground font-medium">Gift cards never expire (Canadian consumer protection compliance)</div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Invoicing</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Invoice Number Format</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background font-mono" defaultValue="INV-{YYYY}-{####}" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Default Payment Terms</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Net 30</option><option>Net 15</option><option>Net 60</option><option>Due on Receipt</option></select></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Refund Policy</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Default Destination</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Account Credit</option><option>Original Payment Method</option></select></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">High-Value Threshold</label><div className="flex items-center gap-2"><span className="text-sm font-medium">$</span><input type="number" className="w-20 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="100" /></div></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Refund Window</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="30" /><span className="text-xs text-muted-foreground font-medium">days</span></div></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Account Credits</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Credit Expiry</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="90" /><span className="text-xs text-muted-foreground font-medium">days</span></div></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Expiry Warning</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="7" /><span className="text-xs text-muted-foreground font-medium">days before</span></div></div>
              </div>
            </>)}
            {/* ── PROGRAMS (4.7) ── */}
            {section === 'programs' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Instructor Configuration</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Default Availability Model</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Instructor-managed</option><option>Admin-managed</option></select></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Buffer Between Lessons</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="15" /><span className="text-xs text-muted-foreground font-medium">min</span></div></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Instructor messaging enabled</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Reviews visible to public</span><Switch defaultChecked /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Min Reviews Before Display</label><input type="number" className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="3" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Review Moderation</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Immediate publication</option><option>Pre-approval queue</option></select></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Waivers & Legal</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Waiver Reuse Period</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="12" /><span className="text-xs text-muted-foreground font-medium">months</span></div></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Minor Consent Required</label><div className="flex items-center h-8"><Switch defaultChecked /><span className="text-xs text-muted-foreground font-medium ml-2">Under 18 needs guardian signature</span></div></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Program Policies</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Default Cancellation</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Full refund before deadline</option><option>Prorated</option><option>Credit only</option><option>No refund</option></select></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Refund Deadline</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="7" /><span className="text-xs text-muted-foreground font-medium">days before start</span></div></div>
              </div>
              <div className="space-y-2">
                {[{ label: 'Sibling discount (10% 2nd, 20% 3rd+)', on: false }, { label: 'Minimum enrollment enforcement', on: true }, { label: 'Makeup sessions allowed', on: true }, { label: 'Holiday auto-skip', on: true }].map(p => (
                  <div key={p.label} className="flex items-center justify-between py-1"><span className="text-sm font-medium">{p.label}</span><Switch defaultChecked={p.on} /></div>
                ))}
              </div>
            </>)}
            {/* ── LEAGUES & EVENTS (4.8) ── */}
            {section === 'leagues' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Default Scoring Rules</h2><p className="text-xs text-muted-foreground font-medium">Facility-wide defaults. Individual leagues can override.</p></div>
              <div className="grid grid-cols-3 gap-3">
                {[{ label: 'Win', val: 3 }, { label: 'Draw', val: 1 }, { label: 'Loss', val: 0 }, { label: 'Bye', val: 3 }, { label: 'Forfeit Win', val: 3 }, { label: 'Forfeit Loss', val: 0 }].map(s => (
                  <div key={s.label}><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">{s.label} Points</label><input type="number" className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue={s.val} /></div>
                ))}
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Default Roster Rules</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Min Roster (Doubles)</label><input type="number" className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="2" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Max Roster Size</label><input type="number" className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="8" /></div>
              </div>
              <div className="space-y-2">{[{ label: 'Trade/transfer window', on: false }, { label: 'Free agent pool', on: false }, { label: 'Sub pool', on: false }].map(t => <div key={t.label} className="flex items-center justify-between py-1"><span className="text-sm font-medium">{t.label}</span><Switch defaultChecked={t.on} /></div>)}</div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Score Entry</h2></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Who Can Enter Scores</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Captain + opponent confirmation</option><option>Owner only</option><option>Player + confirmation</option></select></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Confirmation Window</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="48" /><span className="text-xs text-muted-foreground font-medium">hours</span></div></div>
              </div>
            </>)}
            {/* ── STAFF & PERMISSIONS (4.9) ── */}
            {section === 'staff' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Role Definitions</h2><p className="text-xs text-muted-foreground font-medium">Standard roles with base permissions. Per-staff overrides in Staff section.</p></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <table className="w-full"><thead><tr className="border-b border-border">{['Role', 'Dashboard', 'Customers', 'Billing', 'Staff Mgmt'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ role: 'Owner', d: 'Full', cu: 'Full', b: 'Full', s: 'Full' }, { role: 'Director', d: 'Full', cu: 'Full', b: 'Full', s: 'Full (−ownership)' }, { role: 'Manager', d: 'Full', cu: 'Full', b: 'View only', s: 'View only' }, { role: 'Front Desk', d: 'Schedule only', cu: 'Create/view', b: 'Process', s: 'None' }, { role: 'Instructor', d: 'Own schedule', cu: 'Own students', b: 'None', s: 'None' }, { role: 'View-Only', d: 'Read only', cu: 'Read only', b: 'None', s: 'None' }].map(r => (
                    <tr key={r.role} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-bold"><StatusBadge status={r.role.toLowerCase().replace('-', '_').replace(' ', '_')} /></td><td className="px-4 py-2 text-xs font-medium">{r.d}</td><td className="px-4 py-2 text-xs font-medium">{r.cu}</td><td className="px-4 py-2 text-xs font-medium">{r.b}</td><td className="px-4 py-2 text-xs font-medium">{r.s}</td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Timeclock</h2><Badge variant="secondary" className="text-[9px] ml-2">Phase 2</Badge></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Timeclock enabled</span><Switch /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Overtime Threshold</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="44" /><span className="text-xs text-muted-foreground font-medium">hrs/week</span></div></div>
                  <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Payroll Export</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>CSV</option></select></div>
                </div>
              </div>
            </>)}
            {/* ── COMMUNICATIONS (4.10) ── */}
            {section === 'communications' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Email & SMS Branding</h2></div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Email Sender</label><div className="text-sm font-medium p-2 bg-muted rounded-md font-mono">kingscourtmarkham@mail.courtsideai.com</div></div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Custom Unsubscribe Text</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="You're receiving this because you're a customer of Kings Court Markham." /></div>
              <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Eye className="w-3 h-3 mr-1.5" />Preview Branded Email</Button>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Message Templates</h2><p className="text-xs text-muted-foreground font-medium">Customize subject lines and body text for system messages</p></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <table className="w-full"><thead><tr className="border-b border-border">{['Template', 'Category', 'Channels', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ name: 'Booking Confirmed', cat: 'Booking', ch: 'Email + SMS' }, { name: 'Booking Reminder (24h)', cat: 'Booking', ch: 'Email + SMS' }, { name: 'Booking Cancelled', cat: 'Booking', ch: 'Email' }, { name: 'Payment Receipt', cat: 'Payment', ch: 'Email' }, { name: 'Failed Payment (Dunning)', cat: 'Payment', ch: 'Email + SMS' }, { name: 'Membership Welcome', cat: 'Membership', ch: 'Email' }, { name: 'Credential Delivery', cat: 'Access', ch: 'Email + SMS' }, { name: 'Welcome Email', cat: 'Account', ch: 'Email' }].map(t => (
                    <tr key={t.name} className="border-b border-border/50 hover:bg-muted/30"><td className="px-4 py-2 text-sm font-medium">{t.name}</td><td className="px-4 py-2"><StatusBadge status={t.cat.toLowerCase()} /></td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{t.ch}</td><td className="px-4 py-2"><Button variant="outline" className="h-6 text-[9px] font-bold px-2">Edit</Button></td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Consent & CASL</h2></div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Consent capture on signup</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Marketing consent at checkout</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Pre-expiry renewal prompts (30 days)</span><Switch defaultChecked /></div>
                <div className="text-xs text-muted-foreground font-medium">Implied consent window: 24 months (CASL requirement — not configurable). Consent audit trail always on.</div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Quiet Hours</h2></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Enable quiet hours (SMS only)</span><Switch defaultChecked /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] text-muted-foreground font-medium block mb-1">Start</label><input type="time" className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="21:00" /></div>
                <div><label className="text-[11px] text-muted-foreground font-medium block mb-1">End</label><input type="time" className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="08:00" /></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Operator Digest</h2></div>
              <div className="flex items-center justify-between"><span className="text-sm font-medium">Send digest</span><Switch defaultChecked /></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="text-[11px] text-muted-foreground font-medium block mb-1">Frequency</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Weekly</option><option>Daily</option><option>Monthly</option></select></div>
                <div><label className="text-[11px] text-muted-foreground font-medium block mb-1">Day</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Monday</option></select></div>
                <div><label className="text-[11px] text-muted-foreground font-medium block mb-1">Time</label><input type="time" className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="07:00" /></div>
              </div>
              <div><label className="text-[11px] text-muted-foreground font-medium block mb-1">Recipients</label><div className="flex gap-3">{['Owner', 'Director', 'Manager'].map(r => <label key={r} className="flex items-center gap-1.5"><Checkbox defaultChecked={r === 'Owner'} /><span className="text-sm font-medium">{r}</span></label>)}</div></div>
            </>)}
            {/* ── PRICING RULES (4.11) ── */}
            {section === 'pricing' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Global Rate Table</h2><p className="text-xs text-muted-foreground font-medium">Base hourly rates by sport before time windows or overrides</p></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <table className="w-full"><thead><tr className="border-b border-border">{['Sport', 'Base Rate', 'Status'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ sport: 'Pickleball', rate: 30 }, { sport: 'Tennis', rate: 45 }, { sport: 'Basketball', rate: 35 }, { sport: 'Volleyball', rate: 35 }].map(s => (
                    <tr key={s.sport} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-medium">{s.sport}</td><td className="px-4 py-2"><div className="flex items-center gap-1"><span className="text-sm font-medium">$</span><input type="number" className="w-20 h-7 px-2 text-sm font-medium border border-border rounded-md bg-background" defaultValue={s.rate} /><span className="text-xs text-muted-foreground font-medium">/hr</span></div></td><td className="px-4 py-2"><StatusBadge status="active" /></td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Time Windows</h2></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex justify-end"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Add Window</Button></div>
                <table className="w-full"><thead><tr className="border-b border-border">{['Window', 'Days', 'Hours', 'Adjustment'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ name: 'Morning', days: 'Mon–Fri', hours: '8 AM – 12 PM', adj: 'Base rate' }, { name: 'Afternoon', days: 'Mon–Fri', hours: '12 PM – 5 PM', adj: '+20%' }, { name: 'Prime Time', days: 'Mon–Fri', hours: '5 PM – 10 PM', adj: '+50%' }, { name: 'Weekend', days: 'Sat–Sun', hours: 'All day', adj: '+30%' }].map(w => (
                    <tr key={w.name} className="border-b border-border/50"><td className="px-4 py-2 text-sm font-bold">{w.name}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{w.days}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{w.hours}</td><td className="px-4 py-2 text-sm font-medium">{w.adj}</td></tr>
                  ))}
                </tbody></table>
              </div>
            </>)}
            {/* ── ACCESS & CHECK-IN (4.12) ── */}
            {section === 'access' && (<>
              {/* ── FACILITY ACCESS MODEL ── */}
              <div className="space-y-1"><h2 className="text-sm font-bold">How do customers access your facility?</h2><p className="text-xs text-muted-foreground font-medium">This determines what your customers see in their booking details and what settings are available below.</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {([
                  { id: 'front-desk' as const, title: 'Front Desk Only', desc: 'Staff greets customers on arrival. No codes or credentials needed.', icon: Users, example: 'Staffed gyms, tennis clubs with a reception desk' },
                  { id: 'staffed-credentials' as const, title: 'Front Desk + Credentials', desc: 'Staff on-site during main hours, but customers also get door codes or QR for convenience or off-peak access.', icon: Key, example: 'Multi-sport facilities with evening/weekend self-entry' },
                  { id: 'self-access' as const, title: 'Self-Access', desc: 'No permanent front desk. Customers rely on credentials (codes, QR, smart locks) to enter.', icon: DoorOpen, example: '24/7 pickleball courts, unmanned facilities' },
                ]).map(m => {
                  const Icon = m.icon;
                  const active = accessModel === m.id;
                  return (
                    <button key={m.id} onClick={() => setAccessModel(m.id)} className={`text-left rounded-lg border-2 p-4 transition-all ${active ? 'border-primary bg-primary/[0.03]' : 'border-border hover:border-border/80 hover:bg-muted/30'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${active ? 'bg-primary/10' : 'bg-muted'}`}><Icon className={`h-4 w-4 ${active ? 'text-primary' : 'text-muted-foreground'}`} /></div>
                        <h3 className="text-sm font-bold">{m.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{m.desc}</p>
                      <p className="text-[10px] text-muted-foreground mt-2 italic">{m.example}</p>
                    </button>
                  );
                })}
              </div>

              {/* What the customer sees — preview */}
              <div className="card-elevated rounded-lg p-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Customer sees in their booking detail</p>
                {accessModel === 'front-desk' && <p className="text-sm font-medium">Check in at the front desk on arrival. No code needed.</p>}
                {accessModel === 'staffed-credentials' && <p className="text-sm font-medium">Door code, QR code, or wallet pass (depending on enabled methods) + &quot;Front desk available during staffed hours.&quot;</p>}
                {accessModel === 'self-access' && <p className="text-sm font-medium">Door code + QR code + smart lock (all enabled methods) + check-in instructions. No front desk mentioned.</p>}
              </div>

              <div className="h-px bg-border" />

              {/* ── GENERAL ACCESS SETTINGS ── */}
              <div className="space-y-1"><h2 className="text-sm font-bold">General Settings</h2></div>
              <div className="space-y-2">
                {[
                  { label: 'Check-in tracking', desc: 'Track when customers arrive for their bookings', on: accessModel !== 'front-desk', show: true },
                  { label: 'Member always-on access', desc: 'Active members can enter anytime during operating hours without a booking', on: false, show: accessModel !== 'front-desk' },
                  { label: 'Auto-mark program attendance on check-in', desc: 'Facility check-in auto-marks lesson/clinic attendance', on: true, show: true },
                  { label: 'Waiver re-verification at check-in', desc: 'Alert staff if a customer\'s waiver has expired', on: true, show: accessModel !== 'self-access' },
                  { label: 'Failed access attempt notifications', desc: 'Staff receives in-app notification when a credential is denied', on: accessModel === 'self-access', show: accessModel !== 'front-desk' },
                ].filter(t => t.show).map(t => (
                  <div key={t.label} className="flex items-center justify-between gap-4 py-2">
                    <div className="min-w-0"><span className="text-sm font-medium block">{t.label}</span><span className="text-xs text-muted-foreground font-medium">{t.desc}</span></div>
                    <Switch defaultChecked={t.on} className="shrink-0" />
                  </div>
                ))}
              </div>

              {/* ── CHECK-IN METHODS ── (hidden for front-desk-only) */}
              {accessModel !== 'front-desk' && (<>
                <div className="h-px bg-border" />
                <div className="space-y-1"><h2 className="text-sm font-bold">Check-in Methods</h2><p className="text-xs text-muted-foreground font-medium">Enable the methods your facility supports. Customers see available methods in their booking detail.</p></div>
                <div className="space-y-3">
                  {[
                    { id: 'front-desk', label: 'Front Desk', desc: 'Staff manually checks in customers on arrival', enabled: accessModel === 'staffed-credentials', phase: null, selfAccessHide: false },
                    { id: 'door-code', label: 'Door Code', desc: 'Facility-wide code sent to customers before their booking', enabled: true, phase: null, selfAccessHide: false },
                    { id: 'qr-code', label: 'QR Code', desc: 'Persistent per-customer QR code — scan at reader or show to staff', enabled: true, phase: null, selfAccessHide: false },
                    { id: 'wallet-pass', label: 'Mobile Wallet Pass', desc: 'Apple Wallet / Google Wallet pass with QR credential', enabled: accessModel === 'self-access', phase: null, selfAccessHide: false },
                    { id: 'nfc', label: 'NFC Tap', desc: 'Phone or fob tap at NFC reader', enabled: false, phase: 'Phase 2', selfAccessHide: false },
                    { id: 'smart-lock', label: 'Smart Lock', desc: 'App-controlled door unlock via access control integration', enabled: false, phase: 'Phase 2', selfAccessHide: false },
                    { id: 'kiosk', label: 'Self-Service Kiosk', desc: 'Customer-facing tablet for self check-in', enabled: false, phase: 'Phase 3', selfAccessHide: false },
                  ].map(m => (
                    <div key={m.id} className="card-elevated rounded-lg p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{m.label}</span>
                          {m.phase && <Badge variant="secondary" className="text-[9px]">{m.phase}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium mt-0.5">{m.desc}</p>
                      </div>
                      <Switch defaultChecked={m.enabled} className="shrink-0" disabled={!!m.phase} />
                    </div>
                  ))}
                </div>

                {accessModel === 'self-access' && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Self-access facilities must have at least one automated credential method enabled (Door Code, QR, or Smart Lock). Without it, customers have no way to enter.</p>
                  </div>
                )}
              </>)}

              {/* ── ACCESS WINDOWS ── (hidden for front-desk-only) */}
              {accessModel !== 'front-desk' && (<>
                <div className="h-px bg-border" />
                <div className="space-y-1"><h2 className="text-sm font-bold">Access Windows</h2><p className="text-xs text-muted-foreground font-medium">How long before and after a booking the customer&apos;s credential is valid</p></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Early Arrival Buffer</label>
                    <div className="flex items-center gap-2">
                      <select className="w-24 h-8 px-3 text-sm font-medium select-modern">
                        <option>0 min</option><option>5 min</option><option>10 min</option><option selected>15 min</option><option>20 min</option><option>30 min</option><option>45 min</option><option>60 min</option>
                      </select>
                      <span className="text-xs text-muted-foreground font-medium">before booking start</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Late Departure Buffer</label>
                    <div className="flex items-center gap-2">
                      <select className="w-24 h-8 px-3 text-sm font-medium select-modern">
                        <option>0 min</option><option selected>5 min</option><option>10 min</option><option>15 min</option><option>30 min</option>
                      </select>
                      <span className="text-xs text-muted-foreground font-medium">after booking end</span>
                    </div>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium"><span className="font-bold text-foreground">Example:</span> A 7:00–8:00 PM booking with 15 min early / 5 min late → credential valid <span className="font-bold text-foreground">6:45 PM – 8:05 PM</span></p>
                </div>
              </>)}

              {/* ── DOOR CODE SETTINGS ── (hidden for front-desk-only) */}
              {accessModel !== 'front-desk' && (<>
                <div className="h-px bg-border" />
                <div className="space-y-1"><h2 className="text-sm font-bold">Door Code</h2><p className="text-xs text-muted-foreground font-medium">Manage the facility-wide access code shared with customers who have bookings.</p></div>
                <div className="card-elevated rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1">Current Door Code</label>
                      <div className="text-3xl font-bold font-mono tracking-[0.2em]">4829</div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button variant="outline" className="h-8 text-[10px] font-bold btn-outline-modern"><RefreshCw className="w-3 h-3 mr-1" />Generate New</Button>
                      <Button variant="outline" className="h-8 text-[10px] font-bold btn-outline-modern"><Send className="w-3 h-3 mr-1" />Send to Today&apos;s Customers</Button>
                    </div>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Code Model</label>
                      <select className="w-full h-8 px-3 text-sm font-medium select-modern">
                        <option>Facility-wide rotating</option>
                        <option>Time-window per-booking (Phase 2)</option>
                      </select>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">Facility-wide: one code for all. Time-window: unique code per booking.</p>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Code Rotation Reminder</label>
                      <select className="w-full h-8 px-3 text-sm font-medium select-modern">
                        <option>Off</option><option>Weekly</option><option>Monthly</option><option>Custom</option>
                      </select>
                      <p className="text-[10px] text-muted-foreground font-medium mt-1">Reminds Owner/Director to rotate the code</p>
                    </div>
                  </div>
                </div>
              </>)}

              {/* ── CREDENTIAL DELIVERY ── (hidden for front-desk-only) */}
              {accessModel !== 'front-desk' && (<>
                <div className="h-px bg-border" />
                <div className="space-y-1"><h2 className="text-sm font-bold">Credential Delivery</h2><p className="text-xs text-muted-foreground font-medium">When and how access credentials are sent to customers. Each method can have its own timing.</p></div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Delivery Channel</label>
                  <div className="flex gap-3 flex-wrap">
                    {['Email + SMS', 'Email only', 'SMS only'].map((ch, i) => (
                      <label key={ch} className="flex items-center gap-2 cursor-pointer">
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${i === 0 ? 'border-primary' : 'border-border'}`}>
                          {i === 0 && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <span className="text-sm font-medium">{ch}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">Delivery Timing by Method</label>
                  <div className="card-elevated rounded-lg overflow-hidden overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-border">
                        {['Method', 'When to Send', 'What\'s Sent'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="px-4 py-2.5"><div className="flex items-center gap-2"><Key className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-medium">Door Code</span></div></td>
                          <td className="px-4 py-2.5">
                            <select className="h-8 px-3 text-sm font-medium select-modern w-48">
                              <option selected>1 hour before booking</option>
                              <option>2 hours before booking</option>
                              <option>Morning of (8:00 AM)</option>
                              <option>At booking confirmation</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">Door code + facility address + check-in instructions</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="px-4 py-2.5"><div className="flex items-center gap-2"><QrCode className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-medium">QR Code</span></div></td>
                          <td className="px-4 py-2.5">
                            <select className="h-8 px-3 text-sm font-medium select-modern w-48">
                              <option selected>At booking confirmation</option>
                              <option>1 hour before booking</option>
                              <option>Morning of (8:00 AM)</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">QR image + &quot;Show at entrance&quot; instructions</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="px-4 py-2.5"><div className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-medium">Wallet Pass</span></div></td>
                          <td className="px-4 py-2.5">
                            <select className="h-8 px-3 text-sm font-medium select-modern w-48">
                              <option selected>At booking confirmation</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">&quot;Add to Wallet&quot; link (Apple / Google)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">Credentials are always visible in the customer&apos;s booking detail once the delivery window has passed.</p>
                </div>
              </>)}

              <div className="h-px bg-border" />

              {/* ── CHECK-IN INSTRUCTIONS ── (always shown, content adapts) */}
              <div className="space-y-1"><h2 className="text-sm font-bold">Check-in Instructions</h2><p className="text-xs text-muted-foreground font-medium">{accessModel === 'front-desk' ? 'Shown to customers in their booking confirmation email' : 'Shown in booking detail and credential notifications'}</p></div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Instructions Text</label>
                <textarea className="w-full h-16 px-3 py-2 text-sm font-medium border border-border rounded-md bg-background resize-none" defaultValue={accessModel === 'front-desk' ? 'Check in at the front desk when you arrive. Free parking available behind the building.' : 'Enter through the main entrance. Keypad is on the right side of the door.'} />
              </div>

              <div className="h-px bg-border" />

              {/* ── NO-SHOW DETECTION ── (always shown — useful even for front-desk) */}
              <div className="space-y-1"><h2 className="text-sm font-bold">No-Show Detection</h2><p className="text-xs text-muted-foreground font-medium">{accessModel === 'front-desk' ? 'Flags bookings where the customer wasn\'t checked in by staff' : 'Automatically flags bookings when the customer doesn\'t check in'}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Grace Period</label>
                  <div className="flex items-center gap-2">
                    <select className="w-24 h-8 px-3 text-sm font-medium select-modern">
                      <option>5 min</option><option>10 min</option><option selected>15 min</option><option>20 min</option><option>30 min</option><option>60 min</option>
                    </select>
                    <span className="text-xs text-muted-foreground font-medium">after booking start</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Staff Override Window</label>
                  <div className="flex items-center gap-2">
                    <select className="w-24 h-8 px-3 text-sm font-medium select-modern">
                      <option>1 hour</option><option>4 hours</option><option>12 hours</option><option selected>24 hours</option>
                    </select>
                    <span className="text-xs text-muted-foreground font-medium">to retroactively check in</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Access Log Retention</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="90" /><span className="text-xs text-muted-foreground font-medium">days</span></div></div>
            </>)}
            {/* ── AI (4.13) ── */}
            {section === 'ai' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">AI Voice Agent — Inbound</h2></div>
              <div className="card-elevated rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><div><div className="text-sm font-bold">AI Agent Active</div><div className="text-xs text-muted-foreground font-medium">Handling inbound calls · Last call 2:05 PM</div></div></div>
                <Switch defaultChecked />
              </div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Custom Greeting</label><textarea className="w-full h-16 px-3 py-2 text-sm font-medium border border-border rounded-md bg-background resize-none" defaultValue="Hi, you've reached Kings Court Markham. I'm a virtual assistant and this call is recorded. How can I help you today?" /><p className="text-[10px] text-muted-foreground font-medium mt-1">Required: facility name, AI disclosure, recording notice</p></div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">After-Hours Greeting</label><textarea className="w-full h-16 px-3 py-2 text-sm font-medium border border-border rounded-md bg-background resize-none" defaultValue="Hi, you've reached Kings Court Markham. We're currently closed, but I'm a virtual assistant and I can still help. This call is recorded." /></div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h3 className="text-sm font-bold">Call Routing</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Transfer Number</label><input className="w-full h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="+1 (905) 555-0100" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Ring Timeout</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>30 seconds</option><option>45 seconds</option><option>60 seconds</option></select></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Staff on-site today</span><Switch defaultChecked /></div>
                <div className="flex items-center justify-between py-1"><span className="text-sm font-medium">Unmanned facility mode (never transfer)</span><Switch /></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h3 className="text-sm font-bold">Call Limits</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Concurrent Calls</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Max Duration</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>5 min</option><option selected>10 min</option><option>15 min</option></select></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h3 className="text-sm font-bold">Capabilities</h3><p className="text-xs text-muted-foreground font-medium">Toggle what the AI can do during calls</p></div>
              <div className="grid grid-cols-2 gap-2">{['Check availability', 'Create bookings', 'Cancel bookings', 'Modify/reschedule', 'Process payments (saved card)', 'Send payment links', 'Apply promo codes', 'Program queries & enrollment', 'League queries & registration', 'Membership queries', 'Create customer accounts', 'Update caller info', 'Answer FAQs', 'Take messages'].map(c => <div key={c} className="flex items-center gap-2"><Switch defaultChecked className="scale-75" /><span className="text-sm font-medium">{c}</span></div>)}</div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h3 className="text-sm font-bold">Knowledge Base (FAQ)</h3></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex justify-end"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Add FAQ</Button></div>
                <table className="w-full"><thead><tr className="border-b border-border">{['Question', 'Answer', 'Category', 'Active'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-3 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ q: 'What are your hours?', a: 'Mon–Fri 8 AM–10 PM, Sat 7 AM–10 PM, Sun 7 AM–9 PM', c: 'General' }, { q: 'Do you have parking?', a: 'Free parking in the lot behind the building', c: 'Location' }, { q: 'Can I rent equipment?', a: 'Paddles, ball hoppers, and more at the front desk', c: 'Amenities' }, { q: 'What is your cancellation policy?', a: '24h+ = full refund, under 24h = account credit only', c: 'Policies' }, { q: 'Do you offer memberships?', a: 'Gold ($99/mo, 15% off) and Silver ($59/mo, 10% off)', c: 'Pricing' }].map((f, i) => (
                    <tr key={i} className="border-b border-border/50"><td className="px-3 py-2 text-sm font-medium max-w-40 truncate">{f.q}</td><td className="px-3 py-2 text-xs text-muted-foreground font-medium max-w-48 truncate">{f.a}</td><td className="px-3 py-2 text-xs text-muted-foreground font-medium">{f.c}</td><td className="px-3 py-2"><Switch defaultChecked className="scale-75" /></td></tr>
                  ))}
                </tbody></table>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h3 className="text-sm font-bold">Recording</h3></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Call Recording</label><div className="h-8 px-3 text-sm font-medium border border-border rounded-md bg-muted/50 flex items-center text-muted-foreground">Always on (compliance)</div></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Recording Retention</label><div className="flex items-center gap-2"><input type="number" className="w-16 h-8 px-3 text-sm font-medium border border-border rounded-md bg-background" defaultValue="90" /><span className="text-xs text-muted-foreground font-medium">days</span></div></div>
              </div>
            </>)}
            {/* ── INTEGRATIONS (4.14) ── */}
            {section === 'integrations' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Integrations</h2><p className="text-xs text-muted-foreground font-medium">Third-party service connections</p></div>
              {[{ name: 'Stripe (Payment Processing)', status: 'Connected', desc: 'acct_1234567890 · Last sync 2 min ago', phase: 'MVP' }, { name: 'Twilio (Telephony)', status: 'Active', desc: '+1 (905) 555-0199 — Courtside AI managed', phase: 'MVP' }, { name: 'QuickBooks Online', status: 'Not Connected', desc: 'Accounting sync', phase: 'Phase 2' }, { name: 'Xero', status: 'Not Connected', desc: 'Accounting sync', phase: 'Phase 2' }, { name: 'Google Calendar', status: 'Not Connected', desc: 'Booking sync', phase: 'Phase 2' }, { name: 'Outlook / 365', status: 'Not Connected', desc: 'Booking sync', phase: 'Phase 2' }, { name: 'DUPR (Pickleball Ratings)', status: 'Not Connected', desc: 'Player rating sync', phase: 'Phase 2' }, { name: 'Brivo / Kisi / Salto', status: 'Not Connected', desc: 'Access control hardware', phase: 'Phase 2' }].map(int => (
                <div key={int.name} className="card-elevated rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2"><span className="text-sm font-bold">{int.name}</span>{int.phase !== 'MVP' && <Badge variant="secondary" className="text-[9px]">{int.phase}</Badge>}</div>
                    <div className={`text-xs font-medium mt-0.5 ${int.status === 'Connected' || int.status === 'Active' ? 'text-green-600' : 'text-muted-foreground'}`}>{int.status === 'Not Connected' ? int.desc : `${int.status} — ${int.desc}`}</div>
                  </div>
                  <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern">{int.status === 'Not Connected' ? 'Connect' : 'Manage'}</Button>
                </div>
              ))}
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Webhooks</h2></div>
              <div className="card-elevated rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground font-medium">No webhook endpoints configured</p>
                <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern mt-2"><Plus className="w-3 h-3 mr-1" />Add Endpoint</Button>
              </div>
            </>)}
            {/* ── SECURITY (4.15) ── */}
            {section === 'security' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Authentication</h2></div>
              <div className="card-elevated rounded-lg p-4 flex items-center justify-between"><div><div className="text-sm font-bold">Two-Factor Authentication</div><div className="text-xs text-muted-foreground font-medium">Require 2FA for staff accounts</div></div><Switch /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">2FA Enforcement</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>Optional</option><option>Required for all</option><option>Required for Owner/Director only</option></select></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Session Timeout</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>30 minutes</option><option>1 hour</option><option>2 hours</option><option>4 hours</option><option selected>8 hours</option></select></div>
              </div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Password Requirements</label><div className="text-xs text-muted-foreground font-medium">Min 8 characters, 1 uppercase, 1 number</div></div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Audit Log</h2><p className="text-xs text-muted-foreground font-medium">Read-only record of all significant actions. 2-year retention.</p></div>
              <div className="card-elevated rounded-lg overflow-hidden">
                <table className="w-full"><thead><tr className="border-b border-border">{['Time', 'Actor', 'Action', 'Category'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2 bg-card">{h}</th>)}</tr></thead><tbody>
                  {[{ t: 'Mar 21, 2:15 PM', actor: 'Jessica Wong', action: 'Created booking — Court 1, Jane Doe', cat: 'Booking' }, { t: 'Mar 21, 1:30 PM', actor: 'Mike Thompson', action: 'Processed refund — $45.00', cat: 'Payment' }, { t: 'Mar 21, 10:00 AM', actor: 'Sarah Mitchell', action: 'Sent campaign — Spring Promo', cat: 'Communications' }, { t: 'Mar 20, 6:15 PM', actor: 'Dragan Jovanovic', action: 'Updated operating hours — Sunday', cat: 'Settings' }].map((e, i) => (
                    <tr key={i} className="border-b border-border/50"><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{e.t}</td><td className="px-4 py-2 text-sm font-medium">{e.actor}</td><td className="px-4 py-2 text-xs text-muted-foreground font-medium">{e.action}</td><td className="px-4 py-2"><StatusBadge status={e.cat.toLowerCase()} /></td></tr>
                  ))}
                </tbody></table>
              </div>
              <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Download className="w-3 h-3 mr-1.5" />Export Audit Log</Button>
            </>)}
            {/* ── DATA MANAGEMENT (4.16) ── */}
            {section === 'data' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Import Data</h2><p className="text-xs text-muted-foreground font-medium">Upload CSV or Excel files to import data</p></div>
              <div className="grid grid-cols-3 gap-3">
                {['Customers', 'Future Bookings', 'Booking History', 'Memberships', 'Pass Balances'].map(type => (
                  <Button key={type} variant="outline" className="h-10 text-xs font-bold btn-outline-modern"><Upload className="w-3.5 h-3.5 mr-1.5" />{type}</Button>
                ))}
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Export Data</h2></div>
              <div className="grid grid-cols-3 gap-3">
                {['Customers', 'Bookings', 'Transactions', 'Memberships', 'Programs', 'AI Call Logs', 'Audit Log', 'Financial Summary (PDF)'].map(type => (
                  <Button key={type} variant="outline" className="h-10 text-xs font-bold btn-outline-modern"><Download className="w-3.5 h-3.5 mr-1.5" />{type}</Button>
                ))}
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">Data Retention</h2></div>
              <div className="card-elevated rounded-lg p-4 space-y-2">
                {[{ label: 'Customer records', value: 'Lifetime of account + 3 years post-relationship' }, { label: 'Payment records', value: '7 years (tax/audit requirement)' }, { label: 'Booking records', value: 'Indefinite' }, { label: 'Access event logs', value: '90 days (configurable)' }, { label: 'AI call recordings', value: '90 days (configurable)' }, { label: 'Audit log', value: '2 years' }].map(r => (
                  <div key={r.label} className="flex items-center justify-between"><span className="text-sm font-medium">{r.label}</span><span className="text-xs text-muted-foreground font-medium">{r.value}</span></div>
                ))}
              </div>
            </>)}
            {/* ── ACCOUNT (4.17) ── */}
            {section === 'account' && (<>
              <div className="space-y-1"><h2 className="text-sm font-bold">Courtside AI Plan</h2></div>
              <div className="card-elevated rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Current Plan</span><span className="text-sm font-bold text-primary">Free Platform + AI Usage-Based</span></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Account Created</span><span className="text-xs text-muted-foreground font-medium">January 1, 2025</span></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Account Status</span><StatusBadge status="active" /></div>
              </div>
              <div className="h-px bg-border" />
              <div className="space-y-1"><h2 className="text-sm font-bold">AI Usage & Billing</h2></div>
              <div className="card-elevated rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Current Period</span><span className="text-xs text-muted-foreground font-medium">Mar 1 – Mar 31, 2026</span></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Voice Minutes Used</span><span className="text-sm font-bold tabular-nums">842 min</span></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Voice Cost</span><span className="text-sm font-bold tabular-nums">$84.20</span></div>
                <div className="flex items-center justify-between"><span className="text-sm font-medium">Projected Month-End</span><span className="text-sm font-medium tabular-nums">~$120</span></div>
              </div>
              <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Payment Method</label><div className="flex items-center gap-3"><span className="text-sm font-medium">Visa •4242</span><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern">Update</Button></div></div>
              <div className="h-px bg-border" />
              <div className="card-elevated rounded-lg p-4 border-red-200 dark:border-red-800">
                <div className="text-sm font-bold text-red-600">Danger Zone</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">These actions are permanent and cannot be undone.</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" className="h-8 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"><ExternalLink className="w-3 h-3 mr-1" />Transfer Ownership</Button>
                  <Button variant="outline" className="h-8 text-[11px] font-bold text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3 h-3 mr-1" />Deactivate Facility</Button>
                </div>
              </div>
            </>)}
          </div>
        </div>
      </div>
    </>
  );
}
