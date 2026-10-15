import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Users,
  CalendarCheck,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  PlusCircle,
  RefreshCw,
  LogOut,
  CalendarDays,
  Smartphone,
  Check,
  UserCheck,
  Filter,
  BookOpen,
  Target,
  Megaphone,
  Award,
  IdCard,
  Map,
  Share2,
  Globe,
  Radio,
  Trophy,
  MessageSquare,
  Phone,
  PhoneCall,
} from 'lucide-react';
import { IvrKeypadAndAppShareModal } from '../sales/IvrKeypadAndAppShareModal';
import { IvrAndAppActivationsHub } from '../owner/IvrAndAppActivationsHub';
import { SriLankaGpsMapView } from '../common/SriLankaGpsMapModal';
import { getAttendanceSummary, getSalesSummary } from '../../utils/summaryUtils';
import { AutoMotivationBanner } from '../common/AutoMotivationBanner';
import { ProductKnowledgeCenter } from '../common/ProductKnowledgeCenter';
import { PerformanceTargetDashboard } from '../common/PerformanceTargetDashboard';
import { CompanyMessageCenter } from '../common/CompanyMessageCenter';
import { InteractiveChatBox } from '../common/InteractiveChatBox';
import { DialogPerformanceManager } from '../common/DialogPerformanceManager';
import { DigitalEmployeeIdCard } from '../common/DigitalEmployeeIdCard';
import { DayStartWorkAreaModal } from '../common/DayStartWorkAreaModal';
import { GamifiedLeaderboard } from '../common/GamifiedLeaderboard';
import { VirtualMeetingHub } from '../common/VirtualMeetingHub';
import { InAppWebViewModal } from '../common/InAppWebViewModal';
import { UniversalSmartLinkModal } from '../common/UniversalSmartLinkModal';
import { detectFakeGps } from '../../utils/antiCheatDetector';

type TlTab =
  | 'attendance'
  | 'sales'
  | 'ivr_keypad'
  | 'ivr_hub'
  | 'team_agents'
  | 'gps'
  | 'product_knowledge'
  | 'target_dashboard'
  | 'company_messages'
  | 'chat'
  | 'dialog_performance'
  | 'digital_id'
  | 'work_area'
  | 'leaderboard'
  | 'meetings';

