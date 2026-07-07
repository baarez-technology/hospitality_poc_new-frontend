/**
 * RoomsSearch Component
 * Search bar for rooms - Glimmora Design System v5.0
 * Uses ui2/SearchBar matching Bookings pattern
 */

import { SearchBar } from '../ui2/SearchBar';

export default function RoomsSearch({ value, onChange }) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      onClear={() => onChange('')}
      placeholder="Search by room number, type, or guest..."
      size="md"
      className="w-full"
    />
  );
}
