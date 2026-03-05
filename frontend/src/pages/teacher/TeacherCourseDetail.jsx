import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const tabs = [
  { id: "lectures", label: "Bài giảng" },
  { id: "quizzes", label: "Quiz" },
  { id: "tests", label: "Bài test" },
];

export default function TeacherCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
  const [lectures, setLectures] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/courses/${courseId}`)
      .then(res => setCourse(res.data))
      .catch(() => setError("Không tải được thông tin khóa học"))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;
    if (activeTab === "lectures") {
      api.get(`/lectures/course/${courseId}`)
        .then(res => setLectures(Array.isArray(res.data) ? res.data : []))
        .catch(() => setLectures([]));
    } else if (activeTab === "quizzes") {
      api.get(`/quizzes/teacher/list?course_id=${courseId}`)
        .then(res => setQuizzes(res.data?.data || []))
        .catch(() => setQuizzes([]));
    } else if (activeTab === "tests") {
      api.get(`/tests/teacher/list?course_id=${courseId}`)
        .then(res => setTests(res.data?.data || []))
        .catch(() => setTests([]));
    }
  }, [courseId, activeTab]);

  const handleAddLecture = () => {
    const title = prompt("Tiêu đề bài giảng:");
    if (!title?.trim()) return;
    api.post(`/lectures/course/${courseId}`, { title, order_index: lectures.length })
      .then(() => {
        api.get(`/lectures/course/${courseId}`).then(r => setLectures(Array.isArray(r.data) ? r.data : []));
      })
      .catch(e => alert(e.response?.data?.message || "Lỗi"));
  };

  const handleAddQuiz = () => {
    const title = prompt("Tiêu đề quiz:");
    if (!title?.trim()) return;
    api.post("/quizzes", { course_id: courseId, title })
      .then(() => {
        api.get(`/quizzes/teacher/list?course_id=${courseId}`).then(r => setQuizzes(r.data?.data || []));
      })
      .catch(e => alert(e.response?.data?.message || "Lỗi"));
  };

  const handleAddTest = () => {
    const title = prompt("Tiêu đề bài test:");
    if (!title?.trim()) return;
    api.post("/tests", { course_id: courseId, title })
      .then(() => {
        api.get(`/tests/teacher/list?course_id=${courseId}`).then(r => setTests(r.data?.data || []));
      })
      .catch(e => alert(e.response?.data?.message || "Lỗi"));
  };

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4">
        <button
          type="button"
          onClick={() => navigate("/teacher")}
          className="text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          ← Quay lại
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{course.title}</h1>
        <p className="text-sm text-slate-500">{course.description || "Chưa có mô tả"}</p>
      </header>

      <div className="p-6">
        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === t.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "lectures" && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Bài giảng</h2>
              <button
                type="button"
                onClick={handleAddLecture}
                className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
              >
                + Thêm bài giảng
              </button>
            </div>
            {lectures.length === 0 ? (
              <p className="text-slate-500">Chưa có bài giảng</p>
            ) : (
              <ul className="space-y-2">
                {lectures.map((l, i) => (
                  <li key={l.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span>{i + 1}. {l.title}</span>
                    <span className="text-sm text-slate-500">{l.duration_minutes || 0} phút</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "quizzes" && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Quiz</h2>
              <button
                type="button"
                onClick={handleAddQuiz}
                className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
              >
                + Tạo quiz
              </button>
            </div>
            {quizzes.length === 0 ? (
              <p className="text-slate-500">Chưa có quiz</p>
            ) : (
              <ul className="space-y-2">
                {quizzes.map(q => (
                  <li key={q.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span>{q.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{q.status || "DRAFT"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "tests" && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Bài test</h2>
              <button
                type="button"
                onClick={handleAddTest}
                className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
              >
                + Tạo bài test
              </button>
            </div>
            {tests.length === 0 ? (
              <p className="text-slate-500">Chưa có bài test</p>
            ) : (
              <ul className="space-y-2">
                {tests.map(t => (
                  <li key={t.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span>{t.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{t.status || "DRAFT"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
