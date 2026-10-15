import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Download,
  Calendar,
  Clock,
  User,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  Lock,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { AuditTrailEntry } from '../../../types';

export const AuditTrailPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { auditLogs, addAuditLog, users, activations } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditTrailEntry | null>(null);

  // New Log Form State
  const [newAction, setNewAction] = useState('SUPERVISOR_NOTE');
  const [newCategory, setNewCategory] = useState<'SECURITY' | 'VERIFICATION' | 'USSD_OPERATION' | 'ATTENDANCE' | 'SALES' | 'MANAGEMENT'>('MANAGEMENT');
  const [newStatus, setNewStatus] = useState<'SUCCESS' | 'WARNING' | 'FAILED' | 'INFO'>('INFO');
  const [targetAgentCode, setTargetAgentCode] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedCategory !== 'ALL' && log.category !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && log.status !== selectedStatus) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchAction = log.action.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        const matchActor = log.actorName.toLowerCase().includes(q);
        const matchTargetCode = log.targetAgentCode?.toLowerCase().includes(q);
        const matchRef = log.referenceId?.toLowerCase().includes(q);
        if (!matchAction && !matchDetails && !matchActor && !matchTargetCode && !matchRef) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, selectedCategory, selectedStatus, searchTerm]);

  // Key KPI Metrics
  const metrics = useMemo(() => {
    const total = auditLogs.length;
    const security = auditLogs.filter((l) => l.category === 'SECURITY').length;
    const ussdOps = auditLogs.filter((l) => l.category === 'USSD_OPERATION').length;
    const warnings = auditLogs.filter((l) => l.status === 'WARNING' || l.status === 'FAILED').length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = auditLogs.filter((l) => l.timestamp.startsWith(today)).length;
    return { total, security, ussdOps, warnings, todayCount };
  }, [auditLogs]);

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || !currentUser) return;

    setIsSubmitting(true);
    const targetUser = users.find((u) => u.agentCode === targetAgentCode.trim());

    addAuditLog({
      action: newAction,
      category: newCategory,
      status: newStatus,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      targetUserId: targetUser?.id,
      targetUserName: targetUser?.name,
      targetAgentCode: targetAgentCode.trim() || undefined,
      referenceId: referenceId.trim() || undefined,
      details: details.trim(),
    });

    setIsSubmitting(false);
    setIsAddModalOpen(false);
    setDetails('');
    setReferenceId('');
    setTargetAgentCode('');
  };

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Action', 'Category', 'Status', 'Actor', 'Target Agent', 'Reference', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      l.action,
      l.category,
      l.status,
      `${l.actorName} (${l.actorRole})`,
      l.targetAgentCode || '',
      l.referenceId || '',
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DD_WORLD_AUDIT_LOGS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                Immutable System Audit Trail &amp; Change Logger
              </span>
              <span className="text-xs text-slate-500 font-mono">v5.3 Live</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              පද්ධති විගණන ලෙජරය (Audit Trail)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              සියලුම Login/Logout, USSD Activations, ID අනුමැතීන්, සහ ආරක්ෂක ක්‍රියාකාරකම් පිළිබඳ සම්පූර්ණ ලොග් සටහන.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-black text-white shadow-lg shadow-red-600/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log එකක් එක් කරන්න</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">මුළු Log ගණන</span>
            <span className="text-xl font-black text-white font-mono mt-1 block">{metrics.total}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">අද දින ක්‍රියා</span>
            <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">{metrics.todayCount}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">USSD සක්‍රියතා</span>
            <span className="text-xl font-black text-blue-400 font-mono mt-1 block">{metrics.ussdOps}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">ආරක්ෂක සටහන්</span>
            <span className="text-xl font-black text-amber-400 font-mono mt-1 block">{metrics.security}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block">අනතුරු ඇඟවීම්</span>
            <span className="text-xl font-black text-rose-400 font-mono mt-1 block">{metrics.warnings}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by action, agent code (e.g. 9074), actor, reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Categories</option>
            <option value="SECURITY">Security / Login</option>
            <option value="USSD_OPERATION">USSD Operations</option>
            <option value="VERIFICATION">ID Verification</option>
            <option value="ATTENDANCE">GPS Attendance</option>
            <option value="SALES">Sales Ledger</option>
            <option value="MANAGEMENT">Management</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Main Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              විගණන ඉතිහාසය (Audit Ledger Entries: {filteredLogs.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Real-time Cloud Sync Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">වේලාව / දිනය</th>
                <th className="py-3 px-4">ක්‍රියාව (Action)</th>
                <th className="py-3 px-4">කාණ්ඩය (Category)</th>
                <th className="py-3 px-4">ක්‍රියාකරු (Actor)</th>
                <th className="py-3 px-4">ඉලක්කගත Agent / Ref</th>
                <th className="py-3 px-4">විස්තරය (Details)</th>
                <th className="py-3 px-4 text-center">තත්ත්වය</th>
                <th className="py-3 px-4 text-center">ක්‍රියා</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    විගණන සටහන් කිසිවක් හමු නොවීය.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const statusColors = {
                    SUCCESS: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    INFO: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                    WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                    FAILED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                  };

                  const formattedTime = new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const formattedDate = new Date(log.timestamp).toLocaleDateString('en-GB');

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition">
                      {/* TIMESTAMP */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formattedTime}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{formattedDate}</div>
                      </td>

                      {/* ACTION */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {log.action}
                        </span>
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-bold text-slate-400">
                          {log.category}
                        </span>
                      </td>

                      {/* ACTOR */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{log.actorName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">{log.actorRole}</div>
                      </td>

                      {/* TARGET AGENT / REFERENCE */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.targetAgentCode ? (
                          <div className="font-mono text-emerald-400 font-bold">
                            Agent: {log.targetAgentCode}
                          </div>
                        ) : log.referenceId ? (
                          <div className="font-mono text-cyan-400 text-[11px]">
                            {log.referenceId}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                        {log.targetUserName && (
                          <div className="text-[10px] text-slate-400">{log.targetUserName}</div>
                        )}
                      </td>

                      {/* DETAILS */}
                      <td className="py-3 px-4 max-w-xs truncate" title={log.details}>
                        <span className="text-slate-300">{log.details}</span>
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            statusColors[log.status] || statusColors.INFO
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>

                      {/* VIEW DETAIL ACTION */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLogDetail(log)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="View Full Audit Payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD MANUAL AUDIT LOG ENTRY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-black text-white">විගණන සටහනක් එක් කරන්න (Add Audit Entry)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Action Type</label>
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="SUPERVISOR_NOTE">Supervisor Field Note</option>
                    <option value="USSD_AUDIT">USSD Operation Audit</option>
                    <option value="ID_VERIFICATION">ID Verification Review</option>
                    <option value="SECURITY_CHECK">Security &amp; Device Check</option>
                    <option value="CARRIER_INSPECTION">Dialog Carrier Inspection</option>
                    <option value="MANAGEMENT_ACTION">Management Action</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="MANAGEMENT">MANAGEMENT</option>
                    <option value="SECURITY">SECURITY</option>
                    <option value="USSD_OPERATION">USSD_OPERATION</option>
                    <option value="VERIFICATION">VERIFICATION</option>
                    <option value="SALES">SALES</option>
                    <option value="ATTENDANCE">ATTENDANCE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Target Agent Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9074, 9087"
                    value={targetAgentCode}
                    onChange={(e) => setTargetAgentCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">Reference ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ACT-20261015-XXX"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Audit Status</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['INFO', 'SUCCESS', 'WARNING', 'FAILED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-1.5 rounded-xl text-xs font-black transition border ${
                        newStatus === st
                          ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/25'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  විගණන සටහන / නිරීක්ෂණය (Audit Details &amp; Findings) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="ඇතුළත් කරන්න (Enter detailed audit finding, compliance observation, or shift log)..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !details.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-black text-white shadow-lg shadow-red-600/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'සුරකිමින්...' : 'සුරකින්න (Save Log)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW AUDIT LOG DETAIL */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-black text-white">විගණන සටහන් විස්තර (Audit Log Payload)</h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-500 font-mono text-[10px]">LOG IDENTIFIER</div>
                <div className="font-mono text-amber-400 font-bold">{selectedLogDetail.id}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 font-mono text-[10px]">ACTION &amp; CATEGORY</div>
                  <div className="font-bold text-white font-mono">{selectedLogDetail.action}</div>
                  <div className="text-[11px] text-slate-400">{selectedLogDetail.category}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 font-mono text-[10px]">STATUS</div>
                  <div className="font-bold text-white font-mono">{selectedLogDetail.status}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(selectedLogDetail.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 font-mono text-[10px]">RECORDED BY</div>
                  <div className="font-bold text-white">{selectedLogDetail.actorName}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">{selectedLogDetail.actorRole}</div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-slate-500 font-mono text-[10px]">TARGET ENTITY</div>
                  <div className="font-bold text-emerald-400 font-mono">
                    {selectedLogDetail.targetAgentCode ? `Agent: ${selectedLogDetail.targetAgentCode}` : 'System Wide'}
                  </div>
                  {selectedLogDetail.referenceId && (
                    <div className="text-[10px] text-cyan-400 font-mono">{selectedLogDetail.referenceId}</div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-slate-500 font-mono text-[10px]">PAYLOAD &amp; DETAILS</div>
                <p className="text-slate-200 leading-relaxed font-sans">{selectedLogDetail.details}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
              >
                වසන්න (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailPage;
