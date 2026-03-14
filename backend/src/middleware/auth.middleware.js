// src/middleware/auth.middleware.js
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload?.sub || payload?.userId || payload?.id;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select(`
        id,
        email,
        full_name,
        role_id,
        is_active,
        is_deleted,
        roles (
          code
        )
      `)
      .eq("id", userId)
      .eq("is_active", true)
      .eq("is_deleted", false)
      .single();

    if (error || !user) {
      return res.status(401).json({
        message: "Invalid token user",
        detail: error?.message || null,
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      roleId: user.role_id,
      roleCode: user.roles?.code || null,
    };

    next();
  } catch (e) {
    return res.status(401).json({
      message: "Unauthorized",
      detail: e.message,
    });
  }
}

function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowed.includes(req.user.roleCode)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };