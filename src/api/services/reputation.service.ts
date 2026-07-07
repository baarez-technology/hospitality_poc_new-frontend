/**
 * Reputation AI Service
 * Provides access to reputation dashboard, analytics, reviews, and AI response generation
 */
import { apiClient as api } from '../client';

// Types
export interface ReputationMetrics {
  total_reviews: number;
  average_rating: number;
  response_rate: number;
  nps_score: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface SourceBreakdown {
  source: string;
  count: number;
  average_rating: number;
  avg_rating?: number;   // Backend may send this field name
  response_rate: number;
}

export interface Review {
  id: number;
  guest_name: string;
  guest_email?: string;
  source: string;
  rating: number;
  title?: string;
  content: string;
  comment?: string;
  review_date?: string;
  date?: string;
  sentiment_score?: number;
  sentiment_label?: string;
  sentiment?: string | number;  // Backend sends string, context converts to number for UI
  keywords: string[];
  created_at: string;
  responded: boolean;
  has_response?: boolean;
  response?: string;           // Backend sends this field
  response_text?: string;
  response_date?: string;
  responded_at?: string;       // Backend sends this field
  responded_by?: number;
}

export interface ResponseTemplate {
  id: number;
  name: string;
  content: string;
  sentiment: string;  // positive, neutral, negative
  tone: string;  // professional, friendly, etc.
  language?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ReputationDashboard {
  metrics: ReputationMetrics;
  source_breakdown: SourceBreakdown[];
  recent_reviews: Review[];
  rating_trend: Array<{ date: string; rating: number; count: number }>;
  sentiment_trend: Array<{ date: string; positive: number; neutral: number; negative: number; score?: number }>;
  sentiment_trends?: Array<{ date: string; positive: number; neutral: number; negative: number; score?: number }>;  // Backend may send this field name
  pending_responses: number;
  active_goals?: Array<{
    id: number;
    metric_type: string;
    target_value: number;
    current_value: number;
    progress: number;
    status: string;
  }>;
  goals: Array<{
    id: number;
    metric_type: string;
    target_value: number;
    current_value: number;
    progress: number;
    status: string;
  }>;
}

export interface ReviewAnalytics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: Record<string, number>;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  top_keywords: Array<{ keyword: string; count: number; sentiment: string }>;
  source_performance: SourceBreakdown[];
  period: { start: string; end: string };
}

export interface TrendData {
  current_period: {
    avg_rating: number;
    avg_sentiment: number;
    review_count: number;
  };
  previous_period: {
    avg_rating: number;
    avg_sentiment: number;
    review_count: number;
  };
  rating_trend: string;
  rating_change: number;
  sentiment_trend: string;
  sentiment_change: number;
  volume_trend: string;
  volume_change: number;
}

export interface ResponseDraft {
  id: number;
  review_id: number;
  draft_text: string;
  tone: string;
  generated_at: string;
  status: string;
  approval_stage?: number;
  current_stage?: string;
  approvers?: ApprovalHistory[];
}

export interface ApprovalHistory {
  stage: number;
  stage_name: string;
  approver_id: number;
  approver_name: string;
  action: string;
  comment?: string;
  timestamp: string;
}

export interface CompetitorBenchmark {
  competitor_name: string;
  avg_rating: number;
  review_count: number;
  response_rate: number;
  sentiment_score: number;
}

// New interfaces for enhanced functionality
export interface Alert {
  id: number;
  alert_type: string;
  category_id: number;
  category_name?: string;
  start_date: string;
  end_date: string;
  issue_count: number;
  severity_score: number;
  status: string;
  rca_analysis?: {
    root_cause?: string;
    affected_reviews?: number[];
    recommendations?: string[];
    severity_breakdown?: Record<string, number>;
  };
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  icon?: string;
  color?: string;
  is_active: boolean;
  routing_rules?: RoutingRule;
  review_count?: number;
  avg_sentiment?: number;
}

export interface RoutingRule {
  target_department: string;
  default_priority: string;
  auto_create_ticket: boolean;
  notify_manager: boolean;
  escalation_hours?: number;
  escalation_contacts?: string[];
}

export interface AutomationConfig {
  global_enabled: boolean;
  auto_respond_positive: boolean;
  auto_respond_threshold: number;
  require_approval: boolean;
  response_delay_hours: number;
  templates: {
    positive: string;
    neutral: string;
    negative: string;
  };
  excluded_sources?: string[];
  language_detection?: boolean;
  sentiment_threshold_positive?: number;
  sentiment_threshold_negative?: number;
}

export interface Goal {
  id: number;
  metric_type: string;
  baseline_value: number;
  target_value: number;
  current_value: number;
  progress_percentage: number;
  start_date: string;
  end_date: string;
  status: string;
  milestones?: GoalMilestone[];
}

export interface GoalMilestone {
  id: number;
  target_date: string;
  target_value: number;
  achieved: boolean;
  achieved_date?: string;
}

export interface EngineStats {
  status: string;
  nlp_model_version: string;
  sentiment_accuracy: number;
  auto_replies_sent_today: number;
  auto_replies_sent_week: number;
  reviews_processed_today: number;
  avg_response_time_hours: number;
  last_sync: string;
  queue_size: number;
  error_rate: number;
}

export interface ReputationSettings {
  notifications: {
    email_alerts: boolean;
    slack_integration: boolean;
    alert_threshold: number;
    daily_digest: boolean;
    weekly_report: boolean;
  };
  display: {
    default_date_range: string;
    default_source_filter: string;
    chart_theme: string;
    items_per_page: number;
  };
  automation: AutomationConfig;
  integrations: {
    connected_otas: string[];
    sync_frequency_hours: number;
    last_sync: string;
  };
}

// API Service
class ReputationService {
  private baseUrl = '/api/v1/reputation';

