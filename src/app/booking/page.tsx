"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  GraduationCap, Zap, Info, CircleDot, Target, Circle,
  Wallet, DoorOpen, Smartphone, FileText, Download, RotateCcw, PlusCircle, Receipt, AlertTriangle,
} from "lucide-react";

// ============================================================
// TYPES & CONFIG
// ============================================================
type SlotStatus = 'available' | 'booked' | 'too-short' | 'maintenance' | 'own-booking' | 'joinable';
type PortalView = 'grid' | 'checkout' | 'confirmation' | 'my-bookings' | 'programs' | 'leagues' | 'membership' | 'passes' | 'payments' | 'profile';

interface PortalCourt {
  id: number;
  name: string;
  sport: string;
  sports: string[];
  hourlyRate: number;
  memberRate: number;
  amenities: string[];
  parentId?: number;
  surface?: string;
  dimensions?: string;
  description?: string;
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
  { id: 0, name: 'Court 1', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting'], surface: 'Sport Court', dimensions: "44' × 20'", description: 'Standard pickleball court with professional-grade Sport Court surface and LED lighting.' },
  { id: 1, name: 'Court 2', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting'], surface: 'Sport Court', dimensions: "44' × 20'", description: 'Standard pickleball court with LED lighting. Ideal for recreational and competitive play.' },
  { id: 2, name: 'Court 3', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting', 'Video Replay'], surface: 'Sport Court', dimensions: "44' × 20'", description: 'Premium pickleball court with video replay system for reviewing your games.' },
  { id: 3, name: 'Court 4', sport: 'Tennis', sports: ['Tennis'], hourlyRate: 60, memberRate: 51.00, amenities: ['Lighting', 'Scoreboard'], surface: 'Hardcourt', dimensions: "78' × 36'", description: 'Full-size tennis court with electronic scoreboard and professional lighting.' },
  { id: 4, name: 'Court 4A', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting'], parentId: 3, surface: 'Sport Court', dimensions: "44' × 20'", description: 'Converted pickleball court within Court 4. Available when Court 4 is split.' },
  { id: 5, name: 'Court 4B', sport: 'Pickleball', sports: ['Pickleball'], hourlyRate: 45, memberRate: 38.25, amenities: ['Lighting'], parentId: 3, surface: 'Sport Court', dimensions: "44' × 20'", description: 'Converted pickleball court within Court 4. Available when Court 4 is split.' },
  { id: 6, name: 'Court 5', sport: 'Tennis', sports: ['Tennis'], hourlyRate: 60, memberRate: 51.00, amenities: ['Lighting', 'Ball Machine'], surface: 'Hardcourt', dimensions: "78' × 36'", description: 'Tennis court with ball machine available for solo practice sessions.' },
  { id: 7, name: 'Court 6', sport: 'Basketball', sports: ['Basketball', 'Volleyball'], hourlyRate: 55, memberRate: 46.75, amenities: ['Lighting', 'Scoreboard'], surface: 'Hardwood', dimensions: "94' × 50'", description: 'Full-size multi-sport court with hardwood flooring. Configurable for basketball and volleyball with retractable nets.' },
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

// Facility access configuration — determines which check-in blocks render
// In production: fetched from facility settings. Here we simulate a facility with door code + QR + wallet pass.
const FACILITY_ACCESS_CONFIG = {
  methods: ['door-code', 'qr-code', 'wallet-pass'] as const, // Options: 'door-code' | 'qr-code' | 'wallet-pass' | 'smart-lock' | 'front-desk' | 'time-window-code'
  doorCodeDelivery: 'hours-before' as const, // 'at-confirmation' | 'hours-before' | 'morning-of'
  doorCodeLeadHours: 1,
  earlyArrivalBuffer: 15, // minutes
  lateDepartureBuffer: 5,
  checkInInstructions: 'Enter through the main entrance. Keypad is on the right side of the door.',
  cancellationPolicy: { freeWindow: 24, lateFeePercent: 50, rescheduleFreeWindow: 12 }, // hours
};

// Detailed upcoming booking data for the detail modal
const UPCOMING_BOOKINGS_DETAIL = [
  {
    id: 'BK-20260321-001', court: 'Court 1', sport: 'Pickleball', surface: 'Sport Court',
    date: 'Fri, Mar 21, 2026', time: '2:00 PM – 3:00 PM', startTime: '2:00 PM', endTime: '3:00 PM',
    duration: '60 min', status: 'confirmed' as const,
    players: [{ name: 'Sarah Chen', isOrganizer: true }, { name: 'Mike Torres', isOrganizer: false }],
    pricing: { base: 45, memberDiscount: -6.75, addOns: [{ name: 'Racket Rental ×2', price: 10 }], subtotal: 48.25, tax: 6.27, total: 54.52 },
    addOns: ['Racket Rental ×2'],
    doorCode: '4829', doorCodeAvailable: true,
    accessWindow: '1:45 PM – 3:05 PM',
    bookedAt: 'Mar 19, 2026 at 9:14 AM',
    paymentMethod: 'Visa •••• 4242',
    paymentStatus: 'paid' as const,
    canCancel: true, cancelDeadline: 'Mar 20, 2026 at 2:00 PM',
    canReschedule: true, rescheduleDeadline: 'Mar 21, 2026 at 2:00 AM',
  },
  {
    id: 'BK-20260322-003', court: 'Court 3', sport: 'Pickleball', surface: 'Sport Court',
    date: 'Sat, Mar 22, 2026', time: '10:00 AM – 11:30 AM', startTime: '10:00 AM', endTime: '11:30 AM',
    duration: '90 min', status: 'confirmed' as const,
    players: [{ name: 'Sarah Chen', isOrganizer: true }, { name: 'James Lee', isOrganizer: false }, { name: 'Priya Patel', isOrganizer: false }, { name: 'Open Spot', isOrganizer: false }],
    pricing: { base: 67.50, memberDiscount: -10.13, addOns: [], subtotal: 57.38, tax: 7.46, total: 64.84 },
    addOns: [],
    doorCode: '4829', doorCodeAvailable: false, // Not yet — delivered morning-of or hours before
    accessWindow: '9:45 AM – 11:35 AM',
    bookedAt: 'Mar 18, 2026 at 3:22 PM',
    paymentMethod: 'Visa •••• 4242',
    paymentStatus: 'paid' as const,
    canCancel: true, cancelDeadline: 'Mar 21, 2026 at 10:00 AM',
    canReschedule: true, rescheduleDeadline: 'Mar 21, 2026 at 10:00 PM',
  },
  {
    id: 'BK-20260325-002', court: 'Court 5', sport: 'Tennis', surface: 'Hardcourt',
    date: 'Tue, Mar 25, 2026', time: '6:00 PM – 8:00 PM', startTime: '6:00 PM', endTime: '8:00 PM',
    duration: '120 min', status: 'confirmed' as const,
    players: [{ name: 'Sarah Chen', isOrganizer: true }, { name: 'Alex Kim', isOrganizer: false }],
    pricing: { base: 120, memberDiscount: -18, addOns: [{ name: 'Ball Machine', price: 10 }], subtotal: 112, tax: 14.56, total: 126.56 },
    addOns: ['Ball Machine'],
    doorCode: '4829', doorCodeAvailable: false,
    accessWindow: '5:45 PM – 8:05 PM',
    bookedAt: 'Mar 20, 2026 at 11:45 AM',
    paymentMethod: 'Visa •••• 4242',
    paymentStatus: 'paid' as const,
    canCancel: true, cancelDeadline: 'Mar 24, 2026 at 6:00 PM',
    canReschedule: true, rescheduleDeadline: 'Mar 25, 2026 at 6:00 AM',
  },
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

// Sport icon mapping (placeholder icons until custom sport icons are designed)
function SportIcon({ sport, className }: { sport: string; className?: string }) {
  const cn = className || "h-4 w-4";
  switch (sport) {
    case 'Pickleball': return <CircleDot className={cn} />;
    case 'Tennis': return <Target className={cn} />;
    case 'Basketball': return <Circle className={cn} />;
    case 'Volleyball': return <Zap className={cn} />;
    default: return <Circle className={cn} />;
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
  return `${display}:${m.toString().padStart(2, '0')} ${period}`;
}

// Compact format for the time gutter — "8 AM", "12 PM" (no :00)
function slotToGutterTime(slot: number): string {
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
const SLOT_HEIGHT = 32; // px per 30-min slot

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
    0: [{ start: 0, span: 2, status: 'booked' }, { start: 2, span: 4, status: 'booked' }, { start: 8, span: 2, status: 'booked' }, { start: 14, span: 3, status: 'booked' }, { start: 20, span: 4, status: 'booked' }, { start: 25, span: 2, status: 'booked' }],
    1: [{ start: 1, span: 3, status: 'booked' }, { start: 6, span: 4, status: 'joinable', label: 'Open Play' }, { start: 12, span: 2, status: 'booked' }, { start: 16, span: 2, status: 'booked' }, { start: 22, span: 4, status: 'booked' }],
    2: [{ start: 0, span: 8, status: 'booked' }, { start: 10, span: 2, status: 'booked' }, { start: 14, span: 2, status: 'booked' }, { start: 18, span: 4, status: 'joinable', label: 'Open Play' }, { start: 24, span: 2, status: 'booked' }],
    3: [{ start: 0, span: 4, status: 'booked' }, { start: 6, span: 2, status: 'booked' }, { start: 10, span: 4, status: 'booked' }, { start: 16, span: 6, status: 'booked' }, { start: 24, span: 4, status: 'booked' }],
    4: [{ start: 2, span: 2, status: 'booked' }, { start: 6, span: 4, status: 'booked' }, { start: 12, span: 2, status: 'booked' }, { start: 16, span: 6, status: 'booked' }, { start: 24, span: 2, status: 'booked' }],
    5: [{ start: 0, span: 2, status: 'booked' }, { start: 4, span: 2, status: 'booked' }, { start: 8, span: 4, status: 'booked' }, { start: 16, span: 6, status: 'booked' }, { start: 24, span: 3, status: 'booked' }],
    6: [{ start: 0, span: 4, status: 'booked' }, { start: 6, span: 2, status: 'booked' }, { start: 10, span: 4, status: 'booked' }, { start: 16, span: 2, status: 'booked' }, { start: 20, span: 4, status: 'booked' }, { start: 26, span: 2, status: 'booked' }],
    7: [{ start: 0, span: 4, status: 'booked' }, { start: 6, span: 4, status: 'joinable', label: 'Drop-In Basketball' }, { start: 12, span: 2, status: 'booked' }, { start: 16, span: 4, status: 'booked' }, { start: 22, span: 2, status: 'booked' }],
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

  // Court detail modal
  const [courtDetailId, setCourtDetailId] = useState<number | null>(null);
  // Customer portal — selected booking for detail view
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);

  // Booking modal state (redesigned)
  const [modalCourtId, setModalCourtId] = useState<number | null>(null);
  const [modalStartSlot, setModalStartSlot] = useState<number | null>(null);
  const [modalEndSlot, setModalEndSlot] = useState<number | null>(null);

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

  // Get slot status
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

    // Slot is available — even if the contiguous gap is shorter than the minimum
    // booking duration. The constraint is enforced in the booking modal, not here.
    // The grid shows it as available so the customer can click it and understand
    // why they can or can't book (e.g., "Only 30 min available, minimum is 60 min").
    return { status: 'available' };
  }

  // Price for a duration
  function getDurationPrice(court: PortalCourt, durationMin: number): number {
    const rate = isLoggedIn ? court.memberRate : court.hourlyRate;
    return Math.round(rate * (durationMin / 60) * 100) / 100;
  }

  // Get all available start times for a court on the current date
  // Only includes starts where minimum booking duration fits
  function getAvailableStartTimes(courtId: number): number[] {
    const starts: number[] = [];
    for (let i = 0; i < TOTAL_SLOTS; i++) {
      const status = getSlotStatus(courtId, i);
      if (status.status === 'available' && getMaxContiguousSlots(courtId, i) >= MIN_BOOKING_SLOTS) {
        starts.push(i);
      }
    }
    return starts;
  }

  // Get valid end times given a court and start slot
  // Only includes durations at or above minimum booking duration
  function getValidEndTimes(courtId: number, startSlot: number): number[] {
    const maxSlots = getMaxContiguousSlots(courtId, startSlot);
    const ends: number[] = [];
    for (let i = MIN_BOOKING_SLOTS; i <= maxSlots; i++) {
      ends.push(startSlot + i);
    }
    return ends;
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

  // Modal court for price display
  const modalCourt = modalCourtId !== null ? PORTAL_COURTS.find(c => c.id === modalCourtId) : null;
  const modalDuration = (modalStartSlot !== null && modalEndSlot !== null) ? (modalEndSlot - modalStartSlot) * 30 : 0;
  const modalPrice = modalCourt && modalDuration > 0 ? getDurationPrice(modalCourt, modalDuration) : 0;

  function handleSlotClick(courtId: number, slotIndex: number) {
    setModalCourtId(courtId);
    const maxAvailable = getMaxContiguousSlots(courtId, slotIndex);
    if (maxAvailable >= MIN_BOOKING_SLOTS) {
      // Viable start — pre-fill start and end times
      setModalStartSlot(slotIndex);
      setModalEndSlot(slotIndex + MIN_BOOKING_SLOTS);
    } else {
      // Constrained slot — open modal but don't pre-fill (let dropdown guide)
      setModalStartSlot(null);
      setModalEndSlot(null);
    }
    setShowBookingModal(true);
  }

  function handleProceedToCheckout() {
    if (modalCourtId === null || modalStartSlot === null || modalEndSlot === null) return;
    setSelectedSlot({ courtId: modalCourtId, slotIndex: modalStartSlot });
    setSelectedDuration((modalEndSlot - modalStartSlot) * 30);
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

  // Courts filtered for booking modal (based on active sport filter)
  const modalFilteredCourts = selectedSport === 'All'
    ? PORTAL_COURTS
    : PORTAL_COURTS.filter(c => c.sports.includes(selectedSport));

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <TooltipProvider delay={0}>
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* ===== FACILITY HEADER ===== */}
      <header className="h-16 border-b bg-card shrink-0 flex items-center justify-between px-5 lg:px-8 z-20" role="banner">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">{FACILITY.initials}</span>
          </div>
          <span className="text-base font-bold text-foreground hidden sm:block">{FACILITY.name}</span>
          <div className="h-4 w-px bg-border hidden lg:block" />
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(FACILITY.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span>{FACILITY.address}</span>
          </a>
          <div className="h-4 w-px bg-border hidden md:block" />
          <a href={`tel:${FACILITY.phone}`} className="flex items-center gap-1.5 text-foreground/70 hover:text-foreground transition-colors">
            <Phone className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium hidden md:inline">{FACILITY.phone}</span>
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
            <nav className="flex-1 py-2 px-1.5 flex flex-col gap-0.5" role="navigation">
              {PORTAL_NAV.map(item => {
                const Icon = item.icon;
                const active = activePortalNav === item.id;
                const btn = (
                  <button
                    onClick={() => { setActivePortalNav(item.id); const viewMap: Record<string, PortalView> = { book: 'grid', bookings: 'my-bookings', programs: 'programs', leagues: 'leagues', membership: 'membership', passes: 'passes', payments: 'payments', profile: 'profile' }; setView(viewMap[item.id] || 'grid'); if (item.id === 'book') setSelectedSlot(null); }}
                    className={`w-full flex items-center ${sidebarExpanded ? 'gap-2.5 px-2.5' : 'justify-center'} py-2.5 rounded-md transition-colors ${
                      active ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted hover:text-foreground font-medium'
                    }`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
                    {sidebarExpanded && <span className="text-sm truncate">{item.label}</span>}
                  </button>
                );
                return sidebarExpanded ? (
                  <div key={item.id}>{btn}</div>
                ) : (
                  <Tooltip key={item.id}>
                    <TooltipTrigger>
                      <div className="w-full">{btn}</div>
                    </TooltipTrigger>
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
                  <div className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-foreground/70 bg-muted/50 px-3 py-1.5 rounded-full">
                    <Clock className="h-4 w-4" />
                    Open {slotToTime(0)} – {slotToTime(TOTAL_SLOTS)}
                  </div>
                </div>

                {/* Row 2: Sport pills */}
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
              <div className="flex-1 overflow-auto relative scroll-smooth" ref={gridRef} style={{ WebkitOverflowScrolling: 'touch' }}>
                {isLoading ? (
                  /* Skeleton loader */
                  <div className="min-w-0">
                    <div className="sticky top-0 z-10 bg-card border-b" style={{ display: 'grid', gridTemplateColumns: `48px repeat(6, minmax(90px, 1fr))` }}>
                      <div className="border-r px-1 py-2 sticky left-0 bg-card z-20" />
                      {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="border-r last:border-r-0 px-1.5 py-2 flex flex-col items-center gap-1">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: `48px repeat(6, minmax(90px, 1fr))` }}>
                      {Array.from({ length: 20 }, (_, row) => (
                        <React.Fragment key={row}>
                          <div className="border-r border-t px-1 flex items-start pt-0.5 sticky left-0 bg-card" style={{ height: SLOT_HEIGHT * 2, gridColumn: 1 }}>
                            <Skeleton className="h-2.5 w-6" />
                          </div>
                          {Array.from({ length: 6 }, (_, col) => (
                            <div key={col} className="border-r last:border-r-0 border-t px-0.5 py-0.5" style={{ height: SLOT_HEIGHT * 2 }}>
                              <Skeleton className="h-full w-full rounded" />
                            </div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : filteredCourts.length === 0 ? (
                  /* Empty state — no courts match sport filter */
                  <div className="flex-1 flex flex-col items-center justify-center py-20 px-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <CalendarDays className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-bold mb-1">No courts available</h3>
                    <p className="text-sm text-muted-foreground font-medium max-w-xs">
                      No {selectedSport.toLowerCase()} courts are available on this date. Try selecting a different sport or date.
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => setSelectedSport('All')}>Show All Sports</Button>
                      <Button variant="outline" size="sm" className="h-8 text-xs font-semibold" onClick={() => { setDateOffset(d => d + 1); setIsLoading(true); }}>Try Tomorrow</Button>
                    </div>
                  </div>
                ) : (
                  <div className="min-w-0">
                    {/* Column headers */}
                    <div
                      className="sticky top-0 z-10 bg-card border-b"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `48px repeat(${filteredCourts.length}, minmax(90px, 1fr))`,
                      }}
                    >
                      <div className="border-r px-1 py-2 flex items-end sticky left-0 z-20 bg-card">
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Time</span>
                      </div>
                      {filteredCourts.map((court, colIdx) => (
                        <div key={court.id} className={`px-1.5 py-2 text-center flex flex-col items-center gap-0.5 ${colIdx < filteredCourts.length - 1 ? 'border-r border-r-border/50' : ''}`}>
                          <button
                            onClick={() => setCourtDetailId(court.id)}
                            className="text-[11px] font-bold leading-tight hover:text-primary transition-colors cursor-pointer flex items-center gap-0.5"
                            aria-label={`View ${court.name} details`}
                          >
                            <span className="sm:hidden">{court.name.replace('Court ', 'C')}</span>
                            <span className="hidden sm:inline">{court.name}</span>
                            <Info className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                          </button>
                          <div className="flex flex-wrap items-center justify-center gap-0.5 mt-0.5">
                            {court.sports.map(sport => (
                              <span key={sport} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${sportBadgeClass(sport)}`}>
                                <span className="hidden sm:inline">{sport}</span>
                                <span className="sm:hidden"><SportIcon sport={sport} className="h-2.5 w-2.5" /></span>
                              </span>
                            ))}
                          </div>
                          {court.amenities.length > 0 && (
                            <div className="hidden sm:flex items-center gap-1 mt-0.5">
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
                        gridTemplateColumns: `48px repeat(${filteredCourts.length}, minmax(90px, 1fr))`,
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
                          <div className="absolute left-[48px] -top-1 h-2 w-2 rounded-full bg-primary/60 -translate-x-1/2" />
                        </div>
                      )}

                      {/* Time labels + hour gridlines — sticky left on mobile */}
                      {Array.from({ length: TOTAL_SLOTS }, (_, slotIdx) => {
                        const isHourBoundary = slotIdx % 2 === 0;
                        const isHalfHour = slotIdx % 2 === 1;
                        // Hour-boundary cells span 2 rows and contain the time label centered
                        if (isHourBoundary) {
                          return (
                            <div
                              key={`time-${slotIdx}`}
                              className="border-r sticky left-0 z-[2] bg-card border-t-[1.5px] border-t-border flex items-center justify-start pl-1 sm:pl-2"
                              style={{ gridColumn: 1, gridRow: `${slotIdx + 1} / span 2` }}
                            >
                              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground tabular-nums leading-none whitespace-nowrap">
                                {slotToGutterTime(slotIdx)}
                              </span>
                            </div>
                          );
                        }
                        // Half-hour cells are covered by the span above, skip rendering
                        return null;
                      })}

                      {/* Court cells */}
                      {filteredCourts.map((court, colIdx) => {
                        const gridCol = colIdx + 2;
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

                          if (slot.status === 'available' && isPast) {
                            // Past available slot — render as unavailable
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 flex items-center justify-center`}
                                style={{ gridColumn: gridCol, gridRow: slotIdx + 1 }}
                              >
                                <div className="w-full h-[calc(100%-3px)] rounded bg-foreground/10" />
                              </div>
                            );
                            slotIdx++;
                          } else if (slot.status === 'available') {
                            const timeStr = slotToShortTime(slotIdx);
                            const isConstrained = getMaxContiguousSlots(court.id, slotIdx) < MIN_BOOKING_SLOTS;
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 flex items-center justify-center`}
                                style={{ gridColumn: gridCol, gridRow: slotIdx + 1 }}
                              >
                                {isConstrained ? (
                                  /* Constrained slot — available but below minimum duration */
                                  <div className="w-full h-[calc(100%-3px)] rounded border border-dashed border-border bg-muted/20 flex items-center justify-center">
                                    <span className="text-[10px] font-medium text-muted-foreground/50 tabular-nums">{timeStr}</span>
                                  </div>
                                ) : (
                                  /* Fully bookable slot */
                                  <button
                                    onClick={() => handleSlotClick(court.id, slotIdx)}
                                    className="w-full h-[calc(100%-3px)] rounded border border-primary/30 bg-primary/[0.06] hover:border-primary/60 hover:bg-primary/15 transition-all flex items-center justify-center group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    aria-label={`Book ${court.name} at ${timeStr}`}
                                  >
                                    <span className="text-xs font-bold text-primary/70 group-hover:text-primary tabular-nums">{timeStr}</span>
                                  </button>
                                )}
                              </div>
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
                                  onClick={() => { setSelectedBookingId('BK-20260321-001'); setShowBookingDetail(true); }}
                                  className="w-full h-full rounded bg-primary border border-primary flex flex-col items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                                  aria-label={`Your booking: ${slotToTime(slotIdx)} – ${slotToTime(slotIdx + rowSpan)}`}
                                >
                                  <span className="text-[11px] font-bold text-white">{slot.label}</span>
                                  {rowSpan > 2 && <span className="text-[10px] font-medium text-white/80">{slotToTime(slotIdx)} – {slotToTime(slotIdx + rowSpan)}</span>}
                                </button>
                              </div>
                            );
                            slotIdx += rowSpan;
                          } else if (slot.status === 'joinable' && slot.label) {
                            if (isPast) {
                              // Past joinable — render as unavailable
                              cells.push(
                                <div
                                  key={`${court.id}-${slotIdx}`}
                                  className={`${borderClass} ${colBorderClass} px-0.5 py-0.5`}
                                  style={{ gridColumn: gridCol, gridRow: `${slotIdx + 1} / span ${rowSpan}` }}
                                >
                                  <div className="w-full h-full rounded bg-foreground/10 flex flex-col items-center justify-center">
                                    <span className="text-[10px] font-semibold text-muted-foreground/70">Unavailable</span>
                                    {rowSpan > 1 && <span className="text-[9px] text-muted-foreground/50">{slotToTime(slotIdx)} – {slotToTime(slotIdx + rowSpan)}</span>}
                                  </div>
                                </div>
                              );
                            } else {
                              cells.push(
                                <div
                                  key={`${court.id}-${slotIdx}`}
                                  className={`${borderClass} ${colBorderClass} px-0.5 py-0.5`}
                                  style={{ gridColumn: gridCol, gridRow: `${slotIdx + 1} / span ${rowSpan}` }}
                                >
                                  <button
                                    onClick={() => handleSlotClick(court.id, slotIdx)}
                                    className="w-full h-full rounded bg-orange-50 border border-orange-200 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                                    aria-label={`Join ${slot.label} at ${slotToTime(slotIdx)}`}
                                  >
                                    <span className="text-xs font-bold text-orange-700">{slot.label}</span>
                                    {rowSpan > 2 && <span className="text-[10px] font-semibold text-orange-600">Join</span>}
                                  </button>
                                </div>
                              );
                            }
                            slotIdx += rowSpan;
                          } else if ((slot.status === 'booked' || slot.status === 'maintenance') && slot.span) {
                            // Unified unavailable block — text inside block
                            const blockStart = slotToTime(slotIdx);
                            const blockEnd = slotToTime(slotIdx + rowSpan);
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 py-0.5`}
                                style={{ gridColumn: gridCol, gridRow: `${slotIdx + 1} / span ${rowSpan}` }}
                              >
                                <div className="w-full h-full rounded bg-foreground/10 flex flex-col items-center justify-center">
                                  <span className="text-[10px] font-semibold text-muted-foreground/70">Unavailable</span>
                                  {rowSpan > 1 && <span className="text-[9px] text-muted-foreground/50">{blockStart} – {blockEnd}</span>}
                                </div>
                              </div>
                            );
                            slotIdx += rowSpan;
                          } else if (slot.status === 'too-short') {
                            // Too-short gap — same unavailable treatment
                            cells.push(
                              <div
                                key={`${court.id}-${slotIdx}`}
                                className={`${borderClass} ${colBorderClass} px-0.5 flex items-center justify-center`}
                                style={{ gridColumn: gridCol, gridRow: slotIdx + 1 }}
                              >
                                <div className="w-full h-[calc(100%-3px)] rounded bg-foreground/10" />
                              </div>
                            );
                            slotIdx++;
                          } else {
                            // Empty/continuation cell
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
              <div className="border-b bg-card px-4 md:px-6 py-3 flex items-center gap-3">
                <button onClick={handleBackToGrid} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Back to schedule">
                  <ChevronLeft className="h-4 w-4" /> Back to schedule
                </button>
                <div className="h-5 w-px bg-border" />
                <h2 className="text-sm font-bold">Complete Your Booking</h2>
              </div>

              {/* Two-column layout */}
              <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
                {/* Left column — form */}
                <div className="lg:col-span-3 space-y-5">

                  {/* Booking summary */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Booking Summary</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm sm:text-base font-bold">{selectedCourt.name} — {selectedCourt.sport}</p>
                          <p className="text-sm text-muted-foreground">{displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-sm text-muted-foreground">{slotToTime(selectedSlot.slotIndex)} – {slotToTime(selectedSlot.slotIndex + selectedDuration / 30)} ({selectedDuration} min)</p>
                          {selectedCourt.amenities.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">{selectedCourt.amenities.map(a => <Badge key={a} variant="outline" className="text-[9px] py-0">{a}</Badge>)}</div>
                          )}
                        </div>
                        <button onClick={() => {
                          setModalCourtId(selectedSlot.courtId);
                          setModalStartSlot(selectedSlot.slotIndex);
                          setModalEndSlot(selectedSlot.slotIndex + selectedDuration / 30);
                          setShowBookingModal(true);
                        }} className="text-xs font-semibold text-primary hover:underline shrink-0">Change</button>
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">First Name *</label><input className="w-full h-10 sm:h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Jane" aria-required="true" /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Last Name *</label><input className="w-full h-10 sm:h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Doe" aria-required="true" /></div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Email *</label><input className="w-full h-10 sm:h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="jane@email.com" type="email" aria-required="true" /></div>
                            <div><label className="text-[11px] font-semibold text-muted-foreground block mb-1">Phone *</label><input className="w-full h-10 sm:h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="(647) 555-1234" type="tel" aria-required="true" /></div>
                          </div>
                        </div>
                      )}

                      {/* Guest players */}
                      {guestPlayers.length > 0 && (
                        <div className="space-y-2">
                          {guestPlayers.map((player, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <input className="flex-1 h-10 sm:h-9 px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder={`Player ${idx + 2} name or email`} value={player} onChange={e => { const next = [...guestPlayers]; next[idx] = e.target.value; setGuestPlayers(next); }} />
                              <button onClick={() => setGuestPlayers(guestPlayers.filter((_, i) => i !== idx))} className="h-10 w-10 sm:h-9 sm:w-9 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground shrink-0" aria-label="Remove player"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setGuestPlayers([...guestPlayers, ''])} className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                        <Plus className="h-3.5 w-3.5" /> Add Player
                      </button>

                      <Separator />

                      {/* Facility-configurable custom fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Number of Players</label>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setPlayerCount(Math.max(1, playerCount - 1))} className="h-10 w-10 sm:h-9 sm:w-9 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Decrease players"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="text-sm font-bold w-8 text-center tabular-nums">{playerCount}</span>
                            <button onClick={() => setPlayerCount(Math.min(8, playerCount + 1))} className="h-10 w-10 sm:h-9 sm:w-9 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Increase players"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Skill Level</label>
                          <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} className="w-full h-10 sm:h-9 px-3 rounded-md border border-border bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40">
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

                {/* Right column — price summary (sticky on desktop, hidden on mobile — shown as bottom bar instead) */}
                <div className="lg:col-span-2 hidden lg:block">
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
                              <input value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoApplied(false); }} placeholder="Promo code" className="flex-1 h-10 sm:h-8 px-3 rounded-md border border-border bg-background text-sm sm:text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
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

                {/* Mobile-only: inline price summary before sticky bar */}
                <div className="lg:hidden space-y-3 pb-32">
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-sm font-bold">Price Breakdown</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between gap-2 text-sm"><span className="text-muted-foreground truncate">{selectedCourt.name} — {selectedDuration} min</span><span className="tabular-nums font-medium shrink-0">${basePrice.toFixed(2)}</span></div>
                      {Object.entries(addOns).filter(([, qty]) => qty > 0).map(([id, qty]) => { const addon = COURT_ADDONS.find(a => a.id === id); return addon ? <div key={id} className="flex justify-between text-sm"><span className="text-muted-foreground">{addon.name} × {qty}</span><span className="tabular-nums font-medium">${(addon.price * qty).toFixed(2)}</span></div> : null; })}
                      {showPromoInput ? (
                        <div className="pt-1"><div className="flex gap-2"><input value={promoCode} onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoApplied(false); }} placeholder="Promo code" className="flex-1 h-10 sm:h-8 px-3 rounded-md border border-border bg-background text-sm sm:text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" /><Button size="sm" variant="outline" className="h-8 text-[10px] font-semibold px-3" onClick={() => { if (promoCode === 'WELCOME20') setPromoApplied(true); }}>Apply</Button></div>{promoApplied && <p className="text-[10px] text-success mt-1 font-semibold">WELCOME20 applied — 20% off!</p>}</div>
                      ) : <button onClick={() => setShowPromoInput(true)} className="text-xs font-semibold text-primary hover:underline pt-1">Have a promo code?</button>}
                      {promoApplied && <div className="flex justify-between text-sm"><span className="text-success">Promo (20%)</span><span className="tabular-nums font-medium text-success">−${promoDiscount.toFixed(2)}</span></div>}
                      <Separator />
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums font-medium">${subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">{FACILITY.taxLabel}</span><span className="tabular-nums font-medium">${tax.toFixed(2)}</span></div>
                      <Separator />
                      <div className="flex justify-between text-base font-bold"><span>Total</span><span className="tabular-nums">${total.toFixed(2)}</span></div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mobile sticky checkout bar */}
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-4 safe-area-bottom">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="shrink-0"><span className="text-[10px] text-muted-foreground font-medium">Total Due</span><div className="text-lg font-bold tabular-nums">${total.toFixed(2)}</div></div>
                  <Button className="h-11 px-4 sm:px-6 text-sm font-bold flex-1 sm:flex-none" disabled={!allAgreed} onClick={handleConfirm}>Confirm Booking</Button>
                </div>
                <p className="text-[9px] text-center text-muted-foreground">Secure payment by Stripe</p>
              </div>
            </div>
          )}

          {/* ===== CONFIRMATION VIEW ===== */}
          {view === 'confirmation' && selectedCourt && selectedSlot && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
                {/* Success header */}
                <div className="text-center mb-6 md:mb-8">
                  <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3 md:mb-4 animate-in zoom-in duration-500">
                    <CheckCircle2 className="h-7 w-7 md:h-8 md:w-8 text-success" />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold">Booking Confirmed!</h1>
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
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(FACILITY.address)}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5"><ExternalLink className="h-3 w-3" />Get directions</a>
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <Button onClick={handleBackToGrid} className="h-10 px-6 text-sm font-semibold w-full sm:w-auto">Book Another Court</Button>
                    {isLoggedIn ? (
                      <Button variant="outline" onClick={() => { setActivePortalNav('bookings'); }} className="h-10 px-6 text-sm font-semibold w-full sm:w-auto">View My Bookings</Button>
                    ) : (
                      <Button variant="outline" onClick={() => setShowSignInModal(true)} className="h-10 px-6 text-sm font-semibold w-full sm:w-auto">Create Account</Button>
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

          {/* ===== MY BOOKINGS VIEW ===== */}
          {view === 'my-bookings' && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">My Bookings</h2>
                  <Button size="sm" className="h-8 text-xs font-semibold" onClick={() => { setActivePortalNav('book'); setView('grid'); }}><Plus className="h-3.5 w-3.5 mr-1" />Book a Court</Button>
                </div>
                <div className="flex border-b border-border">{['Upcoming', 'Recurring', 'Past'].map(tab => (<button key={tab} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'Upcoming' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab}</button>))}</div>
                {/* Upcoming booking cards — tap to open detail modal */}
                {UPCOMING_BOOKINGS_DETAIL.map(bk => (
                  <button
                    key={bk.id}
                    onClick={() => { setSelectedBookingId(bk.id); setShowBookingDetail(true); }}
                    className="w-full text-left"
                  >
                    <Card className={`shadow-sm hover:shadow-md transition-shadow cursor-pointer ${selectedBookingId === bk.id && showBookingDetail ? 'ring-2 ring-primary' : ''}`}>
                      <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold">{bk.court} — {bk.sport}</h3>
                              <Badge className="text-[9px] py-0 bg-green-100 text-green-700">{bk.status}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-0.5">{bk.date} · {bk.time}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold tabular-nums">${bk.pricing.total.toFixed(2)}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{bk.duration}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{bk.players.length} players</span>
                          {bk.addOns.length > 0 && <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" />{bk.addOns.join(', ')}</span>}
                        </div>
                        {/* Compact access hint — just enough to be useful at a glance */}
                        {FACILITY_ACCESS_CONFIG.methods.includes('door-code') && bk.doorCodeAvailable && (
                          <div className="flex items-center gap-2 bg-primary/5 rounded-md px-2.5 py-1.5">
                            <Key className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold text-primary tracking-widest font-mono">{bk.doorCode}</span>
                            <span className="text-[10px] text-muted-foreground font-medium ml-auto">Door Code</span>
                          </div>
                        )}
                        {FACILITY_ACCESS_CONFIG.methods.includes('door-code') && !bk.doorCodeAvailable && (
                          <div className="flex items-center gap-2 bg-muted/30 rounded-md px-2.5 py-1.5">
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground font-medium">Door code available {FACILITY_ACCESS_CONFIG.doorCodeLeadHours}hr before booking</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </button>
                ))}
                {/* Book Again shortcut */}
                <Card className="shadow-sm border-primary/10 bg-primary/[0.02]">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div><div className="text-sm font-bold">Book Again</div><div className="text-xs text-muted-foreground font-medium">Court 1 — Pickleball, 60 min (your last booking)</div></div>
                    <Button size="sm" className="h-8 text-xs font-semibold" onClick={() => { setActivePortalNav('book'); setView('grid'); }}>Book</Button>
                  </CardContent>
                </Card>
                {/* Past bookings */}
                <h3 className="text-sm font-bold text-muted-foreground pt-2">Past Bookings</h3>
                {[{ id: 'BK-20260318-005', court: 'Court 2', sport: 'Pickleball', date: 'Mar 18', time: '7–8 PM', amount: 38.25, status: 'completed', checkin: 'Checked in' }, { id: 'BK-20260315-002', court: 'Court 1', sport: 'Pickleball', date: 'Mar 15', time: '10–11 AM', amount: 38.25, status: 'completed', checkin: 'Checked in' }, { id: 'BK-20260312-001', court: 'Court 5', sport: 'Tennis', date: 'Mar 12', time: '6–8 PM', amount: 102.00, status: 'completed', checkin: 'Checked in' }, { id: 'BK-20260308-004', court: 'Court 1', sport: 'Pickleball', date: 'Mar 8', time: '3–4 PM', amount: 38.25, status: 'cancelled', checkin: '—' }].map(bk => (
                  <div key={bk.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-b-0">
                    <div className="flex-1"><div className="flex items-center gap-2"><span className="text-sm font-medium">{bk.court} — {bk.sport}</span><Badge variant="secondary" className={`text-[9px] py-0 ${bk.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}`}>{bk.status}</Badge></div><p className="text-xs text-muted-foreground font-medium">{bk.date} · {bk.time} · {bk.checkin}</p></div>
                    <div className="text-right"><span className="text-sm font-medium tabular-nums">${bk.amount.toFixed(2)}</span><button className="block text-[10px] font-semibold text-primary hover:underline">Receipt</button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== PROGRAMS VIEW ===== */}
          {view === 'programs' && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
                <h2 className="text-lg font-bold">Programs</h2>
                <div className="flex border-b border-border">{['My Enrollments', 'Browse Programs', 'Book a Pro'].map(tab => (<button key={tab} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'My Enrollments' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab}</button>))}</div>
                {/* Enrolled programs */}
                <Card className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div><h3 className="text-sm font-bold">PB Beginner Clinic</h3><p className="text-xs text-muted-foreground font-medium">Coach Sarah · Tuesdays 6–7 PM · Court 1</p></div>
                      <Badge className="text-[9px] py-0 bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <span>Mar 4 – Apr 22, 2026</span><span>8 sessions</span><span>Attendance: 3/3 (100%)</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">Next session: Tue, Mar 25 · 6:00 PM</div>
                    <div className="flex gap-2"><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">View Details</Button><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold text-destructive hover:text-destructive">Cancel Enrollment</Button></div>
                  </CardContent>
                </Card>
                {/* Waitlisted */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <Info className="h-4 w-4 text-amber-600 shrink-0" /><div className="flex-1"><span className="text-sm font-medium text-amber-800 dark:text-amber-200">Junior Tennis Camp — You are #2 on the waitlist</span><p className="text-xs text-muted-foreground font-medium">We&apos;ll notify you if a spot opens. You won&apos;t be charged until confirmed.</p></div>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold shrink-0">Leave Waitlist</Button>
                </div>
                {/* Browse programs preview */}
                <h3 className="text-sm font-bold text-muted-foreground pt-2">Available Programs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[{ name: 'Advanced PB Drills', instructor: 'Coach Sarah', schedule: 'Thu 7–8:30 PM', sport: 'Pickleball', spots: '4 spots left', price: '$220' }, { name: 'Basketball Open Gym', instructor: 'Staff', schedule: 'Sat & Sun 8–11 AM', sport: 'Basketball', spots: '12 spots left', price: '$15/visit' }, { name: 'VB Skills Workshop', instructor: 'Coach Jess', schedule: 'Wed 5–6:30 PM', sport: 'Volleyball', spots: '8 spots left', price: '$160' }].map(p => (
                    <Card key={p.name} className="shadow-sm"><CardContent className="p-3 space-y-1.5">
                      <div className="flex items-center justify-between"><h4 className="text-sm font-bold">{p.name}</h4><span className="text-xs font-bold text-primary">{p.price}</span></div>
                      <p className="text-xs text-muted-foreground font-medium">{p.instructor} · {p.schedule}</p>
                      <div className="flex items-center justify-between"><Badge variant="secondary" className="text-[9px] py-0">{p.sport}</Badge><span className="text-[10px] text-muted-foreground font-medium">{p.spots}</span></div>
                      <Button variant="outline" size="sm" className="w-full h-7 text-[10px] font-semibold">Register</Button>
                    </CardContent></Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== LEAGUES VIEW ===== */}
          {view === 'leagues' && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
                <h2 className="text-lg font-bold">Leagues & Events</h2>
                <div className="flex border-b border-border">{['My Leagues', 'Browse'].map(tab => (<button key={tab} className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === 'My Leagues' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>{tab}</button>))}</div>
                {/* Active league */}
                <Card className="shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div><h3 className="text-sm font-bold">Spring Pickleball League</h3><p className="text-xs text-muted-foreground font-medium">Round Robin · Doubles · Mar 3 – May 23, 2026</p></div>
                      <Badge className="text-[9px] py-0 bg-blue-100 text-blue-700">In Progress</Badge>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Your Standing</div>
                      <div className="flex items-center gap-3"><span className="text-2xl font-bold text-primary">#2</span><div className="flex-1"><div className="text-sm font-medium">Team Doe & Martin</div><div className="text-xs text-muted-foreground font-medium">6 played · 4W 1L 1D · 13 pts</div></div></div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Next Match</div>
                      <div className="text-sm font-medium">vs. Kitchen Crew · Mon, Mar 24 · 7:00 PM · Court 1</div>
                    </div>
                    <div className="flex gap-2"><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Standings</Button><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Schedule</Button><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Enter Score</Button></div>
                  </CardContent>
                </Card>
                {/* Upcoming match score entry */}
                <Card className="shadow-sm border-amber-200 dark:border-amber-800">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2"><Info className="h-4 w-4 text-amber-600" /><span className="text-sm font-bold text-amber-800 dark:text-amber-200">Score Entry Needed</span></div>
                    <p className="text-xs text-muted-foreground font-medium">Mar 17 match vs. Baseline Bandits — Opponent submitted 11-7, 11-9. Please confirm or dispute within 48 hours.</p>
                    <div className="flex gap-2"><Button size="sm" className="h-7 text-[10px] font-semibold">Confirm Score</Button><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Dispute</Button></div>
                  </CardContent>
                </Card>
                {/* Browse leagues preview */}
                <h3 className="text-sm font-bold text-muted-foreground pt-2">Open for Registration</h3>
                {[{ name: 'Tennis Singles Ladder', format: 'Ladder · Singles', sport: 'Tennis', dates: 'Apr 1 – Jun 30', spots: '6 spots left', fee: '$80' }, { name: 'Corporate Volleyball Social', format: 'Social Mixer · Mixed', sport: 'Volleyball', dates: 'Apr 12', spots: '18 spots left', fee: '$25' }].map(l => (
                  <Card key={l.name} className="shadow-sm"><CardContent className="p-3 flex items-center justify-between">
                    <div><h4 className="text-sm font-bold">{l.name}</h4><p className="text-xs text-muted-foreground font-medium">{l.format} · {l.dates} · {l.spots}</p></div>
                    <div className="text-right"><div className="text-sm font-bold text-primary">{l.fee}</div><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold mt-1">Register</Button></div>
                  </CardContent></Card>
                ))}
              </div>
            </div>
          )}

          {/* ===== MEMBERSHIP VIEW ===== */}
          {view === 'membership' && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
                <h2 className="text-lg font-bold">Membership</h2>
                <Card className="shadow-sm border-primary/20 bg-primary/[0.02]">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center"><Zap className="w-6 h-6 text-primary" /></div><div><h3 className="text-lg font-bold">Gold Membership</h3><p className="text-sm text-muted-foreground font-medium">Active since January 2026</p></div></div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-3">
                      <div><div className="text-[10px] text-muted-foreground font-medium uppercase">Status</div><Badge className="text-[10px] py-0 bg-green-100 text-green-700 mt-0.5">Active</Badge></div>
                      <div><div className="text-[10px] text-muted-foreground font-medium uppercase">Billing Cycle</div><div className="text-sm font-medium">Calendar month</div></div>
                      <div><div className="text-[10px] text-muted-foreground font-medium uppercase">Monthly Price</div><div className="text-sm font-bold">$99.00/mo</div></div>
                      <div><div className="text-[10px] text-muted-foreground font-medium uppercase">Next Billing</div><div className="text-sm font-medium">Apr 1, 2026</div></div>
                      <div><div className="text-[10px] text-muted-foreground font-medium uppercase">Payment Method</div><div className="text-sm font-medium">Visa •4242</div></div>
                      <div><div className="text-[10px] text-muted-foreground font-medium uppercase">Auto-Renew</div><div className="text-sm font-medium">Yes</div></div>
                    </div>
                    <Separator />
                    <div><div className="text-[10px] text-muted-foreground font-medium uppercase mb-2">Benefits</div>
                      <div className="space-y-1.5">{['15% off all court bookings', 'Extended booking window (21 days vs. 14)', 'Priority access to prime time slots', 'Free guest pass (1/month)', '2 membership freezes per year (30 days max)'].map(b => <div key={b} className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" /><span className="text-sm font-medium">{b}</span></div>)}</div>
                    </div>
                    <Separator />
                    <div className="flex gap-2"><Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold flex-1">Upgrade Tier</Button><Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold flex-1">Freeze Membership</Button><Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold flex-1 text-destructive hover:text-destructive">Cancel</Button></div>
                  </CardContent>
                </Card>
                <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Billing History</CardTitle></CardHeader><CardContent>
                  {[{ date: 'Mar 1, 2026', desc: 'Gold Membership — March', amount: 99, status: 'Paid' }, { date: 'Feb 1, 2026', desc: 'Gold Membership — February', amount: 99, status: 'Paid' }, { date: 'Jan 1, 2026', desc: 'Gold Membership — January', amount: 99, status: 'Paid' }].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-b-0"><div><div className="text-sm font-medium">{tx.desc}</div><div className="text-xs text-muted-foreground font-medium">{tx.date}</div></div><div className="text-right"><span className="text-sm font-medium tabular-nums">${tx.amount.toFixed(2)}</span><div className="text-[10px] text-green-600 font-medium">{tx.status}</div></div></div>
                  ))}
                </CardContent></Card>
              </div>
            </div>
          )}

          {/* ===== PASSES VIEW ===== */}
          {view === 'passes' && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
                <h2 className="text-lg font-bold">Passes & Packages</h2>
                {/* Active pass */}
                <Card className="shadow-sm"><CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between"><div><h3 className="text-sm font-bold">10-Visit Court Pass</h3><p className="text-xs text-muted-foreground font-medium">Purchased Feb 15, 2026 · Expires Sep 15, 2026</p></div><Badge className="text-[9px] py-0 bg-green-100 text-green-700">Active</Badge></div>
                  <div><div className="flex justify-between text-xs text-muted-foreground font-medium mb-1"><span>Usage</span><span>7 of 10 remaining</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: '30%' }} /></div></div>
                  <div className="text-xs text-muted-foreground font-medium">Purchased at $340.00 (member price) · Standard: $400.00</div>
                  <div className="h-px bg-border" />
                  <div className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Recent Usage</div>
                  {[{ date: 'Mar 21', desc: 'Court 1 — Pickleball (60 min)' }, { date: 'Mar 18', desc: 'Court 2 — Pickleball (60 min)' }, { date: 'Mar 15', desc: 'Court 1 — Pickleball (60 min)' }].map((u, i) => <div key={i} className="flex justify-between text-xs font-medium py-1"><span className="text-muted-foreground">{u.date}</span><span>{u.desc}</span></div>)}
                </CardContent></Card>
                {/* Lesson package */}
                <Card className="shadow-sm"><CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between"><div><h3 className="text-sm font-bold">5-Lesson Private Package</h3><p className="text-xs text-muted-foreground font-medium">With Coach Sarah · Purchased Mar 1, 2026 · Expires Sep 1, 2026</p></div><Badge className="text-[9px] py-0 bg-green-100 text-green-700">Active</Badge></div>
                  <div><div className="flex justify-between text-xs text-muted-foreground font-medium mb-1"><span>Sessions</span><span>3 of 5 remaining</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: '40%' }} /></div></div>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Book Next Lesson</Button>
                </CardContent></Card>
                {/* Expired pass */}
                <h3 className="text-sm font-bold text-muted-foreground pt-2">Expired</h3>
                <Card className="shadow-sm opacity-60"><CardContent className="p-3 flex items-center justify-between">
                  <div><div className="text-sm font-medium">5-Visit Pass</div><div className="text-xs text-muted-foreground font-medium">Expired Jan 15, 2026 · 1 unused visit</div></div>
                  <Badge variant="secondary" className="text-[9px] py-0">Expired</Badge>
                </CardContent></Card>
                {/* Purchase new */}
                <h3 className="text-sm font-bold text-muted-foreground pt-2">Available Passes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[{ name: '10-Visit Pass', price: '$400', member: '$340', validity: '6 months' }, { name: 'Day Pass', price: '$55', member: '$45', validity: '1 day' }, { name: '5-Lesson Package (Private)', price: '$375', member: '$320', validity: '6 months' }].map(p => (
                    <Card key={p.name} className="shadow-sm"><CardContent className="p-3 space-y-1">
                      <div className="flex justify-between"><h4 className="text-sm font-bold">{p.name}</h4><div className="text-right"><div className="text-sm font-bold text-primary">{p.member}</div><div className="text-[10px] text-muted-foreground line-through">{p.price}</div></div></div>
                      <div className="text-xs text-muted-foreground font-medium">Valid for {p.validity}</div>
                      <Button variant="outline" size="sm" className="w-full h-7 text-[10px] font-semibold">Purchase</Button>
                    </CardContent></Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== PAYMENTS VIEW ===== */}
          {view === 'payments' && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
                <h2 className="text-lg font-bold">Payments</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Card className="shadow-sm"><CardContent className="p-3"><div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Account Credit</div><div className="text-lg font-bold text-primary mt-0.5">$45.00</div><div className="text-[10px] text-muted-foreground font-medium">Expires Jun 8, 2026</div></CardContent></Card>
                  <Card className="shadow-sm"><CardContent className="p-3"><div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Outstanding</div><div className="text-lg font-bold mt-0.5">$0.00</div></CardContent></Card>
                  <Card className="shadow-sm"><CardContent className="p-3"><div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">This Month</div><div className="text-lg font-bold mt-0.5">$197.88</div></CardContent></Card>
                  <Card className="shadow-sm"><CardContent className="p-3"><div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Lifetime</div><div className="text-lg font-bold mt-0.5">$2,847.50</div></CardContent></Card>
                </div>
                {/* Payment methods */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-bold">Payment Methods</CardTitle><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold"><Plus className="h-3 w-3 mr-1" />Add Card</Button></div></CardHeader><CardContent className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border"><div className="flex items-center gap-3"><div className="w-10 h-7 rounded bg-muted flex items-center justify-center"><CreditCard className="w-4 h-4 text-muted-foreground" /></div><div><div className="text-sm font-medium">Visa ending in 4242</div><div className="text-xs text-muted-foreground">Expires 08/2028</div></div></div><div className="flex items-center gap-2"><Badge className="text-[9px] py-0 bg-primary/10 text-primary border-primary/25">Default</Badge><button className="text-xs text-muted-foreground hover:text-foreground font-medium">Remove</button></div></div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border"><div className="flex items-center gap-3"><div className="w-10 h-7 rounded bg-muted flex items-center justify-center"><CreditCard className="w-4 h-4 text-muted-foreground" /></div><div><div className="text-sm font-medium">Mastercard ending in 8811</div><div className="text-xs text-muted-foreground">Expires 11/2027</div></div></div><div className="flex items-center gap-2"><button className="text-xs text-primary hover:underline font-medium">Set Default</button><button className="text-xs text-muted-foreground hover:text-foreground font-medium">Remove</button></div></div>
                </CardContent></Card>
                {/* Gift cards */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Gift Cards</CardTitle></CardHeader><CardContent className="space-y-2">
                  <div className="flex gap-2"><input placeholder="Enter gift card code" className="flex-1 h-8 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" /><Button size="sm" className="h-8 text-xs font-semibold">Redeem</Button></div>
                  <Button variant="outline" size="sm" className="h-8 text-xs font-semibold w-full">Purchase Gift Card</Button>
                </CardContent></Card>
                {/* Transactions */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-bold">Transaction History</CardTitle><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Download CSV</Button></div></CardHeader><CardContent>
                  {[{ date: 'Mar 21, 2026', desc: 'Court 1 — Pickleball (60 min)', amount: -38.25, method: 'Visa •4242', type: 'Booking' }, { date: 'Mar 18, 2026', desc: 'Court 2 — Pickleball (60 min)', amount: -38.25, method: 'Visa •4242', type: 'Booking' }, { date: 'Mar 15, 2026', desc: 'Court 1 — Pickleball (60 min)', amount: -38.25, method: 'Visa •4242', type: 'Booking' }, { date: 'Mar 12, 2026', desc: 'Court 5 — Tennis (120 min)', amount: -102.00, method: 'Visa •4242', type: 'Booking' }, { date: 'Mar 8, 2026', desc: 'Cancellation refund — Court 1', amount: 38.25, method: 'Account Credit', type: 'Refund' }, { date: 'Mar 1, 2026', desc: 'Gold Membership — March', amount: -99.00, method: 'Visa •4242', type: 'Membership' }, { date: 'Feb 15, 2026', desc: '10-Visit Court Pass', amount: -340.00, method: 'Visa •4242', type: 'Pass' }, { date: 'Feb 1, 2026', desc: 'Gold Membership — February', amount: -99.00, method: 'Visa •4242', type: 'Membership' }].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-b-0">
                      <div className="flex-1"><div className="text-sm font-medium">{tx.desc}</div><div className="text-xs text-muted-foreground font-medium">{tx.date} · {tx.method} · {tx.type}</div></div>
                      <div className="text-right"><span className={`text-sm font-bold tabular-nums ${tx.amount > 0 ? 'text-green-600' : ''}`}>{tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}</span><button className="block text-[10px] font-semibold text-primary hover:underline ml-auto">Receipt</button></div>
                    </div>
                  ))}
                </CardContent></Card>
              </div>
            </div>
          )}

          {/* ===== PROFILE VIEW ===== */}
          {view === 'profile' && (
            <div className="flex-1 overflow-y-auto animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-4">
                <h2 className="text-lg font-bold">Profile</h2>
                {/* Profile header */}
                <Card className="shadow-sm"><CardContent className="p-4"><div className="flex items-center gap-4"><Avatar className="h-16 w-16"><AvatarFallback className="text-lg font-bold bg-primary/15 text-primary">JD</AvatarFallback></Avatar><div className="flex-1"><div className="flex items-center gap-2 flex-wrap"><h3 className="text-lg font-bold">Jane Doe</h3><Badge className="text-[10px] py-0 bg-primary/10 text-primary border-primary/25">Gold Member</Badge></div><p className="text-sm text-muted-foreground font-medium">Member since January 2026</p></div><Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold shrink-0">Edit Profile</Button></div></CardContent></Card>
                {/* Contact info */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-bold">Contact Information</CardTitle><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Edit</Button></div></CardHeader><CardContent className="space-y-2.5">
                  {[{ icon: Mail, label: 'Email', value: 'jane.doe@email.com' }, { icon: Phone, label: 'Phone', value: '+1 (416) 555-1234' }, { icon: MapPin, label: 'Address', value: '250 Queen St E, Toronto, ON M5A 1S2' }, { icon: CalendarDays, label: 'Date of Birth', value: 'June 15, 1990' }].map(f => (
                    <div key={f.label} className="flex items-center gap-3"><f.icon className="h-4 w-4 text-muted-foreground shrink-0" /><div><div className="text-[10px] text-muted-foreground font-medium uppercase">{f.label}</div><div className="text-sm font-medium">{f.value}</div></div></div>
                  ))}
                </CardContent></Card>
                {/* Emergency contact */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-bold">Emergency Contact</CardTitle><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Edit</Button></div></CardHeader><CardContent className="space-y-1">
                  <div className="text-sm font-medium">John Doe (Spouse)</div><div className="text-xs text-muted-foreground font-medium">+1 (416) 555-5678</div>
                </CardContent></Card>
                {/* Sport preferences */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-bold">Sport Preferences</CardTitle><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold">Edit</Button></div></CardHeader><CardContent className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Sports Played</span><span className="font-medium">Pickleball, Tennis</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Primary Sport</span><span className="font-medium">Pickleball</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Pickleball Skill</span><span className="font-medium">Intermediate (3.5)</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Tennis Skill</span><span className="font-medium">Beginner (3.0)</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground font-medium">Preferred Times</span><span className="font-medium">Evenings, Weekends</span></div>
                  <Separator />
                  <div className="text-[10px] text-muted-foreground font-medium uppercase mb-1">Auto-Computed (from booking history)</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ label: 'Most Booked Sport', value: 'Pickleball (78%)' }, { label: 'Preferred Court', value: 'Court 1' }, { label: 'Avg Session', value: '68 min' }, { label: 'Frequency', value: '2.1/week' }].map(s => (
                      <div key={s.label}><div className="text-[10px] text-muted-foreground font-medium">{s.label}</div><div className="text-sm font-medium">{s.value}</div></div>
                    ))}
                  </div>
                </CardContent></Card>
                {/* Waivers */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Waivers</CardTitle></CardHeader><CardContent className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border"><div><div className="text-sm font-medium">Facility Liability Waiver</div><div className="text-xs text-muted-foreground font-medium">Signed Jan 15, 2026 · Expires Jan 15, 2027</div></div><Badge className="text-[9px] py-0 bg-green-100 text-green-700">Current</Badge></div>
                </CardContent></Card>
                {/* Notification preferences */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold">Notification Preferences</CardTitle></CardHeader><CardContent className="space-y-3">
                  <div className="text-[10px] text-muted-foreground font-medium uppercase">Channels</div>
                  {[{ label: 'Email notifications', on: true }, { label: 'SMS / Text notifications', on: true }, { label: 'Push notifications (mobile)', on: false }].map(c => (
                    <div key={c.label} className="flex items-center justify-between py-0.5"><span className="text-sm font-medium">{c.label}</span><Checkbox defaultChecked={c.on} /></div>
                  ))}
                  <Separator />
                  <div className="text-[10px] text-muted-foreground font-medium uppercase">Message Types</div>
                  {[{ label: 'Booking confirmations & reminders', on: true, locked: true }, { label: 'Payment receipts & alerts', on: true, locked: true }, { label: 'Marketing & promotions', on: true, locked: false }, { label: 'Facility announcements', on: true, locked: false }].map(t => (
                    <div key={t.label} className="flex items-center justify-between py-0.5"><span className="text-sm font-medium">{t.label}{t.locked && <span className="text-[10px] text-muted-foreground ml-1">(required)</span>}</span><Checkbox defaultChecked={t.on} disabled={t.locked} /></div>
                  ))}
                </CardContent></Card>
                {/* Household */}
                <Card className="shadow-sm"><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-sm font-bold">Household</CardTitle><Button variant="outline" size="sm" className="h-7 text-[10px] font-semibold"><Plus className="h-3 w-3 mr-1" />Add Member</Button></div></CardHeader><CardContent>
                  <div className="flex items-center justify-between py-2"><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] font-bold bg-primary/15 text-primary">JD</AvatarFallback></Avatar><div><div className="text-sm font-medium">Jane Doe</div><div className="text-xs text-muted-foreground font-medium">Primary · Adult</div></div></div><Badge className="text-[9px] py-0 bg-primary/10 text-primary border-primary/25">Primary</Badge></div>
                  <div className="flex items-center justify-between py-2 border-t border-border/50"><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">JD</AvatarFallback></Avatar><div><div className="text-sm font-medium">John Doe</div><div className="text-xs text-muted-foreground font-medium">Member · Adult</div></div></div><button className="text-xs text-muted-foreground hover:text-foreground font-medium">Remove</button></div>
                  <div className="flex items-center justify-between py-2 border-t border-border/50"><div className="flex items-center gap-2"><Avatar className="h-7 w-7"><AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">SD</AvatarFallback></Avatar><div><div className="text-sm font-medium">Sam Doe</div><div className="text-xs text-muted-foreground font-medium">Member · Minor (age 14)</div></div></div><button className="text-xs text-muted-foreground hover:text-foreground font-medium">Remove</button></div>
                </CardContent></Card>
                {/* Account actions */}
                <div className="space-y-2 pt-2">
                  <Button variant="outline" className="w-full h-10 text-sm font-semibold justify-start"><Lock className="h-4 w-4 mr-2" />Change Password</Button>
                  <Button variant="outline" className="w-full h-10 text-sm font-semibold justify-start"><Shield className="h-4 w-4 mr-2" />Privacy & Data</Button>
                  <Button variant="outline" className="w-full h-10 text-sm font-semibold justify-start text-destructive hover:text-destructive" onClick={() => setIsLoggedIn(false)}><LogIn className="h-4 w-4 mr-2" />Sign Out</Button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ===== MOBILE BOTTOM TAB BAR (logged-in only, md:hidden) ===== */}
      {isLoggedIn && (
        <nav className="md:hidden shrink-0 border-t bg-card flex items-center justify-around py-1.5 safe-area-bottom z-30" role="navigation" aria-label="Mobile navigation">
          {[
            { id: 'book', label: 'Book', icon: CalendarDays },
            { id: 'bookings', label: 'Bookings', icon: Ticket },
            { id: 'programs', label: 'Programs', icon: GraduationCap },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'profile', label: 'Profile', icon: UserCircle },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activePortalNav === tab.id || (tab.id === 'book' && activePortalNav === 'book');
            return (
              <button key={tab.id} onClick={() => { setActivePortalNav(tab.id); const viewMap: Record<string, PortalView> = { book: 'grid', bookings: 'my-bookings', programs: 'programs', payments: 'payments', profile: 'profile' }; setView(viewMap[tab.id] || 'grid'); if (tab.id === 'book') setSelectedSlot(null); }}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-md transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.6} />
                <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* ===== BOOKING MODAL (Bottom sheet on mobile, centered modal on desktop) ===== */}
      {showBookingModal && modalCourtId !== null && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => setShowBookingModal(false)} />
          <div className="relative bg-card rounded-t-2xl md:rounded-xl shadow-xl border w-full md:max-w-md md:mx-4 animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 fade-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Drag handle (mobile only) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <div className="p-4 sm:p-5 md:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className="text-lg font-bold">Book a Court</h3>
                <button onClick={() => setShowBookingModal(false)} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Court selector */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Court</label>
                <select
                  value={modalCourtId}
                  onChange={(e) => {
                    const newCourtId = Number(e.target.value);
                    setModalCourtId(newCourtId);
                    setModalStartSlot(null);
                    setModalEndSlot(null);
                  }}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {modalFilteredCourts.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.sports.join(', ')}</option>
                  ))}
                </select>
              </div>

              {/* Date (read-only) */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Date</label>
                <div className="h-10 px-3 rounded-md border border-border bg-muted/30 flex items-center text-sm font-semibold">
                  {displayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Start time */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Start Time</label>
                <select
                  value={modalStartSlot ?? ''}
                  onChange={(e) => {
                    const slot = Number(e.target.value);
                    setModalStartSlot(slot);
                    const minSlots = FACILITY.minBookingMinutes / 30;
                    setModalEndSlot(slot + minSlots);
                  }}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {modalStartSlot === null && <option value="">Select start time</option>}
                  {getAvailableStartTimes(modalCourtId).map(slot => (
                    <option key={slot} value={slot}>{slotToTime(slot)}</option>
                  ))}
                </select>
              </div>

              {/* End time */}
              <div className="mb-5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">End Time</label>
                <select
                  value={modalEndSlot ?? ''}
                  onChange={(e) => setModalEndSlot(Number(e.target.value))}
                  disabled={modalStartSlot === null}
                  className={`w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 ${modalStartSlot === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {modalStartSlot === null ? (
                    <option value="">Select start time first</option>
                  ) : (
                    getValidEndTimes(modalCourtId, modalStartSlot).map(slot => (
                      <option key={slot} value={slot}>{slotToTime(slot)} ({(slot - modalStartSlot!) * 30} min)</option>
                    ))
                  )}
                </select>
              </div>

              {/* Price display */}
              {modalCourt && modalStartSlot !== null && modalEndSlot !== null && modalDuration > 0 && (
                <div className="bg-muted/50 rounded-lg p-3 mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{modalCourt.name} — {modalDuration} min</p>
                    <p className="text-xs text-muted-foreground">{slotToTime(modalStartSlot)} – {slotToTime(modalEndSlot)}</p>
                  </div>
                  <p className="text-lg font-bold tabular-nums">${modalPrice.toFixed(2)}</p>
                </div>
              )}

              {/* Proceed button */}
              <Button
                className="w-full h-11 text-sm font-bold"
                disabled={modalStartSlot === null || modalEndSlot === null}
                onClick={handleProceedToCheckout}
              >
                {modalStartSlot !== null && modalEndSlot !== null
                  ? `Proceed to Checkout — $${modalPrice.toFixed(2)}`
                  : 'Select a time to continue'
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===== COURT DETAIL MODAL ===== */}
      {courtDetailId !== null && (() => {
        const court = PORTAL_COURTS.find(c => c.id === courtDetailId);
        if (!court) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => setCourtDetailId(null)} />
            <div className="relative bg-card rounded-t-2xl md:rounded-xl shadow-xl border w-full md:max-w-lg md:mx-4 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 fade-in duration-200">
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 md:hidden"><div className="w-10 h-1 rounded-full bg-border" /></div>
              {/* Header */}
              <div className="px-5 md:px-6 pb-4 md:py-6 md:border-b flex items-center justify-between shrink-0">
                <h3 className="text-lg font-bold">{court.name}</h3>
                <button onClick={() => setCourtDetailId(null)} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content — scrollable */}
              <div className="p-6 overflow-y-auto space-y-5">
                {/* Image placeholder */}
                <div className="w-full h-48 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Court images uploaded by facility</span>
                </div>

                {/* Sport tags */}
                <div className="flex flex-wrap gap-2">
                  {court.sports.map(sport => (
                    <span key={sport} className={`text-xs font-semibold px-3 py-1 rounded-full border ${sportBadgeClass(sport)}`}>
                      {sport}
                    </span>
                  ))}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  {court.surface && (
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Surface</p>
                      <p className="text-sm font-semibold">{court.surface}</p>
                    </div>
                  )}
                  {court.dimensions && (
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Dimensions</p>
                      <p className="text-sm font-semibold">{court.dimensions}</p>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {court.amenities.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {court.amenities.map(a => (
                        <div key={a} className="flex items-center gap-1.5 text-sm text-foreground bg-muted/50 px-3 py-1.5 rounded-md">
                          <AmenityIcon name={a} className="h-4 w-4 text-muted-foreground" />
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {court.description && (
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">About</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{court.description}</p>
                  </div>
                )}

                {/* Pricing */}
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Pricing</p>
                  <p className="text-sm font-semibold">${court.hourlyRate}/hr</p>
                  {isLoggedIn && <p className="text-xs text-primary font-medium">Member rate: ${court.memberRate}/hr</p>}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t shrink-0">
                <Button className="w-full h-11 text-sm font-bold" onClick={() => {
                  setCourtDetailId(null);
                  const firstAvail = (() => {
                    for (let i = 0; i < TOTAL_SLOTS; i++) {
                      const s = getSlotStatus(court.id, i);
                      if (s.status === 'available' && getMaxContiguousSlots(court.id, i) >= MIN_BOOKING_SLOTS) return i;
                    }
                    return 0;
                  })();
                  handleSlotClick(court.id, firstAvail);
                }}>
                  Book This Court
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ===== AGREEMENT TEXT MODAL ===== */}
      {agreementModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => setAgreementModal(null)} />
          <div className="relative bg-card rounded-t-2xl md:rounded-xl shadow-xl border w-full md:max-w-lg md:mx-4 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 fade-in duration-200">
            <div className="flex justify-center pt-3 pb-1 md:hidden"><div className="w-10 h-1 rounded-full bg-border" /></div>
            <div className="px-5 md:px-6 pb-3 md:py-6 md:border-b flex items-center justify-between shrink-0">
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={() => { setShowSignInModal(false); setSignInSent(false); }} />
          <div className="relative bg-card rounded-t-2xl md:rounded-xl shadow-xl border w-full md:max-w-sm md:mx-4 animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 fade-in duration-200">
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

      {/* ===== BOOKING DETAIL MODAL ===== */}
      {showBookingDetail && selectedBookingId && (() => {
        const bk = UPCOMING_BOOKINGS_DETAIL.find(b => b.id === selectedBookingId);
        if (!bk) return null;
        const closeDetail = () => { setShowBookingDetail(false); setSelectedBookingId(null); };
        return (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={closeDetail} />
            <div className="relative bg-card rounded-t-2xl md:rounded-xl shadow-xl border w-full md:max-w-md md:mx-4 max-h-[92vh] flex flex-col animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 fade-in duration-200">
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 md:hidden"><div className="w-10 h-1 rounded-full bg-border" /></div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1">
                <div className="p-5 md:p-6 space-y-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{bk.court}</h3>
                        <Badge className={`text-[9px] py-0 border ${sportBadgeClass(bk.sport)}`}>{bk.sport}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mt-0.5">{bk.date}</p>
                      <p className="text-sm font-semibold mt-0.5">{bk.time} <span className="text-muted-foreground font-medium">({bk.duration})</span></p>
                    </div>
                    <button onClick={closeDetail} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted transition-colors shrink-0" aria-label="Close">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* ---- ACCESS & CHECK-IN (dynamic based on facility config) ---- */}
                  <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-4 space-y-3">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <DoorOpen className="h-3.5 w-3.5" /> Access & Check-in
                    </p>

                    {/* Door Code */}
                    {FACILITY_ACCESS_CONFIG.methods.includes('door-code') && (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Key className="h-5 w-5 text-primary" /></div>
                        {bk.doorCodeAvailable ? (
                          <div className="flex-1">
                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Door Code</div>
                            <div className="text-2xl font-bold tracking-[0.2em] font-mono text-foreground">{bk.doorCode}</div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Door Code</div>
                            <div className="text-sm font-medium text-muted-foreground">Available {FACILITY_ACCESS_CONFIG.doorCodeLeadHours}hr before your booking</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* QR Code */}
                    {FACILITY_ACCESS_CONFIG.methods.includes('qr-code') && (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><QrCode className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1">
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">QR Code</div>
                          <div className="text-sm font-medium text-primary">Show at entrance</div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold shrink-0">View QR</Button>
                      </div>
                    )}

                    {/* Wallet Pass */}
                    {FACILITY_ACCESS_CONFIG.methods.includes('wallet-pass') && (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Wallet className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1">
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Wallet Pass</div>
                          <div className="text-sm font-medium text-primary">Add to Apple / Google Wallet</div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold shrink-0">Add</Button>
                      </div>
                    )}

                    {/* Smart Lock (would show if configured) */}
                    {FACILITY_ACCESS_CONFIG.methods.includes('smart-lock' as never) && (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Smartphone className="h-5 w-5 text-primary" /></div>
                        <div className="flex-1">
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Smart Lock</div>
                          <div className="text-sm font-medium text-primary">Tap to unlock door</div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold shrink-0">Unlock</Button>
                      </div>
                    )}

                    {/* Front Desk (would show if configured) */}
                    {FACILITY_ACCESS_CONFIG.methods.includes('front-desk' as never) && (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0"><UserCircle className="h-5 w-5 text-muted-foreground" /></div>
                        <div className="flex-1">
                          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Check-in</div>
                          <div className="text-sm font-medium text-muted-foreground">Report to front desk on arrival</div>
                        </div>
                      </div>
                    )}

                    {/* Access window */}
                    <div className="text-[10px] text-muted-foreground font-medium pt-1 border-t border-primary/10">
                      Access valid <span className="font-semibold text-foreground">{bk.accessWindow}</span> ({FACILITY_ACCESS_CONFIG.earlyArrivalBuffer} min early arrival buffer)
                    </div>

                    {/* Check-in instructions */}
                    {FACILITY_ACCESS_CONFIG.checkInInstructions && (
                      <div className="text-[10px] text-muted-foreground font-medium">{FACILITY_ACCESS_CONFIG.checkInInstructions}</div>
                    )}
                  </div>

                  {/* ---- PLAYERS ---- */}
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Players ({bk.players.length})</p>
                    <div className="space-y-1.5">
                      {bk.players.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6"><AvatarFallback className="text-[9px] font-bold">{p.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                          <span className="text-sm font-medium">{p.name}</span>
                          {p.isOrganizer && <Badge variant="secondary" className="text-[8px] py-0">Organizer</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ---- PRICE BREAKDOWN ---- */}
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Price Breakdown</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Court rental ({bk.duration})</span><span className="font-medium">${bk.pricing.base.toFixed(2)}</span></div>
                      {bk.pricing.memberDiscount !== 0 && <div className="flex justify-between text-green-600"><span>Member discount (15%)</span><span className="font-medium">{bk.pricing.memberDiscount > 0 ? '+' : ''}${bk.pricing.memberDiscount.toFixed(2)}</span></div>}
                      {bk.pricing.addOns.map((ao, i) => <div key={i} className="flex justify-between"><span className="text-muted-foreground">{ao.name}</span><span className="font-medium">${ao.price.toFixed(2)}</span></div>)}
                      <Separator className="my-1" />
                      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">${bk.pricing.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Tax (HST 13%)</span><span className="font-medium">${bk.pricing.tax.toFixed(2)}</span></div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-bold"><span>Total</span><span>${bk.pricing.total.toFixed(2)}</span></div>
                    </div>
                  </div>

                  {/* ---- BOOKING INFO ---- */}
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Booking Info</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-mono font-medium text-xs">{bk.id}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Surface</span><span className="font-medium">{bk.surface}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Booked</span><span className="font-medium">{bk.bookedAt}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="font-medium">{bk.paymentMethod}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className="text-[9px] py-0 bg-green-100 text-green-700">{bk.paymentStatus}</Badge></div>
                    </div>
                  </div>

                  {/* ---- QUICK ACTIONS ---- */}
                  <div className="grid grid-cols-4 gap-2">
                    <button className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <CalendarIcon className="h-4.5 w-4.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Calendar</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <Share2 className="h-4.5 w-4.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Share</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <Receipt className="h-4.5 w-4.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Receipt</span>
                    </button>
                    <button className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <Copy className="h-4.5 w-4.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground">Copy Ref</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ---- STICKY FOOTER — Policy-aware actions ---- */}
              <div className="p-4 border-t shrink-0 space-y-2 safe-area-bottom">
                <div className="flex gap-2">
                  {bk.canReschedule && (
                    <Button variant="outline" className="flex-1 h-10 text-sm font-semibold">
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reschedule
                    </Button>
                  )}
                  {bk.canCancel && (
                    <Button variant="outline" className="flex-1 h-10 text-sm font-semibold text-destructive hover:text-destructive">
                      <X className="h-3.5 w-3.5 mr-1.5" /> Cancel
                    </Button>
                  )}
                </div>
                {bk.canCancel && (
                  <p className="text-[10px] text-center text-muted-foreground font-medium">
                    Free cancellation until {bk.cancelDeadline}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

    </div>
    </TooltipProvider>
  );
}
