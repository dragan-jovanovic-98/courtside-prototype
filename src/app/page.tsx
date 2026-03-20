"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Home, CalendarDays, Users, CreditCard, GraduationCap, Trophy,
  UserCog, ShoppingBag, MessageSquare, DoorOpen, BarChart3, Bot,
  Settings, ChevronLeft, ChevronRight, CheckCircle2, Calendar, List, SlidersHorizontal, Search, ChevronDown, X, MoreHorizontal, PanelLeftClose, PanelLeft,
} from "lucide-react";

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
const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'courts', label: 'Courts', icon: CalendarDays },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'programs', label: 'Programs', icon: GraduationCap },
  { id: 'leagues', label: 'Leagues', icon: Trophy },
  { id: 'staff', label: 'Staff', icon: UserCog },
  { id: 'pos', label: 'POS', icon: ShoppingBag },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'access', label: 'Access', icon: DoorOpen },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'ai', label: 'AI', icon: Bot },
];

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
  const SLOT_HEIGHT = gridHeight > 0 ? Math.max(MIN_SLOT_HEIGHT, Math.floor(gridHeight / operatingSlots) - 1) : 20;
  const HOUR_HEIGHT = SLOT_HEIGHT * 2;

  // Auto-scroll to facility operating hours on load
  useEffect(() => {
    requestAnimationFrame(() => {
      if (gridScrollRef.current && activeTab === 'schedule' && scheduleView === 'day') {
        gridScrollRef.current.scrollTop = FACILITY_OPEN_HOUR * HOUR_HEIGHT - 4;
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <TooltipProvider delay={0}>
      <aside className={`${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'} shrink-0 border-r bg-card flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-14 flex items-center border-b px-3">
          {sidebarCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <Image src="/COURTSIDE AI logo only v2 Transparent.svg" alt="Courtside AI" width={28} height={28} className="h-7 w-7" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Image src="/COURTSIDE AI logo only v2 Transparent.svg" alt="Courtside AI" width={28} height={28} className="h-7 w-7 shrink-0" />
              <span className="text-[15px] font-bold text-foreground tracking-tight">Courtside AI</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2.5 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            const btn = (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-2.5 py-2.5 rounded-md text-sm transition-colors ${
                  active ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
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
        </nav>

        {/* Collapse / Expand toggle */}
        <div className="border-t border-border/50 px-2 py-1.5">
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex justify-center">
                  <button onClick={() => setSidebarCollapsed(false)}
                    className="h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <PanelLeft className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs font-semibold">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={() => setSidebarCollapsed(true)}
              className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <PanelLeftClose className="h-[18px] w-[18px] shrink-0" />
              Collapse sidebar
            </button>
          )}
        </div>

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
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-md text-sm transition-colors ${
                  activeNav === 'settings' ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
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
        <div className="h-[3px] bg-primary shrink-0" />

        {/* ===== HOME PAGE ===== */}
        {activeNav === 'home' && <>
        {/* Top bar — Schedule / Dashboard toggle */}
        <div className="h-14 border-b bg-card shrink-0 flex items-center px-6">
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            {(['schedule', 'dashboard'] as const).map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold transition-colors ${i > 0 ? 'border-l border-border' : ''}
                  ${activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                {tab === 'schedule' ? 'Schedule' : 'Dashboard'}
              </button>
            ))}
          </div>
        </div>

        {/* ===== SCHEDULE TAB ===== */}
        {activeTab === 'schedule' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* View toggle + date + filters */}
            <div className="shrink-0 border-b bg-card px-6 h-12 flex items-center justify-between">
              {/* Left: view toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                  {(['day', 'week', 'month', 'list'] as const).map((view, vi) => (
                    <button key={view} onClick={() => setScheduleView(view)}
                      className={`px-4 py-1.5 text-sm font-medium transition-colors ${vi > 0 ? 'border-l border-border' : ''}
                        ${scheduleView === view ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                      {view === 'day' ? 'Day' : view === 'week' ? 'Week' : view === 'month' ? 'Month' : 'List'}
                    </button>
                  ))}
                </div>
                <Button size="sm" className="h-8 text-xs font-semibold px-3">+ New Booking</Button>
              </div>
              {/* Right: date controls + search + filters */}
              <div className="flex items-center gap-2">
                {scheduleView === 'list' && (
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Search..." className="h-7 pl-8 pr-3 rounded-md border border-border bg-background text-sm w-40 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                )}
                {scheduleView === 'day' && (
                  <div className="flex items-center gap-1">
                    <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-muted transition-colors">
                      <span className="text-sm font-semibold text-foreground">FRIDAY, MARCH 20, 2026</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                )}
                {scheduleView === 'week' && (
                  <div className="flex items-center gap-1">
                    <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-muted transition-colors">
                      <span className="text-sm font-semibold text-foreground">MAR 16 — MAR 22, 2026</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                )}
                {scheduleView === 'month' && (
                  <div className="flex items-center gap-1">
                    <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-muted transition-colors">
                      <span className="text-sm font-semibold text-foreground">MARCH 2026</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                )}
                {scheduleView === 'list' && (
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-muted transition-colors">
                    <span className="text-sm font-semibold text-foreground">MAR 20 — MAY 14, 2026</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-sm text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </button>
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
                          <div key={i} className={`py-1.5 px-1.5 text-center ${borderClass} ${isInMultiGroup ? 'bg-muted/60' : ''}`}>
                            <p className="text-[13px] font-bold leading-tight">{court.name}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight">
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
                              {i > 0 && <div className="border-t border-border/70" />}
                              <div className="border-t border-dotted border-border/25" style={{ marginTop: i > 0 ? SLOT_HEIGHT - 1 : SLOT_HEIGHT }} />
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 pointer-events-none flex">
                          {courts.map((_, i) => <div key={i} className={`flex-1 ${i < courts.length - 1 ? 'border-r border-border/50' : ''}`} />)}
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
                                <div key={`closed-${ri}`} className="absolute left-0 right-0 z-[2] group cursor-default flex items-center justify-center bg-foreground/[0.18] border border-foreground/15" style={{ top: range.start * SLOT_HEIGHT, height: (range.end - range.start) * SLOT_HEIGHT }}>
                                  <span className="hidden group-hover:block text-xs text-muted-foreground font-semibold select-none tracking-wider uppercase bg-background/70 px-3 py-1 rounded shadow-sm">Closed</span>
                                </div>
                              ))}
                              {/* Dependency lockout — solid gray like unavailable */}
                              {mergedLockouts.map((lr, li) => (
                                <div key={`lock-${li}`} className="absolute left-0 right-0 z-[3] bg-foreground/[0.12] border-y border-foreground/10 cursor-not-allowed group/lk flex items-center justify-center"
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
                                if (unbookable) return <div key={si} className="absolute left-0 right-0 bg-foreground/[0.12] border-y border-foreground/10 cursor-not-allowed group/ub flex items-center justify-center z-[2]" style={{ top: si * SLOT_HEIGHT, height: SLOT_HEIGHT }}><span className="hidden group-hover/ub:block text-[10px] text-muted-foreground font-semibold select-none bg-background/70 px-2 py-0.5 rounded">Too short</span></div>;
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
                  <div className="w-80 border-l bg-card shrink-0 flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-right-5 duration-200">
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
              <div className="w-72 border-l bg-card shrink-0 flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-right-5 duration-200">
                <DetailPanel b={selectedBooking} cn={selectedCourt} vsh={vsh} onClose={() => { setSelectedBooking(null); setSelectedCourt(''); }} />
              </div>
            )}
            </div>
          </div>
        )}

        {/* ===== DASHBOARD TAB ===== */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1100px] mx-auto px-5 py-5 space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <MCard title="Revenue Today" value="$2,450" change="+12%" positive />
                <MCard title="Bookings" value="34" change="+5 vs last Wed" positive />
                <MCard title="Court Utilization" value="72%" change="+4%" positive />
                <MCard title="RevPACH" value="$48/hr" change="+$3" positive />
                <MCard title="AI Revenue" value="$340" change="+8%" positive />
              </div>

              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />Attention Required
                  </CardTitle>
                  <CardDescription>3 items need your attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AItem s="high" t="1 Unpaid Booking — Sarah L. on Court 1" />
                  <AItem s="medium" t="1 Pending Payment — Lisa P. on Court 2" />
                  <AItem s="info" t="2 AI Escalations — need follow-up" />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base">AI Performance</CardTitle><CardDescription>Last 7 days</CardDescription></CardHeader>
                  <CardContent><div className="divide-y">
                    <DRow l="Calls Handled" v="87" /><DRow l="AI Revenue" v="$2,340" hl="primary" /><DRow l="Resolution Rate" v="89%" /><DRow l="AI ROI" v="5,370%" hl="success" />
                  </div></CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base">Today&apos;s Summary</CardTitle><CardDescription>Wednesday, March 19</CardDescription></CardHeader>
                  <CardContent><div className="divide-y">
                    <DRow l="Total Bookings" v="34" /><DRow l="Checked In" v="1 of 34" /><DRow l="Revenue Collected" v="$2,205" /><DRow l="Outstanding" v="$245" hl="warning" />
                  </div></CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base">Next Up</CardTitle><CardDescription>Upcoming bookings</CardDescription></CardHeader>
                <CardContent><div className="divide-y">
                  <URow time="10:30 AM" name="Alex M." court="Court 1" type="Member" status="paid" />
                  <URow time="11:00 AM" name="Sarah L." court="Court 1" type="Standard" status="unpaid" />
                  <URow time="11:00 AM" name="PB Clinic" court="Court 2" type="Program" status="paid" />
                  <URow time="11:30 AM" name="Chris B." court="Court 4" type="Standard" status="paid" />
                </div></CardContent>
              </Card>
            </div>
          </div>
        )}

        </>}

        {/* ===== COURTS MANAGEMENT PAGE ===== */}
        {activeNav === 'courts' && (() => {
          const courtData = [
            { name: 'Court 1', sport: 'Pickleball', surface: 'Hardwood', status: 'Active' as const, rate: 30, bookings: 34, bkgDelta: +6, utilization: 78, utilDelta: +4, indoor: true, revWeek: 1020, capacity: 4, amenities: 'Nets, Lighting' },
            { name: 'Court 2', sport: 'Pickleball', surface: 'Hardwood', status: 'Active' as const, rate: 30, bookings: 28, bkgDelta: -2, utilization: 65, utilDelta: -1, indoor: true, revWeek: 840, capacity: 4, amenities: 'Nets, Lighting' },
            { name: 'Court 3', sport: 'Pickleball', surface: 'Hardwood', status: 'Active' as const, rate: 30, bookings: 31, bkgDelta: +3, utilization: 72, utilDelta: +2, indoor: true, revWeek: 930, capacity: 4, amenities: 'Nets, Lighting' },
            { name: 'Court 4', sport: 'Tennis', surface: 'Hardcourt', status: 'Active' as const, rate: 45, bookings: 22, bkgDelta: +2, utilization: 58, utilDelta: +3, indoor: true, revWeek: 990, capacity: 4, amenities: 'Net, Lighting, Scoreboard', split: 'Splits → Court 4A, 4B' },
            { name: 'Court 4A', sport: 'Pickleball', surface: 'Hardcourt', status: 'Active' as const, rate: 30, bookings: 18, bkgDelta: +5, utilization: 45, utilDelta: +7, indoor: true, revWeek: 540, capacity: 4, amenities: 'Nets', parent: 'Sub of Court 4' },
            { name: 'Court 4B', sport: 'Pickleball', surface: 'Hardcourt', status: 'Active' as const, rate: 30, bookings: 15, bkgDelta: +2, utilization: 40, utilDelta: +5, indoor: true, revWeek: 450, capacity: 4, amenities: 'Nets', parent: 'Sub of Court 4' },
            { name: 'Court 5', sport: 'Tennis', surface: 'Hardcourt', status: 'Active' as const, rate: 45, bookings: 26, bkgDelta: -1, utilization: 68, utilDelta: -2, indoor: true, revWeek: 1170, capacity: 4, amenities: 'Net, Lighting, Scoreboard' },
            { name: 'Court 6', sport: 'Basketball / Volleyball', surface: 'Hardwood', status: 'Active' as const, rate: 60, bookings: 20, bkgDelta: +4, utilization: 55, utilDelta: +3, indoor: true, revWeek: 1200, capacity: 12, amenities: 'Hoops, Net, Scoreboard', hours: 'Closes 8:00 PM' },
          ];
          const sc = selectedCourtIdx !== null ? courtData[selectedCourtIdx] : null;
          return (
          <>
            <div className="h-14 border-b bg-card shrink-0 flex items-center justify-between px-6">
              <h1 className="text-base font-bold text-foreground">Courts</h1>
              <Button size="sm" className="h-8 text-xs font-semibold px-4">+ Add Court</Button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Court cards */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {courtData.map((court, i) => (
                    <div key={i} onClick={() => { setSelectedCourtIdx(i); setCourtTab('overview'); }}
                      className={`border rounded-lg bg-card hover:shadow-md transition-all cursor-pointer group ${selectedCourtIdx === i ? 'border-primary ring-1 ring-primary/30' : 'border-border hover:border-primary/30'}`}>
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
                            <p className="text-[10px] text-muted-foreground">Base Rate</p>
                            <p className="text-sm font-bold">${court.rate}/hr</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">This Week</p>
                            <p className="text-sm font-bold">{court.bookings} <span className={`text-[10px] font-semibold ${court.bkgDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>{court.bkgDelta >= 0 ? '↑' : '↓'}{Math.abs(court.bkgDelta)}</span></p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Utilization</p>
                            <p className="text-sm font-bold">{court.utilization}% <span className={`text-[10px] font-semibold ${court.utilDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>{court.utilDelta >= 0 ? '↑' : '↓'}{Math.abs(court.utilDelta)}%</span></p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-[11px] font-semibold" onClick={(e) => { e.stopPropagation(); setSelectedCourtIdx(i); setCourtTab('overview'); }}>Details</Button>
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-[11px] font-semibold" onClick={(e) => { e.stopPropagation(); setSelectedCourtIdx(i); setCourtTab('pricing'); }}>Pricing</Button>
                          <Button size="sm" variant="outline" className="flex-1 h-7 text-[11px] font-semibold" onClick={(e) => { e.stopPropagation(); setSelectedCourtIdx(i); setCourtTab('rules'); }}>Rules</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right-side detail panel */}
              {sc !== null && (
                <div className="w-[520px] border-l bg-card shrink-0 flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-right-5 duration-200">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 h-12 border-b shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-bold">{sc.name}</h3>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-semibold rounded-[3px] bg-primary/10 text-primary border-primary/25">{sc.status}</Badge>
                    </div>
                    <button onClick={() => setSelectedCourtIdx(null)} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <X className="h-4 w-4" />
                    </button>
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
                        {/* Quick metrics */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="border border-border rounded-md p-3"><p className="text-[10px] text-muted-foreground">Bookings</p><p className="text-lg font-bold">{sc.bookings} <span className={`text-xs ${sc.bkgDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>{sc.bkgDelta >= 0 ? '↑' : '↓'}{Math.abs(sc.bkgDelta)}</span></p></div>
                          <div className="border border-border rounded-md p-3"><p className="text-[10px] text-muted-foreground">Utilization</p><p className="text-lg font-bold">{sc.utilization}% <span className={`text-xs ${sc.utilDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>{sc.utilDelta >= 0 ? '↑' : '↓'}{Math.abs(sc.utilDelta)}%</span></p></div>
                          <div className="border border-border rounded-md p-3"><p className="text-[10px] text-muted-foreground">Revenue</p><p className="text-lg font-bold">${sc.revWeek.toLocaleString()}</p></div>
                          <div className="border border-border rounded-md p-3"><p className="text-[10px] text-muted-foreground">Base Rate</p><p className="text-lg font-bold">${sc.rate}/hr</p></div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Editable fields */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Court Details</p>
                          <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Name</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={sc.name} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Sport</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={sc.sport} /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Surface</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={sc.surface} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Capacity</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={String(sc.capacity)} /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Environment</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={sc.indoor ? 'Indoor' : 'Outdoor'} /></div>
                          </div>
                          <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Amenities</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={sc.amenities} /></div>
                          {sc.split && <div className="bg-primary/5 border border-primary/15 rounded-md p-2.5"><p className="text-[11px] font-semibold text-primary">{sc.split}</p></div>}
                          {sc.parent && <div className="bg-primary/5 border border-primary/15 rounded-md p-2.5"><p className="text-[11px] font-semibold text-primary">{sc.parent}</p></div>}
                        </div>

                        <div className="h-px bg-border" />
                        <div className="border-2 border-dashed border-border rounded-lg h-24 flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">Drop photos or click to upload</p>
                        </div>
                      </div>
                    )}

                    {courtTab === 'pricing' && (
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Base Rate</p>
                          <input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm font-bold" defaultValue={`$${sc.rate}/hr`} />
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Time-of-Day Pricing</p>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] font-semibold px-2">+ Add</Button>
                          </div>
                          <div className="border border-border rounded-md divide-y">
                            {[
                              { window: '8 AM – 12 PM', label: 'Morning', rate: `$${sc.rate}`, mod: 'Base' },
                              { window: '12 PM – 5 PM', label: 'Afternoon', rate: `$${Math.round(sc.rate * 1.2)}`, mod: '+20%' },
                              { window: '5 PM – 10 PM', label: 'Prime', rate: `$${Math.round(sc.rate * 1.5)}`, mod: '+50%' },
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
                            <Button size="sm" variant="outline" className="h-6 text-[10px] font-semibold px-2">+ Add</Button>
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

                        <div className="bg-muted/50 border border-border rounded-md p-3">
                          <p className="text-[10px] font-bold mb-0.5">Pricing Cascade</p>
                          <p className="text-[10px] text-muted-foreground">Court rate → Tag modifier → Seasonal → Promo</p>
                        </div>
                      </div>
                    )}

                    {courtTab === 'rules' && (
                      <div className="p-5 space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Booking Windows</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Max Advance</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="30 days" /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Min Notice</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="1 hour" /></div>
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Duration & Buffers</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Min Duration</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="1 hour" /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Max Duration</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="3 hours" /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Granularity</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="30 min" /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Turnaround</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue="10 min" /></div>
                          </div>
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Access & Approval</p>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] font-semibold px-2">+ Add</Button>
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
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Cancellation</p>
                          <div className="border border-border rounded-md divide-y">
                            {[
                              { window: '> 24 hrs', policy: 'Full refund' },
                              { window: '12 – 24 hrs', policy: 'Credit' },
                              { window: '< 12 hrs', policy: 'No refund' },
                            ].map((c, ci) => (
                              <div key={ci} className="px-3 py-2.5 flex items-center justify-between">
                                <p className="text-xs">{c.window}</p>
                                <p className="text-xs font-semibold">{c.policy}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save button */}
                  <div className="border-t px-5 py-3 shrink-0">
                    <Button className="w-full h-9 text-[12px] font-semibold">Save Changes</Button>
                  </div>
                </div>
              )}
            </div>
          </>
          );
        })()}
      </div>
    </div>
  );
}

// ============================================================
// SMALL COMPONENTS
// ============================================================
function MCard({ title, value, change, positive }: { title: string; value: string; change: string; positive?: boolean }) {
  return <Card className="shadow-sm"><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">{title}</p><p className="text-2xl font-bold tracking-tight tabular-nums mt-0.5">{value}</p><p className={`text-xs font-medium mt-0.5 ${positive ? 'text-success' : 'text-destructive'}`}>{change}</p></CardContent></Card>;
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
      case 'paid': return 'bg-primary'; // teal — good condition
      case 'unpaid': return 'bg-destructive'; // red — needs action
      case 'pending': return 'bg-warning'; // amber — waiting
      case 'comp': return 'bg-foreground/25'; // subtle gray
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
      className={`absolute left-px right-px rounded-[2px] border transition-all cursor-pointer overflow-hidden z-10 group/block
        ${isMaint
          ? 'bg-foreground/[0.08] border-foreground/15 hover:bg-foreground/[0.12] text-muted-foreground'
          : 'bg-card border-border hover:shadow-sm text-foreground'
        } ${sel ? 'ring-2 ring-primary ring-offset-1' : ''}`}
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
            <p className="text-[10px] text-muted-foreground leading-tight group-hover/block:hidden">{dur}</p>
            <p className="text-[10px] text-muted-foreground leading-tight hidden group-hover/block:block font-medium">{tr}</p>
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

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-12 border-b shrink-0">
        <h3 className="text-[13px] font-bold text-foreground">Booking Details</h3>
        <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Identity */}
        <div className="px-5 py-4">
          <h4 className="text-[17px] font-bold leading-snug tracking-tight">{b.name}</h4>
          {linkLabel && (
            <button className="text-[11px] text-primary font-semibold hover:underline mt-1 inline-block">{linkLabel} →</button>
          )}
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

        {/* Booking info */}
        <div className="px-5 py-4 space-y-2.5">
          <DR l="Time" v={tr} />
          <DR l="Duration" v={dur} />
          <DR l="Court" v={cn} />
          <DR l="Amount" v={amount} />
          {b.source && <DR l="Source" v={b.source} />}
          {b.sport && <DR l="Sport" v={b.sport} />}
        </div>

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
        {b.players && (
          <>
            <div className="h-px bg-border mx-5" />
            <div className="px-5 py-4 space-y-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Players ({b.players.length})</p>
              {b.players.map((p, i) => <p key={i} className="text-[13px] text-foreground">{p}</p>)}
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
        {/* Primary action */}
        {b.payment === 'unpaid' && (
          <Button className="w-full h-9 text-[13px] font-semibold bg-destructive hover:bg-destructive/90 mb-2">Mark as Paid</Button>
        )}
        {b.checkedIn === false && b.payment === 'paid' && (
          <Button className="w-full h-9 text-[13px] font-semibold mb-2">Check In</Button>
        )}

        <Button className="w-full h-9 text-[12px] font-semibold" variant="outline">Edit Booking</Button>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <Button className="h-9 text-[12px] font-semibold" variant="outline">Extend</Button>
          <Button className="h-9 text-[12px] font-semibold" variant="outline">Reschedule</Button>
          <Button className="h-9 text-[12px] font-semibold border-destructive/30 text-destructive hover:bg-destructive/5" variant="outline">Cancel</Button>
        </div>

        {b.checkedIn === false && (
          <Button className="w-full h-9 text-[12px] font-semibold text-muted-foreground mt-2" variant="outline">No-show</Button>
        )}
      </div>
    </div>
  );
}
function DR({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[12px] text-muted-foreground">{l}</span>
      <span className="text-[13px] font-semibold text-foreground">{v}</span>
    </div>
  );
}
function LegendItem({ bgColor, borderColor, accentColor, label }: { bgColor: string; borderColor: string; accentColor: string; label: string }) {
  return <div className="flex items-center gap-1.5"><div className={`h-3.5 w-6 rounded-[2px] border ${bgColor} ${borderColor} relative overflow-hidden`}><div className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentColor}`} /></div><span className="text-[11px] text-muted-foreground font-medium">{label}</span></div>;
}
