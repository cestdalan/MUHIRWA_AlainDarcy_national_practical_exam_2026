import React, { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null); // { message, type: 'success' | 'error' | 'info', id }
  
  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotification({ message, type, id });
    
    // Auto-dismiss after 4.5 seconds
    const timer = setTimeout(() => {
      setNotification(current => {
        if (current && current.id === id) {
          return null;
        }
        return current;
      });
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-sm px-4 pointer-events-none animate-slide-down no-print">
          <div className={`pointer-events-auto flex items-center justify-between gap-3.5 px-4.5 py-3.5 rounded-2.5xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl transition-all duration-300 ${
            notification.type === 'success' 
              ? 'border-emerald-200 dark:border-emerald-500/25 text-emerald-950 dark:text-emerald-400' 
              : notification.type === 'error'
              ? 'border-rose-200 dark:border-rose-500/25 text-rose-950 dark:text-rose-450'
              : 'border-blue-200 dark:border-blue-500/25 text-blue-950 dark:text-brand-400'
          }`}>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0" />}
              {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500 dark:text-rose-500 shrink-0" />}
              {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500 dark:text-brand-400 shrink-0" />}
              <span className="text-xs font-bold tracking-wide truncate max-w-xs">{notification.message}</span>
            </div>
            <button 
              onClick={dismissNotification}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
