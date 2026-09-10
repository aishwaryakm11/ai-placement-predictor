import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import StudentDiagnostics from './pages/StudentDiagnostics';
import TpoDashboard from './pages/TpoDashboard';
import { StudentProvider } from './context/StudentContext';
import { Cpu, Heart, Sparkles } from 'lucide-react';

export default function App() {
  return (
    <StudentProvider>
      <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 selection:bg-brand selection:text-white">
        {/* Fixed Navbar */}
        <Navbar />

        {/* Main Content Area (padding-top accounts for fixed navbar height) */}
        <main className="flex-1 pt-24 pb-12">
          <Routes>
            <Route path="/" element={<Navigate to="/student" replace />} />
            <Route path="/student" element={<StudentDiagnostics />} />
            <Route path="/tpo" element={<TpoDashboard />} />
            <Route path="*" element={<Navigate to="/student" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <footer className="glass-panel border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-slate-300">AI Placement Predictor</span>
              <span>•</span>
              <span className="font-mono text-[11px]">Innovate Chennai Hackathon 2026</span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <span>Internal Institutional Intelligence Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400">Operational</span>
            </div>
          </div>
        </footer>
      </div>
    </StudentProvider>
  );
}
