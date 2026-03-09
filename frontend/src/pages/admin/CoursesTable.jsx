import React from "react";

function CoursesTable({ courses = [] }) {
  const statusLabel = (s) =>
    ({ PUBLISHED: "Đang bán", DRAFT: "Chờ duyệt", ARCHIVED: "Ẩn" }[s] || s || "—");

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          Khóa học (API)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-2">Khóa học</th>
              <th className="px-4 py-2">Giáo viên</th>
              <th className="px-4 py-2">Giá</th>
              <th className="px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.slice(0, 10).map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2 text-slate-900">{c.title}</td>
                <td className="px-4 py-2 text-slate-600">{c.teacher_name || "—"}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">
                  {Number(c.price || 0).toLocaleString("vi-VN")}đ
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      c.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : c.status === "DRAFT"
                        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {statusLabel(c.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <p className="px-4 py-6 text-slate-500 text-center">Chưa có khóa học</p>
        )}
      </div>
    </div>
  );
}

export default CoursesTable;

