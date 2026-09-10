import React, { useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  BookOpen,
  Sparkles,
  RotateCcw,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useStudent } from '../../context/StudentContext';
import { validateProfile } from '../../utils/validators';
import { DEFAULT_STUDENT_PROFILE } from '../../utils/mockData';
import { usePredictPlacement } from '../../hooks/usePredictPlacement';
import { useUpskillingRoadmap } from '../../hooks/useUpskillingRoadmap';

const AVAILABLE_LANGUAGES = [
  'Python',
  'JavaScript',
  'Java',
  'C++',
  'TypeScript',
  'Go',
  'C#',
  'SQL',
  'Rust',
  'HTML/CSS',
];

const AVAILABLE_CERTS = [
  'AWS Certified Cloud Practitioner',
  'Meta Front-End Developer',
  'Google Cloud Associate',
  'Docker & Kubernetes (CKA)',
  'Oracle Certified Java SE',
  'HashiCorp Certified Terraform',
  'Microsoft Azure Fundamentals',
  'TensorFlow Developer Certificate',
];

const TARGET_ROLES = [
  'Full-Stack Developer',
  'Data Analyst',
  'Cloud/DevOps Engineer',
  'QA Specialist',
];

const DEPARTMENTS = ['CSE', 'ISE', 'ECE', 'AIML', 'MECH', 'CIVIL', 'EEE'];

