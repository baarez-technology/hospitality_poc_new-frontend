/**
 * GuestsSearch Component
 * Search bar for guests - Glimmora Design System v5.0
 * Uses ui2/SearchBar matching Bookings pattern
 */

import { SearchBar } from '../ui2/SearchBar';

export default function GuestsSearch({ value, onChange }) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      onClear={() => onChange('')}
      placeholder="Search by name, email, phone, country..."
      size="md"
      className="w-full"
    />
  );
}
