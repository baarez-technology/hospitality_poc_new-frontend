/**
 * BulkMappingDrawer Component
 * Single-screen bulk room mapping: all PMS room types and OTA room type selectors in one view.
 * Uses GET /room-mappings/bulk-view and POST /room-mappings/bulk.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Layers, ArrowRight, Check, ChevronDown, X } from 'lucide-react';
import { channelManagerService } from '../../api/services/channel-manager.service';
import { useToast } from '../../contexts/ToastContext';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';

/** Combobox dropdown for OTA room type selection — matches Glimmora SelectDropdown style */
function OtaRoomTypeCombobox({
  value,
  onChange,
  options,
  placeholder = 'Select OTA room type',
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ otaRoomType: string }>;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(o => o.otaRoomType.toLowerCase().includes(q));
  }, [options, search]);

  const calculatePosition = (triggerRect: DOMRect) => {
    const menuHeight = 240;
    const padding = 4;
    const spaceBelow = window.innerHeight - triggerRect.bottom - padding;
    const spaceAbove = triggerRect.top - padding;

    let top;
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      top = triggerRect.top - Math.min(menuHeight, spaceAbove) - padding;
    } else {
      top = triggerRect.bottom + padding;
    }

    return { top, left: triggerRect.left, width: Math.max(triggerRect.width, 240) };
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
        className={`w-full max-w-[240px] h-9 px-3 rounded-[8px] text-[13px] bg-white border flex items-center justify-between gap-1.5 transition-all duration-150 focus:outline-none ${
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
          <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
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
                  // Allow custom value on Enter
                  handleSelect(search.trim());
                }
              }}
              placeholder="Search or type custom..."
              className="w-full h-8 px-3 rounded-[6px] text-[13px] bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-terra-400 focus:ring-1 focus:ring-terra-500/10 transition-all"
            />
          </div>

          {/* Options */}
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map((option, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(option.otaRoomType)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-left transition-colors duration-100 hover:bg-neutral-50 ${
                    value === option.otaRoomType ? 'bg-neutral-50 text-neutral-900' : 'text-neutral-700'
                  }`}
                >
                  <span className="flex-1 truncate">{option.otaRoomType}</span>
                  {value === option.otaRoomType && (
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

export default function BulkMappingDrawer({
  isOpen,
  onClose,
  otaCode,
  otaName,
  onSuccess,
}) {
  const { symbol } = useCurrency();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [localMappings, setLocalMappings] = useState<Record<number, string>>({});
  const [initialMappings, setInitialMappings] = useState<Record<number, string>>({});
  const fetchIdRef = useRef(0);

  useEffect(() => {
    if (isOpen && otaCode) {
      if (otaCode === 'DUMMY') {
        setData({ items: [], knownOtaRoomTypes: [], total: 0, otaCode: 'DUMMY' });
        setLocalMappings({});
        setInitialMappings({});
        setLoading(false);
        return;
      }
      setData(null);
      setLocalMappings({});
      setInitialMappings({});
      setLoading(true);
      const currentFetchId = (fetchIdRef.current += 1);
      const openWhenStarted = isOpen;
      const otaWhenStarted = otaCode;
      channelManagerService
        .getRoomMappingsBulkView(otaCode)
        .then((res) => {
          if (currentFetchId !== fetchIdRef.current) return;
          if (!openWhenStarted || otaCode !== otaWhenStarted) return;
          setData(res);
          const init = (res.items || []).reduce(
            (acc, it) => ({
              ...acc,
              [it.pmsRoomTypeId]: it.mappingId != null
                ? (it.otaRoomType ?? '').trim()
                : ''
            }),
            {}
          );
          setLocalMappings(init);
          setInitialMappings(init);
        })
        .catch((err) => {
          if (currentFetchId !== fetchIdRef.current) return;
          if (!openWhenStarted || otaCode !== otaWhenStarted) return;
          console.error('Bulk view fetch error:', err);
          showError(err?.response?.data?.error || 'Failed to load bulk mapping data');
          setData(null);
        })
        .finally(() => {
          if (currentFetchId === fetchIdRef.current && openWhenStarted && otaCode === otaWhenStarted) {
            setLoading(false);
          }
        });
    } else if (!isOpen) {
      setData(null);
      setLocalMappings({});
      setInitialMappings({});
      setLoading(false);
    }
  }, [isOpen, otaCode]);

  const items = data?.items ?? [];
  const knownOtaRoomTypes = data?.knownOtaRoomTypes ?? [];

  const setOtaFor = (pmsRoomTypeId: number, value: string) => {
    setLocalMappings((prev) => ({ ...prev, [pmsRoomTypeId]: value }));
  };

  /** Only include items whose value actually changed from initial state */
  const mappingsToSave = useMemo(() => {
    return items
      .filter((it) => {
        const current = (localMappings[it.pmsRoomTypeId] ?? '').trim();
        const original = (initialMappings[it.pmsRoomTypeId] ?? '').trim();
        return current.length > 0 && current !== original;
      })
      .map((it) => ({
        pmsRoomTypeId: it.pmsRoomTypeId,
        otaRoomType: (localMappings[it.pmsRoomTypeId] ?? '').trim(),
      }));
  }, [items, localMappings, initialMappings]);

  /** Items that had a mapping but user cleared the OTA field — need to delete on save */
  const mappingsToDelete = useMemo(() => {
    return items.filter((it) => {
      const current = (localMappings[it.pmsRoomTypeId] ?? '').trim();
      const original = (initialMappings[it.pmsRoomTypeId] ?? '').trim();
      return original.length > 0 && current.length === 0;
    });
  }, [items, localMappings, initialMappings]);

  const hasChanges = mappingsToSave.length > 0 || mappingsToDelete.length > 0;

  const handleSave = async () => {
    if (!hasChanges) {
      showError('No changes detected. Modify at least one mapping to save.');
      return;
    }
    setSaving(true);
    try {
      const errs: string[] = [];

      // Delete cleared mappings
      for (const it of mappingsToDelete) {
        if (it.mappingId) {
          try {
            await channelManagerService.deleteRoomMapping(String(it.mappingId));
          } catch (err) {
            console.error('Delete mapping error:', err);
            errs.push(
              err?.response?.data?.error || `Failed to remove mapping for ${it.pmsRoomType}`
            );
          }
        }
      }

      // Save new/updated mappings
      let created = 0;
      let updated = 0;
      if (mappingsToSave.length > 0) {
        const result = await channelManagerService.bulkRoomMappings({
          otaCode,
          mappings: mappingsToSave,
        });
        created = result?.created ?? 0;
        updated = result?.updated ?? 0;
        if (result?.errors?.length) errs.push(...result.errors);
      }

      if (errs.length > 0) {
        showError(errs.slice(0, 3).join('; ') + (errs.length > 3 ? '...' : ''));
      }

      const totalSaved = created + updated;
      const totalRemoved = mappingsToDelete.length;

      if (totalSaved > 0 || totalRemoved > 0) {
        const parts: string[] = [];
        if (totalSaved > 0) parts.push(`${totalSaved} room type${totalSaved === 1 ? '' : 's'} mapped`);
        if (totalRemoved > 0) parts.push(`${totalRemoved} removed`);
        success(parts.join(', '));
        onSuccess?.();
        onClose();
      } else if (errs.length === 0) {
        success('Mappings are already up to date.');
        onClose();
      }
    } catch (err) {
      console.error('Bulk save error:', err);
      showError(err?.response?.data?.error || 'Failed to save bulk mappings');
    } finally {
      setSaving(false);
    }
  };

  const mappedCount = items.filter(
    (it) => ((localMappings[it.pmsRoomTypeId] ?? '').trim().length > 0)
  ).length;
  const totalCount = items.length;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Map Room Types"
      subtitle={otaName ? `${otaName} — map all room types in one screen` : otaCode}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-[13px] text-neutral-500">
            {mappedCount}/{totalCount} mapped
          </p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="px-5 py-2 text-[13px] font-semibold">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              loading={saving}
              className="px-5 py-2 text-[13px] font-semibold"
            >
              Save Mappings
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-terra-500 mb-4" />
          <p className="text-[13px] text-neutral-500">Loading room types...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-[8px] bg-neutral-100 flex items-center justify-center mb-4">
            <Layers className="w-7 h-7 text-neutral-400" />
          </div>
          <p className="text-[15px] font-medium text-neutral-800 mb-1">No room types</p>
          <p className="text-[13px] text-neutral-500">There are no PMS room types to map.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-[8px] bg-terra-50 border border-terra-100 flex items-center gap-3">
            <Layers className="w-5 h-5 text-terra-600 flex-shrink-0" />
            <p className="text-[13px] text-terra-700">
              Map each hotel room type to an OTA room type. Choose from suggestions or type your own.
              Save once to apply all mappings.
            </p>
          </div>

          <div className="border border-neutral-200 rounded-[10px] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                    PMS Room Type
                  </th>
                  <th className="w-8" aria-hidden />
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                    OTA Room Type
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 text-right">
                    Base Price
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 text-right">
                    Inventory
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {items.map((it) => {
                  const val = localMappings[it.pmsRoomTypeId] ?? '';
                  const isMapped = val.trim().length > 0;
                  return (
                    <tr key={it.pmsRoomTypeId} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-[8px] bg-neutral-100 flex items-center justify-center flex-shrink-0">
                            <Layers className="w-4 h-4 text-neutral-500" />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-neutral-900">
                              {it.pmsRoomType}
                            </p>
                            {it.pmsRoomCode && (
                              <p className="text-[11px] text-neutral-400">{it.pmsRoomCode}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="w-8 py-3">
                        <ArrowRight className="w-4 h-4 text-neutral-300" />
                      </td>
                      <td className="px-4 py-3">
                        <OtaRoomTypeCombobox
                          value={val}
                          onChange={(v) => setOtaFor(it.pmsRoomTypeId, v)}
                          options={knownOtaRoomTypes}
                        />
                        {isMapped && (
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-sage-600">
                            <Check className="w-3 h-3" />
                            Mapped
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] text-neutral-600 tabular-nums">
                        {typeof it.basePrice === 'number' ? `${symbol}${it.basePrice}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-[13px] text-neutral-600 tabular-nums">
                        {typeof it.inventory === 'number' ? it.inventory : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Drawer>
  );
}
