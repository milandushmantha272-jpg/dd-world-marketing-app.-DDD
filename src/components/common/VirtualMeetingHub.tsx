import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Users,
  MessageSquare,
  Share2,
  Calendar,
  PlusCircle,
  Clock,
  ShieldCheck,
  Radio,
  Sparkles,
  Lock,
  Volume2,
} from 'lucide-react';

interface MeetingChannel {
  id: string;
  name: string;
  category: 'executive' | 'team_leaders' | 'all_hands' | 'team_breakout';
  description: string;
  allowedRoles: ('owner' | 'team_leader' | 'agent')[];
  activeParticipants: number;
}

const MEETING_CHANNELS: MeetingChannel[] = [
  {
    id: 'ch-executive',
    name: '👑 Executive Boardroom',
    category: 'executive',
    description: 'ආයතන ප්‍රධානී (Owner) සහ ජ්‍යෙෂ්ඨ මෙහෙයුම් කණ්ඩායම සඳහා පමණක් වෙන්වූ රහස්‍ය නාලිකාව.',
    allowedRoles: ['owner'],
    activeParticipants: 1,
  },
  {
    id: 'ch-leaders',
    name: '🛡️ Team Leaders Strategy War Room',
    category: 'team_leaders',
    description: 'කණ්ඩායම් නායකයින් සහ Owner අතර දෛනික විකුණුම් හා කලාපීය මෙහෙයුම් සැලසුම් සාකච්ඡා.',
    allowedRoles: ['owner', 'team_leader'],
    activeParticipants: 3,
  },
  {
    id: 'ch-all-hands',
    name: '🎯 All-Hands Company Assembly',
    category: 'all_hands',
    description: 'සියලුම සාමාජිකයින් (Owner, Team Leaders, Agents) සඳහා වන සතිපතා මහා සමුළුව.',
    allowedRoles: ['owner', 'team_leader', 'agent'],
    activeParticipants: 8,
  },
  {
    id: 'ch-alpha',
    name: '🏢 Team Alpha Field Breakout',
    category: 'team_breakout',
    description: 'Team Alpha නියෝජිතයන්ගේ දෛනික උදෑසන ඉලක්ක හා ක්ෂේත්‍ර ගැටළු විමසුම.',
    allowedRoles: ['owner', 'team_leader', 'agent'],
    activeParticipants: 4,
  },
];

