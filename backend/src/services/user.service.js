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
  getUserById,
  getAllUsers,
  promoteToTeacher,
  softDeleteUser,
};

