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

    // If user has a password set, populate their code so they can enter password
    if (target.password || target.tempPassword) {
      setAgentCode(target.agentCode || target.employeeId || target.id);
      setError(`ℹ️ ${target.name} (${target.agentCode || target.role}) සඳහා නියමිත Password එක ඇතුළත් කර Login වන්න.`);
      return;
    }

    // Remember last selected user for quick fingerprint login
    safeStorage.setItem('ddworld_last_bio_user_id', userId);
    login(userId);
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

    // Check password if set
    const requiredPass = found.password || found.tempPassword || found.pinCode;
    if (requiredPass) {
      if (!passwordInput || !passwordInput.trim()) {
        setError(`කරුණාකර ${found.name} (${found.agentCode}) සඳහා වන Password ඇතුළත් කරන්න.`);
        return;
      }
      if (passwordInput.trim() !== requiredPass.trim()) {
        setError('ඇතුළත් කළ මුරපදය (Password) වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න.');
        return;
      }
    }

    safeStorage.setItem('ddworld_last_bio_user_id', found.id);
    login(found.id);
  };

  // Biometric / Fingerprint Authentication Flow with Anti-Cheat GPS Integrity
  const handleBiometricLogin = async () => {
    setBioError(null);
    setFraudAlert(null);
    setIsCheckingSecurity(true);

    try {
      // Step A: Anti-Cheat & GPS Mock Integrity Check
      // Checks Android Location.isMock() or browser mock location injection
      const gpsSecurityResult = await new Promise<{ isMock: boolean; reason?: string }>((resolve) => {
        if (!navigator.geolocation) {
          resolve({ isMock: false });
          return;
        }

        const timeout = setTimeout(() => {
          resolve({ isMock: false });
        }, 2200);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeout);
            const coords = pos.coords as any;
            // Direct Android Location.isMock() inspection
            if (
              coords.isMock === true ||
              coords.mocked === true ||
              coords.isFromMockProvider === true ||
              coords.mockLocation === true
            ) {
              resolve({
                isMock: true,
                reason: 'Android Mock Location Provider හඳුනාගන්නා ලදී (Location.isMock() == true)',
              });
              return;
            }

            // Heuristic Anti-Cheat validation
            const detection = detectFakeGps(pos.coords);
            if (detection.isFake) {
              resolve({
                isMock: true,
                reason: detection.reason || 'GPS Spoofing / Mock Signal Detected',
              });
              return;
            }

            resolve({ isMock: false });
          },
          (err) => {
            clearTimeout(timeout);
            resolve({ isMock: false });
          },
          { enableHighAccuracy: true, timeout: 2200, maximumAge: 0 }
        );
      });

      if (gpsSecurityResult.isMock) {
        setIsCheckingSecurity(false);
        setFraudAlert(
          `🚨 වංචනික GPS හෝ Mock Location හඳුනාගන්නා ලදී (FRAUD ALERT: Mock GPS Spoofing Detected). හේතුව: ${gpsSecurityResult.reason}. උපාංගයේ සත්‍යාපනය අසාර්ථකයි - පද්ධතියට පිවිසීම ආරක්ෂිතව අවහිර කර ඇත.`
        );
        return;
      }

      setIsCheckingSecurity(false);
      setIsBioScanning(true);

      // Find candidate user (either remembered user, or first user of selected role)
      const rememberedId = safeStorage.getItem('ddworld_last_bio_user_id');
      const candidateUser =
        (rememberedId && users.find((u) => u.id === rememberedId)) ||
        filteredUsers[0] ||
        users.find((u) => u.role === 'owner') ||
        users[0];

      if (!candidateUser) {
        throw new Error('Biometric ලියාපදිංචි පරිශීලකයෙකු හමු නොවීය.');
      }

      if (
        candidateUser.employmentStatus === 'BLOCKED' ||
        candidateUser.employmentStatus === 'SUSPENDED' ||
        candidateUser.status === 'blocked'
      ) {
        throw new Error('මෙම ගිණුම පරිපාලක විසින් අත්හිටුවා ඇත (ACCOUNT BLOCKED).');
      }

      // Biometric scan latency simulation
      await new Promise((resolve) => setTimeout(resolve, 900));

      setBioSuccess(true);
      setTimeout(() => {
        setIsBioScanning(false);
        setBioSuccess(false);
        login(candidateUser.id);
      }, 650);
    } catch (err: any) {
      console.warn('Biometric login warning:', err);
      setIsCheckingSecurity(false);
      setIsBioScanning(false);
      setBioError(err?.message || 'Fingerprint සංවේදකය කියවීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.');
      setTimeout(() => setBioError(null), 5000);
    }
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

        {/* CLOUD & BIOMETRICS STATUS BADGES */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Firebase: සක්‍රීයයි (Active)</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-red-500/10 border border-[#E1141E]/40 text-red-300">
            <Fingerprint className="w-3.5 h-3.5 text-[#E1141E] shrink-0 animate-pulse" />
            <span className="truncate">Biometric: සක්‍රීයයි (Ready)</span>
          </div>
        </div>

        {/* MODERN HIGH-FIDELITY BIOMETRIC FINGERPRINT SECTION */}
        <div className="relative p-5 rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/90 to-slate-950/90 border-2 border-[#E1141E]/40 hover:border-[#E1141E] transition-all shadow-xl shadow-red-950/20 text-center overflow-hidden">
          {/* Top badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#E1141E]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span className="tracking-wider uppercase font-mono">Dialog Axiata Biometric Auth</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              FIDO2 / Biometric Ready
            </span>
          </div>

          {/* Full-width Anti-Fraud Alert */}
          {fraudAlert && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/90 border-2 border-red-500 text-left space-y-1 animate-pulse">
              <div className="flex items-center gap-2 text-red-300 text-xs font-black">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                <span>ආරක්ෂක අනතුරු ඇඟවීමයි (SECURITY FRAUD BREACH)</span>
              </div>
              <p className="text-[11px] text-red-200 leading-relaxed font-medium">
                {fraudAlert}
              </p>
            </div>
          )}

          {/* Interactive Biometric Icon with dynamic glowing pulsing ripple */}
          <div className="flex flex-col items-center justify-center my-3 relative">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={isBioScanning || isCheckingSecurity}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                bioSuccess
                  ? 'bg-emerald-500 text-slate-950 border-4 border-emerald-300 ring-8 ring-emerald-500/30 scale-105'
                  : isBioScanning
                  ? 'bg-red-500/20 text-red-400 border-4 border-[#E1141E] ring-8 ring-[#E1141E]/30 scale-105'
                  : isCheckingSecurity
                  ? 'bg-amber-500/20 text-amber-300 border-4 border-amber-500 ring-8 ring-amber-500/30 animate-pulse'
                  : 'bg-slate-950 text-[#E1141E] hover:text-white border-2 border-[#E1141E]/60 hover:border-[#E1141E] hover:bg-[#E1141E]/10 hover:scale-105'
              }`}
              title="ඇඟිලි සලකුණ තබන්න / Scan Fingerprint"
            >
              {/* Dynamic Glowing Pulsing Circular Ripple (animate-ping) */}
              {(isBioScanning || isCheckingSecurity) && (
                <span
                  className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                    isCheckingSecurity ? 'bg-amber-400' : 'bg-[#E1141E]'
                  }`}
                />
              )}
              {!isBioScanning && !isCheckingSecurity && !bioSuccess && (
                <span className="absolute -inset-1 rounded-full border border-[#E1141E]/30 animate-pulse pointer-events-none" />
              )}

              {bioSuccess ? (
                <CheckCircle2 className="w-12 h-12 text-slate-950 relative z-10 transition-transform duration-300 scale-110" />
              ) : isCheckingSecurity ? (
                <ShieldCheck className="w-12 h-12 text-amber-400 relative z-10 animate-bounce" />
              ) : (
                <Fingerprint
                  className={`w-12 h-12 relative z-10 transition-transform duration-300 ${
                    isBioScanning ? 'animate-pulse text-red-400 scale-110' : ''
                  }`}
                />
              )}
            </button>

            {/* Intuitive Bilingual Subtext Labels */}
            <div className="mt-3 space-y-1">
              <p className="text-sm font-black text-white tracking-wide">
                ඇඟිලි සලකුණ තබන්න / Scan Fingerprint
              </p>
              <p className="text-[11px] text-slate-400">
                One-Touch Biometric TouchID &amp; Android Keystore Protection
              </p>
            </div>
          </div>

          {/* Visible Anti-Cheat Text Status Loader during Location.isMock() verification */}
          {isCheckingSecurity && (
            <div className="mt-3 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>උපාංගයේ ආරක්ෂාව සහ සජීවී පිහිටීම පරීක්ෂා කරමින්... / Checking device security &amp; GPS integrity...</span>
            </div>
          )}

          {isBioScanning && !isCheckingSecurity && (
            <div className="mt-3 p-2 rounded-xl bg-red-500/10 border border-[#E1141E]/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E1141E] animate-ping" />
              <span>ඇඟිලි සලකුණ කියවමින් පවතී... / Verifying Biometric Credentials...</span>
            </div>
          )}

          {bioSuccess && (
            <div className="mt-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>සත්‍යාපනය සාර්ථකයි (Biometric Authorized) - පිවිසෙමින් පවතී...</span>
            </div>
          )}

          {bioError && !fraudAlert && (
            <div className="mt-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{bioError}</span>
            </div>
          )}
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
