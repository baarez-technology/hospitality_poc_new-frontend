/**
 * Toast Component
 * Notification toast for user feedback with optional undo action
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Undo } from 'lucide-react';

export default function Toast({ id, type = 'success', message, duration = 3000, onClose, onUndo, undoText = 'Undo' }) {
  const [isUndoing, setIsUndoing] = useState(false);
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#5C9BA4]" />,
    error: <XCircle className="w-5 h-5 text-rose-600" />,
    warning: <AlertCircle className="w-5 h-5 text-[#CDB261]" />,
    info: <Info className="w-5 h-5 text-[#5C9BA4]" />
  };

  const colors = {
    success: 'bg-white border-[#5C9BA4]',
    error: 'bg-white border-rose-400',
    warning: 'bg-white border-[#CDB261]',
    info: 'bg-white border-[#5C9BA4]'
  };

  const textColors = {
    success: 'text-neutral-800',
    error: 'text-neutral-800',
    warning: 'text-neutral-800',
    info: 'text-neutral-800'
  };

  const handleUndo = async () => {
    if (onUndo && !isUndoing) {
      setIsUndoing(true);
      try {
        await onUndo();
        onClose(id);
      } catch (error) {
        setIsUndoing(false);
      }
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border-l-4 shadow-xl min-w-[300px] max-w-md animate-slideIn ${colors[type]}`}
      role="alert"
    >
      {icons[type]}
      <p className={`flex-1 text-sm font-medium ${textColors[type]}`}>
        {message}
      </p>
      {onUndo && (
        <button
          onClick={handleUndo}
          disabled={isUndoing}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
            type === 'success'
              ? 'bg-[#5C9BA4]/10 text-[#5C9BA4] hover:bg-[#5C9BA4]/20'
              : type === 'warning'
                ? 'bg-[#CDB261]/10 text-[#CDB261] hover:bg-[#CDB261]/20'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
          aria-label={undoText}
        >
          {isUndoing ? (
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Undo className="w-3.5 h-3.5" />
          )}
          {undoText}
        </button>
      )}
      <button
        onClick={() => onClose(id)}
        className={`p-1 rounded-md hover:bg-white/50 transition-colors ${textColors[type]}`}
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
