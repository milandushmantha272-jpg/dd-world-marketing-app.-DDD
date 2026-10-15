import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

interface PageHeaderBannerProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  badgeText?: string;
  badgeColor?: 'blue' | 'amber' | 'emerald' | 'purple';
}

export const PageHeaderBanner: React.FC<PageHeaderBannerProps> = ({
  number,
  title,
  description,
  icon: Icon,
  features,
  badgeText = 'DD WORLD OFFICIAL FEATURE',
  badgeColor = 'blue',
}) => {
  const getBadgeStyle = () => {
    switch (badgeColor) {
      case 'amber':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'purple':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-lg text-white">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-black text-blue-400 font-mono tracking-wider">
                [{number}]
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">{title}</h2>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getBadgeStyle()}`}
              >
                {badgeText}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3">{description}</p>

            {/* Bulleted list of page features */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
