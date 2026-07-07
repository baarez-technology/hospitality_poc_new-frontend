import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CalendarDays, User, Mail, Phone, Globe, MessageSquare, Moon } from 'lucide-react';
import { Button } from '../../ui2/Button';

const SOURCE_OPTIONS = ['Website', 'Walk-in', 'Booking.com', 'Expedia'];

const calculateNights = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return diff;
};

const validateEmail = (email: string) => {
  if (!email.trim()) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address';
  return '';
};

const validatePhone = (phone: string) => {
  if (!phone.trim()) return 'Phone number is required';
  const cleaned = phone.replace(/[\s\-().+]/g, '');
  if (cleaned.length < 7 || cleaned.length > 15) return 'Phone must be 7-15 digits';
  if (!/^\d+$/.test(cleaned)) return 'Phone must contain only digits';
  return '';
};

interface FieldErrors {
  guest?: string;
  email?: string;
  phone?: string;
  checkIn?: string;
  checkOut?: string;
}

export default function EditBookingModal({ isOpen, booking, onClose, onSave, isSaving }: any) {
  const [formState, setFormState] = useState({
    guest: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    notes: '',
    source: 'Website',
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (booking && isOpen) {
      setFormState({
        guest: booking.guest || '',
        email: booking.email || '',
        phone: booking.phone || '',
        checkIn: booking.checkIn || '',
        checkOut: booking.checkOut || '',
        notes: booking.specialRequests || '',
        source: booking.source || 'Website',
      });
      setErrors({});
      setTouched({});
    }
  }, [booking, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const nights = useMemo(
    () => calculateNights(formState.checkIn, formState.checkOut),
    [formState.checkIn, formState.checkOut]
  );

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'guest':
        return value.trim() ? '' : 'Guest name is required';
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'checkIn':
        return value ? '' : 'Check-in date is required';
      case 'checkOut':
        if (!value) return 'Check-out date is required';
        if (formState.checkIn && new Date(value) < new Date(formState.checkIn))
          return 'Check-out cannot be before check-in';
        return '';
      default:
        return '';
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FieldErrors = {};
    let valid = true;

    ['guest', 'email', 'phone', 'checkIn', 'checkOut'].forEach((field) => {
      const msg = validateField(field, formState[field as keyof typeof formState]);
      if (msg) {
        newErrors[field as keyof FieldErrors] = msg;
        valid = false;
      }
    });

    setErrors(newErrors);
    setTouched({ guest: true, email: true, phone: true, checkIn: true, checkOut: true });
    return valid;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));

    // Clear error on change if field was touched
    if (touched[name]) {
      const msg = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const msg = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: msg || undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!booking || !validateAll()) return;

    const nameParts = formState.guest.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Post check-in: preserve original check-in date, source, and special requests
    const safeCheckIn = isCheckedIn ? (booking.checkIn || formState.checkIn) : formState.checkIn;
    const safeSource = isCheckedIn ? (booking.source || formState.source) : formState.source;
    const safeNotes = isCheckedIn ? (booking.specialRequests || formState.notes) : formState.notes.trim();

    onSave({
      guestInfo: {
        firstName,
        lastName,
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        country: booking.country || '',
        specialRequests: safeNotes,
      },
      checkIn: safeCheckIn,
      checkOut: formState.checkOut,
      guests: {
        adults: booking.adults || 1,
        children: booking.children || 0,
      },
      specialRequests: safeNotes,
      guest: formState.guest.trim(),
      guestEmail: formState.email.trim(),
      guestPhone: formState.phone.trim(),
      nights: calculateNights(safeCheckIn, formState.checkOut),
      source: safeSource,
    });
  };

  // Determine if booking is post-check-in (fields should be frozen)
  const isCheckedIn = (() => {
    const statusNorm = (booking?.status || '').toUpperCase().replace(/[\s_]/g, '-');
    return statusNorm === 'IN-HOUSE' || statusNorm === 'CHECKED-IN' ||
           statusNorm === 'CHECKED-OUT' || statusNorm === 'CANCELLED' || statusNorm === 'NO-SHOW';
  })();

  if (!isOpen || !booking) return null;

  const inputBase =
    'w-full px-4 py-3 bg-[#FAF8F6] border rounded-xl hover:border-neutral-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:bg-white transition-all duration-200 text-sm';
  const inputNormal = `${inputBase} border-neutral-200 focus:ring-[#A57865]`;
  const inputError = `${inputBase} border-red-300 focus:ring-red-500`;

  const getInputClass = (field: keyof FieldErrors) =>
    errors[field] && touched[field] ? inputError : inputNormal;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div
        className={`fixed top-0 bottom-0 right-0 h-screen w-full max-w-[650px] bg-white shadow-xl border-l border-neutral-200 z-[70] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900">
              Edit Booking
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Update stay and guest details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#A57865]"
          >
            <X className="w-5 h-5 text-neutral-600 hover:text-neutral-900 transition-colors" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <form id="edit-booking-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Guest Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="w-1 h-5 bg-[#A57865] rounded-full" />
                <h3 className="font-bold text-neutral-900">Guest Information</h3>
              </div>

              {/* Guest Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Guest Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className="w-4 h-4 text-neutral-400" />
                  </div>
                  <input
                    name="guest"
                    value={formState.guest}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    className={`${getInputClass('guest')} pl-10`}
                  />
                </div>
                {errors.guest && touched.guest && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.guest}</p>
                )}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Mail className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="john@example.com"
                      className={`${getInputClass('email')} pl-10`}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Phone className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      value={formState.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="+1 (555) 123-4567"
                      className={`${getInputClass('phone')} pl-10`}
                    />
                  </div>
                  {errors.phone && touched.phone && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Booking Source */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Booking Source {isCheckedIn && <span className="text-neutral-400 font-normal">(locked)</span>}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Globe className="w-4 h-4 text-neutral-400" />
                  </div>
                  {isCheckedIn ? (
                    <div className="w-full pl-10 px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-500 cursor-not-allowed">
                      {formState.source}
                    </div>
                  ) : (
                    <select
                      name="source"
                      value={formState.source}
                      onChange={handleChange}
                      className={`${inputNormal} pl-10 appearance-none cursor-pointer`}
                    >
                      {SOURCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Stay Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="w-1 h-5 bg-[#5C9BA4] rounded-full" />
                <h3 className="font-bold text-neutral-900">Stay Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Check-in */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Check-in {isCheckedIn ? <span className="text-neutral-400 font-normal">(locked)</span> : <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <CalendarDays className="w-4 h-4 text-neutral-400" />
                    </div>
                    {isCheckedIn ? (
                      <div className="w-full pl-10 px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-500 cursor-not-allowed">
                        {formState.checkIn ? new Date(formState.checkIn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </div>
                    ) : (
                      <input
                        name="checkIn"
                        type="date"
                        value={formState.checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`${getInputClass('checkIn')} pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                      />
                    )}
                  </div>
                  {!isCheckedIn && errors.checkIn && touched.checkIn && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.checkIn}</p>
                  )}
                </div>

                {/* Check-out */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Check-out <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <CalendarDays className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                      name="checkOut"
                      type="date"
                      value={formState.checkOut}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={formState.checkIn || undefined}
                      className={`${getInputClass('checkOut')} pl-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                    />
                  </div>
                  {errors.checkOut && touched.checkOut && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">{errors.checkOut}</p>
                  )}
                </div>

                {/* Nights */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nights
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Moon className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="w-full pl-10 px-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-700 font-medium">
                      {nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : (formState.checkIn && formState.checkOut && formState.checkIn === formState.checkOut ? 'Day use' : '—')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Requests Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="w-1 h-5 bg-[#CDB261] rounded-full" />
                <h3 className="font-bold text-neutral-900">Special Requests</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Guest Special Requests {isCheckedIn && <span className="text-neutral-400 font-normal">(locked after check-in)</span>}
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-3.5 pointer-events-none">
                    <MessageSquare className="w-4 h-4 text-neutral-400" />
                  </div>
                  <textarea
                    name="notes"
                    value={formState.notes}
                    readOnly
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 bg-neutral-100 border border-neutral-200 rounded-xl text-sm text-neutral-500 cursor-not-allowed resize-none"
                    title="Guest special requests cannot be modified"
                  />
                </div>
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  {isCheckedIn ? 'Special requests are frozen after check-in' : 'Special requests submitted by the guest cannot be edited'}
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Actions Footer - Sticky */}
        <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-4 flex items-center justify-end gap-3 shadow-lg">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="edit-booking-form"
            disabled={isSaving}
            icon={Save}
            loading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
}
