import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Users, Award, ShieldCheck, ChevronRight, UserPlus, Search, Building2, CheckCircle2 } from 'lucide-react';
import { Team, User } from '../../../types';

export const OwnerCareerManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { teams, users, updateTeam } = useData();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team_direct');
  const [searchAgent, setSearchAgent] = useState('');

  if (!currentUser) return null;

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const teamAgents = users.filter(
    (u) => u.role === 'agent' && (u.teamId === currentTeam?.id || u.teamName?.toLowerCase().includes(currentTeam?.name.toLowerCase().split(' ')[0] || ''))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                කණ්ඩායම් සහ වෘත්තීය කළමනාකරණය • Career Management Page
              </h1>
              <p className="text-sm text-slate-400">
                Dialog Sayura & Govi Mithuru ක්ෂේත්‍ර කණ්ඩායම්, Team Leaders සහ නියෝජිත ධූරාවලිය
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400">
              සමස්ත කණ්ඩායම්: {teams.length}
            </span>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((t) => {
          const count = users.filter(
            (u) => u.role === 'agent' && (u.teamId === t.id || u.teamName?.toLowerCase().includes(t.name.toLowerCase().split(' ')[0]))
          ).length;

          return (
            <button
              key={t.id}
              onClick={() => setSelectedTeamId(t.id)}
              className={`p-5 rounded-2xl border text-left transition-all shadow-lg flex flex-col justify-between ${
                selectedTeamId === t.id
                  ? 'bg-purple-950/40 border-purple-500/60 ring-2 ring-purple-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-purple-400">
                    {t.name.charAt(0)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20">
                    {count} Agents
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">{t.name}</h3>
                <p className="text-xs text-slate-400 mt-1">Leader: {t.leaderName}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>View Details</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Team Members */}
      {currentTeam && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                {currentTeam.name} — සාමාජිකයින් ලැයිස්තුව
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                කණ්ඩායම් නායකයා: {currentTeam.leaderName}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="නියෝජිතයා සොයන්න..."
                value={searchAgent}
                onChange={(e) => setSearchAgent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">නම (Name)</th>
                  <th className="py-3 px-4">කේතය (Agent Code)</th>
                  <th className="py-3 px-4">දුරකථනය (Mobile)</th>
                  <th className="py-3 px-4">තනතුර (Designation)</th>
                  <th className="py-3 px-4">සේවා තත්ත්වය (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {teamAgents
                  .filter((a) => (!searchAgent ? true : a.name.toLowerCase().includes(searchAgent.toLowerCase()) || a.agentCode?.includes(searchAgent)))
                  .map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{agent.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-amber-400 font-bold">{agent.agentCode || 'N/A'}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-300">{agent.mobile || agent.phone || 'N/A'}</td>
                      <td className="py-3 px-4 text-xs text-slate-400">{agent.designation || 'Field Marketing Agent'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {agent.employmentStatus || 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
