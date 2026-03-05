import { useEffect, useState } from "react";
import api from "../../api/axios";

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(Array.isArray(res.data) ? res.data : []))
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || "Không tải được khóa học");
      })
      .finally(() => setLoading(false));
  }, []);

  const displayCourses = courses.slice(0, 5);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Student</h1>

      <section className="mb-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Khóa học đang học / Có sẵn</h2>
        {loading ? (
          <p className="text-gray-600">Đang tải...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : displayCourses.length === 0 ? (
          <p className="text-gray-600">Chưa có khóa học nào.</p>
        ) : (
          <ul className="space-y-2">
            {displayCourses.map(c => (
              <li key={c.id} className="flex justify-between items-center py-2 border-b border-blue-100 last:border-0">
                <span className="font-medium">{c.title}</span>
                <span className="text-sm text-slate-600">{Number(c.price || 0).toLocaleString("vi-VN")} VND</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-green-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Gợi ý khóa học mới</h2>
        {loading ? (
          <p className="text-gray-600">Đang tải...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-600">Chưa có gợi ý.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayCourses.map(c => (
              <div key={c.id} className="p-3 bg-white rounded border">
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-slate-600">{c.teacher_name || "—"}</p>
                <p className="text-sm font-medium text-green-700">{Number(c.price || 0).toLocaleString("vi-VN")} VND</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;