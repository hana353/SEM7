const axios = require("axios");
const sql = require("mssql");
const crypto = require("crypto");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || process.env.DB_HOST,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool;
let refreshInFlight = null;
let autoRefreshTimer = null;
let resolvedGroqModel = null;
const requireRealAi =
  String(process.env.AI_REQUIRE_REAL_MODEL || "false").toLowerCase() ===
  "true";

function isLocalFallbackModel(modelName) {
  return String(modelName || "").startsWith("local-fallback");
}

function validateDbConfig() {
  const missing = [];

  if (!dbConfig.user) missing.push("DB_USER");
  if (!dbConfig.password) missing.push("DB_PASSWORD");
  if (!dbConfig.server) missing.push("DB_SERVER or DB_HOST");
  if (!dbConfig.database) missing.push("DB_DATABASE or DB_NAME");

  if (missing.length) {
    throw new Error(`Missing DB config in .env: ${missing.join(", ")}`);
  }
}

async function getPool() {
  if (!pool) {
    validateDbConfig();
    pool = await sql.connect(dbConfig);
  }
  return pool;
}

async function getDashboardSummary() {
  const db = await getPool();
  console.log("[AI] getDashboardSummary started");

  // 2 tháng gần nhất từ view thật của em
  const monthlyQuery = `
    WITH monthly AS (
      SELECT TOP 2
        revenue_month,
        revenue_year,
        revenue_month_no,
        total_orders,
        success_orders,
        failed_orders,
        pending_orders,
        success_revenue,
        ROW_NUMBER() OVER (
          ORDER BY revenue_year DESC, revenue_month_no DESC
        ) AS rn
      FROM dbo.vw_payment_monthly
      ORDER BY revenue_year DESC, revenue_month_no DESC
    )
    SELECT * FROM monthly ORDER BY rn;
  `;

  // Top course theo doanh thu: phải lấy từ payments + courses vì vw_course_overview không có total_revenue
  const topRevenueCourseQuery = `
    SELECT TOP 1
      c.title AS course_title,
      SUM(CASE WHEN p.status = 'SUCCESS' THEN p.amount ELSE 0 END) AS total_revenue
    FROM dbo.payments p
    JOIN dbo.courses c
      ON c.id = p.course_id
    GROUP BY c.title
    ORDER BY total_revenue DESC, c.title ASC;
  `;

  // Top course theo enrollments từ view thật
  const topEnrollmentCourseQuery = `
    SELECT TOP 1
      title AS course_title,
      total_enrollments
    FROM dbo.vw_course_overview
    ORDER BY total_enrollments DESC, title ASC;
  `;

  // Course có progress thấp nhất
  const lowestProgressCourseQuery = `
    SELECT TOP 1
      course_title,
      AVG(CAST(progress_percent AS FLOAT)) AS avg_progress
    FROM dbo.vw_learning_performance
    GROUP BY course_title
    ORDER BY avg_progress ASC, course_title ASC;
  `;

  // Course có điểm test thấp nhất
  const lowestScoreCourseQuery = `
    SELECT TOP 1
      course_title,
      AVG(CAST(score_percent AS FLOAT)) AS avg_score
    FROM dbo.vw_learning_performance
    WHERE score_percent IS NOT NULL
    GROUP BY course_title
    ORDER BY avg_score ASC, course_title ASC;
  `;

  // Trung bình progress + điểm test
  const averageLearningQuery = `
    SELECT
      AVG(CAST(progress_percent AS FLOAT)) AS avg_progress,
      AVG(CAST(score_percent AS FLOAT)) AS avg_test_score
    FROM dbo.vw_learning_performance;
  `;

  // Trung bình phát âm lấy trực tiếp từ bảng thật
  const averagePronunciationQuery = `
    SELECT
      AVG(CAST(accuracy_percent AS FLOAT)) AS avg_pronunciation
    FROM dbo.pronunciation_practice;
  `;

  const [
    monthlyResult,
    topRevenueResult,
    topEnrollmentResult,
    lowestProgressResult,
    lowestScoreResult,
    averageLearningResult,
    averagePronunciationResult,
  ] = await Promise.all([
    db.request().query(monthlyQuery),
    db.request().query(topRevenueCourseQuery),
    db.request().query(topEnrollmentCourseQuery),
    db.request().query(lowestProgressCourseQuery),
    db.request().query(lowestScoreCourseQuery),
    db.request().query(averageLearningQuery),
    db.request().query(averagePronunciationQuery),
  ]);

  const monthlyRows = monthlyResult.recordset || [];
  const current = monthlyRows.find((x) => x.rn === 1) || {};
  const previous = monthlyRows.find((x) => x.rn === 2) || {};

  const topRevenue = topRevenueResult.recordset?.[0] || {};
  const topEnrollment = topEnrollmentResult.recordset?.[0] || {};
  const lowestProgress = lowestProgressResult.recordset?.[0] || {};
  const lowestScore = lowestScoreResult.recordset?.[0] || {};
  const avgLearning = averageLearningResult.recordset?.[0] || {};
  const avgPronunciation = averagePronunciationResult.recordset?.[0] || {};

  return {
    currentMonthRevenue: Number(current.success_revenue || 0),
    previousMonthRevenue: Number(previous.success_revenue || 0),
    totalOrders: Number(current.total_orders || 0),
    successOrders: Number(current.success_orders || 0),
    failedOrders: Number(current.failed_orders || 0),
    pendingOrders: Number(current.pending_orders || 0),
    topRevenueCourse: topRevenue.course_title || "",
    topEnrollmentCourse: topEnrollment.course_title || "",
    lowestProgressCourse: lowestProgress.course_title || "",
    lowestTestScoreCourse: lowestScore.course_title || "",
    averageProgress: Number(avgLearning.avg_progress || 0).toFixed(2),
    averageTestScore: Number(avgLearning.avg_test_score || 0).toFixed(2),
    averagePronunciation: Number(avgPronunciation.avg_pronunciation || 0).toFixed(2),
  };
}

