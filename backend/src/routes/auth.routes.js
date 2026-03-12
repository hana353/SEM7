const router = require("express").Router();
const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOtp);
router.post("/login", authController.login);
router.post("/resend-otp", authController.resendOtp);
router.post("/change-password", requireAuth, authController.changePassword);

module.exports = router;