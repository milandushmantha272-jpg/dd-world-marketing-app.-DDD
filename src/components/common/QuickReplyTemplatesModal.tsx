import React, { useState, useMemo } from 'react';
import {
  Zap,
  Search,
  Copy,
  Check,
  Send,
  X,
  Sparkles,
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
  Globe,
  Filter,
} from 'lucide-react';
import {
  PREDEFINED_QUICK_REPLIES,
  QUICK_REPLY_CATEGORIES,
  QuickReplyTemplate,
} from '../../data/quickRepliesData';
import { safeStorage } from '../../utils/safeStorage';

interface QuickReplyTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (text: string) => void;
  onDirectSend?: (text: string) => void;
  title?: string;
  subtitle?: string;
}

const CUSTOM_TEMPLATES_KEY = 'ddworld_custom_quick_replies_v1';

export const QuickReplyTemplatesModal: React.FC<QuickReplyTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onDirectSend,
  title = 'Quick Reply & Call Script Templates',
  subtitle = 'පාරිභෝගික ඇමතුම් හා සජීවී සාකච්ඡා සඳහා කඩිනම් පිළිතුරු හා ස්ක්‍රිප්ට්',
}) => {
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

  if (!isOpen) return null;

  const allTemplates = useMemo(() => {
    return [...customTemplates, ...PREDEFINED_QUICK_REPLIES];
  }, [customTemplates]);

  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Language filter
      if (selectedLanguage !== 'all' && item.language !== selectedLanguage && item.language !== 'bilingual') {
        return false;
      }
      // Search query
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
      shortCode: newShortCode.trim() ? (newShortCode.startsWith('/') ? newShortCode.trim() : `/${newShortCode.trim()}`) : `/custom${customTemplates.length + 1}`,
      language: 'sinhala',
      tags: ['custom', 'my-reply'],
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
        return <Smile className="w-3.5 h-3.5 text-blue-400" />;
      case 'govimithuru':
        return <Sprout className="w-3.5 h-3.5 text-emerald-400" />;
      case 'sayuru':
        return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
      case 'activation':
        return <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />;
      case 'support':
        return <HelpCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'callback':
        return <PhoneCall className="w-3.5 h-3.5 text-rose-400" />;
      case 'closing':
        return <HeartHandshake className="w-3.5 h-3.5 text-teal-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">{title}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  {allTemplates.length} Templates
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingCustom((prev) => !prev)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingCustom ? 'Cancel' : 'New Template'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search templates by keyword, title, tag, or shortcode (/govi, /616)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Language filter switch */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0 self-start">
              <button
                type="button"
                onClick={() => setSelectedLanguage('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedLanguage === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('sinhala')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedLanguage === 'sinhala'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                සිංහල
              </button>
              <button
                type="button"
                onClick={() => setSelectedLanguage('english')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedLanguage === 'english'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {QUICK_REPLY_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer text-xs ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{getCategoryIcon(cat.id)}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Template Creation Drawer */}
        {isCreatingCustom && (
          <form
            onSubmit={handleCreateCustomTemplate}
            className="p-4 bg-slate-950 border-b border-slate-800 space-y-3 animate-in slide-in-from-top-3 duration-150 text-xs"
          >
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Plus className="w-4 h-4" /> නව පෞද්ගලික Quick Reply Template එකක් සාදන්න
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="text-slate-400 hover:text-white text-[11px]"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] text-slate-400">Template මාතෘකාව (Title)</label>
                <input
                  type="text"
                  placeholder="උදා: මගේ විශේෂ Govimithuru පිළිතුර"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white outline-none focus:border-emerald-500"
                >
                  <option value="greeting">Greetings</option>
                  <option value="govimithuru">Govimithuru</option>
                  <option value="sayuru">Sayuru</option>
                  <option value="activation">Activation</option>
                  <option value="support">Support</option>
                  <option value="callback">Call-Back</option>
                  <option value="closing">Closing</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">පණිවිඩය හෝ Script එක (Full Text)</label>
              <textarea
                rows={2}
                placeholder="පාරිභෝගිකයාට යවන හෝ කියවන පණිවිඩ පෙළ..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold shadow"
              >
                Save Custom Template
              </button>
            </div>
          </form>
        )}

        {/* Templates Stream List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 max-h-[55vh]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-400">ගැලපෙන Quick Reply Template එකක් හමු නොවීය</p>
              <p className="text-xs text-slate-500">වෙනත් Search වචනයක් හෝ Category එකක් තෝරා බලන්න.</p>
            </div>
          ) : (
            filteredTemplates.map((template) => {
              const isCopied = copiedId === template.id;
              const isCustom = template.id.startsWith('custom_');

              return (
                <div
                  key={template.id}
                  className="group bg-slate-950/70 hover:bg-slate-950 border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 space-y-2.5 shadow-sm"
                >
                  {/* Template Meta Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-slate-900 border border-slate-800">
                        {getCategoryIcon(template.category)}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-300 transition-colors">
                        {template.title}
                      </h4>
                      {isCustom && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-semibold">
                          Custom
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-amber-400 font-semibold">
                        {template.shortCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-400 capitalize">
                        {template.language}
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

                  {/* Template Text Content */}
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans select-all">
                    {template.text}
                  </div>

                  {/* Template Action Buttons */}
                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {template.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/60"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Interactive Action Triggers */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      {/* Copy Action */}
                      <button
                        type="button"
                        onClick={() => handleCopy(template.id, template.text)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                        title="Copy template script to clipboard"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copy Script</span>
                          </>
                        )}
                      </button>

                      {/* Insert into chat input action (if callback present) */}
                      {onSelectTemplate && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTemplate(template.text);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition active:scale-95 cursor-pointer"
                          title="Insert text into message input"
                        >
                          <span>Insert</span>
                        </button>
                      )}

                      {/* Direct Send action (if callback present) */}
                      {onDirectSend && (
                        <button
                          type="button"
                          onClick={() => {
                            onDirectSend(template.text);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow transition active:scale-95 cursor-pointer"
                          title="Send directly to customer/team"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Quick Tips */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">
              Tip: Click <strong>&quot;Copy Script&quot;</strong> to read or paste during active Dialog calls.
            </span>
            <span className="sm:hidden">Tap Copy to read or paste template.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
