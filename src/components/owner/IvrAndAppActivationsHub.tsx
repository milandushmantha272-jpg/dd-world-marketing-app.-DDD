import React, { useState, useMemo } from 'react';
import {
  Phone,
  Smartphone,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Radio,
  User as UserIcon,
  MessageCircle,
  QrCode,
  Send,
  Calendar,
  Sparkles,
  Lock,
  ShieldCheck,
  Edit,
  Save,
  Check,
  XCircle,
  AlertTriangle,
  FileCheck,
  FileText,
  Layers,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ProductSale, User, AppActivationRecord, UssdServiceConfig, DialogReportImportRow } from '../../types';

interface IvrAndAppActivationsHubProps {
  currentUser?: User;
  onOpenMap?: (lat?: number, lng?: number) => void;
}

export const IvrAndAppActivationsHub: React.FC<IvrAndAppActivationsHubProps> = ({
  currentUser: propUser,
  onOpenMap,
}) => {
  const { currentUser: authUser } = useAuth();
  const currentUser = propUser || authUser;
  const {
    sales,
    activations,
    updateActivationStatus,
    ussdConfigs,
    updateUssdConfig,
    dialogImportRows,
    verifyDialogMatch,
    users,
    teams,
  } = useData();

  const [activeTab, setActiveTab] = useState<'activations' | 'sales_archive' | 'config_desk' | 'cdr_reconcile'>('activations');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');

  // Editing config modal / state
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [editBaseCode, setEditBaseCode] = useState('');
  const [editTemplate, setEditTemplate] = useState('');
  const [editProductCode, setEditProductCode] = useState('');
  const [editRate, setEditRate] = useState<number>(0);
  const [editCommission, setEditCommission] = useState<number>(0);

  const isOwner = currentUser?.role === 'owner';
  const isLeader = currentUser?.role === 'team_leader' || currentUser?.role === 'junior_team_leader';
  const isAuditOfficer = currentUser?.role === 'dialog_officer';

  // Scoped activations: Team leader bounded by teamId, Owner & Audit Officer see all
  const scopedActivations = useMemo(() => {
    let list = activations;
    if (isLeader && currentUser?.teamId) {
      list = list.filter((a) => a.teamId === currentUser.teamId);
    }
    return list;
  }, [activations, isLeader, currentUser]);

  const filteredActivations = useMemo(() => {
    return scopedActivations.filter((a) => {
      if (selectedStatusFilter !== 'all' && a.status !== selectedStatusFilter) return false;

      if (selectedProductFilter !== 'all') {
        if (selectedProductFilter === 'sayuru' && !a.servicePack.includes('Sayuru') && !a.servicePackName.includes('828')) return false;
        if (selectedProductFilter === 'govimithuru' && !a.servicePack.includes('Govi') && !a.servicePackName.includes('616')) return false;
      }

      if (selectedTeamFilter !== 'all' && a.teamId !== selectedTeamFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = a.agentName?.toLowerCase().includes(q);
        const matchCode = a.agentCode?.toLowerCase().includes(q);
        const matchRef = a.activationReference?.toLowerCase().includes(q);
        const matchMobile = isLeader ? false : a.customerMobile?.includes(q);
        const matchCustomer = a.customerName?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchRef && !matchMobile && !matchCustomer) return false;
      }

      return true;
    });
  }, [scopedActivations, selectedStatusFilter, selectedProductFilter, selectedTeamFilter, searchQuery, isLeader]);

  // Aggregate Metrics for Validation Panel
  const metrics = useMemo(() => {
    const total = scopedActivations.length;
    const successful = scopedActivations.filter((a) => a.status === 'Successful').length;
    const pending = scopedActivations.filter((a) => a.status === 'Pending_Verification').length;
    const failed = scopedActivations.filter((a) => a.status === 'Failed').length;
    const failRate = total > 0 ? ((failed / total) * 100).toFixed(1) : '0.0';

    const sayuruCount = scopedActivations.filter((a) => a.servicePack.includes('Sayuru') || a.servicePackName.includes('828')).length;
    const goviCount = scopedActivations.filter((a) => a.servicePack.includes('Govi') || a.servicePackName.includes('616')).length;

    return { total, successful, pending, failed, failRate, sayuruCount, goviCount };
  }, [scopedActivations]);

  const handleStartEditConfig = (cfg: UssdServiceConfig) => {
    if (!isOwner) return;
    setEditingConfigId(cfg.id);
    setEditBaseCode(cfg.baseUssdCode);
    setEditTemplate(cfg.targetedUssdTemplate);
    setEditProductCode(cfg.productCode);
    setEditRate(cfg.dailyRateLkr);
    setEditCommission(cfg.monthlyCommissionLkr);
  };

  const handleSaveConfig = (cfgId: string) => {
    if (!isOwner) return;
    updateUssdConfig(cfgId, {
      baseUssdCode: editBaseCode,
      targetedUssdTemplate: editTemplate,
      productCode: editProductCode,
      dailyRateLkr: Number(editRate) || 0,
      monthlyCommissionLkr: Number(editCommission) || 0,
    });
    setEditingConfigId(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Dialog Enterprise USSD &amp; Acquisition Operational Console</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            {isOwner
              ? '👑 Master Operational Control & Global USSD Desk'
              : isAuditOfficer
              ? '🛡️ Dialog Axiata Audit & Carrier Reconciliation Desk'
              : `👥 Team Group Validation Panel (${currentUser?.teamName || 'Regional Team'})`}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sayura (#828#) සහ Govi Mithuru (#616#) සක්‍රියතා, Activation References, පාරිභෝගික ගිවිසුම් සහ සත්‍යාපන ලෙජරය.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Active Roster: 21 Verified</span>
          </span>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-slate-400 block">මුළු සක්‍රියතා Dials</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{metrics.total}</span>
          <span className="text-[10px] text-slate-500">All Attempts</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-md">
          <span className="text-[11px] font-bold text-emerald-300 block">තහවුරු වූ (Successful)</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-1 block">{metrics.successful}</span>
          <span className="text-[10px] text-emerald-500">Credited to Sales</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-md">
          <span className="text-[11px] font-bold text-amber-300 block">Pending Verification</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">{metrics.pending}</span>
          <span className="text-[10px] text-amber-500">Awaiting SMS/Token</span>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 shadow-md">
          <span className="text-[11px] font-bold text-rose-300 block">අසාර්ථක (Failed)</span>
          <span className="text-2xl font-black text-rose-400 font-mono mt-1 block">{metrics.failed}</span>
          <span className="text-[10px] text-rose-500">Fail Rate: {metrics.failRate}%</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-[11px] font-bold text-cyan-400 block">Sayuru vs Govi</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-black text-cyan-400 font-mono">🌊 {metrics.sayuruCount}</span>
            <span className="text-xs text-slate-600">/</span>
            <span className="text-lg font-black text-emerald-400 font-mono">🌾 {metrics.goviCount}</span>
          </div>
          <span className="text-[10px] text-slate-500">Product Split</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('activations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
            activeTab === 'activations'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>සජීවී සක්‍රියතා ලෙජරය (Live Activations)</span>
        </button>

        {isOwner && (
          <button
            onClick={() => setActiveTab('config_desk')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
              activeTab === 'config_desk'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Global USSD Configuration Desk</span>
          </button>
        )}

        {(isOwner || isAuditOfficer) && (
          <button
            onClick={() => setActiveTab('cdr_reconcile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
              activeTab === 'cdr_reconcile'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Dialog Carrier CDR Reconciliation</span>
          </button>
        )}
      </div>

      {/* VIEW 1: LIVE ACTIVATIONS LEDGER */}
      {activeTab === 'activations' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by agent code, reference, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-red-500"
              >
                <option value="all">All Statuses</option>
                <option value="Successful">Successful (තහවුරු වූ)</option>
                <option value="Pending_Verification">Pending Verification</option>
                <option value="Failed">Failed (අසාර්ථක)</option>
              </select>

              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-red-500"
              >
                <option value="all">All Products</option>
                <option value="sayuru">🌊 සයුරු (#828#)</option>
                <option value="govimithuru">🌾 ගොවිමිතුරු (#616#)</option>
              </select>

              {isOwner && (
                <select
                  value={selectedTeamFilter}
                  onChange={(e) => setSelectedTeamFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-bold focus:outline-none focus:border-red-500"
                >
                  <option value="all">All Teams</option>
                  <option value="team_direct">Direct Agents (Owner 9000)</option>
                  <option value="team_dilan">Dilan Team (Dayan 9087)</option>
                  <option value="team_nethsara">Nethsara Team (9263)</option>
                </select>
              )}
            </div>
          </div>

          {/* Activations Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  සක්‍රියතා ලෙජරය (Activations Ledger: {filteredActivations.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {isLeader ? `Bounded to: ${currentUser?.teamName}` : 'Enterprise View'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
                  <tr>
                    <th className="py-3 px-4">වේලාව / දිනය</th>
                    <th className="py-3 px-4">Activation Reference</th>
                    <th className="py-3 px-4">නියෝජිතයා (Agent)</th>
                    <th className="py-3 px-4">සේවා පැකේජය</th>
                    <th className="py-3 px-4">පාරිභෝගික අංකය</th>
                    <th className="py-3 px-4">ස්ථානය (Location)</th>
                    <th className="py-3 px-4 text-center">තත්ත්වය</th>
                    <th className="py-3 px-4 text-center">ක්‍රියා</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredActivations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        සක්‍රිය කිරීම් වාර්තා කිසිවක් හමු නොවීය.
                      </td>
                    </tr>
                  ) : (
                    filteredActivations.map((act) => {
                      const isSuccess = act.status === 'Successful';
                      const isPending = act.status === 'Pending_Verification';
                      const isFailed = act.status === 'Failed';
                      const is616 = act.servicePack.includes('616') || act.servicePackName.includes('616');

                      return (
                        <tr key={act.id} className="hover:bg-slate-800/40 transition">
                          {/* TIMESTAMP */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-white flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>
                                {new Date(act.dialedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(act.dialedAt).toLocaleDateString('en-GB')}
                            </div>
                          </td>

                          {/* ACTIVATION REFERENCE */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono text-cyan-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {act.activationReference}
                            </span>
                            {act.confirmationToken && (
                              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                Token: {act.confirmationToken}
                              </div>
                            )}
                          </td>

                          {/* AGENT */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-white flex items-center gap-1">
                              <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>{act.agentName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Code: {act.agentCode} • {act.teamName || 'Direct'}
                            </div>
                          </td>

                          {/* SERVICE PACK */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                                is616 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                              }`}
                            >
                              {act.servicePackName}
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {act.ussdString}
                            </div>
                          </td>

                          {/* CUSTOMER MOBILE */}
                          <td className="py-3 px-4 whitespace-nowrap font-mono">
                            {isLeader ? (
                              <span className="text-slate-400 text-[11px]">07X •••• XXX (Masked)</span>
                            ) : (
                              <div>
                                <span className="font-bold text-white">{act.customerMobile}</span>
                                {act.customerName && (
                                  <div className="text-[10px] text-slate-400 font-sans">{act.customerName}</div>
                                )}
                              </div>
                            )}
                          </td>

                          {/* LOCATION */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-slate-200">
                              <MapPin className="w-3.5 h-3.5 text-rose-400" />
                              <span>{act.district || act.location || 'Western'}</span>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                isSuccess
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : isPending
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {act.status}
                            </span>
                          </td>

                          {/* ACTIONS */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {isPending && (isOwner || isLeader) ? (
                              <button
                                onClick={() =>
                                  updateActivationStatus(act.id, 'Successful', {
                                    confirmationToken: 'MGR-VERIFIED',
                                    verifiedBy: currentUser?.name,
                                  })
                                }
                                className="px-2 py-1 rounded bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition"
                              >
                                Approve
                              </button>
                            ) : (
                              <span className="text-slate-600 text-[10px]">Verified</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GLOBAL USSD CONFIGURATION DESK (OWNER ONLY) */}
      {activeTab === 'config_desk' && isOwner && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Global USSD &amp; Product Code Settings (Root Privileges)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ආයතන ප්‍රධානී (Owner 9000) සඳහා වන USSD Strings, Product Codes, සහ කොමිස් අගයන් වෙනස් කිරීමේ කවුළුව.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30">
              Master Authority
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ussdConfigs.map((cfg) => {
              const isEditing = editingConfigId === cfg.id;

              return (
                <div
                  key={cfg.id}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{cfg.displayName}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {cfg.productCode}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Base USSD Code</label>
                        <input
                          type="text"
                          value={editBaseCode}
                          onChange={(e) => setEditBaseCode(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Template</label>
                        <input
                          type="text"
                          value={editTemplate}
                          onChange={(e) => setEditTemplate(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Daily Rate (LKR)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={editRate}
                            onChange={(e) => setEditRate(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Commission (LKR)</label>
                          <input
                            type="number"
                            value={editCommission}
                            onChange={(e) => setEditCommission(parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingConfigId(null)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-bold text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveConfig(cfg.id)}
                          className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-black text-white flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs text-slate-300 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Base Trigger Code:</span>
                        <span className="font-mono text-cyan-400 font-bold">{cfg.baseUssdCode}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Target Template:</span>
                        <span className="font-mono text-amber-300">{cfg.targetedUssdTemplate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Daily Customer Rate:</span>
                        <span className="font-mono text-white">LKR {cfg.dailyRateLkr.toFixed(2)} + Tax</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Monthly Commission:</span>
                        <span className="font-mono text-emerald-400 font-bold">LKR {cfg.monthlyCommissionLkr.toFixed(2)}</span>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleStartEditConfig(cfg)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DIALOG CARRIER RECONCILIATION & CDR MATCHING */}
      {activeTab === 'cdr_reconcile' && (isOwner || isAuditOfficer) && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span>Dialog Axiata Carrier Import Rows &amp; CDR Reconciliation</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Dialog Network Core වෙතින් ලැබෙන දෛනික CDR දත්ත සහ නියෝජිතයින්ගේ Activation References අතර ගැලපීම් (Transactional Matches).
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold border border-blue-500/30">
              Audit Scoped: Read-Only
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
                <tr>
                  <th className="py-3 px-4">Carrier Timestamp</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Customer MSISDN</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Matched Activation Ref</th>
                  <th className="py-3 px-4">Matched Agent</th>
                  <th className="py-3 px-4 text-center">Match Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {dialogImportRows.map((row) => {
                  const isMatched = row.matchStatus === 'MATCHED';
                  return (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 whitespace-nowrap font-mono">{row.carrierTimestamp}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-cyan-400">{row.transactionRef}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-white">{row.msisdn}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{row.productName}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-emerald-400">
                        {row.matchedActivationRef || <span className="text-slate-600">Unmatched</span>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {row.matchedAgentName ? (
                          <div>
                            <div className="font-bold text-white">{row.matchedAgentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Code: {row.matchedAgentCode}</div>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            isMatched
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {row.matchStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {!isMatched && (isOwner || isAuditOfficer) ? (
                          <button
                            onClick={() => {
                              const candidate = activations.find((a) => a.customerMobile === row.msisdn);
                              if (candidate) {
                                verifyDialogMatch(row.id, candidate.activationReference);
                              } else {
                                alert(`No local activation reference found for ${row.msisdn}`);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-bold transition"
                          >
                            Auto Match
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Verified ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default IvrAndAppActivationsHub;