function buildPrompt(summary) {
  return `
Bạn là trợ lý phân tích dashboard cho nền tảng học tiếng Anh.

Hãy phân tích dữ liệu sau và trả về JSON hợp lệ với đúng 3 key:
- revenue_advice
- learning_advice
- priority_action

Yêu cầu:
- Viết bằng tiếng Việt
- Chi tiết, thực tế, chuyên nghiệp
- Không dùng markdown
- Chỉ trả JSON, không giải thích thêm
- Mỗi value nên dài khoảng 80-140 từ, rõ ràng, dễ hành động
- Mỗi value cần có đủ 4 phần theo thứ tự:
  1) Nhận định nhanh từ dữ liệu hiện tại
  2) Nguyên nhân khả dĩ
  3) Hành động cụ thể (ít nhất 3 hành động)
  4) KPI theo dõi trong 7-14 ngày tới
- Với revenue_advice: tập trung doanh thu, đơn thành công/thất bại, khóa học tạo doanh thu
- Với learning_advice: tập trung progress, điểm test, phát âm, khóa học yếu
- Với priority_action: chỉ chọn 1 ưu tiên quan trọng nhất tuần này, nêu owner đề xuất và deadline

Dữ liệu:
- Doanh thu tháng này: ${summary.currentMonthRevenue}
- Doanh thu tháng trước: ${summary.previousMonthRevenue}
- Tổng đơn tháng này: ${summary.totalOrders}
- Đơn thành công: ${summary.successOrders}
- Đơn thất bại: ${summary.failedOrders}
- Đơn chờ xử lý: ${summary.pendingOrders}
- Khóa doanh thu cao nhất: ${summary.topRevenueCourse}
- Khóa nhiều đăng ký nhất: ${summary.topEnrollmentCourse}
- Khóa có tiến độ thấp nhất: ${summary.lowestProgressCourse}
- Khóa có điểm test thấp nhất: ${summary.lowestTestScoreCourse}
- Progress trung bình: ${summary.averageProgress}
- Điểm test trung bình: ${summary.averageTestScore}
- Độ chính xác phát âm trung bình: ${summary.averagePronunciation}
  `.trim();
}

