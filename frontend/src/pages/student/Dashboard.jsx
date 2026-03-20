import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [buyingCourseId, setBuyingCourseId] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/courses"),
      api.get("/courses/student/my"),
    ])
      .then(([allCoursesRes, enrolledRes]) => {
        setCourses(Array.isArray(allCoursesRes.data) ? allCoursesRes.data : []);
        setEnrolledCourses(Array.isArray(enrolledRes.data?.data) ? enrolledRes.data.data : []);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || "Không tải được khóa học");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCourses = courses.length;
  const freeCourses = useMemo(
    () => courses.filter(c => Number(c.price || 0) === 0),
    [courses]
  );
  const paidCourses = useMemo(
    () => courses.filter(c => Number(c.price || 0) > 0),
    [courses]
  );
  const completedCourses = useMemo(
    () => enrolledCourses.filter(c => Number(c.progress_percent || 0) === 100),
    [enrolledCourses]
  );
  const inProgressCourses = useMemo(
    () => enrolledCourses.filter(c => Number(c.progress_percent || 0) > 0 && Number(c.progress_percent || 0) < 100),
    [enrolledCourses]
  );
  const highlightCourses = courses.slice(0, 6);

  const progressData = useMemo(() => {
    const completed = completedCourses.length;
    const inProgress = inProgressCourses.length;
    const notStarted = enrolledCourses.length - completed - inProgress;
    
    return [
      { name: "Hoàn thành", value: completed, color: "#10b981" },
      { name: "Đang học", value: inProgress, color: "#3b82f6" },
      { name: "Chưa bắt đầu", value: notStarted, color: "#f3f4f6" }
    ].filter(item => item.value > 0);
  }, [completedCourses, inProgressCourses, enrolledCourses]);

  const handleBuyCourse = async (course) => {
    const courseId = course?.id;
    if (!courseId || buyingCourseId) return;

    setPurchaseError("");
    setPurchaseMessage("");
    setBuyingCourseId(courseId);

    try {
      const res = await api.post("/payments/create", {
        course_id: courseId,
      });

      const paymentUrl = res.data?.data?.payment_url;
      const enrolled = res.data?.data?.enrolled;

      if (enrolled) {
        setPurchaseMessage(res.data?.message || "Đăng ký khóa học thành công.");
        navigate(`/student/course/${courseId}`);
        return;
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      setPurchaseError(
        res.data?.message || "Không tạo được link thanh toán. Vui lòng thử lại."
      );
    } catch (err) {
      setPurchaseError(
        err?.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại."
      );
    } finally {
      setBuyingCourseId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl bg-linear-to-br from-cyan-50 to-sky-100 shadow-sm border border-cyan-200 p-4">
          <p className="text-xs font-medium text-cyan-800/80">
            Tổng số khóa học
          </p>
          <p className="mt-2 text-2xl font-semibold text-cyan-900">
            {loading ? "…" : totalCourses}
          </p>
          <p className="mt-1 text-xs text-cyan-900/70">
            Bao gồm tất cả khóa miễn phí và trả phí.
          </p>
        </div>
        <div className="rounded-xl bg-linear-to-br from-emerald-50 to-green-100 shadow-sm border border-emerald-200 p-4">
          <p className="text-xs font-medium text-emerald-900/80">
            Khóa học miễn phí
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {loading ? "…" : freeCourses.length}
          </p>
          <p className="mt-1 text-xs text-emerald-900/70">
            Có thể bắt đầu học ngay không cần thanh toán.
          </p>
        </div>
        <div className="rounded-xl bg-linear-to-br from-violet-50 to-indigo-100 shadow-sm border border-indigo-200 p-4">
          <p className="text-xs font-medium text-indigo-900/80">
            Khóa học trả phí
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-700">
            {loading ? "…" : paidCourses.length}
          </p>
          <p className="mt-1 text-xs text-indigo-900/70">
            Nâng cao kỹ năng và nội dung chuyên sâu hơn.
          </p>
        </div>
        <div className="rounded-xl bg-linear-to-br from-blue-50 to-cyan-100 shadow-sm border border-blue-200 p-4">
          <p className="text-xs font-medium text-blue-900/80">
            Khóa học đã hoàn thành
          </p>
          <p className="mt-2 text-2xl font-semibold text-blue-700">
            {loading ? "…" : completedCourses.length}
          </p>
          <p className="mt-1 text-xs text-blue-900/70">
            Bạn đã hoàn thành học tập khoá này
          </p>
        </div>
      </div>

      <section className="rounded-xl bg-white/90 shadow-sm border border-sky-100 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Thống kê tiến độ học tập
          </h2>
          <span className="text-sm text-slate-500">
            {loading ? "…" : `Tổng ${enrolledCourses.length} khóa`}
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-80 text-slate-500">
            Đang tải dữ liệu…
          </div>
        ) : enrolledCourses.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-slate-500">
            Bạn chưa đăng ký khóa học nào
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} khóa`, "Số khóa"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.5rem"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => {
                      const item = progressData.find(d => d.name === value);
                      return value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 flex flex-col justify-center">
              <div className="rounded-lg bg-linear-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Hoàn thành</p>
                    <p className="text-xs text-emerald-700 mt-1">Khóa học đã hoàn tất</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">
                    {completedCourses.length}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Đang học</p>
                    <p className="text-xs text-blue-700 mt-1">Khóa học đang thực hiện</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {inProgressCourses.length}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Chưa bắt đầu</p>
                    <p className="text-xs text-slate-700 mt-1">Khóa học chưa được bắt đầu</p>
                  </div>
                  <p className="text-3xl font-bold text-slate-600">
                    {enrolledCourses.length - completedCourses.length - inProgressCourses.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-linear-to-br from-amber-50/80 to-orange-50/70 shadow-sm border border-amber-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Khóa học nổi bật
            </h2>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Đang tải danh sách khóa học…</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : highlightCourses.length === 0 ? (
            <p className="text-sm text-slate-500">
              Chưa có khóa học nào được tạo trên hệ thống.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {highlightCourses.slice(0, 4).map(c => (
                <li
                  key={c.id}
                  className="py-2 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.teacher_name || "Giáo viên đang cập nhật"}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {Number(c.price || 0).toLocaleString("vi-VN")} VND
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-linear-to-br from-cyan-50/80 to-sky-50/70 shadow-sm border border-cyan-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Gợi ý khóa học cho bạn
            </h2>
            <p className="text-[11px] text-slate-500">
              Dựa trên các khóa đang có trong hệ thống
            </p>
          </div>
          {purchaseMessage && (
            <p className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {purchaseMessage}
            </p>
          )}
          {purchaseError && (
            <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {purchaseError}
            </p>
          )}
          {loading ? (
            <p className="text-sm text-slate-500">Đang tải gợi ý…</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : highlightCourses.length === 0 ? (
            <p className="text-sm text-slate-500">Hiện chưa có gợi ý nào.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {highlightCourses.map(c => (
                <div
                  key={c.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
                >
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                    {c.title}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                    {Number(c.price || 0) === 0
                      ? "Miễn phí"
                      : `${Number(c.price || 0).toLocaleString("vi-VN")} VND`}
                  </p>
                  {c.teacher_name && (
                    <p className="mt-1 text-xs text-slate-500">
                      GV: {c.teacher_name}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleBuyCourse(c)}
                    disabled={Boolean(buyingCourseId)}
                    className="mt-3 inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {buyingCourseId === c.id ? "Đang xử lý..." : "Mua ngay"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;