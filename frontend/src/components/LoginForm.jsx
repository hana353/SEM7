import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore if response isn't JSON
      }

      if (!res.ok) {
        throw new Error(data?.message || "Đăng nhập thất bại");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      navigate("/studenthomepage");
    } catch (err) {
      if (err?.name === "TypeError" && String(err?.message).includes("fetch")) {
        setError(
          "Không kết nối được backend (Failed to fetch).\n- Hãy chạy backend và kiểm tra port.\n- Nếu backend không chạy ở 3000, set VITE_API_URL trong frontend.\nVí dụ: VITE_API_URL=http://localhost:3000"
        );
      } else {
        setError(err.message || "Đăng nhập thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-semibold mb-4 text-center">Đăng nhập</h2>

      {error && (
        <p className="mb-3 text-sm text-red-600 text-center whitespace-pre-line">
          {error}
        </p>
      )}

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="login-email">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
          required
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 mb-1" htmlFor="login-password">
          Mật khẩu
        </label>
        <input
          id="login-password"
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
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
