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
 * Public: list courses
 */
async function getAllCourses() {
  await poolConnect;
  const rs = await pool.request().query(`
    SELECT 
      c.id, c.teacher_id, c.title, c.description, c.price, c.status, 
      c.total_duration_minutes, c.created_at,
      u.full_name AS teacher_name, u.email AS teacher_email
    FROM courses c
    JOIN users u ON u.id = c.teacher_id
    WHERE u.is_active = 1 AND u.is_deleted = 0
    ORDER BY c.created_at DESC
  `);
  return rs.recordset;
}

/**
 * Public: get course detail
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
      JOIN users u ON u.id = c.teacher_id
      WHERE c.id = @course_id
    `);

  if (rs.recordset.length === 0) return null;
  return rs.recordset[0];
}

/**
 * Admin: create course and assign teacher_id
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

  if (!teacher_id) throw new Error("teacher_id là bắt buộc");
  if (!title || !title.trim()) throw new Error("title là bắt buộc");

  await poolConnect;
  await assertTeacher(teacher_id);

  // Nếu bạn CHƯA thêm created_by trong DB, hãy bỏ input created_by và cột created_by trong query.
  const req = pool.request()
    .input("teacher_id", sql.UniqueIdentifier, teacher_id)
    .input("title", sql.NVarChar(255), title.trim())
    .input("description", sql.NVarChar(sql.MAX), description ?? null)
    .input("price", sql.Decimal(12, 2), price ?? 0)
    .input("status", sql.NVarChar(20), status ?? "PUBLISHED")
    .input("total_duration_minutes", sql.Int, total_duration_minutes ?? 0)
    .input("created_by", sql.UniqueIdentifier, adminId);

  const rs = await req.query(`
    INSERT INTO courses 
      (teacher_id, title, description, price, status, total_duration_minutes, created_at, created_by)
    OUTPUT INSERTED.id
    VALUES 
      (@teacher_id, @title, @description, @price, @status, @total_duration_minutes, SYSDATETIMEOFFSET(), @created_by)
  `);

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
    .query(`SELECT id FROM courses WHERE id = @course_id`);

  if (exists.recordset.length === 0) throw new Error("course_id không tồn tại");

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

module.exports = {
  getAllCourses,
  getCourseById,
  createCourseByAdmin,
  assignTeacherToCourse,
};