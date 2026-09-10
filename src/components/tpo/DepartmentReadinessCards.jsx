import React from 'react';
import { getReadinessStatus } from '../../utils/readiness';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Building, Users, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

export default function DepartmentReadinessCards({ data, trends }) {
  const departments = data || [];

  return (
    <div className="space-y-6">
      {/* Top Department Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
              Departmental Snapshot
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-brand-light" />
              <span>Branch Placement Readiness Metrics</span>
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">5 Active Cohorts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {departments.map((dept, idx) => {
            const readiness = getReadinessStatus(dept.readiness_percentage);
            return (
              <div
                key={idx}
                className="glass-panel p-4 rounded-2xl border border-slate-700/60 shadow-cyber-glow flex flex-col justify-between relative overflow-hidden group hover:border-slate-500 transition-all"
              >
                {/* Accent glow top border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: readiness.color }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-white font-mono tracking-wide">
                    {dept.department}
                  </span>
                  <span
                    className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                    style={{
                      color: readiness.color,
                      backgroundColor: `${readiness.color}18`,
                      border: `1px solid ${readiness.color}35`,
                    }}
                  >
                    {dept.readiness_percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="my-3">
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${dept.readiness_percentage}%`,
                        backgroundColor: readiness.color,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    <span>{dept.total_students} Total</span>
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {dept.placed_or_ready} Ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Charts: Bar Chart & Placement Trend curves from reference image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Snapshot Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-cyber-glow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Departmental Placement Comparison</span>
            </h4>
            <span className="text-[11px] font-mono text-cyan-400">Benchmark %</span>
          </div>

          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="department" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val) => [`${val}% Readiness`, 'Score']}
                />
                <Bar dataKey="readiness_percentage" radius={[6, 6, 0, 0]} barSize={32}>
                  {departments.map((entry, index) => {
                    const r = getReadinessStatus(entry.readiness_percentage);
                    return <Cell key={`bar-${index}`} fill={r.color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Placement Probability Trend Lines */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-cyber-glow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Placement Probability Trend (Sem 3 - 8)</span>
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-cyan-400">● CSE</span>
              <span className="text-indigo-400">● ISE</span>
              <span className="text-amber-400">● ECE</span>
            </div>
          </div>

          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="semester" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="CSE"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#06b6d4' }}
                />
                <Line
                  type="monotone"
                  dataKey="ISE"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366f1' }}
                />
                <Line
                  type="monotone"
                  dataKey="ECE"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#d97706' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
