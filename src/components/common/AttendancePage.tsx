import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CalendarCheck, Clock, MapPin, CheckCircle2, AlertCircle, Filter, Download, UserCheck, ShieldCheck } from 'lucide-react';
import { detectFakeGps } from '../../utils/antiCheatDetector';

export const AttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, attendance, addAttendanceRecord } = useData();

  const [attStatus, setAttStatus] = useState<'present' | 'half_day'>('present');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!currentUser) return null;

  const isOwner = currentUser.role === 'owner';
  const isLeader = currentUser.role === 'team_leader' || currentUser.role === 'junior_team_leader';

  // Core team scope filtering
  const myTeamAgents = users.filter(
    (u) => u && u.role === 'agent' && (u.teamId === currentUser.teamId || u.teamLeaderId === currentUser.id)
  );
  const myTeamUsers = [currentUser, ...myTeamAgents];
  const myTeamUserIds = myTeamUsers.map((u) => u.id);

  const displayAttendance = isOwner
    ? attendance
    : isLeader
    ? attendance.filter((a) => myTeamUserIds.includes(a.agentId || a.userId || ''))
    : attendance.filter((a) => (a.agentId || a.userId) === currentUser.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendance.find(
    (a) => (a.agentId || a.userId) === currentUser.id && a.date === todayStr
  );

  const filteredRecords = displayAttendance.filter((a) => {
    if (!dateFilter) return true;
    return a.date === dateFilter;
  });

  const handleMarkAttendance = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let lat = 6.9271;
      let lng = 79.8612;

      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 6000,
            });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
          const fakeCheck = detectFakeGps(pos.coords);
          if (fakeCheck.isFake) {
            setErrorMsg(`ආරක්ෂිත පද්ධතිය: ව්‍යාජ GPS / Mock Location අනාවරණය විය (${fakeCheck.reason})`);
            setSubmitting(false);
            return;
          }
        } catch {
          // fallback to default Colombo location
        }
      }

      await addAttendanceRecord({
        agentId: currentUser.id,
        agentCode: currentUser.agentCode || 'N/A',
        agentName: currentUser.name,
        date: todayStr,
        status: attStatus,
        checkInTime: new Date().toLocaleTimeString(),
        notes: notes || undefined,
        gpsLocation: {
          lat,
          lng,
          address: currentUser.workLocation || 'Western Province',
        },
      });

      setSuccessMsg('පැමිණීම සාර්ථකව සටහන් විය! (Attendance recorded successfully)');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'පැමිණීම සටහන් කිරීම අසාර්ථක විය.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-wide">
                  පැමිණීමේ කළමනාකරණය • Attendance Page
                </h1>
                <p className="text-sm text-slate-400">
                  {isOwner
                    ? 'සමස්ත දිවයිනේ නියෝජිත හා නායක පැමිණීම් වාර්තා'
                    : isLeader
                    ? `${currentUser.teamName || 'කණ්ඩායමේ'} සියලුම නියෝජිත පැමිණීම් වාර්තා`
                    : 'ඔබගේ දෛනික ක්ෂේත්‍ර පැමිණීම සහ GPS ස්ථානය සටහන් කරන්න'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-semibold text-slate-300">
              {new Date().toLocaleDateString('si-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Personal Check-in Section (For Agents & Leaders) */}
      {!isOwner && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            අද දින පැමිණීම සලකුණු කිරීම (Today's Check-In)
          </h2>

          {todayRecord ? (
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-emerald-300 font-bold">අද දින පැමිණීම සටහන් කර ඇත</p>
                  <p className="text-xs text-slate-400">
                    වේලාව: {todayRecord.checkInTime || 'සටහන් කර ඇත'} • තත්ත්වය: {todayRecord.status.toUpperCase()}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold">
                COMPLETED
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAttStatus('present')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                    attStatus === 'present'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  සම්පූර්ණ දිනය (Full Day)
                </button>
                <button
                  type="button"
                  onClick={() => setAttStatus('half_day')}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border transition-all ${
                    attStatus === 'half_day'
                      ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/30'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  අර්ධ දිනය (Half Day)
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="ක්‍ෂේත්‍ර සටහන් (විකල්ප)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleMarkAttendance}
                  disabled={submitting}
                  className="w-full h-full py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  {submitting ? 'GPS තහවුරු කරමින්...' : 'GPS සමඟ සලකුණු කරන්න'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Attendance History & Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            පැමිණීමේ වාර්තා ලේඛනය (Attendance Ledger)
          </h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-indigo-400 hover:underline px-2"
            >
              සියල්ල
            </button>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            තෝරාගත් දිනය සඳහා පැමිණීම් වාර්තා හමු නොවීය.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">නියෝජිතයා (Agent)</th>
                  <th className="py-3 px-4">කේතය (Code)</th>
                  <th className="py-3 px-4">දිනය (Date)</th>
                  <th className="py-3 px-4">වේලාව (Time)</th>
                  <th className="py-3 px-4">තත්ත්වය (Status)</th>
                  <th className="py-3 px-4">ස්ථානය (Location)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {rec.agentName || rec.userName || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs">
                      {rec.agentCode || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{rec.date}</td>
                    <td className="py-3 px-4 text-slate-400">{rec.checkInTime || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          rec.status === 'present' || rec.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : rec.status === 'half_day' || rec.status === 'HALF_DAY'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {rec.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      {rec.gpsLocation?.address || 'Western Province'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
