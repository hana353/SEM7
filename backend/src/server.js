require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes"); 
const { ensureSchema } = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes); 

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