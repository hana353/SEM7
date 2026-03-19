import { Link } from "react-router-dom";
import SignupForm from "../components/SignupForm";

export default function Register() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-sky-50 via-white to-indigo-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-12 top-8 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute -right-8 bottom-4 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white/90 shadow-2xl ring-1 ring-white/60 backdrop-blur">
        <Link
          to="/"
          className="absolute right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-base font-semibold text-slate-600 transition hover:bg-slate-100"
          aria-label="Đóng"
        >
          ×
        </Link>

        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="bg-linear-to-br from-indigo-600 via-blue-600 to-cyan-500 p-8 text-white sm:p-10">
            <p className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              English Center
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              Bắt đầu hành trình học tiếng Anh
            </h1>
            <p className="mt-4 text-sm text-indigo-50 sm:text-base">
              Đăng ký nhanh để trải nghiệm lộ trình học cá nhân hoá và theo dõi kết quả của bạn.
            </p>
          </div>

          <div className="bg-slate-50 p-5 pt-14 sm:p-8 sm:pt-16">
            <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <Link
                to="/register"
                className="bg-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Đăng ký
              </Link>
              <Link
                to="/login"
                className="px-4 py-3 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Đăng nhập
              </Link>
            </div>

            <div className="flex justify-center">
              <SignupForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
