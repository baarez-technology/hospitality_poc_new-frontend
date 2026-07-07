import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Home, Users, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardsService } from '@/api/services/dashboards.service';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export function HousekeepingDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch operations dashboard (includes housekeeping data)
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['operations-dashboard'],
    queryFn: () => dashboardsService.getOperationsDashboard(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

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

  const housekeepingTasks = dashboardData?.housekeeping_tasks || {
    pending: 0,
    in_progress: 0,
    completed: 0,
  };

  const roomStatus = dashboardData?.room_status_summary || {};

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Housekeeping Dashboard</h1>
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
                <p className="text-sm text-neutral-600">Pending Tasks</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {housekeepingTasks.pending}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
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
                <p className="text-sm text-neutral-600">In Progress</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {housekeepingTasks.in_progress}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm text-neutral-600">Completed</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {housekeepingTasks.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                <p className="text-sm text-neutral-600">Total Rooms</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {Object.values(roomStatus).reduce((sum: number, count: any) => sum + count, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Room Status Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Room Status Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(roomStatus).map(([status, count]: [string, any]) => (
              <div
                key={status}
                className="p-4 bg-neutral-50 rounded-lg text-center"
              >
                <p className="text-2xl font-bold text-neutral-900">{count}</p>
                <p className="text-sm text-neutral-600 capitalize mt-1">
                  {status.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/housekeeping"
              className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-center"
            >
              <Home className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-semibold text-neutral-900">Manage Rooms</p>
            </a>
            <a
              href="/admin/housekeeping?tab=by-staff"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-neutral-900">Staff Assignments</p>
            </a>
            <a
              href="/admin/housekeeping?tab=by-floor"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-neutral-900">Floor View</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


