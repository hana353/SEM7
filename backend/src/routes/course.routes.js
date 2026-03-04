const express = require("express");
const router = express.Router();
const controller = require("../controllers/course.controller");

router.get("/", controller.getAllCourses);

module.exports = router;