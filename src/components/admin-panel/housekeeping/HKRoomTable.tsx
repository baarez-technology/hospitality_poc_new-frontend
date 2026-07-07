import { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, UserPlus, CheckCircle, Play, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { HK_STATUS_CONFIG, PRIORITY_CONFIG, calculateCleaningTime, calculateEstimatedFinish, formatDuration } from '@/utils/admin/housekeeping';

export default function HKRoomTable({
  rooms,
  staff,
  onRoomClick,
  onAssign,
  onStartCleaning,
  onMarkClean,
  onInspect,
  sortField,
  sortDirection,
  onSort
}) {
  const [openDropdown, setOpenDropdown] = useState(null);

  const columns = [
    { key: 'roomNumber', label: 'Room', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'priority', label: 'Priority', sortable: true },
    { key: 'assignedTo', label: 'Assigned Staff', sortable: true },
    { key: 'cleaningStartedAt', label: 'Start Time', sortable: true },
    { key: 'estimatedFinish', label: 'Est. Finish', sortable: false },
    { key: 'lastCleaned', label: 'Last Updated', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  const getStaffName = (staffId) => {
    const staffMember = staff?.find(s => s.id === staffId);
    return staffMember ? staffMember.name : '-';
  };

  const getStaffAvatar = (staffId) => {
    const staffMember = staff?.find(s => s.id === staffId);
    return staffMember ? staffMember.avatar : null;
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '-';
    }
  };

  const getEstimatedFinish = (room) => {
    if (!room.cleaningStartedAt) return '-';
    try {
      const finish = calculateEstimatedFinish(room.cleaningStartedAt, room.type, room.priority);
      return finish.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '-';
    }
  };

  const handleSort = (key) => {
    if (onSort) {
      onSort(key);
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-3.5 h-3.5 text-neutral-300" />;
    }
    return sortDirection === 'asc'
      ? <ChevronUp className="w-3.5 h-3.5 text-[#A57865]" />
      : <ChevronDown className="w-3.5 h-3.5 text-[#A57865]" />;
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF8F6] border-b border-neutral-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer hover:text-[#A57865] transition-colors' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
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
              const statusConfig = HK_STATUS_CONFIG[room.status] || HK_STATUS_CONFIG.dirty;
              const priorityConfig = PRIORITY_CONFIG[room.priority] || PRIORITY_CONFIG.low;

              return (
                <tr
                  key={room.id}
                  className="hover:bg-[#FAF8F6]/50 transition-colors cursor-pointer"
                  onClick={() => onRoomClick(room)}
                >
                  {/* Room Number */}
                  <td className="px-4 py-3">
                    <span className="font-bold text-neutral-900">{room.roomNumber}</span>
                    <span className="text-xs text-neutral-500 ml-1">F{room.floor}</span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-700">{room.type}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${priorityConfig.bgColor} ${priorityConfig.textColor}`}>
                      {priorityConfig.label}
                    </span>
                  </td>

                  {/* Assigned Staff */}
                  <td className="px-4 py-3">
                    {room.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white text-xs font-bold">
                          {getStaffAvatar(room.assignedTo)}
                        </div>
                        <span className="text-sm font-medium text-neutral-700">{getStaffName(room.assignedTo)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">Unassigned</span>
                    )}
                  </td>

                  {/* Start Time */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-700">{formatTime(room.cleaningStartedAt)}</span>
                  </td>

                  {/* Estimated Finish */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-700">{getEstimatedFinish(room)}</span>
                  </td>

                  {/* Last Updated */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-neutral-500">{room.lastCleaned || '-'}</span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRoomClick(room);
                        }}
                        className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-neutral-500" />
                      </button>

                      {!room.assignedTo && room.status !== 'out_of_service' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssign && onAssign(room);
                          }}
                          className="p-1.5 hover:bg-[#A57865]/10 rounded-lg transition-colors"
                          title="Assign"
                        >
                          <UserPlus className="w-4 h-4 text-[#A57865]" />
                        </button>
                      )}

                      {room.status === 'dirty' && room.assignedTo && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartCleaning && onStartCleaning(room.id);
                          }}
                          className="p-1.5 hover:bg-[#5C9BA4]/10 rounded-lg transition-colors"
                          title="Start Cleaning"
                        >
                          <Play className="w-4 h-4 text-[#5C9BA4]" />
                        </button>
                      )}

                      {room.status === 'in_progress' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkClean && onMarkClean(room.id);
                          }}
                          className="p-1.5 hover:bg-[#4E5840]/10 rounded-lg transition-colors"
                          title="Mark Clean"
                        >
                          <CheckCircle className="w-4 h-4 text-[#4E5840]" />
                        </button>
                      )}

                      {room.status === 'clean' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspect && onInspect(room.id);
                          }}
                          className="p-1.5 hover:bg-[#4E5840]/10 rounded-lg transition-colors"
                          title="Inspect"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#4E5840]" />
                        </button>
                      )}

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === room.id ? null : room.id);
                          }}
                          className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                        </button>

                        {openDropdown === room.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRoomClick(room);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-[#FAF8F6]"
                            >
                              View Details
                            </button>
                            {room.status !== 'out_of_service' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAssign && onAssign(room);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-[#FAF8F6]"
                              >
                                {room.assignedTo ? 'Reassign' : 'Assign Staff'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rooms.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-neutral-500">No rooms match your filters</p>
        </div>
      )}
    </div>
  );
}
