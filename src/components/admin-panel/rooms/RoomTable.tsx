import { Eye, Edit, AlertTriangle, UserPlus, ChevronUp, ChevronDown, Bed, Users } from 'lucide-react';
import { ROOM_STATUS_CONFIG, HK_STATUS_CONFIG, MAINTENANCE_STATUS_CONFIG, formatCurrency } from '@/utils/admin/rooms';

export default function RoomTable({
  rooms,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onOOO,
  onAssign,
}) {
  const columns = [
    { key: 'roomNumber', label: 'Room', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'floor', label: 'Floor', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'hkStatus', label: 'Housekeeping', sortable: false },
    { key: 'currentGuest', label: 'Current Guest', sortable: false },
    { key: 'maintenanceStatus', label: 'Maintenance', sortable: false },
    { key: 'price', label: 'Price', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-neutral-300" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-[#A57865]" />
    ) : (
      <ChevronDown className="w-4 h-4 text-[#A57865]" />
    );
  };

  if (rooms.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
        <Bed className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
        <p className="text-neutral-500 font-medium">No rooms found</p>
        <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF8F6] border-b border-neutral-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:bg-neutral-100 select-none' : ''
                  }`}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <SortIcon field={col.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rooms.map((room) => {
              const statusConfig = ROOM_STATUS_CONFIG[room.status] || ROOM_STATUS_CONFIG['available'];
              const hkConfig = HK_STATUS_CONFIG[room.hkStatus] || HK_STATUS_CONFIG['clean'];
              const maintConfig = MAINTENANCE_STATUS_CONFIG[room.maintenanceStatus] || MAINTENANCE_STATUS_CONFIG['none'];

              return (
                <tr
                  key={room.id}
                  className="hover:bg-[#FAF8F6]/50 transition-colors duration-150"
                >
                  {/* Room Number */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#A57865]/10 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-[#A57865]">{room.roomNumber}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{room.roomNumber}</p>
                        <p className="text-xs text-neutral-500">
                          <Users className="w-3 h-3 inline mr-1" />
                          {room.capacity || 2} guests
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-neutral-900">{room.type}</span>
                  </td>

                  {/* Floor */}
                  <td className="px-4 py-4">
                    <span className="text-sm text-neutral-700">Floor {room.floor}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}
                    >
                      {statusConfig.label}
                    </span>
                  </td>

                  {/* HK Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${hkConfig.bgColor} ${hkConfig.textColor}`}
                    >
                      {hkConfig.label}
                    </span>
                  </td>

                  {/* Current Guest */}
                  <td className="px-4 py-4">
                    {room.currentGuest ? (
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{room.currentGuest}</p>
                        {room.currentBookingId && (
                          <p className="text-xs text-neutral-500">{room.currentBookingId}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </td>

                  {/* Maintenance Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${maintConfig.bgColor} ${maintConfig.textColor}`}
                    >
                      {maintConfig.label}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-[#4E5840]">
                      {formatCurrency(room.price)}<span className="font-normal text-neutral-500">/night</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(room)}
                        className="p-2 hover:bg-[#A57865]/10 rounded-lg transition-colors group"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-neutral-500 group-hover:text-[#A57865]" />
                      </button>
                      <button
                        onClick={() => onEdit(room)}
                        className="p-2 hover:bg-[#5C9BA4]/10 rounded-lg transition-colors group"
                        title="Edit Room"
                      >
                        <Edit className="w-4 h-4 text-neutral-500 group-hover:text-[#5C9BA4]" />
                      </button>
                      {room.status !== 'out_of_order' && (
                        <button
                          onClick={() => onOOO(room)}
                          className="p-2 hover:bg-amber-100 rounded-lg transition-colors group"
                          title="Mark Out of Order"
                        >
                          <AlertTriangle className="w-4 h-4 text-neutral-500 group-hover:text-amber-600" />
                        </button>
                      )}
                      {(room.status === 'available' || room.status === 'clean') && (
                        <button
                          onClick={() => onAssign(room)}
                          className="p-2 hover:bg-[#4E5840]/10 rounded-lg transition-colors group"
                          title="Assign to Booking"
                        >
                          <UserPlus className="w-4 h-4 text-neutral-500 group-hover:text-[#4E5840]" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
