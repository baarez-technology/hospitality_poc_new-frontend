import { useState, useEffect } from 'react';
import { BedDouble, Plus, Pencil, Trash2, Users, RefreshCw, AlertCircle, DollarSign } from 'lucide-react';
import { AMENITIES } from '@/utils/admin/settings';
import AddRoomTypeModal from './AddRoomTypeModal';
import EditRoomTypeModal from './EditRoomTypeModal';
import { roomTypesService, RoomTypeCreate, RoomTypeUpdate } from '@/api/services/roomTypes.service';
import { useToast } from '@/contexts/ToastContext';

interface RoomType {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
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
        maxOccupancy: rt.maxGuests,
        amenities: rt.amenities || [],
        features: rt.features || [],
        inclusions: rt.features || [],
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
      const createData: RoomTypeCreate = {
        name: newRoom.name,
        description: newRoom.description,
        base_price: newRoom.price,
        max_guests: newRoom.maxOccupancy || 2,
        amenities: newRoom.amenities,
        features: newRoom.inclusions || newRoom.features || [],
        bed_type: newRoom.bedType,
        size_sqft: newRoom.size,
        view_type: newRoom.view,
        category: newRoom.category,
      };

      await roomTypesService.createRoomType(createData);
      await fetchRoomTypes();

      setShowAddModal(false);
      toast.showToast('Room type created successfully! It will now appear across all sections.', 'success');
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
        max_guests: updatedRoom.maxOccupancy,
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
      toast.showToast('Room type updated! Changes will reflect on /rooms page.', 'success');
    } catch (err: any) {
      console.error('Failed to update room type:', err);
      toast.showToast(err.message || 'Failed to update room type', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    setIsSaving(true);
    try {
      const room = roomTypes.find(rt => rt.id === id);
      const slug = room?.slug || id;
      await roomTypesService.deleteRoomType(slug);
      await fetchRoomTypes();
      setDeleteConfirm(null);
      toast.showToast('Room type deleted successfully.', 'success');
    } catch (err: any) {
      console.error('Failed to delete room type:', err);
      toast.showToast(err.message || 'Failed to delete room type. It may have rooms assigned to it.', 'error');
      setDeleteConfirm(null);
    } finally {
      setIsSaving(false);
    }
  };

  const getAmenityLabel = (amenityId: string) => {
    if (amenityId.includes(' ') || amenityId.length > 10) {
      return amenityId;
    }
    return AMENITIES.find((a: any) => a.id === amenityId)?.label || amenityId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-[#8B5E34] mr-3" />
        <span className="text-neutral-600">Loading room types...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-3" />
        <p className="text-rose-700 font-medium mb-4">{error}</p>
        <button
          onClick={fetchRoomTypes}
          className="px-4 py-2 bg-[#8B5E34] text-white rounded-lg text-sm font-medium hover:bg-[#7A5030] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-[#8B5E34]/10 to-[#8B5E34]/5 flex items-center justify-center">
            <BedDouble className="w-5 h-5 text-[#8B5E34]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-neutral-900">Room Types</h2>
            <p className="text-xs text-neutral-500">Manage room categories and base pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoomTypes}
            disabled={isLoading}
            className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-neutral-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B5E34] text-white rounded-lg text-sm font-medium hover:bg-[#7A5030] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room Type
          </button>
        </div>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roomTypes.map((room) => (
          <div
            key={room.id}
            className="bg-white rounded-[10px] border border-neutral-200/60 overflow-hidden hover:border-neutral-300 transition-all"
          >
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-neutral-100 bg-gradient-to-br from-neutral-50/50 to-white">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[13px] font-semibold text-neutral-900">{room.name}</h3>
                  <p className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">{room.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingRoom(room)}
                    disabled={isSaving}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(room.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-5 space-y-4">
              {/* Price and Occupancy */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-[#8B5E34]" />
                  <span className="text-lg font-semibold text-neutral-900">{room.price.toLocaleString()}</span>
                  <span className="text-xs text-neutral-500">/night</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Up to {room.maxOccupancy} guests</span>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {room.amenities.slice(0, 4).map((amenity, idx) => (
                    <span
                      key={`${amenity}-${idx}`}
                      className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md"
                    >
                      {getAmenityLabel(amenity)}
                    </span>
                  ))}
                  {room.amenities.length > 4 && (
                    <span className="px-2.5 py-1 bg-neutral-100 text-neutral-500 text-xs rounded-md">
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              {room.inclusions && room.inclusions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-neutral-500 mb-2">Inclusions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {room.inclusions.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-[#8B5E34]/5 text-[#8B5E34] text-xs rounded-md border border-[#8B5E34]/10"
                      >
                        {item}
                      </span>
                    ))}
                    {room.inclusions.length > 3 && (
                      <span className="px-2.5 py-1 bg-neutral-50 text-neutral-500 text-xs rounded-md border border-neutral-200">
                        +{room.inclusions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delete Confirmation */}
            {deleteConfirm === room.id && (
              <div className="px-5 py-3 bg-rose-50 border-t border-rose-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-rose-700">Delete this room type?</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="px-3 py-1.5 text-sm text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {roomTypes.length === 0 && (
        <div className="bg-neutral-50/50 rounded-[10px] text-center py-16 border border-dashed border-neutral-200">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <BedDouble className="w-6 h-6 text-neutral-400" />
          </div>
          <h3 className="text-sm font-medium text-neutral-900 mb-1">No Room Types</h3>
          <p className="text-sm text-neutral-500 mb-6">Get started by adding your first room type</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B5E34] text-white rounded-lg text-sm font-medium hover:bg-[#7A5030] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Room Ty
          </button>
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