  // Dashboard
  async getDashboard(): Promise<ReputationDashboard> {
    const response = await api.get(`${this.baseUrl}/dashboard`);
    return response.data.data || response.data;
  }

  // Analytics
  async getAnalytics(
    source?: string,
    startDate?: string,
    endDate?: string
  ): Promise<ReviewAnalytics> {
    const params: Record<string, string> = {};
    if (source) params.source = source;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await api.get(`${this.baseUrl}/analytics`, { params });
    return response.data.data || response.data;
  }

  // Trends
  async getTrends(days: number = 14): Promise<TrendData> {
    const response = await api.get(`${this.baseUrl}/trends`, {
      params: { days }
    });
    return response.data.data || response.data;
  }

  // Reviews needing response
  async getPendingReviews(
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ reviews: Review[]; total: number; page: number }> {
    const response = await api.get(`${this.baseUrl}/reviews/pending`, {
      params: { page, page_size: pageSize }
    });
    return response.data.data || response.data;
  }

  // Get all reviews with filters
  async getReviews(params: {
    page?: number;
    page_size?: number;
    source?: string;
    min_rating?: number;
    max_rating?: number;
    sentiment?: string;
    start_date?: string;
    end_date?: string;
    keyword?: string;
    has_response?: boolean;
  }): Promise<{ reviews: Review[]; total: number; page: number }> {
    const response = await api.get(`${this.baseUrl}/reviews`, { params });
    return response.data.data || response.data;
  }

  // Get a single review with full details
  async getReview(reviewId: number): Promise<Review & {
    published_response?: {
      id: number;
      response_text: string;
      published_at: string;
      quality_score?: number;
      likes?: number;
      helpful_votes?: number;
    };
    draft?: {
      id: number;
      draft_text: string;
      status: string;
      current_stage: string;
      tone: string;
      confidence_score?: number;
      created_at: string;
    };
  }> {
    const response = await api.get(`${this.baseUrl}/reviews/${reviewId}`);
    return response.data.data || response.data;
  }

  // Generate AI response draft
  async generateResponseDraft(
    reviewId: number,
    tone: string = 'professional',
    includeResolution: boolean = false
  ): Promise<ResponseDraft> {
    const response = await api.post(`${this.baseUrl}/reviews/${reviewId}/generate-draft`, {
      tone,
      include_resolution: includeResolution
    });
    return response.data.data || response.data;
  }

