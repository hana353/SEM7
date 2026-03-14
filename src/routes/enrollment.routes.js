const express = require("express");
const router = express.Router();
const controller = require("../controllers/enrollment.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

router.get("/teacher/students", requireAuth, requireRole("TEACHER"), controller.getTeacherStudents);

module.exports = router;
