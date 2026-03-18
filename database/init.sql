CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
DROP TABLE IF EXISTS quiz_cards CASCADE;
DROP TABLE IF EXISTS quiz_sets CASCADE;
DROP TABLE IF EXISTS test_choices CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS tests CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

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

-- bcrypt hash cho mật khẩu: 123456
-- có thể dùng cho tất cả tài khoản test
DO $$
DECLARE
  pwd_hash TEXT := '$2b$10$LNzoIv2eFrFlYvWXTm9mDO0CTB83ZFAsOt5ugjj7vAfSaWLFVLx62';
BEGIN
  INSERT INTO users(email, password_hash, full_name, role_id, is_verified, is_active, is_deleted)
  VALUES
    ('admin@gmail.com',    pwd_hash, 'System Admin', 1, TRUE, TRUE, FALSE),
    ('teacher1@gmail.com', pwd_hash, 'John Smith',   2, TRUE, TRUE, FALSE),
    ('teacher2@gmail.com', pwd_hash, 'Emma Brown',   2, TRUE, TRUE, FALSE);

  FOR i IN 1..100 LOOP
    INSERT INTO users(email, password_hash, full_name, role_id, is_verified, is_active, is_deleted)
    VALUES (
      format('student%s@gmail.com', i),
      pwd_hash,
      format('Student %s', i),
      3,
      TRUE,
      TRUE,
      FALSE
    );
  END LOOP;
END $$;

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
SELECT id, 'English for Beginners', 'Basic communication', 0, 120, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id, 'IELTS Speaking Mastery', 'Improve speaking', 199000, 180, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id, 'Daily English Conversation', 'Conversation skills', 99000, 150, 'ON_SALE'
FROM users WHERE email = 'teacher1@gmail.com';

INSERT INTO courses (teacher_id, title, description, price, total_duration_minutes, status)
SELECT id, 'Business English', 'Workplace English', 299000, 200, 'ON_SALE'
FROM users WHERE email = 'teacher2@gmail.com';

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

INSERT INTO lectures(
  course_id, teacher_id, title, video_url, duration_minutes, order_index,
  status, approved_by, approved_at
)
SELECT
  c.id,
  c.teacher_id,
  'Alphabet',
  'https://youtube.com/a',
  10,
  1,
  'APPROVED_PUBLIC',
  a.id,
  NOW()
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'English for Beginners';

INSERT INTO lectures(
  course_id, teacher_id, title, video_url, duration_minutes, order_index,
  status, approved_by, approved_at
)
SELECT
  c.id,
  c.teacher_id,
  'Basic Greetings',
  'https://youtube.com/b',
  12,
  2,
  'APPROVED_PUBLIC',
  a.id,
  NOW()
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'English for Beginners';

CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

DO $$
DECLARE
  i INT := 1;
  student_uuid UUID;
  course_uuid UUID;
BEGIN
  WHILE i <= 300 LOOP
    SELECT id INTO student_uuid
    FROM users
    WHERE role_id = 3
    ORDER BY RANDOM()
    LIMIT 1;

    SELECT id INTO course_uuid
    FROM courses
    ORDER BY RANDOM()
    LIMIT 1;

    IF student_uuid IS NOT NULL AND course_uuid IS NOT NULL THEN
      INSERT INTO enrollments(student_id, course_id, progress_percent, enrolled_at)
      VALUES (
        student_uuid,
        course_uuid,
        floor(random() * 100)::INT,
        NOW() - (random() * 120 || ' days')::INTERVAL
      )
      ON CONFLICT (student_id, course_id) DO NOTHING;
    END IF;

    i := i + 1;
  END LOOP;
END $$;

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
DO $$
DECLARE
  i INT := 1;
  e RECORD;
  price_value NUMERIC(10,2);
BEGIN
  WHILE i <= 200 LOOP
    SELECT * INTO e
    FROM enrollments
    ORDER BY RANDOM()
    LIMIT 1;

    IF FOUND THEN
      SELECT price INTO price_value
      FROM courses
      WHERE id = e.course_id
      LIMIT 1;

      INSERT INTO payments(
        student_id, course_id, enrollment_id, amount, status,
        payment_method, txn_ref, order_info, created_at
      )
      VALUES (
        e.student_id,
        e.course_id,
        e.id,
        COALESCE(price_value, 0),
        CASE WHEN random() > 0.15 THEN 'SUCCESS' ELSE 'FAILED' END,
        'VNPAY',
        md5(random()::TEXT || clock_timestamp()::TEXT),
        'Seed payment',
        NOW() - (random() * 90 || ' days')::INTERVAL
      )
      ON CONFLICT (txn_ref) DO NOTHING;
    END IF;

    i := i + 1;
  END LOOP;
END $$;

CREATE TABLE vocabulary_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO vocabulary_topics(title)
VALUES ('Food'), ('Travel'), ('Daily Conversation');

CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES vocabulary_topics(id),
  word VARCHAR(255) NOT NULL,
  meaning TEXT,
  example_sentence TEXT
);

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'apple', 'quả táo', 'I eat an apple everyday'
FROM vocabulary_topics WHERE title = 'Food';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'airport', 'sân bay', 'The airport is crowded'
FROM vocabulary_topics WHERE title = 'Travel';

CREATE TABLE pronunciation_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  vocabulary_id UUID NOT NULL REFERENCES vocabularies(id),
  spoken_text TEXT,
  accuracy_percent NUMERIC(5,2),
  practiced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
DECLARE
  i INT := 1;
  student_uuid UUID;
  vocab_uuid UUID;
BEGIN
  WHILE i <= 200 LOOP
    SELECT id INTO student_uuid
    FROM users
    WHERE role_id = 3
    ORDER BY RANDOM()
    LIMIT 1;

    SELECT id INTO vocab_uuid
    FROM vocabularies
    ORDER BY RANDOM()
    LIMIT 1;

    IF student_uuid IS NOT NULL AND vocab_uuid IS NOT NULL THEN
      INSERT INTO pronunciation_practice(student_id, vocabulary_id, spoken_text, accuracy_percent, practiced_at)
      VALUES (
        student_uuid,
        vocab_uuid,
        'sample speech',
        (60 + floor(random() * 40))::INT,
        NOW() - (random() * 60 || ' days')::INTERVAL
      );
    END IF;

    i := i + 1;
  END LOOP;
END $$;

-- Flashcards (replacing "quiz" feature)
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


UPDATE users
SET password_hash = '$2b$10$LNzoIv2eFrFlYvWXTm9mDO0CTB83ZFAsOt5ugjj7vAfSaWLFVLx62',
    is_verified = TRUE,
    is_active = TRUE,
    is_deleted = FALSE,
    updated_at = NOW();

SELECT email, password_hash, is_verified, is_active, is_deleted
FROM users
WHERE email = 'admin@gmail.com';


CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'register',
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_otp_codes_email_type ON otp_codes(email, type);
CREATE INDEX idx_otp_codes_created_at ON otp_codes(created_at DESC);

-- Teacher notifications (for enrollments + lecture approvals, filterable by type)
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

CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_user_type_created ON notifications(user_id, type, created_at DESC);
CREATE INDEX idx_notifications_search ON notifications USING GIN(search_vector);