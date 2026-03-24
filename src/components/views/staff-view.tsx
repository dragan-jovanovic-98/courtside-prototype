"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, SPageHeader, STabBar, SToolbar, SSearchInput, SFilterPill } from "@/components/shared";
import { ArrowLeft, ChevronRight, Mail, Phone, Pencil, MoreHorizontal, Users, GraduationCap, Power, Ban, UserPlus, X, Send, CheckCircle2 } from "lucide-react";

const MOCK_STAFF = [
  { id: 'S001', name: 'Dragan Jovanovic', email: 'dragan@courtsideai.com', phone: '+1 (416) 555-0001', role: 'owner' as const, status: 'active' as const, hasCustomPerms: false, lastActive: 'Just now', dateAdded: 'Jan 1, 2025', addedBy: 'System', emergencyContact: 'Ana Jovanovic — +1 (416) 555-9901', hasCustomerProfile: true, hasInstructorProfile: false },
  { id: 'S002', name: 'Sarah Mitchell', email: 'sarah.m@courtsideai.com', phone: '+1 (647) 555-0002', role: 'director' as const, status: 'active' as const, hasCustomPerms: false, lastActive: '2h ago', dateAdded: 'Mar 1, 2025', addedBy: 'Dragan Jovanovic (Owner)', emergencyContact: 'James Mitchell — +1 (647) 555-9902', hasCustomerProfile: false, hasInstructorProfile: false },
  { id: 'S003', name: 'Mike Thompson', email: 'mike.t@courtsideai.com', phone: '+1 (905) 555-0003', role: 'manager' as const, status: 'active' as const, hasCustomPerms: true, lastActive: '1h ago', dateAdded: 'Jun 15, 2025', addedBy: 'Sarah Mitchell (Director)', emergencyContact: 'Linda Thompson — +1 (905) 555-9903', hasCustomerProfile: true, hasInstructorProfile: false },
  { id: 'S004', name: 'Jessica Wong', email: 'jess.w@courtsideai.com', phone: '+1 (416) 555-0004', role: 'front_desk' as const, status: 'active' as const, hasCustomPerms: false, lastActive: '30m ago', dateAdded: 'Sep 1, 2025', addedBy: 'Mike Thompson (Manager)', emergencyContact: 'Kevin Wong — +1 (416) 555-9904', hasCustomerProfile: false, hasInstructorProfile: false },
  { id: 'S005', name: 'Coach Sarah', email: 'coachsarah@email.com', phone: '+1 (647) 555-0005', role: 'instructor' as const, status: 'active' as const, hasCustomPerms: true, lastActive: '3h ago', dateAdded: 'Oct 15, 2025', addedBy: 'Dragan Jovanovic (Owner)', emergencyContact: 'Tom Chen — +1 (647) 555-9905', hasCustomerProfile: true, hasInstructorProfile: true },
  { id: 'S006', name: 'Daniel Lee', email: 'daniel.l@email.com', phone: '+1 (905) 555-0006', role: 'instructor' as const, status: 'deactivated' as const, hasCustomPerms: false, lastActive: 'Feb 10, 2026', dateAdded: 'Nov 1, 2025', addedBy: 'Sarah Mitchell (Director)', emergencyContact: 'Grace Lee — +1 (905) 555-9906', hasCustomerProfile: true, hasInstructorProfile: true },
  { id: 'S007', name: 'Emily Chen', email: 'emily.c@courtsideai.com', phone: '+1 (416) 555-0007', role: 'view_only' as const, status: 'pending' as const, hasCustomPerms: false, lastActive: 'Never', dateAdded: 'Mar 20, 2026', addedBy: 'Mike Thompson (Manager)', emergencyContact: '', hasCustomerProfile: false, hasInstructorProfile: false },
];
const STAFF_PERMISSIONS = [
  { section: 'Courts', perms: ['View schedule', 'Create bookings', 'Cancel any booking', 'Override booking rules', 'Manage court settings'] },
  { section: 'Customers', perms: ['View customer profiles', 'Create customers', 'Edit profiles', 'Merge customers', 'Delete/archive'] },
  { section: 'Billing', perms: ['View transactions', 'Process refunds', 'Manage invoices', 'View financial reports', 'Manage promo codes'] },
  { section: 'Programs', perms: ['View programs', 'Create/edit programs', 'Manage enrollment', 'Mark attendance', 'Manage instructors'] },
  { section: 'Leagues', perms: ['View leagues', 'Create/edit leagues', 'Manage registrations', 'Enter scores', 'Manage brackets'] },
  { section: 'Staff', perms: ['View staff list', 'Invite staff', 'Change roles', 'Customize permissions', 'Deactivate staff'] },
];
const STAFF_ACTIVITY = [
  { time: 'Mar 21, 10:15 AM', action: 'Created booking — Court 1, Jane Doe', entity: 'Booking #BK-2026-0342' },
  { time: 'Mar 21, 9:45 AM', action: 'Processed refund — $45.00 to Kevin Nguyen', entity: 'Transaction #T010' },
  { time: 'Mar 21, 9:30 AM', action: 'Checked in customer — Mike Russo, Court 6', entity: 'Check-in' },
  { time: 'Mar 20, 8:00 PM', action: 'Closed register — Front Desk, variance $0.00', entity: 'Register Session' },
  { time: 'Mar 20, 6:15 PM', action: 'Updated customer profile — Lisa Park', entity: 'Customer #C007' },
  { time: 'Mar 20, 4:30 PM', action: 'Enrolled student in PB Clinic — Rachel Gomez', entity: 'Program #P001' },
  { time: 'Mar 20, 2:00 PM', action: 'Created manual payment — $65.00 cash, Mike Russo', entity: 'Transaction #T005' },
  { time: 'Mar 20, 11:00 AM', action: 'Sent campaign — Spring Promo to 147 customers', entity: 'Campaign #C002' },
  { time: 'Mar 19, 5:00 PM', action: 'Updated court settings — Court 6 closing time', entity: 'Court 6' },
  { time: 'Mar 19, 9:00 AM', action: 'Opened register — Front Desk, float $200.00', entity: 'Register Session' },
];

