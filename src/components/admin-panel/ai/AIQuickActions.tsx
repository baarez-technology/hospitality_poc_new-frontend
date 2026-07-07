import React from 'react';
import { aiQuickActions } from '@/data/aiQuickActions';

/**
 * AI Quick Actions Component
 * Displays quick action buttons for common tasks
 */
export default function AIQuickActions({ onActionClick }) {
  return (
    <div className="px-6 py-3 border-t border-neutral-200/50">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-neutral-500 mr-1">Quick:</span>
        {aiQuickActions.slice(0, 6).map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.label)}
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 transition-all duration-200 text-xs"
            title={action.description}
          >
            <span className="text-sm group-hover:scale-110 transition-transform">
              {action.icon}
            </span>
            <span className="font-medium text-neutral-700 group-hover:text-neutral-900">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
