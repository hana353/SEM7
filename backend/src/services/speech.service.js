const { GoogleGenerativeAI } = require("@google/generative-ai");

function requireGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error("Missing GEMINI_API_KEY in environment");
    err.statusCode = 500;
    throw err;
  }
  return key;
}

function normalizeMimeType(mimeType) {
  if (!mimeType) return "audio/webm";
  return String(mimeType).toLowerCase();
}

function getGeminiModelCandidates() {
  const fromEnv = (process.env.GEMINI_MODEL || "").trim();
  const candidates = [
    fromEnv,
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
  ].filter(Boolean);

  return [...new Set(candidates)];
}

function parseRetryAfterSecondsFromMessage(msg) {
  const m = String(msg || "").match(/retry in\s+(\d+(\.\d+)?)s/i);
  if (!m) return null;
  const s = Number(m[1]);
  return Number.isFinite(s) ? Math.ceil(s) : null;
}

async function transcribeWithGemini({ audioBase64, mimeType, language = "en" }) {
  if (!audioBase64 || typeof audioBase64 !== "string") {
    const err = new Error("audioBase64 is required");
    err.statusCode = 400;
    throw err;
  }

  const genAI = new GoogleGenerativeAI(requireGeminiKey());

  const prompt =
    language === "vi"
      ? "Hãy chuyển giọng nói trong audio thành văn bản. Chỉ trả về nội dung đã nói, không thêm giải thích."
      : "Transcribe the speech in the audio to text. Return only the spoken words, no extra explanation.";

  const inlineData = {
    inlineData: {
      mimeType: normalizeMimeType(mimeType),
      data: audioBase64,
    },
  };

  const lastErrors = [];
  for (const modelName of getGeminiModelCandidates()) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([{ text: prompt }, inlineData]);
      const text = result?.response?.text?.() ?? "";
      return String(text).trim();
    } catch (e) {
      lastErrors.push({ modelName, message: e?.message || String(e) });
      const msg = String(e?.message || "");
      const isModelNotFound = msg.includes("404") || msg.includes("not found");
      if (isModelNotFound) continue;

      const isRateLimited =
        msg.includes("429") ||
        msg.toLowerCase().includes("too many requests") ||
        msg.toLowerCase().includes("quota");

      if (isRateLimited) {
        const err = new Error(e?.message || "Gemini rate limit / quota exceeded");
        err.statusCode = 429;
        err.retryAfterSeconds = parseRetryAfterSecondsFromMessage(msg);
        throw err;
      }

      const err = new Error(e?.message || "Gemini request failed");
      err.statusCode = 502;
      throw err;
    }
  }

  const err = new Error(
    `No available Gemini model for generateContent. Tried: ${lastErrors
      .map((x) => `${x.modelName}`)
      .join(", ")}`
  );
  err.statusCode = 502;
  throw err;

}

module.exports = {
  transcribeWithGemini,
};