  // Approve and publish response
  async approveResponse(
    draftId: number,
    finalText?: string
  ): Promise<{ success: boolean; review_id: number }> {
    const response = await api.post(`${this.baseUrl}/drafts/${draftId}/approve`, {
      final_text: finalText
    });
    return response.data.data || response.data;
  }

  // Directly respond to a review (without draft workflow)
  async respondToReview(
    reviewId: number,
    responseText: string
  ): Promise<{ success: boolean; review_id: number; response: string; responded_at: string }> {
    const response = await api.post(`${this.baseUrl}/reviews/${reviewId}/respond`, {
      final_text: responseText
    });
    return response.data.data || response.data;
  }

  // Competitor benchmarks
  async getCompetitorBenchmarks(): Promise<{ competitors: CompetitorBenchmark[] }> {
    const response = await api.get(`${this.baseUrl}/competitors`);
    return response.data.data || response.data;
  }

  // ========================
  // GOALS
  // ========================

  async getGoals(): Promise<Goal[]> {
    const response = await api.get(`${this.baseUrl}/goals`);
    return response.data.data || response.data;
  }

  async createGoal(data: {
    metric_type: string;
    target_value: number;
    start_date: string;
    end_date: string;
    baseline_value?: number;
  }): Promise<Goal> {
    const response = await api.post(`${this.baseUrl}/goals`, data);
    return response.data.data || response.data;
  }

  async updateGoal(id: number, data: Partial<Goal>): Promise<Goal> {
    const response = await api.patch(`${this.baseUrl}/goals/${id}`, data);
    return response.data.data || response.data;
  }

  async deleteGoal(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/goals/${id}`);
  }

  async updateGoalProgress(goalId: number): Promise<Goal> {
    const response = await api.patch(`${this.baseUrl}/goals/${goalId}/progress`);
    return response.data.data || response.data;
  }

  async toggleGoalStatus(goalId: number): Promise<{ id: number; status: string; message: string }> {
    const response = await api.patch(`${this.baseUrl}/goals/${goalId}/toggle`);
    return response.data.data || response.data;
  }

  // ========================
  // ALERTS
  // ========================

  async getAlerts(status?: string, type?: string): Promise<Alert[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (type) params.type = type;

    const response = await api.get(`${this.baseUrl}/alerts/`, { params });
    return response.data.data || response.data;
  }

  async getAlert(alertId: number): Promise<Alert> {
    const response = await api.get(`${this.baseUrl}/alerts/${alertId}/`);
    return response.data.data || response.data;
  }

  async acknowledgeAlert(alertId: number): Promise<Alert> {
    const response = await api.post(`${this.baseUrl}/alerts/${alertId}/acknowledge/`);
    return response.data.data || response.data;
  }

  async resolveAlert(alertId: number, notes: string): Promise<Alert> {
    const response = await api.post(`${this.baseUrl}/alerts/${alertId}/resolve/`, {
      resolution_notes: notes
    });
    return response.data.data || response.data;
  }

  async dismissAlert(alertId: number): Promise<void> {
    await api.post(`${this.baseUrl}/alerts/${alertId}/dismiss/`);
  }

  async createWorkOrderFromAlert(alertId: number, data: {
    title: string;
    description: string;
    priority: string;
    assigned_to?: number;
    department?: string;
  }): Promise<{ work_order_id: number }> {
    const response = await api.post(`${this.baseUrl}/alerts/${alertId}/work-order/`, data);
    return response.data.data || response.data;
  }

  async runAlertDetection(): Promise<{
    alerts_created: number;
    categories_scanned: number;
    issues_detected: number;
  }> {
    const response = await api.post(`${this.baseUrl}/alerts/detect/`);
    return response.data.data || response.data;
  }

  // ========================
  // CATEGORIES
  // ========================

  async getCategories(): Promise<Category[]> {
    const response = await api.get(`${this.baseUrl}/categories/`);
    return response.data.data || response.data;
  }

  async getCategory(id: number): Promise<Category> {
    const response = await api.get(`${this.baseUrl}/categories/${id}/`);
    return response.data.data || response.data;
  }

  async createCategory(data: {
    name: string;
    description?: string;
    parent_id?: number;
    icon?: string;
    color?: string;
    is_active?: boolean;
  }): Promise<Category> {
    const response = await api.post(`${this.baseUrl}/categories/`, data);
    return response.data.data || response.data;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response = await api.patch(`${this.baseUrl}/categories/${id}/`, data);
    return response.data.data || response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/categories/${id}/`);
  }

