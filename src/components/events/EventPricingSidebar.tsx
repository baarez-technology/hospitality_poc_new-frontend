/**
 * Event Pricing Sidebar — Matches admin design. Inside rounded-[10px] card.
 * Buttons inside the card. Clean empty state. ₹ via formatCurrency.
 */
import { BedDouble, UtensilsCrossed, Building2, Sparkles, Lock, Save } from 'lucide-react';
import { GST_RATES } from '../../utils/events';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../ui2/Button';

const fmt = (v: number) => formatCurrency(v, 'INR');

interface PricingData {
  roomsTotal: number; mealsTotal: number; venueTotal: number; servicesTotal: number;
  subtotal: number;
  roomsGST: number; mealsGST: number; venueGST: number; servicesGST: number; totalGST: number;
  grandTotal: number;
}

interface Props {
  pricing: PricingData;
  saving: boolean;
  onSaveDraft: () => void;
  onConfirm: () => void;
}

function LineItem({ icon: Icon, label, amount, gst, gstRate }: {
  icon: any; label: string; amount: number; gst: number; gstRate: number;
}) {
  if (amount === 0) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b border-neutral-50 last:border-0">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-3 h-3 text-neutral-500" />
        </div>
        <div>
          <p className="text-[12px] font-medium text-neutral-800">{label}</p>
          {gst > 0 && <p className="text-[10px] text-neutral-400 mt-0.5">GST @{Math.round(gstRate * 100)}%: {fmt(gst)}</p>}
        </div>
      </div>
      <span className="text-[13px] font-semibold text-neutral-900 tabular-nums">{fmt(amount)}</span>
    </div>
  );
}

export default function EventPricingSidebar({ pricing, saving, onSaveDraft, onConfirm }: Props) {
  const hasItems = pricing.subtotal > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100">
        <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Pricing Summary</p>
        <p className="text-[9px] text-neutral-400 mt-0.5">Live · Auto-updated</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-2">
        {hasItems ? (
          <>
            <LineItem icon={BedDouble} label="Rooms" amount={pricing.roomsTotal} gst={pricing.roomsGST} gstRate={GST_RATES.rooms} />
            <LineItem icon={UtensilsCrossed} label="Meals" amount={pricing.mealsTotal} gst={pricing.mealsGST} gstRate={GST_RATES.food} />
            <LineItem icon={Building2} label="Venue" amount={pricing.venueTotal} gst={pricing.venueGST} gstRate={GST_RATES.services} />
            <LineItem icon={Sparkles} label="Services" amount={pricing.servicesTotal} gst={pricing.servicesGST} gstRate={GST_RATES.services} />

            {/* Totals */}
            <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1.5">
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>Subtotal</span><span className="tabular-nums">{fmt(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>Total GST</span><span className="tabular-nums">{fmt(pricing.totalGST)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-100">
                <span className="text-[13px] font-semibold text-neutral-900">Grand Total</span>
                <span className="text-[17px] font-bold text-terra-700 tabular-nums">{fmt(pricing.grandTotal)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
            <p className="text-[12px] font-medium text-neutral-500">No items added yet</p>
            <p className="text-[10px] text-neutral-400 mt-0.5 text-center">Pricing will appear as you build the event</p>
          </div>
        )}
      </div>

      {/* Actions — inside the card */}
      <div className="px-4 py-3 border-t border-neutral-100 space-y-2">
        <Button variant="outline-neutral" onClick={onSaveDraft} disabled={saving} className="w-full">
          <Save className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={saving || !hasItems} className="w-full">
          <Lock className="w-3.5 h-3.5 mr-1.5" /> {saving ? 'Processing...' : 'Confirm & Block'}
        </Button>
      </div>
    </div>
  );
}
