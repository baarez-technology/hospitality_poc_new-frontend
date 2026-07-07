/**
 * Channel Manager Context
 * Manages OTA connections, room mappings, rate syncs, restrictions, and sync logs
 * Now fully integrated with backend API
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { channelManagerService } from '../api/services/channel-manager.service';
import { roomTypesService } from '../api/services/roomTypes.service';
import type {
  OTAConnection,
  RoomMapping,
  RateCalendarEntry,
  Restriction,
  ChannelPromotion,
  SyncLog,
  ChannelStats,
  AIInsight,
} from '../api/services/channel-manager.service';
import { useToast } from '../contexts/ToastContext';

/** Toast API type so TypeScript knows success/error are callable (context is createContext(null) otherwise inferred as never) */
type ToastApi = { success: (message: string, options?: object) => void; error: (message: string, options?: object) => void };

const ChannelManagerContext = createContext<any>(null);

const STORAGE_KEY = 'channel_manager_data';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

/** Dummy Channel Manager - always shown in OTA section regardless of backend */
const DUMMY_OTA: OTAConnection = {
  id: 'ota-dummy',
  name: 'Dummy Channel Manager',
  code: 'DUMMY',
  status: 'connected',
  lastSync: new Date().toISOString(),
  nextSync: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  credentials: { username: '', apiKey: '', hotelId: '' },
  syncSettings: {
    autoSync: true,
    syncInterval: 5,
    syncRates: true,
    syncAvailability: true,
    syncRestrictions: true,
  },
  stats: { totalBookings: 0, revenue: 0, avgRating: 0, commission: 0 },
  color: '#7B68EE',
};

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load Channel Manager data:', e);
  }
  return null;
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save Channel Manager data:', e);
  }
}

/** Extract user-friendly message from API error (422 validation, network, etc.). */
function getApiErrorMessage(err: any, fallback: string): string {
  if (!err) return fallback;
  const data = err.response?.data;
  if (data) {
    if (typeof data.error === 'string') return data.error;
    if (typeof data.message === 'string') return data.message;
    if (Array.isArray(data.detail)) {
      const parts = data.detail.map((d: any) => (d.msg ?? d.message ?? JSON.stringify(d)));
      return parts.length ? parts.join('. ') : fallback;
    }
    if (typeof data.detail === 'string') return data.detail;
  }
  const msg = err.message;
  if (typeof msg === 'string' && msg.length > 0) return msg;
  return fallback;
}

