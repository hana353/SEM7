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