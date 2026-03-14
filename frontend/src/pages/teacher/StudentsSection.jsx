import React, { useState, useMemo } from "react";

function StudentsSection({ students = [], loading }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const courseOptions = useMemo(() => {
    const titles = [...new Set(students.map((s) => s.course_title).filter(Boolean))].sort();
    return titles;
  }, [students]);

  const filteredStudents = useMemo(() => {
    let list = students;
    const q = (searchQuery || "").trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          (s.student_name || "").toLowerCase().includes(q) ||
          (s.student_email || "").toLowerCase().includes(q)
      );
    }
    if (filterCourse) {
      list = list.filter((s) => (s.course_title || "") === filterCourse);
    }
    return list;
  }, [students, searchQuery, filterCourse]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        Học viên của tôi
      </h2>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-slate-100">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email..."
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm w-48"
          />
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
          >
            <option value="">Tất cả khóa học</option>
            {courseOptions.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Họ tên</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Khóa học</th>
                <th className="px-4 py-2">Tiến độ</th>
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
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    {students.length === 0 ? "Chưa có học viên" : "Không có kết quả phù hợp"}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-900">
                      {s.student_name || "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {s.student_email}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {s.course_title}
                    </td>
                    <td className="px-4 py-2">
                      <div className="w-32">
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                              width: `${s.progress_percent ?? 0}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {s.progress_percent ?? 0}% hoàn thành
                        </p>
                      </div>
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

export default StudentsSection;

