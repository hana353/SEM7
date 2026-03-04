import { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

const featuredCourses = [
  {
    id: 1,
    title: "IELTS Foundation 5.0+",
    level: "Intermediate",
    duration: "Lộ trình 12 tuần",
  },
  {
    id: 2,
    title: "Giao tiếp tiếng Anh cho người đi làm",
    level: "Beginner - Intermediate",
    duration: "Tối 2-4-6 / 3-5-7",
  },
  {
    id: 3,
    title: "Khóa phát âm & ngữ điệu chuẩn",
    level: "All levels",
    duration: "8 tuần tập trung",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      {/* sparkles background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="animate-pulse-slow absolute left-1/4 top-24 h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
        <div className="animate-pulse-slow absolute bottom-32 right-1/3 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]" />
        <div className="animate-pulse-slow absolute top-1/2 right-10 h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_18px_rgba(244,114,182,0.9)]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 lg:flex-row lg:items-stretch lg:py-16">
        {/* Left: Hero + courses */}
        <div className="flex-1 space-y-10">
          {/* Hero section */}
          <section className="space-y-6 rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-white/60 backdrop-blur">
            <span className="inline-flex items-center rounded-full bg-indigo-50/90 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
              Trung tâm tiếng Anh hiện đại
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Học mọi lúc, mọi nơi.{" "}
              <span className="text-indigo-600">Nâng tầm tương lai của bạn.</span>
            </h1>
            <p className="max-w-xl text-sm text-gray-600 sm:text-base">
              Lộ trình học cá nhân hoá giúp bạn tự tin giao tiếp, đạt mục tiêu IELTS
              và nâng cao cơ hội học tập, làm việc trong môi trường quốc tế.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-700">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-indigo-50 shadow-md shadow-indigo-300/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Hơn 50+ khoá học tiếng Anh
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-indigo-700 shadow-sm ring-1 ring-indigo-100/80">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Cam kết đầu ra & kiểm tra đầu vào miễn phí
              </div>
            </div>
          </section>

          {/* Featured courses */}
          <section className="space-y-4 rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-white/60 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Khoá học nổi bật
              </h2>
              <span className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700">
                Xem tất cả khoá học
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-sky-50 p-[1px] shadow-sm ring-1 ring-indigo-100/70 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-full rounded-[14px] bg-white/90 p-4">
                    <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
                      {course.title}
                    </h3>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700">
                        {course.level}
                      </span>
                      <span>•</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                        {course.duration}
                      </span>
                    </p>
                    <button className="mt-4 inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-700">
                      Xem chi tiết khoá học
                      <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Auth forms with tabs */}
        <AuthBox />
      </div>
    </div>
  );
}

function AuthBox() {
  const [mode, setMode] = useState("login");

  const isLogin = mode === "login";

  return (
    <aside className="w-full max-w-md self-center rounded-2xl bg-white/80 p-0 shadow-lg ring-1 ring-gray-100 backdrop-blur lg:self-stretch">
      {/* Tabs */}
      <div className="flex">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
            isLogin
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-transparent bg-transparent text-gray-500 hover:text-gray-700"
          } rounded-tl-2xl`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
            !isLogin
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-transparent bg-transparent text-gray-500 hover:text-gray-700"
          } rounded-tr-2xl`}
        >
          Đăng ký
        </button>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 pt-5">
        <h2 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">
          {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
        </h2>
        <p className="mb-6 text-xs text-gray-600 sm:text-sm">
          {isLogin
            ? "Nhập email và mật khẩu để truy cập khoá học của bạn."
            : "Điền thông tin bên dưới để bắt đầu hành trình học tiếng Anh."}
        </p>

        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>
    </aside>
  );
}
