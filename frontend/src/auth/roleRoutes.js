export const ROLE = Object.freeze({
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  GUEST: "GUEST",
});

export function getHomeRouteByRole(roleCode) {
  switch (roleCode) {
    case ROLE.ADMIN:
      return "/admin";
    case ROLE.TEACHER:
      return "/teacher";
    case ROLE.STUDENT:
      return "/studenthomepage";
    case ROLE.GUEST:
    default:
      return "/";
  }
}

