// src/routes/course.routes.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/course.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Public
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Admin: create + assign teacher
router.post("/", requireAuth, requireRole("ADMIN"), controller.createByAdmin);

// Admin: change/assign teacher to course
router.patch("/:id/assign-teacher", requireAuth, requireRole("ADMIN"), controller.assignTeacher);

module.exports = router;