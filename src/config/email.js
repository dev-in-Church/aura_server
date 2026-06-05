const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error(error);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
  } else {
    console.log("Email server ready");
  }
});

module.exports = transporter;
