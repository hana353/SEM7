const notificationService = require("../services/notification.service");

exports.myNotifications = async (req, res) => {
  try {
    const { q, type, is_read, limit, offset } = req.query;
    const result = await notificationService.listNotifications(req.user.id, {
      q,
      type,
      is_read: is_read === undefined ? undefined : is_read === "true" || is_read === true,
      limit,
      offset,
    });
    return res.json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const data = await notificationService.markAsRead(req.user.id, req.params.id);
    return res.json({ message: "ok", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

