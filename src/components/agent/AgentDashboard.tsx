import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  CalendarCheck,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle2,
  PlusCircle,
  Navigation,
  RefreshCw,
  LogOut,
  CalendarDays,
  Smartphone,
  Check,
  AlertCircle,
  Globe,
  Trophy,
  BookOpen,
  Target,
  Megaphone,
  Award,
  IdCard,
  Map,
  Radio,
  Share2,
  MessageSquare,
  Fingerprint,
  ShieldCheck,
  Phone,
  PhoneCall,
} from 'lucide-react';
import { IvrKeypadAndAppShareModal } from '../sales/IvrKeypadAndAppShareModal';
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
import { AgentQuickRepliesView } from '../common/AgentQuickRepliesView';
import { GamifiedLeaderboard } from '../common/GamifiedLeaderboard';
import { VirtualMeetingHub } from '../common/VirtualMeetingHub';
import { InAppWebViewModal } from '../common/InAppWebViewModal';
import { UniversalSmartLinkModal } from '../common/UniversalSmartLinkModal';
import { detectFakeGps } from '../../utils/antiCheatDetector';
import { Zap } from 'lucide-react';

type AgentTab =
  | 'attendance'
  | 'sales'
  | 'ivr_keypad'
  | 'gps'
  | 'product_knowledge'
  | 'target_dashboard'
  | 'company_messages'
  | 'chat'
  | 'dialog_performance'
  | 'digital_id'
  | 'work_area'
  | 'quick_replies'
  | 'leaderboard'
  | 'meetings';

