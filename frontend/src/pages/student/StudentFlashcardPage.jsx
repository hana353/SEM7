import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";

export default function StudentFlashcardPage() {
  const { setId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  const goBackToFlashcardList = () => {
    const courseId = location.state?.courseId || setData?.course_id || null;

    navigate("/studenthomepage", {
      replace: true,
      state: {
        section: "myCourses",
        selectedCourseId: courseId,
        activeTab: "flashcards",
      },
    });
  };

  const next = () => {
    setShowBack(false);

    if (currentIndex + 1 >= cards.length) {
      goBackToFlashcardList();
      return;
    }

    setCurrentIndex((i) => i + 1);
  };

  const prev = () => {
    if (currentIndex === 0) return;
    setShowBack(false);
    setCurrentIndex((i) => i - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-6">
        <div className="rounded-2xl bg-white/80 border border-slate-200 shadow-lg px-8 py-6 text-slate-600">
          Đang tải flashcard...
        </div>
      </div>
    );
  }

  if (error || !setData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center px-6">
        <div className="rounded-2xl bg-white border border-red-200 shadow-lg px-8 py-6 text-red-500 font-medium">
          {error || "Flashcard không tồn tại"}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-6">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-lg px-8 py-6 text-slate-500">
          Bộ flashcard chưa có thẻ.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={goBackToFlashcardList}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          ← Quay lại
        </button>

        <div className="mb-6 rounded-3xl bg-white/80 border border-slate-200 shadow-sm p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {setData.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Chạm vào thẻ để lật mặt trước / mặt sau
              </p>
            </div>

            <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 w-fit">
              {currentIndex + 1} / {cards.length}
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="[perspective:1200px]">
          <div
            onClick={() => setShowBack((v) => !v)}
            className={`relative min-h-[380px] w-full rounded-3xl cursor-pointer transition-transform duration-500 [transform-style:preserve-3d] ${
              showBack ? "rotate-y-180" : ""
            }`}
          >
            <div className="absolute inset-0 rounded-3xl bg-white border border-slate-200 shadow-xl p-8 backface-hidden flex flex-col justify-between">
              <div>
                <span className="inline-block rounded-full bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 mb-4">
                  Mặt trước
                </span>

                <div className="flex items-center justify-center min-h-[220px]">
                  <p className="text-2xl font-semibold text-slate-900 text-center leading-relaxed break-words">
                    {current.front_text}
                  </p>
                </div>
              </div>

              <p className="text-center text-sm text-slate-400">
                Chạm vào thẻ để lật
              </p>
            </div>

            <div className="absolute inset-0 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl p-8 rotate-y-180 backface-hidden flex flex-col justify-between">
              <div>
                <span className="inline-block rounded-full bg-white/10 text-white text-xs font-semibold px-3 py-1 mb-4">
                  Mặt sau
                </span>

                <div className="flex items-center justify-center min-h-[220px]">
                  <p className="text-2xl font-semibold text-center leading-relaxed break-words">
                    {current.back_text}
                  </p>
                </div>
              </div>

              <p className="text-center text-sm text-slate-300">
                Chạm lần nữa để quay lại
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={prev}
            disabled={currentIndex === 0}
            className="py-3 rounded-2xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Thẻ trước
          </button>

          <button
            type="button"
            onClick={next}
            className="py-3 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-lg"
          >
            {currentIndex + 1 >= cards.length ? "Kết thúc" : "Thẻ tiếp theo →"}
          </button>
        </div>
      </div>
    </div>
  );
}