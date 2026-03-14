import { useEffect, useState } from "react";
import api from "../../api/axios";
import { getStoredUser, getUserId } from "../../auth/session";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = getUserId();
      if (!userId) {
        setUser(getStoredUser());
        setError(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data?.data || getStoredUser());
        setError(null);
      } catch (err) {
        setUser(getStoredUser());
        setError(err.response?.data?.message || "Không tải được hồ sơ");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu cũ.");
      return;
    }
    if (!newPassword.trim()) {
      setPasswordError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới và xác nhận không trùng khớp.");
      return;
    }

    setChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
      });
      setPasswordSuccess("Đổi mật khẩu thành công.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-500">
        Đang tải hồ sơ…
      </div>
    );
  }

  const displayUser = user || getStoredUser();
  const fullName = displayUser?.full_name || displayUser?.fullName || displayUser?.name || "Chưa cập nhật";
  const email = displayUser?.email || "—";
  const role = displayUser?.role_code || displayUser?.role || "STUDENT";
  const phone = displayUser?.phone || "—";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-sm font-semibold text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-xs text-slate-500">
          Xem và cập nhật thông tin tài khoản của bạn.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}

      <section className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Thông tin cá nhân
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-xs font-medium text-slate-500">Họ tên</dt>
            <dd className="mt-0.5 font-medium text-slate-900">{fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Email</dt>
            <dd className="mt-0.5 text-slate-700">{email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Số điện thoại</dt>
            <dd className="mt-0.5 text-slate-700">{phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500">Vai trò</dt>
            <dd className="mt-0.5 text-slate-700">{role}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Đổi mật khẩu
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Để đổi mật khẩu, vui lòng nhập đúng mật khẩu hiện tại và mật khẩu mới.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label
              htmlFor="old-password"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Mật khẩu hiện tại
            </label>
            <input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập mật khẩu cũ"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Mật khẩu mới
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Xác nhận mật khẩu mới
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />
          </div>

          {passwordError && (
            <p className="text-xs text-red-600">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-xs text-emerald-600">{passwordSuccess}</p>
          )}

          <button
            type="submit"
            disabled={changingPassword}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
          >
            {changingPassword ? "Đang xử lý…" : "Đổi mật khẩu"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Profile;
