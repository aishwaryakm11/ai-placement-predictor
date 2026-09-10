import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { getReadinessStatus } from '../../utils/readiness';
import { Sparkles, Award, Building2, CheckCircle2, TrendingUp } from 'lucide-react';

export default function PlacementProbabilityGauge() {
  const { prediction, profile } = useStudent();

  const probability = prediction?.placement_probability ?? 88.5;
  const readiness = getReadinessStatus(probability);

  // Calculate SVG arc coordinates for radial gauge
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc for gauge (or full 360 circle with open gap)
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  const companies = [
    { name: 'Google', color: '#4285F4', icon: 'G' },
    { name: 'Microsoft', color: '#00A4EF', icon: 'MS' },
    { name: 'Meta', color: '#0668E1', icon: 'M' },
    { name: 'Accenture', color: '#A100FF', icon: 'A' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-cyber-glow flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[90px] pointer-events-none opacity-20"
        style={{ backgroundColor: readiness.color }}
      />

      <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
        <div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400">
            Explainable Employability Index
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Overall AI Placement Readiness</span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: readiness.color }} />
          <span>Live Diagnostic</span>
        </div>
      </div>

      {/* Main Gauge Visual with Neural Node Links to Hiring Partners */}
      <div className="relative py-6 flex flex-col md:flex-row items-center justify-around gap-6 z-10">
        {/* Left: Student Node */}
        <div className="flex flex-col items-center text-center">
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-brand to-cyan-400 shadow-cyber-glow">
            <div className="w-14 h-14 rounded-full bg-slate-900 flex items-center justify-center text-cyan-300 font-bold text-lg">
              {profile?.name ? profile.name.split(' ').map((n) => n[0]).join('') : 'AJ'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-slate-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <span className="mt-2 text-xs font-semibold text-white">{profile?.name || 'Alex Johnson'}</span>
          <span className="text-[10px] text-slate-400 font-mono">{profile?.department || 'CSE'} Candidate</span>

          {/* Connected SVG lines */}
          <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent mt-2 opacity-50" />
        </div>

        {/* Center: Radial Gauge */}
        <div className="relative flex flex-col items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
            {/* Background track circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke="rgba(30, 41, 59, 0.8)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Gauge Arc */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              stroke={readiness.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${readiness.color})`,
              }}
            />
          </svg>

          {/* Inner Gauge Text Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
              {probability >= 80 ? 'HIGH PROBABILITY' : probability >= 60 ? 'MODERATE PROBABILITY' : 'VULNERABLE'}
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-white flex items-baseline justify-center">
              <span>{probability}</span>
              <span className="text-xl text-cyan-400 font-normal">%</span>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-0.5 mt-1 rounded-full border"
              style={{
                color: readiness.color,
                borderColor: `${readiness.color}40`,
                backgroundColor: `${readiness.color}15`,
              }}
            >
              {readiness.label}
            </span>
          </div>
        </div>

        {/* Right: Target Companies & Alignment */}
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider text-center md:text-left">
            Institutional Recruiter Fit
          </span>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {companies.map((c) => {
              const fitPercent = Math.max(20, Math.min(99, Math.round(probability * 0.95 - (c.name === 'Google' ? 5 : 0))));
              return (
                <div
                  key={c.name}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-[70px]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-200">{c.name}</span>
                      <span className="font-mono text-[10px] text-cyan-400">{fitPercent}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${fitPercent}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Threshold Legend Underneath */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-status-red" />
            <span>&lt; 60% Needs Training</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-status-amber" />
            <span>60-79% Near-Ready</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-status-green" />
            <span>&ge; 80% Ready</span>
          </span>
        </div>

        <p className="text-[11px] text-slate-400 font-sans italic">
          {readiness.description}
        </p>
      </div>
    </div>
  );
}
