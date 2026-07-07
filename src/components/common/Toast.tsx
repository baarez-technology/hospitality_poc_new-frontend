import { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-white',
      border: 'border-l-4 border-[#5C9BA4]',
      text: 'text-neutral-800',
      icon: CheckCircle,
      iconColor: 'text-[#5C9BA4]'
    },
    error: {
      bg: 'bg-white',
      border: 'border-l-4 border-rose-500',
      text: 'text-neutral-800',
      icon: AlertCircle,
      iconColor: 'text-rose-500'
    },
    info: {
      bg: 'bg-white',
      border: 'border-l-4 border-[#5C9BA4]',
      text: 'text-neutral-800',
      icon: Info,
      iconColor: 'text-[#5C9BA4]'
    },
    warning: {
      bg: 'bg-white',
      border: 'border-l-4 border-[#CDB261]',
      text: 'text-neutral-800',
      icon: AlertCircle,
      iconColor: 'text-[#CDB261]'
    }
  };

  const style = typeStyles[type] || typeStyles.success;
  const Icon = style.icon;

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div className={`${style.bg} ${style.border} rounded-xl shadow-xl p-4 pr-12 max-w-md animate-slideInRight`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
          <p className={`text-sm font-medium ${style.text}`}>{message}</p>
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-1 hover:bg-black/5 rounded-lg transition-colors ${style.text}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
