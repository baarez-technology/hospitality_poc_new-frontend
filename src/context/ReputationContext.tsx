import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import reputationService, {
  ReputationDashboard,
  ReviewAnalytics,
  TrendData,
  Review,
  ResponseDraft,
  Alert,
  Category,
  Goal,
  AutomationConfig,
  EngineStats,
  ReputationSettings,
  RoutingRule,
  ResponseTemplate
} from '../api/services/reputation.service';

interface ReputationContextType {
  // Core State
  dashboard: ReputationDashboard | null;
  analytics: ReviewAnalytics | null;
  trends: TrendData | null;
  pendingReviews: Review[];
  isLoading: boolean;
  isFilterLoading: boolean;

  error: string | null;
  filters: {
    source: string;
    rating: string;
    sentimentRange: string;
    dateRange: string;
    keyword: string;
  };

  // New State
  alerts: Alert[];
  categories: Category[];
  goals: Goal[];
  automationConfig: AutomationConfig | null;
  pendingApprovals: ResponseDraft[];
  engineStats: EngineStats | null;
  userSettings: ReputationSettings | null;
  templates: ResponseTemplate[];

  // Computed/Derived (backward compatibility)
  reviews: Review[];
  keywords: Array<{ keyword: string; count: number; sentiment: string }>;
  sentiment: Array<{ date: string; score: number; positive: number; neutral: number; negative: number }>;
  otaRatings: Record<string, { rating: number; reviews: number; trend: number }>;
  filteredReviews: Review[];
  metrics: {
    overallSentiment: number;
    positivePercent: number;
    negativePercent: number;
    neutralPercent: number;
    avgOTARating: string;
    newReviewsToday: number;
    reviewVolumeTrend: number;
    totalReviews: number;
  };

  // Core Functions
  loadReputation: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  refreshAnalytics: (source?: string, startDate?: string, endDate?: string) => Promise<void>;
  refreshTrends: (days?: number) => Promise<void>;
  loadPendingReviews: (page?: number) => Promise<void>;
  generateResponseDraft: (reviewId: number, tone?: string, includeResolution?: boolean) => Promise<ResponseDraft>;
  approveResponse: (draftId: number, finalText?: string) => Promise<void>;
  updateFilters: (newFilters: Partial<ReputationContextType['filters']>) => void;

  // Alerts Functions
  loadAlerts: (status?: string, type?: string) => Promise<void>;
  acknowledgeAlert: (id: number) => Promise<void>;
  resolveAlert: (id: number, notes: string) => Promise<void>;
  dismissAlert: (id: number) => Promise<void>;
  createWorkOrderFromAlert: (id: number, data: {
    title: string;
    description: string;
    priority: string;
    assigned_to?: number;
    department?: string;
  }) => Promise<void>;
  runAlertDetection: () => Promise<{ alerts_created: number; categories_scanned: number; issues_detected: number }>;

