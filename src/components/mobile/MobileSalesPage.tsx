import React, { useState } from 'react';
import {
  ArrowLeft,
  Filter,
  Sprout,
  Waves,
  Smartphone,
  Wifi,
  Tv,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

interface MobileSalesPageProps {
  onBack: () => void;
  onSelectService: (service: 'govimithuru' | 'sayuru') => void;
}

export const MobileSalesPage: React.FC<MobileSalesPageProps> = ({
  onBack,
  onSelectService,
}) => {
  const [filter, setFilter] = useState<'all' | 'govimithuru' | 'sayuru'>('all');
  const [selectedOther, setSelectedOther] = useState<string | null>(null);

  const services = [
    {
      id: 'govimithuru',
      name: 'Govimithuru',
      category: 'govimithuru',
      subtitle: 'Digital Agriculture Service',
      icon: Sprout,
      iconBg: 'bg-emerald-500',
      badge: 'Code: #616#',
      clickable: true,
    },
    {
      id: 'sayuru',
      name: 'Sayuru',
      category: 'sayuru',
      subtitle: 'Digital Life Service',
      icon: Waves,
      iconBg: 'bg-purple-600',
      badge: 'Code: #828#',
      clickable: true,
    },
    {
      id: 'reload',
      name: 'Dialog Reload',
      category: 'telecom',
      subtitle: 'Mobile Reload',
      icon: Smartphone,
      iconBg: 'bg-rose-500',
      badge: 'Direct Top-Up',
      clickable: false,
    },
    {
      id: 'broadband',
      name: 'Dialog Broadband',
      category: 'telecom',
      subtitle: 'Home Broadband',
      icon: Wifi,
      iconBg: 'bg-blue-600',
      badge: '4G / Postpaid',
      clickable: false,
    },
    {
      id: 'tv',
      name: 'Dialog TV',
      category: 'telecom',
      subtitle: 'Television Services',
      icon: Tv,
      iconBg: 'bg-amber-500',
      badge: 'DTV Satellite',
      clickable: false,
    },
  ];

  const filteredServices = services.filter((s) => {
    if (filter === 'all') return true;
    return s.category === filter;
  });

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto px-5 pt-3 pb-6 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-1">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-black text-slate-800">Sales</h2>

        <button
          onClick={() => {
            if (filter === 'all') setFilter('govimithuru');
            else if (filter === 'govimithuru') setFilter('sayuru');
            else setFilter('all');
          }}
          className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 active:scale-95 transition"
          aria-label="Filter"
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Pills (All, Govimithuru, Sayuru matching mockup) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
            filter === 'all'
              ? 'bg-[#E53935] text-white shadow-red-500/25'
              : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter('govimithuru')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
            filter === 'govimithuru'
              ? 'bg-[#E53935] text-white shadow-red-500/25'
              : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
          }`}
        >
          Govimithuru
        </button>

        <button
          onClick={() => setFilter('sayuru')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
            filter === 'sayuru'
              ? 'bg-[#E53935] text-white shadow-red-500/25'
              : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
          }`}
        >
          Sayuru
        </button>
      </div>

      {/* Product List Cards */}
      <div className="space-y-3 pt-1">
        {filteredServices.map((service) => {
          const Icon = service.icon;

          return (
            <div
              key={service.id}
              onClick={() => {
                if (service.id === 'govimithuru' || service.id === 'sayuru') {
                  onSelectService(service.id);
                } else {
                  setSelectedOther(service.name);
                }
              }}
              className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex items-center justify-between cursor-pointer group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl ${service.iconBg} text-white flex items-center justify-center shadow-md`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 group-hover:text-blue-700 transition">
                    {service.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{service.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600">
                <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 hidden sm:inline">
                  {service.badge}
                </span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Notice Modal for Reload/Broadband/TV */}
      {selectedOther && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center space-y-3">
            <h3 className="text-base font-bold text-slate-800">{selectedOther}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              මෙම සේවාව සඳහා ක්ෂේත්‍ර නියෝජිත ලියාපදිංචිය සෘජුව Dialog Agent App හරහා සිදු කෙරේ.
            </p>
            <button
              onClick={() => setSelectedOther(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              හරි (Done)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
