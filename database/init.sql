USE master
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'SEM7')
BEGIN
ALTER DATABASE SEM7 SET SINGLE_USER WITH ROLLBACK IMMEDIATE
DROP DATABASE SEM7
END
GO

CREATE DATABASE SEM7
GO

USE SEM7
GO

/* =========================================================
ROLES
========================================================= */

CREATE TABLE roles(
id SMALLINT PRIMARY KEY,
code NVARCHAR(30) UNIQUE NOT NULL,
description NVARCHAR(255)
)

INSERT INTO roles VALUES
(1,'ADMIN','System admin'),
(2,'TEACHER','Course creator'),
(3,'STUDENT','Learner'),
(4,'GUEST','Guest')

/* =========================================================
USERS
========================================================= */

CREATE TABLE users(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
email NVARCHAR(255) UNIQUE NOT NULL,
password_hash NVARCHAR(255) NOT NULL,
full_name NVARCHAR(255) NOT NULL,
phone NVARCHAR(20),

role_id SMALLINT REFERENCES roles(id),

is_verified BIT DEFAULT 0,
is_active BIT DEFAULT 1,
is_deleted BIT DEFAULT 0,

created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
updated_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
)

INSERT INTO users(email,password_hash,full_name,role_id,is_verified) VALUES
('admin@gmail.com','$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG','System Admin',1,1),
('teacher1@gmail.com','$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG','John Smith',2,1),
('teacher2@gmail.com','$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG','Emma Brown',2,1),
('student1@gmail.com','$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG','Nguyen Van A',3,1),
('student2@gmail.com','$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG','Tran Thi B',3,1),
('student3@gmail.com','$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG','Le Van C',3,1)

/* =========================================================
COURSES
========================================================= */

CREATE TABLE courses(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
teacher_id UNIQUEIDENTIFIER REFERENCES users(id),

title NVARCHAR(255),
description NVARCHAR(MAX),
price DECIMAL(10,2),

total_duration_minutes INT,
status NVARCHAR(20) DEFAULT 'PUBLISHED',

created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
)

INSERT INTO courses(teacher_id,title,description,price,total_duration_minutes)
SELECT id,'English for Beginners','Basic communication course',0,120
FROM users WHERE email='teacher1@gmail.com'

INSERT INTO courses(teacher_id,title,description,price,total_duration_minutes)
SELECT id,'IELTS Speaking Mastery','Improve speaking band score',199000,180
FROM users WHERE email='teacher2@gmail.com'

INSERT INTO courses(teacher_id,title,description,price,total_duration_minutes)
SELECT id,'Daily English Conversation','Learn real life conversation',99000,150
FROM users WHERE email='teacher1@gmail.com'

/* =========================================================
LECTURES
========================================================= */

CREATE TABLE lectures(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
course_id UNIQUEIDENTIFIER REFERENCES courses(id) ON DELETE CASCADE,
title NVARCHAR(255),
video_url NVARCHAR(500),
duration_minutes INT,
order_index INT
)

INSERT INTO lectures(course_id,title,video_url,duration_minutes,order_index)
SELECT id,'Alphabet','youtube.com/video1',10,1
FROM courses WHERE title='English for Beginners'

INSERT INTO lectures(course_id,title,video_url,duration_minutes,order_index)
SELECT id,'Basic Greetings','youtube.com/video2',12,2
FROM courses WHERE title='English for Beginners'

INSERT INTO lectures(course_id,title,video_url,duration_minutes,order_index)
SELECT id,'Introduce Yourself','youtube.com/video3',15,3
FROM courses WHERE title='English for Beginners'

/* =========================================================
ENROLLMENTS
========================================================= */

CREATE TABLE enrollments(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
student_id UNIQUEIDENTIFIER REFERENCES users(id),
course_id UNIQUEIDENTIFIER REFERENCES courses(id),
progress_percent DECIMAL(5,2) DEFAULT 0,
enrolled_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
)

INSERT INTO enrollments(student_id,course_id)
SELECT u.id,c.id
FROM users u,courses c
WHERE u.email='student1@gmail.com'
AND c.title='English for Beginners'

INSERT INTO enrollments(student_id,course_id)
SELECT u.id,c.id
FROM users u,courses c
WHERE u.email='student2@gmail.com'
AND c.title='English for Beginners'

