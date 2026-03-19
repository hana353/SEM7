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
    <div className="w-full max-w-5xl space-y-6">
      <div className="rounded-2xl border border-sky-200/80 bg-linear-to-r from-cyan-50/80 via-sky-50/80 to-indigo-50/80 px-5 py-4 shadow-sm">
        <h1 className="text-base font-semibold text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-xs text-slate-600">
          Xem và cập nhật thông tin tài khoản của bạn.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-sky-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Thông tin cá nhân
          </h2>
          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-medium text-sky-700">
            Tài khoản học viên
          </span>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Họ tên</dt>
            <dd className="mt-1 font-semibold text-slate-900 wrap-break-word">{fullName}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 sm:col-span-2 lg:col-span-1">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-slate-700 break-all">{email}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Số điện thoại</dt>
            <dd className="mt-1 text-slate-700 wrap-break-word">{phone}</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Vai trò</dt>
            <dd className="mt-1 text-slate-700 wrap-break-word">{role}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Đổi mật khẩu
        </h2>
        <p className="text-xs text-slate-600 mb-4">
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
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
            className="inline-flex items-center rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50"
          >
            {changingPassword ? "Đang xử lý…" : "Đổi mật khẩu"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default Profile;
