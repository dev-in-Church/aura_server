require("dotenv").config();
const { Resend } = require("resend");

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.warn(
    "[email] RESEND_API_KEY is not set - outgoing emails will fail until it is configured.",
  );
}

// Pass a harmless placeholder if the key is missing so the app can still boot;
// actual send calls will surface a clear error instead of crashing on startup.
const resend = new Resend(apiKey || "re_placeholder_key");

module.exports = resend;
