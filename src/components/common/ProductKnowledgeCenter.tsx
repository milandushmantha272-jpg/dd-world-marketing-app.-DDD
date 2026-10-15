import React, { useState } from 'react';
import {
  BookOpen,
  Award,
  CheckCircle2,
  Play,
  FileText,
  HelpCircle,
  Sparkles,
  Smartphone,
  Phone,
  ShieldCheck,
  Video,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Star,
  AlertCircle,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const PRODUCT_QUIZZES: Record<string, QuizQuestion[]> = {
  sayuru_ivr: [
    {
      id: 1,
      question: 'සයුරු (#828#) IVR සේවාව සක්‍රීය කිරීමට පාරිභෝගිකයා ඩයල් කළ යුතු අංකය කුමක්ද?',
      options: ['#616#', '#828#', '#111#', '#777#'],
      correctAnswer: 1,
      explanation: 'සයුරු සේවාව Dialog ජාලය ඔස්සේ #828# ඩයල් කිරීමෙන් හෝ 828 අමතා සක්‍රීය කරගත හැක.'
    },
    {
      id: 2,
      question: 'සයුරු සේවාවේ දෛනික ගාස්තුව කොපමණද?',
      options: ['රු. 1.00 + බදු', 'රු. 2.00 + බදු', 'රු. 5.00 + බදු', 'නොමිලේ'],
      correctAnswer: 1,
      explanation: 'සයුරු දෛනික ගාස්තුව රු. 2.00 + රජයේ අදාළ බදු වේ.'
    },
    {
      id: 3,
      question: 'සයුරු සේවාවෙන් ධීවරයින්ට ලැබෙන ප්‍රධානම වාසිය කුමක්ද?',
      options: ['කෘෂිකාර්මික උපදෙස්', 'මුහුදු කාලගුණ සහ හදිසි රළ/සුළං අනතුරු ඇඟවීම්', 'නොමිලේ අමතන්න', 'ක්‍රිකට් ලකුණු'],
      correctAnswer: 1,
      explanation: 'දිනපතා උදෑසන හා සවස මුහුදේ සුළං වේගය, රළ තත්ත්වය හා කාලගුණ අනතුරු ඇඟවීම් හඬ පණිවිඩ මඟින් ලැබේ.'
    }
  ],
  sayuru_app: [
    {
      id: 1,
      question: 'Sayuru Mobile App එක භාවිතා කළ හැක්කේ කා හටද?',
      options: ['ගොවීන්ට පමණි', 'ධීවරයින්ට හා මුහුදු යන සංචාරකයින්ට', 'ගුරුවරුන්ට පමණි', 'කිසිවෙකුටත් නොහැක'],
      correctAnswer: 1,
      explanation: 'ධීවර ප්‍රජාවට සහ මුහුදු සීමාවේ කාලගුණය දැනගැනීමට අවශ්‍ය සියලු දෙනාට Sayuru App එක යොදාගත හැක.'
    },
    {
      id: 2,
      question: 'Sayuru App එකේ GPS සිතියම් සේවාව මඟින් ලැබෙන ප්‍රයෝජනය කුමක්ද?',
      options: ['ධීවර කලාප හා කාලගුණ අනතුරු ඇඟවීම් සිතියමේ පෙන්වීම', 'සංගීතයට සවන්දීම', 'ක්‍රීඩා කිරීම', 'භාණ්ඩ මිලදී ගැනීම'],
      correctAnswer: 0,
      explanation: 'මුහුදු සීමාවේ ආරක්ෂිත කලාප, සුළං වේගයන් සහ GPS සිතියම මත ස්ථානය පෙන්වීම සිදු කරයි.'
    }
  ],
  govimithuru_ivr: [
    {
      id: 1,
      question: 'ගොවිමිතුරු (#616#) සේවාව සක්‍රීය කරන්නේ කෙසේද?',
      options: ['#616# ඩයල් කිරීමෙන්', '#828# ඩයල් කිරීමෙන්', '119 අමතා', '#123# ඩයල් කර'],
      correctAnswer: 0,
      explanation: 'ඕනෑම Dialog සිම් පතකින් #616# ඩයල් කර තමන්ගේ බෝගය තෝරා සක්‍රීය කරගත හැක.'
    },
    {
      id: 2,
      question: 'ගොවිමිතුරු සේවාව මඟින් ලබාගත හැකි බෝග වර්ග ගණන කොපමණද?',
      options: ['5 ක් පමණි', '10 ක් පමණි', 'බෝග 30 කට අධික ප්‍රමාණයක්', 'බෝගයක්වත් නැත'],
      correctAnswer: 2,
      explanation: 'වී, බඩඉරිඟු, තේ, කුරුඳු, එළවළු හා පලතුරු ඇතුළු බෝග 30+ සඳහා තාක්ෂණික උපදෙස් ලැබේ.'
    },
    {
      id: 3,
      question: 'ගොවිමිතුරු සේවාවේ දෛනික ගාස්තුව කොපමණද?',
      options: ['රු. 1.00', 'රු. 2.00 + බදු', 'රු. 10.00', 'රු. 50.00'],
      correctAnswer: 1,
      explanation: 'දිනකට රු. 2.00 + බදු පමණක් අය වේ.'
    }
  ],
  govimithuru_app: [
    {
      id: 1,
      question: 'Govi Mithuru Mobile App එක මඟින් ගොවීන්ට ලැබෙන සුවිශේෂී පහසුකම කුමක්ද?',
      options: ['බෝග රෝග ඡායාරූප මඟින් හඳුනා ගැනීම හා පොහොර මාත්‍රා ගණනය', 'වීඩියෝ ගේම්ස්', 'සංගීත ප්‍රසංග', 'ටැක්සි ගාස්තු'],
      correctAnswer: 0,
      explanation: 'Govi Mithuru App එක මඟින් රෝග හඳුනා ගැනීම, කාලගුණ අනාවැකි හා පොහොර ගණනය කළ හැක.'
    }
  ]
};

export const ProductKnowledgeCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, trainingProgress, quizResults, addTrainingProgress, recordQuizResult } = useData();

  const [activeProd, setActiveProd] = useState<'govimithuru_ivr' | 'govimithuru_app' | 'sayuru_ivr' | 'sayuru_app'>('govimithuru_ivr');
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'quiz' | 'progress'>('content');

  // Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Quiz State
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const isOwnerOrTL = currentUser?.role === 'owner' || currentUser?.role === 'team_leader';

  const myProgress = trainingProgress.filter(p => p.employeeId === currentUser?.id);
  const myQuizzes = quizResults.filter(q => q.employeeId === currentUser?.id);

  const isLessonCompleted = (lessonId: string) => {
    return myProgress.some(p => p.productCode === activeProd && p.lessonId === lessonId && p.completionStatus === 'completed');
  };

  const handleMarkCompleted = (lessonId: string) => {
    if (!currentUser) return;
    addTrainingProgress({
      employeeId: currentUser.id,
      agentCode: currentUser.agentCode || 'AG',
      agentName: currentUser.name,
      courseId: `course_${activeProd}`,
      lessonId,
      productCode: activeProd,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      completionStatus: 'completed'
    });
  };

  const handleQuizOptionSelect = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    const questions = PRODUCT_QUIZZES[activeProd] || [];
    let correct = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / questions.length) * 100);
    const passFail = scorePct >= 60 ? 'pass' : 'fail';
    setQuizScore(scorePct);
    setQuizSubmitted(true);

    if (currentUser) {
      const prevAttempts = myQuizzes.filter(q => q.productCode === activeProd).length;
      recordQuizResult({
        employeeId: currentUser.id,
        agentCode: currentUser.agentCode || 'AG',
        agentName: currentUser.name,
        productCode: activeProd,
        score: scorePct,
        totalQuestions: questions.length,
        attempts: prevAttempts + 1,
        passFail,
        completedAt: new Date().toISOString()
      });
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-purple-900/60 border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black uppercase tracking-wider">
              📚 OFFICIAL PRODUCT KNOWLEDGE &amp; TRAINING CENTER
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              ගොවිමිතුරු (#616#) සහ සයුරු (#828#) නිෂ්පාදන අධ්‍යාපනික හා විකුණුම් මධ්‍යස්ථානය
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              DD WORLD නිලධාරීන්ගේ නිෂ්පාදන දැනුම ඉහළ නැංවීම, පාරිභෝගික සේවාවන් පැහැදිලි කිරීම, විකුණුම් තාක්ෂණයන් ඉගෙනීම සහ මාර්ගගත ඇගයීම් පරීක්ෂණ (Quizzes).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSubTab('content')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'content'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-cyan-300" /> පාඩම් සහ දැනුම
            </button>
            <button
              onClick={() => setActiveSubTab('quiz')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeSubTab === 'quiz'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 font-black'
                  : 'bg-slate-900/80 text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" /> දැනුම මැනීමේ Quiz
            </button>
            {isOwnerOrTL && (
              <button
                onClick={() => setActiveSubTab('progress')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeSubTab === 'progress'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-black'
                    : 'bg-slate-900/80 text-purple-300 hover:bg-slate-800'
                }`}
              >
                <BarChart2 className="w-4 h-4 text-purple-300" /> Staff Progress Monitor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => { setActiveProd('govimithuru_ivr'); handleResetQuiz(); }}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
            activeProd === 'govimithuru_ivr'
              ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              IVR #616#
            </span>
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-black text-emerald-200">ගොවිමිතුරු (#616#) IVR</h3>
          <p className="text-[11px] text-slate-400">කෘෂිකාර්මික හඬ පණිවිඩ සේවාව</p>
        </button>

        <button
          onClick={() => { setActiveProd('govimithuru_app'); handleResetQuiz(); }}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
            activeProd === 'govimithuru_app'
              ? 'bg-teal-950/60 border-teal-500 text-white shadow-lg shadow-teal-500/20'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              MOBILE APP
            </span>
            <Smartphone className="w-4 h-4 text-teal-400" />
          </div>
          <h3 className="text-sm font-black text-teal-200">ගොවිමිතුරු Mobile App</h3>
          <p className="text-[11px] text-slate-400">ස්මාර්ට් කෘෂි ඇප්ලිකේෂනය</p>
        </button>

        <button
          onClick={() => { setActiveProd('sayuru_ivr'); handleResetQuiz(); }}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
            activeProd === 'sayuru_ivr'
              ? 'bg-blue-950/60 border-blue-500 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              IVR #828#
            </span>
            <Phone className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-black text-blue-200">සයුරු (#828#) IVR</h3>
          <p className="text-[11px] text-slate-400">ධීවර කාලගුණ හා ආරක්ෂිත සේවාව</p>
        </button>

        <button
          onClick={() => { setActiveProd('sayuru_app'); handleResetQuiz(); }}
          className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
            activeProd === 'sayuru_app'
              ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              MOBILE APP
            </span>
            <Smartphone className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="text-sm font-black text-cyan-200">සයුරු Mobile App</h3>
          <p className="text-[11px] text-slate-400">මුහුදු කාලගුණ සහ GPS සිතියම</p>
        </button>
      </div>

      {/* SUB TAB 1: CONTENT & LESSONS */}
      {activeSubTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  {activeProd === 'govimithuru_ivr' && '🌾 ගොවිමිතුරු (#616#) IVR - සේවා විස්තරය & ප්‍රයෝජන'}
                  {activeProd === 'govimithuru_app' && '📱 ගොවිමිතුරු Mobile App - ස්මාර්ට් කෘෂි ඇප්ලිකේෂනය'}
                  {activeProd === 'sayuru_ivr' && '🌊 සයුරු (#828#) IVR - ධීවර කාලගුණ හා ජීවිතාරක්ෂක සේවාව'}
                  {activeProd === 'sayuru_app' && '⚓ සයුරු Mobile App - GPS කාලගුණ සිතියම'}
                </h3>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                  දෛනික ගාස්තුව: රු. 2.00 + බදු
                </span>
              </div>

              {/* Product Detailed Content based on activeProd */}
              {activeProd === 'govimithuru_ivr' && (
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-emerald-300 text-sm">1. සේවා හැඳින්වීම (Product Description)</h4>
                    <p className="leading-relaxed text-slate-300">
                      ගොවිමිතුරු (#616#) යනු ශ්‍රී ලංකා කෘෂිකර්ම දෙපාර්තමේන්තුව සහ Dialog Axiata එක්ව ක්‍රියාත්මක කරන දිවයිනේ විශාලතම ඩිජිටල් කෘෂිකාර්මික උපදේශන සේවාවයි. වී, බඩඉරිඟු, තේ, කුරුඳු, එළවළු සහ පලතුරු ඇතුළු බෝග 30කට අධික ප්‍රමාණයකට අදාළ බෝග වගාව, පොහොර යෙදීම, කෘමි හා රෝග පාලනය සහ අස්වනු නෙලීම දක්වා උපදෙස් හඬ පණිවිඩ (Voice Messages) හා SMS මඟින් ලබාදේ.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-amber-300 text-sm">2. පාරිභෝගිකයාට ලැබෙන ප්‍රතිලාභ (Customer Benefits)</h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>කෘෂිකර්ම දෙපාර්තමේන්තුවේ සහතික ලත් විශේෂඥ උපදෙස් ලබාගැනීම.</li>
                      <li>පොහොර සහ කෘෂි රසායන අනවශ්‍ය ලෙස යෙදීම වැළකී වියදම් 30% කින් අඩුවීම.</li>
                      <li>කාලගුණික වෙනස්වීම් හා වසංගත රෝග තත්ත්වයන් කල්තියා දැනගැනීම.</li>
                      <li>දිනකට රුපියල් 2ක් වැනි අවම මුදලකට සේවාව ලබාගත හැකිවීම.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-cyan-300 text-sm">3. සක්‍රීය කිරීමේ පටිපාටිය (Activation Procedure)</h4>
                    <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-200 font-mono text-[11px] space-y-1">
                      <p><strong>පියවර 1:</strong> Dialog දුරකථනයෙන් <strong>#616#</strong> ඩයල් කරන්න.</p>
                      <p><strong>පියවර 2:</strong> කැමති භාෂාව තෝරන්න (සිංහල / දෙමළ).</p>
                      <p><strong>පියවර 3:</strong> තමන් වගා කරන බෝගය තෝරා ලියාපදිංචි වන්න.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-purple-300 text-sm">4. විකුණුම්කරුගේ මඟපෙන්වීම (Sales Pitching Guide)</h4>
                    <p className="leading-relaxed">
                      ගොවි මහතා හමුවූ විට සෘජුවම ඔහුගේ දුරකථනයෙන් #616# ඩයල් කර පෙන්වන්න. "අයියා, දිනකට රුපියල් 2යි යන්නේ. තේ කෝප්පයක මිලෙන් මුළු මාසයක්ම වගාව ආරක්ෂා කරගන්න පුළුවන්" යනුවෙන් පැහැදිලි කරන්න.
                    </p>
                  </div>
                </div>
              )}

              {activeProd === 'govimithuru_app' && (
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-teal-300 text-sm">1. ඇප්ලිකේෂන් විස්තරය (App Features)</h4>
                    <p className="leading-relaxed">
                      Govi Mithuru Mobile App එක මඟින් ගොවීන්ට තමන්ගේ වගාවේ කොළවල රෝග ඡායාරූප ගත කර AI තාක්ෂණයෙන් සහ කෘෂි නිලධාරීන්ගෙන් හඳුනාගත හැක. එසේම ප්‍රදේශයට අදාළ දෛනික කාලගුණ අනාවැකිය හා පොහොර ගණක යන්ත්‍රය (Fertilizer Calculator) ඇතුළත් වේ.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-amber-300 text-sm">2. බාගත කරගැනීම (Download &amp; Activation)</h4>
                    <p className="leading-relaxed">
                      Google Play Store වෙත ගොස් "Govi Mithuru" ලෙස සෙවුම් කර Download කරගන්න. Dialog දුරකථන අංකය ඇතුළත් කර OTP එක මඟින් සක්‍රීය කරගත හැක.
                    </p>
                  </div>
                </div>
              )}

              {activeProd === 'sayuru_ivr' && (
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-blue-300 text-sm">1. සයුරු (#828#) සේවා විස්තරය</h4>
                    <p className="leading-relaxed">
                      සයුරු (#828#) යනු ශ්‍රී ලාංකික ධීවර ප්‍රජාව මුහුදේදී මුහුණදෙන කාලගුණික අනතුරු හා රළ තත්ත්වයන් පිළිබඳ තොරතුරු දිනපතා උදෑසන හා සවස හඬ පණිවිඩ සහ SMS මඟින් සපයන එකම ජීවිතාරක්ෂක සේවාවයි.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-amber-300 text-sm">2. සක්‍රීය කිරීමට (Activation)</h4>
                    <p className="font-mono text-cyan-300">#828# ඩයල් කර ධීවර කලාපය (උදා: බස්නාහිර, දකුණ, නැගෙනහිර) තෝරා ගන්න.</p>
                  </div>
                </div>
              )}

              {activeProd === 'sayuru_app' && (
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-cyan-300 text-sm">1. සයුරු Mobile App සහ GPS සිතියම</h4>
                    <p className="leading-relaxed">
                      මුහුදු සීමාවේදී GPS සිතියම මත තමන් සිටින ස්ථානය සහ මුහුදේ සුළං වේගය, රළ මට්ටම සහ කාලගුණ නිවේදන සජීවීව නැරඹීමට මෙම ඇප් එක උපකාරී වේ.
                    </p>
                  </div>
                </div>
              )}

              {/* Lesson Completion Action Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  {isLessonCompleted(`lesson_main_${activeProd}`) ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" /> මෙම පාඩම සම්පූර්ණ කර ඇත
                    </span>
                  ) : (
                    <span className="text-slate-400">මෙම පාඩම අධ්‍යයනය කර ඇත්නම් සම්පූර්ණ කළ ලෙස ලකුණු කරන්න:</span>
                  )}
                </div>
                {!isLessonCompleted(`lesson_main_${activeProd}`) && (
                  <button
                    onClick={() => handleMarkCompleted(`lesson_main_${activeProd}`)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/30 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> පාඩම සම්පූර්ණ කළ බව සටහන් කරන්න
                  </button>
                )}
              </div>
            </div>

            {/* FAQ Accordion Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" /> නිතර අසන ප්‍රශ්න සහ පිළිතුරු (FAQ)
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  {
                    q: 'විකුණුම්කරු ලෙස පාරිභෝගිකයාගේ අකමැත්ත (Objection) ජයගන්නේ කෙසේද?',
                    a: 'පාරිභෝගිකයා "මුදල් කැපෙනවා" යැයි පැවසුවහොත්, දිනකට වැයවන්නේ රු. 2ක් බවත්, ඉන් ලැබෙන වාසිය රුපියල් දහස් ගණනක් බවත් සන්සුන්ව පැහැදිලි කරන්න.'
                  },
                  {
                    q: 'සමාගමේ Dialog නිල ගාස්තු වෙනස් කළ හැකිද?',
                    a: 'නැත. සියලුම ගාස්තු Dialog Axiata ආයතනයේ නිල මිල ගණන් වන අතර දෛනිකව රු. 2.00 + බදු අය වේ.'
                  },
                  {
                    q: 'නොමිලේ අත්හදා බැලීමේ කාලසීමාවක් තිබේද?',
                    a: 'ලියාපදිංචි වන පළමු දින 3 නොමිලේ අත්හදා බැලීමේ කාලසීමාවක් ලෙස ලබාදේ.'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="border border-slate-800 rounded-2xl bg-slate-950 overflow-hidden">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      className="w-full p-3.5 text-left font-bold text-slate-200 flex items-center justify-between hover:bg-slate-900 transition"
                    >
                      <span>{item.q}</span>
                      {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {openFaqIndex === idx && (
                      <div className="p-3.5 border-t border-slate-800/80 text-slate-300 leading-relaxed bg-slate-900/50">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Training Resources, Videos & Images */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-400" /> පුහුණු වීඩියෝ සහ උපදෙස්
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Play className="w-4 h-4 text-rose-400 fill-rose-400" /> #616# ගොවිමිතුරු සක්‍රීය කරන වීඩියෝව
                  </div>
                  <p className="text-[11px] text-slate-400">පාරිභෝගිකයා ඉදිරියේ විනාඩි 1න් සක්‍රීය කරන ආකාරය.</p>
                  <a
                    href="https://www.youtube.com/watch?v=sample1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 font-bold hover:underline"
                  >
                    නරඹන්න (Watch Video)
                  </a>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Play className="w-4 h-4 text-rose-400 fill-rose-400" /> #828# සයුරු ධීවර සේවා නිරූපණය
                  </div>
                  <p className="text-[11px] text-slate-400">ධීවරයන්ට සයුරු සේවාව විකුණන ආකාරය.</p>
                  <a
                    href="https://www.youtube.com/watch?v=sample2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] text-cyan-400 font-bold hover:underline"
                  >
                    නරඹන්න (Watch Video)
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> අත්පත්‍රිකා &amp; PDF ලේඛන
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white">DD WORLD Product Leaflet (PDF)</h4>
                    <p className="text-[10px] text-slate-400">1.2 MB • Sinhala Edition</p>
                  </div>
                  <button className="p-2 rounded-xl bg-slate-800 text-cyan-400 hover:bg-slate-700">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: KNOWLEDGE QUIZ */}
      {activeSubTab === 'quiz' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRODUCT KNOWLEDGE QUIZ
              </span>
              <h3 className="text-lg font-black text-white mt-1">
                {activeProd === 'govimithuru_ivr' && 'ගොවිමිතුරු (#616#) IVR - දැනුම මැනීමේ පරීක්ෂණය'}
                {activeProd === 'govimithuru_app' && 'ගොවිමිතුරු App - දැනුම මැනීමේ පරීක්ෂණය'}
                {activeProd === 'sayuru_ivr' && 'සයුරු (#828#) IVR - දැනුම මැනීමේ පරීක්ෂණය'}
                {activeProd === 'sayuru_app' && 'සයුරු App - දැනුම මැනීමේ පරීක්ෂණය'}
              </h3>
            </div>
            {quizSubmitted && (
              <div className="flex items-center gap-3">
                <span className={`text-sm font-black px-4 py-1.5 rounded-xl border ${
                  (quizScore || 0) >= 60 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  ලකුණු: {quizScore}% ({ (quizScore || 0) >= 60 ? 'සමත් (PASSED) 🎉' : 'අසමත් (TRY AGAIN) ❌' })
                </span>
                <button
                  onClick={handleResetQuiz}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
                >
                  නැවත උත්සාහ කරන්න
                </button>
              </div>
            )}
          </div>

          {/* Questions list */}
          <div className="space-y-6">
            {(PRODUCT_QUIZZES[activeProd] || []).map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm">
                  {idx + 1}. {q.question}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = userAnswers[q.id] === oIdx;
                    const isCorrect = q.correctAnswer === oIdx;
                    let optStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

                    if (quizSubmitted) {
                      if (isCorrect) {
                        optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                      } else if (isSelected && !isCorrect) {
                        optStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold';
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={quizSubmitted}
                        onClick={() => handleQuizOptionSelect(q.id, oIdx)}
                        className={`p-3 rounded-xl border text-left transition ${optStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                    💡 <strong>විස්තරය:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}

            {!quizSubmitted && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(userAnswers).length < (PRODUCT_QUIZZES[activeProd] || []).length}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/30"
                >
                  පිළිතුරු පරීක්ෂා කර ලකුණු ලබාගන්න
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 3: STAFF TRAINING PROGRESS MONITOR (Owner/TL Only) */}
      {activeSubTab === 'progress' && isOwnerOrTL && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" /> කාර්ය මණ්ඩල පුහුණු හා Quiz ප්‍රගති වාර්තාව (Staff Training Monitor)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold bg-slate-950">
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Agent Code</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Completed Lessons</th>
                  <th className="p-3">Quiz Score</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.filter(u => u.role === 'agent').map(ag => {
                  const agProgress = trainingProgress.filter(p => p.employeeId === ag.id);
                  const agQuizzes = quizResults.filter(q => q.employeeId === ag.id);
                  const latestQuiz = agQuizzes[agQuizzes.length - 1];

                  return (
                    <tr key={ag.id} className="hover:bg-slate-950/50">
                      <td className="p-3 font-bold text-white">{ag.name}</td>
                      <td className="p-3 font-mono text-cyan-300">{ag.agentCode || 'AG'}</td>
                      <td className="p-3 text-slate-300 uppercase">{activeProd.replace('_', ' ')}</td>
                      <td className="p-3 font-bold text-emerald-400">{agProgress.length} Lessons</td>
                      <td className="p-3 font-bold text-amber-300">
                        {latestQuiz ? `${latestQuiz.score}% (${latestQuiz.passFail})` : 'තවම මුහුණ දී නැත'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          latestQuiz?.passFail === 'pass' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {latestQuiz?.passFail === 'pass' ? 'PASSED ✅' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
