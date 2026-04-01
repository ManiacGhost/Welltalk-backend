const Newsletter = require('../models/Newsletter');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Subscribe to newsletter
 * POST /api/v1/newsletter/subscribe
 */
const subscribeNewsletter = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, firstName, lastName, preferences } = req.body;

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ where: { email } });
    
    if (existingSubscriber) {
      // If unsubscribed, reactivate
      if (existingSubscriber.status === 'unsubscribed') {
        existingSubscriber.status = 'subscribed';
        existingSubscriber.isActive = true;
        existingSubscriber.unsubscribeDate = null;
        existingSubscriber.unsubscribeReason = null;
        await existingSubscriber.save();
        
        logger.info(`Newsletter: ${email} resubscribed`);
        
        return res.status(200).json({
          success: true,
          data: existingSubscriber,
          message: 'Welcome back! You\'ve been resubscribed to our newsletter',
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Email is already subscribed to our newsletter',
      });
    }

    // Create new subscriber
    const subscriber = await Newsletter.create({
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      preferences: preferences || {
        frequency: 'weekly',
        categories: [],
      },
      metadata: {
        source: 'website',
        subscriptionIp: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    logger.info(`Newsletter: New subscriber - ${email}`);

    // Send welcome email
    await sendWelcomeEmail(subscriber);

    res.status(201).json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to newsletter. Check your email for confirmation.',
    });
  } catch (error) {
    logger.error('Error subscribing to newsletter:', error);
    
    // Handle duplicate key error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error subscribing to newsletter',
      error: error.message,
    });
  }
};

/**
 * Unsubscribe from newsletter
 * PUT /api/v1/newsletter/unsubscribe/:email
 */
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.params;
    const { reason } = req.body;

    const subscriber = await Newsletter.findOne({ where: { email } });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
    }

    subscriber.status = 'unsubscribed';
    subscriber.isActive = false;
    subscriber.unsubscribeDate = new Date();
    subscriber.unsubscribeReason = reason || null;
    await subscriber.save();

    logger.info(`Newsletter: ${email} unsubscribed`);

    res.status(200).json({
      success: true,
      data: subscriber,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    logger.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error unsubscribing from newsletter',
      error: error.message,
    });
  }
};

/**
 * Get all subscribers
 * GET /api/v1/newsletter/subscribers
 */
const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'subscribed' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows: subscribers } = await Newsletter.findAndCountAll({
      where,
      order: [['subscriptionDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: subscribers,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
      message: 'Subscribers fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching subscribers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscribers',
      error: error.message,
    });
  }
};

/**
 * Get single subscriber
 * GET /api/v1/newsletter/subscriber/:email
 */
const getSubscriber = async (req, res) => {
  try {
    const { email } = req.params;

    const subscriber = await Newsletter.findOne({ where: { email } });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
    }

    res.status(200).json({
      success: true,
      data: subscriber,
      message: 'Subscriber fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching subscriber:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriber',
      error: error.message,
    });
  }
};

/**
 * Send newsletter to all subscribers
 * POST /api/v1/newsletter/send
 */
