import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { filterByTab, filterGuests } from '@/utils/admin/guestFilters';
import { searchGuests } from '@/utils/admin/guestSearch';
import { sortGuests } from '@/utils/admin/guestSort';
import { guestsService, type Guest as ApiGuest, type GuestCreate, type GuestUpdate, type GuestListResponse } from '@/api/services/guests.service';

/**
 * Transform API guest to admin panel format
 */
function transformApiGuest(apiGuest: ApiGuest): any {
  // Determine status for display - check both vip_status and status field
  let displayStatus = 'normal';
  if (apiGuest.status?.toLowerCase() === 'blacklisted') {
    displayStatus = 'blacklisted';
  } else if (apiGuest.vip_status) {
    displayStatus = 'vip';
  }

  // Map emotion - supports: positive, neutral, negative
  let displayEmotion = 'neutral';
  const emotion = apiGuest.emotion || (apiGuest as any).sentiment;
  if (emotion === 'happy' || emotion === 'positive') {
    displayEmotion = 'positive';
  } else if (emotion === 'unhappy' || emotion === 'negative') {
    displayEmotion = 'negative';
  }

  return {
    id: apiGuest.id,
    name: `${apiGuest.first_name || ''} ${apiGuest.last_name || ''}`.trim() || 'Unknown Guest',
    firstName: apiGuest.first_name || '',
    lastName: apiGuest.last_name || '',
    email: apiGuest.email || '',
    phone: apiGuest.phone || '',
    country: apiGuest.country || 'Unknown',
    state: apiGuest.state || '',
    city: apiGuest.city || '',
    address: apiGuest.address || '',
    postalCode: apiGuest.postal_code || '',
    loyaltyPoints: apiGuest.loyalty_points || 0,
    loyaltyTier: apiGuest.loyalty_tier || 'member',
    totalBookings: apiGuest.total_bookings || 0,
    totalStays: apiGuest.total_bookings || 0,
    totalSpent: apiGuest.total_spent || 0,
    totalNights: apiGuest.total_nights || 0,
    memberSince: apiGuest.member_since || new Date().toISOString(),
    lastVisit: apiGuest.last_visit || null,
    // lastStay is required by GuestRow component
    lastStay: apiGuest.last_visit || (apiGuest as any).updated_at || new Date().toISOString(),
    vipStatus: apiGuest.vip_status || false,
    vipLevel: (apiGuest as any).vip_level || 'none',
    // Map status for GuestRow component - supports: vip, normal, review, blacklisted
    status: displayStatus,
    // Map emotion for GuestRow component - supports: positive, neutral, negative
    emotion: displayEmotion,
    notes: [],
    tags: apiGuest.tags || [],
    preferences: apiGuest.preferences || {},
  };
}

/**
 * Master hook for guest state management
 * Implements server-side pagination with client-side filtering/sorting
 * Fetches data from backend API with pagination support
 */
