const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const { requireAuth } = require("../middleware/auth");
const { generateInvoicePdf } = require("../services/pdfService");
const { sendInvoiceToCustomer } = require("../services/emailService");

// All invoice routes require an authenticated admin
router.use(requireAuth);

// Compute totals from line items + tax rate (server-side, never trust client)
function computeTotals(lineItems, taxRate) {
  const items = Array.isArray(lineItems) ? lineItems : [];
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const unit = Number(item.unit_price) || 0;
    return sum + qty * unit;
  }, 0);
  const rate = Number(taxRate) || 0;
  const tax_amount = +(subtotal * (rate / 100)).toFixed(2);
  const total = +(subtotal + tax_amount).toFixed(2);
  return { subtotal: +subtotal.toFixed(2), tax_amount, total };
}

async function generateInvoiceNumber() {
  const result = await pool.query(
    "SELECT nextval('invoice_number_seq') AS seq",
  );
  const seq = String(result.rows[0].seq).padStart(4, "0");
  const year = new Date().getFullYear();
  return `AURA-${year}-${seq}`;
}

// GET /api/invoices - list all invoices
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT * FROM invoices";
    const values = [];
    if (status) {
      query += " WHERE status = $1";
      values.push(status);
    }
    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, values);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Fetch invoices error:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// GET /api/invoices/:id - single invoice
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invoices WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Fetch invoice error:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// POST /api/invoices - create an invoice from a quote
router.post("/", async (req, res) => {
  const {
    quote_id,
    line_items,
    tax_rate = 0,
    currency = "USD",
    notes,
    due_date,
  } = req.body;

  if (!quote_id) {
    return res.status(400).json({ error: "quote_id is required" });
  }
  if (!Array.isArray(line_items) || line_items.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one line item is required" });
  }

  try {
    // Pull the quote to snapshot client + shipment details
    const quoteResult = await pool.query("SELECT * FROM quotes WHERE id = $1", [
      quote_id,
    ]);
    if (quoteResult.rows.length === 0) {
      return res.status(404).json({ error: "Quote not found" });
    }
    const quote = quoteResult.rows[0];

    const { subtotal, tax_amount, total } = computeTotals(line_items, tax_rate);
    const invoice_number = await generateInvoiceNumber();

    const insert = await pool.query(
      `INSERT INTO invoices (
        quote_id, invoice_number,
        client_name, client_email, client_phone, client_company,
        transport_mode, cargo_type, route, origin_country, delivery_country, final_destination,
        currency, line_items, subtotal, tax_rate, tax_amount, total,
        notes, due_date, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING *`,
      [
        quote_id,
        invoice_number,
        quote.full_name,
        quote.email,
        quote.phone,
        quote.company,
        quote.transport_mode,
        quote.cargo_type,
        quote.route,
        quote.origin_country,
        quote.delivery_country,
        quote.final_destination,
        currency,
        JSON.stringify(line_items),
        subtotal,
        tax_rate,
        tax_amount,
        total,
        notes,
        due_date || null,
        req.admin.id,
      ],
    );

    // Mark the quote as invoiced
    await pool.query("UPDATE quotes SET status = 'invoiced' WHERE id = $1", [
      quote_id,
    ]);

    res.status(201).json({ success: true, data: insert.rows[0] });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// PATCH /api/invoices/:id - update invoice (recomputes totals)
router.patch("/:id", async (req, res) => {
  const { line_items, tax_rate, currency, notes, status, due_date } = req.body;
  try {
    const existing = await pool.query("SELECT * FROM invoices WHERE id = $1", [
      req.params.id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const current = existing.rows[0];

    const newLineItems =
      line_items !== undefined ? line_items : current.line_items;
    const newTaxRate = tax_rate !== undefined ? tax_rate : current.tax_rate;
    const { subtotal, tax_amount, total } = computeTotals(
      newLineItems,
      newTaxRate,
    );

    const result = await pool.query(
      `UPDATE invoices SET
        line_items = $1, tax_rate = $2, subtotal = $3, tax_amount = $4, total = $5,
        currency = COALESCE($6, currency),
        notes = COALESCE($7, notes),
        status = COALESCE($8, status),
        due_date = COALESCE($9, due_date)
       WHERE id = $10 RETURNING *`,
      [
        JSON.stringify(newLineItems),
        newTaxRate,
        subtotal,
        tax_amount,
        total,
        currency,
        notes,
        status,
        due_date,
        req.params.id,
      ],
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({ error: "Failed to update invoice" });
  }
});

// GET /api/invoices/:id/pdf - download/preview the PDF
router.get("/:id/pdf", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invoices WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const invoice = result.rows[0];
    const pdf = await generateInvoicePdf(invoice);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${invoice.invoice_number}.pdf"`,
    );
    res.send(pdf);
  } catch (error) {
    console.error("Invoice PDF error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

// POST /api/invoices/:id/send - email the invoice PDF to the client
router.post("/:id/send", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM invoices WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const invoice = result.rows[0];

    const pdf = await generateInvoicePdf(invoice);
    await sendInvoiceToCustomer(invoice, pdf);

    const updated = await pool.query(
      "UPDATE invoices SET status = 'sent', sent_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id],
    );

    res.json({
      success: true,
      message: "Invoice sent to client",
      data: updated.rows[0],
    });
  } catch (error) {
    console.error("Send invoice error:", error);
    res.status(500).json({ error: "Failed to send invoice" });
  }
});

module.exports = router;
