/**
 * StaffDrawer Component
 * Staff detail drawer - Glimmora Design System v5.0
 * Side drawer pattern matching Channel Manager
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone, Mail, Calendar, TrendingUp, Star, Sparkles, Clock,
  MessageSquare, Edit2, Save, Coffee, Briefcase, CheckCircle,
  User, UserX, ChevronDown
} from 'lucide-react';
import { Drawer } from '../ui2/Drawer';
import { Button } from '../ui2/Button';

// Status options for the custom dropdown
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'off-duty', label: 'Off Duty' },
  { value: 'sick', label: 'Sick' },
  { value: 'leave', label: 'On Leave' },
];

function StatusSelect({ value, onChange, getStatusConfig }: {
  value: string;
  onChange: (val: string) => void;
  getStatusConfig: (status: string) => { dot: string; badge: string; label: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  const selected = STATUS_OPTIONS.find(o => o.value === value);
  const config = getStatusConfig(value);

  return (
    <div className="relative flex-1" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border transition-all duration-150 text-left flex items-center justify-between focus:outline-none ${
          isOpen
            ? 'border-terra-400 ring-2 ring-terra-500/10'
            : 'border-neutral-200 hover:border-neutral-300'
        }`}
      >
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-neutral-900">{selected?.label || 'Select status'}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[90] w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden">
          {STATUS_OPTIONS.map((option) => {
            const optConfig = getStatusConfig(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2.5 text-[13px] text-left hover:bg-neutral-50 transition-colors flex items-center gap-2 ${
                  value === option.value ? 'bg-terra-50 text-terra-700' : 'text-neutral-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${optConfig.dot}`} />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StaffDrawer({
  staff,
  isOpen,
  onClose,
  onAssignShift,
  onMessage,
  onUpdateStatus,
  onMarkLeave,
  onEdit,
  onDisable
}) {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isStatusEditing, setIsStatusEditing] = useState(false);

  useEffect(() => {
    if (staff) {
      setSelectedStatus(staff.status || '');
      setIsStatusEditing(false);
    }
  }, [staff, isOpen]);

  if (!staff) return null;

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        dot: 'bg-sage-500',
        badge: 'bg-sage-50 text-sage-700 border-sage-200',
        label: 'Active'
      },
      'off-duty': {
        dot: 'bg-neutral-400',
        badge: 'bg-neutral-50 text-neutral-600 border-neutral-200',
        label: 'Off Duty'
      },
      sick: {
        dot: 'bg-rose-500',
        badge: 'bg-rose-50 text-rose-600 border-rose-200',
        label: 'Sick'
      },
      leave: {
        dot: 'bg-gold-500',
        badge: 'bg-gold-50 text-gold-700 border-gold-200',
        label: 'On Leave'
      }
    };
    return configs[status] || configs['off-duty'];
  };

  const statusConfig = getStatusConfig(staff.status);

  const handleSaveStatus = () => {
    if (onUpdateStatus && selectedStatus !== staff.status) {
      onUpdateStatus(staff.id, selectedStatus);
    }
    setIsStatusEditing(false);
  };

  // Custom header with avatar and status
  const renderHeader = () => (
    <div className="flex items-start gap-3 sm:gap-4">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-terra-100 flex items-center justify-center text-terra-600 font-bold text-lg sm:text-xl flex-shrink-0">
        {staff.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">
          {staff.name}
        </h2>
        <div className="flex items-center gap-1.5 mt-1">
          <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
          <p className="text-[12px] sm:text-[13px] text-neutral-500">{staff.role}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 mt-2 rounded-md text-[10px] sm:text-[11px] font-semibold border ${statusConfig.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
          {statusConfig.label}
        </span>
      </div>
    </div>
  );

  // Footer with close button
  const renderFooter = () => (
    <div className="flex items-center justify-end">
      <Button
        variant="ghost"
        onClick={onClose}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Close
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      header={renderHeader()}
      footer={renderFooter()}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Attendance Status */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Attendance Status
          </h4>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`relative w-3 h-3 rounded-full ${staff.clockedIn ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
                  {staff.clockedIn && (
                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  )}
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-neutral-900">
                    {staff.clockedIn ? 'Clocked In' : 'Clocked Out'}
                  </p>
                  {staff.clockedIn && staff.lastCheckIn && (
                    <p className="text-[11px] text-neutral-500">
                      since {new Date(staff.lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                  {!staff.clockedIn && staff.lastCheckOut && (
                    <p className="text-[11px] text-neutral-500">
                      last out {new Date(staff.lastCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${staff.clockedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-50 text-neutral-500 border-neutral-200'}`}>
                {staff.shift ? `${staff.shift} shift` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Contact Information
          </h4>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-terra-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-neutral-500">Phone</p>
                <p className="text-[13px] font-semibold text-neutral-900">{staff.phone}</p>
              </div>
            </div>
            <div className="h-px bg-neutral-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-terra-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-neutral-500">Email</p>
                <p className="text-[13px] font-semibold text-neutral-900 truncate">{staff.email}</p>
              </div>
            </div>
            <div className="h-px bg-neutral-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-terra-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-neutral-500">Join Date</p>
                <p className="text-[13px] font-semibold text-neutral-900">{staff.joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Performance
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-terra-500" />
                </div>
              </div>
              <p className="text-[10px] font-medium text-neutral-500 mb-0.5">Tasks Completed</p>
              <p className="text-[17px] font-bold text-neutral-900">{staff.performance?.tasksCompleted || 0}</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-sage-600" />
                </div>
              </div>
              <p className="text-[10px] font-medium text-neutral-500 mb-0.5">Avg Response</p>
              <p className="text-[17px] font-bold text-neutral-900">{staff.performance?.avgResponseTime || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-gold-50 border border-gold-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gold-100 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 fill-gold-500 stroke-none" />
                </div>
              </div>
              <p className="text-[10px] font-medium text-gold-600 mb-0.5">Rating</p>
              <p className="text-[17px] font-bold text-gold-700">{staff.performance?.customerRating || staff.rating?.toFixed(1) || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-sage-600" />
                </div>
              </div>
              <p className="text-[10px] font-medium text-neutral-500 mb-0.5">Punctuality</p>
              <p className="text-[17px] font-bold text-neutral-900">{staff.performance?.punctuality || staff.efficiency || 0}%</p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        {staff.schedule && staff.schedule.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Schedule
            </h4>
            <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100 space-y-2">
              {staff.schedule.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-3.5 h-3.5 text-terra-500" />
                    </div>
                    <span className="text-[13px] font-semibold text-neutral-900">{item.day}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-neutral-700 capitalize">{item.shift}</p>
                    <p className="text-[11px] text-neutral-500">{item.hours}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {staff.aiInsights && staff.aiInsights.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-terra-500" />
              AI Insights
            </h4>
            <div className="space-y-2">
              {staff.aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-terra-50 rounded-lg border border-terra-100">
                  <div className="w-6 h-6 rounded-lg bg-white border border-terra-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-terra-500" />
                  </div>
                  <p className="text-[13px] text-neutral-900 font-medium">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floor Assignment */}
        {staff.floorAssignment && staff.floorAssignment.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
              Floor Assignment
            </h4>
            <div className="flex flex-wrap gap-2">
              {staff.floorAssignment.map((floor) => (
                <span
                  key={floor}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-[13px] font-semibold text-neutral-900"
                >
                  Floor {floor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Update Status */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Update Status
          </h4>
          <div className="p-3 sm:p-4 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-2">
              <StatusSelect
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val);
                  setIsStatusEditing(true);
                }}
                getStatusConfig={getStatusConfig}
              />
              <Button
                variant={isStatusEditing && selectedStatus !== staff.status ? 'primary' : 'outline'}
                size="sm"
                onClick={handleSaveStatus}
                disabled={!isStatusEditing || selectedStatus === staff.status}
                icon={Save}
              >
                Save
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            <Button
              variant="primary"
              icon={Calendar}
              onClick={() => onAssignShift(staff)}
              className="w-full justify-center"
            >
              Assign Shift
            </Button>

            <Button
              variant="outline"
              icon={Coffee}
              onClick={() => onMarkLeave && onMarkLeave(staff)}
              className="w-full justify-center"
            >
              Mark Leave
            </Button>

            <Button
              variant="outline"
              icon={MessageSquare}
              onClick={() => onMessage(staff)}
              className="w-full justify-center"
            >
              Send Message
            </Button>

            <Button
              variant="outline"
              icon={Edit2}
              onClick={() => onEdit && onEdit(staff)}
              className="w-full justify-center"
            >
              Edit Details
            </Button>

            <Button
              variant="outline"
              icon={User}
              onClick={() => {
                onClose();
                navigate(`/admin/staff/${staff.id}`);
              }}
              className="w-full justify-center"
            >
              View Full Profile
            </Button>

            {staff.status !== 'disabled' && (
              <Button
                variant="outline"
                icon={UserX}
                onClick={() => onDisable && onDisable(staff)}
                className="w-full justify-center text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              >
                Disable Staff
              </Button>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
