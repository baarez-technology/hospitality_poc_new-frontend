/**
 * useCMSRatePlans Hook
 * Manages rate plan data for the CMS
 * Now connected to backend API
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../api/client';

interface RatePlan {
  id: string;
  name: string;
  fullName: string;
  description: string;
  status: string;
  isActive: boolean;
  mealPlan: string;
  commission: number;
  channels: string[];
  // Discount/pricing fields
  discountType: 'percentage' | 'flat' | 'fixed';  // percentage=% off, flat=₹ off, fixed=fixed price
  discountValue: number;  // Discount amount
  baseRates: Record<string, number>;
  basePrice: Record<string, number>;
  derivedRules: any[];
  restrictions: {
    minStay: number;
    maxStay: number;
    CTA: boolean;
    CTD: boolean;
    advanceBooking: number | null;
    closedDates: string[];
  };
  calendarRates: Record<string, any>;
  cancellationPolicy: string;
  paymentTerms: string;
  createdAt: string;
  updatedAt: string;
  minStay?: number;
  maxStay?: number;
  ctaEnabled?: boolean;
  ctdEnabled?: boolean;
  priceRules?: any[];
  linkedRoomTypes?: string[];  // Room type slugs this plan applies to
}

// Transform API rate plan to frontend format
function transformApiRatePlan(apiPlan: any): RatePlan {
  return {
    id: apiPlan.id?.toString() || `RP-${Date.now()}`,
    name: apiPlan.code || apiPlan.name || 'Unknown',
    fullName: apiPlan.name || apiPlan.code || 'Unknown',
    description: apiPlan.description || '',
    status: apiPlan.is_active ? 'Active' : 'Inactive',
    isActive: apiPlan.is_active ?? true,
    mealPlan: apiPlan.meal_plan || 'Room Only',
    commission: apiPlan.commission || 0,
    channels: apiPlan.channels || ['Direct', 'OTA'],
    // Discount/pricing fields
    discountType: apiPlan.discount_type || 'percentage',
    discountValue: apiPlan.discount_value || 0,
    baseRates: { default: apiPlan.base_price || 0 },
    basePrice: { default: apiPlan.base_price || 0 },
    derivedRules: [],
    restrictions: {
      minStay: apiPlan.min_stay || 1,
      maxStay: apiPlan.max_stay || 30,
      CTA: apiPlan.cta_enabled || false,
      CTD: apiPlan.ctd_enabled || false,
      advanceBooking: null,
      closedDates: [],
    },
    calendarRates: {},
    cancellationPolicy: apiPlan.cancellation_policy || 'Standard cancellation policy applies.',
    paymentTerms: apiPlan.payment_terms || 'Standard payment terms apply.',
    createdAt: apiPlan.created_at || new Date().toISOString(),
    updatedAt: apiPlan.updated_at || new Date().toISOString(),
    minStay: apiPlan.min_stay || 1,
    maxStay: apiPlan.max_stay || 30,
    ctaEnabled: apiPlan.cta_enabled || false,
    ctdEnabled: apiPlan.ctd_enabled || false,
    priceRules: [],
    linkedRoomTypes: apiPlan.linked_room_types || [],
  };
}

export default function useCMSRatePlans() {
  const [ratePlans, setRatePlans] = useState<RatePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rate plans from API
  const fetchRatePlans = useCallback(async () => {
    // Skip API call if not authenticated
    const token = localStorage.getItem('glimmora_access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/v1/rates/plans');
      const apiPlans = response.data || [];

      if (Array.isArray(apiPlans) && apiPlans.length > 0) {
        const transformedPlans = apiPlans.map(transformApiRatePlan);
        setRatePlans(transformedPlans);
      } else {
        // Keep empty array if no data
        setRatePlans([]);
      }
    } catch (err) {
      console.error('Error fetching rate plans:', err);
      setError('Failed to load rate plans');
      // Keep empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchRatePlans();
  }, [fetchRatePlans]);

  const addRatePlan = useCallback(async (planData: Partial<RatePlan>) => {
    try {
      // Create API payload with all fields
      const apiPayload = {
        code: planData.name?.toUpperCase().replace(/\s+/g, '-').substring(0, 10) || 'NEW',
        name: planData.fullName || planData.name || 'New Rate Plan',
        description: planData.description || '',
        plan_type: 'BAR',
        currency: 'INR',
        discount_type: planData.discountType || 'percentage',
        discount_value: planData.discountValue || 0,
        base_price: planData.baseRates?.default || planData.basePrice?.default || 0,  // Deprecated
        is_active: planData.isActive ?? true,
        // Additional fields
        meal_plan: planData.mealPlan || 'Room Only',
        min_stay: planData.restrictions?.minStay ?? planData.minStay ?? 1,
        max_stay: planData.restrictions?.maxStay ?? planData.maxStay ?? 30,
        cta_enabled: planData.restrictions?.CTA ?? planData.ctaEnabled ?? false,
        ctd_enabled: planData.restrictions?.CTD ?? planData.ctdEnabled ?? false,
        cancellation_policy: planData.cancellationPolicy || null,
        linked_room_types: planData.linkedRoomTypes || null,
      };

      const response = await apiClient.post('/api/v1/rates/plans', apiPayload);

      // Refetch to get updated list
      await fetchRatePlans();

      return {
        id: response.data?.id?.toString() || `RP-${Date.now()}`,
        ...planData,
        name: planData.name || 'New Rate Plan',
        fullName: planData.fullName || planData.name || 'New Rate Plan',
      } as RatePlan;
    } catch (err) {
      console.error('Error creating rate plan:', err);
      // Add locally as fallback
      const newPlan: RatePlan = {
        id: `RP-${Date.now()}`,
        name: planData.name || 'New Rate Plan',
        fullName: planData.fullName || planData.name || 'New Rate Plan',
        description: planData.description || '',
        status: planData.status || 'Active',
        isActive: planData.isActive ?? true,
        mealPlan: planData.mealPlan || 'Room Only',
        commission: planData.commission || 0,
        channels: planData.channels || ['Direct'],
        discountType: planData.discountType || 'percentage',
        discountValue: planData.discountValue || 0,
        baseRates: planData.baseRates || {},
        basePrice: planData.basePrice || {},
        derivedRules: planData.derivedRules || [],
        restrictions: planData.restrictions || {
          minStay: 1,
          maxStay: 30,
          CTA: false,
          CTD: false,
          advanceBooking: null,
          closedDates: [],
        },
        calendarRates: planData.calendarRates || {},
        cancellationPolicy: planData.cancellationPolicy || 'Standard cancellation policy applies.',
        paymentTerms: planData.paymentTerms || 'Standard payment terms apply.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRatePlans(prev => [...prev, newPlan]);
      return newPlan;
    }
  }, [fetchRatePlans]);

  const updateRatePlan = useCallback(async (id: string, updates: Partial<RatePlan>) => {
    try {
      // Build API payload with discount fields
      const apiPayload: Record<string, any> = {};
      if (updates.fullName || updates.name) apiPayload.name = updates.fullName || updates.name;
      if (updates.description !== undefined) apiPayload.description = updates.description;
      if (updates.discountType !== undefined) apiPayload.discount_type = updates.discountType;
      if (updates.discountValue !== undefined) apiPayload.discount_value = updates.discountValue;
      if (updates.baseRates?.default !== undefined) apiPayload.base_price = updates.baseRates.default;
      if (updates.basePrice?.default !== undefined) apiPayload.base_price = updates.basePrice.default;
      if (updates.isActive !== undefined) apiPayload.is_active = updates.isActive;

      // Call API to update
      await apiClient.put(`/api/v1/rates/plans/${id}`, apiPayload);

      // Update local state
      setRatePlans(prev =>
        prev.map(plan =>
          plan.id === id ? { ...plan, ...updates, updatedAt: new Date().toISOString() } : plan
        )
      );

      // Refetch to ensure sync
      await fetchRatePlans();
    } catch (err) {
      console.error('Error updating rate plan:', err);
      // Still update local state as fallback
      setRatePlans(prev =>
        prev.map(plan =>
          plan.id === id ? { ...plan, ...updates, updatedAt: new Date().toISOString() } : plan
        )
      );
    }
  }, [fetchRatePlans]);

  const deleteRatePlan = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/api/v1/rates/plans/${id}`);
      setRatePlans(prev => prev.filter(plan => plan.id !== id));
    } catch (err) {
      console.error('Error deleting rate plan:', err);
      // Still remove from local state
      setRatePlans(prev => prev.filter(plan => plan.id !== id));
    }
  }, []);

  const getRatePlanById = useCallback((id: string) => {
    return ratePlans.find(plan => plan.id === id);
  }, [ratePlans]);

  const toggleRatePlanStatus = useCallback(async (id: string) => {
    try {
      await apiClient.patch(`/api/v1/rates/plans/${id}/toggle`);

      // Update local state
      setRatePlans(prev =>
        prev.map(plan =>
          plan.id === id ? { ...plan, isActive: !plan.isActive, updatedAt: new Date().toISOString() } : plan
        )
      );
    } catch (err) {
      console.error('Error toggling rate plan status:', err);
      // Still toggle locally
      setRatePlans(prev =>
        prev.map(plan =>
          plan.id === id ? { ...plan, isActive: !plan.isActive, updatedAt: new Date().toISOString() } : plan
        )
      );
    }
  }, []);

  return {
    ratePlans,
    loading,
    error,
    addRatePlan,
    updateRatePlan,
    deleteRatePlan,
    getRatePlanById,
    toggleRatePlanStatus,
    refetch: fetchRatePlans,
  };
}
