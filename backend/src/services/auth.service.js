const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const supabase = require("../config/supabase");
const { sendOtpEmail } = require("./email.service");

const OTP_EXPIRE_MINUTES = Number(process.env.OTP_EXPIRE_MINUTES || 5);

function generateOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) otp += Math.floor(Math.random() * 10);
  return otp;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

async function getUserByEmail(email) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      password_hash,
      full_name,
      phone,
      role_id,
      is_verified,
      is_active,
      is_deleted,
      created_at,
      updated_at,
      roles:role_id (
        code
      )
    `)
    .eq("email", email)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    ...data,
    role_code: data.roles?.code || null,
  };
}

async function createOtp(email, type) {
  const code = generateOtp(6);
  const expiresAt = addMinutes(new Date(), OTP_EXPIRE_MINUTES);

  const { error: deleteError } = await supabase
    .from("otp_codes")
    .delete()
    .eq("email", email)
    .eq("type", type);

  if (deleteError) throw new Error(deleteError.message);

  const { error: insertError } = await supabase
    .from("otp_codes")
    .insert({
      id: crypto.randomUUID(),
      email,
      code,
      type,
      expires_at: expiresAt.toISOString(),
    });

  if (insertError) throw new Error(insertError.message);

  return { code, expiresAt };
}

async function register({ email, password, full_name, phone }) {
  const exists = await getUserByEmail(email);
  if (exists) throw new Error("Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  const { error } = await supabase.from("users").insert({
    email,
    password_hash: passwordHash,
    full_name,
    phone: phone || null,
    role_id: 3,
    is_verified: false,
    is_active: true,
    is_deleted: false,
  });

  if (error) throw new Error(error.message);

  const { code, expiresAt } = await createOtp(email, "register");
  await sendOtpEmail(email, code, "register");

  return {
    message: "Registered. OTP sent to email.",
    email,
    otp_expires_at: expiresAt,
  };
}

async function verifyOtp({ email, code, type = "register" }) {
  const { data: row, error } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("email", email)
    .eq("type", type)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) throw new Error("OTP not found");

  const now = new Date();
  if (row.used_at) throw new Error("OTP already used");
  if (now > new Date(row.expires_at)) throw new Error("OTP expired");
  if (String(row.code).trim() !== String(code).trim()) throw new Error("Invalid OTP");

  const { error: usedError } = await supabase
    .from("otp_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", row.id);

  if (usedError) throw new Error(usedError.message);

  if (type === "register") {
    const { error: verifyError } = await supabase
      .from("users")
      .update({
        is_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .eq("is_deleted", false);

    if (verifyError) throw new Error(verifyError.message);
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
    {
      sub: user.id,
      email: user.email,
      role_id: user.role_id,
      role_code: user.role_code,
    },
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
      role_code: user.role_code,
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

  return {
    message: "OTP resent.",
    email,
    otp_expires_at: expiresAt,
  };
}

async function changePassword({ userId, oldPassword, newPassword }) {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, password_hash")
    .eq("id", userId)
    .eq("is_deleted", false)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!user) throw new Error("User not found");

  const ok = await bcrypt.compare(oldPassword, user.password_hash);
  if (!ok) throw new Error("Mật khẩu cũ không đúng");

  if (!newPassword || String(newPassword).length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);

  return { message: "Đổi mật khẩu thành công." };
}

module.exports = {
  register,
  verifyOtp,
  login,
  resendOtp,
  changePassword,
};