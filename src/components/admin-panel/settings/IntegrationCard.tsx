import React from 'react';
import { Check, X, RefreshCw, Settings } from 'lucide-react';

/**
 * Integration Card Component
 * Card for displaying integration status and actions
 */
export default function IntegrationCard({ integration, onConnect, onDisconnect, onConfigure }) {
  const { id, name, description, logo, category, connected, status, lastSync } = integration;

  const formatLastSync = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (cat) => {
    const colors = {
      'OTA': 'bg-blue-100 text-blue-700',
      'Payment': 'bg-green-100 text-[#4E5840]',
      'Distribution': 'bg-purple-100 text-purple-700',
      'Marketing': 'bg-pink-100 text-pink-700',
      'Analytics': 'bg-amber-100 text-amber-700',
      'Reputation': 'bg-indigo-100 text-indigo-700'
    };
    return colors[cat] || 'bg-neutral-100 text-neutral-700';
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-2xl">
            {logo}
          </div>

          {/* Info */}
          <div>
            <h4 className="text-base font-semibold text-neutral-800">
              {name}
            </h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(category)} mt-1`}>
              {category}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {connected ? (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-[#4E5840] rounded-full text-xs font-medium">
            <Check className="w-3 h-3" />
            Connected
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium">
            <X className="w-3 h-3" />
            Not Connected
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-neutral-600 mb-4">
        {description}
      </p>

      {/* Last Sync */}
      {connected && lastSync && (
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
          <RefreshCw className="w-3 h-3" />
          Last synced {formatLastSync(lastSync)}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-neutral-200">
        {connected ? (
          <>
            <button
              onClick={() => onConfigure(integration)}
              className="flex-1 px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>
            <button
              onClick={() => onDisconnect(integration)}
              className="flex-1 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={() => onConnect(integration)}
            className="w-full px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg text-sm font-medium text-white hover:shadow transition-all"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
