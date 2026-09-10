import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import ProfileInputForm from '../components/student/ProfileInputForm';
import CsvUploadPanel from '../components/student/CsvUploadPanel';
import PlacementProbabilityGauge from '../components/student/PlacementProbabilityGauge';
import FactorContributionChart from '../components/student/FactorContributionChart';
import PredictedRolesCard from '../components/student/PredictedRolesCard';
import UpskillingRoadmap from '../components/student/UpskillingRoadmap';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Sparkles, FileText, UserCheck, ShieldCheck } from 'lucide-react';

export default function StudentDiagnostics() {
  const { profile, prediction, inputMode, setInputMode } = useStudent();
  const [errorMessage, setErrorMessage] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Quick Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
              Diagnostic Module 1
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Model: XGBoost + SHAP Explainability Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Student Employability Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Evaluate multidimensional academic records, technical certifications, and project complexity to diagnose placement probabilities and generate personalized career upskilling plans.
          </p>
        </div>

        {/* Input Mode Switch Pills */}
        <div className="flex items-center p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl flex-shrink-0 self-start md:self-auto">
          <button
            onClick={() => setInputMode('manual')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'manual'
                ? 'bg-brand text-white shadow-cyber-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manual Profile</span>
          </button>

          <button
            onClick={() => setInputMode('csv')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'csv'
                ? 'bg-cyan-600 text-white shadow-cyber-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV Batch Ingestion</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <ErrorBanner
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          onRetry={() => setErrorMessage(null)}
        />
      )}

      {/* Main Grid Layout per Section 3.3: grid-cols-1 lg:grid-cols-2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form or CSV Panel */}
        <div className="space-y-6">
          {inputMode === 'manual' ? (
            <ProfileInputForm onSwitchToCsv={() => setInputMode('csv')} />
          ) : (
            <CsvUploadPanel onSwitchToManual={() => setInputMode('manual')} />
          )}
        </div>

        {/* Right Column: Placement Probability Gauge & Predicted Roles */}
        <div className="space-y-6">
          <PlacementProbabilityGauge />
          <PredictedRolesCard />
        </div>
      </div>

      {/* Full-width Section: SHAP Factors Chart */}
      <div className="pt-2">
        <FactorContributionChart />
      </div>

      {/* Full-width Section: Upskilling Phased Roadmap */}
      <div className="pt-2">
        <UpskillingRoadmap />
      </div>
    </div>
  );
}
