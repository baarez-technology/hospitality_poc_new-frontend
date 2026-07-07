import { useState, useMemo, useEffect, useCallback, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Download, Calendar } from 'lucide-react';
import DatePicker from '../../components/ui2/DatePicker';
import Tabs from '../../components/bookings/Tabs';
import SearchBar from '../../components/bookings/SearchBar';
import FiltersBar from '../../components/bookings/FiltersBar';
import BookingsTable from '../../components/bookings/BookingsTable';
import BookingDrawer from '../../components/bookings/BookingDrawer';
import AddBookingModal from '../../components/modals/AddBookingModal';
import Pagination from '../../components/bookings/Pagination';
import EditBookingModal from '../../components/bookings/EditBookingModal';
import AssignRoomModal from '../../components/modals/AssignRoomModal';
import CancelBookingModal from '../../components/bookings/CancelBookingModal';
import RequestCleaningModal from '../../components/modals/RequestCleaningModal';
import CheckInDrawer from '../../components/bookings/CheckInDrawer';
import CheckoutDialog from '../../components/bookings/CheckoutDialog';
import FolioDrawer from '../../components/folio/FolioDrawer';
import CheckoutEmotionModal from '../../components/cbs/CheckoutEmotionModal';
import GuestBillModal from '../../components/bookings/GuestBillModal';
import { useBookings } from '../../hooks/admin/useBookings';
import { guestsService } from '../../api/services/guests.service';
import { frontdeskService } from '../../api/services/frontdesk.service';
import { useSort } from '../../hooks/useSort';
import { CANCELLATION_REASONS } from '../../utils/bookings';
import { Button } from '../../components/ui2/Button';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { useBookingsSSE } from '../../hooks/useBookingsSSE';
import { AuthContext } from '../../contexts/AuthContext';

// Local filter functions
function filterByStatus(bookings: any[], status: string) {
  if (status === 'all') return bookings;
  // Direct comparison - status values are transformed by useBookings mapApiStatus
  return bookings.filter(b => {
    const bookingStatus = b.status || '';
    // Exact match first
    if (bookingStatus === status) return true;
    // Case-insensitive fallback
    return bookingStatus.toUpperCase() === status.toUpperCase();
  });
}

function filterBySource(bookings: any[], source: string) {
  if (source === 'all') return bookings;
  // Case-insensitive comparison - API returns bookingSource field
  const normalizedSource = source.toLowerCase();
  return bookings.filter(b => {
    const bookingSource = (b.bookingSource || b.source || '').toLowerCase();
    return bookingSource === normalizedSource;
  });
}

function filterByDateRange(bookings: any[], dateFrom: string, dateTo: string, dateType: 'checkin' | 'checkout' = 'checkin') {
  return bookings.filter(b => {
    const dateField = dateType === 'checkout' ? b.checkOut : b.checkIn;
    if (dateFrom && dateField < dateFrom) return false;
    if (dateTo && dateField > dateTo) return false;
    return true;
  });
}

function searchBookings(bookings: any[], query: string) {
  if (!query) return bookings;
  const q = query.toLowerCase();
  return bookings.filter(b =>
    b.guest?.toLowerCase().includes(q) ||
    b.bookingNumber?.toLowerCase().includes(q) ||
    String(b.id).toLowerCase().includes(q) ||
    b.room?.toLowerCase().includes(q)
  );
}

// Date-range export dropdown
function ExportRange({ onExport }: { onExport: (from: string, to: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click — ignore clicks inside Radix popovers (DatePicker calendar)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const radixPopover = document.querySelector('[data-radix-popper-content-wrapper]');
      if (radixPopover && radixPopover.contains(event.target as Node)) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyPreset = (preset: 'today' | 'week' | 'month') => {
    const today = new Date();
    const fmt = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    if (preset === 'today') {
      setFrom(fmt(today));
      setTo(fmt(today));
    } else if (preset === 'week') {
      setFrom(fmt(today));
      setTo(fmt(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6)));
    } else {
      setFrom(fmt(new Date(today.getFullYear(), today.getMonth(), 1)));
      setTo(fmt(new Date(today.getFullYear(), today.getMonth() + 1, 0)));
    }
  };

  const handleExport = () => {
    if (!from || !to) return;
    onExport(from, to);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="outline-neutral" icon={Download} onClick={() => setIsOpen(!isOpen)}>
        Export
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden w-[320px]">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
              <Calendar className="w-3.5 h-3.5 text-terra-500" />
              Check-in Date Range
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-neutral-600">From</label>
                <DatePicker value={from} onChange={setFrom} placeholder="Select start date" className="w-full" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-neutral-600">To</label>
                <DatePicker value={to} onChange={setTo} placeholder="Select end date" minDate={from || undefined} className="w-full" />
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-2">
                Quick Select
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  { label: 'Today', key: 'today' as const },
                  { label: 'This Week', key: 'week' as const },
                  { label: 'This Month', key: 'month' as const },
                ]).map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset.key)}
                    className="px-2.5 py-1 text-[11px] font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-neutral-100 bg-neutral-50/50">
            <button
              type="button"
              onClick={() => { setFrom(''); setTo(''); }}
              className="px-3 py-1.5 text-[12px] font-medium text-neutral-600 hover:text-neutral-800 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!from || !to}
              className="px-3 py-1.5 text-[12px] font-medium text-white bg-terra-500 hover:bg-terra-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick Actions Component
