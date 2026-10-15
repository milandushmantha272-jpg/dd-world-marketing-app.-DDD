import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ManagementRoute } from '../types';
import { TargetShell } from '../components/shell/TargetShell';
import { OwnerDashboardConsole } from '../components/owner/pages/OwnerDashboardConsole';
import { TeamLeaderDashboard } from '../components/leader/TeamLeaderDashboard';
import { PerformanceOverviewPage } from '../components/owner/pages/PerformanceOverviewPage';
import { DailySummaryAnalyticsLedger } from '../components/owner/pages/DailySummaryAnalyticsLedger';
import { MonthlyTargetPlanPage } from '../components/owner/pages/MonthlyTargetPlanPage';
import { AttendancePage } from '../components/common/AttendancePage';
import { IvrAndAppActivationsHub } from '../components/owner/IvrAndAppActivationsHub';
import { SalesSummaryPage } from '../components/common/SalesSummaryPage';
import { OwnerCareerManagementPage } from '../components/owner/pages/OwnerCareerManagementPage';
import { OwnerUserAccessManagementPage } from '../components/owner/pages/OwnerUserAccessManagementPage';
import { AppDownloadStatusMonitor } from '../components/owner/AppDownloadStatusMonitor';
import { MessageRoomPage } from '../components/common/MessageRoomPage';
import { MonthEndPresentationPage } from '../components/owner/pages/MonthEndPresentationPage';
import { OwnerCommissionControl } from '../components/owner/pages/OwnerCommissionControl';
import { DataRetentionCenter, AnnualArchivePage } from '../components/owner/pages/DataRetentionCenter';
import { SettingsPage } from '../components/common/SettingsPage';
import { AuditTrailPage } from '../components/owner/pages/AuditTrailPage';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  Award,
  CalendarCheck,
  PhoneCall,
  Users,
  FileText,
  Lock,
  Smartphone,
  MessageSquare,
  Presentation,
  Wallet,
  Database,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export const normalizePath = (path: string): string => {
  return path.replace(/\/+$/, '') || '/management/dashboard';
};

export const routeForPath = (path: string, isOwner: boolean): ManagementRoute => {
  const normalized = normalizePath(path);

  if (normalized === '/management/performance' && isOwner) return 'performance';
  if (normalized === '/management/daily-summary' && isOwner) return 'daily-summary';

  const ownerMap: Record<string, ManagementRoute> = {
    '/management/dashboard': 'dashboard',
    '/management/mobile-app': 'mobile-app',
    '/management/performance': 'performance',
    '/management/daily-summary': 'daily-summary',
    '/management/targets': 'targets',
    '/management/attendance': 'attendance',
    '/management/sales': 'sales',
    '/management/activations': 'activations',
    '/management/teams': 'teams',
    '/management/reports': 'reports',
    '/management/employees': 'employees',
    '/management/devices': 'devices',
    '/management/messages': 'messages',
    '/management/presentation': 'presentation',
    '/management/payments': 'payments',
    '/management/audit-trail': 'audit-trail',
    '/management/history': 'history',
    '/management/settings': 'settings',
  };

  const leaderMap: Record<string, ManagementRoute> = {
    '/management/dashboard': 'dashboard',
    '/management/mobile-app': 'mobile-app',
    '/management/targets': 'targets',
    '/management/attendance': 'attendance',
    '/management/sales': 'sales',
    '/management/activations': 'activations',
    '/management/reports': 'reports',
    '/management/messages': 'messages',
    '/management/settings': 'settings',
  };

  const map = isOwner ? ownerMap : leaderMap;
  return map[normalized] || 'dashboard';
};

import { MobileAppExperience } from '../components/mobile/MobileAppExperience';

