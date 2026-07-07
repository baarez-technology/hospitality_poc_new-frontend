/**
 * CheckoutDialog — Pre-checkout folio balance gate
 * Shows per-window balance summary. Blocks checkout unless all windows = $0.
 * Exception: company folios (→ AR) are marked as exempt.
 */

import { useState, useEffect } from 'react';
import { LogOut, AlertTriangle, CheckCircle, Building2, Wallet, X, Loader2, Users } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { folioService } from '@/api/services/folio.service';
import type { Folio } from '@/types/folio.types';

interface CheckoutDialogProps {
  isOpen: boolean;
  booking: any;
  onClose: () => void;
  onCheckout: (force?: boolean) => Promise<boolean>;
  onOpenFolio: (booking: any) => void;
}

interface WindowSummary {
  id: number;
  label: string;
  type: string;
  balance: number;
  status: string;
  exempt: boolean; // company folio with corporate account → will route to AR
}

interface ParentInfo {
  parent_booking_id: number;
  parent_booking_number: string;
  balance_note: string;
}

interface GroupTotals {
  total_charges: number;
  total_payments: number;
  total_balance: number;
  booking_count: number;
}

interface LinkedRoomFolio {
  booking_id: number;
  booking_number: string;
  room_number: string;
  room_type: string;
  is_parent: boolean;
  folio_id: number;
  total_charges: number;
  total_payments: number;
  balance: number;
  status: string;
}

interface EarlyCheckoutPreview {
  is_early_checkout: boolean;
  original_nights: number;
  actual_nights: number;
  unused_nights?: number;
  nightly_rate?: number;
  original_total?: number;
  adjusted_total?: number;
  credit_amount?: number;
  current_folio_balance?: number;
  adjusted_balance?: number;
  note?: string;
}

