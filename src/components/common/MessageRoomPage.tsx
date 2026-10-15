import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Megaphone, Users, Bell } from 'lucide-react';
import { CompanyMessageCenter } from './CompanyMessageCenter';
import { InteractiveChatBox } from './InteractiveChatBox';

export const MessageRoomPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>('chat');

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">
                පණිවිඩ සහ සන්නිවේදන කේන්ද්‍රය • Message Room
              </h1>
              <p className="text-sm text-slate-400">
                ආයතනික නිවේදන සහ ක්ෂේත්‍ර කණ්ඩායම් සජීවී සාකච්ඡා
              </p>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'chat'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              කණ්ඩායම් සාකච්ඡාව (Live Chat)
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'announcements'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              නිල නිවේදන (Announcements)
            </button>
          </div>
        </div>
      </div>

      {/* Content View */}
      {activeTab === 'chat' ? (
        <InteractiveChatBox />
      ) : (
        <CompanyMessageCenter />
      )}
    </div>
  );
};
