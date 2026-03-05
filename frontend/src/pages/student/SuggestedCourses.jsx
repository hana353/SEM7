import { useEffect, useState } from "react";
import api from "../../api/axios";

const SuggestedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
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
          {courses.map(course => (
            <div key={course.id} className="p-4 bg-white rounded-lg shadow border hover:shadow-md transition">
              <h3 className="font-semibold text-lg">{course.title}</h3>
              {course.description && <p className="text-gray-600 text-sm mt-2 line-clamp-2">{course.description}</p>}
              <p className="mt-2 text-slate-700 font-medium">{Number(course.price || 0).toLocaleString("vi-VN")} VND</p>
              {course.teacher_name && <p className="text-sm text-slate-500">GV: {course.teacher_name}</p>}
              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${course.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                {course.status || "N/A"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedCourses;