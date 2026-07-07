import { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Sparkles,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Percent,
  Building2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// UI2 Design System Components
import {
  PageContainer,
  PageHeader,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui2';

// Utility
import { cn } from '@/lib/utils';

// ============================================================================
// PLACEHOLDER DATA
// ============================================================================

const FORECAST_DATA = [
  { date: 'Mon', forecast: 82, actual: 78, revenue: 45200 },
  { date: 'Tue', forecast: 75, actual: 72, revenue: 38400 },
  { date: 'Wed', forecast: 68, actual: 71, revenue: 35800 },
  { date: 'Thu', forecast: 85, actual: 88, revenue: 52100 },
  { date: 'Fri', forecast: 92, actual: 94, revenue: 68500 },
  { date: 'Sat', forecast: 95, actual: null, revenue: 72000 },
  { date: 'Sun', forecast: 88, actual: null, revenue: 58900 },
];

const ROOM_TYPE_PRICING = [
  { name: 'Minimalist Studio', current: 150, suggested: 159, change: 6.0, demand: 'high' },
  { name: 'Coastal Retreat', current: 199, suggested: 219, change: 10.1, demand: 'high' },
  { name: 'Urban Oasis', current: 245, suggested: 259, change: 5.7, demand: 'medium' },
  { name: 'Sunset Vista', current: 315, suggested: 329, change: 4.4, demand: 'high' },
  { name: 'Pacific Suite', current: 385, suggested: 399, change: 3.6, demand: 'medium' },
  { name: 'Wellness Suite', current: 425, suggested: 449, change: 5.6, demand: 'low' },
  { name: 'Family Sanctuary', current: 485, suggested: 499, change: 2.9, demand: 'medium' },
  { name: 'Oceanfront Penthouse', current: 750, suggested: 799, change: 6.5, demand: 'high' },
];

const COMPETITOR_DATA = [
  { name: 'Your Hotel', price: 279, rating: 4.8 },
  { name: 'Grand Hotel', price: 299, rating: 4.6 },
  { name: 'Luxury Resort', price: 349, rating: 4.9 },
  { name: 'City Hotel', price: 219, rating: 4.3 },
  { name: 'Boutique Inn', price: 259, rating: 4.7 },
];

const AI_RECOMMENDATIONS = [
  {
    type: 'increase',
    title: 'Increase Weekend Rates',
    description: 'High demand detected for Saturday. Consider 15% rate increase.',
    impact: '+₹12,400 potential revenue',
    priority: 'high',
  },
  {
    type: 'promo',
    title: 'Midweek Promotion',
    description: 'Low occupancy on Tuesday/Wednesday. Flash sale recommended.',
    impact: '+8% occupancy boost',
    priority: 'medium',
  },
  {
    type: 'optimize',
    title: 'Length of Stay Discount',
    description: '3+ night stays at 10% off could increase bookings.',
    impact: '+₹5,200 monthly revenue',
    priority: 'low',
  },
];

const PICKUP_DATA = [
  { window: '0-7 days', pickup: 45, pace: '+12%' },
  { window: '8-14 days', pickup: 28, pace: '+5%' },
  { window: '15-30 days', pickup: 18, pace: '-3%' },
  { window: '31-60 days', pickup: 12, pace: '+8%' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RMSDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'pricing' | 'forecast'>('overview');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const totalRevenue = FORECAST_DATA.reduce((sum, d) => sum + d.revenue, 0);
    const avgOccupancy = Math.round(
      FORECAST_DATA.filter((d) => d.actual).reduce((sum, d) => sum + (d.actual || 0), 0) /
        FORECAST_DATA.filter((d) => d.actual).length
    );
    const avgRate = Math.round(
      ROOM_TYPE_PRICING.reduce((sum, r) => sum + r.current, 0) / ROOM_TYPE_PRICING.length
    );
    const revPAR = Math.round((avgOccupancy / 100) * avgRate);

    return { totalRevenue, avgOccupancy, avgRate, revPAR };
  }, []);

  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Revenue Management"
        description="AI-powered pricing optimization and demand forecasting"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="secondary" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button
              variant="primary"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              Refresh Analysis
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-sage-600" />
            <span className="text-xs text-neutral-500">Weekly Revenue</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">
            ₹{metrics.totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-sage-500" />
            <span className="text-xs text-sage-500">+8.2% vs last week</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-terra-600" />
            <span className="text-xs text-neutral-500">Avg Occupancy</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{metrics.avgOccupancy}%</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-sage-500" />
            <span className="text-xs text-sage-500">+5% vs forecast</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-ocean-600" />
            <span className="text-xs text-neutral-500">Avg Rate (ADR)</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹{metrics.avgRate}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-sage-500" />
            <span className="text-xs text-sage-500">+3.1% vs last month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-gold-600" />
            <span className="text-xs text-neutral-500">RevPAR</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">₹{metrics.revPAR}</p>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-sage-500" />
            <span className="text-xs text-sage-500">+6.8% vs budget</span>
          </div>
        </Card>
      </div>

      {/* Demand Forecast Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>7-Day Demand Forecast</CardTitle>
              <p className="text-sm text-neutral-500 mt-1">
                Predicted vs actual occupancy
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-terra-500" />
                <span className="text-neutral-500">Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sage-500" />
                <span className="text-neutral-500">Actual</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FORECAST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E5E5',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name === 'forecast' ? 'Forecast' : 'Actual',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="forecast"
                  stroke="#A57865"
                  fill="#A57865"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#4E5840"
                  fill="#4E5840"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Recommendations */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-terra-50 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-terra-600" />
              </div>
              <div>
                <CardTitle>AI Pricing Suggestions</CardTitle>
                <p className="text-sm text-neutral-500 mt-0.5">Optimized for next 7 days</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ROOM_TYPE_PRICING.map((room) => (
                <div
                  key={room.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-2 h-8 rounded-full',
                        room.demand === 'high' && 'bg-sage-500',
                        room.demand === 'medium' && 'bg-gold-500',
                        room.demand === 'low' && 'bg-neutral-300'
                      )}
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{room.name}</p>
                      <p className="text-xs text-neutral-500">
                        {room.demand.charAt(0).toUpperCase() + room.demand.slice(1)} demand
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-bold text-neutral-900">₹{room.suggested}</p>
                      <p className="text-xs text-neutral-400">Current: ₹{room.current}</p>
                    </div>
                    {room.change !== 0 && (
                      <div
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
                          room.change > 0
                            ? 'bg-sage-50 text-sage-600'
                            : 'bg-rose-50 text-rose-600'
                        )}
                      >
                        {room.change > 0 ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {Math.abs(room.change)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" className="w-full mt-4">
              Apply All Suggestions
            </Button>
          </CardContent>
        </Card>

        {/* Competitor Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Competitor Analysis</CardTitle>
            <p className="text-sm text-neutral-500 mt-1">
              Deluxe room rates comparison
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COMPETITOR_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis type="number" domain={[0, 400]} tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E5E5',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value}`, 'Rate']}
                  />
                  <Bar
                    dataKey="price"
                    fill="#A57865"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-sage-50 border border-sage-200">
              <p className="text-sm font-semibold text-sage-800">Market Position</p>
              <p className="text-xs text-sage-600 mt-1">
                Your rates are 7% below the market leader while maintaining a competitive
                4.8 rating.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <CardTitle>AI Revenue Recommendations</CardTitle>
              <p className="text-sm text-neutral-500">
                {AI_RECOMMENDATIONS.length} opportunities identified
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AI_RECOMMENDATIONS.map((rec, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-xl border',
                  rec.priority === 'high' && 'bg-sage-50 border-sage-200',
                  rec.priority === 'medium' && 'bg-gold-50 border-gold-200',
                  rec.priority === 'low' && 'bg-neutral-50 border-neutral-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      rec.priority === 'high' && 'bg-sage-100',
                      rec.priority === 'medium' && 'bg-gold-100',
                      rec.priority === 'low' && 'bg-neutral-100'
                    )}
                  >
                    {rec.type === 'increase' && (
                      <TrendingUp
                        className={cn(
                          'w-4 h-4',
                          rec.priority === 'high'
                            ? 'text-sage-600'
                            : rec.priority === 'medium'
                            ? 'text-gold-600'
                            : 'text-neutral-600'
                        )}
                      />
                    )}
                    {rec.type === 'promo' && (
                      <Target
                        className={cn(
                          'w-4 h-4',
                          rec.priority === 'medium' ? 'text-gold-600' : 'text-neutral-600'
                        )}
                      />
                    )}
                    {rec.type === 'optimize' && (
                      <BarChart3 className="w-4 h-4 text-neutral-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          'text-sm font-semibold',
                          rec.priority === 'high' && 'text-sage-800',
                          rec.priority === 'medium' && 'text-gold-800',
                          rec.priority === 'low' && 'text-neutral-800'
                        )}
                      >
                        {rec.title}
                      </p>
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded',
                          rec.priority === 'high' && 'bg-sage-200 text-sage-700',
                          rec.priority === 'medium' && 'bg-gold-200 text-gold-700',
                          rec.priority === 'low' && 'bg-neutral-200 text-neutral-700'
                        )}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">{rec.description}</p>
                    <p className="text-xs font-semibold text-sage-600 mt-2">
                      {rec.impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pickup Pace */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Pickup Pace</CardTitle>
          <p className="text-sm text-neutral-500 mt-1">Reservation velocity by lead time</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {PICKUP_DATA.map((item) => (
              <div
                key={item.window}
                className="p-4 rounded-xl bg-neutral-50 text-center"
              >
                <p className="text-2xl font-bold text-neutral-900">{item.pickup}</p>
                <p className="text-xs text-neutral-500 mt-1">{item.window}</p>
                <div
                  className={cn(
                    'inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-lg text-xs font-semibold',
                    item.pace.startsWith('+')
                      ? 'bg-sage-50 text-sage-600'
                      : 'bg-rose-50 text-rose-600'
                  )}
                >
                  {item.pace.startsWith('+') ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {item.pace}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  RMS Engine
                </p>
                <p className="text-lg font-bold text-sage-600">Active</p>
              </div>
              <div className="h-8 w-px bg-neutral-200" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  ML Model Version
                </p>
                <p className="text-lg font-bold text-neutral-900">v3.2.1</p>
              </div>
              <div className="h-8 w-px bg-neutral-200" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  Forecast Accuracy
                </p>
                <p className="text-lg font-bold text-ocean-500">94.2%</p>
              </div>
              <div className="h-8 w-px bg-neutral-200" />
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider">
                  Revenue Lift
                </p>
                <p className="text-lg font-bold text-terra-500">+12.8% MTD</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Powered by</p>
              <p className="text-sm font-bold text-neutral-900">Glimmora RMS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
