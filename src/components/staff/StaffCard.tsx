/**
 * StaffCard Component
 * Staff card display - Glimmora Design System v5.0
 * Matches Channel Manager card pattern
 */

import { Eye, Calendar, TrendingUp, Star, CheckCircle, Briefcase } from 'lucide-react';
import { Button, IconButton } from '../ui2/Button';

export default function StaffCard({ staff, onClick, onAssignShift }) {
  // Status styling
  const getStatusConfig = (status) => {
    const configs = {
      active: { dot: 'bg-sage-500', text: 'text-sage-700', label: 'Active' },
      'off-duty': { dot: 'bg-neutral-400', text: 'text-neutral-600', label: 'Off Duty' },
      sick: { dot: 'bg-rose-500', text: 'text-rose-600', label: 'Sick' },
      leave: { dot: 'bg-gold-500', text: 'text-gold-700', label: 'On Leave' }
    };
    return configs[status] || { dot: 'bg-neutral-400', text: 'text-neutral-600', label: status };
  };

  // Calculate task completion percentage
  const completionRate = staff.tasksToday > 0
    ? Math.round((staff.completedToday / staff.tasksToday) * 100)
    : 0;

  const statusConfig = getStatusConfig(staff.status);

  return (
    <div className="bg-white rounded-[10px] p-5 flex flex-col h-full">
      {/* Header with Avatar */}
      <div className="flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600 font-semibold text-lg">
          {staff.avatar}
          {/* Clock status indicator */}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${staff.clockedIn ? 'bg-emerald-500' : 'bg-neutral-300'}`}
            title={staff.clockedIn ? 'Clocked In' : 'Clocked Out'}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-neutral-900 truncate">
            {staff.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Briefcase className="w-3 h-3 text-neutral-400" />
            <p className="text-[11px] font-medium text-neutral-500">{staff.role}</p>
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
            <span className={`text-[11px] font-semibold ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {/* Tasks Today */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-terra-500" />
            <span className="text-[10px] font-medium text-neutral-500">Tasks</span>
          </div>
          <p className="text-[17px] font-semibold text-neutral-900">
            {staff.completedToday}/{staff.tasksToday}
          </p>
          {staff.tasksToday > 0 && (
            <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1.5">
              <div
                className="bg-terra-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          )}
        </div>

        {/* Efficiency */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-sage-600" />
            <span className="text-[10px] font-medium text-neutral-500">Efficiency</span>
          </div>
          <p className="text-[17px] font-semibold text-neutral-900">
            {staff.efficiency}%
          </p>
          <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                staff.efficiency >= 90 ? 'bg-sage-500' :
                staff.efficiency >= 75 ? 'bg-terra-500' :
                'bg-gold-500'
              }`}
              style={{ width: `${staff.efficiency}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2.5 mb-4 p-2.5 bg-gold-50 rounded-lg border border-gold-100">
        <div className="w-7 h-7 rounded-lg bg-gold-100 flex items-center justify-center">
          <Star className="w-3.5 h-3.5 fill-gold-500 stroke-none" />
        </div>
        <div>
          <p className="text-[10px] font-medium text-gold-600">Rating</p>
          <p className="text-[15px] font-semibold text-gold-700">{staff.rating.toFixed(1)}</p>
        </div>
      </div>

      {/* Spacer to push buttons to bottom */}
      <div className="flex-1"></div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onClick(staff)}
          className="flex-1"
        >
          View Profile
        </Button>
        <IconButton
          icon={Calendar}
          variant="outline"
          size="sm"
          label="Assign Shift"
          onClick={(e) => {
            e.stopPropagation();
            onAssignShift(staff);
          }}
        />
      </div>
    </div>
  );
}
