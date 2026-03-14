const supabase = require("../config/supabase");

function normalizeCourse(row) {
  if (!row) return null;

  return {
    id: row.id,
    teacher_id: row.teacher_id,
    title: row.title,
    description: row.description,
    price: row.price,
    status: row.status,
    total_duration_minutes: row.total_duration_minutes,
    created_at: row.created_at,
    teacher_name: row.users?.full_name || null,
    teacher_email: row.users?.email || null,
  };
}

async function assertTeacher(teacherId) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      is_active,
      is_deleted,
      roles!users_role_id_fkey (
        code
      )
    `)
    .eq("id", teacherId)
    .eq("is_active", true)
    .eq("is_deleted", false)
    .single();

  if (error || !data) {
    throw new Error("teacher_id không tồn tại");
  }

  const roleCode = data.roles?.code || null;
  if (roleCode !== "TEACHER") {
    throw new Error("teacher_id phải là role TEACHER");
  }
}

async function getAllCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      teacher_id,
      title,
      description,
      price,
      status,
      total_duration_minutes,
      created_at,
      users!courses_teacher_id_fkey (
        full_name,
        email
      )
    `)
    .neq("status", "DELETED")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(normalizeCourse);
}

async function getCoursesForStudent(studentId) {
  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      enrolled_at,
      progress_percent,
      courses!inner (
        id,
        teacher_id,
        title,
        description,
        price,
        status,
        total_duration_minutes,
        created_at,
        users!courses_teacher_id_fkey (
          full_name,
          email
        )
      )
    `)
    .eq("student_id", studentId)
    .neq("courses.status", "DELETED")
    .order("enrolled_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((row) => {
    const course = normalizeCourse(row.courses);
    return {
      ...course,
      enrolled_at: row.enrolled_at,
      progress_percent: row.progress_percent,
    };
  });
}

async function getCoursesByTeacherId(teacherId) {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      teacher_id,
      title,
      description,
      price,
      status,
      total_duration_minutes,
      created_at,
      users!courses_teacher_id_fkey (
        full_name,
        email
      )
    `)
    .eq("teacher_id", teacherId)
    .neq("status", "DELETED")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(normalizeCourse);
}

async function getCourseById(courseId) {
  const { data, error } = await supabase
    .from("courses")
    .select(`
      id,
      teacher_id,
      title,
      description,
      price,
      status,
      total_duration_minutes,
      created_at,
      users!courses_teacher_id_fkey (
        full_name,
        email
      )
    `)
    .eq("id", courseId)
    .neq("status", "DELETED")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return normalizeCourse(data);
}

async function createCourseByAdmin(payload, adminId) {
  const {
    teacher_id,
    title,
    description,
    price,
    status,
    total_duration_minutes,
  } = payload;

  if (!title || !title.trim()) {
    throw new Error("title là bắt buộc");
  }

  if (!teacher_id) {
    throw new Error("teacher_id là bắt buộc - Admin phải gán giáo viên khi tạo khóa");
  }

  await assertTeacher(teacher_id);

  const insertPayload = {
    teacher_id,
    title: title.trim(),
    description: description ?? null,
    price: Number(price ?? 0),
    status: status ?? "PUBLISHED",
    total_duration_minutes: Number(total_duration_minutes ?? 0),
    created_by: adminId ?? null,
  };

  const { data, error } = await supabase
    .from("courses")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    if (error.message?.includes("created_by")) {
      const fallbackPayload = { ...insertPayload };
      delete fallbackPayload.created_by;

      const fallback = await supabase
        .from("courses")
        .insert(fallbackPayload)
        .select("id")
        .single();

      if (fallback.error) throw new Error(fallback.error.message);
      return { message: "Created course", course_id: fallback.data.id };
    }

    throw new Error(error.message);
  }

  return { message: "Created course", course_id: data.id };
}

async function assignTeacherToCourse(courseId, teacherId) {
  await assertTeacher(teacherId);

  const { data: exists, error: existsError } = await supabase
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .single();

  if (existsError || !exists) {
    throw new Error("course_id không tồn tại");
  }

  if (exists.status === "DELETED") {
    throw new Error("Khóa học đã bị xóa");
  }

  const { error } = await supabase
    .from("courses")
    .update({ teacher_id: teacherId })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  return { message: "Assigned teacher to course" };
}

async function updateCourseByAdmin(courseId, payload) {
  const { data: exists, error: existsError } = await supabase
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .single();

  if (existsError || !exists) {
    throw new Error("course_id không tồn tại");
  }

  if (exists.status === "DELETED") {
    throw new Error("Khóa học đã bị xóa");
  }

  const {
    teacher_id,
    title,
    description,
    price,
    status,
    total_duration_minutes,
  } = payload;

  if (teacher_id) {
    await assertTeacher(teacher_id);
  }

  const updatePayload = {};

  if (teacher_id !== undefined) {
    updatePayload.teacher_id = teacher_id ?? null;
  }

  if (title !== undefined) {
    if (!title || !title.trim()) {
      throw new Error("title không được rỗng");
    }
    updatePayload.title = title.trim();
  }

  if (description !== undefined) {
    updatePayload.description = description ?? null;
  }

  if (price !== undefined) {
    const p = Number(price);
    if (Number.isNaN(p) || p < 0) {
      throw new Error("price không hợp lệ");
    }
    updatePayload.price = p;
  }

  if (status !== undefined) {
    const allowed = ["DRAFT", "PUBLISHED", "ARCHIVED"];
    if (!allowed.includes(status)) {
      throw new Error(`status chỉ được phép: ${allowed.join(", ")} (xóa dùng DELETE)`);
    }
    updatePayload.status = status;
  }

  if (total_duration_minutes !== undefined) {
    const d = Number(total_duration_minutes);
    if (!Number.isInteger(d) || d < 0) {
      throw new Error("total_duration_minutes không hợp lệ");
    }
    updatePayload.total_duration_minutes = d;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("Không có field nào để cập nhật");
  }

  const { error } = await supabase
    .from("courses")
    .update(updatePayload)
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  return { message: "Updated course" };
}

async function softDeleteCourseByAdmin(courseId) {
  const { data: exists, error: existsError } = await supabase
    .from("courses")
    .select("id, status")
    .eq("id", courseId)
    .single();

  if (existsError || !exists) {
    throw new Error("course_id không tồn tại");
  }

  if (exists.status === "DELETED") {
    return { message: "Course already deleted" };
  }

  const { error } = await supabase
    .from("courses")
    .update({ status: "DELETED" })
    .eq("id", courseId);

  if (error) throw new Error(error.message);

  return { message: "Deleted course" };
}

module.exports = {
  getAllCourses,
  getCourseById,
  getCoursesByTeacherId,
  getCoursesForStudent,
  createCourseByAdmin,
  assignTeacherToCourse,
  updateCourseByAdmin,
  softDeleteCourseByAdmin,
};