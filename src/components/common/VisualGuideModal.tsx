import React from 'react';
import { X, HelpCircle, Smartphone, MapPin } from 'lucide-react';

export const VisualGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full text-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold">DD WORLD App Kullanıcı Rehberi (User Guide)</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">GPS Background Tracking</h4>
              <p>දෛනික රාජකාරී කාලය තුළ පසුබිමින් සක්‍රීය වන GPS පද්ධතිය මගින් ස්ථානය සටහන් වේ.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white mb-1">Mobile App Synchronization</h4>
              <p>නොබැඳි (Offline) අවස්ථාවල සටහන් වන තොරතුරු අන්තර්ජාල සම්බන්ධතාවය ලැබුණු පසු ස්වයංක්‍රීයව Cloud එකට එකතුවේ.</p>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs">
          තේරුම් ගතිමි (Close)
        </button>
      </div>
    </div>
  );
};
