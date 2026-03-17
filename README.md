HUONG DAN TRIỂN KHAI (TECHNICAL SETUP)
1. Tải Source Code: Download file ZIP và giải nén hoặc git clone dự án về máy.
Truy cap thu muc: Mo terminal (CMD/PowerShell/Terminal) và di chuyển vào thư
mục chứa dự án:
cd SEM7
2. Cài đặt thư viện: Nhập lệnh sau để tự động cài đặt các dependencies cần thiết:
npm install
3. Khởi chạy: Nhập lệnh để chạy giao diện web trên môi trường local:
npm start (Sau đó truy cập địa chỉ http://localhost:5173 trên trình duyệt).

---

TÍCH HỢP AI (GEMINI - VOICE TO TEXT)
- Backend có endpoint: `POST /api/speech/transcribe`
- Cần set biến môi trường ở `backend/.env`:
  - `GEMINI_API_KEY=YOUR_KEY_HERE`


Tài khoản Admin:     admin@gmail.com              Mật khẩu: 123456
Tài khoản Student:   student1@gmail.com           Mật khẩu: 123456
Tài khoản Teacher:   teacher1@gmail.com           Mật khẩu: 123456

Tài khoản demo VNPay bằng thẻ:
Ngân hàng: NCB
Số thẻ: 9704198526191432198
Tên chủ thẻ:NGUYEN VAN A
Ngày phát hành:07/15
Mật khẩu OTP:123456
