import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Clock,
  PenTool,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  QrCode,
  FileText,
  User,
  Building2,
  RefreshCw,
  Award,
  Layers,
  History,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { User as UserType, EmployeeIdApprovalStatus, EmploymentStatus } from '../../types';
import { DigitalEmployeeIdCard } from '../common/DigitalEmployeeIdCard';
import { QrCodeVerificationModal } from '../common/QrCodeVerificationModal';
import { OwnerSignatureModal } from '../common/OwnerSignatureModal';

const JOB_POSITION_PRESETS = [
  'Field Sales Representative',
  'Senior Sales Executive',
  'Team Leader',
  'Area Sales Manager',
  'Regional Operations Leader',
  'Operations Manager',
  'Managing Director',
];

export const EmployeeVerificationManagement: React.FC = () => {
  const {
    users,
    approveEmployeeId,
    rejectEmployeeIdPhoto,
    requestNewEmployeePhoto,
    updateEmployeeJobPosition,
    updateEmploymentStatus,
    employeeIdAuditLogs,
    ownerSignature,
  } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEW_PHOTO_REQUESTED' | 'BLOCKED_EXITED'
  >('ALL');

  // Modals state
  const [selectedUserForCard, setSelectedUserForCard] = useState<UserType | null>(null);
  const [selectedUserForQr, setSelectedUserForQr] = useState<UserType | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ title: string; content: string; name: string } | null>(null);

  // Reject modal state
  const [rejectingUser, setRejectingUser] = useState<UserType | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Editing position local state
  const [editingPositionUser, setEditingPositionUser] = useState<string | null>(null);
  const [customPositionText, setCustomPositionText] = useState('');

  // Statistics
  const totalEmployees = users.length;
  // Calibrate pending counter to reflect all users lacking approved ID credentials
  const pendingCount = users.filter((u) => u.role !== 'owner' && (u.idApprovalStatus || 'PENDING') !== 'APPROVED').length;
  const approvedCount = users.filter((u) => u.idApprovalStatus === 'APPROVED').length;
  const rejectedCount = users.filter((u) => u.idApprovalStatus === 'REJECTED').length;
  const newPhotoReqCount = users.filter((u) => u.idApprovalStatus === 'NEW_PHOTO_REQUESTED').length;
  const activeCount = users.filter((u) => (u.employmentStatus || 'ACTIVE') === 'ACTIVE').length;
  const suspendedCount = users.filter((u) => u.employmentStatus === 'SUSPENDED').length;
  const exitedCount = users.filter((u) => u.employmentStatus === 'EXITED').length;
  const blockedCount = users.filter((u) => u.employmentStatus === 'BLOCKED' || u.status === 'blocked').length;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const status = u.idApprovalStatus || 'PENDING';
    const empStatus = u.employmentStatus || (u.status === 'blocked' ? 'BLOCKED' : 'ACTIVE');

    if (filterTab === 'PENDING' && status !== 'PENDING') return false;
    if (filterTab === 'APPROVED' && status !== 'APPROVED') return false;
    if (filterTab === 'REJECTED' && status !== 'REJECTED') return false;
    if (filterTab === 'NEW_PHOTO_REQUESTED' && status !== 'NEW_PHOTO_REQUESTED') return false;
    if (filterTab === 'BLOCKED_EXITED' && empStatus === 'ACTIVE') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const empId = (u.employeeId || `DDW-EMP-${u.agentCode || '9000'}`).toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        (u.agentCode || '').toLowerCase().includes(q) ||
        empId.includes(q) ||
        (u.teamName || '').toLowerCase().includes(q) ||
        (u.jobPosition || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (user: UserType, customPosition?: string) => {
    const hasKycDocuments = Boolean(
      (user.gramaNiladhariReportUrl && user.policeReportUrl) ||
      (user.kycDocuments?.gnCertificate && user.kycDocuments?.policeReport)
    );
    if (!hasKycDocuments) {
      alert('⚠️ අනුමත කළ නොහැක: Grama Niladhari Character Report සහ Police Clearance Report ලේඛන දෙකම සම්පූර්ණ නොමැතිව හැඳුනුම්පත අනුමත කිරීමට අවසර නැත.');
      return;
    }

    const positionToApply =
      customPosition ||
      user.jobPosition ||
      (user.role === 'team_leader' ? 'Team Leader' : user.role === 'owner' ? 'Managing Director' : 'Field Sales Representative');

    if (!ownerSignature) {
      if (confirm('අයිතිකරුගේ ඩිජිටල් අත්සන තවමත් නොමැත. ඔබට දැන් ඩිජිටල් අත්සන එක් කිරීමට අවශ්‍යද?')) {
        setShowSignatureModal(true);
        return;
      }
    }

    approveEmployeeId(user.id, positionToApply);
  };

  const handleConfirmReject = () => {
    if (!rejectingUser) return;
    if (!rejectReason.trim()) {
      alert('කරුණාකර ප්‍රතික්ෂේප කිරීමට හේතුව ඇතුළත් කරන්න.');
      return;
    }
    rejectEmployeeIdPhoto(rejectingUser.id, rejectReason);
    setRejectingUser(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> DD WORLD OFFICIAL SECURITY
            </span>
            <span className="text-xs text-slate-400 font-mono">Owner Authorization Portal</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white">
            EMPLOYEE ID CARD VERIFICATION &amp; APPROVAL HUB
          </h1>
          <p className="text-xs text-slate-300">
            Review employee photos, designate official job positions, apply owner digital signatures, and manage identity statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSignatureModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
          >
            <PenTool className="w-4 h-4" />
            {ownerSignature ? '✍️ Owner Signature (Saved)' : '✍️ Add Owner Signature'}
          </button>
          <button
            onClick={() => setShowAuditModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition border border-slate-700"
          >
            <History className="w-4 h-4 text-cyan-400" /> Security Audit Log
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase">Total Staff</span>
          <p className="text-xl font-black text-white">{totalEmployees}</p>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 text-center space-y-1 bg-amber-500/5">
          <span className="text-[10px] text-amber-400 font-bold uppercase">Pending</span>
          <p className="text-xl font-black text-amber-400">{pendingCount}</p>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-3 text-center space-y-1 bg-emerald-500/5">
          <span className="text-[10px] text-emerald-400 font-bold uppercase">Approved IDs</span>
          <p className="text-xl font-black text-emerald-400">{approvedCount}</p>
        </div>

        <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-3 text-center space-y-1 bg-rose-500/5">
          <span className="text-[10px] text-rose-400 font-bold uppercase">Rejected</span>
          <p className="text-xl font-black text-rose-400">{rejectedCount}</p>
        </div>

        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-3 text-center space-y-1 bg-cyan-500/5">
          <span className="text-[10px] text-cyan-400 font-bold uppercase">Photo Req.</span>
          <p className="text-xl font-black text-cyan-400">{newPhotoReqCount}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase">Active Staff</span>
          <p className="text-xl font-black text-emerald-300">{activeCount}</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-center space-y-1">
          <span className="text-[10px] text-amber-500 font-bold uppercase">Suspended</span>
          <p className="text-xl font-black text-amber-300">{suspendedCount}</p>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/80 rounded-2xl p-3 text-center space-y-1 bg-rose-950/20">
          <span className="text-[10px] text-rose-500 font-bold uppercase">Exited/Blocked</span>
          <p className="text-xl font-black text-rose-400">{exitedCount + blockedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Name, Code, ID, Team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'ALL' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Staff ({users.length})
          </button>
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'PENDING' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
            }`}
          >
            Pending Approvals ({pendingCount})
          </button>
          <button
            onClick={() => setFilterTab('APPROVED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'APPROVED' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
          >
            Verified ({approvedCount})
          </button>
          <button
            onClick={() => setFilterTab('REJECTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'REJECTED' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
            }`}
          >
            Rejected ({rejectedCount})
          </button>
          <button
            onClick={() => setFilterTab('NEW_PHOTO_REQUESTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'NEW_PHOTO_REQUESTED' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
            }`}
          >
            Photo Req. ({newPhotoReqCount})
          </button>
          <button
            onClick={() => setFilterTab('BLOCKED_EXITED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'BLOCKED_EXITED' ? 'bg-rose-700 text-white' : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
            }`}
          >
            Suspended/Blocked ({suspendedCount + exitedCount + blockedCount})
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const empId = user.employeeId || `DDW-EMP-${user.agentCode || '9000'}`;
          const empStatus = user.employmentStatus || (user.status === 'blocked' ? 'BLOCKED' : 'ACTIVE');
          const idStatus = user.idApprovalStatus || 'PENDING';
          const hasKycDocuments = Boolean(
            (user.gramaNiladhariReportUrl && user.policeReportUrl) ||
            (user.kycDocuments?.gnCertificate && user.kycDocuments?.policeReport)
          );
          const jobPosition =
            user.jobPosition ||
            (user.role === 'team_leader' ? 'Team Leader' : user.role === 'owner' ? 'Managing Director' : 'Field Sales Representative');

          return (
            <div
              key={user.id}
              className={`bg-slate-900 border rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between transition-all hover:border-amber-500/40 ${
                idStatus === 'APPROVED'
                  ? 'border-emerald-500/30'
                  : idStatus === 'REJECTED'
                  ? 'border-rose-500/30'
                  : idStatus === 'NEW_PHOTO_REQUESTED'
                  ? 'border-cyan-500/30'
                  : 'border-amber-500/40 bg-amber-500/5'
              }`}
            >
              {/* Card Top: Photo & Basic Details */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-400/50 overflow-hidden flex items-center justify-center shadow-inner">
                        {user.photoUrl || user.avatar ? (
                          <img src={user.photoUrl || user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-black text-xl">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${
                        empStatus === 'ACTIVE'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-rose-500 text-white border-rose-400'
                      }`}>
                        {empStatus}
                      </span>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-sm font-black text-white truncate">{user.name}</h3>
                      <p className="text-xs font-mono text-amber-300 font-bold">{empId}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Code: {user.agentCode || 'N/A'}</p>
                    </div>
                  </div>

                  {/* ID Approval Status Badge */}
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                      idStatus === 'APPROVED'
                        ? 'bg-emerald-950 border-emerald-500/50 text-emerald-400'
                        : idStatus === 'REJECTED'
                        ? 'bg-rose-950 border-rose-500/50 text-rose-400'
                        : idStatus === 'NEW_PHOTO_REQUESTED'
                        ? 'bg-cyan-950 border-cyan-500/50 text-cyan-400'
                        : 'bg-amber-950 border-amber-500/50 text-amber-400 animate-pulse'
                    }`}>
                      {idStatus === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                      {idStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {idStatus === 'PENDING' && <Clock className="w-3 h-3" />}
                      {idStatus === 'NEW_PHOTO_REQUESTED' && <RefreshCw className="w-3 h-3" />}
                      {idStatus}
                    </span>
                  </div>
                </div>

                {/* Job Position Control */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                    <span>Official Job Position:</span>
                    <span className="text-amber-400 text-[9px] font-semibold">(Owner Control Only)</span>
                  </div>

                  {editingPositionUser === user.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={customPositionText}
                        onChange={(e) => setCustomPositionText(e.target.value)}
                        placeholder="e.g. Field Sales Representative"
                        className="flex-1 bg-slate-950 border border-amber-400 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (customPositionText.trim()) {
                            updateEmployeeJobPosition(user.id, customPositionText.trim());
                            setEditingPositionUser(null);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                      <select
                        value={jobPosition}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM') {
                            setEditingPositionUser(user.id);
                            setCustomPositionText(user.jobPosition || '');
                          } else {
                            updateEmployeeJobPosition(user.id, e.target.value);
                          }
                        }}
                        className="bg-transparent text-amber-300 font-bold w-full focus:outline-none cursor-pointer"
                      >
                        {JOB_POSITION_PRESETS.map((pos) => (
                          <option key={pos} value={pos} className="bg-slate-900 text-white">
                            {pos}
                          </option>
                        ))}
                        <option value="CUSTOM" className="bg-slate-900 text-amber-400">
                          + Custom Position...
                        </option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Team & Employment Status Dropdown */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Team Name:</span>
                    <span className="font-bold text-slate-200 truncate block">{user.teamName || 'Headquarters'}</span>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Employment Status:</span>
                    <select
                      value={empStatus}
                      onChange={(e) => updateEmploymentStatus(user.id, e.target.value as EmploymentStatus)}
                      className={`w-full bg-transparent font-black text-xs focus:outline-none cursor-pointer ${
                        empStatus === 'ACTIVE'
                          ? 'text-emerald-400'
                          : empStatus === 'SUSPENDED'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      <option value="ACTIVE" className="bg-slate-900 text-emerald-400">ACTIVE</option>
                      <option value="SUSPENDED" className="bg-slate-900 text-amber-400">SUSPENDED</option>
                      <option value="EXITED" className="bg-slate-900 text-rose-400">EXITED</option>
                      <option value="BLOCKED" className="bg-slate-900 text-rose-500 font-bold">BLOCKED</option>
                    </select>
                  </div>
                </div>

                {/* KYC Documents Section */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-400" />
                      Mandatory KYC Documents:
                    </span>
                    {user.gramaNiladhariReportUrl && user.policeReportUrl ? (
                      <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Both Uploaded
                      </span>
                    ) : (
                      <span className="text-amber-400 font-extrabold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Incomplete
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Grama Niladhari Report */}
                    {user.gramaNiladhariReportUrl ? (
                      <button
                        onClick={() =>
                          setViewingDoc({
                            title: `Grama Niladhari Report - ${user.name}`,
                            content: user.gramaNiladhariReportUrl!,
                            name: user.gramaReportName || 'Grama_Niladhari_Report.pdf',
                          })
                        }
                        className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-between gap-1 transition"
                        title="Click to view Grama Niladhari Report"
                      >
                        <span className="truncate">✓ GN Report</span>
                        <Eye className="w-3 h-3 shrink-0 text-emerald-400" />
                      </button>
                    ) : (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold text-center">
                        GN Missing
                      </div>
                    )}

                    {/* Police Clearance Report */}
                    {user.policeReportUrl ? (
                      <button
                        onClick={() =>
                          setViewingDoc({
                            title: `Police Clearance Report - ${user.name}`,
                            content: user.policeReportUrl!,
                            name: user.policeReportName || 'Police_Clearance_Report.pdf',
                          })
                        }
                        className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-between gap-1 transition"
                        title="Click to view Police Clearance Report"
                      >
                        <span className="truncate">✓ Police Report</span>
                        <Eye className="w-3 h-3 shrink-0 text-purple-400" />
                      </button>
                    ) : (
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold text-center">
                        Police Missing
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Notice if applicable */}
                {user.idRejectedReason && (
                  <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs space-y-0.5">
                    <span className="font-bold block text-[10px] uppercase text-rose-400">Rejection Reason:</span>
                    <p className="text-slate-300 italic">{user.idRejectedReason}</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedUserForCard(user)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" /> Preview ID
                  </button>
                  <button
                    onClick={() => setSelectedUserForQr(user)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Scan QR
                  </button>
                </div>

                {/* Primary Approval / Action Buttons */}
                <div className="space-y-2">
                  {!hasKycDocuments && (
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>⚠️ Cannot Approve: Grama Niladhari &amp; Police Reports Missing</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      disabled={!hasKycDocuments}
                      onClick={() => handleApprove(user)}
                      className={`flex-1 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition ${
                        !hasKycDocuments
                          ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700'
                          : idStatus === 'APPROVED'
                          ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                      }`}
                      title={!hasKycDocuments ? 'Grama Niladhari සහ Police වාර්තා සම්පූර්ණ වනතෙක් අනුමත කළ නොහැක' : 'Approve Employee ID'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {idStatus === 'APPROVED' ? 'Re-Approve ID' : 'Approve Employee ID'}
                    </button>

                    <button
                      onClick={() => setRejectingUser(user)}
                      className="px-3 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-400 font-bold text-xs transition"
                      title="Reject Employee Photo"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => requestNewEmployeePhoto(user.id)}
                      className="px-3 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-400 font-bold text-xs transition"
                      title="Request New Photo"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject Reason Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> REJECT EMPLOYEE PHOTO / ID
            </h3>
            <p className="text-xs text-slate-300">
              Employee: <strong className="text-white">{rejectingUser.name}</strong> ({rejectingUser.agentCode})
            </p>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-bold">Rejection Reason (visible to Agent):</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Photo is blurry / casual background. Please submit an official passport-style formal photo."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-400"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectingUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ID Card Modal Overlay */}
      {selectedUserForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-black text-amber-400">DIGITAL EMPLOYEE ID PREVIEW</h3>
              <button
                onClick={() => setSelectedUserForCard(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
            <DigitalEmployeeIdCard user={selectedUserForCard} onClose={() => setSelectedUserForCard(null)} />
          </div>
        </div>
      )}

      {/* QR Code Verification Modal Overlay */}
      {selectedUserForQr && (
        <QrCodeVerificationModal user={selectedUserForQr} onClose={() => setSelectedUserForQr(null)} />
      )}

      {/* Owner Signature Modal */}
      {showSignatureModal && (
        <OwnerSignatureModal onClose={() => setShowSignatureModal(false)} />
      )}

      {/* Security Audit Log Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                <History className="w-5 h-5" /> EMPLOYEE ID SECURITY AUDIT LOG
              </h3>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-3 py-1 rounded-xl"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1 pr-1">
              {employeeIdAuditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">No security audit logs recorded yet.</p>
              ) : (
                employeeIdAuditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-mono font-bold text-amber-300">{log.employeeId} ({log.agentCode})</span>
                      <span className="text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-bold">{log.employeeName}</span>
                      <span className="font-black uppercase text-cyan-400">{log.action}</span>
                    </div>
                    {log.previousValue && (
                      <p className="text-slate-400 text-[10px]">Prev: {log.previousValue} → New: {log.newValue}</p>
                    )}
                    {log.approvedBy && (
                      <p className="text-amber-400 text-[10px]">Authorized By: {log.approvedBy}</p>
                    )}
                    {log.rejectedReason && (
                      <p className="text-rose-400 text-[10px]">Reason: {log.rejectedReason}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* KYC Document Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black text-white">{viewingDoc.title}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingDoc.name}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[300px]">
              {viewingDoc.content.startsWith('data:image/') ? (
                <img
                  src={viewingDoc.content}
                  alt={viewingDoc.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              ) : (
                <div className="text-center space-y-3 p-6">
                  <FileText className="w-16 h-16 text-amber-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">{viewingDoc.name}</h4>
                  <p className="text-xs text-emerald-400 font-mono">
                    ✓ KYC Document Verified &amp; Attached to Staff Record in Firestore Database.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingDoc(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
