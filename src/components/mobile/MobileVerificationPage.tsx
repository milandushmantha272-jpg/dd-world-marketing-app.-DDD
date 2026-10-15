import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  ArrowLeft,
  ShieldCheck,
  Phone,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface MobileVerificationPageProps {
  onBack: () => void;
}

export const MobileVerificationPage: React.FC<MobileVerificationPageProps> = ({ onBack }) => {
  const { sales } = useData();

  const [mobileNumber, setMobileNumber] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'ACTIVE' | 'ELIGIBLE' | 'NOT_REGISTERED';
    phone: string;
    services: string[];
    registeredDate?: string;
  } | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mobileNumber.trim();
    if (!clean) return;

    setIsChecking(true);
    setVerificationResult(null);

    setTimeout(() => {
      // Look up sales in DataContext
      const matchedSales = sales.filter(
        (s) => s.customerMobile && s.customerMobile.includes(clean)
      );

      if (matchedSales.length > 0) {
        setVerificationResult({
          status: 'ACTIVE',
          phone: clean,
          services: matchedSales.map((s) => s.productName || s.productType),
          registeredDate: matchedSales[0].date || '2026-10-01',
        });
      } else {
        // Return active eligibility status for Dialog SIM
        setVerificationResult({
          status: 'ELIGIBLE',
          phone: clean,
          services: ['Govi Mithuru (#616#)', 'Sayuru (#828#)'],
        });
      }
      setIsChecking(false);
    }, 600);
  };

  const handleQuickLink = (type: string) => {
    alert(`ℹ️ Dialog Self-Care Status (${type}): සම්බන්ධතා පරීක්ෂාව සක්‍රියයි.`);
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

        <h2 className="text-base font-black text-slate-800">Verification</h2>

        <div className="w-10" />
      </div>

      {/* Main Graphic & Title */}
      <div className="flex flex-col items-center text-center pt-2 pb-1">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm mb-3">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-black text-slate-800 tracking-tight">Service Verification</h3>
        <p className="text-xs text-slate-400 font-medium max-w-xs mt-1 leading-relaxed">
          Check your service status and eligibility here.
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleCheck} className="space-y-3 pt-1">
        <div className="space-y-1">
          <div className="relative">
            <input
              type="tel"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="07X XXX XXXX"
              className="w-full px-4 py-3.5 pl-11 rounded-2xl border border-slate-200 text-slate-800 font-mono font-bold text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isChecking}
          className="w-full py-3.5 rounded-2xl bg-[#1E88E5] hover:bg-blue-600 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
        >
          {isChecking ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>Check</span>
          )}
        </button>
      </form>

      {/* Verification Result Card */}
      {verificationResult && (
        <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2 animate-fade-in shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">දුරකථන අංකය: {verificationResult.phone}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                verificationResult.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {verificationResult.status === 'ACTIVE' ? 'Active Subscriber' : 'Eligible for Service'}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium block">ලියාපදිංචි / සුදුසු සේවාවන්:</span>
            {verificationResult.services.map((srv, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{srv}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links (matching mockup) */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold text-slate-700 block ml-1">Quick Links</span>

        <div className="space-y-2">
          {/* Check Registration Status */}
          <div
            onClick={() => handleQuickLink('Registration Status')}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 shadow-sm flex items-center justify-between cursor-pointer transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Check Registration Status</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Check Service Balance */}
          <div
            onClick={() => handleQuickLink('Service Balance')}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 shadow-sm flex items-center justify-between cursor-pointer transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">Check Service Balance</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
