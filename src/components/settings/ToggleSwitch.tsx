/**
 * Settings Toggle Components
 * Consistent toggle switches for all Settings tabs
 */

interface ToggleProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

interface ToggleItemProps extends ToggleProps {
  title: string;
  description?: string;
}

/**
 * Simple Toggle Switch
 * Use for inline toggles without labels
 */
export function Toggle({ enabled, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-terra-500' : 'bg-neutral-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/**
 * Toggle Item with Label and Description
 * Use for settings rows with toggle + text
 */
export function ToggleItem({ title, description, enabled, onChange, disabled = false }: ToggleItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0">
      <div className="pr-4">
        <p className="text-sm font-medium text-neutral-900">{title}</p>
        {description && (
          <p className="text-sm text-neutral-500 mt-0.5">{description}</p>
        )}
      </div>
      <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />
    </div>
  );
}

/**
 * Setting Row with Custom Content
 * Use for settings with select/input on the right
 */
export function SettingRow({
  label,
  hint,
  children
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4 border-b border-neutral-100 last:border-0">
      <div className="flex items-center justify-between">
        <div className="pr-4">
          <p className="text-sm font-medium text-neutral-900">{label}</p>
          {hint && <p className="text-sm text-neutral-500 mt-0.5">{hint}</p>}
        </div>
        <div className="w-48">
          {children}
        </div>
      </div>
    </div>
  );
}

// Default export for backwards compatibility
export default function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
  disabled = false
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  if (label) {
    return (
      <ToggleItem
        title={label}
        description={description}
        enabled={enabled}
        onChange={onChange}
        disabled={disabled}
      />
    );
  }
  return <Toggle enabled={enabled} onChange={onChange} disabled={disabled} />;
}
