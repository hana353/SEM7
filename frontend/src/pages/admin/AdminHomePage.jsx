import { useState } from "react";
import { clearSession, getStoredUser } from "../../auth/session";
import { useNavigate } from "react-router-dom";

const mockSummary = {
  totalTeachers: 8,
  totalStudents: 126,
  totalCourses: 14,
  totalRevenue: "72.500.000đ",
};

const mockRecentUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "teacher.a@example.com",
    role: "Giáo viên",
    status: "Hoạt động",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "student.b@example.com",
    role: "Học sinh",
    status: "Hoạt động",
  },
  {
    id: 3,
    name: "Lê Minh C",
    email: "teacher.c@example.com",
    role: "Giáo viên",
    status: "Tạm khóa",
  },
];

const mockCourses = [
  {
    id: 1,
    title: "Speaking for Beginners",
    teacher: "Nguyễn Văn A",
    students: 34,
    price: "450.000đ",
    status: "Đang bán",
  },
  {
    id: 2,
    title: "IELTS Reading Intensive",
    teacher: "Trần Thị D",
    students: 18,
    price: "690.000đ",
    status: "Chờ duyệt",
  },
  {
    id: 3,
    title: "Business English Basics",
    teacher: "Phạm Quốc E",
    students: 21,
    price: "520.000đ",
    status: "Ẩn",
  },
];

const mockVocabularyTopics = [
  {
    id: 1,
    title: "Daily Activities - A1",
    level: "A1",
    wordsCount: 15,
    tags: ["daily routine", "basic"],
  },
  {
    id: 2,
    title: "Travel & Transport - A2",
    level: "A2",
    wordsCount: 20,
    tags: ["travel", "airport", "hotel"],
  },
  {
    id: 3,
    title: "Technology - B1",
    level: "B1",
    wordsCount: 18,
    tags: ["technology", "internet"],
  },
];

const mockPracticeStats = {
  todaySessions: 32,
  avgAccuracy: "87%",
  usedVoiceToTextPercent: "76%",
};

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "users", label: "Người dùng" },
  { id: "courses", label: "Khóa học" },
  { id: "vocab", label: "Bộ từ vựng (Free)" },
  { id: "reports", label: "Thống kê" },
  { id: "settings", label: "Cài đặt" },
];

function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Giáo viên</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockSummary.totalTeachers}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Đang hoạt động trên hệ thống
        </p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Học sinh</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockSummary.totalStudents}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Đã đăng ký tài khoản học
        </p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa học</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockSummary.totalCourses}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Đang được bán bởi giáo viên
        </p>
      </div>
      <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
        <p className="text-xs font-medium text-slate-300">Doanh thu (tháng)</p>
        <p className="mt-2 text-2xl font-semibold">
          {mockSummary.totalRevenue}
        </p>
        <p className="mt-1 text-xs text-slate-300">
          Tổng doanh thu qua nền tảng
        </p>
      </div>
    </div>
  );
}

function RecentUsersTable() {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          Người dùng mới gần đây
        </h3>
        <span className="text-xs text-slate-500 cursor-default">
          Data mẫu (static)
        </span>
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
            {mockRecentUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2 text-slate-900">{u.name}</td>
                <td className="px-4 py-2 text-slate-600">{u.email}</td>
                <td className="px-4 py-2 text-slate-600">{u.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      u.status === "Hoạt động"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CoursesTable() {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          Khóa học nổi bật
        </h3>
        <span className="text-xs text-slate-500 cursor-default">
          Data mẫu (static)
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-2">Khóa học</th>
              <th className="px-4 py-2">Giáo viên</th>
              <th className="px-4 py-2">Học viên</th>
              <th className="px-4 py-2">Giá</th>
              <th className="px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockCourses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2 text-slate-900">{c.title}</td>
                <td className="px-4 py-2 text-slate-600">{c.teacher}</td>
                <td className="px-4 py-2 text-slate-600">{c.students}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">
                  {c.price}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      c.status === "Đang bán"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : c.status === "Chờ duyệt"
                        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VocabularySection() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Bộ từ vựng theo chủ đề (FREE)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Dữ liệu mẫu – admin sẽ tạo/sửa/xóa các bộ từ vựng thật trong tương
            lai. Hiện tại đang hiển thị data cứng để demo UI.
          </p>
        </div>
        <button className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800">
          + Tạo bộ từ vựng mới
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Chủ đề</th>
                <th className="px-4 py-2">Level</th>
                <th className="px-4 py-2">Số từ</th>
                <th className="px-4 py-2">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockVocabularyTopics.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2 text-slate-900">{t.title}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                      {t.level}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{t.wordsCount}</td>
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {t.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-500">
            Phiên luyện từ vựng hôm nay
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {mockPracticeStats.todaySessions}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tổng tất cả học sinh trên hệ thống
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-500">
            Độ chính xác trung bình
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {mockPracticeStats.avgAccuracy}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Dựa trên số lần làm bài gần nhất
          </p>
        </div>
        <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
          <p className="text-xs font-medium text-slate-300">
            Tỉ lệ dùng voice-to-text
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {mockPracticeStats.usedVoiceToTextPercent}
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Trong các bài luyện từ vựng gần đây
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="space-y-6">
          <SummaryCards />
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentUsersTable />
            <CoursesTable />
          </div>
        </div>
      );
    }

    if (activeSection === "vocab") {
      return <VocabularySection />;
    }

    if (activeSection === "users") {
      return (
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6 text-sm text-slate-600">
          Đây là khu vực{" "}
          <span className="font-semibold text-slate-900">
            quản lý người dùng
          </span>
          . Hiện tại đang dùng dữ liệu cứng để demo giao diện; sau này bạn có
          thể thay bằng data thật từ API (danh sách giáo viên, học sinh, trạng
          thái tài khoản...).
        </div>
      );
    }

    if (activeSection === "courses") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Quản lý khóa học (demo)
            </h2>
            <button className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800">
              Duyệt khóa học chờ xét duyệt
            </button>
          </div>
          <CoursesTable />
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