  // Categories Functions
  loadCategories: () => Promise<void>;
  createCategory: (data: {
    name: string;
    description?: string;
    parent_id?: number;
    icon?: string;
    color?: string;
    is_active?: boolean;
  }) => Promise<void>;
  updateCategory: (id: number, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateRoutingRules: (categoryId: number, rules: RoutingRule) => Promise<void>;

  // Goals Functions
  loadGoals: () => Promise<void>;
  createGoal: (metricType: string, targetValue: number, startDate: string, endDate: string) => Promise<void>;
  updateGoal: (id: number, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
  toggleGoalStatus: (id: number) => Promise<void>;
  updateGoalProgress: (id: number) => Promise<void>;

  // Automation Functions
  loadAutomationConfig: () => Promise<void>;
  updateAutomationConfig: (config: Partial<AutomationConfig>) => Promise<void>;
  testAutoResponse: (reviewText: string) => Promise<{
    generated_response: string;
    tone_detected: string;
    would_auto_respond: boolean;
    confidence_score: number;
  }>;

  // Approval Workflow Functions
  loadPendingApprovals: () => Promise<void>;
  submitForReview: (draftId: number) => Promise<void>;
  approveDraftStage: (draftId: number, comment?: string) => Promise<void>;
  rejectDraft: (draftId: number, reason: string) => Promise<void>;
  getDraftHistory: (draftId: number) => Promise<object[]>;

  // Engine Stats Functions
  loadEngineStats: () => Promise<void>;

  // Settings Functions
  loadUserSettings: () => Promise<void>;
  saveUserSettings: (settings: Partial<ReputationSettings>) => Promise<void>;

  // AI Analysis (local helpers)
  analyzeSentiment: (text: string) => number;
  detectKeywords: (text: string) => Array<{ keyword: string; sentiment: string }>;
  computeOTAScore: number;
  computeTrend: number;
  generateAutoReply: (review: { sentiment: number; guest: string }) => string;

  // CRM Integration
  updateCRMGuestSentiment: (guestEmail: string, sentimentScore: number, reviewId: number) => any;
  influenceChurnProbability: (rating: number) => { change: number; direction: string };
  influenceLTVCurve: (rating: number, existingLTV: number) => number;

  // Revenue AI Integration
  affectDemandWeighting: { modifier: number; reason: string };
  affectRateRecommendations: Array<{ type: string; suggestion: string; reason: string; confidence: string }>;

  // Template Management
  loadTemplates: (tone?: string, sentiment?: string) => Promise<ResponseTemplate[]>;
  createTemplate: (data: Partial<ResponseTemplate>) => Promise<ResponseTemplate>;
  updateTemplate: (id: number, data: Partial<ResponseTemplate>) => Promise<ResponseTemplate>;
  deleteTemplate: (id: number) => Promise<void>;

  // Legacy compatibility
  addReviewResponse: (reviewId: number, responseText: string) => Promise<void>;
  settings: {
    autoReply: {
      enabled: boolean;
      delay: string;
      language: string;
      templates: {
        positive: string;
        neutral: string;
        negative: string;
      };
    };
  };
  updateSettings: (newSettings: Partial<ReputationContextType['settings']>) => void;

  // Additional helper for generating draft
  generateDraft: (reviewId: number, tone?: string, includeResolution?: boolean) => Promise<ResponseDraft>;
  fetchPendingReviews: () => Promise<void>;
  approveDraft: (draftId: number, finalText?: string) => Promise<void>;
}

const ReputationContext = createContext<ReputationContextType | null>(null);

export function ReputationProvider({ children }: { children: React.ReactNode }) {
  // Ref to prevent StrictMode double-mounting
  const isInitializedRef = useRef(false);

  // Core state from API
  const [dashboard, setDashboard] = useState<ReputationDashboard | null>(null);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New state
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<ResponseDraft[]>([]);
  const [engineStats, setEngineStats] = useState<EngineStats | null>(null);
  const [userSettings, setUserSettings] = useState<ReputationSettings | null>(null);

  // Filter state
  const [filters, setFilters] = useState({
    source: 'all',
    rating: 'all',
    sentimentRange: 'all',
    dateRange: '30d',
    keyword: ''
  });

  // Legacy settings state (for backward compatibility with AutoReplies component)
  const [settings, setSettings] = useState({
    autoReply: {
      enabled: false,
      delay: '3h',
      language: 'en',
      templates: {
        positive: "Thank you so much for your wonderful review, {guest}! We're thrilled you enjoyed your stay at Hotel Management. We look forward to welcoming you back soon!",
        neutral: "Thank you for your feedback, {guest}. We appreciate you taking the time to share your experience. Your insights help us improve our services.",
        negative: "Dear {guest}, we sincerely apologize for not meeting your expectations. Your feedback is valuable, and we're taking immediate steps to address your concerns. Please contact our guest relations team so we can make this right."
      }
    }
  });

  // ========================
  // CORE DATA LOADING
  // ========================

  const refreshDashboard = useCallback(async () => {
    try {
      const data = await reputationService.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reputation dashboard:', err);
      setError(err.message || 'Failed to fetch dashboard');
    }
  }, []);

  const refreshAnalytics = useCallback(async (source?: string, startDate?: string, endDate?: string) => {
    try {
      const data = await reputationService.getAnalytics(source, startDate, endDate);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
    }
  }, []);

  const refreshTrends = useCallback(async (days: number = 14) => {
    try {
      const data = await reputationService.getTrends(days);
      setTrends(data);
    } catch (err: any) {
      console.error('Error fetching trends:', err);
    }
  }, []);

  const loadPendingReviews = useCallback(async (page: number = 1) => {
    try {
      const data = await reputationService.getPendingReviews(page);
      setPendingReviews(data.reviews || []);
    } catch (err: any) {
      console.error('Error fetching pending reviews:', err);
    }
  }, []);

  const loadReviews = useCallback(async (isFilterChange = false) => {
    if (isFilterChange) {
      setIsFilterLoading(true);
    }
    try {
      const params: any = {};
      if (filters.source !== 'all') params.source = filters.source;
      if (filters.sentimentRange !== 'all') params.sentiment = filters.sentimentRange;
      if (filters.rating !== 'all') {
        params.min_rating = parseFloat(filters.rating);
        params.max_rating = parseFloat(filters.rating) + 0.9;
      }
      if (filters.keyword) params.keyword = filters.keyword;

      const data = await reputationService.getReviews(params);
      setAllReviews(data.reviews || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    } finally {
      if (isFilterChange) {
        setIsFilterLoading(false);
      }
    }
  }, [filters]);

  const loadAlerts = useCallback(async (status?: string, type?: string) => {
    try {
      const data = await reputationService.getAlerts(status, type);
      setAlerts(data || []);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const data = await reputationService.getCategories();
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const loadGoals = useCallback(async () => {
    try {
      const data = await reputationService.getGoals();
      setGoals(data || []);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
    }
  }, []);

  const loadTemplates = useCallback(async (tone?: string, sentiment?: string) => {
    try {
      const data = await reputationService.getResponseTemplates(tone, sentiment);
      setTemplates(data || []);
      return data;
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      throw err;
    }
  }, []);

  const loadAutomationConfig = useCallback(async () => {
    try {
      const data = await reputationService.getAutomationConfig();
      setAutomationConfig(data);
      // Sync with legacy settings - templates are loaded separately by loadReputation
      if (data) {
        setSettings(prev => ({
          ...prev,
          autoReply: {
            enabled: data.global_enabled,
            delay: `${data.response_delay_hours}h`,
            language: 'en',
            templates: data.templates || prev.autoReply.templates
          }
        }));
      }
    } catch (err: any) {
      console.error('Error fetching automation config:', err);
    }
  }, []);

  const loadPendingApprovals = useCallback(async () => {
    try {
      const data = await reputationService.getPendingApprovals();
      setPendingApprovals(data || []);
    } catch (err: any) {
      console.error('Error fetching pending approvals:', err);
    }
  }, []);

  const loadEngineStats = useCallback(async () => {
    try {
      const data = await reputationService.getEngineStats();
      setEngineStats(data);
    } catch (err: any) {
      console.error('Error fetching engine stats:', err);
    }
  }, []);

  const loadUserSettings = useCallback(async () => {
    try {
      const data = await reputationService.getSettings();
      setUserSettings(data);
    } catch (err: any) {
      console.error('Error fetching user settings:', err);
    }
  }, []);

  const loadReputation = useCallback(async () => {
    // Prevent StrictMode double-mount
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    setIsLoading(true);
    setError(null);
    try {
      // Get default reviews (no filters on initial load)
      const reviewsPromise = reputationService.getReviews({});

      const [reviewsData] = await Promise.all([
        reviewsPromise,
        refreshDashboard(),
        refreshAnalytics(),
        refreshTrends(),
        loadPendingReviews(),
        loadAlerts(),
        loadCategories(),
        loadGoals(),
        loadAutomationConfig(),
        loadPendingApprovals(),
        loadEngineStats(),
        loadUserSettings(),
        loadTemplates()
      ]);

      setAllReviews(reviewsData.reviews || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load reputation data');
    } finally {
      setIsLoading(false);
    }
  }, [
    refreshDashboard,
    refreshAnalytics,
    refreshTrends,
    loadPendingReviews,
    loadAlerts,
    loadCategories,
    loadGoals,
    loadAutomationConfig,
    loadPendingApprovals,
    loadEngineStats,
    loadUserSettings,
    loadTemplates
  ]);

  // Load on mount only
  useEffect(() => {
    loadReputation();
  }, [loadReputation]);

  // Track previous filters to detect actual changes
  const prevFiltersRef = useRef(filters);

  // Reload reviews only when filters actually change (not on mount)
  useEffect(() => {
    const prevFilters = prevFiltersRef.current;
    const hasFilterChanged =
      prevFilters.source !== filters.source ||
      prevFilters.rating !== filters.rating ||
      prevFilters.sentimentRange !== filters.sentimentRange ||
      prevFilters.dateRange !== filters.dateRange ||
      prevFilters.keyword !== filters.keyword;

    if (hasFilterChanged && isInitializedRef.current) {
      loadReviews(true);
    }

    prevFiltersRef.current = filters;
  }, [filters, loadReviews]);

  // ========================
  // ALERTS
  // ========================


  const acknowledgeAlert = useCallback(async (id: number) => {
    try {
      await reputationService.acknowledgeAlert(id);
      await loadAlerts();
    } catch (err: any) {
      console.error('Error acknowledging alert:', err);
      throw err;
    }
  }, [loadAlerts]);

  const resolveAlert = useCallback(async (id: number, notes: string) => {
    try {
      await reputationService.resolveAlert(id, notes);
      await loadAlerts();
    } catch (err: any) {
      console.error('Error resolving alert:', err);
      throw err;
    }
  }, [loadAlerts]);

  const dismissAlert = useCallback(async (id: number) => {
    try {
      await reputationService.dismissAlert(id);
      await loadAlerts();
    } catch (err: any) {
      console.error('Error dismissing alert:', err);
      throw err;
    }
  }, [loadAlerts]);

  const createWorkOrderFromAlert = useCallback(async (id: number, data: {
    title: string;
    description: string;
    priority: string;
    assigned_to?: number;
    department?: string;
  }) => {
    try {
      await reputationService.createWorkOrderFromAlert(id, data);
      await loadAlerts();
    } catch (err: any) {
      console.error('Error creating work order:', err);
      throw err;
    }
  }, [loadAlerts]);

  const runAlertDetection = useCallback(async () => {
    try {
      const result = await reputationService.runAlertDetection();
      await loadAlerts();
      return result;
    } catch (err: any) {
      console.error('Error running alert detection:', err);
      throw err;
    }
  }, [loadAlerts]);

  // ========================
  // CATEGORIES
  // ========================


  const createCategory = useCallback(async (data: {
    name: string;
    description?: string;
    parent_id?: number;
    icon?: string;
    color?: string;
    is_active?: boolean;
  }) => {
    try {
      await reputationService.createCategory(data);
      await loadCategories();
    } catch (err: any) {
      console.error('Error creating category:', err);
      throw err;
    }
  }, [loadCategories]);

  const updateCategory = useCallback(async (id: number, data: Partial<Category>) => {
    try {
      await reputationService.updateCategory(id, data);
      await loadCategories();
    } catch (err: any) {
      console.error('Error updating category:', err);
      throw err;
    }
  }, [loadCategories]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      await reputationService.deleteCategory(id);
      await loadCategories();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      throw err;
    }
  }, [loadCategories]);

  const updateRoutingRules = useCallback(async (categoryId: number, rules: RoutingRule) => {
    try {
      await reputationService.updateRoutingRules(categoryId, rules);
      await loadCategories();
    } catch (err: any) {
      console.error('Error updating routing rules:', err);
      throw err;
    }
  }, [loadCategories]);

  // ========================
  // GOALS
  // ========================


  const createGoal = useCallback(async (metricType: string, targetValue: number, startDate: string, endDate: string) => {
    try {
      await reputationService.createGoal({
        metric_type: metricType,
        target_value: targetValue,
        start_date: startDate,
        end_date: endDate
      });
      await loadGoals();
    } catch (err: any) {
      console.error('Error creating goal:', err);
      throw err;
    }
  }, [loadGoals]);

  const updateGoal = useCallback(async (id: number, data: Partial<Goal>) => {
    try {
      await reputationService.updateGoal(id, data);
      await loadGoals();
    } catch (err: any) {
      console.error('Error updating goal:', err);
      throw err;
    }
  }, [loadGoals]);

  const deleteGoal = useCallback(async (id: number) => {
    try {
      await reputationService.deleteGoal(id);
      await loadGoals();
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      throw err;
    }
  }, [loadGoals]);

  const toggleGoalStatus = useCallback(async (id: number) => {
    try {
      await reputationService.toggleGoalStatus(id);
      await loadGoals();
    } catch (err: any) {
      console.error('Error toggling goal status:', err);
      throw err;
    }
  }, [loadGoals]);

  const updateGoalProgress = useCallback(async (id: number) => {
    try {
      await reputationService.updateGoalProgress(id);
      await loadGoals();
    } catch (err: any) {
      console.error('Error updating goal progress:', err);
      throw err;
    }
  }, [loadGoals]);

  // ========================
  // AUTOMATION
  // ========================


  const updateAutomationConfig = useCallback(async (config: Partial<AutomationConfig>) => {
    try {
      const updated = await reputationService.updateAutomationConfig(config);
      setAutomationConfig(updated);
      // Sync with legacy settings
      if (updated) {
        setSettings(prev => ({
          ...prev,
          autoReply: {
            enabled: updated.global_enabled,
            delay: `${updated.response_delay_hours}h`,
            language: 'en',
            templates: updated.templates
          }
        }));
      }
    } catch (err: any) {
      console.error('Error updating automation config:', err);
      throw err;
    }
  }, []);

  const testAutoResponse = useCallback(async (reviewText: string) => {
    try {
      return await reputationService.testAutoResponse(reviewText);
    } catch (err: any) {
      console.error('Error testing auto response:', err);
      throw err;
    }
  }, []);

  // ========================
  // APPROVAL WORKFLOW
  // ========================


  const submitForReview = useCallback(async (draftId: number) => {
    try {
      await reputationService.submitForReview(draftId);
      await loadPendingApprovals();
    } catch (err: any) {
      console.error('Error submitting for review:', err);
      throw err;
    }
  }, [loadPendingApprovals]);

  const approveDraftStage = useCallback(async (draftId: number, comment?: string) => {
    try {
      await reputationService.approveDraftStage(draftId, comment);
      await loadPendingApprovals();
    } catch (err: any) {
      console.error('Error approving draft stage:', err);
      throw err;
    }
  }, [loadPendingApprovals]);

  const rejectDraft = useCallback(async (draftId: number, reason: string) => {
    try {
      await reputationService.rejectDraft(draftId, reason);
      await loadPendingApprovals();
    } catch (err: any) {
      console.error('Error rejecting draft:', err);
      throw err;
    }
  }, [loadPendingApprovals]);

  const getDraftHistory = useCallback(async (draftId: number) => {
    try {
      return await reputationService.getDraftHistory(draftId);
    } catch (err: any) {
      console.error('Error fetching draft history:', err);
      throw err;
    }
  }, []);

  // ========================
  // ENGINE STATS
  // ========================


  // ========================
  // USER SETTINGS
  // ========================


  const saveUserSettings = useCallback(async (settings: Partial<ReputationSettings>) => {
    try {
      const updated = await reputationService.saveSettings(settings);
      setUserSettings(updated);
    } catch (err: any) {
      console.error('Error saving user settings:', err);
      throw err;
    }
  }, []);

  // ========================
  // TEMPLATE MANAGEMENT
  // ========================



  const createTemplate = useCallback(async (data: Partial<ResponseTemplate>) => {
    try {
      const result = await reputationService.createResponseTemplate({
        name: data.name || '',
        content: data.content || '',
        sentiment: data.sentiment || 'positive',
        tone: data.tone,
        language: data.language,
        is_default: data.is_default
      });
      await loadTemplates();
      return result;
    } catch (err: any) {
      console.error('Error creating template:', err);
      throw err;
    }
  }, [loadTemplates]);

  const updateTemplate = useCallback(async (id: number, data: Partial<ResponseTemplate>) => {
    try {
      const result = await reputationService.updateResponseTemplate(id, data);
      await loadTemplates();
      return result;
    } catch (err: any) {
      console.error('Error updating template:', err);
      throw err;
    }
  }, [loadTemplates]);

  const deleteTemplate = useCallback(async (id: number) => {
    try {
      await reputationService.deleteResponseTemplate(id);
      await loadTemplates();
    } catch (err: any) {
      console.error('Error deleting template:', err);
      throw err;
    }
  }, [loadTemplates]);

  // ========================
  // RESPONSE GENERATION
  // ========================

  const generateResponseDraft = useCallback(async (reviewId: number, tone: string = 'professional', includeResolution: boolean = false): Promise<ResponseDraft> => {
    return await reputationService.generateResponseDraft(reviewId, tone, includeResolution);
  }, []);

  const approveResponse = useCallback(async (draftId: number, finalText?: string) => {
    await reputationService.approveResponse(draftId, finalText);
    await loadPendingReviews();
  }, [loadPendingReviews]);

  // Alias for backward compatibility
  const generateDraft = generateResponseDraft;
  const fetchPendingReviews = loadPendingReviews;
  const approveDraft = approveResponse;

  // ========================
  // DERIVED DATA
  // ========================

  const reviews = useMemo(() => {
    const sourceReviews = allReviews.length > 0 ? allReviews : (dashboard?.recent_reviews || []);
    if (sourceReviews.length === 0) return [];

    // Transform reviews to match component expectations - all data from DB
    return sourceReviews.map(r => {
      // Backend returns sentiment as string: 'positive', 'neutral', 'negative'
      // Convert to numeric score for components that need it
      const sentimentScore = r.sentiment === 'positive' ? 85 :
        r.sentiment === 'negative' ? 25 : 55;

      return {
        ...r,
        // Numeric sentiment for filtering/sorting
        sentiment: sentimentScore,
        // String label from DB
        sentimentLabel: r.sentiment || 'neutral',
        // Map field names for component compatibility
        guest: r.guest_name || `Guest #${r.id}`,
        date: r.review_date || r.date,
        review: r.comment || r.content,
        title: r.title || '',
        // Backend uses has_response, components use responded
        responded: r.has_response || false,
        // Ensure rating is present
        rating: r.rating || 0,
        // Response data
        responseText: r.response_text || '',
        responseDate: r.response_date || ''
      };
    });
  }, [allReviews, dashboard]);

  const keywords = useMemo(() => {
    // If analytics has top_keywords, use them
    if (analytics?.top_keywords?.length) {
      return analytics.top_keywords.map(k => ({
        keyword: k.keyword,
        count: k.count,
        mentions: k.count,
        sentiment: k.sentiment
      }));
    }

    // Otherwise, extract keywords from reviews
    if (!dashboard?.recent_reviews?.length) return [];

    const positiveWords = ['excellent', 'amazing', 'wonderful', 'great', 'fantastic', 'beautiful', 'clean', 'friendly', 'helpful', 'perfect', 'loved', 'best', 'comfortable', 'delicious', 'exceptional', 'spotless', 'professional', 'attentive', 'luxurious', 'stunning', 'location', 'breakfast', 'staff', 'service', 'room', 'view', 'spa', 'pool'];
    const negativeWords = ['terrible', 'awful', 'worst', 'dirty', 'rude', 'slow', 'disappointing', 'horrible', 'poor', 'bad', 'issues', 'problem', 'delay', 'wait', 'noise', 'smell', 'broken', 'unresponsive', 'overpriced', 'frustrated', 'small', 'old', 'outdated'];

    const keywordCounts: Record<string, { count: number; sentiment: string }> = {};

    dashboard.recent_reviews.forEach(review => {
      const text = (review.comment || review.content || '').toLowerCase();
      const words = text.split(/\s+/);

      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z]/g, '');
        if (cleanWord.length < 4) return;

        if (positiveWords.includes(cleanWord)) {
          keywordCounts[cleanWord] = {
            count: (keywordCounts[cleanWord]?.count || 0) + 1,
            sentiment: 'positive'
          };
        } else if (negativeWords.includes(cleanWord)) {
          keywordCounts[cleanWord] = {
            count: (keywordCounts[cleanWord]?.count || 0) + 1,
            sentiment: 'negative'
          };
        }
      });
    });

    return Object.entries(keywordCounts)
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        mentions: data.count,
        sentiment: data.sentiment
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [analytics, dashboard]);

  const sentiment = useMemo(() => {
    // Backend returns sentiment_trends (plural) with raw counts from DB
    const trendData = dashboard?.sentiment_trends || dashboard?.sentiment_trend;
    if (!trendData || trendData.length === 0) return [];

    return trendData.map((item: any) => {
      // Convert raw counts to percentages for the chart
      const total = (item.positive || 0) + (item.neutral || 0) + (item.negative || 0);
      if (total === 0) {
        return { date: item.date, score: 0, positive: 0, neutral: 0, negative: 0 };
      }
      const positivePercent = Math.round((item.positive / total) * 100);
      const neutralPercent = Math.round((item.neutral / total) * 100);
      const negativePercent = Math.round((item.negative / total) * 100);

      return {
        date: item.date,
        // Score uses backend's score if available, otherwise calculate
        score: item.score ? Math.round(item.score * 100) : Math.round((positivePercent + neutralPercent * 0.5)),
        positive: positivePercent,
        neutral: neutralPercent,
        negative: negativePercent
      };
    });
  }, [dashboard]);

  const otaRatings = useMemo(() => {
    if (!dashboard?.source_breakdown) return {};
    const ratings: Record<string, { rating: number; reviews: number; trend: number }> = {};

    // Map backend source names to OTA chart config keys
    const normalizeSourceKey = (source: string): string => {
      const s = source.toLowerCase();
      // booking_com -> booking (to match OTA_CONFIG in chart)
      if (s === 'booking_com') return 'booking';
      return s;
    };

    dashboard.source_breakdown.forEach(src => {
      const key = normalizeSourceKey(src.source);
      ratings[key] = {
        rating: src.avg_rating ?? src.average_rating ?? 0,
        reviews: src.count || 0,
        trend: 0
      };
    });
    return ratings;
  }, [dashboard]);

  // ========================
  // AI ANALYSIS FUNCTIONS
  // ========================

  const analyzeSentiment = useCallback((reviewText: string) => {
    const positiveWords = ['excellent', 'amazing', 'wonderful', 'great', 'fantastic', 'beautiful', 'clean', 'friendly', 'helpful', 'perfect', 'loved', 'best', 'comfortable', 'delicious', 'exceptional', 'spotless', 'professional', 'attentive', 'luxurious', 'stunning'];
    const negativeWords = ['terrible', 'awful', 'worst', 'dirty', 'rude', 'slow', 'disappointing', 'horrible', 'poor', 'bad', 'issues', 'problem', 'delay', 'wait', 'noise', 'smell', 'broken', 'unresponsive', 'overpriced', 'frustrated'];

    const words = reviewText.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });

    const total = positiveCount + negativeCount || 1;
    const score = Math.round(50 + ((positiveCount - negativeCount) / total) * 50);

    return Math.max(0, Math.min(100, score));
  }, []);

