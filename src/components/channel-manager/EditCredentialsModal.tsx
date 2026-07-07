/**
 * EditCredentialsModal Component
 * Drawer for editing OTA connection credentials - Glimmora Design System v5.0
 * Redesigned as a slide-in drawer for better UX
 */

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useToast } from '../../contexts/ToastContext';

export default function EditCredentialsModal({
  isOpen,
  onClose,
  ota,
  onSave
}) {
  const toast = useToast();
  const [credentials, setCredentials] = useState({
    hotelId: '',
    username: '',
    apiKey: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Reset form when drawer opens with OTA data
  useEffect(() => {
    if (isOpen && ota) {
      setCredentials({
        hotelId: ota.credentials?.hotelId || '',
        username: ota.credentials?.username || '',
        apiKey: ota.credentials?.apiKey || ''
      });
      setTestResult(null);
      setShowApiKey(false);
    }
  }, [isOpen, ota]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success/failure (90% success rate)
    const success = Math.random() > 0.1;
    setTestResult({
      success,
      message: success
        ? 'Connection successful! Your credentials are valid.'
        : 'Connection failed. Please check your credentials and try again.'
    });
    setIsTesting(false);
  };

  const handleSave = async () => {
    if (!isFormValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      await onSave(ota.id, credentials);
      toast.success(`Credentials updated for ${ota?.name}`);
      onClose();
    } catch (err) {
      console.error('Error saving credentials:', err);
      toast.error(err?.message || 'Failed to update credentials. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setCredentials({ hotelId: '', username: '', apiKey: '' });
    setTestResult(null);
    setShowApiKey(false);
    onClose();
  };

  const isFormValid = credentials.hotelId && credentials.username && credentials.apiKey;

  if (!ota) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Credentials"
      subtitle={`Update API credentials for ${ota?.name}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" onClick={handleClose} className="px-5 py-2 text-[13px] font-semibold">
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={!isFormValid}
            loading={isTesting}
            className="px-5 py-2 text-[13px] font-semibold"
          >
            Test Connection
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isFormValid}
            loading={isSaving}
            className="px-5 py-2 text-[13px] font-semibold"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      {/* OTA Info Card */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50 mb-6">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: ota?.color || '#A57865' }}
        >
          {ota?.name?.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">
            {ota?.name}
          </h3>
          <p className="text-[11px] text-neutral-500 font-medium">
            {ota?.status === 'connected' ? 'Connected' : ota?.status === 'error' ? 'Connection Error' : 'Disconnected'}
          </p>
        </div>
      </div>

      {/* API Credentials Section */}
      <div className="space-y-5">
        <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
          API Credentials
        </h4>

        {/* Hotel ID Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-neutral-700">
            Hotel ID / Property ID
            <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={credentials.hotelId}
            onChange={(e) => setCredentials({ ...credentials, hotelId: e.target.value })}
            placeholder="Enter your property ID"
            className="w-full h-9 px-3.5 rounded-lg text-sm bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
          />
        </div>

        {/* Username Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-neutral-700">
            Username / Email
            <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            placeholder="Enter your username or email"
            className="w-full h-9 px-3.5 rounded-lg text-sm bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
          />
        </div>

        {/* API Key Field */}
        <div className="space-y-2">
          <label className="block text-[13px] font-medium text-neutral-700">
            API Key / Secret
            <span className="text-rose-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={credentials.apiKey}
              onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
              placeholder="Enter your API key"
              className="w-full h-9 px-3.5 pr-10 rounded-lg text-sm bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`flex items-start gap-3 p-4 rounded-lg ${
            testResult.success
              ? 'bg-sage-50 border border-sage-200'
              : 'bg-rose-50 border border-rose-200'
          }`}>
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-sage-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
            )}
            <div>
              <p className={`text-[13px] font-semibold mb-1 ${
                testResult.success ? 'text-sage-700' : 'text-rose-700'
              }`}>
                {testResult.success ? 'Connection Successful' : 'Connection Failed'}
              </p>
              <p className={`text-[13px] ${
                testResult.success ? 'text-sage-600' : 'text-rose-600'
              }`}>
                {testResult.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
