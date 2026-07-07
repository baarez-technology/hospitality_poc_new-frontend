/**
 * POS Outlet Selection — Matches admin design language
 * rounded-[10px] cards, warm bg, clean typography, proper spacing
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Clock, UtensilsCrossed, Wine, Coffee, Truck, Store } from 'lucide-react';
import { useFnB } from '../../contexts/FnBContext';

const OUTLET_ICONS: Record<string, any> = { restaurant: UtensilsCrossed, bar: Wine, pool_cafe: Coffee, room_service: Truck };
const OUTLET_COLORS: Record<string, string> = { restaurant: 'bg-terra-50 text-terra-600', bar: 'bg-purple-50 text-purple-600', pool_cafe: 'bg-blue-50 text-blue-600', room_service: 'bg-amber-50 text-amber-600' };

export default function POSMain() {
  const navigate = useNavigate();
  const { outlets, selectOutlet, isLoading } = useFnB();
  const active = outlets.filter(o => o.status === 'active');

  useEffect(() => {
    if (active.length === 1) { selectOutlet(active[0]).then(() => navigate('/pos/tables')); }
  }, [active.length]);

  const handleSelect = async (outlet: typeof active[0]) => {
    await selectOutlet(outlet);
    navigate('/pos/tables');
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-neutral-200 border-t-terra-600 rounded-full animate-spin" />
    </div>
  );

  if (active.length === 0) return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center max-w-xs">
        <div className="w-14 h-14 rounded-[10px] bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <Store className="w-6 h-6 text-neutral-400" />
        </div>
        <p className="text-[15px] font-semibold text-neutral-800 mb-1">No Active Outlets</p>
        <p className="text-[13px] text-neutral-500 leading-relaxed">Contact your manager to configure F&B outlets.</p>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">Glimmora POS</p>
          <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900 mb-1">Select Your Outlet</h1>
          <p className="text-[13px] text-neutral-500">Choose the outlet you're serving today</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {active.map(outlet => {
            const Icon = OUTLET_ICONS[outlet.type] || Store;
            const iconCls = OUTLET_COLORS[outlet.type] || 'bg-neutral-100 text-neutral-500';
            return (
              <button
                key={outlet.id}
                onClick={() => handleSelect(outlet)}
                className="bg-white rounded-[10px] border border-neutral-200 p-5 text-left hover:border-neutral-300 hover:shadow-sm transition-all active:scale-[0.99]"
              >
                <div className={`w-10 h-10 rounded-[8px] ${iconCls} flex items-center justify-center mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-[15px] font-semibold text-neutral-900 mb-0.5">{outlet.name}</p>
                <p className="text-[12px] text-neutral-400 capitalize mb-4">{outlet.type.replace('_', ' ')}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{outlet.location}</span>
                  {outlet.capacity > 0 && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{outlet.capacity} seats</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{outlet.operating_hours}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
