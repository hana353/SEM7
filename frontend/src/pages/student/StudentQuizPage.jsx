import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function StudentQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    api
      .get(`/quizzes/${quizId}`)
      .then((r) => setQuiz(r.data?.data))
      .catch(() => setError("Không tải được quiz"))
      .finally(() => setLoading(false));
  }, [quizId]);

  const cards = useMemo(() => quiz?.cards || [], [quiz]);
  const currentCard = cards[currentIndex];

  const choices = useMemo(() => {
    if (!currentCard) return [];
    const correct = currentCard.back_text?.trim();
    const wrongStr = currentCard.back_image_url || "";
    const wrongs = wrongStr.split("||").map((s) => s.trim()).filter(Boolean);
    const all = [correct, ...wrongs].filter(Boolean);
    return [...new Set(all)].sort(() => Math.random() - 0.5).map((text, i) => ({ id: String(i), text, isCorrect: text === correct }));
  }, [currentCard]);

  const handleAnswer = (choice) => {
    if (showResult) return;
    setSelectedId(choice.id);
    setShowResult(true);
    if (choice.isCorrect) setCorrectCount((c) => c + 1);
  };

  const handleNext = () => {
    setSelectedId(null);
    setShowResult(false);
    if (currentIndex + 1 >= cards.length) {
      navigate(-1);
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Đang tải...</div>;
  if (error || !quiz) return <div className="p-6 text-center text-red-500">{error || "Quiz không tồn tại"}</div>;
  if (cards.length === 0) return <div className="p-6 text-center text-slate-500">Quiz chưa có câu hỏi.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-2xl mx-auto">
      <button type="button" onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 mb-4">
        ← Quay lại
      </button>
      <h1 className="text-xl font-semibold text-slate-900 mb-2">{quiz.title}</h1>
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Câu {currentIndex + 1} / {cards.length}</span>
          <span>Đúng: {correctCount}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${(currentIndex + 1) / cards.length * 100}%` }}
          />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <p className="text-lg font-medium text-slate-900 mb-4">{currentCard.front_text}</p>
        <ul className="space-y-2">
          {choices.map((choice) => (
            <li key={choice.id}>
              <button
                type="button"
                onClick={() => handleAnswer(choice)}
                disabled={showResult}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition ${
                  !showResult
                    ? "border-slate-300 hover:bg-slate-50"
                    : choice.id === selectedId
                      ? choice.isCorrect
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-red-500 bg-red-50 text-red-800"
                      : choice.isCorrect && showResult
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {choice.text}
                {showResult && choice.isCorrect && " ✓"}
              </button>
            </li>
          ))}
        </ul>
        {showResult && (
          <button
            type="button"
            onClick={handleNext}
            className="mt-4 w-full py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            {currentIndex + 1 >= cards.length ? "Kết thúc quiz" : "Câu tiếp theo →"}
          </button>
        )}
      </div>
    </div>
  );
}
