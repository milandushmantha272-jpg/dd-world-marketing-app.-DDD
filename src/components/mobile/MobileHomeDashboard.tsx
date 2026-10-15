import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DdWorldEmblem, DialogLogo } from './DdWorldBranding';
import {
  Menu,
  Bell,
  TrendingUp,
  ShieldCheck,
  PhoneCall,
  User,
  Phone,
  Copy,
  Check,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';

interface MobileHomeDashboardProps {
  onNavigate: (screen: 'sales' | 'verification' | 'ussd' | 'profile' | 'details_govimithuru' | 'details_sayuru') => void;
  onOpenMenu: () => void;
}

export const MobileHomeDashboard: React.FC<MobileHomeDashboardProps> = ({
  onNavigate,
  onOpenMenu,
}) => {
  const { currentUser } = useAuth();
  const { attendance, sales, addAttendanceRecord } = useData();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [ussdTriggerNotice, setUssdTriggerNotice] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAtt = attendance.find(
    (a) => (a.agentId === currentUser?.id || a.agentCode === currentUser?.agentCode) && a.date === todayStr
  );
  const mySalesToday = sales.filter(
    (s) => (s.agentId === currentUser?.id || s.agentCode === currentUser?.agentCode) && s.date === todayStr
  );

  const handleCopyAndDial = (code: string, label: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);

    const encoded = code.replace(/#/g, '%23');
    setUssdTriggerNotice(`📱 USSD කේතය ${code} පිටපත් කර Dial කරන ලදී (${label})`);
    setTimeout(() => setUssdTriggerNotice(null), 4000);

    try {
      window.location.href = `tel:${encoded}`;
    } catch {
      // ignore
    }
  };

  const handleQuickCheckIn = () => {
    if (!currentUser || todayAtt) return;
    addAttendanceRecord({
      agentId: currentUser.id,
      agentName: currentUser.name,
      agentCode: currentUser.agentCode || '9000',
      teamId: currentUser.teamId || 'team_direct',
      teamName: currentUser.teamName || 'Direct Field Agents (Owner Group)',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'present',
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto px-5 pt-3 pb-6 space-y-4">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between py-1">
        {/* Menu Hamburger */}
        <button
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition"
          aria-label="Open Side Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Centered Logo */}
        <div className="flex items-center gap-2">
          <DdWorldEmblem size={28} />
          <div className="flex flex-col">
            <span className="font-black text-xs text-[#0D3B66] tracking-tight leading-none">
              D.D. WORLD
            </span>
            <span className="font-extrabold text-[7px] text-[#1E88E5] tracking-widest leading-none">
              MARKETING
            </span>
          </div>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => alert('🔔 නව නිල නිවේදන (Notices) නොමැත.')}
          className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#E53935] ring-2 ring-white" />
        </button>
      </div>

      {/* Notice Banner */}
      {ussdTriggerNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in">
          <span>{ussdTriggerNotice}</span>
          <button onClick={() => setUssdTriggerNotice(null)} className="text-emerald-600 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Greeting Card */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 leading-tight">
            Good Morning, <br className="sm:hidden" />
            <span className="text-blue-700">{currentUser?.name.split(' ')[0] || 'Dushmantha'}</span>
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Agent ID : <span className="font-mono text-slate-600 font-bold">{currentUser?.agentCode || '9000'}</span>
          </p>
        </div>

        {/* Attendance Pill */}
        <button
          onClick={handleQuickCheckIn}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-sm ${
            todayAtt
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>{todayAtt ? 'Attended' : 'Check-In'}</span>
        </button>
      </div>

      {/* Dialog Promo Card (Stay Connected Stay Ahead) */}
      <div className="relative rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-[#F4511E] via-[#FB8C00] to-[#FFB300] text-white p-5">
        {/* Tropical Leaves silhouettes background */}
        <div className="absolute right-0 top-0 bottom-0 w-36 pointer-events-none opacity-25">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M 90 10 C 70 30 50 60 40 100 C 60 80 80 50 90 10 Z" />
            <path d="M 80 0 C 60 20 40 40 20 80 C 40 60 60 40 80 0 Z" />
            <path d="M 100 40 C 70 60 60 80 50 100 C 70 90 90 70 100 40 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between h-28">
          {/* Top Dialog Tag */}
          <div className="flex items-center">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-black tracking-wide text-white">
              Dialog
            </span>
          </div>

          {/* Heading */}
          <div>
            <h3 className="text-xl font-black leading-tight tracking-tight drop-shadow-sm">
              Stay Connected <br />
              Stay Ahead
            </h3>
          </div>
        </div>
      </div>

      {/* 4 Main Action Cards Grid (2x2 matching mockup) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Sales Card */}
        <button
          onClick={() => onNavigate('sales')}
          className="group p-5 rounded-3xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] text-white shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between h-28"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <span className="text-base font-black tracking-tight block">Sales</span>
            <span className="text-[10px] text-blue-100 font-medium">{mySalesToday.length} today</span>
          </div>
        </button>

        {/* Verification Card */}
        <button
          onClick={() => onNavigate('verification')}
          className="group p-5 rounded-3xl bg-gradient-to-br from-[#43A047] to-[#2E7D32] text-white shadow-md shadow-green-500/20 hover:shadow-green-500/35 hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between h-28"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <span className="text-base font-black tracking-tight block">Verification</span>
            <span className="text-[10px] text-green-100 font-medium">Service check</span>
          </div>
        </button>

        {/* USSD Card */}
        <button
          onClick={() => onNavigate('ussd')}
          className="group p-5 rounded-3xl bg-gradient-to-br from-[#8E24AA] to-[#6A1B9A] text-white shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between h-28"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <span className="text-base font-black tracking-tight block">USSD</span>
            <span className="text-[10px] text-purple-100 font-medium">Instant dialer</span>
          </div>
        </button>

        {/* Profile Card */}
        <button
          onClick={() => onNavigate('profile')}
          className="group p-5 rounded-3xl bg-gradient-to-br from-[#FB8C00] to-[#EF6C00] text-white shadow-md shadow-orange-500/20 hover:shadow-orange-500/35 hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-between h-28"
        >
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <span className="text-base font-black tracking-tight block">Profile</span>
            <span className="text-[10px] text-orange-100 font-medium">ID & Account</span>
          </div>
        </button>
      </div>

      {/* Quick USSD Code Pill Buttons (matching mockup) */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block ml-1">
          Quick USSD Call
        </span>
        <div className="grid grid-cols-2 gap-3">
          {/* #616# Red Button */}
          <button
            onClick={() => handleCopyAndDial('#616#', 'Govi Mithuru')}
            className="group py-3.5 px-4 rounded-2xl bg-[#E53935] hover:bg-red-700 active:scale-95 text-white shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-2 font-black text-lg tracking-wider"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>#616#</span>
            {copiedCode === '#616#' && <Check className="w-4 h-4 text-white" />}
          </button>

          {/* #828# Blue Button */}
          <button
            onClick={() => handleCopyAndDial('#828#', 'Sayuru')}
            className="group py-3.5 px-4 rounded-2xl bg-[#1E88E5] hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 font-black text-lg tracking-wider"
          >
            <Phone className="w-4 h-4 fill-white" />
            <span>#828#</span>
            {copiedCode === '#828#' && <Check className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* Quick Service Highlights */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            🌾
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Govi Mithuru & Sayuru</span>
            <span className="text-[11px] text-slate-400">Official Dialog Digital Packs</span>
          </div>
        </div>
        <button
          onClick={() => onNavigate('sales')}
          className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-700"
        >
          <span>View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
