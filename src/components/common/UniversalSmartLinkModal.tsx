import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Apple,
  Download,
  Share2,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  ExternalLink,
  X,
  Layers,
  Sparkles,
  Cpu,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface UniversalSmartLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalSmartLinkModal: React.FC<UniversalSmartLinkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [detectedOs, setDetectedOs] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'smart_route' | 'qr_code' | 'specs'>('smart_route');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/android/i.test(ua)) {
        setDetectedOs('android');
      } else if (/iphone|ipad|ipod/i.test(ua)) {
        setDetectedOs('ios');
      } else {
        setDetectedOs('desktop');
      }
    }
  }, []);

  if (!isOpen) return null;

  const smartUrl = typeof window !== 'undefined' ? `${window.location.origin}/download` : 'https://a-east1.run.app/download';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(smartUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📲 *DD WORLD MARKETING ENTERPRISE SUITE*\n\nකරුණාකර පහත Universal Smart Link එක ඔස්සේ ඔබගේ දුරකථනයට (Android / iOS) නිල ඇප්ලිකේෂනය බාගත කරගන්න:\n🔗 ${smartUrl}\n\n*විශේෂාංග:* Live GPS Tracking, Digital Employee ID, Biometric Login.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Universal Smart Link Engine</h3>
                <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  v5.3 Universal
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Intelligent Single-URL Routing for Android APK & iOS Web-App / TestFlight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6">
          <button
            onClick={() => setSelectedTab('smart_route')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
              selectedTab === 'smart_route'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>ස්වයංක්‍රීය Smart Routing</span>
          </button>
          <button
            onClick={() => setSelectedTab('qr_code')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
              selectedTab === 'qr_code'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code Instant Scan</span>
          </button>
          <button
            onClick={() => setSelectedTab('specs')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center space-x-2 transition-colors ${
              selectedTab === 'specs'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Build Architecture</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {selectedTab === 'smart_route' && (
            <div className="space-y-6">
              {/* Dynamic OS Detection Banner */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    {detectedOs === 'android' ? (
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                    ) : detectedOs === 'ios' ? (
                      <Apple className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <Layers className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">හඳුනාගත් පද්ධතිය (Detected Device OS):</div>
                    <div className="text-sm font-bold text-white capitalize flex items-center space-x-2">
                      <span>
                        {detectedOs === 'android'
                          ? '🤖 Android OS (Direct APK Installation)'
                          : detectedOs === 'ios'
                          ? '🍏 Apple iOS (PWA / TestFlight Container)'
                          : '💻 Desktop Workstation (Direct Web Workspace)'}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                  Auto-Optimized
                </span>
              </div>

              {/* Single Deployment Smart Link Box */}
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Unified Dynamic Smart Link</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Single Link For All Users</span>
                </div>
                <div className="flex items-center space-x-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 select-all overflow-x-auto">
                  <span className="truncate">{smartUrl}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors border border-slate-700"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Link එක කොපි විය!' : 'Copy Smart Link'}</span>
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-lg shadow-emerald-900/30"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>WhatsApp මගින් යවන්න</span>
                  </button>
                </div>
              </div>

              {/* Platform Specific Download Tiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Android Direct APK Tile */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-emerald-500/50 transition-all space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Android Enterprise APK</h4>
                      <p className="text-xs text-slate-400">Capacitor v5.3 Native Build</p>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>ස්වයංක්‍රීය Live GPS Tracking සහාය</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>FaceID / Fingerprint Biometrics</span>
                    </li>
                  </ul>
                  <a
                    href="#download-android"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('DD World Enterprise APK v5.3 බාගත කිරීම ආරම්භ විය.');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download APK (v5.3 Release)</span>
                  </a>
                </div>

                {/* Apple iOS Installation Tile */}
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-indigo-500/50 transition-all space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Apple className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Apple iOS Deployment</h4>
                      <p className="text-xs text-slate-400">Safari PWA / TestFlight Portal</p>
                    </div>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Safari: 'Add to Home Screen' පහසුකම</span>
                    </li>
                    <li className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Apple Secure Enclave Biometrics</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      alert("iOS දුරකථනයෙන් Safari බ්‍රවුසරය ඔස්සේ 'Share' බොත්තම ඔබා 'Add to Home Screen' තෝරන්න.");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-700 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>iOS Install Guide</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'qr_code' && (
            <div className="text-center py-4 space-y-4">
              <div className="inline-block p-6 bg-white rounded-3xl shadow-xl">
                {/* SVG QR Code Simulation */}
                <svg
                  className="w-48 h-48 mx-auto"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner boxes */}
                  <rect x="5" y="5" width="30" height="30" rx="4" fill="#0f172a" />
                  <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
                  <rect x="15" y="15" width="10" height="10" fill="#059669" />

                  <rect x="65" y="5" width="30" height="30" rx="4" fill="#0f172a" />
                  <rect x="70" y="10" width="20" height="20" rx="2" fill="white" />
                  <rect x="75" y="15" width="10" height="10" fill="#059669" />

                  <rect x="5" y="65" width="30" height="30" rx="4" fill="#0f172a" />
                  <rect x="10" y="70" width="20" height="20" rx="2" fill="white" />
                  <rect x="15" y="75" width="10" height="10" fill="#059669" />

                  {/* Matrix dots */}
                  <rect x="42" y="10" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="10" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="24" width="6" height="6" fill="#059669" />
                  <rect x="10" y="44" width="6" height="6" fill="#0f172a" />
                  <rect x="24" y="44" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="42" width="16" height="16" rx="2" fill="#059669" />
                  <rect x="65" y="44" width="6" height="6" fill="#0f172a" />
                  <rect x="78" y="44" width="6" height="6" fill="#0f172a" />
                  <rect x="42" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="52" y="68" width="6" height="6" fill="#0f172a" />
                  <rect x="70" y="70" width="6" height="6" fill="#059669" />
                  <rect x="82" y="70" width="6" height="6" fill="#0f172a" />
                  <rect x="70" y="82" width="6" height="6" fill="#0f172a" />
                  <rect x="82" y="82" width="6" height="6" fill="#059669" />
                </svg>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                ඕනෑම Android හෝ Apple කැමරාවකින් මෙම QR කේතය Scan කර ඇප්ලිකේෂනය සෘජුව ස්ථාපනය කරගන්න.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Web Link</span>
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'specs' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <h5 className="font-bold text-white flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cross-Platform Runtime Guarantee</span>
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  DD World Enterprise Suite is architected with a universal cross-platform foundation (React + Capacitor + Vite PWA) ensuring zero lag, zero memory leaks, and 60fps responsive UI across low-end Android smartphones and premium iOS devices.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700">
                  <div className="font-bold text-white">Target Architecture</div>
                  <div className="text-slate-400 mt-1">Universal Universal APK & PWA Container</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700">
                  <div className="font-bold text-white">Cloud Deployment</div>
                  <div className="text-slate-400 mt-1">Google Cloud Run (a-east1.run.app)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700">
                  <div className="font-bold text-white">Database Engine</div>
                  <div className="text-slate-400 mt-1">Firestore Realtime Sync + Local Cache</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700">
                  <div className="font-bold text-white">Security Matrix</div>
                  <div className="text-slate-400 mt-1">Mock GPS Anti-Cheat + Biometrics</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Official Distribution System • DD World Marketing (Pvt) Ltd</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            සංවෘත කරන්න (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
