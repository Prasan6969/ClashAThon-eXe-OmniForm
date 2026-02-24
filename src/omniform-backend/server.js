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

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.send("eXe Backend Running 🚀");
});

app.use("/api/orgs", orgRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
