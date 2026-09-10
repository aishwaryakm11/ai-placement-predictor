import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useStudent } from '../../context/StudentContext';
import { Sparkles, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export default function FactorContributionChart() {
  const { prediction } = useStudent();
  const factors = prediction?.shap_factors || [];

  // Prepare data for horizontal bar chart
  const chartData = factors.map((f) => ({
    name: f.feature
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    rawFeature: f.feature,
    contribution: Number(f.contribution) || 0,
    readable_string: f.readable_string || `${f.contribution > 0 ? '+' : ''}${f.contribution}% contribution`,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.contribution >= 0;
      return (
        <div className="glass-panel p-3 rounded-xl border border-slate-700 text-xs shadow-xl max-w-xs">
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-white">{data.name}</span>
          </div>
          <p className="text-slate-300 font-sans text-xs leading-relaxed">
            {data.readable_string}
          </p>
          <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] font-mono text-cyan-400 flex justify-between">
            <span>Impact Score:</span>
            <span className={isPositive ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {data.contribution > 0 ? '+' : ''}{data.contribution}%
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-cyber-glow flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-400">
            Explainable AI (XAI)
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-light" />
            <span>SHAP Factor Contribution Breakdown</span>
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-status-green" />
            <span>Boost (+)</span>
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-status-red" />
            <span>Penalty (-)</span>
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 my-3">
        Transparent feature importance showing exactly which dimensions increased or decreased the placement probability.
      </p>

      {/* Horizontal Bar Chart */}
      <div className="w-full h-64 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[-20, 25]}
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              width={100}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
            <Bar dataKey="contribution" radius={[4, 4, 4, 4]} barSize={16}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.contribution >= 0 ? '#16a34a' : '#dc2626'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Readable Explanations List */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 max-h-44 overflow-y-auto pr-1">
        {chartData.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 p-2 rounded-xl bg-slate-900/40 border border-slate-800/70 text-xs"
          >
            {item.contribution >= 0 ? (
              <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                +
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-rose-950 border border-rose-500/40 text-rose-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                -
              </span>
            )}
            <p className="text-slate-300 flex-1 leading-snug">
              {item.readable_string}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
