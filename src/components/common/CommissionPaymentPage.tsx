import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Wallet, DollarSign, CheckCircle2, Clock, AlertCircle, Building2, Download, CreditCard, ShieldCheck } from 'lucide-react';

export const CommissionPaymentPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { sales } = useData();

  const [paymentSlipRequested, setPaymentSlipRequested] = useState(false);

  if (!currentUser) return null;

  const agentSales = sales.filter((s) => s.agentId === currentUser.id);

  const goviMithuruSales = agentSales.filter(
    (s) => s.productType.toLowerCase().includes('govi') || (s.productName && s.productName.toLowerCase().includes('govi'))
  ).length;

  const sayuruSales = agentSales.filter(
    (s) => s.productType.toLowerCase().includes('sayur') || (s.productName && s.productName.toLowerCase().includes('sayur'))
  ).length;

  const goviMithuruEarnings = goviMithuruSales * 100;
  const sayuruEarnings = sayuruSales * 150;
  const totalCommission = goviMithuruEarnings + sayuruEarnings;

  const paidCommission = Math.floor(totalCommission * 0.7);
  const pendingCommission = totalCommission - paidCommission;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                කොමිස් සහ ගෙවීම් වාර්තාව • Commission Payment Page
              </h1>
              <p className="text-sm text-slate-400">
                Dialog සක්‍රිය කිරීම් සඳහා අනුමත නිල කොමිස් මුදල් විස්තරය
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              ආයතනික අනුමත ගෙවීම්
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">සමස්ත ඉපැයීම (Total)</span>
            <Wallet className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white mt-2">Rs. {totalCommission.toLocaleString()}</p>
          <span className="text-xs text-slate-500">සමස්ත විකුණුම් {agentSales.length} ක් මත</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ගෙවා ඇති මුදල (Paid)</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-400 mt-2">Rs. {paidCommission.toLocaleString()}</p>
          <span className="text-xs text-slate-500">ගිණුමට බැර කර ඇත</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">ඉදිරියට ගෙවිය යුතු (Pending)</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400 mt-2">Rs. {pendingCommission.toLocaleString()}</p>
          <span className="text-xs text-slate-500">මීළඟ ගෙවීම් වටයේදී</span>
        </div>
      </div>

      {/* Product Commission Rates */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-amber-400" />
          නිල කොමිස් අනුපාත (Official Commission Rates)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-emerald-400">Dialog Govi Mithuru (ගොවිමිතුරු)</h3>
              <p className="text-xs text-slate-400 mt-1">තහවුරු වූ එක් සක්‍රිය කිරීමකට (Per Valid Subscription)</p>
              <p className="text-xs text-slate-500 mt-1">ඔබගේ විකුණුම්: {goviMithuruSales} ක්</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white">Rs. 100</span>
              <p className="text-xs text-emerald-400 font-bold mt-1">Rs. {goviMithuruEarnings.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-cyan-400">Dialog Sayura (සයුරු)</h3>
              <p className="text-xs text-slate-400 mt-1">තහවුරු වූ එක් සක්‍රිය කිරීමකට (Per Valid Subscription)</p>
              <p className="text-xs text-slate-500 mt-1">ඔබගේ විකුණුම්: {sayuruSales} ක්</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-white">Rs. 150</span>
              <p className="text-xs text-cyan-400 font-bold mt-1">Rs. {sayuruEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Verification & Slips */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">ලියාපදිංචි බැංකු ගිණුම් විස්තර</h3>
            <p className="text-xs text-slate-400">
              නම: {currentUser.name} • ජ.හැ.අංකය: {currentUser.nic || 'තහවුරු කරමින් පවතී'}
            </p>
            <p className="text-xs text-emerald-400 font-semibold mt-0.5">
              ගෙවීම් ක්‍රමය: Direct Commercial Bank / Peoples Bank Transfer
            </p>
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              setPaymentSlipRequested(true);
              setTimeout(() => setPaymentSlipRequested(false), 4000);
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            {paymentSlipRequested ? 'රිසිට්පත බාගත වෙමින්...' : 'ගෙවීම් රිසිට්පත (Download Slip)'}
          </button>
        </div>
      </div>
    </div>
  );
};
