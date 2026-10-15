import React from 'react';
import { DdWorldLogoFull, DialogLogo, WaveTopAccent, WaveBottomAccent } from './DdWorldBranding';
import { ArrowRight } from 'lucide-react';

interface MobileSplashScreenProps {
  onContinue: () => void;
}

export const MobileSplashScreen: React.FC<MobileSplashScreenProps> = ({ onContinue }) => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-white relative overflow-hidden select-none">
      {/* Top Wave Graphic */}
      <WaveTopAccent className="w-full absolute top-0 left-0" />

      {/* Center Branding Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pt-16 pb-8">
        <div className="animate-fade-in flex flex-col items-center">
          <DdWorldLogoFull size="xl" showTagline={true} />

          {/* Dialog Partnership Emblem */}
          <div className="mt-8 pt-4">
            <DialogLogo size={28} showPoweredBy={true} />
          </div>

          <button
            onClick={onContinue}
            className="mt-10 group flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span>ඇතුළු වන්න (Continue)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Wave Graphic */}
      <WaveBottomAccent className="w-full relative z-0" />
    </div>
  );
};
