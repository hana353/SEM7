const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool, poolConnect, sql } = require("../config/db");
const { sendOtpEmail } = require("./email.service");

const OTP_LENGTH = 6;
const OTP_EXPIRE_MINUTES = parseInt(process.env.OTP_EXPIRE_MINUTES, 10) || 10;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function register(data) {
  await poolConnect;
  const { email, password, fullName } = data;
  if (!email || !password) throw new Error("Email và mật khẩu là bắt buộc");

  const existing = await pool.request()
    .input("Email", sql.NVarChar, email)
    .query("SELECT Id FROM Users WHERE Email = @Email");
  if (existing.recordset.length > 0) throw new Error("Email đã được đăng ký");

  const passwordHash = await bcrypt.hash(password, 10);
  await pool.request()
    .input("Email", sql.NVarChar, email)
    .input("PasswordHash", sql.NVarChar, passwordHash)
    .input("FullName", sql.NVarChar, fullName || null)
    .query(`
      INSERT INTO Users (Email, PasswordHash, FullName, IsVerified)
      VALUES (@Email, @PasswordHash, @FullName, 0)
    `);

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  await pool.request()
    .input("Email", sql.NVarChar, email)
    .input("Code", sql.NVarChar, otp)
    .input("Type", sql.NVarChar, "register")
    .input("ExpiresAt", sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO OtpCodes (Email, Code, Type, ExpiresAt)
      VALUES (@Email, @Code, @Type, @ExpiresAt)
    `);

  await sendOtpEmail(email, otp, "register");
  return { message: "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP xác thực.", email };
}

async function verifyOtp(email, code) {
  await poolConnect;
  if (!email || !code) throw new Error("Email và mã OTP là bắt buộc");

  const row = await pool.request()
    .input("Email", sql.NVarChar, email)
    .input("Code", sql.NVarChar, code)
    .input("Now", sql.DateTime2, new Date())
    .query(`
      SELECT TOP 1 Id FROM OtpCodes
      WHERE Email = @Email AND Code = @Code AND Type = 'register' AND ExpiresAt > @Now
      ORDER BY CreatedAt DESC
    `);
  if (row.recordset.length === 0) throw new Error("Mã OTP không hợp lệ hoặc đã hết hạn");

  await pool.request()
    .input("Email", sql.NVarChar, email)
    .query("UPDATE Users SET IsVerified = 1, UpdatedAt = GETUTCDATE() WHERE Email = @Email");

  await pool.request()
    .input("Email", sql.NVarChar, email)
    .input("Code", sql.NVarChar, code)
    .query("DELETE FROM OtpCodes WHERE Email = @Email AND Code = @Code");

  return { message: "Xác thực thành công. Bạn có thể đăng nhập." };
}

async function login(email, password) {
  await poolConnect;
  if (!email || !password) throw new Error("Email và mật khẩu là bắt buộc");

  const result = await pool.request()
    .input("Email", sql.NVarChar, email)
    .query("SELECT Id, Email, PasswordHash, FullName, IsVerified FROM Users WHERE Email = @Email");
  const user = result.recordset[0];
  if (!user) throw new Error("Email hoặc mật khẩu không đúng");

  const valid = await bcrypt.compare(password, user.PasswordHash);
  if (!valid) throw new Error("Email hoặc mật khẩu không đúng");

  if (!user.IsVerified) throw new Error("Tài khoản chưa xác thực. Vui lòng kiểm tra email để lấy mã OTP.");

  const token = jwt.sign(
    { userId: user.Id, email: user.Email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return {
    message: "Đăng nhập thành công",
    token,
    user: {
      id: user.Id,
      email: user.Email,
      fullName: user.FullName
    }
  };
}

async function requestLoginOtp(email) {
  await poolConnect;
  if (!email) throw new Error("Email là bắt buộc");

  const result = await pool.request()
    .input("Email", sql.NVarChar, email)
    .query("SELECT Id, IsVerified FROM Users WHERE Email = @Email");
  const user = result.recordset[0];
  if (!user) throw new Error("Email chưa đăng ký");
  if (!user.IsVerified) throw new Error("Tài khoản chưa xác thực. Vui lòng xác thực qua OTP đăng ký trước.");

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  await pool.request()
    .input("Email", sql.NVarChar, email)
    .input("Code", sql.NVarChar, otp)
    .input("Type", sql.NVarChar, "login")
    .input("ExpiresAt", sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO OtpCodes (Email, Code, Type, ExpiresAt)
      VALUES (@Email, @Code, @Type, @ExpiresAt)
    `);

  await sendOtpEmail(email, otp, "login");
  return { message: "Mã OTP đã gửi đến email của bạn.", email };
}

module.exports = {
  register,
  verifyOtp,
  login,
  requestLoginOtp
};
