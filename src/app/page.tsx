"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";
import {
  Home, CalendarDays, Users, CreditCard, GraduationCap, Trophy,
  UserCog, ShoppingBag, MessageSquare, DoorOpen, BarChart3, Bot,
  Settings, ChevronLeft, ChevronRight, CheckCircle2, Calendar, List, SlidersHorizontal, Search, ChevronDown, X, MoreHorizontal, PanelLeftClose, PanelLeft,
  ArrowLeft, Phone, Mail, MapPin, Tag, Clock, TrendingUp, TrendingDown, Minus, DollarSign, Activity, FileText, ArrowUpDown, Filter, Download, UserPlus, Eye, Pencil, Send, Ban, Archive, Plus,
  Copy, Wrench, AlertTriangle, Trash2, Power, ExternalLink,
  Star, Package, Play, Pause, PhoneIncoming, PhoneOutgoing, Shield, Database, Palette, Globe, RefreshCw, AlertCircle, Upload, Hash, Receipt, PieChart, Mic, CircleDot, Zap, ToggleLeft, Building2, type LucideIcon,
  FileCheck, MessageCircle, Users2, Snowflake, Link2, Merge, Bell, Menu,
  Key, QrCode,
} from "lucide-react";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";

// ============================================================
// TYPES & CONFIG
// ============================================================
type BookingType = 'standard' | 'member' | 'openplay' | 'program' | 'league' | 'event' | 'maintenance' | 'recurring';
type PaymentStatus = 'paid' | 'unpaid' | 'pending' | 'comp';

interface Booking {
  id: string; name: string; type: BookingType; payment: PaymentStatus;
  startSlot: number; duration: number; court: number;
  phone?: string; email?: string; players?: string[]; notes?: string; source?: string; checkedIn?: boolean;
  sport?: string; // only needed for multi-sport courts
}
interface Court {
  name: string; sport: string; openSlot: number; closeSlot: number;
  parentIndex?: number; childIndices?: number[];
  multiSport?: boolean; // supports multiple sports in same column
}
interface CourtGroup { label: string; sport: string; indices: number[]; }

const FACILITY_OPEN_HOUR = 8;
const FACILITY_CLOSE_HOUR = 22;
const MIN_BOOKING_DURATION = 2;
const MIN_SLOT_HEIGHT = 15;
const HOUR_HEIGHT_STATIC = MIN_SLOT_HEIGHT * 2; // for initial scroll calc
const TIME_COL = 72;

const typeLabels: Record<BookingType, string> = { standard: 'Standard', member: 'Member', openplay: 'Open Play', program: 'Program', league: 'League', event: 'Event', maintenance: 'Maintenance', recurring: 'Recurring' };

function buildHours(s: number, e: number) { const r: string[] = []; for (let h = s; h < e; h++) { const p = h >= 12 ? 'PM' : 'AM'; const d = h === 0 ? 12 : h > 12 ? h - 12 : h; r.push(`${d}:00 ${p}`); } return r; }
function slotTime(slot: number, vsh: number) { const t = vsh * 60 + slot * 30; const h = Math.floor(t / 60) % 24; const m = t % 60; return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; }
function slotRng(s: number, d: number, vsh: number) { return `${slotTime(s, vsh)} – ${slotTime(s + d, vsh)}`; }

function buildCourts(vsh: number): Court[] {
  const o = (FACILITY_OPEN_HOUR - vsh) * 2, c = (FACILITY_CLOSE_HOUR - vsh) * 2, c6 = (20 - vsh) * 2;
  return [
    { name: 'Court 1', sport: 'Pickleball', openSlot: o, closeSlot: c },                          // 0
    { name: 'Court 2', sport: 'Pickleball', openSlot: o, closeSlot: c },                          // 1
    { name: 'Court 3', sport: 'Pickleball', openSlot: o, closeSlot: c },                          // 2
    { name: 'Court 4', sport: 'Tennis', openSlot: o, closeSlot: c, childIndices: [4, 5] },        // 3 — parent
    { name: 'Court 4A', sport: 'Pickleball', openSlot: o, closeSlot: c, parentIndex: 3 },         // 4 — child
    { name: 'Court 4B', sport: 'Pickleball', openSlot: o, closeSlot: c, parentIndex: 3 },         // 5 — child
    { name: 'Court 5', sport: 'Tennis', openSlot: o, closeSlot: c },                              // 6
    { name: 'Court 6', sport: 'Basketball / Volleyball', openSlot: o, closeSlot: c6, multiSport: true }, // 7
  ];
}
function buildGroups(courts: Court[]): CourtGroup[] {
  const groups: CourtGroup[] = [];
  const used = new Set<number>();
  courts.forEach((court, i) => {
    if (used.has(i)) return;
    if (court.childIndices && court.childIndices.length > 0) {
      groups.push({ label: court.name, sport: 'Tennis / Pickleball', indices: [i, ...court.childIndices] });
      used.add(i);
      court.childIndices.forEach(ci => used.add(ci));
    } else if (court.parentIndex === undefined) {
      groups.push({ label: court.name, sport: court.sport, indices: [i] });
      used.add(i);
    }
  });
  return groups;
}

function buildBookings(vsh: number): Booking[] {
  const o = (FACILITY_OPEN_HOUR - vsh) * 2;
  return [
    // Court 1 (index 0) — Pickleball
    { id: '1', name: 'Jane Doe', type: 'standard', payment: 'paid', startSlot: o, duration: 2, court: 0, phone: '+1 (647) 555-1234', email: 'jane@example.com', source: 'Online', checkedIn: true },
    { id: '2', name: 'Open Play', type: 'openplay', payment: 'paid', startSlot: o + 2, duration: 4, court: 0 },
    { id: '3', name: 'Alex M.', type: 'member', payment: 'paid', startSlot: o + 7, duration: 3, court: 0, source: 'Phone (AI)' },
    { id: '4', name: 'Sarah L.', type: 'standard', payment: 'unpaid', startSlot: o + 11, duration: 2, court: 0, phone: '+1 (905) 555-4567', source: 'Walk-in', notes: 'First-time visitor.' },
    { id: '5', name: 'Walk-in', type: 'standard', payment: 'paid', startSlot: o + 14, duration: 2, court: 0, source: 'Walk-in' },
    { id: '6', name: 'Evening Open', type: 'openplay', payment: 'paid', startSlot: o + 18, duration: 4, court: 0 },
    { id: '7', name: 'Night Game', type: 'standard', payment: 'paid', startSlot: o + 23, duration: 3, court: 0 },
    // Court 2 (index 1) — Pickleball
    { id: '8', name: 'Mike R.', type: 'member', payment: 'paid', startSlot: o + 1, duration: 3, court: 1, source: 'Online' },
    { id: '9', name: 'PB Clinic', type: 'program', payment: 'paid', startSlot: o + 6, duration: 4, court: 1 },
    { id: '10', name: 'Tom K.', type: 'recurring', payment: 'paid', startSlot: o + 10, duration: 2, court: 1 },
    { id: '11', name: 'Emma S.', type: 'standard', payment: 'paid', startSlot: o + 13, duration: 3, court: 1 },
    { id: '12', name: 'Drop-In', type: 'openplay', payment: 'paid', startSlot: o + 18, duration: 4, court: 1 },
    { id: '13', name: 'Lisa P.', type: 'standard', payment: 'pending', startSlot: o + 23, duration: 2, court: 1, notes: 'Payment link sent.' },
    { id: '14', name: 'Late PB', type: 'standard', payment: 'paid', startSlot: o + 26, duration: 2, court: 1 },
    // Court 3 (index 2) — Pickleball
    { id: '15', name: 'Junior Camp', type: 'program', payment: 'paid', startSlot: o, duration: 8, court: 2, players: ['J. Smith', 'K. Lee', 'M. Patel', 'A. Brown'] },
    { id: '16', name: 'David W.', type: 'member', payment: 'paid', startSlot: o + 10, duration: 2, court: 2 },
    { id: '17', name: 'Rachel G.', type: 'standard', payment: 'paid', startSlot: o + 14, duration: 2, court: 2 },
    { id: '18', name: 'PB League', type: 'league', payment: 'paid', startSlot: o + 18, duration: 6, court: 2 },
    { id: '19', name: 'Night PB', type: 'openplay', payment: 'paid', startSlot: o + 25, duration: 3, court: 2 },
    // Court 4 (index 3) — Tennis parent. Has gaps at 12–3 PM and 7–10 PM for PB sub-courts
    { id: '20', name: 'Maintenance', type: 'maintenance', payment: 'comp', startSlot: o, duration: 4, court: 3, notes: 'Net replacement.' },
    { id: '21', name: 'Tennis Clinic', type: 'program', payment: 'paid', startSlot: o + 4, duration: 4, court: 3 },
    { id: '22', name: 'League Match', type: 'league', payment: 'paid', startSlot: o + 18, duration: 4, court: 3 },
    // Court 4A (index 4) — Pickleball child. Booked during Court 4 gaps
    { id: '23', name: 'PB Drop-In', type: 'openplay', payment: 'paid', startSlot: o + 8, duration: 4, court: 4 },
    { id: '24', name: 'Nadia R.', type: 'standard', payment: 'paid', startSlot: o + 14, duration: 4, court: 4, source: 'Online' },
    { id: '25', name: 'Night PB', type: 'openplay', payment: 'paid', startSlot: o + 22, duration: 4, court: 4 },
    // Court 4B (index 5) — Pickleball child. Booked during Court 4 gaps
    { id: '26', name: 'Sam T.', type: 'member', payment: 'paid', startSlot: o + 9, duration: 3, court: 5, source: 'Online' },
    { id: '27', name: 'Open PB', type: 'openplay', payment: 'paid', startSlot: o + 14, duration: 2, court: 5 },
    { id: '28', name: 'Late PB', type: 'standard', payment: 'paid', startSlot: o + 23, duration: 3, court: 5 },
    // Court 5 (index 6) — Tennis standalone
    { id: '29', name: 'League Match', type: 'league', payment: 'paid', startSlot: o, duration: 4, court: 6 },
    { id: '30', name: 'Anna K.', type: 'member', payment: 'paid', startSlot: o + 4, duration: 2, court: 6 },
    { id: '31', name: 'Corp Event', type: 'event', payment: 'paid', startSlot: o + 8, duration: 6, court: 6, notes: 'Acme Corp team building.' },
    { id: '32', name: 'Mixed Doubles', type: 'standard', payment: 'paid', startSlot: o + 16, duration: 3, court: 6 },
    { id: '33', name: 'Evening Clinic', type: 'program', payment: 'paid', startSlot: o + 20, duration: 4, court: 6 },
    { id: '34', name: 'Night Tennis', type: 'standard', payment: 'paid', startSlot: o + 25, duration: 3, court: 6 },
    // Court 6 (index 7) — Basketball / Volleyball (closes 8 PM)
    { id: '35', name: 'Open Gym', type: 'openplay', payment: 'paid', startSlot: o, duration: 6, court: 7, sport: 'Basketball' },
    { id: '36', name: 'Youth VB', type: 'program', payment: 'paid', startSlot: o + 8, duration: 4, court: 7, sport: 'Volleyball' },
    { id: '37', name: 'Adult League', type: 'league', payment: 'paid', startSlot: o + 14, duration: 4, court: 7, sport: 'Basketball' },
    { id: '38', name: 'VB Open Play', type: 'openplay', payment: 'paid', startSlot: o + 20, duration: 4, court: 7, sport: 'Volleyball' },
  ];
}

// ============================================================
// NAV CONFIG
// ============================================================
const navItemsCore = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'courts', label: 'Courts', icon: CalendarDays },
];
const navItemsOps = [
  { id: 'programs', label: 'Programs', icon: GraduationCap },
  { id: 'leagues', label: 'Leagues', icon: Trophy },
  { id: 'staff', label: 'Staff', icon: UserCog },
  { id: 'pos', label: 'POS', icon: ShoppingBag },
  { id: 'messages', label: 'Communications', icon: MessageSquare },
  { id: 'access', label: 'Access', icon: DoorOpen },
];
const navItemsIntel = [
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];
const navItemAI = { id: 'ai', label: 'AI Dashboard', icon: Zap };
const navItems = [...navItemsCore, ...navItemsOps, ...navItemsIntel, navItemAI];

// ============================================================
// SHARED COMPONENTS & UTILITIES
// ============================================================
const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', succeeded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', opened: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  registration_open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', delivered: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', deactivated: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  bounced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', abandoned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  full: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  inbound: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', outbound: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  'check-in': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  denied: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  override: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  booked: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  answered_question: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  left_message: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  transferred: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  email: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sms: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  transactional: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  reminder: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  marketing: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  announcement: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  director: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  front_desk: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  instructor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  view_only: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  facility: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  independent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  retail: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  fnb: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  equipment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  service: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  booking: 'bg-primary/10 text-primary', membership: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  program: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  pos: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  refund: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  league: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  tournament: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  event: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors = statusColors[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${colors} ${className || ''}`}>{status.replace(/_/g, ' ')}</span>;
}

function SMetricCard({ label, value, trend, trendUp }: { label: string; value: string; trend?: string; trendUp?: boolean }) {
  return (
    <div className="card-elevated rounded-lg p-4">
      <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
      {trend && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trendUp === undefined ? 'text-muted-foreground' : trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          {trendUp !== undefined && (trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
          {trend}
        </div>
      )}
    </div>
  );
}

function SPageHeader({ title, badge, children }: { title: string; badge?: string; children?: React.ReactNode }) {
  // Action bar — renders below unified top bar. Title is shown in the unified top bar, so we only render badge + actions here.
  const hasContent = badge || children;
  if (!hasContent) return null;
  return (
    <div className="h-11 flex items-center justify-between px-3 md:px-5 bg-card/50 border-b border-border shrink-0">
      <div className="flex items-center gap-3">
        {badge && <Badge variant="secondary" className="text-[10px]">{badge}</Badge>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function SToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[48px] flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-0 border-b border-border bg-card/50 shrink-0 flex-wrap">
      {children}
    </div>
  );
}

function SSearchInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="h-8 pl-8 pr-3 text-sm border border-border rounded-md bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 w-full md:w-56" />
    </div>
  );
}

function SFilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`h-7 px-3 rounded-md text-[11px] font-bold transition-colors ${active ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      {label}
    </button>
  );
}

function STabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="flex items-center border-b border-border px-3 md:px-6 bg-card shrink-0 overflow-x-auto">
      {tabs.map(tab => (
        <button key={tab} onClick={() => onChange(tab)}
          className={`px-3 md:px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap ${active === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
          {tab}
        </button>
      ))}
    </div>
  );
}

const DATE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_7', label: 'Last 7 Days' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_30', label: 'Last 30 Days' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'last_90', label: 'Last 90 Days' },
  { id: 'this_year', label: 'This Year' },
] as const;

function SDateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState<Date | undefined>(new Date(2026, 2, 1));
  const [customEnd, setCustomEnd] = useState<Date | undefined>(new Date(2026, 2, 21));
  const [showCustom, setShowCustom] = useState(value === 'custom');
  const activeLabel = value === 'custom'
    ? `${customStart ? customStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '...'} – ${customEnd ? customEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}`
    : DATE_PRESETS.find(p => p.id === value)?.label || 'This Month';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <button className="h-8 px-3 pr-8 text-xs font-bold select-modern flex items-center gap-1.5 whitespace-nowrap">
          <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          {activeLabel}
        </button>
      } />
      <PopoverContent align="start" sideOffset={4} className="w-auto p-0 rounded-lg border bg-popover shadow-lg ring-1 ring-foreground/10 z-50">
        <div className="flex">
          {/* Presets column */}
          <div className="w-40 border-r border-border p-1.5 space-y-0.5">
            {DATE_PRESETS.map(preset => (
              <button key={preset.id} onClick={() => { onChange(preset.id); setShowCustom(false); setOpen(false); }}
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${value === preset.id && !showCustom ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted'}`}>
                {preset.label}
              </button>
            ))}
            <div className="h-px bg-border my-1" />
            <button onClick={() => setShowCustom(true)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${showCustom ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-muted'}`}>
              Custom Range
            </button>
          </div>
          {/* Calendar columns — only show when custom is selected */}
          {showCustom && (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="flex-1">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">From</div>
                  <div className="text-xs font-bold">{customStart ? customStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}</div>
                </div>
                <ArrowLeft className="w-3 h-3 text-muted-foreground rotate-180" />
                <div className="flex-1 text-right">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-0.5">To</div>
                  <div className="text-xs font-bold">{customEnd ? customEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <CalendarWidget mode="single" selected={customStart} onSelect={(d) => setCustomStart(d ?? undefined)} className="rounded-md" />
                <CalendarWidget mode="single" selected={customEnd} onSelect={(d) => setCustomEnd(d ?? undefined)} className="rounded-md" />
              </div>
              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border">
                <Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern" onClick={() => { setShowCustom(false); }}>Cancel</Button>
                <Button className="h-7 text-[10px] font-bold px-4 btn-primary-modern" onClick={() => { onChange('custom'); setOpen(false); }}>Apply</Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================
// PAGE
// ============================================================
export default function HomePage() {
  const [activeNav, setActiveNav] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'dashboard'>('schedule');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedCourt, setSelectedCourt] = useState('');
  const [scheduleView, setScheduleView] = useState<'day' | 'week' | 'month' | 'list'>('day');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [selectedCourtIdx, setSelectedCourtIdx] = useState<number | null>(null);
  const [courtTab, setCourtTab] = useState<'overview' | 'pricing' | 'rules'>('overview');
  const [bkFilter, setBkFilter] = useState<string>('all');
  const [bkCourtFilter, setBkCourtFilter] = useState<string>('all');
  const [courtSearchQ, setCourtSearchQ] = useState('');
  const [courtSportFilter, setCourtSportFilter] = useState('all');
  const [metricsRange, setMetricsRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [courtMoreMenu, setCourtMoreMenu] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState(0);

  // Always render full 24h, scroll to operating hours on mount
  const vsh = 0;
  const veh = 24;
  const viewHours = buildHours(vsh, veh);
  const viewTotalSlots = (veh - vsh) * 2;
  const courts = buildCourts(vsh);
  const groups = buildGroups(courts);
  const allBookings = buildBookings(vsh);
  const visibleBookings = allBookings.filter(b => (b.startSlot + b.duration) > 0 && b.startSlot < viewTotalSlots);

  // Dependency lockouts: when a parent is booked, children are locked; when a child is booked, parent is locked
  interface Lockout { courtIndex: number; startSlot: number; duration: number; sourceName: string; sourceType: BookingType; sourceCourt: string; }
  const lockouts: Lockout[] = [];
  visibleBookings.forEach(b => {
    const court = courts[b.court];
    if (court.childIndices) {
      court.childIndices.forEach(ci => {
        lockouts.push({ courtIndex: ci, startSlot: b.startSlot, duration: b.duration, sourceName: b.name, sourceType: b.type, sourceCourt: court.name });
      });
    }
    if (court.parentIndex !== undefined) {
      lockouts.push({ courtIndex: court.parentIndex, startSlot: b.startSlot, duration: b.duration, sourceName: b.name, sourceType: b.type, sourceCourt: court.name });
    }
  });

  // Dynamic slot height: fill available space, with a minimum
  // Cmd+K shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdkOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    function measure() {
      if (gridContainerRef.current) {
        setGridHeight(gridContainerRef.current.clientHeight - 52);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [activeTab]);

  // Fixed slot height — sized to fit operating hours comfortably, full day scrolls
  const operatingSlots = (FACILITY_CLOSE_HOUR - FACILITY_OPEN_HOUR) * 2;
  const SLOT_HEIGHT = gridHeight > 0 ? Math.max(MIN_SLOT_HEIGHT, Math.floor(gridHeight / operatingSlots)) : 22;
  const HOUR_HEIGHT = SLOT_HEIGHT * 2;

  // Auto-scroll to facility operating hours on load
  useEffect(() => {
    if (gridScrollRef.current && activeTab === 'schedule' && scheduleView === 'day' && SLOT_HEIGHT > MIN_SLOT_HEIGHT) {
      gridScrollRef.current.scrollTop = FACILITY_OPEN_HOUR * HOUR_HEIGHT;
    }
  }, [activeTab, scheduleView, SLOT_HEIGHT, HOUR_HEIGHT]);

  function isUnbookable(ci: number, si: number) {
    const court = courts[ci];
    if (si < court.openSlot || si >= court.closeSlot) return false;
    if (visibleBookings.some(b => b.court === ci && si >= b.startSlot && si < b.startSlot + b.duration)) return false;
    const cb = visibleBookings.filter(b => b.court === ci).sort((a, b) => a.startSlot - b.startSlot);
    let gs = si, ge = si + 1;
    while (gs > court.openSlot && !cb.some(b => gs - 1 >= b.startSlot && gs - 1 < b.startSlot + b.duration)) gs--;
    while (ge < court.closeSlot && !cb.some(b => ge >= b.startSlot && ge < b.startSlot + b.duration)) ge++;
    return (ge - gs) < MIN_BOOKING_DURATION;
  }

  function isClosed(ci: number, si: number) { const c = courts[ci]; return si < c.openSlot || si >= c.closeSlot; }
  function getClosedRanges(ci: number): { start: number; end: number }[] {
    const ranges: { start: number; end: number }[] = [];
    let rs: number | null = null;
    for (let si = 0; si < viewTotalSlots; si++) {
      if (isClosed(ci, si)) { if (rs === null) rs = si; }
      else { if (rs !== null) { ranges.push({ start: rs, end: si }); rs = null; } }
    }
    if (rs !== null) ranges.push({ start: rs, end: viewTotalSlots });
    return ranges;
  }
  const currentTimeSlot = (10.25 - vsh) * 2;

  // Court management data
  const courtMgmtData = [
    { name: 'Court 1', sport: 'Pickleball', surface: 'Hardwood', status: 'Active' as const, rate: 30, bookings: 34, bkgDelta: +6, utilization: 78, utilDelta: +4, indoor: true, revWeek: 1020, capacity: 4, amenities: 'Nets, Lighting' },
    { name: 'Court 2', sport: 'Pickleball', surface: 'Hardwood', status: 'Active' as const, rate: 30, bookings: 28, bkgDelta: -2, utilization: 65, utilDelta: -1, indoor: true, revWeek: 840, capacity: 4, amenities: 'Nets, Lighting' },
    { name: 'Court 3', sport: 'Pickleball', surface: 'Hardwood', status: 'Active' as const, rate: 30, bookings: 31, bkgDelta: +3, utilization: 72, utilDelta: +2, indoor: true, revWeek: 930, capacity: 4, amenities: 'Nets, Lighting' },
    { name: 'Court 4', sport: 'Tennis', surface: 'Hardcourt', status: 'Active' as const, rate: 45, bookings: 22, bkgDelta: +2, utilization: 58, utilDelta: +3, indoor: true, revWeek: 990, capacity: 4, amenities: 'Net, Lighting, Scoreboard', split: 'Splits → Court 4A, 4B' },
    { name: 'Court 4A', sport: 'Pickleball', surface: 'Hardcourt', status: 'Active' as const, rate: 30, bookings: 18, bkgDelta: +5, utilization: 45, utilDelta: +7, indoor: true, revWeek: 540, capacity: 4, amenities: 'Nets', parent: 'Sub of Court 4' },
    { name: 'Court 4B', sport: 'Pickleball', surface: 'Hardcourt', status: 'Active' as const, rate: 30, bookings: 15, bkgDelta: +2, utilization: 40, utilDelta: +5, indoor: true, revWeek: 450, capacity: 4, amenities: 'Nets', parent: 'Sub of Court 4' },
    { name: 'Court 5', sport: 'Tennis', surface: 'Hardcourt', status: 'Active' as const, rate: 45, bookings: 26, bkgDelta: -1, utilization: 68, utilDelta: -2, indoor: true, revWeek: 1170, capacity: 4, amenities: 'Net, Lighting, Scoreboard' },
    { name: 'Court 6', sport: 'Basketball / Volleyball', surface: 'Hardwood', status: 'Active' as const, rate: 60, bookings: 20, bkgDelta: +4, utilization: 55, utilDelta: +3, indoor: true, revWeek: 1200, capacity: 12, amenities: 'Hoops, Net, Scoreboard', hours: 'Closes 8:00 PM' },
  ];
  const selectedCourtData = selectedCourtIdx !== null ? courtMgmtData[selectedCourtIdx] : null;

  // Dashboard / bookings data
  const dashBookings = [
    { id: 'b1', time: '8:00 AM', customer: 'Jane Doe', court: 'Court 1', type: 'Standard' as const, duration: '1h', amount: 30, status: 'paid' as const, source: 'online' as const, checkedIn: true, past: true },
    { id: 'b2', time: '8:00 AM', court: 'Court 3', customer: 'Junior Camp', type: 'Program' as const, duration: '4h', amount: 200, status: 'paid' as const, source: 'staff' as const, checkedIn: true, past: true },
    { id: 'b3', time: '8:30 AM', court: 'Court 2', customer: 'Mike R.', type: 'Member' as const, duration: '1h30m', amount: 38, status: 'paid' as const, source: 'online' as const, checkedIn: true, past: true },
    { id: 'b4', time: '9:00 AM', court: 'Court 1', customer: 'Open Play', type: 'Open Play' as const, duration: '2h', amount: 0, status: 'paid' as const, source: 'staff' as const, checkedIn: true, past: true },
    { id: 'b5', time: '10:00 AM', court: 'Court 4', customer: 'Tennis Clinic', type: 'Program' as const, duration: '2h', amount: 150, status: 'paid' as const, source: 'staff' as const, checkedIn: true, past: true },
    { id: 'b6', time: '11:30 AM', court: 'Court 1', customer: 'Alex M.', type: 'Member' as const, duration: '1h30m', amount: 38, status: 'paid' as const, source: 'ai' as const, past: false },
    { id: 'b7', time: '12:00 PM', court: 'Court 4A', customer: 'PB Drop-In', type: 'Open Play' as const, duration: '2h', amount: 0, status: 'paid' as const, source: 'staff' as const, past: false },
    { id: 'b8', time: '1:00 PM', court: 'Court 2', customer: 'Tom K.', type: 'Standard' as const, duration: '1h', amount: 45, status: 'paid' as const, source: 'online' as const, past: false },
    { id: 'b9', time: '2:00 PM', court: 'Court 1', customer: 'Sarah L.', type: 'Standard' as const, duration: '1h', amount: 45, status: 'unpaid' as const, source: 'walkin' as const, past: false },
    { id: 'b10', time: '2:30 PM', court: 'Court 2', customer: 'Emma S.', type: 'Standard' as const, duration: '1h30m', amount: 68, status: 'pending' as const, source: 'online' as const, past: false },
    { id: 'b11', time: '3:00 PM', court: 'Court 1', customer: 'Walk-in', type: 'Standard' as const, duration: '1h', amount: 45, status: 'paid' as const, source: 'walkin' as const, past: false },
    { id: 'b12', time: '5:00 PM', court: 'Court 1', customer: 'Evening Open', type: 'Open Play' as const, duration: '2h', amount: 0, status: 'paid' as const, source: 'staff' as const, past: false },
    { id: 'b13', time: '5:00 PM', court: 'Court 4', customer: 'League Match', type: 'League' as const, duration: '2h', amount: 0, status: 'paid' as const, source: 'recurring' as const, past: false },
    { id: 'b14', time: '7:30 PM', court: 'Court 1', customer: 'Night Game', type: 'Standard' as const, duration: '1h30m', amount: 68, status: 'paid' as const, source: 'online' as const, past: false },
  ];
  const [showAllPast, setShowAllPast] = useState(false);
  const dashFiltered = dashBookings.filter(b => {
    if (bkFilter !== 'all' && b.status !== bkFilter) return false;
    if (bkCourtFilter !== 'all' && b.court !== bkCourtFilter) return false;
    return true;
  });
  const dashUpcoming = dashFiltered.filter(b => !b.past);
  // Past: show last 2 hours + any unpaid/pending, or all if expanded
  const dashRecentPast = dashFiltered.filter(b => b.past && (b.status === 'unpaid' || b.status === 'pending'));
  // Simulated: 8:00 AM and 8:30 AM bookings are >2hrs ago, 9:00 AM+ are within 2hrs (current time ~10:15 AM)
  const dashRecentPastWindow = dashFiltered.filter(b => b.past && b.status !== 'unpaid' && b.status !== 'pending' && ['9:00 AM', '10:00 AM'].some(t => b.time >= t));
  const dashOlderPast = dashFiltered.filter(b => b.past && b.status !== 'unpaid' && b.status !== 'pending' && !dashRecentPastWindow.includes(b));
  const dashVisiblePast = [...dashRecentPast, ...dashRecentPastWindow].sort((a, b) => a.time.localeCompare(b.time));
  const dashTotalRevenue = dashBookings.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
  const dashTotalBookings = dashBookings.length;
  const dashUnpaid = dashBookings.filter(b => b.status === 'unpaid');
  const dashPending = dashBookings.filter(b => b.status === 'pending');
  const dashUnpaidTotal = dashUnpaid.reduce((s, b) => s + b.amount, 0);
  const dashCourtUtil = [
    { name: 'Court 1', pct: 78 }, { name: 'Court 2', pct: 65 }, { name: 'Court 3', pct: 72 },
    { name: 'Court 4', pct: 58 }, { name: 'Court 4A', pct: 45 }, { name: 'Court 4B', pct: 40 },
    { name: 'Court 5', pct: 68 }, { name: 'Court 6', pct: 55 },
  ];
  const dashActivity = [
    { time: '10:02 AM', event: 'Sarah L. booked Court 1 at 2:00 PM', type: 'booking' as const },
    { time: '9:48 AM', event: 'Walk-in checked in — Court 1', type: 'checkin' as const },
    { time: '9:30 AM', event: 'Mike R. cancelled 4:00 PM (Court 2)', type: 'cancel' as const },
    { time: '9:22 AM', event: 'Payment received: Jane Doe — $30', type: 'payment' as const },
    { time: '9:15 AM', event: 'AI booked Court 2 for Alex M.', type: 'ai' as const },
    { time: '9:01 AM', event: 'Online booking: Emma S. — Court 2', type: 'booking' as const },
    { time: '8:30 AM', event: 'Mike R. checked in — Court 2', type: 'checkin' as const },
    { time: '8:02 AM', event: 'Jane Doe checked in — Court 1', type: 'checkin' as const },
  ];
  const activityDotColor: Record<string, string> = { booking: 'bg-primary', checkin: 'bg-primary/50', cancel: 'bg-destructive', payment: 'bg-primary', ai: 'bg-info' };
  const dashTypeColor: Record<string, string> = {
    'Standard': 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    'Member': 'bg-green-500/10 text-green-700 border-green-500/20',
    'Open Play': 'bg-orange-500/10 text-orange-700 border-orange-500/20',
    'Program': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    'League': 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    'Event': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  };
  const dashSourceLabel: Record<string, string> = { 'online': 'Online', 'ai': 'AI', 'walkin': 'Walk-in', 'recurring': 'Recurring', 'staff': 'Staff' };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="h-[3px] bg-primary shrink-0" />
      <div className="flex-1 flex overflow-hidden">
      {/* ===== MOBILE DRAWER ===== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-card border-r flex flex-col shadow-xl animate-in slide-in-from-left duration-200">
            {/* Drawer header */}
            <div className="h-14 flex items-center justify-between px-4 border-b">
              <div className="flex items-center gap-2.5">
                <img src="/courtside-logo.svg" alt="Courtside AI" width={24} height={24} className="h-6 w-6 shrink-0" />
                <span className="text-[14px] font-extrabold tracking-wide text-foreground uppercase">Courtside AI</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            {/* Nav — grouped */}
            <nav className="flex-1 py-2.5 px-3 overflow-y-auto">
              {[navItemsCore, navItemsOps, navItemsIntel].map((group, gi) => (
                <div key={gi}>
                  {gi > 0 && <div className="my-2 mx-2 h-px bg-border/60" />}
                  <div className="space-y-0.5">
                    {group.map(item => {
                      const Icon = item.icon;
                      const active = activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => { setActiveNav(item.id); setMobileMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-colors ${
                            active ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-semibold'
                          }`}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* AI — flagship */}
              <div className="my-2 mx-2 h-px bg-primary/20" />
              <button
                onClick={() => { setActiveNav(navItemAI.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  activeNav === navItemAI.id
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'bg-primary/[0.06] text-primary hover:bg-primary/15 font-semibold'
                }`}
              >
                <Zap className="h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
                {navItemAI.label}
              </button>
            </nav>
            {/* Footer */}
            <div className="border-t py-3 px-3 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors">
                <div className="h-6 w-6 rounded bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-primary">KC</span>
                </div>
                <span className="font-semibold truncate flex-1 text-left">Kings Court Markham</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => { setActiveNav('settings'); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  activeNav === 'settings' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-semibold'
                }`}
              >
                <Settings className="h-[18px] w-[18px] shrink-0" strokeWidth={activeNav === 'settings' ? 2.2 : 1.8} />
                Settings
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== DESKTOP SIDEBAR ===== */}
      <TooltipProvider delay={0}>
      <aside className={`${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'} shrink-0 border-r bg-card flex-col transition-all duration-200 relative hidden md:flex`}>
        {/* Logo */}
        <div className="h-14 flex items-center border-b px-2.5">
          {sidebarCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <img src="/courtside-logo.svg" alt="Courtside AI" width={26} height={26} className="h-[26px] w-[26px]" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 pl-0.5">
              <img src="/courtside-logo.svg" alt="Courtside AI" width={26} height={26} className="h-[26px] w-[26px] shrink-0" />
              <span className="text-[15px] font-extrabold tracking-wide text-foreground uppercase leading-none">Courtside AI</span>
            </div>
          )}
        </div>

        {/* Sidebar toggle — hangs on the right edge */}
        <button onClick={() => setSidebarCollapsed(c => !c)}
          className="absolute top-[22px] -right-3 z-30 h-6 w-3 flex items-center justify-center bg-card border border-border border-l-0 rounded-r-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* Nav — grouped with dividers */}
        <nav className="flex-1 py-2.5 px-2 overflow-y-auto">
          {[navItemsCore, navItemsOps, navItemsIntel].map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="my-2 mx-2 h-px bg-border/60" />}
              <div className="space-y-0.5">
                {group.map(item => {
                  const Icon = item.icon;
                  const active = activeNav === item.id;
                  const btn = (
                    <button
                      key={item.id}
                      onClick={() => setActiveNav(item.id)}
                      className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-2.5 py-2.5 rounded-md text-[13px] transition-colors ${
                        active ? 'bg-primary/10 text-primary font-bold nav-active-accent' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-semibold'
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                      {!sidebarCollapsed && item.label}
                    </button>
                  );
                  return sidebarCollapsed ? (
                    <Tooltip key={item.id}>
                      <TooltipTrigger>{btn}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-semibold">{item.label}</TooltipContent>
                    </Tooltip>
                  ) : <div key={item.id}>{btn}</div>;
                })}
              </div>
            </div>
          ))}
          {/* AI — flagship section */}
          <div className="my-2 mx-2 h-px bg-primary/20" />
          {(() => {
            const active = activeNav === navItemAI.id;
            const Icon = navItemAI.icon;
            const btn = (
              <button
                onClick={() => setActiveNav(navItemAI.id)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-2.5 py-2.5 rounded-lg text-[13px] transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'bg-primary/[0.06] text-primary hover:bg-primary/15 font-semibold'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2.2} />
                {!sidebarCollapsed && navItemAI.label}
              </button>
            );
            return sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger>{btn}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">{navItemAI.label}</TooltipContent>
              </Tooltip>
            ) : btn;
          })()}
        </nav>

        {/* Facility selector + Settings */}
        <div className="border-t py-2 px-2 space-y-0.5">
          {sidebarCollapsed ? (
            <div className="space-y-1">
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex justify-center">
                    <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                      <div className="h-6 w-6 rounded bg-primary/15 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-primary">KC</span>
                      </div>
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">Kings Court Markham</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex justify-center">
                    <button onClick={() => setActiveNav('settings')}
                      className={`h-9 w-9 flex items-center justify-center rounded-md transition-colors ${
                        activeNav === 'settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}>
                      <Settings className="h-[18px] w-[18px]" strokeWidth={activeNav === 'settings' ? 2.2 : 1.8} />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">Settings</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <>
              <button className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md text-sm text-foreground hover:bg-muted transition-colors group">
                <div className="h-6 w-6 rounded bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-primary">KC</span>
                </div>
                <span className="font-semibold truncate flex-1 text-left">Kings Court Markham</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-foreground" />
              </button>
              <button
                onClick={() => setActiveNav('settings')}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md text-[13px] transition-colors ${
                  activeNav === 'settings' ? 'bg-primary/10 text-primary font-bold nav-active-accent' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-semibold'
                }`}
              >
                <Settings className="h-[18px] w-[18px] shrink-0" strokeWidth={activeNav === 'settings' ? 2.2 : 1.8} />
                Settings
              </button>
            </>
          )}
        </div>
      </aside>
      </TooltipProvider>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ===== UNIFIED TOP BAR ===== */}
        <div className="h-14 border-b bg-card shrink-0 flex items-center justify-between px-3 md:px-5 gap-2 md:gap-4">
          {/* Left: hamburger (mobile) + page title */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <button onClick={() => setMobileMenuOpen(true)} className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors md:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-[15px] font-bold text-foreground">
              {activeNav === 'home' ? 'Home' : activeNav === 'courts' ? 'Courts' : activeNav === 'customers' ? 'Customers' : activeNav === 'billing' ? 'Billing' : activeNav === 'programs' ? 'Programs' : activeNav === 'leagues' ? 'Leagues & Events' : activeNav === 'staff' ? 'Staff' : activeNav === 'pos' ? 'Point of Sale' : activeNav === 'messages' ? 'Communications' : activeNav === 'access' ? 'Access & Check-in' : activeNav === 'reports' ? 'Reports' : activeNav === 'ai' ? 'AI Dashboard' : activeNav === 'settings' ? 'Settings' : 'Home'}
            </h1>
          </div>
          {/* Center: global search trigger — full bar on desktop, icon on mobile */}
          <button onClick={() => setCmdkOpen(true)}
            className="hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-muted-foreground transition-colors cursor-pointer max-w-md w-full">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm">Search...</span>
            <kbd className="ml-auto text-[10px] font-semibold bg-background border border-border rounded px-1.5 py-0.5 hidden md:inline-flex">⌘K</kbd>
          </button>
          {/* Right: search icon (mobile) + notifications + avatar */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            <button onClick={() => setCmdkOpen(true)} className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors sm:hidden">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary hover:bg-primary/25 transition-colors">
              DJ
            </button>
          </div>
        </div>

        {/* ===== HOME PAGE ===== */}
        {activeNav === 'home' && (<>
        {/* Home sub-bar — Schedule / Dashboard toggle */}
        <div className="h-11 border-b bg-card/50 shrink-0 flex items-center px-3 md:px-5">
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            {(['schedule', 'dashboard'] as const).map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[13px] font-semibold transition-colors ${i > 0 ? 'border-l border-border' : ''}
                  ${activeTab === tab ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                {tab === 'schedule' ? 'Schedule' : 'Dashboard'}
              </button>
            ))}
          </div>
        </div>

        {/* ===== SCHEDULE TAB ===== */}
        {activeTab === 'schedule' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View toggle + date + filters */}
            <div className="shrink-0 border-b bg-card px-3 md:px-6 py-2 md:py-0 md:h-12 flex flex-col md:flex-row md:items-center gap-2 md:gap-0 md:justify-between">
              {/* Row 1 on mobile: date nav + new booking */}
              <div className="flex items-center justify-between md:order-2 md:gap-3">
                <div className="flex items-center gap-0.5">
                  {scheduleView === 'day' && (<>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <span className="text-xs md:text-sm font-semibold text-foreground">FRI, MAR 20</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </>)}
                  {scheduleView === 'week' && (<>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <span className="text-xs md:text-sm font-semibold text-foreground">MAR 16 — 22</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </>)}
                  {scheduleView === 'month' && (<>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <span className="text-xs md:text-sm font-semibold text-foreground">MARCH 2026</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </>)}
                  {scheduleView === 'list' && (
                    <button className="flex items-center gap-1 px-2 md:px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <span className="text-xs md:text-sm font-semibold text-foreground">MAR 20 — MAY 14</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-md border border-border hover:bg-muted transition-colors text-xs font-bold text-muted-foreground btn-outline-modern">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                  </button>
                  <Button size="sm" className="h-8 md:h-9 text-xs font-bold px-3 md:px-5 btn-primary-modern">+ New</Button>
                </div>
              </div>
              {/* Row 2 on mobile: view toggle */}
              <div className="flex items-center md:order-1">
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  {(['day', 'week', 'month', 'list'] as const).map((view, vi) => (
                    <button key={view} onClick={() => setScheduleView(view)}
                      className={`px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium transition-colors ${vi > 0 ? 'border-l border-border' : ''}
                        ${scheduleView === view ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                      {view === 'day' ? 'Day' : view === 'week' ? 'Week' : view === 'month' ? 'Month' : 'List'}
                    </button>
                  ))}
                </div>
                {scheduleView === 'list' && (
                  <div className="relative flex items-center ml-3">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Search..." className="h-8 pl-8 pr-3 rounded-md border border-border bg-background text-sm w-36 md:w-44 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Content + Detail panel row */}
            <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
            {/* Day view — grid */}
            {scheduleView === 'day' && <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-hidden" ref={gridContainerRef}>
                <div className="h-full overflow-x-auto">
                  <div className="min-w-[1000px] h-full flex flex-col">
                    {/* Court headers — single row with visual grouping */}
                    <div className="grid border-b bg-muted/40 shrink-0" style={{ gridTemplateColumns: `${TIME_COL}px repeat(${courts.length}, 1fr)` }}>
                      <div className="border-r border-border bg-muted/30" />
                      {courts.map((court, i) => {
                        const isGroupStart = groups.some(g => g.indices[0] === i && g.indices.length > 1);
                        const isInMultiGroup = groups.some(g => g.indices.includes(i) && g.indices.length > 1);
                        const isGroupEnd = groups.some(g => g.indices[g.indices.length - 1] === i && g.indices.length > 1);
                        const isLastGroupBoundary = groups.some(g => g.indices[g.indices.length - 1] === i);
                        const borderClass = isLastGroupBoundary && i < courts.length - 1
                          ? 'border-r-2 border-border/60'
                          : i < courts.length - 1 ? 'border-r border-border/30' : '';
                        return (
                          <div key={i} className={`py-2 px-2 text-center ${borderClass} ${isInMultiGroup ? 'bg-muted/60' : ''}`}>
                            <p className="text-[13px] font-bold leading-snug">{court.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium leading-snug">
                              {court.sport}
                              {isGroupStart && <span className="text-primary/60"> · Split</span>}
                              {court.parentIndex !== undefined && <span className="text-primary/60"> · Sub</span>}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-1 min-h-0 overflow-y-auto" ref={gridScrollRef}>
                      <div className="shrink-0 border-r border-border bg-muted/30 sticky left-0 z-[5] relative" style={{ width: TIME_COL }}>
                        {viewHours.map((hour, i) => (
                          <div key={i} className="relative" style={{ height: HOUR_HEIGHT }}>
                            {i > 0 && (
                              <span className="absolute -top-[7px] right-2 text-[11px] font-semibold text-muted-foreground leading-none select-none tabular-nums">{hour}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 relative" style={{ height: viewTotalSlots * SLOT_HEIGHT }}>
                        <div className="absolute inset-0 pointer-events-none">
                          {viewHours.map((_, i) => (
                            <div key={i} style={{ height: HOUR_HEIGHT }}>
                              {i > 0 && <div className="border-t border-border/80" />}
                              <div className="border-t border-dotted border-border/35" style={{ marginTop: i > 0 ? SLOT_HEIGHT - 1 : SLOT_HEIGHT }} />
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 pointer-events-none flex">
                          {courts.map((_, i) => <div key={i} className={`flex-1 ${i < courts.length - 1 ? 'border-r border-border/70' : ''}`} />)}
                        </div>
                        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${courts.length}, 1fr)` }}>
                          {courts.map((court, ci) => {
                            // Merge overlapping lockouts into single ranges
                            const rawLockouts = lockouts.filter(l => l.courtIndex === ci);
                            const isLockedAt = (si: number) => rawLockouts.some(l => si >= l.startSlot && si < l.startSlot + l.duration);
                            const isParent = court.childIndices && court.childIndices.length > 0;
                            const mergedLockouts: { start: number; end: number }[] = [];
                            const sortedLocks = [...rawLockouts].sort((a, b) => a.startSlot - b.startSlot);
                            sortedLocks.forEach(l => {
                              const last = mergedLockouts[mergedLockouts.length - 1];
                              if (last && l.startSlot <= last.end) { last.end = Math.max(last.end, l.startSlot + l.duration); }
                              else { mergedLockouts.push({ start: l.startSlot, end: l.startSlot + l.duration }); }
                            });
                            return (
                            <div key={ci} className="relative">
                              {/* Closed range overlays */}
                              {getClosedRanges(ci).map((range, ri) => (
                                <div key={`closed-${ri}`} className="absolute left-0 right-0 z-[2] group cursor-not-allowed flex items-center justify-center bg-foreground/[0.18] border border-foreground/15" style={{ top: range.start * SLOT_HEIGHT, height: (range.end - range.start) * SLOT_HEIGHT }}>
                                  <span className="hidden group-hover:block text-[10px] text-muted-foreground font-semibold select-none bg-background/70 px-2 py-0.5 rounded">Closed</span>
                                </div>
                              ))}
                              {/* Dependency lockout — solid gray like closed */}
                              {mergedLockouts.map((lr, li) => (
                                <div key={`lock-${li}`} className="absolute left-0 right-0 z-[3] bg-foreground/[0.18] border border-foreground/15 cursor-not-allowed group/lk flex items-center justify-center"
                                  style={{ top: lr.start * SLOT_HEIGHT, height: (lr.end - lr.start) * SLOT_HEIGHT }}>
                                  <span className="hidden group-hover/lk:block text-[10px] text-muted-foreground font-semibold select-none bg-background/70 px-2 py-0.5 rounded">
                                    {isParent ? 'Sub-court booked' : `${courts[court.parentIndex!].name} booked`}
                                  </span>
                                </div>
                              ))}
                              {/* Open slots */}
                              {Array.from({ length: viewTotalSlots }).map((_, si) => {
                                if (isClosed(ci, si)) return null;
                                if (isLockedAt(si)) return null;
                                if (visibleBookings.some(b => b.court === ci && si >= b.startSlot && si < b.startSlot + b.duration)) return null;
                                const unbookable = isUnbookable(ci, si);
                                if (unbookable) return <div key={si} className="absolute left-0 right-0 bg-foreground/[0.18] border border-foreground/15 cursor-not-allowed group/ub flex items-center justify-center z-[2]" style={{ top: si * SLOT_HEIGHT, height: SLOT_HEIGHT }}><span className="hidden group-hover/ub:block text-[10px] text-muted-foreground font-semibold select-none bg-background/70 px-2 py-0.5 rounded">Too short</span></div>;
                                return <div key={si} className="absolute left-0 right-0 hover:bg-primary/[0.06] transition-colors cursor-pointer z-[1] group flex items-center justify-center" style={{ top: si * SLOT_HEIGHT, height: SLOT_HEIGHT }}><span className="hidden group-hover:block text-[10px] text-muted-foreground/60 font-medium select-none">{slotTime(si, vsh)}</span></div>;
                              })}
                              {visibleBookings.filter(b => b.court === ci).map(b => (
                                <BBlock key={b.id} b={b} cn={court.name} vsh={vsh} sh={SLOT_HEIGHT} sel={selectedBooking?.id === b.id} ms={court.multiSport} onClick={() => { setSelectedBooking(b); setSelectedCourt(court.name); }} />
                              ))}
                            </div>
                            );
                          })}
                        </div>
                        {currentTimeSlot >= 0 && currentTimeSlot < viewTotalSlots && (
                          <div className="absolute left-0 right-0 pointer-events-none z-20 flex items-center" style={{ top: currentTimeSlot * SLOT_HEIGHT }}>
                            <div className="h-1.5 w-1.5 rounded-full bg-destructive -ml-0.5 shadow-sm" /><div className="flex-1 h-px bg-destructive/50" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

            {/* Week view — placeholder */}
            {scheduleView === 'week' && (
              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                  {['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Sun 22'].map((d, di) => (
                    <div key={d} className={`bg-card ${di === 4 ? 'ring-2 ring-primary ring-inset' : ''}`}>
                      <div className="py-2 px-3 border-b bg-muted/40">
                        <p className="text-xs font-bold text-foreground">{d}</p>
                        <p className="text-[10px] text-muted-foreground">{12 + di * 2 + (di % 3)} bookings</p>
                      </div>
                      <div className="p-2 space-y-1 min-h-[300px]">
                        {[
                          { time: '8:00 AM', name: 'Jane Doe', paid: true },
                          { time: '9:00 AM', name: 'Open Play', paid: true },
                          { time: '10:00 AM', name: 'Tennis Clinic', paid: true },
                          { time: '11:30 AM', name: 'Alex M.', paid: true },
                          { time: '1:00 PM', name: 'Sarah L.', paid: di !== 4 },
                          { time: '3:00 PM', name: 'Walk-in', paid: true },
                          { time: '5:00 PM', name: 'Evening Open', paid: true },
                        ].slice(0, 4 + (di % 4)).map((bk, bi) => (
                          <div key={bi} className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-muted/30 cursor-pointer transition-colors">
                            <div className={`w-1 h-4 rounded-full shrink-0 ${bk.paid ? 'bg-primary' : 'bg-destructive'}`} />
                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{bk.time}</span>
                            <span className="text-[11px] font-semibold text-foreground truncate">{bk.name}</span>
                          </div>
                        ))}
                        <button className="text-[10px] text-primary font-semibold hover:underline px-1.5">+{8 + (di % 5)} more</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Month view */}
            {scheduleView === 'month' && (
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-7 gap-px bg-border h-full">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                      <div key={d} className="bg-muted/40 py-1 text-center text-[10px] font-bold text-muted-foreground tracking-wider">{d}</div>
                    ))}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i - 5;
                      const isCurrentMonth = day >= 1 && day <= 31;
                      const isToday = day === 20;
                      const isExpanded = expandedDay === day;
                      const allBookings = isCurrentMonth ? [
                        { time: '8:00 AM', name: 'Jane Doe', paid: true, court: 'Court 1' },
                        { time: '8:00 AM', name: 'Junior Camp', paid: true, court: 'Court 3' },
                        { time: '8:30 AM', name: 'Mike R.', paid: true, court: 'Court 2' },
                        { time: '9:00 AM', name: 'Open Play', paid: true, court: 'Court 1' },
                        { time: '10:00 AM', name: 'Tennis Clinic', paid: true, court: 'Court 4' },
                        { time: '10:00 AM', name: 'Anna K.', paid: true, court: 'Court 5' },
                        { time: '11:00 AM', name: 'PB Clinic', paid: true, court: 'Court 2' },
                        { time: '11:30 AM', name: 'Alex M.', paid: true, court: 'Court 1' },
                        { time: '12:00 PM', name: 'PB Drop-In', paid: true, court: 'Court 4A' },
                        { time: '12:00 PM', name: 'Corp Event', paid: true, court: 'Court 5' },
                        { time: '1:00 PM', name: 'Tom K.', paid: true, court: 'Court 2' },
                        { time: '1:00 PM', name: 'David W.', paid: true, court: 'Court 3' },
                        { time: '1:30 PM', name: 'Sarah L.', paid: false, court: 'Court 1' },
                        { time: '3:00 PM', name: 'Walk-in', paid: true, court: 'Court 1' },
                        { time: '3:00 PM', name: 'Rachel G.', paid: true, court: 'Court 3' },
                        { time: '3:00 PM', name: 'Nadia R.', paid: true, court: 'Court 4A' },
                        { time: '5:00 PM', name: 'Evening Open', paid: true, court: 'Court 1' },
                        { time: '5:00 PM', name: 'League Match', paid: true, court: 'Court 4' },
                      ] : [];
                      const shown = allBookings.slice(0, 4 + (day % 3));
                      const remaining = allBookings.length - shown.length;
                      return (
                        <div key={i} className={`bg-card p-2 hover:bg-muted/20 cursor-pointer transition-colors ${isExpanded ? 'ring-2 ring-primary ring-inset' : ''}`}
                          onClick={() => { if (!isExpanded) setExpandedDay(isCurrentMonth ? day : null); }}>
                          <span className={`text-xs font-bold ${isToday ? 'bg-primary text-white rounded-full h-5 w-5 inline-flex items-center justify-center' : 'text-foreground'}`}>
                            {isCurrentMonth ? day : day <= 0 ? 28 + day : day - 31}
                          </span>
                          {isCurrentMonth && <div className="mt-1 space-y-0.5">
                            {shown.map((bk, bi) => (
                              <div key={bi} className="flex items-center gap-1">
                                <div className={`h-2 w-2 rounded-full shrink-0 ${bk.paid ? 'bg-primary' : 'bg-destructive'}`} />
                                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">{bk.time}</span>
                                <span className="text-[10px] text-foreground font-medium truncate">{bk.name}</span>
                              </div>
                            ))}
                            {remaining > 0 && (
                              <button className="text-[10px] text-primary font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); setExpandedDay(day); }}>
                                +{remaining} more
                              </button>
                            )}
                          </div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Expanded day panel */}
                {expandedDay !== null && (
                  <div className="w-full md:w-80 absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
                    <div className="flex items-center justify-between px-5 h-12 border-b shrink-0">
                      <h3 className="text-[13px] font-bold">March {expandedDay}, 2026</h3>
                      <button onClick={() => { setExpandedDay(null); setSelectedBooking(null); }} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto py-1">
                      {[
                        { time: '8:00 AM', name: 'Jane Doe', paid: true, court: 'Court 1', id: '1' },
                        { time: '8:00 AM', name: 'Junior Camp', paid: true, court: 'Court 3', id: '15' },
                        { time: '8:30 AM', name: 'Mike R.', paid: true, court: 'Court 2', id: '8' },
                        { time: '9:00 AM', name: 'Open Play', paid: true, court: 'Court 1', id: '2' },
                        { time: '10:00 AM', name: 'Tennis Clinic', paid: true, court: 'Court 4', id: '21' },
                        { time: '10:00 AM', name: 'Anna K.', paid: true, court: 'Court 5', id: '30' },
                        { time: '11:00 AM', name: 'PB Clinic', paid: true, court: 'Court 2', id: '9' },
                        { time: '11:30 AM', name: 'Alex M.', paid: true, court: 'Court 1', id: '3' },
                        { time: '12:00 PM', name: 'PB Drop-In', paid: true, court: 'Court 4A', id: '23' },
                        { time: '12:00 PM', name: 'Corp Event', paid: true, court: 'Court 5', id: '31' },
                        { time: '1:00 PM', name: 'Tom K.', paid: true, court: 'Court 2', id: '10' },
                        { time: '1:00 PM', name: 'David W.', paid: true, court: 'Court 3', id: '16' },
                        { time: '1:30 PM', name: 'Sarah L.', paid: false, court: 'Court 1', id: '4' },
                        { time: '3:00 PM', name: 'Walk-in', paid: true, court: 'Court 1', id: '5' },
                        { time: '3:00 PM', name: 'Rachel G.', paid: true, court: 'Court 3', id: '17' },
                        { time: '3:00 PM', name: 'Nadia R.', paid: true, court: 'Court 4A', id: '24' },
                        { time: '5:00 PM', name: 'Evening Open', paid: true, court: 'Court 1', id: '6' },
                        { time: '5:00 PM', name: 'League Match', paid: true, court: 'Court 4', id: '22' },
                      ].map((bk, bi) => {
                        const booking = visibleBookings.find(b => b.id === bk.id);
                        return (
                          <div key={bi}
                            className="flex items-center gap-2.5 px-5 py-2 hover:bg-muted/30 cursor-pointer transition-colors"
                            onClick={() => { if (booking) { setSelectedBooking(booking); setSelectedCourt(bk.court); } }}>
                            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${bk.paid ? 'bg-primary' : 'bg-destructive'}`} />
                            <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-16">{bk.time}</span>
                            <span className="text-[13px] font-semibold truncate flex-1">{bk.name}</span>
                            <span className="text-[11px] text-muted-foreground shrink-0">{bk.court}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List view */}
            {scheduleView === 'list' && (
              <div className="flex-1 overflow-y-auto">
                <div className="px-5 py-2">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Time</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Court</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sport</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {visibleBookings.filter(b => b.type !== 'maintenance').sort((a, b) => a.startSlot - b.startSlot).map(b => {
                        return (
                        <tr key={b.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => { setSelectedBooking(b); setSelectedCourt(courts[b.court].name); }}>
                          <td className="py-2 text-sm text-muted-foreground tabular-nums">{slotRng(b.startSlot, b.duration, vsh)}</td>
                          <td className="py-2 text-sm font-semibold">{b.name}</td>
                          <td className="py-2 text-sm text-muted-foreground">{courts[b.court].name}</td>
                          <td className="py-2 text-sm text-muted-foreground">{b.sport || courts[b.court].sport}</td>
                          <td className="py-2 text-xs text-muted-foreground">{typeLabels[b.type]}</td>
                          <td className="py-2 text-right text-sm tabular-nums">{b.type === 'openplay' ? `$${(b.duration * 7.5).toFixed(2)}` : b.type === 'program' ? '—' : `$${(b.duration * 15 + 10).toFixed(2)}`}</td>
                          <td className="py-2 text-right">
                            {b.payment === 'paid' && <span className="text-xs font-medium text-primary">Paid</span>}
                            {b.payment === 'unpaid' && <span className="text-xs font-bold text-destructive">Unpaid</span>}
                            {b.payment === 'pending' && <span className="text-xs font-bold text-warning">Pending</span>}
                            {b.payment === 'comp' && <span className="text-xs text-muted-foreground">Comp</span>}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            </div>
            {/* Detail panel — shared across all views */}
            {selectedBooking && (
              <div className="w-full md:w-80 absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
                <DetailPanel b={selectedBooking} cn={selectedCourt} vsh={vsh} onClose={() => { setSelectedBooking(null); setSelectedCourt(''); }} />
              </div>
            )}
            </div>
          </div>
        )}

        {/* ===== DASHBOARD TAB ===== */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {/* Dashboard toolbar */}
            <div className="px-3 md:px-6 py-3 border-b bg-card flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-muted transition-colors">
                  <span className="text-xs md:text-sm font-semibold text-foreground">FRI, MAR 20</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-3 hidden md:flex">Walk-In</Button>
                <Button size="sm" className="h-8 md:h-9 text-xs font-bold px-3 md:px-5 btn-primary-modern">+ New</Button>
              </div>
            </div>
            <div className="p-3 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                {[
                  { label: 'Revenue Today', value: `$${dashTotalRevenue.toLocaleString()}`, change: '↑ 12% vs. last week', positive: true },
                  { label: 'Bookings Today', value: `${dashTotalBookings}`, change: '↑ 5 vs. last week', positive: true },
                  { label: 'Utilization', value: '72%', change: '↑ 4%', positive: true },
                  { label: 'RevPACH', value: '$48/hr', change: '↑ $3', positive: true },
                ].map((m, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 md:p-4 bg-card">
                    <p className="text-[10px] md:text-[11px] text-muted-foreground font-medium">{m.label}</p>
                    <p className="text-xl md:text-2xl font-bold mt-1 tabular-nums">{m.value}</p>
                    <p className={`text-[10px] md:text-xs font-medium mt-0.5 ${m.positive ? 'text-primary' : 'text-destructive'}`}>{m.change}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 md:gap-6">
                <div className="space-y-4">
                  {(dashUnpaid.length > 0 || dashPending.length > 0) && (
                    <div className="border border-border rounded-lg bg-card">
                      <div className="px-4 py-3 border-b"><h3 className="text-sm font-bold">Action Items ({dashUnpaid.length + dashPending.length})</h3></div>
                      <div className="p-3 space-y-2">
                        {dashUnpaid.length > 0 && <button onClick={() => setBkFilter('unpaid')} className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors text-left"><div className="h-2 w-2 rounded-full bg-destructive shrink-0" /><span className="text-sm font-medium text-destructive">{dashUnpaid.length} Unpaid — ${dashUnpaidTotal}</span></button>}
                        {dashPending.length > 0 && <button onClick={() => setBkFilter('pending')} className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-warning/20 bg-warning/5 hover:bg-warning/10 transition-colors text-left"><div className="h-2 w-2 rounded-full bg-warning shrink-0" /><span className="text-sm font-medium text-warning-foreground">{dashPending.length} Pending</span></button>}
                        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md border border-info/20 bg-info/5 hover:bg-info/10 transition-colors text-left"><div className="h-2 w-2 rounded-full bg-info shrink-0" /><span className="text-sm font-medium text-info">4 Arriving in next 30 min</span></button>
                      </div>
                    </div>
                  )}
                  <div className="border border-border rounded-lg bg-card">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                      <h3 className="text-sm font-bold">Today&apos;s Bookings ({dashFiltered.length})</h3>
                      <div className="flex items-center gap-2">
                        <select value={bkFilter} onChange={e => setBkFilter(e.target.value)} className="h-7 text-[11px] font-semibold px-2 select-modern"><option value="all">All Status</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="pending">Pending</option></select>
                        <select value={bkCourtFilter} onChange={e => setBkCourtFilter(e.target.value)} className="h-7 text-[11px] font-semibold px-2 select-modern"><option value="all">All Courts</option>{dashCourtUtil.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                        {(bkFilter !== 'all' || bkCourtFilter !== 'all') && <button onClick={() => { setBkFilter('all'); setBkCourtFilter('all'); }} className="text-[11px] text-muted-foreground hover:text-foreground font-medium">Clear</button>}
                      </div>
                    </div>
                    {/* Column headers */}
                    <div className="hidden md:grid grid-cols-[72px_2fr_1fr_1fr_1fr_80px] gap-x-4 px-4 py-2 border-b bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Time</span><span>Customer</span><span>Court</span><span>Duration</span><span className="text-right">Amount</span><span className="text-right">Status</span>
                    </div>
                    {dashUpcoming.length > 0 && (<><div className="px-4 py-1.5 bg-muted/30 border-b"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upcoming ({dashUpcoming.length})</p></div>
                      <div className="divide-y">{dashUpcoming.map(b => {
                        const match = visibleBookings.find(vb => vb.name === b.customer);
                        return (
                        <div key={b.id} onClick={() => { if (match) { setSelectedBooking(match); setSelectedCourt(b.court); } }}
                          className={`grid grid-cols-[60px_1fr_auto] md:grid-cols-[72px_2fr_1fr_1fr_1fr_80px] gap-x-2 md:gap-x-4 px-3 md:px-4 py-2.5 items-center hover:bg-muted/30 transition-colors cursor-pointer ${selectedBooking && match && selectedBooking.id === match.id ? 'bg-primary/5' : ''}`}>
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">{b.time}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{b.customer}</span>
                          <span className="text-xs text-muted-foreground font-medium hidden md:block">{b.court}</span>
                          <span className="text-xs text-muted-foreground font-medium hidden md:block">{b.duration}</span>
                          <span className="text-sm font-semibold tabular-nums text-right hidden md:block">{b.amount > 0 ? `$${b.amount}` : 'Comp'}</span>
                          <span className="text-right">
                            {b.status === 'unpaid' && <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[10px] py-0 px-1.5 font-semibold">UNPAID</Badge>}
                            {b.status === 'pending' && <Badge className="bg-warning/10 text-warning-foreground border border-warning/20 text-[10px] py-0 px-1.5 font-semibold">PENDING</Badge>}
                            {b.status === 'paid' && <span className="text-sm font-bold text-primary">✓</span>}
                          </span>
                        </div>);
                      })}</div></>)}
                    {dashVisiblePast.length > 0 && (<><div className="px-4 py-1.5 bg-muted/30 border-b border-t"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recent ({dashVisiblePast.length})</p></div>
                      <div className="divide-y">{dashVisiblePast.map(b => {
                        const match = visibleBookings.find(vb => vb.name === b.customer);
                        return (
                        <div key={b.id} onClick={() => { if (match) { setSelectedBooking(match); setSelectedCourt(b.court); } }}
                          className={`grid grid-cols-[60px_1fr_auto] md:grid-cols-[72px_2fr_1fr_1fr_1fr_80px] gap-x-2 md:gap-x-4 px-3 md:px-4 py-2.5 items-center hover:bg-muted/30 transition-colors cursor-pointer opacity-60 ${selectedBooking && match && selectedBooking.id === match.id ? 'opacity-100 bg-primary/5' : ''}`}>
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">{b.time}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{b.customer}</span>
                          <span className="text-xs text-muted-foreground font-medium hidden md:block">{b.court}</span>
                          <span className="text-xs text-muted-foreground font-medium hidden md:block">{b.duration}</span>
                          <span className="text-sm font-semibold tabular-nums text-right hidden md:block">{b.amount > 0 ? `$${b.amount}` : 'Comp'}</span>
                          <span className="text-right">
                            {b.checkedIn && <span className="text-sm font-bold text-primary">✓ In</span>}
                            {b.status === 'paid' && !b.checkedIn && <span className="text-sm font-bold text-primary">✓</span>}
                          </span>
                        </div>);
                      })}</div></>)}
                    {dashOlderPast.length > 0 && !showAllPast && (
                      <div className="px-4 py-2.5 border-t">
                        <button onClick={() => setShowAllPast(true)} className="text-xs text-primary font-semibold hover:underline">Show {dashOlderPast.length} earlier bookings</button>
                      </div>
                    )}
                    {showAllPast && dashOlderPast.length > 0 && (<><div className="px-4 py-1.5 bg-muted/30 border-b border-t"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Earlier ({dashOlderPast.length})</p></div>
                      <div className="divide-y">{dashOlderPast.map(b => (
                        <div key={b.id} className="grid grid-cols-[60px_1fr_auto] md:grid-cols-[72px_2fr_1fr_1fr_1fr_80px] gap-x-2 md:gap-x-4 px-3 md:px-4 py-2.5 items-center hover:bg-muted/30 transition-colors cursor-pointer opacity-40">
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">{b.time}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{b.customer}</span>
                          <span className="text-xs text-muted-foreground font-medium hidden md:block">{b.court}</span>
                          <span className="text-xs text-muted-foreground font-medium hidden md:block">{b.duration}</span>
                          <span className="text-sm font-semibold tabular-nums text-right hidden md:block">{b.amount > 0 ? `$${b.amount}` : 'Comp'}</span>
                          <span className="text-right">{b.checkedIn && <span className="text-sm font-bold text-primary">✓ In</span>}</span>
                        </div>
                      ))}</div>
                      <div className="px-4 py-2 border-t"><button onClick={() => setShowAllPast(false)} className="text-xs text-muted-foreground font-medium hover:underline">Hide earlier</button></div>
                    </>)}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="border border-border rounded-lg bg-card">
                    <div className="px-4 py-3 border-b"><h3 className="text-sm font-bold">Court Utilization</h3></div>
                    <div className="p-4 space-y-3">
                      {dashCourtUtil.map((c, i) => (
                        <button key={i} onClick={() => setBkCourtFilter(bkCourtFilter === c.name ? 'all' : c.name)} className={`w-full flex items-center gap-3 transition-colors rounded-sm px-1 py-0.5 ${bkCourtFilter === c.name ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                          <span className={`text-xs font-medium w-[64px] shrink-0 text-left ${c.name.includes('4A') || c.name.includes('4B') ? 'pl-3 text-muted-foreground' : 'text-foreground'}`}>{c.name}</span>
                          <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${c.pct}%` }} /></div>
                          <span className="text-xs font-bold tabular-nums w-[36px] text-right">{c.pct}%</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* AI Summary */}
                  <div className="border border-border rounded-lg bg-card">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                      <h3 className="text-sm font-bold">AI Today</h3>
                      <button onClick={() => setActiveNav('ai')} className="text-[10px] text-primary font-semibold hover:underline">View All →</button>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                      <div><p className="text-[10px] text-muted-foreground font-medium">Calls</p><p className="text-lg font-bold">12</p></div>
                      <div><p className="text-[10px] text-muted-foreground font-medium">AI Revenue</p><p className="text-lg font-bold text-primary">$340</p></div>
                      <div><p className="text-[10px] text-muted-foreground font-medium">Resolution</p><p className="text-lg font-bold">89%</p></div>
                      <div><p className="text-[10px] text-muted-foreground font-medium">Bookings Made</p><p className="text-lg font-bold">8</p></div>
                    </div>
                  </div>
                  <div className="border border-border rounded-lg bg-card">
                    <div className="px-4 py-3 border-b"><h3 className="text-sm font-bold">Recent Activity</h3></div>
                    <div className="divide-y">
                      {dashActivity.map((a, i) => (
                        <div key={i} className="px-4 py-2.5 flex items-start gap-2.5">
                          <div className={`h-2 w-2 rounded-full mt-1 shrink-0 ${activityDotColor[a.type]}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-foreground font-medium leading-snug">{a.event}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Detail panel for dashboard */}
          {selectedBooking && (
            <div className="w-full md:w-80 absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
              <DetailPanel b={selectedBooking} cn={selectedCourt} vsh={vsh} onClose={() => { setSelectedBooking(null); setSelectedCourt(''); }} />
            </div>
          )}
          </div>
        )}
        </>)}


        {/* ===== COURTS MANAGEMENT PAGE ===== */}
        {activeNav === 'courts' && (() => {
          const courtSports = Array.from(new Set(courtMgmtData.map(c => c.sport.split(' / ')[0])));
          const showSportPills = courtSports.length >= 2;
          const filteredCourts = courtMgmtData.filter(c => {
            if (courtSearchQ && !c.name.toLowerCase().includes(courtSearchQ.toLowerCase())) return false;
            if (courtSportFilter !== 'all' && !c.sport.includes(courtSportFilter)) return false;
            return true;
          });
          const metricsMultiplier = metricsRange === '30d' ? 4.2 : metricsRange === 'all' ? 26 : 1;
          return (
          <>
            {/* Toolbar — search + sport filter pills + Add Court */}
            <div className="shrink-0 border-b bg-card px-3 md:px-6 py-2 md:py-0 md:h-12 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input type="text" placeholder="Search courts..." value={courtSearchQ} onChange={e => setCourtSearchQ(e.target.value)}
                    className="h-8 pl-8 pr-3 rounded-md border border-border bg-background text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                {showSportPills && (
                  <div className="flex items-center border border-border rounded-md overflow-hidden">
                    {['all', ...courtSports].map((sport, si) => (
                      <button key={sport} onClick={() => setCourtSportFilter(sport)}
                        className={`px-4 py-1.5 text-xs font-bold transition-colors ${si > 0 ? 'border-l border-border' : ''}
                          ${courtSportFilter === sport ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                        {sport === 'all' ? 'All' : sport}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button size="sm" className="h-8 text-xs font-bold px-4 btn-primary-modern">+ Add Court</Button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Court cards */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredCourts.map((court, fi) => {
                    const i = courtMgmtData.indexOf(court);
                    return (
                    <div key={i} onClick={() => { setSelectedCourtIdx(i); setCourtTab('overview'); setCourtMoreMenu(false); }}
                      className={`rounded-lg bg-card card-elevated cursor-pointer ${selectedCourtIdx === i ? 'border-primary ring-1 ring-primary/30' : 'hover:border-primary/30'}`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-[15px] font-bold text-foreground">{court.name}</h3>
                          <Badge variant="outline" className="text-[10px] py-0.5 px-2 font-semibold rounded-[3px] bg-primary/10 text-primary border-primary/25">{court.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{court.sport} · {court.surface} · {court.indoor ? 'Indoor' : 'Outdoor'}</p>
                        {court.split && <p className="text-[10px] text-primary font-semibold mt-0.5">{court.split}</p>}
                        {court.parent && <p className="text-[10px] text-primary font-semibold mt-0.5">{court.parent}</p>}
                        {court.hours && <p className="text-[10px] text-muted-foreground mt-0.5">{court.hours}</p>}

                        <div className="h-px bg-border my-3" />

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Base Rate</p>
                            <p className="text-sm font-bold mt-0.5">${court.rate}/hr</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">This Week</p>
                            <p className="text-sm font-bold mt-0.5">{court.bookings} <span className={`text-[10px] font-semibold ${court.bkgDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>{court.bkgDelta >= 0 ? '↑' : '↓'}{Math.abs(court.bkgDelta)}</span></p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Utilization</p>
                            <p className="text-sm font-bold mt-0.5">{court.utilization}% <span className={`text-[10px] font-semibold ${court.utilDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>{court.utilDelta >= 0 ? '↑' : '↓'}{Math.abs(court.utilDelta)}%</span></p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-[11px] font-bold btn-outline-modern" onClick={(e) => { e.stopPropagation(); setSelectedCourtIdx(i); setCourtTab('overview'); }}>Details</Button>
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-[11px] font-bold btn-outline-modern" onClick={(e) => { e.stopPropagation(); setSelectedCourtIdx(i); setCourtTab('pricing'); }}>Pricing</Button>
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-[11px] font-bold btn-outline-modern" onClick={(e) => { e.stopPropagation(); setSelectedCourtIdx(i); setCourtTab('rules'); }}>Rules</Button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Right-side detail panel */}
              {selectedCourtData !== null && (
                <div className="w-full md:w-[540px] absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 h-12 border-b shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-bold">{selectedCourtData.name}</h3>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-semibold rounded-[3px] bg-primary/10 text-primary border-primary/25">{selectedCourtData.status}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* More menu */}
                      <div className="relative">
                        <button onClick={() => setCourtMoreMenu(!courtMoreMenu)} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {courtMoreMenu && (
                          <div className="absolute right-0 top-9 w-52 rounded-lg border panel-glass z-50 py-1">
                            <button onClick={() => setCourtMoreMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"><Copy className="h-3.5 w-3.5" />Duplicate Court</button>
                            <button onClick={() => setCourtMoreMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"><ExternalLink className="h-3.5 w-3.5" />View on Schedule</button>
                            <button onClick={() => setCourtMoreMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"><Wrench className="h-3.5 w-3.5" />Schedule Maintenance</button>
                            <div className="h-px bg-border mx-2 my-1" />
                            <button onClick={() => setCourtMoreMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"><Power className="h-3.5 w-3.5" />Deactivate Court</button>
                            <div className="h-px bg-border mx-2 my-1" />
                            <button onClick={() => { setCourtMoreMenu(false); setDeleteModalOpen(true); setDeleteConfirmText(''); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"><Trash2 className="h-3.5 w-3.5" />Delete Court</button>
                          </div>
                        )}
                      </div>
                      <button onClick={() => { setSelectedCourtIdx(null); setCourtMoreMenu(false); }} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Panel tabs */}
                  <div className="shrink-0 border-b px-5 flex items-end">
                    {(['overview', 'pricing', 'rules'] as const).map((tab) => (
                      <button key={tab} onClick={() => setCourtTab(tab)}
                        className={`px-3 pb-2 pt-2.5 text-xs font-semibold transition-colors border-b-2 ${
                          courtTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}>
                        {tab === 'overview' ? 'Overview' : tab === 'pricing' ? 'Pricing' : 'Rules'}
                      </button>
                    ))}
                  </div>

                  {/* Panel content */}
                  <div className="flex-1 overflow-y-auto">
                    {courtTab === 'overview' && (
                      <div className="p-5 space-y-4">
                        {/* Performance metrics with time toggle */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Performance</p>
                            <div className="flex items-center border border-border rounded-md overflow-hidden">
                              {(['7d', '30d', 'all'] as const).map((r, ri) => (
                                <button key={r} onClick={() => setMetricsRange(r)}
                                  className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${ri > 0 ? 'border-l border-border' : ''}
                                    ${metricsRange === r ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                                  {r === '7d' ? '7D' : r === '30d' ? '30D' : 'ALL'}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-md p-3 card-elevated"><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Bookings</p><p className="text-lg font-bold mt-0.5">{Math.round(selectedCourtData.bookings * metricsMultiplier)}</p></div>
                            <div className="rounded-md p-3 card-elevated"><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Utilization</p><p className="text-lg font-bold mt-0.5">{selectedCourtData.utilization}%</p></div>
                            <div className="rounded-md p-3 card-elevated"><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Revenue</p><p className="text-lg font-bold mt-0.5">${Math.round(selectedCourtData.revWeek * metricsMultiplier).toLocaleString()}</p></div>
                            <div className="rounded-md p-3 card-elevated"><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Base Rate</p><p className="text-lg font-bold mt-0.5">${selectedCourtData.rate}/hr</p></div>
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Status */}
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</p>
                          <select className="h-8 px-3 text-xs font-bold select-modern" defaultValue="Active">
                            <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Maintenance">Maintenance</option>
                          </select>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Court Details */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Court Details</p>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Name</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.name} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Sport</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.sport} /></div>
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Surface</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.surface} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Capacity</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={String(selectedCourtData.capacity)} /></div>
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Environment</label><select className="w-full h-8 px-3 text-sm font-medium select-modern" defaultValue={selectedCourtData.indoor ? 'Indoor' : 'Outdoor'}><option>Indoor</option><option>Outdoor</option><option>Covered Outdoor</option></select></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Court Size</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.sport.includes('Pickleball') ? '20\' × 44\'' : selectedCourtData.sport.includes('Tennis') ? '36\' × 78\'' : '50\' × 94\''} /></div>
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Display Order</label><input type="number" className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={String(courtMgmtData.indexOf(selectedCourtData) + 1)} /></div>
                          </div>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Court Group</label><select className="w-full h-8 px-3 text-sm font-medium select-modern" defaultValue="none"><option value="none">No Group</option><option>East Wing</option><option>West Wing</option><option>Building A</option></select></div>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Amenities</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.amenities} /></div>
                          {selectedCourtData.split && <div className="bg-primary/5 border border-primary/15 rounded-md p-2.5"><p className="text-[11px] font-semibold text-primary">{selectedCourtData.split}</p></div>}
                          {selectedCourtData.parent && <div className="bg-primary/5 border border-primary/15 rounded-md p-2.5"><p className="text-[11px] font-semibold text-primary">{selectedCourtData.parent}</p></div>}
                        </div>

                        <div className="h-px bg-border" />

                        {/* Availability Hours */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Availability Hours</p>
                            <Badge variant="outline" className="text-[9px] font-semibold">Using facility default</Badge>
                          </div>
                          <div className="border border-border rounded-md divide-y">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                              <div key={day} className="px-3 py-2 flex items-center justify-between">
                                <span className="text-xs font-semibold w-10">{day}</span>
                                <span className="text-xs text-muted-foreground">{day === 'Sun' ? '9:00 AM – 8:00 PM' : day === 'Sat' ? '8:00 AM – 10:00 PM' : '8:00 AM – 10:00 PM'}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] font-bold btn-outline-modern">Seasonal Overrides</Button>
                            <Button size="sm" variant="outline" className="flex-1 h-7 text-[10px] font-bold btn-outline-modern">Blackout Dates</Button>
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Customer-Facing Profile */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Customer-Facing Profile</p>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Description</label><textarea className="w-full h-20 px-3 py-2 rounded-md border border-border bg-background text-sm resize-none" placeholder="Describe this court for customers booking online..." defaultValue={selectedCourtData.name === 'Court 1' ? 'Standard pickleball court with professional-grade nets and LED lighting. Located in the main hall with full climate control.' : ''} /></div>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Highlights</label>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedCourtData.amenities.split(', ').map(a => <Badge key={a} variant="outline" className="text-[10px] font-semibold">{a}</Badge>)}
                              <button className="text-[10px] text-primary font-bold hover:underline">+ Add</button>
                            </div>
                          </div>
                          <div className="border-2 border-dashed border-border rounded-lg h-24 flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">Drop photos or click to upload (up to 5)</p>
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Notes */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Internal Notes</p>
                          <textarea className="w-full h-16 px-3 py-2 rounded-md border border-border bg-background text-sm resize-none" placeholder="Staff-only notes about this court..." />
                          <p className="text-[10px] text-muted-foreground">Only visible to staff</p>
                        </div>
                      </div>
                    )}

                    {courtTab === 'pricing' && (
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Base Rate</p>
                          <input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm font-bold" defaultValue={`$${selectedCourtData.rate}/hr`} />
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Time-of-Day Pricing</p>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold px-2.5 btn-outline-modern">+ Add</Button>
                          </div>
                          <div className="border border-border rounded-md divide-y">
                            {[
                              { window: '8 AM – 12 PM', label: 'Morning', rate: `$${selectedCourtData.rate}`, mod: 'Base' },
                              { window: '12 PM – 5 PM', label: 'Afternoon', rate: `$${Math.round(selectedCourtData.rate * 1.2)}`, mod: '+20%' },
                              { window: '5 PM – 10 PM', label: 'Prime', rate: `$${Math.round(selectedCourtData.rate * 1.5)}`, mod: '+50%' },
                            ].map((tw, twi) => (
                              <div key={twi} className="px-3 py-2.5 flex items-center justify-between">
                                <div><p className="text-xs font-semibold">{tw.label}</p><p className="text-[10px] text-muted-foreground">{tw.window}</p></div>
                                <div className="text-right"><p className="text-xs font-bold">{tw.rate}/hr</p><p className="text-[9px] text-muted-foreground">{tw.mod}</p></div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tag Modifiers</p>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold px-2.5 btn-outline-modern">+ Add</Button>
                          </div>
                          <div className="border border-border rounded-md divide-y">
                            {[
                              { tag: 'Member', discount: '15% off', applies: 'All windows' },
                              { tag: 'Senior', discount: '20% off', applies: 'Morning' },
                              { tag: 'Student', discount: '10% off', applies: 'Off-peak' },
                            ].map((m, mi) => (
                              <div key={mi} className="px-3 py-2.5 flex items-center justify-between">
                                <div><p className="text-xs font-semibold">{m.tag}</p><p className="text-[10px] text-muted-foreground">{m.applies}</p></div>
                                <Badge variant="outline" className="text-[10px] font-semibold">{m.discount}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Amenity Surcharges */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Amenity Surcharges</p>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold px-2.5 btn-outline-modern">+ Add</Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">Automatic charges included with every booking on this court</p>
                          {selectedCourtData.amenities.includes('Scoreboard') || selectedCourtData.amenities.includes('Video') ? (
                            <div className="border border-border rounded-md divide-y">
                              {selectedCourtData.amenities.includes('Video') && (
                                <div className="px-3 py-2.5 flex items-center justify-between">
                                  <div><p className="text-xs font-semibold">Video Replay</p><p className="text-[10px] text-muted-foreground">Per booking (flat)</p></div>
                                  <span className="text-xs font-bold">$10.00</span>
                                </div>
                              )}
                              {selectedCourtData.amenities.includes('Scoreboard') && (
                                <div className="px-3 py-2.5 flex items-center justify-between">
                                  <div><p className="text-xs font-semibold">Electronic Scoreboard</p><p className="text-[10px] text-muted-foreground">Per hour</p></div>
                                  <span className="text-xs font-bold">$3.00/hr</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="border border-border rounded-md px-3 py-4 flex items-center justify-center">
                              <p className="text-xs text-muted-foreground">No surcharges configured</p>
                            </div>
                          )}
                        </div>

                        <div className="h-px bg-border" />

                        {/* Booking Add-Ons */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Booking Add-Ons</p>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold px-2.5 btn-outline-modern">+ Link</Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground mb-2">Optional items customers can select at checkout</p>
                          <div className="border border-border rounded-md divide-y">
                            {[
                              { name: 'Racket Rental', type: 'Per session', price: '$5.00' },
                              { name: 'Ball Hopper', type: 'Per session', price: '$3.00' },
                              { name: 'Towel Service', type: 'Per session', price: '$2.00' },
                            ].map((ao, aoi) => (
                              <div key={aoi} className="px-3 py-2.5 flex items-center justify-between">
                                <div><p className="text-xs font-semibold">{ao.name}</p><p className="text-[10px] text-muted-foreground">{ao.type}</p></div>
                                <span className="text-xs font-bold">{ao.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div className="bg-muted/50 border border-border rounded-md p-3">
                          <p className="text-[10px] font-bold mb-0.5">Pricing Cascade</p>
                          <p className="text-[10px] text-muted-foreground">Court rate → Amenity surcharges → Time-of-day → Tag modifier → Seasonal → Promo → Add-ons</p>
                        </div>
                      </div>
                    )}

                    {courtTab === 'rules' && (
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Booking Windows</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Max Advance</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="30 days" /></div>
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Min Notice</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="1 hour" /></div>
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Duration & Buffers</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Min Duration</label><select className="w-full h-8 px-3 text-sm font-medium select-modern" defaultValue="60"><option value="15">15 min</option><option value="30">30 min</option><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option></select></div>
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Max Duration</label><select className="w-full h-8 px-3 text-sm font-medium select-modern" defaultValue="180"><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="240">4 hours</option></select></div>
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Time Granularity</label><select className="w-full h-8 px-3 text-sm font-medium select-modern" defaultValue="30"><option value="15">15 min</option><option value="30">30 min</option><option value="60">60 min</option></select></div>
                            <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Turnaround</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="10 min" /></div>
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Access & Visibility */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Access & Visibility</p>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Visibility Tags</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" placeholder="Blank = visible to all" defaultValue="" /></div>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Booking Tags</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" placeholder="Blank = anyone can book" defaultValue="" /></div>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Restriction Message</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="This court requires special access. Contact the facility for more information." /></div>
                          <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Unavailable Slot Detail</label><select className="w-full h-8 px-3 text-sm font-medium select-modern" defaultValue="opaque"><option value="opaque">Opaque — &quot;Unavailable&quot; only</option><option value="type">Activity Type — shows sport/category</option><option value="label">Activity + Label — shows event name</option></select></div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Access & Approval</p>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold px-2.5 btn-outline-modern">+ Add</Button>
                          </div>
                          <div className="border border-border rounded-md divide-y">
                            {[
                              { rule: 'Public booking', desc: 'Anyone can book', on: true },
                              { rule: 'Prime time — Members only', desc: '5 PM – 10 PM', on: true },
                              { rule: 'Auto-approve', desc: 'No staff approval needed', on: true },
                              { rule: 'Recurring allowed', desc: 'Standing bookings OK', on: true },
                            ].map((r, ri) => (
                              <div key={ri} className="px-3 py-2.5 flex items-center justify-between">
                                <div><p className="text-xs font-semibold">{r.rule}</p><p className="text-[10px] text-muted-foreground">{r.desc}</p></div>
                                <Badge variant="outline" className="text-[9px] font-semibold bg-primary/10 text-primary border-primary/25">On</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Cancellation & Rescheduling</p>
                          <div className="border border-border rounded-md">
                            {/* Header */}
                            <div className="grid grid-cols-[1fr_1fr_1fr] px-3 py-2 bg-muted/40 border-b">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Window</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cancellation</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Rescheduling</span>
                            </div>
                            {[
                              { window: '> 24 hrs', cancel: 'Full refund', reschedule: 'Free, unlimited' },
                              { window: '12 – 24 hrs', cancel: 'Credit only', reschedule: '1 allowed, $10 fee' },
                              { window: '< 12 hrs', cancel: 'No refund', reschedule: 'Not allowed' },
                            ].map((r, ri) => (
                              <div key={ri} className={`grid grid-cols-[1fr_1fr_1fr] px-3 py-2.5 ${ri > 0 ? 'border-t' : ''}`}>
                                <span className="text-xs font-semibold">{r.window}</span>
                                <span className="text-xs text-muted-foreground">{r.cancel}</span>
                                <span className="text-xs text-muted-foreground">{r.reschedule}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Split/Combo — only for courts with relationships */}
                        {(selectedCourtData.split || selectedCourtData.parent) && (<>
                          <div className="h-px bg-border" />
                          <div className="space-y-3">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Court Conversions</p>
                            <div className="bg-primary/5 border border-primary/15 rounded-md p-3 space-y-2">
                              <p className="text-[11px] font-semibold text-primary">{selectedCourtData.split || selectedCourtData.parent}</p>
                              <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Buffer Time</label><input className="w-full h-8 px-3 rounded-md border border-primary/20 bg-background text-sm" defaultValue="15 min" /></div>
                                <div><label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">Conversion Window</label><input className="w-full h-8 px-3 rounded-md border border-primary/20 bg-background text-sm" defaultValue="Mon–Fri 8 AM – 6 PM" /></div>
                              </div>
                            </div>
                          </div>
                        </>)}
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <div className="border-t px-5 py-3 shrink-0">
                    <Button className="w-full h-9 text-[12px] font-bold btn-primary-modern">Save Changes</Button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Court Modal */}
            {deleteModalOpen && selectedCourtData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteModalOpen(false)}>
                <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
                <div className="relative bg-card rounded-xl shadow-2xl w-[440px] p-6 space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">Delete {selectedCourtData.name}?</h3>
                      <p className="text-sm text-muted-foreground">This action is permanent and cannot be undone.</p>
                    </div>
                  </div>

                  <div className="bg-destructive/5 border border-destructive/15 rounded-md p-3 space-y-1.5">
                    <p className="text-sm font-semibold text-destructive">This will cancel {selectedCourtData.bookings} upcoming bookings and notify affected customers.</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 ml-4 list-disc">
                      <li>All future bookings on this court will be cancelled</li>
                      <li>Pricing rules and surcharges will be removed</li>
                      <li>Add-on links will be unlinked</li>
                      <li>Availability configuration will be deleted</li>
                      <li>Court conversion relationships will be severed</li>
                    </ul>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                      Type &ldquo;{selectedCourtData.name}&rdquo; to confirm
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-destructive/30"
                        placeholder={selectedCourtData.name}
                        value={deleteConfirmText}
                        onChange={e => setDeleteConfirmText(e.target.value)}
                      />
                      {deleteConfirmText === selectedCourtData.name && (
                        <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-success" />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button variant="outline" className="flex-1 h-9 text-[12px] font-bold btn-outline-modern" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
                    <Button
                      className="flex-1 h-9 text-[12px] font-bold bg-destructive hover:bg-destructive/90 text-white"
                      disabled={deleteConfirmText !== selectedCourtData.name}
                      onClick={() => { setDeleteModalOpen(false); setSelectedCourtIdx(null); }}
                    >
                      Permanently Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
          );
        })()}


        {/* ===== CUSTOMERS PAGE ===== */}
        {activeNav === 'customers' && <CustomersView />}

        {/* ===== BILLING PAGE ===== */}
        {activeNav === 'billing' && <BillingView />}

        {/* ===== PROGRAMS PAGE ===== */}
        {activeNav === 'programs' && <ProgramsView />}

        {/* ===== LEAGUES & EVENTS PAGE ===== */}
        {activeNav === 'leagues' && <LeaguesView />}

        {/* ===== STAFF PAGE ===== */}
        {activeNav === 'staff' && <StaffView />}

        {/* ===== POS PAGE ===== */}
        {activeNav === 'pos' && <POSView />}

        {/* ===== COMMUNICATIONS PAGE ===== */}
        {activeNav === 'messages' && <CommunicationsView />}

        {/* ===== ACCESS & CHECK-IN PAGE ===== */}
        {activeNav === 'access' && <AccessView />}

        {/* ===== REPORTS PAGE ===== */}
        {activeNav === 'reports' && <ReportsView />}

        {/* ===== AI DASHBOARD PAGE ===== */}
        {activeNav === 'ai' && <AIDashboardView />}

        {/* ===== SETTINGS PAGE ===== */}
        {activeNav === 'settings' && <SettingsView />}

      </div>
      </div>

      {/* ===== COMMAND PALETTE (Cmd+K) ===== */}
      <CommandDialog open={cmdkOpen} onOpenChange={setCmdkOpen}>
        <CommandInput placeholder="Search pages, customers, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.id} onSelect={() => { setActiveNav(item.id); setCmdkOpen(false); }}
                  className="flex items-center gap-3 cursor-pointer">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              );
            })}
            <CommandItem onSelect={() => { setActiveNav('settings'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { setActiveNav('home'); setActiveTab('schedule'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span>New Booking</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveNav('customers'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <span>Add Customer</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveNav('billing'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>Record Payment</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveNav('messages'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>Compose Message</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveNav('programs'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>Create Program</span>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Views">
            <CommandItem onSelect={() => { setActiveNav('home'); setActiveTab('schedule'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Schedule</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveNav('home'); setActiveTab('dashboard'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveNav('reports'); setCmdkOpen(false); }}
              className="flex items-center gap-3 cursor-pointer">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <span>Reports</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

    </div>
  );
}

// ============================================================
// CUSTOMERS VIEW
// ============================================================
function CustomersView() {
  const allCustomers = buildCustomers();
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortCol, setSortCol] = useState<string>('lastActivity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'bookings' | 'membership' | 'financials' | 'communications' | 'tags' | 'activity' | 'notes' | 'waivers'>('overview');
  const [custMoreMenu, setCustMoreMenu] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [noteTypeFilter, setNoteTypeFilter] = useState('all');

  // Filter & sort
  const filtered = allCustomers.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (membershipFilter !== 'all') {
      if (membershipFilter === 'none' && c.membershipTier !== null) return false;
      if (membershipFilter !== 'none' && c.membershipTier !== membershipFilter) return false;
    }
    if (tagFilter !== 'all' && !c.tags.some(t => t.name === tagFilter)) return false;
    if (riskFilter !== 'all' && c.churnRisk !== riskFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  }).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortCol === 'name') return dir * `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    if (sortCol === 'totalSpend') return dir * (a.totalSpend - b.totalSpend);
    if (sortCol === 'totalBookings') return dir * (a.totalBookings - b.totalBookings);
    if (sortCol === 'daysSinceLastVisit') return dir * (a.daysSinceLastVisit - b.daysSinceLastVisit);
    return dir * (a.lastActivity > b.lastActivity ? 1 : -1);
  });

  const toggleSort = (col: string) => { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('desc'); } };
  const toggleSelect = (id: string) => { const s = new Set(selectedIds); if (s.has(id)) s.delete(id); else s.add(id); setSelectedIds(s); };
  const toggleAll = () => { if (selectedIds.size === filtered.length) setSelectedIds(new Set()); else setSelectedIds(new Set(filtered.map(c => c.id))); };

  const allTags = Array.from(new Set(allCustomers.flatMap(c => c.tags.map(t => t.name))));

  // ---- DETAIL VIEW ----
  if (viewingCustomer) {
    const c = viewingCustomer;
    return (
      <>
        {/* Breadcrumb sub-bar */}
        <div className="h-11 border-b bg-card/50 shrink-0 flex items-center px-5 gap-3">
          <button onClick={() => { setViewingCustomer(null); setDetailTab('overview'); }} className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="text-[13px] text-muted-foreground">Customers</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-[13px] font-semibold">{c.firstName} {c.lastName}</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Profile header */}
          <div className="px-6 py-5 border-b bg-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className={`text-xl font-bold ${c.profileColor}`}>{c.firstName[0]}{c.lastName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold">{c.firstName} {c.lastName}</h1>
                    <Badge className={`text-[10px] py-0 border ${STATUS_STYLES[c.status]}`}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</Badge>
                    {c.membershipTier && c.membershipStatus && (
                      <Badge className={`text-[10px] py-0 border ${MSHIP_STYLES[c.membershipStatus]}`}>{c.membershipTier}{c.membershipStatus === 'trial' ? ' (Trial)' : c.membershipStatus === 'past_due' ? ' (Past Due)' : c.membershipStatus === 'frozen' ? ' (Frozen)' : ''}</Badge>
                    )}
                    {!c.waiversCurrent && <Badge className="text-[10px] py-0 border bg-destructive/10 text-destructive border-destructive/20">Waiver Expired</Badge>}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{c.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{c.phone}</span>
                    {c.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{c.city}, {c.province}</span>}
                  </div>
                  {c.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {c.tags.map(t => <Badge key={t.name} className={`text-[10px] py-0 border ${tagStyle(t.name)}`}>{t.displayName}</Badge>)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-9 text-xs font-bold gap-1.5 btn-outline-modern"><Send className="h-3.5 w-3.5" />Message</Button>
                <Button size="sm" variant="outline" className="h-9 text-xs font-bold gap-1.5 btn-outline-modern"><CalendarDays className="h-3.5 w-3.5" />Book</Button>
                <Button size="sm" variant="outline" className="h-9 text-xs font-bold gap-1.5 btn-outline-modern"><Pencil className="h-3.5 w-3.5" />Edit</Button>
                <div className="relative">
                  <button onClick={() => setCustMoreMenu(!custMoreMenu)} className="h-9 w-9 rounded-md flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors btn-outline-modern">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {custMoreMenu && (
                    <div className="absolute right-0 top-11 w-56 rounded-lg border panel-glass z-50 py-1">
                      <button onClick={() => setCustMoreMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"><Archive className="h-3.5 w-3.5" />Archive Customer</button>
                      <button onClick={() => { setCustMoreMenu(false); setSuspendModalOpen(true); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"><Ban className="h-3.5 w-3.5" />Suspend Customer</button>
                      <div className="h-px bg-border mx-2 my-1" />
                      <button onClick={() => setCustMoreMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"><Users2 className="h-3.5 w-3.5" />Merge with Another <span className="text-[9px] ml-auto text-muted-foreground">Soon</span></button>
                      <div className="h-px bg-border mx-2 my-1" />
                      <button onClick={() => setCustMoreMenu(false)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-colors"><Trash2 className="h-3.5 w-3.5" />Delete Account Request</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Key metrics strip */}
            <div className="flex items-center gap-6 mt-4 pt-3 border-t">
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">LTV</span><p className="text-lg font-bold tabular-nums">${c.totalSpend.toLocaleString()}</p></div>
              <div className="h-8 w-px bg-border" />
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bookings</span><p className="text-lg font-bold tabular-nums">{c.totalBookings}</p></div>
              <div className="h-8 w-px bg-border" />
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Frequency</span><p className="text-lg font-bold tabular-nums">{c.bookingFrequency}</p></div>
              <div className="h-8 w-px bg-border" />
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Visit</span><p className="text-lg font-bold tabular-nums">{c.daysSinceLastVisit === 0 ? 'Today' : c.daysSinceLastVisit === 1 ? 'Yesterday' : `${c.daysSinceLastVisit} days ago`}</p></div>
              <div className="h-8 w-px bg-border" />
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Churn Risk</span>
                {c.churnRisk ? <Badge className={`text-[10px] py-0 border mt-0.5 ${CHURN_STYLES[c.churnRisk]}`}>{c.churnRisk.toUpperCase()}</Badge> : <p className="text-lg font-bold text-muted-foreground">—</p>}
              </div>
              {c.outstandingBalance > 0 && <><div className="h-8 w-px bg-border" /><div><span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Outstanding</span><p className="text-lg font-bold tabular-nums text-destructive">${c.outstandingBalance.toFixed(2)}</p></div></>}
              {c.accountCredit > 0 && <><div className="h-8 w-px bg-border" /><div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Credit</span><p className="text-lg font-bold tabular-nums text-success">${c.accountCredit.toFixed(2)}</p></div></>}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b bg-card px-6 flex items-end overflow-x-auto">
            {([
              { id: 'overview', label: 'Overview' }, { id: 'bookings', label: 'Bookings' }, { id: 'membership', label: 'Membership' },
              { id: 'financials', label: 'Financials' }, { id: 'communications', label: 'Comms' }, { id: 'tags', label: 'Tags' },
              { id: 'activity', label: 'Activity' }, { id: 'notes', label: 'Notes' }, { id: 'waivers', label: 'Waivers' },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setDetailTab(tab.id)}
                className={`px-3 pb-2.5 pt-3 text-[13px] font-semibold transition-colors border-b-2 whitespace-nowrap ${detailTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">

            {/* OVERVIEW TAB */}
            {detailTab === 'overview' && (
              <div className="grid grid-cols-3 gap-6">
                {/* Left column — 2/3 width */}
                <div className="col-span-2 space-y-6">
                  {/* Contact info */}
                  <Card className="card-elevated">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Contact Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-x-8 gap-y-3">
                      <CDR l="Email" v={c.email} /><CDR l="Phone" v={c.phone} />
                      {c.secondaryPhone && <CDR l="Secondary Phone" v={c.secondaryPhone} />}
                      {c.address && <CDR l="Address" v={`${c.address}, ${c.city}, ${c.province} ${c.postalCode}`} />}
                      {c.dob && <CDR l="Date of Birth" v={c.dob} />}
                      {c.gender && <CDR l="Gender" v={c.gender} />}
                      <CDR l="Source" v={c.source} /><CDR l="Customer Since" v={c.createdAt} />
                    </CardContent>
                  </Card>

                  {/* Emergency contact */}
                  {c.emergencyContact && (
                    <Card className="card-elevated">
                      <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Emergency Contact</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-3 gap-x-8 gap-y-3">
                        <CDR l="Name" v={c.emergencyContact} /><CDR l="Phone" v={c.emergencyPhone || '—'} /><CDR l="Relationship" v={c.emergencyRelation || '—'} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Membership */}
                  {c.membershipTier && (
                    <Card className="card-elevated">
                      <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Membership</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-3 gap-x-8 gap-y-3">
                        <CDR l="Tier" v={c.membershipTier} /><CDR l="Status" v={c.membershipStatus || '—'} /><CDR l="Since" v={c.membershipSince || '—'} />
                        <CDR l="Next Billing" v={c.nextBillingDate || '—'} /><CDR l="Price" v={c.membershipPrice ? `$${c.membershipPrice}/month` : '—'} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Active passes */}
                  {c.activePasses.length > 0 && (
                    <Card className="card-elevated">
                      <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Active Passes</CardTitle></CardHeader>
                      <CardContent>
                        {c.activePasses.map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div><p className="text-sm font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">Expires: {p.expiry}</p></div>
                            <Badge variant="outline" className="text-[10px] font-semibold">{p.remaining}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Household */}
                  <Card className="card-elevated">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold">Household</CardTitle>
                      {!c.household && <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 btn-outline-modern"><Plus className="h-3 w-3" />Create</Button>}
                    </CardHeader>
                    <CardContent>
                      {c.household ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Household</span><span className="text-sm font-semibold">{c.household}</span></div>
                          <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Role</span><Badge variant="outline" className="text-[10px] py-0">{c.householdRole === 'primary' ? 'Primary' : 'Member'}</Badge></div>
                          <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Billing</span><span className="text-sm font-semibold">Primary pays</span></div>
                          <Separator />
                          <div className="space-y-2">
                            {[
                              { name: `${c.firstName} ${c.lastName}`, role: c.householdRole || 'primary', color: c.profileColor },
                              { name: 'Emily Chen', role: 'member', color: 'bg-pink-100 text-pink-700' },
                              { name: 'Lucas Chen', role: 'minor', color: 'bg-sky-100 text-sky-700' },
                            ].map((m, mi) => (
                              <div key={mi} className="flex items-center gap-2.5">
                                <Avatar className="h-6 w-6"><AvatarFallback className={`text-[9px] font-bold ${m.color}`}>{m.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                <span className="text-xs font-semibold flex-1">{m.name}</span>
                                <Badge variant="outline" className="text-[9px] py-0">{m.role === 'primary' ? 'Primary' : m.role === 'minor' ? 'Minor' : 'Member'}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not part of a household.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right column — health sidebar */}
                <div className="space-y-6">
                  <Card className="card-elevated">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Health Metrics</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Lifetime Value</span><span className="text-sm font-bold tabular-nums">${c.totalSpend.toLocaleString()}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Total Bookings</span><span className="text-sm font-bold tabular-nums">{c.totalBookings}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Avg Booking Value</span><span className="text-sm font-bold tabular-nums">${c.avgBookingValue.toFixed(2)}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Booking Frequency</span><span className="text-sm font-bold tabular-nums">{c.bookingFrequency}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Days Since Last Visit</span><span className="text-sm font-bold tabular-nums">{c.daysSinceLastVisit}</span></div>
                      <Separator />
                      <div className="flex justify-between items-center"><span className="text-xs font-medium text-muted-foreground">Churn Risk</span>
                        {c.churnRisk ? <Badge className={`text-[10px] py-0 border ${CHURN_STYLES[c.churnRisk]}`}>{c.churnRisk.toUpperCase()}</Badge> : <span className="text-sm text-muted-foreground">—</span>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Preferences</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Preferred Sport</span><span className="text-sm font-semibold">{c.preferredSport}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Preferred Court</span><span className="text-sm font-semibold">{c.preferredCourt}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Preferred Time</span><span className="text-sm font-semibold">{c.preferredTime}</span></div>
                      <Separator />
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Skill Level</span><span className="text-sm font-semibold">3.5</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Play Style</span><span className="text-sm font-semibold">Competitive</span></div>
                      <p className="text-[10px] text-muted-foreground pt-1">Sport, court, and time auto-computed from booking history</p>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Referral</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center"><span className="text-xs font-medium text-muted-foreground">Referral Code</span><div className="flex items-center gap-1.5"><span className="text-xs font-bold font-mono bg-muted px-1.5 py-0.5 rounded">{c.firstName.toUpperCase()}{c.lastName[0]}2026</span><button className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button></div></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Referrals</span><span className="text-sm font-bold tabular-nums">{c.totalBookings > 30 ? 3 : c.totalBookings > 10 ? 1 : 0}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs font-medium text-muted-foreground">Earnings</span><span className="text-sm font-bold tabular-nums text-success">${c.totalBookings > 30 ? 45 : c.totalBookings > 10 ? 15 : 0}.00</span></div>
                    </CardContent>
                  </Card>

                  <Card className="card-elevated">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Waivers</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-muted-foreground">Status</span>
                        <Badge className={`text-[10px] py-0 border ${c.waiversCurrent ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                          {c.waiversCurrent ? 'Current' : 'Expired'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {detailTab === 'bookings' && (
              <Card className="card-elevated">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold">Booking History</CardTitle>
                  <Button size="sm" className="h-9 text-xs font-bold gap-1.5 btn-primary-modern"><Plus className="h-3.5 w-3.5" />Create Booking</Button>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead><tr className="border-b">
                      <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Date</th>
                      <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Time</th>
                      <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Court</th>
                      <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Sport</th>
                      <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Type</th>
                      <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                      <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-border/50">
                      {c.bookings.map(b => (
                        <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 text-sm">{b.date}</td>
                          <td className="py-2.5 text-sm text-muted-foreground">{b.time}</td>
                          <td className="py-2.5 text-sm">{b.court}</td>
                          <td className="py-2.5 text-sm text-muted-foreground">{b.sport}</td>
                          <td className="py-2.5 text-xs text-muted-foreground">{b.type}</td>
                          <td className="py-2.5 text-sm text-right tabular-nums">{b.amount > 0 ? `$${b.amount.toFixed(2)}` : '—'}</td>
                          <td className="py-2.5 text-right">
                            <Badge className={`text-[10px] py-0 border ${b.status === 'completed' ? 'bg-success/10 text-success border-success/20' : b.status === 'upcoming' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' : b.status === 'cancelled' ? 'bg-muted text-muted-foreground border-border' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                              {b.status === 'no-show' ? 'No-Show' : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {/* FINANCIALS TAB */}
            {detailTab === 'financials' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <Card className="card-elevated"><CardContent className="pt-4 pb-3"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Spend</p><p className="text-2xl font-bold tabular-nums mt-0.5">${c.totalSpend.toLocaleString()}</p></CardContent></Card>
                  <Card className="card-elevated"><CardContent className="pt-4 pb-3"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Outstanding</p><p className={`text-2xl font-bold tabular-nums mt-0.5 ${c.outstandingBalance > 0 ? 'text-destructive' : ''}`}>${c.outstandingBalance.toFixed(2)}</p></CardContent></Card>
                  <Card className="card-elevated"><CardContent className="pt-4 pb-3"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account Credit</p><p className={`text-2xl font-bold tabular-nums mt-0.5 ${c.accountCredit > 0 ? 'text-success' : ''}`}>${c.accountCredit.toFixed(2)}</p></CardContent></Card>
                  <Card className="card-elevated"><CardContent className="pt-4 pb-3"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Transaction</p><p className="text-2xl font-bold tabular-nums mt-0.5">${c.avgBookingValue.toFixed(2)}</p></CardContent></Card>
                </div>
                <Card className="card-elevated">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Transaction History</CardTitle></CardHeader>
                  <CardContent>
                    {c.transactions.length === 0 ? <p className="text-sm text-muted-foreground">No transactions recorded.</p> : (
                    <table className="w-full">
                      <thead><tr className="border-b">
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Date</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Description</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Type</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Method</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Status</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border/50">
                        {c.transactions.map(t => (
                          <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 text-sm">{t.date}</td>
                            <td className="py-2.5 text-sm">{t.description}</td>
                            <td className="py-2.5"><Badge variant="outline" className="text-[10px] py-0">{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</Badge></td>
                            <td className="py-2.5 text-sm text-muted-foreground">{t.method}</td>
                            <td className={`py-2.5 text-sm text-right tabular-nums font-semibold ${t.amount < 0 ? 'text-destructive' : ''}`}>{t.amount < 0 ? `−$${Math.abs(t.amount).toFixed(2)}` : `$${t.amount.toFixed(2)}`}</td>
                            <td className="py-2.5 text-right">
                              <Badge className={`text-[10px] py-0 border ${t.status === 'completed' ? 'bg-success/10 text-success border-success/20' : t.status === 'pending' ? 'bg-warning/10 text-warning-foreground border-warning/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>)}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAGS TAB */}
            {detailTab === 'tags' && (
              <div className="space-y-6">
                <Card className="card-elevated">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Active Tags</CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 btn-outline-modern"><Plus className="h-3 w-3" />Assign Tag</Button>
                  </CardHeader>
                  <CardContent>
                    {c.tags.length === 0 ? <p className="text-sm text-muted-foreground">No tags assigned.</p> : (
                    <div className="space-y-2">
                      {c.tags.map(t => (
                        <div key={t.name} className="flex items-center justify-between py-2.5 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <Badge className={`text-[10px] py-0.5 px-2.5 border ${tagStyle(t.name)}`}>{t.displayName}</Badge>
                            <Badge variant="outline" className="text-[9px] py-0 text-muted-foreground">{t.category}</Badge>
                          </div>
                          <button className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>)}
                  </CardContent>
                </Card>
                {c.tags.length > 0 && (
                  <Card className="card-elevated">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Effect Summary</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This customer&apos;s active tags provide:{' '}
                        {c.tags.some(t => t.name === 'founding-member') && <strong>15% off court bookings, </strong>}
                        {c.tags.some(t => t.name === 'gold-member') && <strong>14-day advance booking, prime time access, 2 guest passes/month, </strong>}
                        {c.tags.some(t => t.name === 'silver-member') && <strong>7-day advance booking, </strong>}
                        {c.tags.some(t => t.name === 'junior-athlete') && <strong>25% off courts, 50% off programs, </strong>}
                        {c.tags.some(t => t.name === 'senior-discount') && <strong>10% off all bookings, </strong>}
                        {c.tags.some(t => t.name === 'coach') && <strong>recurring booking allowed, 3-hour max, approval bypass, </strong>}
                        {c.tags.some(t => t.name === 'acme-corp') && <strong>corporate charge-to-account billing, </strong>}
                        {c.tags.some(t => t.name === 'win-back-20') && <strong>20% off (30-day promo), </strong>}
                        {c.tags.some(t => t.name === 'frequent-player') && <strong>loyalty recognition, </strong>}
                        {c.tags.some(t => t.name === 'lapsed') && <strong>win-back campaign eligible, </strong>}
                        {c.tags.some(t => t.name === 'no-show-flagged') && <strong>no-show review required, </strong>}
                        {c.tags.some(t => t.category === 'custom' && !['founding-member', 'gold-member', 'silver-member', 'junior-athlete', 'senior-discount', 'coach', 'acme-corp', 'win-back-20', 'frequent-player', 'lapsed', 'no-show-flagged'].includes(t.name)) && <strong>sport preference tracked.</strong>}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* MEMBERSHIP & PASSES TAB */}
            {detailTab === 'membership' && (
              <div className="space-y-6">
                <Card className="card-elevated">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Current Membership</CardTitle>
                    {!c.membershipTier && <Button size="sm" className="h-9 text-xs font-bold gap-1.5 btn-primary-modern"><Plus className="h-3.5 w-3.5" />Enroll</Button>}
                  </CardHeader>
                  <CardContent>
                    {c.membershipTier ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                          <CDR l="Tier" v={c.membershipTier} />
                          <div><span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</span><div className="mt-0.5"><Badge className={`text-[10px] py-0 border ${MSHIP_STYLES[c.membershipStatus || 'active']}`}>{c.membershipStatus === 'past_due' ? 'Past Due' : (c.membershipStatus || 'active').charAt(0).toUpperCase() + (c.membershipStatus || 'active').slice(1)}</Badge></div></div>
                          <CDR l="Since" v={c.membershipSince || 'Jan 1, 2026'} />
                          <CDR l="Billing" v="Monthly" />
                          <CDR l="Next Billing" v={c.nextBillingDate || 'Apr 1, 2026'} />
                          <CDR l="Price" v={c.membershipPrice ? `$${c.membershipPrice}/month` : '$99/month'} />
                        </div>
                        <Separator />
                        <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                          <CDR l="Included Hours" v="Unlimited" />
                          <CDR l="Auto-Renewal" v="On" />
                          <CDR l="Contract" v="No minimum" />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern">Upgrade</Button>
                          <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern">Downgrade</Button>
                          <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Snowflake className="h-3 w-3" />Freeze</Button>
                          <Button size="sm" variant="outline" className="h-8 text-[11px] font-bold border-destructive/30 text-destructive hover:bg-destructive/5 btn-outline-modern">Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No active membership.</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Passes</CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 btn-outline-modern"><Plus className="h-3 w-3" />Add Pass</Button>
                  </CardHeader>
                  <CardContent>
                    {c.activePasses.length > 0 ? (
                      <div className="space-y-0">
                        {c.activePasses.map((p, i) => (
                          <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                            <div>
                              <p className="text-sm font-semibold">{p.name}</p>
                              <p className="text-xs text-muted-foreground">Expires: {p.expiry}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-bold">{p.remaining}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No active passes.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {detailTab === 'activity' && (
              <Card className="card-elevated">
                <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Activity Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {c.activities.map((a, i) => (
                      <div key={a.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                        <div className="flex flex-col items-center mt-0.5">
                          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${ACTIVITY_ICONS[a.type] || 'bg-muted-foreground'}`} />
                          {i < c.activities.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{a.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground">{a.date} at {a.time}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">{a.actor}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* COMMUNICATIONS TAB */}
            {detailTab === 'communications' && (
              <div className="space-y-6">
                <Card className="card-elevated">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Consent & Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-6">
                    <div className="flex items-center gap-2"><span className="text-xs font-medium text-muted-foreground">Marketing</span><Badge className="text-[10px] py-0 border bg-success/10 text-success border-success/20">Opted In</Badge></div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2"><span className="text-xs font-medium text-muted-foreground">CASL Consent</span><span className="text-xs font-semibold">Renewed Mar 1, 2026</span></div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2"><span className="text-xs font-medium text-muted-foreground">Expires</span><span className="text-xs font-semibold">Mar 1, 2028</span></div>
                  </CardContent>
                </Card>

                <Card className="card-elevated">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Message History</CardTitle>
                    <Button size="sm" className="h-9 text-xs font-bold gap-1.5 btn-primary-modern"><Send className="h-3.5 w-3.5" />Send Message</Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-0">
                      {[
                        { date: 'Mar 22, 2026', time: '2:15 PM', channel: 'email', subject: 'Booking Confirmation — Court 2, Mar 22', status: 'delivered' },
                        { date: 'Mar 20, 2026', time: '6:00 PM', channel: 'sms', subject: 'Reminder: Court 1 booking tomorrow at 8:00 AM', status: 'delivered' },
                        { date: 'Mar 18, 2026', time: '10:00 AM', channel: 'email', subject: 'Payment Receipt — $67.50', status: 'opened' },
                        { date: 'Mar 15, 2026', time: '9:00 AM', channel: 'email', subject: 'Weekend Special: 20% off prime time slots', status: 'opened' },
                        { date: 'Mar 10, 2026', time: '3:30 PM', channel: 'sms', subject: 'Your booking has been confirmed — Court 3', status: 'delivered' },
                        { date: 'Mar 5, 2026', time: '11:00 AM', channel: 'email', subject: 'Welcome to Kings Court Markham!', status: 'opened' },
                      ].map((msg, mi) => (
                        <div key={mi} className="flex items-center gap-3 py-3 border-b last:border-0">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${msg.channel === 'email' ? 'bg-info/10' : 'bg-primary/10'}`}>
                            {msg.channel === 'email' ? <Mail className="h-3.5 w-3.5 text-info" /> : <MessageCircle className="h-3.5 w-3.5 text-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{msg.subject}</p>
                            <p className="text-[10px] text-muted-foreground">{msg.date} at {msg.time}</p>
                          </div>
                          <Badge variant="outline" className={`text-[9px] font-semibold ${msg.status === 'opened' ? 'bg-success/10 text-success border-success/20' : ''}`}>{msg.status === 'opened' ? 'Opened' : 'Delivered'}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* NOTES TAB */}
            {detailTab === 'notes' && (
              <Card className="card-elevated">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-bold">Notes</CardTitle>
                    <div className="flex items-center border border-border rounded-md overflow-hidden">
                      {['all', 'general', 'call_log', 'complaint', 'follow_up'].map((nt, nti) => (
                        <button key={nt} onClick={() => setNoteTypeFilter(nt)}
                          className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${nti > 0 ? 'border-l border-border' : ''}
                            ${noteTypeFilter === nt ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
                          {nt === 'all' ? 'All' : nt === 'call_log' ? 'Call' : nt === 'follow_up' ? 'Follow-Up' : nt.charAt(0).toUpperCase() + nt.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 btn-outline-modern"><Plus className="h-3 w-3" />Add Note</Button>
                </CardHeader>
                <CardContent>
                  {c.notes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No notes yet. Add a note to track interactions with this customer.</p>
                  ) : (
                    <div className="space-y-0">
                      {c.notes.filter(n => noteTypeFilter === 'all' || n.type === noteTypeFilter).map((n, i) => (
                        <div key={i} className="py-3 border-b last:border-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold">{n.author}</span>
                            <span className="text-[10px] text-muted-foreground">{n.date}</span>
                            <Badge variant="outline" className="text-[9px] py-0 font-semibold">{n.type === 'call_log' ? 'Call Log' : n.type === 'follow_up' ? 'Follow-Up' : n.type.charAt(0).toUpperCase() + n.type.slice(1)}</Badge>
                          </div>
                          <p className="text-sm text-foreground/80">{n.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* WAIVERS TAB */}
            {detailTab === 'waivers' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className={`text-[10px] py-0.5 px-2.5 border font-bold ${c.waiversCurrent ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                    {c.waiversCurrent ? '2 of 2 waivers current' : '1 of 2 waivers current'}
                  </Badge>
                </div>
                <Card className="card-elevated">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Required Waivers</CardTitle></CardHeader>
                  <CardContent>
                    <table className="w-full">
                      <thead><tr className="border-b">
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Waiver</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Status</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Signed</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Expires</th>
                        <th className="pb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right">Action</th>
                      </tr></thead>
                      <tbody className="divide-y divide-border/50">
                        {[
                          { name: 'Liability Waiver', status: c.waiversCurrent ? 'signed' : 'expired', signed: 'Jan 15, 2026', expires: c.waiversCurrent ? 'Jan 15, 2027' : 'Mar 15, 2026' },
                          { name: 'Photo/Video Consent', status: 'signed', signed: 'Jan 15, 2026', expires: 'Jan 15, 2027' },
                          ...(!c.waiversCurrent ? [{ name: 'Minor Participation Consent', status: 'not_signed' as const, signed: '—', expires: '—' }] : []),
                        ].map((w, wi) => (
                          <tr key={wi} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3 text-sm font-semibold">{w.name}</td>
                            <td className="py-3">
                              <Badge className={`text-[10px] py-0 border ${w.status === 'signed' ? 'bg-success/10 text-success border-success/20' : w.status === 'expired' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-muted-foreground border-border'}`}>
                                {w.status === 'signed' ? 'Signed' : w.status === 'expired' ? 'Expired' : 'Not Signed'}
                              </Badge>
                            </td>
                            <td className="py-3 text-sm text-muted-foreground">{w.signed}</td>
                            <td className="py-3 text-sm text-muted-foreground">{w.expires}</td>
                            <td className="py-3 text-right">
                              {w.status === 'signed' && <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern">View</Button>}
                              {w.status === 'expired' && <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-destructive border-destructive/30 btn-outline-modern">Re-sign</Button>}
                              {w.status === 'not_signed' && <Button size="sm" className="h-7 text-[10px] font-bold btn-primary-modern">Send for Signature</Button>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            )}

          </div>
        </div>
        {/* Suspend Modal */}
        {suspendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSuspendModalOpen(false)}>
            <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
            <div className="relative bg-card rounded-xl shadow-2xl w-[440px] p-6 space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                  <Ban className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Suspend {c.firstName} {c.lastName}?</h3>
                  <p className="text-sm text-muted-foreground">This will immediately block all bookings and facility access.</p>
                </div>
              </div>

              <div className="bg-warning/5 border border-warning/15 rounded-md p-3 space-y-1.5">
                <p className="text-sm font-semibold text-warning-foreground">{c.totalBookings > 10 ? '3 upcoming bookings will be cancelled and customers notified.' : '1 upcoming booking will be cancelled.'}</p>
                <ul className="text-xs text-muted-foreground space-y-0.5 ml-4 list-disc">
                  <li>All future bookings will be cancelled with full refund</li>
                  <li>Recurring booking templates will be paused (not deleted)</li>
                  <li>Active membership billing will be frozen</li>
                  <li>Customer will be unable to log in or book</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1 h-9 text-[12px] font-bold btn-outline-modern" onClick={() => setSuspendModalOpen(false)}>Cancel</Button>
                <Button className="flex-1 h-9 text-[12px] font-bold bg-warning hover:bg-warning/90 text-warning-foreground" onClick={() => setSuspendModalOpen(false)}>
                  Suspend Customer
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ---- LIST VIEW ----
  return (
    <>
      {/* Toolbar: search + filters + actions */}
      <div className="shrink-0 border-b bg-card px-3 md:px-6 py-2 md:py-0 md:h-12 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-md border border-border bg-background text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 px-2 md:px-3 text-xs font-semibold text-muted-foreground select-modern hidden md:block">
            <option value="all">All Statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
          </select>
          <select value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)} className="h-8 px-2 md:px-3 text-xs font-semibold text-muted-foreground select-modern hidden md:block">
            <option value="all">All Memberships</option><option value="Gold">Gold</option><option value="Silver">Silver</option><option value="none">No Membership</option>
          </select>
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="h-8 px-2 md:px-3 text-xs font-semibold text-muted-foreground select-modern hidden lg:block">
            <option value="all">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
          </select>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="h-8 px-2 md:px-3 text-xs font-semibold text-muted-foreground select-modern hidden lg:block">
            <option value="all">All Risk Levels</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
          </select>
        </div>
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{selectedIds.size} selected</span>
            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 btn-outline-modern"><Tag className="h-3 w-3" />Assign Tag</Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 btn-outline-modern"><Send className="h-3 w-3" />Message</Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 btn-outline-modern"><Download className="h-3 w-3" />Export</Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold gap-1 btn-outline-modern"><Ban className="h-3 w-3" />Status</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-semibold">{filtered.length} total</Badge>
            <Button size="sm" variant="outline" className="h-8 text-xs font-bold gap-1.5 btn-outline-modern"><Download className="h-3.5 w-3.5" />Export</Button>
            <Button size="sm" className="h-8 text-xs font-bold gap-1.5 btn-primary-modern"><UserPlus className="h-3.5 w-3.5" />Add Customer</Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-card z-10">
            <tr className="border-b">
              <th className="w-10 px-4 py-2.5"><Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} /></th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <span className="flex items-center gap-1">Name <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Contact</th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Status</th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Membership</th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Tags</th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right cursor-pointer select-none" onClick={() => toggleSort('totalBookings')}>
                <span className="flex items-center justify-end gap-1">Bookings <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right cursor-pointer select-none" onClick={() => toggleSort('totalSpend')}>
                <span className="flex items-center justify-end gap-1">LTV <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left cursor-pointer select-none" onClick={() => toggleSort('daysSinceLastVisit')}>
                <span className="flex items-center gap-1">Last Visit <ArrowUpDown className="h-3 w-3" /></span>
              </th>
              <th className="py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">Risk</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-muted/30 cursor-pointer transition-colors group" onClick={() => setViewingCustomer(c)}>
                <td className="px-4 py-2.5" onClick={e => { e.stopPropagation(); toggleSelect(c.id); }}>
                  <Checkbox checked={selectedIds.has(c.id)} />
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={`text-xs font-bold ${c.profileColor}`}>{c.firstName[0]}{c.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{c.firstName} {c.lastName}</p>
                      <p className="text-[10px] text-muted-foreground">{c.source} · {c.createdAt}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5">
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                  <p className="text-[10px] text-muted-foreground">{c.phone}</p>
                </td>
                <td className="py-2.5"><Badge className={`text-[10px] py-0 border ${STATUS_STYLES[c.status]}`}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</Badge></td>
                <td className="py-2.5">
                  {c.membershipTier ? (
                    <div>
                      <span className="text-xs font-semibold">{c.membershipTier}</span>
                      {c.membershipStatus && c.membershipStatus !== 'active' && <Badge className={`text-[9px] py-0 border ml-1.5 ${MSHIP_STYLES[c.membershipStatus]}`}>{c.membershipStatus === 'past_due' ? 'Past Due' : c.membershipStatus.charAt(0).toUpperCase() + c.membershipStatus.slice(1)}</Badge>}
                    </div>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
                    {c.tags.slice(0, 2).map(t => <Badge key={t.name} className={`text-[9px] py-0 border ${tagStyle(t.name)}`}>{t.displayName}</Badge>)}
                    {c.tags.length > 2 && <Badge variant="outline" className="text-[9px] py-0">+{c.tags.length - 2}</Badge>}
                    {c.tags.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                  </div>
                </td>
                <td className="py-2.5 text-right"><span className="text-sm tabular-nums font-medium">{c.totalBookings}</span></td>
                <td className="py-2.5 text-right"><span className="text-sm tabular-nums font-medium">${c.totalSpend.toLocaleString()}</span></td>
                <td className="py-2.5"><span className="text-xs text-muted-foreground">{c.daysSinceLastVisit === 0 ? 'Today' : c.daysSinceLastVisit === 1 ? 'Yesterday' : `${c.daysSinceLastVisit}d ago`}</span></td>
                <td className="py-2.5">
                  {c.churnRisk ? <Badge className={`text-[9px] py-0 border ${CHURN_STYLES[c.churnRisk]}`}>{c.churnRisk.toUpperCase()}</Badge> : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="py-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CDR({ l, v }: { l: string; v: string }) {
  return <div><span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{l}</span><p className="text-sm font-medium mt-0.5">{v}</p></div>;
}

// ============================================================
// SMALL COMPONENTS
// ============================================================
function MCard({ title, value, change, positive }: { title: string; value: string; change: string; positive?: boolean }) {
  return <Card className="card-elevated"><CardContent className="pt-4 pb-3"><p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{title}</p><p className="text-2xl font-bold tracking-tight tabular-nums mt-1">{value}</p><p className={`text-xs font-semibold mt-0.5 ${positive ? 'text-success' : 'text-destructive'}`}>{change}</p></CardContent></Card>;
}
function AItem({ s, t }: { s: 'high' | 'medium' | 'info'; t: string }) {
  const cs = { high: 'bg-destructive/10 text-destructive border-destructive/20', medium: 'bg-warning/10 text-warning-foreground border-warning/20', info: 'bg-info/10 text-info border-info/20' };
  const ds = { high: 'bg-destructive', medium: 'bg-warning', info: 'bg-info' };
  return <div className={`flex items-center gap-3 px-3 py-2 rounded-md border ${cs[s]}`}><div className={`h-2 w-2 rounded-full shrink-0 ${ds[s]}`} /><span className="text-sm">{t}</span></div>;
}
function DRow({ l, v, hl }: { l: string; v: string; hl?: string }) {
  const c = hl === 'primary' ? 'text-primary' : hl === 'success' ? 'text-success' : hl === 'warning' ? 'text-warning' : '';
  return <div className="flex justify-between items-baseline py-2.5"><span className="text-sm text-muted-foreground">{l}</span><span className={`text-base font-semibold tabular-nums ${c}`}>{v}</span></div>;
}
function URow({ time, name, court, type, status }: { time: string; name: string; court: string; type: string; status: string }) {
  return <div className="flex items-center justify-between py-2.5"><div className="flex items-center gap-3"><span className="text-xs font-medium text-muted-foreground w-16">{time}</span><span className="text-sm font-medium">{name}</span><span className="text-xs text-muted-foreground">{court} · {type}</span></div>
    {status === 'unpaid' && <Badge className="bg-warning/15 text-warning border border-warning/30 text-[10px] py-0">UNPAID</Badge>}{status === 'paid' && <span className="text-xs text-muted-foreground opacity-40">✓</span>}</div>;
}

function BBlock({ b, cn, vsh, sh, sel, ms, onClick }: { b: Booking; cn: string; vsh: number; sh: number; sel: boolean; ms?: boolean; onClick: () => void }) {
  function accentColor(p: PaymentStatus) {
    switch (p) {
      case 'paid': return 'bg-primary';
      case 'unpaid': return 'bg-destructive';
      case 'pending': return 'bg-warning';
      case 'comp': return 'bg-foreground/25';
    }
  }
  function borderColor(p: PaymentStatus) {
    switch (p) {
      case 'paid': return 'border-primary/40';
      case 'unpaid': return 'border-destructive/40';
      case 'pending': return 'border-warning/40';
      case 'comp': return 'border-foreground/15';
    }
  }
  function borderColorSel(p: PaymentStatus) {
    switch (p) {
      case 'paid': return 'border-primary';
      case 'unpaid': return 'border-destructive';
      case 'pending': return 'border-warning';
      case 'comp': return 'border-foreground/30';
    }
  }
  const isMaint = b.type === 'maintenance';
  const SLOT_HEIGHT = sh;
  const top = b.startSlot * SLOT_HEIGHT; const h = b.duration * SLOT_HEIGHT;
  const cp = h < 20; const md = h >= 20 && h < 36;
  const tr = slotRng(b.startSlot, b.duration, vsh); const mins = b.duration * 30;
  const dur = mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? `${mins % 60}m` : ''}` : `${mins}m`;
  const sportLabel = ms && b.sport ? b.sport : null;
  const typeLabel = typeLabels[b.type];
  return (
    <div onClick={onClick}
      className={`absolute left-px right-px rounded-[2px] transition-all cursor-pointer overflow-hidden z-10 group/block
        ${isMaint
          ? `bg-[oklch(0.90_0.006_220)] border-[oklch(0.65_0.015_220)] hover:bg-[oklch(0.87_0.006_220)] text-muted-foreground border`
          : `bg-card hover:shadow-sm text-foreground ${sel ? `border-2 ${borderColorSel(b.payment)}` : `border ${borderColor(b.payment)}`}`
        }`}
      style={{ top, height: h }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor(b.payment)}`} />
      <div className={`pl-3 pr-1 h-full ${cp || md ? 'flex items-center gap-1 py-0' : 'py-1'}`}>
        {cp ? (
          <span className="text-[10px] font-bold truncate">{b.name}</span>
        ) : md ? (
          <>
            <span className="text-xs font-bold truncate">{b.name}</span>
            {sportLabel && <span className="text-[9px] text-muted-foreground shrink-0">{sportLabel}</span>}
            {b.payment === 'unpaid' && <span className="text-[8px] font-bold text-destructive shrink-0">UNPAID</span>}
            {b.payment === 'pending' && <span className="text-[8px] font-bold text-warning shrink-0">PENDING</span>}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[13px] font-bold truncate">{b.name}</span>
              {sportLabel && <span className="text-[9px] text-muted-foreground border border-border rounded px-0.5 shrink-0">{sportLabel}</span>}
              {b.payment === 'unpaid' && <span className="text-[8px] font-bold text-destructive shrink-0">UNPAID</span>}
              {b.payment === 'pending' && <span className="text-[8px] font-bold text-warning shrink-0">PENDING</span>}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-tight group-hover/block:hidden">{dur}</p>
            <p className="text-[10px] text-muted-foreground leading-tight hidden group-hover/block:block font-semibold">{tr}</p>
          </>
        )}
      </div>
    </div>
  );
}

function DetailPanel({ b, cn, vsh, onClose }: { b: Booking; cn: string; vsh: number; onClose: () => void }) {
  const tr = slotRng(b.startSlot, b.duration, vsh);
  const mins = b.duration * 30;
  const dur = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`.trim() : `${mins} min`;
  const payStyles: Record<PaymentStatus, string> = {
    paid: 'bg-primary/10 text-primary border-primary/25',
    unpaid: 'bg-destructive/10 text-destructive border-destructive/25',
    pending: 'bg-warning/10 text-warning border-warning/25',
    comp: 'bg-muted text-muted-foreground border-border',
  };
  const payLabels: Record<PaymentStatus, string> = { paid: 'Paid', unpaid: 'Unpaid', pending: 'Pending', comp: 'Comp' };
  const amount = b.payment === 'comp' ? '—' : `$${(b.duration * 15 + (b.type === 'member' ? -5 : 0)).toFixed(2)}`;
  const isIndividual = ['standard', 'member', 'recurring'].includes(b.type);
  const linkLabel = isIndividual ? 'View Profile' : b.type === 'league' ? 'League Details' : b.type === 'program' ? 'Program Details' : b.type === 'openplay' ? 'View Attendees' : b.type === 'event' ? 'Event Details' : null;

  // Booking type color bar
  const isMaint = b.type === 'maintenance';
  const isCustomer = ['standard', 'member', 'recurring'].includes(b.type);
  const accentBarColor = isMaint ? 'bg-foreground/40' : isCustomer ? 'bg-primary' : 'bg-info';

  // Mock customer context for at-a-glance info
  const custContext = isIndividual ? {
    initials: b.name.split(' ').map(n => n[0]).join('').slice(0, 2),
    membershipTier: b.type === 'member' ? 'Gold' : null,
    totalBookings: Math.floor(Math.random() * 40) + 5,
    tags: b.type === 'member' ? ['Member'] : b.source === 'Walk-in' ? ['Walk-in'] : [],
  } : null;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Booking type color bar */}
      <div className={`h-1 ${accentBarColor} shrink-0`} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 h-11 border-b shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-bold text-foreground">Booking Details</h3>
          <span className="text-[10px] font-medium text-muted-foreground font-mono">#{b.id.padStart(4, '0')}</span>
        </div>
        <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Identity with avatar */}
        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            {custContext ? (
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${b.type === 'member' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <span className="text-sm font-bold">{custContext.initials}</span>
              </div>
            ) : (
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isMaint ? 'bg-foreground/10' : 'bg-info/15 text-info'}`}>
                {isMaint ? <Wrench className="h-4 w-4 text-muted-foreground" /> : <Users className="h-4 w-4" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-[17px] font-bold leading-snug tracking-tight">{b.name}</h4>
              {linkLabel && (
                <button className="text-[11px] text-primary font-semibold hover:underline mt-0.5 inline-block">{linkLabel} →</button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <Badge variant="outline" className="text-[10px] py-0.5 px-2 font-semibold rounded-[3px]">{typeLabels[b.type]}</Badge>
            <Badge className={`text-[10px] py-0.5 px-2 border font-semibold rounded-[3px] ${payStyles[b.payment]}`}>{payLabels[b.payment]}</Badge>
            {b.checkedIn !== undefined && (
              <Badge className={`text-[10px] py-0.5 px-2 border font-semibold rounded-[3px] ${b.checkedIn ? 'bg-primary/10 text-primary border-primary/25' : 'bg-muted text-muted-foreground border-border'}`}>
                {b.checkedIn ? '✓ Checked In' : 'Not Checked In'}
              </Badge>
            )}
          </div>
        </div>

        <div className="h-px bg-border mx-5" />

        {/* At-a-glance customer context */}
        {custContext && (
          <>
            <div className="px-5 py-3 flex items-center gap-4">
              {custContext.membershipTier && (
                <div className="flex items-center gap-1.5"><span className="text-[10px] font-medium text-muted-foreground">Membership</span><Badge className="text-[9px] py-0 border bg-success/10 text-success border-success/20">{custContext.membershipTier}</Badge></div>
              )}
              <div className="flex items-center gap-1.5"><span className="text-[10px] font-medium text-muted-foreground">Visits</span><span className="text-xs font-bold tabular-nums">{custContext.totalBookings}</span></div>
              {custContext.tags.length > 0 && custContext.tags.map(t => <Badge key={t} variant="outline" className="text-[9px] py-0 font-semibold">{t}</Badge>)}
            </div>
            <div className="h-px bg-border mx-5" />
          </>
        )}

        {/* Booking info */}
        <div className="px-5 py-4 space-y-2.5">
          <DR l="Time" v={tr} />
          <DR l="Duration" v={dur} />
          <DR l="Court" v={cn} />
          <DR l="Amount" v={amount} />
          {b.source && <DR l="Source" v={b.source} />}
          {b.sport && <DR l="Sport" v={b.sport} />}
        </div>

        {/* Waiver + Check-in status */}
        {b.type !== 'maintenance' && (
          <>
            <div className="h-px bg-border mx-5" />
            <div className="px-5 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-muted-foreground">Check-in</span>
                {b.checkedIn ? (
                  <span className="text-[12px] font-bold text-primary flex items-center gap-1">✓ Checked In</span>
                ) : (
                  <span className="text-[12px] font-bold text-muted-foreground flex items-center gap-1">Not yet — <button className="text-primary hover:underline ml-0.5">Check in</button></span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-medium text-muted-foreground">Waiver</span>
                {b.checkedIn ? (
                  <span className="text-[12px] font-bold text-primary flex items-center gap-1">✓ Signed</span>
                ) : (
                  <span className="text-[12px] font-bold text-warning flex items-center gap-1">⚠ Required</span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Contact */}
        {(b.phone || b.email) && (
          <>
            <div className="h-px bg-border mx-5" />
            <div className="px-5 py-4 space-y-2.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
              {b.phone && <DR l="Phone" v={b.phone} />}
              {b.email && <DR l="Email" v={b.email} />}
            </div>
          </>
        )}

        {/* Players */}
        {b.players && b.players.length > 0 && (
          <>
            <div className="h-px bg-border mx-5" />
            <div className="px-5 py-4 space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Players ({b.players.length})</p>
              {b.players.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center"><span className="text-[8px] font-bold text-muted-foreground">{p.split(' ').map(n => n[0]).join('')}</span></div>
                  <span className="text-[13px] text-foreground">{p}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Notes */}
        {b.notes && (
          <>
            <div className="h-px bg-border mx-5" />
            <div className="px-5 py-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Notes</p>
              <p className="text-[13px] leading-relaxed text-foreground/80">{b.notes}</p>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="border-t px-5 py-4 shrink-0">
        {/* Primary action — positive actions use teal, not red */}
        {b.payment === 'unpaid' && (
          <Button className="w-full h-9 text-[13px] font-bold mb-2 btn-primary-modern">Mark as Paid</Button>
        )}
        {b.checkedIn === false && b.payment === 'paid' && (
          <Button className="w-full h-9 text-[13px] font-bold mb-2 btn-primary-modern">Check In</Button>
        )}

        <Button className="w-full h-9 text-[12px] font-bold btn-outline-modern" variant="outline">Edit Booking</Button>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <Button className="h-9 text-[12px] font-bold btn-outline-modern" variant="outline">Extend</Button>
          <Button className="h-9 text-[12px] font-bold btn-outline-modern" variant="outline">Reschedule</Button>
          <Button className="h-9 text-[12px] font-bold border-destructive/30 text-destructive hover:bg-destructive/5 btn-outline-modern" variant="outline">Cancel</Button>
        </div>

        {b.checkedIn === false && (
          <Button className="w-full h-9 text-[12px] font-bold text-muted-foreground mt-2 btn-outline-modern" variant="outline">No-show</Button>
        )}
      </div>
    </div>
  );
}
function DR({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[12px] font-medium text-muted-foreground">{l}</span>
      <span className="text-[13px] font-bold text-foreground">{v}</span>
    </div>
  );
}
function LegendItem({ bgColor, borderColor, accentColor, label }: { bgColor: string; borderColor: string; accentColor: string; label: string }) {
  return <div className="flex items-center gap-1.5"><div className={`h-3.5 w-6 rounded-[2px] border ${bgColor} ${borderColor} relative overflow-hidden`}><div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`} /></div><span className="text-[11px] text-muted-foreground font-medium">{label}</span></div>;
}

// ============================================================
// CUSTOMERS — TYPES & DATA
// ============================================================
type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'archived';
type ChurnRisk = 'low' | 'medium' | 'high' | null;
type MembershipStatus = 'active' | 'trial' | 'past_due' | 'frozen' | 'cancelled' | null;

interface CustomerTag {
  name: string;
  displayName: string;
  color: string;
  category: 'pricing' | 'access' | 'membership' | 'corporate' | 'behavioral' | 'custom';
}

interface CustomerBooking {
  id: string;
  date: string;
  time: string;
  court: string;
  sport: string;
  type: string;
  duration: string;
  amount: number;
  status: 'completed' | 'upcoming' | 'cancelled' | 'no-show';
  paymentStatus: 'paid' | 'unpaid' | 'pending' | 'refunded' | 'comp';
}

interface CustomerTransaction {
  id: string;
  date: string;
  description: string;
  type: 'payment' | 'refund' | 'credit' | 'invoice';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface CustomerActivity {
  id: string;
  date: string;
  time: string;
  type: 'booking' | 'payment' | 'membership' | 'tag' | 'checkin' | 'communication' | 'note' | 'profile';
  description: string;
  actor: string;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  status: CustomerStatus;
  profileColor: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  dob?: string;
  gender?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  source: string;
  createdAt: string;
  lastActivity: string;
  // membership
  membershipTier: string | null;
  membershipStatus: MembershipStatus;
  membershipSince?: string;
  nextBillingDate?: string;
  membershipPrice?: number;
  // passes
  activePasses: { name: string; remaining: string; expiry: string }[];
  // tags
  tags: CustomerTag[];
  // health
  totalBookings: number;
  totalSpend: number;
  avgBookingValue: number;
  bookingFrequency: string;
  daysSinceLastVisit: number;
  churnRisk: ChurnRisk;
  preferredSport: string;
  preferredCourt: string;
  preferredTime: string;
  // household
  household?: string;
  householdRole?: 'primary' | 'member';
  // waivers
  waiversCurrent: boolean;
  // CRM
  outstandingBalance: number;
  accountCredit: number;
  // notes
  notes: { date: string; author: string; type: string; text: string }[];
  // bookings
  bookings: CustomerBooking[];
  // transactions
  transactions: CustomerTransaction[];
  // activity
  activities: CustomerActivity[];
}

const TAG_COLORS: Record<string, string> = {
  'founding-member': 'bg-primary/15 text-primary border-primary/25',
  'gold-member': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  'silver-member': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
  'junior-athlete': 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
  'senior-discount': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
  'coach': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  'acme-corp': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  'frequent-player': 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  'high-value': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  'lapsed': 'bg-destructive/10 text-destructive border-destructive/20',
  'pickleball': 'bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-700',
  'no-show-flagged': 'bg-destructive/10 text-destructive border-destructive/20',
  'win-back-20': 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
  'comp-access': 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
};
function tagStyle(name: string) { return TAG_COLORS[name] || 'bg-muted text-muted-foreground border-border'; }

const AVATAR_COLORS = ['bg-primary/15 text-primary', 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'];

function buildCustomers(): Customer[] {
  const customers: Customer[] = [
    {
      id: 'C001', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@email.com', phone: '+1 (647) 555-1234', status: 'active', profileColor: AVATAR_COLORS[0],
      source: 'Online', createdAt: 'Jan 15, 2025', lastActivity: 'Mar 20, 2026', address: '45 King St W', city: 'Markham', province: 'ON', postalCode: 'L3P 1A1', dob: 'Apr 12, 1990', gender: 'Female',
      emergencyContact: 'John Doe', emergencyPhone: '+1 (647) 555-1235', emergencyRelation: 'Spouse',
      membershipTier: 'Gold', membershipStatus: 'active', membershipSince: 'Mar 1, 2025', nextBillingDate: 'Apr 1, 2026', membershipPrice: 99,
      activePasses: [{ name: '10-Visit Pass', remaining: '7 of 10', expiry: 'Jun 30, 2026' }],
      tags: [
        { name: 'founding-member', displayName: 'Founding Member', color: 'primary', category: 'pricing' },
        { name: 'gold-member', displayName: 'Gold Member', color: 'amber', category: 'membership' },
        { name: 'pickleball', displayName: 'Pickleball', color: 'lime', category: 'custom' },
      ],
      totalBookings: 142, totalSpend: 8450, avgBookingValue: 59.51, bookingFrequency: '1.8/week', daysSinceLastVisit: 1, churnRisk: 'low',
      preferredSport: 'Pickleball', preferredCourt: 'Court 1', preferredTime: 'Evenings (6–9 PM)',
      household: 'Doe Family', householdRole: 'primary', waiversCurrent: true, outstandingBalance: 0, accountCredit: 45.00,
      notes: [
        { date: 'Mar 18, 2026', author: 'Sarah M.', type: 'general', text: 'Interested in joining the spring pickleball league. Follow up when registration opens.' },
        { date: 'Feb 2, 2026', author: 'System', type: 'follow_up', text: 'Membership renewed successfully. Gold tier, $99/month.' },
      ],
      bookings: [
        { id: 'B001', date: 'Mar 20, 2026', time: '8:00 AM – 9:00 AM', court: 'Court 1', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'completed', paymentStatus: 'paid' },
        { id: 'B002', date: 'Mar 22, 2026', time: '7:00 PM – 8:30 PM', court: 'Court 2', sport: 'Pickleball', type: 'Standard', duration: '90 min', amount: 67.50, status: 'upcoming', paymentStatus: 'paid' },
        { id: 'B003', date: 'Mar 17, 2026', time: '6:00 PM – 7:00 PM', court: 'Court 1', sport: 'Pickleball', type: 'Recurring', duration: '60 min', amount: 45, status: 'completed', paymentStatus: 'paid' },
        { id: 'B004', date: 'Mar 14, 2026', time: '7:00 PM – 8:00 PM', court: 'Court 3', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'completed', paymentStatus: 'paid' },
        { id: 'B005', date: 'Mar 10, 2026', time: '8:00 AM – 9:30 AM', court: 'Court 1', sport: 'Pickleball', type: 'Standard', duration: '90 min', amount: 67.50, status: 'completed', paymentStatus: 'paid' },
        { id: 'B006', date: 'Feb 28, 2026', time: '6:00 PM – 7:00 PM', court: 'Court 2', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'cancelled', paymentStatus: 'refunded' },
      ],
      transactions: [
        { id: 'T001', date: 'Mar 20, 2026', description: 'Court 1 — Pickleball', type: 'payment', amount: 45, method: 'Visa •4242', status: 'completed', reference: 'B001' },
        { id: 'T002', date: 'Mar 22, 2026', description: 'Court 2 — Pickleball', type: 'payment', amount: 67.50, method: 'Visa •4242', status: 'completed', reference: 'B002' },
        { id: 'T003', date: 'Mar 1, 2026', description: 'Gold Membership — March', type: 'payment', amount: 99, method: 'Visa •4242', status: 'completed' },
        { id: 'T004', date: 'Feb 28, 2026', description: 'Cancellation refund — Court 2', type: 'refund', amount: -45, method: 'Account Credit', status: 'completed', reference: 'B006' },
        { id: 'T005', date: 'Feb 1, 2026', description: 'Gold Membership — February', type: 'payment', amount: 99, method: 'Visa •4242', status: 'completed' },
        { id: 'T006', date: 'Jan 20, 2026', description: '10-Visit Pass', type: 'payment', amount: 350, method: 'Visa •4242', status: 'completed' },
      ],
      activities: [
        { id: 'A001', date: 'Mar 20', time: '9:02 AM', type: 'checkin', description: 'Checked in — Court 1, Pickleball', actor: 'System' },
        { id: 'A002', date: 'Mar 20', time: '8:00 AM', type: 'booking', description: 'Booking completed — Court 1, 8:00–9:00 AM', actor: 'Jane Doe' },
        { id: 'A003', date: 'Mar 18', time: '3:15 PM', type: 'note', description: 'Staff note added by Sarah M.', actor: 'Sarah M.' },
        { id: 'A004', date: 'Mar 17', time: '7:01 PM', type: 'checkin', description: 'Checked in — Court 1, Pickleball', actor: 'System' },
        { id: 'A005', date: 'Mar 17', time: '10:30 AM', type: 'communication', description: 'Booking reminder sent — email', actor: 'System' },
        { id: 'A006', date: 'Mar 14', time: '7:03 PM', type: 'checkin', description: 'Checked in — Court 3, Pickleball', actor: 'System' },
        { id: 'A007', date: 'Mar 10', time: '8:05 AM', type: 'checkin', description: 'Checked in — Court 1, Pickleball', actor: 'System' },
        { id: 'A008', date: 'Mar 1', time: '12:00 AM', type: 'membership', description: 'Membership renewed — Gold, $99.00', actor: 'System' },
        { id: 'A009', date: 'Mar 1', time: '12:00 AM', type: 'payment', description: 'Payment processed — $99.00, Visa •4242', actor: 'System' },
        { id: 'A010', date: 'Feb 28', time: '4:30 PM', type: 'booking', description: 'Booking cancelled — Court 2, 6:00–7:00 PM. Refund: $45 to credit.', actor: 'Jane Doe' },
      ],
    },
    { id: 'C002', firstName: 'Alex', lastName: 'Martinez', email: 'alex.m@gmail.com', phone: '+1 (905) 555-2345', status: 'active', profileColor: AVATAR_COLORS[1], source: 'Phone (AI)', createdAt: 'Jun 8, 2025', lastActivity: 'Mar 19, 2026', membershipTier: 'Silver', membershipStatus: 'active', membershipSince: 'Jul 1, 2025', nextBillingDate: 'Apr 8, 2026', membershipPrice: 59, activePasses: [], tags: [{ name: 'silver-member', displayName: 'Silver Member', color: 'slate', category: 'membership' }, { name: 'pickleball', displayName: 'Pickleball', color: 'lime', category: 'custom' }, { name: 'frequent-player', displayName: 'Frequent Player', color: 'orange', category: 'behavioral' }], totalBookings: 87, totalSpend: 4230, avgBookingValue: 48.62, bookingFrequency: '2.1/week', daysSinceLastVisit: 2, churnRisk: 'low', preferredSport: 'Pickleball', preferredCourt: 'Court 2', preferredTime: 'Mornings (8–11 AM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'B101', date: 'Mar 19, 2026', time: '9:00 AM – 10:30 AM', court: 'Court 2', sport: 'Pickleball', type: 'Standard', duration: '90 min', amount: 52.50, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'T101', date: 'Mar 19, 2026', description: 'Court 2 — Pickleball', type: 'payment', amount: 52.50, method: 'Mastercard •8910', status: 'completed' }], activities: [{ id: 'AA01', date: 'Mar 19', time: '9:05 AM', type: 'checkin', description: 'Checked in — Court 2', actor: 'System' }] },
    { id: 'C003', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@outlook.com', phone: '+1 (416) 555-3456', status: 'active', profileColor: AVATAR_COLORS[2], source: 'Walk-in', createdAt: 'Sep 22, 2025', lastActivity: 'Mar 20, 2026', membershipTier: null, membershipStatus: null, activePasses: [{ name: 'Monthly Unlimited', remaining: 'Unlimited', expiry: 'Mar 31, 2026' }], tags: [{ name: 'pickleball', displayName: 'Pickleball', color: 'lime', category: 'custom' }, { name: 'high-value', displayName: 'High Value', color: 'yellow', category: 'behavioral' }], totalBookings: 64, totalSpend: 5120, avgBookingValue: 80.00, bookingFrequency: '1.5/week', daysSinceLastVisit: 1, churnRisk: 'low', preferredSport: 'Pickleball', preferredCourt: 'Court 3', preferredTime: 'Afternoons (2–5 PM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 120.00, notes: [{ date: 'Mar 5, 2026', author: 'Mike R.', type: 'general', text: 'Prefers Court 3 — quieter end of facility. VIP treatment.' }], bookings: [{ id: 'B201', date: 'Mar 20, 2026', time: '2:00 PM – 3:30 PM', court: 'Court 3', sport: 'Pickleball', type: 'Standard', duration: '90 min', amount: 0, status: 'completed', paymentStatus: 'comp' }], transactions: [{ id: 'T201', date: 'Mar 15, 2026', description: 'Monthly Unlimited Pass', type: 'payment', amount: 200, method: 'Visa •5678', status: 'completed' }], activities: [{ id: 'AB01', date: 'Mar 20', time: '2:05 PM', type: 'checkin', description: 'Checked in — Court 3', actor: 'System' }] },
    { id: 'C004', firstName: 'Tom', lastName: 'Kim', email: 'tom.kim@email.com', phone: '+1 (647) 555-4567', status: 'active', profileColor: AVATAR_COLORS[3], source: 'Online', createdAt: 'Nov 3, 2025', lastActivity: 'Mar 18, 2026', membershipTier: 'Gold', membershipStatus: 'active', membershipSince: 'Dec 1, 2025', nextBillingDate: 'Apr 3, 2026', membershipPrice: 99, activePasses: [], tags: [{ name: 'gold-member', displayName: 'Gold Member', color: 'amber', category: 'membership' }, { name: 'coach', displayName: 'Coach', color: 'blue', category: 'access' }], totalBookings: 56, totalSpend: 3890, avgBookingValue: 69.46, bookingFrequency: '1.2/week', daysSinceLastVisit: 3, churnRisk: 'low', preferredSport: 'Tennis', preferredCourt: 'Court 5', preferredTime: 'Evenings (6–9 PM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'B301', date: 'Mar 18, 2026', time: '6:00 PM – 8:00 PM', court: 'Court 5', sport: 'Tennis', type: 'Recurring', duration: '120 min', amount: 90, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'T301', date: 'Mar 18, 2026', description: 'Court 5 — Tennis (Recurring)', type: 'payment', amount: 90, method: 'Visa •3456', status: 'completed' }], activities: [{ id: 'AC01', date: 'Mar 18', time: '6:02 PM', type: 'checkin', description: 'Checked in — Court 5', actor: 'System' }] },
    { id: 'C005', firstName: 'Emma', lastName: 'Singh', email: 'emma.s@yahoo.com', phone: '+1 (905) 555-5678', status: 'active', profileColor: AVATAR_COLORS[4], source: 'Online', createdAt: 'Feb 14, 2026', lastActivity: 'Mar 15, 2026', membershipTier: null, membershipStatus: null, activePasses: [], tags: [{ name: 'pickleball', displayName: 'Pickleball', color: 'lime', category: 'custom' }], totalBookings: 8, totalSpend: 360, avgBookingValue: 45.00, bookingFrequency: '0.7/week', daysSinceLastVisit: 6, churnRisk: 'medium', preferredSport: 'Pickleball', preferredCourt: 'Court 1', preferredTime: 'Weekends', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'B401', date: 'Mar 15, 2026', time: '10:00 AM – 11:00 AM', court: 'Court 1', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'T401', date: 'Mar 15, 2026', description: 'Court 1 — Pickleball', type: 'payment', amount: 45, method: 'Apple Pay', status: 'completed' }], activities: [{ id: 'AD01', date: 'Mar 15', time: '10:03 AM', type: 'checkin', description: 'Checked in — Court 1', actor: 'System' }] },
    { id: 'C006', firstName: 'Mike', lastName: 'Russo', email: 'mike.russo@corp.com', phone: '+1 (416) 555-6789', status: 'active', profileColor: AVATAR_COLORS[5], source: 'Staff', createdAt: 'Aug 1, 2025', lastActivity: 'Mar 20, 2026', membershipTier: null, membershipStatus: null, activePasses: [{ name: 'Corporate 50-Visit', remaining: '31 of 50', expiry: 'Aug 1, 2026' }], tags: [{ name: 'acme-corp', displayName: 'Acme Corp', color: 'emerald', category: 'corporate' }, { name: 'frequent-player', displayName: 'Frequent Player', color: 'orange', category: 'behavioral' }], totalBookings: 94, totalSpend: 0, avgBookingValue: 0, bookingFrequency: '2.4/week', daysSinceLastVisit: 1, churnRisk: 'low', preferredSport: 'Basketball', preferredCourt: 'Court 6', preferredTime: 'Lunch (12–2 PM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [{ date: 'Aug 1, 2025', author: 'Admin', type: 'general', text: 'Corporate account — Acme Corp. All bookings charged to corporate pass.' }], bookings: [{ id: 'B501', date: 'Mar 20, 2026', time: '12:00 PM – 1:00 PM', court: 'Court 6', sport: 'Basketball', type: 'Standard', duration: '60 min', amount: 0, status: 'completed', paymentStatus: 'comp' }], transactions: [], activities: [{ id: 'AE01', date: 'Mar 20', time: '12:03 PM', type: 'checkin', description: 'Checked in — Court 6', actor: 'System' }] },
    { id: 'C007', firstName: 'Lisa', lastName: 'Park', email: 'lisa.park@email.com', phone: '+1 (647) 555-7890', status: 'active', profileColor: AVATAR_COLORS[6], source: 'Online', createdAt: 'Dec 10, 2025', lastActivity: 'Mar 12, 2026', membershipTier: 'Gold', membershipStatus: 'past_due', membershipSince: 'Jan 1, 2026', nextBillingDate: 'Overdue', membershipPrice: 99, activePasses: [], tags: [{ name: 'gold-member', displayName: 'Gold Member', color: 'amber', category: 'membership' }], totalBookings: 24, totalSpend: 1870, avgBookingValue: 77.92, bookingFrequency: '0.8/week', daysSinceLastVisit: 9, churnRisk: 'medium', preferredSport: 'Tennis', preferredCourt: 'Court 4', preferredTime: 'Evenings (6–9 PM)', waiversCurrent: true, outstandingBalance: 99, accountCredit: 0, notes: [{ date: 'Mar 12, 2026', author: 'System', type: 'follow_up', text: 'Payment failed — Visa •9012 declined. Dunning day 3 email sent.' }], bookings: [{ id: 'B601', date: 'Mar 12, 2026', time: '7:00 PM – 8:30 PM', court: 'Court 4', sport: 'Tennis', type: 'Standard', duration: '90 min', amount: 67.50, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'T601', date: 'Mar 1, 2026', description: 'Gold Membership — March (FAILED)', type: 'payment', amount: 99, method: 'Visa •9012', status: 'failed' }], activities: [{ id: 'AF01', date: 'Mar 12', time: '7:04 PM', type: 'checkin', description: 'Checked in — Court 4', actor: 'System' }, { id: 'AF02', date: 'Mar 5', time: '8:00 AM', type: 'communication', description: 'Dunning email sent — day 3 retry', actor: 'System' }, { id: 'AF03', date: 'Mar 1', time: '12:00 AM', type: 'payment', description: 'Payment failed — Gold Membership $99, Visa •9012 declined', actor: 'System' }] },
    { id: 'C008', firstName: 'David', lastName: 'Wright', email: 'david.w@gmail.com', phone: '+1 (905) 555-8901', status: 'inactive', profileColor: AVATAR_COLORS[7], source: 'Online', createdAt: 'Mar 5, 2025', lastActivity: 'Jan 8, 2026', membershipTier: null, membershipStatus: null, activePasses: [], tags: [{ name: 'lapsed', displayName: 'Lapsed', color: 'red', category: 'behavioral' }], totalBookings: 32, totalSpend: 1440, avgBookingValue: 45.00, bookingFrequency: '0/week', daysSinceLastVisit: 72, churnRisk: 'high', preferredSport: 'Pickleball', preferredCourt: 'Court 2', preferredTime: 'Weekends', waiversCurrent: false, outstandingBalance: 0, accountCredit: 25.00, notes: [{ date: 'Feb 15, 2026', author: 'System', type: 'follow_up', text: 'Auto-tagged as lapsed — no booking in 60+ days. Win-back campaign queued.' }], bookings: [{ id: 'B701', date: 'Jan 8, 2026', time: '10:00 AM – 11:00 AM', court: 'Court 2', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'T701', date: 'Jan 8, 2026', description: 'Court 2 — Pickleball', type: 'payment', amount: 45, method: 'Google Pay', status: 'completed' }], activities: [{ id: 'AG01', date: 'Feb 15', time: '12:00 AM', type: 'tag', description: 'Tag auto-assigned: Lapsed (60+ days no booking)', actor: 'System' }, { id: 'AG02', date: 'Feb 15', time: '8:00 AM', type: 'communication', description: 'Win-back email sent — 20% off promo code', actor: 'AI Marketing' }] },
    { id: 'C009', firstName: 'Rachel', lastName: 'Gomez', email: 'rachel.g@email.com', phone: '+1 (416) 555-9012', status: 'active', profileColor: AVATAR_COLORS[0], source: 'Online', createdAt: 'Jan 20, 2026', lastActivity: 'Mar 19, 2026', membershipTier: 'Gold', membershipStatus: 'trial', membershipSince: 'Mar 1, 2026', nextBillingDate: 'Mar 31, 2026', membershipPrice: 99, activePasses: [], tags: [{ name: 'gold-member', displayName: 'Gold Member', color: 'amber', category: 'membership' }], totalBookings: 12, totalSpend: 540, avgBookingValue: 45.00, bookingFrequency: '1.5/week', daysSinceLastVisit: 2, churnRisk: null, preferredSport: 'Pickleball', preferredCourt: 'Court 1', preferredTime: 'Mornings (8–11 AM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'B801', date: 'Mar 19, 2026', time: '8:00 AM – 9:00 AM', court: 'Court 1', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'T801', date: 'Mar 19, 2026', description: 'Court 1 — Pickleball', type: 'payment', amount: 45, method: 'Visa •7890', status: 'completed' }], activities: [{ id: 'AH01', date: 'Mar 19', time: '8:03 AM', type: 'checkin', description: 'Checked in — Court 1', actor: 'System' }] },
    { id: 'C010', firstName: 'Kevin', lastName: 'Nguyen', email: 'kevin.n@email.com', phone: '+1 (647) 555-0123', status: 'active', profileColor: AVATAR_COLORS[1], source: 'Phone (AI)', createdAt: 'Oct 15, 2025', lastActivity: 'Mar 20, 2026', membershipTier: null, membershipStatus: null, activePasses: [{ name: '10-Visit Pass', remaining: '2 of 10', expiry: 'Apr 15, 2026' }], tags: [{ name: 'pickleball', displayName: 'Pickleball', color: 'lime', category: 'custom' }], totalBookings: 38, totalSpend: 1710, avgBookingValue: 45.00, bookingFrequency: '1.0/week', daysSinceLastVisit: 1, churnRisk: 'low', preferredSport: 'Pickleball', preferredCourt: 'Court 2', preferredTime: 'Evenings (6–9 PM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'B901', date: 'Mar 20, 2026', time: '7:00 PM – 8:00 PM', court: 'Court 2', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'upcoming', paymentStatus: 'paid' }], transactions: [{ id: 'T901', date: 'Mar 20, 2026', description: 'Court 2 — Pickleball', type: 'payment', amount: 45, method: 'Visa •2345', status: 'completed' }], activities: [{ id: 'AI01', date: 'Mar 20', time: '7:00 PM', type: 'booking', description: 'Booking created — Court 2, 7:00–8:00 PM', actor: 'Kevin Nguyen' }] },
    { id: 'C011', firstName: 'Priya', lastName: 'Patel', email: 'priya.p@email.com', phone: '+1 (905) 555-1122', status: 'active', profileColor: AVATAR_COLORS[2], source: 'Online', createdAt: 'May 20, 2025', lastActivity: 'Mar 20, 2026', membershipTier: 'Silver', membershipStatus: 'active', membershipSince: 'Jun 1, 2025', nextBillingDate: 'Apr 20, 2026', membershipPrice: 59, activePasses: [], tags: [{ name: 'silver-member', displayName: 'Silver Member', color: 'slate', category: 'membership' }, { name: 'junior-athlete', displayName: 'Junior Athlete', color: 'violet', category: 'pricing' }], totalBookings: 72, totalSpend: 2880, avgBookingValue: 40.00, bookingFrequency: '1.6/week', daysSinceLastVisit: 1, churnRisk: 'low', preferredSport: 'Pickleball', preferredCourt: 'Court 1', preferredTime: 'Afternoons (2–5 PM)', dob: 'Jul 15, 2008', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'BA01', date: 'Mar 20, 2026', time: '3:00 PM – 4:00 PM', court: 'Court 1', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 33.75, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'TA01', date: 'Mar 20, 2026', description: 'Court 1 — Pickleball (Junior 25% off)', type: 'payment', amount: 33.75, method: 'Visa •6789', status: 'completed' }], activities: [{ id: 'AJ01', date: 'Mar 20', time: '3:02 PM', type: 'checkin', description: 'Checked in — Court 1', actor: 'System' }] },
    { id: 'C012', firstName: 'James', lastName: 'O\'Brien', email: 'james.ob@email.com', phone: '+1 (416) 555-2233', status: 'suspended', profileColor: AVATAR_COLORS[3], source: 'Online', createdAt: 'Apr 10, 2025', lastActivity: 'Feb 20, 2026', membershipTier: 'Gold', membershipStatus: 'frozen', membershipSince: 'May 1, 2025', activePasses: [], tags: [{ name: 'gold-member', displayName: 'Gold Member', color: 'amber', category: 'membership' }, { name: 'no-show-flagged', displayName: 'No-Show Flagged', color: 'red', category: 'behavioral' }], totalBookings: 45, totalSpend: 3150, avgBookingValue: 70.00, bookingFrequency: '0/week', daysSinceLastVisit: 29, churnRisk: 'high', preferredSport: 'Tennis', preferredCourt: 'Court 5', preferredTime: 'Evenings (6–9 PM)', waiversCurrent: true, outstandingBalance: 198, accountCredit: 0, notes: [{ date: 'Feb 20, 2026', author: 'Admin', type: 'complaint', text: 'Suspended after 4 no-shows in 30 days. Outstanding balance of $198. Contact to resolve.' }], bookings: [{ id: 'BB01', date: 'Feb 20, 2026', time: '7:00 PM – 8:30 PM', court: 'Court 5', sport: 'Tennis', type: 'Standard', duration: '90 min', amount: 67.50, status: 'no-show', paymentStatus: 'paid' }], transactions: [], activities: [{ id: 'AK01', date: 'Feb 20', time: '9:00 PM', type: 'booking', description: 'No-show recorded — Court 5, 7:00–8:30 PM', actor: 'System' }, { id: 'AK02', date: 'Feb 20', time: '9:01 PM', type: 'tag', description: 'Tag auto-assigned: No-Show Flagged (4 no-shows in 30 days)', actor: 'System' }] },
    { id: 'C013', firstName: 'Olivia', lastName: 'Brown', email: 'olivia.b@email.com', phone: '+1 (647) 555-3344', status: 'active', profileColor: AVATAR_COLORS[4], source: 'Walk-in', createdAt: 'Mar 18, 2026', lastActivity: 'Mar 18, 2026', membershipTier: null, membershipStatus: null, activePasses: [], tags: [], totalBookings: 1, totalSpend: 45, avgBookingValue: 45.00, bookingFrequency: '—', daysSinceLastVisit: 3, churnRisk: null, preferredSport: 'Pickleball', preferredCourt: 'Court 3', preferredTime: '—', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [{ date: 'Mar 18, 2026', author: 'Front Desk', type: 'general', text: 'Walk-in first-timer. Seemed interested in regular play.' }], bookings: [{ id: 'BC01', date: 'Mar 18, 2026', time: '11:00 AM – 12:00 PM', court: 'Court 3', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'TC01', date: 'Mar 18, 2026', description: 'Court 3 — Pickleball', type: 'payment', amount: 45, method: 'Apple Pay', status: 'completed' }], activities: [{ id: 'AL01', date: 'Mar 18', time: '11:00 AM', type: 'booking', description: 'Walk-in booking — Court 3, Pickleball', actor: 'Front Desk' }, { id: 'AL02', date: 'Mar 18', time: '11:00 AM', type: 'profile', description: 'Customer created — Walk-in registration', actor: 'Front Desk' }] },
    { id: 'C014', firstName: 'Ryan', lastName: 'Lee', email: 'ryan.lee@acme.com', phone: '+1 (905) 555-4455', status: 'active', profileColor: AVATAR_COLORS[5], source: 'Staff', createdAt: 'Aug 15, 2025', lastActivity: 'Mar 19, 2026', membershipTier: null, membershipStatus: null, activePasses: [{ name: 'Corporate 50-Visit', remaining: '28 of 50', expiry: 'Aug 15, 2026' }], tags: [{ name: 'acme-corp', displayName: 'Acme Corp', color: 'emerald', category: 'corporate' }], totalBookings: 41, totalSpend: 0, avgBookingValue: 0, bookingFrequency: '1.3/week', daysSinceLastVisit: 2, churnRisk: 'low', preferredSport: 'Basketball', preferredCourt: 'Court 6', preferredTime: 'Lunch (12–2 PM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'BD01', date: 'Mar 19, 2026', time: '12:30 PM – 1:30 PM', court: 'Court 6', sport: 'Basketball', type: 'Standard', duration: '60 min', amount: 0, status: 'completed', paymentStatus: 'comp' }], transactions: [], activities: [{ id: 'AM01', date: 'Mar 19', time: '12:33 PM', type: 'checkin', description: 'Checked in — Court 6', actor: 'System' }] },
    { id: 'C015', firstName: 'Maria', lastName: 'Santos', email: 'maria.s@email.com', phone: '+1 (416) 555-5566', status: 'active', profileColor: AVATAR_COLORS[6], source: 'Online', createdAt: 'Jul 1, 2025', lastActivity: 'Mar 16, 2026', membershipTier: 'Silver', membershipStatus: 'active', membershipSince: 'Jul 15, 2025', nextBillingDate: 'Apr 1, 2026', membershipPrice: 59, activePasses: [], tags: [{ name: 'silver-member', displayName: 'Silver Member', color: 'slate', category: 'membership' }, { name: 'senior-discount', displayName: 'Senior Discount', color: 'rose', category: 'pricing' }], totalBookings: 55, totalSpend: 2475, avgBookingValue: 45.00, bookingFrequency: '1.3/week', daysSinceLastVisit: 5, churnRisk: 'low', preferredSport: 'Pickleball', preferredCourt: 'Court 1', preferredTime: 'Mornings (8–11 AM)', dob: 'Feb 14, 1958', waiversCurrent: true, outstandingBalance: 0, accountCredit: 15.00, notes: [], bookings: [{ id: 'BE01', date: 'Mar 16, 2026', time: '9:00 AM – 10:00 AM', court: 'Court 1', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 40.50, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'TE01', date: 'Mar 16, 2026', description: 'Court 1 — Pickleball (Senior 10% off)', type: 'payment', amount: 40.50, method: 'Mastercard •3344', status: 'completed' }], activities: [{ id: 'AN01', date: 'Mar 16', time: '9:02 AM', type: 'checkin', description: 'Checked in — Court 1', actor: 'System' }] },
    { id: 'C016', firstName: 'Chris', lastName: 'Taylor', email: 'chris.t@email.com', phone: '+1 (647) 555-6677', status: 'active', profileColor: AVATAR_COLORS[7], source: 'Online', createdAt: 'Jan 5, 2026', lastActivity: 'Mar 13, 2026', membershipTier: null, membershipStatus: null, activePasses: [], tags: [{ name: 'win-back-20', displayName: 'Win-Back 20%', color: 'pink', category: 'pricing' }], totalBookings: 15, totalSpend: 675, avgBookingValue: 45.00, bookingFrequency: '0.4/week', daysSinceLastVisit: 8, churnRisk: 'medium', preferredSport: 'Pickleball', preferredCourt: 'Court 2', preferredTime: 'Weekends', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'BF01', date: 'Mar 13, 2026', time: '2:00 PM – 3:00 PM', court: 'Court 2', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 36, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'TF01', date: 'Mar 13, 2026', description: 'Court 2 — Pickleball (Win-Back 20% off)', type: 'payment', amount: 36, method: 'Visa •1122', status: 'completed' }], activities: [{ id: 'AO01', date: 'Mar 13', time: '2:02 PM', type: 'checkin', description: 'Checked in — Court 2', actor: 'System' }] },
    { id: 'C017', firstName: 'Anika', lastName: 'Sharma', email: 'anika.s@email.com', phone: '+1 (905) 555-7788', status: 'active', profileColor: AVATAR_COLORS[0], source: 'Online', createdAt: 'Feb 1, 2026', lastActivity: 'Mar 20, 2026', membershipTier: null, membershipStatus: null, activePasses: [{ name: 'Day Pass', remaining: 'Valid today', expiry: 'Mar 20, 2026' }], tags: [], totalBookings: 5, totalSpend: 275, avgBookingValue: 55.00, bookingFrequency: '0.6/week', daysSinceLastVisit: 1, churnRisk: null, preferredSport: 'Volleyball', preferredCourt: 'Court 6', preferredTime: 'Evenings (6–9 PM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'BG01', date: 'Mar 20, 2026', time: '6:00 PM – 7:30 PM', court: 'Court 6', sport: 'Volleyball', type: 'Standard', duration: '90 min', amount: 55, status: 'upcoming', paymentStatus: 'paid' }], transactions: [{ id: 'TG01', date: 'Mar 20, 2026', description: 'Day Pass', type: 'payment', amount: 55, method: 'Visa •4455', status: 'completed' }], activities: [{ id: 'AP01', date: 'Mar 20', time: '9:00 AM', type: 'payment', description: 'Day Pass purchased — $55', actor: 'Anika Sharma' }] },
    { id: 'C018', firstName: 'Brandon', lastName: 'Fisher', email: 'brandon.f@email.com', phone: '+1 (416) 555-8899', status: 'active', profileColor: AVATAR_COLORS[1], source: 'Online', createdAt: 'Sep 1, 2025', lastActivity: 'Mar 19, 2026', membershipTier: 'Gold', membershipStatus: 'active', membershipSince: 'Oct 1, 2025', nextBillingDate: 'Apr 1, 2026', membershipPrice: 99, activePasses: [], tags: [{ name: 'gold-member', displayName: 'Gold Member', color: 'amber', category: 'membership' }, { name: 'founding-member', displayName: 'Founding Member', color: 'primary', category: 'pricing' }, { name: 'frequent-player', displayName: 'Frequent Player', color: 'orange', category: 'behavioral' }], totalBookings: 118, totalSpend: 7080, avgBookingValue: 60.00, bookingFrequency: '2.0/week', daysSinceLastVisit: 2, churnRisk: 'low', preferredSport: 'Tennis', preferredCourt: 'Court 5', preferredTime: 'Mornings (8–11 AM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 80.00, notes: [], bookings: [{ id: 'BH01', date: 'Mar 19, 2026', time: '8:00 AM – 10:00 AM', court: 'Court 5', sport: 'Tennis', type: 'Recurring', duration: '120 min', amount: 76.50, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'TH01', date: 'Mar 19, 2026', description: 'Court 5 — Tennis (Founding 15% off)', type: 'payment', amount: 76.50, method: 'Amex •0011', status: 'completed' }], activities: [{ id: 'AQ01', date: 'Mar 19', time: '8:02 AM', type: 'checkin', description: 'Checked in — Court 5', actor: 'System' }] },
    { id: 'C019', firstName: 'Nicole', lastName: 'Adams', email: 'nicole.a@email.com', phone: '+1 (647) 555-9900', status: 'active', profileColor: AVATAR_COLORS[2], source: 'Walk-in', createdAt: 'Mar 1, 2026', lastActivity: 'Mar 17, 2026', membershipTier: null, membershipStatus: null, activePasses: [], tags: [], totalBookings: 3, totalSpend: 135, avgBookingValue: 45.00, bookingFrequency: '0.5/week', daysSinceLastVisit: 4, churnRisk: null, preferredSport: 'Pickleball', preferredCourt: 'Court 3', preferredTime: 'Afternoons (2–5 PM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'BI01', date: 'Mar 17, 2026', time: '2:00 PM – 3:00 PM', court: 'Court 3', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'completed', paymentStatus: 'paid' }], transactions: [{ id: 'TI01', date: 'Mar 17, 2026', description: 'Court 3 — Pickleball', type: 'payment', amount: 45, method: 'Apple Pay', status: 'completed' }], activities: [{ id: 'AR01', date: 'Mar 17', time: '2:03 PM', type: 'checkin', description: 'Checked in — Court 3', actor: 'System' }] },
    { id: 'C020', firstName: 'Daniel', lastName: 'Harris', email: 'dan.h@email.com', phone: '+1 (905) 555-0011', status: 'active', profileColor: AVATAR_COLORS[3], source: 'Online', createdAt: 'Nov 20, 2025', lastActivity: 'Mar 20, 2026', membershipTier: null, membershipStatus: null, activePasses: [{ name: '10-Visit Pass', remaining: '5 of 10', expiry: 'May 20, 2026' }], tags: [{ name: 'pickleball', displayName: 'Pickleball', color: 'lime', category: 'custom' }], totalBookings: 28, totalSpend: 1260, avgBookingValue: 45.00, bookingFrequency: '1.0/week', daysSinceLastVisit: 1, churnRisk: 'low', preferredSport: 'Pickleball', preferredCourt: 'Court 1', preferredTime: 'Evenings (6–9 PM)', waiversCurrent: true, outstandingBalance: 0, accountCredit: 0, notes: [], bookings: [{ id: 'BJ01', date: 'Mar 20, 2026', time: '6:00 PM – 7:00 PM', court: 'Court 1', sport: 'Pickleball', type: 'Standard', duration: '60 min', amount: 45, status: 'upcoming', paymentStatus: 'paid' }], transactions: [{ id: 'TJ01', date: 'Mar 20, 2026', description: 'Court 1 — Pickleball', type: 'payment', amount: 45, method: 'Visa •6677', status: 'completed' }], activities: [{ id: 'AS01', date: 'Mar 20', time: '5:45 PM', type: 'booking', description: 'Booking created — Court 1, 6:00–7:00 PM', actor: 'Daniel Harris' }] },
  ];
  return customers;
}

const CHURN_STYLES: Record<string, string> = { low: 'bg-success/10 text-success border-success/20', medium: 'bg-warning/10 text-warning-foreground border-warning/20', high: 'bg-destructive/10 text-destructive border-destructive/20' };
const STATUS_STYLES: Record<string, string> = { active: 'bg-success/10 text-success border-success/20', inactive: 'bg-muted text-muted-foreground border-border', suspended: 'bg-destructive/10 text-destructive border-destructive/20', archived: 'bg-muted text-muted-foreground border-border' };
const MSHIP_STYLES: Record<string, string> = { active: 'bg-success/10 text-success border-success/20', trial: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700', past_due: 'bg-destructive/10 text-destructive border-destructive/20', frozen: 'bg-warning/10 text-warning-foreground border-warning/20', cancelled: 'bg-muted text-muted-foreground border-border' };
const ACTIVITY_ICONS: Record<string, string> = { booking: 'bg-primary', payment: 'bg-success', membership: 'bg-amber-500', tag: 'bg-violet-500', checkin: 'bg-blue-500', communication: 'bg-orange-500', note: 'bg-slate-400', profile: 'bg-cyan-500' };

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

function BillingView() {
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

// ============================================================
// PROGRAMS VIEW
// ============================================================
const MOCK_PROGRAMS = [
  { id: 'P001', name: 'PB Beginner Clinic', type: 'clinic', sport: 'Pickleball', instructor: 'Coach Sarah', schedule: 'Tuesdays 6–7 PM', court: 'Court 1', capacity: 16, enrolled: 12, waitlist: 2, status: 'open' as const, price: 180, memberPrice: 150, description: 'Learn pickleball fundamentals in a fun, supportive group environment.', startDate: 'Mar 4, 2026', endDate: 'Apr 22, 2026', season: 'Spring 2026', ageGroup: '', totalRevenue: 2160, instructorCost: 640, courtCost: 480 },
  { id: 'P002', name: 'Junior Tennis Camp', type: 'camp', sport: 'Tennis', instructor: 'Coach Mike', schedule: 'Mon–Fri 9 AM–3 PM', court: 'Court 4, Court 5', capacity: 20, enrolled: 20, waitlist: 5, status: 'full' as const, price: 450, description: 'Week-long intensive tennis camp for juniors aged 8–14.', startDate: 'Mar 17, 2026', endDate: 'Mar 21, 2026', season: 'Spring 2026', ageGroup: 'Ages 8-14', totalRevenue: 9000, instructorCost: 2400, courtCost: 1200 },
  { id: 'P003', name: 'Advanced PB Drills', type: 'clinic', sport: 'Pickleball', instructor: 'Coach Sarah', schedule: 'Thursdays 7–8:30 PM', court: 'Court 2', capacity: 12, enrolled: 8, waitlist: 0, status: 'open' as const, price: 220, memberPrice: 190, description: 'Drills and strategy for 3.5+ rated players.', startDate: 'Mar 6, 2026', endDate: 'Apr 24, 2026', season: 'Spring 2026', ageGroup: 'Ages 16+', totalRevenue: 1760, instructorCost: 560, courtCost: 400 },
  { id: 'P004', name: 'Basketball Open Gym', type: 'drop-in', sport: 'Basketball', instructor: 'Staff', schedule: 'Sat & Sun 8–11 AM', court: 'Court 6', capacity: 30, enrolled: 18, waitlist: 0, status: 'in_progress' as const, price: 15, description: 'Drop-in basketball sessions. Pay per visit.', startDate: 'Jan 4, 2026', endDate: 'Jun 28, 2026', season: 'Spring 2026', ageGroup: '', totalRevenue: 1440, instructorCost: 480, courtCost: 320 },
  { id: 'P005', name: 'Private Tennis Lessons', type: 'private', sport: 'Tennis', instructor: 'Coach Mike', schedule: 'By appointment', court: 'Court 5', capacity: 1, enrolled: 0, waitlist: 0, status: 'open' as const, price: 85, description: 'One-on-one tennis instruction for all levels.', startDate: '', endDate: '', season: 'Spring 2026', ageGroup: '', totalRevenue: 0, instructorCost: 0, courtCost: 0 },
  { id: 'P006', name: 'VB Skills Workshop', type: 'clinic', sport: 'Volleyball', instructor: 'Coach Jess', schedule: 'Wednesdays 5–6:30 PM', court: 'Court 6', capacity: 14, enrolled: 6, waitlist: 0, status: 'draft' as const, price: 160, description: 'Volleyball fundamentals — serving, passing, and setting.', startDate: 'Apr 2, 2026', endDate: 'May 21, 2026', season: 'Spring 2026', ageGroup: 'Ages 12-18', totalRevenue: 960, instructorCost: 360, courtCost: 240 },
];
const MOCK_INSTRUCTORS = [
  { id: 'I001', name: 'Coach Sarah', sports: ['Pickleball'], mode: 'facility' as const, activePrograms: 2, rating: 4.8, reviewCount: 34, status: 'active' as const, bio: 'IPTPA certified pickleball instructor with 5 years of coaching experience. Specializes in beginner and intermediate development.', certifications: ['IPTPA Level II', 'CPR/First Aid'], hourlyRate: 45, compensationType: 'flat_rate' as const, programs: ['PB Beginner Clinic', 'Advanced PB Drills'], totalEarned: 3200, totalPaid: 2800, outstanding: 400 },
  { id: 'I002', name: 'Coach Mike', sports: ['Tennis'], mode: 'facility' as const, activePrograms: 2, rating: 4.9, reviewCount: 52, status: 'active' as const, bio: 'Former D1 tennis player and USPTA certified professional. 10+ years coaching juniors and adults at all levels.', certifications: ['USPTA Professional', 'USTA High Performance', 'CPR/First Aid'], hourlyRate: 65, compensationType: 'revenue_split' as const, programs: ['Junior Tennis Camp', 'Private Tennis Lessons'], totalEarned: 5400, totalPaid: 4800, outstanding: 600 },
  { id: 'I003', name: 'Coach Jess', sports: ['Volleyball', 'Basketball'], mode: 'independent' as const, activePrograms: 1, rating: 4.6, reviewCount: 18, status: 'active' as const, bio: 'Multi-sport coach with background in collegiate volleyball. Passionate about youth development and team building.', certifications: ['USAV CAP Level I', 'CPR/First Aid'], hourlyRate: 40, compensationType: 'flat_rate' as const, programs: ['VB Skills Workshop'], totalEarned: 1200, totalPaid: 1200, outstanding: 0 },
  { id: 'I004', name: 'Coach Daniel', sports: ['Tennis', 'Pickleball'], mode: 'independent' as const, activePrograms: 0, rating: 4.3, reviewCount: 8, status: 'inactive' as const, bio: 'Versatile racket sports instructor. Available for private lessons and group clinics.', certifications: ['PTR Certified', 'IPTPA Level I'], hourlyRate: 50, compensationType: 'revenue_split' as const, programs: [], totalEarned: 800, totalPaid: 800, outstanding: 0 },
];

function ProgramsView() {
  const [tab, setTab] = useState('My Programs');
  const [selectedProgram, setSelectedProgram] = useState<typeof MOCK_PROGRAMS[0] | null>(null);
  const [programTab, setProgramTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedInstructor, setSelectedInstructor] = useState<typeof MOCK_INSTRUCTORS[0] | null>(null);
  const [instructorTab, setInstructorTab] = useState('Overview');

  const typeOptions = ['All Types', 'private', 'clinic', 'class', 'camp', 'drop-in'];
  const statusOptions = ['All Status', 'open', 'full', 'in_progress', 'draft', 'completed'];

  const filteredPrograms = MOCK_PROGRAMS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.instructor.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'All Types' && p.type !== typeFilter) return false;
    if (statusFilter !== 'All Status' && p.status !== statusFilter) return false;
    return true;
  });

  const cycleTypeFilter = () => {
    const idx = typeOptions.indexOf(typeFilter);
    setTypeFilter(typeOptions[(idx + 1) % typeOptions.length]);
  };
  const cycleStatusFilter = () => {
    const idx = statusOptions.indexOf(statusFilter);
    setStatusFilter(statusOptions[(idx + 1) % statusOptions.length]);
  };

  return (
    <>
      <SPageHeader title="Programs"><Button className="h-9 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />Create Program</Button></SPageHeader>
      <STabBar tabs={['My Programs', 'Instructors']} active={tab} onChange={(t) => { setTab(t); setSelectedProgram(null); setSelectedInstructor(null); }} />
      <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {tab === 'My Programs' && (
          <div className="p-6 space-y-4">
            <SToolbar>
              <SSearchInput placeholder="Search programs..." value={search} onChange={setSearch} />
              <SFilterPill label={typeFilter === 'All Types' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)} active={typeFilter !== 'All Types'} onClick={cycleTypeFilter} />
              <SFilterPill label={statusFilter === 'All Status' ? 'All Status' : statusFilter.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} active={statusFilter !== 'All Status'} onClick={cycleStatusFilter} />
            </SToolbar>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredPrograms.map(prog => (
                <div key={prog.id} className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold">{prog.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={prog.type} />
                        <span className="text-xs text-muted-foreground font-medium">{prog.sport}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {prog.season && <span className="text-[10px] text-muted-foreground">{prog.season}</span>}
                        {prog.ageGroup && <span className="text-[10px] text-muted-foreground">· {prog.ageGroup}</span>}
                      </div>
                    </div>
                    <StatusBadge status={prog.status} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Users className="w-3 h-3" />{prog.instructor}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Calendar className="w-3 h-3" />{prog.schedule}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><MapPin className="w-3 h-3" />{prog.court}</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-muted-foreground mb-1"><span>Enrollment</span><span>{prog.enrolled}/{prog.capacity}{prog.waitlist > 0 && ` (+${prog.waitlist} waitlist)`}</span></div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (prog.enrolled / prog.capacity) * 100)}%` }} /></div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button variant="outline" className="flex-1 h-7 text-[10px] font-bold btn-outline-modern" onClick={() => { setSelectedProgram(prog); setProgramTab('Overview'); }}>View</Button>
                    <Button variant="outline" className="flex-1 h-7 text-[10px] font-bold btn-outline-modern" onClick={() => { setSelectedProgram(prog); setProgramTab('Roster'); }}>Roster</Button>
                    <Button variant="outline" className="flex-1 h-7 text-[10px] font-bold btn-outline-modern" onClick={() => { setSelectedProgram(prog); setProgramTab('Attendance'); }}>Attendance</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'Instructors' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_INSTRUCTORS.map(inst => (
              <div key={inst.id} className="card-elevated rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{inst.name.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><h3 className="text-sm font-bold">{inst.name}</h3><StatusBadge status={inst.status} /></div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {inst.sports.map(s => <StatusBadge key={s} status={s.toLowerCase()} />)}
                      <StatusBadge status={inst.mode} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Programs</div><div className="text-sm font-bold">{inst.activePrograms}</div></div>
                  <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Rating</div><div className="flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-sm font-bold">{inst.rating}</span><span className="text-[10px] text-muted-foreground">({inst.reviewCount})</span></div></div>
                  <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</div><div className="text-sm font-bold capitalize">{inst.status}</div></div>
                </div>
                <Button variant="outline" className="w-full h-7 text-[10px] font-bold btn-outline-modern" onClick={() => { setSelectedInstructor(inst); setInstructorTab('Overview'); }}>View Profile</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Program Detail Panel */}
      {selectedProgram && (
        <div className="w-full md:w-[520px] absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
            <div className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2"><h3 className="text-sm font-bold">{selectedProgram.name}</h3><StatusBadge status={selectedProgram.status} /></div>
              <button onClick={() => setSelectedProgram(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex border-b border-border px-5">
              {['Overview', 'Schedule', 'Roster', 'Attendance', 'Financials'].map(t => (
                <button key={t} onClick={() => setProgramTab(t)} className={`px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px ${programTab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {programTab === 'Overview' && (<>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Program Info</div>
                  <p className="text-sm font-medium text-muted-foreground">{selectedProgram.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Instructor:</span> <span className="text-sm font-medium">{selectedProgram.instructor}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Schedule:</span> <span className="text-sm font-medium">{selectedProgram.schedule}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Court:</span> <span className="text-sm font-medium">{selectedProgram.court}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Dates:</span> <span className="text-sm font-medium">{selectedProgram.startDate ? `${selectedProgram.startDate} – ${selectedProgram.endDate}` : 'Ongoing'}</span></div>
                    {selectedProgram.season && <div><span className="text-[11px] text-muted-foreground font-medium">Season:</span> <span className="text-sm font-medium">{selectedProgram.season}</span></div>}
                    {selectedProgram.ageGroup && <div><span className="text-[11px] text-muted-foreground font-medium">Age Group:</span> <span className="text-sm font-medium">{selectedProgram.ageGroup}</span></div>}
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Pricing</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Standard:</span> <span className="text-sm font-bold">${selectedProgram.price}</span></div>
                    {selectedProgram.memberPrice && <div><span className="text-[11px] text-muted-foreground font-medium">Member:</span> <span className="text-sm font-bold">${selectedProgram.memberPrice}</span></div>}
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Capacity</div>
                  <div className="flex justify-between text-sm font-medium"><span>{selectedProgram.enrolled} enrolled of {selectedProgram.capacity}</span>{selectedProgram.waitlist > 0 && <span className="text-orange-600">{selectedProgram.waitlist} on waitlist</span>}</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(selectedProgram.enrolled / selectedProgram.capacity) * 100}%` }} /></div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Financial Summary</div>
                  {(() => {
                    const netProfit = selectedProgram.totalRevenue - selectedProgram.instructorCost - selectedProgram.courtCost;
                    const margin = selectedProgram.totalRevenue > 0 ? Math.round((netProfit / selectedProgram.totalRevenue) * 100) : 0;
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Total Revenue</span><span className="text-sm font-bold text-green-600">${selectedProgram.totalRevenue.toLocaleString()}</span></div>
                        <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Instructor Cost</span><span className="text-sm font-medium text-red-500">-${selectedProgram.instructorCost.toLocaleString()}</span></div>
                        <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Court Cost</span><span className="text-sm font-medium text-red-500">-${selectedProgram.courtCost.toLocaleString()}</span></div>
                        <Separator />
                        <div className="flex justify-between items-center"><span className="text-xs font-bold">Net Profit</span><span className="text-sm font-bold">${netProfit.toLocaleString()}</span></div>
                        <div className="flex justify-between items-center"><span className="text-xs font-bold">Profit Margin</span><span className={`text-sm font-bold ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-amber-600' : 'text-red-500'}`}>{margin}%</span></div>
                      </div>
                    );
                  })()}
                </div>
              </>)}
              {programTab === 'Schedule' && (
                <div className="card-elevated rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Date', 'Time', 'Court', 'Attended'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {[{ date: 'Mar 4', time: '6:00–7:00 PM', court: selectedProgram.court, attended: '11/12' }, { date: 'Mar 11', time: '6:00–7:00 PM', court: selectedProgram.court, attended: '12/12' }, { date: 'Mar 18', time: '6:00–7:00 PM', court: selectedProgram.court, attended: '10/12' }, { date: 'Mar 25', time: '6:00–7:00 PM', court: selectedProgram.court, attended: '—' }].map((s, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30"><td className="px-4 py-2.5 text-sm font-medium">{s.date}</td><td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{s.time}</td><td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{s.court}</td><td className="px-4 py-2.5 text-sm font-medium">{s.attended}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {programTab === 'Roster' && (
                <div className="card-elevated rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Student', 'Status', 'Attendance', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {['Jane Doe', 'Alex Martin', 'Emma Singh', 'Rachel Gomez', 'Kevin Nguyen', 'Priya Patel', 'Maria Santos', 'Nicole Adams'].slice(0, selectedProgram.enrolled > 8 ? 8 : selectedProgram.enrolled).map((name, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30"><td className="px-4 py-2.5 text-sm font-medium">{name}</td><td className="px-4 py-2.5"><StatusBadge status="active" /></td><td className="px-4 py-2.5 text-sm font-medium tabular-nums">{[92, 100, 83, 75, 92, 100, 67, 83][i]}%</td><td className="px-4 py-2.5"><button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {programTab === 'Attendance' && (
                <div className="card-elevated rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Date', 'Session', 'Present', 'Absent', 'Rate'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {[
                        { date: 'Mar 4', session: 'Session 1', present: 11, absent: 1, rate: '92%' },
                        { date: 'Mar 11', session: 'Session 2', present: 12, absent: 0, rate: '100%' },
                        { date: 'Mar 18', session: 'Session 3', present: 10, absent: 2, rate: '83%' },
                        { date: 'Mar 25', session: 'Session 4', present: 9, absent: 3, rate: '75%' },
                      ].map((a, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-2.5 text-sm font-medium">{a.date}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{a.session}</td>
                          <td className="px-4 py-2.5 text-sm font-medium text-green-600 tabular-nums">{a.present}</td>
                          <td className="px-4 py-2.5 text-sm font-medium text-red-500 tabular-nums">{a.absent}</td>
                          <td className="px-4 py-2.5"><span className={`text-sm font-bold tabular-nums ${parseInt(a.rate) >= 90 ? 'text-green-600' : parseInt(a.rate) >= 75 ? 'text-amber-600' : 'text-red-500'}`}>{a.rate}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {programTab === 'Financials' && (<>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Revenue Summary</div>
                  {(() => {
                    const netProfit = selectedProgram.totalRevenue - selectedProgram.instructorCost - selectedProgram.courtCost;
                    const margin = selectedProgram.totalRevenue > 0 ? Math.round((netProfit / selectedProgram.totalRevenue) * 100) : 0;
                    return (
                      <div className="grid grid-cols-3 gap-3 pt-1">
                        <div><div className="text-[11px] text-muted-foreground font-medium">Revenue</div><div className="text-lg font-bold text-green-600">${selectedProgram.totalRevenue.toLocaleString()}</div></div>
                        <div><div className="text-[11px] text-muted-foreground font-medium">Net Profit</div><div className="text-lg font-bold">${netProfit.toLocaleString()}</div></div>
                        <div><div className="text-[11px] text-muted-foreground font-medium">Margin</div><div className={`text-lg font-bold ${margin >= 30 ? 'text-green-600' : margin >= 15 ? 'text-amber-600' : 'text-red-500'}`}>{margin}%</div></div>
                      </div>
                    );
                  })()}
                </div>
                <div className="card-elevated rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Enrollment Revenue</div>
                  </div>
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Student', 'Status', 'Amount', 'Method', 'Date'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {[
                        { student: 'Jane Doe', status: 'paid', amount: selectedProgram.price, method: 'Credit Card', date: 'Feb 28' },
                        { student: 'Alex Martin', status: 'paid', amount: selectedProgram.memberPrice || selectedProgram.price, method: 'ACH', date: 'Mar 1' },
                        { student: 'Emma Singh', status: 'paid', amount: selectedProgram.price, method: 'Credit Card', date: 'Mar 2' },
                        { student: 'Rachel Gomez', status: 'pending', amount: selectedProgram.price, method: '\u2014', date: '\u2014' },
                        { student: 'Kevin Nguyen', status: 'paid', amount: selectedProgram.memberPrice || selectedProgram.price, method: 'Credit Card', date: 'Mar 3' },
                      ].slice(0, Math.min(5, selectedProgram.enrolled)).map((r, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-2.5 text-sm font-medium">{r.student}</td>
                          <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${r.amount}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{r.method}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{r.date}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/30">
                        <td className="px-4 py-2.5 text-sm font-bold">Total ({selectedProgram.enrolled} students)</td>
                        <td className="px-4 py-2.5"></td>
                        <td className="px-4 py-2.5 text-sm font-bold tabular-nums">${selectedProgram.totalRevenue.toLocaleString()}</td>
                        <td className="px-4 py-2.5"></td>
                        <td className="px-4 py-2.5"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>)}
            </div>
        </div>
      )}
      {/* Instructor Detail Panel */}
      {selectedInstructor && (
        <div className="w-full md:w-[520px] absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
            <div className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2"><h3 className="text-sm font-bold">{selectedInstructor.name}</h3><StatusBadge status={selectedInstructor.status} /></div>
              <button onClick={() => setSelectedInstructor(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex border-b border-border px-5">
              {['Overview', 'Programs', 'Compensation'].map(t => (
                <button key={t} onClick={() => setInstructorTab(t)} className={`px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px ${instructorTab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {instructorTab === 'Overview' && (<>
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">{selectedInstructor.name.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-base font-bold">{selectedInstructor.name}</h3>
                    <div className="flex items-center gap-1.5">
                      {selectedInstructor.sports.map(s => <StatusBadge key={s} status={s.toLowerCase()} />)}
                      <StatusBadge status={selectedInstructor.mode} />
                    </div>
                    <div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span className="text-sm font-bold">{selectedInstructor.rating}</span><span className="text-[10px] text-muted-foreground">({selectedInstructor.reviewCount} reviews)</span></div>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Bio</div>
                  <p className="text-sm font-medium text-muted-foreground">{selectedInstructor.bio}</p>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Details</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Sports:</span> <span className="text-sm font-medium">{selectedInstructor.sports.join(', ')}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Hourly Rate:</span> <span className="text-sm font-bold">${selectedInstructor.hourlyRate}/hr</span></div>
                    <div className="col-span-2"><span className="text-[11px] text-muted-foreground font-medium">Certifications:</span> <span className="text-sm font-medium">{selectedInstructor.certifications.join(', ')}</span></div>
                  </div>
                </div>
              </>)}
              {instructorTab === 'Programs' && (
                <div className="space-y-3">
                  {selectedInstructor.programs.length === 0 ? (
                    <div className="card-elevated rounded-lg p-6 text-center"><p className="text-sm text-muted-foreground font-medium">No active programs</p></div>
                  ) : (
                    selectedInstructor.programs.map((pName, i) => {
                      const prog = MOCK_PROGRAMS.find(p => p.name === pName);
                      return (
                        <div key={i} className="card-elevated rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold">{pName}</h4>
                            {prog && <StatusBadge status={prog.status} />}
                          </div>
                          {prog && (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Calendar className="w-3 h-3" />{prog.schedule}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><MapPin className="w-3 h-3" />{prog.court}</div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Users className="w-3 h-3" />{prog.enrolled}/{prog.capacity} enrolled</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              {instructorTab === 'Compensation' && (<>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Compensation Model</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Type:</span> <span className="text-sm font-bold capitalize">{selectedInstructor.compensationType.replace('_', ' ')}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Rate:</span> <span className="text-sm font-bold">{selectedInstructor.compensationType === 'flat_rate' ? `$${selectedInstructor.hourlyRate}/hr` : '60/40 split'}</span></div>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Earnings Summary</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Total Earned</span><span className="text-sm font-bold">${selectedInstructor.totalEarned.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground font-medium">Total Paid</span><span className="text-sm font-medium text-green-600">${selectedInstructor.totalPaid.toLocaleString()}</span></div>
                    <Separator />
                    <div className="flex justify-between items-center"><span className="text-xs font-bold">Outstanding</span><span className={`text-sm font-bold ${selectedInstructor.outstanding > 0 ? 'text-orange-600' : 'text-green-600'}`}>${selectedInstructor.outstanding.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="card-elevated rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Recent Payments</div>
                  </div>
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Date', 'Program', 'Amount', 'Status'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {[
                        { date: 'Mar 15', program: selectedInstructor.programs[0] || '\u2014', amount: Math.round(selectedInstructor.totalPaid * 0.35), status: 'paid' },
                        { date: 'Mar 1', program: selectedInstructor.programs[0] || '\u2014', amount: Math.round(selectedInstructor.totalPaid * 0.35), status: 'paid' },
                        { date: 'Feb 15', program: selectedInstructor.programs[0] || '\u2014', amount: Math.round(selectedInstructor.totalPaid * 0.30), status: 'paid' },
                      ].map((p, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-4 py-2.5 text-sm font-medium">{p.date}</td>
                          <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{p.program}</td>
                          <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${p.amount.toLocaleString()}</td>
                          <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>)}
            </div>
        </div>
      )}
      </div>
    </>
  );
}

// ============================================================
// LEAGUES & EVENTS VIEW
// ============================================================
const MOCK_LEAGUES = [
  { id: 'L001', name: 'Spring Pickleball League', category: 'league' as const, format: 'Round Robin', sport: 'Pickleball', playType: 'Doubles', status: 'in_progress' as const, startDate: 'Mar 3, 2026', endDate: 'May 23, 2026', registered: 24, capacity: 32, fee: 120, description: 'Our flagship spring doubles league for intermediate to advanced pickleball players. Weekly matches every Tuesday evening.', season: 'Spring 2026', divisions: ['Competitive', 'Recreational'], matchFormat: 'Best of 3 sets, rally scoring to 11', scoringSystem: '3 pts win, 1 pt draw, 0 pts loss', director: 'Coach Mike', standingsVisibility: 'Public' as const },
  { id: 'L002', name: 'Tennis Singles Ladder', category: 'league' as const, format: 'Ladder', sport: 'Tennis', playType: 'Singles', status: 'registration_open' as const, startDate: 'Apr 1, 2026', endDate: 'Jun 30, 2026', registered: 18, capacity: 24, fee: 80, description: 'Challenge-based ladder for competitive singles players. Challenge anyone within 3 positions above you.', season: 'Spring/Summer 2026', divisions: [], matchFormat: 'Best of 3 sets, standard scoring', scoringSystem: 'Ladder position swap on win', director: 'Sarah Mitchell', standingsVisibility: 'Public' as const },
  { id: 'L003', name: 'March Madness Tournament', category: 'tournament' as const, format: 'Single Elimination', sport: 'Basketball', playType: 'Teams (5v5)', status: 'completed' as const, startDate: 'Mar 15, 2026', endDate: 'Mar 22, 2026', registered: 8, capacity: 8, fee: 200, description: 'Annual single-elimination basketball tournament. 8 teams battle for the spring championship trophy.', season: 'Spring 2026', divisions: [], matchFormat: '4 quarters, 10 min each', scoringSystem: 'Single elimination', director: 'Coach Mike', standingsVisibility: 'Public' as const },
  { id: 'L004', name: 'Corporate Volleyball Social', category: 'event' as const, format: 'Social Mixer', sport: 'Volleyball', playType: 'Mixed', status: 'registration_open' as const, startDate: 'Apr 12, 2026', endDate: 'Apr 12, 2026', registered: 22, capacity: 40, fee: 25, description: 'Fun social event for corporate teams. No experience required, rotating teams, prizes for everyone!', season: 'Spring 2026', divisions: [], matchFormat: 'Rotating 15-min sets', scoringSystem: 'Fun scoring — no standings', director: 'Sarah Mitchell', standingsVisibility: 'Participants only' as const },
  { id: 'L005', name: 'PB King of Court', category: 'tournament' as const, format: 'King of Court', sport: 'Pickleball', playType: 'Singles', status: 'draft' as const, startDate: 'May 3, 2026', endDate: 'May 3, 2026', registered: 0, capacity: 16, fee: 30, description: 'Fast-paced king of the court format. Win and stay on, lose and rotate. Last player standing wins!', season: 'Spring 2026', divisions: ['Open', 'Beginner'], matchFormat: 'Games to 7, win by 1', scoringSystem: 'Points accumulated across rounds', director: 'Coach Mike', standingsVisibility: 'Public' as const },
];
const MOCK_LEAGUE_SCHEDULE = [
  { date: 'Mar 3', time: '7 PM', court: 'Ct 1', match: 'Dink Masters vs Lobbers', score: '11-3, 11-5', status: 'completed' as const, round: 1 },
  { date: 'Mar 3', time: '7 PM', court: 'Ct 2', match: 'Net Ninjas vs Drop Shot', score: '11-7, 11-4', status: 'completed' as const, round: 1 },
  { date: 'Mar 3', time: '8 PM', court: 'Ct 1', match: 'Kitchen Crew vs Baseline', score: '11-8, 9-11, 11-6', status: 'completed' as const, round: 1 },
  { date: 'Mar 10', time: '7 PM', court: 'Ct 1', match: 'Paddle Pushers vs Vipers', score: '11-9, 11-7', status: 'completed' as const, round: 2 },
  { date: 'Mar 17', time: '7 PM', court: 'Ct 1', match: 'Dink Masters vs Net Ninjas', score: '—', status: 'scheduled' as const, round: 3 },
  { date: 'Mar 17', time: '8 PM', court: 'Ct 2', match: 'Kitchen Crew vs Lobbers', score: '—', status: 'scheduled' as const, round: 3 },
  { date: 'Mar 24', time: '7 PM', court: 'Ct 1', match: 'Drop Shot vs Vipers', score: '—', status: 'cancelled' as const, round: 4 },
];
const MOCK_REGISTRATIONS = [
  { name: 'Jane & Alex', regType: 'team' as const, regDate: 'Feb 10, 2026', division: 'Competitive', teamName: 'Dink Masters', status: 'active' as const, payment: 'paid' as const },
  { name: 'Tom & Sarah', regType: 'team' as const, regDate: 'Feb 11, 2026', division: 'Competitive', teamName: 'Net Ninjas', status: 'active' as const, payment: 'paid' as const },
  { name: 'Kevin & Priya', regType: 'team' as const, regDate: 'Feb 12, 2026', division: 'Recreational', teamName: 'Kitchen Crew', status: 'active' as const, payment: 'paid' as const },
  { name: 'Mike & Rachel', regType: 'team' as const, regDate: 'Feb 13, 2026', division: 'Competitive', teamName: 'Paddle Pushers', status: 'active' as const, payment: 'paid' as const },
  { name: 'Brandon & Maria', regType: 'team' as const, regDate: 'Feb 14, 2026', division: 'Recreational', teamName: 'Volley Vipers', status: 'active' as const, payment: 'paid' as const },
  { name: 'Chris & Emma', regType: 'free_agent' as const, regDate: 'Feb 18, 2026', division: 'Recreational', teamName: '—', status: 'active' as const, payment: 'paid' as const },
  { name: 'Daniel & Anika', regType: 'individual' as const, regDate: 'Feb 20, 2026', division: 'Competitive', teamName: '—', status: 'active' as const, payment: 'pending' as const },
  { name: 'Ryan & Lisa', regType: 'team' as const, regDate: 'Feb 22, 2026', division: 'Recreational', teamName: 'Drop Shot Gang', status: 'active' as const, payment: 'paid' as const },
];
const MOCK_STANDINGS = [
  { rank: 1, name: 'Team Dink Masters', played: 6, w: 5, l: 1, d: 0, pts: 15, gd: '+18' },
  { rank: 2, name: 'Net Ninjas', played: 6, w: 4, l: 1, d: 1, pts: 13, gd: '+12' },
  { rank: 3, name: 'Kitchen Crew', played: 6, w: 4, l: 2, d: 0, pts: 12, gd: '+8' },
  { rank: 4, name: 'Paddle Pushers', played: 6, w: 3, l: 2, d: 1, pts: 10, gd: '+5' },
  { rank: 5, name: 'Volley Vipers', played: 6, w: 2, l: 3, d: 1, pts: 7, gd: '-2' },
  { rank: 6, name: 'Baseline Bandits', played: 6, w: 2, l: 4, d: 0, pts: 6, gd: '-6' },
  { rank: 7, name: 'Drop Shot Gang', played: 6, w: 1, l: 4, d: 1, pts: 4, gd: '-14' },
  { rank: 8, name: 'The Lobbers', played: 6, w: 0, l: 6, d: 0, pts: 0, gd: '-21' },
];

function LeaguesView() {
  const [tab, setTab] = useState('All');
  const [selectedLeague, setSelectedLeague] = useState<typeof MOCK_LEAGUES[0] | null>(null);
  const [leagueTab, setLeagueTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All Sports');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const SPORT_OPTIONS = ['All Sports', 'Tennis', 'Pickleball', 'Basketball', 'Volleyball'];
  const STATUS_OPTIONS = ['All Status', 'Open', 'In Progress', 'Completed', 'Draft'];
  const STATUS_MAP: Record<string, string> = { 'Open': 'registration_open', 'In Progress': 'in_progress', 'Completed': 'completed', 'Draft': 'draft' };
  const filtered = MOCK_LEAGUES.filter(l => {
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (tab === 'Leagues') { if (l.category !== 'league') return false; }
    if (tab === 'Tournaments') { if (l.category !== 'tournament') return false; }
    if (tab === 'Events') { if (l.category !== 'event') return false; }
    if (sportFilter !== 'All Sports' && l.sport !== sportFilter) return false;
    if (statusFilter !== 'All Status' && l.status !== STATUS_MAP[statusFilter]) return false;
    return true;
  });
  return (
    <>
      <SPageHeader title="Leagues & Events"><Button className="h-9 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />Create League</Button></SPageHeader>
      <STabBar tabs={['All', 'Leagues', 'Tournaments', 'Events']} active={tab} onChange={setTab} />
      <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        <SToolbar>
          <SSearchInput placeholder="Search leagues & events..." value={search} onChange={setSearch} />
          <SFilterPill label={sportFilter} active={sportFilter !== 'All Sports'} onClick={() => { const i = SPORT_OPTIONS.indexOf(sportFilter); setSportFilter(SPORT_OPTIONS[(i + 1) % SPORT_OPTIONS.length]); }} />
          <SFilterPill label={statusFilter} active={statusFilter !== 'All Status'} onClick={() => { const i = STATUS_OPTIONS.indexOf(statusFilter); setStatusFilter(STATUS_OPTIONS[(i + 1) % STATUS_OPTIONS.length]); }} />
        </SToolbar>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map(le => (
            <div key={le.id} className="card-elevated rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div><h3 className="text-sm font-bold">{le.name}</h3><div className="flex items-center gap-2 mt-1"><StatusBadge status={le.category} /><span className="text-xs text-muted-foreground font-medium">{le.sport}</span></div></div>
                <StatusBadge status={le.status} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Trophy className="w-3 h-3" />{le.format} · {le.playType}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Calendar className="w-3 h-3" />{le.startDate} – {le.endDate}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><Users className="w-3 h-3" />{le.registered}/{le.capacity} registered</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium"><DollarSign className="w-3 h-3" />${le.fee}/player</div>
                {le.divisions.length > 0 && <div className="flex items-center gap-2 text-xs font-medium"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{le.divisions.length} Division{le.divisions.length > 1 ? 's' : ''}</span></div>}
              </div>
              <Button variant="outline" className="w-full h-7 text-[10px] font-bold btn-outline-modern" onClick={() => { setSelectedLeague(le); setLeagueTab('Overview'); }}>View Details</Button>
            </div>
          ))}
        </div>
      </div>
      {/* League Detail Panel */}
      {selectedLeague && (
        <div className="w-full md:w-[520px] absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
            <div className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2"><h3 className="text-sm font-bold">{selectedLeague.name}</h3><StatusBadge status={selectedLeague.category} /><StatusBadge status={selectedLeague.status} /></div>
              <button onClick={() => setSelectedLeague(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex border-b border-border px-5 overflow-x-auto">
              {['Overview', 'Standings', 'Schedule', 'Registrations', ...(selectedLeague.category === 'tournament' ? ['Bracket'] : [])].map(t => (
                <button key={t} onClick={() => setLeagueTab(t)} className={`px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap ${leagueTab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{t}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {leagueTab === 'Overview' && (<>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Description</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedLeague.description}</p>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Details</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Format:</span> <span className="text-sm font-medium">{selectedLeague.format}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Play Type:</span> <span className="text-sm font-medium">{selectedLeague.playType}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Sport:</span> <span className="text-sm font-medium">{selectedLeague.sport}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Fee:</span> <span className="text-sm font-bold">${selectedLeague.fee}/player</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Season:</span> <span className="text-sm font-medium">{selectedLeague.season}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Director:</span> <span className="text-sm font-medium">{selectedLeague.director}</span></div>
                    {selectedLeague.divisions.length > 0 && <div className="col-span-2"><span className="text-[11px] text-muted-foreground font-medium">Divisions:</span> <span className="text-sm font-medium">{selectedLeague.divisions.length} Divisions: {selectedLeague.divisions.join(', ')}</span></div>}
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Match & Scoring</div>
                  <div className="grid grid-cols-1 gap-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Match Format:</span> <span className="text-sm font-medium">{selectedLeague.matchFormat}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Scoring System:</span> <span className="text-sm font-medium">{selectedLeague.scoringSystem}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Standings Visibility:</span> <span className="text-sm font-medium">{selectedLeague.standingsVisibility}</span></div>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Dates</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Start:</span> <span className="text-sm font-medium">{selectedLeague.startDate}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">End:</span> <span className="text-sm font-medium">{selectedLeague.endDate}</span></div>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-2">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Registration</div>
                  <div className="flex justify-between text-sm font-medium"><span>{selectedLeague.registered} of {selectedLeague.capacity} registered</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(selectedLeague.registered / selectedLeague.capacity) * 100}%` }} /></div>
                </div>
              </>)}
              {leagueTab === 'Standings' && (
                <div className="card-elevated rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['#', 'Team', 'P', 'W', 'L', 'D', 'Pts', 'GD'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-3 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>{MOCK_STANDINGS.map(s => (
                      <tr key={s.rank} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="px-3 py-2 text-sm font-bold tabular-nums">{s.rank}</td>
                        <td className="px-3 py-2 text-sm font-medium">{s.name}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums font-medium">{s.played}</td>
                        <td className="px-3 py-2 text-xs tabular-nums font-medium">{s.w}</td>
                        <td className="px-3 py-2 text-xs tabular-nums font-medium">{s.l}</td>
                        <td className="px-3 py-2 text-xs tabular-nums font-medium">{s.d}</td>
                        <td className="px-3 py-2 text-sm font-bold tabular-nums">{s.pts}</td>
                        <td className={`px-3 py-2 text-xs font-medium tabular-nums ${s.gd.startsWith('+') ? 'text-green-600' : s.gd.startsWith('-') ? 'text-red-500' : ''}`}>{s.gd}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {leagueTab === 'Schedule' && (
                <div className="card-elevated rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Rd', 'Date', 'Time', 'Court', 'Match', 'Score', 'Status', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-3 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {MOCK_LEAGUE_SCHEDULE.map((m, i) => (
                        <tr key={i} className={`border-b border-border/50 hover:bg-muted/30 ${m.status === 'cancelled' ? 'opacity-50' : ''}`}>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground font-bold tabular-nums">{m.round}</td>
                          <td className="px-3 py-2.5 text-sm font-medium">{m.date}</td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium">{m.time}</td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium">{m.court}</td>
                          <td className="px-3 py-2.5 text-sm font-medium">{m.match}</td>
                          <td className="px-3 py-2.5 text-sm font-medium tabular-nums">{m.score}</td>
                          <td className="px-3 py-2.5"><StatusBadge status={m.status} /></td>
                          <td className="px-3 py-2.5">{m.status === 'scheduled' && <Button variant="outline" className="h-6 text-[10px] font-bold px-2">Enter Score</Button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {leagueTab === 'Bracket' && selectedLeague.category === 'tournament' && (
                <div className="space-y-4">
                  <div className="card-elevated rounded-lg p-4 space-y-2">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Tournament Bracket Visualization</div>
                    <p className="text-xs text-muted-foreground">Single elimination bracket for {selectedLeague.name}</p>
                  </div>
                  <div className="card-elevated rounded-lg p-6">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-12">
                        <div className="space-y-1">
                          <div className="border border-border rounded px-3 py-2 text-xs font-bold bg-card w-36">Team A</div>
                          <div className="border border-border rounded px-3 py-2 text-xs font-medium text-muted-foreground bg-card w-36">Team B</div>
                        </div>
                        <div className="space-y-1">
                          <div className="border border-border rounded px-3 py-2 text-xs font-bold bg-card w-36">Team C</div>
                          <div className="border border-border rounded px-3 py-2 text-xs font-medium text-muted-foreground bg-card w-36">Team D</div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-12">
                        <div className="w-8 h-16 border-r-2 border-t-2 border-b-2 border-border rounded-r" />
                        <div className="w-8 h-16 border-r-2 border-t-2 border-b-2 border-border rounded-r" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="space-y-1">
                          <div className="border-2 border-primary rounded px-3 py-2 text-xs font-bold bg-primary/5 w-36">Winner SF1</div>
                          <div className="border-2 border-primary rounded px-3 py-2 text-xs font-bold bg-primary/5 w-36">Winner SF2</div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="w-8 h-8 border-r-2 border-t-2 border-b-2 border-primary rounded-r" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="border-2 border-yellow-500 rounded px-4 py-3 bg-yellow-500/10 w-36 text-center">
                          <div className="text-[10px] font-medium text-yellow-600 uppercase tracking-wide">Champion</div>
                          <div className="text-xs font-bold mt-0.5">TBD</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {leagueTab === 'Registrations' && (
                <div className="card-elevated rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['Name', 'Team', 'Type', 'Division', 'Reg. Date', 'Payment', 'Waiver', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-3 py-2.5 bg-card">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {MOCK_REGISTRATIONS.map((r, i) => (
                        <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="px-3 py-2.5 text-sm font-medium">{r.name}</td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium">{r.teamName}</td>
                          <td className="px-3 py-2.5"><StatusBadge status={r.regType} /></td>
                          <td className="px-3 py-2.5 text-xs font-medium">{r.division}</td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium">{r.regDate}</td>
                          <td className="px-3 py-2.5"><StatusBadge status={r.payment} /></td>
                          <td className="px-3 py-2.5"><CheckCircle2 className="w-4 h-4 text-green-600" /></td>
                          <td className="px-3 py-2.5"><button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
        </div>
      )}
      </div>
    </>
  );
}

// ============================================================
// STAFF VIEW
// ============================================================
const MOCK_STAFF = [
  { id: 'S001', name: 'Dragan Jovanovic', email: 'dragan@courtsideai.com', phone: '+1 (416) 555-0001', role: 'owner' as const, status: 'active' as const, hasCustomPerms: false, lastActive: 'Just now', dateAdded: 'Jan 1, 2025', addedBy: 'System', emergencyContact: 'Ana Jovanovic — +1 (416) 555-9901', hasCustomerProfile: true, hasInstructorProfile: false },
  { id: 'S002', name: 'Sarah Mitchell', email: 'sarah.m@courtsideai.com', phone: '+1 (647) 555-0002', role: 'director' as const, status: 'active' as const, hasCustomPerms: false, lastActive: '2h ago', dateAdded: 'Mar 1, 2025', addedBy: 'Dragan Jovanovic (Owner)', emergencyContact: 'James Mitchell — +1 (647) 555-9902', hasCustomerProfile: false, hasInstructorProfile: false },
  { id: 'S003', name: 'Mike Thompson', email: 'mike.t@courtsideai.com', phone: '+1 (905) 555-0003', role: 'manager' as const, status: 'active' as const, hasCustomPerms: true, lastActive: '1h ago', dateAdded: 'Jun 15, 2025', addedBy: 'Sarah Mitchell (Director)', emergencyContact: 'Linda Thompson — +1 (905) 555-9903', hasCustomerProfile: true, hasInstructorProfile: false },
  { id: 'S004', name: 'Jessica Wong', email: 'jess.w@courtsideai.com', phone: '+1 (416) 555-0004', role: 'front_desk' as const, status: 'active' as const, hasCustomPerms: false, lastActive: '30m ago', dateAdded: 'Sep 1, 2025', addedBy: 'Mike Thompson (Manager)', emergencyContact: 'Kevin Wong — +1 (416) 555-9904', hasCustomerProfile: false, hasInstructorProfile: false },
  { id: 'S005', name: 'Coach Sarah', email: 'coachsarah@email.com', phone: '+1 (647) 555-0005', role: 'instructor' as const, status: 'active' as const, hasCustomPerms: true, lastActive: '3h ago', dateAdded: 'Oct 15, 2025', addedBy: 'Dragan Jovanovic (Owner)', emergencyContact: 'Tom Chen — +1 (647) 555-9905', hasCustomerProfile: true, hasInstructorProfile: true },
  { id: 'S006', name: 'Daniel Lee', email: 'daniel.l@email.com', phone: '+1 (905) 555-0006', role: 'instructor' as const, status: 'deactivated' as const, hasCustomPerms: false, lastActive: 'Feb 10, 2026', dateAdded: 'Nov 1, 2025', addedBy: 'Sarah Mitchell (Director)', emergencyContact: 'Grace Lee — +1 (905) 555-9906', hasCustomerProfile: true, hasInstructorProfile: true },
  { id: 'S007', name: 'Emily Chen', email: 'emily.c@courtsideai.com', phone: '+1 (416) 555-0007', role: 'view_only' as const, status: 'pending' as const, hasCustomPerms: false, lastActive: 'Never', dateAdded: 'Mar 20, 2026', addedBy: 'Mike Thompson (Manager)', emergencyContact: '', hasCustomerProfile: false, hasInstructorProfile: false },
];
const STAFF_PERMISSIONS = [
  { section: 'Courts', perms: ['View schedule', 'Create bookings', 'Cancel any booking', 'Override booking rules', 'Manage court settings'] },
  { section: 'Customers', perms: ['View customer profiles', 'Create customers', 'Edit profiles', 'Merge customers', 'Delete/archive'] },
  { section: 'Billing', perms: ['View transactions', 'Process refunds', 'Manage invoices', 'View financial reports', 'Manage promo codes'] },
  { section: 'Programs', perms: ['View programs', 'Create/edit programs', 'Manage enrollment', 'Mark attendance', 'Manage instructors'] },
  { section: 'Leagues', perms: ['View leagues', 'Create/edit leagues', 'Manage registrations', 'Enter scores', 'Manage brackets'] },
  { section: 'Staff', perms: ['View staff list', 'Invite staff', 'Change roles', 'Customize permissions', 'Deactivate staff'] },
];
const STAFF_ACTIVITY = [
  { time: 'Mar 21, 10:15 AM', action: 'Created booking — Court 1, Jane Doe', entity: 'Booking #BK-2026-0342' },
  { time: 'Mar 21, 9:45 AM', action: 'Processed refund — $45.00 to Kevin Nguyen', entity: 'Transaction #T010' },
  { time: 'Mar 21, 9:30 AM', action: 'Checked in customer — Mike Russo, Court 6', entity: 'Check-in' },
  { time: 'Mar 20, 8:00 PM', action: 'Closed register — Front Desk, variance $0.00', entity: 'Register Session' },
  { time: 'Mar 20, 6:15 PM', action: 'Updated customer profile — Lisa Park', entity: 'Customer #C007' },
  { time: 'Mar 20, 4:30 PM', action: 'Enrolled student in PB Clinic — Rachel Gomez', entity: 'Program #P001' },
  { time: 'Mar 20, 2:00 PM', action: 'Created manual payment — $65.00 cash, Mike Russo', entity: 'Transaction #T005' },
  { time: 'Mar 20, 11:00 AM', action: 'Sent campaign — Spring Promo to 147 customers', entity: 'Campaign #C002' },
  { time: 'Mar 19, 5:00 PM', action: 'Updated court settings — Court 6 closing time', entity: 'Court 6' },
  { time: 'Mar 19, 9:00 AM', action: 'Opened register — Front Desk, float $200.00', entity: 'Register Session' },
];

function StaffView() {
  const [selectedStaff, setSelectedStaff] = useState<typeof MOCK_STAFF[0] | null>(null);
  const [staffTab, setStaffTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPerms, setEditingPerms] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState('front_desk');
  const [inviteCustomPerms, setInviteCustomPerms] = useState(false);
  const ROLE_FILTERS = [
    { value: 'all', label: 'All Roles' },
    { value: 'owner', label: 'Owner' },
    { value: 'director', label: 'Director' },
    { value: 'manager', label: 'Manager' },
    { value: 'front_desk', label: 'Front Desk' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'view_only', label: 'View-Only' },
  ];
  if (selectedStaff) {
    return (
      <>
        <div className="h-16 flex items-center px-6 bg-card border-b border-border shrink-0">
          <button onClick={() => setSelectedStaff(null)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mr-4"><ArrowLeft className="w-4 h-4" />Staff</button>
          <ChevronRight className="w-4 h-4 text-muted-foreground mr-2" />
          <span className="text-base font-bold">{selectedStaff.name}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{selectedStaff.name.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2"><h2 className="text-lg font-bold">{selectedStaff.name}</h2><StatusBadge status={selectedStaff.role} /><StatusBadge status={selectedStaff.status} />{selectedStaff.hasCustomPerms && <Badge variant="secondary" className="text-[10px]">Custom Perms</Badge>}</div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedStaff.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedStaff.phone}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Pencil className="w-3 h-3 mr-1.5" />Edit</Button>
                <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
          <STabBar tabs={['Overview', 'Permissions', 'Activity']} active={staffTab} onChange={setStaffTab} />
          <div className="p-6 space-y-4">
            {staffTab === 'Overview' && (<>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Contact Information</div>
                  <div className="space-y-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Email:</span> <span className="text-sm font-medium">{selectedStaff.email}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Phone:</span> <span className="text-sm font-medium">{selectedStaff.phone}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Emergency Contact:</span> <span className="text-sm font-medium">{selectedStaff.emergencyContact || <span className="italic text-muted-foreground">Not provided</span>}</span></div>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Operational Info</div>
                  <div className="space-y-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Date Added:</span> <span className="text-sm font-medium">{selectedStaff.dateAdded}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Added by:</span> <span className="text-sm font-medium">{selectedStaff.addedBy}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Last Active:</span> <span className="text-sm font-medium">{selectedStaff.lastActive}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Role:</span> <span className="text-sm font-medium capitalize">{selectedStaff.role.replace(/_/g, ' ')}</span></div>
                  </div>
                </div>
              </div>
              {(selectedStaff.hasCustomerProfile || selectedStaff.hasInstructorProfile) && (
                <div className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Linked Records</div>
                  <div className="space-y-2">
                    {selectedStaff.hasCustomerProfile && (
                      <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"><Users className="w-3.5 h-3.5" />Customer Profile</button>
                    )}
                    {selectedStaff.hasInstructorProfile && (
                      <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"><GraduationCap className="w-3.5 h-3.5" />Instructor Profile</button>
                    )}
                  </div>
                </div>
              )}
              <div className="card-elevated rounded-lg p-4 space-y-2">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Internal Notes</div>
                <p className="text-sm text-muted-foreground font-medium italic">No notes for this staff member.</p>
              </div>
              {selectedStaff.role !== 'owner' && (
                <div className="pt-2">
                  {selectedStaff.status === 'deactivated' ? (
                    <Button variant="outline" className="h-9 text-xs font-bold text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"><Power className="w-3.5 h-3.5 mr-1.5" />Reactivate Staff Member</Button>
                  ) : (
                    <Button variant="outline" className="h-9 text-xs font-bold text-destructive border-destructive/30 hover:bg-destructive/5"><Ban className="w-3.5 h-3.5 mr-1.5" />Deactivate Staff Member</Button>
                  )}
                </div>
              )}
            </>)}
            {staffTab === 'Permissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Permission Overrides</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Customize this staff member&apos;s access beyond their role defaults</p>
                  </div>
                  {!editingPerms ? (
                    <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern" onClick={() => setEditingPerms(true)}><Pencil className="w-3 h-3 mr-1.5" />Edit Permissions</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern" onClick={() => setEditingPerms(false)}>Cancel</Button>
                      <Button className="h-8 text-[11px] font-bold px-4 btn-primary-modern" onClick={() => setEditingPerms(false)}>Save</Button>
                    </div>
                  )}
                </div>
                {STAFF_PERMISSIONS.map(section => (
                  <div key={section.section} className="card-elevated rounded-lg p-4 space-y-2">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{section.section}</div>
                    <div className="space-y-1.5">
                      {section.perms.map((perm, i) => {
                        const hasAccess = selectedStaff.role === 'owner' || (selectedStaff.role === 'director' && i < 4) || (selectedStaff.role === 'manager' && i < 3) || (selectedStaff.role === 'front_desk' && i < 2) || (selectedStaff.role === 'instructor' && i < 1);
                        return (
                          <div key={perm} className={`flex items-center gap-2 ${editingPerms ? 'cursor-pointer hover:bg-muted/30 -mx-1 px-1 py-0.5 rounded' : ''}`}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${hasAccess ? 'bg-primary border-primary' : 'border-border'} ${editingPerms ? 'ring-1 ring-primary/20' : ''}`}>
                              {hasAccess && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${hasAccess ? '' : 'text-muted-foreground'}`}>{perm}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {staffTab === 'Activity' && (
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Recent Activity</h3></div>
                <div className="divide-y divide-border/50">
                  {STAFF_ACTIVITY.map((act, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div><div className="text-sm font-medium">{act.action}</div><div className="text-xs text-primary font-medium mt-0.5">{act.entity}</div></div>
                        <div className="text-xs text-muted-foreground font-medium whitespace-nowrap ml-4">{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <SPageHeader title="Staff" badge={`${MOCK_STAFF.length} members`}><Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setInviteModalOpen(true)}><UserPlus className="w-3.5 h-3.5 mr-1.5" />Invite Staff</Button></SPageHeader>
      <SToolbar>
        <SSearchInput placeholder="Search by name or email..." value={search} onChange={setSearch} />
        <div className="h-4 w-px bg-border mx-1" />
        <SFilterPill label="All" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        <SFilterPill label="Active" active={statusFilter === 'active'} onClick={() => setStatusFilter('active')} />
        <SFilterPill label="Deactivated" active={statusFilter === 'deactivated'} onClick={() => setStatusFilter('deactivated')} />
        <div className="h-4 w-px bg-border mx-1" />
        {ROLE_FILTERS.map(rf => (
          <SFilterPill key={rf.value} label={rf.label} active={roleFilter === rf.value} onClick={() => setRoleFilter(rf.value)} />
        ))}
      </SToolbar>
      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="card-elevated rounded-lg overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['Name', 'Role', 'Email', 'Phone', 'Status', 'Perms', 'Last Active', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
            </tr></thead>
            <tbody>{MOCK_STAFF.filter(s => {
              if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
              if (statusFilter === 'active' && s.status !== 'active') return false;
              if (statusFilter === 'deactivated' && s.status !== 'deactivated') return false;
              if (roleFilter !== 'all' && s.role !== roleFilter) return false;
              return true;
            }).map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedStaff(s); setStaffTab('Overview'); setEditingPerms(false); }}>
                <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{s.name.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar><span className="text-sm font-medium">{s.name}</span></div></td>
                <td className="px-4 py-2.5"><StatusBadge status={s.role} /></td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{s.email}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{s.phone}</td>
                <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-2.5">{s.hasCustomPerms && <Badge variant="secondary" className="text-[10px]">Custom</Badge>}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{s.lastActive}</td>
                <td className="px-4 py-2.5"><button className="p-1 rounded hover:bg-muted" onClick={e => e.stopPropagation()}><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('front_desk'); setInviteCustomPerms(false); }}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative bg-card rounded-xl shadow-2xl w-[500px] mx-4 flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold">Invite Staff Member</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Send an email invitation to join your facility</p>
              </div>
              <button onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('front_desk'); setInviteCustomPerms(false); }} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Email Address</label>
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="staff@example.com" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">First Name</label>
                  <input value={inviteFirstName} onChange={e => setInviteFirstName(e.target.value)} placeholder="First name" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Last Name</label>
                  <input value={inviteLastName} onChange={e => setInviteLastName(e.target.value)} placeholder="Last name" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="director">Director</option>
                  <option value="manager">Manager</option>
                  <option value="front_desk">Front Desk</option>
                  <option value="instructor">Instructor</option>
                  <option value="view_only">View-Only</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Custom Permissions</div>
                    <div className="text-xs text-muted-foreground font-medium">Override default role permissions</div>
                  </div>
                  <Switch checked={inviteCustomPerms} onCheckedChange={setInviteCustomPerms} />
                </div>
                {inviteCustomPerms && (
                  <div className="border border-border rounded-lg p-3 space-y-3 max-h-48 overflow-y-auto">
                    {STAFF_PERMISSIONS.map(section => (
                      <div key={section.section} className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{section.section}</div>
                        {section.perms.map(perm => (
                          <div key={perm} className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 px-1 py-0.5 rounded">
                            <div className="w-4 h-4 rounded border border-border flex items-center justify-center hover:border-primary" />
                            <span className="text-xs font-medium text-muted-foreground">{perm}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2 shrink-0">
              <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('front_desk'); setInviteCustomPerms(false); }}>Cancel</Button>
              <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('front_desk'); setInviteCustomPerms(false); }}><Send className="w-3.5 h-3.5 mr-1.5" />Send Invitation</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// POS VIEW
// ============================================================
const MOCK_INVENTORY = [
  { id: 'INV01', name: 'Pickleball Paddle — Pro', category: 'retail' as const, sku: 'PB-PDL-001', stock: 12, lowThreshold: 5, cost: 45, price: 89.99, margin: 50, status: 'active' as const },
  { id: 'INV02', name: 'Pickleball Balls (3-pack)', category: 'retail' as const, sku: 'PB-BLL-001', stock: 34, lowThreshold: 10, cost: 8, price: 14.99, margin: 47, status: 'active' as const },
  { id: 'INV03', name: 'Tennis Racket — Beginner', category: 'retail' as const, sku: 'TN-RKT-001', stock: 4, lowThreshold: 5, cost: 30, price: 59.99, margin: 50, status: 'active' as const },
  { id: 'INV04', name: 'Grip Tape', category: 'retail' as const, sku: 'ACC-GRP-001', stock: 28, lowThreshold: 10, cost: 3, price: 7.99, margin: 62, status: 'active' as const },
  { id: 'INV05', name: 'Water Bottle', category: 'fnb' as const, sku: 'FNB-WTR-001', stock: 48, lowThreshold: 12, cost: 0.50, price: 2.50, margin: 80, status: 'active' as const },
  { id: 'INV06', name: 'Energy Bar', category: 'fnb' as const, sku: 'FNB-BAR-001', stock: 24, lowThreshold: 10, cost: 1.20, price: 3.50, margin: 66, status: 'active' as const },
  { id: 'INV07', name: 'Gatorade', category: 'fnb' as const, sku: 'FNB-GAT-001', stock: 2, lowThreshold: 6, cost: 1.50, price: 4.00, margin: 63, status: 'active' as const },
  { id: 'INV08', name: 'Paddle Rental', category: 'equipment' as const, sku: 'EQ-PDL-R01', stock: 8, lowThreshold: 2, cost: 0, price: 5.00, margin: 100, status: 'active' as const },
  { id: 'INV09', name: 'Ball Hopper Rental', category: 'equipment' as const, sku: 'EQ-BHP-R01', stock: 4, lowThreshold: 1, cost: 0, price: 10.00, margin: 100, status: 'active' as const },
  { id: 'INV10', name: 'Court Towel', category: 'retail' as const, sku: 'ACC-TWL-001', stock: 0, lowThreshold: 5, cost: 4, price: 12.99, margin: 69, status: 'inactive' as const },
  { id: 'INV11', name: 'Restringing Service', category: 'service' as const, sku: 'SVC-RST-001', stock: 0, lowThreshold: 0, cost: 15, price: 35.00, margin: 57, status: 'active' as const },
  { id: 'INV12', name: 'Video Replay Session', category: 'service' as const, sku: 'SVC-VID-001', stock: 0, lowThreshold: 0, cost: 0, price: 15.00, margin: 100, status: 'active' as const },
];
const MOCK_RENTALS = [
  { id: 'R01', equipment: 'Paddle Rental', customer: 'Jane Doe', checkedOut: '2:15 PM', bookingEnd: '3:15 PM', status: 'active' as const },
  { id: 'R02', equipment: 'Ball Hopper Rental', customer: 'Tom Kim', checkedOut: '1:00 PM', bookingEnd: '3:00 PM', status: 'active' as const },
  { id: 'R03', equipment: 'Paddle Rental', customer: 'Emma Singh', checkedOut: '11:30 AM', bookingEnd: '12:30 PM', status: 'overdue' as const },
  { id: 'R04', equipment: 'Paddle Rental', customer: 'Kevin Nguyen', checkedOut: '10:00 AM', bookingEnd: '11:00 AM', status: 'overdue' as const },
];

function POSView() {
  const [tab, setTab] = useState('Inventory');
  const [search, setSearch] = useState('');
  const [inventoryView, setInventoryView] = useState<'list' | 'category'>('list');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [registerOpen, setRegisterOpen] = useState(true);
  const [closeRegisterModal, setCloseRegisterModal] = useState(false);
  const [actualCash, setActualCash] = useState('');
  const [posModeOpen, setPosModeOpen] = useState(false);
  const [returnModal, setReturnModal] = useState<typeof MOCK_RENTALS[0] | null>(null);
  const [returnCondition, setReturnCondition] = useState('good');
  const [returnNotes, setReturnNotes] = useState('');

  const lowStockCount = MOCK_INVENTORY.filter(i => (i.stock > 0 && i.stock <= i.lowThreshold) || (i.stock === 0 && i.category !== 'service')).length;
  const outOfStockCount = MOCK_INVENTORY.filter(i => i.stock === 0 && i.category !== 'service').length;

  const REGISTER_TRANSACTIONS = [
    { time: '2:15 PM', customer: 'Jane Doe', items: 2, amount: 95.98, method: 'Card' as const, staff: 'Jessica' },
    { time: '1:30 PM', customer: 'Walk-in', items: 1, amount: 2.50, method: 'Cash' as const, staff: 'Jessica' },
    { time: '12:45 PM', customer: 'Tom Kim', items: 3, amount: 26.48, method: 'Apple Pay' as const, staff: 'Mike T.' },
    { time: '11:20 AM', customer: 'Emma Singh', items: 1, amount: 14.99, method: 'Card' as const, staff: 'Jessica' },
    { time: '10:00 AM', customer: 'Mike Russo', items: 2, amount: 65.00, method: 'Cash' as const, staff: 'Jessica' },
    { time: '9:30 AM', customer: 'Walk-in', items: 1, amount: 4.00, method: 'Card' as const, staff: 'Jessica' },
  ];
  const totalSales = REGISTER_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
  const cashSales = REGISTER_TRANSACTIONS.filter(t => t.method === 'Cash').reduce((s, t) => s + t.amount, 0);
  const cardSales = totalSales - cashSales;
  const openingFloat = 200;
  const expectedCash = openingFloat + cashSales;

  const filteredInventory = MOCK_INVENTORY.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (stockFilter === 'low' && !(i.stock > 0 && i.stock <= i.lowThreshold)) return false;
    if (stockFilter === 'out' && !(i.stock === 0 && i.category !== 'service')) return false;
    if (stockFilter === 'in' && (i.stock === 0 && i.category !== 'service')) return false;
    return true;
  });

  const categoryGroups = [
    { key: 'retail', label: 'Retail', icon: Package },
    { key: 'fnb', label: 'Food & Beverage', icon: ShoppingBag },
    { key: 'equipment', label: 'Equipment Rental', icon: Wrench },
    { key: 'service', label: 'Services', icon: Star },
  ];

  return (
    <>
      <SPageHeader title="Point of Sale"><Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setPosModeOpen(true)}><ShoppingBag className="w-3.5 h-3.5 mr-1.5" />Enter POS Mode</Button></SPageHeader>
      <div className="flex items-center border-b border-border px-3 md:px-6 bg-card shrink-0 overflow-x-auto">
        {(['Inventory', 'Equipment', 'Register'] as const).map(tabKey => (
          <button key={tabKey} onClick={() => setTab(tabKey)}
            className={`px-3 md:px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap flex items-center gap-1.5 ${tab === tabKey ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
            {tabKey}
            {tabKey === 'Inventory' && lowStockCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">{lowStockCount}</span>
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        {tab === 'Inventory' && (<>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{lowStockCount} items need attention ({outOfStockCount} out of stock)</span>
            </div>
          )}
          <SToolbar>
            <SSearchInput placeholder="Search inventory..." value={search} onChange={setSearch} />
            <SFilterPill label="All Categories" active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} />
            <SFilterPill label="Retail" active={categoryFilter === 'retail'} onClick={() => setCategoryFilter(categoryFilter === 'retail' ? 'all' : 'retail')} />
            <SFilterPill label="F&B" active={categoryFilter === 'fnb'} onClick={() => setCategoryFilter(categoryFilter === 'fnb' ? 'all' : 'fnb')} />
            <SFilterPill label="Equipment" active={categoryFilter === 'equipment'} onClick={() => setCategoryFilter(categoryFilter === 'equipment' ? 'all' : 'equipment')} />
            <SFilterPill label="Services" active={categoryFilter === 'service'} onClick={() => setCategoryFilter(categoryFilter === 'service' ? 'all' : 'service')} />
            <div className="w-px h-5 bg-border mx-1" />
            <SFilterPill label="All Stock" active={stockFilter === 'all'} onClick={() => setStockFilter('all')} />
            <SFilterPill label="Low Stock" active={stockFilter === 'low'} onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')} />
            <SFilterPill label="Out of Stock" active={stockFilter === 'out'} onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')} />
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setInventoryView('list')} className={`p-1.5 rounded ${inventoryView === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`} title="List View"><List className="w-4 h-4" /></button>
              <button onClick={() => setInventoryView('category')} className={`p-1.5 rounded ${inventoryView === 'category' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`} title="Category View"><PieChart className="w-4 h-4" /></button>
            </div>
          </SToolbar>

          {inventoryView === 'list' ? (
            <div className="card-elevated rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {['Item', 'Category', 'SKU', 'Stock', 'Cost', 'Price', 'Margin', 'Status', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
                </tr></thead>
                <tbody>{filteredInventory.map(item => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={item.category} /></td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono font-medium">{item.sku}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm font-medium tabular-nums">{item.category === 'service' ? '∞' : item.stock}</span>
                      {item.stock > 0 && item.stock <= item.lowThreshold && <span className="ml-1.5 text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded uppercase">Low</span>}
                      {item.stock === 0 && item.category !== 'service' && <span className="ml-1.5 text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded uppercase">Out</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums font-medium">${item.cost.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{item.margin}%</td>
                    <td className="px-4 py-2.5"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-2.5"><button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryGroups.map(cg => {
                const items = MOCK_INVENTORY.filter(i => i.category === cg.key);
                if (items.length === 0) return null;
                const itemCount = items.length;
                const totalStockValue = items.reduce((s, i) => s + (i.category === 'service' ? 0 : i.stock * i.cost), 0);
                const avgMargin = Math.round(items.reduce((s, i) => s + i.margin, 0) / items.length);
                const lowCount = items.filter(i => (i.stock > 0 && i.stock <= i.lowThreshold) || (i.stock === 0 && i.category !== 'service')).length;
                const IconComp = cg.icon;
                return (
                  <div key={cg.key} className="card-elevated rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><IconComp className="w-4 h-4 text-primary" /></div>
                        <div>
                          <h3 className="text-sm font-bold">{cg.label}</h3>
                          <p className="text-xs text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {lowCount > 0 && <span className="text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full uppercase">{lowCount} low</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {cg.key !== 'service' && (
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Stock Value</div>
                          <div className="text-base font-bold tabular-nums">${totalStockValue.toFixed(2)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Avg Margin</div>
                        <div className="text-base font-bold tabular-nums">{avgMargin}%</div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-2 space-y-1">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs py-1">
                          <span className="font-medium truncate mr-2">{item.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted-foreground tabular-nums">{item.category === 'service' ? '∞' : item.stock} in stock</span>
                            <span className="font-medium tabular-nums">${item.price.toFixed(2)}</span>
                            {item.stock > 0 && item.stock <= item.lowThreshold && <span className="text-[8px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded uppercase">Low</span>}
                            {item.stock === 0 && item.category !== 'service' && <span className="text-[8px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded uppercase">Out</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>)}
        {tab === 'Equipment' && (<>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SMetricCard label="Available" value={`${MOCK_INVENTORY.filter(i => i.category === 'equipment').reduce((s, i) => s + i.stock, 0)}`} />
            <SMetricCard label="Checked Out" value={`${MOCK_RENTALS.filter(r => r.status === 'active').length}`} />
            <SMetricCard label="Overdue" value={`${MOCK_RENTALS.filter(r => r.status === 'overdue').length}`} trend={MOCK_RENTALS.filter(r => r.status === 'overdue').length > 0 ? 'Needs attention' : undefined} trendUp={false} />
          </div>
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Active Rentals</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Equipment', 'Customer', 'Checked Out', 'Booking End', 'Status', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{MOCK_RENTALS.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-medium">{r.equipment}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{r.customer}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{r.checkedOut}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{r.bookingEnd}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern" onClick={() => { setReturnModal(r); setReturnCondition('good'); setReturnNotes(''); }}>Return</Button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}
        {tab === 'Register' && (<>
          <div className="card-elevated rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Front Desk Register</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${registerOpen ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  <span className="text-sm font-bold">{registerOpen ? 'Open' : 'Closed'}</span>
                  {registerOpen && <span className="text-xs text-muted-foreground font-medium">· Session started 9:00 AM</span>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {registerOpen && (
                  <div className="flex gap-4 text-right">
                    <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Transactions</div><div className="text-lg font-bold">23</div></div>
                    <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Revenue</div><div className="text-lg font-bold">${totalSales.toFixed(2)}</div></div>
                  </div>
                )}
                <Button
                  variant={registerOpen ? 'outline' : 'default'}
                  className={`h-9 text-xs font-bold px-4 ${registerOpen ? 'btn-outline-modern' : 'btn-primary-modern'}`}
                  onClick={() => { if (registerOpen) { setCloseRegisterModal(true); } else { setRegisterOpen(true); } }}
                >
                  <Power className="w-3.5 h-3.5 mr-1.5" />{registerOpen ? 'Close Register' : 'Open Register'}
                </Button>
              </div>
            </div>
          </div>

          {registerOpen && (
            <div className="card-elevated rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold">Cash Drawer</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Opening Float</div>
                  <div className="text-base font-bold tabular-nums">${openingFloat.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cash Sales</div>
                  <div className="text-base font-bold tabular-nums">${cashSales.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Expected Total</div>
                  <div className="text-base font-bold tabular-nums">${expectedCash.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Today&apos;s Register Activity</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Time', 'Customer', 'Items', 'Amount', 'Method', 'Staff'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>
                {REGISTER_TRANSACTIONS.map((tx, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30"><td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{tx.time}</td><td className="px-4 py-2.5 text-sm font-medium">{tx.customer}</td><td className="px-4 py-2.5 text-sm font-medium tabular-nums">{tx.items}</td><td className="px-4 py-2.5 text-sm font-medium tabular-nums">${tx.amount.toFixed(2)}</td><td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{tx.method}</td><td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{tx.staff}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
      </div>

      {closeRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setCloseRegisterModal(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative bg-card rounded-xl shadow-2xl w-[480px] p-6 space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold">Close Register</h3>
            <p className="text-sm text-muted-foreground">Review the session summary before closing.</p>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Opening Float</span><span className="font-bold tabular-nums">${openingFloat.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Sales</span><span className="font-bold tabular-nums">${totalSales.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cash Sales</span><span className="font-bold tabular-nums">${cashSales.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Card / Digital Sales</span><span className="font-bold tabular-nums">${cardSales.toFixed(2)}</span></div>
              <Separator />
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Expected Cash</span><span className="font-bold tabular-nums">${expectedCash.toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Actual Cash</span>
                <input type="text" value={actualCash} onChange={e => setActualCash(e.target.value)} placeholder={expectedCash.toFixed(2)} className="w-28 h-8 px-2 text-sm font-bold tabular-nums text-right rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {actualCash && !isNaN(parseFloat(actualCash)) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Variance</span>
                  <span className={`font-bold tabular-nums ${parseFloat(actualCash) - expectedCash === 0 ? 'text-green-600' : parseFloat(actualCash) - expectedCash > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {parseFloat(actualCash) - expectedCash >= 0 ? '+' : ''}${(parseFloat(actualCash) - expectedCash).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => setCloseRegisterModal(false)}>Cancel</Button>
              <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => { setCloseRegisterModal(false); setRegisterOpen(false); setActualCash(''); }}>Confirm Close</Button>
            </div>
          </div>
        </div>
      )}

      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setReturnModal(null)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative bg-card rounded-xl shadow-2xl w-[420px] p-6 space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold">Return Equipment</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Equipment</span><span className="font-bold">{returnModal.equipment}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Customer</span><span className="font-bold">{returnModal.customer}</span></div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Condition</label>
                <div className="flex gap-2 mt-1.5">
                  {(['good', 'damaged', 'lost'] as const).map(c => (
                    <button key={c} onClick={() => setReturnCondition(c)}
                      className={`h-8 px-3 rounded-md text-xs font-bold transition-colors capitalize ${returnCondition === c ? (c === 'good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300') : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {(returnCondition === 'damaged' || returnCondition === 'lost') && (<>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Damage Notes</label>
                  <textarea value={returnNotes} onChange={e => setReturnNotes(e.target.value)} placeholder="Describe the damage..." className="w-full mt-1.5 h-16 px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div className="flex justify-between text-sm p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <span className="text-red-700 dark:text-red-300 font-medium">Damage Fee</span>
                  <span className="font-bold text-red-700 dark:text-red-300">{returnCondition === 'lost' ? '$50.00' : '$25.00'}</span>
                </div>
              </>)}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => setReturnModal(null)}>Cancel</Button>
              <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setReturnModal(null)}><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Confirm Return</Button>
            </div>
          </div>
        </div>
      )}

      {posModeOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span className="text-base font-bold">POS Mode</span>
              <span className="text-xs text-muted-foreground font-medium">Front Desk Register</span>
            </div>
            <Button variant="outline" className="h-8 text-xs font-bold btn-outline-modern" onClick={() => setPosModeOpen(false)}><X className="w-3.5 h-3.5 mr-1.5" />Exit POS Mode</Button>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col border-r border-border">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30 shrink-0">
                {['Retail', 'F&B', 'Equipment', 'Services'].map((cat, idx) => (
                  <button key={cat} className={`h-9 px-4 rounded-lg text-xs font-bold transition-colors ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted border border-border'}`}>{cat}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {MOCK_INVENTORY.filter(i => i.category === 'retail' && i.status === 'active').map(item => (
                    <button key={item.id} className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-md transition-all text-center min-h-[100px]">
                      <Package className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs font-bold leading-tight">{item.name}</span>
                      <span className="text-sm font-bold text-primary mt-1 tabular-nums">${item.price.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{item.stock} in stock</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-[340px] flex flex-col bg-card">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Customer lookup..." className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground" readOnly />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div><span className="text-sm font-medium">PB Paddle — Pro</span><div className="text-xs text-muted-foreground">Qty: 1</div></div>
                  <span className="text-sm font-bold tabular-nums">$89.99</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div><span className="text-sm font-medium">Water Bottle</span><div className="text-xs text-muted-foreground">Qty: 2</div></div>
                  <span className="text-sm font-bold tabular-nums">$5.00</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div><span className="text-sm font-medium">Grip Tape</span><div className="text-xs text-muted-foreground">Qty: 1</div></div>
                  <span className="text-sm font-bold tabular-nums">$7.99</span>
                </div>
              </div>
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal (4 items)</span><span className="font-bold tabular-nums">$102.98</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (13%)</span><span className="font-bold tabular-nums">$13.39</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-base font-bold">Total</span><span className="text-lg font-bold tabular-nums">$116.37</span></div>
                <div className="grid grid-cols-3 gap-2">
                  <Button className="h-10 text-xs font-bold btn-primary-modern"><CreditCard className="w-3.5 h-3.5 mr-1" />Card</Button>
                  <Button variant="outline" className="h-10 text-xs font-bold btn-outline-modern"><DollarSign className="w-3.5 h-3.5 mr-1" />Cash</Button>
                  <Button variant="outline" className="h-10 text-xs font-bold btn-outline-modern"><Merge className="w-3.5 h-3.5 mr-1" />Split</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// COMMUNICATIONS VIEW
// ============================================================
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

function CommunicationsView() {
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
      <SPageHeader title="Communications">
        {tab === 'Message Log' && <Button onClick={() => { setComposeOpen(true); setComposeStep(1); }} className="h-9 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />Compose</Button>}
        {tab === 'Campaigns' && <Button onClick={() => { setComposeOpen(true); setComposeStep(1); }} className="h-9 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />New Campaign</Button>}
        {tab === 'Templates' && <Button onClick={() => setEditingTemplate('New Template')} className="h-9 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />New Template</Button>}
        {tab === 'Delivery Issues' && <Button variant="outline" className="h-9 text-xs font-bold px-5 btn-outline-modern"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Retry All</Button>}
      </SPageHeader>
      <STabBar tabs={['Message Log', 'Campaigns', 'Templates', 'Delivery Issues']} active={tab} onChange={setTab} />
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
                    <div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-bold">{camp.name}</h3><StatusBadge status={camp.type} /><StatusBadge status={camp.status} />{camp.promo && <Badge variant="outline" className="text-[9px] font-bold">🏷 {camp.promo}</Badge>}</div>
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
                {composeStep === 1 ? 'Cancel' : '← Back'}
              </Button>
              {composeStep < 5 ? (
                <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setComposeStep(composeStep + 1)}>Next →</Button>
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

// ============================================================
// ACCESS & CHECK-IN VIEW
// ============================================================
function AccessView() {
  const [tab, setTab] = useState("Today's Activity");
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<'all' | 'check-in' | 'denied' | 'no-show'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'front_desk' | 'door_code' | 'qr'>('all');
  const arrivals = [
    { id: 'A01', customer: 'Jane Doe', bookingTime: '2:00 PM', court: 'Court 1', sport: 'Pickleball', credentialSent: true, checkedIn: true, checkInTime: '1:52 PM', method: 'Front Desk' },
    { id: 'A02', customer: 'Tom Kim', bookingTime: '2:00 PM', court: 'Court 5', sport: 'Tennis', credentialSent: true, checkedIn: true, checkInTime: '1:58 PM', method: 'Door Code' },
    { id: 'A03', customer: 'Emma Singh', bookingTime: '3:00 PM', court: 'Court 2', sport: 'Pickleball', credentialSent: true, checkedIn: false },
    { id: 'A04', customer: 'Alex Martin', bookingTime: '3:00 PM', court: 'Court 1', sport: 'Pickleball', credentialSent: true, checkedIn: false },
    { id: 'A05', customer: 'Rachel Gomez', bookingTime: '4:00 PM', court: 'Court 3', sport: 'Pickleball', credentialSent: true, checkedIn: false },
    { id: 'A06', customer: 'Kevin Nguyen', bookingTime: '5:00 PM', court: 'Court 2', sport: 'Pickleball', credentialSent: false, checkedIn: false },
    { id: 'A07', customer: 'Brandon Fisher', bookingTime: '6:00 PM', court: 'Court 5', sport: 'Tennis', credentialSent: true, checkedIn: false },
    { id: 'A08', customer: 'Priya Patel', bookingTime: '3:00 PM', court: 'Court 1', sport: 'Pickleball', credentialSent: true, checkedIn: false },
  ];
  const accessLog = [
    { id: 'AL01', date: 'Mar 21, 1:58 PM', customer: 'Tom Kim', eventType: 'check-in' as const, method: 'door_code' as const, details: 'Door code entered — Court 5 Tennis booking' },
    { id: 'AL02', date: 'Mar 21, 1:52 PM', customer: 'Jane Doe', eventType: 'check-in' as const, method: 'front_desk' as const, details: 'Front desk check-in — Court 1 Pickleball booking' },
    { id: 'AL03', date: 'Mar 21, 1:45 PM', customer: 'Unknown', eventType: 'denied' as const, method: 'door_code' as const, details: 'Invalid door code attempt — 3 failed tries' },
    { id: 'AL04', date: 'Mar 21, 12:30 PM', customer: 'Mike Russo', eventType: 'check-in' as const, method: 'front_desk' as const, details: 'Front desk check-in — Court 6 Basketball (Corporate)' },
    { id: 'AL05', date: 'Mar 21, 12:02 PM', customer: 'Sarah Johnson', eventType: 'check-in' as const, method: 'qr' as const, details: 'QR code scanned — PB Clinic session' },
    { id: 'AL06', date: 'Mar 21, 11:55 AM', customer: 'Walk-in Guest', eventType: 'override' as const, method: 'front_desk' as const, details: 'Manager override — no booking, admitted for open play' },
    { id: 'AL07', date: 'Mar 21, 10:00 AM', customer: 'Alex Martin', eventType: 'check-in' as const, method: 'door_code' as const, details: 'Door code entered — Court 1 Pickleball booking' },
    { id: 'AL08', date: 'Mar 21, 9:45 AM', customer: 'Maria Santos', eventType: 'check-in' as const, method: 'front_desk' as const, details: 'Front desk check-in — Court 1 Pickleball booking' },
    { id: 'AL09', date: 'Mar 21, 9:30 AM', customer: 'Daniel Harris', eventType: 'check-in' as const, method: 'door_code' as const, details: 'Door code entered — Court 3 Pickleball booking' },
    { id: 'AL10', date: 'Mar 21, 9:00 AM', customer: 'Brandon Fisher', eventType: 'check-in' as const, method: 'front_desk' as const, details: 'Front desk check-in — Court 5 Tennis (Recurring)' },
    { id: 'AL11', date: 'Mar 20, 8:45 PM', customer: 'Night Group', eventType: 'check-in' as const, method: 'front_desk' as const, details: 'Front desk check-in — Court 1 Open Play group' },
    { id: 'AL12', date: 'Mar 20, 7:00 PM', customer: 'Tom Kim', eventType: 'check-in' as const, method: 'door_code' as const, details: 'Door code entered — Court 5 Tennis booking' },
    { id: 'AL13', date: 'Mar 20, 6:00 PM', customer: 'Anika Sharma', eventType: 'check-in' as const, method: 'front_desk' as const, details: 'Front desk check-in — Court 6 Volleyball booking' },
    { id: 'AL14', date: 'Mar 20, 4:00 PM', customer: 'Chris Taylor', eventType: 'check-in' as const, method: 'door_code' as const, details: 'Door code entered — Court 2 Pickleball booking' },
    { id: 'AL15', date: 'Mar 20, 2:00 PM', customer: 'Unknown', eventType: 'denied' as const, method: 'door_code' as const, details: 'Expired door code used — code rotated yesterday' },
  ];
  const checkedInCount = arrivals.filter(a => a.checkedIn).length;
  return (
    <>
      <SPageHeader title="Access & Check-in"><Button className="h-9 text-xs font-bold px-5 btn-primary-modern"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Manual Check-in</Button></SPageHeader>
      <STabBar tabs={["Today's Activity", 'Access Log']} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        {tab === "Today's Activity" && (<>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SMetricCard label="Expected Arrivals" value={`${arrivals.length}`} />
            <SMetricCard label="Checked In" value={`${checkedInCount}`} />
            <SMetricCard label="Currently Here" value={`${checkedInCount}`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"><AlertCircle className="w-4 h-4 text-orange-600 shrink-0" /><span className="text-sm font-medium text-orange-800 dark:text-orange-200">1 no-show candidate — Alex Martin (booking at 1:00 PM, not checked in)</span></div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"><AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" /><span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">1 expired waiver — David Wright</span></div>
          </div>
          {/* Currently Here */}
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Currently Here</h3></div>
            <div className="divide-y divide-border/50">
              {arrivals.filter(a => a.checkedIn).map(a => (
                <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                  <span className="text-sm font-medium flex-1">{a.customer}</span>
                  <span className="text-xs text-muted-foreground font-medium">{a.court} — {a.sport}</span>
                  <span className="text-xs text-muted-foreground font-medium">{a.bookingTime}</span>
                </div>
              ))}
              {arrivals.filter(a => a.checkedIn).length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-muted-foreground font-medium">No customers currently on-site</div>
              )}
            </div>
          </div>
          {/* Expected Arrivals (not yet checked in) */}
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Expected Arrivals</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Customer', 'Time', 'Court', 'Sport', 'Credential', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{arrivals.filter(a => !a.checkedIn).map(a => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-medium">{a.customer}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{a.bookingTime}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{a.court}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{a.sport}</td>
                  <td className="px-4 py-2.5">{a.credentialSent ? <StatusBadge status="sent" /> : <StatusBadge status="pending" />}</td>
                  <td className="px-4 py-2.5"><Button className="h-7 text-[10px] font-bold px-3 btn-primary-modern">Check In</Button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {/* Checked In */}
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Checked In</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Customer', 'Booking Time', 'Court', 'Sport', 'Check-in Time', 'Method'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{arrivals.filter(a => a.checkedIn).map(a => (
                <tr key={a.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-medium">{a.customer}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{a.bookingTime}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{a.court}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{a.sport}</td>
                  <td className="px-4 py-2.5 text-xs font-bold text-green-600">{a.checkInTime}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={a.method?.toLowerCase().replace(/ /g, '_') || ''} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}
        {tab === 'Access Log' && (<>
          <SToolbar>
            <SSearchInput placeholder="Search by customer..." value={search} onChange={setSearch} />
            <SFilterPill label="All Events" active={eventFilter === 'all'} onClick={() => setEventFilter('all')} />
            <SFilterPill label="Check-in" active={eventFilter === 'check-in'} onClick={() => setEventFilter(eventFilter === 'check-in' ? 'all' : 'check-in')} />
            <SFilterPill label="Denied" active={eventFilter === 'denied'} onClick={() => setEventFilter(eventFilter === 'denied' ? 'all' : 'denied')} />
            <SFilterPill label="No-show" active={eventFilter === 'no-show'} onClick={() => setEventFilter(eventFilter === 'no-show' ? 'all' : 'no-show')} />
            <div className="w-px h-5 bg-border" />
            <SFilterPill label="All Methods" active={methodFilter === 'all'} onClick={() => setMethodFilter('all')} />
            <SFilterPill label="Front Desk" active={methodFilter === 'front_desk'} onClick={() => setMethodFilter(methodFilter === 'front_desk' ? 'all' : 'front_desk')} />
            <SFilterPill label="Door Code" active={methodFilter === 'door_code'} onClick={() => setMethodFilter(methodFilter === 'door_code' ? 'all' : 'door_code')} />
            <SFilterPill label="QR" active={methodFilter === 'qr'} onClick={() => setMethodFilter(methodFilter === 'qr' ? 'all' : 'qr')} />
            <div className="flex-1" />            <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Download className="w-3 h-3 mr-1.5" />Export CSV</Button>
          </SToolbar>
          <div className="card-elevated rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Date/Time', 'Customer', 'Event', 'Method', 'Details'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
              </tr></thead>
              <tbody>{accessLog.filter(e => (!search || e.customer.toLowerCase().includes(search.toLowerCase())) && (eventFilter === 'all' || e.eventType === eventFilter) && (methodFilter === 'all' || e.method === methodFilter)).map(evt => (
                <tr key={evt.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium whitespace-nowrap">{evt.date}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{evt.customer}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={evt.eventType} /></td>
                  <td className="px-4 py-2.5"><StatusBadge status={evt.method.replace(/_/g, ' ')} /></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium max-w-64 truncate">{evt.details}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}
      </div>
    </>
  );
}

// ============================================================
// REPORTS VIEW
// ============================================================
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

function ReportsView() {
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

// ============================================================
// AI DASHBOARD VIEW
// ============================================================
const MOCK_CALLS = [
  { id: 'CL01', date: 'Mar 21, 2:05 PM', caller: 'John Smith', direction: 'inbound' as const, agent: 'Inbound Agent', duration: '1:05', disposition: 'booked' as const, sentiment: 'positive' as const, cost: 0.42, revenue: 45, summary: 'Called to book a pickleball court for Saturday at 2pm. AI checked availability, quoted $45/hour with member discount, created booking for Court 3.' },
  { id: 'CL02', date: 'Mar 21, 1:30 PM', caller: 'Unknown (+1 647-555-1234)', direction: 'inbound' as const, agent: 'Inbound Agent', duration: '0:42', disposition: 'answered_question' as const, cost: 0.18, sentiment: 'neutral' as const, summary: 'Asked about facility hours and pickleball court availability this weekend. AI provided operating hours and directed to online booking.' },
  { id: 'CL03', date: 'Mar 21, 12:00 PM', caller: 'Lisa Park', direction: 'outbound' as const, agent: 'Payment Failure', duration: '0:55', disposition: 'left_message' as const, cost: 0.24, sentiment: 'neutral' as const, summary: 'Outbound call regarding failed Gold Membership payment. Customer did not answer. Left voicemail with payment update instructions.' },
  { id: 'CL04', date: 'Mar 21, 11:15 AM', caller: 'Emma Singh', direction: 'inbound' as const, agent: 'Inbound Agent', duration: '2:10', disposition: 'booked' as const, sentiment: 'positive' as const, cost: 0.68, revenue: 90, summary: 'Wanted to book 2 hours of pickleball for a group. AI booked Court 2 for 2 hours, sent payment link for $90.' },
  { id: 'CL05', date: 'Mar 21, 10:30 AM', caller: 'Mike Russo', direction: 'inbound' as const, agent: 'Inbound Agent', duration: '0:38', disposition: 'transferred' as const, cost: 0.15, sentiment: 'neutral' as const, summary: 'Called about corporate account billing question. AI could not resolve, transferred to front desk.' },
  { id: 'CL06', date: 'Mar 20, 8:00 PM', caller: 'Unknown (+1 905-555-9876)', direction: 'inbound' as const, agent: 'Inbound Agent', duration: '0:15', disposition: 'abandoned' as const, cost: 0.05, sentiment: 'negative' as const, summary: 'Caller hung up after 15 seconds. AI greeted but caller disconnected immediately.' },
  { id: 'CL07', date: 'Mar 20, 6:30 PM', caller: 'Brandon Fisher', direction: 'outbound' as const, agent: 'Booking Reminder', duration: '0:22', disposition: 'booked' as const, cost: 0.09, sentiment: 'positive' as const, summary: 'Reminder call for tomorrow morning tennis booking. Customer confirmed attendance.' },
  { id: 'CL08', date: 'Mar 20, 5:00 PM', caller: 'Rachel Gomez', direction: 'inbound' as const, agent: 'Inbound Agent', duration: '1:30', disposition: 'booked' as const, sentiment: 'positive' as const, cost: 0.55, revenue: 45, summary: 'Called to cancel Thursday booking and rebook for Friday. AI processed cancellation, issued account credit, and created new booking.' },
  { id: 'CL09', date: 'Mar 20, 3:15 PM', caller: 'Walk-in Inquiry', direction: 'inbound' as const, agent: 'Inbound Agent', duration: '0:50', disposition: 'answered_question' as const, cost: 0.22, sentiment: 'positive' as const, summary: 'Asked about program enrollment for PB Beginner Clinic. AI provided details, pricing, and directed to online registration.' },
  { id: 'CL10', date: 'Mar 20, 1:00 PM', caller: 'David Wright', direction: 'outbound' as const, agent: 'Marketing Agent', duration: '0:30', disposition: 'left_message' as const, cost: 0.12, sentiment: 'neutral' as const, summary: 'Win-back call to lapsed customer. No answer. Left voicemail with 20% off promo code.' },
];

function AIDashboardView() {
  const [tab, setTab] = useState('Analytics');
  const [dateRange, setDateRange] = useState('Today');
  const [selectedCall, setSelectedCall] = useState<typeof MOCK_CALLS[0] | null>(null);
  const [search, setSearch] = useState('');
  return (
    <>
      <SPageHeader title="AI Dashboard"><Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern"><Settings className="w-3.5 h-3.5 mr-1.5" />Configure AI</Button></SPageHeader>
      <STabBar tabs={['Analytics', 'Call Log', 'Chat Log', 'Configuration']} active={tab} onChange={setTab} />
      <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        {tab === 'Call Log' && (<>
          <SToolbar>
            <SSearchInput placeholder="Search calls..." value={search} onChange={setSearch} />
            <SFilterPill label="All" active={true} onClick={() => {}} />
            <SFilterPill label="Inbound" active={false} onClick={() => {}} />
            <SFilterPill label="Outbound" active={false} onClick={() => {}} />
            <SFilterPill label="All Dispositions" active={false} onClick={() => {}} />
            <div className="flex-1" />
            <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Download className="w-3 h-3 mr-1.5" />Export</Button>
          </SToolbar>
          <div className="card-elevated rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Date/Time', 'Caller', 'Dir', 'Agent', 'Duration', 'Disposition', 'Sent.', 'Cost', 'Revenue', 'Summary'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-3 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
              </tr></thead>
              <tbody>{MOCK_CALLS.filter(c => !search || c.caller.toLowerCase().includes(search.toLowerCase())).map(call => (
                <tr key={call.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedCall(call)}>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium whitespace-nowrap">{call.date}</td>
                  <td className="px-3 py-2.5 text-sm font-medium max-w-32 truncate">{call.caller}</td>
                  <td className="px-3 py-2.5">{call.direction === 'inbound' ? <PhoneIncoming className="w-3.5 h-3.5 text-blue-500" /> : <PhoneOutgoing className="w-3.5 h-3.5 text-gray-400" />}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium">{call.agent}</td>
                  <td className="px-3 py-2.5 text-sm font-medium tabular-nums">{call.duration}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={call.disposition} /></td>
                  <td className="px-3 py-2.5"><div className={`w-2.5 h-2.5 rounded-full ${call.sentiment === 'positive' ? 'bg-green-500' : call.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`} /></td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium tabular-nums">${call.cost.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-sm font-medium tabular-nums">{call.revenue ? `$${call.revenue}` : '—'}</td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground font-medium max-w-40 truncate">{call.summary}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}
        {tab === 'Analytics' && (<>
          <div className="flex items-center gap-2">
            {['Today', '7 Days', '30 Days', 'This Month'].map(r => (
              <button key={r} onClick={() => setDateRange(r)} className={`h-7 px-3 rounded-md text-[11px] font-bold transition-colors ${dateRange === r ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{r}</button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            <SMetricCard label="Calls Today" value="24" trend="↑ 20% vs yesterday" trendUp={true} />
            <SMetricCard label="Revenue Today" value="$1,850" trend="↑ 15%" trendUp={true} />
            <SMetricCard label="Avg Duration" value="1:42" />
            <SMetricCard label="Resolution Rate" value="89%" trend="↑ 3%" trendUp={true} />
          </div>
          <div className="card-elevated rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">AI Revenue — This Month</div>
                <div className="text-3xl font-bold mt-1">$12,400</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2"><span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">ROI 340%</span></div>
                <div className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-600" />↑ 18% vs last month</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-elevated rounded-lg p-4">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Call Volume by Hour</div>
              <div className="flex items-end gap-1 h-24">
                {[1, 2, 3, 5, 8, 12, 10, 15, 14, 12, 18, 20, 16, 14, 22, 24, 20, 18, 15, 10, 8, 5, 3, 1].map((v, i) => (
                  <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors" style={{ height: `${(v / 24) * 100}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-muted-foreground font-medium"><span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>12AM</span></div>
            </div>
            <div className="card-elevated rounded-lg p-4">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Disposition Breakdown</div>
              <div className="space-y-2">
                {[{ label: 'Booked', pct: 42, color: 'bg-green-500' }, { label: 'Answered Question', pct: 28, color: 'bg-blue-500' }, { label: 'Left Message', pct: 15, color: 'bg-gray-400' }, { label: 'Transferred', pct: 10, color: 'bg-orange-500' }, { label: 'Abandoned', pct: 5, color: 'bg-red-500' }].map(d => (
                  <div key={d.label} className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${d.color} shrink-0`} />
                    <span className="text-xs font-medium w-32">{d.label}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} /></div>
                    <span className="text-xs font-bold tabular-nums w-8 text-right">{d.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SMetricCard label="Booking Conversion" value="32%" trend="↑ 4% vs last month" trendUp={true} />
            <SMetricCard label="Transfer Rate" value="8%" trend="↓ 2%" trendUp={true} />
            <SMetricCard label="Positive Sentiment" value="92%" trend="↑ 1%" trendUp={true} />
          </div>
        </>)}
        {tab === 'Chat Log' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"><MessageCircle className="w-7 h-7 text-primary" /></div>
            <h3 className="text-lg font-bold mb-2">Chat Log</h3>
            <p className="text-sm text-muted-foreground font-medium mb-3">Chat log coming in Phase 2</p>
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5">Phase 2</Badge>
          </div>
        )}
        {tab === 'Configuration' && (
          <div className="max-w-2xl space-y-6">
            <div className="card-elevated rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between"><div className="text-sm font-bold">Agent Status</div><Switch defaultChecked /></div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span className="text-sm font-medium">Active</span><span className="text-xs text-muted-foreground font-medium ml-2">Last call: Mar 21, 2:05 PM</span></div>
            </div>
            <div className="card-elevated rounded-lg p-4 space-y-3">
              <div className="text-sm font-bold">Greeting</div>
              <textarea className="w-full h-20 px-3 py-2 text-sm font-medium border border-border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" defaultValue="Hi, you've reached Kings Court Markham. I'm an AI assistant and this call may be recorded. How can I help you today?" />
            </div>
            <div className="card-elevated rounded-lg p-4 space-y-3">
              <div className="text-sm font-bold">Call Routing</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Transfer Number</label><input type="text" className="w-full h-8 px-3 text-sm font-medium select-modern" defaultValue="+1 (416) 555-0001" /></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Ring Timeout</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>30 seconds</option><option>45 seconds</option><option>60 seconds</option></select></div>
              </div>
            </div>
            <div className="card-elevated rounded-lg p-4 space-y-3">
              <div className="text-sm font-bold">Call Limits</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Concurrent Calls</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></div>
                <div><label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Max Duration</label><select className="w-full h-8 px-3 text-sm font-medium select-modern"><option>5 minutes</option><option selected>10 minutes</option><option>15 minutes</option></select></div>
              </div>
            </div>
            <div className="card-elevated rounded-lg p-4 space-y-3">
              <div className="text-sm font-bold">Capabilities</div>
              <div className="grid grid-cols-2 gap-2">
                {['Check availability', 'Create bookings', 'Cancel bookings', 'Modify/reschedule', 'Process payments', 'Send payment links', 'Apply promo codes', 'Program inquiries', 'League inquiries', 'Create customer accounts', 'Update caller info', 'Answer FAQs'].map(cap => (
                  <div key={cap} className="flex items-center gap-2">
                    <Switch defaultChecked className="scale-75" />
                    <span className="text-sm font-medium">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card-elevated rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between"><div className="text-sm font-bold">Knowledge Base</div><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern"><Plus className="w-3 h-3 mr-1" />Add FAQ</Button></div>
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {['Question', 'Answer', 'Category', 'Active'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-3 py-2 bg-card">{h}</th>)}
                </tr></thead>
                <tbody>
                  {[{ q: 'What are your hours?', a: 'We are open Mon–Fri 8AM–10PM, Sat–Sun 7AM–10PM.', cat: 'General', active: true }, { q: 'Do you have parking?', a: 'Yes, free parking is available in the lot behind the building.', cat: 'Location', active: true }, { q: 'Can I rent equipment?', a: 'Yes! We have paddles, ball hoppers, and more available for rent at the front desk.', cat: 'Amenities', active: true }, { q: 'What is your cancellation policy?', a: 'Cancellations must be made 24 hours before the booking. Late cancellations incur a 50% fee.', cat: 'Policies', active: true }, { q: 'Do you offer memberships?', a: 'Yes, we offer Gold ($99/mo) and Silver ($59/mo) memberships with booking discounts.', cat: 'Pricing', active: true }].map((faq, i) => (
                    <tr key={i} className="border-b border-border/50"><td className="px-3 py-2 text-sm font-medium">{faq.q}</td><td className="px-3 py-2 text-xs text-muted-foreground font-medium max-w-48 truncate">{faq.a}</td><td className="px-3 py-2"><StatusBadge status={faq.cat.toLowerCase()} /></td><td className="px-3 py-2"><Switch defaultChecked={faq.active} className="scale-75" /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Call Detail Panel — inline */}
      {selectedCall && (
        <div className="w-full md:w-[520px] absolute md:relative inset-0 md:inset-auto z-20 md:z-auto border-l shrink-0 flex flex-col overflow-hidden panel-glass animate-in slide-in-from-right-5 duration-200">
            <div className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2"><h3 className="text-sm font-bold">Call Details</h3><StatusBadge status={selectedCall.direction} /><StatusBadge status={selectedCall.disposition} /></div>
              <div className="flex items-center gap-1">
                <button onClick={() => { const idx = MOCK_CALLS.findIndex(c => c.id === selectedCall.id); if (idx > 0) setSelectedCall(MOCK_CALLS[idx - 1]); }} className={`p-1 rounded hover:bg-muted ${MOCK_CALLS.findIndex(c => c.id === selectedCall.id) === 0 ? "opacity-30 pointer-events-none" : ""}`}><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => { const idx = MOCK_CALLS.findIndex(c => c.id === selectedCall.id); if (idx < MOCK_CALLS.length - 1) setSelectedCall(MOCK_CALLS[idx + 1]); }} className={`p-1 rounded hover:bg-muted ${MOCK_CALLS.findIndex(c => c.id === selectedCall.id) === MOCK_CALLS.length - 1 ? "opacity-30 pointer-events-none" : ""}`}><ChevronRight className="w-4 h-4" /></button>
                <button onClick={() => setSelectedCall(null)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Caller</div><div className="text-sm font-bold mt-1">{selectedCall.caller}</div></div>
                <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Duration</div><div className="text-sm font-bold mt-1">{selectedCall.duration}</div></div>
                <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Cost</div><div className="text-sm font-bold mt-1">${selectedCall.cost.toFixed(2)}</div></div>
                <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Date</div><div className="text-sm font-medium mt-1">{selectedCall.date}</div></div>
              </div>
              <div className="h-px bg-border" />
              <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">AI Intelligence Summary</div><p className="text-sm font-medium mt-1">{selectedCall.summary}</p></div>
              <div className="h-px bg-border" />
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Actions Taken</div>
                <div className="space-y-2">
                  {[{ t: '0:00', action: 'Call started', detail: `${selectedCall.direction === 'inbound' ? 'Inbound' : 'Outbound'} — ${selectedCall.caller}` }, { t: '0:03', action: 'Greeting delivered', detail: 'AI identified intent' }, { t: '0:15', action: 'Checked availability', detail: 'Queried booking system' }, { t: '0:30', action: selectedCall.disposition === 'booked' ? 'Created booking' : 'Provided information', detail: selectedCall.disposition === 'booked' ? 'Booking confirmed' : 'Answered customer query' }, { t: selectedCall.duration, action: 'Call completed', detail: `Duration: ${selectedCall.duration}` }].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground font-medium w-8 shrink-0 pt-0.5">{step.t}</span>
                      <div><div className="text-xs font-bold">{step.action}</div><div className="text-xs text-muted-foreground font-medium">{step.detail}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedCall.revenue && (<>
                <div className="h-px bg-border" />
                <div>
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Revenue Attribution</div>
                  <div className="card-elevated rounded-lg p-3 flex justify-between items-center">
                    <span className="text-sm font-medium">Court Booking</span>
                    <span className="text-sm font-bold">${selectedCall.revenue}</span>
                  </div>
                </div>
              </>)}
              <div className="h-px bg-border" />
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Call Recording</div>
                <div className="card-elevated rounded-lg p-3 flex items-center gap-3">
                  <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Play className="w-3.5 h-3.5 text-primary ml-0.5" /></button>
                  <div className="flex-1 h-1 bg-muted rounded-full"><div className="w-0 h-full bg-primary rounded-full" /></div>
                  <span className="text-xs text-muted-foreground font-medium tabular-nums">0:00 / {selectedCall.duration}</span>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Transcript</div>
                <div className="card-elevated rounded-lg p-3 space-y-2 text-xs font-medium">
                  <div><span className="font-bold text-primary">AI:</span> Hi, you&apos;ve reached Kings Court Markham. I&apos;m an AI assistant. How can I help you today?</div>
                  <div><span className="font-bold">Caller:</span> Hi, I&apos;d like to book a pickleball court.</div>
                  <div><span className="font-bold text-primary">AI:</span> I&apos;d be happy to help you book a pickleball court. When would you like to play?</div>
                  <div><span className="font-bold">Caller:</span> This Saturday afternoon, maybe around 2pm?</div>
                  <div><span className="font-bold text-primary">AI:</span> Let me check availability... I have Court 3 available Saturday at 2pm. The rate is $45 per hour. Would you like me to book that for you?</div>
                </div>
              </div>
            </div>
        </div>
      )}
      </div>
    </>
  );
}

// ============================================================
// SETTINGS VIEW
// ============================================================
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

function SettingsView() {
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
