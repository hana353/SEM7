import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

const tabs = [
  { id: "lectures", label: "Bài giảng" },
  { id: "flashcards", label: "Flashcard" },
  { id: "tests", label: "Bài test" },
];

/* ========== MODAL CHỈNH SỬA BÀI GIẢNG ========== */
function EditLectureModal({ lecture, onClose, onSuccess }) {
  const [title, setTitle] = useState(lecture?.title ?? "");
  const [videoUrl, setVideoUrl] = useState(lecture?.video_url ?? "");
  const [durationMinutes, setDurationMinutes] = useState(lecture?.duration_minutes ?? 10);
  const [status, setStatus] = useState(lecture?.status ?? "DRAFT");
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
      await api.patch(`/lectures/${lecture.id}`, {
        title: title.trim(),
        video_url: videoUrl.trim() || null,
        duration_minutes: Number(durationMinutes) || 0,
        status,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi cập nhật bài giảng");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Chỉnh sửa bài giảng</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tiêu đề bài giảng</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Link video</label>
            <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="URL video" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Thời lượng (phút)</label>
            <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          {lecture?.status !== "APPROVED_PUBLIC" && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="DRAFT">Nháp</option>
                <option value="PENDING_APPROVAL">Gửi admin duyệt (Public)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Nếu chọn Public, bài giảng sẽ vào trạng thái chờ admin duyệt trước khi học viên thấy.
              </p>
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">{saving ? "Đang lưu…" : "Lưu"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== MODAL THÊM BÀI GIẢNG ========== */
function AddLectureModal({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [status, setStatus] = useState("DRAFT");
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
        status,
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
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="DRAFT">Nháp</option>
              <option value="PENDING_APPROVAL">Gửi admin duyệt (Public)</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Public cần admin duyệt. Học viên chỉ thấy khi được duyệt.
            </p>
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

/* ========== MODAL TẠO FLASHCARD SET + CARDS ========== */
function AddFlashcardModal({ courseId, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState([{ front: "", back: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const addCard = () => setCards((c) => [...c, { front: "", back: "" }]);
  const removeCard = (idx) => {
    if (cards.length <= 1) return;
    setCards((c) => c.filter((_, i) => i !== idx));
  };
  const updateCard = (idx, field, value) => {
    setCards((c) => {
      const n = [...c];
      n[idx] = { ...n[idx], [field]: value };
      return n;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) return setError("Tiêu đề flashcard không được để trống");
    const valid = cards.filter((x) => x.front.trim() && x.back.trim());
    if (valid.length === 0) return setError("Cần ít nhất 1 thẻ có đủ mặt trước và mặt sau");

    setSaving(true);
    try {
      const setRes = await api.post("/flashcards", {
        course_id: courseId,
        title: title.trim(),
        status,
      });
      const setId = setRes.data?.data?.id;
      if (!setId) throw new Error("Tạo flashcard set thất bại");

      for (let i = 0; i < valid.length; i++) {
        const c = valid[i];
        await api.post(`/flashcards/teacher/${setId}/cards`, {
          front_text: c.front.trim(),
          back_text: c.back.trim(),
          position: i,
        });
      }

      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo flashcard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl my-8">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Tạo Flashcard</h3>
          <p className="text-xs text-slate-500 mt-0.5">Mỗi thẻ gồm mặt trước và mặt sau</p>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Ví dụ: Flashcard từ vựng Bài 1"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="DRAFT">Nháp (học sinh chưa thấy)</option>
                <option value="PUBLISHED">Mở cho học sinh</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-medium text-slate-700">Danh sách thẻ</label>
              <button type="button" onClick={addCard} className="text-xs text-blue-600 hover:underline">
                + Thêm thẻ
              </button>
            </div>
            {cards.map((c, idx) => (
              <div key={idx} className="mb-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Thẻ {idx + 1}</span>
                  {cards.length > 1 && (
                    <button type="button" onClick={() => removeCard(idx)} className="text-xs text-red-600 hover:underline">
                      Xóa
                    </button>
                  )}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    value={c.front}
                    onChange={(e) => updateCard(idx, "front", e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Mặt trước"
                  />
                  <input
                    type="text"
                    value={c.back}
                    onChange={(e) => updateCard(idx, "back", e.target.value)}
                    className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    placeholder="Mặt sau"
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
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
              {saving ? "Đang tạo…" : "Tạo flashcard"}
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
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [status, setStatus] = useState("DRAFT");
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
        max_attempts: maxAttempts === "" || maxAttempts === null ? null : Number(maxAttempts),
        status,
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
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Giới hạn số lần làm</label>
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="mt-1 text-[11px] text-slate-500">Ví dụ: 1 nghĩa là học sinh chỉ được làm 1 lần.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="DRAFT">Nháp (học sinh chưa thấy)</option>
                <option value="PUBLISHED">Mở cho học sinh</option>
              </select>
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

function EditTestModal({ testId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [status, setStatus] = useState("DRAFT");

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/tests/teacher/${testId}`)
      .then((r) => {
        const t = r.data?.data;
        setTitle(t?.title || "");
        setDurationMinutes(t?.duration_minutes ?? 15);
        setMaxAttempts(t?.max_attempts ?? 1);
        setStatus(t?.status || "DRAFT");
      })
      .catch((e) => setError(e.response?.data?.message || "Không tải được bài test"))
      .finally(() => setLoading(false));
  }, [testId]);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await api.patch(`/tests/teacher/${testId}`, {
        title: title.trim(),
        duration_minutes: Number(durationMinutes) || 15,
        max_attempts: maxAttempts === "" || maxAttempts === null ? null : Number(maxAttempts),
        status,
      });
      onSuccess?.();
      onClose?.();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể cập nhật bài test");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    setDeleting(true);
    setError("");
    try {
      await api.delete(`/tests/teacher/${testId}`);
      onSuccess?.();
      onClose?.();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể xóa bài test");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-900">Chỉnh sửa bài test</h3>
          <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700">
            Đóng
          </button>
        </div>
        <div className="p-4 space-y-3">
          {loading ? (
            <p className="text-sm text-slate-500">Đang tải...</p>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Tiêu đề</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Thời gian (phút)</label>
                  <input type="number" min={1} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Số lần làm</label>
                  <input type="number" min={1} value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Trạng thái</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                  <option value="DRAFT">Nháp</option>
                  <option value="PUBLISHED">Mở cho học sinh</option>
                  <option value="CLOSED">Đóng</option>
                </select>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={save} disabled={saving || !title.trim()} className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
                <button type="button" onClick={del} disabled={deleting} className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-60">
                  {deleting ? "Đang xóa…" : "Xóa"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== MODAL XEM CHI TIẾT FLASHCARD ========== */
function FlashcardDetailModal({ setId, onClose, onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [adding, setAdding] = useState({ front: "", back: "" });
  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get(`/flashcards/teacher/${setId}`)
      .then((r) => {
        setData(r.data?.data);
        setTitle(r.data?.data?.title || "");
        setStatus(r.data?.data?.status || "DRAFT");
      })
      .catch((e) => {
        setError(e.response?.data?.message || "Không tải được dữ liệu");
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [setId]);

  const refresh = async () => {
    const r = await api.get(`/flashcards/teacher/${setId}`);
    setData(r.data?.data);
    setTitle(r.data?.data?.title || "");
    setStatus(r.data?.data?.status || "DRAFT");
  };

  const saveSet = async () => {
    setSaving(true);
    setError("");
    try {
      await api.patch(`/flashcards/teacher/${setId}`, { title: title.trim(), status });
      await refresh();
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể cập nhật flashcard");
    } finally {
      setSaving(false);
    }
  };

  const deleteSet = async () => {
    setSaving(true);
    setError("");
    try {
      await api.delete(`/flashcards/teacher/${setId}`);
      onChanged?.();
      onClose?.();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể xóa flashcard");
    } finally {
      setSaving(false);
    }
  };

  const addCard = async () => {
    if (!adding.front.trim() || !adding.back.trim()) return;
    setSaving(true);
    setError("");
    try {
      const pos = (data?.cards || []).length;
      await api.post(`/flashcards/teacher/${setId}/cards`, {
        front_text: adding.front.trim(),
        back_text: adding.back.trim(),
        position: pos,
      });
      setAdding({ front: "", back: "" });
      await refresh();
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể thêm thẻ");
    } finally {
      setSaving(false);
    }
  };

  const updateCard = async (cardId, patch) => {
    setSaving(true);
    setError("");
    try {
      await api.patch(`/flashcards/teacher/cards/${cardId}`, patch);
      await refresh();
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể cập nhật thẻ");
    } finally {
      setSaving(false);
    }
  };

  const deleteCard = async (cardId) => {
    setSaving(true);
    setError("");
    try {
      await api.delete(`/flashcards/teacher/cards/${cardId}`);
      await refresh();
      onChanged?.();
    } catch (e) {
      setError(e.response?.data?.message || "Không thể xóa thẻ");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl my-8 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-900">Danh sách thẻ Flashcard</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Đóng</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? <p className="text-slate-500">Đang tải...</p> : !data ? <p className="text-slate-500">{error || "Không tải được dữ liệu"}</p> : (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 mb-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Tiêu đề</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Trạng thái</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white">
                      <option value="DRAFT">Nháp</option>
                      <option value="PUBLISHED">Mở cho học sinh</option>
                      <option value="ARCHIVED">Ẩn</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button type="button" onClick={saveSet} disabled={saving || !title.trim()} className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                      Lưu
                    </button>
                    <button type="button" onClick={deleteSet} disabled={saving} className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-60">
                      Xóa
                    </button>
                  </div>
                </div>
                {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
              </div>

              <div className="rounded-lg border border-slate-200 p-3 mb-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">Thêm thẻ mới</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={adding.front} onChange={(e) => setAdding((x) => ({ ...x, front: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2 text-sm" placeholder="Mặt trước" />
                  <input value={adding.back} onChange={(e) => setAdding((x) => ({ ...x, back: e.target.value }))} className="w-full rounded border border-slate-300 px-2 py-2 text-sm" placeholder="Mặt sau" />
                </div>
                <button type="button" onClick={addCard} disabled={saving || !adding.front.trim() || !adding.back.trim()} className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60">
                  + Thêm thẻ
                </button>
              </div>

              {(data.cards || []).length === 0 ? <p className="text-slate-500">Chưa có thẻ</p> : (
                <ul className="space-y-3">
                  {(data.cards || []).map((card, i) => (
                    <li key={card.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <p className="text-xs font-medium text-slate-600">Thẻ {i + 1}</p>
                      <div className="grid gap-2 sm:grid-cols-2 mt-2">
                        <input
                          defaultValue={card.front_text}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v && v !== card.front_text) updateCard(card.id, { front_text: v });
                          }}
                          className="w-full rounded border border-slate-300 px-2 py-2 text-sm bg-white"
                        />
                        <input
                          defaultValue={card.back_text}
                          onBlur={(e) => {
                            const v = e.target.value.trim();
                            if (v && v !== card.back_text) updateCard(card.id, { back_text: v });
                          }}
                          className="w-full rounded border border-slate-300 px-2 py-2 text-sm bg-white"
                        />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button type="button" onClick={() => deleteCard(card.id)} disabled={saving} className="text-xs px-2 py-1 rounded bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-60">
                          Xóa thẻ
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== MODAL XEM CHI TIẾT TEST (DANH SÁCH CÂU HỎI) ========== */
function TestDetailModal({ testId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/tests/teacher/${testId}`).then((r) => setData(r.data?.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [testId]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl my-8 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-900">Danh sách câu hỏi Bài test</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Đóng</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? <p className="text-slate-500">Đang tải...</p> : !data ? <p className="text-slate-500">Không tải được dữ liệu</p> : (
            <>
              <p className="text-xs text-slate-600 mb-3">Test: {data.title}</p>
              {(data.questions || []).length === 0 ? <p className="text-slate-500">Chưa có câu hỏi</p> : (
                <ul className="space-y-3">
                  {(data.questions || []).map((q, i) => (
                    <li key={q.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                      <p className="text-xs font-medium text-slate-600">Câu {i + 1}</p>
                      <p className="text-sm text-slate-900 mt-1">{q.question_text}</p>
                      <ul className="mt-2 space-y-1 text-xs">
                        {(q.choices || []).map((c) => (
                          <li key={c.id} className={c.is_correct ? "text-emerald-700 font-medium" : "text-slate-600"}>{c.choice_text} {c.is_correct ? "(đáp án đúng)" : ""}</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== MODAL LỊCH SỬ LÀM BÀI TEST ========== */
function TestAttemptsModal({ testId, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get(`/tests/teacher/${testId}/attempts`).then((r) => setList(r.data?.data || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, [testId]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl my-8 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="border-b border-slate-200 px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-900">Lịch sử làm bài của học sinh</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">Đóng</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? <p className="text-slate-500">Đang tải...</p> : list.length === 0 ? <p className="text-slate-500">Chưa có lần làm bài nào</p> : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                <tr><th className="px-3 py-2">Học sinh</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Điểm</th><th className="px-3 py-2">Nộp bài</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-2 text-slate-900">{a.student_name || "—"}</td>
                    <td className="px-3 py-2 text-slate-600">{a.student_email || "—"}</td>
                    <td className="px-3 py-2 font-medium">{a.score != null ? `${a.score}/${a.max_score ?? "—"}` : "—"}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{a.submitted_at ? new Date(a.submitted_at).toLocaleString("vi-VN") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TeacherCourseDetail({ courseId: courseIdProp, embedded = false, onBack }) {
  const params = useParams();
  const courseId = courseIdProp || params.courseId;
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("lectures");
  const [lectures, setLectures] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [flashcardDetailModal, setFlashcardDetailModal] = useState(null);
  const [testDetailModal, setTestDetailModal] = useState(null);
  const [testAttemptsModal, setTestAttemptsModal] = useState(null);
  const [editTestModal, setEditTestModal] = useState(null);

  const refresh = () => {
    if (!courseId) return;
    if (activeTab === "lectures") {
      api.get(`/lectures/course/${courseId}`).then((r) => setLectures(Array.isArray(r.data) ? r.data : [])).catch(() => setLectures([]));
    } else if (activeTab === "flashcards") {
      api.get(`/flashcards/teacher/list?course_id=${courseId}`).then((r) => setFlashcards(r.data?.data || [])).catch(() => setFlashcards([]));
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

  if (loading) return <div className="p-6 text-center text-slate-500">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!course) return null;

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100"}>
      {!embedded && (
        <header className="bg-white/80 backdrop-blur border-b px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/teacher?section=myCourses")}
            className="text-sm text-slate-500 hover:text-slate-700 mb-2"
          >
            ← Quay lại
          </button>
          <h1 className="text-xl font-semibold text-slate-900">{course.title}</h1>
          <p className="text-sm text-slate-500">{course.description || "Chưa có mô tả"}</p>
        </header>
      )}

      <div className={embedded ? "" : "p-6"}>
        {embedded && (
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
              <p className="text-xs text-slate-500">{course.description || "Chưa có mô tả"}</p>
            </div>
            <button
              type="button"
              onClick={() => (onBack ? onBack() : navigate("/teacher?section=myCourses"))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Quay lại khóa học của tôi
            </button>
          </div>
        )}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === t.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "lectures" && (
          <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Bài giảng</h2>
              <button
                type="button"
                onClick={() => setShowLectureModal(true)}
                className="px-3 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800 shadow-sm"
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
                      {l.status && (
                        <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {l.status}
                        </span>
                      )}
                      {l.status === "REJECTED" && l.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">Lý do từ chối: {l.rejection_reason}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">{l.duration_minutes || 0} phút</span>
                      {(l.status === "DRAFT" || l.status === "REJECTED") && (
                        <button
                          type="button"
                          onClick={async () => {
                            await api.patch(`/lectures/${l.id}`, { status: "PENDING_APPROVAL" });
                            refresh();
                          }}
                          className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                          Gửi duyệt
                        </button>
                      )}
                      <button type="button" onClick={() => setEditingLecture(l)} className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200">Chỉnh sửa</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Flashcard</h2>
              <button
                type="button"
                onClick={() => setShowFlashcardModal(true)}
                className="px-3 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800 shadow-sm"
              >
                + Tạo flashcard
              </button>
            </div>
            {flashcards.length === 0 ? (
              <p className="text-slate-500">Chưa có flashcard. Nhấn &quot;Tạo flashcard&quot; để thêm thẻ học.</p>
            ) : (
              <ul className="space-y-2">
                {flashcards.map((s) => (
                  <li key={s.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span>{s.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{s.status || "DRAFT"}</span>
                      <button type="button" onClick={() => setFlashcardDetailModal(s.id)} className="text-xs px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800">Xem thẻ</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeTab === "tests" && (
          <div className="bg-white/90 backdrop-blur rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Bài test</h2>
              <button
                type="button"
                onClick={() => setShowTestModal(true)}
                className="px-3 py-2 bg-slate-900 text-white text-sm rounded-xl hover:bg-slate-800 shadow-sm"
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
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100">{t.status || "DRAFT"}</span>
                      <button type="button" onClick={() => setTestDetailModal(t.id)} className="text-xs px-2 py-1 rounded bg-slate-900 text-white hover:bg-slate-800">Xem câu hỏi</button>
                      <button type="button" onClick={() => setEditTestModal(t.id)} className="text-xs px-2 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-100">Sửa</button>
                      <button type="button" onClick={() => setTestAttemptsModal(t.id)} className="text-xs px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500">Lịch sử làm bài</button>
                    </div>
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
      {editingLecture && (
        <EditLectureModal lecture={editingLecture} onClose={() => setEditingLecture(null)} onSuccess={() => { setEditingLecture(null); refresh(); }} />
      )}
      {showFlashcardModal && <AddFlashcardModal courseId={courseId} onClose={() => setShowFlashcardModal(false)} onSuccess={refresh} />}
      {showTestModal && <AddTestModal courseId={courseId} onClose={() => setShowTestModal(false)} onSuccess={refresh} />}
      {flashcardDetailModal && <FlashcardDetailModal setId={flashcardDetailModal} onClose={() => setFlashcardDetailModal(null)} onChanged={refresh} />}
      {testDetailModal && <TestDetailModal testId={testDetailModal} onClose={() => setTestDetailModal(null)} />}
      {testAttemptsModal && <TestAttemptsModal testId={testAttemptsModal} onClose={() => setTestAttemptsModal(null)} />}
      {editTestModal && <EditTestModal testId={editTestModal} onClose={() => setEditTestModal(null)} onSuccess={refresh} />}
    </div>
  );
}
