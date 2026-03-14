import React from "react";

function SummaryCards({ users = [], courses = [], stats = {} }) {
  const totalTeachers = users.filter(u => u.role_code === "TEACHER").length;
  const totalStudents = users.filter(u => u.role_code === "STUDENT").length;
  const totalRevenue = stats.totalRevenue ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Giáo viên</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{totalTeachers}</p>
        <p className="mt-1 text-xs text-slate-500">Đang hoạt động trên hệ thống</p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Học sinh</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{totalStudents}</p>
        <p className="mt-1 text-xs text-slate-500">Đã đăng ký tài khoản học</p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa học</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{courses.length}</p>
        <p className="mt-1 text-xs text-slate-500">Đang được bán bởi giáo viên</p>
      </div>
      <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
        <p className="text-xs font-medium text-slate-300">Doanh thu</p>
        <p className="mt-2 text-2xl font-semibold">
          {Number(totalRevenue).toLocaleString("vi-VN")}đ
        </p>
        <p className="mt-1 text-xs text-slate-300">Tổng doanh thu từ payments</p>
      </div>
    </div>
  );
}

export default SummaryCards;

