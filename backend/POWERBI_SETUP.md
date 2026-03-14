# Cấu hình Power BI Embedded (hiển thị trực tiếp không cần đăng nhập Power BI)

Dashboard admin dùng **Power BI Embedded** qua backend: backend lấy embed token (bằng Service Principal), frontend nhúng report bằng token đó. Admin chỉ cần đăng nhập app, không cần đăng nhập Power BI.

## Bước 1: Azure AD App (Service Principal)

1. Vào **Azure Portal** → **Microsoft Entra ID** (Azure AD) → **App registrations** → **New registration**.
2. Đặt tên (vd: `english-center-powerbi`), chọn **Accounts in this organizational directory only** → Register.
3. Vào **Certificates & secrets** → **New client secret** → Copy **Value** (đây là `POWERBI_CLIENT_SECRET`).
4. Vào **Overview** → copy **Application (client) ID** (`POWERBI_CLIENT_ID`) và **Directory (tenant) ID** (`POWERBI_TENANT_ID`).

## Bước 2: Quyền Power BI

1. **Power BI Admin**: Vào https://app.powerbi.com → **Settings** (bánh răng) → **Admin portal** → **Tenant settings** → mục **Developer settings** → bật **Allow service principals to use Power BI APIs**.
2. **Workspace**: Mở workspace chứa report trên Power BI Service → **Access** → thêm **App** (tên app vừa tạo) với quyền **Admin** hoặc **Member**.
3. **API permissions** (Azure AD): Trong App registration → **API permissions** → **Add** → **Power BI Service** → chọn **Application permissions**: `Report.Read.All`, `Dataset.Read.All` (hoặc ReadWrite nếu cần). **Grant admin consent**.

## Bước 3: Lấy Workspace ID và Report ID

1. **Report ID**: Mở report trên Power BI → URL dạng `.../reports/4ca83460-c33f-417d-945e-94c7eba9570e/...` → đoạn GUID sau `/reports/` là Report ID.
2. **Workspace ID** (bắt buộc):
   - Nếu report ở **My Workspace**: Vào https://app.powerbi.com → bấm **My workspace** → sau khi vào, xem thanh địa chỉ. URL có thể chuyển thành dạng `.../groups/XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX/...` → copy đoạn GUID đó vào `POWERBI_WORKSPACE_ID`.
   - Nếu không thấy GUID trong URL: Tạo **workspace mới** (vd: "English Center") → **Move** hoặc publish lại report vào workspace đó → **Access** → thêm app (Service Principal) với quyền Admin → mở workspace, copy **Workspace ID** từ URL (hoặc Workspace settings).

## Bước 4: Cấu hình .env backend

Thêm vào `backend/.env`:

```env
POWERBI_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWERBI_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWERBI_CLIENT_SECRET=your_client_secret_value
POWERBI_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWERBI_REPORT_ID_DASHBOARD=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWERBI_REPORT_ID_REVENUE=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Khởi động lại backend. Vào trang Admin → **Tổng quan** hoặc **Thống kê**: report Power BI sẽ hiển thị trực tiếp (không bắt đăng nhập Power BI).
