/**
 * Purchase Orders — Matches admin design: tabs + search + table + UI2 drawer.
 */
import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, FileText, Trash2, Eye, MoreHorizontal, CheckCircle, Truck, PackageCheck } from 'lucide-react';
import { useInventory } from '../../../hooks/admin/useInventory';
import { PO_STATUS_CONFIG } from '../../../utils/inventory';
import type { PurchaseOrder } from '../../../utils/inventory';
import { formatCurrency } from '../../../utils/formatters';
import { SearchBar } from '../../../components/ui2/SearchBar';
import { Badge } from '../../../components/ui2/Badge';
import { Drawer } from '../../../components/ui2/Drawer';
import { Input } from '../../../components/ui2/Input';
import { SearchableSelect } from '../../../components/ui2/SearchableSelect';
import { Button } from '../../../components/ui2/Button';

const fmt = (v: number) => formatCurrency(v, 'INR');

const STATUS_VARIANTS: Record<string, string> = {
  draft: 'neutral', pending: 'warning', approved: 'info', ordered: 'primary', received: 'success', cancelled: 'danger',
};

export default function PurchaseOrders() {
  const { purchaseOrders, allPOs, vendors, poStatusFilter, setPoStatusFilter, addPO, updatePOStatus } = useInventory();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  const menuBtnRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // Close menu on scroll
  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [openMenuId]);

  const toggleMenu = (poId: number) => {
    if (openMenuId === poId) { setOpenMenuId(null); return; }
    const btn = menuBtnRefs.current[poId];
    if (btn) {
      const r = btn.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    setOpenMenuId(poId);
  };

  const [form, setForm] = useState({ vendor_id: '', items: [{ item_name: '', quantity: '', unit_price: '' }] as any[], expected_date: '', notes: '' });

  const vendorOptions = vendors.map(v => ({ value: String(v.id), label: v.name }));

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return purchaseOrders;
    const q = searchQuery.toLowerCase();
    return purchaseOrders.filter(po => po.po_number.toLowerCase().includes(q) || po.vendor_name.toLowerCase().includes(q));
  }, [purchaseOrders, searchQuery]);

  const openCreate = () => {
    setSelectedPO(null);
    setForm({ vendor_id: '', items: [{ item_name: '', quantity: '', unit_price: '' }], expected_date: '', notes: '' });
    setDrawerOpen(true);
  };
  const openDetail = (po: PurchaseOrder) => { setSelectedPO(po); setDrawerOpen(true); };

  const addLine = () => setForm(f => ({ ...f, items: [...f.items, { item_name: '', quantity: '', unit_price: '' }] }));
  const removeLine = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_: any, idx: number) => idx !== i) }));
  const updateLine = (i: number, field: string, val: string) => setForm(f => ({ ...f, items: f.items.map((item: any, idx: number) => idx === i ? { ...item, [field]: val } : item) }));

  const handleCreate = () => {
    const vendor = vendors.find(v => v.id === parseInt(form.vendor_id));
    if (!vendor) return;
    const poItems = form.items.filter((i: any) => i.item_name && i.quantity).map((i: any, idx: number) => ({
      item_id: idx, item_name: i.item_name, quantity: parseInt(i.quantity) || 0, unit_price: parseFloat(i.unit_price) || 0,
    }));
    addPO({ vendor_id: vendor.id, vendor_name: vendor.name, items: poItems, total: poItems.reduce((s: number, i: any) => s + i.quantity * i.unit_price, 0), expected_date: form.expected_date, notes: form.notes });
    setDrawerOpen(false);
  };

  const tabs = [
    { id: '', label: 'All Orders', short: 'All', count: allPOs.length },
    { id: 'pending', label: 'Pending Approval', short: 'Pending', count: allPOs.filter(p => p.status === 'pending').length },
    { id: 'approved', label: 'Approved', short: 'Approved', count: allPOs.filter(p => p.status === 'approved').length },
    { id: 'ordered', label: 'Ordered', short: 'Ordered', count: allPOs.filter(p => p.status === 'ordered').length },
    { id: 'received', label: 'Received', short: 'Received', count: allPOs.filter(p => p.status === 'received').length },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Purchase Orders</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Create and track purchase orders from vendors.</p>
          </div>
          <button onClick={openCreate}
            className="h-9 px-4 rounded-lg bg-terra-600 text-white text-[13px] font-semibold flex items-center gap-1.5 hover:bg-terra-700 transition-colors self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Create PO
          </button>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-[10px] overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-neutral-100">
            <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setPoStatusFilter(tab.id)}
                  className={`relative px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap ${
                    poStatusFilter === tab.id ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
                  }`}>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                    <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold tabular-nums ${
                      poStatusFilter === tab.id ? 'bg-terra-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>{tab.count}</span>
                  </span>
                  {poStatusFilter === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="w-full sm:max-w-md">
              <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} placeholder="Search by PO number or vendor..." />
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <FileText className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[13px] font-medium text-neutral-500">No purchase orders</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">PO #</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Vendor</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Items</th>
                    <th className="text-right py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Total</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Expected</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="w-12 py-3 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(po => {
                    const cfg = PO_STATUS_CONFIG[po.status] || PO_STATUS_CONFIG.draft;
                    return (
                      <tr key={po.id} onClick={() => openDetail(po)}
                        className="border-b border-neutral-50 cursor-pointer hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-4 sm:px-6">
                          <span className="text-[13px] font-medium text-neutral-900 font-mono">{po.po_number}</span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-[13px] text-neutral-700">{po.vendor_name}</p>
                        </td>
                        <td className="py-3 px-3 text-center hidden sm:table-cell">
                          <span className="text-[12px] text-neutral-500 tabular-nums">{po.items.length}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-[13px] font-semibold text-neutral-900 tabular-nums">{fmt(po.total)}</span>
                        </td>
                        <td className="py-3 px-3 text-center hidden md:table-cell">
                          <span className="text-[11px] text-neutral-400">{po.expected_date || '—'}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={(STATUS_VARIANTS[po.status] || 'neutral') as any} size="xs">{cfg.label}</Badge>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            ref={el => { menuBtnRefs.current[po.id] = el; }}
                            onClick={e => { e.stopPropagation(); toggleMenu(po.id); }}
                            className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${openMenuId === po.id ? 'bg-neutral-100 text-neutral-600' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <p className="text-[11px] sm:text-[13px] text-neutral-500">
                Showing <span className="font-semibold text-neutral-700">{filtered.length}</span> of <span className="font-semibold text-neutral-700">{allPOs.length}</span> orders
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create PO / View PO Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedPO(null); }}
        title={selectedPO ? `PO ${selectedPO.po_number}` : 'Create Purchase Order'}
        subtitle={selectedPO ? `${selectedPO.vendor_name} · ${PO_STATUS_CONFIG[selectedPO.status]?.label}` : 'Add items and select a vendor'}
        maxWidth="max-w-lg"
        footer={!selectedPO ? (
          <div className="flex gap-3">
            <Button variant="outline-neutral" onClick={() => setDrawerOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={!form.vendor_id} className="flex-1">Create PO</Button>
          </div>
        ) : undefined}
      >
        {selectedPO ? (
          /* View PO detail */
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Vendor</label>
                <p className="text-[13px] font-medium text-neutral-800">{selectedPO.vendor_name}</p>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Status</label>
                <Badge variant={(STATUS_VARIANTS[selectedPO.status] || 'neutral') as any} size="sm">{PO_STATUS_CONFIG[selectedPO.status]?.label}</Badge>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Created</label>
                <p className="text-[12px] text-neutral-600">{selectedPO.created_at}</p>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Expected</label>
                <p className="text-[12px] text-neutral-600">{selectedPO.expected_date || '—'}</p>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">Line Items</label>
              <div className="space-y-2">
                {selectedPO.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div>
                      <p className="text-[13px] font-medium text-neutral-800">{item.item_name}</p>
                      <p className="text-[11px] text-neutral-400">{item.quantity} × {fmt(item.unit_price)}</p>
                    </div>
                    <span className="text-[13px] font-semibold text-neutral-800 tabular-nums">{fmt(item.quantity * item.unit_price)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-200 mt-3">
                <span className="text-[13px] font-semibold text-neutral-700">Total</span>
                <span className="text-[15px] font-bold text-neutral-900 tabular-nums">{fmt(selectedPO.total)}</span>
              </div>
            </div>

            {selectedPO.notes && (
              <div>
                <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Notes</label>
                <p className="text-[12px] text-neutral-600">{selectedPO.notes}</p>
              </div>
            )}
          </div>
        ) : (
          /* Create PO form */
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Vendor <span className="text-red-500">*</span></label>
              <SearchableSelect options={vendorOptions} value={form.vendor_id} onChange={val => setForm(f => ({ ...f, vendor_id: val }))} placeholder="Select vendor" searchable={false} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Items</label>
                <button onClick={addLine} className="text-[11px] text-terra-600 font-semibold flex items-center gap-0.5 hover:text-terra-700">
                  <Plus className="w-3 h-3" /> Add Line
                </button>
              </div>
              <div className="space-y-2">
                {form.items.map((line: any, i: number) => (
                  <div key={i} className="flex items-end gap-2">
                    <div className="flex-1">
                      {i === 0 && <label className="text-[9px] text-neutral-400 uppercase block mb-1">Item</label>}
                      <Input value={line.item_name} onChange={e => updateLine(i, 'item_name', e.target.value)} placeholder="Item name" size="md" />
                    </div>
                    <div className="w-16">
                      {i === 0 && <label className="text-[9px] text-neutral-400 uppercase block mb-1">Qty</label>}
                      <Input type="number" value={line.quantity} onChange={e => updateLine(i, 'quantity', e.target.value)} placeholder="0" size="md" />
                    </div>
                    <div className="w-24">
                      {i === 0 && <label className="text-[9px] text-neutral-400 uppercase block mb-1">Price (₹)</label>}
                      <Input type="number" value={line.unit_price} onChange={e => updateLine(i, 'unit_price', e.target.value)} placeholder="0" size="md" />
                    </div>
                    {form.items.length > 1 && (
                      <button onClick={() => removeLine(i)} className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Expected Delivery</label>
              <Input type="date" value={form.expected_date} onChange={e => setForm(f => ({ ...f, expected_date: e.target.value }))} size="md" />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full min-h-[60px] px-3.5 py-2 text-sm bg-white border border-neutral-200 rounded-[var(--brand-radius-md)] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)]/10 hover:border-neutral-300 resize-none transition-all"
                placeholder="Additional notes..." />
            </div>
          </div>
        )}
      </Drawer>

      {/* Action menu — portaled to body to escape overflow clipping */}
      {openMenuId !== null && menuPos && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenMenuId(null)} />
          <div className="fixed z-[9999] w-44 bg-white rounded-lg shadow-lg shadow-neutral-900/10 border border-neutral-200 py-1"
            style={{ top: menuPos.top, right: menuPos.right }}>
            {(() => {
              const po = purchaseOrders.find(p => p.id === openMenuId) || allPOs.find(p => p.id === openMenuId);
              if (!po) return null;
              return (
                <>
                  <button onClick={() => { setOpenMenuId(null); openDetail(po); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50">
                    <Eye className="w-3.5 h-3.5 text-neutral-400" /> View Details
                  </button>
                  {po.status === 'pending' && (
                    <button onClick={() => { setOpenMenuId(null); updatePOStatus(po.id, 'approved'); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-emerald-700 hover:bg-emerald-50">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Approve
                    </button>
                  )}
                  {po.status === 'approved' && (
                    <button onClick={() => { setOpenMenuId(null); updatePOStatus(po.id, 'ordered'); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-blue-700 hover:bg-blue-50">
                      <Truck className="w-3.5 h-3.5 text-blue-500" /> Mark Ordered
                    </button>
                  )}
                  {po.status === 'ordered' && (
                    <button onClick={() => { setOpenMenuId(null); updatePOStatus(po.id, 'received'); }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-emerald-700 hover:bg-emerald-50">
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-500" /> Receive Goods
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
