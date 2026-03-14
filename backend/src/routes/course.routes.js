// src/routes/course.routes.js
const express = require("express");
const router = express.Router();

const controller = require("../controllers/course.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Public
router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Student: các khóa đã ghi danh (đã mua)
router.get("/student/my", requireAuth, requireRole("STUDENT"), controller.getMyCourses);

// Teacher: danh sách khóa được admin gán
router.get("/teacher/assigned", requireAuth, requireRole("TEACHER"), controller.getAssignedToTeacher);

// Admin: create
router.post("/", requireAuth, requireRole("ADMIN"), controller.createByAdmin);

// Admin: change/assign teacher to course
router.patch("/:id/assign-teacher", requireAuth, requireRole("ADMIN"), controller.assignTeacher);

// Admin: update course (edit from list/detail)
router.patch("/:id", requireAuth, requireRole("ADMIN"), controller.updateByAdmin);

// Admin: delete course (soft delete)
router.delete("/:id", requireAuth, requireRole("ADMIN"), controller.deleteByAdmin);

module.exports = router;