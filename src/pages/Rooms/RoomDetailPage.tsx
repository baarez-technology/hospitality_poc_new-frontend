import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Maximize2,
  Eye,
  Bed,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Wifi,
  Coffee,
  Tv,
  Wind,
  Droplets,
  Phone,
  Shield,
  Heart,
  Share2,
  Info,
  Home,
  Loader2,
  Send
} from 'lucide-react';
import { roomTypesService } from '@/api/services/roomTypes.service';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/helpers/format';
import type { Room } from '@/api/types/booking.types';
import { useWishlist } from '@/contexts/WishlistContext';
import { useGSTCalculator } from '@/hooks/useGSTCalculator';

export const RoomDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const reviewFormRef = useRef<HTMLDivElement>(null);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { calculateGSTPerNight } = useGSTCalculator();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Derive isFavorite from wishlist state
  const isFavorite = room ? isInWishlist(room.id) : false;

  // Fetch room from API
  useEffect(() => {
    const fetchRoom = async () => {
      if (!slug) {
        setError('No room specified');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const checkIn = searchParams.get('checkIn') || undefined;
        const checkOut = searchParams.get('checkOut') || undefined;
        const guests = parseInt(searchParams.get('adults') || '1') + parseInt(searchParams.get('children') || '0');

        const roomData = await roomTypesService.getRoomTypeBySlug(slug, { checkIn, checkOut, guests });
        setRoom(roomData);
      } catch (err) {
        console.error('Failed to fetch room:', err);
        setError('Room not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [slug, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Room Not Found</h2>
          <p className="text-neutral-600 mb-6">
            The room you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => navigate('/rooms')}>
            Back to Rooms
          </Button>
        </Card>
      </div>
    );
  }

  const handleBookNow = () => {
    const params = new URLSearchParams();
    params.set('room', room.slug || room.id);
    if (searchParams.get('checkIn')) params.set('checkIn', searchParams.get('checkIn')!);
    if (searchParams.get('checkOut')) params.set('checkOut', searchParams.get('checkOut')!);
    params.set('adults', searchParams.get('adults') || '1');
    params.set('children', searchParams.get('children') || '0');
    navigate(`/booking?${params.toString()}`);
  };

  const openLightbox = (index: number) => {
    setLightboxImage(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxImage((prev) => (prev + 1) % (room.images?.length || 0));
  };

  const prevImage = () => {
    setLightboxImage((prev) => (prev - 1 + (room.images?.length || 0)) % (room.images?.length || 0));
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'standard':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'deluxe':
        return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'suite':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'presidential':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      default:
        return { bg: 'bg-neutral-50', text: 'text-neutral-700', border: 'border-neutral-200' };
    }
  };

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'Air Conditioning': Wind,
    'Mini Bar': Coffee,
    'Smart TV': Tv,
    'Room Service': Phone,
    'Safe': Shield,
    'Bathtub': Droplets,
  };

  const categoryColors = getCategoryColor(room.category);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb Navigation */}
      <nav className="fixed top-20 left-0 right-0 z-40 bg-white border-b border-neutral-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-3">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-neutral-600 hover:text-primary-600 transition-colors font-medium"
              >
                <Home size={16} strokeWidth={1.5} />
                <span>Home</span>
              </button>
            </li>
            <ChevronRight size={16} className="text-neutral-400" strokeWidth={1.5} />
            <li>
              <button
                onClick={() => navigate('/rooms')}
                className="text-neutral-600 hover:text-primary-600 transition-colors font-medium"
              >
                Rooms
              </button>
            </li>
            <ChevronRight size={16} className="text-neutral-400" strokeWidth={1.5} />
            <li className="text-neutral-900 font-semibold truncate max-w-[200px] sm:max-w-none">
              {room.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Section with Image Gallery */}
      <div className="relative bg-white mt-[52px] -mb-[52px]">
        {/* Enhanced Grid Image Gallery */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pt-4 pb-6">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 sm:gap-3 h-[300px] sm:h-[500px] lg:h-[600px]">
            {/* Main Featured Image - Takes up 2x2 grid space */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-4 sm:col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group shadow-xl"
              onClick={() => openLightbox(0)}
            >
              <img
                src={(room.images && room.images[0]) || '/placeholder-room.jpg'}
                alt={room.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Category Badge */}
              {room.category && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`absolute top-4 left-4 flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md shadow-lg border-2 ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border}`}
                >
                  {room.category === 'suite' && <Sparkles size={18} strokeWidth={2.5} />}
                  {room.category === 'presidential' && <Award size={18} strokeWidth={2.5} />}
                  <span className="text-sm font-bold capitalize tracking-wide">{room.category}</span>
                </motion.div>
              )}

              {/* View All Photos Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(0);
                }}
                className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-xl hover:shadow-2xl hover:bg-white transition-all group/btn"
              >
                <Eye size={16} className="text-neutral-900 group-hover/btn:scale-110 transition-transform sm:w-[18px] sm:h-[18px]" />
                <span className="text-xs sm:text-sm font-bold text-neutral-900">View All {(room.images?.length || 0)} Photos</span>
              </motion.button>
            </motion.div>

            {/* Top Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="hidden sm:block col-span-2 row-span-1 relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
              onClick={() => openLightbox(1)}
            >
              <img
                src={(room.images && room.images[1]) || (room.images && room.images[0]) || '/placeholder-room.jpg'}
                alt={`${room.name} view 2`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>

            {/* Bottom Right - Two Columns */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="hidden sm:block col-span-1 row-span-1 relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
              onClick={() => openLightbox(2)}
            >
              <img
                src={(room.images && room.images[2]) || (room.images && room.images[0]) || '/placeholder-room.jpg'}
                alt={`${room.name} view 3`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>

            {/* Bottom Right Last Image with Counter Overlay */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="hidden sm:block col-span-1 row-span-1 relative rounded-2xl overflow-hidden cursor-pointer group shadow-lg"
              onClick={() => openLightbox(3)}
            >
              <img
                src={(room.images && room.images[3]) || (room.images && room.images[0]) || '/placeholder-room.jpg'}
                alt={`${room.name} view 4`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Show More Overlay if more than 4 images */}
              {(room.images?.length || 0) > 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/80 transition-colors"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Eye size={28} className="text-white" strokeWidth={2} />
                      <span className="text-4xl font-bold text-white">+{(room.images?.length || 0) - 4}</span>
                    </div>
                    <p className="text-white text-sm font-semibold tracking-wide">More Photos</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Action Buttons Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between mt-4 pb-4"
          >
            <div className="flex items-center gap-3">
              {/* Share Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 rounded-xl transition-all border border-neutral-200"
              >
                <Share2 size={18} strokeWidth={2} />
                <span className="text-sm font-semibold hidden sm:inline">Share</span>
              </motion.button>

              {/* Favorite Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => room && toggleWishlist(room.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border-2 ${
                  isFavorite
                    ? 'bg-red-500 hover:bg-red-600 text-white border-red-400'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border-neutral-200'
                }`}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2} />
                <span className="text-sm font-semibold hidden sm:inline">
                  {isFavorite ? 'Saved' : 'Save'}
                </span>
              </motion.button>
            </div>

            {/* Image Navigation Info */}
            <div className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-primary-50 rounded-xl border border-primary-200">
              <Info size={16} className="text-primary-600" />
              <span className="text-sm font-medium text-primary-900">
                Click any photo to view gallery
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  {/* Category Badge */}
                  {room.category && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4 ${categoryColors.bg} ${categoryColors.text} border ${categoryColors.border}`}>
                      {room.category === 'suite' && <Sparkles size={16} />}
                      {room.category === 'presidential' && <Award size={16} />}
                      <span className="text-sm font-bold capitalize">{room.category}</span>
                    </div>
                  )}

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4 leading-tight">
                    {room.name}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-neutral-600 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={18} className="text-primary-600" />
                      <span className="text-sm font-medium">Downtown District</span>
                    </div>
                    {room.rating && (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i < Math.floor(room.rating!) ? 'currentColor' : 'none'}
                                className="text-amber-500"
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-neutral-900">
                            {room.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-neutral-500">
                            ({room.reviewCount} reviews)
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => room && toggleWishlist(room.id)}
                    className="w-11 h-11 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                  >
                    <Heart
                      size={20}
                      className={isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-600'}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 rounded-full bg-white border border-neutral-200 hover:border-neutral-300 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                  >
                    <Share2 size={20} className="text-neutral-600" />
                  </motion.button>
                </div>
              </div>

              {/* Key Stats - Horizontal Pills */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-neutral-200">
                  <Users size={18} className="text-primary-600 sm:w-5 sm:h-5" />
                  <div className="text-xs sm:text-sm font-bold text-neutral-900">{room.maxGuests} Guests</div>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-neutral-200">
                  <Maximize2 size={18} className="text-primary-600 sm:w-5 sm:h-5" />
                  <div className="text-xs sm:text-sm font-bold text-neutral-900">{room.size} sq ft</div>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-neutral-200">
                  <Eye size={18} className="text-primary-600 sm:w-5 sm:h-5" />
                  <div className="text-xs sm:text-sm font-bold text-neutral-900 capitalize">{room.view} View</div>
                </div>
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white rounded-xl border border-neutral-200">
                  <Bed size={18} className="text-primary-600 sm:w-5 sm:h-5" />
                  <div className="text-xs sm:text-sm font-bold text-neutral-900">{room.bedType} Bed</div>
                </div>
              </div>
            </motion.div>

            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-200"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">About This Suite</h2>

              {room.shortDescription && (
                <div className="mb-6 p-5 bg-primary-50 rounded-xl border border-primary-100">
                  <p className="text-base font-semibold text-neutral-900 leading-relaxed">
                    {room.shortDescription}
                  </p>
                </div>
              )}

              <p className="text-base text-neutral-700 leading-relaxed">
                {room.description}
              </p>
            </motion.div>

            {/* Features Section */}
            {room.features && room.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-200"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">Suite Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {room.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3 p-3 sm:p-4 bg-neutral-50 rounded-xl"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles size={14} className="text-primary-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-neutral-900 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Amenities Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-200"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">Amenities & Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {room.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Check size={16} className="text-green-600 sm:w-[18px] sm:h-[18px]" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-neutral-900">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Policies Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-5 sm:p-8 border border-neutral-200"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6">House Rules & Policies</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar size={18} className="text-blue-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-sm sm:text-base mb-0.5 sm:mb-1">Check-in</div>
                    <div className="text-xs sm:text-sm text-neutral-700">After 3:00 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-orange-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-sm sm:text-base mb-0.5 sm:mb-1">Check-out</div>
                    <div className="text-xs sm:text-sm text-neutral-700">Before 11:00 AM</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Check size={18} className="text-green-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-sm sm:text-base mb-0.5 sm:mb-1">Cancellation</div>
                    <div className="text-xs sm:text-sm text-neutral-700">Free up to 24h before check-in</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-red-50 rounded-xl border border-red-100">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <X size={18} className="text-red-600 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 text-sm sm:text-base mb-0.5 sm:mb-1">No Smoking</div>
                    <div className="text-xs sm:text-sm text-neutral-700">Smoke-free environment</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sticky Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:sticky lg:top-28"
            >
              {/* Booking Card */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-lg">
                {/* Price Header */}
                <div className="p-4 sm:p-6 border-b border-neutral-200">
                  <div className="flex items-baseline gap-2 mb-1 sm:mb-2">
                    <span className="text-3xl sm:text-4xl font-bold text-neutral-900">
                      {formatCurrency(room.price)}
                    </span>
                    <span className="text-base sm:text-lg font-semibold text-neutral-500">/night</span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600">Best available rate</p>
                </div>

                <div className="p-4 sm:p-6">
                  {/* CTA Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleBookNow}
                    className="mb-6 font-bold text-base py-4 shadow-md hover:shadow-lg transition-all"
                  >
                    Reserve This Suite
                  </Button>

                  {/* Price Breakdown */}
                  {(() => {
                    const gst = calculateGSTPerNight(room.price);
                    return (
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-600">Base price</span>
                          <span className="font-semibold text-neutral-900">
                            {formatCurrency(room.price)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-600">Service fee (5%)</span>
                          <span className="font-semibold text-neutral-900">
                            {formatCurrency(gst.serviceFee)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-neutral-600">GST ({gst.taxRate}%)</span>
                          <span className="font-semibold text-neutral-900">
                            {formatCurrency(gst.taxAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs pl-4">
                          <span className="text-neutral-500">CGST ({gst.cgstRate}%)</span>
                          <span className="text-neutral-500">{formatCurrency(gst.cgst)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pl-4">
                          <span className="text-neutral-500">SGST ({gst.sgstRate}%)</span>
                          <span className="text-neutral-500">{formatCurrency(gst.sgst)}</span>
                        </div>
                        <div className="pt-3 mt-3 border-t border-neutral-200">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-neutral-900">Total per night</span>
                            <span className="text-2xl font-bold text-primary-600">
                              {formatCurrency(gst.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Benefits */}
                  <div className="space-y-3 pt-6 border-t border-neutral-200">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Free cancellation</p>
                        <p className="text-xs text-neutral-600 mt-0.5">Cancel up to 24h before</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">No prepayment</p>
                        <p className="text-xs text-neutral-600 mt-0.5">Pay at the property</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Best price guarantee</p>
                        <p className="text-xs text-neutral-600 mt-0.5">Lowest rate available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 bg-neutral-50 rounded-2xl p-6 border border-neutral-200"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Info size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 mb-1">Need Help?</h3>
                    <p className="text-sm text-neutral-600">
                      Our concierge team is here to assist you with any questions.
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" fullWidth className="font-semibold" onClick={() => navigate('/contact')}>
                  Contact Us
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewsRef} className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mt-16 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Reviews Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-2">Guest Reviews</h2>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        fill={i < Math.floor(room.rating!) ? 'currentColor' : 'none'}
                        className="text-amber-500"
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-neutral-900">{room.rating?.toFixed(1)}</span>
                  <span className="text-neutral-600">({room.reviewCount} reviews)</span>
                </div>
              </div>
              <Button variant="outline" size="md" className="hidden sm:flex" onClick={() => {
                setShowReviewForm(true);
                setTimeout(() => reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
              }}>
                Write a Review
              </Button>
            </div>

            {/* Reviews Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Review 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                    JD
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">John Doe</h3>
                    <p className="text-sm text-neutral-600">Verified Guest • 2 weeks ago</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  "Absolutely stunning room with incredible views! The attention to detail was impeccable, and the staff went above and beyond to make our stay memorable. Would highly recommend to anyone looking for a luxurious experience."
                </p>
              </motion.div>

              {/* Review 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                    SM
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">Sarah Miller</h3>
                    <p className="text-sm text-neutral-600">Verified Guest • 3 weeks ago</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < 4 ? 'currentColor' : 'none'} className="text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  "Great location and beautiful room. The amenities were top-notch and the bed was incredibly comfortable. Only minor issue was the WiFi speed, but everything else was perfect!"
                </p>
              </motion.div>

              {/* Review 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                    MJ
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">Michael Johnson</h3>
                    <p className="text-sm text-neutral-600">Verified Guest • 1 month ago</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  "Exceeded all expectations! From check-in to check-out, everything was seamless. The room was spotless, modern, and had all the amenities we needed. Will definitely be returning!"
                </p>
              </motion.div>

              {/* Review 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                    EW
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-neutral-900">Emily Wilson</h3>
                    <p className="text-sm text-neutral-600">Verified Guest • 1 month ago</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" className="text-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  "Perfect for a romantic getaway! The ambiance was wonderful, and the attention to detail in the room design was remarkable. Loved every moment of our stay."
                </p>
              </motion.div>
            </div>

            {/* Additional Reviews (shown on "View All") */}
            <AnimatePresence>
              {showAllReviews && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                        RK
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-neutral-900">Rajesh Kumar</h3>
                        <p className="text-sm text-neutral-600">Verified Guest • 2 months ago</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < 4 ? 'currentColor' : 'none'} className="text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-700 leading-relaxed">
                      "Wonderful stay! The room was very clean and spacious. The breakfast spread was excellent with great variety. Staff was courteous and helpful throughout."
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-neutral-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                        AT
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-neutral-900">Anna Thompson</h3>
                        <p className="text-sm text-neutral-600">Verified Guest • 2 months ago</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" className="text-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-700 leading-relaxed">
                      "A truly luxurious experience from start to finish. The spa amenities were world-class and the room had the most comfortable bed I've ever slept in. Can't wait to return!"
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* View All / Show Less Button */}
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                className="font-semibold"
                onClick={() => {
                  setShowAllReviews(!showAllReviews);
                  if (!showAllReviews) {
                    // Already at reviews section, no need to scroll
                  } else {
                    // Scrolling back to top of reviews when collapsing
                    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                {showAllReviews ? 'Show Less' : `View All ${room.reviewCount} Reviews`}
              </Button>
            </div>

            {/* Write a Review Form */}
            <div ref={reviewFormRef}>
              <AnimatePresence>
                {showReviewForm && !reviewSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-10 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200"
                  >
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">Write a Review</h3>
                    <p className="text-sm text-neutral-500 mb-6">Share your experience with other guests</p>

                    {/* Star Rating Selector */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Your Rating</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setReviewHoverRating(star)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            onClick={() => setReviewRating(star)}
                            className="p-0.5 transition-transform hover:scale-110"
                          >
                            <Star
                              size={28}
                              fill={(reviewHoverRating || reviewRating) >= star ? 'currentColor' : 'none'}
                              className={(reviewHoverRating || reviewRating) >= star ? 'text-amber-500' : 'text-neutral-300'}
                            />
                          </button>
                        ))}
                        {reviewRating > 0 && (
                          <span className="ml-2 text-sm text-neutral-500">
                            {reviewRating === 5 ? 'Excellent' : reviewRating === 4 ? 'Very Good' : reviewRating === 3 ? 'Good' : reviewRating === 2 ? 'Fair' : 'Poor'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name Input */}
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Your Name</label>
                      <input
                        type="text"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full h-11 px-4 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>

                    {/* Review Text */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Your Review</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Tell us about your experience..."
                        rows={4}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center gap-3">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          if (reviewRating > 0 && reviewText.trim()) {
                            setReviewSubmitted(true);
                          }
                        }}
                        disabled={reviewRating === 0 || !reviewText.trim()}
                      >
                        <Send size={16} className="mr-2" />
                        Submit Review
                      </Button>
                      <Button variant="outline" size="md" onClick={() => {
                        setShowReviewForm(false);
                        setReviewRating(0);
                        setReviewName('');
                        setReviewText('');
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                {reviewSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-10 bg-green-50 rounded-2xl p-6 sm:p-8 border border-green-200 text-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <Check size={28} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-1">Thank You!</h3>
                    <p className="text-sm text-neutral-600">Your review has been submitted and will be published after moderation.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 z-10 p-3 bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-full text-white transition-all"
            >
              <X size={24} />
            </motion.button>

            {/* Image Counter */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-5 py-2.5 bg-white/10 backdrop-blur-lg rounded-full text-white text-sm font-bold"
            >
              {lightboxImage + 1} / {(room.images?.length || 0)}
            </motion.div>

            {/* Navigation Buttons */}
            {(room.images?.length || 0) > 1 && (
              <>
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-6 z-10 p-4 bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-full text-white transition-all"
                >
                  <ChevronLeft size={28} />
                </motion.button>
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-6 z-10 p-4 bg-white/10 backdrop-blur-lg hover:bg-white/20 rounded-full text-white transition-all"
                >
                  <ChevronRight size={28} />
                </motion.button>
              </>
            )}

            {/* Image */}
            <motion.img
              key={lightboxImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={room.images[lightboxImage]}
              alt={`${room.name} - Image ${lightboxImage + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};