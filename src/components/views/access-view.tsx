"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  SPageHeader,
  STabBar,
  SToolbar,
  SSearchInput,
  SFilterPill,
  SMetricCard,
  StatusBadge,
} from "@/components/shared";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
} from "lucide-react";

export default function AccessView() {
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
