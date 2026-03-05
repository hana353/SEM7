const statsService = require("../services/stats.service");

exports.getAdminStats = async (req, res) => {
  try {
    const data = await statsService.getAdminStats();
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
