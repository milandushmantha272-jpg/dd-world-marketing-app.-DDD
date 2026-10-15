/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { CallNotificationModal } from './components/common/CallNotificationModal';
import { ActiveCallOverlay } from './components/common/ActiveCallOverlay';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { safeStorage } from './utils/safeStorage';

// Compile-Time Target Detection
const COMPILE_TARGET = import.meta.env.VITE_APP_TARGET as string | undefined;

// Lazy-loaded target applications for compile-time and runtime tree-shaking
const AgentMainApp = React.lazy(() => import('./appTargets/agent-main'));
const ManagementMainApp = React.lazy(() => import('./appTargets/management-main'));
const AuditMainApp = React.lazy(() => import('./appTargets/audit-main'));

const LoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
      <span className="text-xs font-bold text-slate-400">DD WORLD Platform Initializing...</span>
    </div>
  </div>
);

const GlobalCallContainer: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeCall, acceptCall, rejectCall, endCall } = useData();

  if (!activeCall || !currentUser) return null;

  if (activeCall.status === 'ringing') {
    const isReceiver = activeCall.receiverId === currentUser.id;
    const isCaller = activeCall.callerId === currentUser.id;

    if (isReceiver) {
      return (
        <CallNotificationModal
          isCaller={false}
          callerName={activeCall.callerName}
          callerRole={activeCall.callerRole}
          receiverName={activeCall.receiverName}
          callType={activeCall.type}
          onAccept={acceptCall}
          onReject={rejectCall}
        />
      );
    }

    if (isCaller) {
      return (
        <CallNotificationModal
          isCaller={true}
          callerName={activeCall.callerName}
          callerRole={activeCall.callerRole}
          receiverName={activeCall.receiverName}
          callType={activeCall.type}
          onAccept={acceptCall}
          onReject={endCall}
        />
      );
    }
  }

  if (activeCall.status === 'connected') {
    const isParticipant = activeCall.callerId === currentUser.id || activeCall.receiverId === currentUser.id;
    if (isParticipant) {
      return <ActiveCallOverlay />;
    }
  }

  return null;
};

const AppRouterContent: React.FC = () => {
  const { currentUser } = useAuth();
  const [updateNotice, setUpdateNotice] = React.useState<string | null>(null);

  // Automatic legacy link sync & clean-up
  React.useEffect(() => {
    try {
      const APP_VERSION = '2026.8.07-v5.3';
      const storedVersion = safeStorage.getItem('ddworld_platform_app_version');

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('ref') || urlParams.has('v') || urlParams.has('chat') || urlParams.has('open') || urlParams.has('old_link')) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setUpdateNotice('🛑 Direct Web/Chat Landing අත්හිටුවා ඇත: DD WORLD Official Mobile App Portal එක වෙත යොමු කෙරිණි!');
        setTimeout(() => setUpdateNotice(null), 6000);
      } else if (storedVersion !== APP_VERSION) {
        safeStorage.setItem('ddworld_platform_app_version', APP_VERSION);
        setUpdateNotice('📱 DD WORLD පද්ධතිය නවතම Mobile App (v5.3) එක සමඟ Synchronize විය!');
        setTimeout(() => setUpdateNotice(null), 5000);
      }
    } catch (e) {
      console.warn('App version check sync error:', e);
    }
  }, []);

  // Request GPS & Notification Permissions
  React.useEffect(() => {
    if (currentUser) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('GPS Location permission auto-acquired:', pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            console.warn('GPS Permission pending or denied:', err.message);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }

      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [currentUser]);

  // If not logged in, strictly show login modal (No public registration allowed)
  if (!currentUser) {
    return <LoginModal />;
  }

  // 1. STRICT COMPILE-TIME TARGET SPLIT
  if (COMPILE_TARGET === 'agent') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AgentMainApp />
        <GlobalCallContainer />
        <OfflineIndicator />
      </Suspense>
    );
  }

  if (COMPILE_TARGET === 'management') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <ManagementMainApp />
        <GlobalCallContainer />
        <OfflineIndicator />
      </Suspense>
    );
  }

  if (COMPILE_TARGET === 'audit') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AuditMainApp />
        <GlobalCallContainer />
        <OfflineIndicator />
      </Suspense>
    );
  }

  // 2. RUNTIME RBAC TARGET ROUTING (When compile target is universal)
  const isAgent = currentUser?.role === 'agent';
  const isManagement = currentUser?.role === 'owner' || currentUser?.role === 'team_leader' || currentUser?.role === 'junior_team_leader';
  const isAudit = currentUser?.role === 'dialog_officer';

  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* Notice Banner */}
      {updateNotice && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-xs font-bold py-2 px-4 text-center shadow-lg flex items-center justify-center gap-2 animate-pulse border-b border-white/20 z-50">
          <span>{updateNotice}</span>
          <button
            onClick={() => setUpdateNotice(null)}
            className="ml-2 text-white/80 hover:text-white text-sm font-extrabold"
          >
            ✕
          </button>
        </div>
      )}

      <Routes>
        {isAgent && (
          <>
            <Route path="/*" element={<AgentMainApp />} />
          </>
        )}

        {isManagement && (
          <>
            <Route path="/management/*" element={<ManagementMainApp />} />
            <Route path="/*" element={<Navigate to="/management/dashboard" replace />} />
          </>
        )}

        {isAudit && (
          <>
            <Route path="/*" element={<AuditMainApp />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <GlobalCallContainer />
      <OfflineIndicator />
    </Suspense>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <AuthProvider>
          <AppRouterContent />
        </AuthProvider>
      </DataProvider>
    </BrowserRouter>
  );
}
