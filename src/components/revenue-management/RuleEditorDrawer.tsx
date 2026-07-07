/**
 * RuleEditorDrawer Component
 * Drawer for creating/editing pricing rules - Glimmora Design System v5.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, AlertCircle, Zap, ChevronDown, Check, Loader2 } from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';
import { useToast } from '../../contexts/ToastContext';
import { useRMS } from '../../context/RMSContext';
import revenueIntelligenceService, {
  PricingRule,
  CreatePricingRuleRequest,
  UpdatePricingRuleRequest,
} from '../../api/services/revenue-intelligence.service';

interface RuleEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rule?: PricingRule | null;
  onSave?: () => void;
}

// Custom Select Dropdown Component
function SelectDropdown({ value, onChange, options, placeholder = 'Select...', variant = 'default' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const variantStyles = {
    default: 'border-neutral-200 hover:border-neutral-300',
    ocean: 'border-ocean-200 hover:border-ocean-300',
    sage: 'border-sage-200 hover:border-sage-300',
  };

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
        className={`h-11 px-3 rounded-lg text-[13px] bg-white border text-left flex items-center justify-between gap-2 transition-all min-w-[160px] ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : variantStyles[variant]
        }`}
      >
        <span className={selectedOption ? 'text-neutral-900 truncate' : 'text-neutral-400'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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

const conditionTypes = [
  { id: 'occupancy_above', label: 'Occupancy Above', unit: '%', type: 'number' },
  { id: 'occupancy_below', label: 'Occupancy Below', unit: '%', type: 'number' },
  { id: 'pickup_above', label: 'Pickup Pace Above', unit: '%', type: 'number' },
  { id: 'pickup_below', label: 'Pickup Pace Below', unit: '%', type: 'number' },
  { id: 'competitor_higher', label: 'Competitor Higher By', unit: '%', type: 'number' },
  { id: 'competitor_lower', label: 'Competitor Lower By', unit: '%', type: 'number' },
  { id: 'days_to_arrival', label: 'Days to Arrival', unit: 'days', type: 'range' },
  { id: 'day_of_week', label: 'Day of Week', type: 'multiselect', options: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },
  { id: 'demand_level', label: 'Demand Level', type: 'select', options: ['compression', 'high', 'normal', 'low', 'very_low'] },
  { id: 'event_active', label: 'Event Active', type: 'boolean' },
];

const actionTypes = [
  { id: 'increase_percent', label: 'Increase Rate By', unit: '%', type: 'number' },
  { id: 'decrease_percent', label: 'Decrease Rate By', unit: '%', type: 'number' },
  { id: 'set_rate', label: 'Set Rate To', unit: '$', type: 'number' },
  { id: 'set_min_rate', label: 'Set Minimum Rate', unit: '$', type: 'number' },
  { id: 'set_max_rate', label: 'Set Maximum Rate', unit: '$', type: 'number' },
  { id: 'apply_min_stay', label: 'Apply Min Stay', unit: 'nights', type: 'number' },
  { id: 'apply_cta', label: 'Close to Arrival', type: 'boolean' },
  { id: 'apply_ctd', label: 'Close to Departure', type: 'boolean' },
  { id: 'apply_stop_sell', label: 'Stop Sell', type: 'boolean' },
];

const priorityOptions = [
  { value: 1, label: 'P1', color: 'bg-rose-500' },
  { value: 2, label: 'P2', color: 'bg-gold-500' },
  { value: 3, label: 'P3', color: 'bg-ocean-500' },
  { value: 4, label: 'P4', color: 'bg-sage-500' },
  { value: 5, label: 'P5', color: 'bg-neutral-400' },
];

// Convert arrays to select options format
const conditionSelectOptions = conditionTypes.map(ct => ({ value: ct.id, label: ct.label }));
const actionSelectOptions = actionTypes.map(at => ({ value: at.id, label: at.label }));

/** Map API rule room types (may be dbIds or 'ALL') to form room type ids (RMS ids for selector) */
function ruleRoomTypesToFormIds(rule: PricingRule | null, rmsRoomTypes: { id: string; name: string; dbId?: number }[]): string[] {
  if (!rule) return ['ALL'];
  const raw = rule.roomTypes && rule.roomTypes.length ? rule.roomTypes : (rule.room_type_id != null ? [String(rule.room_type_id)] : []);
  if (!raw.length || (raw.length === 1 && raw[0] === 'ALL')) return ['ALL'];
  const mapped = raw.map((rt) => {
    const n = typeof rt === 'number' ? rt : parseInt(String(rt), 10);
    if (!Number.isNaN(n)) {
      const r = rmsRoomTypes.find((x) => x.dbId === n);
      return r ? String(r.id) : String(rt);
    }
    return rt === 'ALL' ? 'ALL' : String(rt);
  });
  return mapped.filter(Boolean).length ? mapped : ['ALL'];
}

