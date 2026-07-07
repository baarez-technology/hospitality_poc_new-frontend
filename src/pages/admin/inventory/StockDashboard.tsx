/**
 * Stock Dashboard — Matches admin design: KPIs + category breakdown + stock levels table.
 */
import { useMemo } from 'react';
import { Package, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { useInventory } from '../../../hooks/admin/useInventory';
import { ITEM_CATEGORIES } from '../../../utils/inventory';
import { formatCurrency } from '../../../utils/formatters';
import { SearchBar } from '../../../components/ui2/SearchBar';
import { SearchableSelect } from '../../../components/ui2/SearchableSelect';
import { Badge } from '../../../components/ui2/Badge';

const fmt = (v: number) => formatCurrency(v, 'INR');
const categoryOptions = ITEM_CATEGORIES.map(c => ({ value: c.value, label: c.label }));

export default function StockDashboard() {
  const { allItems, lowStockItems, outOfStockItems, totalStockValue, searchQuery, setSearchQuery, categoryFilter, setCategoryFilter } = useInventory();

  const categoryBreakdown = useMemo(() => {
    const groups: Record<string, { count: number; value: number; lowCount: number }> = {};
    allItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = { count: 0, value: 0, lowCount: 0 };
      groups[item.category].count++;
      groups[item.category].value += item.current_stock * item.last_price;
      if (item.current_stock <= item.min_level) groups[item.category].lowCount++;
    });
    return Object.entries(groups).map(([cat, data]) => ({
      category: cat,
      label: ITEM_CATEGORIES.find(c => c.value === cat)?.label || cat,
      ...data,
    })).sort((a, b) => b.value - a.value);
  }, [allItems]);

  const sortedItems = useMemo(() => {
    let items = [...allItems];
    if (categoryFilter) items = items.filter(i => i.category === categoryFilter);
    if (searchQuery.trim()) items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return items.sort((a, b) => (a.current_stock / a.min_level) - (b.current_stock / b.min_level));
  }, [allItems, categoryFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Stock Dashboard</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">Real-time stock levels and alerts.</p>
        </header>

        {/* KPIs — Dashboard pattern */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Items', value: String(allItems.length), icon: Package, color: 'ocean' },
            { label: 'Low Stock', value: String(lowStockItems.length), sub: 'Below reorder level', icon: AlertTriangle, color: 'gold' },
            { label: 'Out of Stock', value: String(outOfStockItems.length), icon: TrendingDown, color: 'rose' },
            { label: 'Stock Value', value: fmt(totalStockValue), icon: DollarSign, color: 'sage' },
          ].map(kpi => (
            <div key={kpi.label} className="bg-white rounded-[10px] p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-${kpi.color}-50`}>
                  <kpi.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-${kpi.color}-600`} />
                </div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{kpi.label}</p>
              </div>
              <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 tabular-nums">{kpi.value}</p>
              {kpi.sub && <p className="text-[10px] text-neutral-400 mt-1">{kpi.sub}</p>}
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-[10px] p-4 sm:p-6">
          <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Stock by Category</h3>
          <div className="space-y-3">
            {categoryBreakdown.map(cat => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] font-medium text-neutral-700 capitalize">{cat.label}</span>
                  <span className="text-[11px] text-neutral-500">
                    {cat.count} items · {fmt(cat.value)}
                    {cat.lowCount > 0 && <span className="text-amber-600 ml-1.5">({cat.lowCount} low)</span>}
                  </span>
                </div>
                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-terra-400 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((cat.value / totalStockValue) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Levels Table */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center gap-3">
            <h3 className="text-[13px] font-semibold text-neutral-800">Stock Levels</h3>
            <div className="hidden sm:block flex-1" />
            <div className="flex items-center gap-2">
              <div className="w-full sm:w-56">
                <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} placeholder="Search items..." size="sm" />
              </div>
              <div className="w-44">
                <SearchableSelect options={[{ value: '', label: 'All Categories' }, ...categoryOptions]} value={categoryFilter} onChange={setCategoryFilter} placeholder="All Categories" searchable={false} />
              </div>
            </div>
          </div>

          <div className="divide-y divide-neutral-50 max-h-[450px] overflow-auto">
            {sortedItems.map(item => {
              const pct = Math.min(100, Math.round((item.current_stock / item.max_level) * 100));
              const isLow = item.current_stock <= item.min_level && item.current_stock > 0;
              const isOut = item.current_stock === 0;
              return (
                <div key={item.id} className={`flex items-center gap-4 px-4 sm:px-6 py-3 ${isOut ? 'bg-red-50/30' : isLow ? 'bg-amber-50/20' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-neutral-800">{item.name}</span>
                      {isOut && <Badge variant="danger" size="xs">Out</Badge>}
                      {isLow && !isOut && <Badge variant="warning" size="xs">Low</Badge>}
                    </div>
                    <span className="text-[10px] text-neutral-400 capitalize">{item.category} · {item.sku}</span>
                  </div>
                  <div className="w-28 hidden sm:block">
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="w-24 text-right flex-shrink-0">
                    <span className={`text-[13px] font-semibold tabular-nums ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-neutral-800'}`}>{item.current_stock}</span>
                    <span className="text-[10px] text-neutral-400 ml-0.5">/ {item.max_level} {item.unit}</span>
                  </div>
                </div>
              );
            })}
            {sortedItems.length === 0 && (
              <div className="py-12 text-center text-neutral-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-[13px]">No items found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
