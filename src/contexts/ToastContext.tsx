/**
 * Toast Context
 * Global toast notification system
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

/**
 * Toast Provider Component
 * Manages toast notifications globally
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {string} type - Type of toast ('success', 'error', 'warning', 'info')
   * @param {number} duration - Duration in milliseconds (0 = no auto-close)
   * @param {object} options - Additional options (onUndo, undoText)
   */
  const showToast = useCallback((message, type = 'success', duration = 3000, options = {}) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newToast = {
      id,
      message,
      type,
      duration,
      onUndo: options.onUndo,
      undoText: options.undoText,
      createdAt: Date.now()
    };

    setToasts(prev => [...prev, newToast]);

    return id;
  }, []);

  /**
   * Show success toast
   * @param {string} message - Success message
   * @param {object} options - Additional options (onUndo, undoText)
   */
  const success = useCallback((message, options = {}) => {
    return showToast(message, 'success', options.duration || 5000, options);
  }, [showToast]);

  /**
   * Show error toast
   * @param {string} message - Error message
   * @param {object} options - Additional options
   */
  const error = useCallback((message, options = {}) => {
    return showToast(message, 'error', options.duration || 5000, options);
  }, [showToast]);

  /**
   * Show warning toast
   * @param {string} message - Warning message
   * @param {object} options - Additional options (onUndo, undoText)
   */
  const warning = useCallback((message, options = {}) => {
    return showToast(message, 'warning', options.duration || 5000, options);
  }, [showToast]);

  /**
   * Show info toast
   * @param {string} message - Info message
   * @param {object} options - Additional options
   */
  const info = useCallback((message, options = {}) => {
    return showToast(message, 'info', options.duration || 3000, options);
  }, [showToast]);

  /**
   * Close a specific toast
   * @param {string} id - Toast ID to close
   */
  const closeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Close all toasts
   */
  const closeAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    closeToast,
    closeAll
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container - z-index higher than modals (z-[9999]) */}
      <div
        className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              duration={toast.duration}
              onClose={closeToast}
              onUndo={toast.onUndo}
              undoText={toast.undoText}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * Access toast functions from any component
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

export default ToastContext;
