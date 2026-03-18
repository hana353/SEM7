const supabase = require("../config/supabase");

async function createNotification({ userId, type, title, body = null, metadata = {} }) {
  if (!userId) throw new Error("userId is required");
  if (!type) throw new Error("type is required");
  if (!title) throw new Error("title is required");

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      body,
      metadata,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function listNotifications(userId, { q, type, is_read, limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from("notifications")
    .select("id, user_id, type, title, body, metadata, is_read, read_at, created_at", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (is_read !== undefined) query = query.eq("is_read", Boolean(is_read));

  const keyword = q ? String(q).trim() : "";
  if (keyword) {
    query = query.textSearch("search_vector", keyword, { type: "plain" });
  }

  const lim = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const off = Math.max(Number(offset) || 0, 0);
  query = query.range(off, off + lim - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data: data || [], count: count ?? null, limit: lim, offset: off };
}

async function markAsRead(userId, notificationId) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

module.exports = { createNotification, listNotifications, markAsRead };

