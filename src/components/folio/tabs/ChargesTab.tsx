/**
 * ChargesTab - All charges table + Post Charge button
 * Includes tax breakdown columns and per-night date grouping toggle
 */

import { useState, useMemo } from 'react';
import { Plus, Edit3, ArrowRightLeft, XCircle, CalendarDays, List, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import type { Folio, FolioLineItem } from '@/types/folio.types';
import PostChargeDialog from '../dialogs/PostChargeDialog';
import AdjustChargeDialog from '../dialogs/AdjustChargeDialog';

const ITEM_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  room_charge: { label: 'Room', color: 'bg-blue-50 text-blue-700' },
  service: { label: 'Service', color: 'bg-purple-50 text-purple-700' },
  minibar: { label: 'Minibar', color: 'bg-amber-50 text-amber-700' },
  spa: { label: 'Spa', color: 'bg-pink-50 text-pink-700' },
  parking: { label: 'Parking', color: 'bg-slate-50 text-slate-700' },
  restaurant: { label: 'Restaurant', color: 'bg-orange-50 text-orange-700' },
  phone: { label: 'Phone', color: 'bg-cyan-50 text-cyan-700' },
  laundry: { label: 'Laundry', color: 'bg-teal-50 text-teal-700' },
  late_checkout: { label: 'Late C/O', color: 'bg-rose-50 text-rose-700' },
  damage: { label: 'Damage', color: 'bg-red-50 text-red-700' },
  tax: { label: 'Tax', color: 'bg-neutral-100 text-neutral-600' },
  tax_rebate: { label: 'Tax Rebate', color: 'bg-emerald-50 text-emerald-700' },
  payment: { label: 'Payment', color: 'bg-emerald-50 text-emerald-700' },
  misc: { label: 'Misc', color: 'bg-neutral-50 text-neutral-600' },
};

// Item types that are non-taxable
const NON_TAXABLE_TYPES = new Set(['payment', 'tax', 'refund', 'discount', 'water']);

interface GroupTotals {
  total_charges: number;
  total_payments: number;
  total_balance: number;
  booking_count: number;
}

interface RatePlanInfo {
  name: string;
  discountType: 'percentage' | 'flat' | 'fixed';
  discountValue: number;
  originalRate: number;
  discountedRate: number;
}

interface ChargesTabProps {
  folio: Folio | null;
  bookingId: number | string;
  booking?: any;
  folios: Folio[];
  onRefresh: () => void;
  onPostCharge: (data: any) => Promise<void>;
  onAdjustCharge?: (itemId: number, data: any) => Promise<void>; // Deprecated - use Post Payment instead
  onVoidCharge: (itemId: number) => Promise<void>;
  onSplitCharge: (itemId: number, splits: any[]) => Promise<void>;
  onTransferCharge: (itemIds: number[], targetFolioId: number) => Promise<void>;
  isGroupBooking?: boolean;
  groupTotals?: GroupTotals | null;
}

function TaxTooltip({ item, formatCurrency }: { item: FolioLineItem; formatCurrency: (v: number) => string }) {
  const [show, setShow] = useState(false);
  if (!item.tax_amount) return null;

  const components: Array<{ name: string; pct: number; amount: number }> = [];
  if (item.tax_component_1_name && item.tax_component_1_amount) {
    components.push({ name: item.tax_component_1_name, pct: item.tax_component_1_pct || 0, amount: item.tax_component_1_amount });
  }
  if (item.tax_component_2_name && item.tax_component_2_amount) {
    components.push({ name: item.tax_component_2_name, pct: item.tax_component_2_pct || 0, amount: item.tax_component_2_amount });
  }

  if (components.length === 0) return null;

  return (
    <span className="relative inline-flex ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-neutral-400 hover:text-neutral-600"
      >
        <Info className="w-3 h-3" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 bg-neutral-800 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
          {components.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-4">
              <span>{c.name} @ {c.pct}%</span>
              <span className="font-medium">{formatCurrency(c.amount)}</span>
            </div>
          ))}
          <div className="border-t border-neutral-600 mt-1 pt-1 flex items-center justify-between gap-4 font-semibold">
            <span>Total Tax</span>
            <span>{formatCurrency(item.tax_amount)}</span>
          </div>
        </div>
      )}
    </span>
  );
}

