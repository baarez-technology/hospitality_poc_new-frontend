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

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil((data?.length || 0) / rowsPerPage);
  }, [data, rowsPerPage]);

  // Get current page data
  const currentPageData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return data.slice(startIndex, endIndex);
  }, [data, currentPage, rowsPerPage]);

  // Navigation functions
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    scrollToTop();
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
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
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Calculate showing range
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, data?.length || 0);

  return {
    currentPageData,
    currentPage,
    totalPages,
    rowsPerPage,
    canGoPrev,
    canGoNext,
    startIndex,
    endIndex,
    totalItems: data?.length || 0,
    nextPage,
    prevPage,
    goToPage,
    setRowsPerPage: changeRowsPerPage,
  };
}