  const detectKeywords = useCallback((reviewText: string) => {
    const keywordPatterns = [
      { pattern: /clean|spotless|tidy/gi, keyword: 'clean', sentiment: 'positive' },
      { pattern: /dirty|unclean|mess/gi, keyword: 'cleanliness issues', sentiment: 'negative' },
      { pattern: /staff|service|helpful|friendly/gi, keyword: 'staff', sentiment: 'positive' },
      { pattern: /rude|unhelpful|unresponsive/gi, keyword: 'staff issues', sentiment: 'negative' },
      { pattern: /breakfast|food|dining|restaurant/gi, keyword: 'food', sentiment: 'positive' },
      { pattern: /spa|massage|wellness/gi, keyword: 'spa', sentiment: 'positive' },
      { pattern: /pool|swimming/gi, keyword: 'pool', sentiment: 'positive' },
      { pattern: /wifi|internet/gi, keyword: 'wifi', sentiment: 'neutral' },
      { pattern: /check-in|checkin|wait|delay/gi, keyword: 'check-in delay', sentiment: 'negative' },
      { pattern: /location|area|nearby/gi, keyword: 'location', sentiment: 'positive' },
      { pattern: /view|views|scenery/gi, keyword: 'views', sentiment: 'positive' },
      { pattern: /bed|mattress|sleep/gi, keyword: 'bed', sentiment: 'positive' },
      { pattern: /noise|loud|noisy/gi, keyword: 'noise', sentiment: 'negative' },
      { pattern: /expensive|overpriced|pricey/gi, keyword: 'expensive', sentiment: 'negative' },
      { pattern: /ac|air condition|cooling/gi, keyword: 'AC issues', sentiment: 'negative' },
      { pattern: /gym|fitness|workout/gi, keyword: 'gym', sentiment: 'neutral' },
      { pattern: /luxur|premium|upscale/gi, keyword: 'luxury', sentiment: 'positive' }
    ];

    const detected: Array<{ keyword: string; sentiment: string }> = [];
    keywordPatterns.forEach(({ pattern, keyword, sentiment }) => {
      if (pattern.test(reviewText)) {
        detected.push({ keyword, sentiment });
      }
    });

    return detected;
  }, []);

