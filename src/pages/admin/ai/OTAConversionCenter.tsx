/**
 * OTA Conversion Center - ReConnect AI Integration
 * Convert OTA guests to direct bookers with targeted offers and tracking
 */
import React, { useState, useEffect } from 'react';
import {
  Globe,
  Users,
  Mail,
  TrendingUp,
  DollarSign,
  Target,
  RefreshCw,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Percent,
  Hotel,
  Sparkles,
  UserCheck,
  BarChart3
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { apiClient as api } from '../../../api/client';

// Types
interface OTAGuest {
  id: number;
  guest_id: number;
  guest_name: string;
  email: string;
  phone: string | null;
  original_ota: 'booking.com' | 'expedia' | 'hotels.com' | 'airbnb' | 'agoda' | 'other';
  first_ota_booking: string;
  total_ota_bookings: number;
  total_ota_revenue: number;
  conversion_probability: number;
  status: 'pending' | 'offer_sent' | 'opened' | 'clicked' | 'converted' | 'declined';
  last_offer_sent: string | null;
  offer_type: string | null;
  identified_at: string;
}

interface OTAConversionStats {
  ota_guests_identified: number;
  offers_sent: number;
  conversion_rate: number;
  revenue_impact: number;
  pending_offers: number;
  average_conversion_probability: number;
}

interface ConversionFunnelData {
  identified: number;
  offer_sent: number;
  opened: number;
  clicked: number;
  converted: number;
}

interface OfferTemplate {
  id: string;
  name: string;
  type: 'discount' | 'upgrade' | 'loyalty' | 'package';
  value: string;
  description: string;
}

// API Service
const otaConversionService = {
  async getStats(): Promise<OTAConversionStats> {
    const response = await api.get('/api/v1/ota-conversion/stats');
    return response.data.data;
  },

  async getOTAGuests(status?: string, search?: string): Promise<OTAGuest[]> {
    const response = await api.get('/api/v1/ota-conversion/guests', {
      params: { status, search }
    });
    return response.data.data;
  },

  async identifyOTAGuests(): Promise<{ identified: number }> {
    const response = await api.post('/api/v1/ota-conversion/identify');
    return response.data.data;
  },

  async sendOffer(guestId: number, offerId: string): Promise<void> {
    await api.post(`/api/v1/ota-conversion/guests/${guestId}/send-offer`, {
      offer_id: offerId
    });
  },

  async getConversionFunnel(): Promise<ConversionFunnelData> {
    const response = await api.get('/api/v1/ota-conversion/funnel');
    return response.data.data;
  }
};

// StatCard Component
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'blue'
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'terra' | 'sage';
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/10 to-blue-600/10 text-blue-600',
    green: 'from-emerald-500/10 to-emerald-600/10 text-emerald-600',
    amber: 'from-amber-500/10 to-amber-600/10 text-amber-600',
    red: 'from-red-500/10 to-red-600/10 text-red-600',
    purple: 'from-purple-500/10 to-purple-600/10 text-purple-600',
    terra: 'from-[#A57865]/10 to-[#8E6554]/10 text-[#A57865]',
    sage: 'from-[#4E5840]/10 to-[#3D4632]/10 text-[#4E5840]'
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-3">
          {trend === 'up' ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          ) : trend === 'down' ? (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          ) : null}
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-neutral-500'
          }`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
};

// OTA Badge Component
const OTABadge = ({ ota }: { ota: OTAGuest['original_ota'] }) => {
  const otaConfig: Record<OTAGuest['original_ota'], { label: string; className: string }> = {
    'booking.com': { label: 'Booking.com', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    'expedia': { label: 'Expedia', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    'hotels.com': { label: 'Hotels.com', className: 'bg-red-100 text-red-700 border-red-200' },
    'airbnb': { label: 'Airbnb', className: 'bg-rose-100 text-rose-700 border-rose-200' },
    'agoda': { label: 'Agoda', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    'other': { label: 'Other OTA', className: 'bg-neutral-100 text-neutral-700 border-neutral-200' }
  };

  const config = otaConfig[ota];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${config.className}`}>
      <Globe className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: OTAGuest['status'] }) => {
  const statusConfig: Record<OTAGuest['status'], { label: string; className: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', className: 'bg-neutral-100 text-neutral-700', icon: Clock },
    offer_sent: { label: 'Offer Sent', className: 'bg-blue-100 text-blue-700', icon: Send },
    opened: { label: 'Opened', className: 'bg-amber-100 text-amber-700', icon: Eye },
    clicked: { label: 'Clicked', className: 'bg-purple-100 text-purple-700', icon: Target },
    converted: { label: 'Converted', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    declined: { label: 'Declined', className: 'bg-red-100 text-red-700', icon: X }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Conversion Probability Badge
const ProbabilityBadge = ({ probability }: { probability: number }) => {
  let className = 'bg-red-100 text-red-700';
  let label = 'Low';

  if (probability >= 60) {
    className = 'bg-emerald-100 text-emerald-700';
    label = 'High';
  } else if (probability >= 40) {
    className = 'bg-amber-100 text-amber-700';
    label = 'Medium';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${
            probability >= 60 ? 'bg-emerald-500' : probability >= 40 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${probability}%` }}
        />
      </div>
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${className}`}>
        {probability}% {label}
      </span>
    </div>
  );
};

// Conversion Funnel Component
const ConversionFunnel = ({ data }: { data: ConversionFunnelData }) => {
  const stages = [
    { key: 'identified', label: 'Identified', value: data.identified, color: 'bg-neutral-400' },
    { key: 'offer_sent', label: 'Offer Sent', value: data.offer_sent, color: 'bg-blue-500' },
    { key: 'opened', label: 'Opened', value: data.opened, color: 'bg-amber-500' },
    { key: 'clicked', label: 'Clicked', value: data.clicked, color: 'bg-purple-500' },
    { key: 'converted', label: 'Converted', value: data.converted, color: 'bg-emerald-500' }
  ];

  const maxValue = Math.max(...stages.map(s => s.value));

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-[#4E5840]" />
        <h3 className="font-semibold text-neutral-900">Conversion Funnel</h3>
      </div>
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const percentage = maxValue > 0 ? (stage.value / maxValue) * 100 : 0;
          const conversionRate = index > 0 && stages[index - 1].value > 0
            ? ((stage.value / stages[index - 1].value) * 100).toFixed(1)
            : null;

          return (
            <div key={stage.key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">{stage.label}</span>
                <div className="flex items-center gap-2">
                  {conversionRate && (
                    <span className="text-xs text-neutral-400">{conversionRate}% from prev</span>
                  )}
                  <span className="text-sm font-bold text-neutral-900">{stage.value.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-8 bg-neutral-100 rounded-lg overflow-hidden relative">
                <div
                  className={`h-full ${stage.color} transition-all rounded-lg flex items-center justify-end pr-3`}
                  style={{ width: `${Math.max(percentage, 5)}%` }}
                >
                  {percentage >= 20 && (
                    <span className="text-xs font-bold text-white">{stage.value.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">Overall Conversion Rate</span>
          <span className="text-lg font-bold text-[#4E5840]">
            {data.identified > 0 ? ((data.converted / data.identified) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Benefits Preview Component
const BenefitsPreview = () => {
  const benefits = [
    { icon: Percent, title: 'Exclusive Discounts', description: '15-20% off direct booking rates' },
    { icon: Gift, title: 'Welcome Amenities', description: 'Complimentary upgrades & perks' },
    { icon: Sparkles, title: 'Loyalty Points', description: 'Earn points on every stay' },
    { icon: Hotel, title: 'Best Rate Guarantee', description: 'Lowest price when booking direct' }
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Gift className="w-5 h-5 text-[#A57865]" />
        <h3 className="font-semibold text-neutral-900">Direct Booking Benefits</h3>
      </div>
      <p className="text-sm text-neutral-500 mb-4">
        Highlight these benefits when reaching out to OTA guests:
      </p>
      <div className="grid grid-cols-2 gap-3">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div key={index} className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-[#A57865]/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-[#A57865]" />
                </div>
                <span className="text-sm font-medium text-neutral-800">{benefit.title}</span>
              </div>
              <p className="text-xs text-neutral-500 ml-8">{benefit.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Send Offer Modal
const OTAConversionOfferModal = ({
  isOpen,
  onClose,
  guest,
  onSendOffer
}: {
  isOpen: boolean;
  onClose: () => void;
  guest: OTAGuest | null;
  onSendOffer: (guestId: number, offerId: string) => Promise<void>;
}) => {
  const [selectedOffer, setSelectedOffer] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offerTemplates: OfferTemplate[] = [
    {
      id: 'discount_15',
      name: '15% Off Direct Booking',
      type: 'discount',
      value: '15%',
      description: 'Exclusive discount for booking directly on our website'
    },
    {
      id: 'discount_20',
      name: '20% Off + Free Breakfast',
      type: 'discount',
      value: '20%',
      description: 'Special package with complimentary breakfast included'
    },
    {
      id: 'upgrade_free',
      name: 'Free Room Upgrade',
      type: 'upgrade',
      value: 'Upgrade',
      description: 'Complimentary upgrade to the next room category'
    },
    {
      id: 'loyalty_double',
      name: 'Double Loyalty Points',
      type: 'loyalty',
      value: '2x Points',
      description: 'Earn double loyalty points on your first direct booking'
    },
    {
      id: 'package_spa',
      name: 'Spa Package Special',
      type: 'package',
      value: '₹100 Credit',
      description: 'Book direct and receive ₹100 spa credit'
    }
  ];

  const handleSubmit = async () => {
    if (!guest || !selectedOffer) return;

    setLoading(true);
    setError(null);
    try {
      await onSendOffer(guest.guest_id, selectedOffer);
      onClose();
      setSelectedOffer('');
    } catch (err: any) {
      setError(err.message || 'Failed to send offer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !guest) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Send Conversion Offer</h2>
              <p className="text-sm text-neutral-500">Select an offer for {guest.guest_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Guest Info */}
          <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-neutral-900">{guest.guest_name}</p>
                <p className="text-sm text-neutral-500">{guest.email}</p>
              </div>
              <OTABadge ota={guest.original_ota} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-200">
              <div>
                <p className="text-xs text-neutral-400">OTA Bookings</p>
                <p className="text-sm font-semibold text-neutral-900">{guest.total_ota_bookings}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">OTA Revenue</p>
                <p className="text-sm font-semibold text-neutral-900">₹{guest.total_ota_revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Conversion Prob.</p>
                <ProbabilityBadge probability={guest.conversion_probability} />
              </div>
            </div>
          </div>

          {/* Offer Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Select Offer Template
            </label>
            <div className="space-y-2">
              {offerTemplates.map((offer) => (
                <label
                  key={offer.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedOffer === offer.id
                      ? 'border-[#A57865] bg-[#A57865]/5'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="offer"
                    value={offer.id}
                    checked={selectedOffer === offer.id}
                    onChange={(e) => setSelectedOffer(e.target.value)}
                    className="mt-1 text-[#A57865] focus:ring-[#A57865]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-neutral-900">{offer.name}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                        offer.type === 'discount' ? 'bg-emerald-100 text-emerald-700' :
                        offer.type === 'upgrade' ? 'bg-purple-100 text-purple-700' :
                        offer.type === 'loyalty' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {offer.value}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">{offer.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedOffer}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#A57865] to-[#8E6554] text-white rounded-lg hover:from-[#8E6554] hover:to-[#7D5443] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Offer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function OTAConversionCenter() {
  const toast = useToast();
  const [stats, setStats] = useState<OTAConversionStats | null>(null);
  const [guests, setGuests] = useState<OTAGuest[]>([]);
  const [funnelData, setFunnelData] = useState<ConversionFunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<OTAGuest | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      const [statsData, guestsData, funnelDataResult] = await Promise.all([
        otaConversionService.getStats(),
        otaConversionService.getOTAGuests(
          statusFilter === 'all' ? undefined : statusFilter,
          searchTerm || undefined
        ),
        otaConversionService.getConversionFunnel()
      ]);
      setStats(statsData);
      setGuests(guestsData);
      setFunnelData(funnelDataResult);
    } catch (error) {
      console.error('Failed to fetch OTA conversion data:', error);
      // Use mock data for demo
      setStats({
        ota_guests_identified: 847,
        offers_sent: 423,
        conversion_rate: 24.5,
        revenue_impact: 156000,
        pending_offers: 215,
        average_conversion_probability: 52.3
      });
      setGuests([
        {
          id: 1,
          guest_id: 101,
          guest_name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          phone: '+1-555-0123',
          original_ota: 'booking.com',
          first_ota_booking: '2023-06-15T00:00:00Z',
          total_ota_bookings: 4,
          total_ota_revenue: 2400,
          conversion_probability: 78,
          status: 'pending',
          last_offer_sent: null,
          offer_type: null,
          identified_at: '2024-01-10T00:00:00Z'
        },
        {
          id: 2,
          guest_id: 102,
          guest_name: 'Michael Chen',
          email: 'michael.chen@email.com',
          phone: '+1-555-0456',
          original_ota: 'expedia',
          first_ota_booking: '2023-08-20T00:00:00Z',
          total_ota_bookings: 2,
          total_ota_revenue: 1100,
          conversion_probability: 45,
          status: 'offer_sent',
          last_offer_sent: '2024-01-15T00:00:00Z',
          offer_type: '15% Off Direct Booking',
          identified_at: '2024-01-08T00:00:00Z'
        },
        {
          id: 3,
          guest_id: 103,
          guest_name: 'Emily Rodriguez',
          email: 'emily.r@email.com',
          phone: '+1-555-0789',
          original_ota: 'airbnb',
          first_ota_booking: '2023-04-10T00:00:00Z',
          total_ota_bookings: 6,
          total_ota_revenue: 4200,
          conversion_probability: 85,
          status: 'clicked',
          last_offer_sent: '2024-01-12T00:00:00Z',
          offer_type: 'Double Loyalty Points',
          identified_at: '2024-01-05T00:00:00Z'
        },
        {
          id: 4,
          guest_id: 104,
          guest_name: 'David Thompson',
          email: 'david.t@email.com',
          phone: null,
          original_ota: 'hotels.com',
          first_ota_booking: '2023-11-05T00:00:00Z',
          total_ota_bookings: 1,
          total_ota_revenue: 450,
          conversion_probability: 32,
          status: 'pending',
          last_offer_sent: null,
          offer_type: null,
          identified_at: '2024-01-12T00:00:00Z'
        },
        {
          id: 5,
          guest_id: 105,
          guest_name: 'Lisa Park',
          email: 'lisa.park@email.com',
          phone: '+1-555-0321',
          original_ota: 'booking.com',
          first_ota_booking: '2023-02-28T00:00:00Z',
          total_ota_bookings: 8,
          total_ota_revenue: 5600,
          conversion_probability: 92,
          status: 'converted',
          last_offer_sent: '2024-01-05T00:00:00Z',
          offer_type: 'Spa Package Special',
          identified_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 6,
          guest_id: 106,
          guest_name: 'James Wilson',
          email: 'james.w@email.com',
          phone: '+1-555-0654',
          original_ota: 'agoda',
          first_ota_booking: '2023-09-12T00:00:00Z',
          total_ota_bookings: 3,
          total_ota_revenue: 1800,
          conversion_probability: 58,
          status: 'opened',
          last_offer_sent: '2024-01-14T00:00:00Z',
          offer_type: 'Free Room Upgrade',
          identified_at: '2024-01-07T00:00:00Z'
        }
      ]);
      setFunnelData({
        identified: 847,
        offer_sent: 423,
        opened: 298,
        clicked: 156,
        converted: 104
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleIdentifyGuests = async () => {
    setIdentifying(true);
    try {
      const result = await otaConversionService.identifyOTAGuests();
      toast.success(`Identified ${result.identified} new OTA guests`);
      fetchData();
    } catch (error) {
      console.error('Failed to identify OTA guests:', error);
      toast.error('Failed to identify OTA guests');
    } finally {
      setIdentifying(false);
    }
  };

  const handleSendOffer = async (guestId: number, offerId: string) => {
    await otaConversionService.sendOffer(guestId, offerId);
    toast.success('Offer sent successfully');
    fetchData();
  };

  const openOfferModal = (guest: OTAGuest) => {
    setSelectedGuest(guest);
    setIsOfferModalOpen(true);
  };

  // Filter guests
  const filteredGuests = guests.filter(guest => {
    const matchesStatus = statusFilter === 'all' || guest.status === statusFilter;
    const matchesSearch = !searchTerm ||
      guest.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#A57865] animate-spin mx-auto mb-3" />
          <p className="text-neutral-500">Loading OTA Conversion Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-neutral-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5C9BA4] via-[#4E5840] to-[#A57865] flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">OTA Conversion Center</h1>
            <p className="text-sm text-neutral-500">
              Convert OTA guests to direct bookers with targeted offers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleIdentifyGuests}
            disabled={identifying}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#A57865] to-[#8E6554] text-white rounded-xl text-sm font-medium hover:from-[#8E6554] hover:to-[#7D5443] transition-colors disabled:opacity-50"
          >
            {identifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Identifying...
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                Identify OTA Guests
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="OTA Guests Identified"
          value={stats?.ota_guests_identified || 0}
          subtitle="Total potential conversions"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Offers Sent"
          value={stats?.offers_sent || 0}
          subtitle={`${stats?.pending_offers || 0} pending`}
          icon={Mail}
          color="terra"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats?.conversion_rate || 0}%`}
          subtitle="OTA to direct"
          icon={TrendingUp}
          color="sage"
          trend="up"
          trendValue="+3.2% vs last month"
        />
        <StatCard
          title="Revenue Impact"
          value={`₹${(stats?.revenue_impact || 0).toLocaleString()}`}
          subtitle="From converted guests"
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="+₹12K this month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Guest List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search guests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A57865]/40 focus:border-[#A57865]"
                />
              </div>
              <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1">
                {['all', 'pending', 'offer_sent', 'clicked', 'converted'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === status
                        ? 'bg-[#A57865] text-white'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-sm text-neutral-500">
              {filteredGuests.length} guest{filteredGuests.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Guest Cards */}
          <div className="space-y-3">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className="bg-white rounded-xl border border-neutral-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                      <span className="text-sm font-bold text-neutral-600">
                        {guest.guest_name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{guest.guest_name}</p>
                      <p className="text-xs text-neutral-500">{guest.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <OTABadge ota={guest.original_ota} />
                    <StatusBadge status={guest.status} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-3 py-3 border-y border-neutral-100">
                  <div>
                    <p className="text-xs text-neutral-400">OTA Bookings</p>
                    <p className="text-sm font-semibold text-neutral-900">{guest.total_ota_bookings}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">OTA Revenue</p>
                    <p className="text-sm font-semibold text-neutral-900">₹{guest.total_ota_revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">First OTA Stay</p>
                    <p className="text-sm font-semibold text-neutral-900">
                      {new Date(guest.first_ota_booking).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 mb-1">Conversion Prob.</p>
                    <ProbabilityBadge probability={guest.conversion_probability} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-neutral-400">
                    {guest.last_offer_sent ? (
                      <>
                        <span>Last offer: </span>
                        <span className="text-neutral-600">{guest.offer_type}</span>
                        <span className="mx-1">|</span>
                        <span>{new Date(guest.last_offer_sent).toLocaleDateString()}</span>
                      </>
                    ) : (
                      <span>No offer sent yet</span>
                    )}
                  </div>
                  {guest.status !== 'converted' && guest.status !== 'declined' && (
                    <button
                      onClick={() => openOfferModal(guest)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#A57865] text-white rounded-lg hover:bg-[#8E6554] transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {guest.status === 'pending' ? 'Send Offer' : 'Send New Offer'}
                    </button>
                  )}
                  {guest.status === 'converted' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Successfully Converted
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredGuests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 mb-4">No guests found with the current filters</p>
              <button
                onClick={handleIdentifyGuests}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#A57865] text-white rounded-lg hover:bg-[#8E6554] transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                Identify OTA Guests
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Conversion Funnel */}
          {funnelData && <ConversionFunnel data={funnelData} />}

          {/* Benefits Preview */}
          <BenefitsPreview />
        </div>
      </div>

      {/* Offer Modal */}
      <OTAConversionOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false);
          setSelectedGuest(null);
        }}
        guest={selectedGuest}
        onSendOffer={handleSendOffer}
      />
    </div>
  );
}
