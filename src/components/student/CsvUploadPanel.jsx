import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Download, ArrowRight, UserCheck } from 'lucide-react';
import { useStudent } from '../../context/StudentContext';

export default function CsvUploadPanel({ onSwitchToManual }) {
  const { setProfile, updateProfile } = useStudent();
  const [dragOver, setDragOver] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState('');
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [parseError, setParseError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setParseError('Please upload a valid .csv file');
      return;
    }

    setParseError('');
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setParseError(`CSV Parsing failed: ${results.errors[0].message}`);
          return;
        }

        if (results.data.length > 0) {
          setCsvData(results.data);
          setHeaders(results.meta.fields || Object.keys(results.data[0]));
          setSelectedRowIndex(0);
          applyRowToProfile(results.data[0]);
        } else {
          setParseError('The uploaded CSV contains no records.');
        }
      },
      error: (err) => {
        setParseError(`Failed to parse file: ${err.message}`);
      },
    });
  };

  const applyRowToProfile = (row) => {
    if (!row) return;

    // Convert semicolon separated strings to arrays if needed
    const languages = typeof row.known_languages === 'string'
      ? row.known_languages.split(';').map((s) => s.trim()).filter(Boolean)
      : Array.isArray(row.known_languages) ? row.known_languages : ['Python', 'JavaScript'];

    const certs = typeof row.certifications === 'string'
      ? row.certifications.split(';').map((s) => s.trim()).filter(Boolean)
      : Array.isArray(row.certifications) ? row.certifications : [];

    updateProfile({
      name: row.name || `Student Record #${selectedRowIndex !== null ? selectedRowIndex + 1 : 1}`,
      department: row.department || 'CSE',
      semester: Number(row.semester) || 6,
      cgpa: Number(row.cgpa) || 7.5,
      tenth_percentage: Number(row.tenth_percentage) || 80.0,
      twelfth_percentage: Number(row.twelfth_percentage) || 80.0,
      backlogs: Number(row.backlogs) || 0,
      known_languages: languages,
      certifications: certs,
      projects_count: Number(row.projects_count) || 2,
      internships_count: Number(row.internships_count) || 0,
      open_source_contributions: Number(row.open_source_contributions) || 0,
      aptitude_score: Number(row.aptitude_score) || 70.0,
      soft_skill_rating: Number(row.soft_skill_rating) || 3.5,
      hackathons_attended: Number(row.hackathons_attended) || 0,
      leadership_roles: Number(row.leadership_roles) || 0,
      target_role: row.target_role || 'Full-Stack Developer',
    });
  };

  const handleSelectRow = (idx) => {
    setSelectedRowIndex(idx);
    applyRowToProfile(csvData[idx]);
  };

  const downloadSampleCsv = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "name,department,semester,cgpa,tenth_percentage,twelfth_percentage,backlogs,known_languages,certifications,projects_count,internships_count,open_source_contributions,aptitude_score,soft_skill_rating,hackathons_attended,leadership_roles,target_role\n" +
      "Alex Johnson,CSE,6,8.5,88.0,85.0,0,Python;JavaScript;Java,AWS Certified Cloud Practitioner;Meta Front-End,3,1,5,82.0,4.2,2,1,Full-Stack Developer\n" +
      "Rohan Patel,ECE,6,6.5,74.0,72.0,1,C++;Python,,1,0,0,58.0,3.2,0,0,Cloud/DevOps Engineer\n" +
      "Priya Sharma,ISE,7,7.8,82.0,80.0,0,Java;SQL;Python,Oracle Java SE 11,2,1,2,76.0,4.0,1,1,Data Analyst";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_placement_cohort.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 shadow-cyber-glow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <span>Cohort Data Ingestion & CSV Upload</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest batch records via standard academic CSV or toggle to manual profile configuration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
            title="Download formatted sample CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sample CSV</span>
          </button>

          <button
            onClick={onSwitchToManual}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-semibold shadow-cyber-glow transition-all"
          >
            <span>Manual Entry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-5 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-cyan-400 bg-cyan-950/20 shadow-cyber-cyan'
            : 'border-slate-700/80 hover:border-slate-500 bg-slate-900/40 hover:bg-slate-900/60'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
          <UploadCloud className="w-6 h-6 animate-bounce" style={{ animationDuration: '2.5s' }} />
        </div>
        <p className="text-sm font-medium text-slate-200">
          Drag and drop student academic record CSV here, or <span className="text-cyan-400 font-semibold underline">browse</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports CGPA, Backlogs, Languages, Aptitude Scores, and Practical Projects
        </p>
        {fileName && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Loaded: {fileName} ({csvData.length} records)</span>
          </div>
        )}
      </div>

      {parseError && (
        <div className="mt-3 p-3 rounded-lg bg-rose-950/40 border border-status-red/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-status-red flex-shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* CSV Preview Table */}
      {csvData.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Parsed Students Preview ({csvData.length} entries)
            </h4>
            <span className="text-[11px] text-cyan-400 font-mono">
              Click any row to load into predictor
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50 max-h-60">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950/80 sticky top-0 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Sem</th>
                  <th className="py-2.5 px-3">CGPA</th>
                  <th className="py-2.5 px-3">Backlogs</th>
                  <th className="py-2.5 px-3">Aptitude</th>
                  <th className="py-2.5 px-3">Projects</th>
                  <th className="py-2.5 px-3">Target Role</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {csvData.slice(0, 10).map((row, idx) => {
                  const isSelected = selectedRowIndex === idx;
                  return (
                    <tr
                      key={idx}
                      onClick={() => handleSelectRow(idx)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-brand/20 text-white font-semibold'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }`}
                    >
                      <td className="py-2 px-3">{idx + 1}</td>
                      <td className="py-2 px-3 font-sans font-medium text-cyan-300">{row.department || 'CSE'}</td>
                      <td className="py-2 px-3">{row.semester || 6}</td>
                      <td className="py-2 px-3 text-emerald-400">{row.cgpa || 7.5}</td>
                      <td className="py-2 px-3">
                        {row.backlogs > 0 ? (
                          <span className="text-rose-400 font-bold">{row.backlogs}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-2 px-3">{row.aptitude_score || 70}%</td>
                      <td className="py-2 px-3">{row.projects_count || 0}</td>
                      <td className="py-2 px-3 font-sans text-indigo-300">{row.target_role || 'Full-Stack'}</td>
                      <td className="py-2 px-3 text-right">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-sans">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectRow(idx);
                            }}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans"
                          >
                            Load
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