  const computeOTAScore = useMemo(() => {
    const ratings = Object.values(otaRatings);
    if (ratings.length === 0) return 0;

    const totalReviews = ratings.reduce((sum, ota) => sum + (ota.reviews || 0), 0);
    const weightedSum = ratings.reduce((sum, ota) => sum + (ota.rating * (ota.reviews || 1)), 0);

    return totalReviews > 0 ? parseFloat((weightedSum / totalReviews).toFixed(1)) : 0;
  }, [otaRatings]);

  const computeTrend = useMemo(() => {
    if (!trends) return 0;
    return trends.sentiment_change || 0;
  }, [trends]);

  // UI helper from REMOTE - generates auto-reply based on sentiment
  const generateAutoReply = useCallback((review: { sentiment: number; guest: string }) => {
    const { sentiment: score, guest } = review;
    let template;

    if (score < 40) {
      template = settings.autoReply.templates.negative;
    } else if (score <= 70) {
      template = settings.autoReply.templates.neutral;
    } else {
      template = settings.autoReply.templates.positive;
    }

    return template.replace('{guest}', guest.split(' ')[0]);
  }, [settings.autoReply.templates]);

  // ========================
  // CRM INTEGRATION
  // ========================

  const updateCRMGuestSentiment = useCallback((guestEmail: string, sentimentScore: number, reviewId: number) => {
    console.log(`Updating CRM sentiment for ${guestEmail}: ${sentimentScore}`);
    return {
      guestEmail,
      sentimentScore,
      reviewId,
      timestamp: new Date().toISOString()
    };
  }, []);

