import { Plus, Download } from 'lucide-react';

export default function QuickActions({ onNewBooking, onExport }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onExport}
        className="h-11 px-4 rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-[#A57865]/30 text-neutral-700 hover:text-neutral-900 text-sm font-medium transition-all duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-neutral-400 active:scale-95"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      <button
        onClick={onNewBooking}
        className="h-11 px-5 rounded-xl bg-[#A57865] hover:bg-[#8E6554] text-white text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A57865] active:scale-95"
      >
        <Plus className="w-4 h-4" />
        New Booking
      </button>
    </div>
  );
}
