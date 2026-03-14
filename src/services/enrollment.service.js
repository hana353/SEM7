const { pool, poolConnect, sql } = require("../config/db");

async function getStudentsByTeacherId(teacherId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .query(`
      SELECT 
        e.id, e.student_id, e.course_id, e.progress_percent, e.enrolled_at,
        u.full_name AS student_name, u.email AS student_email,
        c.title AS course_title
      FROM enrollments e
      JOIN users u ON u.id = e.student_id AND u.is_deleted = 0
      JOIN courses c ON c.id = e.course_id AND (c.status IS NULL OR c.status <> 'DELETED')
      WHERE c.teacher_id = @teacher_id
      ORDER BY e.enrolled_at DESC
    `);
  return rs.recordset;
}

module.exports = { getStudentsByTeacherId };
