import { useMemo } from 'react';
import {
  PieChart, BarChart3, TrendingUp, Globe, Home,
  Hotel, CalendarCheck, Percent, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

/**
 * Booking Mini-Widgets
 * Channel distribution, occupancy snapshot, and booking pace widgets
 */
export default function BookingWidgets({ bookings = [], className = '' }) {
  // Calculate channel distribution
  const channelData = useMemo(() => {
    const sources = {};
    bookings.forEach(b => {
      sources[b.source] = (sources[b.source] || 0) + 1;
    });

    const total = bookings.length || 1;
    const channelColors = {
      'Website': { bg: 'bg-terra-500', text: 'text-terra-700', light: 'bg-terra-100' },
      'Booking.com': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
      'Expedia': { bg: 'bg-gold-500', text: 'text-gold-700', light: 'bg-gold-100' },
      'Walk-in': { bg: 'bg-neutral-500', text: 'text-neutral-700', light: 'bg-neutral-200' }
    };

    return Object.entries(sources)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
        ...channelColors[name] || channelColors['Walk-in']
      }))
      .sort((a, b) => b.count - a.count);
  }, [bookings]);

  // Calculate occupancy metrics
  const occupancyData = useMemo(() => {
    // Use case-insensitive comparison (API returns lowercase)
    const checkedIn = bookings.filter(b => b.status?.toLowerCase() === 'checked-in').length;
    const confirmed = bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length;
    const totalRooms = 50; // Simulated total rooms

    return {
      occupancyRate: Math.round(((checkedIn + confirmed) / totalRooms) * 100),
      roomsOccupied: checkedIn,
      roomsReserved: confirmed,
      roomsAvailable: totalRooms - checkedIn - confirmed,
      totalRooms
    };
  }, [bookings]);

  // Calculate booking pace
  const paceData = useMemo(() => {
    const today = new Date();
    const last7Days = bookings.filter(b => {
      const bookedDate = new Date(b.bookedOn);
      const diffTime = today - bookedDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    const last30Days = bookings.filter(b => {
      const bookedDate = new Date(b.bookedOn);
      const diffTime = today - bookedDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }).length;

    return {
      last7Days,
      last30Days,
      dailyAvg: Math.round(last30Days / 30 * 10) / 10,
      trend: '+18%',
      trendUp: true
    };
  }, [bookings]);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {/* Channel Distribution Widget */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ocean-100 flex items-center justify-center">
              <Globe className="w-4 h-4 text-ocean-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Channel Mix</h3>
          </div>
          <span className="text-xs text-neutral-500">{bookings.length} bookings</span>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          {channelData.slice(0, 4).map((channel) => (
            <div key={channel.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-neutral-700">{channel.name}</span>
                <span className="text-xs font-bold text-neutral-900">{channel.percentage}%</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${channel.bg} rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${channel.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-neutral-100">
          {channelData.slice(0, 4).map((channel) => (
            <div key={channel.name} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${channel.bg}`} />
              <span className="text-[10px] text-neutral-500">{channel.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Occupancy Snapshot Widget */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
              <Hotel className="w-4 h-4 text-sage-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Occupancy</h3>
          </div>
          <div className="flex items-center gap-1 text-sage-600">
            <Percent className="w-3.5 h-3.5" />
            <span className="text-lg font-bold">{occupancyData.occupancyRate}</span>
          </div>
        </div>

        {/* Circular Progress Indicator */}
        <div className="relative flex items-center justify-center mb-4">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#f5f5f4"
              strokeWidth="12"
            />
            {/* Occupied */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#4E5840"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(occupancyData.roomsOccupied / occupancyData.totalRooms) * 264} 264`}
              className="transition-all duration-700 ease-out"
            />
            {/* Reserved */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#5C9BA4"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(occupancyData.roomsReserved / occupancyData.totalRooms) * 264} 264`}
              strokeDashoffset={-((occupancyData.roomsOccupied / occupancyData.totalRooms) * 264)}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-neutral-900">{occupancyData.totalRooms - occupancyData.roomsAvailable}</span>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">of {occupancyData.totalRooms}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-sage-50 rounded-lg">
            <p className="text-lg font-bold text-sage-700">{occupancyData.roomsOccupied}</p>
            <p className="text-[10px] text-sage-600 uppercase">In-House</p>
          </div>
          <div className="p-2 bg-ocean-50 rounded-lg">
            <p className="text-lg font-bold text-ocean-700">{occupancyData.roomsReserved}</p>
            <p className="text-[10px] text-ocean-600 uppercase">Reserved</p>
          </div>
          <div className="p-2 bg-neutral-100 rounded-lg">
            <p className="text-lg font-bold text-neutral-700">{occupancyData.roomsAvailable}</p>
            <p className="text-[10px] text-neutral-600 uppercase">Available</p>
          </div>
        </div>
      </div>

      {/* Booking Pace Widget */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-terra-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-terra-600" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900">Booking Pace</h3>
          </div>
          <span className={`
            inline-flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-semibold
            ${paceData.trendUp ? 'bg-sage-50 text-sage-700' : 'bg-rose-50 text-rose-700'}
          `}>
            {paceData.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {paceData.trend}
          </span>
        </div>

        {/* Pace Metrics */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-neutral-900">{paceData.last7Days}</p>
              <p className="text-xs text-neutral-500 mt-1">Last 7 days</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-neutral-700">{paceData.last30Days}</p>
              <p className="text-xs text-neutral-500">Last 30 days</p>
            </div>
          </div>

          {/* Mini Bar Chart */}
          <div className="flex items-end gap-1 h-16">
            {[65, 45, 80, 55, 70, 90, 75].map((height, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all duration-300 ${
                  i === 6 ? 'bg-terra-500' : 'bg-terra-200'
                }`}
                style={{
                  height: `${height}%`,
                  transitionDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>

          {/* Daily Labels */}
          <div className="flex justify-between text-[10px] text-neutral-400">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <span key={i} className={i === 6 ? 'text-terra-600 font-semibold' : ''}>
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Daily Average */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Daily average</span>
          <span className="text-sm font-bold text-neutral-900">{paceData.dailyAvg} bookings</span>
        </div>
      </div>
    </div>
  );
}
