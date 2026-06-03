import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusCard from '../components/StatusCard';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Building2, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Heart
} from 'lucide-react';

const STATUS_BADGES = {
  'On Mission': 'bg-white border-[#1e3a8a] text-[#1e3a8a] dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
  'On Leave': 'bg-white border-black text-black dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
  'Left': 'bg-black border-black text-white dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/25',
  'Blacklisted': 'bg-[#1e3a8a] border-[#1e3a8a] text-white dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25',
  'Deceased': 'bg-[#f5f5f5] border-[#1e3a8a] text-[#1e3a8a] dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/25'
};

export default function Dashboard() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'Admin';

  const [statusReport, setStatusReport] = useState({
    'On Mission': 0,
    'On Leave': 0,
    'Left': 0,
    'Blacklisted': 0,
    'Deceased': 0
  });
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const fetchStatusReport = async () => {
    try {
      setLoading(true);
      const [statusRes, empRes] = await Promise.all([
        fetch('/api/reports/status'),
        fetch('/api/employees')
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatusReport(statusData);
      }
      
      if (empRes.ok) {
        const empData = await empRes.json();
        setTotalEmployees(empData.length);
      }
    } catch (err) {
      console.error('Failed to load dashboard report statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusReport();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          <p className="text-[#1e3a8a] dark:text-slate-400 text-sm font-semibold">Loading HRMS Reports...</p>
        </div>
      </div>
    );
  }

  // Determine user display name: e.g. "Alain Darcy Muhirwa" or "Divine Keza"
  const welcomeName = currentUser?.empfname 
    ? `${currentUser.empfname} ${currentUser.emplname}` 
    : (currentUser?.username || 'Guest');

  return (
    <div className="space-y-8 animate-fade-in text-black dark:text-slate-100">
      
      {/* Welcome Banner Header */}
      <div className="p-8 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            Welcome Back, {welcomeName}!
          </h2>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
            Monitoring the workforce of <strong className="text-[#1e3a8a] dark:text-brand-400">DAB Enterprise LTD</strong> from Kigali headquarters.
          </p>
        </div>
        <div className="flex items-center gap-3.5">
          <Link
            to="/employees"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-[#1e3a8a] dark:text-slate-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm"
          >
            <Users className="h-4.5 w-4.5" />
            <span>{isAdmin ? 'View Database' : 'View Staff'}</span>
          </Link>
          {isAdmin && (
            <Link
              to="/employees?action=add"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] dark:bg-brand-600 text-white font-semibold hover:bg-black dark:hover:bg-brand-500 transition-colors duration-200 shadow-md"
            >
              <UserPlus className="h-4.5 w-4.5" />
              <span>Add Employee</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Aggregated Metrics Grid - ADMIN ONLY */}
      {isAdmin && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
          <StatusCard status="On Mission" count={statusReport['On Mission']} />
          <StatusCard status="On Leave" count={statusReport['On Leave']} />
          <StatusCard status="Left" count={statusReport['Left']} />
          <StatusCard status="Blacklisted" count={statusReport['Blacklisted']} />
          <StatusCard status="Deceased" count={statusReport['Deceased']} />
        </div>
      )}

      {/* Conditional Layout: Admin Stats vs Staff Profile */}
      {!isAdmin ? (
        // ==========================================
        // STAFF PERSONAL PROFILE VIEW - SINGLE BIG CARD
        // ==========================================
        <div className="w-full p-8 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-8 animate-slide-up shadow-xl transition-colors duration-300">
          
          {/* Warn unlinked staff */}
          {!currentUser?.emp_id && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-amber-850 dark:text-amber-400 text-xs font-semibold animate-pulse">
              ⚠️ Your account is not yet linked to an employee profile. Please ask the administrator to link your profile to your employee record.
            </div>
          )}

          {/* Card Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-[#1e3a8a] dark:bg-brand-600 flex items-center justify-center font-extrabold text-white text-2xl shadow-inner shrink-0">
                {currentUser?.empfname && currentUser?.emplname
                  ? `${currentUser.empfname[0]}${currentUser.emplname[0]}`
                  : (currentUser?.username?.slice(0, 2).toUpperCase() || 'ST')}
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  {currentUser?.empfname && currentUser?.emplname
                    ? `${currentUser.empfname} ${currentUser.emplname}`
                    : (currentUser?.username || 'Staff User')}
                </h3>
                <p className="text-sm text-[#1e3a8a] dark:text-slate-400 font-semibold mt-1">
                  {currentUser?.posname || 'Unassigned Position'} • {currentUser?.d_name || 'Unassigned Department'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-slate-400">Status:</span>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border ${
                STATUS_BADGES[currentUser?.empstatus] || 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
              }`}>
                {currentUser?.empstatus || 'Active'}
              </span>
            </div>
          </div>

          {/* Detailed Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* HIRE DATE CALLOUT COLUMN (High prominence) */}
            <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800/80 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] text-[#1e3a8a] dark:text-slate-400 font-extrabold uppercase tracking-wider">Employment Commenced</span>
                <h4 className="text-xs font-bold text-gray-500 dark:text-slate-500 uppercase">Date of Hire</h4>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1 border-b border-gray-150 dark:border-slate-800/60 pb-2">
                  {currentUser?.emphiredate || 'Not Linked'}
                </p>
              </div>
              <div className="mt-4 text-[11px] text-[#1e3a8a] dark:text-slate-500 space-y-1.5">
                <p>💳 <strong className="text-gray-700 dark:text-slate-300 font-bold">Employee ID:</strong> {currentUser?.emp_id ? `DAB-EMP-00${currentUser.emp_id}` : 'Unassigned'}</p>
                <p>💼 <strong className="text-gray-700 dark:text-slate-300 font-bold">System Role:</strong> {currentUser?.role || 'Staff'}</p>
              </div>
            </div>

            {/* CONTACT INFO COLUMN */}
            <div className="space-y-5">
              <h4 className="text-xs font-black text-[#1e3a8a] dark:text-slate-400 uppercase tracking-wider">Contact Details</h4>
              
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#1e3a8a] dark:text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{currentUser?.empemail || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#1e3a8a] dark:text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider">Telephone Number</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{currentUser?.emptelephone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#1e3a8a] dark:text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider">Residential Address</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{currentUser?.empaddress || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* PERSONAL DETAILS COLUMN */}
            <div className="space-y-5">
              <h4 className="text-xs font-black text-[#1e3a8a] dark:text-slate-400 uppercase tracking-wider">Personal Information</h4>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-[#1e3a8a] dark:text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider">Date of Birth</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{currentUser?.empdob || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[#1e3a8a] dark:text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider">Gender</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{currentUser?.empgender || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-[#1e3a8a] dark:text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase tracking-wider">Assigned Position Details</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-0.5">{currentUser?.posname || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kigali HQ notice at bottom */}
          <div className="pt-5 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-500">
            <span>DAB Enterprise LTD Kigali Headquarters • Administrative Profile Database</span>
            <span className="font-bold text-[#1e3a8a] dark:text-brand-400 uppercase tracking-wider">Verified Employee Account</span>
          </div>
        </div>
      ) : (
        // ==========================================
        // ADMIN ANALYTICS HIGHLIGHTS
        // ==========================================
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Workforce */}
          <div className="p-6 rounded-2xl border border-[#f5f5f5] dark:border-slate-800/80 glass-card flex items-center justify-between bg-gradient-to-br from-[#1e3a8a]/5 to-[#f5f5f5] dark:from-brand-600/5 dark:to-slate-900/10">
            <div>
              <p className="text-black/65 dark:text-slate-400 text-sm font-semibold">Total Registered Workforce</p>
              <h4 className="text-3xl font-extrabold text-black dark:text-white mt-1.5">{totalEmployees}</h4>
              <p className="text-[10px] text-[#1e3a8a] dark:text-brand-400 font-bold mt-1 uppercase tracking-wider">Overall database personnel</p>
            </div>
            <div className="p-4 rounded-xl bg-[#f5f5f5] dark:bg-brand-500/10 border border-[#1e3a8a]/10 dark:border-brand-500/20 text-[#1e3a8a] dark:text-brand-400">
              <Users className="h-6 w-6" />
            </div>
          </div>

          {/* Kigali Operations */}
          <div className="p-6 rounded-2xl border border-[#f5f5f5] dark:border-slate-800/80 glass-card flex items-center justify-between">
            <div>
              <p className="text-black/65 dark:text-slate-400 text-sm font-semibold">HQ Location</p>
              <h4 className="text-xl font-bold text-black dark:text-white mt-2">Kigali, Rwanda</h4>
              <p className="text-[10px] text-[#1e3a8a] dark:text-slate-500 font-semibold mt-1 uppercase tracking-wider">DAB Enterprise LTD Center</p>
            </div>
            <div className="p-4 rounded-xl bg-[#f5f5f5] dark:bg-slate-800 border border-[#f5f5f5] dark:border-slate-700 text-[#1e3a8a] dark:text-slate-300">
              <Building2 className="h-6 w-6" />
            </div>
          </div>

          {/* Operational Status */}
          <div className="p-6 rounded-2xl border border-[#f5f5f5] dark:border-slate-800/80 glass-card flex items-center justify-between">
            <div>
              <p className="text-black/65 dark:text-slate-400 text-sm font-semibold">Operational Health</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">Fully Automated</span>
              </div>
              <p className="text-[10px] text-[#1e3a8a] dark:text-slate-500 font-semibold mt-1 uppercase tracking-wider">Transitioned from Manual</p>
            </div>
            <div className="p-4 rounded-xl bg-[#f5f5f5] dark:bg-slate-800 border border-[#f5f5f5] dark:border-slate-700 text-[#1e3a8a] dark:text-slate-300">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
