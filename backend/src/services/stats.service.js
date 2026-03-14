const supabase = require("../config/supabase");

const SUCCESS_STATUSES = ["COMPLETED", "SUCCESS", "PAID"];

async function getAdminStats() {
  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(`
      id,
      amount,
      status,
      created_at,
      users!payments_student_id_fkey (
        full_name,
        email
      ),
      courses (
        title
      )
    `)
    .in("status", SUCCESS_STATUSES)
    .order("created_at", { ascending: false });

  if (paymentsError) throw new Error(paymentsError.message);

  const { count: todaySessions, error: practiceError } = await supabase
    .from("pronunciation_practice")
    .select("*", { count: "exact", head: true })
    .gte("practiced_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
    .lt("practiced_at", new Date(new Date().setHours(24, 0, 0, 0)).toISOString());

  if (practiceError) throw new Error(practiceError.message);

  const totalRevenue = (payments || []).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  return {
    totalRevenue,
    todayPracticeSessions: Number(todaySessions || 0),
    recentPayments: (payments || []).slice(0, 20).map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at,
      student_name: p.users?.full_name || null,
      student_email: p.users?.email || null,
      course_title: p.courses?.title || null,
    })),
  };
}

async function getAdminRevenueDetail(filters = {}) {
  const { course_id, status } = filters;

  let recentQuery = supabase
    .from("payments")
    .select(`
      id,
      amount,
      status,
      created_at,
      course_id,
      student_id,
      users!payments_student_id_fkey (
        full_name,
        email
      ),
      courses (
        title,
        teacher_id,
        users!courses_teacher_id_fkey (
          full_name
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  if (course_id) recentQuery = recentQuery.eq("course_id", course_id);
  if (status) recentQuery = recentQuery.eq("status", status);

  const { data: allPayments, error: allPaymentsError } = await supabase
    .from("payments")
    .select("id, amount, status, created_at, course_id");

  if (allPaymentsError) throw new Error(allPaymentsError.message);

  const { data: recentPayments, error: recentError } = await recentQuery;
  if (recentError) throw new Error(recentError.message);

  const successPayments = (allPayments || []).filter((p) =>
    SUCCESS_STATUSES.includes(p.status)
  );

  const totalRevenue = successPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const successCount = successPayments.length;
  const totalCount = (allPayments || []).length;
  const otherCount = totalCount - successCount;

  const byMonthMap = new Map();
  for (const p of successPayments) {
    const d = new Date(p.created_at);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthKey = `${year}-${String(month).padStart(2, "0")}`;

    if (!byMonthMap.has(monthKey)) {
      byMonthMap.set(monthKey, {
        month_key: monthKey,
        year,
        month,
        revenue: 0,
        tx_count: 0,
      });
    }

    const item = byMonthMap.get(monthKey);
    item.revenue += Number(p.amount || 0);
    item.tx_count += 1;
  }

  const byMonth = [...byMonthMap.values()]
    .sort((a, b) => (a.month_key < b.month_key ? 1 : -1))
    .slice(0, 12);

  const courseIds = [...new Set(successPayments.map((p) => p.course_id).filter(Boolean))];

  let courseTitleMap = new Map();
  if (courseIds.length) {
    const { data: courseRows, error: courseError } = await supabase
      .from("courses")
      .select("id, title")
      .in("id", courseIds);

    if (courseError) throw new Error(courseError.message);
    courseTitleMap = new Map((courseRows || []).map((c) => [c.id, c.title]));
  }

  const byCourseMap = new Map();
  for (const p of successPayments) {
    const courseId = p.course_id || "unknown";
    if (!byCourseMap.has(courseId)) {
      byCourseMap.set(courseId, {
        course_id: p.course_id,
        course_title: courseTitleMap.get(p.course_id) || null,
        revenue: 0,
        tx_count: 0,
      });
    }

    const item = byCourseMap.get(courseId);
    item.revenue += Number(p.amount || 0);
    item.tx_count += 1;
  }

  const byCourse = [...byCourseMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const statusMap = new Map();
  for (const p of allPayments || []) {
    const st = p.status || "UNKNOWN";
    statusMap.set(st, (statusMap.get(st) || 0) + 1);
  }

  const statusCounts = [...statusMap.entries()].map(([statusName, cnt]) => ({
    status: statusName,
    cnt,
  }));

  return {
    totalRevenue,
    successCount,
    otherCount,
    totalCount,
    byMonth,
    byCourse,
    recentPayments: (recentPayments || []).map((p) => ({
      id: p.id,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at,
      student_name: p.users?.full_name || null,
      student_email: p.users?.email || null,
      course_title: p.courses?.title || null,
      teacher_name: p.courses?.users?.full_name || null,
    })),
    statusCounts,
  };
}

async function getTeacherStats(teacherId) {
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select(`
      student_id,
      courses!inner (
        teacher_id
      )
    `)
    .eq("courses.teacher_id", teacherId);

  if (enrollmentsError) throw new Error(enrollmentsError.message);

  const activeStudents = new Set(
    (enrollments || []).map((e) => e.student_id).filter(Boolean)
  ).size;

  const { data: teacherCourses, error: teacherCoursesError } = await supabase
    .from("courses")
    .select("id, status")
    .eq("teacher_id", teacherId);

  if (teacherCoursesError) throw new Error(teacherCoursesError.message);

  const draftCourses = (teacherCourses || []).filter((c) => c.status === "DRAFT").length;
  const teacherCourseIds = (teacherCourses || []).map((c) => c.id);

  let totalRevenue = 0;
  if (teacherCourseIds.length) {
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("amount, status, course_id")
      .in("course_id", teacherCourseIds)
      .in("status", SUCCESS_STATUSES);

    if (paymentsError) throw new Error(paymentsError.message);

    totalRevenue = (payments || []).reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );
  }

  return {
    activeStudents,
    totalRevenue,
    draftCourses,
  };
}

module.exports = { getAdminStats, getTeacherStats, getAdminRevenueDetail };