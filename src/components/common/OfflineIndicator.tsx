import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudLightning, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { OfflineSyncManager, OfflineQueuedAction } from '../../utils/offlineSyncManager';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [queuedActions, setQueuedActions] = useState<OfflineQueuedAction[]>([]);
  const [wasOffline, setWasOffline] = useState(false);
  const [syncingQueue, setSyncingQueue] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Subscribe to offline queue
  useEffect(() => {
    const unsubscribe = OfflineSyncManager.subscribe((queue) => {
      setQueuedActions(queue);
    });
    return unsubscribe;
  }, []);

  // Track reconnection
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // Reconnected!
      handleReconnectionSync();
    }
  }, [isOnline, wasOffline]);

  const handleReconnectionSync = async () => {
    setSyncingQueue(true);
    try {
      const count = await OfflineSyncManager.flushQueue();
      if (count > 0) {
        setSyncSuccessMessage(`✅ Reconnected: ${count} offline updates synced with cloud.`);
      } else {
        setSyncSuccessMessage('✅ Connection restored. All services online.');
      }
    } catch {
      // Fallback
    } finally {
      setSyncingQueue(false);
      setTimeout(() => {
        setWasOffline(false);
        setSyncSuccessMessage(null);
      }, 4000);
    }
  };

  // 1. Reconnection banner
  if (syncSuccessMessage) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow-2xl shadow-emerald-950/60 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{syncSuccessMessage}</span>
      </div>
    );
  }

  // 2. Currently offline banner
  if (!isOnline) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/95 border border-amber-500/60 text-amber-300 text-xs font-semibold shadow-2xl shadow-amber-950/80 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 max-w-[90vw] sm:max-w-md">
        <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white flex items-center gap-1.5">
            <span>Offline Mode Active</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              Service Worker Cached
            </span>
          </div>
          <p className="text-[11px] text-amber-200/80 truncate">
            {queuedActions.length > 0
              ? `${queuedActions.length} changes queued locally • Auto-sync on reconnect`
              : 'Platform cached offline • You can continue browsing & logging'}
          </p>
        </div>
      </div>
    );
  }

  return null;
};
