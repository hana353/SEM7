const { pool, poolConnect, sql } = require("../config/db");

async function getAdminStats() {
  await poolConnect;
  const [rev, practice, recent] = await Promise.all([
    pool.request().query(`
      SELECT ISNULL(SUM(amount), 0) AS total_revenue
      FROM payments WHERE status IN ('COMPLETED', 'SUCCESS', 'PAID')
    `),
    pool.request().query(`
      SELECT COUNT(*) AS today_sessions
      FROM pronunciation_practice
      WHERE CAST(practiced_at AS DATE) = CAST(SYSDATETIMEOFFSET() AS DATE)
    `),
    pool.request().query(`
      SELECT TOP 20
        p.id, p.amount, p.status, p.created_at,
        u.full_name AS student_name, u.email AS student_email,
        c.title AS course_title
      FROM payments p
      LEFT JOIN users u ON u.id = p.student_id
      LEFT JOIN courses c ON c.id = p.course_id
      WHERE p.status IN ('COMPLETED', 'SUCCESS', 'PAID')
      ORDER BY p.created_at DESC
    `),
  ]);
  return {
    totalRevenue: Number(rev.recordset[0]?.total_revenue ?? 0),
    todayPracticeSessions: Number(practice.recordset[0]?.today_sessions ?? 0),
    recentPayments: recent.recordset || [],
  };
}

async function getAdminRevenueDetail() {
  await poolConnect;
  const [
    summary,
    byMonth,
    byCourse,
    recentPayments,
    statusCounts,
  ] = await Promise.all([
    pool.request().query(`
      SELECT
        ISNULL(SUM(CASE WHEN status IN ('COMPLETED', 'SUCCESS', 'PAID') THEN amount ELSE 0 END), 0) AS total_revenue,
        COUNT(CASE WHEN status IN ('COMPLETED', 'SUCCESS', 'PAID') THEN 1 END) AS success_count,
        COUNT(CASE WHEN status NOT IN ('COMPLETED', 'SUCCESS', 'PAID') OR status IS NULL THEN 1 END) AS other_count,
        COUNT(*) AS total_count
      FROM payments
    `),
    pool.request().query(`
      SELECT TOP 12
        FORMAT(created_at, 'yyyy-MM') AS month_key,
        YEAR(created_at) AS year,
        MONTH(created_at) AS month,
        ISNULL(SUM(amount), 0) AS revenue,
        COUNT(*) AS tx_count
      FROM payments
      WHERE status IN ('COMPLETED', 'SUCCESS', 'PAID')
      GROUP BY YEAR(created_at), MONTH(created_at), FORMAT(created_at, 'yyyy-MM')
      ORDER BY year DESC, month DESC
    `),
    pool.request().query(`
      SELECT TOP 10
        c.id AS course_id,
        c.title AS course_title,
        ISNULL(SUM(p.amount), 0) AS revenue,
        COUNT(*) AS tx_count
      FROM payments p
      LEFT JOIN courses c ON c.id = p.course_id
      WHERE p.status IN ('COMPLETED', 'SUCCESS', 'PAID')
      GROUP BY c.id, c.title
      ORDER BY SUM(p.amount) DESC
    `),
    pool.request().query(`
      SELECT TOP 50
        p.id, p.amount, p.status, p.created_at,
        u.full_name AS student_name, u.email AS student_email,
        c.title AS course_title, t.full_name AS teacher_name
      FROM payments p
      LEFT JOIN users u ON u.id = p.student_id
      LEFT JOIN courses c ON c.id = p.course_id
      LEFT JOIN users t ON t.id = c.teacher_id
      ORDER BY p.created_at DESC
    `),
    pool.request().query(`
      SELECT status, COUNT(*) AS cnt
      FROM payments
      GROUP BY status
    `),
  ]);

  return {
    totalRevenue: Number(summary.recordset[0]?.total_revenue ?? 0),
    successCount: Number(summary.recordset[0]?.success_count ?? 0),
    otherCount: Number(summary.recordset[0]?.other_count ?? 0),
    totalCount: Number(summary.recordset[0]?.total_count ?? 0),
    byMonth: byMonth.recordset || [],
    byCourse: byCourse.recordset || [],
    recentPayments: recentPayments.recordset || [],
    statusCounts: statusCounts.recordset || [],
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

module.exports = { getAdminStats, getTeacherStats, getAdminRevenueDetail };
