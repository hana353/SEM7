import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getRoleCode, isAuthenticated } from "../auth/session";
import { ROLE } from "../auth/roleRoutes";

function Courses({ onOpenAuthModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [buyingCourseId, setBuyingCourseId] = useState("");

  const focusCourseId = new URLSearchParams(location.search).get("focusCourse") || "";

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || "Không tải được danh sách khóa học");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!focusCourseId || courses.length === 0) return;
    const timer = setTimeout(() => {
      document
        .getElementById(`course-${focusCourseId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);

    return () => clearTimeout(timer);
  }, [focusCourseId, courses]);

  const handleBuyCourse = async (course) => {
    const courseId = course?.id;
    if (!courseId || buyingCourseId) return;

    setPurchaseError("");
    setPurchaseMessage("");

    if (!isAuthenticated()) {
      onOpenAuthModal?.("login", {
        pendingPurchase: {
          courseId,
          source: "courses",
        },
      });
      return;
    }

    const roleCode = getRoleCode();
    if (roleCode !== ROLE.STUDENT) {
      setPurchaseError("Chỉ tài khoản học viên mới có thể mua khóa học.");
      return;
    }

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

  if (loading) return <div className="p-6 text-center py-10">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="relative overflow-hidden p-6">
      <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 rounded-full bg-cyan-100/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-56 w-56 rounded-full bg-amber-100/70 blur-3xl" />

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow"
        aria-label="Quay về trang chủ"
      >
        <span aria-hidden="true" className="text-base leading-none">←</span>
        <span>Trang chủ</span>
      </button>

      <h2 className="mb-4 bg-linear-to-r from-indigo-700 via-sky-600 to-cyan-500 bg-clip-text text-3xl font-extrabold text-transparent">
        Danh sách khóa học
      </h2>
      {focusCourseId && (
        <p className="mb-4 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
          Bạn đã chọn một khóa học từ trang chủ. Vui lòng bấm <strong>Mua ngay</strong> tại đúng khóa học để thanh toán.
        </p>
      )}
      {purchaseMessage && (
        <p className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {purchaseMessage}
        </p>
      )}
      {purchaseError && (
        <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {purchaseError}
        </p>
      )}
      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {courses.length === 0 ? (
          <p className="text-gray-500">Chưa có khóa học nào.</p>
        ) : (
          courses.map(course => (
            <div
              id={`course-${course.id}`}
              key={course.id}
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                focusCourseId === String(course.id)
                  ? "border-indigo-400 bg-linear-to-br from-indigo-50 via-white to-sky-50 ring-2 ring-indigo-100"
                  : "border-slate-200 bg-linear-to-br from-white via-white to-slate-50"
              }`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-indigo-500 via-sky-500 to-cyan-400 opacity-80" />

              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-xl font-semibold text-slate-900 transition-colors group-hover:text-indigo-700">
                  {course.title}
                </h3>
                <span className="whitespace-nowrap rounded-full bg-linear-to-r from-indigo-100 to-sky-100 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                  {Number(course.price || 0) === 0
                    ? "Miễn phí"
                    : `${Number(course.price || 0).toLocaleString("vi-VN")} VND`}
                </span>
              </div>

              {course.description && (
                <p className="mb-3 line-clamp-3 text-sm leading-6 text-slate-600">{course.description}</p>
              )}

              {course.teacher_name && (
                <p className="text-sm text-slate-500">Giáo viên: {course.teacher_name}</p>
              )}

              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={() => handleBuyCourse(course)}
                  disabled={Boolean(buyingCourseId)}
                  className="w-full rounded-lg bg-linear-to-r from-indigo-600 via-sky-600 to-cyan-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition duration-300 hover:scale-[1.02] hover:from-indigo-700 hover:via-sky-700 hover:to-cyan-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {buyingCourseId === course.id
                    ? "Đang xử lý..."
                    : Number(course.price || 0) === 0
                    ? "Đăng ký miễn phí"
                    : "Mua ngay"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Courses;