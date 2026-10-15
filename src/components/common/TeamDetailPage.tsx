import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Users,
  Award,
  TrendingUp,
  CalendarCheck,
  Wallet,
  CalendarDays,
  MessageSquare,
  Video,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  PlusCircle,
  PhoneIncoming,
  ShieldCheck,
  Building2,
  ChevronRight,
  UserCheck,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { SriLankaGpsMapView } from './SriLankaGpsMapModal';
import { InteractiveChatBox } from './InteractiveChatBox';

interface TeamDetailPageProps {
  teamId: string;
  onBack?: () => void;
  onSelectTeam?: (teamId: string) => void;
}

export const TeamDetailPage: React.FC<TeamDetailPageProps> = ({
  teamId,
  onBack,
  onSelectTeam,
}) => {
  const { currentUser } = useAuth();
  const {
    teams,
    users,
    sales,
    attendance,
    leaves,
    messages,
    meetings,
    updateLeaveStatus,
    addProductSale,
    createMeeting,
  } = useData();

  const [activeSubTab, setActiveSubTab] = useState<
    'members' | 'sales' | 'attendance' | 'leaves' | 'meetings' | 'chat' | 'gps'
  >('members');

  // Find selected team
  const currentTeam = teams.find((t) => t.id === teamId) || teams[0];
  if (!currentTeam) return <div className="p-6 text-slate-400">Team standard data not found.</div>;

  // Filter team specific data
  const teamLeader = users.find((u) => u && (u.id === currentTeam.leaderId || (u.role === 'team_leader' && u.teamId === currentTeam.id)));
  const teamAgents = users.filter((u) => u && u.role === 'agent' && u.teamId === currentTeam.id);
  const teamSales = sales.filter((s) => s.teamId === currentTeam.id);
  const teamAttendance = attendance.filter((a) => a.teamId === currentTeam.id);
  const teamLeaves = leaves.filter((l) => l.teamId === currentTeam.id);
  const teamMeetings = meetings.filter((m) => m.teamId === currentTeam.id || m.targetAudience === 'all');

  const totalSalesRs = teamSales.reduce((acc, s) => acc + s.amount, 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceCount = teamAttendance.filter((a) => a.date === todayStr).length;
  const pendingLeavesCount = teamLeaves.filter((l) => l.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Team Switcher Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-500/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
            >
              ← ආපසු (Back)
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">
            {currentTeam.name.substring(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-extrabold uppercase">
                Official Dedicated Team Page
              </span>
              <span className="text-xs text-slate-400">ID: {currentTeam.id}</span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">{currentTeam.name}</h2>
            <p className="text-xs text-slate-300">{currentTeam.description}</p>
          </div>
        </div>

        {/* Team Selector Dropdown */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-bold px-1">කණ්ඩායම මාරු කරන්න:</span>
          <select
            value={currentTeam.id}
            onChange={(e) => onSelectTeam && onSelectTeam(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({users.filter((u) => u.teamId === t.id && u.role === 'agent').length} Agents)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>කණ්ඩායම් නායකයා</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-black text-amber-300 truncate mt-1">
            {teamLeader ? teamLeader.name.split(' ')[0] : 'නොමැත'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {teamLeader?.agentCode || 'TL Code'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Agents ගණන</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-black text-white mt-1">{teamAgents.length}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            {teamAgents.filter((a) => a.status !== 'inactive').length} Online
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>මුළු විකුණුම් (Sales Units)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 mt-1">
            {teamSales.reduce((sum, s) => sum + (s.quantity || 1), 0)} Units
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{teamSales.length} Sales Done</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>අද පැමිණීම</span>
            <CalendarCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-black text-teal-300 mt-1">{todayAttendanceCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            out of {teamAgents.length + 1} staff
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>නිවාඩු ඉල්ලීම්</span>
            <CalendarDays className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-300 mt-1">{pendingLeavesCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Pending Approvals</div>
        </div>
      </div>

      {/* Sub Navigation Bar for Team Page */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveSubTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'members'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          සාමාජිකයින් &amp; Leader ({teamAgents.length + 1})
        </button>

        <button
          onClick={() => setActiveSubTab('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'sales'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          විකුණුම් වාර්තා ({teamSales.length})
        </button>

        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-teal-400" />
          පැමිණීමේ සටහන් ({teamAttendance.length})
        </button>

        <button
          onClick={() => setActiveSubTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'leaves'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-amber-400" />
          නිවාඩු ඉල්ලීම් ({teamLeaves.length})
        </button>

        <button
          onClick={() => setActiveSubTab('meetings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'meetings'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Video className="w-4 h-4 text-rose-400" />
          රැස්වීම් ({teamMeetings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'chat'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          කණ්ඩායම් චැට්
        </button>

        <button
          onClick={() => setActiveSubTab('gps')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeSubTab === 'gps'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-extrabold'
              : 'bg-slate-900 text-rose-300 hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          GPS සිතියම (Map)
        </button>
      </div>

      {/* SUB TAB CONTENTS */}

      {/* 1. MEMBERS & LEADER */}
      {activeSubTab === 'members' && (
        <div className="space-y-6">
          {/* Team Leader Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black text-xl">
                  TL
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md uppercase">
                      Team Leader
                    </span>
                    <span className="text-xs font-mono text-amber-300">
                      [{teamLeader?.agentCode || 'TL-CODE'}]
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    {teamLeader ? teamLeader.name : currentTeam.leaderName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {teamLeader?.districtSi || 'Colombo District'} • {teamLeader?.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {teamLeader?.mobile && teamLeader.mobile !== 'නැත' ? (
                  <a
                    href={`tel:${teamLeader.mobile}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30 transition flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {teamLeader.mobile}
                  </a>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-slate-800 text-slate-400 text-xs font-mono">
                    දුරකථනය: නැත
                  </span>
                )}
                <button
                  onClick={() => setActiveSubTab('chat')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition flex items-center gap-1 shadow-md shadow-blue-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Direct Chat
                </button>
              </div>
            </div>
          </div>

          {/* Agents Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                කණ්ඩායමේ සියලුම Agents ({teamAgents.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Agent Name & Code</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Mobile & Email</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {teamAgents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center text-xs font-black">
                            {ag.name.substring(0, 1)}
                          </span>
                          <div>
                            <div>{ag.name}</div>
                            <span className="text-[10px] text-blue-400 font-mono">
                              [{ag.agentCode || 'AG-000'}]
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-300">
                        {ag.districtSi || ag.district || 'Colombo'}
                      </td>
                      <td className="p-3 text-slate-400">
                        <div className="font-mono text-xs">{ag.mobile && ag.mobile !== 'නැත' ? ag.mobile : 'නැත'}</div>
                        <div className="text-[10px] text-slate-500">{ag.email}</div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            ag.status !== 'inactive'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {ag.status !== 'inactive' ? '🟢 Online' : '⚪ Offline'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setActiveSubTab('chat')}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-bold transition"
                        >
                          Message
                        </button>
                      </td>
                    </tr>
                  ))}
                  {teamAgents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        මෙම කණ්ඩායමට තවමත් Agents ලා එකතු කර නැත.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEAM SALES */}
      {activeSubTab === 'sales' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                {currentTeam.name} - විකුණුම් වාර්තා
              </h3>
              <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                මුළු එකතුව: Rs. {totalSalesRs.toLocaleString()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">දිනය</th>
                    <th className="p-3">නිලධාරියා (Agent / TL)</th>
                    <th className="p-3">නිෂ්පාදනය (Product)</th>
                    <th className="p-3">විස්තර / සටහන්</th>
                    <th className="p-3 text-right">ප්‍රමාණය (Units)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {teamSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{s.date}</td>
                      <td className="p-3 font-bold text-white">
                        {s.agentName}{' '}
                        <span className="text-[10px] text-blue-400">[{s.agentCode}]</span>
                      </td>
                      <td className="p-3 font-semibold text-emerald-300">{s.productName}</td>
                      <td className="p-3 text-slate-300">
                        {s.notes ? s.notes : 'Field Subscriber'}
                      </td>
                      <td className="p-3 text-right font-black text-emerald-400">
                        {s.quantity || 1} Units
                      </td>
                    </tr>
                  ))}
                  {teamSales.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-500">
                        මෙම කණ්ඩායමේ විකුණුම් වාර්තා නොමැත.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TEAM ATTENDANCE */}
      {activeSubTab === 'attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-teal-400" />
            {currentTeam.name} - පැමිණීමේ සටහන් (Attendance)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">දිනය</th>
                  <th className="p-3">නිලධාරියා</th>
                  <th className="p-3">පැමිණි වේලාව</th>
                  <th className="p-3">දිස්ත්‍රික්කය</th>
                  <th className="p-3">තත්ත්වය</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {teamAttendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{a.date}</td>
                    <td className="p-3 font-bold text-white">
                      {a.agentName} <span className="text-[10px] text-blue-400">[{a.agentCode}]</span>
                    </td>
                    <td className="p-3 text-teal-300 font-semibold">{a.timeIn}</td>
                    <td className="p-3 text-slate-400">{a.district}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        Present
                      </span>
                    </td>
                  </tr>
                ))}
                {teamAttendance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      පැමිණීමේ සටහන් නොමැත.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TEAM LEAVES */}
      {activeSubTab === 'leaves' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-amber-400" />
            {currentTeam.name} - නිවාඩු ඉල්ලීම් (Leave Requests)
          </h3>

          <div className="space-y-3">
            {teamLeaves.map((l) => (
              <div
                key={l.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between flex-wrap gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{l.agentName}</span>
                    <span className="text-xs text-blue-400 font-mono">[{l.agentCode}]</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        l.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : l.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    දින: <span className="text-white font-semibold">{l.startDate}</span> සිට{' '}
                    <span className="text-white font-semibold">{l.endDate}</span> දක්වා ({l.daysCount} දින)
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">හේතුව: {l.reason}</p>
                </div>

                {l.status === 'pending' && (currentUser.role === 'owner' || currentUser.role === 'team_leader') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateLeaveStatus(l.id, 'approved', currentUser.name)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateLeaveStatus(l.id, 'rejected', currentUser.name)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {teamLeaves.length === 0 && (
              <div className="p-6 text-center text-slate-500">නිවාඩු ඉල්ලීම් නොමැත.</div>
            )}
          </div>
        </div>
      )}

      {/* 6. TEAM MEETINGS */}
      {activeSubTab === 'meetings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Video className="w-4 h-4 text-rose-400" />
            {currentTeam.name} - රැස්වීම් (Meetings)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teamMeetings.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-md border border-rose-500/30">
                    {m.time || '10:00 AM'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{m.title}</h4>
                <p className="text-xs text-slate-300">{m.description || 'කණ්ඩායම් රැස්වීම'}</p>
                {m.meetingLink && (
                  <a
                    href={m.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Online Meeting Studio
                  </a>
                )}
              </div>
            ))}
            {teamMeetings.length === 0 && (
              <div className="col-span-2 p-6 text-center text-slate-500">
                රැස්වීම් කාලසටහන නොමැත.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. TEAM CHAT */}
      {activeSubTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-400" />
            {currentTeam.name} - සජීවී කණ්ඩායම් පණිවිඩ හුවමාරුව
          </h3>
          <InteractiveChatBox
            filterRole={currentUser.role === 'owner' ? undefined : 'team_leader'}
            defaultReceiverId={teamLeader?.id}
          />
        </div>
      )}

      {/* 8. TEAM GPS MAP */}
      {activeSubTab === 'gps' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              {currentTeam.name} - සජීවී GPS පිහිටුම් සිතියම (Team GPS)
            </h3>
            <span className="text-xs text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30 font-bold">
              {teamAgents.length + 1} Markers Active
            </span>
          </div>

          <div className="h-[450px] rounded-xl overflow-hidden border border-slate-800">
            <SriLankaGpsMapView initialDistrictFilter={teamLeader?.districtKey || 'ALL'} />
          </div>
        </div>
      )}
    </div>
  );
};
