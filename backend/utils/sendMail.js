const axios = require("axios");

const sendVerificationEmail = async (toEmail, token) => {
  const verifyURL = `${process.env.BACKEND_URL}/api/user/verify-email/${token}`;

  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "Me-2-U", email: process.env.EMAIL_USER },
      to: [{ email: toEmail }],
      subject: "Verify your email - Me-2-U",
      htmlContent: `
        <h2>Welcome to Me-2-U!</h2>
        <p>Click the button below to verify your email:</p>
        <a href="${verifyURL}" 
           style="background:teal; color:white; padding:10px 20px; 
                  border-radius:5px; text-decoration:none;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      `,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );
};

module.exports = sendVerificationEmail;