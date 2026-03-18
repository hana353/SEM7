const supabase = require("../config/supabase");
const { createNotification } = require("./notification.service");

async function assertCourseAssignedToTeacher(teacherId, courseId) {
  const { data, error } = await supabase
    .from("courses")
    .select("id, status, teacher_id")
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .single();

  if (error || !data || data.status === "ARCHIVED") {
    throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");
  }
}

async function getLecturesByCourseId(courseId, { onlyApprovedPublic = false } = {}) {
  let query = supabase
    .from("lectures")
    .select(
      "id, course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at, approved_by, approved_at, rejection_reason, created_at, updated_at"
    )
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (onlyApprovedPublic) {
    query = query.eq("status", "APPROVED_PUBLIC");
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

async function teacherGetAllLectures(teacherId) {
  const { data, error } = await supabase
    .from("lectures")
    .select(`
      id,
      course_id,
      teacher_id,
      title,
      video_url,
      duration_minutes,
      order_index,
      status,
      submitted_at,
      approved_by,
      approved_at,
      rejection_reason,
      courses!inner (
        title,
        teacher_id,
        status
      )
    `)
    .eq("courses.teacher_id", teacherId)
    .neq("courses.status", "ARCHIVED")
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
  return getLecturesByCourseId(courseId, { onlyApprovedPublic: true });
}

async function teacherCreateLecture(teacherId, courseId, payload) {
  await assertCourseAssignedToTeacher(teacherId, courseId);

  const title = String(payload.title || "").trim();
  if (!title) throw new Error("title là bắt buộc");

  const video_url = payload.video_url ? String(payload.video_url).trim() : null;
  const duration_minutes = Number(payload.duration_minutes) || 0;
  const order_index = Number.isNaN(Number(payload.order_index)) ? 0 : Number(payload.order_index);
  const status = payload.status ? String(payload.status).trim() : "DRAFT";

  const allowed = ["DRAFT", "PENDING_APPROVAL"];
  if (!allowed.includes(status)) {
    throw new Error(`status chỉ được phép: ${allowed.join(", ")}`);
  }

  const { data, error } = await supabase
    .from("lectures")
    .insert({
      course_id: courseId,
      teacher_id: teacherId,
      title,
      video_url,
      duration_minutes,
      order_index,
      status,
      submitted_at: status === "PENDING_APPROVAL" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
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
      status,
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

  if (payload.status !== undefined) {
    const nextStatus = String(payload.status || "").trim();
    const allowed = ["DRAFT", "PENDING_APPROVAL"];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`status chỉ được phép: ${allowed.join(", ")}`);
    }

    if (owned.status === "APPROVED_PUBLIC" && nextStatus === "PENDING_APPROVAL") {
      throw new Error("Bài giảng đã public, không thể chuyển về chờ duyệt");
    }

    updates.status = nextStatus;
    updates.submitted_at = nextStatus === "PENDING_APPROVAL" ? new Date().toISOString() : null;
    if (nextStatus !== "PENDING_APPROVAL") {
      updates.rejection_reason = null;
    }
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

  updates.updated_at = new Date().toISOString();

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
  adminGetPendingLectures,
  adminApproveLecture,
  adminRejectLecture,
};

async function adminGetPendingLectures() {
  const { data, error } = await supabase
    .from("lectures")
    .select(
      `
      id,
      course_id,
      teacher_id,
      title,
      video_url,
      duration_minutes,
      order_index,
      status,
      submitted_at,
      created_at,
      updated_at,
      courses (
        title
      ),
      users!lectures_teacher_id_fkey (
        full_name,
        email
      )
    `
    )
    .eq("status", "PENDING_APPROVAL")
    .order("submitted_at", { ascending: true });

  if (error) throw new Error(error.message);
  return { data: data || [] };
}

async function adminApproveLecture(adminId, lectureId) {
  const { data: lecture, error: fetchError } = await supabase
    .from("lectures")
    .select("id, teacher_id, status, title, course_id")
    .eq("id", lectureId)
    .single();

  if (fetchError || !lecture) throw new Error("Lecture not found");
  if (lecture.status !== "PENDING_APPROVAL") {
    throw new Error("Lecture không ở trạng thái PENDING_APPROVAL");
  }

  const { data: updated, error } = await supabase
    .from("lectures")
    .update({
      status: "APPROVED_PUBLIC",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lectureId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  if (lecture.teacher_id) {
    try {
      await createNotification({
        userId: lecture.teacher_id,
        type: "LECTURE_APPROVED",
        title: "Bài giảng đã được duyệt",
        body: `Bài giảng "${lecture.title}" đã được admin duyệt và đăng public.`,
        metadata: { lecture_id: lecture.id, course_id: lecture.course_id },
      });
    } catch (e) {
      // ignore
    }
  }

  return updated;
}

async function adminRejectLecture(adminId, lectureId, { reason } = {}) {
  const rejectReason = String(reason || "").trim();
  if (!rejectReason) throw new Error("reason là bắt buộc");

  const { data: lecture, error: fetchError } = await supabase
    .from("lectures")
    .select("id, teacher_id, status, title, course_id")
    .eq("id", lectureId)
    .single();

  if (fetchError || !lecture) throw new Error("Lecture not found");
  if (lecture.status !== "PENDING_APPROVAL") {
    throw new Error("Lecture không ở trạng thái PENDING_APPROVAL");
  }

  const { data: updated, error } = await supabase
    .from("lectures")
    .update({
      status: "REJECTED",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      rejection_reason: rejectReason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lectureId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  if (lecture.teacher_id) {
    try {
      await createNotification({
        userId: lecture.teacher_id,
        type: "LECTURE_REJECTED",
        title: "Bài giảng bị từ chối",
        body: `Bài giảng "${lecture.title}" bị từ chối. Lý do: ${rejectReason}`,
        metadata: { lecture_id: lecture.id, course_id: lecture.course_id, reason: rejectReason },
      });
    } catch (e) {
      // ignore
    }
  }

  return updated;
}