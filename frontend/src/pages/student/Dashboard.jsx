import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/courses")
      .then(res => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || "Không tải được khóa học");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalCourses = courses.length;
  const freeCourses = useMemo(
    () => courses.filter(c => Number(c.price || 0) === 0),
    [courses]
  );
  const paidCourses = useMemo(
    () => courses.filter(c => Number(c.price || 0) > 0),
    [courses]
  );
  const highlightCourses = courses.slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">
            Tổng số khóa học
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {loading ? "…" : totalCourses}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Bao gồm tất cả khóa miễn phí và trả phí.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">
            Khóa học miễn phí
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">
            {loading ? "…" : freeCourses.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Có thể bắt đầu học ngay không cần thanh toán.
          </p>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">
            Khóa học trả phí
          </p>
          <p className="mt-2 text-2xl font-semibold text-indigo-600">
            {loading ? "…" : paidCourses.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Nâng cao kỹ năng và nội dung chuyên sâu hơn.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Khóa học nổi bật
            </h2>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Đang tải danh sách khóa học…</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : highlightCourses.length === 0 ? (
            <p className="text-sm text-slate-500">
              Chưa có khóa học nào được tạo trên hệ thống.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {highlightCourses.slice(0, 4).map(c => (
                <li
                  key={c.id}
                  className="py-2 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {c.teacher_name || "Giáo viên đang cập nhật"}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    {Number(c.price || 0).toLocaleString("vi-VN")} VND
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Gợi ý khóa học cho bạn
            </h2>
            <p className="text-[11px] text-slate-500">
              Dựa trên các khóa đang có trong hệ thống
            </p>
          </div>
          {loading ? (
            <p className="text-sm text-slate-500">Đang tải gợi ý…</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : highlightCourses.length === 0 ? (
            <p className="text-sm text-slate-500">Hiện chưa có gợi ý nào.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {highlightCourses.map(c => (
                <div
                  key={c.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-3"
                >
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                    {c.title}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-500">
                    {Number(c.price || 0) === 0
                      ? "Miễn phí"
                      : `${Number(c.price || 0).toLocaleString("vi-VN")} VND`}
                  </p>
                  {c.teacher_name && (
                    <p className="mt-1 text-xs text-slate-500">
                      GV: {c.teacher_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;