import { useState, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { FONT_FAMILIES, defaultSettings, deepMerge } from '../../utils/settings';
import { Button } from '../ui2/Button';

const STORAGE_KEY = 'glimmora_branding';

const PRIMARY_COLORS = [
  '#A57865', '#4E5840', '#5C9BA4', '#CDB261',
  // '#C8B29D',
  // '#8B5CF6', '#EC4899', '#F97316', '#14B8A6', '#6366F1'
];

const ACCENT_COLORS = [
  '#8E6554', '#3D4731', '#4A8A99', '#B5A051',
  // '#B09D8A',
  // '#7C3AED', '#DB2777', '#EA580C', '#0D9488', '#4F46E5'
];

const BUTTON_STYLES = [
  { value: 'rounded', label: 'Rounded', preview: 'rounded-lg' },
  { value: 'pill', label: 'Pill', preview: 'rounded-full' },
  { value: 'square', label: 'Square', preview: 'rounded-none' }
];

export default function BrandingTab() {
  const [branding, setBranding] = useState(defaultSettings.branding);
  const [saved, setSaved] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

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

  const saveBranding = (newBranding: typeof branding) => {
    setBranding(newBranding);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBranding));
    // Dispatch custom event to notify BrandingContext of changes
    window.dispatchEvent(new CustomEvent('branding-updated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (key: string, value: string) => {
    saveBranding({ ...branding, [key]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(type, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedFont = FONT_FAMILIES.find(f => f.value === branding.fontFamily) || FONT_FAMILIES[0];

  return (
    <div className="max-w-4xl space-y-4 sm:space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900">Branding & Theme</h1>
          <p className="text-[12px] sm:text-sm text-neutral-500 mt-1">
            Customize colors, fonts, and visual style
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 text-sage-600 rounded-lg">
              <Check className="w-4 h-4" />
              <span className="text-[12px] sm:text-sm font-medium">Saved</span>
            </div>
          )}
          <Button variant="primary" onClick={() => saveBranding(branding)}>
            {saved ? 'Saved' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Primary Color */}
          <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
              <h2 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">Primary Color</h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">Main brand color used across the interface</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex gap-2 flex-wrap">
                  {PRIMARY_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleChange('primaryColor', color)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 transition-all ${
                        branding.primaryColor === color
                          ? 'border-terra-500'
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg cursor-pointer border border-neutral-200 hover:border-neutral-300 transition-colors"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-20 sm:w-24 h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-neutral-200 text-[12px] sm:text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20 focus:ring-0 focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Accent Color */}
          <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
              <h2 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">Accent Color</h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">Secondary color for highlights and accents</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex gap-2 flex-wrap">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleChange('accentColor', color)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 transition-all ${
                        branding.accentColor === color
                          ? 'border-terra-500'
                          : 'border-transparent hover:border-neutral-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <input
                    type="color"
                    value={branding.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg cursor-pointer border border-neutral-200 hover:border-neutral-300 transition-colors"
                  />
                  <input
                    type="text"
                    value={branding.accentColor}
                    onChange={(e) => handleChange('accentColor', e.target.value)}
                    className="w-20 sm:w-24 h-9 sm:h-10 px-2 sm:px-3 rounded-lg border border-neutral-200 text-[12px] sm:text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20 focus:ring-0 focus:outline-none transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Font Family */}
          <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
              <h2 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">Font Family</h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">Typography used throughout the application</p>
            </div>
            <div className="p-4 sm:p-6">
              <label className="block text-[13px] font-medium text-neutral-600 mb-1.5">Select Font</label>
              <div className="relative">
                <button
                  onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 hover:border-neutral-300 focus:border-terra-500 focus:ring-2 focus:ring-terra-500/20 focus:ring-0 focus:outline-none transition-colors flex items-center justify-between bg-white"
                  style={{ fontFamily: branding.fontFamily }}
                >
                  <span>{selectedFont.label}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {fontDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-neutral-200 shadow-lg z-10 py-1 max-h-64 overflow-auto">
                    {FONT_FAMILIES.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => {
                          handleChange('fontFamily', font.value);
                          setFontDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 text-left text-sm hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                          branding.fontFamily === font.value ? 'bg-neutral-50' : ''
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        <span className="text-neutral-900">{font.label}</span>
                        {branding.fontFamily === font.value && (
                          <Check className="w-4 h-4 text-neutral-900" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Button Style */}
          <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
              <h2 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">Button Style</h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">Corner radius style for buttons</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {BUTTON_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => handleChange('buttonStyle', style.value)}
                    className={`p-2 sm:p-4 rounded-lg border transition-colors ${
                      branding.buttonStyle === style.value
                        ? 'border-terra-500 bg-neutral-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-full h-6 sm:h-8 ${style.preview}`}
                      style={{ backgroundColor: branding.primaryColor }}
                    />
                    <p className="text-[10px] sm:text-xs text-neutral-600 mt-1.5 sm:mt-2 text-center">{style.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logo & Favicon */}
          <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
              <h2 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">Logo & Favicon</h2>
              <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">Brand assets for your property</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Logo */}
                <div>
                  <label className="block text-[12px] sm:text-[13px] font-medium text-neutral-600 mb-1.5">Logo</label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-neutral-200 flex items-center justify-center bg-neutral-50 overflow-hidden flex-shrink-0">
                      {branding.logo ? (
                        <img src={branding.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-neutral-400 text-[10px] sm:text-xs">Logo</span>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center justify-center whitespace-nowrap h-8 sm:h-9 px-3 sm:px-4 text-[12px] sm:text-sm gap-2 rounded-lg text-terra-600 font-semibold bg-white border border-terra-200 hover:bg-terra-50 hover:border-terra-300 active:bg-terra-100 transition-all duration-150 ease-out">
                        Upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'logo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Favicon */}
                <div>
                  <label className="block text-[12px] sm:text-[13px] font-medium text-neutral-600 mb-1.5">Favicon</label>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-neutral-200 flex items-center justify-center bg-neutral-50 overflow-hidden flex-shrink-0">
                      {branding.favicon ? (
                        <img src={branding.favicon} alt="Favicon" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-neutral-400 text-[9px] sm:text-[10px]">ICO</span>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center justify-center whitespace-nowrap h-8 sm:h-9 px-3 sm:px-4 text-[12px] sm:text-sm gap-2 rounded-lg text-terra-600 font-semibold bg-white border border-terra-200 hover:bg-terra-50 hover:border-terra-300 active:bg-terra-100 transition-all duration-150 ease-out">
                        Upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleLogoUpload(e, 'favicon')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
                <h2 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800">Preview</h2>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5">Live preview of your changes</p>
              </div>
              <div className="p-4 sm:p-6">
                {/* Sidebar Preview */}
                <div
                  className="rounded-lg p-4 mb-5"
                  style={{ backgroundColor: branding.sidebarBg || '#FAF7F4' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      {branding.logo ? (
                        <img src={branding.logo} alt="Logo" className="w-5 h-5 object-contain" />
                      ) : (
                        <span className="text-white text-xs font-semibold">G</span>
                      )}
                    </div>
                    <span
                      className="font-semibold text-sm text-neutral-900"
                      style={{ fontFamily: branding.fontFamily }}
                    >
                      Glimmora
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div
                      className="px-3 py-2 rounded-lg text-xs font-medium text-white"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Dashboard
                    </div>
                    <div className="px-3 py-2 rounded-lg text-xs text-neutral-500">
                      Bookings
                    </div>
                    <div className="px-3 py-2 rounded-lg text-xs text-neutral-500">
                      Settings
                    </div>
                  </div>
                </div>

                {/* Buttons Preview */}
                <div className="mb-5">
                  <p className="text-xs text-neutral-500 mb-3">Buttons</p>
                  <div className="flex gap-2">
                    <button
                      className={`px-4 py-2 text-white text-xs font-medium ${
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
                      className={`px-4 py-2 text-white text-xs font-medium ${
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

                {/* Typography Preview */}
                <div className="pt-4 border-t border-neutral-100">
                  <p className="text-xs text-neutral-500 mb-3">Typography</p>
                  <p
                    className="text-base font-semibold text-neutral-900"
                    style={{ fontFamily: branding.fontFamily }}
                  >
                    Heading Text
                  </p>
                  <p
                    className="text-sm text-neutral-500 mt-1"
                    style={{ fontFamily: branding.fontFamily }}
                  >
                    Body text with your selected font.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
