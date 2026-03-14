const supabase = require("../config/supabase");

const ALLOWED_STATUS = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);

function normalizeStatus(s) {
  if (s === null || s === undefined) return null;
  const v = String(s).toUpperCase();
  if (!ALLOWED_STATUS.has(v)) {
    throw new Error("status không hợp lệ (DRAFT|PUBLISHED|ARCHIVED)");
  }
  return v;
}

async function assertQuizSetOwnedByTeacher(teacherId, quizSetId) {
  const { data, error } = await supabase
    .from("quiz_sets")
    .select("id, teacher_id, is_deleted")
    .eq("id", quizSetId)
    .eq("teacher_id", teacherId)
    .eq("is_deleted", false)
    .single();

  if (error || !data) {
    throw new Error("Quiz set không tồn tại hoặc không thuộc quyền TEACHER");
  }
}

async function assertCardOwnedByTeacher(teacherId, cardId) {
  const { data, error } = await supabase
    .from("quiz_cards")
    .select(`
      id,
      quiz_set_id,
      is_deleted,
      quiz_sets!inner (
        id,
        teacher_id,
        is_deleted
      )
    `)
    .eq("id", cardId)
    .eq("is_deleted", false)
    .eq("quiz_sets.teacher_id", teacherId)
    .eq("quiz_sets.is_deleted", false)
    .single();

  if (error || !data) {
    throw new Error("Card không tồn tại hoặc không thuộc quyền TEACHER");
  }

  return data.quiz_set_id;
}

