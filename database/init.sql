USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'SEM7')
BEGIN
    ALTER DATABASE [SEM7] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [SEM7];
END
GO

CREATE DATABASE [SEM7]
COLLATE SQL_Latin1_General_CP1254_CI_AS;
GO

USE [SEM7];
GO

/* =========================================================
   ROLES
========================================================= */
CREATE TABLE roles (
    id SMALLINT PRIMARY KEY,
    code NVARCHAR(30) UNIQUE NOT NULL,
    description NVARCHAR(255)
);
GO

/* =========================================================
   USERS  (ADD is_verified for OTP flow)
========================================================= */
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    role_id SMALLINT NOT NULL REFERENCES roles(id),

    is_verified BIT NOT NULL CONSTRAINT DF_users_is_verified DEFAULT 0, -- NEW
    is_active BIT NOT NULL CONSTRAINT DF_users_is_active DEFAULT 1,
    is_deleted BIT NOT NULL CONSTRAINT DF_users_is_deleted DEFAULT 0,

    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_users_updated_at DEFAULT SYSDATETIMEOFFSET()
);
GO

/* =========================================================
   OTP CODES (NEW)
   - used for register/login OTP
========================================================= */
CREATE TABLE otp_codes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL,
    code NVARCHAR(10) NOT NULL,
    type NVARCHAR(20) NOT NULL,              -- 'register' | 'login' | 'reset'
    expires_at DATETIME2 NOT NULL,
    used_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_otp_codes_created_at DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX IX_otp_codes_email_type_created
ON otp_codes(email, type, created_at DESC);
GO

/* =========================================================
   COURSES
========================================================= */
CREATE TABLE courses (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    teacher_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(12,2) NOT NULL CONSTRAINT DF_courses_price DEFAULT 0,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_courses_status DEFAULT 'PUBLISHED',
    total_duration_minutes INT NOT NULL CONSTRAINT DF_courses_total_duration DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_courses_created_at DEFAULT SYSDATETIMEOFFSET()
);
GO

/* =========================================================
   LECTURES
========================================================= */
CREATE TABLE lectures (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title NVARCHAR(255) NOT NULL,
    video_url NVARCHAR(500),
    duration_minutes INT NOT NULL CONSTRAINT DF_lectures_duration DEFAULT 0,
    order_index INT NOT NULL
);
GO

/* =========================================================
   ENROLLMENTS
========================================================= */
CREATE TABLE enrollments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id),
    progress_percent DECIMAL(5,2) NOT NULL CONSTRAINT DF_enrollments_progress DEFAULT 0,
    enrolled_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_enrollments_enrolled_at DEFAULT SYSDATETIMEOFFSET(),
    UNIQUE(student_id, course_id)
);
GO

/* =========================================================
   QUIZZES
========================================================= */
CREATE TABLE quizzes (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id),
    title NVARCHAR(255) NOT NULL,
    passing_score DECIMAL(5,2) NOT NULL
);
GO

/* =========================================================
   QUIZ QUESTIONS
========================================================= */
CREATE TABLE quiz_questions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    quiz_id UNIQUEIDENTIFIER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question NVARCHAR(MAX) NOT NULL,
    option_a NVARCHAR(255) NOT NULL,
    option_b NVARCHAR(255) NOT NULL,
    option_c NVARCHAR(255) NOT NULL,
    option_d NVARCHAR(255) NOT NULL,
    correct_answer CHAR(1) NOT NULL
);
GO

/* =========================================================
   QUIZ ATTEMPTS + ANSWERS
========================================================= */
CREATE TABLE quiz_attempts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    quiz_id UNIQUEIDENTIFIER NOT NULL REFERENCES quizzes(id),
    student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    score DECIMAL(5,2) NOT NULL CONSTRAINT DF_quiz_attempts_score DEFAULT 0,
    submitted_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_attempts_submitted_at DEFAULT SYSDATETIMEOFFSET()
);
GO

CREATE TABLE quiz_answers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    attempt_id UNIQUEIDENTIFIER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id UNIQUEIDENTIFIER NOT NULL REFERENCES quiz_questions(id),
    selected_answer CHAR(1) NOT NULL,
    is_correct BIT NOT NULL
);
GO

