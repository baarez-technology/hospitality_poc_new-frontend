/**
 * FolioDrawer - Main folio/billing container
 * Replaces PaymentManagementModal with full hotel cashiering system
 */

import { useState, useEffect, useCallback } from 'react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';
import { Printer, ArrowRightLeft, X } from 'lucide-react';
import { folioService } from '@/api/services/folio.service';
import SettleFolioDialog from './dialogs/SettleFolioDialog';
import { corporateService, type CorporateAccount } from '@/api/services/corporate.service';
import type { Folio } from '@/types/folio.types';
import FolioHeader from './FolioHeader';
import FolioSummaryCard from './FolioSummaryCard';
import ChargesTab from './tabs/ChargesTab';
import PaymentsTab from './tabs/PaymentsTab';
import StatementTab from './tabs/StatementTab';
import RoutingTab from './tabs/RoutingTab';
import toast from 'react-hot-toast';

type TabKey = 'charges' | 'payments' | 'statement' | 'routing';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'charges', label: 'Charges' },
  { key: 'payments', label: 'Payments' },
  { key: 'statement', label: 'Statement' },
  { key: 'routing', label: 'Routing' },
];

interface FolioDrawerProps {
  isOpen: boolean;
  booking: any;
  onClose: () => void;
  onPaymentUpdate?: () => void;
}

