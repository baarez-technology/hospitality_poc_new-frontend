import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, X, ClipboardCheck, Clock, TrendingUp, Sparkles } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Auto-focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/rooms?search=${encodeURIComponent(query)}`);
      onClose();
      setQuery('');
    }
  };

  const recentSearches = [
    'Ocean View Suite',
    'Deluxe Room',
    'Premium Suite',
  ];

  const popularSearches = [
    'Beach Access',
    'Pool View',
    'King Bed',
    'Suite',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed inset-x-0 top-0 z-50 pt-20"
          >
            <div className="container mx-auto px-4 max-w-2xl">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search rooms, amenities, locations..."
                    className="w-full pl-16 pr-16 py-6 text-lg border-b-2 border-neutral-200 focus:outline-none focus:border-primary-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </form>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {/* Quick Access - Pre-Check-In Featured */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-primary-600" />
                      <h3 className="font-bold text-neutral-900">Quick Access</h3>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/pre-checkin');
                        onClose();
                      }}
                      className="w-full group relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl"
                    >
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                          NEW
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <ClipboardCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-bold text-lg mb-1">Pre-Check-In</div>
                          <div className="text-white/90 text-sm">Skip the front desk - check in now!</div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-neutral-500" />
                        <h3 className="font-semibold text-neutral-900">Recent Searches</h3>
                      </div>
                      <div className="space-y-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setQuery(search);
                              navigate(`/rooms?search=${encodeURIComponent(search)}`);
                              onClose();
                            }}
                            className="w-full text-left px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-all flex items-center gap-3"
                          >
                            <Search className="w-4 h-4 text-neutral-400" />
                            <span>{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-neutral-500" />
                      <h3 className="font-semibold text-neutral-900">Popular Searches</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(search);
                            navigate(`/rooms?search=${encodeURIComponent(search)}`);
                            onClose();
                          }}
                          className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-sm font-medium transition-all"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
