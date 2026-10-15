import React from 'react';
import { X, QrCode } from 'lucide-react';
import { User } from '../../types';

export const QrCodeVerificationModal: React.FC<{ isOpen: boolean; onClose: () => void; user?: User }> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-white text-center space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="font-bold text-sm">Official Employee QR Code</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white p-4 rounded-xl inline-block shadow-lg mx-auto">
          <QrCode className="w-32 h-32 text-slate-950" />
        </div>
        <div>
          <h4 className="font-bold text-white text-sm">{user?.name || 'Employee'}</h4>
          <p className="text-xs text-slate-400">Agent Code: {user?.agentCode || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};
