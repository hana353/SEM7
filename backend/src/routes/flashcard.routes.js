const express = require("express");
const router = express.Router();

const controller = require("../controllers/flashcard.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// PUBLIC (member): only PUBLISHED
router.get("/", controller.publicListPublished);
router.get("/:id", controller.publicGetPublishedDetail);

// TEACHER: CRUD sets + cards
router.post("/", requireAuth, requireRole("TEACHER"), controller.teacherCreateSet);
router.get("/teacher/list", requireAuth, requireRole("TEACHER"), controller.teacherListSets);
router.get("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherGetSetDetail);
router.patch("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherUpdateSet);
router.delete("/teacher/:id", requireAuth, requireRole("TEACHER"), controller.teacherDeleteSet);

router.post("/teacher/:id/cards", requireAuth, requireRole("TEACHER"), controller.teacherAddCard);
router.patch("/teacher/cards/:cardId", requireAuth, requireRole("TEACHER"), controller.teacherUpdateCard);
router.delete("/teacher/cards/:cardId", requireAuth, requireRole("TEACHER"), controller.teacherDeleteCard);
router.put("/teacher/:id/cards/reorder", requireAuth, requireRole("TEACHER"), controller.teacherReorderCards);

module.exports = router;

