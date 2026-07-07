/**
 * CBS BookingDrawer Component - Premium Design
 * Consistent with NewBookingModal - Glimmora Design System
 * Full booking details modal with inline editing, payments, and activity log
 */

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Crown, Mail, Phone, Bed, Users,
  ChevronDown, Check, CreditCard, Clock, AlertTriangle,
  Sparkles, DollarSign, History, Brain, ClipboardCheck,
  PenLine, Calendar, Copy, CheckCircle2, Moon, ChevronRight,
  Info, Upload, Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, IconButton } from '../ui2/Button';
import { Select } from '../ui2/Input';
import { StatusBadge, Badge } from '../ui2/Badge';
import { Drawer } from '../ui2/Drawer';
import { statusConfig, sourceConfig } from '../../data/cbs/sampleBookings';
import { useCurrency } from '@/hooks/useCurrency';
import { precheckinService, type PreCheckInResponse } from '@/api/services/precheckin.service';
import { PreCheckInDetails } from '../shared/PreCheckInDetails';

const statusOptions = [
  { value: 'CONFIRMED', label: 'Confirmed', color: 'text-ocean-600', bg: 'bg-ocean-500', dotBg: 'bg-ocean-500', lightBg: 'bg-ocean-50' },
  { value: 'PENDING', label: 'Pending', color: 'text-gold-600', bg: 'bg-gold-500', dotBg: 'bg-gold-500', lightBg: 'bg-gold-50' },
  { value: 'CHECKED-IN', label: 'Checked In', color: 'text-sage-600', bg: 'bg-sage-500', dotBg: 'bg-sage-500', lightBg: 'bg-sage-50' },
  { value: 'CHECKED-OUT', label: 'Checked Out', color: 'text-neutral-500', bg: 'bg-neutral-400', dotBg: 'bg-neutral-400', lightBg: 'bg-neutral-100' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'text-rose-600', bg: 'bg-rose-500', dotBg: 'bg-rose-500', lightBg: 'bg-rose-50' }
];

const paymentMethodOptions = [
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit Card', label: 'Debit Card' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' }
];

