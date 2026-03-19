const express = require("express");
const controller = require("../controllers/chat.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/message", requireAuth, requireRole("STUDENT"), controller.sendMessage);

module.exports = router;