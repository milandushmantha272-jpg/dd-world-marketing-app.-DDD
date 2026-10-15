import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  Share2,
  QrCode,
  Copy,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Smartphone,
  Delete,
  X,
  Sparkles,
  ShieldCheck,
  Radio,
  Check,
} from 'lucide-react';
import { User } from '../../types';
import { useData } from '../../context/DataContext';

interface IvrKeypadAndAppShareModalProps {
  currentUser: User;
  onClose?: () => void;
  isOpen?: boolean;
}

const GOVIMITHURU_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=lk.dialog.govimithuru';
const SAYURU_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=lk.dialog.sayuru';

export const IvrKeypadAndAppShareModal: React.FC<IvrKeypadAndAppShareModalProps> = ({
  currentUser,
  onClose,
  isOpen = true,
}) => {
  const { addProductSale, updateUserGps } = useData();

  const [activeMode, setActiveMode] = useState<'keypad' | 'app_share'>('keypad');

  // Keypad state
  const [dialDisplay, setDialDisplay] = useState<string>('#616#');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [isDialing, setIsDialing] = useState<boolean>(false);
  const [dialSuccess, setDialSuccess] = useState<string | null>(null);

  // App Share state
  const [selectedApp, setSelectedApp] = useState<'govimithuru' | 'sayuru'>('govimithuru');
  const [appCustomerPhone, setAppCustomerPhone] = useState<string>('');
  const [appCustomerName, setAppCustomerName] = useState<string>('');
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [appShareSuccess, setAppShareSuccess] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  // Keypad input handlers
  const handleKeyPress = (val: string) => {
    setDialDisplay((prev) => (prev.length < 20 ? prev + val : prev));
  };

  const handleBackspace = () => {
    setDialDisplay((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setDialDisplay('');
  };

  const handleQuickDial = (code: '#616#' | '#828#') => {
    setDialDisplay(code);
  };

  // Execute IVR Call & Auto-Log Sale with GPS
  const handleExecuteDial = () => {
    if (!dialDisplay || dialDisplay.trim() === '') {
      alert('කරුණාකර Dial කිරීමට කේතයක් හෝ අංකයක් ඇතුළත් කරන්න.');
      return;
    }

    setIsDialing(true);

    // Determine product
    const is616 = dialDisplay.includes('616');
    const is828 = dialDisplay.includes('828');
    const productType: 'ගොවිමිතුරු' | 'සයුරු' | 'අනෙකුත්' = is616
      ? 'ගොවිමිතුරු'
      : is828
      ? 'සයුරු'
      : 'අනෙකුත්';
    const productName = is616
      ? 'ගොවිමිතුරු (#616#) [IVR Keypad]'
      : is828
      ? 'සයුරු (#828#) [IVR Keypad]'
      : `IVR Call (${dialDisplay})`;

    // Capture location with high accuracy
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const district = currentUser.location?.district || currentUser.assignedDistrict || 'Colombo';

          updateUserGps(currentUser.id, { latitude: lat, longitude: lng, district, source: 'GPS' });

          finalizeIvrDial(productType, productName, lat, lng, district);
        },
        (err) => {
          console.warn('GPS prompt error, fallback to profile location:', err);
          const lat = currentUser.location?.latitude || 6.9271;
          const lng = currentUser.location?.longitude || 79.8612;
          const district = currentUser.location?.district || currentUser.assignedDistrict || 'Colombo';

          finalizeIvrDial(productType, productName, lat, lng, district);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const lat = currentUser.location?.latitude || 6.9271;
      const lng = currentUser.location?.longitude || 79.8612;
      const district = currentUser.location?.district || currentUser.assignedDistrict || 'Colombo';
      finalizeIvrDial(productType, productName, lat, lng, district);
    }
  };

  const finalizeIvrDial = (
    productType: 'ගොවිමිතුරු' | 'සයුරු' | 'අනෙකුත්',
    productName: string,
    lat: number,
    lng: number,
    district: string
  ) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // 1. Add Sale to DataContext & Firestore
    addProductSale({
      agentId: currentUser.id,
      agentName: currentUser.name,
      agentCode: currentUser.agentCode || 'AG-000',
      teamId: currentUser.teamId || 'team_direct',
      productType,
      productName,
      channel: 'IVR',
      quantity: 1,
      customerName: customerName.trim() || undefined,
      customerMobile: customerPhone.trim() || undefined,
      amount: 0,
      notes: `IVR Keypad Dial: ${dialDisplay} | පාරිභෝගිකයා: ${customerPhone || 'Direct'}`,
      location: `${district} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      latitude: lat,
      longitude: lng,
      district,
      time: timeStr,
      activationMethod: 'KEYPAD_DIAL',
      dialCode: dialDisplay,
    });

    // 2. Trigger native device dialer
    // USSD hash (#) must be encoded as %23 for tel: links
    const encodedTel = dialDisplay.replace(/#/g, '%23');
    try {
      window.location.href = `tel:${encodedTel}`;
    } catch (e) {
      console.log('Native dialer trigger:', e);
    }

    setIsDialing(false);
    setDialSuccess(
      `✅ ${productName} ඇමතුම සාර්ථකව සම්බන්ධ විය!\nකාලය: ${timeStr} | ස්ථානය: ${district}`
    );
    setTimeout(() => {
      setDialSuccess(null);
    }, 6000);
  };

  // App Link sharing actions
  const getAppPlayStoreUrl = () => {
    return selectedApp === 'govimithuru' ? GOVIMITHURU_PLAY_STORE_URL : SAYURU_PLAY_STORE_URL;
  };

  const getAppName = () => {
    return selectedApp === 'govimithuru' ? 'Dialog ගොවිමිතුරු App' : 'Dialog සයුරු App';
  };

  const getAppShareMessage = () => {
    const appName = getAppName();
    const link = getAppPlayStoreUrl();
    return `ආයුබෝවන්! Dialog Axiata හි නිල ${appName} පහත Google Play Store link එක ඔස්සේ ඔබගේ ජංගම දුරකථනයට පහසුවෙන් බාගත කරගන්න:\n\n🔗 ${link}\n\nකෘෂිකාර්මික හා කාලගුණ උපදෙස් සඳහා සම්බන්ධ වන්න.\nනියෝජිත: ${currentUser.name} (Code: ${currentUser.agentCode}) - DD World Marketing.`;
  };

  const logAppActivationSale = (shareChannel: 'WHATSAPP' | 'SMS' | 'QR' | 'DIRECT') => {
    const productType = selectedApp === 'govimithuru' ? 'ගොවිමිතුරු' : 'සයුරු';
    const productName = `${getAppName()} [Play Store Share]`;
    const lat = currentUser.location?.latitude || 6.9271;
    const lng = currentUser.location?.longitude || 79.8612;
    const district = currentUser.location?.district || currentUser.assignedDistrict || 'Colombo';
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    addProductSale({
      agentId: currentUser.id,
      agentName: currentUser.name,
      agentCode: currentUser.agentCode || 'AG-000',
      teamId: currentUser.teamId || 'team_direct',
      productType,
      productName,
      channel: 'APP',
      quantity: 1,
      customerName: appCustomerName.trim() || undefined,
      customerMobile: appCustomerPhone.trim() || undefined,
      amount: 0,
      notes: `Play Store App Share (${shareChannel}): ${getAppName()} to ${appCustomerPhone || 'Walk-in Customer'}`,
      location: `${district} (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      latitude: lat,
      longitude: lng,
      district,
      time: timeStr,
      activationMethod: 'APP_LINK_SHARE',
      appShareChannel: shareChannel,
    });

    setAppShareSuccess(
      `✅ ${getAppName()} Link එක සාර්ථකව පාරිභෝගිකයාට යවන ලදී!\nSale එක සටහන් විය | නියෝජිත: ${currentUser.name} | දිස්ත්‍රික්කය: ${district}`
    );
    setTimeout(() => {
      setAppShareSuccess(null);
    }, 6000);
  };

  const handleShareWhatsApp = () => {
    if (!appCustomerPhone.trim()) {
      alert('කරුණාකර පාරිභෝගිකයාගේ දුරකථන අංකය ඇතුළත් කරන්න (e.g. 0771234567)');
      return;
    }
    let formattedPhone = appCustomerPhone.trim().replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '94' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('94')) {
      formattedPhone = '94' + formattedPhone;
    }

    const text = encodeURIComponent(getAppShareMessage());
    const waUrl = `https://wa.me/${formattedPhone}?text=${text}`;
    window.open(waUrl, '_blank');

    logAppActivationSale('WHATSAPP');
  };

  const handleShareSms = () => {
    if (!appCustomerPhone.trim()) {
      alert('කරුණාකර පාරිභෝගිකයාගේ දුරකථන අංකය ඇතුළත් කරන්න');
      return;
    }
    const cleanPhone = appCustomerPhone.trim().replace(/[^0-9]/g, '');
    const text = encodeURIComponent(getAppShareMessage());
    window.location.href = `sms:${cleanPhone}?body=${text}`;

    logAppActivationSale('SMS');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getAppPlayStoreUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    logAppActivationSale('DIRECT');
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    getAppPlayStoreUrl()
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 relative my-auto">
        {/* CLOSE BUTTON */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* HEADER */}
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wider">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Dialog Authorized Sales Engine</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            IVR Keypad Dial &amp; Play Store App Activator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            #828# හා #616# Dial කිරීම සහ Play Store Apps පාරිභෝගිකයින්ට Share කර සක්‍රිය කිරීම.
          </p>
        </div>

        {/* MODE TOGGLE TABS */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveMode('keypad')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
              activeMode === 'keypad'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>📞 #828# &amp; #616# Keypad</span>
          </button>

          <button
            onClick={() => setActiveMode('app_share')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
              activeMode === 'app_share'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>📲 Play Store App Share</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODE 1: PHONE KEYPAD (#616# & #828# DIALER) */}
        {/* ------------------------------------------------------------- */}
        {activeMode === 'keypad' && (
          <div className="space-y-4">
            {/* SUCCESS BANNER */}
            {dialSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-start gap-2.5 shadow-xl animate-fade-in whitespace-pre-line">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>{dialSuccess}</div>
              </div>
            )}

            {/* QUICK ONE-TOUCH PRESETS */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDial('#616#')}
                className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between ${
                  dialDisplay === '#616#'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-black">🌾 ගොවිමිතුරු (#616#)</div>
                  <div className="text-[10px] text-slate-400">Agriculture &amp; Weather IVR</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">#616#</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDial('#828#')}
                className={`p-3 rounded-2xl border transition-all text-left flex items-center justify-between ${
                  dialDisplay === '#828#'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-black">🌊 සයුරු (#828#)</div>
                  <div className="text-[10px] text-slate-400">Fisheries &amp; Ocean IVR</div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">#828#</span>
              </button>
            </div>

            {/* CUSTOMER PHONE & NAME (OPTIONAL) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-400 text-[11px]">පාරිභෝගික අංකය (Customer Mobile)</label>
                <input
                  type="tel"
                  placeholder="077XXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-400 text-[11px]">නම (Customer Name - Optional)</label>
                <input
                  type="text"
                  placeholder="ගොවි මහතා / ධීවර"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* KEYPAD DIAL DISPLAY */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between shadow-inner">
              <div className="font-mono text-2xl font-black text-amber-400 tracking-wider">
                {dialDisplay || <span className="text-slate-600 text-lg">අංකය ටයිප් කරන්න...</span>}
              </div>
              <div className="flex items-center gap-1">
                {dialDisplay && (
                  <>
                    <button
                      type="button"
                      onClick={handleBackspace}
                      className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
                      title="Backspace"
                    >
                      <Delete className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-400 font-bold hover:text-white"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* NUMERIC KEYPAD GRID */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {[
                { label: '1', sub: '' },
                { label: '2', sub: 'ABC' },
                { label: '3', sub: 'DEF' },
                { label: '4', sub: 'GHI' },
                { label: '5', sub: 'JKL' },
                { label: '6', sub: 'MNO' },
                { label: '7', sub: 'PQRS' },
                { label: '8', sub: 'TUV' },
                { label: '9', sub: 'WXYZ' },
                { label: '*', sub: '' },
                { label: '0', sub: '+' },
                { label: '#', sub: '' },
              ].map((key) => (
                <button
                  key={key.label}
                  type="button"
                  onClick={() => handleKeyPress(key.label)}
                  className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800/80 hover:border-slate-700 text-white font-mono text-lg font-black transition flex flex-col items-center justify-center shadow-sm"
                >
                  <span>{key.label}</span>
                  {key.sub && <span className="text-[9px] font-sans text-slate-500 font-bold tracking-tighter">{key.sub}</span>}
                </button>
              ))}
            </div>

            {/* BIG CALL / DIAL BUTTON */}
            <button
              type="button"
              onClick={handleExecuteDial}
              disabled={isDialing}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm transition flex items-center justify-center gap-3 shadow-xl ${
                isDialing
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/20 active:scale-[0.99]'
              }`}
            >
              <PhoneCall className="w-5 h-5 animate-bounce" />
              <span>{isDialing ? 'සම්බන්ධ වෙමින් පවතී...' : `${dialDisplay} Dial කර Sale එක සටහන් කරන්න`}</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>GPS Location Capture: Auto</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Timestamp: Auto</span>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Owner Alert: Live</span>
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE 2: PLAY STORE APP SHARE & ACTIVATION */}
        {/* ------------------------------------------------------------- */}
        {activeMode === 'app_share' && (
          <div className="space-y-4">
            {/* SUCCESS BANNER */}
            {appShareSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-start gap-2.5 shadow-xl animate-fade-in whitespace-pre-line">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>{appShareSuccess}</div>
              </div>
            )}

            {/* APP SELECTOR */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedApp('govimithuru')}
                className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 ${
                  selectedApp === 'govimithuru'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl shrink-0">
                  🌾
                </div>
                <div>
                  <div className="text-xs font-black">ගොවිමිතුරු App</div>
                  <div className="text-[10px] text-slate-400">Google Play Store</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedApp('sayuru')}
                className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 ${
                  selectedApp === 'sayuru'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl shrink-0">
                  🌊
                </div>
                <div>
                  <div className="text-xs font-black">සයුරු App</div>
                  <div className="text-[10px] text-slate-400">Google Play Store</div>
                </div>
              </button>
            </div>

            {/* CUSTOMER CONTACT INPUTS */}
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  පාරිභෝගිකයාගේ ජංගම දුරකථන අංකය (Customer Mobile Number) *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0771234567"
                  value={appCustomerPhone}
                  onChange={(e) => setAppCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  පාරිභෝගිකයාගේ නම (Customer Name - Optional)
                </label>
                <input
                  type="text"
                  placeholder="නම (e.g. කේ. සුනිල් මහතා)"
                  value={appCustomerName}
                  onChange={(e) => setAppCustomerName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* PLAY STORE LINK DISPLAY & COPY */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div className="truncate text-xs text-slate-400 font-mono">
                {getAppPlayStoreUrl()}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="QR Code පෙන්වන්න"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* QR CODE DISPLAY BOX (OPTIONAL) */}
            {showQrCode && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-center space-y-2 animate-fade-in">
                <p className="text-xs font-bold text-amber-300">
                  පාරිභෝගිකයාගේ දුරකථනයෙන් මෙම QR Code එක Scan කර App එක බාගත කරගන්න:
                </p>
                <div className="inline-block p-3 bg-white rounded-2xl shadow-xl">
                  <img src={qrImageUrl} alt="Play Store QR" className="w-40 h-40 object-contain mx-auto" />
                </div>
                <div className="text-[11px] text-slate-400">
                  {getAppName()} — Google Play Store Instant Download
                </div>
              </div>
            )}

            {/* SHARE ACTION BUTTONS */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp මගින් යවන්න</span>
              </button>

              <button
                type="button"
                onClick={handleShareSms}
                className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>SMS මගින් යවන්න</span>
              </button>
            </div>

            {/* DIRECT MANUAL LOG BUTTON */}
            <button
              type="button"
              onClick={() => logAppActivationSale('DIRECT')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>පාරිභෝගික දුරකථනයට Download කළ පසු Sale එක Count කරන්න</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
