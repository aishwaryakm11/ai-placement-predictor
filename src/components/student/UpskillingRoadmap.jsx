import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export default function UpskillingRoadmap() {
  const { roadmap, prediction, profile } = useStudent();
  const [completedTasks, setCompletedTasks] = useState({});

  const targetRole = roadmap?.target_role || profile.target_role || 'Full-Stack Developer';
  const phases = roadmap?.phases || [];
  const missingSkills = prediction?.skill_gap_analysis?.missing_skills || [
    'Docker',
    'Kubernetes',
    'System Design',
    'Advanced SQL',
  ];
  const acquiredSkills = prediction?.skill_gap_analysis?.acquired_skills || [
    'React',
    'JavaScript',
    'Python',
  ];

  const toggleTask = (phaseIdx, taskIdx) => {
    const key = `${phaseIdx}-${taskIdx}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-cyber-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400">
              Personalized Career Roadmap
            </span>
            <span className="px-2 py-0.5 rounded bg-brand/20 border border-brand/40 text-[10px] text-brand-light font-bold">
              {targetRole}
            </span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Automated Skill Gap Diagnostic & Phased Action Plan</span>
          </h3>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-cyan-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Est. Completion: {roadmap?.total_estimated_weeks || 10} Weeks</span>
        </div>
      </div>

      {/* Skill Gap Diagnostic Pill Badges */}
      <div className="my-5 p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Target Benchmark Missing Skills (Deficits):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((s, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-status-red/40 text-rose-300 text-xs font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acquired Competencies (Verified):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {acquiredSkills.map((s, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-status-green/40 text-emerald-300 text-xs font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Phased Vertical Stepper */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-brand before:via-cyan-500 before:to-emerald-500 before:hidden sm:before:block">
        {phases.map((phase, pIdx) => {
          return (
            <div key={pIdx} className="relative sm:pl-12">
              {/* Stepper Dot */}
              <div className="hidden sm:flex absolute left-3 -translate-x-1/2 top-1 w-5 h-5 rounded-full bg-slate-950 border-2 border-cyan-400 items-center justify-center shadow-cyber-cyan z-10">
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>

              {/* Phase Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-cyan-400 font-mono">
                      Phase {phase.phase_number}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {phase.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-brand-light" />
                      <span>{phase.estimated_weeks} Weeks</span>
                    </span>
                  </div>
                </div>

                {/* Skills tags for this phase */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-mono mr-1">Focus Areas:</span>
                  {phase.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-brand/15 border border-brand/30 text-indigo-200 text-[11px] font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Recommended Action Checklist */}
                <div className="mt-3 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                    Actionable Milestones:
                  </span>
                  {phase.recommended_actions.map((act, aIdx) => {
                    const isDone = completedTasks[`${pIdx}-${aIdx}`];
                    return (
                      <div
                        key={aIdx}
                        onClick={() => toggleTask(pIdx, aIdx)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isDone
                            ? 'bg-emerald-950/20 text-emerald-300 border border-emerald-500/20 line-through opacity-75'
                            : 'bg-slate-950/50 text-slate-300 hover:bg-slate-950 border border-slate-800/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!isDone}
                          onChange={() => {}}
                          className="mt-0.5 rounded accent-cyan-400 cursor-pointer"
                        />
                        <span className="flex-1 leading-relaxed">{act}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
