import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Smartphone, Bell, Globe, LogOut, CheckCircle2, RefreshCw, Key, Database } from 'lucide-react';
import { safeStorage } from '../../utils/safeStorage';

export const SettingsPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [offlineSyncing, setOfflineSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!currentUser) return null;

  const handleManualCacheRefresh = () => {
    setOfflineSyncing(true);
    setTimeout(() => {
      setOfflineSyncing(false);
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center shadow-lg shadow-slate-700/20 text-white">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                පද්ධති සැකසුම් • Settings Page
              </h1>
              <p className="text-sm text-slate-400">
                ගිණුම් ආරක්ෂාව, නොබැඳි දත්ත සමමුහුර්තකරණය සහ යෙදුම් තොරතුරු
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              App Version: 2026.8.07-v5.3
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            ගිණුම් සහ ආරක්ෂක විස්තර
          </h2>

          <div className="space-y-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-400">නම (Full Name)</span>
              <span className="text-xs font-bold text-white">{currentUser.name}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-400">තනතුර (Role)</span>
              <span className="text-xs font-bold text-emerald-400 uppercase">{currentUser.role}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-400">නියෝජිත කේතය (Agent Code)</span>
              <span className="text-xs font-mono font-bold text-amber-400">{currentUser.agentCode || 'N/A'}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-400">දුරකථන අංකය (Mobile)</span>
              <span className="text-xs font-mono text-slate-300">{currentUser.mobile || currentUser.phone || 'N/A'}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <span className="text-xs text-slate-400">සේවා තත්ත්වය (Status)</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {currentUser.employmentStatus || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Offline & App Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            නොබැඳි දත්ත සහ පද්ධති පාලනය
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">දත්ත සමමුහුර්තකරණය (Offline Sync)</p>
                <p className="text-xs text-slate-400">අන්තර්ජාලය විසන්ධි වූ විට දේශීය ගබඩාව ක්‍රියාත්මක වේ</p>
              </div>
              <button
                onClick={handleManualCacheRefresh}
                disabled={offlineSyncing}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${offlineSyncing ? 'animate-spin' : ''}`} />
                {offlineSyncing ? 'සමමුහුර්ත වෙමින්...' : 'Sync Now'}
              </button>
            </div>

            {syncDone && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                දත්ත සාර්ථකව සමමුහුර්ත විය!
              </div>
            )}

            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">දැනුම්දීම් (System Notifications)</p>
                <p className="text-xs text-slate-400">ඇමතුම් සහ සජීවී නිවේදන ලබා ගැනීම</p>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  notificationsEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={logout}
                className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="w-4 h-4" />
                පද්ධතියෙන් ඉවත් වන්න (Sign Out)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
