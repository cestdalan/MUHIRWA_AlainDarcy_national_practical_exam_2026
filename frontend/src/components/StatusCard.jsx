import React from 'react';
import { 
  CalendarClock, 
  MapPin, 
  UserMinus, 
  Skull, 
  UserX 
} from 'lucide-react';
export default function StatusCard({ status, count = 0 }) {
  // Map each status to its custom dark settings
  const statusDarkConfig = {
    'On Mission': {
      icon: MapPin,
      darkGradient: 'dark:from-emerald-500/10 dark:to-teal-500/5',
      darkIconClass: 'dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20',
      darkGlow: 'dark:glow-accent-green'
    },
    'On Leave': {
      icon: CalendarClock,
      darkGradient: 'dark:from-amber-500/10 dark:to-yellow-500/5',
      darkIconClass: 'dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20',
      darkGlow: 'dark:glow-accent-yellow'
    },
    'Left': {
      icon: UserMinus,
      darkGradient: 'dark:from-orange-500/10 dark:to-amber-500/5',
      darkIconClass: 'dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20',
      darkGlow: 'dark:glow-accent-orange'
    },
    'Blacklisted': {
      icon: UserX,
      darkGradient: 'dark:from-rose-500/10 dark:to-red-500/5',
      darkIconClass: 'dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20',
      darkGlow: 'dark:glow-accent-red'
    },
    'Deceased': {
      icon: Skull,
      darkGradient: 'dark:from-slate-500/10 dark:to-zinc-500/5',
      darkIconClass: 'dark:text-slate-400 dark:bg-slate-500/10 dark:border-slate-500/20',
      darkGlow: 'dark:glow-accent-gray'
    }
  };

  const config = statusDarkConfig[status] || {
    icon: MapPin,
    darkGradient: 'dark:from-blue-500/10 dark:to-indigo-500/5',
    darkIconClass: 'dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20',
    darkGlow: 'dark:glow-accent'
  };

  const Icon = config.icon;

  return (
    <div className={`p-6 rounded-2xl border border-[#f5f5f5] dark:border-slate-800 glass-card bg-white dark:bg-gradient-to-br ${config.darkGradient} transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${config.darkGlow} animate-slide-up`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#1e3a8a] dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{status}</p>
          <h3 className="text-4xl font-extrabold text-black dark:text-white mt-2.5 leading-none transition-all duration-300">
            {count}
          </h3>
        </div>
        <div className={`p-3 rounded-xl border border-[#1e3a8a]/20 bg-[#f5f5f5] text-[#1e3a8a] ${config.darkIconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-[10px] text-[#1e3a8a]/70 dark:text-slate-500 font-semibold uppercase tracking-wider">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1e3a8a] dark:bg-slate-500 animate-pulse"></span>
        <span>Personnel count</span>
      </div>
    </div>
  );
}
