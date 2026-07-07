import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ComponentType<any>;
  error?: boolean;
  disabled?: boolean;
  searchable?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  icon,
  error = false,
  disabled = false,
  searchable = true,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label || '',
    [options, value]
  );

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter((o) => o.label?.toLowerCase().includes(q));
  }, [options, search]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  const Icon = icon;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full h-9 flex items-center gap-2 border rounded-[var(--brand-radius-md)] transition-all text-sm bg-white text-left ${
          Icon ? 'pl-10 pr-3' : 'pl-4 pr-3'
        } ${
          error
            ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : isOpen
              ? 'border-terra-500 ring-2 ring-terra-500/20'
              : 'border-neutral-200 hover:border-neutral-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-50' : 'cursor-pointer'}`}
      >
        {/* Left icon */}
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <Icon className="w-4 h-4" />
          </span>
        )}

        {/* Value / Placeholder */}
        <span className={`flex-1 truncate ${value ? 'text-neutral-900' : 'text-neutral-400'}`}>
          {selectedLabel || placeholder}
        </span>

        {/* Clear button — only show when searchable and value exists */}
        {searchable && value && !disabled && (
          <span
            onClick={handleClear}
            className="p-0.5 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}

        {/* Chevron */}
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search */}
          {searchable && options.length > 6 && (
            <div className="p-2 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-2 text-[12px] border border-neutral-200 rounded-lg focus:outline-none focus:border-terra-400 focus:ring-1 focus:ring-terra-400/20 bg-neutral-50"
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div ref={listRef} className="max-h-48 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-[12px] text-neutral-400 text-center">
                No results found
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                    option.value === value
                      ? 'bg-terra-50 text-terra-700 font-medium'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
