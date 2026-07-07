/**
 * Event Builder — 3-step wizard with persistent pricing sidebar.
 * Matches admin design: bg-[#F9F7F7], rounded-[10px] cards, proper typography.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BedDouble, UtensilsCrossed, Building2, ChevronRight, Check } from 'lucide-react';
import { useEventBuilder } from '../../../hooks/admin/useEventBuilder';
import EventPricingSidebar from '../../../components/events/EventPricingSidebar';
import RoomBlockStep from '../../../components/events/steps/RoomBlockStep';
import MealPlanStep from '../../../components/events/steps/MealPlanStep';
import VenueServicesStep from '../../../components/events/steps/VenueServicesStep';
import { formatCurrency } from '../../../utils/formatters';
import { Badge } from '../../../components/ui2/Badge';

const fmt = (v: number) => formatCurrency(v, 'INR');

const STEPS = [
  { num: 1, label: 'Room Block', short: 'Rooms', icon: BedDouble },
  { num: 2, label: 'Meal Plan', short: 'Meals', icon: UtensilsCrossed },
  { num: 3, label: 'Venue & Services', short: 'Venue', icon: Building2 },
];

export default function EventBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventId = id ? parseInt(id) : undefined;

  const {
    step, setStep, inquiry, halls, loading, saving, pricing,
    rooms, addRoom, updateRoom, removeRoom,
    meals, toggleMeal, updateMeal,
    venue, selectHall, updateVenue,
    services, toggleService, updateServicePrice,
    saveDraft, confirmAndBlock,
  } = useEventBuilder(eventId);

  // Redirect to inquiries if no event ID — builder requires an inquiry context
  if (!eventId) {
    navigate('/admin/events', { replace: true });
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F7F7] flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-terra-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F7F7]">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              {inquiry ? inquiry.event_name : 'Event Builder'}
            </h1>
            {inquiry && (
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                {inquiry.contact_name} — {inquiry.expected_guests} guests
                {inquiry.start_date && (
                  <> — {new Date(inquiry.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} to {new Date(inquiry.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                )}
              </p>
            )}
          </div>
          {pricing.grandTotal > 0 && (
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Estimated Total</p>
              <p className="text-[20px] font-bold text-terra-700 tabular-nums tracking-tight">{fmt(pricing.grandTotal)}</p>
            </div>
          )}
        </header>

        {/* ── Stepper — underline tab style matching admin ── */}
        <div className="bg-white rounded-[10px] border-b border-neutral-100 overflow-hidden">
          <div className="px-4 sm:px-6 pt-3 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {STEPS.map((s, i) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <button key={s.num} onClick={() => setStep(s.num)}
                  className={`relative px-3 sm:px-5 py-3 text-[12px] sm:text-[13px] font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive ? 'text-neutral-900' : isDone ? 'text-terra-600' : 'text-neutral-400 hover:text-neutral-600'
                  }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    isActive ? 'bg-terra-500 text-white'
                    : isDone ? 'bg-terra-100 text-terra-600'
                    : 'bg-neutral-200 text-neutral-400'
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.short}</span>
                  {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Body: Step content + Pricing sidebar ── */}
        <div className="flex gap-4 items-start">
          {/* Step content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[10px] p-4 sm:p-6">
              {step === 1 && <RoomBlockStep rooms={rooms} onAdd={addRoom} onUpdate={updateRoom} onRemove={removeRoom} />}
              {step === 2 && (
                <MealPlanStep
                  startDate={inquiry?.start_date || rooms[0]?.checkIn || ''}
                  endDate={inquiry?.end_date || rooms[0]?.checkOut || ''}
                  meals={meals} expectedGuests={inquiry?.expected_guests || 50}
                  onToggle={toggleMeal} onUpdate={updateMeal}
                />
              )}
              {step === 3 && (
                <VenueServicesStep
                  halls={halls} venue={venue} services={services}
                  onSelectHall={selectHall} onUpdateVenue={updateVenue}
                  onToggleService={toggleService} onUpdateServicePrice={updateServicePrice}
                />
              )}

              {/* Step navigation */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-100">
                <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}
                  className="h-9 px-4 rounded-lg border border-neutral-200 text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Previous
                </button>
                {step < 3 ? (
                  <button onClick={() => setStep(step + 1)}
                    className="h-9 px-5 rounded-lg bg-terra-600 text-white text-[13px] font-semibold hover:bg-terra-700 flex items-center gap-1.5 transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-[11px] text-neutral-400">Use sidebar to save or confirm →</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing sidebar — sticky, desktop only */}
          <div className="hidden lg:block w-[300px] flex-shrink-0 sticky top-6">
            <div className="bg-white rounded-[10px] overflow-hidden">
              <EventPricingSidebar pricing={pricing} saving={saving} onSaveDraft={saveDraft} onConfirm={confirmAndBlock} />
            </div>
          </div>
        </div>

        {/* Mobile pricing bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-3 flex items-center justify-between z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Total</p>
            <p className="text-[18px] font-bold text-terra-700 tabular-nums">{fmt(Math.round(pricing.grandTotal))}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={saveDraft} disabled={saving}
              className="h-9 px-4 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 disabled:opacity-50">
              Save Draft
            </button>
            <button onClick={confirmAndBlock} disabled={saving || pricing.subtotal === 0}
              className="h-9 px-4 rounded-lg bg-terra-600 text-white text-[12px] font-bold disabled:opacity-50">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
