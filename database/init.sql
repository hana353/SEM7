CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- DROP TABLES
-- =========================
DROP TABLE IF EXISTS test_attempt_answers CASCADE;
DROP TABLE IF EXISTS test_attempts CASCADE;
DROP TABLE IF EXISTS pronunciation_practice CASCADE;
DROP TABLE IF EXISTS vocabularies CASCADE;
DROP TABLE IF EXISTS vocabulary_topics CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lectures CASCADE;
DROP TABLE IF EXISTS flashcard_cards CASCADE;
DROP TABLE IF EXISTS flashcard_sets CASCADE;
DROP TABLE IF EXISTS test_choices CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS otp_codes CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS knowledge_documents CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- =========================
-- ROLES
-- =========================
CREATE TABLE roles (
  id SMALLINT PRIMARY KEY,
  code VARCHAR(30) UNIQUE NOT NULL,
  description VARCHAR(255)
);

INSERT INTO roles (id, code, description) VALUES
  (1, 'ADMIN', 'System admin'),
  (2, 'TEACHER', 'Course creator'),
  (3, 'STUDENT', 'Learner'),
  (4, 'GUEST', 'Guest');

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role_id SMALLINT NOT NULL REFERENCES roles(id),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  pwd_hash TEXT := '$2b$10$LNzoIv2eFrFlYvWXTm9mDO0CTB83ZFAsOt5ugjj7vAfSaWLFVLx62';
BEGIN
  INSERT INTO users(email, password_hash, full_name, phone, role_id, is_verified, is_active, is_deleted)
  VALUES
    ('admin@gmail.com',      pwd_hash, 'System Admin',        '0900000001', 1, TRUE, TRUE, FALSE),

    ('teacher1@gmail.com',   pwd_hash, 'John Smith',          '0900000002', 2, TRUE, TRUE, FALSE),
    ('teacher2@gmail.com',   pwd_hash, 'Emma Brown',          '0900000003', 2, TRUE, TRUE, FALSE),
    ('teacher3@gmail.com',   pwd_hash, 'Olivia Taylor',       '0900000004', 2, TRUE, TRUE, FALSE),
    ('teacher4@gmail.com',   pwd_hash, 'David Wilson',        '0900000005', 2, TRUE, TRUE, FALSE),

    ('student1@gmail.com',   pwd_hash, 'Nguyen Minh Anh',     '0911000001', 3, TRUE, TRUE, FALSE),
    ('student2@gmail.com',   pwd_hash, 'Tran Bao Chau',       '0911000002', 3, TRUE, TRUE, FALSE),
    ('student3@gmail.com',   pwd_hash, 'Le Hoang Long',       '0911000003', 3, TRUE, TRUE, FALSE),
    ('student4@gmail.com',   pwd_hash, 'Pham Thu Ha',         '0911000004', 3, TRUE, TRUE, FALSE),
    ('student5@gmail.com',   pwd_hash, 'Vo Quoc Dat',         '0911000005', 3, TRUE, TRUE, FALSE),
    ('student6@gmail.com',   pwd_hash, 'Bui Gia Han',         '0911000006', 3, TRUE, TRUE, FALSE),
    ('student7@gmail.com',   pwd_hash, 'Dang Tuan Kiet',      '0911000007', 3, TRUE, TRUE, FALSE),
    ('student8@gmail.com',   pwd_hash, 'Do Khanh Linh',       '0911000008', 3, TRUE, TRUE, FALSE),
    ('student9@gmail.com',   pwd_hash, 'Ngo Gia Bao',         '0911000009', 3, TRUE, TRUE, FALSE),
    ('student10@gmail.com',  pwd_hash, 'Ly Thanh Truc',       '0911000010', 3, TRUE, TRUE, FALSE),
    ('student11@gmail.com',  pwd_hash, 'Huynh Quoc Anh',      '0911000011', 3, TRUE, TRUE, FALSE),
    ('student12@gmail.com',  pwd_hash, 'Mai Ngoc Han',        '0911000012', 3, TRUE, TRUE, FALSE),
    ('student13@gmail.com',  pwd_hash, 'Vu Tuan Minh',        '0911000013', 3, TRUE, TRUE, FALSE),
    ('student14@gmail.com',  pwd_hash, 'Pham Bao Ngan',       '0911000014', 3, TRUE, TRUE, FALSE),
    ('student15@gmail.com',  pwd_hash, 'Tran Minh Khoa',      '0911000015', 3, TRUE, TRUE, FALSE),
    ('student16@gmail.com',  pwd_hash, 'Do My Tien',          '0911000016', 3, TRUE, TRUE, FALSE),
    ('student17@gmail.com',  pwd_hash, 'Bui Duc Huy',         '0911000017', 3, TRUE, TRUE, FALSE),
    ('student18@gmail.com',  pwd_hash, 'Le Ngoc Anh',         '0911000018', 3, TRUE, TRUE, FALSE);
END $$;

-- =========================
-- COURSES
-- =========================
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_duration_minutes INT NOT NULL DEFAULT 0,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_courses_start_end CHECK (start_at IS NULL OR end_at IS NULL OR start_at <= end_at),
  CONSTRAINT chk_courses_status CHECK (status IN ('DRAFT', 'ON_SALE', 'ARCHIVED'))
);

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'English Pronunciation Starter',
       'Khóa luyện phát âm cơ bản cho người mới bắt đầu, tập trung vào nguyên âm, phụ âm, trọng âm từ và nối âm để xây nền nghe nói chuẩn hơn.',
       149000, 300, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'English Foundation - Beginner',
       'Khóa học cho người mất gốc, bắt đầu từ phát âm, chào hỏi, từ vựng cơ bản và các mẫu câu đơn giản để xây nền tiếng Anh vững chắc.',
       0, 240, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'English Communication - Elementary',
       'Nâng từ nền tảng lên giao tiếp cơ bản với các chủ đề quen thuộc như gia đình, công việc, mua sắm, hỏi đường và sinh hoạt hàng ngày.',
       199000, 360, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'English Grammar for Communication',
       'Khóa ngữ pháp ứng dụng cho giao tiếp, tập trung vào thì cơ bản, câu hỏi, câu phủ định, so sánh và cấu trúc thường gặp trong hội thoại.',
       249000, 360, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'English Communication - Pre Intermediate',
       'Mở rộng phản xạ giao tiếp, luyện nói câu dài hơn, mô tả trải nghiệm, kế hoạch và xử lý các tình huống thường gặp trong đời sống.',
       299000, 420, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'English Communication - Intermediate',
       'Phát triển khả năng giao tiếp tự nhiên hơn, trình bày quan điểm, kể chuyện, trao đổi công việc đơn giản và tăng độ trôi chảy khi nói.',
       399000, 480, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'Travel English Essentials',
       'Tiếng Anh du lịch với các tình huống thực tế như sân bay, khách sạn, gọi món, hỏi đường, xử lý sự cố và giao tiếp với người bản xứ.',
       279000, 330, 'ON_SALE'
FROM users WHERE email = 'teacher3@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'Listening and Speaking Booster',
       'Khóa tăng tốc phản xạ nghe nói, giúp người học luyện nghe ý chính, bắt từ khóa, phản xạ câu ngắn và nói tự nhiên hơn trong hội thoại hằng ngày.',
       329000, 420, 'ON_SALE'
