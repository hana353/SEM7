import React, { useState, useMemo } from "react";
import api from "../../api/axios";

const ROLE_LABELS = {
  ADMIN: "Admin",
  TEACHER: "Giáo viên",
  STUDENT: "Học sinh",
  GUEST: "Khách",
};

function RecentUsersTable({ users = [], onRoleChanged }) {
  const [filter, setFilter] = useState("ALL"); // ALL | TEACHER | STUDENT
  const [changingId, setChangingId] = useState(null);
  const [error, setError] = useState("");

  const filteredUsers = useMemo(() => {
    if (filter === "TEACHER") return users.filter((u) => u.role_code === "TEACHER");
    if (filter === "STUDENT") return users.filter((u) => u.role_code === "STUDENT");
    return users;
  }, [users, filter]);

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === "TEACHER" ? "STUDENT" : "TEACHER";
    if (
      !window.confirm(
        `Bạn có chắc muốn chuyển vai trò thành ${ROLE_LABELS[newRole]}?`
      )
    ) {
      return;
    }
    setChangingId(userId);
    setError("");
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      onRoleChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể đổi vai trò");
    } finally {
      setChangingId(null);
    }
  };

  const canChangeRole = (u) =>
    u.role_code === "TEACHER" || u.role_code === "STUDENT";

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Danh sách người dùng</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Lọc:</span>
          {["ALL", "TEACHER", "STUDENT"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "ALL" ? "Tất cả" : ROLE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-2">Họ tên</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Vai trò</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2 text-slate-900">{u.full_name || "—"}</td>
                <td className="px-4 py-2 text-slate-600">{u.email}</td>
                <td className="px-4 py-2 text-slate-600">
                  {ROLE_LABELS[u.role_code] || u.role_code}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      u.is_active && !u.is_deleted
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                    }`}
                  >
                    {u.is_active && !u.is_deleted ? "Hoạt động" : "Tạm khóa"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {canChangeRole(u) ? (
                    <button
                      type="button"
                      disabled={changingId === u.id}
                      onClick={() => handleChangeRole(u.id, u.role_code)}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                    >
                      {changingId === u.id
                        ? "Đang xử lý…"
                        : u.role_code === "TEACHER"
                          ? "→ Học sinh"
                          : "→ Giáo viên"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="px-4 py-6 text-slate-500 text-center">Không có người dùng</p>
        )}
      </div>
    </div>
  );
}

export default RecentUsersTable;
