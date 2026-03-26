const express = require("express");
const router = express.Router();

const {
  refreshAiDashboardRecommendation,
  getLatestAiDashboardRecommendation,
} = require("../controllers/aiDashboardController");

router.post("/refresh", refreshAiDashboardRecommendation);
router.get("/latest", getLatestAiDashboardRecommendation);

module.exports = router;