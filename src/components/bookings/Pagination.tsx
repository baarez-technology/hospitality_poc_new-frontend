import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  canGoPrev,
  canGoNext,
  onPrevPage,
  onNextPage,
  onGoToPage,
}) {
  const pages: number[] = [];
  // Show fewer pages on mobile
  const maxVisible = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
      {/* Left: results info (CMS style) */}
      <p className="text-[11px] sm:text-[13px] text-neutral-500 order-2 sm:order-1">
        Showing <span className="font-semibold text-neutral-700">{startIndex}</span> to{' '}
        <span className="font-semibold text-neutral-700">{endIndex}</span> of{' '}
        <span className="font-semibold text-neutral-700">{totalItems}</span> results
      </p>

      {/* Right: pagination controls (CMS style) */}
      <div className="flex items-center gap-0.5 sm:gap-1 order-1 sm:order-2">
        <button
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-colors ${
            canGoPrev
              ? 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
              : 'text-neutral-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-0.5 mx-0.5 sm:mx-1">
          {start > 1 && (
            <>
              <button
                onClick={() => onGoToPage?.(1)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                1
              </button>
              {start > 2 && <span className="px-0.5 sm:px-1 text-neutral-400 text-xs sm:text-sm">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onGoToPage?.(page)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-[13px] font-semibold transition-colors ${
                currentPage === page
                  ? 'bg-terra-500 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {page}
            </button>
          ))}

          {end < totalPages && (
            <>
              {end < totalPages - 1 && <span className="px-0.5 sm:px-1 text-neutral-400 text-xs sm:text-sm">...</span>}
              <button
                onClick={() => onGoToPage?.(totalPages)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-[13px] font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-colors ${
            canGoNext
              ? 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
              : 'text-neutral-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
