const Event = require('../models/Event');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs');

const normalizeUploadPath = (value) => {
  if (!value || typeof value !== 'string') return null;

  const raw = value.trim();
  if (!raw) return null;

  // If frontend sends a full URL, keep only the uploads-relative part.
  const uploadsIdx = raw.toLowerCase().indexOf('/uploads/');
  if (uploadsIdx >= 0) {
    return raw.slice(uploadsIdx + 1); // remove leading slash
  }

  if (raw.toLowerCase().startsWith('uploads/')) {
    return raw;
  }

  return null;
};

const parseGalleryImagesFromBody = (input) => {
  if (!input) return [];

  // Accept JSON string, comma-separated string, or array
  let values = input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];

    try {
      values = JSON.parse(trimmed);
    } catch (e) {
      values = trimmed.includes(',') ? trimmed.split(',') : [trimmed];
    }
  }

  const arr = Array.isArray(values) ? values : [values];
  return arr.map((v) => normalizeUploadPath(v)).filter(Boolean);
};

// NEW: Comprehensive gallery normalization function
const normalizeGalleryImages = (reqBody, reqFiles) => {
  const galleryKeys = [
    'galleryImages',
    'gallery', 
    'images',
    'gallery_images',
    'galleryUrls',
    'gallery_urls',
    'eventImages',
    'event_images',
    'galleryJson'
  ];

  let galleryImages = [];

  // First, check for uploaded files
  if (reqFiles?.galleryImages && Array.isArray(reqFiles.galleryImages)) {
    galleryImages = reqFiles.galleryImages.map((f) => 
      path.join('uploads', 'events', f.filename)
    );
    console.log(`Found ${galleryImages.length} gallery images from files`);
  }

  // Then, check all possible body fields
  for (const key of galleryKeys) {
    if (reqBody[key] !== undefined && reqBody[key] !== null && reqBody[key] !== '') {
      let parsedImages = [];
      
      if (key === 'galleryJson') {
        // Handle JSON string specifically
        try {
          parsedImages = JSON.parse(reqBody[key]);
        } catch (e) {
          console.warn(`Failed to parse galleryJson: ${reqBody[key]}`);
          continue;
        }
      } else if (typeof reqBody[key] === 'string') {
        // Handle comma-separated or single string
        parsedImages = reqBody[key].split(',').map(s => s.trim()).filter(Boolean);
      } else if (Array.isArray(reqBody[key])) {
        // Handle array directly
        parsedImages = reqBody[key];
      }

      // Normalize and add to gallery
      const normalizedImages = parsedImages
        .map(img => normalizeUploadPath(img))
        .filter(Boolean);
      
      galleryImages.push(...normalizedImages);
      console.log(`Found ${normalizedImages.length} images from ${key}`);
    }
  }

  // Remove duplicates while preserving order
  const uniqueGalleryImages = [...new Set(galleryImages)];
  
  console.log(`Final gallery images count: ${uniqueGalleryImages.length}`);
  return uniqueGalleryImages;
};

const fileExists = async (relativePath) => {
  if (!relativePath) return false;
  const absolutePath = path.join(__dirname, '../../', relativePath);
  try {
    await fs.promises.access(absolutePath, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

const resolveImageWithInlineFallback = async (imagePath) => {
  const normalized = normalizeUploadPath(imagePath);
  if (!normalized) return imagePath || null;

  if (await fileExists(normalized)) return normalized;

  const fallbackPath = path.posix.join('uploads', 'inline', path.basename(normalized));
  if (await fileExists(fallbackPath)) return fallbackPath;

  return normalized;
};

const enrichEventImages = async (event) => {
  const plain = typeof event.toJSON === 'function' ? event.toJSON() : event;

  const gallery = Array.isArray(plain.galleryImages) ? plain.galleryImages : [];
  const resolvedGallery = await Promise.all(gallery.map((img) => resolveImageWithInlineFallback(img)));

  return {
    ...plain,
    coverImage: await resolveImageWithInlineFallback(plain.coverImage),
    galleryImages: resolvedGallery,
  };
};

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

    const eventsWithResolvedImages = await Promise.all(rows.map((row) => enrichEventImages(row)));

    res.status(200).json({
      success: true,
      data: eventsWithResolvedImages,
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
    
    // Determine if id is numeric (ID) or string (slug)
    const isNumericId = /^\d+$/.test(id);
    
    let whereClause;
    if (isNumericId) {
      whereClause = { id: parseInt(id) };
    } else {
      whereClause = { slug: id };
    }

    const event = await Event.findOne({
      where: whereClause,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with ${isNumericId ? 'ID' : 'slug'}: ${id}`,
      });
    }

    const eventWithResolvedImages = await enrichEventImages(event);

    res.status(200).json({
      success: true,
      data: eventWithResolvedImages,
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
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    // Extract only the fields we need, ignore extra fields
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

    const bodyCoverImage = normalizeUploadPath(
      req.body.coverImage || req.body.image || req.body.featuredImage || req.body.thumbnail
    );
    const coverImage = req.files?.coverImage
      ? path.join('uploads', 'events', req.files.coverImage[0].filename)
      : bodyCoverImage;

    // Use comprehensive gallery normalization
    const galleryImages = normalizeGalleryImages(req.body, req.files);
    console.log(`Creating event with ${galleryImages.length} gallery images`);

    // Validate slug uniqueness
    const finalSlug = slug || title.toLowerCase().replace(/\s+/g, '-');
    const existingEvent = await Event.findOne({ where: { slug: finalSlug } });
    if (existingEvent) {
      return res.status(409).json({
        success: false,
        message: 'Event with this slug already exists',
        field: 'slug',
        value: finalSlug
      });
    }

    const event = await Event.create({
      title,
      slug: finalSlug,
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
    
    // Handle specific validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Event with this slug already exists',
        field: 'slug'
      });
    }
    
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

    // Use comprehensive gallery normalization
    const galleryImages = normalizeGalleryImages(req.body, req.files);
    console.log(`Updating event with ${galleryImages.length} gallery images`);

    const updateData = {
      title: title || event.title,
      description: description || event.description,
      eventDate: eventDate || event.eventDate,
      eventTime: eventTime || event.eventTime,
      location: location || event.location,
      organizerName: organizerName || event.organizerName,
      ticketLink: ticketLink || event.ticketLink,
      status: status || event.status,
      galleryImages: galleryImages,
    };

    if (req.files?.coverImage) {
      updateData.coverImage = path.join('uploads', 'events', req.files.coverImage[0].filename);
    } else {
      const bodyCoverImage = normalizeUploadPath(
        req.body.coverImage || req.body.image || req.body.featuredImage || req.body.thumbnail
      );
      if (bodyCoverImage) {
        updateData.coverImage = bodyCoverImage;
      }
    }

    // Validate slug uniqueness if slug is being changed
    if (slug && slug !== event.slug) {
      const existingEvent = await Event.findOne({ where: { slug } });
      if (existingEvent) {
        return res.status(409).json({
          success: false,
          message: 'Event with this slug already exists',
          field: 'slug',
          value: slug
        });
      }
      updateData.slug = slug;
    }

    await event.update(updateData);

    res.status(200).json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    logger.error('Error updating event:', error);
    
    // Handle specific validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Event with this slug already exists',
        field: 'slug'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message,
    });
  }
};
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
