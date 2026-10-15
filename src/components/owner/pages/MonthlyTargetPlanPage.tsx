import React, { useState } from 'react';
import { Target, TrendingUp, Send, CheckCircle2, Award, Users, Calendar, Edit3, Save, Layers, X, ShieldCheck } from 'lucide-react';
import { useData } from '../../../context/DataContext';

export const MonthlyTargetPlanPage: React.FC = () => {
  const { teams, sales, monthlyTargets, teamTargets, updateMonthlyTargets, updateTeamTargets } = useData();

  const [targetPeriod, setTargetPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [goviIvrTarget, setGoviIvrTarget] = useState<number>(monthlyTargets?.govimithuruIvr || 1000);
  const [goviAppTarget, setGoviAppTarget] = useState<number>(monthlyTargets?.govimithuruApp || 500);
  const [sayuruIvrTarget, setSayuruIvrTarget] = useState<number>(monthlyTargets?.sayuruIvr || 500);
  const [sayuruAppTarget, setSayuruAppTarget] = useState<number>(monthlyTargets?.sayuruApp || 300);

  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<boolean>(false);

  // Modal for editing specific Team Target
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [teamGoviIvr, setTeamGoviIvr] = useState<number>(200);
  const [teamGoviApp, setTeamGoviApp] = useState<number>(100);
  const [teamSayuruIvr, setTeamSayuruIvr] = useState<number>(100);
  const [teamSayuruApp, setTeamSayuruApp] = useState<number>(50);

  // Multipliers for Yearly
  const periodMultiplier = targetPeriod === 'yearly' ? 12 : 1;

  const totalTargetUnits = (goviIvrTarget + goviAppTarget + sayuruIvrTarget + sayuruAppTarget) * periodMultiplier;

  // Actual sales count
  const todayDate = new Date();
  const currentMonthPrefix = todayDate.toISOString().substring(0, 7); // e.g. "2026-08"
  const currentYearPrefix = todayDate.getFullYear().toString(); // e.g. "2026"

  const filteredSales = sales.filter((s) => {
    if (!s.date) return false;
    if (targetPeriod === 'monthly') {
      return s.date.startsWith(currentMonthPrefix);
    } else {
      return s.date.startsWith(currentYearPrefix);
    }
  });

  const totalAchievedUnits = filteredSales.reduce((sum, s) => sum + (s.quantity || 1), 0);
  const totalAchievedPct = Math.min(100, Math.round((totalAchievedUnits / (totalTargetUnits || 1)) * 100));

  const handleSaveTargets = () => {
    updateMonthlyTargets({
      govimithuruIvr: goviIvrTarget,
      govimithuruApp: goviAppTarget,
      sayuruIvr: sayuruIvrTarget,
      sayuruApp: sayuruAppTarget,
    });
    setEditingTarget(false);
    setBroadcastMessage('නව මාසික Sales Target සටහන් පද්ධතියට සහ සියලුම Team Leaders වෙත සාර්ථකව සුරකිණි!');
    setTimeout(() => setBroadcastMessage(null), 5000);
  };

  const handleOpenEditTeamTarget = (tId: string) => {
    setEditingTeamId(tId);
    const existing = teamTargets.find((tt) => tt.teamId === tId);
    if (existing) {
      setTeamGoviIvr(existing.govimithuruIvr);
      setTeamGoviApp(existing.govimithuruApp);
      setTeamSayuruIvr(existing.sayuruIvr);
      setTeamSayuruApp(existing.sayuruApp);
    } else {
      setTeamGoviIvr(200);
      setTeamGoviApp(100);
      setTeamSayuruIvr(100);
      setTeamSayuruApp(50);
    }
  };

  const handleSaveTeamTargetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamId) return;

    updateTeamTargets(editingTeamId, {
      govimithuruIvr: teamGoviIvr,
      govimithuruApp: teamGoviApp,
      sayuruIvr: teamSayuruIvr,
      sayuruApp: teamSayuruApp,
    });

    const targetTeam = teams.find((t) => t.id === editingTeamId);
    setBroadcastMessage(`"${targetTeam?.name || 'කණ්ඩායමේ'}" Target සාර්ථකව වෙනස් කර සුරකිණි!`);
    setEditingTeamId(null);
    setTimeout(() => setBroadcastMessage(null), 5000);
  };

  const handleDistributePlan = () => {
    setBroadcastMessage(
      `සම්පූර්ණ ${targetPeriod === 'monthly' ? 'මාසික' : 'වාර්ෂික'} Target Plan එක සියලුම Team Leaders සහ Field Agents ලා වෙත Broadcast කරන ලදී!`
    );
    setTimeout(() => setBroadcastMessage(null), 6000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              Internal Company Control Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Period: {targetPeriod === 'monthly' ? `Monthly (${currentMonthPrefix})` : `Yearly (${currentYearPrefix})`}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            ආයතනයේ මාසික / වාර්ෂික Target පාලන මධ්‍යස්ථානය
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            DD World ආයතනය තුල පමණක් සේවකයින්ගේ Sales Target (ගොවිමිතුරු IVR/App, සයුරු IVR/App) ස්ථිරව ආරක්ෂා කරමින් පාලනය කිරීම.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {/* Toggle Period */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setTargetPeriod('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                targetPeriod === 'monthly'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              මාසික (Monthly)
            </button>
            <button
              onClick={() => setTargetPeriod('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                targetPeriod === 'yearly'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              වාර්ෂික (Yearly)
            </button>
          </div>

          <button
            onClick={() => {
              if (editingTarget) {
                handleSaveTargets();
              } else {
                setEditingTarget(true);
              }
            }}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center gap-2"
          >
            {editingTarget ? <Save className="w-4 h-4 text-emerald-400" /> : <Edit3 className="w-4 h-4 text-amber-400" />}
            {editingTarget ? 'Target එක සුරකින්න (Save)' : 'ආයතනික Target වෙනස් කරන්න'}
          </button>

          <button
            onClick={handleDistributePlan}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/30 transition flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Target Broadcast කරන්න
          </button>
        </div>
      </div>

      {broadcastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-extrabold flex items-center gap-2 animate-bounce shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{broadcastMessage}</span>
        </div>
      )}

      {/* Main Target Progress Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block">
              {targetPeriod === 'monthly' ? 'මාසික' : 'වාර්ෂික'} සමස්ත ආයතනික Sales Target එක
            </span>
            <div className="text-3xl font-black text-white font-mono mt-1">
              {totalAchievedUnits} / {totalTargetUnits} <span className="text-sm text-slate-400 font-normal">Units</span>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-sm">
              {totalAchievedPct}% Completed
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-700 shadow-lg shadow-emerald-500/30"
            style={{ width: `${totalAchievedPct}%` }}
          ></div>
        </div>
      </div>

      {/* Target Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Govimithuru IVR */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-xl space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase">ගොවිමිතුරු (#616#) IVR</span>
          {editingTarget ? (
            <input
              type="number"
              value={goviIvrTarget}
              onChange={(e) => setGoviIvrTarget(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-emerald-300 font-mono font-black text-xl rounded-xl p-2 outline-none"
            />
          ) : (
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {goviIvrTarget * periodMultiplier} <span className="text-xs text-slate-400 font-normal">Units</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">IVR සේවා සක්‍රීය කිරීම් ඉලක්කය</p>
        </div>

        {/* Govimithuru App */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-blue-500/30 shadow-xl space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase">ගොවිමිතුරු App</span>
          {editingTarget ? (
            <input
              type="number"
              value={goviAppTarget}
              onChange={(e) => setGoviAppTarget(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-blue-300 font-mono font-black text-xl rounded-xl p-2 outline-none"
            />
          ) : (
            <div className="text-2xl font-black text-blue-300 font-mono">
              {goviAppTarget * periodMultiplier} <span className="text-xs text-slate-400 font-normal">Units</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">App භාවිතය ප්‍රවර්ධන ඉලක්කය</p>
        </div>

        {/* Sayuru IVR */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase">සයුරු (#828#) IVR</span>
          {editingTarget ? (
            <input
              type="number"
              value={sayuruIvrTarget}
              onChange={(e) => setSayuruIvrTarget(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-indigo-300 font-mono font-black text-xl rounded-xl p-2 outline-none"
            />
          ) : (
            <div className="text-2xl font-black text-indigo-300 font-mono">
              {sayuruIvrTarget * periodMultiplier} <span className="text-xs text-slate-400 font-normal">Units</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">ධීවර සන්නිවේදන IVR ඉලක්කය</p>
        </div>

        {/* Sayuru App */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-xl space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase">සයුරු App</span>
          {editingTarget ? (
            <input
              type="number"
              value={sayuruAppTarget}
              onChange={(e) => setSayuruAppTarget(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-purple-300 font-mono font-black text-xl rounded-xl p-2 outline-none"
            />
          ) : (
            <div className="text-2xl font-black text-purple-300 font-mono">
              {sayuruAppTarget * periodMultiplier} <span className="text-xs text-slate-400 font-normal">Units</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">ධීවර App ප්‍රවර්ධන ඉලක්කය</p>
        </div>
      </div>

      {/* Target Distribution Grid per Team */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              කණ්ඩායම් (Teams) අනුව {targetPeriod === 'monthly' ? 'මාසික' : 'වාර්ෂික'} Target ඇතුලත් කිරීම හා පාලනය
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ඔබට සෑම කණ්ඩායමකටම (Team) වෙන වෙනම ගොවිමිතුරු IVR/App හා සයුරු IVR/App Target ඇතුලත් කර සුරැකීමට හැක.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((t) => {
            const teamCustom = teamTargets.find((tt) => tt.teamId === t.id);
            const teamShareUnits = teamCustom
              ? (teamCustom.govimithuruIvr + teamCustom.govimithuruApp + teamCustom.sayuruIvr + teamCustom.sayuruApp) * periodMultiplier
              : Math.round(totalTargetUnits / (teams.length || 1));

            const teamActualSalesUnits = filteredSales
              .filter((s) => s.teamId === t.id)
              .reduce((sum, s) => sum + (s.quantity || 1), 0);

            const teamPct = Math.min(100, Math.round((teamActualSalesUnits / (teamShareUnits || 1)) * 100));

            return (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white truncate max-w-[170px]" title={t.name}>
                    {t.name}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {teamPct}% Done
                  </span>
                </div>

                <div className="space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>🌾 ගොවිමිතුරු IVR:</span>
                    <span className="font-mono font-bold text-emerald-400">{teamCustom?.govimithuruIvr ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>📱 ගොවිමිතුරු App:</span>
                    <span className="font-mono font-bold text-blue-400">{teamCustom?.govimithuruApp ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>🌊 සයුරු IVR:</span>
                    <span className="font-mono font-bold text-indigo-400">{teamCustom?.sayuruIvr ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>🚢 සයුරු App:</span>
                    <span className="font-mono font-bold text-purple-400">{teamCustom?.sayuruApp ?? '—'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">එකතුව Target</span>
                    <span className="text-base font-black text-amber-300 font-mono">
                      {teamShareUnits} Units
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">ලබාගත් Sales</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {teamActualSalesUnits} Units
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${teamPct}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => handleOpenEditTeamTarget(t.id)}
                  className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  Team Target ඇතුලත් කරන්න
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* EDIT INDIVIDUAL TEAM TARGET MODAL */}
      {editingTeamId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-400" />
                  Team Target ඇතුලත් කරන්න
                </h3>
                <p className="text-xs text-slate-400">
                  {teams.find((t) => t.id === editingTeamId)?.name}
                </p>
              </div>
              <button
                onClick={() => setEditingTeamId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamTargetSubmit} className="space-y-4 text-xs">
              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  🌾 ගොවිමිතුරු Targets (#616#)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">IVR Target:</label>
                    <input
                      type="number"
                      min="0"
                      value={teamGoviIvr}
                      onChange={(e) => setTeamGoviIvr(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">App Target:</label>
                    <input
                      type="number"
                      min="0"
                      value={teamGoviApp}
                      onChange={(e) => setTeamGoviApp(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-blue-300 font-mono font-bold text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  🌊 සයුරු Targets (#828#)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 block mb-1">IVR Target:</label>
                    <input
                      type="number"
                      min="0"
                      value={teamSayuruIvr}
                      onChange={(e) => setTeamSayuruIvr(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-indigo-300 font-mono font-bold text-sm outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 block mb-1">App Target:</label>
                    <input
                      type="number"
                      min="0"
                      value={teamSayuruApp}
                      onChange={(e) => setTeamSayuruApp(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-purple-300 font-mono font-bold text-sm outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] flex items-center justify-between font-bold">
                <span>එකතුව (Total Team Target):</span>
                <span className="font-mono text-sm text-amber-400">
                  {teamGoviIvr + teamGoviApp + teamSayuruIvr + teamSayuruApp} Units
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeamId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Target එක සුරකින්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
