import { useEffect } from 'react';
import type { ReactNode, ComponentType, HTMLAttributes, MouseEventHandler } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { Button, IconButton } from './Button';

/**
 * Glimmora Design System v5.0 - Modal
 * Overlay dialogs with animations and dynamic branding
 */

// Modal Backdrop
function ModalBackdrop({
  onClick,
  className,
}: {
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50',
        'animate-fadeIn',
        className
      )}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

type ModalProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  showClose?: boolean;
  className?: string;
};

// Main Modal Component
export function Modal({
  open,
  onClose,
  children,
  size = 'md', // sm, md, lg, xl, full
  closeOnBackdrop = true,
  closeOnEsc = true,
  showClose = true,
  className,
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, closeOnEsc, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const sizes: Record<ModalSize, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-4xl',
    full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <ModalBackdrop onClick={closeOnBackdrop ? onClose : undefined} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-[51] bg-white rounded-[var(--brand-radius-card)] w-full overflow-hidden',
          'animate-scaleIn',
          'border border-neutral-200',
          // Flex layout for proper footer positioning
          'flex flex-col',
          // Max height to ensure footer is always visible
          'max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]',
          // Modal minimum width requirement (responsive-safe)
          'min-[740px]:min-w-[700px]',
          sizes[size],
          className
        )}
      >
        {showClose && (
          <IconButton
            icon={X}
            variant="ghost"
            size="sm"
            label="Close"
            onClick={onClose}
            className="absolute right-3 top-3 z-10"
          />
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}

// Modal Header
export function ModalHeader({
  children,
  className,
  icon: Icon,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5',
        'flex-shrink-0',
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-[var(--brand-radius-card)] bg-[var(--brand-primary-50)] border border-[var(--brand-primary-light)]/60 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon className="w-6 h-6 text-[var(--brand-primary)]" />
        </div>
      )}
      <div className="flex-1 min-w-0 pr-8">
        {children}
      </div>
    </div>
  );
}

// Modal Title
export function ModalTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn('text-xl font-semibold text-neutral-900 tracking-tight mb-1', className)}>
      {children}
    </h2>
  );
}

// Modal Description
export function ModalDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-neutral-500 leading-relaxed', className)}>
      {children}
    </p>
  );
}

// Modal Content/Body
export function ModalContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-5 flex-1 overflow-y-auto', className)}>
      {children}
    </div>
  );
}

// Modal Footer
export function ModalFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 px-4 sm:px-6 py-4 sm:py-5',
        'border-t border-neutral-200/40 bg-white',
        'flex-shrink-0',
        className
      )}
    >
      {children}
    </div>
  );
}

type ConfirmVariant = 'danger' | 'warning' | 'primary' | 'secondary';

// Confirmation Modal - Pre-built confirmation dialog
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // danger, warning, primary, secondary
  loading = false,
  icon: Icon,
}: {
  open: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  icon?: ComponentType<{ className?: string }>;
}) {
  const variantConfig = {
    danger: {
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    warning: {
      iconBg: 'bg-gold-50',
      iconColor: 'text-gold-600',
    },
    primary: {
      iconBg: 'bg-[var(--brand-primary-50)]',
      iconColor: 'text-[var(--brand-primary)]',
    },
    secondary: {
      iconBg: 'bg-[var(--brand-accent-50)]',
      iconColor: 'text-[var(--brand-accent)]',
    },
  };

  const config = variantConfig[variant];

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-6">
        {/* Icon */}
        {Icon && (
          <div className={cn('w-10 h-10 rounded-[var(--brand-radius-md)] flex items-center justify-center mb-4', config.iconBg)}>
            <Icon className={cn('w-5 h-5', config.iconColor)} />
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-neutral-900 tracking-tight mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-[13px] text-neutral-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-[13px] font-semibold"
        >
          {cancelText}
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          loading={loading}
          className="px-4 py-2 text-[13px] font-semibold"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

// Alert Modal - For simple alerts
export function AlertModal({
  open,
  onClose,
  title,
  message,
  buttonText = 'OK',
  icon: Icon,
}: {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  message?: ReactNode;
  buttonText?: string;
  icon?: ComponentType<{ className?: string }>;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" showClose={false}>
      <ModalHeader icon={Icon}>
        <ModalTitle>{title}</ModalTitle>
        {message && <ModalDescription>{message}</ModalDescription>}
      </ModalHeader>
      <ModalFooter>
        <Button variant="primary" onClick={onClose} className="w-full">
          {buttonText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

type DrawerSide = 'left' | 'right';
type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

// Side Sheet / Drawer
export function Drawer({
  open,
  onClose,
  children,
  side = 'right', // left, right
  size = 'md', // sm, md, lg, xl
  title,
  closeOnBackdrop = true,
  closeOnEsc = true,
  className,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  side?: DrawerSide;
  size?: DrawerSize;
  title?: ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}) {
  useEffect(() => {
    if (!open || !closeOnEsc) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const sizes: Record<DrawerSize, string> = {
    sm: 'w-full sm:w-80',
    md: 'w-full sm:w-96',
    lg: 'w-full sm:w-[480px]',
    xl: 'w-full sm:w-[600px]',
  };

  const positions: Record<DrawerSide, string> = {
    left: 'left-0 animate-slideInLeft',
    right: 'right-0 animate-slideInRight',
  };

  return createPortal(
    <div className="fixed inset-0 z-50">
      <ModalBackdrop onClick={closeOnBackdrop ? onClose : undefined} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed top-0 bottom-0 bg-white h-full overflow-hidden flex flex-col',
          'border-neutral-200',
          side === 'left' ? 'border-r' : 'border-l',
          sizes[size],
          positions[side],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
          <IconButton icon={X} variant="ghost" size="sm" label="Close" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
