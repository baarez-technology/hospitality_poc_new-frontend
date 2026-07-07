/**
 * StaffSearch Component
 * Search bar for staff - Glimmora Design System v5.0
 */

import { Search } from 'lucide-react';

export default function StaffSearch({ value, onChange }) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name, role, or email..."
        className="w-full h-9 pl-10 pr-4 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
      />
    </div>
  );
}
