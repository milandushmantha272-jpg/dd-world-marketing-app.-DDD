import React from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneOff, Check, Shield, Video } from 'lucide-react';

interface CallNotificationModalProps {
  isCaller?: boolean;
  callerName: string;
  callerRole: 'owner' | 'team_leader' | 'agent';
  receiverName?: string;
  callType?: 'voice' | 'video';
  onAccept: () => void;
  onReject: () => void;
}

export const CallNotificationModal: React.FC<CallNotificationModalProps> = ({
  isCaller = false,
  callerName,
  callerRole,
  receiverName,
  callType = 'voice',
  onAccept,
  onReject,
}) => {
  const getRoleLabel = () => {
    switch (callerRole) {
      case 'owner':
        return 'Owner (අයිතිකරු)';
      case 'team_leader':
        return 'Team Leader (කණ්ඩායම් නායක)';
      default:
        return 'Agent';
    }
  };

  const displayName = isCaller ? (receiverName || 'DD WORLD Member') : callerName;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-blue-500/50 rounded-3xl shadow-2xl p-6 text-center relative overflow-hidden animate-pulse">
        {/* Top badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4">
          {isCaller ? (
            <>
              <PhoneOutgoing className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
              Outgoing Call (ඇමතුම යැවෙමින් පවතී...)
            </>
          ) : (
            <>
              <PhoneIncoming className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Incoming Call (ඇමතුමක් ලැබේ...)
            </>
          )}
        </div>

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30 text-white font-extrabold text-2xl border-2 border-blue-400/40">
          {displayName.charAt(0)}
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{displayName}</h3>
        <p className="text-xs text-blue-300 font-semibold mb-6 flex items-center justify-center gap-1.5">
          {callType === 'video' ? <Video className="w-3.5 h-3.5 text-purple-400" /> : <Phone className="w-3.5 h-3.5 text-emerald-400" />}
          {isCaller ? `Ringing on target device • HD ${callType.toUpperCase()}` : `${getRoleLabel()} • Secure DD WORLD Line`}
        </p>

        {/* Buttons */}
        {isCaller ? (
          <div className="mb-3">
            <button
              onClick={onReject}
              className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              Cancel Call (ඇමතුම අවලංගු කරන්න)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={onReject}
              className="py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <PhoneOff className="w-4 h-4 text-rose-400" />
              Reject (ප්‍රතික්ෂේප කරන්න)
            </button>

            <button
              onClick={onAccept}
              className="py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition transform active:scale-95 animate-bounce"
            >
              <Check className="w-4 h-4" />
              Accept / Answer (පිළිගන්න)
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <Shield className="w-3 h-3 text-emerald-400" />
          Authorized communication only (අවසර ලත් ඇමතුම්)
        </div>
      </div>
    </div>
  );
};

