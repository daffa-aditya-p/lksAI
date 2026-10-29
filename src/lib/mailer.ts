import nodemailer from "nodemailer";

/**
 * Buat transporter SMTP menggunakan konfigurasi environment
 */
export function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || "daffaaditya0407@gmail.com";
  const pass = (process.env.SMTP_PASS || "kbtshrquqeimfdis").replace(/\s+/g, "");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Kirim email OTP untuk reset kata sandi
 */
export async function sendPasswordResetOtpEmail({
  toEmail,
  otpCode,
  nama,
}: {
  toEmail: string;
  otpCode: string;
  nama?: string | null;
}) {
  const transporter = getMailTransporter();
  const from =
    process.env.SMTP_FROM ||
    `"SATU Support" <satu-support@daffadev.my.id>`;

  const greetingName = nama ? nama : "Pengguna SATU";

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kode Verifikasi Kata Sandi — SATU</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      color: #0b1f4b;
    }
    .container {
      max-width: 520px;
      margin: 32px auto;
      background: #ffffff;
      border-radius: 20px;
      padding: 36px 32px;
      box-shadow: 0 8px 30px rgba(11, 31, 75, 0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 1px solid #f1f5f9;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 800;
      color: #0b1f4b;
      letter-spacing: -0.02em;
      margin: 0;
    }
    .brand-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .content {
      padding: 24px 0;
      line-height: 1.6;
    }
    .otp-box {
      background: linear-gradient(135deg, #f0fdfa 0%, #e6fffa 100%);
      border: 2px dashed #00a9b7;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #008c99;
      margin-bottom: 8px;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #0b1f4b;
      font-family: 'Courier New', Courier, monospace;
      margin: 0;
    }
    .alert-box {
      background-color: #fffbeb;
      border-left: 4px solid #ffa90a;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      color: #78350f;
      margin: 20px 0;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="brand-title">SATU</h1>
      <p class="brand-sub">Sistem Tanggap Terpadu & Informasi Bencana</p>
    </div>

    <div class="content">
      <p>Halo <b>${greetingName}</b>,</p>
      <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun SATU Anda. Gunakan kode verifikasi (OTP) berikut untuk melanjutkan proses:</p>

      <div class="otp-box">
        <div class="otp-label">Kode Verifikasi (OTP)</div>
        <div class="otp-code">${otpCode}</div>
      </div>

      <div class="alert-box">
        ⏱️ <b>Penting:</b> Kode OTP ini hanya berlaku selama <b>10 menit</b> dan maksimal 5 kali percobaan. Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengatasnamakan SATU.
      </div>

      <p style="font-size: 13px; color: #64748b;">
        Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini dan kata sandi Anda akan tetap aman.
      </p>
    </div>

    <div class="footer">
      Email ini dikirim secara otomatis oleh Sistem SATU.<br />
      &copy; 2026 SATU — Inovasi Tanggap Darurat & Manajemen Posko Pengungsian.
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
Halo ${greetingName},

Permintaan pengaturan ulang kata sandi akun SATU Anda telah diterima.
Kode OTP Anda: ${otpCode}

Kode ini berlaku selama 10 menit.
Jangan berikan kode ini kepada siapapun.

Jika Anda tidak meminta reset kata sandi, abaikan email ini.

Tim SATU
  `.trim();

  return await transporter.sendMail({
    from,
    to: toEmail,
    subject: `[SATU] ${otpCode} adalah Kode Verifikasi Reset Kata Sandi Anda`,
    text: textContent,
    html: htmlContent,
  });
}
