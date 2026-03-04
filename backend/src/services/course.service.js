// src/services/course.service.js
const { pool, poolConnect, sql } = require("../config/db");

/**
 * Validate teacher exists and role is TEACHER
 */
async function assertTeacher(teacherId) {
  const t = await pool.request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .query(`
      SELECT u.id, r.code AS role_code
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.id = @teacher_id AND u.is_active = 1 AND u.is_deleted = 0
    `);

  if (t.recordset.length === 0) throw new Error("teacher_id không tồn tại");
  if (t.recordset[0].role_code !== "TEACHER")
    throw new Error("teacher_id phải là role TEACHER");
}

/**
 * Helper: check if a column exists in a table (SQL Server)
 */
async function hasColumn(tableName, columnName) {
  const rs = await pool.request()
    .input("table", sql.NVarChar, tableName)
    .input("col", sql.NVarChar, columnName)
    .query(`
      SELECT 1 AS ok
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @table AND COLUMN_NAME = @col
    `);

  return rs.recordset.length > 0;
}

/**
 * Public: list courses (ẩn course đã xóa: status = 'DELETED')
 * NOTE: dùng LEFT JOIN để course chưa assign teacher vẫn hiện (teacher_* có thể null)
 */
async function getAllCourses() {
  await poolConnect;

  const rs = await pool.request().query(`
    SELECT 
      c.id, c.teacher_id, c.title, c.description, c.price, c.status, 
      c.total_duration_minutes, c.created_at,
      u.full_name AS teacher_name, u.email AS teacher_email
    FROM courses c
    LEFT JOIN users u 
      ON u.id = c.teacher_id AND u.is_active = 1 AND u.is_deleted = 0
    WHERE (c.status IS NULL OR c.status <> 'DELETED')
    ORDER BY c.created_at DESC
  `);

  return rs.recordset;
}

/**
 * Public: get course detail (ẩn course đã xóa: status = 'DELETED')
 * NOTE: dùng LEFT JOIN để course chưa assign teacher vẫn xem được
 */
async function getCourseById(courseId) {
  await poolConnect;

  const rs = await pool.request()
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`
      SELECT 
        c.id, c.teacher_id, c.title, c.description, c.price, c.status, 
        c.total_duration_minutes, c.created_at,
        u.full_name AS teacher_name, u.email AS teacher_email
      FROM courses c
      LEFT JOIN users u 
        ON u.id = c.teacher_id AND u.is_active = 1 AND u.is_deleted = 0
      WHERE c.id = @course_id
        AND (c.status IS NULL OR c.status <> 'DELETED')
    `);

  if (rs.recordset.length === 0) return null;
  return rs.recordset[0];
}

/**
 * Admin: create course
 * - Nếu teacher_id có gửi: validate teacher
 * - Nếu teacher_id không gửi: vẫn tạo được (teacher_id null) để admin assign sau
 * - Tự detect created_by có tồn tại hay không để tránh lỗi DB
 */
async function createCourseByAdmin(payload, adminId) {
  const {
    teacher_id,
    title,
    description,
    price,
    status,
    total_duration_minutes,
  } = payload;

  if (!title || !title.trim()) throw new Error("title là bắt buộc");

  await poolConnect;

  if (teacher_id) await assertTeacher(teacher_id);

  const createdByExists = await hasColumn("courses", "created_by");

  const req = pool.request()
    .input("teacher_id", sql.UniqueIdentifier, teacher_id ?? null)
    .input("title", sql.NVarChar(255), title.trim())
    .input("description", sql.NVarChar(sql.MAX), description ?? null)
    .input("price", sql.Decimal(12, 2), price ?? 0)
    .input("status", sql.NVarChar(20), status ?? "PUBLISHED")
    .input("total_duration_minutes", sql.Int, total_duration_minutes ?? 0);

  if (createdByExists) {
    req.input("created_by", sql.UniqueIdentifier, adminId);
  }

  const insertSql = createdByExists
    ? `
      INSERT INTO courses 
        (teacher_id, title, description, price, status, total_duration_minutes, created_at, created_by)
      OUTPUT INSERTED.id
      VALUES 
        (@teacher_id, @title, @description, @price, @status, @total_duration_minutes, SYSDATETIMEOFFSET(), @created_by)
    `
    : `
      INSERT INTO courses 
        (teacher_id, title, description, price, status, total_duration_minutes, created_at)
      OUTPUT INSERTED.id
      VALUES 
        (@teacher_id, @title, @description, @price, @status, @total_duration_minutes, SYSDATETIMEOFFSET())
    `;

  const rs = await req.query(insertSql);
  return { message: "Created course", course_id: rs.recordset[0].id };
}

