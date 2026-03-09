import React from "react";

function CoursesSection({ courses = [], loading, onCourseClick }) {
  const statusLabel = (s) =>
    ({ PUBLISHED: "Đang bán", DRAFT: "Chờ duyệt", ARCHIVED: "Ẩn" }[s] || s || "—");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Khóa học được gán (Admin tạo và gán cho bạn)
        </h2>
      </div>
      {loading ? (
        <div className="rounded-xl bg-white border p-6 text-center text-slate-500">
          Đang tải...
        </div>
      ) : (
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2">Tên khóa học</th>
                  <th className="px-4 py-2">Trạng thái</th>
                  <th className="px-4 py-2">Giá</th>
                  <th className="px-4 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Chưa có khóa học nào được gán
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2 text-slate-900">
                        {course.title}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            course.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                              : "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                          }`}
                        >
                          {statusLabel(course.status)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {Number(course.price || 0).toLocaleString("vi-VN")}đ
                      </td>
                      <td className="px-4 py-2">
                        <button
                          type="button"
                          onClick={() => onCourseClick?.(course.id)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Quản lý nội dung →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoursesSection;

