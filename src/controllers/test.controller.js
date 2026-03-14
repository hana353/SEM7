// src/controllers/test.controller.js
const testService = require("../services/test.service");

function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    if (obj && obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

module.exports = {
  /* =========================
     PUBLIC / STUDENT
  ========================= */
  async publicListPublished(req, res) {
    try {
      const courseId = req.query.course_id || null;
      const data = await testService.publicListPublished({ courseId });
      return res.json({ data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async publicGetPublishedDetail(req, res) {
    try {
      const data = await testService.publicGetPublishedDetail(req.params.id);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  async studentStartAttempt(req, res) {
    try {
      const studentId = req.user.id;
      const testId = req.params.id;
      const data = await testService.studentStartAttempt(studentId, testId);
      return res.status(201).json({ message: "attempt created", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async studentGetAttemptDetail(req, res) {
    try {
      const studentId = req.user.id;
      const attemptId = req.params.attemptId;
      const data = await testService.studentGetAttemptDetail(studentId, attemptId);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  async studentSaveAnswer(req, res) {
    try {
      const studentId = req.user.id;
      const attemptId = req.params.attemptId;
      const payload = pick(req.body, ["question_id", "choice_id"]);
      const data = await testService.studentSaveAnswer(studentId, attemptId, payload);
      return res.json({ message: "saved", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async studentSubmitAttempt(req, res) {
    try {
      const studentId = req.user.id;
      const attemptId = req.params.attemptId;
      const data = await testService.studentSubmitAttempt(studentId, attemptId);
      return res.json({ message: "submitted", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async studentReviewAttempt(req, res) {
    try {
      const studentId = req.user.id;
      const attemptId = req.params.attemptId;
      const data = await testService.studentReviewAttempt(studentId, attemptId);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  /* =========================
     TEACHER
  ========================= */
  async teacherCreateTest(req, res) {
    try {
      const teacherId = req.user.id;
      const payload = pick(req.body, [
        "course_id",
        "title",
        "description",
        "duration_minutes",
        "max_attempts",
        "shuffle_questions",
        "shuffle_choices",
        "status",
        "open_at",
        "close_at",
      ]);
      const data = await testService.teacherCreateTest(teacherId, payload);
      return res.status(201).json({ message: "created", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherListTests(req, res) {
    try {
      const teacherId = req.user.id;
      const courseId = req.query.course_id || null;
      const status = req.query.status || null;
      const data = await testService.teacherListTests(teacherId, { courseId, status });
      return res.json({ data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherGetTestDetail(req, res) {
    try {
      const teacherId = req.user.id;
      const testId = req.params.id;
      const data = await testService.teacherGetTestDetail(teacherId, testId);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  async teacherListTestAttempts(req, res) {
    try {
      const teacherId = req.user.id;
      const testId = req.params.id;
      const data = await testService.teacherListTestAttempts(teacherId, testId);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  async teacherUpdateTest(req, res) {
    try {
      const teacherId = req.user.id;
      const testId = req.params.id;
      const payload = pick(req.body, [
        "course_id",
        "title",
        "description",
        "duration_minutes",
        "max_attempts",
        "shuffle_questions",
        "shuffle_choices",
        "status",
        "open_at",
        "close_at",
      ]);
      const data = await testService.teacherUpdateTest(teacherId, testId, payload);
      return res.json({ message: "updated", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherDeleteTest(req, res) {
    try {
      const teacherId = req.user.id;
      const testId = req.params.id;
      await testService.teacherDeleteTest(teacherId, testId);
      return res.json({ message: "deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherAddQuestion(req, res) {
    try {
      const teacherId = req.user.id;
      const testId = req.params.id;
      const payload = pick(req.body, ["question_text", "points", "position"]);
      const data = await testService.teacherAddQuestion(teacherId, testId, payload);
      return res.status(201).json({ message: "created", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherUpdateQuestion(req, res) {
    try {
      const teacherId = req.user.id;
      const questionId = req.params.questionId;
      const payload = pick(req.body, ["question_text", "points", "position"]);
      const data = await testService.teacherUpdateQuestion(teacherId, questionId, payload);
      return res.json({ message: "updated", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherDeleteQuestion(req, res) {
    try {
      const teacherId = req.user.id;
      const questionId = req.params.questionId;
      await testService.teacherDeleteQuestion(teacherId, questionId);
      return res.json({ message: "deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherAddChoice(req, res) {
    try {
      const teacherId = req.user.id;
      const questionId = req.params.questionId;
      const payload = pick(req.body, ["choice_text", "is_correct", "position"]);
      const data = await testService.teacherAddChoice(teacherId, questionId, payload);
      return res.status(201).json({ message: "created", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherUpdateChoice(req, res) {
    try {
      const teacherId = req.user.id;
      const choiceId = req.params.choiceId;
      const payload = pick(req.body, ["choice_text", "is_correct", "position"]);
      const data = await testService.teacherUpdateChoice(teacherId, choiceId, payload);
      return res.json({ message: "updated", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherDeleteChoice(req, res) {
    try {
      const teacherId = req.user.id;
      const choiceId = req.params.choiceId;
      await testService.teacherDeleteChoice(teacherId, choiceId);
      return res.json({ message: "deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },
};