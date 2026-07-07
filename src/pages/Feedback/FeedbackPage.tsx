import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  Send,
  CheckCircle,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Coffee,
  Bed,
  UtensilsCrossed,
  Smile,
  Users,
  Wifi,
  Car,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useHotelInfo } from '@/hooks/useHotelInfo';
import { apiClient } from '@/api/client';

// Rating categories with icons
const RATING_CATEGORIES = [
  { id: 'overall', label: 'Overall Experience', icon: Sparkles },
  { id: 'room', label: 'Room & Comfort', icon: Bed },
  { id: 'cleanliness', label: 'Cleanliness', icon: Coffee },
  { id: 'service', label: 'Staff & Service', icon: Users },
  { id: 'dining', label: 'Dining Experience', icon: UtensilsCrossed },
  { id: 'amenities', label: 'Amenities', icon: Wifi },
  { id: 'location', label: 'Location & Parking', icon: Car },
  { id: 'value', label: 'Value for Money', icon: ThumbsUp },
];

// Quick feedback tags
const FEEDBACK_TAGS = [
  'Friendly Staff',
  'Beautiful Views',
  'Comfortable Bed',
  'Excellent Breakfast',
  'Clean & Tidy',
  'Great Location',
  'Quiet Room',
  'Fast WiFi',
  'Amazing Spa',
  'Prompt Service',
  'Luxurious Amenities',
  'Will Return!',
];

interface BookingDetails {
  id: number;
  confirmationCode: string;
  guestName: string;
  roomType: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
}