export const AgentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    attendance,
    sales,
    addAttendanceRecord,
    addProductSale,
    updateUserGps,
    addSecurityAlert,
  } = useData();

  const [showSmartLinkModal, setShowSmartLinkModal] = useState(false);
  const [showWebViewModal, setShowWebViewModal] = useState(false);
  const [showKeypadModal, setShowKeypadModal] = useState(false);
  const [webViewChannel, setWebViewChannel] = useState<'website' | 'facebook' | 'whatsapp' | 'dialog'>('website');

  const [activeTab, setActiveTab] = useState<AgentTab>('attendance');

  // Attendance Form State
  const [attStatus, setAttStatus] = useState<'present' | 'half_day'>('present');
  const [attMessage, setAttMessage] = useState<string | null>(null);

  // Sales Form State
  const [productType, setProductType] = useState<'ගොවිමිතුරු' | 'සයුරු' | 'අනෙකුත්'>('ගොවිමිතුරු');
  const [channel, setChannel] = useState<'IVR' | 'APP'>('IVR');
  const [quantity, setQuantity] = useState<string>('1');
  const [saleNotes, setSaleNotes] = useState('');
  const [saleSuccess, setSaleSuccess] = useState(false);

  // GPS State
  const [gpsRefreshing, setGpsRefreshing] = useState(false);

  if (!currentUser) return null;

  // Filter Agent's own data
  const myAttendance = attendance.filter((a) => a.agentId === currentUser.id);
  const mySales = sales.filter((s) => s.agentId === currentUser.id);

  // Attendance Summaries
  const attSummary = getAttendanceSummary(myAttendance);
  // Sales Summaries
  const salesSummary = getSalesSummary(mySales);

  const dateTodayStr = new Date().toISOString().split('T')[0];
  const todayAttRecord = myAttendance.find((a) => a.date === dateTodayStr);

  const handleCheckIn = () => {
    if (todayAttRecord?.checkInTime) {
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
              agentCode: currentUser.agentCode || 'AG-000',
              type: 'GPS_SPOOFING',
              reason: `Mock Location / Fake GPS Detected during Check-In: ${fakeCheck.reason}`,
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
            agentCode: currentUser.agentCode || 'AG-000',
            teamId: currentUser.teamId || 'team_direct',
            teamName: currentUser.teamName || 'Direct Field Agents (Owner Group)',
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: attStatus,
          });
          setAttMessage('✅ අද දින පැමිණීම (Check-In) සාර්ථකව සටහන් කරන ලදී.');
          setTimeout(() => setAttMessage(null), 4000);
        },
        (err) => {
          console.warn('GPS error during check-in:', err);
          addAttendanceRecord({
            agentId: currentUser.id,
            agentName: currentUser.name,
            agentCode: currentUser.agentCode || 'AG-000',
            teamId: currentUser.teamId || 'team_direct',
            teamName: currentUser.teamName || 'Direct Field Agents (Owner Group)',
            checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: attStatus,
          });
          setAttMessage('✅ අද දින පැමිණීම (Check-In) සාර්ථකව සටහන් කරන ලදී.');
          setTimeout(() => setAttMessage(null), 4000);
        },
        { enableHighAccuracy: true }
      );
    } else {
      addAttendanceRecord({
        agentId: currentUser.id,
        agentName: currentUser.name,
        agentCode: currentUser.agentCode || 'AG-000',
        teamId: currentUser.teamId || 'team_direct',
        teamName: currentUser.teamName || 'Direct Field Agents (Owner Group)',
        checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: attStatus,
      });
      setAttMessage('✅ අද දින පැමිණීම (Check-In) සාර්ථකව සටහන් කරන ලදී.');
      setTimeout(() => setAttMessage(null), 4000);
    }
  };

  const handleCheckOut = () => {
    if (todayAttRecord?.checkOutTime) {
      setAttMessage('⚠️ අද දින පිටවීම (Check-Out) දැනටමත් සටහන් කර ඇත.');
      setTimeout(() => setAttMessage(null), 4000);
      return;
    }
    addAttendanceRecord({
      agentId: currentUser.id,
      agentName: currentUser.name,
      agentCode: currentUser.agentCode || 'AG-000',
      teamId: currentUser.teamId || 'team_direct',
      teamName: currentUser.teamName || 'Direct Field Agents (Owner Group)',
      checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'completed',
    });

    setAttMessage('✅ අද දින පිටවීම (Check-Out) සාර්ථකව සටහන් කරන ලදී.');
    setTimeout(() => setAttMessage(null), 4000);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = productType === 'ගොවිමිතුරු' ? '#616#' : productType === 'සයුරු' ? '#828#' : 'Other';
    const parsedQty = parseInt(quantity, 10);
    const finalQty = !isNaN(parsedQty) && parsedQty > 0 ? parsedQty : 1;

    addProductSale({
      agentId: currentUser.id,
      agentName: currentUser.name,
      agentCode: currentUser.agentCode || 'AG-000',
      teamId: currentUser.teamId || 'team_direct',
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
          const fakeCheck = detectFakeGps(pos.coords);
          if (fakeCheck.isFake) {
            addSecurityAlert({
              userId: currentUser.id,
              userName: currentUser.name,
              agentCode: currentUser.agentCode || 'AG-000',
              type: 'GPS_SPOOFING',
              reason: `Mock Location detected during GPS Refresh: ${fakeCheck.reason}`,
              severity: 'critical',
              coordinates: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
            });
            alert('⚠️ GPS වංචාවක් (Mock Location Spoofing) හඳුනාගන්නා ලදී. ආරක්ෂක අනතුරු ඇඟවීමක් සටහන් විය.');
            setGpsRefreshing(false);
            return;
          }

          updateUserGps(currentUser.id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setGpsRefreshing(false);
        },
        () => setGpsRefreshing(false),
        { enableHighAccuracy: true }
      );
    } else {
      setGpsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & User Profile Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-black text-emerald-400 text-lg">
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-extrabold uppercase">
                  Official Agent Platform
                </span>
                <span className="font-mono text-xs text-amber-400 font-bold">
                  {currentUser.agentCode || 'AG-000'}
                </span>
              </div>
              <h1 className="text-xl font-black text-white mt-1">{currentUser.name}</h1>
              <p className="text-xs text-slate-400">
                {currentUser.teamName || 'Team Alpha'} • {currentUser.mobile || 'No Phone'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSmartLinkModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* Navigation Tabs - Agent Operational & Learning Features */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'attendance'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>📅 Attendance Mark</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sales'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>📈 Sales Mark</span>
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
          <span>🎓 Product Knowledge Center</span>
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
          onClick={() => setActiveTab('quick_replies')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'quick_replies'
              ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>⚡ Quick Replies &amp; Scripts</span>
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
          onClick={() => setActiveTab('gps')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gps'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-black'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>📍 My GPS Map</span>
        </button>
      </div>

      {/* TAB 1: ATTENDANCE MARK & WEEKLY/MONTHLY SUMMARIES */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {attMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{attMessage}</span>
            </div>
          )}

          {/* Daily Fresh Attendance Marking Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                  <span>දිනපතා පැමිණීම සටහන් කිරීම (Daily Attendance Mark)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  අද දිනය: <strong className="text-emerald-400">{dateTodayStr}</strong> — දිනපතා පැමිණීම (Check-In) සහ පිටවීම (Check-Out) පහතින් සිදුකරන්න.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-bold">
                  <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Fingerprint: Active</span>
                </span>
                {todayAttRecord?.checkInTime && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Check-In Active ({todayAttRecord.checkInTime})</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">පැමිණීමේ තත්ත්වය (Status)</label>
                <select
                  value={attStatus}
                  onChange={(e) => setAttStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="present">සම්පූර්ණ දිනය (Full Day Present)</option>
                  <option value="half_day">අර්ධ දිනය (Half Day Present)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleCheckIn}
                  disabled={Boolean(todayAttRecord?.checkInTime)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg ${
                    todayAttRecord?.checkInTime
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{todayAttRecord?.checkInTime ? 'Check-In සටහන් වී ඇත' : 'Check-In Mark කරන්න'}</span>
                </button>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleCheckOut}
                  disabled={!todayAttRecord?.checkInTime || Boolean(todayAttRecord?.checkOutTime)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-lg ${
                    !todayAttRecord?.checkInTime || todayAttRecord?.checkOutTime
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{todayAttRecord?.checkOutTime ? 'Check-Out සටහන් වී ඇත' : 'Check-Out Mark කරන්න'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Weekly & Monthly Attendance Summary Report */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-400" />
                  <span>මාසික &amp; සතිපතා පැමිණීම් සාරාංශය (Weekly &amp; Monthly Summary)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  සති 1, සති 2, සති 3, සති 4 සහ මාස අවසානයේ සම්පූර්ණ එකතුව.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                {attSummary.monthlyPresent} Days Present
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 1 (Days 1-7)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{attSummary.week1Present}</span>
                <span className="text-[10px] text-slate-500">දින ගණන</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 2 (Days 8-14)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{attSummary.week2Present}</span>
                <span className="text-[10px] text-slate-500">දින ගණන</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 3 (Days 15-21)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{attSummary.week3Present}</span>
                <span className="text-[10px] text-slate-500">දින ගණන</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 4 (Days 22-31)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{attSummary.week4Present}</span>
                <span className="text-[10px] text-slate-500">දින ගණන</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">මාසික එකතුව</span>
                <span className="text-xl font-black text-white mt-1 block">{attSummary.monthlyPresent}</span>
                <span className="text-[10px] text-emerald-300">Total Days Present</span>
              </div>
            </div>

            {/* Attendance History Log */}
            <div className="pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 mb-3">පැමිණීම් ඉතිහාසය (Attendance History Log)</h4>
              {myAttendance.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center bg-slate-950/40 rounded-2xl">
                  තවමත් පැමිණීම් සටහන් වී නැත.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">දිනය</th>
                        <th className="pb-2">Check-In</th>
                        <th className="pb-2">Check-Out</th>
                        <th className="pb-2 text-right">තත්ත්වය</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {myAttendance.slice().reverse().map((a, idx) => (
                        <tr key={a.id || idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 font-mono text-slate-200">{a.date}</td>
                          <td className="py-2.5 font-mono text-emerald-400">{a.checkInTime || '-'}</td>
                          <td className="py-2.5 font-mono text-amber-400">{a.checkOutTime || '-'}</td>
                          <td className="py-2.5 text-right font-bold text-slate-300 capitalize">{a.status}</td>
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

      {/* TAB 2: SALES MARK & WEEKLY/MONTHLY SUMMARIES */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {saleSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>✅ අලෙවිය (Sale) සාර්ථකව පද්ධතියට එක් කරන ලදී!</span>
            </div>
          )}

          {/* Interactive IVR Keypad & Play Store App Activation Hero Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Keypad Dial */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border-2 border-amber-500/50 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dialog USSD Keypad</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">#828# | #616#</span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">දුරකථන Keypad IVR සක්‍රියකය</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  ගොවිමිතුරු (#616#) සහ සයුරු (#828#) සේවාවන් දුරකථන Keypad එක මගින් Dial කර සක්‍රිය කර Sales Count, Time සහ GPS Location ක්ෂණිකව පද්ධතියට එක්කරන්න.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowKeypadModal(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99]"
                >
                  <Phone className="w-4 h-4" />
                  <span>#828# හා #616# Keypad එක විවෘත කරන්න</span>
                </button>
              </div>
            </div>

            {/* Card 2: App Share & Activation */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-900 border-2 border-emerald-500/50 shadow-xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Play Store</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Official Apps</span>
              </div>

              <div>
                <h3 className="text-base font-black text-white">පාරිභෝගික App සක්‍රියක Link</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  ගොවිමිතුරු හා සයුරු Play Store Apps පාරිභෝගිකයාගේ දුරකථනයට WhatsApp, SMS හෝ QR Code මගින් Share කර සක්‍රිය කර Sales Count සහ Location සටහන් කරන්න.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowKeypadModal(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Play Store Link Share &amp; QR Scanner</span>
                </button>
              </div>
            </div>
          </div>

          {/* Daily Fresh Sales Marking Form */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <span>දිනපතා අලෙවිය සටහන් කිරීම (Daily Sales Mark)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                ගොවිමිතුරු (#616#), සයුරු (#828#) හෝ අනෙකුත් සේවාවන් සඳහා අලුතින් Sales එකතු කරන්න.
              </p>
            </div>

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">නිෂ්පාදනය (Product)</label>
                <select
                  value={productType}
                  onChange={(e) => setProductType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="ගොවිමිතුරු">ගොවිමිතුරු (#616#)</option>
                  <option value="සයුරු">සයුරු (#828#)</option>
                  <option value="අනෙකුත්">අනෙකුත් (Others)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">මාර්ගය (Channel)</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                >
                  <option value="IVR">IVR Dial</option>
                  <option value="APP">App Signup</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">ප්‍රමාණය (Quantity)</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sale එක Mark කරන්න</span>
                </button>
              </div>

              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-300">සටහන් / විස්තර (Notes - Optional)</label>
                <input
                  type="text"
                  value={saleNotes}
                  onChange={(e) => setSaleNotes(e.target.value)}
                  placeholder="අමතර විස්තර හෝ සටහන් (Optional)..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </form>
          </div>

          {/* Weekly & Monthly Sales Summary Report */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-400" />
                  <span>මාසික &amp; සතිපතා අලෙවි සාරාංශය (Sales Summary)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  සති 1, සති 2, සති 3, සති 4 සහ මාසික මුළු අලෙවි ප්‍රමාණය.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-xs">
                {salesSummary.monthlyQuantity} Total Sales
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 1 (Days 1-7)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{salesSummary.week1Quantity}</span>
                <span className="text-[10px] text-slate-500">{salesSummary.week1Count} Transactions</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 2 (Days 8-14)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{salesSummary.week2Quantity}</span>
                <span className="text-[10px] text-slate-500">{salesSummary.week2Count} Transactions</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 3 (Days 15-21)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{salesSummary.week3Quantity}</span>
                <span className="text-[10px] text-slate-500">{salesSummary.week3Count} Transactions</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">සතිය 4 (Days 22-31)</span>
                <span className="text-xl font-black text-emerald-400 mt-1 block">{salesSummary.week4Quantity}</span>
                <span className="text-[10px] text-slate-500">{salesSummary.week4Count} Transactions</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">මාසික එකතුව</span>
                <span className="text-xl font-black text-white mt-1 block">{salesSummary.monthlyQuantity}</span>
                <span className="text-[10px] text-emerald-300">Total Units</span>
              </div>
            </div>

            {/* Sales History Log */}
            <div className="pt-4 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 mb-3">අලෙවි ඉතිහාසය (Sales History Log)</h4>
              {mySales.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center bg-slate-950/40 rounded-2xl">
                  තවමත් අලෙවි සටහන් වී නැත.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-2">දිනය</th>
                        <th className="pb-2">නිෂ්පාදනය</th>
                        <th className="pb-2">මාර්ගය</th>
                        <th className="pb-2">ප්‍රමාණය</th>
                        <th className="pb-2 text-right">සටහන්</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {mySales.slice().reverse().map((s, idx) => (
                        <tr key={s.id || idx} className="hover:bg-slate-800/30">
                          <td className="py-2.5 font-mono text-slate-300">{s.date || s.timestamp?.split('T')[0]}</td>
                          <td className="py-2.5 font-bold text-white">{s.productType}</td>
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

      {/* TAB 3: AGENT LIVE LOCATION (GPS) */}
      {activeTab === 'gps' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span>මගේ සජීවී පිහිටීම (My Live GPS Location)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                පද්ධතිය මගින් ඔබ දැනට සිටින සජීවී GPS ස්ථානය සටහන් කරගනී.
              </p>
            </div>

            <button
              onClick={handleRefreshGps}
              disabled={gpsRefreshing}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gpsRefreshing ? 'animate-spin' : ''}`} />
              <span>{gpsRefreshing ? 'Updating...' : 'Refresh Location'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">මාණ්ඩලිකයා</span>
              <span className="font-bold text-white">{currentUser.name} ({currentUser.agentCode})</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Latitude / Longitude</span>
              <span className="font-mono text-emerald-400 font-bold">
                {currentUser.latitude ? `${currentUser.latitude.toFixed(4)}, ${currentUser.longitude?.toFixed(4)}` : '6.9271, 79.8612'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">දිස්ත්‍රික්කය</span>
              <span className="font-bold text-amber-400">{currentUser.district || 'Colombo (Default)'}</span>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="rounded-2xl overflow-hidden border border-slate-800">
            <SriLankaGpsMapView users={[currentUser]} currentUser={currentUser} height="400px" />
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

      {/* MASTER TAB: QUICK REPLIES & SCRIPTS */}
      {activeTab === 'quick_replies' && <AgentQuickRepliesView />}

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
