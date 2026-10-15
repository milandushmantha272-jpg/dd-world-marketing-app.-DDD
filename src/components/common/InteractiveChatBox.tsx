import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User, UserRole, ChatMessage } from '../../types';
import {
  Send,
  MessageSquare,
  Phone,
  Video,
  Search,
  UserCheck,
  CheckCheck,
  Sparkles,
  Users,
  ArrowLeft,
  Circle,
  PhoneCall,
} from 'lucide-react';

export interface InteractiveChatBoxProps {
  teamId?: string;
  filterRole?: UserRole;
  defaultReceiverId?: string;
  onStartCall?: (targetUser: User, type: 'audio' | 'video') => void;
}

export const InteractiveChatBox: React.FC<InteractiveChatBoxProps> = ({
  teamId,
  filterRole,
  defaultReceiverId,
  onStartCall,
}) => {
  const { currentUser } = useAuth();
  const { users, messages, sendMessage, startCall, teams } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(defaultReceiverId || null);
  const [inputText, setInputText] = useState('');
  const [showMobileList, setShowMobileList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available chat contacts excluding self
  const availableContacts = users.filter((u) => {
    if (!currentUser) return false;
    if (u.id === currentUser.id) return false;
    if (filterRole && u.role !== filterRole) return false;
    if (teamId && u.teamId && u.teamId !== teamId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchCode = u.agentCode?.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      return matchName || matchCode || matchRole;
    }
    return true;
  });

  // Auto-select first contact if none selected
  useEffect(() => {
    if (!selectedUserId && availableContacts.length > 0) {
      if (defaultReceiverId && availableContacts.some((u) => u.id === defaultReceiverId)) {
        setSelectedUserId(defaultReceiverId);
      } else {
        setSelectedUserId(availableContacts[0].id);
      }
    }
  }, [availableContacts, selectedUserId, defaultReceiverId]);

  const selectedContact = users.find((u) => u.id === selectedUserId);

  // Filter messages between current user and selected contact
  const conversationMessages = messages.filter((m) => {
    if (!currentUser || !selectedUserId) return false;
    return (
      (m.senderId === currentUser.id && m.receiverId === selectedUserId) ||
      (m.senderId === selectedUserId && m.receiverId === currentUser.id)
    );
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, selectedUserId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentUser || !selectedContact) return;

    sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      receiverId: selectedContact.id,
      receiverName: selectedContact.name,
      receiverRole: selectedContact.role,
      content: inputText.trim(),
    });

    setInputText('');
  };

  const handleTriggerCall = (type: 'audio' | 'video') => {
    if (!selectedContact) return;
    if (onStartCall) {
      onStartCall(selectedContact, type);
    } else if (startCall) {
      startCall(selectedContact, type === 'audio' ? 'voice' : 'video', currentUser || undefined);
    }
  };

  const quickPrompts = [
    'අද දින Dialog ගොවිමිතුරු (#616#) ඉලක්කය සම්පූර්ණ කරන්න!',
    'සයුරු (#828#) ලියාපදිංචි කිරීම් පිළිබඳ වාර්තාවක් ලබාදෙන්න.',
    'කරුණාකර හදිසි සාකච්ඡාවකට සම්බන්ධ වන්න.',
    'අද දින පැමිණීම (Attendance) සහ GPS Location සක්‍රීයද?',
    'විශිෂ්ටයි! අද දින ඔබේ ඉලක්කය සාර්ථකව සම්පූර්ණ කර ඇත. 👍',
  ];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">👑 OWNER</span>;
      case 'team_leader':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">🛡️ TEAM LEADER</span>;
      case 'agent':
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">👤 AGENT</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[650px] max-h-[85vh] text-white">
      {/* LEFT PANE: CONTACTS DIRECTORY */}
      <div
        className={`${
          showMobileList ? 'flex' : 'hidden md:flex'
        } flex-col w-full md:w-80 border-r border-slate-800 bg-slate-950 shrink-0`}
      >
        {/* Contact Directory Header */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-sm text-amber-400">
              <MessageSquare className="w-4 h-4" />
              <span>සජීවී Chat Console</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">
              {availableContacts.length} Contacts
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="නම, Code හෝ තනතුර අනුව සොයන්න..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {availableContacts.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>සම්බන්ධතා කිසිවක් හමු නොවීය.</p>
            </div>
          ) : (
            availableContacts.map((contact) => {
              const isSelected = selectedUserId === contact.id;
              // Check unread count
              const unreadCount = messages.filter(
                (m) => m.senderId === contact.id && m.receiverId === currentUser?.id && !m.read
              ).length;

              return (
                <button
                  key={contact.id}
                  onClick={() => {
                    setSelectedUserId(contact.id);
                    setShowMobileList(false);
                  }}
                  className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
                    isSelected
                      ? 'bg-amber-500/10 border-l-4 border-amber-500'
                      : 'hover:bg-slate-900/80 border-l-4 border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-amber-300">
                      {contact.name.substring(0, 1)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-white truncate">{contact.name}</p>
                      {unreadCount > 0 && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      {getRoleBadge(contact.role)}
                      {contact.agentCode && <span className="font-mono text-[10px]">#{contact.agentCode}</span>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT PANE: ACTIVE CONVERSATION */}
      <div
        className={`${
          !showMobileList ? 'flex' : 'hidden md:flex'
        } flex-col flex-1 bg-slate-900 overflow-hidden`}
      >
        {selectedContact ? (
          <>
            {/* Conversation Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-amber-400">
                    {selectedContact.name.substring(0, 1)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white truncate flex items-center gap-2">
                    {selectedContact.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    {getRoleBadge(selectedContact.role)}
                    {selectedContact.mobile && (
                      <span className="font-mono text-[11px] text-slate-300">📞 {selectedContact.mobile}</span>
                    )}
                    {selectedContact.teamName && (
                      <span className="hidden sm:inline text-slate-400">• {selectedContact.teamName}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Call Initiation Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleTriggerCall('audio')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition"
                  title="Voice Call එකක් ලබාගන්න"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Voice Call</span>
                </button>
                <button
                  onClick={() => handleTriggerCall('video')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition"
                  title="Video Meeting එකක් ආරම්භ කරන්න"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Video Call</span>
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/40">
              {conversationMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-amber-400">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-300">පණිවිඩ ඉතිහාසයක් නැත</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {selectedContact.name} සමඟ සජීවීව පණිවිඩ හුවමාරු කරගැනීමට පහතින් පණිවිඩයක් ලියන්න හෝ Quick Prompts භාවිත කරන්න.
                  </p>
                </div>
              ) : (
                conversationMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-md ${
                          isMe
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-tr-none font-medium'
                            : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {!isMe && (
                          <p className="text-[10px] font-black text-amber-400 mb-1">
                            {msg.senderName} ({msg.senderRole?.toUpperCase()})
                          </p>
                        )}
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content || msg.message}
                        </p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isMe ? 'text-slate-900/80 font-bold' : 'text-slate-400'
                          }`}
                        >
                          <span>{msg.timestamp}</span>
                          {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts Bar */}
            <div className="px-3 py-2 bg-slate-950 border-t border-slate-800/80 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
              <span className="text-[10px] font-bold text-amber-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Quick Prompts:
              </span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                placeholder={`${selectedContact.name} වෙත පණිවිඩයක් ලියන්න... (Enter to send)`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <Users className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-xs">කරුණාකර සංවාදයක් ආරම්භ කිරීමට වම්පසින් සේවකයෙකු තෝරන්න.</p>
          </div>
        )}
      </div>
    </div>
  );
};
