import React from "react";

function ProfileSection({ user }) {
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
    </div>
  );
}

export default ProfileSection;

