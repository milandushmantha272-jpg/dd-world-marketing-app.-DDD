import React from 'react';

interface DdWorldMarketingLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'banner';
  showDetails?: boolean;
  className?: string;
}

export const DdWorldMarketingLogo: React.FC<DdWorldMarketingLogoProps> = ({
  size = 'md',
  showDetails = true,
  className = '',
}) => {
  // Dimensions based on size
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    banner: 'w-16 h-16 sm:w-20 sm:h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    banner: 'text-2xl sm:text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Visual Logo Mark: Green Leaf & Blue Sea Wave circle */}
      <div
        className={`${iconSizes[size]} rounded-2xl bg-slate-950 p-1.5 border-2 border-slate-700/80 shadow-lg flex items-center justify-center shrink-0 relative group overflow-hidden`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top Green Leaf segment (Govimithuru) */}
          <path
            d="M50 10 C 75 10, 90 30, 85 50 C 70 45, 55 35, 50 10 Z"
            fill="url(#leafGradient)"
          />
          <path
            d="M50 10 C 25 15, 15 35, 25 55 C 35 45, 45 30, 50 10 Z"
            fill="#4ADE80"
            opacity="0.85"
          />

          {/* Bottom Blue Ocean Wave segment (Sayuru) */}
          <path
            d="M15 50 C 10 75, 30 90, 50 90 C 75 90, 90 75, 85 55 C 70 70, 40 70, 15 50 Z"
            fill="url(#waveGradient)"
          />
          <path
            d="M30 60 C 45 60, 60 70, 75 60 C 65 80, 40 85, 30 60 Z"
            fill="#38BDF8"
            opacity="0.9"
          />

          {/* Center DD Text */}
          <text
            x="50"
            y="57"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="30"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="-1"
          >
            DD
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" />
              <stop offset="100%" stopColor="#15803D" />
            </linearGradient>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Company Text & Contact Details */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-black tracking-tight text-white ${textSizes[size]}`}>
            <span className="text-emerald-400">DD</span> WORLD MARKETING
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Official
          </span>
        </div>

        {showDetails && (
          <div className="text-[10px] sm:text-xs text-slate-400 space-y-0.5 mt-0.5">
            <div className="flex items-center gap-2 flex-wrap text-slate-300">
              <span>📍 44/c, Galabodawatha, Niungama, Piliyandala</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap font-mono text-[10px] text-amber-300/90">
              <span>📞 0767046094</span>
              <span>✉️ d.d.worldmarketing1234@gmail.com</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
