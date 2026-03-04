import { useState } from "react";
import { clearSession, getStoredUser } from "../../auth/session";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "myCourses", label: "Khóa học của tôi" },
  { id: "lectures", label: "Bài giảng / Nội dung" },
  { id: "students", label: "Học viên của tôi" },
  { id: "revenue", label: "Doanh thu & rút tiền" },
  { id: "profile", label: "Hồ sơ giảng dạy" },
];

const mockSummary = {
  totalCourses: 5,
  activeStudents: 62,
  monthlyRevenue: "18.200.000đ",
  pendingApproval: 1,
};

const mockTeacherCourses = [
  {
    id: 1,
    title: "Speaking for Beginners",
    status: "Đang bán",
    students: 24,
    rating: 4.7,
    price: "450.000đ",
  },
  {
    id: 2,
    title: "IELTS Reading Intensive 5.0+",
    status: "Đang bán",
    students: 18,
    rating: 4.5,
    price: "690.000đ",
  },
  {
    id: 3,
    title: "Pronunciation Basics",
    status: "Đang bán",
    students: 12,
    rating: 4.8,
    price: "390.000đ",
  },
  {
    id: 4,
    title: "Business English Basics",
    status: "Chờ duyệt",
    students: 0,
    rating: null,
    price: "520.000đ",
  },
];

const mockLectures = [
  {
    id: 1,
    course: "Speaking for Beginners",
    title: "Unit 1 - Greetings & Introductions",
    duration: "18 phút",
    order: 1,
  },
  {
    id: 2,
    course: "Speaking for Beginners",
    title: "Unit 2 - Daily Activities",
    duration: "22 phút",
    order: 2,
  },
  {
    id: 3,
    course: "IELTS Reading Intensive 5.0+",
    title: "Lesson 1 - Question types overview",
    duration: "25 phút",
    order: 1,
  },
];

const mockStudents = [
  {
    id: 1,
    name: "Nguyễn Văn Học",
    course: "Speaking for Beginners",
    progress: 60,
  },
  {
    id: 2,
    name: "Trần Thị Luyện",
    course: "IELTS Reading Intensive 5.0+",
    progress: 30,
  },
  {
    id: 3,
    name: "Lê Minh Tiến",
    course: "Pronunciation Basics",
    progress: 80,
  },
];

const mockRevenue = {
  availableToWithdraw: "12.500.000đ",
  totalThisMonth: "18.200.000đ",
  lastPayout: "4.000.000đ (02/03/2026)",
};

const mockPayouts = [
  {
    id: 1,
    date: "15/02/2026",
    amount: "3.500.000đ",
    status: "Hoàn thành",
  },
  {
    id: 2,
    date: "01/02/2026",
    amount: "2.800.000đ",
    status: "Hoàn thành",
  },
];

function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa học đã tạo</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockSummary.totalCourses}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Bao gồm cả khóa đang duyệt.
        </p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Học viên đang học</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockSummary.activeStudents}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Tổng số học viên trên tất cả khóa.
        </p>
      </div>
      <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
        <p className="text-xs font-medium text-slate-300">
          Doanh thu tháng này (demo)
        </p>
        <p className="mt-2 text-2xl font-semibold">
          {mockSummary.monthlyRevenue}
        </p>
        <p className="mt-1 text-xs text-slate-300">
          Số liệu minh họa – sẽ lấy từ bảng `payments`.
        </p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">
          Khóa học chờ admin duyệt
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockSummary.pendingApproval}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Bạn có thể chỉnh sửa nội dung trước khi được duyệt.
        </p>
      </div>
    </div>
  );
}

function CoursesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Khóa học của tôi
        </h2>
        <button className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800">
          + Tạo khóa học mới
        </button>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Tên khóa học</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Học viên</th>
                <th className="px-4 py-2">Rating</th>
                <th className="px-4 py-2">Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTeacherCourses.map((course) => (
                <tr key={course.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2 text-slate-900">{course.title}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        course.status === "Đang bán"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {course.students}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {course.rating ? `${course.rating.toFixed(1)}★` : "-"}
                  </td>
                  <td className="px-4 py-2 text-slate-900 font-medium">
                    {course.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LecturesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Bài giảng / Nội dung khóa học
        </h2>
        <button className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800">
          + Thêm bài giảng mới
        </button>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Khóa học</th>
                <th className="px-4 py-2">Tiêu đề bài giảng</th>
                <th className="px-4 py-2">Thứ tự</th>
                <th className="px-4 py-2">Thời lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockLectures.map((lec) => (
                <tr key={lec.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2 text-slate-900">{lec.course}</td>
                  <td className="px-4 py-2 text-slate-600">{lec.title}</td>
                  <td className="px-4 py-2 text-slate-600">{lec.order}</td>
                  <td className="px-4 py-2 text-slate-600">{lec.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentsSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Học viên của tôi
        </h2>
        <span className="text-xs text-slate-500">
          Data mẫu – sau này sẽ lấy từ bảng `enrollments`.
        </span>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Họ tên</th>
                <th className="px-4 py-2">Khóa học</th>
                <th className="px-4 py-2">Tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockStudents.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2 text-slate-900">{s.name}</td>
                  <td className="px-4 py-2 text-slate-600">{s.course}</td>
                  <td className="px-4 py-2">
                    <div className="w-40">
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {s.progress}% hoàn thành
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevenueSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        Doanh thu &amp; rút tiền (demo)
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-500">
            Số dư khả dụng để rút
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {mockRevenue.availableToWithdraw}
          </p>
          <button className="mt-3 inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800">
            Yêu cầu rút tiền
          </button>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-500">
            Doanh thu tháng này
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {mockRevenue.totalThisMonth}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Số liệu demo, sẽ tính từ bảng payments.
          </p>
        </div>
        <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
          <p className="text-xs font-medium text-slate-300">Lần rút gần nhất</p>
          <p className="mt-2 text-sm font-semibold">
            {mockRevenue.lastPayout}
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Thông tin minh họa để hoàn thiện UI.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Lịch sử yêu cầu rút tiền
          </h3>
          <span className="text-xs text-slate-500">Data mẫu (static)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Ngày</th>
                <th className="px-4 py-2">Số tiền</th>
                <th className="px-4 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockPayouts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2 text-slate-900">{p.date}</td>
                  <td className="px-4 py-2 text-slate-600">{p.amount}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({ user }) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6 space-y-4 text-sm text-slate-700">
      <h2 className="text-lg font-semibold text-slate-900">Hồ sơ giảng dạy</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Họ tên</p>
          <p className="text-sm font-medium text-slate-900">
            {user?.full_name || "Teacher User"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900">
            {user?.email || "teacher@example.com"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Kinh nghiệm</p>
          <p className="text-sm font-medium text-slate-900">
            3+ năm dạy tiếng Anh giao tiếp (demo)
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Chứng chỉ</p>
          <p className="text-sm font-medium text-slate-900">
            IELTS 8.0, TESOL (demo)
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Đây là dữ liệu cứng minh họa. Khi kết nối backend, bạn có thể hiển thị
        hồ sơ thật từ bảng users/profiles.
      </p>
    </div>
  );
}

export default function TeacherHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="space-y-6">
          <SummaryCards />
          <div className="grid gap-6 lg:grid-cols-2">
            <CoursesSection />
            <StudentsSection />
          </div>
        </div>
      );
    }

    if (activeSection === "myCourses") {
      return <CoursesSection />;
    }

    if (activeSection === "lectures") {
      return <LecturesSection />;
    }

    if (activeSection === "students") {
      return <StudentsSection />;
    }

    if (activeSection === "revenue") {
      return <RevenueSection />;
    }

    if (activeSection === "profile") {
      return <ProfileSection user={user} />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-slate-50 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Teacher
          </p>
          <p className="mt-1 text-sm font-semibold">
            Teaching Management Workspace
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

      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between px-6">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Bảng điều khiển giảng dạy
            </h1>
            <p className="text-xs text-slate-500">
              Quản lý khóa học, bài giảng, học viên và doanh thu của bạn.
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

