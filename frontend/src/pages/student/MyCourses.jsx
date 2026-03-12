import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/courses/student/my")
      .then(res => setCourses(res.data?.data || []))
      .catch(err => {
        console.error(err);
        setError(
          err.response?.data?.message || "Không tải được danh sách khóa học đã mua"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-500">
        Đang tải danh sách khóa học…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-sm font-semibold text-slate-900">
          Khóa học của tôi
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Các khóa học bạn đã đăng ký / thanh toán thành công.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-6 text-sm text-slate-500 text-center">
          Bạn chưa đăng ký khóa học nào.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <div
              key={course.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col"
            >
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3">
                    {course.description}
                  </p>
                )}
              </div>
              <div className="mt-3 text-xs text-slate-500 space-y-1">
                <p>
                  Giá:{" "}
                  <span className="font-semibold text-slate-800">
                    {Number(course.price || 0) === 0
                      ? "Miễn phí"
                      : `${Number(course.price || 0).toLocaleString("vi-VN")} VND`}
                  </span>
                </p>
                {course.teacher_name && (
                  <p>Giáo viên: {course.teacher_name}</p>
                )}
                {course.enrolled_at && (
                  <p>
                    Đã ghi danh:{" "}
                    {new Date(course.enrolled_at).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate(`/student/course/${course.id}`)}
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Vào học
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