export const ManagementMainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const isOwner = currentUser.role === 'owner';
  const isLeader = currentUser.role === 'team_leader' || currentUser.role === 'junior_team_leader';

  // RBAC check: [owner, team_leader, junior_team_leader]
  if (!isOwner && !isLeader) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-md">
          <h2 className="text-xl font-bold text-red-400">අවසර සීමාව ඉක්මවා ඇත (RBAC Restriction)</h2>
          <p className="text-xs text-slate-400 mt-2">
            මෙම කළමනාකරණ කවුළුව වෙන් කර ඇත්තේ Owner සහ Team Leaders සඳහා පමණි.
          </p>
        </div>
      </div>
    );
  }

  const activeRoute = routeForPath(location.pathname, isOwner);

  const ownerNav = [
    { path: '/management/dashboard', route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/management/mobile-app', route: 'mobile-app', label: '📱 Mobile App View', icon: Smartphone },
    { path: '/management/audit-trail', route: 'audit-trail', label: '🛡️ Audit Trail (Logs)', icon: ShieldAlert },
    { path: '/management/activations', route: 'activations', label: '📞 USSD Activations', icon: Smartphone },
    { path: '/management/performance', route: 'performance', label: 'Performance', icon: TrendingUp },
    { path: '/management/daily-summary', route: 'daily-summary', label: 'Daily Ledger', icon: BarChart2 },
    { path: '/management/targets', route: 'targets', label: 'Targets', icon: Award },
    { path: '/management/attendance', route: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { path: '/management/sales', route: 'sales', label: 'IVR Hub & Sales', icon: PhoneCall },
    { path: '/management/teams', route: 'teams', label: 'Teams', icon: Users },
    { path: '/management/reports', route: 'reports', label: 'Reports', icon: FileText },
    { path: '/management/employees', route: 'employees', label: 'Employees', icon: Lock },
    { path: '/management/devices', route: 'devices', label: 'Devices', icon: Smartphone },
    { path: '/management/messages', route: 'messages', label: 'Messages', icon: MessageSquare },
    { path: '/management/presentation', route: 'presentation', label: 'Presentation', icon: Presentation },
    { path: '/management/payments', route: 'payments', label: 'Payments', icon: Wallet },
    { path: '/management/history', route: 'history', label: 'History Archive', icon: Database },
    { path: '/management/settings', route: 'settings', label: 'Settings', icon: Settings },
  ];

  const leaderNav = [
    { path: '/management/dashboard', route: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/management/mobile-app', route: 'mobile-app', label: '📱 Mobile App View', icon: Smartphone },
    { path: '/management/activations', route: 'activations', label: '📞 Team Activations', icon: Smartphone },
    { path: '/management/targets', route: 'targets', label: 'Targets', icon: Award },
    { path: '/management/attendance', route: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { path: '/management/sales', route: 'sales', label: 'Sales Summary', icon: PhoneCall },
    { path: '/management/reports', route: 'reports', label: 'Reports', icon: FileText },
    { path: '/management/messages', route: 'messages', label: 'Messages', icon: MessageSquare },
    { path: '/management/settings', route: 'settings', label: 'Settings', icon: Settings },
  ];

  const currentNav = isOwner ? ownerNav : leaderNav;

  // Exact ROUTE_RENDER matching manifest specification:
  const renderRouteContent = () => {
    switch (activeRoute) {
      case 'dashboard':
        return isOwner ? <OwnerDashboardConsole /> : <TeamLeaderDashboard />;
      case 'mobile-app':
        return <MobileAppExperience />;
      case 'audit-trail':
        return isOwner ? <AuditTrailPage /> : <TeamLeaderDashboard />;
      case 'activations':
        return <IvrAndAppActivationsHub currentUser={currentUser} />;
      case 'performance':
        return isOwner ? <PerformanceOverviewPage /> : <TeamLeaderDashboard />;
      case 'daily-summary':
        return isOwner ? <DailySummaryAnalyticsLedger /> : <TeamLeaderDashboard />;
      case 'targets':
        return isOwner ? <MonthlyTargetPlanPage /> : <TeamLeaderDashboard />;
      case 'attendance':
        return <AttendancePage />;
      case 'sales':
        return isOwner ? <IvrAndAppActivationsHub currentUser={currentUser} /> : <SalesSummaryPage />;
      case 'teams':
        return isOwner ? <OwnerCareerManagementPage /> : <TeamLeaderDashboard />;
      case 'reports':
        return <SalesSummaryPage />;
      case 'employees':
        return isOwner ? <OwnerUserAccessManagementPage /> : <TeamLeaderDashboard />;
      case 'devices':
        return isOwner ? <AppDownloadStatusMonitor /> : <TeamLeaderDashboard />;
      case 'messages':
        return <MessageRoomPage />;
      case 'presentation':
        return isOwner ? <MonthEndPresentationPage /> : <TeamLeaderDashboard />;
      case 'payments':
        return isOwner ? <OwnerCommissionControl /> : <TeamLeaderDashboard />;
      case 'history':
        return isOwner ? (
          <div className="space-y-6">
            <DataRetentionCenter />
            <AnnualArchivePage role="owner" />
          </div>
        ) : (
          <TeamLeaderDashboard />
        );
      case 'settings':
        return <SettingsPage />;
      default:
        return isOwner ? <OwnerDashboardConsole /> : <TeamLeaderDashboard />;
    }
  };

  return (
    <TargetShell target="management">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Navigation Bar */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.route;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dynamic Route Content */}
        <main className="flex-1">{renderRouteContent()}</main>
      </div>
    </TargetShell>
  );
};

export default ManagementMainApp;
