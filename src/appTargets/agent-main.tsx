import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TargetShell } from '../components/shell/TargetShell';
import { AgentDashboard } from '../components/agent/AgentDashboard';
import { AttendancePage } from '../components/common/AttendancePage';
import { SalesSummaryPage } from '../components/common/SalesSummaryPage';
import { PersonalProfileKycPage } from '../components/common/PersonalProfileKycPage';
import { CommissionPaymentPage } from '../components/common/CommissionPaymentPage';
import { MessageRoomPage } from '../components/common/MessageRoomPage';
import { SettingsPage } from '../components/common/SettingsPage';
import { MobileAppExperience } from '../components/mobile/MobileAppExperience';
import {
  Smartphone,
  Home,
  CalendarCheck,
  TrendingUp,
  FileText,
  User,
  Wallet,
  MessageSquare,
  Settings,
} from 'lucide-react';

export type AgentAppTab =
  | 'mobile_app'
  | 'dashboard'
  | 'attendance'
  | 'sales'
  | 'reports'
  | 'profile'
  | 'payment'
  | 'messages'
  | 'settings';

export const AgentMainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<AgentAppTab>('mobile_app');

  if (!currentUser) return null;

  // Enforce compile-time & runtime RBAC: only agent
  if (currentUser.role !== 'agent') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-3xl max-w-md">
          <h2 className="text-xl font-bold text-red-400">අවසර සීමාව ඉක්මවා ඇත (RBAC Restriction)</h2>
          <p className="text-xs text-slate-400 mt-2">
            මෙම යෙදුම වෙන් කර ඇත්තේ ක්ෂේත්‍ර නියෝජිතයින් (Field Agents) සඳහා පමණි.
          </p>
        </div>
      </div>
    );
  }

  const tabsConfig = [
    { id: 'mobile_app', label: '📱 Mobile App View (Mockup)', icon: Smartphone },
    { id: 'dashboard', label: '📊 Field Operations Hub', icon: Home },
    { id: 'attendance', label: 'පැමිණීම (Attendance)', icon: CalendarCheck },
    { id: 'sales', label: 'විකුණුම් (Sales)', icon: TrendingUp },
    { id: 'reports', label: 'වාර්තා (Reports)', icon: FileText },
    { id: 'profile', label: 'පැතිකඩ (Profile)', icon: User },
    { id: 'payment', label: 'කොමිස් (Payment)', icon: Wallet },
    { id: 'messages', label: 'පණිවිඩ (Messages)', icon: MessageSquare },
    { id: 'settings', label: 'සැකසුම් (Settings)', icon: Settings },
  ];

  // Independent mounting/unmounting of pages
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'mobile_app':
        return <MobileAppExperience />;
      case 'dashboard':
        return <AgentDashboard />;
      case 'attendance':
        return <AttendancePage />;
      case 'sales':
      case 'reports':
        return <SalesSummaryPage />;
      case 'profile':
        return <PersonalProfileKycPage />;
      case 'payment':
        return <CommissionPaymentPage />;
      case 'messages':
        return <MessageRoomPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <MobileAppExperience />;
    }
  };

  return (
    <TargetShell target="agent">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Navigation Bar */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AgentAppTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Dynamic Route Lifecycle Component */}
        <main className="flex-1">
          {renderActiveTabContent()}
        </main>
      </div>
    </TargetShell>
  );
};

export default AgentMainApp;
