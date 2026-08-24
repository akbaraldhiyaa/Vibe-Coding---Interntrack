import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  title: "InternTrack — Platform Manajemen PKL Terintegrasi",
  description: "Platform manajemen Praktik Kerja Lapangan (PKL) untuk sekolah dan institusi pendidikan. Kelola siswa, absensi, jurnal, penilaian, dan sertifikat dalam satu sistem.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "InternTrack",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script src="/theme.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
