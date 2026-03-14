// src/controllers/quiz.controller.js
const quizService = require("../services/quiz.service");

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj && obj[k] !== undefined) out[k] = obj[k];
  return out;
}

module.exports = {
  // ============ PUBLIC ============
  async publicListPublished(req, res) {
    try {
      const courseId = req.query.course_id || null;
      const data = await quizService.publicListPublished({ courseId });
      return res.json({ data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async publicGetPublishedDetail(req, res) {
    try {
      const id = req.params.id;
      const data = await quizService.publicGetPublishedDetail(id);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  // ============ TEACHER: QUIZ SET ============
  async teacherCreateQuizSet(req, res) {
    try {
      const teacherId = req.user.id;
      const payload = pick(req.body, ["course_id", "title", "description", "status"]);
      const data = await quizService.teacherCreateQuizSet(teacherId, payload);
      return res.status(201).json({ message: "created", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherListQuizSets(req, res) {
    try {
      const teacherId = req.user.id;
      const courseId = req.query.course_id || null;
      const status = req.query.status || null;
      const data = await quizService.teacherListQuizSets(teacherId, { courseId, status });
      return res.json({ data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherGetQuizSetDetail(req, res) {
    try {
      const teacherId = req.user.id;
      const id = req.params.id;
      const data = await quizService.teacherGetQuizSetDetail(teacherId, id);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  async teacherUpdateQuizSet(req, res) {
    try {
      const teacherId = req.user.id;
      const id = req.params.id;
      const payload = pick(req.body, ["course_id", "title", "description", "status"]);
      const data = await quizService.teacherUpdateQuizSet(teacherId, id, payload);
      return res.json({ message: "updated", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherDeleteQuizSet(req, res) {
    try {
      const teacherId = req.user.id;
      const id = req.params.id;
      await quizService.teacherDeleteQuizSet(teacherId, id);
      return res.json({ message: "deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  // ============ TEACHER: CARDS ============
  async teacherAddCard(req, res) {
    try {
      const teacherId = req.user.id;
      const quizSetId = req.params.id;
      const payload = pick(req.body, [
        "front_text",
        "back_text",
        "front_image_url",
        "back_image_url",
        "position",
      ]);
      const data = await quizService.teacherAddCard(teacherId, quizSetId, payload);
      return res.status(201).json({ message: "created", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherUpdateCard(req, res) {
    try {
      const teacherId = req.user.id;
      const cardId = req.params.cardId;
      const payload = pick(req.body, [
        "front_text",
        "back_text",
        "front_image_url",
        "back_image_url",
        "position",
      ]);
      const data = await quizService.teacherUpdateCard(teacherId, cardId, payload);
      return res.json({ message: "updated", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherDeleteCard(req, res) {
    try {
      const teacherId = req.user.id;
      const cardId = req.params.cardId;
      await quizService.teacherDeleteCard(teacherId, cardId);
      return res.json({ message: "deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherReorderCards(req, res) {
    try {
      const teacherId = req.user.id;
      const quizSetId = req.params.id;
      const { cardIds } = req.body; // array of GUID strings
      const data = await quizService.teacherReorderCards(teacherId, quizSetId, cardIds);
      return res.json({ message: "reordered", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },
};