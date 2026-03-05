import { useState, useEffect } from "react";
import { clearSession, getStoredUser } from "../../auth/session";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "users", label: "Người dùng" },
  { id: "courses", label: "Khóa học" },
  { id: "vocab", label: "Bộ từ vựng (Free)" },
  { id: "reports", label: "Thống kê" },
  { id: "settings", label: "Cài đặt" },
];

function SummaryCards({ users = [], courses = [], stats = {} }) {
  const totalTeachers = users.filter(u => u.role_code === "TEACHER").length;
  const totalStudents = users.filter(u => u.role_code === "STUDENT").length;
  const totalRevenue = stats.totalRevenue ?? 0;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Giáo viên</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{totalTeachers}</p>
        <p className="mt-1 text-xs text-slate-500">Đang hoạt động trên hệ thống</p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Học sinh</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{totalStudents}</p>
        <p className="mt-1 text-xs text-slate-500">Đã đăng ký tài khoản học</p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa học</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{courses.length}</p>
        <p className="mt-1 text-xs text-slate-500">Đang được bán bởi giáo viên</p>
      </div>
      <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
        <p className="text-xs font-medium text-slate-300">Doanh thu</p>
        <p className="mt-2 text-2xl font-semibold">
          {Number(totalRevenue).toLocaleString("vi-VN")}đ
        </p>
        <p className="mt-1 text-xs text-slate-300">Tổng doanh thu từ payments</p>
      </div>
    </div>
  );
}

