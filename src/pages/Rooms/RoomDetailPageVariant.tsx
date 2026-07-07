import { useState } from 'react';
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
  Home,
  MapPin,
  Share2,
  Bookmark,
  Info,
  MessageSquare,
  Gift,
  ShieldCheck
} from 'lucide-react';
import { getRoomBySlug } from '@/data/roomsData';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/helpers/format';
import { useGSTCalculator } from '@/hooks/useGSTCalculator';

export const RoomDetailPageVariant = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { calculateGSTPerNight } = useGSTCalculator();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'reviews' | 'policies'>('overview');

  const room = getRoomBySlug(slug || '');

  if (!room) {
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
    params.set('room', room.slug);
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
    setLightboxImage((prev) => (prev + 1) % room.images.length);
  };

  const prevImage = () => {
    setLightboxImage((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'standard':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-600' };
      case 'deluxe':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-600' };
      case 'suite':
        return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'text-amber-600' };
      case 'presidential':
        return { bg: 'bg-rose-100', text: 'text-rose-700', icon: 'text-rose-600' };
      default:
        return { bg: 'bg-neutral-100', text: 'text-neutral-700', icon: 'text-neutral-600' };
    }
  };

  const categoryColors = getCategoryColor(room.category);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sticky Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button + Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/rooms')}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <ChevronLeft size={20} className="text-neutral-700" />
              </button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-neutral-900 truncate max-w-xs">
                  {room.name}
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <Share2 size={18} className="text-neutral-700" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSaved(!isSaved)}
                className="p-2.5 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <Bookmark
                  size={18}
                  className={isSaved ? 'fill-primary-600 text-primary-600' : 'text-neutral-700'}
                />
              </motion.button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBookNow}
                className="ml-2 px-6 font-semibold"
              >
                Reserve
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="pt-16">
        {/* Hero Image - Full Width with Overlay Info */}
        <div className="relative h-[70vh] bg-neutral-900">
          <img
            src={room.images?.[0] || '/placeholder-room.jpg'}
            alt={room.name}
            className="w-full h-full object-cover opacity-90"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl"
              >
                {/* Category Badge */}
                {room.category && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-bold capitalize mb-4">
                    {room.category === 'presidential' && <Award size={16} />}
                    {room.category === 'suite' && <Sparkles size={16} />}
                    {room.category}
                  </div>
                )}

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                  {room.name}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin size={18} />
                    <span className="text-sm font-medium">Downtown District</span>
                  </div>
                  {room.rating && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-white/50"></div>
                      <div className="flex items-center gap-2">
                        <Star size={18} fill="currentColor" className="text-amber-400" />
                        <span className="text-white/90 text-sm font-bold">{room.rating.toFixed(1)}</span>
                        <span className="text-white/70 text-sm">({room.reviewCount} reviews)</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white">
                    <Users size={18} />
                    <span className="text-sm font-semibold">{room.maxGuests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white">
                    <Maximize2 size={18} />
                    <span className="text-sm font-semibold">{room.size} sq ft</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white">
                    <Eye size={18} />
                    <span className="text-sm font-semibold">{room.view}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-white">
                    <Bed size={18} />
                    <span className="text-sm font-semibold">{room.bedType}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Image Gallery Trigger */}
          <button
            onClick={() => openLightbox(0)}
            className="absolute top-4 right-4 px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg text-white text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Eye size={16} />
            View all {room.images.length} photos
          </button>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Content with Tabs */}
            <div className="lg:col-span-2">
              {/* Tab Navigation */}
              <div className="bg-white rounded-2xl p-2 mb-8 shadow-sm">
                <div className="flex gap-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: Info },
                    { id: 'amenities', label: 'Amenities', icon: Sparkles },
                    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                    { id: 'policies', label: 'Policies', icon: ShieldCheck },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                        activeTab === tab.id
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <tab.icon size={18} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      {/* Description */}
                      <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
                          About This Suite
                        </h2>
                        {room.shortDescription && (
                          <div className={`mb-6 p-4 ${categoryColors.bg} rounded-xl`}>
                            <p className={`${categoryColors.text} font-semibold leading-relaxed`}>
                              {room.shortDescription}
                            </p>
                          </div>
                        )}
                        <p className="text-neutral-700 text-base leading-relaxed">
                          {room.description}
                        </p>
                      </Card>

                      {/* Features */}
                      {room.features && room.features.length > 0 && (
                        <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                            Signature Features
                          </h2>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {room.features.map((feature, index) => (
                              <motion.div
                                key={feature}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex items-center gap-3 p-4 ${categoryColors.bg} rounded-xl`}
                              >
                                <div className={`w-2 h-2 rounded-full ${categoryColors.icon} bg-current`}></div>
                                <span className={`font-semibold ${categoryColors.text}`}>{feature}</span>
                              </motion.div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Image Gallery Grid */}
                      <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                          Photo Gallery
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {room.images.slice(0, 6).map((image, index) => (
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => openLightbox(index)}
                              className="relative aspect-square rounded-xl overflow-hidden group"
                            >
                              <img
                                src={image}
                                alt={`${room.name} - ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                            </motion.button>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Amenities Tab */}
                  {activeTab === 'amenities' && (
                    <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                      <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                        All Amenities
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {room.amenities.map((amenity, index) => (
                          <motion.div
                            key={amenity}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                          >
                            <Check size={20} className="text-green-600 flex-shrink-0" />
                            <span className="font-medium text-neutral-900">{amenity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                        <div className="flex items-center gap-6 mb-8">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-neutral-900 mb-2">
                              {room.rating?.toFixed(1)}
                            </div>
                            <div className="flex items-center gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill="currentColor" className="text-amber-500" />
                              ))}
                            </div>
                            <div className="text-sm text-neutral-600">
                              {room.reviewCount} reviews
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            {[5, 4, 3, 2, 1].map((stars) => (
                              <div key={stars} className="flex items-center gap-3">
                                <span className="text-sm text-neutral-700 w-8">{stars} ★</span>
                                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-500"
                                    style={{ width: `${Math.random() * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-6">
                          {[
                            { name: 'Sarah Johnson', initial: 'SJ', color: 'bg-purple-500', rating: 5, date: '2 weeks ago', text: 'Absolutely stunning suite! The room was immaculate, spacious, and beautifully decorated.' },
                            { name: 'Michael Chen', initial: 'MC', color: 'bg-blue-500', rating: 5, date: '3 weeks ago', text: 'Exceeded all expectations! The amenities were top-notch.' },
                            { name: 'Emily Rodriguez', initial: 'ER', color: 'bg-pink-500', rating: 4, date: '1 month ago', text: 'Lovely room with great facilities. The bathroom was luxurious.' },
                          ].map((review, index) => (
                            <div key={index} className="pb-6 border-b border-neutral-200 last:border-0">
                              <div className="flex items-start gap-4 mb-3">
                                <div className={`w-12 h-12 rounded-full ${review.color} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                  {review.initial}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <h4 className="font-bold text-neutral-900">{review.name}</h4>
                                      <div className="flex items-center gap-1 mt-1">
                                        {[...Array(review.rating)].map((_, i) => (
                                          <Star key={i} size={14} fill="currentColor" className="text-amber-500" />
                                        ))}
                                      </div>
                                    </div>
                                    <span className="text-sm text-neutral-500">{review.date}</span>
                                  </div>
                                  <p className="text-neutral-700 leading-relaxed">{review.text}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* Policies Tab */}
                  {activeTab === 'policies' && (
                    <Card padding="lg" className="bg-white rounded-2xl shadow-sm">
                      <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                        House Rules & Policies
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-bold text-neutral-900 mb-3">Check-in & Check-out</h3>
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-neutral-900">Check-in: </span>
                                <span className="text-neutral-700">After 3:00 PM</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-neutral-900">Check-out: </span>
                                <span className="text-neutral-700">Before 11:00 AM</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="h-px bg-neutral-200"></div>

                        <div>
                          <h3 className="font-bold text-neutral-900 mb-3">Cancellation Policy</h3>
                          <div className="flex items-start gap-3">
                            <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-neutral-700">
                              Free cancellation up to 24 hours before check-in. After that, the full amount will be charged.
                            </p>
                          </div>
                        </div>

                        <div className="h-px bg-neutral-200"></div>

                        <div>
                          <h3 className="font-bold text-neutral-900 mb-3">Restrictions</h3>
                          <div className="space-y-2">
                            <div className="flex items-start gap-3">
                              <X size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-neutral-900">No smoking </span>
                                <span className="text-neutral-700">- This is a smoke-free suite</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <X size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-neutral-900">No pets </span>
                                <span className="text-neutral-700">- Pets are not allowed</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column - Sticky Booking Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-24"
              >
                <Card padding="lg" className="bg-white rounded-2xl shadow-lg">
                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-neutral-200">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-neutral-900">
                        {formatCurrency(room.price)}
                      </span>
                      <span className="text-lg text-neutral-600">/night</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Gift size={16} className="text-primary-600" />
                      <span>Best available rate</span>
                    </div>
                  </div>

                  {/* Booking CTA */}
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleBookNow}
                    className="mb-4 font-bold py-4"
                  >
                    Reserve Now
                  </Button>

                  <p className="text-center text-xs text-neutral-600 mb-6">
                    You won't be charged yet
                  </p>

                  {/* Price Breakdown */}
                  {(() => {
                    const gst = calculateGSTPerNight(room.price);
                    return (
                      <div className="space-y-3 mb-6 pb-6 border-b border-neutral-200">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-700">Base price</span>
                          <span className="font-semibold text-neutral-900">{formatCurrency(room.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-700">GST ({gst.taxRate}%)</span>
                          <span className="font-semibold text-neutral-900">{formatCurrency(gst.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-xs pl-4">
                          <span className="text-neutral-500">CGST ({gst.cgstRate}%)</span>
                          <span className="text-neutral-500">{formatCurrency(gst.cgst)}</span>
                        </div>
                        <div className="flex justify-between text-xs pl-4">
                          <span className="text-neutral-500">SGST ({gst.sgstRate}%)</span>
                          <span className="text-neutral-500">{formatCurrency(gst.sgst)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-700">Service fee (5%)</span>
                          <span className="font-semibold text-neutral-900">{formatCurrency(gst.serviceFee)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-neutral-200">
                          <span className="font-bold text-neutral-900">Total</span>
                          <span className="font-bold text-xl text-primary-700">{formatCurrency(gst.total)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Benefits */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-green-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-neutral-900">Free cancellation</div>
                        <div className="text-neutral-600">Cancel up to 24h before check-in</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-blue-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-neutral-900">No prepayment</div>
                        <div className="text-neutral-600">Pay at the property</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-amber-600" />
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-neutral-900">Best price guarantee</div>
                        <div className="text-neutral-600">Lowest rate available</div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Contact Card */}
                <Card padding="lg" className="bg-white rounded-2xl shadow-sm mt-6">
                  <h3 className="font-bold text-neutral-900 mb-4">Need help?</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Our concierge team is here to assist you with any questions.
                  </p>
                  <Button variant="secondary" size="sm" fullWidth onClick={() => navigate('/contact')}>
                    Contact Us
                  </Button>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-semibold">
              {lightboxImage + 1} / {room.images.length}
            </div>

            {room.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 p-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            <motion.img
              key={lightboxImage}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={room.images[lightboxImage]}
              alt={`${room.name} - ${lightboxImage + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};