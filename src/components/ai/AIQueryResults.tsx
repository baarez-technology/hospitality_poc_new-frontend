import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Download, Table2, LayoutGrid } from 'lucide-react';

interface AIQueryResultsProps {
  results: Array<Record<string, unknown>>;
  metadata?: {
    total_count?: number;
    truncated?: boolean;
    query?: string;
  };
  maxRows?: number;
}

/**
 * AIQueryResults Component
 * Displays query results in a formatted table with sorting, pagination, and export
 */
export default function AIQueryResults({
  results,
  metadata,
  maxRows = 10
}: AIQueryResultsProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [isExpanded, setIsExpanded] = useState(true);

  // Get columns from first result
  const columns = useMemo(() => {
    if (!results || results.length === 0) return [];
    return Object.keys(results[0]);
  }, [results]);

  // Sort and paginate results
  const processedResults = useMemo(() => {
    let sorted = [...results];

    if (sortColumn) {
      sorted.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        return sortDirection === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    const startIndex = (currentPage - 1) * maxRows;
    return sorted.slice(startIndex, startIndex + maxRows);
  }, [results, sortColumn, sortDirection, currentPage, maxRows]);

  const totalPages = Math.ceil(results.length / maxRows);

  // Handle column sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Format cell value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') {
      if (Number.isInteger(value)) return value.toLocaleString();
      return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    if (value instanceof Date) return value.toLocaleDateString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!results || results.length === 0) return;

    const headers = columns.join(',');
    const rows = results.map(row =>
      columns.map(col => {
        const val = row[col];
        const str = formatValue(val);
        // Escape quotes and wrap in quotes if contains comma
        if (str.includes(',') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query_results_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 border-b border-neutral-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <span>
            {metadata?.total_count || results.length} Results
            {metadata?.truncated && ' (truncated)'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-white rounded-md border border-neutral-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-l-md ${
                viewMode === 'table'
                  ? 'bg-[#A57865] text-white'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              title="Table view"
            >
              <Table2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-r-md ${
                viewMode === 'cards'
                  ? 'bg-[#A57865] text-white'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Export button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-neutral-600 bg-white border border-neutral-200 rounded-md hover:bg-neutral-50 hover:text-neutral-800"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <>
          {viewMode === 'table' ? (
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 sticky top-0">
                  <tr>
                    {columns.map(column => (
                      <th
                        key={column}
                        onClick={() => handleSort(column)}
                        className="px-3 py-2 text-left font-medium text-neutral-600 cursor-pointer hover:bg-neutral-100 select-none"
                      >
                        <div className="flex items-center gap-1">
                          <span className="capitalize">
                            {column.replace(/_/g, ' ')}
                          </span>
                          {sortColumn === column && (
                            sortDirection === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {processedResults.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="hover:bg-neutral-50"
                    >
                      {columns.map(column => (
                        <td
                          key={column}
                          className="px-3 py-2 text-neutral-700 whitespace-nowrap"
                        >
                          {formatValue(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 grid gap-2 max-h-80 overflow-y-auto">
              {processedResults.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="p-3 bg-neutral-50 rounded-lg border border-neutral-200"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {columns.slice(0, 6).map(column => (
                      <div key={column}>
                        <span className="text-neutral-500 capitalize text-xs">
                          {column.replace(/_/g, ' ')}:
                        </span>
                        <span className="ml-1 text-neutral-800 font-medium">
                          {formatValue(row[column])}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-neutral-50 border-t border-neutral-200">
              <span className="text-xs text-neutral-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs font-medium rounded border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs font-medium rounded border border-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
