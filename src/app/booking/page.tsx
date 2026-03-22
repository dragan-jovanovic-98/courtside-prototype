"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays, ChevronLeft, ChevronRight, ChevronDown, Clock, MapPin, CreditCard, Shield,
  Calendar as CalendarIcon, Ticket, UserCircle, LogIn, Bell, CheckCircle2, Copy, ExternalLink,
  X, Plus, Minus, Lock, QrCode, Key, Mail, Phone, PanelLeft, PanelLeftClose,
  Users, Share2, Lightbulb, Video, Trophy, Dumbbell, MessageSquare,
  GraduationCap, Zap,
} from "lucide-react";

// ============================================================
// TYPES & CONFIG
// ============================================================
type SlotStatus = 'available' | 'booked' | 'too-short' | 'maintenance' | 'own-booking' | 'joinable';
type PortalView = 'grid' | 'checkout' | 'confirmation';

interface PortalCourt {
  id: number;
  name: string;
  sport: string;
  sports: string[];
  hourlyRate: number;
  memberRate: number;
  amenities: string[];
  parentId?: number;
}

interface SlotData {
  courtId: number;
  slotIndex: number;
  status: SlotStatus;
  label?: string;
  bookingSpan?: number;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  maxQty: number;
}

const FACILITY = {
  name: 'Kings Court Markham',
  initials: 'KC',
  address: '45 Main Street, Markham, ON L3P 1Y6',
  phone: '(905) 555-0100',
  openHour: 8,
  closeHour: 22,
  taxRate: 0.13,
  taxLabel: 'HST (13%)',
  minBookingMinutes: 60,
};

const SPORTS = ['All', 'Pickleball', 'Tennis', 'Basketball', 'Volleyball'];

