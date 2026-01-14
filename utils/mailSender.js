// sendMail.js

require("dotenv").config();
const axios = require("axios");

/**
 * Send an email using Brevo API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} content - Email content (plain text or HTML)
 * @param {string} [otp] - Optional verification code
 * @returns {Promise<boolean>}
 */
async function sendMail(to, subject, content, otp = "") {
  try {
    // Construct HTML email with explicit OTP if provided
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">LexGo Verification</h2>
        <p>This is your verification code:</p>
        <h1 style="color: #4A90E2; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p style="color: #777; font-size: 14px;">This code expires in 15 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">${content}</p>
      </div>
    `;

    const emailData = {
      sender: {
        name: "LexGo",
        email: process.env.BREVO_EMAIL, // Must be verified in Brevo
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent,
      textContent: content, // fallback plain text
    };

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", emailData, {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
    });


    return true;
  } catch (error) {
    if (error.response) {
      console.error("Brevo API Error:", error.response.data);
    } else {
      console.error("Brevo API Request Failed:", error.message);
    }
    throw error;
  }
}

module.exports = sendMail;