/* =========================================================
   VOCABULARY
========================================================= */
CREATE TABLE vocabulary_topics (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE vocabularies (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    topic_id UNIQUEIDENTIFIER NOT NULL REFERENCES vocabulary_topics(id),
    word NVARCHAR(255) NOT NULL,
    meaning NVARCHAR(MAX),
    example_sentence NVARCHAR(MAX)
);
GO

/* =========================================================
   SAMPLE DATA - VOCABULARY TOPICS & WORDS
   (Data mẫu phục vụ demo giao diện admin / luyện từ vựng)
========================================================= */

INSERT INTO vocabulary_topics (title)
VALUES
  (N'Daily Activities - A1'),
  (N'Travel & Transport - A2'),
  (N'Technology - B1');

INSERT INTO vocabularies (topic_id, word, meaning, example_sentence)
SELECT t.id,
       v.word,
       v.meaning,
       v.example_sentence
FROM vocabulary_topics t
JOIN (
  /* Daily Activities - A1 */
  SELECT
    N'Daily Activities - A1'              AS topic_title,
    N'wake up'                            AS word,
    N'thức dậy'                           AS meaning,
    N'I usually wake up at 6 a.m.'        AS example_sentence
  UNION ALL
  SELECT
    N'Daily Activities - A1',
    N'brush teeth',
    N'đánh răng',
    N'Children should brush their teeth twice a day.'
  UNION ALL
  SELECT
    N'Daily Activities - A1',
    N'have breakfast',
    N'ăn sáng',
    N'We have breakfast together every morning.'
  UNION ALL
  SELECT
    N'Daily Activities - A1',
    N'go to school',
    N'đi học',
    N'The kids go to school by bus.'
  UNION ALL
  SELECT
    N'Daily Activities - A1',
    N'do homework',
    N'làm bài tập về nhà',
    N'She does her homework after dinner.'

  /* Travel & Transport - A2 */
  UNION ALL
  SELECT
    N'Travel & Transport - A2',
    N'boarding pass',
    N'thẻ lên máy bay',
    N'Please show your boarding pass and passport.'
  UNION ALL
  SELECT
    N'Travel & Transport - A2',
    N'check-in',
    N'làm thủ tục nhận phòng / lên máy bay',
    N'We need to check in two hours before the flight.'
  UNION ALL
  SELECT
    N'Travel & Transport - A2',
    N'round trip',
    N'khứ hồi',
    N'I bought a round-trip ticket to London.'
  UNION ALL
  SELECT
    N'Travel & Transport - A2',
    N'luggage',
    N'hành lý',
    N'Your luggage is too heavy.'
  UNION ALL
  SELECT
    N'Travel & Transport - A2',
    N'reservation',
    N'đặt chỗ (phòng, vé...)',
    N'I have a reservation under the name Minh.'

  /* Technology - B1 */
  UNION ALL
  SELECT
    N'Technology - B1',
    N'wireless',
    N'không dây',
    N'The office now has a wireless internet connection.'
  UNION ALL
  SELECT
    N'Technology - B1',
    N'upload',
    N'tải lên',
    N'Please upload your assignment to the platform.'
  UNION ALL
  SELECT
    N'Technology - B1',
    N'password',
    N'mật khẩu',
    N'Always keep your password secret.'
  UNION ALL
  SELECT
    N'Technology - B1',
    N'software',
    N'phần mềm',
    N'This software helps students learn English online.'
  UNION ALL
  SELECT
    N'Technology - B1',
    N'voice recognition',
    N'nhận dạng giọng nói',
    N'We use voice recognition to convert speech to text.'
) v
  ON t.title = v.topic_title;
GO

/* =========================================================
   PRONUNCIATION PRACTICE
========================================================= */
CREATE TABLE pronunciation_practice (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    vocabulary_id UNIQUEIDENTIFIER NOT NULL REFERENCES vocabularies(id),
    spoken_text NVARCHAR(MAX),
    accuracy_percent DECIMAL(5,2),
    practiced_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_pronunciation_practice_practiced_at DEFAULT SYSDATETIMEOFFSET()
);
GO

/* =========================================================
   PAYMENTS
========================================================= */
CREATE TABLE payments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id),
    enrollment_id UNIQUEIDENTIFIER NOT NULL REFERENCES enrollments(id),
    amount DECIMAL(12,2) NOT NULL,
    status NVARCHAR(20) NOT NULL,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_payments_created_at DEFAULT SYSDATETIMEOFFSET()
);
GO

IF NOT EXISTS (SELECT 1 FROM roles WHERE id = 1)
BEGIN
  INSERT INTO roles (id, code, description) VALUES
  (1, 'ADMIN',   'System administrator'),
  (2, 'TEACHER', 'Course creator'),
  (3, 'STUDENT', 'Learner'),
  (4, 'GUEST',   'Unauthenticated user');
END

ALTER TABLE courses ADD created_by UNIQUEIDENTIFIER NULL;
ALTER TABLE courses ADD CONSTRAINT FK_courses_created_by FOREIGN KEY (created_by) REFERENCES users(id);

/* =========================================================
   DEFAULT ADMIN ACCOUNT (email: admin@gmail.com / pass: Admin@123)
========================================================= */

IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@gmail.com')
BEGIN
    INSERT INTO users (
        email,
        password_hash,
        full_name,
        role_id,
        is_verified,
        is_active,
        is_deleted
    )
    VALUES (
        'admin@gmail.com',
        '$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG', -- bcrypt hash cho 'Admin@123'
        'System Admin',
        1,                -- role_id = ADMIN
        1,                -- verified
        1,                -- active
        0                 -- not deleted
    );
END
GO