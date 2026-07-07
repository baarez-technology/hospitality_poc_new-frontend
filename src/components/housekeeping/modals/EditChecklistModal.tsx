/**
 * EditChecklistDrawer Component
 * Side drawer for editing room cleaning checklist - Glimmora Design System v5.0
 * Pattern matching Staff/Channel Manager drawers
 */

import { useState, useEffect } from 'react';
import { Save, Check, MapPin, Plus, Trash2, ClipboardList, Bed } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';

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
      setChecklist(room.checklist || []);
      setNewTaskText('');
    }
  }, [isOpen, room]);

  if (!room) return null;

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
    }
  };

  // Calculate progress
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter(item => item.completed).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Custom header
  const renderHeader = () => (
    <div className="flex-1 min-w-0">
      <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">Edit Checklist</h2>
      <p className="text-[13px] text-neutral-500 mt-1">Room {room.roomNumber}</p>
    </div>
  );

  // Footer
  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2.5 border border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 rounded-lg text-[13px] font-medium transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="px-4 py-2.5 bg-terra-500 hover:bg-terra-600 text-white rounded-lg text-[13px] font-semibold transition-colors"
      >
        Save Changes
      </button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-2xl"
      hideBackdrop={true}
    >
      <div className="space-y-6">
        {/* Room Info */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Room Details
          </h4>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-base sm:text-lg">
                {room.roomNumber}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-neutral-900">Room {room.roomNumber}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-600 rounded text-[10px] sm:text-[11px] font-medium">
                    {room.type}
                  </span>
                  <span className="px-2 py-0.5 bg-white border border-neutral-200 text-neutral-600 rounded text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Floor {room.floor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
              Completion Progress
            </h4>
            <span className="text-[12px] font-bold text-neutral-900">
              {completedTasks}/{totalTasks} ({progress}%)
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-2">
            <div
              className="bg-sage-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checklist Items */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Checklist Items ({checklist.length})
          </h4>

          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100 space-y-2">
            {checklist.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-white rounded-lg border border-neutral-200 group hover:border-neutral-300 transition-all"
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(index)}
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all ${
                    item.completed
                      ? 'bg-primary-500'
                      : 'bg-white border border-neutral-300 hover:border-primary-400'
                  }`}
                >
                  {item.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                </button>

                {/* Task Text */}
                <span
                  className={`flex-1 text-[13px] font-medium transition-all ${
                    item.completed
                      ? 'text-neutral-400 line-through'
                      : 'text-neutral-900'
                  }`}
                >
                  {item.task}
                </span>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveTask(index)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Remove task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Empty State */}
            {checklist.length === 0 && (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border border-neutral-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-400" />
                </div>
                <p className="text-[12px] sm:text-[13px] font-semibold text-neutral-900">No tasks in checklist</p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 mt-1">Add your first task below</p>
              </div>
            )}
          </div>
        </div>

        {/* Add New Task */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Add New Task
          </h4>
          <div className="flex flex-col sm:flex-row gap-2">
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
              className="flex-1 h-10 px-4 bg-white border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-terra-500/10 focus:border-terra-400 transition-all hover:border-neutral-300"
            />
            <Button
              variant={newTaskText.trim() ? 'primary' : 'outline'}
              onClick={handleAddTask}
              disabled={!newTaskText.trim()}
              className="px-5 py-2 text-[13px] font-semibold w-full sm:w-auto"
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
