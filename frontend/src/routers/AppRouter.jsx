import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "../pages/Home";
import Courses from "../pages/Courses";
import AdminHomePage from "../pages/admin/AdminHomePage";
import TeacherHomePage from "../pages/teacher/TeacherHomePage";
import TeacherCourseDetail from "../pages/teacher/TeacherCourseDetail";
import StudentHomePage from "../pages/student/StudentHomePage";
import StudentCourseDetail from "../pages/student/StudentCourseDetail";
import StudentFlashcardPage from "../pages/student/StudentFlashcardPage";
import StudentTestAttemptPage from "../pages/student/StudentTestAttemptPage";
import StudentTestReviewPage from "../pages/student/StudentTestReviewPage";
import PaymentResult from "../pages/student/PaymentResult";
import ProtectedRoute from "../components/ProtectedRoute";
import ChatWidget from "../components/chat/ChatWidget";
import { getRoleCode, isAuthenticated } from "../auth/session";
import { getHomeRouteByRole, ROLE } from "../auth/roleRoutes";

function RouteAwareChatWidget() {
  const location = useLocation();
  const roleCode = getRoleCode();
  const authed = isAuthenticated();

  const isHomeRoute = location.pathname === "/";
  const isStudentRoute =
    location.pathname === "/studenthomepage" ||
    location.pathname.startsWith("/student/");
  const isTeacherRoute = location.pathname.startsWith("/teacher");

  const shouldShow =
    isHomeRoute ||
    (authed && roleCode === ROLE.STUDENT && isStudentRoute) ||
    (authed && roleCode === ROLE.TEACHER && isTeacherRoute);

  if (!shouldShow) return null;

  return <ChatWidget />;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/app"
          element={<Navigate to={getHomeRouteByRole(getRoleCode())} replace />}
        />
        <Route path="/courses" element={<Courses />} />

        <Route element={<ProtectedRoute allowRoles={[ROLE.STUDENT]} />}>
          <Route path="/studenthomepage" element={<StudentHomePage />} />
          <Route path="/student/course/:courseId" element={<StudentCourseDetail />} />
          <Route path="/student/flashcards/:setId" element={<StudentFlashcardPage />} />
          <Route path="/student/attempt/:attemptId" element={<StudentTestAttemptPage />} />
          <Route path="/student/attempt/:attemptId/review" element={<StudentTestReviewPage />} />
          <Route path="/student/payment-result" element={<PaymentResult />} />
        </Route>

        <Route element={<ProtectedRoute allowRoles={[ROLE.ADMIN]} />}>
          <Route path="/admin" element={<AdminHomePage />} />
        </Route>

        <Route element={<ProtectedRoute allowRoles={[ROLE.TEACHER]} />}>
          <Route path="/teacher" element={<TeacherHomePage />} />
          <Route path="/teacher/course/:courseId" element={<TeacherCourseDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <RouteAwareChatWidget />
    </>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}