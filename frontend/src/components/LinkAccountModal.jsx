import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function LinkAccountModal({ isOpen, onClose, employee, onLink }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUnlinkedUsers = async () => {
      try {
        setLoading(true);
        setErrorMsg('');
        const res = await fetch('/api/users/unlinked');
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        } else {
          throw new Error('Failed to load unlinked accounts.');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Error fetching unlinked users.');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUnlinkedUsers();
      setSelectedUserId('');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setErrorMsg('Please select a user account.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await onLink(selectedUserId);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to link account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Modal box */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-black dark:text-slate-100 shadow-2xl rounded-3xl p-6 z-10 animate-fade-in transition-colors duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-[#1e3a8a] dark:text-brand-400">
            <LinkIcon className="h-5 w-5" />
            <h3 className="font-extrabold text-lg text-black dark:text-white">Link HRMS Account</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#f5f5f5] dark:bg-slate-900 border border-[#f5f5f5] dark:border-slate-800 text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-205"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed mb-3">
              Link employee <strong className="text-black dark:text-white">{employee?.empfname} {employee?.emplname}</strong> to an existing unlinked user account.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#f5f5f5] dark:bg-rose-500/10 border border-[#1e3a8a] dark:border-rose-500/20 text-[#1e3a8a] dark:text-rose-400 text-xs flex gap-2.5 items-center font-bold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-1.5">
              Available User Accounts
            </label>
            {loading ? (
              <div className="text-xs text-slate-500 py-2.5 animate-pulse">Loading accounts...</div>
            ) : users.length === 0 ? (
              <div className="p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs text-slate-500 text-center font-semibold">
                No unlinked user accounts found. Ensure a staff account is registered first.
              </div>
            ) : (
              <select
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-3 py-2.5 text-xs text-black dark:text-white outline-none transition-all duration-300"
              >
                <option value="">Select a user account...</option>
                {users.map((u) => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.username}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold bg-white border border-[#1e3a8a]/20 dark:bg-slate-900/80 text-black dark:text-slate-400 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || users.length === 0}
              className="px-4 py-2.5 text-xs font-bold bg-[#1e3a8a] hover:bg-black dark:bg-brand-600 dark:hover:bg-brand-500 text-white rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>{submitting ? 'Linking...' : 'Link Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
