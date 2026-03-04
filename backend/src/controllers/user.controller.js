// src/controllers/user.controller.js
const userService = require("../services/user.service");

function bad(res, message, status = 400) {
  return res.status(status).json({ message });
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return res.json({ data: users });
  } catch (err) {
    return bad(res, err.message || "Failed to fetch users", 500);
  }
};

// ✅ NEW: GET /api/users/:id
exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Missing user id");

    const user = await userService.getUserById(id);
    return res.json({ data: user });
  } catch (err) {
    // not found -> 404
    const msg = err.message || "Failed to fetch user detail";
    const status = msg.toLowerCase().includes("not found") ? 404 : 400;
    return bad(res, msg, status);
  }
};

// ✅ NEW: PATCH /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Missing user id");

    const payload = req.body || {};
    // Nếu muốn chặt hơn thì whitelist field tại đây cũng được
    const user = await userService.updateUser(id, payload);

    return res.json({
      message: "User updated",
      data: user,
    });
  } catch (err) {
    return bad(res, err.message || "Failed to update user");
  }
};

exports.promoteToTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Missing user id");

    const user = await userService.promoteToTeacher(id);
    return res.json({
      message: "User promoted to TEACHER",
      data: user,
    });
  } catch (err) {
    return bad(res, err.message || "Failed to promote user");
  }
};

exports.softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Missing user id");

    const user = await userService.softDeleteUser(id);
    return res.json({
      message: "User disabled (soft deleted)",
      data: user,
    });
  } catch (err) {
    return bad(res, err.message || "Failed to disable user");
  }
};