FROM users WHERE email = 'teacher3@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'IELTS Foundation - Core Skills',
       'Khóa nền tảng IELTS cho người mới làm quen, giúp xây lại từ vựng học thuật cơ bản, ngữ pháp nền và tư duy làm bài 4 kỹ năng.',
       399000, 420, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'IELTS Speaking Foundation',
       'Dành cho học viên đã có nền giao tiếp cơ bản và muốn chuyển sang luyện thi IELTS Speaking với format bài thi, tiêu chí chấm và kỹ năng mở rộng ý.',
       499000, 360, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'IELTS Writing Task 1 Starter',
       'Khóa nhập môn Task 1 giúp học viên biết cách phân tích biểu đồ, viết overview, nhóm số liệu và diễn đạt xu hướng rõ ràng hơn.',
       449000, 360, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'IELTS Writing Task 2 Foundation',
       'Khóa viết Task 2 nền tảng, tập trung vào phân tích đề, lập dàn ý, viết intro, body, conclusion và phát triển ý mạch lạc.',
       499000, 390, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'IELTS Listening Strategy',
       'Khóa luyện nghe IELTS với kỹ thuật đọc trước câu hỏi, nhận diện bẫy, nghe keyword và quản lý thời gian hiệu quả hơn.',
       429000, 350, 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'IELTS Reading Skills',
       'Khóa luyện đọc IELTS với kỹ năng skimming, scanning, paraphrase và xử lý các dạng câu hỏi phổ biến như True False Not Given và Matching.',
       429000, 360, 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'Business English Communication',
       'Khóa học tiếng Anh ứng dụng cho môi trường công việc, tập trung vào email, họp nhóm, trình bày ý tưởng và giao tiếp chuyên nghiệp.',
       599000, 390, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'Email English for Work',
       'Khóa học tập trung vào viết email chuyên nghiệp, trả lời khách hàng, follow-up công việc, xác nhận lịch họp và giao tiếp nội bộ.',
       349000, 300, 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'English for Meetings and Presentations',
       'Khóa học dành cho môi trường công sở, giúp học viên dẫn dắt cuộc họp, trình bày ý tưởng, phản hồi ý kiến và kết thúc cuộc họp chuyên nghiệp.',
       549000, 420, 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id,
       'English for Job Interview',
       'Khóa luyện tiếng Anh phỏng vấn với các câu hỏi thường gặp, cách giới thiệu bản thân, nói về kinh nghiệm, điểm mạnh và mục tiêu nghề nghiệp.',
       379000, 320, 'ON_SALE'
FROM users WHERE email = 'teacher3@gmail.com';

-- =========================
-- LECTURES
-- =========================
CREATE TABLE lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  video_url VARCHAR(500),
  duration_minutes INT NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_lectures_status CHECK (
    status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED_PUBLIC', 'REJECTED')
  ),
  CONSTRAINT chk_lecture_approval_consistency CHECK (
    (status = 'APPROVED_PUBLIC' AND approved_by IS NOT NULL AND approved_at IS NOT NULL AND rejection_reason IS NULL)
    OR (status = 'REJECTED' AND rejection_reason IS NOT NULL)
    OR (status IN ('DRAFT', 'PENDING_APPROVAL'))
  )
);

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, approved_by, approved_at)
SELECT c.id, c.teacher_id, x.title, x.video_url, x.duration_minutes, x.order_index, 'APPROVED_PUBLIC', a.id, NOW() - INTERVAL '2 days'
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
JOIN (
  VALUES
    ('English Pronunciation Starter', 'Short vowels and long vowels', 'https://youtube.com/pronunciation-1', 18, 1),
    ('English Pronunciation Starter', 'Final sounds and ending consonants', 'https://youtube.com/pronunciation-2', 20, 2),

    ('English Foundation - Beginner', 'Alphabet and Sounds', 'https://youtube.com/foundation-1', 18, 1),
    ('English Foundation - Beginner', 'Basic Greetings', 'https://youtube.com/foundation-2', 20, 2),

    ('English Communication - Elementary', 'Daily Routines', 'https://youtube.com/elementary-1', 22, 1),

    ('English Grammar for Communication', 'Present simple in conversation', 'https://youtube.com/grammar-1', 22, 1),
    ('English Grammar for Communication', 'Past simple for daily storytelling', 'https://youtube.com/grammar-2', 24, 2),

    ('English Communication - Pre Intermediate', 'Talking about Past Events', 'https://youtube.com/preintermediate-1', 24, 1),

    ('Travel English Essentials', 'At the airport', 'https://youtube.com/travel-1', 19, 1),
    ('Travel English Essentials', 'Hotel check-in and requests', 'https://youtube.com/travel-2', 21, 2),

    ('Listening and Speaking Booster', 'Listening for key words', 'https://youtube.com/ls-1', 23, 1),
    ('Listening and Speaking Booster', 'Shadowing for speaking fluency', 'https://youtube.com/ls-2', 25, 2),

    ('IELTS Foundation - Core Skills', 'Understanding IELTS format', 'https://youtube.com/ielts-foundation-1', 20, 1),
    ('IELTS Foundation - Core Skills', 'Academic vocabulary basics', 'https://youtube.com/ielts-foundation-2', 22, 2),

    ('IELTS Speaking Foundation', 'IELTS Speaking Part 1', 'https://youtube.com/ielts-speaking-1', 21, 1),

    ('IELTS Writing Task 1 Starter', 'How to write an overview', 'https://youtube.com/task1-1', 21, 1),
    ('IELTS Writing Task 1 Starter', 'Describing trends and changes', 'https://youtube.com/task1-2', 24, 2),

    ('IELTS Writing Task 2 Foundation', 'Analyzing the essay question', 'https://youtube.com/task2-1', 22, 1),
    ('IELTS Writing Task 2 Foundation', 'Building body paragraphs', 'https://youtube.com/task2-2', 26, 2),

    ('IELTS Listening Strategy', 'Predicting answers before listening', 'https://youtube.com/listening-1', 18, 1),
    ('IELTS Listening Strategy', 'Common traps in IELTS Listening', 'https://youtube.com/listening-2', 22, 2),

    ('IELTS Reading Skills', 'Skimming and scanning basics', 'https://youtube.com/reading-1', 20, 1),
    ('IELTS Reading Skills', 'Handling True False Not Given', 'https://youtube.com/reading-2', 24, 2),

    ('Email English for Work', 'Writing clear email subject lines', 'https://youtube.com/email-1', 17, 1),
    ('Email English for Work', 'Professional email openings and closings', 'https://youtube.com/email-2', 19, 2),

    ('English for Job Interview', 'Tell me about yourself', 'https://youtube.com/interview-1', 18, 1),
    ('English for Job Interview', 'Talking about strengths and experience', 'https://youtube.com/interview-2', 21, 2)
) AS x(course_title, title, video_url, duration_minutes, order_index)
ON x.course_title = c.title;

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at)
SELECT c.id, c.teacher_id, 'Shopping Conversations', 'https://youtube.com/elementary-2', 19, 2, 'PENDING_APPROVAL', NOW() - INTERVAL '2 days'
FROM courses c
WHERE c.title = 'English Communication - Elementary';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at, rejection_reason)
SELECT c.id, c.teacher_id, 'Giving Opinions Naturally', 'https://youtube.com/intermediate-1', 25, 1, 'REJECTED', NOW() - INTERVAL '5 days',
       'Audio quality is too low, please re-upload a clearer version.'
FROM courses c
WHERE c.title = 'English Communication - Intermediate';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status)
SELECT c.id, c.teacher_id, 'Professional Email Writing', 'https://youtube.com/business-1', 23, 1, 'DRAFT'
FROM courses c
WHERE c.title = 'Business English Communication';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at)
SELECT c.id, c.teacher_id, 'Describing charts accurately', 'https://youtube.com/task1-3', 20, 3, 'PENDING_APPROVAL', NOW() - INTERVAL '2 days'
FROM courses c
WHERE c.title = 'IELTS Writing Task 1 Starter';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at, rejection_reason)
SELECT c.id, c.teacher_id, 'Advanced meeting negotiation phrases', 'https://youtube.com/meeting-3', 24, 3, 'REJECTED', NOW() - INTERVAL '4 days',
       'Video slides need clearer formatting and larger text.'
FROM courses c
WHERE c.title = 'English for Meetings and Presentations';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, approved_by, approved_at)
SELECT c.id, c.teacher_id, 'Opening a meeting professionally', 'https://youtube.com/meeting-1', 20, 1, 'APPROVED_PUBLIC', a.id, NOW() - INTERVAL '1 day'
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'English for Meetings and Presentations';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, approved_by, approved_at)
SELECT c.id, c.teacher_id, 'Presenting ideas clearly', 'https://youtube.com/meeting-2', 23, 2, 'APPROVED_PUBLIC', a.id, NOW() - INTERVAL '1 day'
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'English for Meetings and Presentations';

