import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Bed } from 'lucide-react';
import { HK_STATUS_CONFIG, PRIORITY_CONFIG, calculateEstimatedFinish } from '../../utils/housekeeping';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableActions, TableEmpty } from '../ui2/Table';
import { IconButton } from '../ui2/Button';
import { StatusBadge, Badge } from '../ui2/Badge';

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
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const isButtonClick = Object.values(buttonRefs.current).some(
          btn => btn && btn.contains(event.target)
        );
        if (!isButtonClick) {
          setOpenDropdown(null);
          setDropdownPosition(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!openDropdown) return;

    const updatePosition = () => {
      const button = buttonRefs.current[openDropdown];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 6,
          left: rect.right - 176 // 176px = w-44 = 11rem
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [openDropdown]);

  const handleMoreClick = (e, roomId) => {
    e.stopPropagation();
    if (openDropdown === roomId) {
      setOpenDropdown(null);
      setDropdownPosition(null);
    } else {
      const button = buttonRefs.current[roomId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 6,
          left: rect.right - 176
        });
      }
      setOpenDropdown(roomId);
    }
  };

  const columns = [
    { key: 'roomNumber', label: 'Room', sortable: true, width: 'auto', minWidth: '180px' },
    { key: 'type', label: 'Type', sortable: true, width: 'auto', minWidth: '120px' },
    { key: 'status', label: 'Status', sortable: true, width: 'auto', minWidth: '110px' },
    { key: 'priority', label: 'Priority', sortable: true, width: 'auto', minWidth: '100px' },
    { key: 'assignedTo', label: 'Assigned Staff', sortable: true, width: 'auto', minWidth: '140px' },
    { key: 'cleaningStartedAt', label: 'Start Time', sortable: true, width: 'auto', minWidth: '100px' },
    { key: 'estimatedFinish', label: 'Est. Finish', sortable: false, width: 'auto', minWidth: '100px' },
    { key: 'lastCleaned', label: 'Last Updated', sortable: true, width: 'auto', minWidth: '120px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '50px', sticky: true }
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

  // Map housekeeping status to StatusBadge status
  const getStatusBadgeStatus = (status) => {
    const statusMap = {
      'dirty': 'dirty',
      'in_progress': 'cleaning',
      'clean': 'clean',
      'inspected': 'inspected',
      'out_of_service': 'maintenance'
    };
    return statusMap[status] || status;
  };

  // Map priority to Badge variant
  const getPriorityVariant = (priority) => {
    const variantMap = {
      'urgent': 'danger-solid',
      'high': 'danger',
      'medium': 'warning',
      'low': 'success',
      'normal': 'neutral'
    };
    return variantMap[priority] || 'neutral';
  };

  const getPriorityLabel = (priority) => {
    return priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Normal';
  };

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                sortable={col.sortable}
                sorted={sortField === col.key ? sortDirection : null}
                onSort={() => col.sortable && onSort && onSort(col.key)}
                style={{ width: col.width, minWidth: col.minWidth }}
                sticky={col.sticky}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.length === 0 ? (
            <TableEmpty
              title="No rooms found"
              description="No rooms match your current filters"
            />
          ) : (
            rooms.map((room) => (
              <TableRow
                key={room.id}
                clickable
                onClick={() => onRoomClick(room)}
                className="hover:bg-neutral-50/80"
              >
                {/* Room Number */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {/* Room Image Thumbnail */}
                    {room.image ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100">
                        <img
                          src={room.image}
                          alt={`Room ${room.roomNumber || room.number}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-terra-100"><svg class="w-5 h-5 text-terra-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-terra-100 flex items-center justify-center flex-shrink-0">
                        <Bed className="w-5 h-5 text-terra-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-[13px] font-semibold text-neutral-900">Room {room.roomNumber || room.number}</p>
                      <p className="text-[11px] text-neutral-500 font-medium">Floor {room.floor}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Type */}
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-neutral-100 text-neutral-700">
                    <Bed className="w-3 h-3" />
                    {room.type || 'Standard'}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <StatusBadge status={getStatusBadgeStatus(room.status)} size="sm" />
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Badge variant={getPriorityVariant(room.priority)} size="sm">
                    {getPriorityLabel(room.priority)}
                  </Badge>
                </TableCell>

                {/* Assigned Staff */}
                <TableCell>
                  {room.assignedTo ? (
                    <span className="text-[13px] font-medium text-neutral-900">{getStaffName(room.assignedTo)}</span>
                  ) : (
                    <span className="text-[13px] text-neutral-400 font-medium">Unassigned</span>
                  )}
                </TableCell>

                {/* Start Time */}
                <TableCell>
                  <span className="text-[13px] text-neutral-700 font-medium">{formatTime(room.cleaningStartedAt)}</span>
                </TableCell>

                {/* Estimated Finish */}
                <TableCell>
                  <span className="text-[13px] text-neutral-700 font-medium">{getEstimatedFinish(room)}</span>
                </TableCell>

                {/* Last Updated */}
                <TableCell>
                  <span className="text-[13px] text-neutral-500 font-medium">{room.lastCleaned || '-'}</span>
                </TableCell>

                {/* Actions */}
                <TableActions sticky>
                  <div className="relative">
                    <div ref={(el) => { buttonRefs.current[room.id] = el; }}>
                      <IconButton
                        icon={MoreHorizontal}
                        size="sm"
                        variant="ghost"
                        label="More actions"
                        onClick={(e) => handleMoreClick(e, room.id)}
                      />
                    </div>

                    {openDropdown === room.id && dropdownPosition && createPortal(
                      <div
                        ref={dropdownRef}
                        style={{
                          position: 'fixed',
                          top: `${dropdownPosition.top}px`,
                          left: `${dropdownPosition.left}px`,
                          zIndex: 9999
                        }}
                        className="w-44 bg-white rounded-lg shadow-lg shadow-neutral-900/10 border border-neutral-200 py-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRoomClick(room);
                            setOpenDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          View Details
                        </button>
                        {/* BUG-021 FIX: Only allow assigning staff to dirty/in_progress rooms */}
                        {(room.status === 'dirty' || room.status === 'in_progress') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAssign && onAssign(room);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            {room.assignedTo ? 'Reassign Staff' : 'Assign Staff'}
                          </button>
                        )}
                        {room.status === 'dirty' && room.assignedTo && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartCleaning && onStartCleaning(room.id);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            Start Cleaning
                          </button>
                        )}
                        {room.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkClean && onMarkClean(room.id);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            Mark Clean
                          </button>
                        )}
                        {room.status === 'clean' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onInspect && onInspect(room.id);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                          >
                            Inspect Room
                          </button>
                        )}
                      </div>,
                      document.body
                    )}
                  </div>
                </TableActions>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
