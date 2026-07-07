import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Download, RefreshCw } from 'lucide-react';
import { Button, IconButton } from '../../components/ui2/Button';

// Import context
import { ReputationProvider, useReputation } from '../../contexts/ReputationContext';
import { useToast } from '../../contexts/ToastContext';

// Import components
import SentimentSummary from '../../components/reputation/SentimentSummary';
import SentimentTrendChart from '../../components/reputation/SentimentTrendChart';
import OTAScoreChart from '../../components/reputation/OTAScoreChart';
import KeywordFrequency from '../../components/reputation/KeywordFrequency';
import ReviewFeed from '../../components/reputation/ReviewFeed';
import ReviewDetailDrawer from '../../components/reputation/ReviewDetailDrawer';
import AutoReplies from '../../components/reputation/AutoReplies';
import ImpactOnRevenue from '../../components/reputation/ImpactOnRevenue';
import CRMGuestImpact from '../../components/reputation/CRMGuestImpact';

// New Reputation AI Components
import TrendsPanel from '../../components/reputation/TrendsPanel';
import GoalsPanel from '../../components/reputation/GoalsPanel';
import PendingReviewsPanel from '../../components/reputation/PendingReviewsPanel';

function ReputationAIContent() {
  const {
    sentiment,
    otaRatings,
    keywords,
    filteredReviews,
    settings,
    metrics,
    isLoading,
    isFilterLoading,
    updateFilters,
    updateSettings,
    addReviewResponse,
    generateAutoReply,
    influenceChurnProbability,
    influenceLTVCurve,
    affectRateRecommendations,
    refreshDashboard,
    refreshAnalytics,
    refreshTrends,
    loadPendingReviews,
    loadEngineStats,
    engineStats
  } = useReputation();

  const { showToast } = useToast();
  const location = useLocation();
  const [selectedReview, setSelectedReview] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Scroll to section if hash or state.scrollTo is present (e.g. #recent-reviews)
  useEffect(() => {
    const scrollTarget = (location.state as any)?.scrollTo || (location.hash ? location.hash.slice(1) : null);
    if (scrollTarget) {
      const timer = setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.state]);

  const handleReviewClick = useCallback((review) => {
    setSelectedReview(review);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedReview(null);
  }, []);

  const handleRespondToReview = useCallback(async (reviewId, responseText) => {
    try {
      await addReviewResponse(reviewId, responseText);
      showToast('Response published successfully', 'success');
      setSelectedReview(null);
    } catch (error) {
      console.error('Failed to respond to review:', error);
      showToast('Failed to publish response', 'error');
    }
  }, [addReviewResponse, showToast]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshDashboard(),
        refreshAnalytics(),
        refreshTrends(),
        loadPendingReviews(),
        loadEngineStats(),
      ]);
      setLastUpdated(new Date());
      showToast('Reputation data synced successfully', 'success');
    } catch (err) {
      console.error('Failed to refresh:', err);
      showToast('Failed to sync reputation data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshDashboard, refreshAnalytics, refreshTrends, loadPendingReviews, loadEngineStats, showToast]);

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
      ...filteredReviews.map(r => [
        r.id,
        r.guest,
        r.source,
        r.rating,
        r.sentimentLabel,
        r.date,
        `"${r.title || ''}"`,
        r.responded ? 'Yes' : 'No'
      ]),
      [],
      ['Keywords'],
      ['Keyword', 'Mentions', 'Sentiment'],
      ...keywords.map(k => [k.keyword, k.mentions, k.sentiment])
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reputation-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Report exported successfully', 'success');
  }, [filteredReviews, keywords, metrics, showToast]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-terra-500 animate-spin mx-auto mb-2" />
          <p className="text-neutral-600">Loading reputation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900">Reputation AI</h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 sm:mt-1">
              Review intelligence, sentiment analysis & automated responses
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-[11px] text-neutral-400 hidden sm:inline">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
            <IconButton
              icon={RefreshCw}
              variant="outline-neutral"
              size="md"
              label="Refresh"
              onClick={handleRefresh}
              disabled={isRefreshing}
              loading={isRefreshing}
            />
            <Button
              variant="primary"
              size="md"
              icon={Download}
              onClick={handleExportCSV}
              className="text-xs sm:text-sm"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Sentiment Summary KPIs */}
        <SentimentSummary metrics={metrics} />

        {/* Charts - Side by Side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <SentimentTrendChart data={sentiment} />
          <OTAScoreChart data={otaRatings} />
        </div>

        {/* New AI Panels - Trends, Goals, Pending Reviews */}
        {/* xl: for 3-col layout - iPad Pro with sidebar gets 1-col */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <TrendsPanel />
          <GoalsPanel />
          <PendingReviewsPanel />
        </div>

        {/* Keywords & Reviews - Stacked */}
        <div className="space-y-4 sm:space-y-6">
          <KeywordFrequency data={keywords} />
          <div id="recent-reviews">
            <ReviewFeed reviews={filteredReviews} onReviewClick={handleReviewClick} isLoading={isFilterLoading} />
          </div>
        </div>

        {/* AI Integration - Stacked */}
        <div className="space-y-4 sm:space-y-6">
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

        {/* Auto-Reply Engine */}
        <AutoReplies settings={settings} onSettingsChange={updateSettings} />

        {/* Footer Stats - Data from engineStats API */}
        <div className="bg-white rounded-[10px] p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Reputation Engine</p>
                <p className={`text-[13px] sm:text-[15px] font-semibold mt-0.5 ${engineStats?.status === 'active' ? 'text-sage-600' : 'text-neutral-500'}`}>
                  {engineStats?.status ? engineStats.status.charAt(0).toUpperCase() + engineStats.status.slice(1) : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">NLP Model</p>
                <p className="text-[13px] sm:text-[15px] font-semibold text-neutral-900 mt-0.5">
                  {engineStats?.nlp_model_version || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Accuracy</p>
                <p className="text-[13px] sm:text-[15px] font-semibold text-ocean-600 mt-0.5">
                  {engineStats?.sentiment_accuracy ? `${(engineStats.sentiment_accuracy * 100).toFixed(1)}%` : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Auto-Replies</p>
                <p className="text-[13px] sm:text-[15px] font-semibold text-terra-500 mt-0.5">
                  {engineStats?.auto_replies_sent_week ?? 0} this week
                </p>
              </div>
            </div>
            <div className="text-left lg:text-right pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Powered by</p>
              <p className="text-[13px] sm:text-[14px] font-semibold text-neutral-900 mt-0.5">Glimmora AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Detail Drawer */}
      {selectedReview && (
        <ReviewDetailDrawer
          review={selectedReview}
          onClose={handleCloseDrawer}
          onRespond={handleRespondToReview}
          generateAutoReply={generateAutoReply}
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
