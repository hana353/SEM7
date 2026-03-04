// src/routes/quiz.routes.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/quiz.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

/**
 * PUBLIC (member)
 * - Chỉ xem quiz PUBLISHED
 */
router.get("/", controller.publicListPublished);
router.get("/:id", controller.publicGetPublishedDetail);

/**
 * TEACHER
 * - CRUD quiz sets + cards
 */
router.post("/", requireAuth, requireRole("TEACHER"), controller.teacherCreateQuizSet);
router.get("/teacher/list", requireAuth, requireRole("TEACHER"), controller.teacherListQuizSets);
router.get("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherGetQuizSetDetail);
router.patch("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherUpdateQuizSet);
router.delete("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherDeleteQuizSet);

// Cards
router.post("/teacher/:id/cards", requireAuth, requireRole("TEACHER"), controller.teacherAddCard);
router.patch("/teacher/cards/:cardId", requireAuth, requireRole("TEACHER"), controller.teacherUpdateCard);
router.delete("/teacher/cards/:cardId", requireAuth, requireRole("TEACHER"), controller.teacherDeleteCard);
router.put("/teacher/:id/cards/reorder", requireAuth, requireRole("TEACHER"), controller.teacherReorderCards);

module.exports = router;