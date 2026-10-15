import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DdWorldEmblem, DialogLogo } from './DdWorldBranding';
import {
  X,
  User,
  Home,
  TrendingUp,
  ShieldCheck,
  PhoneCall,
  Settings,
  HelpCircle,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileSideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: string;
  onSelect: (item: 'home' | 'sales' | 'verification' | 'ussd' | 'profile' | 'settings' | 'help') => void;
}

export const MobileSideMenuDrawer: React.FC<MobileSideMenuDrawerProps> = ({
  isOpen,
  onClose,
  activeItem,
  onSelect,
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isManagementUser =
    currentUser?.role === 'owner' ||
    currentUser?.role === 'team_leader' ||
    currentUser?.role === 'junior_team_leader';

  const menuItems: { id: any; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'verification', label: 'Verification', icon: ShieldCheck },
    { id: 'ussd', label: 'USSD', icon: PhoneCall },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex select-none animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container (Dark Mode matching mockup #10) */}
      <div className="relative w-full max-w-[320px] bg-[#0A1128] text-white flex flex-col justify-between p-6 shadow-2xl z-10 animate-slide-right overflow-y-auto">
        {/* Top Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <DdWorldEmblem size={34} />
              <div className="flex flex-col">
                <span className="font-black text-xs text-white tracking-tight leading-none">
                  D.D. WORLD
                </span>
                <span className="font-extrabold text-[8px] text-[#29B6F6] tracking-widest leading-none mt-0.5">
                  MARKETING
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
              aria-label="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Snippet */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80">
            <div className="w-12 h-12 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shrink-0 shadow-md">
              <User className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-black text-white truncate">
                {currentUser?.name || 'Dushmantha'}
              </h4>
              <p className="text-[11px] text-slate-400 font-semibold truncate">
                Agent ID : <span className="font-mono text-slate-300 font-bold">{currentUser?.agentCode || '9000'}</span>
              </p>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#43A047] text-white">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5 pt-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-[#E53935] text-white shadow-lg shadow-red-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Management Switcher for TLs & Owner */}
            {isManagementUser && (
              <button
                onClick={() => {
                  onClose();
                  navigate('/management/dashboard');
                }}
                className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 transition text-left"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-400" />
                <span>Management Console</span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Footer: Powered by Dialog & Wave Art */}
        <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-col items-center gap-3 relative">
          <DialogLogo size={26} isDark={true} showPoweredBy={true} />

          <button
            onClick={() => {
              if (window.confirm('ඔබට පද්ධතියෙන් ඉවත් වීමට අවශ්‍යද?')) {
                logout();
              }
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-red-400 transition pt-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
