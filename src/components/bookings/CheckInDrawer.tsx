/**
 * CheckInDrawer — 3-step admin check-in flow with ID verification & AI
 * Step 1: Guest Info & ID Upload/Verification
 * Step 2: Room & Preferences
 * Step 3: Review & Complete Check-In
 */

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  User, Upload, Shield, ShieldCheck, ShieldX, Check, ChevronRight, ChevronLeft,
  Loader2, Camera, CreditCard, Bed, FileText, AlertCircle, CheckCircle,
  X, Calendar, MapPin, Thermometer, Users, Pencil, Phone, Hash,
  Briefcase, Building2,
} from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { precheckinService, type PreCheckInResponse } from '@/api/services/precheckin.service';
import { PreCheckInDetails } from '../shared/PreCheckInDetails';
import { bookingService, type CheckInData } from '@/api/services/booking.service';
import { apiClient } from '@/api/client';
import { cn } from '@/lib/utils';

// ── Types ───────────────────────────────────────────────────────────────

interface CheckInDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any; // AdminBooking from useBookings
  onCheckInComplete: (bookingId: string, data: CheckInData) => Promise<boolean>;
  /** Called after the guest's basic details are edited & saved, so the parent can refresh its list. */
  onGuestUpdated?: () => void;
}

type StayPurpose = 'personal' | 'business';

interface GuestDetailsForm {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  gstNumber: string;
  stayPurpose: StayPurpose;
  companyName: string;
  companyAddress: string;
}

interface VerificationResult {
  verified: boolean;
  confidence: number;
  extractedName?: string;
  idTypeDetected?: string;
  idNumber?: string;
  message?: string;
}

const ID_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'national_id', label: 'National ID' },
] as const;

// ── Helpers ─────────────────────────────────────────────────────────────

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

