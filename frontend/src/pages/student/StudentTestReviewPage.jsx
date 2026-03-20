import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../../api/axios";

export default function StudentTestReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/tests/attempts/${attemptId}/review`)
      .then((r) => setData(r.data?.data))
      .catch((e) =>
        setError(e.response?.data?.message || "Không tải được kết quả bài làm")
      )
      .finally(() => setLoading(false));
  }, [attemptId]);

  const goBackToTestsTab = () => {
    const courseId =
      location.state?.courseId || data?.test?.course_id || data?.attempt?.course_id || null;

    navigate("/studenthomepage", {
      replace: true,
      state: {
        section: "myCourses",
        selectedCourseId: courseId,
        activeTab: "tests",
      },
    });
  };

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Đang tải kết quả...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-red-500">
        {error || "Không tìm thấy kết quả"}
      </div>
    );
  }

  const { attempt, test, questions } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-3xl mx-auto">
      <button
        type="button"
        onClick={goBackToTestsTab}
        className="text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        ← Quay lại khóa học
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">
          {test?.title || "Kết quả bài test"}
        </h1>

        <p className="text-sm text-slate-600 mb-4">
          Điểm:{" "}
          <span className="font-semibold text-emerald-700">
            {attempt.score}/{attempt.max_score}
          </span>
        </p>

        <p className="text-xs text-slate-500 mb-2">
          Bắt đầu:{" "}
          {attempt.started_at
            ? new Date(attempt.started_at).toLocaleString("vi-VN")
            : "—"}
        </p>

        <p className="text-xs text-slate-500 mb-4">
          Nộp bài:{" "}
          {attempt.submitted_at
            ? new Date(attempt.submitted_at).toLocaleString("vi-VN")
            : "—"}
        </p>

        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          Chi tiết câu hỏi
        </h2>

        {questions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Không có câu hỏi nào trong bài test này.
          </p>
        ) : (
          <ul className="space-y-3">
            {questions.map((q, idx) => (
              <li
                key={q.id}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/80"
              >
                <p className="text-xs font-medium text-slate-600 mb-1">
                  Câu {idx + 1}
                </p>
                <p className="text-sm text-slate-900 mb-2">{q.question_text}</p>

                <ul className="space-y-1 text-xs">
                  {(q.choices || []).map((c) => {
                    const isSelected = c.id === q.selected_choice_id;
                    const isCorrect = !!c.is_correct;

                    return (
                      <li
                        key={c.id}
                        className={
                          isCorrect
                            ? "text-emerald-700 font-medium"
                            : isSelected
                            ? "text-red-700 font-medium"
                            : "text-slate-600"
                        }
                      >
                        {c.choice_text}{" "}
                        {isCorrect ? "(đáp án đúng)" : isSelected ? "(bạn chọn)" : ""}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}