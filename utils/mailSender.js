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

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP ERROR:", err);
  } else {
    console.log("SMTP READY");
  }
});

async function sendMail(to, subject, content) {
  try {
    const fromEmail =
      process.env.NODE_ENV === "production"
        ? process.env.BREVO_EMAIL
        : process.env.EMAIL_NAME;

    console.log(`Sending email to: ${to}, from: ${fromEmail}, env: ${process.env.NODE_ENV}`);

    const info = await transporter.sendMail({
      from: `"LexGo" <${fromEmail}>`,
      to: to,
      subject: subject,
      text: content,
      html: `
    <div style="font-family: Arial, sans-serif">
      <h2>LexGo Verification</h2>
      <p>Your verification code:</p>
      <h1>${content.match(/\d+/)?.[0]}</h1>
      <p>This code expires in 15 minutes.</p>
    </div>
    `
    });

    console.log("Email sent successfully:", info.messageId, info.response);
    return true;
  } catch (error) {
    console.error("Email error:", error.message, error);
    throw error;
  }
}

module.exports = sendMail;
