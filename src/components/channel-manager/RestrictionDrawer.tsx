/**
 * RestrictionDrawer Component
 * Drawer for creating/editing restrictions (CTA, CTD, Stop Sell, Min/Max Stay) - Glimmora Design System v5.0
 * Redesigned for better UX and consistency with Tailwind components
 */

import { useState, useEffect, useRef } from 'react';
import { Trash2, Check, ChevronDown, Calendar, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useChannelManager } from '../../context/ChannelManagerContext';
import { Drawer } from '../ui2/Drawer';
import { Modal } from '../ui2/Modal';
import { Button } from '../ui2/Button';
import DatePicker from '../ui2/DatePicker';

// Custom Select Dropdown Component
function SelectDropdown({ value, onChange, options, placeholder = 'Select...' }) {
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
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border text-left flex items-center justify-between transition-all ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
                className={`w-full px-3 py-2.5 text-left text-[13px] flex items-center justify-between transition-colors ${
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

export default function RestrictionDrawer({
  isOpen,
  onClose,
  restriction = null,
  onSave,
  onDelete,
}) {
  const { otas, roomTypes } = useChannelManager();
  const connectedOTAs = otas.filter(o => o.status === 'connected');

  // Build room type options from API data
  const roomTypeOptions = [
    { value: 'ALL', label: 'All Room Types' },
    ...(roomTypes.map(rt => ({
      value: rt.name,
      label: rt.name
    })))
  ];

  const channelOptions = [
    { value: 'ALL', label: 'All Channels' },
    ...connectedOTAs.map(ota => ({ value: ota.code, label: ota.name }))
  ];

  const [formData, setFormData] = useState({
    roomType: 'ALL',
    otaCode: 'ALL',
    dateRange: {
      start: '',
      end: ''
    },
    restriction: {
      minStay: 1,
      maxStay: null,
      cta: false,
      ctd: false,
      stopSell: false
    },
    reason: '',
    isActive: true
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (restriction) {
      setFormData({
        roomType: restriction.roomType || 'ALL',
        otaCode: restriction.otaCode || 'ALL',
        dateRange: restriction.dateRange || { start: '', end: '' },
        restriction: restriction.restriction || {
          minStay: 1,
          maxStay: null,
          cta: false,
          ctd: false,
          stopSell: false
        },
        reason: restriction.reason || '',
        isActive: restriction.isActive !== false
      });
    } else {
      // Default for new restriction
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      setFormData({
        roomType: 'ALL',
        otaCode: 'ALL',
        dateRange: {
          start: today.toISOString().split('T')[0],
          end: tomorrow.toISOString().split('T')[0]
        },
        restriction: {
          minStay: 1,
          maxStay: null,
          cta: false,
          ctd: false,
          stopSell: false
        },
        reason: '',
        isActive: true
      });
    }
  }, [restriction, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const isEditing = !!restriction;
    const saveData = { ...formData };
    if (restriction?.id) {
      saveData.id = restriction.id;
    }
    onSave(saveData, isEditing);
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (restriction) {
      onDelete(restriction.id);
      onClose();
    }
    setShowDeleteConfirm(false);
  };

  const toggleRestriction = (key) => {
    setFormData(prev => ({
      ...prev,
      restriction: {
        ...prev.restriction,
        [key]: !prev.restriction[key]
      }
    }));
  };

  // Restriction type options
  const restrictionTypes = [
    {
      key: 'stopSell',
      label: 'Stop Sell',
      description: 'Block all bookings for selected dates',
      activeColor: 'bg-rose-50 border-rose-200',
      activeBadge: 'bg-rose-500'
    },
    {
      key: 'cta',
      label: 'Closed to Arrival (CTA)',
      description: 'No check-ins allowed on these dates',
      activeColor: 'bg-gold-50 border-gold-200',
      activeBadge: 'bg-gold-500'
    },
    {
      key: 'ctd',
      label: 'Closed to Departure (CTD)',
      description: 'No check-outs allowed on these dates',
      activeColor: 'bg-sage-50 border-sage-200',
      activeBadge: 'bg-sage-500'
    }
  ];

  const renderFooter = () => (
    <div className="flex items-center justify-between w-full">
      <div>
        {restriction && (
          <Button
            type="button"
            variant="ghost"
            icon={Trash2}
            onClick={handleDelete}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-5 py-2 text-[13px] font-semibold"
          >
            Delete
          </Button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" onClick={onClose} className="px-5 py-2 text-[13px] font-semibold">
          Cancel
        </Button>
        <Button type="submit" variant="primary" form="restriction-form" className="px-5 py-2 text-[13px] font-semibold">
          {restriction ? 'Update Restriction' : 'Create Restriction'}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title={restriction ? 'Edit Restriction' : 'New Restriction'}
        subtitle="Set booking restrictions for specific dates"
        maxWidth="max-w-2xl"
        footer={renderFooter()}
      >
        <form id="restriction-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Date Range Section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Date Range
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Start Date
                </label>
                <DatePicker
                  value={formData.dateRange.start}
                  onChange={(date) => setFormData(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: date }
                  }))}
                  placeholder="Select start"
                  minDate={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  End Date
                </label>
                <DatePicker
                  value={formData.dateRange.end}
                  onChange={(date) => setFormData(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: date }
                  }))}
                  placeholder="Select end"
                  minDate={formData.dateRange.start}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Applies To Section - BUG-011 FIX: Multi-select for selective application */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Applies To
            </h4>
            <div className="space-y-4">
              {/* Room Type Multi-Select */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Room Types
                </label>
                <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-1.5 max-h-40 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, roomType: 'ALL' }))}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[13px] transition-colors ${
                      formData.roomType === 'ALL' ? 'bg-terra-50 text-terra-700 font-medium' : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                      formData.roomType === 'ALL' ? 'bg-terra-500' : 'border border-neutral-300'
                    }`}>
                      {formData.roomType === 'ALL' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    All Room Types
                  </button>
                  {roomTypes.map(rt => {
                    const selectedTypes = formData.roomType === 'ALL' ? [] : (Array.isArray(formData.roomType) ? formData.roomType : [formData.roomType]);
                    const isSelected = formData.roomType === 'ALL' || selectedTypes.includes(rt.name);
                    return (
                      <button
                        key={rt.name}
                        type="button"
                        onClick={() => {
                          if (formData.roomType === 'ALL') {
                            setFormData(prev => ({ ...prev, roomType: rt.name }));
                          } else {
                            const current = Array.isArray(formData.roomType) ? formData.roomType : [formData.roomType];
                            const updated = current.includes(rt.name)
                              ? current.filter(t => t !== rt.name)
                              : [...current, rt.name];
                            setFormData(prev => ({ ...prev, roomType: updated.length === 0 ? 'ALL' : (updated.length === 1 ? updated[0] : updated) }));
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[13px] transition-colors ${
                          isSelected && formData.roomType !== 'ALL' ? 'bg-terra-50 text-terra-700 font-medium' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          isSelected && formData.roomType !== 'ALL' ? 'bg-terra-500' : 'border border-neutral-300'
                        }`}>
                          {isSelected && formData.roomType !== 'ALL' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        {rt.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Channel Multi-Select */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Channels
                </label>
                <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-1.5 max-h-40 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, otaCode: 'ALL' }))}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[13px] transition-colors ${
                      formData.otaCode === 'ALL' ? 'bg-terra-50 text-terra-700 font-medium' : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                      formData.otaCode === 'ALL' ? 'bg-terra-500' : 'border border-neutral-300'
                    }`}>
                      {formData.otaCode === 'ALL' && <Check className="w-3 h-3 text-white" />}
                    </div>
                    All Channels
                  </button>
                  {connectedOTAs.map(ota => {
                    const selectedCodes = formData.otaCode === 'ALL' ? [] : (Array.isArray(formData.otaCode) ? formData.otaCode : [formData.otaCode]);
                    const isSelected = formData.otaCode === 'ALL' || selectedCodes.includes(ota.code);
                    return (
                      <button
                        key={ota.code}
                        type="button"
                        onClick={() => {
                          if (formData.otaCode === 'ALL') {
                            setFormData(prev => ({ ...prev, otaCode: ota.code }));
                          } else {
                            const current = Array.isArray(formData.otaCode) ? formData.otaCode : [formData.otaCode];
                            const updated = current.includes(ota.code)
                              ? current.filter(c => c !== ota.code)
                              : [...current, ota.code];
                            setFormData(prev => ({ ...prev, otaCode: updated.length === 0 ? 'ALL' : (updated.length === 1 ? updated[0] : updated) }));
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-[13px] transition-colors ${
                          isSelected && formData.otaCode !== 'ALL' ? 'bg-terra-50 text-terra-700 font-medium' : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${
                          isSelected && formData.otaCode !== 'ALL' ? 'bg-terra-500' : 'border border-neutral-300'
                        }`}>
                          {isSelected && formData.otaCode !== 'ALL' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                          style={{ backgroundColor: ota.color || '#A57865' }}
                        >
                          {ota.name?.substring(0, 2).toUpperCase()}
                        </div>
                        {ota.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Restriction Types Section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Restriction Type
            </h4>
            <div className="space-y-2">
              {restrictionTypes.map(type => {
                const isActive = formData.restriction[type.key];
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => toggleRestriction(type.key)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                      isActive
                        ? type.activeColor
                        : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-[13px] font-semibold text-neutral-900">{type.label}</p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{type.description}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all flex-shrink-0 ml-3 ${
                      isActive ? type.activeBadge : 'border border-neutral-300 bg-white'
                    }`}>
                      {isActive && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Length of Stay Section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Length of Stay
            </h4>
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                    Minimum Nights
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.restriction.minStay}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      restriction: { ...prev.restriction, minStay: parseInt(e.target.value) || 1 }
                    }))}
                    className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                    Maximum Nights
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.restriction.maxStay || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      restriction: { ...prev.restriction, maxStay: e.target.value ? parseInt(e.target.value) : null }
                    }))}
                    placeholder="No limit"
                    className="w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Reason
              <span className="text-neutral-400 font-normal ml-1">(Optional)</span>
            </h4>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g., Holiday weekend minimum stay requirement"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div>
              <p className="text-[13px] font-semibold text-neutral-900">Status</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {formData.isActive ? 'Restriction is active' : 'Restriction is inactive'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.isActive ? 'bg-terra-500' : 'bg-neutral-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  formData.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        size="sm"
        showClose={false}
      >
        <div className="p-6">
          {/* Warning Icon */}
          <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Delete Restriction
          </h3>

          {/* Description */}
          <p className="text-[13px] text-neutral-500 leading-relaxed">
            Are you sure you want to delete this restriction? This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(false)}
            className="px-5 py-2 text-[13px] font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            className="px-5 py-2 text-[13px] font-semibold"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
