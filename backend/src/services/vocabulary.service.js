const { pool, poolConnect, sql } = require("../config/db");

async function getVocabularyTopics() {
  await poolConnect;
  const rs = await pool.request().query(`
    SELECT vt.id, vt.title,
      (SELECT COUNT(*) FROM vocabularies v WHERE v.topic_id = vt.id) AS words_count
    FROM vocabulary_topics vt
    ORDER BY vt.title
  `);
  return rs.recordset;
}

async function createVocabularyTopic(title) {
  if (!title || !title.trim()) throw new Error("title là bắt buộc");
  await poolConnect;
  const rs = await pool
    .request()
    .input("title", sql.NVarChar(255), title.trim())
    .query(`
      INSERT INTO vocabulary_topics (title)
      OUTPUT INSERTED.*
      VALUES (@title)
    `);
  return rs.recordset[0];
}

async function getWordsByTopic(topicId) {
  if (!topicId) throw new Error("topicId là bắt buộc");
  await poolConnect;
  const rs = await pool
    .request()
    .input("topic_id", sql.UniqueIdentifier, topicId)
    .query(`
      SELECT id, topic_id, word, meaning, example_sentence
      FROM vocabularies
      WHERE topic_id = @topic_id
      ORDER BY word
    `);
  return rs.recordset;
}

async function createVocabularyWord(topicId, word, meaning, exampleSentence) {
  if (!topicId) throw new Error("topicId là bắt buộc");
  if (!word || !word.trim()) throw new Error("word là bắt buộc");

  await poolConnect;
  const rs = await pool
    .request()
    .input("topic_id", sql.UniqueIdentifier, topicId)
    .input("word", sql.NVarChar(255), word.trim())
    .input("meaning", sql.NVarChar(sql.MAX), meaning || null)
    .input("example_sentence", sql.NVarChar(sql.MAX), exampleSentence || null)
    .query(`
      INSERT INTO vocabularies (topic_id, word, meaning, example_sentence)
      OUTPUT INSERTED.*
      VALUES (@topic_id, @word, @meaning, @example_sentence)
    `);
  return rs.recordset[0];
}

async function logPronunciationPractice(studentId, vocabularyId, spokenText, accuracyPercent) {
  if (!studentId) throw new Error("studentId là bắt buộc");
  if (!vocabularyId) throw new Error("vocabularyId là bắt buộc");

  const accuracy = Number.isFinite(accuracyPercent) ? accuracyPercent : 0;

  await poolConnect;
  const rs = await pool
    .request()
    .input("student_id", sql.UniqueIdentifier, studentId)
    .input("vocabulary_id", sql.UniqueIdentifier, vocabularyId)
    .input("spoken_text", sql.NVarChar(sql.MAX), spokenText || null)
    .input("accuracy_percent", sql.Decimal(5, 2), accuracy)
    .query(`
      INSERT INTO pronunciation_practice (
        student_id,
        vocabulary_id,
        spoken_text,
        accuracy_percent
      )
      OUTPUT INSERTED.*
      VALUES (
        @student_id,
        @vocabulary_id,
        @spoken_text,
        @accuracy_percent
      )
    `);

  return rs.recordset[0];
}

async function getRemindWordsForStudent(studentId, limit = 20) {
  if (!studentId) throw new Error("studentId là bắt buộc");
  await poolConnect;

  const rs = await pool
    .request()
    .input("student_id", sql.UniqueIdentifier, studentId)
    .input("limit", sql.Int, limit)
    .query(`
      WITH last_practice AS (
        SELECT
          pp.vocabulary_id,
          MAX(pp.practiced_at) AS last_time
        FROM pronunciation_practice pp
        WHERE pp.student_id = @student_id
        GROUP BY pp.vocabulary_id
      ),
      joined AS (
        SELECT
          v.id,
          v.topic_id,
          v.word,
          v.meaning,
          v.example_sentence,
          pp.accuracy_percent,
          pp.practiced_at
        FROM vocabularies v
        LEFT JOIN last_practice lp ON lp.vocabulary_id = v.id
        LEFT JOIN pronunciation_practice pp
          ON pp.vocabulary_id = v.id
         AND pp.student_id = @student_id
         AND pp.practiced_at = lp.last_time
      )
      SELECT TOP (@limit)
        id,
        topic_id,
        word,
        meaning,
        example_sentence,
        accuracy_percent,
        practiced_at
      FROM joined
      WHERE accuracy_percent IS NULL OR accuracy_percent < 80
      ORDER BY
        CASE WHEN accuracy_percent IS NULL THEN 0 ELSE 1 END,
        accuracy_percent ASC;
    `);

  return rs.recordset;
}

module.exports = {
  getVocabularyTopics,
  createVocabularyTopic,
  getWordsByTopic,
  createVocabularyWord,
  logPronunciationPractice,
  getRemindWordsForStudent,
};
