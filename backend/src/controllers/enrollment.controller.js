const enrollmentService = require("../services/enrollment.service");

exports.getTeacherStudents = async (req, res) => {
  try {
    const data = await enrollmentService.getStudentsByTeacherId(req.user.id);
    return res.json({ data });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
