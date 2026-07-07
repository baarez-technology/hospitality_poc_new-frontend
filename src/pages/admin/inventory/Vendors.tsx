/**
 * Vendors — Matches admin design: search + table + UI2 drawer.
 */
import { useState } from 'react';
import { Plus, Truck, Phone, Mail } from 'lucide-react';
import { useInventory } from '../../../hooks/admin/useInventory';
import type { Vendor } from '../../../utils/inventory';
import { SearchBar } from '../../../components/ui2/SearchBar';
import { Badge } from '../../../components/ui2/Badge';
import { Drawer } from '../../../components/ui2/Drawer';
import { Input } from '../../../components/ui2/Input';
import { Button } from '../../../components/ui2/Button';

export default function Vendors() {
  const { vendors, addVendor, updateVendor } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', payment_terms: 'Net 30', items_supplied: '' });

  const filtered = searchQuery.trim()
    ? vendors.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.contact_person.toLowerCase().includes(searchQuery.toLowerCase()))
    : vendors;

  const openAdd = () => { setEditingVendor(null); setForm({ name: '', contact_person: '', phone: '', email: '', payment_terms: 'Net 30', items_supplied: '' }); setDrawerOpen(true); };
  const openEdit = (v: Vendor) => {
    setEditingVendor(v);
    setForm({ name: v.name, contact_person: v.contact_person, phone: v.phone, email: v.email, payment_terms: v.payment_terms, items_supplied: v.items_supplied.join(', ') });
    setDrawerOpen(true);
  };
  const handleSubmit = () => {
    const data = { ...form, items_supplied: form.items_supplied.split(',').map(s => s.trim()).filter(Boolean) };
    if (editingVendor) updateVendor(editingVendor.id, data); else addVendor(data);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Vendors</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Manage supplier contacts and order history.</p>
          </div>
          <button onClick={openAdd}
            className="h-9 px-4 rounded-lg bg-terra-600 text-white text-[13px] font-semibold flex items-center gap-1.5 hover:bg-terra-700 transition-colors self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-[10px] overflow-hidden">

          {/* Search */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-full sm:max-w-md">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} placeholder="Search vendors..." />
              </div>
              <span className="text-[11px] text-neutral-400 tabular-nums hidden sm:block">{filtered.length} vendors</span>
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Truck className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[13px] font-medium text-neutral-500">No vendors found</p>
              <button onClick={openAdd} className="mt-3 text-[12px] text-terra-600 font-semibold hover:text-terra-700">+ Add Vendor</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Vendor</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Contact</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">Items Supplied</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Terms</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Orders</th>
                    <th className="text-center py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(v => (
                    <tr key={v.id} onClick={() => openEdit(v)}
                      className="border-b border-neutral-50 cursor-pointer hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 sm:px-6">
                        <p className="text-[13px] font-medium text-neutral-900">{v.name}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5 md:hidden">{v.contact_person}</p>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <p className="text-[12px] text-neutral-700">{v.contact_person}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-neutral-400 flex items-center gap-0.5"><Phone className="w-2.5 h-2.5" />{v.phone}</span>
                          {v.email && <span className="text-[10px] text-neutral-400 flex items-center gap-0.5"><Mail className="w-2.5 h-2.5" />{v.email}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {v.items_supplied.slice(0, 3).map((item, i) => (
                            <Badge key={i} variant="neutral" size="xs">{item}</Badge>
                          ))}
                          {v.items_supplied.length > 3 && (
                            <Badge variant="neutral" size="xs">+{v.items_supplied.length - 3}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center hidden sm:table-cell">
                        <span className="text-[12px] text-neutral-500">{v.payment_terms}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-[13px] font-semibold text-neutral-800 tabular-nums">{v.total_orders}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center hidden sm:table-cell">
                        <span className="text-[11px] text-neutral-400">{v.last_order_date || '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {filtered.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <p className="text-[11px] sm:text-[13px] text-neutral-500">
                Showing <span className="font-semibold text-neutral-700">{filtered.length}</span> of <span className="font-semibold text-neutral-700">{vendors.length}</span> vendors
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingVendor(null); }}
        title={editingVendor ? 'Edit Vendor' : 'Add Vendor'}
        subtitle={editingVendor ? `Editing ${editingVendor.name}` : 'Add a new supplier'}
        maxWidth="max-w-md"
        footer={
          <div className="flex gap-3">
            <Button variant="outline-neutral" onClick={() => setDrawerOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!form.name.trim()} className="flex-1">
              {editingVendor ? 'Update' : 'Add Vendor'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Company Name <span className="text-red-500">*</span></label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Fresh Farm Supplies" size="md" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Contact Person</label>
            <Input value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} placeholder="Ramesh Kumar" size="md" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Phone</label>
              <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 11111" size="md" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Email</label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="vendor@email.com" size="md" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Payment Terms</label>
            <Input value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))} placeholder="Net 30" size="md" />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Items Supplied</label>
            <Input value={form.items_supplied} onChange={e => setForm(f => ({ ...f, items_supplied: e.target.value }))} placeholder="Rice, Oil, Spices (comma separated)" size="md" />
            <p className="text-[10px] text-neutral-400 mt-1">Separate items with commas</p>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
