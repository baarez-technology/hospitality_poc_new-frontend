import React from 'react';

/**
 * Form Section Component
 * Reusable section container for settings forms
 */
export default function FormSection({ title, description, children, actions }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-neutral-600 mt-1">
              {description}
            </p>
          )}
        </div>

        {/* Optional action buttons */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Form Field Component
 * Individual form field within a section
 */
export function FormField({ label, description, required, error, children }) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-xs text-neutral-500 mb-2">
          {description}
        </p>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-600 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
