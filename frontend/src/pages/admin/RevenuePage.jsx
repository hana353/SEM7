import { useEffect, useState } from "react";
import api from "../../api/axios";

const MONTH_NAMES = [
  "T1", "T2", "T3", "T4", "T5", "T6",
  "T7", "T8", "T9", "T10", "T11", "T12",
];

function RevenuePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/stats/admin/revenue")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Không tải được dữ liệu"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-slate-500">
        Đang tải dữ liệu doanh thu…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const {
    totalRevenue = 0,
    successCount = 0,
    otherCount = 0,
    totalCount = 0,
    byMonth = [],
    byCourse = [],
    recentPayments = [],
    statusCounts = [],
  } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-sm font-semibold text-slate-900">Doanh thu</h1>
        <p className="mt-1 text-xs text-slate-500">
          Tổng quan doanh thu, giao dịch và thống kê theo khóa học.
        </p>
      </div>

      {/* Thẻ tổng quan */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-slate-900 text-slate-50 shadow-sm p-4">
          <p className="text-xs font-medium text-slate-300">Tổng doanh thu</p>
          <p className="mt-2 text-2xl font-semibold">
            {Number(totalRevenue).toLocaleString("vi-VN")}đ
          </p>
          <p className="mt-1 text-xs text-slate-400">Giao dịch thành công</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Giao dịch thành công</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{successCount}</p>
          <p className="mt-1 text-xs text-slate-500">Đã thanh toán</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Giao dịch khác</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{otherCount}</p>
          <p className="mt-1 text-xs text-slate-500">Thất bại / Đang xử lý</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-medium text-slate-500">Tổng giao dịch</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{totalCount}</p>
          <p className="mt-1 text-xs text-slate-500">Tất cả trạng thái</p>
        </div>
      </div>

      {/* Phân bổ theo tháng */}
      {byMonth.length > 0 && (
        <section className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-900 px-4 py-3 border-b border-slate-100">
            Doanh thu theo tháng
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2">Tháng</th>
                  <th className="px-4 py-2">Số giao dịch</th>
                  <th className="px-4 py-2">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byMonth.map((row) => (
                  <tr key={row.month_key} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-900">
                      {MONTH_NAMES[(row.month || 1) - 1]}/{row.year}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{row.tx_count}</td>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {Number(row.revenue || 0).toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Doanh thu theo khóa học */}
      {byCourse.length > 0 && (
        <section className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-900 px-4 py-3 border-b border-slate-100">
            Doanh thu theo khóa học (Top 10)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-medium text-slate-500">
                  <th className="px-4 py-2">Khóa học</th>
                  <th className="px-4 py-2">Số giao dịch</th>
                  <th className="px-4 py-2">Doanh thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byCourse.map((row) => (
                  <tr key={row.course_id || row.course_title} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-900">{row.course_title || "—"}</td>
                    <td className="px-4 py-2 text-slate-600">{row.tx_count}</td>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {Number(row.revenue || 0).toLocaleString("vi-VN")}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Trạng thái giao dịch */}
      {statusCounts.length > 0 && (
        <section className="rounded-xl bg-white shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Phân loại theo trạng thái</h2>
          <div className="flex flex-wrap gap-3">
            {statusCounts.map((s) => (
              <span
                key={s.status || "null"}
                className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                {s.status || "(trống)"}: {s.cnt}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Giao dịch gần đây */}
      <section className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-slate-900 px-4 py-3 border-b border-slate-100">
          Giao dịch gần đây (50 mục)
        </h2>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Học viên</th>
                <th className="px-4 py-2">Khóa học</th>
                <th className="px-4 py-2">Giáo viên</th>
                <th className="px-4 py-2">Số tiền</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Chưa có giao dịch
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 text-slate-900">{p.student_name || p.student_email || "—"}</td>
                    <td className="px-4 py-2 text-slate-600">{p.course_title || "—"}</td>
                    <td className="px-4 py-2 text-slate-600">{p.teacher_name || "—"}</td>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {Number(p.amount || 0).toLocaleString("vi-VN")}đ
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded px-1.5 py-0.5 text-[11px] font-medium ${
                          ["COMPLETED", "SUCCESS", "PAID"].includes(p.status)
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.status || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-500 text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleString("vi-VN") : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default RevenuePage;
