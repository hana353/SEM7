const express = require("express");
const router = express.Router();
const controller = require("../controllers/vocabulary.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

router.get("/topics", controller.getTopics);
router.post("/topics", requireAuth, requireRole("ADMIN"), controller.createTopic);

module.exports = router;
