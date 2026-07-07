import { useState, useEffect, useMemo } from 'react';
import { Upload, Check, AlertCircle, Globe, Landmark, Building2, QrCode, CreditCard, Trash2, Printer } from 'lucide-react';
import { PAPER_SIZE_OPTIONS, ORIENTATION_OPTIONS, MARGIN_OPTIONS } from '../../utils/printSettings';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { TIMEZONES, CURRENCIES } from '../../utils/settings';
import { Button } from '../ui2/Button';
import { SelectDropdown } from '../ui2/Input';
import { SearchableSelect } from '../ui2/SearchableSelect';
import { Country, State, City } from 'country-state-city';
import { hotelSettingsService } from '../../api/services/hotel-settings.service';
import toast from 'react-hot-toast';

export default function HotelInfoTab() {
  const { generalSettings, updateGeneralSettings, updateContactInfo, updateAddress, setCurrency, setTimezone, setHotelName, updateBranding, updatePaymentSettings, updatePrintSettings } = useSettingsContext();

  const [form, setForm] = useState({
    hotelName: '',
    address: { street: '', city: '', state: '', zip: '', country: '' },
    timezone: '',
    currency: '',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logo: null as string | null,
    gstin: '',
    // Payment Settings
    upiEnabled: false,
    upiId: '',
    upiQrImage: null as string | null,
    upiDisplayName: '',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankAccountHolder: '',
    // Print & Preview Settings
    printPaperSize: 'A4',
    printOrientation: 'portrait',
    printMargin: 'normal'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [gstinSaving, setGstinSaving] = useState(false);
  const [gstinSaved, setGstinSaved] = useState(false);

  useEffect(() => {
    if (generalSettings) {
      setForm({
        hotelName: generalSettings.hotelName || '',
        address: generalSettings.address || { street: '', city: '', state: '', zip: '', country: '' },
        timezone: generalSettings.timezone || 'Asia/Kolkata',
        currency: generalSettings.currency || 'INR',
        checkInTime: generalSettings.checkInTime || '14:00',
        checkOutTime: generalSettings.checkOutTime || '11:00',
        contactEmail: generalSettings.contactEmail || '',
        contactPhone: generalSettings.contactPhone || '',
        website: generalSettings.website || '',
        logo: generalSettings.branding?.logo || null,
        gstin: generalSettings.gstin || '',
        // Payment Settings
        upiEnabled: generalSettings.paymentSettings?.upiEnabled || false,
        upiId: generalSettings.paymentSettings?.upiId || '',
        upiQrImage: generalSettings.paymentSettings?.upiQrImage || null,
        upiDisplayName: generalSettings.paymentSettings?.upiDisplayName || '',
        bankName: generalSettings.paymentSettings?.bankName || '',
        bankAccountNumber: generalSettings.paymentSettings?.bankAccountNumber || '',
        bankIfsc: generalSettings.paymentSettings?.bankIfsc || '',
        bankAccountHolder: generalSettings.paymentSettings?.bankAccountHolder || '',
        // Print & Preview Settings
        printPaperSize: generalSettings.printSettings?.paperSize || 'A4',
        printOrientation: generalSettings.printSettings?.orientation || 'portrait',
        printMargin: generalSettings.printSettings?.margin || 'normal'
      });
    }
  }, [generalSettings]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setSaved(false);
  };

  const handleAddressChange = (field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
    setSaved(false);
  };

  const countryOptions = useMemo(
    () => Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name })),
    []
  );
  const stateOptions = useMemo(
    () => form.address.country ? State.getStatesOfCountry(form.address.country).map((s) => ({ value: s.isoCode, label: s.name })) : [],
    [form.address.country]
  );
  const cityOptions = useMemo(
    () => (form.address.country && form.address.state) ? City.getCitiesOfState(form.address.country, form.address.state).map((c) => ({ value: c.name, label: c.name })) : [],
    [form.address.country, form.address.state]
  );

  // Print preview helpers
  const isThermal = form.printPaperSize === '80mm' || form.printPaperSize === '58mm';
  const previewDims = (() => {
    // Aspect ratios for a small visual swatch (width x height in px).
    if (form.printPaperSize === '80mm') return { w: 40, h: 96 };
    if (form.printPaperSize === '58mm') return { w: 30, h: 96 };
    // Standard sheets ~ 1:1.41 (A-series) / 1:1.29 (Letter/Legal)
    const portrait = { w: 64, h: 90 };
    const landscape = { w: 90, h: 64 };
    return form.printOrientation === 'landscape' ? landscape : portrait;
  })();
  const previewPadding = form.printMargin === 'none'
    ? 0
    : form.printMargin === 'narrow'
      ? 3
      : form.printMargin === 'wide'
        ? 9
        : 6;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.hotelName.trim()) newErrors.hotelName = 'Hotel name is required';
    if (!form.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }
    if (!form.contactPhone.trim()) newErrors.contactPhone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    setHotelName(form.hotelName);
    updateContactInfo({
      email: form.contactEmail,
      phone: form.contactPhone,
      website: form.website
    });
    updateAddress(form.address);
    setCurrency(form.currency);
    setTimezone(form.timezone);
    updateGeneralSettings({
      checkInTime: form.checkInTime,
      checkOutTime: form.checkOutTime,
      gstin: form.gstin.trim().toUpperCase()
    });

    // Save the logo to branding settings
    if (form.logo) {
      updateBranding({ logo: form.logo });
    }

    // Save payment settings
    if (updatePaymentSettings) {
      updatePaymentSettings({
        upiEnabled: form.upiEnabled,
        upiId: form.upiId,
        upiQrImage: form.upiQrImage,
        upiDisplayName: form.upiDisplayName,
        bankName: form.bankName,
        bankAccountNumber: form.bankAccountNumber,
        bankIfsc: form.bankIfsc,
        bankAccountHolder: form.bankAccountHolder
      });
    }

    // Save print & preview settings
    if (updatePrintSettings) {
      updatePrintSettings({
        paperSize: form.printPaperSize,
        orientation: form.printOrientation,
        margin: form.printMargin
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Validate Indian GSTIN: 2-digit state + 10-char PAN + 1 entity + Z + check
  const isValidGstin = (val: string) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(val);

  const handleUpdateGstin = async () => {
    const value = form.gstin.trim().toUpperCase();
    if (value && !isValidGstin(value)) {
      setErrors(prev => ({ ...prev, gstin: 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)' }));
      return;
    }
    setErrors(prev => ({ ...prev, gstin: '' }));
    setGstinSaving(true);
    try {
      await hotelSettingsService.updateSettings({ gstin: value || null });
      // Sync context so bills/invoices pick up the new value without a refetch.
      updateGeneralSettings({ gstin: value });
      setGstinSaved(true);
      toast.success('GSTIN updated');
      setTimeout(() => setGstinSaved(false), 3000);
    } catch (err) {
      console.error('[HotelInfoTab] Failed to update GSTIN:', err);
      toast.error('Failed to update GSTIN');
    } finally {
      setGstinSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('upiQrImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
        <div>
          <h2 className="text-[14px] sm:text-[15px] font-semibold text-neutral-900">Hotel Information</h2>
          <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-0.5">Basic information about your property</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-[12px] sm:text-[13px] font-medium text-sage-600">
              <Check className="w-4 h-4" />
              Saved
            </span>
          )}
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <section>
        <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">
              Hotel Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.hotelName}
              onChange={(e) => handleChange('hotelName', e.target.value)}
              className={`w-full h-10 px-3 rounded-lg border text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-terra-500/20 ${
                errors.hotelName ? 'border-rose-300 focus:border-rose-500' : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-500'
              }`}
              placeholder="Enter hotel name"
            />
            {errors.hotelName && (
              <p className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.hotelName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Timezone</label>
            <SelectDropdown
              value={form.timezone}
              onChange={(value) => handleChange('timezone', value)}
              options={TIMEZONES}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Currency</label>
            <SelectDropdown
              value={form.currency}
              onChange={(value) => handleChange('currency', value)}
              options={CURRENCIES}
              size="lg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Hotel Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg border border-neutral-200 flex items-center justify-center bg-neutral-50 overflow-hidden">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl text-neutral-300 font-medium">H</span>
                )}
              </div>
              <div>
                <label className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors text-[13px] font-medium">
                  <Upload className="w-4 h-4" />
                  Upload
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-neutral-400 mt-1.5">PNG, JPG up to 2MB</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Street Address</label>
            <input
              type="text"
              value={form.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
              placeholder="123 Luxury Lane"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Country</label>
            <SearchableSelect
              options={countryOptions}
              value={form.address.country}
              onChange={(val) => {
                handleAddressChange('country', val);
                handleAddressChange('state', '');
                handleAddressChange('city', '');
              }}
              placeholder="Select Country"
              icon={Globe}
              searchable
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">State / Province</label>
            {stateOptions.length > 0 ? (
              <SearchableSelect
                options={stateOptions}
                value={form.address.state}
                onChange={(val) => {
                  handleAddressChange('state', val);
                  handleAddressChange('city', '');
                }}
                placeholder="Select State"
                icon={Landmark}
                disabled={!form.address.country}
                searchable
              />
            ) : (
              <input
                type="text"
                value={form.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
                placeholder={form.address.country ? 'Enter state' : 'Select country first'}
                disabled={!form.address.country}
              />
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">City</label>
            {cityOptions.length > 0 ? (
              <SearchableSelect
                options={cityOptions}
                value={form.address.city}
                onChange={(val) => handleAddressChange('city', val)}
                placeholder="Select City"
                icon={Building2}
                disabled={!form.address.state}
                searchable
              />
            ) : (
              <input
                type="text"
                value={form.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
                placeholder={form.address.state ? 'Enter city' : 'Select state first'}
                disabled={!form.address.country}
              />
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Postal Code</label>
            <input
              type="text"
              value={form.address.zip}
              onChange={(e) => handleAddressChange('zip', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
              placeholder="400001"
            />
          </div>
        </div>
      </section>

      {/* Operating Hours */}
      <section>
        <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Operating Hours</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Check-in Time</label>
            <input
              type="time"
              value={form.checkInTime}
              onChange={(e) => handleChange('checkInTime', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Check-out Time</label>
            <input
              type="time"
              value={form.checkOutTime}
              onChange={(e) => handleChange('checkOutTime', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <h3 className="text-[13px] font-semibold text-neutral-800 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className={`w-full h-10 px-3 rounded-lg border text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-terra-500/20 ${
                errors.contactEmail ? 'border-rose-300 focus:border-rose-500' : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-500'
              }`}
              placeholder="info@hotel.com"
            />
            {errors.contactEmail && (
              <p className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.contactEmail}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={form.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className={`w-full h-10 px-3 rounded-lg border text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-terra-500/20 ${
                errors.contactPhone ? 'border-rose-300 focus:border-rose-500' : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-500'
              }`}
              placeholder="+91 22 1234 5678"
            />
            {errors.contactPhone && (
              <p className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.contactPhone}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => handleChange('website', e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
              placeholder="https://www.hotel.com"
            />
          </div>
        </div>
      </section>

      {/* Tax Information */}
      <section>
        <h3 className="text-[13px] font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Landmark className="w-4 h-4" />
          Tax Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">
              GSTIN (GST Identification Number)
            </label>
            <div className="flex items-stretch gap-2">
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                maxLength={15}
                className={`flex-1 h-10 px-3 rounded-lg border text-[13px] text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-terra-500/20 font-mono ${
                  errors.gstin ? 'border-rose-300 focus:border-rose-500' : 'border-neutral-200 hover:border-neutral-300 focus:border-terra-500'
                }`}
                placeholder="22AAAAA0000A1Z5"
              />
              <Button
                variant="primary"
                onClick={handleUpdateGstin}
                disabled={gstinSaving}
                className="h-10 px-4 whitespace-nowrap"
              >
                {gstinSaving ? 'Updating...' : gstinSaved ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="w-4 h-4" /> Updated
                  </span>
                ) : 'Update'}
              </Button>
            </div>
            {errors.gstin ? (
              <p className="mt-1.5 text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.gstin}
              </p>
            ) : (
              <p className="text-[11px] text-neutral-400 mt-1.5">
                15-character GST Identification Number shown on all bills and invoices.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Payment Settings */}
      <section>
        <h3 className="text-[13px] font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Payment Settings
        </h3>

        {/* UPI Settings */}
        <div className="bg-neutral-50 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-terra-600" />
              <h4 className="text-[13px] font-semibold text-neutral-800">UPI Payment</h4>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.upiEnabled}
                onChange={(e) => setForm(prev => ({ ...prev, upiEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-terra-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terra-600"></div>
              <span className="ml-2 text-[12px] font-medium text-neutral-600">
                {form.upiEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          {form.upiEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">UPI ID (VPA)</label>
                <input
                  type="text"
                  value={form.upiId}
                  onChange={(e) => handleChange('upiId', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
                  placeholder="hotelname@upi"
                />
                <p className="text-[11px] text-neutral-400 mt-1">e.g., yourhotel@okicici, hotel@paytm</p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={form.upiDisplayName}
                  onChange={(e) => handleChange('upiDisplayName', e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
                  placeholder="Hotel Name"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Name shown on payment screen</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">UPI QR Code</label>
                <div className="flex items-start gap-4">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center bg-white overflow-hidden">
                    {form.upiQrImage ? (
                      <img src={form.upiQrImage} alt="UPI QR" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center">
                        <QrCode className="w-8 h-8 text-neutral-300 mx-auto" />
                        <p className="text-[10px] text-neutral-400 mt-1">No QR uploaded</p>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 cursor-pointer transition-colors text-[13px] font-medium">
                      <Upload className="w-4 h-4" />
                      Upload QR Code
                      <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-neutral-400 mt-2">Upload your UPI payment QR code image (PNG, JPG)</p>
                    {form.upiQrImage && (
                      <button
                        onClick={() => handleChange('upiQrImage', '')}
                        className="mt-2 inline-flex items-center gap-1 text-[12px] text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove QR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bank Details */}
        <div className="bg-neutral-50 rounded-xl p-5">
          <h4 className="text-[13px] font-semibold text-neutral-800 mb-4">Bank Details (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Bank Name</label>
              <input
                type="text"
                value={form.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
                placeholder="HDFC Bank"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Account Holder Name</label>
              <input
                type="text"
                value={form.bankAccountHolder}
                onChange={(e) => handleChange('bankAccountHolder', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
                placeholder="Hotel Name Pvt Ltd"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Account Number</label>
              <input
                type="text"
                value={form.bankAccountNumber}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
                placeholder="1234567890"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">IFSC Code</label>
              <input
                type="text"
                value={form.bankIfsc}
                onChange={(e) => handleChange('bankIfsc', e.target.value.toUpperCase())}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:outline-none focus:ring-2 focus:ring-terra-500/20 transition-colors"
                placeholder="HDFC0001234"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Print & Preview Settings */}
      <section>
        <h3 className="text-[13px] font-semibold text-neutral-800 mb-1 flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print &amp; Preview
        </h3>
        <p className="text-[12px] text-neutral-500 mb-4">
          Paper size, orientation and margins applied when printing bills, folios, invoices and POS receipts.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Paper Size</label>
            <SelectDropdown
              value={form.printPaperSize}
              onChange={(value) => handleChange('printPaperSize', value)}
              options={PAPER_SIZE_OPTIONS}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Orientation</label>
            <SelectDropdown
              value={isThermal ? 'portrait' : form.printOrientation}
              onChange={(value) => handleChange('printOrientation', value)}
              options={ORIENTATION_OPTIONS}
              size="lg"
              disabled={isThermal}
            />
            {isThermal && (
              <p className="text-[11px] text-neutral-400 mt-1.5">
                Thermal receipts use a continuous roll — orientation does not apply.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Margins</label>
            <SelectDropdown
              value={form.printMargin}
              onChange={(value) => handleChange('printMargin', value)}
              options={MARGIN_OPTIONS}
              size="lg"
            />
          </div>
        </div>

        {/* Live preview */}
        <div className="mt-5 flex items-center gap-4 bg-neutral-50 rounded-xl p-5">
          <div className="flex items-center justify-center w-28 h-28 flex-shrink-0">
            <div
              className="bg-white border border-neutral-300 shadow-sm rounded-sm"
              style={{
                width: previewDims.w,
                height: previewDims.h,
                padding: previewPadding
              }}
            >
              <div className="w-full h-full border border-dashed border-neutral-200 rounded-[2px]" />
            </div>
          </div>
          <div className="text-[12px] text-neutral-600 leading-relaxed">
            <p className="font-medium text-neutral-800 text-[13px] mb-0.5">Preview</p>
            <p>
              {PAPER_SIZE_OPTIONS.find((o) => o.value === form.printPaperSize)?.label || form.printPaperSize}
            </p>
            <p className="capitalize">
              {isThermal ? 'Continuous roll' : `${form.printOrientation} · ${form.printMargin} margins`}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
