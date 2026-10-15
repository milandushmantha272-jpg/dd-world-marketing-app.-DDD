import React from 'react';
import { Home, TrendingUp, ShieldCheck, MoreHorizontal } from 'lucide-react';

export type MobileNavTab = 'home' | 'sales' | 'verify' | 'more';

interface MobileBottomNavProps {
  activeTab: MobileNavTab;
  onTabChange: (tab: MobileNavTab) => void;
  onMoreClick?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onMoreClick,
}) => {
  const navItems: { id: MobileNavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'verify', label: 'Verify', icon: ShieldCheck },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <div className="w-full bg-white border-t border-slate-100 py-2 px-6 flex items-center justify-between shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-20">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'more' && onMoreClick) {
                onMoreClick();
              } else {
                onTabChange(item.id);
              }
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-200 select-none py-1 px-3 rounded-xl ${
              isActive ? 'text-[#E53935]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-[#E53935]' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
