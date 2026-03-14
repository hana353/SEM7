const statsService = require("../services/stats.service");

exports.getAdminStats = async (req, res) => {
  try {
    const data = await statsService.getAdminStats();
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getAdminRevenueDetail = async (req, res) => {
  try {
    const filters = {
      course_id: req.query.course_id || null,
      status: req.query.status || null,
    };
    const data = await statsService.getAdminRevenueDetail(filters);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.getTeacherStats = async (req, res) => {
  try {
    const data = await statsService.getTeacherStats(req.user.id);
    return res.json(data);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
