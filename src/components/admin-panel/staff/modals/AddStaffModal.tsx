import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Phone, Briefcase, Calendar, Hash, DollarSign, Shield, Check, Minus, AlertTriangle, ChevronDown, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../../ui2/Button';
import { useCurrency } from '@/hooks/useCurrency';
import {
  STAFF_ROLES,
  PERMISSION_MODULES,
  DEFAULT_PERMISSIONS,
  getDefaultPermissions,
  isOverridden
} from '@/config/rolePermissions';
import type { StaffRole, PermissionModule, ModulePermission, PermissionMap } from '@/config/rolePermissions';

export default function AddStaffModal({ isOpen, onClose, onAdd }) {
  const { symbol } = useCurrency();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    personalEmail: '',
    phone: '',
    role: 'admin',
    department: 'management',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    employeeId: '',
    shift: 'morning',
    hourlyRate: 15
  });

  const [permissions, setPermissions] = useState<PermissionMap>(getDefaultPermissions('admin'));
  const [permissionsExpanded, setPermissionsExpanded] = useState(true);

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

    // Reset form
    setFormData({
      name: '',
      email: '',
      personalEmail: '',
      phone: '',
      role: 'admin',
      department: 'management',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      employeeId: '',
      shift: 'morning',
      hourlyRate: 15
    });
    setPermissions(getDefaultPermissions('admin'));
    setPermissionsExpanded(true);

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    const role = e.target.value as StaffRole;
    const roleMeta = STAFF_ROLES.find(r => r.value === role);
    setFormData(prev => ({
      ...prev,
      role,
      department: roleMeta?.department || 'general'
    }));
    setPermissions(getDefaultPermissions(role));
  };

  const togglePermission = (module: PermissionModule, action: keyof ModulePermission) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }));
  };

  const hasOverrides = useMemo(() => {
    const defaults = DEFAULT_PERMISSIONS[formData.role as StaffRole];
    if (!defaults) return false;
    return PERMISSION_MODULES.some(mod =>
      (['view', 'edit', 'delete'] as const).some(action =>
        permissions[mod.id][action] !== defaults[mod.id][action]
      )
    );
  }, [formData.role, permissions]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<{ workEmail: string; personalEmail: string; tempPassword: string; emailSent: boolean; sentTo: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await onAdd({ ...formData, permissions });
      // If we got temp credentials back, show them
      if (result?.tempPassword) {
        const sentTo = formData.personalEmail || formData.email;
        setCredentials({
          workEmail: formData.email,
          personalEmail: formData.personalEmail,
          tempPassword: result.tempPassword,
          emailSent: result.emailSent || false,
          sentTo,
        });
      } else {
        onClose();
      }
    } catch {
      // Error toast is already shown by useStaff hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;
    const text = `Login Email (Work): ${credentials.workEmail}\nTemporary Password: ${credentials.tempPassword}\n\nPlease change your password on first login. Expires in 72 hours.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const shifts = [
    { value: 'morning', label: 'Morning (6AM - 2PM)' },
    { value: 'afternoon', label: 'Afternoon (2PM - 10PM)' },
    { value: 'night', label: 'Night (10PM - 6AM)' },
    { value: 'flexible', label: 'Flexible' },
  ];

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
          <div className="p-4 sm:p-6 border-b border-neutral-200 flex-shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Add New Staff</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-all duration-150 active:scale-95"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
            <p className="text-sm text-neutral-600">Fill in the details to add a new staff member</p>
          </div>

          {/* Credentials Success Screen */}
          {credentials ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">Staff Member Created</h3>
              <p className="text-sm text-neutral-500 mb-6">
                {credentials.emailSent
                  ? `Credentials emailed to ${credentials.sentTo}. You can also copy them below.`
                  : 'Email could not be sent. Please share these credentials manually.'}
              </p>

              <div className="w-full max-w-sm bg-amber-50 border border-amber-200 rounded-xl p-5 text-left space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Login Email (Work)</p>
                  <p className="text-sm font-mono text-neutral-900 select-all">{credentials.workEmail}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Temporary Password</p>
                  <p className="text-base font-mono font-bold text-neutral-900 select-all tracking-wide">{credentials.tempPassword}</p>
                </div>
                {credentials.personalEmail && (
                  <div className="pt-1 border-t border-amber-200/60">
                    <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Credentials Sent To</p>
                    <p className="text-sm text-neutral-700">{credentials.personalEmail}</p>
                  </div>
                )}
                <p className="text-[11px] text-amber-600 pt-1">Expires in 72 hours. Must be changed on first login.</p>
              </div>

              <button
                onClick={handleCopyCredentials}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </button>

              <Button variant="primary" onClick={onClose} className="mt-6">
                Done
              </Button>
            </div>
          ) : (
          /* Form Content */
          <div className="overflow-y-auto flex-1 custom-scrollbar p-4 sm:p-6 pb-4 space-y-6">
          {/* Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#A57865] rounded-full"></div>
              <h3 className="text-base font-semibold text-neutral-900">Basic Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <User className="w-4 h-4 text-[#A57865]" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Hash className="w-4 h-4 text-[#A57865]" />
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP001"
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Briefcase className="w-4 h-4 text-[#A57865]" />
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleRoleChange}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 cursor-pointer"
                >
                  {STAFF_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#4E5840] rounded-full"></div>
              <h3 className="text-base font-semibold text-neutral-900">Contact Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Mail className="w-4 h-4 text-[#4E5840]" />
                  Work Email (Login) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@glimmora.com"
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4E5840] focus:border-[#4E5840] transition-all duration-200"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Issued by the hotel. Staff will use this to log in.</p>
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Mail className="w-4 h-4 text-[#4E5840]" />
                  Personal Email
                </label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  placeholder="john.doe@gmail.com"
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4E5840] focus:border-[#4E5840] transition-all duration-200"
                />
                <p className="text-[11px] text-neutral-400 mt-1">Login credentials will be sent here. Falls back to work email if empty.</p>
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Phone className="w-4 h-4 text-[#4E5840]" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#4E5840] focus:border-[#4E5840] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#CDB261] rounded-full"></div>
              <h3 className="text-base font-semibold text-neutral-900">Employment Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Calendar className="w-4 h-4 text-[#CDB261]" />
                  Join Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#CDB261] focus:border-[#CDB261] transition-all duration-200 cursor-pointer"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <User className="w-4 h-4 text-[#CDB261]" />
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#CDB261] focus:border-[#CDB261] transition-all duration-200 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="off-duty">Off Duty</option>
                  <option value="sick">Sick</option>
                  <option value="leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <Calendar className="w-4 h-4 text-[#CDB261]" />
                  Default Shift
                </label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#CDB261] focus:border-[#CDB261] transition-all duration-200 cursor-pointer"
                >
                  {shifts.map(shift => (
                    <option key={shift.value} value={shift.value}>{shift.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
                  <DollarSign className="w-4 h-4 text-[#CDB261]" />
                  Hourly Rate ({symbol})
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  placeholder="15.00"
                  className="w-full px-4 py-2.5 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#CDB261] focus:border-[#CDB261] transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Access Permissions */}
          <div>
            <button
              type="button"
              onClick={() => setPermissionsExpanded(!permissionsExpanded)}
              className="w-full flex items-center justify-between gap-2 mb-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#5C9BA4] rounded-full"></div>
                <Shield className="w-4 h-4 text-[#5C9BA4]" />
                <h3 className="text-base font-semibold text-neutral-900">Access Permissions</h3>
                {hasOverrides && (
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                    Customised
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${permissionsExpanded ? 'rotate-180' : ''}`} />
            </button>

            {permissionsExpanded && (
              <div className="bg-[#FAF8F6] rounded-xl border border-neutral-100 overflow-hidden">
                {/* Info banner */}
                <div className="px-4 py-2.5 bg-[#5C9BA4]/5 border-b border-[#5C9BA4]/10 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#5C9BA4] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-neutral-600">
                    Permissions are auto-filled based on the selected role. Customise individual permissions below — overrides are highlighted in <span className="text-amber-600 font-medium">amber</span>.
                  </p>
                </div>

                {/* Permissions grid */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200/60">
                        <th className="text-left py-2.5 px-4 text-xs font-semibold text-neutral-600">Module</th>
                        <th className="text-center py-2.5 px-3 text-xs font-semibold text-neutral-600 w-16">View</th>
                        <th className="text-center py-2.5 px-3 text-xs font-semibold text-neutral-600 w-16">Edit</th>
                        <th className="text-center py-2.5 px-3 text-xs font-semibold text-neutral-600 w-16">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PERMISSION_MODULES.map((mod, idx) => {
                        const perm = permissions[mod.id];
                        return (
                          <tr key={mod.id} className={idx !== PERMISSION_MODULES.length - 1 ? 'border-b border-neutral-100' : ''}>
                            <td className="py-2.5 px-4">
                              <span className="text-sm text-neutral-700">{mod.label}</span>
                            </td>
                            {(['view', 'edit', 'delete'] as const).map(action => {
                              const isOn = perm[action];
                              const overridden = isOverridden(formData.role as StaffRole, mod.id, action, isOn);
                              return (
                                <td key={action} className="py-2.5 px-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => togglePermission(mod.id, action)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                      isOn
                                        ? overridden
                                          ? 'bg-amber-100 border-2 border-amber-400 text-amber-600'
                                          : 'bg-emerald-100 border-2 border-emerald-400 text-emerald-600'
                                        : overridden
                                          ? 'bg-amber-50 border-2 border-amber-300 text-amber-400'
                                          : 'bg-white border-2 border-neutral-200 text-neutral-300 hover:border-neutral-300'
                                    }`}
                                  >
                                    {isOn ? <Check className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Reset button */}
                <div className="px-4 py-3 border-t border-neutral-200/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPermissions(getDefaultPermissions(formData.role as StaffRole))}
                    className="text-xs font-medium text-[#5C9BA4] hover:text-[#4E8A93] transition-colors"
                  >
                    Reset to Role Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>

          )}

          {/* Footer Actions — only shown when form is visible */}
          {!credentials && (
          <div className="border-t border-neutral-200 p-4 sm:p-6 bg-white flex-shrink-0">
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  'Add Staff Member'
                )}
              </Button>
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
