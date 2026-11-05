import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  UserCheck,
  KeyRound,
  ArrowRight,
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Lock,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { UserRole } from '../types';
import { DdWorldLogo } from './common/DdWorldLogo';
import { safeStorage } from '../utils/safeStorage';
import { detectFakeGps } from '../utils/antiCheatDetector';

import { MobileAppContainer } from './mobile/MobileAppContainer';
import { MobileLoginScreen } from './mobile/MobileLoginScreen';
import { Smartphone, Monitor } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { login } = useAuth();
  const { users } = useData();
  const [loginViewMode, setLoginViewMode] = useState<'mobile' | 'enterprise'>('mobile');
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [agentCode, setAgentCode] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isCheckingSecurity, setIsCheckingSecurity] = useState(false);
  const [isBioScanning, setIsBioScanning] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);
  const [fraudAlert, setFraudAlert] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => u.role === selectedRole);

  const handleSelectUser = (userId: string) => {
    setError('');
    setFraudAlert(null);
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    // Check if account is blocked or suspended
    if (
      target.employmentStatus === 'BLOCKED' ||
      target.employmentStatus === 'SUSPENDED' ||
      target.employmentStatus === 'EXITED' ||
      target.status === 'blocked'
    ) {
      setError(`🚫 මෙම ගිණුම (${target.name}) පරිපාලක (Owner) විසින් අත්හිටුවා ඇත (ACCOUNT BLOCKED). පිවිසීම අවලංගුයි.`);
      return;
    }

    // Check individual owner approval for employees
    if (target.role !== 'owner' && target.role !== 'dialog_officer' && target.idApprovalStatus !== 'APPROVED') {
      setError(`⏳ මෙම ගිණුම (${target.name}) සක්‍රිය කිරීමට ආයතන ප්‍රධානී (Owner) ගේ අනුමැතිය අවශ්‍ය වේ (PENDING OWNER APPROVAL).`);
      return;
    }

    // A roster selection is never an authentication factor. Do not sign in from a name/code tap.
    if (!target.password && !target.tempPassword && !target.pinCode) {
      setError('මෙම ගිණුමට ආරක්ෂිත Password එකක් සකසා නැත. Owner අමතා ගිණුම සකස් කරගන්න.');
      return;
    }
    setAgentCode(target.agentCode || target.employeeId || target.id);
    setError(`${target.name} සඳහා Password එක ඇතුළත් කර Login වන්න.`);
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFraudAlert(null);
    if (!agentCode || !agentCode.trim()) {
      setError('කරුණාකර Agent Code, පරිශීලක නාමය හෝ දුරකථන අංකය ඇතුළත් කරන්න');
      return;
    }
    const cleanInput = agentCode.trim().toLowerCase();
    const found = users.find(
      (u) =>
        (u.agentCode && u.agentCode.trim().toLowerCase() === cleanInput) ||
        (u.employeeId && u.employeeId.trim().toLowerCase() === cleanInput) ||
        (u.id && u.id.toLowerCase() === cleanInput) ||
        (u.name && u.name.trim().toLowerCase() === cleanInput) ||
        (u.email && u.email.toLowerCase() === cleanInput) ||
        (u.mobile && u.mobile.trim() === cleanInput) ||
        (u.phone && u.phone.trim() === cleanInput)
    );

    if (!found) {
      setError('වලංගු නොවන Agent Code හෝ පරිශීලක නාමයකි. කරුණාකර නිවැරදි Code එක ඇතුළත් කරන්න.');
      return;
    }

    // Check blocked status
    if (
      found.employmentStatus === 'BLOCKED' ||
      found.employmentStatus === 'SUSPENDED' ||
      found.employmentStatus === 'EXITED' ||
      found.status === 'blocked'
    ) {
      setError(`🚫 මෙම ගිණුම (${found.name}) පරිපාලක (Owner) විසින් අත්හිටුවා ඇත (ACCOUNT BLOCKED). පිවිසීම අවලංගුයි.`);
      return;
    }

    // Check individual owner approval for employees
    if (found.role !== 'owner' && found.role !== 'dialog_officer' && found.idApprovalStatus !== 'APPROVED') {
      setError(`⏳ මෙම ගිණුම (${found.name}) සක්‍රිය කිරීමට ආයතන ප්‍රධානී (Owner) ගේ අනුමැතිය අවශ්‍ය වේ (PENDING OWNER APPROVAL).`);
      return;
    }

    // Fail closed: a missing password must never mean passwordless access.
    const requiredPass = found.password || found.tempPassword || found.pinCode;
    if (!requiredPass || !passwordInput.trim() || passwordInput.trim() !== requiredPass.trim()) {
      setError('Agent Code හෝ Password වැරදියි. Password එකක් සකසා නැත්නම් Owner අමතා ආරක්ෂිතව නැවත සකස් කරගන්න.');
      return;
    }

    safeStorage.setItem('ddworld_last_bio_user_id', found.id);
    login(found.id);
  };

  if (loginViewMode === 'mobile') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 overflow-y-auto">
        <div className="fixed top-3 left-4 z-50">
          <button
            onClick={() => setLoginViewMode('enterprise')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white shadow-xl transition"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>Enterprise Web Portal</span>
          </button>
        </div>
        <MobileAppContainer allowFrameToggle={true}>
          <MobileLoginScreen />
        </MobileAppContainer>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900/95 backdrop-blur-md border-2 border-[#E1141E]/40 hover:border-[#E1141E] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-red-950/30 space-y-5 relative overflow-hidden transition-colors">
        {/* View Switcher Button & Dialog Axiata Official Partner Header Bar */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-800">
          <button
            onClick={() => setLoginViewMode('mobile')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-600/20 border border-blue-500/40 text-[11px] font-bold text-blue-300 hover:bg-blue-600/30 transition"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 Official Mobile App View</span>
          </button>
          <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
            Authorized Enterprise Partner
          </span>
        </div>

        <div className="flex items-center justify-between bg-gradient-to-r from-red-600/20 via-orange-500/20 to-amber-500/20 border border-[#E1141E]/40 rounded-2xl px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E1141E] animate-pulse" />
            <span className="font-bold text-white tracking-wide">Dialog Axiata PLC</span>
          </div>
          <span className="text-[11px] font-bold text-slate-300">
            DD WORLD Field Ops
          </span>
        </div>

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <DdWorldLogo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">DD WORLD MARKETING</h1>
          <p className="text-xs text-slate-400 font-medium">
            Official Dialog Sayura (#828#) &amp; Govi Mithuru (#616#) Operational Platform
          </p>
        </div>

        {/* ROLE SELECTION TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedRole('owner')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all ${
              selectedRole === 'owner'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Owner
          </button>
          <button
            onClick={() => setSelectedRole('team_leader')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all ${
              selectedRole === 'team_leader'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Team Leader
          </button>
          <button
            onClick={() => setSelectedRole('agent')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all ${
              selectedRole === 'agent'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Field Agent
          </button>
          <button
            onClick={() => setSelectedRole('dialog_officer')}
            className={`py-2 px-2.5 rounded-lg text-xs font-bold text-center transition-all ${
              selectedRole === 'dialog_officer'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Officer
          </button>
        </div>

        {/* USER LIST SELECT */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            පහත ගිණුමක් තෝරන්න (Select Account)
          </p>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelectUser(u.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs">
                    {u.name.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                      {u.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Code: {u.agentCode} {u.designation ? `• ${u.designation}` : ''}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* MANUAL CODE LOGIN */}
        <form onSubmit={handleManualLogin} className="space-y-2.5 pt-3 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Agent Code මගින් පිවිසෙන්න
          </p>
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg">
              {error}
            </div>
          )}
          <div className="relative">
            <KeyRound className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Agent Code / Username (e.g. 9000, 9087, 9263)"
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
            <input
              type="password"
              placeholder="Password (e.g. password9000!, password9087!)"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            පිවිසෙන්න (Login)
          </button>
        </form>
      </div>
    </div>
  );
};
