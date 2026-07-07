/**
 * PaymentsTab - All payments table + Post Payment button
 */

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import type { Folio, FolioPayment } from '@/types/folio.types';
import PostPaymentDialog from '../dialogs/PostPaymentDialog';

const METHOD_LABELS: Record<string, string> = {
  card: 'Card',
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  neft: 'NEFT',
  net_banking: 'Net Banking',
  btc: 'Bill to Company',
  voucher: 'Voucher',
  comp: 'Complimentary',
};

const STATUS_STYLES: Record<string, string> = {
  captured: 'bg-emerald-50 text-emerald-700',
  authorized: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  refunded: 'bg-purple-50 text-purple-700',
  failed: 'bg-red-50 text-red-700',
};

const TYPE_LABELS: Record<string, string> = {
  deposit: 'Deposit',
  full_payment: 'Full Payment',
  partial: 'Partial',
  refund: 'Refund',
};

interface PaymentsTabProps {
  folio: Folio | null;
  bookingId: number | string;
  onRefresh: () => void;
  onPostPayment: (data: any) => Promise<void>;
  onPostRefund: (data: any) => Promise<void>;
}

export default function PaymentsTab({ folio, bookingId, onRefresh, onPostPayment, onPostRefund }: PaymentsTabProps) {
  const { formatCurrency } = useCurrency();
  const [showPostPayment, setShowPostPayment] = useState(false);
  const [showRefund, setShowRefund] = useState(false);

  if (!folio) return null;

  const payments = folio.payments || [];
  const isClosed = folio.status === 'closed';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-neutral-900">
          Payments ({payments.length})
        </h3>
        {!isClosed && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRefund(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refund
            </button>
            <button
              onClick={() => setShowPostPayment(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Post Payment
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {payments.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-[13px]">
          No payments recorded yet
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-hidden">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200">
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Date</th>
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Type</th>
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Method</th>
                <th className="text-right px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Amount</th>
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Status</th>
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Tx ID</th>
                <th className="text-left px-3 py-2.5 font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Card</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p: FolioPayment) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                  <td className="px-3 py-2.5 text-neutral-500 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-700 font-medium">
                    {TYPE_LABELS[p.payment_type] || p.payment_type}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-600">
                    {METHOD_LABELS[p.method] || p.method}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-semibold ${p.payment_type === 'refund' ? 'text-red-600' : 'text-emerald-600'}`}>
                    {p.payment_type === 'refund' ? '-' : ''}{formatCurrency(p.amount)}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${STATUS_STYLES[p.status] || 'bg-neutral-50 text-neutral-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500 font-mono text-[11px]">
                    {p.transaction_id || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500 text-[11px]">
                    {p.card_last4 ? `${p.card_brand || ''} ****${p.card_last4}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Post Payment Dialog */}
      {showPostPayment && (
        <PostPaymentDialog
          balance={folio.balance}
          onSubmit={async (data) => { await onPostPayment(data); setShowPostPayment(false); }}
          onClose={() => setShowPostPayment(false)}
        />
      )}

      {/* Refund Dialog */}
      {showRefund && (
        <PostPaymentDialog
          balance={folio.balance}
          isRefund
          onSubmit={async (data) => { await onPostRefund(data); setShowRefund(false); }}
          onClose={() => setShowRefund(false)}
        />
      )}
    </div>
  );
}
