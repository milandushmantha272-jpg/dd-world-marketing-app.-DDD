import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AppTarget, ManagementRoute } from '../../types';
import {
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  FileText,
  User,
  Wallet,
  MessageSquare,
  Settings,
  ShieldCheck,
  LogOut,
  Bell,
  Menu,
  X,
  Award,
  PhoneCall,
  Users,
  Smartphone,
  Presentation,
  Database,
  BarChart2,
  Lock,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TargetShellProps {
  target: AppTarget;
  children?: React.ReactNode;
}

export const TargetShell: React.FC<TargetShellProps> = ({ target, children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) return null;

  const isDirectAgent = currentUser.role === 'agent' && (currentUser.teamId === 'team_direct' || currentUser.reportsToUserId === 'owner-9000');
  const isTeamAgent = currentUser.role === 'agent' && !isDirectAgent;
  const isTeamLeader = currentUser.role === 'team_leader' || currentUser.role === 'junior_team_leader';
  const isOwner = currentUser.role === 'owner';
  const isAuditOfficer = currentUser.role === 'dialog_officer';

  const uiHeader = isDirectAgent
    ? 'DD WORLD Direct Agent App'
    : isTeamAgent
    ? 'DD WORLD Agent App'
    : isOwner
    ? 'DD WORLD Owner App'
    : isTeamLeader
    ? 'DD WORLD Team Leader App'
    : 'DD WORLD Dialog Audit Officer App';

  const subtitle = isDirectAgent
    ? `${currentUser.name} • Direct Agent (Reports to Owner 9000)`
    : isTeamAgent
    ? `${currentUser.name} • Team Field Operations Workspace`
    : isOwner
    ? `${currentUser.name} • Master Operational & Executive Control`
    : isTeamLeader
    ? `${currentUser.name} • Regional Team Management Workspace`
    : `${currentUser.name} • Read-Only Verification Workspace`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30">
            DD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">{uiHeader}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 uppercase tracking-widest">
                v5.3
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
          </div>
        </div>

        {/* User Badge & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">{currentUser.name}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">
              {isDirectAgent ? 'Direct Agent' : currentUser.role.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-xl bg-slate-900 hover:bg-red-600/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content View with Dynamic Mounting/Unmounting */}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
};
