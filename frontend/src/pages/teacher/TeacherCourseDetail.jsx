import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const tabs = [
  { id: "lectures", label: "Bài giảng" },
  { id: "quizzes", label: "Quiz" },
  { id: "tests", label: "Bài test" },
];

/* ========== MODAL THÊM BÀI GIẢNG ========== */
function AddLectureModal({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/lectures/course/${courseId}`, {
        title: title.trim(),
        video_url: videoUrl.trim() || null,
        duration_minutes: Number(durationMinutes) || 0,
      });
      onSuccess?.(res.data?.data);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi thêm bài giảng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Thêm bài giảng</h3>
          <p className="text-xs text-slate-500 mt-0.5">Mỗi bài giảng gồm 1 video và thông tin liên quan</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tiêu đề bài giảng</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Ví dụ: Bài 1 - Alphabet"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Video</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="URL video (YouTube, Vimeo...)"
              />
              <button
                type="button"
                className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                onClick={() => document.getElementById("lecture-video-url")?.focus()}
              >
                Dán URL
              </button>
            </div>
            <input id="lecture-video-url" type="hidden" />
            <p className="mt-1 text-[11px] text-slate-500">
              Nhập link YouTube, Vimeo hoặc URL trực tiếp. Upload file video sẽ bổ sung sau.
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Thời lượng (phút)</label>
            <input
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Đang lưu…" : "Thêm bài giảng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== MODAL TẠO QUIZ + CÂU HỎI MULTIPLE CHOICE ========== */
function AddQuizModal({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ question: "", correct: "", wrong1: "", wrong2: "", wrong3: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => {
    setQuestions((q) => [...q, { question: "", correct: "", wrong1: "", wrong2: "", wrong3: "" }]);
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions((q) => {
      const n = [...q];
      n[idx] = { ...n[idx], [field]: value };
      return n;
    });
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions((q) => q.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Tiêu đề quiz không được để trống");
      return;
    }
    const valid = questions.filter((q) => q.question.trim() && q.correct.trim());
    if (valid.length === 0) {
      setError("Cần ít nhất 1 câu hỏi với đáp án đúng");
      return;
    }
    setSaving(true);
    try {
      const quizRes = await api.post("/quizzes", { course_id: courseId, title: title.trim() });
      const quizId = quizRes.data?.data?.id;
      if (!quizId) throw new Error("Tạo quiz thất bại");
      for (let i = 0; i < valid.length; i++) {
        const q = valid[i];
        const wrongs = [q.wrong1, q.wrong2, q.wrong3].filter(Boolean).join("||");
        await api.post(`/quizzes/teacher/${quizId}/cards`, {
          front_text: q.question.trim(),
          back_text: q.correct.trim(),
          back_image_url: wrongs || null,
          position: i,
        });
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl my-8">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Tạo Quiz (Multiple Choice)</h3>
          <p className="text-xs text-slate-500 mt-0.5">Thêm các câu hỏi trắc nghiệm với 4 đáp án (1 đúng)</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tiêu đề quiz</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="Ví dụ: Quiz từ vựng Bài 1"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-700">Các câu hỏi</label>
              <button type="button" onClick={addQuestion} className="text-xs text-blue-600 hover:underline">
                + Thêm câu hỏi
              </button>
            </div>
            {questions.map((q, idx) => (
              <div key={idx} className="mb-4 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Câu {idx + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(idx)} className="text-xs text-red-600 hover:underline">
                      Xóa
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(idx, "question", e.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm mb-2"
                  placeholder="Nội dung câu hỏi"
                />
                <div className="space-y-1.5 text-sm">
                  <input
                    type="text"
                    value={q.correct}
                    onChange={(e) => updateQuestion(idx, "correct", e.target.value)}
                    className="w-full rounded border border-emerald-300 px-2 py-1.5 bg-emerald-50/50"
                    placeholder="Đáp án đúng"
                  />
                  <input
                    type="text"
                    value={q.wrong1}
                    onChange={(e) => updateQuestion(idx, "wrong1", e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1.5"
                    placeholder="Đáp án sai 1"
                  />
                  <input
                    type="text"
                    value={q.wrong2}
                    onChange={(e) => updateQuestion(idx, "wrong2", e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1.5"
                    placeholder="Đáp án sai 2"
                  />
                  <input
                    type="text"
                    value={q.wrong3}
                    onChange={(e) => updateQuestion(idx, "wrong3", e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1.5"
                    placeholder="Đáp án sai 3"
                  />
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Đang tạo…" : "Tạo quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== MODAL TẠO TEST + CÂU HỎI MULTIPLE CHOICE ========== */
function AddTestModal({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [questions, setQuestions] = useState([
    { question: "", choices: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addQuestion = () => {
    setQuestions((q) => [
      ...q,
      { question: "", choices: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] },
    ]);
  };

  const updateQuestion = (qIdx, field, value) => {
    setQuestions((qs) => {
      const n = [...qs];
      n[qIdx] = { ...n[qIdx], [field]: value };
      return n;
    });
  };

  const updateChoice = (qIdx, cIdx, field, value) => {
    setQuestions((qs) => {
      const n = [...qs];
      const ch = [...(n[qIdx].choices || [])];
      ch[cIdx] = { ...ch[cIdx], [field]: value };
      if (field === "isCorrect" && value) {
        ch.forEach((c, i) => (c.isCorrect = i === cIdx));
      }
      n[qIdx] = { ...n[qIdx], choices: ch };
      return n;
    });
  };

  const removeQuestion = (idx) => {
    if (questions.length <= 1) return;
    setQuestions((q) => q.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Tiêu đề bài test không được để trống");
      return;
    }
    const validQuestions = questions.filter((q) => q.question.trim() && (q.choices || []).some((c) => c.text.trim() && c.isCorrect));
    if (validQuestions.length === 0) {
      setError("Cần ít nhất 1 câu hỏi với đáp án đúng được chọn");
      return;
    }
    setSaving(true);
    try {
      const testRes = await api.post("/tests", {
        course_id: courseId,
        title: title.trim(),
        duration_minutes: Number(durationMinutes) || 15,
      });
      const testId = testRes.data?.data?.id;
      if (!testId) throw new Error("Tạo test thất bại");
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];
        const qRes = await api.post(`/tests/teacher/${testId}/questions`, {
          question_text: q.question.trim(),
          points: 1,
          position: i,
        });
        const questionId = qRes.data?.data?.id;
        for (let j = 0; j < (q.choices || []).length; j++) {
          const c = q.choices[j];
          if (!c.text.trim()) continue;
          await api.post(`/tests/teacher/questions/${questionId}/choices`, {
            choice_text: c.text.trim(),
            is_correct: !!c.isCorrect,
            position: j,
          });
        }
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo test");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl my-8">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Tạo Bài Test (Multiple Choice)</h3>
          <p className="text-xs text-slate-500 mt-0.5">Thêm các câu hỏi trắc nghiệm, chọn 1 đáp án đúng cho mỗi câu</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tiêu đề bài test</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Ví dụ: Test cuối kỳ"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Thời gian (phút)</label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-700">Các câu hỏi</label>
              <button type="button" onClick={addQuestion} className="text-xs text-blue-600 hover:underline">
                + Thêm câu hỏi
              </button>
            </div>
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="mb-4 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Câu {qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIdx)} className="text-xs text-red-600 hover:underline">
                      Xóa
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, "question", e.target.value)}
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm mb-2"
                  placeholder="Nội dung câu hỏi"
                />
                <div className="space-y-1.5">
                  {(q.choices || []).map((c, cIdx) => (
                    <div key={cIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`q${qIdx}-correct`}
                        checked={!!c.isCorrect}
                        onChange={() => updateChoice(qIdx, cIdx, "isCorrect", true)}
                        className="shrink-0"
                      />
                      <input
                        type="text"
                        value={c.text}
                        onChange={(e) => updateChoice(qIdx, cIdx, "text", e.target.value)}
                        className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
                        placeholder={`Đáp án ${cIdx + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Đang tạo…" : "Tạo bài test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const refresh = () => {
    if (!courseId) return;
    if (activeTab === "lectures") {
      api.get(`/lectures/course/${courseId}`).then((r) => setLectures(Array.isArray(r.data) ? r.data : [])).catch(() => setLectures([]));
    } else if (activeTab === "quizzes") {
      api.get(`/quizzes/teacher/list?course_id=${courseId}`).then((r) => setQuizzes(r.data?.data || [])).catch(() => setQuizzes([]));
    } else if (activeTab === "tests") {
      api.get(`/tests/teacher/list?course_id=${courseId}`).then((r) => setTests(r.data?.data || [])).catch(() => setTests([]));
    }
  };

  useEffect(() => {
    api.get(`/courses/${courseId}`).then((r) => setCourse(r.data)).catch(() => setError("Không tải được thông tin khóa học")).finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    refresh();
  }, [courseId, activeTab]);

  if (loading) return <div className="p-6 text-center">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!course) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4">
        <button type="button" onClick={() => navigate("/teacher")} className="text-sm text-slate-500 hover:text-slate-700 mb-2">
          ← Quay lại
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{course.title}</h1>
        <p className="text-sm text-slate-500">{course.description || "Chưa có mô tả"}</p>
      </header>

      <div className="p-6">
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
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
                onClick={() => setShowLectureModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
              >
                + Thêm bài giảng
              </button>
            </div>
            {lectures.length === 0 ? (
              <p className="text-slate-500">Chưa có bài giảng. Nhấn &quot;Thêm bài giảng&quot; để tạo mới (mỗi bài gồm 1 video + thông tin).</p>
            ) : (
              <ul className="space-y-2">
                {lectures.map((l, i) => (
                  <li key={l.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <span className="font-medium">{i + 1}. {l.title}</span>
                      {l.video_url && <span className="ml-2 text-xs text-slate-500">(có video)</span>}
                    </div>
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
                onClick={() => setShowQuizModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
              >
                + Tạo quiz
              </button>
            </div>
            {quizzes.length === 0 ? (
              <p className="text-slate-500">Chưa có quiz. Nhấn &quot;Tạo quiz&quot; để thêm câu hỏi trắc nghiệm.</p>
            ) : (
              <ul className="space-y-2">
                {quizzes.map((q) => (
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
                onClick={() => setShowTestModal(true)}
                className="px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800"
              >
                + Tạo bài test
              </button>
            </div>
            {tests.length === 0 ? (
              <p className="text-slate-500">Chưa có bài test. Nhấn &quot;Tạo bài test&quot; để thêm câu hỏi trắc nghiệm.</p>
            ) : (
              <ul className="space-y-2">
                {tests.map((t) => (
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

      {showLectureModal && (
        <AddLectureModal courseId={courseId} onClose={() => setShowLectureModal(false)} onSuccess={refresh} />
      )}
      {showQuizModal && <AddQuizModal courseId={courseId} onClose={() => setShowQuizModal(false)} onSuccess={refresh} />}
      {showTestModal && <AddTestModal courseId={courseId} onClose={() => setShowTestModal(false)} onSuccess={refresh} />}
    </div>
  );
}
