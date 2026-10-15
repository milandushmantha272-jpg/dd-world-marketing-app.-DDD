import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Database, Archive, ShieldCheck, Download, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export const AnnualArchivePage: React.FC<{ role?: string }> = ({ role = 'owner' }) => {
  const { currentUser } = useAuth();
  const [archiving, setArchiving] = useState(false);
  const [archiveSuccess, setArchiveSuccess] = useState(false);

  const archiveYears = [
    { year: '2025', records: 1420, size: '4.8 MB', status: 'LOCKED & SEALED' },
    { year: '2026 Q1-Q3', records: 3840, size: '12.4 MB', status: 'ACTIVE VAULT' },
  ];

  const handleCreateSnapshot = () => {
    setArchiving(true);
    setTimeout(() => {
      setArchiving(false);
      setArchiveSuccess(true);
      setTimeout(() => setArchiveSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Archive className="w-5 h-5 text-indigo-400" />
            වාර්ෂික ලේඛනාගාරය (Annual Archive Ledger)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            වසර අනුව සුරක්ෂිත කළ ඉතිහාස වාර්තා සහ Dialog විගණන ලේඛන
          </p>
        </div>

        <button
          onClick={handleCreateSnapshot}
          disabled={archiving}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
        >
          <Database className="w-4 h-4" />
          {archiving ? 'සුරක්ෂිත කරමින්...' : 'නව වාර්ෂික Snapshot එකක් ගන්න'}
        </button>
      </div>

      {archiveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          වාර්ෂික Snapshot එක සාර්ථකව ගබඩා විය!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {archiveYears.map((item) => (
          <div key={item.year} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-white text-base">{item.year} Annual Ledger</span>
              <p className="text-xs text-slate-400 mt-1">
                වාර්තා: {item.records} • ප්‍රමාණය: {item.size}
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {item.status}
              </span>
            </div>
            <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1.5 transition-all">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DataRetentionCenter: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                දත්ත රඳවා තබා ගැනීමේ සහ ලේඛනාගාර කේන්ද්‍රය • Data Retention Center
              </h1>
              <p className="text-sm text-slate-400">
                Dialog Sayura & Govi Mithuru දත්ත සුරක්ෂිතතාව සහ දිගුකාලීන ලේඛනාගාරය
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              100% Immutable Archive
            </span>
          </div>
        </div>
      </div>

      <AnnualArchivePage role="owner" />
    </div>
  );
};
