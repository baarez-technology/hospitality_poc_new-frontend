/**
 * SettleFolioDialog - Full or Partial settlement with payment method selection
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Banknote, CreditCard, Smartphone, Building2, CheckCircle2 } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'upi', label: 'UPI', icon: Smartphone },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
  { value: 'neft', label: 'NEFT', icon: Building2 },
  { value: 'net_banking', label: 'Net Banking', icon: Building2 },
];

interface SettleFolioDialogProps {
  balance: number;
  onSettle: (data: { payment_method: string; amount?: number; isPartial: boolean }) => Promise<void>;
  onBtcSettle: () => void;
  onClose: () => void;
  hasCorporateAccounts: boolean;
}

type Step = 'choose' | 'full' | 'partial';

export default function SettleFolioDialog({
  balance,
  onSettle,
  onBtcSettle,
  onClose,
  hasCorporateAccounts
}: SettleFolioDialogProps) {
  const { formatCurrency } = useCurrency();
  const [step, setStep] = useState<Step>('choose');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [partialAmount, setPartialAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const remainingAfterPartial = Math.max(0, balance - partialAmount);

  const handleFullSettle = async () => {
    setSubmitting(true);
    try {
      await onSettle({ payment_method: paymentMethod, isPartial: false });
    } catch { /* parent handles */ }
    setSubmitting(false);
  };

  const handlePartialSettle = async () => {
    if (partialAmount <= 0 || partialAmount > balance) return;
    setSubmitting(true);
    try {
      await onSettle({ payment_method: paymentMethod, amount: partialAmount, isPartial: true });
    } catch { /* parent handles */ }
    setSubmitting(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-[15px] font-semibold text-neutral-900">
            {step === 'choose' && 'Settle Folio'}
            {step === 'full' && 'Full Settlement'}
            {step === 'partial' && 'Partial Settlement'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {/* Step 1: Choose Full or Partial */}
          {step === 'choose' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-center">
                <p className="text-[12px] text-amber-600 mb-1">Outstanding Balance</p>
                <p className="text-2xl font-bold text-amber-700">{formatCurrency(balance)}</p>
              </div>

              <p className="text-[13px] text-neutral-600 text-center">
                How would you like to settle this folio?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('full')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:border-emerald-400 transition-all"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <span className="text-[14px] font-semibold text-emerald-700">Full Settlement</span>
                  <span className="text-[11px] text-emerald-600">Pay {formatCurrency(balance)}</span>
                </button>

                <button
                  onClick={() => setStep('partial')}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-400 transition-all"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-neutral-400 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-neutral-400" />
                  </div>
                  <span className="text-[14px] font-semibold text-neutral-700">Partial Payment</span>
                  <span className="text-[11px] text-neutral-500">Enter amount</span>
                </button>
              </div>

              {hasCorporateAccounts && (
                <>
                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-200" />
                    </div>
                    <span className="relative bg-white px-2 text-[11px] text-neutral-400">OR</span>
                  </div>
                  <button
                    onClick={onBtcSettle}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-terra-200 bg-terra-50 hover:border-terra-400 transition-all"
                  >
                    <Building2 className="w-5 h-5 text-terra-600" />
                    <span className="text-[13px] font-semibold text-terra-700">Bill to Company (BTC)</span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 2a: Full Settlement - Payment Method */}
          {step === 'full' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-center">
                <p className="text-[12px] text-emerald-600 mb-1">Settling Full Balance</p>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(balance)}</p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-neutral-600 mb-2">
                  Payment Method
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
                        <span className="text-[10px] font-medium">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2b: Partial Settlement - Amount + Payment Method */}
          {step === 'partial' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 rounded-lg px-3 py-2 text-[12px]">
                <p className="text-neutral-500">Balance Due: <span className="font-semibold text-amber-600">{formatCurrency(balance)}</span></p>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-neutral-600 mb-1.5">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={balance}
                  step="1"
                  value={partialAmount || ''}
                  onChange={e => setPartialAmount(Math.min(balance, Math.max(0, Number(e.target.value))))}
                  placeholder="Enter amount..."
                  className="w-full h-10 px-3 rounded-lg text-[14px] bg-white border border-neutral-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none"
                />
              </div>

              {partialAmount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[12px]">
                  <p className="text-blue-700">
                    Paying: <span className="font-semibold">{formatCurrency(partialAmount)}</span>
                    <br />
                    Remaining after payment: <span className="font-bold">{formatCurrency(remainingAfterPartial)}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[12px] font-medium text-neutral-600 mb-2">
                  Payment Method
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
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[9px] font-medium">{method.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-neutral-100 flex justify-between">
          {step !== 'choose' ? (
            <>
              <button
                onClick={() => setStep('choose')}
                className="px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={step === 'full' ? handleFullSettle : handlePartialSettle}
                  disabled={submitting || (step === 'partial' && (partialAmount <= 0 || partialAmount > balance))}
                  className="px-4 py-2 text-[13px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {submitting ? 'Processing...' : step === 'full' ? `Pay ${formatCurrency(balance)}` : `Pay ${formatCurrency(partialAmount)}`}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors ml-auto"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
