export function getToken() {
  return localStorage.getItem("token") || "";
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRoleCode() {
  const u = getStoredUser();
  return u?.role_code || null;
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Thêm hàm này để lấy userId từ user object
export function getUserId() {
  const user = getStoredUser();
  return user?._id || user?.id || null;
}

// Hàm getSession để backward compatibility
export const getSession = () => {
  const user = getStoredUser();
  if (!user) return null;
  return {
    userId: user._id || user.id,
    user: user
  };
};

export const setSession = (data) => {
  localStorage.setItem("session", JSON.stringify(data));
};



