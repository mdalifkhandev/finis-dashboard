import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-200 bg-white shadow-emerald-500/10';
      case 'error':
        return 'border-red-200 bg-white shadow-red-500/10';
      case 'warning':
        return 'border-amber-200 bg-white shadow-amber-500/10';
      case 'info':
      default:
        return 'border-blue-200 bg-white shadow-blue-500/10';
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 w-full max-w-sm rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${getBorderColor()}`}
      role="alert"
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-bold text-gray-900 leading-tight">{toast.title}</h5>
        {toast.message && (
          <p className="mt-1 text-xs text-gray-600 leading-relaxed break-words">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
