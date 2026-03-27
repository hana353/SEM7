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

---

AI DASHBOARD - LOI KHUYEN MOI NHAT

3 nhóm khuyến nghị chi tiết:
Revenue Advice
Learning Advice
Priority Action

Nguon: GET /api/dashboard-ai/latest
Thoi gian sinh gan nhat (UTC): 2026-03-27T04:14:41.440Z
Model: llama-3.1-8b-instant

1. Revenue Advice
Nhan dinh: Doanh thu thang nay la 0 dong, khong co don thanh cong hoac that bai.
Nguyen nhan: Co the do chua co khoa hoc moi duoc phat hanh hoac chua co chien dich quang cao hieu qua.
Hanh dong:
- Phat hanh khoa hoc moi trong thang nay de tang doanh thu.
- Tang cuong quang cao tren cac nen tang xa hoi de thu hut khach hang moi.
- Can nhac giam gia khoa hoc de tang cuong doanh thu.
KPI: Doanh thu thang sau tang 10% so voi thang nay.

2. Learning Advice
Nhan dinh: Progress trung binh la 42.09%, diem test trung binh la 83.33, do chinh xac phat am trung binh la 84.09.
Nguyen nhan: Co the do hoc vien chua co nen tang kien thuc vung chac hoac chua co kinh nghiem thuc hanh.
Hanh dong:
- To chuc khoa hoc bo tro de cai thien kien thuc va ky nang.
- Cung cap them tai lieu va nguon luc de hoc vien luyen tap phat am.
- Tang cuong ho tro tu giao vien de cai thien tien do.
KPI: Progress trung binh tang 5% sau 2 tuan.

3. Priority Action
Nhan dinh: Khoa IELTS Listening Strategy co tien do thap nhat va English Foundation - Beginner co diem test thap nhat.
Nguyen nhan: Hoc vien o hai khoa nay can bo sung nen tang va thuc hanh.
Hanh dong uu tien: Ho tro tap trung cho nhom hoc vien dang hoc 2 khoa tren de cai thien tien do va diem test.

API de cap nhat loi khuyen moi:
- POST /api/dashboard-ai/refresh
- POST /api/dashboard-ai/refresh?force=true