function QuickActions({
  onNewBooking,
  onExportRange,
}: {
  onNewBooking: () => void;
  onExportRange: (from: string, to: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <ExportRange onExport={onExportRange} />
      <Button variant="primary" icon={Plus} onClick={onNewBooking}>
        New Booking
      </Button>
    </div>
  );
}

export default function Bookings() {
  const { isDark } = useTheme();
  const location = useLocation();
  const nav = useNavigate();

  // Auth context — used to detect devmaster account
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const isDevMaster = (currentUser?.email || '').toLowerCase() === 'devmaster@dev.in'
    || (currentUser?.role || '').toLowerCase() === 'devmaster';

  // Use admin bookings hook for API integration
  const {
    bookings: bookingsData,
    isLoading,
    pagination,
    createBooking,
    updateBooking,
    updateStatus,
    assignRoom,
    cancelBooking,
    deleteBooking,
    checkInGuest,
    cancelCheckIn,
    checkOutGuest,
    moveRoom,
    markNoShow,
    reinstate,
    getArrivalsToday,
    getDeparturesToday,
    fetchBookings,
    refreshBookings,
    goToPage,
    nextPage,
    prevPage,
  } = useBookings(10); // 10 items per page for server-side pagination

  // Tab state
  const [activeTab, setActiveTab] = useState('all');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filters state
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Date filter type (checkin or checkout)
  const [dateFilterType, setDateFilterType] = useState<'checkin' | 'checkout'>('checkin');

  // Drawer state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modal states
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [isEditBookingModalOpen, setIsEditBookingModalOpen] = useState(false);
  const [isAssignRoomModalOpen, setIsAssignRoomModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [pendingCheckInAfterAssign, setPendingCheckInAfterAssign] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Request Cleaning state
  const [cleaningBooking, setCleaningBooking] = useState<any>(null);

  // Check-in drawer state
  const [checkInBooking, setCheckInBooking] = useState<any>(null);
  const [isCheckInDrawerOpen, setIsCheckInDrawerOpen] = useState(false);


  // Toast state
  const [toast, setToast] = useState<{ message: string } | null>(null);


  // Checkout dialog state
  const [checkoutDialogBooking, setCheckoutDialogBooking] = useState<any>(null);

  // Folio drawer state (opened from checkout dialog or manage payment)
  const [folioDrawerBooking, setFolioDrawerBooking] = useState<any>(null);

  // Guest bill modal state
  const [billBooking, setBillBooking] = useState<any>(null);

  // Checkout emotion modal state
  const [checkoutBooking, setCheckoutBooking] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      source: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  // Handle booking click (view details)
  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  // Handle view from action button
  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setIsDrawerOpen(true);
  };

  // Handle edit from action button (direct to edit modal)
  const handleEditFromAction = (booking) => {
    setSelectedBooking(booking);
    setIsEditBookingModalOpen(true);
  };

  // Handle assign room from action button
  const handleAssignRoomFromAction = (booking) => {
    setSelectedBooking(booking);
    setIsAssignRoomModalOpen(true);
  };

  // Handle cancel from action button
  const handleCancelFromAction = (booking) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  // Handle request cleaning from action button
  const handleRequestCleaningFromAction = (booking) => {
    setCleaningBooking(booking);
  };

  // Handle manage payment from action button — opens FolioDrawer (Opera-style folio management)
  const handleManagePaymentFromAction = (booking) => {
    setFolioDrawerBooking(booking);
  };

  // Handle check-in from action button — opens drawer (or assign room first if none)
  const handleCheckInFromAction = (booking) => {
    if (!booking?.id) return;
    const hasRoom = booking.room && booking.room !== 'Unassigned' && booking.room !== 'Not assigned';
    if (!hasRoom) {
      // No room assigned — open assign room modal first, then auto-open check-in
      setSelectedBooking(booking);
      setIsAssignRoomModalOpen(true);
      setPendingCheckInAfterAssign(true);
      return;
    }
    setCheckInBooking(booking);
    setIsCheckInDrawerOpen(true);
  };

  // Called when check-in drawer completes
  const handleCheckInComplete = async (bookingId: string, data: any) => {
    const success = await checkInGuest(bookingId, data);
    if (success) {
      setSelectedBooking((prev) =>
        prev && prev.id === bookingId ? { ...prev, status: 'IN_HOUSE' } : prev
      );
      triggerToast(`${checkInBooking?.guest || 'Guest'} checked in successfully`);
    }
    return success;
  };

  // Handle check-out from action button — opens CheckoutDialog with folio balance gate
  const handleCheckOutFromAction = (booking: any) => {
    if (!booking?.id) return;
    setCheckoutDialogBooking(booking);
  };

  // Actual checkout execution (called by CheckoutDialog)
  // After successful checkout, opens the emotion modal for guest experience feedback.
  const executeCheckout = async (force = false): Promise<boolean> => {
    const booking = checkoutDialogBooking;
    if (!booking?.id) return false;
    const updatedBooking = await checkOutGuest(booking.id, force ? { force_checkout: true } : undefined);
    if (updatedBooking) {
      setSelectedBooking((prev: any) =>
        prev && prev.id === booking.id ? { ...updatedBooking, status: 'COMPLETED' } : prev
      );
      // Open guest experience emotion modal with updated booking data (reflects early checkout date)
      setCheckoutBooking(updatedBooking);
    }
    return !!updatedBooking;
  };

  // Handle cancel check-in from action button
  const handleCancelCheckInFromAction = async (booking) => {
    if (!booking?.id) return;
    const confirmed = window.confirm(
      `Cancel check-in for ${booking.guest}? This will revert the booking to confirmed status and free the room.`
    );
    if (!confirmed) return;

    const success = await cancelCheckIn(booking.id);
    if (success) {
      setSelectedBooking((prev) =>
        prev && prev.id === booking.id
          ? { ...prev, status: 'CONFIRMED', room: 'Unassigned', roomId: null }
          : prev
      );
      triggerToast('Check-in cancelled successfully');
    }
  };

  // Handle mark no-show from action button
  const handleMarkNoShowFromAction = async (booking) => {
    if (!booking?.id) return;
    const confirmed = window.confirm(
      `Mark ${booking.guest} as No Show? This will free any assigned room and the booking cannot be checked in.`
    );
    if (!confirmed) return;

    const success = await markNoShow(booking.id);
    if (success) {
      setSelectedBooking((prev) =>
        prev && prev.id === booking.id ? { ...prev, status: 'NO_SHOW' } : prev
      );
      triggerToast(`${booking.guest} marked as No Show`);
    }
  };

  // Handle view guest bill
  const handleViewBillFromAction = (booking) => {
    if (!booking?.id) return;
    setBillBooking(booking);
  };

  // Handle reinstate from action button
  const handleReinstateFromAction = async (booking) => {
    if (!booking?.id) return;
    const confirmed = window.confirm(
      `Reinstate booking for ${booking.guest}? This will restore the booking to confirmed status.`
    );
    if (!confirmed) return;

    const success = await reinstate(booking.id);
    if (success) {
      setSelectedBooking((prev) =>
        prev && prev.id === booking.id ? { ...prev, status: 'CONFIRMED' } : prev
      );
      triggerToast(`${booking.guest} booking reinstated`);
    }
  };

  // Handle permanent delete — devmaster only
  const handleDeleteBooking = async (booking) => {
    if (!booking?.id) return;
    const confirmed = window.confirm(
      `⚠️ PERMANENT DELETE\n\nThis will permanently remove booking ${booking.bookingNumber || booking.id} for ${booking.guest} from the database.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure?`
    );
    if (!confirmed) return;

    const success = await deleteBooking(String(booking.id));
    if (success) {
      setIsDrawerOpen(false);
      setSelectedBooking(null);
    }
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedBooking(null), 300);
  };

  // Handle new booking
  const handleNewBooking = () => {
    setIsAddBookingModalOpen(true);
  };

  // Handle booking submission
  const handleBookingSubmit = async (bookingData) => {
    setIsCreating(true);
    try {
      await createBooking(bookingData);
      setIsAddBookingModalOpen(false);
      // Toast is already shown by createBooking in useBookings
    } catch (error) {
      // Error toast is already shown by createBooking in useBookings
    } finally {
      setIsCreating(false);
    }
  };

  // Handle status change — intercept CHECKED-OUT to show emotion modal
  const handleStatusChange = (bookingId: string, newStatus: string) => {
    if (newStatus === 'CHECKED-OUT') {
      // Find the booking to get guestId and guestName
      const booking = bookingsData.find((b: any) => String(b.id) === String(bookingId));
      setCheckoutBooking(booking || { id: bookingId, guest: 'Guest' });
      return;
    }

    updateStatus(bookingId, newStatus);
    setSelectedBooking((prev: any) => {
      if (prev && prev.id === bookingId) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });
    triggerToast('Status updated successfully');
  };

  // Handle checkout with emotion from modal
  const handleCheckoutWithEmotion = useCallback(async (emotion?: string, _notes?: string) => {
    if (!checkoutBooking) return;

    setCheckoutLoading(true);
    try {
      // Save guest emotion if provided and guestId is available
      if (emotion && checkoutBooking.guestId) {
        try {
          await guestsService.update(checkoutBooking.guestId, { emotion });
        } catch (err) {
          console.error('Failed to update guest emotion:', err);
        }
      }

      // If checkout was already done (via CheckoutDialog), just save emotion and close.
      // If triggered from status dropdown, also perform the status update.
      const statusNorm = (checkoutBooking.status || '').toUpperCase().replace(/[\s_]/g, '-');
      const alreadyCheckedOut = statusNorm === 'CHECKED-OUT' || statusNorm === 'COMPLETED';
      if (!alreadyCheckedOut) {
        updateStatus(checkoutBooking.id, 'CHECKED-OUT');
        setSelectedBooking((prev: any) => {
          if (prev && prev.id === checkoutBooking.id) {
            return { ...prev, status: 'CHECKED-OUT' };
          }
          return prev;
        });
      }

      triggerToast(emotion
        ? `${checkoutBooking.guest || 'Guest'} checked out — experience: ${emotion}`
        : `${checkoutBooking.guest || 'Guest'} checked out successfully`
      );
    } finally {
      setCheckoutLoading(false);
      setCheckoutBooking(null);
    }
  }, [checkoutBooking, updateStatus]);

  // Toast helper
  const triggerToast = (message) => {
    setToast({ message });
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Fetch all posted folio charges (room + extras like food/laundry/minibar) for a booking.
  // Returns the folio charge lines, folio identifiers and payments, or null if the folio
  // could not be fetched.
  interface BookingBill {
    charges: any[];
    folioNumbers: string[];
    amountPaid: number;
  }
  const fetchBookingCharges = async (b: any): Promise<BookingBill | null> => {
    try {
      const data: any = await frontdeskService.getGuestBill(Number(b.id));
      const charges: any[] = [];
      const folioNumbers: string[] = [];
      let amountPaid = 0;
      if (data?.folios && Array.isArray(data.folios)) {
        data.folios.forEach((folio: any) => {
          if (folio.folio_number) folioNumbers.push(String(folio.folio_number));
          (folio.charges || []).forEach((c: any) => {
            charges.push({
              date: c.date || '',
              description: c.description || '',
              category: c.category || c.item_type || '',
              amount: c.amount ?? '',
              tax: c.tax ?? c.tax_amount ?? 0,
              total: c.total ?? (Number(c.amount || 0) + Number(c.tax ?? c.tax_amount ?? 0)),
              cgst: c.tax_component_1_amount ?? 0,
              sgst: c.tax_component_2_amount ?? 0,
              window: folio.window || folio.type || '',
            });
          });
          (folio.payments || []).forEach((p: any) => {
            amountPaid += Number(p.amount) || 0;
          });
        });
      }
      return { charges, folioNumbers, amountPaid };
    } catch (err) {
      console.error('[Bookings] Failed to fetch charges for booking', b.id, err);
      return null;
    }
  };

  // Run async tasks with a bounded concurrency so a large range doesn't fire
  // hundreds of simultaneous requests.
  const mapWithConcurrency = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
    const results: R[] = new Array(items.length);
    let cursor = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const i = cursor++;
        results[i] = await fn(items[i]);
      }
    });
    await Promise.all(workers);
    return results;
  };

  // CSV Export Utility — one row per booking. Posted folio charges are summarized
  // into a single itemized cell plus subtotal/tax/total sums so each guest's stay
  // appears on a single line.
  const exportToCSV = async (bookingsToExport: any[], filename: string) => {
    if (bookingsToExport.length === 0) {
      triggerToast('No bookings found for the selected period');
      return;
    }

    triggerToast(`Preparing export for ${bookingsToExport.length} booking(s)…`);

    const headers = [
      'Booking ID',
      'Booking Number',
      'Folio Number',
      'Guest Name',
      'Email',
      'Phone',
      'Room',
      'Room Type',
      'Check In',
      'Check Out',
      'Nights',
      'Pax',
      'Status',
      'Source',
      'Charges (Itemized)',
      'Charges Subtotal',
      'CGST',
      'SGST',
      'Tax Total',
      'Charges Total',
      'Booking Total',
      'Amount Paid',
      'Balance Due',
      'Company Name',
      'Company Address',
      'GST Number'
    ];

    // Fetch posted charges for every booking (bounded concurrency)
    const allCharges = await mapWithConcurrency(bookingsToExport, 8, fetchBookingCharges);

    const csvRows = [headers.join(',')];
    const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const round2 = (n: number) => Math.round(n * 100) / 100;

    // Nights shown in the UI = whole days between check-in and check-out (min 1),
    // falling back to the stored booking value. Keeps the export in sync with billing.
    const computeNights = (b: any): number => {
      const stored = num(b.nights);
      if (stored > 0) return stored;
      const ci = b.checkIn ? new Date(b.checkIn) : null;
      const co = b.checkOut ? new Date(b.checkOut) : null;
      if (ci && co && !isNaN(ci.getTime()) && !isNaN(co.getTime())) {
        const diff = Math.round((co.getTime() - ci.getTime()) / 86400000);
        if (diff > 0) return diff;
      }
      return 1;
    };

    bookingsToExport.forEach((b: any, i: number) => {
      const bill = allCharges[i];
      const nights = computeNights(b);
      let charges = bill?.charges;
      const folioNumbers = bill?.folioNumbers || [];
      const hasFolio = !!charges && charges.length > 0;

      // Fallback: no folio yet (e.g. not checked in) — synthesize a single room-charge row
      if (!charges || charges.length === 0) {
        const base = num(b.basePrice ?? b.base_price);
        const tax = num(b.taxes);
        charges = [{
          date: b.checkIn || '',
          description: `Room Charges (${nights} night${nights > 1 ? 's' : ''})`,
          category: 'room',
          amount: base,
          tax,
          total: round2(base + tax),
          cgst: round2(tax / 2),
          sgst: round2(tax / 2),
          window: '',
        }];
      }

      // Collapse all charge lines into one itemized cell. Standalone 'tax' lines are
      // excluded — their value is reported in the CGST/SGST/Tax Total columns instead,
      // so the itemized list mirrors the Billing & Folio screen (no duplicate GST rows).
      const itemized = charges
        .filter((c: any) => c.category !== 'tax')
        .map((c: any) => {
          const desc = c.description || c.category || 'Charge';
          const amt = c.total ?? c.amount;
          return amt !== '' && amt != null ? `${desc} (${amt})` : desc;
        })
        .join(' | ');

      // Tax is stored twice by the folio engine: embedded as tax_amount on each charge
      // AND as standalone 'tax' line items. Summing both double-counts GST (the old bug:
      // subtotal 1575 / total 1650). Mirror the folio UI's taxSummary — prefer the
      // standalone tax lines when present, otherwise fall back to embedded tax.
      const hasSeparateTaxItems = charges.some((c: any) => c.category === 'tax' && num(c.amount) !== 0);
      let chargesSubtotal = 0;
      let taxFromSeparate = 0, taxFromEmbedded = 0;
      let cgstSeparate = 0, sgstSeparate = 0, cgstEmbedded = 0, sgstEmbedded = 0;
      for (const c of charges) {
        if (c.category === 'tax' || c.category === 'tax_rebate') {
          taxFromSeparate += num(c.amount);
          cgstSeparate += num(c.cgst);
          sgstSeparate += num(c.sgst);
          continue;
        }
        // Real charges and discounts contribute their (signed) amount to the subtotal.
        chargesSubtotal += num(c.amount);
        taxFromEmbedded += num(c.tax);
        cgstEmbedded += num(c.cgst);
        sgstEmbedded += num(c.sgst);
      }
      chargesSubtotal = round2(chargesSubtotal);
      const taxTotal = round2(hasSeparateTaxItems ? taxFromSeparate : taxFromEmbedded);
      let cgst = round2(hasSeparateTaxItems ? cgstSeparate : cgstEmbedded);
      let sgst = round2(hasSeparateTaxItems ? sgstSeparate : sgstEmbedded);
      // Guarantee CGST + SGST = Tax Total. If the component breakdown is missing/partial,
      // split GST evenly (CGST = SGST) as this hotel charges intra-state GST.
      if (taxTotal !== 0 && round2(cgst + sgst) !== taxTotal) {
        cgst = round2(taxTotal / 2);
        sgst = round2(taxTotal - cgst);
      }

      // Enforce the invariants so the export is always internally consistent:
      //   Charges Total = Charges Subtotal + Tax Total
      //   Booking Total = Charges Total
      //   Balance Due   = Booking Total - Amount Paid
      const chargesTotal = round2(chargesSubtotal + taxTotal);
      const bookingTotal = chargesTotal;
      // Amount paid comes from folio payments; if there's no folio yet, fall back to any
      // deposit recorded on the booking so the balance still reconciles.
      const amountPaid = round2(hasFolio ? num(bill?.amountPaid) : num(b.amountPaid ?? b.deposit));
      const balanceDue = round2(bookingTotal - amountPaid);

      const values = [
        b.id || '',
        b.bookingNumber || '',
        folioNumbers.join(' | '),
        b.guest || '',
        b.guestEmail || b.email || '',
        b.guestPhone || b.phone || '',
        b.room || '',
        b.roomType || '',
        b.checkIn || '',
        b.checkOut || '',
        nights,
        b.guests || '0',
        b.status || '',
        b.source || '',
        itemized,
        chargesSubtotal,
        cgst,
        sgst,
        taxTotal,
        chargesTotal,
        bookingTotal,
        amountPaid,
        balanceDue,
        b.companyName || b.corporateAccountName || '',
        b.companyAddress || '',
        b.gstNumber || ''
      ];

      const escaped = values.map(val => {
        const s = String(val).replace(/"/g, '""');
        return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
      });

      csvRows.push(escaped.join(','));
    });

    // Prepend a UTF-8 BOM so Excel decodes the file as UTF-8 (otherwise it assumes the
    // system ANSI codepage and mangles characters like "–" → "â€“" and "₹").
    const csvContent = '\uFEFF' + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportRange = (from: string, to: string) => {
    if (!from || !to) return;
    // checkIn is an ISO YYYY-MM-DD string, so lexical comparison matches date order.
    const rangeBookings = (bookingsData || []).filter((b: any) => {
      const checkIn = b.checkIn || '';
      return checkIn >= from && checkIn <= to;
    });
    void exportToCSV(rangeBookings, `bookings_${from}_to_${to}.csv`);
  };

  // Open edit booking modal
  const openEditBookingModal = () => {
    if (!selectedBooking) return;
    setIsEditBookingModalOpen(true);
  };

  // Close edit booking modal
  const closeEditBookingModal = () => {
    setIsEditBookingModalOpen(false);
  };

  // Open assign room modal
  const openAssignRoomModal = () => {
    if (!selectedBooking) return;
    setIsAssignRoomModalOpen(true);
  };

  // Close assign room modal
  const closeAssignRoomModal = () => {
    setIsAssignRoomModalOpen(false);
    setPendingCheckInAfterAssign(false);
  };

  // Open cancel modal
  const openCancelModal = () => {
    if (!selectedBooking) return;
    setIsCancelModalOpen(true);
  };

  // Close cancel modal
  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
  };

  // Handle booking edit save
  const handleBookingEditSave = async (updatedFields) => {
    if (!selectedBooking) return;
    setIsEditing(true);
    try {
      const result = await updateBooking(selectedBooking.id, updatedFields);
      if (result) {
        setSelectedBooking({ ...selectedBooking, ...result });
        triggerToast('Booking updated successfully');
        closeEditBookingModal();
      }
    } catch (error) {
      triggerToast('Failed to update booking');
    } finally {
      setIsEditing(false);
    }
  };

  // Handle room assignment (or room move for checked-in bookings)
  const handleRoomAssign = async (room) => {
    if (!selectedBooking || !room) return;
    setIsAssigning(true);

    const isCheckedIn = selectedBooking.status === 'IN_HOUSE' || selectedBooking.status === 'CHECKED-IN';

    try {
      if (isCheckedIn) {
        // Use room-change endpoint for checked-in guests (proper room move)
        const result = await moveRoom(selectedBooking.id, room.id, room.moveReason || 'Room move via admin dashboard');
        if (result) {
          setSelectedBooking({
            ...selectedBooking,
            room: room.roomNumber,
            roomType: room.type,
            roomId: room.id,
          });
          triggerToast(`Room moved to ${room.roomNumber} successfully`);
          closeAssignRoomModal();
        }
      } else {
        // Standard room assignment for pre-check-in bookings
        const success = await assignRoom(selectedBooking.id, room.id, room.roomNumber, selectedBooking.checkIn);
        if (success) {
          const updatedBooking = {
            ...selectedBooking,
            room: room.roomNumber,
            roomType: room.type,
            roomId: room.id,
          };
          setSelectedBooking(updatedBooking);
          triggerToast(`Room ${room.roomNumber} assigned successfully`);
          closeAssignRoomModal();

          // If user was trying to check in, auto-open check-in drawer now
          if (pendingCheckInAfterAssign) {
            setPendingCheckInAfterAssign(false);
            setCheckInBooking(updatedBooking);
            setIsCheckInDrawerOpen(true);
          }
        }
      }
    } catch (error) {
      triggerToast('Failed to assign room');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle cancel booking with reason
  const handleCancelBooking = async ({ bookingId, reason, notes }) => {
    setIsCancelling(true);
    try {
      const reasonLabel = CANCELLATION_REASONS.find(r => r.value === reason)?.label || reason;
      const success = await cancelBooking(bookingId, reasonLabel, notes);

      if (success) {
        // Update selected booking
        setSelectedBooking((prev) => {
          if (prev && prev.id === bookingId) {
            return {
              ...prev,
              status: 'CANCELLED',
              cancellationReason: reasonLabel,
              cancellationNotes: notes,
            };
          }
          return prev;
        });

        triggerToast('Booking cancelled successfully');
        closeCancelModal();
      }
    } catch (error) {
      triggerToast('Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  // Data processing pipeline
  // Step 1: Apply tab filter
  const tabFilteredData = useMemo(() => {
    if (activeTab === 'arrivals') {
      return getArrivalsToday();
    } else if (activeTab === 'departures') {
      return getDeparturesToday();
    } else if (activeTab === 'inhouse') {
      // Filter for guests currently checked in (in-house)
      // API returns lowercase with hyphen: "checked-in"
      return bookingsData.filter(booking => {
        const status = booking.status?.toLowerCase();
        return status === 'checked-in' || status === 'in-house' || status === 'in_house';
      });
    }
    return [...bookingsData];
  }, [activeTab, bookingsData, getArrivalsToday, getDeparturesToday]);

  // Step 2: Apply filters
  const filteredData = useMemo(() => {
    let result = [...tabFilteredData];
    result = filterByStatus(result, filters.status);
    result = filterBySource(result, filters.source);
    result = filterByDateRange(result, filters.dateFrom, filters.dateTo, dateFilterType);
    return result;
  }, [tabFilteredData, filters, dateFilterType]);

  // Step 3: Apply search
  const searchedData = useMemo(() => {
    return searchBookings(filteredData, searchQuery);
  }, [filteredData, searchQuery]);

  // Step 4: Apply sorting - Default: most recent check-in first
  const { sortedData, sortConfig, handleSort } = useSort(searchedData, 'checkIn', 'desc');

  // SSE Integration for real-time booking updates
  useBookingsSSE({
    onBookingCreated: (bookingData) => {
      console.log('[Admin Bookings] 🎉 New booking received via SSE:', bookingData);
      // Refetch bookings to get the new record
      if (fetchBookings) {
        fetchBookings();
      }
    },
    refetchBookings: fetchBookings,
  });

  // Step 5: Server-side pagination (data already paginated from API)
  // For local filtering/sorting on paginated data, we show all items from current page
  const currentPageData = sortedData;
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const totalItems = pagination.total;
  const startIndex = (pagination.page - 1) * pagination.pageSize + 1;
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.total);
  const canGoPrev = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  // Auto-switch tab when navigating from Dashboard quick actions (e.g. Check-in → arrivals)
  useEffect(() => {
    const state = location.state as { tab?: string; bookingId?: string } | null;
    if (state?.tab && ['all', 'inhouse', 'arrivals', 'departures'].includes(state.tab)) {
      setActiveTab(state.tab);
    }
  }, [location.state]);

  // Auto-open booking drawer when navigating from a notification with bookingId
  useEffect(() => {
    const state = location.state as { bookingId?: string } | null;
    if (state?.bookingId && sortedData.length > 0) {
      const bookingId = String(state.bookingId);
      const booking = sortedData.find(
        (b: any) => String(b.id) === bookingId
          || String(b.bookingNumber) === bookingId
          || String(b.bookingNumber).replace(/^BK-/i, '') === bookingId
      );
      if (booking) {
        setSelectedBooking(booking);
        setIsDrawerOpen(true);
      }
      // Clear navigation state so refresh doesn't re-trigger
      nav(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, sortedData]);

  return (
    <div className={cn(
      "min-h-screen transition-colors",
      isDark ? "bg-neutral-900" : "bg-[#F9F7F7]"
    )}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">Bookings</h1>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 font-medium mt-0.5">
            Manage reservations, availability, and guest information.
          </p>
        </div>
        <QuickActions
          onNewBooking={handleNewBooking}
          onExportRange={handleExportRange}
        />
      </header>

      {/* Main Bookings Card (CMS-consistent) */}
      <div className="bg-white rounded-[10px] overflow-hidden">
        {/* Tabs + Actions */}
        <div className="border-b border-neutral-100">
          <div className="px-3 sm:px-6 pt-3 sm:pt-4 flex items-center justify-between overflow-x-auto">
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-full sm:flex-1 sm:max-w-md">
              <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} />
            </div>
            <div className="hidden sm:block sm:flex-1" />
            <FiltersBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              dateFilterType={dateFilterType}
              onDateFilterTypeChange={setDateFilterType}
            />
          </div>
        </div>

        {/* Bookings Table */}
        <BookingsTable
          activeTab={activeTab}
          bookings={currentPageData}
          isLoading={isLoading}
          sortConfig={sortConfig}
          onSort={handleSort}
          onViewBooking={handleViewBooking}
          onEditBooking={handleEditFromAction}
          onAssignRoom={handleAssignRoomFromAction}
          onCancelBooking={handleCancelFromAction}
          onManagePayment={handleManagePaymentFromAction}
          onCheckIn={handleCheckInFromAction}
          onCheckOut={handleCheckOutFromAction}
          onCancelCheckIn={handleCancelCheckInFromAction}
          onMarkNoShow={handleMarkNoShowFromAction}
          onRequestCleaning={handleRequestCleaningFromAction}
          onReinstate={handleReinstateFromAction}
          onViewBill={handleViewBillFromAction}
          onDeleteBooking={isDevMaster ? handleDeleteBooking : undefined}
        />

        {/* Pagination */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={totalItems}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrevPage={() => prevPage()}
            onNextPage={() => nextPage()}
            onGoToPage={(page) => goToPage(page)}
          />
        </div>
      </div>

      {/* Booking Drawer */}
      <BookingDrawer
        booking={selectedBooking}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onStatusChange={handleStatusChange}
        onEditBooking={openEditBookingModal}
        onAssignRoom={openAssignRoomModal}
        onCancelBooking={openCancelModal}
        onCancelCheckIn={() => selectedBooking && handleCancelCheckInFromAction(selectedBooking)}
        onCheckIn={() => selectedBooking && handleCheckInFromAction(selectedBooking)}
        onCheckOut={() => selectedBooking && handleCheckOutFromAction(selectedBooking)}
        onMarkNoShow={() => selectedBooking && handleMarkNoShowFromAction(selectedBooking)}
        onRequestCleaning={() => selectedBooking && handleRequestCleaningFromAction(selectedBooking)}
        onOpenFolio={() => selectedBooking && setFolioDrawerBooking(selectedBooking)}
        onViewBill={() => selectedBooking && setBillBooking(selectedBooking)}
        onVipLevelChange={(bookingId: string, level: number | null) => {
          updateBooking(bookingId, { vipLevel: level });
          setSelectedBooking((prev: any) => prev && prev.id === bookingId ? { ...prev, vipLevel: level, vip: !!level } : prev);
        }}
        onDeleteBooking={isDevMaster ? handleDeleteBooking : undefined}
      />

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddBookingModalOpen}
        onClose={() => setIsAddBookingModalOpen(false)}
        onSubmit={handleBookingSubmit}
        isCreating={isCreating}
      />

      {/* Edit Booking Modal */}
      <EditBookingModal
        booking={selectedBooking}
        isOpen={isEditBookingModalOpen}
        onClose={closeEditBookingModal}
        onSave={handleBookingEditSave}
        isSaving={isEditing}
      />

      {/* Assign Room Modal */}
      <AssignRoomModal
        booking={selectedBooking}
        isOpen={isAssignRoomModalOpen}
        onClose={closeAssignRoomModal}
        onAssign={handleRoomAssign}
        isAssigning={isAssigning}
        bookings={bookingsData}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        booking={selectedBooking}
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        onConfirm={handleCancelBooking}
        isCancelling={isCancelling}
      />


      {/* Request Cleaning Modal */}
      <RequestCleaningModal
        isOpen={!!cleaningBooking}
        onClose={() => setCleaningBooking(null)}
        onSuccess={() => {
          triggerToast('Cleaning request submitted');
          setCleaningBooking(null);
        }}
        roomId={cleaningBooking?.roomId || 0}
        roomNumber={cleaningBooking?.room || ''}
        guestName={cleaningBooking?.guest}
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

      {/* Checkout Dialog — folio balance gate */}
      <CheckoutDialog
        isOpen={!!checkoutDialogBooking}
        booking={checkoutDialogBooking}
        onClose={() => setCheckoutDialogBooking(null)}
        onCheckout={executeCheckout}
        onOpenFolio={(booking: any) => setFolioDrawerBooking(booking)}
      />

      {/* Folio Drawer — opened from checkout dialog or manage payment */}
      <FolioDrawer
        isOpen={!!folioDrawerBooking}
        booking={folioDrawerBooking}
        onClose={() => setFolioDrawerBooking(null)}
        onPaymentUpdate={refreshBookings}
      />

      {/* Checkout Emotion Modal */}
      <CheckoutEmotionModal
        open={!!checkoutBooking}
        onClose={() => setCheckoutBooking(null)}
        onConfirm={handleCheckoutWithEmotion}
        guestName={checkoutBooking?.guest || checkoutBooking?.guestName || ''}
        loading={checkoutLoading}
      />

      {/* Guest Bill Modal */}
      <GuestBillModal
        isOpen={!!billBooking}
        bookingId={billBooking?.id}
        guestName={billBooking?.guest}
        booking={billBooking}
        onClose={() => setBillBooking(null)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[80]">
          <div className="px-4 py-3 rounded-[10px] bg-neutral-900 text-white shadow-xl flex items-center gap-2">
            <span className="text-xs sm:text-[13px] font-medium">{toast.message}</span>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
