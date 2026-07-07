/**
 * Events & Banquet Constants and Pricing Helpers
 */

export const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'conference', label: 'Conference' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'social', label: 'Social' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'other', label: 'Other' },
] as const;

export const EVENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  inquiry:       { label: 'Inquiry',       color: 'bg-neutral-100 text-neutral-600' },
  proposal_sent: { label: 'Proposal Sent', color: 'bg-blue-100 text-blue-700' },
  confirmed:     { label: 'Confirmed',     color: 'bg-green-100 text-green-700' },
  upcoming:      { label: 'Upcoming',      color: 'bg-amber-100 text-amber-700' },
  active:        { label: 'Active',        color: 'bg-purple-100 text-purple-700' },
  completed:     { label: 'Completed',     color: 'bg-neutral-200 text-neutral-700' },
  cancelled:     { label: 'Cancelled',     color: 'bg-red-100 text-red-700' },
};

export const MEAL_SLOTS = ['breakfast', 'lunch', 'hi_tea', 'dinner'] as const;
export const MEAL_SLOT_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  hi_tea: 'Hi-Tea',
  dinner: 'Dinner',
};

export const SETUP_STYLES = [
  { value: 'theatre', label: 'Theatre' },
  { value: 'banquet', label: 'Banquet' },
  { value: 'classroom', label: 'Classroom' },
  { value: 'cocktail', label: 'Cocktail' },
] as const;

export const ADDON_SERVICES = [
  { id: 'decoration', name: 'Decoration', defaultPrice: 25000 },
  { id: 'dj', name: 'DJ', defaultPrice: 15000 },
  { id: 'av_equipment', name: 'AV Equipment', defaultPrice: 10000 },
  { id: 'flowers', name: 'Flower Arrangement', defaultPrice: 20000 },
  { id: 'photography', name: 'Photography', defaultPrice: 30000 },
] as const;

// SST: Import centralized tax rates
import { TAX_RATE_LOW, TAX_RATE_HIGH, TAX_THRESHOLD } from '@/utils/pricing-sst';

// GST rates by category (rooms rate is slab-based: 5% for ≤7500/night, 18% for >7500/night)
export const GST_RATES = {
  rooms: TAX_RATE_LOW, // Default lower slab, actual rate depends on room rate
  food: 0.05,
  services: 0.18,
} as const;

export interface RoomBlock {
  id: string;
  roomType: string;
  quantity: number;
  ratePerNight: number;
  checkIn: string;
  checkOut: string;
}

export interface MealEntry {
  date: string;
  slot: string;
  packageName: string;
  pricePerPlate: number;
  guestCount: number;
}

export interface VenueSelection {
  hallId: number | null;
  hallName: string;
  ratePerDay: number;
  setupStyle: string;
  days: number;
}

export interface ServiceSelection {
  serviceId: string;
  name: string;
  price: number;
  selected: boolean;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function calculateRoomTotal(rooms: RoomBlock[]): number {
  return rooms.reduce((sum, r) => sum + r.quantity * r.ratePerNight * calculateNights(r.checkIn, r.checkOut), 0);
}

export function calculateMealTotal(meals: MealEntry[]): number {
  return meals.reduce((sum, m) => sum + m.pricePerPlate * m.guestCount, 0);
}

export function calculateVenueTotal(venue: VenueSelection): number {
  if (!venue.hallId) return 0;
  return venue.ratePerDay * venue.days;
}

export function calculateServicesTotal(services: ServiceSelection[]): number {
  return services.filter(s => s.selected).reduce((sum, s) => sum + s.price, 0);
}

export function calculatePricing(rooms: RoomBlock[], meals: MealEntry[], venue: VenueSelection, services: ServiceSelection[]) {
  const roomsTotal = calculateRoomTotal(rooms);
  const mealsTotal = calculateMealTotal(meals);
  const venueTotal = calculateVenueTotal(venue);
  const servicesTotal = calculateServicesTotal(services);

  const subtotal = roomsTotal + mealsTotal + venueTotal + servicesTotal;

  const roomsGST = roomsTotal * GST_RATES.rooms;
  const mealsGST = mealsTotal * GST_RATES.food;
  const venueGST = venueTotal * GST_RATES.services;
  const servicesGST = servicesTotal * GST_RATES.services;
  const totalGST = roomsGST + mealsGST + venueGST + servicesGST;

  return {
    roomsTotal, mealsTotal, venueTotal, servicesTotal,
    subtotal,
    roomsGST, mealsGST, venueGST, servicesGST, totalGST,
    grandTotal: subtotal + totalGST,
  };
}

export function getDatesInRange(start: string, end: string): string[] {
  if (!start || !end) return [];
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
