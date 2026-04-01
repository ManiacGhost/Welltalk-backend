const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

// Validation middleware
const validateSubscription = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('firstName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
];

const validateNewsletter = [
  body('subject')
    .notEmpty()
    .withMessage('Email subject is required')
    .isLength({ min: 5 })
    .withMessage('Subject must be at least 5 characters'),
  body('htmlContent')
    .notEmpty()
    .withMessage('HTML content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
];

/**
 * Public Routes
 */

// Subscribe to newsletter
router.post('/subscribe', validateSubscription, newsletterController.subscribeNewsletter);

// Get subscriber info (public - only their own data)
router.get('/subscriber/:email', newsletterController.getSubscriber);

// Unsubscribe from newsletter
router.put('/unsubscribe/:email', newsletterController.unsubscribeNewsletter);

// Update subscriber preferences
router.put('/subscriber/:email/preferences', newsletterController.updateSubscriberPreferences);

/**
 * Admin Routes (Protected)
 * Note: Add authentication middleware here in production
 * Example: router.get('/subscribers', authenticateAdmin, newsletterController.getSubscribers);
 */

// Get all subscribers (Admin)
router.get('/subscribers', newsletterController.getSubscribers);

// Send newsletter to all subscribers (Admin)
router.post('/send', validateNewsletter, newsletterController.sendNewsletter);

// Get newsletter statistics (Admin)
router.get('/stats', newsletterController.getNewsletterStats);

module.exports = router;
