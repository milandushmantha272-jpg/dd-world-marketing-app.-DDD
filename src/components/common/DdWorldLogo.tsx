import React, { useState } from 'react';

interface DdWorldLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const DdWorldLogo: React.FC<DdWorldLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { img: 'w-8 h-8', px: 32, textDd: 'text-xs', textSub: 'text-[8px]' },
    md: { img: 'w-11 h-11', px: 44, textDd: 'text-sm', textSub: 'text-[10px]' },
    lg: { img: 'w-16 h-16', px: 64, textDd: 'text-lg', textSub: 'text-xs' },
    xl: { img: 'w-24 h-24', px: 96, textDd: 'text-2xl', textSub: 'text-sm' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {!imgError ? (
        <div className="relative group flex flex-col items-center">
          <img
            src="/official-logo.png"
            alt="DD WORLD MARKETING"
            className={`${current.img} object-contain rounded-xl bg-white p-0.5 shadow-md border border-slate-200/50 transition-transform duration-200 group-hover:scale-105`}
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        /* Vector Leaf + Wave + Fish Fallback */
        <div className="flex flex-col items-center">
          {showText && (
            <span className={`font-black tracking-tight text-blue-950 dark:text-blue-200 font-sans ${current.textDd} leading-none mb-0.5`}>
              DD
            </span>
          )}
          <svg
            width={current.px}
            height={current.px}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-sm transition-transform hover:scale-105 duration-200"
          >
            <defs>
              <linearGradient id="leafGradFallback" x1="20" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#43B02A" />
                <stop offset="100%" stopColor="#226E12" />
              </linearGradient>
              <linearGradient id="waveGradFallback" x1="100" y1="50" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00A3FF" />
                <stop offset="50%" stopColor="#0072CE" />
                <stop offset="100%" stopColor="#0A2569" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="92" fill="#ffffff" />
            <path
              d="M 100 180 C 145 180 180 145 180 100 C 180 65 155 40 120 40 C 130 55 140 70 135 90 C 130 110 110 115 105 130 C 100 145 110 160 125 160 C 140 160 155 145 150 125 C 145 110 130 105 130 100 C 130 90 145 80 160 90 C 170 115 165 150 140 170 C 125 180 110 180 100 180 Z"
              fill="url(#waveGradFallback)"
            />
            {/* Small fish in wave */}
            <g transform="translate(115, 145) scale(0.6)">
              <path d="M 0 10 C 10 0 25 0 35 10 C 25 20 10 20 0 10 Z" fill="#8CE3FE" />
              <path d="M 35 10 L 45 3 L 42 10 L 45 17 Z" fill="#38BDF8" />
              <circle cx="8" cy="8" r="2" fill="#0A2569" />
            </g>
            {/* Green Leaf */}
            <path
              d="M 100 180 C 50 180 20 140 20 90 C 20 40 60 20 90 20 C 75 45 65 80 75 115 C 85 140 95 165 100 180 Z"
              fill="url(#leafGradFallback)"
            />
            {/* Wheat sprig on leaf */}
            <path d="M 85 30 C 75 70 65 115 100 180" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8" />
            <g fill="#ffffff" opacity="0.9">
              <ellipse cx="76" cy="100" rx="3" ry="6" transform="rotate(-30 76 100)" />
              <ellipse cx="84" cy="94" rx="3" ry="6" transform="rotate(20 84 94)" />
              <ellipse cx="72" cy="115" rx="3" ry="6" transform="rotate(-35 72 115)" />
              <ellipse cx="82" cy="108" rx="3" ry="6" transform="rotate(25 82 108)" />
            </g>
          </svg>
          {showText && (
            <span className={`font-black tracking-wider text-emerald-600 dark:text-emerald-400 font-sans ${current.textSub} uppercase mt-0.5`}>
              WORLD MARKETING
            </span>
          )}
        </div>
      )}
    </div>
  );
};

