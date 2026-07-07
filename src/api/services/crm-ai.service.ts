/**
 * CRM AI Service - ReConnect AI Integration
 * Provides access to guest intelligence, churn prediction, LTV, sentiment analysis, and campaign optimization
 */
import { apiClient as api, cachedGet, clearApiCache } from '../client';

// Types
export interface GuestIntelligence {
  guest_id: number;
  guest_info: {
    name: string;
    email: string;
    vip_status: boolean;
    loyalty_tier: string;
  };
  scores: {
    health: {
      score: number;
      label: string;
      components: Record<string, number>;
    };
    churn: {
      probability: number;
      risk_level: string;
      is_high_risk: boolean;
      drivers: Array<{
        factor: string;
        description: string;
        risk_contribution: number;
      }>;
    };
    ltv: {
      predicted_value: number;
      historical_value: number;
      future_value: number;
      segment: string;
    };
    rebooking: {
      probability: number;
      likelihood: string;
      optimal_contact: {
        days_until_optimal_contact: number;
        timing_window: string;
        recommendation: string;
      };
    };
  };
  campaign_recommendation: {
    recommended_campaign: {
      type: string;
      priority: string;
      segment: string;
    };
    channel_recommendation: {
      primary_channel: string;
      confidence: number;
    };
    content_recommendation: {
      subject_line_suggestions: string[];
      offer_recommendations: Array<{
        type: string;
        value: string;
        description: string;
      }>;
    };
  };
  alerts: Array<{
    type: string;
    priority: string;
    message: string;
  }>;
  key_insights: string[];
  recommended_actions: Array<{
    action: string;
    priority: string;
    category: string;
  }>;
  calculated_at: string;
}

export interface DashboardStats {
  total_guests: number;
  guests_analyzed: number;
  health_distribution: {
    excellent: number;
    good: number;
    fair: number;
    at_risk: number;
    critical: number;
  };
  average_health_score: number;
  average_churn_risk: number;
  open_alerts: number;
  recovery_pending: number;
  last_updated: string;
}

export interface AtRiskGuest {
  guest_id: number;
  guest_name: string;
  email: string;
  priority: string;
  churn_probability: number;
  alert_message: string;
  days_since_alert: number;
  vip_status: boolean;
}

export interface RecoveryOpportunity {
  recovery_id: number;
  guest_id: number;
  guest_name: string;
  issue_type: string;
  issue_description: string;
  severity: number;
  recommended_actions: string[];
  detected_at: string;
  status: string;
}

export interface SentimentAnalysis {
  sentiment_score: number;
  sentiment_label: string;
  primary_emotion: string;
  emotion_intensity: number;
  aspect_sentiments: Record<string, { sentiment: number; mentions: number; label: string }>;
  triggers: Array<{ aspect?: string; keyword?: string; sentiment: string; type: string }>;
  analysis_summary: string;
  confidence: number;
}

export interface CampaignRecommendations {
  win_back: CampaignGuest[];
  loyalty: CampaignGuest[];
  upsell: CampaignGuest[];
  direct_booking: CampaignGuest[];
}

interface CampaignGuest {
  guest_id: number;
  guest_name: string;
  priority: string;
  channel: string;
  predicted_conversion: number;
  ltv: number;
}

export interface AIAlert {
  id: number;
  guest_id: number;
  guest_name: string;
  alert_type: string;
  priority: string;
  title: string;
  message: string;
  trigger_value: number;
  status: string;
  created_at: string;
}

export interface SegmentAnalysis {
  total_analyzed: number;
  health_segments: Record<string, number>;
  churn_segments: Record<string, number>;
  ltv_segments: Record<string, number>;
  analyzed_at: string;
}

export interface SidebarStats {
  total_guests: number;
  loyalty_members: number;
  vip_guests: number;
  avg_ltv: number;
  at_risk_count: number;
  recovery_pending: number;
  open_alerts: number;
  campaigns_active: number;
}

// API Service
class CRMAIService {
  private baseUrl = '/api/v1/crm-ai';

