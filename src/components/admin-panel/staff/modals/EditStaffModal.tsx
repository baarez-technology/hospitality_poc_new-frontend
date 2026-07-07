import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { staffService } from '../../../../api/services/staff.service';
import { Button } from '../../../ui2/Button';

export default function EditStaffModal({ staff, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'frontdesk',
    status: 'active',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && staff) {
      document.body.style.overflow = 'hidden';
      setFormData({
        name: staff.name || '',
        role: staff.role || '',
        department: staff.department || 'frontdesk',
        status: staff.status || 'active',
        phone: staff.phone || '',
        email: staff.email || ''
      });
      setError(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, staff]);

  if (!isOpen || !staff) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await staffService.update(staff.id, {
        full_name: formData.name,
        role: formData.role,
        department: formData.department,
        status: formData.status,
        phone: formData.phone
      });
      onSave(staff.id, formData);
      onClose();
    } catch (err: any) {
      console.error('Failed to update staff:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to update staff. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-neutral-900">Edit Staff Details</h2>
            <p className="text-sm text-neutral-600 mt-1">Update information for {staff.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-150">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
          {error && (<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>)}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={isSubmitting} placeholder="Enter full name" className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Role *</label>
            <input type="text" name="role" value={formData.role} onChange={handleChange} required disabled={isSubmitting} placeholder="e.g., Receptionist" className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Phone Number *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required disabled={isSubmitting} placeholder="+1 (555) 123-4567" className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={isSubmitting} placeholder="name@glimmora.com" className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Department *</label>
            <select name="department" value={formData.department} onChange={handleChange} required disabled={isSubmitting} className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50">
              <option value="frontdesk">Front Desk</option>
              <option value="housekeeping">Housekeeping</option>
              <option value="management">Management</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status *</label>
            <select name="status" value={formData.status} onChange={handleChange} required disabled={isSubmitting} className="w-full px-4 py-3 bg-[#FAF8F6] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#A57865] focus:border-[#A57865] transition-all duration-200 disabled:opacity-50">
              <option value="active">Active</option>
              <option value="off-duty">Off Duty</option>
              <option value="sick">Sick</option>
              <option value="leave">On Leave</option>
            </select>
          </div>
        </form>
        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200 flex-shrink-0">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting} icon={isSubmitting ? Loader2 : Save} loading={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
