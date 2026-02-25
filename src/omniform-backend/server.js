const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const { clerkMiddleware } = require("@clerk/express");
const connectDB = require("./config/db");
const orgRoutes = require("./routes/orgs");
const adminRoutes = require("./routes/admin");
const submissionRoutes = require("./routes/submissions");
const profileRoutes = require("./routes/profile");
const uploadRoutes = require("./routes/uploads");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
connectDB();

const app = express();

const allowedOrigins = [
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("eXe Backend Running 🚀");
});

app.use("/api/orgs", orgRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/uploads", uploadRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
