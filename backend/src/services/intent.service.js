function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function detectIntent(message = "") {
  const text = normalizeText(message);

  if (!text) {
    return { type: "small_talk", confidence: "low" };
  }

  if (
    /^(chao|chào|hi|hello|hey|xin chao|xin chào|alo|thanks|thank you|cam on|cảm ơn|bye|tạm biệt|tam biet|ok|oke|okay)$/.test(
      text
    )
  ) {
    return { type: "small_talk", confidence: "high" };
  }

  if (
    /so sanh|khac nhau|khác nhau|nen hoc|nên học|hay la|hay|tot hon|tốt hơn|phu hop hon|phù hợp hơn/.test(
      text
    ) &&
    /ielts|toeic|giao tiep|giao tiếp|conversation|speaking|khoa hoc|khóa học/.test(
      text
    )
  ) {
    return { type: "course_comparison", confidence: "high" };
  }

  if (
    /hoc phi|học phí|gia|giá|bao nhieu tien|bao nhiêu tiền|mien phi|miễn phí|ngan sach|ngân sách|duoi|dưới|\b\d+\s*(k|ngan|ngàn|trieu|triệu|cu|m)\b/.test(
      text
    )
  ) {
    return { type: "price_question", confidence: "high" };
  }

  if (
    /lich hoc|lịch học|buoi toi|buổi tối|cuoi tuan|cuối tuần|bao lau|bao lâu|thoi luong|thời lượng|may buoi|mấy buổi|online|offline|truc tuyen|trực tuyến|truc tiep|trực tiếp/.test(
      text
    )
  ) {
    return { type: "schedule_question", confidence: "medium" };
  }

  if (/giang vien|giảng viên|giao vien|giáo viên|ai day|ai dạy|teacher/.test(text)) {
    return { type: "teacher_question", confidence: "medium" };
  }

  if (
    /dang ky|đăng ký|ghi danh|hoc thu|học thử|hoan tien|hoàn tiền|chung chi|chứng chỉ|uu dai|ưu đãi|khuyen mai|khuyến mãi|chinh sach|chính sách|thanh toan|thanh toán|mua khoa hoc|mua khóa học/.test(
      text
    )
  ) {
    return { type: "policy_question", confidence: "high" };
  }

  if (
    /mat goc|mất gốc|cach hoc|cách học|meo hoc|mẹo học|phuong phap hoc|phương pháp học|hoc nhu the nao|học như thế nào|lam sao hoc|làm sao học|tu vung|từ vựng|speaking|listening|grammar|ngu phap|ngữ pháp|phan xa|phản xạ|lo trinh|lộ trình/.test(
      text
    )
  ) {
    return { type: "learning_guidance", confidence: "medium" };
  }

  if (
    /khoa hoc|khóa học|ielts|toeic|giao tiep|giao tiếp|conversation|beginner|co ban|cơ bản|nhap mon|nhập môn/.test(
      text
    )
  ) {
    return { type: "course_recommendation", confidence: "medium" };
  }

  if (
    /code|lap trinh|lập trình|java|c\+\+|python|giai toan|giải toán|thoi tiet|thời tiết|bong da|bóng đá|chung khoan|chứng khoán/.test(
      text
    )
  ) {
    return { type: "out_of_scope", confidence: "high" };
  }

  return { type: "general_learning", confidence: "low" };
}

module.exports = {
  normalizeText,
  detectIntent,
};