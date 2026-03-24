const ContactForm = require('../models/ContactForm');
const { sendContactFormEmail } = require('../utils/emailService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Get all contact forms (admin)
 */
const getAllContactForms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await ContactForm.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
      message: 'Contact forms fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching contact forms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact forms',
      error: error.message,
    });
  }
};

/**
 * Get contact form by ID
 */
const getContactFormById = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await ContactForm.findByPk(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found',
      });
    }

    res.status(200).json({
      success: true,
      data: form,
    });
  } catch (error) {
    logger.error('Error fetching contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact form',
      error: error.message,
    });
  }
};

/**
 * Submit contact/quote form
 */
const submitContactForm = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { firstName, lastName, phone, email, message } = req.body;

    // Create form entry in database
    const form = await ContactForm.create({
      firstName,
      lastName,
      phone,
      email,
      message,
      status: 'pending',
    });

    // Send emails asynchronously (don't wait for completion)
    sendContactFormEmail({
      firstName,
      lastName,
      phone,
      email,
      message,
    })
      .then((success) => {
        if (success) {
          form.update({ emailSent: true });
        }
      })
      .catch((err) => {
        logger.error('Email sending failed after form submission:', err);
      });

    res.status(201).json({
      success: true,
      data: form,
      message: 'Thank you for contacting us! We will get back to you soon.',
    });
  } catch (error) {
    logger.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form',
      error: error.message,
    });
  }
};

/**
 * Update contact form status (admin)
 */
const updateContactFormStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, replied, or closed',
      });
    }

    const form = await ContactForm.findByPk(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found',
      });
    }

    await form.update({ status });

    res.status(200).json({
      success: true,
      data: form,
      message: 'Contact form status updated',
    });
  } catch (error) {
    logger.error('Error updating contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact form',
      error: error.message,
    });
  }
};

/**
 * Delete contact form
 */
const deleteContactForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await ContactForm.findByPk(id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found',
      });
    }

    await form.destroy();

    res.status(200).json({
      success: true,
      message: 'Contact form deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact form',
      error: error.message,
    });
  }
};

module.exports = {
  getAllContactForms,
  getContactFormById,
  submitContactForm,
  updateContactFormStatus,
  deleteContactForm,
};
