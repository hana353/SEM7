const supabase = require("../config/supabase");

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function extractBudget(message) {
  const normalized = normalizeText(message);

  const millionMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(trieu|cu|m)\b/);
  if (millionMatch) {
    return Math.round(parseFloat(millionMatch[1].replace(",", ".")) * 1000000);
  }

  const kMatch = normalized.match(/(\d+(?:[.,]\d+)?)\s*(k|ngan)\b/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1].replace(",", ".")) * 1000);
  }

  const rawNumberMatch = normalized.match(/\b(\d{5,9})\b/);
  if (rawNumberMatch) {
    return Number(rawNumberMatch[1]);
  }

  return null;
}

function extractHints(message) {
  const normalized = normalizeText(message);

  return {
    normalized,
    wantsBeginner:
      /moi bat dau|beginner|nhap mon|co ban|mat goc/.test(normalized),
    wantsIelts: /ielts/.test(normalized),
    wantsToeic: /toeic/.test(normalized),
    wantsCommunication: /giao tiep|conversation|speaking/.test(normalized),
    budget: extractBudget(normalized),
  };
}

function scoreCourse(course, hints) {
  const haystack = normalizeText(
    [course.title, course.description, course.teacher_name]
      .filter(Boolean)
      .join(" ")
  );

  let score = 0;
  const words = hints.normalized.split(/\s+/).filter((w) => w.length >= 3);

  for (const word of words) {
    if (haystack.includes(word)) score += 2;
  }

  if (hints.wantsBeginner && /beginner|co ban|nhap mon|mat goc/.test(haystack)) {
    score += 6;
  }

  if (hints.wantsIelts && /ielts/.test(haystack)) score += 6;
  if (hints.wantsToeic && /toeic/.test(haystack)) score += 6;
  if (hints.wantsCommunication && /giao tiep|conversation|speaking/.test(haystack)) {
    score += 6;
  }

  if (hints.budget && Number(course.price || 0) <= hints.budget) {
    score += 4;
  }

  return score;
}

async function getTeacherMap() {
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name");

  if (error) {
    throw new Error(error.message);
  }

  const teacherMap = new Map();
  for (const user of data || []) {
    teacherMap.set(user.id, user.full_name || "");
  }
  return teacherMap;
}

async function getCourses() {
  const [courseRes, teacherMap] = await Promise.all([
    supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        status,
        start_at,
        end_at,
        total_duration_minutes,
        teacher_id,
        created_at
      `)
      .neq("status", "ARCHIVED")
      .order("created_at", { ascending: false }),
    getTeacherMap(),
  ]);

  const { data, error } = courseRes;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((course) => ({
    id: course.id,
    title: course.title || "",
    description: course.description || "",
    price: course.price || 0,
    status: course.status || "",
    start_at: course.start_at || null,
    end_at: course.end_at || null,
    total_duration_minutes: course.total_duration_minutes || 0,
    teacher_id: course.teacher_id || null,
    teacher_name: teacherMap.get(course.teacher_id) || "",
  }));
}

async function retrieveRelevantCourses(message, limit = 4) {
  const hints = extractHints(message);
  const courses = await getCourses();

  const ranked = courses
    .map((course) => ({
      ...course,
      _score: scoreCourse(course, hints),
    }))
    .filter((course) => course._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...course }) => course);

  if (ranked.length > 0) return ranked;

  return courses.slice(0, limit);
}

function scoreDoc(doc, normalizedMessage) {
  const haystack = normalizeText(
    `${doc.title || ""} ${doc.content || ""} ${
      Array.isArray(doc.tags) ? doc.tags.join(" ") : ""
    }`
  );

  let score = 0;
  const words = normalizedMessage.split(/\s+/).filter((w) => w.length >= 3);

  for (const word of words) {
    if (haystack.includes(word)) score += 2;
  }

  return score;
}

async function retrieveRelevantDocs(message, limit = 3) {
  const normalizedMessage = normalizeText(message);

  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("id, type, title, content, source, tags, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const ranked = (data || [])
    .map((doc) => ({
      ...doc,
      _score: scoreDoc(doc, normalizedMessage),
    }))
    .filter((doc) => doc._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...doc }) => doc);

  return ranked;
}

module.exports = {
  extractBudget,
  extractHints,
  retrieveRelevantCourses,
  retrieveRelevantDocs,
};