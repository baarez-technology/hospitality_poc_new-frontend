import React from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useToast } from '../../../contexts/ToastContext';
import FormSection from '../../../components/settings/FormSection';
import { billingData } from '../../../data/settingsData';
import { CreditCard, Download, ChevronRight, Check } from 'lucide-react';

/**
 * Billing Settings Page
 * Subscription, usage, payment methods
 */
export default function BillingSettings() {
  const { billingSettings, changePlan } = useSettingsContext();
  const { success } = useToast();

  const { currentPlan, usage, paymentMethod, billingHistory, availablePlans } = billingSettings.currentPlan ? billingSettings : billingData;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">
          Billing & Subscription
        </h2>
        <p className="text-sm text-neutral-600 mt-1">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Plan */}
      <FormSection
        title="Current Plan"
        description="Your active subscription details"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-neutral-800">{currentPlan.name} Plan</h3>
            <p className="text-3xl font-bold text-[#A57865] mt-2">
              ${currentPlan.price}
              <span className="text-lg text-neutral-600 font-normal">/{currentPlan.billingCycle}</span>
            </p>
            <div className="mt-4 space-y-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-neutral-700">
                  <Check className="w-4 h-4 text-[#4E5840]" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <button className="px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors">
            Change Plan
          </button>
        </div>
      </FormSection>

      {/* Usage Metrics */}
      <FormSection
        title="Usage Summary"
        description="Current usage against plan limits"
      >
        <div className="space-y-4">
          {/* Rooms Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Rooms</span>
              <span className="text-sm text-neutral-600">{usage.rooms} / {usage.roomsLimit}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${(usage.rooms / usage.roomsLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Users Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Users</span>
              <span className="text-sm text-neutral-600">{usage.users} / {usage.usersLimit}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-aurora-500 to-aurora-600 h-2 rounded-full transition-all"
                style={{ width: `${(usage.users / usage.usersLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Storage Usage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Storage</span>
              <span className="text-sm text-neutral-600">{usage.storageUsed} / {usage.storageLimit}</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                style={{ width: '24%' }}
              />
            </div>
          </div>

          {/* Bookings This Month */}
          <div className="pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-700">Bookings This Month</span>
              <span className="text-2xl font-bold text-neutral-800">{usage.bookingsThisMonth}</span>
            </div>
          </div>
        </div>
      </FormSection>

      {/* Payment Method */}
      <FormSection
        title="Payment Method"
        description="Manage your payment information"
      >
        <div className="flex items-center justify-between p-4 bg-[#FAF8F6] border border-neutral-200 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {paymentMethod.type} •••• {paymentMethod.last4}
              </p>
              <p className="text-xs text-neutral-500">
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors">
            Update
          </button>
        </div>
      </FormSection>

      {/* Billing History */}
      <FormSection
        title="Billing History"
        description="Past invoices and payments"
      >
        <div className="space-y-2">
          {billingHistory.map((invoice, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-[#FAF8F6] border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  {invoice.invoice}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatDate(invoice.date)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-neutral-800">
                    ${invoice.amount}
                  </p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-[#4E5840]">
                    {invoice.status}
                  </span>
                </div>
                <button className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </FormSection>

      {/* Available Plans */}
      <FormSection
        title="Available Plans"
        description="Upgrade or downgrade your subscription"
      >
        <div className="grid grid-cols-3 gap-4">
          {availablePlans.map((plan, index) => (
            <div
              key={index}
              className={`p-6 border-2 rounded-xl transition-all ${
                plan.current
                  ? 'border-[#A57865] bg-[#A57865]/5'
                  : 'border-neutral-200 bg-white hover:border-primary-300'
              }`}
            >
              <h4 className="text-lg font-semibold text-neutral-800 mb-2">{plan.name}</h4>
              <p className="text-3xl font-bold text-neutral-800 mb-4">
                ${plan.price}
                <span className="text-sm text-neutral-600 font-normal">/mo</span>
              </p>
              <ul className="space-y-2 mb-6">
                <li className="text-sm text-neutral-600">Up to {plan.roomsLimit} rooms</li>
                <li className="text-sm text-neutral-600">Up to {plan.usersLimit} users</li>
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#4E5840] flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
              {plan.current ? (
                <button className="w-full px-4 py-2 bg-[#A57865] text-white rounded-lg font-medium cursor-default">
                  Current Plan
                </button>
              ) : (
                <button className="w-full px-4 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:bg-[#FAF8F6] transition-colors flex items-center justify-center gap-2">
                  Select Plan
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </FormSection>
    </div>
  );
}
