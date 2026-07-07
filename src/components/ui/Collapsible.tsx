import { useState } from 'react';

/**
 * Simple Collapsible Component
 * Replaces @radix-ui/react-collapsible with a lightweight custom implementation
 */
export function Collapsible({ children, defaultOpen = false, className = '' }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className} data-state={isOpen ? 'open' : 'closed'}>
      {typeof children === 'function' ? children({ isOpen, setIsOpen }) : children}
    </div>
  );
}

export function CollapsibleTrigger({ children, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      aria-expanded="false"
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({ children, isOpen, className = '' }) {
  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} ${className}`}
      style={{ display: isOpen ? 'block' : 'none' }}
    >
      {children}
    </div>
  );
}
