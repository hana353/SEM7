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
   USERS (ADD is_verified for OTP flow)
========================================================= */
CREATE TABLE users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    role_id SMALLINT NOT NULL REFERENCES roles(id),

    is_verified BIT NOT NULL CONSTRAINT DF_users_is_verified DEFAULT 0,
    is_active   BIT NOT NULL CONSTRAINT DF_users_is_active   DEFAULT 1,
    is_deleted  BIT NOT NULL CONSTRAINT DF_users_is_deleted  DEFAULT 0,

    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_users_created_at DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_users_updated_at DEFAULT SYSDATETIMEOFFSET()
);
GO

/* =========================================================
   OTP CODES
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

/* creator tracking (as you had) */
ALTER TABLE courses ADD created_by UNIQUEIDENTIFIER NULL;
ALTER TABLE courses ADD CONSTRAINT FK_courses_created_by
FOREIGN KEY (created_by) REFERENCES users(id);
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
   FLASHCARD QUIZZES (NEW)
========================================================= */
CREATE TABLE quiz_sets (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    teacher_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    course_id UNIQUEIDENTIFIER NULL REFERENCES courses(id),

    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,

    status NVARCHAR(20) NOT NULL CONSTRAINT DF_quiz_sets_status DEFAULT 'DRAFT', -- DRAFT|PUBLISHED|ARCHIVED
    is_deleted BIT NOT NULL CONSTRAINT DF_quiz_sets_is_deleted DEFAULT 0,

    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_sets_created_at DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_sets_updated_at DEFAULT SYSDATETIMEOFFSET()
);
GO

CREATE INDEX IX_quiz_sets_course_status
ON quiz_sets(course_id, status)
WHERE is_deleted = 0;
GO

CREATE TABLE quiz_cards (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    quiz_set_id UNIQUEIDENTIFIER NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,

    front_text NVARCHAR(MAX) NOT NULL,
    back_text  NVARCHAR(MAX) NOT NULL,
    front_image_url NVARCHAR(500) NULL,
    back_image_url  NVARCHAR(500) NULL,

    position INT NOT NULL CONSTRAINT DF_quiz_cards_position DEFAULT 0,
    is_deleted BIT NOT NULL CONSTRAINT DF_quiz_cards_is_deleted DEFAULT 0,

    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_cards_created_at DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_cards_updated_at DEFAULT SYSDATETIMEOFFSET()
);
GO

CREATE INDEX IX_quiz_cards_set_position
ON quiz_cards(quiz_set_id, position)
WHERE is_deleted = 0;
GO

/* =========================================================
   TESTS / EXAMS (NEW)
========================================================= */
CREATE TABLE tests (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    teacher_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    course_id UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id),

    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,

    duration_minutes INT NULL,
    max_attempts INT NULL, -- NULL = unlimited

    shuffle_questions BIT NOT NULL CONSTRAINT DF_tests_shuffle_questions DEFAULT 0,
    shuffle_choices   BIT NOT NULL CONSTRAINT DF_tests_shuffle_choices DEFAULT 0,

    status NVARCHAR(20) NOT NULL CONSTRAINT DF_tests_status DEFAULT 'DRAFT', -- DRAFT|PUBLISHED|CLOSED
    open_at DATETIMEOFFSET NULL,
    close_at DATETIMEOFFSET NULL,

    is_deleted BIT NOT NULL CONSTRAINT DF_tests_is_deleted DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_tests_created_at DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_tests_updated_at DEFAULT SYSDATETIMEOFFSET()
);
GO

CREATE INDEX IX_tests_course_status
ON tests(course_id, status)
WHERE is_deleted = 0;
GO

CREATE TABLE test_questions (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    test_id UNIQUEIDENTIFIER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,

    question_text NVARCHAR(MAX) NOT NULL,
    points DECIMAL(6,2) NOT NULL CONSTRAINT DF_test_questions_points DEFAULT 1,
    position INT NOT NULL CONSTRAINT DF_test_questions_position DEFAULT 0,

    is_deleted BIT NOT NULL CONSTRAINT DF_test_questions_is_deleted DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_test_questions_created_at DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_test_questions_updated_at DEFAULT SYSDATETIMEOFFSET()
);
GO

CREATE INDEX IX_test_questions_test_position
ON test_questions(test_id, position)
WHERE is_deleted = 0;
GO

CREATE TABLE test_choices (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    question_id UNIQUEIDENTIFIER NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,

    choice_text NVARCHAR(MAX) NOT NULL,
    is_correct BIT NOT NULL CONSTRAINT DF_test_choices_is_correct DEFAULT 0,
    position INT NOT NULL CONSTRAINT DF_test_choices_position DEFAULT 0,

    is_deleted BIT NOT NULL CONSTRAINT DF_test_choices_is_deleted DEFAULT 0
);
GO

CREATE INDEX IX_test_choices_question_position
ON test_choices(question_id, position)
WHERE is_deleted = 0;
GO

CREATE TABLE test_attempts (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    test_id UNIQUEIDENTIFIER NOT NULL REFERENCES tests(id),
    student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),

    started_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_test_attempts_started_at DEFAULT SYSDATETIMEOFFSET(),
    submitted_at DATETIMEOFFSET NULL,

    status NVARCHAR(20) NOT NULL CONSTRAINT DF_test_attempts_status DEFAULT 'IN_PROGRESS', -- IN_PROGRESS|SUBMITTED|GRADED
    score DECIMAL(6,2) NULL,
    max_score DECIMAL(6,2) NULL
);
GO

CREATE INDEX IX_test_attempts_test_student
ON test_attempts(test_id, student_id, started_at DESC);
GO

CREATE TABLE test_attempt_answers (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    attempt_id UNIQUEIDENTIFIER NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id UNIQUEIDENTIFIER NOT NULL REFERENCES test_questions(id),
    choice_id UNIQUEIDENTIFIER NULL REFERENCES test_choices(id),

    is_correct BIT NULL,
    points_earned DECIMAL(6,2) NULL,

    CONSTRAINT UQ_attempt_question UNIQUE(attempt_id, question_id)
);
GO

CREATE INDEX IX_attempt_answers_attempt
ON test_attempt_answers(attempt_id);
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
   PAYMENTS (UPDATED FOR VNPAY)
   - enrollment_id: NULL (create enrollment after success)
   - txn_ref: unique code sent to VNPay (vnp_TxnRef)
   - VNPay response fields for reconciliation
========================================================= */
CREATE TABLE payments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),

    student_id UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    course_id  UNIQUEIDENTIFIER NOT NULL REFERENCES courses(id),

    enrollment_id UNIQUEIDENTIFIER NULL REFERENCES enrollments(id),

    payment_method NVARCHAR(30) NOT NULL CONSTRAINT DF_payments_method DEFAULT 'VNPAY',

    -- internal order code -> map to vnp_TxnRef
    txn_ref NVARCHAR(100) NOT NULL,

    order_info NVARCHAR(255) NULL,
    amount DECIMAL(12,2) NOT NULL,

    -- system status
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_payments_status DEFAULT 'PENDING',

    -- VNPay returned fields
    vnp_transaction_no NVARCHAR(50)  NULL,  -- vnp_TransactionNo
    bank_code          NVARCHAR(50)  NULL,  -- vnp_BankCode
    bank_tran_no       NVARCHAR(100) NULL,  -- vnp_BankTranNo
    card_type          NVARCHAR(50)  NULL,  -- vnp_CardType
    response_code      NVARCHAR(10)  NULL,  -- vnp_ResponseCode
    transaction_status NVARCHAR(10)  NULL,  -- vnp_TransactionStatus
    pay_date           DATETIMEOFFSET NULL, -- parsed from vnp_PayDate (yyyyMMddHHmmss)

    -- raw gateway payload (return/ipn) for debugging
    gateway_response NVARCHAR(MAX) NULL,

    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_payments_created_at DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_payments_updated_at DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT UQ_payments_txn_ref UNIQUE (txn_ref),

    CONSTRAINT CHK_payments_status CHECK (
        status IN ('PENDING','SUCCESS','FAILED','CANCELLED','EXPIRED','REFUNDED')
    )
);
GO

CREATE INDEX IX_payments_student_course ON payments(student_id, course_id);
GO

CREATE INDEX IX_payments_status ON payments(status);
GO

CREATE INDEX IX_payments_created_at ON payments(created_at DESC);
GO

/* =========================================================
   SEED ROLES (NO SAMPLE VOCAB DATA)
========================================================= */
IF NOT EXISTS (SELECT 1 FROM roles WHERE id = 1)
BEGIN
  INSERT INTO roles (id, code, description) VALUES
  (1, 'ADMIN',   'System administrator'),
  (2, 'TEACHER', 'Course creator'),
  (3, 'STUDENT', 'Learner'),
  (4, 'GUEST',   'Unauthenticated user');
END
GO

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
        '$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG',
        'System Admin',
        1,
        1,
        1,
        0
    );
END
GO