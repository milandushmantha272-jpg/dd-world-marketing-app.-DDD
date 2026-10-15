import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  User,
  CreditCard,
  MapPin,
  Phone,
  Image as ImageIcon,
  Check,
  Printer,
  Eye,
  FileCheck,
} from 'lucide-react';
import { OfficialCorporateIdCardModal } from './OfficialCorporateIdCardModal';

interface EmployeeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmployeeVerificationModal: React.FC<EmployeeVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { verifications, addOrUpdateVerification, updateUserProfile } = useData();

  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [idPhotoUrl, setIdPhotoUrl] = useState('');
  const [gramaNiladhariReportUrl, setGramaNiladhariReportUrl] = useState('');
  const [gramaReportName, setGramaReportName] = useState('');
  const [policeReportUrl, setPoliceReportUrl] = useState('');
  const [policeReportName, setPoliceReportName] = useState('');
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<{ title: string; content: string; name: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const existing = verifications.find((v) => v.userId === currentUser?.id);

  useEffect(() => {
    if (existing) {
      setIdNumber(existing.idNumber || currentUser?.nic || '');
      setAddress(existing.address || '');
      setContactNumber(existing.contactNumber || currentUser?.mobile || '');
      setIdPhotoUrl(existing.idPhotoUrl || currentUser?.avatar || '');
      setGramaNiladhariReportUrl(existing.gramaNiladhariReportUrl || currentUser?.gramaNiladhariReportUrl || '');
      setGramaReportName(existing.gramaReportName || currentUser?.gramaReportName || 'Grama_Niladhari_Report.pdf');
      setPoliceReportUrl(existing.policeReportUrl || currentUser?.policeReportUrl || '');
      setPoliceReportName(existing.policeReportName || currentUser?.policeReportName || 'Police_Clearance_Report.pdf');
    } else if (currentUser) {
      setIdNumber(currentUser.nic || '');
      setAddress('');
      setContactNumber(currentUser.mobile && currentUser.mobile !== 'නැත' ? currentUser.mobile : '');
      setIdPhotoUrl(currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
      setGramaNiladhariReportUrl(currentUser.gramaNiladhariReportUrl || '');
      setGramaReportName(currentUser.gramaReportName || '');
      setPoliceReportUrl(currentUser.policeReportUrl || '');
      setPoliceReportName(currentUser.policeReportName || '');
    }
  }, [existing, currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleGramaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGramaReportName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setGramaNiladhariReportUrl(reader.result.toString());
          setStatusMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePoliceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPoliceReportName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPoliceReportUrl(reader.result.toString());
          setStatusMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setIdPhotoUrl(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!idNumber.trim() || !address.trim() || !contactNumber.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'කරුණාකර ඔබගේ ජාතික හැඳුනුම්පත් අංකය, ස්ථිර ලිපිනය සහ දුරකථන අංකය ඇතුළත් කරන්න.',
      });
      return;
    }

    if (!gramaNiladhariReportUrl.trim() || !policeReportUrl.trim()) {
      setStatusMessage({
        type: 'error',
        text: '⚠️ අනිවාර්යයි: කරුණාකර "Grama Niladhari Character Report" සහ "Police Clearance Report" ලේඛන දෙකම Upload කරන්න.',
      });
      return;
    }

    const currentGramaName = gramaReportName || 'Grama_Niladhari_Report.pdf';
    const currentPoliceName = policeReportName || 'Police_Clearance_Report.pdf';

    // Link directly to user's profile in database
    updateUserProfile(currentUser.id, {
      nic: idNumber,
      mobile: contactNumber,
      avatar: idPhotoUrl,
      gramaNiladhariReportUrl,
      policeReportUrl,
      gramaReportName: currentGramaName,
      policeReportName: currentPoliceName,
      gramaReportUploadedAt: new Date().toISOString().split('T')[0],
      policeReportUploadedAt: new Date().toISOString().split('T')[0],
    });

    const res = addOrUpdateVerification({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      agentCode: currentUser.agentCode,
      idNumber,
      address,
      contactNumber,
      idPhotoUrl:
        idPhotoUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      gramaNiladhariReportUrl,
      policeReportUrl,
      gramaReportName: currentGramaName,
      policeReportName: currentPoliceName,
    });

    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold flex items-center gap-2">
                අනිවාර්ය සේවක ලියාපදිංචිය හා වාර්තා
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  Mandatory KYC
                </span>
              </h3>
              <p className="text-xs text-blue-100">
                Staff Identity Verification - Grama Niladhari &amp; Police Clearance Records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status indicator banner */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">සේවක නාමය:</span>
            <span className="font-bold text-slate-200">{currentUser.name}</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 font-semibold uppercase text-[10px]">
              {currentUser.role === 'team_leader'
                ? 'Team Leader'
                : currentUser.role === 'owner'
                ? 'Owner'
                : `Agent ${currentUser.agentCode || ''}`}
            </span>
          </div>

          <div>
            {existing?.status === 'verified' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                තහවුරු කර ඇත (Verified)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                තවම සම්පූර්ණ කර නැත (Pending)
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {statusMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ID Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                ජාතික හැඳුනුම්පත් අංකය (NIC / ID Number): *
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. 951234567V / 200012345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold"
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                දුරකථන අංකය (Contact Number): *
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="0771234567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              ස්ථිර ලිපිනය (Permanent Address): *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. No. 12/B, Main Street, Kurunegala"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* ID Photo & Document Upload Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* 1. ID Photo */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                ID Photo (සේවක ඡායාරූපය)
              </span>
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-700 border-2 border-blue-500/50">
                {idPhotoUrl ? (
                  <img src={idPhotoUrl} alt="ID preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Photo
                  </div>
                )}
              </div>
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-[11px] border border-blue-500/30 transition w-full">
                <Upload className="w-3 h-3 inline mr-1" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 2. Grama Niladhari Certificate */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  ග්‍රාමසේවා සහතිකය *
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Grama Niladhari Character Certificate (Mandatory)
                </p>
              </div>

              {gramaNiladhariReportUrl ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold space-y-1.5">
                  <div className="flex items-center gap-1.5 break-all">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{gramaReportName || 'Grama_Niladhari_Report.pdf'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setViewingDoc({
                        title: 'ග්‍රාම නිලධාරී චරිත වාර්තාව (Grama Niladhari Character Certificate)',
                        content: gramaNiladhariReportUrl,
                        name: gramaReportName || 'Grama_Niladhari_Report.pdf',
                      })
                    }
                    className="w-full py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3 h-3" /> Preview Document
                  </button>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-slate-900/80 text-rose-400 text-[11px] text-center font-semibold">
                  ⚠️ අනිවාර්යයි (Upload Required)
                </div>
              )}

              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] border border-amber-500/30 transition text-center block">
                <Upload className="w-3 h-3 inline mr-1" />
                {gramaNiladhariReportUrl ? 'Re-Upload GN Report' : 'Upload GN Report *'}
                <input
                  type="file"
                  onChange={handleGramaFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* 3. Police Clearance Certificate */}
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  පොලිස් රිපෝට් එක *
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Police Clearance Certificate (Mandatory)
                </p>
              </div>

              {policeReportUrl ? (
                <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold space-y-1.5">
                  <div className="flex items-center gap-1.5 break-all">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{policeReportName || 'Police_Clearance_Report.pdf'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setViewingDoc({
                        title: 'පොලිස් නිෂ්කාශන වාර්තාව (Police Clearance Certificate)',
                        content: policeReportUrl,
                        name: policeReportName || 'Police_Clearance_Report.pdf',
                      })
                    }
                    className="w-full py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3 h-3" /> Preview Document
                  </button>
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-slate-900/80 text-rose-400 text-[11px] text-center font-semibold">
                  ⚠️ අනිවාර්යයි (Upload Required)
                </div>
              )}

              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-[11px] border border-purple-500/30 transition text-center block">
                <Upload className="w-3 h-3 inline mr-1" />
                {policeReportUrl ? 'Re-Upload Police Report' : 'Upload Police Report *'}
                <input
                  type="file"
                  onChange={handlePoliceFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit / Save & ID Card Buttons */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowIdCardModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>ආයතනික ID Card එක බලන්න (Official ID)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                වසන්න (Close)
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                තොරතුරු සහ සහතික සුරකින්න (Save &amp; Verify)
              </button>
            </div>
          </div>
        </form>

        {/* Document Viewer Modal */}
        {viewingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-black text-white">{viewingDoc.title}</h3>
                    <p className="text-[11px] text-slate-400">{viewingDoc.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-auto rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[300px]">
                {viewingDoc.content.startsWith('data:image/') ? (
                  <img
                    src={viewingDoc.content}
                    alt={viewingDoc.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="text-center space-y-3 p-6">
                    <FileText className="w-16 h-16 text-amber-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">{viewingDoc.name}</h4>
                    <p className="text-xs text-emerald-400 font-mono">
                      ✓ Document file uploaded and linked to employee record in secure database.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                >
                  Close Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Official Corporate ID Card Modal */}
        <OfficialCorporateIdCardModal
          isOpen={showIdCardModal}
          onClose={() => setShowIdCardModal(false)}
        />
      </div>
    </div>
  );
};

