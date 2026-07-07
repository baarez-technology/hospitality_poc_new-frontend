import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Crown, Mail, Phone, Bed, Globe, Sparkles, Edit, XCircle,
  CheckCircle, Users, Calendar, ChevronDown, Check, MapPin,
  CreditCard, Clock, MessageSquare, ArrowRight,
  FileText, History, Copy, ExternalLink, Shield, Star
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

/**
 * Enhanced Booking Drawer
 * Premium slide-over panel with comprehensive booking details
 */
export default function EnhancedBookingDrawer({
  booking,
  isOpen,
  onClose,
  onStatusChange,
  onEditBooking,
  onAssignRoom,
  onCancelBooking,
}) {
  const { formatCurrency } = useCurrency();
  const [showStatusSuccess, setShowStatusSuccess] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [copiedField, setCopiedField] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key and body scroll
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

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, statusDropdownOpen]);

  // Reset tab when drawer opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('details');
    }
  }, [isOpen, booking?.id]);

  if (!booking) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusOptions = [
    { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-ocean-500', textColor: 'text-ocean-700' },
    { value: 'PENDING', label: 'Pending', color: 'bg-gold-500', textColor: 'text-gold-700' },
    { value: 'CHECKED-IN', label: 'Checked In', color: 'bg-sage-500', textColor: 'text-sage-700' },
    { value: 'CHECKED-OUT', label: 'Checked Out', color: 'bg-neutral-400', textColor: 'text-neutral-600' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-rose-500', textColor: 'text-rose-600' },
  ];

  const currentStatus = statusOptions.find(s => s.value === booking.status) || statusOptions[1];

  const handleStatusChange = (newStatus) => {
    onStatusChange(booking.id, newStatus);
    setStatusDropdownOpen(false);
    setShowStatusSuccess(true);
    setTimeout(() => setShowStatusSuccess(false), 2000);
  };

  // Simulated activity timeline
  const activityTimeline = [
    { type: 'created', time: booking.bookedOn, label: 'Booking created', icon: FileText },
    { type: 'confirmed', time: booking.bookedOn, label: 'Payment confirmed', icon: CreditCard },
    ...(booking.status === 'CHECKED-IN' ? [
      { type: 'checkin', time: booking.checkIn, label: 'Guest checked in', icon: CheckCircle }
    ] : []),
    ...(booking.status === 'CHECKED-OUT' ? [
      { type: 'checkout', time: booking.checkOut, label: 'Guest checked out', icon: ArrowRight }
    ] : []),
  ];

  const tabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'activity', label: 'Activity', icon: History },
  ];

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/40 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-full max-w-xl
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-br from-terra-50 to-copper-50 border-b border-terra-100">
            <div className="p-6 pb-4">
              {/* Close Button */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  {/* Guest Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-terra-400 to-terra-600 flex items-center justify-center shadow-lg">
                    <span className="text-xl font-bold text-white">
                      {booking.guest.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-neutral-900">{booking.guest}</h2>
                      {booking.vip && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-gold-100 rounded-full">
                          <Crown className="w-3.5 h-3.5 text-gold-600" />
                          <span className="text-xs font-bold text-gold-700">VIP</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 font-mono">{booking.id}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-terra-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Status Badge with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                  className="
                    inline-flex items-center gap-2 px-4 py-2 rounded-xl
                    bg-white/80 backdrop-blur-sm border border-neutral-200/80
                    hover:bg-white transition-colors shadow-sm
                  "
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${currentStatus.color}`} />
                  <span className={`text-sm font-semibold ${currentStatus.textColor}`}>
                    {currentStatus.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${statusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {statusDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-neutral-200 py-2 z-60">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                          ${booking.status === option.value ? 'bg-neutral-50' : 'hover:bg-neutral-50'}
                        `}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${option.color}`} />
                        <span className={`font-medium ${option.textColor}`}>{option.label}</span>
                        {booking.status === option.value && (
                          <Check className="w-4 h-4 text-terra-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {showStatusSuccess && (
                  <span className="ml-3 text-sm text-sage-600 inline-flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Updated
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium
                      border-b-2 transition-colors
                      ${activeTab === tab.id
                        ? 'text-terra-700 border-terra-500'
                        : 'text-neutral-500 border-transparent hover:text-neutral-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                {/* Stay Overview Card */}
                <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-2xl p-5 border border-neutral-200/50">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Stay Overview</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">{formatDate(booking.checkIn).split(',')[0]}</p>
                      <p className="text-xs text-neutral-500 mt-1">Check-in</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-px bg-neutral-300" />
                        <div className="px-3 py-1 bg-terra-100 rounded-full">
                          <span className="text-sm font-bold text-terra-700">{booking.nights}n</span>
                        </div>
                        <div className="w-8 h-px bg-neutral-300" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neutral-900">{formatDate(booking.checkOut).split(',')[0]}</p>
                      <p className="text-xs text-neutral-500 mt-1">Check-out</p>
                    </div>
                  </div>
                </div>

                {/* Room & Guests */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                    <div className="flex items-center gap-2 text-neutral-500 mb-3">
                      <Bed className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Room</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">
                      {booking.room ? `#${booking.room}` : 'Not Assigned'}
                    </p>
                    <p className="text-sm text-neutral-500 mt-1">{booking.roomType}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-neutral-200 shadow-sm">
                    <div className="flex items-center gap-2 text-neutral-500 mb-3">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Guests</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-900">{typeof booking.guests === 'object' ? (booking.guests?.adults || 0) + (booking.guests?.children || 0) : (booking.guests || 0)}</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      {typeof booking.guests === 'object' ? `${booking.guests?.adults || 0} Adults${booking.guests?.children ? `, ${booking.guests.children} Children` : ''}` : (booking.guests === 1 ? 'Adult' : 'Adults')}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-700">{booking.email}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(booking.email, 'email')}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-neutral-200 rounded-lg transition-all"
                      >
                        {copiedField === 'email' ? (
                          <Check className="w-4 h-4 text-sage-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm text-neutral-700">{booking.phone}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(booking.phone, 'phone')}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-neutral-200 rounded-lg transition-all"
                      >
                        {copiedField === 'phone' ? (
                          <Check className="w-4 h-4 text-sage-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Booking Source */}
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-neutral-400" />
                    <div>
                      <p className="text-xs text-neutral-500">Booked via</p>
                      <p className="text-sm font-semibold text-neutral-700">{booking.source}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-400" />
                </div>

                {/* Special Requests */}
                {booking.specialRequests && booking.specialRequests !== 'None' && (
                  <div className="p-4 bg-gold-50 rounded-xl border border-gold-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gold-600" />
                      <span className="text-xs font-bold text-gold-700 uppercase tracking-wider">Special Requests</span>
                    </div>
                    <p className="text-sm text-gold-900">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Upsells / Add-ons */}
                {booking.upsells && booking.upsells.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-ocean-500" />
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Add-ons & Packages</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {booking.upsells.map((upsell, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-ocean-50 text-ocean-700 rounded-lg text-sm font-medium border border-ocean-200/50"
                        >
                          {upsell}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="p-6 space-y-6">
                {/* Total Amount Card */}
                <div className="bg-gradient-to-br from-terra-500 to-terra-600 rounded-2xl p-6 text-white">
                  <p className="text-terra-200 text-sm font-medium mb-1">Total Amount</p>
                  <p className="text-4xl font-bold">{formatCurrency(booking.totalPrice || booking.amount)}</p>
                  <div className="mt-4 pt-4 border-t border-terra-400/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-terra-200">Average per night</span>
                      <span className="font-semibold">{formatCurrency(booking.ratePerNight || Math.round((booking.totalPrice || booking.amount) / booking.nights))}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{booking.roomType}</p>
                        <p className="text-xs text-neutral-500">{booking.nights} nights x {formatCurrency(booking.ratePerNight || Math.round((booking.basePrice || (booking.totalPrice || booking.amount) * 0.85) / booking.nights))}</p>
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(booking.basePrice || Math.round((booking.totalPrice || booking.amount) * 0.85))}
                      </span>
                    </div>

                    {booking.upsells && booking.upsells.length > 0 && booking.upsells.map((upsell, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-neutral-100">
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{upsell}</p>
                          <p className="text-xs text-neutral-500">Add-on package</p>
                        </div>
                        <span className="text-sm font-semibold text-neutral-900">
                          {formatCurrency(Math.round((booking.totalPrice || booking.amount) * 0.05))}
                        </span>
                      </div>
                    ))}

                    <div className="flex items-center justify-between py-3 border-b border-neutral-100">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">Taxes & Fees</p>
                        <p className="text-xs text-neutral-500">Includes service charge</p>
                      </div>
                      <span className="text-sm font-semibold text-neutral-900">
                        {formatCurrency(booking.taxes || Math.round((booking.totalPrice || booking.amount) * 0.1))}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 bg-neutral-50 rounded-xl px-4 -mx-4">
                      <span className="text-sm font-bold text-neutral-900">Total</span>
                      <span className="text-lg font-bold text-terra-600">
                        {formatCurrency(booking.totalPrice || booking.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className={`p-4 rounded-xl border ${
                  booking.paymentStatus === 'paid'
                    ? 'bg-sage-50 border-sage-200/50'
                    : 'bg-amber-50 border-amber-200/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      booking.paymentStatus === 'paid' ? 'bg-sage-500' : 'bg-amber-500'
                    }`}>
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${
                        booking.paymentStatus === 'paid' ? 'text-sage-800' : 'text-amber-800'
                      }`}>
                        {booking.paymentStatus === 'paid' ? 'Payment Confirmed' : 'Payment Pending'}
                      </p>
                      <p className={`text-xs ${
                        booking.paymentStatus === 'paid' ? 'text-sage-600' : 'text-amber-600'
                      }`}>
                        {booking.paymentMethod === 'qr_code' ? (
                          <>QR Code Payment {booking.paymentReference ? `(Ref: ****${booking.paymentReference})` : ''}</>
                        ) : booking.paymentMethod === 'pay_at_hotel' ? (
                          'Pay at Hotel'
                        ) : (
                          `${booking.paymentMethod || 'Card'} payment`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="p-6">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Activity Timeline</h3>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-neutral-200" />

                  {/* Timeline Items */}
                  <div className="space-y-6">
                    {activityTimeline.map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex gap-4 relative">
                          <div className="relative z-10 w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
                            <Icon className="w-4 h-4 text-neutral-600" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm font-medium text-neutral-900">{activity.label}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              {formatDate(activity.time)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Current Status Indicator */}
                    <div className="flex gap-4 relative">
                      <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${currentStatus.color}`}>
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-sm font-medium text-neutral-900">Current: {currentStatus.label}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Updated just now</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex-shrink-0 border-t border-neutral-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onCancelBooking?.()}
                disabled={booking?.status === 'CANCELLED'}
                className="
                  flex-1 flex items-center justify-center gap-2 px-4 py-3
                  border border-neutral-200 text-neutral-600
                  hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50
                  rounded-xl text-sm font-medium
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all
                "
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={onAssignRoom}
                className="
                  flex-1 flex items-center justify-center gap-2 px-4 py-3
                  bg-neutral-100 hover:bg-neutral-200 text-neutral-700
                  rounded-xl text-sm font-medium transition-all
                "
              >
                <Bed className="w-4 h-4" />
                Assign
              </button>
              <button
                onClick={onEditBooking}
                className="
                  flex-1 flex items-center justify-center gap-2 px-4 py-3
                  bg-gradient-to-r from-terra-500 to-terra-600
                  hover:from-terra-600 hover:to-terra-700
                  text-white rounded-xl text-sm font-medium
                  shadow-lg shadow-terra-500/20
                  transition-all
                "
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
