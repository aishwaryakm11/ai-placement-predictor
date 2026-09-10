import React from 'react';
import { useStudent } from '../../context/StudentContext';
import { Compass, CheckCircle, Target, ArrowRight } from 'lucide-react';

export default function PredictedRolesCard() {
  const { prediction, profile, updateProfile } = useStudent();
  const roles = prediction?.target_role_scores && typeof prediction.target_role_scores === 'object' && !Array.isArray(prediction.target_role_scores)
    ? Object.entries(prediction.target_role_scores).map(([role, confidence]) => ({
        role,
        confidence: Math.round(Number(confidence) * 10) / 10,
      }))
    : prediction?.predicted_roles || [
        { role: 'Full-Stack Developer', confidence: 42.0 },
        { role: 'Data Analyst', confidence: 28.0 },
        { role: 'Cloud/DevOps Engineer', confidence: 18.0 },
        { role: 'QA Specialist', confidence: 12.0 },
      ];

  const handleSelectRole = (roleName) => {
    updateProfile({ target_role: roleName });
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-cyber-glow flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400">
            Multi-Track Alignment
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Predicted Roles & Confidence</span>
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Probability %</span>
      </div>

      <div className="space-y-4 my-4">
        {roles.map((item, idx) => {
          const isTarget = profile.target_role === item.role;
          return (
            <div
              key={idx}
              onClick={() => handleSelectRole(item.role)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isTarget
                  ? 'bg-brand/15 border-brand shadow-cyber-glow'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {isTarget && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                  <span className={`text-xs font-bold ${isTarget ? 'text-white' : 'text-slate-200'}`}>
                    {item.role}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className={isTarget ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                    {item.confidence}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    idx === 0
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-400'
                      : idx === 1
                      ? 'bg-gradient-to-r from-brand to-indigo-400'
                      : 'bg-gradient-to-r from-slate-500 to-slate-400'
                  }`}
                  style={{ width: `${item.confidence}%` }}
                />
              </div>

              {isTarget && (
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-cyan-300 font-medium">
                  <CheckCircle className="w-3 h-3" />
                  <span>Currently Active Target Track</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any role above to focus personalized upskilling</span>
        <Target className="w-3.5 h-3.5 text-cyan-400" />
      </div>
    </div>
  );
}
