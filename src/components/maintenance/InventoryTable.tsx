import { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search
} from 'lucide-react';
import { INVENTORY_CATEGORIES, formatDate } from '../../utils/maintenance';
import CustomDropdown from '../ui/CustomDropdown';

export default function InventoryTable({
  inventory,
  onUpdateStock,
  onEditItem,
  onDeleteItem,
  onAddItem,
  onUpdateMinStock
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'ok'
  const [stockInput, setStockInput] = useState({});
  const [minStockInput, setMinStockInput] = useState({});

  const filteredInventory = inventory.filter(item => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !item.name.toLowerCase().includes(query) &&
        !String(item.id).toLowerCase().includes(query) &&
        !item.location?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }

    // Stock level filter — matches getStockStatus logic
    const isLowStock = item.stockLevel === 0 || (item.minStock > 0 && item.stockLevel <= item.minStock);
    if (stockFilter === 'low' && !isLowStock) {
      return false;
    }
    if (stockFilter === 'ok' && isLowStock) {
      return false;
    }

    return true;
  });

  const handleStockChange = (itemId, value) => {
    setStockInput(prev => ({ ...prev, [itemId]: value }));
  };

  const handleStockUpdate = (itemId, isAddition) => {
    const rawValue = stockInput[itemId];
    // Default to 1 if no quantity entered, so +/- buttons always work
    const quantity = (rawValue !== undefined && rawValue !== '') ? parseInt(rawValue, 10) : 1;
    if (!isNaN(quantity) && quantity > 0) {
      onUpdateStock(itemId, quantity, isAddition);
      setStockInput(prev => ({ ...prev, [itemId]: '' }));
    }
  };

  const getCategoryLabel = (category) => {
    const cat = INVENTORY_CATEGORIES.find(c => c.value === category);
    return cat?.label || category;
  };

  const getStockStatus = (item) => {
    // BUG-019 FIX: Handle minStock=0 properly — only flag as Low/Critical when threshold is set
    if (item.stockLevel === 0) {
      return { label: 'Out', bgColor: 'bg-rose-50', textColor: 'text-rose-600', hasIcon: true };
    }
    if (item.minStock > 0 && item.stockLevel <= item.minStock * 0.5) {
      return { label: 'Critical', bgColor: 'bg-rose-50', textColor: 'text-rose-600', hasIcon: true };
    }
    if (item.minStock > 0 && item.stockLevel <= item.minStock) {
      return { label: 'Low', bgColor: 'bg-[#CDB261]/15', textColor: 'text-[#9A8545]', hasIcon: false };
    }
    return { label: 'OK', bgColor: 'bg-[#5C9BA4]/10', textColor: 'text-[#5C9BA4]', hasIcon: false };
  };

  const totalValue = inventory.reduce((sum, item) => sum + (item.stockLevel * item.unitCost), 0);
  const lowStockCount = inventory.filter(item => item.stockLevel === 0 || (item.minStock > 0 && item.stockLevel <= item.minStock)).length;

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
        <div className="bg-neutral-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-neutral-500 mb-1">
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-medium">Total Items</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-neutral-900">{inventory.length}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-rose-500 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-medium">Low Stock</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-rose-600">{lowStockCount}</p>
        </div>
        <div className="bg-neutral-50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-neutral-500 mb-1">
            <span className="text-[10px] sm:text-xs font-medium">Total Value</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-neutral-900">₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Search & Filters Row */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 bg-white"
            />
          </div>

          <div className="hidden sm:block sm:flex-1" />

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Category */}
            <div className="min-w-[130px] sm:min-w-[160px]">
              <CustomDropdown
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...INVENTORY_CATEGORIES.map(cat => ({
                    value: cat.value,
                    label: cat.label
                  }))
                ]}
                value={categoryFilter}
                onChange={setCategoryFilter}
                placeholder="All Categories"
              />
            </div>

            {/* Stock Filter */}
            <div className="min-w-[130px] sm:min-w-[160px]">
              <CustomDropdown
                options={[
                  { value: 'all', label: 'All Stock Levels' },
                  { value: 'low', label: 'Low Stock Only' },
                  { value: 'ok', label: 'Adequate Stock' }
                ]}
                value={stockFilter}
                onChange={setStockFilter}
                placeholder="All Stock Levels"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-[1100px]">
            <colgroup>
              <col style={{ width: '180px' }} /> {/* Item */}
              <col style={{ width: '120px' }} /> {/* Category */}
              <col style={{ width: '80px' }} /> {/* Stock */}
              <col style={{ width: '90px' }} /> {/* Min Stock */}
              <col style={{ width: '100px' }} /> {/* Status */}
              <col style={{ width: '100px' }} /> {/* Unit Cost */}
              <col style={{ width: '130px' }} /> {/* Location */}
              <col style={{ width: '140px' }} /> {/* Adjust */}
              <col style={{ width: '90px' }} /> {/* Actions */}
            </colgroup>
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-help" title="Set the minimum stock threshold — items below this level will show as Low or Critical">Min Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider">Unit Cost</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Adjust</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <tr key={item.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Item Name */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-neutral-900 text-sm">{item.name}</p>
                        <p className="text-xs text-neutral-500 font-mono">{typeof item.id === 'number' ? `INV-${item.id}` : item.id}</p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 bg-neutral-100 text-neutral-700 rounded-md text-xs font-medium">
                        {getCategoryLabel(item.category)}
                      </span>
                    </td>

                    {/* Stock Level */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-lg font-bold ${item.stockLevel <= item.minStock ? 'text-rose-600' : 'text-neutral-900'}`}>
                        {item.stockLevel}
                      </span>
                    </td>

                    {/* Min Stock - Editable */}
                    <td className="px-4 py-3 text-center">
                      <input
                        type="number"
                        min="0"
                        value={minStockInput[item.id] !== undefined ? minStockInput[item.id] : item.minStock}
                        onChange={(e) => setMinStockInput(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 0 }))}
                        onBlur={(e) => {
                          const newVal = parseInt(e.target.value) || 0;
                          if (newVal !== item.minStock) {
                            if (onUpdateMinStock) {
                              onUpdateMinStock(item.id, newVal);
                            } else {
                              onEditItem({ ...item, minStock: newVal });
                            }
                          }
                          setMinStockInput(prev => { const next = { ...prev }; delete next[item.id]; return next; });
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-16 px-2 py-1 border border-neutral-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white hover:border-neutral-300 transition-colors"
                        title="Edit minimum stock threshold"
                      />
                    </td>

                    {/* Status - BUG-019 FIX: Show tooltip explaining status logic */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${stockStatus.bgColor} ${stockStatus.textColor} cursor-help`}
                        title={
                          item.stockLevel === 0
                            ? 'Out of stock — add stock using the adjust controls'
                            : item.minStock > 0
                              ? `Stock: ${item.stockLevel} / Min: ${item.minStock} — ${stockStatus.label === 'Critical' ? 'Below 50% of minimum' : stockStatus.label === 'Low' ? 'Below minimum threshold' : 'Above minimum threshold'}`
                              : `Stock: ${item.stockLevel} — Set min stock to enable low-stock alerts`
                        }
                      >
                        {stockStatus.label === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                        {stockStatus.label}
                      </span>
                    </td>

                    {/* Unit Cost */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm text-neutral-900">₹{item.unitCost.toFixed(2)}</span>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-neutral-600">{item.location || '-'}</span>
                    </td>

                    {/* Stock Adjustment */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStockUpdate(item.id, false)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600 transition-colors"
                          title="Remove stock"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={stockInput[item.id] || ''}
                          onChange={(e) => handleStockChange(item.id, e.target.value)}
                          placeholder="0"
                          className="w-14 px-2 py-1 border border-neutral-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
                        />
                        <button
                          onClick={() => handleStockUpdate(item.id, true)}
                          className="p-1.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600 transition-colors"
                          title="Add stock"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
                          title="Edit item"
                        >
                          <Edit2 className="w-4 h-4 text-neutral-400 hover:text-neutral-600" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 hover:bg-rose-50 rounded transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4 text-neutral-400 hover:text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-neutral-500">No inventory items found</p>
            <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Results Count Footer */}
      <div className="px-4 sm:px-6 py-3 border-t border-neutral-100 text-xs text-neutral-500">
        Showing {filteredInventory.length} of {inventory.length} items
      </div>
    </div>
  );
}
