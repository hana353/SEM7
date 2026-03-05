import { useState } from "react";
import Dashboard from "./Dashboard";
import MyCourses from "./MyCourses";
import SuggestedCourses from "./SuggestedCourses";
import VocabularyPractice from "./VocabularyPractice";
import SpeakingPractice from "./SpeakingPractice";
import Profile from "./Profile";

const StudentHomePage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "myCourses":
        return <MyCourses />;
      case "suggestedCourses":
        return <SuggestedCourses />;
      case "vocabulary":
        return <VocabularyPractice />;
      case "speaking":
        return <SpeakingPractice />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">Student</h1>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "dashboard" ? "bg-blue-500" : "hover:bg-gray-700"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("myCourses")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "myCourses" ? "bg-blue-500" : "hover:bg-gray-700"}`}
          >
            Khóa học của tôi
          </button>
          <button
            onClick={() => setActiveTab("suggestedCourses")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "suggestedCourses" ? "bg-blue-500" : "hover:bg-gray-700"}`}
          >
            Khóa học đề xuất
          </button>
          <button
            onClick={() => setActiveTab("vocabulary")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "vocabulary" ? "bg-blue-500" : "hover:bg-gray-700"}`}
          >
            Luyện từ vựng
          </button>
          <button
            onClick={() => setActiveTab("speaking")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "speaking" ? "bg-blue-500" : "hover:bg-gray-700"}`}
          >
            Luyện kỹ năng nói
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-2 rounded ${activeTab === "profile" ? "bg-blue-500" : "hover:bg-gray-700"}`}
          >
            Hồ sơ cá nhân
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default StudentHomePage;

