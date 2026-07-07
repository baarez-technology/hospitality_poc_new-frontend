/**
 * GuestRow Component
 * Table row for guest - Glimmora Design System v5.0
 * Matches BookingsTable row styling exactly
 */

import { Eye, Pencil, Mail, Trash2 } from 'lucide-react';
import { IconButton } from '../ui2/Button';

export default function GuestRow({ guest, onClick, onEdit, onMessage, onDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const emotionConfig = {
    positive: { color: 'bg-sage-50 text-sage-700 border-sage-200', icon: '😊', label: 'Positive' },
    neutral: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '😐', label: 'Neutral' },
    negative: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '😞', label: 'Negative' }
  };

  const statusConfig = {
    vip: { color: 'bg-terra-50 text-terra-700 border-terra-200', label: '⭐ VIP' },
    normal: { color: 'bg-neutral-100 text-neutral-700 border-neutral-200', label: 'Normal' },
    review: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: '⚠️ Review' },
    blacklisted: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: '🚫 Blocked' }
  };

  const emotion = emotionConfig[guest.emotion] || emotionConfig.neutral;
  const status = statusConfig[guest.status] || statusConfig.normal;

  // Build VIP label with level
  const vipLabel = guest.status === 'vip' && guest.vipLevel && guest.vipLevel !== 'none'
    ? `⭐ ${guest.vipLevel}`
    : status.label;

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    if (action === 'view' && onClick) {
      onClick(guest);
    } else if (action === 'edit' && onEdit) {
      onEdit(guest);
    } else if (action === 'message' && onMessage) {
      onMessage(guest);
    } else if (action === 'delete' && onDelete) {
      onDelete(guest);
    }
  };

  return (
    <tr
      className="group bg-white hover:bg-neutral-50/30 transition-colors duration-100"
    >
      {/* Name */}
      <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
        <span className="text-sm font-semibold text-neutral-900 group-hover:text-terra-600 transition-colors">
          {guest.name}
        </span>
      </td>

      {/* Email */}
      <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
        <span className="text-xs text-neutral-500">
          {guest.email}
        </span>
      </td>

      {/* Country */}
      <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
        <span className="text-sm text-neutral-700 font-medium">
          {guest.country}
        </span>
      </td>

      {/* Last Stay */}
      <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
        <span className="text-sm text-neutral-700 font-medium">
          {formatDate(guest.lastStay)}
        </span>
      </td>

      {/* Total Stays */}
      <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
        <span className="text-sm text-neutral-600">
          {guest.totalStays}
        </span>
      </td>

      {/* Emotion */}
      <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${emotion.color}`}>
          {emotion.icon}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4 text-sm text-neutral-700 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${status.color}`}>
          {vipLabel}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <IconButton
            icon={Eye}
            size="sm"
            variant="ghost"
            label="View"
            onClick={(e) => handleActionClick(e, 'view')}
          />
          <IconButton
            icon={Pencil}
            size="sm"
            variant="ghost"
            label="Edit"
            onClick={(e) => handleActionClick(e, 'edit')}
          />
          <IconButton
            icon={Mail}
            size="sm"
            variant="ghost"
            label="Message"
            onClick={(e) => handleActionClick(e, 'message')}
          />
          <IconButton
            icon={Trash2}
            size="sm"
            variant="ghost"
            label="Delete"
            onClick={(e) => handleActionClick(e, 'delete')}
            className="hover:text-rose-500 hover:bg-rose-50"
          />
        </div>
      </td>
    </tr>
  );
}
