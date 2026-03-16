// src/routes/test.routes.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/test.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

/* =========================
   PUBLIC / STUDENT
========================= */
router.get("/", controller.publicListPublished);
router.get("/:id", controller.publicGetPublishedDetail);

router.post("/:id/attempts", requireAuth, requireRole("STUDENT"), controller.studentStartAttempt);
router.get("/attempts/:attemptId", requireAuth, requireRole("STUDENT"), controller.studentGetAttemptDetail);
router.post("/attempts/:attemptId/answers", requireAuth, requireRole("STUDENT"), controller.studentSaveAnswer);
router.post("/attempts/:attemptId/submit", requireAuth, requireRole("STUDENT"), controller.studentSubmitAttempt);
router.get("/attempts/:attemptId/review", requireAuth, requireRole("STUDENT"), controller.studentReviewAttempt);
router.get("/:id/attempts/me", requireAuth, requireRole("STUDENT"), controller.studentListMyAttempts);

/* =========================
   TEACHER
========================= */
router.post("/", requireAuth, requireRole("TEACHER"), controller.teacherCreateTest);
router.get("/teacher/list", requireAuth, requireRole("TEACHER"), controller.teacherListTests);
router.get("/teacher/:id/attempts", requireAuth, requireRole("TEACHER"), controller.teacherListTestAttempts);
router.get("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherGetTestDetail);
router.patch("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherUpdateTest);
router.delete("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherDeleteTest);

// Questions
router.post("/teacher/:id/questions", requireAuth, requireRole("TEACHER"), controller.teacherAddQuestion);
router.patch("/teacher/questions/:questionId", requireAuth, requireRole("TEACHER"), controller.teacherUpdateQuestion);
router.delete("/teacher/questions/:questionId", requireAuth, requireRole("TEACHER"), controller.teacherDeleteQuestion);

// Choices
router.post("/teacher/questions/:questionId/choices", requireAuth, requireRole("TEACHER"), controller.teacherAddChoice);
router.patch("/teacher/choices/:choiceId", requireAuth, requireRole("TEACHER"), controller.teacherUpdateChoice);
router.delete("/teacher/choices/:choiceId", requireAuth, requireRole("TEACHER"), controller.teacherDeleteChoice);

module.exports = router;