import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async e => {
    e.preventDefault();
    setError("");
    setInfo("");
    setOtpCode("");

    setLoading(true);
    try {
      const body = {
        email,
        password,
        full_name: name,
        phone: phone || null,
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore if response isn't JSON
      }

      if (!res.ok) {
        throw new Error(data?.message || "Đăng ký thất bại");
      }

      setInfo(
        data?.message ||
          "Đã đăng ký, mã OTP đã được gửi tới email. Vui lòng kiểm tra hộp thư."
      );
      setOtpStep(true);
    } catch (err) {
      if (err?.name === "TypeError" && String(err?.message).includes("fetch")) {
        setError(
          "Không kết nối được backend (Failed to fetch).\n- Hãy chạy backend và kiểm tra port.\n- Mặc định FE gọi `/api/...` (Vite proxy sang `http://localhost:3000`).\n- Nếu backend chạy port khác, set VITE_API_URL trong frontend.\nVí dụ: VITE_API_URL=http://localhost:3000"
        );
      } else {
        setError(err.message || "Đăng ký thất bại");
      }
      setOtpStep(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async e => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!otpCode.trim()) {
      setError("Vui lòng nhập mã OTP");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpCode, type: "register" }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore if response isn't JSON
      }

      if (!res.ok) {
        throw new Error(data?.message || "Xác thực OTP thất bại");
      }

      setInfo(data?.message || "Xác thực thành công");

      navigate("/studenthomepage");
    } catch (err) {
      if (err?.name === "TypeError" && String(err?.message).includes("fetch")) {
        setError(
          "Không kết nối được backend (Failed to fetch) khi xác thực OTP.\nHãy chạy backend và kiểm tra URL/port."
        );
      } else {
        setError(err.message || "Xác thực OTP thất bại");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setInfo("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "register" }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore if response isn't JSON
      }

      if (!res.ok) {
        throw new Error(data?.message || "Gửi lại OTP thất bại");
      }

      setInfo(
        data?.message ||
          "Đã gửi lại mã OTP, vui lòng kiểm tra email của bạn."
      );
    } catch (err) {
      if (err?.name === "TypeError" && String(err?.message).includes("fetch")) {
        setError(
          "Không kết nối được backend (Failed to fetch) khi gửi lại OTP.\nHãy chạy backend và kiểm tra URL/port."
        );
      } else {
        setError(err.message || "Gửi lại OTP thất bại");
      }
    }
  };

  return (
    <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Đăng ký</h2>

      {error && (
        <p className="mb-3 text-sm text-red-600 text-center whitespace-pre-line">
          {error}
        </p>
      )}
      {info && (
        <p className="mb-3 text-sm text-emerald-600 text-center whitespace-pre-line">
          {info}
        </p>
      )}

      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="signup-name">
            Họ và tên
          </label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1" htmlFor="signup-phone">
            Số điện thoại (tuỳ chọn)
          </label>
          <input
            id="signup-phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 mb-1"
            htmlFor="signup-password"
          >
            Mật khẩu
          </label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </button>
      </form>

      {otpStep && (
        <div className="mt-6 rounded-lg border border-indigo-100 bg-indigo-50/70 p-4">
          <h3 className="mb-2 text-sm font-semibold text-indigo-800">
            Xác thực email bằng mã OTP
          </h3>
          <p className="mb-3 text-xs text-indigo-700">
            Mã OTP đã được gửi tới email <span className="font-semibold">{email}</span>.
            Vui lòng nhập mã để hoàn tất đăng ký.
          </p>
          <form onSubmit={handleVerifyOtp} className="space-y-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otpCode}
              onChange={e => setOtpCode(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
              placeholder="Nhập mã OTP (6 số)"
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="submit"
                disabled={verifying}
                className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition text-sm disabled:cursor-not-allowed disabled:opacity-70"
              >
                {verifying ? "Đang xác thực..." : "Xác thực OTP"}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-xs font-medium text-indigo-700 hover:text-indigo-900"
              >
                Gửi lại mã
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
