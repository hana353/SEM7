const courseService = require("../services/course.service");

exports.getCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    await courseService.createCourse(req.body);
    res.json({ message: "Course created successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};