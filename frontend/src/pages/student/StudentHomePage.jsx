export default function StudentHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full rounded-2xl bg-white shadow-md p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          Student Homepage
        </h1>
        <p className="text-sm text-gray-600 mb-4">
          Bạn đã đăng nhập / đăng ký thành công. Đây là trang dành cho học viên.
        </p>
        <p className="text-xs text-gray-400">
          (Bạn có thể tuỳ chỉnh nội dung trang này sau.)
        </p>
      </div>
    </div>
  );
}

