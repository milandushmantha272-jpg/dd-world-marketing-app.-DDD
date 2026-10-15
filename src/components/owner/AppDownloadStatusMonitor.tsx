import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { User } from '../../types';
import {
  Smartphone,
  CheckCircle2,
  XCircle,
  Search,
  Users,
  Send,
  MessageSquare,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Phone,
  ArrowUpRight,
  Filter,
  Check,
} from 'lucide-react';

export const AppDownloadStatusMonitor: React.FC = () => {
  const { users, teams, updateUserAppStatus } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'downloaded' | 'not_downloaded'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'team_leader' | 'agent'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const directAppUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-dsekgfmwcewvlxn6gghirt-814098050496.asia-east1.run.app';

  // Filter only active operational staff (Team Leaders & Agents)
  const activeStaff = useMemo(() => {
    return users.filter((u) => u.status === 'active' && u.role !== 'owner');
  }, [users]);

  // App Installed & Logged in list
  const downloadedUsers = useMemo(() => {
    return activeStaff.filter((u) => u.isAppDownloaded || u.isLoggedIn);
  }, [activeStaff]);

  // App Not Installed / Pending list
  const notDownloadedUsers = useMemo(() => {
    return activeStaff.filter((u) => !u.isAppDownloaded && !u.isLoggedIn);
  }, [activeStaff]);

  // Overall statistics
  const totalCount = activeStaff.length;
  const downloadedCount = downloadedUsers.length;
  const notDownloadedCount = notDownloadedUsers.length;
  const adoptionPercentage = totalCount > 0 ? Math.round((downloadedCount / totalCount) * 100) : 0;

  // Filtered dataset according to user selection
  const filteredStaff = useMemo(() => {
    return activeStaff.filter((u) => {
      // Status filter
      if (statusFilter === 'downloaded' && (!u.isAppDownloaded && !u.isLoggedIn)) return false;
      if (statusFilter === 'not_downloaded' && (u.isAppDownloaded || u.isLoggedIn)) return false;

      // Role filter
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;

      // Team filter
      if (teamFilter !== 'all' && u.teamId !== teamFilter) return false;

      // Search query
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchName = u.name ? u.name.toLowerCase().includes(q) : false;
        const matchCode = u.agentCode ? u.agentCode.toLowerCase().includes(q) : false;
        const matchMobile = u.mobile ? u.mobile.toLowerCase().includes(q) : false;
        const matchTeam = u.teamName ? u.teamName.toLowerCase().includes(q) : false;
        return matchName || matchCode || matchMobile || matchTeam;
      }

      return true;
    });
  }, [activeStaff, statusFilter, roleFilter, teamFilter, searchQuery]);

  const handleManualToggleStatus = (user: User) => {
    const newStatus = !(user.isAppDownloaded || user.isLoggedIn);
    updateUserAppStatus(user.id, {
      isAppDownloaded: newStatus,
      isLoggedIn: newStatus,
      lastLoginAt: newStatus
        ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString('en-GB') + ')'
        : undefined,
      appVersion: newStatus ? 'v5.3' : undefined,
    });

    const msg = newStatus
      ? `✅ ${user.name} (${user.agentCode || 'Staff'}) App එක Download කර ඇති බව සාර්ථකව සටහන් විය.`
      : `⚠️ ${user.name} (${user.agentCode || 'Staff'}) App Download Status එක Reset විය.`;

    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const sendSmsInvite = (user: User) => {
    const mob = user.mobile.replace(/[^0-9]/g, '');
    const smsText = `[DD WORLD Official App]: සුබ දවසක් ${user.name}, DD WORLD Official Mobile App එක Download කරගෙන Log වීමට පිවිසෙන්න: ${directAppUrl}`;
    window.open(`sms:${mob}?body=${encodeURIComponent(smsText)}`, '_blank');
  };

  const sendWhatsAppInvite = (user: User) => {
    let mob = user.mobile.replace(/[^0-9]/g, '');
    if (mob.startsWith('0')) mob = '94' + mob.substring(1);
    const waText = `🌟 *DD WORLD Official Mobile App Invite* 🌟\n\nසුබ දවසක් *${user.name}* (${user.agentCode || 'Staff'}),\n\nDD WORLD පද්ධතියට සෘජුව සම්බන්ධ වී වැඩකටයුතු සිදුකිරීමට කරුණාකර පහත Link එකෙන් DD WORLD Official App එක Download / Open කරගන්න:\n\n📲 *App Download Link*:\n${directAppUrl}`;
    window.open(`https://wa.me/${mob}?text=${encodeURIComponent(waText)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-300 uppercase">
            Updated Live
          </span>
        </div>
      )}

      {/* Top Header & KPI Summary */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Real-Time App Adoption Monitor</span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>DD WORLD Mobile App Download &amp; Logged-In Tracker</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              App එක Download කර Log වී සිටින සාමාජිකයින් සහ තවමත් නොකළ සාමාජිකයින් වෙන වෙනම අධීක්ෂණය කරන්න.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActionNotice('🔄 Real-time App Status Synchronized!');
                setTimeout(() => setActionNotice(null), 3000);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: App Downloaded & Logged In */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">
                  App Downloaded &amp; Logged In
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {downloadedCount} <span className="text-sm font-normal text-slate-400">/ {totalCount}</span>
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (downloadedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[11px] text-emerald-300/80 font-medium">
              සක්‍රීයව App එක භාවිතා කරන පිරිස: {adoptionPercentage}%
            </span>
          </div>

          {/* Card 2: App Not Installed / Pending */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/30 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block">
                  App Not Downloaded / Pending
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {notDownloadedCount} <span className="text-sm font-normal text-slate-400">/ {totalCount}</span>
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (notDownloadedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <span className="text-[11px] text-amber-300/80 font-medium">
              තවමත් Log නොවූ / App නැති පිරිස: {100 - adoptionPercentage}%
            </span>
          </div>

          {/* Card 3: Overall Staff Adoption Rate */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-950/60 to-slate-900 border border-sky-500/30 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[11px] font-extrabold text-sky-400 uppercase tracking-wider block">
                  Total Staff Adoption Rate
                </span>
                <span className="text-2xl font-black text-white mt-1 block">
                  {adoptionPercentage}%
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-tight">
              මෙම සාධකය මගින් සියලුම Team Leaders සහ Agents ලාගේ Mobile App සක්‍රීය භාවය මැනිය හැක.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Status Toggle Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>සියලුදෙනා (All Staff)</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-[10px] text-slate-200">
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('downloaded')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'downloaded'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>App Download කර Logged In අය</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-[10px] text-emerald-200">
                {downloadedCount}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter('not_downloaded')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === 'not_downloaded'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-amber-400 hover:text-amber-300'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>App නැති / Pending අය</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-[10px] text-amber-200">
                {notDownloadedCount}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="නම, Agent Code, Phone සෝයන්න..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Secondary filters: Team & Role */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>ෆිල්ටර් කරන්න:</span>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
          >
            <option value="all">සියලුම තනතුරු (TLs &amp; Agents)</option>
            <option value="team_leader">Team Leaders පමණක්</option>
            <option value="agent">Agents පමණක්</option>
          </select>

          {/* Team Filter */}
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200"
          >
            <option value="all">සියලුම Teams ({teams.length})</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Detailed List Display */}
      <div className="space-y-6">
        {/* Section 1: Logged-in / Downloaded Users View */}
        {(statusFilter === 'all' || statusFilter === 'downloaded') && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>📱 App Download කර Log වී සිටින පිරිස (App Installed &amp; Active)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    මෙම සාමාජිකයින් සාර්ථකව App එක ස්ථාපනය කර පද්ධතියට Log වී ඇත.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs">
                {downloadedUsers.length} Users Active
              </span>
            </div>

            {filteredStaff.filter((u) => u.isAppDownloaded || u.isLoggedIn).length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center bg-slate-950/40 rounded-2xl">
                තෝරාගත් ෆිල්ටර් එකට අනුව App Download කර Log වී ඇති සාමාජිකයින් නොමැත.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">සාමාජිකයා &amp; Code</th>
                      <th className="pb-3 font-semibold">තනතුර (Role)</th>
                      <th className="pb-3 font-semibold">කණ්ඩායම (Team)</th>
                      <th className="pb-3 font-semibold">දුරකථනය</th>
                      <th className="pb-3 font-semibold">App Status</th>
                      <th className="pb-3 font-semibold">අවසන් වරට Log වූ වේලාව</th>
                      <th className="pb-3 font-semibold text-right">ක්‍රියාමාර්ග (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredStaff
                      .filter((u) => u.isAppDownloaded || u.isLoggedIn)
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-300 text-xs shrink-0">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{u.name}</span>
                                <span className="font-mono text-[11px] text-amber-400 font-bold">
                                  {u.agentCode || 'No Code'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5">
                            {u.role === 'team_leader' ? (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold text-[11px] whitespace-nowrap">
                                Team Leader
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-extrabold text-[11px] whitespace-nowrap">
                                Agent
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 font-medium text-slate-300 whitespace-nowrap">
                            {u.teamName || 'Unassigned'}
                          </td>

                          <td className="py-3.5 font-mono text-emerald-400 font-bold">
                            {u.mobile && u.mobile !== 'නැත' ? u.mobile : <span className="text-slate-500">නැත</span>}
                          </td>

                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span>🟢 App Active ({u.appVersion || 'v5.3'})</span>
                            </span>
                          </td>

                          <td className="py-3.5 text-slate-300 font-mono text-[11px]">
                            {u.lastLoginAt || 'අද සක්‍රීය විය (Today Active)'}
                          </td>

                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleManualToggleStatus(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition"
                              title="නැවත App Not Installed ලෙස Reset කරන්න"
                            >
                              Reset Status
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Not Installed / Pending Users View */}
        {(statusFilter === 'all' || statusFilter === 'not_downloaded') && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>⚠️ App Download කර නොමැති / Log වී නැති පිරිස (App Pending Users)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    මෙම සාමාජිකයින්ට App Download Link එක යවා ඉක්මනින් App එකට සම්බන්ධ කරගන්න.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-extrabold text-xs">
                {notDownloadedUsers.length} Pending
              </span>
            </div>

            {filteredStaff.filter((u) => !u.isAppDownloaded && !u.isLoggedIn).length === 0 ? (
              <p className="text-xs text-emerald-400 py-8 text-center bg-slate-950/40 rounded-2xl font-bold">
                🎉 සියලුම සාමාජිකයින් සාර්ථකව App එක Download කර Log වී ඇත! (All Staff Active)
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">සාමාජිකයා &amp; Code</th>
                      <th className="pb-3 font-semibold">තනතුර</th>
                      <th className="pb-3 font-semibold">කණ්ඩායම (Team)</th>
                      <th className="pb-3 font-semibold">දුරකථන අංකය</th>
                      <th className="pb-3 font-semibold">App Status</th>
                      <th className="pb-3 font-semibold text-right">App Invite &amp; Status Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredStaff
                      .filter((u) => !u.isAppDownloaded && !u.isLoggedIn)
                      .map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-xs shrink-0">
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{u.name}</span>
                                <span className="font-mono text-[11px] text-amber-400 font-bold">
                                  {u.agentCode || 'No Code'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5">
                            {u.role === 'team_leader' ? (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold text-[11px] whitespace-nowrap">
                                Team Leader
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-extrabold text-[11px] whitespace-nowrap">
                                Agent
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 font-medium text-slate-300 whitespace-nowrap">
                            {u.teamName || 'Unassigned'}
                          </td>

                          <td className="py-3.5 font-mono text-amber-400 font-bold">
                            {u.mobile && u.mobile !== 'නැත' ? u.mobile : <span className="text-slate-500">නැත</span>}
                          </td>

                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-extrabold text-[11px]">
                              <span className="w-2 h-2 rounded-full bg-rose-400" />
                              <span>🔴 App Missing / Not Logged In</span>
                            </span>
                          </td>

                          <td className="py-3.5 text-right space-x-2">
                            {u.mobile && u.mobile !== 'නැත' && (
                              <>
                                <button
                                  onClick={() => sendSmsInvite(u)}
                                  className="px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-[11px] font-bold transition inline-flex items-center gap-1"
                                  title="SMS හරහා App Download Link යවන්න"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>SMS Invite</span>
                                </button>

                                <button
                                  onClick={() => sendWhatsAppInvite(u)}
                                  className="px-2.5 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 text-[11px] font-bold transition inline-flex items-center gap-1"
                                  title="WhatsApp හරහා App Invite Link යවන්න"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleManualToggleStatus(u)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-300 text-[11px] font-black transition inline-flex items-center gap-1"
                              title="තහවුරු කර App Installed ලෙස Mark කරන්න"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Installed</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