export default function StaffView() {
  const [selectedStaff, setSelectedStaff] = useState<typeof MOCK_STAFF[0] | null>(null);
  const [staffTab, setStaffTab] = useState('Overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingPerms, setEditingPerms] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFirstName, setInviteFirstName] = useState('');
  const [inviteLastName, setInviteLastName] = useState('');
  const [inviteRole, setInviteRole] = useState('front_desk');
  const [inviteCustomPerms, setInviteCustomPerms] = useState(false);
  const ROLE_FILTERS = [
    { value: 'all', label: 'All Roles' },
    { value: 'owner', label: 'Owner' },
    { value: 'director', label: 'Director' },
    { value: 'manager', label: 'Manager' },
    { value: 'front_desk', label: 'Front Desk' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'view_only', label: 'View-Only' },
  ];
  if (selectedStaff) {
    return (
      <>
        <div className="h-16 flex items-center px-6 bg-card border-b border-border shrink-0">
          <button onClick={() => setSelectedStaff(null)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mr-4"><ArrowLeft className="w-4 h-4" />Staff</button>
          <ChevronRight className="w-4 h-4 text-muted-foreground mr-2" />
          <span className="text-base font-bold">{selectedStaff.name}</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">{selectedStaff.name.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2"><h2 className="text-lg font-bold">{selectedStaff.name}</h2><StatusBadge status={selectedStaff.role} /><StatusBadge status={selectedStaff.status} />{selectedStaff.hasCustomPerms && <Badge variant="secondary" className="text-[10px]">Custom Perms</Badge>}</div>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selectedStaff.email}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selectedStaff.phone}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><Pencil className="w-3 h-3 mr-1.5" />Edit</Button>
                <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern"><MoreHorizontal className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          </div>
          <STabBar tabs={['Overview', 'Permissions', 'Activity']} active={staffTab} onChange={setStaffTab} />
          <div className="p-6 space-y-4">
            {staffTab === 'Overview' && (<>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Contact Information</div>
                  <div className="space-y-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Email:</span> <span className="text-sm font-medium">{selectedStaff.email}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Phone:</span> <span className="text-sm font-medium">{selectedStaff.phone}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Emergency Contact:</span> <span className="text-sm font-medium">{selectedStaff.emergencyContact || <span className="italic text-muted-foreground">Not provided</span>}</span></div>
                  </div>
                </div>
                <div className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Operational Info</div>
                  <div className="space-y-2">
                    <div><span className="text-[11px] text-muted-foreground font-medium">Date Added:</span> <span className="text-sm font-medium">{selectedStaff.dateAdded}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Added by:</span> <span className="text-sm font-medium">{selectedStaff.addedBy}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Last Active:</span> <span className="text-sm font-medium">{selectedStaff.lastActive}</span></div>
                    <div><span className="text-[11px] text-muted-foreground font-medium">Role:</span> <span className="text-sm font-medium capitalize">{selectedStaff.role.replace(/_/g, ' ')}</span></div>
                  </div>
                </div>
              </div>
              {(selectedStaff.hasCustomerProfile || selectedStaff.hasInstructorProfile) && (
                <div className="card-elevated rounded-lg p-4 space-y-3">
                  <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Linked Records</div>
                  <div className="space-y-2">
                    {selectedStaff.hasCustomerProfile && (
                      <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"><Users className="w-3.5 h-3.5" />Customer Profile</button>
                    )}
                    {selectedStaff.hasInstructorProfile && (
                      <button className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"><GraduationCap className="w-3.5 h-3.5" />Instructor Profile</button>
                    )}
                  </div>
                </div>
              )}
              <div className="card-elevated rounded-lg p-4 space-y-2">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Internal Notes</div>
                <p className="text-sm text-muted-foreground font-medium italic">No notes for this staff member.</p>
              </div>
              {selectedStaff.role !== 'owner' && (
                <div className="pt-2">
                  {selectedStaff.status === 'deactivated' ? (
                    <Button variant="outline" className="h-9 text-xs font-bold text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"><Power className="w-3.5 h-3.5 mr-1.5" />Reactivate Staff Member</Button>
                  ) : (
                    <Button variant="outline" className="h-9 text-xs font-bold text-destructive border-destructive/30 hover:bg-destructive/5"><Ban className="w-3.5 h-3.5 mr-1.5" />Deactivate Staff Member</Button>
                  )}
                </div>
              )}
            </>)}
            {staffTab === 'Permissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">Permission Overrides</h3>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Customize this staff member&apos;s access beyond their role defaults</p>
                  </div>
                  {!editingPerms ? (
                    <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern" onClick={() => setEditingPerms(true)}><Pencil className="w-3 h-3 mr-1.5" />Edit Permissions</Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" className="h-8 text-[11px] font-bold btn-outline-modern" onClick={() => setEditingPerms(false)}>Cancel</Button>
                      <Button className="h-8 text-[11px] font-bold px-4 btn-primary-modern" onClick={() => setEditingPerms(false)}>Save</Button>
                    </div>
                  )}
                </div>
                {STAFF_PERMISSIONS.map(section => (
                  <div key={section.section} className="card-elevated rounded-lg p-4 space-y-2">
                    <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{section.section}</div>
                    <div className="space-y-1.5">
                      {section.perms.map((perm, i) => {
                        const hasAccess = selectedStaff.role === 'owner' || (selectedStaff.role === 'director' && i < 4) || (selectedStaff.role === 'manager' && i < 3) || (selectedStaff.role === 'front_desk' && i < 2) || (selectedStaff.role === 'instructor' && i < 1);
                        return (
                          <div key={perm} className={`flex items-center gap-2 ${editingPerms ? 'cursor-pointer hover:bg-muted/30 -mx-1 px-1 py-0.5 rounded' : ''}`}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${hasAccess ? 'bg-primary border-primary' : 'border-border'} ${editingPerms ? 'ring-1 ring-primary/20' : ''}`}>
                              {hasAccess && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm font-medium ${hasAccess ? '' : 'text-muted-foreground'}`}>{perm}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {staffTab === 'Activity' && (
              <div className="card-elevated rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Recent Activity</h3></div>
                <div className="divide-y divide-border/50">
                  {STAFF_ACTIVITY.map((act, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div><div className="text-sm font-medium">{act.action}</div><div className="text-xs text-primary font-medium mt-0.5">{act.entity}</div></div>
                        <div className="text-xs text-muted-foreground font-medium whitespace-nowrap ml-4">{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <SPageHeader title="Staff" badge={`${MOCK_STAFF.length} members`}><Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setInviteModalOpen(true)}><UserPlus className="w-3.5 h-3.5 mr-1.5" />Invite Staff</Button></SPageHeader>
      <SToolbar>
        <SSearchInput placeholder="Search by name or email..." value={search} onChange={setSearch} />
        <div className="h-4 w-px bg-border mx-1" />
        <SFilterPill label="All" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
        <SFilterPill label="Active" active={statusFilter === 'active'} onClick={() => setStatusFilter('active')} />
        <SFilterPill label="Deactivated" active={statusFilter === 'deactivated'} onClick={() => setStatusFilter('deactivated')} />
        <div className="h-4 w-px bg-border mx-1" />
        {ROLE_FILTERS.map(rf => (
          <SFilterPill key={rf.value} label={rf.label} active={roleFilter === rf.value} onClick={() => setRoleFilter(rf.value)} />
        ))}
      </SToolbar>
      <div className="flex-1 overflow-y-auto p-3 md:p-6">
        <div className="card-elevated rounded-lg overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {['Name', 'Role', 'Email', 'Phone', 'Status', 'Perms', 'Last Active', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
            </tr></thead>
            <tbody>{MOCK_STAFF.filter(s => {
              if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
              if (statusFilter === 'active' && s.status !== 'active') return false;
              if (statusFilter === 'deactivated' && s.status !== 'deactivated') return false;
              if (roleFilter !== 'all' && s.role !== roleFilter) return false;
              return true;
            }).map(s => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedStaff(s); setStaffTab('Overview'); setEditingPerms(false); }}>
                <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar className="h-7 w-7"><AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">{s.name.split(' ').map(w => w[0]).join('')}</AvatarFallback></Avatar><span className="text-sm font-medium">{s.name}</span></div></td>
                <td className="px-4 py-2.5"><StatusBadge status={s.role} /></td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{s.email}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{s.phone}</td>
                <td className="px-4 py-2.5"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-2.5">{s.hasCustomPerms && <Badge variant="secondary" className="text-[10px]">Custom</Badge>}</td>
                <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{s.lastActive}</td>
                <td className="px-4 py-2.5"><button className="p-1 rounded hover:bg-muted" onClick={e => e.stopPropagation()}><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {/* Invite Staff Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('front_desk'); setInviteCustomPerms(false); }}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative bg-card rounded-xl shadow-2xl w-[500px] mx-4 flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold">Invite Staff Member</h3>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Send an email invitation to join your facility</p>
              </div>
              <button onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('front_desk'); setInviteCustomPerms(false); }} className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Email Address</label>
                <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="staff@example.com" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">First Name</label>
                  <input value={inviteFirstName} onChange={e => setInviteFirstName(e.target.value)} placeholder="First name" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Last Name</label>
                  <input value={inviteLastName} onChange={e => setInviteLastName(e.target.value)} placeholder="Last name" className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Role</label>
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40">
                  <option value="director">Director</option>
                  <option value="manager">Manager</option>
                  <option value="front_desk">Front Desk</option>
                  <option value="instructor">Instructor</option>
                  <option value="view_only">View-Only</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Custom Permissions</div>
                    <div className="text-xs text-muted-foreground font-medium">Override default role permissions</div>
                  </div>
                  <Switch checked={inviteCustomPerms} onCheckedChange={setInviteCustomPerms} />
                </div>
                {inviteCustomPerms && (
                  <div className="border border-border rounded-lg p-3 space-y-3 max-h-48 overflow-y-auto">
                    {STAFF_PERMISSIONS.map(section => (
                      <div key={section.section} className="space-y-1">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{section.section}</div>
                        {section.perms.map(perm => (
                          <div key={perm} className="flex items-center gap-2 cursor-pointer hover:bg-muted/30 px-1 py-0.5 rounded">
                            <div className="w-4 h-4 rounded border border-border flex items-center justify-center hover:border-primary" />
                            <span className="text-xs font-medium text-muted-foreground">{perm}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2 shrink-0">
              <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('front_desk'); setInviteCustomPerms(false); }}>Cancel</Button>
              <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => { setInviteModalOpen(false); setInviteEmail(''); setInviteFirstName(''); setInviteLastName(''); setInviteRole('front_desk'); setInviteCustomPerms(false); }}><Send className="w-3.5 h-3.5 mr-1.5" />Send Invitation</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
