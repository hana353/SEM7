const vocabularyService = require("../services/vocabulary.service");

exports.getTopics = async (req, res) => {
  try {
    const data = await vocabularyService.getVocabularyTopics();
    return res.json({ data });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { title } = req.body;
    const data = await vocabularyService.createVocabularyTopic(title);
    return res.status(201).json({ message: "created", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { title } = req.body;
    const data = await vocabularyService.updateVocabularyTopic(topicId, title);
    return res.json({ message: "updated", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    await vocabularyService.deleteVocabularyTopic(topicId);
    return res.json({ message: "deleted" });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.getWordsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const data = await vocabularyService.getWordsByTopic(topicId);
    return res.json({ data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.createWord = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { word, meaning, exampleSentence } = req.body;
    const data = await vocabularyService.createVocabularyWord(
      topicId,
      word,
      meaning,
      exampleSentence
    );
    return res.status(201).json({ message: "created", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.logPractice = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const { vocabularyId, spokenText, accuracyPercent } = req.body;
    const data = await vocabularyService.logPronunciationPractice(
      studentId,
      vocabularyId,
      spokenText,
      accuracyPercent
    );
    return res.status(201).json({ message: "logged", data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.getRemindWords = async (req, res) => {
  try {
    const studentId = req.user?.id;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const data = await vocabularyService.getRemindWordsForStudent(
      studentId,
      Number.isFinite(limit) && limit > 0 ? limit : 20
    );
    return res.json({ data });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};