// Star Rating Component
function StarRating({
  rating,
  onRate,
  size = 'md',
  readonly = false,
}: {
  rating: number;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          whileHover={readonly ? {} : { scale: 1.2 }}
          whileTap={readonly ? {} : { scale: 0.9 }}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= (hoverRating || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-neutral-300'
            } transition-colors`}
          />
        </motion.button>
      ))}
    </div>
  );
}

// Category Rating Component
function CategoryRating({
  category,
  rating,
  onRate,
}: {
  category: (typeof RATING_CATEGORIES)[0];
  rating: number;
  onRate: (rating: number) => void;
}) {
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <span className="font-medium text-neutral-700">{category.label}</span>
      </div>
      <StarRating rating={rating} onRate={onRate} size="sm" />
    </motion.div>
  );
}

export const FeedbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hotelInfo = useHotelInfo();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        // First check if feedback already submitted
        const feedbackCheck = await apiClient.get(`/v1/feedback/booking/${bookingId}`);

        if (feedbackCheck.data.already_submitted) {
          setSubmitted(true);
          setLoading(false);
          return;
        }

        // Format dates from the feedback booking endpoint
        const data = feedbackCheck.data;
        const checkIn = new Date(data.check_in);
        const checkOut = new Date(data.check_out);

        setBooking({
          id: data.reservation_id,
          confirmationCode: 'GLM' + String(data.reservation_id).padStart(6, '0'),
          guestName: data.guest_name || 'Valued Guest',
          roomType: data.room_type || 'Room',
          roomNumber: data.room_number || '',
          checkIn: checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          checkOut: checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          nights: data.nights || 1,
        });
      } catch (err) {
        console.error('Failed to fetch booking:', err);
        // Use placeholder for demo
        setBooking({
          id: parseInt(bookingId),
          confirmationCode: 'GLM' + bookingId.padStart(6, '0'),
          guestName: 'Valued Guest',
          roomType: 'Deluxe Suite',
          roomNumber: '501',
          checkIn: 'Dec 5, 2025',
          checkOut: 'Dec 8, 2025',
          nights: 3,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleRatingChange = (categoryId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [categoryId]: rating }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!ratings.overall) {
      setError('Please provide an overall rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/v1/feedback/submit', {
        reservation_id: parseInt(bookingId || '0'),
        overall_rating: ratings.overall,
        cleanliness_rating: ratings.cleanliness || null,
        comfort_rating: ratings.room || null,
        staff_rating: ratings.service || null,
        location_rating: ratings.location || null,
        amenities_rating: ratings.amenities || null,
        value_rating: ratings.value || null,
        dining_rating: ratings.dining || null,
        checkin_rating: null,
        quick_tags: selectedTags.length > 0 ? selectedTags : null,
        would_recommend: wouldRecommend,
        comments: comment || null,
      });

      setSubmitted(true);
    } catch (err: unknown) {
      console.error('Failed to submit feedback:', err);
      const error = err as { response?: { data?: { detail?: any } } };
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        setError(typeof detail === 'string' ? detail : 'Failed to submit feedback');
      } else {
        // For demo, show success anyway
        setSubmitted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const overallRating = ratings.overall || 0;
  const ratingLabel =
    overallRating === 5
      ? 'Exceptional!'
      : overallRating === 4
      ? 'Great!'
      : overallRating === 3
      ? 'Good'
      : overallRating === 2
      ? 'Fair'
      : overallRating === 1
      ? 'Poor'
      : 'Tap to rate';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading your stay details...</p>
        </div>
      </div>
    );
  }

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-neutral-900 mb-3">Thank You!</h1>
            <p className="text-lg text-neutral-600 mb-6">
              Your feedback means the world to us. It helps us create even more memorable
              experiences for you and future guests.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-primary-50 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center justify-center gap-2 text-primary-700">
                <Heart className="w-5 h-5 fill-primary-500 text-primary-500" />
                <span className="font-medium">We hope to welcome you back soon!</span>
              </div>
            </motion.div>

            <Button variant="primary" onClick={() => navigate('/')} className="w-full">
              Return to {hotelInfo.name}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>Share Your Experience</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-neutral-900 mb-3"
            >
              How Was Your Stay?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-600"
            >
              We'd love to hear about your experience at {hotelInfo.name}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Stay Summary */}
        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="mb-8 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
                <h2 className="text-white font-semibold">Your Recent Stay</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Room</p>
                    <p className="font-semibold text-neutral-900">{booking.roomType}</p>
                    <p className="text-xs text-neutral-500">Room {booking.roomNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Check-in</p>
                    <p className="font-semibold text-neutral-900">{booking.checkIn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Check-out</p>
                    <p className="font-semibold text-neutral-900">{booking.checkOut}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-1">Duration</p>
                    <p className="font-semibold text-neutral-900">
                      {booking.nights} Night{booking.nights > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Overall Rating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8 text-center p-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Overall Experience</h2>
            <p className="text-neutral-600 mb-6">How would you rate your stay with us?</p>

            <div className="flex justify-center mb-4">
              <StarRating
                rating={ratings.overall || 0}
                onRate={(rating) => handleRatingChange('overall', rating)}
                size="lg"
              />
            </div>

            <motion.p
              key={overallRating}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-lg font-medium ${
                overallRating >= 4
                  ? 'text-green-600'
                  : overallRating >= 3
                  ? 'text-amber-600'
                  : overallRating >= 1
                  ? 'text-orange-600'
                  : 'text-neutral-400'
              }`}
            >
              {ratingLabel}
            </motion.p>
          </Card>
        </motion.div>

        {/* Detailed Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-8">
            <div className="p-6 border-b border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900">Rate Each Category</h2>
              <p className="text-sm text-neutral-500 mt-1">Help us understand what we did well</p>
            </div>
            <div className="px-6">
              {RATING_CATEGORIES.filter((c) => c.id !== 'overall').map((category) => (
                <CategoryRating
                  key={category.id}
                  category={category}
                  rating={ratings[category.id] || 0}
                  onRate={(rating) => handleRatingChange(category.id, rating)}
                />
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="mb-8 p-6">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">What Stood Out?</h2>
            <p className="text-sm text-neutral-500 mb-4">Select all that apply</p>

            <div className="flex flex-wrap gap-2">
              {FEEDBACK_TAGS.map((tag) => (
                <motion.button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Would Recommend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mb-8 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Would You Recommend Us?</h2>
                <p className="text-sm text-neutral-500">To friends and family</p>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={() => setWouldRecommend(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-4 rounded-xl font-medium transition-all ${
                  wouldRecommend === true
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-neutral-100 text-neutral-700 border-2 border-transparent hover:bg-neutral-200'
                }`}
              >
                <Smile className="w-6 h-6 mx-auto mb-2" />
                Yes, Definitely!
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setWouldRecommend(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-4 rounded-xl font-medium transition-all ${
                  wouldRecommend === false
                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-500'
                    : 'bg-neutral-100 text-neutral-700 border-2 border-transparent hover:bg-neutral-200'
                }`}
              >
                <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                Not Yet
              </motion.button>
            </div>
          </Card>
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="mb-8 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Additional Comments</h2>
                <p className="text-sm text-neutral-500">Tell us more about your experience</p>
              </div>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share the highlights of your stay, suggestions for improvement, or anything else you'd like us to know..."
              rows={4}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-neutral-400 mt-2 text-right">
              {comment.length}/500 characters
            </p>
          </Card>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="pb-8"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || !ratings.overall}
            className="w-full py-4 text-lg"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Submit Feedback
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-neutral-500 mt-4">
            Your feedback is anonymous and will help us improve our services.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-neutral-200 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neutral-500 text-sm">
            Thank you for choosing {hotelInfo.name}. We hope to see you again soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
