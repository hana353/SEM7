import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";
import { getSession, getUserId } from "../../auth/session";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Lấy userId
        const userId = getUserId();
        console.log("userId from localStorage:", userId);
        
        if (!userId) {
          setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        // Gọi API
        console.log(`Fetching /api/users/${userId}`);
        const response = await axiosInstance.get(`/users/${userId}`);
        console.log("API Response:", response.data);
        
        setUser(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Fetch user profile error:", err);
        const errorMsg = err.response?.data?.message || err.message || "Lỗi khi tải hồ sơ cá nhân";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;
  if (!user) return <div className="text-center py-10">Không tìm thấy dữ liệu người dùng</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* Thông tin cá nhân */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Thông tin cá nhân</h2>
        <div className="space-y-3">
          <p><strong>Tên:</strong> {user.full_name || user.fullName || user.name || "Chưa cập nhật"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Vai trò:</strong> {user.role_code || user.role || "STUDENT"}</p>
          <p><strong>Level dự đoán:</strong> {user.level || "Chưa xác định"}</p>
          <p><strong>Ngôn ngữ giao diện:</strong> {user.language || "Tiếng Việt"}</p>
        </div>
      </section>

      {/* Lịch sử học tập */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Lịch sử học tập</h2>
        <div className="space-y-2">
          <p><strong>Tổng khóa học:</strong> {user.totalCourses || 0}</p>
          <p><strong>Khóa học hoàn thành:</strong> {user.completedCourses || 0}</p>
          <p><strong>Thời gian học:</strong> {user.studyTime || "0"} giờ</p>
        </div>
      </section>

      {/* Huy hiệu (Gamification) */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Huy hiệu</h2>
        <div className="flex gap-4">
          {user.badges && user.badges.length > 0 ? (
            user.badges.map((badge, idx) => (
              <div key={idx} className="text-4xl">{badge}</div>
            ))
          ) : (
            <p className="text-gray-500">Chưa có huy hiệu nào</p>
          )}
        </div>
      </section>

      {/* Cài đặt */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Cài đặt</h2>
        <div className="space-y-3">
          <label className="flex items-center">
            <input type="checkbox" defaultChecked={user.microphoneEnabled !== false} className="mr-2" />
            <span>Bật microphone mặc định</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="mr-2" />
            <span>Nhận thông báo học tập</span>
          </label>
        </div>
      </section>
    </div>
  );
};

export default Profile;