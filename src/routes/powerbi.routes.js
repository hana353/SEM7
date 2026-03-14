const express = require("express");
const router = express.Router();
const controller = require("../controllers/powerbi.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Chỉ admin, trả về embedUrl + accessToken để frontend nhúng report (không cần đăng nhập Power BI)
router.get("/embed", requireAuth, requireRole("ADMIN"), controller.getEmbed);

module.exports = router;
