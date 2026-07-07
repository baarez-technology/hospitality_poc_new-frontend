/**
 * Inventory Catalog — Matches admin design: Bookings-style tabs + table + UI2 drawer.
 */
import { useState } from 'react';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { useInventory } from '../../../hooks/admin/useInventory';
import { ITEM_CATEGORIES, UNITS } from '../../../utils/inventory';
import type { InventoryItem } from '../../../utils/inventory';
import { formatCurrency } from '../../../utils/formatters';
import { SearchBar } from '../../../components/ui2/SearchBar';
import { Badge } from '../../../components/ui2/Badge';
import { Drawer } from '../../../components/ui2/Drawer';
import { Input } from '../../../components/ui2/Input';
import { SearchableSelect } from '../../../components/ui2/SearchableSelect';
import { Button } from '../../../components/ui2/Button';

const fmt = (v: number) => formatCurrency(v, 'INR');
const categoryOptions = ITEM_CATEGORIES.map(c => ({ value: c.value, label: c.label }));
const unitOptions = UNITS.map(u => ({ value: u.value, label: u.label }));

export default function Catalog() {
  const { items, allItems, lowStockItems, outOfStockItems, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, addItem, updateItem } = useInventory();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState({ name: '', category: 'food', sku: '', unit: 'piece', current_stock: '', min_level: '10', max_level: '100', last_price: '' });
  const [activeTab, setActiveTab] = useState<'all' | 'low' | 'out'>('all');

  const openAdd = () => { setEditingItem(null); setForm({ name: '', category: 'food', sku: '', unit: 'piece', current_stock: '', min_level: '10', max_level: '100', last_price: '' }); setDrawerOpen(true); };
  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({ name: item.name, category: item.category, sku: item.sku, unit: item.unit, current_stock: String(item.current_stock), min_level: String(item.min_level), max_level: String(item.max_level), last_price: String(item.last_price) });
    setDrawerOpen(true);
  };
  const handleSubmit = () => {
    const data = { name: form.name, category: form.category, sku: form.sku, unit: form.unit, current_stock: parseInt(form.current_stock) || 0, min_level: parseInt(form.min_level) || 10, max_level: parseInt(form.max_level) || 100, last_price: parseFloat(form.last_price) || 0 };
    if (editingItem) updateItem(editingItem.id, data); else addItem(data);
    setDrawerOpen(false);
  };

  const displayItems = activeTab === 'low' ? items.filter(i => i.current_stock <= i.min_level && i.current_stock > 0)
    : activeTab === 'out' ? items.filter(i => i.current_stock === 0) : items;

  const tabs = [
    { id: 'all' as const, label: 'All Items', short: 'All', count: allItems.length },
    { id: 'low' as const, label: 'Low Stock', short: 'Low', count: lowStockItems.length },
    { id: 'out' as const, label: 'Out of Stock', short: 'Out', count: outOfStockItems.length },
  ];

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Item Catalog</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Manage inventory items, stock levels, and reorder points.
            </p>
          </div>
          <button onClick={openAdd}
            className="h-9 px-4 rounded-lg bg-terra-600 text-white text-[13px] font-semibold flex items-center gap-1.5 hover:bg-terra-700 transition-colors self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-[10px] overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-neutral-100">
            <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`relative px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
                  }`}>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                    <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold tabular-nums ${
                      activeTab === tab.id ? 'bg-terra-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}>{tab.count}</span>
                  </span>
                  {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Search + Filter */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-full sm:flex-1 sm:max-w-md">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} placeholder="Search items by name or SKU..." />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <div className="flex items-center gap-2">
                <div className="w-48">
                  <SearchableSelect
                    options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    placeholder="All Categories"
                    searchable={false}
                  />
                </div>
                <span className="text-[11px] text-neutral-400 tabular-nums">{displayItems.length} items</span>
              </div>
            </div>
          </div>

          {/* Table */}
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <Package className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[13px] font-medium text-neutral-500">No items found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Item</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-left py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">SKU</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Stock</th>
                    <th className="text-center py-3 px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden sm:table-cell">Level</th>
                    <th className="text-right py-3 px-4 sm:px-6 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {displayItems.map(item => {
                    const isLow = item.current_stock <= item.min_level;
                    const isOut = item.current_stock === 0;
                    const pct = Math.min(100, Math.round((item.current_stock / item.max_level) * 100));
                    return (
                      <tr key={item.id} onClick={() => openEdit(item)}
                        className={`border-b border-neutral-50 cursor-pointer hover:bg-neutral-50/80 transition-colors ${!item.current_stock ? 'opacity-50' : ''}`}>
                        <td className="py-3 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            {isLow && !isOut && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                            {isOut && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                            <div>
                              <p className="text-[13px] font-medium text-neutral-900">{item.name}</p>
                              <p className="text-[11px] text-neutral-400 capitalize mt-0.5 md:hidden">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <Badge variant="neutral" size="xs">{item.category}</Badge>
                        </td>
                        <td className="py-3 px-3 hidden lg:table-cell">
                          <span className="text-[11px] text-neutral-400 font-mono">{item.sku}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-[13px] font-semibold tabular-nums ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-neutral-800'}`}>
                            {item.current_stock}
                          </span>
                          <span className="text-[10px] text-neutral-400 ml-0.5">{item.unit}</span>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <div className="w-16 mx-auto">
                            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${pct <= 25 ? 'bg-red-500' : pct <= 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 sm:px-6 text-right">
                          <span className="text-[13px] font-medium text-neutral-700 tabular-nums">{fmt(item.last_price)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {displayItems.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <p className="text-[11px] sm:text-[13px] text-neutral-500">
                Showing <span className="font-semibold text-neutral-700">{displayItems.length}</span> of <span className="font-semibold text-neutral-700">{allItems.length}</span> items
                {lowStockItems.length > 0 && <> · <span className="text-amber-600 font-semibold">{lowStockItems.length} low stock</span></>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Drawer */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Item' : 'Add Item'}
        subtitle={editingItem ? `Editing ${editingItem.name}` : 'Add a new inventory item'}
        maxWidth="max-w-md"
        footer={
          <div className="flex gap-3">
            <Button variant="outline-neutral" onClick={() => setDrawerOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!form.name.trim()} className="flex-1">
              {editingItem ? 'Update' : 'Add Item'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Name <span className="text-red-500">*</span></label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Basmati Rice" size="md" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Category</label>
              <SearchableSelect options={categoryOptions} value={form.category} onChange={val => setForm(f => ({ ...f, category: val }))} placeholder="Select" searchable={false} />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Unit</label>
              <SearchableSelect options={unitOptions} value={form.unit} onChange={val => setForm(f => ({ ...f, unit: val }))} placeholder="Select" searchable={false} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">SKU</label>
            <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="FD-001" size="md" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Current Stock</label>
              <Input type="number" value={form.current_stock} onChange={e => setForm(f => ({ ...f, current_stock: e.target.value }))} placeholder="0" size="md" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Min Level</label>
              <Input type="number" value={form.min_level} onChange={e => setForm(f => ({ ...f, min_level: e.target.value }))} placeholder="10" size="md" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Max Level</label>
              <Input type="number" value={form.max_level} onChange={e => setForm(f => ({ ...f, max_level: e.target.value }))} placeholder="100" size="md" />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Last Purchase Price (₹)</label>
            <Input type="number" value={form.last_price} onChange={e => setForm(f => ({ ...f, last_price: e.target.value }))} placeholder="0" size="md" />
          </div>
        </div>
      </Drawer>
    </div>
  );
}