// ── Step Indicator ──────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Guest & ID' },
    { num: 2, label: 'Room & Notes' },
    { num: 3, label: 'Review' },
  ];
  return (
    <div className="flex items-center justify-center gap-2 py-4 px-6 border-b border-neutral-100 bg-neutral-50/50">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-2">
          <div className={cn(
            'flex items-center gap-1.5',
            currentStep === step.num && 'text-terra-600',
            currentStep > step.num && 'text-sage-600',
            currentStep < step.num && 'text-neutral-400',
          )}>
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold',
              currentStep === step.num && 'bg-terra-500 text-white',
              currentStep > step.num && 'bg-sage-500 text-white',
              currentStep < step.num && 'bg-neutral-200 text-neutral-500',
            )}>
              {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
            </div>
            <span className="text-[12px] font-medium hidden sm:inline">{step.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              'w-8 h-px',
              currentStep > step.num ? 'bg-sage-400' : 'bg-neutral-200',
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────

export default function CheckInDrawer({ isOpen, onClose, booking, onCheckInComplete, onGuestUpdated }: CheckInDrawerProps) {
  // Normalize field names (admin uses guest/room, CBS uses guestName/roomNumber)
  const roomNumber = booking?.room || booking?.roomNumber || 'Unassigned';
  const roomType = booking?.roomType || booking?.room_type || 'Standard';

  // Editable basic guest details (name / phone / address / GST) — corrected during check-in
  const [editingDetails, setEditingDetails] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsForm, setDetailsForm] = useState<GuestDetailsForm>({
    firstName: '', lastName: '', phone: '', address: '', gstNumber: '',
    stayPurpose: 'personal', companyName: '', companyAddress: '',
  });
  // Locally-applied values so the drawer reflects edits immediately
  const [savedDetails, setSavedDetails] = useState<GuestDetailsForm | null>(null);

  const guestName =
    (savedDetails ? `${savedDetails.firstName} ${savedDetails.lastName}`.trim() : '') ||
    booking?.guest || booking?.guestName || 'Guest';

  const [step, setStep] = useState(1);
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [skippedVerification, setSkippedVerification] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Pre-checkin data
  const [precheckinData, setPrecheckinData] = useState<PreCheckInResponse | null>(null);
  const [precheckinLoading, setPrecheckinLoading] = useState(false);

  // Group booking state
  const [isGroupBooking, setIsGroupBooking] = useState(false);
  const [groupBookings, setGroupBookings] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [roomAssignments, setRoomAssignments] = useState<Record<number, number>>({});
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Reset state when drawer opens/closes
  useEffect(() => {
    if (isOpen && booking) {
      setStep(1);
      setIdType('aadhaar');
      setIdNumber('');
      setFrontImage(null);
      setFrontPreview(null);
      setBackImage(null);
      setBackPreview(null);
      setVerifying(false);
      setVerification(null);
      setSkippedVerification(false);
      setNotes('');
      setSubmitting(false);
      setCompleted(false);
      setIsGroupBooking(false);
      setGroupBookings([]);
      setRoomAssignments({});

      // Prefill editable basic details from the booking
      const fullName = String(booking.guest || booking.guestName || '').trim();
      const nameParts = fullName.split(/\s+/);
      const companyName = booking.companyName || booking.company_name || '';
      const rawPurpose = booking.stayPurpose || booking.stay_purpose || '';
      // Default to business if a company is on file but purpose wasn't set
      const stayPurpose: StayPurpose =
        rawPurpose === 'business' || rawPurpose === 'personal'
          ? rawPurpose
          : (companyName ? 'business' : 'personal');
      setDetailsForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: booking.guestPhone || booking.phone || '',
        address: booking.guestAddress || booking.address || '',
        gstNumber: booking.gstNumber || '',
        stayPurpose,
        companyName,
        companyAddress: booking.companyAddress || booking.company_address || '',
      });
      setSavedDetails(null);
      setEditingDetails(false);
      setSavingDetails(false);
      setDetailsError(null);

      // Fetch pre-checkin data
      setPrecheckinLoading(true);
      precheckinService.getByReservation(Number(booking.id))
        .then((data) => setPrecheckinData(data))
        .catch(() => setPrecheckinData(null))
        .finally(() => setPrecheckinLoading(false));

      // Check if this is a group booking and fetch related bookings
      if (booking.isGroupBooking || booking.is_group_booking || booking.groupBookingId || booking.group_booking_id) {
        setIsGroupBooking(true);
        const groupId = booking.groupBookingId || booking.group_booking_id;

        // Fetch all bookings in this group
        apiClient.get(`/api/v1/bookings`, {
          params: { group_booking_id: groupId, page_size: 20 }
        }).then((res) => {
          const data = res.data?.data || res.data;
          const bookings = data?.items || data?.bookings || (Array.isArray(data) ? data : []);
          // Filter to only non-checked-in bookings
          const pendingBookings = bookings.filter((b: any) =>
            !['checked_in', 'checked_out', 'cancelled', 'no_show'].includes(b.status?.toLowerCase())
          );
          setGroupBookings(pendingBookings.length > 0 ? pendingBookings : [booking]);

          // Initialize room assignments with existing room_id if present
          const initialAssignments: Record<number, number> = {};
          (pendingBookings.length > 0 ? pendingBookings : [booking]).forEach((b: any) => {
            // Check all possible room ID fields
            const roomId = b.room_id || b.roomId ||
              (typeof b.room === 'object' ? b.room?.id : null);
            if (roomId) {
              initialAssignments[b.id] = roomId;
            }
          });
          setRoomAssignments(initialAssignments);
        }).catch(() => {
          setGroupBookings([booking]);
        });

        // Fetch available rooms
        setLoadingRooms(true);
        apiClient.get('/api/v1/rooms', {
          params: { status: 'available,clean,inspected', page_size: 100 }
        }).then((res) => {
          const data = res.data?.data || res.data;
          const rooms = data?.items || data?.rooms || (Array.isArray(data) ? data : []);
          setAvailableRooms(rooms);
        }).catch(() => {
          setAvailableRooms([]);
        }).finally(() => {
          setLoadingRooms(false);
        });
      } else {
        setGroupBookings([booking]);
      }
    }
  }, [isOpen, booking?.id]);

  // ── Dropzones ───────────────────────────────────────────────────────

  const onDropFront = useCallback((files: File[]) => {
    if (files[0]) {
      setFrontImage(files[0]);
      setFrontPreview(URL.createObjectURL(files[0]));
      setVerification(null);
    }
  }, []);

  const onDropBack = useCallback((files: File[]) => {
    if (files[0]) {
      setBackImage(files[0]);
      setBackPreview(URL.createObjectURL(files[0]));
    }
  }, []);

  const frontDropzone = useDropzone({
    onDrop: onDropFront,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
  });

  const backDropzone = useDropzone({
    onDrop: onDropBack,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
  });

  // ── AI Verification ─────────────────────────────────────────────────

  const handleVerify = useCallback(async () => {
    if (!frontImage) return;
    setVerifying(true);
    try {
      const imageBase64 = await fileToBase64(frontImage);
      const result = await precheckinService.verifyDocument({
        image_url: imageBase64,
        expected_name: guestName,
        id_type: idType,
      });
      setVerification({
        verified: result.verified,
        confidence: result.confidence,
        extractedName: result.extracted_name,
        idTypeDetected: result.id_type_detected,
        idNumber: result.id_number,
        message: result.message,
      });
      if (result.id_number && !idNumber) {
        setIdNumber(result.id_number);
      }
    } catch {
      setVerification({
        verified: false,
        confidence: 0,
        message: 'Verification failed. You can proceed manually.',
      });
    } finally {
      setVerifying(false);
    }
  }, [frontImage, booking?.guest, idType, idNumber]);

  // ── Edit basic guest details (name / phone / address / GST) ─────────

  const handleSaveDetails = useCallback(async () => {
    if (!booking?.id) return;
    const firstName = detailsForm.firstName.trim();
    const lastName = detailsForm.lastName.trim();
    const phone = detailsForm.phone.trim();

    if (!firstName) {
      setDetailsError('First name is required.');
      return;
    }
    if (phone && !/^[+]?[\d\s\-()]{7,15}$/.test(phone)) {
      setDetailsError('Enter a valid phone number (7–15 digits).');
      return;
    }

    const isBusiness = detailsForm.stayPurpose === 'business';
    if (isBusiness && !detailsForm.companyName.trim()) {
      setDetailsError('Company name is required for an office-work stay.');
      return;
    }

    // Company fields only apply to a business stay
    const companyName = isBusiness ? detailsForm.companyName.trim() : '';
    const companyAddress = isBusiness ? detailsForm.companyAddress.trim() : '';

    setSavingDetails(true);
    setDetailsError(null);
    try {
      await bookingService.updateBooking(String(booking.id), {
        guestInfo: {
          firstName,
          lastName,
          email: booking.guestEmail || booking.email || '',
          phone,
          country: booking.country || '',
          address: detailsForm.address.trim(),
        },
        gstNumber: detailsForm.gstNumber.trim(),
        stayPurpose: detailsForm.stayPurpose,
        companyName,
        companyAddress,
      } as any);
      const applied: GuestDetailsForm = {
        firstName, lastName, phone,
        address: detailsForm.address.trim(),
        gstNumber: detailsForm.gstNumber.trim(),
        stayPurpose: detailsForm.stayPurpose,
        companyName,
        companyAddress,
      };
      setSavedDetails(applied);
      setDetailsForm(applied);
      setEditingDetails(false);
      onGuestUpdated?.();
    } catch (err: any) {
      setDetailsError(
        err?.response?.data?.detail || err?.message || 'Could not save details. Please try again.',
      );
    } finally {
      setSavingDetails(false);
    }
  }, [booking?.id, booking?.guestEmail, booking?.email, booking?.country, detailsForm, onGuestUpdated]);

  // ── Auto-assign rooms for group booking ─────────────────────────────

  // ── Check-In Submit ─────────────────────────────────────────────────

  const handleComplete = useCallback(async () => {
    if (!booking?.id) return;
    setSubmitting(true);
    try {
      const data: CheckInData = {
        notes: notes || undefined,
        id_type: idType,
        id_number: idNumber || undefined,
        id_verified: verification?.verified ?? (skippedVerification ? undefined : false),
        id_verification_confidence: verification?.confidence,
      };

      // For group bookings, include room_assignments mapping (booking_id -> room_id)
      if (isGroupBooking && groupBookings.length > 1) {
        // Send as dict for explicit mapping (avoids order issues)
        const assignments: Record<string, number> = {};
        groupBookings.forEach(gb => {
          if (roomAssignments[gb.id]) {
            assignments[String(gb.id)] = roomAssignments[gb.id];
          }
        });
        if (Object.keys(assignments).length === groupBookings.length) {
          data.room_assignments = assignments;
        }
      }

      const success = await onCheckInComplete(booking.id, data);
      if (success) {
        setCompleted(true);
      }
    } finally {
      setSubmitting(false);
    }
  }, [booking?.id, notes, idType, idNumber, verification, skippedVerification, onCheckInComplete, isGroupBooking, groupBookings, roomAssignments]);

  // ── Has pre-verified ID? ────────────────────────────────────────────

  const hasPreVerifiedId = precheckinData?.id_verified === true;
  const idVerified = verification?.verified || hasPreVerifiedId;

  if (!booking) return null;

  // ── Render Steps ────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5">
      {/* Booking summary */}
      <div className="rounded-[10px] border border-neutral-200 bg-neutral-50/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-terra-100 flex items-center justify-center">
            <User className="w-4.5 h-4.5 text-terra-600" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-neutral-900">{guestName}</p>
            <p className="text-[12px] text-neutral-500">
              {booking.bookingNumber || booking.id} · {roomType}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-[12px]">
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">Check-in</span>
            <span className="text-neutral-700 font-medium">{formatDate(booking.checkIn)}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">Check-out</span>
            <span className="text-neutral-700 font-medium">{formatDate(booking.checkOut)}</span>
          </div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">Room</span>
            <span className="text-neutral-700 font-medium">{roomNumber}</span>
          </div>
        </div>
      </div>

      {/* Basic details — editable to fix wrong name / phone / address / GST at check-in */}
      <div className="rounded-[10px] border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-terra-500" />
            <span className="text-[13px] font-semibold text-neutral-800">Guest Details</span>
          </div>
          {!editingDetails && (
            <button
              onClick={() => { setDetailsError(null); setEditingDetails(true); }}
              className="flex items-center gap-1 text-[12px] font-medium text-terra-600 hover:text-terra-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>

        {editingDetails ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">First Name</label>
                <input
                  type="text"
                  value={detailsForm.firstName}
                  onChange={(e) => setDetailsForm(f => ({ ...f, firstName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={detailsForm.lastName}
                  onChange={(e) => setDetailsForm(f => ({ ...f, lastName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Phone</label>
              <input
                type="tel"
                value={detailsForm.phone}
                onChange={(e) => setDetailsForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Address</label>
              <textarea
                value={detailsForm.address}
                onChange={(e) => setDetailsForm(f => ({ ...f, address: e.target.value }))}
                rows={2}
                placeholder="Street, city, state, postal code"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400 resize-none"
              />
            </div>
            {/* Purpose of stay — Personal vs Office Work */}
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Purpose of Stay</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'personal' as StayPurpose, label: 'Personal', icon: User },
                  { value: 'business' as StayPurpose, label: 'Office Work', icon: Briefcase },
                ]).map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDetailsForm(f => ({ ...f, stayPurpose: value }))}
                    className={cn(
                      'flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[13px] font-medium transition-all',
                      detailsForm.stayPurpose === value
                        ? 'border-terra-400 bg-terra-50 text-terra-700'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Office-work fields — company billing details + GST */}
            {detailsForm.stayPurpose === 'business' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={detailsForm.companyName}
                    onChange={(e) => setDetailsForm(f => ({ ...f, companyName: e.target.value }))}
                    placeholder="e.g. Acme Pvt Ltd"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Company Address</label>
                  <textarea
                    value={detailsForm.companyAddress}
                    onChange={(e) => setDetailsForm(f => ({ ...f, companyAddress: e.target.value }))}
                    rows={2}
                    placeholder="Street, city, state, postal code"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">GST Number</label>
                  <input
                    type="text"
                    value={detailsForm.gstNumber}
                    onChange={(e) => setDetailsForm(f => ({ ...f, gstNumber: e.target.value.toUpperCase() }))}
                    placeholder="15-digit GSTIN (optional)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400"
                  />
                </div>
              </>
            )}

            {detailsError && (
              <p className="text-[12px] text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {detailsError}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <Button
                onClick={handleSaveDetails}
                disabled={savingDetails}
                className="bg-terra-500 hover:bg-terra-600 text-white text-[13px]"
              >
                {savingDetails ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Saving...</>
                ) : (
                  <><Check className="w-4 h-4 mr-1.5" /> Save Details</>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setEditingDetails(false); setDetailsError(null); }}
                disabled={savingDetails}
                className="text-[13px]"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-[13px]">
            <div className="flex items-center gap-2 text-neutral-700">
              {detailsForm.stayPurpose === 'business' ? (
                <Briefcase className="w-3.5 h-3.5 text-terra-500 shrink-0" />
              ) : (
                <User className="w-3.5 h-3.5 text-terra-500 shrink-0" />
              )}
              <span className="font-medium">
                {detailsForm.stayPurpose === 'business' ? 'Office Work' : 'Personal'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span>{detailsForm.phone || <span className="text-neutral-400">No phone</span>}</span>
            </div>
            <div className="flex items-start gap-2 text-neutral-700">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <span>{detailsForm.address || <span className="text-neutral-400">No address</span>}</span>
            </div>
            {detailsForm.stayPurpose === 'business' && (
              <>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{detailsForm.companyName || <span className="text-neutral-400">No company name</span>}</span>
                </div>
                {detailsForm.companyAddress && (
                  <div className="flex items-start gap-2 text-neutral-700">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                    <span>{detailsForm.companyAddress}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-neutral-700">
                  <Hash className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{detailsForm.gstNumber || <span className="text-neutral-400">No GST number</span>}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Already verified via pre-checkin */}
      {hasPreVerifiedId && (
        <div className="rounded-[10px] border border-sage-200 bg-sage-50 p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sage-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-sage-800">ID Already Verified</p>
            <p className="text-[12px] text-sage-600 mt-0.5">
              Guest completed pre-check-in with verified {precheckinData?.id_type?.replace(/_/g, ' ') || 'ID'}.
              You can proceed directly or re-verify below.
            </p>
          </div>
        </div>
      )}

      {/* ID Type Selector */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          ID Document Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ID_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setIdType(value)}
              className={cn(
                'px-3 py-2 rounded-lg border text-[13px] font-medium transition-all text-left',
                idType === value
                  ? 'border-terra-400 bg-terra-50 text-terra-700'
                  : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Upload */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Upload ID Document
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Front */}
          <div>
            <p className="text-[11px] text-neutral-400 mb-1.5 font-medium">Front Side</p>
            <div
              {...frontDropzone.getRootProps()}
              className={cn(
                'border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all',
                frontPreview
                  ? 'border-sage-400 bg-sage-50'
                  : 'border-neutral-300 hover:border-terra-400 hover:bg-neutral-50',
              )}
            >
              <input {...frontDropzone.getInputProps()} />
              {frontPreview ? (
                <img src={frontPreview} alt="ID Front" className="w-full h-20 object-cover rounded" />
              ) : (
                <div className="py-2">
                  <Camera className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                  <p className="text-[11px] text-neutral-500">Drop or click</p>
                </div>
              )}
            </div>
          </div>
          {/* Back */}
          <div>
            <p className="text-[11px] text-neutral-400 mb-1.5 font-medium">Back Side <span className="text-neutral-300">(optional)</span></p>
            <div
              {...backDropzone.getRootProps()}
              className={cn(
                'border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all',
                backPreview
                  ? 'border-sage-400 bg-sage-50'
                  : 'border-neutral-300 hover:border-terra-400 hover:bg-neutral-50',
              )}
            >
              <input {...backDropzone.getInputProps()} />
              {backPreview ? (
                <img src={backPreview} alt="ID Back" className="w-full h-20 object-cover rounded" />
              ) : (
                <div className="py-2">
                  <Camera className="w-5 h-5 mx-auto text-neutral-400 mb-1" />
                  <p className="text-[11px] text-neutral-500">Drop or click</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verify Button */}
      {frontImage && !verification && (
        <Button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full bg-ocean-500 hover:bg-ocean-600 text-white"
        >
          {verifying ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying with AI...</>
          ) : (
            <><Shield className="w-4 h-4 mr-2" /> Verify with AI</>
          )}
        </Button>
      )}

      {/* Verification Result */}
      {verification && (
        <div className={cn(
          'rounded-[10px] border p-4',
          verification.verified
            ? 'border-sage-200 bg-sage-50'
            : 'border-amber-200 bg-amber-50',
        )}>
          <div className="flex items-center gap-2 mb-2">
            {verification.verified ? (
              <ShieldCheck className="w-5 h-5 text-sage-600" />
            ) : (
              <ShieldX className="w-5 h-5 text-amber-600" />
            )}
            <span className={cn(
              'text-[13px] font-semibold',
              verification.verified ? 'text-sage-800' : 'text-amber-800',
            )}>
              {verification.verified ? 'Verified' : 'Could Not Verify'}
            </span>
            <span className={cn(
              'ml-auto text-[12px] font-medium px-2 py-0.5 rounded-full',
              verification.confidence >= 80
                ? 'bg-sage-100 text-sage-700'
                : verification.confidence >= 50
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700',
            )}>
              {Math.round(verification.confidence)}% confidence
            </span>
          </div>
          {verification.extractedName && (
            <p className="text-[12px] text-neutral-600">
              <span className="text-neutral-400">Name on ID:</span>{' '}
              <span className="font-medium">{verification.extractedName}</span>
            </p>
          )}
          {verification.message && (
            <p className="text-[11px] text-neutral-500 mt-1">{verification.message}</p>
          )}
        </div>
      )}

      {/* ID Number */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
          ID Number <span className="text-neutral-300 normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          placeholder="Enter ID number manually"
          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400"
        />
      </div>

      {/* Skip verification link */}
      {!verification && !hasPreVerifiedId && (
        <button
          onClick={() => setSkippedVerification(true)}
          className="text-[12px] text-neutral-400 hover:text-neutral-600 underline underline-offset-2 transition-colors"
        >
          Skip verification and proceed manually
        </button>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      {/* Group Booking Badge */}
      {isGroupBooking && groupBookings.length > 1 && (
        <div className={`rounded-[10px] border p-4 flex items-center gap-3 ${
          Object.keys(roomAssignments).length >= groupBookings.length
            ? 'border-sage-200 bg-sage-50'
            : 'border-blue-200 bg-blue-50'
        }`}>
          <Users className={`w-5 h-5 ${
            Object.keys(roomAssignments).length >= groupBookings.length ? 'text-sage-600' : 'text-blue-600'
          }`} />
          <div>
            <p className={`text-[13px] font-semibold ${
              Object.keys(roomAssignments).length >= groupBookings.length ? 'text-sage-800' : 'text-blue-800'
            }`}>Group Check-In</p>
            <p className={`text-[12px] ${
              Object.keys(roomAssignments).length >= groupBookings.length ? 'text-sage-600' : 'text-blue-600'
            }`}>
              {Object.keys(roomAssignments).length >= groupBookings.length
                ? `All ${groupBookings.length} rooms assigned - ready to check in`
                : `${Object.keys(roomAssignments).length}/${groupBookings.length} rooms assigned`
              }
            </p>
          </div>
        </div>
      )}

      {/* Room Assignment - Single or Group */}
      {isGroupBooking && groupBookings.length > 1 ? (
        /* Group booking: show room status */
        <div className="space-y-3">
          {Object.keys(roomAssignments).length >= groupBookings.length ? (
            /* All rooms assigned - show success state */
            <>
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-sage-500" />
                <span className="text-[13px] font-semibold text-neutral-800">Rooms Assigned</span>
                <CheckCircle className="w-4 h-4 text-sage-600" />
              </div>
              <div className="space-y-2">
                {groupBookings.map((gb, idx) => {
                  const gbRoomType = gb.roomType || gb.room_type || 'Standard';
                  const assignedRoomId = roomAssignments[gb.id];
                  const assignedRoom = availableRooms.find(r => r.id === assignedRoomId);
                  const assignedRoomNumber = assignedRoom?.number || assignedRoom?.room_number ||
                    gb.roomNumber || gb.room_number ||
                    (typeof gb.room === 'object' ? gb.room?.number : gb.room);

                  return (
                    <div
                      key={gb.id}
                      className="rounded-lg border border-sage-200 bg-sage-50/50 p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[13px] font-medium text-neutral-800">
                          {gbRoomType}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          {gb.adults || 1} adult{(gb.adults || 1) > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-sage-700">
                          Room {assignedRoomNumber}
                        </span>
                        <CheckCircle className="w-4 h-4 text-sage-600" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Not all rooms assigned - show warning */
            <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-amber-800">Assign Rooms First</p>
                  <p className="text-[12px] text-amber-600 mt-0.5">
                    {Object.keys(roomAssignments).length}/{groupBookings.length} rooms assigned.
                    Please assign rooms to all bookings from the booking list before check-in.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Single booking: show static room info */
        <div className="rounded-[10px] border border-neutral-200 bg-neutral-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bed className="w-4 h-4 text-terra-500" />
            <span className="text-[13px] font-semibold text-neutral-800">Room Assignment</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-[12px]">
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">Room</span>
              <span className="text-neutral-800 font-semibold text-[14px]">{roomNumber}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">Type</span>
              <span className="text-neutral-700 font-medium">{roomType}</span>
            </div>
            <div>
              <span className="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">Nights</span>
              <span className="text-neutral-700 font-medium">{booking.nights || '—'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pre-checkin preferences */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-sage-500" />
          <span className="text-[13px] font-semibold text-neutral-800">Pre-Check-In Details</span>
        </div>
        <PreCheckInDetails data={precheckinData} isLoading={precheckinLoading} />
      </div>

      {/* Payment status */}
      <div className="rounded-[10px] border border-neutral-200 bg-neutral-50/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-neutral-500" />
            <span className="text-[13px] font-medium text-neutral-700">Payment</span>
          </div>
          <span className={cn(
            'text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider',
            (booking.paymentStatus === 'paid' || booking.payment_status === 'paid')
              ? 'bg-sage-100 text-sage-700'
              : 'bg-amber-100 text-amber-700',
          )}>
            {booking.paymentStatus || booking.payment_status || 'pending'}
          </span>
        </div>
        {(booking.balance != null && booking.balance > 0) && (
          <p className="text-[12px] text-amber-600 mt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Outstanding balance: ₹{booking.balance.toFixed(2)}
          </p>
        )}
      </div>

      {/* Admin notes */}
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
          Check-in Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes for this check-in..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-[13px] text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-200 focus:border-terra-400 resize-none"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      {completed ? (
        /* Success state */
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-sage-600" />
          </div>
          <h3 className="text-[16px] font-semibold text-neutral-900 mb-1">Check-In Complete</h3>
          <p className="text-[13px] text-neutral-500">
            {isGroupBooking && groupBookings.length > 1
              ? `${guestName} has been checked in to ${groupBookings.length} rooms.`
              : `${guestName} has been checked in to Room ${roomNumber}.`
            }
          </p>
          <Button
            onClick={onClose}
            className="mt-6 bg-terra-500 hover:bg-terra-600 text-white"
          >
            Done
          </Button>
        </div>
      ) : (
        /* Review summary */
        <>
          <div className="rounded-[10px] border border-neutral-200 bg-neutral-50/50 p-4 space-y-3">
            <h4 className="text-[13px] font-semibold text-neutral-800">Check-In Summary</h4>

            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Guest</span>
                <span className="font-medium text-neutral-800">{guestName}</span>
              </div>
              {isGroupBooking && groupBookings.length > 1 ? (
                /* Group booking: show all room assignments */
                <div className="pt-2 border-t border-neutral-100">
                  <span className="text-neutral-500 block mb-2">Rooms ({groupBookings.length})</span>
                  <div className="space-y-1">
                    {groupBookings.map((gb, idx) => {
                      const assignedRoom = availableRooms.find(r => r.id === roomAssignments[gb.id]);
                      const gbRoomType = gb.roomType || gb.room_type || 'Standard';
                      return (
                        <div key={gb.id} className="flex justify-between">
                          <span className="text-neutral-600">{gbRoomType}</span>
                          <span className="font-medium text-neutral-800">
                            Room {assignedRoom?.number || assignedRoom?.room_number || '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Room</span>
                  <span className="font-medium text-neutral-800">{roomNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-500">Dates</span>
                <span className="font-medium text-neutral-800">
                  {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nights</span>
                <span className="font-medium text-neutral-800">{booking.nights || '—'}</span>
              </div>
            </div>
          </div>

          {/* ID Verification Status */}
          <div className={cn(
            'rounded-[10px] border p-4 flex items-center gap-3',
            idVerified
              ? 'border-sage-200 bg-sage-50'
              : skippedVerification
                ? 'border-neutral-200 bg-neutral-50'
                : 'border-amber-200 bg-amber-50',
          )}>
            {idVerified ? (
              <ShieldCheck className="w-5 h-5 text-sage-600 shrink-0" />
            ) : (
              <ShieldX className="w-5 h-5 text-amber-500 shrink-0" />
            )}
            <div>
              <p className={cn(
                'text-[13px] font-semibold',
                idVerified ? 'text-sage-800' : 'text-neutral-700',
              )}>
                {idVerified
                  ? 'ID Verified'
                  : skippedVerification
                    ? 'ID Verification Skipped'
                    : 'ID Not Verified'}
              </p>
              <p className="text-[11px] text-neutral-500">
                {idType && ID_TYPES.find(t => t.value === idType)?.label}
                {idNumber && ` · ${idNumber}`}
                {verification?.confidence != null && ` · ${Math.round(verification.confidence)}% confidence`}
              </p>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="rounded-[10px] border border-neutral-200 bg-neutral-50/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Notes</p>
              <p className="text-[13px] text-neutral-700">{notes}</p>
            </div>
          )}

          {/* Complete button */}
          <Button
            onClick={handleComplete}
            disabled={submitting}
            className="w-full bg-terra-500 hover:bg-terra-600 text-white py-2.5"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
            ) : (
              <><CheckCircle className="w-4 h-4 mr-2" /> Complete Check-In</>
            )}
          </Button>
        </>
      )}
    </div>
  );

  // ── Drawer Footer (navigation) ──────────────────────────────────────

  const canProceedFromStep1 = hasPreVerifiedId || verification || skippedVerification;
  const canProceedFromStep2 = isGroupBooking && groupBookings.length > 1
    ? Object.keys(roomAssignments).length === groupBookings.length
    : true; // Single booking doesn't need room selection in step 2

  const footer = completed ? undefined : (
    <div className="flex items-center justify-between">
      {step > 1 ? (
        <Button
          variant="secondary"
          onClick={() => setStep(s => s - 1)}
          className="text-[13px]"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      ) : (
        <Button variant="secondary" onClick={onClose} className="text-[13px]">
          Cancel
        </Button>
      )}

      {step < 3 && (
        <Button
          onClick={() => setStep(s => s + 1)}
          disabled={(step === 1 && !canProceedFromStep1) || (step === 2 && !canProceedFromStep2)}
          className={cn(
            'text-[13px]',
            (step === 1 && !canProceedFromStep1) || (step === 2 && !canProceedFromStep2)
              ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              : 'bg-terra-500 hover:bg-terra-600 text-white',
          )}
        >
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Guest Check-In"
      subtitle={guestName}
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <StepIndicator currentStep={step} />
      <div className="p-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </Drawer>
  );
}
