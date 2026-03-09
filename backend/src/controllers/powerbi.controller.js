// Power BI Embedded: lấy embed token để nhúng report trong app (admin không cần đăng nhập Power BI).
//
// Thêm vào file .env:
//   POWERBI_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//   POWERBI_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//   POWERBI_CLIENT_SECRET=your_client_secret
//   POWERBI_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//   POWERBI_REPORT_ID_DASHBOARD=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//   POWERBI_REPORT_ID_REVENUE=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
//
// Cách lấy: Azure Portal > App registration > Power BI Service trong workspace (Report.Read.All, Dataset.Read.All).
// Bật "Allow service principals to use Power BI APIs" trong Power BI admin portal.

const POWERBI_SCOPE = "https://analysis.windows.net/powerbi/api/.default";
const POWERBI_AUTHORITY = "https://login.microsoftonline.com";
const POWERBI_API = "https://api.powerbi.com/v1.0/myorg";

const REPORT_IDS = {
  dashboard: process.env.POWERBI_REPORT_ID_DASHBOARD,
  revenue: process.env.POWERBI_REPORT_ID_REVENUE,
};

async function getAzureAdToken() {
  const tenantId = process.env.POWERBI_TENANT_ID;
  const clientId = process.env.POWERBI_CLIENT_ID;
  const clientSecret = process.env.POWERBI_CLIENT_SECRET;
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Power BI: thiếu POWERBI_TENANT_ID, POWERBI_CLIENT_ID hoặc POWERBI_CLIENT_SECRET");
  }
  const url = `${POWERBI_AUTHORITY}/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: POWERBI_SCOPE,
  });
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Power BI Azure AD: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function getReportEmbedUrl(accessToken, reportId) {
  const workspaceId = process.env.POWERBI_WORKSPACE_ID;
  if (!workspaceId) throw new Error("Power BI: thiếu POWERBI_WORKSPACE_ID");
  const url = `${POWERBI_API}/groups/${workspaceId}/reports/${reportId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Power BI Get Report: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.embedUrl;
}

async function getEmbedToken(accessToken, reportId) {
  const workspaceId = process.env.POWERBI_WORKSPACE_ID;
  if (!workspaceId) throw new Error("Power BI: thiếu POWERBI_WORKSPACE_ID");
  const url = `${POWERBI_API}/groups/${workspaceId}/reports/${reportId}/GenerateToken`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ accessLevel: "View" }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Power BI GenerateToken: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.token;
}

async function getEmbedConfig(reportKey) {
  const reportId = REPORT_IDS[reportKey];
  if (!reportId) {
    throw new Error(`Power BI: không có report cho key "${reportKey}". Dùng ?report=dashboard hoặc ?report=revenue và cấu hình POWERBI_REPORT_ID_* trong .env`);
  }
  const accessToken = await getAzureAdToken();
  const [embedUrl, accessTokenEmbed] = await Promise.all([
    getReportEmbedUrl(accessToken, reportId),
    getEmbedToken(accessToken, reportId),
  ]);
  return { embedUrl, accessToken: accessTokenEmbed, reportId };
}

async function getEmbed(req, res) {
  try {
    const report = (req.query.report || "dashboard").toLowerCase();
    if (report !== "dashboard" && report !== "revenue") {
      return res.status(400).json({
        message: "Query param 'report' phải là 'dashboard' hoặc 'revenue'",
      });
    }
    const config = await getEmbedConfig(report);
    res.json(config);
  } catch (err) {
    console.error("Power BI embed error:", err.message);
    res.status(500).json({
      message: "Không thể lấy cấu hình nhúng Power BI",
      detail: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
}

module.exports = { getEmbed };
