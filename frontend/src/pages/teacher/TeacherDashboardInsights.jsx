import React, { useMemo } from "react";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function RevenueBarChart({ data = [] }) {
  const maxRevenue = useMemo(() => {
    const values = data.map((item) => Number(item.revenue || 0));
    const candidate = Math.max(...values, 0);
    return candidate > 0 ? candidate : 1;
  }, [data]);

  return (
    <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Doanh thu 6 tháng gần nhất</h3>
        <p className="text-[11px] text-slate-500">Đơn vị: VND</p>
      </div>
      <div className="grid h-52 grid-cols-6 items-end gap-3">
        {data.map((item) => {
          const ratio = Math.max(8, Math.round((Number(item.revenue || 0) / maxRevenue) * 100));
          return (
            <div key={item.month_key} className="flex h-full flex-col items-center justify-end gap-2">
              <div className="group relative flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-linear-to-t from-rose-500 to-amber-400 transition-all duration-500 group-hover:from-rose-600 group-hover:to-amber-500"
                  style={{ height: `${ratio}%` }}
                  title={`${item.label}: ${formatCurrency(item.revenue)}đ`}
                />
              </div>
              <p className="text-[10px] font-medium text-slate-500">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CourseStatusChart({ activeTeachingCourses = 0, expiredCourses = 0, draftCourses = 0 }) {
  const total = activeTeachingCourses + expiredCourses + draftCourses;

  const parts = [
    {
      key: "active",
      label: "Đang dạy",
      value: activeTeachingCourses,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
    },
    {
      key: "expired",
      label: "Đã hết hạn",
      value: expiredCourses,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      key: "draft",
      label: "Bản nháp",
      value: draftCourses,
      color: "bg-sky-500",
      textColor: "text-sky-600",
    },
  ];

  const ratio = (value) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Trạng thái khóa học</h3>

      <div className="space-y-3">
        {parts.map((part) => (
          <div key={part.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{part.label}</span>
              <span className={`font-semibold ${part.textColor}`}>
                {part.value} ({ratio(part.value)}%)
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${part.color}`}
                style={{ width: `${ratio(part.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-slate-500">Tổng số khóa: {total}</p>
    </div>
  );
}

function LectureByCourseChart({ data = [] }) {
  const maxLectures = useMemo(() => {
    const values = data.map((item) => Number(item.lecture_count || 0));
    const candidate = Math.max(...values, 0);
    return candidate > 0 ? candidate : 1;
  }, [data]);

  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Bài giảng theo khóa</h3>
        <p className="text-[11px] text-slate-500">Top 6 khóa</p>
      </div>

      {data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
          Chưa có dữ liệu bài giảng.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const width = Math.max(
              8,
              Math.round((Number(item.lecture_count || 0) / maxLectures) * 100)
            );

            return (
              <div key={item.course_id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <p className="truncate text-slate-700">{item.title || "Khóa học"}</p>
                  <p className="font-semibold text-indigo-600">{item.lecture_count}</p>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TeacherDashboardInsights({ stats = {} }) {
  const revenueByMonth = Array.isArray(stats.revenueByMonth) ? stats.revenueByMonth : [];
  const lectureByCourse = Array.isArray(stats.lectureByCourse) ? stats.lectureByCourse : [];

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <div className="xl:col-span-7">
        <RevenueBarChart data={revenueByMonth} />
      </div>
      <div className="space-y-4 xl:col-span-5">
        <CourseStatusChart
          activeTeachingCourses={Number(stats.activeTeachingCourses || 0)}
          expiredCourses={Number(stats.expiredCourses || 0)}
          draftCourses={Number(stats.draftCourses || 0)}
        />
        <LectureByCourseChart data={lectureByCourse} />
      </div>
    </div>
  );
}
