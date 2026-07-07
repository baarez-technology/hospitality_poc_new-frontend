/**
 * PromotionCard Component
 * Individual promotion card with status toggle - Glimmora Design System v5.0
 * Redesigned for consistency with RatePlanCard
 */

import { useState } from 'react';
import {
  Gift, Percent, Calendar, Tag, Users, Check,
  ChevronDown, ChevronUp, Copy, Trash2, CheckCircle, Clock, Globe, Pencil
} from 'lucide-react';
import SearchHighlight from '../ui2/SearchHighlight';
import { Button, IconButton } from '../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';

const discountTypeLabels = {
  'percentage': 'Percentage Off',
  'fixed': 'Fixed Discount',
  'free_night': 'Free Night',
  'upgrade': 'Room Upgrade',
  'addon': 'Free Add-on'
};

export default function PromotionCard({ promotion, onUpdate, onToggleStatus, onDelete, onEdit, searchQuery = '' }) {
  const { symbol } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDiscount = () => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}%`;
    } else if (promotion.discountType === 'fixed') {
      return `${symbol}${promotion.discountValue}`;
    } else if (promotion.discountType === 'free_night') {
      return `${promotion.discountValue}`;
    }
    return promotion.discountValue;
  };

  const getDiscountLabel = () => {
    if (promotion.discountType === 'percentage') {
      return 'OFF';
    } else if (promotion.discountType === 'fixed') {
      return 'OFF';
    } else if (promotion.discountType === 'free_night') {
      return 'FREE NIGHTS';
    }
    return '';
  };

  const isExpired = new Date(promotion.validTo) < new Date();
  const isUpcoming = new Date(promotion.validFrom) > new Date();
  const usagePercentage = promotion.usageLimit
    ? Math.round((promotion.usageCount / promotion.usageLimit) * 100)
    : null;

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (promotion.code) {
      navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusConfig = () => {
    if (isExpired) {
      return { label: 'Expired', bgClass: 'bg-neutral-100 text-neutral-500' };
    }
    if (isUpcoming) {
      return { label: 'Scheduled', bgClass: 'bg-gold-100 text-gold-700' };
    }
    if (promotion.isActive) {
      return { label: 'Active', bgClass: 'bg-sage-100 text-sage-700' };
    }
    return { label: 'Paused', bgClass: 'bg-gold-100 text-gold-700' };
  };

  const status = getStatusConfig();
  const isInactive = !promotion.isActive || isExpired;

  return (
    <div className={`rounded-[10px] bg-white transition-all duration-200 ${
      isInactive ? 'opacity-60' : ''
    }`}>
      {/* Header - Always Visible */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Identity */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Discount Badge */}
            <div className={`relative flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center ${
              isInactive
                ? 'bg-neutral-100'
                : 'bg-terra-50'
            }`}>
              <span className={`text-xl font-bold tracking-tight ${
                isInactive ? 'text-neutral-400' : 'text-terra-600'
              }`}>
                {formatDiscount()}
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-wider ${
                isInactive ? 'text-neutral-400' : 'text-terra-500'
              }`}>
                {getDiscountLabel()}
              </span>
            </div>

            {/* Name & Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-neutral-800 truncate">
                  <SearchHighlight text={promotion.title} query={searchQuery} />
                </h3>
                <span className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded flex-shrink-0 ${status.bgClass}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium truncate mb-2">
                {discountTypeLabels[promotion.discountType] || 'Discount'}
              </p>

              {/* Code Badge */}
              {promotion.code && (
                <button
                  onClick={handleCopyCode}
                  className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all duration-200 ${
                    copied
                      ? 'bg-sage-50 text-sage-700'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <SearchHighlight text={promotion.code} query={searchQuery} />
                  <span className="h-3 w-px bg-neutral-300" />
                  {copied ? (
                    <span className="flex items-center gap-1 text-[10px]">
                      <Check className="w-3 h-3" />
                      Copied
                    </span>
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isExpired && (
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium ${!promotion.isActive ? 'text-neutral-600' : 'text-neutral-400'}`}>Off</span>
                <button
                  onClick={() => onToggleStatus(promotion.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    promotion.isActive ? 'bg-terra-500' : 'bg-neutral-300'
                  }`}
                  title={promotion.isActive ? 'Pause' : 'Activate'}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      promotion.isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-[11px] font-medium ${promotion.isActive ? 'text-neutral-600' : 'text-neutral-400'}`}>On</span>
              </div>
            )}
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? ChevronUp : ChevronDown}
              variant="ghost"
              size="sm"
              label={isExpanded ? 'Collapse details' : 'Expand details'}
            />
          </div>
        </div>

        {/* Quick Info Row */}
        <div className="mt-5 pt-5 border-t border-neutral-100 flex items-center gap-6 flex-wrap">
          {/* Date Range */}
          <div className="flex items-center gap-2 text-[13px] text-neutral-600">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span className="font-medium">{formatDate(promotion.validFrom)}</span>
            <span className="text-neutral-300">—</span>
            <span className="font-medium">{formatDate(promotion.validTo)}</span>
          </div>

          {/* Usage Progress */}
          {usagePercentage !== null && (
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 rounded-full overflow-hidden bg-neutral-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    usagePercentage >= 90
                      ? 'bg-rose-500'
                      : usagePercentage >= 70
                        ? 'bg-gold-500'
                        : 'bg-terra-500'
                  }`}
                  style={{ width: `${Math.min(100, usagePercentage)}%` }}
                />
              </div>
              <span className="text-[11px] font-semibold tabular-nums text-neutral-500">
                {promotion.usageCount}/{promotion.usageLimit}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-neutral-100">
          {/* Description */}
          <div className="px-6 py-4 bg-neutral-50/50">
            <p className="text-[13px] text-neutral-600 leading-relaxed">
              <SearchHighlight text={promotion.description} query={searchQuery} />
            </p>
          </div>

          {/* Key Details Grid */}
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stay Requirements */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Stay</p>
                <p className="text-[13px] font-semibold text-neutral-800">
                  {promotion.minNights || 1}–{promotion.maxNights || '∞'} nights
                </p>
              </div>
            </div>

            {/* Min Booking */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Tag className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Min Spend</p>
                <p className="text-[13px] font-semibold text-neutral-800">
                  {promotion.minBookingAmount ? `${symbol}${promotion.minBookingAmount}` : 'None'}
                </p>
              </div>
            </div>

            {/* Usage */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Redemptions</p>
                <p className="text-[13px] font-semibold text-terra-600">
                  {promotion.usageCount} used
                </p>
              </div>
            </div>

            {/* Stackable */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1">Stackable</p>
                <p className="text-[13px] font-semibold text-neutral-800">
                  {promotion.stackable ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Room Types & Channels */}
          <div className="px-6 py-5 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Types */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
                Room Types
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(promotion.applicableRoomTypes || []).map(type => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-terra-50 text-terra-700"
                  >
                    <span className="w-1 h-1 rounded-full bg-terra-500" />
                    {type}
                  </span>
                ))}
                {(!promotion.applicableRoomTypes || promotion.applicableRoomTypes.length === 0) && (
                  <span className="text-[11px] text-neutral-400 italic">All room types</span>
                )}
              </div>
            </div>

            {/* Rate Plans */}
            <div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
                Rate Plans
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(promotion.applicableRatePlans || []).map(plan => (
                  <span
                    key={plan}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-sage-50 text-sage-700"
                  >
                    <span className="w-1 h-1 rounded-full bg-sage-500" />
                    {plan}
                  </span>
                ))}
                {(!promotion.applicableRatePlans || promotion.applicableRatePlans.length === 0) && (
                  <span className="text-[11px] text-neutral-400 italic">All rate plans</span>
                )}
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="px-6 py-5 border-t border-neutral-100">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Distribution Channels
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(promotion.applicableChannels || []).map(channel => (
                <span
                  key={channel}
                  className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-ocean-50 text-ocean-700"
                >
                  <span className="w-1 h-1 rounded-full bg-ocean-500" />
                  {channel}
                </span>
              ))}
              {(!promotion.applicableChannels || promotion.applicableChannels.length === 0) && (
                <span className="text-[11px] text-neutral-400 italic">All channels</span>
              )}
            </div>
          </div>

          {/* Terms */}
          {promotion.termsAndConditions && (
            <div className="px-6 py-5 border-t border-neutral-100">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-2">
                Terms & Conditions
              </h4>
              <p className="text-[13px] text-neutral-600 leading-relaxed">
                {promotion.termsAndConditions}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
            <p className="text-[11px] text-neutral-400 font-medium">
              {promotion.createdBy && (
                <>Created by <span className="font-semibold">{promotion.createdBy}</span></>
              )}
              {promotion.createdBy && promotion.createdAt && ' · '}
              {promotion.createdAt && formatDate(promotion.createdAt)}
            </p>
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  onClick={() => onEdit(promotion)}
                  variant="outline"
                  size="sm"
                  icon={Pencil}
                >
                  Edit
                </Button>
              )}
              <Button
                onClick={() => onDelete(promotion.id)}
                variant="danger"
                size="sm"
                icon={Trash2}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
