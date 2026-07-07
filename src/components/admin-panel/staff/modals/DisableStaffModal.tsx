import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, UserX } from 'lucide-react';
import { Button } from '../../../ui2/Button';

export default function DisableStaffModal({ staff, isOpen, onClose, onDisable }) {
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const mainContent = document.querySelector('main');

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    if (mainContent) {
      mainContent.style.overflow = 'hidden';
    }

    setConfirmText('');
    document.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      document.body.style.overflow = '';

      if (mainContent) {
        mainContent.style.overflow = '';
      }

      window.scrollTo(scrollX, scrollY);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !staff) return null;

  const handleDisable = () => {
    if (confirmText.toLowerCase() === 'disable') {
      onDisable(staff.id);
      onClose();
    }
  };

  const isConfirmValid = confirmText.toLowerCase() === 'disable';

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-red-50 border-b border-red-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Disable Staff Member</h2>
                  <p className="text-sm text-neutral-500">This action can be reversed</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-lg transition-all duration-150"
              >
                <X className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  You are about to disable this staff member
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  They will no longer appear in staff assignments and cannot log in.
                </p>
              </div>
            </div>

            <div className="bg-[#FAF8F6] rounded-xl p-4 border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A57865] to-[#8E6554] flex items-center justify-center text-white font-bold text-sm">
                  {staff.avatar}
                </div>
                <div>
                  <p className="font-semibold text-neutral-900">{staff.name}</p>
                  <p className="text-sm text-neutral-500">{staff.role}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">
                Type "disable" to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="disable"
                className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 flex gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDisable} disabled={!isConfirmValid} icon={UserX} className="flex-1">
              Disable Staff
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
