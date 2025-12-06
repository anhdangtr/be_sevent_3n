// config/email.js
require('dotenv').config(); // Thêm dòng này nếu file này được require sớm
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER?.trim();
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD?.trim();

if (!EMAIL_USER || !EMAIL_PASSWORD) {
  console.warn('[email] EMAIL_USER or EMAIL_PASSWORD is not set. Email sending is disabled.');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Test kết nối khi khởi động
transporter.verify((error, success) => {
  if (error) {
    console.error('Email config error:', error.message);
  } else {
    console.log('Email server is ready to send messages');
  }
});

module.exports = transporter;