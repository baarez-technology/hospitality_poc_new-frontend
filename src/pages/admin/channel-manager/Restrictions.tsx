/**
 * Restrictions Page
 * Manage booking restrictions (CTA, CTD, Stop Sell, Min/Max Stay) - Glimmora Design System v5.0
 * Consistent with RateSync, OTAConnections, and RoomMapping pages
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, Calendar, Edit2, Trash2, ToggleRight, Shield, Ban, Clock,
  Search, ChevronDown, Check, AlertTriangle, MoreHorizontal, Eye, Loader2
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useChannelManager } from '../../../context/ChannelManagerContext';
import { useChannelManagerSSEEvents } from '../../../hooks/useChannelManagerSSEEvents';
import RestrictionDrawer from '../../../components/channel-manager/RestrictionDrawer';
import { Button, IconButton } from '../../../components/ui2/Button';
import { Modal } from '../../../components/ui2/Modal';

// Custom Select Dropdown Component - Glimmora Design System v5.0
function SelectDropdown({ value, onChange, options, placeholder = 'Select...', className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const calculatePosition = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    };
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
      setPosition(null);
    } else {
      setPosition(calculatePosition());
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setPosition(null);
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (!triggerRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setIsOpen(false);
        setPosition(null);
      }
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Update position on scroll
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      setPosition(calculatePosition());
    };

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className={`h-9 sm:h-10 px-3 sm:px-4 rounded-lg text-xs sm:text-[13px] bg-white border text-left flex items-center justify-between gap-2 transition-all ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        } ${className}`}
      >
        <span className={selectedOption ? 'text-neutral-700' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && position && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: `${position.width}px`,
            zIndex: 9999
          }}
          className="bg-white rounded-lg border border-neutral-200 shadow-lg shadow-neutral-900/10 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
        >
          <div className="py-1 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2 sm:py-2.5 text-left text-xs sm:text-[13px] flex items-center justify-between transition-colors ${
                  value === option.value
                    ? 'bg-terra-50 text-terra-700 font-medium'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-terra-500" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function Restrictions() {
  const {
    restrictions,
    otas,
    isLoading: contextLoading,
    setRestriction,
    removeRestriction,
    toggleRestrictionStatus,
    fetchRestrictions,
  } = useChannelManager();
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingRestriction, setEditingRestriction] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, restriction: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const dropdownRef = useRef(null);
  const buttonRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const isButtonClick = Object.values(buttonRefs.current).some(
          btn => btn && btn.contains(event.target)
        );
        if (!isButtonClick) {
          setOpenDropdownId(null);
          setDropdownPosition(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update dropdown position on scroll/resize
  useEffect(() => {
    if (!openDropdownId) return;

    const updatePosition = () => {
      const button = buttonRefs.current[openDropdownId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.right - 144
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [openDropdownId]);

  const handleMoreClick = (e, restrictionId) => {
    e.stopPropagation();
    if (openDropdownId === restrictionId) {
      setOpenDropdownId(null);
      setDropdownPosition(null);
    } else {
      const button = buttonRefs.current[restrictionId];
      if (button) {
        const rect = button.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 4,
          left: rect.right - 144
        });
      }
      setOpenDropdownId(restrictionId);
    }
  };

  // Refetch data function for SSE
  const refetchData = useCallback(async () => {
    await fetchRestrictions();
  }, [fetchRestrictions]);

  // Register SSE event handlers for real-time updates
  useChannelManagerSSEEvents({
    onRestrictionsUpdated: refetchData,
    onAvailabilityUpdated: refetchData,
    refetchData,
  });

  // Filter state - single select dropdowns
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'stopSell' | 'cta' | 'ctd' | 'minStay' | 'maxStay'

  const connectedOTAs = otas.filter(o => o.status === 'connected');

  // Filter restrictions based on search query and filters
  const filteredRestrictions = restrictions.filter(restriction => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && !restriction.isActive) return false;
      if (statusFilter === 'inactive' && restriction.isActive) return false;
    }

    // Type filter
    if (typeFilter !== 'all') {
      const hasStopSell = restriction.restriction.stopSell;
      const hasCta = restriction.restriction.cta;
      const hasCtd = restriction.restriction.ctd;
      const hasMinStay = restriction.restriction.minStay > 1;
      const hasMaxStay = restriction.restriction.maxStay > 0;

      if (typeFilter === 'stopSell' && !hasStopSell) return false;
      if (typeFilter === 'cta' && !hasCta) return false;
      if (typeFilter === 'ctd' && !hasCtd) return false;
      if (typeFilter === 'minStay' && !hasMinStay) return false;
      if (typeFilter === 'maxStay' && !hasMaxStay) return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const roomType = restriction.roomType === 'ALL' ? 'all rooms' : restriction.roomType.toLowerCase();
    const channel = restriction.otaCode === 'ALL' ? 'all channels' : (otas.find(o => o.code === restriction.otaCode)?.name || restriction.otaCode).toLowerCase();
    const reason = (restriction.reason || '').toLowerCase();
    return roomType.includes(query) || channel.includes(query) || reason.includes(query);
  });

  // Get restriction type label and styling
  const getRestrictionInfo = (restriction) => {
    const types = [];
    if (restriction.restriction.stopSell) {
      types.push({ label: 'Stop Sell', color: 'rose' });
    }
    if (restriction.restriction.cta) {
      types.push({ label: 'CTA', color: 'gold' });
    }
    if (restriction.restriction.ctd) {
      types.push({ label: 'CTD', color: 'sage' });
    }
    if (restriction.restriction.minStay > 1) {
      types.push({ label: `Min ${restriction.restriction.minStay}N`, color: 'terra' });
    }
    if (restriction.restriction.maxStay) {
      types.push({ label: `Max ${restriction.restriction.maxStay}N`, color: 'terra' });
    }
    return types;
  };

  // Stats
  const stats = {
    total: restrictions.length,
    active: restrictions.filter(r => r.isActive).length,
    stopSell: restrictions.filter(r => r.restriction.stopSell && r.isActive).length,
    minStay: restrictions.filter(r => r.restriction.minStay > 1 && r.isActive).length
  };

  // KPI cards configuration
  const kpiCards = [
    {
      icon: Calendar,
      title: 'Total Rules',
      value: stats.total,
      accent: 'terra'
    },
    {
      icon: ToggleRight,
      title: 'Active',
      value: stats.active,
      accent: 'sage'
    },
    {
      icon: Ban,
      title: 'Stop Sell',
      value: stats.stopSell,
      accent: 'rose'
    },
    {
      icon: Clock,
      title: 'Min Stay',
      value: stats.minStay,
      accent: 'gold'
    }
  ];

  const accentColors = {
    terra: { icon: 'bg-terra-100 text-terra-600' },
    sage: { icon: 'bg-sage-100 text-sage-600' },
    gold: { icon: 'bg-gold-100 text-gold-600' },
    rose: { icon: 'bg-rose-100 text-rose-600' },
    neutral: { icon: 'bg-neutral-100 text-neutral-500' }
  };

  const handleEdit = (restriction) => {
    setEditingRestriction(restriction);
    setShowDrawer(true);
  };

  const handleCreate = () => {
    setEditingRestriction(null);
    setShowDrawer(true);
  };

  const handleSave = async (data, isEditing) => {
    try {
      if (isEditing && editingRestriction) {
        // Update existing restriction
        await setRestriction({ ...data, id: editingRestriction.id });
      } else {
        // Create new restriction
        await setRestriction(data);
      }
      setShowDrawer(false);
      setEditingRestriction(null);
      await refetchData();
    } catch (err) {
      // Error already handled in context
    }
  };

  const handleDelete = (restriction) => {
    setDeleteConfirm({ isOpen: true, restriction });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.restriction) {
      try {
        await removeRestriction(deleteConfirm.restriction.id);
        await refetchData();
      } catch (err) {
        // Error already handled in context
      }
    }
    setDeleteConfirm({ isOpen: false, restriction: null });
  };

  const handleToggleActive = async (restriction) => {
    try {
      await toggleRestrictionStatus(restriction.id);
      await refetchData();
    } catch (err) {
      // Error already handled in context
    }
  };

  const formatDateRange = (dateRange) => {
    const start = new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${start} - ${end}`;
  };

  // Calculate duration in days
  const getDuration = (dateRange) => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays === 1) return '1 day';
    if (diffDays === 7) return '1 week';
    if (diffDays === 14) return '2 weeks';
    return `${diffDays} days`;
  };

  const getOTAName = (code) => {
    if (code === 'ALL') return 'All OTAs';
    return otas.find(o => o.code === code)?.name || code;
  };

  // Get restriction badge colors
  const getRestrictionBadgeClasses = (color) => {
    const colorMap = {
      rose: 'bg-rose-100 text-rose-700',
      gold: 'bg-gold-100 text-gold-700',
      sage: 'bg-sage-100 text-sage-700',
      terra: 'bg-terra-100 text-terra-700',
    };
    return colorMap[color] || 'bg-neutral-100 text-neutral-700';
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F7F7' }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-terra-600 mx-auto mb-4" />
          <p className="text-neutral-600">Loading restrictions...</p>
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
              Restrictions
            </h1>
            <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5 sm:mt-1">
              <span className="hidden sm:inline">Manage booking restrictions across your distribution channels</span>
              <span className="sm:hidden">Manage booking restrictions</span>
            </p>
          </div>
          <Button variant="primary" icon={Plus} onClick={handleCreate} className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Add Restriction</span>
            <span className="sm:hidden">Add</span>
          </Button>
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
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search restrictions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-3 sm:pr-4 rounded-lg text-xs sm:text-[13px] bg-white border border-neutral-200 text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-terra-500/20 focus:border-terra-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Filter Dropdown */}
            <SelectDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              placeholder="All Status"
              className="flex-1 sm:flex-none sm:min-w-[120px]"
            />

            {/* Restriction Type Filter Dropdown */}
            <SelectDropdown
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'stopSell', label: 'Stop Sell' },
                { value: 'cta', label: 'CTA' },
                { value: 'ctd', label: 'CTD' },
                { value: 'minStay', label: 'Min Stay' },
                { value: 'maxStay', label: 'Max Stay' }
              ]}
              placeholder="All Types"
              className="flex-1 sm:flex-none sm:min-w-[120px]"
            />
          </div>
        </section>

        {/* Restriction Rules Table */}
        <section className="rounded-[10px] bg-white overflow-hidden">
          {/* Empty State */}
          {filteredRestrictions.length === 0 ? (
            <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-neutral-50 flex items-center justify-center">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-[13px] font-medium text-neutral-600">
                    {searchQuery ? 'No restrictions match your search' : 'No restrictions configured'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400">
                    {searchQuery ? 'Try adjusting your search terms' : 'Create your first restriction'}
                  </p>
                </div>
                {!searchQuery && (
                  <Button variant="primary" icon={Plus} onClick={handleCreate} className="mt-2 text-xs sm:text-sm">
                    <span className="hidden sm:inline">Add Restriction</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse">
                  <colgroup>
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '130px' }} />
                    <col style={{ width: '130px' }} />
                    <col style={{ width: '140px' }} />
                    <col style={{ width: '180px' }} />
                    <col style={{ width: '100px' }} />
                    <col style={{ width: '50px' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-neutral-50/30 border-b border-neutral-100">
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                        Date Range
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                        Room Type
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                        Channel
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                        Restriction
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                        Reason
                      </th>
                      <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-2 py-3 sm:py-4 text-[9px] sm:text-[10px] font-semibold uppercase tracking-widest text-neutral-400 whitespace-nowrap sticky right-0 bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredRestrictions.map(restriction => {
                      const types = getRestrictionInfo(restriction);
                      const ota = otas.find(o => o.code === restriction.otaCode);

                      return (
                        <tr
                          key={restriction.id}
                          className={`group bg-white hover:bg-neutral-50/30 transition-colors duration-100 ${!restriction.isActive ? 'opacity-50' : ''}`}
                        >
                          {/* Date Range */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6">
                            <div className="flex flex-col">
                              <span className="text-xs sm:text-[13px] font-semibold text-neutral-900 whitespace-nowrap">
                                {formatDateRange(restriction.dateRange)}
                              </span>
                              <span className="text-[9px] sm:text-[10px] text-neutral-400 mt-0.5">
                                {getDuration(restriction.dateRange)}
                              </span>
                            </div>
                          </td>

                          {/* Room Type */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6">
                            <span className="text-xs sm:text-[13px] font-medium text-neutral-700">
                              {restriction.roomType === 'ALL' ? 'All Rooms' : restriction.roomType}
                            </span>
                          </td>

                          {/* Channel */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6">
                            <span className="text-xs sm:text-[13px] font-medium text-neutral-700">
                              {restriction.otaCode === 'ALL' ? 'All Channels' : (ota?.name || restriction.otaCode)}
                            </span>
                          </td>

                          {/* Restriction Type */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6">
                            <div className="flex flex-wrap gap-1">
                              {types.map((type, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium ${getRestrictionBadgeClasses(type.color)}`}
                                >
                                  {type.label}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Reason */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6">
                            <p className="text-[11px] sm:text-[12px] text-neutral-500 max-w-[140px] sm:max-w-[180px] line-clamp-2">
                              {restriction.reason || <span className="italic text-neutral-400">No reason</span>}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="py-3 sm:py-4 px-3 sm:px-6">
                            <button
                              onClick={() => handleToggleActive(restriction)}
                              className={`inline-flex px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-medium transition-colors ${
                                restriction.isActive
                                  ? 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                              }`}
                            >
                              {restriction.isActive ? 'Active' : 'Inactive'}
                            </button>
                          </td>

                          {/* Actions - Sticky */}
                          <td className="px-2 py-3 sm:py-4 text-center whitespace-nowrap sticky right-0 bg-white group-hover:bg-neutral-50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                            <div className="relative inline-block">
                              <button
                                ref={(el) => { buttonRefs.current[restriction.id] = el; }}
                                onClick={(e) => handleMoreClick(e, restriction.id)}
                                className={`p-1.5 rounded-md hover:bg-neutral-100 transition-colors ${openDropdownId === restriction.id ? 'bg-neutral-100' : ''}`}
                              >
                                <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                              </button>

                              {openDropdownId === restriction.id && dropdownPosition && createPortal(
                                <div
                                  ref={dropdownRef}
                                  style={{
                                    position: 'fixed',
                                    top: `${dropdownPosition.top}px`,
                                    left: `${dropdownPosition.left}px`,
                                    zIndex: 9999
                                  }}
                                  className="w-36 bg-white rounded-lg shadow-lg shadow-neutral-900/10 border border-neutral-200 py-1 animate-in fade-in-0 zoom-in-95 duration-100"
                                >
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleEdit(restriction); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleToggleActive(restriction); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-neutral-700 hover:bg-neutral-50"
                                  >
                                    <ToggleRight className="w-3.5 h-3.5 text-neutral-500" />
                                    {restriction.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <div className="border-t border-neutral-100 my-1" />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDelete(restriction); }}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete
                                  </button>
                                </div>,
                                document.body
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </>
          )}
        </section>
      </div>

      {/* Drawer */}
      <RestrictionDrawer
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false);
          setEditingRestriction(null);
        }}
        restriction={editingRestriction}
        onSave={handleSave}
        onDelete={(id) => {
          removeRestriction(id);
          setShowDrawer(false);
          setEditingRestriction(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, restriction: null })}
        size="sm"
        showClose={false}
      >
        <div className="p-4 sm:p-6">
          {/* Warning Icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-3 sm:mb-4">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">
            Delete Restriction
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-neutral-500 leading-relaxed">
            Are you sure you want to delete this restriction? This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/50">
          <Button
            variant="ghost"
            onClick={() => setDeleteConfirm({ isOpen: false, restriction: null })}
            className="px-4 sm:px-5 py-2 text-xs sm:text-[13px] font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            className="px-4 sm:px-5 py-2 text-xs sm:text-[13px] font-semibold"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
