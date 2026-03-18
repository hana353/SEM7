const supabase = require("../config/supabase");

async function getVocabularyTopics() {
  const { data: topics, error: topicsError } = await supabase
    .from("vocabulary_topics")
    .select("id, title")
    .order("title", { ascending: true });

  if (topicsError) throw new Error(topicsError.message);

  if (!topics?.length) return [];

  const topicIds = topics.map((t) => t.id);

  const { data: words, error: wordsError } = await supabase
    .from("vocabularies")
    .select("id, topic_id")
    .in("topic_id", topicIds);

  if (wordsError) throw new Error(wordsError.message);

  const countMap = new Map();
  for (const w of words || []) {
    countMap.set(w.topic_id, (countMap.get(w.topic_id) || 0) + 1);
  }

  return topics.map((t) => ({
    id: t.id,
    title: t.title,
    words_count: countMap.get(t.id) || 0,
  }));
}

async function createVocabularyTopic(title) {
  if (!title || !title.trim()) throw new Error("title là bắt buộc");

  const { data, error } = await supabase
    .from("vocabulary_topics")
    .insert({
      title: title.trim(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function updateVocabularyTopic(topicId, title) {
  if (!topicId) throw new Error("topicId là bắt buộc");
  if (!title || !title.trim()) throw new Error("title là bắt buộc");

  const { data, error } = await supabase
    .from("vocabulary_topics")
    .update({ title: title.trim() })
    .eq("id", topicId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function deleteVocabularyTopic(topicId) {
  if (!topicId) throw new Error("topicId là bắt buộc");

  const { count, error: cntError } = await supabase
    .from("vocabularies")
    .select("id", { count: "exact", head: true })
    .eq("topic_id", topicId);

  if (cntError) throw new Error(cntError.message);
  if ((count || 0) > 0) {
    throw new Error("Không thể xóa chủ đề khi vẫn còn từ vựng bên trong");
  }

  const { error } = await supabase.from("vocabulary_topics").delete().eq("id", topicId);
  if (error) throw new Error(error.message);
}

async function getWordsByTopic(topicId) {
  if (!topicId) throw new Error("topicId là bắt buộc");

  const { data, error } = await supabase
    .from("vocabularies")
    .select("id, topic_id, word, meaning, example_sentence")
    .eq("topic_id", topicId)
    .order("word", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

async function createVocabularyWord(topicId, word, meaning, exampleSentence) {
  if (!topicId) throw new Error("topicId là bắt buộc");
  if (!word || !word.trim()) throw new Error("word là bắt buộc");

  const { data, error } = await supabase
    .from("vocabularies")
    .insert({
      topic_id: topicId,
      word: word.trim(),
      meaning: meaning || null,
      example_sentence: exampleSentence || null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function logPronunciationPractice(studentId, vocabularyId, spokenText, accuracyPercent) {
  if (!studentId) throw new Error("studentId là bắt buộc");
  if (!vocabularyId) throw new Error("vocabularyId là bắt buộc");

  const accuracy = Number.isFinite(Number(accuracyPercent))
    ? Number(accuracyPercent)
    : 0;

  const { data, error } = await supabase
    .from("pronunciation_practice")
    .insert({
      student_id: studentId,
      vocabulary_id: vocabularyId,
      spoken_text: spokenText || null,
      accuracy_percent: accuracy,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function getRemindWordsForStudent(studentId, limit = 20) {
  if (!studentId) throw new Error("studentId là bắt buộc");

  const safeLimit = Number(limit) > 0 ? Number(limit) : 20;

  const { data: vocabularies, error: vocabError } = await supabase
    .from("vocabularies")
    .select("id, topic_id, word, meaning, example_sentence")
    .order("word", { ascending: true });

  if (vocabError) throw new Error(vocabError.message);

  if (!vocabularies?.length) return [];

  const vocabularyIds = vocabularies.map((v) => v.id);

  const { data: practices, error: practiceError } = await supabase
    .from("pronunciation_practice")
    .select("vocabulary_id, accuracy_percent, practiced_at")
    .eq("student_id", studentId)
    .in("vocabulary_id", vocabularyIds)
    .order("practiced_at", { ascending: false });

  if (practiceError) throw new Error(practiceError.message);

  const latestMap = new Map();
  for (const p of practices || []) {
    if (!latestMap.has(p.vocabulary_id)) {
      latestMap.set(p.vocabulary_id, p);
    }
  }

  const rows = vocabularies.map((v) => {
    const latest = latestMap.get(v.id);
    return {
      id: v.id,
      topic_id: v.topic_id,
      word: v.word,
      meaning: v.meaning,
      example_sentence: v.example_sentence,
      accuracy_percent: latest?.accuracy_percent ?? null,
      practiced_at: latest?.practiced_at ?? null,
    };
  });

  return rows
    .filter((r) => r.accuracy_percent === null || Number(r.accuracy_percent) < 80)
    .sort((a, b) => {
      const aNull = a.accuracy_percent === null ? 0 : 1;
      const bNull = b.accuracy_percent === null ? 0 : 1;
      if (aNull !== bNull) return aNull - bNull;
      return Number(a.accuracy_percent || 0) - Number(b.accuracy_percent || 0);
    })
    .slice(0, safeLimit);
}

module.exports = {
  getVocabularyTopics,
  createVocabularyTopic,
  updateVocabularyTopic,
  deleteVocabularyTopic,
  getWordsByTopic,
  createVocabularyWord,
  logPronunciationPractice,
  getRemindWordsForStudent,
};