import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StaffPagination({
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
}) {
  const rowsPerPageOptions = [10, 20, 50];

  return (
    <div className="bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-between">
      {/* Left: Rows per page */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="px-3 py-1.5 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 transition-all duration-200 cursor-pointer"
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Center: Page info */}
      <div className="flex items-center gap-6">
        <span className="text-sm text-neutral-600">
          Showing{' '}
          <span className="font-semibold text-neutral-900">
            {startIndex}-{endIndex}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-neutral-900">{totalItems}</span>
        </span>

        <span className="text-sm text-neutral-600">
          Page{' '}
          <span className="font-semibold text-neutral-900">{currentPage}</span>{' '}
          of{' '}
          <span className="font-semibold text-neutral-900">{totalPages}</span>
        </span>
      </div>

      {/* Right: Navigation buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevPage}
          disabled={!canGoPrev}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            canGoPrev
              ? 'bg-[#FAF8F6] hover:bg-neutral-100 hover:shadow-sm text-neutral-700 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 active:scale-95'
              : 'bg-[#FAF8F6] text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            canGoNext
              ? 'bg-[#FAF8F6] hover:bg-neutral-100 hover:shadow-sm text-neutral-700 hover:text-neutral-900 border border-neutral-200 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 active:scale-95'
              : 'bg-[#FAF8F6] text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-50'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
