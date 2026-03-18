import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function StudentFlashcardPage() {
  const { setId } = useParams();
  const navigate = useNavigate();

  const [setData, setSetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    api
      .get(`/flashcards/${setId}`)
      .then((r) => setSetData(r.data?.data))
      .catch(() => setError("Không tải được flashcard"))
      .finally(() => setLoading(false));
  }, [setId]);

  const cards = useMemo(() => setData?.cards || [], [setData]);
  const current = cards[currentIndex];

  const next = () => {
    setShowBack(false);
    if (currentIndex + 1 >= cards.length) return navigate(-1);
    setCurrentIndex((i) => i + 1);
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Đang tải...</div>;
  if (error || !setData) return <div className="p-6 text-center text-red-500">{error || "Flashcard không tồn tại"}</div>;
  if (cards.length === 0) return <div className="p-6 text-center text-slate-500">Bộ flashcard chưa có thẻ.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 max-w-2xl mx-auto">
      <button type="button" onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 mb-4">
        ← Quay lại
      </button>
      <h1 className="text-xl font-semibold text-slate-900 mb-2">{setData.title}</h1>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Thẻ {currentIndex + 1} / {cards.length}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${(currentIndex + 1) / cards.length * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <p className="text-xs text-slate-500 mb-2">{showBack ? "Mặt sau" : "Mặt trước"}</p>
        <p className="text-lg font-medium text-slate-900 mb-6">
          {showBack ? current.back_text : current.front_text}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowBack((v) => !v)}
            className="flex-1 py-2 rounded-lg border border-slate-300 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            {showBack ? "Xem mặt trước" : "Lật thẻ"}
          </button>
          <button
            type="button"
            onClick={next}
            className="flex-1 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
          >
            {currentIndex + 1 >= cards.length ? "Kết thúc" : "Thẻ tiếp theo →"}
          </button>
        </div>
      </div>
    </div>
  );
}

