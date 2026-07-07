/**
 * Menu Builder — Matches admin design system exactly.
 * Uses: Bookings-style Tabs, SearchBar from ui2, Badge, Pagination.
 * Currency via formatCurrency (centralized ₹ symbol).
 * All dropdowns use custom styled components, not native <select>.
 */
import { useState, useMemo } from 'react';
import { Plus, Search, X, Pencil, ChevronDown, UtensilsCrossed } from 'lucide-react';
import { useMenuBuilder } from '../../../hooks/admin/useMenuBuilder';
import MenuItemDrawer from '../../../components/fnb/MenuItemDrawer';
import { filterMenuItems } from '../../../utils/fnb';
import { formatCurrency } from '../../../utils/formatters';
import { SearchBar } from '../../../components/ui2/SearchBar';
import { Badge } from '../../../components/ui2/Badge';
import type { MenuItem } from '../../../api/services/fnb.service';

const fmt = (v: number) => formatCurrency(v, 'INR');

export default function MenuBuilder() {
  const {
    outlets, selectedOutletId, setSelectedOutletId,
    categories, menuItems, loading,
    addCategory, addMenuItem, updateMenuItem, toggleItemAvailability,
  } = useMenuBuilder();

  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'off'>('all');
  const [outletDropdown, setOutletDropdown] = useState(false);

  const filteredItems = useMemo(() => {
    let items = filterMenuItems(menuItems, searchQuery, activeCategoryId, vegFilter === 'veg');
    if (vegFilter === 'nonveg') items = items.filter(i => !i.is_veg);
    if (statusFilter === 'active') items = items.filter(i => i.is_available);
    if (statusFilter === 'off') items = items.filter(i => !i.is_available);
    return items;
  }, [menuItems, searchQuery, activeCategoryId, vegFilter, statusFilter]);

  const handleEditItem = (item: MenuItem) => { setEditingItem(item); setDrawerOpen(true); };
  const handleAddItem = () => { setEditingItem(null); setDrawerOpen(true); };
  const handleSubmitItem = (data: Partial<MenuItem>) => { if (data.id) updateMenuItem(data.id, data); else addMenuItem(data); };
  const handleAddCategory = () => { if (!newCategoryName.trim()) return; addCategory(newCategoryName.trim()); setNewCategoryName(''); setShowAddCategory(false); };

  const currentOutlet = outlets.find(o => o.id === selectedOutletId);

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* ── Page Header (matches Bookings) ── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Menu Builder</h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Manage menu items, categories, pricing, and availability.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Outlet selector — custom dropdown, not native select */}
            <div className="relative">
              <button onClick={() => setOutletDropdown(!outletDropdown)}
                className="h-9 pl-3 pr-8 rounded-lg border border-neutral-200 bg-white text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                {currentOutlet?.name || 'Select outlet'}
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 transition-transform ${outletDropdown ? 'rotate-180' : ''}`} />
              </button>
              {outletDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setOutletDropdown(false)} />
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-[10px] border border-neutral-200 shadow-lg z-20 py-1 overflow-hidden">
                    {outlets.map(o => (
                      <button key={o.id} onClick={() => { setSelectedOutletId(o.id); setOutletDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                          selectedOutletId === o.id ? 'bg-terra-50 text-terra-700 font-semibold' : 'text-neutral-700 hover:bg-neutral-50'
                        }`}>
                        {o.name}
                        <span className="text-[11px] text-neutral-400 ml-2 capitalize">{o.type.replace('_', ' ')}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Add category */}
            {showAddCategory ? (
              <div className="flex items-center gap-1.5">
                <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setShowAddCategory(false); }}
                  className="h-9 w-36 border border-neutral-200 rounded-lg px-3 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-300" placeholder="Category name" autoFocus />
                <button onClick={handleAddCategory} className="h-9 px-3 rounded-lg bg-terra-600 text-white text-[12px] font-semibold hover:bg-terra-700">Add</button>
                <button onClick={() => setShowAddCategory(false)} className="h-9 w-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-neutral-50"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <button onClick={() => setShowAddCategory(true)}
                className="h-9 px-3 rounded-lg border border-neutral-200 text-[12px] font-medium text-neutral-600 hover:bg-neutral-50 transition-colors hidden sm:flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Category
              </button>
            )}
            {/* Add item */}
            <button onClick={handleAddItem}
              className="h-9 px-4 rounded-lg bg-terra-600 text-white text-[13px] font-semibold flex items-center gap-1.5 hover:bg-terra-700 transition-colors">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Item</span>
            </button>
          </div>
        </header>

        {/* ── Main Card (matches Bookings) ── */}
        <div className="bg-white rounded-[10px] overflow-hidden">

          {/* Category Tabs — same pattern as Bookings Tabs */}
          <div className="border-b border-neutral-100">
            <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
              <TabItem label="All Items" shortLabel="All" count={menuItems.length} active={activeCategoryId === null} onClick={() => setActiveCategoryId(null)} />
              {categories.map(cat => (
                <TabItem key={cat.id} label={cat.name} shortLabel={cat.name} count={menuItems.filter(i => i.category_id === cat.id).length}
                  active={activeCategoryId === cat.id} onClick={() => setActiveCategoryId(cat.id)} />
              ))}
            </div>
          </div>

          {/* Search & Filters (same layout as Bookings) */}
          <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-full sm:flex-1 sm:max-w-md">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} placeholder="Search menu items..." />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <div className="flex items-center gap-2 flex-wrap">
                {/* Veg/Nonveg filter */}
                <div className="flex items-center gap-1">
                  {([['all', 'All'], ['veg', 'Veg'], ['nonveg', 'Non-Veg']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setVegFilter(val)}
                      className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-colors flex items-center gap-1.5 ${
                        vegFilter === val
                          ? 'bg-terra-50 text-terra-700 border border-terra-200'
                          : 'text-neutral-500 hover:bg-neutral-100 border border-transparent'
                      }`}>
                      {val === 'veg' && <span className="w-2 h-2 rounded-sm bg-green-600" />}
                      {val === 'nonveg' && <span className="w-2 h-2 rounded-sm bg-red-600" />}
                      {label}
                    </button>
                  ))}
                </div>
                <span className="w-px h-5 bg-neutral-200" />
                {/* Status filter */}
                <div className="flex items-center gap-1">
                  {([['all', 'All'], ['active', 'Active'], ['off', 'Off']] as const).map(([val, label]) => (
                    <button key={val} onClick={() => setStatusFilter(val)}
                      className={`h-8 px-3 rounded-lg text-[12px] font-medium transition-colors ${
                        statusFilter === val
                          ? 'bg-terra-50 text-terra-700 border border-terra-200'
                          : 'text-neutral-500 hover:bg-neutral-100 border border-transparent'
                      }`}>{label}</button>
                  ))}
                </div>
                <span className="text-[11px] text-neutral-400 tabular-nums ml-1">{filteredItems.length} items</span>
              </div>
            </div>
          </div>

          {/* ── Data Table ── */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-[3px] border-neutral-200 border-t-terra-600 rounded-full animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
              <UtensilsCrossed className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-[13px] font-medium text-neutral-500">No menu items found</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{searchQuery ? 'Try a different search' : 'Add your first item'}</p>
              {!searchQuery && <button onClick={handleAddItem} className="mt-3 text-[12px] text-terra-600 font-semibold hover:text-terra-700">+ Add Item</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-4 sm:px-6 text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-10" />
                    <th className="text-left py-3 px-3 text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Item</th>
                    <th className="text-left py-3 px-3 text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-right py-3 px-3 text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Price</th>
                    <th className="text-center py-3 px-3 text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider hidden lg:table-cell">Prep</th>
                    <th className="text-center py-3 px-3 text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                    <th className="w-10 py-3 px-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const catName = categories.find(c => c.id === item.category_id)?.name || '—';
                    return (
                      <tr key={item.id} onClick={() => handleEditItem(item)}
                        className={`border-b border-neutral-50 cursor-pointer transition-colors hover:bg-neutral-50/80 ${!item.is_available ? 'opacity-50' : ''}`}>
                        {/* Veg dot */}
                        <td className="py-3 px-4 sm:px-6">
                          <div className={`w-[14px] h-[14px] rounded-[3px] border-[1.5px] flex items-center justify-center ${item.is_veg ? 'border-green-600' : 'border-red-600'}`}>
                            <div className={`w-[6px] h-[6px] rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
                          </div>
                        </td>
                        {/* Name */}
                        <td className="py-3 px-3">
                          <p className="text-[13px] font-medium text-neutral-900">{item.name}</p>
                          {item.description && <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1 max-w-[280px]">{item.description}</p>}
                          {item.modifier_groups && item.modifier_groups.length > 0 && (
                            <Badge variant="primary" size="xs" className="mt-1">{item.modifier_groups.length} modifier{item.modifier_groups.length > 1 ? 's' : ''}</Badge>
                          )}
                        </td>
                        {/* Category */}
                        <td className="py-3 px-3 hidden md:table-cell">
                          <span className="text-[12px] text-neutral-500">{catName}</span>
                        </td>
                        {/* Price — uses formatCurrency (₹ symbol) */}
                        <td className="py-3 px-3 text-right">
                          <span className="text-[13px] font-semibold text-neutral-900 tabular-nums">{fmt(item.price)}</span>
                        </td>
                        {/* Prep */}
                        <td className="py-3 px-3 text-center hidden lg:table-cell">
                          <span className="text-[12px] text-neutral-400 tabular-nums">{item.prep_time_minutes}m</span>
                        </td>
                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <button onClick={e => { e.stopPropagation(); toggleItemAvailability(item.id); }} className="inline-flex items-center gap-1.5">
                            {item.is_available ? (
                              <Badge variant="success" size="xs" dot dotColor="emerald">Active</Badge>
                            ) : (
                              <Badge variant="neutral" size="xs" dot dotColor="gray">Off</Badge>
                            )}
                          </button>
                        </td>
                        {/* Edit */}
                        <td className="py-3 px-3">
                          <button onClick={e => { e.stopPropagation(); handleEditItem(item); }}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
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
          {filteredItems.length > 0 && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <div className="flex items-center justify-between text-[11px] sm:text-[13px] text-neutral-500">
                <span>Showing <span className="font-semibold text-neutral-700">{filteredItems.length}</span> of <span className="font-semibold text-neutral-700">{menuItems.length}</span> items</span>
                <span>{categories.length} categories · {menuItems.filter(i => i.is_available).length} active</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit / Add Drawer */}
      <MenuItemDrawer isOpen={drawerOpen} onClose={() => { setDrawerOpen(false); setEditingItem(null); }} onSubmit={handleSubmitItem} item={editingItem} categories={categories} />
    </div>
  );
}

// ── Tab Item (matches Bookings Tabs pattern exactly) ──

function TabItem({ label, shortLabel, count, active, onClick }: {
  label: string; shortLabel: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`relative px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
        active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
      }`}>
      <span className="flex items-center gap-1.5 sm:gap-2">
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{shortLabel}</span>
        <span className={`px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold tabular-nums ${
          active ? 'bg-terra-500 text-white' : 'bg-neutral-100 text-neutral-500'
        }`}>{count}</span>
      </span>
      {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />}
    </button>
  );
}
