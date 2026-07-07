/**
 * AI Segmentation Service
 * Handles AI-powered guest segmentation operations for the CRM AI system
 */
import { apiClient as api } from '../client';

// Types
export interface AISegment {
  id: number;
  name: string;
  slug: string;
  description?: string;
  segment_type: 'behavioral' | 'demographic' | 'value' | 'lifecycle' | 'predictive' | 'custom';
  criteria: SegmentCriteria;
  member_count: number;
  avg_ltv: number;
  avg_health_score: number;
  avg_churn_risk: number;
  is_dynamic: boolean;
  is_ai_generated: boolean;
  ai_confidence?: number;
  last_calculated_at: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  status: 'active' | 'inactive' | 'archived';
}

export interface SegmentCriteria {
  filters: SegmentFilter[];
  logic: 'AND' | 'OR';
  nested_groups?: {
    filters: SegmentFilter[];
    logic: 'AND' | 'OR';
  }[];
}

export interface SegmentFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with' | 'is_null' | 'is_not_null';
  value: string | number | boolean | (string | number)[];
  value_type?: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface SegmentMember {
  guest_id: number;
  guest_name: string;
  email: string;
  health_score: number;
  churn_risk: number;
  ltv: number;
  loyalty_tier?: string;
  vip_status: boolean;
  total_stays: number;
  total_spend: number;
  last_stay_date?: string;
  segment_score?: number;
  added_at: string;
}

export interface SegmentStats {
  total_segments: number;
  active_segments: number;
  ai_generated_segments: number;
  total_segmented_guests: number;
  avg_segment_size: number;
  segments_by_type: Record<string, number>;
  last_ai_analysis: string;
}

export interface CreateSegmentRequest {
  name: string;
  description?: string;
  segment_type: 'behavioral' | 'demographic' | 'value' | 'lifecycle' | 'predictive' | 'custom';
  criteria: SegmentCriteria;
  is_dynamic?: boolean;
  status?: 'active' | 'inactive';
}

export interface UpdateSegmentRequest {
  name?: string;
  description?: string;
  segment_type?: 'behavioral' | 'demographic' | 'value' | 'lifecycle' | 'predictive' | 'custom';
  criteria?: SegmentCriteria;
  is_dynamic?: boolean;
  status?: 'active' | 'inactive' | 'archived';
}

export interface AISegmentSuggestion {
  name: string;
  description: string;
  segment_type: string;
  criteria: SegmentCriteria;
  estimated_size: number;
  confidence: number;
  reasoning: string;
  use_cases: string[];
}

export interface SegmentOverlap {
  segment_a: { id: number; name: string };
  segment_b: { id: number; name: string };
  overlap_count: number;
  overlap_percentage: number;
  unique_to_a: number;
  unique_to_b: number;
}

export interface SegmentPerformance {
  segment_id: number;
  segment_name: string;
  total_members: number;
  avg_conversion_rate: number;
  avg_response_rate: number;
  total_revenue: number;
  avg_revenue_per_member: number;
  campaigns_sent: number;
  period: string;
}

