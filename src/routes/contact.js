const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const {
  sendContactNotificationToAdmin,
  sendContactConfirmationToCustomer,
} = require("../services/emailService");

// POST /api/contact - Create new contact message
router.post("/", async (req, res) => {
  const { full_name, email, phone, subject, message } = req.body;

  // Validation
  if (!full_name || !email || !message) {
    return res.status(400).json({
      error: "Missing required fields: full_name, email, message",
    });
  }

  try {
    const query = `
      INSERT INTO contact_messages (full_name, email, phone, subject, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [full_name, email, phone, subject, message];
    const result = await pool.query(query, values);
    const contact = result.rows[0];

    // Send emails (don't block response)
    Promise.all([
      sendContactNotificationToAdmin(contact),
      sendContactConfirmationToCustomer(contact),
    ]).catch((err) => console.error("Email error:", err));

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact creation error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET /api/contact - Get all messages (admin)
router.get("/", async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = "SELECT * FROM contact_messages";
    const values = [];

    if (status) {
      query += " WHERE status = $1";
      values.push(status);
    }

    query +=
      " ORDER BY created_at DESC LIMIT $" +
      (values.length + 1) +
      " OFFSET $" +
      (values.length + 2);
    values.push(limit, offset);

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// PATCH /api/contact/:id - Update message status (admin)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const result = await pool.query(
      "UPDATE contact_messages SET status = COALESCE($1, status), admin_notes = COALESCE($2, admin_notes) WHERE id = $3 RETURNING *",
      [status, admin_notes, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update message error:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

module.exports = router;
