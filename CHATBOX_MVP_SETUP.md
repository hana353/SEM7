# Chatbox MVP setup

## Đã thêm
- Backend route `POST /api/chat/message`
- Backend route `POST /api/chat/leads`
- Backend route `GET /api/chat/faqs`
- React component `frontend/src/components/chat/ChatWidget.jsx`
- Bảng SQL `chat_leads` trong `database/init.sql`

## Cách hoạt động
1. Người dùng hỏi trong chatbox.
2. Backend ưu tiên FAQ / keyword trước.
3. Backend lấy các khóa học từ SQL Server local để gợi ý.
4. Nếu có `GEMINI_API_KEY` thì thử dùng Gemini để trả lời tự nhiên hơn.
5. Người dùng có thể để lại lead qua form.

## Biến môi trường nên có ở backend
- `DB_HOST` (mặc định `localhost`)
- `DB_PORT` (mặc định `1433`)
- `DB_NAME` (mặc định `SEM7`)
- `DB_USER` (mặc định `sa`)
- `DB_PASSWORD` (mặc định `12345`)
- `GEMINI_API_KEY` (không bắt buộc)
- `GEMINI_MODEL` (không bắt buộc, mặc định `gemini-2.0-flash`)

## Lưu ý
- Cần chạy lại script SQL hoặc tạo bảng `chat_leads` trong database trước khi dùng form gửi lead.
- Nếu chưa có `GEMINI_API_KEY`, chatbox vẫn chạy theo FAQ + rule-based.