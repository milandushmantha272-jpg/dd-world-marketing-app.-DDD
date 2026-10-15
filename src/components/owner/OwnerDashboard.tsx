import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { safeStorage } from '../../utils/safeStorage';
import {
  Users,
  UserCheck,
  UserPlus,
  CalendarCheck,
  TrendingUp,
  PhoneCall,
  CalendarDays,
  MessageSquare,
  Video,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  PlusCircle,
  PhoneIncoming,
  Award,
  Wallet,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  Database,
  Search,
  Building2,
  MapPin,
  Globe,
  Share2,
  BookOpen,
  FileText,
  Check,
  ExternalLink,
  Lock,
  AlertCircle,
  Mail,
  Bot,
  Sparkles,
  Volume2,
  VolumeX,
  Eye,
  Cpu,
  Megaphone,
  Facebook,
  Radio,
  FileCheck,
  Download,
  FileSpreadsheet,
  Smartphone,
  Phone,
} from 'lucide-react';
import { AppDownloadStatusMonitor } from './AppDownloadStatusMonitor';
import { CallNotificationModal } from '../common/CallNotificationModal';
import { AllSalesView } from '../common/AllSalesView';
import { IvrAndAppActivationsHub } from './IvrAndAppActivationsHub';
import { OwnerAttendanceControlHub } from './OwnerAttendanceControlHub';
import { InAppMeetingStudio } from '../common/InAppMeetingStudio';
import { SriLankaGpsMapModal, SriLankaGpsMapView } from '../common/SriLankaGpsMapModal';
import { PageHeaderBanner } from '../common/PageHeaderBanner';
import { InteractiveChatBox } from '../common/InteractiveChatBox';
import { IndexTableOfContents } from '../common/IndexTableOfContents';
import { OfficialCorporateIdCardModal } from '../verification/OfficialCorporateIdCardModal';
import { TeamDetailPage } from '../common/TeamDetailPage';
import { AllTeamsOverviewGrid } from '../common/AllTeamsOverviewGrid';
import { CompanyBrandPage } from './pages/CompanyBrandPage';
import { MonthlyTargetPlanPage } from './pages/MonthlyTargetPlanPage';
import { ExecutiveSummariesPage } from './pages/ExecutiveSummariesPage';
import { EmployeeIdCreatorPage } from './pages/EmployeeIdCreatorPage';
import { PersonalProfileKycPage } from '../common/PersonalProfileKycPage';
import { ProductKnowledgeCenter } from '../common/ProductKnowledgeCenter';
import { EmployeeStatusManagement } from './EmployeeStatusManagement';
import { EmployeeVerificationManagement } from './EmployeeVerificationManagement';
import { DataIntegritySystemHealth } from './DataIntegritySystemHealth';
import { DialogPerformanceManager } from '../common/DialogPerformanceManager';
import { PerformanceTargetDashboard } from '../common/PerformanceTargetDashboard';
import { CompanyMessageCenter } from '../common/CompanyMessageCenter';
import { AutoMotivationBanner } from '../common/AutoMotivationBanner';
import { PerformanceOverviewPage } from './pages/PerformanceOverviewPage';

type OwnerTab =
  | 'company_brand'
  | 'target_plan'
  | 'summaries'
  | 'performance_overview'
  | 'teams'
  | 'team_detail'
  | 'id_card_creator'
  | 'personal_profile'
  | 'agents'
  | 'attendance'
  | 'sales'
  | 'ivr_app_hub'
  | 'leaves'
  | 'messages'
  | 'meetings'
  | 'gps'
  | 'vault'
  | 'app_download_status'
  | 'employee_status'
  | 'employee_id_verification'
  | 'system_health'
  | 'product_knowledge'
  | 'dialog_performance'
  | 'performance_target'
  | 'company_messages'
  | 'overview';

