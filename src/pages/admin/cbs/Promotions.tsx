/**
 * CMS Promotions Page
 * Manage promotional campaigns and discount codes - Glimmora Design System v5.0
 * Enhanced with refined editorial luxury aesthetic
 */

import { useState, useMemo } from 'react';
import { useCBS } from '../../../context/CBSContext';
import { useToast } from '../../../contexts/ToastContext';
import PromotionCard from '../../../components/cbs/PromotionCard';
import NewPromotionModal from '../../../components/cms/NewPromotionModal';
import EditPromotionModal from '../../../components/cbs/EditPromotionModal';
import ManagePromotionTypesModal from '../../../components/cbs/ManagePromotionTypesModal';
import { Button } from '../../../components/ui2/Button';
import { ConfirmModal } from '../../../components/ui2/Modal';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui2/DropdownMenu';
import { Pagination, PaginationInfo } from '../../../components/core/Pagination';
import {
  Search, Gift, Plus, Percent, Tag, Clock,
  Download, ChevronUp, ChevronDown, Settings2
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function CBSPromotions() {
  const {
    promotions,
    createPromotion,
    updatePromotion,
    togglePromotionStatus,
    promotionTypes,
    addPromotionType,
    updatePromotionType,
    deletePromotionType,
    resetPromotionTypes
  } = useCBS();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showNewPromotion, setShowNewPromotion] = useState(false);
  const [editPromotion, setEditPromotion] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, promotionId: null });
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showManageTypes, setShowManageTypes] = useState(false);

  const now = new Date();

  const filteredPromotions = useMemo(() => {
    let result = [...promotions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (filterStatus === 'active') {
      result = result.filter(p => p.isActive && new Date(p.validTo) >= now);
    } else if (filterStatus === 'expired') {
      result = result.filter(p => new Date(p.validTo) < now);
    } else if (filterStatus === 'upcoming') {
      result = result.filter(p => new Date(p.validFrom) > now);
    } else if (filterStatus === 'paused') {
      result = result.filter(p => !p.isActive && new Date(p.validTo) >= now);
    }

    if (filterType !== 'all') {
      result = result.filter(p => p.discountType === filterType);
    }

    // Sort by expiry (expired last) then by start date (most recent first)
    // Don't sort by active status to prevent cards jumping when toggled
    result.sort((a, b) => {
      const aExpired = new Date(a.validTo) < now;
      const bExpired = new Date(b.validTo) < now;
      if (aExpired !== bExpired) return aExpired ? 1 : -1;
      return new Date(b.validFrom) - new Date(a.validFrom);
    });

    return result;
  }, [promotions, searchQuery, filterStatus, filterType, now]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPromotions.length / ITEMS_PER_PAGE);
  const paginatedPromotions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPromotions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPromotions, currentPage]);

  const handleToggleStatus = (promotionId) => {
    togglePromotionStatus(promotionId);
    const promo = promotions.find(p => p.id === promotionId);
    success(`${promo.title} ${promo.isActive ? 'paused' : 'activated'}`);
  };

  const handleDelete = (promotionId) => {
    setDeleteConfirm({ isOpen: true, promotionId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.promotionId) {
      updatePromotion(deleteConfirm.promotionId, { isActive: false, validTo: new Date().toISOString().split('T')[0] });
      success('Promotion deleted');
    }
    setDeleteConfirm({ isOpen: false, promotionId: null });
  };

  const handleCreatePromotion = (promoData) => {
    try {
      const newPromo = createPromotion(promoData);
      success(`${newPromo.title} promotion created successfully`);
      setShowNewPromotion(false);
    } catch (err) {
      error('Failed to create promotion');
      console.error('Promotion creation error:', err);
    }
  };

  const handleEditPromotion = (promotion) => {
    setEditPromotion(promotion);
  };

  const handleUpdatePromotion = (id, data) => {
    try {
      updatePromotion(id, data);
      success(`${data.title} updated successfully`);
      setEditPromotion(null);
    } catch (err) {
      error('Failed to update promotion');
      console.error('Promotion update error:', err);
    }
  };

  const handleExport = () => {
    if (filteredPromotions.length === 0) {
      error('No promotions to export');
      return;
    }

    const headers = ['Title', 'Code', 'Type', 'Discount', 'Valid From', 'Valid To', 'Status', 'Usage Count', 'Description'];
    const rows = filteredPromotions.map(p => [
      p.title,
      p.code || '',
      p.discountType,
      p.discountType === 'percentage' ? `${p.discountValue}%` : `₹${p.discountValue}`,
      p.validFrom,
      p.validTo,
      p.isActive && new Date(p.validTo) >= now ? 'Active' : new Date(p.validTo) < now ? 'Expired' : 'Paused',
      p.usageCount || 0,
      (p.description || '').replace(/,/g, ' ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promotions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    success('Promotions exported successfully');
  };

  const stats = useMemo(() => {
    const active = promotions.filter(p => p.isActive && new Date(p.validTo) >= now);
    const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);

    return {
      total: promotions.length,
      active: active.length,
      expired: promotions.filter(p => new Date(p.validTo) < now).length,
      totalUsage
    };
  }, [promotions, now]);

  // KPI cards with accent colors
  const kpiCards = [
    {
      icon: Gift,
      title: 'Total Campaigns',
      value: stats.total,
      subtitle: `${stats.active} active`,
      accent: 'terra'
    },
    {
      icon: Tag,
      title: 'Active Promotions',
      value: stats.active,
      subtitle: 'Running now',
      change: stats.active > 0 ? 'Live' : null,
      changeType: 'positive',
      accent: 'sage'
    },
    {
      icon: Clock,
      title: 'Expired',
      value: stats.expired,
      subtitle: 'Past campaigns',
      accent: 'neutral'
    },
    {
      icon: Percent,
      title: 'Total Redemptions',
      value: stats.totalUsage,
      subtitle: 'All time usage',
      accent: 'gold'
    }
  ];

  const accentColors = {
    terra: { bg: 'bg-terra-50', border: 'border-terra-100', icon: 'bg-terra-100 text-terra-600' },
    sage: { bg: 'bg-sage-50', border: 'border-sage-100', icon: 'bg-sage-100 text-sage-600' },
    neutral: { bg: 'bg-neutral-50', border: 'border-neutral-200', icon: 'bg-neutral-100 text-neutral-500' },
    gold: { bg: 'bg-gold-50', border: 'border-gold-100', icon: 'bg-gold-100 text-gold-700' }
  };

  const getStatusLabel = () => {
    switch (filterStatus) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'expired': return 'Expired';
      default: return 'All Status';
    }
  };

  const getTypeLabel = () => {
    switch (filterType) {
      case 'percentage': return 'Percentage';
      case 'fixed': return 'Fixed Amount';
      case 'free_night': return 'Free Night';
      default: return 'All Types';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Page Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Promotions
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Manage discount campaigns, promo codes, and special offers</span>
              <span className="sm:hidden">Manage campaigns & offers</span>
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" icon={Settings2} onClick={() => setShowManageTypes(true)} className="text-xs sm:text-sm px-3 sm:px-4">
              <span className="hidden sm:inline">Manage Types</span>
            </Button>
            <Button variant="outline" icon={Download} onClick={handleExport} className="text-xs sm:text-sm px-3 sm:px-4">
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button onClick={() => setShowNewPromotion(true)} variant="primary" icon={Plus} className="text-xs sm:text-sm px-3 sm:px-4">
              <span className="hidden sm:inline">New Promotion</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {kpiCards.map((kpi, index) => {
            const colors = accentColors[kpi.accent];
            const isPositive = kpi.changeType === 'positive';
            return (
              <div
                key={index}
                className="rounded-[10px] bg-white p-4 sm:p-6"
              >
                {/* Header with Icon */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${colors.icon}`}>
                    <kpi.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
                    {kpi.title}
                  </p>
                </div>

                {/* Value */}
                <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900 mb-1 sm:mb-2">
                  {kpi.value.toLocaleString()}
                </p>

                {/* Comparison */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium truncate">{kpi.subtitle}</p>
                  {kpi.change && (
                    <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold flex-shrink-0 ${
                      isPositive ? 'text-sage-600' : 'text-neutral-500'
                    }`}>
                      {isPositive && <span className="w-1.5 h-1.5 rounded-full bg-sage-500" />}
                      {kpi.change}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* AI Insights */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          <button
            onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
            className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between transition-colors hover:bg-neutral-50/50"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-neutral-800">
                    AI Promotion Insights
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider bg-gold-100 text-gold-700">
                    Smart
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
                  Personalized recommendations
                </p>
              </div>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-colors flex-shrink-0">
              {isInsightsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
              )}
            </div>
          </button>

          <div className={`transition-all duration-300 ease-out overflow-hidden ${
            isInsightsExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 space-y-2 sm:space-y-3 border-t border-neutral-100">
              <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-sage-50/50">
                <div className="w-2 h-2 rounded-full bg-sage-500 mt-1 sm:mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-[13px] font-semibold text-sage-700">Top Performer</p>
                  <p className="text-[10px] sm:text-[11px] mt-0.5 text-neutral-500 font-medium">
                    Your "Weekend Getaway" promotion is performing 35% above average
                  </p>
                </div>
              </div>
              {stats.active > 0 && (
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-gold-50/50">
                  <div className="w-2 h-2 rounded-full bg-gold-500 mt-1 sm:mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-[13px] font-semibold text-gold-700">Active Campaigns</p>
                    <p className="text-[10px] sm:text-[11px] mt-0.5 text-neutral-500 font-medium">
                      {stats.active} promotion{stats.active !== 1 ? 's' : ''} currently driving bookings
                    </p>
                  </div>
                </div>
              )}
              {stats.expired > 3 && (
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-terra-50/50">
                  <div className="w-2 h-2 rounded-full bg-terra-500 mt-1 sm:mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-[13px] font-semibold text-terra-600">Archive Suggestion</p>
                    <p className="text-[10px] sm:text-[11px] mt-0.5 text-neutral-500 font-medium">
                      Consider archiving {stats.expired} expired campaigns to keep your list clean
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search & Filters - single row */}
        <section className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search promotions..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="w-full h-9 sm:h-10 pl-8 sm:pl-9 pr-3 sm:pr-4 rounded-lg text-xs sm:text-sm bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150"
            />
          </div>

            {/* Status Filter */}
            <DropdownMenu
              align="end"
              trigger={
                <button className="h-9 sm:h-10 w-[140px] px-3 sm:px-4 pr-2.5 sm:pr-3 rounded-lg text-xs sm:text-sm bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150 flex items-center justify-between shrink-0">
                  <span>{getStatusLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                </button>
              }
            >
              <DropdownMenuItem onSelect={() => handleFilterChange(setFilterStatus, 'all')}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleFilterChange(setFilterStatus, 'active')}>
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleFilterChange(setFilterStatus, 'paused')}>
                Paused
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleFilterChange(setFilterStatus, 'expired')}>
                Expired
              </DropdownMenuItem>
            </DropdownMenu>

            {/* Type Filter */}
            <DropdownMenu
              align="end"
              trigger={
                <button className="h-9 sm:h-10 w-[150px] px-3 sm:px-4 pr-2.5 sm:pr-3 rounded-lg text-xs sm:text-sm bg-white border border-neutral-200 text-neutral-700 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all duration-150 flex items-center justify-between shrink-0">
                  <span>{getTypeLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                </button>
              }
            >
              <DropdownMenuItem onSelect={() => handleFilterChange(setFilterType, 'all')}>
                All Types
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleFilterChange(setFilterType, 'percentage')}>
                Percentage
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleFilterChange(setFilterType, 'fixed')}>
                Fixed Amount
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleFilterChange(setFilterType, 'free_night')}>
                Free Night
              </DropdownMenuItem>
            </DropdownMenu>
        </section>

        {/* Promotions List */}
        {filteredPromotions.length === 0 ? (
          <section className="rounded-[10px] p-8 sm:p-12 text-center bg-white">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg mx-auto mb-4 sm:mb-5 flex items-center justify-center bg-neutral-50">
              <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-300" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-neutral-900">
              No promotions found
            </h3>
            <p className="text-xs sm:text-[13px] mb-4 sm:mb-6 max-w-md mx-auto text-neutral-500">
              {searchQuery || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filters to find what you\'re looking for'
                : 'Get started by creating your first promotional campaign'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              {(searchQuery || filterStatus !== 'all' || filterType !== 'all') && (
                <Button
                  onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterType('all'); setCurrentPage(1); }}
                  variant="outline"
                  className="w-full sm:w-auto text-xs sm:text-sm"
                >
                  Clear Filters
                </Button>
              )}
              <Button onClick={() => setShowNewPromotion(true)} variant="primary" icon={Plus} className="w-full sm:w-auto text-xs sm:text-sm">
                Create Promotion
              </Button>
            </div>
          </section>
        ) : (
          <>
            <section className="space-y-3 sm:space-y-4">
              {paginatedPromotions.map((promotion) => (
                <PromotionCard
                  key={promotion.id}
                  promotion={promotion}
                  searchQuery={searchQuery}
                  onUpdate={updatePromotion}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  onEdit={handleEditPromotion}
                />
              ))}
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
              <section className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-3 sm:pt-4">
                <PaginationInfo
                  currentPage={currentPage}
                  pageSize={ITEMS_PER_PAGE}
                  totalItems={filteredPromotions.length}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </section>
            )}
          </>
        )}
      </div>

      {/* New Promotion Modal */}
      <NewPromotionModal
        isOpen={showNewPromotion}
        onClose={() => setShowNewPromotion(false)}
        onSubmit={handleCreatePromotion}
        promotionTypes={promotionTypes}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, promotionId: null })}
        onConfirm={confirmDelete}
        title="Delete Promotion"
        description="Are you sure you want to delete this promotion? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Edit Promotion Modal */}
      <EditPromotionModal
        isOpen={!!editPromotion}
        onClose={() => setEditPromotion(null)}
        onSubmit={handleUpdatePromotion}
        promotion={editPromotion}
        promotionTypes={promotionTypes}
      />

      {/* Manage Promotion Types Modal */}
      <ManagePromotionTypesModal
        isOpen={showManageTypes}
        onClose={() => setShowManageTypes(false)}
        promotionTypes={promotionTypes}
        onAdd={addPromotionType}
        onUpdate={updatePromotionType}
        onDelete={deletePromotionType}
        onReset={resetPromotionTypes}
      />
    </div>
  );
}
