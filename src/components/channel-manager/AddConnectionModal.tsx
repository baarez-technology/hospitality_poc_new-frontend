/**
 * AddConnectionModal Component
 * Drawer for adding new OTA connections - Glimmora Design System v5.0
 * Redesigned as a slide-in drawer for better UX
 */

import { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff, Search, Plus, ExternalLink } from 'lucide-react';
import { availableOTAs } from '../../data/channel-manager/sampleOTAs';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useToast } from '../../contexts/ToastContext';
import { SearchBar } from '../ui2/SearchBar';
import { channelManagerService } from '../../api/services/channel-manager.service';

export default function AddConnectionModal({ isOpen, onClose, onConnect, existingConnections = [] }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedOTA, setSelectedOTA] = useState(null);
  const [credentials, setCredentials] = useState({
    username: '',
    apiKey: '',
    hotelId: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out already connected OTAs and apply search
  const availableToConnect = useMemo(() => {
    const filtered = availableOTAs.filter(
      ota => !existingConnections.some(conn => conn.code === ota.code)
    );

    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter(ota =>
      (ota.name && ota.name.toLowerCase().includes(query)) ||
      (ota.code && ota.code.toLowerCase().includes(query)) ||
      (ota.description && ota.description.toLowerCase().includes(query))
    );
  }, [existingConnections, searchQuery]);

  // Filter OTAs based on search query
  const filteredOTAs = useMemo(() => {
    if (!searchQuery.trim()) return availableToConnect;
    const query = searchQuery.toLowerCase();
    return availableToConnect.filter(
      ota => (ota.name && ota.name.toLowerCase().includes(query)) ||
             (ota.code && ota.code.toLowerCase().includes(query))
    );
  }, [availableToConnect, searchQuery]);

  const handleSelectOTA = (ota) => {
    setSelectedOTA(ota);
    setStep(2);
    setCredentials({ username: '', apiKey: '', hotelId: '' });
    setTestResult(null);
    setShowApiKey(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await channelManagerService.testOTAConnection({
        otaCode: selectedOTA?.code,
        credentials: {
          username: credentials.username,
          apiKey: credentials.apiKey,
          hotelId: credentials.hotelId,
        },
      });
      setTestResult({
        success: result.success,
        message: result.message || (result.success
          ? 'Connection successful! Your credentials are valid.'
          : 'Connection failed. Please check your credentials and try again.'),
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.response?.data?.detail || err.message || 'Connection failed. Please check your credentials and try again.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      const result = await channelManagerService.createOTA({
        name: selectedOTA?.name,
        code: selectedOTA?.code,
        credentials: {
          username: credentials.username,
          apiKey: credentials.apiKey,
          hotelId: credentials.hotelId,
        },
      });

      onConnect({
        ...selectedOTA,
        ...result,
        credentials: {
          username: credentials.username,
          apiKey: credentials.apiKey,
          hotelId: credentials.hotelId,
        },
      });

      toast.success(`Successfully connected to ${selectedOTA?.name}`);
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err.message || `Failed to connect to ${selectedOTA?.name}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedOTA(null);
    setCredentials({ username: '', apiKey: '', hotelId: '' });
    setTestResult(null);
    setShowApiKey(false);
    setSearchQuery('');
    onClose();
  };

  const handleRequestIntegration = () => {
    // Open email or contact form for requesting new integration
    window.open('mailto:integrations@glimmora.com?subject=New OTA Integration Request&body=Please describe the OTA platform you would like to integrate with:', '_blank');
    toast.info('Opening email client to submit integration request...');
  };

  const isFormValid = credentials.username && credentials.apiKey && credentials.hotelId;

  // BUG-009 FIX: Clear failed test result when credentials change so Connect button re-enables
  const handleCredentialChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear failed test result when user edits credentials
    if (testResult && !testResult.success) {
      setTestResult(null);
    }
  };

  const getTitle = () => {
    if (step === 1) return 'Add OTA Connection';
    return `Connect to ${selectedOTA?.name}`;
  };

  const getSubtitle = () => {
    if (step === 1) return 'Select an OTA platform to connect';
    return 'Enter your API credentials to establish connection';
  };

  const renderFooter = () => {
    if (step === 1) {
      return (
        <div className="flex items-center justify-end w-full">
          <Button variant="ghost" onClick={handleClose} className="px-5 py-2 text-[13px] font-semibold">
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-end gap-3 w-full">
        <Button variant="ghost" onClick={() => { setStep(1); setSearchQuery(''); }} className="px-5 py-2 text-[13px] font-semibold">
          Back
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
          onClick={handleConnect}
          disabled={!isFormValid || (testResult && !testResult.success)}
          loading={isConnecting}
          className="px-5 py-2 text-[13px] font-semibold"
        >
          Connect
        </Button>
      </div>
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      subtitle={getSubtitle()}
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      {step === 1 ? (
        /* Step 1: Select OTA */
        <div className="space-y-5">
          {availableToConnect.length === 0 ? (
            /* All Connected State */
            <div className="text-center py-6">
              {/* Success Icon */}
              <div className="w-16 h-16 rounded-xl bg-sage-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-sage-600" />
              </div>

              {/* Message */}
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                All Channels Connected!
              </h3>
              <p className="text-[13px] text-neutral-500 mb-6 max-w-sm mx-auto">
                Great job! You've connected all available OTA platforms. Your inventory is being distributed across all channels.
              </p>

              {/* Connected OTAs Summary */}
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">
                  Connected Platforms ({existingConnections.length})
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {existingConnections.map(conn => (
                    <div
                      key={conn.code}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: `${conn.color}15` }}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: conn.color }}
                      >
                        {conn.name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <span className="text-[13px] font-medium text-neutral-700">
                        {conn.name || 'Unknown'}
                      </span>
                      <CheckCircle className="w-3.5 h-3.5 text-sage-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* OTA Selection Grid */
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search OTA platforms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-lg text-sm bg-neutral-50 border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 focus:bg-white transition-all"
                />
              </div>

              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
                Available Platforms ({filteredOTAs.length})
              </h4>

              {filteredOTAs.length === 0 ? (
                /* No Results State */
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                    No platforms found
                  </h3>
                  <p className="text-[12px] text-neutral-500 mb-4">
                    Can't find "{searchQuery}"? Request a new integration below.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filteredOTAs.map(ota => (
                    <button
                      key={ota.code}
                      onClick={() => handleSelectOTA(ota)}
                      className="flex flex-col items-center gap-3 p-4 border border-neutral-200 rounded-lg transition-all duration-200 group hover:border-terra-300 hover:bg-terra-50/30"
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: ota.color || '#A57865' }}
                      >
                        {ota.name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-neutral-900">
                          {ota.name || 'Unknown'}
                        </h3>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Click to connect
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Request New Integration */}
              <div className="pt-4 border-t border-neutral-100">
                <button
                  onClick={handleRequestIntegration}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-neutral-200 rounded-lg text-neutral-600 hover:border-terra-300 hover:text-terra-600 hover:bg-terra-50/30 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Request New OTA Integration</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
                <p className="text-[11px] text-neutral-400 text-center mt-2">
                  Don't see your preferred OTA? Submit a request and we'll work on adding it.
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Step 2: Enter Credentials */
        <div className="space-y-5">
          {/* Selected OTA Info */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: selectedOTA?.color || '#A57865' }}
            >
              {selectedOTA?.name?.substring(0, 2).toUpperCase() || '??'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {selectedOTA?.name || 'Unknown'}
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                {selectedOTA?.description || ''}
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
                onChange={(e) => handleCredentialChange('hotelId', e.target.value)}
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
                onChange={(e) => handleCredentialChange('username', e.target.value)}
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
                  onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
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
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1 ${
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
        </div>
      )}
    </Drawer>
  );
}
