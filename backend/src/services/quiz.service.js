// src/services/quiz.service.js
const { pool, poolConnect, sql } = require("../config/db");

const ALLOWED_STATUS = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);

function normalizeStatus(s) {
  if (s === null || s === undefined) return null;
  const v = String(s).toUpperCase();
  if (!ALLOWED_STATUS.has(v)) throw new Error("status không hợp lệ (DRAFT|PUBLISHED|ARCHIVED)");
  return v;
}

async function assertQuizSetOwnedByTeacher(teacherId, quizSetId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .input("id", sql.UniqueIdentifier, quizSetId)
    .query(`
      SELECT id
      FROM quiz_sets
      WHERE id = @id AND teacher_id = @teacher_id AND is_deleted = 0
    `);

  if (rs.recordset.length === 0) {
    throw new Error("Quiz set không tồn tại hoặc không thuộc quyền TEACHER");
  }
}

async function assertCardOwnedByTeacher(teacherId, cardId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .input("card_id", sql.UniqueIdentifier, cardId)
    .query(`
      SELECT c.id, c.quiz_set_id
      FROM quiz_cards c
      JOIN quiz_sets s ON s.id = c.quiz_set_id
      WHERE c.id = @card_id
        AND c.is_deleted = 0
        AND s.is_deleted = 0
        AND s.teacher_id = @teacher_id
    `);

  if (rs.recordset.length === 0) {
    throw new Error("Card không tồn tại hoặc không thuộc quyền TEACHER");
  }
  return rs.recordset[0].quiz_set_id;
}