-- =========================
-- ENROLLMENTS
-- =========================
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

INSERT INTO enrollments (student_id, course_id, progress_percent, enrolled_at)
SELECT u.id, c.id, x.progress_percent, x.enrolled_at
FROM (
  VALUES
    ('student1@gmail.com',  'English Foundation - Beginner', 90, NOW() - INTERVAL '30 days'),
    ('student1@gmail.com',  'English Communication - Elementary', 45, NOW() - INTERVAL '10 days'),

    ('student2@gmail.com',  'English Foundation - Beginner', 65, NOW() - INTERVAL '20 days'),
    ('student2@gmail.com',  'English Communication - Elementary', 15, NOW() - INTERVAL '5 days'),

    ('student3@gmail.com',  'English Foundation - Beginner', 35, NOW() - INTERVAL '12 days'),

    ('student4@gmail.com',  'English Communication - Elementary', 70, NOW() - INTERVAL '25 days'),
    ('student4@gmail.com',  'English Communication - Pre Intermediate', 28, NOW() - INTERVAL '8 days'),

    ('student5@gmail.com',  'English Communication - Pre Intermediate', 60, NOW() - INTERVAL '18 days'),
    ('student5@gmail.com',  'English Communication - Intermediate', 22, NOW() - INTERVAL '6 days'),

    ('student6@gmail.com',  'English Communication - Intermediate', 55, NOW() - INTERVAL '14 days'),
    ('student6@gmail.com',  'IELTS Speaking Foundation', 18, NOW() - INTERVAL '4 days'),

    ('student7@gmail.com',  'English Communication - Intermediate', 48, NOW() - INTERVAL '16 days'),
    ('student7@gmail.com',  'Business English Communication', 20, NOW() - INTERVAL '7 days'),

    ('student8@gmail.com',  'IELTS Speaking Foundation', 42, NOW() - INTERVAL '15 days'),

    ('student9@gmail.com',  'English Pronunciation Starter', 58, NOW() - INTERVAL '12 days'),
    ('student9@gmail.com',  'English Foundation - Beginner', 25, NOW() - INTERVAL '4 days'),

    ('student10@gmail.com', 'English Grammar for Communication', 41, NOW() - INTERVAL '10 days'),
    ('student10@gmail.com', 'English Communication - Elementary', 19, NOW() - INTERVAL '3 days'),

    ('student11@gmail.com', 'Travel English Essentials', 63, NOW() - INTERVAL '14 days'),
    ('student11@gmail.com', 'Listening and Speaking Booster', 34, NOW() - INTERVAL '6 days'),

    ('student12@gmail.com', 'IELTS Foundation - Core Skills', 72, NOW() - INTERVAL '18 days'),
    ('student12@gmail.com', 'IELTS Writing Task 1 Starter', 30, NOW() - INTERVAL '7 days'),

    ('student13@gmail.com', 'IELTS Foundation - Core Skills', 54, NOW() - INTERVAL '16 days'),
    ('student13@gmail.com', 'IELTS Listening Strategy', 22, NOW() - INTERVAL '5 days'),

    ('student14@gmail.com', 'IELTS Reading Skills', 37, NOW() - INTERVAL '9 days'),
    ('student14@gmail.com', 'IELTS Writing Task 2 Foundation', 15, NOW() - INTERVAL '2 days'),

    ('student15@gmail.com', 'Email English for Work', 68, NOW() - INTERVAL '13 days'),
    ('student15@gmail.com', 'English for Meetings and Presentations', 27, NOW() - INTERVAL '5 days'),

    ('student16@gmail.com', 'Business English Communication', 46, NOW() - INTERVAL '11 days'),
    ('student16@gmail.com', 'English for Job Interview', 21, NOW() - INTERVAL '4 days'),

    ('student17@gmail.com', 'English Communication - Intermediate', 59, NOW() - INTERVAL '15 days'),
    ('student17@gmail.com', 'IELTS Speaking Foundation', 24, NOW() - INTERVAL '6 days'),

    ('student18@gmail.com', 'English Communication - Intermediate', 65, NOW() - INTERVAL '17 days'),
    ('student18@gmail.com', 'English for Meetings and Presentations', 18, NOW() - INTERVAL '3 days')
) AS x(student_email, course_title, progress_percent, enrolled_at)
JOIN users u ON u.email = x.student_email
JOIN courses c ON c.title = x.course_title;

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrollment_id UUID REFERENCES enrollments(id),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  payment_method VARCHAR(30) NOT NULL DEFAULT 'VNPAY',
  txn_ref VARCHAR(100) UNIQUE,
  order_info VARCHAR(255),
  vnp_transaction_no VARCHAR(100),
  bank_code VARCHAR(50),
  bank_tran_no VARCHAR(100),
  card_type VARCHAR(50),
  response_code VARCHAR(10),
  transaction_status VARCHAR(10),
  pay_date TIMESTAMPTZ,
  gateway_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO payments (
  student_id, course_id, enrollment_id, amount, status, payment_method, txn_ref,
  order_info, response_code, transaction_status, pay_date, created_at
)
SELECT
  e.student_id,
  e.course_id,
  e.id,
  c.price,
  'SUCCESS',
  'VNPAY',
  md5(e.id::text || c.id::text),
  'Course payment',
  '00',
  '00',
  e.enrolled_at + INTERVAL '5 minutes',
  e.enrolled_at
FROM enrollments e
JOIN courses c ON c.id = e.course_id;

INSERT INTO payments (
  student_id, course_id, enrollment_id, amount, status, payment_method, txn_ref,
  order_info, response_code, transaction_status, created_at
)
SELECT u.id, c.id, NULL, c.price, 'FAILED', 'VNPAY',
       md5(random()::text || clock_timestamp()::text),
       'Demo failed payment', '24', '24', NOW() - INTERVAL '2 days'
FROM users u
JOIN courses c ON c.title = 'IELTS Writing Task 2 Foundation'
WHERE u.email = 'student3@gmail.com'
LIMIT 1;

INSERT INTO payments (
  student_id, course_id, enrollment_id, amount, status, payment_method, txn_ref,
  order_info, created_at
)
SELECT u.id, c.id, NULL, c.price, 'PENDING', 'VNPAY',
       md5(random()::text || clock_timestamp()::text),
       'Demo pending payment', NOW() - INTERVAL '1 hour'
FROM users u
JOIN courses c ON c.title = 'English for Job Interview'
WHERE u.email = 'student5@gmail.com'
LIMIT 1;

-- =========================
-- VOCABULARY TOPICS
-- =========================
CREATE TABLE vocabulary_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO vocabulary_topics(title)
VALUES
  ('Foundation Basics'),
  ('Daily Communication'),
  ('Travel and Experiences'),
  ('IELTS Speaking'),
  ('Business English'),
  ('Pronunciation'),
  ('Grammar in Use'),
  ('Travel English'),
  ('Workplace Email'),
  ('Meetings and Presentation'),
  ('Job Interview'),
  ('IELTS Writing'),
  ('IELTS Listening'),
  ('IELTS Reading');