  const influenceChurnProbability = useCallback((rating: number) => {
    if (rating <= 2) return { change: 25, direction: 'increase' };
    if (rating <= 3) return { change: 10, direction: 'increase' };
    if (rating >= 4.5) return { change: -15, direction: 'decrease' };
    return { change: 0, direction: 'stable' };
  }, []);

  const influenceLTVCurve = useCallback((rating: number, existingLTV: number) => {
    const multiplier = rating <= 2 ? 0.8 : rating >= 4.5 ? 1.15 : 1;
    return Math.round(existingLTV * multiplier);
  }, []);

  // ========================
  // REVENUE AI INTEGRATION
  // ========================

  const affectDemandWeighting = useMemo(() => {
    const avgSentiment = dashboard?.metrics?.sentiment
      ? ((dashboard.metrics.sentiment.positive || 0) * 100) / ((dashboard.metrics.sentiment.positive || 0) + (dashboard.metrics.sentiment.neutral || 0) + (dashboard.metrics.sentiment.negative || 0) || 1)
      : 50;

    if (avgSentiment < 50) return { modifier: -0.1, reason: 'Low sentiment affecting demand' };
    if (avgSentiment > 80) return { modifier: 0.1, reason: 'High sentiment boosting demand' };
    return { modifier: 0, reason: 'Stable sentiment' };
  }, [dashboard]);

