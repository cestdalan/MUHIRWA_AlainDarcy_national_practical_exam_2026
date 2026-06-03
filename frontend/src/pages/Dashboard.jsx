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
  Heart,
  Printer,
  FileText,
  AlertCircle,
  CheckCircle,
  Construction
} from 'lucide-react';

const STATUS_BADGES = {
  'On Mission': 'bg-white border-[#1e3a8a] text-[#1e3a8a] dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
  'On Leave': 'bg-white border-black text-black dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
  'Left': 'bg-black border-black text-white dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/25',
  'Blacklisted': 'bg-[#1e3a8a] border-[#1e3a8a] text-white dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25',
  'Deceased': 'bg-[#f5f5f5] border-[#1e3a8a] text-[#1e3a8a] dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/25'
};

export default function Dashboard() {
  const { user: currentUser, checkSession, refreshUser } = useAuth();
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

  // Self-Service Link Request States
  const [pendingRequest, setPendingRequest] = useState(null);
  const [unlinkedEmployees, setUnlinkedEmployees] = useState([]);
  const [fetchingUnlinked, setFetchingUnlinked] = useState(false);
  const [requestingEmpId, setRequestingEmpId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [pendingRequests, setPendingRequests] = useState([]);
  const [actingRequestId, setActingRequestId] = useState(null);

  // Report Generator States
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [activeReport, setActiveReport] = useState(null);
  const [fetchingReport, setFetchingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/link-requests/all-pending');
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (err) {
      console.error('Failed to load pending requests:', err);
    }
  };

  const fetchPendingAndUnlinked = async () => {
    try {
      setFetchingUnlinked(true);
      setErrorMsg('');
      const reqRes = await fetch('/api/link-requests/my-pending');
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setPendingRequest(reqData);
        
        if (!reqData) {
          const empRes = await fetch('/api/employees/unlinked');
          if (empRes.ok) {
            const empData = await empRes.json();
            setUnlinkedEmployees(empData);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching link request data:', err);
    } finally {
      setFetchingUnlinked(false);
    }
  };

  const handleRequestLink = async (empId) => {
    setRequestingEmpId(empId);
    setErrorMsg('');
    try {
      const response = await fetch('/api/link-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId })
      });
      if (response.ok) {
        await fetchPendingAndUnlinked();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit link request.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setRequestingEmpId(null);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setActingRequestId(requestId);
    try {
      const res = await fetch(`/api/link-requests/${requestId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        await Promise.all([
          fetchPendingRequests(),
          fetchStatusReport()
        ]);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve request.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActingRequestId(null);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setActingRequestId(requestId);
    try {
      const res = await fetch(`/api/link-requests/${requestId}/reject`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchPendingRequests();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reject request.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActingRequestId(null);
    }
  };

  const fetchStatusReport = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const [statusRes, empRes] = await Promise.all([
          fetch('/api/reports/status'),
          fetch('/api/employees'),
          fetchPendingRequests()
        ]);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setStatusReport(statusData);
        }
        
        if (empRes.ok) {
          const empData = await empRes.json();
          setTotalEmployees(empData.length);
          setEmployees(empData);
        }
      } else if (!currentUser?.emp_id) {
        await fetchPendingAndUnlinked();
      }
    } catch (err) {
      console.error('Failed to load dashboard report statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEmployee = async (empId) => {
    setSelectedEmpId(empId);
    if (!empId) {
      setActiveReport(null);
      return;
    }

    if (empId === 'all') {
      const summaryReport = {
        reportGeneratedDate: new Date().toISOString().split('T')[0],
        totalCount: employees.length,
        statusBreakdown: {
          'On Mission': employees.filter(e => e.empstatus === 'On Mission').length,
          'On Leave': employees.filter(e => e.empstatus === 'On Leave').length,
          'Left': employees.filter(e => e.empstatus === 'Left').length,
          'Blacklisted': employees.filter(e => e.empstatus === 'Blacklisted').length,
          'Deceased': employees.filter(e => e.empstatus === 'Deceased').length,
        },
        records: employees
      };
      setActiveReport(summaryReport);
      return;
    }

    try {
      setFetchingReport(true);
      setReportError('');
      const response = await fetch(`/api/reports/employee/${empId}`);
      if (response.ok) {
        const data = await response.json();
        setActiveReport(data);
      } else {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate report for the selected employee.');
      }
    } catch (err) {
      console.error(err);
      setReportError(err.message);
      setActiveReport(null);
    } finally {
      setFetchingReport(false);
    }
  };

  useEffect(() => {
    fetchStatusReport();

    let intervalId;
    if (currentUser) {
      if (currentUser.role === 'Admin') {
        // Poll for new requests on Admin side
        intervalId = setInterval(() => {
          fetchPendingRequests();
        }, 4000);
      } else if (currentUser.role === 'Staff') {
        if (!currentUser.emp_id) {
          // Poll for status on unlinked Staff side
          intervalId = setInterval(async () => {
            const res = await fetch('/api/me');
            if (res.ok) {
              const data = await res.json();
              if (data.user && data.user.emp_id) {
                // User has been approved and linked!
                await checkSession();
              } else {
                // Otherwise, update request status in case they got rejected/cancelled
                const reqRes = await fetch('/api/link-requests/my-pending');
                if (reqRes.ok) {
                  const reqData = await reqRes.json();
                  setPendingRequest(reqData);
                  if (!reqData) {
                    // If request was deleted or rejected, fetch unlinked list
                    const empRes = await fetch('/api/employees/unlinked');
                    if (empRes.ok) {
                      const empData = await empRes.json();
                      setUnlinkedEmployees(empData);
                    }
                  }
                }
              }
            }
          }, 3000);
        } else {
          // Poll for profile detail updates quietly on linked Staff side
          intervalId = setInterval(async () => {
            await refreshUser();
          }, 4000);
        }
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentUser?.emp_id, currentUser?.user_id]);

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
      <div className="p-8 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300 shadow-sm no-print">
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-5 no-print">
          <StatusCard status="On Mission" count={statusReport['On Mission']} />
          <StatusCard status="On Leave" count={statusReport['On Leave']} />
          <StatusCard status="Left" count={statusReport['Left']} />
          <StatusCard status="Blacklisted" count={statusReport['Blacklisted']} />
          <StatusCard status="Deceased" count={statusReport['Deceased']} />
        </div>
      )}

      {/* Conditional Layout: Admin Stats vs Staff Profile */}
      {!isAdmin ? (
        !currentUser?.emp_id ? (
          pendingRequest ? (
            // ==========================================
            // WAITING FOR APPROVAL LOADER VIEW
            // ==========================================
            <div className="w-full p-8 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6 text-center animate-pulse py-16">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Waiting for Admin Approval</h3>
                <p className="text-xs text-gray-500 dark:text-slate-450 leading-relaxed">
                  Your request to link with <strong className="text-[#1e3a8a] dark:text-brand-400">{pendingRequest.empfname} {pendingRequest.emplname}</strong> (DAB-EMP-00{pendingRequest.emp_id}) is currently pending review by the administrator.
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-slate-800 text-[10px] text-gray-400 uppercase tracking-widest font-extrabold max-w-sm mx-auto">
                HRMS System Link Pending • Updates dynamically
              </div>
            </div>
          ) : (
            // ==========================================
            // SELECT UNLINKED EMPLOYEE VIEW
            // ==========================================
            <div className="w-full p-8 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl space-y-6 max-w-3xl mx-auto">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">Link Your HRMS Account</h3>
                <p className="text-xs text-gray-500 dark:text-slate-450 mt-1">
                  Your user account is not linked to any employee record. Please find your name in the list below and click the button to request a link.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-750 dark:text-rose-400 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              {fetchingUnlinked ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <div className="w-8 h-8 border-3 border-[#1e3a8a]/20 border-t-[#1e3a8a] rounded-full animate-spin"></div>
                  <p className="text-xs text-gray-500 dark:text-slate-450">Loading unlinked employee records...</p>
                </div>
              ) : unlinkedEmployees.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-550 font-semibold leading-relaxed">
                  No unlinked employee records found in the database. <br />
                  Please ask your HR Administrator to create your employee profile.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-slate-800 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-950/40">
                  {unlinkedEmployees.map((emp) => (
                    <div key={emp.emp_id} className="flex items-center justify-between p-4.5 hover:bg-white dark:hover:bg-slate-900 transition-colors duration-200">
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">{emp.empfname} {emp.emplname}</h4>
                        <p className="text-[10px] text-[#1e3a8a] dark:text-brand-400 font-bold uppercase tracking-wider mt-0.5">
                          {emp.posname || 'No Position'} • {emp.d_name || 'No Department'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRequestLink(emp.emp_id)}
                        disabled={requestingEmpId === emp.emp_id}
                        className="px-4 py-2 rounded-xl bg-[#1e3a8a] dark:bg-brand-600 hover:bg-black dark:hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition-all duration-200 disabled:opacity-50"
                      >
                        {requestingEmpId === emp.emp_id ? 'Requesting...' : 'Request Link'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ) : (
          // ==========================================
          // STAFF PERSONAL PROFILE VIEW - SINGLE BIG CARD
          // ==========================================
          <div className="w-full p-8 rounded-3xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-8 animate-slide-up shadow-xl transition-colors duration-300">

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
          <div className="pt-5 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs text-gray-550 dark:text-slate-500">
            <span>DAB Enterprise LTD Kigali Headquarters • Administrative Profile Database</span>
            <span className="font-bold text-[#1e3a8a] dark:text-brand-400 uppercase tracking-wider">Verified Employee Account</span>
          </div>
        </div>
        )
      ) : (
        // ==========================================
        // ADMIN ANALYTICS & REPORTS SECTION
        // ==========================================
        <div className="space-y-8 no-print-section">
          {/* Pending Link Requests Notifications - Admin Only */}
          {pendingRequests.length > 0 && (
            <div className="p-6 rounded-3xl border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm animate-slide-up no-print">
              <div className="flex items-center justify-between border-b border-gray-150 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a] dark:bg-brand-500 animate-pulse"></span>
                  Pending Link Account Requests ({pendingRequests.length})
                </h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">Requires Action</p>
              </div>
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div key={req.request_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-slate-950/40 border border-gray-150 dark:border-slate-800 rounded-2xl gap-4">
                    <div>
                      <p className="text-xs text-gray-700 dark:text-slate-350">
                        User <strong className="text-gray-900 dark:text-white font-bold">@{req.username}</strong> requested to link their account to employee:
                      </p>
                      <h4 className="font-extrabold text-sm text-[#1e3a8a] dark:text-brand-400 mt-1">
                        {req.empfname} {req.emplname} (DAB-EMP-00{req.emp_id})
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-0.5">
                        Position: {req.posname || 'N/A'} • Department: {req.d_name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      <button
                        disabled={actingRequestId === req.request_id}
                        onClick={() => handleRejectRequest(req.request_id)}
                        className="px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-slate-450 font-bold text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        disabled={actingRequestId === req.request_id}
                        onClick={() => handleApproveRequest(req.request_id)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1e3a8a] dark:bg-brand-600 hover:bg-black dark:hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
                      >
                        {actingRequestId === req.request_id ? 'Approving...' : 'Approve & Link'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
            {/* Total Workforce */}
            <div className="p-6 rounded-2xl border border-[#f5f5f5] dark:border-slate-800/80 glass-card flex items-center justify-between bg-gradient-to-br from-[#1e3a8a]/5 to-[#f5f5f5] dark:from-brand-600/5 dark:to-slate-900/10 transition-colors duration-300 shadow-sm">
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
            <div className="p-6 rounded-2xl border border-[#f5f5f5] dark:border-slate-800/80 glass-card flex items-center justify-between transition-colors duration-300 shadow-sm">
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
            <div className="p-6 rounded-2xl border border-[#f5f5f5] dark:border-slate-800/80 glass-card flex items-center justify-between transition-colors duration-300 shadow-sm">
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

          {/* Workforce Report Center */}
          <div className="p-8 rounded-3xl border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-all duration-300 printable-report-card-parent">
            
            {/* Report Header Select Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 dark:border-slate-800 pb-5 mb-6 no-print">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5.5 w-5.5 text-[#1e3a8a] dark:text-brand-400" />
                  Workforce Report Center
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-450 mt-1">
                  Generate, preview, and print official personnel employment record reports.
                </p>
              </div>

              {/* Dropdown Selector */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs font-bold text-gray-600 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Employee:</span>
                <select
                  value={selectedEmpId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full md:w-64 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 focus:border-[#1e3a8a] dark:focus:border-brand-500 focus:ring-1 focus:ring-[#1e3a8a] rounded-xl px-4 py-2.5 text-xs text-gray-900 dark:text-white font-semibold outline-none transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Employee --</option>
                  <option value="all">-- All Employees Summary --</option>
                  {employees.map((emp) => (
                    <option key={emp.emp_id} value={emp.emp_id}>
                      {emp.empfname} {emp.emplname} (DAB-EMP-00{emp.emp_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Display States */}
            {fetchingReport ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-3 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold">Generating personnel record report...</p>
              </div>
            ) : reportError ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{reportError}</span>
              </div>
            ) : activeReport ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Print Control Bar */}
                <div className="flex justify-end no-print">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-black dark:bg-brand-600 dark:hover:bg-brand-500 text-white font-bold text-xs tracking-wide transition-all duration-300 shadow-md active:scale-[0.98]"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print Formal Report</span>
                  </button>
                </div>
                
                {/* Printable Report Wrapper */}
                <div 
                  id="printable-employee-report" 
                  className="p-8 rounded-2xl border border-gray-150 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/40 text-black dark:text-slate-100"
                >
                  {selectedEmpId === 'all' ? (
                    // ==========================================
                    // ALL EMPLOYEES DIRECTORY SUMMARY REPORT
                    // ==========================================
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-gray-300 dark:border-slate-850 pb-6 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#1e3a8a] text-white p-3 rounded-2xl flex items-center justify-center shadow-md">
                            <Construction className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">DAB ENTERPRISE LTD</h4>
                            <p className="text-[10px] text-gray-500 dark:text-slate-500 font-extrabold uppercase tracking-wider">Kigali Headquarters • Rwanda</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <h5 className="text-xs font-black uppercase text-[#1e3a8a] dark:text-brand-400 tracking-wider">All-Personnel Summary Report</h5>
                          <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-1 font-medium">Generated: {activeReport.reportGeneratedDate}</p>
                          <p className="text-[9px] text-gray-400 dark:text-slate-600 font-semibold mt-0.5">Total Records: {activeReport.totalCount} employees</p>
                        </div>
                      </div>

                      {/* Statistics Summary widgets in print block */}
                      <div className="grid grid-cols-5 gap-4 p-5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl mb-6 shadow-sm">
                        <div className="text-center border-r border-gray-150 dark:border-slate-800 last:border-0 pr-2">
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">On Mission</p>
                          <h6 className="text-lg font-black text-gray-900 dark:text-white mt-1">{activeReport.statusBreakdown['On Mission']}</h6>
                        </div>
                        <div className="text-center border-r border-gray-150 dark:border-slate-800 last:border-0 pr-2">
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">On Leave</p>
                          <h6 className="text-lg font-black text-gray-900 dark:text-white mt-1">{activeReport.statusBreakdown['On Leave']}</h6>
                        </div>
                        <div className="text-center border-r border-gray-150 dark:border-slate-800 last:border-0 pr-2">
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Left</p>
                          <h6 className="text-lg font-black text-gray-900 dark:text-white mt-1">{activeReport.statusBreakdown['Left']}</h6>
                        </div>
                        <div className="text-center border-r border-gray-150 dark:border-slate-800 last:border-0 pr-2">
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Blacklisted</p>
                          <h6 className="text-lg font-black text-gray-900 dark:text-white mt-1">{activeReport.statusBreakdown['Blacklisted']}</h6>
                        </div>
                        <div className="text-center last:border-0 pr-2">
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Deceased</p>
                          <h6 className="text-lg font-black text-gray-900 dark:text-white mt-1">{activeReport.statusBreakdown['Deceased']}</h6>
                        </div>
                      </div>

                      {/* Directory Table */}
                      <div className="w-full overflow-x-auto rounded-2xl border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-250 dark:divide-slate-800">
                          <thead>
                            <tr className="bg-gray-50 dark:bg-slate-950 text-gray-700 dark:text-slate-300">
                              <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">ID</th>
                              <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">Employee Name</th>
                              <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">Gender</th>
                              <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">Department</th>
                              <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">Position</th>
                              <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">Hire Date</th>
                              <th scope="col" className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-xs">
                            {activeReport.records.map((emp) => (
                              <tr key={emp.emp_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                                <td className="px-4 py-3.5 font-bold text-gray-550 dark:text-slate-500">DAB-EMP-00{emp.emp_id}</td>
                                <td className="px-4 py-3.5 font-extrabold text-gray-900 dark:text-white">{emp.empfname} {emp.emplname}</td>
                                <td className="px-4 py-3.5 text-gray-650 dark:text-slate-400">{emp.empgender}</td>
                                <td className="px-4 py-3.5 font-bold text-[#1e3a8a] dark:text-brand-400">{emp.d_name || 'N/A'}</td>
                                <td className="px-4 py-3.5 text-gray-700 dark:text-slate-300">{emp.posname || 'N/A'}</td>
                                <td className="px-4 py-3.5 text-gray-655 dark:text-slate-450">{emp.emphiredate}</td>
                                <td className="px-4 py-3.5">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                                    STATUS_BADGES[emp.empstatus] || 'bg-white border-[#1e3a8a] text-[#1e3a8a]'
                                  }`}>
                                    {emp.empstatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Certification Footer */}
                      <div className="mt-8 pt-6 border-t border-gray-300 dark:border-slate-855 flex justify-between items-end text-[9px] text-gray-500 dark:text-slate-500">
                        <div>
                          <p className="font-extrabold uppercase text-[#1e3a8a] dark:text-brand-400">DAB Enterprise HR Division</p>
                          <p className="mt-1">Kigali Administrative HQ, Rwanda</p>
                          <p className="text-gray-400 mt-0.5">Verified database record. Signature not required.</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">STATUS REPORT PAGE 1 OF 1</p>
                          <p className="mt-1">DAB Enterprise LTD © 2026</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // ==========================================
                    // SINGLE EMPLOYEE PERSONNEL REPORT
                    // ==========================================
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-gray-300 dark:border-slate-850 pb-6 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#1e3a8a] text-white p-3 rounded-2xl flex items-center justify-center shadow-md">
                            <Construction className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">DAB ENTERPRISE LTD</h4>
                            <p className="text-[10px] text-gray-500 dark:text-slate-500 font-extrabold uppercase tracking-wider">Kigali Headquarters • Rwanda</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <h5 className="text-xs font-black uppercase text-[#1e3a8a] dark:text-brand-400 tracking-wider">Official Personnel Report</h5>
                          <p className="text-[10px] text-gray-500 dark:text-slate-500 mt-1 font-medium">Generated: {activeReport.reportGeneratedDate}</p>
                          <p className="text-[9px] text-gray-400 dark:text-slate-600 font-semibold mt-0.5">Reference ID: DAB-REP-00{activeReport.employeeInfo.id}</p>
                        </div>
                      </div>

                      {/* Employee Title Banner */}
                      <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl mb-6 shadow-sm">
                        <div className="h-16 w-16 rounded-2xl bg-[#1e3a8a] dark:bg-brand-600 flex items-center justify-center font-black text-white text-2xl shadow-inner shrink-0 uppercase">
                          {activeReport.employeeInfo.firstName[0]}{activeReport.employeeInfo.lastName[0]}
                        </div>
                        <div className="text-center sm:text-left flex-1">
                          <h4 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
                            {activeReport.employeeInfo.fullName}
                          </h4>
                          <p className="text-xs text-[#1e3a8a] dark:text-brand-400 font-bold mt-1 uppercase tracking-wider">
                            {activeReport.jobInfo.position} • {activeReport.jobInfo.department}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border ${
                            STATUS_BADGES[activeReport.jobInfo.status] || 'bg-white border-[#1e3a8a] text-[#1e3a8a]'
                          }`}>
                            {activeReport.jobInfo.status}
                          </span>
                        </div>
                      </div>

                      {/* Information Sections Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Personnel Info */}
                        <div className="space-y-4 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                          <h5 className="text-xs font-black text-[#1e3a8a] dark:text-brand-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-850 pb-2 mb-4">
                            Personnel Information
                          </h5>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">First Name</p>
                              <p className="font-bold text-gray-900 dark:text-white mt-0.5">{activeReport.employeeInfo.firstName}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Last Name</p>
                              <p className="font-bold text-gray-900 dark:text-white mt-0.5">{activeReport.employeeInfo.lastName}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Gender</p>
                              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{activeReport.employeeInfo.gender}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Date of Birth</p>
                              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{activeReport.employeeInfo.dateOfBirth}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Contact Phone</p>
                              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{activeReport.employeeInfo.telephone}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Email Address</p>
                              <p className="font-semibold text-gray-950 dark:text-white mt-0.5">{activeReport.employeeInfo.email}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Residential Address</p>
                              <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{activeReport.employeeInfo.address}</p>
                            </div>
                          </div>
                        </div>

                        {/* Employment Info */}
                        <div className="space-y-4 bg-white dark:bg-slate-900 border border-gray-250 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                          <div>
                            <h5 className="text-xs font-black text-[#1e3a8a] dark:text-brand-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-850 pb-2 mb-4">
                              Employment Details
                            </h5>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Department</p>
                                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{activeReport.jobInfo.department}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Date of Hire</p>
                                <p className="font-bold text-gray-900 dark:text-white mt-0.5">{activeReport.jobInfo.hireDate}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Assigned Position</p>
                                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{activeReport.jobInfo.position}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Required Qualification</p>
                                <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{activeReport.jobInfo.requiredQualification}</p>
                              </div>
                            </div>
                          </div>

                          {/* Account Link Indicator */}
                          <div className="pt-4 border-t border-gray-100 dark:border-slate-850 mt-4">
                            <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-950 p-3.5 rounded-xl border border-gray-250 dark:border-slate-800">
                              <div>
                                <p className="text-[9px] text-gray-455 dark:text-slate-500 font-bold uppercase tracking-wider">HRMS System Link</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
                                  {activeReport.systemInfo.hasHRMSAccount ? `Linked: @${activeReport.systemInfo.username}` : 'No System Account'}
                                </p>
                              </div>
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                activeReport.systemInfo.hasHRMSAccount ? 'bg-emerald-550 dark:bg-emerald-500 animate-pulse' : 'bg-gray-400'
                              }`} />
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Certification Footer */}
                      <div className="mt-8 pt-6 border-t border-gray-300 dark:border-slate-855 flex justify-between items-end text-[9px] text-gray-500 dark:text-slate-500">
                        <div>
                          <p className="font-extrabold uppercase text-[#1e3a8a] dark:text-brand-400">DAB Enterprise HR Division</p>
                          <p className="mt-1">Kigali Administrative HQ, Rwanda</p>
                          <p className="text-gray-400 mt-0.5">Verified database record. Signature not required.</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">STATUS REPORT PAGE 1 OF 1</p>
                          <p className="mt-1">DAB Enterprise LTD © 2026</p>
                        </div>
                      </div>
                    </div>
                  )}
                 </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-2xl transition-colors duration-300">
                <FileText className="h-10 w-10 text-gray-400 dark:text-slate-600 mb-3" />
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Please choose an employee from the dropdown list above to generate their personnel report.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
