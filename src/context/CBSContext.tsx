/**
 * CBS Context - Central Booking System Inventory Engine
 * Manages bookings, availability, rate plans, and promotions
 * Now integrated with CMS Zustand stores for unified state management
 * Connected to backend API for real data
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { statusConfig, sampleBookings } from '../data/cbs/sampleBookings';
import { samplePromotions } from '../data/cbs/samplePromotions';
import { getCalendarDates, checkAvailability } from '../data/cbs/sampleAvailability';
import { roomsData } from '../data/roomsData';
import { apiClient, clearApiCache } from '../api/client';
// Import CMS Zustand stores for enhanced functionality
import useCMSBookings from '../state/cms/useCMSBookings';
import useCMSAvailability from '../state/cms/useCMSAvailability';
import useCMSRatePlans from '../state/cms/useCMSRatePlans';
import useCMSPromotions from '../state/cms/useCMSPromotions';
import useCMSEngine from '../state/cms/useCMSEngine';

const CBSContext = createContext(null);

const STORAGE_KEY = 'cbs_data';
const PROMOTION_TYPES_KEY = 'cbs_promotion_types';
// Increment this version when sample data structure/values change
// This will invalidate any cached localStorage data with older version
const CBS_DATA_VERSION = 4;  // Incremented to clear old rate plan cache and force API refresh

// Default promotion types
const DEFAULT_PROMOTION_TYPES = [
  { value: 'Early Bird', label: 'Early Bird' },
  { value: 'Last Minute', label: 'Last Minute' },
  { value: 'Long Stay', label: 'Long Stay' },
  { value: 'Advance Purchase', label: 'Advance Purchase' },
  { value: 'Seasonal Deal', label: 'Seasonal Deal' },
  { value: 'Flash Sale', label: 'Flash Sale' },
  { value: 'OTA Exclusive', label: 'OTA Exclusive' },
  { value: 'Direct Booking', label: 'Direct Booking' },
];

function loadPromotionTypes() {
  try {
    const stored = localStorage.getItem(PROMOTION_TYPES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load promotion types from storage:', e);
  }
  return DEFAULT_PROMOTION_TYPES;
}

function savePromotionTypes(types) {
  try {
    localStorage.setItem(PROMOTION_TYPES_KEY, JSON.stringify(types));
  } catch (e) {
    console.error('Failed to save promotion types to storage:', e);
  }
}

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);

      // Check data version - if different, invalidate entire cache
      if (data?._version !== CBS_DATA_VERSION) {
        console.log('[CBS] Data version mismatch, clearing stale cache. Old:', data?._version, 'New:', CBS_DATA_VERSION);
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Check if stored availability has current dates
      // If today's date is not in stored availability, the data is stale
      if (data?.availability) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;

        if (!data.availability[todayStr]) {
          console.log('[CBS] Stored availability dates are stale, using fresh sample data');
          // Return data but with null availability to trigger fresh sample data
          return { ...data, availability: null };
        }
      }

      return data;
    }
  } catch (e) {
    console.error('Failed to load CBS data from storage:', e);
  }
  return null;
}

function saveToStorage(data) {
  try {
    // Include version for cache invalidation
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, _version: CBS_DATA_VERSION }));
  } catch (e) {
    console.error('Failed to save CBS data to storage:', e);
  }
}

export function CBSProvider({ children }) {
  const location = useLocation();
  const stored = loadFromStorage();

  // Track if data has been loaded to prevent re-fetching
  const isDataLoadedRef = useRef(false);

  // Check if on pages that need CBS data (bookings, rates, calendar, dashboard, reservations, cms)
  const isCBSPage =
    location.pathname.includes('/bookings') ||
    location.pathname.includes('/rates') ||
    location.pathname.includes('/rate-plans') ||
    location.pathname.includes('/cms') ||
    location.pathname.includes('/calendar') ||
    location.pathname.includes('/reservations') ||
    location.pathname.includes('/dashboard') ||
    location.pathname.includes('/availability') ||
    location.pathname === '/admin' ||
    location.pathname === '/admin/';

  const [bookings, setBookings] = useState(stored?.bookings || []);
  // Don't use sample availability - wait for API data from cmsAvailability hook
  const [availability, setAvailability] = useState({});
  const [ratePlans, setRatePlans] = useState(stored?.ratePlans || []);
  const [promotions, setPromotions] = useState(stored?.promotions || []);
  const [promotionTypes, setPromotionTypes] = useState(loadPromotionTypes());
  const [rooms, setRooms] = useState([]); // Rooms from API with database IDs
  const [isLoading, setIsLoading] = useState(true);

  // CMS Zustand stores - these provide enhanced functionality and are persisted separately
  const cmsBookings = useCMSBookings();
  const cmsAvailability = useCMSAvailability();
  const cmsRatePlans = useCMSRatePlans();
  const cmsPromotions = useCMSPromotions();
  const cmsEngine = useCMSEngine();

  // Persist to localStorage whenever data changes
  useEffect(() => {
    saveToStorage({ bookings, availability, ratePlans, promotions });
  }, [bookings, availability, ratePlans, promotions]);

  // Persist promotion types separately
  useEffect(() => {
    savePromotionTypes(promotionTypes);
  }, [promotionTypes]);

  // Fetch bookings, rate plans, and promotions from API on mount
  // Only fetch if user has an access token (is authenticated) AND on CBS pages
  useEffect(() => {
    // Skip if not on CBS page or data already loaded
    if (!isCBSPage || isDataLoadedRef.current) {
      if (!isCBSPage) setIsLoading(false);
      return;
    }

    const fetchFromApi = async () => {
      // Check if user is authenticated before making API calls
      const token = localStorage.getItem('glimmora_access_token');
      if (!token) {
        // Use sample bookings when not authenticated and no stored data
        if (!stored?.bookings?.length) {
          console.log('[CBS] No auth token, using sample bookings');
          setBookings([...sampleBookings]);
        }
        setIsLoading(false);
        return; // Skip API calls if not authenticated
      }

      setIsLoading(true);
      try {
        // Fetch bookings from API
        const bookingsResponse = await apiClient.get('/api/v1/bookings', {
          params: { pageSize: 1000 }
        });
        const apiBookings = bookingsResponse.data?.items || bookingsResponse.data?.data?.items || [];

        if (apiBookings.length > 0) {
          const transformedBookings = apiBookings.map((b: any) => {
            const guest = b.guestInfo;
            const guestName = `${guest?.firstName || ''} ${guest?.lastName || ''}`.trim() || 'Guest';

            const statusMap: Record<string, string> = {
              'confirmed': 'CONFIRMED',
              'pending': 'PENDING',
              'checked-in': 'CHECKED-IN',
              'checked_in': 'CHECKED-IN',
              'checked-out': 'CHECKED-OUT',
              'checked_out': 'CHECKED-OUT',
              'cancelled': 'CANCELLED',
            };

            // Calculate payment amounts
            const totalPrice = b.totalPrice || b.total_price || 0;
            const depositAmount = b.depositAmount || b.deposit_amount || 0;
            const balanceDue = b.balanceDue || b.balance_due;

            // If payment_status is 'paid', amount paid = total price
            // If payment_status is 'partial', amount paid = deposit amount
            // Otherwise, use balance_due to calculate amount paid
            let amountPaid = 0;
            let balance = totalPrice;

            if (b.payment_status === 'paid') {
              amountPaid = totalPrice;
              balance = 0;
            } else if (b.payment_status === 'partial' || depositAmount > 0) {
              amountPaid = depositAmount;
              balance = balanceDue !== null && balanceDue !== undefined ? balanceDue : (totalPrice - depositAmount);
            } else if (balanceDue !== null && balanceDue !== undefined) {
              amountPaid = totalPrice - balanceDue;
              balance = balanceDue;
            }

            return {
              id: b.bookingNumber || b.id,
              dbId: b.id, // Store original database ID for API calls
              guestId: b.guest_id || b.guestId || null,
              guestName: guestName,
              guestEmail: guest?.email || '',
              guestPhone: guest?.phone || '',
              isVip: b.vipStatus || b.vip_flag || false,
              checkIn: b.checkIn || b.arrival_date,
              checkOut: b.checkOut || b.departure_date,
              nights: b.nights || 1,
              roomType: b.room?.name || 'Minimalist Studio',
              roomNumber: b.room?.number || null,
              ratePlan: b.ratePlanName || 'BAR',
              ratePlanName: b.ratePlanName || null,
              ratePlanDiscountType: b.ratePlanDiscountType || null,
              ratePlanDiscountValue: b.ratePlanDiscountValue || 0,
              originalRoomRate: b.originalRoomRate || null,
              ratePerNight: b.ratePerNight || null,
              basePrice: b.basePrice || 0,
              taxes: b.taxes || 0,
              adults: (b.guests?.adults || b.adults || 1),
              children: (b.guests?.children || b.children || 0),
              status: statusMap[b.status?.toLowerCase()] || 'CONFIRMED',
              // Map source - prefer ota_code/channel for Dummy CM (backend may wrongly return Booking.com)
              source: (() => {
                const otaCode = (b.ota_code || b.otaCode || b.channel_code || b.metadata?.ota || '').toString().toUpperCase();
                const channel = (b.channel || b.source_channel || b.metadata?.channel || '').toString().toLowerCase();
                const isDummyCM = otaCode === 'DUMMY' || otaCode === 'CRS' || channel.includes('dummy') || channel.includes('crs');
                if (isDummyCM) return 'Dummy Channel Manager';
                const sourceMap = {
                  'Website': 'Website', 'direct': 'Website',
                  'Dummy Channel Manager': 'Dummy Channel Manager', 'dummy channel manager': 'Dummy Channel Manager',
                  'DUMMY': 'Dummy Channel Manager', 'dummy': 'Dummy Channel Manager',
                  'CRS': 'Dummy Channel Manager', 'crs': 'Dummy Channel Manager',
                  'Booking.com': 'Booking.com', 'booking.com': 'Booking.com',
                  'Expedia': 'Expedia', 'expedia': 'Expedia',
                  'Walk-in': 'Walk-in', 'walk_in': 'Walk-in', 'walk-in': 'Walk-in',
                  'OTA': 'OTA',
                };
                const rawSource = b.bookingSource || b.booking_source || 'Direct';
                return sourceMap[rawSource] || rawSource;
              })(),
              amount: totalPrice,
              amountPaid: amountPaid,
              balance: balance,
              paymentStatus: b.payment_status || 'pending',
              specialRequests: guest?.specialRequests || b.special_requests || '',
              createdAt: b.createdAt || b.created_at || new Date().toISOString(),
              createdBy: 'System',
              payments: depositAmount > 0 ? [{
                id: `PAY-${b.id || Date.now()}`,
                date: b.createdAt || b.created_at || new Date().toISOString(),
                amount: depositAmount,
                method: 'Card',
                status: 'completed'
              }] : [],
              activityLog: [
                {
                  date: b.createdAt || b.created_at || new Date().toISOString(),
                  action: 'Booking created',
                  user: 'System'
                }
              ]
            };
          });

          setBookings(transformedBookings);
        } else {
          console.log('[CBS] API returned no bookings, using sample data');
          setBookings([...sampleBookings]);
        }

        // Fetch rate plans from API
        const ratePlansResponse = await apiClient.get('/api/v1/rates/plans');
        // Handle wrapped response format: { success: true, data: [...] }
        const apiRatePlans = ratePlansResponse.data?.data || ratePlansResponse.data || [];

        if (Array.isArray(apiRatePlans) && apiRatePlans.length > 0) {
          const transformedPlans = apiRatePlans.map((p: any) => ({
            id: p.id?.toString() || `RP-${Date.now()}`,
            name: p.code || p.name || 'Unknown',
            fullName: p.name || p.code || 'Unknown',
            description: p.description || '',
            isActive: p.is_active ?? true,
            mealPlan: p.meal_plan || 'Room Only',
            commission: 0,
            channels: ['Direct', 'OTA'],
            discountType: p.discount_type || 'percentage',
            discountValue: p.discount_value || 0,
            basePrice: { default: p.base_price || 0 },
            minStay: p.min_stay || 1,
            maxStay: p.max_stay || 30,
            ctaEnabled: p.cta_enabled || false,
            ctdEnabled: p.ctd_enabled || false,
            cancellationPolicy: p.cancellation_policy || 'Standard cancellation policy applies.',
            linkedRoomTypes: p.linked_room_types || [],
            priceRules: [],
            updatedAt: p.updated_at || new Date().toISOString(),
          }));
          setRatePlans(transformedPlans);
        } else {
          // No rate plans from API - start fresh with empty array
          setRatePlans([]);
        }

        // Fetch promo codes from API
        const promosResponse = await apiClient.get('/api/v1/rates/promo-codes');
        const apiPromos = promosResponse.data || [];

        if (Array.isArray(apiPromos) && apiPromos.length > 0) {
          const transformedPromos = apiPromos.map((p: any) => ({
            id: p.id?.toString() || `PROMO-${Date.now()}`,
            title: p.name || p.code || 'Unknown',
            code: p.code || '',
            description: p.description || '',
            discountType: p.discount_type || 'percentage',
            discountValue: p.discount_value || 0,
            isActive: p.is_active ?? true,
            validFrom: p.valid_from || new Date().toISOString().split('T')[0],
            validTo: p.valid_until || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            minNights: p.min_stay || 1,
            maxNights: p.max_stay || null,
            usageLimit: p.usage_limit || null,
            usageCount: p.usage_count || 0,
            applicableRoomTypes: [],
            applicableRatePlans: ['BAR'],
            applicableChannels: ['Website'],
            channels: ['Website'],
            stackable: false,
            blackoutDates: [],
            termsAndConditions: '',
            type: 'Discount',
            discount: { type: p.discount_type || 'percentage', value: p.discount_value || 0 },
          }));
          setPromotions(prev => {
            // Merge API promos with existing ones (avoid duplicates)
            const existingIds = new Set(prev.map(p => p.code));
            const newPromos = transformedPromos.filter((p: any) => !existingIds.has(p.code));
            return [...prev, ...newPromos];
          });
        }

        // Fetch rooms from API for room assignment
        try {
          const roomsResponse = await apiClient.get('/api/v1/rooms');
          const apiRooms = roomsResponse.data?.items || roomsResponse.data || [];
          if (Array.isArray(apiRooms) && apiRooms.length > 0) {
            const transformedRooms = apiRooms.map((r: any) => ({
              id: r.id, // Database ID for API calls
              roomNumber: r.number || r.roomNumber || String(r.id),
              type: r.type || (r.category ? r.category.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null) || r.room_type?.name || 'Minimalist Studio',
              floor: r.floor || 1,
              status: r.status || 'available',
              cleaning: ['available', 'clean', 'inspected'].includes(r.status) ? 'clean' : 'dirty',
              price: r.price || r.room_type?.base_price || 0,
              capacity: r.max_occupancy || r.maxGuests || 2,
              bedType: r.bed_type || 'King',
              amenities: r.amenities || [],
            }));
            setRooms(transformedRooms);
          }
        } catch (roomErr) {
          console.error('Error fetching rooms from API:', roomErr);
          // Keep using sample roomsData as fallback
        }
      } catch (err) {
        console.error('Error fetching CBS data from API:', err);
        // Fallback to sample data when API fails so booking list is visible
        console.log('[CBS] Using sample bookings due to API error');
        setBookings([...sampleBookings]);
      } finally {
        setIsLoading(false);
        isDataLoadedRef.current = true;
      }
    };

    fetchFromApi();
  }, [isCBSPage]); // Re-check when route changes

  // Refresh bookings and related data from API
  const refreshBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('glimmora_access_token');
      if (!token) {
        return; // Skip if not authenticated
      }

      // Clear bookings cache so we always get fresh data (critical when SSE booking.created fires)
      clearApiCache('/api/v1/bookings');

      // Fetch bookings from API (noCache ensures we bypass any remaining cache)
      const bookingsResponse = await apiClient.get('/api/v1/bookings', {
        params: { pageSize: 1000 },
        noCache: true,
      });
      const apiBookings = bookingsResponse.data?.items || bookingsResponse.data?.data?.items || [];

      if (apiBookings.length > 0) {
        const transformedBookings = apiBookings.map((b: any) => {
          const guest = b.guestInfo;
          const guestName = `${guest?.firstName || ''} ${guest?.lastName || ''}`.trim() || 'Guest';

          const statusMap: Record<string, string> = {
            'confirmed': 'CONFIRMED',
            'pending': 'PENDING',
            'checked-in': 'CHECKED-IN',
            'checked_in': 'CHECKED-IN',
            'checked-out': 'CHECKED-OUT',
            'checked_out': 'CHECKED-OUT',
            'cancelled': 'CANCELLED',
          };

          const totalPrice = b.totalPrice || b.total_price || 0;
          const depositAmount = b.depositAmount || b.deposit_amount || 0;
          const balanceDue = b.balanceDue || b.balance_due;

          let amountPaid = 0;
          let balance = totalPrice;

          if (b.payment_status === 'paid') {
            amountPaid = totalPrice;
            balance = 0;
          } else if (b.payment_status === 'partial' || depositAmount > 0) {
            amountPaid = depositAmount;
            balance = balanceDue !== null && balanceDue !== undefined ? balanceDue : (totalPrice - depositAmount);
          } else if (balanceDue !== null && balanceDue !== undefined) {
            amountPaid = totalPrice - balanceDue;
            balance = balanceDue;
          }

          return {
            id: b.bookingNumber || b.id,
            dbId: b.id,
            guestId: b.guest_id || b.guestId || null,
            guestName: guestName,
            guestEmail: guest?.email || '',
            guestPhone: guest?.phone || '',
            isVip: b.vipStatus || b.vip_flag || false,
            checkIn: b.checkIn || b.arrival_date,
            checkOut: b.checkOut || b.departure_date,
            nights: b.nights || 1,
            roomType: b.room?.name || 'Minimalist Studio',
            roomNumber: b.room?.number || null,
            ratePlan: b.ratePlanName || 'BAR',
            ratePlanName: b.ratePlanName || null,
            ratePlanDiscountType: b.ratePlanDiscountType || null,
            ratePlanDiscountValue: b.ratePlanDiscountValue || 0,
            originalRoomRate: b.originalRoomRate || null,
            ratePerNight: b.ratePerNight || null,
            basePrice: b.basePrice || 0,
            taxes: b.taxes || 0,
            adults: (b.guests?.adults || b.adults || 1),
            children: (b.guests?.children || b.children || 0),
            status: statusMap[b.status?.toLowerCase()] || 'CONFIRMED',
            // Map source - prefer ota_code/channel for Dummy CM (backend may wrongly return Booking.com)
              source: (() => {
                const otaCode = (b.ota_code || b.otaCode || b.channel_code || b.metadata?.ota || '').toString().toUpperCase();
                const channel = (b.channel || b.source_channel || b.metadata?.channel || '').toString().toLowerCase();
                const isDummyCM = otaCode === 'DUMMY' || otaCode === 'CRS' || channel.includes('dummy') || channel.includes('crs');
                if (isDummyCM) return 'Dummy Channel Manager';
                const sourceMap = {
                  'Website': 'Website', 'direct': 'Website',
                  'Dummy Channel Manager': 'Dummy Channel Manager', 'dummy channel manager': 'Dummy Channel Manager',
                  'DUMMY': 'Dummy Channel Manager', 'dummy': 'Dummy Channel Manager',
                  'CRS': 'Dummy Channel Manager', 'crs': 'Dummy Channel Manager',
                  'Booking.com': 'Booking.com', 'booking.com': 'Booking.com',
                  'Expedia': 'Expedia', 'expedia': 'Expedia',
                  'Walk-in': 'Walk-in', 'walk_in': 'Walk-in', 'walk-in': 'Walk-in',
                  'OTA': 'OTA',
                };
                const rawSource = b.bookingSource || b.booking_source || 'Direct';
                return sourceMap[rawSource] || rawSource;
              })(),
            amount: totalPrice,
            amountPaid: amountPaid,
            balance: balance,
            paymentStatus: b.payment_status || 'pending',
            specialRequests: guest?.specialRequests || b.special_requests || '',
            createdAt: b.createdAt || b.created_at || new Date().toISOString(),
            createdBy: 'System',
            payments: depositAmount > 0 ? [{
              id: `PAY-${b.id || Date.now()}`,
              date: b.createdAt || b.created_at || new Date().toISOString(),
              amount: depositAmount,
              method: 'Card',
              status: 'completed'
            }] : [],
            activityLog: [{
              date: b.createdAt || b.created_at || new Date().toISOString(),
              action: 'Booking created',
              user: 'System'
            }]
          };
        });

        setBookings(transformedBookings);
      } else {
        console.log('[CBS] Refresh: API returned no bookings, using sample data');
        setBookings([...sampleBookings]);
      }
    } catch (err) {
      console.error('[CBSContext] Error refreshing bookings:', err);
      setBookings([...sampleBookings]);
    }
  }, []);

  // Refresh rate plans from API
  const refreshRatePlans = useCallback(async () => {
    try {
      const token = localStorage.getItem('glimmora_access_token');
      if (!token) return;

      const ratePlansResponse = await apiClient.get('/api/v1/rates/plans');
      // Handle wrapped response format: { success: true, data: [...] }
      const apiRatePlans = ratePlansResponse.data?.data || ratePlansResponse.data || [];

      if (Array.isArray(apiRatePlans) && apiRatePlans.length > 0) {
        const transformedPlans = apiRatePlans.map((p: any) => ({
          id: p.id?.toString() || `RP-${Date.now()}`,
          name: p.code || p.name || 'Unknown',
          fullName: p.name || p.code || 'Unknown',
          description: p.description || '',
          isActive: p.is_active ?? true,
          mealPlan: p.meal_plan || 'Room Only',
          commission: 0,
          channels: ['Direct', 'OTA'],
          discountType: p.discount_type || 'percentage',
          discountValue: p.discount_value || 0,
          basePrice: { default: p.base_price || 0 },
          minStay: p.min_stay || 1,
          maxStay: p.max_stay || 30,
          ctaEnabled: p.cta_enabled || false,
          ctdEnabled: p.ctd_enabled || false,
          cancellationPolicy: p.cancellation_policy || 'Standard cancellation policy applies.',
          linkedRoomTypes: p.linked_room_types || [],
          priceRules: [],
          updatedAt: p.updated_at || new Date().toISOString(),
        }));
        setRatePlans(transformedPlans);
      } else {
        setRatePlans([]);
      }
    } catch (err) {
      console.error('[CBSContext] Error refreshing rate plans:', err);
    }
  }, []);

  // ============ BOOKING FUNCTIONS ============

  const createBooking = useCallback(async (bookingData) => {
    try {
      // Try to create booking via API
      const apiPayload = {
        roomId: bookingData.roomType?.toLowerCase().replace(/\s+/g, '-') || 'standard',
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: {
          adults: bookingData.adults || 1,
          children: bookingData.children || 0,
          infants: 0
        },
        guestInfo: {
          firstName: bookingData.guestName?.split(' ')[0] || 'Guest',
          lastName: bookingData.guestName?.split(' ').slice(1).join(' ') || '',
          email: bookingData.guestEmail || '',
          phone: bookingData.guestPhone || '',
          country: 'US',
          specialRequests: bookingData.specialRequests || ''
        }
      };

      const response = await apiClient.post('/api/v1/bookings', apiPayload);

      if (response.data) {
        // Transform API response to local format
        const apiBooking = response.data;
        const guest = apiBooking.guestInfo;
        const guestName = `${guest?.firstName || ''} ${guest?.lastName || ''}`.trim() || 'Guest';

        const newBooking = {
          id: apiBooking.bookingNumber || apiBooking.id,
          guestId: apiBooking.guest_id || apiBooking.guestId || null,
          guestName: guestName,
          guestEmail: guest?.email || '',
          guestPhone: guest?.phone || '',
          isVip: bookingData.isVip || false,
          checkIn: apiBooking.checkIn,
          checkOut: apiBooking.checkOut,
          nights: apiBooking.nights || 1,
          roomType: apiBooking.room?.name || bookingData.roomType || 'Standard',
          roomNumber: apiBooking.room?.number || bookingData.roomNumber || null,
          ratePlan: bookingData.ratePlan || 'BAR',
          adults: (apiBooking.guests?.adults || 1),
          children: (apiBooking.guests?.children || 0),
          status: 'CONFIRMED',
          source: bookingData.source || 'Direct',
          amount: apiBooking.totalPrice || bookingData.amount || 0,
          amountPaid: 0,
          balance: apiBooking.totalPrice || bookingData.amount || 0,
          specialRequests: guest?.specialRequests || '',
          createdAt: apiBooking.createdAt || new Date().toISOString(),
          createdBy: bookingData.createdBy || 'System',
          payments: [],
          activityLog: [
            {
              date: new Date().toISOString().split('T')[0],
              action: 'Booking created',
              user: bookingData.createdBy || 'System'
            }
          ]
        };

        setBookings(prev => [...prev, newBooking]);

        // Update availability if room is assigned
        if (newBooking.roomNumber) {
          updateAvailabilityForBooking(newBooking.checkIn, newBooking.checkOut, newBooking.roomType, -1);
        }

        return newBooking;
      }
    } catch (error) {
      console.error('Failed to create booking via API, creating locally:', error);

      // Fallback: Create booking locally
      const newBooking = {
        ...bookingData,
        id: `CBS-${String(bookings.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString().split('T')[0],
        payments: [],
        activityLog: [
          {
            date: new Date().toISOString().split('T')[0],
            action: 'Booking created',
            user: bookingData.createdBy || 'System'
          }
        ]
      };

      setBookings(prev => [...prev, newBooking]);

      // Update availability if room is assigned
      if (newBooking.roomNumber) {
        updateAvailabilityForBooking(newBooking.checkIn, newBooking.checkOut, newBooking.roomType, -1);
      }

      return newBooking;
    }
  }, [bookings]);

  const updateBooking = useCallback((bookingId, updates) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        const updatedBooking = {
          ...booking,
          ...updates,
          activityLog: [
            ...booking.activityLog,
            {
              date: new Date().toISOString().split('T')[0],
              action: `Booking updated: ${Object.keys(updates).join(', ')}`,
              user: updates.updatedBy || 'System'
            }
          ]
        };
        return updatedBooking;
      }
      return booking;
    }));
  }, []);

  const cancelBooking = useCallback((bookingId, reason = 'Cancelled by user') => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        // Release room if assigned
        if (booking.roomNumber) {
          updateAvailabilityForBooking(booking.checkIn, booking.checkOut, booking.roomType, 1);
        }

        return {
          ...booking,
          status: 'CANCELLED',
          activityLog: [
            ...booking.activityLog,
            {
              date: new Date().toISOString().split('T')[0],
              action: `Booking cancelled: ${reason}`,
              user: 'System'
            }
          ]
        };
      }
      return booking;
    }));
  }, []);

  const updateBookingStatus = useCallback((bookingId, newStatus) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        return {
          ...booking,
          status: newStatus,
          activityLog: [
            ...booking.activityLog,
            {
              date: new Date().toISOString().split('T')[0],
              action: `Status changed to ${statusConfig[newStatus]?.label || newStatus}`,
              user: 'Front Desk'
            }
          ]
        };
      }
      return booking;
    }));
  }, []);

  const addPayment = useCallback((bookingId, paymentData) => {
    setBookings(prev => prev.map(booking => {
      if (booking.id === bookingId) {
        const payment = {
          ...paymentData,
          id: `PAY-${String(Date.now()).slice(-6)}`,
          date: new Date().toISOString().split('T')[0],
          status: 'completed'
        };

        const newAmountPaid = booking.amountPaid + payment.amount;
        const newBalance = booking.amount - newAmountPaid;

        return {
          ...booking,
          amountPaid: newAmountPaid,
          balance: newBalance,
          payments: [...booking.payments, payment],
          activityLog: [
            ...booking.activityLog,
            {
              date: new Date().toISOString().split('T')[0],
              action: `Payment of $${payment.amount} received via ${payment.method}`,
              user: 'Accounts'
            }
          ]
        };
      }
      return booking;
    }));
  }, []);

  // ============ ROOM ASSIGNMENT FUNCTIONS ============

  const assignRoom = useCallback(async (bookingId, roomNumber) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return { success: false, error: 'Booking not found' };

    // Check if room is available - first try API rooms, then fall back to sample data
    let room = rooms.find(r => r.roomNumber === roomNumber);
    if (!room) {
      room = roomsData.find(r => r.roomNumber === roomNumber);
    }
    if (!room) return { success: false, error: 'Room not found' };

    // Check for conflicts — warn but let backend decide (backend is authoritative)
    const safeDateStr = (d) => {
      if (!d) return d;
      return typeof d === 'string' && !d.includes('T') ? d + 'T12:00:00' : d;
    };
    const conflictingBooking = bookings.find(b =>
      b.id !== bookingId &&
      b.roomNumber === roomNumber &&
      b.status !== 'CANCELLED' &&
      b.status !== 'CHECKED-OUT' &&
      new Date(safeDateStr(b.checkIn)) < new Date(safeDateStr(booking.checkOut)) &&
      new Date(safeDateStr(b.checkOut)) > new Date(safeDateStr(booking.checkIn))
    );

    if (conflictingBooking) {
      console.warn(`[CBS] Local conflict detected for room ${roomNumber} with booking ${conflictingBooking.id}, but proceeding — backend is authoritative.`);
    }

    // Call backend API to update the booking with the room
    // Use booking.dbId (the original database ID) for API call
    const bookingDbId = booking.dbId || booking.id;
    const roomDbId = room.id;

    try {
      // Call the booking update API with roomId
      await apiClient.patch(`/api/v1/bookings/${bookingDbId}`, {
        roomId: String(roomDbId)
      });

      // If previous room was assigned, release it
      if (booking.roomNumber) {
        updateAvailabilityForBooking(booking.checkIn, booking.checkOut, booking.roomType, 1);
      }

      // Update local state on success
      setBookings(prev => prev.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            roomNumber,
            roomType: room.type,
            activityLog: [
              ...(b.activityLog || []),
              {
                date: new Date().toISOString().split('T')[0],
                action: `Room ${roomNumber} assigned`,
                user: 'Front Desk'
              }
            ]
          };
        }
        return b;
      }));

      // Update availability
      updateAvailabilityForBooking(booking.checkIn, booking.checkOut, room.type, -1);

      return { success: true };
    } catch (err: any) {
      console.error('[CBS] Error assigning room via API:', err);
      const errorMessage = err?.response?.data?.detail || err?.message || 'Failed to assign room';
      return { success: false, error: errorMessage };
    }
  }, [bookings, rooms]);

  const unassignRoom = useCallback((bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || !booking.roomNumber) return { success: false, error: 'No room assigned' };

    // Release the room
    updateAvailabilityForBooking(booking.checkIn, booking.checkOut, booking.roomType, 1);

    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          roomNumber: null,
          activityLog: [
            ...b.activityLog,
            {
              date: new Date().toISOString().split('T')[0],
              action: 'Room unassigned',
              user: 'Front Desk'
            }
          ]
        };
      }
      return b;
    }));

    return { success: true };
  }, [bookings]);

  // ============ AVAILABILITY FUNCTIONS ============

  const updateAvailabilityForBooking = useCallback((checkIn, checkOut, roomType, delta) => {
    setAvailability(prev => {
      const updated = { ...prev };
      const start = new Date(checkIn);
      const end = new Date(checkOut);

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (updated[dateStr] && updated[dateStr][roomType]) {
          const current = updated[dateStr][roomType];
          updated[dateStr] = {
            ...updated[dateStr],
            [roomType]: {
              ...current,
              available: Math.max(0, current.available + delta),
              sold: Math.max(0, current.sold - delta)
            }
          };
        }
      }

      return updated;
    });
  }, []);

  const updateAvailability = useCallback((date, roomType, updates) => {
    setAvailability(prev => {
      if (!prev[date] || !prev[date][roomType]) return prev;

      return {
        ...prev,
        [date]: {
          ...prev[date],
          [roomType]: {
            ...prev[date][roomType],
            ...updates
          }
        }
      };
    });
  }, []);

  const getAvailableRooms = useCallback((checkIn, checkOut, roomType = null) => {
    // Use API rooms if available, otherwise fall back to sample data
    const roomSource = rooms.length > 0 ? rooms : roomsData;

    const availableRooms = roomSource.filter(room => {
      // Filter by room type if specified
      if (roomType && room.type !== roomType) return false;

      // Check if room is out of service
      if (room.status === 'out_of_service') return false;

      // Check for conflicting bookings
      const hasConflict = bookings.some(booking =>
        booking.roomNumber === room.roomNumber &&
        booking.status !== 'CANCELLED' &&
        booking.status !== 'CHECKED-OUT' &&
        new Date(booking.checkIn) < new Date(checkOut) &&
        new Date(booking.checkOut) > new Date(checkIn)
      );

      return !hasConflict;
    });

    return availableRooms.map(room => {
      const availCheck = checkAvailability(checkIn, checkOut, room.type, 1);
      return {
        ...room,
        pricePerNight: availCheck.averageRate || room.price,
        totalPrice: availCheck.totalRate || room.price,
        cleaningStatus: room.cleaning
      };
    });
  }, [bookings, rooms]);

  // ============ RATE PLAN FUNCTIONS ============

  const createRatePlan = useCallback(async (newPlanData) => {
    const newPlan = {
      id: `RP-${String(ratePlans.length + 1).padStart(3, '0')}`,
      name: newPlanData.name,
      fullName: newPlanData.name,
      description: newPlanData.description || '',
      isActive: newPlanData.status === 'active',
      mealPlan: newPlanData.mealPlan || 'Room Only',
      commission: 0,
      channels: ['Direct', 'OTA'],
      // Convert linked rooms to base prices
      basePrice: newPlanData.linkedRooms.reduce((acc, roomId) => {
        const roomMap = {
          'rt1': 'Minimalist Studio',
          'rt2': 'Coastal Retreat',
          'rt3': 'Urban Oasis',
          'rt4': 'Sunset Vista',
          'rt5': 'Pacific Suite',
          'rt6': 'Wellness Suite',
          'rt7': 'Family Sanctuary',
          'rt8': 'Oceanfront Penthouse',
        };
        const roomName = roomMap[roomId] || roomId;
        // Default base prices based on room type
        const defaultPrices = {
          'Minimalist Studio': 150,
          'Coastal Retreat': 199,
          'Urban Oasis': 245,
          'Sunset Vista': 315,
          'Pacific Suite': 385,
          'Wellness Suite': 425,
          'Family Sanctuary': 485,
          'Oceanfront Penthouse': 750,
        };
        acc[roomName] = newPlanData.pricing?.base || defaultPrices[roomName] || 200;
        return acc;
      }, {}),
      minStay: newPlanData.restrictions?.minLos || 1,
      maxStay: newPlanData.restrictions?.maxLos || 30,
      ctaEnabled: newPlanData.restrictions?.cta || false,
      ctdEnabled: newPlanData.restrictions?.ctd || false,
      cancellationPolicy: newPlanData.restrictions?.cancellationPolicy || 'Standard cancellation policy applies.',
      priceRules: newPlanData.pricing?.method === 'derived' || newPlanData.pricing?.method === 'percent'
        ? [{
          type: 'flat',
          adjustment: parseFloat(newPlanData.pricing?.adjustmentValue) || 0,
          description: `${newPlanData.pricing?.adjustmentValue || 0}% ${newPlanData.pricing?.method === 'derived' ? 'vs BAR' : 'adjustment'}`
        }]
        : [],
      linkedRooms: newPlanData.linkedRooms || [],
      pricing: newPlanData.pricing || { method: 'flat', base: 0, adjustmentValue: 0, adjustmentType: 'percentage' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString().split('T')[0],
    };

    // Map pricing method to discount fields for API
    let discountType = 'percentage';
    let discountValue = 0;

    if (newPlanData.pricing) {
      const pricingMethod = newPlanData.pricing.method;
      if (pricingMethod === 'percentage' || pricingMethod === 'percent' || pricingMethod === 'derived') {
        // Percentage discount (e.g., 10 means 10% off room price)
        discountType = 'percentage';
        discountValue = Math.abs(parseFloat(newPlanData.pricing.adjustmentValue) || 0);
      } else if (pricingMethod === 'flat') {
        // Flat discount - deduct amount from room price (e.g., ₹500 off)
        discountType = 'flat';
        discountValue = Math.abs(parseFloat(newPlanData.pricing.adjustmentValue) || 0);
      } else if (pricingMethod === 'fixed') {
        // Fixed price per night regardless of room type
        discountType = 'fixed';
        discountValue = parseFloat(newPlanData.pricing.base) || 0;
      }
    }

    // Call API via CMS store and then refresh local state
    if (cmsRatePlans?.addRatePlan) {
      try {
        await cmsRatePlans.addRatePlan({
          name: newPlan.name,
          fullName: newPlan.fullName,
          description: newPlan.description,
          status: newPlan.isActive ? 'Active' : 'Inactive',
          isActive: newPlan.isActive,
          mealPlan: newPlan.mealPlan,
          commission: newPlan.commission,
          channels: newPlan.channels,
          discountType: discountType,
          discountValue: discountValue,
          baseRates: newPlan.basePrice,
          derivedRules: newPlan.priceRules,
          restrictions: {
            minStay: newPlan.minStay,
            maxStay: newPlan.maxStay,
            CTA: newPlan.ctaEnabled,
            CTD: newPlan.ctdEnabled,
            advanceBooking: newPlanData.restrictions?.sameDay ? null : 1,
            closedDates: [],
          },
          calendarRates: {},
          cancellationPolicy: newPlan.cancellationPolicy,
          paymentTerms: 'Standard payment terms apply',
          linkedRoomTypes: newPlanData.linkedRooms || [],
        });
        // Refresh rate plans from API to get the server-generated data
        await refreshRatePlans();
      } catch (err) {
        console.error('[CBSContext] Error creating rate plan:', err);
        // Fallback: add locally if API fails
        setRatePlans(prev => [...prev, newPlan]);
      }
    } else {
      // No CMS store available, just add locally
      setRatePlans(prev => [...prev, newPlan]);
    }

    return newPlan;
  }, [ratePlans, cmsRatePlans, refreshRatePlans]);

  const updateRatePlan = useCallback((ratePlanId, updates) => {
    setRatePlans(prev => prev.map(plan => {
      if (plan.id === ratePlanId) {
        return {
          ...plan,
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return plan;
    }));
  }, []);

  const toggleRatePlanStatus = useCallback((ratePlanId) => {
    setRatePlans(prev => prev.map(plan => {
      if (plan.id === ratePlanId) {
        return {
          ...plan,
          isActive: !plan.isActive,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return plan;
    }));
  }, []);

  const getRateForBooking = useCallback((roomType, ratePlanName, checkIn, checkOut) => {
    const ratePlan = ratePlans.find(rp => rp.name === ratePlanName);
    if (!ratePlan) return null;

    const basePrice = ratePlan.basePrice[roomType] || 0;
    let totalRate = 0;
    let nights = 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      let dayRate = basePrice;
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;

      // Apply price rules
      ratePlan.priceRules.forEach(rule => {
        if (rule.type === 'weekend' && isWeekend) {
          dayRate *= (1 + rule.adjustment / 100);
        }
        if (rule.type === 'flat') {
          dayRate *= (1 + rule.adjustment / 100);
        }
      });

      totalRate += dayRate;
      nights++;
    }

    return {
      totalRate: Math.round(totalRate),
      averageRate: Math.round(totalRate / nights),
      nights
    };
  }, [ratePlans]);

  // ============ PROMOTION FUNCTIONS ============

  /**
   * Sync promotion to OTA and Direct channels (simulated)
   * In production, this would call Channel Manager API endpoints
   */
  const syncPromotionToChannels = useCallback((promotion) => {
    const channels = promotion.channels || [];
    const otaChannels = channels.filter(c => ['Booking.com', 'Expedia', 'Agoda'].includes(c));
    const directChannels = channels.filter(c => ['Website', 'Mobile App', 'Call Centre'].includes(c));

    console.log('📡 CHANNEL MANAGER SYNC INITIATED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Promotion: ${promotion.name}`);
    console.log(`ID: ${promotion.id}`);
    console.log(`Discount: ${JSON.stringify(promotion.discount)}`);
    console.log('');

    if (otaChannels.length > 0) {
      console.log('🌐 OTA Channels:');
      otaChannels.forEach(channel => {
        console.log(`  ✓ ${channel} - Sync queued`);
      });
    }

    if (directChannels.length > 0) {
      console.log('🏨 Direct Channels:');
      directChannels.forEach(channel => {
        console.log(`  ✓ ${channel} - Sync queued`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Promotion sync completed');

    return {
      success: true,
      syncedChannels: channels,
      timestamp: new Date().toISOString(),
    };
  }, []);

  /**
   * Create a new promotion with full CMS Engine integration
   * Supports: percentage, flat, free_night, derived discount types
   */
  const createPromotion = useCallback((promoData) => {
    // Map room IDs to room names for display
    const roomMap = {
      'rt1': 'Minimalist Studio',
      'rt2': 'Coastal Retreat',
      'rt3': 'Urban Oasis',
      'rt4': 'Sunset Vista',
      'rt5': 'Pacific Suite',
      'rt6': 'Wellness Suite',
      'rt7': 'Family Sanctuary',
      'rt8': 'Oceanfront Penthouse',
    };

    const eligibleRoomNames = (promoData.eligibleRooms || []).map(id => roomMap[id] || id);

    // Calculate discount value and type for legacy compatibility
    let discountValue = 0;
    let discountType = promoData.discount?.type || 'percentage';

    switch (discountType) {
      case 'percentage':
        discountValue = promoData.discount?.value || 0;
        break;
      case 'flat':
        discountValue = promoData.discount?.value || 0;
        discountType = 'fixed';
        break;
      case 'free_night':
        discountValue = 1; // Free nights count
        break;
      case 'derived':
        discountValue = promoData.discount?.value || 0;
        discountType = 'percentage';
        break;
    }

    const newPromotion = {
      id: `PROMO-${String(promotions.length + 1).padStart(3, '0')}-${Date.now().toString(36).toUpperCase()}`,
      title: promoData.name,
      code: promoData.name.toUpperCase().replace(/\s+/g, '').substring(0, 10),
      description: promoData.descriptionShort || promoData.descriptionLong || '',
      descriptionLong: promoData.descriptionLong || '',
      discountType: discountType,
      discountValue: discountValue,
      isActive: promoData.status === 'active',
      validFrom: promoData.stayPeriod?.start || new Date().toISOString().split('T')[0],
      validTo: promoData.stayPeriod?.end || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bookingWindow: promoData.bookingWindow || null,
      minNights: promoData.restrictions?.minLos || 1,
      maxNights: promoData.restrictions?.maxLos || null,
      minBookingAmount: null,
      applicableRoomTypes: eligibleRoomNames,
      applicableRatePlans: ['BAR'],
      applicableChannels: promoData.channels || ['Website'],
      channels: promoData.channels || ['Website'],
      usageLimit: null,
      usageCount: 0,
      stackable: promoData.restrictions?.stackable || false,
      blackoutDates: promoData.restrictions?.blackoutDates || [],
      termsAndConditions: promoData.descriptionLong || '',
      type: promoData.type || 'Early Bird',
      discount: promoData.discount || { type: 'percentage', value: 10 },
      stayPeriod: promoData.stayPeriod || null,
      restrictions: promoData.restrictions || {
        minLos: 1,
        maxLos: 30,
        cta: false,
        ctd: false,
        blackoutDates: [],
        stackable: false,
      },
      eligibleRooms: promoData.eligibleRooms || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin',
    };

    setPromotions(prev => {
      const updated = [...prev, newPromotion];
      return updated;
    });

    // Sync to Channel Manager
    syncPromotionToChannels(newPromotion);

    // Also add to CMS Zustand store if available
    if (cmsPromotions?.addPromotion) {
      cmsPromotions.addPromotion({
        name: newPromotion.title,
        code: newPromotion.code,
        type: newPromotion.type,
        value: newPromotion.discountValue,
        description: newPromotion.description,
        status: newPromotion.isActive ? 'Active' : 'Inactive',
        isActive: newPromotion.isActive,
        startDate: newPromotion.validFrom,
        endDate: newPromotion.validTo,
        minStay: newPromotion.minNights,
        maxUsage: newPromotion.usageLimit,
        currentUsage: 0,
        applicableRoomTypes: newPromotion.applicableRoomTypes,
        applicableRatePlans: newPromotion.applicableRatePlans,
        stackable: newPromotion.stackable,
        blackoutDates: newPromotion.blackoutDates,
        terms: newPromotion.termsAndConditions,
      });
    }

    return newPromotion;
  }, [promotions, cmsPromotions, syncPromotionToChannels]);

  const updatePromotion = useCallback((promotionId, updates) => {
    setPromotions(prev => prev.map(promo => {
      if (promo.id === promotionId) {
        const updated = { ...promo, ...updates, updatedAt: new Date().toISOString() };
        // Re-sync to channels if promotion is updated
        if (updated.isActive) {
          syncPromotionToChannels(updated);
        }
        return updated;
      }
      return promo;
    }));
  }, [syncPromotionToChannels]);

  const togglePromotionStatus = useCallback((promotionId) => {
    setPromotions(prev => prev.map(promo => {
      if (promo.id === promotionId) {
        return { ...promo, isActive: !promo.isActive };
      }
      return promo;
    }));
  }, []);

  // ============ PROMOTION TYPE FUNCTIONS ============

  const addPromotionType = useCallback((newType: { value: string; label: string }) => {
    // Check if type already exists
    const exists = promotionTypes.some(t => t.value.toLowerCase() === newType.value.toLowerCase());
    if (exists) {
      return { success: false, error: 'Promotion type already exists' };
    }
    setPromotionTypes(prev => [...prev, newType]);
    return { success: true };
  }, [promotionTypes]);

  const updatePromotionType = useCallback((oldValue: string, newType: { value: string; label: string }) => {
    // Check if new value conflicts with existing (excluding the one being updated)
    const exists = promotionTypes.some(t =>
      t.value.toLowerCase() === newType.value.toLowerCase() &&
      t.value.toLowerCase() !== oldValue.toLowerCase()
    );
    if (exists) {
      return { success: false, error: 'Promotion type already exists' };
    }
    setPromotionTypes(prev => prev.map(t =>
      t.value === oldValue ? newType : t
    ));
    return { success: true };
  }, [promotionTypes]);

  const deletePromotionType = useCallback((value: string) => {
    // Don't allow deletion if there are only 1-2 types left
    if (promotionTypes.length <= 2) {
      return { success: false, error: 'Must have at least 2 promotion types' };
    }
    setPromotionTypes(prev => prev.filter(t => t.value !== value));
    return { success: true };
  }, [promotionTypes]);

  const resetPromotionTypes = useCallback(() => {
    setPromotionTypes(DEFAULT_PROMOTION_TYPES);
  }, []);

  const applyPromotion = useCallback((promoCode, bookingDetails) => {
    const promo = promotions.find(p =>
      p.code === promoCode &&
      p.isActive &&
      new Date(p.validFrom) <= new Date() &&
      new Date(p.validTo) >= new Date()
    );

    if (!promo) return { success: false, error: 'Invalid or expired promo code' };

    // Check usage limit
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return { success: false, error: 'Promo code usage limit reached' };
    }

    // Check minimum nights
    if (promo.minNights && bookingDetails.nights < promo.minNights) {
      return { success: false, error: `Minimum stay of ${promo.minNights} nights required` };
    }

    // Check minimum amount
    if (promo.minBookingAmount && bookingDetails.amount < promo.minBookingAmount) {
      return { success: false, error: `Minimum booking amount of $${promo.minBookingAmount} required` };
    }

    // Check room type
    if (promo.applicableRoomTypes && !promo.applicableRoomTypes.includes(bookingDetails.roomType)) {
      return { success: false, error: 'Promo not applicable to selected room type' };
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (bookingDetails.amount * promo.discountValue) / 100;
    } else if (promo.discountType === 'fixed') {
      discount = promo.discountValue;
    } else if (promo.discountType === 'free_night' && bookingDetails.nights >= 4) {
      discount = bookingDetails.amount / bookingDetails.nights;
    }

    // Increment usage count
    setPromotions(prev => prev.map(p => {
      if (p.id === promo.id) {
        return { ...p, usageCount: p.usageCount + 1 };
      }
      return p;
    }));

    return {
      success: true,
      discount: Math.round(discount),
      promoName: promo.title,
      newAmount: Math.round(bookingDetails.amount - discount)
    };
  }, [promotions]);

  // ============ AI INSIGHTS ============

  const getAIInsights = useCallback((bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return [];

    const insights = [];

    // Check for overbooking risk
    const sameTypeBookings = bookings.filter(b =>
      b.roomType === booking.roomType &&
      b.status !== 'CANCELLED' &&
      new Date(b.checkIn) < new Date(booking.checkOut) &&
      new Date(b.checkOut) > new Date(booking.checkIn)
    );

    if (sameTypeBookings.length > 3) {
      insights.push({
        type: 'warning',
        message: `Risk of overbooking: ${sameTypeBookings.length} similar reservations for this period`
      });
    }

    // Check for demand surge
    const checkInDate = booking.checkIn;
    if (availability[checkInDate]) {
      const dayAvail = availability[checkInDate][booking.roomType];
      if (dayAvail && dayAvail.available <= 2) {
        insights.push({
          type: 'info',
          message: 'Demand surge on this date - suggested rate +12%'
        });
      }
    }

    // Check for VIP guest
    if (booking.isVip) {
      insights.push({
        type: 'vip',
        message: 'VIP guest - ensure premium amenities are ready'
      });
    }

    // Check for pending payment
    if (booking.balance > 0 && new Date(booking.checkIn) <= new Date()) {
      insights.push({
        type: 'alert',
        message: `Outstanding balance of $${booking.balance} - collect on check-in`
      });
    }

    // Check housekeeping status
    if (booking.roomNumber) {
      // Use API rooms if available, otherwise fall back to sample data
      const roomSource = rooms.length > 0 ? rooms : roomsData;
      const room = roomSource.find(r => r.roomNumber === booking.roomNumber);
      if (room && room.cleaning === 'dirty') {
        insights.push({
          type: 'warning',
          message: 'Housekeeping delay may affect check-in time'
        });
      }
    }

    return insights;
  }, [bookings, availability, rooms]);

  // ============ UTILITY FUNCTIONS ============

  const getBookingById = useCallback((bookingId) => {
    return bookings.find(b => b.id === bookingId);
  }, [bookings]);

  const getBookingsForDate = useCallback((date) => {
    return bookings.filter(b =>
      new Date(b.checkIn) <= new Date(date) &&
      new Date(b.checkOut) > new Date(date) &&
      b.status !== 'CANCELLED'
    );
  }, [bookings]);

  const getBookingsByStatus = useCallback((status) => {
    return bookings.filter(b => b.status === status);
  }, [bookings]);

  const getCalendarData = useCallback((daysCount = 30) => {
    return getCalendarDates(daysCount);
  }, []);

  const resetToSampleData = useCallback(() => {
    setBookings([]);
    setAvailability({}); // Clear availability - it will be fetched from API
    setRatePlans([]); // Rate plans are fetched from API
    setPromotions(samplePromotions);
    localStorage.removeItem(STORAGE_KEY);
    // Refetch from API
    cmsAvailability.refetch();
  }, [cmsAvailability]);

  const value = {
    // State
    bookings,
    availability,
    ratePlans,
    promotions,
    isLoading,

    // Booking functions
    createBooking,
    updateBooking,
    cancelBooking,
    updateBookingStatus,
    addPayment,
    getBookingById,
    getBookingsForDate,
    getBookingsByStatus,
    refreshBookings,

    // Room assignment
    assignRoom,
    unassignRoom,
    getAvailableRooms,

    // Availability
    updateAvailability,
    checkAvailability,

    // Rate plans
    createRatePlan,
    updateRatePlan,
    toggleRatePlanStatus,
    refreshRatePlans,
    getRateForBooking,

    // Promotions
    createPromotion,
    updatePromotion,
    togglePromotionStatus,
    applyPromotion,
    syncPromotionToChannels,

    // Promotion Types
    promotionTypes,
    addPromotionType,
    updatePromotionType,
    deletePromotionType,
    resetPromotionTypes,

    // AI & Utilities
    getAIInsights,
    getCalendarData,
    resetToSampleData,

    // CMS Zustand Stores - Enhanced functionality with persistence
    cms: {
      bookings: cmsBookings,
      availability: cmsAvailability,
      ratePlans: cmsRatePlans,
      promotions: cmsPromotions,
      engine: cmsEngine,
    }
  };

  return (
    <CBSContext.Provider value={value}>
      {children}
    </CBSContext.Provider>
  );
}

export function useCBS() {
  const context = useContext(CBSContext);
  if (!context) {
    throw new Error('useCBS must be used within a CBSProvider');
  }
  return context;
}

export default CBSContext;
