import { useState, useMemo, useEffect } from 'react';

/**
 * Custom hook for pagination
 * @param {Array} data - Data to paginate
 * @param {number} defaultRowsPerPage - Default rows per page
 * @returns {Object} Pagination data and controls
 */
export function usePagination(data, defaultRowsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const totalItems = data?.length || 0;

  // Total pages for the *current* dataset (filtered/searched). Never below 1 so
  // an empty result set still reports a valid single page.
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / rowsPerPage));
  }, [totalItems, rowsPerPage]);

  // Reset to the first page whenever the underlying dataset changes (e.g. a
  // status filter or search is applied) so results are re-paginated from page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Clamp the active page to the (possibly shrunken) dataset. After a filter
  // narrows the results, `currentPage` may still point past the new last page
  // for the render before the reset effect runs — without this guard the slice
  // would fall out of range and show an empty page, making filtered records
  // look stranded on their original page numbers. Deriving every output from
  // `safePage` keeps the slice, the range labels and the active page indicator
  // consistent with the filtered data.
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  // Get current page data
  const currentPageData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const startIndex = (safePage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return data.slice(startIndex, endIndex);
  }, [data, safePage, rowsPerPage]);

  // Navigation functions
  const nextPage = () => {
    setCurrentPage(Math.min(safePage + 1, totalPages));
    scrollToTop();
  };

  const prevPage = () => {
    setCurrentPage(Math.max(safePage - 1, 1));
    scrollToTop();
  };

  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
    scrollToTop();
  };

  const changeRowsPerPage = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page
    scrollToTop();
  };

  // Helper to scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if buttons should be disabled
  const canGoPrev = safePage > 1;
  const canGoNext = safePage < totalPages;

  // Calculate showing range
  const startIndex = totalItems === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(safePage * rowsPerPage, totalItems);

  return {
    currentPageData,
    currentPage: safePage,
    totalPages,
    rowsPerPage,
    canGoPrev,
    canGoNext,
    startIndex,
    endIndex,
    totalItems,
    nextPage,
    prevPage,
    goToPage,
    setRowsPerPage: changeRowsPerPage,
  };
}
