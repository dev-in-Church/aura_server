require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify connection on startup
resend.emails
  .send({
    from: `AURA EXPRESS <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`,
    to: process.env.ADMIN_EMAIL,
    subject: "Test Email - Resend Configuration",
    html: "<p>Test email to verify Resend configuration is working.</p>",
  })
  .then(() => {
    console.log("Resend email service ready");
  })
  .catch((error) => {
    console.log("Resend configuration error:", error.message);
  });

module.exports = resend;
