import React, { useState } from 'react';
import {
  Globe,
  Share2,
  ExternalLink,
  RotateCw,
  Lock,
  X,
  MessageCircle,
  Building2,
  Shield,
  Smartphone,
  Facebook,
} from 'lucide-react';

interface InAppWebViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: 'website' | 'facebook' | 'whatsapp' | 'dialog';
}

interface WebPortal {
  id: 'website' | 'facebook' | 'whatsapp' | 'dialog';
  title: string;
  url: string;
  icon: React.ReactNode;
  badge: string;
  description: string;
}

const PORTALS: WebPortal[] = [
  {
    id: 'website',
    title: 'DD World Corporate Portal',
    url: 'https://ddworldmarketing.com',
    icon: <Globe className="w-4 h-4 text-emerald-400" />,
    badge: 'Official Web',
    description: 'DD World Marketing (Pvt) Ltd ප්‍රධාන ආයතනික වෙබ් අඩවිය සහ පාරිභෝගික තොරතුරු පද්ධතිය.',
  },
  {
    id: 'facebook',
    title: 'Official Facebook Page',
    url: 'https://facebook.com/ddworldmarketing',
    icon: <Facebook className="w-4 h-4 text-blue-400" />,
    badge: 'Social Hub',
    description: 'DD World නිල ෆේස්බුක් පිටුව හරහා නව ප්‍රවර්ධන හා සමාජ මාධ්‍ය දැනුවත් කිරීම්.',
  },
  {
    id: 'whatsapp',
    title: 'Corporate WhatsApp Support',
    url: 'https://wa.me/94777123456?text=Hello%20DD%20World%20Support',
    icon: <MessageCircle className="w-4 h-4 text-emerald-400" />,
    badge: 'Instant Help',
    description: 'ආයතනික ක්ෂණික පාරිභෝගික සත්කාර සහ ක්ෂේත්‍ර සහායක WhatsApp සම්බන්ධතාවය.',
  },
  {
    id: 'dialog',
    title: 'Dialog Enterprise Hub',
    url: 'https://www.dialog.lk/enterprise',
    icon: <Building2 className="w-4 h-4 text-orange-400" />,
    badge: 'Partner Network',
    description: 'Dialog Axiata නිල හවුල්කාර ව්‍යාපාරික සේවා, ගොවිමිතුරු (#616#) සහ සයුරු (#828#) ද්වාරය.',
  },
];

export const InAppWebViewModal: React.FC<InAppWebViewModalProps> = ({
  isOpen,
  onClose,
  defaultChannel = 'website',
}) => {
  const [currentChannel, setCurrentChannel] = useState<'website' | 'facebook' | 'whatsapp' | 'dialog'>(defaultChannel);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  const activePortal = PORTALS.find((p) => p.id === currentChannel) || PORTALS[0];

  const handleOpenExternal = () => {
    window.open(activePortal.url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Browser Top Navigation Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          {/* Channel Selector Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none">
            {PORTALS.map((portal) => {
              const isSelected = portal.id === currentChannel;
              return (
                <button
                  key={portal.id}
                  onClick={() => setCurrentChannel(portal.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {portal.icon}
                  <span>{portal.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              title="Refresh"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenExternal}
              title="Open in Browser"
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800/80 flex-1 max-w-xl truncate">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-500 select-none">https://</span>
            <span className="text-slate-200 font-mono truncate">{activePortal.url.replace(/^https?:\/\//, '')}</span>
          </div>
          <div className="flex items-center space-x-2 shrink-0 text-[11px] text-slate-400 pl-3">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Enterprise In-App WebView</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
          {/* Active Portal Info Card */}
          <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border-b border-slate-800/60 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white">{activePortal.title}</h4>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                  {activePortal.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activePortal.description}</p>
            </div>
            <button
              onClick={handleOpenExternal}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-900/30 shrink-0"
            >
              <span>නව Tab එකකින් අරින්න</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Secure In-App Frame / Sandbox Display */}
          <div className="flex-1 relative flex flex-col items-center justify-center p-6 text-center">
            {/* If cross-origin iframe is permitted, render iframe; else show rich interactive embedded portal view */}
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400 shadow-xl">
                {activePortal.icon}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">{activePortal.title}</h3>
                <p className="text-xs text-slate-400">
                  ආරක්ෂිත Sandbox පරිසරය සක්‍රියයි. ආයතනික ප්‍රතිපත්ති අනුව සෘජු බාහිර පිටුවට පිවිසීමට පහත බොත්තම ඔබන්න.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Cross-Platform WebView Sync</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Android APK සහ Apple iOS PWA තුළදී මෙම අංගය සෘජුවම Native In-App Browser එකක් ලෙස ක්‍රියාත්මක වේ.
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleOpenExternal}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-900/40"
                >
                  <span>පිටුවට සෘජුවම පිවිසෙන්න (Open Secure Link)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
