import { useEffect } from "react";
import LoginForm from "../LoginForm";
import SignupForm from "../SignupForm";

export default function AuthModal({
  open,
  mode,
  onClose,
  onModeChange,
  onLoginSuccess,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = event => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Đăng nhập và đăng ký"
      onClick={onClose}
    >
      <div
        className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white/90 shadow-2xl ring-1 ring-white/60"
        onClick={event => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base font-semibold text-slate-600 transition hover:bg-slate-100"
          aria-label="Đóng"
          onClick={onClose}
        >
          ×
        </button>

        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white sm:p-10">
            <p className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              English Center
            </p>
            <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
              {mode === "login"
                ? "Chào mừng bạn quay trở lại"
                : "Bắt đầu hành trình học tiếng Anh"}
            </h2>
            <p className="mt-4 text-sm text-indigo-50 sm:text-base">
              {mode === "login"
                ? "Đăng nhập để tiếp tục khóa học, theo dõi tiến độ và luyện tập mỗi ngày."
                : "Đăng ký nhanh để trải nghiệm lộ trình học cá nhân hoá và theo dõi kết quả của bạn."}
            </p>
          </div>

          <div className="bg-slate-50 p-5 pt-14 sm:p-8 sm:pt-16">
            <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => onModeChange("register")}
                className={`px-4 py-3 text-center text-sm font-semibold transition ${
                  mode === "register"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Đăng ký
              </button>
              <button
                type="button"
                onClick={() => onModeChange("login")}
                className={`px-4 py-3 text-center text-sm font-semibold transition ${
                  mode === "login"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Đăng nhập
              </button>
            </div>

            <div className="flex justify-center">
              {mode === "login" ? (
                <LoginForm onSuccess={onLoginSuccess || onClose} />
              ) : (
                <SignupForm onVerified={onClose} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}