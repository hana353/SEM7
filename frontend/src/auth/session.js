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

