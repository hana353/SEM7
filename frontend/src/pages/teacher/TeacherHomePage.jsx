import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../../auth/session";
import api from "../../api/axios";
import SummaryCards from "./SummaryCards";
import CoursesSection from "./CoursesSection";
import StudentsSection from "./StudentsSection";
import RevenueSection from "./RevenueSection";
import ProfileSection from "./ProfileSection";
import NotificationsSection from "./NotificationsSection";
import TeacherDashboardInsights from "./TeacherDashboardInsights";

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "myCourses", label: "Khóa học của tôi" },
  { id: "notifications", label: "Thông báo" },
  { id: "students", label: "Học viên của tôi" },
  { id: "revenue", label: "Doanh thu & rút tiền" },
  { id: "profile", label: "Hồ sơ giảng dạy" },
];
export default function TeacherHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get("/courses/teacher/assigned")
      .then(res => setAssignedCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAssignedCourses([]))
      .finally(() => setLoadingCourses(false));
    api.get("/enrollments/teacher/students")
      .then(res => setStudents(res.data?.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
    api.get("/stats/teacher")
      .then(res => setStats(res.data || {}))
      .catch(() => setStats({}))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (section && sidebarItems.some((x) => x.id === section)) {
      setActiveSection(section);
    }
  }, []);

  const handleCourseClick = (courseId) => {
    setSelectedCourseId(courseId);
    setActiveSection("courseDetail");
  };

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="space-y-6">
          {loadingStats ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Đang tải số liệu tổng quan...
            </div>
          ) : (
            <SummaryCards totalCourses={assignedCourses.length} stats={stats} />
          )}

          {loadingStats ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Đang tải biểu đồ dashboard...
            </div>
          ) : (
            <TeacherDashboardInsights stats={stats} />
          )}

          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7">
              <CoursesSection courses={assignedCourses} loading={loadingCourses} onCourseClick={handleCourseClick} />
            </div>
            <div className="xl:col-span-5">
              <StudentsSection students={students} loading={loadingStudents} />
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "myCourses") {
      return <CoursesSection courses={assignedCourses} loading={loadingCourses} onCourseClick={handleCourseClick} />;
    }

    if (activeSection === "courseDetail" && selectedCourseId) {
      const TeacherCourseDetail = require("./TeacherCourseDetail").default;
      return (
        <TeacherCourseDetail
          embedded
          courseId={selectedCourseId}
          onBack={() => {
            setActiveSection("myCourses");
            setSelectedCourseId(null);
          }}
        />
      );
    }

    if (activeSection === "notifications") {
      return <NotificationsSection />;
    }

    if (activeSection === "students") {
      return <StudentsSection students={students} loading={loadingStudents} />;
    }

    if (activeSection === "revenue") {
      return <RevenueSection stats={stats} />;
    }

    if (activeSection === "profile") {
      return <ProfileSection user={user} />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-sky-100 via-blue-50 to-cyan-100 flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-10 bg-slate-900/40 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 bg-linear-to-b from-slate-900 via-slate-900 to-slate-800 text-slate-50 flex flex-col z-20 shadow-2xl shadow-slate-900/20 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="shrink-0 px-5 py-4 border-b border-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Teacher
          </p>
          <p className="mt-1 text-sm font-semibold truncate">
            Teaching Management
          </p>
        </div>
        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-1 text-sm">
          {sidebarItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-200 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="shrink-0 px-4 py-3 border-t border-slate-800 text-xs text-slate-300">
          <p className="truncate">
            {user?.full_name || user?.email || "Teacher"}
          </p>
          <button
            className="mt-2 inline-flex items-center rounded-lg bg-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-50 hover:bg-slate-600"
            onClick={() => {
              clearSession();
              navigate("/", { replace: true });
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col md:ml-64 min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur flex items-center justify-between px-4 sm:px-6">
          <div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="mb-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 md:hidden"
              aria-label="Mở menu"
            >
              ≡
            </button>
            <h1 className="text-base font-bold text-slate-900">
              Bảng điều khiển giảng dạy
            </h1>
            <p className="text-xs text-slate-500">
              Quản lý khóa học, bài giảng, học viên và doanh thu của bạn.
            </p>
          </div>
          <div className="hidden sm:flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
            Cập nhật: {new Date().toLocaleDateString("vi-VN")}
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-6 py-5 space-y-6 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

