import { X, ScanLine, AlertCircle } from "lucide-react";
import FocusLock from "react-focus-lock";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (dudiId: string, dudiName: string) => void;
}

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }: QrScannerModalProps) {
  const { dudiList } = useInternTrackStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScan = (result: any) => {
    if (result && result.length > 0) {
      const scannedValue = result[0].rawValue;
      // We expect the QR code to contain the DUDI qrCode payload
      const matchedDudi = dudiList.find((d) => d.qrCode === scannedValue);

      if (matchedDudi) {
        onScanSuccess(matchedDudi.id, matchedDudi.name);
      } else {
        setErrorMsg("QR Code tidak dikenali atau bukan QR DUDI yang valid.");
        setTimeout(() => setErrorMsg(null), 3000);
      }
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
        <div className="w-full max-w-sm bg-[var(--modal-bg)] border border-[var(--modal-border)] rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--surface-alt)] text-[var(--card-subtitle)] cursor-pointer transition z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center mb-6 w-full mt-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
              <ScanLine className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] text-center">Scan QR Kehadiran</h3>
            <p className="text-xs text-[var(--card-subtitle)] text-center mt-1">Arahkan kamera ke QR Code DUDI Anda.</p>
          </div>

          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black relative border-2 border-emerald-500/30">
            <Scanner
              onScan={handleScan}
              styles={{ container: { width: "100%", height: "100%" } }}
              components={{ finder: false }}
            />
            
            {/* Custom Finder Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-emerald-500 rounded-2xl relative shadow-[0_0_0_999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-500 -mt-1 -ml-1 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-500 -mt-1 -mr-1 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-500 -mb-1 -ml-1 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-500 -mb-1 -mr-1 rounded-br-lg" />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 flex items-start gap-2 w-full text-left">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-400 leading-snug">{errorMsg}</p>
            </div>
          )}

          <p className="mt-6 text-[10px] text-[var(--card-subtitle)] text-center w-full">
            Pastikan pencahayaan cukup dan QR Code terlihat jelas.
          </p>
        </div>
      </div>
    </FocusLock>
  );
}
