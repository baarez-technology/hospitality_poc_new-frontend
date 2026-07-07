/**
 * A/B Testing Service
 * Handles all A/B test operations for the CRM AI system
 */
import { apiClient as api } from '../client';

// Types
export interface ABTest {
  id: number;
  name: string;
  description?: string;
  test_type: 'subject_line' | 'offer' | 'template' | 'cta' | 'timing' | 'channel';
  campaign_id?: number;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  variants: ABTestVariant[];
  traffic_split?: Record<string, number>;
  significance_threshold: number;
  started_at?: string;
  ended_at?: string;
  winning_variant?: string;
  p_value?: number;
  statistical_significance?: number;
  results_summary?: ABTestResults;
  created_at: string;
  updated_at?: string;
}

export interface ABTestVariant {
  name: string;
  label?: string;
  content: Record<string, unknown>;
  traffic_percentage: number;
  impressions: number;
  conversions: number;
  conversion_rate?: number;
  revenue: number;
  is_control: boolean;
  is_winner: boolean;
}

export interface ABTestResults {
  winner?: string;
  p_value: number;
  confidence: number;
  lift: number;
  significant: boolean;
  variants: {
    name: string;
    impressions: number;
    conversions: number;
    rate: number;
    revenue: number;
  }[];
}

export interface CreateABTestRequest {
  name: string;
  description?: string;
  test_type: 'subject_line' | 'offer' | 'template' | 'cta' | 'timing' | 'channel';
  campaign_id?: number;
  variants: {
    name: string;
    label?: string;
    content: Record<string, unknown>;
    is_control?: boolean;
  }[];
  traffic_split?: Record<string, number>;
  significance_threshold?: number;
}

export interface UpdateABTestRequest {
  name?: string;
  description?: string;
  variants?: {
    name: string;
    label?: string;
    content: Record<string, unknown>;
    is_control?: boolean;
  }[];
  traffic_split?: Record<string, number>;
  significance_threshold?: number;
}

export interface ABTestListParams {
  status?: 'draft' | 'running' | 'paused' | 'completed' | 'stopped';
  test_type?: string;
  campaign_id?: number;
  limit?: number;
  offset?: number;
}

// API Service
class ABTestingService {
  private baseUrl = '/api/v1/crm-ai';

  /**
   * List all A/B tests with optional filtering
   */
  async listTests(params: ABTestListParams = {}): Promise<{ count: number; tests: ABTest[] }> {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.test_type) queryParams.append('test_type', params.test_type);
    if (params.campaign_id) queryParams.append('campaign_id', params.campaign_id.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`${this.baseUrl}/ab-tests?${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Get a specific A/B test by ID
   */
  async getTest(testId: number): Promise<ABTest> {
    const response = await api.get(`${this.baseUrl}/ab-tests/${testId}`);
    return response.data.data || response.data;
  }

  /**
   * Create a new A/B test
   */
  async createTest(request: CreateABTestRequest): Promise<ABTest> {
    const response = await api.post(`${this.baseUrl}/ab-tests`, request);
    return response.data.data || response.data;
  }

  /**
   * Update an existing A/B test
   */
  async updateTest(testId: number, updates: UpdateABTestRequest): Promise<ABTest> {
    const response = await api.patch(`${this.baseUrl}/ab-tests/${testId}`, updates);
    return response.data.data || response.data;
  }

  /**
   * Delete an A/B test
   */
  async deleteTest(testId: number): Promise<void> {
    await api.delete(`${this.baseUrl}/ab-tests/${testId}`);
  }

  /**
   * Start an A/B test
   */
  async startTest(testId: number): Promise<ABTest> {
    const response = await api.post(`${this.baseUrl}/ab-tests/${testId}/start`);
    return response.data.data || response.data;
  }

  /**
   * Pause a running A/B test
   */
  async pauseTest(testId: number): Promise<ABTest> {
    const response = await api.post(`${this.baseUrl}/ab-tests/${testId}/pause`);
    return response.data.data || response.data;
  }

  /**
   * Resume a paused A/B test
   */
  async resumeTest(testId: number): Promise<ABTest> {
    const response = await api.post(`${this.baseUrl}/ab-tests/${testId}/resume`);
    return response.data.data || response.data;
  }

  /**
   * Stop an A/B test
   */
  async stopTest(testId: number): Promise<ABTest> {
    const response = await api.post(`${this.baseUrl}/ab-tests/${testId}/stop`);
    return response.data.data || response.data;
  }

  /**
   * Get detailed results for an A/B test
   */
  async getTestResults(testId: number): Promise<ABTestResults> {
    const response = await api.get(`${this.baseUrl}/ab-tests/${testId}/results`);
    return response.data.data || response.data;
  }

  /**
   * Deploy the winning variant of a completed A/B test
   */
  async deployWinner(testId: number): Promise<{ deployed: boolean; variant: string; message: string }> {
    const response = await api.post(`${this.baseUrl}/ab-tests/${testId}/deploy-winner`);
    return response.data.data || response.data;
  }

  /**
   * Record an impression for a specific variant
   */
  async recordImpression(testId: number, variantName: string): Promise<void> {
    await api.post(`${this.baseUrl}/ab-tests/${testId}/impression`, {
      variant_name: variantName
    });
  }

  /**
   * Record a conversion for a specific variant
   */
  async recordConversion(
    testId: number,
    variantName: string,
    revenue?: number
  ): Promise<void> {
    await api.post(`${this.baseUrl}/ab-tests/${testId}/conversion`, {
      variant_name: variantName,
      revenue
    });
  }

  /**
   * Get tests by campaign ID
   */
  async getTestsByCampaign(campaignId: number): Promise<ABTest[]> {
    const response = await api.get(`${this.baseUrl}/campaigns/${campaignId}/ab-tests`);
    return response.data.data || response.data;
  }

  /**
   * Duplicate an existing A/B test
   */
  async duplicateTest(testId: number, newName?: string): Promise<ABTest> {
    const response = await api.post(`${this.baseUrl}/ab-tests/${testId}/duplicate`, {
      name: newName
    });
    return response.data.data || response.data;
  }
}

export const abTestingService = new ABTestingService();
export default abTestingService;
