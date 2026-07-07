/**
 * CMS Availability Page - Glimmora Luxury Edition
 * Premium Enterprise Availability Management with Editorial Design
 * Features: Visual inventory grid, rate optimization, channel sync, heatmaps
 */

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { useTheme } from '../../../contexts/ThemeContext';
import useCMSAvailability from '../../../state/cms/useCMSAvailability';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import { clearAllCaches } from '../../../api/client';
import { Button } from '../../../components/ui2/Button';
import { Drawer } from '../../../components/ui2/Modal';
import { Tooltip } from '../../../components/ui2/Tooltip';
import { RoomBlockModal } from '../../../components/availability/RoomBlockModal';
import { AIInsightsPanel } from '../../../components/availability/AIInsightsPanel';
import { RoomBlocksListPanel } from '../../../components/availability/RoomBlocksListPanel';
import { cn } from '../../../lib/utils';
import {
  Calendar, ChevronLeft, ChevronRight, Download, Upload, RefreshCw,
  Check, X, Ban, Lock, Unlock, AlertTriangle,
  TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles,
  Bed, DollarSign, Percent, CalendarX, Clock,
  Building2, BarChart3, Copy,
  Settings, Save, Plus, Minus, Activity, Home,
  LogIn, LogOut, Layers, Globe,
  Wifi, CheckCircle, AlertCircle, Flame, Snowflake,
  LayoutGrid, Map, Crown, Target
} from 'lucide-react';

// ============================================
// ANIMATED NUMBER COMPONENT
// ============================================
function AnimatedNumber({ value, prefix = '', suffix = '', duration = 1000 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
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
  }, [value, duration]);

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

// Room type configurations with enhanced data - matches database seed_database.py
// Total: 19 rooms (7+7+3+1+1)
const ROOM_TYPE_CONFIG = {
  'Standard Single AC': { code: 'STDAC', color: 'slate', icon: Bed, totalRooms: 7, baseRate: 1500, floor: 1 },
  'Standard Single Non-AC': { code: 'STDNAC', color: 'neutral', icon: Bed, totalRooms: 0, baseRate: 1000, floor: 1 },
  'Executive Double AC': { code: 'EXDAC', color: 'terra', icon: Bed, totalRooms: 7, baseRate: 2500, floor: 2 },
  'Executive Double Non-AC': { code: 'EXDNAC', color: 'copper', icon: Bed, totalRooms: 0, baseRate: 2000, floor: 2 },
  'Executive Twin Bed AC': { code: 'EXTWIN', color: 'ocean', icon: Bed, totalRooms: 3, baseRate: 2500, floor: 2 },
  'King Room AC': { code: 'KING', color: 'gold', icon: Building2, totalRooms: 1, baseRate: 3500, floor: 3 },
  'Royal Suite AC': { code: 'ROYAL', color: 'sage', icon: Crown, totalRooms: 1, baseRate: 3500, floor: 3 }
};

// Channel configurations
const CHANNELS = [
  { id: 'direct', name: 'Direct', icon: Globe, color: 'terra', status: 'connected', lastSync: '2 min ago' },
  { id: 'booking', name: 'Booking.com', icon: Globe, color: 'ocean', status: 'connected', lastSync: '5 min ago' },
  { id: 'expedia', name: 'Expedia', icon: Globe, color: 'gold', status: 'syncing', lastSync: 'Syncing...' },
  { id: 'airbnb', name: 'Airbnb', icon: Globe, color: 'rose', status: 'error', lastSync: 'Error' }
];

