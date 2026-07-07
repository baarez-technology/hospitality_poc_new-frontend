/**
 * Room Block Modal Component
 * Create and edit room blocks for maintenance, events, etc.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '../ui2/Button';
import { X, Plus, Calendar, AlertTriangle, Wrench, Building2, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { RoomBlock, RoomBlockCreate, RoomBlockUpdate } from '../../api/services/availability.service';

interface RoomBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoomBlockCreate | RoomBlockUpdate) => Promise<void>;
  existingBlock?: RoomBlock;
  roomTypes?: Array<{ id: number; name: string }>;
  mode?: 'create' | 'edit';
}

const BLOCK_TYPES = [
  { value: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'orange' },
  { value: 'renovation', label: 'Renovation', icon: Building2, color: 'blue' },
  { value: 'event', label: 'Private Event', icon: Users, color: 'purple' },
  { value: 'overbooking_buffer', label: 'Overbooking Buffer', icon: AlertTriangle, color: 'yellow' },
  { value: 'manual', label: 'Manual Block', icon: Calendar, color: 'gray' }
];

export function RoomBlockModal({
  isOpen,
  onClose,
  onSubmit,
  existingBlock,
  roomTypes = [],
  mode = 'create'
}: RoomBlockModalProps) {
  const [formData, setFormData] = useState<Partial<RoomBlockCreate>>({
    block_type: 'maintenance',
    quantity: 1,
    start_date: '',
    end_date: '',
    reason: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with existing data if editing
  useEffect(() => {
    if (mode === 'edit' && existingBlock) {
      setFormData({
        room_type_id: existingBlock.room_type_id,
        room_id: existingBlock.room_id,
        start_date: existingBlock.start_date,
        end_date: existingBlock.end_date,
        block_type: existingBlock.block_type,
        reason: existingBlock.reason,
        notes: existingBlock.notes || '',
        quantity: existingBlock.quantity
      });
    }
  }, [mode, existingBlock]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }
    if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (!formData.reason || formData.reason.trim() === '') {
      newErrors.reason = 'Reason is required';
    }
    if (!formData.room_type_id && mode === 'create') {
      newErrors.room_type_id = 'Room type is required';
    }
    if (formData.quantity && formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData as RoomBlockCreate);
      onClose();
      // Reset form
      setFormData({
        block_type: 'maintenance',
        quantity: 1,
        start_date: '',
        end_date: '',
        reason: '',
        notes: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting room block:', error);
      setErrors({ submit: 'Failed to save room block. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[10px] max-w-2xl w-full max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-br from-gray-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-terra-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-terra-600" />
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900">
                {mode === 'edit' ? 'Edit Room Block' : 'Create Room Block'}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {mode === 'edit' ? 'Modify existing block details' : 'Block rooms from availability'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Block Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Block Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {BLOCK_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.block_type === type.value;

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, block_type: type.value })}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all',
                      isSelected
                        ? 'border-terra-500 bg-terra-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    )}
                  >
                    <Icon className={cn(
                      'w-4 h-4',
                      isSelected ? 'text-terra-600' : 'text-gray-400'
                    )} />
                    <span className={cn(
                      'text-sm font-medium',
                      isSelected ? 'text-terra-900' : 'text-gray-700'
                    )}>
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Type Selection */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Type *
              </label>
              <select
                value={formData.room_type_id || ''}
                onChange={(e) => setFormData({ ...formData, room_type_id: parseInt(e.target.value) })}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-terra-500',
                  errors.room_type_id ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Select room type</option>
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
              {errors.room_type_id && (
                <p className="text-sm text-red-600 mt-1">{errors.room_type_id}</p>
              )}
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-terra-500',
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                )}
              />
              {errors.start_date && (
                <p className="text-sm text-red-600 mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-terra-500',
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                )}
              />
              {errors.end_date && (
                <p className="text-sm text-red-600 mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Rooms to Block
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity || 1}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-terra-500',
                errors.quantity ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.quantity && (
              <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <input
              type="text"
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Bathroom renovation, HVAC repair"
              className={cn(
                'w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-terra-500',
                errors.reason ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.reason && (
              <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-terra-500"
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Block' : 'Create Block'}
          </Button>
        </div>
      </div>
    </div>
  );
}
