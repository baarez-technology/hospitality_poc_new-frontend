/**
 * PostPaymentDialog - Amount + method + type + card fields
 * Also used for refunds (isRefund=true)
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, Check } from 'lucide-react';

const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'neft', label: 'NEFT' },
  { value: 'net_banking', label: 'Net Banking' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'comp', label: 'Complimentary' },
];

const PAYMENT_TYPES = [
  { value: 'full_payment', label: 'Full Payment' },
  { value: 'partial', label: 'Partial Payment' },
  { value: 'deposit', label: 'Deposit' },
];

const CARD_BRANDS = [
  { value: '', label: '—' },
  { value: 'Visa', label: 'Visa' },
  { value: 'Mastercard', label: 'Mastercard' },
  { value: 'Amex', label: 'Amex' },
  { value: 'RuPay', label: 'RuPay' },
  { value: 'Other', label: 'Other' },
];

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-9 pl-3 pr-8 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none flex items-center justify-between transition-colors"
      >
        <span className="text-neutral-800 truncate">{selected?.label || '—'}</span>
        <ChevronDown className={`absolute right-2.5 w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-[201] overflow-hidden">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] flex items-center justify-between transition-colors ${
                o.value === value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>{o.label}</span>
              {o.value === value && <Check className="w-3 h-3 text-terra-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PostPaymentDialogProps {
  balance: number;
  isRefund?: boolean;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
}

export default function PostPaymentDialog({ balance, isRefund = false, onSubmit, onClose }: PostPaymentDialogProps) {
  const [amount, setAmount] = useState(isRefund ? 0 : Math.max(0, balance));
  const [method, setMethod] = useState('card');
  const [paymentType, setPaymentType] = useState(isRefund ? 'refund' : 'full_payment');
  const [transactionId, setTransactionId] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [cardBrand, setCardBrand] = useState('');
  const [upiId, setUpiId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (amount <= 0) return;
    if (isRefund && !reason.trim()) return;
    setSubmitting(true);
    try {
      if (isRefund) {
        await onSubmit({ amount, reason: reason.trim(), method, notes: notes.trim() || undefined });
      } else {
        await onSubmit({
          amount,
          method,
          payment_type: paymentType,
          transaction_id: transactionId.trim() || undefined,
          card_last4: cardLast4.trim() || undefined,
          card_brand: cardBrand.trim() || undefined,
          upi_id: upiId.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }
    } catch { /* parent handles */ }
    setSubmitting(false);
  };

  const inputCls = "w-full h-9 px-3 rounded-lg text-[13px] bg-white border border-neutral-200 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-[15px] font-semibold text-neutral-900">{isRefund ? 'Process Refund' : 'Post Payment'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Amount <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
              className={inputCls}
            />
            {!isRefund && balance > 0 && (
              <p className="text-[11px] text-neutral-400 mt-1">Outstanding balance: ₹{balance.toFixed(2)}</p>
            )}
          </div>

          {/* Method */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Payment Method</label>
            <Select value={method} onChange={setMethod} options={PAYMENT_METHODS} />
          </div>

          {/* Payment Type (non-refund only) */}
          {!isRefund && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Payment Type</label>
              <Select value={paymentType} onChange={setPaymentType} options={PAYMENT_TYPES} />
            </div>
          )}

          {/* Refund reason */}
          {isRefund && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Reason <span className="text-red-500">*</span></label>
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for refund..."
                className={inputCls}
              />
            </div>
          )}

          {/* Card fields */}
          {method === 'card' && !isRefund && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Tx ID</label>
                <input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="TXN..." className={inputCls} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Last 4</label>
                <input
                  value={cardLast4}
                  onChange={e => setCardLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  maxLength={4}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Brand</label>
                <Select value={cardBrand} onChange={setCardBrand} options={CARD_BRANDS} />
              </div>
            </div>
          )}

          {/* UPI fields */}
          {method === 'upi' && !isRefund && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">UPI ID</label>
                <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="name@upi" className={inputCls} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Tx Ref</label>
                <input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="UPI ref number" className={inputCls} />
              </div>
            </div>
          )}

          {/* NEFT / Net Banking fields */}
          {(method === 'neft' || method === 'net_banking') && !isRefund && (
            <div>
              <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Transaction Reference</label>
              <input
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder={method === 'neft' ? 'NEFT reference number' : 'Net banking transaction ID'}
                className={inputCls}
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." className={inputCls} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 flex justify-end gap-2 rounded-b-2xl bg-white">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={amount <= 0 || (isRefund && !reason.trim()) || submitting}
            className={`px-4 py-2 text-[13px] font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isRefund ? 'bg-purple-600 hover:bg-purple-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {submitting ? 'Processing...' : isRefund ? 'Process Refund' : 'Post Payment'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
