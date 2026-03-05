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
