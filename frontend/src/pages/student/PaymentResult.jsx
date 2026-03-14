import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const statusMap = {
  success: {
    title: "Thanh toán thành công",
    description: "Cảm ơn bạn! Khóa học đã được kích hoạt, bạn có thể bắt đầu học ngay.",
    color: "emerald",
    icon: (
      <svg
        className="h-12 w-12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path
          d="M7.5 12.75L10.5 15.75L16.5 9.75"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    action: "Tiếp tục học ngay",
  },
  failed: {
    title: "Thanh toán không thành công",
    description: "Giao dịch bị thất bại. Vui lòng thử lại hoặc đổi thẻ/nguồn thanh toán.",
    color: "rose",
    icon: (
      <svg
        className="h-12 w-12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path
          d="M15 9L9 15"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M9 9L15 15"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    action: "Thử lại thanh toán",
  },
  cancel: {
    title: "Giao dịch đã hủy",
    description: "Bạn đã hủy giao dịch. Nếu muốn, hãy thử thanh toán lại.",
    color: "amber",
    icon: (
      <svg
        className="h-12 w-12"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path
          d="M8 12H16"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    action: "Quay lại và thử lại",
  },
};

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");

  useEffect(() => {
    const code = searchParams.get("vnp_ResponseCode") || "99";
    if (code === "00") {
      setStatus("success");
    } else if (code === "24") {
      setStatus("cancel");
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  const data = statusMap[status] || statusMap.failed;
  const amount = searchParams.get("vnp_Amount")
    ? Number(searchParams.get("vnp_Amount")) / 100
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-6 py-14">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className={`inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-${data.color}-500 text-white shadow-lg`}
          >
            {data.icon}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{data.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{data.description}</p>
          </div>
        </div>

        {amount !== null && (
          <div className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Số tiền</span>
              <span className="text-sm font-semibold text-slate-800">
                {amount.toLocaleString("vi-VN")} VND
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate("/studenthomepage")}
            className={`w-full rounded-xl bg-${data.color}-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-${data.color}-700 focus:outline-none focus:ring-2 focus:ring-${data.color}-300`}
          >
            {data.action}
          </button>
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Xem khóa học khác
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Nếu trạng thái vẫn chưa đúng sau khi thanh toán, hãy thử F5 hoặc đăng xuất rồi đăng nhập lại.
        </p>
      </div>
    </div>
  );
}
