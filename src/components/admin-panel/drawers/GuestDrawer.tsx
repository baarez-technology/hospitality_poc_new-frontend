import { X, Mail, Phone, Star, Heart, TrendingUp, Calendar, Edit, MessageSquare, History } from 'lucide-react';
import { Button } from '../../ui2/Button';

export default function GuestDrawer({ isOpen, data, onClose }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`relative w-full max-w-2xl bg-white shadow-xl h-full overflow-y-auto transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Guest Profile</h2>
            <p className="text-sm text-neutral-600 mt-1">Complete guest information</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Guest Header */}
          <div className="bg-primary-gradient rounded-xl p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[#A57865] opacity-90"></div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{data.name}</h3>
                  <div className="flex items-center gap-3">
                    {data.vip && (
                      <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-bold">
                        VIP
                      </span>
                    )}
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                      {data.loyaltyTier}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-3xl">😊</span>
                  </div>
                  <p className="text-xs font-semibold">Emotion Score</p>
                  <p className="text-2xl font-bold">{data.emotionScore}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {data.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {data.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[#FAF8F6] rounded-xl p-6">
            <h3 className="font-serif text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-sunset-500" />
              Guest Preferences
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(data.preferences).map(([key, value]) => (
                <div key={key} className="bg-white p-3 rounded-lg border border-neutral-200">
                  <p className="text-xs text-neutral-500 capitalize mb-1">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-sm font-semibold text-neutral-900">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stay History */}
          <div>
            <h3 className="font-serif text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-aurora-500" />
              Stay History
            </h3>
            <div className="space-y-3">
              {data.stayHistory.map((stay, index) => (
                <div key={index} className={`p-4 rounded-xl border-2 ${
                  stay.status === 'current'
                    ? 'border-[#5C9BA4]/30 bg-[#5C9BA4]/10'
                    : 'border-neutral-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-neutral-900">Room {stay.room}</p>
                      <p className="text-sm text-neutral-600">
                        {new Date(stay.checkIn).toLocaleDateString()} - {new Date(stay.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                    {stay.status === 'current' ? (
                      <span className="px-3 py-1 bg-[#5C9BA4] text-white rounded-full text-xs font-semibold">
                        Current
                      </span>
                    ) : stay.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-sm">{stay.rating}.0</span>
                      </div>
                    ) : null}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-md text-xs ${
                    stay.status === 'current'
                      ? 'bg-[#5C9BA4]/15 text-[#5C9BA4]'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {stay.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upsell Suggestions */}
          <div className="bg-[#4E5840]/10 rounded-xl p-6 border border-[#4E5840]/30">
            <h3 className="font-serif text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Upsell Suggestions
            </h3>
            <div className="space-y-2">
              {data.upsellSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <p className="text-sm text-neutral-700">{suggestion}</p>
                  <button className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-md transition-colors">
                    Offer
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="bg-[#CDB261]/20 rounded-xl p-6 border border-[#CDB261]/30">
              <h3 className="font-serif text-lg font-bold text-sunset-900 mb-2">Important Notes</h3>
              <p className="text-sm text-sunset-800">{data.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
            <Button variant="primary" icon={Edit}>
              Edit Profile
            </Button>
            <Button variant="secondary" icon={MessageSquare}>
              Send Message
            </Button>
            <Button variant="success" icon={History}>
              View History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
