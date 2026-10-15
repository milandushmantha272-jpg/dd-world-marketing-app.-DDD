import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import {
  CalendarCheck,
  UserX,
  TrendingUp,
  Wallet,
  Users,
  Award,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  BarChart3,
  Target,
  CheckCircle2
} from 'lucide-react';

export const ExecutiveSummariesPage: React.FC = () => {
  const { users, attendance, sales, teams, monthlyTargets } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate dates for past 7 days (Weekly) and current month (Monthly)
  const todayDate = new Date();
  const weekAgoDate = new Date(todayDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-08"

  // 1. Total Active Staff (Agents + Team Leaders)
  const totalStaff = users.filter((u) => u && u.role !== 'owner');
  const totalStaffCount = totalStaff.length;

  // 2. Attendance Present Count Today
  const todayAttendanceRecords = attendance.filter((a) => a.date === todayStr);
  const presentCount = todayAttendanceRecords.length;

  // 3. Absent Count Today
  const absentCount = Math.max(0, totalStaffCount - presentCount);

  // 4. Sales Calculations (Count / Units)
  const todaySales = sales.filter((s) => s.date === todayStr);
  const todaySalesCount = todaySales.reduce((acc, s) => acc + (s.quantity || 1), 0);

  const weeklySales = sales.filter((s) => {
    if (!s.date) return false;
    const d = new Date(s.date);
    return d >= weekAgoDate && d <= todayDate;
  });
  const weeklySalesCount = weeklySales.reduce((acc, s) => acc + (s.quantity || 1), 0);

  const monthlySales = sales.filter((s) => s.date && s.date.startsWith(currentMonthPrefix));
  const monthlySalesCount = monthlySales.reduce((acc, s) => acc + (s.quantity || 1), 0);

  // Targets (Govimithuru + Sayuru)
  const targetGovimithuruIvr = monthlyTargets?.govimithuruIvr || 1000;
  const targetGovimithuruApp = monthlyTargets?.govimithuruApp || 500;
  const targetSayuruIvr = monthlyTargets?.sayuruIvr || 500;
  const targetSayuruApp = monthlyTargets?.sayuruApp || 300;
  const totalMonthlyUnitTarget = targetGovimithuruIvr + targetGovimithuruApp + targetSayuruIvr + targetSayuruApp;

  const monthlyAchievementPct = Math.min(
    100,
    Math.round((monthlySalesCount / (totalMonthlyUnitTarget || 1)) * 100)
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Daily / Weekly / Monthly Summaries
            </span>
            <span className="text-xs text-slate-400 font-mono">Date: {todayStr}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            පද්ධති පරිපාලන සංක්‍ෂිප්ත වාර්තා (Executive Summaries)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            දිනපතා පැමිණීම, නොපැමිණීම්, සතිපතා හා මාසික Sales ප්‍රමාණය, සහ Target & Achieved සසඳන නිල සාරාංශය.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-300">Target & Achievement Engine Active</span>
        </div>
      </div>

      {/* Target vs Achievement Banner Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                මාසික Sales Target vs Achieved සාරාංශය ({currentMonthPrefix})
              </h3>
              <p className="text-xs text-slate-400">
                ගොවිමිතුරු (#616#) සහ සයුරු (#828#) මාසික අලෙවි ඉලක්ක සසඳන මීටරය
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {monthlySalesCount} / {totalMonthlyUnitTarget} <span className="text-xs text-slate-300 font-normal">Units</span>
            </div>
            <div className="text-xs font-bold text-emerald-300">
              {monthlyAchievementPct}% Completed
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/30"
            style={{ width: `${monthlyAchievementPct}%` }}
          ></div>
        </div>
      </div>

      {/* Daily, Weekly, Monthly KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Today Attendance */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-teal-500/30 shadow-xl space-y-3 relative overflow-hidden group hover:border-teal-500/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-teal-300 uppercase tracking-wider">
              අද පැමිණීම (Today Present)
            </span>
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-black text-white font-mono">{presentCount}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>සමස්ත සේවකයින්: {totalStaffCount}</span>
            <span className="text-teal-400 font-bold">
              {totalStaffCount > 0 ? Math.round((presentCount / totalStaffCount) * 100) : 0}% Present
            </span>
          </div>
        </div>

        {/* KPI 2: Today Absent */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-xl space-y-3 relative overflow-hidden group hover:border-rose-500/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-300 uppercase tracking-wider">
              අද නොපැමිණි (Today Absent)
            </span>
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-300 border border-rose-500/20">
              <UserX className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-black text-rose-400 font-mono">{absentCount}</div>
          <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>අද නොපැමිණි ගණන</span>
            <span className="text-rose-400 font-bold">
              {totalStaffCount > 0 ? Math.round((absentCount / totalStaffCount) * 100) : 0}% Absent
            </span>
          </div>
        </div>

        {/* KPI 3: Weekly Sales Summary */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-xl space-y-3 relative overflow-hidden group hover:border-emerald-500/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              සතිපතා Sales (Weekly)
            </span>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {weeklySalesCount} <span className="text-xs text-slate-400 font-normal">Units</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>අද Sales: {todaySalesCount} Units</span>
            <span className="text-emerald-400 font-bold">Past 7 Days</span>
          </div>
        </div>

        {/* KPI 4: Monthly Sales Summary */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-3 relative overflow-hidden group hover:border-purple-500/60 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-300 uppercase tracking-wider">
              මාසික Sales (Monthly)
            </span>
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono">
            {monthlySalesCount} / {totalMonthlyUnitTarget}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2">
            <span>Target Achieved</span>
            <span className="text-purple-400 font-bold">{monthlyAchievementPct}%</span>
          </div>
        </div>
      </div>

      {/* Team Level Summary Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              කණ්ඩායම් (Teams) මට්ටමින් පැමිණීම සහ Sales Target Achievement Summaries
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              එක් එක් දිස්ත්‍රික් කණ්ඩායමේ අද පැමිණීම, නොපැමිණීම්, අද/සතිපතා/මාසික Sales Units එකතුව.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Team Name</th>
                <th className="p-3">Team Leader</th>
                <th className="p-3">Total Staff</th>
                <th className="p-3">අද පැමිණි</th>
                <th className="p-3">අද නොපැමිණි</th>
                <th className="p-3 text-center">අද Sales</th>
                <th className="p-3 text-center">සතිපතා Sales</th>
                <th className="p-3 text-right">මාසික Sales (Units)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {teams.map((t) => {
                const teamLeader = users.find(
                  (u) => u && (u.id === t.leaderId || (u.role === 'team_leader' && u.teamId === t.id))
                );
                const teamMembers = users.filter((u) => u && u.role === 'agent' && u.teamId === t.id);
                const teamAttendance = attendance.filter(
                  (a) => a.teamId === t.id && a.date === todayStr
                );
                const tPresent = teamAttendance.length;
                const tAbsent = Math.max(0, teamMembers.length - tPresent);

                // Team Sales calculations
                const tTodaySales = sales
                  .filter((s) => s.teamId === t.id && s.date === todayStr)
                  .reduce((sum, s) => sum + (s.quantity || 1), 0);

                const tWeeklySales = sales
                  .filter((s) => {
                    if (s.teamId !== t.id || !s.date) return false;
                    const d = new Date(s.date);
                    return d >= weekAgoDate && d <= todayDate;
                  })
                  .reduce((sum, s) => sum + (s.quantity || 1), 0);

                const tMonthlySales = sales
                  .filter((s) => s.teamId === t.id && s.date && s.date.startsWith(currentMonthPrefix))
                  .reduce((sum, s) => sum + (s.quantity || 1), 0);

                return (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 font-extrabold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      {t.name}
                    </td>
                    <td className="p-3 text-amber-300 font-bold">
                      {teamLeader ? teamLeader.name : t.leaderName}
                    </td>
                    <td className="p-3 text-slate-300 font-mono">{teamMembers.length} Agents</td>
                    <td className="p-3 font-bold text-teal-300 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
                        {tPresent} Present
                      </span>
                    </td>
                    <td className="p-3 font-bold text-rose-300 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                        {tAbsent} Absent
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-200 font-mono">
                      {tTodaySales} Units
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-300 font-mono">
                      {tWeeklySales} Units
                    </td>
                    <td className="p-3 text-right font-black text-emerald-400 font-mono">
                      {tMonthlySales} Units
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
