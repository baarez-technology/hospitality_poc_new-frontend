import { forwardRef } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

/**
 * Table Components
 * Clean, professional data table
 */

const Table = forwardRef(({ children, className = '', ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table
      ref={ref}
      className={`w-full border-collapse ${className}`}
      {...props}
    >
      {children}
    </table>
  </div>
));

Table.displayName = 'Table';

const TableHeader = forwardRef(({ children, className = '', ...props }, ref) => (
  <thead ref={ref} className={className} {...props}>
    {children}
  </thead>
));

TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef(({ children, className = '', ...props }, ref) => (
  <tbody ref={ref} className={className} {...props}>
    {children}
  </tbody>
));

TableBody.displayName = 'TableBody';

const TableRow = forwardRef(({
  children,
  hover = true,
  selected = false,
  className = '',
  ...props
}, ref) => (
  <tr
    ref={ref}
    className={`
      border-b border-neutral-100 last:border-0
      transition-colors duration-100
      ${hover ? 'hover:bg-neutral-50' : ''}
      ${selected ? 'bg-primary-50' : ''}
      ${className}
    `}
    {...props}
  >
    {children}
  </tr>
));

TableRow.displayName = 'TableRow';

const TableHead = forwardRef(({
  children,
  sortable = false,
  sortDirection,
  onSort,
  align = 'left',
  className = '',
  ...props
}, ref) => {

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const SortIcon = sortDirection === 'asc' ? ArrowUp : sortDirection === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <th
      ref={ref}
      className={`
        bg-neutral-50 px-4 py-3
        text-[11px] font-semibold text-neutral-500 uppercase tracking-wider
        ${alignClass[align]}
        ${sortable ? 'cursor-pointer select-none hover:bg-neutral-100 transition-colors' : ''}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <span className="inline-flex items-center gap-1.5">
        {children}
        {sortable && <SortIcon className="w-3 h-3" />}
      </span>
    </th>
  );
});

TableHead.displayName = 'TableHead';

const TableCell = forwardRef(({
  children,
  align = 'left',
  className = '',
  ...props
}, ref) => {

  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      ref={ref}
      className={`
        px-4 py-3.5 text-[14px] text-neutral-700
        ${alignClass[align]}
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  );
});

TableCell.displayName = 'TableCell';

const TableFooter = forwardRef(({ children, className = '', ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`border-t border-neutral-200 ${className}`}
    {...props}
  >
    {children}
  </tfoot>
));

TableFooter.displayName = 'TableFooter';

// Empty State
const TableEmpty = forwardRef(({
  icon: Icon,
  title = 'No data',
  description,
  action,
  className = '',
  ...props
}, ref) => (
  <tr ref={ref} {...props}>
    <td colSpan="100%" className={`py-16 text-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-neutral-400" />
          </div>
        )}
        <div>
          <p className="text-[14px] font-medium text-neutral-700">{title}</p>
          {description && (
            <p className="text-[13px] text-neutral-500 mt-1">{description}</p>
          )}
        </div>
        {action}
      </div>
    </td>
  </tr>
));

TableEmpty.displayName = 'TableEmpty';

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableEmpty,
};

export default Table;
