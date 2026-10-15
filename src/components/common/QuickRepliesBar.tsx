import React, { useState } from 'react';
import { Zap, ChevronRight, Copy, Check, MessageSquare } from 'lucide-react';
import { PREDEFINED_QUICK_REPLIES, QuickReplyTemplate } from '../../data/quickRepliesData';
import { QuickReplyTemplatesModal } from './QuickReplyTemplatesModal';

interface QuickRepliesBarProps {
  onSelectReply: (text: string) => void;
  onSendDirect?: (text: string) => void;
  className?: string;
  categoryFilter?: QuickReplyTemplate['category'];
  compact?: boolean;
}

export const QuickRepliesBar: React.FC<QuickRepliesBarProps> = ({
  onSelectReply,
  onSendDirect,
  className = '',
  categoryFilter,
  compact = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayedReplies = categoryFilter
    ? PREDEFINED_QUICK_REPLIES.filter((r) => r.category === categoryFilter).slice(0, 6)
    : PREDEFINED_QUICK_REPLIES.slice(0, 8);

  const handleCopy = (e: React.MouseEvent, r: QuickReplyTemplate) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(r.text);
      setCopiedId(r.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <>
      <div className={`flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs ${className}`}>
        {/* Trigger for full modal */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold whitespace-nowrap transition shrink-0 active:scale-95 cursor-pointer"
          title="Open all Quick Reply templates & scripts"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Quick Replies</span>
        </button>

        {/* Quick pill templates */}
        {displayedReplies.map((r) => {
          const isCopied = copiedId === r.id;
          return (
            <div
              key={r.id}
              className="flex items-center rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 text-[11px] font-medium transition shrink-0 group"
            >
              <button
                type="button"
                onClick={() => onSelectReply(r.text)}
                className="px-2.5 py-1 text-left truncate max-w-[140px] sm:max-w-[180px] hover:text-white"
                title={`${r.title} - Click to insert`}
              >
                {r.title}
              </button>

              <button
                type="button"
                onClick={(e) => handleCopy(e, r)}
                className="p-1 pr-1.5 text-slate-500 hover:text-emerald-400 transition"
                title="Copy script"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          );
        })}
      </div>

      <QuickReplyTemplatesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectTemplate={onSelectReply}
        onDirectSend={onSendDirect}
      />
    </>
  );
};
