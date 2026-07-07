import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { dashboardService } from '@/api/services/dashboard.service';
import toast from 'react-hot-toast';
import { BookingDetailsPanel } from '@/components/booking/BookingDetailsPanel';

export function OverviewTab() {
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [stats, setStats] = useState({
    total_bookings: 0,
    nights_stayed: 0,
    loyalty_points: 0,
    member_since: null as string | null,
    upcoming_booking: null as any,
    recent_activity: [] as Array<{ date: string; action: string; details: string }>,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('[OverviewTab] Fetching dashboard data...');
        const data = await dashboardService.getGuestDashboard();
        console.log('[OverviewTab] Received data:', data);

        if (data) {
          setStats({
            total_bookings: data.total_bookings ?? 0,
            nights_stayed: data.nights_stayed ?? 0,
            loyalty_points: data.loyalty_points ?? 0,
            member_since: data.member_since ?? null,
            upcoming_booking: data.upcoming_booking ?? null,
            recent_activity: data.recent_activity ?? [],
          });
          console.log('[OverviewTab] Stats set:', {
            total_bookings: data.total_bookings,
            nights_stayed: data.nights_stayed,
            loyalty_points: data.loyalty_points,
          });
        }
      } catch (error: any) {
        console.error('[OverviewTab] Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
        // Set default values on error
        setStats({
          total_bookings: 0,
          nights_stayed: 0,
          loyalty_points: 0,
          member_since: null,
          upcoming_booking: null,
          recent_activity: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.total_bookings.toString(),
      description: 'All time',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Nights Stayed',
      value: stats.nights_stayed.toString(),
      description: 'Lifetime',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Loyalty Points',
      value: stats.loyalty_points.toLocaleString(),
      description: 'Redeem for experiences',
      icon: Award,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Member Since',
      value: stats.member_since ? new Date(stats.member_since).getFullYear().toString() : 'N/A',
      description: 'Joined the club',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  const handleViewDetails = () => {
    if (stats.upcoming_booking) {
      setSelectedBookingId(stats.upcoming_booking.id);
      setIsPanelOpen(true);
    }
  };

  const handleModifyBooking = (bookingId: string) => {
    window.location.href = `/booking?bookingId=${bookingId}&modify=true`;
  };

  const handleCancelBooking = async (_bookingId: string) => {
    // Refresh stats after cancel
    try {
      const data = await dashboardService.getGuestDashboard();
      setStats({
        total_bookings: data?.total_bookings || 0,
        nights_stayed: data?.nights_stayed || 0,
        loyalty_points: data?.loyalty_points || 0,
        member_since: data?.member_since || null,
        upcoming_booking: data?.upcoming_booking || null,
        recent_activity: data?.recent_activity || [],
      });
    } catch (error) {
      console.error('Failed to refresh dashboard data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-neutral-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-neutral-200 rounded-xl p-6 bg-white hover:border-neutral-300 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
              <div className="text-sm font-medium text-neutral-900 mb-1">{stat.label}</div>
              <div className="text-xs text-neutral-500">{stat.description}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Booking */}
        {stats.upcoming_booking ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border border-neutral-200 rounded-xl p-6 bg-white"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">Upcoming Booking</h3>
                <p className="text-sm text-neutral-500">Confirmed</p>
              </div>
              <span className="text-xs font-medium text-neutral-500 uppercase">
                {stats.upcoming_booking.status}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-500">Booking Number</span>
                <span className="text-sm font-medium text-neutral-900">{stats.upcoming_booking.bookingNumber}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-500">Room Type</span>
                <span className="text-sm font-medium text-neutral-900">{stats.upcoming_booking.roomType}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-500">Check-in</span>
                <span className="text-sm font-medium text-neutral-900">
                  {format(new Date(stats.upcoming_booking.checkIn), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-neutral-100">
                <span className="text-sm text-neutral-500">Check-out</span>
                <span className="text-sm font-medium text-neutral-900">
                  {format(new Date(stats.upcoming_booking.checkOut), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm text-neutral-500">Guests</span>
                <span className="text-sm font-medium text-neutral-900">
                  {stats.upcoming_booking.guests} guests · {stats.upcoming_booking.nights} nights
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleViewDetails}
                className="flex-1 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                View Details
              </button>
              <button 
                onClick={() => stats.upcoming_booking && handleModifyBooking(stats.upcoming_booking.id)}
                className="flex-1 border border-neutral-300 text-neutral-900 px-4 py-2.5 rounded-lg text-sm font-medium hover:border-neutral-400 transition-colors"
              >
                Modify Booking
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="border border-neutral-200 rounded-xl p-6 bg-white"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">Upcoming Booking</h3>
            <p className="text-sm text-neutral-500">No upcoming bookings</p>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border border-neutral-200 rounded-xl p-6 bg-white"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Recent Activity</h3>

          <div className="space-y-4">
            {stats.recent_activity.length > 0 ? (
              stats.recent_activity.map((activity, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-neutral-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 mb-1">{activity.action}</p>
                    <p className="text-sm text-neutral-500 mb-1">{activity.details}</p>
                    <p className="text-xs text-neutral-400">
                      {format(new Date(activity.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-500">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Booking Details Panel */}
      <BookingDetailsPanel
        bookingId={selectedBookingId}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedBookingId(null);
        }}
        onModify={handleModifyBooking}
        onCancel={handleCancelBooking}
      />

    </div>
  );
}