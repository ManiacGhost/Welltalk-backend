const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/events/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, GIF, and SVG images are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Validation middleware - only validate required fields, ignore extra fields
const validateEvent = [
  body('title')
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 5 })
    .withMessage('Title must be at least 5 characters'),
  body('description').notEmpty().withMessage('Event description is required'),
  body('eventDate').notEmpty().withMessage('Event date is required').isISO8601().withMessage('Invalid date format'),
  body('eventTime').notEmpty().withMessage('Event time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('organizerName').optional().isString().withMessage('Organizer name must be a string'),
  body('ticketLink').optional().isURL().withMessage('Ticket link must be a valid URL'),
  body('status').optional().isIn(['upcoming', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('slug').optional().isSlug().withMessage('Invalid slug format'),
];

// Routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);
router.post(
  '/',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
  ]),
  validateEvent,
  eventController.createEvent
);
router.put(
  '/:id',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
  ]),
  validateEvent,
  eventController.updateEvent
);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
