import { SearchBar as UISearchBar } from '../ui2/SearchBar';

export default function SearchBar({ value, onChange, onClear }) {
  return (
    <UISearchBar
      value={value}
      onChange={onChange}
      onClear={onClear}
      placeholder="Search by guest, booking ID, or room..."
      size="md"
      className="w-full"
    />
  );
}
