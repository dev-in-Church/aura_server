require("dotenv").config();
const express = require("express");
const cors = require("cors");

const quotesRouter = require("./routes/quotes");
const contactRouter = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins: public site + admin dashboard (comma-separated in ALLOWED_ORIGINS)
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  `${process.env.FRONTEND_URL || "http://localhost:3000"},${process.env.ADMIN_URL || "http://localhost:3001"}`
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no origin) and any whitelisted origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/quotes", quotesRouter);
app.use("/api/contact", contactRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
