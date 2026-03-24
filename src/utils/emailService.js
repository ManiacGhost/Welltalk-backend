require('dotenv').config();
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter using Brevo (Sendinblue) SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP Connection Error:', error.message);
  } else {
    logger.info('✅ SMTP Server connected successfully');
  }
});

/**
 * Send email notification for quote/contact form
 */
const sendContactFormEmail = async (formData) => {
  try {
    const { firstName, lastName, email, phone, message } = formData;

    // Email to admin
    const adminMailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    };

    // Email to user (confirmation)
    const userMailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `We received your message - ${process.env.COMPANY_NAME || 'Welltalk'}`,
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Hi ${firstName},</p>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <hr>
        <h3>Your Message Details:</h3>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Best regards,<br>${process.env.COMPANY_NAME || 'Welltalk'} Team</p>
      `,
    };

    // Send email to admin
    await transporter.sendMail(adminMailOptions);
    logger.info(`✅ Admin email sent for: ${email}`);

    // Send confirmation email to user
    await transporter.sendMail(userMailOptions);
    logger.info(`✅ Confirmation email sent to: ${email}`);

    return true;
  } catch (error) {
    logger.error('❌ Error sending email:', error.message);
    return false;
  }
};

module.exports = {
  sendContactFormEmail,
  transporter,
};
