const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");
const { requireAuth } = require("../middleware/auth.middleware");

router.get("/me", requireAuth, controller.myNotifications);
router.patch("/:id/read", requireAuth, controller.markRead);

module.exports = router;

