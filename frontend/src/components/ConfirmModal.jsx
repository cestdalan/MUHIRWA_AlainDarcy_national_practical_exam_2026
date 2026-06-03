import React from 'react';
import { X, HelpCircle } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      {/* Dark backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Modal box */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 text-black dark:text-slate-100 shadow-2xl rounded-3xl p-6 z-10 animate-fade-in transition-colors duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-150 dark:border-slate-800">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <HelpCircle className={`h-5 w-5 ${isDanger ? 'text-rose-500' : 'text-[#1e3a8a] dark:text-brand-400'}`} />
            <h3 className="font-extrabold text-base">{title || 'Confirm Action'}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg bg-gray-50 dark:bg-slate-950 hover:bg-gray-150 dark:hover:bg-slate-800 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4">
          <p className="text-xs text-gray-650 dark:text-slate-400 leading-relaxed font-semibold">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-3 border-t border-gray-150 dark:border-slate-800 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold bg-white border border-gray-200 dark:bg-slate-900/80 text-gray-700 dark:text-slate-450 rounded-xl hover:bg-gray-55 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-colors ${
              isDanger 
                ? 'bg-rose-600 hover:bg-black dark:bg-rose-600 dark:hover:bg-rose-500' 
                : 'bg-[#1e3a8a] hover:bg-black dark:bg-brand-600 dark:hover:bg-brand-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
