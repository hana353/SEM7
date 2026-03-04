// src/services/user.service.js
const { sql, getPool } = require("../config/db");

async function getAllUsers() {
  const pool = await getPool();
  const rs = await pool.request().query(`
    SELECT 
      u.id,
      u.email,
      u.full_name,
      u.phone,
      u.role_id,
      r.code AS role_code,
      u.is_verified,
      u.is_active,
      u.is_deleted,
      u.created_at,
      u.updated_at
    FROM users u
    JOIN roles r ON r.id = u.role_id
    ORDER BY u.created_at DESC
  `);
  return rs.recordset;
}

// ✅ NEW
async function getUserById(userId) {
  const pool = await getPool();

  const rs = await pool
    .request()
    .input("id", sql.UniqueIdentifier, userId)
    .query(`
      SELECT TOP 1
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.role_id,
        r.code AS role_code,
        u.is_verified,
        u.is_active,
        u.is_deleted,
        u.created_at,
        u.updated_at
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = @id;
    `);

  const user = rs.recordset?.[0];
  if (!user) throw new Error("User not found");
  return user;
}

// ✅ NEW
async function updateUser(userId, payload) {
  const pool = await getPool();

  // whitelist field
  const {
    full_name,
    phone,
    role_id,     // number (int)
    is_active,   // boolean
    is_verified, // boolean
  } = payload || {};

  // Không có gì để update
  const hasAny =
    full_name !== undefined ||
    phone !== undefined ||
    role_id !== undefined ||
    is_active !== undefined ||
    is_verified !== undefined;

  if (!hasAny) throw new Error("No fields to update");

  // Validate role_id nếu có truyền
  if (role_id !== undefined && role_id !== null) {
    const roleCheck = await pool
      .request()
      .input("rid", sql.Int, role_id)
      .query(`SELECT TOP 1 id FROM roles WHERE id = @rid;`);
    if (roleCheck.recordset.length === 0) throw new Error("role_id không hợp lệ");
  }

  const req = pool.request().input("id", sql.UniqueIdentifier, userId);

  // Build SET động
  const sets = [];
  if (full_name !== undefined) {
    sets.push("full_name = @full_name");
    req.input("full_name", sql.NVarChar(255), full_name);
  }
  if (phone !== undefined) {
    sets.push("phone = @phone");
    req.input("phone", sql.VarChar(50), phone);
  }
  if (role_id !== undefined) {
    sets.push("role_id = @role_id");
    req.input("role_id", sql.Int, role_id);
  }
  if (is_active !== undefined) {
    sets.push("is_active = @is_active");
    req.input("is_active", sql.Bit, is_active ? 1 : 0);
  }
  if (is_verified !== undefined) {
    sets.push("is_verified = @is_verified");
    req.input("is_verified", sql.Bit, is_verified ? 1 : 0);
  }

  // Chỉ update user chưa bị xóa mềm
  const rs = await req.query(`
    UPDATE users
    SET ${sets.join(", ")},
        updated_at = SYSDATETIMEOFFSET()
    WHERE id = @id AND is_deleted = 0;

    SELECT 
      u.id,
      u.email,
      u.full_name,
      u.phone,
      u.role_id,
      r.code AS role_code,
      u.is_verified,
      u.is_active,
      u.is_deleted,
      u.created_at,
      u.updated_at
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = @id;
  `);

  const rows = rs.recordsets?.[1] || rs.recordset || [];
  const user = rows[0];
  if (!user) throw new Error("User not found or already deleted");
  return user;
}

async function promoteToTeacher(userId) {
  const pool = await getPool();

  // role_id = 2 => TEACHER (xem trong init.sql)
  const rs = await pool
    .request()
    .input("id", sql.UniqueIdentifier, userId)
    .query(`
      UPDATE users
      SET role_id = 2,
          updated_at = SYSDATETIMEOFFSET()
      WHERE id = @id AND is_deleted = 0;

      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.role_id,
        r.code AS role_code,
        u.is_verified,
        u.is_active,
        u.is_deleted,
        u.created_at,
        u.updated_at
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = @id;
    `);

  const rows = rs.recordsets?.[1] || rs.recordset || [];
  const user = rows[0];
  if (!user) {
    throw new Error("User not found or already deleted");
  }
  return user;
}

async function softDeleteUser(userId) {
  const pool = await getPool();

  const rs = await pool
    .request()
    .input("id", sql.UniqueIdentifier, userId)
    .query(`
      UPDATE users
      SET 
        is_active = 0,
        is_deleted = 1,
        updated_at = SYSDATETIMEOFFSET()
      WHERE id = @id AND is_deleted = 0;

      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.phone,
        u.role_id,
        r.code AS role_code,
        u.is_verified,
        u.is_active,
        u.is_deleted,
        u.created_at,
        u.updated_at
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = @id;
    `);

  const rows = rs.recordsets?.[1] || rs.recordset || [];
  const user = rows[0];
  if (!user) {
    throw new Error("User not found or already deleted");
  }
  return user;
}

module.exports = {
  getAllUsers,
  getUserById,   
  updateUser,   
  promoteToTeacher,
  softDeleteUser,
};