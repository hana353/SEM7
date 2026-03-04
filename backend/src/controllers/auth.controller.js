const authService = require("../services/auth.service");

function bad(res, message) {
  return res.status(400).json({ message });
}

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    if (!email || !password || !full_name) return bad(res, "Missing fields");

    const result = await authService.register({ email, password, full_name, phone });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Register failed" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, code, type } = req.body;
    if (!email || !code) return bad(res, "Missing email/code");

    const result = await authService.verifyOtp({ email, code, type: type || "register" });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Verify OTP failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return bad(res, "Missing email/password");

    const result = await authService.login({ email, password });
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ message: err.message || "Login failed" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email) return bad(res, "Missing email");

    const result = await authService.resendOtp({ email, type: type || "register" });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message || "Resend OTP failed" });
  }
};