  async updateRoutingRules(categoryId: number, rules: RoutingRule): Promise<Category> {
    const response = await api.put(`${this.baseUrl}/categories/${categoryId}/routing/`, rules);
    return response.data.data || response.data;
  }

  async getCategoryStats(categoryId: number): Promise<{
    review_count: number;
    avg_sentiment: number;
    avg_rating: number;
    trend: number;
  }> {
    const response = await api.get(`${this.baseUrl}/categories/${categoryId}/stats/`);
    return response.data.data || response.data;
  }

  // ========================
  // AUTOMATION
  // ========================

  async getAutomationConfig(): Promise<AutomationConfig> {
    const response = await api.get(`${this.baseUrl}/automation/config`);
    return response.data.data || response.data;
  }

  async updateAutomationConfig(config: Partial<AutomationConfig>): Promise<AutomationConfig> {
    const response = await api.patch(`${this.baseUrl}/automation/config`, config);
    return response.data.data || response.data;
  }

  async testAutoResponse(reviewText: string, sentiment?: string): Promise<{
    generated_response: string;
    tone_detected: string;
    would_auto_respond: boolean;
    confidence_score: number;
  }> {
    const response = await api.post(`${this.baseUrl}/automation/test`, {
      review_text: reviewText,
      sentiment
    });
    return response.data.data || response.data;
  }

  async getAutomationLogs(page: number = 1, pageSize: number = 20): Promise<{
    logs: Array<{
      id: number;
      review_id: number;
      action: string;
      status: string;
      timestamp: string;
      details: object;
    }>;
    total: number;
    page: number;
  }> {
    const response = await api.get(`${this.baseUrl}/automation/logs`, {
      params: { page, page_size: pageSize }
    });
    return response.data.data || response.data;
  }

  // ========================
  // SETTINGS
  // ========================

  async getSettings(): Promise<ReputationSettings> {
    const response = await api.get(`${this.baseUrl}/settings`);
    return response.data.data || response.data;
  }

  async saveSettings(settings: Partial<ReputationSettings>): Promise<ReputationSettings> {
    const response = await api.put(`${this.baseUrl}/settings`, settings);
    return response.data.data || response.data;
  }

  // ========================
  // ENGINE STATS
  // ========================

  async getEngineStats(): Promise<EngineStats> {
    const response = await api.get(`${this.baseUrl}/stats/engine`);
    return response.data.data || response.data;
  }

  // ========================
  // APPROVAL WORKFLOW
  // ========================

  async submitForReview(draftId: number): Promise<ResponseDraft> {
    const response = await api.post(`${this.baseUrl}/drafts/${draftId}/submit`);
    return response.data.data || response.data;
  }

  async approveDraftStage(draftId: number, comment?: string): Promise<ResponseDraft> {
    const response = await api.post(`${this.baseUrl}/drafts/${draftId}/approve-stage`, {
      comment
    });
    return response.data.data || response.data;
  }

  async rejectDraft(draftId: number, reason: string): Promise<ResponseDraft> {
    const response = await api.post(`${this.baseUrl}/drafts/${draftId}/reject`, {
      reason
    });
    return response.data.data || response.data;
  }

  async getPendingApprovals(): Promise<ResponseDraft[]> {
    const response = await api.get(`${this.baseUrl}/drafts/pending-approval`);
    return response.data.data || response.data;
  }

  async getDraftHistory(draftId: number): Promise<ApprovalHistory[]> {
    const response = await api.get(`${this.baseUrl}/drafts/${draftId}/history`);
    return response.data.data || response.data;
  }

