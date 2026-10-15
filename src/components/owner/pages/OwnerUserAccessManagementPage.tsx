import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Lock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { User, UserRole, EmploymentStatus, EmployeeIdApprovalStatus } from '../../../types';

export const OwnerUserAccessManagementPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, teams, addUser, updateUserStatus, updateUser } = useData();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');

  // New User Form State (email = Firebase account username)
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('agent');
  const [agentCode, setAgentCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id || 'team_direct');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentUser || currentUser.role !== 'owner') {
    return (
      <div className="p-8 text-center text-red-400 bg-slate-900 border border-red-500/20 rounded-2xl">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3" />
        <h2 className="text-xl font-bold">ප්‍රවේශය සීමා කර ඇත (Access Restricted)</h2>
        <p className="text-sm text-slate-400 mt-1">මෙම පිටුවට ප්‍රවේශ විය හැක්කේ ආයතන ප්‍රධානියාට (Owner) පමණි.</p>
      </div>
    );
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !fullName.trim() || !password.trim()) {
      setErrorMsg('කරුණාකර පරිශීලක නාමය (Username), සම්පූර්ණ නම සහ මුරපදය ඇතුළත් කරන්න.');
      return;
    }

    try {
      const selectedTeam = teams.find((t) => t.id === teamId);
      const email = username.includes('@') ? username : `${username}@ddworld.lk`;

      await addUser({
        name: fullName,
        email: email, // corporate account where email = username
        role: role,
        agentCode: agentCode || `DD-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: mobile,
        mobile: mobile,
        teamId: selectedTeam?.id,
        teamName: selectedTeam?.name,
        employmentStatus: 'ACTIVE',
        idApprovalStatus: 'APPROVED',
        password: password,
      });

      setSuccessMsg(`නව පරිශීලක ගිණුම (${fullName}) සාර්ථකව නිර්මාණය විය!`);
      setShowCreateModal(false);
      setUsername('');
      setFullName('');
      setPassword('');
      setAgentCode('');
      setMobile('');
    } catch (err: any) {
      setErrorMsg(err.message || 'ගිණුම නිර්මාණය කිරීම අසාර්ථක විය.');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: EmploymentStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      setSuccessMsg(`සේවක තත්ත්වය සාර්ථකව ${newStatus} ලෙස යාවත්කාලීන විය.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'තත්ත්වය වෙනස් කිරීම අසාර්ථක විය.');
    }
  };

  const handleIdApprovalChange = async (userId: string, approvalStatus: EmployeeIdApprovalStatus) => {
    try {
      await updateUser(userId, {
        idApprovalStatus: approvalStatus,
        idApprovedAt: approvalStatus === 'APPROVED' ? new Date().toISOString() : undefined,
        idApprovedBy: currentUser.id,
      });
      setSuccessMsg(`ඩිජිටල් හැඳුනුම්පත් අනුමැතිය ${approvalStatus} ලෙස සටහන් විය.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'හැඳුනුම්පත් අනුමැතිය වෙනස් කිරීම අසාර්ථක විය.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.agentCode && u.agentCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.mobile && u.mobile.includes(searchQuery));

    const matchesRole = filterRole === 'ALL' || (u && u.role === filterRole);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                සේවක ගිණුම් සහ ප්‍රවේශ පාලනය • User Access Management
              </h1>
              <p className="text-sm text-slate-400">
                ආයතනික ගිණුම් සක්‍රිය කිරීම, ID කාඩ්පත් අනුමැතිය සහ සේවා තත්ත්ව පාලනය (Self-registration strictly blocked)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            නව ආයතනික ගිණුමක් සදන්න (Create Account)
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Security Rule Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ස්වයං ලියාපදිංචිය (Self-Registration) ස්ථිරව අක්‍රිය කර ඇත. සියලුම ගිණුම් ආයතන ප්‍රධානියා විසින් පමණක් නිකුත් කෙරේ.</span>
        </div>
        <span className="font-mono text-slate-500">RLS: Strict Owner Enforcement</span>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="නම, කේතය, හෝ දුරකථන අංකය..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
            >
              <option value="ALL">සියලුම තනතුරු (All Roles)</option>
              <option value="owner">Owner</option>
              <option value="team_leader">Team Leader</option>
              <option value="junior_team_leader">Junior Team Leader</option>
              <option value="agent">Field Agent</option>
              <option value="dialog_officer">Dialog Officer</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">පරිශීලකයා (User)</th>
                <th className="py-3 px-4">තනතුර (Role)</th>
                <th className="py-3 px-4">කේතය (Code)</th>
                <th className="py-3 px-4">කණ්ඩායම (Team)</th>
                <th className="py-3 px-4">සේවා තත්ත්වය (Status)</th>
                <th className="py-3 px-4">ඩිජිටල් ID අනුමැතිය</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredUsers.map((u) => {
                const isOwnerAccount = u && (u.role === 'owner' || u.id === 'owner-9000');
                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{u.email || u.mobile || 'No email'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{u.agentCode || '-'}</td>
                    <td className="py-3 px-4 text-slate-400">{u.teamName || '-'}</td>
                    <td className="py-3 px-4">
                      {isOwnerAccount ? (
                        <span className="px-2 py-0.5 rounded font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                          PERMANENT ACTIVE
                        </span>
                      ) : (
                        <select
                          value={u.employmentStatus || 'ACTIVE'}
                          onChange={(e) => handleStatusChange(u.id, e.target.value as EmploymentStatus)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="PROBATION">PROBATION</option>
                          <option value="TEMPORARY_SUSPENDED">TEMPORARY_SUSPENDED</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                          <option value="BLOCKED">BLOCKED</option>
                          <option value="RESIGNED">RESIGNED</option>
                          <option value="TERMINATED">TERMINATED</option>
                          <option value="EXITED">EXITED</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isOwnerAccount ? (
                        <span className="px-2 py-0.5 rounded font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                          PERMANENT APPROVED
                        </span>
                      ) : (
                        <select
                          value={u.idApprovalStatus || 'APPROVED'}
                          onChange={(e) => handleIdApprovalChange(u.id, e.target.value as EmployeeIdApprovalStatus)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="APPROVED">APPROVED</option>
                          <option value="PENDING">PENDING</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-red-500" />
                නව ආයතනික ගිණුමක් නිකුත් කිරීම
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  පරිශීලක නාමය (Username / Email Identity)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. dilshan or dilshan@ddworld.lk"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">සම්පූර්ණ නම (Full Name)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shanuka Malshan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">තනතුර (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    <option value="agent">Field Agent</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="junior_team_leader">Junior Team Leader</option>
                    <option value="dialog_officer">Dialog Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">නියෝජිත කේතය (Agent Code)</label>
                  <input
                    type="text"
                    placeholder="e.g. 9289"
                    value={agentCode}
                    onChange={(e) => setAgentCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">දුරකථන අංකය (Mobile)</label>
                  <input
                    type="text"
                    placeholder="07XXXXXXXX"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">කණ්ඩායම (Team)</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">ආරක්ෂිත මුරපදය (Password)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-600/30"
                >
                  ගිණුම නිර්මාණය කරන්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
