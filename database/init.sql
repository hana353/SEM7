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
DROP TABLE IF EXISTS otp_codes CASCADE;

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

-- Seed thêm lectures
INSERT INTO lectures (
  course_id, teacher_id, title, video_url, duration_minutes, order_index,
  status, submitted_at, approved_by, approved_at
)
SELECT
  c.id, c.teacher_id, 'Speaking Part 1 Introduction', 'https://youtube.com/ielts-speaking-1', 18, 1,
  'APPROVED_PUBLIC', NOW() - INTERVAL '20 days', a.id, NOW() - INTERVAL '18 days'
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'IELTS Speaking Mastery';

INSERT INTO lectures (
  course_id, teacher_id, title, video_url, duration_minutes, order_index,
  status, submitted_at
)
SELECT
  c.id, c.teacher_id, 'Speaking Part 2 Long Turn', 'https://youtube.com/ielts-speaking-2', 22, 2,
  'PENDING_APPROVAL', NOW() - INTERVAL '2 days'
FROM courses c
WHERE c.title = 'IELTS Speaking Mastery';

INSERT INTO lectures (
  course_id, teacher_id, title, video_url, duration_minutes, order_index,
  status, submitted_at, approved_by, approved_at
)
SELECT
  c.id, c.teacher_id, 'Small Talk in Daily Life', 'https://youtube.com/daily-conversation-1', 15, 1,
  'APPROVED_PUBLIC', NOW() - INTERVAL '14 days', a.id, NOW() - INTERVAL '13 days'
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'Daily English Conversation';

INSERT INTO lectures (
  course_id, teacher_id, title, video_url, duration_minutes, order_index,
  status, submitted_at, rejection_reason
)
SELECT
  c.id, c.teacher_id, 'Ordering Coffee Naturally', 'https://youtube.com/daily-conversation-2', 14, 2,
  'REJECTED', NOW() - INTERVAL '5 days', 'Audio quality is too low, please re-upload a clearer version.'
FROM courses c
WHERE c.title = 'Daily English Conversation';

INSERT INTO lectures (
  course_id, teacher_id, title, video_url, duration_minutes, order_index,
  status, submitted_at, approved_by, approved_at
)
SELECT
  c.id, c.teacher_id, 'Professional Email Writing', 'https://youtube.com/business-english-1', 20, 1,
  'APPROVED_PUBLIC', NOW() - INTERVAL '11 days', a.id, NOW() - INTERVAL '10 days'
FROM courses c
JOIN users a ON a.email = 'admin@gmail.com'
WHERE c.title = 'Business English';

INSERT INTO lectures (
  course_id, teacher_id, title, video_url, duration_minutes, order_index, status
)
SELECT
  c.id, c.teacher_id, 'Meeting Vocabulary Basics', 'https://youtube.com/business-english-2', 17, 2, 'DRAFT'
FROM courses c
WHERE c.title = 'Business English';

-- Seed thêm vocabularies
INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'menu', 'thực đơn', 'Can I see the menu, please?'
FROM vocabulary_topics
WHERE title = 'Food';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'noodles', 'mì', 'I would like a bowl of noodles.'
FROM vocabulary_topics
WHERE title = 'Food';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'passport', 'hộ chiếu', 'Please show your passport at check-in.'
FROM vocabulary_topics
WHERE title = 'Travel';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'hotel', 'khách sạn', 'We stayed at a small hotel near the beach.'
FROM vocabulary_topics
WHERE title = 'Travel';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'reservation', 'đặt chỗ', 'I made a reservation for dinner.'
FROM vocabulary_topics
WHERE title = 'Daily Conversation';

INSERT INTO vocabularies(topic_id, word, meaning, example_sentence)
SELECT id, 'introduce', 'giới thiệu', 'Let me introduce myself.'
FROM vocabulary_topics
WHERE title = 'Daily Conversation';

-- Seed flashcard_sets
INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Beginner Alphabet Cards', 'Basic alphabet and pronunciation', 'PUBLISHED', FALSE
FROM courses c
WHERE c.title = 'English for Beginners';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Daily Conversation Starter Pack', 'Useful phrases for common situations', 'PUBLISHED', FALSE
FROM courses c
WHERE c.title = 'Daily English Conversation';

INSERT INTO flashcard_sets (teacher_id, course_id, title, description, status, is_deleted)
SELECT c.teacher_id, c.id, 'Business Meeting Vocabulary', 'Key vocabulary used in meetings', 'DRAFT', FALSE
FROM courses c
WHERE c.title = 'Business English';

