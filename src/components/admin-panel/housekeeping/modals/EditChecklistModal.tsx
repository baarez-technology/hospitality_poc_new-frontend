import { useState, useEffect } from 'react';
import { X, Save, Check, MapPin, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../ui2/Button';

export default function EditChecklistModal({
  room,
  isOpen,
  onClose,
  onSave
}) {
  const [checklist, setChecklist] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    if (isOpen && room) {
      document.body.style.overflow = 'hidden';
      // Initialize checklist from room data
      setChecklist(room.checklist || []);
      setNewTaskText('');
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, room]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  const handleToggleTask = (index) => {
    setChecklist(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      setChecklist(prev => [
        ...prev,
        { task: newTaskText.trim(), completed: false }
      ]);
      setNewTaskText('');
    }
  };

  const handleRemoveTask = (index) => {
    setChecklist(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(room.id, checklist);
      onClose();
    }
  };

  // Calculate progress
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter(item => item.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">
              Edit Cleaning Checklist
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Update checklist for Room {room.roomNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Room Info */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
              {room.roomNumber}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900">
                Room {room.roomNumber}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded text-xs font-medium">
                  {room.type}
                </span>
                <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded text-xs font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Floor {room.floor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-neutral-700">
              Completion Progress
            </span>
            <span className="text-sm font-bold text-[#A57865]">
              {completedTasks}/{totalTasks} ({progress}%)
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-450px)]">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Checklist Items
          </h3>

          {/* Checklist Items */}
          <div className="space-y-2 mb-4">
            {checklist.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-[#FAF8F6] rounded-xl border border-neutral-200 group hover:border-neutral-300 transition-all duration-200"
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(index)}
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    item.completed
                      ? 'bg-primary-500'
                      : 'bg-white border border-neutral-300 hover:border-primary-400'
                  }`}
                >
                  {item.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                </button>

                {/* Task Text */}
                <span
                  className={`flex-1 text-sm transition-all duration-200 ${
                    item.completed
                      ? 'text-neutral-500 line-through'
                      : 'text-neutral-900'
                  }`}
                >
                  {item.task}
                </span>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveTask(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Remove task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Empty State */}
            {checklist.length === 0 && (
              <div className="text-center py-8 bg-[#FAF8F6] rounded-xl border border-neutral-200">
                <Check className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-600">No tasks in checklist</p>
                <p className="text-xs text-neutral-500 mt-1">Add your first task below</p>
              </div>
            )}
          </div>

          {/* Add New Task */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Add New Task
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTask();
                  }
                }}
                placeholder="e.g., Vacuum carpets, Clean bathroom..."
                className="flex-1 px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
              />
              <button
                onClick={handleAddTask}
                disabled={!newTaskText.trim()}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  newTaskText.trim()
                    ? 'bg-[#8E6554] text-white hover:bg-[#A57865]'
                    : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} icon={Save}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
