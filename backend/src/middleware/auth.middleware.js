// src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const { pool, poolConnect, sql } = require("../config/db");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    await poolConnect;
    const rs = await pool.request()
      .input("id", sql.UniqueIdentifier, payload.userId)
      .query(`
        SELECT u.id, u.email, u.full_name, u.role_id, r.code AS role_code
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.id = @id AND u.is_active = 1 AND u.is_deleted = 0
      `);

    const user = rs.recordset[0];
    if (!user) return res.status(401).json({ message: "Invalid token user" });

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleCode: user.role_code,
    };

    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized", detail: e.message });
  }
}

function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!allowed.includes(req.user.roleCode)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };