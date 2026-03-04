const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s/g, "")
  }
});

/**
 * Gửi mã OTP đến email
 * @param {string} toEmail - Địa chỉ nhận
 * @param {string} otp - Mã OTP 6 số
 * @param {string} type - 'register' | 'login'
 */
const sendOtpEmail = async (toEmail, otp, type = "register") => {
  const subject = type === "register"
    ? "Mã xác thực đăng ký - English Center"
    : "Mã xác thực đăng nhập - English Center";
  const text = `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong ${process.env.OTP_EXPIRE_MINUTES || 10} phút.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 400px;">
      <h2>English Center</h2>
      <p>Mã xác thực của bạn:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
      <p style="color: #666;">Mã có hiệu lực trong ${process.env.OTP_EXPIRE_MINUTES || 10} phút.</p>
    </div>
  `;
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject,
    text,
    html
  });
};

module.exports = {
  sendOtpEmail
};
