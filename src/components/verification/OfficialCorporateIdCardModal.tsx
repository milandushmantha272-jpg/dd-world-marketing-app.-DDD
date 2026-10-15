import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Printer,
  Upload,
  User,
  CreditCard,
  Phone,
  MapPin,
  Building2,
  Award,
  Sparkles,
  Lock,
  Download,
  FileText,
} from 'lucide-react';
import { DdWorldLogo } from '../common/DdWorldLogo';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface OfficialCorporateIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string; // Optional: If owner is viewing a specific staff member's ID card
}

export const OfficialCorporateIdCardModal: React.FC<OfficialCorporateIdCardModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
}) => {
  const { currentUser } = useAuth();
  const { verifications, addOrUpdateVerification, users } = useData();

  // Determine whose ID card we are displaying
  const activeUser = targetUserId
    ? users.find((u) => u.id === targetUserId) || currentUser
    : currentUser;

  const verification = verifications.find((v) => v.userId === activeUser?.id);

  const [idPhoto, setIdPhoto] = useState<string>(
    verification?.idPhotoUrl ||
      activeUser?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  );

  const [idNumber, setIdNumber] = useState(
    verification?.idNumber || activeUser?.nic || '199518294021'
  );
  const [address, setAddress] = useState(
    verification?.address || 'No. 124, Kandy Road, Kadawatha, Sri Lanka'
  );
  const [phone, setPhone] = useState(
    verification?.contactNumber || activeUser?.mobile || '0771234567'
  );

  const isOwner = currentUser?.role === 'owner';
  const isVerifiedByOwner = verification?.status === 'verified';

  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !activeUser) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const photoUrl = reader.result.toString();
          setIdPhoto(photoUrl);

          // Update verification record
          addOrUpdateVerification({
            userId: activeUser.id,
            userName: activeUser.name,
            userRole: activeUser.role,
            agentCode: activeUser.agentCode,
            idNumber,
            address,
            contactNumber: phone,
            idPhotoUrl: photoUrl,
            gramaNiladhariReportUrl: verification?.gramaNiladhariReportUrl || 'Uploaded',
            policeReportUrl: verification?.policeReportUrl || 'Uploaded',
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApproveByOwner = () => {
    if (!isOwner) return;

    addOrUpdateVerification({
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      agentCode: activeUser.agentCode,
      idNumber,
      address,
      contactNumber: phone,
      idPhotoUrl: idPhoto,
      gramaNiladhariReportUrl: verification?.gramaNiladhariReportUrl || 'Verified',
      policeReportUrl: verification?.policeReportUrl || 'Verified',
      status: 'verified',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-6">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                DD WORLD ආයතනික නිල හැඳුනුම්පත
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  Corporate Staff ID
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dialog Govimithuru &amp; Sayuru Authorized Representative Identity Card
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

        {/* Verification Status Banner */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800">
          {isVerifiedByOwner ? (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Owner Permission OK: Personal Documents (Grama Niladhari &amp; Police Reports)
                  Verified &amp; Card Active
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2.5 py-1 rounded-full uppercase">
                Active ID
              </span>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-medium">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Personal Documents (Grama Niladhari &amp; Police Certificate) Pending Owner
                  Verification.
                </span>
              </div>

              {isOwner ? (
                <button
                  onClick={handleApproveByOwner}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition shrink-0 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Approve &amp; Activate ID Card
                </button>
              ) : (
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Awaiting Owner OK
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal Body / ID Card View */}
        <div className="p-6 space-y-6">
          {/* Printable Official ID Card Container */}
          <div
            ref={cardRef}
            className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl overflow-hidden max-w-md mx-auto text-white space-y-5"
          >
            {/* Background Hologram Graphic */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 1. Header: Company Name & Logo */}
            <div className="text-center border-b border-slate-800/80 pb-4 relative">
              <div className="flex items-center justify-center gap-3 mb-1">
                <DdWorldLogo size="sm" showText={false} />
                <div className="text-left">
                  <h1 className="text-lg font-black text-white tracking-wide flex items-center gap-1.5">
                    DD WORLD <span className="text-amber-400 font-extrabold text-xs">PVT LTD</span>
                  </h1>
                  <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider">
                    Official Corporate Staff Card
                  </p>
                </div>
              </div>

              {/* Authorized Service Subtitle */}
              <p className="text-[10px] text-slate-300 font-medium mt-1 leading-snug">
                Dialog Govimithuru (#616#) &amp; Sayuru (#828#) Authorized Field Agency
              </p>
            </div>

            {/* 2. Photo Upload & Display Section */}
            <div className="flex flex-col items-center justify-center relative">
              <div className="relative group">
                <img
                  src={idPhoto}
                  alt={activeUser.name}
                  className="w-32 h-36 object-cover rounded-2xl border-2 border-amber-400 shadow-xl"
                />

                {/* Upload Button Overlay */}
                <label className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-bold gap-1 p-2 text-center">
                  <Upload className="w-5 h-5 text-amber-400" />
                  <span>Photo Upload කරන්න</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {/* Verified Seal Badge */}
                {isVerifiedByOwner && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-lg border border-white">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider">
                  {activeUser.role.replace('_', ' ')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-[11px]">
                  {activeUser.agentCode || 'DD-STAFF'}
                </span>
              </div>
            </div>

            {/* 3. Employee Personal Details */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-[11px]">නිලධාරියාගේ නම (Name):</span>
                <span className="font-bold text-white text-right text-xs">{activeUser.name}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-[11px]">ජාතික හැඳුනුම්පත (NIC):</span>
                <span className="font-mono font-bold text-amber-300 text-right">{idNumber}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-[11px]">දුරකථන අංකය (Phone):</span>
                <span className="font-mono font-bold text-slate-200 text-right">{phone}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-400 text-[11px] shrink-0">ලිපිනය (Address):</span>
                <span className="font-medium text-slate-300 text-right text-[11px] max-w-[200px] leading-snug">
                  {address}
                </span>
              </div>
            </div>

            {/* 4. Company Description Statement */}
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-[10px] text-slate-300 leading-relaxed text-center space-y-1">
              <p className="font-bold text-amber-300">
                මෙය ඩයලොග් ආයතනයේ ගොවිමිතුරු (#616#) හා සයුරු (#828#) සේවා අලෙවි කරන ආයතනයකි.
              </p>
              <p className="text-slate-400 text-[9.5px]">
                DD WORLD PVT LTD • Dialog Axiata Authorized Field Agency • Sri Lanka
              </p>
            </div>

            {/* 5. Two Official Signatures */}
            <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-center text-[10px]">
              {/* Signature 1: Managing Director */}
              <div className="space-y-1">
                <div className="h-8 flex items-end justify-center font-serif italic text-amber-400 font-bold border-b border-slate-700 pb-1">
                  M. Dushmantha
                </div>
                <p className="font-bold text-slate-300">කළමනාකාර අධ්‍යක්ෂ</p>
                <p className="text-[9px] text-slate-500">Managing Director Signature</p>
              </div>

              {/* Signature 2: Authorized Officer */}
              <div className="space-y-1">
                <div className="h-8 flex items-end justify-center font-serif italic text-emerald-400 font-bold border-b border-slate-700 pb-1">
                  A. Officer (Verified)
                </div>
                <p className="font-bold text-slate-300">අනුමත නිලධාරී අත්සන</p>
                <p className="text-[9px] text-slate-500">Authorized Official Stamp</p>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="text-[9px] text-slate-500 text-center font-mono pt-1">
              ID Card Serial: DD-{activeUser.id.substring(0, 6).toUpperCase()} • 2026 Security Verified
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <label className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer transition flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>නව Photo එකක් Upload කරන්න</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>

            {isOwner ? (
              <button
                onClick={handlePrint}
                disabled={!isVerifiedByOwner}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>ID Card එක Print කරන්න (Owner Only)</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 font-bold italic">
                🔒 Print Permission: අයිතිකරුට (Owner) පමණි
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
