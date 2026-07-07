/**
 * OTA Conversion Service
 * Handles OTA to direct booking conversion operations for the CRM AI system
 */
import { apiClient as api } from '../client';

// Types
export interface OTAGuest {
  guest_id: number;
  guest_name: string;
  email: string;
  phone?: string;
  original_channel: string;
  conversion_probability: number;
  total_stays: number;
  total_spend: number;
  average_spend_per_stay: number;
  last_stay_date: string;
  first_stay_date?: string;
  status: 'identified' | 'offer_sent' | 'opened' | 'clicked' | 'converted' | 'declined';
  preferred_room_type?: string;
  booking_lead_time_avg?: number;
  loyalty_potential: 'high' | 'medium' | 'low';
}

export interface ConversionOffer {
  guest_id: number;
  conversion_probability: number;
  offer_type: 'discount' | 'points' | 'upgrade' | 'package' | 'loyalty_bonus';
  offer_value: number;
  offer_description?: string;
  message_preview: string;
  benefits: string[];
  valid_until?: string;
  terms_conditions?: string[];
  recommended_channel: 'email' | 'sms' | 'whatsapp';
}

export interface ConversionStats {
  total_ota_guests: number;
  identified_guests: number;
  offers_sent: number;
  offers_opened: number;
  offers_clicked: number;
  converted: number;
  conversion_rate: number;
  revenue_impact: number;
  commission_saved: number;
  average_conversion_value: number;
  top_converting_channels: {
    channel: string;
    conversions: number;
    rate: number;
  }[];
  period_comparison?: {
    current_period: number;
    previous_period: number;
    change_percentage: number;
  };
}

export interface SendOfferRequest {
  guest_id: number;
  offer_type?: 'discount' | 'points' | 'upgrade' | 'package' | 'loyalty_bonus';
  offer_value?: number;
  channel?: 'email' | 'sms' | 'whatsapp';
  custom_message?: string;
  use_ai_message?: boolean;
  valid_days?: number;
  include_benefits?: string[];
}

export interface ConversionAttempt {
  attempt_id: number;
  guest_id: number;
  guest_name: string;
  offer_type: string;
  offer_value: number;
  channel: string;
  status: 'sent' | 'opened' | 'clicked' | 'converted' | 'expired' | 'declined';
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  converted_at?: string;
  booking_id?: number;
  revenue_generated?: number;
}

export interface DirectBookingBenefits {
  tier: string;
  discount: number;
  benefits: string[];
  loyalty_points_multiplier?: number;
  exclusive_perks?: string[];
  tier_requirements?: {
    stays_required?: number;
    spend_required?: number;
  };
}

export interface OTAGuestListParams {
  limit?: number;
  offset?: number;
  min_probability?: number;
  max_probability?: number;
  status?: string;
  channel?: string;
  sort_by?: 'probability' | 'spend' | 'stays' | 'last_stay';
  sort_order?: 'asc' | 'desc';
}

// API Service
class OTAConversionService {
  private baseUrl = '/api/v1/crm-ai/ota-conversion';

