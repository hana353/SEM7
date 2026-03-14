import React, { useState } from "react";
import api from "../../api/axios";

const statusLabel = (s) =>
  ({ PUBLISHED: "Đang bán", DRAFT: "Chờ duyệt", ARCHIVED: "Ẩn" }[s] || s || "—");
const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Chờ duyệt" },
  { value: "PUBLISHED", label: "Đang bán" },
  { value: "ARCHIVED", label: "Ẩn" },
];

function EditCourseModal({ course, onClose, onSuccess }) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [price, setPrice] = useState(String(course?.price ?? 0));
  const [status, setStatus] = useState(course?.status ?? "DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Tên khóa học không được để trống");
      return;
    }
    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      setError("Giá không hợp lệ");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/courses/${course.id}`, {
        title: title.trim(),
        price: numPrice,
        status,
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || "Không thể cập nhật khóa học");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Chỉnh sửa khóa học</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tên khóa học</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Giá (VNĐ)</label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CoursesTable({ courses = [], onUpdated }) {
  const [editingCourse, setEditingCourse] = useState(null);

  return (
    <div className="rounded-xl bg-white shadow-sm border border-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Khóa học</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-2">Khóa học</th>
              <th className="px-4 py-2">Giáo viên</th>
              <th className="px-4 py-2">Giá</th>
              <th className="px-4 py-2">Trạng thái</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2 text-slate-900">{c.title}</td>
                <td className="px-4 py-2 text-slate-600">{c.teacher_name || "—"}</td>
                <td className="px-4 py-2 text-slate-900 font-medium">
                  {Number(c.price || 0).toLocaleString("vi-VN")}đ
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      c.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : c.status === "DRAFT"
                        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {statusLabel(c.status)}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setEditingCourse(c)}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Chỉnh sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {courses.length === 0 && (
          <p className="px-4 py-6 text-slate-500 text-center">Chưa có khóa học</p>
        )}
      </div>
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSuccess={() => { setEditingCourse(null); onUpdated?.(); }}
        />
      )}
    </div>
  );
}

export default CoursesTable;

