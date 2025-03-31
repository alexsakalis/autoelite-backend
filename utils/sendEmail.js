const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html = null) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // must be false for TLS
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS  
    },
    tls: {
      ciphers: "SSLv3"
    }
  });

  const mailOptions = {
    from: `"Autoelite" <no-reply@autoelite.ca>`,  
    to,
    subject,
    text,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;