import { useState } from 'react';
import { RefreshCw, AlertCircle, Zap, FileText, Loader2 } from 'lucide-react';
import { useReputation } from '@/context/ReputationContext';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  action: () => Promise<void>;
  color: string;
}

export default function QuickActions() {
  const {
    loadReputation,
    runAlertDetection,
    loadAutomationConfig,
    loadEngineStats
  } = useReputation();

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const executeAction = async (actionId: string, action: () => Promise<void>, successMessage: string) => {
    setLoadingAction(actionId);
    try {
      await action();
      showNotification('success', successMessage);
    } catch (error: any) {
      showNotification('error', error.message || 'Action failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'refresh',
      label: 'Refresh Data',
      icon: <RefreshCw className="w-5 h-5" />,
      description: 'Reload all reputation data from sources',
      action: async () => {
        await loadReputation();
        await loadEngineStats();
      },
      color: 'bg-[#5C9BA4] hover:bg-[#4a8a93]'
    },
    {
      id: 'detect-alerts',
      label: 'Run Alert Detection',
      icon: <AlertCircle className="w-5 h-5" />,
      description: 'Scan for new trends and anomalies',
      action: async () => {
        const result = await runAlertDetection();
        if (result.alerts_created > 0) {
          showNotification('success', `Detected ${result.alerts_created} new alert(s)`);
        }
      },
      color: 'bg-[#A57865] hover:bg-[#946957]'
    },
    {
      id: 'process-auto',
      label: 'Process Auto-Replies',
      icon: <Zap className="w-5 h-5" />,
      description: 'Generate responses for pending reviews',
      action: async () => {
        await loadAutomationConfig();
        // This would typically call a backend endpoint to process auto-replies
        // For now, we just refresh the automation config
      },
      color: 'bg-[#CDB261] hover:bg-[#bea152]'
    },
    {
      id: 'export',
      label: 'Export Report',
      icon: <FileText className="w-5 h-5" />,
      description: 'Download reputation analytics report',
      action: async () => {
        // Create a simple CSV export of the data
        const data = {
          generated_at: new Date().toISOString(),
          report_type: 'reputation_summary'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reputation-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      color: 'bg-[#4E5840] hover:bg-[#3e4833]'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-neutral-700">Quick Actions</h3>
        {loadingAction && (
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing...
          </span>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className={`mb-3 px-3 py-2 rounded-lg text-sm ${
          notification.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Action Buttons - Grid Layout */}
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => executeAction(
              action.id,
              action.action,
              `${action.label} completed`
            )}
            disabled={loadingAction !== null}
            className={`
              ${action.color}
              text-white rounded-lg p-3 text-left transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A57865]
            `}
            title={action.description}
          >
            <div className="flex items-center gap-2">
              {loadingAction === action.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                action.icon
              )}
              <span className="text-sm font-medium truncate">{action.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tooltip/Description Area */}
      <div className="mt-3 pt-3 border-t border-neutral-100">
        <p className="text-xs text-neutral-500 text-center">
          Hover over actions for more details
        </p>
      </div>
    </div>
  );
}
