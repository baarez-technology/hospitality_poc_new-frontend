/**
 * FolioHeader - Booking info + folio window tabs
 */

import { useMemo } from 'react';
import type { Folio } from '@/types/folio.types';
import { useCurrency } from '@/hooks/useCurrency';

interface FolioHeaderProps {
  booking: any;
  folios: Folio[];
  activeFolioId: number | null;
  onSelectFolio: (id: number) => void;
}

export default function FolioHeader({ booking, folios, activeFolioId, onSelectFolio }: FolioHeaderProps) {
  const { formatCurrency } = useCurrency();
  const activeFolio = folios.find(f => f.id === activeFolioId);

  // Calculate original charges (positive only) from line items
  // Avoids double-counting tax
  const originalCharges = useMemo(() => {
    if (!activeFolio?.line_items) return activeFolio?.total_charges ?? 0;

    // Check if there are separate tax line items
    const hasSeparateTaxItems = activeFolio.line_items.some(item =>
      !item.is_voided && item.item_type === 'tax' && item.amount !== 0
    );

    let total = 0;
    for (const item of activeFolio.line_items) {
      if (item.is_voided) continue;
      if (item.item_type === 'payment') continue;
      if (item.amount > 0) {
        total += item.amount;
        // Only add embedded tax if no separate tax items
        if (!hasSeparateTaxItems && item.tax_amount) {
          total += item.tax_amount;
        }
      }
    }
    return total;
  }, [activeFolio]);

  return (
    <div className="space-y-3">
      <div className="flex-1 min-w-0 pr-8">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
          Billing & Folio
        </h2>
        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
          {booking?.guest} &middot; Booking #{booking?.id || booking?.bookingNumber}
        </p>
      </div>

      {/* Folio window tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {folios.map(folio => {
          const isActive = folio.id === activeFolioId;
          const typeLabel = folio.folio_type === 'company' ? 'Company' : folio.folio_type === 'incidental' ? 'Incidental' : 'Guest';
          return (
            <button
              key={folio.id}
              onClick={() => onSelectFolio(folio.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 border ${
                isActive
                  ? 'bg-terra-50 border-terra-300 text-terra-800 shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300'
              }`}
            >
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold ${
                isActive ? 'bg-terra-600 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {folio.window_label}
              </span>
              <span>{typeLabel}</span>
              {folio.status === 'closed' && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-500 uppercase">Closed</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active folio info bar */}
      {activeFolio && (
        <div className="flex items-center gap-4 text-[11px] text-neutral-500 bg-neutral-50 rounded-lg px-3 py-2 border border-neutral-100">
          <span className="font-mono font-medium text-neutral-700">{activeFolio.folio_number}</span>
          <span className="w-px h-3 bg-neutral-200" />
          <span>Total: <span className="font-semibold text-neutral-700">{formatCurrency(originalCharges)}</span></span>
          <span>Payments: <span className="font-semibold text-emerald-600">{formatCurrency(activeFolio.total_payments)}</span></span>
          <span>Balance: <span className={`font-semibold ${activeFolio.balance > 0 ? 'text-amber-600' : activeFolio.balance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(activeFolio.balance)}</span></span>
        </div>
      )}
    </div>
  );
}
