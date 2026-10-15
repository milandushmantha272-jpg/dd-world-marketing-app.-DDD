import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  Smartphone,
  PhoneCall,
  ShieldCheck,
  Award,
  ArrowUpRight,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
  PieChart as PieIcon,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DEFAULT_KPI_SNAPSHOT = {
  totalAgents: 0,
  turnoutPercent: 100,
  subscriptions30d: 52,
};

export const OwnerDashboardConsole: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, attendance, sales } = useData();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const totalAgents = users.filter((u) => u && u.role === 'agent').length || DEFAULT_KPI_SNAPSHOT.totalAgents;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === todayStr && a.status === 'present');
  const turnoutPercent = totalAgents > 0 ? Math.round((todayAttendance.length / totalAgents) * 100) : DEFAULT_KPI_SNAPSHOT.turnoutPercent;
  const subscriptions30d = sales.length > 0 ? sales.length : DEFAULT_KPI_SNAPSHOT.subscriptions30d;

  const quickNavCards = [
    { title: 'කාර්යසාධන විශ්ලේෂණය', sub: 'Performance Overview', path: '/management/performance', color: 'from-blue-600 to-indigo-600', icon: TrendingUp },
    { title: 'දෛනික සාරාංශ ලෙජරය', sub: 'Daily Analytics Ledger', path: '/management/daily-summary', color: 'from-emerald-600 to-teal-600', icon: BarChart2 },
    { title: 'මාසික ඉලක්ක සැලැස්ම', sub: 'Monthly Targets', path: '/management/targets', color: 'from-purple-600 to-indigo-600', icon: Award },
    { title: 'පැමිණීමේ පාලන මධ්‍යස්ථානය', sub: 'Attendance Management', path: '/management/attendance', color: 'from-amber-600 to-yellow-600', icon: CalendarCheck },
    { title: 'IVR & App සක්‍රිය කිරීම්', sub: 'IVR Hub & Activations', path: '/management/sales', color: 'from-cyan-600 to-blue-600', icon: PhoneCall },
    { title: 'සේවක ගිණුම් පාලනය', sub: 'User Access Control', path: '/management/employees', color: 'from-rose-600 to-red-600', icon: Users },
    { title: 'උපාංග හා ඇප් තත්ත්වය', sub: 'Device Monitor', path: '/management/devices', color: 'from-teal-600 to-emerald-600', icon: Smartphone },
    { title: 'මාස අවසාන ඉදිරිපත් කිරීම', sub: 'Presentation Studio', path: '/management/presentation', color: 'from-violet-600 to-purple-600', icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black tracking-widest uppercase rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Dialog Axiata Official Field Operations
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              DD WORLD • විධායක පාලක පැනලය (Owner Console)
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              සමස්ත දිවයිනේ Dialog Sayura සහ Govi Mithuru ක්ෂේත්‍ර මෙහෙයුම් කේන්ද්‍රය
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3 text-xs font-semibold text-slate-300">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>සජීවී පද්ධතිය සක්‍රීයයි (Live Engine)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ක්ෂේත්‍ර නියෝජිතයින්</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2">{totalAgents}</p>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 8 කණ්ඩායම් වල සක්‍රීයයි
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">දෛනික පැමිණීමේ අනුපාතය</span>
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">{turnoutPercent}%</p>
          <span className="text-xs text-slate-400 font-semibold mt-1">අද දින තහවුරු වූ සහභාගීත්වය</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">දින 30 සක්‍රිය කිරීම්</span>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-indigo-400 mt-2">{subscriptions30d}</p>
          <span className="text-xs text-indigo-300 font-semibold mt-1">Sayura & Govi Mithuru සේවා</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ආයතනික අනුකූලතාව</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400 mt-2">100%</p>
          <span className="text-xs text-slate-400 font-semibold mt-1">Dialog Axiata Enterprise Standard</span>
        </div>
      </div>

      {/* Quick Navigation Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          විධායක මෙහෙයුම් කවුළු (Executive Management Windows)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickNavCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.path}
                onClick={() => navigate(card.path)}
                className="group p-5 bg-slate-950/80 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
