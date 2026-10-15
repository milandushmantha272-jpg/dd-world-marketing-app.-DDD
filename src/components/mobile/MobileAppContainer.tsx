import React, { useState } from 'react';
import { Wifi, Battery, Smartphone, Monitor } from 'lucide-react';

interface MobileAppContainerProps {
  children: React.ReactNode;
  currentTime?: string;
  className?: string;
  allowFrameToggle?: boolean;
}

export const MobileAppContainer: React.FC<MobileAppContainerProps> = ({
  children,
  currentTime = '9:41',
  className = '',
  allowFrameToggle = true,
}) => {
  // Check if saved preference exists or screen is desktop
  const [isFrameMode, setIsFrameMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return false; // Mobile screens should always be native full viewport
    }
    return true; // Desktop preview default as realistic phone frame matching mockup
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900 flex flex-col items-center justify-center relative p-0 sm:p-4 select-none">
      {/* Frame / Viewport Mode Switcher for Desktop */}
      {allowFrameToggle && (
        <div className="hidden sm:flex fixed top-3 right-4 z-50 items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-full shadow-2xl text-xs font-bold text-slate-300">
          <span className="text-[11px] text-slate-400">View Mode:</span>
          <button
            onClick={() => setIsFrameMode(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
              isFrameMode
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile Device Mockup View (1:1 with design)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Frame</span>
          </button>
          <button
            onClick={() => setIsFrameMode(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
              !isFrameMode
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Responsive Fullscreen View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div
        className={`w-full bg-white relative flex flex-col overflow-hidden transition-all duration-300 ${
          isFrameMode
            ? 'max-w-[420px] h-[910px] max-h-[96vh] rounded-[48px] shadow-[0_25px_70px_rgba(0,0,0,0.6)] border-[9px] border-slate-900 ring-1 ring-slate-800'
            : 'max-w-2xl min-h-screen sm:rounded-3xl sm:my-4 sm:shadow-2xl sm:border border-slate-200'
        } ${className}`}
      >
        {/* Native Status Bar */}
        <div className="w-full pt-3 px-6 pb-1 flex items-center justify-between text-slate-900 font-semibold text-xs tracking-tight shrink-0 select-none z-30">
          {/* Time */}
          <span className="font-bold tracking-normal">{currentTime}</span>

          {/* Notch / Dynamic Island pill on phone frame */}
          {isFrameMode && (
            <div className="w-20 h-4 bg-slate-950 rounded-full flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800 inline-block mr-1" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 inline-block" />
            </div>
          )}

          {/* Right Status Icons */}
          <div className="flex items-center gap-1.5">
            {/* Cellular signal bars */}
            <svg width="15" height="11" viewBox="0 0 17 11" fill="none" className="shrink-0">
              <rect x="0" y="8" width="3" height="3" rx="0.5" fill="currentColor" />
              <rect x="4.5" y="5.5" width="3" height="5.5" rx="0.5" fill="currentColor" />
              <rect x="9" y="3" width="3" height="8" rx="0.5" fill="currentColor" />
              <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="currentColor" />
            </svg>

            {/* Wi-Fi */}
            <Wifi className="w-3.5 h-3.5" />

            {/* Battery */}
            <div className="flex items-center gap-0.5">
              <div className="w-5 h-2.5 border border-slate-900 rounded-[3px] p-[1px] flex items-center">
                <div className="h-full w-[85%] bg-slate-900 rounded-[1px]" />
              </div>
              <div className="w-[1.5px] h-1 bg-slate-900 rounded-r-[1px]" />
            </div>
          </div>
        </div>

        {/* Scrollable / Renderable App Viewport */}
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative scrollbar-none">
          {children}
        </div>

        {/* Home Indicator Bar (iOS / Android gesture pill) */}
        <div className="w-full py-1.5 flex justify-center shrink-0 bg-transparent pointer-events-none select-none z-30">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
