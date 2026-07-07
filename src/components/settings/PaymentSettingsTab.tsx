/**
 * Payment Settings Tab
 * Admin UI for managing per-hotel Razorpay payment configuration.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Settings,
  Zap,
  RefreshCw,
  Banknote,
  ToggleLeft,
  QrCode,
  Upload,
  X,
  Image,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { paymentConfigService } from '../../api/services/payment-config.service';
import { paymentQRService, type QRSettingsResponse } from '../../api/services/payment-qr.service';
import type {
  PaymentConfigInput,
  PaymentConfigResponse,
  ValidationStatus,
  SUPPORTED_CURRENCIES,
} from '../../types/payment-config.types';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AED'];

interface FormState {
  razorpay_key_id: string;
  razorpay_key_secret: string;
  razorpay_webhook_secret: string;
  is_test_mode: boolean;
  currency: string;
  auto_capture: boolean;
}

const initialFormState: FormState = {
  razorpay_key_id: '',
  razorpay_key_secret: '',
  razorpay_webhook_secret: '',
  is_test_mode: true,
  currency: 'INR',
  auto_capture: true,
};

export default function PaymentSettingsTab() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [initialForm, setInitialForm] = useState<FormState>(initialFormState);
  const [config, setConfig] = useState<PaymentConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Secret visibility toggles
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Track if secrets have been modified (to avoid overwriting with empty)
  const [keySecretModified, setKeySecretModified] = useState(false);
  const [webhookSecretModified, setWebhookSecretModified] = useState(false);

  // QR Code Settings
  const [qrSettings, setQrSettings] = useState<QRSettingsResponse | null>(null);
  const [qrEnabled, setQrEnabled] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrInstructions, setQrInstructions] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSaving, setQrSaving] = useState(false);

  // Check if form has changes
  const hasChanges = (): boolean => {
    // Check credential fields
    if (form.razorpay_key_id !== initialForm.razorpay_key_id) return true;
    if (form.is_test_mode !== initialForm.is_test_mode) return true;
    if (form.currency !== initialForm.currency) return true;
    if (form.auto_capture !== initialForm.auto_capture) return true;
    // Check if secrets were modified
    if (keySecretModified && form.razorpay_key_secret) return true;
    if (webhookSecretModified && form.razorpay_webhook_secret) return true;
    return false;
  };

  // Load existing configuration
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentConfigService.getConfig();
      setConfig(data);

      // Populate form with existing values
      const formData: FormState = {
        razorpay_key_id: data.razorpay_key_id || '',
        razorpay_key_secret: '', // Never populate secrets from API
        razorpay_webhook_secret: '',
        is_test_mode: data.is_test_mode,
        currency: data.currency,
        auto_capture: data.auto_capture,
      };
      setForm(formData);
      setInitialForm(formData);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No config exists yet - that's fine, use defaults
        setConfig(null);
        setForm(initialFormState);
        setInitialForm(initialFormState);
      } else {
        setError(err.response?.data?.detail || 'Failed to load payment configuration');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load QR settings
  const loadQRSettings = useCallback(async () => {
    try {
      setQrLoading(true);
      const data = await paymentQRService.getSettings();
      setQrSettings(data);
      setQrEnabled(data.qr_code_enabled);
      setQrImage(data.qr_code_image);
      setQrInstructions(data.qr_code_instructions || '');
    } catch (err: any) {
      // No QR settings yet - that's fine
      console.log('No QR settings found');
    } finally {
      setQrLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
    loadQRSettings();
  }, [loadConfig, loadQRSettings]);

  // Save configuration
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload: PaymentConfigInput = {
        razorpay_key_id: form.razorpay_key_id || undefined,
        is_test_mode: form.is_test_mode,
        currency: form.currency,
        auto_capture: form.auto_capture,
        // Payment methods are now derived from is_enabled flag
        card_enabled: true,
        upi_enabled: true,
        cash_enabled: true,
      };

      // Only include secrets if modified
      if (keySecretModified && form.razorpay_key_secret) {
        payload.razorpay_key_secret = form.razorpay_key_secret;
      }
      if (webhookSecretModified && form.razorpay_webhook_secret) {
        payload.razorpay_webhook_secret = form.razorpay_webhook_secret;
      }

      const data = await paymentConfigService.saveConfig(payload);
      setConfig(data);

      // Reset modification flags and update initial form
      setKeySecretModified(false);
      setWebhookSecretModified(false);
      const updatedForm: FormState = {
        razorpay_key_id: form.razorpay_key_id,
        razorpay_key_secret: '',
        razorpay_webhook_secret: '',
        is_test_mode: form.is_test_mode,
        currency: form.currency,
        auto_capture: form.auto_capture,
      };
      setForm(updatedForm);
      setInitialForm(updatedForm);

      toast.success('Payment configuration saved');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to save configuration';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Validate credentials
  const handleValidate = async () => {
    try {
      setValidating(true);
      setError(null);

      const result = await paymentConfigService.validateConfig();

      if (result.valid) {
        toast.success('Credentials validated successfully');
        // Reload config to get updated validation status
        await loadConfig();
      } else {
        toast.error(result.message || 'Validation failed');
        setError(result.message);
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Validation failed';
      setError(message);
      toast.error(message);
    } finally {
      setValidating(false);
    }
  };

  // Handle QR image upload
  const handleQRImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      const base64 = await paymentQRService.fileToBase64(file);
      setQrImage(base64);
    } catch (err) {
      toast.error('Failed to process image');
    }
  };

  // Save QR settings
  const handleSaveQRSettings = async () => {
    try {
      setQrSaving(true);
      const data = await paymentQRService.updateSettings({
        qr_code_enabled: qrEnabled,
        qr_code_image: qrImage || undefined,
        qr_code_instructions: qrInstructions || undefined,
      });
      setQrSettings(data);
      toast.success('QR code settings saved');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save QR settings');
    } finally {
      setQrSaving(false);
    }
  };

  // Toggle enable/disable
  const handleToggle = async () => {
    if (!config) return;

    const newEnabled = !config.is_enabled;

    try {
      setToggling(true);
      setError(null);

      const data = await paymentConfigService.toggleConfig(newEnabled);
      setConfig(data);

      toast.success(newEnabled ? 'Payment gateway enabled' : 'Payment gateway disabled');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to toggle payment gateway';
      setError(message);
      toast.error(message);
    } finally {
      setToggling(false);
    }
  };

  // Input classes
  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20 focus:outline-none transition-colors';
  const labelClass = 'block text-[13px] font-medium text-neutral-600 mb-1.5';

  // Toggle Switch Component
  const ToggleSwitch = ({
    checked,
    onChange,
    disabled = false,
  }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${checked ? 'bg-terra-500' : 'bg-neutral-200'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  // Validation status badge
  const StatusBadge = ({ status }: { status: ValidationStatus }) => {
    const styles = {
      valid: 'bg-sage-50 text-sage-600',
      invalid: 'bg-rose-50 text-rose-600',
      pending: 'bg-amber-50 text-amber-600',
    };

    const labels = {
      valid: 'Validated',
      invalid: 'Invalid',
      pending: 'Not Validated',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-terra-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 sm:space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900">Payment Settings</h1>
          <p className="text-[12px] sm:text-sm text-neutral-500 mt-1">
            Configure Razorpay payment gateway for your property
          </p>
        </div>
        <div className="flex items-center gap-3 self-start">
          {config && <StatusBadge status={config.validation_status} />}
          {config && (
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                config.is_enabled ? 'bg-sage-50 text-sage-600' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {config.is_enabled ? 'Enabled' : 'Disabled'}
            </span>
          )}
        </div>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-lg">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-rose-800">Error</p>
            <p className="text-sm text-rose-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Demo Mode Alert - When Razorpay is disabled */}
      {config && !config.is_enabled && (
        <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <Banknote className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-800">Demo Mode Active</p>
            <p className="text-sm text-purple-600 mt-0.5">
              Razorpay is disabled. Customers will only see "Pay at Hotel" option.
              Enable the gateway below to accept card and UPI payments.
            </p>
          </div>
        </div>
      )}

      {/* Razorpay Configuration */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
            <div>
              <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">
                Razorpay Credentials
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
                Enter your Razorpay API credentials
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {/* Key ID */}
          <div>
            <label className={labelClass}>Key ID</label>
            <input
              type="text"
              value={form.razorpay_key_id}
              onChange={(e) => setForm((prev) => ({ ...prev, razorpay_key_id: e.target.value }))}
              className={inputClass}
              placeholder="rzp_test_xxxxxxxxxxxx or rzp_live_xxxxxxxxxxxx"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              Public key from Razorpay Dashboard &gt; Settings &gt; API Keys
            </p>
          </div>

          {/* Key Secret */}
          <div>
            <label className={labelClass}>Key Secret</label>
            <div className="relative">
              <input
                type={showKeySecret ? 'text' : 'password'}
                value={form.razorpay_key_secret}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, razorpay_key_secret: e.target.value }));
                  setKeySecretModified(true);
                }}
                className={`${inputClass} pr-10`}
                placeholder={
                  config?.razorpay_key_secret_masked
                    ? `Current: ${config.razorpay_key_secret_masked}`
                    : 'Enter secret key'
                }
              />
              <button
                type="button"
                onClick={() => setShowKeySecret(!showKeySecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              {config?.razorpay_key_secret_masked
                ? 'Leave empty to keep existing secret'
                : 'Secret key from Razorpay Dashboard'}
            </p>
          </div>

          {/* Webhook Secret */}
          <div>
            <label className={labelClass}>Webhook Secret (Optional)</label>
            <div className="relative">
              <input
                type={showWebhookSecret ? 'text' : 'password'}
                value={form.razorpay_webhook_secret}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, razorpay_webhook_secret: e.target.value }));
                  setWebhookSecretModified(true);
                }}
                className={`${inputClass} pr-10`}
                placeholder={
                  config?.razorpay_webhook_secret_masked
                    ? `Current: ${config.razorpay_webhook_secret_masked}`
                    : 'Enter webhook secret'
                }
              />
              <button
                type="button"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">
              For verifying webhook signatures (Razorpay Dashboard &gt; Webhooks)
            </p>
          </div>

          {/* Test Mode Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-neutral-700">Test Mode</p>
              <p className="text-[10px] text-neutral-500">
                Use test credentials for development
              </p>
            </div>
            <ToggleSwitch
              checked={form.is_test_mode}
              onChange={(checked) => setForm((prev) => ({ ...prev, is_test_mode: checked }))}
            />
          </div>
        </div>
      </section>

      {/* Advanced Settings */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
            <div>
              <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">
                Advanced Settings
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
                Currency and capture settings
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {/* Currency */}
          <div>
            <label className={labelClass}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
              className={inputClass}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          {/* Auto Capture Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-neutral-700">Auto Capture</p>
              <p className="text-[10px] text-neutral-500">
                Automatically capture payments on authorization
              </p>
            </div>
            <ToggleSwitch
              checked={form.auto_capture}
              onChange={(checked) => setForm((prev) => ({ ...prev, auto_capture: checked }))}
            />
          </div>

          {/* Webhook URL (Read-only) */}
          {config?.webhook_url && (
            <div>
              <label className={labelClass}>Webhook URL</label>
              <input
                type="text"
                value={config.webhook_url}
                readOnly
                className={`${inputClass} bg-neutral-100 cursor-not-allowed`}
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                Configure this URL in your Razorpay Dashboard
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Payment Methods Info */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <ToggleLeft className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
            <div>
              <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">
                Payment Methods
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
                Available payment options based on gateway status
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-3">
          {/* Razorpay Enabled */}
          {config?.is_enabled ? (
            <div className="flex items-start gap-3 p-3 bg-sage-50 border border-sage-100 rounded-lg">
              <CreditCard className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-sage-800">Online Payments Active</p>
                <p className="text-xs text-sage-600 mt-0.5">
                  Customers can pay using Card, UPI, or Pay at Hotel.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <Banknote className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Demo Mode (Cash Only)</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Enable Razorpay below to accept Card and UPI payments.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* QR Code Payment Settings */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
            <div>
              <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">
                QR Code Payment
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
                Upload a QR code for manual payment verification
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          {/* Enable QR Code Toggle */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-neutral-700">Enable QR Code Payment</p>
              <p className="text-[10px] text-neutral-500">
                Show QR code option during booking checkout
              </p>
            </div>
            <ToggleSwitch
              checked={qrEnabled}
              onChange={(checked) => setQrEnabled(checked)}
            />
          </div>

          {/* QR Code Image Upload */}
          <div>
            <label className={labelClass}>QR Code Image</label>
            <div className="mt-2">
              {qrImage ? (
                <div className="relative inline-block">
                  <img
                    src={qrImage}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain border border-neutral-200 rounded-lg bg-white"
                  />
                  <button
                    onClick={() => setQrImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-terra-500 hover:bg-terra-50/50 transition-colors">
                  <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                  <span className="text-sm text-neutral-500">Upload QR Code</span>
                  <span className="text-[10px] text-neutral-400 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQRImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-neutral-400 mt-2">
              Upload your UPI/Bank QR code that guests will scan to make payment
            </p>
          </div>

          {/* Instructions */}
          <div>
            <label className={labelClass}>Payment Instructions (Optional)</label>
            <textarea
              value={qrInstructions}
              onChange={(e) => setQrInstructions(e.target.value)}
              className="w-full h-24 px-3 py-2 rounded-lg border border-neutral-200 text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20 focus:outline-none transition-colors resize-none"
              placeholder="e.g., Scan the QR code using any UPI app and enter the last 4 digits of your UTR number for verification"
            />
          </div>

          {/* Save QR Settings Button */}
          <button
            onClick={handleSaveQRSettings}
            disabled={qrSaving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-terra-500 text-white rounded-lg text-sm font-medium hover:bg-terra-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {qrSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save QR Settings
          </button>
        </div>
      </section>

      {/* Actions */}
      <section className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 sm:gap-3">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0" />
            <div>
              <h2 className="text-[13px] sm:text-sm font-medium text-neutral-900">Actions</h2>
              <p className="text-[10px] sm:text-xs text-neutral-500 mt-0.5">
                Save, validate, and enable your configuration
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Save Button - Only enabled when there are changes */}
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges()}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                hasChanges()
                  ? 'bg-terra-500 text-white hover:bg-terra-600'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Changes
            </button>

            {/* Validate Button - Only show when not yet validated */}
            {config?.validation_status !== 'valid' && (
              <button
                onClick={handleValidate}
                disabled={validating || !config || !form.razorpay_key_id}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {validating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                Validate Credentials
              </button>
            )}

            {/* Enable/Disable Button */}
            {config && (
              <button
                onClick={handleToggle}
                disabled={toggling || config.validation_status !== 'valid'}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  config.is_enabled
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                }`}
              >
                {toggling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {config.is_enabled ? 'Disable Gateway' : 'Enable Gateway'}
              </button>
            )}
          </div>

          {config && config.validation_status !== 'valid' && (
            <p className="text-[10px] text-amber-600 mt-3">
              You must validate your credentials before enabling the payment gateway.
            </p>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-blue-50/50 rounded-[10px] p-4 sm:p-6">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Getting Started with Razorpay</h3>
        <ol className="text-xs text-blue-700 space-y-1.5 list-decimal list-inside">
          <li>
            Create a Razorpay account at{' '}
            <a
              href="https://dashboard.razorpay.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              dashboard.razorpay.com
            </a>
          </li>
          <li>Go to Settings &gt; API Keys to generate your Key ID and Secret</li>
          <li>For test mode, use keys starting with `rzp_test_`</li>
          <li>Enter your credentials above and click Save Changes</li>
          <li>Click Validate Credentials to verify they work</li>
          <li>Once validated, click Enable Gateway to start accepting payments</li>
        </ol>
      </section>
    </div>
  );
}