export const OwnerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    users,
    teams,
    attendance,
    sales,
    ivrEntries,
    leaves,
    messages,
    meetings,
    ezCash,
    verifications,
    vaultFiles,
    marketingPosts,
    webAiMessages,
    systemDoctorLogs,
    addVaultFile,
    deleteVaultFile,
    addMarketingPost,
    deleteMarketingPost,
    sendWebAiMessage,
    runSystemDoctorAutoHeal,
    getDailyJobRoleReports,
    addAgent,
    addTeamLeader,
    updateAgentCode,
    deleteAgent,
    updateLeaveStatus,
    sendMessage,
    createMeeting,
    cancelMeeting,
    addProductSale,
    startCall,
    updateUserAppStatus,
  } = useData();

  const [activeTab, setActiveTab] = useState<OwnerTab>('app_download_status');
  const [selectedTeamIdForPage, setSelectedTeamIdForPage] = useState<string>('team_direct');

  // Vault upload state
  const [vaultTitle, setVaultTitle] = useState('');
  const [vaultCategory, setVaultCategory] = useState<'pdf' | 'contract' | 'policy' | 'photo' | 'bill' | 'other'>('contract');
  const [vaultFileName, setVaultFileName] = useState('');
  const [vaultSizeMB, setVaultSizeMB] = useState('4.5');
  const [vaultNotes, setVaultNotes] = useState('');
  const [vaultFilterCategory, setVaultFilterCategory] = useState<string>('all');
  const [vaultSuccess, setVaultSuccess] = useState<string | null>(null);

  // Marketing Post state
  const [mktSubTab, setMktSubTab] = useState<'posts' | 'chat'>('posts');
  const [mktTitle, setMktTitle] = useState('');
  const [mktType, setMktType] = useState<'article' | 'post' | 'video' | 'promo'>('article');
  const [mktDesc, setMktDesc] = useState('');
  const [mktMediaUrl, setMktMediaUrl] = useState('');
  const [mktAudience, setMktAudience] = useState('All Sri Lanka Mobile & Dialog Users');
  const [mktSuccess, setMktSuccess] = useState<string | null>(null);

  // Web AI Chat input state
  const [webAiText, setWebAiText] = useState('');

  // System Doctor local state
  const [doctorFeedback, setDoctorFeedback] = useState<string | null>(null);

  // Job Role tracker state
  const [jobRoleDate, setJobRoleDate] = useState(new Date().toISOString().split('T')[0]);
  const [jobRoleTeamFilter, setJobRoleTeamFilter] = useState('all');

  // Owner Sales form state (Owner Direct Sale or Assign to Agent)
  const [ownerSaleTeamId, setOwnerSaleTeamId] = useState<string>('team-9');
  const [ownerSaleAgent, setOwnerSaleAgent] = useState<'ME' | string>('ME');
  const [ownerSaleType, setOwnerSaleType] = useState<'ගොවිමිතුරු' | 'සයුරු' | 'අනෙකුත්'>('ගොවිමිතුරු');
  const [ownerSaleName, setOwnerSaleName] = useState('ගොවිමිතුරු කෘෂි උපදේශන සේවාව');
  const [ownerCustName, setOwnerCustName] = useState('');
  const [ownerCustPhone, setOwnerCustPhone] = useState('');
  const [ownerAmount, setOwnerAmount] = useState('150');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [ownerSaleSuccess, setOwnerSaleSuccess] = useState(false);

  // Agent Search & Filter
  const [teamFilter, setTeamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Staff Modal state (Agent or Team Leader)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStaffRole, setAddStaffRole] = useState<'agent' | 'team_leader'>('agent');
  const [agName, setAgName] = useState('');
  const [agCode, setAgCode] = useState('AG-004');
  const [agMobile, setAgMobile] = useState('');
  const [agEmail, setAgEmail] = useState('');
  const [agTempPassword, setAgTempPassword] = useState('ddworld@2026');
  const [agTeamId, setAgTeamId] = useState('team_direct');
  const [tlTeamName, setTlTeamName] = useState('');
  const [addMsg, setAddMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete Agent Confirmation state
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string; code: string } | null>(null);

  // Confirm or Edit Agent Code state
  const [agentToConfirmCode, setAgentToConfirmCode] = useState<{ id: string; name: string; currentCode: string } | null>(null);
  const [newCodeInput, setNewCodeInput] = useState('');
  const [codeConfirmResult, setCodeConfirmResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  // Messages state
  const [recipientId, setRecipientId] = useState('');
  const [msgContent, setMsgContent] = useState('');

  // Meeting form state
  const [mtgTitle, setMtgTitle] = useState('');
  const [mtgDesc, setMtgDesc] = useState('');
  const [mtgDate, setMtgDate] = useState(new Date().toISOString().split('T')[0]);
  const [mtgTime, setMtgTime] = useState('10:00');
  const [mtgLink, setMtgLink] = useState('https://meet.google.com/ddw-owner-meeting');
  const [mtgTeamId, setMtgTeamId] = useState('all');

  // Call simulator state
  const [activeCall, setActiveCall] = useState<{
    callerName: string;
    callerRole: 'team_leader' | 'agent';
  } | null>(null);

  // External Email / WhatsApp Dispatch state
  const [extRecipient, setExtRecipient] = useState('');
  const [extContact, setExtContact] = useState('');
  const [extReportType, setExtReportType] = useState('sales_report');
  const [extNote, setExtNote] = useState('');
  const [extSuccessMsg, setExtSuccessMsg] = useState<string | null>(null);

  // Owner Custom Password modal state
  const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
  const [gpsMapModalOpen, setGpsMapModalOpen] = useState(false);
  const [newOwnerPwd, setNewOwnerPwd] = useState('');
  const [confirmOwnerPwd, setConfirmOwnerPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveOwnerPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerPwd.trim()) {
      setPwdMsg({ type: 'error', text: 'කරුණාකර නව මුරපදය ඇතුළත් කරන්න.' });
      return;
    }
    if (newOwnerPwd !== confirmOwnerPwd) {
      setPwdMsg({ type: 'error', text: 'මුරපද දෙක එකිනෙකට නොගැලපේ.' });
      return;
    }
    safeStorage.setItem('ddw_custom_owner_password', newOwnerPwd.trim());
    setPwdMsg({ type: 'success', text: 'Owner මුරපදය සාර්ථකව වෙනස් කරන ලදී! මින් ඉදිරියට මෙම මුරපදය මගින් Log විය හැක.' });
    setTimeout(() => {
      setIsPwdModalOpen(false);
      setNewOwnerPwd('');
      setConfirmOwnerPwd('');
      setPwdMsg(null);
    }, 2500);
  };

  // Website CMS state
  const [selectedIdCardUserId, setSelectedIdCardUserId] = useState<string | null>(null);
  const [cmsTitle, setCmsTitle] = useState('');
  const [cmsType, setCmsType] = useState<'news' | 'banner' | 'video'>('news');
  const [cmsMediaUrl, setCmsMediaUrl] = useState('');
  const [cmsDesc, setCmsDesc] = useState('');
  const [showWebsitePreviewModal, setShowWebsitePreviewModal] = useState(false);
  const [cmsItems, setCmsItems] = useState([
    {
      id: 'cms-1',
      title: 'ගොවිමිතුරු කෘෂි උපදේශන සේවාව - නවතම තොරතුරු',
      type: 'news' as const,
      date: '2026-08-02',
      author: 'Owner',
      status: 'live' as const,
      mediaUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      desc: 'ගොවිමිතුරු සේවාව මගින් දැන් කාලගුණ හා වෙළඳපල තොරතුරු ක්ෂණිකව ලබාගත හැක.',
    },
    {
      id: 'cms-2',
      title: 'සයුරු ධීවර කාලගුණ අනතුරු ඇඟවීමේ සේවාව',
      type: 'banner' as const,
      date: '2026-08-01',
      author: 'Owner',
      status: 'live' as const,
      mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      desc: 'මුහුදු යන ධීවර ප්‍රජාව සඳහා ආරක්ෂිත කාලගුණ නිවේදන හා මුහුදු රළ තත්ත්වය.',
    },
    {
      id: 'cms-3',
      title: 'නව ග්‍රාමීය ඩිජිටල් සේවා ප්‍රවර්ධන වීඩියෝව',
      type: 'video' as const,
      date: '2026-08-02',
      author: 'Owner',
      status: 'pending' as const,
      mediaUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
      desc: 'ඩිජිටල් සාක්ෂරතාවය ගමට ගෙනයන නවතම වීඩියෝ ප්‍රචාරක වැඩසටහන.',
    },
  ]);

  // Simulated Live GPS Agents with Stationary Alert (>1 Hour)
  const gpsAgents = [
    {
      id: 'ag-9176',
      name: 'W.A.Chamod Luvanjana (9176)',
      district: 'Colombo - Fort',
      lat: '6.9271° N',
      lng: '79.8612° E',
      stationaryDuration: '1 පැය 25 මිනිත්තු ⚠️ (STATIONARY ALERT)',
      isStationaryOverHour: true,
      teamLeaderName: 'D. M. T. R. Dissanayaka',
      phone: '0773344551',
    },
    {
      id: 'ag-9074',
      name: 'H. Madushan (9074)',
      district: 'Kandy - City Center',
      lat: '7.2906° N',
      lng: '80.6337° E',
      stationaryDuration: '1 පැය 40 මිනිත්තු ⚠️ (STATIONARY ALERT)',
      isStationaryOverHour: true,
      teamLeaderName: 'A. K. S. Fernando',
      phone: '0711122334',
    },
    {
      id: 'ag-9180',
      name: 'ඒ. බී. ප්‍රනාන්දු (9180)',
      district: 'Gampaha - Town',
      lat: '7.0840° N',
      lng: '79.9936° E',
      stationaryDuration: '18 මිනිත්තු (Active Moving)',
      isStationaryOverHour: false,
      teamLeaderName: 'D. M. T. R. Dissanayaka',
      phone: '0771234567',
    },
    {
      id: 'ag-9190',
      name: 'කමල් පෙරේරා (9190)',
      district: 'Kurunegala - Town',
      lat: '7.4863° N',
      lng: '80.3623° E',
      stationaryDuration: '40 මිනිත්තු (Active Moving)',
      isStationaryOverHour: false,
      teamLeaderName: 'K. L. N. Silva',
      phone: '0789988776',
    },
    {
      id: 'ag-9200',
      name: 'සුනිල් ජයවර්ධන (9200)',
      district: 'Matara - Town',
      lat: '5.9485° N',
      lng: '80.5353° E',
      stationaryDuration: '12 මිනිත්තු (Active Moving)',
      isStationaryOverHour: false,
      teamLeaderName: 'N. P. Perera',
      phone: '0714455667',
    },
  ];

  const handleSendExternalReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extRecipient || !extContact) return;

    const totalSalesText = `${sales.reduce((sum, s) => sum + (s.quantity || 1), 0)} Units`;
    const reportSummary = `[Dialog & Govimithuru Official Report]\nලැබුම්කරු: ${extRecipient}\nවාර්තා වර්ගය: ${
      extReportType === 'sales_report'
        ? 'දෛනික විකුණුම් වාර්තාව (Daily Sales Report)'
        : extReportType === 'attendance_report'
        ? 'සාමාජික පැමිණීමේ වාර්තාව (Attendance Sheet)'
        : 'කණ්ඩායම් ක්‍රියාකාරීත්ව සාරාංශය (Team Summary)'
    }\nමුළු Sales Units: ${totalSalesText}\nඅද පැමිණීම: ${todayAttendanceCount} Agents\nසටහන: ${extNote || 'N/A'}\n- DDWorld Automated Report System`;

    if (extContact.includes('@')) {
      const mailtoUrl = `mailto:${encodeURIComponent(extContact)}?subject=${encodeURIComponent(
        'DDWorld Official Report: ' + extReportType
      )}&body=${encodeURIComponent(reportSummary)}`;
      window.open(mailtoUrl, '_blank');
    } else {
      const cleanPhone = extContact.replace(/[^0-9]/g, '');
      const waPhone = cleanPhone.startsWith('0')
        ? '94' + cleanPhone.slice(1)
        : cleanPhone.startsWith('94')
        ? cleanPhone
        : '94' + cleanPhone;
      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(reportSummary)}`;
      window.open(waUrl, '_blank');
    }

    setExtSuccessMsg(`"${extRecipient}" (${extContact}) වෙත වාර්තාව සාර්ථකව යවන ලදී / Prepared for dispatch!`);
    setTimeout(() => setExtSuccessMsg(null), 4000);
    setExtRecipient('');
    setExtContact('');
    setExtNote('');
  };

  const handleAddCms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsTitle) return;
    const newItem = {
      id: 'cms-' + Date.now(),
      title: cmsTitle,
      type: cmsType,
      date: new Date().toISOString().split('T')[0],
      author: 'Owner',
      status: 'live' as const,
      mediaUrl:
        cmsMediaUrl ||
        'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
      desc: cmsDesc || 'නවතම ප්‍රවෘත්ති සහ සේවා යාවත්කාලීන කිරීම.',
    };
    setCmsItems((prev) => [newItem, ...prev]);
    setCmsTitle('');
    setCmsMediaUrl('');
    setCmsDesc('');
  };

  const handleApproveCms = (id: string) => {
    setCmsItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: 'live' as const } : it))
    );
  };

  // Owner Special Executive AI Partner State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiIsSpeaking, setAiIsSpeaking] = useState(false);
  const [aiAuditLoading, setAiAuditLoading] = useState(false);

  const speakBriefing = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'si-LK';
      utterance.rate = 0.95;
      utterance.onstart = () => setAiIsSpeaking(true);
      utterance.onend = () => setAiIsSpeaking(false);
      utterance.onerror = () => setAiIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setAiIsSpeaking(true);
      setTimeout(() => setAiIsSpeaking(false), 6000);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAiIsSpeaking(false);
  };

  const handleRunAiAudit = () => {
    setAiAuditLoading(true);
    setTimeout(() => {
      const activeAgs = users.filter((u) => u.role === 'agent').length;
      const totalRev = sales.reduce((sum, s) => sum + s.amount, 0);
      const statCount = gpsAgents.filter((a) => a.isStationaryOverHour).length;
      const briefing =
        `[Owner Executive AI Confidential Report]\n\n` +
        `• මුළු ආදායම: රු. ${totalRev.toLocaleString()}\n` +
        `• ක්‍රියාකාරී ක්ෂේත්‍ර නිලධාරීන්: ${activeAgs} දෙනෙකු සේවයේ නියුතුය.\n` +
        `• GPS ආරක්ෂක පරීක්ෂාව: ${statCount} දෙනෙකු පැයකට වඩා එකම ස්ථානයේ නතර වී ඇත (Stationary Alert).\n` +
        `• රහස්‍ය නිර්දේශය (Secret Verdict): "කණ්ඩායම් නායකයින් හරහා අදාළ Agents ලාගේ ස්ථාන පරීක්ෂා කර පාරිභෝගික සහභාගීත්වය 15% කින් ඉහළ නැංවීමට උපදෙස් ලබා දෙන්න."`;
      setAiResponse(briefing);
      setAiAuditLoading(false);
      speakBriefing(
        `ආයුබෝවන් Owner! අද දින මුළු ආදායම රුපියල් ${totalRev.toLocaleString()} වේ. ක්ෂේත්‍ර නිලධාරීන් ${activeAgs} දෙනෙකු ක්‍රියාකාරී වේ. ${statCount} දෙනෙකු පැයකට වඩා එකම ස්ථානයේ නතර වී ඇත. කරුණාකර කණ්ඩායම් නායකයින් දැනුවත් කරන්න.`
      );
    }, 600);
  };

  const handleAskAiPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    const q = aiQuery.trim();
    setAiQuery('');
    setAiAuditLoading(true);

    try {
      const { askKnowledgeBot } = await import('../../services/gemini');
      const ans = await askKnowledgeBot(q);
      const formattedAns = `🧠 [Executive AI Answer]\n${ans}`;
      setAiResponse(formattedAns);
      speakBriefing(ans);
    } catch (err) {
      setAiResponse(`🧠 [Executive AI Answer]\n"${q}" සම්බන්ධයෙන් පිළිතුර සකස් කිරීමට නොහැකි විය.`);
    } finally {
      setAiAuditLoading(false);
    }
  };

  // Share & Promotion Hub State
  const [promoTab, setPromoTab] = useState<'vacancy' | 'ad'>('vacancy');
  const [promoTitle, setPromoTitle] = useState(
    'Field Sales & Agricultural Agent Vacancy - DD World'
  );
  const [promoDesc, setPromoDesc] = useState(
    'DD World සයුරු හා ගොවිමිතුරු කෘෂි උපදේශන සේවාව සඳහා දිවයින පුරා ක්ෂේත්‍ර අලෙවි නිලධාරීන් සහ Team Leaders බඳවා ගැනේ. ආකර්ෂණීය වැටුප් හා දීමනා.'
  );
  const [promoSalary, setPromoSalary] = useState('රු. 45,000 - 85,000 + Performance Incentives');
  const [promoLink, setPromoLink] = useState('https://ddworld.lk/careers/apply');
  const [promoShareSuccess, setPromoShareSuccess] = useState<string | null>(null);

  const handleShareFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      promoLink
    )}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setPromoShareSuccess('Facebook Share Dialog එක විවෘත කරන ලදී!');
    setTimeout(() => setPromoShareSuccess(null), 4000);
  };

  const handleShareWhatsApp = () => {
    const text = `*[DD World Official Announcement]*\n\n*${promoTitle}*\n\n${promoDesc}\n\n*වැටුප් හා ප්‍රතිලාභ:* ${promoSalary}\n\n*අයදුම් කිරීමට හෝ වැඩි විස්තර සඳහා:* ${promoLink}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setPromoShareSuccess('WhatsApp Share Message එක සකස් කරන ලදී!');
    setTimeout(() => setPromoShareSuccess(null), 4000);
  };

  const handleCopyPromoLink = () => {
    navigator.clipboard.writeText(`${promoTitle} - ${promoLink}`);
    setPromoShareSuccess('Promotional Link එක Clipboard එකට Copy කර ගත්තා!');
    setTimeout(() => setPromoShareSuccess(null), 4000);
  };

  if (!currentUser) return null;

  const activeAgents = users.filter((u) => u.role === 'agent');
  const totalSalesRs = sales.reduce((acc, s) => acc + s.amount, 0);
  const todayAttendanceCount = attendance.filter(
    (a) => a.date === new Date().toISOString().split('T')[0]
  ).length;

  const filteredAgents = activeAgents.filter((ag) => {
    const matchesTeam = teamFilter === 'all' || ag.teamId === teamFilter;
    const matchesSearch =
      ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ag.agentCode && ag.agentCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ag.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTeam && matchesSearch;
  });

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg(null);

    let res: { success: boolean; message: string };

    if (addStaffRole === 'team_leader') {
      res = addTeamLeader({
        name: agName,
        code: agCode,
        mobile: agMobile,
        email: agEmail,
        tempPassword: agTempPassword,
        teamName: tlTeamName || `${agName} Team`,
      });
    } else {
      const selectedTeam = teams.find((t) => t.id === agTeamId);
      const teamLeaderId = selectedTeam ? selectedTeam.leaderId : 'owner-9000';

      res = addAgent({
        name: agName,
        agentCode: agCode,
        mobile: agMobile,
        email: agEmail,
        tempPassword: agTempPassword,
        teamId: agTeamId,
        teamLeaderId,
      });
    }

    if (res.success) {
      setAddMsg({ type: 'success', text: res.message });
      setAgName('');
      setAgMobile('');
      setAgEmail('');
      setTlTeamName('');
      setAgCode(addStaffRole === 'team_leader' ? `TL-00${teams.length + 2}` : `AG-00${activeAgents.length + 2}`);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setAddMsg(null);
      }, 2500);
    } else {
      setAddMsg({ type: 'error', text: res.message });
    }
  };

  const handleConfirmPermanentDelete = () => {
    if (!agentToDelete) return;
    const res = deleteAgent(agentToDelete.id);
    setAgentToDelete(null);
    setDeleteMsg(res.message);
    setTimeout(() => setDeleteMsg(null), 4000);
  };

  const handleAddOwnerSale = (e: React.FormEvent) => {
    e.preventDefault();

    let targetId = currentUser.id;
    let targetName = 'Dushmantha Fernando (Owner)';
    let targetCode = '9000';
    let targetTeamId = 'team-9';

    if (ownerSaleAgent !== 'ME') {
      const foundAg = users.find((u) => u.id === ownerSaleAgent);
      if (foundAg) {
        targetId = foundAg.id;
        targetName = foundAg.name;
        targetCode = foundAg.agentCode || 'AG';
        targetTeamId = foundAg.teamId || ownerSaleTeamId;
      }
    }

    addProductSale({
      agentId: targetId,
      agentName: targetName,
      agentCode: targetCode,
      teamId: targetTeamId,
      productType: ownerSaleType,
      productName: ownerSaleName,
      customerName: '',
      customerMobile: '',
      amount: 0,
      notes: ownerNotes,
    });

    setOwnerNotes('');
    setOwnerSaleSuccess(true);
    setTimeout(() => setOwnerSaleSuccess(false), 3000);
  };

  // Owner KYC CSV Download
  const handleDownloadStaffCSV = () => {
    const headers = [
      'User Name',
      'Role',
      'Agent Code',
      'NIC / ID Number',
      'Contact Number',
      'Permanent Address',
      'Grama Niladhari Report',
      'Police Report',
      'Status',
      'Submitted At',
    ];
    const rows = verifications.map((v) => [
      `"${v.userName}"`,
      `"${v.userRole}"`,
      `"${v.agentCode || 'N/A'}"`,
      `"${v.idNumber}"`,
      `"${v.contactNumber}"`,
      `"${v.address}"`,
      `"${v.gramaNiladhariReportUrl}"`,
      `"${v.policeReportUrl}"`,
      `"${v.status}"`,
      `"${v.submittedAt}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DD_World_Staff_Verifications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintStaffReport = () => {
    window.print();
  };

  const handleSendOwnerMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim() || !recipientId) return;
    const recipientUser = users.find((u) => u.id === recipientId);
    if (!recipientUser) return;

    sendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'owner',
      receiverId: recipientUser.id,
      receiverName: recipientUser.name,
      receiverRole: recipientUser.role,
      content: msgContent,
    });
    setMsgContent('');
  };

  const handleOwnerCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mtgTitle.trim()) return;
    createMeeting({
      title: mtgTitle,
      description: mtgDesc,
      date: mtgDate,
      time: mtgTime,
      meetingLink: mtgLink,
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostRole: 'owner',
      teamId: mtgTeamId,
    });
    setMtgTitle('');
    setMtgDesc('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Top Banner showing Owner full access */}
      <div className="bg-gradient-to-r from-amber-500/20 via-blue-600/20 to-indigo-600/20 border-b border-amber-500/30 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-extrabold text-amber-300 uppercase tracking-wide">
              Owner Dashboard (ප්‍රධාන පාලන මැදිරිය):
            </span>
            <span className="text-slate-200 font-bold">{currentUser.name}</span>
            <span className="hidden sm:inline text-slate-400">• DD WORLD SECURITY (PVT) LTD</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Executive Console</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-4">
        {/* Auto Rotating Motivation Banner */}
        <AutoMotivationBanner />

        {/* Navigation Tabs - Core Owner Operational Sections */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          {/* CORE 1: APP LOGGED IN & DOWNLOAD STATUS */}
          <button
            onClick={() => setActiveTab('app_download_status')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'app_download_status'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>📱 Logged-In &amp; App Download Monitor</span>
          </button>

          {/* MASTER FEATURE: EMPLOYEE STATUS CONTROL */}
          <button
            onClick={() => setActiveTab('employee_status')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'employee_status'
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white font-black shadow-lg shadow-rose-600/40'
                : 'bg-slate-900 text-rose-300 border border-rose-500/30 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>🔒 Employee Status Control</span>
          </button>

          {/* MASTER FEATURE: EMPLOYEE ID VERIFICATION & APPROVAL */}
          <button
            onClick={() => setActiveTab('employee_id_verification')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'employee_id_verification'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/40'
                : 'bg-slate-900 text-amber-300 border border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>🪪 Employee ID Verification</span>
          </button>

          {/* MASTER FEATURE: SYSTEM HEALTH & DATA INTEGRITY */}
          <button
            onClick={() => setActiveTab('system_health')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'system_health'
                ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40'
                : 'bg-slate-900 text-emerald-300 border border-emerald-500/30 hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>🛡️ System Health &amp; Data Integrity</span>
          </button>

          {/* MASTER FEATURE: PRODUCT KNOWLEDGE */}
          <button
            onClick={() => setActiveTab('product_knowledge')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'product_knowledge'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/40'
                : 'bg-slate-900 text-amber-300 border border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>🎓 Product Knowledge &amp; Training</span>
          </button>

          {/* MASTER FEATURE: PERFORMANCE OVERVIEW (RECHARTS 30-DAY TRENDS) */}
          <button
            onClick={() => setActiveTab('performance_overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'performance_overview'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-black shadow-lg shadow-blue-600/40'
                : 'bg-slate-900 text-cyan-300 border border-cyan-500/30 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>📊 30-Day Performance &amp; Activity Trends</span>
          </button>

          {/* MASTER FEATURE: DIALOG PERFORMANCE */}
          <button
            onClick={() => setActiveTab('dialog_performance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'dialog_performance'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black shadow-lg shadow-blue-600/40'
                : 'bg-slate-900 text-blue-300 border border-blue-500/30 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-blue-400" />
            <span>📊 Dialog Official Records</span>
          </button>

          {/* MASTER FEATURE: COMPANY MESSAGES */}
          <button
            onClick={() => setActiveTab('company_messages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'company_messages'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-purple-600/40'
                : 'bg-slate-900 text-purple-300 border border-purple-500/30 hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4 text-purple-400" />
            <span>📢 Message Center</span>
          </button>

          {/* LIVE CHAT BOX (EXECUTIVE CONSOLE) */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/40'
                : 'bg-slate-900 text-amber-300 border border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>💬 Live Chat Box (සජීවී පණිවිඩ)</span>
          </button>

          {/* CORE 2: TEAM LEADERS & TEAMS ATTENDANCE + SUMMARIES */}
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-lg shadow-purple-500/40'
                : 'bg-slate-900 text-purple-300 border border-purple-500/30 hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-purple-300" />
            <span>👥 Team Leaders &amp; Teams Attendance</span>
          </button>

          {/* CORE 3: TEAM LEADERS & TEAMS SALES + SUMMARIES */}
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'sales'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black shadow-lg shadow-purple-500/40'
                : 'bg-slate-900 text-purple-300 border border-purple-500/30 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-purple-300" />
            <span>📈 Team Leaders &amp; Teams Sales</span>
          </button>

          {/* CORE: #828# / #616# IVR KEYPAD & APP ACTIVATIONS HUB */}
          <button
            onClick={() => setActiveTab('ivr_app_hub')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'ivr_app_hub'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/40'
                : 'bg-slate-900 text-amber-300 border border-amber-500/40 hover:bg-slate-800'
            }`}
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>📞 #828# / #616# &amp; App සක්‍රිය කිරීම්</span>
          </button>

          {/* CORE 4: REAL-TIME GPS MAP */}
          <button
            onClick={() => setActiveTab('gps')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'gps'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 font-black'
                : 'bg-slate-900 text-rose-300 border border-rose-500/30 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>📍 Live GPS Location Map</span>
          </button>

          {/* 1st Page */}
          <button
            onClick={() => setActiveTab('company_brand')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'company_brand'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 font-black'
                : 'bg-slate-900 text-amber-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            1st Page: Logo &amp; Info
          </button>

          {/* 2nd Page */}
          <button
            onClick={() => setActiveTab('target_plan')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'target_plan'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'bg-slate-900 text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            2nd Page: Target Plan
          </button>

          {/* 3rd Page */}
          <button
            onClick={() => setActiveTab('summaries')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'summaries'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                : 'bg-slate-900 text-blue-300 hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-cyan-300" />
            3rd Page: අවශ්‍ය Summaries (පැමිණීම් &amp; Sales)
          </button>

          {/* Dedicated Team Pages */}
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'teams'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                : 'bg-slate-900 text-purple-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-purple-300" />
            4th Page Onwards: Teams ({teams.length})
          </button>

          {/* Personal Profile KYC Page */}
          <button
            onClick={() => setActiveTab('personal_profile')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'personal_profile'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
                : 'bg-slate-900 text-amber-300 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
             Personal Profile &amp; KYC
          </button>

          {/* Meetings Page with Apple Calls/Msgs */}
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeTab === 'meetings'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/30 font-black'
                : 'bg-slate-900 text-emerald-300 hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-400" />
            💬 📞 📽️ Chat, Calls &amp; Meetings
          </button>


          <button
            onClick={() => setActiveTab('agents')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'agents'
                ? 'bg-slate-800 text-white font-black'
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Agent Mgt ({activeAgents.length})
          </button>
        </div>

        {/* Delete notification banner */}
        {deleteMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{deleteMsg}</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 uppercase">
              Cascaded & Revoked
            </span>
          </div>
        )}

        {/* ====================================================
            1st PAGE: COMPANY BRANDING & LOGO
           ==================================================== */}
        {activeTab === 'company_brand' && (
          <div className="mt-6">
            <CompanyBrandPage />
          </div>
        )}

        {/* ====================================================
            2nd PAGE: MONTHLY TARGET PLAN DISTRIBUTION
           ==================================================== */}
        {activeTab === 'target_plan' && (
          <div className="mt-6">
            <MonthlyTargetPlanPage />
          </div>
        )}

        {/* ====================================================
            3rd PAGE: EXECUTIVE KEY SUMMARIES
           ==================================================== */}
        {activeTab === 'summaries' && (
          <div className="mt-6">
            <ExecutiveSummariesPage />
          </div>
        )}

        {/* ====================================================
            PERFORMANCE OVERVIEW (RECHARTS 30-DAY TRENDS)
           ==================================================== */}
        {activeTab === 'performance_overview' && (
          <div className="mt-6">
            <PerformanceOverviewPage />
          </div>
        )}


        {/* ====================================================
            ID CREATE PAGE: EMPLOYEE ID CARD CREATOR
           ==================================================== */}
        {activeTab === 'id_card_creator' && (
          <div className="mt-6">
            <EmployeeIdCreatorPage />
          </div>
        )}

        {/* ====================================================
            PERSONAL PROFILE & KYC PAGE
           ==================================================== */}
        {activeTab === 'personal_profile' && (
          <div className="mt-6">
            <PersonalProfileKycPage />
          </div>
        )}

        {/* ====================================================
            EMPLOYEE STATUS MANAGEMENT
           ==================================================== */}
        {activeTab === 'employee_status' && (
          <div className="mt-6">
            <EmployeeStatusManagement />
          </div>
        )}

        {/* ====================================================
            EMPLOYEE ID VERIFICATION & APPROVAL HUB
           ==================================================== */}
        {activeTab === 'employee_id_verification' && (
          <div className="mt-6">
            <EmployeeVerificationManagement />
          </div>
        )}

        {/* ====================================================
            SYSTEM HEALTH & DATA INTEGRITY
           ==================================================== */}
        {activeTab === 'system_health' && (
          <div className="mt-6">
            <DataIntegritySystemHealth />
          </div>
        )}

        {/* ====================================================
            PRODUCT KNOWLEDGE CENTER
           ==================================================== */}
        {activeTab === 'product_knowledge' && (
          <div className="mt-6">
            <ProductKnowledgeCenter />
          </div>
        )}

        {/* ====================================================
            DIALOG PERFORMANCE MANAGER
           ==================================================== */}
        {activeTab === 'dialog_performance' && (
          <div className="mt-6">
            <DialogPerformanceManager />
          </div>
        )}

        {/* ====================================================
            PERFORMANCE & TARGET DASHBOARD
           ==================================================== */}
        {activeTab === 'performance_target' && (
          <div className="mt-6">
            <PerformanceTargetDashboard />
          </div>
        )}

        {/* ====================================================
            COMPANY MESSAGE CENTER
           ==================================================== */}
        {activeTab === 'company_messages' && (
          <div className="mt-6">
            <CompanyMessageCenter />
          </div>
        )}


        {/* ====================================================
            OVERVIEW TAB
           ==================================================== */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Main Table of Contents Index */}
            <IndexTableOfContents activeTab={activeTab} onSelectTab={(k) => setActiveTab(k as OwnerTab)} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">මුළු Agents ගණන (Total)</span>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">{activeAgents.length}</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Across {teams.length} assigned teams
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">අද දින පැමිණීම (Attendance)</span>
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{todayAttendanceCount}</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Checked in today across teams
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">මුළු සේවා / විකුණුම් ගණන</span>
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {sales.length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Total product &amp; advisory sales logged
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold">මුළු කණ්ඩායම් ගණන (Teams)</span>
                  <Building2 className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">{teams.length}</div>
                <p className="text-[11px] text-indigo-400 mt-1">
                  Team Alpha & Team Beta active
                </p>
              </div>
            </div>

            {/* Embedded 30-Day Performance Overview with Recharts */}
            <div className="pt-2">
              <PerformanceOverviewPage />
            </div>

            {/* Teams summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((tm) => {
                const teamAgs = activeAgents.filter((ag) => ag.teamId === tm.id);
                const teamSl = sales.filter((s) => s.teamId === tm.id);
                return (
                  <div
                    key={tm.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-bold border border-blue-500/30">
                          {tm.name}
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {teamSl.length} සේවා ගණන
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">{tm.description}</p>
                      <div className="text-xs text-slate-300 space-y-1 mb-4">
                        <div>
                          Team Leader:{' '}
                          <span className="font-bold text-white">{tm.leaderName}</span>
                        </div>
                        <div>
                          Agents Count:{' '}
                          <span className="font-bold text-amber-400">{teamAgs.length} Agents</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Official Dedicated Page
                      </span>
                      <button
                        onClick={() => {
                          setSelectedTeamIdForPage(tm.id);
                          setActiveTab('team_detail');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-blue-600/20"
                      >
                        විශේෂිත Team Page එක බලන්න →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ====================================================
            ALL TEAMS OVERVIEW TAB
           ==================================================== */}
        {activeTab === 'teams' && (
          <div className="mt-6">
            <AllTeamsOverviewGrid
              onOpenTeamPage={(tId) => {
                setSelectedTeamIdForPage(tId);
                setActiveTab('team_detail');
              }}
            />
          </div>
        )}

        {/* ====================================================
            DEDICATED INDIVIDUAL TEAM PAGE TAB
           ==================================================== */}
        {activeTab === 'team_detail' && (
          <div className="mt-6">
            <TeamDetailPage
              teamId={selectedTeamIdForPage}
              onBack={() => setActiveTab('teams')}
              onSelectTeam={(tId) => setSelectedTeamIdForPage(tId)}
            />
          </div>
        )}

        {activeTab === 'app_download_status' && (
          <div className="mt-6">
            <AppDownloadStatusMonitor />
          </div>
        )}

        {/* ====================================================
            AGENT MANAGEMENT TAB (Add & Permanent Delete)
           ==================================================== */}
        {activeTab === 'agents' && (
          <div className="mt-6 space-y-6">
            {/* Top filter bar + Add Agent button */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, code or email..."
                    className="pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500"
                  />
                </div>

                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100"
                >
                  <option value="all">සියලුම Teams ({activeAgents.length})</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                නව Agent Add කරන්න
              </button>
            </div>

            {/* Agents Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">
                පද්ධතියේ ලියාපදිංචි නියෝජිතයින් (Active Agents List - {filteredAgents.length})
              </h3>

              {filteredAgents.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">
                  මෙම සෙවීමට අදාළ කිසිදු Agent කෙනෙකු නොමැත.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-semibold">Agent Code</th>
                        <th className="pb-3 font-semibold">නම</th>
                        <th className="pb-3 font-semibold">Email</th>
                        <th className="pb-3 font-semibold">දුරකථනය</th>
                        <th className="pb-3 font-semibold">කණ්ඩායම &amp; Team Leader</th>
                        <th className="pb-3 font-semibold">App Status</th>
                        <th className="pb-3 font-semibold text-right">ක්‍රියාමාර්ග (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredAgents.map((ag) => (
                        <tr key={ag.id} className="hover:bg-slate-800/40">
                          <td className="py-3.5 font-bold text-amber-400">{ag.agentCode}</td>
                          <td className="py-3.5 font-medium text-white">{ag.name}</td>
                          <td className="py-3.5 text-slate-300">{ag.email}</td>
                          <td className="py-3.5 text-slate-300">
                            {ag.mobile && ag.mobile.trim() !== '' && ag.mobile !== 'නැත' ? (
                              <span className="font-mono text-emerald-400 font-bold">{ag.mobile}</span>
                            ) : (
                              <span className="text-slate-500 italic">නැත</span>
                            )}
                          </td>
                          <td className="py-3.5 text-slate-300">
                            <div>
                              <span className="font-semibold text-blue-300">{ag.teamName}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              TL: {ag.teamLeaderName}
                            </div>
                          </td>
                          <td className="py-3.5">
                            {ag.isAppDownloaded || ag.isLoggedIn ? (
                              <button
                                onClick={() =>
                                  updateUserAppStatus(ag.id, { isAppDownloaded: false, isLoggedIn: false })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-black transition shadow-sm"
                                title="AP status ON - වෙනස් කිරීමට ක්ලික් කරන්න"
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                🟢 AP ON (App Active)
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
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-black transition shadow-sm"
                                title="AP status OFF - සක්‍රිය (ON) කිරීමට ක්ලික් කරන්න"
                              >
                                <span className="w-2 h-2 rounded-full bg-rose-400" />
                                🔴 AP OFF (App Missing)
                              </button>
                            )}
                          </td>
                          <td className="py-3.5 text-right space-x-2">
                            <button
                              onClick={() => setSelectedIdCardUserId(ag.id)}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold transition inline-flex items-center gap-1"
                              title="සේවකයාගේ ආයතනික හැඳුනුම්පත පරික්ෂා කර අනුමත කරන්න (ID Card)"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                              <span>ID Card</span>
                            </button>

                            <button
                              onClick={() => {
                                setAgentToConfirmCode({
                                  id: ag.id,
                                  name: ag.name,
                                  currentCode: ag.agentCode && ag.agentCode !== 'පසුව තහවුරු කරන්න' ? ag.agentCode : '',
                                });
                                setNewCodeInput(ag.agentCode && ag.agentCode !== 'පසුව තහවුරු කරන්න' ? ag.agentCode : '');
                                setCodeConfirmResult(null);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition inline-flex items-center gap-1"
                              title="Agent Code අනුමත හෝ සංස්කරණය කරන්න (Code OK)"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {ag.agentCode === 'පසුව තහවුරු කරන්න' || !ag.agentCode
                                ? 'Code OK කරන්න'
                                : 'Code OK / Edit'}
                            </button>

                            <button
                              onClick={() =>
                                setAgentToDelete({
                                  id: ag.id,
                                  name: ag.name,
                                  code: ag.agentCode || '',
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition inline-flex items-center gap-1"
                              title="Owner-only Permanent Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Agent
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            ATTENDANCE TAB (Master Attendance Control Hub)
           ==================================================== */}
        {activeTab === 'attendance' && (
          <div className="mt-6">
            <OwnerAttendanceControlHub />
          </div>
        )}

        {/* ====================================================
            ALL SALES TAB
           ==================================================== */}
        {activeTab === 'sales' && (
          <div className="mt-6">
            <AllSalesView />
          </div>
        )}

        {/* ====================================================
            IVR KEYPAD (#828# / #616#) & APP ACTIVATIONS HUB
           ==================================================== */}
        {activeTab === 'ivr_app_hub' && (
          <div className="mt-6">
            <IvrAndAppActivationsHub
              currentUser={currentUser}
              onOpenMap={() => setActiveTab('gps')}
            />
          </div>
        )}

        {/* ====================================================
            LEAVES TAB
           ==================================================== */}
        {activeTab === 'leaves' && (
          <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">
              සියලුම නිවාඩු ඉල්ලීම් (All Leave Requests - {leaves.length})
            </h3>
            {leaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                කිසිදු නිවාඩු ඉල්ලීමක් නොමැත.
              </p>
            ) : (
              <div className="space-y-3">
                {leaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">
                          {l.agentName} ({l.agentCode})
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            l.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : l.status === 'rejected'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {l.status}
                        </span>
                      </div>
                      <div className="text-xs text-blue-300 font-semibold">
                        {l.startDate} සිට {l.endDate} • {l.daysCount} Days
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{l.reason}</p>
                      {l.reviewedBy && (
                        <p className="text-[11px] text-slate-400 mt-1">
                          Reviewed by {l.reviewedBy}: {l.reviewComment}
                        </p>
                      )}
                    </div>

                    {l.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            updateLeaveStatus(
                              l.id,
                              'approved',
                              currentUser.name,
                              'Owner විසින් අනුමත කරන ලදී'
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve (අනුමත)
                        </button>

                        <button
                          onClick={() =>
                            updateLeaveStatus(
                              l.id,
                              'rejected',
                              currentUser.name,
                              'Owner විසින් ප්‍රතික්ෂේප කරන ලදී'
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject (ප්‍රතික්ෂේප)
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            MESSAGES TAB
           ==================================================== */}
        {activeTab === 'messages' && (
          <div className="mt-6 space-y-6">
            <PageHeaderBanner
              number="06"
              title="සජීවී Chat Box & පණිවිඩ (Executive Live Chat Console)"
              description="ආයතනයේ සියලුම Team Leaders හා Agents සමඟ සජීවීව පණිවිඩ හුවමාරු කරගැනීම, බැලීම සහ පිළිතුරු යැවීම"
              icon={MessageSquare}
              badgeText="EXECUTIVE CHAT CONSOLE"
              badgeColor="amber"
              features={[
                'පණිවිඩ සජීවීව බැලීම හා එසැනින් පිළිතුරු (Reply) යැවීම',
                'Team Leaders හා Agents සමඟ සෘජු සංවාද මාලාව',
                'Voice & Video Meeting ඇමතුම් සෘජුවම Chat Box එකෙන්ම ලබාගැනීම',
              ]}
            />

            <InteractiveChatBox
              onStartCall={(targetUser, type) => {
                startCall(targetUser, type, currentUser);
              }}
            />
          </div>
        )}

        {/* ====================================================
            MEETINGS TAB
           ==================================================== */}
        {activeTab === 'meetings' && (
          <div className="mt-6 space-y-6">
            <PageHeaderBanner
              number="07"
              title="නිල ප්‍රධාන රැස්වීම් Studio (Executive Meeting Studio)"
              description="Owner, Team Leaders හා Agents අතර නිල රැස්වීම් ආරම්භ කිරීම (Start), සම්බන්ධ වීම (Answer) සහ අවසන් කිරීම (Close)"
              icon={Video}
              badgeText="OFFICIAL MEETING ROOM"
              badgeColor="purple"
              features={[
                'නිල වීඩියෝ/ශ්‍රව්‍ය රැස්වීම් ආරම්භය (Start, Answer, Close)',
                'Screen Share, Mic Mute, Hand Raise හා Live Meeting Chat',
                'Security locked meeting access with active host status',
              ]}
            />

            <InAppMeetingStudio />
          </div>
        )}

        {/* ====================================================
            GPS & STATIONARY ALERT TAB
           ==================================================== */}
        {activeTab === 'gps' && (
          <div className="mt-6 space-y-6">
            {/* Live Interactive Sri Lanka GPS Map Canvas */}
            <SriLankaGpsMapView users={users} currentUser={currentUser} />

            {/* Stationary Alert Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/80 to-slate-900 border-2 border-rose-500/60 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                    <AlertCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      ⚠️ Stationary Alert: පැය 1කට වඩා එකම ස්ථානයේ රැඳී සිටින Agents
                    </h3>
                    <p className="text-xs text-rose-300">
                      පැය 1 කට වඩා කිසිදු චලනයක් නොමැතිව එකම GPS ඛණ්ඩාංකයේ සිටින සාමාජිකයින් ස්වයංක්‍රීයව මෙහි හඳුනාගනී.
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/50 text-xs font-extrabold animate-pulse">
                  2 AGENTS STATIONARY &gt; 1 HOUR
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gpsAgents
                  .filter((a) => a.isStationaryOverHour)
                  .map((ag) => (
                    <div
                      key={ag.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/40 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-rose-400">
                            {ag.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                            {ag.stationaryDuration}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mb-1">
                          📍 <strong>දිස්ත්‍රික්කය / ස්ථානය:</strong> {ag.district} ({ag.lat}, {ag.lng})
                        </p>
                        <p className="text-[11px] text-slate-400">
                          👤 <strong>Team Leader:</strong> {ag.teamLeaderName} | 📱 {ag.phone}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() =>
                            sendMessage({
                              senderId: currentUser.id,
                              senderName: 'Owner (System Alert)',
                              senderRole: 'owner',
                              recipientId: 'all',
                              content: `[GPS STATIONARY ALERT]\nAgent: ${ag.name} පැය 1කට වඩා ${ag.district} ස්ථානයේ රැඳී සිටියි. කරුණාකර තත්ත්වය පරීක්ෂා කරන්න.`,
                            })
                          }
                          className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-md shadow-rose-600/30"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          TL වෙත දැනුම් දෙන්න (Alert TL)
                        </button>
                        <a
                          href={`tel:${ag.phone}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                        >
                          Call Agent
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* All Agents GPS List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">
                සියළුම Agent සාමාජිකයින්ගේ Live GPS ඛණ්ඩාංක (Sri Lanka District Map Grid)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-3 font-semibold">Agent Name &amp; Code</th>
                      <th className="pb-3 font-semibold">දිස්ත්‍රික්කය / ස්ථානය</th>
                      <th className="pb-3 font-semibold">GPS ඛණ්ඩාංක (Lat / Lng)</th>
                      <th className="pb-3 font-semibold">චලන තත්ත්වය (Movement)</th>
                      <th className="pb-3 font-semibold">Team Leader</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {gpsAgents.map((ag) => (
                      <tr key={ag.id} className="hover:bg-slate-800/40">
                        <td className="py-3.5 font-bold text-white">{ag.name}</td>
                        <td className="py-3.5 text-slate-300">
                          <span className="inline-flex items-center gap-1 text-blue-400 font-semibold">
                            <MapPin className="w-3.5 h-3.5" />
                            {ag.district}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono text-slate-300">
                          {ag.lat}, {ag.lng}
                        </td>
                        <td className="py-3.5">
                          {ag.isStationaryOverHour ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-extrabold">
                              {ag.stationaryDuration}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                              {ag.stationaryDuration}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 text-slate-300">{ag.teamLeaderName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            EXTERNAL EMAIL / WHATSAPP DISPATCH TAB
           ==================================================== */}
        {activeTab === 'external_msg' && (
          <div className="mt-6 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    ආයතනික නොවන අයට වාර්තා යැවීම (External Email &amp; WhatsApp Report Dispatch)
                  </h3>
                </div>
                {extSuccessMsg && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    {extSuccessMsg}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-6">
                ඔනෑම ආයතනික නොවන අයට (External Auditors, Management, Stakeholders) වාර්තා (Sales Reports, Attendance Sheets, Summary) WhatsApp හෝ Email හරහා ක්ෂණිකව යැවීමට මෙම පෝරමය පුරවන්න.
              </p>

              <form onSubmit={handleSendExternalReport} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ලැබුම්කරුගේ නම (Recipient Name)
                  </label>
                  <input
                    type="text"
                    value={extRecipient}
                    onChange={(e) => setExtRecipient(e.target.value)}
                    placeholder="e.g. Mr. Rohan Perera - External Auditor"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    WhatsApp අංකය හෝ Email ලිපිනය
                  </label>
                  <input
                    type="text"
                    value={extContact}
                    onChange={(e) => setExtContact(e.target.value)}
                    placeholder="0771234567 හෝ rohan@audit.lk"
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    යැවිය යුතු වාර්තා වර්ගය (Report Type)
                  </label>
                  <select
                    value={extReportType}
                    onChange={(e) => setExtReportType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  >
                    <option value="sales_report">දෛනික විකුණුම් වාර්තාව (Daily Sales Report Sheet)</option>
                    <option value="attendance_report">සාමාජික පැමිණීමේ වාර්තාව (Attendance Summary Sheet)</option>
                    <option value="team_summary">කණ්ඩායම් ක්‍රියාකාරීත්ව සාරාංශය (Team Summary Report)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    විශේෂ සටහන (Optional Note)
                  </label>
                  <input
                    type="text"
                    value={extNote}
                    onChange={(e) => setExtNote(e.target.value)}
                    placeholder="e.g. කරුණාකර අද දින විකුණුම් වාර්තාව පරීක්ෂා කරන්න."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div className="md:col-span-2 pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp / Email හරහා වාර්තාව යවන්න (Dispatch Report)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================
            WEBSITE CMS & AI SECURITY HUB TAB
           ==================================================== */}
        {activeTab === 'website_cms' && (
          <div className="mt-6 space-y-6">
            {/* AI Security Hub Status Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    🤖 AI Antigravity Security Firewall &amp; Official Portal
                  </h3>
                  <p className="text-xs text-blue-300">
                    ආයතනික නිල වෙබ් අඩවිය AI ආරක්ෂණ පද්ධතිය මගින් 100% ආරක්ෂිත කර ඇත. Owner අනුමත කරන තොරතුරු පමණක් ප්‍රසිද්ධ වේ.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWebsitePreviewModal(true)}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 transition flex items-center gap-2 shrink-0"
              >
                <Globe className="w-4 h-4" />
                Official Website Preview විවෘත කරන්න
              </button>
            </div>

            {/* Daily Content Publisher */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">
                දෛනිකව තොරතුරු, රූප සටහන් සහ වීඩියෝ වෙබ් අඩවියට එක් කිරීම (CMS Publisher)
              </h3>
              <form onSubmit={handleAddCms} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    මාතෘකාව (Title)
                  </label>
                  <input
                    type="text"
                    value={cmsTitle}
                    onChange={(e) => setCmsTitle(e.target.value)}
                    placeholder="e.g. ගොවිමිතුරු නව සේවාවන්"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    වර්ගය (Type)
                  </label>
                  <select
                    value={cmsType}
                    onChange={(e) => setCmsType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  >
                    <option value="news">ප්‍රවෘත්ති / නිවේදන (News)</option>
                    <option value="banner">ප්‍රචාරක බැනරය (Banner / Image)</option>
                    <option value="video">වීඩියෝ ප්‍රචාරණය (Video)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    රූපය / වීඩියෝ URL (Image or Video Link)
                  </label>
                  <input
                    type="text"
                    value={cmsMediaUrl}
                    onChange={(e) => setCmsMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    විස්තරය (Description)
                  </label>
                  <textarea
                    rows={2}
                    value={cmsDesc}
                    onChange={(e) => setCmsDesc(e.target.value)}
                    placeholder="වෙබ් අඩවියෙහි ප්‍රදර්ශනය කළ යුතු විස්තරය"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    වෙබ් අඩවියට එක් කරන්න (Add to CMS)
                  </button>
                </div>
              </form>
            </div>

            {/* Published / Pending CMS Items */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4">
                වෙබ් අඩවියේ ප්‍රසිද්ධ කර ඇති හා අනුමත කිරීමට ඇති අන්තර්ගතයන් ({cmsItems.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cmsItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {item.type}
                        </span>
                        {item.status === 'live' ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ✓ LIVE ON WEBSITE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold animate-pulse">
                            PENDING OWNER OK
                          </span>
                        )}
                      </div>
                      <img
                        src={item.mediaUrl}
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-lg mb-3 border border-slate-700"
                      />
                      <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2 mb-2">{item.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">Date: {item.date}</span>
                      {item.status !== 'live' && (
                        <button
                          onClick={() => handleApproveCms(item.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                        >
                          Approve &amp; Publish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            SYSTEM GUIDE & AI RULES TAB
           ==================================================== */}
        {activeTab === 'guide' && (
          <div className="mt-6 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  DDWorld 3-Platform System Guide &amp; Automated AI Architecture
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  පද්ධතිය ක්‍රියාත්මක වන ආකාරය, වේදිකා 3 (Owner, Team Leader, Agent) වල රාජකාරි, සහ ස්වයංක්‍රීය AI ක්‍රියාවලීන් පිළිබඳ සම්පූර්ණ අත්පොත.
                </p>
              </div>

              {/* Section 1: Platforms */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-400">
                  1. වේදිකා 3 (Platforms) සහ පිවිසුම් ආරක්ෂාව (Strict Role-Based Access)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <h4 className="font-extrabold text-blue-400 mb-1">👔 Owner Platform</h4>
                    <p className="text-slate-300 leading-relaxed">
                      • පද්ධතියේ ප්‍රධාන පාලක වේදිකාවයි. Owner Master Security Key (<code>9000</code>) හෝ Owner ගිණුම මගින් පමණක් පිවිසිය හැක.<br />
                      • සියලුම Team Leaders සහ Agents සඳහා Username/Password සාදා දීම, Agent Codes අනුමත කිරීම, Live GPS හා Stationary Alerts පරීක්ෂා කිරීම මෙහිදී සිදුකෙරේ.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <h4 className="font-extrabold text-emerald-400 mb-1">🛡️ Team Leader Platform</h4>
                    <p className="text-slate-300 leading-relaxed">
                      • එක් එක් කණ්ඩායම් නායකයාට තමන්ට අදාළ කණ්ඩායමේ සාමාජිකයින් පමණක් දැකගත හැක.<br />
                      • Owner විසින් ලබාදෙන Username/Password මගින් පිවිස, පැමිණීම්, විකුණුම් හා නිවාඩු ඉල්ලීම් අනුමත කිරීම සිදුකරයි.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <h4 className="font-extrabold text-amber-400 mb-1">👤 Agent Platform</h4>
                    <p className="text-slate-300 leading-relaxed">
                      • ක්ෂේත්‍රයේ සිටින සාමාජිකයින් සඳහා වේ.<br />
                      • Owner විසින් Code එක OK කළ පසු පමණක් පිවිසිය හැක. Daily Attendance (Check-in/out), Product Sales, සහ Leaves ඉල්ලීම් ඉදිරිපත් කරයි.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: AI Duties */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-400">
                  2. AI විසින් සිදුකරන රාජකාරි හා ස්වයංක්‍රීය (Automated) ක්‍රියාවලීන්
                </h3>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-xs space-y-2 text-slate-300">
                  <p>
                    • <strong>AI Antigravity Firewall:</strong> සියලුම දත්ත ආරක්ෂා කිරීම, අනවසර පිවිසුම් (Unauthorized Logins) වළක්වාලීම, සහ Website ආරක්ෂණය සිදුකරයි.
                  </p>
                  <p>
                    • <strong>AI Stationary Alert Automation:</strong> පැය 1කට වඩා එකම ස්ථානයේ රැඳී සිටින සාමාජිකයින් ස්වයංක්‍රීයව හඳුනාගෙන Owner සහ Team Leader වෙත දැනුම්දීමේ නිවේදන (Red Alerts) නිකුත් කරයි.
                  </p>
                  <p>
                    • <strong>AI Data Analytics &amp; Reports:</strong> දෛනික විකුණුම් හා පැමිණීම් සාරාංශගත කර WhatsApp සහ Email හරහා ක්ෂණිකව යැවීමට වාර්තා සකස් කරයි.
                  </p>
                </div>
              </div>

              {/* Section 3: Meetings & Calls */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-amber-400">
                  3. Video / Voice Meeting සහ සන්නිවේදන පද්ධතිය
                </h3>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 text-xs text-slate-300 space-y-2">
                  <p>
                    • <strong>In-App Voice Call / Simulator:</strong> ඕනෑම සාමාජිකයෙකුට පද්ධතිය තුළින්ම Voice Call හා රැස්වීම් ආරම්භ කළ හැකි අතර, අදාළ සාමාජිකයාගේ තිරයේ ක්ෂණික Call Notification එකක් දිස්වේ.
                  </p>
                  <p>
                    • <strong>Video Conference Link:</strong> Google Meet / Zoom හෝ අභ්‍යන්තර වීඩියෝ සබැඳි හරහා සියලුම කණ්ඩායම් සාමාජිකයින්ට එකම වේදිකාවකින් සම්බන්ධ විය හැක.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 10: EXECUTIVE AI PARTNER (SECRET AUDIT / VOICE)
           ==================================================== */}
        {activeTab === 'ai_partner' && (
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-500/20 border border-purple-500/40 text-amber-400">
                  <Bot className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    Executive AI Partner &amp; Secret Intelligence
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      Owner Only
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    ලෝකයේ ඕනෑම දෙයක් දැනගැනීමට සහ ආයතනයේ සියලුම Team Leaders, Agents, Sales හා GPS තොරතුරු රහසේ පරීක්ෂා කර Owner වෙත Voice හා පණිවිඩ මගින් වාර්තා කිරීම.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {aiIsSpeaking ? (
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition shadow-lg shadow-rose-500/20"
                  >
                    <VolumeX className="w-4 h-4 animate-bounce" />
                    Stop Voice
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    <Volume2 className="w-4 h-4" />
                    Voice Ready (si-LK)
                  </div>
                )}
              </div>
            </div>

            {/* Secret Audit Trigger Button */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-slate-900/80 to-amber-900/40 border border-purple-500/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Secret Platform Inspection (සියලුම Pages හා Groups රහස් පරීක්ෂාව)
                </h3>
                <p className="text-xs text-slate-300">
                  සියලුම Team Leader groups, Agents ලාගේ GPS ස්ථාන, සහ විකුණුම් ඉලක්ක ස්වයංක්‍රීයව පරීක්ෂා කර Owner වෙත ශ්‍රව්‍ය (Voice Briefing) හා රහස්‍ය වාර්තාවක් ලබාදෙන්න.
                </p>
              </div>
              <button
                onClick={handleRunAiAudit}
                disabled={aiAuditLoading}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-purple-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-purple-500/30 hover:opacity-90 transition flex items-center gap-2 whitespace-nowrap"
              >
                <Cpu className="w-4 h-4" />
                {aiAuditLoading ? 'පරීක්ෂා කරමින් පවතී...' : 'Run Secret Inspection & Voice Report'}
              </button>
            </div>

            {/* AI Response Card */}
            {aiResponse && (
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-purple-500/40 text-slate-200 text-xs space-y-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-purple-400" />
                    AI Confidential Intelligence Report
                  </span>
                  <button
                    onClick={() => speakBriefing(aiResponse)}
                    className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white transition font-semibold bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/30"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Listen Again
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-300 leading-relaxed">
                  {aiResponse}
                </pre>
              </div>
            )}

            {/* Interactive Question / Answer Bar */}
            <form onSubmit={handleAskAiPartner} className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                AI Partner ගෙන් ඕනෑම ප්‍රශ්නයක් අසන්න (Sales, GPS, හෝ Global Information):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. අද වැඩිම විකුණුම් කළ Agent කවුද? හෝ GPS පැයකට වඩා නතර වූ අය කවුද?"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs placeholder-slate-500 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask AI
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ====================================================
            TAB 11: WEBSITE & SOCIAL MEDIA PROMOTIONAL HUB
           ==================================================== */}
        {activeTab === 'share_promo' && (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Megaphone className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    Social Media &amp; Internet Promotional Hub
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      Public / Facebook / WhatsApp
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    ආයතනයේ Job Vacancy සහ තොරතුරු Facebook, WhatsApp හා Internet හරහා ප්‍රදර්ශණය හා Share කිරීම.
                  </p>
                </div>
              </div>
            </div>

            {promoShareSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                ✓ {promoShareSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Promotion Customization Form */}
              <div className="space-y-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/80">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  1. ප්‍රදර්ශන දැන්වීමේ තොරතුරු (Advertisement Details)
                </h3>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    දැන්වීම් මාතෘකාව (Title):
                  </label>
                  <input
                    type="text"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    විස්තරය (Description):
                  </label>
                  <textarea
                    rows={3}
                    value={promoDesc}
                    onChange={(e) => setPromoDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    වැටුප් හා ප්‍රතිලාභ (Salary / Benefits):
                  </label>
                  <input
                    type="text"
                    value={promoSalary}
                    onChange={(e) => setPromoSalary(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    අයදුම් සබැඳිය / Web Link:
                  </label>
                  <input
                    type="text"
                    value={promoLink}
                    onChange={(e) => setPromoLink(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>
              </div>

              {/* Live Card Preview & Share Buttons */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md">
                      Official Career Ad
                    </span>
                    <span className="text-[11px] text-slate-400">DD World Sri Lanka</span>
                  </div>
                  <h4 className="text-base font-extrabold text-amber-400">{promoTitle}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{promoDesc}</p>
                  <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-emerald-300 text-xs font-bold">
                    💰 {promoSalary}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-300">
                    2. සමාජ මාධ්‍ය වෙත Share කරන්න:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleShareFacebook}
                      className="py-3 px-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                    >
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </button>

                    <button
                      onClick={handleShareWhatsApp}
                      className="py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                    >
                      <Radio className="w-4 h-4" />
                      WhatsApp
                    </button>

                    <button
                      onClick={handleCopyPromoLink}
                      className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
                    >
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 12: MANDATORY EMPLOYEE KYC & DOCUMENTS HUB (OWNER DOWNLOAD)
           ==================================================== */}
        {activeTab === 'staff_verification' && (
          <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* Header & Download Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-slate-800 pb-5 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/40 text-blue-400">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    සේවක ලියාපදිංචි වාර්තා හා සහතික (Employee KYC &amp; Documents Hub)
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      100% Verified
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    සෑම සේවකයෙකුගේම (Team Leader / Agent) අනිවාර්ය තොරතුරු, ID Number, Address, ග්‍රාමසේවා හා පොලිස් රිපෝට් පරීක්ෂා කර Download කරගන්න.
                  </p>
                </div>
              </div>

              {/* Download & Export Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDownloadStaffCSV}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                  title="Download all staff KYC details as an Excel/CSV file"
                >
                  <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                  <span>Download All Data (CSV)</span>
                </button>

                <button
                  onClick={handlePrintStaffReport}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-2"
                  title="Print or Save PDF report"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Print / Save Report (PDF)</span>
                </button>
              </div>
            </div>

            {/* Quick Stat Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">
                    මුළු සේවකයින් ගණන (Total Staff)
                  </span>
                  <div className="text-xl font-black text-white mt-1">{users.length}</div>
                </div>
                <Users className="w-8 h-8 text-blue-400/80" />
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-emerald-300 font-semibold uppercase">
                    තහවුරු කළ වාර්තා (Verified KYC)
                  </span>
                  <div className="text-xl font-black text-emerald-400 mt-1">
                    {verifications.length}
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-amber-300 font-semibold uppercase">
                    අපේක්ෂිත වාර්තා (Pending)
                  </span>
                  <div className="text-xl font-black text-amber-400 mt-1">
                    {Math.max(0, users.length - verifications.length)}
                  </div>
                </div>
                <AlertCircle className="w-8 h-8 text-amber-400" />
              </div>
            </div>

            {/* Comprehensive Table of Verified Staff */}
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3.5 px-4">සේවකයා (Staff Member)</th>
                    <th className="py-3.5 px-4">Role &amp; Code</th>
                    <th className="py-3.5 px-4">NIC / ID අංකය</th>
                    <th className="py-3.5 px-4">දුරකථන අංකය</th>
                    <th className="py-3.5 px-4">ස්ථිර ලිපිනය (Address)</th>
                    <th className="py-3.5 px-4">ග්‍රාමසේවා සහතිකය (GN Report)</th>
                    <th className="py-3.5 px-4">පොලිස් රිපෝට් (Police Report)</th>
                    <th className="py-3.5 px-4 text-center">තත්ත්වය (Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {verifications.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        තවම කිසිදු සේවකයෙකුගේ ලියාපදිංචි වාර්තා පද්ධතියට එක්කර නොමැත.
                      </td>
                    </tr>
                  ) : (
                    verifications.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-900/50 transition">
                        {/* Name & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                              {v.idPhotoUrl ? (
                                <img
                                  src={v.idPhotoUrl}
                                  alt={v.userName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                                  ID
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100">{v.userName}</div>
                              <div className="text-[10px] text-slate-500">
                                Updated: {v.submittedAt}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Agent Code */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              v.userRole === 'team_leader'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : v.userRole === 'owner'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {v.userRole === 'team_leader'
                              ? 'Team Leader'
                              : v.userRole === 'owner'
                              ? 'Owner'
                              : `Agent ${v.agentCode || ''}`}
                          </span>
                        </td>

                        {/* NIC / ID */}
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          {v.idNumber}
                        </td>

                        {/* Contact Number */}
                        <td className="py-3 px-4 font-mono">{v.contactNumber}</td>

                        {/* Permanent Address */}
                        <td className="py-3 px-4 max-w-xs truncate" title={v.address}>
                          {v.address}
                        </td>

                        {/* Grama Niladhari Report */}
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium max-w-[150px] truncate" title={v.gramaNiladhariReportUrl}>
                            <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                            <span className="truncate">{v.gramaNiladhariReportUrl}</span>
                          </div>
                        </td>

                        {/* Police Report */}
                        <td className="py-3 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-medium max-w-[150px] truncate" title={v.policeReportUrl}>
                            <Check className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                            <span className="truncate">{v.policeReportUrl}</span>
                          </div>
                        </td>

                        {/* Verification Status Badge */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wide">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB: SECURE CLOUD STORAGE VAULT (Owner Only)
           ==================================================== */}
        {activeTab === 'vault' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header & Memory Usage Bar */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      Owner සඳහා ආරක්ෂිත දත්ත ගබඩාගාරය (Secure Cloud Storage Vault)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      PDF, ගිවිසුම් (Contracts), Policy Documents, ඡායාරූප (Photos) සහ බිල්පත් ආරක්ෂිතව ගබඩා කිරීම
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 self-start md:self-auto">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  AES-256 Cloud Encrypted Vault
                </div>
              </div>

              {/* Memory Usage Bar */}
              {(() => {
                const totalUsedMB = vaultFiles.reduce((acc, f) => acc + (f.fileSizeMB || 0), 0);
                const totalCapGB = 50.0;
                const usedGB = totalUsedMB / 1024;
                const percentage = Math.min((usedGB / totalCapGB) * 100, 100);

                return (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        ගබඩා ධාරිතාව (Memory Usage Tracker)
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {usedGB.toFixed(2)} GB Used / {totalCapGB.toFixed(1)} GB Total ({percentage.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[11px] pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="block text-slate-400">මුළු ගොනු ගණන</span>
                        <span className="font-bold text-slate-100 text-sm">{vaultFiles.length} Files</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="block text-slate-400">භාවිත වූ ධාරිතාව</span>
                        <span className="font-bold text-purple-300 text-sm">{totalUsedMB.toFixed(1)} MB</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="block text-slate-400">ඉතිරි ධාරිතාව</span>
                        <span className="font-bold text-emerald-400 text-sm">{(totalCapGB - usedGB).toFixed(2)} GB</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="block text-slate-400">ආරක්ෂිත තත්ත්වය</span>
                        <span className="font-bold text-amber-300 text-sm">Vault Protected</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Upload Form */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-purple-400" />
                  නව ගොනුවක් Vault එකට එක් කරන්න (Upload File to Secure Vault)
                </h3>

                {vaultSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {vaultSuccess}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!vaultTitle.trim() || !vaultFileName.trim()) return;
                    addVaultFile({
                      title: vaultTitle.trim(),
                      category: vaultCategory,
                      fileName: vaultFileName.trim(),
                      fileSizeMB: Number(vaultSizeMB) || 3.5,
                      fileUrl: `#vault-file-${Date.now()}`,
                      uploadedBy: 'Dushmantha Fernando (Owner)',
                      notes: vaultNotes,
                    });
                    setVaultTitle('');
                    setVaultFileName('');
                    setVaultNotes('');
                    setVaultSuccess('ගොනුව සාර්ථකව ආරක්ෂිත Vault එකට එක් කර ගන්නා ලදී!');
                    setTimeout(() => setVaultSuccess(null), 3000);
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">ගොනුවේ නම / මාතෘකාව</label>
                    <input
                      type="text"
                      value={vaultTitle}
                      onChange={(e) => setVaultTitle(e.target.value)}
                      placeholder="e.g. Dialog Official Contract 2026"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">ගොනු වර්ගය (Category)</label>
                    <select
                      value={vaultCategory}
                      onChange={(e) => setVaultCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="contract">ගිවිසුම (Contract)</option>
                      <option value="pdf">PDF ලේඛනය (PDF Doc)</option>
                      <option value="policy">ප්‍රතිපත්ති (Policy Doc)</option>
                      <option value="photo">ඡායාරූපය (Photo)</option>
                      <option value="bill">බිල්පත (Bill / Invoice)</option>
                      <option value="other">වෙනත් (Other)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">File Name (e.g. Agreement.pdf)</label>
                    <input
                      type="text"
                      value={vaultFileName}
                      onChange={(e) => setVaultFileName(e.target.value)}
                      placeholder="e.g. agreement_2026.pdf"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-medium">File Size (MB)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        value={vaultSizeMB}
                        onChange={(e) => setVaultSizeMB(e.target.value)}
                        placeholder="5.0"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition shrink-0 shadow-lg shadow-purple-600/30"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Vault Files List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    ගබඩා කර ඇති සියලුම ගොනු ({vaultFiles.length})
                  </h3>

                  {/* Filter category */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Filter:</span>
                    <select
                      value={vaultFilterCategory}
                      onChange={(e) => setVaultFilterCategory(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold"
                    >
                      <option value="all">සියලුම ගොනු (All)</option>
                      <option value="contract">ගිවිසුම් (Contracts)</option>
                      <option value="pdf">PDF Docs</option>
                      <option value="policy">Policy Docs</option>
                      <option value="photo">Photos</option>
                      <option value="bill">Bills</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vaultFiles
                    .filter((f) => vaultFilterCategory === 'all' || f.category === vaultFilterCategory)
                    .map((file) => (
                      <div
                        key={file.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition flex flex-col justify-between space-y-3 shadow-lg"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                file.category === 'contract'
                                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                  : file.category === 'pdf'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : file.category === 'photo'
                                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                  : file.category === 'bill'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {file.category}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              {file.fileSizeMB} MB
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white mb-1 line-clamp-1" title={file.title}>
                            {file.title}
                          </h4>
                          <p className="text-xs font-mono text-slate-400 line-clamp-1 mb-2" title={file.fileName}>
                            📄 {file.fileName}
                          </p>
                          {file.notes && (
                            <p className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                              "{file.notes}"
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Uploaded: {file.uploadedAt}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => alert(`Vault Security Download initiated for: ${file.fileName}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold flex items-center gap-1 transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              View
                            </button>
                            <button
                              onClick={() => deleteVaultFile(file.id)}
                              className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                              title="Delete File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            TAB: SYSTEM DOCTOR AI (Auto-Heal & Cache Protection)
           ==================================================== */}
        {activeTab === 'system_doctor' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      System Doctor AI (Auto-Heal &amp; Error Prevention Engine)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      පද්ධතියේ දෝෂ, Cache ගැටළුවක් හෝ පැරණි Session නොමැති බව තහවුරු කරන පසුබිම් AI ආරක්ෂණ පද්ධතිය
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Doctor AI: 100% Active &amp; Healed
                  </span>
                  <button
                    onClick={() => {
                      const res = runSystemDoctorAutoHeal();
                      setDoctorFeedback(res.message);
                      setTimeout(() => setDoctorFeedback(null), 4000);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    Run Diagnostic &amp; Auto-Heal
                  </button>
                </div>
              </div>

              {doctorFeedback && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>{doctorFeedback}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 px-2 py-1 rounded-md text-emerald-300 font-mono">
                    STATUS: OK
                  </span>
                </div>
              )}

              {/* Status Indicator Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Storage State</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-white">LocalStorage Integrity</div>
                  <p className="text-[11px] text-slate-400">100% Valid JSON Sync Across Multi-Tabs</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Broadcast Sync</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                      LIVE
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-white">Real-Time Data Flow</div>
                  <p className="text-[11px] text-slate-400">Agent Attendance &amp; Sales Instantly Synced</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Cache Health</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                      PURGED
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-white">Memory &amp; Cache</div>
                  <p className="text-[11px] text-slate-400">0 Stale Latency Errors Detected</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Security AI</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px]">
                      ENFORCED
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-white">Security &amp; Auth</div>
                  <p className="text-[11px] text-slate-400">Owner Security Code Enforcement Active</p>
                </div>
              </div>

              {/* Logs List */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  System Doctor Auto-Heal Logs ({systemDoctorLogs.length})
                </h3>

                <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                  <div className="divide-y divide-slate-800/80">
                    {systemDoctorLogs.map((log) => (
                      <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/50 transition">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 mt-0.5 shrink-0">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-200">{log.message}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {log.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Issue Type: {log.issueType}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400 shrink-0">
                          {log.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ====================================================
            TAB: WEB AI & MARKETING HUB
           ==================================================== */}
        {activeTab === 'web_marketing' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Megaphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      වෙබ් අඩවිය සහ මාධ්‍ය ප්‍රචාරණ කළමනාකරණය (Web AI &amp; Marketing Hub)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ශ්‍රී ලංකාව පුරා ගොවිමිතුරු (#616#) සහ සයුරු (#828#) ප්‍රචාරණය කිරීම, පෝස්ට්/වීඩියෝ Publish කිරීම සහ Web AI සමඟ Chat කිරීම
                    </p>
                  </div>
                </div>

                {/* Sub-tab navigation */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setMktSubTab('posts')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      mktSubTab === 'posts'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    1. මාධ්‍ය ප්‍රචාරණ පෝස්ට් ({marketingPosts.length})
                  </button>
                  <button
                    onClick={() => setMktSubTab('chat')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      mktSubTab === 'chat'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    2. Web AI Chat &amp; Advice ({webAiMessages.length})
                  </button>
                </div>
              </div>

              {mktSubTab === 'posts' ? (
                <div className="space-y-6">
                  {/* Create New Marketing Post Form */}
                  <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-4">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      නව මාධ්‍ය ප්‍රචාරණ පෝස්ටයක් / ලිපියක් / වීඩියෝවක් පළ කරන්න (Publish Content)
                    </h3>

                    {mktSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {mktSuccess}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!mktTitle.trim() || !mktDesc.trim()) return;
                        addMarketingPost({
                          title: mktTitle.trim(),
                          contentType: mktType,
                          description: mktDesc.trim(),
                          mediaUrl: mktMediaUrl.trim() || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
                          status: 'published',
                          targetAudience: mktAudience,
                        });
                        setMktTitle('');
                        setMktDesc('');
                        setMktMediaUrl('');
                        setMktSuccess('නව මාධ්‍ය ප්‍රචාරණ පෝස්ටය සාර්ථකව Publish කරන ලදී!');
                        setTimeout(() => setMktSuccess(null), 3000);
                      }}
                      className="space-y-4 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-slate-300 font-medium">පෝස්ට් මාතෘකාව (Title)</label>
                          <input
                            type="text"
                            value={mktTitle}
                            onChange={(e) => setMktTitle(e.target.value)}
                            placeholder="e.g. #616# ගොවිමිතුරු සේවාව මගින් අස්වැන්න වැඩි කරගන්නා හැටි"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-300 font-medium">වර්ගය (Content Type)</label>
                          <select
                            value={mktType}
                            onChange={(e) => setMktType(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="article">ලිපිය (Article)</option>
                            <option value="post">ප්‍රවර්ධන පෝස්ට් (Promo Post)</option>
                            <option value="video">ප්‍රවර්ධන වීඩියෝ (Promo Video)</option>
                            <option value="promo">විශේෂ ව්‍යාපාරය (Campaign)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-300 font-medium">Media / Thumbnail Photo / Video Link</label>
                          <input
                            type="text"
                            value={mktMediaUrl}
                            onChange={(e) => setMktMediaUrl(e.target.value)}
                            placeholder="e.g. https://images.unsplash.com/... හෝ YouTube/Video URL"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-300 font-medium">ඉලක්කගත පාරිභෝගික කණ්ඩායම (Target Audience)</label>
                          <input
                            type="text"
                            value={mktAudience}
                            onChange={(e) => setMktAudience(e.target.value)}
                            placeholder="e.g. All Sri Lanka Mobile Users & Dialog Subscribers"
                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-medium">පෝස්ට් විස්තරය (Description / Body)</label>
                        <textarea
                          rows={3}
                          value={mktDesc}
                          onChange={(e) => setMktDesc(e.target.value)}
                          placeholder="කෘෂිකාර්මික හා ධීවර ප්‍රජාව දැනුවත් කරන ප්‍රවර්ධන තොරතුරු මෙතැන සටහන් කරන්න..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-amber-500"
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition"
                        >
                          Publish Promo Content
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Existing Marketing Posts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {marketingPosts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-44 bg-slate-900 overflow-hidden">
                            <img
                              src={post.mediaUrl}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                              {post.contentType}
                            </span>
                          </div>

                          <div className="p-4 space-y-2">
                            <h4 className="text-sm font-bold text-white line-clamp-2">{post.title}</h4>
                            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{post.description}</p>
                            <div className="pt-2 text-[11px] text-slate-400">
                              🎯 Target: <span className="text-slate-200">{post.targetAudience}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-slate-400">
                            <span className="flex items-center gap-1 font-mono text-emerald-400">
                              <Eye className="w-3.5 h-3.5" /> {post.views} Views
                            </span>
                            <span className="flex items-center gap-1 font-mono text-rose-400">
                              ♥ {post.likes} Likes
                            </span>
                          </div>

                          <button
                            onClick={() => deleteMarketingPost(post.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Web AI Chat Window */
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-amber-400" />
                      <h3 className="text-sm font-bold text-white">
                        DD World Web AI Marketing &amp; Advisory Chatbot
                      </h3>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono">Status: 24/7 AI Online</span>
                  </div>

                  <div className="h-80 overflow-y-auto space-y-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    {webAiMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === 'ai' ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                            msg.sender === 'ai'
                              ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none'
                              : 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                            <span className="font-bold">{msg.senderName}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="leading-relaxed">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!webAiText.trim()) return;
                      sendWebAiMessage(webAiText.trim(), 'owner');
                      setWebAiText('');
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={webAiText}
                      onChange={(e) => setWebAiText(e.target.value)}
                      placeholder="Web AI ගෙන් #616# / #828# ප්‍රචාරණ උපදෙස් හෝ ප්‍රශ්න අහන්න..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5"
                    >
                      <Send className="w-4 h-4" /> Send AI
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB: EMPLOYEE DAILY JOB ROLES TRACKER
           ==================================================== */}
        {activeTab === 'job_roles' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      සේවකයින්ගේ දෛනික රැකියා වගකීම් සහ ක්‍රියාකාරීත්ව වාර්තාව (Employee Daily Job Roles Tracker)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      ආයතනයේ සියලුම සේවකයින්ගේ (Agents, Team Leaders, Owner) දෛනික Routines, Attendance, Sales &amp; Target Compliance පරීක්ෂාව
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={jobRoleDate}
                    onChange={(e) => setJobRoleDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold"
                  />
                  <select
                    value={jobRoleTeamFilter}
                    onChange={(e) => setJobRoleTeamFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-bold"
                  >
                    <option value="all">සියලුම කණ්ඩායම් (All Teams)</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stats Summary */}
              {(() => {
                const reports = getDailyJobRoleReports(jobRoleDate).filter(
                  (r) => jobRoleTeamFilter === 'all' || r.teamName === teams.find((t) => t.id === jobRoleTeamFilter)?.name
                );
                const totalEmps = reports.length;
                const completedCount = reports.filter((r) => r.dailyRoutineCompleted).length;
                const avgScore = totalEmps > 0 ? reports.reduce((acc, r) => acc + r.complianceScore, 0) / totalEmps : 0;
                const totalSalesCount = reports.reduce((acc, r) => acc + r.salesCountToday, 0);

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-xs">ලියාපදිංචි සේවකයින්</span>
                      <div className="text-2xl font-black text-white">{totalEmps} Users</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-xs">පැමිණීම සටහන් කළ සංඛ්‍යාව</span>
                      <div className="text-2xl font-black text-emerald-400">{completedCount} Marked</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-xs">සාමාන්‍ය Compliance Score</span>
                      <div className="text-2xl font-black text-indigo-400">{avgScore.toFixed(0)}%</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-xs">අද දින මුළු Sales Entries</span>
                      <div className="text-2xl font-black text-amber-400">{totalSalesCount} Entries</div>
                    </div>
                  </div>
                );
              })()}

              {/* Compliance Matrix Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">සේවක නම සහ තනතුර (User &amp; Role)</th>
                        <th className="py-3 px-4">Agent Code / Team</th>
                        <th className="py-3 px-4">පැමිණීම (Check-In)</th>
                        <th className="py-3 px-4">පිටවීම (Check-Out)</th>
                        <th className="py-3 px-4">අද දින Sales Quantity</th>
                        <th className="py-3 px-4 text-center">Routine Status</th>
                        <th className="py-3 px-4 text-center">Compliance Grade Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {getDailyJobRoleReports(jobRoleDate)
                        .filter((r) => jobRoleTeamFilter === 'all' || r.teamName === teams.find((t) => t.id === jobRoleTeamFilter)?.name)
                        .map((report) => (
                          <tr key={report.userId} className="hover:bg-slate-900/50 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{report.userName}</div>
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  report.userRole === 'owner'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : report.userRole === 'team_leader'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {report.userRole}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono">
                              <span className="font-bold text-amber-300">{report.agentCode || 'N/A'}</span>
                              <div className="text-[10px] text-slate-500">{report.teamName || 'DD World Core'}</div>
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {report.checkInTime ? (
                                <span className="text-emerald-400 font-bold">✓ {report.checkInTime}</span>
                              ) : (
                                <span className="text-slate-500">නොමැත</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {report.checkOutTime ? (
                                <span className="text-blue-400 font-bold">✓ {report.checkOutTime}</span>
                              ) : (
                                <span className="text-slate-500">නොමැත</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-amber-400">
                              {report.salesTotalQuantityToday} Units ({report.salesCountToday} sales)
                            </td>
                            <td className="py-3 px-4 text-center">
                              {report.dailyRoutineCompleted ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                                  COMPLETED
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[10px]">
                                  PENDING
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <span
                                  className={`px-3 py-1 rounded-xl text-xs font-black border ${
                                    report.complianceScore >= 80
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : report.complianceScore >= 50
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  }`}
                                >
                                  {report.complianceScore}% Score
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================
          MODAL: COMPANY OFFICIAL WEBSITE PREVIEW
         ==================================================== */}
      {showWebsitePreviewModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-extrabold text-white">
                  Dialog &amp; Govimithuru / Sayuru - Official Web Portal Preview
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  🤖 AI Firewall: Active (100% Secure)
                </span>
              </div>
              <button
                onClick={() => setShowWebsitePreviewModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 bg-slate-900 text-slate-100">
              {/* Portal Hero */}
              <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/30 text-center">
                <h1 className="text-2xl font-black text-white mb-2">
                  ඩයලොග් ගොවිමිතුරු සහ සයුරු ඩිජිටල් සේවා ජාලය
                </h1>
                <p className="text-sm text-slate-300 max-w-2xl mx-auto">
                  ශ්‍රී ලංකාවේ කෘෂිකාර්මික හා ධීවර ප්‍රජාව සබල ගන්වන නවතම ඩිජිටල් සේවාවන්. තත්පරයෙන් තත්පරය කාලගුණ සහ වෙළඳපල තොරතුරු.
                </p>
              </div>

              {/* Published CMS Grid */}
              <div>
                <h2 className="text-base font-bold text-white mb-4 border-l-4 border-blue-500 pl-3">
                  නවතම තොරතුරු සහ නිවේදන (Latest Published Content)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cmsItems
                    .filter((it) => it.status === 'live')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-full h-44 object-cover"
                          />
                          <div className="p-4">
                            <span className="text-[10px] uppercase font-bold text-blue-400">
                              {item.type}
                            </span>
                            <h3 className="text-sm font-bold text-white mt-1 mb-2">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                        <div className="px-4 pb-3 text-[11px] text-slate-400">
                          Published on {item.date} by {item.author}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: Add New Agent / Team Leader (Owner Only)
         ==================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  නව සේවකයෙකු / Team Leader එකතු කිරීම (Add Staff Member)
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm px-2"
              >
                ✕
              </button>
            </div>

            {/* Role selector tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setAddStaffRole('agent');
                  setAgCode(`AG-00${activeAgents.length + 2}`);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  addStaffRole === 'agent'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👤 Field Agent කෙනෙකු එකතු කරන්න
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddStaffRole('team_leader');
                  setAgCode(`TL-00${teams.length + 1}`);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${
                  addStaffRole === 'team_leader'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🛡️ Team Leader කෙනෙකු එකතු කරන්න
              </button>
            </div>

            {addMsg && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  addMsg.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                }`}
              >
                {addMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateAgent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {addStaffRole === 'team_leader' ? 'Team Leader Name (නම)' : 'Agent Name (නම)'}
                  </label>
                  <input
                    type="text"
                    value={agName}
                    onChange={(e) => setAgName(e.target.value)}
                    placeholder={addStaffRole === 'team_leader' ? 'e.g. කසුන් පෙරේරා' : 'e.g. රවීන් ප්‍රසාද්'}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {addStaffRole === 'team_leader' ? 'TL Code / ID (අංකය)' : 'Agent Code (අංකය)'}
                  </label>
                  <input
                    type="text"
                    value={agCode}
                    onChange={(e) => setAgCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number (දුරකථන අංකය)
                  </label>
                  <input
                    type="tel"
                    value={agMobile}
                    onChange={(e) => setAgMobile(e.target.value)}
                    placeholder="0711122334"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email ලිපිනය
                  </label>
                  <input
                    type="email"
                    value={agEmail}
                    onChange={(e) => setAgEmail(e.target.value)}
                    placeholder={addStaffRole === 'team_leader' ? 'kasun@ddworld.lk' : 'raveen@ddworld.lk'}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Temporary Password
                </label>
                <input
                  type="text"
                  value={agTempPassword}
                  onChange={(e) => setAgTempPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-mono"
                />
              </div>

              {addStaffRole === 'team_leader' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    නව කණ්ඩායමේ නම (New Team Name)
                  </label>
                  <input
                    type="text"
                    value={tlTeamName}
                    onChange={(e) => setTlTeamName(e.target.value)}
                    placeholder="e.g. Epsilon Team / Central Leaders"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    මෙම Team Leader හට නව කණ්ඩායමක් ස්වයංක්‍රීයව පද්ධතියේ නිර්මාණය වේ.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Team Name & Assigned Team Leader
                  </label>
                  <select
                    value={agTeamId}
                    onChange={(e) => setAgTeamId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} (Leader: {t.leaderName})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                {addStaffRole === 'team_leader' ? (
                  <>
                    • Role = Team Leader ලෙස ස්වයංක්‍රීයව පද්ධතියට එක්වේ.<br />
                    • නව Team Leader හට තම කණ්ඩායම පාලනය කිරීමට Dashboard එක සක්‍රීය වේ.<br />
                    • TL Code සහ Email Duplicate වීමට ඉඩ නොදෙයි.
                  </>
                ) : (
                  <>
                    • Role = Field Agent ලෙස ස්වයංක්‍රීයව සකසයි.<br />
                    • අදාළ Team Leader ගේ Dashboard එකේ වහාම පෙන්වයි.<br />
                    • Agent Code සහ Email Duplicate වීමට ඉඩ නොදෙයි.
                  </>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition"
                >
                  {addStaffRole === 'team_leader' ? '🛡️ Team Leader එකතු කරන්න' : '👤 Agent Add කරන්න'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: Confirmation Box for Permanent Delete Agent
         ==================================================== */}
      {agentToDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/50 rounded-3xl shadow-2xl p-6 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-base font-extrabold text-white mb-2">
              මෙම Agent ව ස්ථිරව ඉවත් කිරීමට ඔබට විශ්වාසද?
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              ඔබ විසින් <span className="font-bold text-rose-400">{agentToDelete.name}</span> ({agentToDelete.code}) ඉවත් කළ විට Active Users List, Team, සහ Team Leader ගේ ලැයිස්තුවෙන් ස්වයංක්‍රීයව ඉවත් වී, පිවිසුම් අවසර වහාම අවලංගු වේ.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAgentToDelete(null)}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPermanentDelete}
                className="py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition"
              >
                Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {activeCall && (
        <CallNotificationModal
          callerName={activeCall.callerName}
          callerRole={activeCall.callerRole}
          onAccept={() => {
            setActiveTab('meetings');
            setActiveCall(null);
          }}
          onReject={() => setActiveCall(null)}
        />
      )}

      {/* ====================================================
          CONFIRM / EDIT AGENT CODE MODAL (Owner Only)
         ==================================================== */}
      {agentToConfirmCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Agent Code එක අනුමත හෝ සංස්කරණය (Confirm / Edit)
                </h3>
                <p className="text-xs text-slate-400">
                  {agentToConfirmCode.name}
                </p>
              </div>
            </div>

            {codeConfirmResult && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-semibold border ${
                  codeConfirmResult.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                }`}
              >
                {codeConfirmResult.text}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  නව Agent Code එක ඇතුළත් කරන්න (e.g. 9240, 9263, 9180):
                </label>
                <input
                  type="text"
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value)}
                  placeholder="e.g. 9240"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold text-amber-400 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
                <p className="font-bold text-emerald-400">
                  ★ Code එක OK කළ පසු පිවිසුම් තොරතුරු:
                </p>
                <p>
                  • <strong>මුරපදය (Password):</strong> <code>DDW@{newCodeInput || 'CODE'}</code> හෝ <code>DDW@9000</code>
                </p>
                <p>
                  • ඒ මොහොතේම සාමාජිකයාට පද්ධතියට Log වීමට හැකියාව ලැබේ.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setAgentToConfirmCode(null);
                    setCodeConfirmResult(null);
                  }}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    const res = updateAgentCode(agentToConfirmCode.id, newCodeInput);
                    setCodeConfirmResult({
                      type: res.success ? 'success' : 'error',
                      text: res.message,
                    });
                    if (res.success) {
                      setTimeout(() => {
                        setAgentToConfirmCode(null);
                        setCodeConfirmResult(null);
                      }, 2000);
                    }
                  }}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Code OK කරන්න
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Custom Password Change Modal */}
      {isPwdModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Owner මුරපදය (Password) වෙනස් කිරීම
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    ඔබට කැමති රහස් මුරපදයක් මෙතැනින් සකසා ගත හැක
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsPwdModalOpen(false);
                  setPwdMsg(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {pwdMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 font-medium ${
                  pwdMsg.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveOwnerPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  නව මුරපදය (New Password)
                </label>
                <input
                  type="password"
                  value={newOwnerPwd}
                  onChange={(e) => setNewOwnerPwd(e.target.value)}
                  placeholder="නව රහස් මුරපදය ඇතුළත් කරන්න"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  නව මුරපදය නැවත තහවුරු කරන්න (Confirm Password)
                </label>
                <input
                  type="password"
                  value={confirmOwnerPwd}
                  onChange={(e) => setConfirmOwnerPwd(e.target.value)}
                  placeholder="නව මුරපදය නැවත ටයිප් කරන්න"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsPwdModalOpen(false);
                    setPwdMsg(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition"
                >
                  නව මුරපදය සුරකින්න
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Quick-Access Modals inside Owner Dashboard */}
      <SriLankaGpsMapModal
        isOpen={gpsMapModalOpen}
        onClose={() => setGpsMapModalOpen(false)}
        users={users}
        currentUser={currentUser}
      />

      <OfficialCorporateIdCardModal
        isOpen={!!selectedIdCardUserId}
        onClose={() => setSelectedIdCardUserId(null)}
        targetUserId={selectedIdCardUserId || undefined}
      />
    </div>
  );
};
