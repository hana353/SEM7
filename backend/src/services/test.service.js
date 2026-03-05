// src/services/test.service.js
const { pool, poolConnect, sql } = require("../config/db");

const ALLOWED_STATUS = new Set(["DRAFT", "PUBLISHED", "CLOSED"]);

function normalizeStatus(v) {
  if (v === undefined || v === null) return null;
  const x = String(v).toUpperCase();
  if (!ALLOWED_STATUS.has(x)) {
    throw new Error("status không hợp lệ (DRAFT|PUBLISHED|CLOSED)");
  }
  return x;
}

async function assertTestOwnedByTeacher(teacherId, testId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .input("id", sql.UniqueIdentifier, testId)
    .query(`
      SELECT id
      FROM tests
      WHERE id = @id AND teacher_id = @teacher_id AND is_deleted = 0
    `);

  if (rs.recordset.length === 0) {
    throw new Error("Bài kiểm tra không tồn tại hoặc không thuộc quyền TEACHER");
  }
}

async function assertQuestionOwnedByTeacher(teacherId, questionId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .input("question_id", sql.UniqueIdentifier, questionId)
    .query(`
      SELECT q.id, q.test_id
      FROM test_questions q
      JOIN tests t ON t.id = q.test_id
      WHERE q.id = @question_id
        AND q.is_deleted = 0
        AND t.is_deleted = 0
        AND t.teacher_id = @teacher_id
    `);

  if (rs.recordset.length === 0) {
    throw new Error("Question không tồn tại hoặc không thuộc quyền TEACHER");
  }

  return rs.recordset[0].test_id;
}

async function assertChoiceOwnedByTeacher(teacherId, choiceId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("teacher_id", sql.UniqueIdentifier, teacherId)
    .input("choice_id", sql.UniqueIdentifier, choiceId)
    .query(`
      SELECT c.id, q.id AS question_id, q.test_id
      FROM test_choices c
      JOIN test_questions q ON q.id = c.question_id
      JOIN tests t ON t.id = q.test_id
      WHERE c.id = @choice_id
        AND c.is_deleted = 0
        AND q.is_deleted = 0
        AND t.is_deleted = 0
        AND t.teacher_id = @teacher_id
    `);

  if (rs.recordset.length === 0) {
    throw new Error("Choice không tồn tại hoặc không thuộc quyền TEACHER");
  }

  return rs.recordset[0];
}

async function assertAttemptOwnedByStudent(studentId, attemptId) {
  await poolConnect;
  const rs = await pool
    .request()
    .input("student_id", sql.UniqueIdentifier, studentId)
    .input("attempt_id", sql.UniqueIdentifier, attemptId)
    .query(`
      SELECT a.*, t.title, t.description, t.duration_minutes, t.status AS test_status
      FROM test_attempts a
      JOIN tests t ON t.id = a.test_id
      WHERE a.id = @attempt_id
        AND a.student_id = @student_id
        AND t.is_deleted = 0
    `);

  if (rs.recordset.length === 0) {
    throw new Error("Attempt không tồn tại hoặc không thuộc về STUDENT");
  }

  return rs.recordset[0];
}

