/**
 * Step 2 — Meal Plan. Uses UI2 Input. Clean grid.
 */
import { Plus, X } from 'lucide-react';
import { MEAL_SLOTS, MEAL_SLOT_LABELS, getDatesInRange, type MealEntry } from '../../../utils/events';
import { formatCurrency } from '../../../utils/formatters';
import { Input } from '../../ui2/Input';

const fmt = (v: number) => formatCurrency(v, 'INR');

interface Props {
  startDate: string; endDate: string; meals: MealEntry[];
  expectedGuests: number;
  onToggle: (date: string, slot: string) => void;
  onUpdate: (date: string, slot: string, field: string, value: any) => void;
}

export default function MealPlanStep({ startDate, endDate, meals, expectedGuests, onToggle, onUpdate }: Props) {
  const dates = getDatesInRange(startDate, endDate);
  const getMeal = (date: string, slot: string) => meals.find(m => m.date === date && m.slot === slot);

  if (dates.length === 0) {
    return (
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">Meal Plan</h3>
        <p className="text-[12px] text-neutral-500">Set event dates in Step 1 first to configure meals.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-neutral-900">Meal Plan</h3>
        <p className="text-[11px] text-neutral-400 mt-0.5">Click a cell to add a meal, then configure pricing</p>
      </div>

      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left py-2 pr-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider w-28">Date</th>
              {MEAL_SLOTS.map(slot => (
                <th key={slot} className="text-center py-2 px-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">{MEAL_SLOT_LABELS[slot]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map(date => {
              const dateLabel = new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <tr key={date} className="border-b border-neutral-50">
                  <td className="py-3 pr-3">
                    <span className="text-[12px] font-medium text-neutral-700">{dateLabel}</span>
                  </td>
                  {MEAL_SLOTS.map(slot => {
                    const meal = getMeal(date, slot);
                    return (
                      <td key={slot} className="py-2 px-1.5">
                        {meal ? (
                          <div className="bg-terra-50/50 border border-terra-200 rounded-lg p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-semibold text-terra-600 uppercase">{MEAL_SLOT_LABELS[slot]}</span>
                              <button onClick={() => onToggle(date, slot)} className="w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <Input value={meal.packageName} onChange={e => onUpdate(date, slot, 'packageName', e.target.value)} placeholder="Package" size="sm" />
                            <div className="flex gap-1.5">
                              <Input type="number" value={meal.pricePerPlate || ''} onChange={e => onUpdate(date, slot, 'pricePerPlate', parseFloat(e.target.value) || 0)} placeholder="₹/plate" size="sm" />
                              <div className="w-14 flex-shrink-0">
                                <Input type="number" value={meal.guestCount || ''} onChange={e => onUpdate(date, slot, 'guestCount', parseInt(e.target.value) || 0)} placeholder="Pax" size="sm" />
                              </div>
                            </div>
                            {meal.pricePerPlate > 0 && meal.guestCount > 0 && (
                              <p className="text-[10px] text-terra-700 font-semibold text-right tabular-nums">{fmt(meal.pricePerPlate * meal.guestCount)}</p>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => onToggle(date, slot)}
                            className="w-full h-14 rounded-lg border border-dashed border-neutral-200 hover:border-terra-300 hover:bg-terra-50/20 flex items-center justify-center text-neutral-300 hover:text-terra-500 transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {meals.length > 0 && (
        <div className="mt-3 text-right">
          <span className="text-[11px] text-neutral-500">
            Meal total: <span className="font-semibold text-neutral-700 tabular-nums">{fmt(meals.reduce((s, m) => s + m.pricePerPlate * m.guestCount, 0))}</span>
          </span>
        </div>
      )}
    </div>
  );
}
