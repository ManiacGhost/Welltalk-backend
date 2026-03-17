const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get all events with pagination
const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Event.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['eventDate', 'DESC']],
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
      message: 'Events fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

// Get event by ID or slug
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({
      where: { $or: [{ id }, { slug: id }] },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    logger.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message,
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      slug,
      description,
      eventDate,
      eventTime,
      location,
      organizerName,
      ticketLink,
      status,
    } = req.body;

    const coverImage = req.files?.coverImage
      ? req.files.coverImage[0].path
      : null;
    const galleryImages = req.files?.galleryImages
      ? req.files.galleryImages.map((f) => f.path)
      : [];

    const event = await Event.create({
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      description,
      eventDate,
      eventTime,
      location,
      organizerName,
      ticketLink,
      coverImage,
      galleryImages,
      status: status || 'upcoming',
    });

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (error) {
    logger.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message,
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      eventDate,
      eventTime,
      location,
      organizerName,
      ticketLink,
      status,
    } = req.body;

    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const updateData = {
      title: title || event.title,
      slug: slug || event.slug,
      description: description || event.description,
      eventDate: eventDate || event.eventDate,
      eventTime: eventTime || event.eventTime,
      location: location || event.location,
      organizerName: organizerName || event.organizerName,
      ticketLink: ticketLink || event.ticketLink,
      status: status || event.status,
    };

    if (req.files?.coverImage) {
      updateData.coverImage = req.files.coverImage[0].path;
    }

    if (req.files?.galleryImages) {
      updateData.galleryImages = req.files.galleryImages.map((f) => f.path);
    }

    await event.update(updateData);

    res.status(200).json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    logger.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message,
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await event.destroy();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message,
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
