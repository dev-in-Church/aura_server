require("dotenv").config();
const express = require("express");
const cors = require("cors");

const quotesRouter = require("./routes/quotes");
const contactRouter = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "https://www.auraexpressafricaltd.com",
  "https://aura-express-knjdlv97w-dev-in-churchs-projects.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
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
