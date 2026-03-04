import { useState } from "react";
import { clearSession, getStoredUser } from "../../auth/session";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "myCourses", label: "Khóa học của tôi" },
  { id: "suggested", label: "Khóa học gợi ý" },
  { id: "vocab", label: "Luyện từ vựng (Free)" },
  { id: "speaking", label: "Luyện kỹ năng nói" },
  { id: "profile", label: "Hồ sơ cá nhân" },
];

const mockProgress = {
  activeCourses: 3,
  completedCourses: 2,
  vocabSessionsThisWeek: 7,
  speakingSessionsThisWeek: 4,
};

const mockMyCourses = [
  {
    id: 1,
    title: "Speaking for Beginners",
    teacher: "Nguyễn Văn A",
    progress: 45,
    nextLesson: "Unit 3 - Daily activities",
  },
  {
    id: 2,
    title: "IELTS Reading 5.0+",
    teacher: "Trần Thị B",
    progress: 20,
    nextLesson: "Skimming & Scanning",
  },
  {
    id: 3,
    title: "Pronunciation Basics",
    teacher: "Phạm Quốc C",
    progress: 80,
    nextLesson: "Ending sounds /t/ /d/",
  },
];

const mockSuggestedCourses = [
  {
    id: 4,
    title: "Everyday Conversation A2",
    level: "A2",
    teacher: "Lê Thu D",
    price: "350.000đ",
  },
  {
    id: 5,
    title: "IELTS Speaking 5.5+",
    level: "B1",
    teacher: "Hoàng Minh E",
    price: "590.000đ",
  },
];

const mockVocabularyTopics = [
  {
    id: 1,
    title: "Daily Activities - A1",
    wordsCount: 15,
    mastered: 9,
  },
  {
    id: 2,
    title: "Travel & Transport - A2",
    wordsCount: 20,
    mastered: 5,
  },
  {
    id: 3,
    title: "Technology - B1",
    wordsCount: 18,
    mastered: 3,
  },
];

const mockSpeakingScenarios = [
  {
    id: 1,
    title: "Giới thiệu bản thân",
    level: "A1",
    status: "Đã luyện 2 lần",
  },
  {
    id: 2,
    title: "Hỏi đường khi đi du lịch",
    level: "A2",
    status: "Chưa luyện",
  },
  {
    id: 3,
    title: "Phỏng vấn xin việc đơn giản",
    level: "B1",
    status: "Đã luyện 1 lần",
  },
];

function ProgressCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa học đang học</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockProgress.activeCourses}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Hãy hoàn thành ít nhất 1 bài học hôm nay.
        </p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">Khóa học đã hoàn thành</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockProgress.completedCourses}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Tuyệt vời! Tiếp tục duy trì thói quen học.
        </p>
      </div>
      <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
        <p className="text-xs font-medium text-slate-500">
          Phiên luyện từ vựng (tuần này)
        </p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">
          {mockProgress.vocabSessionsThisWeek}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Cố gắng luyện ít nhất 10 phiên/tuần.
        </p>
      </div>
      <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm border border-slate-900/40 p-4">
        <p className="text-xs font-medium text-slate-300">
          Phiên luyện nói (voice-to-text)
        </p>
        <p className="mt-2 text-2xl font-semibold">
          {mockProgress.speakingSessionsThisWeek}
        </p>
        <p className="mt-1 text-xs text-slate-300">
          Dữ liệu mẫu – chức năng ghi âm &amp; STT sẽ dùng API thật sau.
        </p>
      </div>
    </div>
  );
}

function MyCoursesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Khóa học của tôi
        </h2>
        <span className="text-xs text-slate-500">Data mẫu (static)</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {mockMyCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl bg-white shadow-sm border border-slate-100 p-4 flex flex-col gap-2"
          >
            <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-xs text-slate-500">GV: {course.teacher}</p>
            <div className="mt-1">
              <p className="text-[11px] text-slate-500 mb-1">
                Tiến độ: {course.progress}%
              </p>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Bài học tiếp theo:{" "}
              <span className="font-medium text-slate-800">
                {course.nextLesson}
              </span>
            </p>
            <button className="mt-3 inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800">
              Tiếp tục học
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuggestedCoursesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Khóa học gợi ý cho bạn
        </h2>
        <span className="text-xs text-slate-500">
          Gợi ý dựa trên level &amp; chủ đề bạn đã học (data mẫu)
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {mockSuggestedCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-xl bg-white shadow-sm border border-slate-100 p-4 flex flex-col gap-2"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              {course.title}
            </h3>
            <p className="text-xs text-slate-500">
              Level:{" "}
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                {course.level}
              </span>
            </p>
            <p className="text-xs text-slate-500">GV: {course.teacher}</p>
            <p className="text-sm font-semibold text-slate-900">
              {course.price}
            </p>
            <button className="mt-3 inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-900 border border-slate-200 hover:bg-slate-50">
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function VocabPracticeSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Luyện từ vựng theo chủ đề (FREE)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Chọn bộ từ vựng được admin tạo sẵn. Dữ liệu dưới đây là ví dụ trùng
            với data trong `init.sql`.
          </p>
        </div>
        <button className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-slate-800">
          Bắt đầu luyện tập nhanh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {mockVocabularyTopics.map((topic) => {
          const percent = Math.round(
            (topic.mastered / topic.wordsCount) * 100
          );

          return (
            <div
              key={topic.id}
              className="rounded-xl bg-white shadow-sm border border-slate-100 p-4 flex flex-col gap-2"
            >
              <h3 className="text-sm font-semibold text-slate-900">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-500">
                Số từ: {topic.mastered}/{topic.wordsCount} đã nắm vững
              </p>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <button className="mt-3 inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800">
                Ôn lại với voice-to-text
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-900 text-slate-50 p-4 flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
          Demo chức năng voice-to-text
        </p>
        <p className="text-xs text-slate-200">
          Ở phiên bản thật, bạn sẽ nhấn nút micro, nói từ tiếng Anh và hệ thống
          sẽ dùng API nhận dạng giọng nói để chuyển thành văn bản, so sánh với
          đáp án &amp; hiển thị kết quả trực tiếp tại đây.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-full bg-emerald-500 h-10 w-10 text-white text-lg font-semibold">
            🎤
          </button>
          <div className="flex-1 rounded-lg bg-slate-800/80 px-3 py-2 text-[11px] text-slate-200">
            <p className="font-mono">"wake up" → wake up ✅</p>
            <p className="mt-1 text-slate-400">
              (Dòng trên chỉ là text mẫu minh họa cho kết quả voice-to-text)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpeakingPracticeSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Luyện kỹ năng nói (demo)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Chọn tình huống giao tiếp, nhấn giữ micro để nói. Hệ thống sẽ chuyển
            giọng nói thành văn bản (speech-to-text) để bạn so sánh với mẫu.
          </p>
        </div>
        <button className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-slate-800">
          Bắt đầu bài luyện mới
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {mockSpeakingScenarios.map((s) => (
          <div
            key={s.id}
            className="rounded-xl bg-white shadow-sm border border-slate-100 p-4 flex flex-col gap-2"
          >
            <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
            <p className="text-xs text-slate-500">
              Level:{" "}
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100">
                {s.level}
              </span>
            </p>
            <p className="text-xs text-slate-500">{s.status}</p>
            <button className="mt-3 inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800">
              Luyện nói với voice-to-text
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSection({ user }) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6 space-y-4 text-sm text-slate-700">
      <h2 className="text-lg font-semibold text-slate-900">Hồ sơ cá nhân</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Họ tên</p>
          <p className="text-sm font-medium text-slate-900">
            {user?.full_name || "Student User"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900">
            {user?.email || "student@example.com"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Level dự đoán</p>
          <p className="text-sm font-medium text-slate-900">A2 (demo)</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Mục tiêu</p>
          <p className="text-sm font-medium text-slate-900">
            Giao tiếp hàng ngày &amp; IELTS 5.5
          </p>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Đây chỉ là dữ liệu cứng minh họa. Khi kết nối backend, bạn có thể hiển
        thị level thật dựa trên tiến độ khóa học &amp; điểm bài kiểm tra.
      </p>
    </div>
  );
}

export default function StudentHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    if (activeSection === "dashboard") {
      return (
        <div className="space-y-6">
          <ProgressCards />
          <div className="grid gap-6 lg:grid-cols-2">
            <MyCoursesSection />
            <VocabPracticeSection />
          </div>
        </div>
      );
    }

    if (activeSection === "myCourses") {
      return <MyCoursesSection />;
    }

    if (activeSection === "suggested") {
      return <SuggestedCoursesSection />;
    }

    if (activeSection === "vocab") {
      return <VocabPracticeSection />;
    }

    if (activeSection === "speaking") {
      return <SpeakingPracticeSection />;
    }

    if (activeSection === "profile") {
      return <ProfileSection user={user} />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-slate-900 text-slate-50 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-800">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Student
          </p>
          <p className="mt-1 text-sm font-semibold">
            English Learning Workspace
          </p>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1 text-sm">
          {sidebarItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
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
            {user?.full_name || user?.email || "Student"}
          </p>
          <button
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

      <main className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur flex items-center justify-between px-6">
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              Không gian học tập của bạn
            </h1>
            <p className="text-xs text-slate-500">
              Xem tiến độ khóa học, luyện từ vựng &amp; luyện nói với chức năng
              voice-to-text.
            </p>
          </div>
        </header>

        <div className="flex-1 px-6 py-5 space-y-6 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

