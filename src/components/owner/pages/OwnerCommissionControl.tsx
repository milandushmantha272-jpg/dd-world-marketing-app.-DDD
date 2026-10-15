import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Wallet, DollarSign, CheckCircle2, Clock, ShieldCheck, Download, Search, Building2, Filter } from 'lucide-react';

export const OwnerCommissionControl: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, sales, teams } = useData();

  const [selectedTeam, setSelectedTeam] = useState<string>('ALL');
  const [searchAgent, setSearchAgent] = useState('');
  const [approvedUsers, setApprovedUsers] = useState<string[]>([]);

  if (!currentUser || currentUser.role !== 'owner') return null;

  const agents = users.filter((u) => u && (u.role === 'agent' || u.role === 'team_leader' || u.role === 'junior_team_leader'));

  const agentCommissions = agents.map((agent) => {
    const userSales = sales.filter((s) => s.agentId === agent.id);
    const goviCount = userSales.filter((s) => s.productType.toLowerCase().includes('govi')).length;
    const sayuruCount = userSales.filter((s) => s.productType.toLowerCase().includes('sayur')).length;
    const totalAmount = goviCount * 100 + sayuruCount * 150;
    const isApproved = approvedUsers.includes(agent.id);

    return {
      agent,
      salesCount: userSales.length,
      goviCount,
      sayuruCount,
      totalAmount,
      isApproved,
    };
  });

  const totalDisbursed = agentCommissions.reduce((acc, c) => acc + c.totalAmount, 0);

  const toggleApproval = (agentId: string) => {
    setApprovedUsers((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const filtered = agentCommissions.filter((c) => {
    const matchesTeam = selectedTeam === 'ALL' || c.agent.teamId === selectedTeam;
    const matchesSearch =
      c.agent.name.toLowerCase().includes(searchAgent.toLowerCase()) ||
      (c.agent.agentCode && c.agent.agentCode.includes(searchAgent));
    return matchesTeam && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                කොමිස් ගෙවීම් පාලන මධ්‍යස්ථානය • Owner Commission Control
              </h1>
              <p className="text-sm text-slate-400">
                Dialog Sayura (Rs. 150) සහ Govi Mithuru (Rs. 100) නිල කොමිස් මුදල් අනුමැතිය
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              සමස්ත ගෙවීම් වටිනාකම: Rs. {totalDisbursed.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Commission Rates Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">සමස්ත ප්‍රතිපාදනය (Total)</span>
          <p className="text-3xl font-black text-white mt-2">Rs. {totalDisbursed.toLocaleString()}</p>
          <span className="text-xs text-slate-500">නියෝජිතයින් {agents.length} ක් සඳහා</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ගොවිමිතුරු අනුපාතය</span>
          <p className="text-3xl font-black text-emerald-400 mt-2">Rs. 100</p>
          <span className="text-xs text-slate-500">Per valid subscriber</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">සයුරු අනුපාතය</span>
          <p className="text-3xl font-black text-cyan-400 mt-2">Rs. 150</p>
          <span className="text-xs text-slate-500">Per valid subscriber</span>
        </div>
      </div>

      {/* Commission Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="නියෝජිතයා හෝ කේතය සොයන්න..."
              value={searchAgent}
              onChange={(e) => setSearchAgent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">සියලුම කණ්ඩායම්</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">නියෝජිතයා (Agent)</th>
                <th className="py-3 px-4">කේතය (Code)</th>
                <th className="py-3 px-4">කණ්ඩායම (Team)</th>
                <th className="py-3 px-4">ගොවිමිතුරු (GM)</th>
                <th className="py-3 px-4">සයුරු (Sayura)</th>
                <th className="py-3 px-4">මුළු කොමිස් (Total)</th>
                <th className="py-3 px-4">අනුමැතිය (Approval)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.map((item) => (
                <tr key={item.agent.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{item.agent.name}</td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{item.agent.agentCode || '-'}</td>
                  <td className="py-3 px-4 text-slate-400">{item.agent.teamName || '-'}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{item.goviCount}</td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">{item.sayuruCount}</td>
                  <td className="py-3 px-4 font-bold text-white">Rs. {item.totalAmount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleApproval(item.agent.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                        item.isApproved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.isApproved ? 'APPROVED' : 'APPROVE'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
