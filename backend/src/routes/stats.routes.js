const express = require("express");
const router = express.Router();
const controller = require("../controllers/stats.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

router.get("/admin", requireAuth, requireRole("ADMIN"), controller.getAdminStats);
router.get("/teacher", requireAuth, requireRole("TEACHER"), controller.getTeacherStats);

module.exports = router;