function RecentUsersTable({ users = [] }) {
  const roleLabel = (code) => ({ ADMIN: "Admin", TEACHER: "Giáo viên", STUDENT: "Học sinh" }[code] || code);
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          Người dùng (API)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-2">Họ tên</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Vai trò</th>
              <th className="px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.slice(0, 10).map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2 text-slate-900">{u.full_name || "—"}</td>
                <td className="px-4 py-2 text-slate-600">{u.email}</td>
                <td className="px-4 py-2 text-slate-600">{roleLabel(u.role_code)}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      u.is_active && !u.is_deleted
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                    }`}
                  >
                    {u.is_active && !u.is_deleted ? "Hoạt động" : "Tạm khóa"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="px-4 py-6 text-slate-500 text-center">Chưa có người dùng</p>}
      </div>
    </div>
  );
}

function CreateCourseForm({ users = [], onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [teacherId, setTeacherId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const teachers = users.filter(u => u.role_code === "TEACHER");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tiêu đề là bắt buộc");
      return;
    }
    if (!teacherId) {
      setError("Vui lòng chọn giáo viên");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/courses", {
        title: title.trim(),
        description: description.trim() || null,
        price: Number(price) || 0,
        teacher_id: teacherId,
      });
      setTitle("");
      setDescription("");
      setPrice(0);
      setTeacherId("");
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo khóa học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white border p-6 space-y-4 mb-6">
      <h3 className="font-semibold text-slate-900">Tạo khóa học mới & gán giáo viên</h3>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="block text-xs text-slate-500 mb-1">Tiêu đề *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Tên khóa học"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Mô tả</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Giá (VND)</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          min={0}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Giáo viên *</label>
        <select
          value={teacherId}
          onChange={e => setTeacherId(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          required
        >
          <option value="">-- Chọn giáo viên --</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
          ))}
        </select>
        {teachers.length === 0 && <p className="text-amber-600 text-xs mt-1">Chưa có giáo viên. Cần promote user lên TEACHER trước.</p>}
      </div>
      <button
        type="submit"
        disabled={loading || teachers.length === 0}
        className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Đang tạo..." : "Tạo khóa học"}
      </button>
    </form>
  );
}

function CoursesTable({ courses = [] }) {
  const statusLabel = (s) => ({ PUBLISHED: "Đang bán", DRAFT: "Chờ duyệt", ARCHIVED: "Ẩn" }[s] || s || "—");
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          Khóa học (API)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-2">Khóa học</th>
              <th className="px-4 py-2">Giáo viên</th>
              <th className="px-4 py-2">Giá</th>
              <th className="px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.slice(0, 10).map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2 text-slate-900">{c.title}</td>
                <td className="px-4 py-2 text-slate-600">{c.teacher_name || "—"}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">
                  {Number(c.price || 0).toLocaleString("vi-VN")}đ
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      c.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : c.status === "DRAFT"
                        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {statusLabel(c.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && <p className="px-4 py-6 text-slate-500 text-center">Chưa có khóa học</p>}
      </div>
    </div>
  );
}

function VocabularySection({ topics = [], loading, onRefresh, practiceSessions = 0 }) {
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await api.post("/vocabulary/topics", { title: newTitle.trim() });
      setNewTitle("");
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Bộ từ vựng theo chủ đề (FREE)</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Tên chủ đề"
            className="px-3 py-1.5 border rounded text-sm"
          />
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50"
          >
            + Tạo
          </button>
        </form>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Chủ đề</th>
                <th className="px-4 py-2">Số từ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={2} className="px-4 py-6 text-center text-slate-500">Đang tải...</td></tr>
              ) : topics.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-6 text-center text-slate-500">Chưa có chủ đề</td></tr>
              ) : (
                topics.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-900">{t.title}</td>
                    <td className="px-4 py-2 text-slate-600">{t.words_count ?? 0}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Phiên luyện từ vựng hôm nay</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{practiceSessions ?? 0}</p>
        <p className="mt-1 text-xs text-slate-500">Tổng tất cả học sinh trên hệ thống</p>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [vocabTopics, setVocabTopics] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingVocab, setLoadingVocab] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api.get("/users").then(res => setUsers(res.data?.data || [])).catch(() => setUsers([])).finally(() => setLoadingUsers(false));
    api.get("/courses").then(res => setCourses(Array.isArray(res.data) ? res.data : [])).catch(() => setCourses([])).finally(() => setLoadingCourses(false));
    api.get("/vocabulary/topics").then(res => setVocabTopics(res.data?.data || [])).catch(() => setVocabTopics([])).finally(() => setLoadingVocab(false));
    api.get("/stats/admin").then(res => setStats(res.data || {})).catch(() => setStats({})).finally(() => setLoadingStats(false));
  }, []);

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="space-y-6">
          <SummaryCards users={users} courses={courses} stats={stats} />
          <div className="grid gap-6 lg:grid-cols-2">
            {loadingUsers ? <div className="rounded-xl bg-white border p-6 text-center text-slate-500">Đang tải người dùng...</div> : <RecentUsersTable users={users} />}
            {loadingCourses ? <div className="rounded-xl bg-white border p-6 text-center text-slate-500">Đang tải khóa học...</div> : <CoursesTable courses={courses} />}
          </div>
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
          {loadingUsers ? <div className="rounded-xl bg-white border p-6 text-center text-slate-500">Đang tải...</div> : <RecentUsersTable users={users} />}
        </div>
      );
    }

    if (activeSection === "courses") {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Quản lý khóa học</h2>
          <CreateCourseForm
            users={users}
            onCreated={() => api.get("/courses").then(r => setCourses(Array.isArray(r.data) ? r.data : []))}
          />
          {loadingCourses ? <div className="rounded-xl bg-white border p-6 text-center text-slate-500">Đang tải...</div> : <CoursesTable courses={courses} />}
        </div>
      );
    }

    if (activeSection === "reports") {
      return (
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6 text-sm text-slate-600">
          Khu vực thống kê &amp; báo cáo cho admin. Bạn có thể hiển thị biểu đồ
          doanh thu, số lượng học viên mới, số phiên luyện từ vựng, v.v. Dữ liệu
          hiện tại chỉ là mô tả để hoàn thiện layout.
        </div>
      );
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
      <aside className="w-64 bg-slate-900 text-slate-50 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Admin
          </p>
          <p className="mt-1 text-sm font-semibold">
            English Center Dashboard
          </p>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
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
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-300">
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

      <main className="flex-1 flex flex-col">
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