/**
 * Admin: assign/replace teacher for an existing course
 */
async function assignTeacherToCourse(courseId, teacherId) {
  await poolConnect;
  await assertTeacher(teacherId);

  const exists = await pool.request()
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`SELECT id, status FROM courses WHERE id = @course_id`);

  if (exists.recordset.length === 0) throw new Error("course_id không tồn tại");
  if (exists.recordset[0].status === "DELETED") throw new Error("Khóa học đã bị xóa");

  await pool.request()
    .input("course_id", sql.UniqueIdentifier, courseId)
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .query(`
      UPDATE courses
      SET teacher_id = @teacher_id
      WHERE id = @course_id
    `);

  return { message: "Assigned teacher to course" };
}

/**
 * Admin: update course fields
 * Allowed: teacher_id, title, description, price, status, total_duration_minutes
 * Note: xóa dùng DELETE (soft delete), không cho set status=DELETED ở đây
 */
async function updateCourseByAdmin(courseId, payload) {
  await poolConnect;

  const exists = await pool.request()
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`SELECT id, status FROM courses WHERE id = @course_id`);

  if (exists.recordset.length === 0) throw new Error("course_id không tồn tại");
  if (exists.recordset[0].status === "DELETED") throw new Error("Khóa học đã bị xóa");

  const {
    teacher_id,
    title,
    description,
    price,
    status,
    total_duration_minutes,
  } = payload;

  if (teacher_id) await assertTeacher(teacher_id);

  const sets = [];
  const req = pool.request().input("course_id", sql.UniqueIdentifier, courseId);

  if (teacher_id !== undefined) {
    // cho phép set null nếu muốn bỏ teacher (gửi teacher_id=null)
    sets.push("teacher_id = @teacher_id");
    req.input("teacher_id", sql.UniqueIdentifier, teacher_id ?? null);
  }

  if (title !== undefined) {
    if (!title || !title.trim()) throw new Error("title không được rỗng");
    sets.push("title = @title");
    req.input("title", sql.NVarChar(255), title.trim());
  }

  if (description !== undefined) {
    sets.push("description = @description");
    req.input("description", sql.NVarChar(sql.MAX), description ?? null);
  }

  if (price !== undefined) {
    const p = Number(price);
    if (Number.isNaN(p) || p < 0) throw new Error("price không hợp lệ");
    sets.push("price = @price");
    req.input("price", sql.Decimal(12, 2), p);
  }

  if (status !== undefined) {
    const allowed = ["DRAFT", "PUBLISHED", "ARCHIVED"];
    if (!allowed.includes(status)) {
      throw new Error(`status chỉ được phép: ${allowed.join(", ")} (xóa dùng DELETE)`);
    }
    sets.push("status = @status");
    req.input("status", sql.NVarChar(20), status);
  }

  if (total_duration_minutes !== undefined) {
    const d = Number(total_duration_minutes);
    if (!Number.isInteger(d) || d < 0) throw new Error("total_duration_minutes không hợp lệ");
    sets.push("total_duration_minutes = @total_duration_minutes");
    req.input("total_duration_minutes", sql.Int, d);
  }

  if (sets.length === 0) throw new Error("Không có field nào để cập nhật");

  await req.query(`
    UPDATE courses
    SET ${sets.join(", ")}
    WHERE id = @course_id
  `);

  return { message: "Updated course" };
}

/**
 * Admin: soft delete course (status = DELETED)
 */
async function softDeleteCourseByAdmin(courseId) {
  await poolConnect;

  const exists = await pool.request()
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`SELECT id, status FROM courses WHERE id = @course_id`);

  if (exists.recordset.length === 0) throw new Error("course_id không tồn tại");
  if (exists.recordset[0].status === "DELETED") {
    return { message: "Course already deleted" };
  }

  await pool.request()
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`
      UPDATE courses
      SET status = 'DELETED'
      WHERE id = @course_id
    `);

  return { message: "Deleted course" };
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourseByAdmin,
  assignTeacherToCourse,
  updateCourseByAdmin,
  softDeleteCourseByAdmin,
};