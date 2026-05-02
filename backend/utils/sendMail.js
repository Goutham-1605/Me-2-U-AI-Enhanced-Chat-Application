const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerificationEmail = async (toEmail, token) => {
  const verifyURL = `http://localhost:5000/api/user/verify-email/${token}`;

  await transporter.sendMail({
    from: `"Me-2-U" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email - Me-2-U",
    html: `
      <h2>Welcome to Me-2-U!</h2>
      <p>Click the button below to verify your email:</p>
      <a href="${verifyURL}" 
         style="background:teal; color:white; padding:10px 20px; 
                border-radius:5px; text-decoration:none;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
    `,
  });
};

module.exports = sendVerificationEmail;