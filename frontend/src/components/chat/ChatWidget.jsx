import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { getRoleCode, isAuthenticated } from "../../auth/session";

const QUICK_ACTIONS = [
  "Khóa nào phù hợp cho người mới bắt đầu?",
  "Học phí các khóa ra sao?",
  "Mình muốn học IELTS thì nên chọn khóa nào?",
];

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("vi-VN")} VND`;
}

export default function ChatWidget({ onRequireAuth }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchaseLoadingCourseId, setPurchaseLoadingCourseId] = useState("");
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Xin chào, mình là trợ lý tư vấn khóa học. Bạn có thể hỏi về khóa học phù hợp, học phí hoặc mục tiêu học của bạn.",
      suggestedCourses: [],
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function sendMessage(rawMessage) {
    const message = String(rawMessage || input).trim();
    if (!message || loading) return;

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      suggestedCourses: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat/message", { message });
      const data = res.data?.data;

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data?.answer || "Mình chưa thể phản hồi lúc này.",
          suggestedCourses: Array.isArray(data?.suggestedCourses)
            ? data.suggestedCourses
            : [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Có lỗi xảy ra khi tư vấn. Bạn thử lại sau nhé.",
          suggestedCourses: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyNow(course) {
    const courseId = course?.id;
    if (!courseId || purchaseLoadingCourseId) return;

    if (!isAuthenticated()) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Bạn cần đăng nhập tài khoản học viên trước khi thanh toán.",
          suggestedCourses: [],
        },
      ]);
      onRequireAuth?.("login");
      return;
    }

    const roleCode = getRoleCode();
    if (roleCode !== "STUDENT") {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Tính năng thanh toán chỉ dành cho tài khoản học viên.",
          suggestedCourses: [],
        },
      ]);
      return;
    }

    setPurchaseLoadingCourseId(courseId);

    try {
      const res = await api.post("/payments/create", {
        course_id: courseId,
      });

      const paymentUrl = res.data?.data?.payment_url;
      const enrolled = res.data?.data?.enrolled;

      if (enrolled) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              res.data?.message ||
              "Khóa học miễn phí đã được đăng ký thành công cho bạn.",
            suggestedCourses: [],
          },
        ]);
        return;
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            res.data?.message ||
            "Không tạo được link thanh toán. Bạn vui lòng thử lại sau.",
          suggestedCourses: [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error.response?.data?.message ||
            "Không thể xử lý thanh toán lúc này. Bạn thử lại sau nhé.",
          suggestedCourses: [],
        },
      ]);
    } finally {
      setPurchaseLoadingCourseId("");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700"
      >
        {isOpen ? "Đóng tư vấn" : "Tư vấn khóa học"}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[70vh] w-[420px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Chatbox tư vấn khóa học
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Gợi ý khóa học, học phí và lộ trình phù hợp cho bạn.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendMessage(item)}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs text-indigo-700 transition hover:bg-indigo-100"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    <p>{message.content}</p>

                    {message.suggestedCourses?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.suggestedCourses.map((course) => (
                          <div
                            key={course.id}
                            className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700"
                          >
                            <div className="text-sm font-semibold text-slate-900">
                              {course.title}
                            </div>

                            <div className="mt-1 text-xs text-slate-500">
                              {formatPrice(course.price)} •{" "}
                              {Number(course.total_duration_minutes || 0)} phút
                            </div>

                            {course.description && (
                              <div className="mt-2 line-clamp-3 text-xs text-slate-600">
                                {course.description}
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => handleBuyNow(course)}
                              disabled={Boolean(purchaseLoadingCourseId)}
                              className="mt-3 inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {purchaseLoadingCourseId === course.id
                                ? "Đang chuyển thanh toán..."
                                : "Mua ngay"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <p className="text-xs text-slate-400">Đang soạn câu trả lời...</p>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}