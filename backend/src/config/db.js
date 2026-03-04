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
}

module.exports = { sql, pool, poolConnect, getPool, ensureSchema };