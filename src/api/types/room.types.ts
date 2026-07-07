export interface Room {
  id: string;
  name: string;
  slug: string;
  number?: string; // Room number
  type?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number; // Non-null when dynamic pricing applied a discount
  capacity?: number;
  maxGuests?: number;
  amenities: string[];
  images: string[];
  bedType?: string;
  size?: number;
  view?: string;
  floor?: number; // Floor number
  status?: string; // Room status (clean, dirty, etc.)
  category?: string;
  features?: string[];
  rating?: number;
  reviewCount?: number;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomFilters {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
}
