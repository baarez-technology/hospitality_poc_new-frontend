import React from 'react';
import { aiQuickActions } from '../../data/aiQuickActions';

/**
 * AI Quick Actions Component
 * Glimmora Design System v5.0 - Clean, no gradients
 */
export default function AIQuickActions({ onActionClick }) {
  return (
    <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-neutral-100 bg-white">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <span className="text-[10px] sm:text-[11px] font-medium text-neutral-400 mr-0.5 sm:mr-1">Quick:</span>
        {aiQuickActions.slice(0, 4).map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.label)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-all text-[10px] sm:text-[11px]"
            title={action.description}
          >
            <span className="text-xs sm:text-sm">{action.icon}</span>
            <span className="font-medium text-neutral-700">{action.label}</span>
          </button>
        ))}
        {/* Show more on desktop */}
        {aiQuickActions.slice(4, 6).map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.label)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-all text-[11px]"
            title={action.description}
          >
            <span className="text-sm">{action.icon}</span>
            <span className="font-medium text-neutral-700">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
