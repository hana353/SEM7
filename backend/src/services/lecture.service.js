// src/services/lecture.service.js
const { pool, poolConnect, sql } = require("../config/db");

async function assertCourseAssignedToTeacher(teacherId, courseId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`
      SELECT id FROM courses
      WHERE id = @course_id AND teacher_id = @teacher_id
        AND (status IS NULL OR status <> 'DELETED')
    `);
  if (rs.recordset.length === 0) {
    throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");
  }
}

async function teacherGetAllLectures(teacherId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .query(`
      SELECT l.id, l.course_id, l.title, l.video_url, l.duration_minutes, l.order_index,
        c.title AS course_title
      FROM lectures l
      JOIN courses c ON c.id = l.course_id AND c.teacher_id = @teacher_id
      WHERE (c.status IS NULL OR c.status <> 'DELETED')
      ORDER BY c.title, l.order_index
    `);
  return rs.recordset;
}

async function getLecturesByCourseId(courseId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("course_id", sql.UniqueIdentifier, courseId)
    .query(`
      SELECT id, course_id, title, video_url, duration_minutes, order_index
      FROM lectures
      WHERE course_id = @course_id
      ORDER BY order_index ASC, id ASC
    `);
  return rs.recordset;
}

async function teacherGetLectures(teacherId, courseId) {
  await assertCourseAssignedToTeacher(teacherId, courseId);
  return getLecturesByCourseId(courseId);
}

async function teacherCreateLecture(teacherId, courseId, payload) {
  await assertCourseAssignedToTeacher(teacherId, courseId);

  const title = String(payload.title || "").trim();
  if (!title) throw new Error("title là bắt buộc");

  const videoUrl = payload.video_url ? String(payload.video_url).trim() : null;
  const durationMinutes = Number(payload.duration_minutes) || 0;
  const orderIndex = Number(payload.order_index) ?? 0;

  await poolConnect;
  const rs = await pool
    .request()
    .input("course_id", sql.UniqueIdentifier, courseId)
    .input("title", sql.NVarChar(255), title)
    .input("video_url", sql.NVarChar(500), videoUrl)
    .input("duration_minutes", sql.Int, durationMinutes)
    .input("order_index", sql.Int, orderIndex)
    .query(`
      INSERT INTO lectures (course_id, title, video_url, duration_minutes, order_index)
      OUTPUT INSERTED.*
      VALUES (@course_id, @title, @video_url, @duration_minutes, @order_index)
    `);
  return rs.recordset[0];
}

async function teacherUpdateLecture(teacherId, lectureId, payload) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("id", sql.UniqueIdentifier, lectureId)
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .query(`
      SELECT l.id
      FROM lectures l
      JOIN courses c ON c.id = l.course_id
      WHERE l.id = @id AND c.teacher_id = @teacher_id
    `);
  if (rs.recordset.length === 0) {
    throw new Error("Bài giảng không tồn tại hoặc không thuộc khóa học của giáo viên");
  }

  const updates = [];
  const r2 = pool.request().input("lecture_id", sql.UniqueIdentifier, lectureId);

  if (payload.title !== undefined) {
    const t = String(payload.title || "").trim();
    if (!t) throw new Error("title không được rỗng");
    updates.push("title = @title");
    r2.input("title", sql.NVarChar(255), t);
  }
  if (payload.video_url !== undefined) {
    updates.push("video_url = @video_url");
    r2.input("video_url", sql.NVarChar(500), payload.video_url ? String(payload.video_url).trim() : null);
  }
  if (payload.duration_minutes !== undefined) {
    updates.push("duration_minutes = @duration_minutes");
    r2.input("duration_minutes", sql.Int, Number(payload.duration_minutes) || 0);
  }
  if (payload.order_index !== undefined) {
    updates.push("order_index = @order_index");
    r2.input("order_index", sql.Int, Number(payload.order_index) ?? 0);
  }

  if (updates.length === 0) {
    const out = await pool.request().input("id", sql.UniqueIdentifier, lectureId).query(`
      SELECT id, course_id, title, video_url, duration_minutes, order_index FROM lectures WHERE id = @id
    `);
    return out.recordset[0];
  }

  await r2.query(`
    UPDATE lectures SET ${updates.join(", ")} WHERE id = @lecture_id
  `);
  const out = await pool.request().input("id", sql.UniqueIdentifier, lectureId).query(`
    SELECT id, course_id, title, video_url, duration_minutes, order_index FROM lectures WHERE id = @id
  `);
  return out.recordset[0];
}

async function teacherDeleteLecture(teacherId, lectureId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("id", sql.UniqueIdentifier, lectureId)
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .query(`
      SELECT l.id
      FROM lectures l
      JOIN courses c ON c.id = l.course_id
      WHERE l.id = @id AND c.teacher_id = @teacher_id
    `);
  if (rs.recordset.length === 0) {
    throw new Error("Bài giảng không tồn tại hoặc không thuộc khóa học của giáo viên");
  }
  await pool.request().input("id", sql.UniqueIdentifier, lectureId).query(`DELETE FROM lectures WHERE id = @id`);
  return { message: "Deleted" };
}

module.exports = {
  getLecturesByCourseId,
  teacherGetAllLectures,
  teacherGetLectures,
  teacherCreateLecture,
  teacherUpdateLecture,
  teacherDeleteLecture,
};
