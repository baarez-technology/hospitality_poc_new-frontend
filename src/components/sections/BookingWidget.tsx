import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Users, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { bookingWidgetSchema, BookingWidgetFormData } from '@/utils/validation';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const BookingWidget = () => {
  const navigate = useNavigate();
  const [showGuestPicker, setShowGuestPicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingWidgetFormData>({
    resolver: zodResolver(bookingWidgetSchema),
    defaultValues: {
      adults: 2,
      children: 0,
      infants: 0,
    },
  });

  const adults = watch('adults');
  const children = watch('children');
  const infants = watch('infants');
  const checkIn = watch('checkIn');

  const totalGuests = (adults || 0) + (children || 0) + (infants || 0);

  const onSubmit = (data: BookingWidgetFormData) => {
    console.log('Booking data:', data);
    toast.success('Searching for available rooms...');
    navigate('/rooms', {
      state: {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        guests: {
          adults: data.adults,
          children: data.children,
          infants: data.infants,
        },
      },
    });
  };

  const adjustGuests = (type: 'adults' | 'children' | 'infants', delta: number) => {
    const currentValue = watch(type) || 0;
    const newValue = Math.max(type === 'adults' ? 1 : 0, currentValue + delta);
    const maxValue = type === 'adults' ? 10 : type === 'children' ? 5 : 2;
    setValue(type, Math.min(newValue, maxValue));
  };

  return (
    <Card variant="elevated" padding="lg" className="backdrop-blur-md bg-white/95 shadow-xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Check-in Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Check-in
            </label>
            <Controller
              control={control}
              name="checkIn"
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="date"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.checkIn ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    min={new Date().toISOString().split('T')[0]}
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                </div>
              )}
            />
            {errors.checkIn && (
              <p className="mt-1 text-sm text-red-600">{errors.checkIn.message}</p>
            )}
          </div>

          {/* Check-out Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Check-out
            </label>
            <Controller
              control={control}
              name="checkOut"
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="date"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      errors.checkOut ? 'border-red-500' : 'border-neutral-300'
                    }`}
                    min={
                      checkIn
                        ? new Date(checkIn.getTime() + 86400000).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0]
                    }
                    value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
                </div>
              )}
            />
            {errors.checkOut && (
              <p className="mt-1 text-sm text-red-600">{errors.checkOut.message}</p>
            )}
          </div>
        </div>

        {/* Guests */}
        <div className="relative">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Guests
          </label>
          <button
            type="button"
            onClick={() => setShowGuestPicker(!showGuestPicker)}
            className="w-full px-4 py-3 border border-neutral-300 rounded-lg text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-neutral-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-900">
                  {totalGuests} {totalGuests === 1 ? 'Guest' : 'Guests'}
                </span>
              </div>
              <span className="text-neutral-500 text-sm">
                {adults} Adults, {children} Children, {infants} Infants
              </span>
            </div>
          </button>

          {showGuestPicker && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-lg p-4 space-y-4">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900">Adults</div>
                  <div className="text-sm text-neutral-500">Age 13+</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustGuests('adults', -1)}
                    disabled={(adults || 0) <= 1}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{adults}</span>
                  <button
                    type="button"
                    onClick={() => adjustGuests('adults', 1)}
                    disabled={(adults || 0) >= 10}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900">Children</div>
                  <div className="text-sm text-neutral-500">Age 2-12</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustGuests('children', -1)}
                    disabled={(children || 0) <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{children}</span>
                  <button
                    type="button"
                    onClick={() => adjustGuests('children', 1)}
                    disabled={(children || 0) >= 5}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900">Infants</div>
                  <div className="text-sm text-neutral-500">Under 2</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => adjustGuests('infants', -1)}
                    disabled={(infants || 0) <= 0}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{infants}</span>
                  <button
                    type="button"
                    onClick={() => adjustGuests('infants', 1)}
                    disabled={(infants || 0) >= 2}
                    className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuestPicker(false)}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button type="submit" fullWidth size="lg">
          Check Availability
        </Button>
      </form>
    </Card>
  );
};
