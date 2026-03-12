import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const tabs = [
  { id: "lectures", label: "Bài giảng" },
  { id: "quizzes", label: "Quiz" },
  { id: "tests", label: "Bài test" },
];

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    } else if (activeTab === "quizzes") {
      api
        .get(`/quizzes?course_id=${courseId}`)
        .then(res => setQuizzes(res.data?.data || []))
        .catch(() => setQuizzes([]));
    } else if (activeTab === "tests") {
      api
        .get(`/tests?course_id=${courseId}`)
        .then(res => setTests(res.data?.data || []))
        .catch(() => setTests([]));
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

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Đang tải…</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-sm text-red-500">{error}</div>;
  }

  if (!course) return null;

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
      </header>

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

        {activeTab === "quizzes" && (
          <section className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Quiz của khóa học
            </h2>
            {quizzes.length === 0 ? (
              <p className="text-sm text-slate-500">
                Chưa có quiz nào được mở cho khóa học này.
              </p>
            ) : (
              <ul className="space-y-2">
                {quizzes.map(q => (
                  <li
                    key={q.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {q.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        Trạng thái: {q.status || "PUBLISHED"}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      onClick={() =>
                        alert(
                          "Luồng làm quiz chi tiết (flashcard / kiểm tra) sẽ được triển khai ở bước tiếp theo."
                        )
                      }
                    >
                      Làm quiz
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
                    <button
                      type="button"
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                      onClick={() =>
                        alert(
                          "Luồng làm test (tạo attempt, làm bài, chấm điểm) sẽ được triển khai chi tiết ở bước tiếp theo."
                        )
                      }
                    >
                      Làm test
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

