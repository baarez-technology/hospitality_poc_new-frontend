import { useEffect, useCallback, useRef, ReactNode, FormEvent, ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from './Button';

/**
 * Staff Portal Modal Components
 * Matching admin dashboard ui2/Modal.tsx styling
 */

// Modal Backdrop
function ModalBackdrop({
  onClick,
  className = '',
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 ${className}`}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'default',
  closeOnOverlay = true,
  showCloseButton = true,
  className = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeStyles = {
    sm: 'max-w-sm',
    default: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[calc(100vw-2rem)]'
  };

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <ModalBackdrop onClick={closeOnOverlay ? onClose : undefined} />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className={`
          relative z-[51] bg-white rounded-[var(--brand-radius-card)] w-full overflow-hidden
          max-h-[calc(100vh-2rem)] sm:max-h-[90vh] flex flex-col
          border border-neutral-200 shadow-xl shadow-neutral-900/10
          ${sizeStyles[size]}
          ${className}
        `}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100 flex-shrink-0">
            <div className="flex-1 min-w-0 pr-8">
              {title && (
                <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">{title}</h2>
              )}
              {subtitle && (
                <p className="text-[13px] text-neutral-500 mt-1">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'success' | 'warning';
  icon?: ComponentType<{ className?: string }>;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon: Icon
}: ConfirmModalProps) {
  const variantConfig: Record<string, { iconBg: string; iconColor: string }> = {
    danger: { iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
    warning: { iconBg: 'bg-gold-50', iconColor: 'text-gold-600' },
    primary: { iconBg: 'bg-[var(--brand-primary-50)]', iconColor: 'text-[var(--brand-primary)]' },
    secondary: { iconBg: 'bg-[var(--brand-accent-50)]', iconColor: 'text-[var(--brand-accent)]' },
    success: { iconBg: 'bg-sage-50', iconColor: 'text-sage-600' }
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center">
        {Icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${config.iconBg}`}>
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-neutral-900 tracking-tight mb-2">{title}</h3>
        <p className="text-[13px] text-neutral-500 leading-relaxed">{message}</p>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <Button variant="outline-neutral" onClick={onClose} className="flex-1">
          {cancelText}
        </Button>
        <Button variant={variant} onClick={async () => { await onConfirm(); onClose(); }} className="flex-1">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  size = 'default'
}: FormModalProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size={size}
      footer={
        <>
          <Button variant="outline-neutral" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button type="submit" form="modal-form" isLoading={isLoading}>
            {submitText}
          </Button>
        </>
      }
    >
      <form id="modal-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Modal>
  );
}

// Side Drawer - matching admin Drawer component
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  closeOnOverlay?: boolean;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  side = 'right',
  size = 'md',
  closeOnOverlay = true
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes: Record<string, string> = {
    sm: 'w-full sm:w-80',
    md: 'w-full sm:w-96',
    lg: 'w-full sm:w-[480px]',
    xl: 'w-full sm:w-[600px]',
    '2xl': 'w-full sm:w-[672px]'
  };

  const slideAnimation = side === 'left'
    ? 'animate-[slideInLeft_0.3s_ease-out]'
    : 'animate-[slideInRight_0.3s_ease-out]';

  return createPortal(
    <div className="fixed inset-0 z-50">
      <ModalBackdrop onClick={closeOnOverlay ? onClose : undefined} />
      <div
        role="dialog"
        aria-modal="true"
        className={`
          fixed top-0 bottom-0 bg-white h-full overflow-hidden flex flex-col
          border-neutral-200 shadow-xl z-[51]
          ${side === 'left' ? 'left-0 border-r' : 'right-0 border-l'}
          ${sizes[size]}
          ${slideAnimation}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100 flex-shrink-0">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="text-[11px] text-neutral-400 font-medium mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-neutral-100 bg-neutral-50/50 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// Form Drawer - Side drawer with form
interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function FormDrawer({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  isLoading = false,
  side = 'right',
  size = 'md'
}: FormDrawerProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      side={side}
      size={size}
      footer={
        <>
          <Button variant="outline-neutral" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button type="submit" form="drawer-form" isLoading={isLoading}>
            {submitText}
          </Button>
        </>
      }
    >
      <form id="drawer-form" onSubmit={handleSubmit}>
        {children}
      </form>
    </Drawer>
  );
}

export default Modal;
