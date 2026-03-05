import { useState, useEffect } from "react";
import { clearSession, getStoredUser } from "../../auth/session";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "myCourses", label: "Khóa học của tôi" },
  { id: "lectures", label: "Bài giảng / Nội dung" },
  { id: "students", label: "Học viên của tôi" },
  { id: "revenue", label: "Doanh thu & rút tiền" },
  { id: "profile", label: "Hồ sơ giảng dạy" },
];

function SummaryCards({ totalCourses = 0, stats = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa học được gán</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {totalCourses}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Admin tạo và gán cho bạn.
        </p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Học viên đang học</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.activeStudents ?? 0}</p>
        <p className="mt-1 text-xs text-slate-500">Tổng số học viên trên tất cả khóa</p>
      </div>
      <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
        <p className="text-xs font-medium text-slate-300">Doanh thu</p>
        <p className="mt-2 text-2xl font-semibold">
          {Number(stats.totalRevenue ?? 0).toLocaleString("vi-VN")}đ
        </p>
        <p className="mt-1 text-xs text-slate-300">Từ bảng payments</p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa DRAFT</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.draftCourses ?? 0}</p>
        <p className="mt-1 text-xs text-slate-500">Khóa chờ admin duyệt</p>
      </div>
    </div>
  );
}

function CoursesSection({ courses = [], loading, onCourseClick }) {
  const statusLabel = (s) => ({ PUBLISHED: "Đang bán", DRAFT: "Chờ duyệt", ARCHIVED: "Ẩn" }[s] || s || "—");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Khóa học được gán (Admin tạo và gán cho bạn)
        </h2>
      </div>
      {loading ? (
        <div className="rounded-xl bg-white border p-6 text-center text-slate-500">Đang tải...</div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2">Tên khóa học</th>
                  <th className="px-4 py-2">Trạng thái</th>
                  <th className="px-4 py-2">Giá</th>
                  <th className="px-4 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Chưa có khóa học nào được gán</td></tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2 text-slate-900">{course.title}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            course.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                              : "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                          }`}
                        >
                          {statusLabel(course.status)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {Number(course.price || 0).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => onCourseClick(course.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Quản lý nội dung →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LecturesSection({ lectures = [], loading, onCourseClick }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Bài giảng / Nội dung khóa học</h2>
      <p className="text-xs text-slate-500">Vào từng khóa học để thêm/sửa bài giảng.</p>
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
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Đang tải...</td></tr>
              ) : lectures.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Chưa có bài giảng</td></tr>
              ) : (
                lectures.map((lec) => (
                  <tr key={lec.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-900">
                      {onCourseClick ? (
                        <button type="button" onClick={() => onCourseClick(lec.course_id)} className="text-blue-600 hover:underline">
                          {lec.course_title}
                        </button>
                      ) : lec.course_title}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{lec.title}</td>
                    <td className="px-4 py-2 text-slate-600">{lec.order_index}</td>
                    <td className="px-4 py-2 text-slate-600">{lec.duration_minutes ?? 0} phút</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StudentsSection({ students = [], loading }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Học viên của tôi</h2>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Họ tên</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Khóa học</th>
                <th className="px-4 py-2">Tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Đang tải...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-500">Chưa có học viên</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-900">{s.student_name || "—"}</td>
                    <td className="px-4 py-2 text-slate-600">{s.student_email}</td>
                    <td className="px-4 py-2 text-slate-600">{s.course_title}</td>
                    <td className="px-4 py-2">
                      <div className="w-32">
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${s.progress_percent ?? 0}%` }} />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{s.progress_percent ?? 0}% hoàn thành</p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RevenueSection({ stats = {} }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Doanh thu</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-500">Tổng doanh thu</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {Number(stats.totalRevenue ?? 0).toLocaleString("vi-VN")}đ
          </p>
          <p className="mt-1 text-xs text-slate-500">Từ bảng payments</p>
        </div>
        <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
          <p className="text-xs font-medium text-slate-300">Học viên đang học</p>
          <p className="mt-2 text-2xl font-semibold">{stats.activeStudents ?? 0}</p>
          <p className="mt-1 text-xs text-slate-300">Tổng trên tất cả khóa</p>
        </div>
      </div>
      <p className="text-xs text-slate-500">API lịch sử rút tiền đang phát triển.</p>
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
          <p className="text-sm font-medium text-slate-900">{user?.full_name || user?.fullName || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900">{user?.email || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export default function TeacherHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingLectures, setLoadingLectures] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    api.get("/courses/teacher/assigned")
      .then(res => setAssignedCourses(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAssignedCourses([]))
      .finally(() => setLoadingCourses(false));
    api.get("/lectures/teacher/all")
      .then(res => setLectures(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLectures([]))
      .finally(() => setLoadingLectures(false));
    api.get("/enrollments/teacher/students")
      .then(res => setStudents(res.data?.data || []))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
    api.get("/stats/teacher")
      .then(res => setStats(res.data || {}))
      .catch(() => setStats({}))
      .finally(() => setLoadingStats(false));
  }, []);

  const handleCourseClick = (courseId) => {
    navigate(`/teacher/course/${courseId}`);
  };

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="space-y-6">
          <SummaryCards totalCourses={assignedCourses.length} stats={stats} />
          <div className="grid gap-6 lg:grid-cols-2">
            <CoursesSection courses={assignedCourses} loading={loadingCourses} onCourseClick={handleCourseClick} />
            <StudentsSection students={students} loading={loadingStudents} />
          </div>
        </div>
      );
    }

    if (activeSection === "myCourses") {
      return <CoursesSection courses={assignedCourses} loading={loadingCourses} onCourseClick={handleCourseClick} />;
    }

    if (activeSection === "lectures") {
      return <LecturesSection lectures={lectures} loading={loadingLectures} onCourseClick={handleCourseClick} />;
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