function buildLocalFallbackRecommendation(summary) {
  const revenueTrend =
    Number(summary.currentMonthRevenue || 0) >= Number(summary.previousMonthRevenue || 0)
      ? "Doanh thu tháng này đang ổn định hoặc tăng; nên duy trì chiến dịch cho khóa đang bán tốt và theo dõi tỉ lệ đơn thành công hằng ngày."
      : "Doanh thu tháng này thấp hơn tháng trước; nên ưu tiên chiến dịch ngắn hạn cho khóa có tiềm năng và rà soát nguyên nhân đơn thất bại.";

  const learningAdvice =
    summary.lowestProgressCourse || summary.lowestTestScoreCourse
      ? `Tập trung cải thiện khóa ${summary.lowestProgressCourse || summary.lowestTestScoreCourse}: bổ sung bài luyện ngắn, nhắc học định kỳ và theo dõi tiến độ theo tuần.`
      : "Dữ liệu học tập chưa đủ sâu; nên theo dõi thêm progress, điểm test và độ chính xác phát âm để tạo kế hoạch can thiệp.";

  return {
    revenue_advice: revenueTrend,
    learning_advice: learningAdvice,
    priority_action:
      "Ưu tiên tuần này: tăng tỉ lệ đơn thành công và mở chiến dịch tái kích hoạt cho nhóm học viên tiến độ thấp.",
    _modelName: "local-fallback-rate-limited",
  };
}

function sanitizeAdviceText(value) {
  return String(value == null ? "" : value)
    .replace(/\u0000/g, "")
    .trim();
}

