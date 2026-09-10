import React from 'react';
import { useTpoAnalytics } from '../hooks/useTpoAnalytics';
import DepartmentReadinessCards from '../components/tpo/DepartmentReadinessCards';
import CohortVulnerabilityTable from '../components/tpo/CohortVulnerabilityTable';
import SkillDeficitHeatmap from '../components/tpo/SkillDeficitHeatmap';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ShieldAlert, Users, Award, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { getReadinessStatus } from '../utils/readiness';

export default function TpoDashboard() {
  const { data: analytics, isLoading, error, refetch, isFetching } = useTpoAnalytics();

  const overallReadiness = analytics?.overall_readiness_percentage ?? 78.4;
  const readiness = getReadinessStatus(overallReadiness);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Institutional Command Center
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Batch 2022 - 2026 Academic Cycle
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Training & Placement Officer (TPO) Institutional Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Real-time cohort vulnerability monitoring, branch readiness benchmarks, and cross-department skill gap diagnostics for targeted training interventions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all shadow-cyber-glow"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync Cohort Telemetry</span>
          </button>
        </div>
      </div>

      {error && (
        <ErrorBanner
          message={error.normalizedMessage || 'Unable to sync live TPO telemetry from backend.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Top High-Level Institutional Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Batch Size */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-cyber-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Total Batch Cohort</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-brand-light">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mt-2">
            {analytics?.total_students ?? 450}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Active final & pre-final year students registered
          </p>
        </div>

        {/* Overall Readiness % */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-cyber-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Overall Readiness</span>
            <div
              className="p-2 rounded-lg text-emerald-400"
              style={{ backgroundColor: `${readiness.color}15` }}
            >
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div
            className="text-2xl font-extrabold font-mono mt-2"
            style={{ color: readiness.color }}
          >
            {overallReadiness}%
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallReadiness}%`,
                backgroundColor: readiness.color,
              }}
            />
          </div>
        </div>

        {/* Placement Ready Count */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-cyber-glow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Ready Candidates (&ge;80%)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">
            {analytics?.ready_students_count ?? 245}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-sans">
            Cleared core technical & interview benchmarks
          </p>
        </div>

        {/* Vulnerable Students Count (<60%) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/60 shadow-cyber-red/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">Vulnerable Segment (&lt;60%)</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400 mt-2">
            {analytics?.vulnerable_count ?? 70}
          </div>
          <p className="text-[11px] text-rose-400/80 mt-1 font-sans">
            Requires immediate remedial bootcamp
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Compiling branch-level cohort data..." />
      ) : (
        <>
          {/* 1. Department Readiness Cards & Trend Charts */}
          <DepartmentReadinessCards
            data={analytics?.departmental_readiness}
            trends={analytics?.placement_trends}
          />

          {/* 2. Cohort Vulnerability Table with <60% Filter */}
          <CohortVulnerabilityTable cohort={analytics?.vulnerable_cohort} />

          {/* 3. Skill Deficit Heatmap (Department x Skill) */}
          <SkillDeficitHeatmap matrix={analytics?.skill_deficit_matrix} />
        </>
      )}
    </div>
  );
}
