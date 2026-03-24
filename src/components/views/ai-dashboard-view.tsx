"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  Settings,
  Download,
  PhoneIncoming,
  PhoneOutgoing,
  TrendingUp,
  MessageCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
} from "lucide-react";

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

export default function AIDashboardView() {
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
