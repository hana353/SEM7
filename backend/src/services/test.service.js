const supabase = require("../config/supabase");

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
  const { data, error } = await supabase
    .from("tests")
    .select("id")
    .eq("id", testId)
    .eq("teacher_id", teacherId)
    .eq("is_deleted", false)
    .single();

  if (error || !data) {
    throw new Error("Bài kiểm tra không tồn tại hoặc không thuộc quyền TEACHER");
  }
}

async function assertQuestionOwnedByTeacher(teacherId, questionId) {
  const { data, error } = await supabase
    .from("test_questions")
    .select(`
      id,
      test_id,
      tests!inner (
        id,
        teacher_id,
        is_deleted
      )
    `)
    .eq("id", questionId)
    .eq("is_deleted", false)
    .eq("tests.teacher_id", teacherId)
    .eq("tests.is_deleted", false)
    .single();

  if (error || !data) {
    throw new Error("Question không tồn tại hoặc không thuộc quyền TEACHER");
  }

  return data.test_id;
}

async function assertChoiceOwnedByTeacher(teacherId, choiceId) {
  const { data, error } = await supabase
    .from("test_choices")
    .select(`
      id,
      question_id,
      test_questions!inner (
        id,
        test_id,
        is_deleted,
        tests!inner (
          id,
          teacher_id,
          is_deleted
        )
      )
    `)
    .eq("id", choiceId)
    .eq("is_deleted", false)
    .eq("test_questions.is_deleted", false)
    .eq("test_questions.tests.teacher_id", teacherId)
    .eq("test_questions.tests.is_deleted", false)
    .single();

  if (error || !data) {
    throw new Error("Choice không tồn tại hoặc không thuộc quyền TEACHER");
  }

  return {
    question_id: data.question_id,
    test_id: data.test_questions?.test_id || null,
  };
}

async function assertAttemptOwnedByStudent(studentId, attemptId) {
  const { data, error } = await supabase
    .from("test_attempts")
    .select(`
      *,
      tests!inner (
        title,
        description,
        duration_minutes,
        status,
        is_deleted
      )
    `)
    .eq("id", attemptId)
    .eq("student_id", studentId)
    .eq("tests.is_deleted", false)
    .single();

  if (error || !data) {
    throw new Error("Attempt không tồn tại hoặc không thuộc về STUDENT");
  }

  return {
    ...data,
    title: data.tests?.title,
    description: data.tests?.description,
    duration_minutes: data.tests?.duration_minutes,
    test_status: data.tests?.status,
  };
}

async function getQuestionsWithChoices(testId, includeCorrect = false) {
  const { data: questions, error: qError } = await supabase
    .from("test_questions")
    .select("id, test_id, question_text, points, position, created_at, updated_at")
    .eq("test_id", testId)
    .eq("is_deleted", false)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (qError) throw new Error(qError.message);

  const result = [];
  for (const q of questions || []) {
    let choiceQuery = supabase
      .from("test_choices")
      .select(
        includeCorrect
          ? "id, question_id, choice_text, is_correct, position"
          : "id, question_id, choice_text, position"
      )
      .eq("question_id", q.id)
      .eq("is_deleted", false)
      .order("position", { ascending: true })
      .order("id", { ascending: true });

    const { data: choices, error: cError } = await choiceQuery;
    if (cError) throw new Error(cError.message);

    result.push({
      ...q,
      choices: choices || [],
    });
  }

  return result;
}

