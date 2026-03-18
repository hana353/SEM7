const flashcardService = require("../services/flashcard.service");

function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj && obj[k] !== undefined) out[k] = obj[k];
  return out;
}

module.exports = {
  // PUBLIC
  async publicListPublished(req, res) {
    try {
      const courseId = req.query.course_id || null;
      const data = await flashcardService.publicListPublished({ courseId });
      return res.json({ data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async publicGetPublishedDetail(req, res) {
    try {
      const id = req.params.id;
      const data = await flashcardService.publicGetPublishedDetail(id);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  // TEACHER: SET
  async teacherCreateSet(req, res) {
    try {
      const teacherId = req.user.id;
      const payload = pick(req.body, ["course_id", "title", "description", "status"]);
      const data = await flashcardService.teacherCreateSet(teacherId, payload);
      return res.status(201).json({ message: "created", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherListSets(req, res) {
    try {
      const teacherId = req.user.id;
      const courseId = req.query.course_id || null;
      const status = req.query.status || null;
      const data = await flashcardService.teacherListSets(teacherId, { courseId, status });
      return res.json({ data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherGetSetDetail(req, res) {
    try {
      const teacherId = req.user.id;
      const id = req.params.id;
      const data = await flashcardService.teacherGetSetDetail(teacherId, id);
      return res.json({ data });
    } catch (e) {
      return res.status(404).json({ message: e.message });
    }
  },

  async teacherUpdateSet(req, res) {
    try {
      const teacherId = req.user.id;
      const id = req.params.id;
      const payload = pick(req.body, ["course_id", "title", "description", "status"]);
      const data = await flashcardService.teacherUpdateSet(teacherId, id, payload);
      return res.json({ message: "updated", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherDeleteSet(req, res) {
    try {
      const teacherId = req.user.id;
      const id = req.params.id;
      await flashcardService.teacherDeleteSet(teacherId, id);
      return res.json({ message: "deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  // TEACHER: CARDS
  async teacherAddCard(req, res) {
    try {
      const teacherId = req.user.id;
      const setId = req.params.id;
      const payload = pick(req.body, [
        "front_text",
        "back_text",
        "front_image_url",
        "back_image_url",
        "position",
      ]);
      const data = await flashcardService.teacherAddCard(teacherId, setId, payload);
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
      const data = await flashcardService.teacherUpdateCard(teacherId, cardId, payload);
      return res.json({ message: "updated", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherDeleteCard(req, res) {
    try {
      const teacherId = req.user.id;
      const cardId = req.params.cardId;
      await flashcardService.teacherDeleteCard(teacherId, cardId);
      return res.json({ message: "deleted" });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  async teacherReorderCards(req, res) {
    try {
      const teacherId = req.user.id;
      const setId = req.params.id;
      const { cardIds } = req.body;
      const data = await flashcardService.teacherReorderCards(teacherId, setId, cardIds);
      return res.json({ message: "reordered", data });
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },
};

