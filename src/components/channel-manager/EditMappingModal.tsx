/**
 * EditMappingModal Component
 * Drawer for editing room mappings between PMS and OTA room types - Glimmora Design System v5.0
 * Uses proper combobox dropdown for OTA room type selection
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link2, Sparkles, Users, ChevronDown, Check, X } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';

/** Combobox dropdown for OTA room type — matches Glimmora SelectDropdown style */
function OtaRoomTypeCombobox({
  value,
  onChange,
  suggestions,
  placeholder = 'Select or type OTA room type',
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return suggestions;
    const q = search.toLowerCase();
    return suggestions.filter(s => s.toLowerCase().includes(q));
  }, [suggestions, search]);

  const calculatePosition = (triggerRect: DOMRect) => {
    const menuHeight = 260;
    const padding = 4;
    const spaceBelow = window.innerHeight - triggerRect.bottom - padding;
    const spaceAbove = triggerRect.top - padding;

    let top;
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      top = triggerRect.top - Math.min(menuHeight, spaceAbove) - padding;
    } else {
      top = triggerRect.bottom + padding;
    }

    return { top, left: triggerRect.left, width: triggerRect.width };
  };

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      setPosition(null);
      setSearch('');
    } else if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition(calculatePosition(rect));
      setOpen(true);
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setPosition(null);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setPosition(null);
        setSearch('');
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setPosition(null);
        setSearch('');
      }
    };

    const handleScroll = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition(calculatePosition(rect));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`w-full h-9 px-3.5 rounded-[8px] text-[13px] bg-white border flex items-center justify-between gap-2 transition-all duration-150 focus:outline-none ${
          open
            ? 'border-terra-500 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={`truncate ${value ? 'text-neutral-900' : 'text-neutral-400'}`}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded hover:bg-neutral-100 transition-colors"
            >
              <X className="w-3 h-3 text-neutral-400" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999,
          }}
          className="bg-white rounded-[8px] border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden"
        >
          {/* Search input */}
          <div className="p-2 border-b border-neutral-100">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search.trim()) {
                  handleSelect(search.trim());
                }
              }}
              placeholder="Search or type custom..."
              className="w-full h-8 px-3 rounded-[6px] text-[13px] bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-terra-400 focus:ring-1 focus:ring-terra-500/10 transition-all"
            />
          </div>

          {/* Suggestions header */}
          <div className="px-3 py-1.5 border-b border-neutral-100">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Suggestions
            </p>
          </div>

          {/* Options */}
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-left transition-colors duration-100 hover:bg-neutral-50 ${
                    value === suggestion ? 'bg-neutral-50 text-neutral-900' : 'text-neutral-700'
                  }`}
                >
                  <span className="flex-1 truncate">{suggestion}</span>
                  {value === suggestion && (
                    <Check className="w-4 h-4 text-terra-500 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-center">
                <p className="text-[12px] text-neutral-400">No matches found</p>
                {search.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelect(search.trim())}
                    className="mt-2 text-[12px] text-terra-600 font-medium hover:underline"
                  >
                    Use "{search.trim()}" as custom value
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Custom value hint */}
          {search.trim() && filtered.length > 0 && (
            <div className="px-3 py-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => handleSelect(search.trim())}
                className="text-[11px] text-terra-600 font-medium hover:underline"
              >
                Use "{search.trim()}" as custom value
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export default function EditMappingModal({
  isOpen,
  onClose,
  onSave,
  room,
  ota,
  existingMapping,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [otaRoomType, setOtaRoomType] = useState('');
  const [syncRates, setSyncRates] = useState(true);
  const [syncAvailability, setSyncAvailability] = useState(true);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen && room) {
      setOtaRoomType(existingMapping?.otaRoomType || '');
      setSyncRates(existingMapping?.syncRates !== false);
      setSyncAvailability(existingMapping?.syncAvailability !== false);
      setIsLoading(false);
    }
  }, [isOpen, room, existingMapping]);

  if (!isOpen || !room) return null;

  // Suggested OTA room type names based on PMS room type
  const suggestions = [
    room.name,
    `${room.name} - ${ota?.name || 'OTA'}`,
    room.name.toLowerCase().includes('standard') ? 'Standard Double Room' : null,
    room.name.toLowerCase().includes('premium') ? 'Superior Room' : null,
    room.name.toLowerCase().includes('deluxe') ? 'Deluxe King Room' : null,
    room.name.toLowerCase().includes('suite') ? 'Executive Suite' : null
  ].filter(Boolean);

  const handleSave = async () => {
    if (!otaRoomType.trim()) {
      return; // Don't proceed if OTA room type is empty
    }

    setIsLoading(true);
    try {
      await onSave({
        pmsRoomTypeId: room.roomTypeId ?? room.id,
        pmsRoomType: room.name,
        pmsRoomName: room.name,
        otaRoomType: otaRoomType.trim(),
        syncRates,
        syncAvailability
      });
      // Only close if save was successful (no error thrown)
      onClose();
    } catch (err) {
      // Error handling is done in context/toast
      // Don't close modal on error so user can fix and retry
      console.error('Failed to save mapping:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!existingMapping;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Room Mapping' : 'Create Room Mapping'}
      subtitle={ota?.name || 'OTA'}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" onClick={onClose} className="px-5 py-2 text-[13px] font-semibold">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!otaRoomType.trim() || isLoading}
            loading={isLoading}
            className="px-5 py-2 text-[13px] font-semibold"
          >
            {isEditing ? 'Update Mapping' : 'Create Mapping'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* PMS Room Info */}
        <div className="p-5 rounded-[8px] bg-neutral-50 border border-neutral-100">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
            PMS Room Type
          </p>
          <p className="font-semibold text-[15px] text-neutral-900">
            {room.name}
          </p>
          <p className="text-[13px] flex items-center gap-1.5 mt-1 text-neutral-500">
            <Users className="w-4 h-4" />
            {room.baseOccupancy}-{room.maxOccupancy} guests
          </p>
        </div>

        {/* OTA Room Type Dropdown */}
        <div className="space-y-2">
          <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            OTA Room Type Name
          </label>
          <OtaRoomTypeCombobox
            value={otaRoomType}
            onChange={setOtaRoomType}
            suggestions={suggestions}
            placeholder="Select or type OTA room type"
          />
        </div>

        {/* Sync Options */}
        <div className="p-5 rounded-[8px] space-y-4 bg-neutral-50 border border-neutral-100">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Sync Settings
          </p>

          {/* Rate Sync Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[13px] font-medium text-neutral-700">
              Sync Rates
            </span>
            <button
              type="button"
              onClick={() => setSyncRates(!syncRates)}
              className={`relative w-11 h-6 rounded-full transition-colors ${syncRates ? 'bg-terra-500' : 'bg-neutral-300'
                }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${syncRates ? 'translate-x-5' : 'translate-x-0'
                }`} />
            </button>
          </label>

          {/* Availability Sync Toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-[13px] font-medium text-neutral-700">
              Sync Availability
            </span>
            <button
              type="button"
              onClick={() => setSyncAvailability(!syncAvailability)}
              className={`relative w-11 h-6 rounded-full transition-colors ${syncAvailability ? 'bg-terra-500' : 'bg-neutral-300'
                }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${syncAvailability ? 'translate-x-5' : 'translate-x-0'
                }`} />
            </button>
          </label>
        </div>
      </div>
    </Drawer>
  );
}
