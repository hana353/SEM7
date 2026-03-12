const { sql, getPool } = require("../config/db");

async function getUserById(userId) {
  const pool = await getPool();
  const rs = await pool
    .request()
    .input("id", sql.UniqueIdentifier, userId)
    .query(`
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
      WHERE u.id = @id AND u.is_deleted = 0
    `);
  return rs.recordset[0] || null;
}

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

const ROLE_IDS = { ADMIN: 1, TEACHER: 2, STUDENT: 3, GUEST: 4 };

async function changeRole(userId, newRoleCode) {
  const pool = await getPool();
  const roleId = ROLE_IDS[String(newRoleCode).toUpperCase()];
  if (!roleId || (roleId !== 2 && roleId !== 3)) {
    throw new Error("Chỉ được chuyển vai trò thành TEACHER hoặc STUDENT");
  }

  const rs = await pool
    .request()
    .input("id", sql.UniqueIdentifier, userId)
    .input("role_id", sql.SmallInt, roleId)
    .query(`
      UPDATE users
      SET role_id = @role_id,
          updated_at = SYSDATETIMEOFFSET()
      WHERE id = @id AND is_deleted = 0 AND role_id IN (2, 3);

      IF @@ROWCOUNT = 0
        THROW 50001, 'User not found or cannot change role (Admin cannot be changed)', 1;

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

  const user = (rs.recordsets?.[1] || rs.recordset || [])[0];
  if (!user) {
    throw new Error("User not found or cannot change role");
  }
  return user;
}

async function promoteToTeacher(userId) {
  return changeRole(userId, "TEACHER");
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
  getUserById,
  getAllUsers,
  promoteToTeacher,
  changeRole,
  softDeleteUser,
};

