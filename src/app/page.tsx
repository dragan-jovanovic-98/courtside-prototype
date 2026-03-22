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
import {
  Home, CalendarDays, Users, CreditCard, GraduationCap, Trophy,
  UserCog, ShoppingBag, MessageSquare, DoorOpen, BarChart3, Bot,
  Settings, ChevronLeft, ChevronRight, CheckCircle2, Calendar, List, SlidersHorizontal, Search, ChevronDown, X, MoreHorizontal, PanelLeftClose, PanelLeft,
  ArrowLeft, Phone, Mail, MapPin, Tag, Clock, TrendingUp, TrendingDown, Minus, DollarSign, Activity, FileText, ArrowUpDown, Filter, Download, UserPlus, Eye, Pencil, Send, Ban, Archive, Plus,
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
  const [bkFilter, setBkFilter] = useState<string>('all');
  const [bkCourtFilter, setBkCourtFilter] = useState<string>('all');

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
    <div className="h-screen flex bg-background overflow-hidden">
      {/* ===== SIDEBAR ===== */}
      <TooltipProvider delay={0}>
      <aside className={`${sidebarCollapsed ? 'w-[60px]' : 'w-[220px]'} shrink-0 border-r bg-card flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className="h-14 flex items-center border-b px-3">
          {sidebarCollapsed ? (
            <div className="flex items-center justify-center w-full">
              <img src="/courtside-logo.svg" alt="Courtside AI" width={28} height={28} className="h-7 w-7" />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Image src="/courtside-logo.svg" alt="Courtside AI" width={28} height={28} className="h-7 w-7 shrink-0" />
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
        {activeNav === 'home' && (<>
        {/* Top bar — Schedule / Dashboard toggle */}
        <div className="h-14 border-b bg-card shrink-0 flex items-center px-6">
          <div className="flex items-center border border-border rounded-md overflow-hidden">
            {(['schedule', 'dashboard'] as const).map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold transition-colors ${i > 0 ? 'border-l border-border' : ''}
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
            <div className="shrink-0 border-b bg-card px-6 h-12 flex items-center justify-between">
              {/* Left: view toggle */}
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                {(['day', 'week', 'month', 'list'] as const).map((view, vi) => (
                  <button key={view} onClick={() => setScheduleView(view)}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${vi > 0 ? 'border-l border-border' : ''}
                      ${scheduleView === view ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                    {view === 'day' ? 'Day' : view === 'week' ? 'Week' : view === 'month' ? 'Month' : 'List'}
                  </button>
                ))}
              </div>
              {/* Right: date controls + filters + new booking */}
              <div className="flex items-center gap-3">
                {scheduleView === 'list' && (
                  <div className="relative flex items-center">
                    <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Search..." className="h-8 pl-8 pr-3 rounded-md border border-border bg-background text-sm w-44 focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                )}
                {scheduleView === 'day' && (
                  <div className="flex items-center gap-0.5">
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <span className="text-sm font-semibold text-foreground">FRIDAY, MARCH 20, 2026</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                )}
                {scheduleView === 'week' && (
                  <div className="flex items-center gap-0.5">
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <span className="text-sm font-semibold text-foreground">MAR 16 — MAR 22, 2026</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                )}
                {scheduleView === 'month' && (
                  <div className="flex items-center gap-0.5">
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                      <span className="text-sm font-semibold text-foreground">MARCH 2026</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                )}
                {scheduleView === 'list' && (
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-muted transition-colors">
                    <span className="text-sm font-semibold text-foreground">MAR 20 — MAY 14, 2026</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )}
                <button className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border hover:bg-muted transition-colors text-xs font-semibold text-muted-foreground">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                </button>
                <Button size="sm" className="h-8 text-xs font-semibold px-4">+ New Booking</Button>
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
              <div className="w-80 border-l bg-card shrink-0 flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-right-5 duration-200">
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
            <div className="px-6 py-3 border-b bg-card flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-muted transition-colors">
                  <span className="text-sm font-semibold text-foreground">FRIDAY, MARCH 20, 2026</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button className="p-0.5 rounded hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-3">Walk-In</Button>
                <Button size="sm" className="h-8 text-xs font-semibold px-4">+ New Booking</Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Revenue Today', value: `$${dashTotalRevenue.toLocaleString()}`, change: '↑ 12% vs. last week', positive: true },
                  { label: 'Bookings Today', value: `${dashTotalBookings}`, change: '↑ 5 vs. last week', positive: true },
                  { label: 'Utilization', value: '72%', change: '↑ 4%', positive: true },
                  { label: 'RevPACH', value: '$48/hr', change: '↑ $3', positive: true },
                ].map((m, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 bg-card">
                    <p className="text-[11px] text-muted-foreground font-medium">{m.label}</p>
                    <p className="text-2xl font-bold mt-1 tabular-nums">{m.value}</p>
                    <p className={`text-xs font-medium mt-0.5 ${m.positive ? 'text-primary' : 'text-destructive'}`}>{m.change}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_420px] gap-6">
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
                        <select value={bkFilter} onChange={e => setBkFilter(e.target.value)} className="h-7 text-[11px] font-semibold rounded-md border border-border bg-background px-2 pr-6 appearance-none cursor-pointer"><option value="all">All Status</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="pending">Pending</option></select>
                        <select value={bkCourtFilter} onChange={e => setBkCourtFilter(e.target.value)} className="h-7 text-[11px] font-semibold rounded-md border border-border bg-background px-2 pr-6 appearance-none cursor-pointer"><option value="all">All Courts</option>{dashCourtUtil.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
                        {(bkFilter !== 'all' || bkCourtFilter !== 'all') && <button onClick={() => { setBkFilter('all'); setBkCourtFilter('all'); }} className="text-[11px] text-muted-foreground hover:text-foreground font-medium">Clear</button>}
                      </div>
                    </div>
                    {/* Column headers */}
                    <div className="grid grid-cols-[72px_2fr_1fr_1fr_1fr_80px] gap-x-4 px-4 py-2 border-b bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Time</span><span>Customer</span><span>Court</span><span>Duration</span><span className="text-right">Amount</span><span className="text-right">Status</span>
                    </div>
                    {dashUpcoming.length > 0 && (<><div className="px-4 py-1.5 bg-muted/30 border-b"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Upcoming ({dashUpcoming.length})</p></div>
                      <div className="divide-y">{dashUpcoming.map(b => {
                        const match = visibleBookings.find(vb => vb.name === b.customer);
                        return (
                        <div key={b.id} onClick={() => { if (match) { setSelectedBooking(match); setSelectedCourt(b.court); } }}
                          className={`grid grid-cols-[72px_2fr_1fr_1fr_1fr_80px] gap-x-4 px-4 py-2.5 items-center hover:bg-muted/30 transition-colors cursor-pointer ${selectedBooking && match && selectedBooking.id === match.id ? 'bg-primary/5' : ''}`}>
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">{b.time}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{b.customer}</span>
                          <span className="text-xs text-muted-foreground font-medium">{b.court}</span>
                          <span className="text-xs text-muted-foreground font-medium">{b.duration}</span>
                          <span className="text-sm font-semibold tabular-nums text-right">{b.amount > 0 ? `$${b.amount}` : 'Comp'}</span>
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
                          className={`grid grid-cols-[72px_2fr_1fr_1fr_1fr_80px] gap-x-4 px-4 py-2.5 items-center hover:bg-muted/30 transition-colors cursor-pointer opacity-60 ${selectedBooking && match && selectedBooking.id === match.id ? 'opacity-100 bg-primary/5' : ''}`}>
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">{b.time}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{b.customer}</span>
                          <span className="text-xs text-muted-foreground font-medium">{b.court}</span>
                          <span className="text-xs text-muted-foreground font-medium">{b.duration}</span>
                          <span className="text-sm font-semibold tabular-nums text-right">{b.amount > 0 ? `$${b.amount}` : 'Comp'}</span>
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
                        <div key={b.id} className="grid grid-cols-[72px_2fr_1fr_1fr_1fr_80px] gap-x-4 px-4 py-2.5 items-center hover:bg-muted/30 transition-colors cursor-pointer opacity-40">
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">{b.time}</span>
                          <span className="text-sm font-semibold text-foreground truncate">{b.customer}</span>
                          <span className="text-xs text-muted-foreground font-medium">{b.court}</span>
                          <span className="text-xs text-muted-foreground font-medium">{b.duration}</span>
                          <span className="text-sm font-semibold tabular-nums text-right">{b.amount > 0 ? `$${b.amount}` : 'Comp'}</span>
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
            <div className="w-80 border-l bg-card shrink-0 flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-right-5 duration-200">
              <DetailPanel b={selectedBooking} cn={selectedCourt} vsh={vsh} onClose={() => { setSelectedBooking(null); setSelectedCourt(''); }} />
            </div>
          )}
          </div>
        )}
        </>)}


        {/* ===== COURTS MANAGEMENT PAGE ===== */}
        {activeNav === 'courts' && (
          <>
            <div className="h-14 border-b bg-card shrink-0 flex items-center justify-between px-6">
              <h1 className="text-base font-bold text-foreground">Courts</h1>
              <Button size="sm" className="h-8 text-xs font-semibold px-4">+ Add Court</Button>
            </div>
            <div className="flex-1 flex overflow-hidden">
              {/* Court cards */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {courtMgmtData.map((court, i) => (
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
              {selectedCourtData !== null && (
                <div className="w-[520px] border-l bg-card shrink-0 flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-right-5 duration-200">
                  {/* Panel header */}
                  <div className="flex items-center justify-between px-5 h-12 border-b shrink-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-bold">{selectedCourtData.name}</h3>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-semibold rounded-[3px] bg-primary/10 text-primary border-primary/25">{selectedCourtData.status}</Badge>
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
                          <div className="border border-border rounded-md p-3"><p className="text-[10px] text-muted-foreground">Bookings</p><p className="text-lg font-bold">{selectedCourtData.bookings} <span className={`text-xs ${selectedCourtData.bkgDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>{selectedCourtData.bkgDelta >= 0 ? '↑' : '↓'}{Math.abs(selectedCourtData.bkgDelta)}</span></p></div>
                          <div className="border border-border rounded-md p-3"><p className="text-[10px] text-muted-foreground">Utilization</p><p className="text-lg font-bold">{selectedCourtData.utilization}% <span className={`text-xs ${selectedCourtData.utilDelta >= 0 ? 'text-primary' : 'text-destructive'}`}>{selectedCourtData.utilDelta >= 0 ? '↑' : '↓'}{Math.abs(selectedCourtData.utilDelta)}%</span></p></div>
                          <div className="border border-border rounded-md p-3"><p className="text-[10px] text-muted-foreground">Revenue</p><p className="text-lg font-bold">${selectedCourtData.revWeek.toLocaleString()}</p></div>
                          <div className="border border-border rounded-md p-3"><p className="text-[10px] text-muted-foreground">Base Rate</p><p className="text-lg font-bold">${selectedCourtData.rate}/hr</p></div>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Editable fields */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Court Details</p>
                          <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Name</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.name} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Sport</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.sport} /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Surface</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.surface} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Capacity</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={String(selectedCourtData.capacity)} /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Environment</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.indoor ? 'Indoor' : 'Outdoor'} /></div>
                          </div>
                          <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Amenities</label><input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm" defaultValue={selectedCourtData.amenities} /></div>
                          {selectedCourtData.split && <div className="bg-primary/5 border border-primary/15 rounded-md p-2.5"><p className="text-[11px] font-semibold text-primary">{selectedCourtData.split}</p></div>}
                          {selectedCourtData.parent && <div className="bg-primary/5 border border-primary/15 rounded-md p-2.5"><p className="text-[11px] font-semibold text-primary">{selectedCourtData.parent}</p></div>}
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
                          <input className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm font-bold" defaultValue={`$${selectedCourtData.rate}/hr`} />
                        </div>

                        <div className="h-px bg-border" />

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Time-of-Day Pricing</p>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] font-semibold px-2">+ Add</Button>
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
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Min Duration</label><select className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm appearance-none cursor-pointer" defaultValue="60"><option value="15">15 min</option><option value="30">30 min</option><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option></select></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Max Duration</label><select className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm appearance-none cursor-pointer" defaultValue="180"><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="240">4 hours</option></select></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Time Granularity</label><select className="w-full h-8 px-3 rounded-md border border-border bg-background text-sm appearance-none cursor-pointer" defaultValue="30"><option value="15">15 min</option><option value="30">30 min</option><option value="60">60 min</option></select></div>
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
        )}


        {/* ===== CUSTOMERS PAGE ===== */}
        {activeNav === 'customers' && <CustomersView />}

      </div>
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
  const [sortCol, setSortCol] = useState<string>('lastActivity');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'bookings' | 'financials' | 'tags' | 'activity'>('overview');

  // Filter & sort
  const filtered = allCustomers.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (membershipFilter !== 'all') {
      if (membershipFilter === 'none' && c.membershipTier !== null) return false;
      if (membershipFilter !== 'none' && c.membershipTier !== membershipFilter) return false;
    }
    if (tagFilter !== 'all' && !c.tags.some(t => t.name === tagFilter)) return false;
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
        {/* Header bar */}
        <div className="h-14 border-b bg-card shrink-0 flex items-center px-6 gap-4">
          <button onClick={() => { setViewingCustomer(null); setDetailTab('overview'); }} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="h-5 w-px bg-border" />
          <span className="text-sm text-muted-foreground">Customers</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm font-semibold">{c.firstName} {c.lastName}</span>
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
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5"><Send className="h-3.5 w-3.5" />Message</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5"><CalendarDays className="h-3.5 w-3.5" />Book</Button>
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5"><Pencil className="h-3.5 w-3.5" />Edit</Button>
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
          <div className="border-b bg-card px-6 flex items-end">
            {(['overview', 'bookings', 'financials', 'tags', 'activity'] as const).map(tab => (
              <button key={tab} onClick={() => setDetailTab(tab)}
                className={`px-4 pb-2.5 pt-3 text-sm font-semibold transition-colors border-b-2 ${detailTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {tab === 'overview' ? 'Overview' : tab === 'bookings' ? 'Bookings' : tab === 'financials' ? 'Financials' : tab === 'tags' ? 'Tags' : 'Activity'}
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
                  <Card className="shadow-sm">
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
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Emergency Contact</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-3 gap-x-8 gap-y-3">
                        <CDR l="Name" v={c.emergencyContact} /><CDR l="Phone" v={c.emergencyPhone || '—'} /><CDR l="Relationship" v={c.emergencyRelation || '—'} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Membership */}
                  {c.membershipTier && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Membership</CardTitle></CardHeader>
                      <CardContent className="grid grid-cols-3 gap-x-8 gap-y-3">
                        <CDR l="Tier" v={c.membershipTier} /><CDR l="Status" v={c.membershipStatus || '—'} /><CDR l="Since" v={c.membershipSince || '—'} />
                        <CDR l="Next Billing" v={c.nextBillingDate || '—'} /><CDR l="Price" v={c.membershipPrice ? `$${c.membershipPrice}/month` : '—'} />
                      </CardContent>
                    </Card>
                  )}

                  {/* Active passes */}
                  {c.activePasses.length > 0 && (
                    <Card className="shadow-sm">
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

                  {/* Notes */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold">Notes</CardTitle>
                      <Button size="sm" variant="outline" className="h-7 text-[10px] font-semibold gap-1"><Plus className="h-3 w-3" />Add Note</Button>
                    </CardHeader>
                    <CardContent>
                      {c.notes.length === 0 ? <p className="text-sm text-muted-foreground">No notes yet.</p> : c.notes.map((n, i) => (
                        <div key={i} className="py-2.5 border-b last:border-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold">{n.author}</span>
                            <span className="text-[10px] text-muted-foreground">{n.date}</span>
                            <Badge variant="outline" className="text-[9px] py-0">{n.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{n.text}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right column — health sidebar */}
                <div className="space-y-6">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Health Metrics</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Lifetime Value</span><span className="text-sm font-bold tabular-nums">${c.totalSpend.toLocaleString()}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Total Bookings</span><span className="text-sm font-bold tabular-nums">{c.totalBookings}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Avg Booking Value</span><span className="text-sm font-bold tabular-nums">${c.avgBookingValue.toFixed(2)}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Booking Frequency</span><span className="text-sm font-bold tabular-nums">{c.bookingFrequency}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Days Since Last Visit</span><span className="text-sm font-bold tabular-nums">{c.daysSinceLastVisit}</span></div>
                      <Separator />
                      <div className="flex justify-between items-center"><span className="text-xs text-muted-foreground">Churn Risk</span>
                        {c.churnRisk ? <Badge className={`text-[10px] py-0 border ${CHURN_STYLES[c.churnRisk]}`}>{c.churnRisk.toUpperCase()}</Badge> : <span className="text-sm text-muted-foreground">—</span>}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Play Profile</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Preferred Sport</span><span className="text-sm font-semibold">{c.preferredSport}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Preferred Court</span><span className="text-sm font-semibold">{c.preferredCourt}</span></div>
                      <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Preferred Time</span><span className="text-sm font-semibold">{c.preferredTime}</span></div>
                    </CardContent>
                  </Card>

                  {c.household && (
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Household</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Household</span><span className="text-sm font-semibold">{c.household}</span></div>
                        <div className="flex justify-between items-baseline"><span className="text-xs text-muted-foreground">Role</span><Badge variant="outline" className="text-[10px] py-0">{c.householdRole === 'primary' ? 'Primary' : 'Member'}</Badge></div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Waivers</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Status</span>
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
              <Card className="shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold">Booking History</CardTitle>
                  <Button size="sm" className="h-8 text-xs font-semibold gap-1.5"><Plus className="h-3.5 w-3.5" />Create Booking</Button>
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
                  <Card className="shadow-sm"><CardContent className="pt-4 pb-3"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Spend</p><p className="text-2xl font-bold tabular-nums mt-0.5">${c.totalSpend.toLocaleString()}</p></CardContent></Card>
                  <Card className="shadow-sm"><CardContent className="pt-4 pb-3"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Outstanding</p><p className={`text-2xl font-bold tabular-nums mt-0.5 ${c.outstandingBalance > 0 ? 'text-destructive' : ''}`}>${c.outstandingBalance.toFixed(2)}</p></CardContent></Card>
                  <Card className="shadow-sm"><CardContent className="pt-4 pb-3"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Account Credit</p><p className={`text-2xl font-bold tabular-nums mt-0.5 ${c.accountCredit > 0 ? 'text-success' : ''}`}>${c.accountCredit.toFixed(2)}</p></CardContent></Card>
                  <Card className="shadow-sm"><CardContent className="pt-4 pb-3"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Transaction</p><p className="text-2xl font-bold tabular-nums mt-0.5">${c.avgBookingValue.toFixed(2)}</p></CardContent></Card>
                </div>
                <Card className="shadow-sm">
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
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-bold">Active Tags</CardTitle>
                    <Button size="sm" variant="outline" className="h-7 text-[10px] font-semibold gap-1"><Plus className="h-3 w-3" />Assign Tag</Button>
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
                  <Card className="shadow-sm">
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

            {/* ACTIVITY TAB */}
            {detailTab === 'activity' && (
              <Card className="shadow-sm">
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

          </div>
        </div>
      </>
    );
  }

  // ---- LIST VIEW ----
  return (
    <>
      {/* Header */}
      <div className="h-14 border-b bg-card shrink-0 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-bold text-foreground">Customers</h1>
          <Badge variant="outline" className="text-[10px] font-semibold">{filtered.length} total</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5"><Download className="h-3.5 w-3.5" />Export</Button>
          <Button size="sm" className="h-8 text-xs font-semibold gap-1.5"><UserPlus className="h-3.5 w-3.5" />Add Customer</Button>
        </div>
      </div>

      {/* Toolbar: search + filters */}
      <div className="shrink-0 border-b bg-card px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search by name, email, or phone..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-md border border-border bg-background text-sm w-72 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-8 px-3 rounded-md border border-border bg-background text-xs font-semibold text-muted-foreground appearance-none cursor-pointer pr-6">
            <option value="all">All Statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
          </select>
          <select value={membershipFilter} onChange={e => setMembershipFilter(e.target.value)} className="h-8 px-3 rounded-md border border-border bg-background text-xs font-semibold text-muted-foreground appearance-none cursor-pointer pr-6">
            <option value="all">All Memberships</option><option value="Gold">Gold</option><option value="Silver">Silver</option><option value="none">No Membership</option>
          </select>
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="h-8 px-3 rounded-md border border-border bg-background text-xs font-semibold text-muted-foreground appearance-none cursor-pointer pr-6">
            <option value="all">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>)}
          </select>
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">{selectedIds.size} selected</span>
            <Button size="sm" variant="outline" className="h-7 text-[10px] font-semibold gap-1"><Tag className="h-3 w-3" />Assign Tag</Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] font-semibold gap-1"><Send className="h-3 w-3" />Message</Button>
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
  return <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{l}</span><p className="text-sm mt-0.5">{v}</p></div>;
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

        {/* Waiver status */}
        {b.type !== 'maintenance' && (
          <>
            <div className="h-px bg-border mx-5" />
            <div className="px-5 py-3 flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">Waiver</span>
              {b.checkedIn ? (
                <span className="text-[12px] font-semibold text-primary flex items-center gap-1">✓ Signed</span>
              ) : (
                <span className="text-[12px] font-semibold text-warning flex items-center gap-1">⚠ Required</span>
              )}
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
