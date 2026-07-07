import { ChevronUp, ChevronDown, Users } from 'lucide-react';
import GuestRow from './GuestRow';

export default function GuestsTable({ guests, sortField, sortDirection, onSort, onGuestClick }) {
  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'country', label: 'Country', sortable: true },
    { key: 'lastStay', label: 'Last Stay', sortable: true },
    { key: 'totalStays', label: 'Stays', sortable: true },
    { key: 'emotion', label: 'Emotion', sortable: true },
    { key: 'status', label: 'Status', sortable: true }
  ];

  if (guests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-50 rounded-xl mb-3">
            <Users className="w-7 h-7 text-neutral-400" />
          </div>
          <p className="text-neutral-900 text-sm font-semibold">No guests found</p>
          <p className="text-neutral-500 text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[180px_200px_120px_120px_100px_110px_110px] gap-3 items-center h-11 px-5 bg-neutral-50 border-b border-neutral-200">
        {columns.map((column) => (
          <button
            key={column.key}
            onClick={() => column.sortable && onSort(column.key)}
            disabled={!column.sortable}
            className={`flex items-center gap-1.5 text-xs font-semibold text-neutral-600 uppercase tracking-wider transition-colors duration-200 ${
              column.sortable ? 'cursor-pointer hover:text-[#A57865] active:scale-95' : ''
            }`}
          >
            {column.label}
            {column.sortable && <SortIcon field={column.key} />}
          </button>
        ))}
      </div>

      {/* Table Body */}
      <div>
        {guests.map((guest) => (
          <GuestRow
            key={guest.id}
            guest={guest}
            onClick={onGuestClick}
          />
        ))}
      </div>
    </div>
  );
}
