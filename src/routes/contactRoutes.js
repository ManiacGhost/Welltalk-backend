const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Validation middleware for contact form
const validateContactForm = [
  // Accept either 'name' or both 'firstName' and 'lastName'
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 0 })
    .withMessage('Last name can be empty'), // Allow empty lastName
  // Custom validation to ensure either name or firstName is provided
  body().custom((value, { req }) => {
    const hasName = req.body.name && req.body.name.trim().length > 0;
    const hasFirstName = req.body.firstName && req.body.firstName.trim().length > 0;
    
    // Either name is provided, or firstName is provided (lastName is optional)
    if (!hasName && !hasFirstName) {
      throw new Error('Either name field or firstName field is required');
    }
    
    return true;
  }),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Phone is optional
      
      // Remove spaces, dashes, parentheses
      const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
      
      // Accept Indian phone numbers:
      // 10-digit numbers (9898989898)
      // With country code (+919898989898)
      // With 0 prefix (09898989898)
      const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/;
      
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Valid phone number is required (e.g., 9898989898, +919898989898, or 09898989898)');
      }
      
      return true;
    }),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 3 })
    .withMessage('Subject must be at least 3 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 5 })
    .withMessage('Message must be at least 5 characters'),
  body('serviceType')
    .optional()
    .isIn(['general', 'support', 'feedback', 'complaint'])
    .withMessage('Invalid service type'),
];

// Routes
router.get('/', contactController.getAllContactForms);
router.get('/:id', contactController.getContactFormById);
router.post('/', validateContactForm, contactController.createContactForm);
router.put('/:id', contactController.updateContactForm);
router.delete('/:id', contactController.deleteContactForm);

module.exports = router;
