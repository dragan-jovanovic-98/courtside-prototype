"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, SPageHeader, SToolbar, SSearchInput, SFilterPill, SMetricCard } from "@/components/shared";
import { ShoppingBag, Power, DollarSign, AlertTriangle, List, PieChart, Package, Wrench, Star, MoreHorizontal, X, CheckCircle2, Search, CreditCard, Merge } from "lucide-react";

const MOCK_INVENTORY = [
  { id: 'INV01', name: 'Pickleball Paddle — Pro', category: 'retail' as const, sku: 'PB-PDL-001', stock: 12, lowThreshold: 5, cost: 45, price: 89.99, margin: 50, status: 'active' as const },
  { id: 'INV02', name: 'Pickleball Balls (3-pack)', category: 'retail' as const, sku: 'PB-BLL-001', stock: 34, lowThreshold: 10, cost: 8, price: 14.99, margin: 47, status: 'active' as const },
  { id: 'INV03', name: 'Tennis Racket — Beginner', category: 'retail' as const, sku: 'TN-RKT-001', stock: 4, lowThreshold: 5, cost: 30, price: 59.99, margin: 50, status: 'active' as const },
  { id: 'INV04', name: 'Grip Tape', category: 'retail' as const, sku: 'ACC-GRP-001', stock: 28, lowThreshold: 10, cost: 3, price: 7.99, margin: 62, status: 'active' as const },
  { id: 'INV05', name: 'Water Bottle', category: 'fnb' as const, sku: 'FNB-WTR-001', stock: 48, lowThreshold: 12, cost: 0.50, price: 2.50, margin: 80, status: 'active' as const },
  { id: 'INV06', name: 'Energy Bar', category: 'fnb' as const, sku: 'FNB-BAR-001', stock: 24, lowThreshold: 10, cost: 1.20, price: 3.50, margin: 66, status: 'active' as const },
  { id: 'INV07', name: 'Gatorade', category: 'fnb' as const, sku: 'FNB-GAT-001', stock: 2, lowThreshold: 6, cost: 1.50, price: 4.00, margin: 63, status: 'active' as const },
  { id: 'INV08', name: 'Paddle Rental', category: 'equipment' as const, sku: 'EQ-PDL-R01', stock: 8, lowThreshold: 2, cost: 0, price: 5.00, margin: 100, status: 'active' as const },
  { id: 'INV09', name: 'Ball Hopper Rental', category: 'equipment' as const, sku: 'EQ-BHP-R01', stock: 4, lowThreshold: 1, cost: 0, price: 10.00, margin: 100, status: 'active' as const },
  { id: 'INV10', name: 'Court Towel', category: 'retail' as const, sku: 'ACC-TWL-001', stock: 0, lowThreshold: 5, cost: 4, price: 12.99, margin: 69, status: 'inactive' as const },
  { id: 'INV11', name: 'Restringing Service', category: 'service' as const, sku: 'SVC-RST-001', stock: 0, lowThreshold: 0, cost: 15, price: 35.00, margin: 57, status: 'active' as const },
  { id: 'INV12', name: 'Video Replay Session', category: 'service' as const, sku: 'SVC-VID-001', stock: 0, lowThreshold: 0, cost: 0, price: 15.00, margin: 100, status: 'active' as const },
];
const MOCK_RENTALS = [
  { id: 'R01', equipment: 'Paddle Rental', customer: 'Jane Doe', checkedOut: '2:15 PM', bookingEnd: '3:15 PM', status: 'active' as const },
  { id: 'R02', equipment: 'Ball Hopper Rental', customer: 'Tom Kim', checkedOut: '1:00 PM', bookingEnd: '3:00 PM', status: 'active' as const },
  { id: 'R03', equipment: 'Paddle Rental', customer: 'Emma Singh', checkedOut: '11:30 AM', bookingEnd: '12:30 PM', status: 'overdue' as const },
  { id: 'R04', equipment: 'Paddle Rental', customer: 'Kevin Nguyen', checkedOut: '10:00 AM', bookingEnd: '11:00 AM', status: 'overdue' as const },
];