/* =========================================================
QUIZ
========================================================= */

CREATE TABLE quiz_sets(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
teacher_id UNIQUEIDENTIFIER REFERENCES users(id),
course_id UNIQUEIDENTIFIER REFERENCES courses(id),
title NVARCHAR(255),
status NVARCHAR(20)
)

INSERT INTO quiz_sets(teacher_id,course_id,title,status)
SELECT u.id,c.id,'Basic Vocabulary','PUBLISHED'
FROM users u,courses c
WHERE u.email='teacher1@gmail.com'
AND c.title='English for Beginners'

CREATE TABLE quiz_cards(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
quiz_set_id UNIQUEIDENTIFIER REFERENCES quiz_sets(id),
front_text NVARCHAR(MAX),
back_text NVARCHAR(MAX),
position INT
)

INSERT INTO quiz_cards(quiz_set_id,front_text,back_text,position)
SELECT id,'Hello','Xin chào',1
FROM quiz_sets WHERE title='Basic Vocabulary'

INSERT INTO quiz_cards(quiz_set_id,front_text,back_text,position)
SELECT id,'Thank you','Cảm ơn',2
FROM quiz_sets WHERE title='Basic Vocabulary'

/* =========================================================
TEST
========================================================= */

CREATE TABLE tests(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
teacher_id UNIQUEIDENTIFIER REFERENCES users(id),
course_id UNIQUEIDENTIFIER REFERENCES courses(id),
title NVARCHAR(255),
duration_minutes INT,
status NVARCHAR(20)
)

INSERT INTO tests(teacher_id,course_id,title,duration_minutes,status)
SELECT u.id,c.id,'Basic English Test',15,'PUBLISHED'
FROM users u,courses c
WHERE u.email='teacher1@gmail.com'
AND c.title='English for Beginners'

CREATE TABLE test_questions(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
test_id UNIQUEIDENTIFIER REFERENCES tests(id),
question_text NVARCHAR(MAX),
points INT
)

INSERT INTO test_questions(test_id,question_text,points)
SELECT id,'What does Hello mean?',1
FROM tests WHERE title='Basic English Test'

CREATE TABLE test_choices(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
question_id UNIQUEIDENTIFIER REFERENCES test_questions(id),
choice_text NVARCHAR(255),
is_correct BIT
)

INSERT INTO test_choices(question_id,choice_text,is_correct)
SELECT id,'Xin chào',1
FROM test_questions WHERE question_text='What does Hello mean?'

INSERT INTO test_choices(question_id,choice_text,is_correct)
SELECT id,'Tạm biệt',0
FROM test_questions WHERE question_text='What does Hello mean?'

/* =========================================================
VOCABULARY
========================================================= */

CREATE TABLE vocabulary_topics(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
title NVARCHAR(255)
)

INSERT INTO vocabulary_topics VALUES
(NEWID(),'Food'),
(NEWID(),'Travel'),
(NEWID(),'Daily Conversation')

CREATE TABLE vocabularies(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
topic_id UNIQUEIDENTIFIER REFERENCES vocabulary_topics(id),
word NVARCHAR(255),
meaning NVARCHAR(MAX),
example_sentence NVARCHAR(MAX)
)

INSERT INTO vocabularies(topic_id,word,meaning,example_sentence)
SELECT id,'apple','quả táo','I eat an apple everyday'
FROM vocabulary_topics WHERE title='Food'

INSERT INTO vocabularies(topic_id,word,meaning,example_sentence)
SELECT id,'airport','sân bay','The airport is crowded'
FROM vocabulary_topics WHERE title='Travel'

/* =========================================================
PRONUNCIATION
========================================================= */

CREATE TABLE pronunciation_practice(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
student_id UNIQUEIDENTIFIER REFERENCES users(id),
vocabulary_id UNIQUEIDENTIFIER REFERENCES vocabularies(id),
spoken_text NVARCHAR(MAX),
accuracy_percent DECIMAL(5,2),
practiced_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
)

/* =========================================================
PAYMENTS
========================================================= */

CREATE TABLE payments(
id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
student_id UNIQUEIDENTIFIER REFERENCES users(id),
course_id UNIQUEIDENTIFIER REFERENCES courses(id),
enrollment_id UNIQUEIDENTIFIER REFERENCES enrollments(id),
amount DECIMAL(10,2),
status NVARCHAR(20),
created_at DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET()
)

