import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  User, 
  Construction,
  Sun,
  Moon
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: Users
    }
  ];

  // Display name: actual employee first name if linked, else username
  const displayName = user?.empfname ? user.empfname : (user?.username || 'Guest');
  const isAdmin = user?.role === 'Admin';

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between text-gray-900 dark:text-slate-300 z-30 transition-colors duration-300 no-print">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3">
          <div className="bg-blue-50 dark:bg-brand-600/10 p-2.5 rounded-xl border border-blue-100 dark:border-brand-500/20 text-[#1e3a8a] dark:text-brand-400">
            <Construction className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-gray-900 dark:text-white font-extrabold tracking-tight text-lg">DAB Enterprise</h1>
            <p className="text-[#1e3a8a] dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">Kigali, Rwanda</p>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="mt-8 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            // Adjust menu text if staff is logged in and viewing employees page
            let linkName = item.name;
            if (item.name === 'Employees' && !isAdmin) {
              linkName = 'View Staff';
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-300 group ${
                  isActive 
                    ? 'bg-[#1e3a8a] text-white shadow-sm dark:bg-brand-600' 
                    : 'text-gray-700 dark:text-slate-400 hover:bg-gray-100 hover:text-[#1e3a8a] dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-[#1e3a8a] dark:text-slate-400 group-hover:text-black dark:group-hover:text-white'
                }`} />
                <span>{linkName}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Action */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 mb-3 animate-fade-in transition-colors duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 flex items-center justify-center text-[#1e3a8a] dark:text-brand-400 shrink-0">
              <User className="h-4.5 w-4.5" />
            </div>
            <div className="truncate pr-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate capitalize" title={displayName}>
                {displayName}
              </p>
              <p className={`text-[9px] inline-block px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                user?.role === 'Admin' 
                  ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
              }`}>
                {user?.role || 'Staff'}
              </p>
            </div>
          </div>

          {/* Theme Toggler Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            className="p-1.5 rounded-lg bg-white hover:bg-gray-100 dark:bg-slate-800 dark:border dark:border-slate-700 dark:hover:bg-slate-700 text-[#1e3a8a] dark:text-slate-400 dark:hover:text-white transition-colors duration-200 shrink-0 shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black hover:bg-[#1e3a8a] text-white dark:bg-rose-500/10 dark:border dark:border-rose-500/20 dark:text-rose-450 dark:hover:bg-rose-600 dark:hover:text-white transition-all duration-300 group shadow-sm"
        >
          <LogOut className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
