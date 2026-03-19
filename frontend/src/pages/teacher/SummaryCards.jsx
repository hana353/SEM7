import React from "react";

function SummaryCards({ totalCourses = 0, stats = {} }) {
  const items = [
    {
      label: "Khóa học được gán",
      value: totalCourses,
      note: "Admin tạo và gán cho bạn.",
      cardClass: "border-emerald-200 bg-linear-to-br from-emerald-100 via-emerald-50 to-teal-100",
      valueClass: "text-emerald-700",
    },
    {
      label: "Học viên đang học",
      value: Number(stats.activeStudents ?? 0),
      note: "Tổng số học viên trên tất cả khóa.",
      cardClass: "border-sky-200 bg-linear-to-br from-sky-100 via-cyan-50 to-blue-100",
      valueClass: "text-sky-700",
    },
    {
      label: "Doanh thu",
      value: `${Number(stats.totalRevenue ?? 0).toLocaleString("vi-VN")}đ`,
      note: "Từ các giao dịch thanh toán thành công.",
      cardClass: "border-rose-200 bg-linear-to-br from-rose-100 via-rose-50 to-amber-100",
      valueClass: "text-rose-700",
    },
    {
      label: "Khóa đang dạy",
      value: Number(stats.activeTeachingCourses ?? 0),
      note: "Không tính khóa hết hạn và draft.",
      cardClass: "border-indigo-200 bg-linear-to-br from-indigo-100 via-indigo-50 to-cyan-100",
      valueClass: "text-indigo-700",
    },
    {
      label: "Khóa hết hạn",
      value: Number(stats.expiredCourses ?? 0),
      note: "Dựa trên thời gian kết thúc khóa học.",
      cardClass: "border-orange-200 bg-linear-to-br from-orange-100 via-amber-50 to-yellow-100",
      valueClass: "text-orange-700",
    },
    {
      label: "Tổng bài giảng",
      value: Number(stats.totalLectures ?? 0),
      note: "Tổng bài giảng của các khóa bạn phụ trách.",
      cardClass: "border-violet-200 bg-linear-to-br from-violet-100 via-fuchsia-50 to-purple-100",
      valueClass: "text-violet-700",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className={`rounded-2xl border p-4 shadow-sm ${item.cardClass}`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {item.label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${item.valueClass}`}>
            {item.value}
          </p>
          <p className="mt-2 text-xs text-slate-600">{item.note}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;