  const affectRateRecommendations = useMemo(() => {
    const recommendations: Array<{ type: string; suggestion: string; reason: string; confidence: string }> = [];

    if (!dashboard?.metrics?.sentiment || !trends) return recommendations;

    const avgSentiment = ((dashboard.metrics.sentiment.positive || 0) * 100) /
      ((dashboard.metrics.sentiment.positive || 0) + (dashboard.metrics.sentiment.neutral || 0) + (dashboard.metrics.sentiment.negative || 0) || 1);
    const trendChange = trends.sentiment_change || 0;

    if (avgSentiment < 50) {
      recommendations.push({
        type: 'rate_decrease',
        suggestion: '-3% to -5%',
        reason: `Sentiment at ${Math.round(avgSentiment)}% - recommend rate moderation`,
        confidence: 'high'
      });
    } else if (avgSentiment > 80 && trendChange > 5) {
      recommendations.push({
        type: 'rate_increase',
        suggestion: '+5% to +8%',
        reason: `Strong sentiment (${Math.round(avgSentiment)}%) with positive trend`,
        confidence: 'high'
      });
    } else if (trendChange < -10) {
      recommendations.push({
        type: 'rate_hold',
        suggestion: 'Hold current rates',
        reason: `Declining sentiment trend (${trendChange}%) - monitor closely`,
        confidence: 'medium'
      });
    }

    return recommendations;
  }, [dashboard, trends]);

