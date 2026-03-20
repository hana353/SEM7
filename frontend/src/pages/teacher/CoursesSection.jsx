import React from "react";

function CoursesSection({ courses = [], loading, onCourseClick }) {
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
                  <th className="px-4 py-2">Giá</th>
                  <th className="px-4 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
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

