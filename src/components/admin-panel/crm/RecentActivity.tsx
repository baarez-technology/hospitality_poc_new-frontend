import { Clock, UserPlus, Calendar, Star, Gift, XCircle, Edit, CheckCircle, MessageSquare, Award } from 'lucide-react';

export default function RecentActivity({ activities }) {
  const getActivityIcon = (activity) => {
    const icons = {
      'New Booking': Calendar,
      'Profile Updated': Edit,
      'Check-In': CheckCircle,
      'Review Submitted': Star,
      'Loyalty Points Redeemed': Gift,
      'New Registration': UserPlus,
      'Booking Modified': Edit,
      'Check-Out': CheckCircle,
      'Special Request': MessageSquare,
      'Cancellation': XCircle,
      'Birthday Noted': Gift,
      'Corporate Account Created': UserPlus,
      'Preference Updated': Edit,
      'Complaint Resolved': CheckCircle,
      'Loyalty Tier Upgraded': Award
    };
    return icons[activity] || Clock;
  };

  const getActivityColor = (activity) => {
    const colors = {
      'New Booking': 'text-[#4E5840] bg-green-100',
      'Profile Updated': 'text-blue-600 bg-blue-100',
      'Check-In': 'text-[#A57865] bg-[#A57865]/10',
      'Review Submitted': 'text-amber-600 bg-amber-100',
      'Loyalty Points Redeemed': 'text-purple-600 bg-purple-100',
      'New Registration': 'text-[#4E5840] bg-green-100',
      'Booking Modified': 'text-blue-600 bg-blue-100',
      'Check-Out': 'text-neutral-600 bg-neutral-100',
      'Special Request': 'text-[#5C9BA4] bg-[#5C9BA4]/15',
      'Cancellation': 'text-red-600 bg-red-100',
      'Birthday Noted': 'text-pink-600 bg-pink-100',
      'Corporate Account Created': 'text-indigo-600 bg-indigo-100',
      'Preference Updated': 'text-blue-600 bg-blue-100',
      'Complaint Resolved': 'text-[#4E5840] bg-green-100',
      'Loyalty Tier Upgraded': 'text-[#CDB261] bg-[#CDB261]/25'
    };
    return colors[activity] || 'text-neutral-600 bg-neutral-100';
  };

  const getSegmentBadge = (segment) => {
    const styles = {
      VIP: 'bg-purple-100 text-purple-700 border-purple-200',
      Corporate: 'bg-blue-100 text-blue-700 border-blue-200',
      Frequent: 'bg-green-100 text-[#4E5840] border-[#4E5840]/30',
      Occasional: 'bg-neutral-100 text-neutral-700 border-neutral-200'
    };
    return styles[segment] || styles.Occasional;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Show last 10 activities
  const displayActivities = activities.slice(0, 10);

  return (
    <div className="bg-white rounded-xl p-6 border border-neutral-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">Recent Activity</h3>
          <p className="text-sm text-neutral-600">Latest guest interactions and updates</p>
        </div>
        <button className="text-sm text-[#A57865] hover:text-[#A57865] font-medium">
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {displayActivities.map((activity) => {
          const Icon = getActivityIcon(activity.activity);

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#FAF8F6] transition-colors"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${getActivityColor(activity.activity)} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-neutral-900">{activity.guestName}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSegmentBadge(activity.segment)}`}>
                    {activity.segment}
                  </span>
                  <span className="text-xs text-neutral-500">{activity.guestId}</span>
                </div>
                <p className="text-sm text-neutral-900 font-medium mb-1">{activity.activity}</p>
                <p className="text-sm text-neutral-600">{activity.description}</p>

                {/* Additional Info */}
                {activity.totalSpend > 0 && (
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="text-[#4E5840] font-semibold">
                      ${activity.totalSpend.toLocaleString()}
                    </span>
                    {activity.platform && (
                      <span className="text-neutral-500">via {activity.platform}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className="text-xs text-neutral-500 flex-shrink-0">
                {formatTimestamp(activity.timestamp)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-[#A57865]">47</p>
          <p className="text-xs text-neutral-600 mt-1">Activities Today</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[#4E5840]">12</p>
          <p className="text-xs text-neutral-600 mt-1">New Bookings</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">8</p>
          <p className="text-xs text-neutral-600 mt-1">Check-Ins</p>
        </div>
      </div>
    </div>
  );
}
