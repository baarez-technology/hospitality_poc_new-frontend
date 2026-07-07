import { useState, useEffect, useMemo } from 'react';
import { Building2, MapPin, Clock, Mail, Phone, Globe, Upload, Check, AlertCircle, Landmark } from 'lucide-react';
import { useSettingsContext } from '@/contexts/SettingsContext';
import { TIMEZONES, CURRENCIES } from '@/utils/admin/settings';
import { SearchableSelect } from '@/components/ui2/SearchableSelect';
import { Country, State, City } from 'country-state-city';

export default function HotelInfoTab() {
  const { generalSettings, updateGeneralSettings, updateContactInfo, updateAddress, setCurrency, setTimezone, setHotelName } = useSettingsContext();

  const [form, setForm] = useState({
    hotelName: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: ''
    },
    timezone: '',
    currency: '',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    contactEmail: '',
    contactPhone: '',
    website: '',
    gstin: '',
    logo: null
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (generalSettings) {
      setForm({
        hotelName: generalSettings.hotelName || '',
        address: generalSettings.address || {
          street: '',
          city: '',
          state: '',
          zip: '',
          country: ''
        },
        timezone: generalSettings.timezone || 'Asia/Kolkata',
        currency: generalSettings.currency || 'INR',
        checkInTime: generalSettings.checkInTime || '14:00',
        checkOutTime: generalSettings.checkOutTime || '11:00',
        contactEmail: generalSettings.contactEmail || '',
        contactPhone: generalSettings.contactPhone || '',
        website: generalSettings.website || '',
        gstin: generalSettings.gstin || '',
        logo: generalSettings.branding?.logo || null
      });
    }
  }, [generalSettings]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setSaved(false);
  };

  const handleAddressChange = (field, value) => {
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

  const validate = () => {
    const newErrors = {};
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
      gstin: form.gstin
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Hotel Information</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Basic information about your property
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
            saved
              ? 'bg-[#4E5840] text-white'
              : 'bg-[#A57865] text-white hover:bg-[#8E6554]'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saved ? 'Saved' : 'Save Changes'}
        </button>
      </div>

      {/* Form Sections */}
      <div className="space-y-8">
        {/* Basic Info */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Basic Information</h2>
              <p className="text-sm text-neutral-500">Hotel name and branding</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Hotel Name *
              </label>
              <input
                type="text"
                value={form.hotelName}
                onChange={(e) => handleChange('hotelName', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.hotelName ? 'border-red-400' : 'border-[#E5E5E5]'
                } focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]`}
                placeholder="Enter hotel name"
              />
              {errors.hotelName && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.hotelName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Timezone
              </label>
              <select
                value={form.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] bg-white"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Logo Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Hotel Logo
              </label>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#E5E5E5] flex items-center justify-center bg-[#FAF7F4] overflow-hidden">
                  {form.logo ? (
                    <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-neutral-400" />
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF7F4] text-neutral-700 hover:bg-[#A57865]/10 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-neutral-400 mt-2">
                    PNG, JPG up to 2MB. Recommended: 200x200px
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#5C9BA4]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Address</h2>
              <p className="text-sm text-neutral-500">Property location details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={form.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                placeholder="123 Luxury Lane"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Country
              </label>
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
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                State / Province
              </label>
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
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder={form.address.country ? 'Enter state' : 'Select country first'}
                  disabled={!form.address.country}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                City
              </label>
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
                  className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder={form.address.state ? 'Enter city' : 'Select state first'}
                  disabled={!form.address.country}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={form.address.zip}
                onChange={(e) => handleAddressChange('zip', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                placeholder="400001"
              />
            </div>
          </div>
        </section>

        {/* Check-in/out Times */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#CDB261]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Check-in / Check-out</h2>
              <p className="text-sm text-neutral-500">Default times for guests</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Check-in Time
              </label>
              <input
                type="time"
                value={form.checkInTime}
                onChange={(e) => handleChange('checkInTime', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Check-out Time
              </label>
              <input
                type="time"
                value={form.checkOutTime}
                onChange={(e) => handleChange('checkOutTime', e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
              />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#4E5840]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Contact Information</h2>
              <p className="text-sm text-neutral-500">How guests can reach you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    errors.contactEmail ? 'border-red-400' : 'border-[#E5E5E5]'
                  } focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]`}
                  placeholder="info@hotel.com"
                />
              </div>
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.contactEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border ${
                    errors.contactPhone ? 'border-red-400' : 'border-[#E5E5E5]'
                  } focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]`}
                  placeholder="+91 22 1234 5678"
                />
              </div>
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.contactPhone}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865]"
                  placeholder="https://www.hotel.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tax Information */}
        <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-[#A57865]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Tax Information</h2>
              <p className="text-sm text-neutral-500">GST registration details for invoices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                GSTIN (GST Identification Number)
              </label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-lg border border-[#E5E5E5] focus:outline-none focus:ring-2 focus:ring-[#A57865]/20 focus:border-[#A57865] font-mono"
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
              <p className="text-xs text-neutral-400 mt-1">
                15-character GST Identification Number (shown on all bills and invoices)
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
