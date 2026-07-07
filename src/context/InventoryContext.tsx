/**
 * INVENTORY CONTEXT
 * React Context for the Unified Inventory Engine
 * Provides inventory state and operations to all PMS components
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { InventoryEngine } from '../inventory/InventoryEngine';
import {
  roomTypes,
  ratePlans,
  samplePromotions,
  otaMappings,
  sampleRooms,
  generateAvailabilityGrid,
  generateRateGrid,
  generateRestrictionGrid
} from '../data/inventory/sampleInventoryData';

// Create context
const InventoryContext = createContext(null);

// Storage key for persistence
const STORAGE_KEY = 'glimmora_inventory_state';

/**
 * Initialize engine with sample data
 */
function initializeEngine() {
  const today = new Date();
  const endDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

  return new InventoryEngine({
    availabilityGrid: generateAvailabilityGrid(today, endDate),
    rateGrid: generateRateGrid(today, endDate),
    restrictionGrid: generateRestrictionGrid(today, endDate),
    roomTypes,
    ratePlans,
    promotions: samplePromotions,
    otaMappings,
    rooms: sampleRooms,
    overbookingAlerts: [],
    syncQueue: [],
    syncLogs: []
  });
}

/**
 * Inventory Provider Component
 */
export function InventoryProvider({ children }) {
  // Initialize engine instance
  const engineRef = useRef(null);
  if (!engineRef.current) {
    engineRef.current = initializeEngine();
  }

  // State from engine
  const [state, setState] = useState(() => engineRef.current.getState());

  // Sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncErrors, setSyncErrors] = useState([]);

  // Auto-sync interval
  const syncIntervalRef = useRef(null);

  /**
   * Subscribe to engine state changes
   */
  useEffect(() => {
    const unsubscribe = engineRef.current.subscribe((newState) => {
      setState(newState);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Load persisted state on mount
   */
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Only restore certain parts of state to avoid stale data issues
        if (parsed.promotions) {
          engineRef.current.updateState({ promotions: parsed.promotions });
        }
        if (parsed.overbookingAlerts) {
          engineRef.current.updateState({ overbookingAlerts: parsed.overbookingAlerts });
        }
      }
    } catch (error) {
      console.warn('Failed to load inventory state:', error);
    }
  }, []);

  /**
   * Persist state changes
   */
  useEffect(() => {
    try {
      const toSave = {
        promotions: state.promotions,
        overbookingAlerts: state.overbookingAlerts,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.warn('Failed to save inventory state:', error);
    }
  }, [state.promotions, state.overbookingAlerts]);

  /**
   * Setup auto-sync every 5 minutes
   */
  useEffect(() => {
    const runAutoSync = async () => {
      if (isSyncing) return;

      setIsSyncing(true);
      try {
        await engineRef.current.processSyncQueue();
        setLastSyncTime(new Date().toISOString());
        setSyncErrors([]);
      } catch (error) {
        setSyncErrors(prev => [...prev, { time: new Date().toISOString(), error: error.message }]);
      } finally {
        setIsSyncing(false);
      }
    };

    // Initial sync after 10 seconds
    const initialTimeout = setTimeout(runAutoSync, 10000);

    // Recurring sync every 5 minutes
    syncIntervalRef.current = setInterval(runAutoSync, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isSyncing]);

  // ============================================
  // BOOKING OPERATIONS
  // ============================================

  const createBooking = useCallback((bookingData) => {
    return engineRef.current.createBooking(bookingData);
  }, []);

  const modifyBooking = useCallback((bookingId, originalBooking, modifications) => {
    return engineRef.current.modifyBooking(bookingId, originalBooking, modifications);
  }, []);

  const cancelBooking = useCallback((bookingId, bookingData, reason) => {
    return engineRef.current.cancelBooking(bookingId, bookingData, reason);
  }, []);

  // ============================================
  // AVAILABILITY OPERATIONS
  // ============================================

  const checkAvailability = useCallback((roomTypeId, checkIn, checkOut) => {
    return engineRef.current.getAvailability(roomTypeId, checkIn, checkOut);
  }, []);

  const getAvailabilityForDate = useCallback((roomTypeId, date) => {
    return engineRef.current.getAvailabilityForDate(roomTypeId, date);
  }, []);

  const getMinAvailability = useCallback((roomTypeId, checkIn, checkOut) => {
    return engineRef.current.getMinAvailability(roomTypeId, checkIn, checkOut);
  }, []);

  const getAvailabilitySummary = useCallback((roomTypeId, startDate, endDate) => {
    return engineRef.current.getAvailabilitySummaryForRange(roomTypeId, startDate, endDate);
  }, []);

  const setOutOfOrder = useCallback((roomTypeId, date, count = 1) => {
    return engineRef.current.setRoomOutOfOrder(roomTypeId, date, count);
  }, []);

  const clearOutOfOrder = useCallback((roomTypeId, date, count = 1) => {
    return engineRef.current.clearRoomOutOfOrder(roomTypeId, date, count);
  }, []);

  const blockRooms = useCallback((roomTypeId, startDate, endDate, count, reason) => {
    return engineRef.current.blockRoomsForPeriod(roomTypeId, startDate, endDate, count, reason);
  }, []);

  const unblockRooms = useCallback((roomTypeId, startDate, endDate, count) => {
    return engineRef.current.unblockRoomsForPeriod(roomTypeId, startDate, endDate, count);
  }, []);

  // ============================================
  // RATE OPERATIONS
  // ============================================

  const getRate = useCallback((roomTypeId, date, ratePlanId = 'bar') => {
    return engineRef.current.getRateForDate(roomTypeId, date, ratePlanId);
  }, []);

  const getAllRatesForDate = useCallback((roomTypeId, date) => {
    return engineRef.current.getAllRates(roomTypeId, date);
  }, []);

  const calculateStayPrice = useCallback((roomTypeId, checkIn, checkOut, ratePlanId = 'bar', promotion = null) => {
    return engineRef.current.calculateStayTotal(roomTypeId, checkIn, checkOut, ratePlanId, promotion);
  }, []);

  const setRateOverride = useCallback((roomTypeId, startDate, endDate, ratePlanId, newRate, reason) => {
    return engineRef.current.setRateOverride(roomTypeId, startDate, endDate, ratePlanId, newRate, reason);
  }, []);

  const clearRateOverride = useCallback((roomTypeId, startDate, endDate, ratePlanId) => {
    return engineRef.current.clearRateOverride(roomTypeId, startDate, endDate, ratePlanId);
  }, []);

  const getRateSummary = useCallback((roomTypeId, startDate, endDate, ratePlanId = 'bar') => {
    return engineRef.current.getRateSummaryForRange(roomTypeId, startDate, endDate, ratePlanId);
  }, []);

  const checkRateParity = useCallback((roomTypeId, date) => {
    return engineRef.current.checkParityForDate(roomTypeId, date);
  }, []);

  const getAIRateSuggestion = useCallback((roomTypeId, date) => {
    return engineRef.current.getAISuggestion(roomTypeId, date);
  }, []);

  // ============================================
  // RESTRICTION OPERATIONS
  // ============================================

  const validateRestrictions = useCallback((roomTypeId, checkIn, checkOut, otaCode = null) => {
    return engineRef.current.validateBookingRestrictions(roomTypeId, checkIn, checkOut, otaCode);
  }, []);

  const getRestrictions = useCallback((roomTypeId, date) => {
    return engineRef.current.getRestrictionsForDate(roomTypeId, date);
  }, []);

  const setCTA = useCallback((roomTypeId, startDate, endDate, closed = true, otaCode = null) => {
    return engineRef.current.setClosedToArrival(roomTypeId, startDate, endDate, closed, otaCode);
  }, []);

  const setCTD = useCallback((roomTypeId, startDate, endDate, closed = true, otaCode = null) => {
    return engineRef.current.setClosedToDeparture(roomTypeId, startDate, endDate, closed, otaCode);
  }, []);

  const setStopSell = useCallback((roomTypeId, startDate, endDate, stopped = true, otaCode = null) => {
    return engineRef.current.setStopSellStatus(roomTypeId, startDate, endDate, stopped, otaCode);
  }, []);

  const setMinStay = useCallback((roomTypeId, startDate, endDate, minNights) => {
    return engineRef.current.setMinimumStay(roomTypeId, startDate, endDate, minNights);
  }, []);

  const setMaxStay = useCallback((roomTypeId, startDate, endDate, maxNights) => {
    return engineRef.current.setMaximumStay(roomTypeId, startDate, endDate, maxNights);
  }, []);

  const canArrive = useCallback((roomTypeId, date, otaCode = null) => {
    return engineRef.current.canArriveOnDate(roomTypeId, date, otaCode);
  }, []);

  const canDepart = useCallback((roomTypeId, date, otaCode = null) => {
    return engineRef.current.canDepartOnDate(roomTypeId, date, otaCode);
  }, []);

  const findNextArrival = useCallback((roomTypeId, startDate, maxDays = 30, otaCode = null) => {
    return engineRef.current.findNextArrivalDate(roomTypeId, startDate, maxDays, otaCode);
  }, []);

  const getValidCheckouts = useCallback((roomTypeId, checkInDate, maxDays = 30, otaCode = null) => {
    return engineRef.current.getValidCheckouts(roomTypeId, checkInDate, maxDays, otaCode);
  }, []);

  const getRestrictionSummary = useCallback((roomTypeId, startDate, endDate) => {
    return engineRef.current.getRestrictionSummaryForRange(roomTypeId, startDate, endDate);
  }, []);

  // ============================================
  // OVERBOOKING/CONFLICT OPERATIONS
  // ============================================

  const checkOverbooking = useCallback((roomTypeId, date) => {
    return engineRef.current.checkForOverbooking(roomTypeId, date);
  }, []);

  const checkOverbookingRange = useCallback((roomTypeId, startDate, endDate) => {
    return engineRef.current.checkOverbookingForRange(roomTypeId, startDate, endDate);
  }, []);

  const checkAllOverbookings = useCallback((date) => {
    return engineRef.current.checkAllOverbookings(date);
  }, []);

  const wouldCauseOverbooking = useCallback((roomTypeId, checkIn, checkOut, roomCount = 1) => {
    return engineRef.current.wouldCauseOverbooking(roomTypeId, checkIn, checkOut, roomCount);
  }, []);

  const findAlternatives = useCallback((checkIn, checkOut, preferredRoomTypeId) => {
    return engineRef.current.findAlternativeRooms(checkIn, checkOut, preferredRoomTypeId);
  }, []);

  const getOverbookingRisk = useCallback((roomTypeId, date, pendingBookings = []) => {
    return engineRef.current.getOverbookingRisk(roomTypeId, date, pendingBookings);
  }, []);

  const validateBookingConflicts = useCallback((booking, existingBookings = []) => {
    return engineRef.current.validateBookingForConflicts(booking, existingBookings);
  }, []);

  const resolveOverbooking = useCallback((alertId, resolution, resolvedBy) => {
    return engineRef.current.resolveOverbookingAlert(alertId, resolution, resolvedBy);
  }, []);

  const getOverbookingStats = useCallback(() => {
    return engineRef.current.getOverbookingStatistics();
  }, []);

  // ============================================
  // PROMOTION OPERATIONS
  // ============================================

  const findBestPromotion = useCallback((bookingDetails, priceBeforeDiscount) => {
    return engineRef.current.findBestPromotionForBooking(bookingDetails, priceBeforeDiscount);
  }, []);

  const getApplicablePromotions = useCallback((bookingDetails, priceBeforeDiscount) => {
    return engineRef.current.getApplicablePromotionsForBooking(bookingDetails, priceBeforeDiscount);
  }, []);

  const validatePromoCode = useCallback((code, bookingDetails) => {
    return engineRef.current.validatePromotionCode(code, bookingDetails);
  }, []);

  const addPromotion = useCallback((promotionData) => {
    return engineRef.current.addPromotion(promotionData);
  }, []);

  const cleanupPromotions = useCallback(() => {
    return engineRef.current.cleanupExpiredPromotions();
  }, []);

  const getPromotionStats = useCallback((bookings = []) => {
    return engineRef.current.getPromotionStatistics(bookings);
  }, []);

  // ============================================
  // OTA SYNC OPERATIONS
  // ============================================

  const triggerSync = useCallback(async (otaCode = null) => {
    setIsSyncing(true);
    try {
      if (otaCode) {
        const result = await engineRef.current.pushToOTA(otaCode, {
          startDate: engineRef.current.formatDate(new Date()),
          endDate: engineRef.current.formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
        });
        setLastSyncTime(new Date().toISOString());
        return result;
      } else {
        const results = await engineRef.current.processSyncQueue();
        setLastSyncTime(new Date().toISOString());
        return results;
      }
    } catch (error) {
      setSyncErrors(prev => [...prev, { time: new Date().toISOString(), error: error.message }]);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleOTABooking = useCallback((otaBooking) => {
    return engineRef.current.handleOTABooking(otaBooking);
  }, []);

  const handleOTAModification = useCallback((otaModification, existingBooking) => {
    return engineRef.current.handleOTAModification(otaModification, existingBooking);
  }, []);

  const handleOTACancellation = useCallback((otaCancellation, existingBooking) => {
    return engineRef.current.handleOTACancellation(otaCancellation, existingBooking);
  }, []);

  const getSyncStatus = useCallback(() => {
    return {
      ...engineRef.current.getSyncStatus(),
      isSyncing,
      lastSyncTime,
      syncErrors
    };
  }, [isSyncing, lastSyncTime, syncErrors]);

  // ============================================
  // HOUSEKEEPING OPERATIONS
  // ============================================

  const updateRoomStatus = useCallback((roomNumber, status, notes = '') => {
    return engineRef.current.updateRoomStatus(roomNumber, status, notes);
  }, []);

  const getRoomsByStatus = useCallback((status) => {
    return engineRef.current.getRoomsByStatus(status);
  }, []);

  const getHousekeepingSummary = useCallback(() => {
    return engineRef.current.getHousekeepingSummary();
  }, []);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const formatCurrency = useCallback((amountInCents, currency = 'INR') => {
    return engineRef.current.formatCurrency(amountInCents, currency);
  }, []);

  const getNights = useCallback((checkIn, checkOut) => {
    return engineRef.current.getNights(checkIn, checkOut);
  }, []);

  const formatDate = useCallback((date) => {
    return engineRef.current.formatDate(date);
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    // State
    availabilityGrid: state.availabilityGrid,
    rateGrid: state.rateGrid,
    restrictionGrid: state.restrictionGrid,
    roomTypes: state.roomTypes,
    ratePlans: state.ratePlans,
    promotions: state.promotions,
    otaMappings: state.otaMappings,
    rooms: state.rooms,
    overbookingAlerts: state.overbookingAlerts,
    syncQueue: state.syncQueue,
    syncLogs: state.syncLogs,

    // Sync status
    isSyncing,
    lastSyncTime,
    syncErrors,

    // Booking operations
    createBooking,
    modifyBooking,
    cancelBooking,

    // Availability operations
    checkAvailability,
    getAvailabilityForDate,
    getMinAvailability,
    getAvailabilitySummary,
    setOutOfOrder,
    clearOutOfOrder,
    blockRooms,
    unblockRooms,

    // Rate operations
    getRate,
    getAllRatesForDate,
    calculateStayPrice,
    setRateOverride,
    clearRateOverride,
    getRateSummary,
    checkRateParity,
    getAIRateSuggestion,

    // Restriction operations
    validateRestrictions,
    getRestrictions,
    setCTA,
    setCTD,
    setStopSell,
    setMinStay,
    setMaxStay,
    canArrive,
    canDepart,
    findNextArrival,
    getValidCheckouts,
    getRestrictionSummary,

    // Overbooking operations
    checkOverbooking,
    checkOverbookingRange,
    checkAllOverbookings,
    wouldCauseOverbooking,
    findAlternatives,
    getOverbookingRisk,
    validateBookingConflicts,
    resolveOverbooking,
    getOverbookingStats,

    // Promotion operations
    findBestPromotion,
    getApplicablePromotions,
    validatePromoCode,
    addPromotion,
    cleanupPromotions,
    getPromotionStats,

    // OTA sync operations
    triggerSync,
    handleOTABooking,
    handleOTAModification,
    handleOTACancellation,
    getSyncStatus,

    // Housekeeping operations
    updateRoomStatus,
    getRoomsByStatus,
    getHousekeepingSummary,

    // Utility functions
    formatCurrency,
    getNights,
    formatDate
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

/**
 * Hook to use inventory context
 */
export function useInventoryContext() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
}

export default InventoryContext;