export default function FolioDrawer({ isOpen, booking, onClose, onPaymentUpdate }: FolioDrawerProps) {
  const { formatCurrency } = useCurrency();
  const [folios, setFolios] = useState<Folio[]>([]);
  const [activeFolioId, setActiveFolioId] = useState<number | null>(null);
  const [activeFolio, setActiveFolio] = useState<Folio | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('charges');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Group booking state
  const [isGroupBooking, setIsGroupBooking] = useState(false);
  const [groupTotals, setGroupTotals] = useState<{ total_charges: number; total_payments: number; total_balance: number; booking_count: number } | null>(null);
  const [linkedRoomFolios, setLinkedRoomFolios] = useState<any[]>([]);

  const bookingId = booking?.id || booking?.bookingNumber;

  // Load folios list - forceRefresh bypasses cache to get fresh data
  const loadFolios = useCallback(async (forceRefresh = false) => {
    if (!bookingId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await folioService.listFolios(bookingId, forceRefresh);
      const list: Folio[] = res.folios || [];
      setFolios(list);

      // Capture group booking information
      setIsGroupBooking(res.is_group_booking || res.is_parent_booking || false);
      setGroupTotals(res.group_totals || null);
      setLinkedRoomFolios(res.linked_room_folios || []);

      // Auto-select first folio if none selected
      if (list.length > 0 && (!activeFolioId || !list.find(f => f.id === activeFolioId))) {
        setActiveFolioId(list[0].id);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load folios');
    }
    setLoading(false);
  }, [bookingId, activeFolioId]);

  // Load active folio detail - forceRefresh bypasses cache
  const loadActiveFolio = useCallback(async (forceRefresh = false) => {
    if (!bookingId || !activeFolioId) { setActiveFolio(null); return; }
    try {
      const res = await folioService.getFolio(bookingId, activeFolioId, forceRefresh);
      setActiveFolio(res.folio || null);
    } catch { setActiveFolio(null); }
  }, [bookingId, activeFolioId]);

  // Load on open - force refresh to get latest folio data
  useEffect(() => {
    if (isOpen && bookingId) {
      // Force refresh when opening drawer to ensure we have latest data
      // This is important after booking edits which may affect folio charges
      loadFolios(true);
    }
  }, [isOpen, bookingId]);

  // Load active folio when selection changes - force refresh for fresh data
  useEffect(() => {
    if (activeFolioId) loadActiveFolio(true);
  }, [activeFolioId, loadActiveFolio]);

  // Refresh helper - always force refresh to get latest data
  const refresh = async () => {
    await loadFolios(true);
    await loadActiveFolio(true);
  };

  // Auto-create folio if none exists
  const handleAutoCreate = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      await folioService.autoCreateFolio(bookingId);
      await loadFolios();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to create folio');
    }
    setLoading(false);
  };

  // ── Charge actions ────────────────────────────────────────────
  const handlePostCharge = async (data: any) => {
    if (!activeFolioId) return;
    await folioService.postCharge(bookingId, activeFolioId, data);
    await refresh();
  };

  const handleAdjustCharge = async (itemId: number, data: any) => {
    if (!activeFolioId) return;
    await folioService.adjustCharge(bookingId, activeFolioId, itemId, data);
    await refresh();
  };

  const handleVoidCharge = async (itemId: number) => {
    if (!activeFolioId) return;
    await folioService.voidCharge(bookingId, activeFolioId, itemId);
    await refresh();
  };

  const handleSplitCharge = async (itemId: number, splits: any[]) => {
    if (!activeFolioId) return;
    await folioService.splitCharge(bookingId, activeFolioId, itemId, splits);
    await refresh();
  };

  const handleTransferCharge = async (itemIds: number[], targetFolioId: number) => {
    await folioService.transferCharges(bookingId, { line_item_ids: itemIds, target_folio_id: targetFolioId });
    await refresh();
  };

  // ── Payment actions ───────────────────────────────────────────
  const handlePostPayment = async (data: any) => {
    if (!activeFolioId) return;
    await folioService.postPayment(bookingId, activeFolioId, data);
    await refresh();
    onPaymentUpdate?.();
  };

  const handlePostRefund = async (data: any) => {
    if (!activeFolioId) return;
    await folioService.postRefund(bookingId, activeFolioId, data);
    await refresh();
    onPaymentUpdate?.();
  };

  // ── BTC state ───────────────────────────────────────────────
  const [showSettleMenu, setShowSettleMenu] = useState(false);
  const [corpAccounts, setCorpAccounts] = useState<CorporateAccount[]>([]);
  const [selectedCorpId, setSelectedCorpId] = useState<number | null>(null);
  const [btcSettling, setBtcSettling] = useState(false);

  // Load corporate accounts for BTC option
  useEffect(() => {
    corporateService.listAccounts({ status: 'active' }).then(res => {
      setCorpAccounts(res.accounts || []);
    }).catch(() => {});
  }, []);

  // ── Settle ────────────────────────────────────────────────────
  const handleSettle = async (method?: string) => {
    if (!activeFolioId || !activeFolio) return;

    // If no balance, just close the folio
    if (activeFolio.balance <= 0) {
      if (!window.confirm('Settle and close this folio?')) return;
      try {
        await folioService.settleFolio(bookingId, activeFolioId);
        await refresh();
        onPaymentUpdate?.();
        toast.success('Folio settled');
      } catch (e: any) {
        toast.error(e?.response?.data?.detail || 'Failed to settle folio');
      }
      return;
    }

    // Default: show settle dialog
    setShowSettleMenu(true);
  };

  // Handle settlement from dialog
  const handleSettleFromDialog = async (data: { payment_method: string; amount?: number; isPartial: boolean }) => {
    if (!activeFolioId || !activeFolio) return;

    try {
      if (data.isPartial && data.amount) {
        // Partial settlement - post a payment first
        await folioService.postPayment(bookingId, activeFolioId, {
          amount: data.amount,
          method: data.payment_method,
          payment_type: 'partial',
          notes: 'Partial settlement payment',
        });
        toast.success(`Payment of ${formatCurrency(data.amount)} recorded`);
      } else {
        // Full settlement
        await folioService.settleFolio(bookingId, activeFolioId, { payment_method: data.payment_method });
        toast.success('Folio settled');
      }
      setShowSettleMenu(false);
      await refresh();
      onPaymentUpdate?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Settlement failed');
    }
  };

  const handleBtcSettle = async () => {
    if (!activeFolioId || !selectedCorpId) return;
    try {
      await folioService.settleFolio(bookingId, activeFolioId, {
        payment_method: 'btc',
        corporate_account_id: selectedCorpId,
      } as any);
      await refresh();
      onPaymentUpdate?.();
      toast.success('Folio settled via BTC — charges posted to AR');
      setBtcSettling(false);
      setSelectedCorpId(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'BTC settlement failed');
    }
  };

  // ── Cross-Booking Transfer ──────────────────────────────────
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [transferSelectedItems, setTransferSelectedItems] = useState<number[]>([]);

  const chargeItems = activeFolio?.line_items?.filter((li: any) => li.item_type !== 'payment' && !li.is_voided) || [];

  const handleCrossBookingTransfer = async () => {
    if (!transferTargetId || transferSelectedItems.length === 0) return;
    try {
      await folioService.crossBookingTransfer(bookingId, {
        line_item_ids: transferSelectedItems,
        target_booking_id: parseInt(transferTargetId),
        notes: transferNotes || undefined,
      });
      toast.success('Charges transferred to booking #' + transferTargetId);
      setShowTransferModal(false);
      setTransferTargetId('');
      setTransferNotes('');
      setTransferSelectedItems([]);
      await refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Transfer failed');
    }
  };

  // Print / Copy of Folio
  const handlePrintFolio = async () => {
    if (!activeFolioId) return;
    try {
      const res = await folioService.printFolio(bookingId, activeFolioId);
      const printCount = res.print_count || res.data?.print_count;
      const label = printCount === 1 ? 'Original' : `Copy of Folio (#${printCount})`;
      toast.success(`${label} generated`);
      await refresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Print failed');
    }
  };

  if (!booking) return null;

  // No folios — show initialize prompt
  const hasNoFolios = !loading && folios.length === 0;

  const drawerHeader = (
    <FolioHeader
      booking={booking}
      folios={folios}
      activeFolioId={activeFolioId}
      onSelectFolio={setActiveFolioId}
    />
  );

  // Use group balance if available, otherwise individual folio balance
  const displayBalance = groupTotals?.total_balance ?? activeFolio?.balance ?? 0;
  const roomCount = groupTotals?.booking_count ?? linkedRoomFolios?.length ?? 1;

  const drawerFooter = activeFolio && activeFolio.status === 'open' ? (
    <div className="flex items-center justify-between w-full relative">
      <div className="flex items-center gap-3">
        <div className="text-[13px]">
          <span className="text-neutral-500">Balance{isGroupBooking && roomCount > 1 ? ` (${roomCount} Rooms)` : ''}: </span>
          <span className={`font-bold ${displayBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {formatCurrency(displayBalance)}
          </span>
        </div>
        <button onClick={handlePrintFolio} className="p-1.5 rounded-lg hover:bg-neutral-100" title="Print / Copy of Folio">
          <Printer size={16} className="text-neutral-500" />
        </button>
        <button onClick={() => setShowTransferModal(true)} className="p-1.5 rounded-lg hover:bg-neutral-100" title="Transfer to Another Booking">
          <ArrowRightLeft size={16} className="text-neutral-500" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onClose}>Close</Button>
        {activeFolio.balance > 0 ? (
          <Button variant="primary" onClick={() => handleSettle()}>
            Settle & Pay
          </Button>
        ) : (
          <Button variant="primary" onClick={() => handleSettle()}>
            Settle Folio
          </Button>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-between w-full">
      <button onClick={handlePrintFolio} className="p-1.5 rounded-lg hover:bg-neutral-100" title="Print / Copy of Folio">
        <Printer size={16} className="text-neutral-500" />
      </button>
      <Button variant="outline" onClick={onClose}>Close</Button>
    </div>
  );

  return (
    <>
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={folios.length > 0 ? drawerHeader : undefined}
      title={folios.length === 0 ? 'Billing & Folio' : undefined}
      subtitle={folios.length === 0 ? `${booking?.guest} · Booking #${bookingId}` : undefined}
      maxWidth="max-w-4xl"
      footer={hasNoFolios ? undefined : drawerFooter}
      noPadding
    >
      {/* Loading */}
      {loading && folios.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-terra-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-neutral-400">Loading folio...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700">
          {error}
        </div>
      )}

      {/* No folio — Initialize */}
      {hasNoFolios && !error && (
        <div className="flex items-center justify-center py-20 px-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">No Folio Found</h3>
            <p className="text-[13px] text-neutral-500 mb-6">
              Initialize a folio to start tracking charges and payments for this booking.
            </p>
            <Button variant="primary" onClick={handleAutoCreate}>
              Initialize Folio
            </Button>
          </div>
        </div>
      )}

      {/* Main content */}
      {folios.length > 0 && (
        <div className="px-6 py-5 space-y-5">
          {/* Summary card */}
          <FolioSummaryCard
            folio={activeFolio}
            nights={(() => {
              const arr = booking?.arrival_date || booking?.checkIn;
              const dep = booking?.departure_date || booking?.checkOut;
              if (!arr || !dep) return booking?.nights || undefined;
              return Math.max(1, Math.round((new Date(dep).getTime() - new Date(arr).getTime()) / 86400000));
            })()}
            isGroupBooking={isGroupBooking}
            groupTotals={groupTotals}
            linkedRoomFolios={linkedRoomFolios}
          />

          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b border-neutral-200">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-[12px] font-medium transition-all duration-150 border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-terra-600 text-terra-700'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'charges' && (
            <ChargesTab
              folio={activeFolio}
              bookingId={bookingId}
              booking={booking}
              folios={folios}
              onRefresh={refresh}
              onPostCharge={handlePostCharge}
              onAdjustCharge={handleAdjustCharge}
              onVoidCharge={handleVoidCharge}
              onSplitCharge={handleSplitCharge}
              onTransferCharge={handleTransferCharge}
              isGroupBooking={isGroupBooking}
              groupTotals={groupTotals}
            />
          )}
          {activeTab === 'payments' && (
            <PaymentsTab
              folio={activeFolio}
              bookingId={bookingId}
              onRefresh={refresh}
              onPostPayment={handlePostPayment}
              onPostRefund={handlePostRefund}
            />
          )}
          {activeTab === 'statement' && (
            <StatementTab
              folio={activeFolio}
              bookingId={bookingId}
              booking={booking}
            />
          )}
          {activeTab === 'routing' && (
            <RoutingTab
              bookingId={bookingId}
              folios={folios}
            />
          )}
        </div>
      )}
    </Drawer>

    {/* Settle Folio Dialog */}
    {showSettleMenu && activeFolio && activeFolio.balance > 0 && (
      <SettleFolioDialog
        balance={activeFolio.balance}
        onSettle={handleSettleFromDialog}
        onBtcSettle={() => {
          setShowSettleMenu(false);
          setBtcSettling(true);
        }}
        onClose={() => setShowSettleMenu(false)}
        hasCorporateAccounts={corpAccounts.length > 0}
      />
    )}

    {/* BTC Corporate Account Selector Dialog */}
    {btcSettling && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
          <div className="px-5 py-4 border-b border-neutral-200">
            <h3 className="text-[15px] font-semibold text-neutral-900">Bill to Company</h3>
            <p className="text-[12px] text-neutral-500 mt-1">
              Settle {formatCurrency(activeFolio?.balance || 0)} to corporate AR account
            </p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <label className="block text-[12px] font-medium text-neutral-600 mb-1">Select Corporate Account</label>
            <select
              className="w-full px-3 py-2 text-[13px] border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/30"
              value={selectedCorpId || ''}
              onChange={e => setSelectedCorpId(parseInt(e.target.value) || null)}
            >
              <option value="">— Select —</option>
              {corpAccounts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.company_name} (Limit: {formatCurrency(c.credit_limit || 0)})
                </option>
              ))}
            </select>
            {selectedCorpId && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[12px] text-amber-800">
                AR balance for this company: <strong>{formatCurrency(corpAccounts.find(c => c.id === selectedCorpId)?.ar_balance || 0)}</strong>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-neutral-200">
            <button
              onClick={() => { setBtcSettling(false); setSelectedCorpId(null); }}
              className="px-4 py-2 text-[13px] text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBtcSettle}
              disabled={!selectedCorpId}
              className="px-4 py-2 text-[13px] text-white bg-terra-600 rounded-lg hover:bg-terra-700 disabled:opacity-50"
            >
              Confirm BTC Settlement
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Cross-Booking Transfer Modal */}
    {showTransferModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <h3 className="text-[15px] font-semibold text-neutral-900">Transfer to Another Booking</h3>
            <button onClick={() => setShowTransferModal(false)} className="p-1 rounded-lg hover:bg-neutral-100"><X size={18} /></button>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1">Target Booking ID *</label>
              <input
                type="number"
                className="w-full px-3 py-2 text-[13px] border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/30"
                placeholder="e.g. 42"
                value={transferTargetId}
                onChange={e => setTransferTargetId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1">Select Charges to Transfer</label>
              <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-lg divide-y divide-neutral-100">
                {chargeItems.length === 0 ? (
                  <p className="px-3 py-4 text-[12px] text-neutral-400 text-center">No charges available</p>
                ) : chargeItems.map((li: any) => (
                  <label key={li.id} className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-neutral-300"
                      checked={transferSelectedItems.includes(li.id)}
                      onChange={e => {
                        setTransferSelectedItems(prev =>
                          e.target.checked ? [...prev, li.id] : prev.filter(id => id !== li.id)
                        );
                      }}
                    />
                    <span className="text-[12px] text-neutral-700 flex-1">{li.description}</span>
                    <span className="text-[12px] font-mono text-neutral-900">{formatCurrency(li.amount)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1">Notes</label>
              <input
                className="w-full px-3 py-2 text-[13px] border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-terra-500/30"
                placeholder="Optional transfer notes"
                value={transferNotes}
                onChange={e => setTransferNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-neutral-200">
            <button
              onClick={() => { setShowTransferModal(false); setTransferSelectedItems([]); }}
              className="px-4 py-2 text-[13px] text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCrossBookingTransfer}
              disabled={!transferTargetId || transferSelectedItems.length === 0}
              className="px-4 py-2 text-[13px] text-white bg-terra-600 rounded-lg hover:bg-terra-700 disabled:opacity-50"
            >
              Transfer {transferSelectedItems.length} Item{transferSelectedItems.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
