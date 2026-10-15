import React, { useState, useEffect } from 'react';
import { Sparkles, Flame, Trophy, ChevronRight, ChevronLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const AutoMotivationBanner: React.FC = () => {
  const { currentUser } = useAuth();
  const { motivationBanners = [], addMotivationBanner, removeMotivationBanner } = useData();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Form State for Owner
  const [showAddModal, setShowAddModal] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'sales' | 'target' | 'quality' | 'revenue' | 'usage' | 'knowledge' | 'attendance' | 'conduct'>('sales');

  const activeBanners = (motivationBanners || []).filter((b) => b.isActive);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 8000); // Rotate every 8s
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  if (activeBanners.length === 0) return null;

  const currentMsg = activeBanners[currentIndex % activeBanners.length];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || !currentUser) return;

    addMotivationBanner({
      text: newText,
      category: newCategory,
      isActive: true,
      createdBy: currentUser.name,
    });

    setNewText('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-yellow-950/80 border border-amber-500/40 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
      <div className="flex items-center gap-3 flex-1 min-w-[280px]">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-lg">
          <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              🔥 MOTIVATION &amp; PERFORMANCE ({currentIndex + 1}/{activeBanners.length})
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{currentMsg.category}</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-amber-100 leading-snug">
            "{currentMsg.text}"
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
          className="p-1.5 rounded-xl bg-slate-950/80 text-amber-300 hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
          className="p-1.5 rounded-xl bg-slate-950/80 text-amber-300 hover:bg-slate-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {currentUser?.role === 'owner' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition ml-2 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Motivation එකක් එකතු කරන්න
          </button>
        )}
      </div>

      {/* Owner Modal to Add Motivation Banner */}
      {showAddModal && currentUser?.role === 'owner' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-white text-sm">නව Motivation / Performance පණිවිඩයක් එක්කරන්න</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">පණිවිඩ වර්ගය (Category)</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold outline-none"
                >
                  <option value="sales">Sales Motivation</option>
                  <option value="target">Target Achievement</option>
                  <option value="quality">Dialog Quality</option>
                  <option value="revenue">Revenue &amp; Target Incentive</option>
                  <option value="usage">Customer Usage</option>
                  <option value="knowledge">Product Knowledge</option>
                  <option value="attendance">Punctual Attendance</option>
                  <option value="conduct">Professional Conduct</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Motivation Text (Sinhala/English)</label>
                <textarea
                  rows={3}
                  placeholder="උදා: අද දින සාර්ථක වන සෑම Sales එකකින්ම ධීවර හා ගොවි පවුල් රැසකට යහපතක් සිදුවේ..."
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  disabled={!newText.trim()}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black"
                >
                  එක්කරන්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