-- Seed flashcard_cards
INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('A', 'A - Apple', 1),
    ('B', 'B - Book', 2),
    ('C', 'C - Cat', 3),
    ('D', 'D - Dog', 4),
    ('E', 'E - Elephant', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'Beginner Alphabet Cards';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('How are you?', 'I am fine, thank you.', 1),
    ('Nice to meet you.', 'Rất vui được gặp bạn.', 2),
    ('What do you do?', 'Bạn làm nghề gì?', 3),
    ('Could you help me?', 'Bạn có thể giúp tôi không?', 4),
    ('See you later.', 'Hẹn gặp lại sau.', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'Daily Conversation Starter Pack';

INSERT INTO flashcard_cards (flashcard_set_id, front_text, back_text, position)
SELECT fs.id, x.front_text, x.back_text, x.position
FROM flashcard_sets fs
JOIN (
  VALUES
    ('Agenda', 'Chương trình cuộc họp', 1),
    ('Deadline', 'Hạn chót', 2),
    ('Follow up', 'Theo dõi / phản hồi sau', 3),
    ('Minutes', 'Biên bản cuộc họp', 4),
    ('Proposal', 'Đề xuất', 5)
) AS x(front_text, back_text, position) ON TRUE
WHERE fs.title = 'Business Meeting Vocabulary';

-- Seed tests
INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT
  c.teacher_id,
  c.id,
  'English Basics Quiz',
  'Quiz for beginner students',
  15,
  3,
  TRUE,
  TRUE,
  'PUBLISHED',
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '90 days',
  FALSE
FROM courses c
WHERE c.title = 'English for Beginners';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT
  c.teacher_id,
  c.id,
  'IELTS Speaking Concepts Check',
  'Basic understanding before speaking practice',
  20,
  2,
  FALSE,
  TRUE,
  'PUBLISHED',
  NOW() - INTERVAL '20 days',
  NOW() + INTERVAL '60 days',
  FALSE
FROM courses c
WHERE c.title = 'IELTS Speaking Mastery';

INSERT INTO tests (
  teacher_id, course_id, title, description, duration_minutes, max_attempts,
  shuffle_questions, shuffle_choices, status, open_at, close_at, is_deleted
)
SELECT
  c.teacher_id,
  c.id,
  'Daily Conversation Mini Test',
  'Short test on common communication phrases',
  10,
  3,
  TRUE,
  TRUE,
  'PUBLISHED',
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '45 days',
  FALSE
FROM courses c
WHERE c.title = 'Daily English Conversation';

-- Seed test_questions
INSERT INTO test_questions (test_id, question_text, points, position, is_deleted)
SELECT t.id, x.question_text, x.points, x.position, FALSE
FROM tests t
JOIN (
  VALUES
    ('Which word is a greeting?', 1, 1),
    ('Choose the correct article: ___ apple', 1, 2),
    ('Which sentence is correct?', 1, 3)
) AS x(question_text, points, position) ON TRUE
WHERE t.title = 'English Basics Quiz';

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
    ('What do you say when meeting someone for the first time?', 1, 1),
    ('Which phrase is used to ask for help politely?', 1, 2),
    ('What does "See you later" mean?', 1, 3)
) AS x(question_text, points, position) ON TRUE
WHERE t.title = 'Daily Conversation Mini Test';

-- Seed test_choices
INSERT INTO test_choices (question_id, choice_text, is_correct, position, is_deleted)
SELECT q.id, x.choice_text, x.is_correct, x.position, FALSE
FROM test_questions q
JOIN tests t ON t.id = q.test_id
JOIN (
  VALUES
    ('Which word is a greeting?', 'Hello', TRUE, 1),
    ('Which word is a greeting?', 'Table', FALSE, 2),
    ('Which word is a greeting?', 'Apple', FALSE, 3),
    ('Which word is a greeting?', 'Window', FALSE, 4),

    ('Choose the correct article: ___ apple', 'a', FALSE, 1),
    ('Choose the correct article: ___ apple', 'an', TRUE, 2),
    ('Choose the correct article: ___ apple', 'the', FALSE, 3),
    ('Choose the correct article: ___ apple', 'no article', FALSE, 4),

    ('Which sentence is correct?', 'She go to school every day.', FALSE, 1),
    ('Which sentence is correct?', 'She goes to school every day.', TRUE, 2),
    ('Which sentence is correct?', 'She going to school every day.', FALSE, 3),
    ('Which sentence is correct?', 'She gone to school every day.', FALSE, 4)
) AS x(question_text, choice_text, is_correct, position)
  ON x.question_text = q.question_text
WHERE t.title = 'English Basics Quiz';

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
    ('What do you say when meeting someone for the first time?', 'Nice to meet you', TRUE, 1),
    ('What do you say when meeting someone for the first time?', 'Good night', FALSE, 2),
    ('What do you say when meeting someone for the first time?', 'I am sleeping', FALSE, 3),
    ('What do you say when meeting someone for the first time?', 'Close the door', FALSE, 4),

    ('Which phrase is used to ask for help politely?', 'Help me now!', FALSE, 1),
    ('Which phrase is used to ask for help politely?', 'Could you help me?', TRUE, 2),
    ('Which phrase is used to ask for help politely?', 'You must help me.', FALSE, 3),
    ('Which phrase is used to ask for help politely?', 'I order you to help.', FALSE, 4),

    ('What does "See you later" mean?', 'Tôi sẽ gặp bạn sau', TRUE, 1),
    ('What does "See you later" mean?', 'Tôi không biết bạn', FALSE, 2),
    ('What does "See you later" mean?', 'Đi ngủ ngay', FALSE, 3),
    ('What does "See you later" mean?', 'Đóng cửa lại', FALSE, 4)
) AS x(question_text, choice_text, is_correct, position)
  ON x.question_text = q.question_text
