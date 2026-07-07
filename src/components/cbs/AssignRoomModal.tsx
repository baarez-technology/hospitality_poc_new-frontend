/**
 * AssignRoomModal Component
 * Room assignment interface with availability, conflicts, and cleaning status
 * Uses Popup modal component styling (glass-card-solid effect)
 */

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Bed, Check, AlertTriangle, ArrowRight,
  Search, Users, Layers, Crown, DollarSign
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { ConfirmModal } from '../ui2/Modal';
import { Button, IconButton } from '../ui2/Button';
import { SearchBar } from '../ui2/SearchBar';
import { StatusBadge } from '../ui2/Badge';
import { Drawer } from '../ui2/Drawer';

const roomTypeColors = {
  'Minimalist Studio': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', icon: 'bg-slate-200', darkBg: 'bg-slate-500/20', darkText: 'text-slate-300' },
  'Coastal Retreat': { bg: 'bg-[#5C9BA4]/10', text: 'text-[#5C9BA4]', border: 'border-[#5C9BA4]/30', icon: 'bg-[#5C9BA4]/20', darkBg: 'bg-[#5C9BA4]/20', darkText: 'text-[#5C9BA4]' },
  'Urban Oasis': { bg: 'bg-[#4E5840]/10', text: 'text-[#4E5840]', border: 'border-[#4E5840]/30', icon: 'bg-[#4E5840]/20', darkBg: 'bg-[#4E5840]/20', darkText: 'text-[#4E5840]' },
  'Sunset Vista': { bg: 'bg-[#CDB261]/10', text: 'text-[#CDB261]', border: 'border-[#CDB261]/30', icon: 'bg-[#CDB261]/20', darkBg: 'bg-[#CDB261]/20', darkText: 'text-[#CDB261]' },
  'Pacific Suite': { bg: 'bg-[#A57865]/10', text: 'text-[#A57865]', border: 'border-[#A57865]/30', icon: 'bg-[#A57865]/20', darkBg: 'bg-[#A57865]/20', darkText: 'text-[#A57865]' },
  'Wellness Suite': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', icon: 'bg-emerald-200', darkBg: 'bg-emerald-500/20', darkText: 'text-emerald-300' },
  'Family Sanctuary': { bg: 'bg-[#C8B29D]/20', text: 'text-[#A57865]', border: 'border-[#C8B29D]', icon: 'bg-[#A57865]/20', darkBg: 'bg-[#C8B29D]/20', darkText: 'text-[#C8B29D]' },
  'Oceanfront Penthouse': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: 'bg-amber-200', darkBg: 'bg-amber-500/20', darkText: 'text-amber-300' }
};

const cleaningStatusConfig = {
  'clean': { label: 'Ready', color: 'text-sage-700', bg: 'bg-sage-50', dot: 'bg-sage-500', darkColor: 'text-sage-400', darkBg: 'bg-sage-500/20' },
  'dirty': { label: 'Needs Cleaning', color: 'text-gold-700', bg: 'bg-gold-50', dot: 'bg-gold-500', darkColor: 'text-gold-400', darkBg: 'bg-gold-500/20' },
  'inspected': { label: 'Inspected', color: 'text-ocean-700', bg: 'bg-ocean-50', dot: 'bg-ocean-500', darkColor: 'text-ocean-400', darkBg: 'bg-ocean-500/20' }
};

