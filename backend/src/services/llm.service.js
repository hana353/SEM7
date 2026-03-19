const { GoogleGenerativeAI } = require("@google/generative-ai");

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu GEMINI_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  return genAI.getGenerativeModel({ model: modelName });
}

async function generateReply(prompt) {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();

  if (!text) {
    throw new Error("Gemini không trả về nội dung");
  }

  return text.trim();
}

module.exports = {
  generateReply,
};