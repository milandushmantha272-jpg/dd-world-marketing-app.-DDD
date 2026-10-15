import React, { useState } from 'react';
import { Send, Bell, Megaphone, CheckCircle2, FileText, Image as ImageIcon, Video, AlertCircle, Eye, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const CompanyMessageCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, teams, companyMessages, sendCompanyMessage, markMessageAsRead } = useData();

  const isOwner = currentUser?.role === 'owner';

  // Message Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'announcement' | 'motivation' | 'product' | 'training' | 'policy' | 'meeting' | 'alert'>('announcement');
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video' | 'pdf'>('none');
  const [mediaUrl, setMediaUrl] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'tls' | 'specific_team' | 'specific_agent'>('all');
  const [targetTeamId, setTargetTeamId] = useState('');
  const [targetAgentId, setTargetAgentId] = useState('');

  const [sentMsg, setSentMsg] = useState<string | null>(null);

  // Filter messages intended for currentUser
  const myMessages = companyMessages.filter((msg) => {
    if (isOwner) return true; // Owner sees all sent messages
    if (msg.targetAudience === 'all') return true;
    if (msg.targetAudience === 'tls' && (currentUser?.role === 'team_leader' || currentUser?.role === 'owner')) return true;
    if (msg.targetAudience === 'specific_team' && currentUser?.teamId === msg.targetTeamId) return true;
    if (msg.targetAudience === 'specific_agent' && currentUser?.id === msg.targetAgentId) return true;
    return false;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !currentUser) return;

    sendCompanyMessage({
      title,
      content,
      category,
      mediaType,
      mediaUrl: mediaType !== 'none' ? mediaUrl : undefined,
      targetAudience,
      targetTeamId: targetAudience === 'specific_team' ? targetTeamId : undefined,
      targetAgentId: targetAudience === 'specific_agent' ? targetAgentId : undefined,
      senderId: currentUser.id,
      senderName: currentUser.name,
      sentAt: new Date().toISOString(),
      status: 'sent',
      readBy: [currentUser.id],
    });

    setSentMsg('✅ සමාගම් පණිවිඩය සාර්ථකව යවන ලදී.');
    setTitle('');
    setContent('');
    setMediaUrl('');
    setTimeout(() => setSentMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/30 rounded-3xl p-6 shadow-xl space-y-2">
        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          COMPANY COMMUNICATION &amp; MESSAGE CENTER
        </span>
        <h2 className="text-xl font-black text-white">
          සමාගම් නිල නිවේදන සහ පණිවිඩ මධ්‍යස්ථානය (Company Message Center)
        </h2>
        <p className="text-xs text-slate-300">
          කළමනාකාරීත්වයෙන් ලැබෙන නිල නිවේදන, Sales Motivation, නිෂ්පාදන තොරතුරු, පුහුණු දැනුම්දීම්, රැස්වීම් සහ ප්‍රතිපත්ති මාලාවන් මෙහි නැරඹිය හැක.
        </p>
      </div>

      {sentMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{sentMsg}</span>
        </div>
      )}

      {/* Owner Message Creation Form */}
      {isOwner && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-purple-400" /> අලුත් පණිවිඩයක් හෝ නිවේදනයක් නිකුත් කරන්න
          </h3>

          <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">පණිවිඩ මාතෘකාව (Title)</label>
                <input
                  type="text"
                  placeholder="උදා: අද දින විශේෂ Sales Motivation &amp; ඉලක්ක"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">වර්ගය (Category)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-purple-500 outline-none"
                >
                  <option value="announcement">Announcements (නිල නිවේදන)</option>
                  <option value="motivation">Sales Motivation (ධනාත්මක පන්නරය)</option>
                  <option value="product">Product Info (නිෂ්පාදන තොරතුරු)</option>
                  <option value="training">Training Notice (පුහුණු දැනුම්දීම්)</option>
                  <option value="policy">Policy Notice (ප්‍රතිපත්ති තොරතුරු)</option>
                  <option value="meeting">Meeting Notice (රැස්වීම් නිවේදන)</option>
                  <option value="alert">Important Alert (හදිසි නිවේදන)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">ඉලක්කගත පිරිස (Target Audience)</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-purple-500 outline-none"
                >
                  <option value="all">සියලුම සේවකයින්ට (All Employees)</option>
                  <option value="tls">Team Leaders ට පමණයි (TLs Only)</option>
                  <option value="specific_team">নির্দিষ্ট Team එකකට (Specific Team)</option>
                  <option value="specific_agent">নির্দিষ্ট Agent කෙනෙකුට (Specific Agent)</option>
                </select>
              </div>
            </div>

            {targetAudience === 'specific_team' && (
              <div className="space-y-1">
                <label className="font-bold text-slate-300">කණ්ඩායම තෝරන්න (Select Team)</label>
                <select
                  value={targetTeamId}
                  onChange={(e) => setTargetTeamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-purple-500 outline-none"
                >
                  <option value="">Team එක තෝරන්න...</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {targetAudience === 'specific_agent' && (
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Agent තෝරන්න (Select Agent)</label>
                <select
                  value={targetAgentId}
                  onChange={(e) => setTargetAgentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-purple-500 outline-none"
                >
                  <option value="">Agent තෝරන්න...</option>
                  {users.filter((u) => u.role === 'agent').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.agentCode || 'AG'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-300">පණිවිඩ විස්තරය (Content)</label>
              <textarea
                rows={4}
                placeholder="පණිවිඩයේ සම්පූර්ණ විස්තරය මෙහි ඇතුළත් කරන්න..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Media/Attachment Type</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:border-purple-500 outline-none"
                >
                  <option value="none">No Media (Text Only)</option>
                  <option value="image">Image URL / Poster</option>
                  <option value="video">Video URL / YouTube</option>
                  <option value="pdf">PDF Resource Document</option>
                </select>
              </div>

              {mediaType !== 'none' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Media/Document URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/media.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-purple-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!title.trim() || !content.trim()}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> පණිවිඩය නිකුත් කරන්න
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" /> සමාගම් නිල පණිවිඩ ({myMessages.length})
        </h3>

        <div className="space-y-4">
          {myMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              තවම සමාගම් නිල පණිවිඩ නිකුත් කර නොමැත.
            </div>
          ) : (
            myMessages.map((m) => {
              const isRead = m.readBy?.includes(currentUser?.id || '');

              return (
                <div
                  key={m.id}
                  onClick={() => {
                    if (currentUser && !isRead) markMessageAsRead(m.id, currentUser.id);
                  }}
                  className={`p-5 rounded-2xl border transition space-y-3 cursor-pointer ${
                    isRead
                      ? 'bg-slate-950/80 border-slate-800/80 text-slate-300'
                      : 'bg-slate-950 border-purple-500/50 shadow-lg shadow-purple-500/10 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {m.category}
                      </span>
                      <h4 className="font-black text-sm text-white">{m.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>{new Date(m.sentAt).toLocaleString()}</span>
                      <span className="font-bold text-cyan-300">From: {m.senderName}</span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-200">{m.content}</p>

                  {m.mediaType === 'image' && m.mediaUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 max-h-60">
                      <img src={m.mediaUrl} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {m.mediaType === 'video' && m.mediaUrl && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                        <Video className="w-4 h-4" /> වීඩියෝ සබැඳිය නරඹන්න
                      </span>
                      <a href={m.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 font-bold hover:underline">
                        Open Video
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2">
                    <span>Target: {m.targetAudience.toUpperCase()}</span>
                    {isRead ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> කියවා ඇත (Read)
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold">නොකියවා ඇත (Click to mark read)</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
