import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * Glimmora Design System v4.0 - Tabs
 * Tab navigation with multiple styles
 */

const TabsContext = createContext(null);

// Main Tabs Container
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;

  const handleChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, onChange: handleChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// Tab List - Container for tabs
export function TabsList({
  children,
  className,
  variant = 'default', // default, pills, underline, segment
  size = 'md',
  fullWidth = false,
}) {
  const variants = {
    default: 'bg-neutral-100 rounded-lg p-1 gap-1',
    pills: 'gap-2',
    underline: 'border-b border-neutral-200 gap-6',
    segment: 'bg-neutral-100 rounded-xl p-1 gap-0',
  };

  const sizes = {
    sm: 'h-8',
    md: 'h-9',
    lg: 'h-10',
  };

  return (
    <div
      className={cn(
        'flex items-center',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      role="tablist"
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { variant, size, fullWidth });
        }
        return child;
      })}
    </div>
  );
}

// Individual Tab
export function Tab({
  value,
  children,
  icon: Icon,
  count,
  disabled,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
}) {
  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  const baseStyles = 'flex items-center justify-center gap-2 font-medium transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-terra-500/40 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    default: cn(
      'rounded-md px-3',
      isActive
        ? 'bg-white text-neutral-900 border border-neutral-200'
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
    ),
    pills: cn(
      'rounded-lg px-4 border',
      isActive
        ? 'bg-terra-500 text-white border-terra-500'
        : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
    ),
    underline: cn(
      'px-1 pb-3 border-b-2 -mb-px',
      isActive
        ? 'text-terra-600 border-terra-500'
        : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:border-neutral-300'
    ),
    segment: cn(
      'px-4 rounded-lg',
      isActive
        ? 'bg-white text-neutral-900'
        : 'text-neutral-600 hover:text-neutral-900'
    ),
  };

  const sizeStyles = {
    sm: 'text-xs h-7',
    md: 'text-sm h-8',
    lg: 'text-sm h-9',
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => context?.onChange(value)}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'flex-1',
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
      {count !== undefined && (
        <span className={cn(
          'px-1.5 py-0.5 rounded text-[10px] font-semibold',
          isActive ? 'bg-terra-100 text-terra-700' : 'bg-neutral-200 text-neutral-600'
        )}>
          {count}
        </span>
      )}
    </button>
  );
}

// Tab Content Panel
export function TabsContent({ value, children, className }) {
  const context = useContext(TabsContext);

  if (context?.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('animate-fadeIn', className)}
    >
      {children}
    </div>
  );
}

// Simple Tab Group - Convenience component
export function TabGroup({
  tabs, // { value, label, icon, count, content }
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  size = 'md',
  className,
}) {
  return (
    <Tabs defaultValue={defaultValue || tabs[0]?.value} value={value} onValueChange={onValueChange} className={className}>
      <TabsList variant={variant} size={size}>
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            count={tab.count}
            disabled={tab.disabled}
          >
            {tab.label}
          </Tab>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Filter Tabs - For quick filtering
export function FilterTabs({
  options, // { value, label, count }
  value,
  onChange,
  className,
}) {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
            'border focus:outline-none focus-visible:ring-2 focus-visible:ring-terra-500/40',
            value === option.value
              ? 'bg-terra-500 text-white border-terra-500'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span className={cn(
              'px-1.5 py-0.5 rounded text-[10px] font-bold',
              value === option.value ? 'bg-white/20' : 'bg-neutral-100'
            )}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
