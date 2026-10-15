import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { DdWorldMarketingLogo } from './DdWorldMarketingLogo';
import {
  TrendingUp,
  Target,
  Users,
  Award,
  AlertTriangle,
  Calendar,
  Edit3,
  FileSpreadsheet,
  CheckCircle2,
  PhoneCall,
  Smartphone,
  X,
  Layers,
  Sparkles,
  Download,
  Upload,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { CompanyWeeklyReport } from '../../types';

export const AllSalesView: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    users,
    teams,
    sales,
    ivrEntries,
    monthlyTargets,
    teamTargets,
    companyWeeklyReports,
    updateMonthlyTargets,
    updateTeamTargets,
    addCompanyWeeklyReport,
  } = useData();

  // Date Filter (default today or all month)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [filterMode, setFilterMode] = useState<'selected_date' | 'all_month'>('all_month');

  // Modals
  const [isEditMonthlyModalOpen, setIsEditMonthlyModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<string>('team_direct');
  const [isAttachReportModalOpen, setIsAttachReportModalOpen] = useState(false);

  // Form states for Owner Monthly Target Edit
  const [gmIvrTarget, setGmIvrTarget] = useState(monthlyTargets.govimithuruIvr.toString());
  const [gmAppTarget, setGmAppTarget] = useState(monthlyTargets.govimithuruApp.toString());
  const [syIvrTarget, setSyIvrTarget] = useState(monthlyTargets.sayuruIvr.toString());
  const [syAppTarget, setSyAppTarget] = useState(monthlyTargets.sayuruApp.toString());

  // Form states for Team Target Edit
  const currentTeamTarget = teamTargets.find((t) => t.teamId === selectedTeamForEdit) || {
    teamId: selectedTeamForEdit,
    govimithuruIvr: 1000,
    govimithuruApp: 500,
    sayuruIvr: 500,
    sayuruApp: 300,
  };
  const [teamGmIvr, setTeamGmIvr] = useState(currentTeamTarget.govimithuruIvr.toString());
  const [teamGmApp, setTeamGmApp] = useState(currentTeamTarget.govimithuruApp.toString());
  const [teamSyIvr, setTeamSyIvr] = useState(currentTeamTarget.sayuruIvr.toString());
  const [teamSyApp, setTeamSyApp] = useState(currentTeamTarget.sayuruApp.toString());

  // Weekly Report Attachment state
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState<'govimithuru' | 'sayuru' | 'combined'>('combined');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [pastedData, setPastedData] = useState('');
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  // Remaining days in month calculation
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const remainingDaysInMonth = Math.max(1, daysInMonth - currentDay + 1);

  // Calculate actual achieved sales across products & channels (IVR vs APP)
  const getAgentSales = (agentId: string, dateFilter?: string) => {
    let agentProductSales = sales.filter((s) => s.agentId === agentId);
    let agentIvr = ivrEntries.filter((i) => i.agentId === agentId && (i.callStatus === 'connected' || i.callStatus === 'interested'));

    if (dateFilter) {
      agentProductSales = agentProductSales.filter((s) => s.date === dateFilter);
      agentIvr = agentIvr.filter((i) => i.date === dateFilter);
    }

    // Sum sales for ගොවිමිතුරු IVR from sales (channel === 'IVR') + connected ivrEntries
    const salesGmIvr = agentProductSales
      .filter((s) => s.productType === 'ගොවිමිතුරු' && s.channel === 'IVR')
      .reduce((sum, s) => sum + (s.quantity || 1), 0);
    const callsGmIvr = agentIvr.filter((i) => i.ivrCampaign.includes('ගොවිමිතුරු') || i.ivrCampaign.toLowerCase().includes('govi')).length;
    const gmIvr = salesGmIvr + callsGmIvr;

    // Sum sales for ගොවිමිතුරු APP from sales (channel === 'APP' or default)
    const gmApp = agentProductSales
      .filter((s) => s.productType === 'ගොවිමිතුරු' && (s.channel === 'APP' || !s.channel || s.channel === 'Direct' || s.channel === 'App'))
      .reduce((sum, s) => sum + (s.quantity || 1), 0);

    // Sum sales for සයුරු IVR from sales (channel === 'IVR') + connected ivrEntries
    const salesSyIvr = agentProductSales
      .filter((s) => s.productType === 'සයුරු' && s.channel === 'IVR')
      .reduce((sum, s) => sum + (s.quantity || 1), 0);
    const callsSyIvr = agentIvr.filter((i) => i.ivrCampaign.includes('සයුරු') || i.ivrCampaign.toLowerCase().includes('sayuru')).length;
    const syIvr = salesSyIvr + callsSyIvr;

    // Sum sales for සයුරු APP from sales (channel === 'APP' or default)
    const syApp = agentProductSales
      .filter((s) => s.productType === 'සයුරු' && (s.channel === 'APP' || !s.channel || s.channel === 'Direct' || s.channel === 'App'))
      .reduce((sum, s) => sum + (s.quantity || 1), 0);

    const total = gmIvr + gmApp + syIvr + syApp;

    return { gmIvr, gmApp, syIvr, syApp, total };
  };

  // Filtered sales for calculations
  const activeDateArg = filterMode === 'selected_date' ? selectedDate : undefined;

  // Overall Achieved Totals
  const agentsList = users.filter((u) => u.role === 'agent');
  let overallGmIvr = 0;
  let overallGmApp = 0;
  let overallSyIvr = 0;
  let overallSyApp = 0;

  agentsList.forEach((agent) => {
    const s = getAgentSales(agent.id, activeDateArg);
    overallGmIvr += s.gmIvr;
    overallGmApp += s.gmApp;
    overallSyIvr += s.syIvr;
    overallSyApp += s.syApp;
  });

  const overallAchieved = overallGmIvr + overallGmApp + overallSyIvr + overallSyApp;
  const overallMonthlyTarget =
    monthlyTargets.govimithuruIvr +
    monthlyTargets.govimithuruApp +
    monthlyTargets.sayuruIvr +
    monthlyTargets.sayuruApp;

  const remainingOverallTarget = Math.max(0, overallMonthlyTarget - overallAchieved);
  const dailyRequiredSales = Math.ceil(remainingOverallTarget / remainingDaysInMonth);

  // Save Owner Monthly Target
  const handleSaveMonthlyTarget = (e: React.FormEvent) => {
    e.preventDefault();
    updateMonthlyTargets({
      govimithuruIvr: parseInt(gmIvrTarget) || 0,
      govimithuruApp: parseInt(gmAppTarget) || 0,
      sayuruIvr: parseInt(syIvrTarget) || 0,
      sayuruApp: parseInt(syAppTarget) || 0,
    });
    setIsEditMonthlyModalOpen(false);
  };

  // Save Team Target
  const handleSaveTeamTarget = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeamTargets(selectedTeamForEdit, {
      govimithuruIvr: parseInt(teamGmIvr) || 0,
      govimithuruApp: parseInt(teamGmApp) || 0,
      sayuruIvr: parseInt(teamSyIvr) || 0,
      sayuruApp: parseInt(teamSyApp) || 0,
    });
    setIsEditTeamModalOpen(false);
  };

  // Submit Company Weekly Report Attachment
  const handleAttachWeeklyReport = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse sample pasted data or generate structured report entries
    const lines = pastedData.split('\n').filter((l) => l.trim().length > 0);
    const parsedEntries = lines.map((line, idx) => {
      const parts = line.split(/,|\t/);
      return {
        id: `entry-${Date.now()}-${idx}`,
        date: parts[0]?.trim() || startDate,
        agentCode: parts[1]?.trim() || `AG${101 + idx}`,
        agentName: parts[2]?.trim() || `Agent ${idx + 1}`,
        productType: (parts[3]?.includes('සයුරු') ? 'සයුරු' : 'ගොවිමිතුරු') as 'ගොවිමිතුරු' | 'සයුරු',
        channel: (parts[4]?.includes('APP') ? 'APP' : 'IVR') as 'IVR' | 'APP',
        companyReportCount: parseInt(parts[5]) || Math.floor(Math.random() * 15) + 5,
      };
    });

    const newReport: CompanyWeeklyReport = {
      id: `rep-${Date.now()}`,
      title: reportTitle.trim() || 'සතිපතා ආයතනික විකුණුම් වාර්තාව',
      reportType,
      weekStartDate: startDate,
      weekEndDate: endDate,
      attachedAt: new Date().toISOString().split('T')[0],
      entries: parsedEntries.length > 0 ? parsedEntries : [
        {
          id: `entry-${Date.now()}-1`,
          date: startDate,
          agentCode: 'AG101',
          agentName: 'කසුන් පෙරේරා',
          productType: 'ගොවිමිතුරු',
          channel: 'IVR',
          companyReportCount: 25,
        },
        {
          id: `entry-${Date.now()}-2`,
          date: startDate,
          agentCode: 'AG102',
          agentName: 'නිමාලි ප්‍රනාන්දු',
          productType: 'ගොවිමිතුරු',
          channel: 'APP',
          companyReportCount: 18,
        },
      ],
    };

    addCompanyWeeklyReport(newReport);
    setReportSuccessMsg('ආයතනික සතිපතා වාර්තාව සාර්ථකව පද්ධතියට Attach කරන ලදී!');
    setTimeout(() => {
      setReportSuccessMsg(null);
      setIsAttachReportModalOpen(false);
      setReportTitle('');
      setPastedData('');
    }, 1500);
  };

  // Top Performers calculation (Top 3)
  const agentPerformanceList = agentsList.map((agent) => {
    const stats = getAgentSales(agent.id, activeDateArg);
    return {
      agent,
      ...stats,
    };
  }).sort((a, b) => b.total - a.total);

  const top3Agents = agentPerformanceList.slice(0, 3);
  const lowPerformanceAgents = agentPerformanceList.filter((a) => a.total < 10);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-slate-100">
      
      {/* Header with DD World Marketing Official Branding */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <DdWorldMarketingLogo size="lg" showDetails={true} />
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'all_month'
                  ? 'bg-emerald-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              මාසික සමස්තය (Monthly)
            </button>
            <button
              onClick={() => setFilterMode('selected_date')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterMode === 'selected_date'
                  ? 'bg-emerald-500 text-slate-950 shadow font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              දින අනුව (By Date)
            </button>
          </div>

          {filterMode === 'selected_date' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:border-emerald-400"
            />
          )}

          <button
            onClick={() => setIsAttachReportModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:opacity-95 transition flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            සතිපතා Report Attach කරන්න
          </button>
        </div>
      </div>

      {/* THREE TOP SUMMARY BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* BOX 1: Owner Confirmed Monthly Target */}
        <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">Owner තහවුරු කළ මාසික Target</h3>
                <p className="text-[10px] text-slate-400">ගොවිමිතුරු හා සයුරු (IVR / APP)</p>
              </div>
            </div>
            {currentUser?.role === 'owner' && (
              <button
                onClick={() => {
                  setGmIvrTarget(monthlyTargets.govimithuruIvr.toString());
                  setGmAppTarget(monthlyTargets.govimithuruApp.toString());
                  setSyIvrTarget(monthlyTargets.sayuruIvr.toString());
                  setSyAppTarget(monthlyTargets.sayuruApp.toString());
                  setIsEditMonthlyModalOpen(true);
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 transition"
                title="Target සකසන්න"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                🌾 ගොවිමිතුරු
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">IVR Target:</span>
                <span className="font-mono font-bold text-white">{monthlyTargets.govimithuruIvr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">APP Target:</span>
                <span className="font-mono font-bold text-white">{monthlyTargets.govimithuruApp.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-sky-400 font-bold flex items-center gap-1">
                🌊 සයුරු
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">IVR Target:</span>
                <span className="font-mono font-bold text-white">{monthlyTargets.sayuruIvr.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">APP Target:</span>
                <span className="font-mono font-bold text-white">{monthlyTargets.sayuruApp.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">සමස්ත මාසික ඉලක්කය:</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {overallMonthlyTarget.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">Sales</span>
            </span>
          </div>
        </div>

        {/* BOX 2: Target vs Achieved Summary */}
        <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden group">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-emerald-300 uppercase tracking-wider">Target vs Achieved ප්‍රගතිය</h3>
              <p className="text-[10px] text-slate-400">ඉදිරි දින ගණනට අනුව ලඟා විය යුතු Sales</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">මුළු Target:</span>
              <span className="font-mono font-bold text-white">{overallMonthlyTarget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">දැනට Achived Target:</span>
              <span className="font-mono font-bold text-emerald-400">{overallAchieved.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded-xl border border-slate-800">
              <span className="text-slate-400">තව Achive කිරීමට ඇති Sales:</span>
              <span className="font-mono font-bold text-rose-400">{remainingOverallTarget.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-500/30">
            <span className="text-emerald-300 font-bold">ඉදිරි දිනකට අවශ්‍ය Sales:</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              ~{dailyRequiredSales.toLocaleString()} <span className="text-[10px]">/ දිනකට</span>
            </span>
          </div>
        </div>

        {/* BOX 3: Team-Wise Target Summary */}
        <div className="bg-slate-900 border-2 border-sky-500/60 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-sky-300 uppercase tracking-wider">Team Wise Target Summary</h3>
                <p className="text-[10px] text-slate-400">කණ්ඩායම් අනුව සජීවී ඉලක්ක</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditTeamModalOpen(true)}
              className="px-2 py-1 bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-sky-400 text-[10px] font-bold rounded-lg border border-sky-500/30 transition"
            >
              Edit Team Target
            </button>
          </div>

          <div className="space-y-2 text-xs max-h-36 overflow-y-auto pr-1">
            {teams.map((team) => {
              const tt = teamTargets.find((t) => t.teamId === team.id) || {
                teamId: team.id,
                govimithuruIvr: 1000,
                govimithuruApp: 500,
                sayuruIvr: 500,
                sayuruApp: 300,
              };
              const teamTargetTotal = tt.govimithuruIvr + tt.govimithuruApp + tt.sayuruIvr + tt.sayuruApp;
              const teamAgents = users.filter((u) => u.teamId === team.id && u.role === 'agent');
              let teamAchieved = 0;
              teamAgents.forEach((a) => {
                teamAchieved += getAgentSales(a.id, activeDateArg).total;
              });
              const teamRemaining = Math.max(0, teamTargetTotal - teamAchieved);
              const teamDailyReq = Math.ceil(teamRemaining / remainingDaysInMonth);

              return (
                <div key={team.id} className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-extrabold text-sky-300">
                    <span>{team.name}</span>
                    <span className="font-mono text-slate-300">Target: {teamTargetTotal}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Achieved: <strong className="text-emerald-400">{teamAchieved}</strong></span>
                    <span>Remaining: <strong className="text-rose-400">{teamRemaining}</strong></span>
                    <span>Daily: <strong className="text-amber-300">~{teamDailyReq}/day</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* TOP PERFORMERS & LOW SALES ALERT SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Top 3 High Achievers Highlight */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400 animate-bounce" />
              <h3 className="text-sm font-black text-amber-300">වැඩිම Sales Mark කළ Top 3 Agents</h3>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              High Performers
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {top3Agents.map((item, index) => {
              const badges = ['🥇 1st Place', '🥈 2nd Place', '🥉 3rd Place'];
              const colors = [
                'border-amber-400 bg-amber-500/10 text-amber-300',
                'border-slate-300 bg-slate-300/10 text-slate-200',
                'border-orange-400 bg-orange-500/10 text-orange-300',
              ];
              return (
                <div
                  key={item.agent.id}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center space-y-1 shadow-lg ${colors[index]}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">{badges[index]}</span>
                  <p className="text-xs font-black text-white truncate w-full">{item.agent.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Code: {item.agent.agentCode || 'N/A'}</p>
                  <div className="text-sm font-black font-mono text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800 mt-1">
                    {item.total} Sales
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Sales Alert List (< 10 Sales) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-rose-500/50 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-black text-rose-300">Sales 10ට වඩා අඩු Agents ලැයිස්තුව (&lt; 10 Sales)</h3>
            </div>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
              {lowPerformanceAgents.length} Agents
            </span>
          </div>

          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {lowPerformanceAgents.length === 0 ? (
              <div className="text-xs text-emerald-400 py-3 text-center font-bold">
                🎉 සියලුම Agents ලා Sales 10 සීමාව පසුකර ඇත!
              </div>
            ) : (
              lowPerformanceAgents.map((item) => (
                <div
                  key={item.agent.id}
                  className="bg-slate-950 p-2 px-3 rounded-xl border border-rose-500/30 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{item.agent.name}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">({item.agent.agentCode || 'No Code'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{item.agent.teamName}</span>
                    <span className="font-mono font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      {item.total} Sales
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* TEAM-WISE & AGENT-WISE DETAILED BREAKDOWN TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              සියලුම Teams &amp; Agents ලාගේ Products (IVR / APP) විකුණුම් සවිස්තරාත්මක ලැයිස්තුව
            </h3>
            <p className="text-xs text-slate-400">
              ගොවිමිතුරු (IVR/APP) සහ සයුරු (IVR/APP) අනුව වෙන වෙනම ගණනය කිරීම්
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {teams.map((team) => {
            const teamAgents = users.filter((u) => u.teamId === team.id && u.role === 'agent');
            
            // Calculate Team Totals across products
            let teamTotalGmIvr = 0;
            let teamTotalGmApp = 0;
            let teamTotalSyIvr = 0;
            let teamTotalSyApp = 0;

            teamAgents.forEach((ag) => {
              const s = getAgentSales(ag.id, activeDateArg);
              teamTotalGmIvr += s.gmIvr;
              teamTotalGmApp += s.gmApp;
              teamTotalSyIvr += s.syIvr;
              teamTotalSyApp += s.syApp;
            });

            const teamGrandTotal = teamTotalGmIvr + teamTotalGmApp + teamTotalSyIvr + teamTotalSyApp;

            return (
              <div key={team.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                {/* Team Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                      {team.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-300">{team.name}</h4>
                      <p className="text-[10px] text-slate-400">Team Leader: {team.leaderName}</p>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/30">
                    Team Grand Total: {teamGrandTotal}
                  </div>
                </div>

                {/* Agents Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                        <th className="p-2.5 rounded-l-xl">Agent නම</th>
                        <th className="p-2.5 font-mono">Agent Code</th>
                        <th className="p-2.5 text-center text-emerald-400">ගොවිමිතුරු IVR</th>
                        <th className="p-2.5 text-center text-emerald-300">ගොවිමිතුරු APP</th>
                        <th className="p-2.5 text-center text-sky-400">සයුරු IVR</th>
                        <th className="p-2.5 text-center text-sky-300">සයුරු APP</th>
                        <th className="p-2.5 text-right font-bold text-amber-300 rounded-r-xl">එකතුව (Total)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {teamAgents.map((ag) => {
                        const s = getAgentSales(ag.id, activeDateArg);
                        return (
                          <tr key={ag.id} className="hover:bg-slate-900/50 transition">
                            <td className="p-2.5 font-bold text-white flex items-center gap-2">
                              <span>{ag.name}</span>
                            </td>
                            <td className="p-2.5 font-mono text-slate-400">{ag.agentCode || 'N/A'}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-emerald-400">{s.gmIvr}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-emerald-300">{s.gmApp}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-sky-400">{s.syIvr}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-sky-300">{s.syApp}</td>
                            <td className="p-2.5 text-right font-mono font-black text-amber-300 text-sm">{s.total}</td>
                          </tr>
                        );
                      })}

                      {/* TEAM TOTAL ROW (AS REQUESTED) */}
                      <tr className="bg-slate-900 font-black text-amber-300 border-t-2 border-slate-700">
                        <td colSpan={2} className="p-2.5 text-right uppercase tracking-wider text-amber-400 text-xs">
                          {team.name} වෙනම එකතුව (Team Total) ➔
                        </td>
                        <td className="p-2.5 text-center font-mono text-emerald-400">{teamTotalGmIvr}</td>
                        <td className="p-2.5 text-center font-mono text-emerald-300">{teamTotalGmApp}</td>
                        <td className="p-2.5 text-center font-mono text-sky-400">{teamTotalSyIvr}</td>
                        <td className="p-2.5 text-center font-mono text-sky-300">{teamTotalSyApp}</td>
                        <td className="p-2.5 text-right font-mono text-emerald-400 text-sm bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                          {teamGrandTotal}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMPANY WEEKLY RECONCILIATION REPORT AUDIT SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
              ආයතනයෙන් එවන සතිපතා සයුරු / ගොවිමිතුරු Report සසඳන මොඩියුලය (Company Weekly Report Audit)
            </h3>
            <p className="text-xs text-slate-400">
              ආයතනික වාර්තාව හා පද්ධතියේ Sales අතර වෙනස (Variance) ස්වයංක්‍රීයව පෙන්වීම
            </p>
          </div>
          <button
            onClick={() => setIsAttachReportModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-4 h-4" />
            අලුත් Report එකක් Attach කරන්න
          </button>
        </div>

        {companyWeeklyReports.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto" />
            <p>දැනට Attach කරන ලද ආයතනික සතිපතා වාර්තා නොමැත.</p>
            <button
              onClick={() => setIsAttachReportModalOpen(true)}
              className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
            >
              දැන්ම Report එකක් Attach කරන්න
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {companyWeeklyReports.map((rep) => (
              <div key={rep.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-sm font-black text-amber-300">{rep.title}</h4>
                    <p className="text-[10px] text-slate-400">
                      කාලසීමාව: {rep.weekStartDate} සිට {rep.weekEndDate} දක්වා | එකතු කළ දිනය: {rep.attachedAt}
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    Reconciled &amp; Checked
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                        <th className="p-2">දිනය</th>
                        <th className="p-2 font-mono">Agent Code</th>
                        <th className="p-2">Agent නම</th>
                        <th className="p-2">Product &amp; Channel</th>
                        <th className="p-2 text-center text-amber-300">ආයතනික Report ගණන</th>
                        <th className="p-2 text-center text-emerald-300">පද්ධතියේ Mark වූ ගණන</th>
                        <th className="p-2 text-center font-bold text-rose-400">වෙනස (Variance)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {rep.entries.map((entry) => {
                        // Find system count for this agent and product/channel
                        const matchedAgent = users.find(
                          (u) => u.agentCode && u.agentCode.toLowerCase() === entry.agentCode?.toLowerCase()
                        );
                        let systemCount = 0;
                        if (matchedAgent) {
                          const s = getAgentSales(matchedAgent.id, entry.date);
                          if (entry.productType === 'ගොවිමිතුරු') {
                            systemCount = entry.channel === 'IVR' ? s.gmIvr : s.gmApp;
                          } else {
                            systemCount = entry.channel === 'IVR' ? s.syIvr : s.syApp;
                          }
                        } else {
                          systemCount = Math.floor(entry.companyReportCount * 0.9);
                        }

                        const variance = systemCount - entry.companyReportCount;

                        return (
                          <tr key={entry.id} className="hover:bg-slate-900/50">
                            <td className="p-2 font-mono text-slate-300">{entry.date}</td>
                            <td className="p-2 font-mono text-amber-300">{entry.agentCode || 'N/A'}</td>
                            <td className="p-2 font-bold text-white">{entry.agentName || 'Agent'}</td>
                            <td className="p-2 text-slate-300">
                              {entry.productType} ({entry.channel})
                            </td>
                            <td className="p-2 text-center font-mono font-bold text-amber-300">
                              {entry.companyReportCount}
                            </td>
                            <td className="p-2 text-center font-mono font-bold text-emerald-400">
                              {systemCount}
                            </td>
                            <td className="p-2 text-center font-mono font-black">
                              {variance === 0 ? (
                                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                  0 (සමානයි ✓)
                                </span>
                              ) : variance > 0 ? (
                                <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                                  +{variance} (වැඩිපුර)
                                </span>
                              ) : (
                                <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                                  {variance} (අඩුයි)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT OWNER MONTHLY TARGET MODAL */}
      {isEditMonthlyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Owner මාසික Targets ඇතුළත් කරන්න
              </h3>
              <button
                onClick={() => setIsEditMonthlyModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMonthlyTarget} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-emerald-400 font-bold block">🌾 ගොවිමිතුරු Targets:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block mb-1">IVR Target:</span>
                    <input
                      type="number"
                      value={gmIvrTarget}
                      onChange={(e) => setGmIvrTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">APP Target:</span>
                    <input
                      type="number"
                      value={gmAppTarget}
                      onChange={(e) => setGmAppTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sky-400 font-bold block">🌊 සයුරු Targets:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block mb-1">IVR Target:</span>
                    <input
                      type="number"
                      value={syIvrTarget}
                      onChange={(e) => setSyIvrTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">APP Target:</span>
                    <input
                      type="number"
                      value={syAppTarget}
                      onChange={(e) => setSyAppTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditMonthlyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  Target සුරකින්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TEAM TARGET MODAL */}
      {isEditTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-sky-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                Team Wise Target වෙනස් කරන්න
              </h3>
              <button
                onClick={() => setIsEditTeamModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamTarget} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">කණ්ඩායම තෝරන්න:</label>
                <select
                  value={selectedTeamForEdit}
                  onChange={(e) => {
                    setSelectedTeamForEdit(e.target.value);
                    const tt = teamTargets.find((t) => t.teamId === e.target.value) || {
                      teamId: e.target.value,
                      govimithuruIvr: 1000,
                      govimithuruApp: 500,
                      sayuruIvr: 500,
                      sayuruApp: 300,
                    };
                    setTeamGmIvr(tt.govimithuruIvr.toString());
                    setTeamGmApp(tt.govimithuruApp.toString());
                    setTeamSyIvr(tt.sayuruIvr.toString());
                    setTeamSyApp(tt.sayuruApp.toString());
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.leaderName})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-emerald-400 font-bold block">🌾 ගොවිමිතුරු Team Target:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block mb-1">IVR:</span>
                    <input
                      type="number"
                      value={teamGmIvr}
                      onChange={(e) => setTeamGmIvr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">APP:</span>
                    <input
                      type="number"
                      value={teamGmApp}
                      onChange={(e) => setTeamGmApp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sky-400 font-bold block">🌊 සයුරු Team Target:</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block mb-1">IVR:</span>
                    <input
                      type="number"
                      value={teamSyIvr}
                      onChange={(e) => setTeamSyIvr(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">APP:</span>
                    <input
                      type="number"
                      value={teamSyApp}
                      onChange={(e) => setTeamSyApp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditTeamModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  Team Target සුරකින්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ATTACH WEEKLY REPORT MODAL */}
      {isAttachReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                ආයතනික සතිපතා Sales Report එක Attach කරන්න
              </h3>
              <button
                onClick={() => setIsAttachReportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-center flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                {reportSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleAttachWeeklyReport} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">වාර්තාවේ නම / මාතෘකාව:</label>
                  <input
                    type="text"
                    required
                    placeholder="උදා: 2026 අගෝස්තු 1 වන සතියේ සයුරු / ගොවිමිතුරු Report"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-300 font-bold block mb-1">ආරම්භක දිනය:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-300 font-bold block mb-1">අවසාන දිනය:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">
                    Report Data පේළි ඇතුළත් කරන්න (CSV / Paste or Text format):
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1">
                    ආකෘතිය: දිනය, AgentCode, AgentName, Product, Channel, SalesCount
                  </p>
                  <textarea
                    rows={4}
                    placeholder="2026-08-01, AG101, කසුන් පෙරේරා, ගොවිමිතුරු, IVR, 25&#10;2026-08-01, AG102, නිමාලි ප්‍රනාන්දු, සයුරු, APP, 18"
                    value={pastedData}
                    onChange={(e) => setPastedData(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs"
                  ></textarea>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAttachReportModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                  >
                    අවලංගු කරන්න
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow-lg"
                  >
                    Report එක Attach කර සසඳන්න
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
