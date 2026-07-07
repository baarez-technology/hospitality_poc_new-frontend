import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PreCheckInSettings {
  enabled: boolean;
  requireId: boolean;
  requireCreditCard: boolean;
  enableAiRoomSelection: boolean;
  allowRoomUpgrade: boolean;
  reminderEmailDays: number;
  steps: {
    id: string;
    name: string;
    enabled: boolean;
    required: boolean;
    order: number;
  }[];
}

interface BrandingSettings {
  hotelName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  footerText: string;
}

interface EmailTemplate {
  id: string;
  type: 'booking-confirmation' | 'pre-checkin-reminder' | 'cancellation' | 'checkout-thankyou';
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

interface PricingRule {
  id: string;
  type: 'seasonal' | 'discount' | 'offer';
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate?: string;
  endDate?: string;
  code?: string;
  minNights?: number;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

interface AdvancedSettingsContextType {
  preCheckInSettings: PreCheckInSettings;
  brandingSettings: BrandingSettings;
  emailTemplates: EmailTemplate[];
  pricingRules: PricingRule[];
  updatePreCheckInSettings: (data: Partial<PreCheckInSettings>) => void;
  updateBrandingSettings: (data: Partial<BrandingSettings>) => void;
  updateEmailTemplate: (id: string, data: Partial<EmailTemplate>) => void;
  addPricingRule: (rule: Omit<PricingRule, 'id'>) => void;
  updatePricingRule: (id: string, data: Partial<PricingRule>) => void;
  deletePricingRule: (id: string) => void;
}

const AdvancedSettingsContext = createContext<AdvancedSettingsContextType | undefined>(undefined);

export function AdvancedSettingsProvider({ children }: { children: ReactNode }) {
  // Pre-Check-In Settings
  const [preCheckInSettings, setPreCheckInSettings] = useState<PreCheckInSettings>({
    enabled: true,
    requireId: true,
    requireCreditCard: true,
    enableAiRoomSelection: true,
    allowRoomUpgrade: true,
    reminderEmailDays: 3,
    steps: [
      { id: '1', name: 'Guest Information', enabled: true, required: true, order: 1 },
      { id: '2', name: 'ID Verification', enabled: true, required: true, order: 2 },
      { id: '3', name: 'Payment Information', enabled: true, required: true, order: 3 },
      { id: '4', name: 'Room Preferences', enabled: true, required: false, order: 4 },
      { id: '5', name: 'AI Room Selection', enabled: true, required: false, order: 5 },
      { id: '6', name: 'Special Requests', enabled: true, required: false, order: 6 },
      { id: '7', name: 'Arrival Details', enabled: true, required: true, order: 7 },
      { id: '8', name: 'Review & Confirm', enabled: true, required: true, order: 8 },
    ],
  });

  // Branding Settings
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    hotelName: 'J Park Inn Hotel',
    logo: '/logo.png',
    favicon: '/favicon.ico',
    primaryColor: '#0052CC',
    secondaryColor: '#172B4D',
    accentColor: '#FF5630',
    fontHeading: 'Inter',
    fontBody: 'Inter',
    footerText: '© 2024 J Park Inn Hotel. All rights reserved.',
  });

