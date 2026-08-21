import React from "react";
import { GraduationCap, Award } from "lucide-react";

interface CertificateTemplateProps {
  studentName: string;
  nisn: string;
  dudiName: string;
  finalScore: number;
  grade: string;
  certificateNumber: string;
  issuedDate: string;
}

export const CertificateTemplate = React.forwardRef<HTMLDivElement, CertificateTemplateProps>(
  (
    { studentName, nisn, dudiName, finalScore, grade, certificateNumber, issuedDate },
    ref
  ) => {
    return (
      <div
        ref={ref}
        // A4 Landscape dimension at 96 DPI: 1123px width, 794px height
        className="w-[1123px] h-[794px] bg-white relative overflow-hidden flex flex-col items-center justify-center font-sans text-slate-800"
        style={{
          // We use absolute inline styles for some critical positioning to ensure html2canvas captures it well
          boxSizing: "border-box",
        }}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-4 bg-blue-600" />
        <div className="absolute bottom-0 left-0 w-full h-4 bg-indigo-600" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-50 opacity-50 border-[20px] border-blue-100" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-50 opacity-50 border-[20px] border-indigo-100" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] border-[4px] border-slate-100 rounded-3xl pointer-events-none" />

        {/* Content Container */}
        <div className="z-10 flex flex-col items-center w-full px-20">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-widest text-slate-900 uppercase">
                SMKN 3 Jakarta
              </h1>
              <p className="text-sm tracking-widest text-slate-500 uppercase">
                InternTrack — Program Praktik Kerja Lapangan
              </p>
            </div>
          </div>

          <p className="text-sm font-semibold tracking-widest text-blue-600 uppercase mb-4">
            Sertifikat Kompetensi
          </p>

          <h2 className="text-5xl font-serif text-slate-900 mb-6 text-center italic">
            Diberikan Kepada
          </h2>

          <div className="mb-6 w-full flex flex-col items-center border-b border-slate-300 pb-2">
            <h3 className="text-4xl font-bold text-slate-900 uppercase tracking-wide">
              {studentName}
            </h3>
            <p className="text-lg text-slate-500 mt-2">NISN: {nisn}</p>
          </div>

          <p className="text-lg text-slate-600 text-center max-w-3xl leading-relaxed mb-8">
            Telah menyelesaikan Praktik Kerja Lapangan (PKL) dengan baik di{" "}
            <span className="font-bold text-slate-900">{dudiName}</span> dan dinilai
            telah memenuhi standar kompetensi industri yang ditetapkan.
          </p>

          {/* Score Badge */}
          <div className="flex items-center gap-12 mb-12">
            <div className="flex flex-col items-center">
              <span className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-1">
                Nilai Akhir
              </span>
              <span className="text-3xl font-black text-slate-900">
                {finalScore.toFixed(1)}
              </span>
            </div>
            <div className="w-px h-16 bg-slate-200" />
            <div className="flex flex-col items-center">
              <span className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-1">
                Predikat
              </span>
              <div className="flex items-center gap-2">
                <Award className="w-8 h-8 text-amber-500" />
                <span className="text-4xl font-black text-slate-900">{grade}</span>
              </div>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="w-full flex justify-between items-end px-16 mt-8">
            <div className="flex flex-col items-center">
              <span className="text-sm text-slate-500 mb-8">Mengetahui,</span>
              <div className="w-48 border-b-2 border-slate-900 mb-2" />
              <span className="font-bold text-slate-900">Kepala Sekolah</span>
              <span className="text-xs text-slate-500">SMKN 3 Jakarta</span>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="text-sm text-slate-500 mb-1">
                Diterbitkan pada: {issuedDate}
              </span>
              <span className="text-xs text-slate-400 font-mono mb-4">
                No. {certificateNumber}
              </span>
              {/* QR Code Placeholder (could be a real QR code using qrcode.react in the future) */}
              <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-[8px] text-slate-400 text-center leading-tight">
                  VALIDATION
                  <br />
                  QR
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = "CertificateTemplate";
