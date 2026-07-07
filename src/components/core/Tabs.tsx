import { createContext, useContext, useState, forwardRef } from 'react';

/**
 * Tabs Component
 * Underline style tabs like Hubspot
 */

const TabsContext = createContext(null);

const Tabs = forwardRef(({
  children,
  defaultValue,
  value: controlledValue,
  onChange,
  className = '',
  ...props
}, ref) => {

  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (newValue) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});

Tabs.displayName = 'Tabs';

const TabsList = forwardRef(({ children, className = '', ...props }, ref) => (
  <div
    ref={ref}
    role="tablist"
    className={`flex items-center gap-1 border-b border-neutral-200 ${className}`}
    {...props}
  >
    {children}
  </div>
));

TabsList.displayName = 'TabsList';

const TabsTrigger = forwardRef(({
  children,
  value,
  count,
  disabled = false,
  className = '',
  ...props
}, ref) => {

  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      ref={ref}
      role="tab"
      type="button"
      disabled={disabled}
      aria-selected={isActive}
      onClick={() => context?.onChange(value)}
      className={`
        relative px-4 py-3 text-[14px] font-medium
        transition-colors duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isActive
          ? 'text-primary-600'
          : 'text-neutral-500 hover:text-neutral-700'
        }
        ${className}
      `}
      {...props}
    >
      <span className="flex items-center gap-2">
        {children}
        {count !== undefined && (
          <span className={`
            text-[12px] px-1.5 py-0.5 rounded-md font-medium
            ${isActive ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-500'}
          `}>
            {count}
          </span>
        )}
      </span>

      {/* Active indicator */}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
      )}
    </button>
  );
});

TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = forwardRef(({
  children,
  value,
  className = '',
  ...props
}, ref) => {

  const context = useContext(TabsContext);
  const isActive = context?.value === value;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={`mt-4 animate-fadeIn ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
export default Tabs;
