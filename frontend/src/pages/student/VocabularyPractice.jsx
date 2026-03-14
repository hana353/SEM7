import { useEffect, useMemo, useState, useRef } from "react";
import api from "../../api/axios";

const COLORS = ["#22c55e", "#eab308", "#ef4444", "#3b82f6", "#a855f7", "#ec4899", "#f97316"];

function ConfettiCanvas({ active, durationMs = 3000 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);
    const count = 120;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 12 - 6,
        size: Math.random() * 8 + 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    particlesRef.current = particles;
    startRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      if (elapsed >= durationMs) return;
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.rotationSpeed;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, durationMs]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;
  return new SpeechRecognition();
};

const VocabularyPractice = () => {
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [words, setWords] = useState([]);
  const [loadingWords, setLoadingWords] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState(() => !!getSpeechRecognition());
  const [lastResult, setLastResult] = useState("");
  const [status, setStatus] = useState("");
  const [remindWords, setRemindWords] = useState([]);
  const [loadingRemind, setLoadingRemind] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    setLoadingTopics(true);
    api
      .get("/vocabulary/topics")
      .then(res => setTopics(res.data?.data || []))
      .catch(() => setTopics([]))
      .finally(() => setLoadingTopics(false));
  }, []);

  useEffect(() => {
    if (!selectedTopicId) return;
    setLoadingWords(true);
    api
      .get(`/vocabulary/topics/${selectedTopicId}/words`)
      .then(res => {
        const data = res.data?.data || [];
        setWords(data);
        setCurrentIndex(0);
      })
      .catch(() => {
        setWords([]);
        setCurrentIndex(0);
      })
      .finally(() => setLoadingWords(false));
  }, [selectedTopicId]);

  const currentWord = useMemo(
    () => (words.length > 0 ? words[currentIndex] : null),
    [words, currentIndex]
  );

  const handleNext = () => {
    if (words.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % words.length);
    setStatus("");
    setLastResult("");
  };

  const handlePrev = () => {
    if (words.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + words.length) % words.length);
    setStatus("");
    setLastResult("");
  };

  const startListening = () => {
    if (!speechSupported || !currentWord) return;
    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("Đang nghe... hãy đọc từ tiếng Anh hiển thị.");
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setStatus(`Lỗi khi ghi âm: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setLastResult(transcript);

      const spoken = transcript.toLowerCase();
      const target = (currentWord.word || "").trim().toLowerCase();
      const passed = spoken === target;
      setStatus(
        passed
          ? "Chính xác! Bạn đã đọc đúng, chuyển sang từ tiếp theo."
          : "Chưa chính xác, hãy thử lại."
      );

      const accuracyPercent = passed ? 100 : 0;
      try {
        await api.post("/vocabulary/practice", {
          vocabularyId: currentWord.id,
          spokenText: transcript,
          accuracyPercent,
        });
      } catch {
        // ignore logging error on client
      }

      if (passed) {
        const isLastWord = currentIndex === words.length - 1;
        if (isLastWord) {
          setTimeout(() => {
            setShowCongrats(true);
            setTimeout(() => {
              setShowCongrats(false);
              handleNext();
            }, 3000);
          }, 2500);
        } else {
          setTimeout(() => {
            handleNext();
          }, 2500);
        }
      }
    };

    recognition.start();
  };

  const fetchRemindWords = () => {
    setLoadingRemind(true);
    api
      .get("/vocabulary/remind?limit=20")
      .then(res => setRemindWords(res.data?.data || []))
      .catch(() => setRemindWords([]))
      .finally(() => setLoadingRemind(false));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto relative">
      <ConfettiCanvas active={showCongrats} durationMs={3000} />
      {showCongrats && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">🎉 Chúc mừng!</p>
            <p className="text-lg text-gray-700">Bạn đã hoàn thành luyện từ vựng chủ đề này.</p>
            <p className="text-sm text-gray-500 mt-2">Hiệu ứng pháo sẽ kết thúc sau 3 giây...</p>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4">Luyện từ vựng (Free)</h1>
      <p className="text-gray-600 mb-6">
        Sau khi đăng ký, bạn có thể học các bộ từ vựng miễn phí do admin tạo,
        xem nghĩa, ví dụ, và luyện phát âm bằng voice-to-text.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Chọn chủ đề từ vựng
          </h2>
          {loadingTopics ? (
            <p className="text-sm text-gray-500">Đang tải chủ đề...</p>
          ) : topics.length === 0 ? (
            <p className="text-sm text-gray-500">
              Chưa có bộ từ vựng free. Vui lòng liên hệ admin.
            </p>
          ) : (
            <ul className="space-y-1 max-h-72 overflow-y-auto text-sm">
              {topics.map((t) => {
                const isActive = selectedTopicId === t.id;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedTopicId(t.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs ${
                        isActive
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-medium">{t.title}</div>
                      <div className="text-[11px] text-gray-500">
                        {t.words_count ?? 0} từ
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 border-t pt-3">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">
              Ôn lại từ khó (Remind)
            </h3>
            <button
              type="button"
              onClick={fetchRemindWords}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"
            >
              Lấy danh sách cần ôn
            </button>
            <div className="mt-2 max-h-40 overflow-y-auto text-xs text-gray-700 space-y-1">
              {loadingRemind ? (
                <p className="text-gray-500">Đang tải...</p>
              ) : remindWords.length === 0 ? (
                <p className="text-gray-400">
                  Chưa có gợi ý ôn tập. Hãy luyện phát âm để hệ thống ghi nhận.
                </p>
              ) : (
                remindWords.map((w) => (
                  <div key={w.id}>
                    <span className="font-semibold">{w.word}</span>
                    {w.accuracy_percent != null && (
                      <span className="ml-1 text-[11px] text-gray-500">
                        ({Number(w.accuracy_percent).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        <section className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[220px] flex flex-col justify-between">
            {loadingWords ? (
              <p className="text-sm text-gray-500">Đang tải danh sách từ...</p>
            ) : !selectedTopicId ? (
              <p className="text-sm text-gray-500">
                Hãy chọn một chủ đề ở bên trái để bắt đầu học.
              </p>
            ) : words.length === 0 ? (
              <p className="text-sm text-gray-500">
                Chủ đề này chưa có từ vựng. Vui lòng chọn chủ đề khác hoặc chờ
                admin thêm từ.
              </p>
            ) : currentWord ? (
              <>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Thẻ {currentIndex + 1} / {words.length}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${words.length ? ((currentIndex + 1) / words.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {currentWord.word}
                  </h2>
                  {currentWord.meaning && (
                    <p className="text-lg text-gray-700 mb-1">
                      Nghĩa: {currentWord.meaning}
                    </p>
                  )}
                  {currentWord.example_sentence && (
                    <p className="text-sm text-gray-600 italic">
                      Ví dụ: {currentWord.example_sentence}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      ← Trước
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Tiếp theo →
                    </button>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    Hãy đọc to từ tiếng Anh, hệ thống sẽ so sánh giọng nói với
                    từ hiển thị.
                  </div>
                </div>
              </>
            ) : null}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700">
                Luyện phát âm (voice-to-text)
              </p>
              {!speechSupported && (
                <p className="text-xs text-red-500 mt-1">
                  Trình duyệt của bạn chưa hỗ trợ Web Speech API. Bạn có thể mô
                  tả luồng này trong báo cáo, hoặc tích hợp API ngoài (Google
                  Cloud Speech, Azure...) ở backend.
                </p>
              )}
              {speechSupported && (
                <>
                  <p className="text-xs text-gray-500 mt-1">
                    Nhấn nút &quot;Bắt đầu đọc&quot;, cho phép quyền microphone
                    và đọc to từ vựng.
                  </p>
                  {lastResult && (
                    <p className="text-xs text-gray-600 mt-1">
                      Bạn đã đọc:{" "}
                      <span className="font-mono bg-gray-100 px-1 rounded">
                        {lastResult}
                      </span>
                    </p>
                  )}
                  {status && (
                    <p
                      className={`text-sm mt-2 font-semibold px-3 py-2 rounded-lg ${
                        status.startsWith("Chính xác")
                          ? "bg-green-500 text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {status}
                    </p>
                  )}
                </>
              )}
            </div>

            <button
              type="button"
              disabled={!speechSupported || !currentWord || isListening}
              onClick={startListening}
              className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm ${
                !speechSupported || !currentWord
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : isListening
                    ? "bg-red-500 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              {!speechSupported
                ? "Không hỗ trợ voice-to-text"
                : !currentWord
                  ? "Chọn chủ đề & từ"
                  : isListening
                    ? "Đang nghe..."
                    : "Bắt đầu đọc"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default VocabularyPractice;