export const VirtualMeetingHub: React.FC = () => {
  const { currentUser } = useAuth();
  const { meetings, createMeeting, cancelMeeting } = useData();

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [meetingChat, setMeetingChat] = useState<{ id: string; sender: string; text: string; time: string }[]>([
    { id: '1', sender: 'Dushmantha Fernando (Owner)', text: 'සාදරයෙන් පිළිගනිමු! අද දින Dialog ගොවිමිතුරු ඉලක්ක සමාලෝචනය කරමු.', time: '09:00 AM' },
    { id: '2', sender: 'Kasun Bandara (TL)', text: 'Team Alpha සියලු නියෝජිතයන් ක්ෂේත්‍රයේ සක්‍රියයි.', time: '09:02 AM' },
  ]);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00');
  const [newType, setNewType] = useState<'owner_tl' | 'all_hands' | 'team_training'>('all_hands');

  if (!currentUser) return null;

  const currentRole = currentUser.role;

  const handleJoinChannel = (channel: MeetingChannel) => {
    if (!channel.allowedRoles.includes(currentRole)) {
      alert('⚠️ මෙම නාලිකාවට ප්‍රවේශ වීමට ඔබට අවසර නොමැත (RESTRICTED ROLE ACCESS).');
      return;
    }
    setActiveChannelId(channel.id);
  };

  const handleLeaveCall = () => {
    setActiveChannelId(null);
    setIsScreenSharing(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setMeetingChat((prev) => [
      ...prev,
      {
        id: `chat-${Date.now()}`,
        sender: currentUser.name,
        text: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatMessage('');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createMeeting({
      title: newTitle,
      type: newType,
      date: newDate,
      time: newTime,
      scheduledBy: currentUser.id,
      scheduledByName: currentUser.name,
      teamId: currentUser.teamId,
    });
    setNewTitle('');
    setShowScheduleModal(false);
  };

  const currentActiveChannel = MEETING_CHANNELS.find((c) => c.id === activeChannelId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/50 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-xl">
              <Video className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Multi-Tier Virtual Meeting Hub</h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  WebRTC Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Owner, Team Leader සහ Agent වරුන් සඳහා වන ආයතනික අති-ආරක්ෂිත සජීවී වීඩියෝ/ශ්‍රව්‍ය හමුවීම් පද්ධතිය
              </p>
            </div>
          </div>

          {(currentRole === 'owner' || currentRole === 'team_leader') && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-indigo-900/30 transition-all self-start md:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>නව හමුවක් සැලසුම් කරන්න (Schedule Meeting)</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Video Conference Room (If joined) */}
      {activeChannelId && currentActiveChannel && (
        <div className="p-6 rounded-3xl bg-slate-950 border-2 border-indigo-500/50 shadow-2xl space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-lg font-bold text-white">{currentActiveChannel.name}</h4>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Encrypted Session
              </span>
            </div>
            <button
              onClick={handleLeaveCall}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-lg shadow-red-900/40"
            >
              <PhoneOff className="w-4 h-4" />
              <span>නාලිකාවෙන් ඉවත් වන්න (Leave Room)</span>
            </button>
          </div>

          {/* Video Grid Simulation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Speaker Frame */}
            <div className="md:col-span-2 aspect-video bg-slate-900 rounded-3xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center group">
              <div className="w-24 h-24 rounded-full ring-4 ring-indigo-500/50 p-1 mb-2 bg-slate-800">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="text-sm font-bold text-white">{currentUser.name} (ඔබ)</div>
              <div className="text-xs text-slate-400 capitalize">{currentUser.role} • {currentUser.teamName || 'DD World HQ'}</div>

              {/* Status overlay */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-slate-300 border border-slate-800">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>සක්‍රිය සන්නිවේදනය (Live Voice Stream)</span>
              </div>

              {/* Bottom Control Bar */}
              <div className="absolute bottom-4 flex items-center space-x-3 bg-slate-950/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-800 shadow-xl">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    isMicMuted ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    isVideoOff ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    isScreenSharing ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-Meeting Live Chat Stream */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 flex flex-col h-full min-h-[320px]">
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold text-white flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>සජීවී සාකච්ඡාව (In-Room Chat)</span>
                </span>
                <span>{meetingChat.length} Messages</span>
              </div>
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                {meetingChat.map((msg) => (
                  <div key={msg.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-indigo-300">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-slate-200">{msg.text}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="පණිවිඩයක් ලියන්න..."
                  className="flex-1 bg-slate-950 px-3 py-2 rounded-xl text-xs text-white border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  යවන්න
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Available Meeting Channels Grid */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-white flex items-center space-x-2">
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>සජීවී නාලිකා (Available Channels)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEETING_CHANNELS.map((ch) => {
            const hasAccess = ch.allowedRoles.includes(currentRole);
            const isCurrentlyActive = activeChannelId === ch.id;

            return (
              <div
                key={ch.id}
                className={`p-5 rounded-3xl border transition-all ${
                  isCurrentlyActive
                    ? 'bg-indigo-950/40 border-indigo-500'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-base font-bold text-white flex items-center space-x-2">
                      <span>{ch.name}</span>
                      {!hasAccess && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">{ch.description}</p>
                  </div>
                  <span className="px-2 py-1 bg-slate-800 text-[11px] font-semibold text-slate-300 rounded-lg shrink-0 border border-slate-700">
                    {ch.activeParticipants} Online
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    අවසර ලත් තනතුරු:{' '}
                    <span className="text-slate-200 uppercase font-semibold">
                      {ch.allowedRoles.join(', ')}
                    </span>
                  </span>
                  <button
                    onClick={() => handleJoinChannel(ch)}
                    disabled={!hasAccess || isCurrentlyActive}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrentlyActive
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : hasAccess
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isCurrentlyActive ? 'සම්බන්ධ වී ඇත' : hasAccess ? 'නාලිකාවට එක්වන්න (Join)' : 'අවසර නැත'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scheduled Corporate Meetings List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>සැලසුම් කළ නිල හමුවීම් (Scheduled Meetings)</span>
          </span>
          <span>මුළු හමුවීම්: {meetings.length}</span>
        </div>
        <div className="divide-y divide-slate-800/60">
          {meetings.map((m) => (
            <div key={m.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors">
              <div>
                <div className="flex items-center space-x-2">
                  <h5 className="text-sm font-bold text-white">{m.title}</h5>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      m.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : m.status === 'completed'
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{m.date} at {m.time}</span>
                  </span>
                  <span>සැලසුම් කළේ: {m.scheduledByName}</span>
                </div>
              </div>

              {currentRole === 'owner' && m.status === 'scheduled' && (
                <button
                  onClick={() => cancelMeeting(m.id)}
                  className="px-3 py-1 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  අවලංගු කරන්න
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 className="text-lg font-bold text-white">නව හමුවක් සැලසුම් කරන්න</h4>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">මාතෘකාව (Title)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="උදා: සතිපතා Dialog විකුණුම් සමාලෝචනය"
                  required
                  className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">දිනය (Date)</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">වේලාව (Time)</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                    className="w-full bg-slate-950 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  සුරකින්න (Save Meeting)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
