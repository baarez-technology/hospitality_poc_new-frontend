import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Crown, Mail, Phone, Bed, Globe, Building2,
  Sparkles, Edit, XCircle, CheckCircle, Users,
  Calendar, ChevronDown, Check, Undo2, ArrowRightLeft, LogIn, LogOut, UserX, SprayCan, Clock,
  DollarSign, Receipt, Wallet, Trash2
} from 'lucide-react';
import { statusConfig, sourceConfig } from '../../data/bookingsData';
import { useCurrency } from '@/hooks/useCurrency';
import { precheckinService, type PreCheckInResponse } from '@/api/services/precheckin.service';
import { PreCheckInDetails } from '../shared/PreCheckInDetails';

const VIP_LEVEL_OPTIONS = [
  { value: null, label: 'Not VIP', icon: '', color: 'text-neutral-500', bg: 'bg-neutral-100', border: 'border-neutral-200' },
  { value: 1, label: 'VIP 1', icon: '⭐', color: 'text-[#CDB261]', bg: 'bg-[#CDB261]/10', border: 'border-[#CDB261]/30' },
  { value: 2, label: 'VIP 2', icon: '⭐', color: 'text-[#CDB261]', bg: 'bg-[#CDB261]/15', border: 'border-[#CDB261]/30' },
  { value: 3, label: 'VIP 3', icon: '🌟', color: 'text-[#A57865]', bg: 'bg-[#A57865]/10', border: 'border-[#A57865]/30' },
  { value: 4, label: 'VIP 4', icon: '🌟', color: 'text-[#A57865]', bg: 'bg-[#A57865]/15', border: 'border-[#A57865]/30' },
  { value: 5, label: 'VIP 5', icon: '💎', color: 'text-[#A57865]', bg: 'bg-[#A57865]/20', border: 'border-[#A57865]/40' },
];

