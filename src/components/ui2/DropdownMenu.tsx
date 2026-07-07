import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { Check, ChevronRight } from 'lucide-react';

/**
 * Glimmora Design System - Premium Dropdown Menu
 * Luxury action menus with refined aesthetics
 */

export function DropdownMenu({ children, trigger, align = 'start', side = 'bottom', className, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  // Calculate position based on trigger element
  const calculatePosition = React.useCallback((triggerRect, menuWidth = 180, menuHeight = 200) => {
    const padding = 8;
    let left = align === 'start' ? triggerRect.left : triggerRect.right - menuWidth;

    // Viewport constraints for horizontal
    if (left + menuWidth > window.innerWidth) {
      left = window.innerWidth - menuWidth - padding;
    }
    if (left < padding) left = padding;

    // Check if menu would overflow bottom of viewport
    const spaceBelow = window.innerHeight - triggerRect.bottom - padding;
    const spaceAbove = triggerRect.top - padding;

    let top;
    let flipToTop = false;

    if (side === 'bottom' && spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      // Not enough space below, flip to top
      top = triggerRect.top - menuHeight - padding;
      flipToTop = true;
    } else if (side === 'top' && spaceAbove < menuHeight && spaceBelow > spaceAbove) {
      // Not enough space above, flip to bottom
      top = triggerRect.bottom + padding;
    } else {
      // Default positioning
      top = side === 'bottom' ? triggerRect.bottom + padding : triggerRect.top - menuHeight - padding;
    }

    // Ensure menu doesn't go off-screen vertically
    if (top < padding) top = padding;
    if (top + menuHeight > window.innerHeight - padding) {
      top = window.innerHeight - menuHeight - padding;
    }

    return { top, left, flipToTop };
  }, [align, side]);

  // Handle trigger click - calculate position immediately
  const handleTriggerClick = () => {
    if (disabled) return; // Don't open if disabled
    if (open) {
      setOpen(false);
      setPosition(null);
    } else {
      if (triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const pos = calculatePosition(triggerRect);
        setPosition(pos);
        setOpen(true);
      }
    }
  };

  // Update position on scroll/resize
  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (triggerRef.current && menuRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const pos = calculatePosition(triggerRect, menuRect.width, menuRect.height);
        setPosition(pos);
      }
    };

    // Initial position update after menu renders
    requestAnimationFrame(updatePosition);

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, calculatePosition]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  return (
    <>
      <div ref={triggerRef} onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>

      {open && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            zIndex: 9999
          }}
          className={cn(
            'min-w-[180px]',
            'bg-white rounded-[10px]',
            'border border-neutral-200',
            'shadow-lg shadow-neutral-900/8',
            'overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-100',
            className
          )}
        >
          <div className="py-1">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { onClose: () => { setOpen(false); setPosition(null); } });
              }
              return child;
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// Menu Item
export function DropdownMenuItem({
  children,
  icon: Icon,
  shortcut,
  disabled,
  destructive,
  onSelect,
  onClose,
  className,
}) {
  const handleClick = () => {
    if (disabled) return;
    onSelect?.();
    onClose?.();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative w-full flex items-center gap-2.5 px-3 py-2',
        'text-[13px] font-medium',
        'transition-colors duration-100',
        'focus:outline-none',
        disabled
          ? 'text-neutral-400 cursor-not-allowed opacity-50'
          : destructive
            ? 'text-rose-600 hover:bg-rose-50'
            : 'text-neutral-700 hover:bg-neutral-50',
        className
      )}
    >
      {Icon && (
        <div className={cn(
          "flex items-center justify-center flex-shrink-0",
          disabled
            ? "text-neutral-300"
            : destructive
              ? "text-rose-500"
              : "text-neutral-400"
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      )}
      <span className="flex-1 text-left">{children}</span>
      {shortcut && (
        <span className="text-[10px] text-neutral-400 font-mono font-normal">
          {shortcut}
        </span>
      )}
    </button>
  );
}

// Menu Separator
export function DropdownMenuSeparator({ className }) {
  return (
    <div className={cn(
      'h-px bg-neutral-100 my-1',
      className
    )} />
  );
}

// Menu Label
export function DropdownMenuLabel({ children, className }) {
  return (
    <div className={cn(
      'px-4 py-2 text-xs font-semibold',
      'text-neutral-500 uppercase tracking-[0.15em]',
      'mb-0.5',
      className
    )}>
      {children}
    </div>
  );
}

// Checkbox Menu Item
export function DropdownMenuCheckbox({
  children,
  checked,
  onCheckedChange,
  disabled,
  onClose,
  className,
}) {
  const handleClick = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'relative w-full flex items-center gap-3 px-4 py-2.5',
        'text-sm font-medium',
        'transition-all duration-150 ease-out',
        'focus:outline-none',
        disabled
          ? 'text-neutral-400 cursor-not-allowed opacity-50'
          : 'text-neutral-700 hover:bg-neutral-50/80 hover:text-neutral-900',
        className
      )}
    >
      <div className={cn(
        'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
        'transition-all duration-150',
        checked 
          ? 'bg-terra-500 border-terra-500 shadow-sm' 
          : 'border-neutral-300 bg-white'
      )}>
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}

// Simple Action Menu - Convenience wrapper
export function ActionMenu({ items, trigger, align = 'end', className }) {
  return (
    <DropdownMenu trigger={trigger} align={align} className={className}>
      {items.map((item, index) => {
        if (item.type === 'separator') {
          return <DropdownMenuSeparator key={index} />;
        }
        if (item.type === 'label') {
          return <DropdownMenuLabel key={index}>{item.label}</DropdownMenuLabel>;
        }
        return (
          <DropdownMenuItem
            key={index}
            icon={item.icon}
            shortcut={item.shortcut}
            disabled={item.disabled}
            destructive={item.destructive}
            onSelect={item.onSelect}
          >
            {item.label}
          </DropdownMenuItem>
        );
      })}
    </DropdownMenu>
  );
}
