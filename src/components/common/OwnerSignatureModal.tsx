import React, { useRef, useState } from 'react';
import { PenTool, Upload, Trash2, CheckCircle2, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface OwnerSignatureModalProps {
  onClose: () => void;
  onSelectSignature?: (signatureUrl: string) => void;
}

export const OwnerSignatureModal: React.FC<OwnerSignatureModalProps> = ({ onClose, onSelectSignature }) => {
  const { ownerSignature, saveOwnerSignature } = useData();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  const [signaturePreview, setSignaturePreview] = useState<string>(ownerSignature || '');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drawing logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f59e0b'; // Amber-500 signature line
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        setSignaturePreview(canvas.toDataURL());
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignaturePreview('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const resultStr = event.target.result as string;
          setSignaturePreview(resultStr);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!signaturePreview) {
      alert('කරුණාකර අත්සනක් අඳින්න හෝ රූපයක් එක් කරන්න.');
      return;
    }
    saveOwnerSignature(signaturePreview);
    if (onSelectSignature) {
      onSelectSignature(signaturePreview);
    }
    setSuccessMsg('අයිතිකරුගේ ඩිජිටල් අත්සන සාර්ථකව සුරකියි!');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-amber-400 flex items-center gap-2">
            <PenTool className="w-5 h-5 text-amber-400" /> OWNER DIGITAL SIGNATURE MANAGEMENT
          </h2>
          <p className="text-xs text-slate-400">
            DD WORLD Management official approval signature for Digital Employee ID cards.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'draw' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PenTool className="w-4 h-4" /> Draw Signature
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition ${
              activeTab === 'upload' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" /> Upload Signature Image
          </button>
        </div>

        {/* Canvas or Upload area */}
        {activeTab === 'draw' ? (
          <div className="space-y-3">
            <div className="bg-slate-950 border-2 border-dashed border-amber-500/40 rounded-2xl p-2 relative flex flex-col items-center">
              <canvas
                ref={canvasRef}
                width={440}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 bg-slate-950 rounded-xl cursor-crosshair touch-none"
              />
              <span className="absolute bottom-2 left-4 text-[10px] text-slate-500 font-bold uppercase pointer-events-none">
                Draw Signature Here
              </span>
            </div>
            <button
              onClick={clearCanvas}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition ml-auto"
            >
              <Trash2 className="w-4 h-4" /> Clear Canvas
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block bg-slate-950 border-2 border-dashed border-amber-500/40 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition">
              <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-300 block">Click to select Official Signature PNG/JPG</span>
              <span className="text-[10px] text-slate-500 block mt-1">Transparent PNG recommended</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {signaturePreview && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                <p className="text-[10px] text-slate-400 font-bold mb-1">Uploaded Signature Preview:</p>
                <img src={signaturePreview} alt="Signature Preview" className="h-16 mx-auto object-contain filter invert" />
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> {successMsg}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/20"
          >
            Save Signature &amp; Apply
          </button>
        </div>
      </div>
    </div>
  );
};
