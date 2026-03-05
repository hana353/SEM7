const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { requireAuth, requireRole } = require("../middleware/auth.middleware");

// Route lấy chi tiết người dùng (chỉ requireAuth, không ADMIN)
router.get("/:id", requireAuth, userController.getUserDetails);

// Tất cả API quản lý user yêu cầu ADMIN
router.use(requireAuth, requireRole("ADMIN"));

// GET /api/users -> danh sách tất cả người dùng
router.get("/", userController.getAllUsers);

// PATCH /api/users/:id/promote-teacher -> gán user thường thành teacher
router.patch("/:id/promote-teacher", userController.promoteToTeacher);

// DELETE /api/users/:id -> xóa mềm / vô hiệu hóa tài khoản
router.delete("/:id", userController.softDeleteUser);

module.exports = router;

