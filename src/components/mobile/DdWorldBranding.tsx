import React from 'react';

/**
 * Exact D.D. WORLD MARKETING Vector Brand System
 * Matching the official logo & Dialog partnership in the 10-screen app mockup.
 */

interface EmblemProps {
  size?: number;
  className?: string;
  showFallbackText?: boolean;
}

export const DdWorldEmblem: React.FC<EmblemProps> = ({ size = 64, className = '' }) => {
  const [useFallback, setUseFallback] = React.useState(false);

  if (!useFallback) {
    return (
      <img
        src="/official-logo.png"
        alt="DD WORLD MARKETING"
        width={size}
        height={size}
        onError={() => setUseFallback(true)}
        className={`rounded-full object-contain shrink-0 drop-shadow-md select-none bg-white p-0.5 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Pixel-accurate vector representation of photo.jpg
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-md select-none ${className}`}
    >
      <defs>
        <linearGradient id="leafGrad" x1="40" y1="40" x2="100" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#43B02A" />
          <stop offset="100%" stopColor="#226E12" />
        </linearGradient>
        <linearGradient id="waveGrad" x1="90" y1="50" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00A3FF" />
          <stop offset="50%" stopColor="#0072CE" />
          <stop offset="100%" stopColor="#0A2569" />
        </linearGradient>
      </defs>
      {/* White circular badge */}
      <circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

      {/* "DD" top text */}
      <text
        x="100"
        y="45"
        textAnchor="middle"
        fontSize="34"
        fontWeight="900"
        fill="#0D2E68"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="1"
      >
        DD
      </text>

      {/* Swirling ocean wave on right */}
      <path
        d="M 100 170 C 145 170 175 140 175 95 C 175 60 150 45 120 45 C 130 60 140 75 135 95 C 130 115 110 120 105 135 C 100 150 110 162 125 162 C 140 162 155 148 150 128 C 145 112 130 108 130 102 C 130 92 145 82 160 92 C 170 116 164 150 138 168 C 124 176 110 170 100 170 Z"
        fill="url(#waveGrad)"
      />

      {/* Small fish inside wave */}
      <g transform="translate(108, 142) scale(0.7)">
        <path d="M 0 10 C 10 0 25 0 35 10 C 25 20 10 20 0 10 Z" fill="#8CE3FE" />
        <path d="M 35 10 L 45 3 L 42 10 L 45 17 Z" fill="#38BDF8" />
        <circle cx="8" cy="8" r="2.5" fill="#0A2569" />
      </g>

      {/* Green leaf on left */}
      <path
        d="M 100 170 C 50 170 25 135 25 90 C 25 45 60 25 90 25 C 75 50 65 85 75 120 C 85 145 95 165 100 170 Z"
        fill="url(#leafGrad)"
      />

      {/* Wheat seeds on leaf */}
      <path d="M 85 35 C 75 75 65 120 100 170" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
      <g fill="#FFFFFF" opacity="0.95">
        <ellipse cx="76" cy="100" rx="3.5" ry="7" transform="rotate(-30 76 100)" />
        <ellipse cx="85" cy="94" rx="3.5" ry="7" transform="rotate(20 85 94)" />
        <ellipse cx="72" cy="118" rx="3.5" ry="7" transform="rotate(-35 72 118)" />
        <ellipse cx="83" cy="110" rx="3.5" ry="7" transform="rotate(25 83 110)" />
        <ellipse cx="89" cy="80" rx="3" ry="6" transform="rotate(15 89 80)" />
      </g>

      {/* "WORLD MARKETING" bottom text in green */}
      <text
        x="100"
        y="186"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill="#43B02A"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="2.5"
      >
        WORLD MARKETING
      </text>
    </svg>
  );
};

export const DdWorldLogoFull: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
}> = ({ size = 'md', variant = 'light', showTagline = false }) => {
  const isDark = variant === 'dark';

  const dimensions = {
    sm: { emblem: 36, title: 'text-sm', sub: 'text-[8px]', gap: 'gap-1.5' },
    md: { emblem: 52, title: 'text-lg', sub: 'text-[10px]', gap: 'gap-2' },
    lg: { emblem: 68, title: 'text-2xl', sub: 'text-xs', gap: 'gap-2.5' },
    xl: { emblem: 88, title: 'text-3xl', sub: 'text-sm', gap: 'gap-3' },
  }[size];

  return (
    <div className={`flex flex-col items-center text-center ${dimensions.gap}`}>
      <DdWorldEmblem size={dimensions.emblem} />
      <div className="flex flex-col items-center">
        <h1
          className={`font-black tracking-tight leading-none ${dimensions.title} ${
            isDark ? 'text-white' : 'text-[#0D3B66]'
          }`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          D.D. WORLD
        </h1>
        <span
          className={`font-extrabold uppercase tracking-[0.25em] leading-tight ${dimensions.sub} ${
            isDark ? 'text-slate-400' : 'text-[#1E88E5]'
          }`}
        >
          MARKETING
        </span>
      </div>

      {showTagline && (
        <p
          className={`italic font-serif text-xs md:text-sm mt-0.5 ${
            isDark ? 'text-slate-300' : 'text-[#0D3B66]/80'
          }`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Together for a Better Tomorrow
        </p>
      )}
    </div>
  );
};

export const DialogLogo: React.FC<{ size?: number; className?: string; showPoweredBy?: boolean; isDark?: boolean }> = ({
  size = 24,
  className = '',
  showPoweredBy = true,
  isDark = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {showPoweredBy && (
        <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Powered by
        </span>
      )}
      <div className="flex items-center gap-1">
        {/* Dialog Geometric Star Icon */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0"
        >
          {/* Top petal red */}
          <path d="M 20 2 L 26 14 L 20 20 L 14 14 Z" fill="#E53935" />
          {/* Right petal orange */}
          <path d="M 38 20 L 26 26 L 20 20 L 26 14 Z" fill="#FB8C00" />
          {/* Bottom petal yellow */}
          <path d="M 20 38 L 14 26 L 20 20 L 26 26 Z" fill="#FDD835" />
          {/* Left petal red/pink */}
          <path d="M 2 20 L 14 14 L 20 20 L 14 26 Z" fill="#D81B60" />
          {/* Top-right facet */}
          <path d="M 32 8 L 26 14 L 20 20 L 24 10 Z" fill="#F4511E" />
          {/* Bottom-right facet */}
          <path d="M 32 32 L 26 26 L 20 20 L 30 22 Z" fill="#FFB300" />
          {/* Bottom-left facet */}
          <path d="M 8 32 L 14 26 L 20 20 L 16 30 Z" fill="#E91E63" />
          {/* Top-left facet */}
          <path d="M 8 8 L 14 14 L 20 20 L 10 18 Z" fill="#C2185B" />
        </svg>

        <span
          className={`font-black tracking-tight text-base leading-none ${
            isDark ? 'text-white' : 'text-[#E53935]'
          }`}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Dialog
        </span>
      </div>
    </div>
  );
};

/**
 * Top Flowing Wave Graphic for Splash, Login, and Header
 */
export const WaveTopAccent: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 400 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 0 L 400 0 L 400 40 C 330 90 260 20 180 65 C 100 110 40 50 0 85 Z"
          fill="url(#waveGreenCyan)"
          opacity="0.9"
        />
        <path
          d="M 0 0 L 400 0 L 400 20 C 320 60 240 10 160 55 C 80 95 30 35 0 65 Z"
          fill="url(#waveCyanBlue)"
          opacity="0.75"
        />
        <defs>
          <linearGradient id="waveGreenCyan" x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#43A047" />
            <stop offset="50%" stopColor="#00ACC1" />
            <stop offset="100%" stopColor="#1E88E5" />
          </linearGradient>
          <linearGradient id="waveCyanBlue" x1="0" y1="0" x2="400" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00B0FF" />
            <stop offset="100%" stopColor="#0D47A1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/**
 * Bottom Flowing Wave Graphic for Splash and Login
 */
export const WaveBottomAccent: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`w-full overflow-hidden pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 400 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 100 L 400 100 L 400 60 C 320 20 250 80 170 35 C 90 -10 30 50 0 15 Z"
          fill="url(#waveBottomGrad)"
        />
        <path
          d="M 0 100 L 400 100 L 400 75 C 340 45 280 85 200 50 C 120 15 50 65 0 35 Z"
          fill="url(#waveBottomLight)"
          opacity="0.7"
        />
        <defs>
          <linearGradient id="waveBottomGrad" x1="0" y1="100" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E88E5" />
            <stop offset="60%" stopColor="#00ACC1" />
            <stop offset="100%" stopColor="#43A047" />
          </linearGradient>
          <linearGradient id="waveBottomLight" x1="0" y1="100" x2="400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00B0FF" />
            <stop offset="100%" stopColor="#69F0AE" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
