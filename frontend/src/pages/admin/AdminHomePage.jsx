import { clearSession, getStoredUser } from "../../auth/session";
import { useNavigate } from "react-router-dom";

export default function AdminHomePage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl bg-white shadow-md p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Xin chào <span className="font-medium">{user?.full_name || user?.email}</span>
            </p>
          </div>
          <button
            className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800"
            onClick={() => {
              clearSession();
              navigate("/", { replace: true });
            }}
          >
            Đăng xuất
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
          Đây là trang dành cho <span className="font-semibold">ADMIN</span>. Bạn có thể đặt
          các chức năng quản trị (quản lý users/courses/assign teacher...) ở đây.
        </div>
      </div>
    </div>
  );
}