WHERE t.title = 'Daily Conversation Mini Test';

-- Seed test_attempts submitted
DO $$
DECLARE
  rec RECORD;
  chosen_student UUID;
  v_started_at TIMESTAMPTZ;
  v_submitted_at TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
BEGIN
  FOR rec IN
    SELECT t.id AS test_id, t.course_id, t.duration_minutes
    FROM tests t
    WHERE t.status = 'PUBLISHED'
  LOOP
    FOR chosen_student IN
      SELECT e.student_id
      FROM enrollments e
      WHERE e.course_id = rec.course_id
      ORDER BY RANDOM()
      LIMIT 12
    LOOP
      v_started_at := NOW() - ((10 + floor(random() * 20))::text || ' days')::interval;
      v_expires_at := v_started_at + ((COALESCE(rec.duration_minutes, 10) * 60)::text || ' seconds')::interval;
      v_submitted_at := v_started_at + ((5 + floor(random() * GREATEST(COALESCE(rec.duration_minutes, 10) - 1, 5)))::text || ' minutes')::interval;

      INSERT INTO test_attempts (
        test_id, student_id, attempt_no, started_at, submitted_at,
        time_limit_seconds, expires_at, auto_submitted, status, score, max_score
      )
      VALUES (
        rec.test_id,
        chosen_student,
        1,
        v_started_at,
        v_submitted_at,
        COALESCE(rec.duration_minutes, 10) * 60,
        v_expires_at,
        FALSE,
        'SUBMITTED',
        NULL,
        NULL
      )
      ON CONFLICT (test_id, student_id, attempt_no) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Seed test_attempt_answers
INSERT INTO test_attempt_answers (attempt_id, question_id, choice_id, is_correct, points_earned)
SELECT
  ta.id,
  q.id,
  chosen.choice_id,
  chosen.is_correct,
  CASE WHEN chosen.is_correct THEN q.points ELSE 0 END
FROM test_attempts ta
JOIN tests t ON t.id = ta.test_id
JOIN test_questions q ON q.test_id = t.id
JOIN LATERAL (
  SELECT tc.id AS choice_id, tc.is_correct
  FROM test_choices tc
  WHERE tc.question_id = q.id
  ORDER BY RANDOM()
  LIMIT 1
) chosen ON TRUE
WHERE ta.status = 'SUBMITTED'
ON CONFLICT (attempt_id, question_id) DO NOTHING;

-- Update score / max_score
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

-- Seed attempt đang làm dở
DO $$
DECLARE
  rec RECORD;
  v_started_at TIMESTAMPTZ;
BEGIN
  FOR rec IN
    SELECT t.id AS test_id, e.student_id, t.duration_minutes
    FROM tests t
    JOIN enrollments e ON e.course_id = t.course_id
    WHERE t.status = 'PUBLISHED'
    ORDER BY RANDOM()
    LIMIT 5
  LOOP
    v_started_at := NOW() - INTERVAL '5 minutes';

    INSERT INTO test_attempts (
      test_id, student_id, attempt_no, started_at, submitted_at,
      time_limit_seconds, expires_at, auto_submitted, status, score, max_score
    )
    VALUES (
      rec.test_id,
      rec.student_id,
      2,
      v_started_at,
      NULL,
      COALESCE(rec.duration_minutes, 10) * 60,
      v_started_at + ((COALESCE(rec.duration_minutes, 10) * 60)::text || ' seconds')::interval,
      FALSE,
      'IN_PROGRESS',
      NULL,
      NULL
    )
    ON CONFLICT (test_id, student_id, attempt_no) DO NOTHING;
  END LOOP;
