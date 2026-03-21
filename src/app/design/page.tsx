import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header — teal accent line at top */}
      <div className="h-0.5 bg-primary" />
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/courtside-logo.svg"
              alt="Courtside AI"
              width={28}
              height={28}
              className="h-7 w-7"
            />
            <span className="text-lg font-semibold text-foreground tracking-tight">Courtside AI</span>
          </div>
          <span className="text-sm text-muted-foreground">Design System v1.0</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Design Tokens & Foundation</h1>
          <p className="text-base text-muted-foreground mt-1">Courtside AI visual language — colors, typography, spacing, and core components</p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <SectionTitle>Color Palette</SectionTitle>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Brand & Core</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <ColorSwatch name="Primary" className="bg-primary" textClass="text-primary-foreground" />
              <ColorSwatch name="Background" className="bg-background border" textClass="text-foreground" />
              <ColorSwatch name="Card" className="bg-card border" textClass="text-card-foreground" />
              <ColorSwatch name="Secondary" className="bg-secondary" textClass="text-secondary-foreground" />
              <ColorSwatch name="Muted" className="bg-muted" textClass="text-muted-foreground" />
              <ColorSwatch name="Accent" className="bg-accent" textClass="text-accent-foreground" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Semantic</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ColorSwatch name="Success" className="bg-success" textClass="text-success-foreground" />
              <ColorSwatch name="Warning" className="bg-warning" textClass="text-warning-foreground" />
              <ColorSwatch name="Info" className="bg-info" textClass="text-info-foreground" />
              <ColorSwatch name="Destructive" className="bg-destructive" textClass="text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Booking Types (Court Grid)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              <ColorSwatch name="Standard" className="bg-booking-standard" textClass="text-white" small />
              <ColorSwatch name="Member" className="bg-booking-member" textClass="text-white" small />
              <ColorSwatch name="Open Play" className="bg-booking-openplay" textClass="text-white" small />
              <ColorSwatch name="Program" className="bg-booking-program" textClass="text-white" small />
              <ColorSwatch name="League" className="bg-booking-league" textClass="text-white" small />
              <ColorSwatch name="Event" className="bg-booking-event" textClass="text-white" small />
              <ColorSwatch name="Maint." className="bg-booking-maintenance" textClass="text-white" small />
              <ColorSwatch name="Recurring" className="bg-booking-recurring" textClass="text-white" small />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Chart Colors</h3>
            <div className="grid grid-cols-5 gap-3">
              <ColorSwatch name="Chart 1" className="bg-chart-1" textClass="text-white" small />
              <ColorSwatch name="Chart 2" className="bg-chart-2" textClass="text-white" small />
              <ColorSwatch name="Chart 3" className="bg-chart-3" textClass="text-white" small />
              <ColorSwatch name="Chart 4" className="bg-chart-4" textClass="text-white" small />
              <ColorSwatch name="Chart 5" className="bg-chart-5" textClass="text-white" small />
            </div>
          </div>
        </section>

        <Separator />

        {/* Typography */}
        <section className="space-y-6">
          <SectionTitle>Typography</SectionTitle>
          <div className="space-y-5">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">text-3xl font-bold tracking-tight — Page Title</p>
              <p className="text-3xl font-bold tracking-tight">Dashboard</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">text-xl font-semibold — Section Header</p>
              <p className="text-xl font-semibold">Today&apos;s Schedule</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">text-lg font-medium — Card Title</p>
              <p className="text-lg font-medium">Court Utilization</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">text-base font-medium — Body / Label</p>
              <p className="text-base font-medium">Customer Name</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">text-sm text-muted-foreground — Secondary Text</p>
              <p className="text-sm text-muted-foreground">Last activity 3 days ago</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">text-3xl font-bold tracking-tight — Metric Value</p>
              <p className="text-3xl font-bold tracking-tight">$2,450</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Buttons */}
        <section className="space-y-6">
          <SectionTitle>Buttons</SectionTitle>
          <div className="flex flex-wrap gap-3">
            <Button>Create Booking</Button>
            <Button variant="secondary">Cancel</Button>
            <Button variant="outline">View Details</Button>
            <Button variant="ghost">Skip</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Learn more</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        <Separator />

        {/* Badges */}
        <section className="space-y-6">
          <SectionTitle>Badges & Status</SectionTitle>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Confirmed</Badge>
              <Badge variant="secondary">Pending</Badge>
              <Badge variant="outline">Draft</Badge>
              <Badge variant="destructive">Cancelled</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-success text-success-foreground hover:bg-success/90">Checked In</Badge>
              <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">Pending Payment</Badge>
              <Badge className="bg-info text-info-foreground hover:bg-info/90">In Progress</Badge>
              <Badge className="bg-booking-program text-white">Program</Badge>
              <Badge className="bg-booking-league text-white">League</Badge>
              <Badge className="bg-booking-openplay text-white">Open Play</Badge>
            </div>
          </div>
        </section>

        <Separator />

        {/* Cards */}
        <section className="space-y-6">
          <SectionTitle>Cards</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Revenue Today" value="$2,450" change="+12%" positive />
            <MetricCard title="Bookings Today" value="34" change="+5" positive />
            <MetricCard title="Court Utilization" value="72%" change="+4%" positive />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  Attention Required
                </CardTitle>
                <CardDescription>5 items need your attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <AlertItem severity="high" text="3 Failed Payments — $245 total" />
                <AlertItem severity="medium" text="2 Pending Approvals" />
                <AlertItem severity="medium" text="1 Unpaid Booking — hold expires in 12m" />
                <AlertItem severity="low" text="4 Expired Waivers (with bookings today)" />
                <AlertItem severity="info" text="2 AI Escalations — need follow-up" />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>AI Performance</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  <div className="flex justify-between items-baseline py-2.5">
                    <span className="text-base text-muted-foreground">Calls Handled</span>
                    <span className="text-xl font-semibold tabular-nums">87</span>
                  </div>
                  <div className="flex justify-between items-baseline py-2.5">
                    <span className="text-base text-muted-foreground">AI Revenue</span>
                    <span className="text-xl font-semibold text-primary tabular-nums">$2,340</span>
                  </div>
                  <div className="flex justify-between items-baseline py-2.5">
                    <span className="text-base text-muted-foreground">Resolution Rate</span>
                    <span className="text-xl font-semibold tabular-nums">89%</span>
                  </div>
                  <div className="flex justify-between items-baseline py-2.5">
                    <span className="text-base text-muted-foreground">AI ROI</span>
                    <span className="text-xl font-semibold text-success tabular-nums">5,370%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Tabs */}
        <section className="space-y-6">
          <SectionTitle>Tabs</SectionTitle>
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="mt-4">
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-base text-muted-foreground">Today&apos;s court schedule grid would render here — time slots x courts with color-coded booking blocks.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="insights" className="mt-4">
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-base text-muted-foreground">Revenue trends, utilization charts, and customer metrics with time-range filtering.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai" className="mt-4">
              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-base text-muted-foreground">AI call summary, revenue attribution, resolution rates, and recent activity.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <Separator />

        {/* Form Elements */}
        <section className="space-y-6">
          <SectionTitle>Form Elements</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Customer Profile</CardTitle>
                <CardDescription>Basic contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-base">Customer Name</Label>
                  <Input id="name" placeholder="Jane Doe" className="text-base h-10 shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-base">Email</Label>
                  <Input id="email" type="email" placeholder="jane@example.com" className="text-base h-10 shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-base">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+1 (647) 555-1234" className="text-base h-10 shadow-sm" />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Feature Toggles</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">Memberships</Label>
                      <p className="text-sm text-muted-foreground">Enable membership tiers and billing</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">Programs</Label>
                      <p className="text-sm text-muted-foreground">Lessons, clinics, and camps</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">AI Voice Agent</Label>
                      <p className="text-sm text-muted-foreground">Automated phone answering</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Booking Grid Preview */}
        <section className="space-y-6">
          <SectionTitle>Court Grid Preview</SectionTitle>
          <Card className="shadow-sm">
            <CardContent className="pt-6 overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Grid Header */}
                <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-px bg-border rounded-t-lg overflow-hidden">
                  <div className="bg-muted p-3 text-sm font-medium text-muted-foreground">Time</div>
                  <div className="bg-muted p-3 text-sm font-medium text-center">Court 1<br /><span className="text-muted-foreground font-normal text-xs">Pickleball</span></div>
                  <div className="bg-muted p-3 text-sm font-medium text-center">Court 2<br /><span className="text-muted-foreground font-normal text-xs">Pickleball</span></div>
                  <div className="bg-muted p-3 text-sm font-medium text-center">Court 3<br /><span className="text-muted-foreground font-normal text-xs">Tennis</span></div>
                  <div className="bg-muted p-3 text-sm font-medium text-center">Court 4<br /><span className="text-muted-foreground font-normal text-xs">Tennis</span></div>
                </div>

                {/* Grid Rows */}
                <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr] gap-px bg-border rounded-b-lg overflow-hidden">
                  <div className="bg-card p-3 text-sm text-muted-foreground">9:00 AM</div>
                  <BookingBlock name="Jane D." type="standard" status="paid" />
                  <div className="bg-card p-3" />
                  <BookingBlock name="Open Play" type="openplay" status="paid" />
                  <BookingBlock name="Maintenance" type="maintenance" />

                  <div className="bg-card p-3 text-sm text-muted-foreground">9:30 AM</div>
                  <BookingBlock name="Jane D." type="standard" status="paid" />
                  <BookingBlock name="Mike R." type="member" status="paid" />
                  <BookingBlock name="Open Play" type="openplay" status="paid" />
                  <BookingBlock name="Maintenance" type="maintenance" />

                  <div className="bg-card p-3 text-sm text-muted-foreground">10:00 AM</div>
                  <div className="bg-card p-3" />
                  <BookingBlock name="Mike R." type="member" status="paid" />
                  <BookingBlock name="Tennis Clinic" type="program" status="paid" />
                  <div className="bg-card p-3" />

                  <div className="bg-card p-3 text-sm text-muted-foreground">10:30 AM</div>
                  <BookingBlock name="Sarah L." type="standard" status="unpaid" />
                  <div className="bg-card p-3" />
                  <BookingBlock name="Tennis Clinic" type="program" status="paid" />
                  <BookingBlock name="League Match" type="league" status="paid" />

                  <div className="bg-card p-3 text-sm text-muted-foreground">11:00 AM</div>
                  <BookingBlock name="Sarah L." type="standard" status="unpaid" />
                  <BookingBlock name="Tom K." type="recurring" status="paid" />
                  <div className="bg-card p-3" />
                  <BookingBlock name="League Match" type="league" status="paid" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pt-8 pb-12">
          Courtside AI — Design System Prototype — March 2026
        </footer>
      </main>
    </div>
  );
}

