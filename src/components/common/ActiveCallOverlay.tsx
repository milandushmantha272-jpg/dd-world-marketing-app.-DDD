import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX, Monitor, Shield, Users, Zap, MessageSquare, Copy, Check, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { PREDEFINED_QUICK_REPLIES, QuickReplyTemplate } from '../../data/quickRepliesData';
import { QuickReplyTemplatesModal } from './QuickReplyTemplatesModal';

export const ActiveCallOverlay: React.FC = () => {
  const { activeCall, endCall, sendMessage } = useData();
  const { currentUser } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(activeCall?.type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Quick Replies Drawer State
  const [isQuickRepliesOpen, setIsQuickRepliesOpen] = useState(false);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sentToast, setSentToast] = useState<string | null>(null);

  useEffect(() => {
    if (activeCall?.status !== 'connected') return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCall?.status]);

  if (!activeCall || activeCall.status !== 'connected') return null;

  const partnerName = currentUser?.id === activeCall.callerId ? activeCall.receiverName : activeCall.callerName;
  const partnerId = currentUser?.id === activeCall.callerId ? activeCall.receiverId : activeCall.callerId;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleCopyScript = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSendInCallMessage = (text: string) => {
    if (!currentUser || !partnerId) return;
    sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: partnerId,
      receiverName: partnerName,
      receiverRole: 'agent',
      content: `[CALL QUICK REPLY]: ${text}`,
    });
    setSentToast('පණිවිඩය සාර්ථකව යවන ලදී!');
    setTimeout(() => setSentToast(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl p-5 sm:p-6 text-center relative overflow-hidden animate-fade-in my-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Encrypted Call • {formatTime(secondsElapsed)}
          </div>
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            DD WORLD Secure
          </div>
        </div>

        {/* Toast Alert */}
        {sentToast && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
            ✅ {sentToast}
          </div>
        )}

        {/* Call Visualizer / Video Container */}
        <div className="relative w-full h-40 sm:h-44 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden mb-4 shadow-inner">
          {isVideoOn ? (
            <div className="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg mb-1 animate-pulse">
                {partnerName.charAt(0)}
              </div>
              <p className="text-xs text-emerald-400 font-semibold">HD Live Video Connected</p>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-slate-300">
                720p 60fps
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 via-emerald-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-2xl border-2 border-emerald-400/40">
                  {partnerName.charAt(0)}
                </div>
                {/* Equalizer Wave Simulation */}
                <div className="absolute -bottom-2 inset-x-0 flex justify-center gap-1">
                  <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce delay-75" />
                  <span className="w-1 h-5 bg-emerald-300 rounded-full animate-bounce delay-100" />
                  <span className="w-1 h-7 bg-emerald-500 rounded-full animate-bounce delay-150" />
                  <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce delay-200" />
                  <span className="w-1 h-2 bg-emerald-300 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Participant Info */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5">
          {partnerName}
        </h3>
        <p className="text-xs text-blue-300 font-medium mb-4 flex items-center justify-center gap-2">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          Direct Line • {activeCall.type.toUpperCase()} Call Active
        </p>

        {/* Quick Reply & Call Scripts Drawer Toggle */}
        <div className="mb-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl p-2.5 text-left">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsQuickRepliesOpen(!isQuickRepliesOpen)}
              className="flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Call Scripts &amp; Quick Replies ({PREDEFINED_QUICK_REPLIES.length})</span>
              {isQuickRepliesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsFullModalOpen(true)}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition"
            >
              Open Library
            </button>
          </div>

          {/* Quick Script Pills Accordion */}
          {isQuickRepliesOpen && (
            <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-800 max-h-48 overflow-y-auto pr-1">
              <p className="text-[10px] text-slate-400 font-medium">
                ඇමතුම අතරතුර කියවීමට හෝ Copy කිරීමට Script එකක් තෝරන්න:
              </p>
              <div className="space-y-1.5">
                {PREDEFINED_QUICK_REPLIES.slice(0, 6).map((qr) => {
                  const isCopied = copiedId === qr.id;
                  return (
                    <div
                      key={qr.id}
                      className="p-2 bg-slate-900 hover:bg-slate-850 rounded-xl border border-slate-800 flex items-start justify-between gap-2 text-xs transition"
                    >
                      <div className="flex-1 text-left">
                        <div className="font-bold text-[11px] text-white flex items-center gap-1.5">
                          <span className="text-amber-400">{qr.shortCode}</span>
                          <span>{qr.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{qr.text}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleCopyScript(qr.id, qr.text)}
                          className={`p-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                            isCopied ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title="Copy script"
                        >
                          {isCopied ? <Check className="w-3 h-3 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendInCallMessage(qr.text)}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
                          title="Send as message to caller"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 text-xs font-semibold transition ${
              isMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
            <span className="text-[10px]">{isMuted ? 'Muted' : 'Mic On'}</span>
          </button>

          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 text-xs font-semibold transition ${
              !isVideoOn ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
            }`}
          >
            {isVideoOn ? <Video className="w-5 h-5 text-blue-400" /> : <VideoOff className="w-5 h-5" />}
            <span className="text-[10px]">{isVideoOn ? 'Cam On' : 'Cam Off'}</span>
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 text-xs font-semibold transition ${
              !isSpeakerOn ? 'bg-slate-800 text-slate-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-[10px]">{isSpeakerOn ? 'Speaker' : 'Mute Spk'}</span>
          </button>

          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-3 rounded-2xl flex flex-col items-center gap-1 text-xs font-semibold transition ${
              isScreenSharing ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Monitor className="w-5 h-5 text-teal-400" />
            <span className="text-[10px]">Share</span>
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center gap-1 text-xs font-bold shadow-lg shadow-rose-600/30 transition transform active:scale-95 cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-[10px]">End</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-950/60 py-2 rounded-xl border border-slate-800">
          🔒 End-to-End Encrypted DD WORLD Communication
        </div>
      </div>

      {/* Full Quick Replies Library Modal */}
      <QuickReplyTemplatesModal
        isOpen={isFullModalOpen}
        onClose={() => setIsFullModalOpen(false)}
        onSelectTemplate={(text) => handleCopyScript('modal-sel', text)}
        onDirectSend={(text) => handleSendInCallMessage(text)}
        title="Active Call Quick Replies & Scripts"
        subtitle={`Live Support Call with ${partnerName} • One-click copy or send`}
      />
    </div>
  );
};