module.exports = {
  /* =========================
     PUBLIC
  ========================= */
  async publicListPublished({ courseId }) {
    await poolConnect;
    const rs = await pool
      .request()
      .input("course_id", sql.UniqueIdentifier, courseId)
      .query(`
        SELECT id, teacher_id, course_id, title, description,
               duration_minutes, max_attempts, shuffle_questions, shuffle_choices,
               status, open_at, close_at, created_at, updated_at
        FROM tests
        WHERE is_deleted = 0
          AND status = 'PUBLISHED'
          AND (@course_id IS NULL OR course_id = @course_id)
        ORDER BY updated_at DESC
      `);
    return rs.recordset;
  },

  async publicGetPublishedDetail(testId) {
    await poolConnect;

    const rs = await pool
      .request()
      .input("id", sql.UniqueIdentifier, testId)
      .query(`
        SELECT id, teacher_id, course_id, title, description,
               duration_minutes, max_attempts, shuffle_questions, shuffle_choices,
               status, open_at, close_at, created_at, updated_at
        FROM tests
        WHERE id = @id AND is_deleted = 0 AND status = 'PUBLISHED'
      `);

    if (rs.recordset.length === 0) {
      throw new Error("Bài kiểm tra không tồn tại hoặc chưa publish");
    }

    return rs.recordset[0];
  },

  /* =========================
     TEACHER: TEST
  ========================= */
  async teacherCreateTest(teacherId, payload) {
    await poolConnect;

    const title = String(payload.title || "").trim();
    if (!title) throw new Error("title là bắt buộc");
    if (!payload.course_id) throw new Error("course_id là bắt buộc");

    const c = await pool.request()
      .input("course_id", sql.UniqueIdentifier, payload.course_id)
      .input("teacher_id", sql.UniqueIdentifier, teacherId)
      .query(`SELECT id FROM courses WHERE id = @course_id AND teacher_id = @teacher_id AND (status IS NULL OR status <> 'DELETED')`);
    if (c.recordset.length === 0) throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");

    const status = normalizeStatus(payload.status || "DRAFT");

    const rs = await pool
      .request()
      .input("teacher_id", sql.UniqueIdentifier, teacherId)
      .input("course_id", sql.UniqueIdentifier, payload.course_id)
      .input("title", sql.NVarChar(255), title)
      .input("description", sql.NVarChar(sql.MAX), payload.description ?? null)
      .input("duration_minutes", sql.Int, payload.duration_minutes ?? null)
      .input("max_attempts", sql.Int, payload.max_attempts ?? null)
      .input("shuffle_questions", sql.Bit, payload.shuffle_questions ?? false)
      .input("shuffle_choices", sql.Bit, payload.shuffle_choices ?? false)
      .input("status", sql.NVarChar(20), status)
      .input("open_at", sql.DateTimeOffset, payload.open_at ?? null)
      .input("close_at", sql.DateTimeOffset, payload.close_at ?? null)
      .query(`
        INSERT INTO tests (
          teacher_id, course_id, title, description,
          duration_minutes, max_attempts,
          shuffle_questions, shuffle_choices,
          status, open_at, close_at,
          is_deleted, created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @teacher_id, @course_id, @title, @description,
          @duration_minutes, @max_attempts,
          @shuffle_questions, @shuffle_choices,
          @status, @open_at, @close_at,
          0, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
        )
      `);

    return rs.recordset[0];
  },

  async teacherListTests(teacherId, { courseId, status }) {
    await poolConnect;
    const st = status ? normalizeStatus(status) : null;

    const rs = await pool
      .request()
      .input("teacher_id", sql.UniqueIdentifier, teacherId)
      .input("course_id", sql.UniqueIdentifier, courseId)
      .input("status", sql.NVarChar(20), st)
      .query(`
        SELECT id, teacher_id, course_id, title, description,
               duration_minutes, max_attempts, shuffle_questions, shuffle_choices,
               status, open_at, close_at, created_at, updated_at
        FROM tests
        WHERE teacher_id = @teacher_id
          AND is_deleted = 0
          AND (@course_id IS NULL OR course_id = @course_id)
          AND (@status IS NULL OR status = @status)
        ORDER BY updated_at DESC
      `);

    return rs.recordset;
  },

  async teacherGetTestDetail(teacherId, testId) {
    await poolConnect;
    await assertTestOwnedByTeacher(teacherId, testId);

    const testRs = await pool
      .request()
      .input("id", sql.UniqueIdentifier, testId)
      .query(`
        SELECT id, teacher_id, course_id, title, description,
               duration_minutes, max_attempts, shuffle_questions, shuffle_choices,
               status, open_at, close_at, created_at, updated_at
        FROM tests
        WHERE id = @id AND is_deleted = 0
      `);

    const questionsRs = await pool
      .request()
      .input("test_id", sql.UniqueIdentifier, testId)
      .query(`
        SELECT id, test_id, question_text, points, position, created_at, updated_at
        FROM test_questions
        WHERE test_id = @test_id AND is_deleted = 0
        ORDER BY position ASC, created_at ASC
      `);

    const questions = [];
    for (const q of questionsRs.recordset) {
      const choicesRs = await pool
        .request()
        .input("question_id", sql.UniqueIdentifier, q.id)
        .query(`
          SELECT id, question_id, choice_text, is_correct, position
          FROM test_choices
          WHERE question_id = @question_id AND is_deleted = 0
          ORDER BY position ASC, id ASC
        `);

      questions.push({
        ...q,
        choices: choicesRs.recordset,
      });
    }

    return {
      ...testRs.recordset[0],
      questions,
    };
  },

  async teacherUpdateTest(teacherId, testId, payload) {
    await poolConnect;
    await assertTestOwnedByTeacher(teacherId, testId);

    const fields = [];
    const req = pool.request().input("id", sql.UniqueIdentifier, testId);

    if (payload.course_id !== undefined) {
      req.input("course_id", sql.UniqueIdentifier, payload.course_id);
      fields.push("course_id = @course_id");
    }
    if (payload.title !== undefined) {
      const title = String(payload.title || "").trim();
      if (!title) throw new Error("title không được rỗng");
      req.input("title", sql.NVarChar(255), title);
      fields.push("title = @title");
    }
    if (payload.description !== undefined) {
      req.input("description", sql.NVarChar(sql.MAX), payload.description ?? null);
      fields.push("description = @description");
    }
    if (payload.duration_minutes !== undefined) {
      req.input("duration_minutes", sql.Int, payload.duration_minutes ?? null);
      fields.push("duration_minutes = @duration_minutes");
    }
    if (payload.max_attempts !== undefined) {
      req.input("max_attempts", sql.Int, payload.max_attempts ?? null);
      fields.push("max_attempts = @max_attempts");
    }
    if (payload.shuffle_questions !== undefined) {
      req.input("shuffle_questions", sql.Bit, payload.shuffle_questions);
      fields.push("shuffle_questions = @shuffle_questions");
    }
    if (payload.shuffle_choices !== undefined) {
      req.input("shuffle_choices", sql.Bit, payload.shuffle_choices);
      fields.push("shuffle_choices = @shuffle_choices");
    }
    if (payload.status !== undefined) {
      const st = normalizeStatus(payload.status);
      req.input("status", sql.NVarChar(20), st);
      fields.push("status = @status");
    }
    if (payload.open_at !== undefined) {
      req.input("open_at", sql.DateTimeOffset, payload.open_at ?? null);
      fields.push("open_at = @open_at");
    }
    if (payload.close_at !== undefined) {
      req.input("close_at", sql.DateTimeOffset, payload.close_at ?? null);
      fields.push("close_at = @close_at");
    }

    if (fields.length === 0) throw new Error("Không có dữ liệu để cập nhật");

    const rs = await req.query(`
      UPDATE tests
      SET ${fields.join(", ")},
          updated_at = SYSDATETIMEOFFSET()
      OUTPUT INSERTED.*
      WHERE id = @id AND is_deleted = 0
    `);

    return rs.recordset[0];
  },

  async teacherDeleteTest(teacherId, testId) {
    await poolConnect;
    await assertTestOwnedByTeacher(teacherId, testId);

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, testId)
      .query(`
        UPDATE tests
        SET is_deleted = 1, updated_at = SYSDATETIMEOFFSET()
        WHERE id = @id AND is_deleted = 0
      `);
  },

  /* =========================
     TEACHER: QUESTIONS
  ========================= */
  async teacherAddQuestion(teacherId, testId, payload) {
    await poolConnect;
    await assertTestOwnedByTeacher(teacherId, testId);

    const questionText = String(payload.question_text || "").trim();
    if (!questionText) throw new Error("question_text là bắt buộc");

    let position = payload.position;
    if (position === undefined || position === null || Number.isNaN(Number(position))) {
      const mx = await pool
        .request()
        .input("test_id", sql.UniqueIdentifier, testId)
        .query(`
          SELECT ISNULL(MAX(position), -1) AS max_pos
          FROM test_questions
          WHERE test_id = @test_id AND is_deleted = 0
        `);
      position = Number(mx.recordset[0].max_pos) + 1;
    } else {
      position = Number(position);
    }

    const rs = await pool
      .request()
      .input("test_id", sql.UniqueIdentifier, testId)
      .input("question_text", sql.NVarChar(sql.MAX), questionText)
      .input("points", sql.Decimal(6, 2), payload.points ?? 1)
      .input("position", sql.Int, position)
      .query(`
        INSERT INTO test_questions (
          test_id, question_text, points, position,
          is_deleted, created_at, updated_at
        )
        OUTPUT INSERTED.*
        VALUES (
          @test_id, @question_text, @points, @position,
          0, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET()
        )
      `);

    return rs.recordset[0];
  },

  async teacherUpdateQuestion(teacherId, questionId, payload) {
    await poolConnect;
    await assertQuestionOwnedByTeacher(teacherId, questionId);

    const fields = [];
    const req = pool.request().input("id", sql.UniqueIdentifier, questionId);

    if (payload.question_text !== undefined) {
      const text = String(payload.question_text || "").trim();
      if (!text) throw new Error("question_text không được rỗng");
      req.input("question_text", sql.NVarChar(sql.MAX), text);
      fields.push("question_text = @question_text");
    }
    if (payload.points !== undefined) {
      req.input("points", sql.Decimal(6, 2), payload.points);
      fields.push("points = @points");
    }
    if (payload.position !== undefined) {
      req.input("position", sql.Int, payload.position);
      fields.push("position = @position");
    }

    if (fields.length === 0) throw new Error("Không có dữ liệu để cập nhật");

    const rs = await req.query(`
      UPDATE test_questions
      SET ${fields.join(", ")},
          updated_at = SYSDATETIMEOFFSET()
      OUTPUT INSERTED.*
      WHERE id = @id AND is_deleted = 0
    `);

    return rs.recordset[0];
  },

  async teacherDeleteQuestion(teacherId, questionId) {
    await poolConnect;
    await assertQuestionOwnedByTeacher(teacherId, questionId);

    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      await new sql.Request(tx)
        .input("id", sql.UniqueIdentifier, questionId)
        .query(`
          UPDATE test_questions
          SET is_deleted = 1, updated_at = SYSDATETIMEOFFSET()
          WHERE id = @id AND is_deleted = 0
        `);

      await new sql.Request(tx)
        .input("question_id", sql.UniqueIdentifier, questionId)
        .query(`
          UPDATE test_choices
          SET is_deleted = 1
          WHERE question_id = @question_id AND is_deleted = 0
        `);

      await tx.commit();
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },

  /* =========================
     TEACHER: CHOICES
  ========================= */
  async teacherAddChoice(teacherId, questionId, payload) {
    await poolConnect;
    await assertQuestionOwnedByTeacher(teacherId, questionId);

    const text = String(payload.choice_text || "").trim();
    if (!text) throw new Error("choice_text là bắt buộc");

    let position = payload.position;
    if (position === undefined || position === null || Number.isNaN(Number(position))) {
      const mx = await pool
        .request()
        .input("question_id", sql.UniqueIdentifier, questionId)
        .query(`
          SELECT ISNULL(MAX(position), -1) AS max_pos
          FROM test_choices
          WHERE question_id = @question_id AND is_deleted = 0
        `);
      position = Number(mx.recordset[0].max_pos) + 1;
    } else {
      position = Number(position);
    }

    const rs = await pool
      .request()
      .input("question_id", sql.UniqueIdentifier, questionId)
      .input("choice_text", sql.NVarChar(sql.MAX), text)
      .input("is_correct", sql.Bit, payload.is_correct ?? false)
      .input("position", sql.Int, position)
      .query(`
        INSERT INTO test_choices (
          question_id, choice_text, is_correct, position, is_deleted
        )
        OUTPUT INSERTED.*
        VALUES (
          @question_id, @choice_text, @is_correct, @position, 0
        )
      `);

    return rs.recordset[0];
  },

  async teacherUpdateChoice(teacherId, choiceId, payload) {
    await poolConnect;
    await assertChoiceOwnedByTeacher(teacherId, choiceId);

    const fields = [];
    const req = pool.request().input("id", sql.UniqueIdentifier, choiceId);

    if (payload.choice_text !== undefined) {
      const text = String(payload.choice_text || "").trim();
      if (!text) throw new Error("choice_text không được rỗng");
      req.input("choice_text", sql.NVarChar(sql.MAX), text);
      fields.push("choice_text = @choice_text");
    }
    if (payload.is_correct !== undefined) {
      req.input("is_correct", sql.Bit, payload.is_correct);
      fields.push("is_correct = @is_correct");
    }
    if (payload.position !== undefined) {
      req.input("position", sql.Int, payload.position);
      fields.push("position = @position");
    }

    if (fields.length === 0) throw new Error("Không có dữ liệu để cập nhật");

    const rs = await req.query(`
      UPDATE test_choices
      SET ${fields.join(", ")}
      OUTPUT INSERTED.*
      WHERE id = @id AND is_deleted = 0
    `);

    return rs.recordset[0];
  },

  async teacherDeleteChoice(teacherId, choiceId) {
    await poolConnect;
    await assertChoiceOwnedByTeacher(teacherId, choiceId);

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, choiceId)
      .query(`
        UPDATE test_choices
        SET is_deleted = 1
        WHERE id = @id AND is_deleted = 0
      `);
  },

  /* =========================
     STUDENT: ATTEMPTS
  ========================= */
  async studentStartAttempt(studentId, testId) {
    await poolConnect;

    const testRs = await pool
      .request()
      .input("id", sql.UniqueIdentifier, testId)
      .query(`
        SELECT *
        FROM tests
        WHERE id = @id AND is_deleted = 0 AND status = 'PUBLISHED'
      `);

    if (testRs.recordset.length === 0) {
      throw new Error("Bài kiểm tra không tồn tại hoặc chưa publish");
    }

    const test = testRs.recordset[0];

    if (test.max_attempts !== null) {
      const cntRs = await pool
        .request()
        .input("test_id", sql.UniqueIdentifier, testId)
        .input("student_id", sql.UniqueIdentifier, studentId)
        .query(`
          SELECT COUNT(*) AS total
          FROM test_attempts
          WHERE test_id = @test_id
            AND student_id = @student_id
            AND status IN ('SUBMITTED', 'GRADED')
        `);

      const total = Number(cntRs.recordset[0].total);
      if (total >= test.max_attempts) {
        throw new Error("Bạn đã vượt quá số lần làm bài cho phép");
      }
    }

    const rs = await pool
      .request()
      .input("test_id", sql.UniqueIdentifier, testId)
      .input("student_id", sql.UniqueIdentifier, studentId)
      .query(`
        INSERT INTO test_attempts (
          test_id, student_id, started_at, status, score, max_score
        )
        OUTPUT INSERTED.*
        VALUES (
          @test_id, @student_id, SYSDATETIMEOFFSET(), 'IN_PROGRESS', NULL, NULL
        )
      `);

    return rs.recordset[0];
  },

  async studentGetAttemptDetail(studentId, attemptId) {
    await poolConnect;
    const attempt = await assertAttemptOwnedByStudent(studentId, attemptId);

    if (attempt.status !== "IN_PROGRESS") {
      throw new Error("Attempt này không còn ở trạng thái làm bài");
    }

    const testRs = await pool
      .request()
      .input("id", sql.UniqueIdentifier, attempt.test_id)
      .query(`
        SELECT id, title, description, duration_minutes, shuffle_questions, shuffle_choices
        FROM tests
        WHERE id = @id AND is_deleted = 0
      `);

    const questionsRs = await pool
      .request()
      .input("test_id", sql.UniqueIdentifier, attempt.test_id)
      .query(`
        SELECT id, question_text, points, position
        FROM test_questions
        WHERE test_id = @test_id AND is_deleted = 0
        ORDER BY position ASC, created_at ASC
      `);

    const questions = [];
    for (const q of questionsRs.recordset) {
      const choicesRs = await pool
        .request()
        .input("question_id", sql.UniqueIdentifier, q.id)
        .query(`
          SELECT id, question_id, choice_text, position
          FROM test_choices
          WHERE question_id = @question_id AND is_deleted = 0
          ORDER BY position ASC, id ASC
        `);

      const answerRs = await pool
        .request()
        .input("attempt_id", sql.UniqueIdentifier, attemptId)
        .input("question_id", sql.UniqueIdentifier, q.id)
        .query(`
          SELECT choice_id
          FROM test_attempt_answers
          WHERE attempt_id = @attempt_id AND question_id = @question_id
        `);

      questions.push({
        ...q,
        choices: choicesRs.recordset,
        selected_choice_id: answerRs.recordset[0]?.choice_id || null,
      });
    }

    return {
      attempt: {
        id: attempt.id,
        test_id: attempt.test_id,
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
        status: attempt.status,
      },
      test: testRs.recordset[0],
      questions,
    };
  },

  async studentSaveAnswer(studentId, attemptId, payload) {
    await poolConnect;
    const attempt = await assertAttemptOwnedByStudent(studentId, attemptId);

    if (attempt.status !== "IN_PROGRESS") {
      throw new Error("Attempt đã nộp hoặc không còn hợp lệ");
    }

    if (!payload.question_id) throw new Error("question_id là bắt buộc");

    const qRs = await pool
      .request()
      .input("question_id", sql.UniqueIdentifier, payload.question_id)
      .input("test_id", sql.UniqueIdentifier, attempt.test_id)
      .query(`
        SELECT id
        FROM test_questions
        WHERE id = @question_id AND test_id = @test_id AND is_deleted = 0
      `);

    if (qRs.recordset.length === 0) {
      throw new Error("question_id không thuộc bài kiểm tra này");
    }

    if (payload.choice_id) {
      const cRs = await pool
        .request()
        .input("choice_id", sql.UniqueIdentifier, payload.choice_id)
        .input("question_id", sql.UniqueIdentifier, payload.question_id)
        .query(`
          SELECT id
          FROM test_choices
          WHERE id = @choice_id AND question_id = @question_id AND is_deleted = 0
        `);

      if (cRs.recordset.length === 0) {
        throw new Error("choice_id không thuộc question này");
      }
    }

    const rs = await pool
      .request()
      .input("attempt_id", sql.UniqueIdentifier, attemptId)
      .input("question_id", sql.UniqueIdentifier, payload.question_id)
      .input("choice_id", sql.UniqueIdentifier, payload.choice_id ?? null)
      .query(`
        MERGE test_attempt_answers AS target
        USING (
          SELECT @attempt_id AS attempt_id, @question_id AS question_id
        ) AS src
        ON target.attempt_id = src.attempt_id AND target.question_id = src.question_id
        WHEN MATCHED THEN
          UPDATE SET choice_id = @choice_id
        WHEN NOT MATCHED THEN
          INSERT (attempt_id, question_id, choice_id, is_correct, points_earned)
          VALUES (@attempt_id, @question_id, @choice_id, NULL, NULL)
        OUTPUT INSERTED.*;
      `);

    return rs.recordset[0];
  },

  async studentSubmitAttempt(studentId, attemptId) {
    await poolConnect;
    const attempt = await assertAttemptOwnedByStudent(studentId, attemptId);

    if (attempt.status !== "IN_PROGRESS") {
      throw new Error("Attempt đã nộp rồi");
    }

    const tx = new sql.Transaction(pool);
    await tx.begin();

    try {
      const questionsRs = await new sql.Request(tx)
        .input("test_id", sql.UniqueIdentifier, attempt.test_id)
        .query(`
          SELECT id, points
          FROM test_questions
          WHERE test_id = @test_id AND is_deleted = 0
        `);

      let score = 0;
      let maxScore = 0;

      for (const q of questionsRs.recordset) {
        maxScore += Number(q.points);

        const correctRs = await new sql.Request(tx)
          .input("question_id", sql.UniqueIdentifier, q.id)
          .query(`
            SELECT TOP 1 id
            FROM test_choices
            WHERE question_id = @question_id
              AND is_deleted = 0
              AND is_correct = 1
            ORDER BY position ASC, id ASC
          `);

        const correctChoiceId = correctRs.recordset[0]?.id || null;

        const answerRs = await new sql.Request(tx)
          .input("attempt_id", sql.UniqueIdentifier, attemptId)
          .input("question_id", sql.UniqueIdentifier, q.id)
          .query(`
            SELECT id, choice_id
            FROM test_attempt_answers
            WHERE attempt_id = @attempt_id AND question_id = @question_id
          `);

        if (answerRs.recordset.length === 0) {
          await new sql.Request(tx)
            .input("attempt_id", sql.UniqueIdentifier, attemptId)
            .input("question_id", sql.UniqueIdentifier, q.id)
            .input("choice_id", sql.UniqueIdentifier, null)
            .input("is_correct", sql.Bit, false)
            .input("points_earned", sql.Decimal(6, 2), 0)
            .query(`
              INSERT INTO test_attempt_answers (
                attempt_id, question_id, choice_id, is_correct, points_earned
              )
              VALUES (
                @attempt_id, @question_id, @choice_id, @is_correct, @points_earned
              )
            `);
          continue;
        }

        const selectedChoiceId = answerRs.recordset[0].choice_id || null;
        const isCorrect =
          correctChoiceId &&
          selectedChoiceId &&
          String(correctChoiceId).toLowerCase() === String(selectedChoiceId).toLowerCase();

        const pointsEarned = isCorrect ? Number(q.points) : 0;
        score += pointsEarned;

        await new sql.Request(tx)
          .input("attempt_id", sql.UniqueIdentifier, attemptId)
          .input("question_id", sql.UniqueIdentifier, q.id)
          .input("is_correct", sql.Bit, !!isCorrect)
          .input("points_earned", sql.Decimal(6, 2), pointsEarned)
          .query(`
            UPDATE test_attempt_answers
            SET is_correct = @is_correct,
                points_earned = @points_earned
            WHERE attempt_id = @attempt_id AND question_id = @question_id
          `);
      }

      await new sql.Request(tx)
        .input("id", sql.UniqueIdentifier, attemptId)
        .input("score", sql.Decimal(6, 2), score)
        .input("max_score", sql.Decimal(6, 2), maxScore)
        .query(`
          UPDATE test_attempts
          SET submitted_at = SYSDATETIMEOFFSET(),
              status = 'GRADED',
              score = @score,
              max_score = @max_score
          WHERE id = @id
        `);

      await tx.commit();

      return {
        attempt_id: attemptId,
        score,
        max_score: maxScore,
      };
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  },

  async studentReviewAttempt(studentId, attemptId) {
    await poolConnect;
    const attempt = await assertAttemptOwnedByStudent(studentId, attemptId);

    if (!["SUBMITTED", "GRADED"].includes(attempt.status)) {
      throw new Error("Bạn chỉ có thể xem lại sau khi nộp bài");
    }

    const testRs = await pool
      .request()
      .input("id", sql.UniqueIdentifier, attempt.test_id)
      .query(`
        SELECT id, title, description
        FROM tests
        WHERE id = @id AND is_deleted = 0
      `);

    const questionsRs = await pool
      .request()
      .input("test_id", sql.UniqueIdentifier, attempt.test_id)
      .query(`
        SELECT id, question_text, points, position
        FROM test_questions
        WHERE test_id = @test_id AND is_deleted = 0
        ORDER BY position ASC, created_at ASC
      `);

    const questions = [];
    for (const q of questionsRs.recordset) {
      const choicesRs = await pool
        .request()
        .input("question_id", sql.UniqueIdentifier, q.id)
        .query(`
          SELECT id, question_id, choice_text, is_correct, position
          FROM test_choices
          WHERE question_id = @question_id AND is_deleted = 0
          ORDER BY position ASC, id ASC
        `);

      const answerRs = await pool
        .request()
        .input("attempt_id", sql.UniqueIdentifier, attemptId)
        .input("question_id", sql.UniqueIdentifier, q.id)
        .query(`
          SELECT choice_id, is_correct, points_earned
          FROM test_attempt_answers
          WHERE attempt_id = @attempt_id AND question_id = @question_id
        `);

      questions.push({
        ...q,
        choices: choicesRs.recordset,
        selected_choice_id: answerRs.recordset[0]?.choice_id || null,
        is_correct: answerRs.recordset[0]?.is_correct ?? false,
        points_earned: answerRs.recordset[0]?.points_earned ?? 0,
      });
    }

    return {
      attempt: {
        id: attempt.id,
        test_id: attempt.test_id,
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
        status: attempt.status,
        score: attempt.score,
        max_score: attempt.max_score,
      },
      test: testRs.recordset[0],
      questions,
    };
  },
};