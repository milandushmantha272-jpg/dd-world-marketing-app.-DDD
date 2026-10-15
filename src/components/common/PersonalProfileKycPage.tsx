import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  FileCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Lock,
  Award,
  CreditCard,
  Building2,
  MapPin,
  Phone,
  Clock,
  Eye,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const PersonalProfileKycPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { verifications, addOrUpdateVerification, updateUserMobile, updateUserProfile } = useData();

  const userVerification = verifications.find((v) => v.userId === currentUser?.id);

  const [fullName, setFullName] = useState<string>(currentUser?.name || '');
  const [nicNumber, setNicNumber] = useState<string>(userVerification?.idNumber || currentUser?.nic || '');
  const [phone, setPhone] = useState<string>(
    currentUser?.mobile && currentUser.mobile !== 'නැත' ? currentUser.mobile : (userVerification?.contactNumber || '')
  );
  const [address, setAddress] = useState<string>(userVerification?.address || '');
  const [district, setDistrict] = useState<string>(currentUser?.district || 'කොළඹ');

  const [idPhoto, setIdPhoto] = useState<string>(
    userVerification?.idPhotoUrl ||
      currentUser?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  );

  const [gramaNiladhariReport, setGramaNiladhariReport] = useState<string>(
    currentUser?.gramaNiladhariReportUrl || userVerification?.gramaNiladhariReportUrl || ''
  );
  const [gramaReportName, setGramaReportName] = useState<string>(
    currentUser?.gramaReportName || userVerification?.gramaReportName || ''
  );

  const [policeReport, setPoliceReport] = useState<string>(
    currentUser?.policeReportUrl || userVerification?.policeReportUrl || ''
  );
  const [policeReportName, setPoliceReportName] = useState<string>(
    currentUser?.policeReportName || userVerification?.policeReportName || ''
  );

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ title: string; content: string; name: string } | null>(null);

  // Check if profile is complete (both reports are strictly mandatory)
  const isGramaReportUploaded = !!(gramaNiladhariReport && gramaNiladhariReport.trim());
  const isPoliceReportUploaded = !!(policeReport && policeReport.trim());

  const isProfileComplete =
    !!(nicNumber && nicNumber.trim().length >= 9) &&
    !!(address && address.trim().length >= 10) &&
    !!(phone && phone.trim().length >= 9) &&
    !!(idPhoto && idPhoto.length > 0) &&
    isGramaReportUploaded &&
    isPoliceReportUploaded;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setIdPhoto(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGramaReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGramaReportName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setGramaNiladhariReport(reader.result.toString());
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePoliceReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPoliceReportName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPoliceReport(reader.result.toString());
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setErrorMessage(null);

    // Mandatory validation for both documents
    if (!gramaNiladhariReport || !policeReport) {
      setErrorMessage(
        '⚠️ අනිවාර්ය වාර්තා අවශ්‍යයි: කරුණාකර "Grama Niladhari Character Report" සහ "Police Clearance Report" යන ලේඛන ද්විත්වයම Upload කරන්න.'
      );
      return;
    }

    if (phone && phone.trim()) {
      updateUserMobile(currentUser.id, phone.trim());
    }

    // Direct linking to User's profile in database
    updateUserProfile(currentUser.id, {
      name: fullName || currentUser.name,
      nic: nicNumber,
      mobile: phone,
      district,
      avatar: idPhoto,
      gramaNiladhariReportUrl: gramaNiladhariReport,
      policeReportUrl: policeReport,
      gramaReportName: gramaReportName || 'Grama_Niladhari_Report.pdf',
      policeReportName: policeReportName || 'Police_Clearance_Report.pdf',
      gramaReportUploadedAt: new Date().toISOString().split('T')[0],
      policeReportUploadedAt: new Date().toISOString().split('T')[0],
    });

    // Also update/sync verification record
    addOrUpdateVerification({
      userId: currentUser.id,
      userName: fullName || currentUser.name,
      userRole: currentUser.role,
      agentCode: currentUser.agentCode,
      idNumber: nicNumber,
      address,
      contactNumber: phone,
      idPhotoUrl: idPhoto,
      gramaNiladhariReportUrl: gramaNiladhariReport,
      policeReportUrl: policeReport,
      gramaReportName: gramaReportName || 'Grama_Niladhari_Report.pdf',
      policeReportName: policeReportName || 'Police_Clearance_Report.pdf',
    });

    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase">
              Official Personal Details &amp; KYC Profile
            </span>
            <span className="text-xs text-slate-400">DD WORLD SECURITY (PVT) LTD</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-amber-400" />
            පෞද්ගලික විස්තර සහ වාර්තා ඇතුලත් කිරීමේ පිටුව (Personal KYC Profile)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ආයතනික ID Card එක සක්‍රිය කරගැනීමට පොලිස් වාර්තාව, ග්‍රාමසේවක සහතිකය සහ ඡායාරූපය ඇතුලත් කරන්න.
          </p>
        </div>

        {userVerification?.status === 'verified' ? (
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center gap-2 shadow-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>ID Card &amp; KYC Status: VERIFIED &amp; ACTIVE</span>
          </div>
        ) : (
          <div className="px-4 py-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center gap-2 shadow-lg animate-pulse">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>ID Card Status: PENDING OWNER APPROVAL</span>
          </div>
        )}
      </div>

      {/* Profile Incomplete Daily Alert Notice */}
      {!isProfileComplete && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-2 border-amber-500/60 text-amber-200 text-xs flex items-center justify-between gap-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">
                ⚠️ දිනපතා නිවේදනය: ඔබගේ පෞද්ගලික විස්තර (KYC Details) තවමත් අසම්පූර්ණයි!
              </h4>
              <p className="text-amber-300 mt-0.5">
                කරුණාකර ඔබගේ ජාතික හැඳුනුම්පත, ඡායාරූපය, පොලිස් වාර්තාව සහ ග්‍රාමසේවක සහතිකය අදම ඇතුලත් කර Submit කරන්න.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-amber-500/30 text-amber-200 text-[11px] font-black uppercase shrink-0 border border-amber-400/50">
            Action Required Today
          </span>
        </div>
      )}

      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>ඔබගේ පෞද්ගලික විස්තර සහ වාර්තා සාර්ථකව යාවත්කාලීන විය. Owner ගේ අනුමැතිය සඳහා යොමු කෙරිණි!</span>
        </div>
      )}

      {/* Main Grid: Form + Card Auto-Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <form onSubmit={handleSubmitProfile} className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-5 h-5 text-amber-400" />
            1. පෞද්ගලික තොරතුරු සහ වාර්තා අමුණන්න
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">සම්පූර්ණ නම (Full Name)</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">ජාතික හැඳුනුම්පත් අංකය (NIC Number)</label>
              <input
                type="text"
                required
                placeholder="උදා: 199518294021 / 951829402V"
                value={nicNumber}
                onChange={(e) => setNicNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">දුරකථන අංකය (Mobile)</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">දිස්ත්‍රික්කය (District)</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">ස්ථිර ලිපිනය (Residential Address)</label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-amber-500 outline-none"
            ></textarea>
          </div>

          {/* Photo & Reports Upload Section */}
          <div className="space-y-4 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  අනිවාර්ය ලේඛන සහ ඡායාරූප (Mandatory KYC Documents)
                </h4>
                <p className="text-[11px] text-slate-400">
                  ආයතනික නීතිමය පිළිගැනීම හා ID Card සඳහා පහත ලේඛන දෙක අනිවාර්යයෙන්ම Upload කළ යුතුය.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* 1. ID Photo Upload */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-200">1. ID Photo (ඡායාරූපය)</span>
                  <Upload className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={idPhoto}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-amber-400/50 shadow-md"
                  />
                  <div className="text-[10px] text-slate-400">
                    <span className="text-emerald-400 font-bold block">✓ සක්‍රියයි</span>
                    JPG, PNG හෝ WEBP
                  </div>
                </div>
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-[11px] text-center transition flex items-center justify-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    ඡායාරූපය මාරු කරන්න
                  </div>
                </label>
              </div>

              {/* 2. Grama Niladhari Character Report */}
              <div className={`p-4 rounded-2xl bg-slate-950/80 border transition flex flex-col justify-between space-y-3 ${
                isGramaReportUploaded ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-amber-500/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-black text-slate-200">2. ග්‍රාම නිලධාරී වාර්තාව</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    MANDATORY
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Grama Niladhari Character Report (PDF හෝ Photo)
                </p>

                {isGramaReportUploaded ? (
                  <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between gap-2">
                    <div className="truncate flex-1">
                      <span className="text-[10px] font-bold text-emerald-300 truncate block">
                        ✓ {gramaReportName || 'Grama_Report.pdf'}
                      </span>
                      <span className="text-[9px] text-slate-400">ග්‍රාමසේවක සහතිකය Upload කර ඇත</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setViewingDoc({
                          title: 'ග්‍රාම නිලධාරී චරිත වාර්තාව (Grama Niladhari Report)',
                          content: gramaNiladhariReport,
                          name: gramaReportName || 'Grama_Niladhari_Report.pdf',
                        })
                      }
                      className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition"
                      title="View Report"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/20 text-[10px] text-rose-300 font-bold text-center">
                    ⚠️ වාර්තාව Upload කර නැත
                  </div>
                )}

                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleGramaReportUpload}
                    className="hidden"
                  />
                  <div className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20">
                    <Upload className="w-3.5 h-3.5" />
                    {isGramaReportUploaded ? 'වාර්තාව වෙනස් කරන්න' : 'Upload Grama Report'}
                  </div>
                </label>
              </div>

              {/* 3. Police Clearance Report */}
              <div className={`p-4 rounded-2xl bg-slate-950/80 border transition flex flex-col justify-between space-y-3 ${
                isPoliceReportUploaded ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-amber-500/40'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-black text-slate-200">3. පොලිස් වාර්තාව</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    MANDATORY
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Police Clearance Report (PDF හෝ Photo)
                </p>

                {isPoliceReportUploaded ? (
                  <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between gap-2">
                    <div className="truncate flex-1">
                      <span className="text-[10px] font-bold text-emerald-300 truncate block">
                        ✓ {policeReportName || 'Police_Report.pdf'}
                      </span>
                      <span className="text-[9px] text-slate-400">පොලිස් සහතිකය Upload කර ඇත</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setViewingDoc({
                          title: 'පොලිස් නිෂ්කාශන වාර්තාව (Police Clearance Report)',
                          content: policeReport,
                          name: policeReportName || 'Police_Clearance_Report.pdf',
                        })
                      }
                      className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition"
                      title="View Report"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-rose-950/20 border border-rose-500/20 text-[10px] text-rose-300 font-bold text-center">
                    ⚠️ වාර්තාව Upload කර නැත
                  </div>
                )}

                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handlePoliceReportUpload}
                    className="hidden"
                  />
                  <div className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20">
                    <Upload className="w-3.5 h-3.5" />
                    {isPoliceReportUploaded ? 'වාර්තාව වෙනස් කරන්න' : 'Upload Police Report'}
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            පෞද්ගලික විස්තර හා වාර්තා සුරකින්න (Save Profile &amp; Submit Reports)
          </button>
        </form>

        {/* Modal for viewing document */}
        {viewingDoc && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">{viewingDoc.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingDoc(null)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Close
                </button>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl max-h-[60vh] overflow-auto flex flex-col items-center justify-center">
                {viewingDoc.content.startsWith('data:image') ? (
                  <img
                    src={viewingDoc.content}
                    alt={viewingDoc.title}
                    className="max-h-[50vh] rounded-xl object-contain"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <FileText className="w-16 h-16 text-blue-400 mx-auto" />
                    <p className="text-sm font-bold text-white">{viewingDoc.name}</p>
                    <p className="text-xs text-slate-400">ලේඛනය සාර්ථකව පද්ධතියේ Profile එකට සම්බන්ධ කර ඇත.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Auto ID Card Live Preview Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-between space-y-6">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              2. ඔබගේ ස්වයංක්‍රීය ID Card පූර්වදර්ශනය
            </h3>
          </div>

          {/* FRONT OF ID CARD */}
          <div className="relative w-full max-w-xs h-[460px] rounded-3xl bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 border-2 border-blue-500/50 shadow-2xl p-5 flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-blue-500/30 pb-2.5 z-10">
              <div>
                <h4 className="text-xs font-black text-white tracking-wider">DD WORLD MARKETING</h4>
                <p className="text-[8px] text-blue-300 font-bold uppercase">Official Identification</p>
              </div>
              <img
                src="/official-logo.png"
                alt="DD World Logo"
                className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-lg border border-blue-400/50"
              />
            </div>

            {/* Staff Photo */}
            <div className="flex flex-col items-center justify-center my-1 z-10">
              <div className="relative">
                <img
                  src={idPhoto}
                  alt="Staff Photo"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-400 shadow-xl"
                />
                <span className={`absolute -bottom-2 right-1/2 translate-x-1/2 px-2 py-0.5 rounded-full font-black text-[8px] uppercase shadow-md ${
                  userVerification?.status === 'verified'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 text-slate-950 animate-pulse'
                }`}>
                  {userVerification?.status === 'verified' ? 'ACTIVE VERIFIED' : 'PENDING OK'}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mt-3 text-center">{fullName || currentUser?.name}</h3>
              <p className="text-[11px] text-amber-300 font-bold text-center mt-0.5">
                {currentUser?.role === 'owner'
                  ? 'Managing Director'
                  : currentUser?.role === 'team_leader'
                  ? 'District Team Leader'
                  : 'Field Executive Agent'}
              </p>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[9px] font-mono text-blue-200 font-bold">
                Code: {currentUser?.agentCode || 'DD-001'}
              </div>
            </div>

            {/* Details footer */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 text-[10px] space-y-1 z-10">
              <div className="flex justify-between">
                <span className="text-slate-400">NIC No:</span>
                <span className="text-white font-mono font-bold">{nicNumber || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mobile:</span>
                <span className="text-white font-bold">{phone || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">District:</span>
                <span className="text-blue-300 font-bold">{district}</span>
              </div>
            </div>

            {/* Bottom Security Stripe */}
            <div className="flex items-center justify-between text-[8px] text-slate-400 pt-1.5 border-t border-slate-800 z-10">
              <span>Issuing Auth: Director Board</span>
              <span className="text-amber-400 font-bold">Status: {userVerification?.status === 'verified' ? 'Active' : 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
