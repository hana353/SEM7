import React, { useState } from "react";
import api from "../../api/axios";

function CreateCourseForm({ users = [], onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [teacherId, setTeacherId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const teachers = users.filter(u => u.role_code === "TEACHER");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tiêu đề là bắt buộc");
      return;
    }
    if (!teacherId) {
      setError("Vui lòng chọn giáo viên");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/courses", {
        title: title.trim(),
        description: description.trim() || null,
        price: Number(price) || 0,
        teacher_id: teacherId,
        start_at: startAt ? new Date(startAt).toISOString() : null,
        end_at: endAt ? new Date(endAt).toISOString() : null,
        status,
      });
      setTitle("");
      setDescription("");
      setPrice(0);
      setTeacherId("");
      setStartAt("");
      setEndAt("");
      setStatus("DRAFT");
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tạo khóa học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white border p-6 space-y-4 mb-6">
      <h3 className="font-semibold text-slate-900">Tạo khóa học mới & gán giáo viên</h3>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label className="block text-xs text-slate-500 mb-1">Tiêu đề *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          placeholder="Tên khóa học"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Mô tả</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Giá (VND)</label>
        <input
          type="number"
          value={price}
          onChange={e => setPrice(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          min={0}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Bắt đầu</label>
          <input
            type="date"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Kết thúc</label>
          <input
            type="date"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        >
          <option value="DRAFT">Nháp</option>
          <option value="ON_SALE">Đang bán</option>
          <option value="ARCHIVED">Ẩn (lưu trữ)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">Giáo viên *</label>
        <select
          value={teacherId}
          onChange={e => setTeacherId(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
          required
        >
          <option value="">-- Chọn giáo viên --</option>
          {teachers.map(t => (
            <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
          ))}
        </select>
        {teachers.length === 0 && (
          <p className="text-amber-600 text-xs mt-1">
            Chưa có giáo viên. Cần promote user lên TEACHER trước.
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={loading || teachers.length === 0}
        className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Đang tạo..." : "Tạo khóa học"}
      </button>
    </form>
  );
}

export default CreateCourseForm;

