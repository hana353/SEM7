import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const SuggestedCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [purchasedCourseIds, setPurchasedCourseIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/courses"), api.get("/courses/student/my")])
      .then(([allRes, myRes]) => {
        const all = Array.isArray(allRes.data) ? allRes.data : [];
        const owned = Array.isArray(myRes.data?.data) ? myRes.data.data : [];
        setCourses(all);
        setPurchasedCourseIds(new Set(owned.map((c) => c.id)));
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.message || "Không tải được danh sách khóa học");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-center py-10">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Khóa học đề xuất</h1>
      {courses.length === 0 ? (
        <p className="text-gray-600">Chưa có khóa học nào.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const isBought = purchasedCourseIds.has(course.id);
            return (
              <div
                key={course.id}
                className={`p-4 rounded-lg border shadow-sm transition ${
                  isBought
                    ? "bg-slate-50 border-slate-200 opacity-70"
                    : "bg-white border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg">{course.title}</h3>
                  {isBought ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Đã mua
                    </span>
                  ) : (
                    <span
                      className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800"
                      title="Chưa mua"
                    >
                      Chưa mua
                    </span>
                  )}
                </div>

                {course.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-2">{course.description}</p>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <div className="text-sm text-slate-700 font-medium">
                    {Number(course.price || 0) === 0
                      ? "Miễn phí"
                      : `${Number(course.price || 0).toLocaleString("vi-VN")} VND`}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">
                      {course.teacher_name && <>GV: {course.teacher_name}</>}
                    </div>
                    {!isBought && (
                      <button
                        type="button"
                        onClick={() => navigate(`/student/course/${course.id}`)}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Mua ngay
                      </button>
                    )}
                  </div>
                </div>

                <span
                  className={`inline-block mt-3 px-2 py-0.5 rounded text-xs ${
                    course.status === "PUBLISHED"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {course.status || "N/A"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SuggestedCourses;