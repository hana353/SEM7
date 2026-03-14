const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

async function sendOtpEmail(to, otp, type = "register") {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("MAIL_USER hoặc MAIL_PASS chưa được cấu hình");
  }

  if (!to) {
    throw new Error("Thiếu email người nhận");
  }

  const subject =
    type === "login" ? "Your Login OTP Code" : "Your Registration OTP Code";

  const html = `
    <div style="font-family:Arial,sans-serif">
      <h3>${subject}</h3>
      <p>Mã OTP của bạn là:</p>
      <div style="font-size:28px;font-weight:bold;letter-spacing:4px">${otp}</div>
      <p>Mã sẽ hết hạn sau vài phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject,
    html,
  });
}

module.exports = { sendOtpEmail };