export default function CheckoutDialog({ isOpen, booking, onClose, onCheckout, onOpenFolio }: CheckoutDialogProps) {
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [windows, setWindows] = useState<WindowSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isChildBooking, setIsChildBooking] = useState(false);
  const [parentInfo, setParentInfo] = useState<ParentInfo | null>(null);
  const [isParentBooking, setIsParentBooking] = useState(false);
  const [groupTotals, setGroupTotals] = useState<GroupTotals | null>(null);
  const [linkedRoomFolios, setLinkedRoomFolios] = useState<LinkedRoomFolio[]>([]);
  const [earlyCheckoutPreview, setEarlyCheckoutPreview] = useState<EarlyCheckoutPreview | null>(null);

  const bookingId = booking?.id || booking?.bookingNumber;
  const hasCorporate = !!booking?.corporate_account_id || !!booking?.corporateAccountId;

  // Load folio windows on open
  useEffect(() => {
    if (!isOpen || !bookingId) return;
    setLoading(true);
    setError(null);
    setIsChildBooking(false);
    setParentInfo(null);
    setIsParentBooking(false);
    setGroupTotals(null);
    setLinkedRoomFolios([]);
    setEarlyCheckoutPreview(null);

    const timeoutId = setTimeout(() => {
      setWindows([]);
      setLoading(false);
      setError('Folio check timed out — you may proceed with checkout.');
    }, 10000);

    folioService.listFolios(bookingId).then(res => {
      clearTimeout(timeoutId);

      // Check if this is a child booking (part of multi-room group)
      const isChild = res?.is_child_booking === true;
      setIsChildBooking(isChild);
      if (isChild && res?.parent_info) {
        setParentInfo(res.parent_info);
      }

      // Check if this is a parent/group booking
      const isParent = res?.is_parent_booking === true;
      setIsParentBooking(isParent);
      if (isParent) {
        if (res?.group_totals) {
          setGroupTotals(res.group_totals);
        }
        if (res?.linked_room_folios) {
          setLinkedRoomFolios(res.linked_room_folios);
        }
      }

      // Check for early checkout preview
      if (res?.early_checkout_preview) {
        setEarlyCheckoutPreview(res.early_checkout_preview);
      }

      const folios: Folio[] = Array.isArray(res?.folios) ? res.folios : Array.isArray(res) ? res : [];

      // Get early checkout adjusted balance if available
      const earlyPreview = res?.early_checkout_preview;
      const hasEarlyAdjustment = earlyPreview?.is_early_checkout && typeof earlyPreview?.adjusted_balance === 'number';

      const summaries: WindowSummary[] = folios
        .filter(f => f.status === 'open')
        .map((f, index) => {
          let balance = isChild ? 0 : (typeof f.balance === 'number' ? f.balance : 0);

          // For early checkout, use adjusted balance on first folio window
          if (hasEarlyAdjustment && index === 0 && !isChild) {
            balance = earlyPreview.adjusted_balance ?? balance;
          }

          return {
            id: f.id,
            label: f.window_label || 'A',
            type: f.folio_type || 'guest',
            balance,
            status: f.status,
            exempt: f.folio_type === 'company' && hasCorporate,
          };
        });
      setWindows(summaries);
      setLoading(false);
    }).catch(() => {
      clearTimeout(timeoutId);
      // No folios — that's OK, checkout can proceed
      setWindows([]);
      setLoading(false);
    });
  }, [isOpen, bookingId, hasCorporate]);

  const unsettled = windows.filter(w => w.balance > 0 && !w.exempt);
  const exempt = windows.filter(w => w.balance > 0 && w.exempt);
  const settled = windows.filter(w => w.balance <= 0);

  // For early checkout, use the adjusted balance instead of current folio balance
  const effectiveBalance = earlyCheckoutPreview?.is_early_checkout && typeof earlyCheckoutPreview?.adjusted_balance === 'number'
    ? earlyCheckoutPreview.adjusted_balance
    : unsettled.reduce((sum, w) => sum + w.balance, 0);

  // Checkout permission logic:
  // - Child bookings can always checkout (payment is on parent booking)
  // - Parent bookings check group totals balance
  // - Regular bookings check individual window balances (or adjusted balance for early checkout)
  const canCheckout = isChildBooking ||
    (isParentBooking && groupTotals ? groupTotals.total_balance <= 0 : effectiveBalance <= 0);

  // For display purposes, use group balance for parent bookings, or adjusted balance for early checkout
  const totalUnsettled = isParentBooking && groupTotals
    ? groupTotals.total_balance
    : effectiveBalance;

  const handleCheckout = async (force = false) => {
    setChecking(true);
    setError(null);
    try {
      const success = await onCheckout(force);
      if (success) onClose();
      else setError('Checkout failed. Please try again.');
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (typeof detail === 'object' && detail?.unsettled_windows) {
        setError(`${detail.message} (${formatCurrency(detail.total_unsettled)} unsettled)`);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError('Checkout failed');
      }
    }
    setChecking(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isParentBooking
                ? 'bg-purple-50 border-purple-200'
                : 'bg-terra-50 border-terra-200'
            }`}>
              {isParentBooking ? (
                <Users className="w-5 h-5 text-purple-600" />
              ) : (
                <LogOut className="w-5 h-5 text-terra-600" />
              )}
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-neutral-900">
                {isParentBooking ? 'Group Check Out' : 'Check Out'}
              </h3>
              <p className="text-[12px] text-neutral-500">
                {booking?.guest}
                {isParentBooking && groupTotals ? (
                  <span> &middot; {groupTotals.booking_count} Room{groupTotals.booking_count > 1 ? 's' : ''}</span>
                ) : (
                  <span> &middot; Room {booking?.room}</span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-terra-600 animate-spin" />
              <span className="ml-2 text-[13px] text-neutral-500">Checking folio balances...</span>
            </div>
          ) : isChildBooking ? (
            /* Child booking - show special message */
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-medium text-blue-800">Part of Group Booking</p>
                <p className="text-[11px] text-blue-600 mt-0.5">
                  Payment is collected at the main booking
                  {parentInfo?.parent_booking_number && (
                    <span className="font-medium"> ({parentInfo.parent_booking_number})</span>
                  )}
                </p>
                <p className="text-[11px] text-blue-500 mt-1">
                  This room can be checked out without additional payment.
                </p>
              </div>
            </div>
          ) : isParentBooking && groupTotals ? (
            /* Parent/Group booking - show consolidated totals */
            <>
              <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                <Users className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-purple-800">Group Booking Master</p>
                  <p className="text-[11px] text-purple-600 mt-0.5">
                    This booking includes {groupTotals.booking_count} room{groupTotals.booking_count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Group totals summary */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Group Totals</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-[11px] text-neutral-500">Total Charges</p>
                    <p className="text-[14px] font-semibold text-neutral-800">{formatCurrency(groupTotals.total_charges)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500">Payments</p>
                    <p className="text-[14px] font-semibold text-emerald-600">{formatCurrency(groupTotals.total_payments)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-neutral-500">Balance Due</p>
                    <p className={`text-[14px] font-bold ${groupTotals.total_balance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatCurrency(groupTotals.total_balance)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room breakdown */}
              {linkedRoomFolios.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Room Breakdown</h4>
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                    {linkedRoomFolios.map((rf) => (
                      <div
                        key={rf.folio_id}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                          rf.is_parent
                            ? 'bg-purple-50/50 border-purple-200/60'
                            : 'bg-neutral-50/50 border-neutral-200/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-neutral-700">
                            {rf.room_number ? `Room ${rf.room_number}` : 'Unassigned'}
                          </span>
                          <span className="text-[9px] text-neutral-400">({rf.room_type})</span>
                          {rf.is_parent && (
                            <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">Master</span>
                          )}
                          {rf.status === 'checked_out' && (
                            <span className="text-[8px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded font-medium">Checked Out</span>
                          )}
                        </div>
                        <span className="text-[12px] font-semibold text-neutral-700">{formatCurrency(rf.total_charges)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Balance status */}
              {groupTotals.total_balance > 0 ? (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-amber-800">
                      {formatCurrency(groupTotals.total_balance)} outstanding balance
                    </p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      Settle the group balance before checkout, or force checkout to proceed.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-emerald-800">Group balance settled</p>
                    <p className="text-[11px] text-emerald-600">Ready for checkout</p>
                  </div>
                </div>
              )}
            </>
          ) : windows.length === 0 ? (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-[13px] font-medium text-emerald-800">No open folios</p>
                <p className="text-[11px] text-emerald-600">Ready for checkout</p>
              </div>
            </div>
          ) : (
            <>
              {/* Folio windows summary */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Folio Windows</h4>

                {/* Settled windows */}
                {settled.map(w => (
                  <div key={w.id} className="flex items-center justify-between px-3 py-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-[12px] font-medium text-neutral-700">
                        Window {w.label}
                      </span>
                      <span className="text-[10px] text-neutral-400 capitalize">({w.type})</span>
                    </div>
                    <span className="text-[12px] font-semibold text-emerald-600">{formatCurrency(0)}</span>
                  </div>
                ))}

                {/* Exempt company windows (→ AR) */}
                {exempt.map(w => (
                  <div key={w.id} className="flex items-center justify-between px-3 py-2.5 bg-blue-50/60 border border-blue-200/60 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span className="text-[12px] font-medium text-neutral-700">
                        Window {w.label}
                      </span>
                      <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded font-medium">BTC → AR</span>
                    </div>
                    <span className="text-[12px] font-semibold text-blue-600">{formatCurrency(w.balance)}</span>
                  </div>
                ))}

                {/* Unsettled windows — blocking checkout */}
                {unsettled.map(w => (
                  <div key={w.id} className="flex items-center justify-between px-3 py-2.5 bg-amber-50/60 border border-amber-200/60 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-amber-500" />
                      <span className="text-[12px] font-medium text-neutral-700">
                        Window {w.label}
                      </span>
                      <span className="text-[10px] text-neutral-400 capitalize">({w.type})</span>
                    </div>
                    <span className="text-[12px] font-bold text-amber-600">{formatCurrency(w.balance)}</span>
                  </div>
                ))}
              </div>

              {/* Early Checkout Info */}
              {earlyCheckoutPreview?.is_early_checkout && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span className="text-[12px] font-semibold text-blue-800">Early Checkout</span>
                  </div>
                  <p className="text-[11px] text-blue-700">
                    Checking out after {earlyCheckoutPreview.actual_nights} of {earlyCheckoutPreview.original_nights} booked nights.
                  </p>
                  {earlyCheckoutPreview.credit_amount && earlyCheckoutPreview.credit_amount > 0 && (
                    <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <span className="text-[11px] text-blue-700">
                        Credit for {earlyCheckoutPreview.unused_nights} unused night(s):
                      </span>
                      <span className="text-[12px] font-semibold text-emerald-600">
                        -{formatCurrency(earlyCheckoutPreview.credit_amount)}
                      </span>
                    </div>
                  )}
                  {typeof earlyCheckoutPreview.adjusted_balance === 'number' && (
                    <div className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <span className="text-[11px] font-medium text-blue-800">Adjusted Balance Due:</span>
                      <span className="text-[13px] font-bold text-blue-900">
                        {formatCurrency(earlyCheckoutPreview.adjusted_balance)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Warning or ready message */}
              {!canCheckout ? (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-amber-800">
                      {formatCurrency(totalUnsettled)} unsettled across {unsettled.length} window{unsettled.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      Settle all folio windows before checkout, or force checkout to proceed with outstanding balance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-medium text-emerald-800">All balances settled</p>
                    <p className="text-[11px] text-emerald-600">
                      {exempt.length > 0 ? `${exempt.length} company window${exempt.length > 1 ? 's' : ''} will be routed to AR` : 'Ready for checkout'}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-[12px] text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!canCheckout && !loading && windows.length > 0 && (
              <button
                onClick={() => { onClose(); onOpenFolio(booking); }}
                className="px-4 py-2 text-[12px] font-medium text-terra-700 bg-terra-50 hover:bg-terra-100 border border-terra-200 rounded-lg transition-colors"
              >
                Open Folio
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            {canCheckout ? (
              <button
                onClick={() => handleCheckout(false)}
                disabled={checking || loading}
                className="px-5 py-2 text-[13px] text-white bg-terra-600 rounded-lg hover:bg-terra-700 disabled:opacity-50 flex items-center gap-2"
              >
                {checking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Checkout
              </button>
            ) : (
              <button
                onClick={() => handleCheckout(true)}
                disabled={checking || loading}
                className="px-5 py-2 text-[13px] text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                {checking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Force Checkout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
