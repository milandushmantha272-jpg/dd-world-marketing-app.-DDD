import React, { useState } from 'react';
import {
  UserCheck,
  ShieldAlert,
  Search,
  Filter,
  AlertTriangle,
  Lock,
  CheckCircle2,
  UserX,
  Clock,
  Database,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData, isOwnerDoc } from '../../context/DataContext';
import { EmploymentStatus, User } from '../../types';

export const EmployeeStatusManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, updateEmploymentStatus, changeUserPassword, deleteUser } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'agent' | 'team_leader'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | EmploymentStatus>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Reset Modal State
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  // Delete User Modal State
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (currentUser?.role !== 'owner') {
    return (
      <div className="p-6 text-center text-rose-400 font-bold">
        ⚠️ මෙම පිටුව නැරඹීමට අවසර ඇත්තේ Owner හට පමණි.
      </div>
    );
  }

  const filteredUsers = users.filter((u) => {
    if (isOwnerDoc(u)) return false; // Exclude Owner from status changes / password reset
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const currentEmpStatus = u.employmentStatus || (u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE');
    const matchStatus = statusFilter === 'all' || currentEmpStatus === statusFilter;
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.agentCode && u.agentCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchRole && matchStatus && matchSearch;
  });

  const handleStatusChange = (targetUser: User, newStatus: EmploymentStatus) => {
    if (isOwnerDoc(targetUser)) return;
    setUpdatingUserId(targetUser.id);
    updateEmploymentStatus(targetUser.id, newStatus);

    setSuccessMsg(`✅ ${targetUser.name} ගේ ගිණුම් තත්ත්වය ${newStatus} ලෙස සාර්ථකව වෙනස් කරන ලදී.`);
    setUpdatingUserId(null);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const openPasswordModal = (targetUser: User) => {
    if (isOwnerDoc(targetUser)) {
      setPasswordStatusMsg({
        type: 'error',
        text: 'ආයතන ප්‍රධානී (Owner) ගිණුමේ මුරපදය හෝ පිවිසුම් තොරතුරු වෙනස් කිරීම ආරක්ෂිතව අක්‍රිය කර ඇත (Hardcoded Database Lockout).',
      });
      return;
    }
    setPasswordModalUser(targetUser);
    setNewPassword(targetUser.password || targetUser.tempPassword || targetUser.pinCode || '');
    setPasswordStatusMsg(null);
    setCopiedPass(false);
  };

  const handleGeneratePin = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setNewPassword(randomPin);
  };

  const handleSavePassword = () => {
    if (!passwordModalUser) return;
    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setPasswordStatusMsg({
        type: 'error',
        text: 'කරුණාකර අවම වශයෙන් අක්ෂර හෝ ඉලක්කම් 4ක Password / PIN එකක් ඇතුළත් කරන්න.',
      });
      return;
    }

    const res = changeUserPassword(passwordModalUser.id, newPassword.trim());
    if (res.success) {
      setPasswordStatusMsg({ type: 'success', text: res.message });
      setSuccessMsg(`✅ ${passwordModalUser.name} ගේ මුරපදය සාර්ථකව යාවත්කාලීන කරන ලදී.`);
      setTimeout(() => setSuccessMsg(null), 5000);
    } else {
      setPasswordStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleCopyPassword = () => {
    if (!newPassword) return;
    navigator.clipboard?.writeText(newPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 3000);
  };

  const handleDeleteConfirm = () => {
    if (!deleteModalUser) return;
    setIsDeleting(true);
    const res = deleteUser(deleteModalUser.id);
    setIsDeleting(false);
    setDeleteModalUser(null);
    if (res.success) {
      setSuccessMsg(`🗑️ ${res.message}`);
      setTimeout(() => setSuccessMsg(null), 6000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" /> OWNER CONTROL • EMPLOYEE STATUS MANAGEMENT
        </div>
        <h2 className="text-xl font-black text-white">
          සේවක සක්‍රීය / අක්‍රීය / ඉවත් කිරීම් පාලන මධ්‍යස්ථානය (Employee Status Control)
        </h2>
        <p className="text-xs text-slate-400">
          සේවකයෙකු EXITED හෝ BLOCKED කළ විට ඔවුන්ට පද්ධතියට ලොග් වීමට, අලුතින් Attendance හෝ Sales ඇතුළත් කිරීමට නොහැකි වේ. <strong>නමුත් ඔවුන්ගේ පෙර පැවති සියලුම Sales, Attendance සහ GPS ඓතිහාසික දත්ත පද්ධතිය තුළ සුරක්ෂිතව තැන්පත් වී පවතී.</strong>
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter & Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="නම, Agent Code හෝ Employee ID මඟින් සොයන්න..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-300 font-bold focus:border-rose-500 outline-none"
          >
            <option value="all">සියලුම Roles</option>
            <option value="agent">Agents Only</option>
            <option value="team_leader">Team Leaders Only</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-300 font-bold focus:border-rose-500 outline-none"
          >
            <option value="all">සියලුම Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="EXITED">EXITED</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" /> සේවක ලැයිස්තුව ({filteredUsers.length})
          </h3>
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-cyan-400" /> Historical Data Preserved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[780px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950">
                <th className="p-3 whitespace-nowrap">Employee Name</th>
                <th className="p-3 whitespace-nowrap">Employee ID</th>
                <th className="p-3 whitespace-nowrap">Agent Code</th>
                <th className="p-3 whitespace-nowrap min-w-[120px]">Role</th>
                <th className="p-3 whitespace-nowrap min-w-[140px]">Assigned Team</th>
                <th className="p-3 whitespace-nowrap">KYC Compliance</th>
                <th className="p-3 whitespace-nowrap">Current Status</th>
                <th className="p-3 text-right whitespace-nowrap">Change Status (Owner Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const currentEmpStatus: EmploymentStatus = u.employmentStatus || (u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE');
                const hasKyc = Boolean(u.kycDocuments?.gnCertificate && u.kycDocuments?.policeReport);

                return (
                  <tr key={u.id} className="hover:bg-slate-950/50">
                    <td className="p-3">
                      <div className="font-bold text-white whitespace-nowrap">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.mobile}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-300 whitespace-nowrap">
                      {u.employeeId || `DDW-EMP-${u.agentCode || '000'}`}
                    </td>
                    <td className="p-3 font-mono text-cyan-300 font-bold whitespace-nowrap">{u.agentCode || 'N/A'}</td>
                    <td className="p-3 whitespace-nowrap">
                      {u.role === 'team_leader' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold text-[11px] whitespace-nowrap">
                          Team Leader
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-extrabold text-[11px] whitespace-nowrap">
                          Agent
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="font-bold text-slate-200">{u.teamName || 'Unassigned'}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {hasKyc ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified (GN/Police)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> Pending Upload
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border inline-block ${
                        currentEmpStatus === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : currentEmpStatus === 'SUSPENDED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : currentEmpStatus === 'EXITED'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}>
                        {currentEmpStatus}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Status Buttons */}
                        <button
                          disabled={currentEmpStatus === 'ACTIVE'}
                          onClick={() => handleStatusChange(u, 'ACTIVE')}
                          className="px-2 py-1 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-30 text-white font-black text-[10px] transition"
                          title="Active Account"
                        >
                          ACTIVE
                        </button>
                        <button
                          disabled={currentEmpStatus === 'SUSPENDED'}
                          onClick={() => handleStatusChange(u, 'SUSPENDED')}
                          className="px-2 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-500 disabled:opacity-30 text-white font-black text-[10px] transition"
                          title="Suspend Temporarily"
                        >
                          SUSPEND
                        </button>
                        <button
                          disabled={currentEmpStatus === 'EXITED'}
                          onClick={() => handleStatusChange(u, 'EXITED')}
                          className="px-2 py-1 rounded-lg bg-purple-600/80 hover:bg-purple-500 disabled:opacity-30 text-white font-black text-[10px] transition"
                          title="Mark Exited"
                        >
                          EXITED
                        </button>
                        <button
                          disabled={currentEmpStatus === 'BLOCKED'}
                          onClick={() => handleStatusChange(u, 'BLOCKED')}
                          className="px-2 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-500 disabled:opacity-30 text-white font-black text-[10px] transition"
                          title="Block User"
                        >
                          BLOCK
                        </button>

                        <div className="h-4 w-px bg-slate-800 mx-0.5" />

                        {/* Password Reset Action */}
                        <button
                          onClick={() => openPasswordModal(u)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-[10px] transition flex items-center gap-1"
                          title="මුරපදය / PIN වෙනස් කරන්න (Change Password)"
                        >
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          <span>Password</span>
                        </button>

                        {/* Permanent Delete Action */}
                        <button
                          onClick={() => setDeleteModalUser(u)}
                          className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-bold text-[10px] transition flex items-center gap-1"
                          title="සේවකයා පද්ධතියෙන් ඉවත් කරන්න (Delete Employee)"
                        >
                          <Trash2 className="w-3 h-3 text-rose-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PASSWORD RESET MODAL */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">මුරපදය (Password / PIN) වෙනස් කිරීම</h3>
                  <p className="text-[11px] text-slate-400">
                    {passwordModalUser.name} ({passwordModalUser.agentCode || passwordModalUser.employeeId || 'Staff'})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification alert */}
            {passwordStatusMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  passwordStatusMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {passwordStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{passwordStatusMsg.text}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold flex items-center justify-between">
                  <span>නව මුරපදය හෝ PIN අංකය (New Password / PIN):</span>
                  <button
                    type="button"
                    onClick={handleGeneratePin}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> 4-Digit PIN Generate
                  </button>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="අවම වශයෙන් අක්ෂර/ඉලක්කම් 4ක්..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm focus:border-amber-500 outline-none pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 text-slate-400 hover:text-white"
                      title={showPassword ? 'Hide' : 'Show'}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {newPassword && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="p-1.5 text-amber-400 hover:text-amber-300"
                        title="Copy Password"
                      >
                        {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 leading-relaxed">
                <p>• මෙම මුරපදය යාවත්කාලීන කළ පසු සේවකයාට නැවත ලොග් වීමට මෙම නව Password/PIN අංකය ඇතුළත් කිරීමට සිදුවේ.</p>
                <p>• දත්ත සමුදාය (Firestore) සහ සජීවීව සියලුම Devices වෙත ක්ෂණිකව Sync වේ.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                අවලංගු කරන්න
              </button>
              <button
                type="button"
                onClick={handleSavePassword}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>මුරපදය සුරකින්න (Save Password)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-900/60 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">සේවකයා පද්ධතියෙන් ඉවත් කිරීම</h3>
                <p className="text-xs text-rose-400 font-bold">Permanent Employee Removal</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                ඔබට <strong>{deleteModalUser.name}</strong> ({deleteModalUser.agentCode || deleteModalUser.employeeId || 'Staff'}) පද්ධතියෙන් ස්ථිරවම ඉවත් කිරීමට අවශ්‍ය බව තහවුරු කරන්න.
              </p>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 space-y-1">
                <p className="font-bold">⚠️ සැලකිය යුතුයි:</p>
                <p>ඔබට සේවකයාගේ ඓතිහාසික Sales හා Attendance දත්ත පද්ධතිය තුළ තබා ගැනීමට අවශ්‍ය නම්, මෙම ඉවත් කිරීම වෙනුවට <strong>BLOCKED</strong> හෝ <strong>EXITED</strong> තත්ත්වයට පත් කිරීම වඩාත් සුදුසු වේ.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                අවලංගු කරන්න
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'ඉවත් කරමින්...' : 'ඔව්, ස්ථිරවම ඉවත් කරන්න'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
