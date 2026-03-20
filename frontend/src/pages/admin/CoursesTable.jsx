import React, { useMemo, useState } from "react";
import api from "../../api/axios";

const statusLabel = (s) =>
  ({ ON_SALE: "Đang bán", DRAFT: "Nháp", ARCHIVED: "Ẩn" }[s] || s || "—");

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Nháp" },
  { value: "ON_SALE", label: "Đang bán" },
  { value: "ARCHIVED", label: "Ẩn" },
];

function toDatetimeLocalInput(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function EditCourseModal({ course, teachers = [], onClose, onSuccess }) {
  const [title, setTitle] = useState(course?.title ?? "");
  const [description, setDescription] = useState(course?.description ?? "");
  const [teacherId, setTeacherId] = useState(course?.teacher_id ?? "");
  const [price, setPrice] = useState(String(course?.price ?? 0));
  const [status, setStatus] = useState(course?.status ?? "DRAFT");
  const [startAt, setStartAt] = useState(toDatetimeLocalInput(course?.start_at));
  const [endAt, setEndAt] = useState(toDatetimeLocalInput(course?.end_at));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const teacherOptions = useMemo(
    () =>
      (teachers || []).map((t) => ({
        id: t.id,
        label: t.full_name || t.email || t.id,
      })),
    [teachers]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Tên khóa học không được để trống");
      return;
    }

    if (!teacherId) {
      setError("Vui lòng chọn giáo viên phụ trách");
      return;
    }

    const numPrice = Number(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      setError("Giá không hợp lệ");
      return;
    }

    if (startAt && endAt && new Date(startAt) > new Date(endAt)) {
      setError("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    setSaving(true);
    try {
      await api.patch(`/courses/${course.id}`, {
        title: title.trim(),
        description: description.trim() || null,
        teacher_id: teacherId,
        price: numPrice,
        status,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
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
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Chỉnh sửa khóa học</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Tên khóa học
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Mô tả
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Giáo viên phụ trách
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Chọn giáo viên</option>
                {teacherOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Giá (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Bắt đầu
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Kết thúc
              </label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CoursesTable({ courses = [], teachers = [], onUpdated }) {
  const [editingCourse, setEditingCourse] = useState(null);

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
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
              <th className="px-4 py-2">Thời gian</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-2">
                  <div className="font-medium text-slate-900">{c.title}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {c.description || "Chưa có mô tả"}
                  </div>
                </td>

                <td className="px-4 py-2 text-slate-600">
                  {c.teacher_name || "—"}
                </td>

                <td className="px-4 py-2 font-medium text-slate-900">
                  {Number(c.price || 0).toLocaleString("vi-VN")}đ
                </td>

                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      c.status === "ON_SALE"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : c.status === "DRAFT"
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                        : "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {statusLabel(c.status)}
                  </span>
                </td>

                <td className="px-4 py-2 text-xs text-slate-500">
                  <div>{c.start_at ? new Date(c.start_at).toLocaleString("vi-VN") : "—"}</div>
                  <div>{c.end_at ? new Date(c.end_at).toLocaleString("vi-VN") : "—"}</div>
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
          <p className="px-4 py-6 text-center text-slate-500">Chưa có khóa học</p>
        )}
      </div>

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          teachers={teachers}
          onClose={() => setEditingCourse(null)}
          onSuccess={() => {
            setEditingCourse(null);
            onUpdated?.();
          }}
        />
      )}
    </div>
  );
}

export default CoursesTable;