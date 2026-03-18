import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const tabs = [
  { id: "lectures", label: "Bài giảng" },
  { id: "flashcards", label: "Flashcard" },
  { id: "tests", label: "Bài test" },
];

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
  const [lectures, setLectures] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [purchaseError, setPurchaseError] = useState("");
  const [purchaseMessage, setPurchaseMessage] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [testHistoryFor, setTestHistoryFor] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const refreshTab = () => {
    if (!courseId) return;
    if (activeTab === "lectures") {
      api
        .get(`/lectures/student/course/${courseId}`)
        .then(res => setLectures(res.data?.data || []))
        .catch(err => {
          console.error(err);
          setLectures([]);
        });
    } else if (activeTab === "flashcards") {
      api
        .get(`/flashcards?course_id=${courseId}`)
        .then(res => setFlashcards(res.data?.data || []))
        .catch(() => setFlashcards([]));
    } else if (activeTab === "tests") {
      api
        .get(`/tests?course_id=${courseId}`)
        .then(res => setTests(res.data?.data || []))
        .catch(() => setTests([]));
    }
  };

  const openTestHistory = async (testId) => {
    setTestHistoryFor(testId);
    setLoadingHistory(true);
    setTestHistory([]);
    try {
      const res = await api.get(`/tests/${testId}/attempts/me`);
      setTestHistory(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setTestHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const checkEnrollment = async () => {
    if (!courseId) return;
    setCheckingEnrollment(true);
    try {
      const res = await api.get("/courses/student/my");
      const owned = Array.isArray(res.data?.data)
        ? res.data.data.some((c) => c.id === courseId)
        : false;
      setIsEnrolled(owned);
    } catch (err) {
      console.error("Không thể kiểm tra trạng thái đăng ký:", err);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const handlePurchase = async () => {
    if (!course) return;
    setPurchaseError("");
    setPurchaseMessage("");
    setIsPurchasing(true);

    try {
      const res = await api.post("/payments/create", {
        course_id: courseId,
      });

      const paymentUrl = res.data?.data?.payment_url;
      const enrolled = res.data?.data?.enrolled;
      if (enrolled) {
        setIsEnrolled(true);
        setPurchaseMessage(res.data?.message || "Đăng ký khóa học thành công.");
        // Refresh enrollment status
        checkEnrollment();
      } else if (paymentUrl) {
        // Redirect user to VNPay payment page
        window.location.href = paymentUrl;
      } else {
        setPurchaseError(
          res.data?.message || "Không thể tạo link thanh toán. Vui lòng thử lại."
        );
      }
    } catch (err) {
      setPurchaseError(
        err?.response?.data?.message || "Thanh toán thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  useEffect(() => {
    api
      .get(`/courses/${courseId}`)
      .then(res => setCourse(res.data))
      .catch(() => setError("Không tải được thông tin khóa học"))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    refreshTab();
  }, [courseId, activeTab]);

  useEffect(() => {
    checkEnrollment();
  }, [courseId]);

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Đang tải…</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-sm text-red-500">{error}</div>;
  }

  if (!course) return null;

  const canPurchase =
    !isEnrolled &&
    course.status === "ON_SALE" &&
    !checkingEnrollment;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4">
        <button
          type="button"
          onClick={() => navigate("/studenthomepage")}
          className="text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          ← Quay lại
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{course.title}</h1>
        <p className="text-sm text-slate-500">
          {course.description || "Chưa có mô tả cho khóa học này."}
        </p>

        {checkingEnrollment ? (
          <p className="mt-2 text-sm text-slate-500">Đang kiểm tra trạng thái đăng ký…</p>
        ) : isEnrolled ? (
          <p className="mt-2 text-sm font-medium text-emerald-700">
            Bạn đã đăng ký khóa học này.
          </p>
        ) : canPurchase ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
            {purchaseMessage && (
              <div className="mb-3 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
                {purchaseMessage}
              </div>
            )}
            {purchaseError && (
              <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                {purchaseError}
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Giá:{" "}
                  <span className="font-semibold text-slate-900">
                    {Number(course.price || 0) === 0
                      ? "Miễn phí"
                      : `${Number(course.price || 0).toLocaleString("vi-VN")} VND`}
                  </span>
                </p>
                {course.teacher_name && (
                  <p className="text-xs text-slate-500">Giáo viên: {course.teacher_name}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full sm:w-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPurchasing
                  ? "Đang xử lý..."
                  : Number(course.price || 0) === 0
                  ? "Đăng ký miễn phí"
                  : "Mua khóa học"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Bạn sẽ được chuyển đến cổng thanh toán (VNPay). Sau khi hoàn tất, quay lại trang này hoặc truy cập mục Khóa học của tôi.
            </p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            Khóa học hiện không thể mua (có thể đang chờ xuất bản hoặc đã hết hạn).
          </p>
        )}
      </header>

      {isEnrolled && (
        <div className="p-6 space-y-6">
          <div className="flex gap-2 mb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "lectures" && (
            <section className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Danh sách bài giảng
              </h2>
              {lectures.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Chưa có bài giảng cho khóa học này.
                </p>
              ) : (
                <ul className="space-y-2">
                  {lectures.map((l, idx) => (
                    <li
                      key={l.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {idx + 1}. {l.title}
                        </p>
                        {l.video_url && (
                          <a
                            href={l.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Xem video bài giảng
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {l.duration_minutes || 0} phút
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeTab === "flashcards" && (
            <section className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Flashcard của khóa học
              </h2>
              {flashcards.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Chưa có flashcard nào được mở cho khóa học này.
                </p>
              ) : (
                <ul className="space-y-2">
                  {flashcards.map(s => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {s.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          Trạng thái: {s.status || "PUBLISHED"}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                        onClick={() => navigate(`/student/flashcards/${s.id}`)}
                      >
                        Học flashcard
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {activeTab === "tests" && (
            <section className="bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Bài test của khóa học
              </h2>
              {tests.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Chưa có bài test nào được mở cho khóa học này.
                </p>
              ) : (
                <ul className="space-y-2">
                  {tests.map(t => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          Thời lượng: {t.duration_minutes || 0} phút
                        </p>
                      </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                      onClick={async () => {
                        try {
                          const res = await api.post(`/tests/${t.id}/attempts`);
                          const attemptId = res.data?.data?.id;
                          if (attemptId) navigate(`/student/attempt/${attemptId}`);
                          else setError("Không thể bắt đầu làm bài");
                        } catch (err) {
                          setError(err.response?.data?.message || "Không thể bắt đầu làm bài");
                        }
                      }}
                    >
                      Làm test
                    </button>
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                      onClick={() => openTestHistory(t.id)}
                    >
                      Lịch sử làm
                    </button>
                  </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
      {testHistoryFor && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Lịch sử làm bài test</h3>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-700"
                onClick={() => {
                  setTestHistoryFor(null);
                  setTestHistory([]);
                }}
              >
                Đóng
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {loadingHistory ? (
                <p className="text-sm text-slate-500">Đang tải lịch sử…</p>
              ) : testHistory.length === 0 ? (
                <p className="text-sm text-slate-500">Bạn chưa có lần làm nào cho bài test này.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {testHistory.map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2"
                    >
                      <div>
                        <p className="text-xs text-slate-500">
                          Nộp lúc: {a.submitted_at ? new Date(a.submitted_at).toLocaleString("vi-VN") : "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Trạng thái: {a.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">
                          {a.score != null && a.max_score != null ? `${a.score}/${a.max_score}` : "Chưa có điểm"}
                        </span>
                        {["SUBMITTED", "GRADED"].includes(a.status) && (
                          <button
                            type="button"
                            className="text-xs px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800"
                            onClick={() => navigate(`/student/attempt/${a.id}/review`)}
                          >
                            Xem chi tiết
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

