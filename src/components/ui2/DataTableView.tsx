/**
 * Glimmora Design System v5.0 - DataTableView
 * Complete data table with underline tabs, search, filters, table, and pagination
 * Consistent with CMS Bookings page design
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../../lib/utils';

// ============================================
// UNDERLINE TABS
// ============================================
export function UnderlineTabs({ tabs, activeTab, onTabChange, className }) {
  return (
    <div className={cn('flex items-center gap-6 px-6 border-b border-neutral-200', className)}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-2 py-4 text-[13px] font-medium transition-colors',
              isActive
                ? 'text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-600">
                {tab.count}
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-terra-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// SEARCH BAR
// ============================================
export function TableSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className
}) {
  return (
    <div className={cn('relative flex-1', className)}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 pl-11 pr-4 text-[13px] text-neutral-700 placeholder:text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-200 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      )}
    </div>
  );
}

// ============================================
// FILTERS DROPDOWN
// ============================================
export function TableFilters({
  filters, // [{ id, label, options: [{ value, label }], value }]
  onFilterChange,
  hasActiveFilters,
  onClearFilters,
  className
}) {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={filterRef}>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={cn(
          'h-11 px-5 rounded-lg flex items-center gap-2 text-[13px] font-medium transition-colors',
          hasActiveFilters
            ? 'bg-terra-50 text-terra-600 border border-terra-200'
            : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
        )}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-terra-500" />
        )}
      </button>

      {showFilters && (
        <div className="absolute top-full right-0 mt-2 w-64 rounded-lg bg-white shadow-lg border border-neutral-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 space-y-4">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                  {filter.label}
                </label>
                <select
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.id, e.target.value)}
                  className="w-full h-10 px-3 text-[13px] rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500"
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {hasActiveFilters && (
              <button
                onClick={() => {
                  onClearFilters();
                  setShowFilters(false);
                }}
                className="w-full h-10 rounded-lg text-[13px] font-medium text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PAGINATION
// ============================================
export function TablePagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel = 'items',
  className,
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-between px-6 py-4 border-t border-neutral-100', className)}>
      <p className="text-[13px] text-neutral-400 font-medium">
        Showing {startItem} to {endItem} of {totalItems} {itemLabel}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-400" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-10 h-10 rounded-lg text-[13px] font-semibold transition-all',
              currentPage === page
                ? 'bg-terra-500 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            )}
          >
            {page}
          </button>
        ))}

        {totalPages > 5 && (
          <>
            <span className="text-neutral-400">...</span>
            <button
              onClick={() => onPageChange(totalPages)}
              className={cn(
                'w-10 h-10 rounded-lg text-[13px] font-semibold transition-all',
                currentPage === totalPages
                  ? 'bg-terra-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              )}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
        >
          <ChevronRight className="w-5 h-5 text-neutral-400" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
export function TableEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn('px-6 py-16 text-center', className)}>
      <div className="flex flex-col items-center gap-4">
        {Icon && (
          <div className="w-16 h-16 rounded-lg bg-neutral-50 flex items-center justify-center">
            <Icon className="w-8 h-8 text-neutral-300" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-neutral-600">{title}</p>
          {description && (
            <p className="text-[11px] text-neutral-400">{description}</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}

// ============================================
// DATA TABLE VIEW - Complete Component
// ============================================
export function DataTableView({
  // Tabs
  tabs,
  activeTab,
  onTabChange,
  // Search
  searchValue,
  onSearchChange,
  searchPlaceholder,
  // Filters
  filters,
  onFilterChange,
  hasActiveFilters,
  onClearFilters,
  // Table
  columns,
  data,
  renderRow,
  onRowClick,
  // Pagination
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemLabel,
  // Empty State
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  // Loading
  loading,
  // Styling
  className,
}) {
  return (
    <div className={cn('rounded-[10px] bg-white overflow-hidden', className)}>
      {/* Tabs */}
      {tabs && (
        <UnderlineTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      )}

      {/* Search & Filters Row */}
      <div className="flex items-center gap-4 p-4 border-b border-neutral-100">
        <TableSearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />
        {filters && (
          <TableFilters
            filters={filters}
            onFilterChange={onFilterChange}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
          />
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="px-6 py-16 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-terra-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-[13px] text-neutral-400 mt-4">Loading...</p>
        </div>
      ) : data.length === 0 ? (
        <TableEmptyState
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50/30">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'py-4 px-6 text-[10px] font-semibold uppercase tracking-widest text-neutral-400',
                      col.align === 'right' ? 'text-right' : 'text-left'
                    )}
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.map((row, index) => renderRow(row, index, onRowClick))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && data.length > 0 && totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          itemLabel={itemLabel}
        />
      )}
    </div>
  );
}

export default DataTableView;
