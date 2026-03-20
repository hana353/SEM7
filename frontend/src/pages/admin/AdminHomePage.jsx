import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearSession, getStoredUser } from "../../auth/session";
import api from "../../api/axios";
import SummaryCards from "./SummaryCards";
import RecentUsersTable from "./RecentUsersTable";
import CoursesTable from "./CoursesTable";
import CreateCourseForm from "./CreateCourseForm";
import VocabularySection from "./VocabularySection";
import RevenuePage from "./RevenuePage";
import LectureApprovalSection from "./LectureApprovalSection";

const MONTH_NAMES = [
  "T1", "T2", "T3", "T4", "T5", "T6",
  "T7", "T8", "T9", "T10", "T11", "T12",
];

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "users", label: "Người dùng" },
  { id: "courses", label: "Khóa học" },
  { id: "lectureApproval", label: "Duyệt bài giảng" },
  { id: "vocab", label: "Bộ từ vựng (Free)" },
  { id: "reports", label: "Doanh thu" },
  // { id: "settings", label: "Cài đặt" },
];
export default function AdminHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [vocabTopics, setVocabTopics] = useState([]);
  const [stats, setStats] = useState({});
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingVocab, setLoadingVocab] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data?.data || [])).catch(() => setUsers([])).finally(() => setLoadingUsers(false));
    api.get("/courses").then(res => setCourses(Array.isArray(res.data) ? res.data : [])).catch(() => setCourses([])).finally(() => setLoadingCourses(false));
    api.get("/vocabulary/topics").then(res => setVocabTopics(res.data?.data || [])).catch(() => setVocabTopics([])).finally(() => setLoadingVocab(false));
    api.get("/stats/admin").then(res => setStats(res.data || {})).catch(() => setStats({})).finally(() => setLoadingStats(false));
    api.get("/stats/admin/revenue").then(res => setRevenueByMonth(Array.isArray(res.data?.byMonth) ? res.data.byMonth : [])).catch(() => setRevenueByMonth([]));
  }, []);

  const renderContent = () => {
    if (activeSection === "dashboard") {
      const monthlyRevenue = revenueByMonth
        .slice()
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        })
        .slice(-6);
      const maxRevenue = Math.max(...monthlyRevenue.map((item) => Number(item.revenue || 0)), 0);
      const chartWidth = 760;
      const chartHeight = 240;
      const chartPaddingX = 32;
      const chartPaddingY = 20;
      const usableWidth = chartWidth - chartPaddingX * 2;
      const usableHeight = chartHeight - chartPaddingY * 2;
      const stepX = monthlyRevenue.length > 1 ? usableWidth / (monthlyRevenue.length - 1) : 0;
      const chartPoints = monthlyRevenue.map((item, index) => {
        const revenue = Number(item.revenue || 0);
        const x = chartPaddingX + (monthlyRevenue.length > 1 ? index * stepX : usableWidth / 2);
        const y = chartPaddingY + (maxRevenue > 0 ? usableHeight - (revenue / maxRevenue) * usableHeight : usableHeight);
        return {
          x,
          y,
          revenue,
          label: `${MONTH_NAMES[(item.month || 1) - 1]}/${item.year}`,
        };
      });
      const linePath = chartPoints
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ");
      const areaPath = chartPoints.length
        ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${chartHeight - chartPaddingY} L ${chartPoints[0].x} ${chartHeight - chartPaddingY} Z`
        : "";

      return (
        <div className="space-y-6">
          <SummaryCards users={users} courses={courses} stats={stats} />
          <section className="rounded-xl bg-linear-to-br from-rose-50 via-white to-sky-50 shadow-sm border border-rose-100 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Biểu đồ đường doanh thu 6 tháng gần nhất</h2>

            {monthlyRevenue.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có dữ liệu doanh thu theo tháng.</p>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <div className="min-w-160">
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-60">
                      <defs>
                        <linearGradient id="revenueLine" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                        <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.28" />
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.04" />
                        </linearGradient>
                      </defs>

                      {[0, 1, 2, 3].map((line) => {
                        const y = chartPaddingY + (usableHeight / 3) * line;
                        return (
                          <line
                            key={line}
                            x1={chartPaddingX}
                            y1={y}
                            x2={chartWidth - chartPaddingX}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray="4 5"
                          />
                        );
                      })}

                      <path d={areaPath} fill="url(#revenueArea)" />
                      <path d={linePath} fill="none" stroke="url(#revenueLine)" strokeWidth="3.5" strokeLinecap="round" />

                      {chartPoints.map((point) => (
                        <g key={point.label}>
                          <circle cx={point.x} cy={point.y} r="5.5" fill="white" stroke="#f43f5e" strokeWidth="2.5" />
                          <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-slate-600 text-[10px]">
                            {point.revenue.toLocaleString("vi-VN")}đ
                          </text>
                          <text x={point.x} y={chartHeight - 6} textAnchor="middle" className="fill-slate-600 text-[10px]">
                            {point.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Đường biểu diễn tổng doanh thu giao dịch thành công theo từng tháng.</p>
              </div>
            )}
          </section>
          <section className="rounded-xl bg-linear-to-br from-emerald-50 to-white shadow-sm border border-emerald-100 p-4">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Phiên luyện từ vựng hôm nay</h2>
            {loadingStats ? (
              <p className="text-sm text-slate-500">Đang tải...</p>
            ) : (
              <p className="text-2xl font-semibold text-slate-900">{stats.todayPracticeSessions ?? 0}</p>
            )}
            <p className="text-xs text-slate-500 mt-1">Tổng trên toàn hệ thống</p>
          </section>
        </div>
      );
    }

    if (activeSection === "vocab") {
      return (
        <VocabularySection
          topics={vocabTopics}
          loading={loadingVocab}
          onRefresh={() => api.get("/vocabulary/topics").then(r => setVocabTopics(r.data?.data || []))}
          practiceSessions={stats.todayPracticeSessions ?? 0}
        />
      );
    }

    if (activeSection === "users") {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Quản lý người dùng</h2>
          {loadingUsers ? (
            <div className="rounded-xl bg-white border p-6 text-center text-slate-500">Đang tải...</div>
          ) : (
            <RecentUsersTable
              users={users}
              onRoleChanged={() => api.get("/users").then(r => setUsers(r.data?.data || []))}
            />
          )}
        </div>
      );
    }

    if (activeSection === "courses") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Quản lý khóa học</h2>
            <button
              type="button"
              onClick={() => setShowCreateCourseModal(true)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              + Tạo khóa học
            </button>
          </div>
          {loadingCourses ? <div className="rounded-xl bg-white border p-6 text-center text-slate-500">Đang tải...</div> : <CoursesTable courses={courses} onUpdated={() => api.get("/courses").then(r => setCourses(Array.isArray(r.data) ? r.data : []))} />}

          {showCreateCourseModal && (
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
              <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <h3 className="text-base font-semibold text-slate-900">Tạo khóa học mới</h3>
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
                      api.get("/courses").then(r => setCourses(Array.isArray(r.data) ? r.data : []));
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
              Bảng điều khiển quản trị
            </h1>
            <p className="text-xs text-slate-500">
              Quản lý giáo viên, học sinh, khóa học và bộ từ vựng miễn phí.
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

