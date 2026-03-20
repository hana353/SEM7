import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";

function formatCountdown(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function StudentTestAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(null);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    api
      .get(`/tests/attempts/${attemptId}`)
      .then((r) => setData(r.data?.data))
      .catch(() => setError("Không tải được bài làm"))
      .finally(() => setLoading(false));
  }, [attemptId]);

  useEffect(() => {
    if (!data?.questions) return;
    const initial = {};
    data.questions.forEach((q) => {
      if (q.selected_choice_id) initial[q.id] = q.selected_choice_id;
    });
    setAnswers((a) => ({ ...initial, ...a }));
  }, [data]);

  const goBackToTestsTab = () => {
    const courseId =
      location.state?.courseId ||
      data?.test?.course_id ||
      data?.attempt?.course_id ||
      null;

    navigate("/studenthomepage", {
      replace: true,
      state: {
        section: "myCourses",
        selectedCourseId: courseId,
        activeTab: "tests",
      },
    });
  };

  useEffect(() => {
    if (!data?.attempt) return;
    if (data.attempt?.status !== "IN_PROGRESS") return;

    autoSubmittedRef.current = false;

    let deadlineMs = null;
    if (data.attempt.expires_at) {
      const t = new Date(data.attempt.expires_at).getTime();
      if (!Number.isNaN(t)) deadlineMs = t;
    }

    if (!deadlineMs && data.attempt.time_limit_seconds) {
      const start = new Date(data.attempt.started_at).getTime();
      const limit = Number(data.attempt.time_limit_seconds);
      if (!Number.isNaN(start) && Number.isFinite(limit) && limit > 0) {
        deadlineMs = start + limit * 1000;
      }
    }

    if (!deadlineMs) {
      setTimeLeftSec(null);
      return;
    }

    const tick = () => {
      const diffMs = deadlineMs - Date.now();
      const left = Math.ceil(diffMs / 1000);
      setTimeLeftSec(left);

      if (left <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        api
          .post(`/tests/attempts/${attemptId}/submit`)
          .then(() => {
            navigate(`/student/attempt/${attemptId}/review`, {
              replace: true,
              state: {
                courseId:
                  location.state?.courseId ||
                  data?.test?.course_id ||
                  data?.attempt?.course_id ||
                  null,
              },
            });
          })
          .catch(() => {
            window.location.reload();
          });
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [
    data,
    data?.attempt?.expires_at,
    data?.attempt?.time_limit_seconds,
    data?.attempt?.started_at,
    data?.attempt?.status,
    attemptId,
    navigate,
    location.state,
  ]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Đang tải...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500">
        {error || "Không tìm thấy bài làm"}
      </div>
    );
  }

  const { attempt, test, questions } = data;

  if (attempt.status !== "IN_PROGRESS") {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600">Bài làm này đã nộp hoặc đã chấm.</p>
        <button
          type="button"
          onClick={goBackToTestsTab}
          className="mt-2 text-blue-600 hover:underline"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQ];
  const total = questions.length;

  const handleSaveAnswer = (questionId, choiceId) => {
    setAnswers((a) => ({ ...a, [questionId]: choiceId }));
    api
      .post(`/tests/attempts/${attemptId}/answers`, {
        question_id: questionId,
        choice_id: choiceId,
      })
      .catch(() => {});
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/tests/attempts/${attemptId}/submit`);
      navigate(`/student/attempt/${attemptId}/review`, {
        replace: true,
        state: {
          courseId:
            location.state?.courseId ||
            data?.test?.course_id ||
            data?.attempt?.course_id ||
            null,
        },
      });
    } catch (e) {
      setError(e.response?.data?.message || "Nộp bài thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-2xl mx-auto">
      <button
        type="button"
        onClick={goBackToTestsTab}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Quay lại
      </button>

      <h1 className="text-xl font-semibold text-slate-900 mb-2">{test.title}</h1>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>
            Câu {currentQ + 1} / {total}
          </span>
          {timeLeftSec !== null && (
            <span
              className={`font-semibold ${
                timeLeftSec <= 60 ? "text-rose-600" : "text-slate-700"
              }`}
              title="Thời gian còn lại"
            >
              ⏱ {formatCountdown(timeLeftSec)}
            </span>
          )}
        </div>

        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all"
            style={{ width: `${total ? ((currentQ + 1) / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        {currentQuestion && (
          <>
            <p className="text-lg font-medium text-slate-900 mb-4">
              {currentQuestion.question_text}
            </p>

            <ul className="space-y-2">
              {(currentQuestion.choices || []).map((choice) => (
                <li key={choice.id}>
                  <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === choice.id}
                      onChange={() =>
                        handleSaveAnswer(currentQuestion.id, choice.id)
                      }
                      className="text-slate-900"
                    />
                    <span className="text-sm">{choice.choice_text}</span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={() => setCurrentQ((i) => Math.max(0, i - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm disabled:opacity-50"
        >
          ← Câu trước
        </button>

        {currentQ + 1 < total ? (
          <button
            type="button"
            onClick={() => setCurrentQ((i) => i + 1)}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm"
          >
            Câu sau →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        )}
      </div>
    </div>
  );
}