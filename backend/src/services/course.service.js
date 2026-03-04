const { pool, poolConnect, sql } = require("../config/db");

const getAllCourses = async () => {
  await poolConnect;
  const result = await pool.request().query("SELECT * FROM Courses");
  return result.recordset;
};

const createCourse = async (data) => {
  await poolConnect;

  const result = await pool.request()
    .input("Title", sql.NVarChar, data.Title)
    .input("Description", sql.NVarChar, data.Description)
    .input("Price", sql.Decimal(10,2), data.Price)
    .query(`
      INSERT INTO Courses (Title, Description, Price)
      VALUES (@Title, @Description, @Price)
    `);

  return result;
};

module.exports = {
  getAllCourses,
  createCourse
};