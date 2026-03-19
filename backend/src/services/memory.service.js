const supabase = require("../config/supabase");

async function getOrCreateSession(userId) {
  if (!userId) {
    throw new Error("userId là bắt buộc");
  }

  const { data: existing, error: fetchError } = await supabase
    .from("chat_sessions")
    .select("id, user_id, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existing) {
    return existing;
  }

  const { data: created, error: createError } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
    })
    .select("id, user_id, created_at, updated_at")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created;
}

async function saveMessage(sessionId, role, content, metadata = {}) {
  if (!sessionId) throw new Error("sessionId là bắt buộc");
  if (!role) throw new Error("role là bắt buộc");
  if (!content) throw new Error("content là bắt buộc");

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      session_id: sessionId,
      role,
      content,
      metadata,
    })
    .select("id, session_id, role, content, metadata, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  return data;
}

async function getRecentMessages(sessionId, limit = 8) {
  if (!sessionId) throw new Error("sessionId là bắt buộc");

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, metadata, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).slice(-limit);
}

module.exports = {
  getOrCreateSession,
  saveMessage,
  getRecentMessages,
};