export function useGuests(initialPageSize = 20) {
  // Raw data state - start empty and fetch from API
  const [guests, setGuests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Server-side pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 1,
  });

  // Stats for tab counts
  const [guestStats, setGuestStats] = useState({
    all: 0,
    returning: 0,
    vip: 0,
    blacklisted: 0,
  });

  // Fetch guest stats for tab counts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await guestsService.getStats();
        if (isMounted.current) {
          setGuestStats(stats);
        }
      } catch (err) {
        console.error('Failed to fetch guest stats:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch guests from API with pagination
  const fetchGuests = useCallback(async (page = 1, pageSize = initialPageSize, filterType?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await guestsService.listPaginated({
        page,
        pageSize,
        filter_type: filterType as any,
      });

      if (isMounted.current) {
        const transformedGuests = response.data.map(transformApiGuest);
        setGuests(transformedGuests);
        setPagination({
          page: response.page,
          pageSize: response.pageSize,
          total: response.total,
          totalPages: response.totalPages,
        });
      }
    } catch (err) {
      console.error('Failed to fetch guests from API:', err);
      if (isMounted.current) {
        setError('Failed to load guests. Please check your connection.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [initialPageSize]);

  // Initial fetch
  useEffect(() => {
    isMounted.current = true;
    fetchGuests();
    return () => {
      isMounted.current = false;
    };
  }, [fetchGuests]);

  // Tab state
  const [activeTab, setActiveTab] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    country: 'all',
    emotion: 'all',
    status: 'all',
    vipLevel: 'all',
    lastStayFrom: '',
    lastStayTo: ''
  });

  // Sort state
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filter management functions
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      country: 'all',
      emotion: 'all',
      status: 'all',
      vipLevel: 'all',
      lastStayFrom: '',
      lastStayTo: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.country !== 'all'
      || filters.emotion !== 'all'
      || filters.status !== 'all'
      || filters.vipLevel !== 'all'
      || filters.lastStayFrom !== ''
      || filters.lastStayTo !== '';
  };

  // Sort management
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Guest update function - calls API and updates local state
  const updateGuest = useCallback(async (id: string | number, updates: any) => {
    try {
      // Transform to API format
      const apiUpdates: GuestUpdate = {};
      if (updates.firstName || updates.first_name) apiUpdates.first_name = updates.firstName || updates.first_name;
      if (updates.lastName || updates.last_name) apiUpdates.last_name = updates.lastName || updates.last_name;
      if (updates.email) apiUpdates.email = updates.email;
      if (updates.phone) apiUpdates.phone = updates.phone;
      if (updates.country) apiUpdates.country = updates.country;
      if (updates.state) apiUpdates.state = updates.state;
      if (updates.city) apiUpdates.city = updates.city;
      if (updates.address) apiUpdates.address = updates.address;
      if (updates.postalCode || updates.postal_code) apiUpdates.postal_code = updates.postalCode || updates.postal_code;
      // Handle status updates (e.g., for blacklisting)
      if (updates.status) {
        apiUpdates.status = updates.status;
        // BUG-011 FIX: Case-insensitive VIP check (transform uses lowercase 'vip', config uses 'VIP')
        if (updates.status.toUpperCase() === 'VIP') {
          apiUpdates.vip_status = true;
        } else if (updates.vipStatus === undefined && updates.vip_status === undefined) {
          // If status is changed to something other than VIP and vip_status isn't explicitly set, clear it
          apiUpdates.vip_status = false;
        }
      }
      if (updates.vipStatus !== undefined || updates.vip_status !== undefined) {
        apiUpdates.vip_status = updates.vipStatus !== undefined ? updates.vipStatus : updates.vip_status;
      }
      if (updates.vipLevel !== undefined || updates.vip_level !== undefined) {
        apiUpdates.vip_level = updates.vipLevel || updates.vip_level;
      }
      // Handle emotion/sentiment updates
      if (updates.emotion) apiUpdates.emotion = updates.emotion;
      // Handle tags updates
      if (updates.tags) apiUpdates.tags = updates.tags;

      await guestsService.update(String(id), apiUpdates);

      // Update local state using submitted values directly instead of PATCH response,
      // because PATCH may return partial data and transformApiGuest would set defaults
      // (e.g., totalBookings: 0) that overwrite correct existing values
      setGuests(prev => prev.map(g => {
        if (String(g.id) !== String(id)) return g;
        const firstName = updates.firstName || updates.first_name || g.firstName;
        const lastName = updates.lastName || updates.last_name || g.lastName;
        return {
          ...g,
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim(),
          email: updates.email || g.email,
          phone: updates.phone ?? g.phone,
          country: updates.country || g.country,
          state: 'state' in updates ? updates.state : g.state,
          city: 'city' in updates ? updates.city : g.city,
          address: 'address' in updates ? updates.address : g.address,
          postalCode: updates.postalCode || updates.postal_code || g.postalCode,
          status: updates.status
            ? (updates.status.toUpperCase() === 'VIP' ? 'vip' : updates.status.toLowerCase())
            : g.status,
          vipStatus: updates.vipStatus ?? g.vipStatus,
          vipLevel: updates.vipLevel || g.vipLevel,
          emotion: updates.emotion || g.emotion,
          tags: updates.tags || g.tags,
          preferences: updates.preferences ?? g.preferences,
        };
      }));
    } catch (err) {
      console.error('Failed to update guest via API:', err);
      throw err; // Propagate error
    }
  }, []);

  // Add guest function - calls API and updates local state
  const addGuest = useCallback(async (guestData: any) => {
    try {
      // Transform to API format - ensure firstName/lastName are used
      const apiData: GuestCreate = {
        first_name: guestData.firstName || guestData.first_name || '',
        last_name: guestData.lastName || guestData.last_name || '',
        email: guestData.email,
        phone: guestData.phone,
        country: guestData.country,
        state: guestData.state,
        city: guestData.city,
        address: guestData.address,
        postal_code: guestData.postalCode || guestData.postal_code,
      };

      const newGuest = await guestsService.create(apiData);
      const transformedGuest = transformApiGuest(newGuest);

      // Merge submitted data (tags, status, preferences) that the API response may not include
      const fullGuest = {
        ...transformedGuest,
        status: guestData.status
          ? (guestData.status.toUpperCase() === 'VIP' ? 'vip' : guestData.status.toLowerCase())
          : transformedGuest.status,
        vipStatus: guestData.status?.toUpperCase() === 'VIP' || false,
        vipLevel: guestData.vipLevel || 'none',
        tags: guestData.tags || transformedGuest.tags,
        preferences: guestData.preferences || transformedGuest.preferences,
      };
      setGuests(prev => [fullGuest, ...prev]);
    } catch (err) {
      console.error('Failed to add guest via API:', err);
      throw err; // Propagate error instead of silent fallback
    }
  }, []);

  // Delete guest function - calls API and updates local state
  const deleteGuest = useCallback(async (id: string | number) => {
    try {
      await guestsService.delete(id);
    } catch (err) {
      console.error('Failed to delete guest via API:', err);
    }
    // Update local state regardless
    setGuests(prev => prev.filter(g => String(g.id) !== String(id)));
  }, []);

  // Data processing pipeline (client-side filtering on current page data)
  const processedGuests = useMemo(() => {
    let result = filterByTab(guests, activeTab);
    result = filterGuests(result, filters);
    result = searchGuests(result, searchQuery);
    result = sortGuests(result, sortField, sortDirection);
    return result;
  }, [guests, activeTab, filters, searchQuery, sortField, sortDirection]);

  // Pagination control functions
  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    await fetchGuests(page, pagination.pageSize);
  }, [fetchGuests, pagination.pageSize, pagination.totalPages]);

  const nextPage = useCallback(async () => {
    if (pagination.page < pagination.totalPages) {
      await fetchGuests(pagination.page + 1, pagination.pageSize);
    }
  }, [fetchGuests, pagination.page, pagination.pageSize, pagination.totalPages]);

  const prevPage = useCallback(async () => {
    if (pagination.page > 1) {
      await fetchGuests(pagination.page - 1, pagination.pageSize);
    }
  }, [fetchGuests, pagination.page, pagination.pageSize]);

  const setPageSize = useCallback(async (newPageSize: number) => {
    await fetchGuests(1, newPageSize);
  }, [fetchGuests]);

  const refreshGuests = useCallback(async () => {
    await fetchGuests(pagination.page, pagination.pageSize);
  }, [fetchGuests, pagination.page, pagination.pageSize]);

  return {
    guests: processedGuests,
    rawGuests: guests,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    sortField,
    sortDirection,
    handleSort,
    updateGuest,
    addGuest,
    deleteGuest,
    guestStats,
    // Server-side pagination
    pagination,
    fetchGuests,
    refreshGuests,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}
