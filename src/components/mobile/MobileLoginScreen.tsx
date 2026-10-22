import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DdWorldLogoFull, WaveTopAccent } from './DdWorldBranding';
import { User, Lock, Eye, EyeOff, ShieldCheck, Zap, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface MobileLoginScreenProps {
  onSuccess?: () => void;
}

export const MobileLoginScreen: React.FC<MobileLoginScreenProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const { users } = useData();

  const [agentId, setAgentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = agentId.trim().toLowerCase();
    if (!cleanInput) {
      setError('කරුණාකර ඔබගේ Agent ID අංකය ඇතුළත් කරන්න.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const found = users.find(
        (u) =>
          (u.agentCode && u.agentCode.trim().toLowerCase() === cleanInput) ||
          (u.id && u.id.toLowerCase() === cleanInput) ||
          (u.email && u.email.toLowerCase() === cleanInput) ||
          (u.mobile && u.mobile.includes(cleanInput))
      );

      if (!found) {
        setIsLoading(false);
        setError('ඇතුළත් කළ Agent ID අංකය පද්ධතිය තුළ සොයාගත නොහැක.');
        return;
      }

      // Check Employment & Approval status
      if (
        found.employmentStatus === 'BLOCKED' ||
        found.employmentStatus === 'SUSPENDED' ||
        found.employmentStatus === 'EXITED' ||
        found.status === 'blocked'
      ) {
        setIsLoading(false);
        setError(`මෙම ගිණුම (${found.name}) පරිපාලක විසින් අත්හිටුවා ඇත (ACCOUNT BLOCKED).`);
        return;
      }

      // Check Owner approval
      if (found.role !== 'owner' && found.role !== 'dialog_officer' && found.idApprovalStatus !== 'APPROVED') {
        setIsLoading(false);
        setError(`මෙම ගිණුම සක්‍රිය කිරීමට Owner ගේ අනුමැතිය අවශ්‍ය වේ (PENDING OWNER APPROVAL).`);
        return;
      }

      // Fail closed: never permit an empty password or a predictable fallback password.
      const correctPass = found.password || found.tempPassword;
      if (!password.trim() || !correctPass || password.trim() !== correctPass.trim()) {
        setIsLoading(false);
        setError('Agent Code හෝ Password වැරදියි. Password එක සකසා නැත්නම් Owner අමතා ආරක්ෂිතව නැවත සකස් කරගන්න.');
        return;
      }

      login(found.id);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white relative overflow-hidden select-none">
      {/* Top Wave Graphic */}
      <WaveTopAccent className="w-full absolute top-0 left-0" />

      {/* Main Login Form Container */}
      <div className="flex-1 flex flex-col justify-center px-6 relative z-10 pt-16 pb-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <DdWorldLogoFull size="md" />
          <h2 className="text-xl font-black text-slate-800 mt-4 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-0.5">Login to continue</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agent ID Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 ml-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Agent ID</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Enter your Agent ID (e.g. 9074)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5 ml-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 text-slate-800 text-sm font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 rounded-xl bg-[#1E88E5] hover:bg-blue-600 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Login</span>
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-bold text-[#1E88E5] hover:text-blue-700 transition"
            >
              Forgot Password?
            </button>
          </div>
        </form>

      {/* Security Badges at Bottom (matching mockup) */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-around text-slate-600 relative z-10">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-blue-600 bg-blue-50/50">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Secure</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-amber-500 bg-amber-50/50">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Fast</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-emerald-600 bg-emerald-50/50">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold text-slate-500">Reliable</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">මුරපදය අමතක වීද?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ඔබගේ මුරපදය නැවත සකස් කර ගැනීමට ආයතන පරිපාලක (Owner) හෝ Team Leader අමතන්න:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono font-bold text-slate-700">
              📞 Hotline: 0767046094 / 0775976148
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              තහවුරුයි (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
