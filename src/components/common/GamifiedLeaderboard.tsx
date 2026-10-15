import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Star,
  Users,
  Flame,
  CheckCircle2,
  CalendarCheck,
  Zap,
} from 'lucide-react';

interface LeaderboardItem {
  userId: string;
  name: string;
  role: 'team_leader' | 'agent';
  agentCode: string;
  teamName: string;
  avatar?: string;
  totalSales: number;
  totalUnits: number;
  attendanceDays: number;
  performanceScore: number;
  rank: number;
}

export const GamifiedLeaderboard: React.FC = () => {
  const { users, sales, attendance } = useData();
  const [filterRole, setFilterRole] = useState<'all' | 'agent' | 'team_leader'>('all');
  const [timeFilter, setTimeFilter] = useState<'month' | 'all'>('month');

  const leaderboardData = useMemo(() => {
    const currentMonthPrefix = new Date().toISOString().substring(0, 7);

    const relevantSales = timeFilter === 'month'
      ? sales.filter((s) => s.date.startsWith(currentMonthPrefix))
      : sales;

    const relevantAttendance = timeFilter === 'month'
      ? attendance.filter((a) => a.date.startsWith(currentMonthPrefix))
      : attendance;

    // Filter agents and team leaders only (Owner doesn't compete in field sales)
    const candidates = users.filter((u) => u.role === 'agent' || u.role === 'team_leader');

    const mapped: LeaderboardItem[] = candidates.map((u) => {
      const userSales = relevantSales.filter((s) => s.agentId === u.id);
      const userAtt = relevantAttendance.filter((a) => a.agentId === u.id);

      const totalSales = userSales.length;
      const totalUnits = userSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
      const attendanceDays = userAtt.length;

      // Gamification Formula: Units * 50 + Attendance * 20
      const performanceScore = totalUnits * 50 + attendanceDays * 20;

      return {
        userId: u.id,
        name: u.name,
        role: u.role as 'team_leader' | 'agent',
        agentCode: u.agentCode || 'AG-000',
        teamName: u.teamName || 'Team Alpha',
        avatar: u.avatar,
        totalSales,
        totalUnits,
        attendanceDays,
        performanceScore,
        rank: 0,
      };
    });

    // Sort by performance score descending
    mapped.sort((a, b) => b.performanceScore - a.performanceScore);

    // Assign rank
    return mapped.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [users, sales, attendance, timeFilter]);

  const filteredData = leaderboardData.filter((item) => {
    if (filterRole === 'all') return true;
    return item.role === filterRole;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-extrabold shadow-lg shadow-amber-500/10">
          <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="w-9 h-9 rounded-2xl bg-slate-300/20 border border-slate-300/40 flex items-center justify-center text-slate-300 font-extrabold">
          <Medal className="w-5 h-5 text-slate-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="w-9 h-9 rounded-2xl bg-amber-700/20 border border-amber-700/40 flex items-center justify-center text-amber-600 font-extrabold">
          <Award className="w-5 h-5 text-amber-600" />
        </div>
      );
    }
    return (
      <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-bold text-xs">
        #{rank}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-tight">DD World Gamified Leaderboard</h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Real-time Ranking
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                දක්ෂතම විකුණුම් නියෝජිතයන් හා කණ්ඩායම් නායකයින්ගේ කාර්ය සාධන ශ්‍රේණිගත කිරීම්
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  timeFilter === 'month' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                මෙම මස (This Month)
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  timeFilter === 'all' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                සමස්ත (All Time)
              </button>
            </div>

            <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilterRole('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterRole === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                සියලු දෙනා
              </button>
              <button
                onClick={() => setFilterRole('agent')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterRole === 'agent' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Agents
              </button>
              <button
                onClick={() => setFilterRole('team_leader')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filterRole === 'team_leader' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Team Leaders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Podium Top 3 Cards */}
      {filteredData.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden order-2 md:order-1">
            <div className="absolute top-3 left-3 text-xs font-bold text-slate-400 flex items-center space-x-1">
              <Medal className="w-4 h-4 text-slate-300" />
              <span>2nd Place</span>
            </div>
            <div className="w-16 h-16 rounded-full ring-2 ring-slate-400/50 p-1 mt-4 mb-2">
              <img
                src={filteredData[1]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={filteredData[1]?.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h4 className="text-base font-bold text-white">{filteredData[1]?.name}</h4>
            <div className="text-xs text-slate-400">{filteredData[1]?.teamName} • {filteredData[1]?.agentCode}</div>
            <div className="mt-3 px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-bold text-slate-200">
              {filteredData[1]?.performanceScore.toLocaleString()} Points
            </div>
          </div>

          {/* Rank 1 (Champion) */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-500/50 flex flex-col items-center text-center relative overflow-hidden order-1 md:order-2 shadow-2xl shadow-amber-900/20">
            <div className="absolute top-3 left-3 text-xs font-bold text-amber-400 flex items-center space-x-1 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>CHAMPION</span>
            </div>
            <div className="w-20 h-20 rounded-full ring-4 ring-amber-400 p-1 mt-3 mb-2 shadow-xl shadow-amber-500/20">
              <img
                src={filteredData[0]?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                alt={filteredData[0]?.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h4 className="text-lg font-extrabold text-white">{filteredData[0]?.name}</h4>
            <div className="text-xs text-amber-300 font-semibold">{filteredData[0]?.teamName} • {filteredData[0]?.agentCode}</div>
            <div className="mt-3 px-4 py-1.5 bg-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/30">
              🏆 {filteredData[0]?.performanceScore.toLocaleString()} Points
            </div>
          </div>

          {/* Rank 3 */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center relative overflow-hidden order-3">
            <div className="absolute top-3 left-3 text-xs font-bold text-amber-600 flex items-center space-x-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>3rd Place</span>
            </div>
            <div className="w-16 h-16 rounded-full ring-2 ring-amber-700/50 p-1 mt-4 mb-2">
              <img
                src={filteredData[2]?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                alt={filteredData[2]?.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <h4 className="text-base font-bold text-white">{filteredData[2]?.name}</h4>
            <div className="text-xs text-slate-400">{filteredData[2]?.teamName} • {filteredData[2]?.agentCode}</div>
            <div className="mt-3 px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-bold text-slate-200">
              {filteredData[2]?.performanceScore.toLocaleString()} Points
            </div>
          </div>
        </div>
      )}

      {/* Complete Rankings List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-white uppercase tracking-wider">සම්පූර්ණ ශ්‍රේණිගත කිරීම් ලැයිස්තුව</span>
          <span>මුළු සාමාජිකයින්: {filteredData.length}</span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {filteredData.map((item) => (
            <div
              key={item.userId}
              className="p-4 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center space-x-3.5">
                {getRankBadge(item.rank)}
                <div className="w-10 h-10 rounded-2xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                  <img
                    src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{item.name}</span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        item.role === 'team_leader'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {item.role === 'team_leader' ? 'Leader' : 'Agent'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {item.teamName} • Code: {item.agentCode}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-right">
                <div className="hidden sm:block">
                  <div className="text-xs text-slate-400">විකුණුම් (Sales)</div>
                  <div className="text-xs font-bold text-emerald-400">{item.totalUnits} Units</div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-slate-400">පැමිණීම (Attendance)</div>
                  <div className="text-xs font-bold text-blue-400">{item.attendanceDays} Days</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">ලකුණු</div>
                  <div className="text-sm font-extrabold text-amber-400 flex items-center space-x-1 justify-end">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{item.performanceScore.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
