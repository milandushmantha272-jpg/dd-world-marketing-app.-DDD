import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DdWorldEmblem } from './DdWorldBranding';
import {
  ArrowLeft,
  Phone,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Sparkles,
} from 'lucide-react';

interface MobileGovimithuruDetailsProps {
  onBack: () => void;
  onActivated?: () => void;
}

export const MobileGovimithuruDetails: React.FC<MobileGovimithuruDetailsProps> = ({
  onBack,
  onActivated,
}) => {
  const { currentUser } = useAuth();
  const { addProductSale } = useData();

  const [selectedPlan, setSelectedPlan] = useState<'sadha' | 'nawa'>('sadha');
  const [showModal, setShowModal] = useState(false);
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'IVR' | 'APP'>('IVR');
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const ussdCode = '#616#';

  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const amount = selectedChannel === 'IVR' ? 150 : 200;
    const cleanPhone = customerMobile.trim();

    // 1. Log sale to DataContext
    addProductSale({
      agentId: currentUser.id,
      agentName: currentUser.name,
      agentCode: currentUser.agentCode || '9000',
      teamId: currentUser.teamId || 'team_direct',
      productType: 'ගොවිමිතුරු',
      productName: `Dialog Govi Mithuru (${selectedPlan.toUpperCase()}) [${selectedChannel}]`,
      channel: selectedChannel,
      quantity: 1,
      customerName: customerName.trim() || undefined,
      customerMobile: cleanPhone || undefined,
      amount,
      activationMethod: selectedChannel === 'IVR' ? 'KEYPAD_DIAL' : 'APP_LINK_SHARE',
      dialCode: ussdCode,
    });

    // 2. Trigger native device dialer
    try {
      window.location.href = `tel:${ussdCode.replace(/#/g, '%23')}`;
    } catch {
      // ignore
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setShowModal(false);
      if (onActivated) onActivated();
    }, 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(ussdCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto px-5 pt-3 pb-6 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center Logo */}
        <div className="flex items-center gap-1.5">
          <DdWorldEmblem size={24} />
          <span className="font-black text-xs text-[#0D3B66]">D.D. WORLD</span>
        </div>

        <div className="w-10" />
      </div>

      {/* Hero Banner (Green with Agriculture Background) */}
      <div className="relative rounded-3xl overflow-hidden shadow-md bg-gradient-to-r from-emerald-700 to-green-600 text-white p-5 min-h-[140px] flex flex-col justify-end">
        {/* Visual Agricultural Field Pattern */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80')`,
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-md">
            <span className="text-2xl">🌾</span>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight leading-tight">Govimithuru</h3>
            <p className="text-xs text-emerald-100 font-medium">Digital Agriculture Service</p>
          </div>
        </div>
      </div>

      {/* Service Plans Toggle (Sadha / Nawa) */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 block ml-1">Service Plans</label>
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setSelectedPlan('sadha')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              selectedPlan === 'sadha'
                ? 'bg-[#E53935] text-white shadow-red-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sadha
          </button>
          <button
            onClick={() => setSelectedPlan('nawa')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              selectedPlan === 'nawa'
                ? 'bg-[#E53935] text-white shadow-red-500/20'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nawa
          </button>
        </div>
      </div>

      {/* Package Pricing Card (Sadha Package) */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
        <h4 className="text-xs font-black text-slate-800 capitalize">{selectedPlan} Package</h4>

        <div className="space-y-2">
          {/* IVR Row */}
          <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">IVR</span>
            </div>
            <span className="text-sm font-black text-slate-800 font-mono">150/=</span>
          </div>

          {/* App Row */}
          <div className="p-3 rounded-2xl bg-white border border-slate-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">App</span>
            </div>
            <span className="text-sm font-black text-slate-800 font-mono">200/=</span>
          </div>
        </div>
      </div>

      {/* 3 Month Payment Schedule Card */}
      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 space-y-2.5">
        <h4 className="text-xs font-black text-slate-800">
          3 Month Payment <span className="font-normal text-slate-400 text-[10px]">(One Service Activation)</span>
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
            <span className="font-bold text-slate-600">IVR Sadha</span>
            <span className="font-black text-slate-800 font-mono tracking-wider">80 - 35 - 35</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="font-bold text-slate-600">App Sadha</span>
            <span className="font-black text-slate-800 font-mono tracking-wider">100 - 50 - 50</span>
          </div>
        </div>
      </div>

      {/* Activate Now Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-2xl bg-[#E53935] hover:bg-red-700 active:scale-[0.98] text-white font-black text-base shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <span>Activate Now</span>
        </button>
      </div>

      {/* Activation / USSD Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-800">Activate Govimithuru</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            {isSuccess ? (
              <div className="py-6 flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">සක්‍රිය කිරීම සාර්ථකයි!</h4>
                <p className="text-xs text-slate-500">
                  Govimithuru ({selectedChannel}) සේවාව සහ USSD ඇමතුම සම්බන්ධ කෙරිණි.
                </p>
              </div>
            ) : (
              <form onSubmit={handleActivateSubmit} className="space-y-3.5">
                {/* Channel Select */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">මාධ්‍යය (Activation Channel)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('IVR')}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        selectedChannel === 'IVR'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      IVR (150/=)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('APP')}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        selectedChannel === 'APP'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      App (200/=)
                    </button>
                  </div>
                </div>

                {/* Customer Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">පාරිභෝගික දුරකථන අංකය (Customer Mobile)</label>
                  <input
                    type="tel"
                    required
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="07X XXX XXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Customer Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600">පාරිභෝගිකයාගේ නම (නොකැමැති නම් හිස්ව තබන්න)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name (Optional)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* USSD Box with Copy */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">USSD REGISTRATION CODE</span>
                    <span className="text-base font-black text-red-600 font-mono tracking-wider">{ussdCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#E53935] hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 fill-white" />
                  <span>දැන්ම USSD Dial කර සක්‍රිය කරන්න</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
