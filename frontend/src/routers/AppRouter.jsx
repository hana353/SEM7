import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Courses from "../pages/Courses";
import AdminHomePage from "../pages/admin/AdminHomePage";
import TeacherHomePage from "../pages/teacher/TeacherHomePage";
import StudentHomePage from "../pages/student/StudentHomePage";
import ProtectedRoute from "../components/ProtectedRoute";
import { getRoleCode } from "../auth/session";
import { getHomeRouteByRole, ROLE } from "../auth/roleRoutes";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/app"
          element={<Navigate to={getHomeRouteByRole(getRoleCode())} replace />}
        />
        <Route path="/courses" element={<Courses />} />

        <Route element={<ProtectedRoute allowRoles={[ROLE.STUDENT]} />}>
          <Route path="/studenthomepage" element={<StudentHomePage />} />
        </Route>

        <Route element={<ProtectedRoute allowRoles={[ROLE.ADMIN]} />}>
          <Route path="/admin" element={<AdminHomePage />} />
        </Route>

        <Route element={<ProtectedRoute allowRoles={[ROLE.TEACHER]} />}>
          <Route path="/teacher" element={<TeacherHomePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