module.exports = {
  async publicListPublished({ courseId }) {
    let query = supabase
      .from("tests")
      .select(`
        id,
        teacher_id,
        course_id,
        title,
        description,
        duration_minutes,
        max_attempts,
        shuffle_questions,
        shuffle_choices,
        status,
        open_at,
        close_at,
        created_at,
        updated_at
      `)
      .eq("is_deleted", false)
      .eq("status", "PUBLISHED")
      .order("updated_at", { ascending: false });

    if (courseId) query = query.eq("course_id", courseId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async publicGetPublishedDetail(testId) {
    const { data, error } = await supabase
      .from("tests")
      .select(`
        id,
        teacher_id,
        course_id,
        title,
        description,
        duration_minutes,
        max_attempts,
        shuffle_questions,
        shuffle_choices,
        status,
        open_at,
        close_at,
        created_at,
        updated_at
      `)
      .eq("id", testId)
      .eq("is_deleted", false)
      .eq("status", "PUBLISHED")
      .single();

    if (error || !data) {
      throw new Error("Bài kiểm tra không tồn tại hoặc chưa publish");
    }

    return data;
  },

  async teacherCreateTest(teacherId, payload) {
    const title = String(payload.title || "").trim();
    if (!title) throw new Error("title là bắt buộc");
    if (!payload.course_id) throw new Error("course_id là bắt buộc");

    const { data: course, error: cError } = await supabase
      .from("courses")
      .select("id")
      .eq("id", payload.course_id)
      .eq("teacher_id", teacherId)
      .neq("status", "DELETED")
      .single();

    if (cError || !course) {
      throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");
    }

    const status = normalizeStatus(payload.status || "DRAFT");

    const { data, error } = await supabase
      .from("tests")
      .insert({
        teacher_id: teacherId,
        course_id: payload.course_id,
        title,
        description: payload.description ?? null,
        duration_minutes: payload.duration_minutes ?? null,
        max_attempts: payload.max_attempts ?? null,
        shuffle_questions: payload.shuffle_questions ?? false,
        shuffle_choices: payload.shuffle_choices ?? false,
        status,
        open_at: payload.open_at ?? null,
        close_at: payload.close_at ?? null,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async teacherListTests(teacherId, { courseId, status }) {
    const st = status ? normalizeStatus(status) : null;

    let query = supabase
      .from("tests")
      .select(`
        id,
        teacher_id,
        course_id,
        title,
        description,
        duration_minutes,
        max_attempts,
        shuffle_questions,
        shuffle_choices,
        status,
        open_at,
        close_at,
        created_at,
        updated_at
      `)
      .eq("teacher_id", teacherId)
      .eq("is_deleted", false)
      .order("updated_at", { ascending: false });

    if (courseId) query = query.eq("course_id", courseId);
    if (st) query = query.eq("status", st);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async teacherGetTestDetail(teacherId, testId) {
    await assertTestOwnedByTeacher(teacherId, testId);

    const { data: test, error: testError } = await supabase
      .from("tests")
      .select(`
        id,
        teacher_id,
        course_id,
        title,
        description,
        duration_minutes,
        max_attempts,
        shuffle_questions,
        shuffle_choices,
        status,
        open_at,
        close_at,
        created_at,
        updated_at
      `)
      .eq("id", testId)
      .eq("is_deleted", false)
      .single();

    if (testError) throw new Error(testError.message);

    const questions = await getQuestionsWithChoices(testId, true);

    return {
      ...test,
      questions,
    };
  },

  async teacherListTestAttempts(teacherId, testId) {
    await assertTestOwnedByTeacher(teacherId, testId);

    const { data, error } = await supabase
      .from("test_attempts")
      .select(`
        id,
        student_id,
        started_at,
        submitted_at,
        status,
        score,
        max_score,
        users!test_attempts_student_id_fkey (
          full_name,
          email
        )
      `)
      .eq("test_id", testId)
      .order("submitted_at", { ascending: false })
      .order("started_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((a) => ({
      id: a.id,
      student_id: a.student_id,
      started_at: a.started_at,
      submitted_at: a.submitted_at,
      status: a.status,
      score: a.score,
      max_score: a.max_score,
      student_name: a.users?.full_name || null,
      student_email: a.users?.email || null,
    }));
  },

  async studentListMyAttempts(studentId, testId) {
    const { data, error } = await supabase
      .from("test_attempts")
      .select("id, started_at, submitted_at, status, score, max_score")
      .eq("student_id", studentId)
      .eq("test_id", testId)
      .order("submitted_at", { ascending: false })
      .order("started_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  async teacherUpdateTest(teacherId, testId, payload) {
    await assertTestOwnedByTeacher(teacherId, testId);

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (payload.course_id !== undefined) {
      const { data: course, error: cError } = await supabase
        .from("courses")
        .select("id")
        .eq("id", payload.course_id)
        .eq("teacher_id", teacherId)
        .neq("status", "DELETED")
        .single();

      if (cError || !course) {
        throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");
      }
      updates.course_id = payload.course_id;
    }

    if (payload.title !== undefined) {
      const title = String(payload.title || "").trim();
      if (!title) throw new Error("title không được rỗng");
      updates.title = title;
    }
    if (payload.description !== undefined) updates.description = payload.description ?? null;
    if (payload.duration_minutes !== undefined) updates.duration_minutes = payload.duration_minutes ?? null;
    if (payload.max_attempts !== undefined) updates.max_attempts = payload.max_attempts ?? null;
    if (payload.shuffle_questions !== undefined) updates.shuffle_questions = !!payload.shuffle_questions;
    if (payload.shuffle_choices !== undefined) updates.shuffle_choices = !!payload.shuffle_choices;
    if (payload.status !== undefined) updates.status = normalizeStatus(payload.status);
    if (payload.open_at !== undefined) updates.open_at = payload.open_at ?? null;
    if (payload.close_at !== undefined) updates.close_at = payload.close_at ?? null;

    const { data, error } = await supabase
      .from("tests")
      .update(updates)
      .eq("id", testId)
      .eq("is_deleted", false)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async teacherDeleteTest(teacherId, testId) {
    await assertTestOwnedByTeacher(teacherId, testId);

    const { error } = await supabase
      .from("tests")
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", testId)
      .eq("is_deleted", false);

    if (error) throw new Error(error.message);
  },

  async teacherAddQuestion(teacherId, testId, payload) {
    await assertTestOwnedByTeacher(teacherId, testId);

    const questionText = String(payload.question_text || "").trim();
    if (!questionText) throw new Error("question_text là bắt buộc");

    let position = payload.position;
    if (position === undefined || position === null || Number.isNaN(Number(position))) {
      const { data: mx, error: mxError } = await supabase
        .from("test_questions")
        .select("position")
        .eq("test_id", testId)
        .eq("is_deleted", false)
        .order("position", { ascending: false })
        .limit(1);

      if (mxError) throw new Error(mxError.message);
      position = mx?.length ? Number(mx[0].position || 0) + 1 : 0;
    } else {
      position = Number(position);
    }

    const { data, error } = await supabase
      .from("test_questions")
      .insert({
        test_id: testId,
        question_text: questionText,
        points: payload.points ?? 1,
        position,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async teacherUpdateQuestion(teacherId, questionId, payload) {
    await assertQuestionOwnedByTeacher(teacherId, questionId);

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (payload.question_text !== undefined) {
      const text = String(payload.question_text || "").trim();
      if (!text) throw new Error("question_text không được rỗng");
      updates.question_text = text;
    }
    if (payload.points !== undefined) updates.points = payload.points;
    if (payload.position !== undefined) updates.position = payload.position;

    const { data, error } = await supabase
      .from("test_questions")
      .update(updates)
      .eq("id", questionId)
      .eq("is_deleted", false)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async teacherDeleteQuestion(teacherId, questionId) {
    await assertQuestionOwnedByTeacher(teacherId, questionId);

    const now = new Date().toISOString();

    const { error: qError } = await supabase
      .from("test_questions")
      .update({
        is_deleted: true,
        updated_at: now,
      })
      .eq("id", questionId)
      .eq("is_deleted", false);

    if (qError) throw new Error(qError.message);

    const { error: cError } = await supabase
      .from("test_choices")
      .update({
        is_deleted: true,
      })
      .eq("question_id", questionId)
      .eq("is_deleted", false);

    if (cError) throw new Error(cError.message);
  },

  async teacherAddChoice(teacherId, questionId, payload) {
    await assertQuestionOwnedByTeacher(teacherId, questionId);

    const text = String(payload.choice_text || "").trim();
    if (!text) throw new Error("choice_text là bắt buộc");

    let position = payload.position;
    if (position === undefined || position === null || Number.isNaN(Number(position))) {
      const { data: mx, error: mxError } = await supabase
        .from("test_choices")
        .select("position")
        .eq("question_id", questionId)
        .eq("is_deleted", false)
        .order("position", { ascending: false })
        .limit(1);

      if (mxError) throw new Error(mxError.message);
      position = mx?.length ? Number(mx[0].position || 0) + 1 : 0;
    } else {
      position = Number(position);
    }

    const { data, error } = await supabase
      .from("test_choices")
      .insert({
        question_id: questionId,
        choice_text: text,
        is_correct: payload.is_correct ?? false,
        position,
        is_deleted: false,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async teacherUpdateChoice(teacherId, choiceId, payload) {
    await assertChoiceOwnedByTeacher(teacherId, choiceId);

    const updates = {};

    if (payload.choice_text !== undefined) {
      const text = String(payload.choice_text || "").trim();
      if (!text) throw new Error("choice_text không được rỗng");
      updates.choice_text = text;
    }
    if (payload.is_correct !== undefined) updates.is_correct = !!payload.is_correct;
    if (payload.position !== undefined) updates.position = payload.position;

    const { data, error } = await supabase
      .from("test_choices")
      .update(updates)
      .eq("id", choiceId)
      .eq("is_deleted", false)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async teacherDeleteChoice(teacherId, choiceId) {
    await assertChoiceOwnedByTeacher(teacherId, choiceId);

    const { error } = await supabase
      .from("test_choices")
      .update({
        is_deleted: true,
      })
      .eq("id", choiceId)
      .eq("is_deleted", false);

    if (error) throw new Error(error.message);
  },

  async studentStartAttempt(studentId, testId) {
    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("*")
      .eq("id", testId)
      .eq("is_deleted", false)
      .eq("status", "PUBLISHED")
      .single();

    if (testError || !test) {
      throw new Error("Bài kiểm tra không tồn tại hoặc chưa publish");
    }

    if (test.max_attempts !== null && test.max_attempts !== undefined) {
      const { data: attempts, error: cntError } = await supabase
        .from("test_attempts")
        .select("id")
        .eq("test_id", testId)
        .eq("student_id", studentId)
        .in("status", ["SUBMITTED", "GRADED"]);

      if (cntError) throw new Error(cntError.message);
      const total = attempts?.length || 0;
      if (total >= Number(test.max_attempts)) {
        throw new Error("Bạn đã vượt quá số lần làm bài cho phép");
      }
    }

    const { data, error } = await supabase
      .from("test_attempts")
      .insert({
        test_id: testId,
        student_id: studentId,
        started_at: new Date().toISOString(),
        status: "IN_PROGRESS",
        score: null,
        max_score: null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async studentGetAttemptDetail(studentId, attemptId) {
    const attempt = await assertAttemptOwnedByStudent(studentId, attemptId);

    if (attempt.status !== "IN_PROGRESS") {
      throw new Error("Attempt này không còn ở trạng thái làm bài");
    }

    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("id, title, description, duration_minutes, shuffle_questions, shuffle_choices")
      .eq("id", attempt.test_id)
      .eq("is_deleted", false)
      .single();

    if (testError) throw new Error(testError.message);

    const questions = await getQuestionsWithChoices(attempt.test_id, false);

    const resultQuestions = [];
    for (const q of questions) {
      const { data: answer, error: aError } = await supabase
        .from("test_attempt_answers")
        .select("choice_id")
        .eq("attempt_id", attemptId)
        .eq("question_id", q.id)
        .maybeSingle();

      if (aError) throw new Error(aError.message);

      resultQuestions.push({
        ...q,
        selected_choice_id: answer?.choice_id || null,
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
      test,
      questions: resultQuestions,
    };
  },

  async studentSaveAnswer(studentId, attemptId, payload) {
    const attempt = await assertAttemptOwnedByStudent(studentId, attemptId);

    if (attempt.status !== "IN_PROGRESS") {
      throw new Error("Attempt đã nộp hoặc không còn hợp lệ");
    }

    if (!payload.question_id) throw new Error("question_id là bắt buộc");

    const { data: question, error: qError } = await supabase
      .from("test_questions")
      .select("id")
      .eq("id", payload.question_id)
      .eq("test_id", attempt.test_id)
      .eq("is_deleted", false)
      .single();

    if (qError || !question) {
      throw new Error("question_id không thuộc bài kiểm tra này");
    }

    if (payload.choice_id) {
      const { data: choice, error: cError } = await supabase
        .from("test_choices")
        .select("id")
        .eq("id", payload.choice_id)
        .eq("question_id", payload.question_id)
        .eq("is_deleted", false)
        .single();

      if (cError || !choice) {
        throw new Error("choice_id không thuộc question này");
      }
    }

    const { data: existing, error: existingError } = await supabase
      .from("test_attempt_answers")
      .select("id")
      .eq("attempt_id", attemptId)
      .eq("question_id", payload.question_id)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);

    if (existing?.id) {
      const { data, error } = await supabase
        .from("test_attempt_answers")
        .update({
          choice_id: payload.choice_id ?? null,
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) throw new Error(error.message);
      return data;
    }

    const { data, error } = await supabase
      .from("test_attempt_answers")
      .insert({
        attempt_id: attemptId,
        question_id: payload.question_id,
        choice_id: payload.choice_id ?? null,
        is_correct: null,
        points_earned: null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async studentSubmitAttempt(studentId, attemptId) {
    const attempt = await assertAttemptOwnedByStudent(studentId, attemptId);

    if (attempt.status !== "IN_PROGRESS") {
      throw new Error("Attempt đã nộp rồi");
    }

    const { data: questions, error: qError } = await supabase
      .from("test_questions")
      .select("id, points")
      .eq("test_id", attempt.test_id)
      .eq("is_deleted", false);

    if (qError) throw new Error(qError.message);

    let score = 0;
    let maxScore = 0;

    for (const q of questions || []) {
      maxScore += Number(q.points || 0);

      const { data: correctChoice, error: correctError } = await supabase
        .from("test_choices")
        .select("id")
        .eq("question_id", q.id)
        .eq("is_deleted", false)
        .eq("is_correct", true)
        .order("position", { ascending: true })
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (correctError) throw new Error(correctError.message);

      const { data: answer, error: answerError } = await supabase
        .from("test_attempt_answers")
        .select("id, choice_id")
        .eq("attempt_id", attemptId)
        .eq("question_id", q.id)
        .maybeSingle();

      if (answerError) throw new Error(answerError.message);

      const correctChoiceId = correctChoice?.id || null;
      const selectedChoiceId = answer?.choice_id || null;
      const isCorrect =
        !!correctChoiceId &&
        !!selectedChoiceId &&
        String(correctChoiceId).toLowerCase() === String(selectedChoiceId).toLowerCase();

      const pointsEarned = isCorrect ? Number(q.points || 0) : 0;
      score += pointsEarned;

      if (answer?.id) {
        const { error: updateAnswerError } = await supabase
          .from("test_attempt_answers")
          .update({
            is_correct: isCorrect,
            points_earned: pointsEarned,
          })
          .eq("id", answer.id);

        if (updateAnswerError) throw new Error(updateAnswerError.message);
      } else {
        const { error: insertAnswerError } = await supabase
          .from("test_attempt_answers")
          .insert({
            attempt_id: attemptId,
            question_id: q.id,
            choice_id: null,
            is_correct: false,
            points_earned: 0,
          });

        if (insertAnswerError) throw new Error(insertAnswerError.message);
      }
    }

    const { error: updateAttemptError } = await supabase
      .from("test_attempts")
      .update({
        submitted_at: new Date().toISOString(),
        status: "GRADED",
        score,
        max_score: maxScore,
      })
      .eq("id", attemptId);

    if (updateAttemptError) throw new Error(updateAttemptError.message);

    return {
      attempt_id: attemptId,
      score,
      max_score: maxScore,
    };
  },

  async studentReviewAttempt(studentId, attemptId) {
    const attempt = await assertAttemptOwnedByStudent(studentId, attemptId);

    if (!["SUBMITTED", "GRADED"].includes(attempt.status)) {
      throw new Error("Bạn chỉ có thể xem lại sau khi nộp bài");
    }

    const { data: test, error: testError } = await supabase
      .from("tests")
      .select("id, course_id, title, description")
      .eq("id", attempt.test_id)
      .eq("is_deleted", false)
      .single();

    if (testError) throw new Error(testError.message);

    const questions = await getQuestionsWithChoices(attempt.test_id, true);

    const resultQuestions = [];
    for (const q of questions) {
      const { data: answer, error: aError } = await supabase
        .from("test_attempt_answers")
        .select("choice_id, is_correct, points_earned")
        .eq("attempt_id", attemptId)
        .eq("question_id", q.id)
        .maybeSingle();

      if (aError) throw new Error(aError.message);

      resultQuestions.push({
        ...q,
        selected_choice_id: answer?.choice_id || null,
        is_correct: answer?.is_correct ?? false,
        points_earned: answer?.points_earned ?? 0,
      });
    }

    return {
      attempt: {
        id: attempt.id,
        test_id: attempt.test_id,
        course_id: test.course_id,
        started_at: attempt.started_at,
        submitted_at: attempt.submitted_at,
        status: attempt.status,
        score: attempt.score,
        max_score: attempt.max_score,
      },
      test,
      questions: resultQuestions,
    };
  },
};