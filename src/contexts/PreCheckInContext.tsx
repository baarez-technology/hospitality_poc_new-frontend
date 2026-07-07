import { createContext, useContext, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { precheckinService } from '@/api/services/precheckin.service';
import { bookingService } from '@/api/services/booking.service';
import { roomTypesService } from '@/api/services/roomTypes.service';
import type { PreCheckInData as PreCheckInServiceData, PreCheckInRead } from '@/api/services/precheckin.service';

export interface PreCheckInData {
  bookingNumber: string;
  reservationId?: number;
  guestName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  personalInfo: {
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  roomPreferences: {
    floor: 'low' | 'mid' | 'high' | 'any';
    view: 'ocean' | 'city' | 'garden' | 'any';
    bedType: 'king' | 'queen' | 'twin' | 'any';
    quietness: 'quiet' | 'moderate' | 'any';
  };
  selectedRoom?: {
    slug: string;
    name: string;
    category?: string;
    price?: number;
    image?: string;
    aiScore: number;
    aiReasoning: string[];
  };
  travelDetails: {
    arrivalTime: string;
    departureTime: string;
    flightNumber: string;
    purpose: 'business' | 'leisure' | 'event' | 'other';
    transportationNeeded: boolean;
  };
  documents: {
    idFrontUrl?: string;
    idBackUrl?: string;
    idType: 'passport' | 'drivers-license' | 'national-id';
    idVerified?: boolean;
    idVerificationConfidence?: number;
    extractedName?: string;
  };
  preferences: {
    pillowType: string[];
    temperature: number;
    minibarPreferences: string[];
    dietaryRestrictions: string[];
  };
  specialRequests: {
    requests: string;
    earlyCheckIn: boolean;
    lateCheckOut: boolean;
  };
  digitalKey?: {
    keyId: string;
    activated: boolean;
    qrCode: string;
  };
}

interface PreCheckInContextType {
  preCheckInData: PreCheckInData | null;
  isLoading: boolean;
  updatePreCheckInData: (data: Partial<PreCheckInData>) => void;
  savePreCheckIn: () => Promise<void>;
  loadPreCheckIn: (reservationId: number) => Promise<void>;
  getRecommendedRooms: () => Promise<any[]>;
  getRoomTypes: () => Promise<any[]>;
  resetPreCheckIn: () => void;
}

const PreCheckInContext = createContext<PreCheckInContextType | undefined>(undefined);

const initialData: PreCheckInData = {
  bookingNumber: '',
  guestName: '',
  roomType: '',
  checkInDate: '',
  checkOutDate: '',
  personalInfo: {
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  roomPreferences: {
    floor: 'any',
    view: 'any',
    bedType: 'any',
    quietness: 'any',
  },
  travelDetails: {
    arrivalTime: '',
    departureTime: '',
    flightNumber: '',
    purpose: 'leisure',
    transportationNeeded: false,
  },
  documents: {
    idType: 'passport',
  },
  preferences: {
    pillowType: [],
    temperature: 72,
    minibarPreferences: [],
    dietaryRestrictions: [],
  },
  specialRequests: {
    requests: '',
    earlyCheckIn: false,
    lateCheckOut: false,
  },
};

export function PreCheckInProvider({ children }: { children: ReactNode }) {
  const [preCheckInData, setPreCheckInData] = useState<PreCheckInData | null>(initialData);
  const queryClient = useQueryClient();

  // Load pre-checkin data from booking
  const loadPreCheckInMutation = useMutation({
    mutationFn: async (reservationId: number) => {
      // First, try to get existing pre-checkin
      const existing = await precheckinService.getByReservation(reservationId);

      if (existing) {
        // Load existing data
        const booking = await bookingService.getBooking(String(reservationId));

        return {
          bookingNumber: booking.bookingNumber,
          reservationId: existing.reservation_id,
          guestName: `${booking.guestInfo?.firstName || ''} ${booking.guestInfo?.lastName || ''}`.trim() || 'Unknown Guest',
          roomType: booking.room?.name || '',
          checkInDate: booking.checkIn,
          checkOutDate: booking.checkOut,
          personalInfo: {
            email: existing.email,
            phone: existing.phone,
            address: existing.address || '',
            city: existing.city || '',
            state: existing.state || '',
            zipCode: existing.zip_code || '',
            country: existing.country || '',
          },
          roomPreferences: {
            floor: (existing.floor_preference as any) || 'any',
            view: (existing.view_preference as any) || 'any',
            bedType: (existing.bed_type_preference as any) || 'any',
            quietness: (existing.quietness_preference as any) || 'any',
          },
          selectedRoom: existing.selected_room_id ? {
            slug: String(existing.selected_room_id),
            name: booking.room?.name || '',
            category: booking.room?.category || '',
            price: booking.room?.price,
            aiScore: existing.ai_score || 0,
            aiReasoning: existing.ai_reasoning ? JSON.parse(existing.ai_reasoning) : [],
          } : undefined,
          travelDetails: {
            arrivalTime: existing.arrival_time || '',
            departureTime: existing.departure_time || '',
            flightNumber: existing.flight_number || '',
            purpose: (existing.purpose as any) || 'leisure',
            transportationNeeded: existing.transportation_needed,
          },
          documents: {
            idFrontUrl: existing.id_front_url,
            idBackUrl: existing.id_back_url,
            idType: (existing.id_type as any) || 'passport',
          },
          preferences: {
            pillowType: existing.pillow_type ? JSON.parse(existing.pillow_type) : [],
            temperature: existing.temperature || 72,
            minibarPreferences: existing.minibar_preferences ? JSON.parse(existing.minibar_preferences) : [],
            dietaryRestrictions: existing.dietary_restrictions ? JSON.parse(existing.dietary_restrictions) : [],
          },
          specialRequests: {
            requests: existing.special_requests || '',
            earlyCheckIn: existing.early_check_in,
            lateCheckOut: existing.late_check_out,
          },
          digitalKey: existing.digital_key_id ? {
            keyId: existing.digital_key_id,
            activated: existing.digital_key_activated,
            qrCode: existing.qr_code || '',
          } : undefined,
        } as PreCheckInData;
      } else {
        // Load from booking
        const booking = await bookingService.getBooking(String(reservationId));
        return {
          ...initialData,
          bookingNumber: booking.bookingNumber,
          reservationId: Number(booking.id),
          guestName: `${booking.guestInfo?.firstName || ''} ${booking.guestInfo?.lastName || ''}`.trim() || 'Unknown Guest',
          roomType: booking.room?.name || '',
          checkInDate: booking.checkIn,
          checkOutDate: booking.checkOut,
        } as PreCheckInData;
      }
    },
    onSuccess: (data) => {
      setPreCheckInData(data);
    },
    onError: (error: any) => {
      console.error('Error loading pre-checkin:', error);
      // Don't show error if it's just that pre-checkin doesn't exist yet (that's normal)
      if (error.response?.status !== 404 && error.response?.status !== 204) {
        toast.error(error.response?.data?.detail || error.message || 'Failed to load pre-checkin data');
      }
    },
  });

  // Save pre-checkin
  const savePreCheckInMutation = useMutation({
    mutationFn: async (data: PreCheckInData) => {
      if (!data.reservationId) {
        throw new Error('Reservation ID is required');
      }

      const payload: PreCheckInServiceData = {
        reservation_id: data.reservationId,
        email: data.personalInfo.email,
        phone: data.personalInfo.phone,
        address: data.personalInfo.address,
        city: data.personalInfo.city,
        state: data.personalInfo.state,
        zip_code: data.personalInfo.zipCode,
        country: data.personalInfo.country,
        floor_preference: data.roomPreferences.floor === 'any' ? undefined : data.roomPreferences.floor,
        view_preference: data.roomPreferences.view === 'any' ? undefined : data.roomPreferences.view,
        bed_type_preference: data.roomPreferences.bedType === 'any' ? undefined : data.roomPreferences.bedType,
        quietness_preference: data.roomPreferences.quietness === 'any' ? undefined : data.roomPreferences.quietness,
        arrival_time: data.travelDetails.arrivalTime,
        departure_time: data.travelDetails.departureTime,
        flight_number: data.travelDetails.flightNumber,
        purpose: data.travelDetails.purpose,
        transportation_needed: data.travelDetails.transportationNeeded,
        pillow_type: JSON.stringify(data.preferences.pillowType),
        temperature: data.preferences.temperature,
        minibar_preferences: JSON.stringify(data.preferences.minibarPreferences),
        dietary_restrictions: JSON.stringify(data.preferences.dietaryRestrictions),
        special_requests: data.specialRequests.requests,
        early_check_in: data.specialRequests.earlyCheckIn,
        late_check_out: data.specialRequests.lateCheckOut,
      };

      // Check if pre-checkin exists
      const existing = await precheckinService.getByReservation(data.reservationId);

      // Prepare update payload (only fields allowed in PreCheckInUpdate)
      // Note: room_type_slug stores the selected room type; hotel assigns actual room later
      const updatePayload: any = {
        room_type_slug: data.selectedRoom?.slug || undefined,
        ai_score: data.selectedRoom?.aiScore,
        ai_reasoning: data.selectedRoom?.aiReasoning ? JSON.stringify(data.selectedRoom.aiReasoning) : undefined,
        id_front_url: data.documents.idFrontUrl,
        id_back_url: data.documents.idBackUrl,
        id_type: data.documents.idType,
        digital_key_id: data.digitalKey?.keyId,
        digital_key_activated: data.digitalKey?.activated || false,
        qr_code: data.digitalKey?.qrCode,
        status: 'completed',
        // ETA/ETD: keep pre-check-in arrival_time and departure_time in sync on update
        arrival_time: data.travelDetails.arrivalTime || undefined,
        departure_time: data.travelDetails.departureTime || undefined,
      };

      if (existing) {
        // Update existing pre-checkin
        const updated = await precheckinService.update(existing.id, updatePayload);
        return updated;
      } else {
        // Create new pre-checkin first
        const created = await precheckinService.create(payload);
        // Then update with room selection, documents, digital key, and status
        if (created?.id) {
          const updated = await precheckinService.update(created.id, updatePayload);
          return updated || created;
        }
        return created;
      }
    },
    onSuccess: () => {
      toast.success('Pre-check-in saved successfully');
      queryClient.invalidateQueries({ queryKey: ['precheckin'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save pre-check-in');
    },
  });

  // Get recommended rooms
  const getRecommendedRoomsMutation = useMutation({
    mutationFn: async (precheckinId: number) => {
      const result = await precheckinService.recommendRooms(precheckinId);
      return result.recommended_rooms || [];
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to get room recommendations');
    },
  });

  const updatePreCheckInData = (data: Partial<PreCheckInData>) => {
    setPreCheckInData((prev) => {
      if (!prev) {
        // If no previous data, merge with initial data
        return { ...initialData, ...data } as PreCheckInData;
      }
      return { ...prev, ...data };
    });
  };

  const savePreCheckIn = async () => {
    if (!preCheckInData) {
      toast.error('No pre-check-in data to save');
      return;
    }
    await savePreCheckInMutation.mutateAsync(preCheckInData);
  };

  const loadPreCheckIn = async (reservationId: number) => {
    await loadPreCheckInMutation.mutateAsync(reservationId);
  };

  const getRecommendedRooms = async () => {
    if (!preCheckInData?.reservationId) {
      toast.error('Please load pre-check-in data first');
      return [];
    }

    // Build payload with ALL preferences including room preferences
    const createPayload: PreCheckInServiceData = {
      reservation_id: preCheckInData.reservationId,
      email: preCheckInData.personalInfo.email || '',
      phone: preCheckInData.personalInfo.phone || '',
      address: preCheckInData.personalInfo.address,
      city: preCheckInData.personalInfo.city,
      state: preCheckInData.personalInfo.state,
      zip_code: preCheckInData.personalInfo.zipCode,
      country: preCheckInData.personalInfo.country,
      // CRITICAL: Include room preferences for AI recommendations
      floor_preference: preCheckInData.roomPreferences?.floor === 'any' ? undefined : preCheckInData.roomPreferences?.floor,
      view_preference: preCheckInData.roomPreferences?.view === 'any' ? undefined : preCheckInData.roomPreferences?.view,
      bed_type_preference: preCheckInData.roomPreferences?.bedType === 'any' ? undefined : preCheckInData.roomPreferences?.bedType,
      quietness_preference: preCheckInData.roomPreferences?.quietness === 'any' ? undefined : preCheckInData.roomPreferences?.quietness,
    };

    // Get or create pre-checkin with preferences
    let precheckin = await precheckinService.getByReservation(preCheckInData.reservationId);
    if (!precheckin) {
      // Create pre-checkin with all preferences
      const created = await precheckinService.create(createPayload);
      precheckin = created;
    } else {
      // Update existing pre-checkin with current preferences before getting recommendations
      // This ensures the backend has the latest preferences for AI scoring
      try {
        await precheckinService.update(precheckin.id, {
          floor_preference: preCheckInData.roomPreferences?.floor === 'any' ? undefined : preCheckInData.roomPreferences?.floor,
          view_preference: preCheckInData.roomPreferences?.view === 'any' ? undefined : preCheckInData.roomPreferences?.view,
          bed_type_preference: preCheckInData.roomPreferences?.bedType === 'any' ? undefined : preCheckInData.roomPreferences?.bedType,
          quietness_preference: preCheckInData.roomPreferences?.quietness === 'any' ? undefined : preCheckInData.roomPreferences?.quietness,
        } as any);
      } catch (e) {
        console.warn('Could not update preferences before recommendation:', e);
      }
    }

    const rooms = await getRecommendedRoomsMutation.mutateAsync(precheckin.id);
    return rooms;
  };

  const getRoomTypes = async () => {
    try {
      const filters: any = {};
      if (preCheckInData?.checkInDate) filters.checkIn = preCheckInData.checkInDate;
      if (preCheckInData?.checkOutDate) filters.checkOut = preCheckInData.checkOutDate;
      const roomTypes = await roomTypesService.getRoomTypes(filters);
      return Array.isArray(roomTypes) ? roomTypes : [];
    } catch (error) {
      console.error('Failed to fetch room types:', error);
      return [];
    }
  };

  const resetPreCheckIn = () => {
    setPreCheckInData(null);
  };

  return (
    <PreCheckInContext.Provider
      value={{
        preCheckInData,
        isLoading: loadPreCheckInMutation.isPending || savePreCheckInMutation.isPending,
        updatePreCheckInData,
        savePreCheckIn,
        loadPreCheckIn,
        getRecommendedRooms,
        getRoomTypes,
        resetPreCheckIn,
      }}
    >
      {children}
    </PreCheckInContext.Provider>
  );
}

export function usePreCheckIn() {
  const context = useContext(PreCheckInContext);
  if (!context) {
    throw new Error('usePreCheckIn must be used within PreCheckInProvider');
  }
  return context;
}
