import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "ENROLLMENT_NEW", label: "Học viên tham gia khóa học" },
  { value: "LECTURE_APPROVED", label: "Bài giảng được duyệt" },
  { value: "LECTURE_REJECTED", label: "Bài giảng bị từ chối" },
];

export default function NotificationsSection() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const typeLabel = useMemo(
    () => TYPE_OPTIONS.find((t) => t.value === type)?.label || "Tất cả",
    [type]
  );

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (type) params.set("type", type);
      params.set("limit", "50");
      const res = await api.get(`/notifications/me?${params.toString()}`);
      setItems(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Không tải được thông báo");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Thông báo</h2>
        <p className="text-xs text-slate-500">
          Lọc theo loại và tìm theo nội dung thông báo.
        </p>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tìm kiếm
            </label>
            <div className="flex gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Ví dụ: bài giảng, tên học viên, tên khóa học..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={fetchData}
                className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Tìm
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Bộ lọc loại
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              Đang lọc: {typeLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500 text-sm">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-sm">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">Chưa có thông báo</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((n) => (
              <li key={n.id} className="p-4 hover:bg-slate-50/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="mt-1 text-sm text-slate-700">{n.body}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="rounded bg-slate-100 px-2 py-0.5">
                        {n.type}
                      </span>
                      <span>
                        {n.created_at ? new Date(n.created_at).toLocaleString("vi-VN") : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

