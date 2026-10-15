import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import {
  BarChart2,
  Calendar,
  Clock,
  PhoneCall,
  TrendingUp,
  Users,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

export interface ProductionLogMetric {
  present: number;
  turnoutPercent: number;
  calls: number;
  talkTimeMinutes: number;
  callsPerAgent: number;
  sales: number;
}

export const PRODUCTION_LOG_METRICS: Record<string, ProductionLogMetric> = {
  '2026-09-03': { present: 1, turnoutPercent: 100, calls: 25, talkTimeMinutes: 85, callsPerAgent: 25, sales: 2 },
  '2026-09-04': { present: 1, turnoutPercent: 100, calls: 26, talkTimeMinutes: 88, callsPerAgent: 26, sales: 2 },
  '2026-09-05': { present: 1, turnoutPercent: 100, calls: 8, talkTimeMinutes: 17, callsPerAgent: 8, sales: 1 },
  '2026-10-02': { present: 1, turnoutPercent: 100, calls: 24, talkTimeMinutes: 82, callsPerAgent: 24, sales: 2 },
};

export const DailySummaryAnalyticsLedger: React.FC = () => {
  const { currentUser } = useAuth();
  const { attendance, sales } = useData();

  const [searchDate, setSearchDate] = useState('');
  const [selectedMetricDate, setSelectedMetricDate] = useState<string | null>('2026-10-02');

  if (!currentUser) return null;

  const entries = Object.entries(PRODUCTION_LOG_METRICS)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .filter(([date]) => (!searchDate ? true : date.includes(searchDate)));

  const activeMetric = selectedMetricDate ? PRODUCTION_LOG_METRICS[selectedMetricDate] : entries[0]?.[1];

  const totalTrackedCalls = Object.values(PRODUCTION_LOG_METRICS).reduce((acc, m) => acc + m.calls, 0);
  const totalTrackedSales = Object.values(PRODUCTION_LOG_METRICS).reduce((acc, m) => acc + m.sales, 0);
  const totalTrackedMinutes = Object.values(PRODUCTION_LOG_METRICS).reduce((acc, m) => acc + m.talkTimeMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                දෛනික සාරාංශ විශ්ලේෂණ ලෙජරය • Daily Summary Analytics Ledger
              </h1>
              <p className="text-sm text-slate-400">
                Dialog සක්‍රිය කිරීම්, IVR ඇමතුම් කාලය සහ ක්ෂේත්‍ර පැමිණීම් වාර්තා ලේඛනය
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              Verified Production Ledger Logs
            </span>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">සමස්ත ඇමතුම් (Total Calls)</span>
            <PhoneCall className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2">{totalTrackedCalls}</p>
          <span className="text-xs text-slate-500">වාර්තාගත IVR ඇමතුම්</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">සමස්ත විකුණුම් (Sales)</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">{totalTrackedSales}</p>
          <span className="text-xs text-slate-500">Sayura & Govi Mithuru සක්‍රිය</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">කතා කාලය (Talk Time)</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 mt-2">{totalTrackedMinutes} min</p>
          <span className="text-xs text-slate-500">පාරිභෝගික සම්බන්ධතා කාලය</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">පැමිණීමේ අනුපාතය (Turnout)</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400 mt-2">100%</p>
          <span className="text-xs text-slate-500">ක්ෂේත්‍ර මෙහෙයුම් සම්පූර්ණයි</span>
        </div>
      </div>

      {/* Production Log Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            නිල දිනපතා ලොග් සටහන් (Production Log Data)
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="දිනය සොයන්න (YYYY-MM-DD)..."
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">දිනය (Date)</th>
                <th className="py-3 px-4">පැමිණීම (Present)</th>
                <th className="py-3 px-4">පැමිණීමේ % (Turnout)</th>
                <th className="py-3 px-4">ඇමතුම් (Calls)</th>
                <th className="py-3 px-4">කතා කාලය (Talk Time)</th>
                <th className="py-3 px-4">නියෝජිතයෙකුට ඇමතුම්</th>
                <th className="py-3 px-4">විකුණුම් (Sales)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {entries.map(([date, metric]) => (
                <tr
                  key={date}
                  onClick={() => setSelectedMetricDate(date)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    selectedMetricDate === date ? 'bg-slate-800/50 text-white font-bold' : 'text-slate-300'
                  }`}
                >
                  <td className="py-3 px-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {date}
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{metric.present}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      {metric.turnoutPercent}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{metric.calls}</td>
                  <td className="py-3 px-4 text-amber-400">{metric.talkTimeMinutes} min</td>
                  <td className="py-3 px-4 text-cyan-400">{metric.callsPerAgent}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                      {metric.sales}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
