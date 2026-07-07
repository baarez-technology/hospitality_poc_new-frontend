import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Users, RefreshCw, AlertCircle } from 'lucide-react';
import { AMENITIES } from '../../utils/settings';
import AddRoomTypeModal from './AddRoomTypeModal';
import EditRoomTypeModal from './EditRoomTypeModal';
import { Button } from '../ui2/Button';
import { roomTypesService, RoomTypeCreate, RoomTypeUpdate } from '../../api/services/roomTypes.service';
import { useToast } from '../../contexts/ToastContext';
import { useCurrency } from '@/hooks/useCurrency';

interface RoomType {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  maxOccupancy: number;
  amenities: string[];
  features?: string[];
  inclusions?: string[];
  category?: string;
}

export default function RoomTypesTab() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();
  const { currency } = useCurrency();

  // Fetch room types from API
  const fetchRoomTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roomTypesService.getRoomTypes();
      // Transform API data to local format
      const transformed = data.map((rt: any) => ({
        id: rt.slug || rt.id,
        slug: rt.slug,
        name: rt.name,
        description: rt.description || rt.shortDescription || '',
        price: rt.price,
        maxGuests: rt.maxGuests,
        maxOccupancy: rt.maxGuests, // EditRoomTypeModal expects maxOccupancy
        amenities: rt.amenities || [],
        features: rt.features || [],
        inclusions: rt.features || [], // Use features as inclusions for display
        category: rt.category
      }));
      setRoomTypes(transformed);
    } catch (err: any) {
      console.error('Failed to fetch room types:', err);
      setError(err.message || 'Failed to load room types');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const handleAddRoom = async (newRoom: any) => {
    setIsSaving(true);
    try {
      // Map frontend fields to backend fields
      const createData: RoomTypeCreate = {
        name: newRoom.name,
        description: newRoom.description,
        base_price: newRoom.price,
        max_guests: newRoom.maxOccupancy || 2,
        amenities: newRoom.amenities,
        features: newRoom.inclusions || [],
      };

      // Call API to create
      await roomTypesService.createRoomType(createData);

      // Refresh from API to get the full data with slug/id
      await fetchRoomTypes();

      setShowAddModal(false);
      toast.showToast('Room type created successfully! It will now appear across the system.', 'success');
    } catch (err: any) {
      console.error('Failed to create room type:', err);
      toast.showToast(err.message || 'Failed to create room type', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditRoom = async (updatedRoom: any) => {
    setIsSaving(true);
    try {
      // Map frontend fields to backend fields
      const updates: RoomTypeUpdate = {
        name: updatedRoom.name,
        description: updatedRoom.description,
        base_price: updatedRoom.price,
        max_guests: updatedRoom.maxOccupancy || updatedRoom.maxGuests,
        amenities: updatedRoom.amenities,
        features: updatedRoom.inclusions || updatedRoom.features
      };

      // Call API to update
      const slug = updatedRoom.slug || updatedRoom.id;
      await roomTypesService.updateRoomType(slug, updates);

      // Update local state
      setRoomTypes(prev =>
        prev.map(rt => (rt.id === updatedRoom.id ? { ...rt, ...updatedRoom, price: updatedRoom.price } : rt))
      );

      setEditingRoom(null);
      toast.showToast('Room type updated successfully! Changes will reflect on /rooms page.', 'success');
    } catch (err: any) {
      console.error('Failed to update room type:', err);
      toast.showToast(err.message || 'Failed to update room type', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = (id: string) => {
    // For now, just remove from local state
    setRoomTypes(prev => prev.filter(rt => rt.id !== id));
    setDeleteConfirm(null);
    toast.showToast('Room type removed from view. Note: Full delete API coming soon.', 'info');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getAmenityLabel = (amenityId: string) => {
    // If it's already a label (from API), return it
    if (amenityId.includes(' ') || amenityId.length > 10) {
      return amenityId;
    }
    return AMENITIES.find((a) => a.id === amenityId)?.label || amenityId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-terra-500 mr-3" />
        <span className="text-neutral-600">Loading room types...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
        <p className="text-rose-700 font-medium mb-4">{error}</p>
        <Button variant="outline" onClick={fetchRoomTypes}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900">Room Types</h1>
          <p className="text-[12px] sm:text-sm text-neutral-500 mt-1">
            Manage your room categories and pricing
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" icon={RefreshCw} onClick={fetchRoomTypes} disabled={isLoading}>
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            <span className="hidden sm:inline">Add Room Type</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {roomTypes.map((room) => (
          <div
            key={room.id}
            className="bg-neutral-50/50 rounded-[10px] overflow-hidden"
          >
            {/* Card Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[12px] sm:text-[13px] font-semibold text-neutral-800 truncate">{room.name}</h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{room.description}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Pencil}
                    onClick={() => setEditingRoom(room)}
                    disabled={isSaving}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeleteConfirm(room.id)}
                    className="hover:text-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {/* Price and Occupancy */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <div>
                  <span className="text-base sm:text-lg font-semibold text-neutral-900">{formatPrice(room.price)}</span>
                  <span className="text-[10px] sm:text-xs text-neutral-500 ml-1">/night</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[10px] sm:text-xs">Up to {room.maxGuests} guests</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p className="block text-[12px] sm:text-[13px] font-medium text-neutral-600 mb-1.5">Amenities</p>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {room.amenities.slice(0, 4).map((amenity, idx) => (
                    <span
                      key={`${amenity}-${idx}`}
                      className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-100 text-neutral-600 text-[10px] sm:text-xs rounded-md"
                    >
                      {getAmenityLabel(amenity)}
                    </span>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-100 text-neutral-500 text-[10px] sm:text-xs rounded-md">
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Features/Inclusions */}
              {room.features && room.features.length > 0 && (
                <div>
                  <p className="block text-[12px] sm:text-[13px] font-medium text-neutral-600 mb-1.5">Features</p>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {room.features.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-50 text-neutral-600 text-[10px] sm:text-xs rounded-md border border-neutral-200"
                      >
                        {feature}
                      </span>
                    ))}
                    {room.features.length > 3 && (
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-neutral-50 text-neutral-500 text-[10px] sm:text-xs rounded-md border border-neutral-200">
                        +{room.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm === room.id && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-neutral-50 border-t border-neutral-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <p className="text-[12px] sm:text-sm text-neutral-600">Delete this room type?</p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="md"
                      onClick={() => handleDeleteRoom(room.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {roomTypes.length === 0 && (
        <div className="bg-neutral-50/50 rounded-[10px] overflow-hidden text-center py-16">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-sm font-medium text-neutral-900 mb-1">No Room Types</h3>
          <p className="text-sm text-neutral-500 mb-6">Get started by adding your first room type</p>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Room Ty
          </Button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddRoomTypeModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddRoom}
        />
      )}

      {editingRoom && (
        <EditRoomTypeModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSave={handleEditRoom}
        />
      )}
    </div>
  );
}