export default function ProfileInputForm({ onSwitchToCsv }) {
  const { profile, updateProfile, setProfile, setPrediction, setRoadmap } = useStudent();
  const [errors, setErrors] = useState({});
  const [successNotice, setSuccessNotice] = useState(false);

  const predictMutation = usePredictPlacement({
    onSuccess: (data) => {
      setPrediction(data);
      // Trigger roadmap mutation with missing skills
      const missing = data.skill_gap_analysis?.missing_skills || ['Docker', 'Kubernetes'];
      const acquired = data.skill_gap_analysis?.acquired_skills || ['React', 'Python'];
      roadmapMutation.mutate({
        target_role: profile.target_role,
        current_skills: acquired,
        missing_skills: missing,
        placement_probability: data.placement_probability,
      });
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 4000);
    },
  });

  const roadmapMutation = useUpskillingRoadmap({
    onSuccess: (data) => {
      setRoadmap(data);
    },
  });

  const handleInputChange = (field, value) => {
    updateProfile({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const toggleLanguage = (lang) => {
    const current = profile.known_languages || [];
    const updated = current.includes(lang)
      ? current.filter((l) => l !== lang)
      : [...current, lang];
    handleInputChange('known_languages', updated);
  };

  const toggleCertification = (cert) => {
    const current = profile.certifications || [];
    const updated = current.includes(cert)
      ? current.filter((c) => c !== cert)
      : [...current, cert];
    handleInputChange('certifications', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = validateProfile(profile);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    predictMutation.mutate(profile);
  };

  const handleLoadSample = () => {
    setProfile(DEFAULT_STUDENT_PROFILE);
    setErrors({});
  };

  const handleReset = () => {
    setProfile({
      name: '',
      department: 'CSE',
      semester: 6,
      cgpa: '',
      tenth_percentage: '',
      twelfth_percentage: '',
      backlogs: 0,
      known_languages: ['Python'],
      certifications: [],
      projects_count: 0,
      internships_count: 0,
      open_source_contributions: 0,
      aptitude_score: '',
      soft_skill_rating: 3.0,
      hackathons_attended: 0,
      leadership_roles: 0,
      target_role: 'Full-Stack Developer',
    });
    setErrors({});
  };

  const isSubmitting = predictMutation.isPending || roadmapMutation.isPending;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-cyber-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-light" />
            <span>Student Employability Diagnostics Configuration</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure multi-tier profile dimensions for explainable ML prediction and career gap analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sample Alex Johnson</span>
          </button>

          {onSwitchToCsv && (
            <button
              type="button"
              onClick={onSwitchToCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV Ingestion</span>
            </button>
          )}
        </div>
      </div>

      {successNotice && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Diagnostic profile analyzed successfully! Radar and SHAP metrics refreshed below.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Section 1: Academic Track Record */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4" />
            <span>1. Academic Track Record & Benchmarks</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student Full Name</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Alex Johnson"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Department / Branch *</label>
              <select
                value={profile.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900 text-white">
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && <p className="text-[11px] text-status-red mt-1">{errors.department}</p>}
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current Semester (1-8) *</label>
              <input
                type="number"
                min="1"
                max="8"
                value={profile.semester}
                onChange={(e) => handleInputChange('semester', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              />
              {errors.semester && <p className="text-[11px] text-status-red mt-1">{errors.semester}</p>}
            </div>

            {/* CGPA */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">CGPA (0.00 - 10.00) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa}
                onChange={(e) => handleInputChange('cgpa', e.target.value)}
                placeholder="e.g. 8.50"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
              />
              {errors.cgpa && <p className="text-[11px] text-status-red mt-1">{errors.cgpa}</p>}
            </div>

            {/* 10th % */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">10th Grade Percentage (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={profile.tenth_percentage}
                onChange={(e) => handleInputChange('tenth_percentage', e.target.value)}
                placeholder="e.g. 88.0"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
              />
              {errors.tenth_percentage && <p className="text-[11px] text-status-red mt-1">{errors.tenth_percentage}</p>}
            </div>

            {/* 12th % */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">12th Grade Percentage (%) *</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={profile.twelfth_percentage}
                onChange={(e) => handleInputChange('twelfth_percentage', e.target.value)}
                placeholder="e.g. 85.0"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
              />
              {errors.twelfth_percentage && <p className="text-[11px] text-status-red mt-1">{errors.twelfth_percentage}</p>}
            </div>

            {/* Backlogs */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Active / History Backlogs *</label>
              <input
                type="number"
                min="0"
                value={profile.backlogs}
                onChange={(e) => handleInputChange('backlogs', e.target.value)}
                placeholder="0"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
              />
              {errors.backlogs && <p className="text-[11px] text-status-red mt-1">{errors.backlogs}</p>}
            </div>

            {/* Aptitude Score */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Aptitude Benchmark Score (0-100) *</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                value={profile.aptitude_score}
                onChange={(e) => handleInputChange('aptitude_score', e.target.value)}
                placeholder="e.g. 82"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors font-mono"
              />
              {errors.aptitude_score && <p className="text-[11px] text-status-red mt-1">{errors.aptitude_score}</p>}
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Career Role *</label>
              <select
                value={profile.target_role}
                onChange={(e) => handleInputChange('target_role', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role} className="bg-slate-900 text-white">
                    {role}
                  </option>
                ))}
              </select>
              {errors.target_role && <p className="text-[11px] text-status-red mt-1">{errors.target_role}</p>}
            </div>
          </div>
        </div>

        {/* Section 2: Practical Experience & Projects */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-light flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4" />
            <span>2. Practical Experience & Practical Proof</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Completed Projects Count</label>
              <input
                type="number"
                min="0"
                value={profile.projects_count}
                onChange={(e) => handleInputChange('projects_count', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-colors font-mono"
              />
              {errors.projects_count && <p className="text-[11px] text-status-red mt-1">{errors.projects_count}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Completed Internships Count</label>
              <input
                type="number"
                min="0"
                value={profile.internships_count}
                onChange={(e) => handleInputChange('internships_count', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-colors font-mono"
              />
              {errors.internships_count && <p className="text-[11px] text-status-red mt-1">{errors.internships_count}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Open Source PRs / Repos</label>
              <input
                type="number"
                min="0"
                value={profile.open_source_contributions}
                onChange={(e) => handleInputChange('open_source_contributions', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-colors font-mono"
              />
              {errors.open_source_contributions && <p className="text-[11px] text-status-red mt-1">{errors.open_source_contributions}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hackathons Attended</label>
              <input
                type="number"
                min="0"
                value={profile.hackathons_attended}
                onChange={(e) => handleInputChange('hackathons_attended', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-colors font-mono"
              />
              {errors.hackathons_attended && <p className="text-[11px] text-status-red mt-1">{errors.hackathons_attended}</p>}
            </div>
          </div>
        </div>

        {/* Section 3: Technical Competencies & Verified Certifications */}
        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4" />
            <span>3. Technical Competencies & Multi-Select Languages *</span>
          </h3>

          {/* Languages Multi-Select Pills */}
          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-2">
              Select languages student is proficient in:
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const isSelected = profile.known_languages?.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand text-white border border-brand-light shadow-cyber-glow'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <span>{lang}</span>
                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
            {errors.known_languages && <p className="text-[11px] text-status-red mt-1.5">{errors.known_languages}</p>}
          </div>

          {/* Certifications Multi-Select */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">
              Verified Industry Certifications (optional boost):
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CERTS.map((cert) => {
                const isSelected = profile.certifications?.includes(cert);
                return (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCertification(cert)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 shadow-cyber-green'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{cert}</span>
                    {isSelected && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Soft Skills & Leadership */}
        <div className="pt-4 border-t border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Soft Skill & Verbal Fluency Rating: <span className="text-cyan-400 font-bold">{profile.soft_skill_rating} / 5.0</span>
                </label>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={profile.soft_skill_rating}
                onChange={(e) => handleInputChange('soft_skill_rating', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1.0 (Novice)</span>
                <span>3.0 (Proficient)</span>
                <span>5.0 (Interview Ready)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Leadership Roles / Tech Society Head
              </label>
              <input
                type="number"
                min="0"
                value={profile.leadership_roles}
                onChange={(e) => handleInputChange('leadership_roles', e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-light focus:ring-1 focus:ring-brand-light transition-colors font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Fields</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand via-indigo-600 to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-cyber-glow hover:shadow-cyber-cyan transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Computing XAI Predictions...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Execute Diagnostic Prediction</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
