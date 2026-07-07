import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Download,
  RefreshCw,
  MessageSquare,
  LayoutDashboard,
  Bell,
  Target,
  FolderOpen,
  CheckSquare,
  Settings,
  AlertTriangle
} from 'lucide-react';

// Import context
import { ReputationProvider, useReputation } from '../../../context/ReputationContext';

// Import components
import SentimentSummary from '../../../components/reputation/SentimentSummary';
import SentimentTrendChart from '../../../components/reputation/SentimentTrendChart';
import OTAScoreChart from '../../../components/reputation/OTAScoreChart';
import KeywordFrequency from '../../../components/reputation/KeywordFrequency';
import ReviewFeed from '../../../components/reputation/ReviewFeed';
import ReviewDetailDrawer from '../../../components/reputation/ReviewDetailDrawer';
import AutoReplies from '../../../components/reputation/AutoReplies';
import FiltersBar from '../../../components/reputation/FiltersBar';
import ImpactOnRevenue from '../../../components/reputation/ImpactOnRevenue';
import CRMGuestImpact from '../../../components/reputation/CRMGuestImpact';
import GoalsPanel from '../../../components/reputation/GoalsPanel';
import AlertsPanel from '../../../components/reputation/AlertsPanel';
import CategoryManager from '../../../components/reputation/CategoryManager';
import ApprovalQueue from '../../../components/reputation/ApprovalQueue';
import TemplatesManager from '../../../components/reputation/TemplatesManager';
import EngineStats from '../../../components/reputation/EngineStats';

type TabId = 'overview' | 'alerts' | 'goals' | 'categories' | 'approvals' | 'settings';

const TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'approvals', label: 'Approvals', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function ReputationAIContent() {
  const {
    sentiment,
    otaRatings,
    keywords,
    filteredReviews,
    filters,
    settings,
    metrics,
    isLoading,
    error,
    alerts,
    pendingApprovals,
    updateFilters,
    updateSettings,
    addReviewResponse,
    influenceChurnProbability,
    influenceLTVCurve,
    affectRateRecommendations,
    loadReputation,
    loadAlerts,
    loadGoals,
    loadCategories,
    loadPendingApprovals,
    loadEngineStats,
    loadAutomationConfig
  } = useReputation();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Load tab-specific data when tab changes
  useEffect(() => {
    const loadTabData = async () => {
      switch (activeTab) {
        case 'alerts':
          await loadAlerts();
          break;
        case 'goals':
          await loadGoals();
          break;
        case 'categories':
          await loadCategories();
          break;
        case 'approvals':
          await loadPendingApprovals();
          break;
        case 'settings':
          await loadAutomationConfig();
          await loadEngineStats();
          break;
      }
    };
    loadTabData();
  }, [activeTab, loadAlerts, loadGoals, loadCategories, loadPendingApprovals, loadEngineStats, loadAutomationConfig]);

  const handleReviewClick = useCallback((review: any) => {
    setSelectedReview(review);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedReview(null);
  }, []);

  const handleRespondToReview = useCallback(async (reviewId: number, responseText: string) => {
    try {
      await addReviewResponse(reviewId, responseText);
      setSelectedReview(null);
      toast.success('Response published successfully');
    } catch (err) {
      console.error('Failed to respond to review:', err);
      toast.error('Failed to publish response');
    }
  }, [addReviewResponse]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadReputation();
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadReputation]);

  const handleExportCSV = useCallback(() => {
    const csvRows = [
      ['Reputation AI Report', new Date().toLocaleDateString()],
      [],
      ['Summary Metrics'],
      ['Overall Sentiment', metrics.overallSentiment],
      ['Positive %', metrics.positivePercent],
      ['Negative %', metrics.negativePercent],
      ['Avg OTA Rating', metrics.avgOTARating],
      ['Total Reviews', metrics.totalReviews],
      [],
      ['Reviews'],
      ['ID', 'Guest', 'Source', 'Rating', 'Sentiment', 'Date', 'Title', 'Responded'],
      ...filteredReviews.map((r: any) => [
        r.id,
        r.guest_name || r.guest,
        r.source,
        r.rating,
        r.sentiment_score || r.sentiment,
        r.created_at || r.date,
        `"${r.title || ''}"`,
        r.responded ? 'Yes' : 'No'
      ]),
      [],
      ['Keywords'],
      ['Keyword', 'Mentions', 'Sentiment'],
      ...keywords.map((k: any) => [k.keyword, k.count || k.mentions, k.sentiment])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reputation-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredReviews, keywords, metrics]);

  // Calculate alert count for badge
  const activeAlertCount = alerts.filter(a => a.status === 'active' || a.status === 'new').length;
  const pendingApprovalCount = pendingApprovals.length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FAF7F4] px-4">
        <div className="text-center">
          <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-[#A57865] animate-spin mx-auto mb-2" />
          <p className="text-sm sm:text-base text-neutral-600">Loading reputation data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FAF7F4] px-4">
        <div className="text-center max-w-md w-full">
          <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-amber-500 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Failed to Load Data</h3>
          <p className="text-sm sm:text-base text-neutral-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-[#A57865] text-white rounded-lg hover:bg-[#A57865]/90 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Reputation AI
            </h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              <span className="hidden sm:inline">Review intelligence, sentiment analysis & automated responses</span>
              <span className="sm:hidden">Review intelligence & sentiment</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-3 sm:px-4 bg-white border border-neutral-200 rounded-lg text-[12px] sm:text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-colors ${
                isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-3 sm:px-4 bg-terra-500 hover:bg-terra-600 text-white rounded-lg text-[12px] sm:text-[13px] font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <SentimentSummary metrics={metrics} />

        {/* Main Content Card */}
        <div className="bg-white rounded-[10px] overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-neutral-100">
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-6 pt-3 sm:pt-4">
              <div className="flex items-center gap-0.5 min-w-max">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  const badgeCount = tab.id === 'alerts' ? activeAlertCount :
                                    tab.id === 'approvals' ? pendingApprovalCount : 0;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative px-3 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
                        isActive ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                        {badgeCount > 0 && (
                          <span className="min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] sm:text-[11px] font-semibold flex items-center justify-center">
                            {badgeCount}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-terra-500 rounded-t-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Filters */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
                <FiltersBar filters={filters} onFilterChange={updateFilters} />
              </div>

              {/* Overview Content */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <SentimentTrendChart data={sentiment} />
                  <OTAScoreChart data={otaRatings} />
                </div>

                {/* Secondary Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                  <KeywordFrequency data={keywords} />
                  <div className="lg:col-span-2">
                    <ReviewFeed reviews={filteredReviews} onReviewClick={handleReviewClick} />
                  </div>
                </div>

                {/* AI Integration Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <ImpactOnRevenue
                    sentimentData={sentiment}
                    recommendations={affectRateRecommendations}
                  />
                  <CRMGuestImpact
                    review={selectedReview}
                    influenceChurnProbability={influenceChurnProbability}
                    influenceLTVCurve={influenceLTVCurve}
                  />
                </div>

                {/* Engine Stats Footer */}
                <EngineStats compact />
              </div>
            </>
          )}

          {activeTab === 'alerts' && (
            <div className="p-4 sm:p-6">
              <AlertsPanel />
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="p-4 sm:p-6">
              <GoalsPanel />
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="p-4 sm:p-6">
              <CategoryManager />
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="p-4 sm:p-6">
              <ApprovalQueue />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Auto-Reply Engine */}
              <AutoReplies settings={settings} onSettingsChange={updateSettings} />

              {/* Templates Manager */}
              <TemplatesManager />

              {/* Engine Stats (full version) */}
              <EngineStats />
            </div>
          )}
        </div>
      </div>

      {/* Review Detail Drawer */}
      {selectedReview && (
        <ReviewDetailDrawer
          review={selectedReview}
          onClose={handleCloseDrawer}
          onRespond={handleRespondToReview}
          guestCRMData={{
            totalStays: selectedReview.guest_stays || 1,
            ltv: selectedReview.guest_ltv || 50000,
            segment: selectedReview.guest_segment || 'Leisure'
          }}
        />
      )}
    </div>
  );
}

export default function ReputationAI() {
  return (
    <ReputationProvider>
      <ReputationAIContent />
    </ReputationProvider>
  );
}