function normalizeAdviceValue(value) {
  if (typeof value === "string") {
    return sanitizeAdviceText(value);
  }

  if (!value || typeof value !== "object") {
    return sanitizeAdviceText(value);
  }

  const quick = sanitizeAdviceText(value["nhận định nhanh"] || value.nhan_dinh_nhanh || "");
  const cause = sanitizeAdviceText(value["nguyên nhân khả dĩ"] || value.nguyen_nhan_kha_di || "");
  const actionsRaw = value["hành động cụ thể"] || value.hanh_dong_cu_the || [];
  const kpi = sanitizeAdviceText(value["kpi theo dõi"] || value.kpi_theo_doi || "");
  const actions = Array.isArray(actionsRaw)
    ? actionsRaw.map((x, i) => `${i + 1}. ${sanitizeAdviceText(x)}`).filter(Boolean).join(" ")
    : sanitizeAdviceText(actionsRaw);

  const composed = [
    quick ? `Nhận định: ${quick}` : "",
    cause ? `Nguyên nhân: ${cause}` : "",
    actions ? `Hành động: ${actions}` : "",
    kpi ? `KPI: ${kpi}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return sanitizeAdviceText(composed || JSON.stringify(value));
}

function parseAdviceFromRawText(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/\r/g, "")
    .trim();

  const blocks = cleaned
    .split(/\n\s*\n+/)
    .map((x) => x.trim())
    .filter(Boolean);

  if (blocks.length >= 3) {
    return {
      revenue_advice: blocks[0],
      learning_advice: blocks[1],
      priority_action: blocks.slice(2).join("\n\n"),
    };
  }

  const lines = cleaned
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

  if (lines.length >= 3) {
    return {
      revenue_advice: lines[0],
      learning_advice: lines[1],
      priority_action: lines.slice(2).join(" "),
    };
  }

  return {
    revenue_advice: cleaned,
    learning_advice: cleaned,
    priority_action: cleaned,
  };
}

function extractJson(text) {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error(`AI trả về không phải JSON hợp lệ: ${cleaned}`);
    }

    const extracted = match[0].replace(/,\s*([}\]])/g, "$1");
    try {
      return JSON.parse(extracted);
    } catch (parseError) {
      // Fallback for object-literal style outputs (single quotes / unquoted keys)
      try {
        return Function(`"use strict"; return (${extracted});`)();
      } catch {
        throw parseError;
      }
    }
  }
}

function maskKey(value) {
  const text = String(value || "");
  if (!text) return "";
  if (text.length <= 8) return "****";
  return `${text.slice(0, 4)}...${text.slice(-4)}`;
}

function logGroqKeyStatus() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn("[AI] GROQ_API_KEY missing - AI recommendation refresh cannot call Groq.");
    return false;
  }

  console.log(`[AI] GROQ_API_KEY detected: ${maskKey(apiKey)}`);
  return true;
}

function resolveGroqModel() {
  if (resolvedGroqModel) {
    return resolvedGroqModel;
  }

  resolvedGroqModel = String(process.env.GROQ_MODEL || "llama-3.1-8b-instant").trim();
  console.log("[AI] Selected Groq model:", resolvedGroqModel);
  return resolvedGroqModel;
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  const modelName = resolveGroqModel();

  console.log("[AI] callGroq started");
  console.log("[AI] GROQ_API_KEY exists:", !!apiKey);
  console.log("[AI] GROQ_API_KEY masked:", maskKey(apiKey || ""));

  if (!apiKey) {
    throw new Error("Thiếu GROQ_API_KEY trong .env");
  }

  console.log("[AI] Prompt preview:", prompt.slice(0, 500));

  try {
    const requestCompletion = async (messages) => axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: modelName,
        temperature: 0.4,
        max_tokens: 500,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const response = await requestCompletion([
      {
        role: "user",
        content: prompt,
      },
    ]);

    console.log("[AI] Groq HTTP status:", response.status);
    if (response.status >= 200 && response.status < 300) {
      console.log("[AI] Groq authentication success - API key is working.");
    }
    console.log(
      "[AI] Groq raw response preview:",
      JSON.stringify(response.data)?.slice(0, 1000)
    );

    const text = response.data?.choices?.[0]?.message?.content?.trim() || "";

    console.log("[AI] Groq text output:", text);

    let parsed;
    try {
      parsed = extractJson(text);
    } catch (parseError) {
      console.warn("[AI] Groq returned non-strict JSON, requesting JSON repair...");

      const repairResponse = await requestCompletion([
        {
          role: "system",
          content:
            "Convert input text into strict valid JSON object only, with exactly 3 keys: revenue_advice, learning_advice, priority_action. No markdown.",
        },
        {
          role: "user",
          content: text,
        },
      ]);

      const repairedText =
        repairResponse.data?.choices?.[0]?.message?.content?.trim() || "";
      console.log("[AI] Groq repaired JSON output:", repairedText);

      try {
        parsed = extractJson(repairedText);
      } catch (repairParseError) {
        console.warn("[AI] JSON repair still invalid, requesting delimiter format...");

        const delimiterResponse = await requestCompletion([
          {
            role: "system",
            content:
              "You must generate practical Vietnamese advice and return exactly one line with no markdown in format: revenue_advice|||learning_advice|||priority_action",
          },
          {
            role: "user",
            content: `${prompt}\n\nReturn only one delimiter line as instructed.`,
          },
        ]);

        const delimiterText =
          delimiterResponse.data?.choices?.[0]?.message?.content?.trim() || "";
        console.log("[AI] Groq delimiter output:", delimiterText);

        const parts = delimiterText.split("|||").map((x) => x.trim());
        if (parts.length >= 3) {
          const isPlaceholder =
            /^revenue_advice$/i.test(parts[0]) ||
            /^learning_advice$/i.test(parts[1]) ||
            /^priority_action$/i.test(parts[2]);

          if (!isPlaceholder) {
            parsed = {
              revenue_advice: parts[0],
              learning_advice: parts[1],
              priority_action: parts.slice(2).join(" ||| "),
            };
            return {
              revenue_advice: normalizeAdviceValue(parsed.revenue_advice),
              learning_advice: normalizeAdviceValue(parsed.learning_advice),
              priority_action: normalizeAdviceValue(parsed.priority_action),
              _modelName: modelName,
            };
          }
        }

        console.warn("[AI] Delimiter format still invalid, requesting XML-tag format...");
        const xmlResponse = await requestCompletion([
          {
            role: "system",
            content:
              "Return only XML with 3 tags: <revenue_advice>...</revenue_advice><learning_advice>...</learning_advice><priority_action>...</priority_action>",
          },
          {
            role: "user",
            content: `${prompt}\n\nReturn only XML tags as instructed.`,
          },
        ]);

        const xmlText = xmlResponse.data?.choices?.[0]?.message?.content?.trim() || "";
        console.log("[AI] Groq XML output:", xmlText);

        const rev = xmlText.match(/<revenue_advice>([\s\S]*?)<\/revenue_advice>/i)?.[1]?.trim();
        const learn = xmlText.match(/<learning_advice>([\s\S]*?)<\/learning_advice>/i)?.[1]?.trim();
        const prio = xmlText.match(/<priority_action>([\s\S]*?)<\/priority_action>/i)?.[1]?.trim();

        if (!rev || !learn || !prio) {
          console.warn("[AI] XML format invalid, fallback to plain text extraction.");
          parsed = parseAdviceFromRawText(repairedText || text);
        } else {
          parsed = {
            revenue_advice: rev,
            learning_advice: learn,
            priority_action: prio,
          };
        }
      }
    }

    console.log("[AI] Parsed Groq JSON:", parsed);

    return {
      revenue_advice: normalizeAdviceValue(parsed.revenue_advice),
      learning_advice: normalizeAdviceValue(parsed.learning_advice),
      priority_action: normalizeAdviceValue(parsed.priority_action),
      _modelName: modelName,
    };
  } catch (error) {
    console.error("[AI] Groq request failed");
    console.error("[AI] status:", error?.response?.status);
    console.error("[AI] data:", error?.response?.data || error.message);
    throw error;
  }
}

async function saveRecommendation(summary, recommendation) {
  const db = await getPool();
  const revenueAdvice = sanitizeAdviceText(recommendation.revenue_advice);
  const learningAdvice = sanitizeAdviceText(recommendation.learning_advice);
  const priorityAction = sanitizeAdviceText(recommendation.priority_action);

  console.log("[AI] saveRecommendation started");
  console.log("[AI] recommendation to save:", {
    ...recommendation,
    revenue_advice: revenueAdvice,
    learning_advice: learningAdvice,
    priority_action: priorityAction,
  });

  await db
    .request()
    .input("scope_type", sql.NVarChar(50), "global")
    .input("scope_value", sql.NVarChar(255), null)
    .input(
      "revenue_advice",
      sql.NVarChar(sql.MAX),
      revenueAdvice
    )
    .input(
      "learning_advice",
      sql.NVarChar(sql.MAX),
      learningAdvice
    )
    .input(
      "priority_action",
      sql.NVarChar(sql.MAX),
      priorityAction
    )
    .input("raw_summary", sql.NVarChar(sql.MAX), JSON.stringify(summary))
    .input("model_name", sql.NVarChar(100), recommendation._modelName || resolveGroqModel())
    .query(`
      INSERT INTO dbo.ai_dashboard_recommendations (
        scope_type,
        scope_value,
        revenue_advice,
        learning_advice,
        priority_action,
        raw_summary,
        model_name
      )
      VALUES (
        @scope_type,
        @scope_value,
        @revenue_advice,
        @learning_advice,
        @priority_action,
        @raw_summary,
        @model_name
      )
    `);

  console.log("[AI] saveRecommendation success");
}

function hashSummary(summary) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(summary || {}))
    .digest("hex");
}

async function getLatestRecommendationRaw() {
  const db = await getPool();

  const result = await db.request().query(`
    SELECT TOP 1
      id,
      scope_type,
      scope_value,
      revenue_advice,
      learning_advice,
      priority_action,
      raw_summary,
      model_name,
      generated_at
    FROM dbo.vw_ai_dashboard_recommendation_latest
    WHERE scope_type = 'global'
    ORDER BY generated_at DESC, id DESC
  `);

  return result.recordset?.[0] || null;
}

async function ensureFreshRecommendation(options = {}) {
  const { force = false, reason = "manual" } = options;

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    console.log(`[AI] ensureFreshRecommendation reason=${reason} force=${force}`);

    const summary = await getDashboardSummary();
    const currentHash = hashSummary(summary);
    const latest = await getLatestRecommendationRaw();

    let latestHash = null;
    if (latest?.raw_summary) {
      try {
        latestHash = hashSummary(JSON.parse(latest.raw_summary));
      } catch (error) {
        console.warn("[AI] Latest raw_summary is invalid JSON, regenerating recommendation.");
      }
    }

    if (!force && latestHash && latestHash === currentHash) {
      if (requireRealAi && isLocalFallbackModel(latest?.model_name)) {
        console.warn(
          "[AI] Latest recommendation is local fallback while AI_REQUIRE_REAL_MODEL=true, forcing Groq regeneration."
        );
      } else {
      return {
        refreshed: false,
        reason: "no_data_change",
        summary,
        recommendation: latest
          ? {
              revenue_advice: latest.revenue_advice || "",
              learning_advice: latest.learning_advice || "",
              priority_action: latest.priority_action || "",
            }
          : null,
      };
      }
    }

    const prompt = buildPrompt(summary);
    let recommendation;
    try {
      recommendation = await callGroq(prompt);
    } catch (error) {
      const isRateLimited = error?.response?.status === 429;

      if (requireRealAi) {
        throw new Error(
          `AI_REQUIRE_REAL_MODEL=true: Groq unavailable (${error?.response?.status || error?.message || "unknown_error"})`
        );
      }

      if (isRateLimited && latest) {
        console.warn("[AI] Groq rate limited (429), fallback to latest stored recommendation.");
        return {
          refreshed: false,
          reason: "groq_rate_limited_using_latest",
          summary,
          recommendation: {
            revenue_advice: latest.revenue_advice || "",
            learning_advice: latest.learning_advice || "",
            priority_action: latest.priority_action || "",
          },
        };
      }

      if (isRateLimited) {
        console.warn("[AI] Groq rate limited (429), generating local fallback recommendation.");
        recommendation = buildLocalFallbackRecommendation(summary);
      } else {
        throw error;
      }
    }

    await saveRecommendation(summary, recommendation);

    return {
      refreshed: true,
      reason: force ? "force" : "data_changed",
      summary,
      recommendation,
    };
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function generateAndSaveRecommendation() {
  return ensureFreshRecommendation({ force: true, reason: "manual_refresh_endpoint" });
}

async function getLatestRecommendation() {
  await ensureFreshRecommendation({ force: false, reason: "latest_endpoint" });
  return getLatestRecommendationRaw();
}

function startAiDashboardAutoRefresh() {
  if (autoRefreshTimer) return;

  logGroqKeyStatus();
  console.log("[AI] AI_REQUIRE_REAL_MODEL:", requireRealAi);

  const enabled = String(process.env.AI_DASHBOARD_AUTO_REFRESH_ENABLED || "true").toLowerCase() !== "false";
  if (!enabled) {
    console.log("[AI] Auto refresh disabled by AI_DASHBOARD_AUTO_REFRESH_ENABLED=false");
    return;
  }

  const intervalMs = Number(process.env.AI_DASHBOARD_AUTO_REFRESH_MS || 60000);
  console.log(`[AI] Auto refresh started, interval=${intervalMs}ms`);

  autoRefreshTimer = setInterval(async () => {
    try {
      const result = await ensureFreshRecommendation({ force: false, reason: "scheduler" });
      if (result?.refreshed) {
        console.log("[AI] Auto refresh inserted a new recommendation");
      }
    } catch (error) {
      console.error("[AI] Auto refresh failed:", error?.response?.data || error?.message || error);

      const message = String(error?.message || "");
      const isDbConfigError = message.includes("Missing DB config in .env");
      if (isDbConfigError) {
        console.error("[AI] Stop auto refresh until DB env is fixed.");
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
      }
    }
  }, intervalMs);

  // Run once on startup so first user refresh can read fresh recommendation immediately.
  ensureFreshRecommendation({ force: false, reason: "startup" }).catch((error) => {
    console.error("[AI] Startup refresh failed:", error?.response?.data || error?.message || error);
  });
}

module.exports = {
  ensureFreshRecommendation,
  generateAndSaveRecommendation,
  getLatestRecommendation,
  startAiDashboardAutoRefresh,
};