  // Dashboard - use cached requests to prevent duplicate calls
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await cachedGet(`${this.baseUrl}/dashboard`);
    return response.data.data;
  }

  async getSidebarStats(): Promise<SidebarStats> {
    const response = await cachedGet(`${this.baseUrl}/sidebar-stats`);
    return response.data.data;
  }

  // Guest Intelligence - cached since these are expensive AI calls
  async getGuestIntelligence(guestId: number, includeHistory = false): Promise<GuestIntelligence> {
    const response = await cachedGet(`${this.baseUrl}/guests/${guestId}/intelligence`, {
      params: { include_history: includeHistory }
    });
    return response.data.data;
  }

  async getGuestHealthScore(guestId: number): Promise<any> {
    const response = await cachedGet(`${this.baseUrl}/guests/${guestId}/health-score`);
    return response.data.data;
  }

  async getGuestChurnRisk(guestId: number): Promise<any> {
    const response = await cachedGet(`${this.baseUrl}/guests/${guestId}/churn-risk`);
    return response.data.data;
  }

  async getGuestLTV(guestId: number): Promise<any> {
    const response = await cachedGet(`${this.baseUrl}/guests/${guestId}/ltv`);
    return response.data.data;
  }

  async getGuestRebookingProbability(guestId: number, timeframeDays = 90): Promise<any> {
    const response = await cachedGet(`${this.baseUrl}/guests/${guestId}/rebooking`, {
      params: { timeframe_days: timeframeDays }
    });
    return response.data.data;
  }

  // Sentiment Analysis
  async analyzeGuestSentiment(
    guestId: number,
    text: string,
    source = 'feedback',
    bookingId?: number
  ): Promise<{ guest_id: number; analysis: SentimentAnalysis; recovery_triggered: boolean }> {
    const response = await api.post(`${this.baseUrl}/guests/${guestId}/sentiment`, {
      text,
      source,
      booking_id: bookingId
    });
    return response.data.data;
  }

  async getGuestSentimentTimeline(guestId: number, days = 90): Promise<any> {
    const response = await cachedGet(`${this.baseUrl}/guests/${guestId}/sentiment/timeline`, {
      params: { days }
    });
    return response.data.data;
  }

  async analyzeTextSentiment(text: string, source = 'feedback'): Promise<SentimentAnalysis> {
    const response = await api.post(`${this.baseUrl}/sentiment/analyze`, { text, source });
    return response.data.data;
  }

  // At-Risk Guests & Recovery - cached
  async getAtRiskGuests(limit = 50, minChurnRisk = 60): Promise<{ at_risk_count: number; guests: AtRiskGuest[] }> {
    const response = await cachedGet(`${this.baseUrl}/at-risk-guests`, {
      params: { limit, min_churn_risk: minChurnRisk }
    });
    return response.data.data;
  }

  async getRecoveryOpportunities(status = 'detected', limit = 20): Promise<{ count: number; opportunities: RecoveryOpportunity[] }> {
    const response = await cachedGet(`${this.baseUrl}/recovery/opportunities`, {
      params: { status, limit }
    });
    return response.data.data;
  }

  async resolveRecovery(
    recoveryId: number,
    actionTaken: string,
    compensationOffered?: string,
    compensationValue?: number
  ): Promise<any> {
    const response = await api.post(`${this.baseUrl}/recovery/${recoveryId}/resolve`, {
      action_taken: actionTaken,
      compensation_offered: compensationOffered,
      compensation_value: compensationValue
    });
    return response.data;
  }

  // Campaign Optimization - cached
  async getCampaignRecommendations(campaignType?: string, limit = 100): Promise<CampaignRecommendations> {
    const response = await cachedGet(`${this.baseUrl}/campaigns/recommendations`, {
      params: { campaign_type: campaignType, limit }
    });
    return response.data.data;
  }

  async getGuestCampaignRecommendation(guestId: number): Promise<any> {
    const response = await cachedGet(`${this.baseUrl}/guests/${guestId}/campaign-recommendation`);
    return response.data.data;
  }

  // Alerts - cached
  async getAIAlerts(status = 'open', priority?: string, limit = 50): Promise<{ count: number; alerts: AIAlert[] }> {
    const response = await cachedGet(`${this.baseUrl}/alerts`, {
      params: { status, priority, limit }
    });
    return response.data.data;
  }

  async updateAlert(alertId: number, status: string, resolutionNotes?: string): Promise<any> {
    const response = await api.patch(`${this.baseUrl}/alerts/${alertId}`, {
      status,
      resolution_notes: resolutionNotes
    });
    return response.data;
  }

  // Batch & Segments
  async batchCalculateScores(guestIds: number[]): Promise<any> {
    const response = await api.post(`${this.baseUrl}/batch/calculate-scores`, {
      guest_ids: guestIds
    });
    return response.data.data;
  }

  async getSegmentAnalysis(): Promise<SegmentAnalysis> {
    const response = await cachedGet(`${this.baseUrl}/segments/analysis`);
    return response.data.data;
  }

  // CRM Page Data Endpoints - cached to prevent duplicate fetches
  async getCRMGuests(page = 1, pageSize = 100): Promise<{
    guests: CRMGuest[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    try {
      const response = await cachedGet(`${this.baseUrl}/crm-guests`, {
        params: { page, page_size: pageSize }
      });
      // Handle both wrapped and unwrapped responses
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error('[CRMAIService.getCRMGuests] Error:', error);
      throw error;
    }
  }

  async getCRMSegments(): Promise<{
    segments: CRMSegment[];
    total: number;
  }> {
    try {
      const response = await cachedGet(`${this.baseUrl}/crm-segments`);
      // Handle both wrapped and unwrapped responses
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error('[CRMAIService.getCRMSegments] Error:', error);
      throw error;
    }
  }

  /**
   * Create a custom CRM segment (persisted). Segment will appear in the list after refresh.
   */
  async createCRMSegment(segment: {
    name: string;
    description?: string;
    filters?: Record<string, unknown>;
    guestCount: number;
    avgRevenue: number;
    repeatRate: number;
    color?: string;
    icon?: string;
  }): Promise<CRMSegment> {
    const conditions = this.filtersToConditions(segment.filters || {});
    const response = await api.post(`${this.baseUrl}/crm-segments`, {
      name: segment.name,
      description: segment.description ?? '',
      conditions,
      guestCount: segment.guestCount,
      avgRevenue: segment.avgRevenue,
      repeatRate: segment.repeatRate,
      color: segment.color ?? '#6B7280',
      icon: segment.icon ?? 'users',
    });
    clearApiCache('crm-segments');
    const data = response.data?.data ?? response.data;
    return data as CRMSegment;
  }

  /**
   * Update an existing CRM segment. Persists color, filters (loyalty tier, booking source, room types, tags, etc.) to the server.
   * Encodes segmentId for URL (e.g. seg-vip:1 → seg-vip%3A1). Tries PUT then PATCH on 405. On 400, retries with minimal body (no computed stats).
   */
  async updateCRMSegment(
    segmentId: string,
    segment: {
      name: string;
      description?: string;
      filters?: Record<string, unknown>;
      guestCount: number;
      avgRevenue: number;
      repeatRate: number;
      color?: string;
      icon?: string;
    }
  ): Promise<CRMSegment> {
    const conditions = this.filtersToConditions(segment.filters || {});
    const encodedId = encodeURIComponent(segmentId);
    const url = `${this.baseUrl}/crm-segments/${encodedId}`;
    const fullBody = {
      name: segment.name,
      description: segment.description ?? '',
      conditions,
      guestCount: segment.guestCount,
      avgRevenue: segment.avgRevenue,
      repeatRate: segment.repeatRate,
      color: segment.color ?? '#6B7280',
      icon: segment.icon ?? 'users',
    };
    const minimalBody = {
      name: segment.name,
      description: segment.description ?? '',
      conditions,
      color: segment.color ?? '#6B7280',
      icon: segment.icon ?? 'users',
    };

    const doRequest = async (body: object, method: 'put' | 'patch' = 'put'): Promise<any> => {
      if (method === 'put') return await api.put(url, body);
      return await api.patch(url, body);
    };

    let response: any;
    try {
      response = await doRequest(fullBody, 'put');
    } catch (err: any) {
      if (err?.response?.status === 405) {
        response = await doRequest(fullBody, 'patch');
      } else if (err?.response?.status === 400) {
        try {
          response = await doRequest(minimalBody, 'put');
        } catch (e2: any) {
          if (e2?.response?.status === 405) {
            response = await doRequest(minimalBody, 'patch');
          } else {
            throw e2;
          }
        }
      } else {
        throw err;
      }
    }
    clearApiCache('crm-segments');
    const data = response.data?.data ?? response.data;
    return data as CRMSegment;
  }

  /**
   * Delete a CRM segment by id. Tries crm-segments first; on 404, tries segmentation/segments (numeric id).
   * @returns true if the server deleted the segment, false if the server does not support delete (404 on both attempts).
   * @throws for non-404 errors (e.g. 500, network error).
   */
  async deleteCRMSegment(segmentId: string): Promise<boolean> {
    const tryDelete = async (url: string): Promise<boolean> => {
      try {
        await api.delete(url);
        return true;
      } catch (e: any) {
        if (e?.response?.status === 404) return false;
        throw e;
      }
    };
    const numId = parseInt(segmentId, 10);
    const deleted =
      (await tryDelete(`${this.baseUrl}/crm-segments/${segmentId}`)) ||
      (!Number.isNaN(numId) ? await tryDelete(`${this.baseUrl}/segmentation/segments/${numId}`) : false);
    if (deleted) clearApiCache('crm-segments');
    return deleted;
  }

  /** Convert filter object from CreateSegmentModal to API conditions array */
  private filtersToConditions(filters: Record<string, unknown>): Array<{ field: string; operator: string; value: unknown }> {
    const conditions: Array<{ field: string; operator: string; value: unknown }> = [];
    if (filters.loyaltyTier && filters.loyaltyTier !== 'all') {
      conditions.push({ field: 'loyaltyTier', operator: '==', value: filters.loyaltyTier });
    }
    if (filters.minStays !== undefined && filters.minStays !== '') {
      conditions.push({ field: 'totalStays', operator: '>=', value: Number(filters.minStays) });
    }
    if (filters.maxStays !== undefined && filters.maxStays !== '') {
      conditions.push({ field: 'totalStays', operator: '<=', value: Number(filters.maxStays) });
    }
    if (filters.bookingSource && filters.bookingSource !== 'all') {
      conditions.push({ field: 'bookingSource', operator: '==', value: filters.bookingSource });
    }
    if (filters.minSpend !== undefined && filters.minSpend !== '') {
      conditions.push({ field: 'totalRevenue', operator: '>=', value: Number(filters.minSpend) });
    }
    if (filters.maxSpend !== undefined && filters.maxSpend !== '') {
      conditions.push({ field: 'totalRevenue', operator: '<=', value: Number(filters.maxSpend) });
    }
    if (filters.lastStayDays !== undefined && filters.lastStayDays !== '') {
      conditions.push({ field: 'lastStay', operator: 'within', value: `${filters.lastStayDays}d` });
    }
    if (filters.country && String(filters.country).trim()) {
      conditions.push({ field: 'country', operator: '==', value: filters.country });
    }
    if (filters.roomType && filters.roomType !== 'all') {
      conditions.push({ field: 'roomType', operator: '==', value: filters.roomType });
    }
    if (Array.isArray(filters.tags) && filters.tags.length > 0) {
      conditions.push({ field: 'tags', operator: 'in', value: filters.tags });
    }
    return conditions;
  }

  async getCRMStats(): Promise<CRMStats> {
    try {
      const response = await cachedGet(`${this.baseUrl}/crm-stats`);
      // Handle both wrapped and unwrapped responses
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error('[CRMAIService.getCRMStats] Error:', error);
      throw error;
    }
  }

  // AI Suggestions - cached (expensive AI operation)
  async getAISuggestions(): Promise<AISuggestions> {
    try {
      const response = await cachedGet(`${this.baseUrl}/ai-suggestions`);
      // Handle both wrapped and unwrapped responses
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      console.error('[CRMAIService.getAISuggestions] Error:', error);
      throw error;
    }
  }
}

