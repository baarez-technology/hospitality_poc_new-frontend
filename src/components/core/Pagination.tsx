import { forwardRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination Component
 * Clean page navigation
 */
const Pagination = forwardRef(({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showFirstLast = true,
  showPageNumbers = true,
  maxVisiblePages = 5,
  className = '',
  ...props
}, ref) => {

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange?.(page);
  };

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <nav
      ref={ref}
      className={`flex items-center gap-1 ${className}`}
      aria-label="Pagination"
      {...props}
    >
      {/* First Page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}

      {/* Previous Page */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <div className="flex items-center gap-1 px-1">
          {visiblePages[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="min-w-[36px] h-9 px-3 rounded-lg text-[14px] font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="text-neutral-400 px-1">...</span>
              )}
            </>
          )}

          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`
                min-w-[36px] h-9 px-3 rounded-lg text-[13px] font-medium transition-colors
                ${page === currentPage
                  ? 'bg-terra-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
                }
              `}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="text-neutral-400 px-1">...</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="min-w-[36px] h-9 px-3 rounded-lg text-[14px] font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      )}

      {/* Next Page */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page */}
      {showFirstLast && (
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
});

Pagination.displayName = 'Pagination';

/**
 * PaginationInfo
 * Shows current range and total count
 */
const PaginationInfo = forwardRef(({
  currentPage = 1,
  pageSize = 10,
  totalItems = 0,
  className = '',
  ...props
}, ref) => {

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <p
      ref={ref}
      className={`text-[13px] text-neutral-500 ${className}`}
      {...props}
    >
      Showing <span className="font-medium text-neutral-700">{startItem}</span> to{' '}
      <span className="font-medium text-neutral-700">{endItem}</span> of{' '}
      <span className="font-medium text-neutral-700">{totalItems}</span> results
    </p>
  );
});

PaginationInfo.displayName = 'PaginationInfo';

export { Pagination, PaginationInfo };
export default Pagination;
