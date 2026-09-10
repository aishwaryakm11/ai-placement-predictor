import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Sparkles, UserCheck, ShieldCheck, Bell, Search, Cpu } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { getReadinessStatus } from '../../utils/readiness';

export default function Navbar() {
  const location = useLocation();
  const { profile, prediction } = useStudent();
  const readiness = getReadinessStatus(prediction?.placement_probability ?? 88.5);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10 bg-[#080d1a]/85 backdrop-blur-xl">
      {/* Hackathon Top Bar Sub-Header */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-brand/20 to-cyan-950/60 border-b border-indigo-500/20 py-1 text-center text-xs tracking-wider uppercase font-semibold text-indigo-300/90 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
        <span>AI PLACEMENT PREDICTOR | INNOVATE CHENNAI HACKATHON 2026</span>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-cyan-500 p-0.5 shadow-cyber-glow flex items-center justify-center">
            <div className="w-full h-full bg-[#090e1d] rounded-[10px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
              AI Placement Predictor
            </span>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
              Institutional Career Readiness & Upskilling Engine
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
          <NavLink
            to="/student"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-brand to-indigo-600 text-white shadow-cyber-glow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Diagnostics</span>
          </NavLink>

          <NavLink
            to="/tpo"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-cyber-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <ShieldCheck className="w-4 h-4" />
            <span>TPO Command Center</span>
          </NavLink>
        </nav>

        {/* Right side user card from reference image */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-slate-900/60 border border-slate-700/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 gap-2">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Search metrics...</span>
          </div>

          <div className="relative">
            <button
              aria-label="Notifications"
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#090e1d]">
                5
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand to-cyan-400 p-[1.5px] relative">
              <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center font-bold text-xs text-cyan-300">
                {profile?.name ? profile.name.split(' ').map((n) => n[0]).join('') : 'AJ'}
              </div>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#080d1a] ${readiness.color === '#16a34a' ? 'bg-emerald-400' : readiness.color === '#d97706' ? 'bg-amber-400' : 'bg-rose-500'}`} />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {profile?.name || 'Alex Johnson'}
              </div>
              <div className="text-[11px] text-cyan-400/90 font-mono leading-tight">
                {profile?.department || 'CS'} Dept • Sem {profile?.semester || 6}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
