import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Sparkles, Presentation, TrendingUp, Award, Users, ChevronLeft, ChevronRight, Download, BarChart2, ShieldCheck } from 'lucide-react';

export const MonthEndPresentationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, teams, sales } = useData();

  const [currentSlide, setCurrentSlide] = useState(0);

  if (!currentUser) return null;

  const totalAgents = users.filter((u) => u.role === 'agent').length;
  const totalSales = sales.length;
  const goviMithuruSales = sales.filter((s) => s.productType.toLowerCase().includes('govi')).length;
  const sayuruSales = sales.filter((s) => s.productType.toLowerCase().includes('sayur')).length;

  const slides = [
    {
      title: 'DD WORLD MARKETING • මාසික සමාලෝචන වාර්තාව',
      sub: 'Dialog Axiata PLC Official Sayura & Govi Mithuru Field Operations',
      badge: 'Executive Presentation 2026',
      render: () => (
        <div className="space-y-6 text-center py-8">
          <div className="inline-block p-4 rounded-3xl bg-red-600/10 border border-red-500/20 text-red-500 mb-2">
            <Presentation className="w-16 h-16 mx-auto animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            දිවයින පුරා සක්‍රිය කිරීම් සහ ක්ෂේත්‍ර කාර්යසාධනය
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            ශ්‍රී ලංකාවේ ප්‍රමුඛතම සන්නිවේදන ජාලය වන Dialog Axiata PLC වෙනුවෙන් DD World Marketing ආයතනයේ ක්ෂේත්‍ර නියෝජිතයින් විසින් ඉටු කරන ලද මාසික මෙහෙයුම් වාර්තාව.
          </p>
          <div className="pt-4 flex justify-center gap-4 text-xs font-bold text-slate-300">
            <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">කණ්ඩායම්: {teams.length}</span>
            <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">නියෝජිතයින්: {totalAgents}</span>
            <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">අනුකූලතාව: 100%</span>
          </div>
        </div>
      ),
    },
    {
      title: 'නිෂ්පාදන සක්‍රිය කිරීම් සහ ප්‍රතිඵල',
      sub: 'Dialog Govi Mithuru & Sayura Key Highlights',
      badge: 'Product Performance',
      render: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          <div className="p-6 bg-slate-950/80 border border-emerald-500/30 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                කෘෂිකාර්මික සේවා
              </span>
              <h3 className="text-2xl font-black text-white mt-3">Dialog Govi Mithuru (ගොවිමිතුරු)</h3>
              <p className="text-xs text-slate-400 mt-2">
                ගොවි ප්‍රජාව සඳහා කාලගුණ අනාවැකි, වගා උපදෙස් සහ පළිබෝධ පාලන දැනුම ලබා දෙන නිල IVR/App සේවාව.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-end">
              <div>
                <span className="text-xs text-slate-500">සමස්ත සක්‍රිය කිරීම්</span>
                <p className="text-3xl font-black text-emerald-400">{goviMithuruSales}</p>
              </div>
              <span className="text-xs font-bold text-slate-400">Rate: Rs. 100/sub</span>
            </div>
          </div>

          <div className="p-6 bg-slate-950/80 border border-cyan-500/30 rounded-2xl shadow-xl flex flex-col justify-between">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                ධීවර ආරක්ෂණ සේවා
              </span>
              <h3 className="text-2xl font-black text-white mt-3">Dialog Sayura (සයුරු)</h3>
              <p className="text-xs text-slate-400 mt-2">
                මුහුදු යන ධීවරයින්ගේ ජීවිතාරක්ෂක සන්නිවේදනය, මුහුදු කාලගුණය සහ මාළු බහුල ප්‍රදේශ පිළිබඳ දැනුවත් කිරීම්.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-end">
              <div>
                <span className="text-xs text-slate-500">සමස්ත සක්‍රිය කිරීම්</span>
                <p className="text-3xl font-black text-cyan-400">{sayuruSales}</p>
              </div>
              <span className="text-xs font-bold text-slate-400">Rate: Rs. 150/sub</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'කණ්ඩායම් කාර්යසාධන ධූරාවලිය',
      sub: 'Top Performing Field Teams & Leaders',
      badge: 'Team Ranking',
      render: () => (
        <div className="py-4 space-y-3">
          {teams.slice(0, 4).map((t, idx) => (
            <div
              key={t.id}
              className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                  #{idx + 1}
                </span>
                <div>
                  <h4 className="font-bold text-white text-base">{t.name}</h4>
                  <p className="text-xs text-slate-400">Team Leader: {t.leaderName}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold">
                100% Target Met
              </span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                මාස අවසාන විධායක ඉදිරිපත් කිරීම • Month-End Presentation Studio
              </h1>
              <p className="text-sm text-slate-400">
                Dialog Axiata නිල සාකච්ඡා සහ වාර්තා ඉදිරිපත් කිරීමේ වේදිකාව
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs font-bold text-violet-400">
              Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Slide Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative min-h-[420px] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
              {slides[currentSlide].badge}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white">{slides[currentSlide].title}</h2>
          <p className="text-xs text-slate-400 mt-1">{slides[currentSlide].sub}</p>

          <div className="mt-4">{slides[currentSlide].render()}</div>
        </div>

        {/* Slide Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> පෙර Slide එක (Previous)
          </button>

          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentSlide === i ? 'bg-purple-500 scale-125' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            මීළඟ Slide එක (Next) <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
