const PDFDocument = require("pdfkit");

const BLUE = "#0068d7";
const DARK = "#1a1a1a";
const GRAY = "#666666";

function money(amount, currency) {
  const n = Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency || "USD"} ${n}`;
}

/**
 * Generate an invoice PDF and resolve with a Buffer.
 * @param {object} invoice - invoice row (with line_items array)
 * @returns {Promise<Buffer>}
 */
function generateInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const currency = invoice.currency || "USD";

      // Header band
      doc.rect(0, 0, doc.page.width, 90).fill(BLUE);
      doc
        .fillColor("white")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("AURA EXPRESS AFRICA LTD", 50, 30);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Delivering Excellence  |  Majengo, Mombasa, Kenya", 50, 60);

      doc.moveDown(3);

      // Invoice title + meta
      doc
        .fillColor(DARK)
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("INVOICE", 50, 115);

      doc.fontSize(10).font("Helvetica").fillColor(GRAY);
      const metaTop = 115;
      doc.text(`Invoice #: ${invoice.invoice_number}`, 300, metaTop, {
        align: "right",
      });
      doc.text(
        `Issue Date: ${formatDate(invoice.issue_date)}`,
        300,
        metaTop + 15,
        { align: "right" },
      );
      if (invoice.due_date) {
        doc.text(
          `Due Date: ${formatDate(invoice.due_date)}`,
          300,
          metaTop + 30,
          { align: "right" },
        );
      }
      doc.text(
        `Status: ${(invoice.status || "draft").toUpperCase()}`,
        300,
        metaTop + 45,
        { align: "right" },
      );

      // Bill to
      let y = 165;
      doc
        .fillColor(DARK)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Bill To:", 50, y);
      doc.fontSize(10).font("Helvetica").fillColor(GRAY);
      y += 18;
      doc.text(invoice.client_name, 50, y);
      if (invoice.client_company) {
        y += 14;
        doc.text(invoice.client_company, 50, y);
      }
      y += 14;
      doc.text(invoice.client_email, 50, y);
      if (invoice.client_phone) {
        y += 14;
        doc.text(invoice.client_phone, 50, y);
      }

      // Shipment summary
      let sy = 165;
      doc
        .fillColor(DARK)
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("Shipment", 320, sy);
      doc.fontSize(10).font("Helvetica").fillColor(GRAY);
      sy += 18;
      if (invoice.transport_mode) {
        doc.text(`Mode: ${invoice.transport_mode}`, 320, sy);
        sy += 14;
      }
      if (invoice.cargo_type) {
        doc.text(`Cargo: ${invoice.cargo_type}`, 320, sy);
        sy += 14;
      }
      if (invoice.route) {
        doc.text(`Route: ${invoice.route}`, 320, sy);
        sy += 14;
      }
      if (invoice.final_destination) {
        doc.text(`Destination: ${invoice.final_destination}`, 320, sy);
        sy += 14;
      }

      // Table header
      let tableTop = Math.max(y, sy) + 30;
      doc.rect(50, tableTop, doc.page.width - 100, 24).fill(DARK);
      doc.fillColor("white").fontSize(10).font("Helvetica-Bold");
      doc.text("Description", 60, tableTop + 7);
      doc.text("Qty", 320, tableTop + 7, { width: 50, align: "right" });
      doc.text("Unit Price", 380, tableTop + 7, { width: 80, align: "right" });
      doc.text("Amount", 470, tableTop + 7, { width: 75, align: "right" });

      // Table rows
      let rowY = tableTop + 24;
      doc.font("Helvetica").fillColor(DARK);
      const items = Array.isArray(invoice.line_items) ? invoice.line_items : [];

      items.forEach((item, i) => {
        const qty = Number(item.quantity || 0);
        const unit = Number(item.unit_price || 0);
        const amount = qty * unit;

        if (i % 2 === 1) {
          doc.rect(50, rowY, doc.page.width - 100, 22).fill("#f5f5f5");
          doc.fillColor(DARK);
        }
        doc.fontSize(10).font("Helvetica");
        doc.text(item.description || "-", 60, rowY + 6, { width: 250 });
        doc.text(String(qty), 320, rowY + 6, { width: 50, align: "right" });
        doc.text(money(unit, currency), 380, rowY + 6, {
          width: 80,
          align: "right",
        });
        doc.text(money(amount, currency), 470, rowY + 6, {
          width: 75,
          align: "right",
        });
        doc.fillColor(DARK);
        rowY += 22;
      });

      // Totals
      rowY += 10;
      const labelX = 380;
      const valX = 470;
      doc.fontSize(10).font("Helvetica").fillColor(GRAY);
      doc.text("Subtotal:", labelX, rowY, { width: 80, align: "right" });
      doc.fillColor(DARK).text(money(invoice.subtotal, currency), valX, rowY, {
        width: 75,
        align: "right",
      });
      rowY += 16;
      doc
        .fillColor(GRAY)
        .text(`Tax (${Number(invoice.tax_rate || 0)}%):`, labelX, rowY, {
          width: 80,
          align: "right",
        });
      doc
        .fillColor(DARK)
        .text(money(invoice.tax_amount, currency), valX, rowY, {
          width: 75,
          align: "right",
        });
      rowY += 20;
      doc.rect(labelX - 10, rowY - 4, 175, 24).fill(BLUE);
      doc.fillColor("white").font("Helvetica-Bold").fontSize(11);
      doc.text("TOTAL:", labelX, rowY + 2, { width: 80, align: "right" });
      doc.text(money(invoice.total, currency), valX, rowY + 2, {
        width: 75,
        align: "right",
      });

      // Notes
      if (invoice.notes) {
        rowY += 50;
        doc
          .fillColor(DARK)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text("Notes:", 50, rowY);
        doc
          .font("Helvetica")
          .fillColor(GRAY)
          .text(invoice.notes, 50, rowY + 14, { width: 400 });
      }

      // Footer
      const footerY = doc.page.height - 70;
      doc
        .fillColor(GRAY)
        .fontSize(9)
        .font("Helvetica")
        .text("Thank you for choosing AURA EXPRESS AFRICA LTD.", 50, footerY, {
          align: "center",
          width: doc.page.width - 100,
        });
      doc.text(
        "Road Freight  |  Sea Freight  |  Air Freight  |  Heavy Haulage",
        50,
        footerY + 14,
        { align: "center", width: doc.page.width - 100 },
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function formatDate(d) {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

module.exports = { generateInvoicePdf };
