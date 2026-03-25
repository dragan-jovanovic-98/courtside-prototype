"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge, STabBar, SToolbar, SSearchInput, SFilterPill } from "@/components/shared";
import { Plus, Trophy, Calendar, Users, DollarSign, X, CheckCircle2, MoreHorizontal } from "lucide-react";

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

export default function LeaguesView() {
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
      <STabBar tabs={['All', 'Leagues', 'Tournaments', 'Events']} active={tab} onChange={setTab} actions={
        <Button className="h-8 text-xs font-bold px-5 btn-primary-modern"><Plus className="w-3.5 h-3.5 mr-1.5" />Create League</Button>
      } />
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
