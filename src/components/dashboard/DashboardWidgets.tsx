import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Wifi,
  Shield,
  Zap,
  Activity
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

// Widget Card Container
export function WidgetCard({ children, className = '', title, subtitle, action, icon: Icon }) {
  const isDark = document.documentElement.classList.contains('dark');
  
  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl border ${className}`}>
      {(title || subtitle || action) && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {action}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

// Performance Gauge Widget
export function PerformanceGauge({ value, title, subtitle, color = '#3b82f6' }) {
  const isDark = document.documentElement.classList.contains('dark');
  const percentage = Math.min(value, 100);
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke={isDark ? '#374151' : '#e5e7eb'}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}%
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

// Sparkline Widget
export function SparklineWidget({ data, title, value, change, color = '#3b82f6' }) {
  const isDark = document.documentElement.classList.contains('dark');
  const isPositive = change > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
          <span className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div className="w-24 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Status Widget
export function StatusWidget({ status, title, description, icon: Icon }) {
  const statusConfig = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-600 dark:text-green-400',
      iconBg: 'bg-green-100 dark:bg-green-900/40'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/40'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-100 dark:bg-red-900/40'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40'
    }
  };

  const config = statusConfig[status] || statusConfig.info;
  const StatusIcon = Icon || (status === 'success' ? CheckCircle2 : status === 'error' ? XCircle : AlertCircle);

  return (
    <div className={`p-4 rounded-xl border ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.iconBg}`}>
          <StatusIcon className={`w-5 h-5 ${config.icon}`} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white">
            {title}
          </p>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// List Widget
export function ListWidget({ items, title, showMore, onItemClick }) {
  const isDark = document.documentElement.classList.contains('dark');
  
  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {title}
          </h4>
          {showMore && (
            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              View All
            </button>
          )}
        </div>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            onClick={() => onItemClick && onItemClick(item)}
            className={`flex items-center justify-between p-3 rounded-lg ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            } transition-colors cursor-pointer`}
          >
            <div className="flex items-center gap-3">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.title}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : item.icon ? (
                <div className={`p-2 rounded-lg ${item.iconBg || 'bg-gray-100 dark:bg-gray-700'}`}>
                  <item.icon className={`w-5 h-5 ${item.iconColor || 'text-gray-600 dark:text-gray-400'}`} />
                </div>
              ) : null}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
            {item.value && (
              <span className={`text-sm font-semibold ${item.valueColor || 'text-gray-900 dark:text-white'}`}>
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Progress List Widget
export function ProgressListWidget({ items }) {
  const isDark = document.documentElement.classList.contains('dark');
  
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {item.value}
            </span>
          </div>
          <div className="relative">
            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${item.color || 'bg-blue-500'}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Timeline Widget
export function TimelineWidget({ events }) {
  const isDark = document.documentElement.classList.contains('dark');
  
  return (
    <div className="relative">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4 pb-8 last:pb-0">
          <div className="relative flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              event.completed ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {event.icon ? (
                <event.icon className={`w-5 h-5 ${
                  event.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                }`} />
              ) : (
                <div className={`w-3 h-3 rounded-full ${
                  event.completed ? 'bg-green-600' : 'bg-gray-400'
                }`} />
              )}
            </div>
            {index < events.length - 1 && (
              <div className={`absolute top-10 w-0.5 h-full ${
                isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`} />
            )}
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {event.time}
              </span>
            </div>
            {event.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {event.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Mini Stats Card
export function MiniStatCard({ title, value, icon: Icon, trend, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-medium ${
          trend > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}

// Chart Widget
export function ChartWidget({ type, data, height = 300, colors }) {
  const isDark = document.documentElement.classList.contains('dark');
  const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const chartColors = colors || defaultColors;

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px'
              }}
            />
            <Area type="monotone" dataKey="value" stroke={chartColors[0]} fill="url(#colorGradient)" />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="name" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" fill={chartColors[0]} radius={[8, 8, 0, 0]} />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => `${entry.name}: ${entry.value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
}
