import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: string[];
  addToWishlist: (roomId: string) => void;
  removeFromWishlist: (roomId: string) => void;
  toggleWishlist: (roomId: string) => void;
  isInWishlist: (roomId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'glimmora_wishlist';
const MAX_WISHLIST_SIZE = 50; // Reasonable limit to avoid localStorage quota issues

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  // Load wishlist from localStorage or default to empty array
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      return [];
    }
  });

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
      toast.error('Failed to save to wishlist. Storage limit may be reached.');
    }
  }, [wishlist]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY && e.newValue) {
        try {
          const newWishlist = JSON.parse(e.newValue);
          if (Array.isArray(newWishlist)) {
            setWishlist(newWishlist);
          }
        } catch (error) {
          console.error('Error parsing wishlist from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToWishlist = (roomId: string) => {
    if (!roomId) return;

    if (wishlist.includes(roomId)) {
      return; // Already in wishlist
    }

    if (wishlist.length >= MAX_WISHLIST_SIZE) {
      toast.error(`Wishlist is full (maximum ${MAX_WISHLIST_SIZE} rooms)`);
      return;
    }

    setWishlist((prev) => [...prev, roomId]);
    toast.success('Room added to wishlist', {
      icon: '❤️',
      duration: 2000,
    });
  };

  const removeFromWishlist = (roomId: string) => {
    if (!roomId) return;

    setWishlist((prev) => prev.filter((id) => id !== roomId));
    toast.success('Room removed from wishlist', {
      duration: 2000,
    });
  };

  const toggleWishlist = (roomId: string) => {
    if (wishlist.includes(roomId)) {
      removeFromWishlist(roomId);
    } else {
      addToWishlist(roomId);
    }
  };

  const isInWishlist = (roomId: string): boolean => {
    return wishlist.includes(roomId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    toast.success('Wishlist cleared');
  };

  const wishlistCount = wishlist.length;

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
