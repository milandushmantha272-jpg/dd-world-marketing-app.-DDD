import React from 'react';
import { X, MapPin } from 'lucide-react';

export const DayStartWorkAreaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full text-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold">දෛනික සේවා ප්‍රදේශය (Day Start Work Area)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-300">
          අද දින රාජකාරී ආරම්භ කරන ප්‍රදේශය සහ පළාත සටහන් කරන්න.
        </p>
        <button onClick={onClose} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs">
          සුරකින්න (Confirm)
        </button>
      </div>
    </div>
  );
};
