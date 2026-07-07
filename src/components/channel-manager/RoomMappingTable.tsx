/**
 * RoomMappingTable Component
 * Card-based room mapping interface - Glimmora Design System v5.0
 * Redesigned for better UX with clear visual hierarchy
 */

import { useState } from 'react';
import {
  Link2, Check, AlertTriangle, ArrowRight,
  Sparkles, Settings, Users, ChevronDown, ChevronUp,
  BarChart3, CalendarCheck, Layers
} from 'lucide-react';
import { useChannelManager } from '../../context/ChannelManagerContext';
import { Button, IconButton } from '../ui2/Button';
import EditMappingModal from './EditMappingModal';
import BulkMappingDrawer from './BulkMappingDrawer';
import { API_ENDPOINTS } from '@/config/constants';

export default function RoomMappingTable({ otaCode, onAutoMap, searchQuery = '' }) {
  const { roomMappings, otas, roomTypes, mapRoom, fetchRoomMappings, showError } = useChannelManager();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [bulkDrawerOpen, setBulkDrawerOpen] = useState(false);

  // Get OTA info
  const ota = otas.find(o => o.code === otaCode);

  // Use room types from API, fallback to empty array if not loaded yet
  const pmsRoomTypes = roomTypes.length > 0 ? roomTypes : [];

  // Filter by search query
  const filteredRoomTypes = pmsRoomTypes.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get mapping for a PMS room type (match by room.id, room.roomTypeId, or room name so UI updates regardless of API key shape)
  const getMappingForRoom = (room) => {
    if (!room) return null;
    const roomMapping = roomMappings.find(m => {
      const idStr = room.id?.toString();
      const typeIdStr = room.roomTypeId != null ? String(room.roomTypeId) : null;
      return (
        m.pmsRoomType === room.name ||
        m.pmsRoomType === idStr ||
        m.pmsRoomTypeId === room.id ||
        m.pmsRoomTypeId?.toString() === idStr ||
        (typeIdStr != null && (m.pmsRoomTypeId === room.roomTypeId || m.pmsRoomTypeId?.toString() === typeIdStr))
      );
    });
    if (!roomMapping) return null;

    const otaMapping = roomMapping.otaMappings?.find(om => om.otaCode === otaCode);
    if (!otaMapping) return null;

    return {
      id: `${roomMapping.id}-${otaCode}`,
      pmsRoomType: room.id,
      otaCode: otaCode,
      otaRoomType: otaMapping.otaRoomType,
      isActive: otaMapping.status === 'active',
      ...otaMapping
    };
  };

  // Get count of active mappings for this OTA
  const getActiveMappingsCount = () => {
    return roomMappings.filter(rm =>
      rm.otaMappings?.some(om => om.otaCode === otaCode && om.status === 'active')
    ).length;
  };

  const handleOpenEditModal = (room) => {
    setSelectedRoom(room);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedRoom(null);
  };

  const handleSaveMapping = async (mappingData) => {
    if (!mappingData.otaRoomType || !mappingData.otaRoomType.trim()) {
      throw new Error('OTA room type is required');
    }
    
    let numericId = mappingData.pmsRoomTypeId;
    
    // Fallback 1: If no numeric ID, try to find it from existing room mappings (by room name)
    if ((numericId == null || typeof numericId !== 'number' || !Number.isInteger(numericId)) && mappingData.pmsRoomName) {
      const existingMapping = roomMappings.find(m => 
        m.pmsRoomType === mappingData.pmsRoomName || 
        m.pmsRoomType === mappingData.pmsRoomType
      );
      if (existingMapping?.pmsRoomTypeId) {
        const parsed = typeof existingMapping.pmsRoomTypeId === 'string' 
          ? (/^\d+$/.test(existingMapping.pmsRoomTypeId) ? parseInt(existingMapping.pmsRoomTypeId, 10) : null)
          : (typeof existingMapping.pmsRoomTypeId === 'number' ? existingMapping.pmsRoomTypeId : null);
        if (parsed != null && Number.isInteger(parsed)) {
          numericId = parsed;
        }
      }
    }
    
    // Fallback 2: If still no numeric ID, try to parse the room.id if it's numeric
    if ((numericId == null || typeof numericId !== 'number' || !Number.isInteger(numericId)) && mappingData.pmsRoomType) {
      const parsed = /^\d+$/.test(String(mappingData.pmsRoomType)) 
        ? parseInt(String(mappingData.pmsRoomType), 10) 
        : null;
      if (parsed != null && Number.isInteger(parsed)) {
        numericId = parsed;
      }
    }
    
    // Final check: if still no valid numeric ID, show error with debug info
    if (numericId == null || typeof numericId !== 'number' || !Number.isInteger(numericId)) {
      const room = pmsRoomTypes.find(r => r.id === mappingData.pmsRoomType || r.name === mappingData.pmsRoomName);
      console.error('Room type missing numeric ID:', {
        roomName: mappingData.pmsRoomName,
        roomId: mappingData.pmsRoomType,
        roomData: room,
        availableFields: room?._raw ? Object.keys(room._raw) : 'N/A',
      });
      const msg = `Room type "${mappingData.pmsRoomName}" does not have a numeric ID. The channel manager requires a numeric PMS room type ID. Please ensure your room-types API (${API_ENDPOINTS?.ROOM_TYPES?.LIST || '/api/v1/room-types'}) returns a numeric id or room_type_id field for each room type.`;
      showError(msg);
      throw new Error(msg);
    }
    
    try {
      // Backend accepts numeric id or slug; prefer numeric when available
      const rawId = mappingData.pmsRoomTypeId ?? mappingData.pmsRoomType;
      const isNumeric = typeof rawId === 'number' && !Number.isNaN(rawId) ||
        (typeof rawId === 'string' && /^\d+$/.test(rawId));
      const pmsRoomTypeId = isNumeric
        ? (typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10))
        : String(rawId ?? '');
      if (pmsRoomTypeId === '' || (typeof pmsRoomTypeId === 'number' && Number.isNaN(pmsRoomTypeId))) {
        throw new Error('Room type is missing. Please refresh the page and try again.');
      }
      const pmsRoomTypeName = mappingData.pmsRoomName ?? mappingData.pmsRoomType ?? '';
      if (!pmsRoomTypeName) {
        throw new Error('Room type name is missing. Please refresh the page and try again.');
      }
      const result = await mapRoom({
        pmsRoomTypeId,
        pmsRoomType: pmsRoomTypeName,
        otaCode: otaCode,
        otaRoomType: mappingData.otaRoomType.trim(),
        otaRoomId: mappingData.otaRoomType.toUpperCase().replace(/\s+/g, '_'),
      });
      
      // Ensure UI refreshes by explicitly fetching room mappings
      // (mapRoom already calls fetchRoomMappings, but we ensure it completes)
      await fetchRoomMappings();
      
      // Success message is shown in context via mapRoom
      // Return result to indicate success
      return result;
    } catch (err) {
      console.error('Failed to save room mapping:', err);
      throw err;
    }
  };

  const activeMappings = getActiveMappingsCount();
  const totalRooms = pmsRoomTypes.length;
  const mappingPercentage = Math.round((activeMappings / totalRooms) * 100);

  return (
    <div className="rounded-[10px] bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
          {/* Left: OTA Identity */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* OTA Logo with status indicator */}
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                style={{ backgroundColor: ota?.color || '#A57865' }}
              >
                {ota?.name?.substring(0, 2).toUpperCase() || 'OT'}
              </div>
              {/* Status indicator */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white ${
                activeMappings === totalRooms ? 'bg-sage-500' :
                activeMappings > 0 ? 'bg-gold-500' : 'bg-neutral-400'
              }`} />
            </div>

            {/* OTA Name & Mapping Progress */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xs sm:text-sm font-semibold text-neutral-800 truncate">
                  {ota?.name || 'Unknown OTA'}
                </h3>
                <span className={`px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider rounded flex-shrink-0 ${
                  activeMappings === totalRooms
                    ? 'bg-sage-100 text-sage-700'
                    : activeMappings > 0
                      ? 'bg-gold-100 text-gold-700'
                      : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {activeMappings === totalRooms ? 'Complete' : activeMappings > 0 ? 'Partial' : 'Not Mapped'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${activeMappings === totalRooms ? 'bg-sage-500' : 'bg-terra-500'
                      }`}
                    style={{ width: `${mappingPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium flex-shrink-0">
                  {activeMappings}/{totalRooms} mapped
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
            <Button
              onClick={() => setBulkDrawerOpen(true)}
              variant="outline"
              size="sm"
              icon={Layers}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Bulk Map</span>
              <span className="sm:hidden">Bulk</span>
            </Button>
            <Button
              onClick={onAutoMap}
              variant="outline"
              size="sm"
              icon={Sparkles}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Auto-Map</span>
              <span className="sm:hidden">Auto</span>
            </Button>
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? ChevronUp : ChevronDown}
              variant="ghost"
              size="sm"
              label={isExpanded ? 'Collapse' : 'Expand'}
            />
          </div>
        </div>
      </div>

      {/* Expandable Room Mappings */}
      {isExpanded && (
        <div className="border-t border-neutral-100">
          {/* Section Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-neutral-100">
            <h4 className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
              Room Type Mappings
            </h4>
          </div>
          {/* Room Mapping Cards */}
          <div className="divide-y divide-neutral-100">
            {filteredRoomTypes.map(room => {
              const mapping = getMappingForRoom(room);
              const isLinked = mapping?.isActive;

              return (
                <div key={room.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-neutral-50/50 transition-colors">
                  {isLinked ? (
                    /* Mapped State - Responsive Layout */
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      {/* Left: PMS Room → OTA Room */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          {/* PMS Room */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-[13px] font-semibold text-neutral-900 truncate">{room.name}</p>
                              <p className="text-[9px] sm:text-[10px] text-neutral-400">{room.baseOccupancy}-{room.maxOccupancy} guests</p>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="flex-shrink-0 hidden sm:block">
                            <ArrowRight className="w-4 h-4 text-sage-500" />
                          </div>

                          {/* OTA Room */}
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 pl-10 sm:pl-0">
                            <ArrowRight className="w-3 h-3 text-sage-500 sm:hidden flex-shrink-0" />
                            <div
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-[9px] sm:text-[10px]"
                              style={{ backgroundColor: ota?.color || '#A57865' }}
                            >
                              {ota?.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-[13px] font-semibold text-neutral-900 truncate">{mapping.otaRoomType}</p>
                              <p className="text-[9px] sm:text-[10px] text-neutral-400">{ota?.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Sync Status & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0 pl-10 sm:pl-0">
                        {/* Sync Badges */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-sage-50 text-[9px] sm:text-[10px] font-medium text-sage-700">
                            <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            Rates
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-sage-50 text-[9px] sm:text-[10px] font-medium text-sage-700">
                            <CalendarCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            Avail
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 pl-2 sm:pl-3 border-l border-neutral-100">
                          <IconButton
                            onClick={() => handleOpenEditModal(room)}
                            icon={Settings}
                            variant="ghost"
                            size="sm"
                            label="Edit mapping"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Unmapped State - Responsive Row */
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      {/* Left: Room Info */}
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                          <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-[13px] font-semibold text-neutral-900 truncate">{room.name}</p>
                          <p className="text-[9px] sm:text-[10px] text-neutral-400">{room.baseOccupancy}-{room.maxOccupancy} guests</p>
                        </div>
                      </div>

                      {/* Right: Status & Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0 pl-10 sm:pl-0">
                        <span className="text-[10px] sm:text-[11px] text-neutral-400 italic">Not mapped to {ota?.name}</span>
                        <Button
                          onClick={() => handleOpenEditModal(room)}
                          variant="outline"
                          size="sm"
                          icon={Link2}
                          className="text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Map Room</span>
                          <span className="sm:hidden">Map</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Validation Warning */}
          {activeMappings < totalRooms && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gold-200 bg-gold-50">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-gold-700 mb-0.5">
                    Incomplete Mapping
                  </p>
                  <p className="text-xs sm:text-[13px] text-gold-600">
                    {totalRooms - activeMappings} room {totalRooms - activeMappings === 1 ? 'type is' : 'types are'} not mapped.
                    <span className="hidden sm:inline"> These rooms will not sync inventory to {ota?.name}.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {activeMappings === totalRooms && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-sage-200 bg-sage-50">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sage-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-sage-700 mb-0.5">
                    Fully Mapped
                  </p>
                  <p className="text-xs sm:text-[13px] text-sage-600">
                    All room types are mapped and syncing with {ota?.name}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Mapping Modal */}
      <EditMappingModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveMapping}
        room={selectedRoom}
        ota={ota}
        existingMapping={selectedRoom ? getMappingForRoom(selectedRoom) : null}
      />

      {/* Bulk Mapping Drawer */}
      <BulkMappingDrawer
        isOpen={bulkDrawerOpen}
        onClose={() => setBulkDrawerOpen(false)}
        otaCode={otaCode}
        otaName={ota?.name}
        onSuccess={fetchRoomMappings}
      />
    </div>
  );
}
