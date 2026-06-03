import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeModal from '../components/EmployeeModal';
import LinkAccountModal from '../components/LinkAccountModal';
import ConfirmModal from '../components/ConfirmModal';
import { Plus, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export default function Employees() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');

  // Modal open states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkingEmployee, setLinkingEmployee] = useState(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDanger: false
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        throw new Error('Failed to retrieve the employee records.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Could not fetch records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Listen to url query changes (?action=add)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add' && isAdmin) {
      // Clear query params so it doesn't reopen on refresh
      navigate('/employees', { replace: true });
      handleAddClick();
    }
  }, [location, isAdmin]);

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const doDeleteEmployee = async (empId) => {
    try {
      setErrorMsg('');
      const response = await fetch(`/api/employees/${empId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showNotification('Employee record deleted successfully!', 'success');
        fetchEmployees();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete the employee record.');
      }
    } catch (err) {
      setErrorMsg(err.message);
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteClick = (empId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Employee',
      message: 'Are you sure you want to permanently delete this employee record? This action cannot be undone.',
      isDanger: true,
      onConfirm: () => doDeleteEmployee(empId)
    });
  };

  const handleSaveEmployee = async (formData) => {
    const method = selectedEmployee ? 'PUT' : 'POST';
    const url = selectedEmployee 
      ? `/api/employees/${selectedEmployee.emp_id}` 
      : '/api/employees';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error processing the request.');
      }

      showNotification(
        selectedEmployee 
          ? 'Employee details updated successfully!' 
          : 'New employee record created successfully!', 
        'success'
      );
      // Refresh list
      fetchEmployees();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleLinkClick = (employee) => {
    setLinkingEmployee(employee);
    setIsLinkModalOpen(true);
  };

  const doUnlinkAccount = async (employee) => {
    try {
      setErrorMsg('');
      const response = await fetch(`/api/employees/${employee.emp_id}/unlink`, {
        method: 'POST'
      });

      if (response.ok) {
        showNotification(`Unlinked HRMS account for ${employee.empfname} ${employee.emplname} successfully.`, 'info');
        fetchEmployees();
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to unlink account.');
      }
    } catch (err) {
      setErrorMsg(err.message);
      showNotification(err.message, 'error');
    }
  };

  const handleUnlinkClick = (employee) => {
    setConfirmModal({
      isOpen: true,
      title: 'Unlink Account',
      message: `Are you sure you want to unlink the HRMS account of ${employee.empfname} ${employee.emplname}?`,
      isDanger: true,
      onConfirm: () => doUnlinkAccount(employee)
    });
  };

  const handleLinkAccount = async (userId) => {
    if (!linkingEmployee) return;

    try {
      const response = await fetch(`/api/employees/${linkingEmployee.emp_id}/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to link account.');
      }

      showNotification(
        `Linked employee ${linkingEmployee.empfname} ${linkingEmployee.emplname} successfully.`, 
        'success'
      );
      fetchEmployees();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Filters logic
  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.empfname} ${emp.emplname}`.toLowerCase();
    const email = (emp.empemail || '').toLowerCase();
    const telephone = (emp.emptelephone || '').toLowerCase();
    const matchesSearch = 
      fullName.includes(searchQuery.toLowerCase()) || 
      email.includes(searchQuery.toLowerCase()) ||
      telephone.includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || emp.empstatus === statusFilter;

    const matchesAccount = 
      accountFilter === '' || 
      (accountFilter === 'yes' && !!emp.account_username) || 
      (accountFilter === 'no' && !emp.account_username);

    return matchesSearch && matchesStatus && matchesAccount;
  });

  return (
    <div className="space-y-6 animate-fade-in text-black dark:text-slate-100">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-black dark:text-white">
            {isAdmin ? 'Workforce Database' : 'Staff Directory'}
          </h2>
          <p className="text-[#1e3a8a] dark:text-slate-400 text-sm mt-1">
            {isAdmin 
              ? 'Displaying full registry records, search queries, and dynamic filters for DAB Enterprise LTD.' 
              : 'View contact details and departments of your fellow staff members at DAB Enterprise LTD.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchEmployees}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#f5f5f5] dark:border-slate-800 text-[#1e3a8a] dark:text-slate-400 hover:text-black dark:hover:text-white transition-all duration-200 shadow-sm"
            title="Refresh database"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {isAdmin && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-black dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-semibold transition-all duration-300 shadow-md active:scale-[0.98]"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[#f5f5f5] dark:bg-rose-500/10 border border-[#1e3a8a] dark:border-rose-500/20 text-[#1e3a8a] dark:text-rose-400 text-sm flex gap-3 items-center font-bold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and search bar layout */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md transition-colors duration-300`}>
        
        {/* Search */}
        <div className="relative group col-span-2">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-slate-500 group-focus-within:text-black dark:group-focus-within:text-brand-400 transition-colors duration-200">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAdmin ? "Search by name, email, or telephone..." : "Search fellow staff by name, email..."}
            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 focus:border-[#1e3a8a] dark:focus:border-brand-500 focus:ring-1 focus:ring-[#1e3a8a] rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-all duration-300 shadow-sm"
          />
        </div>

        {/* Filter status */}
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-slate-500 group-focus-within:text-black dark:group-focus-within:text-brand-400 transition-colors duration-200">
            <Filter className="h-4 w-4" />
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 focus:border-[#1e3a8a] dark:focus:border-brand-500 focus:ring-1 focus:ring-[#1e3a8a] rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all duration-300 appearance-none"
          >
            <option value="">Filter Status: All</option>
            <option value="On Mission">On Mission</option>
            <option value="On Leave">On Leave</option>
            <option value="Left">Left</option>
            <option value="Blacklisted">Blacklisted</option>
            <option value="Deceased">Deceased</option>
          </select>
        </div>

        {/* Filter account (Admin-only) */}
        {isAdmin && (
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 dark:text-slate-500 group-focus-within:text-black dark:group-focus-within:text-brand-400 transition-colors duration-200">
              <Filter className="h-4 w-4" />
            </span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 focus:border-[#1e3a8a] dark:focus:border-brand-500 focus:ring-1 focus:ring-[#1e3a8a] rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none transition-all duration-300 appearance-none"
            >
              <option value="">Account Status: All</option>
              <option value="yes">With HRMS Account</option>
              <option value="no">Without HRMS Account</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Employee list table */}
      {loading && employees.length === 0 ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Retrieving registry...</p>
          </div>
        </div>
      ) : (
        <EmployeeTable 
          employees={filteredEmployees}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onLinkClick={handleLinkClick}
          onUnlinkClick={handleUnlinkClick}
        />
      )}

      {/* Slide-over Form Modal */}
      <EmployeeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
      />

      {/* Link Account Modal */}
      <LinkAccountModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false);
          setLinkingEmployee(null);
        }}
        employee={linkingEmployee}
        onLink={handleLinkAccount}
      />

      {/* Reusable Action Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={confirmModal.isDanger}
      />
    </div>
  );
}
