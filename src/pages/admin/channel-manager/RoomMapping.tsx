/**
 * RoomMapping Page
 * Map PMS room types to OTA room types - Glimmora Design System v5.0
 * Enhanced for consistency with OTA Connections page
 */

import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link2, Sparkles, Check, AlertTriangle, Layers, Search, ChevronDown, Loader2, ArrowRight, X } from 'lucide-react';
import { useChannelManager } from '../../../context/ChannelManagerContext';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import RoomMappingTable from '../../../components/channel-manager/RoomMappingTable';
import { Button, IconButton } from '../../../components/ui2/Button';
import { DropdownMenu, DropdownMenuItem } from '../../../components/ui2/DropdownMenu';
import { Drawer } from '../../../components/ui2/Drawer';
import { useToast } from '../../../contexts/ToastContext';

export default function RoomMapping() {
  const {
    otas,
    roomMappings,
    isLoading: contextLoading,
    mapRoom,
    autoMapRoomMappings,
    fetchRoomMappings,
  } = useChannelManager();
  const toast = useToast();
  const [selectedOTA, setSelectedOTA] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoMapping, setIsAutoMapping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [targetOTA, setTargetOTA] = useState(null);

  // Refetch data function for SSE
  const refetchData = useCallback(async () => {
    await fetchRoomMappings();
  }, [fetchRoomMappings]);

  // Register SSE event handlers for real-time updates
  useChannelManagerSSEEvents({
    onSyncStatus: refetchData,
    refetchData,
  });

  // Get connected OTAs
  const connectedOTAs = otas.filter(ota => ota.status === 'connected');

  // Calculate mapping stats
  const getMappingStats = (otaCode) => {
    const mappedCount = roomMappings.filter(rm =>
      rm.otaMappings?.some(om => om.otaCode === otaCode && om.status === 'active')
    ).length;
    return {
      mapped: mappedCount,
      total: 8 // 8 room types
    };
  };

  // Get total active mappings across all OTAs
  const getTotalActiveMappings = () => {
    let count = 0;
    roomMappings.forEach(rm => {
      count += rm.otaMappings?.filter(om => om.status === 'active').length || 0;
    });
    return count;
  };

  const handleAutoMap = async (otaCode) => {
    setIsAutoMapping(true);
    setTargetOTA(connectedOTAs.find(o => o.code === otaCode));
    setSuggestions([]);
    setShowSuggestions(false);
    
    try {
      const result = await autoMapRoomMappings(otaCode);
      
      // Handle different response scenarios
      if (result) {
        const mappingsCreated = result.mappingsCreated || 0;
        const suggestions = result.suggestions || [];
        
        // Normalize suggestions to ensure they have required fields
        const normalizedSuggestions = suggestions.map((s: any) => ({
          pmsRoomTypeId: s.pmsRoomTypeId || s.pmsRoomType,
          pmsRoomType: s.pmsRoomType,
          pmsRoomName: s.pmsRoomName || s.pmsRoomType,
          suggestedOTARoomType: s.suggestedOTARoomType || s.otaRoomType,
          suggestedOTARoomId: s.suggestedOTARoomId || s.otaRoomId,
          confidence: s.confidence || 0.8
        }));
        
        // Check if we got suggestions that need user approval
        if (normalizedSuggestions.length > 0) {
          if (mappingsCreated === 0) {
            // Only suggestions, no auto-created mappings - show drawer for review
            setSuggestions(normalizedSuggestions);
            setShowSuggestions(true);
          } else {
            // Some mappings created, but also have suggestions
            // Refresh data first, then show suggestions for remaining
            await refetchData();
            if (normalizedSuggestions.length > 0) {
              setSuggestions(normalizedSuggestions);
              setShowSuggestions(true);
            }
          }
        } else if (mappingsCreated > 0) {
          // Mappings were created automatically, no suggestions
          await refetchData();
          toast.success(`Successfully auto-mapped ${mappingsCreated} room type${mappingsCreated === 1 ? '' : 's'}`);
        } else {
          // No suggestions and no mappings created
          await refetchData();
          toast.warning('No mapping suggestions could be generated. Please map rooms manually using "Bulk Map" or "Map Room" buttons.');
        }
      } else {
        // No result returned - might be an error or empty response
        await refetchData();
        toast.warning('Auto-map completed but no mappings were created. Try mapping rooms manually.');
      }
    } catch (err) {
      console.error('Auto-map error:', err);
      toast.error('Auto-map failed. Please try again or map rooms manually.');
      // Still refresh data in case some mappings were created before error
      await refetchData();
    } finally {
      setIsAutoMapping(false);
    }
  };

  const handleApplySuggestions = async () => {
    setIsAutoMapping(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      
      // Apply each suggestion manually
      for (const suggestion of suggestions) {
        try {
          await mapRoom({
            pmsRoomTypeId: String(suggestion.pmsRoomTypeId ?? suggestion.pmsRoomType ?? ''),
            pmsRoomType: suggestion.pmsRoomName ?? suggestion.pmsRoomType ?? '',
            otaCode: targetOTA.code,
            otaRoomType: suggestion.suggestedOTARoomType ?? '',
            otaRoomId: suggestion.suggestedOTARoomId ?? (suggestion.suggestedOTARoomType ?? '').toString().toUpperCase().replace(/\s+/g, '_'),
          });
          successCount++;
        } catch (err) {
          console.error('Failed to apply suggestion:', err);
          errorCount++;
        }
      }
      
      // Close suggestions drawer
      setShowSuggestions(false);
      setSuggestions([]);
      
      // Refresh data to show new mappings
      await refetchData();
      
      // Show summary message (individual success/error messages are shown by mapRoom)
      if (successCount > 0 && errorCount === 0) {
        // All succeeded - message already shown by individual mapRoom calls
      } else if (successCount > 0) {
        // Some succeeded, some failed
        console.warn(`Applied ${successCount} mappings, ${errorCount} failed`);
      }
    } catch (err) {
      console.error('Failed to apply suggestions:', err);
    } finally {
      setIsAutoMapping(false);
    }
  };

  const getFilterLabel = () => {
    if (selectedOTA) {
      const ota = connectedOTAs.find(o => o.code === selectedOTA);
      const stats = getMappingStats(selectedOTA);
      return `${ota?.name} (${stats.mapped}/${stats.total})`;
    }
    return `All OTAs (${connectedOTAs.length})`;
  };

  // KPI cards configuration
  const kpiCards = [
    {
      icon: Link2,
      title: 'Connected OTAs',
      value: connectedOTAs.length,
      accent: 'terra'
    },
    {
      icon: Check,
      title: 'Active Mappings',
      value: getTotalActiveMappings(),
      accent: 'sage'
    },
    {
      icon: AlertTriangle,
      title: 'Unmapped',
      value: connectedOTAs.length * 4 - getTotalActiveMappings(),
      accent: 'gold'
    },
    {
      icon: Layers,
      title: 'Room Types',
      value: roomMappings.length,
      accent: 'neutral'
    }
  ];

  const accentColors = {
    terra: { icon: 'bg-terra-100 text-terra-600' },
    sage: { icon: 'bg-sage-100 text-sage-600' },
    gold: { icon: 'bg-gold-100 text-gold-600' },
    neutral: { icon: 'bg-neutral-100 text-neutral-500' }
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-terra-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading room mappings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F7' }}>
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Room Mapping
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Map your PMS room types to OTA room types for accurate inventory sync</span>
              <span className="sm:hidden">Map PMS to OTA room types</span>
            </p>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {kpiCards.map((kpi, index) => {
            const colors = accentColors[kpi.accent];
            return (
              <div key={index} className="rounded-[10px] bg-white p-4 sm:p-6">
                {/* Header with Icon */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${colors.icon}`}>
                    <kpi.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-neutral-400 truncate">
                    {kpi.title}
                  </p>
                </div>

                {/* Value */}
                <p className="text-xl sm:text-[28px] font-semibold tracking-tight text-neutral-900">
                  {kpi.value}
                </p>
              </div>
            );
          })}
        </section>

        {/* Search & Filters */}
        {connectedOTAs.length > 0 && (
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search room types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-3 sm:pr-4 rounded-lg text-xs sm:text-[13px] bg-white border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
              />
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu
              align="end"
              trigger={
                <button className="h-9 sm:h-10 w-full sm:w-[180px] px-3 sm:px-4 pr-2.5 sm:pr-3 rounded-lg text-xs sm:text-[13px] bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all flex items-center justify-between">
                  <span className="truncate">{getFilterLabel()}</span>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 flex-shrink-0 ml-2" />
                </button>
              }
            >
              <DropdownMenuItem onSelect={() => setSelectedOTA(null)}>
                All OTAs ({connectedOTAs.length})
              </DropdownMenuItem>
              {connectedOTAs.map(ota => {
                const stats = getMappingStats(ota.code);
                return (
                  <DropdownMenuItem key={ota.code} onSelect={() => setSelectedOTA(ota.code)}>
                    {ota.name} ({stats.mapped}/{stats.total})
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenu>
          </section>
        )}

        {/* No Connected OTAs */}
        {connectedOTAs.length === 0 && (
          <div className="rounded-[10px] bg-white p-8 sm:p-16 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mx-auto mb-4 sm:mb-5 bg-neutral-50">
              <Link2 className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-300" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">No Connected OTAs</h3>
            <p className="text-xs sm:text-[13px] text-neutral-500 mb-4 sm:mb-6">
              Connect to an OTA first to start mapping room types
            </p>
            <Button
              variant="primary"
              icon={Link2}
              onClick={() => window.location.href = '/admin/channel-manager/ota'}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Go to OTA Connections</span>
              <span className="sm:hidden">OTA Connections</span>
            </Button>
          </div>
        )}

        {/* Mapping Tables */}
        {connectedOTAs.length > 0 && (
          <section className="space-y-3 sm:space-y-4">
            {(selectedOTA ? connectedOTAs.filter(o => o.code === selectedOTA) : connectedOTAs).map(ota => (
              <RoomMappingTable
                key={ota.code}
                otaCode={ota.code}
                onAutoMap={() => handleAutoMap(ota.code)}
                searchQuery={searchQuery}
              />
            ))}
          </section>
        )}
      </div>

      {/* Auto-Map Overlay */}
      {isAutoMapping && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-[10px] bg-white p-6 sm:p-8 text-center max-w-sm mx-4 shadow-xl">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-terra-50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-terra-600" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">
              Processing Auto-Map
            </h3>
            <p className="text-xs sm:text-[13px] text-neutral-500">
              AI is analyzing room types and suggesting optimal mappings...
            </p>
            <p className="text-[11px] text-neutral-400 mt-2">
              This may take a few seconds
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Suggestions Drawer */}
      <Drawer
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        title="AI Suggested Mappings"
        subtitle={`Suggestions for ${targetOTA?.name || 'OTA'}`}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="ghost"
              onClick={() => setShowSuggestions(false)}
              className="px-5 py-2 text-[13px] font-semibold"
            >
              Discard Suggestions
            </Button>
            <Button
              variant="primary"
              onClick={handleApplySuggestions}
              loading={isAutoMapping}
              className="px-5 py-2 text-[13px] font-semibold"
            >
              Apply All Suggested Mappings
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-terra-50 border border-terra-100 mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-terra-600" />
              <p className="text-[13px] text-terra-700 font-medium">
                Our AI has analyzed your room types and suggests these mappings with high confidence.
              </p>
            </div>
          </div>

          <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-xl overflow-hidden">
            {suggestions.map((suggestion, idx) => (
              <div key={idx} className="p-4 bg-white flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    PMS Room
                  </p>
                  <p className="font-semibold text-neutral-900">{suggestion.pmsRoomName || suggestion.pmsRoomType}</p>
                </div>
                <div className="flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-terra-300" />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Suggested OTA Room
                  </p>
                  <p className="font-semibold text-terra-600">{suggestion.suggestedOTARoomType}</p>
                </div>
                <button
                  onClick={() => setSuggestions(prev => prev.filter((_, i) => i !== idx))}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-rose-50 text-neutral-400 hover:text-rose-500 transition-colors"
                  title="Remove this suggestion"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {suggestions.length === 0 && (
            <div className="text-center py-6 text-neutral-500 text-[13px]">
              All suggestions have been removed.
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