export default function BookingDrawer({
  booking,
  isOpen,
  onClose,
  onStatusChange,
  onEditBooking,
  onAssignRoom,
  onCancelBooking,
  onCancelCheckIn,
  onCheckIn,
  onCheckOut,
  onMarkNoShow,
  onRequestCleaning,
  onOpenFolio,
  onViewBill,
  onVipLevelChange,
  onDeleteBooking,
}) {
  const { formatCurrency } = useCurrency();
  const [showStatusSuccess, setShowStatusSuccess] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [precheckinData, setPrecheckinData] = useState<PreCheckInResponse | null>(null);
  const [precheckinLoading, setPrecheckinLoading] = useState(false);

  // Fetch pre-check-in data when drawer opens
  useEffect(() => {
    if (!isOpen || !booking?.id) {
      setPrecheckinData(null);
      return;
    }
    let cancelled = false;
    setPrecheckinLoading(true);
    precheckinService.getByReservation(Number(booking.id))
      .then((data) => {
        if (!cancelled) setPrecheckinData(data);
      })
      .catch(() => {
        if (!cancelled) setPrecheckinData(null);
      })
      .finally(() => {
        if (!cancelled) setPrecheckinLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, booking?.id]);

  // ETA = pre-check-in arrival (arrival_time). ETD = pre-check-in departure (departure_time).
  // Use precheckin data first, then booking.eta/etd from list API as fallback.
  const eta = precheckinData?.arrival_time ?? booking?.eta ?? '—';
  const etd = precheckinData?.departure_time ?? booking?.etd ?? '—';

  // Same formatting as BookingsTable so ETA/ETD show identically everywhere.
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return '—';
    const trimmed = String(timeStr).trim();
    if (!trimmed || trimmed === '—') return '—';
    const parts = trimmed.split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1] ? parseInt(parts[1], 10) : 0;
    if (isNaN(h)) return trimmed;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        if (statusDropdownOpen) {
          setStatusDropdownOpen(false);
        } else {
          onClose();
        }
      }
    };

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const mainContent = document.querySelector('main');
    const mainScrollTop = mainContent ? mainContent.scrollTop : 0;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    let preventScrollHandler;
    if (mainContent) {
      mainContent.style.overflow = 'hidden';
      preventScrollHandler = (e) => {
        let target = e.target;
        let isInModalOrDrawer = false;

        while (target && target !== document.documentElement) {
          if (target.classList && target.classList.length > 0) {
            const classList = Array.from(target.classList);
            const hasModalDrawerClass = classList.some(cls =>
              cls.includes('z-50') || cls.includes('modal') || cls.includes('drawer')
            );
            const hasScrollableClass = classList.some(cls =>
              cls.includes('overflow-y-auto') || cls.includes('overflow-y-scroll')
            );
            const computedStyle = window.getComputedStyle(target);
            const isFixed = computedStyle.position === 'fixed' && target.classList.contains('z-50');

            if (hasModalDrawerClass || hasScrollableClass || isFixed) {
              isInModalOrDrawer = true;
              break;
            }
          }
          target = target.parentElement;
        }

        if (!isInModalOrDrawer) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      };
      document.addEventListener('wheel', preventScrollHandler, { passive: false, capture: true });
      document.addEventListener('touchmove', preventScrollHandler, { passive: false, capture: true });
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      if (mainContent && preventScrollHandler) {
        mainContent.style.overflow = '';
        document.removeEventListener('wheel', preventScrollHandler, { capture: true });
        document.removeEventListener('touchmove', preventScrollHandler, { capture: true });
        if (mainContent.scrollTop !== mainScrollTop) {
          mainContent.scrollTop = mainScrollTop;
        }
      }
      window.scrollTo(scrollX, scrollY);
    };
  }, [isOpen, onClose, statusDropdownOpen]);

  if (!booking) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    // Append T12:00:00 to date-only strings to prevent UTC midnight timezone shift
    const safe = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
    const date = new Date(safe);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const source = sourceConfig[booking.source];

  const statusOptions = [
    { value: 'CONFIRMED', label: 'Confirmed', color: 'text-emerald-600', bg: 'bg-emerald-500' },
    { value: 'PENDING', label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-500' },
    { value: 'CHECKED-IN', label: 'Checked In', color: 'text-blue-600', bg: 'bg-blue-500' },
    { value: 'CHECKED-OUT', label: 'Checked Out', color: 'text-neutral-600', bg: 'bg-neutral-500' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'text-rose-600', bg: 'bg-rose-500' },
  ];

  const getStatusConfig = (statusKey) => {
    const config = {
      'CONFIRMED': { bg: 'bg-emerald-500', text: 'text-emerald-700', label: 'Confirmed' },
      'PENDING': { bg: 'bg-amber-500', text: 'text-amber-700', label: 'Pending' },
      'CHECKED-IN': { bg: 'bg-blue-500', text: 'text-blue-700', label: 'Checked In' },
      'CHECKED-OUT': { bg: 'bg-neutral-400', text: 'text-neutral-600', label: 'Checked Out' },
      'CANCELLED': { bg: 'bg-rose-500', text: 'text-rose-600', label: 'Cancelled' },
      'NO-SHOW': { bg: 'bg-orange-500', text: 'text-orange-600', label: 'No Show' },
      'NO_SHOW': { bg: 'bg-orange-500', text: 'text-orange-600', label: 'No Show' },
    };
    return config[statusKey] || config['PENDING'];
  };

  const statusConf = getStatusConfig(booking.status);

  const handleStatusChange = (newStatus) => {
    onStatusChange(booking.id, newStatus);
    setStatusDropdownOpen(false);
    setShowStatusSuccess(true);
    setTimeout(() => setShowStatusSuccess(false), 2000);
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Drawer - slides from right */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] md:w-[480px] lg:w-[520px] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div
          className="bg-white shadow-2xl w-full h-full flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-neutral-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-terra-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    {(booking.guest || booking.guestName || 'G').split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">{booking.guest}</h2>
                    {(booking.vip || booking.vipLevel) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#CDB261]/10 text-[#CDB261] rounded-md text-[10px] font-bold border border-[#CDB261]/30 flex-shrink-0">
                        <Crown className="w-3 h-3" />
                        VIP{booking.vipLevel ? ` ${booking.vipLevel}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-[13px] text-neutral-400 truncate">{booking.bookingNumber || booking.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Status Badge with Dropdown */}
            <div className="mt-4 relative" ref={dropdownRef}>
              {(() => {
                const statusNorm = (booking?.status || '').toUpperCase().replace(/[\s_]/g, '-');
                const isCheckedInStatus = statusNorm === 'IN-HOUSE' || statusNorm === 'CHECKED-IN';
                const isTerminalStatus = statusNorm === 'CANCELLED' || statusNorm === 'CHECKED-OUT' || statusNorm === 'COMPLETED' || statusNorm === 'NO-SHOW' || statusNorm === 'NO_SHOW';

                // Post check-in and terminal statuses: show static badge (no dropdown)
                if (isCheckedInStatus || isTerminalStatus) {
                  return (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100">
                      <span className={`w-2 h-2 rounded-full ${statusConf.bg}`}></span>
                      <span className={`text-sm font-medium ${statusConf.text}`}>{statusConf.label}</span>
                    </span>
                  );
                }

                // Pre check-in statuses: allow status change via dropdown
                return (
                  <>
                    <button
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
                    >
                      <span className={`w-2 h-2 rounded-full ${statusConf.bg}`}></span>
                      <span className={`text-sm font-medium ${statusConf.text}`}>{statusConf.label}</span>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {statusDropdownOpen && (
                      <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-[10px] shadow-lg border border-neutral-200 py-1 z-[60]">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13px] hover:bg-neutral-50 transition-colors ${
                              booking.status === option.value ? 'bg-neutral-50' : ''
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${option.bg}`}></span>
                            <span className={`font-medium ${option.color}`}>{option.label}</span>
                            {booking.status === option.value && (
                              <Check className="w-4 h-4 text-terra-500 ml-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}

              {showStatusSuccess && (
                <span className="ml-3 text-[13px] text-sage-600 inline-flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Updated
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-5 pt-5">
              {/* Stay Details */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-neutral-50 rounded-[10px]">
                <div className="text-center">
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 mb-1">Check-in</p>
                  <p className="text-xs sm:text-[13px] font-semibold text-neutral-900">{formatDate(booking.checkIn)}</p>
                </div>
                <div className="text-center border-x border-neutral-200">
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 mb-1">Duration</p>
                  <p className="text-xs sm:text-[13px] font-semibold text-neutral-900">{booking.nights} nights</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 mb-1">Check-out</p>
                  <p className="text-xs sm:text-[13px] font-semibold text-neutral-900">{formatDate(booking.checkOut)}</p>
                </div>
              </div>

              {/* Actual Checkout Date — shown for checked-out bookings */}
              {booking.checkedOutAt && (booking.status === 'COMPLETED' || booking.status === 'CHECKED-OUT' || booking.status === 'checked-out') && (
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-sage-50 rounded-[10px]">
                  <LogOut className="w-3.5 h-3.5 text-sage-600 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-sage-700">
                    <span className="font-medium">Checked out:</span>{' '}
                    {new Date(booking.checkedOutAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                    at {new Date(booking.checkedOutAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {/* Room & Guests */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-neutral-50 rounded-[10px]">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <Bed className="w-4 h-4" />
                    <span className="text-[10px] sm:text-[11px] font-medium">Room</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-neutral-900">
                    {typeof booking.room === 'object' ? (booking.room?.number || booking.room?.name || 'Not assigned') : (booking.room || 'Not assigned')}
                  </p>
                  <p className="text-xs sm:text-[13px] text-neutral-500">{booking.roomType || booking.room_type}</p>
                </div>
                <div className="p-3 sm:p-4 bg-neutral-50 rounded-[10px]">
                  <div className="flex items-center gap-2 text-neutral-500 mb-2">
                    <Users className="w-4 h-4" />
                    <span className="text-[10px] sm:text-[11px] font-medium">Guests</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-neutral-900">
                    {booking.adults || 1} Adult{(booking.adults || 1) !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs sm:text-[13px] text-neutral-500">
                    {booking.children > 0
                      ? `${booking.children} Child${booking.children !== 1 ? 'ren' : ''}`
                      : 'No children'}
                  </p>
                </div>
              </div>

              {/* ETA / ETD from Pre-Check-In - above Contact (always visible) */}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Arrival & Departure Times</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 sm:p-4 bg-neutral-50 rounded-[10px]">
                    <div className="flex items-center gap-2 text-neutral-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] sm:text-[11px] font-medium">ETA</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-neutral-900">
                      {formatTimeDisplay(eta)}
                    </p>
                    <p className="text-xs sm:text-[13px] text-neutral-500">Expected Arrival</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-neutral-50 rounded-[10px]">
                    <div className="flex items-center gap-2 text-neutral-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-[10px] sm:text-[11px] font-medium">ETD</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-neutral-900">
                      {formatTimeDisplay(etd)}
                    </p>
                    <p className="text-xs sm:text-[13px] text-neutral-500">Expected Departure</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Contact</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-[10px]">
                    <Mail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-xs sm:text-[13px] text-neutral-700 truncate">{booking.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-[10px]">
                    <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-xs sm:text-[13px] text-neutral-700">{booking.phone}</span>
                  </div>
                </div>
              </div>

              {/* VIP Level */}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">VIP Level</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {VIP_LEVEL_OPTIONS.map((opt) => {
                    const isActive = (booking.vipLevel || null) === opt.value;
                    return (
                      <button
                        key={opt.value ?? 'none'}
                        onClick={() => onVipLevelChange && onVipLevelChange(booking.id, opt.value)}
                        className={`py-2 px-1 rounded-lg border text-center transition-all duration-200 ${
                          isActive
                            ? `${opt.border} ${opt.bg} ring-2 ring-terra-500/10`
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <span className="block text-sm">{opt.icon || '—'}</span>
                        <span className={`block text-[9px] sm:text-[10px] font-semibold mt-0.5 ${
                          isActive ? opt.color : 'text-neutral-400'
                        }`}>
                          {opt.value ? `VIP${opt.value}` : 'None'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Source */}
              <div className="flex items-center gap-2 sm:gap-3 p-3 bg-neutral-50 rounded-[10px]">
                <Globe className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span className="text-xs sm:text-[13px] text-neutral-500">Booked via</span>
                <span className={`text-xs sm:text-[13px] font-medium ${source?.color || 'text-neutral-700'}`}>
                  {booking.source}
                </span>
              </div>

              {/* GST Number - show if present */}
              {booking.gstNumber && (
                <div className="flex items-center gap-2 sm:gap-3 p-3 bg-blue-50 rounded-[10px] border border-blue-100">
                  <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-[13px] text-blue-600">GST Number</span>
                  <span className="text-xs sm:text-[13px] font-semibold text-blue-700">
                    {booking.gstNumber}
                  </span>
                </div>
              )}

              {/* Special Requests */}
              {booking.specialRequests && booking.specialRequests !== 'None' && (
                <div className="p-3 sm:p-4 bg-gold-50 rounded-[10px]">
                  <p className="text-[10px] font-semibold text-gold-700 uppercase tracking-widest mb-2">Special Requests</p>
                  <p className="text-xs sm:text-[13px] text-gold-900">{booking.specialRequests}</p>
                </div>
              )}

              {/* Pre Check-In Details */}
              <PreCheckInDetails data={precheckinData} isLoading={precheckinLoading} />

              {/* Upsells */}
              {booking.upsells && booking.upsells.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Sparkles className="w-4 h-4 text-ocean-500" />
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">Add-ons</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {booking.upsells.map((upsell, index) => (
                      <span
                        key={index}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-ocean-50 text-ocean-600 rounded-full text-xs sm:text-[13px] font-medium"
                      >
                        {upsell}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Billing Summary */}
              <div className="p-3 sm:p-4 bg-terra-50 rounded-[10px] border border-terra-100 space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-terra-600" />
                  <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">Billing Summary</p>
                </div>

                {/* KPI Grid: Total, Paid, Balance - uses stored values from booking */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/80 rounded-lg p-2.5 border border-terra-100">
                    <p className="text-[9px] sm:text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-0.5">Total</p>
                    <p className="text-sm sm:text-base font-bold text-neutral-900">
                      {formatCurrency(booking.totalPrice || booking.total || booking.amount || 0)}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2.5 border border-emerald-200/60">
                    <p className="text-[9px] sm:text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-0.5">Paid</p>
                    <p className="text-sm sm:text-base font-bold text-emerald-600">
                      {formatCurrency(booking.amountPaid || booking.depositAmount || booking.deposit_amount || 0)}
                    </p>
                  </div>
                  <div className="bg-white/80 rounded-lg p-2.5 border border-amber-200/60">
                    <p className="text-[9px] sm:text-[10px] font-medium text-neutral-500 uppercase tracking-wider mb-0.5">Balance</p>
                    <p className={`text-sm sm:text-base font-bold ${(booking.balanceDue || 0) > 0 ? 'text-amber-600' : 'text-neutral-400'}`}>
                      {formatCurrency(booking.balanceDue ?? booking.balance_due ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Rate per night + Payment Status */}
                <div className="flex items-center justify-between text-xs sm:text-[13px]">
                  <span className="text-neutral-600">
                    Avg. {formatCurrency(Math.round((booking.totalPrice || booking.total || booking.amount || 0) / (booking.nights || 1)))}/night
                  </span>
                  {(() => {
                    const ps = (booking.paymentStatus || booking.payment_status || 'pending').toLowerCase();
                    const psMap: Record<string, { label: string; cls: string }> = {
                      paid: { label: 'Paid', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                      partial: { label: 'Partial', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
                      pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
                      refunded: { label: 'Refunded', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
                      failed: { label: 'Failed', cls: 'bg-red-100 text-red-700 border-red-200' },
                    };
                    const cfg = psMap[ps] || psMap.pending;
                    return (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Billing Action Buttons */}
                <div className="flex gap-2 pt-0.5">
                  <button
                    onClick={() => onOpenFolio && onOpenFolio()}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] sm:text-[12px] font-medium text-terra-700 bg-white border border-terra-200 rounded-lg hover:bg-terra-50 transition-colors"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Open Folio
                  </button>
                  <button
                    onClick={() => onViewBill && onViewBill()}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] sm:text-[12px] font-medium text-neutral-700 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Guest Bill
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Status-aware action buttons with date guards */}
          <div className="flex-shrink-0 border-t border-neutral-100 p-3 sm:p-4 bg-white">
            {(() => {
              const status = (booking?.status || '').toUpperCase().replace(/[\s_]/g, '-');
              const isCheckedIn = status === 'IN-HOUSE' || status === 'CHECKED-IN';
              const isCancelled = status === 'CANCELLED';
              const isCompleted = status === 'CHECKED-OUT' || status === 'COMPLETED';
              const isNoShowStatus = status === 'NO-SHOW' || status === 'NO_SHOW';
              const roomValue = typeof booking?.room === 'object' ? booking.room?.number : booking?.room;
              const hasRoom = roomValue && roomValue !== 'Unassigned' && roomValue !== 'Not assigned';

              // Date guards
              const today = new Date().toISOString().split('T')[0];
              const checkOut = booking?.checkOut || booking?.departure_date;
              const checkIn = booking?.checkIn || booking?.arrival_date;
              const expired = checkOut && checkOut < today;
              const arrivalPassed = checkIn && checkIn < today;

              const canDoCheckIn = (status === 'CONFIRMED' || status === 'PENDING' || status === 'BOOKED') && hasRoom && !expired;
              const canDoNoShow = (status === 'CONFIRMED' || status === 'PENDING' || status === 'BOOKED') && arrivalPassed;
              const isTerminal = isCancelled || isCompleted || isNoShowStatus;

              // Post check-in: show Edit, Room Move, Cancel Check-in, and Check Out
              if (isCheckedIn) {
                return (
                  <div className="space-y-2">
                    <button
                      onClick={onEditBooking}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-terra-500 hover:bg-terra-600 text-white rounded-lg text-[13px] font-medium transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Booking
                    </button>
                    <button
                      onClick={() => onRequestCleaning && onRequestCleaning()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-sage-200 text-sage-700 hover:bg-sage-50 rounded-lg text-[13px] font-medium transition-colors"
                    >
                      <SprayCan className="w-4 h-4" />
                      Request Cleaning
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => onCancelCheckIn && onCancelCheckIn()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg text-[13px] font-medium transition-colors"
                      >
                        <Undo2 className="w-4 h-4" />
                        Cancel Check-in
                      </button>
                      <button
                        onClick={onAssignRoom}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[13px] font-medium transition-colors"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        Room Move
                      </button>
                      <button
                        onClick={() => onCheckOut && onCheckOut()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[13px] font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Check Out
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* No Show button - for past confirmed bookings where guest never showed up */}
                  {canDoNoShow ? (
                    <button
                      onClick={() => onMarkNoShow && onMarkNoShow()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-orange-200 text-orange-700 hover:bg-orange-50 rounded-lg text-[13px] font-medium transition-colors"
                    >
                      <UserX className="w-4 h-4" />
                      No Show
                    </button>
                  ) : (
                    <button
                      onClick={() => onCancelBooking && onCancelBooking()}
                      disabled={isTerminal || expired}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-neutral-200 text-neutral-600 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  )}

                  {/* Check In / Assign button - hidden for expired */}
                  {canDoCheckIn ? (
                    <button
                      onClick={() => onCheckIn && onCheckIn()}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[13px] font-medium transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Check In
                    </button>
                  ) : !expired && !isTerminal ? (
                    <button
                      onClick={onAssignRoom}
                      disabled={isTerminal}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Bed className="w-4 h-4" />
                      {hasRoom ? 'Reassign' : 'Assign'}
                    </button>
                  ) : null}

                  {/* Edit button */}
                  <button
                    onClick={onEditBooking}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-terra-500 hover:bg-terra-600 text-white rounded-lg text-[13px] font-medium transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              );
            })()}

            {/* Devmaster-only: Permanently Delete */}
            {onDeleteBooking && (
              <>
                <div className="border-t-2 border-red-100 mt-3 pt-3">
                  <button
                    onClick={() => onDeleteBooking(booking)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-[13px] font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Permanently Delete Entry
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