export default function POSView() {
  const [tab, setTab] = useState('Inventory');
  const [search, setSearch] = useState('');
  const [inventoryView, setInventoryView] = useState<'list' | 'category'>('list');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [registerOpen, setRegisterOpen] = useState(true);
  const [closeRegisterModal, setCloseRegisterModal] = useState(false);
  const [actualCash, setActualCash] = useState('');
  const [posModeOpen, setPosModeOpen] = useState(false);
  const [returnModal, setReturnModal] = useState<typeof MOCK_RENTALS[0] | null>(null);
  const [returnCondition, setReturnCondition] = useState('good');
  const [returnNotes, setReturnNotes] = useState('');

  const lowStockCount = MOCK_INVENTORY.filter(i => (i.stock > 0 && i.stock <= i.lowThreshold) || (i.stock === 0 && i.category !== 'service')).length;
  const outOfStockCount = MOCK_INVENTORY.filter(i => i.stock === 0 && i.category !== 'service').length;

  const REGISTER_TRANSACTIONS = [
    { time: '2:15 PM', customer: 'Jane Doe', items: 2, amount: 95.98, method: 'Card' as const, staff: 'Jessica' },
    { time: '1:30 PM', customer: 'Walk-in', items: 1, amount: 2.50, method: 'Cash' as const, staff: 'Jessica' },
    { time: '12:45 PM', customer: 'Tom Kim', items: 3, amount: 26.48, method: 'Apple Pay' as const, staff: 'Mike T.' },
    { time: '11:20 AM', customer: 'Emma Singh', items: 1, amount: 14.99, method: 'Card' as const, staff: 'Jessica' },
    { time: '10:00 AM', customer: 'Mike Russo', items: 2, amount: 65.00, method: 'Cash' as const, staff: 'Jessica' },
    { time: '9:30 AM', customer: 'Walk-in', items: 1, amount: 4.00, method: 'Card' as const, staff: 'Jessica' },
  ];
  const totalSales = REGISTER_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
  const cashSales = REGISTER_TRANSACTIONS.filter(t => t.method === 'Cash').reduce((s, t) => s + t.amount, 0);
  const cardSales = totalSales - cashSales;
  const openingFloat = 200;
  const expectedCash = openingFloat + cashSales;

  const filteredInventory = MOCK_INVENTORY.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (stockFilter === 'low' && !(i.stock > 0 && i.stock <= i.lowThreshold)) return false;
    if (stockFilter === 'out' && !(i.stock === 0 && i.category !== 'service')) return false;
    if (stockFilter === 'in' && (i.stock === 0 && i.category !== 'service')) return false;
    return true;
  });

  const categoryGroups = [
    { key: 'retail', label: 'Retail', icon: Package },
    { key: 'fnb', label: 'Food & Beverage', icon: ShoppingBag },
    { key: 'equipment', label: 'Equipment Rental', icon: Wrench },
    { key: 'service', label: 'Services', icon: Star },
  ];

  return (
    <>
      <SPageHeader title="Point of Sale"><Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setPosModeOpen(true)}><ShoppingBag className="w-3.5 h-3.5 mr-1.5" />Enter POS Mode</Button></SPageHeader>
      <div className="flex items-center border-b border-border px-3 md:px-6 bg-card shrink-0 overflow-x-auto">
        {(['Inventory', 'Equipment', 'Register'] as const).map(tabKey => (
          <button key={tabKey} onClick={() => setTab(tabKey)}
            className={`px-3 md:px-4 py-3 text-xs md:text-sm font-semibold border-b-2 transition-colors -mb-px whitespace-nowrap flex items-center gap-1.5 ${tab === tabKey ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}>
            {tabKey}
            {tabKey === 'Inventory' && lowStockCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">{lowStockCount}</span>
            )}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4">
        {tab === 'Inventory' && (<>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">{lowStockCount} items need attention ({outOfStockCount} out of stock)</span>
            </div>
          )}
          <SToolbar>
            <SSearchInput placeholder="Search inventory..." value={search} onChange={setSearch} />
            <SFilterPill label="All Categories" active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} />
            <SFilterPill label="Retail" active={categoryFilter === 'retail'} onClick={() => setCategoryFilter(categoryFilter === 'retail' ? 'all' : 'retail')} />
            <SFilterPill label="F&B" active={categoryFilter === 'fnb'} onClick={() => setCategoryFilter(categoryFilter === 'fnb' ? 'all' : 'fnb')} />
            <SFilterPill label="Equipment" active={categoryFilter === 'equipment'} onClick={() => setCategoryFilter(categoryFilter === 'equipment' ? 'all' : 'equipment')} />
            <SFilterPill label="Services" active={categoryFilter === 'service'} onClick={() => setCategoryFilter(categoryFilter === 'service' ? 'all' : 'service')} />
            <div className="w-px h-5 bg-border mx-1" />
            <SFilterPill label="All Stock" active={stockFilter === 'all'} onClick={() => setStockFilter('all')} />
            <SFilterPill label="Low Stock" active={stockFilter === 'low'} onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')} />
            <SFilterPill label="Out of Stock" active={stockFilter === 'out'} onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')} />
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => setInventoryView('list')} className={`p-1.5 rounded ${inventoryView === 'list' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`} title="List View"><List className="w-4 h-4" /></button>
              <button onClick={() => setInventoryView('category')} className={`p-1.5 rounded ${inventoryView === 'category' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'}`} title="Category View"><PieChart className="w-4 h-4" /></button>
            </div>
          </SToolbar>

          {inventoryView === 'list' ? (
            <div className="card-elevated rounded-lg overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-border">
                  {['Item', 'Category', 'SKU', 'Stock', 'Cost', 'Price', 'Margin', 'Status', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card sticky top-0 z-10">{h}</th>)}
                </tr></thead>
                <tbody>{filteredInventory.map(item => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-4 py-2.5 text-sm font-medium">{item.name}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={item.category} /></td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono font-medium">{item.sku}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm font-medium tabular-nums">{item.category === 'service' ? '∞' : item.stock}</span>
                      {item.stock > 0 && item.stock <= item.lowThreshold && <span className="ml-1.5 text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded uppercase">Low</span>}
                      {item.stock === 0 && item.category !== 'service' && <span className="ml-1.5 text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded uppercase">Out</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground tabular-nums font-medium">${item.cost.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium tabular-nums">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-sm font-medium tabular-nums">{item.margin}%</td>
                    <td className="px-4 py-2.5"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-2.5"><button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryGroups.map(cg => {
                const items = MOCK_INVENTORY.filter(i => i.category === cg.key);
                if (items.length === 0) return null;
                const itemCount = items.length;
                const totalStockValue = items.reduce((s, i) => s + (i.category === 'service' ? 0 : i.stock * i.cost), 0);
                const avgMargin = Math.round(items.reduce((s, i) => s + i.margin, 0) / items.length);
                const lowCount = items.filter(i => (i.stock > 0 && i.stock <= i.lowThreshold) || (i.stock === 0 && i.category !== 'service')).length;
                const IconComp = cg.icon;
                return (
                  <div key={cg.key} className="card-elevated rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center"><IconComp className="w-4 h-4 text-primary" /></div>
                        <div>
                          <h3 className="text-sm font-bold">{cg.label}</h3>
                          <p className="text-xs text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      {lowCount > 0 && <span className="text-[9px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full uppercase">{lowCount} low</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {cg.key !== 'service' && (
                        <div>
                          <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Stock Value</div>
                          <div className="text-base font-bold tabular-nums">${totalStockValue.toFixed(2)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Avg Margin</div>
                        <div className="text-base font-bold tabular-nums">{avgMargin}%</div>
                      </div>
                    </div>
                    <div className="border-t border-border pt-2 space-y-1">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs py-1">
                          <span className="font-medium truncate mr-2">{item.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-muted-foreground tabular-nums">{item.category === 'service' ? '∞' : item.stock} in stock</span>
                            <span className="font-medium tabular-nums">${item.price.toFixed(2)}</span>
                            {item.stock > 0 && item.stock <= item.lowThreshold && <span className="text-[8px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded uppercase">Low</span>}
                            {item.stock === 0 && item.category !== 'service' && <span className="text-[8px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded uppercase">Out</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>)}
        {tab === 'Equipment' && (<>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SMetricCard label="Available" value={`${MOCK_INVENTORY.filter(i => i.category === 'equipment').reduce((s, i) => s + i.stock, 0)}`} />
            <SMetricCard label="Checked Out" value={`${MOCK_RENTALS.filter(r => r.status === 'active').length}`} />
            <SMetricCard label="Overdue" value={`${MOCK_RENTALS.filter(r => r.status === 'overdue').length}`} trend={MOCK_RENTALS.filter(r => r.status === 'overdue').length > 0 ? 'Needs attention' : undefined} trendUp={false} />
          </div>
          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Active Rentals</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Equipment', 'Customer', 'Checked Out', 'Booking End', 'Status', ''].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>{MOCK_RENTALS.map(r => (
                <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="px-4 py-2.5 text-sm font-medium">{r.equipment}</td>
                  <td className="px-4 py-2.5 text-sm font-medium">{r.customer}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{r.checkedOut}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{r.bookingEnd}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-2.5"><Button variant="outline" className="h-7 text-[10px] font-bold btn-outline-modern" onClick={() => { setReturnModal(r); setReturnCondition('good'); setReturnNotes(''); }}>Return</Button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>)}
        {tab === 'Register' && (<>
          <div className="card-elevated rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Front Desk Register</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${registerOpen ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  <span className="text-sm font-bold">{registerOpen ? 'Open' : 'Closed'}</span>
                  {registerOpen && <span className="text-xs text-muted-foreground font-medium">· Session started 9:00 AM</span>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {registerOpen && (
                  <div className="flex gap-4 text-right">
                    <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Transactions</div><div className="text-lg font-bold">23</div></div>
                    <div><div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Revenue</div><div className="text-lg font-bold">${totalSales.toFixed(2)}</div></div>
                  </div>
                )}
                <Button
                  variant={registerOpen ? 'outline' : 'default'}
                  className={`h-9 text-xs font-bold px-4 ${registerOpen ? 'btn-outline-modern' : 'btn-primary-modern'}`}
                  onClick={() => { if (registerOpen) { setCloseRegisterModal(true); } else { setRegisterOpen(true); } }}
                >
                  <Power className="w-3.5 h-3.5 mr-1.5" />{registerOpen ? 'Close Register' : 'Open Register'}
                </Button>
              </div>
            </div>
          </div>

          {registerOpen && (
            <div className="card-elevated rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold">Cash Drawer</span>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Opening Float</div>
                  <div className="text-base font-bold tabular-nums">${openingFloat.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Cash Sales</div>
                  <div className="text-base font-bold tabular-nums">${cashSales.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Expected Total</div>
                  <div className="text-base font-bold tabular-nums">${expectedCash.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="card-elevated rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><h3 className="text-sm font-bold">Today&apos;s Register Activity</h3></div>
            <table className="w-full">
              <thead><tr className="border-b border-border">
                {['Time', 'Customer', 'Items', 'Amount', 'Method', 'Staff'].map(h => <th key={h} className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left px-4 py-2.5 bg-card">{h}</th>)}
              </tr></thead>
              <tbody>
                {REGISTER_TRANSACTIONS.map((tx, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30"><td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{tx.time}</td><td className="px-4 py-2.5 text-sm font-medium">{tx.customer}</td><td className="px-4 py-2.5 text-sm font-medium tabular-nums">{tx.items}</td><td className="px-4 py-2.5 text-sm font-medium tabular-nums">${tx.amount.toFixed(2)}</td><td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{tx.method}</td><td className="px-4 py-2.5 text-xs text-muted-foreground font-medium">{tx.staff}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>)}
      </div>

      {closeRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setCloseRegisterModal(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative bg-card rounded-xl shadow-2xl w-[480px] p-6 space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold">Close Register</h3>
            <p className="text-sm text-muted-foreground">Review the session summary before closing.</p>
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Opening Float</span><span className="font-bold tabular-nums">${openingFloat.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Sales</span><span className="font-bold tabular-nums">${totalSales.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cash Sales</span><span className="font-bold tabular-nums">${cashSales.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Card / Digital Sales</span><span className="font-bold tabular-nums">${cardSales.toFixed(2)}</span></div>
              <Separator />
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Expected Cash</span><span className="font-bold tabular-nums">${expectedCash.toFixed(2)}</span></div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Actual Cash</span>
                <input type="text" value={actualCash} onChange={e => setActualCash(e.target.value)} placeholder={expectedCash.toFixed(2)} className="w-28 h-8 px-2 text-sm font-bold tabular-nums text-right rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              {actualCash && !isNaN(parseFloat(actualCash)) && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Variance</span>
                  <span className={`font-bold tabular-nums ${parseFloat(actualCash) - expectedCash === 0 ? 'text-green-600' : parseFloat(actualCash) - expectedCash > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {parseFloat(actualCash) - expectedCash >= 0 ? '+' : ''}${(parseFloat(actualCash) - expectedCash).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => setCloseRegisterModal(false)}>Cancel</Button>
              <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => { setCloseRegisterModal(false); setRegisterOpen(false); setActualCash(''); }}>Confirm Close</Button>
            </div>
          </div>
        </div>
      )}

      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setReturnModal(null)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <div className="relative bg-card rounded-xl shadow-2xl w-[420px] p-6 space-y-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold">Return Equipment</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Equipment</span><span className="font-bold">{returnModal.equipment}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Customer</span><span className="font-bold">{returnModal.customer}</span></div>
              <div>
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Condition</label>
                <div className="flex gap-2 mt-1.5">
                  {(['good', 'damaged', 'lost'] as const).map(c => (
                    <button key={c} onClick={() => setReturnCondition(c)}
                      className={`h-8 px-3 rounded-md text-xs font-bold transition-colors capitalize ${returnCondition === c ? (c === 'good' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300') : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              {(returnCondition === 'damaged' || returnCondition === 'lost') && (<>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Damage Notes</label>
                  <textarea value={returnNotes} onChange={e => setReturnNotes(e.target.value)} placeholder="Describe the damage..." className="w-full mt-1.5 h-16 px-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <div className="flex justify-between text-sm p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <span className="text-red-700 dark:text-red-300 font-medium">Damage Fee</span>
                  <span className="font-bold text-red-700 dark:text-red-300">{returnCondition === 'lost' ? '$50.00' : '$25.00'}</span>
                </div>
              </>)}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" className="h-9 text-xs font-bold btn-outline-modern" onClick={() => setReturnModal(null)}>Cancel</Button>
              <Button className="h-9 text-xs font-bold px-5 btn-primary-modern" onClick={() => setReturnModal(null)}><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Confirm Return</Button>
            </div>
          </div>
        </div>
      )}

      {posModeOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span className="text-base font-bold">POS Mode</span>
              <span className="text-xs text-muted-foreground font-medium">Front Desk Register</span>
            </div>
            <Button variant="outline" className="h-8 text-xs font-bold btn-outline-modern" onClick={() => setPosModeOpen(false)}><X className="w-3.5 h-3.5 mr-1.5" />Exit POS Mode</Button>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col border-r border-border">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30 shrink-0">
                {['Retail', 'F&B', 'Equipment', 'Services'].map((cat, idx) => (
                  <button key={cat} className={`h-9 px-4 rounded-lg text-xs font-bold transition-colors ${idx === 0 ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted border border-border'}`}>{cat}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {MOCK_INVENTORY.filter(i => i.category === 'retail' && i.status === 'active').map(item => (
                    <button key={item.id} className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-border bg-card hover:border-primary hover:shadow-md transition-all text-center min-h-[100px]">
                      <Package className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs font-bold leading-tight">{item.name}</span>
                      <span className="text-sm font-bold text-primary mt-1 tabular-nums">${item.price.toFixed(2)}</span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{item.stock} in stock</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-[340px] flex flex-col bg-card">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Customer lookup..." className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground" readOnly />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div><span className="text-sm font-medium">PB Paddle — Pro</span><div className="text-xs text-muted-foreground">Qty: 1</div></div>
                  <span className="text-sm font-bold tabular-nums">$89.99</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div><span className="text-sm font-medium">Water Bottle</span><div className="text-xs text-muted-foreground">Qty: 2</div></div>
                  <span className="text-sm font-bold tabular-nums">$5.00</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div><span className="text-sm font-medium">Grip Tape</span><div className="text-xs text-muted-foreground">Qty: 1</div></div>
                  <span className="text-sm font-bold tabular-nums">$7.99</span>
                </div>
              </div>
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal (4 items)</span><span className="font-bold tabular-nums">$102.98</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax (13%)</span><span className="font-bold tabular-nums">$13.39</span></div>
                <Separator />
                <div className="flex justify-between"><span className="text-base font-bold">Total</span><span className="text-lg font-bold tabular-nums">$116.37</span></div>
                <div className="grid grid-cols-3 gap-2">
                  <Button className="h-10 text-xs font-bold btn-primary-modern"><CreditCard className="w-3.5 h-3.5 mr-1" />Card</Button>
                  <Button variant="outline" className="h-10 text-xs font-bold btn-outline-modern"><DollarSign className="w-3.5 h-3.5 mr-1" />Cash</Button>
                  <Button variant="outline" className="h-10 text-xs font-bold btn-outline-modern"><Merge className="w-3.5 h-3.5 mr-1" />Split</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
