const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const contactFormController = require('../controllers/contactFormController');

// Validation middleware
const validateContactForm = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone format'),
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
];

// Routes
router.get('/', contactFormController.getAllContactForms);
router.get('/:id', contactFormController.getContactFormById);
router.post('/', validateContactForm, contactFormController.submitContactForm);
router.put('/:id/status', contactFormController.updateContactFormStatus);
router.delete('/:id', contactFormController.deleteContactForm);

module.exports = router;
