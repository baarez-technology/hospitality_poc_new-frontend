import { motion } from 'framer-motion';
import { useState } from 'react';
import { Check, ArrowLeft, Sparkles, Bed, Sun, Moon, Trees, Volume2, Loader2, Users, Eye, Maximize } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreCheckIn } from '@/contexts/PreCheckInContext';
import { useCurrency } from '@/hooks/useCurrency';
import type { Room } from '@/api/types/room.types';
import logo from '@/assets/logo.png';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop';

const categoryColors: Record<string, string> = {
  standard: 'bg-blue-50 text-blue-700 border-blue-200',
  deluxe: 'bg-purple-50 text-purple-700 border-purple-200',
  suite: 'bg-amber-50 text-amber-700 border-amber-200',
  presidential: 'bg-rose-50 text-rose-700 border-rose-200',
};

interface AIRoomSelectionStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

export function AIRoomSelectionStep({ onNext, onPrevious }: AIRoomSelectionStepProps) {
  const navigate = useNavigate();
  const { updatePreCheckInData, getRoomTypes, preCheckInData } = usePreCheckIn();
  const { formatCurrency } = useCurrency();
  const [selectedRoomSlug, setSelectedRoomSlug] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(true);
  const [roomTypes, setRoomTypes] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const handleLogoClick = () => {
    const confirmed = window.confirm('Are you sure you want to cancel the pre-check-in? Your progress will be lost.');
    if (confirmed) {
      navigate('/');
    }
  };

  // Preference states
  const [floorPreference, setFloorPreference] = useState<string>('any');
  const [viewPreference, setViewPreference] = useState<string>('any');
  const [bedType, setBedType] = useState<string>('any');
  const [quietnessLevel, setQuietnessLevel] = useState<string>('any');

  const handlePreferencesContinue = async () => {
    // Save preferences to context
    updatePreCheckInData({
      roomPreferences: {
        floor: floorPreference as any,
        view: viewPreference as any,
        bedType: bedType as any,
        quietness: quietnessLevel as any,
      },
    });
    setShowPreferences(false);
    // Fetch room types
    await fetchRoomTypes();
  };

  const fetchRoomTypes = async () => {
    setLoadingRooms(true);
    setRoomsError(null);
    try {
      const types = await getRoomTypes();
      if (types && types.length > 0) {
        setRoomTypes(types);
      } else {
        setRoomsError('No room types available for your dates');
      }
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      setRoomsError('Failed to load room types');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRoomTypeSelect = (room: Room) => {
    const slug = room.slug || room.id;
    const newSelection = selectedRoomSlug === slug ? null : slug;
    setSelectedRoomSlug(newSelection);

    if (newSelection) {
      updatePreCheckInData({
        selectedRoom: {
          slug: slug,
          name: room.name,
          category: room.category || '',
          price: room.price,
          image: room.images?.[0],
          aiScore: 0,
          aiReasoning: [],
        },
      });
    } else {
      updatePreCheckInData({ selectedRoom: undefined });
    }
  };

  const handleContinue = () => {
    if (selectedRoomSlug) {
      onNext();
    }
  };

  const steps = [
    { number: 1, label: 'Welcome', active: false },
    { number: 2, label: 'Guest Details', active: false },
    { number: 3, label: 'Room Type', active: true },
    { number: 4, label: 'Travel Details', active: false },
    { number: 5, label: 'Documents', active: false },
    { number: 6, label: 'Preferences', active: false },
    { number: 7, label: 'Special Requests', active: false },
    { number: 8, label: 'Review', active: false },
    { number: 9, label: 'Confirmation', active: false },
  ];

  const currentStepIndex = steps.findIndex(s => s.active);

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT COLUMN - Vertical Stepper (Hidden on mobile) */}
      <div className="hidden lg:block w-[410px] min-h-screen px-12 py-12 border-r border-neutral-200 bg-white">
        <div className="sticky top-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20"
          >
            <img
              src={logo}
              alt="Glimmora"
              className="h-10 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
          </motion.div>

          {/* Vertical Stepper */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-start gap-4">
                {/* Step Indicator Column */}
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      step.active
                        ? 'bg-terra-500 text-white'
                        : 'bg-transparent text-neutral-400 border border-neutral-300'
                    }`}
                  >
                    {step.active ? <div className="w-2 h-2 bg-white rounded-full" /> : step.number}
                  </motion.div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="w-px h-10 bg-neutral-200 mt-1.5" />
                  )}
                </div>

                {/* Step Label */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                  className="pt-1 pb-8"
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      step.active ? 'text-neutral-800' : 'text-neutral-500'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.active && (
                    <div className="text-[11px] text-neutral-400">
                      Select your preferred room type
                    </div>
                  )}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Content Area */}
      <div className="flex-1 min-h-screen bg-neutral-50">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <img
              src={logo}
              alt="Glimmora"
              className="h-8 w-auto cursor-pointer"
              onClick={handleLogoClick}
            />
            <span className="text-[13px] text-neutral-500">Step {currentStepIndex + 1} of {steps.length}</span>
          </div>
          {/* Mobile Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-1">
            <div
              className="bg-terra-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="px-4 py-6 lg:px-10 lg:py-8">
          {/* Previous Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={showPreferences ? onPrevious : () => { setShowPreferences(true); setSelectedRoomSlug(null); }}
            className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-neutral-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{showPreferences ? 'Previous' : 'Back to preferences'}</span>
          </motion.button>

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 lg:p-8 rounded-[10px] shadow-sm"
          >
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <h1 className="text-lg font-semibold text-neutral-800 mb-2">
                {showPreferences ? 'Room Preferences' : 'Select Your Room Type'}
              </h1>
              <p className="text-[13px] text-neutral-500">
                {showPreferences
                  ? 'Tell us your preferences to find the perfect room'
                  : 'Choose the room type that best suits your stay. The hotel will assign your specific room.'}
              </p>
            </div>

            {showPreferences ? (
              /* Preferences Form */
              <div className="space-y-6">
                {/* Floor Preference */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                    Floor Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'low', label: 'Low', desc: 'Floors 2-5' },
                      { value: 'mid', label: 'Mid', desc: 'Floors 6-10' },
                      { value: 'high', label: 'High', desc: 'Floors 11+' },
                      { value: 'any', label: 'Any', desc: 'No preference' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFloorPreference(option.value)}
                        className={`p-4 border rounded-lg transition-all text-left ${
                          floorPreference === option.value
                            ? 'border-terra-500 bg-terra-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium text-[13px] text-neutral-800">{option.label}</div>
                        <div className="text-[11px] text-neutral-500 mt-0.5">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Preference */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                    View Preference
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'ocean', label: 'Ocean', icon: Sun },
                      { value: 'city', label: 'City', icon: Moon },
                      { value: 'garden', label: 'Garden', icon: Trees },
                      { value: 'any', label: 'Any', icon: Eye },
                    ].map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setViewPreference(option.value)}
                          className={`p-4 border rounded-lg transition-all ${
                            viewPreference === option.value
                              ? 'border-terra-500 bg-terra-50'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className="w-5 h-5 text-neutral-600" />
                            <div className="font-medium text-[13px] text-neutral-800">{option.label}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bed Type */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                    Bed Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'king', label: 'King' },
                      { value: 'queen', label: 'Queen' },
                      { value: 'twin', label: 'Twin' },
                      { value: 'any', label: 'Any' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setBedType(option.value)}
                        className={`p-4 border rounded-lg transition-all ${
                          bedType === option.value
                            ? 'border-terra-500 bg-terra-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Bed className="w-4 h-4 text-neutral-600" />
                          <div className="font-medium text-[13px] text-neutral-800">{option.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quietness Level */}
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                    Quietness Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'quiet', label: 'Quiet' },
                      { value: 'moderate', label: 'Moderate' },
                      { value: 'any', label: 'Any' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setQuietnessLevel(option.value)}
                        className={`p-4 border rounded-lg transition-all ${
                          quietnessLevel === option.value
                            ? 'border-terra-500 bg-terra-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Volume2 className="w-4 h-4 text-neutral-600" />
                          <div className="font-medium text-[13px] text-neutral-800">{option.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handlePreferencesContinue}
                  className="w-full h-10 text-white font-semibold rounded-lg transition-all text-[13px] mt-4 bg-terra-500 hover:bg-terra-600 active:scale-[0.98]"
                >
                  Continue
                </button>
              </div>
            ) : loadingRooms ? (
              /* Loading State */
              <div className="py-12 text-center">
                <div className="w-14 h-14 bg-terra-500 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Loader2 className="w-7 h-7 text-white animate-spin" />
                </div>
                <h3 className="text-[15px] font-semibold text-neutral-800 mb-2">
                  Finding Room Types
                </h3>
                <p className="text-[13px] text-neutral-500">
                  Loading available room types for your stay...
                </p>
              </div>
            ) : (
              /* Room Type Selection */
              <div className="space-y-4">
                {/* Success Banner */}
                {roomTypes.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-sage-50 border border-sage-200 rounded-lg">
                    <Check className="w-4 h-4 text-sage-600" />
                    <span className="text-[13px] font-medium text-sage-800">
                      {roomTypes.length} room type{roomTypes.length !== 1 ? 's' : ''} available
                    </span>
                  </div>
                )}

                {/* Error State */}
                {roomsError && (
                  <div className="flex items-center gap-2 mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="text-[13px] font-medium text-rose-800">{roomsError}</span>
                  </div>
                )}

                {/* Room Type Cards */}
                {roomTypes.map((room) => {
                  const slug = room.slug || room.id;
                  const isSelected = selectedRoomSlug === slug;
                  const categoryClass = categoryColors[(room.category || 'standard').toLowerCase()] || categoryColors.standard;
                  const amenities = room.amenities || [];
                  const displayAmenities = amenities.slice(0, 4);
                  const extraAmenities = amenities.length - 4;

                  return (
                    <motion.button
                      key={slug}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleRoomTypeSelect(room)}
                      className={`w-full border rounded-xl transition-all text-left overflow-hidden ${
                        isSelected
                          ? 'border-terra-500 ring-2 ring-terra-500/20'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {/* Room Image */}
                      <div className="relative h-44 sm:h-52 bg-neutral-100">
                        <img
                          src={room.images?.[0] || PLACEHOLDER_IMAGE}
                          alt={room.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                        />
                        {/* Category Badge */}
                        {room.category && (
                          <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold rounded-md border capitalize ${categoryClass}`}>
                            {room.category}
                          </span>
                        )}
                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-7 h-7 bg-terra-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                          </div>
                        )}
                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
                          <span className="text-[15px] font-bold text-neutral-900">{formatCurrency(room.price)}</span>
                          <span className="text-[11px] text-neutral-500 ml-0.5">/night</span>
                        </div>
                      </div>

                      {/* Room Info */}
                      <div className="p-4 sm:p-5">
                        {/* Name & Description */}
                        <h3 className="font-semibold text-[15px] text-neutral-900 mb-1.5">{room.name}</h3>
                        {room.shortDescription && (
                          <p className="text-[12px] text-neutral-500 leading-relaxed mb-3 line-clamp-2">
                            {room.shortDescription}
                          </p>
                        )}

                        {/* Quick Info Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {room.bedType && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 text-neutral-600 text-[11px] font-medium rounded-md">
                              <Bed className="w-3 h-3" />
                              {room.bedType}
                            </span>
                          )}
                          {room.view && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 text-neutral-600 text-[11px] font-medium rounded-md">
                              <Eye className="w-3 h-3" />
                              {room.view}
                            </span>
                          )}
                          {room.maxGuests && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 text-neutral-600 text-[11px] font-medium rounded-md">
                              <Users className="w-3 h-3" />
                              Up to {room.maxGuests} guests
                            </span>
                          )}
                          {room.size && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 text-neutral-600 text-[11px] font-medium rounded-md">
                              <Maximize className="w-3 h-3" />
                              {room.size} sq ft
                            </span>
                          )}
                        </div>

                        {/* Amenities */}
                        {amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {displayAmenities.map((amenity, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-medium rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                            {extraAmenities > 0 && (
                              <span className="px-2 py-0.5 bg-terra-50 text-terra-600 text-[10px] font-medium rounded">
                                +{extraAmenities} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={!selectedRoomSlug}
                  className={`w-full h-10 text-white font-semibold rounded-lg transition-all text-[13px] mt-4 ${
                    selectedRoomSlug
                      ? 'bg-terra-500 hover:bg-terra-600 active:scale-[0.98]'
                      : 'bg-neutral-300 cursor-not-allowed'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
