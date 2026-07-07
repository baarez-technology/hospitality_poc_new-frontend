import React from 'react';

/**
 * Toggle Switch Component
 * Reusable toggle switch for settings
 */
export default function ToggleSwitch({ enabled, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        {label && (
          <label className="text-sm font-medium text-neutral-800">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-neutral-500 mt-0.5">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => !disabled && onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:ring-offset-2 ${
          enabled ? 'bg-[#A57865]' : 'bg-neutral-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`${
            enabled ? 'translate-x-6' : 'translate-x-1'
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5`}
        />
      </button>
    </div>
  );
}
