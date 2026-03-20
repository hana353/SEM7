import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { isAuthenticated } from "../auth/session";

export default function Home({ onOpenAuthModal }) {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    api.get("/courses")
      .then(res => setFeaturedCourses(Array.isArray(res.data) ? res.data.slice(0, 6) : []))
      .catch(() => setFeaturedCourses([]));
  }, []);

  const steps = [
    {
      title: "Kiểm tra đầu vào",
      desc: "Đánh giá trình độ miễn phí để bắt đầu đúng lộ trình.",
      icon: (
        <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 21h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "Lộ trình cá nhân",
      desc: "Thiết kế theo mục tiêu: giao tiếp, IELTS, TOEIC hoặc học thuật.",
      icon: (
        <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2l3 6 6 .5-4.5 3.5L18 20l-6-3-6 3 .5-7L2 8.5 8 8 12 2z" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "Học & luyện tập",
      desc: "Bài giảng tương tác, bài tập thực hành và lớp luyện nói.",
      icon: (
        <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 7v10a2 2 0 0 0 2 2h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 7a2 2 0 0 0-2-2H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "Đánh giá tiến độ",
      desc: "Kiểm tra định kỳ, phản hồi chi tiết và điều chỉnh lộ trình.",
      icon: (
        <svg className="h-6 w-6 text-sky-600" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 12h3l3 8 4-16 3 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      title: "Đạt chứng chỉ",
      desc: "Chuẩn bị thi, nhận chứng chỉ và mở rộng cơ hội học tập/việc làm.",
      icon: (
        <svg className="h-6 w-6 text-fuchsia-600" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 12a5 5 0 0 0 10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 21l5-3 5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const courseGradients = [
    "from-indigo-50 to-indigo-100 border-indigo-200",
    "from-emerald-50 to-emerald-100 border-emerald-200",
    "from-amber-50 to-amber-100 border-amber-200",
    "from-sky-50 to-sky-100 border-sky-200",
    "from-fuchsia-50 to-fuchsia-100 border-fuchsia-200",
    "from-rose-50 to-rose-100 border-rose-200"
  ];

  const courseAccents = [
    "text-indigo-700 bg-indigo-100/80 ring-indigo-200",
    "text-emerald-700 bg-emerald-100/80 ring-emerald-200",
    "text-amber-700 bg-amber-100/80 ring-amber-200",
    "text-sky-700 bg-sky-100/80 ring-sky-200",
    "text-fuchsia-700 bg-fuchsia-100/80 ring-fuchsia-200",
    "text-rose-700 bg-rose-100/80 ring-rose-200"
  ];

  const formatVnd = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }).format(value);

  const handleBuyNow = (courseId) => {
    if (!courseId) return;

    if (!isAuthenticated()) {
      onOpenAuthModal?.("login", {
        pendingPurchase: {
          courseId,
          source: "home",
        },
      });
      return;
    }

    navigate(`/courses?focusCourse=${encodeURIComponent(courseId)}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-sky-50 via-sky-100 to-white">
      {/* decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="animate-pulse-slow absolute left-1/4 top-24 h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
        <div className="animate-pulse-slow absolute bottom-32 right-1/3 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)]" />
        <div className="animate-pulse-slow absolute top-1/2 right-10 h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_18px_rgba(244,114,182,0.9)]" />
      </div>

      <Header onOpenAuthModal={onOpenAuthModal} />

      <main className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 pt-4 pb-10 lg:pt-6 lg:pb-14">
        <section className="space-y-6 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-white/60 backdrop-blur sm:p-8">
          <span className="inline-flex items-center rounded-full bg-indigo-50/90 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-100">
            Trung tâm tiếng Anh hiện đại
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Học mọi lúc, mọi nơi.{" "}
            <span className="text-indigo-600">Nâng tầm tương lai của bạn.</span>
          </h1>
          <p className="max-w-2xl text-sm text-gray-600 sm:text-base">
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

        <section className="space-y-4 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-white/60 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Khoá học nổi bật</h2>
            <Link to="/courses" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              Xem tất cả khoá học
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.length === 0 ? (
              <p className="col-span-full py-6 text-center text-sm text-gray-500">Đang tải khóa học...</p>
            ) : (
              featuredCourses.map((course, i) => {
                const grad = courseGradients[i % courseGradients.length];
                const accent = courseAccents[i % courseAccents.length];
                const salePrice = Number(course.sale_price ?? course.discount_price ?? course.price ?? 0);
                const originalPrice = Number(course.original_price ?? 0);
                const finalPrice = salePrice > 0 ? salePrice : originalPrice;
                const hasDiscount = originalPrice > finalPrice;
                const isFree = finalPrice === 0;
                return (
                  <article
                    key={course.id}
                    className={`group rounded-2xl bg-linear-to-br p-px shadow-sm ring-1 transition hover:-translate-y-1 hover:shadow-md ${grad}`}
                  >
                    <div className="h-full rounded-[14px] bg-white/95 p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 shrink-0 rounded-lg shadow-inner flex items-center justify-center ring-1 ${accent}`}>
                            <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 sm:text-base">{course.title}</h3>
                            <p className="mt-1 text-xs text-gray-500">{course.short_description || course.subtitle || "Khóa học chất lượng, lộ trình rõ ràng."}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-500">{course.level || "All levels"}</div>
                          <div className="mt-1 text-xs text-emerald-700 font-semibold">{Number(course.total_duration_minutes || 0)} phút</div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between rounded-xl bg-linear-to-r from-slate-50 to-white p-3 ring-1 ring-slate-100">
                        <div>
                          <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Học phí</div>
                          <div className="text-base font-bold text-rose-600 sm:text-lg">
                            {isFree ? "Miễn phí" : formatVnd(finalPrice)}
                          </div>
                          {hasDiscount && (
                            <div className="text-xs text-gray-400 line-through">{formatVnd(originalPrice)}</div>
                          )}
                        </div>
                        {hasDiscount && (
                          <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700">
                            -{Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}%
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className={`rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${accent}`}>
                            {course.status || "PUBLISHED"}
                          </span>
                          {course.teacher_name && <span>• {course.teacher_name}</span>}
                        </div>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <Link
                          to="/courses"
                          className="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                        >
                          Xem chi tiết
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleBuyNow(course.id)}
                          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isFree
                            ? "Đăng ký miễn phí"
                            : "Mua ngay"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* Timeline Stepper Section vertical */}
        <section id="dich-vu" className="relative space-y-4 overflow-hidden rounded-3xl bg-linear-to-br from-cyan-50/95 via-white to-indigo-50/90 p-6 shadow-lg ring-1 ring-cyan-100/70 backdrop-blur">
          <div className="pointer-events-none absolute -right-12 -top-10 h-36 w-36 rounded-full bg-cyan-200/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-6 h-32 w-32 rounded-full bg-indigo-200/35 blur-2xl" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Lộ trình học tập</h2>
            <p className="text-sm text-gray-600">Theo dõi tiến trình của bạn theo từng bước rõ ràng.</p>
          </div>

          <div className="relative mt-4">
            <VerticalTimeline steps={steps} />
          </div>
        </section>
      </main>

      <Footer onOpenAuthModal={onOpenAuthModal} />

    </div>
  );
}

/* VerticalTimeline: always vertical connectors with gradient line and icons */
function VerticalTimeline({ steps }) {
  const iconWrapStyles = [
    "from-indigo-500 to-cyan-400 shadow-indigo-200/60",
    "from-emerald-500 to-teal-400 shadow-emerald-200/60",
    "from-amber-500 to-orange-400 shadow-amber-200/60",
    "from-sky-500 to-blue-400 shadow-sky-200/60",
    "from-fuchsia-500 to-rose-400 shadow-fuchsia-200/60",
  ];

  const cardStyles = [
    "bg-linear-to-br from-indigo-50/80 to-white ring-indigo-100/80",
    "bg-linear-to-br from-emerald-50/80 to-white ring-emerald-100/80",
    "bg-linear-to-br from-amber-50/80 to-white ring-amber-100/80",
    "bg-linear-to-br from-sky-50/80 to-white ring-sky-100/80",
    "bg-linear-to-br from-fuchsia-50/80 to-white ring-fuchsia-100/80",
  ];

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column: timeline visual (icons + vertical line) */}
          <div className="relative flex md:w-1/4 w-full items-start md:items-stretch">
            {/* vertical gradient line */}
            <div className="absolute left-8 top-6 bottom-6 hidden md:block">
              <div className="h-full w-1 rounded bg-linear-to-b from-indigo-200 via-cyan-200 to-emerald-200" />
            </div>

            <div className="flex flex-col gap-6 w-full md:w-auto">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start md:items-center gap-4">
                  <div className="relative z-10">
                    <div className="group flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100 transition duration-300 hover:scale-105 hover:shadow-lg">
                      <div className={`h-10 w-10 flex items-center justify-center rounded-full bg-linear-to-br text-white shadow-md transition duration-300 group-hover:rotate-6 ${iconWrapStyles[idx % iconWrapStyles.length]}`}>
                        {step.icon}
                      </div>
                    </div>
                    {/* small connector dot for mobile between icons */}
                    {idx < steps.length - 1 && (
                      <div className="md:hidden mt-2 h-8 w-px">
                        <div className="h-full w-full bg-linear-to-b from-indigo-200 via-indigo-100 to-white rounded" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: step content */}
          <div className="md:w-3/4 w-full">
            <div className="flex flex-col gap-6">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="hidden md:block w-8" /> {/* spacer aligning with icons */}
                  <div className={`group flex-1 rounded-xl p-4 shadow-sm ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${cardStyles[idx % cardStyles.length]}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-white/70">
                          Bước {idx + 1}
                        </div>
                        <h3 className="mt-2 text-sm font-semibold text-gray-900 transition group-hover:text-indigo-700">{step.title}</h3>
                        <p className="mt-1 text-xs text-gray-600">{step.desc}</p>
                      </div>
                      <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100">
                        Đang mở
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: central vertical line behind icons */}
        <div className="md:hidden absolute left-10 top-0 bottom-0">
          <div className="h-full w-px bg-linear-to-b from-indigo-200 via-indigo-100 to-white" />
        </div>
      </div>
    </div>
  );
}

