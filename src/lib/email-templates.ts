export function renderVerificationEmail(name: string, otp: string) {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1e3a8a; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">InternTrack</h1>
      </div>
      <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Kode Verifikasi InternTrack</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Halo <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Gunakan kode berikut untuk memverifikasi email akun InternTrack kamu.
      </p>
      <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1e3a8a; border-radius: 8px; border: 1px solid #e2e8f0; margin: 24px 0;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
        Kode ini berlaku selama <strong>10 menit</strong>.
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
        Jika kamu tidak melakukan pendaftaran ini, abaikan email ini.<br/>
        &copy; ${new Date().getFullYear()} InternTrack
      </p>
    </div>
  `;
}

export function renderPasswordResetEmail(name: string, resetLink: string) {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1e3a8a; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">InternTrack</h1>
      </div>
      <h2 style="color: #0f172a; margin-top: 0; font-size: 18px;">Reset Password InternTrack</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Halo <strong>${name}</strong>,</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">
        Kami menerima permintaan untuk mereset kata sandi akun InternTrack kamu. Klik tombol di bawah ini untuk membuat kata sandi baru.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetLink}" style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Reset Kata Sandi
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px; margin-bottom: 24px; word-break: break-all;">
        Atau salin dan tempel tautan berikut di browser kamu:<br/>
        <a href="${resetLink}" style="color: #2563eb; text-decoration: underline;">${resetLink}</a>
      </p>
      <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">
        Tautan ini berlaku selama <strong>30 menit</strong>.
      </p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin-bottom: 0;">
        Jika kamu tidak meminta reset kata sandi, abaikan email ini. Akunmu tetap aman.<br/>
        &copy; ${new Date().getFullYear()} InternTrack
      </p>
    </div>
  `;
}
