"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// Types
type BookingType = 'standard' | 'member' | 'openplay' | 'program' | 'league' | 'event' | 'maintenance' | 'recurring';
type PaymentStatus = 'paid' | 'unpaid' | 'pending' | 'comp';

interface Booking {
  id: string;
  name: string;
  type: BookingType;
  payment: PaymentStatus;
  startSlot: number; // relative to current view start
  duration: number;
  court: number;
  phone?: string;
  email?: string;
  players?: string[];
  notes?: string;
  source?: string;
  checkedIn?: boolean;
}

interface Court {
  name: string;
  sport: string;
  openSlot: number;  // when this court opens (relative to view start)
  closeSlot: number; // when this court closes
}

// Facility config
const FACILITY_OPEN_HOUR = 8;
const FACILITY_CLOSE_HOUR = 22; // 10 PM
const MIN_BOOKING_DURATION = 2; // 2 slots = 1 hour minimum

function buildHours(startHour: number, endHour: number): string[] {
  const result: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    const period = h >= 12 ? 'PM' : 'AM';
    const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
    result.push(`${display} ${period}`);
  }
  return result;
}

function slotToTimeAbs(slot: number, viewStartHour: number): string {
  const totalMinutes = viewStartHour * 60 + slot * 30;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

function slotRangeAbs(start: number, duration: number, viewStartHour: number): string {
  return `${slotToTimeAbs(start, viewStartHour)} – ${slotToTimeAbs(start + duration, viewStartHour)}`;
}

const typeLabels: Record<BookingType, string> = {
  standard: 'Standard', member: 'Member', openplay: 'Open Play',
  program: 'Program', league: 'League', event: 'Event',
  maintenance: 'Maintenance', recurring: 'Recurring',
};

// SLOT_HEIGHT — comfortable but compact
const SLOT_HEIGHT = 22;
const HOUR_HEIGHT = SLOT_HEIGHT * 2;
const TIME_COL = 44;

// Courts — Court 6 closes at 8 PM (earlier than facility)
function buildCourts(viewStartHour: number): Court[] {
  const facOpenSlot = (FACILITY_OPEN_HOUR - viewStartHour) * 2;
  const facCloseSlot = (FACILITY_CLOSE_HOUR - viewStartHour) * 2;
  const court6CloseSlot = (20 - viewStartHour) * 2; // 8 PM

  return [
    { name: 'Court 1', sport: 'Pickleball', openSlot: facOpenSlot, closeSlot: facCloseSlot },
    { name: 'Court 2', sport: 'Pickleball', openSlot: facOpenSlot, closeSlot: facCloseSlot },
    { name: 'Court 3', sport: 'Pickleball', openSlot: facOpenSlot, closeSlot: facCloseSlot },
    { name: 'Court 4', sport: 'Tennis', openSlot: facOpenSlot, closeSlot: facCloseSlot },
    { name: 'Court 5', sport: 'Tennis', openSlot: facOpenSlot, closeSlot: facCloseSlot },
    { name: 'Court 6', sport: 'Basketball', openSlot: facOpenSlot, closeSlot: court6CloseSlot },
  ];
}

// Bookings — slots relative to facility open (8 AM = slot 0 in facility view)
function buildBookings(viewStartHour: number): Booking[] {
  const offset = (FACILITY_OPEN_HOUR - viewStartHour) * 2;
  return [
    // Court 1
    { id: '1', name: 'Jane Doe', type: 'standard', payment: 'paid', startSlot: offset + 0, duration: 2, court: 0, phone: '+1 (647) 555-1234', email: 'jane@example.com', source: 'Online', checkedIn: true },
    { id: '2', name: 'Open Play', type: 'openplay', payment: 'paid', startSlot: offset + 2, duration: 4, court: 0 },
    { id: '3', name: 'Alex M.', type: 'member', payment: 'paid', startSlot: offset + 7, duration: 3, court: 0, phone: '+1 (416) 555-9876', email: 'alex@example.com', source: 'Phone (AI)' },
    // Gap: slot 10-11 (30 min) — UNBOOKABLE
    { id: '4', name: 'Sarah L.', type: 'standard', payment: 'unpaid', startSlot: offset + 11, duration: 2, court: 0, phone: '+1 (905) 555-4567', email: 'sarah@example.com', source: 'Walk-in', notes: 'First-time visitor. Interested in membership.' },
    // Gap: slot 13-13 (30 min) — UNBOOKABLE
    { id: '5', name: 'Walk-in', type: 'standard', payment: 'paid', startSlot: offset + 14, duration: 2, court: 0, source: 'Walk-in' },
    { id: '6', name: 'Evening Open', type: 'openplay', payment: 'paid', startSlot: offset + 18, duration: 4, court: 0 },
    { id: '7', name: 'Night Game', type: 'standard', payment: 'paid', startSlot: offset + 23, duration: 3, court: 0, source: 'Online' },
    // Court 2
    { id: '8', name: 'Mike R.', type: 'member', payment: 'paid', startSlot: offset + 1, duration: 3, court: 1, phone: '+1 (647) 555-2222', email: 'mike@example.com', source: 'Online' },
    { id: '9', name: 'PB Clinic', type: 'program', payment: 'paid', startSlot: offset + 6, duration: 4, court: 1 },
    { id: '10', name: 'Tom K.', type: 'recurring', payment: 'paid', startSlot: offset + 10, duration: 2, court: 1, source: 'Recurring' },
    // Gap: slot 12-12 (30 min) — UNBOOKABLE
    { id: '11', name: 'Emma S.', type: 'standard', payment: 'paid', startSlot: offset + 13, duration: 3, court: 1, source: 'Online' },
    { id: '12', name: 'Drop-In', type: 'openplay', payment: 'paid', startSlot: offset + 18, duration: 4, court: 1 },
    { id: '13', name: 'Lisa P.', type: 'standard', payment: 'pending', startSlot: offset + 23, duration: 2, court: 1, source: 'Phone (AI)', notes: 'Payment link sent via SMS.' },
    { id: '14', name: 'Late PB', type: 'standard', payment: 'paid', startSlot: offset + 26, duration: 2, court: 1, source: 'Online' },
    // Court 3
    { id: '15', name: 'Junior Camp', type: 'program', payment: 'paid', startSlot: offset + 0, duration: 8, court: 2, players: ['J. Smith', 'K. Lee', 'M. Patel', 'A. Brown', 'S. Chen'] },
    { id: '16', name: 'David W.', type: 'member', payment: 'paid', startSlot: offset + 10, duration: 2, court: 2, source: 'Online' },
    { id: '17', name: 'Rachel G.', type: 'standard', payment: 'paid', startSlot: offset + 14, duration: 2, court: 2, source: 'Online' },
    { id: '18', name: 'PB League', type: 'league', payment: 'paid', startSlot: offset + 18, duration: 6, court: 2 },
    { id: '19', name: 'Night PB', type: 'openplay', payment: 'paid', startSlot: offset + 25, duration: 3, court: 2 },
    // Court 4
    { id: '20', name: 'Maintenance', type: 'maintenance', payment: 'comp', startSlot: offset + 0, duration: 4, court: 3, notes: 'Net replacement. Expected 2 hours.' },
    { id: '21', name: 'Tennis Clinic', type: 'program', payment: 'paid', startSlot: offset + 4, duration: 4, court: 3 },
    { id: '22', name: 'Chris B.', type: 'standard', payment: 'paid', startSlot: offset + 9, duration: 3, court: 3, source: 'Online' },
    { id: '23', name: 'Private Lesson', type: 'program', payment: 'paid', startSlot: offset + 14, duration: 2, court: 3 },
    { id: '24', name: 'League Match', type: 'league', payment: 'paid', startSlot: offset + 18, duration: 4, court: 3 },
    { id: '25', name: 'Kevin T.', type: 'standard', payment: 'paid', startSlot: offset + 23, duration: 3, court: 3, source: 'Online' },
    // Court 5
    { id: '26', name: 'League Match', type: 'league', payment: 'paid', startSlot: offset + 0, duration: 4, court: 4 },
    { id: '27', name: 'Anna K.', type: 'member', payment: 'paid', startSlot: offset + 4, duration: 2, court: 4, source: 'Online' },
    { id: '28', name: 'Corp Event', type: 'event', payment: 'paid', startSlot: offset + 8, duration: 6, court: 4, notes: 'Acme Corp team building. 12 attendees.' },
    { id: '29', name: 'Mixed Doubles', type: 'standard', payment: 'paid', startSlot: offset + 16, duration: 3, court: 4, source: 'Online', players: ['J. Park', 'L. Kim'] },
    { id: '30', name: 'Evening Clinic', type: 'program', payment: 'paid', startSlot: offset + 20, duration: 4, court: 4 },
    { id: '31', name: 'Night Tennis', type: 'standard', payment: 'paid', startSlot: offset + 25, duration: 3, court: 4, source: 'Online' },
    // Court 6 — closes at 8 PM (slot offset+24)
    { id: '32', name: 'Open Gym', type: 'openplay', payment: 'paid', startSlot: offset + 0, duration: 6, court: 5 },
    { id: '33', name: 'Youth Practice', type: 'program', payment: 'paid', startSlot: offset + 8, duration: 4, court: 5 },
    { id: '34', name: 'Adult League', type: 'league', payment: 'paid', startSlot: offset + 14, duration: 4, court: 5 },
    { id: '35', name: 'Open Run', type: 'openplay', payment: 'paid', startSlot: offset + 20, duration: 4, court: 5 },
  ];
}

export default function CourtGridPage() {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [showFullDay, setShowFullDay] = useState(false);

  const viewStartHour = showFullDay ? 0 : FACILITY_OPEN_HOUR;
  const viewEndHour = showFullDay ? 24 : FACILITY_CLOSE_HOUR;
  const viewHours = buildHours(viewStartHour, viewEndHour);
  const viewTotalSlots = (viewEndHour - viewStartHour) * 2;
  const courts = buildCourts(viewStartHour);
  const allBookings = buildBookings(viewStartHour);

  // Filter bookings to visible range
  const visibleBookings = allBookings.filter(b => {
    const end = b.startSlot + b.duration;
    return end > 0 && b.startSlot < viewTotalSlots;
  });

  // Find unbookable gaps per court
  function isUnbookable(courtIndex: number, slotIndex: number): boolean {
    const court = courts[courtIndex];
    // Outside this court's hours
    if (slotIndex < court.openSlot || slotIndex >= court.closeSlot) return false;
    // Already booked
    const hasBooking = visibleBookings.some(
      b => b.court === courtIndex && slotIndex >= b.startSlot && slotIndex < b.startSlot + b.duration
    );
    if (hasBooking) return false;
    // Find the gap this slot is in
    const courtBookings = visibleBookings
      .filter(b => b.court === courtIndex)
      .sort((a, b) => a.startSlot - b.startSlot);
    // Measure the contiguous empty block containing this slot
    let gapStart = slotIndex;
    let gapEnd = slotIndex + 1;
    // Expand backward
    while (gapStart > 0 && gapStart > court.openSlot && !courtBookings.some(b => gapStart - 1 >= b.startSlot && gapStart - 1 < b.startSlot + b.duration)) {
      gapStart--;
    }
    // Expand forward
    while (gapEnd < viewTotalSlots && gapEnd < court.closeSlot && !courtBookings.some(b => gapEnd >= b.startSlot && gapEnd < b.startSlot + b.duration)) {
      gapEnd++;
    }
    const gapLength = gapEnd - gapStart;
    return gapLength < MIN_BOOKING_DURATION;
  }

  function isClosed(courtIndex: number, slotIndex: number): boolean {
    const court = courts[courtIndex];
    return slotIndex < court.openSlot || slotIndex >= court.closeSlot;
  }

  function getClosedRanges(courtIndex: number): { start: number; end: number }[] {
    const ranges: { start: number; end: number }[] = [];
    let rangeStart: number | null = null;
    for (let si = 0; si < viewTotalSlots; si++) {
      if (isClosed(courtIndex, si)) {
        if (rangeStart === null) rangeStart = si;
      } else {
        if (rangeStart !== null) { ranges.push({ start: rangeStart, end: si }); rangeStart = null; }
      }
    }
    if (rangeStart !== null) ranges.push({ start: rangeStart, end: viewTotalSlots });
    return ranges;
  }

  function handleBookingClick(booking: Booking, courtName: string) {
    setSelectedBooking(booking);
    setSelectedCourt(courtName);
  }

  // Current time: 10:15 AM
  const currentTimeSlot = (10.25 - viewStartHour) * 2;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="h-0.5 bg-primary shrink-0" />

      <header className="border-b bg-card shrink-0 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-5 h-11 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/COURTSIDE AI logo only v2 Transparent.svg" alt="Courtside AI" width={22} height={22} className="h-5.5 w-5.5" />
            <span className="text-sm font-semibold text-foreground tracking-tight">Courtside AI</span>
            <span className="text-xs text-muted-foreground">/ Courts</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">Wednesday, March 19, 2026</span>
            <Button
              size="sm"
              variant={showFullDay ? "secondary" : "outline"}
              className="h-7 text-[11px] px-3"
              onClick={() => setShowFullDay(!showFullDay)}
            >
              {showFullDay ? 'Show Operating Hours' : 'Show Full Day'}
            </Button>
            <Button size="sm" className="h-8 text-xs px-4">+ New Booking</Button>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-4 px-5 py-1.5 border-b bg-card shrink-0">
        <LegendItem bgColor="bg-primary/25" borderColor="border-primary/40" accentColor="bg-primary" label="Customer Booking" />
        <LegendItem bgColor="bg-info/25" borderColor="border-info/40" accentColor="bg-info" label="Facility Activity" />
        <LegendItem bgColor="bg-foreground/[0.12]" borderColor="border-foreground/20" accentColor="bg-foreground/40" label="Blocked" />
        <div className="h-3 w-px bg-border" />
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-5 rounded-sm relative overflow-hidden border border-destructive/25" style={{ background: 'linear-gradient(rgba(220,38,38,0.06), rgba(220,38,38,0.06)), repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(220,38,38,0.18) 2px, rgba(220,38,38,0.18) 4px)' }} />
          <span className="text-[10px] text-muted-foreground">Unbookable Gap</span>
        </div>
      </div>

      {/* Grid + Panel */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto">
            <div className="min-w-[900px] h-full flex flex-col">
              {/* Court Headers */}
              <div
                className="grid border-b bg-muted/40 shrink-0"
                style={{ gridTemplateColumns: `${TIME_COL}px repeat(${courts.length}, 1fr)` }}
              >
                <div className="border-r" />
                {courts.map((court, i) => (
                  <div key={i} className={`py-1 px-1 text-center ${i < courts.length - 1 ? 'border-r' : ''}`}>
                    <p className="text-xs font-semibold leading-tight">{court.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {court.sport}
                      {court.closeSlot < (FACILITY_CLOSE_HOUR - viewStartHour) * 2 && (
                        <span className="text-destructive/60"> · Closes {slotToTimeAbs(court.closeSlot, viewStartHour)}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Grid Body — scrollable */}
              <div className="flex flex-1 min-h-0 overflow-y-auto">
                {/* Time Column */}
                <div className="shrink-0 border-r bg-background sticky left-0 z-[5]" style={{ width: TIME_COL }}>
                  {viewHours.map((hour, i) => (
                    <div
                      key={i}
                      className={`${i > 0 ? 'border-t border-border/70' : ''} flex items-start`}
                      style={{ height: HOUR_HEIGHT }}
                    >
                      <span className="text-[10px] font-medium text-muted-foreground pl-1 pt-px leading-none select-none tabular-nums">
                        {hour}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Court Columns */}
                <div className="flex-1 relative" style={{ height: viewTotalSlots * SLOT_HEIGHT }}>
                  {/* Grid lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {viewHours.map((_, i) => (
                      <div key={i} style={{ height: HOUR_HEIGHT }}>
                        {i > 0 && <div className="border-t border-border/70" />}
                        <div className="border-t border-dotted border-border/25" style={{ marginTop: i > 0 ? SLOT_HEIGHT - 1 : SLOT_HEIGHT }} />
                      </div>
                    ))}
                  </div>

                  {/* Column dividers */}
                  <div className="absolute inset-0 pointer-events-none flex">
                    {courts.map((_, i) => (
                      <div key={i} className={`flex-1 ${i < courts.length - 1 ? 'border-r border-border/50' : ''}`} />
                    ))}
                  </div>

                  {/* Slot layer: closed, unbookable, bookable */}
                  <div
                    className="absolute inset-0 grid"
                    style={{ gridTemplateColumns: `repeat(${courts.length}, 1fr)` }}
                  >
                    {courts.map((court, courtIndex) => (
                      <div key={courtIndex} className="relative">
                        {/* Closed range overlays — one block per contiguous closed range */}
                        {getClosedRanges(courtIndex).map((range, ri) => (
                          <div
                            key={`closed-${ri}`}
                            className="absolute left-0 right-0 z-[2] group cursor-default flex items-center justify-center bg-foreground/[0.18] border border-foreground/15"
                            style={{
                              top: range.start * SLOT_HEIGHT,
                              height: (range.end - range.start) * SLOT_HEIGHT,
                            }}
                          >
                            <span className="hidden group-hover:block text-xs text-muted-foreground font-semibold select-none tracking-wider uppercase bg-background/70 px-3 py-1 rounded shadow-sm">
                              Closed
                            </span>
                          </div>
                        ))}

                        {/* Open slots: unbookable + bookable */}
                        {Array.from({ length: viewTotalSlots }).map((_, slotIndex) => {
                          if (isClosed(courtIndex, slotIndex)) return null;
                          const hasBooking = visibleBookings.some(
                            b => b.court === courtIndex && slotIndex >= b.startSlot && slotIndex < b.startSlot + b.duration
                          );
                          if (hasBooking) return null;

                          const unbookable = isUnbookable(courtIndex, slotIndex);

                          if (unbookable) {
                            return (
                              <div
                                key={slotIndex}
                                className="absolute left-0 right-0 cursor-not-allowed group/ub flex items-center justify-center"
                                style={{
                                  top: slotIndex * SLOT_HEIGHT,
                                  height: SLOT_HEIGHT,
                                  background: `
                                    linear-gradient(rgba(220,38,38,0.06), rgba(220,38,38,0.06)),
                                    repeating-linear-gradient(-45deg, transparent, transparent 2px, rgba(220,38,38,0.18) 2px, rgba(220,38,38,0.18) 4px)
                                  `,
                                }}
                              >
                                <span className="hidden group-hover/ub:block text-[10px] text-destructive/70 font-semibold select-none">
                                  Too short
                                </span>
                              </div>
                            );
                          }

                          // Bookable
                          return (
                            <div
                              key={slotIndex}
                              className="absolute left-0 right-0 hover:bg-primary/[0.06] transition-colors cursor-pointer z-[1] group flex items-center justify-center"
                              style={{ top: slotIndex * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                            >
                              <span className="hidden group-hover:block text-[10px] text-muted-foreground/60 font-medium select-none">
                                {slotToTimeAbs(slotIndex, viewStartHour)}
                              </span>
                            </div>
                          );
                        })}

                        {/* Booking blocks */}
                        {visibleBookings
                          .filter(b => b.court === courtIndex)
                          .map(booking => (
                            <BookingBlock
                              key={booking.id}
                              booking={booking}
                              courtName={court.name}
                              viewStartHour={viewStartHour}
                              isSelected={selectedBooking?.id === booking.id}
                              onClick={() => handleBookingClick(booking, court.name)}
                            />
                          ))}
                      </div>
                    ))}
                  </div>

                  {/* Current time indicator */}
                  {currentTimeSlot >= 0 && currentTimeSlot < viewTotalSlots && (
                    <div
                      className="absolute left-0 right-0 pointer-events-none z-20 flex items-center"
                      style={{ top: currentTimeSlot * SLOT_HEIGHT }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-destructive -ml-0.5 shadow-sm" />
                      <div className="flex-1 h-px bg-destructive/50" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedBooking && (
          <div className="w-80 border-l bg-card shrink-0 flex flex-col overflow-hidden shadow-lg animate-in slide-in-from-right-5 duration-200">
            <BookingDetailPanel
              booking={selectedBooking}
              courtName={selectedCourt}
              viewStartHour={viewStartHour}
              onClose={() => { setSelectedBooking(null); setSelectedCourt(''); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================
   Booking Block
   ======================================== */
function BookingBlock({ booking, courtName, viewStartHour, isSelected, onClick }: {
  booking: Booking; courtName: string; viewStartHour: number; isSelected: boolean; onClick: () => void;
}) {
  function getStyles(type: BookingType) {
    switch (type) {
      case 'standard': case 'member': case 'recurring':
        return { bg: 'bg-primary/25', hover: 'hover:bg-primary/35', border: 'border-primary/40', text: 'text-primary', accent: 'bg-primary' };
      case 'program': case 'league': case 'openplay': case 'event':
        return { bg: 'bg-info/25', hover: 'hover:bg-info/35', border: 'border-info/40', text: 'text-info', accent: 'bg-info' };
      case 'maintenance':
        return { bg: 'bg-foreground/[0.12]', hover: 'hover:bg-foreground/[0.16]', border: 'border-foreground/20', text: 'text-muted-foreground', accent: 'bg-foreground/40' };
    }
  }

  const styles = getStyles(booking.type);
  const top = booking.startSlot * SLOT_HEIGHT;
  const height = booking.duration * SLOT_HEIGHT;
  const isCompact = height < 20;
  const isMedium = height >= 20 && height < 36;
  const timeRange = slotRangeAbs(booking.startSlot, booking.duration, viewStartHour);
  const mins = booking.duration * 30;
  const dur = mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 ? `${mins % 60}m` : ''}` : `${mins}m`;

  return (
    <div
      onClick={onClick}
      className={`absolute left-px right-px rounded-sm border ${styles.bg} ${styles.border} ${styles.hover} ${styles.text} hover:shadow-sm transition-all cursor-pointer overflow-hidden z-10 group/block ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}`}
      style={{ top, height }}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l ${styles.accent}`} />
      <div className={`pl-1.5 pr-1 h-full ${isCompact || isMedium ? 'flex items-center gap-1 py-0' : 'py-0.5'}`}>
        {isCompact ? (
          <span className="text-[9px] font-semibold truncate">{booking.name}</span>
        ) : isMedium ? (
          <>
            <span className="text-[11px] font-semibold truncate">{booking.name}</span>
            <PaymentIndicator status={booking.payment} compact />
          </>
        ) : (
          <>
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-semibold truncate">{booking.name}</span>
              <PaymentIndicator status={booking.payment} compact={false} />
            </div>
            <p className="text-[9px] opacity-60 leading-tight group-hover/block:hidden">{dur}</p>
            <p className="text-[9px] opacity-80 leading-tight hidden group-hover/block:block font-medium">{timeRange}</p>
          </>
        )}
      </div>
    </div>
  );
}

/* ========================================
   Detail Panel
   ======================================== */
function BookingDetailPanel({ booking, courtName, viewStartHour, onClose }: {
  booking: Booking; courtName: string; viewStartHour: number; onClose: () => void;
}) {
  const timeRange = slotRangeAbs(booking.startSlot, booking.duration, viewStartHour);
  const mins = booking.duration * 30;
  const dur = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`.trim() : `${mins} min`;

  const statusStyles: Record<PaymentStatus, string> = {
    paid: 'bg-success/15 text-success border-success/30',
    unpaid: 'bg-warning/15 text-warning border-warning/30',
    pending: 'bg-secondary text-muted-foreground border-border',
    comp: 'bg-muted text-muted-foreground border-border',
  };
  const statusLabels: Record<PaymentStatus, string> = {
    paid: 'Paid', unpaid: 'Unpaid', pending: 'Pending', comp: 'Complimentary',
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">Booking Details</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none">×</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-foreground">{booking.name}</h4>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge variant="outline" className="text-[10px] py-0">{typeLabels[booking.type]}</Badge>
            <Badge className={`text-[10px] py-0 border ${statusStyles[booking.payment]}`}>{statusLabels[booking.payment]}</Badge>
            {booking.checkedIn !== undefined && (
              <Badge className={`text-[10px] py-0 border ${booking.checkedIn ? 'bg-success/15 text-success border-success/30' : 'bg-secondary text-muted-foreground border-border'}`}>
                {booking.checkedIn ? '✓ Checked In' : 'Not Checked In'}
              </Badge>
            )}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <DetailRow label="Time" value={timeRange} />
          <DetailRow label="Duration" value={dur} />
          <DetailRow label="Court" value={courtName} />
          {booking.source && <DetailRow label="Source" value={booking.source} />}
        </div>
        <Separator />
        {(booking.phone || booking.email) && (
          <>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</p>
              {booking.phone && <DetailRow label="Phone" value={booking.phone} />}
              {booking.email && <DetailRow label="Email" value={booking.email} />}
            </div>
            <Separator />
          </>
        )}
        {booking.players && booking.players.length > 0 && (
          <>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Players ({booking.players.length})</p>
              {booking.players.map((p, i) => <p key={i} className="text-sm text-foreground">{p}</p>)}
            </div>
            <Separator />
          </>
        )}
        {booking.notes && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</p>
            <p className="text-sm text-foreground leading-relaxed">{booking.notes}</p>
          </div>
        )}
      </div>
      <div className="border-t px-4 py-3 space-y-2">
        {booking.payment === 'unpaid' && <Button className="w-full h-8 text-xs">Send Payment Link</Button>}
        {booking.checkedIn === false && booking.payment === 'paid' && <Button className="w-full h-8 text-xs">Check In</Button>}
        <div className="flex gap-2">
          <Button className="flex-1 h-8 text-xs" variant="outline">Reschedule</Button>
          <Button className="flex-1 h-8 text-xs" variant="outline">Cancel</Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function PaymentIndicator({ status, compact }: { status: PaymentStatus; compact: boolean }) {
  const s = compact ? 'text-[7px]' : 'text-[9px]';
  switch (status) {
    case 'paid': return <span className={`${s} opacity-40 shrink-0`}>✓</span>;
    case 'unpaid': return <span className={`${s} font-bold bg-warning text-warning-foreground rounded px-0.5 uppercase tracking-wide shrink-0`}>UNPAID</span>;
    case 'pending': return <span className={`${s} font-bold bg-secondary text-muted-foreground rounded px-0.5 uppercase tracking-wide shrink-0`}>PENDING</span>;
    case 'comp': return <span className={`${s} font-medium bg-muted text-muted-foreground rounded px-0.5 shrink-0`}>COMP</span>;
  }
}

function LegendItem({ bgColor, borderColor, accentColor, label }: { bgColor: string; borderColor: string; accentColor: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-3 w-5 rounded-sm border ${bgColor} ${borderColor} relative overflow-hidden`}>
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${accentColor}`} />
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
