import React from "react";

function LecturesSection({ lectures = [], loading, onCourseClick }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        Bài giảng / Nội dung khóa học
      </h2>
      <p className="text-xs text-slate-500">
        Vào từng khóa học để thêm/sửa bài giảng.
      </p>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Khóa học</th>
                <th className="px-4 py-2">Tiêu đề bài giảng</th>
                <th className="px-4 py-2">Thứ tự</th>
                <th className="px-4 py-2">Thời lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : lectures.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Chưa có bài giảng
                  </td>
                </tr>
              ) : (
                lectures.map((lec) => (
                  <tr key={lec.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-900">
                      {onCourseClick ? (
                        <button
                          type="button"
                          onClick={() => onCourseClick(lec.course_id)}
                          className="text-blue-600 hover:underline"
                        >
                          {lec.course_title}
                        </button>
                      ) : (
                        lec.course_title
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{lec.title}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {lec.order_index}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {lec.duration_minutes ?? 0} phút
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LecturesSection;

