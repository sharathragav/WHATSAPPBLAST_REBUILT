import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  onClose, 
  duration = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    const iconClasses = "w-5 h-5 flex-shrink-0 mt-0.5";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClasses} text-green-600`} />;
      case 'error':
        return <XCircle className={`${iconClasses} text-red-600`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClasses} text-yellow-600`} />;
      default:
        return <Info className={`${iconClasses} text-blue-600`} />;
    }
  };

  const getToastClasses = () => {
    const baseClasses = `
      max-w-sm bg-white rounded-lg shadow-lg p-4 border-l-4 transform transition-all duration-300
      ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `;

    switch (type) {
      case 'success':
        return `${baseClasses} border-green-500`;
      case 'error':
        return `${baseClasses} border-red-500`;
      case 'warning':
        return `${baseClasses} border-yellow-500`;
      default:
        return `${baseClasses} border-blue-500`;
    }
  };

  return (
    <div className={getToastClasses()} data-testid={`toast-${type}`}>
      <div className="flex items-start">
        {getIcon()}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900 capitalize">{type}</p>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <button 
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={handleClose}
          data-testid="toast-close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<{ 
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }>;
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2" data-testid="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};
