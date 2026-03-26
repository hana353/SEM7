const {
  ensureFreshRecommendation,
  getLatestRecommendation,
} = require("../services/aiDashboardService");

async function refreshAiDashboardRecommendation(req, res) {
  try {
    console.log("[AI] /refresh called");

    const force = String(req.query.force || "false").toLowerCase() === "true";
    const result = await ensureFreshRecommendation({
      force,
      reason: "refresh_endpoint",
    });

    console.log("[AI] refresh success");
    console.log("[AI] recommendation:", result?.recommendation);

    return res.status(200).json({
      success: true,
      message: result.refreshed
        ? "Đã làm mới lời khuyên AI."
        : "Dữ liệu chưa thay đổi, đang dùng lời khuyên mới nhất.",
      data: result,
    });
  } catch (error) {
    console.error("[AI] refreshAiDashboardRecommendation error:");
    console.error(error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: error.message || "Không thể làm mới lời khuyên AI",
    });
  }
}

async function getLatestAiDashboardRecommendation(req, res) {
  try {
    console.log("[AI] /latest called");

    const result = await getLatestRecommendation();

    console.log("[AI] latest recommendation:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[AI] getLatestAiDashboardRecommendation error:");
    console.error(error?.response?.data || error);

    return res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy lời khuyên AI mới nhất",
    });
  }
}

module.exports = {
  refreshAiDashboardRecommendation,
  getLatestAiDashboardRecommendation,
};