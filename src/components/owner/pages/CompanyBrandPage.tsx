import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Award,
  MapPin,
  Phone,
  Mail,
  Globe,
  BadgeCheck,
  Building,
  Maximize2,
  X,
  FileText,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const CompanyBrandPage: React.FC = () => {
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [activeBrandTab, setActiveBrandTab] = useState<'profile' | 'pillars' | 'documents'>('profile');

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Page Sub-Navigation Bar */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveBrandTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeBrandTab === 'profile'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-500" />
            1. ආයතනයේ Logo &amp; ප්‍රධාන විස්තරය (Company Profile)
          </button>

          <button
            onClick={() => setActiveBrandTab('pillars')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeBrandTab === 'pillars'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-cyan-400" />
            2. ප්‍රධාන ව්‍යාපෘති 01/02/03 (National Pillars)
          </button>

          <button
            onClick={() => setActiveBrandTab('documents')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap ${
              activeBrandTab === 'documents'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-300" />
            3. ලියාපදිංචි සහතික &amp; Brand Assets
          </button>
        </div>
      </div>

      {/* VIEW 1: STRICTLY BRAND LOGO & COMPANY DESCRIPTION */}
      {activeBrandTab === 'profile' && (
        <div className="space-y-6">
          {/* Main Executive Corporate Card */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
              {/* Official DD WORLD High-Res Emblem Logo */}
              <div
                className="relative group cursor-pointer"
                onClick={() => setLogoModalOpen(true)}
                title="Click to expand high-res corporate logo"
              >
                <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-white p-3 shadow-2xl shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-105 flex items-center justify-center border-2 border-emerald-500/40">
                  <img
                    src="/official-logo.png"
                    alt="Official DD WORLD MARKETING Corporate Logo"
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>

                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-lg border border-emerald-300">
                  <BadgeCheck className="w-4 h-4" />
                  VERIFIED OFFICIAL LOGO
                </div>
              </div>

              {/* Company Title & Badge */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    Official Corporate Enterprise
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold">
                    Reg No: PV 00284910
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  DD WORLD MARKETING
                </h1>
                <p className="text-base sm:text-lg font-bold text-emerald-400">
                  ශ්‍රී ලංකාවේ ප්‍රමුඛතම ක්ෂේත්‍ර අලෙවි සහ ඩිජිටල් සන්නිවේදන සේවා ජාලය
                </p>
              </div>

              {/* Official Corporate Description Paragraph */}
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-sm text-slate-300 leading-relaxed text-justify space-y-3">
                <p className="font-semibold text-emerald-300">
                  DD World Marketing exclusively executes the direct field sales, enrollment, and promotion operations for Dialog Axiata PLC's 'Sayura' and 'Govi Mithuru' platforms.
                </p>
                <p>
                  <strong>DD World Marketing</strong> යනු ශ්‍රී ලංකා ප්‍රජාතාන්ත්‍රික සමාජවාදී ජනරජයේ සමාගම් මැදුරේ නිල වශයෙන් ලියාපදිංචි (PV 00284910) ප්‍රමුඛතම ආයතනයකි. Dialog Axiata PLC හි නිල බලයලත් ක්ෂේත්‍ර මෙහෙයුම් සහකරුවෙකු (Official Authorized Enterprise Partner) ලෙස, දිවයින පුරා දිස්ත්‍රික්ක 25 ම ආවරණය වන පරිදි <strong>ගොවිමිතුරු (#616#)</strong> සහ <strong>සයුරු (#828#)</strong> IVR සහ App සේවාවන් ජනතාව වෙත සැපයීම සහ සක්‍රිය කිරීම අපගේ ප්‍රධාන වගකීම වේ.
                </p>
                <p>
                  ආයතනයේ ප්‍රධාන විධායක සහ කළමනාකාරීත්වයේ මගපෙන්වීම යටතේ, පුහුණුකළ දිස්ත්‍රික් කණ්ඩායම් නායකයින් (Team Leaders) සහ ක්ෂේත්‍ර නියෝජිතයින් (Field Agents) සියගණනකගෙන් සමන්විත දැවැන්ත මෙහෙයුම් බලකායක් මගින් දිවයින පුරා පාරිභෝගික ජාලය සවිමත් කරමින් විශිෂ්ට සේවාවක් පවත්වාගෙන යනු ලබයි.
                </p>
              </div>

              {/* Corporate Contact Specs Row */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-left">
                  <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Registered Address</div>
                    <div className="text-slate-200 font-semibold">44/c, Galabodawatha, Niungama, Piliyandala</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-left">
                  <Phone className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Official Hotline</div>
                    <div className="text-slate-200 font-semibold font-mono">0767046094</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-left">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Corporate Email</div>
                    <div className="text-slate-200 font-semibold truncate font-mono">d.d.worldmarketing1234@gmail.com</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-left">
                  <Globe className="w-5 h-5 text-purple-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Official Web Portal</div>
                    <div className="text-slate-200 font-semibold">www.ddworld.lk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PILLARS 01, 02, 03 */}
      {activeBrandTab === 'pillars' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Pillar 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-black text-lg">
                01
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                National Service
              </span>
            </div>
            <h3 className="text-lg font-black text-white">ගොවිමිතුරු (#616#) &amp; සයුරු (#828#)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              දිවයින පුරා ගොවි සහ ධීවර ජනතාව වෙත Dialog Axiata හරහා ක්ෂණික තොරතුරු සහ උපදේශන සේවා සැපයීමේ නිල ව්‍යාපෘතිය.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-blue-400 border-t border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>Active National Distribution</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-black text-lg">
                02
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                Mobile Applications
              </span>
            </div>
            <h3 className="text-lg font-black text-white">Govimithuru &amp; Sayuru App Services</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              දිස්ත්‍රික්ක 25 ම ආවරණය වන පරිදි ඩිජිටල් ඇප්ලිකේෂන් ස්ථාපනය සහ භාවිතය ප්‍රවර්ධනය කිරීම.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-purple-400 border-t border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>25 Districts Operational</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-black text-lg">
                03
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                Field Operations
              </span>
            </div>
            <h3 className="text-lg font-black text-white">Corporate Field Force</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              දිවයින පුරා පැතිරුණු Team Leaders සහ Field Agents සියගණනකින් සමන්විත, පුහුණුකළ ක්ෂේත්‍ර මෙහෙයුම් බලකාය.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-400 border-t border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Dedicated Enterprise Staff</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DOCUMENTS & BRAND ASSETS */}
      {activeBrandTab === 'documents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                ආයතනික ලියාපදිංචි සහතික සහ Brand Assets (Official Company Assets)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                DD World Security (Pvt) Ltd හි නිල ලියාපදිංචි ලේඛන සහ සන්නාම නිවේදන.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300">BR Certificate</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-black text-white">Form 1 Company Reg</div>
              <p className="text-[10px] text-slate-400">PV 00284910 - Registrar of Companies</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">Dialog Partner Agreement</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-sm font-black text-white">Enterprise Distribution</div>
              <p className="text-[10px] text-slate-400">Dialog Axiata Corporate Sales</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">Dialog Field Operations</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-sm font-black text-white">Direct Field Enrollment</div>
              <p className="text-[10px] text-slate-400">Sayura (#828#) &amp; Govi Mithuru (#616#)</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 transition space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">Official Logo Vector</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-sm font-black text-white">High-Res Brand Package</div>
              <p className="text-[10px] text-slate-400">SVG, PNG, ID Badge Formats</p>
            </div>
          </div>
        </div>
      )}

      {/* High-Res Logo Modal Preview */}
      {logoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full relative space-y-6 shadow-2xl text-center">
            <button
              onClick={() => setLogoModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-56 h-56 mx-auto rounded-3xl bg-white p-4 shadow-2xl flex items-center justify-center border-2 border-emerald-500/40">
              <img
                src="/official-logo.png"
                alt="DD WORLD MARKETING High-Res Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">DD WORLD MARKETING (PVT) LTD</h3>
              <p className="text-xs text-emerald-400 font-bold mt-1">Official Corporate Brand Emblem • Verified &amp; Registered</p>
              <p className="text-[11px] text-slate-400 mt-1">Govimithuru (#616#) &amp; Sayuru (#828#) Authorized Enterprise Partner</p>
            </div>

            <div className="flex gap-2">
              <a
                href="/official-logo.png"
                download="DD-WORLD-OFFICIAL-LOGO.png"
                className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5"
              >
                <span>Download High-Res Logo</span>
              </a>
              <button
                onClick={() => setLogoModalOpen(false)}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
