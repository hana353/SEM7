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

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return bad(res, "Missing user id");

    // Kiểm tra nếu người dùng chỉ lấy hồ sơ của chính mình (tùy chọn bảo mật)
    if (String(req.user.id) !== String(id)) {
      return bad(res, "Unauthorized", 403);
    }

    const user = await userService.getUserById(id); // Giả sử hàm này tồn tại trong user.service.js
    return res.json({ data: user });
  } catch (err) {
    return bad(res, err.message || "Failed to fetch user details", 500);
  }
};

