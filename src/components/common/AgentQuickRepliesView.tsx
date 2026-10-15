import React, { useState, useMemo } from 'react';
import {
  Zap,
  Search,
  Copy,
  Check,
  Plus,
  Trash2,
  Sprout,
  Compass,
  PhoneCall,
  CheckCircle2,
  HelpCircle,
  Smile,
  HeartHandshake,
  Layers,
  Sparkles,
  Volume2,
  BookOpen,
} from 'lucide-react';
import {
  PREDEFINED_QUICK_REPLIES,
  QUICK_REPLY_CATEGORIES,
  QuickReplyTemplate,
} from '../../data/quickRepliesData';
import { safeStorage } from '../../utils/safeStorage';

const CUSTOM_TEMPLATES_KEY = 'ddworld_custom_quick_replies_v1';

export const AgentQuickRepliesView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'all' | 'sinhala' | 'english'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom User Templates
  const [customTemplates, setCustomTemplates] = useState<QuickReplyTemplate[]>(() => {
    try {
      const raw = safeStorage.getItem(CUSTOM_TEMPLATES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<QuickReplyTemplate['category']>('support');
  const [newShortCode, setNewShortCode] = useState('');

  const allTemplates = useMemo(() => {
    return [...customTemplates, ...PREDEFINED_QUICK_REPLIES];
  }, [customTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedLanguage !== 'all' && item.language !== selectedLanguage && item.language !== 'bilingual') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesText = item.text.toLowerCase().includes(q);
        const matchesCode = item.shortCode.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesText || matchesCode || matchesTags;
      }
      return true;
    });
  }, [allTemplates, selectedCategory, selectedLanguage, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleCreateCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newText.trim()) return;

    const newTpl: QuickReplyTemplate = {
      id: `custom_qr_${Date.now()}`,
      title: newTitle.trim(),
      text: newText.trim(),
      category: newCategory,
      shortCode: newShortCode.trim()
        ? newShortCode.startsWith('/')
          ? newShortCode.trim()
          : `/${newShortCode.trim()}`
        : `/custom${customTemplates.length + 1}`,
      language: 'sinhala',
      tags: ['custom', 'agent-script'],
    };

    const updated = [newTpl, ...customTemplates];
    setCustomTemplates(updated);
    safeStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));

    setNewTitle('');
    setNewText('');
    setNewShortCode('');
    setIsCreatingCustom(false);
  };

  const handleDeleteCustom = (id: string) => {
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    safeStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'greeting':
        return <Smile className="w-4 h-4 text-blue-400" />;
      case 'govimithuru':
        return <Sprout className="w-4 h-4 text-emerald-400" />;
      case 'sayuru':
        return <Compass className="w-4 h-4 text-cyan-400" />;
      case 'activation':
        return <CheckCircle2 className="w-4 h-4 text-purple-400" />;
      case 'support':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'callback':
        return <PhoneCall className="w-4 h-4 text-rose-400" />;
      case 'closing':
        return <HeartHandshake className="w-4 h-4 text-teal-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
              <Zap className="w-3.5 h-3.5 fill-amber-300" />
              CALL SCRIPTS &amp; QUICK REPLY TEMPLATES
            </span>
            <h2 className="text-xl font-black text-white">
              පාරිභෝගික ඇමතුම් හා සජීවී සාකච්ඡා සඳහා කඩිනම් පිළිතුරු (Quick Reply Templates)
            </h2>
            <p className="text-xs text-slate-300">
              Dialog Govimithuru, Sayuru, Customer Support සහ Call Follow-up සඳහා වන සම්මත ස්ක්‍රිප්ට් 1-Click එකකින් Copy කරගෙන සජීවී ඇමතුම් වලදී භාවිත කරන්න.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingCustom((prev) => !prev)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-90 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{isCreatingCustom ? 'පෝරමය වසන්න' : 'නව Template එකක් සාදන්න'}</span>
          </button>
        </div>
      </div>

      {/* Custom Template Creation Drawer */}
      {isCreatingCustom && (
        <form
          onSubmit={handleCreateCustomTemplate}
          className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-200 text-xs"
        >
          <div className="flex items-center justify-between font-bold text-white border-b border-slate-800 pb-3">
            <span className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <Plus className="w-4 h-4 stroke-[3]" /> නව පෞද්ගලික Quick Reply Template එකක් එක් කරන්න
            </span>
            <button
              type="button"
              onClick={() => setIsCreatingCustom(false)}
              className="text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-300">Template මාතෘකාව (Title)</label>
              <input
                type="text"
                placeholder="උදා: විශේෂ පොහොර උපදෙස් කෙටි පිළිතුර"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-300">වර්ගය (Category)</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500 font-bold"
              >
                <option value="greeting">Greetings (පිළිගැනීම)</option>
                <option value="govimithuru">Govimithuru (ගොවිමිතුරු)</option>
                <option value="sayuru">Sayuru (සයුරු)</option>
                <option value="activation">Activation (ලියාපදිංචිය)</option>
                <option value="support">Support (පාරිභෝගික සහාය)</option>
                <option value="callback">Call-Back (නැවත ඇමතුම්)</option>
                <option value="closing">Closing (සමුගැනීම)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-300">සම්පූර්ණ පණිවිඩය හෝ Script එක (Full Script Text)</label>
            <textarea
              rows={3}
              placeholder="ඇමතුමේදී කියවීමට හෝ SMS/Chat මඟින් යැවීමට අවශ්‍ය සම්පූර්ණ පණිවිඩය..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-emerald-500 leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingCustom(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
            >
              අවලංගු කරන්න
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black shadow-lg"
            >
              Template එක සුරකින්න
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="කඩිනම් පිළිතුරු සොයන්න (උදා: 616, කාලගුණය, සයුරු, hold, කෘමිනාශක)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-2xl shrink-0 self-start">
            <button
              type="button"
              onClick={() => setSelectedLanguage('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedLanguage === 'all'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              සියල්ල (All)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('sinhala')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedLanguage === 'sinhala'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              සිංහල
            </button>
            <button
              type="button"
              onClick={() => setSelectedLanguage('english')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedLanguage === 'english'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_REPLY_CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? allTemplates.length
                : allTemplates.filter((t) => t.category === cat.id).length;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold whitespace-nowrap transition cursor-pointer text-xs ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{getCategoryIcon(cat.id)}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${isActive ? 'bg-black/30 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-300">කිසිදු Quick Reply Template එකක් හමු නොවීය</p>
            <p className="text-xs text-slate-500">වෙනත් Search පදයක් භාවිත කරන්න හෝ සියලු Templates තෝරන්න.</p>
          </div>
        ) : (
          filteredTemplates.map((template) => {
            const isCopied = copiedId === template.id;
            const isCustom = template.id.startsWith('custom_');

            return (
              <div
                key={template.id}
                className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 transition-all duration-200 flex flex-col justify-between space-y-3 shadow-lg group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                        {getCategoryIcon(template.category)}
                      </span>
                      <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                        {template.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-amber-400 font-bold">
                        {template.shortCode}
                      </span>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustom(template.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10 transition"
                          title="Delete custom template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans select-all">
                    {template.text}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2 flex-wrap">
                  <div className="flex items-center gap-1 flex-wrap">
                    {template.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(template.id, template.text)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Copied! (පිටපත් විය)</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