const PORTAL_COURTS: PortalCourt[] = [
  { id: 0, name: 'Court 1', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting'] },
  { id: 1, name: 'Court 2', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting'] },
  { id: 2, name: 'Court 3', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting', 'Video Replay'] },
  { id: 3, name: 'Court 4', sport: 'Tennis', sports: ['Tennis'], hourlyRate: 60, memberRate: 51.00, amenities: ['Lighting', 'Scoreboard'] },
  { id: 4, name: 'Court 4A', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting'], parentId: 3 },
  { id: 5, name: 'Court 4B', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting'], parentId: 3 },
  { id: 6, name: 'Court 5', sport: 'Tennis', sports: ['Tennis'], hourlyRate: 60, memberRate: 51.00, amenities: ['Lighting', 'Ball Machine'] },
  { id: 7, name: 'Court 6', sport: 'Basketball', sports: ['Basketball', 'Volleyball'], hourlyRate: 55, memberRate: 46.75, amenities: ['Lighting', 'Scoreboard'] },
];

const PORTAL_NAV = [
  { id: 'book', label: 'Book a Court', icon: CalendarDays },
  { id: 'bookings', label: 'My Bookings', icon: CalendarIcon },
  { id: 'programs', label: 'Programs', icon: GraduationCap },
  { id: 'leagues', label: 'Leagues', icon: Trophy },
  { id: 'membership', label: 'Membership', icon: Shield },
  { id: 'passes', label: 'Passes', icon: Ticket },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Profile', icon: UserCircle },
];

const COURT_ADDONS: AddOn[] = [
  { id: 'racket', name: 'Racket Rental', price: 5, maxQty: 4 },
  { id: 'balls', name: 'Ball Hopper', price: 3, maxQty: 2 },
  { id: 'video', name: 'Video Replay', price: 10, maxQty: 1 },
];

const FACILITY_AGREEMENTS = [
  { id: 'terms', label: 'Terms of Service', text: 'By using our facility and services, you agree to abide by all posted rules and regulations. Bookings are subject to our cancellation policy. The facility reserves the right to modify court availability for maintenance or special events with reasonable notice.' },
  { id: 'cancellation', label: 'Cancellation Policy', text: 'Free cancellation up to 24 hours before your booking. Cancellations within 24 hours incur a 50% fee. No-shows are charged the full booking amount. Rescheduling is available up to 12 hours before your booking at no additional charge.' },
  { id: 'waiver', label: 'Liability Waiver', text: 'I acknowledge that participation in sports activities carries inherent risks of injury. I voluntarily assume all risks and release the facility, its owners, and staff from any liability for injuries sustained during my visit. I confirm I am physically able to participate in the activities I have booked.' },
];

// Amenity icon mapping
function AmenityIcon({ name, className }: { name: string; className?: string }) {
  const cn = className || "h-3 w-3";
  switch (name) {
    case 'Lighting': return <Lightbulb className={cn} />;
    case 'Video Replay': return <Video className={cn} />;
    case 'Scoreboard': return <Trophy className={cn} />;
    case 'Ball Machine': return <Dumbbell className={cn} />;
    default: return <Zap className={cn} />;
  }
}

// Sport color mapping for badges
function sportBadgeClass(sport: string): string {
  switch (sport) {
    case 'Pickleball': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Tennis': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Basketball': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'Volleyball': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

// Time helpers
function slotToTime(slot: number): string {
  const totalMin = FACILITY.openHour * 60 + slot * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:${m.toString().padStart(2, '0')} ${period}`;
}

function slotToShortTime(slot: number): string {
  const totalMin = FACILITY.openHour * 60 + slot * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  if (m === 0) return `${display} ${period}`;
  return `${display}:${m.toString().padStart(2, '0')}`;
}

const TOTAL_SLOTS = (FACILITY.closeHour - FACILITY.openHour) * 2;
const MIN_BOOKING_SLOTS = FACILITY.minBookingMinutes / 30;
const SLOT_HEIGHT = 28; // px per 30-min slot — compact for 13" screens

// Court counts per sport
function getCourtCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const court of PORTAL_COURTS) {
    for (const sport of court.sports) {
      counts[sport] = (counts[sport] || 0) + 1;
    }
  }
  return counts;
}

// Generate mock booking data
function generateBookings(): SlotData[] {
  const bookings: SlotData[] = [];
  const patterns: Record<number, { start: number; span: number; status: SlotStatus; label?: string }[]> = {
    0: [{ start: 0, span: 2, status: 'booked', label: 'Booked' }, { start: 2, span: 4, status: 'booked', label: 'Booked' }, { start: 8, span: 2, status: 'booked', label: 'Booked' }, { start: 14, span: 3, status: 'booked', label: 'Booked' }, { start: 20, span: 4, status: 'booked', label: 'Booked' }, { start: 25, span: 2, status: 'booked', label: 'Booked' }],
    1: [{ start: 1, span: 3, status: 'booked', label: 'Booked' }, { start: 6, span: 4, status: 'joinable', label: 'Open Play' }, { start: 12, span: 2, status: 'booked', label: 'Booked' }, { start: 16, span: 2, status: 'booked', label: 'Booked' }, { start: 22, span: 4, status: 'booked', label: 'Booked' }],
    2: [{ start: 0, span: 8, status: 'booked', label: 'Junior Camp' }, { start: 10, span: 2, status: 'booked', label: 'Booked' }, { start: 14, span: 2, status: 'booked', label: 'Booked' }, { start: 18, span: 4, status: 'joinable', label: 'Open Play' }, { start: 24, span: 2, status: 'booked', label: 'Booked' }],
    3: [{ start: 0, span: 4, status: 'booked', label: 'Booked' }, { start: 6, span: 2, status: 'booked', label: 'Booked' }, { start: 10, span: 4, status: 'booked', label: 'League' }, { start: 16, span: 6, status: 'maintenance', label: 'Maintenance' }, { start: 24, span: 4, status: 'booked', label: 'Booked' }],
    4: [{ start: 2, span: 2, status: 'booked', label: 'Booked' }, { start: 6, span: 4, status: 'booked', label: 'Clinic' }, { start: 12, span: 2, status: 'booked', label: 'Booked' }, { start: 16, span: 6, status: 'maintenance', label: 'Maintenance' }, { start: 24, span: 2, status: 'booked', label: 'Booked' }],
    5: [{ start: 0, span: 2, status: 'booked', label: 'Booked' }, { start: 4, span: 2, status: 'booked', label: 'Booked' }, { start: 8, span: 4, status: 'booked', label: 'Booked' }, { start: 16, span: 6, status: 'maintenance', label: 'Maintenance' }, { start: 24, span: 3, status: 'booked', label: 'Booked' }],
    6: [{ start: 0, span: 4, status: 'booked', label: 'Booked' }, { start: 6, span: 2, status: 'booked', label: 'Booked' }, { start: 10, span: 4, status: 'booked', label: 'Lesson' }, { start: 16, span: 2, status: 'booked', label: 'Booked' }, { start: 20, span: 4, status: 'booked', label: 'Booked' }, { start: 26, span: 2, status: 'booked', label: 'Booked' }],
    7: [{ start: 0, span: 4, status: 'booked', label: 'Booked' }, { start: 6, span: 4, status: 'joinable', label: 'Drop-In Basketball' }, { start: 12, span: 2, status: 'booked', label: 'Booked' }, { start: 16, span: 4, status: 'booked', label: 'League' }, { start: 22, span: 2, status: 'booked', label: 'Booked' }],
  };

  for (const [courtId, blocks] of Object.entries(patterns)) {
    for (const block of blocks) {
      for (let i = 0; i < block.span; i++) {
        bookings.push({
          courtId: Number(courtId),
          slotIndex: block.start + i,
          status: block.status,
          label: i === 0 ? block.label : undefined,
          bookingSpan: i === 0 ? block.span : undefined,
        });
      }
    }
  }
  return bookings;
}

const OWN_BOOKINGS = [
  { courtId: 0, slotIndex: 10, span: 2, label: 'Your Booking' },
  { courtId: 1, slotIndex: 18, span: 3, label: 'Your Booking' },
];

// ============================================================
// PAGE COMPONENT
// ============================================================
export default function BookingPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activePortalNav, setActivePortalNav] = useState('book');
  const [selectedSport, setSelectedSport] = useState('All');
  const [dateOffset, setDateOffset] = useState(0);
  const [view, setView] = useState<PortalView>('grid');
  const [selectedSlot, setSelectedSlot] = useState<{ courtId: number; slotIndex: number } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [agreementModal, setAgreementModal] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInSent, setSignInSent] = useState(false);

  // Checkout state
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [useCredit, setUseCredit] = useState(true);
  const [agreements, setAgreements] = useState<Record<string, boolean>>({});
  const [playerCount, setPlayerCount] = useState(2);
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [paymentMethod, setPaymentMethod] = useState('saved');
  const [addOns, setAddOns] = useState<Record<string, number>>({});
  const [showNotes, setShowNotes] = useState(false);
  const [guestPlayers, setGuestPlayers] = useState<string[]>([]);

  const gridRef = useRef<HTMLDivElement>(null);
  const bookings = useMemo(() => generateBookings(), []);
  const courtCounts = useMemo(() => getCourtCounts(), []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [dateOffset, selectedSport]);

  // Auto-scroll to ~1 hour before current time on today
  useEffect(() => {
    if (dateOffset === 0 && !isLoading && gridRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollToHour = Math.max(FACILITY.openHour, currentHour - 1);
      const slotIndex = (scrollToHour - FACILITY.openHour) * 2;
      const scrollTop = slotIndex * SLOT_HEIGHT;
      gridRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
  }, [dateOffset, isLoading]);

  // Date display
  const today = new Date(2026, 2, 20);
  const displayDate = new Date(today);
  displayDate.setDate(displayDate.getDate() + dateOffset);
  const dateStr = displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  // Filter courts by sport
  const filteredCourts = selectedSport === 'All'
    ? PORTAL_COURTS
    : PORTAL_COURTS.filter(c => c.sports.includes(selectedSport));

  // Get contiguous available slots from a start point
  function getMaxContiguousSlots(courtId: number, startSlot: number): number {
    let count = 0;
    for (let i = startSlot; i < TOTAL_SLOTS; i++) {
      const booking = bookings.find(b => b.courtId === courtId && b.slotIndex === i);
      const ownBlock = isLoggedIn && OWN_BOOKINGS.some(b => b.courtId === courtId && i >= b.slotIndex && i < b.slotIndex + b.span);
      if (booking || ownBlock) break;
      count++;
    }
    return count;
  }

  // Available durations for a given slot
  function getAvailableDurations(courtId: number, slotIndex: number): number[] {
    const maxSlots = getMaxContiguousSlots(courtId, slotIndex);
    const durations: number[] = [];
    for (let slots = MIN_BOOKING_SLOTS; slots <= maxSlots; slots++) {
      durations.push(slots * 30);
    }
    return durations;
  }

  // Get slot status (simplified — no duration-based "too short")
  function getSlotStatus(courtId: number, slotIndex: number): { status: SlotStatus; label?: string; span?: number } {
    if (isLoggedIn) {
      const own = OWN_BOOKINGS.find(b => b.courtId === courtId && b.slotIndex === slotIndex);
      if (own) return { status: 'own-booking', label: own.label, span: own.span };
      if (OWN_BOOKINGS.some(b => b.courtId === courtId && slotIndex > b.slotIndex && slotIndex < b.slotIndex + b.span)) {
        return { status: 'own-booking' };
      }
    }

    const booking = bookings.find(b => b.courtId === courtId && b.slotIndex === slotIndex);
    if (booking) return { status: booking.status, label: booking.label, span: booking.bookingSpan };

    // Check if this gap is below minimum booking time
    const contiguous = getMaxContiguousSlots(courtId, slotIndex);
    if (contiguous < MIN_BOOKING_SLOTS) {
      // Check if this is the start of a too-short gap
      const prevBooking = bookings.find(b => b.courtId === courtId && b.slotIndex === slotIndex - 1);
      const prevOwn = isLoggedIn && OWN_BOOKINGS.some(b => b.courtId === courtId && slotIndex - 1 >= b.slotIndex && slotIndex - 1 < b.slotIndex + b.span);
      if (slotIndex === 0 || prevBooking || prevOwn) {
        return { status: 'too-short' };
      }
      // Part of an already-started too-short gap
      const gapStart = (() => {
        for (let i = slotIndex - 1; i >= 0; i--) {
          const b = bookings.find(bk => bk.courtId === courtId && bk.slotIndex === i);
          const o = isLoggedIn && OWN_BOOKINGS.some(bk => bk.courtId === courtId && i >= bk.slotIndex && i < bk.slotIndex + bk.span);
          if (b || o) return i + 1;
        }
        return 0;
      })();
      const gapSize = getMaxContiguousSlots(courtId, gapStart);
      if (gapSize < MIN_BOOKING_SLOTS) {
        return { status: 'too-short' };
      }
    }

    return { status: 'available' };
  }

  // Price for a slot (per-slot rate based on 30-min granularity)
  function getSlotPrice(court: PortalCourt): number {
    const rate = isLoggedIn ? court.memberRate : court.hourlyRate;
    return Math.round(rate / 2 * 100) / 100;
  }

  // Price for a duration
  function getDurationPrice(court: PortalCourt, durationMin: number): number {
    const rate = isLoggedIn ? court.memberRate : court.hourlyRate;
    return Math.round(rate * (durationMin / 60) * 100) / 100;
  }

  // Checkout price calculations
  const selectedCourt = selectedSlot ? PORTAL_COURTS.find(c => c.id === selectedSlot.courtId) : null;
  const basePrice = selectedCourt ? getDurationPrice(selectedCourt, selectedDuration) : 0;
  const addOnTotal = Object.entries(addOns).reduce((sum, [id, qty]) => {
    const addon = COURT_ADDONS.find(a => a.id === id);
    return sum + (addon ? addon.price * qty : 0);
  }, 0);
  const promoDiscount = promoApplied ? Math.round((basePrice + addOnTotal) * 0.2 * 100) / 100 : 0;
  const subtotal = basePrice + addOnTotal - promoDiscount;
  const creditAmount = isLoggedIn && useCredit ? Math.min(45, subtotal) : 0;
  const taxable = subtotal - creditAmount;
  const tax = Math.round(taxable * FACILITY.taxRate * 100) / 100;
  const total = Math.round((taxable + tax) * 100) / 100;
  const allAgreed = FACILITY_AGREEMENTS.every(a => agreements[a.id]);

  function handleSlotClick(courtId: number, slotIndex: number) {
    setSelectedSlot({ courtId, slotIndex });
    const durations = getAvailableDurations(courtId, slotIndex);
    setSelectedDuration(durations[0] || 60);
    setShowBookingModal(true);
  }

  function handleProceedToCheckout() {
    setShowBookingModal(false);
    setView('checkout');
    setPromoCode('');
    setPromoApplied(false);
    setShowPromoInput(false);
    setAgreements({});
    setAddOns({});
    setGuestPlayers([]);
    setShowNotes(false);
  }

  function handleConfirm() {
    setView('confirmation');
  }

  function handleBackToGrid() {
    setView('grid');
    setSelectedSlot(null);
  }

  function handleSignIn() {
    setShowSignInModal(false);
    setSignInSent(false);
    setSignInEmail('');
    setIsLoggedIn(true);
  }

  // Current time slot (for today indicator)
  const currentTimeSlot = (() => {
    const now = new Date();
    const minutesSinceOpen = (now.getHours() - FACILITY.openHour) * 60 + now.getMinutes();
    return minutesSinceOpen / 30;
  })();
  const isToday = dateOffset === 0;

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <TooltipProvider delay={0}>
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ===== FACILITY HEADER ===== */}
      <header className="h-14 border-b bg-card shrink-0 flex items-center justify-between px-4 lg:px-6 z-20" role="banner">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">{FACILITY.initials}</span>
          </div>
          <span className="text-sm font-bold text-foreground hidden sm:block">{FACILITY.name}</span>
          <a href={`tel:${FACILITY.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors ml-1">
            <Phone className="h-3.5 w-3.5" />
            <span className="text-xs hidden md:inline">{FACILITY.phone}</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <button className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">2</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="flex items-center gap-2 h-8 px-2 rounded-md hover:bg-muted transition-colors">
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] font-bold bg-primary/15 text-primary">JD</AvatarFallback></Avatar>
                    <span className="text-sm font-semibold hidden sm:inline">Jane D.</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">Jane Doe</p>
                    <p className="text-xs text-muted-foreground">jane.doe@email.com</p>
                    <Badge className="text-[10px] py-0 mt-1.5 bg-primary/10 text-primary border-primary/25">Gold Member</Badge>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" /> Notifications <Badge className="ml-auto text-[9px] py-0">2</Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="h-4 w-4 mr-2" /> Payment Methods
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
                    <LogIn className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5" onClick={() => setShowSignInModal(true)}>
              <LogIn className="h-3.5 w-3.5" /> Sign In
            </Button>
          )}
        </div>
      </header>

      {/* ===== MEMBER PRICING BANNER (anonymous, dismissable) ===== */}
      {!isLoggedIn && view === 'grid' && !bannerDismissed && (
        <div className="bg-primary/5 border-b px-6 py-2 flex items-center justify-center gap-2 relative animate-in fade-in duration-300">
          <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="text-xs text-muted-foreground">Sign in for member pricing, saved cards, and booking history.</span>
          <button onClick={() => setShowSignInModal(true)} className="text-xs font-semibold text-primary hover:underline">Sign in</button>
          <button onClick={() => setBannerDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors" aria-label="Dismiss banner">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* ===== MEMBER PRICING INDICATOR (logged in) ===== */}
      {isLoggedIn && view === 'grid' && (
        <div className="bg-emerald-50 border-b px-6 py-1.5 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="text-xs font-medium text-emerald-700">Member pricing applied</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">

        {/* ===== CUSTOMER SIDEBAR (logged-in only) ===== */}
        {isLoggedIn && (
          <aside
            className="shrink-0 border-r bg-card flex flex-col transition-all duration-300 ease-in-out hidden md:flex"
            style={{ width: sidebarExpanded ? 200 : 52 }}
            role="complementary"
            aria-label="Customer navigation"
          >
            <nav className="flex-1 py-2 px-1.5 space-y-0.5" role="navigation">
              {PORTAL_NAV.map(item => {
                const Icon = item.icon;
                const active = activePortalNav === item.id;
                const btn = (
                  <button
                    key={item.id}
                    onClick={() => { setActivePortalNav(item.id); if (item.id === 'book') { setView('grid'); setSelectedSlot(null); } }}
                    className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-2.5' : 'justify-center px-0'} py-2.5 rounded-md transition-colors ${
                      active ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                    {sidebarExpanded && <span className="text-sm truncate">{item.label}</span>}
                  </button>
                );
                return sidebarExpanded ? <div key={item.id}>{btn}</div> : (
                  <Tooltip key={item.id}>
                    <TooltipTrigger>{btn}</TooltipTrigger>
                    <TooltipContent side="right" className="text-xs font-semibold">{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
            <div className="border-t px-1.5 py-1.5">
              <Tooltip>
                <TooltipTrigger>
                  <button onClick={() => setSidebarExpanded(!sidebarExpanded)}
                    className="w-full flex items-center justify-center py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
                  >
                    {sidebarExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">{sidebarExpanded ? 'Collapse' : 'Expand'}</TooltipContent>
              </Tooltip>
            </div>
          </aside>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* ===== GRID VIEW ===== */}
          {view === 'grid' && (
            <>
              {/* Toolbar */}
              <div className="shrink-0 border-b bg-card px-4 lg:px-6 py-3 space-y-3">
                {/* Row 1: Date nav + hours */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setDateOffset(d => d - 1); setIsLoading(true); }} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Previous day">
                      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => { setDateOffset(0); setIsLoading(true); }} className={`h-8 px-3 rounded-md text-xs font-semibold transition-colors ${dateOffset === 0 ? 'text-primary bg-primary/5' : 'text-primary hover:bg-primary/5'}`}>
                      Today
                    </button>
                    <button onClick={() => { setDateOffset(d => d + 1); setIsLoading(true); }} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Next day">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <div className="h-5 w-px bg-border mx-1" />
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger>
                        <button className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5" aria-label="Open date picker">
                          {dateStr}
                          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={displayDate}
                          onSelect={(date) => {
                            if (date) {
                              const diff = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              setDateOffset(diff);
                              setIsLoading(true);
                            }
                            setCalendarOpen(false);
                          }}
                          defaultMonth={displayDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Open {slotToTime(0)} – {slotToTime(TOTAL_SLOTS)}
                  </div>
                </div>

                {/* Row 2: Sport pills only (duration selector removed) */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {SPORTS.map(sport => {
                    const count = sport === 'All' ? PORTAL_COURTS.length : (courtCounts[sport] || 0);
                    if (sport !== 'All' && count === 0) return null;
                    return (
                      <button key={sport} onClick={() => { setSelectedSport(sport); setIsLoading(true); }}
                        className={`h-8 px-4 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          selectedSport === sport
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        }`}
                        aria-pressed={selectedSport === sport}
                      >
                        {sport} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-auto relative" ref={gridRef}>
                {isLoading ? (
                  /* Skeleton loader */
                  <div className="min-w-[600px]">
                    <div className="sticky top-0 z-10 bg-card border-b flex">
                      <div className="w-[52px] shrink-0 border-r px-1.5 py-2" />
                      {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="flex-1 min-w-[120px] border-r last:border-r-0 px-2 py-2 flex flex-col items-center gap-1">
                          <Skeleton className="h-3 w-14" />
                          <Skeleton className="h-3 w-10" />
                        </div>
                      ))}
                    </div>
                    {Array.from({ length: 20 }, (_, row) => (
                      <div key={row} className="flex border-t border-border">
                        <div className="w-[52px] shrink-0 border-r px-1.5 flex items-start pt-0.5" style={{ height: SLOT_HEIGHT * 2 }}>
                          <Skeleton className="h-2.5 w-7" />
                        </div>
                        {Array.from({ length: 6 }, (_, col) => (
                          <div key={col} className="flex-1 min-w-[120px] border-r last:border-r-0 px-0.5 py-0.5" style={{ height: SLOT_HEIGHT * 2 }}>
                            <Skeleton className="h-full w-full rounded" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="min-w-[600px]">
                    {/* Column headers — improved visual hierarchy */}
                    <div
                      className="sticky top-0 z-10 bg-card border-b"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `52px repeat(${filteredCourts.length}, minmax(120px, 1fr))`,
                      }}
                    >
                      <div className="border-r px-1.5 py-2 flex items-end">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Time</span>
                      </div>
                      {filteredCourts.map((court, colIdx) => (
                        <div key={court.id} className={`px-2 py-2 text-center flex flex-col items-center gap-0.5 ${colIdx < filteredCourts.length - 1 ? 'border-r border-r-border/50' : ''}`}>
                          <p className="text-xs font-bold leading-tight">{court.name}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sportBadgeClass(court.sport)}`}>
                            {court.sport}
                          </span>
                          {court.amenities.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {court.amenities.map(a => (
                                <Tooltip key={a}>
                                  <TooltipTrigger>
                                    <span className="text-muted-foreground"><AmenityIcon name={a} className="h-3 w-3" /></span>
                                  </TooltipTrigger>
                                  <TooltipContent className="text-[10px]">{a}</TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* CSS Grid — fixed row heights, proper column alignment */}
                    <div
                      className="relative"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `52px repeat(${filteredCourts.length}, minmax(120px, 1fr))`,
                        gridTemplateRows: `repeat(${TOTAL_SLOTS}, ${SLOT_HEIGHT}px)`,
                      }}
                    >
                      {/* Current time indicator */}
                      {isToday && currentTimeSlot >= 0 && currentTimeSlot < TOTAL_SLOTS && (
                        <div
                          className="absolute left-0 right-0 z-[5] pointer-events-none"
                          style={{ top: `${currentTimeSlot * SLOT_HEIGHT}px` }}
                        >
                          <div className="h-0.5 bg-primary/60 w-full" />
                          <div className="absolute left-[52px] -top-1 h-2 w-2 rounded-full bg-primary/60 -translate-x-1/2" />
                        </div>
                      )}

                      {/* Time labels + hour gridlines */}
                      {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
                        const isHourBoundary = slotIdx % 2 === 0;
                        return (
                          <div
                            key={`time-${slotIdx}`}
                            className={`border-r relative ${isHourBoundary ? 'border-t-[1.5px] border-t-border' : 'border-t border-t-border/30'}`}
                            style={{ gridColumn: 1, gridRow: slotIdx + 1 }}
                          >
                            {isHourBoundary && (
                              <span className="absolute -top-[6px] left-1.5 text-[9px] font-medium text-muted-foreground tabular-nums bg-background px-0.5 z-[1]">
                                {slotToShortTime(slotIdx)}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Court cells */}
                      {filteredCourts.map((court, colIdx) => {
                        const gridCol = colIdx + 2; // +2 because col 1 is time
                        const cells: React.ReactNode[] = [];
                        let slotIdx = 0;

                        while (slotIdx < TOTAL_SLOTS) {
                          const slot = getSlotStatus(court.id, slotIdx);
                          const isHourBoundary = slotIdx % 2 === 0;
                          const isPast = isToday && slotIdx < currentTimeSlot;
                          const rowSpan = slot.span || 1;
                          const borderClass = isHourBoundary ? 'border-t-[1.5px] border-t-border' : 'border-t border-t-border/30';
                          const isLastCol = colIdx === filteredCourts.length - 1;
                          const colBorderClass = isLastCol ? '' : 'border-r border-r-border/50';

                          if (slot.status === 'available') {
                            const price = getSlotPrice(court);
                            const timeStr = slotToShortTime(slotIdx);
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 flex items-center justify-center ${isPast ? 'opacity-30' : ''}`}
                                style={{ gridColumn: gridCol, gridRow: slotIdx + 1 }}
                              >
                                <button
                                  onClick={() => !isPast && handleSlotClick(court.id, slotIdx)}
                                  className="w-full h-[calc(100%-3px)] rounded border border-primary/20 bg-primary/[0.04] hover:border-primary/50 hover:bg-primary/10 transition-all flex items-center justify-center gap-1 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                                  disabled={isPast}
                                  aria-label={`Book ${court.name} at ${timeStr} for $${price.toFixed(0)}`}
                                >
                                  <span className="text-[9px] text-muted-foreground/70 group-hover:text-primary/70 tabular-nums">{timeStr}</span>
                                  <span className="text-[11px] font-semibold text-primary/80 group-hover:text-primary tabular-nums">${price.toFixed(0)}</span>
                                </button>
                              </div>
                            );
                            slotIdx++;
                          } else if (slot.status === 'too-short') {
                            cells.push(
                              <Tooltip key={`${court.id}-${slotIdx}`}>
                                <TooltipTrigger>
                                  <div
                                    className={`${borderClass} ${colBorderClass} px-0.5 flex items-center justify-center`}
                                    style={{ gridColumn: gridCol, gridRow: slotIdx + 1 }}
                                  >
                                    <div className="w-full h-[calc(100%-3px)] rounded bg-muted/20" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="text-[10px]">Below minimum booking time ({FACILITY.minBookingMinutes} min)</TooltipContent>
                              </Tooltip>
                            );
                            slotIdx++;
                          } else if (slot.status === 'own-booking' && slot.label) {
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 py-0.5`}
                                style={{ gridColumn: gridCol, gridRow: `${slotIdx + 1} / span ${rowSpan}` }}
                              >
                                <button
                                  className="w-full h-full rounded bg-primary/10 border border-primary/25 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/15 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                                  aria-label={`Your booking: ${slotToTime(slotIdx)} – ${slotToTime(slotIdx + rowSpan)}`}
                                >
                                  <span className="text-[9px] font-bold text-primary">{slot.label}</span>
                                  {rowSpan > 2 && <span className="text-[8px] text-primary/70">{slotToTime(slotIdx)} – {slotToTime(slotIdx + rowSpan)}</span>}
                                </button>
                              </div>
                            );
                            slotIdx += rowSpan;
                          } else if (slot.status === 'joinable' && slot.label) {
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 py-0.5 ${isPast ? 'opacity-30' : ''}`}
                                style={{ gridColumn: gridCol, gridRow: `${slotIdx + 1} / span ${rowSpan}` }}
                              >
                                <button
                                  onClick={() => !isPast && handleSlotClick(court.id, slotIdx)}
                                  className="w-full h-full rounded bg-amber-50 border border-amber-200 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-100/70 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                                  disabled={isPast}
                                  aria-label={`Join ${slot.label} at ${slotToTime(slotIdx)}`}
                                >
                                  <span className="text-[9px] font-semibold text-amber-700">{slot.label}</span>
                                  {rowSpan > 2 && <span className="text-[8px] font-medium text-amber-600">Join</span>}
                                </button>
                              </div>
                            );
                            slotIdx += rowSpan;
                          } else if (slot.status === 'maintenance' && slot.label) {
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 py-0.5`}
                                style={{ gridColumn: gridCol, gridRow: `${slotIdx + 1} / span ${rowSpan}` }}
                              >
                                <div className="w-full h-full rounded bg-muted flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 8px)' }}>
                                  <span className="text-[9px] font-medium text-muted-foreground">Maintenance</span>
                                </div>
                              </div>
                            );
                            slotIdx += rowSpan;
                          } else if ((slot.status === 'booked' || slot.status === 'own-booking' || slot.status === 'joinable' || slot.status === 'maintenance') && slot.label) {
                            // Booked with label (first slot of a block)
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 py-0.5`}
                                style={{ gridColumn: gridCol, gridRow: `${slotIdx + 1} / span ${rowSpan}` }}
                              >
                                <div className="w-full h-full rounded bg-foreground/[0.05] flex items-center justify-center">
                                  <span className="text-[9px] font-medium text-muted-foreground">{slot.label}</span>
                                </div>
                              </div>
                            );
                            slotIdx += rowSpan;
                          } else {
                            // Empty/continuation cell — just render an empty bordered cell
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass}`}
                                style={{ gridColumn: gridCol, gridRow: slotIdx + 1 }}
                              />
                            );
                            slotIdx++;
                          }
                        }

                        return cells;
                      })}
                    </div>
                  </div>
                )}

                {/* Scroll hint shadow */}
                <div className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none bg-gradient-to-l from-background/40 to-transparent z-10" />
              </div>
            </>
          )}

          {/* ===== CHECKOUT VIEW ===== */}
          {view === 'checkout' && selectedCourt && selectedSlot && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              {/* Checkout header — no step indicator */}
              <div className="border-b bg-card px-6 py-3 flex items-center gap-3">
                <button onClick={handleBackToGrid} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Back to schedule">
                  <ChevronLeft className="h-4 w-4" /> Back to schedule
                </button>
                <div className="h-5 w-px bg-border" />
                <h2 className="text-sm font-bold">Complete Your Booking</h2>
              </div>

              {/* Two-column layout */}
              <div className="max-w-5xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left column — form */}
                <div className="lg:col-span-3 space-y-5">

                  {/* Booking summary */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Booking Summary</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-base font-bold">{selectedCourt.name} — {selectedCourt.sport}</p>
                          <p className="text-sm text-muted-foreground">{displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-sm text-muted-foreground">{slotToTime(selectedSlot.slotIndex)} – {slotToTime(selectedSlot.slotIndex + selectedDuration / 30)} ({selectedDuration} min)</p>
                          {selectedCourt.amenities.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">{selectedCourt.amenities.map(a => <Badge key={a} variant="outline" className="text-[9px] py-0">{a}</Badge>)}</div>
                          )}
                        </div>
                        <button onClick={() => setShowBookingModal(true)} className="text-xs font-semibold text-primary hover:underline">Change</button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Players & Details */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Players & Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {isLoggedIn ? (
                        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs font-bold bg-primary/15 text-primary">JD</AvatarFallback></Avatar>
                          <div><p className="text-sm font-semibold">Jane Doe</p><p className="text-xs text-muted-foreground">jane.doe@email.com · (647) 555-1234</p></div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">First Name *</label><input className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Jane" aria-required="true" /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Last Name *</label><input className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Doe" aria-required="true" /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Email *</label><input className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="jane@email.com" type="email" aria-required="true" /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Phone *</label><input className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="(647) 555-1234" type="tel" aria-required="true" /></div>
                          </div>
                        </div>
                      )}

                      {/* Guest players */}
                      {guestPlayers.length > 0 && (
                        <div className="space-y-2">
                          {guestPlayers.map((player, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input className="flex-1 h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder={`Player ${idx + 2} name or email`} value={player} onChange={e => { const next = [...guestPlayers]; next[idx] = e.target.value; setGuestPlayers(next); }} />
                              <button onClick={() => setGuestPlayers(guestPlayers.filter((_, i) => i !== idx))} className="h-9 w-9 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground" aria-label="Remove player"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setGuestPlayers([...guestPlayers, ''])} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                        <Plus className="h-3.5 w-3.5" /> Add Player
                      </button>

                      <Separator />

                      {/* Facility-configurable custom fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Number of Players</label>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setPlayerCount(Math.max(1, playerCount - 1))} className="h-9 w-9 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Decrease players"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="text-sm font-bold w-8 text-center tabular-nums">{playerCount}</span>
                            <button onClick={() => setPlayerCount(Math.min(8, playerCount + 1))} className="h-9 w-9 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Increase players"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Skill Level</label>
                          <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        </div>
                      </div>

                      {/* Notes */}
                      {showNotes ? (
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Notes</label>
                          <textarea className="w-full h-20 px-3 py-2 rounded-md border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Any special requests or notes..." />
                        </div>
                      ) : (
                        <button onClick={() => setShowNotes(true)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" /> Add a note
                        </button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Add-ons */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Add-ons</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {COURT_ADDONS.map(addon => {
                        const qty = addOns[addon.id] || 0;
                        return (
                          <div key={addon.id} className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-sm font-medium">{addon.name}</p>
                              <p className="text-xs text-muted-foreground">${addon.price.toFixed(2)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setAddOns({ ...addOns, [addon.id]: Math.max(0, qty - 1) })}
                                className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                                disabled={qty === 0}
                                aria-label={`Decrease ${addon.name}`}
                              ><Minus className="h-3 w-3" /></button>
                              <span className="text-sm font-bold w-6 text-center tabular-nums">{qty}</span>
                              <button
                                onClick={() => setAddOns({ ...addOns, [addon.id]: Math.min(addon.maxQty, qty + 1) })}
                                className="h-8 w-8 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-30"
                                disabled={qty >= addon.maxQty}
                                aria-label={`Increase ${addon.name}`}
                              ><Plus className="h-3 w-3" /></button>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Payment method */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Payment Method</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {isLoggedIn ? (
                        <>
                          <label className="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setPaymentMethod('saved')}>
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'saved' ? 'border-primary' : 'border-border'}`}>
                              {paymentMethod === 'saved' && <div className="h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <div><p className="text-sm font-semibold">Visa ending in 4242</p><p className="text-[10px] text-muted-foreground">Default payment method</p></div>
                          </label>
                          <label className="flex items-center gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setPaymentMethod('new')}>
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'new' ? 'border-primary' : 'border-border'}`}>
                              {paymentMethod === 'new' && <div className="h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium text-muted-foreground">Use a different card</p>
                          </label>
                        </>
                      ) : (
                        <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
                          <CreditCard className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium text-muted-foreground">Stripe Payment Element</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Secure card entry powered by Stripe</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Agreements */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Agreements</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {FACILITY_AGREEMENTS.map(agreement => (
                        <label key={agreement.id} className="flex items-start gap-3 cursor-pointer">
                          <Checkbox
                            checked={agreements[agreement.id] || false}
                            onCheckedChange={(v) => setAgreements({ ...agreements, [agreement.id]: v === true })}
                            className="mt-0.5"
                          />
                          <span className="text-sm">
                            I agree to the{' '}
                            <button
                              onClick={(e) => { e.preventDefault(); setAgreementModal(agreement.id); }}
                              className="text-primary font-semibold hover:underline"
                            >
                              {agreement.label}
                            </button>
                          </span>
                        </label>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right column — price summary (sticky) */}
                <div className="lg:col-span-2">
                  <div className="lg:sticky lg:top-6 space-y-5">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Price Breakdown</CardTitle></CardHeader>
                      <CardContent className="space-y-2.5">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{selectedCourt.name} — {selectedDuration} min</span>
                          <span className="tabular-nums font-medium">${basePrice.toFixed(2)}</span>
                        </div>

                        {/* Add-on line items */}
                        {Object.entries(addOns).filter(([, qty]) => qty > 0).map(([id, qty]) => {
                          const addon = COURT_ADDONS.find(a => a.id === id);
                          if (!addon) return null;
                          return (
                            <div key={id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{addon.name} × {qty}</span>
                              <span className="tabular-nums font-medium">${(addon.price * qty).toFixed(2)}</span>
                            </div>
                          );
                        })}

                        {/* Promo code (collapsed) */}
                        {showPromoInput ? (
                          <div className="pt-1">
                            <div className="flex gap-2">
                              <input value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoApplied(false); }} placeholder="Promo code" className="flex-1 h-8 px-3 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
                              <Button size="sm" variant="outline" className="h-8 text-[10px] font-semibold px-3" onClick={() => { if (promoCode === 'WELCOME20') setPromoApplied(true); }}>Apply</Button>
                            </div>
                            {promoApplied && <p className="text-[10px] text-success mt-1 font-semibold">WELCOME20 applied — 20% off!</p>}
                          </div>
                        ) : (
                          <button onClick={() => setShowPromoInput(true)} className="text-xs font-semibold text-primary hover:underline pt-1">Have a promo code?</button>
                        )}

                        {promoApplied && (
                          <div className="flex justify-between text-sm"><span className="text-success">Promo: WELCOME20 (20%)</span><span className="tabular-nums font-medium text-success">−${promoDiscount.toFixed(2)}</span></div>
                        )}

                        <Separator />
                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums font-medium">${subtotal.toFixed(2)}</span></div>

                        {/* Account credit (auto-applied) */}
                        {isLoggedIn && (
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Checkbox checked={useCredit} onCheckedChange={(v) => setUseCredit(v === true)} />
                              <span className="text-xs text-muted-foreground">Apply $45.00 credit</span>
                            </label>
                            {useCredit && <span className="text-sm tabular-nums font-medium text-success">−${creditAmount.toFixed(2)}</span>}
                          </div>
                        )}

                        <div className="flex justify-between text-sm"><span className="text-muted-foreground">{FACILITY.taxLabel}</span><span className="tabular-nums font-medium">${tax.toFixed(2)}</span></div>
                        <Separator />
                        <div className="flex justify-between text-base font-bold"><span>Total Due</span><span className="tabular-nums">${total.toFixed(2)}</span></div>
                      </CardContent>
                    </Card>

                    <Button className="w-full h-11 text-sm font-bold" disabled={!allAgreed} onClick={handleConfirm}>
                      Confirm Booking — ${total.toFixed(2)}
                    </Button>

                    <p className="text-[10px] text-center text-muted-foreground">
                      Secure payment processed by Stripe. Your card details are never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== CONFIRMATION VIEW ===== */}
          {view === 'confirmation' && selectedCourt && selectedSlot && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-2xl mx-auto px-6 py-10">
                {/* Success header */}
                <div className="text-center mb-8">
                  <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
                    <CheckCircle2 className="h-8 w-8 text-success" />
                  </div>
                  <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
                  <p className="text-muted-foreground mt-1">Your court is reserved and ready to go.</p>
                </div>

                {/* Reference number */}
                <Card className="shadow-sm mb-5">
                  <CardContent className="pt-5 pb-5 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Booking Reference</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold font-mono tracking-wider">REF-7X3K9</span>
                      <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Copy reference"><Copy className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking details */}
                <Card className="shadow-sm mb-5">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Booking Details</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Court</span><span className="font-semibold">{selectedCourt.name} — {selectedCourt.sport}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date</span><span className="font-semibold">{displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Time</span><span className="font-semibold">{slotToTime(selectedSlot.slotIndex)} – {slotToTime(selectedSlot.slotIndex + selectedDuration / 30)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{selectedDuration} minutes</span></div>
                    <Separator />
                    <div className="flex justify-between text-sm font-bold"><span>Amount Paid</span><span className="tabular-nums">${total.toFixed(2)}</span></div>
                  </CardContent>
                </Card>

                {/* Add to calendar */}
                <Card className="shadow-sm mb-5">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Add to Calendar</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['Google Calendar', 'Outlook', 'Apple Calendar', 'Download .ics'].map(cal => (
                        <Button key={cal} variant="outline" size="sm" className="h-9 text-[10px] font-semibold gap-1">
                          <CalendarIcon className="h-3.5 w-3.5" />{cal}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Check-in info */}
                <Card className="shadow-sm mb-5">
                  <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Check-in Information</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Key className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div><p className="text-sm font-medium">Door code will be sent 1 hour before your booking</p><p className="text-xs text-muted-foreground">Check your email and SMS for the access code</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <QrCode className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div><p className="text-sm font-medium">QR code available in My Bookings</p><p className="text-xs text-muted-foreground">Show at the front desk for check-in</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{FACILITY.name}</p>
                        <p className="text-xs text-muted-foreground">{FACILITY.address}</p>
                        <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5"><ExternalLink className="h-3 w-3" />Get directions</button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* What's next */}
                <Card className="shadow-sm mb-5 bg-muted/30">
                  <CardContent className="pt-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">Confirmation sent to <span className="font-semibold">{isLoggedIn ? 'jane.doe@email.com' : 'your email'}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">Reminder will be sent <span className="font-semibold">24 hours before</span> your booking</p>
                    </div>
                    {!isLoggedIn && (
                      <div className="flex items-center gap-2 pt-1">
                        <UserCircle className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm">We&apos;ve created an account for you — check your email to set a password and manage future bookings.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Share + Actions */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3">
                    <Button onClick={handleBackToGrid} className="h-10 px-6 text-sm font-semibold">Book Another Court</Button>
                    {isLoggedIn ? (
                      <Button variant="outline" onClick={() => { setActivePortalNav('bookings'); }} className="h-10 px-6 text-sm font-semibold">View My Bookings</Button>
                    ) : (
                      <Button variant="outline" onClick={() => setShowSignInModal(true)} className="h-10 px-6 text-sm font-semibold">Create Account to Manage Bookings</Button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const text = `${selectedCourt.name} — ${selectedCourt.sport}\n${displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}\n${slotToTime(selectedSlot.slotIndex)} – ${slotToTime(selectedSlot.slotIndex + selectedDuration / 30)}\n${FACILITY.name} · ${FACILITY.address}`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5" /> Share with Players
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ===== BOOKING MODAL ===== */}
      {showBookingModal && selectedSlot && selectedCourt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-card rounded-xl shadow-xl border w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">Book This Court</h3>
                <button onClick={() => setShowBookingModal(false)} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Court info */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold">{selectedCourt.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sportBadgeClass(selectedCourt.sport)}`}>{selectedCourt.sport}</span>
                    {selectedCourt.amenities.map(a => (
                      <span key={a} className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <AmenityIcon name={a} className="h-3 w-3" /> {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start time */}
              <div className="bg-muted/50 rounded-lg p-3 mb-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Start Time</p>
                <p className="text-sm font-semibold">{slotToTime(selectedSlot.slotIndex)} · {displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>

              {/* Duration options */}
              <div className="mb-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Select Duration</p>
                <div className="space-y-2">
                  {getAvailableDurations(selectedSlot.courtId, selectedSlot.slotIndex).map(dur => {
                    const price = getDurationPrice(selectedCourt, dur);
                    const endTime = slotToTime(selectedSlot.slotIndex + dur / 30);
                    const active = selectedDuration === dur;
                    return (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          active ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/20 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${active ? 'border-primary' : 'border-border'}`}>
                            {active && <div className="h-2 w-2 rounded-full bg-primary" />}
                          </div>
                          <div className="text-left">
                            <span className="text-sm font-semibold">{dur} minutes</span>
                            <span className="text-xs text-muted-foreground ml-2">until {endTime}</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold tabular-nums">${price.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Proceed button */}
              <Button className="w-full h-11 text-sm font-bold" onClick={handleProceedToCheckout}>
                Proceed to Checkout — ${getDurationPrice(selectedCourt, selectedDuration).toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== AGREEMENT TEXT MODAL ===== */}
      {agreementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => setAgreementModal(null)} />
          <div className="relative bg-card rounded-xl shadow-xl border w-full max-w-lg mx-4 max-h-[80vh] flex flex-col animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6 border-b flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold">{FACILITY_AGREEMENTS.find(a => a.id === agreementModal)?.label}</h3>
              <button onClick={() => setAgreementModal(null)} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">{FACILITY_AGREEMENTS.find(a => a.id === agreementModal)?.text}</p>
            </div>
            <div className="p-4 border-t shrink-0">
              <Button className="w-full h-10 text-sm font-semibold" onClick={() => {
                setAgreements({ ...agreements, [agreementModal]: true });
                setAgreementModal(null);
              }}>
                I Agree
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SIGN-IN MODAL ===== */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => { setShowSignInModal(false); setSignInSent(false); }} />
          <div className="relative bg-card rounded-xl shadow-xl border w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">Sign In</h3>
                <button onClick={() => { setShowSignInModal(false); setSignInSent(false); }} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close"><X className="h-4 w-4" /></button>
              </div>

              {signInSent ? (
                <div className="text-center py-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-semibold mb-1">Check your email</p>
                  <p className="text-xs text-muted-foreground mb-4">We sent a sign-in link to <span className="font-semibold">{signInEmail}</span></p>
                  <Button variant="outline" size="sm" className="text-xs" onClick={handleSignIn}>
                    Continue (demo)
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">Enter your email to sign in or create an account.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Email</label>
                      <input
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        placeholder="you@email.com"
                        type="email"
                        autoFocus
                      />
                    </div>
                    <Button className="w-full h-10 text-sm font-semibold" onClick={() => setSignInSent(true)}>
                      Send Sign-In Link
                    </Button>
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground mt-4">
                    No password needed — we&apos;ll send you a magic link.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
    </TooltipProvider>
  );
}
