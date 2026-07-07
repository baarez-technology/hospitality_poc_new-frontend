/**
 * AssignRoomModal Component
 * Smart room assignment with AI recommendations - Glimmora Design System v5.0
 * Features: AI scoring, cleaning status, guest preferences
 */

import { useState, useMemo, useEffect } from 'react';
import { Check, Bed, Users, Loader2, Sparkles, Zap, Droplets, Lock, Unlock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { roomsService } from '../../api/services/rooms.service';
import { bookingService } from '../../api/services/booking.service';
import { formatCurrency } from '../../utils/bookings';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useAuth } from '../../hooks/useAuth';

// Custom Select Component matching CMS pattern
function CustomSelect({ value, onChange, options, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 text-left flex items-center justify-between focus:outline-none ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <svg className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Cleaning status badge
function CleaningStatusBadge({ status }: { status: string }) {
  const statusConfig = {
    clean: { color: 'bg-emerald-100 text-emerald-700', icon: Droplets, label: 'Clean' },
    inspected: { color: 'bg-emerald-100 text-emerald-700', icon: Check, label: 'Inspected' },
    dirty: { color: 'bg-amber-100 text-amber-700', icon: Droplets, label: 'Needs Cleaning' },
    available: { color: 'bg-blue-100 text-blue-700', icon: Check, label: 'Available' },
    occupied: { color: 'bg-rose-100 text-rose-700', icon: Users, label: 'Occupied' },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.available;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

// AI Score badge
function AIScoreBadge({ score }: { score: number }) {
  const getScoreColor = () => {
    if (score >= 130) return 'bg-emerald-500';
    if (score >= 115) return 'bg-emerald-400';
    if (score >= 100) return 'bg-blue-400';
    return 'bg-neutral-400';
  };

  return (
    <div className="flex items-center gap-1">
      <Sparkles className="w-3 h-3 text-amber-500" />
      <div className={`h-1.5 w-12 rounded-full bg-neutral-200 overflow-hidden`}>
        <div
          className={`h-full ${getScoreColor()} transition-all duration-300`}
          style={{ width: `${Math.min((score / 150) * 100, 100)}%` }}
        />
      </div>
      <span className="text-[10px] font-medium text-neutral-600">{Math.round(score)}</span>
    </div>
  );
}

export default function AssignRoomModal({ isOpen, onClose, onAssign, booking, isAssigning, bookings = [] }) {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterFloor, setFilterFloor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rooms, setRooms] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestPreferences, setGuestPreferences] = useState<Record<string, any> | null>(null);
  const [dnmEnabled, setDnmEnabled] = useState(false);
  const [moveReason, setMoveReason] = useState('');
  const [showReasonStep, setShowReasonStep] = useState(false);

  // Role-based access
  const userRole = (user?.role || '').toLowerCase();
  const isAdminOrManager = ['admin', 'manager', 'general_manager'].includes(userRole) || user?.isSuperuser;

  // Fetch rooms and recommendations when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRoom(null);
      setSearchQuery('');
      // Default to booking's room type - only show matching rooms
      setFilterType(booking?.roomType || 'all');
      setFilterFloor('all');
      setFilterStatus('all');
      setDnmEnabled(booking?.doNotMove || false);
      setMoveReason('');
      setShowReasonStep(false);
      setError(null);
      setRecommendations([]);
      setGuestPreferences(null);
      fetchRooms();
      if (booking?.id) {
        fetchRecommendations();
      }
    }
  }, [isOpen, booking?.id, booking?.roomType]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      // Pass booking dates to filter rooms available for the stay period
      // Fetch ALL room types (not just booked type) to support upgrades/overbooking
      const searchParams: any = {};
      if (booking?.checkIn) searchParams.checkIn = booking.checkIn;
      if (booking?.checkOut) searchParams.checkOut = booking.checkOut;
      const fetchedRooms = await roomsService.getRooms(searchParams);
      setRooms(fetchedRooms);
    } catch (err: any) {
      console.error('[AssignRoomModal] Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!booking?.id) return;

    setIsLoadingRecommendations(true);
    try {
      const result = await bookingService.getRoomRecommendations(booking.id, 5);
      if (result.success && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
        setGuestPreferences(result.guest_preferences);
      }
    } catch (err: any) {
      console.error('[AssignRoomModal] Error fetching recommendations:', err);
      // Non-blocking - just log the error
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Auto-assign best room using AI
  const handleAutoAssign = async () => {
    if (!booking?.id) return;

    setIsAutoAssigning(true);
    try {
      const result = await bookingService.smartAssignRoom(booking.id);
      if (result.success) {
        // Call onAssign with the result
        await onAssign({
          id: result.room_id,
          roomNumber: result.room_number,
          type: result.room_type,
        });
      } else {
        setError('Auto-assignment failed. Please select a room manually.');
      }
    } catch (err: any) {
      console.error('[AssignRoomModal] Auto-assign error:', err);
      setError(err.response?.data?.detail || 'Auto-assignment failed. Please try again.');
    } finally {
      setIsAutoAssigning(false);
    }
  };

  // Helper to get disabled reason for a room
  const getDisabledReason = (room: any): string | null => {
    const status = (room.status || '').toLowerCase();
    const cleaningStatus = (room.cleaningStatus || room.cleaning_status || '').toLowerCase();

    // Check status-based unavailability
    if (status === 'occupied') return 'Currently Occupied';
    if (status === 'maintenance') return 'Under Maintenance';
    if (status === 'out_of_service') return 'Out of Service';
    if (status === 'out_of_order') return 'Out of Order';

    // Check cleaning status
    if (status === 'dirty' || cleaningStatus === 'dirty') return 'Dirty - Needs Cleaning';
    if (cleaningStatus === 'in_progress') return 'Cleaning In Progress';

    // Check backend availability flag
    if (typeof room.available === 'boolean' && !room.available) return 'Not Available';

    // Check for booking conflicts
    if (booking?.checkIn && booking?.checkOut) {
      const roomNumber = room.number || room.roomNumber;
      const hasConflict = bookings.some(b =>
        b.room === roomNumber &&
        b.status !== 'CANCELLED' &&
        b.status !== 'CHECKED-OUT' &&
        b.status !== 'COMPLETED' &&
        new Date(b.checkIn) < new Date(booking.checkOut) &&
        new Date(b.checkOut) > new Date(booking.checkIn)
      );
      if (hasConflict) return 'Already Booked for These Dates';
    }

    return null;
  };

  // Get all rooms with recommendation scores and disabled status
  const allRoomsWithStatus = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];

    const recommendationMap = new Map(
      recommendations.map(r => [String(r.room_id), r])
    );

    return rooms.map(room => {
      const rec = recommendationMap.get(String(room.id));
      const disabledReason = getDisabledReason(room);
      return {
        ...room,
        match_score: rec?.match_score || null,
        is_recommended: !!rec,
        isDisabled: !!disabledReason,
        disabledReason,
      };
    });
  }, [rooms, booking, bookings, recommendations]);

  // Filter AI recommendations by search query only (BUG-008 FIX)
  // Type/floor filters are NOT applied since AI recommendations are already
  // curated by the scoring algorithm and may include beneficial upgrades.
  const filteredRecommendations = useMemo(() => {
    let filtered = [...recommendations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rec =>
        rec.room_number?.toLowerCase().includes(query) ||
        rec.room_type?.toLowerCase().includes(query)
      );
    }

    return filtered.slice(0, 5);
  }, [recommendations, searchQuery]);

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let filtered = [...allRoomsWithStatus];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room => {
        const roomNumber = room.number || room.roomNumber || '';
        const roomType = room.room_type?.name || room.type || '';
        return roomNumber.toLowerCase().includes(query) ||
               roomType.toLowerCase().includes(query);
      });
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(room => {
        const roomType = room.room_type?.name || room.type || '';
        // Case-insensitive comparison for room type matching
        return roomType.toLowerCase() === filterType.toLowerCase();
      });
    }

    if (filterFloor !== 'all') {
      filtered = filtered.filter(room => room.floor === parseInt(filterFloor));
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(room => {
        const status = (room.status || '').toLowerCase();
        return status === filterStatus.toLowerCase();
      });
    }

    // Sort: available first, then recommended (by score), then by matching type, then by room number
    const bookingType = booking?.roomType || '';
    filtered.sort((a, b) => {
      // Available rooms first, disabled rooms at the end
      if (!a.isDisabled && b.isDisabled) return -1;
      if (a.isDisabled && !b.isDisabled) return 1;

      // Within available rooms: recommended first (by score descending)
      if (a.match_score && !b.match_score) return -1;
      if (!a.match_score && b.match_score) return 1;
      if (a.match_score && b.match_score) {
        return b.match_score - a.match_score;
      }

      // Then matching type (fuzzy: includes match)
      const aType = (a.room_type?.name || a.type || '').toLowerCase().trim();
      const bType = (b.room_type?.name || b.type || '').toLowerCase().trim();
      const btLower = bookingType.toLowerCase().trim();
      const aMatches = btLower && (aType === btLower || aType.includes(btLower) || btLower.includes(aType));
      const bMatches = btLower && (bType === btLower || bType.includes(btLower) || btLower.includes(bType));
      if (aMatches && !bMatches) return -1;
      if (bMatches && !aMatches) return 1;

      // Then by room number
      const aNum = a.number || a.roomNumber || '';
      const bNum = b.number || b.roomNumber || '';
      return aNum.localeCompare(bNum);
    });

    return filtered;
  }, [allRoomsWithStatus, searchQuery, filterType, filterFloor, filterStatus, booking?.roomType]);

  // Get unique room types - ensure booking's room type is always included
  const roomTypes = useMemo(() => {
    const types = new Set(allRoomsWithStatus.map(r => r.room_type?.name || r.type));
    // Add booking's room type if not already in the set
    if (booking?.roomType) {
      types.add(booking.roomType);
    }
    return Array.from(types).filter(Boolean).sort();
  }, [allRoomsWithStatus, booking?.roomType]);

  // Get unique floors
  const floors = useMemo(() => {
    const floorSet = new Set(allRoomsWithStatus.map(r => r.floor).filter(f => f != null));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [allRoomsWithStatus]);

  // Get unique room statuses for filter
  const roomStatuses = useMemo(() => {
    const statusSet = new Set(
      allRoomsWithStatus.map(r => (r.status || '').toLowerCase()).filter(Boolean)
    );
    return Array.from(statusSet).sort();
  }, [allRoomsWithStatus]);

  // Status labels for display
  const statusLabels: Record<string, string> = {
    available: 'Available',
    clean: 'Clean',
    inspected: 'Inspected',
    dirty: 'Dirty',
    occupied: 'Occupied',
  };

  // Determine if this is a room move (checked-in guest) or initial assignment
  const isRoomMove = (() => {
    const status = (booking?.status || '').toUpperCase().replace(/[\s_]/g, '-');
    return status === 'IN-HOUSE' || status === 'CHECKED-IN' || status === 'IN_HOUSE';
  })();

  // Checked-in bookings: only admin/manager can reassign
  const isCheckedInLocked = isRoomMove && booking?.room && !isAdminOrManager;

  // For room moves: show reason step before final submit
  const handleSubmit = async () => {
    if (!selectedRoom) return;

    // If this is a room move and we haven't collected the reason yet, show reason step
    if (isRoomMove && !showReasonStep) {
      setShowReasonStep(true);
      return;
    }

    // For room moves, reason is required
    if (isRoomMove && !moveReason.trim()) return;

    await handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    if (selectedRoom) {
      const roomNumber = selectedRoom.number || selectedRoom.roomNumber;
      const roomType = selectedRoom.room_type?.name || selectedRoom.type || 'Standard';

      // Confirmation dialog when reassigning (booking already has a room)
      const currentRoom = booking?.room;
      const hasExistingRoom = currentRoom && currentRoom !== 'Unassigned' && currentRoom !== 'Not assigned';
      // Extract room number from object or string
      const getCurrentRoomNumber = () => {
        if (!currentRoom) return null;
        if (typeof currentRoom === 'object') {
          return currentRoom.room_number || currentRoom.roomNumber || currentRoom.number || booking?.roomNumber;
        }
        return currentRoom !== booking?.roomType ? currentRoom : booking?.roomNumber;
      };
      const currentRoomNumber = getCurrentRoomNumber();
      if (hasExistingRoom && currentRoomNumber && String(currentRoomNumber) !== String(roomNumber)) {
        const confirmed = window.confirm(
          `This booking already has Room ${currentRoomNumber} assigned.\n\nReassign to Room ${roomNumber} (${roomType})?`
        );
        if (!confirmed) return;
      }

      await onAssign({
        id: selectedRoom.id,
        roomNumber: roomNumber,
        type: roomType,
        floor: selectedRoom.floor,
        price: selectedRoom.room_type?.base_price || selectedRoom.price,
        ...(isRoomMove && moveReason.trim() ? { moveReason: moveReason.trim() } : {}),
      });

      // Auto-enable DNM for checked-in bookings, or toggle if user changed it
      const shouldEnableDnm = isRoomMove ? true : dnmEnabled;
      if (booking?.id && shouldEnableDnm !== (booking?.doNotMove || false)) {
        try {
          await bookingService.toggleDNM(booking.id, shouldEnableDnm);
        } catch (err) {
          console.error('[AssignRoomModal] DNM toggle failed:', err);
        }
      }

      setSelectedRoom(null);
    }
  };

  const drawerFooter = (
    <div className="flex items-center justify-between w-full">
      {showReasonStep ? (
        <Button
          variant="outline"
          icon={ArrowLeft}
          onClick={() => setShowReasonStep(false)}
        >
          Back
        </Button>
      ) : (
        <Button
          variant="outline"
          icon={Zap}
          onClick={handleAutoAssign}
          loading={isAutoAssigning}
          disabled={!booking?.id || isAssigning || isCheckedInLocked}
          className="text-amber-600 border-amber-300 hover:bg-amber-50"
        >
          Auto Assign Best
        </Button>
      )}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedRoom || isAssigning || isCheckedInLocked || (showReasonStep && !moveReason.trim())}
          loading={isAssigning}
        >
          {showReasonStep ? 'Confirm Move' : isRoomMove ? 'Move Room' : 'Assign Room'}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isRoomMove ? "Room Move" : "Assign Room"}
      subtitle={isRoomMove ? "Move checked-in guest to a different room" : "AI-powered room matching based on guest preferences"}
      maxWidth="max-w-2xl"
      footer={drawerFooter}
    >
      {/* Room Move Reason Step */}
      {showReasonStep && (
        <div className="space-y-6">
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              Reason for Room Move
            </h3>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-[13px] text-amber-800">
                Moving <span className="font-semibold">{booking?.guest}</span> from Room{' '}
                <span className="font-semibold">{typeof booking?.room === 'object' ? booking?.room?.room_number || booking?.room?.number : booking?.room || 'N/A'}</span>{' '}
                to Room <span className="font-semibold">{selectedRoom?.number || selectedRoom?.roomNumber}</span>
              </p>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-neutral-700 mb-2">
                Why is this room move needed? <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={moveReason}
                onChange={(e) => setMoveReason(e.target.value)}
                placeholder="e.g. Guest requested a quieter room, maintenance issue, upgrade..."
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150 resize-none"
                autoFocus
              />
              {!moveReason.trim() && (
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  A reason is required to proceed with the room move
                </p>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Room Selection (hidden during reason step) */}
      <div className={showReasonStep ? 'hidden' : ''}>
      <div className="space-y-6">
        {/* Booking Info */}
        {booking && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
              Booking Details
            </h3>
            <div className="p-4 bg-terra-50 rounded-lg border border-terra-100">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block">Guest</span>
                  <span className="text-[13px] font-semibold text-neutral-900">{booking.guest}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block">Booking ID</span>
                  <span className="text-[13px] font-mono text-neutral-700">{booking.id}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block">Check-in</span>
                  <span className="text-[13px] text-neutral-700">{booking.checkIn}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block">Check-out</span>
                  <span className="text-[13px] text-neutral-700">{booking.checkOut}</span>
                </div>
                {booking.roomType && (
                  <div className="col-span-2 pt-2 border-t border-terra-100">
                    <span className="text-[11px] font-medium text-neutral-500 block">Requested Type</span>
                    <span className="text-[13px] font-semibold text-terra-600">{booking.roomType}</span>
                  </div>
                )}

                {/* DNM indicator if already locked */}
                {booking.doNotMove && (
                  <div className="col-span-2 pt-2 border-t border-terra-100">
                    <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2.5 py-1.5">
                      <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[12px] font-medium">DNM — Room assignment is locked</span>
                        {booking.dnmSetByName && (
                          <span className="text-[10px] text-amber-600 block mt-0.5">
                            Locked by {booking.dnmSetByName}
                            {booking.dnmSetAt && ` on ${new Date(booking.dnmSetAt).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Checked-in lock notice for non-admin */}
                {isCheckedInLocked && (
                  <div className="col-span-2 pt-2 border-t border-terra-100">
                    <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2.5 py-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-[12px] font-medium">
                        Checked-in rooms can only be reassigned by Admin or Manager
                      </span>
                    </div>
                  </div>
                )}

                {/* DNM toggle */}
                <div className="col-span-2 pt-2 border-t border-terra-100">
                  <label className={`flex items-center gap-2 group ${
                    booking.doNotMove && !isAdminOrManager && booking.dnmSetBy !== user?.id
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}>
                    <input
                      type="checkbox"
                      checked={dnmEnabled}
                      onChange={(e) => setDnmEnabled(e.target.checked)}
                      disabled={booking.doNotMove && !isAdminOrManager && booking.dnmSetBy !== user?.id}
                      className="w-3.5 h-3.5 rounded border-neutral-300 text-terra-600 focus:ring-terra-500 disabled:opacity-50"
                    />
                    <span className="flex items-center gap-1 text-[12px] text-neutral-600 group-hover:text-neutral-800">
                      {dnmEnabled ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      Do Not Move (DNM)
                    </span>
                    <span className="text-[10px] text-neutral-400 ml-auto">
                      {booking.doNotMove && !isAdminOrManager && booking.dnmSetBy !== user?.id
                        ? 'Only setter or manager can unlock'
                        : 'Lock room assignment'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Guest Preferences (if available) */}
        {guestPreferences && Object.keys(guestPreferences).length > 0 && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
              <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
              Guest Preferences (from Pre-checkin)
            </h3>
            <div className="flex flex-wrap gap-2">
              {guestPreferences.floor_preference && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
                  Floor: {guestPreferences.floor_preference}
                </span>
              )}
              {guestPreferences.view_preference && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
                  View: {guestPreferences.view_preference}
                </span>
              )}
              {guestPreferences.bed_type && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[11px]">
                  Bed: {guestPreferences.bed_type}
                </span>
              )}
              {guestPreferences.accessible && (
                <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-[11px]">
                  Accessible
                </span>
              )}
              {guestPreferences.quiet_room && (
                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[11px]">
                  Quiet Room
                </span>
              )}
            </div>
          </section>
        )}

        {/* AI Recommendations */}
        {filteredRecommendations.length > 0 && (
          <section>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
              <Sparkles className="w-3 h-3 inline mr-1 text-amber-500" />
              AI Recommended ({filteredRecommendations.length})
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {filteredRecommendations.map((rec, idx) => {
                const isSelected = String(selectedRoom?.id) === String(rec.room_id);
                return (
                  <button
                    key={rec.room_id}
                    onClick={() => {
                      // BUG-008 FIX: Try to find in fetched rooms first, otherwise
                      // construct a room object from recommendation data so the
                      // click always works (even for upgrades/different room types)
                      const room = rooms.find(r => String(r.id) === String(rec.room_id));
                      if (room) {
                        setSelectedRoom({ ...room, match_score: rec.match_score, is_recommended: true });
                      } else {
                        setSelectedRoom({
                          id: rec.room_id,
                          number: rec.room_number,
                          roomNumber: rec.room_number,
                          room_type: { name: rec.room_type },
                          type: rec.room_type,
                          floor: rec.floor,
                          status: rec.status,
                          capacity: null,
                          max_occupancy: null,
                          match_score: rec.match_score,
                          is_recommended: true,
                        });
                      }
                    }}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${
                      isSelected
                        ? 'border-terra-500 bg-terra-50'
                        : 'border-amber-200 bg-amber-50/50 hover:border-terra-400'
                    }`}
                  >
                    <div className="text-lg font-bold text-neutral-900">{rec.room_number}</div>
                    <div className="text-[10px] text-neutral-500 truncate">{rec.room_type}</div>
                    <AIScoreBadge score={rec.match_score} />
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {isLoadingRecommendations && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-[13px] text-amber-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading AI recommendations...
          </div>
        )}

        {/* Search and Filters */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
            Search & Filter
          </h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search by room number or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
              />
            </div>

            <div className="flex gap-3">
              <CustomSelect
                value={filterType}
                onChange={setFilterType}
                options={[
                  { value: 'all', label: 'All Types' },
                  ...roomTypes.map(type => ({
                    value: type,
                    label: type.toLowerCase() === booking?.roomType?.toLowerCase()
                      ? `${type} (Booked)`
                      : type
                  }))
                ]}
                placeholder="All Types"
              />
              <CustomSelect
                value={filterFloor}
                onChange={setFilterFloor}
                options={[
                  { value: 'all', label: 'All Floors' },
                  ...floors.map(floor => ({ value: String(floor), label: `Floor ${floor}` }))
                ]}
                placeholder="All Floors"
              />
              <CustomSelect
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...roomStatuses.map(s => ({
                    value: s,
                    label: statusLabels[s] || s.charAt(0).toUpperCase() + s.slice(1)
                  }))
                ]}
                placeholder="All Statuses"
              />
            </div>
          </div>
        </section>

        {/* Available Rooms */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Rooms
            </h3>
            <span className="text-[11px] text-neutral-500">
              {filteredRooms.filter(r => !r.isDisabled).length} available / {filteredRooms.length} total
            </span>
          </div>

          {/* Info banner when filtering by booked room type and rooms are available */}
          {filterType !== 'all' && filterType.toLowerCase() === booking?.roomType?.toLowerCase() && filteredRooms.length > 0 && (
            <div className="mb-4 p-3 bg-terra-50 border border-terra-200 rounded-lg">
              <p className="text-[12px] text-terra-700">
                <span className="font-medium">Showing {booking.roomType} rooms only</span>
                <span className="text-terra-500 ml-1">— matching the guest's booking</span>
              </p>
            </div>
          )}

          {/* Warning if no rooms of booked type are available */}
          {filterType !== 'all' && filteredRooms.length === 0 && filterType.toLowerCase() === booking?.roomType?.toLowerCase() && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-[12px] text-amber-700">
                <span className="font-medium">No {booking.roomType} rooms available</span>
                <span className="text-amber-600 ml-1">— consider offering an upgrade</span>
              </p>
              <button
                onClick={() => setFilterType('all')}
                className="mt-2 text-[11px] font-medium text-amber-700 underline hover:no-underline"
              >
                Show all room types
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-terra-500" />
              <span className="ml-3 text-[13px] text-neutral-600">Loading rooms...</span>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-[13px] text-rose-700 mb-4">
              {error}
              <button onClick={fetchRooms} className="ml-2 underline hover:no-underline">Retry</button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredRooms.length === 0 && (
            <div className="text-center py-8">
              <Bed className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-[13px] text-neutral-500">No rooms available</p>
              <p className="text-[11px] text-neutral-400 mt-1">Try adjusting your filters</p>
            </div>
          )}

          {/* Rooms List */}
          {!isLoading && !error && filteredRooms.length > 0 && (
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {filteredRooms.map((room) => {
                const roomNumber = room.number || room.roomNumber || 'N/A';
                const roomType = room.room_type?.name || room.type || 'Standard';
                const roomFloor = room.floor || Math.floor(parseInt(roomNumber) / 100);
                const roomPrice = room.room_type?.base_price || room.price || 0;
                const isSelected = selectedRoom?.id === room.id;
                const roomTypeLower = roomType.toLowerCase().trim();
                const bookedTypeLower = (booking?.roomType || '').toLowerCase().trim();
                const isMatchingType = bookedTypeLower && (roomTypeLower === bookedTypeLower || roomTypeLower.includes(bookedTypeLower) || bookedTypeLower.includes(roomTypeLower));
                const isRecommended = room.is_recommended;
                const isDisabled = room.isDisabled || isCheckedInLocked;
                const disabledReason = room.disabledReason;

                return (
                  <button
                    key={room.id}
                    onClick={() => !isDisabled && setSelectedRoom(room)}
                    disabled={isDisabled}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                      isDisabled
                        ? 'border-neutral-200 bg-neutral-50 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-terra-500 bg-terra-50'
                        : isRecommended
                        ? 'border-amber-300 bg-amber-50/30 hover:border-terra-400'
                        : isMatchingType
                        ? 'border-emerald-300 bg-emerald-50/30 hover:border-terra-400'
                        : 'border-neutral-200 hover:border-terra-400 hover:bg-neutral-50 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                          isDisabled
                            ? 'bg-neutral-200 text-neutral-400'
                            : isSelected
                            ? 'bg-terra-500 text-white'
                            : isRecommended
                            ? 'bg-amber-500 text-white'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          <span className="font-bold text-base leading-tight">{roomNumber}</span>
                          <span className="text-[9px] opacity-70">F{roomFloor}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold text-[13px] ${isDisabled ? 'text-neutral-400' : 'text-neutral-900'}`}>
                              {roomType}
                            </p>
                            {!isDisabled && isRecommended && (
                              <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-medium">
                                <Sparkles className="w-3 h-3" />
                                AI Pick
                              </span>
                            )}
                            {!isDisabled && isMatchingType && !isRecommended && (
                              <span className="text-[11px] text-emerald-600 font-normal">Match</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <CleaningStatusBadge status={room.status} />
                            <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                              <Users className="w-3 h-3" />
                              <span>{room.capacity || room.max_occupancy || 2}</span>
                            </div>
                            {roomPrice > 0 && (
                              <>
                                <span className="text-neutral-300">|</span>
                                <span className={`text-[11px] font-medium ${isDisabled ? 'text-neutral-400' : 'text-terra-600'}`}>
                                  {formatCurrency(roomPrice)}/night
                                </span>
                              </>
                            )}
                          </div>
                          {/* Show disabled reason */}
                          {isDisabled && disabledReason && (
                            <div className="mt-1.5 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-rose-400" />
                              <span className="text-[11px] font-medium text-rose-500">{disabledReason}</span>
                            </div>
                          )}
                          {!isDisabled && room.match_score && (
                            <div className="mt-1.5">
                              <AIScoreBadge score={room.match_score} />
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && !isDisabled && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-terra-500">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Room Type Mismatch Warning */}
        {selectedRoom && (() => {
          const selectedType = (selectedRoom.room_type?.name || selectedRoom.type || '').toLowerCase().trim();
          const bookedType = (booking?.roomType || '').toLowerCase().trim();
          // Use fuzzy match: types match if one contains the other (handles "Standard" vs "Standard Room")
          const typesMatch = !bookedType || !selectedType || selectedType === bookedType || selectedType.includes(bookedType) || bookedType.includes(selectedType);
          return !typesMatch ? (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
              <p className="text-[13px] font-semibold text-amber-800">
                Room Type Mismatch
              </p>
              <p className="text-[12px] text-amber-700 mt-1">
                Selected room type does not match the booked room type.
                Guest booked <span className="font-semibold">{booking.roomType}</span> but selected room is{' '}
                <span className="font-semibold">{selectedRoom.room_type?.name || selectedRoom.type}</span>.
                Proceed only if upgrading or with guest consent.
              </p>
            </div>
          ) : null;
        })()}

        {/* Selected Room Summary */}
        {selectedRoom && (
          <div className="p-3 bg-terra-50 border border-terra-200 rounded-lg">
            <p className="text-[13px] text-neutral-700">
              <span className="font-medium">Selected:</span>{' '}
              Room {selectedRoom.number || selectedRoom.roomNumber} - {selectedRoom.room_type?.name || selectedRoom.type}
              {selectedRoom.match_score && (
                <span className="ml-2 text-amber-600">(AI Score: {Math.round(selectedRoom.match_score)})</span>
              )}
            </p>
          </div>
        )}
      </div>
      </div>
    </Drawer>
  );
}
