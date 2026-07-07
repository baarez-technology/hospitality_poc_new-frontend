import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  BedDouble,
  Edit,
  MessageSquare,
  UserX,
  Tag,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  StickyNote,
  Loader2,
  Home,
  Clock
} from 'lucide-react';
import {
  calculateLoyaltyTier,
  LOYALTY_TIERS,
  GUEST_STATUS_CONFIG,
  EMOTION_CONFIG,
  formatDate,
  formatDateTime,
} from '@/utils/admin/guests';
import { useCurrency } from '@/hooks/useCurrency';
import { guestsService, type GuestFullProfile } from '@/api/services/guests.service';
import { Button } from '../../ui2/Button';

export default function GuestDrawer({
  guest,
  isOpen,
  onClose,
  onEdit,
  onMessage,
  onBlacklist,
  onAddNote,
  onDeleteNote,
  onViewProfile
}) {
  const { formatCurrency, symbol } = useCurrency();
  const [newNote, setNewNote] = useState('');
  const [fullProfile, setFullProfile] = useState<GuestFullProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Fetch full profile when drawer opens
  useEffect(() => {
    if (isOpen && guest?.id) {
      const fetchProfile = async () => {
        try {
          setIsLoadingProfile(true);
          const profile = await guestsService.getProfile(guest.id);
          setFullProfile(profile);
        } catch (err) {
          console.error('Failed to fetch full profile:', err);
          // Keep using basic guest data
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    } else {
      setFullProfile(null);
    }
  }, [isOpen, guest?.id]);

  // Early return AFTER all hooks have been called
  // Note: Scroll locking and ESC key are handled by useDrawer hook
  if (!isOpen || !guest) return null;

  // Use full profile data if available, fallback to basic guest data
  const displayGuest = fullProfile || guest;

  // Calculate loyalty tier
  const loyaltyTier = calculateLoyaltyTier(guest.totalStays || 0, guest.totalSpent || 0);
  const tierConfig = LOYALTY_TIERS[loyaltyTier];

  // Get status and emotion configs with fallbacks
  const statusKey = guest.status || 'Active';
  const emotionKey = guest.emotion || 'neutral';

  const status = GUEST_STATUS_CONFIG[statusKey] || GUEST_STATUS_CONFIG['Active'] || {
    bgColor: 'bg-neutral-100',
    textColor: 'text-neutral-700',
    borderColor: 'border-neutral-300',
    label: statusKey
  };

  const emotion = EMOTION_CONFIG[emotionKey] || EMOTION_CONFIG['neutral'] || {
    emoji: '😐',
    label: 'Neutral',
    bgColor: 'bg-yellow-50',
    color: 'text-yellow-700'
  };

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(guest.id, newNote.trim());
      setNewNote('');
    }
  };

  // Normalize preferences - handle both array and object formats
  const guestPreferences = Array.isArray(guest.preferences)
    ? guest.preferences
    : guest.preferences?.bedType
    ? [`${guest.preferences.bedType}`, guest.preferences.floor, guest.preferences.allergies !== 'None' ? `Allergies: ${guest.preferences.allergies}` : null].filter(Boolean)
    : [];

  // Normalize notes - use API notes if available, handle both array and string formats
  const apiNotes = displayGuest?.notes;
  const guestNotes = Array.isArray(apiNotes)
    ? apiNotes
    : Array.isArray(guest.notes)
    ? guest.notes
    : guest.notes
    ? [{ id: 'legacy', text: guest.notes, date: guest.updatedAt || new Date().toISOString() }]
    : [];

  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-[60]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 bottom-0 right-0 h-screen w-full max-w-md bg-white shadow-xl border-l border-neutral-200 z-[70] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-neutral-200">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-serif font-bold text-neutral-900">
                  {guest.name}
                </h2>
                <p className="text-sm text-neutral-500 mt-1">{guest.email}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>

            {/* Loyalty Tier, Status & Emotion Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Loyalty Tier Badge */}
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${tierConfig.bgColor} ${tierConfig.textColor}`}>
                <Award className="w-3 h-3" />
                {tierConfig.icon} {loyaltyTier}
              </span>
              {/* Status Badge */}
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${status.bgColor} ${status.textColor}`}>
                {status.label || statusKey}
              </span>
              {/* Emotion Badge */}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${emotion.bgColor || 'bg-yellow-50'} ${emotion.color || 'text-yellow-700'}`}>
                <span className="text-sm">{emotion.emoji}</span>
                {emotion.label}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Contact Information
                </h3>
              </div>
              <div className="space-y-3 bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#A57865]" />
                  </div>
                  <a
                    href={`mailto:${guest.email}`}
                    className="text-sm text-neutral-700 hover:text-[#A57865] hover:underline transition-colors"
                  >
                    {guest.email}
                  </a>
                </div>
                {guest.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-[#A57865]" />
                    </div>
                    <a
                      href={`tel:${guest.phone}`}
                      className="text-sm text-neutral-700 hover:text-[#A57865] hover:underline transition-colors"
                    >
                      {guest.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#A57865]" />
                  </div>
                  <span className="text-sm font-medium text-neutral-900">{guest.country}</span>
                </div>
              </div>
            </section>

          {/* Stay Statistics */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Stay Statistics
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-[#A57865]/5 to-[#A57865]/10 rounded-xl p-4 border border-[#A57865]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#A57865]/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-[#A57865]" />
                    </div>
                  </div>
                  <p className="text-xs font-medium text-[#A57865] mb-1">Total Stays</p>
                  <p className="text-3xl font-bold text-neutral-900">{guest.totalStays || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-[#4E5840]/5 to-[#4E5840]/10 rounded-xl p-4 border border-[#4E5840]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#4E5840]/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-[#4E5840]">{symbol}</span>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-[#4E5840] mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-[#4E5840]">
                    {formatCurrency(guest.totalSpent || 0)}
                  </p>
                </div>
              </div>
              {guest.lastStay && (
                <div className="bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#A57865]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Last Stay</p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatDate(guest.lastStay)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Tags */}
            {guest.tags && guest.tags.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#5C9BA4] rounded-full"></div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Tags
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {guest.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#5C9BA4]/10 text-[#5C9BA4] rounded-full text-xs font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

          {/* Preferences */}
            {guestPreferences.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#CDB261] rounded-full"></div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Preferences
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {guestPreferences.map((pref, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 bg-[#CDB261]/10 text-[#CDB261] rounded-full text-xs font-medium"
                    >
                      {pref}
                    </span>
                  ))}
                </div>
              </section>
            )}

          {/* Stay History / Bookings */}
            {(displayGuest.bookings?.length > 0 || displayGuest.stay_history?.length > 0 || guest.history?.length > 0) && (
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Stay History ({displayGuest.bookings?.length || displayGuest.stay_history?.length || guest.history?.length || 0})
                    {isLoadingProfile && <Loader2 className="w-3 h-3 animate-spin ml-2 inline" />}
                  </h3>
                </div>
                <div className="space-y-2">
                  {/* Show bookings from API if available */}
                  {(displayGuest.bookings || displayGuest.stay_history || guest.history || []).slice(0, 5).map((stay, index) => (
                    <div
                      key={stay.booking_id || stay.id || index}
                      className="bg-[#FAF8F6] rounded-xl p-3.5 border border-neutral-100 hover:border-[#A57865]/30 transition-all duration-150"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {formatDate(stay.arrival_date || stay.check_in || stay.date)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-neutral-500">
                              {stay.nights || (stay.departure_date && stay.arrival_date ? Math.ceil((new Date(stay.departure_date).getTime() - new Date(stay.arrival_date).getTime()) / (1000 * 60 * 60 * 24)) : 1)} nights
                            </span>
                            {stay.room_type && (
                              <span className="text-xs text-neutral-500 flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                {stay.room_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#4E5840]">
                            {formatCurrency(stay.total_price || stay.total_spent || stay.amount || 0)}
                          </p>
                          {stay.status && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              stay.status === 'completed' ? 'bg-green-100 text-green-700' :
                              stay.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                              stay.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-neutral-100 text-neutral-600'
                            }`}>
                              {stay.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Notes */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#4E5840] rounded-full"></div>
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Notes ({guestNotes.length})
                  </h3>
                </div>
              </div>

              {/* Add Note Input */}
              {onAddNote && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                    placeholder="Add a note..."
                    className="flex-1 px-3 py-2 text-sm bg-[#FAF8F6] border border-neutral-200 rounded-lg hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#4E5840] focus:ring-offset-1 focus:bg-white transition-all duration-200"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-3 py-2 bg-[#4E5840]/10 hover:bg-[#4E5840]/20 text-[#4E5840] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Notes List */}
              {guestNotes.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {guestNotes.map((note, idx) => (
                    <div
                      key={note.id || idx}
                      className="bg-[#FAF8F6] rounded-lg p-3 border border-neutral-100 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm text-neutral-800 leading-relaxed">{note.text || note}</p>
                          {note.date && (
                            <p className="text-xs text-neutral-400 mt-1">
                              {formatDateTime(note.date)}
                              {note.author && ` • ${note.author}`}
                            </p>
                          )}
                        </div>
                        {onDeleteNote && note.id && (
                          <button
                            onClick={() => onDeleteNote(guest.id, note.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded text-red-500 transition-all duration-200"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#FAF8F6] rounded-lg p-4 border border-neutral-100 text-center">
                  <StickyNote className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No notes yet</p>
                </div>
              )}
            </section>

          {/* View Full Profile Button */}
            {onViewProfile && (
              <button
                onClick={() => onViewProfile(guest)}
                className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 text-neutral-700 text-sm font-medium rounded-xl hover:border-[#A57865]/30 hover:bg-[#A57865]/5 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Full Profile
              </button>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex-shrink-0 bg-white border-t border-neutral-200 px-6 py-4 shadow-lg">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button variant="primary" onClick={() => onEdit(guest)} icon={Edit}>
              Edit
            </Button>
            <Button variant="outline-neutral" onClick={() => onMessage(guest)} icon={MessageSquare}>
              Message
            </Button>
          </div>
          {guest.status !== 'Blacklisted' && guest.status !== 'blacklisted' && (
            <Button variant="danger" onClick={() => onBlacklist(guest)} icon={UserX} fullWidth>
              Blacklist Guest
            </Button>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
