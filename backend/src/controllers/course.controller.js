// src/controllers/course.controller.js
const courseService = require("../services/course.service");

exports.getAll = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    return res.json(courses);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json(course);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.getAssignedToTeacher = async (req, res) => {
  try {
    const courses = await courseService.getCoursesByTeacherId(req.user.id);
    return res.json(courses);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.createByAdmin = async (req, res) => {
  try {
    const result = await courseService.createCourseByAdmin(req.body, req.user.id);
    return res.status(201).json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.assignTeacher = async (req, res) => {
  try {
    const { id } = req.params; // course id
    const { teacher_id } = req.body;
    if (!teacher_id) return res.status(400).json({ message: "teacher_id là bắt buộc" });

    const result = await courseService.assignTeacherToCourse(id, teacher_id);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

// Admin: update course (edit from list/detail)
exports.updateByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // course id
    const result = await courseService.updateCourseByAdmin(id, req.body);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

// Admin: delete course (soft delete)
exports.deleteByAdmin = async (req, res) => {
  try {
    const { id } = req.params; // course id
    const result = await courseService.softDeleteCourseByAdmin(id);
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};