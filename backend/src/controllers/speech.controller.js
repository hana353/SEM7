const { transcribeWithGemini } = require("../services/speech.service");

async function transcribe(req, res) {
  try {
    const { audioBase64, mimeType, language } = req.body || {};
    const text = await transcribeWithGemini({ audioBase64, mimeType, language });
    res.json({ ok: true, data: { text } });
  } catch (err) {
    console.error("[speech.transcribe] error:", err);
    const status = err?.statusCode || 500;
    if (status === 429 && err?.retryAfterSeconds) {
      res.set("Retry-After", String(err.retryAfterSeconds));
    }
    res.status(status).json({
      ok: false,
      message: err?.message || "Speech transcribe error",
      retryAfterSeconds: err?.retryAfterSeconds ?? null,
    });
  }
}

module.exports = {
  transcribe,
};

