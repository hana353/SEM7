require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const userRoutes = require("./routes/user.routes");
const lectureRoutes = require("./routes/lecture.routes");
const flashcardRoutes = require("./routes/flashcard.routes");
const testRoutes = require("./routes/test.routes");
const vocabularyRoutes = require("./routes/vocabulary.routes");
const enrollmentRoutes = require("./routes/enrollment.routes");
const statsRoutes = require("./routes/stats.routes");
const paymentRoutes = require("./routes/payment.routes");
const powerBIRoutes = require("./routes/powerbi.routes");
const speechRoutes = require("./routes/speech.routes");
const notificationRoutes = require("./routes/notification.routes");

process.on("exit", (code) => {
  console.log("Process exit with code:", code);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, message: "root ok" });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, message: "health ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/flashcards", flashcardRoutes);
app.use("/api/tests", testRoutes);
app.use("/api/vocabulary", vocabularyRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/powerbi", powerBIRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/notifications", notificationRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("listening", () => {
  console.log("Listening event fired");
});

server.on("close", () => {
  console.log("Server close event fired");
});

server.on("error", (err) => {
  console.error("Server error:", err);
});