/* ========================================
   Subcomponents
   ======================================== */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold flex items-center gap-3">
      <span className="h-5 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  );
}

function ColorSwatch({ name, className, textClass, small }: { name: string; className: string; textClass: string; small?: boolean }) {
  return (
    <div className={`${className} ${small ? 'h-16' : 'h-20'} rounded-lg flex items-end p-2 shadow-sm`}>
      <span className={`${textClass} text-sm font-medium`}>{name}</span>
    </div>
  );
}

function MetricCard({ title, value, change, positive }: { title: string; value: string; change: string; positive?: boolean }) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-5 pb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          <span className={`text-sm font-medium ${positive ? 'text-success' : 'text-destructive'}`}>
            {change}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">vs. last same weekday</p>
      </CardContent>
    </Card>
  );
}

function AlertItem({ severity, text }: { severity: 'high' | 'medium' | 'low' | 'info'; text: string }) {
  const colors = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-warning/10 text-warning-foreground border-warning/20',
    low: 'bg-muted text-muted-foreground border-border',
    info: 'bg-info/10 text-info border-info/20',
  };
  const dots = {
    high: 'bg-destructive',
    medium: 'bg-warning',
    low: 'bg-muted-foreground',
    info: 'bg-info',
  };
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-md border ${colors[severity]}`}>
      <div className={`h-2 w-2 rounded-full shrink-0 ${dots[severity]}`} />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function BookingBlock({ name, type, status }: { name: string; type: string; status?: 'paid' | 'unpaid' }) {
  const typeColors: Record<string, string> = {
    standard: 'bg-booking-standard',
    member: 'bg-booking-member',
    openplay: 'bg-booking-openplay',
    program: 'bg-booking-program',
    league: 'bg-booking-league',
    event: 'bg-booking-event',
    maintenance: 'bg-booking-maintenance',
    recurring: 'bg-booking-recurring',
  };
  return (
    <div className={`${typeColors[type]} p-3 text-white text-sm ${status === 'unpaid' ? 'ring-2 ring-destructive ring-inset' : ''}`}>
      <span className="font-medium">{name}</span>
      {status === 'paid' && <span className="ml-1.5 opacity-70 text-xs">&#10003;</span>}
      {status === 'unpaid' && <span className="ml-1.5 text-xs font-semibold bg-warning text-warning-foreground rounded px-1.5 py-0.5 uppercase tracking-wide">Unpaid</span>}
    </div>
  );
}
