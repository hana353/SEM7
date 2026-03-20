import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
import AuthModal from "../components/auth/AuthModal";
import { getRoleCode, isAuthenticated } from "../auth/session";
import { getHomeRouteByRole, ROLE } from "../auth/roleRoutes";

const PENDING_PURCHASE_KEY = "pendingCoursePurchase";

function savePendingPurchase(pendingPurchase) {
  if (!pendingPurchase?.courseId) return;
  localStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(pendingPurchase));
}

function readPendingPurchase() {
  try {
    const raw = localStorage.getItem(PENDING_PURCHASE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearPendingPurchase() {
  localStorage.removeItem(PENDING_PURCHASE_KEY);
}

function RouteAwareChatWidget({ onRequireAuth }) {
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

  return <ChatWidget onRequireAuth={onRequireAuth} />;
}

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const openAuthModal = (mode = "login", options = {}) => {
    if (options?.pendingPurchase) {
      savePendingPurchase(options.pendingPurchase);
    }
    setAuthMode(mode === "register" ? "register" : "login");
    setAuthOpen(true);
  };

  const handleLoginSuccess = (loginData) => {
    setAuthOpen(false);

    const roleCode = loginData?.user?.role_code || getRoleCode();
    const pendingPurchase = readPendingPurchase();

    if (pendingPurchase?.source === "chat" && roleCode === ROLE.STUDENT) {
      clearPendingPurchase();
      navigate("/", { replace: true });
      return true;
    }

    if (pendingPurchase?.courseId && roleCode === ROLE.STUDENT) {
      clearPendingPurchase();
      navigate(`/courses?focusCourse=${encodeURIComponent(pendingPurchase.courseId)}`, {
        replace: true,
      });
      return true;
    }

    if (roleCode === ROLE.STUDENT) {
      clearPendingPurchase();
      navigate("/", { replace: true });
      return true;
    }

    clearPendingPurchase();
    navigate(getHomeRouteByRole(roleCode), { replace: true });
    return true;
  };

  useEffect(() => {
    if (location.pathname === "/login") {
      openAuthModal("login");
      navigate("/", { replace: true });
      return;
    }

    if (location.pathname === "/register") {
      openAuthModal("register");
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home onOpenAuthModal={openAuthModal} />} />
        <Route
          path="/app"
          element={<Navigate to={getHomeRouteByRole(getRoleCode())} replace />}
        />
        <Route path="/login" element={null} />
        <Route path="/register" element={null} />
        <Route path="/courses" element={<Courses onOpenAuthModal={openAuthModal} />} />

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

      <RouteAwareChatWidget onRequireAuth={openAuthModal} />

      <AuthModal
        open={authOpen}
        mode={authMode}
        onClose={() => setAuthOpen(false)}
        onModeChange={setAuthMode}
        onLoginSuccess={handleLoginSuccess}
      />
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