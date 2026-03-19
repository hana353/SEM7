export function getToken() {
  return localStorage.getItem("token") || "";
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded));
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

export function isTokenValid(token = getToken()) {
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  if (payload.exp && Number.isFinite(payload.exp)) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowInSeconds) return false;
  }

  return true;
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
  return isTokenValid();
}

export function hasValidSession() {
  return isTokenValid() && Boolean(getStoredUser());
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



