import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" role="region">
        {toasts.map((toast) => {
          const icons = {
            success: <CheckCircle2 className="toast-icon text-success" size={20} />,
            warning: <AlertTriangle className="toast-icon text-warning" size={20} />,
            error: <AlertCircle className="toast-icon text-danger" size={20} />,
            info: <Info className="toast-icon text-primary" size={20} />
          };

          return (
            <div key={toast.id} className={`toast toast-${toast.type} shadow-lg animate-slide-in`}>
              <div className="toast-body">
                {icons[toast.type] || icons.info}
                <span className="toast-message">{toast.message}</span>
              </div>
              <button
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