  async getDraft(draftId: number): Promise<ResponseDraft> {
    const response = await api.get(`${this.baseUrl}/drafts/${draftId}`);
    return response.data.data || response.data;
  }

  // ========================
  // SUMMARY STATS
  // ========================

  async getSummaryStats(): Promise<{
    total_reviews: number;
    average_rating: number;
    response_rate: number;
    nps_score: number;
    pending_responses: number;
    sentiment: { positive: number; neutral: number; negative: number };
  }> {
    const response = await api.get(`${this.baseUrl}/stats/summary`);
    return response.data.data || response.data;
  }

  // ========================
  // AI-POWERED FEATURES
  // ========================

  async getAIInsights(): Promise<{
    insights: Array<{
      title: string;
      description: string;
      type: 'opportunity' | 'warning' | 'trend' | 'recommendation';
      priority: 'high' | 'medium' | 'low';
      action: string;
    }>;
    summary: string;
    health_score: number;
    focus_areas: string[];
  }> {
    const response = await api.get(`${this.baseUrl}/ai/insights`);
    return response.data.data || response.data;
  }

  async getAIThemeAnalysis(limit: number = 50): Promise<{
    positive_themes: Array<{ theme: string; count: number; examples: string[] }>;
    negative_themes: Array<{ theme: string; count: number; examples: string[] }>;
    improvement_areas: string[];
    strengths: string[];
    summary: string;
  }> {
    const response = await api.get(`${this.baseUrl}/ai/themes`, {
      params: { limit }
    });
    return response.data.data || response.data;
  }

  async getAIResponseSuggestions(reviewId: number): Promise<{
    review_id: number;
    review_summary: {
      rating: number;
      sentiment: string;
      comment_preview: string | null;
    };
    suggestions: Array<{
      tone: string;
      response: string;
      is_ai_generated: boolean;
    }>;
    ai_available: boolean;
  }> {
    const response = await api.get(`${this.baseUrl}/reviews/${reviewId}/ai-suggestions`);
    return response.data.data || response.data;
  }

  // ========================
  // TEMPLATES
  // ========================

  async getResponseTemplates(tone?: string, sentiment?: string): Promise<ResponseTemplate[]> {
    const params: Record<string, string> = {};
    if (tone) params.tone = tone;
    if (sentiment) params.sentiment = sentiment;

    const response = await api.get(`${this.baseUrl}/templates/`, { params });
    return response.data.data || response.data;
  }

  async createResponseTemplate(data: {
    name: string;
    content: string;
    sentiment: string;
    tone?: string;
    language?: string;
    is_default?: boolean;
  }): Promise<ResponseTemplate> {
    const response = await api.post(`${this.baseUrl}/templates/`, data);
    return response.data.data || response.data;
  }

  async updateResponseTemplate(id: number, data: {
    name?: string;
    content?: string;
    sentiment?: string;
    tone?: string;
    language?: string;
    is_active?: boolean;
    is_default?: boolean;
  }): Promise<ResponseTemplate> {
    const response = await api.patch(`${this.baseUrl}/templates/${id}`, data);
    return response.data.data || response.data;
  }

  async deleteResponseTemplate(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/templates/${id}`);
  }

  // ========================
  // SYNC OPERATIONS
  // ========================

  async syncOTAReviews(source?: string): Promise<{
    synced_count: number;
    new_reviews: number;
    updated_reviews: number;
    errors: string[];
  }> {
    const params: Record<string, string> = {};
    if (source) params.source = source;

    const response = await api.post(`${this.baseUrl}/sync`, null, { params });
    return response.data.data || response.data;
  }

  async getSyncStatus(): Promise<{
    last_sync: string;
    next_scheduled_sync: string;
    sources: Array<{
      source: string;
      last_sync: string;
      status: string;
      review_count: number;
    }>;
  }> {
    const response = await api.get(`${this.baseUrl}/sync/status`);
    return response.data.data || response.data;
  }
}

export const reputationService = new ReputationService();
export default reputationService;