const sendNewsletter = async (req, res) => {
  try {
    const { subject, htmlContent, textContent, categories } = req.body;

    // Validate required fields
    if (!subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Subject and htmlContent are required',
      });
    }

    // Get active subscribers
    const where = {
      status: 'subscribed',
      isActive: true,
    };

    const subscribers = await Newsletter.findAll({ where });

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active subscribers found',
      });
    }

    // Send emails in batches to avoid rate limiting
    const batchSize = 50;
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);

      const emailPromises = batch.map(async (subscriber) => {
        try {
          const mailOptions = {
            from: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
            to: subscriber.email,
            subject,
            html: htmlContent,
            text: textContent,
            headers: {
              'List-Unsubscribe': `<mailto:${process.env.ADMIN_EMAIL}?subject=unsubscribe>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          };

          await transporter.sendMail(mailOptions);
          
          // Update subscriber last email sent
          subscriber.lastEmailSent = new Date();
          subscriber.emailsReceived = (subscriber.emailsReceived || 0) + 1;
          await subscriber.save();
          
          successCount++;
        } catch (error) {
          failureCount++;
          errors.push({ email: subscriber.email, error: error.message });
          logger.error(`Failed to send newsletter to ${subscriber.email}:`, error);
        }
      });

      await Promise.all(emailPromises);

      // Add delay between batches to avoid rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info(`Newsletter sent: ${successCount} success, ${failureCount} failures`);

    res.status(200).json({
      success: true,
      data: {
        totalSent: successCount,
        totalFailed: failureCount,
        totalSubscribers: subscribers.length,
        errors: failureCount > 0 ? errors : undefined,
      },
      message: `Newsletter sent to ${successCount} subscribers`,
    });
  } catch (error) {
    logger.error('Error sending newsletter:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending newsletter',
      error: error.message,
    });
  }
};

/**
 * Get newsletter statistics
 * GET /api/v1/newsletter/stats
 */
const getNewsletterStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.count();
    const activeSubscribers = await Newsletter.count({ 
      where: { status: 'subscribed', isActive: true } 
    });
    const unsubscribed = await Newsletter.count({ where: { status: 'unsubscribed' } });
    const bounced = await Newsletter.count({ where: { status: 'bounced' } });

    // Get average emails received
    const subscribers = await Newsletter.findAll({
      attributes: ['emailsReceived'],
    });
    const avgEmailsReceived = subscribers.length > 0
      ? Math.round(subscribers.reduce((sum, s) => sum + (s.emailsReceived || 0), 0) / subscribers.length)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        activeSubscribers,
        unsubscribed,
        bounced,
        averageEmailsReceived: avgEmailsReceived,
        unsubscribeRate: totalSubscribers > 0 
          ? Math.round((unsubscribed / totalSubscribers) * 100) 
          : 0,
      },
      message: 'Newsletter statistics fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching newsletter stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching newsletter statistics',
      error: error.message,
    });
  }
};

/**
 * Update subscriber preferences
 * PUT /api/v1/newsletter/subscriber/:email/preferences
 */
const updateSubscriberPreferences = async (req, res) => {
  try {
    const { email } = req.params;
    const { preferences } = req.body;

    const subscriber = await Newsletter.findOne({ where: { email } });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
    }

    subscriber.preferences = preferences;
    await subscriber.save();

    logger.info(`Newsletter: Preferences updated for ${email}`);

    res.status(200).json({
      success: true,
      data: subscriber,
      message: 'Subscriber preferences updated successfully',
    });
  } catch (error) {
    logger.error('Error updating subscriber preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscriber preferences',
      error: error.message,
    });
  }
};

/**
 * Helper function: Send welcome email
 */
const sendWelcomeEmail = async (subscriber) => {
  try {
    const mailOptions = {
      from: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      to: subscriber.email,
      subject: 'Welcome to Welltalk Newsletter! 🎉',
      html: `
        <h2>Welcome to Welltalk Newsletter!</h2>
        <p>Hi ${subscriber.firstName || 'Subscriber'},</p>
        <p>Thank you for subscribing to our newsletter. We're excited to share wellness tips, updates, and exclusive content with you.</p>
        <p>You'll receive our newsletter <strong>${subscriber.preferences?.frequency || 'weekly'}</strong>.</p>
        <p>If you ever want to update your preferences or unsubscribe, you can do so anytime by replying to our emails.</p>
        <br>
        <p>Stay Healthy,<br>The Welltalk Team</p>
      `,
      text: `Welcome to Welltalk Newsletter!\n\nThank you for subscribing. You'll receive our newsletter ${subscriber.preferences?.frequency || 'weekly'}.`,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${subscriber.email}`);
  } catch (error) {
    logger.error(`Error sending welcome email to ${subscriber.email}:`, error);
  }
};

module.exports = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
  getSubscriber,
  sendNewsletter,
  getNewsletterStats,
  updateSubscriberPreferences,
};