export const TeamLeaderDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    users,
    attendance,
    sales,
    addAttendanceRecord,
    addProductSale,
    updateUserGps,
    updateUserAppStatus,
    addSecurityAlert,
  } = useData();

  const [showSmartLinkModal, setShowSmartLinkModal] = useState(false);
  const [showWebViewModal, setShowWebViewModal] = useState(false);
  const [showKeypadModal, setShowKeypadModal] = useState(false);
  const [webViewChannel, setWebViewChannel] = useState<'website' | 'facebook' | 'whatsapp' | 'dialog'>('website');

  const [activeTab, setActiveTab] = useState<TlTab>('attendance');

  // TL Own Attendance Form
  const [attStatus, setAttStatus] = useState<'present' | 'half_day'>('present');
  const [attMessage, setAttMessage] = useState<string | null>(null);

  // TL Sales Form (For TL directly or adding on behalf of Team Agent)
  const [targetUser, setTargetUser] = useState<string>('ME');
  const [productType, setProductType] = useState<'ගොවිමිතුරු' | 'සයුරු' | 'අනෙකුත්'>('ගොවිමිතුරු');
  const [channel, setChannel] = useState<'IVR' | 'APP'>('IVR');
  const [quantity, setQuantity] = useState<string>('1');
  const [saleNotes, setSaleNotes] = useState('');
  const [saleSuccess, setSaleSuccess] = useState(false);

  // GPS Refresh State
  const [gpsRefreshing, setGpsRefreshing] = useState(false);

  if (!currentUser) return null;

  // Team Agents list
  const myTeamAgents = users.filter(
    (u) => u && u.role === 'agent' && (u.teamId === currentUser.teamId || u.teamLeaderId === currentUser.id)
  );

  // Combine TL + Team Agents users list
  const myTeamUsers = [currentUser, ...myTeamAgents];
  const myTeamUserIds = myTeamUsers.map((u) => u.id);

  // Filter Attendance & Sales for the entire team
  const teamAttendance = attendance.filter((a) => myTeamUserIds.includes(a.agentId));
  const teamSales = sales.filter((s) => myTeamUserIds.includes(s.agentId));

  // TL Own Attendance & Sales
  const tlAttendance = attendance.filter((a) => a.agentId === currentUser.id);

  // Summaries
  const teamAttSummary = getAttendanceSummary(teamAttendance);
  const teamSalesSummary = getSalesSummary(teamSales);

  const dateTodayStr = new Date().toISOString().split('T')[0];
  const todayTlAttRecord = tlAttendance.find((a) => a.date === dateTodayStr);

  const handleTlCheckIn = () => {
    if (todayTlAttRecord?.checkInTime) {
      setAttMessage('⚠️ අද දින පැමිණීම (Check-In) දැනටමත් සටහන් කර ඇත.');
      setTimeout(() => setAttMessage(null), 4000);
      return;
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const fakeCheck = detectFakeGps(pos.coords);
          if (fakeCheck.isFake) {
            addSecurityAlert({
              userId: currentUser.id,
              userName: currentUser.name,
              agentCode: currentUser.agentCode || 'TL-000',
              type: 'GPS_SPOOFING',
              reason: `Mock Location detected during TL Check-In: ${fakeCheck.reason}`,
              severity: 'critical',
              coordinates: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
            });
            setAttMessage('⚠️ වංචනික Mock Location / Fake GPS හඳුනාගන්නා ලදී! GPS පැමිණීම අවහිර කරන ලදී.');
            setTimeout(() => setAttMessage(null), 5000);
            return;
          }

          updateUserGps(currentUser.id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });

          addAttendanceRecord({
            agentId: currentUser.id,
            agentName: currentUser.name,
            agentCode: currentUser.agentCode || 'TL-000',
            teamId: currentUser.teamId || 'team_dilan',
            teamName: currentUser.teamName || 'Dilan Team (දිලාන් කණ්ඩායම)',
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: attStatus,
          });
          setAttMessage('✅ Team Leader පැමිණීම (Check-In) සාර්ථකව සටහන් කරන ලදී.');
          setTimeout(() => setAttMessage(null), 4000);
        },
        (err) => {
          console.warn('TL GPS error:', err);
          addAttendanceRecord({
            agentId: currentUser.id,
            agentName: currentUser.name,
            agentCode: currentUser.agentCode || 'TL-000',
            teamId: currentUser.teamId || 'team_dilan',
            teamName: currentUser.teamName || 'Dilan Team (දිලාන් කණ්ඩායම)',
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: attStatus,
          });
          setAttMessage('✅ Team Leader පැමිණීම (Check-In) සාර්ථකව සටහන් කරන ලදී.');
          setTimeout(() => setAttMessage(null), 4000);
        },
        { enableHighAccuracy: true }
      );
    } else {
      addAttendanceRecord({
        agentId: currentUser.id,
        agentName: currentUser.name,
        agentCode: currentUser.agentCode || 'TL-000',
        teamId: currentUser.teamId || 'team_dilan',
        teamName: currentUser.teamName || 'Dilan Team (දිලාන් කණ්ඩායම)',
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: attStatus,
      });
      setAttMessage('✅ Team Leader පැමිණීම (Check-In) සාර්ථකව සටහන් කරන ලදී.');
      setTimeout(() => setAttMessage(null), 4000);
    }
  };

  const handleTlCheckOut = () => {
    if (todayTlAttRecord?.checkOutTime) {
      setAttMessage('⚠️ අද දින පිටවීම (Check-Out) දැනටමත් සටහන් කර ඇත.');
      setTimeout(() => setAttMessage(null), 4000);
      return;
    }
    addAttendanceRecord({
      agentId: currentUser.id,
      agentName: currentUser.name,
      agentCode: currentUser.agentCode || 'TL-000',
      teamId: currentUser.teamId || 'team_dilan',
      teamName: currentUser.teamName || 'Dilan Team (දිලාන් කණ්ඩායම)',
      checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'completed',
    });

    setAttMessage('✅ Team Leader පිටවීම (Check-Out) සාර්ථකව සටහන් කරන ලදී.');
    setTimeout(() => setAttMessage(null), 4000);
  };

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = productType === 'ගොවිමිතුරු' ? '#616#' : productType === 'සයුරු' ? '#828#' : 'Other';
    const parsedQty = parseInt(quantity, 10);
    const finalQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 1;

    let sellerId = currentUser.id;
    let sellerName = currentUser.name;
    let sellerCode = currentUser.agentCode || 'TL-000';

    if (targetUser !== 'ME') {
      const foundAg = myTeamAgents.find((a) => a.id === targetUser);
      if (foundAg) {
        sellerId = foundAg.id;
        sellerName = foundAg.name;
        sellerCode = foundAg.agentCode || 'AG-000';
      }
    }

    addProductSale({
      agentId: sellerId,
      agentName: sellerName,
      agentCode: sellerCode,
      teamId: currentUser.teamId || 'team_dilan',
      productType,
      channel,
      quantity: finalQty,
      productName: `${productType} (${code}) [${channel}]`,
      customerName: '',
      customerMobile: '',
      amount: 0,
      notes: saleNotes,
    });

    setSaleSuccess(true);
    setSaleNotes('');
    setQuantity('1');
    setTimeout(() => setSaleSuccess(false), 3000);
  };

  const handleRefreshGps = () => {
    setGpsRefreshing(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateUserGps(currentUser.id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setGpsRefreshing(false);
        },
        () => setGpsRefreshing(false)
      );
    } else {
      setGpsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 p-0.5 shadow-lg shadow-purple-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-purple-300 text-lg">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-extrabold uppercase">
                  Team Leader Platform
                </span>
                <span className="font-mono text-xs text-amber-400 font-bold">
                  {currentUser.teamName || 'Team Alpha'}
                </span>
              </div>
              <h1 className="text-xl font-black text-white mt-1">{currentUser.name}</h1>
              <p className="text-xs text-slate-400">
                Team Members: <strong className="text-white">{myTeamAgents.length} Agents</strong> • {currentUser.mobile || 'No Phone'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSmartLinkModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Smart Link</span>
            </button>
            <button
              onClick={() => {
                setWebViewChannel('website');
                setShowWebViewModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Corporate Web</span>
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto Rotating Motivation Banner */}
      <AutoMotivationBanner />

      {/* Navigation Tabs - Core & Upgraded TL Features */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>📅 Team Attendance &amp; Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sales'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>📈 Team Sales &amp; Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('ivr_keypad')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ivr_keypad'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : 'text-amber-300 hover:text-white hover:bg-amber-500/10 border border-amber-500/30'
          }`}
        >
          <Phone className="w-4 h-4 text-amber-400" />
          <span>📞 #828# / #616# Keypad &amp; App</span>
        </button>

        <button
          onClick={() => setActiveTab('ivr_hub')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ivr_hub'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
              : 'text-emerald-300 hover:text-white hover:bg-emerald-500/10 border border-emerald-500/30'
          }`}
        >
          <PhoneCall className="w-4 h-4 text-emerald-400" />
          <span>📡 Activations Live Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>🏆 Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'meetings'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Radio className="w-4 h-4 text-indigo-400" />
          <span>🎥 Virtual Meetings</span>
        </button>

        <button
          onClick={() => setActiveTab('target_dashboard')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'target_dashboard'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Target className="w-4 h-4 text-emerald-400" />
          <span>🎯 Targets &amp; Rs.30 Rule</span>
        </button>

        <button
          onClick={() => setActiveTab('product_knowledge')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'product_knowledge'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>🎓 Product Knowledge</span>
        </button>

        <button
          onClick={() => setActiveTab('company_messages')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'company_messages'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Megaphone className="w-4 h-4 text-purple-400" />
          <span>📢 Messages</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>💬 Live Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('dialog_performance')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dialog_performance'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Award className="w-4 h-4 text-blue-400" />
          <span>📊 Dialog Records</span>
        </button>

        <button
          onClick={() => setActiveTab('digital_id')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'digital_id'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <IdCard className="w-4 h-4 text-cyan-400" />
          <span>🪪 Digital Employee ID</span>
        </button>

        <button
          onClick={() => setActiveTab('work_area')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'work_area'
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Map className="w-4 h-4 text-rose-400" />
          <span>📍 Day Start Work Area</span>
        </button>

        <button
          onClick={() => setActiveTab('team_agents')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'team_agents'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Team Members ({myTeamAgents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gps')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gps'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>📍 Team GPS Map</span>
        </button>
      </div>

      {/* TAB 1: TEAM LEADER & TEAM ATTENDANCE + SUMMARIES */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {attMessage && (
            <div className="p-4 rounded-2xl bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
              <span>{attMessage}</span>
            </div>
          )}

          {/* TL Own Attendance Marking */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                  <span>Team Leader ස්වයං පැමිණීම (TL Attendance Mark)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  අද දිනය: <strong className="text-purple-300">{dateTodayStr}</strong>
                </p>
              </div>

              {todayTlAttRecord?.checkInTime && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold">
                  🟢 TL Checked-In ({todayTlAttRecord.checkInTime})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">පැමිණීමේ තත්ත්වය</label>
                <select
                  value={attStatus}
                  onChange={(e) => setAttStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="present">සම්පූර්ණ දිනය (Full Day)</option>
                  <option value="half_day">අර්ධ දිනය (Half Day)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleTlCheckIn}
                  disabled={Boolean(todayTlAttRecord?.checkInTime)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg ${
                    todayTlAttRecord?.checkInTime
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Check-In Mark කරන්න</span>
                </button>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleTlCheckOut}
                  disabled={!todayTlAttRecord?.checkInTime || Boolean(todayTlAttRecord?.checkOutTime)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg ${
                    !todayTlAttRecord?.checkInTime || todayTlAttRecord?.checkOutTime
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Check-Out Mark කරන්න</span>
                </button>
              </div>
            </div>
          </div>

          {/* Team Weekly & Monthly Attendance Summary */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-400" />
                  <span>කණ්ඩායමේ පැමිණීම් සාරාංශය (Team Attendance Weekly &amp; Monthly Summary)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  සති 1, සති 2, සති 3, සති 4 සහ මාසික පැමිණීම් සාරාංශය.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-extrabold text-xs">
                {teamAttSummary.monthlyPresent} Days Present Total
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 1 (Days 1-7)</span>
                <span className="text-xl font-black text-purple-300 mt-1 block">{teamAttSummary.week1Present}</span>
                <span className="text-[10px] text-slate-500">දින පැමිණීම්</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 2 (Days 8-14)</span>
                <span className="text-xl font-black text-purple-300 mt-1 block">{teamAttSummary.week2Present}</span>
                <span className="text-[10px] text-slate-500">දින පැමිණීම්</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 3 (Days 15-21)</span>
                <span className="text-xl font-black text-purple-300 mt-1 block">{teamAttSummary.week3Present}</span>
                <span className="text-[10px] text-slate-500">දින පැමිණීම්</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 4 (Days 22-31)</span>
                <span className="text-xl font-black text-purple-300 mt-1 block">{teamAttSummary.week4Present}</span>
                <span className="text-[10px] text-slate-500">දින පැමිණීම්</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center">
                <span className="text-[10px] text-purple-400 font-extrabold uppercase block">මාසික එකතුව</span>
                <span className="text-xl font-black text-white mt-1 block">{teamAttSummary.monthlyPresent}</span>
                <span className="text-[10px] text-purple-300">Total Team Days</span>
              </div>
            </div>

            {/* Attendance Logs Table */}
            <div className="pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 mb-3">කණ්ඩායමේ පැමිණීම් ලේඛනය (Team Attendance Log)</h4>
              {teamAttendance.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center bg-slate-950/40 rounded-2xl">
                  කණ්ඩායමේ පැමිණීම් සටහන් වී නැත.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">දිනය</th>
                        <th className="pb-2">සාමාජිකයා</th>
                        <th className="pb-2">Check-In</th>
                        <th className="pb-2">Check-Out</th>
                        <th className="pb-2 text-right">තත්ත්වය</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {teamAttendance.slice().reverse().map((a, idx) => (
                        <tr key={a.id || idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 font-mono text-slate-300">{a.date}</td>
                          <td className="py-2.5 font-bold text-white">{a.agentName} ({a.agentCode})</td>
                          <td className="py-2.5 font-mono text-emerald-400">{a.checkInTime || '-'}</td>
                          <td className="py-2.5 font-mono text-amber-400">{a.checkOutTime || '-'}</td>
                          <td className="py-2.5 text-right font-bold text-purple-300 capitalize">{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEAM LEADER & TEAM SALES + SUMMARIES */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {saleSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>✅ අලෙවිය (Sale) සාර්ථකව පද්ධතියට එක් කරන ලදී!</span>
            </div>
          )}

          {/* Sales Entry Form - Dedicated for TL Personal Sales */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <span>Team Leader පෞද්ගලික අලෙවිය සටහන් කිරීම (TL Personal Sales)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Team Leader ගේ සෘජු පෞද්ගලික අලෙවියන් (Personal Direct Sales) පහතින් සටහන් කරන්න. (Agent අලෙවියන් Agent විසින්ම Mobile App හරහා සටහන් කරනු ලබයි).
              </p>
            </div>

            <form onSubmit={handleSaleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">වර්ගය (Sales Type)</label>
                <div className="w-full px-4 py-2.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200 font-bold">
                  මගේම සෘජු අලෙවියක් (TL Personal Sale)
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">නිෂ්පාදනය</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="ගොවිමිතුරු">ගොවිමිතුරු (#616#)</option>
                  <option value="සයුරු">සයුරු (#828#)</option>
                  <option value="අනෙකුත්">අනෙකුත්</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">මාර්ගය</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                >
                  <option value="IVR">IVR Dial</option>
                  <option value="APP">App Signup</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">ප්‍රමාණය</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-xs font-bold text-slate-300">සටහන් (Notes)</label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="විස්තර හෝ සටහන්..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sale එක Mark කරන්න</span>
                </button>
              </div>
            </form>
          </div>

          {/* Team Sales Weekly & Monthly Summary */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-400" />
                  <span>කණ්ඩායමේ අලෙවි සාරාංශය (Team Sales Weekly &amp; Monthly Summary)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  සති 1, සති 2, සති 3, සති 4 සහ මාසික මුළු අලෙවි ප්‍රමාණය.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-xs">
                {teamSalesSummary.monthlyQuantity} Total Units
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 1 (Days 1-7)</span>
                <span className="text-xl font-black text-purple-300 mt-1 block">{teamSalesSummary.week1Quantity}</span>
                <span className="text-[10px] text-slate-500">{teamSalesSummary.week1Count} Sales</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 2 (Days 8-14)</span>
                <span className="text-xl font-black text-purple-300 mt-1 block">{teamSalesSummary.week2Quantity}</span>
                <span className="text-[10px] text-slate-500">{teamSalesSummary.week2Count} Sales</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 3 (Days 15-21)</span>
                <span className="text-xl font-black text-purple-300 mt-1 block">{teamSalesSummary.week3Quantity}</span>
                <span className="text-[10px] text-slate-500">{teamSalesSummary.week3Count} Sales</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 4 (Days 22-31)</span>
                <span className="text-xl font-black text-purple-300 mt-1 block">{teamSalesSummary.week4Quantity}</span>
                <span className="text-[10px] text-slate-500">{teamSalesSummary.week4Count} Sales</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center">
                <span className="text-[10px] text-purple-400 font-extrabold uppercase block">මාසික එකතුව</span>
                <span className="text-xl font-black text-white mt-1 block">{teamSalesSummary.monthlyQuantity}</span>
                <span className="text-[10px] text-purple-300">Total Team Sales</span>
              </div>
            </div>

            {/* Team Sales Log */}
            <div className="pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 mb-3">කණ්ඩායමේ අලෙවි ලේඛනය (Team Sales Log)</h4>
              {teamSales.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center bg-slate-950/40 rounded-2xl">
                  කණ්ඩායමේ අලෙවි සටහන් වී නැත.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">දිනය</th>
                        <th className="pb-2">සාමාජිකයා</th>
                        <th className="pb-2">නිෂ්පාදනය</th>
                        <th className="pb-2">මාර්ගය</th>
                        <th className="pb-2">ප්‍රමාණය</th>
                        <th className="pb-2 text-right">සටහන්</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {teamSales.slice().reverse().map((s, idx) => (
                        <tr key={s.id || idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 font-mono text-slate-300">{s.date || s.timestamp?.split('T')[0]}</td>
                          <td className="py-2.5 font-bold text-white">{s.agentName} ({s.agentCode})</td>
                          <td className="py-2.5 font-bold text-purple-300">{s.productType}</td>
                          <td className="py-2.5 text-emerald-400 font-bold">{s.channel}</td>
                          <td className="py-2.5 font-mono text-amber-400 font-black">{s.quantity}</td>
                          <td className="py-2.5 text-right text-slate-400 text-[11px]">{s.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS DETAILS & ATTENDANCE/SALES STATUS */}
      {activeTab === 'team_agents' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>කණ්ඩායමේ Agents ලාගේ විස්තර (Team Members Status)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ඔබගේ කණ්ඩායමේ සෑම Agent කෙනෙකුගේම පැමිණීම සහ අලෙවි විස්තර.
            </p>
          </div>

          {myTeamAgents.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center bg-slate-950/40 rounded-2xl">
              තවමත් ඔබගේ කණ්ඩායමට Agents ලා සම්බන්ධ වී නොමැත.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTeamAgents.map((ag) => {
                const agAtt = teamAttendance.filter((a) => a.agentId === ag.id);
                const agSales = teamSales.filter((s) => s.agentId === ag.id);
                const agAttSum = getAttendanceSummary(agAtt);
                const agSalesSum = getSalesSummary(agSales);

                return (
                  <div key={ag.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center font-black text-purple-300 text-xs">
                          {ag.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">{ag.name}</span>
                          <span className="font-mono text-[11px] text-amber-400 font-bold">
                            {ag.agentCode || 'AG-000'} • {ag.mobile || 'No Mobile'}
                          </span>
                        </div>
                      </div>

                      {ag.isAppDownloaded || ag.isLoggedIn ? (
                        <button
                          onClick={() => updateUserAppStatus(ag.id, { isAppDownloaded: false, isLoggedIn: false })}
                          className="px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 transition"
                          title="AP status ON - Click to toggle OFF"
                        >
                          🟢 AP ON (Active)
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            updateUserAppStatus(ag.id, {
                              isAppDownloaded: true,
                              isLoggedIn: true,
                              lastLoginAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date().toLocaleDateString('en-GB') + ')',
                              appVersion: 'v5.3',
                            })
                          }
                          className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-extrabold border border-rose-500/30 transition"
                          title="AP status OFF - Click to toggle ON"
                        >
                          🔴 AP OFF (Missing)
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">මාසික පැමිණීම</span>
                        <span className="text-lg font-black text-purple-300 mt-0.5 block">{agAttSum.monthlyPresent} Days</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-bold block">මාසික අලෙවිය</span>
                        <span className="text-lg font-black text-emerald-400 mt-0.5 block">{agSalesSum.monthlyQuantity} Sales</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE GPS MAP FOR TEAM */}
      {activeTab === 'gps' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span>කණ්ඩායමේ සජීවී පිහිටීම (Team Live Location Map)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                කණ්ඩායමේ සියලුම සාමාජිකයින්ගේ සජීවී GPS පිහිටීම පහත සිතියමෙන් බලන්න.
              </p>
            </div>

            <button
              onClick={handleRefreshGps}
              disabled={gpsRefreshing}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gpsRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Map</span>
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800">
            <SriLankaGpsMapView users={myTeamUsers} currentUser={currentUser} height="420px" />
          </div>
        </div>
      )}

      {/* MASTER TAB: PRODUCT KNOWLEDGE */}
      {activeTab === 'product_knowledge' && <ProductKnowledgeCenter />}

      {/* MASTER TAB: TARGET DASHBOARD */}
      {activeTab === 'target_dashboard' && <PerformanceTargetDashboard />}

      {/* MASTER TAB: COMPANY MESSAGES */}
      {activeTab === 'company_messages' && <CompanyMessageCenter />}

      {/* MASTER TAB: LIVE CHAT */}
      {activeTab === 'chat' && (
        <div className="mt-6 space-y-4">
          <InteractiveChatBox teamId={currentUser?.teamId} />
        </div>
      )}

      {/* MASTER TAB: DIALOG PERFORMANCE */}
      {activeTab === 'dialog_performance' && <DialogPerformanceManager />}

      {/* MASTER TAB: DIGITAL EMPLOYEE ID CARD */}
      {activeTab === 'digital_id' && <DigitalEmployeeIdCard />}

      {/* MASTER TAB: DAY START WORK AREA */}
      {activeTab === 'work_area' && <DayStartWorkAreaModal onClose={() => setActiveTab('attendance')} />}

      {/* MASTER TAB: GAMIFIED LEADERBOARD */}
      {activeTab === 'leaderboard' && <GamifiedLeaderboard />}

      {/* MASTER TAB: VIRTUAL MEETING HUB */}
      {activeTab === 'meetings' && <VirtualMeetingHub />}

      {/* TAB: IVR KEYPAD & PLAY STORE APP ACTIVATOR */}
      {activeTab === 'ivr_keypad' && (
        <IvrKeypadAndAppShareModal
          currentUser={currentUser}
          isOpen={true}
          onClose={() => setActiveTab('sales')}
        />
      )}

      {/* TAB: ACTIVATIONS LIVE HUB */}
      {activeTab === 'ivr_hub' && (
        <div className="mt-6">
          <IvrAndAppActivationsHub
            currentUser={currentUser}
            onOpenMap={() => setActiveTab('gps')}
          />
        </div>
      )}

      {/* IVR Keypad & Play Store App Modal (when opened from buttons) */}
      <IvrKeypadAndAppShareModal
        currentUser={currentUser}
        isOpen={showKeypadModal}
        onClose={() => setShowKeypadModal(false)}
      />

      {/* Universal Dynamic Smart Link Modal */}
      <UniversalSmartLinkModal
        isOpen={showSmartLinkModal}
        onClose={() => setShowSmartLinkModal(false)}
      />

      {/* In-App WebView Corporate Browser Modal */}
      <InAppWebViewModal
        isOpen={showWebViewModal}
        onClose={() => setShowWebViewModal(false)}
        defaultChannel={webViewChannel}
      />
    </div>
  );
};
