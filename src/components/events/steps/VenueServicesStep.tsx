/**
 * Step 3 — Venue & Services. Uses UI2 Input, SearchableSelect, Badge.
 * Hall cards match admin rounded-[10px]. Services use admin checkbox style.
 */
import { Check, Users } from 'lucide-react';
import type { Hall } from '../../../api/services/events.service';
import { SETUP_STYLES, type VenueSelection, type ServiceSelection } from '../../../utils/events';
import { formatCurrency } from '../../../utils/formatters';
import { Input } from '../../ui2/Input';
import { SearchableSelect } from '../../ui2/SearchableSelect';
import { Badge } from '../../ui2/Badge';

const fmt = (v: number) => formatCurrency(v, 'INR');
const setupOptions = SETUP_STYLES.map(s => ({ value: s.value, label: s.label }));

interface Props {
  halls: Hall[]; venue: VenueSelection; services: ServiceSelection[];
  onSelectHall: (hall: Hall) => void; onUpdateVenue: (field: string, value: any) => void;
  onToggleService: (id: string) => void; onUpdateServicePrice: (id: string, price: number) => void;
}

export default function VenueServicesStep({ halls, venue, services, onSelectHall, onUpdateVenue, onToggleService, onUpdateServicePrice }: Props) {
  return (
    <div className="space-y-8">
      {/* Hall Selection */}
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">Venue</h3>
        <p className="text-[11px] text-neutral-400 mb-4">Select a hall for the event</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {halls.map(hall => {
            const isSelected = venue.hallId === hall.id;
            return (
              <button key={hall.id} onClick={() => onSelectHall(hall)}
                className={`text-left rounded-[10px] border-2 p-4 transition-all ${
                  isSelected ? 'border-terra-400 bg-terra-50/50' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'
                }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-900">{hall.name}</p>
                    <p className="text-[15px] font-bold text-terra-700 mt-0.5 tabular-nums">{fmt(hall.rate_per_day)}<span className="text-[11px] font-normal text-neutral-400">/day</span></p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-terra-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-neutral-500">
                  <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Theatre: {hall.capacity_theatre}</span>
                  <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Banquet: {hall.capacity_banquet}</span>
                  <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Class: {hall.capacity_classroom}</span>
                  <span className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> Cocktail: {hall.capacity_cocktail}</span>
                </div>
              </button>
            );
          })}
        </div>

        {halls.length === 0 && <p className="py-8 text-center text-[12px] text-neutral-400">No halls configured</p>}

        {/* Setup style & days */}
        {venue.hallId && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Setup Style</label>
              <SearchableSelect options={setupOptions} value={venue.setupStyle} onChange={val => onUpdateVenue('setupStyle', val)} placeholder="Select style" searchable={false} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">Days</label>
              <Input type="number" min={1} value={venue.days} onChange={e => onUpdateVenue('days', parseInt(e.target.value) || 1)} size="md" />
            </div>
            <div className="flex items-end">
              <p className="text-[13px] font-semibold text-neutral-800 pb-2 tabular-nums">= {fmt(venue.ratePerDay * venue.days)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Add-on Services */}
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-900 mb-1">Add-on Services</h3>
        <p className="text-[11px] text-neutral-400 mb-4">Select services and adjust pricing</p>

        <div className="space-y-2">
          {services.map(svc => (
            <div key={svc.serviceId}
              className={`flex items-center justify-between rounded-[10px] border p-4 transition-all cursor-pointer ${
                svc.selected ? 'border-terra-300 bg-terra-50/30' : 'border-neutral-200 hover:border-neutral-300'
              }`}
              onClick={() => onToggleService(svc.serviceId)}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  svc.selected ? 'border-terra-600 bg-terra-600' : 'border-neutral-300'
                }`}>
                  {svc.selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-[13px] font-medium ${svc.selected ? 'text-neutral-800' : 'text-neutral-600'}`}>{svc.name}</span>
              </div>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <span className="text-[11px] text-neutral-400">₹</span>
                <input type="number" value={svc.price}
                  onChange={e => onUpdateServicePrice(svc.serviceId, parseFloat(e.target.value) || 0)}
                  disabled={!svc.selected}
                  className="w-24 h-8 border border-neutral-200 rounded-lg px-2 text-[13px] text-right tabular-nums bg-white focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]/10 disabled:opacity-40 disabled:bg-neutral-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
