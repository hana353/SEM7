import React from "react";

function RevenueSection({ stats = {} }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Doanh thu</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs font-medium text-slate-500">Tổng doanh thu</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {Number(stats.totalRevenue ?? 0).toLocaleString("vi-VN")}đ
          </p>
          <p className="mt-1 text-xs text-slate-500">Từ bảng payments</p>
        </div>
        <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
          <p className="text-xs font-medium text-slate-300">
            Học viên đang học
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {stats.activeStudents ?? 0}
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Tổng trên tất cả khóa
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        API lịch sử rút tiền đang phát triển.
      </p>
    </div>
  );
}

export default RevenueSection;