export default function AssignRoomModal({
  isOpen,
  onClose,
  booking,
  availableRooms = [],
  conflictingRooms = [],
  onAssign,
  onNotifyHousekeeping,
  hideBackdrop = false
}) {
  const { formatCurrency, symbol } = useCurrency();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showUpgradeFee, setShowUpgradeFee] = useState(false);
  const [upgradeFee, setUpgradeFee] = useState(0);
  const [showDirtyRoomConfirm, setShowDirtyRoomConfirm] = useState(false);
  const [pendingRoomAssignment, setPendingRoomAssignment] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setSelectedRoom(null);
      setSearchQuery('');
      // BUG-015 FIX: Default filter to booking's room type
      setFilterType(booking?.roomType || 'all');
      setShowUpgradeFee(false);
      setUpgradeFee(0);
    }
  }, [isOpen, booking?.roomType]);

  useEffect(() => {
    if (selectedRoom && booking) {
      const roomTypeOrder = ['Minimalist Studio', 'Coastal Retreat', 'Urban Oasis', 'Sunset Vista', 'Pacific Suite', 'Wellness Suite', 'Family Sanctuary', 'Oceanfront Penthouse'];
      const bookingTypeIndex = roomTypeOrder.indexOf(booking.roomType);
      const selectedTypeIndex = roomTypeOrder.indexOf(selectedRoom.type);

      if (selectedTypeIndex > bookingTypeIndex) {
        setShowUpgradeFee(true);
        // Use ratePerNight if available, otherwise derive from totalPrice or amount
        const currentRate = booking.ratePerNight || ((booking.totalPrice || booking.amount) / booking.nights);
        const priceDiff = (selectedRoom.price - currentRate) * booking.nights;
        setUpgradeFee(Math.max(0, Math.round(priceDiff)));
      } else {
        setShowUpgradeFee(false);
        setUpgradeFee(0);
      }
    }
  }, [selectedRoom, booking]);

  const filteredRooms = useMemo(() => {
    let rooms = [...availableRooms];

    if (searchQuery) {
      rooms = rooms.filter(room =>
        room.roomNumber.includes(searchQuery) ||
        room.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      rooms = rooms.filter(room => room.type === filterType);
    }

    rooms.sort((a, b) => {
      if (a.cleaning === 'clean' && b.cleaning !== 'clean') return -1;
      if (a.cleaning !== 'clean' && b.cleaning === 'clean') return 1;
      return a.roomNumber.localeCompare(b.roomNumber);
    });

    return rooms;
  }, [availableRooms, searchQuery, filterType]);

  const handleAssign = () => {
    if (!selectedRoom) return;

    // Check if room is dirty
    if (selectedRoom.cleaning === 'dirty') {
      setPendingRoomAssignment({ roomNumber: selectedRoom.roomNumber, upgradeFee });
      setShowDirtyRoomConfirm(true);
      return;
    }

    performAssignment(selectedRoom.roomNumber, upgradeFee);
  };

  const performAssignment = (roomNumber, fee) => {
    onAssign(booking.id, roomNumber, fee);
    onClose();
  };

  const handleNotifyHousekeeping = (room) => {
    if (onNotifyHousekeeping) {
      onNotifyHousekeeping(room.roomNumber);
    }
  };

  
  const roomTypes = ['all', 'Minimalist Studio', 'Coastal Retreat', 'Urban Oasis', 'Sunset Vista', 'Pacific Suite', 'Wellness Suite', 'Family Sanctuary', 'Oceanfront Penthouse'];

  if (!isOpen || !booking) return null;

  const drawerFooter = (
    <div className="flex items-center justify-end gap-2 sm:gap-3">
      <Button variant="outline" onClick={onClose} className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border-neutral-200/60 hover:bg-neutral-50">
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleAssign}
        disabled={!selectedRoom}
        className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold"
      >
        <span className="hidden sm:inline">Assign Room {selectedRoom && `${selectedRoom.roomNumber}`}</span>
        <span className="sm:hidden">Assign {selectedRoom && `#${selectedRoom.roomNumber}`}</span>
        {upgradeFee > 0 && ` (+${formatCurrency(upgradeFee)})`}
      </Button>
    </div>
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="max-w-2xl"
        footer={drawerFooter}
        noPadding
        hideBackdrop={hideBackdrop}
      >
        {/* Fixed Top Section */}
        <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-3 sm:pb-4 bg-white sticky top-0 z-10 border-b border-neutral-100">
          {/* Header Content */}
          <div className="mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight mb-0.5">
              {booking.roomNumber ? 'Change Room' : 'Assign Room'}
            </h2>
            <p className="text-xs sm:text-[13px] text-neutral-500 truncate">
              {booking.guestName} · {booking.id}
            </p>
          </div>

          {/* Booking Summary */}
          <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
            <span className="text-[8px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Booking Summary</span>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Current Room Card */}
              <div className="rounded-[10px] border border-neutral-200 bg-white p-2 sm:p-3">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-terra-50 flex items-center justify-center flex-shrink-0">
                    <Bed className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-terra-600" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-neutral-400">Current</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-neutral-900 truncate">
                  {booking.roomNumber || 'None'}
                </p>
                <p className="text-[9px] sm:text-[10px] text-neutral-500 truncate">{booking.roomType || 'N/A'}</p>
              </div>

              {/* New Room Card */}
              <div className={`rounded-[10px] border p-2 sm:p-3 transition-colors ${
                selectedRoom
                  ? 'border-terra-300 bg-terra-50/50'
                  : 'border-neutral-200 bg-white'
              }`}>
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                    selectedRoom ? 'bg-ocean-50' : 'bg-neutral-100'
                  }`}>
                    <ArrowRight className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${selectedRoom ? 'text-ocean-600' : 'text-neutral-400'}`} />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-neutral-400">New</span>
                </div>
                <p className={`text-sm sm:text-lg font-bold truncate ${selectedRoom ? 'text-terra-600' : 'text-neutral-300'}`}>
                  {selectedRoom ? selectedRoom.roomNumber : 'Select'}
                </p>
                <p className={`text-[9px] sm:text-[10px] truncate ${selectedRoom ? 'text-neutral-500' : 'text-neutral-400'}`}>
                  {selectedRoom?.type || 'Choose below'}
                </p>
              </div>

              {/* Total Card */}
              <div className="rounded-[10px] border border-neutral-200 bg-white p-2 sm:p-3">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gold-50 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-600" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-semibold uppercase tracking-widest text-neutral-400">Total</span>
                </div>
                <p className="text-sm sm:text-lg font-bold text-neutral-900">{formatCurrency(booking.totalPrice || booking.amount)}</p>
                <p className="text-[9px] sm:text-[10px] text-neutral-500">{booking.nights} nights</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <span className="text-[8px] sm:text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Available Rooms</span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onClear={() => setSearchQuery('')}
                  placeholder="Search room..."
                  size="sm"
                />
              </div>
              <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-neutral-100 overflow-x-auto hide-scrollbar">
                {roomTypes.slice(0, 4).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all duration-150 whitespace-nowrap ${
                      filterType === type
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {type === 'all' ? 'All' : type.split(' ')[0]}
                  </button>
                ))}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="sm:hidden px-2 py-1 text-[10px] font-semibold rounded-md bg-neutral-100 text-neutral-600 border-0 focus:ring-0"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-3 sm:space-y-4 px-4 sm:px-6 py-3 sm:py-4">
          {/* Conflicting Rooms Warning */}
          {conflictingRooms.length > 0 && (
            <div className="p-3 sm:p-4 rounded-[10px] border border-rose-200 bg-rose-50">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-semibold text-rose-700">
                    Rooms with conflicts
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-rose-600 mt-0.5 truncate">
                    Booked during selected dates: {conflictingRooms.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Room List */}
          <div className="space-y-2">
            {filteredRooms.length === 0 ? (
              <div className="p-6 sm:p-10 text-center rounded-[10px] border border-neutral-200 bg-white">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-neutral-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                </div>
                <p className="text-xs sm:text-[13px] font-semibold text-neutral-700">No rooms available</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1">
                  Try a different room type or date range
                </p>
              </div>
            ) : (
              filteredRooms.map(room => {
                const isSelected = selectedRoom?.id === room.id;
                const cleaningStatus = cleaningStatusConfig[room.cleaning] || cleaningStatusConfig.dirty;

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`rounded-[10px] border cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'border-terra-400 bg-terra-50/50'
                        : 'border-neutral-200 bg-white hover:border-terra-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-150 flex-shrink-0 ${
                          isSelected
                            ? 'bg-terra-500'
                            : 'bg-neutral-100'
                        }`}>
                          {isSelected ? (
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          ) : (
                            <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-500" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <p className="text-xs sm:text-[13px] font-semibold text-neutral-900">
                              Room {room.roomNumber}
                            </p>
                            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold rounded-md bg-neutral-100 text-neutral-600 truncate max-w-[80px] sm:max-w-none">
                              {room.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                            <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] text-neutral-500">
                              <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                              <span className="hidden sm:inline">Floor</span> {room.floor}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:inline">
                              {room.bedType}
                            </span>
                            <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] text-neutral-400">
                              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                              {room.capacity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs sm:text-[13px] font-bold text-neutral-900">
                            {formatCurrency(room.price)}
                            <span className="text-[9px] sm:text-[11px] font-normal text-neutral-400">/nt</span>
                          </p>
                          <div className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] font-semibold rounded-md ${cleaningStatus.bg} ${cleaningStatus.color}`}>
                            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${cleaningStatus.dot}`}></span>
                            <span className="hidden sm:inline">{cleaningStatus.label}</span>
                            <span className="sm:hidden">{cleaningStatus.label.split(' ')[0]}</span>
                          </div>
                        </div>
                        {room.cleaning === 'dirty' && (
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotifyHousekeeping(room);
                            }}
                            className="text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 sm:py-1 hidden sm:flex"
                          >
                            Notify
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* BUG-015 FIX: Room Type Mismatch Warning */}
          {selectedRoom && booking?.roomType &&
            selectedRoom.type.toLowerCase() !== booking.roomType.toLowerCase() && (
            <div className="rounded-[10px] border border-amber-300 bg-amber-50 p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-[13px] font-semibold text-amber-800">
                    Room Type Mismatch
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-amber-700 mt-0.5">
                    Guest booked <span className="font-semibold">{booking.roomType}</span> but selected room is{' '}
                    <span className="font-semibold">{selectedRoom.type}</span>.
                    Proceed only if upgrading or with guest consent.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade Fee Section */}
          {showUpgradeFee && selectedRoom && (
            <div className="rounded-[10px] border border-gold-200 bg-gold-50 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-gold-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-[13px] font-semibold text-gold-800">Room Upgrade</p>
                    <p className="text-[10px] sm:text-[11px] text-gold-600 mt-0.5 truncate">
                      {booking.roomType} → {selectedRoom.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-10 sm:pl-0">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-gold-700">Fee:</span>
                  <div className="relative">
                    <DollarSign className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
                    <input
                      type="number"
                      value={upgradeFee}
                      onChange={(e) => setUpgradeFee(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-20 sm:w-24 pl-6 sm:pl-7 pr-2 sm:pr-2.5 py-1.5 sm:py-2 rounded-lg border border-neutral-200 bg-white text-right text-xs sm:text-[13px] font-semibold focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>

      {/* Dirty Room Warning */}
      <ConfirmModal
        open={showDirtyRoomConfirm}
        onClose={() => {
          setShowDirtyRoomConfirm(false);
          setPendingRoomAssignment(null);
        }}
        onConfirm={() => {
          if (pendingRoomAssignment) {
            performAssignment(pendingRoomAssignment.roomNumber, pendingRoomAssignment.upgradeFee);
          }
          setShowDirtyRoomConfirm(false);
          setPendingRoomAssignment(null);
        }}
        title="Room Needs Cleaning"
        description={`Room ${selectedRoom?.roomNumber} is marked as needs cleaning and is not ready for guest occupancy. You can assign anyway (guest will wait) or choose a different room.`}
        variant="warning"
        confirmText="Assign Anyway"
        cancelText="Cancel"
        icon={AlertTriangle}
      />
    </>
  );
}
