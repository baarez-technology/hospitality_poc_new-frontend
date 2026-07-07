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
      bg: 'bg-[#4E5840]/10',
      border: 'border-[#4E5840]/30',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-[#4E5840]'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  };

  const style = typeStyles[type] || typeStyles.success;
  const Icon = style.icon;

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div className={`${style.bg} ${style.border} border rounded-xl shadow-lg p-4 pr-12 max-w-md animate-slideInRight`}>
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
