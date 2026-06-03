import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';

export default function EmployeeModal({ isOpen, onClose, employee, onSave }) {
  const [formData, setFormData] = useState({
    empfname: '',
    emplname: '',
    empgender: 'Male',
    empdob: '',
    empemail: '',
    emptelephone: '',
    empaddress: '',
    emphiredate: '',
    empstatus: 'On Mission',
    departmentName: '',
    positionName: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize fields if editing
  useEffect(() => {
    if (employee) {
      setFormData({
        empfname: employee.empfname || '',
        emplname: employee.emplname || '',
        empgender: employee.empgender || 'Male',
        empdob: employee.empdob || '',
        empemail: employee.empemail || '',
        emptelephone: employee.emptelephone || '',
        empaddress: employee.empaddress || '',
        emphiredate: employee.emphiredate || '',
        empstatus: employee.empstatus || 'On Mission',
        departmentName: employee.d_name || '',
        positionName: employee.posname || ''
      });
    } else {
      setFormData({
        empfname: '',
        emplname: '',
        empgender: 'Male',
        empdob: '',
        empemail: '',
        emptelephone: '',
        empaddress: '',
        emphiredate: new Date().toISOString().split('T')[0], // pre-populate today
        empstatus: 'On Mission',
        departmentName: '',
        positionName: ''
      });
    }
    setErrorMsg('');
  }, [employee, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while saving the employee record.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Side Panel slide-over */}
      <div className="relative w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-[#f5f5f5] dark:border-slate-800 text-black dark:text-slate-100 shadow-2xl flex flex-col justify-between z-10 animate-slide-over">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#f5f5f5] dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              {employee ? 'Edit Employee Record' : 'Add New Employee'}
            </h2>
            <p className="text-xs text-[#1e3a8a] dark:text-slate-400 mt-1">
              {employee ? 'Modify details for the selected personnel member.' : 'Enroll a new employee into DAB Enterprise LTD.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg bg-[#f5f5f5] dark:bg-slate-900 border border-[#f5f5f5] dark:border-slate-800 text-[#1e3a8a] dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors duration-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-[#f5f5f5] dark:bg-rose-500/10 border border-[#1e3a8a] dark:border-rose-500/20 text-[#1e3a8a] dark:text-rose-450 text-sm flex gap-3.5 items-start font-bold">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Double column name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                First Name <span className="text-black dark:text-rose-500 font-bold">*</span>
              </label>
              <input
                required
                type="text"
                name="empfname"
                value={formData.empfname}
                onChange={handleChange}
                placeholder="Alain"
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-slate-650 outline-none transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Last Name <span className="text-black dark:text-rose-500 font-bold">*</span>
              </label>
              <input
                required
                type="text"
                name="emplname"
                value={formData.emplname}
                onChange={handleChange}
                placeholder="Muhirwa"
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-slate-650 outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Gender and Date of Birth */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Gender <span className="text-black dark:text-rose-500 font-bold">*</span>
              </label>
              <select
                name="empgender"
                value={formData.empgender}
                onChange={handleChange}
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white outline-none transition-all duration-300"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Date of Birth <span className="text-black dark:text-rose-500 font-bold">*</span>
              </label>
              <input
                required
                type="date"
                name="empdob"
                value={formData.empdob}
                onChange={handleChange}
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Email Address <span className="text-black dark:text-rose-500 font-bold">*</span>
              </label>
              <input
                required
                type="email"
                name="empemail"
                value={formData.empemail}
                onChange={handleChange}
                placeholder="alain.darcy@dabenterprise.com"
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-slate-650 outline-none transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Telephone <span className="text-black dark:text-rose-500 font-bold">*</span>
              </label>
              <input
                required
                type="text"
                name="emptelephone"
                value={formData.emptelephone}
                onChange={handleChange}
                placeholder="+250 788 123 456"
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-slate-650 outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
              Residential Address <span className="text-black dark:text-rose-500 font-bold">*</span>
            </label>
            <input
              required
              type="text"
              name="empaddress"
              value={formData.empaddress}
              onChange={handleChange}
              placeholder="KN 120 St, Kigali, Rwanda"
              className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-slate-650 outline-none transition-all duration-300"
            />
          </div>

          {/* Department & Position (Manual Free-Text Inputs) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Department
              </label>
              <input
                type="text"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleChange}
                placeholder="e.g. IT Department"
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/35 dark:placeholder-slate-650 outline-none transition-all duration-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Position
              </label>
              <input
                type="text"
                name="positionName"
                value={formData.positionName}
                onChange={handleChange}
                placeholder="e.g. Software Engineer"
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/35 dark:placeholder-slate-650 outline-none transition-all duration-300 shadow-sm"
              />
            </div>
          </div>

          {/* Hire date & status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Hire Date <span className="text-black dark:text-rose-500 font-bold">*</span>
              </label>
              <input
                required
                type="date"
                name="emphiredate"
                value={formData.emphiredate}
                onChange={handleChange}
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white outline-none transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-2">
                Employment Status <span className="text-black dark:text-rose-500 font-bold">*</span>
              </label>
              <select
                name="empstatus"
                value={formData.empstatus}
                onChange={handleChange}
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-[#f5f5f5] dark:border-slate-800 focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-sm text-black dark:text-white outline-none transition-all duration-300"
              >
                <option value="On Mission">On Mission</option>
                <option value="On Leave">On Leave</option>
                <option value="Left">Left</option>
                <option value="Blacklisted">Blacklisted</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="p-6 border-t border-[#f5f5f5] dark:border-slate-800 bg-[#f5f5f5]/30 dark:bg-slate-900/40 flex justify-end gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-[#1e3a8a]/20 bg-white dark:bg-slate-900/80 text-black dark:text-slate-400 font-bold hover:bg-[#f5f5f5] transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-black dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-semibold flex items-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <Save className="h-4.5 w-4.5" />
            <span>{saving ? 'Saving...' : 'Save Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
