import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import StudentHomePage from "./pages/StudentHomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/studenthomepage" element={<StudentHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