  /**
   * Get list of OTA guests with conversion potential
   */
  async getOTAGuests(params: OTAGuestListParams = {}): Promise<{ count: number; guests: OTAGuest[] }> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.min_probability !== undefined) queryParams.append('min_probability', params.min_probability.toString());
    if (params.max_probability !== undefined) queryParams.append('max_probability', params.max_probability.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.channel) queryParams.append('channel', params.channel);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);

    const response = await api.get(`${this.baseUrl}/guests?${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Get a specific OTA guest by ID
   */
  async getOTAGuest(guestId: number): Promise<OTAGuest> {
    const response = await api.get(`${this.baseUrl}/guests/${guestId}`);
    return response.data.data || response.data;
  }

  /**
   * Generate a personalized conversion offer for a guest
   */
  async generateOffer(guestId: number, useAI = true): Promise<ConversionOffer> {
    const response = await api.post(`${this.baseUrl}/generate-offer`, {
      guest_id: guestId,
      use_ai_message: useAI
    });
    return response.data.data || response.data;
  }

  /**
   * Generate multiple offers for batch processing
   */
  async generateBatchOffers(
    guestIds: number[],
    useAI = true
  ): Promise<{ offers: ConversionOffer[]; failed: number[] }> {
    const response = await api.post(`${this.baseUrl}/generate-offers/batch`, {
      guest_ids: guestIds,
      use_ai_message: useAI
    });
    return response.data.data || response.data;
  }

  /**
   * Send a conversion offer to a guest
   */
  async sendOffer(request: SendOfferRequest): Promise<{ attempt_id: number; status: string; message: string }> {
    const response = await api.post(`${this.baseUrl}/send-offer`, request);
    return response.data.data || response.data;
  }

  /**
   * Send offers to multiple guests
   */
  async sendBatchOffers(
    requests: SendOfferRequest[]
  ): Promise<{ sent: number; failed: number; attempts: { guest_id: number; attempt_id?: number; error?: string }[] }> {
    const response = await api.post(`${this.baseUrl}/send-offers/batch`, { offers: requests });
    return response.data.data || response.data;
  }

  /**
   * Get conversion statistics
   */
  async getConversionStats(period?: 'day' | 'week' | 'month' | 'quarter' | 'year'): Promise<ConversionStats> {
    const queryParams = period ? `?period=${period}` : '';
    const response = await api.get(`${this.baseUrl}/stats${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Get direct booking benefits for a specific tier
   */
  async getDirectBookingBenefits(tier = 'bronze'): Promise<DirectBookingBenefits> {
    const response = await api.get(`${this.baseUrl}/benefits/${tier}`);
    return response.data.data || response.data;
  }

  /**
   * Get all available direct booking benefit tiers
   */
  async getAllBenefitTiers(): Promise<DirectBookingBenefits[]> {
    const response = await api.get(`${this.baseUrl}/benefits`);
    return response.data.data || response.data;
  }

  /**
   * Track a conversion event
   */
  async trackEvent(
    attemptId: number,
    eventType: 'opened' | 'clicked' | 'converted' | 'declined'
  ): Promise<{ success: boolean; event_recorded: boolean }> {
    const response = await api.post(`${this.baseUrl}/track/${attemptId}`, null, {
      params: { event_type: eventType }
    });
    return response.data.data || response.data;
  }

  /**
   * Get conversion attempts history
   */
  async getConversionAttempts(
    guestId?: number,
    status?: string,
    limit = 50
  ): Promise<{ count: number; attempts: ConversionAttempt[] }> {
    const queryParams = new URLSearchParams();
    if (guestId) queryParams.append('guest_id', guestId.toString());
    if (status) queryParams.append('status', status);
    queryParams.append('limit', limit.toString());

    const response = await api.get(`${this.baseUrl}/attempts?${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Get a specific conversion attempt
   */
  async getConversionAttempt(attemptId: number): Promise<ConversionAttempt> {
    const response = await api.get(`${this.baseUrl}/attempts/${attemptId}`);
    return response.data.data || response.data;
  }

  /**
   * Manually mark a guest as converted
   */
  async markAsConverted(
    guestId: number,
    bookingId: number,
    attemptId?: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`${this.baseUrl}/guests/${guestId}/convert`, {
      booking_id: bookingId,
      attempt_id: attemptId
    });
    return response.data.data || response.data;
  }

  /**
   * Get OTA channel breakdown
   */
  async getChannelBreakdown(): Promise<{
    channels: { channel: string; guest_count: number; potential_revenue: number; avg_probability: number }[];
  }> {
    const response = await api.get(`${this.baseUrl}/channels/breakdown`);
    return response.data.data || response.data;
  }

  /**
   * Calculate commission savings for a converted guest
   */
  async calculateCommissionSavings(
    guestId: number,
    bookingValue: number,
    originalChannel: string
  ): Promise<{ commission_rate: number; commission_saved: number; net_benefit: number }> {
    const response = await api.post(`${this.baseUrl}/calculate-savings`, {
      guest_id: guestId,
      booking_value: bookingValue,
      original_channel: originalChannel
    });
    return response.data.data || response.data;
  }
}

export const otaConversionService = new OTAConversionService();
export default otaConversionService;
