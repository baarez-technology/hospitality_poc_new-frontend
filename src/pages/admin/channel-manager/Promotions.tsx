/**
 * Channel Manager Promotions Page
 * Manage OTA-specific promotions and deals - Glimmora Design System v5.0
 * Consistent with Restrictions, RateSync, OTAConnections, and RoomMapping pages
 */

import { useState, useCallback } from 'react';
import {
  Plus, Gift, Percent, Users, TrendingUp, ToggleRight, AlertTriangle, Loader2
} from 'lucide-react';
import { useChannelManager } from '../../../context/ChannelManagerContext';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import { useToast } from '../../../contexts/ToastContext';
import ChannelPromotionCard from '../../../components/channel-manager/ChannelPromotionCard';
import PromotionDrawer from '../../../components/channel-manager/PromotiomDrawer';
import { Button } from '../../../components/ui2/Button';
import { Modal } from '../../../components/ui2/Modal';

export default function Promotions() {
  const {
    otas,
    promotions,
    isLoading: contextLoading,
    createChannelPromotion,
    updateChannelPromotion,
    deleteChannelPromotion,
    toggleChannelPromotion,
    applyPromotionToOTA,
    fetchPromotions,
  } = useChannelManager();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, promotion: null });
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  // Refetch data function for SSE
  const refetchData = useCallback(async () => {
    await fetchPromotions();
  }, [fetchPromotions]);

  // Register SSE event handlers for real-time updates
  useChannelManagerSSEEvents({
    onRatesUpdated: refetchData, // Promotions affect rates
    refetchData,
  });

  const connectedOTAs = otas.filter(o => o.status === 'connected');

  // Filter promotions
  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          promo.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;

    const now = new Date();
    const start = new Date(promo.validFrom);
    const end = new Date(promo.validTo);

    if (filterStatus === 'active') {
      return matchesSearch && promo.isActive && now >= start && now <= end;
    }
    if (filterStatus === 'scheduled') {
      return matchesSearch && promo.isActive && now < start;
    }
    if (filterStatus === 'expired') {
      return matchesSearch && now > end;
    }
    if (filterStatus === 'inactive') {
      return matchesSearch && !promo.isActive;
    }

    return matchesSearch;
  });

  // Stats
  const now = new Date();
  const stats = {
    total: promotions.length,
    active: promotions.filter(p => {
      const start = new Date(p.validFrom);
      const end = new Date(p.validTo);
      return p.isActive && now >= start && now <= end;
    }).length,
    totalUsage: promotions.reduce((sum, p) => sum + (p.usageCount || 0), 0),
    avgDiscount: Math.round(
      promotions
        .filter(p => p.discountType === 'percentage')
        .reduce((sum, p) => sum + p.discountValue, 0) /
      promotions.filter(p => p.discountType === 'percentage').length || 0
    )
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setShowDrawer(true);
  };

  const handleDelete = (promotion) => {
    setDeleteConfirm({ isOpen: true, promotion });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.promotion) {
      try {
        await deleteChannelPromotion(deleteConfirm.promotion.id);
        await refetchData();
      } catch (err) {
        // Error already handled in context
      }
    }
    setDeleteConfirm({ isOpen: false, promotion: null });
  };

  const handleToggle = async (promotion) => {
    try {
      await toggleChannelPromotion(promotion.id);
      await refetchData();
    } catch (err) {
      // Error already handled in context
    }
  };

  const handleDuplicate = async (promotion) => {
    try {
      const newPromo = {
        name: `${promotion.name} (Copy)`,
        description: promotion.description || '',
        discountType: promotion.discountType,
        discountValue: promotion.discountValue,
        validFrom: promotion.validFrom,
        validTo: promotion.validTo,
        otaCodes: promotion.otaCodes || ['ALL'],
        roomTypes: promotion.roomTypes || ['ALL'],
        minStay: promotion.minStay || null,
        bookingWindow: promotion.bookingWindow || null,
      };
      await createChannelPromotion(newPromo);
      toast.success('Promotion duplicated successfully');
      await refetchData();
    } catch (err) {
      // Error already handled
    }
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    setShowDrawer(true);
  };

  const handleSave = async (data, isEditing) => {
    try {
      if (isEditing && editingPromotion) {
        await updateChannelPromotion(editingPromotion.id, data);
      } else {
        await createChannelPromotion(data);
      }
      setShowDrawer(false);
      setEditingPromotion(null);
      await refetchData();
    } catch (err) {
      // Error already handled in context
    }
  };

  // KPI cards configuration - matching Restrictions page pattern
  const kpiCards = [
    {
      icon: Gift,
      title: 'Total Promotions',
      value: stats.total,
      accent: 'terra'
    },
    {
      icon: ToggleRight,
      title: 'Active Now',
      value: stats.active,
      accent: 'sage'
    },
    {
      icon: Users,
      title: 'Total Usage',
      value: stats.totalUsage,
      accent: 'gold'
    },
    {
      icon: Percent,
      title: 'Avg Discount',
      value: `${stats.avgDiscount}%`,
      accent: 'terra'
    }
  ];

  const accentColors = {
    terra: { icon: 'bg-terra-100 text-terra-600' },
    sage: { icon: 'bg-sage-100 text-sage-600' },
    gold: { icon: 'bg-gold-100 text-gold-600' },
    rose: { icon: 'bg-rose-100 text-rose-600' },
    neutral: { icon: 'bg-neutral-100 text-neutral-500' }
  };

  // Filter tabs configuration
  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'expired', label: 'Expired' },
    { key: 'inactive', label: 'Inactive' }
  ];

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-terra-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading promotions...</p>
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
              Channel Promotions
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Manage OTA-specific promotions and deals</span>
              <span className="sm:hidden">Manage OTA promotions</span>
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={handleCreate} className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Create Promotion</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {kpiCards.map((kpi, index) => {
            const colors = accentColors[kpi.accent];
            return (
              <div key={index} className="rounded-[10px] bg-white p-4 sm:p-6">
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
                <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">
                  {kpi.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Filter Tabs */}
        <section className="flex items-center gap-1 p-1 sm:p-1.5 bg-white rounded-lg w-full sm:w-fit overflow-x-auto">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold rounded-md transition-all whitespace-nowrap flex-shrink-0 ${
                filterStatus === tab.key
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* Promotion Cards */}
        <section className="space-y-3 sm:space-y-4">
          {filteredPromotions.length === 0 ? (
            <div className="rounded-[10px] bg-white px-4 sm:px-6 py-8 sm:py-16 text-center">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-neutral-50 flex items-center justify-center">
                  <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-[13px] font-medium text-neutral-600">
                    {searchQuery || filterStatus !== 'all'
                      ? 'No promotions match your criteria'
                      : 'No promotions configured'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400">
                    {searchQuery || filterStatus !== 'all'
                      ? 'Try adjusting your search or filter'
                      : 'Create your first channel promotion'}
                  </p>
                </div>
                {!searchQuery && filterStatus === 'all' && (
                  <Button variant="primary" icon={Plus} onClick={handleCreate} className="mt-2 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Create Promotion</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            filteredPromotions.map(promo => (
              <ChannelPromotionCard
                key={promo.id}
                promotion={promo}
                otas={otas}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onDuplicate={handleDuplicate}
              />
            ))
          )}
        </section>
      </div>

      {/* Promotion Drawer */}
      <PromotionDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setEditingPromotion(null);
        }}
        promotion={editingPromotion}
        onSave={handleSave}
        connectedOTAs={connectedOTAs}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, promotion: null })}
        size="sm"
        showClose={false}
      >
        <div className="p-4 sm:p-6">
          {/* Warning Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-3 sm:mb-4">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">
            Delete Promotion
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-neutral-500 leading-relaxed">
            Are you sure you want to delete "{deleteConfirm.promotion?.name}"? This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/50">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirm({ isOpen: false, promotion: null })}
            className="px-4 sm:px-5 py-2 text-xs sm:text-[13px] font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            className="px-4 sm:px-5 py-2 text-xs sm:text-[13px] font-semibold"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
