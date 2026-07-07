import { Search } from 'lucide-react';

export default function GuestsSearch({ value, onChange }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
      <input
        type="text"
        placeholder="Search by name, email, phone, country..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 pl-12 pr-4 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 hover:border-[#A57865]/30 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
      />
    </div>
  );
}
