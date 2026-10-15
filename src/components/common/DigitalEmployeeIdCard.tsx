import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  Building2,
  UserCheck,
  QrCode,
  Sparkles,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Award,
  Upload,
  FileText,
  FileCheck,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User } from '../../types';
import { QrCodeVerificationModal } from './QrCodeVerificationModal';

interface DigitalEmployeeIdCardProps {
  user?: User;
  onClose?: () => void;
}

export const DigitalEmployeeIdCard: React.FC<DigitalEmployeeIdCardProps> = ({ user: propUser, onClose }) => {
  const { currentUser } = useAuth();
  const { submitEmployeePhoto, verifications, addOrUpdateVerification } = useData();

  const user = propUser || currentUser;

  const [flipped, setFlipped] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  if (!user) return null;

  const isOwner = currentUser?.role === 'owner';
  const isSelf = currentUser?.id === user.id;

  const empId = user.employeeId || `DDW-EMP-${user.agentCode || '9000'}`;
  const empStatus = user.employmentStatus || (user.status === 'blocked' ? 'BLOCKED' : 'ACTIVE');
  const idStatus = user.idApprovalStatus || 'PENDING';
  const jobPosition =
    user.jobPosition ||
    (user.role === 'team_leader' ? 'Team Leader' : user.role === 'owner' ? 'Managing Director' : 'Field Sales Representative');

  const userVerification = verifications.find((v) => v.userId === user.id);

  const hasGramaReport = Boolean(userVerification?.gramaNiladhariReportUrl && userVerification.gramaNiladhariReportUrl !== '');
  const hasPoliceReport = Boolean(userVerification?.policeReportUrl && userVerification.policeReportUrl !== '');
  const hasPhoto = Boolean(user.photoUrl || user.avatar || userVerification?.idPhotoUrl);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const photoDataUrl = event.target.result as string;
          submitEmployeePhoto(user.id, photoDataUrl);
          setIsUploadingPhoto(false);
          setUploadNotice('✅ ඔබගේ සේවක ඡායාරූපය සාර්ථකව හිමිකරු (Owner) වෙත යොමු කරන ලදී!');
          setTimeout(() => setUploadNotice(null), 5000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGramaReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addOrUpdateVerification({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        agentCode: user.agentCode,
        idNumber: userVerification?.idNumber || user.nic || '199518294021',
        address: userVerification?.address || 'Sri Lanka',
        contactNumber: userVerification?.contactNumber || user.mobile || '',
        gramaNiladhariReportUrl: `Uploaded: ${file.name}`,
        policeReportUrl: userVerification?.policeReportUrl || '',
        status: userVerification?.status === 'verified' ? 'verified' : 'pending',
      });
      setUploadNotice('✅ ග්‍රාම නිලධාරී චරිත වාර්තාව (Grama Niladhari Report) සාර්ථකව උඩුගත විය!');
      setTimeout(() => setUploadNotice(null), 5000);
    }
  };

  const handlePoliceReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addOrUpdateVerification({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        agentCode: user.agentCode,
        idNumber: userVerification?.idNumber || user.nic || '199518294021',
        address: userVerification?.address || 'Sri Lanka',
        contactNumber: userVerification?.contactNumber || user.mobile || '',
        gramaNiladhariReportUrl: userVerification?.gramaNiladhariReportUrl || '',
        policeReportUrl: `Uploaded: ${file.name}`,
        status: userVerification?.status === 'verified' ? 'verified' : 'pending',
      });
      setUploadNotice('✅ පොලිස් නිෂ්කාශන වාර්තාව (Police Clearance Report) සාර්ථකව උඩුගත විය!');
      setTimeout(() => setUploadNotice(null), 5000);
    }
  };

  // If the ID is NOT approved and the viewer is NOT the owner previewing, show the locked pending verification status screen
  const isApproved = idStatus === 'APPROVED' && empStatus === 'ACTIVE';

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* Upload notice banner */}
      {uploadNotice && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {/* Top Status Banner */}
      <div
        className={`p-3 rounded-2xl text-center font-bold text-xs flex items-center justify-center gap-2 border shadow-md ${
          isApproved
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
            : idStatus === 'REJECTED'
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
            : idStatus === 'NEW_PHOTO_REQUESTED'
            ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
            : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
        }`}
      >
        {isApproved && (
          <>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>✅ DD WORLD EMPLOYEE ID – VERIFIED &amp; ACTIVE</span>
          </>
        )}
        {!isApproved && idStatus === 'PENDING' && (
          <>
            <Lock className="w-4 h-4 text-amber-400" />
            <span>🔒 PENDING OWNER APPROVAL (DOCUMENTS REQUIRED)</span>
          </>
        )}
        {!isApproved && idStatus === 'REJECTED' && (
          <>
            <XCircle className="w-5 h-5 text-rose-400" />
            <span>❌ EMPLOYEE ID REJECTED – NEW PHOTO REQUIRED</span>
          </>
        )}
        {!isApproved && idStatus === 'NEW_PHOTO_REQUESTED' && (
          <>
            <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
            <span>📷 NEW FORMAL PHOTO REQUESTED BY OWNER</span>
          </>
        )}
      </div>

      {/* Verification Lock Screen for Unapproved Agents/TLs */}
      {!isApproved && !isOwner ? (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4 text-slate-200">
          <div className="text-center space-y-2 border-b border-slate-800 pb-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-1">
                ID GATING RESTRICTION ACTIVE
              </span>
              <h3 className="text-base font-black text-white">PENDING OWNER APPROVAL</h3>
              <p className="text-xs text-amber-300/90 leading-relaxed font-medium mt-1">
                ඩිජිටල් හැඳුනුම්පත (Digital ID) නිකුත් කිරීම සහ වලංගුභාවය ආයතන ප්‍රධානී (Owner) විසින් ඔබගේ ලේඛන විගණනය කර අනුමත කරන තෙක් අත්හිටුවා ඇත.
              </p>
            </div>
          </div>

          {/* Operational Notice: Field logging is active */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">ක්ෂේත්‍ර මෙහෙයුම් සක්‍රියයි:</span> ඔබගේ දෛනික පැමිණීම (Check-In / Out) සහ විකුණුම් සටහන් කිරීම් කිසිදු බාධාවකින් තොරව ක්‍රියාත්මක කළ හැක. මෙම අගුල වලංගු වන්නේ නිල හැඳුනුම්පත් අතුරුමුහුණතට (ID Card Interface) පමණි.
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                අනිවාර්ය ලේඛන උඩුගත කිරීම් (Mandatory Documents)
              </h4>
              <span className="text-[10px] font-bold text-amber-400">
                {[hasGramaReport, hasPoliceReport, hasPhoto].filter(Boolean).length}/3 Completed
              </span>
            </div>

            {/* 1. Grama Niladhari Report */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck className={`w-5 h-5 shrink-0 ${hasGramaReport ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">1. ග්‍රාම නිලධාරී වාර්තාව</p>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                          hasGramaReport ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {hasGramaReport ? 'UPLOADED' : 'REQUIRED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Grama Niladhari Character Report</p>
                  </div>
                </div>
                <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold cursor-pointer shrink-0 border border-slate-700 flex items-center gap-1.5 transition active:scale-95 shadow">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{hasGramaReport ? 'Re-Upload' : 'Upload'}</span>
                  <input type="file" onChange={handleGramaReportUpload} className="hidden" />
                </label>
              </div>
              {hasGramaReport && (
                <p className="text-[10px] text-emerald-400/90 font-mono truncate pl-7">
                  📄 {userVerification?.gramaNiladhariReportUrl || 'Document on record (Awaiting Owner Audit)'}
                </p>
              )}
            </div>

            {/* 2. Police Clearance Report */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className={`w-5 h-5 shrink-0 ${hasPoliceReport ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">2. පොලිස් නිෂ්කාශන වාර්තාව</p>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                          hasPoliceReport ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {hasPoliceReport ? 'UPLOADED' : 'REQUIRED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Police Clearance Certificate</p>
                  </div>
                </div>
                <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold cursor-pointer shrink-0 border border-slate-700 flex items-center gap-1.5 transition active:scale-95 shadow">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{hasPoliceReport ? 'Re-Upload' : 'Upload'}</span>
                  <input type="file" onChange={handlePoliceReportUpload} className="hidden" />
                </label>
              </div>
              {hasPoliceReport && (
                <p className="text-[10px] text-emerald-400/90 font-mono truncate pl-7">
                  📄 {userVerification?.policeReportUrl || 'Document on record (Awaiting Owner Audit)'}
                </p>
              )}
            </div>

            {/* 3. Official Photo */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Camera className={`w-5 h-5 shrink-0 ${hasPhoto ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white truncate">3. සේවක නිල ඡායාරූපය</p>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                          hasPhoto ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {hasPhoto ? 'UPLOADED' : 'REQUIRED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">Formal ID Portrait (Passport Size)</p>
                  </div>
                </div>
                <label className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shrink-0 flex items-center gap-1.5 transition active:scale-95 shadow">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{hasPhoto ? 'Change' : 'Upload'}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
              {hasPhoto && (
                <p className="text-[10px] text-emerald-400/90 font-medium pl-7">
                  ✅ Portrait photo uploaded &amp; queued for owner approval
                </p>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed text-center">
            <span className="font-bold">විගණන ක්‍රියාවලිය:</span> ඉහත ලේඛන සියල්ල ආයතන ප්‍රධානී (Managing Director / Owner) විසින් පරික්ෂා කර අනුමත කිරීමෙන් පසු නිල ඩිජිටල් හැඳුනුම්පත සහ QR කේතය මෙම පිටුවෙන් සක්‍රිය වනු ඇත.
          </div>
        </div>
      ) : (
        /* Verified ID Card Display */
        <div
          onClick={() => setFlipped(!flipped)}
          className="cursor-pointer group relative w-full aspect-[1/1.62] rounded-3xl p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 border-2 border-amber-500/40 shadow-2xl overflow-hidden flex flex-col justify-between transition-transform duration-500 transform hover:scale-[1.01]"
        >
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* FRONT SIDE */}
          {!flipped ? (
            <div className="space-y-4 relative z-10 flex flex-col h-full justify-between">
              {/* Header / Logo */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <img
                    src="/official-logo.png"
                    alt="DD World Marketing Logo"
                    className="w-8 h-8 rounded-xl object-contain bg-white p-0.5 shadow-md border border-amber-400/50"
                  />
                  <div>
                    <h3 className="text-[11px] font-black text-amber-400 tracking-wider">DD WORLD MARKETING</h3>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Private Limited • Sri Lanka</p>
                  </div>
                </div>
                <ShieldCheck className={`w-5 h-5 ${isApproved ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>

              {/* Profile Photo */}
              <div className="flex flex-col items-center justify-center space-y-2 my-auto">
                <div className="relative group/photo">
                  <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-amber-400/70 p-1 shadow-xl overflow-hidden flex items-center justify-center">
                    {user.photoUrl || user.avatar ? (
                      <img src={user.photoUrl || user.avatar} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-black text-3xl">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <span
                    className={`absolute -bottom-1 -right-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shadow-md ${
                      empStatus === 'ACTIVE'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-rose-500 text-white border-rose-400'
                    }`}
                  >
                    {empStatus}
                  </span>

                  {/* Agent Upload Trigger */}
                  {isSelf && !isApproved && (
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="absolute inset-0 bg-slate-950/70 rounded-2xl flex flex-col items-center justify-center text-amber-400 opacity-0 group-hover/photo:opacity-100 transition cursor-pointer"
                    >
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-[8px] font-bold uppercase">Upload Photo</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="text-center space-y-0.5">
                  <h2 className="text-base font-black text-white">{user.name}</h2>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                    {jobPosition}
                  </div>
                  <p className="text-xs font-mono text-cyan-300 font-bold pt-0.5">Agent Code: {user.agentCode || 'N/A'}</p>
                </div>
              </div>

              {/* Card Metadata Details */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee ID:</span>
                  <span className="font-mono font-black text-amber-300">{empId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Team / Branch:</span>
                  <span className="font-bold text-slate-200">{user.teamName || 'Headquarters'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Joining Date:</span>
                  <span className="text-slate-300">{user.joiningDate || user.createdAt || '2026-01-01'}</span>
                </div>
              </div>

              {/* Owner Signature Block */}
              {isApproved ? (
                <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-2 text-center space-y-0.5">
                  <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">
                    Verified &amp; Approved by DD WORLD Management
                  </p>
                  {user.ownerSignatureUrl ? (
                    <img src={user.ownerSignatureUrl} alt="Owner Signature" className="h-7 mx-auto object-contain filter invert contrast-200" />
                  ) : (
                    <p className="text-[9px] text-amber-300 font-bold italic">Dushmantha Fernando (Owner)</p>
                  )}
                </div>
              ) : (
                <div className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest pt-1">
                  Tap Card to flip &amp; view QR Code
                </div>
              )}
            </div>
          ) : (
            /* BACK SIDE */
            <div className="space-y-4 relative z-10 flex flex-col h-full justify-between text-center">
              <div className="border-b border-slate-800 pb-2">
                <h4 className="text-xs font-black text-amber-400">OFFICIAL CORPORATE IDENTITY</h4>
                <p className="text-[9px] text-slate-400">DD WORLD MARKETING PVT LIMITED</p>
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQrModal(true);
                }}
                className="my-auto space-y-2 flex flex-col items-center cursor-pointer group/qr p-3 rounded-2xl hover:bg-slate-800/60 transition border border-transparent hover:border-amber-400/40"
              >
                <div className="w-28 h-28 rounded-2xl bg-white p-2 shadow-inner flex items-center justify-center group-hover/qr:scale-105 transition">
                  <QrCode className="w-24 h-24 text-slate-950" />
                </div>
                <div className="space-y-0.5 text-xs">
                  <p className="font-mono text-amber-300 font-bold">{empId}</p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                    🔍 Click QR to Scan &amp; Verify
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[10px] text-slate-400 text-left space-y-1">
                <p className="text-amber-400 font-bold">• Authorized Field Partner for Dialog Axiata PLC (Govimithuru #616# &amp; Sayuru #828# Services).</p>
                <p>• This Digital ID card is official property of DD World Marketing Pvt Limited.</p>
                <p>• Authorized for official field visits, merchant onboarding, and customer verification.</p>
                <div className="pt-1 border-t border-slate-800/80 text-[9px] text-slate-400 space-y-0.5">
                  <p>
                    <span className="text-slate-500 font-bold uppercase">Official Hotline:</span>{' '}
                    <span className="text-amber-300 font-mono font-bold">0767046094</span>
                  </p>
                  <p>
                    <span className="text-slate-500 font-bold uppercase">Corporate Email:</span>{' '}
                    <span className="text-slate-300 font-mono">d.d.worldmarketing1234@gmail.com</span>
                  </p>
                  <p className="text-slate-500 text-[8.5px]">
                    44/c, Galabodawatha, Niungama, Piliyandala
                  </p>
                </div>
              </div>

              <div className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                Tap Card to flip back
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-2">
        {!isApproved && !isOwner && (
          <div className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ID Card Presentation &amp; QR Verification Suspended (Audit Pending)</span>
          </div>
        )}

        {isApproved && (
          <button
            onClick={() => setShowQrModal(true)}
            className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
          >
            <QrCode className="w-4 h-4" /> Scan &amp; Verify QR
          </button>
        )}

        {/* PRINT BUTTON - STRICTLY FOR OWNER ONLY */}
        {isOwner && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Print (Owner)
          </button>
        )}
      </div>

      {/* QR Modal Overlay */}
      {showQrModal && <QrCodeVerificationModal user={user} onClose={() => setShowQrModal(false)} />}
    </div>
  );
};