export default function BookingDrawer({
  booking,
  isOpen,
  onClose,
  onStatusChange,
  onUpdateBooking,
  onAssignRoom,
  onCancelBooking,
  onAddPayment,
  aiInsights = []
}) {
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('details');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [precheckinData, setPrecheckinData] = useState<PreCheckInResponse | null>(null);
  const [precheckinLoading, setPrecheckinLoading] = useState(false);

  // Fetch pre-check-in data when drawer opens
  useEffect(() => {
    if (!isOpen || !booking) {
      setPrecheckinData(null);
      return;
    }
    const reservationId = Number(booking.dbId || booking.id);
    if (!reservationId) return;
    let cancelled = false;
    setPrecheckinLoading(true);
    precheckinService.getByReservation(reservationId)
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
  }, [isOpen, booking?.dbId, booking?.id]);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  const startEditing = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveField = (field) => {
    const fieldMap = {
      name: 'guestName',
      email: 'guestEmail',
      phone: 'guestPhone',
    };
    onUpdateBooking(booking.id, { [fieldMap[field]]: editValue });
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter' && field !== 'requests') {
      saveField(field);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
        } else if (editingField) {
          cancelEditing();
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
  }, [isOpen, onClose, statusDropdownOpen, editingField]);

  if (!isOpen || !booking) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const safe = dateString.includes('T') ? dateString : `${dateString}T12:00:00`;
    const date = new Date(safe);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const source = sourceConfig[booking.source];
  const currentStatusOption = statusOptions.find(s => s.value === booking.status) || statusOptions[1];

  const handleStatusChange = (newStatus) => {
    onStatusChange(booking.id, newStatus);
    setStatusDropdownOpen(false);
  };

  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    onAddPayment(booking.id, {
      amount: parseFloat(paymentAmount),
      method: paymentMethod
    });
    setPaymentAmount('');
    setShowPaymentForm(false);
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: Bed },
    { id: 'precheckin', label: 'Pre Check-In', icon: ClipboardCheck },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'activity', label: 'Activity', icon: History },
    { id: 'insights', label: 'AI Insights', icon: Brain, badge: aiInsights.length }
  ];

  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const drawerFooter = (
    <div className="flex items-center justify-end gap-2 sm:gap-3 w-full">
      <Button
        variant="outline"
        onClick={onClose}
        className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-[13px] font-semibold"
      >
        Close
      </Button>
      <Button
        variant="primary"
        onClick={onAssignRoom}
        className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-[13px] font-semibold"
      >
        {booking.roomNumber ? 'Change Room' : 'Assign Room'}
      </Button>
    </div>
  );

  const drawerHeader = (
    <div className="space-y-3 sm:space-y-4">
      {/* Guest Info Header */}
      <div className="flex items-start gap-2.5 sm:gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold",
            booking.isVip
              ? "bg-gold-500 text-white"
              : "bg-terra-500 text-white"
          )}>
            {getInitials(booking.guestName)}
          </div>
          {booking.isVip && (
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gold-500 rounded-full flex items-center justify-center ring-2 ring-white">
              <Crown className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {editingField === 'name' ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'name')}
                className="text-sm sm:text-lg font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-900 min-w-[140px] sm:min-w-[200px] outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
              />
              <IconButton
                icon={Check}
                variant="primary"
                size="sm"
                label="Save"
                onClick={() => saveField('name')}
              />
              <IconButton
                icon={X}
                variant="subtle"
                size="sm"
                label="Cancel"
                onClick={cancelEditing}
              />
            </div>
          ) : (
            <button
              onClick={() => startEditing('name', booking.guestName)}
              className="group flex items-center gap-1.5 sm:gap-2 rounded-lg"
            >
              <h2 className="text-sm sm:text-lg font-semibold text-neutral-900 tracking-tight truncate">
                {booking.guestName}
              </h2>
              <PenLine className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-300 group-hover:text-terra-500 transition-colors flex-shrink-0" />
            </button>
          )}
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-mono mt-0.5 truncate">{booking.bookingNumber || booking.id}</p>
        </div>
      </div>

      {/* Status and Source badges */}
      <div className="flex items-center flex-wrap gap-1.5 sm:gap-2" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
            className={cn(
              "inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border transition-all duration-150",
              statusDropdownOpen
                ? "border-terra-300 bg-white"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", currentStatusOption.dotBg)} />
            <span className={cn("text-xs sm:text-[13px] font-medium", currentStatusOption.color)}>
              {currentStatusOption.label}
            </span>
            <ChevronDown className={cn(
              "w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400 transition-transform duration-150",
              statusDropdownOpen && "rotate-180"
            )} />
          </button>

          {statusDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-36 sm:w-40 rounded-[10px] border border-neutral-200 bg-white py-1 shadow-lg z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-[13px] font-medium transition-colors",
                    booking.status === option.value ? option.lightBg : "hover:bg-neutral-50"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", option.dotBg)} />
                  <span className={cn("font-medium", option.color)}>{option.label}</span>
                  {booking.status === option.value && (
                    <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-terra-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-neutral-100 text-neutral-600">
          via {booking.source}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-neutral-100 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[13px] font-semibold rounded-md transition-all duration-150 whitespace-nowrap min-w-0",
                isActive
                  ? "bg-white text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Icon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0", isActive && "text-terra-500")} />
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
              {tab.badge > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 text-[8px] sm:text-[10px] font-bold rounded-full",
                  isActive ? "bg-terra-500 text-white" : "bg-neutral-300 text-white"
                )}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      header={drawerHeader}
      footer={drawerFooter}
    >
      {/* Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4 sm:space-y-6">
              {/* Stay Details Card */}
              <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden">
                <div className="grid grid-cols-3 divide-x divide-neutral-200">
                  <div className="p-2 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
                      <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Check-in</span>
                    </div>
                    <p className="text-xs sm:text-[15px] font-semibold text-neutral-900">
                      {formatDate(booking.checkIn)}
                    </p>
                  </div>
                  <div className="p-2 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                      <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
                      <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Duration</span>
                    </div>
                    <p className="text-xs sm:text-[15px] font-semibold text-neutral-900">
                      {booking.nights} night{booking.nights !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-2 sm:p-4 text-center">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400" />
                      <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Check-out</span>
                    </div>
                    <p className="text-xs sm:text-[15px] font-semibold text-neutral-900">
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Room & Guests */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-[10px] border border-neutral-200 bg-white p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Bed className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-500" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Room</span>
                  </div>
                  {booking.roomNumber ? (
                    <>
                      <p className="text-lg sm:text-xl font-semibold text-neutral-900">{booking.roomNumber}</p>
                      <p className="text-[10px] sm:text-[11px] mt-1 text-neutral-500 truncate">{booking.roomType}</p>
                    </>
                  ) : (
                    <button
                      onClick={onAssignRoom}
                      className="text-xs sm:text-[13px] font-semibold text-terra-500 hover:text-terra-600 transition-colors flex items-center gap-1"
                    >
                      Assign Room
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  )}
                </div>

                <div className="rounded-[10px] border border-neutral-200 bg-white p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-500" />
                    </div>
                    <span className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Guests</span>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-neutral-900">
                    {booking.adults} Adult{booking.adults !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] sm:text-[11px] mt-1 text-neutral-500 truncate">
                    {booking.children > 0 && `${booking.children} Children · `}{booking.ratePlan} Rate
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-xs sm:text-[13px] font-semibold text-neutral-800">
                  Contact Information
                </h3>
                <div className="rounded-[10px] border border-neutral-200 bg-white overflow-hidden divide-y divide-neutral-200">
                  {/* Email */}
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 block mb-0.5 sm:mb-1">
                        Email Address
                      </label>
                      {editingField === 'email' ? (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <input
                            ref={inputRef}
                            type="email"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'email')}
                            placeholder="Enter email address..."
                            className="flex-1 text-xs sm:text-[13px] font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
                          />
                          <button
                            onClick={() => saveField('email')}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-terra-500 hover:bg-terra-600 text-white transition-colors flex-shrink-0"
                          >
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-500 transition-colors flex-shrink-0"
                          >
                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                          <span className="text-xs sm:text-[13px] font-medium text-neutral-900 truncate">{booking.guestEmail || "Not provided"}</span>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => copyToClipboard(booking.guestEmail, 'email')}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-all"
                            >
                              {copiedField === 'email' ? <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sage-500" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                            </button>
                            <button
                              onClick={() => startEditing('email', booking.guestEmail)}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-terra-500 transition-all"
                            >
                              <PenLine className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Phone */}
                  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 block mb-0.5 sm:mb-1">
                        Phone Number
                      </label>
                      {editingField === 'phone' ? (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <input
                            ref={inputRef}
                            type="tel"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'phone')}
                            placeholder="Enter phone number..."
                            className="flex-1 text-xs sm:text-[13px] font-medium px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
                          />
                          <button
                            onClick={() => saveField('phone')}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg bg-terra-500 hover:bg-terra-600 text-white transition-colors flex-shrink-0"
                          >
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-500 transition-colors flex-shrink-0"
                          >
                            <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                          <span className="text-xs sm:text-[13px] font-medium text-neutral-900 truncate">{booking.guestPhone || "Not provided"}</span>
                          <div className="flex items-center gap-0.5 flex-shrink-0">
                            <button
                              onClick={() => copyToClipboard(booking.guestPhone, 'phone')}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-all"
                            >
                              {copiedField === 'phone' ? <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sage-500" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                            </button>
                            <button
                              onClick={() => startEditing('phone', booking.guestPhone)}
                              className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-terra-500 transition-all"
                            >
                              <PenLine className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Requests - BUG-009 FIX: Read-only, set by guest */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-xs sm:text-[13px] font-semibold text-neutral-800">
                  Special Requests <span className="text-neutral-400 font-normal">(read-only, set by guest)</span>
                </h3>
                <div className="p-2.5 sm:p-3 rounded-[10px] bg-gold-50 border border-gold-200">
                  <div className="flex items-start gap-2 sm:gap-2.5">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs sm:text-[13px] text-gold-700">
                      {booking.specialRequests || 'No special requests'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="p-3 sm:p-4 rounded-[10px] bg-terra-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-terra-200">Total Amount</p>
                    <p className="text-base sm:text-xl font-bold text-white mt-0.5 sm:mt-1">{formatCurrency(booking.totalPrice || booking.amount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-terra-200">Balance</p>
                    <p className={cn(
                      "text-base sm:text-xl font-bold mt-0.5 sm:mt-1",
                      booking.balance > 0 ? "text-rose-200" : "text-sage-200"
                    )}>
                      {formatCurrency(booking.balance)}
                    </p>
                  </div>
                </div>
              </div>
          </div>
        )}

        {/* Pre Check-In Tab */}
        {activeTab === 'precheckin' && (
          <PreCheckInDetails data={precheckinData} isLoading={precheckinLoading} />
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4 sm:space-y-5">
              {/* Payment Summary */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 rounded-[10px] text-center bg-white border border-neutral-200">
                  <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest mb-1 sm:mb-1.5 text-neutral-400">Total</p>
                  <p className="text-sm sm:text-lg font-bold text-neutral-900">{formatCurrency(booking.totalPrice || booking.amount)}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-[10px] text-center bg-sage-50 border border-sage-200">
                  <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest mb-1 sm:mb-1.5 text-sage-600">Paid</p>
                  <p className="text-sm sm:text-lg font-bold text-sage-700">{formatCurrency(booking.amountPaid || booking.amount_paid || 0)}</p>
                </div>
                <div className={cn(
                  "p-2 sm:p-3 rounded-[10px] text-center",
                  booking.balance > 0 ? "bg-rose-50 border border-rose-200" : "bg-sage-50 border border-sage-200"
                )}>
                  <p className={cn(
                    "text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest mb-1 sm:mb-1.5",
                    booking.balance > 0 ? "text-rose-600" : "text-sage-600"
                  )}>Balance</p>
                  <p className={cn(
                    "text-sm sm:text-lg font-bold",
                    booking.balance > 0 ? "text-rose-700" : "text-sage-700"
                  )}>
                    {formatCurrency(booking.balance)}
                  </p>
                </div>
              </div>

              {/* Add Payment */}
              {booking.balance > 0 && (
                <div className="rounded-[10px] border border-neutral-200 bg-white p-3 sm:p-4">
                  {showPaymentForm ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <div className="flex-1 space-y-1 sm:space-y-1.5">
                          <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Amount</label>
                          <div className="relative">
                            <DollarSign className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                            <input
                              type="number"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              placeholder="0.00"
                              max={booking.balance}
                              className="w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 sm:py-2 rounded-lg border border-neutral-200 bg-white text-xs sm:text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
                            />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1 sm:space-y-1.5">
                          <label className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Method</label>
                          <Select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            size="sm"
                            className="w-full text-xs sm:text-sm"
                          >
                            {paymentMethodOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPaymentForm(false)}
                          fullWidth
                          className="text-xs sm:text-sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAddPayment}
                          fullWidth
                          className="text-xs sm:text-sm"
                        >
                          Add Payment
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={CreditCard}
                      onClick={() => setShowPaymentForm(true)}
                      fullWidth
                      className="text-xs sm:text-sm"
                    >
                      Add Payment
                    </Button>
                  )}
                </div>
              )}

              {/* Payment History */}
              <div>
                <h3 className="text-xs sm:text-[13px] font-semibold text-neutral-800 mb-2 sm:mb-3">
                  Payment History
                </h3>
                {booking.payments.length === 0 ? (
                  <div className="rounded-[10px] border border-neutral-200 bg-white p-4 sm:p-6 text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center mx-auto mb-2">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                    </div>
                    <p className="text-xs sm:text-[13px] font-medium text-neutral-500">No payments recorded</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {booking.payments.map((payment, index) => (
                      <div key={payment.id || index} className="flex items-center justify-between rounded-[10px] border border-neutral-200 bg-white p-2.5 sm:p-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={cn(
                            "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            payment.status === 'refunded'
                              ? "bg-rose-50"
                              : "bg-sage-50"
                          )}>
                            <CreditCard className={cn(
                              "w-3.5 h-3.5 sm:w-4 sm:h-4",
                              payment.status === 'refunded' ? "text-rose-600" : "text-sage-600"
                            )} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-[13px] font-semibold text-neutral-900 truncate">{payment.method}</p>
                            <p className="text-[9px] sm:text-[10px] text-neutral-400">{formatDate(payment.processed_at)}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={cn(
                            "text-sm sm:text-[15px] font-bold",
                            payment.status === 'refunded' ? "text-rose-600" : "text-sage-600"
                          )}>
                            {payment.status === 'refunded' ? '-' : '+'}{formatCurrency(payment.amount)}
                          </p>
                          <p className="text-[9px] sm:text-[10px] capitalize text-neutral-400">{payment.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-[13px] font-semibold text-neutral-800">
                Activity Log
              </h3>
              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-0 bottom-0 w-px bg-neutral-200"></div>
                <div className="space-y-2 sm:space-y-3">
                  {booking.activityLog.map((activity, index) => (
                    <div key={index} className="relative flex items-start gap-2 sm:gap-3 pl-6 sm:pl-8">
                      <div className="absolute left-1.5 sm:left-2.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-terra-500 border-2 border-white"></div>
                      <div className="flex-1 rounded-[10px] border border-neutral-200 bg-white p-2.5 sm:p-3">
                        <p className="text-xs sm:text-[13px] font-medium text-neutral-900">{activity.action}</p>
                        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400 flex-shrink-0" />
                          <span className="text-[9px] sm:text-[10px] text-neutral-500">{formatDate(activity.date)}</span>
                          <span className="text-[9px] sm:text-[10px] text-neutral-400">by {activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-[13px] font-semibold text-neutral-800 flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-500 flex-shrink-0" />
                AI-Powered Insights
              </h3>
              {aiInsights.length === 0 ? (
                <div className="rounded-[10px] border border-neutral-200 bg-white p-5 sm:p-8 text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-neutral-100 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                  </div>
                  <p className="text-xs sm:text-[13px] font-medium text-neutral-500">No insights available</p>
                  <p className="text-[10px] sm:text-[11px] mt-1 text-neutral-400">AI insights will appear here when available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {aiInsights.map((insight, index) => {
                    const icons = { warning: AlertTriangle, info: Sparkles, vip: Crown, alert: AlertTriangle };
                    const colors = {
                      warning: 'bg-gold-50 border-gold-200 text-gold-700',
                      info: 'bg-ocean-50 border-ocean-200 text-ocean-700',
                      vip: 'bg-gold-50 border-gold-200 text-gold-700',
                      alert: 'bg-rose-50 border-rose-200 text-rose-700'
                    };
                    const iconColors = {
                      warning: 'text-gold-600',
                      info: 'text-ocean-600',
                      vip: 'text-gold-600',
                      alert: 'text-rose-600'
                    };
                    const Icon = icons[insight.type] || Sparkles;
                    const colorClass = colors[insight.type] || colors.info;
                    const iconColorClass = iconColors[insight.type] || iconColors.info;

                    return (
                      <div key={index} className={cn("flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-[10px] border", colorClass)}>
                        <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0", iconColorClass)} />
                        <p className="text-xs sm:text-[13px] font-medium flex-1">{insight.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
