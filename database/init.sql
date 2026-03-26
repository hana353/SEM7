USE master;
GO

IF DB_ID('SEM7') IS NOT NULL
BEGIN
    ALTER DATABASE SEM7 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SEM7;
END;
GO

CREATE DATABASE SEM7;
GO

USE SEM7;
GO

-- Converted from PostgreSQL to Microsoft SQL Server
SET NOCOUNT ON;

-- =========================
-- DROP TABLES
-- =========================
IF OBJECT_ID(N'test_attempt_answers', N'U') IS NOT NULL DROP TABLE test_attempt_answers;
IF OBJECT_ID(N'test_attempts', N'U') IS NOT NULL DROP TABLE test_attempts;
IF OBJECT_ID(N'pronunciation_practice', N'U') IS NOT NULL DROP TABLE pronunciation_practice;
IF OBJECT_ID(N'vocabularies', N'U') IS NOT NULL DROP TABLE vocabularies;
IF OBJECT_ID(N'vocabulary_topics', N'U') IS NOT NULL DROP TABLE vocabulary_topics;
IF OBJECT_ID(N'payments', N'U') IS NOT NULL DROP TABLE payments;
IF OBJECT_ID(N'enrollments', N'U') IS NOT NULL DROP TABLE enrollments;
IF OBJECT_ID(N'lectures', N'U') IS NOT NULL DROP TABLE lectures;
IF OBJECT_ID(N'flashcard_cards', N'U') IS NOT NULL DROP TABLE flashcard_cards;
IF OBJECT_ID(N'flashcard_sets', N'U') IS NOT NULL DROP TABLE flashcard_sets;
IF OBJECT_ID(N'test_choices', N'U') IS NOT NULL DROP TABLE test_choices;
IF OBJECT_ID(N'test_questions', N'U') IS NOT NULL DROP TABLE test_questions;
IF OBJECT_ID(N'tests', N'U') IS NOT NULL DROP TABLE tests;
IF OBJECT_ID(N'notifications', N'U') IS NOT NULL DROP TABLE notifications;
IF OBJECT_ID(N'otp_codes', N'U') IS NOT NULL DROP TABLE otp_codes;
IF OBJECT_ID(N'chat_messages', N'U') IS NOT NULL DROP TABLE chat_messages;
IF OBJECT_ID(N'chat_sessions', N'U') IS NOT NULL DROP TABLE chat_sessions;
IF OBJECT_ID(N'knowledge_documents', N'U') IS NOT NULL DROP TABLE knowledge_documents;
IF OBJECT_ID(N'courses', N'U') IS NOT NULL DROP TABLE courses;
IF OBJECT_ID(N'users', N'U') IS NOT NULL DROP TABLE users;
IF OBJECT_ID(N'roles', N'U') IS NOT NULL DROP TABLE roles;

