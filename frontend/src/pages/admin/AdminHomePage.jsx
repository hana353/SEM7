import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../../auth/session";
import api from "../../api/axios";
import RecentUsersTable from "./RecentUsersTable";
import CoursesTable from "./CoursesTable";
import CreateCourseForm from "./CreateCourseForm";
import VocabularySection from "./VocabularySection";
import RevenuePage from "./RevenuePage";
import LectureApprovalSection from "./LectureApprovalSection";

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "users", label: "Người dùng" },
  { id: "courses", label: "Khóa học" },
  { id: "lectureApproval", label: "Duyệt bài giảng" },
  { id: "vocab", label: "Bộ từ vựng (Free)" },
  { id: "reports", label: "Doanh thu" },
  // { id: "settings", label: "Cài đặt" },
];

const ADMIN_POWERBI_IFRAME_URL =
  "https://app.powerbi.com/reportEmbed?reportId=3ed33e9b-f4b9-4634-a28a-bc5a59432a74&groupId=2055173e-fdb5-48bb-be7c-8816be59edab&autoAuth=true&ctid=447080b4-b9c6-4b0b-92fd-b543a68b4e97";

const ADMIN_POWERBI_OPEN_URL =
  "https://app.powerbi.com/groups/2055173e-fdb5-48bb-be7c-8816be59edab/reports/3ed33e9b-f4b9-4634-a28a-bc5a59432a74/36d50ecae822c0d9907e?experience=power-bi";

export default function AdminHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [vocabTopics, setVocabTopics] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingVocab, setLoadingVocab] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUsers(res.data?.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));

    api
      .get("/courses")
      .then((res) => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));

    api
      .get("/vocabulary/topics")
      .then((res) => setVocabTopics(res.data?.data || []))
      .catch(() => setVocabTopics([]))
      .finally(() => setLoadingVocab(false));

    api
      .get("/stats/admin")
      .then((res) => setStats(res.data || {}))
      .catch(() => setStats({}))
      .finally(() => setLoadingStats(false));
  }, []);

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <section className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Dashboard Power BI
              </h2>
              <p className="text-sm text-slate-500">
                Báo cáo quản trị được nhúng trực tiếp từ Power BI.
              </p>
            </div>

            <a
              href={ADMIN_POWERBI_OPEN_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Mở Power BI
            </a>
          </div>

          <div className="p-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <iframe
                title="Admin Power BI Dashboard"
                src={ADMIN_POWERBI_IFRAME_URL}
                className="w-full"
                style={{ height: "78vh", minHeight: "720px", border: "none" }}
                allowFullScreen
              />
            </div>
          </div>
        </section>
      );
    }

    if (activeSection === "vocab") {
      return (
        <VocabularySection
          topics={vocabTopics}
          loading={loadingVocab}
          onRefresh={() =>
            api
              .get("/vocabulary/topics")
              .then((r) => setVocabTopics(r.data?.data || []))
          }
          practiceSessions={stats.todayPracticeSessions ?? 0}
        />
      );
    }

    if (activeSection === "users") {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Quản lý người dùng
          </h2>
          {loadingUsers ? (
            <div className="rounded-xl bg-white border p-6 text-center text-slate-500">
              Đang tải...
            </div>
          ) : (
            <RecentUsersTable
              users={users}
              onRoleChanged={() =>
                api.get("/users").then((r) => setUsers(r.data?.data || []))
              }
            />
          )}
        </div>
      );
    }

    if (activeSection === "courses") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Quản lý khóa học
            </h2>
            <button
              type="button"
              onClick={() => setShowCreateCourseModal(true)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              + Tạo khóa học
            </button>
          </div>

          {loadingCourses ? (
            <div className="rounded-xl bg-white border p-6 text-center text-slate-500">
              Đang tải...
            </div>
          ) : (
            <CoursesTable
              courses={courses}
              onUpdated={() =>
                api
                  .get("/courses")
                  .then((r) =>
                    setCourses(Array.isArray(r.data) ? r.data : [])
                  )
              }
            />
          )}

          {showCreateCourseModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <h3 className="text-base font-semibold text-slate-900">
                    Tạo khóa học mới
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateCourseModal(false)}
                    className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  >
                    Đóng
                  </button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto p-5">
                  <CreateCourseForm
                    users={users}
                    onCreated={() => {
                      api
                        .get("/courses")
                        .then((r) =>
                          setCourses(Array.isArray(r.data) ? r.data : [])
                        );
                      setShowCreateCourseModal(false);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeSection === "lectureApproval") {
      return <LectureApprovalSection />;
    }

    if (activeSection === "reports") {
      return <RevenuePage />;
    }

    if (activeSection === "settings") {
      return (
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6 text-sm text-slate-600">
          Trang cài đặt hệ thống: cấu hình thanh toán, giới hạn upload video,
          cấu hình email, bật/tắt chức năng voice-to-text, v.v. Bạn có thể dùng
          form thật tại đây trong các bước tiếp theo.
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-50 flex flex-col z-10">
        <div className="shrink-0 px-5 py-4 border-b border-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Admin
          </p>
          <p className="mt-1 text-sm font-semibold truncate">
            English Center Dashboard
          </p>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-1 text-sm">
          {sidebarItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
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
            {user?.full_name || user?.email || "Admin"}
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

      <main className="flex-1 flex flex-col ml-64 min-w-0">
        <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between px-6">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Bảng điều khiển quản trị Power BI
            </h1>
            <p className="text-xs text-slate-500">
              Theo dõi báo cáo tổng quan trực tiếp từ Power BI.
            </p>
          </div>
        </header>

        <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}