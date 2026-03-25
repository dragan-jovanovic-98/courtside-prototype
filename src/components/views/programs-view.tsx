"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, STabBar, SToolbar, SSearchInput, SFilterPill } from "@/components/shared";
import { Plus, X, MoreHorizontal, Users, Calendar, MapPin, Star } from "lucide-react";

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

export default function ProgramsView() {
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
      <STabBar tabs={['My Programs', 'Instructors']} active={tab} onChange={(t) => { setTab(t); setSelectedProgram(null); setSelectedInstructor(null); }} actions={
        <Button className="h-8 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />Create Program</Button>
      } />
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
