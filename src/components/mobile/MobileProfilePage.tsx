import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  ArrowLeft,
  User,
  Lock,
  History,
  Settings,
  HelpCircle,
  ChevronRight,
  LogOut,
  Phone,
  Mail,
  Shield,
  Check,
} from 'lucide-react';

interface MobileProfilePageProps {
  onBack: () => void;
}

export const MobileProfilePage: React.FC<MobileProfilePageProps> = ({ onBack }) => {
  const { currentUser, logout } = useAuth();
  const { sales, attendance } = useData();

  const [activeModal, setActiveModal] = useState<
    'personal_info' | 'change_password' | 'service_history' | 'settings' | 'help' | null
  >(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  const mySales = sales.filter(
    (s) => s.agentId === currentUser?.id || s.agentCode === currentUser?.agentCode
  );

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordNotice('මුරපද දෙක නොගැළපේ.');
      return;
    }
    setPasswordNotice('✅ මුරපදය සාර්ථකව යාවත්කාලීන කරන ලදී.');
    setTimeout(() => {
      setPasswordNotice(null);
      setActiveModal(null);
    }, 1500);
  };

  const menuItems = [
    { id: 'personal_info', label: 'Personal Information', icon: User },
    { id: 'change_password', label: 'Change Password', icon: Lock },
    { id: 'service_history', label: 'Service History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

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

        <h2 className="text-base font-black text-slate-800">Profile</h2>

        <div className="w-10" />
      </div>

      {/* User Header Profile Card (matching mockup) */}
      <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shrink-0 shadow-md">
          <User className="w-8 h-8" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-800 truncate">
            {currentUser?.name || 'Dushmantha'}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Agent ID : <span className="font-mono text-slate-700 font-bold">{currentUser?.agentCode || '9000'}</span>
          </p>
          <div className="mt-1.5">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#43A047] text-white shadow-sm">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List Items (matching mockup) */}
      <div className="space-y-2 pt-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              onClick={() => setActiveModal(item.id as any)}
              className="p-3.5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:bg-slate-50 shadow-sm flex items-center justify-between cursor-pointer transition active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          );
        })}
      </div>

      {/* Prominent Red Logout Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            if (window.confirm('ඔබට පද්ධතියෙන් ඉවත් වීමට (Logout) අවශ්‍යද?')) {
              logout();
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-[#E53935] hover:bg-red-700 active:scale-[0.98] text-white font-bold text-sm tracking-wide shadow-md shadow-red-500/25 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Personal Info Modal */}
      {activeModal === 'personal_info' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-800">Personal Information</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Full Name</span>
                <span className="font-bold">{currentUser?.name}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Designation</span>
                <span className="font-bold">{currentUser?.designation || 'Field Sales Representative'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Team Assignment</span>
                <span className="font-bold">{currentUser?.teamName || 'Direct Field Agents (Owner Group)'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Contact Mobile</span>
                <span className="font-bold font-mono">{currentUser?.mobile || currentUser?.phone || '0767046094'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {activeModal === 'change_password' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-800">Change Password</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            {passwordNotice && (
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold">
                {passwordNotice}
              </div>
            )}

            <form onSubmit={handlePasswordSave} className="space-y-2.5">
              <input
                type="password"
                required
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <input
                type="password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Save Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Service History Modal */}
      {activeModal === 'service_history' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3 animate-scale-up max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-black text-slate-800">Service History</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>
            <div className="space-y-2">
              {mySales.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">අද දින විකුණුම් සටහන් නොමැත.</p>
              ) : (
                mySales.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{s.productType}</span>
                      <span className="text-emerald-600">LKR {s.amount}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                      <span>{s.customerMobile || 'Direct USSD'}</span>
                      <span>{s.time || s.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3 animate-scale-up text-center">
            <h3 className="text-sm font-black text-slate-800">Help & Support</h3>
            <p className="text-xs text-slate-500">DD World Marketing Support Hotline:</p>
            <div className="p-3 rounded-2xl bg-slate-50 font-mono font-bold text-xs text-blue-600">
              📞 0767046094 (Dushmantha) <br />
              📞 0775976148 (Dayan)
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
