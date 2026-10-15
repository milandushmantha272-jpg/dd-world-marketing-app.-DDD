import React from 'react';
import { Activity, Database, Server } from 'lucide-react';

export const DataIntegritySystemHealth: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <Activity className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold text-sm">System Health & Firebase Integrity</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Firestore Status</span>
          </div>
          <p className="font-bold text-emerald-400">Connected & Synced</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-amber-400" />
            <span>Capacitor Native GPS</span>
          </div>
          <p className="font-bold text-emerald-400">Bridge Ready</p>
        </div>
      </div>
    </div>
  );
};
