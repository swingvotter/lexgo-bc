// sendMail.js

require("dotenv").config();
const axios = require("axios");

/**
 * Send an email using Brevo API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} content - Email content (plain text or HTML)
 * @returns {Promise<boolean>}
 */
async function sendMail(to, subject, content) {
  try {
    console.log(`Preparing to send email to: ${to}`);

    // Extract verification code if present
    const verificationCode = content.match(/\d+/)?.[0] || "";

    // Construct HTML email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif">
        <h2>LexGo Verification</h2>
        <p>Your verification code:</p>
        <h1>${verificationCode}</h1>
        <p>This code expires in 15 minutes.</p>
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

    console.log("Email sent successfully via Brevo API:", response.data);
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
