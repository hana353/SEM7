const { pool, poolConnect, sql } = require("../config/db");

async function getAdminStats() {
  await poolConnect;
  const [rev, practice] = await Promise.all([
    pool.request().query(`
      SELECT ISNULL(SUM(amount), 0) AS total_revenue
      FROM payments WHERE status IN ('COMPLETED', 'SUCCESS', 'PAID')
    `),
    pool.request().query(`
      SELECT COUNT(*) AS today_sessions
      FROM pronunciation_practice
      WHERE CAST(practiced_at AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
    `),
  ]);
  return {
    totalRevenue: Number(rev.recordset[0]?.total_revenue ?? 0),
    todayPracticeSessions: Number(practice.recordset[0]?.today_sessions ?? 0),
  };
}

async function getTeacherStats(teacherId) {
  await poolConnect;
  const [students, revenue, draft] = await Promise.all([
    pool
      .request()
      .input("teacher_id", sql.UniqueIdentifier, teacherId)
      .query(`
        SELECT COUNT(DISTINCT e.student_id) AS cnt
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id AND c.teacher_id = @teacher_id
      `),
    pool
      .request()
      .input("teacher_id", sql.UniqueIdentifier, teacherId)
      .query(`
        SELECT ISNULL(SUM(p.amount), 0) AS total
        FROM payments p
        JOIN enrollments e ON e.id = p.enrollment_id
        JOIN courses c ON c.id = e.course_id AND c.teacher_id = @teacher_id
        WHERE p.status IN ('COMPLETED', 'SUCCESS', 'PAID')
      `),
    pool
      .request()
      .input("teacher_id", sql.UniqueIdentifier, teacherId)
      .query(`
        SELECT COUNT(*) AS cnt FROM courses
        WHERE teacher_id = @teacher_id AND status = 'DRAFT'
      `),
  ]);
  return {
    activeStudents: Number(students.recordset[0]?.cnt ?? 0),
    totalRevenue: Number(revenue.recordset[0]?.total ?? 0),
    draftCourses: Number(draft.recordset[0]?.cnt ?? 0),
  };
}

module.exports = { getAdminStats, getTeacherStats };
