import React from "react";

function SummaryCards({ users = [], courses = [], stats = {} }) {
  const totalUsers = users.length;
  const totalTeachers = users.filter(u => u.role_code === "TEACHER").length;
  const totalStudents = users.filter(u => u.role_code === "STUDENT").length;
  const totalRevenue = stats.totalRevenue ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <div className="rounded-xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-white shadow-sm p-4">
        <p className="text-xs font-medium text-cyan-700">Tổng người dùng</p>
        <p className="mt-2 text-2xl font-semibold text-cyan-950">{totalUsers}</p>
        <p className="mt-1 text-xs text-cyan-700/80">Tất cả tài khoản trên hệ thống</p>
      </div>
      <div className="rounded-xl border border-indigo-200 bg-linear-to-br from-indigo-50 to-white shadow-sm p-4">
        <p className="text-xs font-medium text-indigo-700">Giáo viên</p>
        <p className="mt-2 text-2xl font-semibold text-indigo-950">{totalTeachers}</p>
        <p className="mt-1 text-xs text-indigo-700/80">Đang hoạt động trên hệ thống</p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-linear-to-br from-emerald-50 to-white shadow-sm p-4">
        <p className="text-xs font-medium text-emerald-700">Học sinh</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-950">{totalStudents}</p>
        <p className="mt-1 text-xs text-emerald-700/80">Đã đăng ký tài khoản học</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-linear-to-br from-amber-50 to-white shadow-sm p-4">
        <p className="text-xs font-medium text-amber-700">Khóa học</p>
        <p className="mt-2 text-2xl font-semibold text-amber-950">{courses.length}</p>
        <p className="mt-1 text-xs text-amber-700/80">Đang được bán bởi giáo viên</p>
      </div>
      <div className="rounded-xl bg-linear-to-br from-rose-600 to-fuchsia-700 text-white shadow-sm border border-rose-500/40 p-4">
        <p className="text-xs font-medium text-rose-100">Doanh thu</p>
        <p className="mt-2 text-2xl font-semibold">
          {Number(totalRevenue).toLocaleString("vi-VN")}đ
        </p>
        <p className="mt-1 text-xs text-rose-100">Tổng doanh thu từ payments</p>
      </div>
    </div>
  );
}

export default SummaryCards;

