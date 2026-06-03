import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Construction,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role] = useState('Staff'); // Enforces Staff (Employee) registration role
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Default to light theme
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegister) {
      if (!username || !password || !confirmPassword) {
        setErrorMsg('Please fill in all fields.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      try {
        setSubmitting(true);
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, role })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failed.');
        }
        setSuccessMsg('Registration successful! You can now sign in.');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!username || !password) {
        setErrorMsg('Please enter both username and password.');
        return;
      }

      try {
        setSubmitting(true);
        await login(username, password);
        navigate('/');
      } catch (err) {
        setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f5f5f5] dark:bg-slate-950 p-4 text-black dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
      {/* Falling water glass bubbles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(22)].map((_, i) => {
          const size = Math.random() * 45 + 15;
          const left = Math.random() * 100;
          const delay = Math.random() * 10;
          const duration = Math.random() * 12 + 8;
          const opacity = Math.random() * 0.4 + 0.15;
          const blurVal = Math.random() * 1.5;
          return (
            <div
              key={i}
              className="bubble"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                opacity: opacity,
                filter: `blur(${blurVal}px)`
              }}
            />
          );
        })}
      </div>

      <div className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between transition-colors duration-300 relative z-10">

        {/* Header */}
        <div className="text-center mb-6 relative">

          {/* Theme Toggler inside the login card (top-right corner) */}
          <button
            onClick={toggleTheme}
            type="button"
            className="absolute -top-2 right-0 p-2 rounded-xl bg-[#f5f5f5] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-[#1e3a8a] dark:text-slate-400 hover:text-black dark:hover:text-white transition-all duration-300 shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex justify-center mb-3">
            <div className="inline-flex bg-blue-50 dark:bg-[#1e3a8a]/10 p-3 rounded-2xl border border-blue-100 dark:border-brand-500/20 text-[#1e3a8a] dark:text-brand-400">
              <Construction className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-black dark:text-white tracking-tight">DAB Enterprise LTD</h1>
          <p className="text-xs text-[#1e3a8a] dark:text-brand-400 mt-1 font-bold uppercase tracking-wider">
            {isRegister ? 'Register Account' : 'Sign In'}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {isRegister ? 'Create your credentials to join' : 'DAB Enterprise HR Portal'}
          </p>
        </div>

        {/* Messages */}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex gap-2.5 items-center font-bold">
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-450 text-xs flex gap-2.5 items-center font-bold animate-fade-in">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1e3a8a] dark:text-slate-500 group-focus-within:text-black dark:group-focus-within:text-brand-400 transition-colors duration-200">
                <User className="h-4 w-4" />
              </span>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 focus:border-[#1e3a8a] dark:focus:border-brand-500 focus:ring-1 focus:ring-[#1e3a8a] rounded-xl pl-10 pr-4 py-2.5 text-xs text-black dark:text-white placeholder-black/35 dark:placeholder-slate-650 outline-none transition-all duration-300 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1e3a8a] dark:text-slate-500 group-focus-within:text-black dark:group-focus-within:text-brand-400 transition-colors duration-200">
                <Lock className="h-4 w-4" />
              </span>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 focus:border-[#1e3a8a] dark:focus:border-brand-500 focus:ring-1 focus:ring-[#1e3a8a] rounded-xl pl-10 pr-10 py-2.5 text-xs text-black dark:text-white placeholder-black/35 dark:placeholder-slate-650 outline-none transition-all duration-300 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#1e3a8a] dark:text-slate-500 hover:text-black dark:hover:text-slate-300 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#1e3a8a] dark:text-slate-500 group-focus-within:text-black dark:group-focus-within:text-brand-400 transition-colors duration-200">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f5f5f5] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 focus:border-[#1e3a8a] dark:focus:border-brand-500 focus:ring-1 focus:ring-[#1e3a8a] rounded-xl pl-10 pr-10 py-2.5 text-xs text-black dark:text-white placeholder-black/35 dark:placeholder-slate-650 outline-none transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1e3a8a] dark:text-slate-400 mb-1.5">
                  Role
                </label>
                <input
                  type="text"
                  value="Employee"
                  disabled
                  className="w-full bg-[#e5e5e5] dark:bg-slate-950 border border-gray-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-gray-650 dark:text-slate-400 cursor-not-allowed font-bold outline-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#1e3a8a] dark:bg-brand-600 hover:bg-black dark:hover:bg-brand-500 text-white font-bold text-xs tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-[0.98]"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>{isRegister ? 'Registering...' : 'Signing In...'}</span>
              </span>
            ) : (
              isRegister ? 'Register Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle link */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs text-[#1e3a8a] dark:text-slate-400 hover:text-black dark:hover:text-white font-bold transition-colors duration-200 underline underline-offset-4"
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>

        {/* Demo accounts removed */}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
          <p className="text-[9px] text-gray-400 dark:text-slate-650 font-bold uppercase tracking-wider">
            Kigali HQ • Rwanda
          </p>
        </div>

      </div>
    </div>
  );
}
