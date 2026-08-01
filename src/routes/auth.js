const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const { requireAuth } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = "12h";

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM admin_users WHERE email = $1",
      [email.toLowerCase()],
    );

    const admin = result.rows[0];

    // Generic error to avoid leaking which part failed
    if (!admin) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      JWT_SECRET,
      { expiresIn: TOKEN_TTL },
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /api/auth/me - verify token and return current admin
router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

module.exports = router;
