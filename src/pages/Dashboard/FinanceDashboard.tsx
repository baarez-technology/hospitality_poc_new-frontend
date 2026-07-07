import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardsService } from '@/api/services/dashboards.service';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export function FinanceDashboard() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  // Fetch finance dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['finance-dashboard', dateRange.start, dateRange.end],
    queryFn: () => dashboardsService.getFinanceDashboard(dateRange.start, dateRange.end),
    refetchInterval: 60000, // Refresh every minute
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

  const totalRevenue = dashboardData?.total_revenue || 0;
  const outstandingBalance = dashboardData?.outstanding_balance || 0;
  const paymentMethods = dashboardData?.payment_methods || {};
  const topRatePlans = dashboardData?.top_rate_plans || [];

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Finance Dashboard</h1>
              <p className="text-neutral-600 mt-1">Welcome back, {user?.fullName}</p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-neutral-600">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Revenue</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {format(new Date(dateRange.start), 'MMM dd')} - {format(new Date(dateRange.end), 'MMM dd')}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
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
                <p className="text-sm text-neutral-600">Outstanding Balance</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  ${outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-orange-600 mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
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
                <p className="text-sm text-neutral-600">Net Revenue</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  ${(totalRevenue - outstandingBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-blue-600 mt-1">After outstanding</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Payment Methods</h2>
            <div className="space-y-3">
              {Object.entries(paymentMethods).length > 0 ? (
                Object.entries(paymentMethods).map(([method, amount]: [string, any]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-neutral-600" />
                      <span className="font-medium text-neutral-900 capitalize">{method}</span>
                    </div>
                    <span className="font-bold text-neutral-900">
                      ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-8">No payment data available</p>
              )}
            </div>
          </div>

          {/* Top Rate Plans */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Top Rate Plans</h2>
            <div className="space-y-3">
              {topRatePlans.length > 0 ? (
                topRatePlans.slice(0, 5).map((plan: any, index: number) => (
                  <div
                    key={plan.id || index}
                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{plan.name || 'Unknown Plan'}</p>
                      <p className="text-sm text-neutral-600">
                        {plan.bookings || 0} bookings
                      </p>
                    </div>
                    <span className="font-bold text-neutral-900">
                      ${plan.revenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center py-8">No rate plan data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/revenue"
              className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors text-center"
            >
              <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-semibold text-neutral-900">Revenue Reports</p>
            </a>
            <a
              href="/admin/bookings"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-neutral-900">View Bookings</p>
            </a>
            <a
              href="/admin/settings"
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-neutral-900">Rate Plans</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


