const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log('Email config error:', error.message);
  } else {
    console.log('Email server ready');
  }
});

module.exports = transporter;