module.exports = {
  // ===== PUBLIC =====
  async publicListPublished({ courseId }) {
    await poolConnect;
    const rs = await pool
      .request()
      .input("course_id", sql.UniqueIdentifier, courseId)
      .query(`
        SELECT id, teacher_id, course_id, title, description, status, created_at, updated_at
        FROM quiz_sets
        WHERE is_deleted = 0
          AND status = 'PUBLISHED'
          AND (@course_id IS NULL OR course_id = @course_id)
        ORDER BY updated_at DESC
      `);
    return rs.recordset;
  },

  async publicGetPublishedDetail(quizSetId) {
    await poolConnect;

    const header = await pool
      .request()
      .input("id", sql.UniqueIdentifier, quizSetId)
      .query(`
        SELECT id, teacher_id, course_id, title, description, status, created_at, updated_at
        FROM quiz_sets
        WHERE id = @id AND is_deleted = 0 AND status = 'PUBLISHED'
      `);

    if (header.recordset.length === 0) {
      throw new Error("Quiz set không tồn tại hoặc chưa publish");
    }

    const cards = await pool
      .request()
      .input("id", sql.UniqueIdentifier, quizSetId)
      .query(`
        SELECT id, quiz_set_id, front_text, back_text, front_image_url, back_image_url, position
        FROM quiz_cards
        WHERE quiz_set_id = @id AND is_deleted = 0
        ORDER BY position ASC, created_at ASC
      `);

    return { ...header.recordset[0], cards: cards.recordset };
  },

  // ===== TEACHER: QUIZ SET =====
  async teacherCreateQuizSet(teacherId, payload) {
    await poolConnect;

    const title = String(payload.title || "").trim();
    if (!title) throw new Error("title là bắt buộc");

    const status = normalizeStatus(payload.status || "DRAFT");
    const courseId = payload.course_id ?? null;
    const description = payload.description ?? null;

    if (courseId) {
      const c = await pool.request()
        .input("course_id", sql.UniqueIdentifier, courseId)
        .input("teacher_id", sql.UniqueIdentifier, teacherId)
        .query(`SELECT id FROM courses WHERE id = @course_id AND teacher_id = @teacher_id AND (status IS NULL OR status <> 'DELETED')`);
      if (c.recordset.length === 0) throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");
    }

    const rs = await pool
      .request()
      .input("teacher_id", sql.UniqueIdentifier, teacherId)
      .input("course_id", sql.UniqueIdentifier, courseId)
      .input("title", sql.NVarChar(255), title)
      .input("description", sql.NVarChar(sql.MAX), description)
      .input("status", sql.NVarChar(20), status)
      .query(`
        INSERT INTO quiz_sets (teacher_id, course_id, title, description, status, is_deleted, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@teacher_id, @course_id, @title, @description, @status, 0, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET())
      `);

    return rs.recordset[0];
  },

  async teacherListQuizSets(teacherId, { courseId, status }) {
    await poolConnect;
    const st = status ? normalizeStatus(status) : null;

    const rs = await pool
      .request()
      .input("teacher_id", sql.UniqueIdentifier, teacherId)
      .input("course_id", sql.UniqueIdentifier, courseId)
      .input("status", sql.NVarChar(20), st)
      .query(`
        SELECT id, teacher_id, course_id, title, description, status, created_at, updated_at
        FROM quiz_sets
        WHERE teacher_id = @teacher_id
          AND is_deleted = 0
          AND (@course_id IS NULL OR course_id = @course_id)
          AND (@status IS NULL OR status = @status)
        ORDER BY updated_at DESC
      `);

    return rs.recordset;
  },

  async teacherGetQuizSetDetail(teacherId, quizSetId) {
    await poolConnect;
    await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

    const header = await pool
      .request()
      .input("id", sql.UniqueIdentifier, quizSetId)
      .query(`
        SELECT id, teacher_id, course_id, title, description, status, created_at, updated_at
        FROM quiz_sets
        WHERE id = @id AND is_deleted = 0
      `);

    const cards = await pool
      .request()
      .input("id", sql.UniqueIdentifier, quizSetId)
      .query(`
        SELECT id, quiz_set_id, front_text, back_text, front_image_url, back_image_url, position, created_at, updated_at
        FROM quiz_cards
        WHERE quiz_set_id = @id AND is_deleted = 0
        ORDER BY position ASC, created_at ASC
      `);

    return { ...header.recordset[0], cards: cards.recordset };
  },

  async teacherUpdateQuizSet(teacherId, quizSetId, payload) {
    await poolConnect;
    await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

    const fields = [];
    const req = pool.request().input("id", sql.UniqueIdentifier, quizSetId);

    if (payload.course_id !== undefined) {
      req.input("course_id", sql.UniqueIdentifier, payload.course_id ?? null);
      fields.push("course_id = @course_id");
    }
    if (payload.title !== undefined) {
      const t = String(payload.title || "").trim();
      if (!t) throw new Error("title không được rỗng");
      req.input("title", sql.NVarChar(255), t);
      fields.push("title = @title");
    }
    if (payload.description !== undefined) {
      req.input("description", sql.NVarChar(sql.MAX), payload.description ?? null);
      fields.push("description = @description");
    }
    if (payload.status !== undefined) {
      const st = normalizeStatus(payload.status);
      req.input("status", sql.NVarChar(20), st);
      fields.push("status = @status");
    }

    if (fields.length === 0) throw new Error("Không có dữ liệu để cập nhật");

    const rs = await req.query(`
      UPDATE quiz_sets
      SET ${fields.join(", ")},
          updated_at = SYSDATETIMEOFFSET()
      OUTPUT INSERTED.*
      WHERE id = @id AND is_deleted = 0
    `);

    return rs.recordset[0];
  },

  async teacherDeleteQuizSet(teacherId, quizSetId) {
    await poolConnect;
    await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      await new sql.Request(tx)
        .input("id", sql.UniqueIdentifier, quizSetId)
        .query(`
          UPDATE quiz_sets
          SET is_deleted = 1, updated_at = SYSDATETIMEOFFSET()
          WHERE id = @id AND is_deleted = 0
        `);

      await new sql.Request(tx)
        .input("id", sql.UniqueIdentifier, quizSetId)
        .query(`
          UPDATE quiz_cards
          SET is_deleted = 1, updated_at = SYSDATETIMEOFFSET()
          WHERE quiz_set_id = @id AND is_deleted = 0
        `);

      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },

  // ===== TEACHER: CARDS =====
  async teacherAddCard(teacherId, quizSetId, payload) {
    await poolConnect;
    await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

    const front = String(payload.front_text || "").trim();
    const back = String(payload.back_text || "").trim();
    if (!front) throw new Error("front_text là bắt buộc");
    if (!back) throw new Error("back_text là bắt buộc");

    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      let pos = payload.position;
      if (pos === undefined || pos === null || Number.isNaN(Number(pos))) {
        const mx = await new sql.Request(tx)
          .input("id", sql.UniqueIdentifier, quizSetId)
          .query(`
            SELECT ISNULL(MAX(position), -1) AS max_pos
            FROM quiz_cards
            WHERE quiz_set_id = @id AND is_deleted = 0
          `);
        pos = Number(mx.recordset[0].max_pos) + 1;
      } else {
        pos = Number(pos);
      }

      const rs = await new sql.Request(tx)
        .input("quiz_set_id", sql.UniqueIdentifier, quizSetId)
        .input("front_text", sql.NVarChar(sql.MAX), front)
        .input("back_text", sql.NVarChar(sql.MAX), back)
        .input("front_image_url", sql.NVarChar(500), payload.front_image_url ?? null)
        .input("back_image_url", sql.NVarChar(500), payload.back_image_url ?? null)
        .input("position", sql.Int, pos)
        .query(`
          INSERT INTO quiz_cards (
            quiz_set_id, front_text, back_text,
            front_image_url, back_image_url,
            position, is_deleted, created_at, updated_at
          )
          OUTPUT INSERTED.*
          VALUES (
            @quiz_set_id, @front_text, @back_text,
            @front_image_url, @back_image_url,
            @position, 0, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
          )
        `);

      await tx.commit();
      return rs.recordset[0];
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },

  async teacherUpdateCard(teacherId, cardId, payload) {
    await poolConnect;
    await assertCardOwnedByTeacher(teacherId, cardId);

    const fields = [];
    const req = pool.request().input("id", sql.UniqueIdentifier, cardId);

    if (payload.front_text !== undefined) {
      const v = String(payload.front_text || "").trim();
      if (!v) throw new Error("front_text không được rỗng");
      req.input("front_text", sql.NVarChar(sql.MAX), v);
      fields.push("front_text = @front_text");
    }
    if (payload.back_text !== undefined) {
      const v = String(payload.back_text || "").trim();
      if (!v) throw new Error("back_text không được rỗng");
      req.input("back_text", sql.NVarChar(sql.MAX), v);
      fields.push("back_text = @back_text");
    }
    if (payload.front_image_url !== undefined) {
      req.input("front_image_url", sql.NVarChar(500), payload.front_image_url ?? null);
      fields.push("front_image_url = @front_image_url");
    }
    if (payload.back_image_url !== undefined) {
      req.input("back_image_url", sql.NVarChar(500), payload.back_image_url ?? null);
      fields.push("back_image_url = @back_image_url");
    }
    if (payload.position !== undefined) {
      const pos = Number(payload.position);
      if (Number.isNaN(pos)) throw new Error("position không hợp lệ");
      req.input("position", sql.Int, pos);
      fields.push("position = @position");
    }

    if (fields.length === 0) throw new Error("Không có dữ liệu để cập nhật");

    const rs = await req.query(`
      UPDATE quiz_cards
      SET ${fields.join(", ")},
          updated_at = SYSDATETIMEOFFSET()
      OUTPUT INSERTED.*
      WHERE id = @id AND is_deleted = 0
    `);

    return rs.recordset[0];
  },

  async teacherDeleteCard(teacherId, cardId) {
    await poolConnect;
    await assertCardOwnedByTeacher(teacherId, cardId);

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, cardId)
      .query(`
        UPDATE quiz_cards
        SET is_deleted = 1, updated_at = SYSDATETIMEOFFSET()
        WHERE id = @id AND is_deleted = 0
      `);
  },

  async teacherReorderCards(teacherId, quizSetId, cardIds) {
    await poolConnect;
    await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

    if (!Array.isArray(cardIds) || cardIds.length === 0) {
      throw new Error("cardIds phải là mảng và không được rỗng");
    }

    // verify all belong to quizSetId
    const existing = await pool
      .request()
      .input("quiz_set_id", sql.UniqueIdentifier, quizSetId)
      .query(`
        SELECT id
        FROM quiz_cards
        WHERE quiz_set_id = @quiz_set_id AND is_deleted = 0
      `);

    const set = new Set(existing.recordset.map((r) => String(r.id).toLowerCase()));
    for (const id of cardIds) {
      if (!set.has(String(id).toLowerCase())) {
        throw new Error("Có cardId không thuộc quiz set hoặc đã bị xoá");
      }
    }

    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      for (let i = 0; i < cardIds.length; i++) {
        await new sql.Request(tx)
          .input("id", sql.UniqueIdentifier, cardIds[i])
          .input("pos", sql.Int, i)
          .query(`
            UPDATE quiz_cards
            SET position = @pos, updated_at = SYSDATETIMEOFFSET()
            WHERE id = @id AND is_deleted = 0
          `);
      }
      await tx.commit();
      return { count: cardIds.length };
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },
};