import React from 'react';
import { useData } from '../../context/DataContext';
import { Users, Award, TrendingUp, CalendarCheck, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';

interface AllTeamsOverviewGridProps {
  onOpenTeamPage: (teamId: string) => void;
}

export const AllTeamsOverviewGrid: React.FC<AllTeamsOverviewGridProps> = ({ onOpenTeamPage }) => {
  const { teams, users, sales, attendance } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            සියලුම කණ්ඩායම් (All Teams Overview &amp; Dedicated Pages)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            එක් එක් කණ්ඩායමේ කාර්යසාධනය නිරීක්ෂණය කිරීමට අදාළ Team Card එක මත ක්ලික් කරන්න.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold">
          {teams.length} Active Teams Registered
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((t) => {
          const leader = users.find((u) => u && (u.id === t.leaderId || (u.role === 'team_leader' && u.teamId === t.id)));
          const ags = users.filter((u) => u && u.role === 'agent' && u.teamId === t.id);
          const teamSales = sales.filter((s) => s.teamId === t.id);
          const totalUnits = teamSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
          const todayAtt = attendance.filter((a) => a.teamId === t.id && a.date === todayStr).length;

          return (
            <div
              key={t.id}
              className="group p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition duration-300 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {t.name.substring(0, 1)}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    ID: {t.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-blue-400 transition">
                    {t.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{t.description}</p>
                </div>

                {/* Leader info */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-amber-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Team Leader
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {leader ? leader.name : t.leaderName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {leader?.agentCode || 'TL Code'}
                  </div>
                </div>

                {/* Quick metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Agents</span>
                    <span className="font-extrabold text-blue-300">{ags.length} Members</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">අද පැමිණීම</span>
                    <span className="font-extrabold text-teal-300">{todayAtt} Present</span>
                  </div>
                  <div className="col-span-2 p-2 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">මුළු විකුණුම්</span>
                    <span className="font-black text-emerald-400">{totalUnits} Units</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenTeamPage(t.id)}
                className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition flex items-center justify-center gap-1 shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40"
              >
                <span>විශේෂිත Team Page එක බලන්න</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
