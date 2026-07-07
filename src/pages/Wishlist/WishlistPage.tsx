import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Loader2,
  ArrowUpDown,
  Trash2,
  Users,
  Maximize2,
  Star,
} from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { roomTypesService } from '@/api/services/roomTypes.service';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/helpers/format';
import type { Room } from '@/api/types/booking.types';
import { SearchableSelect } from '@/components/ui2/SearchableSelect';

type SortOption = 'recent' | 'price-low' | 'price-high' | 'rating';

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, clearWishlist, wishlistCount } = useWishlist();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const sortOptions = useMemo(() => [
    { label: 'Recently Added', value: 'recent' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Top Rated', value: 'rating' },
  ], []);

  // Fetch room details for all wishlist IDs
  useEffect(() => {
    const fetchWishlistRooms = async () => {
      if (wishlist.length === 0) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const allRooms = await roomTypesService.getRoomTypes();

        // Filter to only rooms in wishlist
        const wishlistRooms = allRooms.filter((room: Room) =>
          wishlist.includes(room.id)
        );

        setRooms(wishlistRooms);
      } catch (error) {
        console.error('Error fetching wishlist rooms:', error);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistRooms();
  }, [wishlist]);

  // Sort rooms
  const sortedRooms = useMemo(() => {
    const sorted = [...rooms];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'recent':
      default:
        // Maintain wishlist order (most recently added last)
        return sorted.sort((a, b) => {
          const aIndex = wishlist.indexOf(a.id);
          const bIndex = wishlist.indexOf(b.id);
          return bIndex - aIndex;
        });
    }
  }, [rooms, sortBy, wishlist]);

  const getCategoryBadgeColor = (category?: string) => {
    switch (category) {
      case 'standard':
        return 'bg-blue-100 text-blue-700';
      case 'deluxe':
        return 'bg-purple-100 text-purple-700';
      case 'suite':
        return 'bg-amber-100 text-amber-700';
      case 'presidential':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  const handleClearAll = () => {
    clearWishlist();
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      {/* Content Section */}
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-terra-600 animate-spin mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-neutral-600 font-medium">Loading your saved rooms...</p>
            </div>
          ) : wishlistCount === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="rounded-[10px] bg-white p-8 sm:p-12 text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 bg-terra-50">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-terra-500" strokeWidth={1.5} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 mb-1 sm:mb-2">
                No rooms saved yet
              </h2>
              <p className="text-xs sm:text-[13px] text-neutral-500 mb-4 sm:mb-6 max-w-md mx-auto">
                Start exploring and save your favorite rooms to create your perfect stay
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/rooms')}
                className="text-sm sm:text-base font-semibold"
              >
                Browse Rooms
              </Button>
            </motion.div>
          ) : (
            // Populated State
            <>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">
                    {sortedRooms.length} {sortedRooms.length === 1 ? 'Room' : 'Rooms'}
                  </h2>
                  <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5">
                    Saved to your wishlist
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {/* Sort Dropdown */}
                  <div className="flex-1 sm:flex-none sm:w-48">
                    <SearchableSelect
                      options={sortOptions}
                      value={sortBy}
                      onChange={(value) => setSortBy(value as SortOption)}
                      placeholder="Sort by"
                      icon={ArrowUpDown}
                    />
                  </div>

                  {/* Clear All Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
                  >
                    <Trash2 size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="text-xs sm:text-sm">Clear All</span>
                  </Button>
                </div>
              </div>

              {/* Room Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRooms.map((room) => (
                  <WishlistRoomCard
                    key={room.id}
                    room={room}
                    navigate={navigate}
                    toggleWishlist={toggleWishlist}
                    getCategoryBadgeColor={getCategoryBadgeColor}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[10px] p-5 sm:p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">
              Clear Wishlist?
            </h3>
            <p className="text-xs sm:text-[13px] text-neutral-600 mb-5 sm:mb-6">
              Are you sure you want to remove all {wishlistCount} rooms from your wishlist? This action cannot be undone.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleClearAll}
                className="flex-1 text-xs sm:text-sm"
              >
                Clear All
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Wishlist Room Card Component
interface WishlistRoomCardProps {
  room: Room;
  navigate: (path: string) => void;
  toggleWishlist: (roomId: string) => void;
  getCategoryBadgeColor: (category?: string) => string;
}

const WishlistRoomCard = ({
  room,
  navigate,
  toggleWishlist,
  getCategoryBadgeColor,
}: WishlistRoomCardProps) => {
  const handleClick = () => {
    navigate(`/rooms/${room.slug || room.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div
        className="rounded-[10px] overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col border border-neutral-200 hover:border-terra-300 bg-white hover:shadow-lg hover:-translate-y-1"
        onClick={handleClick}
      >
        {/* Room Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-neutral-100">
          <img
            src={(room.images && room.images[0]) || '/placeholder-room.jpg'}
            alt={room.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-room.jpg';
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Price Badge */}
          <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 bg-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-neutral-200 shadow-sm">
            <div className="flex flex-col items-end">
              <span className="text-base sm:text-lg font-bold text-neutral-900 leading-none">
                {formatCurrency(room.price)}
              </span>
              <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">/night</span>
            </div>
          </div>

          {/* Category Badge */}
          {room.category && (
            <div className={`absolute top-2.5 sm:top-3 left-2.5 sm:left-3 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold capitalize border ${getCategoryBadgeColor(room.category)}`}>
              {room.category}
            </div>
          )}

          {/* Heart Button - Pre-filled */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(room.id);
            }}
            className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/95 backdrop-blur-sm border border-white hover:scale-110 transition-all shadow-md z-10 flex items-center justify-center"
          >
            <Heart size={18} className="fill-red-500 text-red-500" />
          </button>
        </div>

        {/* Room Details */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Title and Rating */}
          <div className="mb-3">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 mb-2 line-clamp-1 group-hover:text-terra-600 transition-colors">
              {room.name}
            </h3>
            {room.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gold-50 px-2 py-1 rounded-md border border-gold-200">
                  <Star size={13} fill="currentColor" strokeWidth={0} className="text-gold-500" />
                  <span className="font-semibold text-neutral-900 text-xs sm:text-sm">{room.rating.toFixed(1)}</span>
                </div>
                {room.reviewCount && (
                  <span className="text-[11px] sm:text-xs text-neutral-500 font-medium">({room.reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-neutral-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-1 leading-relaxed">
            {room.shortDescription || room.description}
          </p>

          {/* Room Features */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-700">
              <Users size={15} strokeWidth={1.5} className="text-terra-600" />
              <span className="text-xs sm:text-sm font-semibold">{room.maxGuests}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-300" />
            <div className="flex items-center gap-1.5 text-neutral-700">
              <Maximize2 size={15} strokeWidth={1.5} className="text-terra-600" />
              <span className="text-xs sm:text-sm font-semibold">{room.size} ft²</span>
            </div>
          </div>

          {/* Features/Amenities Preview */}
          <div className="flex flex-wrap gap-1.5 mb-3 sm:mb-4">
            {(room.features || room.amenities.slice(0, 3)).slice(0, 3).map((item) => (
              <span
                key={item}
                className="text-[10px] sm:text-xs px-2 py-1 bg-neutral-50 text-neutral-700 rounded-md font-medium border border-neutral-200"
              >
                {item}
              </span>
            ))}
            {room.amenities.length > 3 && (
              <span className="text-[10px] sm:text-xs px-2 py-1 bg-terra-50 text-terra-700 rounded-md font-semibold border border-terra-200">
                +{room.amenities.length - 3}
              </span>
            )}
          </div>

          {/* View Details Button */}
          <Button
            variant="primary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="font-semibold text-xs sm:text-sm py-2.5 sm:py-3"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