-- =========================
-- ROLES
-- =========================
CREATE TABLE roles (
  id SMALLINT PRIMARY KEY,
  code NVARCHAR(30) UNIQUE NOT NULL,
  description NVARCHAR(255)
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
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email NVARCHAR(255) UNIQUE NOT NULL,
  password_hash NVARCHAR(255) NOT NULL,
  full_name NVARCHAR(255) NOT NULL,
  phone NVARCHAR(20),
  role_id SMALLINT NOT NULL REFERENCES roles(id),
  is_verified BIT NOT NULL DEFAULT 0,
  is_active BIT NOT NULL DEFAULT 1,
  is_deleted BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

DECLARE @pwd_hash NVARCHAR(255) = '$2b$10$LNzoIv2eFrFlYvWXTm9mDO0CTB83ZFAsOt5ugjj7vAfSaWLFVLx62';
  INSERT INTO users(email, password_hash, full_name, phone, role_id, is_verified, is_active, is_deleted)
  VALUES
    ('admin@gmail.com',      @pwd_hash, 'System Admin',        '0900000001', 1, 1, 1, 0),

    ('teacher1@gmail.com',   @pwd_hash, 'John Smith',          '0900000002', 2, 1, 1, 0),
    ('teacher2@gmail.com',   @pwd_hash, 'Emma Brown',          '0900000003', 2, 1, 1, 0),
    ('teacher3@gmail.com',   @pwd_hash, 'Olivia Taylor',       '0900000004', 2, 1, 1, 0),
    ('teacher4@gmail.com',   @pwd_hash, 'David Wilson',        '0900000005', 2, 1, 1, 0),

    ('student1@gmail.com',   @pwd_hash, 'Nguyen Minh Anh',     '0911000001', 3, 1, 1, 0),
    ('student2@gmail.com',   @pwd_hash, 'Tran Bao Chau',       '0911000002', 3, 1, 1, 0),
    ('student3@gmail.com',   @pwd_hash, 'Le Hoang Long',       '0911000003', 3, 1, 1, 0),
    ('student4@gmail.com',   @pwd_hash, 'Pham Thu Ha',         '0911000004', 3, 1, 1, 0),
    ('student5@gmail.com',   @pwd_hash, 'Vo Quoc Dat',         '0911000005', 3, 1, 1, 0),
    ('student6@gmail.com',   @pwd_hash, 'Bui Gia Han',         '0911000006', 3, 1, 1, 0),
    ('student7@gmail.com',   @pwd_hash, 'Dang Tuan Kiet',      '0911000007', 3, 1, 1, 0),
    ('student8@gmail.com',   @pwd_hash, 'Do Khanh Linh',       '0911000008', 3, 1, 1, 0),
    ('student9@gmail.com',   @pwd_hash, 'Ngo Gia Bao',         '0911000009', 3, 1, 1, 0),
    ('student10@gmail.com',  @pwd_hash, 'Ly Thanh Truc',       '0911000010', 3, 1, 1, 0),
    ('student11@gmail.com',  @pwd_hash, 'Huynh Quoc Anh',      '0911000011', 3, 1, 1, 0),
    ('student12@gmail.com',  @pwd_hash, 'Mai Ngoc Han',        '0911000012', 3, 1, 1, 0),
    ('student13@gmail.com',  @pwd_hash, 'Vu Tuan Minh',        '0911000013', 3, 1, 1, 0),
    ('student14@gmail.com',  @pwd_hash, 'Pham Bao Ngan',       '0911000014', 3, 1, 1, 0),
    ('student15@gmail.com',  @pwd_hash, 'Tran Minh Khoa',      '0911000015', 3, 1, 1, 0),
    ('student16@gmail.com',  @pwd_hash, 'Do My Tien',          '0911000016', 3, 1, 1, 0),
    ('student17@gmail.com',  @pwd_hash, 'Bui Duc Huy',         '0911000017', 3, 1, 1, 0),
    ('student18@gmail.com',  @pwd_hash, 'Le Ngoc Anh',         '0911000018', 3, 1, 1, 0);


-- =========================
-- COURSES
-- =========================
CREATE TABLE courses (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  teacher_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_duration_minutes INT NOT NULL DEFAULT 0,
  start_at DATETIME2,
  end_at DATETIME2,
  status NVARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT chk_courses_start_end CHECK (start_at IS NULL OR end_at IS NULL OR start_at <= end_at),
  CONSTRAINT chk_courses_status CHECK (status IN ('DRAFT', 'ON_SALE', 'ARCHIVED'))
);

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'English Pronunciation Starter',
       'Khóa luyện phát âm cơ bản cho người mới bắt đầu, tập trung vào nguyên âm, phụ âm, trọng âm từ và nối âm để xây nền nghe nói chuẩn hơn.',
       149000, 300, DATEADD(DAY, -20, SYSUTCDATETIME()), DATEADD(DAY, 90, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'English Foundation - Beginner',
       'Khóa học cho người mất gốc, bắt đầu từ phát âm, chào hỏi, từ vựng cơ bản và các mẫu câu đơn giản để xây nền tiếng Anh vững chắc.',
       0, 240, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'English Communication - Elementary',
       'Nâng từ nền tảng lên giao tiếp cơ bản với các chủ đề quen thuộc như gia đình, công việc, mua sắm, hỏi đường và sinh hoạt hàng ngày.',
       199000, 360, DATEADD(DAY, -15, SYSUTCDATETIME()), DATEADD(DAY, 75, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'English Grammar for Communication',
       'Khóa ngữ pháp ứng dụng cho giao tiếp, tập trung vào thì cơ bản, câu hỏi, câu phủ định, so sánh và cấu trúc thường gặp trong hội thoại.',
       249000, 360, DATEADD(DAY, -10, SYSUTCDATETIME()), DATEADD(DAY, 80, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'English Communication - Pre Intermediate',
       'Mở rộng phản xạ giao tiếp, luyện nói câu dài hơn, mô tả trải nghiệm, kế hoạch và xử lý các tình huống thường gặp trong đời sống.',
       299000, 420, DATEADD(DAY, -12, SYSUTCDATETIME()), DATEADD(DAY, 70, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'English Communication - Intermediate',
       'Phát triển khả năng giao tiếp tự nhiên hơn, trình bày quan điểm, kể chuyện, trao đổi công việc đơn giản và tăng độ trôi chảy khi nói.',
       399000, 480, DATEADD(DAY, -8, SYSUTCDATETIME()), DATEADD(DAY, 85, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'Travel English Essentials',
       'Tiếng Anh du lịch với các tình huống thực tế như sân bay, khách sạn, gọi món, hỏi đường, xử lý sự cố và giao tiếp với người bản xứ.',
       279000, 330, DATEADD(DAY, -18, SYSUTCDATETIME()), DATEADD(DAY, 65, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher3@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'Listening and Speaking Booster',
       'Khóa tăng tốc phản xạ nghe nói, giúp người học luyện nghe ý chính, bắt từ khóa, phản xạ câu ngắn và nói tự nhiên hơn trong hội thoại hằng ngày.',
       329000, 420, DATEADD(DAY, -9, SYSUTCDATETIME()), DATEADD(DAY, 88, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher3@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'IELTS Foundation - Core Skills',
       'Khóa nền tảng IELTS cho người mới làm quen, giúp xây lại từ vựng học thuật cơ bản, ngữ pháp nền và tư duy làm bài 4 kỹ năng.',
       399000, 420, DATEADD(DAY, -14, SYSUTCDATETIME()), DATEADD(DAY, 100, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'IELTS Speaking Foundation',
       'Dành cho học viên đã có nền giao tiếp cơ bản và muốn chuyển sang luyện thi IELTS Speaking với format bài thi, tiêu chí chấm và kỹ năng mở rộng ý.',
       499000, 360, DATEADD(DAY, -7, SYSUTCDATETIME()), DATEADD(DAY, 90, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'IELTS Writing Task 1 Starter',
       'Khóa nhập môn Task 1 giúp học viên biết cách phân tích biểu đồ, viết overview, nhóm số liệu và diễn đạt xu hướng rõ ràng hơn.',
       449000, 360, DATEADD(DAY, -11, SYSUTCDATETIME()), DATEADD(DAY, 95, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'IELTS Writing Task 2 Foundation',
       'Khóa viết Task 2 nền tảng, tập trung vào phân tích đề, lập dàn ý, viết intro, body, conclusion và phát triển ý mạch lạc.',
       499000, 390, DATEADD(DAY, -6, SYSUTCDATETIME()), DATEADD(DAY, 92, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'IELTS Listening Strategy',
       'Khóa luyện nghe IELTS với kỹ thuật đọc trước câu hỏi, nhận diện bẫy, nghe keyword và quản lý thời gian hiệu quả hơn.',
       429000, 350, DATEADD(DAY, -5, SYSUTCDATETIME()), DATEADD(DAY, 87, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'IELTS Reading Skills',
       'Khóa luyện đọc IELTS với kỹ năng skimming, scanning, paraphrase và xử lý các dạng câu hỏi phổ biến như True False Not Given và Matching.',
       429000, 360, DATEADD(DAY, -13, SYSUTCDATETIME()), DATEADD(DAY, 89, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'Business English Communication',
       'Khóa học tiếng Anh ứng dụng cho môi trường công việc, tập trung vào email, họp nhóm, trình bày ý tưởng và giao tiếp chuyên nghiệp.',
       599000, 390, DATEADD(DAY, -10, SYSUTCDATETIME()), DATEADD(DAY, 110, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'Email English for Work',
       'Khóa học tập trung vào viết email chuyên nghiệp, trả lời khách hàng, follow-up công việc, xác nhận lịch họp và giao tiếp nội bộ.',
       349000, 300, DATEADD(DAY, -9, SYSUTCDATETIME()), DATEADD(DAY, 84, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'English for Meetings and Presentations',
       'Khóa học dành cho môi trường công sở, giúp học viên dẫn dắt cuộc họp, trình bày ý tưởng, phản hồi ý kiến và kết thúc cuộc họp chuyên nghiệp.',
       549000, 420, DATEADD(DAY, -8, SYSUTCDATETIME()), DATEADD(DAY, 93, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'English for Job Interview',
       'Khóa luyện tiếng Anh phỏng vấn với các câu hỏi thường gặp, cách giới thiệu bản thân, nói về kinh nghiệm, điểm mạnh và mục tiêu nghề nghiệp.',
       379000, 320, DATEADD(DAY, -4, SYSUTCDATETIME()), DATEADD(DAY, 78, SYSUTCDATETIME()), 'ON_SALE'
FROM users WHERE email = 'teacher3@gmail.com';

-- FREE KHÔNG THỜI HẠN
INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'Free English Survival Phrases',
       'Khóa miễn phí gồm các mẫu câu sống sót cơ bản để chào hỏi, hỏi đường, mua hàng và xử lý các tình huống giao tiếp đơn giản nhất.',
       0, 120, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'Free IELTS Orientation',
       'Khóa miễn phí giới thiệu tổng quan về IELTS, cấu trúc 4 kỹ năng, band score và cách chọn lộ trình học phù hợp cho người mới.',
       0, 90, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'Free Business Email Basics',
       'Khóa miễn phí nhập môn email công việc, giúp người học làm quen với subject, opening, closing và một số mẫu câu chuyên nghiệp cơ bản.',
       0, 100, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher4@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, start_at, end_at, status)
SELECT id, 'Free Pronunciation Warmup',
       'Khóa miễn phí luyện phát âm nhập môn với các âm phổ biến, cách đọc từ đơn giản và mẹo luyện nói mỗi ngày cho người mới bắt đầu.',
       0, 80, NULL, NULL, 'ON_SALE'
FROM users WHERE email = 'teacher3@gmail.com';

-- =========================
-- LECTURES
-- =========================
CREATE TABLE lectures (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UNIQUEIDENTIFIER REFERENCES users(id),
  title NVARCHAR(255) NOT NULL,
  video_url NVARCHAR(500),
  duration_minutes INT NOT NULL DEFAULT 0,
  order_index INT NOT NULL DEFAULT 0,
  status NVARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  submitted_at DATETIME2,
  approved_by UNIQUEIDENTIFIER REFERENCES users(id),
  approved_at DATETIME2,
  rejection_reason NVARCHAR(MAX),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
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
SELECT c.id, c.teacher_id, x.title, x.video_url, x.duration_minutes, x.order_index, 'APPROVED_PUBLIC', a.id, DATEADD(DAY, -2, SYSUTCDATETIME())
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
    ('English for Job Interview', 'Talking about strengths and experience', 'https://youtube.com/interview-2', 21, 2),

    ('Free English Survival Phrases', 'Basic greeting phrases', 'https://youtube.com/free-survival-1', 12, 1),
    ('Free IELTS Orientation', 'What is IELTS?', 'https://youtube.com/free-ielts-1', 10, 1),
    ('Free Business Email Basics', 'Email structure basics', 'https://youtube.com/free-email-1', 11, 1),
    ('Free Pronunciation Warmup', 'Warmup sounds for beginners', 'https://youtube.com/free-pronunciation-1', 9, 1)
) AS x(course_title, title, video_url, duration_minutes, order_index)
ON x.course_title = c.title;

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at)
SELECT c.id, c.teacher_id, 'Shopping Conversations', 'https://youtube.com/elementary-2', 19, 2, 'PENDING_APPROVAL', DATEADD(DAY, -2, SYSUTCDATETIME())
FROM courses c
WHERE c.title = 'English Communication - Elementary';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at, rejection_reason)
SELECT c.id, c.teacher_id, 'Giving Opinions Naturally', 'https://youtube.com/intermediate-1', 25, 1, 'REJECTED', DATEADD(DAY, -5, SYSUTCDATETIME()),
       'Audio quality is too low, please re-upload a clearer version.'
FROM courses c
WHERE c.title = 'English Communication - Intermediate';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status)
SELECT c.id, c.teacher_id, 'Professional Email Writing', 'https://youtube.com/business-1', 23, 1, 'DRAFT'
FROM courses c
WHERE c.title = 'Business English Communication';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at)
SELECT c.id, c.teacher_id, 'Describing charts accurately', 'https://youtube.com/task1-3', 20, 3, 'PENDING_APPROVAL', DATEADD(DAY, -2, SYSUTCDATETIME())
FROM courses c
WHERE c.title = 'IELTS Writing Task 1 Starter';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, submitted_at, rejection_reason)
SELECT c.id, c.teacher_id, 'Advanced meeting negotiation phrases', 'https://youtube.com/meeting-3', 24, 3, 'REJECTED', DATEADD(DAY, -4, SYSUTCDATETIME()),
       'Video slides need clearer formatting and larger text.'
FROM courses c
WHERE c.title = 'English for Meetings and Presentations';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, approved_by, approved_at)
SELECT c.id, c.teacher_id, 'Opening a meeting professionally', 'https://youtube.com/meeting-1', 20, 1, 'APPROVED_PUBLIC', a.id, DATEADD(DAY, -1, SYSUTCDATETIME())
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'English for Meetings and Presentations';

INSERT INTO lectures(course_id, teacher_id, title, video_url, duration_minutes, order_index, status, approved_by, approved_at)
SELECT c.id, c.teacher_id, 'Presenting ideas clearly', 'https://youtube.com/meeting-2', 23, 2, 'APPROVED_PUBLIC', a.id, DATEADD(DAY, -1, SYSUTCDATETIME())
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'English for Meetings and Presentations';

-- =========================
-- ENROLLMENTS
-- =========================
CREATE TABLE enrollments (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id),
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  enrolled_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UNIQUE(student_id, course_id)
);

INSERT INTO enrollments (student_id, course_id, progress_percent, enrolled_at)
SELECT u.id, c.id, x.progress_percent, x.enrolled_at
FROM (
  VALUES
    ('student1@gmail.com',  'English Foundation - Beginner', 90, DATEADD(DAY, -30, SYSUTCDATETIME())),
    ('student1@gmail.com',  'English Communication - Elementary', 45, DATEADD(DAY, -10, SYSUTCDATETIME())),

    ('student2@gmail.com',  'English Foundation - Beginner', 65, DATEADD(DAY, -20, SYSUTCDATETIME())),
    ('student2@gmail.com',  'English Communication - Elementary', 15, DATEADD(DAY, -5, SYSUTCDATETIME())),

    ('student3@gmail.com',  'English Foundation - Beginner', 35, DATEADD(DAY, -12, SYSUTCDATETIME())),
    ('student3@gmail.com',  'Free English Survival Phrases', 72, DATEADD(DAY, -14, SYSUTCDATETIME())),

    ('student4@gmail.com',  'English Communication - Elementary', 70, DATEADD(DAY, -25, SYSUTCDATETIME())),
    ('student4@gmail.com',  'English Communication - Pre Intermediate', 28, DATEADD(DAY, -8, SYSUTCDATETIME())),

    ('student5@gmail.com',  'English Communication - Pre Intermediate', 60, DATEADD(DAY, -18, SYSUTCDATETIME())),
    ('student5@gmail.com',  'English Communication - Intermediate', 22, DATEADD(DAY, -6, SYSUTCDATETIME())),

    ('student6@gmail.com',  'English Communication - Intermediate', 55, DATEADD(DAY, -14, SYSUTCDATETIME())),
    ('student6@gmail.com',  'IELTS Speaking Foundation', 18, DATEADD(DAY, -4, SYSUTCDATETIME())),

    ('student7@gmail.com',  'English Communication - Intermediate', 48, DATEADD(DAY, -16, SYSUTCDATETIME())),
    ('student7@gmail.com',  'Business English Communication', 20, DATEADD(DAY, -7, SYSUTCDATETIME())),

    ('student8@gmail.com',  'IELTS Speaking Foundation', 42, DATEADD(DAY, -15, SYSUTCDATETIME())),

    ('student9@gmail.com',  'English Pronunciation Starter', 58, DATEADD(DAY, -12, SYSUTCDATETIME())),
    ('student9@gmail.com',  'English Foundation - Beginner', 25, DATEADD(DAY, -4, SYSUTCDATETIME())),
    ('student9@gmail.com',  'Free Pronunciation Warmup', 55, DATEADD(DAY, -9, SYSUTCDATETIME())),

    ('student10@gmail.com', 'English Grammar for Communication', 41, DATEADD(DAY, -10, SYSUTCDATETIME())),
    ('student10@gmail.com', 'English Communication - Elementary', 19, DATEADD(DAY, -3, SYSUTCDATETIME())),
    ('student10@gmail.com', 'Free English Survival Phrases', 38, DATEADD(DAY, -6, SYSUTCDATETIME())),

    ('student11@gmail.com', 'Travel English Essentials', 63, DATEADD(DAY, -14, SYSUTCDATETIME())),
    ('student11@gmail.com', 'Listening and Speaking Booster', 34, DATEADD(DAY, -6, SYSUTCDATETIME())),

    ('student12@gmail.com', 'IELTS Foundation - Core Skills', 72, DATEADD(DAY, -18, SYSUTCDATETIME())),
    ('student12@gmail.com', 'IELTS Writing Task 1 Starter', 30, DATEADD(DAY, -7, SYSUTCDATETIME())),
    ('student12@gmail.com', 'Free IELTS Orientation', 80, DATEADD(DAY, -11, SYSUTCDATETIME())),

    ('student13@gmail.com', 'IELTS Foundation - Core Skills', 54, DATEADD(DAY, -16, SYSUTCDATETIME())),
    ('student13@gmail.com', 'IELTS Listening Strategy', 22, DATEADD(DAY, -5, SYSUTCDATETIME())),

    ('student14@gmail.com', 'IELTS Reading Skills', 37, DATEADD(DAY, -9, SYSUTCDATETIME())),
    ('student14@gmail.com', 'IELTS Writing Task 2 Foundation', 15, DATEADD(DAY, -2, SYSUTCDATETIME())),

    ('student15@gmail.com', 'Email English for Work', 68, DATEADD(DAY, -13, SYSUTCDATETIME())),
    ('student15@gmail.com', 'English for Meetings and Presentations', 27, DATEADD(DAY, -5, SYSUTCDATETIME())),
    ('student15@gmail.com', 'Free Business Email Basics', 61, DATEADD(DAY, -7, SYSUTCDATETIME())),

    ('student16@gmail.com', 'Business English Communication', 46, DATEADD(DAY, -11, SYSUTCDATETIME())),
    ('student16@gmail.com', 'English for Job Interview', 21, DATEADD(DAY, -4, SYSUTCDATETIME())),

    ('student17@gmail.com', 'English Communication - Intermediate', 59, DATEADD(DAY, -15, SYSUTCDATETIME())),
    ('student17@gmail.com', 'IELTS Speaking Foundation', 24, DATEADD(DAY, -6, SYSUTCDATETIME())),

    ('student18@gmail.com', 'English Communication - Intermediate', 65, DATEADD(DAY, -17, SYSUTCDATETIME())),
    ('student18@gmail.com', 'English for Meetings and Presentations', 18, DATEADD(DAY, -3, SYSUTCDATETIME()))
) AS x(student_email, course_title, progress_percent, enrolled_at)
JOIN users u ON u.email = x.student_email
JOIN courses c ON c.title = x.course_title;

-- =========================
-- PAYMENTS
-- =========================
CREATE TABLE payments (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id),
  enrollment_id UNIQUEIDENTIFIER REFERENCES enrollments(id),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
  payment_method NVARCHAR(30) NOT NULL DEFAULT 'VNPAY',
  txn_ref NVARCHAR(100) UNIQUE,
  order_info NVARCHAR(255),
  vnp_transaction_no NVARCHAR(100),
  bank_code NVARCHAR(50),
  bank_tran_no NVARCHAR(100),
  card_type NVARCHAR(50),
  response_code NVARCHAR(10),
  transaction_status NVARCHAR(10),
  pay_date DATETIME2,
  gateway_response NVARCHAR(MAX),
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- Seed payment trả phí với chênh lệch doanh thu theo tháng
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
  CONVERT(VARCHAR(32), HASHBYTES('MD5', CONCAT(CONVERT(NVARCHAR(36), e.id), CONVERT(NVARCHAR(36), c.id), CONVERT(NVARCHAR(36), ABS(CHECKSUM(NEWID()))))), 2),
  'Course payment',
  '00',
  '00',
  x.pay_time,
  x.pay_time
FROM enrollments e
JOIN courses c ON c.id = e.course_id
JOIN users u ON u.id = e.student_id
CROSS APPLY (
  SELECT CASE
    WHEN u.email IN ('student1@gmail.com', 'student3@gmail.com', 'student9@gmail.com') THEN
      DATEADD(DAY, 3 + ABS(CHECKSUM(NEWID())) % 8, DATETIMEFROMPARTS(YEAR(DATEADD(MONTH, -6, SYSUTCDATETIME())), MONTH(DATEADD(MONTH, -6, SYSUTCDATETIME())), 1, 0, 0, 0, 0))

    WHEN u.email IN ('student2@gmail.com', 'student4@gmail.com', 'student10@gmail.com') THEN
      DATEADD(DAY, 5 + ABS(CHECKSUM(NEWID())) % 11, DATETIMEFROMPARTS(YEAR(DATEADD(MONTH, -5, SYSUTCDATETIME())), MONTH(DATEADD(MONTH, -5, SYSUTCDATETIME())), 1, 0, 0, 0, 0))

    WHEN u.email IN ('student5@gmail.com', 'student6@gmail.com', 'student11@gmail.com') THEN
      DATEADD(DAY, 6 + ABS(CHECKSUM(NEWID())) % 13, DATETIMEFROMPARTS(YEAR(DATEADD(MONTH, -4, SYSUTCDATETIME())), MONTH(DATEADD(MONTH, -4, SYSUTCDATETIME())), 1, 0, 0, 0, 0))

    WHEN u.email IN ('student7@gmail.com', 'student12@gmail.com', 'student13@gmail.com') THEN
      DATEADD(DAY, 8 + ABS(CHECKSUM(NEWID())) % 15, DATETIMEFROMPARTS(YEAR(DATEADD(MONTH, -3, SYSUTCDATETIME())), MONTH(DATEADD(MONTH, -3, SYSUTCDATETIME())), 1, 0, 0, 0, 0))

    WHEN u.email IN ('student8@gmail.com', 'student14@gmail.com', 'student15@gmail.com', 'student16@gmail.com') THEN
      DATEADD(DAY, 10 + ABS(CHECKSUM(NEWID())) % 17, DATETIMEFROMPARTS(YEAR(DATEADD(MONTH, -2, SYSUTCDATETIME())), MONTH(DATEADD(MONTH, -2, SYSUTCDATETIME())), 1, 0, 0, 0, 0))

    ELSE
      DATEADD(DAY, 2 + ABS(CHECKSUM(NEWID())) % 13, DATETIMEFROMPARTS(YEAR(DATEADD(MONTH, 0, SYSUTCDATETIME())), MONTH(DATEADD(MONTH, 0, SYSUTCDATETIME())), 1, 0, 0, 0, 0))
  END AS pay_time
) x
WHERE c.price > 0;

-- failed / pending demo
INSERT INTO payments (
  student_id, course_id, enrollment_id, amount, status, payment_method, txn_ref,
  order_info, response_code, transaction_status, created_at
)
SELECT u.id, c.id, NULL, c.price, 'FAILED', 'VNPAY',
       CONVERT(VARCHAR(32), HASHBYTES('MD5', CONCAT(CONVERT(NVARCHAR(36), ABS(CHECKSUM(NEWID()))), CONVERT(NVARCHAR(30), SYSUTCDATETIME(), 126))), 2),
       'Demo failed payment', '24', '24', DATEADD(DAY, -2, SYSUTCDATETIME())
FROM users u
JOIN courses c ON c.title = 'IELTS Writing Task 2 Foundation'
WHERE u.email = 'student3@gmail.com';

INSERT INTO payments (
  student_id, course_id, enrollment_id, amount, status, payment_method, txn_ref,
  order_info, created_at
)
SELECT u.id, c.id, NULL, c.price, 'PENDING', 'VNPAY',
       CONVERT(VARCHAR(32), HASHBYTES('MD5', CONCAT(CONVERT(NVARCHAR(36), ABS(CHECKSUM(NEWID()))), CONVERT(NVARCHAR(30), SYSUTCDATETIME(), 126))), 2),
       'Demo pending payment', DATEADD(HOUR, -1, SYSUTCDATETIME())
FROM users u
JOIN courses c ON c.title = 'English for Job Interview'
WHERE u.email = 'student5@gmail.com';

INSERT INTO payments (
  student_id, course_id, enrollment_id, amount, status, payment_method, txn_ref,
  order_info, response_code, transaction_status, created_at
)
SELECT
  u.id,
  c.id,
  NULL,
  c.price,
  'FAILED',
  'VNPAY',
  CONVERT(VARCHAR(32), HASHBYTES('MD5', CONCAT(CONVERT(NVARCHAR(36), ABS(CHECKSUM(NEWID()))), CONVERT(NVARCHAR(30), SYSUTCDATETIME(), 126))), 2),
  'Monthly failed demo payment',
  '24',
  '24',
  x.created_time
FROM (
  VALUES
    ('student3@gmail.com',  'IELTS Writing Task 2 Foundation', DATEADD(MONTH, -5, SYSUTCDATETIME())),
    ('student5@gmail.com',  'English for Job Interview',       DATEADD(MONTH, -3, SYSUTCDATETIME())),
    ('student10@gmail.com', 'Business English Communication',  DATEADD(MONTH, -2, SYSUTCDATETIME())),
    ('student17@gmail.com', 'IELTS Speaking Foundation',       DATEADD(MONTH, -1, SYSUTCDATETIME()))
) AS x(student_email, course_title, created_time)
JOIN users u ON u.email = x.student_email
JOIN courses c ON c.title = x.course_title;

-- =========================
-- VOCABULARY TOPICS
-- =========================
CREATE TABLE vocabulary_topics (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  title NVARCHAR(255) NOT NULL UNIQUE
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
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  topic_id UNIQUEIDENTIFIER NOT NULL REFERENCES vocabulary_topics(id),
  word NVARCHAR(255) NOT NULL,
  meaning NVARCHAR(MAX),
  example_sentence NVARCHAR(MAX)
);

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'hello', 'xin chào', 'Hello, how are you?' FROM vocabulary_topics WHERE title = 'Foundation Basics';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'name', 'tên', 'My name is Anna.' FROM vocabulary_topics WHERE title = 'Foundation Basics';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'shopping', 'mua sắm', 'I go shopping on weekends.' FROM vocabulary_topics WHERE title = 'Daily Communication';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'help', 'giúp đỡ', 'Could you help me, please?' FROM vocabulary_topics WHERE title = 'Daily Communication';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'passport', 'hộ chiếu', 'Please show your passport.' FROM vocabulary_topics WHERE title = 'Travel and Experiences';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'experience', 'trải nghiệm', 'It was a wonderful experience.' FROM vocabulary_topics WHERE title = 'Travel and Experiences';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'fluency', 'độ trôi chảy', 'Fluency is important in IELTS Speaking.' FROM vocabulary_topics WHERE title = 'IELTS Speaking';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'deadline', 'hạn chót', 'The deadline is next Monday.' FROM vocabulary_topics WHERE title = 'Business English';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'schedule', 'lịch trình', 'What is your schedule for tomorrow?' FROM vocabulary_topics WHERE title = 'Workplace Email';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'confirm', 'xác nhận', 'Please confirm your attendance by Friday.' FROM vocabulary_topics WHERE title = 'Workplace Email';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'boarding pass', 'thẻ lên máy bay', 'Please show your boarding pass at the gate.' FROM vocabulary_topics WHERE title = 'Travel English';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'check-in', 'làm thủ tục nhận phòng / check-in', 'We will check in at 2 p.m.' FROM vocabulary_topics WHERE title = 'Travel English';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'overview', 'phần tổng quan', 'Your overview should summarize the main trends.' FROM vocabulary_topics WHERE title = 'IELTS Writing';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'coherence', 'tính mạch lạc', 'Coherence is important in Task 2 writing.' FROM vocabulary_topics WHERE title = 'IELTS Writing';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'distractor', 'thông tin gây nhiễu', 'A distractor can make you choose the wrong answer.' FROM vocabulary_topics WHERE title = 'IELTS Listening';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'paraphrase', 'diễn đạt lại', 'You need to recognize paraphrase in IELTS Reading.' FROM vocabulary_topics WHERE title = 'IELTS Reading';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'strength', 'điểm mạnh', 'One of my strengths is problem solving.' FROM vocabulary_topics WHERE title = 'Job Interview';
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'agenda', 'chương trình cuộc họp', 'Let us begin with the first item on the agenda.' FROM vocabulary_topics WHERE title = 'Meetings and Presentation';

-- =========================
-- PRONUNCIATION PRACTICE
-- =========================
CREATE TABLE pronunciation_practice (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  vocabulary_id UNIQUEIDENTIFIER NOT NULL REFERENCES vocabularies(id),
  spoken_text NVARCHAR(MAX),
  accuracy_percent NUMERIC(5,2),
  practiced_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
SELECT u.id, v.id, 'hello', 92, DATEADD(DAY, -3, SYSUTCDATETIME())
FROM users u, vocabularies v
WHERE u.email = 'student1@gmail.com' AND v.word = 'hello';

INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
SELECT u.id, v.id, 'could you help me please', 84, DATEADD(DAY, -2, SYSUTCDATETIME())
FROM users u, vocabularies v
WHERE u.email = 'student4@gmail.com' AND v.word = 'help';

INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
SELECT u.id, v.id, 'fluency', 79, DATEADD(DAY, -1, SYSUTCDATETIME())
FROM users u, vocabularies v
WHERE u.email = 'student8@gmail.com' AND v.word = 'fluency';

INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
SELECT u.id, v.id, v.word, x.accuracy_percent, x.practiced_at
FROM (
  VALUES
    ('student11@gmail.com', 'boarding pass', 88, DATEADD(DAY, -2, SYSUTCDATETIME())),
    ('student12@gmail.com', 'overview', 81, DATEADD(DAY, -1, SYSUTCDATETIME())),
    ('student13@gmail.com', 'distractor', 76, DATEADD(HOUR, -8, SYSUTCDATETIME())),
    ('student14@gmail.com', 'paraphrase', 79, DATEADD(HOUR, -6, SYSUTCDATETIME())),
    ('student15@gmail.com', 'schedule', 91, DATEADD(DAY, -3, SYSUTCDATETIME())),
    ('student16@gmail.com', 'confirm', 85, DATEADD(DAY, -2, SYSUTCDATETIME())),
    ('student17@gmail.com', 'agenda', 83, DATEADD(DAY, -1, SYSUTCDATETIME())),
    ('student18@gmail.com', 'strength', 87, DATEADD(HOUR, -10, SYSUTCDATETIME()))
) AS x(student_email, vocab_word, accuracy_percent, practiced_at)
JOIN users u ON u.email = x.student_email
JOIN vocabularies v ON v.word = x.vocab_word;

-- =========================
-- FLASHCARD SETS
-- =========================
CREATE TABLE flashcard_sets (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  teacher_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  course_id UNIQUEIDENTIFIER REFERENCES courses(id),
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  status NVARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  is_deleted BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE flashcard_cards (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  flashcard_set_id UNIQUEIDENTIFIER NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  front_text NVARCHAR(MAX) NOT NULL,
  back_text NVARCHAR(MAX) NOT NULL,
  front_image_url NVARCHAR(MAX),
  back_image_url NVARCHAR(MAX),
  position INT NOT NULL DEFAULT 0,
  is_deleted BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Foundation Starter Cards', 'Flashcard cho người mới bắt đầu với từ và mẫu câu nền tảng.', 'PUBLISHED', 0
FROM courses c WHERE c.title = 'English Foundation - Beginner';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Elementary Communication Cards', 'Flashcard luyện phản xạ giao tiếp cơ bản.', 'PUBLISHED', 0
FROM courses c WHERE c.title = 'English Communication - Elementary';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Business Vocabulary Cards', 'Flashcard từ vựng công việc và họp nhóm.', 'DRAFT', 0
FROM courses c WHERE c.title = 'Business English Communication';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Travel English Starter Cards', 'Flashcard cho các tình huống du lịch thực tế.', 'PUBLISHED', 0
FROM courses c WHERE c.title = 'Travel English Essentials';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'IELTS Writing Keywords', 'Flashcard từ khóa quan trọng cho IELTS Writing.', 'PUBLISHED', 0
FROM courses c WHERE c.title = 'IELTS Writing Task 2 Foundation';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Interview English Cards', 'Flashcard câu hỏi và từ khóa hay gặp khi phỏng vấn.', 'PUBLISHED', 0
FROM courses c WHERE c.title = 'English for Job Interview';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Free Survival Cards', 'Flashcard miễn phí cho mẫu câu giao tiếp sống sót cơ bản.', 'PUBLISHED', 0
FROM courses c WHERE c.title = 'Free English Survival Phrases';

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
) AS x(front_text, back_text, position) ON 1 = 1
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
) AS x(front_text, back_text, position) ON 1 = 1
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
) AS x(front_text, back_text, position) ON 1 = 1
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
) AS x(front_text, back_text, position) ON 1 = 1
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
) AS x(front_text, back_text, position) ON 1 = 1
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
) AS x(front_text, back_text, position) ON 1 = 1
WHERE fs.title = 'Interview English Cards';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('Excuse me', 'Xin lỗi / cho tôi hỏi', 1),
    ('How much is this?', 'Cái này giá bao nhiêu?', 2),
    ('Where is the restroom?', 'Nhà vệ sinh ở đâu?', 3),
    ('I need help.', 'Tôi cần giúp đỡ.', 4),
    ('Can you speak slowly?', 'Bạn có thể nói chậm hơn không?', 5)
) AS x(front_text, back_text, position) ON 1 = 1
WHERE fs.title = 'Free Survival Cards';

-- =========================
-- TESTS
-- =========================
CREATE TABLE tests (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  teacher_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id),
  title NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  duration_minutes INT,
  max_attempts INT,
  shuffle_questions BIT NOT NULL DEFAULT 0,
  shuffle_choices BIT NOT NULL DEFAULT 0,
  status NVARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  open_at DATETIME2,
  close_at DATETIME2,
  is_deleted BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE test_questions (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  test_id UNIQUEIDENTIFIER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question_text NVARCHAR(MAX) NOT NULL,
  points INT NOT NULL DEFAULT 1,
  position INT NOT NULL DEFAULT 0,
  is_deleted BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE test_choices (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  question_id UNIQUEIDENTIFIER NOT NULL REFERENCES test_questions(id) ON DELETE NO ACTION,
  choice_text NVARCHAR(255) NOT NULL,
  is_correct BIT NOT NULL DEFAULT 0,
  position INT NOT NULL DEFAULT 0,
  is_deleted BIT NOT NULL DEFAULT 0
);

CREATE TABLE test_attempts (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  test_id UNIQUEIDENTIFIER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  attempt_no INT NOT NULL DEFAULT 1,
  started_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  submitted_at DATETIME2,
  time_limit_seconds INT,
  expires_at DATETIME2,
  auto_submitted BIT NOT NULL DEFAULT 0,
  status NVARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
  score NUMERIC(10,2),
  max_score NUMERIC(10,2),
  CONSTRAINT uq_test_attempts_per_no UNIQUE(test_id, student_id, attempt_no),
  CONSTRAINT chk_test_attempts_time CHECK (
    expires_at IS NULL OR started_at <= expires_at
  )
);

CREATE TABLE test_attempt_answers (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  attempt_id UNIQUEIDENTIFIER NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UNIQUEIDENTIFIER NOT NULL REFERENCES test_questions(id) ON DELETE NO ACTION,
  choice_id UNIQUEIDENTIFIER REFERENCES test_choices(id) ON DELETE SET NULL,
  is_correct BIT,
  points_earned NUMERIC(10,2),
  UNIQUE(attempt_id, question_id)
);

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'Foundation Check', 'Bài test kiểm tra từ vựng và mẫu câu nền tảng.', 15, 3, 1, 1, 'PUBLISHED',
       DATEADD(DAY, -15, SYSUTCDATETIME()), DATEADD(DAY, 60, SYSUTCDATETIME()), 0
FROM courses c WHERE c.title = 'English Foundation - Beginner';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'Elementary Communication Quiz', 'Bài test ngắn về giao tiếp cơ bản.', 15, 3, 1, 1, 'PUBLISHED',
       DATEADD(DAY, -10, SYSUTCDATETIME()), DATEADD(DAY, 60, SYSUTCDATETIME()), 0
FROM courses c WHERE c.title = 'English Communication - Elementary';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'IELTS Speaking Concepts Check', 'Bài test kiến thức nền tảng trước khi luyện IELTS Speaking.', 20, 2, 0, 1, 'PUBLISHED',
       DATEADD(DAY, -8, SYSUTCDATETIME()), DATEADD(DAY, 45, SYSUTCDATETIME()), 0
FROM courses c WHERE c.title = 'IELTS Speaking Foundation';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'Travel English Quiz', 'Kiểm tra từ vựng và mẫu câu trong du lịch.', 15, 3, 1, 1, 'PUBLISHED',
       DATEADD(DAY, -12, SYSUTCDATETIME()), DATEADD(DAY, 60, SYSUTCDATETIME()), 0
FROM courses c WHERE c.title = 'Travel English Essentials';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'IELTS Writing Task 2 Check', 'Kiểm tra kiến thức nền tảng về Task 2.', 20, 2, 1, 1, 'PUBLISHED',
       DATEADD(DAY, -10, SYSUTCDATETIME()), DATEADD(DAY, 45, SYSUTCDATETIME()), 0
FROM courses c WHERE c.title = 'IELTS Writing Task 2 Foundation';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT c.teacher_id, c.id, 'Interview English Mini Test', 'Kiểm tra từ vựng và mẫu câu phỏng vấn.', 12, 3, 1, 1, 'PUBLISHED',
       DATEADD(DAY, -7, SYSUTCDATETIME()), DATEADD(DAY, 40, SYSUTCDATETIME()), 0
FROM courses c WHERE c.title = 'English for Job Interview';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, 0
FROM tests t
JOIN (
  VALUES
    ('Which word is a greeting?', 1, 1),
    ('Choose the correct sentence.', 1, 2),
    ('What do you say to introduce yourself?', 1, 3)
) AS x(question_text, points, position) ON 1 = 1
WHERE t.title = 'Foundation Check';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, 0
FROM tests t
JOIN (
  VALUES
    ('Which phrase is polite for asking help?', 1, 1),
    ('What do you say when buying something?', 1, 2),
    ('How do you ask for a location?', 1, 3)
) AS x(question_text, points, position) ON 1 = 1
WHERE t.title = 'Elementary Communication Quiz';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, 0
FROM tests t
JOIN (
  VALUES
    ('How long is IELTS Speaking Part 2 preparation time?', 1, 1),
    ('What is important in IELTS Speaking assessment?', 1, 2),
    ('Which is a good way to improve fluency?', 1, 3)
) AS x(question_text, points, position) ON 1 = 1
WHERE t.title = 'IELTS Speaking Concepts Check';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, 0
FROM tests t
JOIN (
  VALUES
    ('What do you say at a hotel reception?', 1, 1),
    ('Which word is related to airport travel?', 1, 2),
    ('How do you ask for the menu politely?', 1, 3)
) AS x(question_text, points, position) ON 1 = 1
WHERE t.title = 'Travel English Quiz';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, 0
FROM tests t
JOIN (
  VALUES
    ('What should a good introduction do?', 1, 1),
    ('What is needed in a body paragraph?', 1, 2),
    ('Why is coherence important?', 1, 3)
) AS x(question_text, points, position) ON 1 = 1
WHERE t.title = 'IELTS Writing Task 2 Check';

INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, 0
FROM tests t
JOIN (
  VALUES
    ('How do you answer "Tell me about yourself"?', 1, 1),
    ('Which phrase describes a strength?', 1, 2),
    ('Why do interviewers ask about teamwork?', 1, 3)
) AS x(question_text, points, position) ON 1 = 1
WHERE t.title = 'Interview English Mini Test';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, 0
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('Which word is a greeting?', 'Hello', 1, 1),
    ('Which word is a greeting?', 'Table', 0, 2),
    ('Which word is a greeting?', 'Book', 0, 3),
    ('Which word is a greeting?', 'Chair', 0, 4),

    ('Choose the correct sentence.', 'She go to school every day.', 0, 1),
    ('Choose the correct sentence.', 'She goes to school every day.', 1, 2),
    ('Choose the correct sentence.', 'She going school every day.', 0, 3),
    ('Choose the correct sentence.', 'She gone school every day.', 0, 4),

    ('What do you say to introduce yourself?', 'My name is Lan.', 1, 1),
    ('What do you say to introduce yourself?', 'Close the door.', 0, 2),
    ('What do you say to introduce yourself?', 'Good night table.', 0, 3),
    ('What do you say to introduce yourself?', 'I am pen.', 0, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'Foundation Check';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, 0
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('Which phrase is polite for asking help?', 'Could you help me?', 1, 1),
    ('Which phrase is polite for asking help?', 'Help me now!', 0, 2),
    ('Which phrase is polite for asking help?', 'You must help me.', 0, 3),
    ('Which phrase is polite for asking help?', 'No help.', 0, 4),

    ('What do you say when buying something?', 'I would like to buy this.', 1, 1),
    ('What do you say when buying something?', 'Sleep on the floor.', 0, 2),
    ('What do you say when buying something?', 'I am a station.', 0, 3),
    ('What do you say when buying something?', 'Run the table.', 0, 4),

    ('How do you ask for a location?', 'Where is the station?', 1, 1),
    ('How do you ask for a location?', 'The station is blue.', 0, 2),
    ('How do you ask for a location?', 'Buy me this.', 0, 3),
    ('How do you ask for a location?', 'I later help.', 0, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'Elementary Communication Quiz';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, 0
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('How long is IELTS Speaking Part 2 preparation time?', '30 seconds', 0, 1),
    ('How long is IELTS Speaking Part 2 preparation time?', '1 minute', 1, 2),
    ('How long is IELTS Speaking Part 2 preparation time?', '2 minutes', 0, 3),
    ('How long is IELTS Speaking Part 2 preparation time?', '5 minutes', 0, 4),

    ('What is important in IELTS Speaking assessment?', 'Grammar only', 0, 1),
    ('What is important in IELTS Speaking assessment?', 'Fluency, vocabulary, grammar, pronunciation', 1, 2),
    ('What is important in IELTS Speaking assessment?', 'Writing speed', 0, 3),
    ('What is important in IELTS Speaking assessment?', 'Spelling only', 0, 4),

    ('Which is a good way to improve fluency?', 'Memorize one answer only', 0, 1),
    ('Which is a good way to improve fluency?', 'Practice speaking regularly', 1, 2),
    ('Which is a good way to improve fluency?', 'Avoid speaking English', 0, 3),
    ('Which is a good way to improve fluency?', 'Only study grammar rules', 0, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'IELTS Speaking Concepts Check';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, 0
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('What do you say at a hotel reception?', 'I have a reservation.', 1, 1),
    ('What do you say at a hotel reception?', 'I am a luggage.', 0, 2),
    ('What do you say at a hotel reception?', 'The airport is sleeping.', 0, 3),
    ('What do you say at a hotel reception?', 'Close the passport.', 0, 4),

    ('Which word is related to airport travel?', 'boarding pass', 1, 1),
    ('Which word is related to airport travel?', 'deadline', 0, 2),
    ('Which word is related to airport travel?', 'meeting', 0, 3),
    ('Which word is related to airport travel?', 'proposal', 0, 4),

    ('How do you ask for the menu politely?', 'Could I see the menu?', 1, 1),
    ('How do you ask for the menu politely?', 'Menu go now.', 0, 2),
    ('How do you ask for the menu politely?', 'I airport table.', 0, 3),
    ('How do you ask for the menu politely?', 'No hotel help.', 0, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'Travel English Quiz';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, 0
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('What should a good introduction do?', 'Introduce the topic and answer the question clearly', 1, 1),
    ('What should a good introduction do?', 'List all vocabulary only', 0, 2),
    ('What should a good introduction do?', 'Repeat the same sentence many times', 0, 3),
    ('What should a good introduction do?', 'Contain all examples in detail', 0, 4),

    ('What is needed in a body paragraph?', 'A clear idea with explanation and support', 1, 1),
    ('What is needed in a body paragraph?', 'Only one short word', 0, 2),
    ('What is needed in a body paragraph?', 'No connection to the topic', 0, 3),
    ('What is needed in a body paragraph?', 'A random list', 0, 4),

    ('Why is coherence important?', 'It helps the essay flow logically', 1, 1),
    ('Why is coherence important?', 'It makes handwriting bigger', 0, 2),
    ('Why is coherence important?', 'It reduces word count to zero', 0, 3),
    ('Why is coherence important?', 'It removes the conclusion', 0, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'IELTS Writing Task 2 Check';

INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, 0
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('How do you answer "Tell me about yourself"?', 'Give a brief summary of your background and strengths', 1, 1),
    ('How do you answer "Tell me about yourself"?', 'Talk only about your favorite food', 0, 2),
    ('How do you answer "Tell me about yourself"?', 'Say nothing for five minutes', 0, 3),
    ('How do you answer "Tell me about yourself"?', 'Read the company logo', 0, 4),

    ('Which phrase describes a strength?', 'I am a quick learner.', 1, 1),
    ('Which phrase describes a strength?', 'I never prepare.', 0, 2),
    ('Which phrase describes a strength?', 'I dislike all tasks.', 0, 3),
    ('Which phrase describes a strength?', 'I sleep in meetings.', 0, 4),

    ('Why do interviewers ask about teamwork?', 'To understand how you work with others', 1, 1),
    ('Why do interviewers ask about teamwork?', 'To test your handwriting only', 0, 2),
    ('Why do interviewers ask about teamwork?', 'To measure your height', 0, 3),
    ('Why do interviewers ask about teamwork?', 'To avoid communication', 0, 4)
) AS x(question_text, choice_text, is_correct, position)
ON x.question_text = q.question_text
WHERE t.title = 'Interview English Mini Test';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, DATEADD(DAY, -4, SYSUTCDATETIME()), DATEADD(MINUTE, 10, DATEADD(DAY, -4, SYSUTCDATETIME())),
       t.duration_minutes * 60,
       DATEADD(MINUTE, t.duration_minutes, DATEADD(DAY, -4, SYSUTCDATETIME())),
       0, 'SUBMITTED', NULL, NULL
FROM tests t JOIN users u ON u.email = 'student1@gmail.com'
WHERE t.title = 'Foundation Check';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, DATEADD(DAY, -3, SYSUTCDATETIME()), DATEADD(MINUTE, 12, DATEADD(DAY, -3, SYSUTCDATETIME())),
       t.duration_minutes * 60,
       DATEADD(MINUTE, t.duration_minutes, DATEADD(DAY, -3, SYSUTCDATETIME())),
       0, 'SUBMITTED', NULL, NULL
FROM tests t JOIN users u ON u.email = 'student4@gmail.com'
WHERE t.title = 'Elementary Communication Quiz';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, DATEADD(DAY, -2, SYSUTCDATETIME()), DATEADD(MINUTE, 15, DATEADD(DAY, -2, SYSUTCDATETIME())),
       t.duration_minutes * 60,
       DATEADD(MINUTE, t.duration_minutes, DATEADD(DAY, -2, SYSUTCDATETIME())),
       0, 'SUBMITTED', NULL, NULL
FROM tests t JOIN users u ON u.email = 'student8@gmail.com'
WHERE t.title = 'IELTS Speaking Concepts Check';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 2, DATEADD(MINUTE, -5, SYSUTCDATETIME()), NULL,
       t.duration_minutes * 60,
       DATEADD(MINUTE, t.duration_minutes, DATEADD(MINUTE, -5, SYSUTCDATETIME())),
       0, 'IN_PROGRESS', NULL, NULL
FROM tests t JOIN users u ON u.email = 'student2@gmail.com'
WHERE t.title = 'Foundation Check';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, DATEADD(DAY, -3, SYSUTCDATETIME()), DATEADD(MINUTE, 11, DATEADD(DAY, -3, SYSUTCDATETIME())),
       t.duration_minutes * 60,
       DATEADD(MINUTE, t.duration_minutes, DATEADD(DAY, -3, SYSUTCDATETIME())),
       0, 'SUBMITTED', NULL, NULL
FROM tests t JOIN users u ON u.email = 'student11@gmail.com'
WHERE t.title = 'Travel English Quiz';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, DATEADD(DAY, -2, SYSUTCDATETIME()), DATEADD(MINUTE, 15, DATEADD(DAY, -2, SYSUTCDATETIME())),
       t.duration_minutes * 60,
       DATEADD(MINUTE, t.duration_minutes, DATEADD(DAY, -2, SYSUTCDATETIME())),
       0, 'SUBMITTED', NULL, NULL
FROM tests t JOIN users u ON u.email = 'student14@gmail.com'
WHERE t.title = 'IELTS Writing Task 2 Check';

INSERT INTO test_attempts (
  test_id, student_id, attempt_no, started_at, submitted_at,
  time_limit_seconds, expires_at, auto_submitted, status, score, max_score
)
SELECT t.id, u.id, 1, DATEADD(DAY, -1, SYSUTCDATETIME()), DATEADD(MINUTE, 8, DATEADD(DAY, -1, SYSUTCDATETIME())),
       t.duration_minutes * 60,
       DATEADD(MINUTE, t.duration_minutes, DATEADD(DAY, -1, SYSUTCDATETIME())),
       0, 'SUBMITTED', NULL, NULL
FROM tests t JOIN users u ON u.email = 'student16@gmail.com'
WHERE t.title = 'Interview English Mini Test';

INSERT INTO test_attempt_answers (attempt_id, question_id, choice_id, is_correct, points_earned)
SELECT
  ta.id, q.id, tc.id, tc.is_correct,
  CASE WHEN tc.is_correct = 1 THEN q.points ELSE 0 END
FROM test_attempts ta
JOIN tests t ON t.id = ta.test_id
JOIN test_questions q ON q.test_id = t.id
CROSS APPLY (
  SELECT TOP 1 tc1.*
  FROM test_choices tc1
  WHERE tc1.question_id = q.id
  ORDER BY tc1.is_correct DESC, tc1.position ASC
) tc
WHERE ta.status = 'SUBMITTED'
  AND NOT EXISTS (
    SELECT 1 FROM test_attempt_answers x
    WHERE x.attempt_id = ta.id AND x.question_id = q.id
  );

UPDATE ta
SET ta.score = s.total_score,
    ta.max_score = s.total_max
FROM test_attempts ta
JOIN (
  SELECT
    ta2.id AS attempt_id,
    COALESCE(SUM(taa.points_earned), 0) AS total_score,
    COALESCE(SUM(q.points), 0) AS total_max
  FROM test_attempts ta2
  LEFT JOIN test_attempt_answers taa ON taa.attempt_id = ta2.id
  LEFT JOIN test_questions q ON q.id = taa.question_id
  GROUP BY ta2.id
) s ON ta.id = s.attempt_id;

-- =========================
-- OTP
-- =========================
CREATE TABLE otp_codes (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email NVARCHAR(255) NOT NULL,
  code NVARCHAR(10) NOT NULL,
  type NVARCHAR(30) NOT NULL DEFAULT 'register',
  expires_at DATETIME2 NOT NULL,
  used_at DATETIME2 NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

INSERT INTO otp_codes (email, code, type, expires_at, used_at, created_at)
VALUES
  ('student1@gmail.com', '123456', 'register', DATEADD(MINUTE, 10, SYSUTCDATETIME()), NULL, DATEADD(MINUTE, -1, SYSUTCDATETIME())),
  ('student2@gmail.com', '654321', 'forgot_password', DATEADD(MINUTE, 8, SYSUTCDATETIME()), NULL, DATEADD(MINUTE, -2, SYSUTCDATETIME())),
  ('teacher1@gmail.com', '111222', 'register', DATEADD(MINUTE, -1, SYSUTCDATETIME()), NULL, DATEADD(MINUTE, -6, SYSUTCDATETIME())),
  ('teacher2@gmail.com', '333444', 'forgot_password', DATEADD(MINUTE, 5, SYSUTCDATETIME()), DATEADD(MINUTE, -1, SYSUTCDATETIME()), DATEADD(MINUTE, -4, SYSUTCDATETIME())),
  ('newuser@gmail.com', '555666', 'register', DATEADD(MINUTE, 15, SYSUTCDATETIME()), NULL, SYSUTCDATETIME());

-- =========================
-- NOTIFICATIONS
-- =========================
CREATE TABLE notifications (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type NVARCHAR(50) NOT NULL,
  title NVARCHAR(MAX) NOT NULL,
  body NVARCHAR(MAX),
  metadata NVARCHAR(MAX) NOT NULL DEFAULT N'{}',
  is_read BIT NOT NULL DEFAULT 0,
  read_at DATETIME2,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT chk_notification_type CHECK (
    type IN ('ENROLLMENT_NEW', 'LECTURE_APPROVED', 'LECTURE_REJECTED')
  ),
  CONSTRAINT chk_notification_read_consistency CHECK (
    (is_read = 0 AND read_at IS NULL) OR (is_read = 1 AND read_at IS NOT NULL)
  )
);

-- search_vector generated column removed for SQL Server

INSERT INTO notifications (user_id, type, title, body, metadata, is_read, read_at, created_at)
SELECT
  c.teacher_id,
  'ENROLLMENT_NEW',
  'New student enrollment',
  u.full_name + ' enrolled in course "' + c.title + '".',
  (SELECT u.id AS student_id, u.email AS student_email, c.id AS course_id, c.title AS course_title, e.id AS enrollment_id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
  0,
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
  'Your lecture "' + l.title + '" has been approved and published.',
  (SELECT l.id AS lecture_id, l.title AS lecture_title, c.id AS course_id, c.title AS course_title, l.approved_at AS approved_at FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
  0,
  NULL,
  COALESCE(l.approved_at, SYSUTCDATETIME())
FROM lectures l
JOIN courses c ON c.id = l.course_id
WHERE l.status = 'APPROVED_PUBLIC';

INSERT INTO notifications (user_id, type, title, body, metadata, is_read, read_at, created_at)
SELECT
  l.teacher_id,
  'LECTURE_REJECTED',
  'Lecture rejected',
  'Your lecture "' + l.title + '" was rejected. Reason: ' + COALESCE(l.rejection_reason, 'No reason provided'),
  (SELECT l.id AS lecture_id, l.title AS lecture_title, c.id AS course_id, c.title AS course_title, l.rejection_reason AS rejection_reason FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
  0,
  NULL,
  DATEADD(DAY, -1, SYSUTCDATETIME())
FROM lectures l
JOIN courses c ON c.id = l.course_id
WHERE l.status = 'REJECTED';

-- =========================
-- CHAT
-- =========================
CREATE TABLE dbo.chat_sessions (
  id UNIQUEIDENTIFIER primary key default NEWID(),
  user_id UNIQUEIDENTIFIER not null references dbo.users(id) on delete cascade,
  created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

CREATE TABLE dbo.chat_messages (
  id UNIQUEIDENTIFIER primary key default NEWID(),
  session_id UNIQUEIDENTIFIER not null references dbo.chat_sessions(id) on delete cascade,
  role NVARCHAR(20) not null check (role in ('user', 'assistant')),
  content NVARCHAR(MAX) not null,
  metadata NVARCHAR(MAX) DEFAULT N'{}',
  created_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

INSERT INTO dbo.chat_sessions (user_id)
SELECT id FROM dbo.users WHERE email = 'student1@gmail.com';

INSERT INTO dbo.chat_sessions (user_id)
SELECT id FROM dbo.users WHERE email = 'student12@gmail.com';

INSERT INTO dbo.chat_messages (session_id, role, content, metadata)
SELECT cs.id, 'user', 'Em nên học khóa nào nếu đang mất gốc?', '{}'
FROM dbo.chat_sessions cs
JOIN dbo.users u ON u.id = cs.user_id
WHERE u.email = 'student1@gmail.com';

INSERT INTO dbo.chat_messages (session_id, role, content, metadata)
SELECT cs.id, 'assistant',
       'Nếu em đang mất gốc, nên bắt đầu từ English Foundation - Beginner, sau đó học tiếp English Communication - Elementary.',
       '{}'
FROM dbo.chat_sessions cs
JOIN dbo.users u ON u.id = cs.user_id
WHERE u.email = 'student1@gmail.com';

INSERT INTO dbo.chat_messages (session_id, role, content, metadata)
SELECT cs.id, 'user', 'Em muốn học IELTS thì nên bắt đầu từ đâu?', '{}'
FROM dbo.chat_sessions cs
JOIN dbo.users u ON u.id = cs.user_id
WHERE u.email = 'student12@gmail.com';

INSERT INTO dbo.chat_messages (session_id, role, content, metadata)
SELECT cs.id, 'assistant',
       'Nếu em mới làm quen IELTS, nên bắt đầu từ IELTS Foundation - Core Skills rồi tiếp tục với Speaking, Writing, Listening hoặc Reading tùy mục tiêu.',
       '{}'
FROM dbo.chat_sessions cs
JOIN dbo.users u ON u.id = cs.user_id
WHERE u.email = 'student12@gmail.com';

-- =========================
-- KNOWLEDGE DOCUMENTS
-- =========================
CREATE TABLE dbo.knowledge_documents (
  id UNIQUEIDENTIFIER primary key default NEWID(),
  type NVARCHAR(50) not null,
  title NVARCHAR(255) not null,
  content NVARCHAR(MAX) not null,
  source NVARCHAR(255),
  tags NVARCHAR(MAX) DEFAULT N'[]',
  created_at DATETIME2 DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 DEFAULT SYSUTCDATETIME()
);

INSERT INTO dbo.knowledge_documents (type, title, content, source, tags)
VALUES
(
  'guide',
  'Cách học từ vựng để nhớ lâu',
  'Để nhớ từ vựng lâu, nên học theo ngữ cảnh, dùng flashcards, ôn lại theo chu kỳ lặp lại ngắt quãng, đặt câu với từ mới và dùng từ đó trong nói hoặc viết.',
  'manual',
  '["tu vung","nho lau","flashcards"]'
),
(
  'guide',
  'Cách luyện speaking hiệu quả',
  'Để luyện speaking hiệu quả, nên bắt đầu từ câu ngắn, luyện phản xạ với chủ đề quen thuộc, ghi âm lại giọng nói, shadowing theo audio chuẩn và luyện đều mỗi ngày.',
  'manual',
  '["speaking","phan xa","giao tiep"]'
),
(
  'guide',
  'Người mất gốc nên bắt đầu thế nào',
  'Người mất gốc nên bắt đầu từ phát âm cơ bản, từ vựng thông dụng, mẫu câu giao tiếp đơn giản và duy trì học đều đặn trước khi chuyển sang mục tiêu nâng cao hơn.',
  'manual',
  '["mat goc","beginner","co ban"]'
),
(
  'guide',
  'Nên học IELTS hay giao tiếp',
  'Nếu mục tiêu là thi chứng chỉ, đầu ra học tập hoặc du học thì nên ưu tiên IELTS. Nếu mục tiêu là sử dụng trong công việc và đời sống hàng ngày thì nên ưu tiên khóa giao tiếp.',
  'manual',
  '["ielts","giao tiep","so sanh"]'
),
(
  'guide',
  'Lộ trình học tiếng Anh từ cơ bản đến nâng cao',
  'Người học có thể đi theo lộ trình: Pronunciation Starter, Foundation, Elementary, Pre Intermediate, Intermediate, sau đó rẽ sang IELTS hoặc Business English tùy mục tiêu.',
  'manual',
  '["lo trinh","level up","english"]'
),
(
  'guide',
  'Cách học phát âm cho người mới',
  'Người mới nên bắt đầu từ bảng IPA cơ bản, luyện từng âm dễ nhầm, tập nghe và lặp lại theo mẫu, ưu tiên phát âm đúng trước khi nói nhanh.',
  'manual',
  '["phat am","ipa","beginner"]'
),
(
  'guide',
  'Cách viết email tiếng Anh lịch sự',
  'Một email công việc nên có tiêu đề rõ, lời chào phù hợp, nội dung ngắn gọn, hành động cần thực hiện và phần kết lịch sự.',
  'manual',
  '["email","business","work"]'
),
(
  'guide',
  'Chuẩn bị cho phỏng vấn tiếng Anh',
  'Nên chuẩn bị phần giới thiệu bản thân, kinh nghiệm nổi bật, điểm mạnh, lý do ứng tuyển và luyện trả lời thành câu ngắn gọn, rõ ràng.',
  'manual',
  '["interview","job","speaking"]'
),
(
  'guide',
  'Cách cải thiện IELTS Writing Task 2',
  'Muốn cải thiện Task 2 cần luyện phân tích đề, lên dàn ý nhanh, viết mỗi đoạn một ý chính rõ ràng và kiểm soát lỗi ngữ pháp cơ bản.',
  'manual',
  '["ielts","writing","task2"]'
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
-- Full NVARCHAR(MAX) search index not generated in this SQL Server version.

-- =========================
-- QUICK CHECK QUERIES
-- =========================
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_courses FROM courses;
SELECT COUNT(*) AS total_enrollments FROM enrollments;
SELECT COUNT(*) AS total_payments FROM payments;
SELECT COUNT(*) AS total_tests FROM tests;
SELECT COUNT(*) AS total_flashcard_sets FROM flashcard_sets;
SELECT COUNT(*) AS total_notifications FROM notifications;

SELECT title, price, start_at, end_at, status
FROM courses
ORDER BY CASE WHEN price = 0 THEN 0 ELSE 1 END, created_at;

SELECT
  CONVERT(CHAR(7), DATEFROMPARTS(YEAR(created_at), MONTH(created_at), 1), 120) AS revenue_month,
  COUNT(*) AS total_orders,
  SUM(amount) AS revenue
FROM payments
WHERE status = 'SUCCESS'
GROUP BY DATEFROMPARTS(YEAR(created_at), MONTH(created_at), 1)
ORDER BY DATEFROMPARTS(YEAR(created_at), MONTH(created_at), 1);


SELECT * FROM dbo.courses;

SELECT * FROM dbo.courses;
GO

CREATE OR ALTER VIEW dbo.vw_course_overview AS
SELECT
    c.id AS course_id,
    c.title,
    c.status,
    c.price,
    c.total_duration_minutes,
    c.start_at,
    c.end_at,
    c.created_at,
    c.teacher_id,
    u.full_name AS teacher_name,
    COUNT(DISTINCT e.id) AS total_enrollments,
    COUNT(DISTINCT l.id) AS total_lectures,
    SUM(CASE WHEN l.status = 'APPROVED_PUBLIC' THEN 1 ELSE 0 END) AS approved_lectures,
    SUM(CASE WHEN l.status = 'PENDING_APPROVAL' THEN 1 ELSE 0 END) AS pending_lectures,
    SUM(CASE WHEN l.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_lectures,
    AVG(CAST(e.progress_percent AS FLOAT)) AS avg_progress_percent
FROM dbo.courses c
JOIN dbo.users u
    ON u.id = c.teacher_id
LEFT JOIN dbo.enrollments e
    ON e.course_id = c.id
LEFT JOIN dbo.lectures l
    ON l.course_id = c.id
GROUP BY
    c.id, c.title, c.status, c.price, c.total_duration_minutes,
    c.start_at, c.end_at, c.created_at, c.teacher_id, u.full_name;
GO

CREATE OR ALTER VIEW dbo.vw_payment_monthly AS
SELECT
    DATEFROMPARTS(YEAR(created_at), MONTH(created_at), 1) AS revenue_month,
    YEAR(created_at) AS revenue_year,
    MONTH(created_at) AS revenue_month_no,
    COUNT(*) AS total_orders,
    SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) AS success_orders,
    SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed_orders,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_orders,
    SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END) AS success_revenue
FROM dbo.payments
GROUP BY
    DATEFROMPARTS(YEAR(created_at), MONTH(created_at), 1),
    YEAR(created_at),
    MONTH(created_at);
GO

CREATE OR ALTER VIEW dbo.vw_learning_performance AS
SELECT
    e.id AS enrollment_id,
    e.student_id,
    u.full_name AS student_name,
    u.email AS student_email,
    e.course_id,
    c.title AS course_title,
    e.progress_percent,
    e.enrolled_at,
    t.id AS test_id,
    t.title AS test_title,
    ta.id AS attempt_id,
    ta.attempt_no,
    ta.status AS attempt_status,
    ta.score,
    ta.max_score,
    CASE
        WHEN ta.max_score IS NULL OR ta.max_score = 0 THEN NULL
        ELSE ROUND((ta.score * 100.0) / ta.max_score, 2)
    END AS score_percent
FROM dbo.enrollments e
JOIN dbo.users u
    ON u.id = e.student_id
JOIN dbo.courses c
    ON c.id = e.course_id
LEFT JOIN dbo.tests t
    ON t.course_id = c.id
LEFT JOIN dbo.test_attempts ta
    ON ta.test_id = t.id
   AND ta.student_id = e.student_id;
GO

CREATE OR ALTER VIEW dbo.vw_user_growth_monthly AS
SELECT
    DATEFROMPARTS(YEAR(created_at), MONTH(created_at), 1) AS created_month,
    YEAR(created_at) AS created_year,
    MONTH(created_at) AS created_month_no,
    COUNT(*) AS total_new_users,
    SUM(CASE WHEN role_id = 2 THEN 1 ELSE 0 END) AS new_teachers,
    SUM(CASE WHEN role_id = 3 THEN 1 ELSE 0 END) AS new_students,
    SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) AS verified_users
FROM dbo.users
WHERE is_deleted = 0
GROUP BY
    DATEFROMPARTS(YEAR(created_at), MONTH(created_at), 1),
    YEAR(created_at),
    MONTH(created_at);
GO

CREATE OR ALTER VIEW dbo.vw_dashboard_kpi AS
SELECT
    (SELECT COUNT(*) FROM dbo.users WHERE is_deleted = 0) AS total_users,
    (SELECT COUNT(*) FROM dbo.users WHERE role_id = 3 AND is_deleted = 0) AS total_students,
    (SELECT COUNT(*) FROM dbo.users WHERE role_id = 2 AND is_deleted = 0) AS total_teachers,
    (SELECT COUNT(*) FROM dbo.courses) AS total_courses,
    (SELECT COUNT(*) FROM dbo.enrollments) AS total_enrollments,
    (SELECT COUNT(*) FROM dbo.payments) AS total_payments,
    (SELECT ISNULL(SUM(amount),0) FROM dbo.payments WHERE status = 'SUCCESS') AS total_revenue,
    (SELECT COUNT(*) FROM dbo.lectures WHERE status = 'PENDING_APPROVAL') AS pending_lectures,
    (SELECT COUNT(*) FROM dbo.tests WHERE status = 'PUBLISHED') AS published_tests,
    (SELECT COUNT(*) FROM dbo.flashcard_sets WHERE status = 'PUBLISHED' AND is_deleted = 0) AS published_flashcard_sets;
GO

CREATE TABLE dbo.ai_dashboard_recommendations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    scope_type NVARCHAR(50) NOT NULL DEFAULT 'global',
    scope_value NVARCHAR(255) NULL,
    revenue_advice NVARCHAR(MAX) NULL,
    learning_advice NVARCHAR(MAX) NULL,
    priority_action NVARCHAR(MAX) NULL,
    raw_summary NVARCHAR(MAX) NULL,
    model_name NVARCHAR(100) NULL,
    generated_at DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE OR ALTER VIEW dbo.vw_ai_dashboard_recommendation_latest AS
WITH ranked AS (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY scope_type, ISNULL(scope_value, '')
            ORDER BY generated_at DESC, id DESC
        ) AS rn
    FROM dbo.ai_dashboard_recommendations
)
SELECT
    id,
    scope_type,
    scope_value,
    revenue_advice,
    learning_advice,
    priority_action,
    raw_summary,
    model_name,
    generated_at
FROM ranked
WHERE rn = 1;
GO

CREATE INDEX idx_payments_status_created_at
ON dbo.payments(status, created_at);
GO

CREATE INDEX idx_enrollments_course_enrolled_at
ON dbo.enrollments(course_id, enrolled_at);
GO

CREATE INDEX idx_lectures_course_status
ON dbo.lectures(course_id, status);
GO

CREATE INDEX idx_tests_course_status
ON dbo.tests(course_id, status);
GO

CREATE INDEX idx_test_attempts_student_test_status
ON dbo.test_attempts(student_id, test_id, status);
GO





