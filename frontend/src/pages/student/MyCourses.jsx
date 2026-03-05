import { useEffect, useState } from "react";
import api from "../../api/axios";

const MyCourses = () => {
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
      <h1 className="text-3xl font-bold mb-6">Khóa học của tôi</h1>
      <p className="text-gray-600 mb-4">Danh sách khóa học có sẵn. (API enrollment đang chờ phát triển để hiển thị khóa đã đăng ký.)</p>
      {courses.length === 0 ? (
        <p className="text-gray-500">Chưa có khóa học nào.</p>
      ) : (
        <div className="space-y-4">
          {courses.map(course => (
            <div key={course.id} className="p-4 bg-white rounded-lg shadow border">
              <h3 className="font-semibold text-lg">{course.title}</h3>
              {course.description && <p className="text-gray-600 text-sm mt-1">{course.description}</p>}
              <p className="mt-2 text-slate-700">{Number(course.price || 0).toLocaleString("vi-VN")} VND</p>
              {course.teacher_name && <p className="text-sm text-slate-500">Giáo viên: {course.teacher_name}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;