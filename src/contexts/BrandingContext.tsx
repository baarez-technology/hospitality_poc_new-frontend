/**
 * BrandingContext - Provides branding settings across the application
 * Loads from localStorage and applies CSS variables for consistent theming
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { defaultSettings, deepMerge } from '../utils/settings';

const STORAGE_KEY = 'glimmora_branding';

interface BrandingSettings {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  buttonStyle: 'rounded' | 'pill' | 'square';
  sidebarBg: string;
  logo: string | null;
  favicon: string | null;
}

interface BrandingContextType {
  branding: BrandingSettings;
  updateBranding: (updates: Partial<BrandingSettings>) => void;
  getButtonRadius: (size?: 'sm' | 'md' | 'lg' | 'xl') => string;
  getCardRadius: () => string;
  getInputRadius: () => string;
  getModalRadius: () => string;
}

const BrandingContext = createContext<BrandingContextType | null>(null);

// Convert hex to RGB for CSS variables
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
  }
  return '165 120 101'; // Default terra-500
}

// Darken a color for hover states
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// Lighten a color for subtle backgrounds
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(defaultSettings.branding);

  // Load branding from localStorage on mount
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

  // Apply CSS variables whenever branding changes
  useEffect(() => {
    const root = document.documentElement;

    // Primary color variables
    root.style.setProperty('--brand-primary', branding.primaryColor);
    root.style.setProperty('--brand-primary-rgb', hexToRgb(branding.primaryColor));
    root.style.setProperty('--brand-primary-hover', darkenColor(branding.primaryColor, 10));
    root.style.setProperty('--brand-primary-light', lightenColor(branding.primaryColor, 40));
    root.style.setProperty('--brand-primary-50', lightenColor(branding.primaryColor, 45));

    // Accent color variables
    root.style.setProperty('--brand-accent', branding.accentColor);
    root.style.setProperty('--brand-accent-rgb', hexToRgb(branding.accentColor));
    root.style.setProperty('--brand-accent-hover', darkenColor(branding.accentColor, 10));
    root.style.setProperty('--brand-accent-light', lightenColor(branding.accentColor, 40));
    root.style.setProperty('--brand-accent-50', lightenColor(branding.accentColor, 45));

    // Font family
    root.style.setProperty('--brand-font', branding.fontFamily);

    // Sidebar background
    root.style.setProperty('--brand-sidebar-bg', branding.sidebarBg || '#FAF7F4');

    // Button radius based on style
    const radiusMap = {
      rounded: { sm: '0.5rem', md: '0.5rem', lg: '0.75rem', xl: '0.75rem' },
      pill: { sm: '9999px', md: '9999px', lg: '9999px', xl: '9999px' },
      square: { sm: '0.25rem', md: '0.25rem', lg: '0.375rem', xl: '0.375rem' }
    };
    const radius = radiusMap[branding.buttonStyle] || radiusMap.rounded;
    root.style.setProperty('--brand-radius-sm', radius.sm);
    root.style.setProperty('--brand-radius-md', radius.md);
    root.style.setProperty('--brand-radius-lg', radius.lg);
    root.style.setProperty('--brand-radius-xl', radius.xl);

    // Card/Modal radius (slightly larger than buttons)
    const cardRadiusMap = {
      rounded: '0.75rem',
      pill: '1.5rem',
      square: '0.375rem'
    };
    root.style.setProperty('--brand-radius-card', cardRadiusMap[branding.buttonStyle] || '0.75rem');

    // Input radius (matches button style)
    const inputRadiusMap = {
      rounded: '0.5rem',
      pill: '9999px',
      square: '0.25rem'
    };
    root.style.setProperty('--brand-radius-input', inputRadiusMap[branding.buttonStyle] || '0.5rem');

    // Apply font to body
    document.body.style.fontFamily = `${branding.fontFamily}, system-ui, sans-serif`;

  }, [branding]);

  // Listen for localStorage changes (from settings page)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setBranding(deepMerge(defaultSettings.branding, parsed));
        } catch (err) {
          console.error('Error parsing branding update:', err);
        }
      }
    };

    // Also listen for custom event for same-tab updates
    const handleBrandingUpdate = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setBranding(deepMerge(defaultSettings.branding, parsed));
        } catch (err) {
          console.error('Error parsing branding update:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('branding-updated', handleBrandingUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('branding-updated', handleBrandingUpdate);
    };
  }, []);

  const updateBranding = (updates: Partial<BrandingSettings>) => {
    const newBranding = { ...branding, ...updates };
    setBranding(newBranding);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBranding));
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('branding-updated'));
  };

  // Helper functions for component styling
  const getButtonRadius = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string => {
    const radiusMap = {
      rounded: { sm: 'rounded-lg', md: 'rounded-lg', lg: 'rounded-xl', xl: 'rounded-xl' },
      pill: { sm: 'rounded-full', md: 'rounded-full', lg: 'rounded-full', xl: 'rounded-full' },
      square: { sm: 'rounded', md: 'rounded', lg: 'rounded-md', xl: 'rounded-md' }
    };
    return radiusMap[branding.buttonStyle]?.[size] || 'rounded-lg';
  };

  const getCardRadius = (): string => {
    const radiusMap = {
      rounded: 'rounded-xl',
      pill: 'rounded-3xl',
      square: 'rounded-md'
    };
    return radiusMap[branding.buttonStyle] || 'rounded-xl';
  };

  const getInputRadius = (): string => {
    const radiusMap = {
      rounded: 'rounded-lg',
      pill: 'rounded-full',
      square: 'rounded'
    };
    return radiusMap[branding.buttonStyle] || 'rounded-lg';
  };

  const getModalRadius = (): string => {
    const radiusMap = {
      rounded: 'rounded-xl',
      pill: 'rounded-3xl',
      square: 'rounded-lg'
    };
    return radiusMap[branding.buttonStyle] || 'rounded-xl';
  };

  return (
    <BrandingContext.Provider value={{
      branding,
      updateBranding,
      getButtonRadius,
      getCardRadius,
      getInputRadius,
      getModalRadius
    }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    // Return default values if used outside provider
    return {
      branding: defaultSettings.branding,
      updateBranding: () => {},
      getButtonRadius: () => 'rounded-lg',
      getCardRadius: () => 'rounded-xl',
      getInputRadius: () => 'rounded-lg',
      getModalRadius: () => 'rounded-xl'
    };
  }
  return context;
}

export default BrandingContext;
