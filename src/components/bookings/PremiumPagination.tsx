import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Premium Pagination Component
 * Elegant pagination with density-aware styling
 */
export default function PremiumPagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  rowsPerPage,
  canGoPrev,
  canGoNext,
  onPrevPage,
  onNextPage,
  onRowsPerPageChange,
  onPageChange
}) {
  const rowOptions = [10, 25, 50, 100];

  // Generate page numbers to display
  const getPageNumbers = () => {
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

    return { pages, start, end };
  };

  const { pages, start, end } = getPageNumbers();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-neutral-200 rounded-b-2xl">
      {/* Results Info & Rows Per Page */}
      <div className="flex items-center gap-6">
        <p className="text-sm text-neutral-600">
          Showing{' '}
          <span className="font-semibold text-neutral-900">{startIndex}</span>
          {' '}-{' '}
          <span className="font-semibold text-neutral-900">{endIndex}</span>
          {' '}of{' '}
          <span className="font-semibold text-neutral-900">{totalItems}</span>
          {' '}results
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Show</span>
          <select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="
              h-9 px-3 pr-8 rounded-lg
              bg-neutral-50 border border-neutral-200
              text-sm font-medium text-neutral-700
              focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-400
              appearance-none cursor-pointer
              bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')]
              bg-[length:1rem] bg-[right_0.5rem_center] bg-no-repeat
              transition-colors
            "
          >
            {rowOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-sm text-neutral-500">per page</span>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange?.(1)}
          disabled={currentPage === 1}
          className="
            p-2 rounded-lg
            text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            transition-colors
          "
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className="
            p-2 rounded-lg
            text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            transition-colors
          "
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 mx-2">
          {start > 1 && (
            <>
              <button
                onClick={() => onPageChange?.(1)}
                className="
                  w-9 h-9 rounded-lg text-sm font-medium
                  text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700
                  transition-colors
                "
              >
                1
              </button>
              {start > 2 && (
                <span className="px-1.5 text-neutral-400">...</span>
              )}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange?.(page)}
              className={`
                w-9 h-9 rounded-lg text-sm font-medium transition-all
                ${page === currentPage
                  ? 'bg-terra-500 text-white shadow-sm shadow-terra-500/25'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700'
                }
              `}
            >
              {page}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="px-1.5 text-neutral-400">...</span>
              )}
              <button
                onClick={() => onPageChange?.(totalPages)}
                className="
                  w-9 h-9 rounded-lg text-sm font-medium
                  text-neutral-600 hover:bg-neutral-100 hover:text-neutral-700
                  transition-colors
                "
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          className="
            p-2 rounded-lg
            text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            transition-colors
          "
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange?.(totalPages)}
          disabled={currentPage === totalPages}
          className="
            p-2 rounded-lg
            text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
            transition-colors
          "
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
