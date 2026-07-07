import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

/**
 * Glimmora Design System v4.0 - Tooltip
 * Informational tooltips and popovers
 */

export function Tooltip({
  children,
  content,
  side = 'top', // top, bottom, left, right
  align = 'center', // start, center, end
  delay = 200,
  className,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  // Calculate position when visible
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const gap = 8;

      let top = 0;
      let left = 0;

      // Side positioning
      switch (side) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - gap;
          break;
        case 'bottom':
          top = triggerRect.bottom + gap;
          break;
        case 'left':
          left = triggerRect.left - tooltipRect.width - gap;
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
        case 'right':
          left = triggerRect.right + gap;
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
      }

      // Alignment for top/bottom
      if (side === 'top' || side === 'bottom') {
        switch (align) {
          case 'start':
            left = triggerRect.left;
            break;
          case 'center':
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case 'end':
            left = triggerRect.right - tooltipRect.width;
            break;
        }
      }

      // Viewport constraints
      const padding = 8;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) {
        top = triggerRect.bottom + gap; // Flip to bottom
      }
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = triggerRect.top - tooltipRect.height - gap; // Flip to top
      }

      setPosition({ top, left });
    }
  }, [isVisible, side, align]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) return children;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex"
      >
        {children}
      </span>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          role="tooltip"
          style={{ position: 'fixed', top: position.top, left: position.left }}
          className={cn(
            'z-50 px-3 py-2 rounded-lg',
            'bg-neutral-900 text-white text-xs font-medium',
            'animate-fadeIn',
            'max-w-xs',
            className
          )}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}

// Info Tooltip - With icon trigger
export function InfoTooltip({ content, className }) {
  return (
    <Tooltip content={content} className={className}>
      <button
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-neutral-200 text-neutral-500 hover:bg-neutral-300 hover:text-neutral-700 transition-colors"
      >
        <span className="text-[10px] font-bold">?</span>
      </button>
    </Tooltip>
  );
}

// Popover - More complex tooltip with custom content
export function Popover({
  children,
  content,
  trigger = 'click', // click, hover
  side = 'bottom',
  align = 'start',
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  // Calculate position
  useEffect(() => {
    if (isOpen && triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const gap = 8;

      let top = side === 'bottom' ? triggerRect.bottom + gap : triggerRect.top - popoverRect.height - gap;
      let left = align === 'start' ? triggerRect.left : triggerRect.right - popoverRect.width;

      // Viewport constraints
      const padding = 8;
      if (left < padding) left = padding;
      if (left + popoverRect.width > window.innerWidth - padding) {
        left = window.innerWidth - popoverRect.width - padding;
      }
      if (top + popoverRect.height > window.innerHeight - padding) {
        top = triggerRect.top - popoverRect.height - gap;
      }

      setPosition({ top, left });
    }
  }, [isOpen, side, align]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !popoverRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleTrigger = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsOpen(false);
    }
  };

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleTrigger}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex cursor-pointer"
      >
        {children}
      </span>

      {isOpen && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: position.top, left: position.left }}
          className={cn(
            'z-50 rounded-xl bg-white border border-neutral-200',
            'animate-scaleIn origin-top-left',
            className
          )}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
