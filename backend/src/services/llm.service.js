const Groq = require("groq-sdk");

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Thiếu GROQ_API_KEY");
  }

  return new Groq({ apiKey });
}

async function generateWithGroq(prompt) {
  const client = getGroqClient();
  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  console.log("[LLM] Using Groq model:", model);
  
  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = completion?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq không trả về nội dung");
  }

  return text.trim();
}

async function generateReply(prompt) {
  const provider = (process.env.LLM_PROVIDER || "groq").toLowerCase();

  if (provider !== "groq") {
    throw new Error(`LLM provider không hỗ trợ hoặc chưa cấu hình đúng: ${provider}`);
  }

  try {
    return await generateWithGroq(prompt);
  } catch (error) {
    const message = error?.message || "";

    if (message.includes("rate_limit") || message.includes("429")) {
      throw new Error("GROQ_RATE_LIMIT");
    }

    if (message.includes("401") || message.includes("Unauthorized")) {
      throw new Error("GROQ_AUTH_ERROR");
    }

    throw error;
  }
}

module.exports = {
  generateReply,
};