import React, { useState } from "react";
import api from "../../api/axios";

function ProfileSection({ user }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      setStatusMessage(res.data?.message || "Đổi mật khẩu thành công.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-6 space-y-4 text-sm text-slate-700">
      <h2 className="text-lg font-semibold text-slate-900">
        Hồ sơ giảng dạy
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Họ tên</p>
          <p className="text-sm font-medium text-slate-900">
            {user?.full_name || user?.fullName || "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Email</p>
          <p className="text-sm font-medium text-slate-900">
            {user?.email || "—"}
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-base font-semibold text-slate-900">Đổi mật khẩu</h3>
        <p className="text-xs text-slate-500">
          Nhập mật khẩu hiện tại và mật khẩu mới để đổi mật khẩu.
        </p>

        {statusMessage && (
          <div className="mt-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSection;

