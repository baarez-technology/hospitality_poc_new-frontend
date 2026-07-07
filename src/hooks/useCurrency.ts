/**
 * useCurrency Hook
 * Provides currency formatting based on global settings
 */

import { useCallback } from 'react';
import { useSettingsContext } from '../contexts/SettingsContext';
import { formatCurrency as formatCurrencyUtil, formatCurrencySimple, getCurrencySymbol } from '../utils/formatters';

/**
 * Hook to access currency settings and formatting
 * @returns {object} Currency utilities
 */
export function useCurrency() {
  const { generalSettings } = useSettingsContext();
  const currency = generalSettings?.currency || 'INR';

  /**
   * Format a value with the current currency
   * @param {number} value - The numeric value to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = useCallback((value: number): string => {
    return formatCurrencyUtil(value, currency);
  }, [currency]);

  /**
   * Format a value with just the symbol (simpler format)
   * @param {number} value - The numeric value to format
   * @returns {string} Formatted currency string
   */
  const formatSimple = useCallback((value: number): string => {
    return formatCurrencySimple(value, currency);
  }, [currency]);

  /**
   * Get the current currency symbol
   * @returns {string} Currency symbol
   */
  const symbol = getCurrencySymbol(currency);

  return {
    currency,
    symbol,
    formatCurrency,
    formatSimple
  };
}

export default useCurrency;
