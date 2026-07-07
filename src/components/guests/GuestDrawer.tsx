/**
 * GuestDrawer Component
 * View guest details - Glimmora Design System v5.0
 * Side drawer following CMS pattern
 */

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  calculateLoyaltyTier,
  LOYALTY_TIERS,
  GUEST_STATUS_CONFIG,
  EMOTION_CONFIG,
  formatDate,
} from '../../utils/guests';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';

export default function GuestDrawer({
  guest,
  isOpen,
  onClose,
  onEdit,
  onMessage,
  onBlacklist,
  onViewProfile,
}) {
  const { formatCurrency } = useCurrency();
  if (!guest) return null;

  const loyaltyTier = calculateLoyaltyTier(guest.totalStays || 0, guest.totalSpent || 0);
  const tierConfig = LOYALTY_TIERS[loyaltyTier];

  const statusKey = guest.status || 'Active';
  const emotionKey = guest.emotion || 'neutral';

  const status = GUEST_STATUS_CONFIG[statusKey] || GUEST_STATUS_CONFIG['Active'] || {
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-700',
    label: statusKey
  };

  const emotion = EMOTION_CONFIG[emotionKey] || EMOTION_CONFIG['neutral'] || {
    emoji: '😐',
    label: 'Neutral',
    bgColor: 'bg-amber-50',
    color: 'text-amber-700'
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'G';
    return name
      .split(' ')
      .filter(n => n && n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'G';
  };

  const drawerFooter = (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
      {guest.status !== 'Blacklisted' && guest.status !== 'blacklisted' && (
        <Button
          variant="outline"
          onClick={() => onBlacklist(guest)}
          className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 text-xs sm:text-sm"
        >
          Blacklist
        </Button>
      )}
      <Button variant="outline" onClick={() => onMessage(guest)} className="text-xs sm:text-sm">
        Message
      </Button>
      <Button variant="outline" onClick={() => onEdit(guest)} className="text-xs sm:text-sm">
        Edit
      </Button>
      {onViewProfile && (
        <Button variant="primary" onClick={() => onViewProfile(guest)} className="flex-1 text-xs sm:text-sm">
          View Profile
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-xl"
      footer={drawerFooter}
    >
      <div className="space-y-6">
        {/* Header with Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-terra-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">
              {getInitials(guest.name)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              {guest.name}
            </h2>
            <p className="text-[13px] text-neutral-500 mt-0.5">{guest.email}</p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${tierConfig.bgColor} ${tierConfig.textColor}`}>
            {tierConfig.icon} {loyaltyTier}
          </span>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${status.bgColor} ${status.textColor}`}>
            {status.label || statusKey}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${emotion.bgColor || 'bg-amber-50'} ${emotion.color || 'text-amber-700'}`}>
            {emotion.emoji} {emotion.label}
          </span>
        </div>

        {/* Contact Info */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            Contact Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span className="text-[13px] text-neutral-700">{guest.email}</span>
            </div>
            {guest.phone && (
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-[13px] text-neutral-700">{guest.phone}</span>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
              <span className="text-[13px] text-neutral-700">
                {[guest.address, guest.city, guest.state, guest.postalCode, guest.country]
                  .filter(Boolean)
                  .join(', ') || 'No address'}
              </span>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            Guest Statistics
          </h3>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 bg-neutral-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-neutral-900">{guest.totalStays || 0}</p>
              <p className="text-[11px] text-neutral-500 mt-1">Total Stays</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-terra-600">{formatCurrency(guest.totalSpent || 0)}</p>
              <p className="text-[11px] text-neutral-500 mt-1">Total Spent</p>
            </div>
            <div className="p-4 bg-neutral-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-neutral-900">
                {guest.totalStays > 0 ? formatCurrency(Math.round((guest.totalSpent || 0) / guest.totalStays)) : '-'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">Avg. per Stay</p>
            </div>
          </div>
        </section>

        {/* Last Stay */}
        {guest.lastStay && (
          <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <div>
              <p className="text-[11px] text-neutral-500">Last Stay</p>
              <p className="text-[13px] font-medium text-neutral-900">{formatDate(guest.lastStay)}</p>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