export interface SegmentListParams {
  segment_type?: string;
  status?: 'active' | 'inactive' | 'archived';
  is_ai_generated?: boolean;
  is_dynamic?: boolean;
  search?: string;
  sort_by?: 'name' | 'member_count' | 'avg_ltv' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SegmentMemberListParams {
  search?: string;
  sort_by?: 'name' | 'health_score' | 'ltv' | 'churn_risk' | 'added_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Available filter fields for segmentation
export interface SegmentField {
  field: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array';
  category: string;
  operators: string[];
  values?: { value: string | number; label: string }[];
}

// API Service
class AISegmentationService {
  private baseUrl = '/api/v1/crm-ai/segmentation';

  // Segment CRUD Operations

  /**
   * Get all segments with filtering
   */
  async getSegments(params: SegmentListParams = {}): Promise<{ count: number; segments: AISegment[] }> {
    const queryParams = new URLSearchParams();
    if (params.segment_type) queryParams.append('segment_type', params.segment_type);
    if (params.status) queryParams.append('status', params.status);
    if (params.is_ai_generated !== undefined) queryParams.append('is_ai_generated', params.is_ai_generated.toString());
    if (params.is_dynamic !== undefined) queryParams.append('is_dynamic', params.is_dynamic.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`${this.baseUrl}/segments?${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Get a specific segment by ID
   */
  async getSegment(segmentId: number): Promise<AISegment> {
    const response = await api.get(`${this.baseUrl}/segments/${segmentId}`);
    return response.data.data || response.data;
  }

  /**
   * Get segment by slug
   */
  async getSegmentBySlug(slug: string): Promise<AISegment> {
    const response = await api.get(`${this.baseUrl}/segments/slug/${slug}`);
    return response.data.data || response.data;
  }

  /**
   * Create a new segment
   */
  async createSegment(request: CreateSegmentRequest): Promise<AISegment> {
    const response = await api.post(`${this.baseUrl}/segments`, request);
    return response.data.data || response.data;
  }

  /**
   * Update an existing segment
   */
  async updateSegment(segmentId: number, updates: UpdateSegmentRequest): Promise<AISegment> {
    const response = await api.patch(`${this.baseUrl}/segments/${segmentId}`, updates);
    return response.data.data || response.data;
  }

  /**
   * Delete a segment
   */
  async deleteSegment(segmentId: number): Promise<void> {
    await api.delete(`${this.baseUrl}/segments/${segmentId}`);
  }

  /**
   * Archive a segment
   */
  async archiveSegment(segmentId: number): Promise<AISegment> {
    const response = await api.post(`${this.baseUrl}/segments/${segmentId}/archive`);
    return response.data.data || response.data;
  }

  /**
   * Duplicate a segment
   */
  async duplicateSegment(segmentId: number, newName?: string): Promise<AISegment> {
    const response = await api.post(`${this.baseUrl}/segments/${segmentId}/duplicate`, {
      name: newName
    });
    return response.data.data || response.data;
  }

  // Segment Members

  /**
   * Get members of a segment
   */
  async getSegmentMembers(
    segmentId: number,
    params: SegmentMemberListParams = {}
  ): Promise<{ count: number; members: SegmentMember[] }> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`${this.baseUrl}/segments/${segmentId}/members?${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Add guests to a static segment manually
   */
  async addMembersToSegment(segmentId: number, guestIds: number[]): Promise<{ added: number; already_in_segment: number }> {
    const response = await api.post(`${this.baseUrl}/segments/${segmentId}/members`, {
      guest_ids: guestIds
    });
    return response.data.data || response.data;
  }

  /**
   * Remove guests from a static segment
   */
  async removeMembersFromSegment(segmentId: number, guestIds: number[]): Promise<{ removed: number }> {
    const response = await api.delete(`${this.baseUrl}/segments/${segmentId}/members`, {
      data: { guest_ids: guestIds }
    });
    return response.data.data || response.data;
  }

  /**
   * Get segments a guest belongs to
   */
  async getGuestSegments(guestId: number): Promise<AISegment[]> {
    const response = await api.get(`${this.baseUrl}/guests/${guestId}/segments`);
    return response.data.data || response.data;
  }

  // Segment Calculations

  /**
   * Recalculate segment membership
   */
  async recalculateSegment(segmentId: number): Promise<{ previous_count: number; new_count: number; calculated_at: string }> {
    const response = await api.post(`${this.baseUrl}/segments/${segmentId}/recalculate`);
    return response.data.data || response.data;
  }

  /**
   * Preview segment criteria (without saving)
   */
  async previewSegment(criteria: SegmentCriteria): Promise<{ count: number; sample_members: SegmentMember[] }> {
    const response = await api.post(`${this.baseUrl}/preview`, { criteria });
    return response.data.data || response.data;
  }

  /**
   * Validate segment criteria
   */
  async validateCriteria(criteria: SegmentCriteria): Promise<{ valid: boolean; errors: string[] }> {
    const response = await api.post(`${this.baseUrl}/validate`, { criteria });
    return response.data.data || response.data;
  }

  // AI-Powered Features

  /**
   * Get AI-generated segment suggestions
   */
  async getAISuggestions(maxSuggestions = 5): Promise<AISegmentSuggestion[]> {
    const response = await api.get(`${this.baseUrl}/ai/suggestions?max=${maxSuggestions}`);
    return response.data.data || response.data;
  }

  /**
   * Generate segments using AI analysis
   */
  async generateAISegments(options?: {
    min_segment_size?: number;
    max_segments?: number;
    focus_areas?: string[];
  }): Promise<{ segments_created: number; segments: AISegment[] }> {
    const response = await api.post(`${this.baseUrl}/ai/generate`, options || {});
    return response.data.data || response.data;
  }

  /**
   * Get AI insights for a segment
   */
  async getSegmentInsights(segmentId: number): Promise<{
    key_characteristics: string[];
    behavioral_patterns: string[];
    recommended_actions: { action: string; priority: string; expected_impact: string }[];
    similar_segments: { id: number; name: string; similarity: number }[];
  }> {
    const response = await api.get(`${this.baseUrl}/segments/${segmentId}/insights`);
    return response.data.data || response.data;
  }

  /**
   * Get natural language query to segment
   */
  async queryToSegment(query: string): Promise<{
    interpreted_query: string;
    criteria: SegmentCriteria;
    estimated_count: number;
    confidence: number;
  }> {
    const response = await api.post(`${this.baseUrl}/ai/query-to-segment`, { query });
    return response.data.data || response.data;
  }

  // Analytics & Reporting

  /**
   * Get segmentation statistics
   */
  async getStats(): Promise<SegmentStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data.data || response.data;
  }

  /**
   * Get segment overlap analysis
   */
  async getSegmentOverlap(segmentIds: number[]): Promise<SegmentOverlap[]> {
    const response = await api.post(`${this.baseUrl}/overlap`, { segment_ids: segmentIds });
    return response.data.data || response.data;
  }

  /**
   * Get segment performance metrics
   */
  async getSegmentPerformance(
    segmentId: number,
    period?: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<SegmentPerformance> {
    const queryParams = period ? `?period=${period}` : '';
    const response = await api.get(`${this.baseUrl}/segments/${segmentId}/performance${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Compare multiple segments
   */
  async compareSegments(segmentIds: number[]): Promise<{
    segments: {
      id: number;
      name: string;
      member_count: number;
      avg_ltv: number;
      avg_health_score: number;
      avg_churn_risk: number;
      total_revenue: number;
    }[];
    comparison_insights: string[];
  }> {
    const response = await api.post(`${this.baseUrl}/compare`, { segment_ids: segmentIds });
    return response.data.data || response.data;
  }

  /**
   * Export segment members
   */
  async exportSegmentMembers(
    segmentId: number,
    format: 'csv' | 'json' = 'csv'
  ): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/segments/${segmentId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }

  // Configuration

  /**
   * Get available segment fields
   */
  async getAvailableFields(): Promise<SegmentField[]> {
    const response = await api.get(`${this.baseUrl}/fields`);
    return response.data.data || response.data;
  }

  /**
   * Get segment types
   */
  async getSegmentTypes(): Promise<{ type: string; label: string; description: string }[]> {
    const response = await api.get(`${this.baseUrl}/types`);
    return response.data.data || response.data;
  }
}

export const aiSegmentationService = new AISegmentationService();
export default aiSegmentationService;
