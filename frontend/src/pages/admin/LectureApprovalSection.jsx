import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function LectureApprovalSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejecting, setRejecting] = useState(null); // lectureId
  const [reason, setReason] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/lectures/admin/pending");
      setItems(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || "Không tải được danh sách bài giảng chờ duyệt");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const approve = async (lectureId) => {
    await api.post(`/lectures/admin/${lectureId}/approve`);
    refresh();
  };

  const reject = async () => {
    if (!rejecting) return;
    await api.post(`/lectures/admin/${rejecting}/reject`, { reason });
    setRejecting(null);
    setReason("");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Duyệt bài giảng</h2>
        <p className="text-xs text-slate-500">
          Bài giảng Public do giáo viên gửi lên sẽ nằm trong danh sách này.
        </p>
      </div>

      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Đang tải...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-slate-500">Không có bài giảng chờ duyệt</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                <tr>
                  <th className="px-4 py-2">Khóa học</th>
                  <th className="px-4 py-2">Bài giảng</th>
                  <th className="px-4 py-2">Giáo viên</th>
                  <th className="px-4 py-2">Gửi lúc</th>
                  <th className="px-4 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2 text-slate-900">{l.courses?.title || "—"}</td>
                    <td className="px-4 py-2 text-slate-700">{l.title}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {l.users?.full_name || "—"}
                      <div className="text-[11px] text-slate-400">{l.users?.email || ""}</div>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {l.submitted_at ? new Date(l.submitted_at).toLocaleString("vi-VN") : "—"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => approve(l.id)}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejecting(l.id);
                            setReason("");
                          }}
                          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500"
                        >
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Từ chối bài giảng</h3>
              <p className="text-xs text-slate-500 mt-0.5">Nhập lý do để giáo viên chỉnh sửa và gửi lại.</p>
            </div>
            <div className="p-4 space-y-3">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                rows={4}
                placeholder="Ví dụ: Video lỗi, nội dung chưa phù hợp..."
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(null);
                    setReason("");
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={reject}
                  disabled={!reason.trim()}
                  className="flex-1 rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:opacity-60"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

