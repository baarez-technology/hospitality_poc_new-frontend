import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePreCheckIn } from '@/contexts/PreCheckInContext';
import { precheckinService } from '@/api/services/precheckin.service';
import toast from 'react-hot-toast';
import logo from '@/assets/logo.png';

interface ReviewSubmitStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

export function ReviewSubmitStep({ onNext, onPrevious }: ReviewSubmitStepProps) {
  const navigate = useNavigate();
  const { preCheckInData, updatePreCheckInData } = usePreCheckIn();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoClick = () => {
    const confirmed = window.confirm('Are you sure you want to cancel the pre-check-in? Your progress will be lost.');
    if (confirmed) {
      navigate('/');
    }
  };

  if (!preCheckInData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-terra-500" />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!preCheckInData?.reservationId) {
      toast.error('Reservation not found. Please restart pre-check-in.');
      return;
    }

    // Check if ID was verified
    if (!preCheckInData.documents?.idVerified) {
      toast.error('ID verification is required. Please go back and verify your ID.');
      return;
    }

    // Check if room type was selected
    const selectedRoomSlug = preCheckInData.selectedRoom?.slug;
    if (!selectedRoomSlug) {
      toast.error('Please select a room type before completing pre-check-in.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get or create pre-checkin first
      let precheckin = await precheckinService.getByReservation(preCheckInData.reservationId);

      if (!precheckin) {
        // Create pre-checkin if it doesn't exist
        precheckin = await precheckinService.create({
          reservation_id: preCheckInData.reservationId,
          email: preCheckInData.personalInfo.email,
          phone: preCheckInData.personalInfo.phone,
          address: preCheckInData.personalInfo.address,
          city: preCheckInData.personalInfo.city,
          state: preCheckInData.personalInfo.state,
          zip_code: preCheckInData.personalInfo.zipCode,
          country: preCheckInData.personalInfo.country,
          floor_preference: preCheckInData.roomPreferences.floor,
          view_preference: preCheckInData.roomPreferences.view,
          bed_type_preference: preCheckInData.roomPreferences.bedType,
          quietness_preference: preCheckInData.roomPreferences.quietness,
          arrival_time: preCheckInData.travelDetails.arrivalTime,
          departure_time: preCheckInData.travelDetails.departureTime,
          flight_number: preCheckInData.travelDetails.flightNumber,
          purpose: preCheckInData.travelDetails.purpose,
          transportation_needed: preCheckInData.travelDetails.transportationNeeded,
          pillow_type: JSON.stringify(preCheckInData.preferences.pillowType),
          temperature: preCheckInData.preferences.temperature,
          minibar_preferences: JSON.stringify(preCheckInData.preferences.minibarPreferences),
          dietary_restrictions: JSON.stringify(preCheckInData.preferences.dietaryRestrictions),
          special_requests: preCheckInData.specialRequests.requests,
          early_check_in: preCheckInData.specialRequests.earlyCheckIn,
          late_check_out: preCheckInData.specialRequests.lateCheckOut,
        });
      } else {
        // Existing precheckin: ensure ETA/ETD (arrival_time, departure_time) from travel details are saved
        await precheckinService.update(precheckin.id, {
          arrival_time: preCheckInData.travelDetails.arrivalTime || undefined,
          departure_time: preCheckInData.travelDetails.departureTime || undefined,
        } as any);
      }

      // Update precheckin with ID verification status if not already set
      if (!precheckin.id_verified && preCheckInData.documents?.idVerified) {
        await precheckinService.update(precheckin.id, {
          id_verified: true,
          id_type: preCheckInData.documents.idType,
          id_front_url: preCheckInData.documents.idFrontUrl,
          id_back_url: preCheckInData.documents.idBackUrl,
        } as any);
      }

      // Complete pre-checkin with room type selection (hotel assigns actual room later)
      const result = await precheckinService.completePrecheckin(precheckin.id, {
        room_type_slug: selectedRoomSlug,
        ai_score: preCheckInData.selectedRoom?.aiScore,
        ai_reasoning: preCheckInData.selectedRoom?.aiReasoning,
      });

      // Handle wrapped response
      const data = result?.data || result;

      if (data?.success) {
        // Update context with digital key from backend
        updatePreCheckInData({
          digitalKey: {
            keyId: data.digital_key.key_id,
            activated: data.digital_key.activated,
            qrCode: data.digital_key.qr_code,
          },
        });

        toast.success('Pre-check-in completed! Check your email for your digital key.');
        onNext();
      } else {
        throw new Error(data?.message || 'Failed to complete pre-check-in');
      }
    } catch (error: any) {
      console.error('Error completing pre-check-in:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to complete pre-check-in';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: 'Welcome', active: false },
    { number: 2, label: 'Guest Details', active: false },
    { number: 3, label: 'Room Type', active: false },
    { number: 4, label: 'Travel Details', active: false },
    { number: 5, label: 'Documents', active: false },
    { number: 6, label: 'Preferences', active: false },
    { number: 7, label: 'Special Requests', active: false },
    { number: 8, label: 'Review', active: true },
    { number: 9, label: 'Confirmation', active: false },
  ];

  const currentStepIndex = steps.findIndex(s => s.active);

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT COLUMN - Vertical Stepper */}
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
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${step.active
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
                    className={`text-sm font-medium mb-1 ${step.active ? 'text-neutral-800' : 'text-neutral-500'
                      }`}
                  >
                    {step.label}
                  </div>
                  {step.active && (
                    <div className="text-[11px] text-neutral-400">
                      Review and submit your information
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
            onClick={onPrevious}
            className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-neutral-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
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
                Review & Submit
              </h1>
              <p className="text-[13px] text-neutral-500">
                Please review your information before submitting
              </p>
            </div>

            <div className="space-y-5">
              {/* Personal Information */}
              <div className="pb-5 border-b border-neutral-100">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                  Personal Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Email</span>
                    <span className="text-neutral-800 font-medium">
                      {preCheckInData.personalInfo.email || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Phone</span>
                    <span className="text-neutral-800 font-medium">
                      {preCheckInData.personalInfo.phone || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Travel Details */}
              <div className="pb-5 border-b border-neutral-100">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                  Travel Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Arrival Time</span>
                    <span className="text-neutral-800 font-medium">
                      {preCheckInData.travelDetails.arrivalTime || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Departure Time</span>
                    <span className="text-neutral-800 font-medium">
                      {preCheckInData.travelDetails.departureTime || 'Not provided'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Transportation</span>
                    <span className="text-neutral-800 font-medium">
                      {preCheckInData.travelDetails.transportationNeeded ? 'Requested' : 'Not needed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Room Preferences */}
              <div className="pb-5 border-b border-neutral-100">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                  Room Preferences
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Temperature</span>
                    <span className="text-neutral-800 font-medium">
                      {preCheckInData.preferences.temperature}°F
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-neutral-500">Pillow Type</span>
                    <span className="text-neutral-800 font-medium">
                      {preCheckInData.preferences.pillowType.join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`w-full h-10 text-white font-semibold rounded-lg transition-all text-[13px] mt-6 flex items-center justify-center gap-2 ${isSubmitting
                ? 'bg-neutral-400 cursor-not-allowed'
                : 'bg-terra-500 hover:bg-terra-600 active:scale-[0.98]'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Completing Pre-Check-In...
                </>
              ) : (
                'Complete Pre-Check-In'
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
