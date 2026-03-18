import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import MyCourses from "./MyCourses";
import SuggestedCourses from "./SuggestedCourses";
import VocabularyPractice from "./VocabularyPractice";
import Profile from "./Profile";
import StudentCourseDetail from "./StudentCourseDetail";
import { clearSession, getStoredUser } from "../../auth/session";

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "myCourses", label: "Khóa học của tôi" },
  { id: "suggestedCourses", label: "Khóa học đề xuất" },
  { id: "vocabulary", label: "Luyện từ vựng (Free)" },
  { id: "profile", label: "Hồ sơ cá nhân" },
];

const StudentHomePage = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "myCourses":
        return (
          <MyCourses
            onOpenCourse={(id) => {
              setSelectedCourseId(id);
              setActiveTab("courseDetail");
            }}
          />
        );
      case "courseDetail":
        return selectedCourseId ? (
          <StudentCourseDetail
            embedded
            courseId={selectedCourseId}
            onBack={() => {
              setSelectedCourseId(null);
              setActiveTab("myCourses");
            }}
          />
        ) : (
          <MyCourses />
        );
      case "suggestedCourses":
        return <SuggestedCourses />;
      case "vocabulary":
        return <VocabularyPractice />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-50 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Student
          </p>
          <p className="mt-1 text-sm font-semibold truncate">
            {user?.full_name || user?.email || "Học viên"}
          </p>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-200 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-300">
          <p className="truncate">
            {user?.full_name || user?.email || "Học viên"}
          </p>
          <button
            type="button"
            className="mt-2 inline-flex items-center rounded-lg bg-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-50 hover:bg-slate-600"
            onClick={() => {
              clearSession();
              navigate("/", { replace: true });
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col ml-64 min-w-0">
        <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Không gian học tập của bạn
            </h1>
            <p className="text-xs text-slate-500">
              Xem tiến độ, truy cập khóa học và luyện từ vựng miễn phí.
            </p>
          </div>
        </header>

        <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StudentHomePage;