-- =========================
-- VOCABULARIES
-- =========================
CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES vocabulary_topics(id),
  word VARCHAR(255) NOT NULL,
  meaning TEXT,
  example_sentence TEXT
);

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'hello', 'xin chào', 'Hello, how are you?'
FROM vocabulary_topics WHERE title = 'Foundation Basics';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'name', 'tên', 'My name is Anna.'
FROM vocabulary_topics WHERE title = 'Foundation Basics';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'shopping', 'mua sắm', 'I go shopping on weekends.'
FROM vocabulary_topics WHERE title = 'Daily Communication';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'help', 'giúp đỡ', 'Could you help me, please?'
FROM vocabulary_topics WHERE title = 'Daily Communication';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'passport', 'hộ chiếu', 'Please show your passport.'
FROM vocabulary_topics WHERE title = 'Travel and Experiences';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'experience', 'trải nghiệm', 'It was a wonderful experience.'
FROM vocabulary_topics WHERE title = 'Travel and Experiences';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'fluency', 'độ trôi chảy', 'Fluency is important in IELTS Speaking.'
FROM vocabulary_topics WHERE title = 'IELTS Speaking';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'deadline', 'hạn chót', 'The deadline is next Monday.'
FROM vocabulary_topics WHERE title = 'Business English';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'schedule', 'lịch trình', 'What is your schedule for tomorrow?'
FROM vocabulary_topics WHERE title = 'Workplace Email';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'confirm', 'xác nhận', 'Please confirm your attendance by Friday.'
FROM vocabulary_topics WHERE title = 'Workplace Email';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'boarding pass', 'thẻ lên máy bay', 'Please show your boarding pass at the gate.'
FROM vocabulary_topics WHERE title = 'Travel English';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'check-in', 'làm thủ tục nhận phòng / check-in', 'We will check in at 2 p.m.'
FROM vocabulary_topics WHERE title = 'Travel English';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'overview', 'phần tổng quan', 'Your overview should summarize the main trends.'
FROM vocabulary_topics WHERE title = 'IELTS Writing';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'coherence', 'tính mạch lạc', 'Coherence is important in Task 2 writing.'
FROM vocabulary_topics WHERE title = 'IELTS Writing';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'distractor', 'thông tin gây nhiễu', 'A distractor can make you choose the wrong answer.'
FROM vocabulary_topics WHERE title = 'IELTS Listening';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'paraphrase', 'diễn đạt lại', 'You need to recognize paraphrase in IELTS Reading.'
FROM vocabulary_topics WHERE title = 'IELTS Reading';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'strength', 'điểm mạnh', 'One of my strengths is problem solving.'
FROM vocabulary_topics WHERE title = 'Job Interview';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'agenda', 'chương trình cuộc họp', 'Let us begin with the first item on the agenda.'
FROM vocabulary_topics WHERE title = 'Meetings and Presentation';

-- =========================
-- PRONUNCIATION PRACTICE
-- =========================
CREATE TABLE pronunciation_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  vocabulary_id UUID NOT NULL REFERENCES vocabularies(id),
  spoken_text TEXT,
  accuracy_percent NUMERIC(5,2),
  practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
SELECT u.id, v.id, 'hello', 92, NOW() - INTERVAL '3 days'
FROM users u, vocabularies v
WHERE u.email = 'student1@gmail.com' AND v.word = 'hello';

INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
SELECT u.id, v.id, 'could you help me please', 84, NOW() - INTERVAL '2 days'
FROM users u, vocabularies v
WHERE u.email = 'student4@gmail.com' AND v.word = 'help';

INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
SELECT u.id, v.id, 'fluency', 79, NOW() - INTERVAL '1 day'
FROM users u, vocabularies v
WHERE u.email = 'student8@gmail.com' AND v.word = 'fluency';

INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
SELECT u.id, v.id, v.word, x.accuracy_percent, x.practiced_at
FROM (
  VALUES
    ('student11@gmail.com', 'boarding pass', 88, NOW() - INTERVAL '2 days'),
    ('student12@gmail.com', 'overview', 81, NOW() - INTERVAL '1 day'),
    ('student13@gmail.com', 'distractor', 76, NOW() - INTERVAL '8 hours'),
    ('student14@gmail.com', 'paraphrase', 79, NOW() - INTERVAL '6 hours'),
    ('student15@gmail.com', 'schedule', 91, NOW() - INTERVAL '3 days'),
    ('student16@gmail.com', 'confirm', 85, NOW() - INTERVAL '2 days'),
    ('student17@gmail.com', 'agenda', 83, NOW() - INTERVAL '1 day'),
    ('student18@gmail.com', 'strength', 87, NOW() - INTERVAL '10 hours')
) AS x(student_email, vocab_word, accuracy_percent, practiced_at)
JOIN users u ON u.email = x.student_email
JOIN vocabularies v ON v.word = x.vocab_word;

-- =========================
-- FLASHCARD SETS
-- =========================
CREATE TABLE flashcard_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE flashcard_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flashcard_set_id UUID NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  front_text TEXT NOT NULL,
  back_text TEXT NOT NULL,
  front_image_url TEXT,
  back_image_url TEXT,
  position INT NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Foundation Starter Cards', 'Flashcard cho người mới bắt đầu với từ và mẫu câu nền tảng.', 'PUBLISHED', FALSE