export default function ChargesTab({
  folio, bookingId, booking, folios, onRefresh,
  onPostCharge, onAdjustCharge, onVoidCharge, onSplitCharge, onTransferCharge,
  isGroupBooking, groupTotals
}: ChargesTabProps) {
  const { formatCurrency } = useCurrency();
  const [showPostCharge, setShowPostCharge] = useState(false);
  const [adjustItem, setAdjustItem] = useState<FolioLineItem | null>(null);
  const [groupByDate, setGroupByDate] = useState(false);
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());

  // Extract rate plan discount info from booking
  const ratePlanInfo = useMemo((): RatePlanInfo | null => {
    if (!booking) return null;

    // Use the new API field names
    const ratePlanName = booking.ratePlanName || booking.ratePlan || booking.rate_plan || null;
    const discountType = booking.ratePlanDiscountType || booking.discountType || booking.discount_type || null;
    const discountValue = booking.ratePlanDiscountValue || booking.discountValue || booking.discount_value || 0;
    const originalRate = booking.originalRoomRate || booking.originalRate || booking.original_rate || 0;
    const discountedRate = booking.ratePerNight || booking.nightlyRate || booking.nightly_rate || 0;

    // Only show if there's a discount applied (not BAR and has discount value)
    if (!ratePlanName || ratePlanName === 'BAR' || ratePlanName === 'Best Available Rate' || discountValue <= 0) {
      return null;
    }

    return {
      name: ratePlanName,
      discountType: discountType || 'percentage',
      discountValue,
      originalRate: originalRate || discountedRate, // Fallback if no original rate
      discountedRate,
    };
  }, [booking]);

  // All charge line items (both positive charges and negative rebates/discounts)
  // Excludes payment items which are handled separately
  const charges = useMemo(() => {
    if (!folio) return [];
    return (folio.line_items || []).filter(li => li.item_type !== 'payment');
  }, [folio]);

  // Payment line items (negative amounts, item_type = 'payment')
  const payments = useMemo(() => {
    if (!folio) return [];
    return (folio.line_items || []).filter(li => li.item_type === 'payment' && !li.is_voided);
  }, [folio]);

  // Compute tax totals - separate original charges from rebates
  // IMPORTANT: Avoid double-counting tax - it can be either in separate 'tax' line items
  // OR embedded as tax_amount on charges, but not both
  const taxSummary = useMemo(() => {
    let originalSubtotal = 0; // Positive charges only (before rebates)
    let rebateAmount = 0; // Negative adjustments (rebates)
    let taxFromSeparateItems = 0; // Tax from separate 'tax' line items
    let taxFromEmbedded = 0; // Tax embedded in charge items
    let rebateTaxFromSeparate = 0;
    let rebateTaxFromEmbedded = 0;
    let comp1Total = 0;
    let comp2Total = 0;
    let comp1Name = '';
    let comp2Name = '';

    // First pass: check if there are separate tax line items
    const hasSeparateTaxItems = charges.some(item =>
      !item.is_voided && item.item_type === 'tax' && item.amount !== 0
    );

    for (const item of charges) {
      if (item.is_voided) continue;

      // Handle separate 'tax' type line items
      if (item.item_type === 'tax') {
        if (item.amount >= 0) {
          taxFromSeparateItems += item.amount;
        } else {
          rebateTaxFromSeparate += item.amount;
        }
        // Tax components from separate tax items
        if (item.tax_component_1_amount) {
          if (item.amount >= 0) comp1Total += item.tax_component_1_amount;
          if (!comp1Name && item.tax_component_1_name) comp1Name = item.tax_component_1_name;
        }
        if (item.tax_component_2_amount) {
          if (item.amount >= 0) comp2Total += item.tax_component_2_amount;
          if (!comp2Name && item.tax_component_2_name) comp2Name = item.tax_component_2_name;
        }
        continue;
      }

      // Skip payment and refund items (they're tracked separately)
      if (item.item_type === 'payment' || item.item_type === 'refund') continue;

      // Handle discount items as rebates (they have negative amounts)
      if (item.item_type === 'discount') {
        rebateAmount += item.amount; // amount is already negative
        continue;
      }

      // Handle tax rebate items (GST reduction due to discount)
      if (item.item_type === 'tax_rebate') {
        rebateTaxFromSeparate += item.amount; // amount is already negative
        continue;
      }

      // Separate positive charges from negative rebates
      if (item.amount >= 0) {
        originalSubtotal += item.amount;
        // Only count embedded tax if there are NO separate tax line items (avoid double-counting)
        if (!hasSeparateTaxItems && item.tax_amount) {
          taxFromEmbedded += item.tax_amount;
        }
        // Tax components (only if no separate tax items)
        if (!hasSeparateTaxItems) {
          if (item.tax_component_1_amount) {
            comp1Total += item.tax_component_1_amount;
            if (!comp1Name && item.tax_component_1_name) comp1Name = item.tax_component_1_name;
          }
          if (item.tax_component_2_amount) {
            comp2Total += item.tax_component_2_amount;
            if (!comp2Name && item.tax_component_2_name) comp2Name = item.tax_component_2_name;
          }
        }
      } else {
        // This is a rebate (negative amount)
        rebateAmount += item.amount;
        if (!hasSeparateTaxItems && item.tax_amount) {
          rebateTaxFromEmbedded += item.tax_amount;
        }
      }
    }

    // Use tax from separate items if available, otherwise use embedded tax
    const originalTax = hasSeparateTaxItems ? taxFromSeparateItems : taxFromEmbedded;
    const rebateTax = hasSeparateTaxItems ? rebateTaxFromSeparate : rebateTaxFromEmbedded;

    const totalOriginal = originalSubtotal + originalTax;
    const totalRebates = rebateAmount + rebateTax;
    const netSubtotal = originalSubtotal + rebateAmount;
    const netTax = originalTax + rebateTax;
    const grandTotal = netSubtotal + netTax;

    return {
      originalSubtotal,
      originalTax,
      totalOriginal,
      rebateAmount,
      rebateTax,
      totalRebates,
      subtotal: netSubtotal,
      totalTax: netTax,
      comp1Name,
      comp1Total,
      comp2Name,
      comp2Total,
      grandTotal
    };
  }, [charges]);

  // Group charges by date for per-night view — separate room vs non-room
  const dateGroups = useMemo(() => {
    if (!groupByDate) return null;
    const groups: Record<string, FolioLineItem[]> = {};
    for (const item of charges) {
      const dateStr = new Date(item.posted_at || item.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [charges, groupByDate]);

  // Non-room charges grouped by category (for By Date view)
  const nonRoomByCategory = useMemo(() => {
    if (!groupByDate) return null;
    const cats: Record<string, { items: FolioLineItem[]; total: number; tax: number }> = {};
    for (const item of charges) {
      if (item.is_voided || item.item_type === 'room_charge') continue;
      if (NON_TAXABLE_TYPES.has(item.item_type)) continue;
      const cat = item.item_type || 'misc';
      if (!cats[cat]) cats[cat] = { items: [], total: 0, tax: 0 };
      cats[cat].items.push(item);
      cats[cat].total += item.amount;
      cats[cat].tax += item.tax_amount || 0;
    }
    return Object.entries(cats).sort(([a], [b]) => a.localeCompare(b));
  }, [charges, groupByDate]);

  // Category subtotals (for both views)
  const categorySubtotals = useMemo(() => {
    const cats: Record<string, { amount: number; tax: number }> = {};
    for (const item of charges) {
      if (item.is_voided) continue;
      if (NON_TAXABLE_TYPES.has(item.item_type)) continue;
      const cat = item.item_type || 'misc';
      if (!cats[cat]) cats[cat] = { amount: 0, tax: 0 };
      cats[cat].amount += item.amount;
      cats[cat].tax += item.tax_amount || 0;
    }
    return Object.entries(cats).sort(([, a], [, b]) => (b.amount + b.tax) - (a.amount + a.tax));
  }, [charges]);

  if (!folio) return null;

  const isClosed = folio.status === 'closed';
  // Check for tax data: either embedded tax_amount on charges, or separate 'tax' line items
  const hasTaxData = charges.some(c =>
    (c.tax_amount && c.tax_amount > 0) ||
    (c.item_type === 'tax' && c.amount > 0)
  );

  // GST is stored twice for live charges: embedded as tax_amount on the parent charge
  // (shown inline in the Tax column) AND as a standalone 'tax' line item. Rendering both
  // in the Flat view double-displays GST. When embedded tax is present we keep the inline
  // per-charge tax (with its CGST/SGST tooltip) and hide the redundant standalone tax rows.
  // If tax only exists as separate lines (legacy data with no embedded tax), we keep those
  // rows so the tax is still visible. Folio totals are unaffected — they come from taxSummary.
  const hasEmbeddedTax = charges.some(item =>
    !item.is_voided && item.item_type !== 'tax' && (item.tax_amount || 0) > 0
  );
  const flatCharges = hasEmbeddedTax
    ? charges.filter(item => item.item_type !== 'tax')
    : charges;

  const toggleDate = (date: string) => {
    setCollapsedDates(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const renderChargeRow = (item: FolioLineItem) => {
    const typeInfo = ITEM_TYPE_LABELS[item.item_type] || ITEM_TYPE_LABELS.misc;
    const isVoided = item.is_voided;
    const isNonTaxable = NON_TAXABLE_TYPES.has(item.item_type);

    return (
      <tr
        key={item.id}
        className={`border-b border-neutral-100 last:border-0 ${isVoided ? 'opacity-50' : 'hover:bg-neutral-50/50'}`}
      >
        <td className={`px-3 py-2.5 text-neutral-500 whitespace-nowrap ${isVoided ? 'line-through' : ''}`}>
          {new Date(item.posted_at || item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </td>
        <td className={`px-3 py-2.5 text-neutral-900 font-medium ${isVoided ? 'line-through' : ''}`}>
          {item.description}
          {isVoided && <span className="ml-2 text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">Void</span>}
        </td>
        <td className="px-3 py-2.5">
          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </td>
        <td className={`px-3 py-2.5 text-right text-neutral-600 ${isVoided ? 'line-through' : ''}`}>{item.quantity}</td>
        <td className={`px-3 py-2.5 text-right text-neutral-600 ${isVoided ? 'line-through' : ''}`}>{formatCurrency(item.unit_price)}</td>
        <td className={`px-3 py-2.5 text-right font-semibold ${isVoided ? 'line-through text-neutral-400' : item.amount < 0 ? 'text-emerald-600' : 'text-neutral-900'}`}>
          {formatCurrency(Math.abs(item.amount))}
        </td>
        {hasTaxData && (
          <td className={`px-3 py-2.5 text-right ${isVoided ? 'line-through text-neutral-400' : 'text-neutral-600'}`}>
            {isNonTaxable || !item.tax_amount ? (
              <span className="text-neutral-300">&mdash;</span>
            ) : (
              <span className="inline-flex items-center">
                {formatCurrency(item.tax_amount)}
                <TaxTooltip item={item} formatCurrency={formatCurrency} />
              </span>
            )}
          </td>
        )}
        {hasTaxData && (
          <td className={`px-3 py-2.5 text-right font-semibold ${isVoided ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
            {isNonTaxable ? formatCurrency(Math.abs(item.amount)) : formatCurrency(item.amount + (item.tax_amount || 0))}
          </td>
        )}
        {!isClosed && (
          <td className="px-3 py-2.5 text-right">
            {!isVoided && item.item_type !== 'payment' && item.item_type !== 'tax' && (
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => setAdjustItem(item)} title="Adjust" className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {folios.length > 1 && (
                  <button onClick={() => onTransferCharge([item.id], folios.find(f => f.id !== folio!.id)!.id)} title="Transfer" className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors">
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => { if (window.confirm('Void this charge?')) onVoidCharge(item.id); }} title="Void" className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </td>
        )}
      </tr>
    );
  };

  const renderDateGroupView = () => {
    if (!dateGroups) return null;

    // Separate room charge nights from other charges
    const nightEntries: Array<[string, FolioLineItem[]]> = [];
    for (const [dateStr, items] of dateGroups) {
      const roomItems = items.filter(i => i.item_type === 'room_charge');
      if (roomItems.length > 0) nightEntries.push([dateStr, items]);
    }

    return (
      <div className="space-y-5">
        {/* Per-night room charge breakdown */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Per-Night Breakdown</h4>
          {nightEntries.length === 0 ? (
            <p className="text-[12px] text-neutral-400 italic">No room charges posted</p>
          ) : (
            nightEntries.map(([dateStr, items]) => {
              const isCollapsed = collapsedDates.has(dateStr);
              const displayDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
              const roomItems = items.filter(i => i.item_type === 'room_charge');
              const otherItems = items.filter(i => i.item_type !== 'room_charge' && !NON_TAXABLE_TYPES.has(i.item_type));

              let dayRoomTotal = 0;
              let dayRoomTax = 0;
              let dayComp1 = 0;
              let dayComp2 = 0;
              let comp1Name = '';
              let comp2Name = '';
              for (const item of roomItems) {
                if (item.is_voided) continue;
                dayRoomTotal += item.amount;
                dayRoomTax += item.tax_amount || 0;
                if (item.tax_component_1_amount) { dayComp1 += item.tax_component_1_amount; if (!comp1Name) comp1Name = item.tax_component_1_name || ''; }
                if (item.tax_component_2_amount) { dayComp2 += item.tax_component_2_amount; if (!comp2Name) comp2Name = item.tax_component_2_name || ''; }
              }

              let dayOtherTotal = 0;
              let dayOtherTax = 0;
              for (const item of otherItems) {
                if (item.is_voided) continue;
                dayOtherTotal += item.amount;
                dayOtherTax += item.tax_amount || 0;
              }

              return (
                <div key={dateStr} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleDate(dateStr)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-blue-50/60 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? <ChevronRight className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
                      <span className="text-[13px] font-semibold text-neutral-900">{displayDate}</span>
                      <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded font-medium">
                        {roomItems.length} room {otherItems.length > 0 ? `+ ${otherItems.length} other` : ''}
                      </span>
                    </div>
                    <span className="font-semibold text-[12px] text-neutral-900">
                      {formatCurrency(dayRoomTotal + dayRoomTax + dayOtherTotal + dayOtherTax)}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="px-4 py-3 space-y-2">
                      {/* Room charge with tax breakdown */}
                      {roomItems.map(item => (
                        <div key={item.id} className={`flex items-center justify-between ${item.is_voided ? 'opacity-50' : ''}`}>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700">Room</span>
                            <span className={`text-[12px] text-neutral-900 font-medium ${item.is_voided ? 'line-through' : ''}`}>{item.description}</span>
                            {item.is_voided && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">Void</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[12px] font-medium ${item.is_voided ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>{formatCurrency(item.amount)}</span>
                            {!isClosed && !item.is_voided && (
                              <div className="flex items-center gap-1">
                                <button onClick={() => setAdjustItem(item)} title="Adjust" className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors">
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button onClick={() => { if (window.confirm('Void this charge?')) onVoidCharge(item.id); }} title="Void" className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors">
                                  <XCircle className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* CGST / SGST breakdown for the night */}
                      {(dayComp1 > 0 || dayComp2 > 0) && (
                        <div className="ml-8 border-l-2 border-neutral-200 pl-3 space-y-0.5">
                          {comp1Name && dayComp1 > 0 && (
                            <div className="flex items-center justify-between text-[11px] text-neutral-500">
                              <span>{comp1Name}</span>
                              <span className="font-medium">{formatCurrency(dayComp1)}</span>
                            </div>
                          )}
                          {comp2Name && dayComp2 > 0 && (
                            <div className="flex items-center justify-between text-[11px] text-neutral-500">
                              <span>{comp2Name}</span>
                              <span className="font-medium">{formatCurrency(dayComp2)}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-neutral-600 font-semibold border-t border-neutral-100 pt-0.5">
                            <span>Night Total</span>
                            <span>{formatCurrency(dayRoomTotal + dayRoomTax)}</span>
                          </div>
                        </div>
                      )}

                      {/* Other charges for this date */}
                      {otherItems.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed border-neutral-200 space-y-1.5">
                          {otherItems.map(item => {
                            const typeInfo = ITEM_TYPE_LABELS[item.item_type] || ITEM_TYPE_LABELS.misc;
                            const itemTotal = item.amount + (item.tax_amount || 0);
                            return (
                              <div key={item.id} className={`flex items-center justify-between ${item.is_voided ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${typeInfo.color}`}>{typeInfo.label}</span>
                                  <span className={`text-[12px] text-neutral-700 ${item.is_voided ? 'line-through' : ''}`}>{item.description}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[12px] font-medium ${item.is_voided ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                                    {formatCurrency(itemTotal)}
                                  </span>
                                  {!isClosed && !item.is_voided && item.item_type !== 'payment' && item.item_type !== 'tax' && (
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => setAdjustItem(item)} title="Adjust" className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors">
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button onClick={() => { if (window.confirm('Void this charge?')) onVoidCharge(item.id); }} title="Void" className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors">
                                        <XCircle className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Non-room charges by category */}
        {nonRoomByCategory && nonRoomByCategory.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Other Charges by Category</h4>
            {nonRoomByCategory.map(([cat, data]) => {
              const typeInfo = ITEM_TYPE_LABELS[cat] || ITEM_TYPE_LABELS.misc;
              return (
                <div key={cat} className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-50">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${typeInfo.color}`}>{typeInfo.label}</span>
                      <span className="text-[11px] text-neutral-500">({data.items.length} items)</span>
                    </div>
                    <span className="text-[12px] font-semibold text-neutral-900">{formatCurrency(data.total + data.tax)}</span>
                  </div>
                  <div className="divide-y divide-neutral-100">
                    {data.items.map(item => (
                      <div key={item.id} className={`flex items-center justify-between px-4 py-2 ${item.is_voided ? 'opacity-50' : 'hover:bg-neutral-50/50'}`}>
                        <span className={`text-[12px] text-neutral-700 ${item.is_voided ? 'line-through' : ''}`}>{item.description}</span>
                        <span className={`text-[12px] font-medium ${item.is_voided ? 'line-through text-neutral-400' : 'text-neutral-800'}`}>
                          {formatCurrency(item.amount + (item.tax_amount || 0))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Category subtotals */}
        {categorySubtotals.length > 0 && (
          <div className="bg-neutral-50 rounded-xl p-4 space-y-1.5">
            <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-2">Category Subtotals</h4>
            {categorySubtotals.map(([cat, data]) => {
              const typeInfo = ITEM_TYPE_LABELS[cat] || ITEM_TYPE_LABELS.misc;
              return (
                <div key={cat} className="flex items-center justify-between text-[12px]">
                  <span className="text-neutral-600">{typeInfo.label}</span>
                  <span className="font-medium text-neutral-800">{formatCurrency(data.amount + data.tax)}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between text-[13px] border-t border-neutral-200 pt-2 mt-2">
              <span className="font-semibold text-neutral-900">Grand Total</span>
              <span className="font-bold text-neutral-900">{formatCurrency(taxSummary.grandTotal)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-neutral-900">
          Charges ({charges.length})
        </h3>
        <div className="flex items-center gap-2">
          {/* Group by Date toggle */}
          {charges.length > 0 && (
            <div className="inline-flex bg-neutral-100 rounded-lg p-0.5">
              <button
                onClick={() => setGroupByDate(false)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  !groupByDate ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <List className="w-3 h-3" />
                Flat
              </button>
              <button
                onClick={() => setGroupByDate(true)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors ${
                  groupByDate ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <CalendarDays className="w-3 h-3" />
                By Date
              </button>
            </div>
          )}
          {!isClosed && (
            <button
              onClick={() => setShowPostCharge(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-terra-700 bg-terra-50 hover:bg-terra-100 rounded-lg border border-terra-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Post Charge
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {charges.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-[13px]">
          No charges posted yet
        </div>
      ) : groupByDate ? (
        renderDateGroupView()
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Date</th>
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Description</th>
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Type</th>
                <th className="text-right px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Qty</th>
                <th className="text-right px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Unit Price</th>
                <th className="text-right px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Amount</th>
                {hasTaxData && <th className="text-right px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Tax</th>}
                {hasTaxData && <th className="text-right px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Total</th>}
                {!isClosed && <th className="text-right px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {flatCharges.map(renderChargeRow)}
            </tbody>
          </table>
        </div>
      )}

      {/* Rate Plan Discount Info */}
      {ratePlanInfo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wider">Rate Plan Applied</span>
            <span className="text-[11px] font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded">
              {ratePlanInfo.name}
            </span>
          </div>
          {ratePlanInfo.originalRate > 0 && ratePlanInfo.originalRate !== ratePlanInfo.discountedRate && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-neutral-500">Original Room Rate</span>
              <span className="text-neutral-400 line-through">{formatCurrency(ratePlanInfo.originalRate)}/night</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-green-600">
              Discount {ratePlanInfo.discountType === 'percentage'
                ? `(${ratePlanInfo.discountValue}% off)`
                : ratePlanInfo.discountType === 'flat'
                  ? `(₹${ratePlanInfo.discountValue} off)`
                  : '(Fixed price)'}
            </span>
            <span className="text-green-600 font-medium">
              {ratePlanInfo.discountType === 'percentage'
                ? `-${ratePlanInfo.discountValue}%`
                : ratePlanInfo.discountType === 'flat'
                  ? `-${formatCurrency(ratePlanInfo.discountValue)}`
                  : 'Fixed'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px] border-t border-green-200 pt-2">
            <span className="text-neutral-700 font-semibold">Discounted Rate</span>
            <span className="font-semibold text-green-700">{formatCurrency(ratePlanInfo.discountedRate)}/night</span>
          </div>
        </div>
      )}

      {/* Tax Summary */}
      {charges.length > 0 && hasTaxData && (
        <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
          {/* Original Charges (before rebates) */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-neutral-500">Original Charges</span>
            <span className="font-medium text-neutral-700">{formatCurrency(taxSummary.originalSubtotal)}</span>
          </div>
          {taxSummary.comp1Name && taxSummary.comp1Total > 0 && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-neutral-500">{taxSummary.comp1Name}</span>
              <span className="font-medium text-neutral-700">{formatCurrency(taxSummary.comp1Total)}</span>
            </div>
          )}
          {taxSummary.comp2Name && taxSummary.comp2Total > 0 && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-neutral-500">{taxSummary.comp2Name}</span>
              <span className="font-medium text-neutral-700">{formatCurrency(taxSummary.comp2Total)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-neutral-500 font-medium">Original Tax</span>
            <span className="font-medium text-neutral-700">{formatCurrency(taxSummary.originalTax)}</span>
          </div>
          <div className="flex items-center justify-between text-[12px] border-t border-neutral-200 pt-2">
            <span className="text-neutral-700 font-semibold">Total (Before Rebates)</span>
            <span className="font-semibold text-neutral-800">{formatCurrency(taxSummary.totalOriginal)}</span>
          </div>

          {/* Discount/Rebates (if any) */}
          {taxSummary.totalRebates < 0 && (
            <>
              <div className="flex items-center justify-between text-[12px] border-t border-emerald-200 pt-2 mt-1">
                <span className="text-emerald-700 font-medium">Discount</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(taxSummary.rebateAmount)}</span>
              </div>
              {taxSummary.rebateTax < 0 && (
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-amber-600">Tax Rebate</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(taxSummary.rebateTax)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-amber-700 font-semibold">Total Rebates</span>
                <span className="font-semibold text-emerald-600">{formatCurrency(taxSummary.totalRebates)}</span>
              </div>
            </>
          )}

          {/* Net Total */}
          <div className="flex items-center justify-between text-[13px] border-t-2 border-neutral-300 pt-2 mt-1">
            <span className="font-semibold text-neutral-900">
              {isGroupBooking && groupTotals && groupTotals.booking_count > 1
                ? `This Room Net Total`
                : 'Net Total'}
            </span>
            <span className="font-bold text-neutral-900">{formatCurrency(taxSummary.grandTotal)}</span>
          </div>
          {/* Group booking consolidated grand total */}
          {isGroupBooking && groupTotals && groupTotals.booking_count > 1 && (
            <div className="flex items-center justify-between text-[13px] border-t-2 border-purple-200 pt-2 mt-1 bg-purple-50 -mx-4 px-4 py-2 -mb-4 rounded-b-xl">
              <span className="font-semibold text-purple-900">
                Grand Total ({groupTotals.booking_count} Rooms)
              </span>
              <span className="font-bold text-purple-900">{formatCurrency(groupTotals.total_charges)}</span>
            </div>
          )}
        </div>
      )}

      {/* Payments Summary */}
      {payments.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
          <h4 className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
            Payments Received ({payments.length})
          </h4>
          <div className="space-y-2">
            {payments.map(payment => {
              // Extract payment method from description or transaction_code
              const methodMatch = payment.description?.match(/via (\w+)/i);
              const method = methodMatch ? methodMatch[1] : payment.transaction_code || 'Payment';
              // Extract reason from notes or description
              const reasonMatch = payment.notes?.match(/\.\s*(.+)$/) || payment.description?.match(/[–-]\s*(.+)$/);
              const reason = reasonMatch ? reasonMatch[1] : payment.notes || '';

              return (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-emerald-200 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                        {method}
                      </span>
                      <span className="text-[12px] text-emerald-800 font-medium">
                        {formatCurrency(Math.abs(payment.amount))}
                      </span>
                      <span className="text-[11px] text-emerald-600">
                        {new Date(payment.posted_at || payment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    {reason && (
                      <p className="text-[11px] text-emerald-600 mt-0.5 ml-0.5">{reason}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment totals */}
          <div className="border-t border-emerald-300 pt-3 space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-emerald-700">Total Payments</span>
              <span className="font-semibold text-emerald-700">{formatCurrency(payments.reduce((sum, p) => sum + Math.abs(p.amount), 0))}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-amber-700">Remaining Balance</span>
              <span className="font-bold text-amber-700">{formatCurrency(folio?.balance || 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Post Charge Dialog */}
      {showPostCharge && (
        <PostChargeDialog
          onSubmit={async (data) => { await onPostCharge(data); setShowPostCharge(false); }}
          onClose={() => setShowPostCharge(false)}
        />
      )}

      {/* Record Payment Dialog */}
      {adjustItem && onAdjustCharge && folio && (
        <AdjustChargeDialog
          item={adjustItem}
          balance={folio.balance}
          onSubmit={async (data) => { await onAdjustCharge(adjustItem.id, data); setAdjustItem(null); }}
          onClose={() => setAdjustItem(null)}
        />
      )}
    </div>
  );
}
