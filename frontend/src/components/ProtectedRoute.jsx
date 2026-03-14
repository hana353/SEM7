import { Navigate, Outlet } from "react-router-dom";
import { getRoleCode, isAuthenticated } from "../auth/session";
import { getHomeRouteByRole } from "../auth/roleRoutes";

export default function ProtectedRoute({ allowRoles = [] }) {
  const authed = isAuthenticated();
  const role = getRoleCode();

  if (!authed) return <Navigate to="/" replace />;

  if (allowRoles.length > 0 && (!role || !allowRoles.includes(role))) {
    return <Navigate to={getHomeRouteByRole(role)} replace />;
  }

  return <Outlet />;
}

