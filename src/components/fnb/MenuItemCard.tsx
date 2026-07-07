/**
 * Menu Item Card — Shows item name, price, veg/nonveg dot, prep time, availability toggle
 */
import { Clock, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import type { MenuItem } from '../../api/services/fnb.service';

interface Props {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onToggle: (id: number) => void;
}

export default function MenuItemCard({ item, onEdit, onToggle }: Props) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-sm transition-shadow ${!item.is_available ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        {/* Veg/Non-veg indicator */}
        <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center ${
          item.is_veg ? 'border-green-600' : 'border-red-600'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${item.is_veg ? 'bg-green-600' : 'bg-red-600'}`} />
        </div>
        <button
          onClick={() => onEdit(item)}
          className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-terra-600 hover:bg-terra-50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>

      {item.image_url && (
        <div className="w-full h-24 rounded-lg bg-neutral-100 mb-3 overflow-hidden">
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        </div>
      )}

      <h4 className="text-sm font-semibold text-neutral-800 mb-0.5 line-clamp-2">{item.name}</h4>
      {item.description && (
        <p className="text-[11px] text-neutral-500 line-clamp-1 mb-2">{item.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <span className="text-sm font-bold text-terra-700">Rs.{item.price}</span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-[11px] text-neutral-400">
            <Clock className="w-3 h-3" /> {item.prep_time_minutes}m
          </span>
          <button
            onClick={() => onToggle(item.id)}
            className="text-neutral-400 hover:text-terra-600 transition-colors"
            title={item.is_available ? 'Mark unavailable' : 'Mark available'}
          >
            {item.is_available
              ? <ToggleRight className="w-5 h-5 text-green-600" />
              : <ToggleLeft className="w-5 h-5 text-neutral-400" />
            }
          </button>
        </div>
      </div>

      {item.modifier_groups && item.modifier_groups.length > 0 && (
        <div className="mt-2 pt-2 border-t border-neutral-100">
          <span className="text-[10px] text-neutral-400 font-medium">
            {item.modifier_groups.length} modifier group{item.modifier_groups.length > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
