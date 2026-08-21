import { QRCodeSVG } from "qrcode.react";
import { X, Download, Building2 } from "lucide-react";
import { useRef, useState } from "react";
import FocusLock from "react-focus-lock";
import html2canvas from "html2canvas";

interface DudiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  dudiName: string;
  qrPayload: string;
}

export default function DudiQrModal({ isOpen, onClose, dudiName, qrPayload }: DudiQrModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!qrRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(qrRef.current, { scale: 3, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `QR_Absensi_${dudiName.replace(/\s+/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download QR", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <FocusLock>
      <div 
        className="fixed inset-0 z-50 bg-[var(--modal-overlay)] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full max-w-sm bg-[var(--modal-bg)] border border-[var(--modal-border)] rounded-2xl p-6 shadow-2xl relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--card-subtitle)] cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] text-center">{dudiName}</h3>
            <p className="text-xs text-[var(--card-subtitle)] text-center mt-1">Scan kode ini untuk absensi masuk dan pulang.</p>
          </div>

          <div 
            ref={qrRef} 
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-inner flex flex-col items-center justify-center mx-auto w-fit mb-6"
          >
            <QRCodeSVG 
              value={qrPayload} 
              size={200}
              level={"H"}
              includeMargin={false}
              fgColor="#0F172A" // slate-900
            />
            <p className="mt-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase text-center w-full">InternTrack App</p>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? "Mengunduh..." : "Download QR Code"}</span>
          </button>
        </div>
      </div>
    </FocusLock>
  );
}
