import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { getAttendanceSummary } from '../../utils/summaryUtils';
import {
  Users,
  CheckCircle2,
  XCircle,
  Percent,
  Search,
  Filter,
  Calendar,
  Send,
  UserCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Bell,
  CalendarDays,
} from 'lucide-react';

export const OwnerAttendanceControlHub: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, attendance, teams, addAttendanceRecord, sendMessage } = useData();

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  // Selected date
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filters
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'team_leader' | 'agent'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'marked' | 'unmarked'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast / Action notification
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActionToast({ type, text });
    setTimeout(() => setActionToast(null), 4000);
  };

  // Staff members (Team Leaders and Agents)
  const allStaff = users.filter((u) => u.role === 'team_leader' || u.role === 'agent');

  // Filtered staff list
  const filteredStaff = allStaff.filter((staff) => {
    // Team match
    const matchesTeam = teamFilter === 'all' || staff.teamId === teamFilter;

    // Role match
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;

    // Attendance record for selected date
    const attRec = attendance.find((a) => a.agentId === staff.id && a.date === selectedDate);
    const isMarked = !!attRec;

    // Status match
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'marked' && isMarked) ||
      (statusFilter === 'unmarked' && !isMarked);

    // Search match
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (staff.agentCode && staff.agentCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (staff.teamName && staff.teamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTeam && matchesRole && matchesStatus && matchesSearch;
  });

  // KPI Calculations for selected date
  const totalStaffCount = allStaff.length;
  const markedStaffCount = allStaff.filter((s) =>
    attendance.some((a) => a.agentId === s.id && a.date === selectedDate)
  ).length;
  const unmarkedStaffCount = totalStaffCount - markedStaffCount;
  const attendanceRate =
    totalStaffCount > 0 ? Math.round((markedStaffCount / totalStaffCount) * 100) : 0;

  // Direct Owner Check-In Action
  const handleOwnerDirectCheckIn = (staffMember: typeof allStaff[0]) => {
    const nowTimeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    addAttendanceRecord({
      agentId: staffMember.id,
      agentName: staffMember.name,
      agentCode: staffMember.agentCode || 'STAFF',
      teamId: staffMember.teamId || 'team_direct',
      teamName: staffMember.teamName || 'Team Alpha',
      role: staffMember.role,
      date: selectedDate,
      checkInTime: nowTimeStr,
      status: 'present',
    });

    showToast(
      ` Owner විසින් ${staffMember.name} (${staffMember.agentCode || staffMember.role}) ගේ පැමිණීම ${selectedDate} දිනට සාර්ථකව Check-In mark කරන ලදී.`,
      'success'
    );
  };

  // Send Reminder Message to Unmarked Staff
  const handleSendReminder = (staffMember: typeof allStaff[0]) => {
    if (!currentUser) return;

    sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name || 'Owner (MD)',
      senderRole: 'owner',
      receiverId: staffMember.id,
      receiverName: staffMember.name,
      receiverRole: staffMember.role,
      content: `🔔 [Attendance Reminder] ආයුබෝවන් ${staffMember.name}! අද (${selectedDate}) දින සඳහා ඔබගේ පැමිණීම (Attendance Check-In) තවම සටහන් කර නොමැත. කරුණාකර පද්ධතියට ලොග් වී Check-In mark කරන්න.`,
    });

    showToast(
      `🔔 ${staffMember.name} වෙත පැමිණීමේ මතක් කිරීමේ (Attendance Reminder) පණිවිඩය Chat හරහා සාර්ථකව යවන ලදී.`,
      'info'
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {actionToast && (
        <div
          className={`p-4 rounded-2xl border font-semibold text-xs flex items-center justify-between shadow-xl transition-all ${
            actionToast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : actionToast.type === 'info'
              ? 'bg-blue-950/80 border-blue-500/50 text-blue-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{actionToast.text}</span>
          </div>
          <button
            onClick={() => setActionToast(null)}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            වසා දමන්න
          </button>
        </div>
      )}

      {/* Header & Date Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Master Attendance Control Hub
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
              Real-time Sync
            </span>
          </div>
          <h2 className="text-xl font-black text-white">
            සියලුම කණ්ඩායම්වල පැමිණීමේ ප්‍රධාන පාලන තිරය
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Team Leaders සහ Field Agents ලාගේ දෛනික Check-In සටහන් සහ නොකළ පිරිස සජීවීව නිරීක්ෂණය කර පාලනය කරන්න.
          </p>
        </div>

        {/* Date Selector Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedDate === todayStr
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            අද (Today)
          </button>
          <button
            onClick={() => setSelectedDate(yesterdayStr)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              selectedDate === yesterdayStr
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            ඊයේ (Yesterday)
          </button>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">මුළු සේවකයින් (Total Staff)</span>
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{totalStaffCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Team Leaders + Agents</p>
        </div>

        {/* Marked Present */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">පැමිණීම සටහන් කළ ගණන</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{markedStaffCount}</div>
          <p className="text-[11px] text-emerald-500/80 mt-1">🟢 Check-In Mark කර ඇත</p>
        </div>

        {/* Not Marked / Absent */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">සටහන් නොකළ ගණන</span>
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">{unmarkedStaffCount}</div>
          <p className="text-[11px] text-rose-500/80 mt-1">🔴 Check-In නොකළ පිරිස</p>
        </div>

        {/* Attendance Rate % */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">දෛනික පැමිණීමේ ප්‍රතිශතය</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{attendanceRate}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              උසස් Search & Filter පාලනය
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            තෝරාගත් දිනය: <span className="font-bold text-amber-400">{selectedDate}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="සේවක නම, Code හෝ Team..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">සියලුම Teams (All Teams)</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">සියලු තනතුරු (Leaders + Agents)</option>
            <option value="team_leader">Team Leaders පමණක්</option>
            <option value="agent">Agents පමණක්</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">සියලුම පැමිණීමේ තත්ත්ව</option>
            <option value="marked">🟢 පැමිණි පිරිස (Marked Present)</option>
            <option value="unmarked">🔴 නොපැමිණි / සටහන් නොකළ පිරිස (Not Marked)</option>
          </select>
        </div>
      </div>

      {/* Staff Attendance Master Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>සාමාජිකයින්ගේ පැමිණීමේ ලැයිස්තුව (Staff List - {filteredStaff.length})</span>
          </h3>
          <span className="text-xs text-slate-500">
            {selectedDate} දිනට අදාළයි
          </span>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto" />
            <p>තෝරාගත් Filter වලට අදාළ කිසිදු සාමාජිකයෙකු හමු නොවීය.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">තනතුර & Code</th>
                  <th className="pb-3 font-semibold">නම</th>
                  <th className="pb-3 font-semibold">කණ්ඩායම (Team)</th>
                  <th className="pb-3 font-semibold">පැමිණීමේ තත්ත්වය</th>
                  <th className="pb-3 font-semibold">Check-In වේලාව</th>
                  <th className="pb-3 font-semibold text-right">Owner Direct Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredStaff.map((staff) => {
                  const attRecord = attendance.find(
                    (a) => a.agentId === staff.id && a.date === selectedDate
                  );
                  const isMarked = !!attRecord;

                  return (
                    <tr key={staff.id} className="hover:bg-slate-800/40 transition">
                      {/* Role & Code */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                              staff.role === 'team_leader'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {staff.role === 'team_leader' ? 'Team Leader' : 'Agent'}
                          </span>
                          <span className="font-bold text-amber-400">
                            {staff.agentCode || 'STAFF'}
                          </span>
                        </div>
                      </td>

                      {/* Name */}
                      <td className="py-3.5 font-medium text-white">
                        <div>{staff.name}</div>
                        <div className="text-[10px] text-slate-500">{staff.email}</div>
                      </td>

                      {/* Team */}
                      <td className="py-3.5 text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[11px]">
                          {staff.teamName || 'Team Alpha'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5">
                        {isMarked ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            🟢 පැමිණ ඇත (Marked)
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[11px] font-bold inline-flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            🔴 සටහන් කර නැත
                          </span>
                        )}
                      </td>

                      {/* Check-In Time */}
                      <td className="py-3.5 text-slate-300 font-semibold">
                        {isMarked ? (
                          <span className="text-emerald-400 font-mono">
                            {attRecord.checkInTime}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">-</span>
                        )}
                      </td>

                      {/* Controls */}
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {!isMarked ? (
                            <>
                              <button
                                onClick={() => handleOwnerDirectCheckIn(staff)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1"
                                title="Owner විසින් සෘජුව පැමිණීම Check-In mark කරන්න"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Check-In Mark කරන්න
                              </button>

                              <button
                                onClick={() => handleSendReminder(staff)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-xs transition flex items-center gap-1"
                                title="පැමිණීම සටහන් කිරීමට මතක් කිරීමේ පණිවිඩයක් යවන්න"
                              >
                                <Bell className="w-3.5 h-3.5" />
                                Reminder යවන්න
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              සටහන් වී ඇත
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Team-by-Team Weekly & Monthly Attendance Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              <span>කණ්ඩායම් මට්ටමින් පැමිණීම් සාරාංශය (Team-by-Team Weekly &amp; Monthly Attendance Summary)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              සෑම කණ්ඩායමකම Team Leader සහ Agents ලාගේ සති 1, සති 2, සති 3, සති 4 හා මාසික මුළු පැමිණීම් එකතුව.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">කණ්ඩායම (Team)</th>
                <th className="pb-3 font-semibold">Team Leader</th>
                <th className="pb-3 font-semibold text-center">සතිය 1 (Days 1-7)</th>
                <th className="pb-3 font-semibold text-center">සතිය 2 (Days 8-14)</th>
                <th className="pb-3 font-semibold text-center">සතිය 3 (Days 15-21)</th>
                <th className="pb-3 font-semibold text-center">සතිය 4 (Days 22-31)</th>
                <th className="pb-3 font-semibold text-right">මාසික එකතුව (Monthly Total)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {teams.map((tm) => {
                const teamStaff = users.filter((u) => u.teamId === tm.id || u.teamName === tm.name);
                const teamStaffIds = teamStaff.map((u) => u.id);
                const tmAtt = attendance.filter((a) => teamStaffIds.includes(a.agentId));
                const tmSum = getAttendanceSummary(tmAtt);
                const tl = teamStaff.find((u) => u.role === 'team_leader');

                return (
                  <tr key={tm.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>{tm.name}</span>
                    </td>
                    <td className="py-3.5 font-medium text-slate-300">
                      {tl ? `${tl.name} (${tl.agentCode || 'TL'})` : 'Unassigned'}
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold text-slate-200">{tmSum.week1Present}</td>
                    <td className="py-3.5 text-center font-mono font-bold text-slate-200">{tmSum.week2Present}</td>
                    <td className="py-3.5 text-center font-mono font-bold text-slate-200">{tmSum.week3Present}</td>
                    <td className="py-3.5 text-center font-mono font-bold text-slate-200">{tmSum.week4Present}</td>
                    <td className="py-3.5 text-right font-mono font-black text-amber-400 text-sm">
                      {tmSum.monthlyPresent} Days
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
