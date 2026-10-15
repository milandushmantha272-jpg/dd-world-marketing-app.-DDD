import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { ShieldAlert, UserCheck, LogOut, ChevronDown, Award, Users, UserIcon, ShieldCheck, CheckCircle2, AlertCircle, MapPin, Share2, FileSpreadsheet, Sparkles, Maximize, Minimize, Smartphone, ExternalLink, Bell, Volume2 } from 'lucide-react';
import {
  requestNotificationPermission,
  playNotificationChime,
  triggerWebPushNotification,
} from '../utils/audioNotification';
import { EmployeeVerificationModal } from './verification/EmployeeVerificationModal';
import { OfficialCorporateIdCardModal } from './verification/OfficialCorporateIdCardModal';
import { OfficialJobRulesModal } from './common/OfficialJobRulesModal';
import { SriLankaGpsMapModal } from './common/SriLankaGpsMapModal';
import { VisualGuideModal } from './common/VisualGuideModal';
import { DdWorldLogo } from './common/DdWorldLogo';
import { AutoCloudSyncBadge } from './common/AutoCloudSyncBadge';
import { PWAInstallButton } from './common/PWAInstallButton';

export const Navbar: React.FC = () => {
  const { currentUser, logout, loginAsUser } = useAuth();
  const { users, verifications, sales, attendance, teams } = useData();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);
  const [gpsMapOpen, setGpsMapOpen] = useState(false);
  const [visualGuideOpen, setVisualGuideOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [appGuideOpen, setAppGuideOpen] = useState(false);
  const [jobRulesOpen, setJobRulesOpen] = useState(false);
  const [notifGranted, setNotifGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    playNotificationChime();
    triggerWebPushNotification(
      '📲 DD WORLD සජීවී Call & Notifications සක්‍රීය විය!',
      'දැන් ඔබ වෙත පැමිණෙන සියලුම Calls, Chat Messages සහ Meetings පිළිබඳව Instant Sound Alert & Ringtone හිමිවේ.'
    );
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => console.log(err));
    } else {
      document.exitFullscreen?.().catch((err) => console.log(err));
    }
  };

  const directAppUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-dev-dsekgfmwcewvlxn6gghirt-814098050496.asia-east1.run.app';

  if (!currentUser) return null;

  const myVerif = verifications.find((v) => v.userId === currentUser.id);

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(directAppUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'owner':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Owner Dashboard
          </span>
        );
      case 'team_leader':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            Team Leader ({currentUser.teamName || 'Team Leader'})
          </span>
        );
      case 'agent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            Agent ({currentUser.agentCode}) - {currentUser.teamName || 'Agent'}
          </span>
        );
      case 'junior_team_leader':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            Junior Team Leader ({currentUser.teamName || 'Junior Team Leader'})
          </span>
        );
      case 'dialog_officer':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30">
            <Award className="w-3.5 h-3.5 text-red-400" />
            Dialog Officer
          </span>
        );
      default:
        return null;
    }
  };

  const handleDemoSwitch = (userId: string) => {
    loginAsUser(userId);
    setDemoMenuOpen(false);
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-md flex items-center justify-center">
            <DdWorldLogo size="sm" showText={false} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white tracking-wide text-base">
                DD WORLD <span className="text-emerald-400">MARKETING</span>
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                Secure Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Strict RBAC • Attendance &amp; Sales Management
            </p>
          </div>
        </div>

        {/* Current User details & Role-Locked Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* In-App PWA Install Prompt Button */}
          <PWAInstallButton />

          {/* 4G/5G Cellular & Cloud Auto-Sync Badge */}
          <AutoCloudSyncBadge />

          {/* Realtime Call, Chat & Meeting Notification Activator */}
          {notifGranted ? (
            <button
              onClick={handleEnableNotifications}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/25 transition"
              title="Notifications & Sound Active - Click to Test Sound"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notifications: සක්‍රීයයි</span>
            </button>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition animate-pulse shadow-md shadow-amber-500/20"
              title="Click to Enable Realtime Call, Chat & Meeting Alerts in Browser"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Calls &amp; Alerts සක්‍රීය කරන්න</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-3">
            {getRoleBadge()}
          </div>

          {/* Role-Locked Display (Only Owner sees Demo Switcher for evaluation) */}
          <div className="relative">
            {currentUser.role === 'owner' ? (
              <>
                <button
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition"
                  title="Owner Testing: Switch demo role"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="max-w-[120px] sm:max-w-[160px] truncate">
                    {currentUser.name} (Owner)
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {demoMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 py-2">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider border-b border-slate-700">
                      Owner Testing: Switch Demo Account
                    </div>
                    <div className="max-h-80 overflow-y-auto py-1">
                      {users.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleDemoSwitch(u.id)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/60 transition ${
                            u.id === currentUser.id ? 'bg-blue-600/20 text-blue-300 font-semibold' : 'text-slate-300'
                          }`}
                        >
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-[10px] text-slate-400">
                              {u.role.toUpperCase()} {u.agentCode ? `• ${u.agentCode}` : ''} • {u.teamName || 'No team'}
                            </div>
                          </div>
                          {u.id === currentUser.id && (
                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-emerald-500/40 text-xs font-semibold text-slate-200"
                title="100% Role-Locked Security Active"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="max-w-[130px] sm:max-w-[180px] truncate">
                  {currentUser.name}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] text-emerald-300 font-black border border-emerald-500/30">
                  🔒 LOCKED ROLE
                </span>
              </div>
            )}
          </div>

          {/* Mandatory Employee KYC / Verification Button */}
          <button
            onClick={() => setKycModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border shadow-md ${
              myVerif
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-400 animate-pulse hover:opacity-90'
            }`}
            title="අනිවාර්ය සේවක තොරතුරු හා වාර්තා (Mandatory Employee KYC & Documents)"
          >
            {myVerif ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <span className="hidden lg:inline">මගේ සේවක තොරතුරු හා වාර්තා (KYC)</span>
            <span className="lg:hidden">KYC</span>
          </button>

          {/* Official Corporate ID Card Button */}
          <button
            onClick={() => setIdCardOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition shadow-sm"
            title="DD WORLD ආයතනික නිල හැඳුනුම්පත (Official Corporate Staff Card)"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">ආයතනික ID Card</span>
            <span className="md:hidden">ID Card</span>
          </button>

          {/* Owner-Only Quick Tools */}
          {currentUser.role === 'owner' && (
            <>
              {/* GPS Live Tracking Map Button */}
              <button
                onClick={() => setGpsMapOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-amber-500/20 border border-amber-400"
                title="ශ්‍රී ලංකා GPS Live Tracking සිතියම"
              >
                <MapPin className="w-4 h-4 text-slate-950 animate-bounce" />
                <span className="hidden sm:inline">GPS සිතියම</span>
                <span className="sm:hidden">GPS</span>
              </button>

              {/* Direct Portal Share Link Button */}
              <button
                onClick={handleCopyLink}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition"
                title="Copy Portal Link"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Link Copied!' : 'Copy App Link'}</span>
              </button>

              {/* Visual UI Guide Button */}
              <button
                onClick={() => setVisualGuideOpen(true)}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition"
                title="සේවා පෙන්වන ස්ථාන මාර්ගෝපදේශය (Visual UI Guide)"
              >
                <span>📍 ස්ථාන මාර්ගෝපදේශය</span>
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullScreen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            title="Full Screen කිරීමට හෝ සාමාන්‍ය තිරයට හැරවීමට"
          >
            {isFullscreen ? (
              <Minimize className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Maximize className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>

          {/* Job Rules & Compliance Button */}
          <button
            onClick={() => setJobRulesOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-bold transition"
            title="නිල රාජකාරි රීති සහ විනය සංග්‍රහය (Official Job Rules & Compliance)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#E1141E]" />
            <span className="hidden sm:inline">රාජකාරි රීති</span>
          </button>

          {/* App Guide / Install Button */}
          <button
            onClick={() => setAppGuideOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
            title="App එකක් ලෙස භාවිත කරන ආකාරය"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Phone App Mode</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition"
            title="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mandatory Employee Verification Modal */}
      <EmployeeVerificationModal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
      />

      {/* Official Corporate Staff ID Card Modal */}
      <OfficialCorporateIdCardModal
        isOpen={idCardOpen}
        onClose={() => setIdCardOpen(false)}
      />

      {/* Official Job Rules & Anti-Fraud Compliance Modal */}
      <OfficialJobRulesModal
        isOpen={jobRulesOpen}
        onClose={() => setJobRulesOpen(false)}
      />

      {/* Sri Lanka GPS Live Tracking Map Modal */}
      <SriLankaGpsMapModal
        isOpen={gpsMapOpen}
        onClose={() => setGpsMapOpen(false)}
        users={users}
        currentUser={currentUser}
      />

      {/* Visual UI Guide Modal */}
      <VisualGuideModal
        isOpen={visualGuideOpen}
        onClose={() => setVisualGuideOpen(false)}
      />

      {/* ====================================================
          MODAL: Direct App Link & Mobile App Installation Guide
         ==================================================== */}
      {appGuideOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  📱 Fullscreen Web App &amp; Mobile Mode Guide
                </h3>
              </div>
              <button
                onClick={() => setAppGuideOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <p className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                  ✨ 1. AI Studio Chat Box එක නැතිව Direct Full App එකට යාම:
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  AI Studio Builder Link (ai.studio/apps/...) එක මගින් Log වන විට පසෙකින් Chat Box එක පෙනේ. එය මගහැර <strong>100% Full App</strong> එකට යාමට පහත Direct Link එක භාවිත කරන්න:
                </p>
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-[11px] text-sky-400 select-all overflow-x-auto">
                  <span>{directAppUrl}</span>
                  <a
                    href={directAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto shrink-0 px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-sans text-[10px] font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open App
                  </a>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                <p className="font-bold text-amber-300 text-xs">
                  📲 2. Android / iPhone App එකක් ලෙස Phone එකට දාගන්නා ආකාරය:
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                  <li><strong>Android (Chrome)</strong>: Browser හි උඩ <strong>⋮ (Menu)</strong> ඔබා <strong>"Add to Home screen"</strong> හෝ <strong>"Install app"</strong> ලබාදෙන්න.</li>
                  <li><strong>iPhone (Safari)</strong>: Browser හි යට <strong>Share icon (📤)</strong> ඔබා <strong>"Add to Home Screen"</strong> ලබාදෙන්න.</li>
                  <li><strong>Computer (Chrome)</strong>: Search bar එකේ දකුණු පස ඇති <strong>Install icon (📥)</strong> ඔබන්න.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-[11px]">
                💡 <strong>කණ්ඩායමේ සේවකයින්ට (TLs &amp; Agents)</strong> මෙම Direct App Link එක යැවීමෙන් ඔවුන්ගේ Phone එකේ standalone App එකක් ලෙස ක්‍රියාත්මක කරගත හැක.
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={toggleFullScreen}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Maximize className="w-3.5 h-3.5" />
                <span>තිරය Fullscreen කරන්න</span>
              </button>
              <button
                onClick={() => setAppGuideOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                වසා දමන්න (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
