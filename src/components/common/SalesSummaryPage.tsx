import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { TrendingUp, Smartphone, PhoneCall, Filter, Search, Download, CheckCircle2, ShieldCheck, Calendar } from 'lucide-react';

export const SalesSummaryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, sales } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState<'ALL' | 'govimithuru' | 'sayuru'>('ALL');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'IVR' | 'APP'>('ALL');

  if (!currentUser) return null;

  const isOwner = currentUser.role === 'owner';
  const isLeader = currentUser.role === 'team_leader' || currentUser.role === 'junior_team_leader';

  // Core team scope filtering
  const myTeamAgents = users.filter(
    (u) => u && u.role === 'agent' && (u.teamId === currentUser.teamId || u.teamLeaderId === currentUser.id)
  );
  const myTeamUsers = [currentUser, ...myTeamAgents];
  const myTeamUserIds = myTeamUsers.map((u) => u.id);

  const displaySales = isOwner
    ? sales
    : isLeader
    ? sales.filter((s) => myTeamUserIds.includes(s.agentId))
    : sales.filter((s) => s.agentId === currentUser.id);

  const filteredSales = displaySales.filter((s) => {
    const matchesSearch =
      (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.msisdn && s.msisdn.includes(searchQuery)) ||
      (s.agentName && s.agentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.agentCode && s.agentCode.includes(searchQuery));

    const matchesProduct =
      productFilter === 'ALL' ||
      s.productType.toLowerCase().includes(productFilter) ||
      (s.productName && s.productName.toLowerCase().includes(productFilter));

    const matchesChannel =
      channelFilter === 'ALL' ||
      (channelFilter === 'IVR' && (s.channel === 'IVR' || s.activationMethod === 'KEYPAD_DIAL')) ||
      (channelFilter === 'APP' && (s.channel === 'APP' || s.activationMethod === 'APP_LINK_SHARE'));

    return matchesSearch && matchesProduct && matchesChannel;
  });

  const goviMithuruCount = displaySales.filter((s) =>
    s.productType.toLowerCase().includes('govi') || (s.productName && s.productName.toLowerCase().includes('govi'))
  ).length;

  const sayuruCount = displaySales.filter((s) =>
    s.productType.toLowerCase().includes('sayur') || (s.productName && s.productName.toLowerCase().includes('sayur'))
  ).length;

  const totalActivations = displaySales.length;
  const estimatedRevenue = goviMithuruCount * 100 + sayuruCount * 150;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                විකුණුම් සහ සක්‍රිය කිරීම් සාරාංශය • Sales Summary Page
              </h1>
              <p className="text-sm text-slate-400">
                Dialog Sayura සහ Govi Mithuru සක්‍රිය කිරීම් සවිස්තර වාර්තාව
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              සමස්ත ලියාපදිංචි: {totalActivations}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">සමස්ත විකුණුම් (Total)</span>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalActivations}</p>
          <span className="text-xs text-slate-500">ක්ෂේත්‍ර සක්‍රිය කිරීම්</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ගොවිමිතුරු (Govi Mithuru)</span>
            <Smartphone className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{goviMithuruCount}</p>
          <span className="text-xs text-slate-500">කෘෂිකාර්මික සේවා</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">සයුරු (Dialog Sayura)</span>
            <PhoneCall className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400 mt-2">{sayuruCount}</p>
          <span className="text-xs text-slate-500">ධීවර ආරක්ෂණ සේවා</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">කොමිස් වටිනාකම (Est. Value)</span>
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">Rs. {estimatedRevenue.toLocaleString()}</p>
          <span className="text-xs text-slate-500">අනුමත උපයීම්</span>
        </div>
      </div>

      {/* Sales List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="නම, දුරකථන අංකය හෝ Agent Code සොයන්න..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">සියලුම නිෂ්පාදන</option>
              <option value="govimithuru">ගොවිමිතුරු (Govi Mithuru)</option>
              <option value="sayuru">සයුරු (Dialog Sayura)</option>
            </select>

            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">සියලුම ක්‍රම (Channels)</option>
              <option value="IVR">IVR Dial (*616# / #202#)</option>
              <option value="APP">App Link Share</option>
            </select>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            තෝරාගත් කොන්දේසි සඳහා විකුණුම් වාර්තා හමු නොවීය.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">පාරිභෝගිකයා (Customer)</th>
                  <th className="py-3 px-4">දුරකථන අංකය (MSISDN)</th>
                  <th className="py-3 px-4">නිෂ්පාදනය (Product)</th>
                  <th className="py-3 px-4">ක්‍රමය (Channel)</th>
                  <th className="py-3 px-4">නියෝජිතයා (Agent)</th>
                  <th className="py-3 px-4">දිනය (Date)</th>
                  <th className="py-3 px-4">තත්ත්වය (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {sale.customerName || 'Dialog Subscriber'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-300">
                      {sale.customerMobile || sale.msisdn || '07XXXXXXXX'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sale.productType.toLowerCase().includes('sayur')
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {sale.productName || sale.productType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {sale.channel || sale.activationMethod || 'IVR Direct'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs">
                      {sale.agentName} ({sale.agentCode})
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {sale.saleDate || sale.date || 'Today'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETED
                      </span>
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
