import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface PendingAction {
  action_id: string;
  action_type: string;
  description: string;
  params: Record<string, unknown>;
}

interface AIActionConfirmationProps {
  pendingAction: PendingAction | null;
  onConfirm: () => void;
  onCancel: () => void;
  isExecuting?: boolean;
}

/**
 * AIActionConfirmation Component
 * Displays pending action details and confirmation buttons
 */
export default function AIActionConfirmation({
  pendingAction,
  onConfirm,
  onCancel,
  isExecuting = false
}: AIActionConfirmationProps) {
  if (!pendingAction) return null;

  // Get action type display info
  const getActionTypeInfo = (actionType: string) => {
    const types: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      create_task: {
        label: 'Create Task',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: CheckCircle
      },
      create_maintenance: {
        label: 'Create Maintenance',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: AlertTriangle
      },
      update_booking_status: {
        label: 'Update Booking',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: CheckCircle
      },
      update_room_status: {
        label: 'Update Room',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle
      },
      send_email: {
        label: 'Send Email',
        color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
        icon: CheckCircle
      },
      assign_task: {
        label: 'Assign Task',
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: CheckCircle
      }
    };

    return types[actionType] || {
      label: actionType.replace(/_/g, ' '),
      color: 'bg-neutral-100 text-neutral-700 border-neutral-200',
      icon: CheckCircle
    };
  };

  const typeInfo = getActionTypeInfo(pendingAction.action_type);
  const TypeIcon = typeInfo.icon;

  // Format param value for display
  const formatParamValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  // Filter out internal params
  const displayParams = Object.entries(pendingAction.params).filter(
    ([key]) => !['user_id', 'created_by'].includes(key)
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-3 bg-gradient-to-br from-[#A57865]/5 via-white to-[#CDB261]/5 rounded-xl border-2 border-[#A57865]/30 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#A57865]/10 to-transparent border-b border-[#A57865]/20">
          <div className={`p-2 rounded-lg ${typeInfo.color} border`}>
            <TypeIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-800">
              {typeInfo.label}
            </h4>
            <p className="text-xs text-neutral-500">
              Action ID: {pendingAction.action_id}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="p-4">
          <p className="text-sm text-neutral-700 mb-3">
            {pendingAction.description}
          </p>

          {/* Parameters */}
          {displayParams.length > 0 && (
            <div className="space-y-2 mb-4">
              <h5 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Details
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {displayParams.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col bg-neutral-50 rounded-lg px-3 py-2"
                  >
                    <span className="text-xs text-neutral-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-medium text-neutral-800">
                      {formatParamValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onConfirm}
              disabled={isExecuting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#A57865] to-[#8E6554] text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm</span>
                </>
              )}
            </button>

            <button
              onClick={onCancel}
              disabled={isExecuting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-neutral-700 font-medium rounded-lg border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
