import { AlertTriangle, Users, Clock, Zap } from 'lucide-react';
import { Button } from '../ui2/Button';

interface StaffAvailabilityAlertProps {
  department: 'housekeeping' | 'maintenance';
  totalStaff: number;
  busyCount: number;
  availableCount: number;
  pendingTasks: number;
  urgentPending?: number;
  onForceAssign?: () => void;
  className?: string;
}

export function StaffAvailabilityAlert({
  department,
  totalStaff,
  busyCount,
  availableCount,
  pendingTasks,
  urgentPending = 0,
  onForceAssign,
  className = ''
}: StaffAvailabilityAlertProps) {
  const allBusy = availableCount === 0 && totalStaff > 0;
  const isCritical = allBusy && urgentPending > 0;
  const deptLabel = department === 'housekeeping' ? 'Housekeeping Staff' : 'Technicians';

  if (!allBusy) return null;

  return (
    <div className={`rounded-xl border p-4 ${
      isCritical
        ? 'bg-rose-50 border-rose-200'
        : 'bg-gold-50 border-gold-200'
    } ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCritical ? 'bg-rose-100' : 'bg-gold-100'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${isCritical ? 'text-rose-600' : 'text-gold-600'}`} />
        </div>

        <div className="flex-1">
          <h3 className={`font-semibold ${isCritical ? 'text-rose-900' : 'text-gold-900'}`}>
            {isCritical ? 'Critical: ' : ''}All {deptLabel} Busy
          </h3>

          <p className={`text-sm mt-1 ${isCritical ? 'text-rose-700' : 'text-gold-700'}`}>
            All {totalStaff} {department === 'housekeeping' ? 'housekeepers' : 'technicians'} are currently occupied with tasks.
            {pendingTasks > 0 && ` ${pendingTasks} task${pendingTasks > 1 ? 's' : ''} waiting for assignment.`}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className={`w-4 h-4 ${isCritical ? 'text-rose-500' : 'text-gold-500'}`} />
              <span className={isCritical ? 'text-rose-700' : 'text-gold-700'}>
                {busyCount}/{totalStaff} busy
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className={`w-4 h-4 ${isCritical ? 'text-rose-500' : 'text-gold-500'}`} />
              <span className={isCritical ? 'text-rose-700' : 'text-gold-700'}>
                {pendingTasks} pending
              </span>
            </div>

            {urgentPending > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-rose-500" />
                <span className="text-rose-700 font-semibold">
                  {urgentPending} urgent
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          {onForceAssign && pendingTasks > 0 && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onForceAssign}
                className={isCritical
                  ? 'border-rose-300 text-rose-700 hover:bg-rose-100'
                  : 'border-gold-300 text-gold-700 hover:bg-gold-100'
                }
              >
                Force Assign Pending Tasks
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffAvailabilityAlert;
