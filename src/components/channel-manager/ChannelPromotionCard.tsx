/**
 * ChannelPromotionCard Component
 * Promotion card for channel-specific promotions - Glimmora Design System v5.0
 */

import { useState } from 'react';
import {
  Calendar, Percent, DollarSign, Users,
  ChevronDown, ChevronUp, Edit2, Trash2, Copy,
  ExternalLink
} from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

export default function ChannelPromotionCard({
  promotion,
  otas,
  onEdit,
  onDelete,
  onToggle,
  onDuplicate
}) {
  const { symbol } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = () => {
    if (!promotion.isActive) return { bg: 'bg-neutral-100', text: 'text-neutral-500', label: 'Inactive' };

    const now = new Date();
    const start = new Date(promotion.validFrom);
    const end = new Date(promotion.validTo);

    if (now < start) return { bg: 'bg-gold-100', text: 'text-gold-700', label: 'Scheduled' };
    if (now > end) return { bg: 'bg-neutral-100', text: 'text-neutral-500', label: 'Expired' };
    return { bg: 'bg-sage-100', text: 'text-sage-700', label: 'Active' };
  };

  const status = getStatusColor();

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getOTANames = () => {
    if (promotion.otaCodes.includes('ALL')) return 'All OTAs';
    return promotion.otaCodes
      .map(code => otas.find(o => o.code === code)?.name || code)
      .join(', ');
  };

  const getRoomTypesLabel = () => {
    if (promotion.roomTypes.includes('ALL')) return 'All Room Types';
    return promotion.roomTypes.join(', ');
  };

  return (
    <div className={`bg-white rounded-[10px] overflow-hidden transition-all ${
      promotion.isActive ? '' : 'opacity-60'
    }`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-terra-100">
              {promotion.discountType === 'percentage' ? (
                <Percent className="w-6 h-6 text-terra-600" />
              ) : (
                <DollarSign className="w-6 h-6 text-terra-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[15px] text-neutral-900">{promotion.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-lg ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-[12px] text-neutral-500 mt-1">{promotion.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Discount Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-terra-50">
              <span className="text-lg font-bold text-terra-600">
                {promotion.discountType === 'percentage' ? `${promotion.discountValue}%` : `${symbol}${promotion.discountValue}`}
              </span>
              <span className="text-[11px] text-neutral-500 ml-1">off</span>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-neutral-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-400" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex items-center gap-4 mt-4 text-[12px]">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(promotion.validFrom)} - {formatDate(promotion.validTo)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-500">
            <ExternalLink className="w-4 h-4" />
            <span>{getOTANames()}</span>
          </div>
          {promotion.usageCount !== undefined && (
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Users className="w-4 h-4" />
              <span>{promotion.usageCount} uses</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-neutral-100">
          <div className="p-5 space-y-5">
            {/* Details Grid - in a subtle container */}
            <div className="p-4 rounded-lg bg-neutral-50/70 border border-neutral-100">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Booking Window
                  </h4>
                  <p className="text-[13px] font-semibold text-neutral-900">
                    {promotion.bookingWindow?.start
                      ? `${formatDate(promotion.bookingWindow.start)} - ${formatDate(promotion.bookingWindow.end)}`
                      : 'Any time'}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Room Types
                  </h4>
                  <p className="text-[13px] font-semibold text-neutral-900">{getRoomTypesLabel()}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                    Minimum Stay
                  </h4>
                  <p className="text-[13px] font-semibold text-neutral-900">
                    {promotion.minStay ? `${promotion.minStay} nights` : 'No minimum'}
                  </p>
                </div>
              </div>
            </div>

            {/* OTA Distribution */}
            <div>
              <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">
                Channels
              </h4>
              <div className="flex flex-wrap gap-2">
                {promotion.otaCodes.includes('ALL') ? (
                  otas.filter(o => o.status === 'connected').map(ota => (
                    <div
                      key={ota.code}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg"
                    >
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: ota.color }}
                      >
                        {ota.name.substring(0, 1)}
                      </div>
                      <span className="text-[12px] font-medium text-neutral-700">{ota.name}</span>
                    </div>
                  ))
                ) : (
                  promotion.otaCodes.map(code => {
                    const ota = otas.find(o => o.code === code);
                    return ota ? (
                      <div
                        key={code}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-lg"
                      >
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: ota.color }}
                        >
                          {ota.name.substring(0, 1)}
                        </div>
                        <span className="text-[12px] font-medium text-neutral-700">{ota.name}</span>
                      </div>
                    ) : null;
                  })
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 flex items-center justify-between border-t border-neutral-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(promotion)}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => onDuplicate(promotion)}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
              <button
                onClick={() => onDelete(promotion)}
                className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-medium ${!promotion.isActive ? 'text-neutral-600' : 'text-neutral-400'}`}>Off</span>
              <button
                onClick={() => onToggle(promotion)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  promotion.isActive ? 'bg-terra-500' : 'bg-neutral-300'
                }`}
                title={promotion.isActive ? 'Deactivate' : 'Activate'}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    promotion.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-[11px] font-medium ${promotion.isActive ? 'text-neutral-600' : 'text-neutral-400'}`}>On</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
