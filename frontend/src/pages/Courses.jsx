import { useEffect, useState } from "react";
import api from "../api/axios";

function Courses() {
  // temporary hardcoded data for UI preview
  const sampleCourses = [
    { Id: 1, Title: "React cơ bản", Price: 0 },
    { Id: 2, Title: "Node.js nâng cao", Price: 1200000 },
    { Id: 3, Title: "Fullstack MERN", Price: 2500000 },
  ];

  const [courses, setCourses] = useState(sampleCourses);

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(res.data))
      .catch(err => {
        console.error(err);
        // keep sampleCourses if API call fails
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Danh sách khóa học</h2>
      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.Id} className="p-4 border rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold">{course.Title}</h3>
            <p className="text-gray-600">{course.Price} VND</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Courses;