import { useEffect, useState } from "react";
import api from "../api/axios";

function Courses() {
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
      <h2 className="text-3xl font-bold mb-4">Danh sách khóa học</h2>
      <div className="space-y-4">
        {courses.length === 0 ? (
          <p className="text-gray-500">Chưa có khóa học nào.</p>
        ) : (
          courses.map(course => (
            <div key={course.id} className="p-4 border rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold">{course.title}</h3>
              {course.description && <p className="text-gray-600 text-sm mt-1">{course.description}</p>}
              <p className="text-gray-600 mt-2">{Number(course.price || 0).toLocaleString("vi-VN")} VND</p>
              {course.teacher_name && <p className="text-sm text-slate-500">Giáo viên: {course.teacher_name}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Courses;