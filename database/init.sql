-- English Center - Auth tables (SQL Server)
-- Chạy script này trên database EnglishCenter

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
  CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(255),
    IsVerified BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
  );
  CREATE INDEX IX_Users_Email ON Users(Email);
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OtpCodes')
BEGIN
  CREATE TABLE OtpCodes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL,
    Code NVARCHAR(10) NOT NULL,
    Type NVARCHAR(50) NOT NULL,  -- 'register', 'login'
    ExpiresAt DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
  );
  CREATE INDEX IX_OtpCodes_Email ON OtpCodes(Email);
  CREATE INDEX IX_OtpCodes_ExpiresAt ON OtpCodes(ExpiresAt);
END

GO
