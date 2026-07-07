import { ChevronUp, ChevronDown } from 'lucide-react';
import BookingRow from './BookingRow';

export default function BookingsTable({ bookings, sortConfig, onSort, onBookingClick }) {
  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const columns = [
    { key: 'guest', label: 'Guest Name', sortable: true },
    { key: 'id', label: 'Booking ID', sortable: true },
    { key: 'checkIn', label: 'Check-in', sortable: true },
    { key: 'nights', label: 'Nights', sortable: true },
    { key: 'room', label: 'Room', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
  ];

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[170px_110px_120px_70px_150px_110px_110px_120px] gap-4 items-center h-11 px-5 bg-neutral-50 border-b border-neutral-200">
        {columns.map((column) => (
          <button
            key={column.key}
            onClick={() => column.sortable && onSort(column.key)}
            disabled={!column.sortable}
            className={`flex items-center gap-1.5 text-xs font-semibold text-neutral-600 uppercase tracking-wider transition-colors duration-200 ${
              column.sortable ? 'cursor-pointer hover:text-[#A57865] active:scale-95' : ''
            } ${column.key === 'amount' ? 'justify-end' : ''}`}
          >
            {column.label}
            {column.sortable && <SortIcon field={column.key} />}
          </button>
        ))}
      </div>

      {/* Table Body */}
      <div>
        {bookings.length === 0 ? (
          <div className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-50 rounded-xl mb-3">
              <svg
                className="w-7 h-7 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-neutral-900 text-sm font-semibold">No bookings found</p>
            <p className="text-neutral-500 text-xs mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingRow
              key={booking.id}
              booking={booking}
              onClick={() => onBookingClick(booking)}
            />
          ))
        )}
      </div>
    </div>
  );
}
