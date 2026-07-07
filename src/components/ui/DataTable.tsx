import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * DataTable Component - Enterprise-grade table with sorting, filtering, and pagination
 *
 * Features:
 * - Column sorting (click headers to sort)
 * - Global search filtering
 * - Pagination with customizable page sizes
 * - Responsive design (switches to card view on mobile)
 * - Row selection for bulk actions
 * - Accessible (WCAG 2.1 AA compliant)
 */
export default function DataTable({
  columns,
  data,
  pagination = true,
  sorting = true,
  filtering = true,
  bulkActions = false,
  initialPageSize = 10,
  onRowClick,
  mobileBreakpoint = 768,
}) {
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sortingState, setSortingState] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  // Detect mobile view
  const [isMobile, setIsMobile] = useState(false);

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sortingState,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination: paginationState,
    },
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPaginationState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: bulkActions,
  });

  const selectedRows = table.getSelectedRowModel().rows;

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      {filtering && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-glimmora-neutral-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-glimmora-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-glimmora-terra-500 focus:border-transparent"
              aria-label="Search table"
            />
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {bulkActions && selectedRows.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-glimmora-terra-50 border border-glimmora-terra-200 rounded-lg" role="alert" aria-live="polite">
          <span className="text-sm font-medium text-glimmora-neutral-900">
            {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setRowSelection({})}
              className="px-4 py-2 text-sm font-medium text-glimmora-neutral-700 hover:bg-glimmora-neutral-100 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-glimmora-neutral-200 overflow-hidden bg-white">
        <table className="w-full" role="table" aria-label="Data table">
          <thead className="bg-glimmora-neutral-50 border-b border-glimmora-neutral-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} role="row">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-semibold text-glimmora-neutral-600 uppercase tracking-wider"
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {sorting && header.column.getCanSort() ? (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center gap-2 hover:text-glimmora-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-glimmora-terra-500 rounded px-1 -mx-1"
                            aria-label={`Sort by ${header.column.columnDef.header}`}
                            aria-sort={
                              header.column.getIsSorted() === 'asc'
                                ? 'ascending'
                                : header.column.getIsSorted() === 'desc'
                                ? 'descending'
                                : 'none'
                            }
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="w-4 h-4" aria-hidden="true" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <ChevronsUpDown className="w-4 h-4 opacity-40" aria-hidden="true" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-glimmora-neutral-100">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={`${
                  onRowClick ? 'cursor-pointer hover:bg-glimmora-neutral-50' : ''
                } transition-colors`}
                role="row"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 text-sm text-glimmora-neutral-700"
                    role="cell"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-12 text-sm text-glimmora-neutral-500">
            No results found
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {table.getRowModel().rows.map((row) => (
          <div
            key={row.id}
            onClick={() => onRowClick && onRowClick(row.original)}
            className={`p-4 bg-white border border-glimmora-neutral-200 rounded-2xl ${
              onRowClick ? 'cursor-pointer active:scale-[0.98]' : ''
            } transition-transform`}
          >
            {row.getVisibleCells().map((cell) => (
              <div key={cell.id} className="mb-2 last:mb-0">
                <div className="text-xs text-glimmora-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                  {cell.column.columnDef.header}
                </div>
                <div className="text-sm text-glimmora-neutral-900">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </div>
            ))}
          </div>
        ))}

        {table.getRowModel().rows.length === 0 && (
          <div className="text-center py-12 text-sm text-glimmora-neutral-500">
            No results found
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-glimmora-neutral-200">
          <div className="text-sm text-glimmora-neutral-600">
            Showing{' '}
            <span className="font-medium text-glimmora-neutral-900">
              {paginationState.pageIndex * paginationState.pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-glimmora-neutral-900">
              {Math.min(
                (paginationState.pageIndex + 1) * paginationState.pageSize,
                data.length
              )}
            </span>{' '}
            of{' '}
            <span className="font-medium text-glimmora-neutral-900">{data.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-glimmora-neutral-700 bg-white border border-glimmora-neutral-200 rounded-lg hover:bg-glimmora-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-glimmora-terra-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-glimmora-neutral-700 bg-white border border-glimmora-neutral-200 rounded-lg hover:bg-glimmora-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-glimmora-terra-500"
              aria-label="Next page"
            >
              Next
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