  // ========================
  // LEGACY FUNCTIONS
  // ========================

  const addReviewResponse = useCallback(async (reviewId: number, responseText: string) => {
    try {
      await reputationService.respondToReview(reviewId, responseText);
      setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
      await loadReviews();
    } catch (err: any) {
      console.error('Error responding to review:', err);
      throw err;
    }
  }, [loadReviews]);

  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Sync to backend automation config
    if (newSettings.autoReply && automationConfig) {
      const delayHours = parseInt(newSettings.autoReply.delay || '3', 10);
      updateAutomationConfig({
        global_enabled: newSettings.autoReply.enabled ?? automationConfig.global_enabled,
        response_delay_hours: isNaN(delayHours) ? automationConfig.response_delay_hours : delayHours,
        templates: newSettings.autoReply.templates || automationConfig.templates
      }).catch(err => console.error('Failed to sync settings to backend:', err));
    }
  }, [automationConfig, updateAutomationConfig]);

  // Filtered reviews - server-side filtering handles source/rating/sentiment/keyword
  // Client just sorts by date
  const filteredReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
  }, [reviews]);

  // Check if filters are applied
  const hasFiltersApplied = useMemo(() => {
    return filters.source !== 'all' ||
           filters.rating !== 'all' ||
           filters.sentimentRange !== 'all' ||
           filters.keyword !== '';
  }, [filters]);

  // Computed metrics - uses filtered reviews when filters are applied
  const metrics = useMemo(() => {
    // When filters are applied, compute metrics from filtered reviews
    if (hasFiltersApplied && filteredReviews.length > 0) {
      let positive = 0, neutral = 0, negative = 0;
      let totalRating = 0;
      const today = new Date().toISOString().split('T')[0];
      let newToday = 0;

      filteredReviews.forEach(r => {
        // Count by sentiment label
        const sentimentLabel = (r as any).sentimentLabel || 'neutral';
        if (sentimentLabel === 'positive') positive++;
        else if (sentimentLabel === 'negative') negative++;
        else neutral++;

        // Sum ratings
        totalRating += r.rating || 0;

        // Count new today
        if (r.created_at?.startsWith(today)) newToday++;
      });

      const total = filteredReviews.length || 1;
      const avgRating = totalRating / total;

      return {
        overallSentiment: Math.round((positive * 100 + neutral * 50) / total),
        positivePercent: Math.round((positive / total) * 100),
        negativePercent: Math.round((negative / total) * 100),
        neutralPercent: Math.round((neutral / total) * 100),
        avgOTARating: avgRating.toFixed(1),
        newReviewsToday: newToday,
        reviewVolumeTrend: computeTrend,
        totalReviews: filteredReviews.length
      };
    }

    // Default: use dashboard metrics
    if (!dashboard?.metrics) {
      return {
        overallSentiment: 0,
        positivePercent: 0,
        negativePercent: 0,
        neutralPercent: 0,
        avgOTARating: '0.0',
        newReviewsToday: 0,
        reviewVolumeTrend: 0,
        totalReviews: 0
      };
    }

    const { sentiment, total_reviews, average_rating } = dashboard.metrics;
    const total = (sentiment?.positive || 0) + (sentiment?.neutral || 0) + (sentiment?.negative || 0) || 1;

    return {
      overallSentiment: Math.round(((sentiment?.positive || 0) * 100 + (sentiment?.neutral || 0) * 50) / total),
      positivePercent: Math.round(((sentiment?.positive || 0) / total) * 100),
      negativePercent: Math.round(((sentiment?.negative || 0) / total) * 100),
      neutralPercent: Math.round(((sentiment?.neutral || 0) / total) * 100),
      avgOTARating: (average_rating || 0).toFixed(1),
      newReviewsToday: reviews.filter(r => {
        const today = new Date().toISOString().split('T')[0];
        return r.created_at?.startsWith(today);
      }).length,
      reviewVolumeTrend: computeTrend,
      totalReviews: total_reviews
    };
  }, [dashboard, reviews, filteredReviews, hasFiltersApplied, computeTrend]);

  const value: ReputationContextType = {
    // Core State
    dashboard,
    analytics,
    trends,
    pendingReviews,
    templates,
    isLoading,
    isFilterLoading,
    error,

    filters,

    // New State
    alerts,
    categories,
    goals,
    automationConfig,
    pendingApprovals,
    engineStats,
    userSettings,

    // Derived
    reviews,
    keywords,
    sentiment,
    otaRatings,
    filteredReviews,
    metrics,

    // Core Functions
    loadReputation,
    refreshDashboard,
    refreshAnalytics,
    refreshTrends,
    loadPendingReviews,
    generateResponseDraft,
    approveResponse,
    updateFilters,

    // Alerts Functions
    loadAlerts,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    createWorkOrderFromAlert,
    runAlertDetection,

    // Categories Functions
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateRoutingRules,

    // Goals Functions
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalStatus,
    updateGoalProgress,

    // Automation Functions
    loadAutomationConfig,
    updateAutomationConfig,
    testAutoResponse,

    // Template Functions
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,

    // Approval Workflow Functions
    loadPendingApprovals,
    submitForReview,
    approveDraftStage,
    rejectDraft,
    getDraftHistory,

    // Engine Stats Functions
    loadEngineStats,

    // Settings Functions
    loadUserSettings,
    saveUserSettings,

    // AI Analysis
    analyzeSentiment,
    detectKeywords,
    computeOTAScore,
    computeTrend,
    generateAutoReply,

    // CRM Integration
    updateCRMGuestSentiment,
    influenceChurnProbability,
    influenceLTVCurve,

    // Revenue AI Integration
    affectDemandWeighting,
    affectRateRecommendations,

    // Legacy compatibility
    addReviewResponse,
    settings,
    updateSettings,
    generateDraft,
    fetchPendingReviews,
    approveDraft
  };

  return (
    <ReputationContext.Provider value={value}>
      {children}
    </ReputationContext.Provider>
  );
}

export function useReputation() {
  const context = useContext(ReputationContext);
  if (!context) {
    throw new Error('useReputation must be used within a ReputationProvider');
  }
  return context;
}

export default ReputationContext;
