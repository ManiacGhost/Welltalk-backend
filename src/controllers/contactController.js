const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const Contact = require('../models/Contact');

// Get all contact forms
const getAllContactForms = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: contactForms } = await Contact.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      success: true,
      data: contactForms,
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

// Get contact form by ID
const getContactFormById = async (req, res) => {
  try {
    const { id } = req.params;

    const contactForm = await Contact.findByPk(id);

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found',
      });
    }

    res.status(200).json({
      success: true,
      data: contactForm,
      message: 'Contact form fetched successfully',
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

// Create new contact form
const createContactForm = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      subject,
      message,
      serviceType,
    } = req.body;

    // Handle name field - combine firstName/lastName if name is not provided
    let fullName = name;
    if (!fullName && (firstName || lastName)) {
      fullName = `${firstName || ''} ${lastName || ''}`.trim();
    }

    // Save to database
    const contactForm = await Contact.create({
      name: fullName,
      firstName: firstName || null,
      lastName: lastName || null,
      email,
      phone: phone || null,
      subject,
      message,
      serviceType: serviceType || 'general',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: contactForm,
      message: 'Contact form submitted successfully',
    });
  } catch (error) {
    logger.error('Error creating contact form:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting contact form',
      error: error.message,
    });
  }
};

// Update contact form status
const updateContactForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const contactForm = await Contact.findByPk(id);

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found',
      });
    }

    await contactForm.update({ status });

    res.status(200).json({
      success: true,
      data: contactForm,
      message: 'Contact form updated successfully',
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

// Delete contact form
const deleteContactForm = async (req, res) => {
  try {
    const { id } = req.params;

    const contactForm = await Contact.findByPk(id);

    if (!contactForm) {
      return res.status(404).json({
        success: false,
        message: 'Contact form not found',
      });
    }

    await contactForm.destroy();

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
  createContactForm,
  updateContactForm,
  deleteContactForm,
};