async function publicListPublished({ courseId }) {
  let query = supabase
    .from("quiz_sets")
    .select("id, teacher_id, course_id, title, description, status, created_at, updated_at")
    .eq("is_deleted", false)
    .eq("status", "PUBLISHED")
    .order("updated_at", { ascending: false });

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

async function publicGetPublishedDetail(quizSetId) {
  const { data: header, error: headerError } = await supabase
    .from("quiz_sets")
    .select("id, teacher_id, course_id, title, description, status, created_at, updated_at")
    .eq("id", quizSetId)
    .eq("is_deleted", false)
    .eq("status", "PUBLISHED")
    .single();

  if (headerError || !header) {
    throw new Error("Quiz set không tồn tại hoặc chưa publish");
  }

  const { data: cards, error: cardsError } = await supabase
    .from("quiz_cards")
    .select("id, quiz_set_id, front_text, back_text, front_image_url, back_image_url, position, created_at")
    .eq("quiz_set_id", quizSetId)
    .eq("is_deleted", false)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (cardsError) throw new Error(cardsError.message);

  return { ...header, cards: cards || [] };
}

async function teacherCreateQuizSet(teacherId, payload) {
  const title = String(payload.title || "").trim();
  if (!title) throw new Error("title là bắt buộc");

  const status = normalizeStatus(payload.status || "DRAFT");
  const courseId = payload.course_id ?? null;
  const description = payload.description ?? null;

  if (courseId) {
    const { data: c, error: cError } = await supabase
      .from("courses")
      .select("id, status")
      .eq("id", courseId)
      .eq("teacher_id", teacherId)
      .single();

    if (cError || !c || c.status === "DELETED") {
      throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");
    }
  }

  const { data, error } = await supabase
    .from("quiz_sets")
    .insert({
      teacher_id: teacherId,
      course_id: courseId,
      title,
      description,
      status,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function teacherListQuizSets(teacherId, { courseId, status }) {
  const st = status ? normalizeStatus(status) : null;

  let query = supabase
    .from("quiz_sets")
    .select("id, teacher_id, course_id, title, description, status, created_at, updated_at")
    .eq("teacher_id", teacherId)
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  if (courseId) query = query.eq("course_id", courseId);
  if (st) query = query.eq("status", st);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

async function teacherGetQuizSetDetail(teacherId, quizSetId) {
  await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

  const { data: header, error: headerError } = await supabase
    .from("quiz_sets")
    .select("id, teacher_id, course_id, title, description, status, created_at, updated_at")
    .eq("id", quizSetId)
    .eq("is_deleted", false)
    .single();

  if (headerError) throw new Error(headerError.message);

  const { data: cards, error: cardsError } = await supabase
    .from("quiz_cards")
    .select("id, quiz_set_id, front_text, back_text, front_image_url, back_image_url, position, created_at, updated_at")
    .eq("quiz_set_id", quizSetId)
    .eq("is_deleted", false)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (cardsError) throw new Error(cardsError.message);

  return { ...header, cards: cards || [] };
}

async function teacherUpdateQuizSet(teacherId, quizSetId, payload) {
  await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (payload.course_id !== undefined) {
    if (payload.course_id) {
      const { data: c, error: cError } = await supabase
        .from("courses")
        .select("id, status")
        .eq("id", payload.course_id)
        .eq("teacher_id", teacherId)
        .single();

      if (cError || !c || c.status === "DELETED") {
        throw new Error("Khóa học không tồn tại hoặc không được gán cho giáo viên này");
      }
    }
    updates.course_id = payload.course_id ?? null;
  }

  if (payload.title !== undefined) {
    const t = String(payload.title || "").trim();
    if (!t) throw new Error("title không được rỗng");
    updates.title = t;
  }

  if (payload.description !== undefined) {
    updates.description = payload.description ?? null;
  }

  if (payload.status !== undefined) {
    updates.status = normalizeStatus(payload.status);
  }

  const { data, error } = await supabase
    .from("quiz_sets")
    .update(updates)
    .eq("id", quizSetId)
    .eq("is_deleted", false)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function teacherDeleteQuizSet(teacherId, quizSetId) {
  await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

  const now = new Date().toISOString();

  const { error: setError } = await supabase
    .from("quiz_sets")
    .update({
      is_deleted: true,
      updated_at: now,
    })
    .eq("id", quizSetId)
    .eq("is_deleted", false);

  if (setError) throw new Error(setError.message);

  const { error: cardsError } = await supabase
    .from("quiz_cards")
    .update({
      is_deleted: true,
      updated_at: now,
    })
    .eq("quiz_set_id", quizSetId)
    .eq("is_deleted", false);

  if (cardsError) throw new Error(cardsError.message);
}

async function teacherAddCard(teacherId, quizSetId, payload) {
  await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

  const front = String(payload.front_text || "").trim();
  const back = String(payload.back_text || "").trim();

  if (!front) throw new Error("front_text là bắt buộc");
  if (!back) throw new Error("back_text là bắt buộc");

  let pos = payload.position;

  if (pos === undefined || pos === null || Number.isNaN(Number(pos))) {
    const { data: maxRows, error: maxError } = await supabase
      .from("quiz_cards")
      .select("position")
      .eq("quiz_set_id", quizSetId)
      .eq("is_deleted", false)
      .order("position", { ascending: false })
      .limit(1);

    if (maxError) throw new Error(maxError.message);

    pos = maxRows?.length ? Number(maxRows[0].position || 0) + 1 : 0;
  } else {
    pos = Number(pos);
  }

  const { data, error } = await supabase
    .from("quiz_cards")
    .insert({
      quiz_set_id: quizSetId,
      front_text: front,
      back_text: back,
      front_image_url: payload.front_image_url ?? null,
      back_image_url: payload.back_image_url ?? null,
      position: pos,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function teacherUpdateCard(teacherId, cardId, payload) {
  await assertCardOwnedByTeacher(teacherId, cardId);

  const updates = {
    updated_at: new Date().toISOString(),
  };

  if (payload.front_text !== undefined) {
    const v = String(payload.front_text || "").trim();
    if (!v) throw new Error("front_text không được rỗng");
    updates.front_text = v;
  }

  if (payload.back_text !== undefined) {
    const v = String(payload.back_text || "").trim();
    if (!v) throw new Error("back_text không được rỗng");
    updates.back_text = v;
  }

  if (payload.front_image_url !== undefined) {
    updates.front_image_url = payload.front_image_url ?? null;
  }

  if (payload.back_image_url !== undefined) {
    updates.back_image_url = payload.back_image_url ?? null;
  }

  if (payload.position !== undefined) {
    const pos = Number(payload.position);
    if (Number.isNaN(pos)) throw new Error("position không hợp lệ");
    updates.position = pos;
  }

  const { data, error } = await supabase
    .from("quiz_cards")
    .update(updates)
    .eq("id", cardId)
    .eq("is_deleted", false)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function teacherDeleteCard(teacherId, cardId) {
  await assertCardOwnedByTeacher(teacherId, cardId);

  const { error } = await supabase
    .from("quiz_cards")
    .update({
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cardId)
    .eq("is_deleted", false);

  if (error) throw new Error(error.message);
}

async function teacherReorderCards(teacherId, quizSetId, cardIds) {
  await assertQuizSetOwnedByTeacher(teacherId, quizSetId);

  if (!Array.isArray(cardIds) || cardIds.length === 0) {
    throw new Error("cardIds phải là mảng và không được rỗng");
  }

  const { data: existing, error: existingError } = await supabase
    .from("quiz_cards")
    .select("id")
    .eq("quiz_set_id", quizSetId)
    .eq("is_deleted", false);

  if (existingError) throw new Error(existingError.message);

  const set = new Set((existing || []).map((r) => String(r.id).toLowerCase()));
  for (const id of cardIds) {
    if (!set.has(String(id).toLowerCase())) {
      throw new Error("Có cardId không thuộc quiz set hoặc đã bị xoá");
    }
  }

  for (let i = 0; i < cardIds.length; i++) {
    const { error } = await supabase
      .from("quiz_cards")
      .update({
        position: i,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardIds[i])
      .eq("is_deleted", false);

    if (error) throw new Error(error.message);
  }

  return { count: cardIds.length };
}

module.exports = {
  publicListPublished,
  publicGetPublishedDetail,
  teacherCreateQuizSet,
  teacherListQuizSets,
  teacherGetQuizSetDetail,
  teacherUpdateQuizSet,
  teacherDeleteQuizSet,
  teacherAddCard,
  teacherUpdateCard,
  teacherDeleteCard,
  teacherReorderCards,
};