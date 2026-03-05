require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const userRoutes = require("./routes/user.routes");
const quizRoutes = require("./routes/quiz.routes");
const testRoutes = require("./routes/test.routes");
const lectureRoutes = require("./routes/lecture.routes");
const vocabularyRoutes = require("./routes/vocabulary.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const statsRoutes = require("./routes/stats.routes");
const paymentRoutes = require("./routes/payment.routes");
const { ensureSchema } = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to initialize database schema:", err);
    process.exit(1);
  }
})();