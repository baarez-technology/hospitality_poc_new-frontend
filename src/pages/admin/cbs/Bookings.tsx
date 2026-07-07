/**
 * CBS Bookings Page
 * Central Booking System main bookings interface - Glimmora Design System v5.0
 * Enhanced with refined editorial luxury aesthetic
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCBS } from '../../../context/CBSContext';
import { useBookingsSSE } from '../../../hooks/useBookingsSSE';
import { useToast } from '../../../contexts/ToastContext';
import { useTheme } from '../../../contexts/ThemeContext';
import BookingList from '../../../components/cbs/BookingList';
import BookingDrawer from '../../../components/cbs/BookingDrawer';
import NewBookingDrawer from '../../../components/cbs/NewBookingDrawer';
import AssignRoomModal from '../../../components/cbs/AssignRoomModal';
import CheckoutEmotionModal from '../../../components/cbs/CheckoutEmotionModal';
import { ConfirmModal } from '../../../components/ui2/Modal';
import CheckInDrawer from '../../../components/bookings/CheckInDrawer';
import { guestsService } from '../../../api/services/guests.service';
import { bookingService } from '../../../api/services/booking.service';
import { Button } from '../../../components/ui2/Button';
import {
  Plus,
  Search,
  Calendar,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen
} from 'lucide-react';

export default function CBSBookings() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const navigate = useNavigate();

  const { isDark } = useTheme();
  const {
    bookings,
    refreshBookings,
    createBooking,
    updateBooking,
    cancelBooking,
    updateBookingStatus,
    addPayment,
    assignRoom,
    getAvailableRooms,
    getAIInsights,
    getRateForBooking
  } = useCBS();

  const { success, error } = useToast();

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [isAssignRoomModalOpen, setIsAssignRoomModalOpen] = useState(false);
  const [availableRoomsForAssignment, setAvailableRoomsForAssignment] = useState([]);
  const [aiInsights, setAIInsights] = useState([]);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'primary'
  });

  const [loadingStates, setLoadingStates] = useState({});
  const [checkoutBooking, setCheckoutBooking] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const lastActionRef = useRef(null);

  // Check-in drawer state
  const [checkInBooking, setCheckInBooking] = useState<any>(null);
  const [isCheckInDrawerOpen, setIsCheckInDrawerOpen] = useState(false);

  // SSE Integration - refresh bookings when real-time events arrive
  useBookingsSSE({ refetchBookings: refreshBookings });

  const today = new Date().toISOString().split('T')[0];

  const bookingStats = useMemo(() => {
    const arrivals = bookings.filter(b => b.checkIn === today && b.status !== 'CANCELLED').length;
    const departures = bookings.filter(b => b.checkOut === today && b.status !== 'CANCELLED').length;
    const inHouse = bookings.filter(b => b.status === 'CHECKED-IN').length;
    const pending = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;

    // Revenue = actual payments received (amountPaid), not total booking amount
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const totalBookingValue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const pendingPayments = bookings.reduce((sum, b) => sum + (b.balance || 0), 0);
    const avgBookingValue = bookings.length > 0 ? totalBookingValue / bookings.length : 0;

    return { arrivals, departures, inHouse, pending, totalRevenue, totalBookingValue, pendingPayments, avgBookingValue };
  }, [bookings, today]);

  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking);
    const insights = getAIInsights(booking.id);
    setAIInsights(insights);
    setIsDrawerOpen(true);
  }, [getAIInsights]);

  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedBooking(null);
    setAIInsights([]);
  }, []);

  const handleStatusChange = useCallback((bookingId, newStatus) => {
    updateBookingStatus(bookingId, newStatus);
    success(`Booking status updated to ${newStatus}`);

    if (selectedBooking && selectedBooking.id === bookingId) {
      const updated = bookings.find(b => b.id === bookingId);
      if (updated) {
        setSelectedBooking({ ...updated, status: newStatus });
      }
    }
  }, [updateBookingStatus, success, selectedBooking, bookings]);

  const handleNewBooking = useCallback(() => {
    setIsNewBookingModalOpen(true);
  }, []);

  const handleNewBookingSubmit = useCallback(async (bookingData) => {
    try {
      const newBooking = await createBooking(bookingData);
      const confirmationId = newBooking?.id ?? newBooking?.bookingNumber ?? '—';
      success(`Booking ${confirmationId} created successfully`);
      // Refetch list from server so the new reservation appears in the booking table
      await refreshBookings();
      setIsNewBookingModalOpen(false);
    } catch (err) {
      console.error('Create booking failed:', err);
      error(err?.message || err?.response?.data?.detail || 'Failed to create booking');
    }
  }, [createBooking, refreshBookings, success, error]);

  const handleAssignRoom = useCallback(() => {
    if (!selectedBooking) return;

    const rooms = getAvailableRooms(
      selectedBooking.checkIn,
      selectedBooking.checkOut,
      null
    );
    setAvailableRoomsForAssignment(rooms);
    setIsAssignRoomModalOpen(true);
  }, [selectedBooking, getAvailableRooms]);

  // Quick action: Assign room from table (opens modal with booking pre-selected)
  const handleQuickAssignRoom = useCallback((booking) => {
    setSelectedBooking(booking);
    const rooms = getAvailableRooms(
      booking.checkIn,
      booking.checkOut,
      null
    );
    setAvailableRoomsForAssignment(rooms);
    setIsAssignRoomModalOpen(true);
  }, [getAvailableRooms]);

  // Quick action: Check-in from table — opens drawer
  const handleQuickCheckIn = useCallback((booking) => {
    const bookingData = typeof booking === 'object' ? booking : bookings.find(b => b.id === booking);
    if (!bookingData) return;

    // Check if room is assigned first
    if (!bookingData.roomNumber) {
      setConfirmDialog({
        isOpen: true,
        title: 'No Room Assigned',
        message: 'This booking does not have a room assigned. Would you like to assign a room first?',
        variant: 'warning',
        onConfirm: () => handleQuickAssignRoom(bookingData)
      });
      return;
    }

    // Open check-in drawer (balance warning is shown inside the drawer)
    setCheckInBooking(bookingData);
    setIsCheckInDrawerOpen(true);
  }, [bookings]);

  const handleCheckInComplete = useCallback(async (bookingId: string, _data: any) => {
    const previousStatus = bookings.find(b => b.id === bookingId)?.status;
    lastActionRef.current = { type: 'checkIn', bookingId, previousStatus };

    updateBookingStatus(bookingId, 'CHECKED-IN');
    success('Guest checked in successfully', {
      onUndo: () => {
        updateBookingStatus(bookingId, previousStatus);
        lastActionRef.current = null;
      }
    });
    return true;
  }, [bookings, updateBookingStatus, success]);

  // Quick action: Check-out from table — shows emotion modal
  const handleQuickCheckOut = useCallback((booking) => {
    const bookingData = typeof booking === 'object' ? booking : bookings.find(b => b.id === booking);

    if (!bookingData) return;

    // Warn if there's an outstanding balance first
    if (bookingData.balance > 0) {
      setConfirmDialog({
        isOpen: true,
        title: 'Outstanding Balance',
        message: `Guest ${bookingData.guestName} has an outstanding balance of $${bookingData.balance}. Complete checkout anyway?`,
        variant: 'danger',
        onConfirm: () => setCheckoutBooking(bookingData)
      });
      return;
    }

    // Show emotion modal directly
    setCheckoutBooking(bookingData);
  }, [bookings]);

  const performCheckOut = useCallback((bookingId: string) => {
    const previousStatus = bookings.find(b => b.id === bookingId)?.status;
    lastActionRef.current = { type: 'checkOut', bookingId, previousStatus };

    updateBookingStatus(bookingId, 'CHECKED-OUT');
    success('Guest checked out successfully', {
      onUndo: () => {
        updateBookingStatus(bookingId, previousStatus);
        lastActionRef.current = null;
      }
    });
  }, [bookings, updateBookingStatus, success]);

  // Handle checkout with emotion from modal
  const handleCheckoutWithEmotion = useCallback(async (emotion?: string, notes?: string) => {
    if (!checkoutBooking) return;

    setCheckoutLoading(true);
    try {
      // Save guest emotion if provided and guestId is available
      if (emotion && checkoutBooking.guestId) {
        try {
          await guestsService.update(checkoutBooking.guestId, { emotion });
        } catch (err) {
          console.error('Failed to update guest emotion:', err);
          // Don't block checkout if emotion save fails
        }
      }

      // Perform the actual checkout
      performCheckOut(checkoutBooking.id);
    } finally {
      setCheckoutLoading(false);
      setCheckoutBooking(null);
    }
  }, [checkoutBooking, performCheckOut]);

  // Quick action: Cancel from table
  const handleQuickCancel = useCallback((booking) => {
    const bookingData = typeof booking === 'object' ? booking : bookings.find(b => b.id === booking);

    if (!bookingData) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Booking',
      message: `Are you sure you want to cancel booking ${bookingData.id} for ${bookingData.guestName}? This action can be undone.`,
      variant: 'danger',
      onConfirm: () => performCancel(bookingData.id)
    });
  }, [bookings]);

  const performCancel = useCallback((bookingId) => {
    const previousStatus = bookings.find(b => b.id === bookingId)?.status;
    lastActionRef.current = { type: 'cancel', bookingId, previousStatus };

    cancelBooking(bookingId, 'Cancelled by user');
    success('Booking cancelled successfully', {
      onUndo: () => {
        updateBookingStatus(bookingId, previousStatus);
        lastActionRef.current = null;
      }
    });
  }, [bookings, cancelBooking, updateBookingStatus, success]);

  // Send confirmation email to selected bookings
  const handleSendEmail = useCallback(async (bookingIds: string[]) => {
    let sentCount = 0;
    let failCount = 0;
    for (const id of bookingIds) {
      try {
        await bookingService.resendConfirmation(id);
        sentCount++;
      } catch (err: any) {
        failCount++;
        console.error(`Failed to send email for booking ${id}:`, err?.message);
      }
    }
    if (sentCount > 0) {
      success(`Confirmation email sent for ${sentCount} booking${sentCount > 1 ? 's' : ''}`);
    }
    if (failCount > 0) {
      (error as any)(`Failed to send email for ${failCount} booking${failCount > 1 ? 's' : ''}`);
    }
  }, [success, error]);

  const handleRoomAssignment = useCallback(async (bookingId, roomNumber, upgradeFee = 0) => {
    const result = await assignRoom(bookingId, roomNumber);
    if (result.success) {
      success(`Room ${roomNumber} assigned successfully`);

      if (selectedBooking && selectedBooking.id === bookingId) {
        const updated = bookings.find(b => b.id === bookingId);
        if (updated) {
          setSelectedBooking({ ...updated });
        }
      }

      if (upgradeFee > 0) {
        updateBooking(bookingId, {
          amount: selectedBooking.amount + upgradeFee,
          balance: selectedBooking.balance + upgradeFee
        });
      }

      // Close both modals on successful assignment
      setIsAssignRoomModalOpen(false);
      setIsDrawerOpen(false);
      setSelectedBooking(null);
      setAIInsights([]);
    } else {
      error(result.error || 'Failed to assign room');
      setIsAssignRoomModalOpen(false);
    }
  }, [assignRoom, success, error, selectedBooking, bookings, updateBooking]);

  const handleUpdateBooking = useCallback((bookingId, updates) => {
    updateBooking(bookingId, updates);
    success('Booking updated successfully');

    if (selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking(prev => ({ ...prev, ...updates }));
    }
  }, [updateBooking, success, selectedBooking]);

  const handleCancelBooking = useCallback(() => {
    if (!selectedBooking) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Booking',
      message: `Are you sure you want to cancel booking ${selectedBooking.id} for ${selectedBooking.guestName}?`,
      variant: 'danger',
      onConfirm: () => {
        const previousStatus = selectedBooking.status;
        cancelBooking(selectedBooking.id, 'Cancelled by user');
        success('Booking cancelled successfully', {
          onUndo: () => {
            updateBookingStatus(selectedBooking.id, previousStatus);
          }
        });
        handleDrawerClose();
      }
    });
  }, [selectedBooking, cancelBooking, updateBookingStatus, success, handleDrawerClose]);

  const handleAddPayment = useCallback((bookingId, paymentData) => {
    addPayment(bookingId, paymentData);
    success(`Payment of $${paymentData.amount} added successfully`);

    const updated = bookings.find(b => b.id === bookingId);
    if (updated && selectedBooking && selectedBooking.id === bookingId) {
      setSelectedBooking({ ...updated });
    }
  }, [addPayment, success, bookings, selectedBooking]);

  const handleNotifyHousekeeping = useCallback((roomNumber) => {
    success(`Housekeeping notified for Room ${roomNumber}`);
  }, [success]);

  const getConflictingRooms = useCallback(() => {
    if (!selectedBooking) return [];
    return bookings
      .filter(b =>
        b.id !== selectedBooking.id &&
        b.roomNumber &&
        b.status !== 'CANCELLED' &&
        b.status !== 'CHECKED-OUT' &&
        new Date(b.checkIn) < new Date(selectedBooking.checkOut) &&
        new Date(b.checkOut) > new Date(selectedBooking.checkIn)
      )
      .map(b => b.roomNumber);
  }, [selectedBooking, bookings]);

  const getAvailableRoomsForNewBooking = useCallback((checkIn, checkOut) => {
    if (!checkIn || !checkOut) return [];
    return getAvailableRooms(checkIn, checkOut);
  }, [getAvailableRooms]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <main className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6">

        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Bookings
            </h1>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
              Manage reservations and room assignments
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleNewBooking}
            className="text-[12px] sm:text-[13px]"
          >
            <span className="hidden sm:inline">New Booking</span>
            <span className="sm:hidden">New</span>
          </Button>
        </header>

        {/* Bookings List */}
        <section>
          <BookingList
            bookings={bookings}
            onBookingClick={handleBookingClick}
            onStatusChange={handleStatusChange}
            onAssignRoom={handleQuickAssignRoom}
            onCheckIn={handleQuickCheckIn}
            onCheckOut={handleQuickCheckOut}
            onCancel={handleQuickCancel}
            onSendEmail={handleSendEmail}
            isDark={isDark}
            initialTab={initialTab}
            showCreateButton={false}
          />
        </section>
      </main>

      {/* Booking Drawer */}
      <BookingDrawer
        booking={selectedBooking}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onStatusChange={handleStatusChange}
        onUpdateBooking={handleUpdateBooking}
        onAssignRoom={handleAssignRoom}
        onCancelBooking={handleCancelBooking}
        onAddPayment={handleAddPayment}
        aiInsights={aiInsights}
      />

      {/* New Booking Drawer */}
      <NewBookingDrawer
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onSubmit={handleNewBookingSubmit}
        availableRooms={getAvailableRoomsForNewBooking(
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 86400000).toISOString().split('T')[0]
        )}
        getAvailableRooms={getAvailableRoomsForNewBooking}
        getRateForBooking={getRateForBooking}
      />

      {/* Assign Room Modal */}
      <AssignRoomModal
        isOpen={isAssignRoomModalOpen}
        onClose={() => setIsAssignRoomModalOpen(false)}
        booking={selectedBooking}
        availableRooms={availableRoomsForAssignment}
        conflictingRooms={getConflictingRooms()}
        onAssign={handleRoomAssignment}
        onNotifyHousekeeping={handleNotifyHousekeeping}
        hideBackdrop={isDrawerOpen}
      />

      {/* Check-In Drawer */}
      <CheckInDrawer
        isOpen={isCheckInDrawerOpen}
        onClose={() => {
          setIsCheckInDrawerOpen(false);
          setCheckInBooking(null);
        }}
        booking={checkInBooking}
        onCheckInComplete={handleCheckInComplete}
        onGuestUpdated={refreshBookings}
      />

      {/* Confirm Dialog */}
      <ConfirmModal
        open={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        description={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Checkout Emotion Modal */}
      <CheckoutEmotionModal
        open={!!checkoutBooking}
        onClose={() => setCheckoutBooking(null)}
        onConfirm={handleCheckoutWithEmotion}
        guestName={checkoutBooking?.guestName || ''}
        loading={checkoutLoading}
      />
    </div>
  );
}
