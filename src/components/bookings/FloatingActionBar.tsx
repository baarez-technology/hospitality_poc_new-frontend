import { useState } from 'react';
import {
  Plus, Bed, Pencil, XCircle, Download, Mail,
  Printer, MoreHorizontal, CheckCircle, X, Users
} from 'lucide-react';

/**
 * Floating Action Toolbar
 * Modern floating toolbar for quick booking actions
 */
export default function FloatingActionBar({
  selectedCount = 0,
  onNewBooking,
  onBulkAssignRoom,
  onBulkModify,
  onBulkCancel,
  onExport,
  onClearSelection,
  className = ''
}) {
  const [showMoreActions, setShowMoreActions] = useState(false);

  const hasSelection = selectedCount > 0;

  return (
    <>
      {/* Main Action Bar */}
      <div className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-2
        ${className}
      `}>
        {/* Selection Actions (shown when items selected) */}
        {hasSelection && (
          <div className="
            flex items-center gap-2 px-2 py-2
            bg-neutral-900 rounded-2xl shadow-2xl
            animate-in slide-in-from-bottom-4 duration-300
          ">
            {/* Selection Count */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl">
              <CheckCircle className="w-4 h-4 text-terra-400" />
              <span className="text-sm font-semibold text-white">
                {selectedCount} selected
              </span>
              <button
                onClick={onClearSelection}
                className="ml-1 p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5 text-neutral-400 hover:text-white" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/10" />

            {/* Bulk Actions */}
            <button
              onClick={onBulkAssignRoom}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                text-white text-sm font-medium
                bg-ocean-500/20 hover:bg-ocean-500/30
                transition-colors
              "
              title="Assign Rooms"
            >
              <Bed className="w-4 h-4" />
              <span className="hidden sm:inline">Assign</span>
            </button>

            <button
              onClick={onBulkModify}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                text-white text-sm font-medium
                bg-terra-500/20 hover:bg-terra-500/30
                transition-colors
              "
              title="Modify Bookings"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Modify</span>
            </button>

            <button
              onClick={onBulkCancel}
              className="
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                text-white text-sm font-medium
                bg-rose-500/20 hover:bg-rose-500/30
                transition-colors
              "
              title="Cancel Bookings"
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        )}

        {/* Primary Actions (always visible) */}
        <div className={`
          flex items-center gap-2 px-2 py-2
          bg-white rounded-2xl shadow-2xl border border-neutral-200/50
          ${hasSelection ? 'animate-in slide-in-from-right-4 duration-300' : 'animate-in slide-in-from-bottom-4 duration-300'}
        `}>
          {/* New Booking - Primary CTA */}
          <button
            onClick={onNewBooking}
            className="
              flex items-center gap-2.5 px-5 py-2.5 rounded-xl
              bg-gradient-to-r from-terra-500 to-terra-600
              text-white text-sm font-semibold
              shadow-lg shadow-terra-500/25
              hover:shadow-xl hover:shadow-terra-500/30 hover:from-terra-600 hover:to-terra-700
              transform hover:-translate-y-0.5
              transition-all duration-200
            "
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>New Booking</span>
          </button>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              className="
                p-2.5 rounded-xl
                text-neutral-600 hover:text-terra-600
                hover:bg-terra-50
                transition-colors
              "
              title="Export Data"
            >
              <Download className="w-4.5 h-4.5" />
            </button>

            <button
              className="
                p-2.5 rounded-xl
                text-neutral-600 hover:text-terra-600
                hover:bg-terra-50
                transition-colors
              "
              title="Print View"
            >
              <Printer className="w-4.5 h-4.5" />
            </button>

            {/* More Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className={`
                  p-2.5 rounded-xl transition-colors
                  ${showMoreActions
                    ? 'bg-neutral-100 text-neutral-700'
                    : 'text-neutral-600 hover:text-neutral-700 hover:bg-neutral-100'
                  }
                `}
                title="More Actions"
              >
                <MoreHorizontal className="w-4.5 h-4.5" />
              </button>

              {showMoreActions && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMoreActions(false)}
                  />

                  {/* Dropdown */}
                  <div className="
                    absolute bottom-full right-0 mb-2 w-52
                    bg-white rounded-xl shadow-xl border border-neutral-200
                    py-1.5 z-50
                    animate-in slide-in-from-bottom-2 fade-in duration-200
                  ">
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Mail className="w-4 h-4 text-neutral-500" />
                      Send Confirmation Emails
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Users className="w-4 h-4 text-neutral-500" />
                      Manage Guest List
                    </button>
                    <div className="my-1 border-t border-neutral-100" />
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                        onExport?.();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Download className="w-4 h-4 text-neutral-500" />
                      Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        setShowMoreActions(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      <Download className="w-4 h-4 text-neutral-500" />
                      Export as Excel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcut Hints (shown when no selection) */}
      {!hasSelection && (
        <div className="
          fixed bottom-6 right-6 z-40
          flex items-center gap-3 px-4 py-2
          bg-neutral-900/90 backdrop-blur-sm rounded-xl
          text-xs text-neutral-400
          animate-in fade-in slide-in-from-right-4 duration-500 delay-300
        ">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300 font-mono">N</kbd>
            New
          </span>
          <span className="w-px h-4 bg-neutral-700" />
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300 font-mono">/</kbd>
            Search
          </span>
          <span className="w-px h-4 bg-neutral-700" />
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300 font-mono">?</kbd>
            Help
          </span>
        </div>
      )}
    </>
  );
}
