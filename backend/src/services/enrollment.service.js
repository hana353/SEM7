const supabase = require("../config/supabase");

async function getStudentsByTeacherId(teacherId) {
  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      id,
      student_id,
      course_id,
      progress_percent,
      enrolled_at,
      users!enrollments_student_id_fkey (
        full_name,
        email,
        is_deleted
      ),
      courses!inner (
        title,
        teacher_id,
        status
      )
    `)
    .eq("courses.teacher_id", teacherId)
    .neq("courses.status", "DELETED")
    .order("enrolled_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || [])
    .filter((row) => !row.users?.is_deleted)
    .map((row) => ({
      id: row.id,
      student_id: row.student_id,
      course_id: row.course_id,
      progress_percent: row.progress_percent,
      enrolled_at: row.enrolled_at,
      student_name: row.users?.full_name || null,
      student_email: row.users?.email || null,
      course_title: row.courses?.title || null,
    }));
}

module.exports = { getStudentsByTeacherId };