  // Email Templates
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      type: 'booking-confirmation',
      name: 'Booking Confirmation',
      subject: 'Your Booking Confirmation - {{bookingNumber}}',
      body: `Dear {{guestName}},

Thank you for choosing {{hotelName}}! Your booking has been confirmed.

Booking Details:
- Booking Number: {{bookingNumber}}
- Check-in: {{checkInDate}}
- Check-out: {{checkOutDate}}
- Room Type: {{roomType}}
- Total Amount: $${'{{totalAmount}}'}

We look forward to welcoming you!

Best regards,
The {{hotelName}} Team`,
      variables: ['guestName', 'hotelName', 'bookingNumber', 'checkInDate', 'checkOutDate', 'roomType', 'totalAmount'],
    },
    {
      id: '2',
      type: 'pre-checkin-reminder',
      name: 'Pre-Check-In Reminder',
      subject: 'Complete Your Pre-Check-In - {{hotelName}}',
      body: `Dear {{guestName}},

Your stay at {{hotelName}} is coming up soon!

To make your arrival seamless, please complete your pre-check-in:
{{preCheckInLink}}

This will save you time at the front desk and help us prepare for your arrival.

Check-in Date: {{checkInDate}}
Booking Number: {{bookingNumber}}

We can't wait to see you!

Best regards,
The {{hotelName}} Team`,
      variables: ['guestName', 'hotelName', 'bookingNumber', 'checkInDate', 'preCheckInLink'],
    },
    {
      id: '3',
      type: 'cancellation',
      name: 'Cancellation Confirmation',
      subject: 'Booking Cancelled - {{bookingNumber}}',
      body: `Dear {{guestName}},

Your booking has been cancelled as requested.

Cancelled Booking Details:
- Booking Number: {{bookingNumber}}
- Original Check-in: {{checkInDate}}
- Refund Amount: $${'{{refundAmount}}'}

{{refundMessage}}

We hope to welcome you in the future.

Best regards,
The {{hotelName}} Team`,
      variables: ['guestName', 'hotelName', 'bookingNumber', 'checkInDate', 'refundAmount', 'refundMessage'],
    },
    {
      id: '4',
      type: 'checkout-thankyou',
      name: 'Thank You After Checkout',
      subject: 'Thank You for Staying with Us!',
      body: `Dear {{guestName}},

Thank you for choosing {{hotelName}} for your recent stay. We hope you enjoyed your time with us!

We would love to hear about your experience. Please take a moment to leave us a review:
{{reviewLink}}

We look forward to welcoming you back soon!

Best regards,
The {{hotelName}} Team`,
      variables: ['guestName', 'hotelName', 'reviewLink'],
    },
  ]);

  // Pricing Rules
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      type: 'seasonal',
      name: 'Summer Special',
      description: '20% off all rooms during summer season',
      discountType: 'percentage',
      discountValue: 20,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      minNights: 2,
      currentUses: 45,
      isActive: true,
    },
    {
      id: '2',
      type: 'discount',
      name: 'Early Bird Discount',
      description: '$50 off for bookings made 30+ days in advance',
      discountType: 'fixed',
      discountValue: 50,
      currentUses: 23,
      isActive: true,
    },
    {
      id: '3',
      type: 'offer',
      name: 'Weekend Getaway',
      description: '15% off Friday-Sunday stays',
      discountType: 'percentage',
      discountValue: 15,
      code: 'WEEKEND15',
      minNights: 2,
      maxUses: 100,
      currentUses: 67,
      isActive: true,
    },
  ]);

  // Update Functions
  const updatePreCheckInSettings = (data: Partial<PreCheckInSettings>) => {
    setPreCheckInSettings(prev => ({ ...prev, ...data }));
  };

  const updateBrandingSettings = (data: Partial<BrandingSettings>) => {
    setBrandingSettings(prev => ({ ...prev, ...data }));
  };

  const updateEmailTemplate = (id: string, data: Partial<EmailTemplate>) => {
    setEmailTemplates(templates =>
      templates.map(t => t.id === id ? { ...t, ...data } : t)
    );
  };

  const addPricingRule = (ruleData: Omit<PricingRule, 'id'>) => {
    const newRule: PricingRule = {
      ...ruleData,
      id: Date.now().toString(),
    };
    setPricingRules([...pricingRules, newRule]);
  };

  const updatePricingRule = (id: string, data: Partial<PricingRule>) => {
    setPricingRules(rules => rules.map(r => r.id === id ? { ...r, ...data } : r));
  };

  const deletePricingRule = (id: string) => {
    setPricingRules(rules => rules.filter(r => r.id !== id));
  };

  return (
    <AdvancedSettingsContext.Provider
      value={{
        preCheckInSettings,
        brandingSettings,
        emailTemplates,
        pricingRules,
        updatePreCheckInSettings,
        updateBrandingSettings,
        updateEmailTemplate,
        addPricingRule,
        updatePricingRule,
        deletePricingRule,
      }}
    >
      {children}
    </AdvancedSettingsContext.Provider>
  );
}

export function useAdvancedSettings() {
  const context = useContext(AdvancedSettingsContext);
  if (!context) {
    throw new Error('useAdvancedSettings must be used within AdvancedSettingsProvider');
  }
  return context;
}