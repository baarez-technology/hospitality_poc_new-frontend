import React, { useState, useEffect } from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useToast } from '../../../contexts/ToastContext';
import FormSection, { FormField } from '../../../components/settings/FormSection';
import { Upload, Save } from 'lucide-react';
import { Button } from '@/components/ui2/Button';

/**
 * General Settings Page
 * Hotel profile, contact, timezone, currency, branding
 */
export default function GeneralSettings() {
  const { generalSettings, updateGeneralSettings } = useSettingsContext();
  const { success } = useToast();

  const [settings, setSettings] = useState(generalSettings);

  // Sync with context when it loads
  useEffect(() => {
    setSettings(generalSettings);
  }, [generalSettings]);

  const handleSave = () => {
    updateGeneralSettings(settings);
    success('General settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* Hotel Profile */}
      <FormSection
        title="Hotel Profile"
        description="Basic information about your hotel"
        actions={
          <Button variant="primary" icon={Save} onClick={handleSave}>
            Save Changes
          </Button>
        }
      >
        <FormField label="Hotel Name" required>
          <input
            type="text"
            value={settings.hotelName || ''}
            onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
          />
        </FormField>

        <FormField label="Tagline" description="Short description of your hotel">
          <input
            type="text"
            value={settings.tagline || ''}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
            placeholder="Your Luxury Escape"
          />
        </FormField>

        <FormField label="Hotel Logo" description="Upload your hotel logo (PNG, JPG, max 2MB)">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
              <Upload className="w-8 h-8 text-neutral-400" />
            </div>
            <button className="px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors">
              Upload Logo
            </button>
          </div>
        </FormField>
      </FormSection>

      {/* Regional Settings */}
      <FormSection
        title="Regional Settings"
        description="Timezone, currency, and language preferences"
      >
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Timezone" required>
            <select
              value={settings.timezone || 'America/New_York'}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </FormField>

          <FormField label="Default Currency" required>
            <select
              value={settings.currency || 'INR'}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
            >
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </FormField>

          <FormField label="Language" required>
            <select
              value={settings.language || 'en'}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </FormField>
        </div>
      </FormSection>

      {/* Contact Information */}
      <FormSection
        title="Contact Information"
        description="Primary contact details for your property"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Contact Email" required>
            <input
              type="email"
              value={settings.contactEmail || ''}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
              placeholder="contact@glimmora.com"
            />
          </FormField>

          <FormField label="Contact Phone" required>
            <input
              type="tel"
              value={settings.contactPhone || ''}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
              placeholder="+1 (555) 123-4567"
            />
          </FormField>
        </div>

        <FormField label="Website">
          <input
            type="url"
            value={settings.website || ''}
            onChange={(e) => setSettings({ ...settings, website: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
            placeholder="https://glimmora.com"
          />
        </FormField>
      </FormSection>

      {/* Address */}
      <FormSection
        title="Hotel Address"
        description="Physical location of your property"
      >
        <FormField label="Street Address" required>
          <input
            type="text"
            value={settings.address?.street || ''}
            onChange={(e) =>
              setSettings({
                ...settings,
                address: { ...settings.address, street: e.target.value }
              })
            }
            className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
            placeholder="123 Luxury Avenue"
          />
        </FormField>

        <div className="grid grid-cols-4 gap-4">
          <FormField label="City" required>
            <input
              type="text"
              value={settings.address?.city || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  address: { ...settings.address, city: e.target.value }
                })
              }
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
              placeholder="New York"
            />
          </FormField>

          <FormField label="State/Province" required>
            <input
              type="text"
              value={settings.address?.state || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  address: { ...settings.address, state: e.target.value }
                })
              }
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
              placeholder="NY"
            />
          </FormField>

          <FormField label="ZIP/Postal Code" required>
            <input
              type="text"
              value={settings.address?.zip || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  address: { ...settings.address, zip: e.target.value }
                })
              }
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
              placeholder="10001"
            />
          </FormField>

          <FormField label="Country" required>
            <input
              type="text"
              value={settings.address?.country || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  address: { ...settings.address, country: e.target.value }
                })
              }
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400"
              placeholder="United States"
            />
          </FormField>
        </div>
      </FormSection>

      {/* Brand Colors */}
      <FormSection
        title="Brand Colors"
        description="Customize your brand identity"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Primary Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.branding?.primaryColor || '#8B5CF6'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, primaryColor: e.target.value }
                  })
                }
                className="w-16 h-12 rounded-lg border border-neutral-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.branding?.primaryColor || '#8B5CF6'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, primaryColor: e.target.value }
                  })
                }
                className="flex-1 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400 font-mono text-sm"
              />
            </div>
          </FormField>

          <FormField label="Secondary Color">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.branding?.secondaryColor || '#EC4899'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, secondaryColor: e.target.value }
                  })
                }
                className="w-16 h-12 rounded-lg border border-neutral-200 cursor-pointer"
              />
              <input
                type="text"
                value={settings.branding?.secondaryColor || '#EC4899'}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    branding: { ...settings.branding, secondaryColor: e.target.value }
                  })
                }
                className="flex-1 px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-terra-500/30 focus:border-terra-400 font-mono text-sm"
              />
            </div>
          </FormField>
        </div>
      </FormSection>
    </div>
  );
}
