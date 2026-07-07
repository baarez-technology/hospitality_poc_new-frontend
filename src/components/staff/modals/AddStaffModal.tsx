/**
 * AddStaffModal Component
 * Add new staff member - Glimmora Design System v5.0
 * Uses Drawer pattern with RBAC permissions panel
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Minus, Shield, AlertTriangle } from 'lucide-react';
import { Drawer } from '../../ui2/Drawer';
import { Button } from '../../ui2/Button';
import DatePicker from '../../ui2/DatePicker';
import {
  STAFF_ROLES,
  PERMISSION_MODULES,
  DEFAULT_PERMISSIONS,
  getDefaultPermissions,
  isOverridden
} from '@/config/rolePermissions';
import type { StaffRole, PermissionModule, ModulePermission, PermissionMap } from '@/config/rolePermissions';

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
                <div>
                  <span>{option.label}</span>
                  {option.description && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">{option.description}</p>
                  )}
                </div>
                {value === option.value && <Check className="w-4 h-4 text-terra-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default function AddStaffModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'admin' as StaffRole,
    department: 'management',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    employeeId: ''
  });

  const [permissions, setPermissions] = useState<PermissionMap>(getDefaultPermissions('admin'));
  const [permissionsExpanded, setPermissionsExpanded] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'admin' as StaffRole,
        department: 'management',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'active',
        employeeId: ''
      });
      setPermissions(getDefaultPermissions('admin'));
      setPermissionsExpanded(true);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (roleValue: string) => {
    const role = roleValue as StaffRole;
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

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.employeeId) {
      return;
    }
    onAdd({ ...formData, permissions });
    onClose();
  };

  const roleOptions = STAFF_ROLES.map(r => ({
    value: r.value,
    label: r.label,
    description: r.description
  }));

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'off-duty', label: 'Off Duty' },
    { value: 'sick', label: 'Sick' },
    { value: 'leave', label: 'On Leave' }
  ];

  const inputStyles = "w-full h-9 px-3.5 rounded-lg text-[13px] bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-terra-400 focus:ring-2 focus:ring-terra-500/10 focus:outline-none transition-all";

  const renderFooter = () => (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="ghost"
        onClick={onClose}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        className="px-5 py-2 text-[13px] font-semibold"
      >
        Add Staff Member
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Staff"
      subtitle="Fill in the details to add a new staff member"
      maxWidth="max-w-2xl"
      footer={renderFooter()}
    >
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Basic Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                className={inputStyles}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="EMP001"
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                  Role <span className="text-rose-500">*</span>
                </label>
                <SelectDropdown
                  value={formData.role}
                  onChange={handleRoleChange}
                  options={roleOptions}
                  placeholder="Select role"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Contact Information
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="staff@glimmora.com"
                className={inputStyles}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={inputStyles}
              />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900 mb-3">
            Employment Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Join Date <span className="text-rose-500">*</span>
              </label>
              <DatePicker
                value={formData.joinDate}
                onChange={(date) => setFormData(prev => ({ ...prev, joinDate: date }))}
                placeholder="Select date"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-500 mb-1.5">
                Status <span className="text-rose-500">*</span>
              </label>
              <SelectDropdown
                value={formData.status}
                onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                options={statusOptions}
                placeholder="Select status"
              />
            </div>
          </div>
        </div>

        {/* Access Permissions */}
        <div>
          <button
            type="button"
            onClick={() => setPermissionsExpanded(!permissionsExpanded)}
            className="w-full flex items-center justify-between gap-2 mb-3"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#5C9BA4]" />
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-900">
                Access Permissions
              </h4>
              {hasOverrides && (
                <span className="px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 text-amber-600 rounded border border-amber-200">
                  Customised
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${permissionsExpanded ? 'rotate-180' : ''}`} />
          </button>

          {permissionsExpanded && (
            <div className="rounded-lg bg-neutral-50 border border-neutral-100 overflow-hidden">
              {/* Info banner */}
              <div className="px-3 py-2 bg-[#5C9BA4]/5 border-b border-[#5C9BA4]/10 flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-[#5C9BA4] mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  Permissions auto-fill based on role. Overrides are highlighted in <span className="text-amber-600 font-medium">amber</span>.
                </p>
              </div>

              {/* Permissions grid */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200/60">
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Module</th>
                      <th className="text-center py-2 px-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider w-14">View</th>
                      <th className="text-center py-2 px-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider w-14">Edit</th>
                      <th className="text-center py-2 px-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider w-14">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_MODULES.map((mod, idx) => {
                      const perm = permissions[mod.id];
                      return (
                        <tr key={mod.id} className={idx !== PERMISSION_MODULES.length - 1 ? 'border-b border-neutral-100' : ''}>
                          <td className="py-2 px-3">
                            <span className="text-[12px] text-neutral-700">{mod.label}</span>
                          </td>
                          {(['view', 'edit', 'delete'] as const).map(action => {
                            const isOn = perm[action];
                            const overridden = isOverridden(formData.role as StaffRole, mod.id, action, isOn);
                            return (
                              <td key={action} className="py-2 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => togglePermission(mod.id, action)}
                                  className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-all duration-150 ${
                                    isOn
                                      ? overridden
                                        ? 'bg-amber-100 border border-amber-400 text-amber-600'
                                        : 'bg-emerald-100 border border-emerald-400 text-emerald-600'
                                      : overridden
                                        ? 'bg-amber-50 border border-amber-300 text-amber-400'
                                        : 'bg-white border border-neutral-200 text-neutral-300 hover:border-neutral-300'
                                  }`}
                                >
                                  {isOn ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
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
              <div className="px-3 py-2 border-t border-neutral-200/60 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPermissions(getDefaultPermissions(formData.role as StaffRole))}
                  className="text-[11px] font-medium text-[#5C9BA4] hover:text-[#4E8A93] transition-colors"
                >
                  Reset to Role Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
