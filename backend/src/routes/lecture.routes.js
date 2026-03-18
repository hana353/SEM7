// src/routes/lecture.routes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/lecture.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

router.get("/teacher/all", requireAuth, requireRole("TEACHER"), controller.teacherGetAllLectures);
router.get("/course/:courseId", requireAuth, requireRole("TEACHER"), controller.teacherGetLectures);
router.post("/course/:courseId", requireAuth, requireRole("TEACHER"), controller.teacherCreateLecture);
router.patch("/:lectureId", requireAuth, requireRole("TEACHER"), controller.teacherUpdateLecture);
router.delete("/:lectureId", requireAuth, requireRole("TEACHER"), controller.teacherDeleteLecture);

// Student: xem danh sách bài giảng trong khóa đã ghi danh
router.get("/student/course/:courseId", requireAuth, requireRole("STUDENT"), controller.studentGetLectures);

// Admin: duyệt bài giảng
router.get("/admin/pending", requireAuth, requireRole("ADMIN"), controller.adminListPending);
router.post("/admin/:lectureId/approve", requireAuth, requireRole("ADMIN"), controller.adminApprove);
router.post("/admin/:lectureId/reject", requireAuth, requireRole("ADMIN"), controller.adminReject);

module.exports = router;
