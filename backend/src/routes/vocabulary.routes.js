const express = require("express");
const router = express.Router();
const controller = require("../controllers/vocabulary.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Admin: quản lý chủ đề từ vựng free
router.get("/topics", controller.getTopics);
router.post("/topics", requireAuth, requireRole("ADMIN"), controller.createTopic);
router.patch("/topics/:topicId", requireAuth, requireRole("ADMIN"), controller.updateTopic);
router.delete("/topics/:topicId", requireAuth, requireRole("ADMIN"), controller.deleteTopic);

// Admin: thêm từ vựng vào chủ đề (thẻ học free)
router.get(
  "/topics/:topicId/words",
  requireAuth,
  controller.getWordsByTopic
);
router.post(
  "/topics/:topicId/words",
  requireAuth,
  requireRole("ADMIN"),
  controller.createWord
);

// Student: luyện tập phát âm + remind (chỉ sau khi đăng ký / đăng nhập)
router.post(
  "/practice",
  requireAuth,
  requireRole("STUDENT"),
  controller.logPractice
);

router.get(
  "/remind",
  requireAuth,
  requireRole("STUDENT"),
  controller.getRemindWords
);

module.exports = router;
