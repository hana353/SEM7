import React from "react";

function SummaryCards({ totalCourses = 0, stats = {} }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa học được gán</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {totalCourses}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Admin tạo và gán cho bạn.
        </p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Học viên đang học</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {stats.activeStudents ?? 0}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Tổng số học viên trên tất cả khóa
        </p>
      </div>
      <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
        <p className="text-xs font-medium text-slate-300">Doanh thu</p>
        <p className="mt-2 text-2xl font-semibold">
          {Number(stats.totalRevenue ?? 0).toLocaleString("vi-VN")}đ
        </p>
        <p className="mt-1 text-xs text-slate-300">Từ bảng payments</p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa DRAFT</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {stats.draftCourses ?? 0}
        </p>
        <p className="mt-1 text-xs text-slate-500">Khóa chờ admin duyệt</p>
      </div>
    </div>
  );
}

export default SummaryCards;

