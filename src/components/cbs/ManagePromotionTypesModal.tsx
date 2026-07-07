/**
 * ManagePromotionTypesModal Component
 * Manage promotion types (add/edit/delete) - Glimmora Design System v5.0
 */

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Drawer } from '../ui2/Drawer';
import { Input, FormField } from '../ui2/Input';
import { Button } from '../ui2/Button';

interface PromotionType {
  value: string;
  label: string;
}

interface ManagePromotionTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionTypes: PromotionType[];
  onAdd: (type: PromotionType) => { success: boolean; error?: string };
  onUpdate: (oldValue: string, newType: PromotionType) => { success: boolean; error?: string };
  onDelete: (value: string) => { success: boolean; error?: string };
  onReset: () => void;
}

export default function ManagePromotionTypesModal({
  isOpen,
  onClose,
  promotionTypes,
  onAdd,
  onUpdate,
  onDelete,
  onReset
}: ManagePromotionTypesModalProps) {
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (!newTypeName.trim()) {
      setError('Type name is required');
      return;
    }

    const result = onAdd({
      value: newTypeName.trim(),
      label: newTypeName.trim()
    });

    if (result.success) {
      setNewTypeName('');
      setError('');
    } else {
      setError(result.error || 'Failed to add type');
    }
  };

  const handleStartEdit = (type: PromotionType) => {
    setEditingType(type.value);
    setEditValue(type.label);
    setError('');
  };

  const handleSaveEdit = (oldValue: string) => {
    if (!editValue.trim()) {
      setError('Type name is required');
      return;
    }

    const result = onUpdate(oldValue, {
      value: editValue.trim(),
      label: editValue.trim()
    });

    if (result.success) {
      setEditingType(null);
      setEditValue('');
      setError('');
    } else {
      setError(result.error || 'Failed to update type');
    }
  };

  const handleCancelEdit = () => {
    setEditingType(null);
    setEditValue('');
    setError('');
  };

  const handleDelete = (value: string) => {
    const result = onDelete(value);
    if (!result.success) {
      setError(result.error || 'Failed to delete type');
    } else {
      setError('');
    }
  };

  const handleReset = () => {
    onReset();
    setError('');
  };

  const handleClose = () => {
    setNewTypeName('');
    setEditingType(null);
    setEditValue('');
    setError('');
    onClose();
  };

  const drawerFooter = (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        onClick={handleReset}
        icon={RotateCcw}
        className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-700"
      >
        Reset to Defaults
      </Button>
      <Button
        variant="primary"
        onClick={handleClose}
        className="text-xs sm:text-sm h-9 sm:h-10 px-4"
      >
        Done
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title="Manage Promotion Types"
      subtitle="Add, edit, or remove promotion categories"
      maxWidth="max-w-md"
      footer={drawerFooter}
    >
      <div className="space-y-6">
        {/* Add New Type */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            Add New Type
          </h4>
          <div className="flex gap-2">
            <Input
              value={newTypeName}
              onChange={(e) => {
                setNewTypeName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Member Exclusive"
              className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
            />
            <Button
              variant="primary"
              onClick={handleAdd}
              icon={Plus}
              className="h-9 sm:h-10 px-3"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Existing Types */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
            Current Types ({promotionTypes.length})
          </h4>
          <div className="space-y-2">
            {promotionTypes.map((type) => (
              <div
                key={type.value}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-all",
                  editingType === type.value
                    ? "border-terra-400 bg-terra-50/30 ring-2 ring-terra-500/10"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                )}
              >
                {editingType === type.value ? (
                  // Edit Mode
                  <>
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 h-8 text-xs sm:text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveEdit(type.value);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(type.value)}
                      className="p-1.5 rounded-lg bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors"
                      title="Save"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1.5 rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  // View Mode
                  <>
                    <span className="flex-1 text-sm font-medium text-neutral-800">
                      {type.label}
                    </span>
                    <button
                      onClick={() => handleStartEdit(type)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(type.value)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
          <p className="text-[11px] text-neutral-500 leading-relaxed">
            Promotion types help categorize your promotions. Changes are saved automatically and will appear in the promotion creation form.
          </p>
        </div>
      </div>
    </Drawer>
  );
}
