import React, { useState } from 'react';
import { Grid, HelpCircle, Info, Sparkles, AlertCircle } from 'lucide-react';

export default function SkillDeficitHeatmap({ matrix }) {
  const [hoveredCell, setHoveredCell] = useState(null);

  const skills = matrix?.skills || ['DSA', 'Java', 'SQL', 'Python', 'Cloud/DevOps', 'System Design'];
  const departments = matrix?.departments || [];

  // Determine cell color based on deficit percentage
  const getCellStyles = (deficit) => {
    const val = Number(deficit) || 0;
    if (val >= 70) {
      return {
        bg: 'bg-rose-600/70 border-rose-500/80 text-white font-bold',
        glow: 'shadow-[0_0_12px_rgba(220,38,38,0.5)]',
        category: 'Critical Void (>70%)',
      };
    }
    if (val >= 45) {
      return {
        bg: 'bg-rose-950/70 border-status-red/50 text-rose-300 font-semibold',
        glow: '',
        category: 'Severe Deficit (45-69%)',
      };
    }
    if (val >= 25) {
      return {
        bg: 'bg-amber-950/60 border-status-amber/50 text-amber-300 font-medium',
        glow: '',
        category: 'Moderate Gap (25-44%)',
      };
    }
    return {
      bg: 'bg-emerald-950/60 border-status-green/40 text-emerald-300',
      glow: '',
      category: 'Minimal Gap (<25%)',
    };
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-cyber-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
            Institutional Gap Analysis
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Grid className="w-4 h-4 text-cyan-400" />
            <span>Branch-Wide Skill Deficit Heatmap (Department &times; Skill)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Color intensity indicates percentage of student batch deficient in core competencies.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> &lt;25% (Mild)
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> 25-44% (Moderate)
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-400" /> 45-69% (Severe)
          </span>
          <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-600/70 border border-rose-400 text-white font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" /> &gt;70% (Critical)
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-separate border-spacing-2 text-center text-xs">
          <thead>
            <tr>
              <th className="p-2 text-left text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                Department
              </th>
              {skills.map((skill) => (
                <th
                  key={skill}
                  className="p-2 text-slate-300 font-bold font-mono text-xs tracking-wider"
                >
                  {skill}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {departments.map((deptRow) => (
              <tr key={deptRow.department}>
                <td className="p-2.5 text-left font-extrabold text-cyan-300 font-mono text-xs bg-slate-900/60 rounded-xl border border-slate-800">
                  {deptRow.department}
                </td>
                {skills.map((skill) => {
                  const deficit = deptRow.deficits?.[skill] ?? 0;
                  const style = getCellStyles(deficit);
                  return (
                    <td
                      key={skill}
                      onMouseEnter={() =>
                        setHoveredCell({
                          dept: deptRow.department,
                          skill,
                          deficit,
                          category: style.category,
                        })
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`p-3 rounded-xl border font-mono transition-all duration-200 cursor-pointer ${style.bg} ${style.glow} hover:scale-105`}
                    >
                      <div className="text-xs font-bold">{deficit}%</div>
                      <div className="text-[9px] opacity-75 font-sans">void</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Hover Details Bar */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
        {hoveredCell ? (
          <div className="flex items-center gap-2 text-slate-200">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <span>
              <strong className="text-white">{hoveredCell.dept}</strong> department cohort has a{' '}
              <strong className="text-cyan-400">{hoveredCell.deficit}% deficit</strong> in{' '}
              <strong className="text-white">{hoveredCell.skill}</strong> ({hoveredCell.category}).
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 italic">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Hover over any matrix cell above for detailed batch-wide intervention insights.</span>
          </div>
        )}
        <span className="text-[11px] font-mono text-cyan-400 hidden sm:inline">
          Matrix Dimensions: {departments.length} &times; {skills.length}
        </span>
      </div>
    </div>
  );
}
