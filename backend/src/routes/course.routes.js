const express = require("express");
const router = express.Router();
const controller = require("../controllers/course.controller");

router.get("/", controller.getCourses);
router.post("/", controller.createCourse);

module.exports = router;