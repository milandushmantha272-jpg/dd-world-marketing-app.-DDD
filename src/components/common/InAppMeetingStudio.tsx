import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  PhoneOff,
  MessageSquare,
  Users,
  Hand,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  Play,
  Copy,
  Check,
  Send,
  X,
  Shield,
  Volume2,
  Paperclip,
  FileText,
  Upload,
  Download,
  Share2,
  Wifi,
  PhoneCall,
  Search,
  CheckCheck,
} from 'lucide-react';
import { Meeting, MeetingFile, User } from '../../types';
import { QuickRepliesBar } from './QuickRepliesBar';
import { QuickReplyTemplatesModal } from './QuickReplyTemplatesModal';

export const InAppMeetingStudio: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    meetings,
    createMeeting,
    users,
    teams,
    messages,
    sendMessage,
    startCall,
  } = useData();

  // Top level Communication Studio Tab
  const [mainTab, setMainTab] = useState<'chat' | 'calls' | 'meetings'>('chat');

  // --- TAB 1: IN-APP CHAT STUDIO STATE ---
  const [selectedChatTarget, setSelectedChatTarget] = useState<{
    id: string; // user.id OR channel id like 'all', 'team_direct', etc.
    name: string;
    role?: string;
    isGroup?: boolean;
    userObj?: User;
  }>({
    id: 'all',
    name: '🌐 DD WORLD General Channel (මුළු ආයතනයම)',
    isGroup: true,
  });

  const [chatSearch, setChatSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceTimer, setVoiceTimer] = useState(0);

  // --- TAB 2: CALLS CENTER SEARCH ---
  const [callSearch, setCallSearch] = useState('');

  // --- TAB 3: MEETINGS STUDIO STATE ---
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [filterAudience, setFilterAudience] = useState<'all_filter' | 'all' | 'tls_only' | 'my_team'>('all_filter');

  // Internet Status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [networkPing, setNetworkPing] = useState<number>(12);

  // WebRTC Local Video Ref
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [camPermissionError, setCamPermissionError] = useState<string | null>(null);

  // Meeting Chat Stream inside active meeting
  const [meetingChat, setMeetingChat] = useState<{ id: string; sender: string; role: string; text: string; time: string }[]>([
    { id: 'm-msg-1', sender: 'System Operator', role: 'system', text: 'සාදරයෙන් පිළිගනිමු! DD WORLD සජීවී Meeting Room එක සක්‍රීය විය.', time: '10:00 AM' },
    { id: 'm-msg-2', sender: 'Dushmantha Fernando', role: 'owner', text: 'සියලුම සාමාජිකයින්ට සුබ උදෑසනක්! In-App සජීවී Chat, Call & Meeting සේවාව සක්‍රීයයි.', time: '10:01 AM' },
  ]);
  const [meetingChatInput, setMeetingChatInput] = useState('');

  // Active meeting files
  const [activeFiles, setActiveFiles] = useState<MeetingFile[]>([
    { id: 'f-1', name: 'DD_World_Executive_Targets_2026.pdf', size: '2.4 MB', uploadedBy: 'Dushmantha Fernando (Owner)', time: '10:00 AM', type: 'pdf' },
  ]);

  // Create Meeting Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'tls_only' | 'my_team' | 'specific_team'>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team_direct');

  // Internet Monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const pingInterval = setInterval(() => {
      setNetworkPing(Math.floor(10 + Math.random() * 12));
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pingInterval);
    };
  }, []);

  // Voice Note Timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setVoiceTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setVoiceTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // WebRTC Camera Stream for Active Meeting
  useEffect(() => {
    let currentStream: MediaStream | null = null;
    if (activeMeeting && isVideoOn) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: isMicOn })
          .then((stream) => {
            currentStream = stream;
            setMediaStream(stream);
            setCamPermissionError(null);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch((err) => {
            console.warn('Camera/Mic access error:', err);
            setCamPermissionError('දුරකථනයේ Camera/Mic අවසර නොමැත. Live Avatar/Stream සක්‍රීයයි.');
          });
      }
    } else {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        setMediaStream(null);
      }
    }

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeMeeting, isVideoOn]);

  // Handle Sending In-App Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() && !attachmentName.trim()) return;
    if (!currentUser) return;

    let finalContent = messageInput.trim();
    if (attachmentName.trim()) {
      finalContent = `📎 [ATTACHMENT]: ${attachmentName.trim()}\n${finalContent}`;
    }

    if (selectedChatTarget.isGroup) {
      // Send group chat message to all members
      sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        receiverId: selectedChatTarget.id,
        receiverName: selectedChatTarget.name,
        receiverRole: 'agent',
        content: finalContent,
      });
    } else {
      // Send 1-on-1 message to specific user
      sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        receiverId: selectedChatTarget.id,
        receiverName: selectedChatTarget.name,
        receiverRole: (selectedChatTarget.role as any) || 'agent',
        content: finalContent,
      });
    }

    setMessageInput('');
    setAttachmentName('');
    setIsAttachmentOpen(false);
  };

  // Handle Recording & Sending Voice Note
  const handleSendVoiceNote = () => {
    if (!currentUser) return;
    if (isRecordingVoice) {
      // Stop & Send
      setIsRecordingVoice(false);
      const voiceMsg = `🎙️ [IN-APP VOICE NOTE] (00:${voiceTimer < 10 ? '0' : ''}${voiceTimer})`;
      sendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        receiverId: selectedChatTarget.id,
        receiverName: selectedChatTarget.name,
        receiverRole: (selectedChatTarget.role as any) || 'agent',
        content: voiceMsg,
      });
      setVoiceTimer(0);
    } else {
      // Start recording
      setIsRecordingVoice(true);
      setVoiceTimer(0);
    }
  };

  // Filter messages for current chat target
  const filteredMessages = messages.filter((m) => {
    if (!currentUser) return false;
    if (selectedChatTarget.isGroup) {
      return m.receiverId === selectedChatTarget.id || m.receiverId === 'all';
    } else {
      return (
        (m.senderId === currentUser.id && m.receiverId === selectedChatTarget.id) ||
        (m.senderId === selectedChatTarget.id && m.receiverId === currentUser.id)
      );
    }
  });

  // Direct Call helper that initiates In-App Call
  const triggerInAppCall = (user: User, type: 'voice' | 'video') => {
    if (!currentUser) return;
    startCall(user, type, currentUser);
  };

  // Meeting Handlers
  const handleSendMeetingChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingChatInput.trim()) return;
    setMeetingChat((prev) => [
      ...prev,
      {
        id: `m-msg-${Date.now()}`,
        sender: currentUser?.name || 'You',
        role: currentUser?.role || 'agent',
        text: meetingChatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMeetingChatInput('');
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    const selTeam = teams.find((t) => t.id === selectedTeamId);

    let audienceName = 'DD WORLD All Members';
    if (targetAudience === 'tls_only') audienceName = 'Owner & Team Leaders Only';
    if (targetAudience === 'my_team') audienceName = currentUser?.teamName || 'My Team';
    if (targetAudience === 'specific_team') audienceName = selTeam ? selTeam.name : 'Specific Team';

    createMeeting({
      title: title.trim() || 'DD WORLD Executive Sync',
      description: description.trim() || 'සජීවී වීඩියෝ හා ශ්‍රව්‍ය සාකච්ඡාව',
      scheduledTime: scheduledTime || 'Live Now',
      hostName: currentUser?.name || 'Owner',
      hostRole: currentUser?.role || 'owner',
      hostId: currentUser?.id,
      teamId: targetAudience === 'my_team' ? currentUser?.teamId : targetAudience === 'specific_team' ? selectedTeamId : 'all',
      targetAudience,
      targetTeamName: audienceName,
    });

    setIsCreateModalOpen(false);
    setTitle('');
    setDescription('');
    setScheduledTime('');
  };

  const filteredMeetings = meetings.filter((m) => {
    if (filterAudience === 'all_filter') return true;
    if (filterAudience === 'all') return m.targetAudience === 'all';
    if (filterAudience === 'tls_only') return m.targetAudience === 'tls_only';
    if (filterAudience === 'my_team') return m.targetAudience === 'my_team' || m.targetAudience === 'specific_team';
    return true;
  });

  // ACTIVE MEETING ROOM SCREEN (IN-APP NATIVE MEETING ROOM)
  if (activeMeeting) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 text-slate-100">
        <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <h2 className="text-lg font-black text-white">{activeMeeting.title}</h2>
              </div>
              <p className="text-xs text-slate-400">
                Host: <strong className="text-amber-300">{activeMeeting.hostName}</strong> • Target: {activeMeeting.targetTeamName || 'All Members'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMeeting(null)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg transition flex items-center gap-2"
            >
              <PhoneOff className="w-4 h-4" /> Meeting එකෙන් ඉවත් වෙන්න (Leave Room)
            </button>
          </div>
        </div>

        {/* Meeting Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl h-[420px] relative overflow-hidden flex flex-col justify-between">
              {isVideoOn ? (
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-2xl" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-emerald-400 flex items-center gap-2 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    In-App Live Video • {currentUser?.name}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-slate-950 text-4xl font-extrabold shadow-xl">
                    {currentUser?.name.substring(0, 2)}
                  </div>
                  <h3 className="text-base font-bold text-white">{currentUser?.name} (You)</h3>
                  <p className="text-xs text-emerald-400 font-semibold">Camera Off • Audio Stream Ready</p>
                </div>
              )}

              {/* Bottom Meeting Controls */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                      isMicOn ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    {isMicOn ? 'Mic On' : 'Muted'}
                  </button>

                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                      isVideoOn ? 'bg-slate-800 text-sky-400 border border-sky-500/30' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                    {isVideoOn ? 'Cam On' : 'Cam Off'}
                  </button>

                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                      isScreenSharing ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    {isScreenSharing ? 'Sharing...' : 'Share Screen'}
                  </button>

                  <button
                    onClick={() => setIsHandRaised(!isHandRaised)}
                    className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                      isHandRaised ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    <Hand className="w-4 h-4" />
                    {isHandRaised ? 'Hand Raised' : 'Raise Hand'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Right Sidebar: Chat Stream */}
          <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col justify-between h-[420px]">
            <div className="border-b border-slate-800 pb-2 mb-2 flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> In-App Meeting Chat
              </h4>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs pr-1">
              {meetingChat.map((m) => (
                <div key={m.id} className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-amber-300 font-bold mb-1">
                    <span>{m.sender}</span>
                    <span className="text-slate-500 font-mono">{m.time}</span>
                  </div>
                  <p className="text-slate-200">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Meeting Quick Reply Bar */}
            <div className="pt-2 border-t border-slate-800">
              <QuickRepliesBar
                onSelectReply={(text) => setMeetingChatInput(text)}
                compact
              />
            </div>

            <form onSubmit={handleSendMeetingChat} className="flex gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Meeting chat එකට පණිවිඩයක් යවන්න..."
                value={meetingChatInput}
                onChange={(e) => setMeetingChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                type="submit"
                className="p-2 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-bold rounded-xl shadow"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // PRIMARY STUDIO HUB VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 text-slate-100">
      
      {/* Top Banner with Real-Time Internet Indicator & Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-700 text-slate-950 flex items-center justify-center shadow-xl font-black shrink-0">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white">
                  DD World In-App Communication Hub
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  IN-APP NATIVE PLATFORM ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                බාහිර වෙනත් App වලට නොගොස් මෙම App එක ඇතුලතින්ම සියලුම සාමාජිකයින් සහ කණ්ඩායම් (Teams) සමඟ සජීවී Chat, Voice/Video Calls සහ Live Group Meetings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl hover:opacity-95 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              අලුත් Meeting එකක් සාදන්න
            </button>
          </div>
        </div>

        {/* Studio Top Navigation Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setMainTab('chat')}
            className={`py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg ${
              mainTab === 'chat'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/30'
                : 'bg-slate-950 text-emerald-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            01. In-App Group &amp; Direct Chat
          </button>

          <button
            onClick={() => setMainTab('calls')}
            className={`py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg ${
              mainTab === 'calls'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/30'
                : 'bg-slate-950 text-emerald-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            02. In-App Voice &amp; Video Calls
          </button>

          <button
            onClick={() => setMainTab('meetings')}
            className={`py-3 px-4 rounded-2xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg ${
              mainTab === 'meetings'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/30'
                : 'bg-slate-950 text-emerald-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Video className="w-4 h-4" />
            03. In-App Live Video Meetings
          </button>
        </div>
      </div>

      {/* MODE 1: IN-APP CHAT STUDIO */}
      {mainTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[560px]">
          {/* Left Panel: Contacts & Group Channels List */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between space-y-3">
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="සාමාජිකයින් / Channels සෙවුම..."
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
                />
              </div>

              {/* Group Channels Section */}
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider px-1">
                  Group Channels (කණ්ඩායම්)
                </span>
                
                <button
                  onClick={() =>
                    setSelectedChatTarget({
                      id: 'all',
                      name: '🌐 DD WORLD General Channel (මුළු ආයතනයම)',
                      isGroup: true,
                    })
                  }
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    selectedChatTarget.id === 'all'
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black shadow'
                      : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="truncate">🌐 All-Company Channel</span>
                  </div>
                  <span className="text-[10px] opacity-80">General</span>
                </button>

                {teams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setSelectedChatTarget({
                        id: t.id,
                        name: `🚩 ${t.name} (TL: ${t.leaderName})`,
                        isGroup: true,
                      })
                    }
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      selectedChatTarget.id === t.id
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black shadow'
                        : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{t.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Team</span>
                  </button>
                ))}
              </div>

              {/* Direct Messages Section */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider px-1">
                  Direct Messages (පුද්ගලික)
                </span>

                <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                  {users
                    .filter((u) => u.id !== currentUser?.id)
                    .filter((u) => u.name.toLowerCase().includes(chatSearch.toLowerCase()))
                    .map((u) => (
                      <button
                        key={u.id}
                        onClick={() =>
                          setSelectedChatTarget({
                            id: u.id,
                            name: u.name,
                            role: u.role,
                            isGroup: false,
                            userObj: u,
                          })
                        }
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                          selectedChatTarget.id === u.id
                            ? 'bg-emerald-500 text-slate-950 font-black shadow'
                            : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-300 font-bold text-xs flex items-center justify-center border border-slate-700">
                            {u.name.substring(0, 2)}
                          </div>
                          <div>
                            <div className="truncate font-bold">{u.name}</div>
                            <div className="text-[9px] opacity-75 capitalize">{u.role}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Conversation Window */}
          <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-inner">
            
            {/* Chat Header */}
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  {selectedChatTarget.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedChatTarget.isGroup ? 'In-App Group Channel • Real-time Sync' : 'Direct Encrypted Conversation'}
                </p>
              </div>

              {/* Direct In-App Call Quick Actions for Selected Contact */}
              {!selectedChatTarget.isGroup && selectedChatTarget.userObj && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => triggerInAppCall(selectedChatTarget.userObj!, 'voice')}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1"
                    title="In-App Voice Call"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Voice Call
                  </button>

                  <button
                    onClick={() => triggerInAppCall(selectedChatTarget.userObj!, 'video')}
                    className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1"
                    title="In-App Video Call"
                  >
                    <Video className="w-3.5 h-3.5" /> Video Call
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Chat Stream */}
            <div className="flex-1 overflow-y-auto my-3 space-y-3 pr-2 text-xs max-h-[360px]">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-700 mx-auto" />
                  <p className="text-xs font-semibold">තවම පණිවිඩ හුවමාරු වී නොමැත. ප්‍රථම පණිවිඩය පහතින් යවන්න.</p>
                </div>
              ) : (
                filteredMessages.map((m) => {
                  const isMe = m.senderId === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="text-[10px] text-slate-400 px-1 font-semibold flex items-center gap-1">
                        <span>{m.senderName}</span>
                        <span className="text-slate-600 font-mono">({m.timestamp})</span>
                      </div>

                      <div
                        className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Toolbar */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {/* Quick Replies Strip */}
              <QuickRepliesBar
                onSelectReply={(text) => {
                  setMessageInput((prev) => (prev ? `${prev} ${text}` : text));
                }}
                onSendDirect={(text) => {
                  if (!currentUser) return;
                  if (selectedChatTarget.isGroup) {
                    sendMessage({
                      senderId: currentUser.id,
                      senderName: currentUser.name,
                      senderRole: currentUser.role,
                      receiverId: selectedChatTarget.id,
                      receiverName: selectedChatTarget.name,
                      receiverRole: 'agent',
                      content: text,
                    });
                  } else {
                    sendMessage({
                      senderId: currentUser.id,
                      senderName: currentUser.name,
                      senderRole: currentUser.role,
                      receiverId: selectedChatTarget.id,
                      receiverName: selectedChatTarget.name,
                      receiverRole: (selectedChatTarget.role as any) || 'agent',
                      content: text,
                    });
                  }
                }}
              />

              {isAttachmentOpen && (
                <div className="flex gap-2 text-xs bg-slate-900 p-2 rounded-xl border border-slate-800 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Attach කළ යුතු ලේඛනයේ / රූපයේ නම (උදා: Report.pdf)..."
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                  />
                  <button
                    onClick={() => setIsAttachmentOpen(false)}
                    className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl border border-slate-800 transition"
                  title="Attach File"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSendVoiceNote}
                  className={`p-2.5 rounded-xl border transition flex items-center gap-1 font-bold text-xs ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-900 text-emerald-400 border-slate-800 hover:bg-slate-800'
                  }`}
                  title="Voice Note"
                >
                  <Mic className="w-4 h-4" />
                  {isRecordingVoice && <span className="text-[10px]">00:{voiceTimer < 10 ? '0' : ''}{voiceTimer}</span>}
                </button>

                <input
                  type="text"
                  placeholder={`${selectedChatTarget.name} වෙත පණිවිඩයක් යවන්න...`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                />

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:opacity-95 transition flex items-center gap-1"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* MODE 2: IN-APP DIRECT CALLS (VOICE & VIDEO CALL CENTER) */}
      {mainTab === 'calls' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-400" />
                In-App Direct Voice &amp; Video Call Center
              </h3>
              <p className="text-xs text-slate-400">
                APP එක ඇතුලතින්ම ඕනෑම සාමාජිකයෙකුට HD Voice හෝ Video Call එකක් ක්ෂණිකව ලබා දෙන්න.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="සාමාජික අංකය හෝ නම..."
                value={callSearch}
                onChange={(e) => setCallSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users
              .filter((u) => u.id !== currentUser?.id)
              .filter(
                (u) =>
                  u.name.toLowerCase().includes(callSearch.toLowerCase()) ||
                  (u.mobile && u.mobile.includes(callSearch)) ||
                  (u.agentCode && u.agentCode.includes(callSearch))
              )
              .map((u) => {
                const cleanMob = u.mobile ? u.mobile.replace(/\D/g, '') : '';
                const waNum = cleanMob.startsWith('0') ? `94${cleanMob.substring(1)}` : cleanMob;
                const isValidMob = u.mobile && u.mobile !== 'නැත' && cleanMob.length >= 9;

                return (
                  <div
                    key={u.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow">
                          {u.name.substring(0, 2)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">{u.name}</h4>
                          <p className="text-[11px] text-emerald-400 font-semibold capitalize flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            {u.role === 'owner' ? 'Owner' : u.role === 'team_leader' ? 'Team Leader' : 'Agent'} {u.agentCode ? `(${u.agentCode})` : ''}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <PhoneCall className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-mono font-bold text-slate-200">
                              {isValidMob ? u.mobile : 'දුරකථන අංකය සක්‍රීයයි'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cellular & Social Quick Actions */}
                    {isValidMob ? (
                      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 grid grid-cols-3 gap-1.5 text-center text-[11px]">
                        <a
                          href={`tel:${u.mobile}`}
                          className="py-1.5 bg-emerald-600/30 hover:bg-emerald-500/50 border border-emerald-500/50 text-emerald-300 rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95"
                          title="දුරකථන ජාලය (Sim) හරහා කෙලින්ම Call එකක් ගන්න"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>SIM Call</span>
                        </a>

                        <a
                          href={`sms:${u.mobile}?body=${encodeURIComponent(`[DD WORLD System Notice]: සුබ දවසක් ${u.name}, Web Chat අත්හිටුවා ඇත. කරුණාකර DD WORLD Mobile App එක භාවිතා කරන්න: ${typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-dsekgfmwcewvlxn6gghirt-814098050496.asia-east1.run.app'}`)}`}
                          className="py-1.5 bg-sky-600/30 hover:bg-sky-500/50 border border-sky-500/50 text-sky-300 rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95"
                          title="දුරකථන ජාලය (Sim) හරහා කෙලින්ම SMS එකක් යවන්න"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>SIM SMS</span>
                        </a>

                        <a
                          href={`https://wa.me/${waNum}?text=${encodeURIComponent(`සුබ දවසක් ${u.name}, DD WORLD App එක සක්‍රීයයි. Direct Web Chat අත්හිටුවා ඇත. Mobile App එකට පිවිසෙන්න: ${typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-dsekgfmwcewvlxn6gghirt-814098050496.asia-east1.run.app'}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 bg-green-600/30 hover:bg-green-500/50 border border-green-500/50 text-green-300 rounded-lg font-bold flex flex-col items-center justify-center gap-0.5 transition active:scale-95"
                          title="WhatsApp මගින් පණිවිඩයක් යවන්න"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    ) : (
                      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-2 text-center text-[10px] text-amber-400 font-semibold">
                        ⚠️ දුරකථන ජාල සේවාව පද්ධතිය තුල සක්‍රීය වෙමින් පවතී
                      </div>
                    )}

                    {/* Data / In-App Platform Actions */}
                    <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => triggerInAppCall(u, 'voice')}
                        className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl shadow transition flex items-center justify-center gap-1.5"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> In-App Voice
                      </button>

                      <button
                        onClick={() => triggerInAppCall(u, 'video')}
                        className="py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-xl shadow transition flex items-center justify-center gap-1.5"
                      >
                        <Video className="w-3.5 h-3.5" /> In-App Video
                      </button>
                    </div>

                    <div className="pt-1 flex justify-between items-center text-[11px] text-slate-400">
                      <button
                        onClick={() => {
                          setSelectedChatTarget({ id: u.id, name: u.name, role: u.role, isGroup: false, userObj: u });
                          setMainTab('chat');
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> In-App Chat
                      </button>

                      {isValidMob && (
                        <a
                          href={`sms:${u.mobile}?body=${encodeURIComponent(`[DD WORLD Meeting Invite]: සුබ දවසක් ${u.name}, Web Chat අත්හිටුවා ඇත. Meeting එකට සම්බන්ධ වීමට DD WORLD App එක භාවිතා කරන්න: ${typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-dsekgfmwcewvlxn6gghirt-814098050496.asia-east1.run.app'}`)}`}
                          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                        >
                          <Users className="w-3 h-3" /> Invite Meeting
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODE 3: IN-APP GROUP VIDEO MEETINGS */}
      {mainTab === 'meetings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              පවතින සහ සක්‍රීය Live Group Meetings
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Active Rooms: {filteredMeetings.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMeetings.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between hover:border-amber-500/60 transition group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE ROOM
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Code: {m.code}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition leading-snug">
                    {m.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setActiveMeeting(m)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    සජීවීව Meeting එකට සම්බන්ධ වෙන්න
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE MEETING MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-400" />
                අලුත් සජීවී Meeting එකක් සාදන්න
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Target Group (ලක්සිය සාමාජිකයින්):</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="all">🌐 Owner &gt; මුළු ආයතනයටම (All Members)</option>
                  <option value="tls_only">🛡️ Owner &gt; Team Leaders පමණි (TL Sync)</option>
                  <option value="my_team">🚩 Team Leader &gt; Team Agents (My Team)</option>
                  <option value="specific_team">🎯 සුවිශේෂී කණ්ඩායම (Specific Team)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Meeting මාතෘකාව:</label>
                <input
                  type="text"
                  required
                  placeholder="උදා: සතිපතා Sales Review Meeting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">විස්තරය (Description):</label>
                <textarea
                  rows={2}
                  placeholder="රැස්වීමේ ප්‍රධාන කරුණු හා අරමුණ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">දිනය සහ වේලාව:</label>
                <input
                  type="text"
                  placeholder="උදා: Today at 10:30 AM"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg"
                >
                  ආරම්භ කරන්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
