// sendMail.js
require("dotenv").config();
const nodemailer = require("nodemailer");

// Gmail transporter (used in all environments)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_NAME,         // Your Gmail address
    pass: process.env.EMAIL_APP_PASSWORD, // App password (required if 2FA is enabled)
  },
});

// Verify SMTP connection
transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP ERROR:", err.response || err);
  } else {
    console.log("SMTP READY (Gmail)");
  }
});

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} content - Email body (can include verification code)
 */
async function sendMail(to, subject, content) {
  try {
    console.log(`Sending email to: ${to}, from: ${process.env.EMAIL_NAME}`);

    const verificationCode = content.match(/\d+/)?.[0] || "";

    const info = await transporter.sendMail({
      from: `"LexGo" <${process.env.EMAIL_NAME}>`,
      to,
      subject,
      text: content,
      html: `
        <div style="font-family: Arial, sans-serif">
          <h2>LexGo Verification</h2>
          <p>Your verification code:</p>
          <h1>${verificationCode}</h1>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    });

    console.log("Email sent successfully:", info.messageId, info.response || "No server response");
    return true;
  } catch (error) {
    console.error("Email sending failed:");
    console.error("Error code:", error.code || "N/A");
    console.error("Response:", error.response || "N/A");
    console.error(error);
    throw error;
  }
}

module.exports = sendMail;
