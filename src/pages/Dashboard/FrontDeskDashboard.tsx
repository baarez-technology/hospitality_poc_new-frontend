import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Users, LogIn, LogOut, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardsService } from '@/api/services/dashboards.service';
import { frontdeskService } from '@/api/services/frontdesk.service';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function FrontDeskDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['frontdesk-dashboard', selectedDate],
    queryFn: () => dashboardsService.getFrontDeskDashboard(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch arrivals and departures
  const { data: arrivals, refetch: refetchArrivals } = useQuery({
    queryKey: ['arrivals', selectedDate],
    queryFn: () => frontdeskService.getArrivals(selectedDate),
  });

  const { data: departures, refetch: refetchDepartures } = useQuery({
    queryKey: ['departures', selectedDate],
    queryFn: () => frontdeskService.getDepartures(selectedDate),
  });

  const handleCheckIn = async (reservationId: number) => {
    try {
      await frontdeskService.checkIn(reservationId, { id_verified: true });
      toast.success('Guest checked in successfully — status updated to In-House');
      // Refetch arrivals and dashboard data without full page reload
      refetchArrivals();
      queryClient.invalidateQueries({ queryKey: ['frontdesk-dashboard'] });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to check in guest');
    }
  };

  const handleCheckOut = async (reservationId: number) => {
    try {
      await frontdeskService.checkOut(reservationId, {});
      toast.success('Guest checked out successfully');
      // Refetch departures and dashboard data without full page reload
      refetchDepartures();
      queryClient.invalidateQueries({ queryKey: ['frontdesk-dashboard'] });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to check out guest');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Front Desk Dashboard</h1>
              <p className="text-neutral-600 mt-1">Welcome back, {user?.fullName}</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Arrivals Today</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {dashboardData?.arrivals_today || arrivals?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <LogIn className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Departures Today</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {dashboardData?.departures_today || departures?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">In House</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {dashboardData?.in_house || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {dashboardData?.tasks?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Arrivals and Departures */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Arrivals */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-blue-600" />
              Arrivals - {format(new Date(selectedDate), 'MMM dd, yyyy')}
            </h2>
            <div className="space-y-3">
              {arrivals && arrivals.length > 0 ? (
                arrivals.map((arrival: any) => {
                  const isCheckedIn = arrival.status === 'checked_in';
                  return (
                    <div
                      key={arrival.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isCheckedIn
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-neutral-50 hover:bg-neutral-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-900">{arrival.guest_name}</p>
                          {isCheckedIn && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              In-House
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600">
                          {arrival.room_number ? `Room ${arrival.room_number}` : 'Room TBD'}
                        </p>
                        <p className="text-xs text-neutral-500">{arrival.confirmation_code}</p>
                      </div>
                      {isCheckedIn ? (
                        <span className="px-4 py-2 text-green-600 text-sm font-medium">
                          Checked In
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(arrival.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-neutral-500 text-center py-8">No arrivals scheduled</p>
              )}
            </div>
          </div>

          {/* Departures */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-green-600" />
              Departures - {format(new Date(selectedDate), 'MMM dd, yyyy')}
            </h2>
            <div className="space-y-3">
              {departures && departures.length > 0 ? (
                departures.map((departure: any) => (
                  <div
                    key={departure.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-neutral-900">{departure.guest_name}</p>
                      <p className="text-sm text-neutral-600">
                        {departure.room_number ? `Room ${departure.room_number}` : 'Room TBD'}
                      </p>
                      <p className="text-xs text-neutral-500">{departure.confirmation_code}</p>
                    </div>
                    <button
                      onClick={() => handleCheckOut(departure.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Check Out
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-8">No departures scheduled</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