END $$;

-- Seed otp_codes
INSERT INTO otp_codes (email, code, type, expires_at, used_at, created_at)
VALUES
  ('student1@gmail.com', '123456', 'register', NOW() + INTERVAL '10 minutes', NULL, NOW() - INTERVAL '1 minute'),
  ('student2@gmail.com', '654321', 'forgot_password', NOW() + INTERVAL '8 minutes', NULL, NOW() - INTERVAL '2 minutes'),
  ('teacher1@gmail.com', '111222', 'register', NOW() - INTERVAL '1 minute', NULL, NOW() - INTERVAL '6 minutes'),
  ('teacher2@gmail.com', '333444', 'forgot_password', NOW() + INTERVAL '5 minutes', NOW() - INTERVAL '1 minute', NOW() - INTERVAL '4 minutes'),
  ('newuser@gmail.com', '555666', 'register', NOW() + INTERVAL '15 minutes', NULL, NOW());

-- Seed notifications
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
  s.is_read_value,
  CASE
    WHEN s.is_read_value THEN e.enrolled_at + (random() * INTERVAL '3 days')
    ELSE NULL
  END,
  e.enrolled_at
FROM (
  SELECT
    e.*,
    (random() > 0.5) AS is_read_value
  FROM enrollments e
  ORDER BY e.enrolled_at DESC
  LIMIT 25
) s
JOIN enrollments e ON e.id = s.id
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

-- Query test nhanh
SELECT fs.title AS flashcard_set, COUNT(fc.id) AS total_cards
FROM flashcard_sets fs
LEFT JOIN flashcard_cards fc ON fc.flashcard_set_id = fs.id
GROUP BY fs.id, fs.title
ORDER BY fs.created_at DESC;

SELECT t.title AS test_title, COUNT(q.id) AS total_questions
FROM tests t
LEFT JOIN test_questions q ON q.test_id = t.id
GROUP BY t.id, t.title
ORDER BY t.created_at DESC;

SELECT
  t.title,
  u.email AS student_email,
  ta.attempt_no,
  ta.status,
  ta.score,
  ta.max_score,
  ta.started_at,
  ta.submitted_at,
  ta.expires_at
FROM test_attempts ta
JOIN tests t ON t.id = ta.test_id
JOIN users u ON u.id = ta.student_id
ORDER BY ta.started_at DESC
LIMIT 20;

SELECT
  n.type,
  u.email,
  n.title,
  n.is_read,
  n.created_at
FROM notifications n
JOIN users u ON u.id = n.user_id
ORDER BY n.created_at DESC
LIMIT 20;

SELECT email, code, type, expires_at, used_at, created_at
FROM otp_codes
ORDER BY created_at DESC;

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role varchar(20) not null check (role in ('user', 'assistant')),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  type varchar(50) not null,
  title varchar(255) not null,
  content text not null,
  source varchar(255),
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into public.knowledge_documents (type, title, content, source, tags)
values
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
  'Lộ trình học IELTS cho người mới',
  'Người mới nên bắt đầu từ nền tảng phát âm, từ vựng và ngữ pháp cơ bản, sau đó luyện từng kỹ năng nghe nói đọc viết trước khi luyện đề tổng hợp.',
  'manual',
  ARRAY['ielts', 'lo trinh', 'nguoi moi']
);


insert into public.knowledge_documents (type, title, content, source, tags)
values
(
  'guide',
  'Nên học IELTS hay giao tiếp',
  'Nếu mục tiêu của người học là thi chứng chỉ, đầu ra học tập, du học hoặc cần đo trình độ bằng điểm số thì nên ưu tiên IELTS. Nếu mục tiêu là sử dụng tiếng Anh trong công việc, phỏng vấn, giao tiếp hằng ngày hoặc cải thiện phản xạ nói thì nên ưu tiên giao tiếp. Người học cũng có thể bắt đầu từ giao tiếp nền tảng trước rồi chuyển sang IELTS khi đã có nền cơ bản.',
  'manual',
  ARRAY['ielts', 'giao tiếp', 'nên học', 'so sánh']
);