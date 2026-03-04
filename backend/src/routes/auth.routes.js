const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");

// POST /api/auth/register - Đăng ký (gửi OTP về mail)
router.post("/register", controller.register);

// POST /api/auth/verify-otp - Xác thực OTP sau đăng ký
router.post("/verify-otp", controller.verifyOtp);

// POST /api/auth/login - Đăng nhập (email + mật khẩu)
router.post("/login", controller.login);

// POST /api/auth/request-login-otp - Gửi OTP đăng nhập về mail (tùy chọn)
router.post("/request-login-otp", controller.requestLoginOtp);

module.exports = router;
