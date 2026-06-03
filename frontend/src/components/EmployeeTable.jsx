import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Pencil, 
  Trash2, 
  ShieldAlert, 
  Link as LinkIcon, 
  Unlink as UnlinkIcon, 
  FileText, 
  Phone, 
  Calendar, 
  User as UserIcon, 
  MapPin, 
  Briefcase 
} from 'lucide-react';

const STATUS_STYLES = {
  'On Mission': {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    dot: 'bg-emerald-500 dark:bg-emerald-450 animate-pulse'
  },
  'On Leave': {
    bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    dot: 'bg-amber-500 dark:bg-amber-450'
  },
  'Left': {
    bg: 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700',
    dot: 'bg-gray-400'
  },
  'Blacklisted': {
    bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-500/20',
    dot: 'bg-rose-600 dark:bg-rose-500 animate-ping'
  },
  'Deceased': {
    bg: 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-550 border-slate-300 dark:border-slate-850',
    dot: 'bg-slate-500'
  }
};



export default function EmployeeTable({ employees, onEdit, onDelete, onLinkClick, onUnlinkClick, onReport }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  if (employees.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-gray-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-slate-900 shadow-sm animate-fade-in transition-all duration-300">
        <ShieldAlert className="h-10 w-10 text-[#1e3a8a] dark:text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-black text-gray-900 dark:text-white">No employees found</h3>
        <p className="text-gray-500 dark:text-slate-400 text-xs mt-1">There are no employee records matching your filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-gray-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg transition-all duration-300 animate-fade-in">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-150 dark:divide-slate-800">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-950/50 text-gray-500 dark:text-slate-450 border-b border-gray-150 dark:border-slate-800/60 transition-colors duration-300">
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">Employee</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">Contact & Bio</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">Job Placement</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">Address & Hired</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">Status</th>
              {isAdmin && (
                <th scope="col" className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider">HRMS Link</th>
              )}
              {isAdmin && (
                <th scope="col" className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/40 bg-white dark:bg-slate-900 transition-colors duration-300">
            {employees.map((emp, index) => {
              const statusInfo = STATUS_STYLES[emp.empstatus] || STATUS_STYLES['On Mission'];

              return (
                <tr 
                  key={emp.emp_id} 
                  className="hover:bg-blue-50/20 dark:hover:bg-slate-800/20 transition-all duration-200 group"
                >
                  {/* Name & Email column */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-blue-650 dark:from-brand-600 dark:to-blue-550 flex items-center justify-center font-black text-white text-sm shadow-md transition-transform duration-300 group-hover:scale-105 select-none shrink-0">
                        {emp.empfname ? emp.empfname[0].toUpperCase() : ''}{emp.emplname ? emp.emplname[0].toUpperCase() : ''}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-gray-900 dark:text-white group-hover:text-[#1e3a8a] dark:group-hover:text-brand-400 transition-colors duration-200">
                          {emp.empfname} {emp.emplname}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5 font-semibold">
                          {emp.empemail}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Phone & Bio Details */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-slate-300 font-bold">
                        <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                        <span>{emp.emptelephone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-550 dark:text-slate-400">
                        <UserIcon className="h-3 w-3 text-gray-400 dark:text-slate-500 shrink-0" />
                        <span>{emp.empgender} • Born: {emp.empdob}</span>
                      </div>
                    </div>
                  </td>

                  {/* Position & Department */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs text-gray-900 dark:text-white font-extrabold flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-brand-450 shrink-0" />
                        <span>{emp.posname || 'Unassigned Position'}</span>
                      </div>
                      <div className="text-[10px] text-[#1e3a8a] dark:text-brand-400 font-black uppercase tracking-wider ml-5">
                        {emp.d_name || 'Unassigned Department'}
                      </div>
                    </div>
                  </td>

                  {/* Address & Hire Date */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-800 dark:text-slate-350 font-bold">
                        <Calendar className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                        <span>Hired: {emp.emphiredate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-550 dark:text-slate-400 max-w-[170px] truncate" title={emp.empaddress}>
                        <MapPin className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{emp.empaddress}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badges */}
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider shadow-sm transition-all duration-300 ${statusInfo.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      <span>{emp.empstatus}</span>
                    </span>
                  </td>

                  {/* HRMS Account Indicator */}
                  {isAdmin && (
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      {emp.account_username ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>@{emp.account_username}</span>
                          </span>
                          <button
                            onClick={() => onUnlinkClick(emp)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:text-rose-450 dark:hover:bg-rose-500/10 transition-colors"
                            title="Unlink Account"
                          >
                            <UnlinkIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            <span>No Account</span>
                          </span>
                          <button
                            onClick={() => onLinkClick(emp)}
                            className="p-1 rounded-lg text-[#1e3a8a] hover:bg-gray-150 dark:text-brand-400 dark:hover:bg-slate-850 transition-colors"
                            title="Link Account"
                          >
                            <LinkIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}

                  {/* Conditionally Visible Admin Actions */}
                  {isAdmin && (
                    <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button
                          onClick={() => onEdit(emp)}
                          className="p-2 rounded-xl bg-white hover:bg-blue-50 border border-gray-200 text-gray-600 hover:text-[#1e3a8a] dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-200 hover:shadow-sm"
                          title="Edit Employee"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {onReport && (
                          <button
                            onClick={() => onReport(emp)}
                            className="p-2 rounded-xl bg-white hover:bg-blue-50 border border-gray-200 text-gray-600 hover:text-[#1e3a8a] dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-all duration-200 hover:shadow-sm"
                            title="Generate Employee Report"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(emp.emp_id)}
                          className="p-2 rounded-xl bg-white hover:bg-rose-50 border border-gray-200 text-gray-600 hover:text-rose-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-450 transition-all duration-200 hover:shadow-sm"
                          title="Delete Employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
