const nodemailer = require("nodemailer");

// Use Brevo in production (Gmail doesn't work reliably on cloud servers)
const transporter = nodemailer.createTransport(
  process.env.NODE_ENV === "production"
    ? {
        // Brevo (Sendinblue) - works on Render/Heroku/etc
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user: process.env.BREVO_EMAIL,
          pass: process.env.BREVO_SMTP_KEY,
        },
      }
    : {
        // Gmail - for local development
        service: "gmail",
        auth: {
          user: process.env.EMAIL_NAME,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
      }
);

async function sendMail(to, subject, content) {
  try {
    const fromEmail =
      process.env.NODE_ENV === "production"
        ? process.env.BREVO_EMAIL
        : process.env.EMAIL_NAME;

    const info = await transporter.sendMail({
      from: `"LexGo" <${fromEmail}>`,
      to: to,
      subject: subject,
      text: content,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email error:", error.message);
    throw error;
  }
}

module.exports = sendMail;