// CRM Page Types
export interface CRMGuest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  country: string;
  totalStays: number;
  totalNights: number;
  totalRevenue: number;
  loyaltyTier: string | null;
  lastStay: string | null;
  bookingSource: string;
  preferredRoomType: string;
  tags: string[];
  createdAt: string | null;
}

export interface CRMSegment {
  id: string;
  name: string;
  description: string;
  conditions: Array<{ field: string; operator: string; value: any }>;
  guestCount: number;
  avgRevenue: number;
  repeatRate: number;
  color: string;
  icon: string;
}

export interface CRMStats {
  totalGuests: number;
  repeatGuests: number;
  avgLTV: number;
  vipGuests: number;
  loyaltyMembers: number;
  activeCampaigns: number;
  engagementRate: number;
}

// AI Suggestions Types
export interface CampaignSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  target_count: number;
  estimated_impact: string;
  recommended_offer: string;
  best_channel: string;
  icon: string;
}

export interface SegmentInsight {
  title: string;
  insight: string;
  recommendation: string;
  icon: string;
}

export interface ActionItem {
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  action_type: string;
  icon: string;
}

export interface QuickWin {
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  icon: string;
}

export interface AISuggestions {
  campaign_suggestions: CampaignSuggestion[];
  segment_insights: SegmentInsight[];
  action_items: ActionItem[];
  quick_wins: QuickWin[];
  analyzed_guests: number;
  generated_at: string;
}

export const crmAIService = new CRMAIService();
export default crmAIService;