FROM courses c
WHERE c.title = 'English Foundation - Beginner';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Elementary Communication Cards', 'Flashcard luyện phản xạ giao tiếp cơ bản.', 'PUBLISHED', FALSE
FROM courses c
WHERE c.title = 'English Communication - Elementary';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Business Vocabulary Cards', 'Flashcard từ vựng công việc và họp nhóm.', 'DRAFT', FALSE
FROM courses c
WHERE c.title = 'Business English Communication';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Travel English Starter Cards', 'Flashcard cho các tình huống du lịch thực tế.', 'PUBLISHED', FALSE
FROM courses c
WHERE c.title = 'Travel English Essentials';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'IELTS Writing Keywords', 'Flashcard từ khóa quan trọng cho IELTS Writing.', 'PUBLISHED', FALSE
FROM courses c
WHERE c.title = 'IELTS Writing Task 2 Foundation';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Interview English Cards', 'Flashcard câu hỏi và từ khóa hay gặp khi phỏng vấn.', 'PUBLISHED', FALSE
FROM courses c
WHERE c.title = 'English for Job Interview';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('Hello', 'Xin chào', 1),
    ('My name is...', 'Tên tôi là...', 2),
    ('How are you?', 'Bạn có khỏe không?', 3),
    ('Thank you', 'Cảm ơn bạn', 4),
    ('Goodbye', 'Tạm biệt', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'Foundation Starter Cards';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('Could you help me?', 'Bạn có thể giúp tôi không?', 1),
    ('How much is this?', 'Cái này giá bao nhiêu?', 2),
    ('I would like to buy this.', 'Tôi muốn mua cái này.', 3),
    ('Where is the station?', 'Nhà ga ở đâu?', 4),
    ('Nice to meet you.', 'Rất vui được gặp bạn.', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'Elementary Communication Cards';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('Deadline', 'Hạn chót', 1),
    ('Agenda', 'Chương trình cuộc họp', 2),
    ('Follow up', 'Phản hồi / theo dõi sau', 3),
    ('Proposal', 'Đề xuất', 4),
    ('Minutes', 'Biên bản cuộc họp', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'Business Vocabulary Cards';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('Where is the check-in counter?', 'Quầy làm thủ tục ở đâu?', 1),
    ('I have a reservation.', 'Tôi có đặt chỗ trước.', 2),
    ('Could I see the menu?', 'Tôi có thể xem thực đơn được không?', 3),
    ('How much is a taxi to downtown?', 'Đi taxi vào trung tâm bao nhiêu tiền?', 4),
    ('I need help with my luggage.', 'Tôi cần giúp với hành lý của mình.', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'Travel English Starter Cards';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('coherence', 'tính mạch lạc', 1),
    ('relevant example', 'ví dụ liên quan', 2),
    ('clear opinion', 'quan điểm rõ ràng', 3),
    ('supporting idea', 'ý hỗ trợ', 4),
    ('conclusion', 'kết luận', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'IELTS Writing Keywords';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('Tell me about yourself.', 'Hãy giới thiệu về bản thân bạn.', 1),
    ('What are your strengths?', 'Điểm mạnh của bạn là gì?', 2),
    ('Why do you want this job?', 'Tại sao bạn muốn công việc này?', 3),
    ('I am a quick learner.', 'Tôi là người tiếp thu nhanh.', 4),
    ('I work well in a team.', 'Tôi làm việc nhóm tốt.', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'Interview English Cards';

-- =========================
-- TESTS
-- =========================
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT,
  max_attempts INT,
  shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
  shuffle_choices BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  open_at TIMESTAMPTZ,
  close_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  points INT NOT NULL DEFAULT 1,
  position INT NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE test_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  choice_text VARCHAR(255) NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  position INT NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id),
  attempt_no INT NOT NULL DEFAULT 1,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_limit_seconds INT,
  expires_at TIMESTAMPTZ,
  auto_submitted BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
  score NUMERIC(10,2),
  max_score NUMERIC(10,2),
  CONSTRAINT uq_test_attempts_per_no UNIQUE(test_id, student_id, attempt_no),
  CONSTRAINT chk_test_attempts_time CHECK (
    expires_at IS NULL OR started_at <= expires_at
  )
);

CREATE TABLE test_attempt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  choice_id UUID REFERENCES test_choices(id) ON DELETE SET NULL,
  is_correct BOOLEAN,
  points_earned NUMERIC(10,2),
  UNIQUE(attempt_id, question_id)
);

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'Foundation Check', 'Bài test kiểm tra từ vựng và mẫu câu nền tảng.', 15, 3, TRUE, TRUE, 'PUBLISHED',
       NOW() - INTERVAL '15 days', NOW() + INTERVAL '60 days', FALSE
FROM courses c
WHERE c.title = 'English Foundation - Beginner';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'Elementary Communication Quiz', 'Bài test ngắn về giao tiếp cơ bản.', 15, 3, TRUE, TRUE, 'PUBLISHED',
       NOW() - INTERVAL '10 days', NOW() + INTERVAL '60 days', FALSE
FROM courses c
WHERE c.title = 'English Communication - Elementary';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'IELTS Speaking Concepts Check', 'Bài test kiến thức nền tảng trước khi luyện IELTS Speaking.', 20, 2, FALSE, TRUE, 'PUBLISHED',
       NOW() - INTERVAL '8 days', NOW() + INTERVAL '45 days', FALSE
FROM courses c
WHERE c.title = 'IELTS Speaking Foundation';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'Travel English Quiz', 'Kiểm tra từ vựng và mẫu câu trong du lịch.', 15, 3, TRUE, TRUE, 'PUBLISHED',
       NOW() - INTERVAL '12 days', NOW() + INTERVAL '60 days', FALSE
FROM courses c
WHERE c.title = 'Travel English Essentials';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'IELTS Writing Task 2 Check', 'Kiểm tra kiến thức nền tảng về Task 2.', 20, 2, TRUE, TRUE, 'PUBLISHED',
       NOW() - INTERVAL '10 days', NOW() + INTERVAL '45 days', FALSE
FROM courses c
WHERE c.title = 'IELTS Writing Task 2 Foundation';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'Interview English Mini Test', 'Kiểm tra từ vựng và mẫu câu phỏng vấn.', 12, 3, TRUE, TRUE, 'PUBLISHED',
       NOW() - INTERVAL '7 days', NOW() + INTERVAL '40 days', FALSE
FROM courses c
WHERE c.title = 'English for Job Interview';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, FALSE
FROM tests t
JOIN (
  VALUES
    ('Which word is a greeting?', 1, 1),
    ('Choose the correct sentence.', 1, 2),
    ('What do you say to introduce yourself?', 1, 3)
) AS x(question_text, points, position) ON TRUE
WHERE t.title = 'Foundation Check';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, FALSE
FROM tests t
JOIN (
  VALUES
    ('Which phrase is polite for asking help?', 1, 1),
    ('What do you say when buying something?', 1, 2),
    ('How do you ask for a location?', 1, 3)
) AS x(question_text, points, position) ON TRUE
WHERE t.title = 'Elementary Communication Quiz';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, FALSE
FROM tests t
JOIN (
  VALUES
    ('How long is IELTS Speaking Part 2 preparation time?', 1, 1),
    ('What is important in IELTS Speaking assessment?', 1, 2),
    ('Which is a good way to improve fluency?', 1, 3)
) AS x(question_text, points, position) ON TRUE
WHERE t.title = 'IELTS Speaking Concepts Check';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, FALSE
FROM tests t
JOIN (
  VALUES
    ('What do you say at a hotel reception?', 1, 1),
    ('Which word is related to airport travel?', 1, 2),
    ('How do you ask for the menu politely?', 1, 3)
) AS x(question_text, points, position) ON TRUE
WHERE t.title = 'Travel English Quiz';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, FALSE
FROM tests t
JOIN (
  VALUES
    ('What should a good introduction do?', 1, 1),
    ('What is needed in a body paragraph?', 1, 2),
    ('Why is coherence important?', 1, 3)
) AS x(question_text, points, position) ON TRUE
WHERE t.title = 'IELTS Writing Task 2 Check';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, FALSE
FROM tests t
JOIN (
  VALUES
    ('How do you answer "Tell me about yourself"?', 1, 1),
    ('Which phrase describes a strength?', 1, 2),
    ('Why do interviewers ask about teamwork?', 1, 3)
) AS x(question_text, points, position) ON TRUE
WHERE t.title = 'Interview English Mini Test';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, FALSE
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('Which word is a greeting?', 'Hello', TRUE, 1),
    ('Which word is a greeting?', 'Table', FALSE, 2),
    ('Which word is a greeting?', 'Book', FALSE, 3),
    ('Which word is a greeting?', 'Chair', FALSE, 4),

    ('Choose the correct sentence.', 'She go to school every day.', FALSE, 1),
    ('Choose the correct sentence.', 'She goes to school every day.', TRUE, 2),
    ('Choose the correct sentence.', 'She going school every day.', FALSE, 3),
    ('Choose the correct sentence.', 'She gone school every day.', FALSE, 4),

    ('What do you say to introduce yourself?', 'My name is Lan.', TRUE, 1),
    ('What do you say to introduce yourself?', 'Close the door.', FALSE, 2),
    ('What do you say to introduce yourself?', 'Good night table.', FALSE, 3),
    ('What do you say to introduce yourself?', 'I am pen.', FALSE, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'Foundation Check';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, FALSE
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('Which phrase is polite for asking help?', 'Could you help me?', TRUE, 1),
    ('Which phrase is polite for asking help?', 'Help me now!', FALSE, 2),
    ('Which phrase is polite for asking help?', 'You must help me.', FALSE, 3),
    ('Which phrase is polite for asking help?', 'No help.', FALSE, 4),

    ('What do you say when buying something?', 'I would like to buy this.', TRUE, 1),
    ('What do you say when buying something?', 'Sleep on the floor.', FALSE, 2),
    ('What do you say when buying something?', 'I am a station.', FALSE, 3),
    ('What do you say when buying something?', 'Run the table.', FALSE, 4),

    ('How do you ask for a location?', 'Where is the station?', TRUE, 1),
    ('How do you ask for a location?', 'The station is blue.', FALSE, 2),
    ('How do you ask for a location?', 'Buy me this.', FALSE, 3),
    ('How do you ask for a location?', 'I later help.', FALSE, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'Elementary Communication Quiz';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, FALSE
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('How long is IELTS Speaking Part 2 preparation time?', '30 seconds', FALSE, 1),
    ('How long is IELTS Speaking Part 2 preparation time?', '1 minute', TRUE, 2),
    ('How long is IELTS Speaking Part 2 preparation time?', '2 minutes', FALSE, 3),
    ('How long is IELTS Speaking Part 2 preparation time?', '5 minutes', FALSE, 4),

    ('What is important in IELTS Speaking assessment?', 'Grammar only', FALSE, 1),
    ('What is important in IELTS Speaking assessment?', 'Fluency, vocabulary, grammar, pronunciation', TRUE, 2),
    ('What is important in IELTS Speaking assessment?', 'Writing speed', FALSE, 3),
    ('What is important in IELTS Speaking assessment?', 'Spelling only', FALSE, 4),

    ('Which is a good way to improve fluency?', 'Memorize one answer only', FALSE, 1),
    ('Which is a good way to improve fluency?', 'Practice speaking regularly', TRUE, 2),
    ('Which is a good way to improve fluency?', 'Avoid speaking English', FALSE, 3),
    ('Which is a good way to improve fluency?', 'Only study grammar rules', FALSE, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'IELTS Speaking Concepts Check';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, FALSE
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('What do you say at a hotel reception?', 'I have a reservation.', TRUE, 1),
    ('What do you say at a hotel reception?', 'I am a luggage.', FALSE, 2),
    ('What do you say at a hotel reception?', 'The airport is sleeping.', FALSE, 3),
    ('What do you say at a hotel reception?', 'Close the passport.', FALSE, 4),

    ('Which word is related to airport travel?', 'boarding pass', TRUE, 1),
    ('Which word is related to airport travel?', 'deadline', FALSE, 2),
    ('Which word is related to airport travel?', 'meeting', FALSE, 3),
    ('Which word is related to airport travel?', 'proposal', FALSE, 4),

    ('How do you ask for the menu politely?', 'Could I see the menu?', TRUE, 1),
    ('How do you ask for the menu politely?', 'Menu go now.', FALSE, 2),
    ('How do you ask for the menu politely?', 'I airport table.', FALSE, 3),
    ('How do you ask for the menu politely?', 'No hotel help.', FALSE, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'Travel English Quiz';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, FALSE
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('What should a good introduction do?', 'Introduce the topic and answer the question clearly', TRUE, 1),
    ('What should a good introduction do?', 'List all vocabulary only', FALSE, 2),
    ('What should a good introduction do?', 'Repeat the same sentence many times', FALSE, 3),
    ('What should a good introduction do?', 'Contain all examples in detail', FALSE, 4),

    ('What is needed in a body paragraph?', 'A clear idea with explanation and support', TRUE, 1),
    ('What is needed in a body paragraph?', 'Only one short word', FALSE, 2),
    ('What is needed in a body paragraph?', 'No connection to the topic', FALSE, 3),
    ('What is needed in a body paragraph?', 'A random list', FALSE, 4),

    ('Why is coherence important?', 'It helps the essay flow logically', TRUE, 1),
    ('Why is coherence important?', 'It makes handwriting bigger', FALSE, 2),
    ('Why is coherence important?', 'It reduces word count to zero', FALSE, 3),
    ('Why is coherence important?', 'It removes the conclusion', FALSE, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'IELTS Writing Task 2 Check';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, FALSE
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('How do you answer "Tell me about yourself"?', 'Give a brief summary of your background and strengths', TRUE, 1),
    ('How do you answer "Tell me about yourself"?', 'Talk only about your favorite food', FALSE, 2),
    ('How do you answer "Tell me about yourself"?', 'Say nothing for five minutes', FALSE, 3),
    ('How do you answer "Tell me about yourself"?', 'Read the company logo', FALSE, 4),

    ('Which phrase describes a strength?', 'I am a quick learner.', TRUE, 1),
    ('Which phrase describes a strength?', 'I never prepare.', FALSE, 2),
    ('Which phrase describes a strength?', 'I dislike all tasks.', FALSE, 3),
    ('Which phrase describes a strength?', 'I sleep in meetings.', FALSE, 4),

    ('Why do interviewers ask about teamwork?', 'To understand how you work with others', TRUE, 1),
    ('Why do interviewers ask about teamwork?', 'To test your handwriting only', FALSE, 2),
    ('Why do interviewers ask about teamwork?', 'To measure your height', FALSE, 3),
    ('Why do interviewers ask about teamwork?', 'To avoid communication', FALSE, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'Interview English Mini Test';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days' + INTERVAL '10 minutes',
       t.duration_minutes * 60,
       NOW() - INTERVAL '4 days' + (t.duration_minutes || ' minutes')::interval,
       FALSE, 'SUBMITTED', NULL, NULL
FROM tests t
JOIN users u ON u.email = 'student1@gmail.com'
WHERE t.title = 'Foundation Check';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '12 minutes',
       t.duration_minutes * 60,
       NOW() - INTERVAL '3 days' + (t.duration_minutes || ' minutes')::interval,
       FALSE, 'SUBMITTED', NULL, NULL
FROM tests t
JOIN users u ON u.email = 'student4@gmail.com'
WHERE t.title = 'Elementary Communication Quiz';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '15 minutes',
       t.duration_minutes * 60,
       NOW() - INTERVAL '2 days' + (t.duration_minutes || ' minutes')::interval,
       FALSE, 'SUBMITTED', NULL, NULL
FROM tests t
JOIN users u ON u.email = 'student8@gmail.com'
WHERE t.title = 'IELTS Speaking Concepts Check';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 2, NOW() - INTERVAL '5 minutes', NULL,
       t.duration_minutes * 60,
       NOW() - INTERVAL '5 minutes' + (t.duration_minutes || ' minutes')::interval,
       FALSE, 'IN_PROGRESS', NULL, NULL
FROM tests t
JOIN users u ON u.email = 'student2@gmail.com'
WHERE t.title = 'Foundation Check';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT
  t.id,
  u.id,
  1,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '11 minutes',
  t.duration_minutes * 60,
  NOW() - INTERVAL '3 days' + (t.duration_minutes || ' minutes')::interval,
  FALSE,
  'SUBMITTED',
  NULL,
  NULL
FROM tests t
JOIN users u ON u.email = 'student11@gmail.com'
WHERE t.title = 'Travel English Quiz';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT
  t.id,
  u.id,
  1,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days' + INTERVAL '15 minutes',
  t.duration_minutes * 60,
  NOW() - INTERVAL '2 days' + (t.duration_minutes || ' minutes')::interval,
  FALSE,
  'SUBMITTED',
  NULL,
  NULL
FROM tests t
JOIN users u ON u.email = 'student14@gmail.com'
WHERE t.title = 'IELTS Writing Task 2 Check';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT
  t.id,
  u.id,
  1,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day' + INTERVAL '8 minutes',
  t.duration_minutes * 60,
  NOW() - INTERVAL '1 day' + (t.duration_minutes || ' minutes')::interval,
  FALSE,
  'SUBMITTED',
  NULL,
  NULL
FROM tests t
JOIN users u ON u.email = 'student16@gmail.com'
WHERE t.title = 'Interview English Mini Test';

INSERT INTO test_attempt_answers (attempt_id, question_id, choice_id, is_correct, points_earned)
SELECT
  ta.id,
  q.id,
  tc.id,
  tc.is_correct,
  CASE WHEN tc.is_correct THEN q.points ELSE 0 END
FROM test_attempts ta
JOIN tests t ON t.id = ta.test_id
JOIN test_questions q ON q.test_id = t.id
JOIN LATERAL (
  SELECT tc1.*
  FROM test_choices tc1
  WHERE tc1.question_id = q.id
  ORDER BY tc1.is_correct DESC, tc1.position ASC
  LIMIT 1
) tc ON TRUE
WHERE ta.status = 'SUBMITTED'
ON CONFLICT (attempt_id, question_id) DO NOTHING;

UPDATE test_attempts ta
SET
  score = s.total_score,
  max_score = s.total_max
FROM (
  SELECT
    ta2.id AS attempt_id,
    COALESCE(SUM(taa.points_earned), 0) AS total_score,
    COALESCE(SUM(q.points), 0) AS total_max
  FROM test_attempts ta2
  LEFT JOIN test_attempt_answers taa ON taa.attempt_id = ta2.id
  LEFT JOIN test_questions q ON q.id = taa.question_id
  GROUP BY ta2.id
) s
WHERE ta.id = s.attempt_id;

-- =========================
-- OTP
-- =========================
CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'register',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO otp_codes (email, code, type, expires_at, used_at, created_at)
VALUES
  ('student1@gmail.com', '123456', 'register', NOW() + INTERVAL '10 minutes', NULL, NOW() - INTERVAL '1 minute'),
  ('student2@gmail.com', '654321', 'forgot_password', NOW() + INTERVAL '8 minutes', NULL, NOW() - INTERVAL '2 minutes'),
  ('teacher1@gmail.com', '111222', 'register', NOW() - INTERVAL '1 minute', NULL, NOW() - INTERVAL '6 minutes'),
  ('teacher2@gmail.com', '333444', 'forgot_password', NOW() + INTERVAL '5 minutes', NOW() - INTERVAL '1 minute', NOW() - INTERVAL '4 minutes'),
  ('newuser@gmail.com', '555666', 'register', NOW() + INTERVAL '15 minutes', NULL, NOW());

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_notification_type CHECK (
    type IN ('ENROLLMENT_NEW', 'LECTURE_APPROVED', 'LECTURE_REJECTED')
  ),
  CONSTRAINT chk_notification_read_consistency CHECK (
    (is_read = FALSE AND read_at IS NULL) OR (is_read = TRUE AND read_at IS NOT NULL)
  )
);

ALTER TABLE notifications
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(body, '')), 'B')
  ) STORED;

INSERT INTO notifications (user_id, type, title, body, metadata, is_read, read_at, created_at)
SELECT
  c.teacher_id,
  'ENROLLMENT_NEW',
  'New student enrollment',
  u.full_name || ' enrolled in course "' || c.title || '".',
  jsonb_build_object(
    'student_id', u.id,
    'student_email', u.email,
    'course_id', c.id,
    'course_title', c.title,
    'enrollment_id', e.id
  ),
  FALSE,
  NULL,
  e.enrolled_at
FROM enrollments e
JOIN users u ON u.id = e.student_id
JOIN courses c ON c.id = e.course_id;

INSERT INTO notifications (user_id, type, title, body, metadata, is_read, read_at, created_at)
SELECT
  l.teacher_id,
  'LECTURE_APPROVED',
  'Lecture approved',
  'Your lecture "' || l.title || '" has been approved and published.',
  jsonb_build_object(
    'lecture_id', l.id,
    'lecture_title', l.title,
    'course_id', c.id,
    'course_title', c.title,
    'approved_at', l.approved_at
  ),
  FALSE,
  NULL,
  COALESCE(l.approved_at, NOW())
FROM lectures l
JOIN courses c ON c.id = l.course_id
WHERE l.status = 'APPROVED_PUBLIC';

INSERT INTO notifications (user_id, type, title, body, metadata, is_read, read_at, created_at)
SELECT
  l.teacher_id,
  'LECTURE_REJECTED',
  'Lecture rejected',
  'Your lecture "' || l.title || '" was rejected. Reason: ' || COALESCE(l.rejection_reason, 'No reason provided'),
  jsonb_build_object(
    'lecture_id', l.id,
    'lecture_title', l.title,
    'course_id', c.id,
    'course_title', c.title,
    'rejection_reason', l.rejection_reason
  ),
  FALSE,
  NULL,
  NOW() - INTERVAL '1 day'
FROM lectures l
JOIN courses c ON c.id = l.course_id
WHERE l.status = 'REJECTED';

-- =========================
-- CHAT
-- =========================
CREATE TABLE public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role varchar(20) not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

INSERT INTO public.chat_sessions (user_id)
SELECT id FROM public.users WHERE email = 'student1@gmail.com';

INSERT INTO public.chat_sessions (user_id)
SELECT id FROM public.users WHERE email = 'student12@gmail.com';

INSERT INTO public.chat_messages (session_id, role, content, metadata)
SELECT cs.id, 'user', 'Em nên học khóa nào nếu đang mất gốc?', '{}'::jsonb
FROM public.chat_sessions cs
JOIN public.users u ON u.id = cs.user_id
WHERE u.email = 'student1@gmail.com'
LIMIT 1;

INSERT INTO public.chat_messages (session_id, role, content, metadata)
SELECT cs.id, 'assistant',
       'Nếu em đang mất gốc, nên bắt đầu từ English Foundation - Beginner, sau đó học tiếp English Communication - Elementary.',
       '{}'::jsonb
FROM public.chat_sessions cs
JOIN public.users u ON u.id = cs.user_id
WHERE u.email = 'student1@gmail.com'
LIMIT 1;

INSERT INTO public.chat_messages (session_id, role, content, metadata)
SELECT cs.id, 'user', 'Em muốn học IELTS thì nên bắt đầu từ đâu?', '{}'::jsonb
FROM public.chat_sessions cs
JOIN public.users u ON u.id = cs.user_id
WHERE u.email = 'student12@gmail.com'
LIMIT 1;

INSERT INTO public.chat_messages (session_id, role, content, metadata)
SELECT cs.id, 'assistant',
       'Nếu em mới làm quen IELTS, nên bắt đầu từ IELTS Foundation - Core Skills rồi tiếp tục với Speaking, Writing, Listening hoặc Reading tùy mục tiêu.',
       '{}'::jsonb
FROM public.chat_sessions cs
JOIN public.users u ON u.id = cs.user_id
WHERE u.email = 'student12@gmail.com'
LIMIT 1;

-- =========================
-- KNOWLEDGE DOCUMENTS
-- =========================
CREATE TABLE public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  type varchar(50) not null,
  title varchar(255) not null,
  content text not null,
  source varchar(255),
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

INSERT INTO public.knowledge_documents (type, title, content, source, tags)
VALUES
(
  'guide',
  'Cách học từ vựng để nhớ lâu',
  'Để nhớ từ vựng lâu, nên học theo ngữ cảnh, dùng flashcards, ôn lại theo chu kỳ lặp lại ngắt quãng, đặt câu với từ mới và dùng từ đó trong nói hoặc viết.',
  'manual',
  ARRAY['tu vung', 'nho lau', 'flashcards']
),
(
  'guide',
  'Cách luyện speaking hiệu quả',
  'Để luyện speaking hiệu quả, nên bắt đầu từ câu ngắn, luyện phản xạ với chủ đề quen thuộc, ghi âm lại giọng nói, shadowing theo audio chuẩn và luyện đều mỗi ngày.',
  'manual',
  ARRAY['speaking', 'phan xa', 'giao tiep']
),
(
  'guide',
  'Người mất gốc nên bắt đầu thế nào',
  'Người mất gốc nên bắt đầu từ phát âm cơ bản, từ vựng thông dụng, mẫu câu giao tiếp đơn giản và duy trì học đều đặn trước khi chuyển sang mục tiêu nâng cao hơn.',
  'manual',
  ARRAY['mat goc', 'beginner', 'co ban']
),
(
  'guide',
  'Nên học IELTS hay giao tiếp',
  'Nếu mục tiêu là thi chứng chỉ, đầu ra học tập hoặc du học thì nên ưu tiên IELTS. Nếu mục tiêu là sử dụng trong công việc và đời sống hàng ngày thì nên ưu tiên khóa giao tiếp.',
  'manual',
  ARRAY['ielts', 'giao tiep', 'so sanh']
),
(
  'guide',
  'Lộ trình học tiếng Anh từ cơ bản đến nâng cao',
  'Người học có thể đi theo lộ trình: Pronunciation Starter, Foundation, Elementary, Pre Intermediate, Intermediate, sau đó rẽ sang IELTS hoặc Business English tùy mục tiêu.',
  'manual',
  ARRAY['lo trinh', 'level up', 'english']
),
(
  'guide',
  'Cách học phát âm cho người mới',
  'Người mới nên bắt đầu từ bảng IPA cơ bản, luyện từng âm dễ nhầm, tập nghe và lặp lại theo mẫu, ưu tiên phát âm đúng trước khi nói nhanh.',
  'manual',
  ARRAY['phat am', 'ipa', 'beginner']
),
(
  'guide',
  'Cách viết email tiếng Anh lịch sự',
  'Một email công việc nên có tiêu đề rõ, lời chào phù hợp, nội dung ngắn gọn, hành động cần thực hiện và phần kết lịch sự.',
  'manual',
  ARRAY['email', 'business', 'work']
),
(
  'guide',
  'Chuẩn bị cho phỏng vấn tiếng Anh',
  'Nên chuẩn bị phần giới thiệu bản thân, kinh nghiệm nổi bật, điểm mạnh, lý do ứng tuyển và luyện trả lời thành câu ngắn gọn, rõ ràng.',
  'manual',
  ARRAY['interview', 'job', 'speaking']
),
(
  'guide',
  'Cách cải thiện IELTS Writing Task 2',
  'Muốn cải thiện Task 2 cần luyện phân tích đề, lên dàn ý nhanh, viết mỗi đoạn một ý chính rõ ràng và kiểm soát lỗi ngữ pháp cơ bản.',
  'manual',
  ARRAY['ielts', 'writing', 'task2']
);

-- =========================
-- INDEXES
-- =========================
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_enrollments_student_course ON enrollments(student_id, course_id);
CREATE INDEX idx_payments_enrollment ON payments(enrollment_id);
CREATE INDEX idx_vocab_topic ON vocabularies(topic_id);
CREATE INDEX idx_lectures_course ON lectures(course_id);
CREATE INDEX idx_flashcard_sets_teacher ON flashcard_sets(teacher_id);
CREATE INDEX idx_flashcard_cards_set ON flashcard_cards(flashcard_set_id);
CREATE INDEX idx_tests_teacher ON tests(teacher_id);
CREATE INDEX idx_test_questions_test ON test_questions(test_id);
CREATE INDEX idx_test_choices_question ON test_choices(question_id);
CREATE INDEX idx_test_attempts_test_student ON test_attempts(test_id, student_id);
CREATE INDEX idx_otp_codes_email_type ON otp_codes(email, type);
CREATE INDEX idx_otp_codes_created_at ON otp_codes(created_at DESC);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_type_created ON notifications(user_id, type, created_at DESC);
CREATE INDEX idx_notifications_search ON notifications USING GIN(search_vector);

-- =========================
-- QUICK CHECK QUERIES
-- =========================
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_courses FROM courses;
SELECT COUNT(*) AS total_enrollments FROM enrollments;
SELECT COUNT(*) AS total_tests FROM tests;
SELECT COUNT(*) AS total_flashcard_sets FROM flashcard_sets;
SELECT COUNT(*) AS total_notifications FROM notifications;














INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id,
       'Free English Survival Phrases',
       'Khóa miễn phí gồm các mẫu câu sống sót cơ bản để chào hỏi, hỏi đường, mua hàng và xử lý các tình huống giao tiếp đơn giản nhất.',
       0, 120, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM courses WHERE title = 'Free English Survival Phrases'
);

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id,
       'Free IELTS Orientation',
       'Khóa miễn phí giới thiệu tổng quan về IELTS, cấu trúc 4 kỹ năng, band score và cách chọn lộ trình học phù hợp cho người mới.',
       0, 90, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM courses WHERE title = 'Free IELTS Orientation'
);

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id,
       'Free Business Email Basics',
       'Khóa miễn phí nhập môn email công việc, giúp người học làm quen với subject, opening, closing và một số mẫu câu chuyên nghiệp cơ bản.',
       0, 100, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM courses WHERE title = 'Free Business Email Basics'
);

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id,
       'Free Pronunciation Warmup',
       'Khóa miễn phí luyện phát âm nhập môn với các âm phổ biến, cách đọc từ đơn giản và mẹo luyện nói mỗi ngày cho người mới bắt đầu.',
       0, 80, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher3@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM courses WHERE title = 'Free Pronunciation Warmup'
);

INSERT INTO enrollments (student_id, course_id, progress_percent, enrolled_at)
SELECT u.id, c.id, x.progress_percent, x.enrolled_at
FROM (
  VALUES
    ('student3@gmail.com',  'Free English Survival Phrases', 72, NOW() - INTERVAL '14 days'),
    ('student9@gmail.com',  'Free Pronunciation Warmup', 55, NOW() - INTERVAL '9 days'),
    ('student10@gmail.com', 'Free English Survival Phrases', 38, NOW() - INTERVAL '6 days'),
    ('student12@gmail.com', 'Free IELTS Orientation', 80, NOW() - INTERVAL '11 days'),
    ('student15@gmail.com', 'Free Business Email Basics', 61, NOW() - INTERVAL '7 days')
) AS x(student_email, course_title, progress_percent, enrolled_at)
JOIN users u ON u.email = x.student_email
JOIN courses c ON c.title = x.course_title
ON CONFLICT (student_id, course_id) DO NOTHING;


-- Gán thời gian cho các khóa có thời hạn
UPDATE courses
SET start_at = NOW() - INTERVAL '20 days',
    end_at   = NOW() + INTERVAL '90 days'
WHERE title = 'English Pronunciation Starter';

UPDATE courses
SET start_at = NOW() - INTERVAL '15 days',
    end_at   = NOW() + INTERVAL '75 days'
WHERE title = 'English Communication - Elementary';

UPDATE courses
SET start_at = NOW() - INTERVAL '10 days',
    end_at   = NOW() + INTERVAL '80 days'
WHERE title = 'English Grammar for Communication';

UPDATE courses
SET start_at = NOW() - INTERVAL '12 days',
    end_at   = NOW() + INTERVAL '70 days'
WHERE title = 'English Communication - Pre Intermediate';

UPDATE courses
SET start_at = NOW() - INTERVAL '8 days',
    end_at   = NOW() + INTERVAL '85 days'
WHERE title = 'English Communication - Intermediate';

UPDATE courses
SET start_at = NOW() - INTERVAL '18 days',
    end_at   = NOW() + INTERVAL '65 days'
WHERE title = 'Travel English Essentials';

UPDATE courses
SET start_at = NOW() - INTERVAL '9 days',
    end_at   = NOW() + INTERVAL '88 days'
WHERE title = 'Listening and Speaking Booster';

UPDATE courses
SET start_at = NOW() - INTERVAL '14 days',
    end_at   = NOW() + INTERVAL '100 days'
WHERE title = 'IELTS Foundation - Core Skills';

UPDATE courses
SET start_at = NOW() - INTERVAL '7 days',
    end_at   = NOW() + INTERVAL '90 days'
WHERE title = 'IELTS Speaking Foundation';

UPDATE courses
SET start_at = NOW() - INTERVAL '11 days',
    end_at   = NOW() + INTERVAL '95 days'
WHERE title = 'IELTS Writing Task 1 Starter';

UPDATE courses
SET start_at = NOW() - INTERVAL '6 days',
    end_at   = NOW() + INTERVAL '92 days'
WHERE title = 'IELTS Writing Task 2 Foundation';

UPDATE courses
SET start_at = NOW() - INTERVAL '5 days',
    end_at   = NOW() + INTERVAL '87 days'
WHERE title = 'IELTS Listening Strategy';

UPDATE courses
SET start_at = NOW() - INTERVAL '13 days',
    end_at   = NOW() + INTERVAL '89 days'
WHERE title = 'IELTS Reading Skills';

UPDATE courses
SET start_at = NOW() - INTERVAL '10 days',
    end_at   = NOW() + INTERVAL '110 days'
WHERE title = 'Business English Communication';

UPDATE courses
SET start_at = NOW() - INTERVAL '9 days',
    end_at   = NOW() + INTERVAL '84 days'
WHERE title = 'Email English for Work';

UPDATE courses
SET start_at = NOW() - INTERVAL '8 days',
    end_at   = NOW() + INTERVAL '93 days'
WHERE title = 'English for Meetings and Presentations';

UPDATE courses
SET start_at = NOW() - INTERVAL '4 days',
    end_at   = NOW() + INTERVAL '78 days'
WHERE title = 'English for Job Interview';

-- Giữ NULL cho free course không thời hạn
UPDATE courses
SET start_at = NULL,
    end_at = NULL,
    price = 0
WHERE title IN (
  'English Foundation - Beginner',
  'Free English Survival Phrases',
  'Free IELTS Orientation',
  'Free Business Email Basics',
  'Free Pronunciation Warmup'
);