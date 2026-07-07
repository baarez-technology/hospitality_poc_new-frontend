import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Phone, Mail, Calendar, TrendingUp, Star, Sparkles, Clock, MessageSquare, Edit2, Save, Coffee, Briefcase, CheckCircle, User, UserX } from 'lucide-react';
import { Button } from '../../ui2/Button';

export default function StaffDrawer({ staff, isOpen, onClose, onAssignShift, onMessage, onUpdateStatus, onMarkLeave, onEdit, onDisable, onViewProfile }) {
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isStatusEditing, setIsStatusEditing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Store current scroll positions
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const mainContent = document.querySelector('main');

    // Prevent body scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    // Prevent scrolling on main content
    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }

    // Set initial status
    setSelectedStatus(staff?.status || '');
    setIsStatusEditing(false);

    document.addEventListener('keydown', handleEsc);

    return () => {
      // Restore body scrolling
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      // Restore main content scrolling
      if (mainContent) {
        mainContent.style.overflow = '';
      }

      // Restore scroll position
      window.scrollTo(scrollX, scrollY);

      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, staff]);

  if (!isOpen || !staff) return null;

  const getStatusStyle = (status) => {
    const styles = {
      active: 'bg-[#4E5840]/10 text-[#4E5840] border-[#4E5840]/30',
      'off-duty': 'bg-neutral-50 text-neutral-700 border-neutral-200',
      sick: 'bg-red-50 text-red-700 border-red-200',
      leave: 'bg-amber-50 text-amber-700 border-amber-200'
    };

    const labels = {
      active: 'Active',
      'off-duty': 'Off Duty',
      sick: 'Sick',
      leave: 'On Leave'
    };

    return { style: styles[status], label: labels[status] };
  };

  const statusInfo = getStatusStyle(staff.status);

  const handleSaveStatus = () => {
    if (onUpdateStatus && selectedStatus !== staff.status) {
      onUpdateStatus(staff.id, selectedStatus);
    }
    setIsStatusEditing(false);
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-neutral-200 flex-shrink-0">
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {staff.avatar}
                  </div>
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-neutral-900">
                      {staff.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                      <p className="text-sm text-neutral-600">{staff.role}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-150 active:scale-95"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <span className={`inline-flex px-3 py-1.5 rounded-md text-xs font-semibold border ${statusInfo.style}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 custom-scrollbar p-4 sm:p-6 space-y-6">
          {/* Clock Status */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#5C9BA4] rounded-full"></div>
              <h3 className="text-sm font-semibold text-neutral-700">Attendance Status</h3>
            </div>
            <div className="bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`relative w-3 h-3 rounded-full ${staff.clockedIn ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
                    {staff.clockedIn && (
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {staff.clockedIn ? 'Clocked In' : 'Clocked Out'}
                    </p>
                    {staff.clockedIn && staff.lastCheckIn && (
                      <p className="text-xs text-neutral-500">
                        since {new Date(staff.lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {!staff.clockedIn && staff.lastCheckOut && (
                      <p className="text-xs text-neutral-500">
                        last out {new Date(staff.lastCheckOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${staff.clockedIn ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-50 text-neutral-600 border border-neutral-200'}`}>
                  {staff.shift ? `${staff.shift} shift` : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
              <h3 className="text-sm font-semibold text-neutral-700">Contact Information</h3>
            </div>
            <div className="space-y-3 bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-[#A57865]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-600">Phone</p>
                  <p className="text-sm font-semibold text-neutral-900">{staff.phone}</p>
                </div>
              </div>
              <div className="h-px bg-neutral-200"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-[#A57865]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-600">Email</p>
                  <p className="text-sm font-semibold text-neutral-900">{staff.email}</p>
                </div>
              </div>
              <div className="h-px bg-neutral-200"></div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-[#A57865]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-600">Join Date</p>
                  <p className="text-sm font-semibold text-neutral-900">{staff.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#4E5840] rounded-full"></div>
              <h3 className="text-sm font-semibold text-neutral-700">Performance</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#FAF8F6] rounded-xl border border-neutral-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#A57865]" />
                  </div>
                </div>
                <p className="text-xs font-medium text-neutral-600 mb-1">Tasks Completed</p>
                <p className="text-2xl font-bold text-neutral-900">{staff.performance.tasksCompleted}</p>
              </div>
              <div className="p-4 bg-[#FAF8F6] rounded-xl border border-neutral-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#4E5840]" />
                  </div>
                </div>
                <p className="text-xs font-medium text-neutral-600 mb-1">Avg Response</p>
                <p className="text-2xl font-bold text-neutral-900">{staff.performance.avgResponseTime}</p>
              </div>
              <div className="p-4 bg-[#FAF8F6] rounded-xl border border-neutral-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                </div>
                <p className="text-xs font-medium text-neutral-600 mb-1">Rating</p>
                <p className="text-2xl font-bold text-neutral-900">{staff.performance.customerRating}</p>
              </div>
              <div className="p-4 bg-[#FAF8F6] rounded-xl border border-neutral-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#4E5840]" />
                  </div>
                </div>
                <p className="text-xs font-medium text-neutral-600 mb-1">Punctuality</p>
                <p className="text-2xl font-bold text-neutral-900">{staff.performance.punctuality}%</p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          {staff.schedule && staff.schedule.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#CDB261] rounded-full"></div>
                <h3 className="text-sm font-semibold text-neutral-700">Assigned Shifts</h3>
              </div>
              <div className="bg-[#FAF8F6] rounded-xl p-4 border border-neutral-100 space-y-2">
                {staff.schedule.map((item, index) => {
                  // Support both old format (day/hours) and new format (date/shift)
                  const displayDate = item.date
                    ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    : item.day;

                  // Derive hours from shift type if not provided
                  const shiftHours = {
                    morning: '08:00 - 16:00',
                    evening: '16:00 - 00:00',
                    night: '00:00 - 08:00'
                  };
                  const displayHours = item.hours || shiftHours[item.shift] || '';

                  return (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-200 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-[#A57865]" />
                        </div>
                        <span className="text-sm font-semibold text-neutral-900">{displayDate}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-neutral-700 capitalize">{item.shift}</p>
                        {displayHours && <p className="text-xs text-neutral-500">{displayHours}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {staff.aiInsights && staff.aiInsights.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
                <Sparkles className="w-4 h-4 text-[#A57865]" />
                <h3 className="text-sm font-semibold text-neutral-700">AI Insights</h3>
              </div>
              <div className="space-y-2">
                {staff.aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#A57865]/10 to-[#A57865]/5 rounded-xl border border-[#A57865]/20">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#A57865]/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4 text-[#A57865]" />
                    </div>
                    <p className="text-sm text-neutral-900 font-medium">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floor Assignment (if applicable) */}
          {staff.floorAssignment && staff.floorAssignment.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#4E5840] rounded-full"></div>
                <h3 className="text-sm font-semibold text-neutral-700">Floor Assignment</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {staff.floorAssignment.map((floor) => (
                  <span
                    key={floor}
                    className="px-4 py-2 bg-[#FAF8F6] border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-900"
                  >
                    Floor {floor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#A57865] rounded-full"></div>
              <h3 className="text-sm font-semibold text-neutral-700">Actions</h3>
            </div>
            <div className="space-y-3">
              {/* Update Status */}
              <div className="p-4 bg-[#FAF8F6] rounded-xl border border-neutral-100 space-y-3">
                <label className="block text-sm font-semibold text-neutral-700">
                  Update Status
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setIsStatusEditing(true);
                    }}
                    className="flex-1 px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="off-duty">Off Duty</option>
                    <option value="sick">Sick</option>
                    <option value="leave">On Leave</option>
                  </select>
                  <Button
                    variant="primary"
                    onClick={handleSaveStatus}
                    disabled={!isStatusEditing || selectedStatus === staff.status}
                    icon={Save}
                  >
                    Save
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <Button
                variant="primary"
                onClick={() => onAssignShift(staff)}
                icon={Calendar}
                className="w-full justify-start"
              >
                Assign Shift
              </Button>

              <Button
                variant="outline-neutral"
                onClick={() => onMarkLeave && onMarkLeave(staff)}
                icon={Coffee}
                className="w-full justify-start"
              >
                Mark Leave
              </Button>

              <Button
                variant="outline-neutral"
                onClick={() => onMessage(staff)}
                icon={MessageSquare}
                className="w-full justify-start"
              >
                Send Message
              </Button>

              <Button
                variant="outline-neutral"
                onClick={() => onEdit && onEdit(staff)}
                icon={Edit2}
                className="w-full justify-start"
              >
                Edit Details
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  onClose();
                  navigate(`/admin/staff/${staff.id}`);
                }}
                icon={User}
                className="w-full justify-start"
              >
                View Full Profile
              </Button>

              {staff.status !== 'disabled' && (
                <Button
                  variant="danger"
                  onClick={() => onDisable && onDisable(staff)}
                  icon={UserX}
                  className="w-full justify-start"
                >
                  Disable Staff
                </Button>
              )}
            </div>
          </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
