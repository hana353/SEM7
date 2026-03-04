const router = require("express").Router();
const authController = require("../controllers/auth.controller");

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/resend-otp", authController.resendOtp);

module.exports = router;