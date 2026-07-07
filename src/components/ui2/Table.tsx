import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Glimmora Design System v4.0 - Table Components
 * Data tables with sorting, selection, and actions
 */

// Table Container
export function Table({ className, children, ...props }) {
  return (
    <div className={cn('w-full overflow-hidden', className)} {...props}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

// Table Header
export function TableHeader({ className, children, ...props }) {
  return (
    <thead
      className={cn('bg-white border-b border-neutral-100', className)}
      {...props}
    >
      {children}
    </thead>
  );
}

// Table Body
export function TableBody({ className, children, ...props }) {
  return (
    <tbody className={cn('divide-y divide-neutral-100', className)} {...props}>
      {children}
    </tbody>
  );
}

// Table Footer
export function TableFooter({ className, children, ...props }) {
  return (
    <tfoot
      className={cn('bg-neutral-50/50 border-t border-neutral-100', className)}
      {...props}
    >
      {children}
    </tfoot>
  );
}

// Table Row
export function TableRow({ className, selected, clickable, children, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors duration-100 group',
        selected ? 'bg-terra-50' : 'bg-white hover:bg-neutral-50/80',
        clickable && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

// Table Head Cell
export function TableHead({
  className,
  sortable,
  sorted, // 'asc' | 'desc' | null
  onSort,
  align = 'left',
  width,
  sticky = false,
  children,
  ...props
}) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const SortIcon = sorted === 'asc' ? ChevronUp : sorted === 'desc' ? ChevronDown : ChevronsUpDown;

  return (
    <th
      className={cn(
        'px-6 py-4 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap',
        alignments[align],
        sortable && 'cursor-pointer select-none hover:text-neutral-700 transition-colors',
        sticky && 'sticky right-0 bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]',
        className
      )}
      style={{ width }}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className={cn('flex items-center gap-1.5', align === 'right' && 'justify-end', align === 'center' && 'justify-center')}>
        {children}
        {sortable && (
          <SortIcon className={cn('w-3.5 h-3.5', sorted ? 'text-terra-500' : 'text-neutral-300')} />
        )}
      </div>
    </th>
  );
}

// Table Cell
export function TableCell({
  className,
  align = 'left',
  truncate,
  children,
  ...props
}) {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={cn(
        'px-6 py-4 text-sm text-neutral-700',
        alignments[align],
        truncate && 'max-w-[200px] truncate',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

// Table Action Cell - For row actions
export function TableActions({ children, className, sticky = false }) {
  return (
    <td className={cn(
      'px-2 py-4 text-center',
      sticky && 'sticky right-0 bg-white group-hover:bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]',
      className
    )}>
      <div className="flex items-center justify-center gap-1">
        {children}
      </div>
    </td>
  );
}

// Table Checkbox Cell
export function TableCheckbox({ checked, onChange, className, ...props }) {
  return (
    <td className={cn('w-12 px-6 py-4', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-neutral-300 text-terra-500 focus:ring-terra-500/20 cursor-pointer"
        {...props}
      />
    </td>
  );
}

// Empty State for Table
export function TableEmpty({ icon: Icon, title, description, action, className }) {
  return (
    <tr>
      <td colSpan={100}>
        <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
          {Icon && (
            <div className="w-14 h-14 rounded-xl bg-terra-50 flex items-center justify-center mb-4">
              <Icon className="w-7 h-7 text-terra-400" />
            </div>
          )}
          <p className="text-[14px] font-semibold text-neutral-900 mb-1">{title}</p>
          {description && <p className="text-[13px] text-neutral-500">{description}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </td>
    </tr>
  );
}

// Loading Skeleton for Table
export function TableSkeleton({ columns = 5, rows = 5 }) {
  return (
    <>
      {[...Array(rows)].map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-neutral-100">
          {[...Array(columns)].map((_, colIndex) => (
            <td key={colIndex} className="px-6 py-4">
              <div className="h-4 bg-neutral-200 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Pagination Component
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-neutral-100 bg-white', className)}>
      <p className="text-sm text-neutral-500">
        Showing <span className="font-medium text-neutral-700">{startItem}</span> to{' '}
        <span className="font-medium text-neutral-700">{endItem}</span> of{' '}
        <span className="font-medium text-neutral-700">{totalItems}</span> results
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-neutral-400">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-terra-500 text-white'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
            )}
          >
            {page}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-neutral-400">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Data Table - High-level component combining all table features
export function DataTable({
  columns, // { key, label, sortable, align, width, render }
  data,
  loading,
  emptyState,
  selectable,
  selectedRows,
  onSelectRow,
  onSelectAll,
  onSort,
  sortColumn,
  sortDirection,
  pagination,
  className,
}) {
  return (
    <div className={cn('rounded-[10px] overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <tr>
            {selectable && (
              <TableCheckbox
                checked={selectedRows?.length === data?.length && data?.length > 0}
                onChange={(e) => onSelectAll?.(e.target.checked)}
              />
            )}
            {columns.map((col) => (
              <TableHead
                key={col.key}
                sortable={col.sortable}
                sorted={sortColumn === col.key ? sortDirection : null}
                onSort={() => onSort?.(col.key)}
                align={col.align}
                width={col.width}
              >
                {col.label}
              </TableHead>
            ))}
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableSkeleton columns={columns.length + (selectable ? 1 : 0)} />
          ) : data?.length === 0 ? (
            <TableEmpty {...emptyState} />
          ) : (
            data?.map((row, index) => (
              <TableRow
                key={row.id || index}
                selected={selectedRows?.includes(row.id)}
              >
                {selectable && (
                  <TableCheckbox
                    checked={selectedRows?.includes(row.id)}
                    onChange={(e) => onSelectRow?.(row.id, e.target.checked)}
                  />
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && <Pagination {...pagination} />}
    </div>
  );
}
