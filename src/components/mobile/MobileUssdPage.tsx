import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Info,
  Phone,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  Clock,
  Sparkles,
  UserCheck,
  XCircle,
  Share2,
  RefreshCw,
  Hash,
  Send,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ActivationStatus } from '../../types';

interface MobileUssdPageProps {
  onBack: () => void;
}

export const MobileUssdPage: React.FC<MobileUssdPageProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const {
    activations,
    addActivationRecord,
    updateActivationStatus,
    ussdConfigs,
  } = useData();

  // Form State
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedPackId, setSelectedPackId] = useState<string>('cfg-sayuru-828');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Verification modal state
  const [verifyingActId, setVerifyingActId] = useState<string | null>(null);
  const [confirmationToken, setConfirmationToken] = useState('');
  const [failureReason, setFailureReason] = useState('Customer Declined');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<string | null>(null);

  const selectedConfig = ussdConfigs.find((c) => c.id === selectedPackId) || ussdConfigs[0];

  const agentCode = currentUser?.agentCode || '9074';
  const isDirectAgent = currentUser?.teamId === 'team_direct' || currentUser?.teamLeaderId === 'owner-9000';

  // Compute targeted USSD string
  const targetedUssdString = useMemo(() => {
    if (!selectedConfig) return '#828#';
    if (selectedConfig.baseUssdCode.startsWith('http')) {
      return selectedConfig.targetedUssdTemplate.replace('{agentCode}', agentCode);
    }
    return selectedConfig.baseUssdCode;
  }, [selectedConfig, agentCode]);

  // Validate Sri Lankan mobile format
  const mobileClean = customerMobile.trim().replace(/\D/g, '');
  const isValidMobile =
    customerMobile.trim().length === 10 &&
    /^(070|071|072|074|075|076|077|078)\d{7}$/.test(customerMobile.trim());

  // Filter activations for current agent
  const myActivations = useMemo(() => {
    if (!currentUser) return [];
    return activations.filter(
      (a) => a.agentId === currentUser.id || a.agentCode === currentUser.agentCode
    );
  }, [activations, currentUser]);

  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayList = myActivations.filter((a) => a.dialedAt.startsWith(today));
    const pending = todayList.filter((a) => a.status === 'Pending_Verification').length;
    const successful = todayList.filter((a) => a.status === 'Successful').length;
    const failed = todayList.filter((a) => a.status === 'Failed').length;
    return { total: todayList.length, pending, successful, failed };
  }, [myActivations]);

  // Handle USSD Trigger / Dialer Launch
  const handleLaunchDialer = () => {
    if (!currentUser) return;

    if (!isValidMobile) {
      setStatusNotice('⚠️ කරුණාකර වලංගු 10-ඉලක්කම් Dialog දුරකථන අංකයක් ඇතුළත් කරන්න (e.g. 0771234567)');
      setTimeout(() => setStatusNotice(null), 4000);
      return;
    }

    const isApp = selectedConfig?.servicePack.includes('App');
    const channel = isApp ? 'APP_LINK' : 'USSD_DIALER';

    // 1. Register with Local State Machine as 'Pending_Verification'
    const newAct = addActivationRecord({
      agentId: currentUser.id,
      agentCode: currentUser.agentCode || '9074',
      agentName: currentUser.name,
      teamId: currentUser.teamId || 'team_direct',
      teamName: currentUser.teamName || 'Direct Field Agents (Owner Group)',
      customerMobile: customerMobile.trim(),
      customerName: customerName.trim() || undefined,
      servicePack: selectedConfig?.servicePack || 'Sayuru_828',
      servicePackName: selectedConfig?.displayName || '🌊 Dialog Sayura (#828#)',
      ussdString: targetedUssdString,
      channel,
      status: 'Pending_Verification',
      district: currentUser.district || 'Colombo',
      location: currentUser.workLocation || 'Field Territory',
      notes: `Initiated via Android Device Proxy (Target: ${targetedUssdString})`,
    });

    // 2. Copy Code to clipboard
    navigator.clipboard?.writeText(targetedUssdString).catch(() => {});
    setCopiedCode(targetedUssdString);
    setTimeout(() => setCopiedCode(null), 3000);

    // 3. Launch Device Dialer Proxy or Share Link
    if (isApp) {
      setStatusNotice(`📱 App Link පිටපත් කරගන්නා ලදී (Ref: ${newAct.activationReference}) - Status: Pending_Verification`);
      const shareUrl = `https://wa.me/94${customerMobile.trim().slice(1)}?text=${encodeURIComponent(
        `DD World Marketing: Dialog ${selectedConfig?.displayName} ඇප් එක බාගත කරගැනීමට පිවිසෙන්න: ${targetedUssdString}`
      )}`;
      window.open(shareUrl, '_blank');
    } else {
      const encoded = targetedUssdString.replace(/#/g, '%23');
      setStatusNotice(
        `📞 USSD ${targetedUssdString} Dialer එකට යොමු කෙරිණි (Ref: ${newAct.activationReference}). Status: Pending_Verification. සක්‍රිය වූ පසු Confirm කරන්න.`
      );
      try {
        window.location.href = `tel:${encoded}`;
      } catch {
        // fallback
      }
    }

    // Reset customer fields for next acquisition
    setCustomerMobile('');
    setCustomerName('');
  };

  const handleConfirmActivation = (actId: string) => {
    if (!confirmationToken.trim()) {
      setStatusNotice('⚠️ කරුණාකර පාරිභෝගිකයාට ලැබුණු SMS කේතය හෝ Reference Token ඇතුළත් කරන්න.');
      setTimeout(() => setStatusNotice(null), 3000);
      return;
    }

    updateActivationStatus(actId, 'Successful', {
      confirmationToken: confirmationToken.trim(),
      verifiedBy: `${currentUser?.name} (Agent Verified)`,
      notes: 'Customer confirmed service registration via network SMS token',
    });

    setVerifyingActId(null);
    setConfirmationToken('');
    setStatusNotice('🎉 සක්‍රිය කිරීම සාර්ථකව තහවුරු විය! විකුණුම් ලෙජරයට (Sales Ledger) ගණනය කෙරිණි.');
    setTimeout(() => setStatusNotice(null), 5000);
  };

  const handleMarkFailed = (actId: string) => {
    updateActivationStatus(actId, 'Failed', {
      failureReason,
      notes: `Registration failed: ${failureReason}`,
    });

    setIsRejectModalOpen(null);
    setStatusNotice('🛑 සක්‍රිය කිරීම අසාර්ථක ලෙස සටහන් විය (Marked Failed).');
    setTimeout(() => setStatusNotice(null), 4000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-y-auto px-4 pt-3 pb-8 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-black text-white tracking-wide">USSD &amp; Acquisition Panel</h2>
          <span className="text-[10px] text-slate-400 font-mono">
            {isDirectAgent ? '⭐ Direct Field Agent (Owner 9000)' : `Agent Code: ${agentCode}`}
          </span>
        </div>

        <div className="w-10 flex justify-end">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
      </div>

      {/* Status Notice Alert */}
      {statusNotice && (
        <div className="p-3 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 block">අද Dials</span>
          <span className="text-base font-black text-white font-mono mt-0.5 block">{kpis.total}</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
          <span className="text-[10px] font-bold text-amber-300 block">Pending</span>
          <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">{kpis.pending}</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <span className="text-[10px] font-bold text-emerald-300 block">Success</span>
          <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">{kpis.successful}</span>
        </div>
        <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
          <span className="text-[10px] font-bold text-rose-300 block">Failed</span>
          <span className="text-base font-black text-rose-400 font-mono mt-0.5 block">{kpis.failed}</span>
        </div>
      </div>

      {/* ACQUISITION FORM CARD */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              නව සක්‍රිය කිරීමක් (New Activation Trigger)
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            FIDO Verified
          </span>
        </div>

        {/* SERVICE PACK SELECTOR */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 block">
            සේවා පැකේජය තෝරන්න (Select Service Pack) *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {ussdConfigs.map((cfg) => {
              const isSelected = selectedPackId === cfg.id;
              const is828 = cfg.servicePack.includes('828') || cfg.servicePack.includes('Sayuru');
              return (
                <button
                  key={cfg.id}
                  type="button"
                  onClick={() => setSelectedPackId(cfg.id)}
                  className={`p-3 rounded-2xl text-left transition border ${
                    isSelected
                      ? is828
                        ? 'bg-blue-600/30 border-blue-500 shadow-md shadow-blue-500/20'
                        : 'bg-emerald-600/30 border-emerald-500 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-white">
                      {cfg.baseUssdCode.startsWith('#') ? cfg.baseUssdCode : 'Play App'}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-[11px] font-bold text-slate-300 mt-1 line-clamp-1">
                    {cfg.displayName.replace(/^(🌊|🌾|📱)\s*/, '')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {cfg.dailyRateLkr > 0 ? `LKR ${cfg.dailyRateLkr}/day` : 'Free Download'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CUSTOMER MOBILE NUMBER INPUT */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-400">
              පාරිභෝගික Dialog දුරකථන අංකය *
            </label>
            {mobileClean.length > 0 && (
              <span
                className={`text-[10px] font-mono font-bold ${
                  isValidMobile ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {isValidMobile ? '✓ Dialog Mobile Valid' : `${10 - mobileClean.length} digits left`}
              </span>
            )}
          </div>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="tel"
              maxLength={10}
              placeholder="077XXXXXXX / 076XXXXXXX / 074XXXXXXX"
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition shadow-inner"
            />
          </div>
        </div>

        {/* CUSTOMER NAME (OPTIONAL) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400">
            පාරිභෝගික නම (Customer Name - Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Sunil Perera"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
          />
        </div>

        {/* TARGETED USSD STRING PREVIEW & DIAL ACTION */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Targeted Trigger Payload:</span>
            <span className="font-mono text-cyan-400 font-bold">{targetedUssdString}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(targetedUssdString);
                setCopiedCode(targetedUssdString);
                setTimeout(() => setCopiedCode(null), 3000);
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleLaunchDialer}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-rose-500 text-xs font-black text-white shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 fill-white" />
              <span>Dial &amp; Trigger</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight text-center pt-1">
            ⚠️ Dial කිරීමෙන් පසු Local State එක <span className="text-amber-400 font-bold">Pending_Verification</span> ලෙස සටහන් වේ.
          </p>
        </div>
      </div>

      {/* AGENT ACQUISITION LEDGER (STATE MACHINE LIST) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              මෑත සක්‍රියතා ඉතිහාසය (Activation Ledger)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">My Records: {myActivations.length}</span>
        </div>

        {myActivations.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            අද දින තවමත් කිසිදු සක්‍රිය කිරීමක් සිදු කර නොමැත.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {myActivations.slice(0, 15).map((act) => {
              const isPending = act.status === 'Pending_Verification';
              const isSuccess = act.status === 'Successful';
              const isFailed = act.status === 'Failed';

              return (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 space-y-2 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{act.customerMobile}</span>
                        <span className="text-[10px] text-slate-400">({act.customerName || 'Customer'})</span>
                      </div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
                        Ref: {act.activationReference}
                      </div>
                    </div>

                    {/* STATUS PILL */}
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
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>{act.servicePackName}</span>
                    <span className="font-mono text-[10px]">
                      {new Date(act.dialedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {act.confirmationToken && (
                    <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-500/20">
                      Token: {act.confirmationToken}
                    </div>
                  )}

                  {act.failureReason && (
                    <div className="text-[10px] text-rose-400 bg-rose-950/40 p-1.5 rounded-lg border border-rose-500/20">
                      Reason: {act.failureReason}
                    </div>
                  )}

                  {/* VERIFICATION ACTIONS FOR PENDING ITEMS */}
                  {isPending && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyingActId(act.id);
                          setConfirmationToken('');
                        }}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Confirm Sale</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsRejectModalOpen(act.id)}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 text-xs font-bold border border-slate-700 transition"
                      >
                        Fail
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRMATION TOKEN INPUT MODAL */}
      {verifyingActId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>සක්‍රිය කිරීම තහවුරු කිරීම (Confirm Sale)</span>
              </h3>
              <button
                onClick={() => setVerifyingActId(null)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              පාරිභෝගිකයාගේ දුරකථනයට Dialog Axiata වෙතින් ලැබුණු SMS කේතය හෝ තහවුරු කිරීමේ Token එක ඇතුළත් කරන්න.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Dialog SMS Token / Code *
              </label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. SMS-82819 හෝ VERIFIED"
                value={confirmationToken}
                onChange={(e) => setConfirmationToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setVerifyingActId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                අවලංගුයි
              </button>
              <button
                type="button"
                onClick={() => handleConfirmActivation(verifyingActId)}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white shadow-lg shadow-emerald-600/30"
              >
                තහවුරු කරන්න
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl">
            <h3 className="text-xs font-black text-white flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>අසාර්ථක වීමට හේතුව (Failure Reason)</span>
            </h3>

            <select
              value={failureReason}
              onChange={(e) => setFailureReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="Non-Dialog SIM">Non-Dialog SIM / Invalid Carrier</option>
              <option value="Customer Declined">Customer Declined / Cancelled</option>
              <option value="Insufficient Balance">Insufficient Balance</option>
              <option value="Network Timeout">Network USSD Timeout</option>
              <option value="Already Subscribed">Already Subscribed</option>
            </select>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
              >
                අවලංගුයි
              </button>
              <button
                type="button"
                onClick={() => handleMarkFailed(isRejectModalOpen)}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white"
              >
                Mark as Failed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileUssdPage;
