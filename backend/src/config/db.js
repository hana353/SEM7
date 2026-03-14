// src/config/db.js
const sql = require("mssql");

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER, // ví dụ: "localhost"
  database: process.env.DB_NAME, // "SEM7"
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on("error", (err) => {
  console.error("SQL Pool Error:", err);
});

async function getPool() {
  await poolConnect;
  return pool;
}

async function ensureSchema() {
  await poolConnect;

  // Ensure users.is_verified exists (OTP flow)
  await pool.request().query(`
    IF COL_LENGTH('users', 'is_verified') IS NULL
    BEGIN
      ALTER TABLE users
      ADD is_verified BIT NOT NULL CONSTRAINT DF_users_is_verified DEFAULT 0;
    END
  `);

  // Ensure otp_codes table exists
  await pool.request().query(`
    IF OBJECT_ID('otp_codes', 'U') IS NULL
    BEGIN
      CREATE TABLE otp_codes (
        id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        email NVARCHAR(255) NOT NULL,
        code NVARCHAR(10) NOT NULL,
        type NVARCHAR(20) NOT NULL,
        expires_at DATETIME2 NOT NULL,
        used_at DATETIME2 NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_otp_codes_created_at DEFAULT SYSUTCDATETIME()
      );

      CREATE INDEX IX_otp_codes_email_type_created
      ON otp_codes(email, type, created_at DESC);
    END
  `);

  // Ensure quiz_sets has extended columns
  await pool.request().query(`
    IF COL_LENGTH('quiz_sets', 'description') IS NULL
    BEGIN
      ALTER TABLE quiz_sets ADD description NVARCHAR(MAX) NULL;
    END;

    IF COL_LENGTH('quiz_sets', 'is_deleted') IS NULL
    BEGIN
      ALTER TABLE quiz_sets ADD is_deleted BIT NOT NULL CONSTRAINT DF_quiz_sets_is_deleted DEFAULT 0;
    END;

    IF COL_LENGTH('quiz_sets', 'created_at') IS NULL
    BEGIN
      ALTER TABLE quiz_sets ADD created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_sets_created_at DEFAULT SYSDATETIMEOFFSET();
    END;

    IF COL_LENGTH('quiz_sets', 'updated_at') IS NULL
    BEGIN
      ALTER TABLE quiz_sets ADD updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_sets_updated_at DEFAULT SYSDATETIMEOFFSET();
    END;
  `);

  // Ensure quiz_cards has extended columns
  await pool.request().query(`
    IF COL_LENGTH('quiz_cards', 'front_image_url') IS NULL
    BEGIN
      ALTER TABLE quiz_cards ADD front_image_url NVARCHAR(500) NULL;
    END;

    IF COL_LENGTH('quiz_cards', 'back_image_url') IS NULL
    BEGIN
      ALTER TABLE quiz_cards ADD back_image_url NVARCHAR(500) NULL;
    END;

    IF COL_LENGTH('quiz_cards', 'is_deleted') IS NULL
    BEGIN
      ALTER TABLE quiz_cards ADD is_deleted BIT NOT NULL CONSTRAINT DF_quiz_cards_is_deleted DEFAULT 0;
    END;

    IF COL_LENGTH('quiz_cards', 'created_at') IS NULL
    BEGIN
      ALTER TABLE quiz_cards ADD created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_cards_created_at DEFAULT SYSDATETIMEOFFSET();
    END;

    IF COL_LENGTH('quiz_cards', 'updated_at') IS NULL
    BEGIN
      ALTER TABLE quiz_cards ADD updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_quiz_cards_updated_at DEFAULT SYSDATETIMEOFFSET();
    END;
  `);

  // Ensure tests and related tables have extended columns used by services
  await pool.request().query(`
    IF COL_LENGTH('tests', 'description') IS NULL
    BEGIN
      ALTER TABLE tests ADD description NVARCHAR(MAX) NULL;
    END;

    IF COL_LENGTH('tests', 'max_attempts') IS NULL
    BEGIN
      ALTER TABLE tests ADD max_attempts INT NULL;
    END;

    IF COL_LENGTH('tests', 'shuffle_questions') IS NULL
    BEGIN
      ALTER TABLE tests ADD shuffle_questions BIT NOT NULL CONSTRAINT DF_tests_shuffle_questions DEFAULT 0;
    END;

    IF COL_LENGTH('tests', 'shuffle_choices') IS NULL
    BEGIN
      ALTER TABLE tests ADD shuffle_choices BIT NOT NULL CONSTRAINT DF_tests_shuffle_choices DEFAULT 0;
    END;

    IF COL_LENGTH('tests', 'open_at') IS NULL
    BEGIN
      ALTER TABLE tests ADD open_at DATETIMEOFFSET NULL;
    END;

    IF COL_LENGTH('tests', 'close_at') IS NULL
    BEGIN
      ALTER TABLE tests ADD close_at DATETIMEOFFSET NULL;
    END;

    IF COL_LENGTH('tests', 'is_deleted') IS NULL
    BEGIN
      ALTER TABLE tests ADD is_deleted BIT NOT NULL CONSTRAINT DF_tests_is_deleted DEFAULT 0;
    END;

    IF COL_LENGTH('tests', 'created_at') IS NULL
    BEGIN
      ALTER TABLE tests ADD created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_tests_created_at DEFAULT SYSDATETIMEOFFSET();
    END;

    IF COL_LENGTH('tests', 'updated_at') IS NULL
    BEGIN
      ALTER TABLE tests ADD updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_tests_updated_at DEFAULT SYSDATETIMEOFFSET();
    END;
  `);

  await pool.request().query(`
    IF COL_LENGTH('test_questions', 'position') IS NULL
    BEGIN
      ALTER TABLE test_questions ADD position INT NULL;
    END;

    IF COL_LENGTH('test_questions', 'is_deleted') IS NULL
    BEGIN
      ALTER TABLE test_questions ADD is_deleted BIT NOT NULL CONSTRAINT DF_test_questions_is_deleted DEFAULT 0;
    END;

    IF COL_LENGTH('test_questions', 'created_at') IS NULL
    BEGIN
      ALTER TABLE test_questions ADD created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_test_questions_created_at DEFAULT SYSDATETIMEOFFSET();
    END;

    IF COL_LENGTH('test_questions', 'updated_at') IS NULL
    BEGIN
      ALTER TABLE test_questions ADD updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_test_questions_updated_at DEFAULT SYSDATETIMEOFFSET();
    END;
  `);

  await pool.request().query(`
    IF COL_LENGTH('test_choices', 'position') IS NULL
    BEGIN
      ALTER TABLE test_choices ADD position INT NULL;
    END;

    IF COL_LENGTH('test_choices', 'is_deleted') IS NULL
    BEGIN
      ALTER TABLE test_choices ADD is_deleted BIT NOT NULL CONSTRAINT DF_test_choices_is_deleted DEFAULT 0;
    END;
  `);

  // Ensure payments table has required columns for VNPay integration
  await pool.request().query(`
    IF COL_LENGTH('payments', 'payment_method') IS NULL
    BEGIN
      ALTER TABLE payments ADD payment_method NVARCHAR(30) NULL;
    END;

    IF COL_LENGTH('payments', 'txn_ref') IS NULL
    BEGIN
      ALTER TABLE payments ADD txn_ref NVARCHAR(100) NULL;
    END;

    IF COL_LENGTH('payments', 'order_info') IS NULL
    BEGIN
      ALTER TABLE payments ADD order_info NVARCHAR(255) NULL;
    END;

    IF COL_LENGTH('payments', 'vnp_transaction_no') IS NULL
    BEGIN
      ALTER TABLE payments ADD vnp_transaction_no NVARCHAR(50) NULL;
    END;

    IF COL_LENGTH('payments', 'bank_code') IS NULL
    BEGIN
      ALTER TABLE payments ADD bank_code NVARCHAR(50) NULL;
    END;

    IF COL_LENGTH('payments', 'bank_tran_no') IS NULL
    BEGIN
      ALTER TABLE payments ADD bank_tran_no NVARCHAR(100) NULL;
    END;

    IF COL_LENGTH('payments', 'card_type') IS NULL
    BEGIN
      ALTER TABLE payments ADD card_type NVARCHAR(50) NULL;
    END;

    IF COL_LENGTH('payments', 'response_code') IS NULL
    BEGIN
      ALTER TABLE payments ADD response_code NVARCHAR(10) NULL;
    END;

    IF COL_LENGTH('payments', 'transaction_status') IS NULL
    BEGIN
      ALTER TABLE payments ADD transaction_status NVARCHAR(10) NULL;
    END;

    IF COL_LENGTH('payments', 'pay_date') IS NULL
    BEGIN
      ALTER TABLE payments ADD pay_date DATETIMEOFFSET NULL;
    END;

    IF COL_LENGTH('payments', 'gateway_response') IS NULL
    BEGIN
      ALTER TABLE payments ADD gateway_response NVARCHAR(MAX) NULL;
    END;
  `);
}

module.exports = { sql, pool, poolConnect, getPool, ensureSchema };