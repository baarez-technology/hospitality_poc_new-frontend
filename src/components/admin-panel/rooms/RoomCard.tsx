import { Building2, Users, Sparkles, Eye, Bed, UsersRound } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function RoomCard({ room, onClick }) {
  const { symbol } = useCurrency();
  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      available: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/30',
      clean: 'bg-[#5C9BA4]/10 text-[#5C9BA4] border-[#5C9BA4]/30',
      inspected: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/30',
      occupied: 'bg-[#A57865]/10 text-[#A57865] border-[#A57865]/30',
      dirty: 'bg-orange-50 text-orange-700 border-orange-200',
      in_progress: 'bg-[#CDB261]/10 text-[#CDB261] border-[#CDB261]/30',
      maintenance: 'bg-orange-50 text-orange-700 border-orange-200',
      out_of_service: 'bg-amber-50 text-amber-700 border-amber-200',
      out_of_order: 'bg-red-50 text-red-700 border-red-200'
    };

    const labels = {
      available: 'Available',
      clean: 'Clean',
      inspected: 'Inspected',
      occupied: 'Occupied',
      dirty: 'Dirty',
      in_progress: 'In Progress',
      maintenance: 'Maintenance',
      out_of_service: 'Out of Service',
      out_of_order: 'Out of Order'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold border ${styles[status] || styles.available}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Cleaning badge styling
  const getCleaningBadge = (cleaning, guests) => {
    if (cleaning === 'clean' || guests?.isCheckedIn) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Clean
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-semibold">
          Needs Cleaning
        </span>
      );
    }
  };

  // Room type color and background
  const getTypeStyle = (type) => {
    const styles = {
      'Minimalist Studio': { text: 'text-neutral-700', bg: 'bg-neutral-50', border: 'border-neutral-200' },
      'Coastal Retreat': { text: 'text-[#5C9BA4]', bg: 'bg-[#5C9BA4]/10', border: 'border-[#5C9BA4]/30' },
      'Urban Oasis': { text: 'text-[#4E5840]', bg: 'bg-[#4E5840]/10', border: 'border-[#4E5840]/30' },
      'Sunset Vista': { text: 'text-[#CDB261]', bg: 'bg-[#CDB261]/10', border: 'border-[#CDB261]/30' },
      'Pacific Suite': { text: 'text-[#A57865]', bg: 'bg-[#A57865]/5', border: 'border-[#A57865]/20' },
      'Wellness Suite': { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
      'Family Sanctuary': { text: 'text-[#8E6554]', bg: 'bg-[#8E6554]/10', border: 'border-[#8E6554]/30' },
      'Oceanfront Penthouse': { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' }
    };
    return styles[type] || styles['Minimalist Studio'];
  };

  const typeStyle = getTypeStyle(room.type);

  // Get primary image or fallback
  const primaryImage = room.images?.[0] || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-[#A57865]/30 transition-all duration-200 group flex flex-col">
      {/* Room Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={primaryImage}
          alt={`Room ${room.roomNumber}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800';
          }}
        />
        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          {getStatusBadge(room.status)}
        </div>
        {/* Floor Badge */}
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg border border-neutral-200">
            <span className="text-[10px] text-neutral-500">Floor</span>
            <span className="text-sm font-bold text-neutral-900">{room.floor}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#A57865]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-neutral-900">
                {room.roomNumber}
              </h3>
            </div>
            <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
              {room.type}
            </div>
          </div>
          {getCleaningBadge(room.cleaning, room.guests)}
        </div>

        {/* Guest Info */}
      {room.guests && (
        <div className="flex items-center gap-3 mb-4 p-3.5 bg-[#A57865]/10 rounded-xl border border-[#A57865]/30">
          <div className="w-8 h-8 rounded-lg bg-[#A57865]/20 border border-[#A57865]/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#A57865]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-[#A57865] mb-0.5">Current Guest</p>
            <p className="text-sm font-semibold text-neutral-900">{room.guests.name}</p>
          </div>
        </div>
      )}

      {/* Room Details */}
      <div className="space-y-3 mb-4 p-4 bg-[#FAF8F6] rounded-xl border border-neutral-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <Bed className="w-4 h-4 text-[#A57865]" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-600">Bed Type</span>
            <span className="text-sm font-semibold text-neutral-900">{room.bedType}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <UsersRound className="w-4 h-4 text-[#A57865]" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-600">Capacity</span>
            <span className="text-sm font-semibold text-neutral-900">{room.capacity} guests</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#4E5840]">{symbol}</span>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-600">Price</span>
            <span className="text-sm font-bold text-[#4E5840]">{symbol}{room.price}/night</span>
          </div>
        </div>
      </div>

      {/* Blocked Info - shown for out_of_service and out_of_order */}
      {(room.status === 'out_of_service' || room.status === 'out_of_order') && room.blockedReason && (
        <div className={`p-4 rounded-xl border mb-4 ${room.status === 'out_of_order' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className={`text-xs font-bold mb-2 uppercase tracking-wider ${room.status === 'out_of_order' ? 'text-red-900' : 'text-amber-900'}`}>
            {room.status === 'out_of_order' ? 'Out of Order' : 'Out of Service'}
          </p>
          <p className={`text-sm mb-1 ${room.status === 'out_of_order' ? 'text-red-700' : 'text-amber-700'}`}>{room.blockedReason}</p>
          {room.blockedUntil && (
            <p className={`text-xs font-medium mt-2 ${room.status === 'out_of_order' ? 'text-red-600' : 'text-amber-600'}`}>Until: {room.blockedUntil}</p>
          )}
        </div>
      )}

      {/* Spacer to push button to bottom */}
      <div className="flex-1"></div>

      {/* View Details Button */}
      <button
        onClick={() => onClick(room)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#A57865] hover:bg-[#8E6554] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md group-hover:scale-[1.02] active:scale-95"
      >
        <Eye className="w-4 h-4" />
        View Details
      </button>
    </div>
    </div>
  );
}
