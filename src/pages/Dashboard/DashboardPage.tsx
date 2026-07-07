import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Settings, CreditCard, Shield, LayoutDashboard } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { OverviewTab } from './tabs/OverviewTab';
import { ProfileTab } from './tabs/ProfileTab';
import { BookingsTab } from './tabs/BookingsTab';
import { PreferencesTab } from './tabs/PreferencesTab';
import { PaymentsTab } from './tabs/PaymentsTab';
import { SecurityTab } from './tabs/SecurityTab';
import { GuestAIAssistant } from '@/components/guest/GuestAIAssistant';
import { useGuestAI } from '@/contexts/GuestAIContext';

const tabs = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard, component: OverviewTab },
  { id: 'profile', name: 'Profile', icon: User, component: ProfileTab },
  { id: 'bookings', name: 'Bookings', icon: Calendar, component: BookingsTab },
  { id: 'preferences', name: 'Preferences', icon: Settings, component: PreferencesTab },
  { id: 'payments', name: 'Payments', icon: CreditCard, component: PaymentsTab },
  { id: 'security', name: 'Security', icon: Shield, component: SecurityTab },
];

const tabDescriptions: Record<string, string> = {
  overview: 'Your personalized dashboard overview',
  profile: 'Manage your personal information',
  bookings: 'View and manage your reservations',
  preferences: 'Customize your stay preferences',
  payments: 'Manage payment methods and billing',
  security: 'Security settings and privacy controls',
};

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const { isOpen: isAIOpen, openAI, closeAI } = useGuestAI();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some((tab) => tab.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const ActiveTabComponent = tabs.find((tab) => tab.id === activeTab)?.component;
  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="min-h-screen text-neutral-900" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="border-b border-neutral-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          </motion.div>
        </div>
      </div>

      <div className="sticky top-20 z-10 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'text-neutral-900 border-b-2 border-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                  <span>{tab.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {ActiveTabComponent && <ActiveTabComponent />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Assistant */}
      <GuestAIAssistant isOpen={isAIOpen} onClose={closeAI} />
    </div>
  );
}