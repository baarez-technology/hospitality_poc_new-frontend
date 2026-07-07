import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
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
    <div className="flex items-center justify-between pt-4">
      {/* Left: Rows per page */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600 font-medium">Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="appearance-none h-9 px-3 pr-8 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:border-[#A57865]/30 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23525252%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px_16px] bg-[right_0.5rem_center] bg-no-repeat"
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

        <div className="h-4 w-px bg-neutral-200" />

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
          className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            canGoPrev
              ? 'bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 border border-neutral-200 hover:border-[#A57865]/30 focus:outline-none focus:ring-2 focus:ring-[#A57865] active:scale-95'
              : 'bg-white text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-50'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          onClick={onNextPage}
          disabled={!canGoNext}
          className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            canGoNext
              ? 'bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 border border-neutral-200 hover:border-[#A57865]/30 focus:outline-none focus:ring-2 focus:ring-[#A57865] active:scale-95'
              : 'bg-white text-neutral-400 border border-neutral-200 cursor-not-allowed opacity-50'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
