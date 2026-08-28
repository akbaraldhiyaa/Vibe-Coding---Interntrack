"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings,
  User,
  Mail,
  MessageCircle,
  Building,
  GraduationCap,
  Save,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  Lock,
  Eye,
  EyeOff,
  AtSign,
  Camera,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
import { useInternTrackStore } from "@/shared/store/useInternTrackStore";
import { getUserProfile, updateUserProfileDB, uploadProfilePicture } from "@/app/actions/user";
import {
  linkGoogleAccount,
  addPasswordCredentials,
  unlinkGoogleAccount,
  unlinkPasswordCredentials,
  changePassword,
} from "@/app/actions/auth";
import { auth as firebaseAuth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import DeleteAccountSection from "@/components/settings/DeleteAccountSection";

export default function PengaturanView() {
  const { addToast, userProfile, updateUserProfile } = useInternTrackStore();

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [institution, setInstitution] = useState("SMKN 3 Jakarta");
  const [department, setDepartment] = useState("");

  // Notifications
  const [emailNotif, setEmailNotif] = useState(true);
  const [weeklyNotif, setWeeklyNotif] = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connected accounts state — driven by backend
  const [linkedProviders, setLinkedProviders] = useState<string[]>([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  // Setup Password form (for Google-first users)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordFormError, setPasswordFormError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Change Password form
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [changeNewPassword, setChangeNewPassword] = useState("");
  const [changeConfirmPassword, setChangeConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showChangeNewPw, setShowChangeNewPw] = useState(false);
  const [showChangeConfirmPw, setShowChangeConfirmPw] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Unlink Modals
  const [unlinkGoogleModalOpen, setUnlinkGoogleModalOpen] = useState(false);
  const [unlinkPasswordModalOpen, setUnlinkPasswordModalOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const sanitizeWa = (val?: string | null) => {
    if (!val || val === "-") return "";
    return val;
  };

  const populateForm = useCallback((data: {
    fullName: string;
    email: string;
    whatsapp?: string;
    institution?: string;
    department?: string;
    notificationEmail?: boolean;
    weeklySummary?: boolean;
    linkedProviders?: string[];
    hasPassword?: boolean;
    username?: string | null;
    avatar?: string | null;
  }) => {
    setFullName(data.fullName || "");
    setEmail(data.email || "");
    setWhatsapp(sanitizeWa(data.whatsapp));
    setInstitution(data.institution || "SMKN 3 Jakarta");
    setDepartment(data.department || "");
    setEmailNotif(data.notificationEmail ?? true);
    setWeeklyNotif(data.weeklySummary ?? false);
    setLinkedProviders(data.linkedProviders ?? []);
    setHasPassword(data.hasPassword ?? false);
    setUsername(data.username ?? null);
    setAvatarUrl(data.avatar ?? null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile(userProfile?.email);
        if (!isMounted) return;
        if (res.success && res.data) {
          populateForm(res.data);
          updateUserProfile(res.data);
          setFetchError(false);
        } else if (userProfile) {
          populateForm(userProfile);
          setFetchError(false);
        } else {
          setFetchError(true);
        }
      } catch {
        if (!isMounted) return;
        if (userProfile) {
          populateForm(userProfile);
          setFetchError(false);
        } else {
          setFetchError(true);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFullName = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setFullNameError("Nama lengkap wajib diisi.");
      return false;
    }
    if (trimmed.length < 2) {
      setFullNameError("Nama lengkap minimal 2 karakter.");
      return false;
    }
    setFullNameError("");
    return true;
  };

  const validateEmail = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setEmailError("Email akun wajib diisi.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Format email tidak valid.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateWhatsApp = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setWhatsappError("");
      return true;
    }
    const waRegex = /^(?:\+62|62|0)8[1-9][0-9]{7,11}$/;
    if (!waRegex.test(trimmed)) {
      setWhatsappError(
        "Format nomor WhatsApp tidak valid. Contoh: 08123456789 atau +628123456789"
      );
      return false;
    }
    setWhatsappError("");
    return true;
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFullName(fullName) || !validateEmail(email) || !validateWhatsApp(whatsapp)) {
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp.trim(),
        institution: institution.trim(),
        department: department.trim(),
        notificationEmail: emailNotif,
        weeklySummary: weeklyNotif,
      };
      const res = await updateUserProfileDB(userProfile?.email || email, payload);
      if (res.success && res.data) {
        updateUserProfile(res.data);
        populateForm(res.data);
        addToast({
          type: "success",
          title: "Berhasil",
          message: "Data diri dan preferensi Anda telah disimpan.",
        });
      } else {
        addToast({
          type: "error",
          title: "Gagal",
          message: res.error || "Gagal menyimpan perubahan.",
        });
      }
    } catch (error: any) {
      addToast({
        type: "error",
        title: "Kesalahan",
        message: error?.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast({ type: "error", title: "File Terlalu Besar", message: "Ukuran maksimal 2MB." });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast({ type: "error", title: "Format Tidak Didukung", message: "Gunakan JPG, PNG, atau WEBP." });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadProfilePicture(formData);
      if (res.success && res.avatarUrl) {
        setAvatarUrl(res.avatarUrl);
        addToast({ type: "success", title: "Berhasil", message: "Foto profil telah diperbarui." });
        if (userProfile) updateUserProfile({ ...userProfile, avatar: res.avatarUrl });
      } else {
        addToast({ type: "error", title: "Gagal", message: res.error || "Gagal mengunggah foto." });
      }
    } catch {
      addToast({ type: "error", title: "Kesalahan", message: "Terjadi kesalahan pada server." });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLinkGoogle = async () => {
    setIsLinkingGoogle(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();
      const linkRes = await linkGoogleAccount(idToken);
      if (linkRes.success) {
        setLinkedProviders((prev) => prev.includes("google") ? prev : [...prev, "google"]);
        addToast({ type: "success", title: "Berhasil", message: "Akun Google Anda berhasil ditautkan." });
      } else {
        addToast({ type: "error", title: "Gagal Menautkan", message: linkRes.error || "Gagal menautkan akun Google." });
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        addToast({ type: "error", title: "Kesalahan", message: "Gagal menautkan Google." });
      }
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    setIsUnlinking(true);
    try {
      const res = await unlinkGoogleAccount();
      if (res.success) {
        setLinkedProviders(prev => prev.filter(p => p !== "google"));
        setUnlinkGoogleModalOpen(false);
        addToast({ type: "success", title: "Diputuskan", message: "Akun Google berhasil diputuskan." });
      } else {
        addToast({ type: "error", title: "Gagal Memutuskan", message: res.error || "Gagal memutuskan Google." });
      }
    } catch {
      addToast({ type: "error", title: "Kesalahan", message: "Gagal memutuskan Google." });
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleUnlinkPassword = async () => {
    setIsUnlinking(true);
    try {
      const res = await unlinkPasswordCredentials();
      if (res.success) {
        setHasPassword(false);
        setUsername(null);
        setUnlinkPasswordModalOpen(false);
        addToast({ type: "success", title: "Diputuskan", message: "Kredensial password berhasil dihapus." });
      } else {
        addToast({ type: "error", title: "Gagal Memutuskan", message: res.error || "Gagal memutuskan password." });
      }
    } catch {
      addToast({ type: "error", title: "Kesalahan", message: "Gagal memutuskan password." });
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleSavePasswordCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFormError("");

    if (!newUsername || !/^[a-z0-9_]{3,20}$/.test(newUsername.trim())) {
      setPasswordFormError("Username harus 3-20 karakter (huruf kecil, angka, _).");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordFormError("Kata sandi minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFormError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await addPasswordCredentials({
        username: newUsername.trim().toLowerCase(),
        password: newPassword,
      });
      if (res.success) {
        setHasPassword(true);
        setUsername(newUsername.trim().toLowerCase());
        setShowPasswordForm(false);
        setNewUsername("");
        setNewPassword("");
        setConfirmPassword("");
        addToast({ type: "success", title: "Berhasil", message: "Kredensial berhasil ditambahkan." });
      } else {
        setPasswordFormError(res.error || "Gagal menyimpan kredensial.");
      }
    } catch (err: any) {
      setPasswordFormError(err?.message || "Terjadi kesalahan pada server.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError("");
    
    if (!currentPassword) {
      setChangePasswordError("Masukkan password saat ini.");
      return;
    }
    if (!changeNewPassword || changeNewPassword.length < 6) {
      setChangePasswordError("Password baru minimal 6 karakter.");
      return;
    }
    if (changeNewPassword !== changeConfirmPassword) {
      setChangePasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, changeNewPassword);
      if (res.success) {
        addToast({ type: "success", title: "Berhasil", message: "Password berhasil diubah." });
        setShowChangePasswordForm(false);
        setCurrentPassword("");
        setChangeNewPassword("");
        setChangeConfirmPassword("");
      } else {
        setChangePasswordError(res.error || "Gagal mengganti password.");
      }
    } catch {
      setChangePasswordError("Gagal mengganti password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isGoogleLinked = linkedProviders.includes("google");
  const isPasswordLinked = hasPassword;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <p className="text-xs text-[var(--card-subtitle)] font-medium">Memuat pengaturan...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <AlertTriangle className="w-10 h-10 text-red-500" />
        <p className="text-sm font-semibold text-[var(--foreground)]">Gagal memuat pengaturan.</p>
        <button
          onClick={() => window.location.reload()}
          className="py-2 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[var(--foreground)] transition"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl relative">
      {/* HEADER */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--card-title)] flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Pengaturan &amp; Data Diri</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--card-subtitle)] mt-1">
          Kelola informasi profil, foto, akun terhubung, keamanan, dan preferensi notifikasi.
        </p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* SECTION 1: PROFIL & FOTO */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-6">
          <h2 className="text-base font-bold text-[var(--card-title)] border-b border-[var(--card-border)] pb-3">
            Profil
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg, image/png, image/webp"
                onChange={handleUploadAvatar}
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[var(--foreground)]">Ganti Foto Profil</h3>
              <p className="text-xs text-[var(--card-subtitle)]">Format: JPG, PNG, WEBP. Maks 2MB.</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Pilih Foto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-4">
            {/* NAMA LENGKAP */}
            <div>
              <label htmlFor="input-fullName" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fullNameError) validateFullName(e.target.value);
                  }}
                  onBlur={() => validateFullName(fullName)}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full token-input pl-10 pr-3.5 py-2.5 ${fullNameError ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              {fullNameError && <p className="text-[11px] text-red-500 font-medium mt-1">{fullNameError}</p>}
            </div>

            {/* EMAIL AKUN */}
            <div>
              <label htmlFor="input-email" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Email Akun <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={() => validateEmail(email)}
                  placeholder="contoh@smkn3.sch.id"
                  className={`w-full token-input pl-10 pr-3.5 py-2.5 ${emailError ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              {emailError && <p className="text-[11px] text-red-500 font-medium mt-1">{emailError}</p>}
            </div>

            {/* NOMOR WHATSAPP */}
            <div>
              <label htmlFor="input-whatsapp" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <input
                  id="input-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => {
                    setWhatsapp(e.target.value);
                    if (whatsappError) validateWhatsApp(e.target.value);
                  }}
                  onBlur={() => validateWhatsApp(whatsapp)}
                  placeholder="Contoh: 08123456789"
                  className={`w-full token-input pl-10 pr-3.5 py-2.5 text-xs ${whatsappError ? "border-red-500 focus:border-red-500" : ""}`}
                />
              </div>
              {whatsappError && <p className="text-[11px] text-red-500 font-medium mt-1">{whatsappError}</p>}
            </div>

            {/* SEKOLAH / INSTANSI (READ-ONLY / SYSTEM CONTROLLED) */}
            <div>
              <label htmlFor="input-institution" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Sekolah / Instansi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="input-institution"
                  type="text"
                  readOnly
                  tabIndex={-1}
                  aria-readonly="true"
                  value={institution || "SMKN 3 Jakarta"}
                  onKeyDown={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[var(--surface-alt)] text-[var(--card-subtitle)] border border-[var(--card-border)] cursor-not-allowed select-none focus:outline-none focus:ring-0 focus:border-[var(--card-border)] shadow-none"
                />
              </div>
              <p className="text-[11px] text-[var(--card-subtitle)] mt-1">
                Sekolah ditentukan oleh sistem.
              </p>
            </div>

            {/* JURUSAN / PROGRAM KEAHLIAN */}
            <div className="sm:col-span-2">
              <label htmlFor="input-department" className="block font-semibold text-[var(--foreground)] mb-1.5">
                Jurusan / Program Keahlian
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <input
                  id="input-department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  className="w-full token-input pl-10 pr-3.5 py-2.5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PREFERENSI NOTIFIKASI */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
          <h2 className="text-base font-bold text-[var(--card-title)] border-b border-[var(--card-border)] pb-3">
            Preferensi Notifikasi
          </h2>

          <div className="space-y-3">
            {/* NOTIFIKASI EMAIL TOGGLE */}
            <div
              role="switch"
              aria-checked={emailNotif}
              tabIndex={0}
              onClick={() => setEmailNotif(!emailNotif)}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") setEmailNotif(!emailNotif); }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] flex items-center justify-between gap-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div>
                <h3 className="text-xs font-bold text-[var(--card-title)]">Notifikasi Email</h3>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">Pemberitahuan penting seperti verifikasi jurnal dan absensi.</p>
              </div>
              <div className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${emailNotif ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
              </div>
            </div>

            {/* RINGKASAN MINGGUAN TOGGLE */}
            <div
              role="switch"
              aria-checked={weeklyNotif}
              tabIndex={0}
              onClick={() => setWeeklyNotif(!weeklyNotif)}
              onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") setWeeklyNotif(!weeklyNotif); }}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] flex items-center justify-between gap-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div>
                <h3 className="text-xs font-bold text-[var(--card-title)]">Ringkasan Mingguan</h3>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">Rekap progres PKL setiap Senin pagi.</p>
              </div>
              <div className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${weeklyNotif ? "bg-blue-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"}`}>
                <div className="w-5 h-5 rounded-full bg-white shadow-md transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className={`py-3 px-6 rounded-xl bg-[#1E3A8A] hover:bg-[#122353] active:scale-[0.99] text-white text-xs font-semibold flex items-center gap-2 shadow-md transition ${isSaving ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Menyimpan...</span></> : <><Save className="w-4 h-4" /><span>Simpan Perubahan</span></>}
          </button>
        </div>
      </form>

      {/* SECTION 3: KEAMANAN */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
        <h2 className="text-base font-bold text-[var(--card-title)] border-b border-[var(--card-border)] pb-3">
          Keamanan
        </h2>
        {isPasswordLinked ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-[var(--card-title)]">Password Akun</h3>
                <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">Password Anda telah diatur dan aktif.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowChangePasswordForm(v => !v)}
                className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors self-start sm:self-auto"
              >
                {showChangePasswordForm ? "Batal" : "Ganti Password"}
              </button>
            </div>
            {showChangePasswordForm && (
              <form onSubmit={handleChangePassword} className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">
                {changePasswordError && (
                  <p className="text-[11px] text-red-500 font-medium bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                    {changePasswordError}
                  </p>
                )}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">Password Saat Ini</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-3.5 h-3.5 text-slate-400" /></div>
                    <input type={showCurrentPw ? "text" : "password"} required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full token-input pl-8 pr-8 py-2 text-xs" />
                    <button type="button" onClick={() => setShowCurrentPw(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">Password Baru</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-3.5 h-3.5 text-slate-400" /></div>
                    <input type={showChangeNewPw ? "text" : "password"} required value={changeNewPassword} onChange={e => setChangeNewPassword(e.target.value)} className="w-full token-input pl-8 pr-8 py-2 text-xs" />
                    <button type="button" onClick={() => setShowChangeNewPw(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showChangeNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-3.5 h-3.5 text-slate-400" /></div>
                    <input type={showChangeConfirmPw ? "text" : "password"} required value={changeConfirmPassword} onChange={e => setChangeConfirmPassword(e.target.value)} className="w-full token-input pl-8 pr-8 py-2 text-xs" />
                    <button type="button" onClick={() => setShowChangeConfirmPw(v => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showChangeConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={isChangingPassword} className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-60">
                    {isChangingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isChangingPassword ? "Menyimpan..." : "Simpan"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400">Akun Anda Belum Memiliki Password</h3>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">Anda login menggunakan Google. Silakan buat Username & Password di bagian "Akun Terhubung" di bawah untuk mengatur password.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: AKUN TERHUBUNG */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-[var(--card-shadow)] space-y-4">
        <h2 className="text-base font-bold text-[var(--card-title)] border-b border-[var(--card-border)] pb-3">
          Akun Terhubung
        </h2>

        <div className="space-y-3">
          {/* GOOGLE */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-[var(--card-title)]">Google</h3>
                {isGoogleLinked ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 shrink-0" />
                    <span>Terhubung</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Belum terhubung
                  </p>
                )}
              </div>
            </div>
            {isGoogleLinked ? (
              <button
                type="button"
                onClick={() => {
                  if (!isPasswordLinked) {
                    addToast({ type: "error", title: "Gagal", message: "Tidak dapat memutuskan akun Google karena ini adalah satu-satunya metode login yang tersedia." });
                    return;
                  }
                  setUnlinkGoogleModalOpen(true);
                }}
                className="py-1.5 px-3 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium text-red-600 dark:text-red-400 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Putuskan</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLinkGoogle}
                disabled={isLinkingGoogle}
                className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isLinkingGoogle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LinkIcon className="w-3.5 h-3.5" />}
                <span>{isLinkingGoogle ? "Menghubungkan..." : "Hubungkan"}</span>
              </button>
            )}
          </div>

          {/* USERNAME / EMAIL + PASSWORD */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-[var(--surface-alt)] overflow-hidden">
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-[var(--card-title)]">Username / Email + Password</h3>
                  {isPasswordLinked ? (
                    <div>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>Terhubung</span>
                      </p>
                      {username && (
                        <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5">
                          Username: <span className="font-mono font-semibold">{username}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[var(--card-subtitle)] mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Belum terhubung
                    </p>
                  )}
                </div>
              </div>
              {isPasswordLinked ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isGoogleLinked) {
                      addToast({ type: "error", title: "Gagal", message: "Tidak dapat memutuskan kredensial ini karena ini adalah satu-satunya metode login yang tersedia." });
                      return;
                    }
                    setUnlinkPasswordModalOpen(true);
                  }}
                  className="py-1.5 px-3 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium text-red-600 dark:text-red-400 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Putuskan</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPasswordForm((v) => !v)}
                  className="py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{showPasswordForm ? "Batal" : "Buat Password"}</span>
                </button>
              )}
            </div>

            {/* Password setup form — only shown when not linked and form is expanded */}
            {!isPasswordLinked && showPasswordForm && (
              <form onSubmit={handleSavePasswordCredentials} className="border-t border-slate-200 dark:border-slate-800 p-4 space-y-3">
                {passwordFormError && <p className="text-[11px] text-red-500 font-medium bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">{passwordFormError}</p>}
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="w-3.5 h-3.5 text-slate-400" /></div>
                    <input type="text" readOnly value={email} className="w-full token-input pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 text-slate-500 cursor-not-allowed" />
                  </div>
                  <p className="text-[10px] text-[var(--card-subtitle)] mt-0.5">Email sudah tersimpan pada akun Anda.</p>
                </div>
                <div>
                  <label htmlFor="new-username" className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">Username <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><AtSign className="w-3.5 h-3.5 text-slate-400" /></div>
                    <input id="new-username" type="text" required value={newUsername} onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="contoh: akbar123" maxLength={20} className="w-full token-input pl-8 pr-3 py-2 text-xs" />
                  </div>
                  <p className="text-[10px] text-[var(--card-subtitle)] mt-0.5">3–20 karakter, huruf kecil, angka, underscore.</p>
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">Kata Sandi Baru <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-3.5 h-3.5 text-slate-400" /></div>
                    <input id="new-password" type={showNewPw ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full token-input pl-8 pr-8 py-2 text-xs" />
                    <button type="button" tabIndex={-1} onClick={() => setShowNewPw((v) => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-[11px] font-semibold text-[var(--foreground)] mb-1">Konfirmasi Kata Sandi <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-3.5 h-3.5 text-slate-400" /></div>
                    <input id="confirm-password" type={showConfirmPw ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi kata sandi" className="w-full token-input pl-8 pr-8 py-2 text-xs" />
                    <button type="button" tabIndex={-1} onClick={() => setShowConfirmPw((v) => !v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showConfirmPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={isSavingPassword} className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-60">
                    {isSavingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSavingPassword ? "Menyimpan..." : "Simpan"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {unlinkGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--card-title)] mb-2">Putuskan akun Google?</h3>
            <p className="text-sm text-[var(--card-subtitle)] mb-6">
              Setelah diputuskan, kamu tidak bisa lagi masuk menggunakan akun Google ini.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUnlinkGoogleModalOpen(false)}
                disabled={isUnlinking}
                className="py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUnlinkGoogle}
                disabled={isUnlinking}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                {isUnlinking && <Loader2 className="w-4 h-4 animate-spin" />}
                Putuskan
              </button>
            </div>
          </div>
        </div>
      )}

      {unlinkPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--card-title)] mb-2">Putuskan Password?</h3>
            <p className="text-sm text-[var(--card-subtitle)] mb-6">
              Setelah diputuskan, login menggunakan username/email dan password tidak akan tersedia. Pastikan akun Google tetap terhubung.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUnlinkPasswordModalOpen(false)}
                disabled={isUnlinking}
                className="py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUnlinkPassword}
                disabled={isUnlinking}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                {isUnlinking && <Loader2 className="w-4 h-4 animate-spin" />}
                Putuskan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZONA BERBAHAYA */}
      <DeleteAccountSection currentEmail={email} />
    </div>
  );
}
