import React, { useState } from 'react';
import { Award, FileText, Upload, Plus, CheckCircle2, TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const DialogPerformanceManager: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, dialogPerformanceRecords, updateDialogPerformanceRecord } = useData();

  const isOwner = currentUser?.role === 'owner';

  // Entry Form State for Owner
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [reportMonth, setReportMonth] = useState('2026-08');
  const [productCode, setProductCode] = useState<'govimithuru' | 'sayuru'>('govimithuru');
  const [dialogSales, setDialogSales] = useState('150');
  const [customerUsage, setCustomerUsage] = useState('88% Active Usage');
  const [qualityResult, setQualityResult] = useState('94.5% Grade A');
  const [revenueLkr, setRevenueLkr] = useState('45000');
  const [pointsScore, setPointsScore] = useState('950');

  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const myRecords = dialogPerformanceRecords.filter((r) => {
    if (isOwner) return true;
    if (currentUser?.role === 'team_leader') {
      const myTeamAgentIds = users.filter((u) => u.teamLeaderId === currentUser.id || u.teamId === currentUser.teamId).map((u) => u.id);
      return myTeamAgentIds.includes(r.agentId) || r.agentId === currentUser.id;
    }
    return r.agentId === currentUser?.id;
  });

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId) return;

    const targetUser = users.find((u) => u.id === selectedAgentId);
    if (!targetUser) return;

    updateDialogPerformanceRecord({
      agentId: targetUser.id,
      agentCode: targetUser.agentCode || 'AG-000',
      agentName: targetUser.name,
      teamId: targetUser.teamId || 'team_direct',
      reportDate: reportMonth,
      productCode,
      dialogSales: parseInt(dialogSales, 10) || 0,
      customerUsage,
      qualityResult,
      revenueLkr: parseFloat(revenueLkr) || 0,
      pointsScore: parseInt(pointsScore, 10) || 0,
      updatedAt: new Date().toISOString(),
    });

    setSavedMsg(`✅ ${targetUser.name} ගේ Dialog නිල වාර්තාව සාර්ථකව යාවත්කාලීන කරන ලදී.`);
    setTimeout(() => setSavedMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 rounded-3xl p-6 shadow-xl space-y-2">
        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
          DIALOG OFFICIAL RECORDS &amp; MANAGEMENT AUDIT
        </span>
        <h2 className="text-xl font-black text-white">
          ඩයලොග් නිල විකුණුම්, තත්ත්ව, ආදායම් සහ සේවා ලකුණු වාර්තා (Dialog Official Management Records)
        </h2>
        <p className="text-xs text-slate-300">
          ඩයලොග් ආයතනයෙන් ලැබෙන නිල Sales, Customer Usage, Quality Result %, Revenue සහ Performance Points වාර්තා මෙහි පද්ධතියට එක්කර සමාලෝචනය කළ හැක.
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Entry Form for Owner */}
      {isOwner && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> ඩයලොග් නිල වාර්තාවක් ඇතුළත් කරන්න (Owner Update)
          </h3>

          <form onSubmit={handleSaveRecord} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-300">නියෝජිතයා (Agent)</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 outline-none"
              >
                <option value="">නියෝජිතයා තෝරන්න...</option>
                {users.filter((u) => u.role === 'agent' || u.role === 'team_leader').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.agentCode || 'AG'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">වාර්තා මාසය (Report Month)</label>
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">නිෂ්පාදනය (Product)</label>
              <select
                value={productCode}
                onChange={(e) => setProductCode(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 outline-none"
              >
                <option value="govimithuru">ගොවිමිතුරු (#616#)</option>
                <option value="sayuru">සයුරු (#828#)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Dialog Sales (Qty)</label>
              <input
                type="number"
                value={dialogSales}
                onChange={(e) => setDialogSales(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Customer Usage</label>
              <input
                type="text"
                placeholder="උදා: 88% Active Usage"
                value={customerUsage}
                onChange={(e) => setCustomerUsage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Quality Result</label>
              <input
                type="text"
                placeholder="උදා: 95% Grade A"
                value={qualityResult}
                onChange={(e) => setQualityResult(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Revenue (LKR)</label>
              <input
                type="number"
                value={revenueLkr}
                onChange={(e) => setRevenueLkr(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">Performance Points (0 - 1000)</label>
              <input
                type="number"
                value={pointsScore}
                onChange={(e) => setPointsScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-blue-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                disabled={!selectedAgentId}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Dialog වාර්තාව සුරකින්න
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Performance Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> ඩයලොග් නිල වාර්තා ලැයිස්තුව ({myRecords.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950">
                <th className="p-3">Agent</th>
                <th className="p-3">Month</th>
                <th className="p-3">Product</th>
                <th className="p-3">Dialog Sales</th>
                <th className="p-3">Usage %</th>
                <th className="p-3">Quality</th>
                <th className="p-3">Revenue (LKR)</th>
                <th className="p-3">Points / Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {myRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-950/50">
                  <td className="p-3">
                    <div className="font-bold text-white">{r.agentName}</div>
                    <div className="text-[10px] font-mono text-cyan-300">{r.agentCode}</div>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{r.reportDate}</td>
                  <td className="p-3 font-bold text-amber-300 capitalize">{r.productCode}</td>
                  <td className="p-3 font-bold text-emerald-400">{r.dialogSales} Qty</td>
                  <td className="p-3 text-slate-300">{r.customerUsage}</td>
                  <td className="p-3 text-cyan-300 font-bold">{r.qualityResult}</td>
                  <td className="p-3 font-bold text-white">Rs. {r.revenueLkr.toLocaleString()}</td>
                  <td className="p-3 font-bold text-emerald-300">{r.pointsScore || 950} Pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
