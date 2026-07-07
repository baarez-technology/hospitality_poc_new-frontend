import { useState, useEffect } from 'react';
import { Palette, Upload, Check, Type, Square, Circle } from 'lucide-react';
import { FONT_FAMILIES, defaultSettings, deepMerge } from '@/utils/admin/settings';

const STORAGE_KEY = 'glimmora_branding';

const PRIMARY_COLORS = [
  '#A57865', '#4E5840', '#5C9BA4', '#CDB261',
  // '#C8B29D',
];

const ACCENT_COLORS = [
  '#8E6554', '#3D4731', '#4A8A99', '#B5A051',
  // '#B09D8A',
];

const BUTTON_STYLES = [
  { value: 'rounded', label: 'Rounded', preview: 'rounded-lg' },
  { value: 'pill', label: 'Pill', preview: 'rounded-full' },
  { value: 'square', label: 'Square', preview: 'rounded-none' }
];

export default function BrandingTab() {
  const [branding, setBranding] = useState(defaultSettings.branding);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBranding(deepMerge(defaultSettings.branding, parsed));
      } catch (e) {
        console.error('Error parsing branding from localStorage:', e);
      }
    }
  }, []);

  const saveBranding = (newBranding) => {
    setBranding(newBranding);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBranding));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key, value) => {
    saveBranding({ ...branding, [key]: value });
  };

  const handleLogoUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(type, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Branding & Theme</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Customize the look and feel of your dashboard
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[#4E5840]/10 text-[#4E5840] rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Colors */}
          <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#A57865]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Colors</h2>
                <p className="text-sm text-neutral-500">Brand colors for the interface</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Primary Color
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 flex-wrap">
                    {PRIMARY_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleChange('primaryColor', color)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          branding.primaryColor === color
                            ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="w-24 px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Accent Color
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2 flex-wrap">
                    {ACCENT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleChange('accentColor', color)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          branding.accentColor === color
                            ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.accentColor}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={branding.accentColor}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      className="w-24 px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar BG */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Sidebar Background
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {['#FAF7F4', '#FFFFFF', '#F5F5F5', '#F0EDE8', '#E8E4DF'].map((color) => (
                      <button
                        key={color}
                        onClick={() => handleChange('sidebarBg', color)}
                        className={`w-10 h-10 rounded-lg border transition-all ${
                          branding.sidebarBg === color
                            ? 'ring-2 ring-offset-2 ring-neutral-400 scale-110 border-neutral-300'
                            : 'border-neutral-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.sidebarBg}
                      onChange={(e) => handleChange('sidebarBg', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={branding.sidebarBg}
                      onChange={(e) => handleChange('sidebarBg', e.target.value)}
                      className="w-24 px-3 py-2 rounded-lg border border-[#E5E5E5] text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Typography & Buttons */}
          <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#5C9BA4]/10 flex items-center justify-center">
                <Type className="w-5 h-5 text-[#5C9BA4]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Typography & Style</h2>
                <p className="text-sm text-neutral-500">Font and button styling</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Font Family
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {FONT_FAMILIES.map((font) => (
                    <button
                      key={font.value}
                      onClick={() => handleChange('fontFamily', font.value)}
                      className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                        branding.fontFamily === font.value
                          ? 'border-[#A57865] bg-[#A57865]/5'
                          : 'border-[#E5E5E5] hover:border-neutral-300'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <span className="font-medium">{font.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Style */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Button Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {BUTTON_STYLES.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => handleChange('buttonStyle', style.value)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        branding.buttonStyle === style.value
                          ? 'border-[#A57865] bg-[#A57865]/5'
                          : 'border-[#E5E5E5] hover:border-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-full h-10 ${style.preview}`}
                        style={{ backgroundColor: branding.primaryColor }}
                      />
                      <p className="text-sm text-neutral-600 mt-2">{style.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Logo & Favicon */}
          <section className="bg-white border border-[#E5E5E5] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#CDB261]/10 flex items-center justify-center">
                <Square className="w-5 h-5 text-[#CDB261]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-neutral-900">Logo & Favicon</h2>
                <p className="text-sm text-neutral-500">Upload brand assets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl border-2 border-dashed border-[#E5E5E5] flex items-center justify-center bg-[#FAF7F4] overflow-hidden">
                    {branding.logo ? (
                      <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <Square className="w-8 h-8 text-neutral-300" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF7F4] text-neutral-700 hover:bg-[#A57865]/10 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-neutral-400 mt-1">200x200px recommended</p>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Favicon
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg border-2 border-dashed border-[#E5E5E5] flex items-center justify-center bg-[#FAF7F4] overflow-hidden">
                    {branding.favicon ? (
                      <img src={branding.favicon} alt="Favicon" className="w-full h-full object-contain" />
                    ) : (
                      <Circle className="w-6 h-6 text-neutral-300" />
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FAF7F4] text-neutral-700 hover:bg-[#A57865]/10 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-medium">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'favicon')}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-neutral-400 mt-1">32x32px .ico or .png</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <section className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#E5E5E5]">
                <h3 className="font-semibold text-neutral-900">Live Preview</h3>
              </div>

              <div className="p-4">
                {/* Mini Sidebar Preview */}
                <div
                  className="rounded-lg p-3 mb-4"
                  style={{ backgroundColor: branding.sidebarBg }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {branding.logo ? (
                        <img src={branding.logo} alt="Logo" className="w-6 h-6 object-contain" />
                      ) : (
                        <span className="text-white text-xs font-bold">G</span>
                      )}
                    </div>
                    <span
                      className="font-semibold text-sm"
                      style={{ fontFamily: branding.fontFamily }}
                    >
                      Glimmora
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="px-2 py-1.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Dashboard
                    </div>
                    <div className="px-2 py-1.5 rounded text-xs text-neutral-600">
                      Bookings
                    </div>
                    <div className="px-2 py-1.5 rounded text-xs text-neutral-600">
                      Settings
                    </div>
                  </div>
                </div>

                {/* Button Preview */}
                <div className="space-y-3">
                  <p
                    className="text-sm font-medium"
                    style={{ fontFamily: branding.fontFamily }}
                  >
                    Button styles
                  </p>
                  <div className="flex gap-2">
                    <button
                      className={`px-4 py-2 text-white text-sm font-medium ${
                        branding.buttonStyle === 'rounded'
                          ? 'rounded-lg'
                          : branding.buttonStyle === 'pill'
                          ? 'rounded-full'
                          : 'rounded-none'
                      }`}
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Primary
                    </button>
                    <button
                      className={`px-4 py-2 text-white text-sm font-medium ${
                        branding.buttonStyle === 'rounded'
                          ? 'rounded-lg'
                          : branding.buttonStyle === 'pill'
                          ? 'rounded-full'
                          : 'rounded-none'
                      }`}
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      Accent
                    </button>
                  </div>
                </div>

                {/* Text Preview */}
                <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                  <p
                    className="text-lg font-semibold text-neutral-900"
                    style={{ fontFamily: branding.fontFamily }}
                  >
                    Heading Text
                  </p>
                  <p
                    className="text-sm text-neutral-500"
                    style={{ fontFamily: branding.fontFamily }}
                  >
                    Body text preview with your selected font family.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
