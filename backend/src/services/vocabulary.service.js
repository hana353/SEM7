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

module.exports = { getVocabularyTopics, createVocabularyTopic };
