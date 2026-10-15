import React, { useState, useRef } from 'react';
import { CreditCard, ShieldCheck, Printer, Download, Upload, Users, CheckCircle2, Award, Building2, MapPin, Phone, Lock } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';

export const EmployeeIdCreatorPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { users, verifications, addOrUpdateVerification } = useData();

  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || users[0]?.id || '');

  const activeUser = users.find((u) => u.id === selectedUserId) || currentUser || users[0];
  const userVerification = verifications.find((v) => v.userId === activeUser?.id);

  const [idPhoto, setIdPhoto] = useState<string>(
    userVerification?.idPhotoUrl ||
      activeUser?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
  );

  const [nicNumber, setNicNumber] = useState<string>(
    userVerification?.idNumber || activeUser?.nic || '199518294021'
  );
  const [address, setAddress] = useState<string>(
    userVerification?.address || 'No. 124, Kandy Road, Kadawatha, Sri Lanka'
  );
  const [phone, setPhone] = useState<string>(
    userVerification?.contactNumber || activeUser?.mobile || '0771234567'
  );
  const [designation, setDesignation] = useState<string>(
    activeUser?.role === 'owner'
      ? 'Managing Director & Owner'
      : activeUser?.role === 'team_leader'
      ? 'District Team Leader'
      : 'Field Executive Agent'
  );

  const cardRef = useRef<HTMLDivElement>(null);

  // Sync state when selected user changes
  const handleUserSelect = (uId: string) => {
    setSelectedUserId(uId);
    const target = users.find((u) => u.id === uId);
    if (target) {
      const v = verifications.find((ver) => ver.userId === target.id);
      setIdPhoto(v?.idPhotoUrl || target.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
      setNicNumber(v?.idNumber || target.nic || '199518294021');
      setAddress(v?.address || 'Colombo, Sri Lanka');
      setPhone(v?.contactNumber || target.mobile || '0771234567');
      setDesignation(
        target.role === 'owner'
          ? 'Managing Director & Owner'
          : target.role === 'team_leader'
          ? 'District Team Leader'
          : 'Field Executive Agent'
      );
    }
  };

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

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAndApprove = () => {
    if (!activeUser) return;
    addOrUpdateVerification({
      userId: activeUser.id,
      userName: activeUser.name,
      userRole: activeUser.role,
      agentCode: activeUser.agentCode,
      idNumber: nicNumber,
      address,
      contactNumber: phone,
      idPhotoUrl: idPhoto,
      gramaNiladhariReportUrl: 'Verified',
      policeReportUrl: 'Verified',
      status: 'verified',
    });
    alert(`සේවක ${activeUser.name} ගේ නිල ID Card එක සාර්ථකව Verified කර පද්ධතියේ සුරැකිණි!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase">
              Corporate ID Card Studio
            </span>
            <span className="text-xs text-slate-400">Official Generation Page</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-blue-400" />
            නිල සේවක හැඳුනුම්පත් නිර්මාණ පිටුව (Official Employee ID Card Creator)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            DD WORLD SECURITY (PVT) LTD සේවකයින් සඳහා නිල Smart ID Cards නිර්මාණය, ඡායාරූප යාවත්කාලීන කිරීම සහ මුද්‍රණය.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            ID Card එක මුද්‍රණය කරන්න (Print)
          </button>
          <button
            onClick={handleSaveAndApprove}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve &amp; Save Verified ID
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Employee Selector */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Users className="w-5 h-5 text-blue-400" />
            1. සේවකයා තෝරන්න සහ තොරතුරු ඇතුලත් කරන්න
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">සේවකයා තෝරන්න (Select Staff Member)</label>
              <select
                value={selectedUserId}
                onChange={(e) => handleUserSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.toUpperCase()}) - [{u.agentCode || 'ID-00'}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">තනතුර (Designation Title)</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">ජාතික හැඳුනුම්පත් අංකය (NIC Number)</label>
              <input
                type="text"
                value={nicNumber}
                onChange={(e) => setNicNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">දුරකථන අංකය (Mobile)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">ලිපිනය (Address)</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs font-bold rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">ඡායාරූපය වෙනස් කරන්න (Upload Photo)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: ID Card Live Visual Preview (Front & Back) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center space-y-6">
          <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-slate-800 pb-3 w-full">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            2. සජීවී ID Card පූර්වදර්ශනය (Live Card Preview)
          </h3>

          <div ref={cardRef} className="space-y-6 max-w-sm w-full">
            {/* FRONT OF ID CARD */}
            <div className="relative w-full h-[480px] rounded-3xl bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 border-2 border-blue-500/50 shadow-2xl p-6 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl"></div>

              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-blue-500/30 pb-3 z-10">
                <div>
                  <h4 className="text-sm font-black text-white tracking-wider">DD WORLD MARKETING</h4>
                  <p className="text-[9px] text-blue-300 font-bold uppercase">Official Identification</p>
                </div>
                <img
                  src="/official-logo.png"
                  alt="DD World Logo"
                  className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-lg border border-blue-400/50"
                />
              </div>

              {/* Staff Photo */}
              <div className="flex flex-col items-center justify-center my-2 z-10">
                <div className="relative">
                  <img
                    src={idPhoto}
                    alt="Staff Photo"
                    className="w-28 h-28 rounded-2xl object-cover border-2 border-blue-400 shadow-xl"
                  />
                  <span className="absolute -bottom-2 right-1/2 translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px] uppercase shadow-md">
                    VERIFIED
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-3 text-center">{activeUser.name}</h3>
                <p className="text-xs text-amber-300 font-bold text-center mt-0.5">{designation}</p>
                <div className="mt-1 px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[10px] font-mono text-blue-200 font-bold">
                  Code: {activeUser.agentCode || 'DD-001'}
                </div>
              </div>

              {/* Details footer */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-[11px] space-y-1 z-10">
                <div className="flex justify-between">
                  <span className="text-slate-400">NIC No:</span>
                  <span className="text-white font-mono font-bold">{nicNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile:</span>
                  <span className="text-white font-bold">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">District:</span>
                  <span className="text-blue-300 font-bold">{activeUser.districtSi || 'Colombo'}</span>
                </div>
              </div>

              {/* Bottom Security Stripe */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 pt-2 border-t border-slate-800 z-10">
                <span>Issuing Auth: Director Board</span>
                <span className="text-amber-400 font-bold">Expires: Dec 2028</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
