import { useCurrency } from '@/hooks/useCurrency';

export default function GuestRow({ guest, onClick }) {
  const { formatCurrency } = useCurrency();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const emotionConfig = {
    positive: { color: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/30', icon: '😊', label: 'Positive' },
    neutral: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: '😐', label: 'Neutral' },
    negative: { color: 'bg-red-50 text-red-700 border-red-200', icon: '😞', label: 'Negative' }
  };

  const statusConfig = {
    vip: { color: 'bg-[#A57865]/5 text-[#A57865] border-[#A57865]/30', label: '⭐ VIP' },
    normal: { color: 'bg-neutral-100 text-neutral-700 border-neutral-300', label: 'Normal' },
    review: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: '⚠️ Review' },
    blacklisted: { color: 'bg-red-50 text-red-700 border-red-200', label: '🚫 Blocked' }
  };

  // Default fallbacks for undefined emotion/status
  const defaultEmotion = { color: 'bg-neutral-100 text-neutral-700 border-neutral-200', icon: '😐', label: 'Unknown' };
  const defaultStatus = { color: 'bg-neutral-100 text-neutral-700 border-neutral-300', label: 'Unknown' };

  const emotion = emotionConfig[guest.emotion] || defaultEmotion;
  const status = statusConfig[guest.status] || defaultStatus;

  return (
    <div
      onClick={() => onClick(guest)}
      className="grid grid-cols-[180px_200px_120px_120px_100px_110px_110px] gap-3 items-center h-16 px-5 hover:bg-neutral-50 cursor-pointer transition-all duration-150 border-b border-neutral-100 last:border-b-0 group"
    >
      {/* Name */}
      <div className="text-sm font-semibold text-neutral-900 truncate group-hover:text-[#A57865] transition-colors">
        {guest.name}
      </div>

      {/* Email */}
      <div className="text-sm text-neutral-600 truncate">
        {guest.email}
      </div>

      {/* Country */}
      <div className="text-sm text-neutral-700 font-medium truncate">
        {guest.country}
      </div>

      {/* Last Stay */}
      <div className="text-sm text-neutral-700 font-medium">
        {formatDate(guest.lastStay)}
      </div>

      {/* Total Stays */}
      <div className="text-sm font-semibold text-neutral-900">
        {guest.totalStays}
      </div>

      {/* Emotion */}
      <div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${emotion.color}`}
        >
          {emotion.icon}
        </span>
      </div>

      {/* Status */}
      <div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${status.color}`}
        >
          {status.label}
        </span>
      </div>
    </div>
  );
}
