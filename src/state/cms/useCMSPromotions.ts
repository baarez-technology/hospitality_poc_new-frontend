/**
 * useCMSPromotions Hook
 * Manages promotion data for the CMS
 * Now connected to backend API
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../api/client';

interface Promotion {
  id: string;
  name: string;
  code: string;
  type: string;
  value: number;
  description: string;
  status: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  minStay: number;
  maxUsage: number | null;
  currentUsage: number;
  applicableRoomTypes: string[];
  applicableRatePlans: string[];
  stackable: boolean;
  blackoutDates: string[];
  terms: string;
  createdAt: string;
  updatedAt: string;
}

// Transform API promo code to frontend format
function transformApiPromo(apiPromo: any): Promotion {
  return {
    id: apiPromo.id?.toString() || `PROMO-${Date.now()}`,
    name: apiPromo.name || apiPromo.code || 'Unknown',
    code: apiPromo.code || '',
    type: apiPromo.discount_type || 'percentage',
    value: apiPromo.discount_value || 0,
    description: apiPromo.description || '',
    status: apiPromo.is_active ? 'Active' : 'Inactive',
    isActive: apiPromo.is_active ?? true,
    startDate: apiPromo.valid_from || new Date().toISOString().split('T')[0],
    endDate: apiPromo.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    minStay: apiPromo.min_stay || 1,
    maxUsage: apiPromo.usage_limit || null,
    currentUsage: apiPromo.usage_count || 0,
    applicableRoomTypes: [],
    applicableRatePlans: ['BAR'],
    stackable: false,
    blackoutDates: [],
    terms: apiPromo.description || '',
    createdAt: apiPromo.created_at || new Date().toISOString(),
    updatedAt: apiPromo.updated_at || new Date().toISOString(),
  };
}

export default function useCMSPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch promotions from API
  const fetchPromotions = useCallback(async () => {
    // Skip API call if not authenticated
    const token = localStorage.getItem('glimmora_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/v1/rates/promo-codes');
      const apiPromos = response.data || [];

      if (Array.isArray(apiPromos) && apiPromos.length > 0) {
        const transformedPromos = apiPromos.map(transformApiPromo);
        setPromotions(transformedPromos);
      } else {
        setPromotions([]);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const addPromotion = useCallback(async (promoData: Partial<Promotion>) => {
    try {
      // Create API payload
      const apiPayload = {
        code: promoData.code || promoData.name?.toUpperCase().replace(/\s+/g, '').substring(0, 10) || 'NEW',
        name: promoData.name || 'New Promotion',
        description: promoData.description || promoData.terms || '',
        discount_type: promoData.type || 'percentage',
        discount_value: promoData.value || 10,
        min_stay: promoData.minStay || 1,
        max_stay: null,
        valid_from: promoData.startDate || new Date().toISOString().split('T')[0],
        valid_until: promoData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usage_limit: promoData.maxUsage || null,
      };

      const response = await apiClient.post('/api/v1/rates/promo-codes', apiPayload);

      // Refetch to get updated list
      await fetchPromotions();

      return {
        id: response.data?.id?.toString() || `PROMO-${Date.now()}`,
        ...promoData,
        name: promoData.name || 'New Promotion',
        code: apiPayload.code,
      } as Promotion;
    } catch (err) {
      console.error('Error creating promotion:', err);
      // Add locally as fallback
      const newPromo: Promotion = {
        id: `PROMO-${Date.now()}`,
        name: promoData.name || 'New Promotion',
        code: promoData.code || `CODE${Date.now()}`,
        type: promoData.type || 'percentage',
        value: promoData.value || 10,
        description: promoData.description || '',
        status: promoData.status || 'Active',
        isActive: promoData.isActive ?? true,
        startDate: promoData.startDate || new Date().toISOString().split('T')[0],
        endDate: promoData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        minStay: promoData.minStay || 1,
        maxUsage: promoData.maxUsage || null,
        currentUsage: promoData.currentUsage || 0,
        applicableRoomTypes: promoData.applicableRoomTypes || [],
        applicableRatePlans: promoData.applicableRatePlans || ['BAR'],
        stackable: promoData.stackable || false,
        blackoutDates: promoData.blackoutDates || [],
        terms: promoData.terms || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPromotions(prev => [...prev, newPromo]);
      return newPromo;
    }
  }, [fetchPromotions]);

  const updatePromotion = useCallback(async (id: string, updates: Partial<Promotion>) => {
    try {
      // Build API payload from updates
      const apiPayload: Record<string, any> = {};
      if (updates.name !== undefined) apiPayload.name = updates.name;
      if (updates.description !== undefined) apiPayload.description = updates.description;
      if (updates.type !== undefined) apiPayload.discount_type = updates.type;
      if (updates.value !== undefined) apiPayload.discount_value = updates.value;
      if (updates.minStay !== undefined) apiPayload.min_stay = updates.minStay;
      if (updates.startDate !== undefined) apiPayload.valid_from = updates.startDate;
      if (updates.endDate !== undefined) apiPayload.valid_until = updates.endDate;
      if (updates.maxUsage !== undefined) apiPayload.usage_limit = updates.maxUsage;
      if (updates.isActive !== undefined) apiPayload.is_active = updates.isActive;

      await apiClient.put(`/api/v1/rates/promo-codes/${id}`, apiPayload);

      // Update local state
      setPromotions(prev =>
        prev.map(promo =>
          promo.id === id ? { ...promo, ...updates, updatedAt: new Date().toISOString() } : promo
        )
      );
      return true;
    } catch (err) {
      console.error('Error updating promotion:', err);
      // Still update local state as fallback
      setPromotions(prev =>
        prev.map(promo =>
          promo.id === id ? { ...promo, ...updates, updatedAt: new Date().toISOString() } : promo
        )
      );
      return false;
    }
  }, []);

  const deletePromotion = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/api/v1/rates/promo-codes/${id}`);
      setPromotions(prev => prev.filter(promo => promo.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting promotion:', err);
      // Remove from local state anyway
      setPromotions(prev => prev.filter(promo => promo.id !== id));
      return false;
    }
  }, []);

  const getPromotionById = useCallback((id: string) => {
    return promotions.find(promo => promo.id === id);
  }, [promotions]);

  const togglePromotionStatus = useCallback(async (id: string) => {
    try {
      const response = await apiClient.patch(`/api/v1/rates/promo-codes/${id}/toggle`);
      const newStatus = response.data?.is_active;

      setPromotions(prev =>
        prev.map(promo =>
          promo.id === id ? {
            ...promo,
            isActive: newStatus ?? !promo.isActive,
            status: newStatus ? 'Active' : 'Inactive',
            updatedAt: new Date().toISOString()
          } : promo
        )
      );
      return true;
    } catch (err) {
      console.error('Error toggling promotion status:', err);
      // Toggle local state as fallback
      setPromotions(prev =>
        prev.map(promo =>
          promo.id === id ? {
            ...promo,
            isActive: !promo.isActive,
            status: !promo.isActive ? 'Active' : 'Inactive',
            updatedAt: new Date().toISOString()
          } : promo
        )
      );
      return false;
    }
  }, []);

  return {
    promotions,
    loading,
    error,
    addPromotion,
    updatePromotion,
    deletePromotion,
    getPromotionById,
    togglePromotionStatus,
    refetch: fetchPromotions,
  };
}
