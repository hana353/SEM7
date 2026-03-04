import { useEffect, useState } from "react";
import api from "../api/axios";

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Danh sách khóa học</h2>
      {courses.map(course => (
        <div key={course.Id}>
          <h3>{course.Title}</h3>
          <p>{course.Price} VND</p>
        </div>
      ))}
    </div>
  );
}

export default Courses;