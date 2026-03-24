"use client";

import { useState } from "react";
import { Search, TrendingUp, TrendingDown, ChevronDown, CalendarDays, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarWidget } from "@/components/ui/calendar";

export const statusColors: Record<string, string> = {
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

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const colors = statusColors[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${colors} ${className || ''}`}>{status.replace(/_/g, ' ')}</span>;
}

export function SMetricCard({ label, value, trend, trendUp }: { label: string; value: string; trend?: string; trendUp?: boolean }) {
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

export function SPageHeader({ title, badge, children }: { title: string; badge?: string; children?: React.ReactNode }) {
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

export function SToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[48px] flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-0 border-b border-border bg-card/50 shrink-0 flex-wrap">
      {children}
    </div>
  );
}

export function SSearchInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="h-8 pl-8 pr-3 text-sm border border-border rounded-md bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 w-full md:w-56" />
    </div>
  );
}

export function SFilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`h-7 px-3 rounded-md text-[11px] font-bold transition-colors ${active ? 'bg-foreground text-background' : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      {label}
    </button>
  );
}

export function STabBar({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
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

export const DATE_PRESETS = [
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

export function SDateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
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
