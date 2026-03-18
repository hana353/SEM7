// src/controllers/lecture.controller.js
const lectureService = require("../services/lecture.service");

exports.teacherGetAllLectures = async (req, res) => {
  try {
    const data = await lectureService.teacherGetAllLectures(req.user.id);
    return res.json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.studentGetLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await lectureService.studentGetLectures(req.user.id, courseId);
    return res.json({ data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.teacherGetLectures = async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await lectureService.teacherGetLectures(req.user.id, courseId);
    return res.json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.teacherCreateLecture = async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await lectureService.teacherCreateLecture(req.user.id, courseId, req.body);
    return res.status(201).json({ message: "created", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.teacherUpdateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const data = await lectureService.teacherUpdateLecture(req.user.id, lectureId, req.body);
    return res.json({ message: "updated", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.teacherDeleteLecture = async (req, res) => {
  try {
    await lectureService.teacherDeleteLecture(req.user.id, req.params.lectureId);
    return res.json({ message: "deleted" });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

// Admin: list pending lectures
exports.adminListPending = async (req, res) => {
  try {
    const data = await lectureService.adminGetPendingLectures();
    return res.json(data);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

// Admin: approve lecture
exports.adminApprove = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const data = await lectureService.adminApproveLecture(req.user.id, lectureId);
    return res.json({ message: "approved", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

// Admin: reject lecture
exports.adminReject = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const data = await lectureService.adminRejectLecture(req.user.id, lectureId, {
      reason: req.body?.reason,
    });
    return res.json({ message: "rejected", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};