ALTER TABLE payments ADD payment_method NVARCHAR(30)
ALTER TABLE payments ADD txn_ref NVARCHAR(100)
ALTER TABLE payments ADD order_info NVARCHAR(255)

/* =========================================================
ADD MORE COURSES
========================================================= */

INSERT INTO courses(teacher_id,title,description,price,total_duration_minutes)
SELECT id,'Business English','English for workplace communication',299000,200
FROM users WHERE email='teacher2@gmail.com'

INSERT INTO courses(teacher_id,title,description,price,total_duration_minutes)
SELECT id,'IELTS Writing Task 2','Essay writing strategies',249000,160
FROM users WHERE email='teacher2@gmail.com'

INSERT INTO courses(teacher_id,title,description,price,total_duration_minutes)
SELECT id,'English Pronunciation Mastery','Improve pronunciation',149000,140
FROM users WHERE email='teacher1@gmail.com'


/* =========================================================
ADD MANY STUDENTS
========================================================= */

DECLARE @i INT = 1

WHILE @i <= 30
BEGIN

INSERT INTO users(
email,
password_hash,
full_name,
role_id,
is_verified
)
VALUES(
'student_auto'+CAST(@i AS NVARCHAR)+'@gmail.com',
'$2b$10$BbqsiLMnJ7EXqcD23EFoC.E9FqOmkn0wlJKgwjNdMUy6OrF2EhnNG',
'Student Auto '+CAST(@i AS NVARCHAR),
3,
1
)

SET @i = @i + 1

END


/* =========================================================
GENERATE MANY ENROLLMENTS
========================================================= */

DECLARE @count INT = 1

WHILE @count <= 150
BEGIN

DECLARE @student UNIQUEIDENTIFIER
DECLARE @course UNIQUEIDENTIFIER

SELECT TOP 1 @student = id
FROM users
WHERE role_id = 3
ORDER BY NEWID()

SELECT TOP 1 @course = id
FROM courses
ORDER BY NEWID()

INSERT INTO enrollments(
student_id,
course_id,
progress_percent,
enrolled_at
)
VALUES(
@student,
@course,
ABS(CHECKSUM(NEWID())) % 100,
DATEADD(day,-ABS(CHECKSUM(NEWID())) % 120,GETDATE())
)

SET @count = @count + 1

END


/* =========================================================
GENERATE PAYMENTS
========================================================= */

DECLARE @pay INT = 1

WHILE @pay <= 200
BEGIN

DECLARE @enrollment UNIQUEIDENTIFIER
DECLARE @studentP UNIQUEIDENTIFIER
DECLARE @courseP UNIQUEIDENTIFIER
DECLARE @price DECIMAL(10,2)

SELECT TOP 1
@enrollment = e.id,
@studentP = e.student_id,
@courseP = e.course_id
FROM enrollments e
ORDER BY NEWID()

SELECT @price = price
FROM courses
WHERE id = @courseP

INSERT INTO payments(
student_id,
course_id,
enrollment_id,
amount,
status,
created_at
)
VALUES(
@studentP,
@courseP,
@enrollment,
@price,
CASE 
WHEN RAND(CHECKSUM(NEWID())) > 0.1 THEN 'SUCCESS'
ELSE 'FAILED'
END,
DATEADD(day,-ABS(CHECKSUM(NEWID())) % 120,GETDATE())
)

SET @pay = @pay + 1

END


/* =========================================================
PRONUNCIATION PRACTICE DATA
========================================================= */

DECLARE @p INT = 1

WHILE @p <= 120
BEGIN

DECLARE @studentPr UNIQUEIDENTIFIER
DECLARE @vocab UNIQUEIDENTIFIER

SELECT TOP 1 @studentPr = id
FROM users
WHERE role_id = 3
ORDER BY NEWID()

SELECT TOP 1 @vocab = id
FROM vocabularies
ORDER BY NEWID()

INSERT INTO pronunciation_practice(
student_id,
vocabulary_id,
spoken_text,
accuracy_percent,
practiced_at
)
VALUES(
@studentPr,
@vocab,
'Sample pronunciation',
60 + ABS(CHECKSUM(NEWID())) % 40,
DATEADD(day,-ABS(CHECKSUM(NEWID())) % 60,GETDATE())
)

SET @p = @p + 1

END