const supabase = require("../config/supabase");

async function getRoleIdByCode(roleCode) {
  const { data, error } = await supabase
    .from("roles")
    .select("id, code")
    .eq("code", String(roleCode).toUpperCase())
    .single();

  if (error || !data) {
    throw new Error("Role không tồn tại");
  }

  return data.id;
}

function normalizeUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    role_id: row.role_id,
    role_code: row.roles?.code || null,
    is_verified: row.is_verified,
    is_active: row.is_active,
    is_deleted: row.is_deleted,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function getUserById(userId) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      phone,
      role_id,
      is_verified,
      is_active,
      is_deleted,
      created_at,
      updated_at,
      roles!users_role_id_fkey (
        code
      )
    `)
    .eq("id", userId)
    .eq("is_deleted", false)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return normalizeUser(data);
}

async function getAllUsers() {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      phone,
      role_id,
      is_verified,
      is_active,
      is_deleted,
      created_at,
      updated_at,
      roles!users_role_id_fkey (
        code
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(normalizeUser);
}

async function changeRole(userId, newRoleCode) {
  const roleCode = String(newRoleCode).toUpperCase();
  if (!["TEACHER", "STUDENT"].includes(roleCode)) {
    throw new Error("Chỉ được chuyển vai trò thành TEACHER hoặc STUDENT");
  }

  const roleId = await getRoleIdByCode(roleCode);

  const { data: currentUser, error: currentError } = await supabase
    .from("users")
    .select(`
      id,
      role_id,
      is_deleted,
      roles!users_role_id_fkey (
        code
      )
    `)
    .eq("id", userId)
    .eq("is_deleted", false)
    .single();

  if (currentError || !currentUser) {
    throw new Error("User not found or cannot change role");
  }

  if (currentUser.roles?.code === "ADMIN") {
    throw new Error("User not found or cannot change role (Admin cannot be changed)");
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({
      role_id: roleId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("is_deleted", false);

  if (updateError) throw new Error(updateError.message);

  return getUserById(userId);
}

async function promoteToTeacher(userId) {
  return changeRole(userId, "TEACHER");
}

async function softDeleteUser(userId) {
  const { data: exists, error: existsError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .eq("is_deleted", false)
    .single();

  if (existsError || !exists) {
    throw new Error("User not found or already deleted");
  }

  const { error } = await supabase
    .from("users")
    .update({
      is_active: false,
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .eq("is_deleted", false);

  if (error) throw new Error(error.message);

  return getUserById(userId);
}

module.exports = {
  getUserById,
  getAllUsers,
  promoteToTeacher,
  changeRole,
  softDeleteUser,
};