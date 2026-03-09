import React from "react";

function RecentUsersTable({ users = [] }) {
  const roleLabel = (code) =>
    ({ ADMIN: "Admin", TEACHER: "Giáo viên", STUDENT: "Học sinh" }[code] || code);

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">
          Người dùng (API)
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-2">Họ tên</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Vai trò</th>
              <th className="px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.slice(0, 10).map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2 text-slate-900">{u.full_name || "—"}</td>
                <td className="px-4 py-2 text-slate-600">{u.email}</td>
                <td className="px-4 py-2 text-slate-600">{roleLabel(u.role_code)}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="px-4 py-6 text-slate-500 text-center">Chưa có người dùng</p>
        )}
      </div>
    </div>
  );
}

export default RecentUsersTable;

