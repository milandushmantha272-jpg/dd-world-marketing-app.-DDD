import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  FileText,
  UserCheck,
  Users,
  Lock,
  Printer,
  ChevronRight,
  Target,
  Sparkles,
  PhoneCall,
  MapPin,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DdWorldLogo } from './DdWorldLogo';

interface OfficialJobRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialJobRulesModal: React.FC<OfficialJobRulesModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'agent' | 'team_leader'>(
    currentUser?.role === 'team_leader' ? 'team_leader' : 'agent'
  );
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'anti_fraud'>('daily');

  const agreementKey = `ddworld_job_rules_agreed_${currentUser?.id || 'guest'}`;
  const [hasAgreed, setHasAgreed] = useState<boolean>(() => {
    return localStorage.getItem(agreementKey) === 'true';
  });
  const [agreedTimestamp, setAgreedTimestamp] = useState<string | null>(() => {
    return localStorage.getItem(`${agreementKey}_time`);
  });

  if (!isOpen) return null;

  const handleAgree = () => {
    const timeStr = new Date().toLocaleString('si-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    localStorage.setItem(agreementKey, 'true');
    localStorage.setItem(`${agreementKey}_time`, timeStr);
    setHasAgreed(true);
    setAgreedTimestamp(timeStr);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto">
        {/* Top Dialog Enterprise Banner */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 p-5 border-b border-red-900/40 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3.5">
            <DdWorldLogo size="sm" showText={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#E1141E] text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Dialog Axiata Partner
                </span>
                <span className="text-xs text-amber-400 font-bold">DD WORLD ENTERPRISE</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                නිල රාජකාරි රීති මාලාව සහ වංචා වැළැක්වීමේ විනය සංග්‍රහය
              </h2>
              <p className="text-xs text-slate-400">
                Official Standard Operating Procedures (SOP), KPIs & Anti-Fraud Compliance Code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="bg-slate-950/80 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRole('agent')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                selectedRole === 'agent'
                  ? 'bg-[#E1141E] text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>නියෝජිතයින් (Field Sales Agents)</span>
            </button>
            <button
              onClick={() => setSelectedRole('team_leader')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 ${
                selectedRole === 'team_leader'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>කණ්ඩායම් නායකයින් (Team Leaders)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Rules</span>
            </button>
          </div>
        </div>

        {/* Time-frame Sub-tabs */}
        <div className="bg-slate-900/60 px-6 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'daily'
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>📅 දෛනික රීති (Daily)</span>
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'weekly'
                ? 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>🗓️ සතිපතා රීති (Weekly)</span>
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'monthly'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span>📊 මාසික ඉලක්ක (Monthly)</span>
          </button>
          <button
            onClick={() => setActiveTab('anti_fraud')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'anti_fraud'
                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>🛡️ වංචා වැළැක්වීමේ දැඩි නීති (Anti-Fraud)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* AGENT RULES SECTION */}
          {selectedRole === 'agent' && (
            <div className="space-y-6">
              {activeTab === 'daily' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-sm">
                        ක්ෂේත්‍ර නියෝජිත (Field Agent) දෛනික රාජකාරි රීති
                      </h4>
                      <p className="text-xs text-blue-200/80 mt-0.5">
                        සෑම වැඩ කරන දිනයකම අනිවාර්යයෙන් පිළිපැදිය යුතු කාලසටහන හා ක්‍රියාපිළිවෙත:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>1. උදෑසන GPS පැමිණීම (08:00 AM - 09:00 AM)</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        තමාට නියමිත ක්ෂේත්‍ර ප්‍රදේශයට (Assigned Territory) ළඟාවී App එක ඔස්සේ සජීවී GPS Location සක්‍රිය කර Check-in විය යුතුය. Geofencing සීමාවෙන් පිටත කරන Check-in පද්ධතියෙන් ප්‍රතික්ෂේප වේ.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Target className="w-4 h-4 text-amber-400" />
                        <span>2. දෛනික අවම ඉලක්කය (Minimum 10 Activations)</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        සෑම දිනකම ගොවිමිතුරු (#616#) සහ සයුරු (#828#) සක්‍රිය කිරීම් අවම වශයෙන් 10ක් සම්පූර්ණ කළ යුතුය. පාරිභෝගිකයාගේ සෘජු අනුමැතියකින් තොරව කිසිදු අංකයක් ඇතුළත් නොකළ යුතුය.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <PhoneCall className="w-4 h-4 text-cyan-400" />
                        <span>3. සජීවී IVR ඩයල් කිරීමේ සාක්ෂිය</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        පාරිභෝගිකයා ඉදිරියේම #616# හෝ #828# අමතා ලියාපදිංචිය තහවුරු කළ යුතුය. Dialog Network වෙතින් ලැබෙන SMS සත්‍යාපනය පාරිභෝගිකයාට පැහැදිලි කර දිය යුතුය.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>4. සවස Check-out හා දෛනික වාර්තාව (05:30 PM - 06:30 PM)</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        දිනය අවසානයේ සිදුකළ සම්පූර්ණ විකුණුම් හා සක්‍රිය කිරීම් Team Leader වෙත ඉදිරිපත් කර App එකෙන් Check-out විය යුතුය.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'weekly' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-sm">
                        සතිපතා කාර්යසාධනය හා ක්ෂේත්‍ර විගණනය (Weekly Protocol)
                      </h4>
                      <p className="text-xs text-amber-200/80 mt-0.5">
                        සතිපතා ගෙවීම් හා කොමිස් සුරක්ෂිත කරගැනීම සඳහා සපුරාලිය යුතු ප්‍රමිතීන්:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">සතිපතා අවම විකුණුම් කෝටාව: Activations 60</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          සතියක සේවා කාලය තුළ අවම වශයෙන් Activations 60ක් වාර්තා විය යුතුය. සතිය අවසානයේ Team Leader විසින් අහඹු පාරිභෝගිකයින් 10 දෙනෙකුට ඇමතුම් ලබා දී සත්‍යතාව තහවුරු කරයි.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">සතිපතා ප්‍රදේශ මාරුකිරීම (Territory Rotation)</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          කලින් සතියේ ආවරණය කළ ග්‍රාම නිලධාරී වසම් වලින් වෙනත් නව වසම් වලට නියෝජිතයා ගමන් කළ යුතුය. එකම ප්‍රදේශයක නැවත නැවත ව්‍යාජ ලියාපදිංචි කිරීම් සිදුකිරීම තහනම්ය.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'monthly' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                    <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-sm">
                        මාසික ප්‍රමිතීන් සහ සේවා රඳවාගැනීම (Monthly Retention & Target)
                      </h4>
                      <p className="text-xs text-emerald-200/80 mt-0.5">
                        Dialog සමාගමේ නිල ඇගයීම් සහ ප්‍රසාද දීමනා සඳහා වලංගු මාසික නිර්ණායක:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1.5">
                      <div className="text-2xl font-black text-emerald-400">250+</div>
                      <div className="text-xs font-bold text-white">මාසික Activations</div>
                      <p className="text-[11px] text-slate-400">පූර්ණ කාලීන නියෝජිතයෙකුගේ සාමාන්‍ය ඉලක්කය</p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1.5">
                      <div className="text-2xl font-black text-cyan-400">&gt; 85%</div>
                      <div className="text-xs font-bold text-white">දින 30ක Retention අනුපාතය</div>
                      <p className="text-[11px] text-slate-400">පාරිභෝගිකයා සේවාව දිගටම පවත්වාගෙන යාමේ ප්‍රතිශතය</p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1.5">
                      <div className="text-2xl font-black text-rose-400">&lt; 8%</div>
                      <div className="text-xs font-bold text-white">Unsubscribe (Churn) සීමාව</div>
                      <p className="text-[11px] text-slate-400">විකිණූ සේවාව අක්‍රිය වීමේ උපරිම අවසරය</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'anti_fraud' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-sm">
                        ශුන්‍ය ඉවසීමේ (Zero-Tolerance) වංචා වැළැක්වීමේ නීති රීති
                      </h4>
                      <p className="text-xs text-rose-200/80 mt-0.5">
                        ආයතනයට හා Dialog Axiata සමාගමට සිදුවිය හැකි කිසිදු වංචාවක් ඉවසා වදාරනු නොලැබේ:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-900/40 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-rose-300">1. Fake GPS / Mock Location භාවිතය:</strong>
                        <p className="text-slate-400 mt-0.5">
                          ක්ෂේත්‍රයට නොගොස් නිවසේ හෝ වෙනත් තැනක සිට Fake GPS මඟින් ස්ථානය වෙනස් කර පැමිණීම වාර්තා කිරීම සපුරා තහනම්. එවැනි අවස්ථාවකදී ගිණුම ස්වයංක්‍රීයව Permanently Block කරනු ලැබේ.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-900/40 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-rose-300">2. Ghost Activations &amp; Random Dials:</strong>
                        <p className="text-slate-400 mt-0.5">
                          පාරිභෝගිකයාගේ අවසරයකින් තොරව සිතැඟි පරිදි අහඹු දුරකථන අංක ඇතුළත් කිරීම හෝ තාවකාලික සිම්පත් භාවිත කර ව්‍යාජ ලියාපදිංචි කිරීම් සිදුකිරීම නීති විරෝධී වේ. සම්පූර්ණ කොමිස් මුදල් අහෝසි කර සේවයෙන් පහ කෙරේ.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-900/40 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-rose-300">3. පාරිභෝගික දත්ත රහස්‍යභාවය (Privacy Violations):</strong>
                        <p className="text-slate-400 mt-0.5">
                          පාරිභෝගික දුරකථන අංක හෝ පෞද්ගලික විස්තර වෙනත් කිසිදු තෙවන පාර්ශවයකට ලබාදීම, විකිණීම හෝ අනිසි ලෙස භාවිත කිරීම සපුරා තහනම් වේ.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEAM LEADER RULES SECTION */}
          {selectedRole === 'team_leader' && (
            <div className="space-y-6">
              {activeTab === 'daily' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-sm">
                        කණ්ඩායම් නායක (Team Leader) දෛනික අධීක්ෂණ රීති
                      </h4>
                      <p className="text-xs text-purple-200/80 mt-0.5">
                        කණ්ඩායමේ සාමාජිකයින් කළමනාකරණය සහ වංචා මැඩපැවැත්වීමේ දෛනික වගකීම්:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>1. උදෑසන 08:30 Briefing &amp; Live Tracking</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        තම කණ්ඩායමේ සියලුම Agents ලා උදෑසන 8:30 ට පෙර තමන්ගේ සේවා ස්ථානවලට ගොස් පැමිණීම වාර්තා කර ඇත්දැයි Live Map ඔස්සේ පරීක්ෂා කළ යුතුය.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        <span>2. දිනකට අවම ක්ෂේත්‍ර චාරිකා 3ක් (Spot Checks)</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Team Leader විසින් දිනකට අවම වශයෙන් Agents ලා 3 දෙනෙකුගේ භෞතික ස්ථාන වෙත ගොස් සජීවීව පරීක්ෂා කළ යුතුය (Physical Spot Verification).
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-rose-400" />
                        <span>3. පාරිභෝගික දුරකථන අංක රහස්‍යතා රීතිය</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Team Leader විසින් කිසිදු ආකාරයකින් පාරිභෝගිකයින්ගේ දුරකථන අංක බාගත කිරීම, අතින් ලියාගැනීම හෝ නියෝජිතයින්ගෙන් ඉල්ලා සිටීම නොකළ යුතුය.
                      </p>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Target className="w-4 h-4 text-amber-400" />
                        <span>4. දෛනික සවස සමාලෝචනය (Daily Debrief)</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        සෑම දිනකම සවස 06:00 ට පෙර තම කණ්ඩායමේ මුළු විකුණුම් සංඛ්‍යාව සහ අසාමාන්‍ය ලෙස ඉහළ හෝ පහළ අගයන් පිළිබඳව Owner වෙත වාර්තා කළ යුතුය.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'weekly' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-sm">
                        කණ්ඩායම් නායක සතිපතා ප්‍රමිතීන් (Team Target & Audit)
                      </h4>
                      <p className="text-xs text-amber-200/80 mt-0.5">
                        කණ්ඩායමේ සමස්ත සතිපතා ප්‍රතිඵල සහ විගණන කාර්යයන්:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                        <Target className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">කණ්ඩායමේ සතිපතා අවම ඉලක්කය: 250 - 300 Activations</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          සාමාජිකයින් 5-6 දෙනෙකුගෙන් යුත් කණ්ඩායමක් සතියකට අවම Activations 250ක් වාර්තා කළ යුතුය. අඛණ්ඩව සති දෙකක් ඉලක්ක සම්පූර්ණ නොකරන සාමාජිකයින් පිළිබඳව කළමනාකාරිත්වයට දැනුම් දිය යුතුය.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">අහඹු සත්‍යාපන විගණනය (Random 20 Verification Calls)</h5>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          තම කණ්ඩායමේ වාර්තා වූ විකුණුම් වලින් අහඹු ලෙස තෝරාගත් පාරිභෝගිකයින් 20 දෙනෙකුගේ ලියාපදිංචි වලංගුභාවය පරීක්ෂා කිරීම සඳහා Owner ගේ අධීක්ෂණය යටතේ විගණනයක් සිදුකළ යුතුය.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'monthly' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                    <Award className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-sm">
                        කණ්ඩායම් නායක මාසික ඉලක්ක සහ කණ්ඩායම් ප්‍රවර්ධනය
                      </h4>
                      <p className="text-xs text-emerald-200/80 mt-0.5">
                        කළමනාකාරිත්වය විසින් ලබාදෙන මාසික ප්‍රසාද දීමනා සඳහා නිර්ණායක:
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1.5">
                      <div className="text-2xl font-black text-purple-400">1,200+</div>
                      <div className="text-xs font-bold text-white">කණ්ඩායමේ මාසික Activations</div>
                      <p className="text-[11px] text-slate-400">සම්පූර්ණ කණ්ඩායමේ සාමූහික මාසික ප්‍රතිඵලය</p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1.5">
                      <div className="text-2xl font-black text-emerald-400">&gt; 88%</div>
                      <div className="text-xs font-bold text-white">කණ්ඩායමේ Retention අනුපාතය</div>
                      <p className="text-[11px] text-slate-400">පාරිභෝගික සේවා රඳවාගැනීමේ ප්‍රමිතිය</p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1.5">
                      <div className="text-2xl font-black text-amber-400">100%</div>
                      <div className="text-xs font-bold text-white">KYC &amp; Police Verification</div>
                      <p className="text-[11px] text-slate-400">තම කණ්ඩායමේ සියලුම සාමාජිකයින්ගේ ලේඛන සත්‍යාපනය</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'anti_fraud' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-black text-white text-sm">
                        කණ්ඩායම් නායක සෘජු වගකීම් සහ වංචා වැළැක්වීමේ විනය සංග්‍රහය
                      </h4>
                      <p className="text-xs text-rose-200/80 mt-0.5">
                        තම කණ්ඩායම තුළ සිදුවන ඕනෑම වංචාවකට කණ්ඩායම් නායකයා සෘජුව වගකිව යුතුය:
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-900/40 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-rose-300">1. වංචා සහගත ලියාපදිංචි වසන් කිරීම (Collusion):</strong>
                        <p className="text-slate-400 mt-0.5">
                          තම නියෝජිතයෙකු ව්‍යාජ GPS හෝ ව්‍යාජ අංක ඇතුළත් කරන බව දැන දැනත් එය වසන් කිරීම හෝ අනුබල දීම සිදුකළ හොත් Team Leader ගේ තනතුර අහෝසි කර නීතිමය පියවර ගනු ලැබේ.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-900/40 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <strong className="text-rose-300">2. භෞමික සීමාවන් උල්ලංඝනය (Territory Infringement):</strong>
                        <p className="text-slate-400 mt-0.5">
                          අනෙක් කණ්ඩායම් වලට වෙන්කර ඇති ප්‍රදේශ වලට තම කණ්ඩායමේ සාමාජිකයින් යැවීම හෝ අනවසරයෙන් විකුණුම් සිදුකිරීම විනය විරෝධී වේ.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Digital Signature & Agreement Footer */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${
              hasAgreed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>විනය කොන්දේසි හා නිල රීති එකඟතාවය</span>
                {hasAgreed && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Signed &amp; Agreed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {hasAgreed && agreedTimestamp
                  ? `තහවුරු කළ දිනය සහ වේලාව: ${agreedTimestamp}`
                  : 'මෙම සියලුම රාජකාරි රීති කියවා එකඟතාවය පළ කිරීම අනිවාර්ය වේ.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {!hasAgreed ? (
              <button
                onClick={handleAgree}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>මම කියවා එකඟ වෙමි (I Accept &amp; Agree)</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#E1141E] hover:bg-red-600 text-white text-xs font-black shadow-lg shadow-red-600/30 transition"
              >
                තහවුරු කර අවසන් කරන්න
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
