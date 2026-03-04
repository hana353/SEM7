const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, getPool } = require("../config/db");
const { sendOtpEmail } = require("./email_service");

const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES || 5);

// ===== helpers =====
function generateOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
  return otp;
}
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function getUserByEmail(email) {
  const pool = await getPool();
  const rs = await pool
    .request()
    .input("email", sql.NVarChar, email)
    .query(`SELECT TOP 1 * FROM users WHERE email=@email AND is_deleted=0`);
  return rs.recordset[0] || null;
}

async function createOtp(email, type) {
  const pool = await getPool();

  // Xóa OTP cũ cùng email+type để tránh nhầm + gọn DB
  await pool
    .request()
    .input("email", sql.NVarChar, email)
    .input("type", sql.NVarChar, type)
    .query(`DELETE FROM otp_codes WHERE email=@email AND type=@type`);

  const code = generateOtp(6);
  const expiresAt = addMinutes(new Date(), OTP_EXPIRE_MINUTES);

  await pool
    .request()
    .input("email", sql.NVarChar, email)
    .input("code", sql.NVarChar, code)
    .input("type", sql.NVarChar, type)
    .input("expires_at", sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO otp_codes(email, code, type, expires_at)
      VALUES (@email, @code, @type, @expires_at)
    `);

  return { code, expiresAt };
}

// ===== services =====
async function register({ email, password, full_name, phone }) {
  const pool = await getPool();

  const exists = await getUserByEmail(email);
  if (exists) throw new Error("Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  // STUDENT role_id = 3
  await pool
    .request()
    .input("email", sql.NVarChar, email)
    .input("password_hash", sql.NVarChar, passwordHash)
    .input("full_name", sql.NVarChar, full_name)
    .input("phone", sql.NVarChar, phone || null)
    .input("role_id", sql.SmallInt, 3)
    .query(`
      INSERT INTO users(email, password_hash, full_name, phone, role_id, is_verified)
      VALUES (@email, @password_hash, @full_name, @phone, @role_id, 0)
    `);

  const { code, expiresAt } = await createOtp(email, "register");
  await sendOtpEmail(email, code, "register");

  return {
    message: "Registered. OTP sent to email.",
    email,
    otp_expires_at: expiresAt,
  };
}

async function verifyOtp({ email, code, type = "register" }) {
  const pool = await getPool();

  const rs = await pool
    .request()
    .input("email", sql.NVarChar, email)
    .input("type", sql.NVarChar, type)
    .query(`
      SELECT TOP 1 *
      FROM otp_codes
      WHERE email=@email AND type=@type
      ORDER BY created_at DESC
    `);

  const row = rs.recordset[0];
  if (!row) throw new Error("OTP not found");

  const now = new Date();
  if (row.used_at) throw new Error("OTP already used");
  if (now > new Date(row.expires_at)) throw new Error("OTP expired");
  if (String(row.code).trim() !== String(code).trim()) throw new Error("Invalid OTP");

  // mark OTP used
  await pool
    .request()
    .input("id", sql.UniqueIdentifier, row.id)
    .query(`UPDATE otp_codes SET used_at = SYSUTCDATETIME() WHERE id=@id`);

  if (type === "register") {
    await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query(`
        UPDATE users
        SET is_verified = 1,
            updated_at = SYSDATETIMEOFFSET()
        WHERE email=@email AND is_deleted=0
      `);
  }

  return { message: "OTP verified successfully." };
}

async function login({ email, password }) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  if (!user.is_active || user.is_deleted) throw new Error("User is inactive");
  if (!user.is_verified) throw new Error("Email not verified");

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { sub: user.id, email: user.email, role_id: user.role_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  return {
    message: "Login success",
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role_id: user.role_id,
    },
  };
}

async function resendOtp({ email, type = "register" }) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error("User not found");

  if (type === "register" && user.is_verified) {
    throw new Error("User already verified");
  }

  const { code, expiresAt } = await createOtp(email, type);
  await sendOtpEmail(email, code, type);

  return { message: "OTP resent.", email, otp_expires_at: expiresAt };
}

module.exports = {
  register,
  verifyOtp,
  login,
  resendOtp,
};