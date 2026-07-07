/**
 * RoomMoves — Scheduled room moves with create, execute, and cancel actions.
 * Glimmora Design System v5.0
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowRightLeft, Plus, Play, XCircle, Search, Eye } from 'lucide-react';
import { roomMovesService, type RoomMove } from '@/api/services/room-moves.service';
import { bookingService } from '@/api/services/booking.service';
import { roomsService } from '@/api/services/rooms.service';
import { useToast } from '@/contexts/ToastContext';

// UI2 Components
import { ConfirmModal } from '@/components/ui2/Modal';
import { Drawer } from '@/components/ui2/Drawer';
import { Button, IconButton } from '@/components/ui2/Button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableActions, TableEmpty, TableSkeleton, Pagination,
} from '@/components/ui2/Table';
import { Badge } from '@/components/ui2/Badge';
import DatePicker from '@/components/ui2/DatePicker';
import { SearchBar } from '@/components/ui2/SearchBar';

const ensureUtc = (dateStr: string) => {
  if (!dateStr) return dateStr;
  return dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z';
};

// ── Status badge mapping ────────────────────────────────────────────────────
const STATUS_VARIANT: Record<string, 'info' | 'success' | 'neutral'> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'neutral',
};

// ── Filter options ──────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

// ── Input styles ────────────────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 hover:border-neutral-300 transition-all duration-150';
const labelCls = 'block text-[12px] font-semibold text-neutral-600 mb-1.5';

// ── FilterSelect (matches Bookings/Guests pattern) ──────────────────────────
function FilterSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (val: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = !value ? placeholder : selectedOption?.label || placeholder;
  const hasValue = !!value;

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-2.5 sm:px-3.5 rounded-lg text-xs sm:text-[13px] bg-white border transition-all duration-150 flex items-center gap-1.5 sm:gap-2 focus:outline-none w-full sm:min-w-[140px] ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : hasValue
              ? 'border-terra-300 bg-terra-50'
              : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={hasValue ? 'text-terra-700 font-medium' : 'text-neutral-500'}>
          {displayLabel}
        </span>
        <svg className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''} ${hasValue ? 'text-terra-500' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden min-w-[160px]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setIsOpen(false); }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                {option.label}
                {value === option.value && (
                  <svg className="w-4 h-4 text-terra-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── RoomSelect dropdown ──────────────────────────────────────────────────────
function RoomSelect({ value, onChange, rooms, placeholder, loading }: {
  value: string; onChange: (val: string) => void;
  rooms: any[]; placeholder: string; loading?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selected = rooms.find(r => String(r.id) === value);
  const filtered = rooms.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.number || r.roomNumber || '').toLowerCase().includes(q) ||
      (r.room_type || r.type || '').toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const getRoomLabel = (r: any) => {
    const num = r.number || r.roomNumber || `Room ${r.id}`;
    const type = r.room_type || r.type || '';
    return type ? `${num} — ${type}` : num;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { if (!loading) setIsOpen(!isOpen); }}
        className={`${inputCls} flex items-center justify-between text-left ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={selected ? 'text-neutral-900' : 'text-neutral-400'}>
          {loading ? 'Loading rooms…' : selected ? getRoomLabel(selected) : placeholder}
        </span>
        <svg className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setIsOpen(false); setSearch(''); }} />
          <div className="absolute left-0 right-0 z-50 mt-1 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden">
            {/* Search input */}
            <div className="p-2 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search room number or type…"
                  className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-terra-400"
                />
              </div>
            </div>
            {/* Options */}
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="px-3.5 py-3 text-[13px] text-neutral-400 text-center">No available rooms found</p>
              ) : filtered.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { onChange(String(r.id)); setIsOpen(false); setSearch(''); }}
                  className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center justify-between ${
                    String(r.id) === value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                  }`}
                >
                  <span className="font-medium">{r.number || r.roomNumber || `Room ${r.id}`}</span>
                  <span className="text-[11px] text-neutral-500 ml-2">{r.room_type || r.type || ''}</span>
                  {String(r.id) === value && (
                    <svg className="w-4 h-4 text-terra-500 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Create Drawer ───────────────────────────────────────────────────────────
function CreateDrawer({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void;
  onSave: (data: { booking_id: number; to_room_id: number; scheduled_date: string; move_reason?: string; notes?: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({ booking_id: '', to_room_id: '', scheduled_date: '', move_reason: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [bookingInfo, setBookingInfo] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const { error: showError } = useToast();

  // Fetch available rooms when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    setRoomsLoading(true);
    roomsService.getRooms()
      .then(rooms => {
        const available = (rooms as any[]).filter(r => {
          const s = (r.status || '').toLowerCase();
          const os = (r.occupancyStatus || r.occupancy_status || '').toLowerCase();
          // Exclude physically blocked rooms, reserved rooms, and rooms the API marks unavailable
          return !['occupied', 'maintenance', 'out_of_order', 'out_of_service'].includes(s)
            && !['reserved', 'occupied'].includes(os)
            && r.available !== false;
        });
        setAvailableRooms(available);
      })
      .catch(() => setAvailableRooms([]))
      .finally(() => setRoomsLoading(false));
  }, [isOpen]);

  const resetForm = () => {
    setForm({ booking_id: '', to_room_id: '', scheduled_date: '', move_reason: '', notes: '' });
    setBookingInfo(null);
    setBookingError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Look up booking details by ID
  const lookupBooking = useCallback(async () => {
    if (!form.booking_id.trim()) return;
    setBookingLoading(true);
    setBookingError('');
    setBookingInfo(null);
    try {
      const data = await bookingService.getBookingById(form.booking_id);
      if (data) {
        setBookingInfo(data);
      } else {
        setBookingError('Booking not found');
      }
    } catch (err: any) {
      setBookingError(err?.response?.data?.detail || 'Booking not found');
    }
    setBookingLoading(false);
  }, [form.booking_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.booking_id || !form.to_room_id || !form.scheduled_date) return;
    setSaving(true);
    try {
      await onSave({
        booking_id: parseInt(form.booking_id),
        to_room_id: parseInt(form.to_room_id),
        scheduled_date: form.scheduled_date,
        move_reason: form.move_reason || undefined,
        notes: form.notes || undefined,
      });
      handleClose();
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed to create room move');
    }
    setSaving(false);
  };

  // Helpers to extract fields from various backend response shapes
  const getGuestName = (b: any) => {
    if (b?.guest_name) return b.guest_name;
    if (b?.guestInfo) return `${b.guestInfo.firstName || ''} ${b.guestInfo.lastName || ''}`.trim();
    if (b?.guest) {
      if (typeof b.guest === 'string') return b.guest;
      return `${b.guest.first_name || ''} ${b.guest.last_name || ''}`.trim();
    }
    return '—';
  };

  const getCurrentRoom = (b: any) => {
    if (b?.room?.number) return b.room.number;
    if (b?.room_number) return b.room_number;
    if (b?.room && typeof b.room === 'string') return b.room;
    return '—';
  };

  const getCurrentRoomId = (b: any) => {
    if (b?.room?.id != null) return b.room.id;
    if (b?.room_id != null) return b.room_id;
    if (b?.roomId != null) return b.roomId;
    return null;
  };

  const getDate = (b: any, ...keys: string[]) => {
    for (const k of keys) {
      if (b?.[k]) return b[k];
    }
    return '—';
  };

  const currentRoomId = bookingInfo ? getCurrentRoomId(bookingInfo) : null;
  // Exclude current room from the destination dropdown
  const filteredRooms = availableRooms.filter(r => String(r.id) !== String(currentRoomId));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Schedule Room Move"
      subtitle="Create a new scheduled room move for a booking"
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" type="button" onClick={handleClose} className="px-5 py-2 text-[13px] font-semibold">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="button"
            loading={saving}
            onClick={handleSubmit as any}
            className="px-5 py-2 text-[13px] font-semibold"
          >
            Schedule Move
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Booking ID with lookup */}
        <div>
          <label className={labelCls}>Booking ID *</label>
          <div className="flex gap-2">
            <input
              type="number"
              className={`${inputCls} flex-1`}
              value={form.booking_id}
              onChange={e => {
                setForm(f => ({ ...f, booking_id: e.target.value }));
                setBookingInfo(null);
                setBookingError('');
              }}
              onBlur={lookupBooking}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); lookupBooking(); } }}
              placeholder="Enter booking ID"
              required
            />
            <button
              type="button"
              onClick={lookupBooking}
              disabled={!form.booking_id || bookingLoading}
              className="px-3.5 py-2.5 bg-terra-500 text-white rounded-xl text-[13px] font-medium hover:bg-terra-600 active:bg-terra-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {bookingLoading ? 'Looking…' : 'Lookup'}
            </button>
          </div>

          {/* Error */}
          {bookingError && (
            <p className="mt-1.5 text-[12px] text-red-500">{bookingError}</p>
          )}

          {/* Booking info card */}
          {bookingInfo && (
            <div className="mt-2.5 p-3.5 bg-terra-50 border border-terra-100 rounded-xl">
              <p className="text-[11px] font-semibold text-terra-600 uppercase tracking-wide mb-2">Current Assignment</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-[11px] text-neutral-500">Guest</p>
                  <p className="text-[13px] font-medium text-neutral-800">{getGuestName(bookingInfo)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-500">Current Room</p>
                  <p className="text-[13px] font-medium text-neutral-800">{getCurrentRoom(bookingInfo)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-500">Check-in</p>
                  <p className="text-[13px] text-neutral-700">{getDate(bookingInfo, 'check_in', 'arrival_date', 'checkIn')}</p>
                </div>
                <div>
                  <p className="text-[11px] text-neutral-500">Check-out</p>
                  <p className="text-[13px] text-neutral-700">{getDate(bookingInfo, 'check_out', 'departure_date', 'checkOut')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Move To Room — searchable dropdown of available rooms */}
        <div>
          <label className={labelCls}>Move To Room *</label>
          <RoomSelect
            value={form.to_room_id}
            onChange={val => setForm(f => ({ ...f, to_room_id: val }))}
            rooms={filteredRooms}
            placeholder="Select available room"
            loading={roomsLoading}
          />
          {!roomsLoading && filteredRooms.length === 0 && (
            <p className="mt-1.5 text-[12px] text-neutral-400">No available rooms found</p>
          )}
        </div>

        <div>
          <label className={labelCls}>Move Date *</label>
          <DatePicker
            value={form.scheduled_date}
            onChange={val => setForm(f => ({ ...f, scheduled_date: val }))}
            placeholder="Select move date"
            minDate={new Date().toISOString().split('T')[0]}
            className="w-full"
          />
        </div>
        <div>
          <label className={labelCls}>Reason</label>
          <input
            className={inputCls}
            value={form.move_reason}
            onChange={e => setForm(f => ({ ...f, move_reason: e.target.value }))}
            placeholder="e.g. Guest request, maintenance"
          />
        </div>
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            className={`${inputCls} min-h-[80px] resize-none`}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Additional notes..."
          />
        </div>
      </form>
    </Drawer>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RoomMoves() {
  const [moves, setMoves] = useState<RoomMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'execute' | 'cancel'; moveId: number } | null>(null);
  const [selectedMove, setSelectedMove] = useState<RoomMove | null>(null);
  const perPage = 15;
  const { success, error: showError } = useToast();

  const fetchMoves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomMovesService.list({ status: statusFilter || undefined, limit: 200 });
      setMoves(Array.isArray(data) ? data : []);
    } catch {
      showError('Failed to load room moves');
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchMoves();
  }, [fetchMoves]);

  // Filter by search query
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return moves;
    const q = searchQuery.toLowerCase();
    return moves.filter(m =>
      String(m.id).includes(q) ||
      String(m.booking_id).includes(q) ||
      (m.from_room_number && m.from_room_number.toLowerCase().includes(q)) ||
      (m.to_room_number && m.to_room_number.toLowerCase().includes(q)) ||
      String(m.from_room_id).includes(q) ||
      String(m.to_room_id).includes(q) ||
      (m.move_reason && m.move_reason.toLowerCase().includes(q)) ||
      (m.status && m.status.toLowerCase().includes(q))
    );
  }, [moves, searchQuery]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleCreate = async (data: any) => {
    await roomMovesService.create(data);
    success('Room move scheduled');
    fetchMoves();
  };

  const handleExecute = async (id: number) => {
    try {
      await roomMovesService.execute(id);
      success('Room move executed');
      fetchMoves();
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed to execute');
    }
    setConfirmAction(null);
  };

  const handleCancel = async (id: number) => {
    try {
      await roomMovesService.cancel(id);
      success('Room move cancelled');
      fetchMoves();
    } catch (err: any) {
      showError(err?.response?.data?.detail || 'Failed to cancel');
    }
    setConfirmAction(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Room Moves
            </h1>
            <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">
              {filtered.length} total move{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
            Schedule Move
          </Button>
        </header>

        {/* Main Card */}
        <div className="bg-white rounded-[10px] overflow-hidden">

          {/* Search & Filter Bar */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50/30 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-full sm:flex-1 sm:max-w-md">
                <SearchBar
                  value={searchQuery}
                  onChange={(val) => { setSearchQuery(val); setPage(1); }}
                  onClear={() => { setSearchQuery(''); setPage(1); }}
                  placeholder="Search by booking ID, room, or reason..."
                  size="md"
                  className="w-full"
                />
              </div>
              <div className="hidden sm:block sm:flex-1" />
              <div className="w-full sm:w-auto">
                <FilterSelect
                  value={statusFilter}
                  onChange={(val) => { setStatusFilter(val); setPage(1); }}
                  options={STATUS_OPTIONS}
                  placeholder="All Status"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <Table className="w-full">
            <TableHeader>
              <tr>
                <TableHead>ID</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>From Room</TableHead>
                <TableHead>To Room</TableHead>
                <TableHead>Move Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Moved At</TableHead>
                <TableHead align="right">Actions</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableSkeleton columns={9} rows={5} />
              ) : paged.length === 0 ? (
                <TableEmpty
                  icon={ArrowRightLeft}
                  title="No room moves found"
                  description={searchQuery ? 'Try adjusting your search or filters' : 'Schedule a room move to get started'}
                />
              ) : paged.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-neutral-500">{m.id}</TableCell>
                  <TableCell className="font-medium">#{m.booking_id}</TableCell>
                  <TableCell>{m.from_room_number || m.from_room_id}</TableCell>
                  <TableCell>{m.to_room_number || m.to_room_id}</TableCell>
                  <TableCell className="text-neutral-600">{m.scheduled_date}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-neutral-600">{m.move_reason || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[m.status] || 'neutral'} size="sm">
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-neutral-500 text-[11px]">
                    {m.moved_at ? new Date(ensureUtc(m.moved_at)).toLocaleString() : '—'}
                  </TableCell>
                  <TableActions>
                    <IconButton
                      icon={Eye}
                      label="View"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMove(m)}
                    />
                    {m.status === 'scheduled' && (
                      <>
                        <IconButton
                          icon={Play}
                          label="Execute"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmAction({ type: 'execute', moveId: m.id })}
                        />
                        <IconButton
                          icon={XCircle}
                          label="Cancel"
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmAction({ type: 'cancel', moveId: m.id })}
                        />
                      </>
                    )}
                  </TableActions>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/30">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={filtered.length}
                itemsPerPage={perPage}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create Drawer */}
      <CreateDrawer isOpen={createOpen} onClose={() => setCreateOpen(false)} onSave={handleCreate} />

      {/* Execute Confirm Modal */}
      <ConfirmModal
        open={confirmAction?.type === 'execute'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && handleExecute(confirmAction.moveId)}
        title="Execute Room Move?"
        description="This will move the guest to the new room immediately. This action cannot be undone."
        confirmText="Execute"
        cancelText="Cancel"
        variant="primary"
      />

      {/* Cancel Confirm Modal */}
      <ConfirmModal
        open={confirmAction?.type === 'cancel'}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && handleCancel(confirmAction.moveId)}
        title="Cancel Room Move?"
        description="This scheduled room move will be cancelled."
        confirmText="Cancel Move"
        cancelText="Go Back"
        variant="danger"
      />

      {/* Room Move Detail Drawer */}
      <Drawer
        isOpen={!!selectedMove}
        onClose={() => setSelectedMove(null)}
        title="Room Move Details"
        subtitle={selectedMove ? `Move #${selectedMove.id}` : ''}
        maxWidth="max-w-md"
      >
        {selectedMove && (
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Status</span>
              <Badge variant={STATUS_VARIANT[selectedMove.status] || 'neutral'} size="sm" className="" dotColor={undefined} icon={undefined}>
                {selectedMove.status}
              </Badge>
            </div>

            {/* Details Grid */}
            <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-100">
              <DetailRow label="Booking ID" value={`#${selectedMove.booking_id}`} />
              <DetailRow label="From Room" value={selectedMove.from_room_number || String(selectedMove.from_room_id)} />
              <DetailRow label="To Room" value={selectedMove.to_room_number || String(selectedMove.to_room_id)} />
              <DetailRow label="Scheduled Date" value={selectedMove.scheduled_date} />
              <DetailRow label="Reason" value={selectedMove.move_reason || '—'} />
              <DetailRow label="Moved At" value={selectedMove.moved_at ? new Date(ensureUtc(selectedMove.moved_at)).toLocaleString() : '—'} />
              <DetailRow label="Moved By" value={selectedMove.moved_by ? `User #${selectedMove.moved_by}` : '—'} />
              <DetailRow label="Created At" value={new Date(ensureUtc(selectedMove.created_at)).toLocaleString()} />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between px-4 py-3">
      <span className="text-[12px] font-medium text-neutral-500">{label}</span>
      <span className="text-[13px] text-neutral-900 text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
