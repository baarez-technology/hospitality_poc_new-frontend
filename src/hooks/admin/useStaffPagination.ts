import { useState, useMemo } from 'react';

/**
 * Pagination hook for staff data
 * Supports page navigation and rows-per-page selection
 */
export function useStaffPagination(data, initialRowsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Calculate pagination values
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, totalItems);

  // Get current page data
  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, currentPage, rowsPerPage]);

  // Navigation helpers
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const nextPage = () => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (canGoPrev) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const changeRowsPerPage = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Reset to first page when data changes
  useMemo(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [data, totalPages, currentPage]);

  return {
    currentPage,
    totalPages,
    rowsPerPage,
    totalItems,
    startIndex,
    endIndex,
    currentPageData,
    canGoPrev,
    canGoNext,
    nextPage,
    prevPage,
    goToPage,
    setRowsPerPage: changeRowsPerPage
  };
}
