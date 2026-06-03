import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Pencil, Trash2, ShieldAlert, Link as LinkIcon, Unlink as UnlinkIcon } from 'lucide-react';

const STATUS_BADGES = {
  'On Mission': 'bg-white border-[#1e3a8a] text-[#1e3a8a] dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
  'On Leave': 'bg-white border-black text-black dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
  'Left': 'bg-black border-black text-white dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/25',
  'Blacklisted': 'bg-[#1e3a8a] border-[#1e3a8a] text-white dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25',
  'Deceased': 'bg-[#f5f5f5] border-[#1e3a8a] text-[#1e3a8a] dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/25'
};

export default function EmployeeTable({ employees, onEdit, onDelete, onLinkClick, onUnlinkClick }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  if (employees.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-[#f5f5f5] dark:border-slate-800 rounded-2xl glass-card animate-fade-in transition-colors duration-300">
        <ShieldAlert className="h-10 w-10 text-[#1e3a8a] dark:text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-black dark:text-white">No employees found</h3>
        <p className="text-[#1e3a8a] dark:text-slate-400 text-sm mt-1">There are no employee records matching or seeded in the database.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl animate-fade-in transition-colors duration-300">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-slate-950 text-gray-700 dark:text-slate-300 transition-colors duration-300">
            <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider">Employee</th>
            <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider">Details</th>
            <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider">Department & Position</th>
            <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider">Hire Date</th>
            <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
            {isAdmin && (
              <th scope="col" className="px-6 py-4.5 text-left text-xs font-bold uppercase tracking-wider">HRMS Account</th>
            )}
            {isAdmin && (
              <th scope="col" className="px-6 py-4.5 text-right text-xs font-bold uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {employees.map((emp, index) => {
            const statusClass = STATUS_BADGES[emp.empstatus] || 'bg-white border-[#1e3a8a] text-[#1e3a8a] dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/25';
            const rowBg = index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50 dark:bg-[#131f30]';

            return (
              <tr 
                key={emp.emp_id} 
                className={`${rowBg} hover:bg-gray-100/50 dark:hover:bg-slate-800/40 transition-colors duration-200`}
              >
                {/* Name & Email column */}
                <td className="px-6 py-4.5 whitespace-nowrap">
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-brand-600/15 border border-gray-200 dark:border-brand-500/20 flex items-center justify-center font-bold text-[#1e3a8a] dark:text-brand-450 shadow-inner">
                      {emp.empfname[0]}{emp.emplname[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {emp.empfname} {emp.emplname}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 font-medium">
                        {emp.empemail}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Telephone, DOB & Gender */}
                <td className="px-6 py-4.5 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-slate-300">{emp.emptelephone}</div>
                  <div className="text-xs text-gray-550 dark:text-slate-400 mt-1">
                    {emp.empgender} • DOB: {emp.empdob}
                  </div>
                </td>

                {/* Dept & Position */}
                <td className="px-6 py-4.5 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white font-semibold">
                    {emp.posname || 'Unassigned Position'}
                  </div>
                  <div className="text-xs text-[#1e3a8a] dark:text-brand-400 mt-0.5 font-bold">
                    {emp.d_name || 'Unassigned Department'}
                  </div>
                </td>

                {/* Hire Date & Address */}
                <td className="px-6 py-4.5 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-slate-300">{emp.emphiredate}</div>
                  <div className="text-xs text-gray-550 dark:text-slate-400 mt-1 max-w-[150px] truncate" title={emp.empaddress}>
                    {emp.empaddress}
                  </div>
                </td>

                {/* Status Badges */}
                <td className="px-6 py-4.5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
                    {emp.empstatus}
                  </span>
                </td>

                {/* HRMS Account Indicator */}
                {isAdmin && (
                  <td className="px-6 py-4.5 whitespace-nowrap">
                    {emp.account_username ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Yes ({emp.account_username})
                        </span>
                        <button
                          onClick={() => onUnlinkClick(emp)}
                          className="p-1 rounded-md text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 hover:text-rose-700 transition-colors"
                          title="Unlink Account"
                        >
                          <UnlinkIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                          No Account
                        </span>
                        <button
                          onClick={() => onLinkClick(emp)}
                          className="p-1 rounded-md text-[#1e3a8a] hover:bg-gray-100 dark:text-brand-400 dark:hover:bg-slate-800 hover:text-black transition-colors"
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
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => onEdit(emp)}
                        className="p-2 rounded-lg bg-white border border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 hover:dark:bg-blue-600 hover:dark:text-white transition-all duration-300"
                        title="Edit Employee"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(emp.emp_id)}
                        className="p-2 rounded-lg bg-black border border-black text-white hover:bg-white hover:text-black dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 hover:dark:bg-rose-600 hover:dark:text-white transition-all duration-300"
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
  );
}


