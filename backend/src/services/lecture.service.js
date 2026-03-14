const supabase = require("../config/supabase");

async function assertCourseAssignedToTeacher(teacherId, courseId) {
  const { data, error } = await supabase
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .single();

  if (error || !data || data.status === "DELETED") {
    throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");
  }
}

async function getLecturesByCourseId(courseId) {
  const { data, error } = await supabase
    .from("lectures")
    .select("id, course_id, title, video_url, duration_minutes, order_index, created_at")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

async function teacherGetAllLectures(teacherId) {
  const { data, error } = await supabase
    .from("lectures")
    .select(`
      id,
      course_id,
      title,
      video_url,
      duration_minutes,
      order_index,
      courses!inner (
        title,
        teacher_id,
        status
      )
    `)
    .eq("courses.teacher_id", teacherId)
    .neq("courses.status", "DELETED")
    .order("order_index", { ascending: true });

  if (error) throw new Error(error.message);

  return (data || []).map((row) => ({
    id: row.id,
    course_id: row.course_id,
    title: row.title,
    video_url: row.video_url,
    duration_minutes: row.duration_minutes,
    order_index: row.order_index,
    course_title: row.courses?.title || null,
  }));
}

async function teacherGetLectures(teacherId, courseId) {
  await assertCourseAssignedToTeacher(teacherId, courseId);
  return getLecturesByCourseId(courseId);
}

async function assertStudentEnrolled(studentId, courseId) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Bạn chưa đăng ký khóa học này");
}

async function studentGetLectures(studentId, courseId) {
  await assertStudentEnrolled(studentId, courseId);
  return getLecturesByCourseId(courseId);
}

async function teacherCreateLecture(teacherId, courseId, payload) {
  await assertCourseAssignedToTeacher(teacherId, courseId);

  const title = String(payload.title || "").trim();
  if (!title) throw new Error("title là bắt buộc");

  const video_url = payload.video_url ? String(payload.video_url).trim() : null;
  const duration_minutes = Number(payload.duration_minutes) || 0;
  const order_index = Number.isNaN(Number(payload.order_index)) ? 0 : Number(payload.order_index);

  const { data, error } = await supabase
    .from("lectures")
    .insert({
      course_id: courseId,
      title,
      video_url,
      duration_minutes,
      order_index,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function teacherUpdateLecture(teacherId, lectureId, payload) {
  const { data: owned, error: ownedError } = await supabase
    .from("lectures")
    .select(`
      id,
      course_id,
      courses!inner (
        teacher_id
      )
    `)
    .eq("id", lectureId)
    .eq("courses.teacher_id", teacherId)
    .single();

  if (ownedError || !owned) {
    throw new Error("Bài giảng không tồn tại hoặc không thuộc khóa học của giáo viên");
  }

  const updates = {};

  if (payload.title !== undefined) {
    const t = String(payload.title || "").trim();
    if (!t) throw new Error("title không được rỗng");
    updates.title = t;
  }

  if (payload.video_url !== undefined) {
    updates.video_url = payload.video_url ? String(payload.video_url).trim() : null;
  }

  if (payload.duration_minutes !== undefined) {
    updates.duration_minutes = Number(payload.duration_minutes) || 0;
  }

  if (payload.order_index !== undefined) {
    const oi = Number(payload.order_index);
    if (Number.isNaN(oi)) throw new Error("order_index không hợp lệ");
    updates.order_index = oi;
  }

  if (Object.keys(updates).length === 0) {
    const { data, error } = await supabase
      .from("lectures")
      .select("*")
      .eq("id", lectureId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await supabase
    .from("lectures")
    .update(updates)
    .eq("id", lectureId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function teacherDeleteLecture(teacherId, lectureId) {
  const { data: owned, error: ownedError } = await supabase
    .from("lectures")
    .select(`
      id,
      courses!inner (
        teacher_id
      )
    `)
    .eq("id", lectureId)
    .eq("courses.teacher_id", teacherId)
    .single();

  if (ownedError || !owned) {
    throw new Error("Bài giảng không tồn tại hoặc không thuộc khóa học của giáo viên");
  }

  const { error } = await supabase
    .from("lectures")
    .delete()
    .eq("id", lectureId);

  if (error) throw new Error(error.message);
  return { message: "Deleted" };
}

module.exports = {
  getLecturesByCourseId,
  teacherGetAllLectures,
  teacherGetLectures,
  teacherCreateLecture,
  teacherUpdateLecture,
  teacherDeleteLecture,
  studentGetLectures,
};