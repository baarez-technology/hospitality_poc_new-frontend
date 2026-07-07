/**
 * GuestsTable Component
 * Table for guests - Glimmora Design System v5.0
 * Matches BookingsTable styling exactly
 */

import { ChevronUp, ChevronDown, ChevronsUpDown, Users, MoreHorizontal, Eye, Pencil, Mail, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VIP_LEVELS } from '@/utils/guests';

export default function GuestsTable({ guests, sortField, sortDirection, onSort, onGuestClick, onEditGuest, onMessageGuest, onDeleteGuest }) {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const isButtonClick = Object.values(buttonRefs.current).some(
          btn => btn && btn.contains(event.target)
        );
        if (!isButtonClick) {
          setOpenDropdownId(null);
          setDropdownPosition(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!openDropdownId) return;

    const updatePosition = () => {
      const button = buttonRefs.current[openDropdownId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.right - 144
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [openDropdownId]);

  const handleMoreClick = (e, guestId) => {
    e.stopPropagation();
    if (openDropdownId === guestId) {
      setOpenDropdownId(null);
      setDropdownPosition(null);
    } else {
      const button = buttonRefs.current[guestId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.right - 144
        });
      }
      setOpenDropdownId(guestId);
    }
  };

  const SortIndicator = ({ field }) => {
    const sorted = sortField === field ? sortDirection : null;
    const Icon = sorted === 'asc' ? ChevronUp : sorted === 'desc' ? ChevronDown : ChevronsUpDown;
    return <Icon className={`w-3.5 h-3.5 ${sorted ? 'text-terra-500' : 'text-neutral-300'}`} />;
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
    { key: 'country', label: 'Country', sortable: true },
    { key: 'lastStay', label: 'Last Stay', sortable: true },
    { key: 'totalStays', label: 'Stays', sortable: true },
    { key: 'emotion', label: 'Emotion', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'vipLevel', label: 'VIP', sortable: true }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const emotionConfig = {
    positive: { color: 'bg-sage-50 text-sage-700 border-sage-200', icon: '😊' },
    neutral: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '😐' },
    negative: { color: 'bg-rose-50 text-rose-700 border-rose-200', icon: '😞' }
  };

  const statusConfig = {
    vip: { color: 'bg-terra-50 text-terra-700 border-terra-200', label: '⭐ VIP' },
    normal: { color: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/20', label: 'Active' },
    review: { color: 'bg-amber-50 text-amber-700 border-amber-200', label: '⚠️ Review' },
    blacklisted: { color: 'bg-rose-50 text-rose-700 border-rose-200', label: '🚫 Blocked' }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] border-collapse">
        <colgroup>
          <col style={{ width: '170px' }} />
          <col style={{ width: '200px' }} />
          <col style={{ width: '110px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '70px' }} />
          <col style={{ width: '80px' }} />
          <col style={{ width: '100px' }} />
          <col style={{ width: '80px' }} />
          <col style={{ width: '50px' }} />
        </colgroup>
        <thead>
          <tr className="bg-neutral-50/30 border-b border-neutral-100">
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => column.sortable && onSort(column.key)}
                className={`text-left px-4 sm:px-6 py-3 sm:py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap ${
                  column.sortable ? 'cursor-pointer hover:text-neutral-600' : ''
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {column.label}
                  {column.sortable && <SortIndicator field={column.key} />}
                </span>
              </th>
            ))}
            <th className="px-2 py-4 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap sticky right-0 bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-neutral-100">
          {(!guests || guests.length === 0) ? (
            <tr>
              <td colSpan={10} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-lg bg-terra-50 flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-terra-500" />
                  </div>
                  <p className="text-[13px] font-semibold text-neutral-800 mb-1">
                    No guests found
                  </p>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Try adjusting your filters or search query
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            guests.map((guest) => {
              const emotion = emotionConfig[guest.emotion] || emotionConfig.neutral;
              const status = statusConfig[guest.status] || statusConfig.normal;

              return (
                <tr key={guest.id} className="group bg-white hover:bg-neutral-50/30 transition-colors duration-100">
                  {/* Name */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-neutral-900 group-hover:text-terra-600 transition-colors">
                      {guest.name}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-neutral-500">{guest.email}</span>
                  </td>

                  {/* Country */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-700 font-medium">{guest.country}</span>
                  </td>

                  {/* Last Stay */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-700 font-medium">{formatDate(guest.lastStay)}</span>
                  </td>

                  {/* Total Stays */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-neutral-600">{guest.totalStays}</span>
                  </td>

                  {/* Emotion */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${emotion.color}`}>
                      {emotion.icon}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${status.color}`}>
                      {status.label}
                    </span>
                  </td>

                  {/* VIP Level */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {guest.vipLevel && guest.vipLevel !== 'none' && VIP_LEVELS[guest.vipLevel] ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${VIP_LEVELS[guest.vipLevel].bgColor} ${VIP_LEVELS[guest.vipLevel].color} ${VIP_LEVELS[guest.vipLevel].borderColor}`}>
                        {VIP_LEVELS[guest.vipLevel].icon} {VIP_LEVELS[guest.vipLevel].shortLabel}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-300">—</span>
                    )}
                  </td>

                  {/* Actions - Sticky */}
                  <td className="px-2 py-4 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                    <div className="relative inline-block">
                      <button
                        ref={(el) => { buttonRefs.current[guest.id] = el; }}
                        onClick={(e) => handleMoreClick(e, guest.id)}
                        className={`p-1.5 rounded-md hover:bg-neutral-100 transition-colors ${openDropdownId === guest.id ? 'bg-neutral-100' : ''}`}
                      >
                        <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                      </button>

                      {openDropdownId === guest.id && dropdownPosition && createPortal(
                        <div
                          ref={dropdownRef}
                          style={{
                            position: 'fixed',
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`,
                            zIndex: 9999
                          }}
                          className="w-36 bg-white rounded-lg shadow-lg shadow-neutral-900/10 border border-neutral-200 py-1 animate-in fade-in-0 zoom-in-95 duration-100"
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onGuestClick?.(guest); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                          >
                            <Eye className="w-3.5 h-3.5 text-neutral-500" />
                            View
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onEditGuest?.(guest); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                          >
                            <Pencil className="w-3.5 h-3.5 text-neutral-500" />
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onMessageGuest?.(guest); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                          >
                            <Mail className="w-3.5 h-3.5 text-neutral-500" />
                            Message
                          </button>
                          <div className="border-t border-neutral-100 my-1" />
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); onDeleteGuest?.(guest); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </div>,
                        document.body
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
