/**
 * CMS Bookings Page - Glimmora Luxury Edition
 * An immersive, editorial booking management experience
 * Features: Bento grid layout, elegant animations, sophisticated design
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Plus,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  ChevronDown,
  X,
  Crown,
  ArrowRight,
  Clock,
  Sparkles,
  Eye,
  MoreHorizontal,
  LogIn,
  LogOut,
  Bed,
  Mail,
  Phone,
  Globe,
  Edit3,
  XCircle,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table2,
  SlidersHorizontal,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  statusConfig,
  sourceConfig
} from '../../../data/bookingsData';
import NewBookingDrawer from '../../../components/cbs/NewBookingDrawer';
import { precheckinService } from '@/api/services/precheckin.service';
import { bookingService } from '@/api/services/booking.service';
import { apiClient, clearApiCache } from '../../../api/client';
import { useBookingsSSE } from '../../../hooks/useBookingsSSE';

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

// ============================================
// PREMIUM KPI CARD
// ============================================
function KPICard({ title, value, prefix = '', suffix = '', trend, trendValue, icon: Icon, accentColor, delay = 0 }) {
  const isPositive = trend === 'up';

  const bgColorMap = {
    terra: 'bg-terra-50',
    gold: 'bg-gold-50',
    ocean: 'bg-ocean-50',
    sage: 'bg-sage-50',
  };

  const textColorMap = {
    terra: 'text-terra-600',
    gold: 'text-gold-600',
    ocean: 'text-ocean-600',
    sage: 'text-sage-600',
  };

  return (
    <div
      style={{ animationDelay: `${delay * 100}ms` }}
      className="relative overflow-hidden rounded-[10px] bg-white p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header with Icon and Title */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColorMap[accentColor]}`}>
          <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${textColorMap[accentColor]}`} />
        </div>
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
          {title}
        </p>
      </div>

      {/* Value */}
      <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1.5 sm:mb-2">
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>

      {/* Comparison */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">vs Last Month</p>
        {trend && (
          <div className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-[11px] font-semibold ${
            isPositive ? 'text-sage-600' : 'text-rose-600'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PREMIUM SEARCH BAR
// ============================================
function PremiumSearchBar({ value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`relative h-10 sm:h-11 rounded-lg overflow-hidden transition-all duration-300 w-full sm:w-auto ${
        isFocused ? 'sm:w-[400px] ring-2 ring-terra-500/30' : 'sm:w-[280px] lg:w-[320px]'
      } bg-white border border-neutral-200`}
    >
      <Search className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${
        isFocused ? 'text-terra-400' : 'text-neutral-400'
      }`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search guests, bookings..."
        className="w-full h-full pl-10 sm:pl-11 pr-10 sm:pr-4 bg-transparent text-xs sm:text-[13px] font-medium focus:outline-none text-neutral-900 placeholder:text-neutral-400"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-neutral-100"
        >
          <X className="w-3.5 h-3.5 text-neutral-400" />
        </button>
      )}
    </div>
  );
}

// ============================================
// FILTER CHIPS
// ============================================
function FilterChips({ filters, onFilterChange, onClearFilters, dateFilterType = 'checkin', onDateFilterTypeChange }) {
  const [showFilters, setShowFilters] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'ocean' },
    { value: 'PENDING', label: 'Pending', color: 'gold' },
    { value: 'CHECKED-IN', label: 'In-House', color: 'sage' },
    { value: 'CHECKED-OUT', label: 'Departed', color: 'neutral' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'rose' },
  ];

  const sourceOptions = [
    { value: 'all', label: 'All Channels' },
    { value: 'Direct', label: 'Direct' },
    { value: 'Website', label: 'Website' },
    { value: 'Booking.com', label: 'Booking.com' },
    { value: 'Expedia', label: 'Expedia' },
    { value: 'Hotels.com', label: 'Hotels.com' },
    { value: 'Corporate Portal', label: 'Corporate' },
  ];

  const hasFilters = filters.status !== 'all' || filters.source !== 'all' || filters.dateFrom || filters.dateTo;

  const hasDateFilter = filters.dateFrom || filters.dateTo;
  const getDateLabel = () => {
    if (!hasDateFilter) return dateFilterType === 'checkout' ? 'Check-out' : 'Check-in';
    const from = filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    const to = filters.dateTo ? new Date(filters.dateTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
    if (from && to) return `${from} - ${to}`;
    if (from) return `From ${from}`;
    return `To ${to}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Status Pills - scrollable on mobile */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 overflow-x-auto max-w-full">
        {statusOptions.slice(0, 5).map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange('status', option.value)}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all duration-200 whitespace-nowrap ${
              filters.status === option.value
                ? 'bg-terra-500 text-white'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
            }`}
          >
            {option.value === 'all' ? 'All' : option.label}
          </button>
        ))}
      </div>

      {/* Source Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`h-9 sm:h-10 px-3 sm:px-4 rounded-lg text-[11px] sm:text-[13px] font-semibold flex items-center gap-1.5 sm:gap-2 transition-all ${
            filters.source !== 'all'
              ? 'bg-terra-50 text-terra-600 border border-terra-200'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{filters.source !== 'all' ? sourceOptions.find(s => s.value === filters.source)?.label : 'Channel'}</span>
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="absolute top-full right-0 mt-2 w-44 sm:w-48 rounded-lg bg-white shadow-lg border border-neutral-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {sourceOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onFilterChange('source', option.value);
                  setShowFilters(false);
                }}
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[11px] sm:text-[13px] font-medium transition-colors ${
                  filters.source === option.value
                    ? 'bg-terra-50 text-terra-600'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date Filter */}
      <div className="relative" ref={datePickerRef}>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={`h-9 sm:h-10 px-3 sm:px-4 rounded-lg text-[11px] sm:text-[13px] font-semibold flex items-center gap-1.5 sm:gap-2 transition-all ${
            hasDateFilter
              ? 'bg-terra-50 text-terra-600 border border-terra-200'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">{getDateLabel()}</span>
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
        </button>

        {showDatePicker && (
          <div className="absolute top-full right-0 mt-2 w-72 rounded-lg bg-white shadow-lg border border-neutral-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-4">
            {/* Date Type Toggle */}
            <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => onDateFilterTypeChange?.('checkin')}
                className={`flex-1 px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                  dateFilterType === 'checkin'
                    ? 'bg-white text-terra-700 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Check-in
              </button>
              <button
                type="button"
                onClick={() => onDateFilterTypeChange?.('checkout')}
                className={`flex-1 px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                  dateFilterType === 'checkout'
                    ? 'bg-white text-terra-700 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Check-out
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => onFilterChange('dateFrom', e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => onFilterChange('dateTo', e.target.value)}
                  min={filters.dateFrom || undefined}
                  className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-[13px] focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100">
              <button
                onClick={() => {
                  onFilterChange('dateFrom', '');
                  onFilterChange('dateTo', '');
                }}
                className="text-[12px] font-medium text-neutral-500 hover:text-neutral-700"
              >
                Clear
              </button>
              <button
                onClick={() => setShowDatePicker(false)}
                className="px-3 py-1.5 text-[12px] font-medium text-white bg-terra-500 hover:bg-terra-600 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-[13px] font-medium flex items-center gap-1.5 sm:gap-2 bg-neutral-100 text-neutral-500 hover:bg-neutral-200 animate-in fade-in duration-200"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      )}
    </div>
  );
}

// ============================================
// TAB NAVIGATION - EDITORIAL STYLE
// ============================================
function EditorialTabs({ activeTab, onTabChange, counts }) {
  const tabs = [
    { id: 'all', label: 'All Reservations', shortLabel: 'All', icon: Calendar, count: counts.all },
    { id: 'arrivals', label: 'Arriving Today', shortLabel: 'Arrivals', icon: LogIn, count: counts.arrivals },
    { id: 'inhouse', label: 'In-House', shortLabel: 'In-House', icon: Bed, count: counts.inhouse },
    { id: 'departures', label: 'Departing Today', shortLabel: 'Departures', icon: LogOut, count: counts.departures },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100 overflow-x-auto max-w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all duration-300 whitespace-nowrap ${
              isActive
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
            {tab.count > 0 && (
              <span className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-semibold ${
                isActive
                  ? 'bg-terra-500 text-white'
                  : 'bg-neutral-200 text-neutral-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// VIEW TOGGLE
// ============================================
function ViewToggle({ view, onViewChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-100">
      <button
        onClick={() => onViewChange('cards')}
        className={`p-2 rounded-lg transition-all ${
          view === 'cards'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-400 hover:text-neutral-700'
        }`}
      >
        <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      {/* Hide table view on mobile - cards view is better suited */}
      <button
        onClick={() => onViewChange('table')}
        className={`hidden sm:block p-2 rounded-lg transition-all ${
          view === 'table'
            ? 'bg-white text-neutral-900 shadow-sm'
            : 'text-neutral-400 hover:text-neutral-700'
        }`}
      >
        <Table2 className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
}

// ============================================
// PREMIUM BOOKING CARD
// ============================================
function BookingCard({ booking, onClick, index = 0, onCheckIn }: { booking: any; onClick: (b: any) => void; index?: number; onCheckIn?: (id: string) => void }) {
  const status = statusConfig[booking.status];
  const source = sourceConfig[booking.source] || {
    color: 'bg-[#7B68EE]/10 text-[#7B68EE]',
    icon: '💻'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusStyle = (status) => {
    const styles = {
      'CONFIRMED': 'bg-ocean-50 text-ocean-600 border-ocean-200',
      'PENDING': 'bg-gold-50 text-gold-600 border-gold-200',
      'CHECKED-IN': 'bg-sage-50 text-sage-600 border-sage-200',
      'CHECKED-OUT': 'bg-neutral-100 text-neutral-600 border-neutral-200',
      'CANCELLED': 'bg-rose-50 text-rose-600 border-rose-200',
    };
    return styles[status] || styles['PENDING'];
  };

  return (
    <div
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onClick(booking)}
      className="group relative rounded-[10px] bg-white overflow-hidden cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 hover:shadow-sm"
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        booking.vip ? 'bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400' : 'bg-transparent'
      }`} />

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Avatar */}
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-semibold text-[10px] sm:text-[11px] text-white flex-shrink-0 ${
              booking.vip ? 'bg-gradient-to-br from-gold-400 to-gold-600' : 'bg-gradient-to-br from-terra-400 to-terra-600'
            }`}>
              {booking.guest?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G' || 'G'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <p className="text-xs sm:text-[13px] font-semibold text-neutral-800 truncate">
                  {booking.guest}
                </p>
                {booking.vip && (
                  <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-[9px] sm:text-[10px] font-medium text-neutral-400">
                {booking.id}
              </p>
            </div>
          </div>

          {/* Status */}
          <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[11px] font-medium border flex-shrink-0 ${getStatusStyle(booking.status)}`}>
            {status?.label}
          </span>
        </div>

        {/* Stay Details */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4 bg-neutral-50/50">
          <div className="text-center">
            <p className="text-[9px] sm:text-[11px] mb-0.5 sm:mb-1 text-neutral-400">Check-in</p>
            <p className="text-[11px] sm:text-[13px] font-semibold text-neutral-900">
              {formatDate(booking.checkIn)}
            </p>
          </div>
          <div className="text-center border-x border-neutral-200">
            <p className="text-[9px] sm:text-[11px] mb-0.5 sm:mb-1 text-neutral-400">Duration</p>
            <p className="text-[11px] sm:text-[13px] font-semibold text-neutral-900">
              {booking.nights}N
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] sm:text-[11px] mb-0.5 sm:mb-1 text-neutral-400">Check-out</p>
            <p className="text-[11px] sm:text-[13px] font-semibold text-neutral-900">
              {formatDate(booking.checkOut)}
            </p>
          </div>
        </div>

        {/* Room Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
            <span className="text-[11px] sm:text-[13px] font-medium text-neutral-900">
              Room {booking.room}
            </span>
            <span className="text-[9px] sm:text-[11px] text-neutral-400 hidden sm:inline">
              • {booking.roomType}
            </span>
          </div>
          <div className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg text-[9px] sm:text-[11px] font-medium ${source?.color}`}>
            <span>{source?.icon}</span>
            <span className="hidden sm:inline">{booking.source}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-dashed border-neutral-200">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <p className="text-[9px] sm:text-[11px] text-neutral-400">Total</p>
              {booking.balance > 0 && (
                <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-amber-100 text-amber-700">
                  ${booking.balance.toLocaleString()} due
                </span>
              )}
              {booking.paymentStatus === 'paid' && (
                <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-sage-100 text-sage-700">
                  Paid ✓
                </span>
              )}
            </div>
            <p className="text-lg sm:text-xl font-semibold text-neutral-900">
              ${(booking.totalPrice || booking.amount).toLocaleString()}
            </p>
            {booking.amountPaid > 0 && booking.balance > 0 && (
              <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-0.5 sm:mt-1">
                ${booking.amountPaid.toLocaleString()} paid
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onCheckIn && (booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
              <button
                onClick={(e) => { e.stopPropagation(); onCheckIn(booking.id); }}
                className="flex items-center gap-1 px-3 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-[13px] font-semibold bg-sage-50 text-sage-600 hover:bg-sage-100 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                Check In
              </button>
            )}
            <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all bg-neutral-100 text-neutral-600 group-hover:bg-terra-500 group-hover:text-white">
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">View</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PREMIUM TABLE ROW
// ============================================
function BookingTableRow({ booking, onClick, index, onCheckIn }: { booking: any; onClick: (b: any) => void; index: number; onCheckIn?: (id: string) => void }) {
  // Display override: in-house bookings whose checkout date has passed render as
  // "Checked Out" on the badge. Underlying booking.status is left untouched.
  const todayStr = new Date().toISOString().split('T')[0];
  const normalizedBookingStatus = String(booking.status || '').toUpperCase().replace(/[\s_]/g, '-');
  const isInHouseStatus = normalizedBookingStatus === 'IN-HOUSE' || normalizedBookingStatus === 'IN_HOUSE' || normalizedBookingStatus === 'CHECKED-IN';
  const checkOutPast = booking.checkOut && booking.checkOut < todayStr;
  const displayStatusKey = (isInHouseStatus && checkOutPast) ? 'CHECKED-OUT' : booking.status;
  const status = statusConfig[displayStatusKey] || statusConfig[booking.status];
  const source = sourceConfig[booking.source] || {
    color: 'bg-[#7B68EE]/10 text-[#7B68EE]',
    icon: '💻'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusStyle = (status) => {
    const styles = {
      'CONFIRMED': 'bg-ocean-50 text-ocean-600',
      'PENDING': 'bg-gold-50 text-gold-600',
      'CHECKED-IN': 'bg-sage-50 text-sage-600',
      'CHECKED-OUT': 'bg-neutral-100 text-neutral-600',
      'CANCELLED': 'bg-rose-50 text-rose-600',
    };
    return styles[status] || styles['PENDING'];
  };

  const paymentStatusStyles = {
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    partial: 'bg-amber-50 text-amber-700 border-amber-200',
    pending: 'bg-neutral-50 text-neutral-600 border-neutral-200',
    failed: 'bg-rose-50 text-rose-700 border-rose-200',
    refunded: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  const paymentStatus = booking.paymentStatus || 'pending';
  const paymentStyle = paymentStatusStyles[paymentStatus] || paymentStatusStyles['pending'];
  const paymentLabel = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);

  return (
    <tr
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onClick(booking)}
      className="group bg-white hover:bg-neutral-50/30 cursor-pointer transition-colors animate-in fade-in slide-in-from-left-2"
    >
      {/* Guest Name */}
      <td className="py-4 px-6 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 group-hover:text-terra-600 transition-colors truncate">
            {booking.guest}
          </span>
          {booking.vip && <Crown className="w-4 h-4 text-gold-500 flex-shrink-0" />}
        </div>
      </td>

      {/* Booking ID */}
      <td className="py-4 px-6 whitespace-nowrap">
        <span className="text-xs text-neutral-500 font-mono">{booking.bookingNumber || booking.id}</span>
      </td>

      {/* Check-in */}
      <td className="py-4 px-6 whitespace-nowrap">
        <span className="text-sm text-neutral-700 font-medium">{formatDate(booking.checkIn)}</span>
      </td>

      {/* Nights */}
      <td className="py-4 px-6 whitespace-nowrap">
        <span className="text-sm text-neutral-600">{booking.nights}n</span>
      </td>

      {/* Room */}
      <td className="py-4 px-6 whitespace-nowrap">
        {booking.room ? (
          <>
            <span className="font-semibold text-neutral-900 text-sm">Room {booking.room}</span>
            <span className="text-neutral-400 text-xs ml-1.5">• {booking.roomType}</span>
          </>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
        )}
      </td>

      {/* Status */}
      <td className="py-4 px-6 whitespace-nowrap">
        <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-medium ${getStatusStyle(displayStatusKey)}`}>
          {status?.label}
        </span>
      </td>

      {/* Source */}
      <td className="py-4 px-6 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${source.color}`}>
          <span className="mr-1">{source?.icon}</span>
          {booking.source}
        </span>
      </td>

      {/* Payment */}
      <td className="py-4 px-6 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${paymentStyle}`}>
          {paymentLabel}
        </span>
      </td>

      {/* Amount */}
      <td className="py-4 px-6 whitespace-nowrap">
        <span className="text-sm font-bold text-neutral-900">
          ₹{(booking.totalPrice || booking.amount)?.toLocaleString() || '0'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-2 py-4 text-center whitespace-nowrap">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onCheckIn && (booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
            <button
              onClick={(e) => { e.stopPropagation(); onCheckIn(booking.id); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-sage-50 text-sage-600 hover:bg-sage-100 transition-colors flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Check In
            </button>
          )}
          <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <Eye className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================
// PREMIUM BOOKING DRAWER
// ============================================
function BookingDetailDrawer({ booking, isOpen, onClose, onStatusChange }) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusMenuRef = useRef(null);
  const [precheckin, setPrecheckin] = useState(null);

  // Fetch pre-check-in for ETA/ETD when drawer opens
  useEffect(() => {
    if (!booking?.id || !isOpen) {
      setPrecheckin(null);
      return;
    }
    let reservationId = Number(booking.id);
    if (Number.isNaN(reservationId)) {
      const lookupId = booking.bookingNumber || booking.id;
      bookingService.getBooking(String(lookupId))
        .then((b) => {
          const numId = b?.id != null ? Number(b.id) : NaN;
          if (!Number.isNaN(numId)) {
            return precheckinService.getByReservation(numId).then(setPrecheckin);
          }
          setPrecheckin(null);
        })
        .catch(() => setPrecheckin(null));
      return;
    }
    precheckinService.getByReservation(reservationId)
      .then((data) => setPrecheckin(data))
      .catch(() => setPrecheckin(null));
  }, [booking?.id, booking?.bookingNumber, isOpen]);

  // ETA = pre-check-in arrival (arrival_time). ETD = pre-check-in departure (departure_time). Fallback to booking when API already set them from same source.
  const eta = precheckin?.arrival_time ?? (precheckin && precheckin.arrivalTime) ?? booking?.eta ?? '';
  const etd = precheckin?.departure_time ?? (precheckin && precheckin.departureTime) ?? booking?.etd ?? '';

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return '—';
    const trimmed = timeStr.trim();
    if (!trimmed) return '—';
    // 24h "HH:MM" from pre-check-in or already "h:MM AM/PM"
    const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = match[2];
      const period = match[3];
      if (period) {
        if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
        if (period.toUpperCase() === 'AM' && h === 12) h = 0;
      }
      // else: 24h format (0-23)
      const h12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      return `${h12}:${m} ${ampm}`;
    }
    return trimmed;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setShowStatusMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!booking || !isOpen) return null;

  const status = statusConfig[booking.status];
  const source = sourceConfig[booking.source] || {
    color: 'bg-[#7B68EE]/10 text-[#7B68EE]',
    icon: '💻'
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const statusOptions = [
    { value: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, color: 'text-ocean-600' },
    { value: 'PENDING', label: 'Pending', icon: Clock, color: 'text-gold-600' },
    { value: 'CHECKED-IN', label: 'Checked In', icon: LogIn, color: 'text-sage-600' },
    { value: 'CHECKED-OUT', label: 'Checked Out', icon: LogOut, color: 'text-neutral-500' },
    { value: 'CANCELLED', label: 'Cancelled', icon: XCircle, color: 'text-rose-600' },
  ];

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-lg z-[70] overflow-hidden animate-in slide-in-from-right duration-300 bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 px-4 sm:px-6 py-4 sm:py-5 border-b bg-white/90 border-neutral-200 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center font-semibold text-[11px] sm:text-[13px] text-white flex-shrink-0 ${
                booking.vip ? 'bg-gradient-to-br from-gold-400 to-gold-600' : 'bg-gradient-to-br from-terra-400 to-terra-600'
              }`}>
                {booking.guest?.split(' ').filter(n => n).map(n => n[0]).join('') || 'G' || 'G'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-neutral-900 truncate">
                    {booking.guest}
                  </h2>
                  {booking.vip && <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-500 flex-shrink-0" />}
                </div>
                <p className="text-[10px] sm:text-[11px] font-medium text-neutral-400">
                  {booking.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-neutral-100 flex-shrink-0"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>

          {/* Status Dropdown */}
          <div className="relative mt-4" ref={statusMenuRef}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors bg-neutral-100 hover:bg-neutral-200"
            >
              <span className={`w-2 h-2 rounded-full ${
                booking.status === 'CONFIRMED' ? 'bg-ocean-500' :
                booking.status === 'PENDING' ? 'bg-gold-500' :
                booking.status === 'CHECKED-IN' ? 'bg-sage-500' :
                booking.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-neutral-500'
              }`} />
              <span className="text-[13px] font-medium text-neutral-900">
                {status?.label}
              </span>
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </button>

            {showStatusMenu && (
              <div className="absolute left-0 top-full mt-2 w-56 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 bg-white border border-neutral-200">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onStatusChange(booking.id, option.value);
                        setShowStatusMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors ${
                        booking.status === option.value
                          ? 'bg-neutral-50'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${option.color}`} />
                      <span className="text-neutral-900">{option.label}</span>
                      {booking.status === option.value && (
                        <CheckCircle className="w-4 h-4 text-terra-500 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-180px)] px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Stay Details */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-lg overflow-hidden bg-neutral-50">
            <div className="p-2.5 sm:p-4 rounded-lg text-center bg-white">
              <p className="text-[9px] sm:text-[11px] font-medium mb-0.5 sm:mb-1 text-neutral-400">Check-in</p>
              <p className="text-[11px] sm:text-[13px] font-semibold text-neutral-900">
                {formatDate(booking.checkIn)}
              </p>
            </div>
            <div className="p-2.5 sm:p-4 rounded-lg text-center bg-white">
              <p className="text-[9px] sm:text-[11px] font-medium mb-0.5 sm:mb-1 text-neutral-400">Duration</p>
              <p className="text-[11px] sm:text-[13px] font-semibold text-neutral-900">
                {booking.nights} nights
              </p>
            </div>
            <div className="p-2.5 sm:p-4 rounded-lg text-center bg-white">
              <p className="text-[9px] sm:text-[11px] font-medium mb-0.5 sm:mb-1 text-neutral-400">Check-out</p>
              <p className="text-[11px] sm:text-[13px] font-semibold text-neutral-900">
                {formatDate(booking.checkOut)}
              </p>
            </div>
          </div>

          {/* Room & Guests */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400">Room</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-neutral-900">
                {booking.room || 'Unassigned'}
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-500">{booking.roomType}</p>
            </div>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400">Guests</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-neutral-900">
                {booking.adults || booking.guests} Adult{(booking.adults || booking.guests) !== 1 ? 's' : ''}
              </p>
              <p className="text-[10px] sm:text-[11px] text-neutral-500">
                {(booking.children || 0) > 0 ? `${booking.children} Child${booking.children !== 1 ? 'ren' : ''}` : 'No children'}
              </p>
            </div>
          </div>

          {/* Arrival & Departure Times (from pre-check-in) */}
          <div className="space-y-3 p-4 rounded-lg bg-neutral-50">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Arrival & Departure Times
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-lg bg-white">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                  <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400">ETA</span>
                </div>
                <p className="text-base sm:text-lg font-semibold text-neutral-900">
                  {formatTimeDisplay(eta)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">Expected Arrival</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-white">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                  <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400">ETD</span>
                </div>
                <p className="text-base sm:text-lg font-semibold text-neutral-900">
                  {formatTimeDisplay(etd)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500">Expected Departure</p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3 p-4 rounded-lg bg-neutral-50">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              Contact
            </p>
            <div className="space-y-2">
              <a href={`mailto:${booking.email}`} className="flex items-center gap-3 p-3 rounded-lg transition-colors bg-white hover:bg-neutral-100">
                <Mail className="w-4 h-4 text-neutral-400" />
                <span className="text-[13px] text-neutral-700">{booking.email}</span>
              </a>
              <a href={`tel:${booking.phone}`} className="flex items-center gap-3 p-3 rounded-lg transition-colors bg-white hover:bg-neutral-100">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-[13px] text-neutral-700">{booking.phone}</span>
              </a>
            </div>
          </div>

          {/* Source */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-neutral-400" />
              <span className="text-[13px] text-neutral-500">Booking Channel</span>
            </div>
            <span className={`text-[13px] font-semibold ${source?.color?.split(' ')[1] || 'text-neutral-700'}`}>
              {source?.icon} {booking.source}
            </span>
          </div>

          {/* Special Requests */}
          {booking.specialRequests && booking.specialRequests !== 'None' && (
            <div className="p-4 rounded-lg border bg-gold-50 border-gold-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-gold-600" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-600">Special Requests</span>
              </div>
              <p className="text-[13px] text-gold-800">
                {booking.specialRequests}
              </p>
            </div>
          )}

          {/* Upsells */}
          {booking.upsells && booking.upsells.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-ocean-600" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                  Add-ons
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.upsells.map((upsell, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg text-[13px] font-medium bg-ocean-50 text-ocean-600">
                    {upsell}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="p-6 rounded-lg bg-gradient-to-br from-terra-50 to-terra-100/50 border border-terra-200">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] mb-1 text-terra-600 font-semibold uppercase tracking-widest">Total Amount</p>
                <p className="text-[28px] font-semibold text-terra-900">
                  ${(booking.totalPrice || booking.amount).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-neutral-400">Per night</p>
                <p className="text-xl font-semibold text-neutral-900">
                  ${(booking.ratePerNight || Math.round((booking.totalPrice || booking.amount) / booking.nights)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 px-6 py-4 border-t bg-white border-neutral-200">
          <div className="grid grid-cols-3 gap-3">
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-semibold transition-colors bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-semibold transition-colors bg-neutral-100 text-neutral-600 hover:bg-neutral-200">
              <Bed className="w-4 h-4" />
              Assign
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-terra-500 hover:bg-terra-600 text-white text-[13px] font-semibold transition-colors">
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}

// ============================================
// PAGINATION
// ============================================
function LuxuryPagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const maxPagesToShow = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
  for (let i = 1; i <= Math.min(totalPages, maxPagesToShow); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-1.5 sm:p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all ${
            currentPage === page
              ? 'bg-terra-500 text-white'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          {page}
        </button>
      ))}

      {totalPages > maxPagesToShow && (
        <>
          <span className="text-neutral-400 text-sm">...</span>
          <button
            onClick={() => onPageChange(totalPages)}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all ${
              currentPage === totalPages
                ? 'bg-terra-500 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-1.5 sm:p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
      </button>
    </div>
  );
}

// ============================================
// HELPER: Transform API booking to frontend format
// ============================================
function transformApiBooking(apiBooking: any, index?: number) {
  const guest = apiBooking.guestInfo;
  const guestName = `${guest?.firstName || ''} ${guest?.lastName || ''}`.trim() || 'Guest';

  // Map API status to frontend status
  const statusMap: Record<string, string> = {
    'confirmed': 'CONFIRMED',
    'pending': 'PENDING',
    'checked-in': 'CHECKED-IN',
    'checked_in': 'CHECKED-IN',
    'checked-out': 'CHECKED-OUT',
    'checked_out': 'CHECKED-OUT',
    'cancelled': 'CANCELLED',
  };

  // Map API source to frontend source
  const sourceMap: Record<string, string> = {
    'Direct': 'Direct',
    'direct': 'Direct',
    'Website': 'Website',
    'website': 'Website',
    'Booking.com': 'Booking.com',
    'booking.com': 'Booking.com',
    'Expedia': 'Expedia',
    'expedia': 'Expedia',
    'Hotels.com': 'Hotels.com',
    'hotels.com': 'Hotels.com',
    'Corporate Portal': 'Corporate Portal',
    'corporate': 'Corporate Portal',
    'OTA': 'OTA',
  };

  // Calculate payment amounts for accurate revenue tracking
  const totalPrice = apiBooking.totalPrice || apiBooking.total_price || 0;
  const depositAmount = apiBooking.depositAmount || apiBooking.deposit_amount || 0;
  const balanceDue = apiBooking.balanceDue || apiBooking.balance_due;

  // Determine amount paid based on payment status
  let amountPaid = 0;
  if (apiBooking.payment_status === 'paid') {
    amountPaid = totalPrice;
  } else if (apiBooking.payment_status === 'partial' || depositAmount > 0) {
    amountPaid = depositAmount;
  } else if (balanceDue !== null && balanceDue !== undefined) {
    amountPaid = totalPrice - balanceDue;
  }

  const uniqueId = apiBooking.id ?? apiBooking.bookingNumber ?? apiBooking.booking_number ?? (index !== undefined ? `booking-${index}` : `booking-${Math.random()}`);
  return {
    id: String(uniqueId),
    bookingNumber: apiBooking.bookingNumber || apiBooking.booking_number || '',
    guest: guestName,
    email: guest?.email || '',
    phone: guest?.phone || '',
    checkIn: apiBooking.checkIn || apiBooking.arrival_date,
    checkOut: apiBooking.checkOut || apiBooking.departure_date,
    nights: apiBooking.nights || 1,
    roomType: apiBooking.room?.name || 'Standard Room',
    room: apiBooking.room?.number || null,
    status: statusMap[apiBooking.status?.toLowerCase()] || 'CONFIRMED',
    source: (() => {
      const rawSource = apiBooking.bookingSource || apiBooking.booking_source || apiBooking.source || 'Direct';
      const mappedSource = sourceMap[rawSource];
      return mappedSource || rawSource;
    })(),
    vip: apiBooking.vipStatus || apiBooking.vip_flag || false,
    amount: totalPrice,
    amountPaid: amountPaid,
    balance: balanceDue !== null && balanceDue !== undefined ? balanceDue : (totalPrice - amountPaid),
    paymentStatus: apiBooking.payment_status || 'pending',
    adults: apiBooking.guests?.adults || apiBooking.adults || 1,
    children: apiBooking.guests?.children || apiBooking.children || 0,
    guests: (apiBooking.guests?.adults || apiBooking.adults || 1) + (apiBooking.guests?.children || apiBooking.children || 0),
    specialRequests: guest?.specialRequests || apiBooking.special_requests || '',
    createdAt: apiBooking.createdAt || apiBooking.created_at,
    eta: apiBooking.eta ?? '',
    etd: apiBooking.etd ?? '',
  };
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function CMSBookings() {
  const location = useLocation();
  // State
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [dateFilterType, setDateFilterType] = useState<'checkin' | 'checkout'>('checkin');

  const itemsPerPage = viewMode === 'cards' ? 6 : 10;

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    console.log('[CMS Bookings] 🔄 Starting fetchBookings...');
    setIsLoading(true);
    setApiError(null);
    try {
      // Clear cache when refetching (SSE booking.created/modified/cancelled) so we get fresh data
      clearApiCache('/api/v1/bookings');
      console.log('[CMS Bookings] 📡 Fetching bookings from API...');
      const response = await apiClient.get('/api/v1/bookings', {
        params: { pageSize: 1000 },
        noCache: true,
      });

      const apiBookings = response.data?.items || response.data?.data?.items || [];
      console.log('[CMS Bookings] 📦 Received bookings from API:', apiBookings.length, 'bookings');

      const transformedBookings = apiBookings.map((b, i) => transformApiBooking(b, i));
      console.log('[CMS Bookings] ✅ Transformed bookings:', transformedBookings.length, 'bookings');
      console.log('[CMS Bookings] 📋 First booking sample:', dedupedBookings[0]);
      
      setBookings(transformedBookings);
      console.log('[CMS Bookings] ✅✅✅ State updated successfully with', transformedBookings.length, 'bookings');
    } catch (error: any) {
      console.error('[CMS Bookings] ❌ Failed to fetch bookings from API:', error?.message);
      setApiError('Failed to load bookings. Please try again.');
      setBookings([]);
    } finally {
      setIsLoading(false);
      console.log('[CMS Bookings] 🏁 fetchBookings completed');
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Auto-open a specific booking when navigated with state (e.g. from Dashboard)
  useEffect(() => {
    const openBookingId = (location.state as any)?.openBookingId;
    if (openBookingId && bookings.length > 0) {
      const match = bookings.find((b: any) => b.id === openBookingId);
      if (match) {
        setSelectedBooking(match);
        setIsDrawerOpen(true);
        // Clear the state so it doesn't re-open on re-render
        window.history.replaceState({}, '');
      }
    }
  }, [bookings, location.state]);

  // SSE Integration for real-time booking updates
  useBookingsSSE({
    refetchBookings: fetchBookings,
  });

  // Computed values
  const today = new Date().toISOString().split('T')[0];

  const counts = useMemo(() => ({
    all: bookings.length,
    arrivals: bookings.filter(b => b.checkIn === today && b.status !== 'CANCELLED').length,
    inhouse: bookings.filter(b => b.status === 'CHECKED-IN').length,
    departures: bookings.filter(b => b.checkOut === today && b.status !== 'CANCELLED').length,
  }), [bookings, today]);

  const stats = useMemo(() => {
    // Calculate revenue based on actual payments received (amountPaid), not total booking amount
    const paidRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const pendingRevenue = bookings.reduce((sum, b) => sum + (b.balance || 0), 0);
    const totalBookingValue = bookings.reduce((sum, b) => sum + b.amount, 0);

    return {
      totalRevenue: paidRevenue, // Revenue = actual payments received
      pendingRevenue: pendingRevenue, // Amount still owed
      totalBookingValue: totalBookingValue, // Total value of all bookings
      avgNightlyRate: bookings.length > 0 ? Math.round(bookings.reduce((sum, b) => sum + (b.amount / b.nights), 0) / bookings.length) : 0,
      totalGuests: bookings.reduce((sum, b) => sum + b.guests, 0),
      vipGuests: bookings.filter(b => b.vip).length,
    };
  }, [bookings]);

  // Filter pipeline
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Tab filter
    if (activeTab === 'arrivals') {
      result = result.filter(b => b.checkIn === today && b.status !== 'CANCELLED');
    } else if (activeTab === 'inhouse') {
      result = result.filter(b => b.status === 'CHECKED-IN');
    } else if (activeTab === 'departures') {
      result = result.filter(b => b.checkOut === today && b.status !== 'CANCELLED');
    }

    // Status filter (case-insensitive comparison)
    if (filters.status !== 'all') {
      const filterStatus = filters.status.toLowerCase();
      result = result.filter(b => b.status?.toLowerCase() === filterStatus);
    }

    // Source filter
    if (filters.source !== 'all') {
      result = result.filter(b => b.source === filters.source);
    }

    // Date range filter (check-in or check-out based on dateFilterType)
    if (filters.dateFrom || filters.dateTo) {
      result = result.filter(b => {
        const dateField = dateFilterType === 'checkout' ? b.checkOut : b.checkIn;
        if (!dateField) return false;

        const bookingDate = new Date(dateField);
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          if (bookingDate < fromDate) return false;
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          if (bookingDate > toDate) return false;
        }
        return true;
      });
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.guest.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query) ||
        b.email.toLowerCase().includes(query)
      );
    }

    // Sort by createdAt (newest first), then by checkIn as fallback
    result.sort((a, b) => {
      const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (bCreated !== aCreated) {
        return bCreated - aCreated; // Descending (newest first)
      }
      // If createdAt is same or missing, sort by checkIn
      const aCheckIn = a.checkIn ? new Date(a.checkIn).getTime() : 0;
      const bCheckIn = b.checkIn ? new Date(b.checkIn).getTime() : 0;
      return bCheckIn - aCheckIn; // Descending
    });

    return result;
  }, [bookings, activeTab, filters, searchQuery, today, dateFilterType]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ status: 'all', source: 'all', dateFrom: '', dateTo: '' });
    setDateFilterType('checkin');
    setCurrentPage(1);
  }, []);

  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  }, []);

  const handleStatusChange = useCallback((bookingId, newStatus) => {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, status: newStatus } : b
    ));
    setSelectedBooking(prev =>
      prev?.id === bookingId ? { ...prev, status: newStatus } : prev
    );
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filters, searchQuery]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
        {/* ============================================ */}
        {/* HEADER SECTION */}
        {/* ============================================ */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center bg-terra-50 flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-terra-600" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Reservations
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Booking Management
            </h1>
            <p className="text-[11px] sm:text-[13px] text-neutral-500 font-medium hidden sm:block">
              Orchestrate your guest experiences with precision and elegance.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchBookings}
              disabled={isLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all duration-300 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setIsNewBookingOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-2.5 bg-terra-500 hover:bg-terra-600 text-white rounded-lg text-[11px] sm:text-[13px] font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">New Reservation</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </header>

        {/* ============================================ */}
        {/* KPI GRID */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
          <KPICard
            title="Revenue Collected"
            value={stats.totalRevenue}
            subtitle={stats.pendingRevenue > 0 ? `₹${stats.pendingRevenue.toLocaleString()} pending` : null}
            prefix="₹"
            trend="up"
            trendValue="+12.5%"
            icon={DollarSign}
            accentColor="terra"
            delay={0}
          />
          <KPICard
            title="Active Bookings"
            value={counts.all}
            trend="up"
            trendValue="+8"
            icon={Calendar}
            accentColor="ocean"
            delay={1}
          />
          <KPICard
            title="Guests In-House"
            value={stats.totalGuests}
            icon={Users}
            accentColor="sage"
            delay={2}
          />
          <KPICard
            title="VIP Guests"
            value={stats.vipGuests}
            icon={Crown}
            accentColor="gold"
            delay={3}
          />
        </div>

        {/* ============================================ */}
        {/* TABS & CONTROLS */}
        {/* ============================================ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6 mb-3 sm:mb-6">
          <EditorialTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />

          <div className="flex items-center gap-2 sm:gap-3">
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* ============================================ */}
        {/* SEARCH & FILTERS */}
        {/* ============================================ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
          <PremiumSearchBar value={searchQuery} onChange={setSearchQuery} />
          <FilterChips
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            dateFilterType={dateFilterType}
            onDateFilterTypeChange={setDateFilterType}
          />
        </div>

        {/* ============================================ */}
        {/* BOOKINGS GRID / TABLE */}
        {/* ============================================ */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[10px] bg-white animate-in fade-in duration-300">
            <Loader2 className="w-12 h-12 mb-4 text-terra-500 animate-spin" />
            <h3 className="text-sm font-semibold mb-2 text-neutral-900">
              Loading bookings...
            </h3>
            <p className="text-[13px] text-neutral-500">
              Please wait while we fetch your reservations
            </p>
          </div>
        ) : apiError ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-[10px] bg-rose-50 border border-rose-200 animate-in fade-in duration-300">
            <AlertCircle className="w-12 h-12 mb-4 text-rose-500" />
            <h3 className="text-sm font-semibold mb-2 text-rose-900">
              Failed to load bookings
            </h3>
            <p className="text-[13px] text-rose-600 mb-4">
              {apiError}
            </p>
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[13px] font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <>
            {paginatedBookings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {paginatedBookings.map((booking, index) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onClick={handleBookingClick}
                    index={index}
                    onCheckIn={(id) => handleStatusChange(id, 'CHECKED-IN')}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 sm:py-20 rounded-[10px] bg-neutral-50 animate-in fade-in duration-300">
                <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 text-neutral-300" />
                <h3 className="text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 text-neutral-900">
                  No reservations found
                </h3>
                <p className="text-[11px] sm:text-[13px] text-neutral-500 text-center px-4">
                  {searchQuery || filters.status !== 'all' || filters.source !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'No bookings available. Create your first reservation to get started.'}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {paginatedBookings.length > 0 ? (
              <div className="rounded-[10px] bg-white overflow-hidden">
                {/* Horizontal scroll wrapper for mobile/tablet */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse table-fixed">
                    <colgroup>
                      <col style={{ width: '16%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '11%' }} />
                      <col style={{ width: '7%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '9%' }} />
                      <col style={{ width: '9%' }} />
                      <col style={{ width: '9%' }} />
                      <col style={{ width: '4%' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-neutral-50/30 border-b border-neutral-100">
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Guest Name</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Booking ID</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Check-in</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Nights</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Room</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Status</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Source</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Payment</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Amount</th>
                        <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-[10px] font-semibold uppercase tracking-widest text-neutral-400"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {paginatedBookings.map((booking, index) => (
                        <BookingTableRow
                          key={booking.id}
                          booking={booking}
                          onClick={handleBookingClick}
                          index={index}
                          onCheckIn={(id) => handleStatusChange(id, 'CHECKED-IN')}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 rounded-[10px] bg-neutral-50 animate-in fade-in duration-300">
                <Calendar className="w-12 h-12 mb-4 text-neutral-300" />
                <h3 className="text-sm font-semibold mb-2 text-neutral-900">
                  No reservations found
                </h3>
                <p className="text-[13px] text-neutral-500">
                  {searchQuery || filters.status !== 'all' || filters.source !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'No bookings available. Create your first reservation to get started.'}
                </p>
              </div>
            )}
          </>
        )}

        {/* ============================================ */}
        {/* PAGINATION */}
        {/* ============================================ */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6">
            <p className="text-[11px] sm:text-[13px] text-neutral-400 font-medium order-2 sm:order-1">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length}
            </p>
            <div className="order-1 sm:order-2">
              <LuxuryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )}
      </main>

      {/* ============================================ */}
      {/* BOOKING DETAIL DRAWER */}
      {/* ============================================ */}
      <BookingDetailDrawer
        booking={selectedBooking}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusChange={handleStatusChange}
      />

      {/* ============================================ */}
      {/* NEW BOOKING DRAWER */}
      {/* ============================================ */}
      <NewBookingDrawer
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        onSubmit={async (newBooking) => {
          try {
            const apiPayload = {
              roomId: newBooking.roomType?.toLowerCase().replace(/\s+/g, '-') || 'standard-room',
              checkIn: newBooking.checkIn,
              checkOut: newBooking.checkOut,
              guests: {
                adults: newBooking.adults || 1,
                children: newBooking.children || 0,
                infants: 0
              },
              guestInfo: {
                firstName: newBooking.guestName?.split(' ')[0] || 'Guest',
                lastName: newBooking.guestName?.split(' ').slice(1).join(' ') || '',
                email: newBooking.guestEmail || '',
                phone: newBooking.guestPhone || '',
                country: 'US',
                specialRequests: newBooking.specialRequests || ''
              }
            };

            await bookingService.createBooking(apiPayload);
            await fetchBookings();
          } catch (error: any) {
            console.log('API booking creation failed, adding locally:', error?.message);
            const bookingId = `BK${Date.now().toString().slice(-6)}`;
            const booking = {
              id: bookingId,
              guest: newBooking.guestName,
              email: newBooking.guestEmail,
              phone: newBooking.guestPhone,
              checkIn: newBooking.checkIn,
              checkOut: newBooking.checkOut,
              nights: newBooking.nights,
              roomType: newBooking.roomType,
              room: newBooking.selectedRoom?.number || null,
              status: 'CONFIRMED',
              source: newBooking.source,
              vip: newBooking.isVip,
              amount: newBooking.amount,
              guests: newBooking.adults + newBooking.children,
              createdAt: new Date().toISOString()
            };
            setBookings(prev => [booking, ...prev]);
          } finally {
            setIsNewBookingOpen(false);
          }
        }}
        availableRooms={[]}
        getRateForBooking={() => 250}
      />
    </div>
  );
}
