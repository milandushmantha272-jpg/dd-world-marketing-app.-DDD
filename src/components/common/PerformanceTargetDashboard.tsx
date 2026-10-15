import React from 'react';
import { Target, TrendingUp, Award, DollarSign, CalendarCheck, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const PerformanceTargetDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { sales, dialogPerformanceRecords } = useData();

  if (!currentUser) return null;

  // Filter sales for the current month
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const dateTodayStr = new Date().toISOString().split('T')[0];

  const mySales = sales.filter((s) => {
    if (currentUser.role === 'owner') return true;
    if (currentUser.role === 'team_leader') {
      return s.teamId === currentUser.teamId || s.agentId === currentUser.id;
    }
    return s.agentId === currentUser.id;
  });

  const todaySalesCount = mySales
    .filter((s) => s.date === dateTodayStr)
    .reduce((acc, s) => acc + s.quantity, 0);

  const monthSalesCount = mySales
    .filter((s) => s.date && s.date.startsWith(currentMonthStr))
    .reduce((acc, s) => acc + s.quantity, 0);

  // Targets
  const dailyTarget = 20;
  const monthlyTarget = 400; // 20 per day * 20 working days
  const targetAchievedPct = Math.min(100, Math.round((monthSalesCount / monthlyTarget) * 100));

  // Dialog Quality and Usage from official records
  const myDialogRecord = dialogPerformanceRecords.find((r) => r.agentId === currentUser.id) || dialogPerformanceRecords[0];

  // Rs. 30 Payment Rule Calculation
  // Rate: Rs. 30 per eligible product sale
  const ratePerSale = 30;
  const managementPaymentCalc = monthSalesCount * ratePerSale;

  return (
    <div className="space-y-6">
      {/* Target Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            TARGET &amp; PERFORMANCE DASHBOARD
          </span>
          <span className="text-xs font-mono text-cyan-300 font-bold">
            ලක්ශ්‍යය: දිනකට 20 යි • මාසිකව 400 යි
          </span>
        </div>
        <h2 className="text-xl font-black text-white">
          {currentUser.role === 'owner'
            ? 'විකුණුම් ඉලක්ක සහ කළමනාකාරීත්ව ගෙවීම් ගණනය කිරීම් (Target & Rs. 30 Rule Dashboard)'
            : 'විකුණුම් ඉලක්ක සහ ප්‍රගතිය (Target & Performance Dashboard)'}
        </h2>
        <p className="text-xs text-slate-300">
          {currentUser.role === 'owner'
            ? 'දෛනික ඉලක්කය සාර්ථක කරගැනීම, Dialog Quality මට්ටම සහ සමාගමේ කළමනාකාරීත්ව ගෙවීම් නීතිය (Rs. 30 Payment Rule) සජීවීව පරීක්ෂා කළ හැක.'
            : 'දෛනික ඉලක්කය (Daily Target: 20) සහ මාසික විකුණුම් ඉලක්කය (Monthly Target: 400) සජීවී ප්‍රගතිය මෙහිදී පරීක්ෂා කළ හැක.'}
        </p>
      </div>

      {/* Target Overview Cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${currentUser.role === 'owner' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        {/* Today's Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">අද දින Sales (Today)</span>
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{todaySalesCount} / {dailyTarget}</div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-500"
              style={{ width: `${Math.min(100, (todaySalesCount / dailyTarget) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">දෛනික ඉලක්කය: 20 sales</p>
        </div>

        {/* Monthly Sales */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">මාසික Sales (Monthly)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-300">{monthSalesCount} / {monthlyTarget}</div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full transition-all duration-500"
              style={{ width: `${targetAchievedPct}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">ප්‍රගතිය: {targetAchievedPct}% (Target: 400)</p>
        </div>

        {/* Dialog Quality */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">Dialog Quality</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{myDialogRecord?.qualityResult || '95% Grade A'}</div>
          <p className="text-[10px] text-slate-400">Customer Usage: {myDialogRecord?.customerUsage || '88% Active'}</p>
        </div>

        {/* Rs. 30 Rule Management Calculation - Restricted strictly to Owner profile */}
        {currentUser.role === 'owner' && (
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-300 font-black">Rs. 30 Payment Rule</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            {monthSalesCount >= monthlyTarget ? (
              <div className="text-lg font-black text-emerald-400">400 Sales Target Achieved 🎉</div>
            ) : (
              <div>
                <div className="text-2xl font-black text-amber-300">Rs. {managementPaymentCalc.toLocaleString()}</div>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {monthSalesCount} Sales × Rs. {ratePerSale}
                </p>
              </div>
            )}
            <span className="inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Management Payment Calculation
            </span>
          </div>
        )}
      </div>

      {/* Detail Rules Explainer - Restricted strictly to Owner profile */}
      {currentUser.role === 'owner' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> කළමනාකාරීත්ව ගෙවීම් සහ ඉලක්ක නීති (Rules &amp; Guidelines)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300">1. මාසික 400 Sales Target නීතිය</h4>
              <p className="leading-relaxed">
                නියෝජිතයෙකු දිනකට සාමාන්‍යයෙන් Sales 20 බැගින් මාසිකව වැඩකරන දින 20 තුළ Sales 400 සපිරීමෙන් නිල 400 Target එක සාක්ෂාත් කරගනු ලබයි.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-emerald-300">2. රු. 30 කළමනාකාරීත්ව ගෙවීමේ නීතිය (Rs. 30 Rule)</h4>
              <p className="leading-relaxed">
                මාසික Sales 400 target එක සපිරීමට නොහැකි වන අවස්ථාවලදී, අදාළ නියෝජිතයා සිදුකර ඇති සුදුසුකම් ලත් සාර්ථක Sales සංඛ්‍යාව සඳහා රු. 30 බැගින් ගණනය කෙරේ (Eligible Product Sales × Rs. 30 = Management Payment Calculation).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