export function ChannelManagerProvider({ children }) {
  const location = useLocation();
  const toast = useToast() as { success: (msg: string, opts?: object) => void; error: (msg: string, opts?: object) => void };
  const { success, error: showError } = toast;
  const stored = loadFromStorage();

  // Track if data has been loaded to prevent re-fetching
  const isDataLoadedRef = useRef(false);

  // State - ensure Dummy Channel Manager is in list when restoring from storage
  const [otas, setOTAs] = useState<OTAConnection[]>(() => {
    const list = stored?.otas || [];
    const hasDummy = list.some((o: OTAConnection) => o.code === 'DUMMY' || o.name === 'Dummy Channel Manager');
    return hasDummy ? list : [DUMMY_OTA, ...list];
  });
  const [roomMappings, setRoomMappings] = useState<RoomMapping[]>(stored?.roomMappings || []);
  const [restrictions, setRestrictions] = useState<Restriction[]>(stored?.restrictions || []);
  const [promotions, setPromotions] = useState<ChannelPromotion[]>(stored?.promotions || []);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(stored?.syncLogs || []);
  const [rateCalendar, setRateCalendar] = useState<Record<string, Record<string, RateCalendarEntry>>>(stored?.rateCalendar || {});
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(stored?.channelStats || null);
  const [aiInsights, setAIInsights] = useState<AIInsight[]>(stored?.aiInsights || []);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncingOTAs, setSyncingOTAs] = useState<string[]>([]);
  const [lastGlobalSync, setLastGlobalSync] = useState<string>(new Date().toISOString());

  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ============ DATA FETCHING ============

  const fetchOTAs = useCallback(async () => {
    try {
      const response = await channelManagerService.getOTAs();
      const items = response.items || [];
      const hasDummy = items.some((o: OTAConnection) => o.code === 'DUMMY' || o.name === 'Dummy Channel Manager');
      const list = hasDummy ? items : [DUMMY_OTA, ...items];
      setOTAs(list);
      return list;
    } catch (err: any) {
      console.error('Error fetching OTAs:', err);
      showError(err.response?.data?.error || 'Failed to fetch OTA connections');
      return [];
    }
  }, [showError]);

  const fetchRoomMappings = useCallback(async () => {
    try {
      const response = await channelManagerService.getRoomMappings();
      setRoomMappings(response.items || []);
      return response.items || [];
    } catch (err: any) {
      console.error('Error fetching room mappings:', err);
      showError(err.response?.data?.error || 'Failed to fetch room mappings');
      return [];
    }
  }, [showError]);

  const fetchRestrictions = useCallback(async () => {
    try {
      const response = await channelManagerService.getRestrictions();
      setRestrictions(response.items || []);
      return response.items || [];
    } catch (err: any) {
      console.error('Error fetching restrictions:', err);
      showError(err.response?.data?.error || 'Failed to fetch restrictions');
      return [];
    }
  }, [showError]);

  const fetchPromotions = useCallback(async () => {
    try {
      const response = await channelManagerService.getPromotions();
      setPromotions(response.items || []);
      return response.items || [];
    } catch (err: any) {
      console.error('Error fetching promotions:', err);
      showError(err.response?.data?.error || 'Failed to fetch promotions');
      return [];
    }
  }, [showError]);

  const fetchSyncLogs = useCallback(async (filters?: any) => {
    try {
      const response = await channelManagerService.getSyncLogs(filters);
      setSyncLogs(response.items || []);
      // Return full response including total, totalPages for pagination/stats
      return {
        items: response.items || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.pageSize || 10,
        totalPages: response.totalPages || 1,
      };
    } catch (err: any) {
      console.error('Error fetching sync logs:', err);
      showError(err.response?.data?.error || 'Failed to fetch sync logs');
      return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 1 };
    }
  }, [showError]);

  const fetchRateCalendar = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      const today = new Date();
      const defaultStart = startDate || today.toISOString().split('T')[0];
      const defaultEnd = endDate || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await channelManagerService.getRateCalendar({
        startDate: defaultStart,
        endDate: defaultEnd,
      });
      setRateCalendar(response.calendar || {});
      return response.calendar || {};
    } catch (err: any) {
      console.error('Error fetching rate calendar:', err);
      showError(err.response?.data?.error || 'Failed to fetch rate calendar');
      return {};
    }
  }, [showError]);

  const fetchChannelStats = useCallback(async () => {
    try {
      const stats = await channelManagerService.getChannelStats();
      setChannelStats(stats);
      return stats;
    } catch (err: any) {
      console.error('Error fetching channel stats:', err);
      showError(err.response?.data?.error || 'Failed to fetch channel statistics');
      return null;
    }
  }, [showError]);

  const fetchAIInsights = useCallback(async () => {
    try {
      const response = await channelManagerService.getAIInsights();
      setAIInsights(response.insights || []);
      return response.insights || [];
    } catch (err: any) {
      console.error('Error fetching AI insights:', err);
      showError(err.response?.data?.error || 'Failed to fetch AI insights');
      return [];
    }
  }, [showError]);

  const fetchRoomTypes = useCallback(async () => {
    try {
      const data = await roomTypesService.getRoomTypes();
      // Transform API data to match expected format
      const transformed = data.map((rt: any) => ({
        id: rt.id || rt.slug,
        roomTypeId: rt.roomTypeId != null ? rt.roomTypeId : (typeof rt.id === 'number' || (typeof rt.id === 'string' && /^\d+$/.test(rt.id)) ? Number(rt.id) : undefined),
        slug: rt.slug,
        name: rt.name,
        baseOccupancy: rt.maxGuests || 2,
        maxOccupancy: rt.maxGuests || 2,
        basePrice: rt.price || rt.base_price || 0,
        totalRooms: rt.availableRoomCount || rt.total_rooms || 0,
      }));
      setRoomTypes(transformed);
      return transformed;
    } catch (err: any) {
      console.error('Error fetching room types:', err);
      showError(err.response?.data?.error || 'Failed to fetch room types');
      return [];
    }
  }, [showError]);

  // Check if on channel-manager page
  const isChannelManagerPage = location.pathname.includes('/channel-manager');

  // Initial data load - only when on channel-manager pages
  useEffect(() => {
    // Skip if not on channel-manager page or data already loaded
    if (!isChannelManagerPage || isDataLoadedRef.current) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchOTAs(),
          fetchRoomMappings(),
          fetchRestrictions(),
          fetchPromotions(),
          fetchSyncLogs({ pageSize: 50 }),
          fetchRateCalendar(),
          fetchChannelStats(),
          fetchAIInsights(),
          fetchRoomTypes(),
        ]);
        isDataLoadedRef.current = true;
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isChannelManagerPage]); // Re-check when route changes

  // Persist to localStorage (as cache/fallback)
  useEffect(() => {
    saveToStorage({
      otas,
      roomMappings,
      restrictions,
      promotions,
      syncLogs: syncLogs.slice(0, 100), // Only cache last 100 logs
      rateCalendar,
      channelStats,
      aiInsights,
    });
  }, [otas, roomMappings, restrictions, promotions, syncLogs, rateCalendar, channelStats, aiInsights]);

  // ============ OTA FUNCTIONS ============

  // Define addSyncLog first so it can be used in other callbacks
  const addSyncLog = useCallback((otaCode: string, otaName: string, action: string, status: string, message: string, details: any = {}) => {
    const now = Date.now();
    const dedupeWindow = 5000; // 5 seconds deduplication window

    setSyncLogs(prev => {
      // Check for duplicate within the deduplication window
      const isDuplicate = prev.some(log => {
        const logTime = new Date(log.timestamp).getTime();
        return (
          log.otaCode === otaCode &&
          log.action === action &&
          log.message === message &&
          now - logTime < dedupeWindow
        );
      });

      if (isDuplicate) {
        return prev; // Skip duplicate log
      }

      // ID and timestamp basis: unique id from timestamp + short random suffix
      const newLog: SyncLog = {
        id: `log-${now}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date(now).toISOString(),
        otaCode,
        otaName,
        action: action as any,
        status: status as any,
        message,
        details,
      };

      return [newLog, ...prev].slice(0, 100); // Keep last 100 logs
    });
  }, []);

  const connectOTA = useCallback(async (otaData: any) => {
    try {
      const newOTA = await channelManagerService.createOTA(otaData);
      setOTAs(prev => [...prev, newOTA]);
      addSyncLog(newOTA.code, newOTA.name, 'connection', 'success', `Connected to ${newOTA.name} successfully`);
      success(`Successfully connected to ${newOTA.name}`);
      return newOTA;
    } catch (err: any) {
      console.error('Error connecting OTA:', err);
      showError(err.response?.data?.error || 'Failed to connect OTA');
      throw err;
    }
  }, [success, showError, addSyncLog]);

  const disconnectOTA = useCallback(async (otaId: string) => {
    try {
      // Use updateOTA to set status instead of deleteOTA which removes the record.
      // Preserving the record lets reconnect and subsequent syncs work correctly.
      await channelManagerService.updateOTA(otaId, { status: 'disconnected' });
      const ota = otas.find(o => o.id === otaId);
      if (ota) {
        addSyncLog(ota.code, ota.name, 'connection', 'success', `Disconnected from ${ota.name}`);
        setOTAs(prev => prev.map(o => o.id === otaId ? { ...o, status: 'disconnected' as const } : o));
        success(`Disconnected from ${ota.name}`);
      }
    } catch (err: any) {
      console.error('Error disconnecting OTA:', err);
      showError(err.response?.data?.error || 'Failed to disconnect OTA');
      throw err;
    }
  }, [otas, success, showError, addSyncLog]);

  const reconnectOTA = useCallback(async (otaId: string) => {
    try {
      const ota = otas.find(o => o.id === otaId);
      if (!ota) return;

      const updated = await channelManagerService.updateOTA(otaId, {
        status: 'connected',
        errorMessage: undefined,
      });

      // Defensive merge: keep existing OTA fields, overlay API response, force connected status
      // The API response may not echo back the updated status correctly
      const reconnectedOTA = {
        ...ota,
        ...(updated && typeof updated === 'object' && updated.id ? updated : {}),
        status: 'connected' as const,
        errorMessage: undefined,
        lastSync: new Date().toISOString(),
      };

      setOTAs(prev => prev.map(o => o.id === otaId ? reconnectedOTA : o));
      addSyncLog(ota.code, ota.name, 'connection', 'success', `Reconnected to ${ota.name}`);
      success(`Reconnected to ${ota.name}`);
    } catch (err: any) {
      console.error('Error reconnecting OTA:', err);
      showError(err.response?.data?.error || 'Failed to reconnect OTA');
      throw err;
    }
  }, [otas, success, showError, addSyncLog]);

  const updateOTACredentials = useCallback(async (otaId: string, credentials: any) => {
    try {
      const ota = otas.find(o => o.id === otaId);
      if (!ota) return;

      const updated = await channelManagerService.updateOTA(otaId, {
        credentials: { ...ota.credentials, ...credentials },
      });
      setOTAs(prev => prev.map(o => o.id === otaId ? updated : o));
      success('OTA credentials updated successfully');
    } catch (err: any) {
      console.error('Error updating OTA credentials:', err);
      showError(err.response?.data?.error || 'Failed to update OTA credentials');
      throw err;
    }
  }, [otas, success, showError, addSyncLog]);

  const updateOTASyncSettings = useCallback(async (otaId: string, settings: any) => {
    try {
      const ota = otas.find(o => o.id === otaId);
      if (!ota) return;

      const updated = await channelManagerService.updateOTA(otaId, {
        syncSettings: { ...ota.syncSettings, ...settings },
      });
      setOTAs(prev => prev.map(o => o.id === otaId ? updated : o));
      success('Sync settings updated successfully');
    } catch (err: any) {
      console.error('Error updating sync settings:', err);
      showError(err.response?.data?.error || 'Failed to update sync settings');
      throw err;
    }
  }, [otas, success, showError, addSyncLog]);

  const testOTAConnection = useCallback(async (otaId: string) => {
    try {
      const result = await channelManagerService.testOTA(otaId);
      if (result.connected) {
        success('Connection test successful');
      } else {
        showError(result.message || 'Connection test failed');
      }
      return result;
    } catch (err: any) {
      console.error('Error testing OTA connection:', err);
      showError(err.response?.data?.error || 'Failed to test OTA connection');
      throw err;
    }
  }, [success, showError]);

  // ============ ROOM MAPPING FUNCTIONS ============

  const mapRoom = useCallback(async (mappingData: any) => {
    try {
      const newMapping = await channelManagerService.createRoomMapping(mappingData);
      // Use request keys so lookup by room.id works (API may return id = mapping UUID)
      const pmsId = String(mappingData.pmsRoomTypeId ?? newMapping?.pmsRoomTypeId ?? newMapping?.id ?? '');
      const pmsName = String(mappingData.pmsRoomType ?? newMapping?.pmsRoomType ?? '');
      const otaEntry = {
        otaCode: mappingData.otaCode ?? newMapping?.otaCode ?? '',
        otaRoomType: mappingData.otaRoomType ?? newMapping?.otaRoomType ?? '',
        otaRoomId: mappingData.otaRoomId ?? newMapping?.otaRoomId ?? '',
        otaRoomCode: newMapping?.otaRoomCode,
        maxGuests: newMapping?.maxGuests ?? mappingData?.maxGuests,
        defaultRatePlan: newMapping?.defaultRatePlan ?? mappingData?.defaultRatePlan,
        status: 'active' as const,
        lastSync: new Date().toISOString(),
      };
      setRoomMappings(prev => {
        const byId = new Map(prev.map(m => [String(m.pmsRoomTypeId), { ...m }]));
        const existing = byId.get(pmsId);
        if (existing) {
          const otaMappings = existing.otaMappings ?? [];
          const hasOta = otaMappings.some((om: any) => om.otaCode === otaEntry.otaCode);
          if (!hasOta) existing.otaMappings = [...otaMappings, otaEntry];
          byId.set(pmsId, existing);
        } else {
          byId.set(pmsId, {
            id: newMapping?.id ?? pmsId,
            pmsRoomTypeId: pmsId,
            pmsRoomType: pmsName,
            pmsRoomCode: newMapping?.pmsRoomCode,
            basePrice: newMapping?.basePrice ?? 0,
            inventory: newMapping?.inventory ?? 0,
            otaMappings: [otaEntry],
          });
        }
        return Array.from(byId.values());
      });
      // Refresh from server so UI reflects saved mapping (handles any API key shape: id vs roomTypeId)
      await fetchRoomMappings();
      const ota = otas.find(o => o.code === mappingData.otaCode);
      addSyncLog(
        mappingData.otaCode,
        ota?.name || mappingData.otaCode,
        'availability_update',
        'success',
        `Room mapping created: ${mappingData.pmsRoomType} -> ${mappingData.otaRoomType}`
      );
      success('Room mapping created successfully');
      return newMapping;
    } catch (err: any) {
      console.error('Error creating room mapping:', err);
      const message = getApiErrorMessage(err, 'Failed to create room mapping');
      showError(message);
      throw err;
    }
  }, [otas, fetchRoomMappings, success, showError]);

  const unmapRoom = useCallback(async (mappingId: string) => {
    try {
      await channelManagerService.deleteRoomMapping(mappingId);
      await fetchRoomMappings(); // Refresh list
      success('Room mapping removed successfully');
    } catch (err: any) {
      console.error('Error removing room mapping:', err);
      showError(err.response?.data?.error || 'Failed to remove room mapping');
      throw err;
    }
  }, [fetchRoomMappings, success, showError]);

  const validateMapping = useCallback(async (pmsRoomTypeId: string, otaCode: string) => {
    try {
      const result = await channelManagerService.validateRoomMapping({ pmsRoomTypeId, otaCode });
      return result;
    } catch (err: any) {
      console.error('Error validating mapping:', err);
      showError(err.response?.data?.error || 'Failed to validate mapping');
      return { valid: false, errors: [err.response?.data?.error || 'Validation failed'], warnings: [] };
    }
  }, [showError]);

  const autoMapRoomMappings = useCallback(async (otaCode: string) => {
    try {
      const result = await channelManagerService.autoMapRoomMappings(otaCode);
      
      // Ensure result has expected structure
      const normalizedResult = {
        mappingsCreated: result?.mappingsCreated || 0,
        suggestions: result?.suggestions || []
      };
      
      // Only show success message if mappings were actually created
      if (normalizedResult.mappingsCreated > 0) {
        await fetchRoomMappings(); // Refresh list
        success(`Auto-mapped ${normalizedResult.mappingsCreated} room type${normalizedResult.mappingsCreated === 1 ? '' : 's'}`);
      } else if (normalizedResult.suggestions.length > 0) {
        // Show info message about suggestions
        success(`Found ${normalizedResult.suggestions.length} mapping suggestion${normalizedResult.suggestions.length === 1 ? '' : 's'}. Please review and apply.`);
      } else {
        // No mappings created and no suggestions
        await fetchRoomMappings(); // Still refresh in case of any changes
      }
      
      return normalizedResult;
    } catch (err: any) {
      console.error('Error auto-mapping rooms:', err);
      showError(err.response?.data?.error || err.response?.data?.message || 'Failed to auto-map rooms');
      throw err;
    }
  }, [fetchRoomMappings, success, showError]);

  const autoSuggestMapping = useCallback((pmsRoomType: string, _otaCode: string) => {
    // Simple suggestion logic - can be enhanced with AI
    return `${pmsRoomType} Room`;
  }, []);

  // ============ RATE FUNCTIONS ============

  const updateRateForOTA = useCallback(async (date: string, roomType: string, otaCode: string, newRate: number) => {
    try {
      // Get current rate entry
      const currentEntry = rateCalendar[date]?.[roomType];
      // When 'ALL' (BAR rate), send under 'rates' key so backend persists to DailyRate
      const payload = otaCode === 'ALL'
        ? { rates: { BAR: newRate } }
        : { otaRates: { ...(currentEntry?.otaRates || {}), [otaCode]: newRate } };
      const updated = await channelManagerService.updateRate(date, roomType, payload);

      // Update local state
      setRateCalendar(prev => ({
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [roomType]: updated,
        },
      }));

      const ota = otas.find(o => o.code === otaCode);
      addSyncLog(otaCode, ota?.name || otaCode, 'rate_update', 'success', `Rate updated for ${roomType}: $${newRate}`);
      success('Rate updated successfully');
    } catch (err: any) {
      console.error('Error updating rate:', err);
      showError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update rate. The backend may not support this endpoint yet.');
    }
  }, [rateCalendar, otas, success, showError, addSyncLog]);

  const updateAvailabilityForOTA = useCallback(async (date: string, roomType: string, availability: number) => {
    try {
      const updated = await channelManagerService.updateRate(date, roomType, {
        availability,
      });

      setRateCalendar(prev => ({
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [roomType]: updated,
        },
      }));

      success('Availability updated successfully');
    } catch (err: any) {
      console.error('Error updating availability:', err);
      showError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update availability. The backend may not support this endpoint yet.');
    }
  }, [rateCalendar, success, showError]);

  const toggleStopSell = useCallback(async (date: string, roomType: string, stopSell: boolean) => {
    try {
      const updated = await channelManagerService.updateRate(date, roomType, {
        stopSell,
      });

      setRateCalendar(prev => ({
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [roomType]: updated,
        },
      }));

      addSyncLog('ALL', 'All OTAs', 'restriction_update', 'success', `Stop sell ${stopSell ? 'activated' : 'deactivated'} for ${roomType} on ${date}`);
      success(`Stop sell ${stopSell ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      console.error('Error toggling stop sell:', err);
      showError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update stop sell');
    }
  }, [success, showError]);

  const toggleCTA = useCallback(async (date: string, roomType: string, cta: boolean) => {
    try {
      const updated = await channelManagerService.updateRate(date, roomType, {
        cta,
      });

      setRateCalendar(prev => ({
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [roomType]: updated,
        },
      }));

      success(`Close to arrival ${cta ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      console.error('Error toggling CTA:', err);
      showError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update CTA');
    }
  }, [success, showError]);

  const toggleCTD = useCallback(async (date: string, roomType: string, ctd: boolean) => {
    try {
      const updated = await channelManagerService.updateRate(date, roomType, {
        ctd,
      });

      setRateCalendar(prev => ({
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [roomType]: updated,
        },
      }));

      success(`Close to departure ${ctd ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      console.error('Error toggling CTD:', err);
      showError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update CTD');
    }
  }, [success, showError]);

  const pushRatesToOTAs = useCallback(async (selectedOTAs?: string[], dateRange?: { start: string; end: string }) => {
    setIsSyncing(true);
    try {
      const today = new Date();
      const defaultStart = dateRange?.start || today.toISOString().split('T')[0];
      const defaultEnd = dateRange?.end || new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const result = await channelManagerService.pushRates({
        otaCodes: selectedOTAs || ['ALL'],
        dateRange: {
          start: defaultStart,
          end: defaultEnd,
        },
        roomTypeIds: ['ALL'],
      });

      setLastGlobalSync(new Date().toISOString());
      success('Rates pushed successfully');
      return result;
    } catch (err: any) {
      console.error('Error pushing rates:', err);
      showError(err.response?.data?.error || 'Failed to push rates');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [success, showError]);

  const syncRatesToAllOTAs = useCallback(async () => {
    const connectedOTAs = otas.filter(o => o.status === 'connected').map(o => o.code);
    await pushRatesToOTAs(connectedOTAs);
  }, [otas, pushRatesToOTAs]);

  // ============ RESTRICTION FUNCTIONS ============

  const setRestriction = useCallback(async (restrictionData: any) => {
    const isUpdate = !!restrictionData.id;
    try {
      let result;
      if (isUpdate) {
        const { id, ...data } = restrictionData;
        result = await channelManagerService.updateRestriction(id, data);
      } else {
        result = await channelManagerService.createRestriction(restrictionData);
      }
      await fetchRestrictions();
      addSyncLog(
        restrictionData.otaCode,
        restrictionData.otaCode === 'ALL' ? 'All OTAs' : otas.find(o => o.code === restrictionData.otaCode)?.name || restrictionData.otaCode,
        'restriction_update',
        'success',
        `Restriction set for ${restrictionData.roomType}`
      );
      success(isUpdate ? 'Restriction updated successfully' : 'Restriction created successfully');
      return result;
    } catch (err: any) {
      console.error(isUpdate ? 'Error updating restriction:' : 'Error creating restriction:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || (isUpdate ? 'Failed to update restriction' : 'Failed to create restriction');
      showError(errorMsg);
      throw err;
    }
  }, [otas, fetchRestrictions, success, showError, addSyncLog]);

  const removeRestriction = useCallback(async (restrictionId: string) => {
    try {
      await channelManagerService.deleteRestriction(restrictionId);
      await fetchRestrictions(); // Refresh list
      success('Restriction removed successfully');
    } catch (err: any) {
      console.error('Error removing restriction:', err);
      showError(err.response?.data?.error || 'Failed to remove restriction');
      throw err;
    }
  }, [fetchRestrictions, success, showError]);

  const toggleRestrictionStatus = useCallback(async (restrictionId: string) => {
    try {
      const result = await channelManagerService.toggleRestriction(restrictionId);
      await fetchRestrictions(); // Refresh list
      success(`Restriction ${result.isActive ? 'activated' : 'deactivated'}`);
    } catch (err: any) {
      console.error('Error toggling restriction:', err);
      showError(err.response?.data?.error || 'Failed to toggle restriction');
      throw err;
    }
  }, [fetchRestrictions, success, showError]);

  // ============ PROMOTION FUNCTIONS ============

  const createChannelPromotion = useCallback(async (promotionData: any) => {
    try {
      const newPromotion = await channelManagerService.createPromotion(promotionData);
      await fetchPromotions(); // Refresh list
      addSyncLog(
        promotionData.otaCodes?.[0] || 'ALL',
        promotionData.otaCodes?.[0] === 'ALL' ? 'All OTAs' : otas.find(o => o.code === promotionData.otaCodes?.[0])?.name || 'All OTAs',
        'promotion_sync',
        'success',
        `Promotion "${promotionData.name}" created successfully`
      );
      success('Promotion created successfully');
      return newPromotion;
    } catch (err: any) {
      console.error('Error creating promotion:', err);
      showError(err.response?.data?.error || 'Failed to create promotion');
      throw err;
    }
  }, [otas, fetchPromotions, success, showError]);

  const applyPromotionToOTA = useCallback(async (promotionId: string, otaCodes: string[]) => {
    try {
      await channelManagerService.applyPromotion(promotionId, { otaCodes });
      for (const otaCode of otaCodes) {
        const ota = otas.find(o => o.code === otaCode);
        if (ota) {
          addSyncLog(otaCode, ota.name, 'promotion_sync', 'success', `Promotion applied to ${ota.name}`);
        }
      }
      success('Promotion applied successfully');
    } catch (err: any) {
      console.error('Error applying promotion:', err);
      showError(err.response?.data?.error || 'Failed to apply promotion');
      throw err;
    }
  }, [otas, success, showError, addSyncLog]);

  const updateChannelPromotion = useCallback(async (promotionId: string, promotionData: any) => {
    try {
      const updated = await channelManagerService.updatePromotion(promotionId, promotionData);
      await fetchPromotions(); // Refresh list
      addSyncLog(
        promotionData.otaCodes?.[0] || 'ALL',
        promotionData.otaCodes?.[0] === 'ALL' ? 'All OTAs' : otas.find(o => o.code === promotionData.otaCodes?.[0])?.name || 'All OTAs',
        'promotion_sync',
        'success',
        `Promotion "${promotionData.name || updated.name}" updated successfully`
      );
      success('Promotion updated successfully');
      return updated;
    } catch (err: any) {
      console.error('Error updating promotion:', err);
      showError(err.response?.data?.error || 'Failed to update promotion');
      throw err;
    }
  }, [otas, fetchPromotions, success, showError, addSyncLog]);

  const deleteChannelPromotion = useCallback(async (promotionId: string) => {
    try {
      await channelManagerService.deletePromotion(promotionId);
      await fetchPromotions(); // Refresh list
      success('Promotion deleted successfully');
    } catch (err: any) {
      console.error('Error deleting promotion:', err);
      showError(err.response?.data?.error || 'Failed to delete promotion');
      throw err;
    }
  }, [fetchPromotions, success, showError]);

  const toggleChannelPromotion = useCallback(async (promotionId: string) => {
    try {
      const result = await channelManagerService.togglePromotion(promotionId);
      await fetchPromotions(); // Refresh list
      success(`Promotion ${result.isActive ? 'activated' : 'deactivated'} successfully`);
      return result;
    } catch (err: any) {
      console.error('Error toggling promotion:', err);
      showError(err.response?.data?.error || 'Failed to toggle promotion');
      throw err;
    }
  }, [fetchPromotions, success, showError]);

  // ============ SYNC LOG FUNCTIONS ============
  // addSyncLog is defined above with other callbacks

  const filterLogs = useCallback((filters: any) => {
    return syncLogs.filter(log => {
      if (filters.otaCode && filters.otaCode !== 'ALL' && log.otaCode !== filters.otaCode) return false;
      if (filters.status && log.status !== filters.status) return false;
      if (filters.action && log.action !== filters.action) return false;
      if (filters.dateFrom && log.timestamp < filters.dateFrom) return false;
      if (filters.dateTo && log.timestamp > filters.dateTo) return false;
      return true;
    });
  }, [syncLogs]);

  const clearLogs = useCallback(async () => {
    try {
      await channelManagerService.clearSyncLogs();
      setSyncLogs([]);
      success('Sync logs cleared successfully');
    } catch (err: any) {
      console.error('Error clearing logs:', err);
      showError(err.response?.data?.error || 'Failed to clear sync logs');
      throw err;
    }
  }, [success, showError]);

  // ============ SYNC FUNCTIONS ============

  const triggerManualSync = useCallback(async (otaCode: string = 'ALL') => {
    // Prevent multiple simultaneous sync triggers
    if (isSyncing || syncingOTAs.length > 0) {
      return;
    }
    setIsSyncing(true);
    const syncTimestamp = new Date().toISOString();
    try {
      if (otaCode === 'ALL') {
        setSyncingOTAs(otas.filter(o => o.status === 'connected').map(o => o.code));
        const result = await channelManagerService.syncAllOTAs();
        // Update lastSync timestamp for all connected OTAs
        setOTAs(prev => prev.map(o => o.status === 'connected' ? { ...o, lastSync: syncTimestamp } : o));
        setSyncingOTAs([]);
        setLastGlobalSync(syncTimestamp);
        const count = result.syncIds?.length;
        success(count != null && count > 0 ? `Started ${count} sync${count === 1 ? '' : 's'}` : 'Sync initiated for all OTAs');
        // Refetch Sync Logs so new rows (with result.syncIds) and timestamps appear
        await fetchSyncLogs({ pageSize: 50 });
        return result;
      } else {
        const ota = otas.find(o => o.code === otaCode);
        if (!ota) {
          throw new Error('OTA not found');
        }
        if (ota.code === 'DUMMY' || ota.id === 'ota-dummy') {
          success('Dummy OTA sync simulated. Connect a real OTA to sync live data.');
          setOTAs(prev => prev.map(o => o.code === otaCode ? { ...o, lastSync: syncTimestamp } : o));
          setLastGlobalSync(syncTimestamp);
          addSyncLog(otaCode, ota.name, 'manual_sync', 'success', 'Dummy sync simulated');
          return { syncId: 0, status: 'pending' as const, startedAt: syncTimestamp };
        }
        setSyncingOTAs([otaCode]);
        const result = await channelManagerService.syncOTA(ota.id);
        // Update lastSync timestamp for the synced OTA
        setOTAs(prev => prev.map(o => o.code === otaCode ? { ...o, lastSync: syncTimestamp } : o));
        setSyncingOTAs([]);
        setLastGlobalSync(syncTimestamp);
        const startedMsg = result.startedAt
          ? `Sync started at ${new Date(result.startedAt).toLocaleString()}`
          : `Sync initiated for ${ota.name}`;
        success(startedMsg);
        // Refetch Sync Logs so new row (id === result.syncId) and startedAt appear
        await fetchSyncLogs({ pageSize: 50 });
        return result;
      }
    } catch (err: any) {
      console.error('Error triggering sync:', err);
      showError(err.response?.data?.detail || err.response?.data?.error || 'Failed to trigger sync');
      setSyncingOTAs([]);
    } finally {
      setIsSyncing(false);
    }
  }, [otas, isSyncing, syncingOTAs, success, showError, addSyncLog, fetchSyncLogs]);

  // Auto-sync scheduler (disabled for now - backend handles this)
  useEffect(() => {
    // Backend handles auto-sync, but we can refresh data periodically
    const intervalId = setInterval(() => {
      // Only refresh when tab is visible to avoid wasted API calls
      if (document.visibilityState === 'visible') {
        fetchChannelStats();
        fetchAIInsights();
      }
    }, SYNC_INTERVAL);
    syncIntervalRef.current = intervalId;

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [fetchChannelStats, fetchAIInsights]);

  // ============ ANALYTICS ============

  const getChannelStats = useCallback(() => {
    // Return cached stats or calculate from current state
    if (channelStats) {
      return channelStats;
    }

    // Fallback calculation from state
    const connectedCount = otas.filter(o => o.status === 'connected').length;
    const errorCount = otas.filter(o => o.status === 'error').length;
    const totalBookings = otas.reduce((sum, o) => sum + (o.stats?.totalBookings || 0), 0);
    const totalRevenue = otas.reduce((sum, o) => sum + (o.stats?.revenue || 0), 0);
    const mappedRoomTypes = roomMappings.filter(m => m.otaMappings.length > 0).length;
    const activeRestrictions = restrictions.filter(r => r.isActive).length;

    return {
      connectedOTAs: connectedCount,
      disconnectedOTAs: otas.length - connectedCount,
      errorOTAs: errorCount,
      totalBookings,
      totalRevenue,
      mappedRoomTypes,
      totalRoomTypes: roomMappings.length,
      activeRestrictions,
      rateParityIssues: [],
      lastSync: lastGlobalSync,
      revenueTrend: [],
      bookingsTrend: [],
      channelPerformance: otas.filter(o => o.status === 'connected').map(ota => ({
        name: ota.name,
        code: ota.code,
        color: ota.color,
        bookings: ota.stats?.totalBookings || 0,
        revenue: ota.stats?.revenue || 0,
        rating: ota.stats?.avgRating || 0,
        commission: ota.stats?.commission || 15,
        conversionRate: 2.1,
      })),
      avgCommission: 15,
      avgConversionRate: 2.1,
      revenueGrowth: '+0%',
      bookingsGrowth: '+0%',
    };
  }, [channelStats, otas, roomMappings, restrictions, lastGlobalSync]);

  const getAIInsights = useCallback(() => {
    return aiInsights;
  }, [aiInsights]);

  const value = {
    // State
    otas,
    roomMappings,
    restrictions,
    promotions,
    syncLogs,
    rateCalendar,
    roomTypes,
    isSyncing,
    isLoading,
    syncingOTAs,
    lastGlobalSync,

    // OTA functions
    connectOTA,
    disconnectOTA,
    reconnectOTA,
    updateOTACredentials,
    updateOTASyncSettings,
    testOTAConnection,

    // Room mapping functions
    mapRoom,
    unmapRoom,
    validateMapping,
    autoMapRoomMappings,
    autoSuggestMapping,
    showError,

    // Rate functions
    updateRateForOTA,
    updateAvailabilityForOTA,
    toggleStopSell,
    toggleCTA,
    toggleCTD,
    pushRatesToOTAs,
    syncRatesToAllOTAs,

    // Restriction functions
    setRestriction,
    removeRestriction,
    toggleRestrictionStatus,

    // Promotion functions
    createChannelPromotion,
    updateChannelPromotion,
    deleteChannelPromotion,
    toggleChannelPromotion,
    applyPromotionToOTA,

    // Sync log functions
    addSyncLog,
    filterLogs,
    clearLogs,

    // Sync functions
    triggerManualSync,

    // Data fetching functions
    fetchOTAs,
    fetchRoomMappings,
    fetchRestrictions,
    fetchPromotions,
    fetchSyncLogs,
    fetchRateCalendar,
    fetchChannelStats,
    fetchAIInsights,
    fetchRoomTypes,

    // Analytics
    getChannelStats,
    getAIInsights,
  };

  return (
    <ChannelManagerContext.Provider value={value}>
      {children}
    </ChannelManagerContext.Provider>
  );
}

export function useChannelManager() {
  const context = useContext(ChannelManagerContext);
  if (!context) {
    throw new Error('useChannelManager must be used within a ChannelManagerProvider');
  }
  return context;
}

export default ChannelManagerContext;
