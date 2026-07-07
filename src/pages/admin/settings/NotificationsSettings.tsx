import React from 'react';
import { useSettingsContext } from '../../../contexts/SettingsContext';
import { useToast } from '../../../contexts/ToastContext';
import FormSection from '../../../components/settings/FormSection';
import ToggleSwitch from '../../../components/settings/ToggleSwitch';
import { Save, Mail, MessageSquare, Users, DollarSign } from 'lucide-react';

/**
 * Notifications Settings Page
 * Email, SMS, and alert configurations
 */
export default function NotificationsSettings() {
  const {
    notificationSettings,
    updateEmailSetting,
    updateSMSSetting,
    updateStaffSetting,
    updateRevenueSetting
  } = useSettingsContext();

  const { success } = useToast();

  const settings = notificationSettings;

  const handleSave = () => {
    success('Notification settings saved successfully');
  };

  const updateEmail = (key, value) => {
    updateEmailSetting(key, value);
  };

  const updateSMS = (key, value) => {
    updateSMSSetting(key, value);
  };

  const updateStaff = (key, value) => {
    updateStaffSetting(key, value);
  };

  const updateRevenue = (key, value) => {
    updateRevenueSetting(key, value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-800">
            Notifications Settings
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Configure email, SMS, and staff alerts
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg hover:shadow transition-all flex items-center gap-2 text-sm font-medium"
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Email Notifications */}
      <FormSection
        title="Email Notifications"
        description="Configure email alerts for booking and guest events"
      >
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-800">Email Alerts</p>
            <p className="text-xs text-neutral-500">Master toggle for all email notifications</p>
          </div>
          <ToggleSwitch
            enabled={settings.email.enabled}
            onChange={(value) => updateEmail('enabled', value)}
          />
        </div>

        <div className="space-y-1">
          <ToggleSwitch
            label="New Booking"
            description="Get notified when a new booking is made"
            enabled={settings.email.newBooking}
            onChange={(value) => updateEmail('newBooking', value)}
            disabled={!settings.email.enabled}
          />
          <ToggleSwitch
            label="Cancellation"
            description="Alert when a booking is cancelled"
            enabled={settings.email.cancellation}
            onChange={(value) => updateEmail('cancellation', value)}
            disabled={!settings.email.enabled}
          />
          <ToggleSwitch
            label="Check-In"
            description="Notify when a guest checks in"
            enabled={settings.email.checkIn}
            onChange={(value) => updateEmail('checkIn', value)}
            disabled={!settings.email.enabled}
          />
          <ToggleSwitch
            label="Check-Out"
            description="Alert when a guest checks out"
            enabled={settings.email.checkOut}
            onChange={(value) => updateEmail('checkOut', value)}
            disabled={!settings.email.enabled}
          />
          <ToggleSwitch
            label="Payment Received"
            description="Notify when a payment is processed"
            enabled={settings.email.payment}
            onChange={(value) => updateEmail('payment', value)}
            disabled={!settings.email.enabled}
          />
          <ToggleSwitch
            label="New Review"
            description="Alert when a guest leaves a review"
            enabled={settings.email.review}
            onChange={(value) => updateEmail('review', value)}
            disabled={!settings.email.enabled}
          />
          <ToggleSwitch
            label="Low Inventory"
            description="Warn when room inventory is low"
            enabled={settings.email.lowInventory}
            onChange={(value) => updateEmail('lowInventory', value)}
            disabled={!settings.email.enabled}
          />
        </div>
      </FormSection>

      {/* SMS Notifications */}
      <FormSection
        title="SMS Notifications"
        description="Text message alerts for urgent events"
      >
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#4E5840]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-800">SMS Alerts</p>
            <p className="text-xs text-neutral-500">Master toggle for SMS notifications</p>
          </div>
          <ToggleSwitch
            enabled={settings.sms.enabled}
            onChange={(value) => updateSMS('enabled', value)}
          />
        </div>

        <div className="space-y-1">
          <ToggleSwitch
            label="Urgent Only"
            description="Send SMS only for urgent events"
            enabled={settings.sms.urgentOnly}
            onChange={(value) => updateSMS('urgentOnly', value)}
            disabled={!settings.sms.enabled}
          />
          <ToggleSwitch
            label="Check-In Alerts"
            description="SMS when a guest checks in"
            enabled={settings.sms.checkIn}
            onChange={(value) => updateSMS('checkIn', value)}
            disabled={!settings.sms.enabled}
          />
          <ToggleSwitch
            label="Payment Alerts"
            description="SMS when a payment is received"
            enabled={settings.sms.payment}
            onChange={(value) => updateSMS('payment', value)}
            disabled={!settings.sms.enabled}
          />
        </div>
      </FormSection>

      {/* Staff Notifications */}
      <FormSection
        title="Staff Notifications"
        description="Alerts for housekeeping and maintenance teams"
      >
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-800">Staff Alerts</p>
            <p className="text-xs text-neutral-500">Notifications for operational staff</p>
          </div>
        </div>

        <div className="space-y-1">
          <ToggleSwitch
            label="Housekeeping Alerts"
            description="Notify when rooms need cleaning"
            enabled={settings.staff.housekeepingAlerts}
            onChange={(value) => updateStaff('housekeepingAlerts', value)}
          />
          <ToggleSwitch
            label="Maintenance Alerts"
            description="Alert for maintenance requests"
            enabled={settings.staff.maintenanceAlerts}
            onChange={(value) => updateStaff('maintenanceAlerts', value)}
          />
          <ToggleSwitch
            label="Guest Requests"
            description="Notify for guest service requests"
            enabled={settings.staff.guestRequests}
            onChange={(value) => updateStaff('guestRequests', value)}
          />
          <ToggleSwitch
            label="Low Inventory Alerts"
            description="Warn staff about low supplies"
            enabled={settings.staff.lowInventory}
            onChange={(value) => updateStaff('lowInventory', value)}
          />
        </div>
      </FormSection>

      {/* Revenue Notifications */}
      <FormSection
        title="Revenue Alerts"
        description="Reports and revenue-related notifications"
      >
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-neutral-200">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-800">Revenue Reports</p>
            <p className="text-xs text-neutral-500">Automated revenue and occupancy reports</p>
          </div>
        </div>

        <div className="space-y-1">
          <ToggleSwitch
            label="Daily Reports"
            description="Email daily revenue summary"
            enabled={settings.revenue.dailyReports}
            onChange={(value) => updateRevenue('dailyReports', value)}
          />
          <ToggleSwitch
            label="Weekly Reports"
            description="Email weekly performance report"
            enabled={settings.revenue.weeklyReports}
            onChange={(value) => updateRevenue('weeklyReports', value)}
          />
          <ToggleSwitch
            label="Price Alerts"
            description="Notify when pricing changes are needed"
            enabled={settings.revenue.priceAlerts}
            onChange={(value) => updateRevenue('priceAlerts', value)}
          />
          <ToggleSwitch
            label="Occupancy Alerts"
            description="Alert when occupancy drops below threshold"
            enabled={settings.revenue.occupancyAlerts}
            onChange={(value) => updateRevenue('occupancyAlerts', value)}
          />
        </div>
      </FormSection>
    </div>
  );
}
