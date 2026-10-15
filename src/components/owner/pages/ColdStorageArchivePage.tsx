import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import {
  Archive,
  ShieldAlert,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Database,
  Calendar,
  Layers,
  FileText,
  Clock,
} from 'lucide-react';

export const ColdStorageArchivePage: React.FC = () => {
  const {
    coldArchives,
    createColdArchive,
    securityAlerts,
    resolveSecurityAlert,
  } = useData();

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().substring(0, 7); // Previous month YYYY-MM
  });
  const [archiveNotes, setArchiveNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateArchive = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const archive = createColdArchive(selectedMonth, archiveNotes || 'සාමාන්‍ය මාසික දත්ත ගොනුව (Cold Storage Archive)');
      setSuccessMsg(`✅ ${selectedMonth} මාසය සඳහා සීතල ගබඩා ලේඛනාගාරය (Cold Archive) සාර්ථකව නිර්මාණය විය. මුළු වාර්තා: ${archive.totalRecords}`);
      setArchiveNotes('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`දෝෂයකි: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownloadArchiveJson = (archiveId: string) => {
    const target = coldArchives.find((a) => a.id === archiveId);
    if (!target) return;
    const blob = new Blob([JSON.stringify(target, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DDWorld_ColdArchive_${target.month}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-xl">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Cold Storage Archiving & Security Audit Engine</h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                  Zero Lag Optimization
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                පසුගිය මාසවල විකුණුම් හා පැමිණීම් වාර්තා සම්පීඩනය කර සීතල ගබඩාවට (Cold Storage) යැවීමෙන් පද්ධතියේ වේගවත්භාවය හා මතක භාවිතය උපරිම මට්ටමක පවත්වා ගැනීම.
              </p>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Archive Creation Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <Archive className="w-5 h-5 text-blue-400" />
            <span>නව මාසික ලේඛනාගාරයක් නිර්මාණය (Create Archive)</span>
          </div>
          <p className="text-xs text-slate-400">
            අදාළ මාසය තෝරා Snapshot එකක් ගබඩා කරන්න. මෙමගින් active memory එක නිදහස් වේ.
          </p>

          <form onSubmit={handleCreateArchive} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">සංරක්ෂණය කරන මාසය (Month)</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                required
                className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">විස්තරය / සටහන් (Notes)</label>
              <textarea
                value={archiveNotes}
                onChange={(e) => setArchiveNotes(e.target.value)}
                placeholder="උදා: 2026 අගෝස්තු නිල මාසික වාර්තා සංවෘත කිරීම..."
                rows={3}
                className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
            >
              <Archive className="w-4 h-4" />
              <span>{isCreating ? 'සම්පීඩනය වෙමින් පවතී...' : 'Cold Storage වෙත තැන්පත් කරන්න'}</span>
            </button>
          </form>
        </div>

        {/* Existing Archives List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white font-bold text-base">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>සංරක්ෂිත මාසික වාර්තා (Archived Snapshots)</span>
            </div>
            <span className="text-xs text-slate-400">මුළු ගොනු: {coldArchives.length}</span>
          </div>

          {coldArchives.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-2xl border border-slate-800/60">
              දැනට කිසිදු මාසික Cold Archive එකක් තැන්පත් කර නොමැත.
            </div>
          ) : (
            <div className="space-y-3">
              {coldArchives.map((arc) => (
                <div
                  key={arc.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="text-sm font-bold text-white">{arc.month} Month Snapshot</h5>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md">
                        {arc.totalRecords} Records
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{arc.notes}</div>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-3">
                      <span>සංරක්ෂණය කළේ: {arc.archivedBy}</span>
                      <span>දිනය: {new Date(arc.archivedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadArchiveJson(arc.id)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center space-x-1.5 text-xs font-semibold shrink-0 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>JSON බාගන්න</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security Alerts Stream */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-bold text-base">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>ආරක්ෂක අවදානම් සහ GPS වංචා විමසුම් (Live Security & Anti-Cheat Alerts)</span>
          </div>
          <span className="text-xs text-slate-400">ක්‍රියාකාරී අවදානම්: {securityAlerts.filter((a) => a.status === 'open').length}</span>
        </div>

        {securityAlerts.length === 0 ? (
          <div className="p-8 text-center text-xs text-emerald-400 bg-emerald-950/20 rounded-2xl border border-emerald-500/20">
            ✅ කිසිදු ආරක්ෂක හෝ GPS වංචනික අනතුරු ඇඟවීමක් වාර්තා වී නොමැත. පද්ධතිය 100% ආරක්ෂිතයි.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {securityAlerts.map((alert) => (
              <div key={alert.id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {alert.type} • {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-white">{alert.userName} ({alert.agentCode})</span>
                    <span className="text-[11px] text-slate-500">{alert.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300">{alert.reason}</p>
                </div>

                {alert.status === 'open' ? (
                  <button
                    onClick={() => resolveSecurityAlert(alert.id, 'Owner Reviewed & Verified')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    විමසා අනුමත කරන්න (Resolve)
                  </button>
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold shrink-0">සමාලෝචනය කරන ලදී</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
