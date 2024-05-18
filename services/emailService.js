const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  // Configure your email service provider here
  // For example, using Gmail SMTP:
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password',
  },
});

exports.sendEmail = async (to, subject, body) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to,
    subject,
    text: body,
  };

  return transporter.sendMail(mailOptions);
};