/**
 * AdjustChargeDialog - Record a payment against the folio
 * Records money received from guest to reduce balance due
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Banknote, CreditCard, Smartphone, Building2 } from 'lucide-react';
import type { FolioLineItem } from '@/types/folio.types';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'neft', label: 'NEFT', icon: Building2 },
  { value: 'net_banking', label: 'Net Banking', icon: Building2 },
];

interface AdjustChargeDialogProps {
  item: FolioLineItem;
  balance: number; // Current folio balance
  onSubmit: (data: { adjustment_amount: number; reason: string; payment_method: string }) => Promise<void>;
  onClose: () => void;
}

export default function AdjustChargeDialog({ item, balance, onSubmit, onClose }: AdjustChargeDialogProps) {
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);

  const newBalance = Math.max(0, balance - paymentAmount);

  const handleSubmit = async () => {
    if (paymentAmount <= 0 || !reason.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        adjustment_amount: paymentAmount,
        reason: reason.trim(),
        payment_method: paymentMethod
      });
    } catch { /* parent handles */ }
    setSubmitting(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-[15px] font-semibold text-neutral-900">Record Payment</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="bg-neutral-50 rounded-lg px-3 py-2 text-[12px]">
            <p className="text-neutral-500">Current Balance Due: <span className="font-semibold text-amber-600">₹{balance.toFixed(2)}</span></p>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(method => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[11px] font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">
              Payment Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={paymentAmount || ''}
              onChange={e => setPaymentAmount(Math.max(0, Number(e.target.value)))}
              placeholder="Enter amount received..."
              className="w-full h-10 px-3 rounded-lg text-[14px] bg-white border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Amount received from guest
            </p>
          </div>

          {paymentAmount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-[12px]">
              <p className="text-emerald-700 font-medium">After payment:</p>
              <p className="text-emerald-600">
                ₹{balance.toFixed(2)} − ₹{paymentAmount.toFixed(2)} = <span className="font-bold">₹{newBalance.toFixed(2)}</span> balance due
              </p>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">Payment Note <span className="text-red-500">*</span></label>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g., Advance payment, Partial payment..."
              className="w-full h-10 px-3 rounded-lg text-[13px] bg-white border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-neutral-100 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={paymentAmount <= 0 || !reason.trim() || submitting}
            className="px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {submitting ? 'Recording...' : `Record Payment ₹${paymentAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
