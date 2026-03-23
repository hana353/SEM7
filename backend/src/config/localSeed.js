const crypto = require('crypto');

const PASSWORD_HASH_123456 = '$2b$10$LNzoIv2eFrFlYvWXTm9mDO0CTB83ZFAsOt5ugjj7vAfSaWLFVLx62';

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return crypto.randomUUID();
}

function buildSeed() {
  const ts = nowIso();
  const roles = [
    { id: 1, code: 'ADMIN', description: 'System admin' },
    { id: 2, code: 'TEACHER', description: 'Course creator' },
    { id: 3, code: 'STUDENT', description: 'Learner' },
    { id: 4, code: 'GUEST', description: 'Guest' },
  ];

  const users = [
    { id: uid(), email: 'admin@gmail.com', password_hash: PASSWORD_HASH_123456, full_name: 'System Admin', phone: '0900000001', role_id: 1, is_verified: true, is_active: true, is_deleted: false, created_at: ts, updated_at: ts },
    { id: uid(), email: 'teacher1@gmail.com', password_hash: PASSWORD_HASH_123456, full_name: 'John Smith', phone: '0900000002', role_id: 2, is_verified: true, is_active: true, is_deleted: false, created_at: ts, updated_at: ts },
    { id: uid(), email: 'teacher2@gmail.com', password_hash: PASSWORD_HASH_123456, full_name: 'Emma Brown', phone: '0900000003', role_id: 2, is_verified: true, is_active: true, is_deleted: false, created_at: ts, updated_at: ts },
    { id: uid(), email: 'teacher3@gmail.com', password_hash: PASSWORD_HASH_123456, full_name: 'Olivia Taylor', phone: '0900000004', role_id: 2, is_verified: true, is_active: true, is_deleted: false, created_at: ts, updated_at: ts },
    { id: uid(), email: 'teacher4@gmail.com', password_hash: PASSWORD_HASH_123456, full_name: 'David Wilson', phone: '0900000005', role_id: 2, is_verified: true, is_active: true, is_deleted: false, created_at: ts, updated_at: ts },
    { id: uid(), email: 'student1@gmail.com', password_hash: PASSWORD_HASH_123456, full_name: 'Nguyen Minh Anh', phone: '0911000001', role_id: 3, is_verified: true, is_active: true, is_deleted: false, created_at: ts, updated_at: ts },
    { id: uid(), email: 'student2@gmail.com', password_hash: PASSWORD_HASH_123456, full_name: 'Tran Bao Chau', phone: '0911000002', role_id: 3, is_verified: true, is_active: true, is_deleted: false, created_at: ts, updated_at: ts },
  ];

  const userByEmail = Object.fromEntries(users.map((u) => [u.email, u]));

  const courses = [
    { id: uid(), teacher_id: userByEmail['teacher1@gmail.com'].id, title: 'English Pronunciation Starter', description: 'Khóa luyện phát âm cơ bản cho người mới bắt đầu, tập trung vào nguyên âm, phụ âm, trọng âm từ và nối âm để xây nền nghe nói chuẩn hơn.', price: 149000, total_duration_minutes: 300, start_at: null, end_at: null, status: 'ON_SALE', created_at: ts, updated_at: ts },
    { id: uid(), teacher_id: userByEmail['teacher1@gmail.com'].id, title: 'English Foundation - Beginner', description: 'Khóa học cho người mất gốc, bắt đầu từ phát âm, chào hỏi, từ vựng cơ bản và các mẫu câu đơn giản để xây nền tiếng Anh vững chắc.', price: 0, total_duration_minutes: 240, start_at: null, end_at: null, status: 'ON_SALE', created_at: ts, updated_at: ts },
    { id: uid(), teacher_id: userByEmail['teacher1@gmail.com'].id, title: 'English Communication - Elementary', description: 'Nâng từ nền tảng lên giao tiếp cơ bản với các chủ đề quen thuộc như gia đình, công việc, mua sắm, hỏi đường và sinh hoạt hàng ngày.', price: 199000, total_duration_minutes: 360, start_at: null, end_at: null, status: 'ON_SALE', created_at: ts, updated_at: ts },
    { id: uid(), teacher_id: userByEmail['teacher2@gmail.com'].id, title: 'IELTS Foundation - Core Skills', description: 'Khóa nền tảng IELTS cho người mới làm quen, giúp xây lại từ vựng học thuật cơ bản, ngữ pháp nền và tư duy làm bài 4 kỹ năng.', price: 399000, total_duration_minutes: 420, start_at: null, end_at: null, status: 'ON_SALE', created_at: ts, updated_at: ts },
    { id: uid(), teacher_id: userByEmail['teacher2@gmail.com'].id, title: 'IELTS Speaking Foundation', description: 'Dành cho học viên đã có nền giao tiếp cơ bản và muốn chuyển sang luyện thi IELTS Speaking với format bài thi, tiêu chí chấm và kỹ năng mở rộng ý.', price: 499000, total_duration_minutes: 360, start_at: null, end_at: null, status: 'ON_SALE', created_at: ts, updated_at: ts },
    { id: uid(), teacher_id: userByEmail['teacher3@gmail.com'].id, title: 'Travel English Essentials', description: 'Tiếng Anh du lịch với các tình huống thực tế như sân bay, khách sạn, gọi món, hỏi đường, xử lý sự cố và giao tiếp với người bản xứ.', price: 279000, total_duration_minutes: 330, start_at: null, end_at: null, status: 'ON_SALE', created_at: ts, updated_at: ts },
    { id: uid(), teacher_id: userByEmail['teacher2@gmail.com'].id, title: 'Business English Communication', description: 'Khóa học tiếng Anh ứng dụng cho môi trường công việc, tập trung vào email, họp nhóm, trình bày ý tưởng và giao tiếp chuyên nghiệp.', price: 599000, total_duration_minutes: 390, start_at: null, end_at: null, status: 'ON_SALE', created_at: ts, updated_at: ts },
    { id: uid(), teacher_id: userByEmail['teacher4@gmail.com'].id, title: 'Email English for Work', description: 'Khóa học tập trung vào viết email chuyên nghiệp, trả lời khách hàng, follow-up công việc, xác nhận lịch họp và giao tiếp nội bộ.', price: 349000, total_duration_minutes: 300, start_at: null, end_at: null, status: 'ON_SALE', created_at: ts, updated_at: ts },
  ];

  const knowledge_documents = [
    { id: uid(), type: 'guide', title: 'Cách học từ vựng để nhớ lâu', content: 'Để nhớ từ vựng lâu, nên học theo ngữ cảnh, dùng flashcards, ôn lại theo chu kỳ lặp lại ngắt quãng, đặt câu với từ mới và dùng từ đó trong nói hoặc viết.', source: 'manual', tags: ['tu vung', 'nho lau', 'flashcards'], created_at: ts, updated_at: ts },
    { id: uid(), type: 'guide', title: 'Cách luyện speaking hiệu quả', content: 'Để luyện speaking hiệu quả, nên bắt đầu từ câu ngắn, luyện phản xạ với chủ đề quen thuộc, ghi âm lại giọng nói, shadowing theo audio chuẩn và luyện đều mỗi ngày.', source: 'manual', tags: ['speaking', 'phan xa', 'giao tiep'], created_at: ts, updated_at: ts },
    { id: uid(), type: 'guide', title: 'Người mất gốc nên bắt đầu thế nào', content: 'Người mất gốc nên bắt đầu từ phát âm cơ bản, từ vựng thông dụng, mẫu câu giao tiếp đơn giản và duy trì học đều đặn trước khi chuyển sang mục tiêu nâng cao hơn.', source: 'manual', tags: ['mat goc', 'beginner', 'co ban'], created_at: ts, updated_at: ts },
    { id: uid(), type: 'guide', title: 'Nên học IELTS hay giao tiếp', content: 'Nếu mục tiêu là thi chứng chỉ, đầu ra học tập hoặc du học thì nên ưu tiên IELTS. Nếu mục tiêu là sử dụng trong công việc và đời sống hàng ngày thì nên ưu tiên khóa giao tiếp.', source: 'manual', tags: ['ielts', 'giao tiep', 'so sanh'], created_at: ts, updated_at: ts },
    { id: uid(), type: 'guide', title: 'Lộ trình học tiếng Anh từ cơ bản đến nâng cao', content: 'Người học có thể đi theo lộ trình: Pronunciation Starter, Foundation, Elementary, sau đó rẽ sang IELTS hoặc Business English tùy mục tiêu.', source: 'manual', tags: ['lo trinh', 'level up', 'english'], created_at: ts, updated_at: ts },
    { id: uid(), type: 'guide', title: 'Cách viết email tiếng Anh lịch sự', content: 'Một email công việc nên có tiêu đề rõ, lời chào phù hợp, nội dung ngắn gọn, hành động cần thực hiện và phần kết lịch sự.', source: 'manual', tags: ['email', 'business', 'work'], created_at: ts, updated_at: ts },
  ];

  const vocabulary_topics = [
    { id: uid(), title: 'Daily Communication', created_at: ts, updated_at: ts },
    { id: uid(), title: 'Business English', created_at: ts, updated_at: ts },
  ];
  const topicByTitle = Object.fromEntries(vocabulary_topics.map((t) => [t.title, t]));

  const vocabularies = [
    { id: uid(), topic_id: topicByTitle['Daily Communication'].id, word: 'hello', meaning: 'xin chào', example_sentence: 'Hello, how are you?', created_at: ts, updated_at: ts },
    { id: uid(), topic_id: topicByTitle['Daily Communication'].id, word: 'schedule', meaning: 'lịch trình', example_sentence: 'What is your study schedule?', created_at: ts, updated_at: ts },
    { id: uid(), topic_id: topicByTitle['Business English'].id, word: 'meeting', meaning: 'cuộc họp', example_sentence: 'We have a meeting at 9 AM.', created_at: ts, updated_at: ts },
    { id: uid(), topic_id: topicByTitle['Business English'].id, word: 'deadline', meaning: 'hạn chót', example_sentence: 'The project deadline is Friday.', created_at: ts, updated_at: ts },
  ];

  const enrollments = [
    { id: uid(), student_id: userByEmail['student1@gmail.com'].id, course_id: courses[0].id, progress_percent: 25, enrolled_at: ts, created_at: ts, updated_at: ts },
    { id: uid(), student_id: userByEmail['student1@gmail.com'].id, course_id: courses[3].id, progress_percent: 10, enrolled_at: ts, created_at: ts, updated_at: ts },
  ];

  const notifications = [
    { id: uid(), user_id: userByEmail['student1@gmail.com'].id, type: 'SYSTEM', title: 'Chào mừng bạn', body: 'Tài khoản của bạn đã sẵn sàng để học.', metadata: {}, is_read: false, read_at: null, created_at: ts, updated_at: ts },
  ];

  return {
    roles,
    users,
    courses,
    lectures: [],
    enrollments,
    payments: [],
    vocabulary_topics,
    vocabularies,
    pronunciation_practice: [],
    flashcard_sets: [],
    flashcard_cards: [],
    tests: [],
    test_questions: [],
    test_choices: [],
    test_attempts: [],
    test_attempt_answers: [],
    notifications,
    otp_codes: [],
    chat_sessions: [],
    chat_messages: [],
    knowledge_documents,
  };
}

module.exports = { buildSeed };