const RuleEditorDrawer = ({ isOpen, onClose, rule, onSave }: RuleEditorDrawerProps) => {
  const { success, error: showError } = useToast();
  const { roomTypes: rmsRoomTypes } = useRMS();
  const isEditing = !!rule;

  const roomTypeOptions = useMemo(() => {
    const list =
      Array.isArray(rmsRoomTypes) && rmsRoomTypes.length > 0
        ? rmsRoomTypes.map((r) => ({ id: String(r.id), label: r.name }))
        : [
            { id: 'minimalist-studio', label: 'Minimalist Studio' },
            { id: 'coastal-retreat', label: 'Coastal Retreat' },
            { id: 'urban-oasis', label: 'Urban Oasis' },
            { id: 'sunset-vista', label: 'Sunset Vista' },
            { id: 'pacific-suite', label: 'Pacific Suite' },
            { id: 'wellness-suite', label: 'Wellness Suite' },
            { id: 'family-sanctuary', label: 'Family Sanctuary' },
            { id: 'oceanfront-penthouse', label: 'Oceanfront Penthouse' },
          ];
    return [{ id: 'ALL', label: 'All Room Types' }, ...list.filter((r) => r.id !== 'ALL')];
  }, [rmsRoomTypes]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 3,
    isActive: true,
    roomTypes: ['ALL'],
    conditions: [{ type: 'occupancy_above', value: 80 }],
    actions: [{ type: 'increase_percent', value: 10 }],
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (rule) {
      const formRoomTypes = ruleRoomTypesToFormIds(rule, rmsRoomTypes ?? []);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        priority: rule.priority,
        isActive: rule.isActive,
        roomTypes: formRoomTypes,
        conditions: (rule.conditions || []).map(c => ({ type: c.type, value: c.value })),
        actions: (rule.actions || []).map(a => ({ type: a.type, value: a.value })),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        priority: 3,
        isActive: true,
        roomTypes: ['ALL'],
        conditions: [{ type: 'occupancy_above', value: 80 }],
        actions: [{ type: 'increase_percent', value: 10 }],
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [rule, isOpen, rmsRoomTypes]);

  const handleAddCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { type: 'occupancy_above', value: 80 }],
    }));
  };

  const handleRemoveCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const handleConditionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) =>
        i === index ? { ...cond, [field]: value } : cond
      ),
    }));
  };

  const handleAddAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'increase_percent', value: 10 }],
    }));
  };

  const handleRemoveAction = (index) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index),
    }));
  };

  const handleActionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      ),
    }));
  };

  const handleRoomTypeToggle = (roomTypeId) => {
    setFormData(prev => {
      if (roomTypeId === 'ALL') {
        return { ...prev, roomTypes: ['ALL'] };
      }

      const current = prev.roomTypes ?? [];
      let newRoomTypes = current.filter(rt => rt !== 'ALL');

      if (newRoomTypes.includes(roomTypeId)) {
        newRoomTypes = newRoomTypes.filter(rt => rt !== roomTypeId);
      } else {
        newRoomTypes = [...newRoomTypes, roomTypeId];
      }

      if (newRoomTypes.length === 0) {
        newRoomTypes = ['ALL'];
      }

      return { ...prev, roomTypes: newRoomTypes };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Rule name is required';
    if (formData.conditions.length === 0) newErrors.conditions = 'At least one condition is required';
    if (formData.actions.length === 0) newErrors.actions = 'At least one action is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    try {
      const roomTypesForm = formData.roomTypes ?? ['ALL'];
      const isAllRoomTypes = !roomTypesForm.length || roomTypesForm.includes('ALL');
      const roomTypeDbIds = isAllRoomTypes
        ? undefined
        : roomTypesForm
            .filter((id) => id !== 'ALL')
            .map((id) => rmsRoomTypes?.find((r) => String(r.id) === String(id))?.dbId)
            .filter((id): id is number => id != null);

      if (isEditing && rule) {
        const updatePayload: UpdatePricingRuleRequest = {
          name: formData.name,
          description: formData.description,
          priority: formData.priority,
          isActive: formData.isActive,
          roomTypes: roomTypesForm,
          roomTypeDbIds,
          conditions: formData.conditions,
          actions: formData.actions,
        };
        await revenueIntelligenceService.updatePricingRule(rule.id, updatePayload);
        success('Pricing rule updated successfully');
      } else {
        const createPayload: CreatePricingRuleRequest = {
          name: formData.name,
          description: formData.description,
          priority: formData.priority,
          isActive: formData.isActive,
          roomTypes: roomTypesForm,
          roomTypeDbIds,
          conditions: formData.conditions,
          actions: formData.actions,
        };
        await revenueIntelligenceService.createPricingRule(createPayload);
        success('Pricing rule created successfully');
      }

      onSave?.();
      onClose();
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;
      if (status === 422 && data) {
        console.error('Pricing rule 422 response:', JSON.stringify(data, null, 2));
      } else {
        console.error('Error saving rule:', err);
      }
      let message: string | undefined;
      if (data?.message) message = data.message;
      else if (data?.error) message = data.error;
      else if (Array.isArray(data?.errors)) {
        const first = data.errors[0];
        message = typeof first === 'string' ? first : first?.message ?? first?.msg;
      } else if (data?.errors && typeof data.errors === 'object') {
        const firstKey = Object.keys(data.errors)[0];
        const firstVal = firstKey ? (data.errors as Record<string, unknown>)[firstKey] : undefined;
        const arr = Array.isArray(firstVal) ? firstVal : [firstVal];
        message = arr.length ? String(arr[0]) : undefined;
      }
      showError(
        message && typeof message === 'string'
          ? message
          : isEditing ? 'Failed to update pricing rule' : 'Failed to create pricing rule'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!rule) return;

    setIsDeleting(true);

    try {
      await revenueIntelligenceService.deletePricingRule(rule.id);
      success('Pricing rule deleted successfully');
      onSave?.();
      onClose();
    } catch (err) {
      showError('Failed to delete pricing rule');
      console.error('Error deleting rule:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderConditionInput = (condition, index) => {
    const condType = conditionTypes.find(ct => ct.id === condition.type);
    if (!condType) return null;

    switch (condType.type) {
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={condition.value}
              onChange={(e) => handleConditionChange(index, 'value', parseInt(e.target.value) || 0)}
              className="w-20 h-11 px-3 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
            />
            <span className="text-[12px] text-neutral-500">{condType.unit}</span>
          </div>
        );

      case 'range':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={condition.value?.min || 0}
              onChange={(e) => handleConditionChange(index, 'value', { ...condition.value, min: parseInt(e.target.value) || 0 })}
              className="w-16 h-11 px-2 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
              placeholder="Min"
            />
            <span className="text-[12px] text-neutral-500">to</span>
            <input
              type="number"
              value={condition.value?.max || 0}
              onChange={(e) => handleConditionChange(index, 'value', { ...condition.value, max: parseInt(e.target.value) || 0 })}
              className="w-16 h-11 px-2 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
              placeholder="Max"
            />
            <span className="text-[12px] text-neutral-500">{condType.unit}</span>
          </div>
        );

      case 'select':
        return (
          <SelectDropdown
            value={condition.value}
            onChange={(val) => handleConditionChange(index, 'value', val)}
            options={condType.options.map(opt => ({ value: opt, label: opt }))}
            placeholder="Select..."
          />
        );

      case 'multiselect':
        return (
          <div className="flex flex-wrap gap-1.5">
            {condType.options.map(opt => {
              const isSelected = Array.isArray(condition.value) && condition.value.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    const current = Array.isArray(condition.value) ? condition.value : [];
                    const newValue = isSelected
                      ? current.filter(v => v !== opt)
                      : [...current, opt];
                    handleConditionChange(index, 'value', newValue);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-all ${
                    isSelected
                      ? 'bg-terra-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        );

      case 'boolean':
        return (
          <button
            type="button"
            onClick={() => handleConditionChange(index, 'value', !condition.value)}
            className={`px-4 py-2 text-[12px] font-medium rounded-lg transition-all ${
              condition.value
                ? 'bg-terra-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {condition.value ? 'Yes' : 'No'}
          </button>
        );

      default:
        return null;
    }
  };

  const renderActionInput = (action, index) => {
    const actionType = actionTypes.find(at => at.id === action.type);
    if (!actionType) return null;

    if (actionType.type === 'boolean') {
      return (
        <button
          type="button"
          onClick={() => handleActionChange(index, 'value', !action.value)}
          className={`px-4 py-2 text-[12px] font-medium rounded-lg transition-all ${
            action.value
              ? 'bg-terra-500 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          {action.value ? 'Enabled' : 'Disabled'}
        </button>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={action.value}
          onChange={(e) => handleActionChange(index, 'value', parseInt(e.target.value) || 0)}
          className="w-20 h-11 px-3 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
        />
        <span className="text-[12px] text-neutral-500">{actionType.unit}</span>
      </div>
    );
  };

  const renderFooter = () => (
    <div className="flex items-center justify-between w-full">
      <div>
        {isEditing && !showDeleteConfirm && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            Delete Rule
          </Button>
        )}
        {showDeleteConfirm && (
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-neutral-600">Delete this rule?</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-500 hover:bg-rose-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Confirm Delete'
              )}
            </Button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving || isDeleting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" form="rule-form" disabled={isSaving || isDeleting}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              {isEditing ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Save Changes' : 'Create Rule'
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
      subtitle="Define conditions and actions for dynamic pricing"
      maxWidth="max-w-lg"
      footer={renderFooter()}
    >
      <form id="rule-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Basic Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Rule Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., High Occupancy Premium"
                className={`w-full h-11 px-3 rounded-lg text-[13px] bg-white border text-neutral-900 placeholder-neutral-400 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all ${
                  errors.name ? 'border-rose-400' : 'border-neutral-200'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this rule do?"
                className="w-full h-11 px-3 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Priority & Status Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Priority & Status
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Priority Level
              </label>
              <div className="flex gap-1.5">
                {priorityOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: opt.value }))}
                    className={`flex-1 h-11 rounded-lg text-[12px] font-bold transition-all ${
                      formData.priority === opt.value
                        ? `${opt.color} text-white`
                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Status
              </label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`w-full h-11 rounded-lg text-[13px] font-semibold transition-all ${
                  formData.isActive
                    ? 'bg-sage-100 text-sage-700 border border-sage-200'
                    : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                }`}
              >
                {formData.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>
          </div>
        </div>

        {/* Room Types Section */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Apply to Room Types
          </h4>
          <div className="flex flex-wrap gap-2">
            {roomTypeOptions.map(rt => (
              <button
                key={rt.id}
                type="button"
                onClick={() => handleRoomTypeToggle(rt.id)}
                className={`px-3 py-2 text-[12px] font-medium rounded-lg transition-all ${
                  (formData.roomTypes ?? []).includes(rt.id)
                    ? 'bg-terra-500 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-ocean-100">
                <AlertCircle className="w-3.5 h-3.5 text-ocean-600" />
              </div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
                IF Conditions
              </h4>
            </div>
            <button
              type="button"
              onClick={handleAddCondition}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-terra-600 hover:bg-terra-50 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          {errors.conditions && (
            <p className="text-[11px] text-rose-500 mb-2">{errors.conditions}</p>
          )}
          <div className="space-y-2">
            {formData.conditions.map((condition, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-ocean-50 border border-ocean-100"
              >
                <SelectDropdown
                  value={condition.type}
                  onChange={(val) => handleConditionChange(index, 'type', val)}
                  options={conditionSelectOptions}
                  variant="ocean"
                />
                <div className="flex-1">
                  {renderConditionInput(condition, index)}
                </div>
                {formData.conditions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(index)}
                    className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center bg-sage-100">
                <Zap className="w-3.5 h-3.5 text-sage-600" />
              </div>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
                THEN Actions
              </h4>
            </div>
            <button
              type="button"
              onClick={handleAddAction}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-terra-600 hover:bg-terra-50 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
          {errors.actions && (
            <p className="text-[11px] text-rose-500 mb-2">{errors.actions}</p>
          )}
          <div className="space-y-2">
            {formData.actions.map((action, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-sage-50 border border-sage-100"
              >
                <SelectDropdown
                  value={action.type}
                  onChange={(val) => handleActionChange(index, 'type', val)}
                  options={actionSelectOptions}
                  variant="sage"
                />
                <div className="flex-1">
                  {renderActionInput(action, index)}
                </div>
                {formData.actions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAction(index)}
                    className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </Drawer>
  );
};

export default RuleEditorDrawer;
