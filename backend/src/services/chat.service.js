const {
  getOrCreateSession,
  saveMessage,
  getRecentMessages,
} = require("./memory.service");
const {
  retrieveRelevantCourses,
  retrieveRelevantDocs,
} = require("./retrieval.service");
const {
  buildInternalPrompt,
  buildComparisonPrompt,
  buildPricePrompt,
  buildSchedulePrompt,
  buildTeacherPrompt,
  buildPolicyPrompt,
  buildGuidancePrompt,
  buildGeneralPrompt,
  buildSmallTalkPrompt,
  buildOutOfScopePrompt,
} = require("./prompt.service");
const { generateReply } = require("./llm.service");
const { detectIntent } = require("./intent.service");

function sanitizeAssistantReply(text = "") {
  return String(text || "").trim();
}

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("vi-VN")} VND`;
}

function buildFallbackReply(intentType, courses = []) {
  if (
    intentType === "course_recommendation" ||
    intentType === "price_question"
  ) {
    if (courses.length > 0) {
      return (
        `Mình gợi ý cho bạn một số khóa học phù hợp:\n` +
        courses
          .map(
            (course, index) =>
              `${index + 1}. ${course.title} - Giá: ${formatPrice(course.price)}`
          )
          .join("\n") +
        `\n\nBạn có thể nói rõ hơn mục tiêu học, ngân sách hoặc trình độ hiện tại để mình lọc chính xác hơn.`
      );
    }

    return "Mình chưa đủ dữ liệu để tư vấn khóa học chính xác. Bạn thử nói rõ mục tiêu học, ngân sách hoặc trình độ hiện tại nhé.";
  }

  if (intentType === "course_comparison") {
    return "Mỗi lựa chọn sẽ phù hợp với mục tiêu khác nhau. Nếu bạn cần thi chứng chỉ hoặc đầu ra học tập thì thường nên ưu tiên IELTS. Nếu mục tiêu là giao tiếp trong công việc và đời sống hằng ngày thì nên ưu tiên giao tiếp.";
  }

  if (intentType === "learning_guidance") {
    return "Mình có thể hỗ trợ định hướng học tiếng Anh theo mục tiêu của bạn. Bạn hãy nói rõ hơn là bạn đang mất gốc, muốn giao tiếp, hay muốn thi IELTS để mình tư vấn sát hơn.";
  }

  if (intentType === "policy_question") {
    return "Mình chưa thấy đủ dữ liệu chính sách trong hệ thống để trả lời chắc chắn. Bạn có thể hỏi cụ thể hơn về đăng ký, học thử, chứng chỉ hoặc thanh toán để mình kiểm tra kỹ hơn.";
  }

  if (intentType === "schedule_question") {
    return "Mình chưa có đủ dữ liệu lịch học chi tiết trong hệ thống. Bạn có thể nói rõ nhu cầu như học online, offline, buổi tối hay cuối tuần để mình hỗ trợ tốt hơn.";
  }

  if (intentType === "teacher_question") {
    return "Mình có thể hỗ trợ kiểm tra giảng viên của khóa học nếu hệ thống có dữ liệu. Bạn hãy nói rõ tên khóa học mà bạn đang quan tâm nhé.";
  }

  if (intentType === "small_talk") {
    return "Xin chào, mình có thể hỗ trợ bạn chọn khóa học phù hợp hoặc giải đáp cách học tiếng Anh.";
  }

  if (intentType === "out_of_scope") {
    return "Mình chủ yếu hỗ trợ tư vấn khóa học tiếng Anh và giải đáp việc học tiếng Anh. Bạn có thể hỏi mình về khóa học, học phí hoặc cách học tiếng Anh nhé.";
  }

  return "Mình có thể hỗ trợ kiến thức học tiếng Anh chung. Bạn hãy hỏi cụ thể hơn như cách học từ vựng, luyện speaking hoặc lộ trình IELTS nhé.";
}

function shouldReturnCourses(intentType) {
  return ["course_recommendation", "price_question"].includes(intentType);
}

async function handleChatMessage({ userId, message }) {
  const cleanMessage = String(message || "").trim();

  if (!userId) throw new Error("userId là bắt buộc");
  if (!cleanMessage) throw new Error("message là bắt buộc");

  const session = await getOrCreateSession(userId);
  await saveMessage(session.id, "user", cleanMessage, {});

  const history = await getRecentMessages(session.id, 8);
  const intent = detectIntent(cleanMessage);

  let courses = [];
  let docs = [];
  let prompt = "";

  if (intent.type === "course_recommendation") {
    courses = await retrieveRelevantCourses(cleanMessage, 4);
    docs = await retrieveRelevantDocs(cleanMessage, 3);
    prompt = buildInternalPrompt({
      userMessage: cleanMessage,
      history,
      courses,
      docs,
    });
  } else if (intent.type === "course_comparison") {
    docs = await retrieveRelevantDocs(cleanMessage, 4);
    courses = await retrieveRelevantCourses(cleanMessage, 2);
    prompt = buildComparisonPrompt({
      userMessage: cleanMessage,
      history,
      courses,
      docs,
    });
  } else if (intent.type === "price_question") {
    courses = await retrieveRelevantCourses(cleanMessage, 4);
    docs = await retrieveRelevantDocs(cleanMessage, 2);
    prompt = buildPricePrompt({
      userMessage: cleanMessage,
      history,
      courses,
      docs,
    });
  } else if (intent.type === "schedule_question") {
    courses = await retrieveRelevantCourses(cleanMessage, 4);
    docs = await retrieveRelevantDocs(cleanMessage, 2);
    prompt = buildSchedulePrompt({
      userMessage: cleanMessage,
      history,
      courses,
      docs,
    });
  } else if (intent.type === "teacher_question") {
    courses = await retrieveRelevantCourses(cleanMessage, 4);
    docs = await retrieveRelevantDocs(cleanMessage, 2);
    prompt = buildTeacherPrompt({
      userMessage: cleanMessage,
      history,
      courses,
      docs,
    });
  } else if (intent.type === "policy_question") {
    courses = await retrieveRelevantCourses(cleanMessage, 2);
    docs = await retrieveRelevantDocs(cleanMessage, 4);
    prompt = buildPolicyPrompt({
      userMessage: cleanMessage,
      history,
      courses,
      docs,
    });
  } else if (intent.type === "learning_guidance") {
    docs = await retrieveRelevantDocs(cleanMessage, 4);
    courses = await retrieveRelevantCourses(cleanMessage, 2);
    prompt = buildGuidancePrompt({
      userMessage: cleanMessage,
      history,
      courses,
      docs,
    });
  } else if (intent.type === "small_talk") {
    prompt = buildSmallTalkPrompt({
      userMessage: cleanMessage,
      history,
    });
  } else if (intent.type === "out_of_scope") {
    prompt = buildOutOfScopePrompt({
      userMessage: cleanMessage,
    });
  } else {
    docs = await retrieveRelevantDocs(cleanMessage, 4);
    prompt = buildGeneralPrompt({
      userMessage: cleanMessage,
      history,
      docs,
    });
  }

  let answer;
  try {
    answer = await generateReply(prompt);
  } catch (error) {
    console.error("[chat.generateReply]", error.message || error);
    answer = buildFallbackReply(intent.type, courses);
  }

  const cleanAnswer = sanitizeAssistantReply(answer);

  await saveMessage(session.id, "assistant", cleanAnswer, {
    intentType: intent.type,
    courses: courses.map((course) => ({
      id: course.id,
      title: course.title,
    })),
    docs: docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
    })),
  });

  return {
    sessionId: session.id,
    intentType: intent.type,
    answer: cleanAnswer,
    suggestedCourses: shouldReturnCourses(intent.type) ? courses : [],
    relatedDocs: docs.map((doc) => ({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      source: doc.source,
    })),
  };
}

module.exports = {
  handleChatMessage,
};