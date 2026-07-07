/**
 * FolioSummaryCard - Total charges / payments / balance / avg rate KPIs
 * Supports group booking consolidated totals
 * Shows original charges, rebates, and net balance separately
 */

import { useMemo } from 'react';
import { Receipt, CreditCard, Wallet, Moon, Users, TrendingDown } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import type { Folio } from '@/types/folio.types';

interface GroupTotals {
  total_charges: number;
  total_payments: number;
  total_balance: number;
  booking_count: number;
}

interface FolioSummaryCardProps {
  folio: Folio | null;
  nights?: number; // number of stay nights from booking
  isGroupBooking?: boolean;
  groupTotals?: GroupTotals | null;
  linkedRoomFolios?: any[];
}

export default function FolioSummaryCard({ folio, nights, isGroupBooking, groupTotals, linkedRoomFolios }: FolioSummaryCardProps) {
  const { formatCurrency } = useCurrency();

  // Compute charges breakdown: original charges vs rebates
  // Avoids double-counting tax (can be in separate 'tax' items OR embedded, not both)
  const chargesBreakdown = useMemo(() => {
    if (!folio?.line_items) return { original: 0, rebates: 0, net: 0 };

    // Check if there are separate tax line items
    const hasSeparateTaxItems = folio.line_items.some(item =>
      !item.is_voided && item.item_type === 'tax' && item.amount !== 0
    );

    let original = 0;
    let rebates = 0;

    for (const item of folio.line_items) {
      if (item.is_voided) continue;
      // Skip payment items
      if (item.item_type === 'payment') continue;

      if (item.amount >= 0) {
        // Add amount, and only add embedded tax if no separate tax items
        original += item.amount;
        if (!hasSeparateTaxItems && item.tax_amount) {
          original += item.tax_amount;
        }
      } else {
        // Rebate (negative value)
        rebates += item.amount;
        if (!hasSeparateTaxItems && item.tax_amount) {
          rebates += item.tax_amount;
        }
      }
    }

    return { original, rebates, net: original + rebates };
  }, [folio]);

  // Compute average rate per night from room charges
  const avgRate = useMemo(() => {
    if (!folio?.line_items) return null;
    const roomCharges = folio.line_items.filter(li => li.item_type === 'room_charge' && !li.is_voided && li.amount > 0);
    if (roomCharges.length === 0) return null;
    const totalRoomCharges = roomCharges.reduce((sum, li) => sum + li.amount, 0);
    // Use nights from booking if available, otherwise count distinct dates
    const n = nights && nights > 0
      ? nights
      : new Set(roomCharges.map(li => new Date(li.posted_at || li.created_at).toLocaleDateString('en-CA'))).size;
    return n > 0 ? totalRoomCharges / n : null;
  }, [folio, nights]);

  if (!folio) return null;

  // Use group totals if available, otherwise use individual folio totals
  const displayOriginal = groupTotals ? groupTotals.total_charges : chargesBreakdown.original;
  const displayRebates = chargesBreakdown.rebates;
  const displayNet = groupTotals?.total_charges ?? chargesBreakdown.net;
  const displayPayments = groupTotals?.total_payments ?? folio.total_payments;
  const displayBalance = groupTotals?.total_balance ?? folio.balance;
  const roomCount = groupTotals?.booking_count ?? (linkedRoomFolios?.length || 1);

  // Show rebates card only if there are rebates
  const hasRebates = displayRebates < 0;

  const kpis = [
    {
      label: isGroupBooking && roomCount > 1 ? `Total Charges (${roomCount} Rooms)` : 'Total Charges',
      value: formatCurrency(displayOriginal),
      icon: Receipt,
      color: 'text-neutral-900',
    },
    ...(hasRebates ? [{
      label: 'Rebates',
      value: formatCurrency(displayRebates),
      icon: TrendingDown,
      color: 'text-emerald-600',
    }] : []),
    {
      label: 'Payments',
      value: formatCurrency(displayPayments),
      icon: CreditCard,
      color: 'text-emerald-600',
    },
    {
      label: 'Balance Due',
      value: formatCurrency(displayBalance),
      icon: Wallet,
      color: displayBalance > 0 ? 'text-amber-600' : displayBalance < 0 ? 'text-red-600' : 'text-emerald-600',
    },
    ...(avgRate !== null ? [{
      label: 'Avg Rate/Night',
      value: formatCurrency(avgRate),
      icon: Moon,
      color: 'text-blue-600',
    }] : []),
  ];

  const cols = kpis.length === 4 ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className="space-y-3">
      {/* Group booking indicator */}
      {isGroupBooking && roomCount > 1 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
          <Users className="w-4 h-4 text-purple-600" />
          <span className="text-[12px] font-medium text-purple-700">
            Group Booking: {roomCount} Rooms
          </span>
          <span className="text-[11px] text-purple-500 ml-auto">
            Showing consolidated totals
          </span>
        </div>
      )}

      {/* KPI cards */}
      <div className={`grid ${cols} gap-3`}>
        {kpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl p-4 border border-neutral-200/80">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{kpi.label}</p>
              </div>
              <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Room breakdown for group bookings */}
      {isGroupBooking && linkedRoomFolios && linkedRoomFolios.length > 1 && (
        <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200/80">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">Room Breakdown</p>
          <div className="space-y-2">
            {linkedRoomFolios.map((rf: any) => (
              <div key={rf.folio_id} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-700">
                    Room {rf.room_number || '—'}
                  </span>
                  <span className="text-neutral-400">({rf.room_type || 'Unknown'})</span>
                  {rf.is_parent && (
                    <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-purple-100 text-purple-700 rounded">Master</span>
                  )}
                </div>
                <span className="font-medium text-neutral-900">{formatCurrency(rf.total_charges || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
