import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TargetShell } from '../components/shell/TargetShell';
import { DailySummaryAnalyticsLedger } from '../components/owner/pages/DailySummaryAnalyticsLedger';
import { AttendancePage } from '../components/common/AttendancePage';
import { SalesSummaryPage } from '../components/common/SalesSummaryPage';
import { MessageRoomPage } from '../components/common/MessageRoomPage';
import { SettingsPage } from '../components/common/SettingsPage';
import { AuditTrailPage } from '../components/owner/pages/AuditTrailPage';
import { IvrAndAppActivationsHub } from '../components/owner/IvrAndAppActivationsHub';
import {
  ShieldCheck,
  BarChart2,
  CalendarCheck,
  TrendingUp,
  MessageSquare,
  Settings,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';

export const AuditMainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'audit_trail' | 'activations' | 'attendance' | 'sales' | 'messages' | 'settings'>('analytics');

  if (!currentUser) return null;

  // RBAC for audit portal: [dialog_officer, owner]
  if (currentUser.role !== 'dialog_officer' && currentUser.role !== 'owner') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-md">
          <h2 className="text-xl font-bold text-red-400">අවසර සීමාව ඉක්මවා ඇත (RBAC Restriction)</h2>
          <p className="text-xs text-slate-400 mt-2">
            මෙම විගණන කවුළුව වෙන් කර ඇත්තේ Dialog Axiata Officer සඳහා පමණි.
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'analytics', label: 'දෛනික විගණන ලෙජරය (Audit Ledger)', icon: BarChart2 },
    { id: 'audit_trail', label: 'ආරක්ෂක ලොග් (Audit Trail Logs)', icon: ShieldAlert },
    { id: 'activations', label: 'USSD සක්‍රියතා විගණනය (Activations Hub)', icon: Smartphone },
    { id: 'attendance', label: 'පැමිණීම් විගණනය (Attendance)', icon: CalendarCheck },
    { id: 'sales', label: 'විකුණුම් විගණනය (Sales Summary)', icon: TrendingUp },
    { id: 'messages', label: 'නිල නිවේදන (Notices)', icon: MessageSquare },
    { id: 'settings', label: 'සැකසුම් (Settings)', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <DailySummaryAnalyticsLedger />;
      case 'audit_trail':
        return <AuditTrailPage />;
      case 'activations':
        return <IvrAndAppActivationsHub currentUser={currentUser} />;
      case 'attendance':
        return <AttendancePage />;
      case 'sales':
        return <SalesSummaryPage />;
      case 'messages':
        return <MessageRoomPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DailySummaryAnalyticsLedger />;
    }
  };

  return (
    <TargetShell target="audit">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
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

        <main className="flex-1">{renderContent()}</main>
      </div>
    </TargetShell>
  );
};

export default AuditMainApp;