// ============================================
// PREMIUM KPI CARD
// ============================================
function KPICard({ title, value, prefix = '', suffix = '', subtitle, icon: Icon, trend, accentColor = 'terra' }: {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  subtitle: string;
  icon: any;
  trend?: { value: string; isPositive: boolean } | null;
  accentColor?: string;
}) {
  const isPositive = trend?.isPositive !== false;

  const bgColorMap = {
    terra: 'bg-terra-50',
    gold: 'bg-gold-50',
    ocean: 'bg-ocean-50',
    sage: 'bg-sage-50',
    rose: 'bg-rose-50',
  };

  const textColorMap = {
    terra: 'text-terra-600',
    gold: 'text-gold-600',
    ocean: 'text-ocean-600',
    sage: 'text-sage-600',
    rose: 'text-rose-600',
  };

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-white p-4 sm:p-6">
      {/* Header with Icon */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={cn(
          'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center',
          bgColorMap[accentColor]
        )}>
          <Icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', textColorMap[accentColor])} />
        </div>
        <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
          {title}
        </p>
      </div>

      {/* Value */}
      <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1 sm:mb-2">
        <AnimatedNumber value={typeof value === 'number' ? value : parseInt(value) || 0} prefix={prefix} suffix={suffix} />
      </p>

      {/* Comparison */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate">
          {subtitle || 'vs Last Period'}
        </p>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold flex-shrink-0',
            isPositive ? 'text-sage-600' : 'text-rose-600'
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            {trend.value}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// EDITORIAL TAB NAVIGATION
// ============================================
function EditorialTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'calendar', label: 'Calendar View', shortLabel: 'Calendar', icon: Calendar },
    { id: 'inventory', label: 'Room Inventory', shortLabel: 'Inventory', icon: LayoutGrid },
    { id: 'rates', label: 'Rate Manager', shortLabel: 'Rates', icon: DollarSign },
  ];

  return (
    <div className="flex items-center gap-1 p-1 sm:p-1.5 rounded-lg bg-neutral-100 overflow-x-auto max-w-full">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-[13px] font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
              isActive
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// CHANNEL SYNC STATUS
// ============================================
function ChannelSyncStatus() {
  return (
    <div className="rounded-[10px] bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
            Channel Status
          </span>
        </div>
        <button className="text-[10px] sm:text-[11px] font-semibold text-terra-600 px-2 py-1 rounded-lg hover:bg-terra-50 transition-colors">
          Sync All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {CHANNELS.map((channel) => (
          <div
            key={channel.id}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
          >
            <div className={cn(
              'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              channel.status === 'connected' && 'bg-sage-50',
              channel.status === 'syncing' && 'bg-gold-50',
              channel.status === 'error' && 'bg-rose-50'
            )}>
              {channel.status === 'connected' && <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />}
              {channel.status === 'syncing' && <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600 animate-spin" />}
              {channel.status === 'error' && <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-[13px] font-semibold text-neutral-800 truncate">
                {channel.name}
              </p>
              <p className={cn(
                'text-[9px] sm:text-[10px] font-medium',
                channel.status === 'error' ? 'text-rose-500' : 'text-neutral-400'
              )}>
                {channel.lastSync}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// OCCUPANCY HEATMAP
// ============================================
function OccupancyHeatmap({ dates, availabilityData, selectedRoomTypes, isDark }) {
  const heatmapData = useMemo(() => {
    return dates.slice(0, 14).map(dateInfo => {
      let totalRooms = 0;
      let totalOccupied = 0;

      selectedRoomTypes.forEach(roomType => {
        const dayData = availabilityData[dateInfo.date]?.[roomType];
        if (dayData) {
          totalRooms += dayData.totalRooms;
          // Include both sold (checked_in) and reserved (confirmed bookings) for occupancy
          totalOccupied += (dayData.sold || 0) + (dayData.reserved || 0);
        }
      });

      return {
        ...dateInfo,
        occupancy: totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0
      };
    });
  }, [dates, availabilityData, selectedRoomTypes]);

  const getHeatColor = (occupancy) => {
    if (occupancy >= 90) return isDark ? 'bg-rose-500' : 'bg-rose-500';
    if (occupancy >= 80) return isDark ? 'bg-gold-500' : 'bg-gold-500';
    if (occupancy >= 60) return isDark ? 'bg-terra-500' : 'bg-terra-500';
    if (occupancy >= 40) return isDark ? 'bg-sage-500' : 'bg-sage-500';
    return isDark ? 'bg-ocean-500' : 'bg-ocean-500';
  };

  return (
    <div className={cn(
      'rounded-2xl p-4 sm:p-5 transition-all duration-300',
      isDark
        ? 'bg-neutral-900/80 border border-neutral-800'
        : 'bg-white border border-neutral-200/60'
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
          <span className={cn(
            'text-[10px] sm:text-xs font-semibold uppercase tracking-wider',
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          )}>
            14-Day Forecast
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px]">
          <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>Low</span>
          <div className="flex gap-0.5">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-ocean-500" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-sage-500" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-terra-500" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-gold-500" />
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-rose-500" />
          </div>
          <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>High</span>
        </div>
      </div>

      <div className="flex gap-0.5 sm:gap-1">
        {heatmapData.map((day) => (
          <Tooltip key={day.date} content={`${day.dayOfWeek} ${day.dayOfMonth}: ${day.occupancy}%`}>
            <div className="flex-1 group cursor-pointer">
              <div
                className={cn(
                  'h-12 sm:h-16 rounded-lg transition-all duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-white/20',
                  getHeatColor(day.occupancy)
                )}
                style={{ opacity: 0.3 + (day.occupancy / 100) * 0.7 }}
              />
              <p className={cn(
                'text-[8px] sm:text-[9px] text-center mt-1 font-medium',
                day.isToday ? 'text-terra-500' : isDark ? 'text-neutral-500' : 'text-neutral-400'
              )}>
                {day.dayOfMonth}
              </p>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

// ============================================
// QUICK STATS STRIP
// ============================================
function QuickStatsStrip({ stats, todayStats, isDark }) {
  return (
    <div className={cn(
      'rounded-2xl p-3 sm:p-4 overflow-x-auto',
      isDark
        ? 'bg-gradient-to-r from-terra-950/50 via-neutral-900/80 to-ocean-950/50 border border-neutral-800'
        : 'bg-gradient-to-r from-terra-50 via-white to-ocean-50 border border-neutral-200/60'
    )}>
      <div className="flex items-center justify-between gap-3 sm:gap-6 min-w-max">
        {/* Arrivals */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center shadow-lg shadow-sage-500/20">
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <p className={cn(
              'text-base sm:text-xl font-bold',
              isDark ? 'text-white' : 'text-neutral-900'
            )}>
              {todayStats.arrivals}
            </p>
            <p className={cn(
              'text-[9px] sm:text-[10px] font-medium uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Arrivals
            </p>
          </div>
        </div>

        <div className={cn('h-6 sm:h-8 w-px flex-shrink-0', isDark ? 'bg-neutral-800' : 'bg-neutral-200')} />

        {/* Departures */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center shadow-lg shadow-ocean-500/20">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <p className={cn(
              'text-base sm:text-xl font-bold',
              isDark ? 'text-white' : 'text-neutral-900'
            )}>
              {todayStats.departures}
            </p>
            <p className={cn(
              'text-[9px] sm:text-[10px] font-medium uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Departures
            </p>
          </div>
        </div>

        <div className={cn('h-6 sm:h-8 w-px flex-shrink-0', isDark ? 'bg-neutral-800' : 'bg-neutral-200')} />

        {/* In House */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-fit">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <Bed className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <p className={cn(
              'text-base sm:text-xl font-bold',
              isDark ? 'text-white' : 'text-neutral-900'
            )}>
              {todayStats.inHouse || stats.totalSold}
            </p>
            <p className={cn(
              'text-[9px] sm:text-[10px] font-medium uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              In-House
            </p>
          </div>
        </div>

        <div className={cn('h-6 sm:h-8 w-px flex-shrink-0 hidden sm:block', isDark ? 'bg-neutral-800' : 'bg-neutral-200')} />

        {/* Reserved (confirmed but not checked in) - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 min-w-fit">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center shadow-lg shadow-ocean-500/20">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <p className={cn(
              'text-base sm:text-xl font-bold text-ocean-500'
            )}>
              {stats.totalReserved || 0}
            </p>
            <p className={cn(
              'text-[9px] sm:text-[10px] font-medium uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Reserved
            </p>
          </div>
        </div>

        <div className={cn('h-6 sm:h-8 w-px flex-shrink-0 hidden sm:block', isDark ? 'bg-neutral-800' : 'bg-neutral-200')} />

        {/* Available - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 sm:gap-3 min-w-fit">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-terra-400 to-terra-600 flex items-center justify-center shadow-lg shadow-terra-500/20">
            <Home className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <p className={cn(
              'text-base sm:text-xl font-bold text-sage-500'
            )}>
              {stats.totalAvailable}
            </p>
            <p className={cn(
              'text-[9px] sm:text-[10px] font-medium uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Available
            </p>
          </div>
        </div>

        <div className={cn('h-6 sm:h-8 w-px flex-shrink-0 hidden lg:block', isDark ? 'bg-neutral-800' : 'bg-neutral-200')} />

        {/* Demand - hidden on mobile */}
        <div className="hidden lg:flex items-center gap-2 sm:gap-3 min-w-fit">
          <div className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center',
            stats.occupancyRate >= 80
              ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-lg shadow-rose-500/20'
              : 'bg-gradient-to-br from-neutral-400 to-neutral-600 shadow-lg shadow-neutral-500/20'
          )}>
            {stats.occupancyRate >= 80 ? (
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            )}
          </div>
          <div>
            <p className={cn(
              'text-base sm:text-xl font-bold',
              stats.occupancyRate >= 80 ? 'text-rose-500' : isDark ? 'text-white' : 'text-neutral-900'
            )}>
              {stats.occupancyRate >= 80 ? 'High' : 'Normal'}
            </p>
            <p className={cn(
              'text-[9px] sm:text-[10px] font-medium uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Demand
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ROOM TYPE FILTER PILLS
// ============================================
function RoomTypeFilterPills({ selectedRoomTypes, onToggle, isDark, roomTypeConfig }) {
  return (
    <div className={cn(
      'flex items-center gap-1 p-1 rounded-xl overflow-x-auto max-w-full',
      isDark ? 'bg-neutral-800/50' : 'bg-neutral-100'
    )}>
      {Object.entries(roomTypeConfig).map(([name, config]) => (
        <button
          key={name}
          onClick={() => onToggle(name)}
          className={cn(
            'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0',
            selectedRoomTypes.includes(name)
              ? isDark
                ? 'bg-terra-500 text-white shadow-lg shadow-terra-500/20'
                : 'bg-terra-500 text-white shadow-md shadow-terra-500/20'
              : isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
          )}
        >
          <config.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">{config.code}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================
// ENHANCED CALENDAR DAY CELL
// ============================================
function CalendarDayCell({
  dayData,
  isSelected,
  isToday,
  onClick,
  showPickup = true,
  isDark
}) {
  if (!dayData) return null;

  const { sold, reserved = 0, remaining, totalRooms, isClosed, restrictions, baseRate } = dayData;
  // Calculate total occupied (sold + reserved)
  const totalOccupied = (sold || 0) + (reserved || 0);
  const occupancy = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;
  const minStay = restrictions?.minStay || 1;

  // Pickup indicator (simulated)
  const pickup = Math.floor(Math.random() * 5) - 2;

  const getCellBg = () => {
    if (isClosed) return isDark ? 'bg-rose-500/10' : 'bg-rose-50/80';
    if (remaining === 0) return isDark ? 'bg-rose-500/5' : 'bg-rose-50/60';
    if (occupancy >= 90) return isDark ? 'bg-gold-500/5' : 'bg-gold-50/60';
    if (occupancy >= 70) return isDark ? 'bg-sage-500/5' : 'bg-sage-50/60';
    return isDark ? 'bg-white/[0.02]' : 'bg-white';
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-3 min-h-[110px] rounded-xl transition-all duration-200 cursor-pointer group',
        'border',
        getCellBg(),
        isSelected
          ? 'border-terra-500 ring-2 ring-terra-500/30'
          : isToday
            ? isDark ? 'border-terra-500/50' : 'border-terra-300'
            : isDark ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-200/60 hover:border-neutral-300',
        !isClosed && 'hover:shadow-lg hover:scale-[1.02]',
        isClosed && 'opacity-70'
      )}
    >
      {/* Status indicators */}
      <div className="absolute top-2 right-2 flex items-center gap-0.5">
        {isClosed && (
          <Tooltip content="Room Closed">
            <span className={cn(
              'w-5 h-5 rounded flex items-center justify-center',
              isDark ? 'bg-rose-500/30' : 'bg-rose-100'
            )}>
              <Ban className="w-3 h-3 text-rose-500" />
            </span>
          </Tooltip>
        )}
        {restrictions?.CTA && (
          <Tooltip content="Closed to Arrival">
            <span className={cn(
              'w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold',
              isDark ? 'bg-gold-500/30 text-gold-400' : 'bg-gold-100 text-gold-700'
            )}>
              A
            </span>
          </Tooltip>
        )}
        {restrictions?.CTD && (
          <Tooltip content="Closed to Departure">
            <span className={cn(
              'w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold',
              isDark ? 'bg-ocean-500/30 text-ocean-400' : 'bg-ocean-100 text-ocean-700'
            )}>
              D
            </span>
          </Tooltip>
        )}
      </div>

      {/* Main content */}
      <div className="space-y-2">
        {/* Availability count */}
        <div className="flex items-baseline gap-1">
          <span className={cn(
            'text-2xl font-bold tabular-nums',
            remaining === 0
              ? 'text-rose-500'
              : remaining <= 3
                ? isDark ? 'text-gold-400' : 'text-gold-600'
                : isDark ? 'text-white' : 'text-neutral-900'
          )}>
            {remaining}
          </span>
          <span className={cn(
            'text-xs',
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          )}>
            /{totalRooms}
          </span>
        </div>

        {/* Mini occupancy bar */}
        <div className={cn(
          'h-1.5 rounded-full overflow-hidden',
          isDark ? 'bg-neutral-800' : 'bg-neutral-200'
        )}>
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              occupancy >= 90 ? 'bg-rose-500' :
              occupancy >= 70 ? 'bg-gold-500' :
              occupancy >= 50 ? 'bg-sage-500' : 'bg-ocean-500'
            )}
            style={{ width: `${occupancy}%` }}
          />
        </div>

        {/* Min stay badge */}
        {minStay > 1 && (
          <div className={cn(
            'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold',
            isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-neutral-100 text-neutral-600'
          )}>
            <Clock className="w-2.5 h-2.5" />
            {minStay}N min
          </div>
        )}

        {/* Base rate */}
        {baseRate != null && (
          <div className={cn(
            'text-[10px] font-semibold tabular-nums',
            isDark ? 'text-terra-400' : 'text-terra-600'
          )}>
            ₹{baseRate}
          </div>
        )}

        {/* Pickup indicator */}
        {showPickup && pickup !== 0 && (
          <div className={cn(
            'absolute bottom-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold',
            pickup > 0
              ? isDark ? 'bg-sage-500/20 text-sage-400' : 'bg-sage-50 text-sage-600'
              : isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-600'
          )}>
            {pickup > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {Math.abs(pickup)}
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className={cn(
        'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none',
        'bg-gradient-to-t from-terra-500/10 to-transparent'
      )} />
    </div>
  );
}

// ============================================
// VISUAL ROOM INVENTORY GRID
// ============================================
function RoomInventoryGrid({ rooms, isDark }) {
  const roomsByFloor = useMemo(() => {
    const grouped = {};
    rooms?.forEach(room => {
      if (!grouped[room.floor]) grouped[room.floor] = [];
      grouped[room.floor].push(room);
    });
    return grouped;
  }, [rooms]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Occupied': return isDark ? 'bg-terra-500' : 'bg-terra-500';
      case 'Reserved': return isDark ? 'bg-ocean-500' : 'bg-ocean-500';
      case 'Available': return isDark ? 'bg-sage-500' : 'bg-sage-500';
      case 'Maintenance': return isDark ? 'bg-gold-500' : 'bg-gold-500';
      default: return isDark ? 'bg-neutral-500' : 'bg-neutral-400';
    }
  };

  const floors = Object.keys(roomsByFloor).sort((a, b) => b - a);

  return (
    <div className={cn(
      'rounded-2xl p-4 sm:p-6 transition-all duration-300',
      isDark
        ? 'bg-neutral-900/80 border border-neutral-800'
        : 'bg-white border border-neutral-200/60'
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center',
            isDark ? 'bg-terra-500/20' : 'bg-terra-100'
          )}>
            <Map className={cn('w-4 h-4 sm:w-5 sm:h-5', isDark ? 'text-terra-400' : 'text-terra-600')} />
          </div>
          <div>
            <h3 className={cn(
              'text-base sm:text-lg font-sans font-semibold',
              isDark ? 'text-white' : 'text-neutral-900'
            )}>
              Room Inventory
            </h3>
            <p className={cn(
              'text-[10px] sm:text-xs',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Real-time room status by floor
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-sage-500" />
            <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>Available</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-ocean-500" />
            <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-terra-500" />
            <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gold-500" />
            <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>Maintenance</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {floors.map(floor => (
          <div key={floor} className="flex items-center gap-2 sm:gap-4">
            <div className={cn(
              'w-12 sm:w-16 flex-shrink-0 text-right',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              <span className="text-xs sm:text-sm font-semibold">Floor {floor}</span>
            </div>
            <div className="flex-1 flex flex-wrap gap-1.5 sm:gap-2">
              {roomsByFloor[floor]?.map(room => (
                <Tooltip key={room.number} content={`${room.number} - ${room.type} (${room.status})`}>
                  <div
                    className={cn(
                      'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold text-white cursor-pointer',
                      'transition-all duration-200 hover:scale-110 hover:shadow-lg',
                      getStatusColor(room.status)
                    )}
                  >
                    {room.number}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// RATE RECOMMENDATION WIDGET
// ============================================
function RateRecommendationWidget({ stats, isDark }) {
  const recommendations = useMemo(() => {
    const recs = [];

    if (stats.occupancyRate >= 85) {
      recs.push({
        type: 'increase',
        icon: TrendingUp,
        title: 'Increase Rates',
        description: 'High demand detected. Consider 10-15% rate increase.',
        color: 'sage',
        action: 'Apply +12%'
      });
    }

    if (stats.occupancyRate < 50) {
      recs.push({
        type: 'decrease',
        icon: Target,
        title: 'Promotional Rates',
        description: 'Low occupancy. Flash sale recommended.',
        color: 'gold',
        action: 'Create Promo'
      });
    }

    if (stats.closedDays > 5) {
      recs.push({
        type: 'review',
        icon: AlertTriangle,
        title: 'Review Restrictions',
        description: `${stats.closedDays} room/dates closed. Verify necessity.`,
        color: 'rose',
        action: 'Review'
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: 'optimal',
        icon: CheckCircle,
        title: 'Rates Optimized',
        description: 'Current pricing strategy is performing well.',
        color: 'sage',
        action: 'View Report'
      });
    }

    return recs;
  }, [stats]);

  return (
    <div className={cn(
      'rounded-2xl p-5 transition-all duration-300',
      isDark
        ? 'bg-gradient-to-br from-gold-950/50 to-terra-950/50 border border-gold-800/30'
        : 'bg-gradient-to-br from-gold-50 to-terra-50 border border-gold-200/60'
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className={cn('w-5 h-5', isDark ? 'text-gold-400' : 'text-gold-600')} />
        <span className={cn(
          'text-sm font-semibold',
          isDark ? 'text-gold-400' : 'text-gold-700'
        )}>
          AI Rate Recommendations
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer',
              isDark ? 'bg-neutral-900/50 hover:bg-neutral-800/50' : 'bg-white/60 hover:bg-white'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              rec.color === 'sage' && (isDark ? 'bg-sage-500/20' : 'bg-sage-100'),
              rec.color === 'gold' && (isDark ? 'bg-gold-500/20' : 'bg-gold-100'),
              rec.color === 'rose' && (isDark ? 'bg-rose-500/20' : 'bg-rose-100')
            )}>
              <rec.icon className={cn(
                'w-5 h-5',
                rec.color === 'sage' && 'text-sage-500',
                rec.color === 'gold' && 'text-gold-500',
                rec.color === 'rose' && 'text-rose-500'
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-semibold',
                isDark ? 'text-white' : 'text-neutral-900'
              )}>
                {rec.title}
              </p>
              <p className={cn(
                'text-xs truncate',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}>
                {rec.description}
              </p>
            </div>
            <button className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              isDark ? 'bg-terra-500/20 text-terra-400 hover:bg-terra-500/30' : 'bg-terra-100 text-terra-700 hover:bg-terra-200'
            )}>
              {rec.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EDIT PANEL COMPONENT
// ============================================
function AvailabilityEditPanel({
  isOpen,
  onClose,
  selectedDate,
  selectedRoomType,
  dayData,
  onSave,
  isDark
}) {
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (dayData) {
      setEditData({
        remaining: dayData.remaining,
        isClosed: dayData.isClosed,
        baseRate: dayData.baseRate ?? null,
        minStay: dayData.restrictions?.minStay || 1,
        maxStay: dayData.restrictions?.maxStay || null,
        CTA: dayData.restrictions?.CTA || false,
        CTD: dayData.restrictions?.CTD || false
      });
    }
  }, [dayData]);

  if (!isOpen || !selectedDate || !dayData) return null;

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      title="Edit Availability"
      side="right"
      size="md"
    >
      <div className="p-6 space-y-6">
        {/* Header Info */}
        <div className={cn(
          'p-4 rounded-xl border',
          isDark ? 'bg-white/[0.03] border-white/[0.08]' : 'bg-neutral-50 border-neutral-200'
        )}>
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isDark ? 'bg-terra-500/20' : 'bg-terra-100'
            )}>
              <Calendar className={cn('w-6 h-6', isDark ? 'text-terra-400' : 'text-terra-600')} />
            </div>
            <div>
              <p className={cn(
                'font-sans font-semibold text-lg',
                isDark ? 'text-white' : 'text-neutral-900'
              )}>
                {selectedRoomType}
              </p>
              <p className={cn(
                'text-sm',
                isDark ? 'text-neutral-500' : 'text-neutral-500'
              )}>
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Sold', value: dayData.sold, color: 'terra' },
              { label: 'Available', value: editData.remaining, color: 'sage' },
              { label: 'Total', value: dayData.totalRooms, color: 'neutral' }
            ].map(stat => (
              <div key={stat.label} className={cn(
                'p-3 rounded-xl text-center',
                isDark ? 'bg-neutral-800' : 'bg-white'
              )}>
                <p className={cn(
                  'text-xs mb-1',
                  isDark ? 'text-neutral-500' : 'text-neutral-400'
                )}>{stat.label}</p>
                <p className={cn(
                  'text-xl font-bold',
                  stat.color === 'sage' ? 'text-sage-500' :
                  stat.color === 'terra' ? 'text-terra-500' :
                  isDark ? 'text-white' : 'text-neutral-900'
                )}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Base Rate */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-3',
            isDark ? 'text-neutral-300' : 'text-neutral-700'
          )}>
            Base Rate ($)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={editData.baseRate ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? null : Math.max(0, parseInt(e.target.value, 10) || 0);
              setEditData(prev => ({ ...prev, baseRate: v }));
            }}
            placeholder="e.g. 245"
            className={cn(
              'w-full h-12 rounded-xl border px-4 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-terra-500/40',
              isDark
                ? 'bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500'
                : 'bg-white border-neutral-200 text-neutral-900 placeholder:text-neutral-400'
            )}
          />
        </div>

        {/* Availability Control */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-3',
            isDark ? 'text-neutral-300' : 'text-neutral-700'
          )}>
            Available Rooms
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditData(prev => ({ ...prev, remaining: Math.max(0, prev.remaining - 1) }))}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center border transition-colors',
                isDark
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white'
                  : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              )}
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              value={editData.remaining}
              onChange={(e) => setEditData(prev => ({
                ...prev,
                remaining: Math.max(0, Math.min(dayData.totalRooms, parseInt(e.target.value) || 0))
              }))}
              className={cn(
                'flex-1 h-12 rounded-xl border text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-terra-500/40',
                isDark
                  ? 'bg-neutral-800 border-neutral-700 text-white'
                  : 'bg-white border-neutral-200 text-neutral-900'
              )}
            />
            <button
              onClick={() => setEditData(prev => ({ ...prev, remaining: Math.min(dayData.totalRooms, prev.remaining + 1) }))}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center border transition-colors',
                isDark
                  ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white'
                  : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Room Status Toggle */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-3',
            isDark ? 'text-neutral-300' : 'text-neutral-700'
          )}>
            Room Status
          </label>
          <button
            onClick={() => setEditData(prev => ({ ...prev, isClosed: !prev.isClosed }))}
            className={cn(
              'w-full p-4 rounded-xl border flex items-center justify-between transition-all duration-200',
              editData.isClosed
                ? isDark
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-rose-50 border-rose-200'
                : isDark
                  ? 'bg-sage-500/10 border-sage-500/30'
                  : 'bg-sage-50 border-sage-200'
            )}
          >
            <div className="flex items-center gap-3">
              {editData.isClosed ? (
                <Ban className="w-5 h-5 text-rose-500" />
              ) : (
                <Check className="w-5 h-5 text-sage-500" />
              )}
              <div className="text-left">
                <p className={cn(
                  'font-semibold',
                  editData.isClosed ? 'text-rose-600' : 'text-sage-700'
                )}>
                  {editData.isClosed ? 'Room Closed' : 'Room Open'}
                </p>
                <p className={cn(
                  'text-xs',
                  isDark ? 'text-neutral-500' : 'text-neutral-500'
                )}>
                  {editData.isClosed ? 'No bookings allowed' : 'Accepting reservations'}
                </p>
              </div>
            </div>
            <div className={cn(
              'w-14 h-7 rounded-full relative transition-colors duration-200',
              editData.isClosed ? 'bg-rose-500' : 'bg-sage-500'
            )}>
              <div className={cn(
                'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200',
                editData.isClosed ? 'left-0.5' : 'left-7'
              )} />
            </div>
          </button>
        </div>

        {/* Min Stay */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-3',
            isDark ? 'text-neutral-300' : 'text-neutral-700'
          )}>
            Minimum Stay (nights)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 7].map(nights => (
              <button
                key={nights}
                onClick={() => setEditData(prev => ({ ...prev, minStay: nights }))}
                className={cn(
                  'flex-1 h-11 rounded-xl border text-sm font-semibold transition-all duration-200',
                  editData.minStay === nights
                    ? isDark
                      ? 'bg-terra-500 border-terra-500 text-white'
                      : 'bg-terra-500 border-terra-500 text-white'
                    : isDark
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                )}
              >
                {nights}
              </button>
            ))}
          </div>
        </div>

        {/* Restrictions */}
        <div>
          <label className={cn(
            'block text-sm font-medium mb-3',
            isDark ? 'text-neutral-300' : 'text-neutral-700'
          )}>
            Restrictions
          </label>
          <div className="space-y-2">
            {[
              { key: 'CTA', label: 'Closed to Arrival', color: 'gold' },
              { key: 'CTD', label: 'Closed to Departure', color: 'ocean' }
            ].map(restriction => (
              <button
                key={restriction.key}
                onClick={() => setEditData(prev => ({ ...prev, [restriction.key]: !prev[restriction.key] }))}
                className={cn(
                  'w-full p-3 rounded-xl border flex items-center justify-between transition-all duration-200',
                  editData[restriction.key]
                    ? restriction.key === 'CTA'
                      ? isDark ? 'bg-gold-500/10 border-gold-500/30' : 'bg-gold-50 border-gold-200'
                      : isDark ? 'bg-ocean-500/10 border-ocean-500/30' : 'bg-ocean-50 border-ocean-200'
                    : isDark
                      ? 'bg-neutral-800 border-neutral-700'
                      : 'bg-white border-neutral-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    editData[restriction.key]
                      ? restriction.key === 'CTA' ? 'bg-gold-500 text-white' : 'bg-ocean-500 text-white'
                      : isDark ? 'bg-neutral-700 text-neutral-500' : 'bg-neutral-100 text-neutral-400'
                  )}>
                    {restriction.key === 'CTA' ? 'A' : 'D'}
                  </span>
                  <span className={cn(
                    'text-sm font-medium',
                    isDark ? 'text-white' : 'text-neutral-900'
                  )}>
                    {restriction.label}
                  </span>
                </div>
                <Check className={cn(
                  'w-5 h-5 transition-opacity',
                  editData[restriction.key]
                    ? restriction.key === 'CTA' ? 'opacity-100 text-gold-500' : 'opacity-100 text-ocean-500'
                    : 'opacity-0'
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setEditData(prev => ({ ...prev, remaining: 0, isClosed: true }))}
            className={cn(
              'p-3 rounded-xl border text-sm font-medium transition-all duration-200',
              isDark
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
            )}
          >
            Mark Sold Out
          </button>
          <button
            onClick={() => setEditData({
              remaining: dayData.totalRooms - dayData.sold,
              isClosed: false,
              CTA: false,
              CTD: false,
              minStay: 1
            })}
            className={cn(
              'p-3 rounded-xl border text-sm font-medium transition-all duration-200',
              isDark
                ? 'bg-sage-500/10 border-sage-500/20 text-sage-400 hover:bg-sage-500/20'
                : 'bg-sage-50 border-sage-200 text-sage-600 hover:bg-sage-100'
            )}
          >
            Reset Default
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 p-4 border-t',
        isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
      )}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={() => onSave(selectedDate, selectedRoomType, editData)}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

// ============================================
// MAIN AVAILABILITY PAGE COMPONENT
// ============================================
export default function CMSAvailability() {
  const { isDark } = useTheme();
  const { success, info, error: showError } = useToast();
  const cmsAvailability = useCMSAvailability();
  const scrollContainerRef = useRef(null);

  // Use real room type config from backend, generate UI config dynamically
  const roomTypeConfig = useMemo(() => {
    const backendConfig = cmsAvailability.roomTypeConfig || {};
    const merged = {};

    console.log('🔍 Backend Room Type Config:', backendConfig);
    console.log('📊 Availability Data:', cmsAvailability.availabilityData);
    console.log('⏳ Loading State:', cmsAvailability.isLoading);
    console.log('❌ Error State:', cmsAvailability.error);

    // Default UI colors and icons for different room types
    const defaultColors = ['slate', 'terra', 'ocean', 'gold', 'sage', 'rose', 'ocean', 'terra'];
    const defaultIcons = [Bed, Bed, Bed, Building2, Building2, Crown, Home, Crown];

    // Build config from backend data
    Object.keys(backendConfig).forEach((roomTypeName, index) => {
      const backendData = backendConfig[roomTypeName];

      // Try to find matching hardcoded config, otherwise use defaults
      const hardcodedUI = ROOM_TYPE_CONFIG[roomTypeName] || {
        color: defaultColors[index % defaultColors.length],
        icon: defaultIcons[index % defaultIcons.length],
        floor: Math.floor(index / 2) + 2
      };

      merged[roomTypeName] = {
        ...hardcodedUI,
        totalRooms: backendData.totalRooms, // Use REAL count from backend
        baseRate: backendData.baseRate,
        code: backendData.code
      };
    });

    console.log('✅ Merged Room Type Config:', merged);

    // No fallback - return only real data from backend
    return merged;
  }, [cmsAvailability.roomTypeConfig, cmsAvailability.availabilityData, cmsAvailability.isLoading, cmsAvailability.error]);

  // State
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedRoomTypes, setSelectedRoomTypes] = useState([]);
  const [showPickup, setShowPickup] = useState(true);
  const [editPanelOpen, setEditPanelOpen] = useState(false);
  const [editTarget, setEditTarget] = useState({ date: null, roomType: null });
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkSelections, setBulkSelections] = useState([]);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockToEdit, setBlockToEdit] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkWizardOpen, setIsBulkWizardOpen] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'primary' | 'warning' | 'danger';
    onConfirm: () => void;
  } | null>(null);

  // Bulk Update Wizard state
  const [bulkWizardData, setBulkWizardData] = useState<{
    startDate: string;
    endDate: string;
    selectedAction: 'close' | 'open' | 'minStay' | 'cta' | null;
    minStayValue: number;
  }>({
    startDate: '',
    endDate: '',
    selectedAction: null,
    minStayValue: 2
  });
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Clear API cache on mount to ensure fresh data
  useEffect(() => {
    clearAllCaches();
  }, []);

  // Initialize selected room types when room config loads
  useEffect(() => {
    if (Object.keys(roomTypeConfig).length > 0 && selectedRoomTypes.length === 0) {
      setSelectedRoomTypes(Object.keys(roomTypeConfig));
    }
  }, [roomTypeConfig]);

  // Generate dates for calendar - use local date formatting to match sampleAvailability.ts
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Use local date formatting (not UTC) to match sampleAvailability.ts format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayOfWeek = date.getDay();

      result.push({
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }
    return result;
  }, []);

  // Get availability data
  const availabilityData = useMemo(() => {
    const data = {};
    dates.forEach(({ date }) => {
      data[date] = {};
      selectedRoomTypes.forEach(roomType => {
        const avail = cmsAvailability.getAvailability(roomType, date);
        if (avail) {
          data[date][roomType] = avail;
        }
      });
    });
    return data;
  }, [dates, selectedRoomTypes, cmsAvailability]);

  // Calculate stats - ALL based on TODAY's data for consistency
  const stats = useMemo(() => {
    // Get today's date for current availability
    const today = dates.find(d => d.isToday)?.date || dates[0]?.date;

    // Calculate TODAY's stats (not mixed with future dates)
    let totalRooms = 0;
    let todaySold = 0;
    let todayReserved = 0;
    let todayAvailable = 0;
    let todayBlocked = 0;

    // Count rooms from today's data only
    selectedRoomTypes.forEach(roomType => {
      const todayData = availabilityData[today]?.[roomType];
      if (todayData) {
        totalRooms += todayData.totalRooms;
        todaySold += todayData.sold || 0;
        todayReserved += todayData.reserved || 0;
        todayAvailable += todayData.remaining;
        todayBlocked += todayData.blocked || 0;
      }
    });

    // Calculate TODAY's occupancy rate (sold + reserved)
    const totalOccupied = todaySold + todayReserved;
    const occupancyRate = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;

    // Count restrictions/closed days across all dates (for analytics)
    let closedDays = 0;
    let restrictedDays = 0;
    let highDemandDays = 0;

    dates.forEach(({ date }) => {
      selectedRoomTypes.forEach(roomType => {
        const dayData = availabilityData[date]?.[roomType];
        if (dayData) {
          if (dayData.isClosed) closedDays++;
          if (dayData.restrictions?.CTA || dayData.restrictions?.CTD) restrictedDays++;
          // Use combined sold + reserved for high demand calculation
          const occupied = (dayData.sold || 0) + (dayData.reserved || 0);
          if (dayData.totalRooms > 0 && (occupied / dayData.totalRooms) >= 0.8) highDemandDays++;
        }
      });
    });

    return {
      totalRooms,
      totalSold: todaySold,
      totalReserved: todayReserved,
      totalOccupied,
      totalAvailable: todayAvailable,
      totalBlocked: todayBlocked,
      occupancyRate, // Today's occupancy (sold + reserved), not average
      closedDays,
      restrictedDays,
      highDemandDays
    };
  }, [dates, selectedRoomTypes, availabilityData]);

  // Today's activity - Use API data instead of context
  const todayActivityStats = useMemo(() => {
    if (cmsAvailability.todayStats) {
      return {
        arrivals: cmsAvailability.todayStats.arrivals,
        departures: cmsAvailability.todayStats.departures,
        inHouse: cmsAvailability.todayStats.in_house
      };
    }
    return { arrivals: 0, departures: 0, inHouse: stats.totalSold };
  }, [cmsAvailability.todayStats, stats.totalSold]);

  // Generate rooms data from room types for inventory display
  const rooms = useMemo(() => {
    const roomList: Array<{
      number: string;
      type: string;
      floor: number;
      status: string;
    }> = [];

    const today = dates.find(d => d.isToday)?.date || dates[0]?.date;

    cmsAvailability.roomTypes?.forEach((roomType, rtIndex) => {
      const todayData = availabilityData[today]?.[roomType.name];
      const sold = todayData?.sold || 0;
      const reserved = todayData?.reserved || 0;
      const blocked = todayData?.blocked || 0;
      const totalRooms = roomType.total_rooms || 0;

      // Generate room numbers for this room type
      for (let i = 0; i < totalRooms; i++) {
        const floor = Math.floor(rtIndex / 2) + 2; // Distribute across floors
        const roomNum = `${floor}${(rtIndex * 10 + i + 1).toString().padStart(2, '0')}`;

        // Determine room status based on availability
        let status = 'Available';
        if (i < sold) {
          status = 'Occupied';
        } else if (i < sold + reserved) {
          status = 'Reserved';
        } else if (i < sold + reserved + blocked) {
          status = 'Maintenance';
        }

        roomList.push({
          number: roomNum,
          type: roomType.name,
          floor,
          status
        });
      }
    });

    return roomList;
  }, [cmsAvailability.roomTypes, availabilityData, dates]);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(scrollToToday, 100);
    return () => clearTimeout(timer);
  }, [scrollToToday]);

// SSE Integration for real-time availability and restrictions updates
  useChannelManagerSSEEvents({
    onAvailabilityUpdated: () => {
      console.log('[CMS Availability] Refreshing availability data due to SSE event');
      cmsAvailability.fetchAvailabilityData();
      cmsAvailability.fetchRoomBlocks();
    },
    onRestrictionsUpdated: () => {
      console.log('[CMS Availability] Refreshing availability data due to restrictions update');
      cmsAvailability.fetchAvailabilityData();
    },
    refetchData: () => {
      console.log('[CMS Availability] Refetching all data due to SSE event');
      cmsAvailability.fetchAvailabilityData();
      cmsAvailability.fetchRoomBlocks();
    },
  });

  // Export availability data to CSV with timeout protection
  const handleExport = useCallback(() => {
    // Prevent multiple clicks
    if (isExporting) return;

    setIsExporting(true);
    info('Exporting availability data...');

    // Set a timeout to prevent infinite loading state
    const exportTimeout = setTimeout(() => {
      setIsExporting(false);
      showError('Export timed out. Please try again.');
    }, 30000); // 30 second timeout

    // Use setTimeout to allow UI to update before processing
    setTimeout(() => {
      try {
        // Check if we have data to export
        if (!dates.length || !selectedRoomTypes.length) {
          clearTimeout(exportTimeout);
          showError('No data available to export. Please ensure room types are selected.');
          setIsExporting(false);
          return;
        }

        // Check if availability data exists
        if (!availabilityData || Object.keys(availabilityData).length === 0) {
          clearTimeout(exportTimeout);
          showError('No availability data loaded. Please wait for data to load and try again.');
          setIsExporting(false);
          return;
        }

        // Build CSV header
        const headers = ['Date', 'Room Type', 'Total Rooms', 'Sold', 'Reserved', 'Blocked', 'Remaining', 'Status', 'Base Rate', 'Min Stay', 'Max Stay', 'CTA', 'CTD'];

        // Build CSV rows using local availabilityData
        const rows: (string | number)[][] = [];
        dates.forEach(dateObj => {
          selectedRoomTypes.forEach(roomType => {
            const avail = availabilityData[dateObj.date]?.[roomType];
            if (avail) {
              rows.push([
                dateObj.date,
                roomType,
                avail.totalRooms ?? 0,
                avail.sold ?? 0,
                avail.reserved ?? 0,
                avail.blocked ?? 0,
                avail.remaining ?? 0,
                avail.isClosed ? 'Closed' : 'Open',
                avail.baseRate ?? '',
                avail.restrictions?.minStay ?? '',
                avail.restrictions?.maxStay ?? '',
                avail.restrictions?.CTA ? 'Yes' : 'No',
                avail.restrictions?.CTD ? 'Yes' : 'No'
              ]);
            }
          });
        });

        if (rows.length === 0) {
          clearTimeout(exportTimeout);
          showError('No availability data found to export. The calendar may be empty.');
          setIsExporting(false);
          return;
        }

        // Generate CSV content
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `availability-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        clearTimeout(exportTimeout);
        success(`Availability data exported successfully (${rows.length} records)`);
      } catch (err) {
        clearTimeout(exportTimeout);
        console.error('Export failed:', err);
        showError(`Failed to export: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsExporting(false);
      }
    }, 100);
  }, [dates, selectedRoomTypes, availabilityData, info, success, showError, isExporting]);

  // Handlers
  const handleCellClick = (date, roomType) => {
    if (bulkEditMode) {
      const key = `${date}-${roomType}`;
      setBulkSelections(prev =>
        prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
      );
    } else {
      setEditTarget({ date, roomType });
      setEditPanelOpen(true);
    }
  };

  const handleSaveAvailability = (date, roomType, updates) => {
    const payload = {
      remaining: updates.remaining,
      isClosed: updates.isClosed,
      restrictions: {
        minStay: updates.minStay,
        maxStay: updates.maxStay,
        CTA: updates.CTA,
        CTD: updates.CTD
      }
    };
    if (updates.baseRate !== undefined && updates.baseRate !== null) {
      payload.baseRate = updates.baseRate;
    }
    cmsAvailability.updateAvailability(date, roomType, payload);
    success('Availability updated successfully');
    setEditPanelOpen(false);
  };

  const handleBulkAction = (action) => {
    if (bulkSelections.length === 0) {
      info('Select cells first to apply bulk action');
      return;
    }

    bulkSelections.forEach(key => {
      // BUG-010 FIX: Date is YYYY-MM-DD (10 chars), rest after the dash is room type
      // key format: "2024-01-15-Minimalist Studio" - can't split by '-' since date has dashes
      const date = key.substring(0, 10); // YYYY-MM-DD
      const roomType = key.substring(11); // Everything after "YYYY-MM-DD-"
      switch (action) {
        case 'close':
          cmsAvailability.closeRoomType(date, roomType);
          break;
        case 'open':
          cmsAvailability.openRoomType(date, roomType);
          break;
        case 'minStay2':
          cmsAvailability.updateRestrictions(date, roomType, { minStay: 2 });
          break;
        default:
          break;
      }
    });

    success(`Applied action to ${bulkSelections.length} cells`);
    setBulkSelections([]);
    setBulkEditMode(false);
  };

  const toggleRoomType = (roomType) => {
    setSelectedRoomTypes(prev =>
      prev.includes(roomType)
        ? prev.filter(r => r !== roomType)
        : [...prev, roomType]
    );
  };

  // Quick Action: Close Weekends (apply CTA to both Saturday AND Sunday) - COMMENTED OUT FOR NOW
  // const handleCloseWeekends = useCallback(async () => {
  //   setQuickActionLoading('closeWeekends');
  //   try {
  //     const weekendDates: string[] = [];
  //     dates.forEach(dateObj => {
  //       if (dateObj.isWeekend) {
  //         weekendDates.push(dateObj.date);
  //       }
  //     });
  //
  //     if (weekendDates.length === 0) {
  //       showError('No weekend dates found in the current date range');
  //       return;
  //     }
  //
  //     for (const roomType of selectedRoomTypes) {
  //       for (const date of weekendDates) {
  //         await cmsAvailability.updateRestrictions(date, roomType, { CTA: true });
  //       }
  //     }
  //
  //     await cmsAvailability.refetch();
  //     success(`Weekend arrivals blocked for ${weekendDates.length} days across ${selectedRoomTypes.length} room types`);
  //   } catch (err) {
  //     console.error('Close weekends failed:', err);
  //     showError('Failed to close weekends. Please try again.');
  //   } finally {
  //     setQuickActionLoading(null);
  //     setConfirmDialog(null);
  //   }
  // }, [dates, selectedRoomTypes, cmsAvailability, success, showError]);

  // Quick Action: Apply Weekend Rate (+15%)
  const handleApplyWeekendRate = useCallback(async () => {
    setQuickActionLoading('weekendRate');
    try {
      const weekendDates: string[] = [];
      dates.forEach(dateObj => {
        if (dateObj.isWeekend) {
          weekendDates.push(dateObj.date);
        }
      });

      if (weekendDates.length === 0) {
        showError('No weekend dates found in the current date range');
        return;
      }

      // Apply 15% rate increase for weekends
      for (const roomType of selectedRoomTypes) {
        const config = roomTypeConfig[roomType];
        if (config?.baseRate) {
          const newRate = Math.round(config.baseRate * 1.15);
          // Update rate for each weekend date
          for (const date of weekendDates) {
            await cmsAvailability.updateAvailability(date, roomType, { baseRate: newRate });
          }
        }
      }

      await cmsAvailability.refetch();
      success(`Weekend rates increased by 15% for ${weekendDates.length} days`);
    } catch (err) {
      console.error('Apply weekend rate failed:', err);
      showError('Failed to apply weekend rates. Please try again.');
    } finally {
      setQuickActionLoading(null);
      setConfirmDialog(null);
    }
  }, [dates, selectedRoomTypes, roomTypeConfig, cmsAvailability, success, showError]);

  // Quick Action: Set Minimum Stay (2 Nights)
  const handleSetMinStay = useCallback(async () => {
    setQuickActionLoading('minStay');
    try {
      // Apply min stay of 2 nights to ALL dates and room types
      for (const roomType of selectedRoomTypes) {
        for (const dateObj of dates) {
          await cmsAvailability.updateRestrictions(dateObj.date, roomType, { minStay: 2 });
        }
      }

      await cmsAvailability.refetch();
      success(`Minimum 2-night stay applied to all ${selectedRoomTypes.length} room types for ${dates.length} days`);
    } catch (err) {
      console.error('Set min stay failed:', err);
      showError('Failed to set minimum stay. Please try again.');
    } finally {
      setQuickActionLoading(null);
      setConfirmDialog(null);
    }
  }, [dates, selectedRoomTypes, cmsAvailability, success, showError]);

  // Quick Action: Stop Sell All Rooms - COMMENTED OUT FOR NOW
  // const handleStopSellAll = useCallback(async () => {
  //   setQuickActionLoading('stopSell');
  //   try {
  //     for (const roomType of selectedRoomTypes) {
  //       for (const dateObj of dates) {
  //         await cmsAvailability.closeRoomType(dateObj.date, roomType);
  //       }
  //     }
  //     await cmsAvailability.refetch();
  //     success(`Stop sell applied - all ${selectedRoomTypes.length} room types are now closed for ${dates.length} days`);
  //   } catch (err) {
  //     console.error('Stop sell failed:', err);
  //     showError('Failed to stop sell. Please try again.');
  //   } finally {
  //     setQuickActionLoading(null);
  //     setConfirmDialog(null);
  //   }
  // }, [dates, selectedRoomTypes, cmsAvailability, success, showError]);

  // Bulk Update Handler
  const handleBulkUpdate = useCallback(async () => {
    if (!bulkWizardData.selectedAction) {
      showError('Please select an action to apply');
      return;
    }
    if (!bulkWizardData.startDate || !bulkWizardData.endDate) {
      showError('Please select start and end dates');
      return;
    }
    if (selectedRoomTypes.length === 0) {
      showError('Please select at least one room type');
      return;
    }

    setIsBulkUpdating(true);
    try {
      // Generate dates in range
      const start = new Date(bulkWizardData.startDate);
      const end = new Date(bulkWizardData.endDate);
      const datesToUpdate: string[] = [];

      const current = new Date(start);
      while (current <= end) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        datesToUpdate.push(`${year}-${month}-${day}`);
        current.setDate(current.getDate() + 1);
      }

      // Apply action based on selection
      for (const roomType of selectedRoomTypes) {
        for (const date of datesToUpdate) {
          switch (bulkWizardData.selectedAction) {
            case 'close':
              await cmsAvailability.closeRoomType(date, roomType);
              break;
            case 'open':
              await cmsAvailability.openRoomType(date, roomType);
              break;
            case 'minStay':
              await cmsAvailability.updateRestrictions(date, roomType, { minStay: bulkWizardData.minStayValue });
              break;
            case 'cta':
              await cmsAvailability.updateRestrictions(date, roomType, { CTA: true });
              break;
          }
        }
      }

      await cmsAvailability.refetch();
      success(`Bulk update applied: ${bulkWizardData.selectedAction} for ${datesToUpdate.length} days across ${selectedRoomTypes.length} room types`);
      setIsBulkWizardOpen(false);
      setBulkWizardData({ startDate: '', endDate: '', selectedAction: null, minStayValue: 2 });
    } catch (err) {
      console.error('Bulk update failed:', err);
      showError('Bulk update failed. Please try again.');
    } finally {
      setIsBulkUpdating(false);
    }
  }, [bulkWizardData, selectedRoomTypes, cmsAvailability, success, showError]);

  // Quick Actions configuration
  const quickActions = [
    // Close Weekends - COMMENTED OUT FOR NOW
    // {
    //   id: 'closeWeekends',
    //   icon: Ban,
    //   title: 'Close Weekends',
    //   description: 'Block weekend check-ins (Sat & Sun)',
    //   accent: 'terra',
    //   onClick: () => setConfirmDialog({
    //     isOpen: true,
    //     title: 'Close Weekends to Arrival',
    //     message: 'This will prevent check-ins on ALL Saturdays AND Sundays for the next 30 days across all selected room types.',
    //     variant: 'warning',
    //     onConfirm: handleCloseWeekends
    //   })
    // },
    {
      id: 'weekendRate',
      icon: TrendingUp,
      title: 'Weekend +15%',
      description: 'Apply premium weekend pricing',
      accent: 'ocean',
      onClick: () => setConfirmDialog({
        isOpen: true,
        title: 'Apply Weekend Rate (+15%)',
        message: 'This will increase rates by 15% for all Saturdays and Sundays in the next 30 days.',
        variant: 'primary',
        onConfirm: handleApplyWeekendRate
      })
    },
    {
      id: 'minStay',
      icon: Clock,
      title: 'Min 2-Night',
      description: 'Set minimum stay restriction',
      accent: 'gold',
      onClick: () => setConfirmDialog({
        isOpen: true,
        title: 'Set Minimum Stay (2 Nights)',
        message: 'This will require a minimum 2-night stay for all room types across all dates.',
        variant: 'primary',
        onConfirm: handleSetMinStay
      })
    },
    // Stop Sell All - COMMENTED OUT FOR NOW
    // {
    //   id: 'stopSell',
    //   icon: AlertTriangle,
    //   title: 'Stop Sell All',
    //   description: 'Block ALL bookings immediately',
    //   accent: 'rose',
    //   onClick: () => setConfirmDialog({
    //     isOpen: true,
    //     title: 'Stop Sell All Rooms',
    //     message: 'WARNING: This will close ALL room types and prevent ANY new bookings. This is a drastic action.',
    //     variant: 'danger',
    //     onConfirm: handleStopSellAll
    //   })
    // }
  ];

  return (
    <div className={cn(
      'min-h-screen transition-colors duration-500',
      isDark ? 'bg-neutral-950' : 'bg-[#FAFAF8]'
    )}>
      {/* Subtle gradient overlay */}
      <div className={cn(
        'fixed inset-0 pointer-events-none',
        isDark
          ? 'bg-gradient-to-br from-terra-950/20 via-transparent to-ocean-950/10'
          : 'bg-gradient-to-br from-terra-50/50 via-transparent to-ocean-50/30'
      )} />

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
        {/* ============================================ */}
        {/* HEADER SECTION */}
        {/* ============================================ */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center',
                isDark ? 'bg-terra-500/20' : 'bg-terra-100'
              )}>
                <Calendar className={cn('w-4 h-4 sm:w-5 sm:h-5', isDark ? 'text-terra-400' : 'text-terra-600')} />
              </div>
              <span className={cn(
                'text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em]',
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              )}>
                Central Management System
              </span>
            </div>
            <h1 className={cn(
              'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-sans font-light tracking-tight',
              isDark ? 'text-white' : 'text-neutral-900'
            )}>
              Availability Manager
            </h1>
            <p className={cn(
              'text-sm sm:text-base lg:text-lg max-w-xl',
              isDark ? 'text-neutral-400' : 'text-neutral-500'
            )}>
              <span className="hidden sm:inline">Orchestrate inventory, restrictions, and rates with precision across all channels.</span>
              <span className="sm:hidden">Manage inventory & rates across channels.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all',
                isDark
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50 disabled:opacity-50'
              )}
            >
              <Download className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', isExporting && 'animate-pulse')} />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export'}</span>
            </button>
            <button className={cn(
              'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all',
              isDark
                ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            )}>
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button
              onClick={() => setIsBlockModalOpen(true)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all',
                isDark
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
              )}
            >
              <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Block Rooms</span>
            </button>
            <button
              onClick={() => {
                cmsAvailability.resetAvailability();
                success('Synced with all channels');
              }}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-terra-500 hover:bg-terra-600 text-white rounded-xl text-xs sm:text-sm font-medium shadow-lg shadow-terra-500/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Sync</span>
              <span className="hidden sm:inline">Channels</span>
            </button>
          </div>
        </header>

        {/* ============================================ */}
        {/* LOADING / ERROR STATES */}
        {/* ============================================ */}
        {cmsAvailability.isLoading && (
          <div className={cn(
            'p-8 rounded-xl text-center',
            isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-neutral-200'
          )}>
            <RefreshCw className={cn('w-8 h-8 mx-auto mb-4 animate-spin', isDark ? 'text-terra-400' : 'text-terra-600')} />
            <p className={cn('text-lg font-medium', isDark ? 'text-neutral-300' : 'text-neutral-700')}>
              Loading availability data from database...
            </p>
          </div>
        )}

        {cmsAvailability.error && !cmsAvailability.isLoading && (
          <div className={cn(
            'p-8 rounded-xl border-2',
            isDark ? 'bg-rose-950/30 border-rose-800 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
          )}>
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold mb-2">Database Connection Error</h3>
                <p className="mb-4">{cmsAvailability.error}</p>
                <button
                  onClick={() => cmsAvailability.refetch()}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium transition-all',
                    isDark ? 'bg-rose-800 hover:bg-rose-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
                  )}
                >
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* KPI CARDS */}
        {/* ============================================ */}
        {!cmsAvailability.isLoading && !cmsAvailability.error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <KPICard
            title="Occupancy Rate"
            value={stats.occupancyRate}
            suffix="%"
            subtitle="Today's occupancy"
            icon={Percent}
            trend={{ value: stats.occupancyRate >= 80 ? 'High' : stats.occupancyRate >= 60 ? 'Medium' : 'Low', isPositive: stats.occupancyRate >= 60 }}
            accentColor="terra"
          />
          <KPICard
            title="Available Rooms"
            value={stats.totalAvailable}
            subtitle={`of ${stats.totalRooms} total`}
            icon={Home}
            accentColor="sage"
          />
          <KPICard
            title="Sold Out Days"
            value={stats.closedDays}
            subtitle="Next 30 days"
            icon={CalendarX}
            accentColor={stats.closedDays > 10 ? 'rose' : 'gold'}
          />
          <KPICard
            title="High Demand"
            value={stats.highDemandDays}
            subtitle="Days at 80%+ (30d)"
            icon={TrendingUp}
            accentColor="ocean"
          />
          <KPICard
            title="Restrictions"
            value={stats.restrictedDays}
            subtitle="Active CTA/CTD (30d)"
            icon={Lock}
            accentColor="gold"
          />
        </div>
        )}

        {/* ============================================ */}
        {/* QUICK STATS STRIP */}
        {/* ============================================ */}
        {!cmsAvailability.isLoading && !cmsAvailability.error && (
        <QuickStatsStrip stats={stats} todayStats={todayActivityStats} isDark={isDark} />
        )}

        {/* ============================================ */}
        {/* TABS & CONTROLS */}
        {/* ============================================ */}
        {!cmsAvailability.isLoading && !cmsAvailability.error && (
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <EditorialTabs activeTab={activeTab} onTabChange={setActiveTab} isDark={isDark} />

            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
              <div className="hidden md:block">
                <RoomTypeFilterPills
                  selectedRoomTypes={selectedRoomTypes}
                  onToggle={toggleRoomType}
                  isDark={isDark}
                  roomTypeConfig={roomTypeConfig}
                />
              </div>

              <button
                onClick={() => setShowPickup(!showPickup)}
                className={cn(
                  'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap',
                  showPickup
                    ? isDark ? 'bg-terra-500/20 text-terra-400' : 'bg-terra-100 text-terra-700'
                    : isDark ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700' : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-50'
                )}
              >
                <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Pickup
              </button>
            </div>
          </div>

          {/* Mobile Room Type Filter Pills */}
          <div className="md:hidden">
            <RoomTypeFilterPills
              selectedRoomTypes={selectedRoomTypes}
              onToggle={toggleRoomType}
              isDark={isDark}
              roomTypeConfig={roomTypeConfig}
            />
          </div>
        </div>
        )}

        {/* ============================================ */}
        {/* MAIN CONTENT AREA */}
        {/* ============================================ */}
        {!cmsAvailability.isLoading && !cmsAvailability.error && activeTab === 'calendar' && selectedRoomTypes.length === 0 && (
          <div className={cn(
            'p-12 rounded-2xl text-center',
            isDark ? 'bg-neutral-900/80 border border-neutral-800' : 'bg-white border border-neutral-200'
          )}>
            <div className={cn(
              'w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center',
              isDark ? 'bg-neutral-800' : 'bg-neutral-100'
            )}>
              <Bed className={cn('w-8 h-8', isDark ? 'text-neutral-600' : 'text-neutral-400')} />
            </div>
            <h3 className={cn('text-xl font-semibold mb-2', isDark ? 'text-white' : 'text-neutral-900')}>
              No Room Types Found
            </h3>
            <p className={cn('text-sm mb-6 max-w-md mx-auto', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
              The availability calendar requires room types to be set up in your database.
              Please add room types through the Rooms management page first.
            </p>
            <button
              onClick={() => cmsAvailability.refetch()}
              className={cn(
                'px-6 py-3 rounded-xl font-medium transition-all inline-flex items-center gap-2',
                isDark ? 'bg-terra-500/20 text-terra-400 hover:bg-terra-500/30' : 'bg-terra-100 text-terra-700 hover:bg-terra-200'
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        )}

        {!cmsAvailability.isLoading && !cmsAvailability.error && activeTab === 'calendar' && selectedRoomTypes.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Calendar Grid - 3 columns */}
            <div className="xl:col-span-3 space-y-4">
              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setBulkEditMode(!bulkEditMode);
                      setBulkSelections([]);
                    }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                      bulkEditMode
                        ? isDark ? 'bg-terra-500/20 text-terra-400 border border-terra-500/30' : 'bg-terra-100 text-terra-700 border border-terra-200'
                        : isDark ? 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
                    )}
                  >
                    {bulkEditMode ? <X className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {bulkEditMode ? 'Cancel' : 'Bulk Edit'}
                  </button>

                  {bulkEditMode && bulkSelections.length > 0 && (
                    <>
                      <span className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-bold',
                        isDark ? 'bg-terra-500/20 text-terra-400' : 'bg-terra-100 text-terra-700'
                      )}>
                        {bulkSelections.length} selected
                      </span>
                      <button
                        onClick={() => handleBulkAction('close')}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                          isDark ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        )}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Close
                      </button>
                      <button
                        onClick={() => handleBulkAction('open')}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                          isDark ? 'bg-sage-500/10 text-sage-400 hover:bg-sage-500/20' : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                        )}
                      >
                        <Unlock className="w-3.5 h-3.5" />
                        Open
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
                    )}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollToToday}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      isDark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                    )}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
                    )}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className={cn(
                'rounded-2xl overflow-hidden transition-all duration-300',
                isDark ? 'bg-neutral-900/80 border border-neutral-800' : 'bg-white border border-neutral-200/60',
                bulkEditMode && 'ring-2 ring-terra-500 ring-offset-4'
              )}>
                <div className="flex">
                  {/* Room Type Labels */}
                  <div className={cn(
                    'flex-shrink-0 border-r',
                    isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                  )}>
                    <div className={cn(
                      'h-20 px-4 flex items-center justify-center border-b',
                      isDark ? 'border-neutral-800' : 'border-neutral-200'
                    )}>
                      <Layers className={cn('w-5 h-5', isDark ? 'text-neutral-600' : 'text-neutral-300')} />
                    </div>

                    {selectedRoomTypes.map(roomType => {
                      const config = roomTypeConfig[roomType] || {};
                      return (
                        <div
                          key={roomType}
                          className={cn(
                            'h-[130px] px-4 flex items-center gap-3 border-b',
                            isDark ? 'border-neutral-800' : 'border-neutral-100'
                          )}
                        >
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center',
                            isDark ? 'bg-neutral-800' : 'bg-neutral-100'
                          )}>
                            <config.icon className={cn('w-5 h-5', isDark ? 'text-neutral-500' : 'text-neutral-400')} />
                          </div>
                          <div>
                            <p className={cn(
                              'text-sm font-semibold whitespace-nowrap',
                              isDark ? 'text-white' : 'text-neutral-900'
                            )}>
                              {config.code}
                            </p>
                            <p className={cn(
                              'text-xs whitespace-nowrap',
                              isDark ? 'text-neutral-500' : 'text-neutral-400'
                            )}>
                              {config.totalRooms} rooms
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar Scroll Area */}
                  <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-auto"
                  >
                    <div className="inline-flex min-w-full">
                      {dates.map(dateInfo => (
                        <div
                          key={dateInfo.date}
                          className={cn(
                            'flex-shrink-0 w-[130px] border-r',
                            isDark ? 'border-neutral-800' : 'border-neutral-100'
                          )}
                        >
                          {/* Date Header */}
                          <div className={cn(
                            'h-20 flex flex-col items-center justify-center border-b transition-all duration-200',
                            dateInfo.isToday
                              ? 'bg-gradient-to-b from-terra-500 to-terra-600 text-white'
                              : dateInfo.isWeekend
                                ? isDark ? 'bg-gold-500/5' : 'bg-gold-50/50'
                                : isDark ? 'bg-neutral-900' : 'bg-neutral-50',
                            isDark ? 'border-neutral-800' : 'border-neutral-200'
                          )}>
                            <span className={cn(
                              'text-[10px] font-semibold uppercase tracking-wider',
                              dateInfo.isToday ? 'text-white/80' :
                              dateInfo.isWeekend ? (isDark ? 'text-gold-400' : 'text-gold-700') :
                              isDark ? 'text-neutral-500' : 'text-neutral-400'
                            )}>
                              {dateInfo.dayOfWeek}
                            </span>
                            <span className={cn(
                              'text-2xl font-bold',
                              dateInfo.isToday ? 'text-white' :
                              dateInfo.isWeekend ? (isDark ? 'text-gold-300' : 'text-gold-800') :
                              isDark ? 'text-white' : 'text-neutral-900'
                            )}>
                              {dateInfo.dayOfMonth}
                            </span>
                            <span className={cn(
                              'text-[9px] font-medium',
                              dateInfo.isToday ? 'text-white/70' :
                              isDark ? 'text-neutral-500' : 'text-neutral-400'
                            )}>
                              {dateInfo.month}
                            </span>
                          </div>

                          {/* Room cells */}
                          {selectedRoomTypes.map(roomType => {
                            const dayData = availabilityData[dateInfo.date]?.[roomType];
                            const isSelected = bulkSelections.includes(`${dateInfo.date}-${roomType}`);

                            return (
                              <div
                                key={`${dateInfo.date}-${roomType}`}
                                className={cn(
                                  'h-[130px] p-2 border-b',
                                  isDark ? 'border-neutral-800' : 'border-neutral-100'
                                )}
                              >
                                <CalendarDayCell
                                  dayData={dayData}
                                  isSelected={isSelected}
                                  isToday={dateInfo.isToday}
                                  onClick={() => handleCellClick(dateInfo.date, roomType)}
                                  showPickup={showPickup}
                                  isDark={isDark}
                                />
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className={cn(
                  'p-4 border-t flex items-center gap-6 flex-wrap',
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                )}>
                  <span className={cn(
                    'text-xs font-semibold uppercase tracking-wider',
                    isDark ? 'text-neutral-600' : 'text-neutral-400'
                  )}>
                    Legend
                  </span>
                  <div className="flex items-center gap-6 text-xs">
                    {[
                      { color: 'bg-ocean-500', label: 'High Avail' },
                      { color: 'bg-sage-500', label: 'Good' },
                      { color: 'bg-gold-500', label: 'Low' },
                      { color: 'bg-rose-500', label: 'Sold Out' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <span className={cn('w-3 h-3 rounded', item.color)} />
                        <span className={isDark ? 'text-neutral-400' : 'text-neutral-500'}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Widgets - 1 column */}
            <div className="space-y-6">
              {/* Quick Actions Panel */}
              <div className={cn(
                'rounded-2xl p-5 transition-all duration-300',
                isDark
                  ? 'bg-neutral-900/80 border border-neutral-800'
                  : 'bg-white border border-neutral-200/60'
              )}>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className={cn('w-4 h-4', isDark ? 'text-terra-400' : 'text-terra-600')} />
                  <span className={cn(
                    'text-xs font-semibold uppercase tracking-wider',
                    isDark ? 'text-neutral-400' : 'text-neutral-500'
                  )}>
                    Quick Actions
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={action.onClick}
                      disabled={quickActionLoading !== null}
                      className={cn(
                        'p-3 rounded-xl text-left transition-all duration-200',
                        isDark
                          ? 'bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700/50'
                          : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200',
                        quickActionLoading === action.id && 'opacity-50 cursor-wait',
                        quickActionLoading !== null && quickActionLoading !== action.id && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
                        action.accent === 'terra' && (isDark ? 'bg-terra-500/20' : 'bg-terra-100'),
                        action.accent === 'ocean' && (isDark ? 'bg-ocean-500/20' : 'bg-ocean-100'),
                        action.accent === 'gold' && (isDark ? 'bg-gold-500/20' : 'bg-gold-100'),
                        action.accent === 'rose' && (isDark ? 'bg-rose-500/20' : 'bg-rose-100')
                      )}>
                        {quickActionLoading === action.id ? (
                          <RefreshCw className={cn(
                            'w-4 h-4 animate-spin',
                            action.accent === 'terra' && 'text-terra-500',
                            action.accent === 'ocean' && 'text-ocean-500',
                            action.accent === 'gold' && 'text-gold-500',
                            action.accent === 'rose' && 'text-rose-500'
                          )} />
                        ) : (
                          <action.icon className={cn(
                            'w-4 h-4',
                            action.accent === 'terra' && 'text-terra-500',
                            action.accent === 'ocean' && 'text-ocean-500',
                            action.accent === 'gold' && 'text-gold-500',
                            action.accent === 'rose' && 'text-rose-500'
                          )} />
                        )}
                      </div>
                      <p className={cn(
                        'text-xs font-semibold',
                        isDark ? 'text-white' : 'text-neutral-900'
                      )}>
                        {action.title}
                      </p>
                      <p className={cn(
                        'text-[10px]',
                        isDark ? 'text-neutral-500' : 'text-neutral-400'
                      )}>
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <OccupancyHeatmap
                dates={dates}
                availabilityData={availabilityData}
                selectedRoomTypes={selectedRoomTypes}
                isDark={isDark}
              />
              {/* Room Blocks List - View/Edit/Unblock */}
              <RoomBlocksListPanel
                blocks={cmsAvailability.roomBlocks}
                isLoading={cmsAvailability.isLoading}
                onEdit={(block) => {
                  setBlockToEdit(block);
                  setIsBlockModalOpen(true);
                }}
                onDelete={async (blockId) => {
                  try {
                    await cmsAvailability.removeRoomBlock(blockId);
                    success('Room block removed - rooms are now available');
                  } catch (error) {
                    console.error('Error removing block:', error);
                  }
                }}
                onRefresh={cmsAvailability.fetchRoomBlocks}
              />
              <ChannelSyncStatus isDark={isDark} />
              <AIInsightsPanel
                insights={cmsAvailability.aiInsights}
                isLoading={cmsAvailability.isLoading}
                onRefresh={cmsAvailability.refreshAIInsights}
              />
            </div>
          </div>
        )}

        {!cmsAvailability.isLoading && !cmsAvailability.error && activeTab === 'inventory' && (
          <RoomInventoryGrid rooms={rooms} isDark={isDark} />
        )}

        {!cmsAvailability.isLoading && !cmsAvailability.error && activeTab === 'rates' && (
          <div className={cn(
            'rounded-2xl p-12 text-center',
            isDark ? 'bg-neutral-900/80 border border-neutral-800' : 'bg-white border border-neutral-200/60'
          )}>
            <DollarSign className={cn('w-12 h-12 mx-auto mb-4', isDark ? 'text-neutral-700' : 'text-neutral-300')} />
            <h3 className={cn('text-xl font-sans font-semibold mb-2', isDark ? 'text-white' : 'text-neutral-900')}>
              Rate Manager Coming Soon
            </h3>
            <p className={cn('text-sm', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
              Dynamic pricing and rate management features are under development.
            </p>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {bulkEditMode && bulkSelections.length > 0 && (
        <div className={cn(
          'fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50',
          'rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4',
          'w-[calc(100%-2rem)] sm:w-auto sm:min-w-[500px] max-w-[calc(100%-2rem)] sm:max-w-none',
          'animate-in slide-in-from-bottom-4 duration-300',
          isDark
            ? 'bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 shadow-2xl'
            : 'bg-white/95 backdrop-blur-xl border border-neutral-200 shadow-2xl'
        )}>
          <div className="flex-1">
            <p className={cn('text-xs sm:text-sm font-semibold', isDark ? 'text-white' : 'text-neutral-900')}>
              Bulk Edit Mode
            </p>
            <p className={cn('text-[10px] sm:text-xs', isDark ? 'text-neutral-500' : 'text-neutral-500')}>
              {bulkSelections.length} cell{bulkSelections.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('close')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors"
            >
              <Ban className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Close
            </button>
            <button
              onClick={() => handleBulkAction('open')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-sage-500 hover:bg-sage-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors"
            >
              <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Open
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-terra-500 hover:bg-terra-600 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Edit Rules</span>
              <span className="sm:hidden">Rules</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Panel */}
      <AvailabilityEditPanel
        isOpen={editPanelOpen}
        onClose={() => setEditPanelOpen(false)}
        selectedDate={editTarget.date}
        selectedRoomType={editTarget.roomType}
        dayData={editTarget.date && editTarget.roomType
          ? availabilityData[editTarget.date]?.[editTarget.roomType]
          : null
        }
        onSave={handleSaveAvailability}
        isDark={isDark}
      />

      {/* Room Block Modal */}
      <RoomBlockModal
        isOpen={isBlockModalOpen}
        onClose={() => {
          setIsBlockModalOpen(false);
          setBlockToEdit(null);
        }}
        onSubmit={async (blockData) => {
          try {
            if (blockToEdit) {
              await cmsAvailability.editRoomBlock(blockToEdit.id, blockData);
              success('Room block updated successfully');
            } else {
              await cmsAvailability.addRoomBlock(blockData);
              success('Room block created successfully');
            }
            setIsBlockModalOpen(false);
            setBlockToEdit(null);
          } catch (error) {
            console.error('Error saving room block:', error);
          }
        }}
        mode={blockToEdit ? 'edit' : 'create'}
        existingBlock={blockToEdit}
        roomTypes={cmsAvailability.roomTypes?.map(rt => ({ id: rt.id, name: rt.name })) || []}
      />

      {/* Confirmation Dialog for Quick Actions */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDialog(null)}
          />
          <div className={cn(
            'relative z-10 w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200',
            isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'
          )}>
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
              confirmDialog.variant === 'danger' && (isDark ? 'bg-rose-500/20' : 'bg-rose-100'),
              confirmDialog.variant === 'warning' && (isDark ? 'bg-gold-500/20' : 'bg-gold-100'),
              confirmDialog.variant === 'primary' && (isDark ? 'bg-ocean-500/20' : 'bg-ocean-100')
            )}>
              <AlertTriangle className={cn(
                'w-6 h-6',
                confirmDialog.variant === 'danger' && 'text-rose-500',
                confirmDialog.variant === 'warning' && 'text-gold-500',
                confirmDialog.variant === 'primary' && 'text-ocean-500'
              )} />
            </div>
            <h3 className={cn(
              'text-lg font-semibold mb-2',
              isDark ? 'text-white' : 'text-neutral-900'
            )}>
              {confirmDialog.title}
            </h3>
            <p className={cn(
              'text-sm mb-6',
              isDark ? 'text-neutral-400' : 'text-neutral-600'
            )}>
              {confirmDialog.message}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  isDark
                    ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                )}
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                disabled={quickActionLoading !== null}
                className={cn(
                  'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-colors flex items-center justify-center gap-2',
                  confirmDialog.variant === 'danger' && 'bg-rose-500 hover:bg-rose-600',
                  confirmDialog.variant === 'warning' && 'bg-gold-500 hover:bg-gold-600',
                  confirmDialog.variant === 'primary' && 'bg-ocean-500 hover:bg-ocean-600',
                  quickActionLoading !== null && 'opacity-50 cursor-not-allowed'
                )}
              >
                {quickActionLoading !== null ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Wizard Modal */}
      <Drawer
        isOpen={isBulkWizardOpen}
        onClose={() => {
          setIsBulkWizardOpen(false);
          setBulkWizardData({ startDate: '', endDate: '', selectedAction: null, minStayValue: 2 });
        }}
        title="Bulk Update Wizard"
        size="lg"
      >
        <div className="p-6 space-y-6">
          <p className={cn(
            'text-sm',
            isDark ? 'text-neutral-400' : 'text-neutral-600'
          )}>
            Use bulk update to modify availability, rates, or restrictions for multiple dates and room types at once.
          </p>

          {/* Date Range Selection */}
          <div className="space-y-3">
            <label className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={cn('text-xs mb-1 block', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={bulkWizardData.startDate || dates[0]?.date || ''}
                  onChange={(e) => setBulkWizardData(prev => ({ ...prev, startDate: e.target.value }))}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm',
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900',
                    'border focus:ring-2 focus:ring-terra-500/50 focus:border-terra-500'
                  )}
                />
              </div>
              <div>
                <label className={cn('text-xs mb-1 block', isDark ? 'text-neutral-400' : 'text-neutral-500')}>
                  End Date
                </label>
                <input
                  type="date"
                  value={bulkWizardData.endDate || dates[dates.length - 1]?.date || ''}
                  onChange={(e) => setBulkWizardData(prev => ({ ...prev, endDate: e.target.value }))}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm',
                    isDark
                      ? 'bg-neutral-800 border-neutral-700 text-white'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900',
                    'border focus:ring-2 focus:ring-terra-500/50 focus:border-terra-500'
                  )}
                />
              </div>
            </div>
          </div>

          {/* Room Types Selection */}
          <div className="space-y-3">
            <label className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Room Types ({selectedRoomTypes.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(roomTypeConfig).map(roomType => (
                <button
                  key={roomType}
                  onClick={() => toggleRoomType(roomType)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    selectedRoomTypes.includes(roomType)
                      ? isDark ? 'bg-terra-500/20 text-terra-400 border border-terra-500/30' : 'bg-terra-100 text-terra-700 border border-terra-200'
                      : isDark ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                  )}
                >
                  {roomTypeConfig[roomType]?.code || roomType}
                </button>
              ))}
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <label className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              isDark ? 'text-neutral-500' : 'text-neutral-400'
            )}>
              Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'close' as const, label: 'Close Rooms', icon: Ban, color: 'rose' },
                { id: 'open' as const, label: 'Open Rooms', icon: Unlock, color: 'sage' },
                { id: 'minStay' as const, label: 'Set Min Stay', icon: Clock, color: 'gold' },
                { id: 'cta' as const, label: 'Close to Arrival', icon: LogIn, color: 'ocean' },
              ].map(action => (
                <button
                  key={action.id}
                  onClick={() => setBulkWizardData(prev => ({ ...prev, selectedAction: action.id }))}
                  className={cn(
                    'p-4 rounded-xl text-left transition-all duration-200 border',
                    bulkWizardData.selectedAction === action.id
                      ? isDark
                        ? 'bg-terra-500/20 border-terra-500/50 ring-2 ring-terra-500/30'
                        : 'bg-terra-50 border-terra-300 ring-2 ring-terra-200'
                      : isDark
                        ? 'bg-neutral-800/50 hover:bg-neutral-800 border-neutral-700/50'
                        : 'bg-white hover:bg-neutral-50 border-neutral-200'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
                    action.color === 'rose' && (isDark ? 'bg-rose-500/20' : 'bg-rose-100'),
                    action.color === 'sage' && (isDark ? 'bg-sage-500/20' : 'bg-sage-100'),
                    action.color === 'gold' && (isDark ? 'bg-gold-500/20' : 'bg-gold-100'),
                    action.color === 'ocean' && (isDark ? 'bg-ocean-500/20' : 'bg-ocean-100')
                  )}>
                    <action.icon className={cn(
                      'w-4 h-4',
                      action.color === 'rose' && 'text-rose-500',
                      action.color === 'sage' && 'text-sage-500',
                      action.color === 'gold' && 'text-gold-500',
                      action.color === 'ocean' && 'text-ocean-500'
                    )} />
                  </div>
                  <p className={cn(
                    'text-sm font-semibold',
                    isDark ? 'text-white' : 'text-neutral-900'
                  )}>
                    {action.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Min Stay Value Input (only shown when minStay action selected) */}
          {bulkWizardData.selectedAction === 'minStay' && (
            <div className="space-y-3">
              <label className={cn(
                'text-xs font-semibold uppercase tracking-wider',
                isDark ? 'text-neutral-500' : 'text-neutral-400'
              )}>
                Minimum Nights
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={bulkWizardData.minStayValue}
                onChange={(e) => setBulkWizardData(prev => ({ ...prev, minStayValue: parseInt(e.target.value) || 2 }))}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm',
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-900',
                  'border focus:ring-2 focus:ring-terra-500/50 focus:border-terra-500'
                )}
              />
            </div>
          )}

          {/* Apply Button */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleBulkUpdate}
              disabled={isBulkUpdating || !bulkWizardData.selectedAction}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200',
                'bg-terra-500 text-white hover:bg-terra-600',
                (isBulkUpdating || !bulkWizardData.selectedAction) && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isBulkUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Apply Bulk Update
                </>
              )}
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
