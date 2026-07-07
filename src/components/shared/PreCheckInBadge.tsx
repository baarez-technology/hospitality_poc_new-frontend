import { ClipboardCheck } from 'lucide-react';

export type PreCheckInStatus = 'completed' | 'not_started';

interface PreCheckInBadgeProps {
  status: PreCheckInStatus;
  showIcon?: boolean;
}

const statusConfig: Record<PreCheckInStatus, { label: string; classes: string }> = {
  completed: {
    label: 'Completed',
    classes: 'bg-sage-50 text-sage-700 border-sage-200',
  },
  not_started: {
    label: 'Not Started',
    classes: 'bg-neutral-50 text-neutral-500 border-neutral-200',
  },
};

export function PreCheckInBadge({ status, showIcon = false }: PreCheckInBadgeProps) {
  const { label, classes } = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${classes}`}>
      {showIcon && <ClipboardCheck className="w-3 h-3" />}
      {label}
    </span>
  );
}
